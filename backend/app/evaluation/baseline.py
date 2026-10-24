from typing import List, Dict, Any
from backend.app.models.resource import AcademicResource
from backend.app.retrieval.bm25 import BM25Okapi, tokenize

class LexicalBaselineRecommender:
    """
    Standard Lexical Baseline (BM25 only).
    Serves as the control baseline for information retrieval benchmarking:
    - Zero semantic embeddings
    - Zero cognitive difficulty penalization
    - Zero active feedback
    - Zero intent/prerequisite separation
    """
    def __init__(self, catalogue: List[AcademicResource]):
        self.catalogue = catalogue
        self.tokenized_corpus = [
            tokenize(f"{res.title} {' '.join(res.keywords)} {res.subject} {' '.join(res.subfields)} {res.abstract}")
            for res in catalogue
        ]
        self.bm25 = BM25Okapi(self.tokenized_corpus)

    def retrieve_top_k(self, query: str, top_k: int = 5) -> List[AcademicResource]:
        query_tokens = tokenize(query)
        scores = self.bm25.get_scores(query_tokens)
        
        indexed_scores = list(enumerate(scores))
        indexed_scores.sort(key=lambda x: x[1], reverse=True)
        
        top_resources = [self.catalogue[idx] for idx, score in indexed_scores[:top_k]]
        return top_resources
