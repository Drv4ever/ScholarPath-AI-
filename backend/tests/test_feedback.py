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

def test_feedback_reset_restores_original_ranking():
    """Verify that clearing session feedback restores identical original rankings (stateless privacy)."""
    from backend.app.ranking.ranker import HybridRecommender
    from backend.app.models.resource import AcademicResource, DifficultyLevel
    from backend.app.models.request import RecommendRequest
    import json
    from pathlib import Path

    cat_path = Path(__file__).parent.parent / "app" / "data" / "catalogue.json"
    with open(cat_path, "r", encoding="utf-8") as f:
        items = [AcademicResource(**x) for x in json.load(f)]
    retriever = SemanticRetriever(use_transformers=False)
    rec = HybridRecommender(items, retriever)

    # 1. Cold start baseline
    cold_req = RecommendRequest(query="deep neural networks", target_level=DifficultyLevel.INTERMEDIATE, top_k=5)
    cold_resp = rec.recommend(cold_req)
    cold_ids = [r.resource.id for r in cold_resp.results]
    cold_scores = [r.final_score for r in cold_resp.results]

    # 2. Add feedback
    feed_req = RecommendRequest(
        query="deep neural networks",
        target_level=DifficultyLevel.INTERMEDIATE,
        top_k=5,
        session_feedback=[
            SessionFeedbackItem(resource_id=cold_ids[3], feedback_type="relevant"),
            SessionFeedbackItem(resource_id=cold_ids[0], feedback_type="irrelevant")
        ]
    )
    feed_resp = rec.recommend(feed_req)
    feed_ids = [r.resource.id for r in feed_resp.results]
    # Ranking should have shifted
    assert feed_ids != cold_ids

    # 3. Clear feedback (reset)
    reset_req = RecommendRequest(query="deep neural networks", target_level=DifficultyLevel.INTERMEDIATE, top_k=5, session_feedback=[])
    reset_resp = rec.recommend(reset_req)
    reset_ids = [r.resource.id for r in reset_resp.results]
    reset_scores = [r.final_score for r in reset_resp.results]

    assert reset_ids == cold_ids
    assert reset_scores == cold_scores
