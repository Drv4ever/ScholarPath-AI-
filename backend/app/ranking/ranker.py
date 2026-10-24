import time
import logging
from typing import List, Dict, Any, Optional, Tuple
import numpy as np

from backend.app.models.resource import AcademicResource, DifficultyLevel, ResourceType
from backend.app.models.request import RecommendRequest
from backend.app.models.response import ScoredResource, RecommendResponse
from backend.app.retrieval.bm25 import BM25Okapi, tokenize
from backend.app.retrieval.semantic import SemanticRetriever
from backend.app.ranking.penalties import (
    calculate_asymmetric_difficulty_penalty,
    calculate_discovery_bonus,
    evaluate_prerequisite_fit
)
from backend.app.explanation.explainer import ExplanationEngine
from backend.app.feedback.session_feedback import SessionFeedbackManager

logger = logging.getLogger(__name__)

class HybridRecommender:
    """
    Hybrid Recommendation Engine for Academic Library Resources.
    Combines:
    - BM25 lexical scoring with keyword attribution
    - Dense semantic cosine similarity with in-session Rocchio feedback
    - Asymmetric cognitive difficulty penalties
    - Prerequisite knowledge satisfaction
    - Quality-controlled discovery bonus for long-tail resources
    """
    def __init__(self, catalogue: List[AcademicResource], semantic_retriever: SemanticRetriever):
        self.catalogue = catalogue
        self.semantic_retriever = semantic_retriever
        self.id_to_index: Dict[str, int] = {res.id: idx for idx, res in enumerate(catalogue)}
        self.max_borrows = max((res.borrow_count for res in catalogue), default=1)
        
        # Build BM25 corpus from title + keywords + abstract
        self.tokenized_corpus = [
            tokenize(f"{res.title} {' '.join(res.keywords)} {res.subject} {' '.join(res.subfields)} {res.abstract}")
            for res in catalogue
        ]
        self.bm25 = BM25Okapi(self.tokenized_corpus)
        
        # Build text for semantic indexing
        semantic_docs = [
            f"Title: {res.title}. Subject: {res.subject}. Subfields: {', '.join(res.subfields)}. "
            f"Keywords: {', '.join(res.keywords)}. Level: {res.level.value}. Summary: {res.abstract}"
            for res in catalogue
        ]
        self.semantic_retriever.index_corpus(semantic_docs)

    def recommend(self, req: RecommendRequest) -> RecommendResponse:
        start_time = time.perf_counter()
        query = req.query.strip()
        query_tokens = tokenize(query)

        # 1. Base query embedding
        base_query_vec = self.semantic_retriever.encode_query(query)

        # 2. Process session feedback
        relevant_ids, irrelevant_ids = SessionFeedbackManager.extract_feedback_sets(req.session_feedback)
        relevant_indices = [self.id_to_index[rid] for rid in relevant_ids if rid in self.id_to_index]
        irrelevant_indices = [self.id_to_index[rid] for rid in irrelevant_ids if rid in self.id_to_index]

        # 3. Apply Rocchio feedback steering to query vector if feedback exists
        if relevant_indices or irrelevant_indices:
            query_vec = self.semantic_retriever.apply_rocchio_steering(
                base_query_vec,
                relevant_indices,
                irrelevant_indices
            )
        else:
            query_vec = base_query_vec

        # 4. Compute raw scores across catalogue
        semantic_sims = self.semantic_retriever.compute_similarity(query_vec)
        bm25_raw_scores = self.bm25.get_scores(query_tokens)
        max_bm25 = max(bm25_raw_scores) if bm25_raw_scores and max(bm25_raw_scores) > 0 else 1.0

        candidates: List[ScoredResource] = []

        for idx, res in enumerate(self.catalogue):
            # Apply hard filters if requested
            if req.subject_filter and res.subject.lower() != req.subject_filter.lower():
                continue
            if req.resource_type_filter and res.resource_type != req.resource_type_filter:
                continue

            sem_score = float(semantic_sims[idx]) if len(semantic_sims) > idx else 0.0
            norm_bm25 = float(bm25_raw_scores[idx] / max_bm25) if max_bm25 > 0 else 0.0

            # Match tokens
            doc_attributions = self.bm25.get_token_attributions(query_tokens, idx)
            matched_terms = [t[0] for t in doc_attributions]

            # Asymmetric difficulty penalty
            level_penalty = 0.0
            level_explanation = "No difficulty constraint provided."
            if req.enable_asymmetric_penalty and req.target_level is not None:
                level_penalty, level_explanation = calculate_asymmetric_difficulty_penalty(
                    req.target_level,
                    res.level
                )

            # Intent & prerequisite separation
            prereq_score = 1.0
            prereq_explanation = "Self-contained."
            if req.enable_intent_separation:
                prereq_score, prereq_explanation = evaluate_prerequisite_fit(
                    req.known_prerequisites,
                    res.prerequisites
                )

            # Discovery bonus
            discovery_bonus = 0.0
            discovery_explanation = "Standard circulation."
            if req.enable_discovery_bonus:
                discovery_bonus, discovery_explanation = calculate_discovery_bonus(
                    res.borrow_count,
                    res.quality_rating,
                    self.max_borrows
                )

            # Session feedback direct adjustment
            feedback_boost = SessionFeedbackManager.compute_feedback_adjustment(
                res.id,
                relevant_ids,
                irrelevant_ids
            )

            # Composite weighted score
            # Base retrieval score = (w_sem * sem + w_lex * lex) / (w_sem + w_lex)
            w_total = req.semantic_weight + req.lexical_weight
            base_retrieval = (
                (req.semantic_weight * sem_score + req.lexical_weight * norm_bm25) / w_total
                if w_total > 0 else sem_score
            )

            # Penalties and bonuses
            composite_score = (
                base_retrieval
                - level_penalty
                + (0.10 * prereq_score)
                + discovery_bonus
                + feedback_boost
            )
            final_score = max(0.001, composite_score)

            # Generate explainability breakdown
            breakdown = ExplanationEngine.generate_breakdown(
                resource=res,
                query=query,
                semantic_sim=sem_score,
                lexical_score=norm_bm25,
                matched_tokens=matched_terms,
                level_penalty=level_penalty,
                level_explanation=level_explanation,
                prereq_score=prereq_score,
                prereq_explanation=prereq_explanation,
                discovery_bonus=discovery_bonus,
                discovery_explanation=discovery_explanation,
                feedback_boost=feedback_boost,
                target_level=req.target_level
            )

            # Mark in-session status
            in_session_status = None
            if res.id in relevant_ids:
                in_session_status = "relevant"
            elif res.id in irrelevant_ids:
                in_session_status = "irrelevant"

            candidates.append(ScoredResource(
                resource=res,
                final_score=round(final_score, 4),
                rank=0,  # Will be assigned after sorting
                raw_scores={
                    "semantic_sim": round(sem_score, 4),
                    "bm25_normalized": round(norm_bm25, 4),
                    "level_penalty": round(level_penalty, 4),
                    "prereq_score": round(prereq_score, 4),
                    "discovery_bonus": round(discovery_bonus, 4),
                    "feedback_boost": round(feedback_boost, 4),
                    "base_retrieval": round(base_retrieval, 4)
                },
                explanation=breakdown,
                session_feedback=in_session_status
            ))

        # Sort descending by final score
        candidates.sort(key=lambda x: x.final_score, reverse=True)

        # Assign ranks
        for r_idx, cand in enumerate(candidates):
            cand.rank = r_idx + 1

        top_candidates = candidates[:req.top_k]
        latency = (time.perf_counter() - start_time) * 1000.0

        applied_filters = {
            "subject": req.subject_filter,
            "target_level": req.target_level.value if req.target_level else None,
            "resource_type": req.resource_type_filter.value if req.resource_type_filter else None,
            "enable_asymmetric_penalty": req.enable_asymmetric_penalty,
            "enable_intent_separation": req.enable_intent_separation,
            "enable_discovery_bonus": req.enable_discovery_bonus,
            "active_feedback_count": len(req.session_feedback)
        }

        intent_decomp = None
        if req.enable_intent_separation and req.known_prerequisites:
            intent_decomp = {
                "target_goal": req.query,
                "declared_prerequisites": req.known_prerequisites,
                "strategy": "Dual-space isolation (target competency matched against content; background matched against prerequisites)"
            }

        return RecommendResponse(
            query=req.query,
            target_level=req.target_level.value if req.target_level else None,
            applied_filters=applied_filters,
            total_catalogue_size=len(self.catalogue),
            matched_count=len(candidates),
            results=top_candidates,
            latency_ms=round(latency, 2),
            retrieval_mode=self.semantic_retriever.backend_mode,
            intent_decomposition=intent_decomp
        )
