from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from backend.app.models.resource import AcademicResource

class ExplanationBreakdown(BaseModel):
    semantic_match_pct: float
    semantic_explanation: str
    matched_keywords: List[str]
    subject_fit_score: float
    subject_explanation: str
    level_fit_score: float
    level_penalty_applied: float
    level_explanation: str
    prerequisite_satisfaction: str
    discovery_bonus_applied: float
    feedback_boost_applied: float
    summary_sentence: str

class ScoredResource(BaseModel):
    resource: AcademicResource
    final_score: float
    rank: int
    raw_scores: Dict[str, float]
    explanation: ExplanationBreakdown
    session_feedback: Optional[str] = None  # "relevant", "irrelevant", or None

class RecommendResponse(BaseModel):
    query: str
    target_level: Optional[str] = None
    applied_filters: Dict[str, Any]
    total_catalogue_size: int
    matched_count: int
    results: List[ScoredResource]
    latency_ms: float
    retrieval_mode: str
    intent_decomposition: Optional[Dict[str, Any]] = None

class ContrastiveFactor(BaseModel):
    criterion: str
    target_value: str
    alternative_value: str
    advantage: str  # "Target", "Alternative", or "Tie"
    impact: str     # "High", "Medium", "Low"

class ContrastiveExplanationResponse(BaseModel):
    target_id: str
    alternative_id: str
    target_title: str
    alternative_title: str
    winner: str
    factors: List[ContrastiveFactor]
    narrative_explanation: str
