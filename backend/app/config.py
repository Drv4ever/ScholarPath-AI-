import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "ScholarPath AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    
    # Retrieval & Ranking weights
    DEFAULT_SEMANTIC_WEIGHT: float = 0.55
    DEFAULT_LEXICAL_WEIGHT: float = 0.45
    DEFAULT_DIFFICULTY_WEIGHT: float = 0.35
    DEFAULT_DISCOVERY_BONUS: float = 0.10
    
    # Asymmetric difficulty penalty multipliers
    OVER_DIFFICULTY_PENALTY: float = 1.8   # Heavy penalty when book is too advanced for student
    UNDER_DIFFICULTY_PENALTY: float = 0.6  # Mild penalty when book is simpler than requested
    
    # Feedback steering parameters (Rocchio)
    FEEDBACK_ALPHA: float = 1.0   # Original query weight
    FEEDBACK_BETA: float = 0.75   # Positive feedback weight
    FEEDBACK_GAMMA: float = 0.35  # Negative feedback weight
    
    # Embedding settings
    EMBEDDING_MODEL_NAME: str = "all-MiniLM-L6-v2"
    USE_TRANSFORMERS: bool = False  # Defaults to fast, deterministic TF-IDF/LSA; set True in .env if transformers desired

settings = Settings()
