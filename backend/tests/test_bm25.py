import pytest
from backend.app.retrieval.bm25 import BM25Okapi, tokenize

def test_tokenize():
    text = "Machine Learning for Linear Algebra 101!"
    tokens = tokenize(text)
    assert "machine" in tokens
    assert "learning" in tokens
    assert "linear" in tokens
    assert "algebra" in tokens
    # Stopwords like 'for' should be removed
    assert "for" not in tokens

def test_bm25_scoring():
    corpus = [
        tokenize("Deep learning neural networks and computer vision"),
        tokenize("Renewable wind energy and power battery storage systems"),
        tokenize("Linear algebra vector spaces and eigenvalues for data science")
    ]
    bm25 = BM25Okapi(corpus)
    query_tokens = tokenize("neural networks vision")
    scores = bm25.get_scores(query_tokens)
    
    assert len(scores) == 3
    # First document should have highest score
    assert scores[0] > scores[1]
    assert scores[0] > scores[2]

def test_bm25_empty_query():
    corpus = [tokenize("Artificial intelligence and robotics")]
    bm25 = BM25Okapi(corpus)
    scores = bm25.get_scores([])
    assert scores == [0.0]

def test_bm25_token_attribution():
    corpus = [tokenize("Quantum computing algorithms and superposition")]
    bm25 = BM25Okapi(corpus)
    query_tokens = tokenize("quantum superposition")
    attribs = bm25.get_token_attributions(query_tokens, 0)
    
    assert len(attribs) == 2
    matched_words = [t[0] for t in attribs]
    assert "quantum" in matched_words
    assert "superposition" in matched_words
