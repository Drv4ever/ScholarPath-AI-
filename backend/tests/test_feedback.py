import pytest
import numpy as np
from backend.app.models.request import SessionFeedbackItem
from backend.app.feedback.session_feedback import SessionFeedbackManager
from backend.app.retrieval.semantic import SemanticRetriever

def test_extract_feedback_sets():
    items = [
        SessionFeedbackItem(resource_id="RES-01", feedback_type="relevant"),
        SessionFeedbackItem(resource_id="RES-02", feedback_type="irrelevant"),
        SessionFeedbackItem(resource_id="RES-01", feedback_type="irrelevant"), # Flip to irrelevant
    ]
    rel, irrel = SessionFeedbackManager.extract_feedback_sets(items)
    assert "RES-01" in irrel
    assert "RES-01" not in rel
    assert "RES-02" in irrel

def test_feedback_score_adjustment():
    rel = {"RES-01"}
    irrel = {"RES-02"}
    
    boost = SessionFeedbackManager.compute_feedback_adjustment("RES-01", rel, irrel)
    penalty = SessionFeedbackManager.compute_feedback_adjustment("RES-02", rel, irrel)
    neutral = SessionFeedbackManager.compute_feedback_adjustment("RES-03", rel, irrel)
    
    assert boost > 0.0
    assert penalty < 0.0
    assert neutral == 0.0

def test_rocchio_vector_steering():
    retriever = SemanticRetriever(use_transformers=False)
    # 3 simple documents
    docs = [
        "Machine learning neural networks deep learning",
        "Renewable solar energy photovoltaic panels",
        "Linear algebra vector spaces matrices"
    ]
    retriever.index_corpus(docs)
    
    base_q = retriever.encode_query("machine learning")
    initial_sims = retriever.compute_similarity(base_q)
    
    # Mark document 1 (Solar energy) as relevant to steer the session vector
    steered_q = retriever.apply_rocchio_steering(
        base_query_vec=base_q,
        relevant_indices=[1],
        irrelevant_indices=[0]
    )
    new_sims = retriever.compute_similarity(steered_q)
    
    # After steering towards solar energy (idx 1) and away from ML (idx 0),
    # similarity to solar energy (idx 1) should increase
    assert new_sims[1] > initial_sims[1]
