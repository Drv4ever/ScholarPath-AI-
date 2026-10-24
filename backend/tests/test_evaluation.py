import pytest
from backend.app.evaluation.benchmark import compute_metrics, average_metrics, IRMetrics

def test_compute_metrics_perfect_ranking():
    ranked_ids = ["RES-01", "RES-02", "RES-03", "RES-04", "RES-05"]
    ground_truth = {
        "RES-01": 3,
        "RES-02": 3,
        "RES-03": 2,
        "RES-04": 1,
        "RES-05": 1,
        "RES-06": 0
    }
    metrics = compute_metrics(ranked_ids, ground_truth)
    assert metrics.precision_at_3 == 1.0
    assert metrics.precision_at_5 == 1.0
    assert metrics.recall_at_5 == 1.0
    assert metrics.mrr == 1.0
    assert metrics.ndcg_at_5 == 1.0

def test_compute_metrics_poor_ranking():
    ranked_ids = ["IRREL-1", "IRREL-2", "IRREL-3", "IRREL-4", "RES-01"]
    ground_truth = {
        "RES-01": 3,
        "RES-02": 2
    }
    metrics = compute_metrics(ranked_ids, ground_truth)
    # Only 1 relevant item at rank 5
    assert metrics.precision_at_3 == 0.0
    assert metrics.precision_at_5 == 0.2
    assert metrics.mrr == 0.2  # 1 / 5
    assert metrics.ndcg_at_5 < 0.5

def test_average_metrics():
    m1 = IRMetrics(precision_at_3=1.0, precision_at_5=0.8, recall_at_5=0.8, ndcg_at_5=0.9, mrr=1.0)
    m2 = IRMetrics(precision_at_3=0.0, precision_at_5=0.2, recall_at_5=0.2, ndcg_at_5=0.3, mrr=0.2)
    avg = average_metrics([m1, m2])
    assert avg.precision_at_3 == 0.5
    assert avg.precision_at_5 == 0.5
    assert avg.mrr == 0.6
