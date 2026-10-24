import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

@pytest.fixture(scope="module")
def client():
    # Use lifespan context manager for TestClient
    with TestClient(app) as test_client:
        yield test_client

def test_health_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["catalogue_size"] > 0

def test_subjects_endpoint(client):
    response = client.get("/api/subjects")
    assert response.status_code == 200
    subjects = response.json()
    assert isinstance(subjects, list)
    assert "Computer Science" in subjects
    assert "Mathematics" in subjects

def test_sample_goals_endpoint(client):
    response = client.get("/api/sample-goals")
    assert response.status_code == 200
    goals = response.json()
    assert len(goals) >= 3
    assert any("Machine Learning" in g["title"] for g in goals)

def test_recommend_success(client):
    payload = {
        "query": "Machine learning and linear algebra foundations",
        "target_level": "Introductory",
        "subject_filter": "Computer Science",
        "top_k": 5
    }
    response = client.post("/api/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["matched_count"] > 0
    assert len(data["results"]) <= 5
    first_res = data["results"][0]
    assert "explanation" in first_res
    assert first_res["explanation"]["semantic_match_pct"] >= 0.0
    assert first_res["explanation"]["summary_sentence"] != ""

def test_recommend_empty_query_validation(client):
    payload = {
        "query": "   ",
        "top_k": 5
    }
    response = client.post("/api/recommend", json=payload)
    assert response.status_code == 422

def test_contrastive_explanation(client):
    payload = {
        "target_resource_id": "RES-CS-001",
        "alternative_resource_id": "RES-CS-005",
        "query": "Beginner machine learning linear algebra",
        "target_level": "Introductory"
    }
    response = client.post("/api/explain/contrastive", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "factors" in data
    assert len(data["factors"]) > 0
    assert data["winner"] != ""
    assert "narrative_explanation" in data

def test_evaluate_endpoint(client):
    response = client.get("/api/evaluate")
    assert response.status_code == 200
    data = response.json()
    assert data["total_test_queries"] >= 3
    assert "hybrid_aggregate" in data
    assert "baseline_aggregate" in data
    assert "ablation_study" in data
    assert data["hybrid_aggregate"]["precision_at_5"] >= 0.0

def test_failures_endpoint(client):
    response = client.get("/api/evaluation/failures")
    assert response.status_code == 200
    failures = response.json()
    assert len(failures) >= 3
    assert any("Polysemy" in f["failure_type"] for f in failures)

def test_frontend_static_serving(client):
    response = client.get("/")
    assert response.status_code == 200
    assert "ScholarPath AI" in response.text

def test_all_three_presets_end_to_end(client):
    goals_resp = client.get("/api/sample-goals")
    assert goals_resp.status_code == 200
    goals = goals_resp.json()
    assert len(goals) == 3

    for g in goals:
        rec_payload = {
            "query": g["query"],
            "target_level": g["target_level"],
            "subject_filter": g["subject_filter"],
            "known_prerequisites": g["known_prerequisites"],
            "top_k": 5
        }
        res = client.post("/api/recommend", json=rec_payload)
        assert res.status_code == 200, f"Preset {g['id']} failed: {res.text}"
        data = res.json()
        assert len(data["results"]) >= 3, f"Preset {g['id']} returned fewer than 3 results"
        
        # Verify result attributes
        for item in data["results"]:
            assert item["resource"]["id"]
            assert item["resource"]["title"]
            assert item["explanation"]["summary_sentence"]
            assert item["explanation"]["level_fit_score"] >= 0.0

