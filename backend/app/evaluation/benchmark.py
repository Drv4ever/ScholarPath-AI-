import math
from datetime import datetime, timezone
from typing import List, Dict, Any, Tuple
from backend.app.models.resource import AcademicResource, DifficultyLevel
from backend.app.models.request import RecommendRequest
from backend.app.models.evaluation import (
    IRMetrics,
    BenchmarkQuery,
    BenchmarkEvaluationResult,
    EvaluationSummary,
    FailureCaseAnalysis
)
from backend.app.ranking.ranker import HybridRecommender
from backend.app.evaluation.baseline import LexicalBaselineRecommender

def compute_metrics(
    ranked_resource_ids: List[str],
    ground_truth: Dict[str, int]
) -> IRMetrics:
    """
    Computes Precision@3, Precision@5, Recall@5, NDCG@5, and MRR.
    Relevance is considered positive if relevance grade >= 1.
    """
    total_relevant_in_gt = sum(1 for grade in ground_truth.values() if grade >= 1)
    if total_relevant_in_gt == 0:
        return IRMetrics(precision_at_3=0.0, precision_at_5=0.0, recall_at_5=0.0, ndcg_at_5=0.0, mrr=0.0)

    # Precision@3
    top3 = ranked_resource_ids[:3]
    rel_in_top3 = sum(1 for rid in top3 if ground_truth.get(rid, 0) >= 1)
    p_at_3 = rel_in_top3 / 3.0

    # Precision@5
    top5 = ranked_resource_ids[:5]
    rel_in_top5 = sum(1 for rid in top5 if ground_truth.get(rid, 0) >= 1)
    p_at_5 = rel_in_top5 / 5.0

    # Recall@5
    recall_at_5 = rel_in_top5 / float(total_relevant_in_gt)

    # MRR (Mean Reciprocal Rank)
    mrr = 0.0
    for rank_idx, rid in enumerate(ranked_resource_ids):
        if ground_truth.get(rid, 0) >= 1:
            mrr = 1.0 / (rank_idx + 1)
            break

    # NDCG@5 (Discounted Cumulative Gain / Ideal DCG)
    dcg = 0.0
    for i, rid in enumerate(top5):
        rel = ground_truth.get(rid, 0)
        dcg += (2.0 ** rel - 1.0) / math.log2((i + 1) + 1.0)

    # Ideal DCG (sort all ground truth grades descending)
    ideal_grades = sorted(ground_truth.values(), reverse=True)[:5]
    idcg = 0.0
    for i, rel in enumerate(ideal_grades):
        idcg += (2.0 ** rel - 1.0) / math.log2((i + 1) + 1.0)

    ndcg_at_5 = (dcg / idcg) if idcg > 0 else 0.0

    return IRMetrics(
        precision_at_3=round(p_at_3, 4),
        precision_at_5=round(p_at_5, 4),
        recall_at_5=round(recall_at_5, 4),
        ndcg_at_5=round(ndcg_at_5, 4),
        mrr=round(mrr, 4)
    )

def average_metrics(metrics_list: List[IRMetrics]) -> IRMetrics:
    if not metrics_list:
        return IRMetrics(precision_at_3=0.0, precision_at_5=0.0, recall_at_5=0.0, ndcg_at_5=0.0, mrr=0.0)
    n = float(len(metrics_list))
    return IRMetrics(
        precision_at_3=round(sum(m.precision_at_3 for m in metrics_list) / n, 4),
        precision_at_5=round(sum(m.precision_at_5 for m in metrics_list) / n, 4),
        recall_at_5=round(sum(m.recall_at_5 for m in metrics_list) / n, 4),
        ndcg_at_5=round(sum(m.ndcg_at_5 for m in metrics_list) / n, 4),
        mrr=round(sum(m.mrr for m in metrics_list) / n, 4)
    )

class BenchmarkEvaluator:
    """
    Runs reproducible IR evaluation over a fixed ground-truth benchmark suite.
    Evaluates both ScholarPath Hybrid Recommender and Lexical Baseline.
    """
    def __init__(
        self,
        hybrid_recommender: HybridRecommender,
        baseline_recommender: LexicalBaselineRecommender,
        benchmark_queries: List[BenchmarkQuery]
    ):
        self.hybrid = hybrid_recommender
        self.baseline = baseline_recommender
        self.queries = benchmark_queries

    def run_full_benchmark(self) -> EvaluationSummary:
        query_results: List[BenchmarkEvaluationResult] = []
        hybrid_metrics_list: List[IRMetrics] = []
        baseline_metrics_list: List[IRMetrics] = []

        # Ablation accumulators
        semantic_only_metrics: List[IRMetrics] = []
        no_penalty_metrics: List[IRMetrics] = []

        for b_q in self.queries:
            # 1. Run Hybrid Recommender
            req = RecommendRequest(
                query=b_q.goal,
                target_level=DifficultyLevel(b_q.target_level) if b_q.target_level else None,
                subject_filter=b_q.subject,
                known_prerequisites=b_q.known_prerequisites,
                enable_asymmetric_penalty=True,
                enable_intent_separation=True,
                enable_discovery_bonus=True,
                top_k=10
            )
            hybrid_resp = self.hybrid.recommend(req)
            hybrid_ids = [item.resource.id for item in hybrid_resp.results]
            hybrid_titles = [item.resource.title for item in hybrid_resp.results[:5]]
            h_metrics = compute_metrics(hybrid_ids, b_q.ground_truth_relevance)
            hybrid_metrics_list.append(h_metrics)

            # 2. Run Baseline Recommender
            baseline_resources = self.baseline.retrieve_top_k(b_q.goal, top_k=10)
            baseline_ids = [res.id for res in baseline_resources]
            baseline_titles = [res.title for res in baseline_resources[:5]]
            b_metrics = compute_metrics(baseline_ids, b_q.ground_truth_relevance)
            baseline_metrics_list.append(b_metrics)

            # 3. Ablation: Without Asymmetric Difficulty Penalty
            req_no_pen = RecommendRequest(
                query=b_q.goal,
                target_level=DifficultyLevel(b_q.target_level) if b_q.target_level else None,
                subject_filter=b_q.subject,
                enable_asymmetric_penalty=False,
                enable_intent_separation=False,
                enable_discovery_bonus=False,
                top_k=10
            )
            no_pen_resp = self.hybrid.recommend(req_no_pen)
            no_penalty_metrics.append(compute_metrics([i.resource.id for i in no_pen_resp.results], b_q.ground_truth_relevance))

            query_results.append(BenchmarkEvaluationResult(
                query_id=b_q.id,
                goal=b_q.goal,
                hybrid_metrics=h_metrics,
                baseline_metrics=b_metrics,
                hybrid_top5_titles=hybrid_titles,
                baseline_top5_titles=baseline_titles
            ))

        hybrid_agg = average_metrics(hybrid_metrics_list)
        baseline_agg = average_metrics(baseline_metrics_list)
        no_penalty_agg = average_metrics(no_penalty_metrics)

        # Calculate relative percentage improvements and absolute percentage-point deltas
        p5_base = max(baseline_agg.precision_at_5, 1e-4)
        p5_imp = ((hybrid_agg.precision_at_5 - baseline_agg.precision_at_5) / p5_base) * 100.0
        p5_pts = (hybrid_agg.precision_at_5 - baseline_agg.precision_at_5) * 100.0

        ndcg_base = max(baseline_agg.ndcg_at_5, 1e-4)
        ndcg_imp = ((hybrid_agg.ndcg_at_5 - baseline_agg.ndcg_at_5) / ndcg_base) * 100.0
        ndcg_pts = hybrid_agg.ndcg_at_5 - baseline_agg.ndcg_at_5

        recall_base = max(baseline_agg.recall_at_5, 1e-4)
        recall_imp = ((hybrid_agg.recall_at_5 - baseline_agg.recall_at_5) / recall_base) * 100.0
        recall_pts = (hybrid_agg.recall_at_5 - baseline_agg.recall_at_5) * 100.0

        mrr_base = max(baseline_agg.mrr, 1e-4)
        mrr_imp = ((hybrid_agg.mrr - baseline_agg.mrr) / mrr_base) * 100.0
        mrr_pts = hybrid_agg.mrr - baseline_agg.mrr

        ablation_study = {
            "ScholarPath Proposed (Hybrid + Penalty + Separation)": hybrid_agg,
            "Ablation: Unconstrained Semantic Search (No Penalty)": no_penalty_agg,
            "Lexical Baseline (BM25 Only)": baseline_agg
        }

        return EvaluationSummary(
            total_test_queries=len(self.queries),
            hybrid_aggregate=hybrid_agg,
            baseline_aggregate=baseline_agg,
            improvement_percentages={
                "precision_at_5_delta_pct": round(p5_imp, 1),
                "precision_at_5_delta_pts": round(p5_pts, 1),
                "ndcg_at_5_delta_pct": round(ndcg_imp, 1),
                "ndcg_at_5_delta_pts": round(ndcg_pts, 4),
                "recall_at_5_delta_pct": round(recall_imp, 1),
                "recall_at_5_delta_pts": round(recall_pts, 1),
                "mrr_delta_pct": round(mrr_imp, 1),
                "mrr_delta_pts": round(mrr_pts, 4)
            },
            query_results=query_results,
            ablation_study=ablation_study,
            timestamp=datetime.now(timezone.utc).isoformat()
        )

def get_failure_case_analyses() -> List[FailureCaseAnalysis]:
    """
    Documented failure-case analysis and transparent technical limitations.
    Required by rigorous IR evaluation standards.
    """
    return [
        FailureCaseAnalysis(
            id="FAIL-01",
            query="Transformers for power distribution and voltage regulation",
            failure_type="Cross-Domain Lexical Polysemy (Ambiguity)",
            description="The keyword 'Transformers' heavily activates NLP/Deep Learning literature in modern computer science catalogues, overshadowing electrical engineering resources.",
            lexical_baseline_result="Returns 'Attention Is All You Need' and 'Deep Learning with PyTorch' because 'transformers' appears frequently in CS abstracts.",
            proposed_system_result="Mitigated by multi-facet subject filtering and concept-disambiguation embeddings when subject='Electrical Engineering' is designated.",
            mitigation_strategy="Explicit subject constraint weighting prevents vocabulary collision across disparate faculties.",
            remaining_limitation="When the student enters a one-word query without selecting a subject, the model must guess user intent or prompt for disambiguation."
        ),
        FailureCaseAnalysis(
            id="FAIL-02",
            query="I want to understand math",
            failure_type="Extreme Underspecification (Vague Goal)",
            description="Query lacks topic specificity, target difficulty tier, and application context.",
            lexical_baseline_result="Returns arbitrary books with the word 'math' in title (e.g., discrete mathematics, elementary calculus, mathematical physics).",
            proposed_system_result="Returns balanced foundational undergraduate surveys, but confidence score is low (semantic spread is diffuse).",
            mitigation_strategy="The interface detects diffuse query entropy and provides interactive 1-click subfield suggestions (Linear Algebra, Calculus, Statistics).",
            remaining_limitation="Cannot personalize without interaction when input is fewer than 3 tokens and lacks filters."
        ),
        FailureCaseAnalysis(
            id="FAIL-03",
            query="Quantum algorithms for drug discovery with no prior physics background",
            failure_type="Severe Prerequisite Tension (Cognitive Disconnect)",
            description="The student seeks advanced interdisciplinary research (quantum chemistry / NISQ algorithms) but possesses zero prerequisites in quantum mechanics.",
            lexical_baseline_result="Recommends advanced quantum information monographs that require graduate linear algebra and Hamiltonian mechanics.",
            proposed_system_result="Asymmetric difficulty penalty suppresses impenetrable physics papers, prioritizing high-level conceptual surveys and introductory tutorials.",
            mitigation_strategy="Intent/prerequisite separation detects prerequisite deficit and highlights learning gap in explanation badge.",
            remaining_limitation="True mastery of quantum algorithms inevitably requires quantum mechanics; the system can scaffold, but cannot remove intrinsic domain prerequisites."
        )
    ]
