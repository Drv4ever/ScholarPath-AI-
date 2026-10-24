import logging
import numpy as np
from typing import List, Optional, Tuple, Dict
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics.pairwise import cosine_similarity
from backend.app.config import settings

logger = logging.getLogger(__name__)

class SemanticRetriever:
    """
    Semantic Retrieval Engine for Academic Library Resources.
    Supports SentenceTransformer embeddings with an immediate, deterministic
    TF-IDF + LSA (Latent Semantic Analysis) fallback.
    """
    def __init__(self, use_transformers: bool = True):
        self.use_transformers = use_transformers
        self.model = None
        self.doc_embeddings: Optional[np.ndarray] = None
        self.tfidf_vectorizer: Optional[TfidfVectorizer] = None
        self.lsa_model: Optional[TruncatedSVD] = None
        self.backend_mode: str = "Uninitialized"
        self._init_engine()

    def _init_engine(self):
        if self.use_transformers and settings.USE_TRANSFORMERS:
            try:
                from sentence_transformers import SentenceTransformer
                logger.info(f"Loading SentenceTransformer: {settings.EMBEDDING_MODEL_NAME}")
                self.model = SentenceTransformer(settings.EMBEDDING_MODEL_NAME)
                self.backend_mode = f"SentenceTransformer ({settings.EMBEDDING_MODEL_NAME})"
                return
            except Exception as e:
                logger.warning(f"Could not load SentenceTransformer ({e}). Falling back to deterministic TF-IDF + LSA.")
        
        self.backend_mode = "Deterministic TF-IDF + LSA"

    def index_corpus(self, documents: List[str]):
        """Index catalogue text documents (titles + keywords + abstracts)."""
        if not documents:
            self.doc_embeddings = np.empty((0, 1))
            return

        if self.model is not None:
            try:
                raw_embeds = self.model.encode(documents, show_progress_bar=False, normalize_embeddings=True)
                self.doc_embeddings = np.array(raw_embeds, dtype=np.float32)
                self.backend_mode = f"SentenceTransformer ({settings.EMBEDDING_MODEL_NAME})"
                return
            except Exception as e:
                logger.error(f"Error encoding with SentenceTransformer: {e}. Falling back to LSA.")
                self.model = None
                self.backend_mode = "Deterministic TF-IDF + LSA"

        # Deterministic LSA / TF-IDF Vectorization
        try:
            self.tfidf_vectorizer = TfidfVectorizer(
                ngram_range=(1, 2),
                max_features=2500,
                sublinear_tf=True
            )
            tfidf_matrix = self.tfidf_vectorizer.fit_transform(documents)
            n_components = min(64, tfidf_matrix.shape[1] - 1) if tfidf_matrix.shape[1] > 2 else 2
            
            if n_components >= 2 and tfidf_matrix.shape[0] > n_components:
                self.lsa_model = TruncatedSVD(n_components=n_components, random_state=42)
                lsa_embeds = self.lsa_model.fit_transform(tfidf_matrix)
                norms = np.linalg.norm(lsa_embeds, axis=1, keepdims=True)
                norms[norms == 0] = 1.0
                self.doc_embeddings = (lsa_embeds / norms).astype(np.float32)
            else:
                dense_tfidf = tfidf_matrix.toarray()
                norms = np.linalg.norm(dense_tfidf, axis=1, keepdims=True)
                norms[norms == 0] = 1.0
                self.doc_embeddings = (dense_tfidf / norms).astype(np.float32)
        except Exception as e:
            logger.warning(f"TF-IDF indexing fallback triggered: {e}")
            self.doc_embeddings = np.zeros((len(documents), 64), dtype=np.float32)

    def encode_query(self, query: str) -> np.ndarray:
        """Encode a single query string into a normalized 1D embedding vector."""
        if not query or query.strip() == "":
            dim = self.doc_embeddings.shape[1] if self.doc_embeddings is not None and len(self.doc_embeddings) > 0 else 64
            return np.zeros(dim, dtype=np.float32)

        if self.model is not None:
            vec = self.model.encode([query], show_progress_bar=False, normalize_embeddings=True)[0]
            return np.array(vec, dtype=np.float32)

        if self.tfidf_vectorizer is not None:
            vec_sparse = self.tfidf_vectorizer.transform([query])
            if self.lsa_model is not None:
                vec_dense = self.lsa_model.transform(vec_sparse)[0]
            else:
                vec_dense = vec_sparse.toarray()[0]
            norm = np.linalg.norm(vec_dense)
            if norm > 0:
                vec_dense = vec_dense / norm
            return np.array(vec_dense, dtype=np.float32)

        return np.zeros(64, dtype=np.float32)

    def compute_similarity(self, query_vec: np.ndarray) -> np.ndarray:
        """Compute cosine similarity between query vector and all indexed documents."""
        if self.doc_embeddings is None or len(self.doc_embeddings) == 0:
            return np.array([])
        
        norm_q = np.linalg.norm(query_vec)
        if norm_q == 0:
            return np.zeros(len(self.doc_embeddings), dtype=np.float32)
        
        unit_q = query_vec / norm_q
        # Dot product with normalized document embeddings gives cosine similarity
        sims = np.dot(self.doc_embeddings, unit_q)
        # Clip to [0.0, 1.0] for probability-like interpretation
        return np.clip((sims + 1.0) / 2.0, 0.0, 1.0)

    def apply_rocchio_steering(
        self,
        base_query_vec: np.ndarray,
        relevant_indices: List[int],
        irrelevant_indices: List[int],
        alpha: float = 1.0,
        beta: float = 0.75,
        gamma: float = 0.35
    ) -> np.ndarray:
        """
        In-session active feedback vector update:
        Q_new = alpha * Q_base + beta * mean(E_relevant) - gamma * mean(E_irrelevant)
        """
        steered_vec = alpha * base_query_vec.copy()
        
        if relevant_indices and self.doc_embeddings is not None:
            rel_vecs = self.doc_embeddings[relevant_indices]
            rel_mean = np.mean(rel_vecs, axis=0)
            steered_vec += beta * rel_mean
            
        if irrelevant_indices and self.doc_embeddings is not None:
            irrel_vecs = self.doc_embeddings[irrelevant_indices]
            irrel_mean = np.mean(irrel_vecs, axis=0)
            steered_vec -= gamma * irrel_mean
            
        norm = np.linalg.norm(steered_vec)
        if norm > 0:
            steered_vec = steered_vec / norm
        return steered_vec
