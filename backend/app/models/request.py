from typing import List, Optional
from pydantic import BaseModel, Field
from backend.app.models.resource import DifficultyLevel, ResourceType

class SessionFeedbackItem(BaseModel):
    resource_id: str
    feedback_type: str = Field(..., pattern="^(relevant|irrelevant)$", description="'relevant' or 'irrelevant'")
    timestamp: Optional[float] = None

class RecommendRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=500, description="Student learning goal or research topic")
    known_prerequisites: Optional[str] = Field(None, max_length=300, description="What the learner already knows (Intent/Prerequisite Separation)")
    target_level: Optional[DifficultyLevel] = Field(None, description="Preferred academic level (Introductory, Intermediate, Advanced, Research)")
    subject_filter: Optional[str] = Field(None, description="Optional subject restriction (e.g. Computer Science, Mathematics)")
    resource_type_filter: Optional[ResourceType] = Field(None, description="Optional resource format restriction")
    
    # Feature flags for ablation & novelty toggles
    enable_asymmetric_penalty: bool = Field(True, description="Enable cognitive distance asymmetric penalization")
    enable_intent_separation: bool = Field(True, description="Disentangle learning goals from known prerequisites")
    enable_discovery_bonus: bool = Field(True, description="Apply quality-calibrated long-tail discovery bonus")
    
    # Ranking balance
    semantic_weight: float = Field(0.55, ge=0.0, le=1.0)
    lexical_weight: float = Field(0.45, ge=0.0, le=1.0)
    top_k: int = Field(10, ge=1, le=50)
    
    # Session-scoped feedback (enables stateless, privacy-preserving active feedback loop)
    session_feedback: List[SessionFeedbackItem] = Field(default_factory=list)

class ContrastiveExplanationRequest(BaseModel):
    target_resource_id: str
    alternative_resource_id: str
    query: str
    target_level: Optional[DifficultyLevel] = None
    known_prerequisites: Optional[str] = None
