import re
import math
from typing import List, Dict, Tuple, Set

DEFAULT_STOPWORDS: Set[str] = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", 
    "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", 
    "by", "could", "did", "do", "does", "doing", "down", "during", "each", "few", "for", 
    "from", "further", "had", "has", "have", "having", "he", "her", "here", "hers", "herself", 
    "him", "himself", "his", "how", "i", "if", "in", "into", "is", "it", "its", "itself", 
    "just", "me", "more", "most", "my", "myself", "no", "nor", "not", "of", "off", "on", 
    "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", 
    "same", "she", "should", "so", "some", "such", "than", "that", "the", "their", "theirs", 
    "them", "themselves", "then", "there", "these", "they", "this", "those", "through", "to", 
    "too", "under", "until", "up", "very", "was", "we", "were", "what", "when", "where", 
    "which", "while", "who", "whom", "why", "with", "would", "you", "your", "yours", 
    "yourself", "yourselves", "want", "study", "learn", "need", "looking", "book", "resources"
}

def tokenize(text: str) -> List[str]:
    """Tokenize and filter standard English stopwords."""
    if not text:
        return []
    words = re.findall(r'[a-zA-Z0-9_\-\+]+', text.lower())
    return [w for w in words if len(w) > 1 and w not in DEFAULT_STOPWORDS]

class BM25Okapi:
    """
    Production-grade BM25Okapi algorithm for academic text retrieval.
    Includes token-level attribution for transparent explainability.
    """
    def __init__(self, corpus: List[List[str]], k1: float = 1.5, b: float = 0.75):
        self.k1 = k1
        self.b = b
        self.corpus_size = len(corpus)
        self.doc_lens = [len(doc) for doc in corpus]
        self.avg_doc_len = sum(self.doc_lens) / max(self.corpus_size, 1)
        
        # Document frequencies (DF)
        self.df: Dict[str, int] = {}
        # Term frequencies per doc
        self.doc_tfs: List[Dict[str, int]] = []
        
        for doc in corpus:
            tf: Dict[str, int] = {}
            for token in doc:
                tf[token] = tf.get(token, 0) + 1
            self.doc_tfs.append(tf)
            for token in tf.keys():
                self.df[token] = self.df.get(token, 0) + 1
                
        # Inverse Document Frequency (IDF) with BM25 smoothing
        self.idf: Dict[str, float] = {}
        for term, freq in self.df.items():
            # Standard Lucene/BM25 IDF: ln(1 + (N - n + 0.5) / (n + 0.5))
            self.idf[term] = math.log(1.0 + (self.corpus_size - freq + 0.5) / (freq + 0.5))

    def get_scores(self, query_tokens: List[str]) -> List[float]:
        """Compute BM25 scores for all documents in the corpus."""
        scores = [0.0] * self.corpus_size
        if not query_tokens or self.corpus_size == 0:
            return scores
            
        for term in query_tokens:
            if term not in self.idf:
                continue
            idf_val = self.idf[term]
            for idx in range(self.corpus_size):
                tf = self.doc_tfs[idx].get(term, 0)
                if tf == 0:
                    continue
                doc_len = self.doc_lens[idx]
                numerator = tf * (self.k1 + 1.0)
                denominator = tf + self.k1 * (1.0 - self.b + self.b * (doc_len / max(self.avg_doc_len, 1e-6)))
                scores[idx] += idf_val * (numerator / denominator)
                
        return scores

    def get_token_attributions(self, query_tokens: List[str], doc_idx: int) -> List[Tuple[str, float]]:
        """
        Explainability helper: return (term, score_contribution) for matched terms in a document.
        """
        if doc_idx < 0 or doc_idx >= self.corpus_size:
            return []
        
        attributions: List[Tuple[str, float]] = []
        doc_len = self.doc_lens[doc_idx]
        tfs = self.doc_tfs[doc_idx]
        
        for term in query_tokens:
            if term in tfs and term in self.idf:
                tf = tfs[term]
                idf_val = self.idf[term]
                numerator = tf * (self.k1 + 1.0)
                denominator = tf + self.k1 * (1.0 - self.b + self.b * (doc_len / max(self.avg_doc_len, 1e-6)))
                contrib = idf_val * (numerator / denominator)
                attributions.append((term, round(contrib, 4)))
                
        return sorted(attributions, key=lambda x: x[1], reverse=True)
