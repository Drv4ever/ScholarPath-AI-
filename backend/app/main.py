import os
import json
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Query, status
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware

from backend.app.config import settings
from backend.app.models.resource import AcademicResource, DifficultyLevel, ResourceType
from backend.app.models.request import RecommendRequest, ContrastiveExplanationRequest
from backend.app.models.response import (
    RecommendResponse,
    ContrastiveExplanationResponse,
    ScoredResource
)
from backend.app.models.evaluation import EvaluationSummary, BenchmarkQuery, FailureCaseAnalysis
from backend.app.retrieval.semantic import SemanticRetriever
from backend.app.ranking.ranker import HybridRecommender
from backend.app.evaluation.baseline import LexicalBaselineRecommender
from backend.app.evaluation.benchmark import BenchmarkEvaluator, get_failure_case_analyses
from backend.app.explanation.explainer import ExplanationEngine

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger(__name__)

# Global instances loaded on startup
catalogue_items: List[AcademicResource] = []
hybrid_recommender: Optional[HybridRecommender] = None
baseline_recommender: Optional[LexicalBaselineRecommender] = None
benchmark_evaluator: Optional[BenchmarkEvaluator] = None
sample_goals_cache: List[Dict[str, Any]] = []

def load_data():
    global catalogue_items, hybrid_recommender, baseline_recommender, benchmark_evaluator, sample_goals_cache
    
    data_dir = Path(__file__).parent / "data"
    
    # 1. Load Catalogue
    catalogue_path = data_dir / "catalogue.json"
    if not catalogue_path.exists():
        raise FileNotFoundError(f"Catalogue file missing at {catalogue_path}")
        
    with open(catalogue_path, "r", encoding="utf-8") as f:
        raw_items = json.load(f)
        catalogue_items = [AcademicResource(**item) for item in raw_items]
        
    logger.info(f"Loaded {len(catalogue_items)} academic catalogue resources.")

    # 2. Initialize Retrievers & Ranker
    semantic_retriever = SemanticRetriever(use_transformers=settings.USE_TRANSFORMERS)
    hybrid_recommender = HybridRecommender(catalogue_items, semantic_retriever)
    baseline_recommender = LexicalBaselineRecommender(catalogue_items)

    # 3. Load Benchmark Queries & Ground Truth
    bench_path = data_dir / "benchmark_ground_truth.json"
    if bench_path.exists():
        with open(bench_path, "r", encoding="utf-8") as f:
            raw_bench = json.load(f)
            benchmark_queries = [BenchmarkQuery(**b) for b in raw_bench]
            benchmark_evaluator = BenchmarkEvaluator(
                hybrid_recommender,
                baseline_recommender,
                benchmark_queries
            )
            logger.info(f"Initialized benchmark evaluator with {len(benchmark_queries)} test queries.")

    # 4. Load Sample Goals
    sample_goals_path = data_dir / "sample_goals.json"
    if sample_goals_path.exists():
        with open(sample_goals_path, "r", encoding="utf-8") as f:
            sample_goals_cache = json.load(f)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing ScholarPath AI backend services...")
    load_data()
    yield
    logger.info("Shutting down ScholarPath AI backend...")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Explainable, cold-start academic resource recommendation engine for university libraries.",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health", tags=["System"])
async def health_check():
    """System health check and engine readiness report."""
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "catalogue_size": len(catalogue_items),
        "retrieval_mode": hybrid_recommender.semantic_retriever.backend_mode if hybrid_recommender else "Uninitialized",
        "benchmark_ready": benchmark_evaluator is not None
    }

@app.get("/api/subjects", response_model=List[str], tags=["Catalogue"])
async def get_subjects():
    """Retrieve distinct academic subjects available in the library catalogue."""
    subjects = sorted(list({res.subject for res in catalogue_items if res.subject}))
    return subjects

@app.get("/api/catalogue", response_model=List[AcademicResource], tags=["Catalogue"])
async def get_catalogue(
    subject: Optional[str] = None,
    level: Optional[DifficultyLevel] = None,
    resource_type: Optional[ResourceType] = None,
    limit: int = Query(100, ge=1, le=500)
):
    """Browse or filter raw catalogue items."""
    filtered = catalogue_items
    if subject:
        filtered = [r for r in filtered if r.subject and r.subject.lower() == subject.lower()]
    if level:
        filtered = [r for r in filtered if r.level == level]
    if resource_type:
        filtered = [r for r in filtered if r.resource_type == resource_type]
    return filtered[:limit]

@app.get("/api/sample-goals", tags=["Learner Discovery"])
async def get_sample_goals():
    """Return the curated sample learner goals across subjects and levels."""
    return sample_goals_cache

@app.post("/api/recommend", response_model=RecommendResponse, tags=["Recommendation"])
async def recommend_resources(req: RecommendRequest):
    """
    Main cold-start recommendation endpoint:
    - Fuses semantic vector similarity, BM25 lexical precision, and cognitive level fit.
    - Applies in-session active feedback steering without persistent user tracking.
    """
    if not hybrid_recommender:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Recommendation engine not initialized."
        )

    if not req.query or req.query.strip() == "":
        raise HTTPException(
            status_code=422,
            detail="Learning goal query cannot be empty."
        )

    try:
        response = hybrid_recommender.recommend(req)
        return response
    except Exception as e:
        logger.exception("Error generating recommendations")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Recommendation engine error: {str(e)}"
        )

@app.post("/api/explain/contrastive", response_model=ContrastiveExplanationResponse, tags=["Explainability"])
async def explain_contrastive(req: ContrastiveExplanationRequest):
    """
    Contrastive Explanation Endpoint:
    Provides explicit causal explanation of why Target Resource ranks above Alternative Resource.
    """
    if not hybrid_recommender:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Recommendation engine not initialized."
        )

    id_map = {res.id: res for res in catalogue_items}
    if req.target_resource_id not in id_map:
        raise HTTPException(status_code=404, detail=f"Target resource {req.target_resource_id} not found.")
    if req.alternative_resource_id not in id_map:
        raise HTTPException(status_code=404, detail=f"Alternative resource {req.alternative_resource_id} not found.")

    target_res = id_map[req.target_resource_id]
    alt_res = id_map[req.alternative_resource_id]

    # Evaluate both using current query context
    eval_req = RecommendRequest(
        query=req.query,
        target_level=req.target_level,
        known_prerequisites=req.known_prerequisites,
        top_k=len(catalogue_items)
    )
    res_list = hybrid_recommender.recommend(eval_req).results
    scored_map = {item.resource.id: item for item in res_list}

    target_scored = scored_map.get(target_res.id)
    alt_scored = scored_map.get(alt_res.id)

    if not target_scored or not alt_scored:
        raise HTTPException(status_code=400, detail="Could not score items in query context.")

    return ExplanationEngine.generate_contrastive_explanation(
        target_res=target_res,
        target_scores=target_scored.raw_scores,
        target_breakdown=target_scored.explanation,
        alt_res=alt_res,
        alt_scores=alt_scored.raw_scores,
        alt_breakdown=alt_scored.explanation,
        student_level=req.target_level,
        query=req.query
    )

@app.get("/api/evaluate", response_model=EvaluationSummary, tags=["Evaluation"])
async def run_evaluation():
    """
    Execute live Information Retrieval benchmark on human-annotated test queries:
    Computes Precision@5, Recall@5, NDCG@5, and MRR comparing ScholarPath vs Lexical Baseline.
    """
    if not benchmark_evaluator:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Benchmark evaluator not initialized or ground truth dataset missing."
        )

    try:
        summary = benchmark_evaluator.run_full_benchmark()
        return summary
    except Exception as e:
        logger.exception("Error running evaluation benchmark")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Evaluation failed: {str(e)}"
        )

@app.get("/api/evaluation/failures", response_model=List[FailureCaseAnalysis], tags=["Evaluation"])
async def get_failures():
    """Retrieve structured failure case analyses and documented limitations."""
    return get_failure_case_analyses()

@app.get("/", response_class=HTMLResponse, tags=["System"])
async def root_index():
    """Root landing endpoint for ScholarPath AI backend & frontend bridge."""
    return """<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>ScholarPath AI - Explainable Academic Resource Recommendation System</title>
    <style>
      body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; padding: 2rem; max-width: 800px; margin: 0 auto; }
      h1 { color: #38bdf8; }
      a { color: #38bdf8; text-decoration: none; font-weight: bold; }
      a:hover { text-decoration: underline; }
      .card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 1.5rem; margin-top: 1.5rem; }
      .badge { background: #0284c7; color: white; padding: 3px 8px; border-radius: 9999px; font-size: 12px; font-weight: bold; }
    </style>
  </head>
  <body>
    <h1>ScholarPath AI <span class="badge">Academic Discovery</span></h1>
    <p>Explainable, cold-start academic resource discovery system.</p>
    <div class="card">
      <h3>Active Services:</h3>
      <ul>
        <li><strong>Interactive Frontend (TanStack Start + shadcn/ui):</strong> <a href="http://localhost:3000" target="_blank">http://localhost:3000</a> (Run <code>bun run dev</code> in <code>frontend/</code>)</li>
        <li><strong>FastAPI Swagger Documentation:</strong> <a href="/docs">/docs</a></li>
        <li><strong>OpenAPI Specification:</strong> <a href="/openapi.json">/openapi.json</a></li>
        <li><strong>Live IR Evaluation Endpoint:</strong> <a href="/api/evaluate">/api/evaluate</a></li>
      </ul>
    </div>
  </body>
</html>"""


