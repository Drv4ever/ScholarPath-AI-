import pytest
from backend.app.models.resource import AcademicResource, DifficultyLevel, ResourceType
from backend.app.models.request import RecommendRequest
from backend.app.retrieval.semantic import SemanticRetriever
from backend.app.ranking.ranker import HybridRecommender

@pytest.fixture(scope="module")
def recommender():
    import json
    from pathlib import Path
    cat_path = Path(__file__).parent.parent / "app" / "data" / "catalogue.json"
    with open(cat_path, "r", encoding="utf-8") as f:
        items = [AcademicResource(**x) for x in json.load(f)]
    retriever = SemanticRetriever(use_transformers=False)
    return HybridRecommender(items, retriever)

# 1. Known Relevant Queries
def test_known_relevant_queries(recommender):
    # Test CLRS for algorithms
    req1 = RecommendRequest(
        query="dynamic programming divide and conquer shortest paths graph algorithms",
        top_k=5
    )
    res1 = recommender.recommend(req1)
    top_ids = [r.resource.id for r in res1.results]
    assert "RES-CS-008" in top_ids, f"Expected CLRS (RES-CS-008) in top results, got {top_ids}"

    # Test Convex Optimization by Boyd
    req2 = RecommendRequest(
        query="convex optimization duality lagrangian kkt conditions",
        top_k=5
    )
    res2 = recommender.recommend(req2)
    top_ids2 = [r.resource.id for r in res2.results]
    assert "RES-MATH-003" in top_ids2, f"Expected Boyd (RES-MATH-003) in top results, got {top_ids2}"

    # Test Qualitative Methods by Miles & Huberman
    req3 = RecommendRequest(
        query="qualitative data analysis thematic coding matrix displays",
        top_k=5
    )
    res3 = recommender.recommend(req3)
    top_ids3 = [r.resource.id for r in res3.results]
    assert "RES-SOC-002" in top_ids3, f"Expected Qualitative Methods (RES-SOC-002) in top results, got {top_ids3}"

# 2. Synonyms and Paraphrased Goals
def test_synonyms_and_paraphrased_goals(recommender):
    req_syn1 = RecommendRequest(
        query="deep neural networks backpropagation training multilayer perceptrons",
        top_k=5
    )
    req_syn2 = RecommendRequest(
        query="artificial neural nets gradient descent optimization feedforward architectures",
        top_k=5
    )
    res1 = recommender.recommend(req_syn1)
    res2 = recommender.recommend(req_syn2)
    
    titles1 = {r.resource.title for r in res1.results}
    titles2 = {r.resource.title for r in res2.results}
    
    # Check that there is high semantic convergence (>50% top-5 overlap)
    common = titles1.intersection(titles2)
    assert len(common) >= 2, f"Expected semantic convergence between paraphrased queries, got common: {common}"

# 3. Beginner Queries Against Advanced Resources
def test_beginner_query_against_advanced_resources(recommender):
    req = RecommendRequest(
        query="machine learning foundations and linear algebra without heavy proofs",
        target_level=DifficultyLevel.INTRODUCTORY,
        enable_asymmetric_penalty=True,
        top_k=10
    )
    res = recommender.recommend(req)
    intro_books = [r for r in res.results if r.resource.level == DifficultyLevel.INTRODUCTORY]
    research_books = [r for r in res.results if r.resource.level in (DifficultyLevel.RESEARCH, DifficultyLevel.ADVANCED)]
    
    assert len(intro_books) > 0
    # Top 2 should be Introductory due to asymmetric penalty on advanced books
    assert res.results[0].resource.level == DifficultyLevel.INTRODUCTORY
    
    # Advanced books should show penalty applied
    for r in research_books:
        assert r.raw_scores["level_penalty"] > 0.0
        assert "Cognitive load warning" in r.explanation.level_explanation

# 4. Advanced Queries Against Introductory Resources
def test_advanced_query_against_introductory_resources(recommender):
    req = RecommendRequest(
        query="rigorous abstract algebra groups rings fields and galois theory",
        target_level=DifficultyLevel.ADVANCED,
        enable_asymmetric_penalty=True,
        top_k=5
    )
    res = recommender.recommend(req)
    assert len(res.results) > 0
    top_result = res.results[0]
    # Should recommend advanced textbook (Dummit & Foote)
    assert top_result.resource.level in (DifficultyLevel.ADVANCED, DifficultyLevel.RESEARCH)
    assert top_result.raw_scores["level_penalty"] == 0.0

# 5. Missing Prerequisites
def test_missing_prerequisites(recommender):
    req_no_prereq = RecommendRequest(
        query="convex optimization theory and interior point methods",
        target_level=DifficultyLevel.ADVANCED,
        enable_intent_separation=True,
        known_prerequisites=None,
        top_k=5
    )
    res = recommender.recommend(req_no_prereq)
    assert len(res.results) > 0
    # Resources with prerequisites should document the required background
    first_with_prereq = next(r for r in res.results if r.resource.prerequisites)
    assert "Requires prior familiarity" in first_with_prereq.explanation.prerequisite_satisfaction

# 6. Ambiguous Queries: "transformers"
def test_ambiguous_queries_transformers(recommender):
    # Unfiltered: should contain both electrical power transformers and AI attention models
    req_unfiltered = RecommendRequest(query="transformers", top_k=10)
    res_unfiltered = recommender.recommend(req_unfiltered)
    subjects = {r.resource.subject for r in res_unfiltered.results}
    
    has_ee = any("electrical" in s.lower() or "electronics" in s.lower() for s in subjects)
    has_ai = any("computer" in s.lower() or "artificial" in s.lower() for s in subjects)
    assert has_ee and has_ai, f"Unfiltered 'transformers' query should return both EE and AI resources, got {subjects}"
    
    # Filtered by Electrical Engineering
    req_ee = RecommendRequest(query="transformers", subject_filter="Electrical Engineering", top_k=5)
    res_ee = recommender.recommend(req_ee)
    for r in res_ee.results:
        assert r.resource.subject.lower() == "electrical engineering"

    # Filtered by Artificial Intelligence
    req_ai = RecommendRequest(query="transformers", subject_filter="Artificial Intelligence", top_k=5)
    res_ai = recommender.recommend(req_ai)
    for r in res_ai.results:
        is_ai = (
            "artificial intelligence" in r.resource.subject.lower() or
            any("artificial intelligence" in sf.lower() for sf in r.resource.subfields) or
            "machine learning" in r.resource.subject.lower() or
            "deep learning" in " ".join(r.resource.subfields).lower()
        )
        assert is_ai, f"Resource {r.resource.title} should be an AI/ML resource, got subject={r.resource.subject}, subfields={r.resource.subfields}"
        assert r.resource.subject.lower() != "electrical engineering"

# 7. Empty Catalogues and Missing Metadata
def test_empty_catalogues_and_missing_metadata():
    retriever = SemanticRetriever(use_transformers=False)
    # Empty catalogue
    empty_recommender = HybridRecommender([], retriever)
    res_empty = empty_recommender.recommend(RecommendRequest(query="algorithms", top_k=5))
    assert res_empty.total_catalogue_size == 0
    assert len(res_empty.results) == 0

    # Missing metadata item
    sparse_resource = AcademicResource(
        id="SPARSE-001",
        title="Sparse Catalogue Item Without Full Fields",
        authors=[],
        subject="Computer Science",
        subfields=[],
        keywords=[],
        level=DifficultyLevel.INTERMEDIATE,
        abstract="",
        prerequisites=[]
    )
    sparse_recommender = HybridRecommender([sparse_resource], retriever)
    res_sparse = sparse_recommender.recommend(RecommendRequest(query="sparse item", top_k=5))
    assert len(res_sparse.results) == 1
    assert res_sparse.results[0].resource.id == "SPARSE-001"

# 8. Duplicate Resources
def test_duplicate_resources():
    retriever = SemanticRetriever(use_transformers=False)
    item1 = AcademicResource(
        id="DUP-001",
        title="Operating Systems Principles",
        authors=["Author A"],
        subject="Computer Science",
        level=DifficultyLevel.INTRODUCTORY,
        abstract="Intro to OS"
    )
    item2 = AcademicResource(
        id="DUP-001",  # Identical ID
        title="Operating Systems Principles Duplicate",
        authors=["Author A"],
        subject="Computer Science",
        level=DifficultyLevel.INTRODUCTORY,
        abstract="Intro to OS duplicate"
    )
    # Recommender must deduplicate gracefully
    rec = HybridRecommender([item1, item2], retriever)
    assert len(rec.catalogue) == 1
    assert len(rec.id_to_index) == 1

# 9. Cold-Start Requests
def test_cold_start_requests(recommender):
    # Completely cold-start: no session feedback, no prior history
    cold_req = RecommendRequest(
        query="robot kinematics and motion planning algorithms",
        target_level=DifficultyLevel.INTERMEDIATE,
        session_feedback=[]
    )
    res = recommender.recommend(cold_req)
    assert len(res.results) > 0
    top = res.results[0]
    assert top.rank == 1
    assert top.final_score > 0
    assert top.explanation.summary_sentence != ""
    assert top.explanation.semantic_match_pct >= 0.0

# 10. Deterministic Ranking
def test_deterministic_ranking(recommender):
    req = RecommendRequest(
        query="time series forecasting with arima and exponential smoothing",
        target_level=DifficultyLevel.INTERMEDIATE,
        top_k=5
    )
    res1 = recommender.recommend(req)
    res2 = recommender.recommend(req)
    
    ids1 = [r.resource.id for r in res1.results]
    ids2 = [r.resource.id for r in res2.results]
    scores1 = [r.final_score for r in res1.results]
    scores2 = [r.final_score for r in res2.results]
    
    assert ids1 == ids2, "Recommendation ordering must be strictly deterministic"
    assert scores1 == scores2, "Recommendation scores must be strictly deterministic"

# 11. Model-Unavailable Fallback
def test_model_unavailable_fallback():
    import json
    from pathlib import Path
    cat_path = Path(__file__).parent.parent / "app" / "data" / "catalogue.json"
    with open(cat_path, "r", encoding="utf-8") as f:
        items = [AcademicResource(**x) for x in json.load(f)]
        
    fallback_retriever = SemanticRetriever(use_transformers=False)
    # Ensure fallback mode is active
    assert "TF-IDF" in fallback_retriever.backend_mode or "Deterministic" in fallback_retriever.backend_mode
    
    rec = HybridRecommender(items, fallback_retriever)
    req = RecommendRequest(query="deep neural networks", top_k=5)
    res = rec.recommend(req)
    assert len(res.results) > 0
    assert res.results[0].final_score > 0
