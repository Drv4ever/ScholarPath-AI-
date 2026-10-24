from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class IRMetrics(BaseModel):
    precision_at_3: float
    precision_at_5: float
    recall_at_5: float
    ndcg_at_5: float
    mrr: float

class BenchmarkQuery(BaseModel):
    id: str
    goal: str
    target_level: Optional[str] = None
    subject: Optional[str] = None
    known_prerequisites: Optional[str] = None
    ground_truth_relevance: Dict[str, int]  # resource_id -> graded relevance (1, 2, 3)

class BenchmarkEvaluationResult(BaseModel):
    query_id: str
    goal: str
    hybrid_metrics: IRMetrics
    baseline_metrics: IRMetrics
    hybrid_top5_titles: List[str]
    baseline_top5_titles: List[str]

class EvaluationSummary(BaseModel):
    total_test_queries: int
    hybrid_aggregate: IRMetrics
    baseline_aggregate: IRMetrics
    improvement_percentages: Dict[str, float]
    query_results: List[BenchmarkEvaluationResult]
    ablation_study: Dict[str, IRMetrics]
    timestamp: str

class FailureCaseAnalysis(BaseModel):
    id: str
    query: str
    failure_type: str
    description: str
    lexical_baseline_result: str
    proposed_system_result: str
    mitigation_strategy: str
    remaining_limitation: str
