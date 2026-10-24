import time
import logging
from typing import List, Dict, Any, Optional, Tuple, Set
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
    Integrates:
    - BM25 lexical scoring with exact token-level attribution.
    - Dense semantic cosine similarity with in-session Rocchio feedback steering.
    - Explicit subject relevance scoring and subtopic alignment.
    - Asymmetric cognitive difficulty penalties (convex over-difficulty penalty vs mild under-difficulty penalty).
    - Prerequisite knowledge satisfaction checking and gap identification.
    - Quality-controlled discovery bonus for long-tail, under-circulated academic texts.
    - Optional diversity adjustment across academic subtopics.
    - Fully deterministic ranking with fallback when semantic models are unavailable.
    """
    def __init__(self, catalogue: List[AcademicResource], semantic_retriever: SemanticRetriever):
        # 1. Deduplicate catalogue by unique ID, keeping the first occurrence
        seen_ids: Set[str] = set()
        deduped: List[AcademicResource] = []
        for res in catalogue:
            if res.id not in seen_ids:
                seen_ids.add(res.id)
                deduped.append(res)
            else:
                logger.warning(f"Duplicate resource ID '{res.id}' detected in catalogue. Deduplicating.")
        
        self.catalogue = deduped
        self.semantic_retriever = semantic_retriever
        self.id_to_index: Dict[str, int] = {res.id: idx for idx, res in enumerate(self.catalogue)}
        self.max_borrows = max((getattr(res, "borrow_count", 0) for res in self.catalogue), default=1)
        
        # 2. Build BM25 corpus handling missing fields safely
        self.tokenized_corpus = []
        for res in self.catalogue:
            title = res.title or ""
            keywords = " ".join(res.keywords or [])
            subject = res.subject or ""
            subfields = " ".join(res.subfields or [])
            subtopic = res.subtopic or ""
            abstract = res.abstract or res.description or ""
            learning_outcomes = " ".join(res.learning_outcomes or [])
            doc_str = f"{title} {keywords} {subject} {subfields} {subtopic} {abstract} {learning_outcomes}".strip()
            self.tokenized_corpus.append(tokenize(doc_str))
            
        self.bm25 = BM25Okapi(self.tokenized_corpus)
        
        # 3. Build text for semantic indexing
        semantic_docs = []
        for res in self.catalogue:
            level_str = res.level.value if hasattr(res.level, "value") else str(res.level)
            sem_text = (
                f"Title: {res.title or ''}. Subject: {res.subject or ''}. "
                f"Subfields: {', '.join(res.subfields or [])}. "
                f"Subtopic: {res.subtopic or ''}. "
                f"Keywords: {', '.join(res.keywords or [])}. "
                f"Level: {level_str}. "
                f"Summary: {res.abstract or res.description or ''}"
            )
            semantic_docs.append(sem_text)
            
        self.semantic_retriever.index_corpus(semantic_docs)

    def recommend(self, req: RecommendRequest) -> RecommendResponse:
        start_time = time.perf_counter()
        query = (req.query or "").strip()
        query_tokens = tokenize(query)

        # Handle empty catalogue edge case safely
        if not self.catalogue:
            return RecommendResponse(
                query=query,
                target_level=req.target_level.value if req.target_level else None,
                applied_filters={"catalogue_empty": True},
                total_catalogue_size=0,
                matched_count=0,
                results=[],
                latency_ms=round((time.perf_counter() - start_time) * 1000.0, 2),
                retrieval_mode=self.semantic_retriever.backend_mode,
                intent_decomposition=None
            )

        # 1. Base query embedding
        base_query_vec = self.semantic_retriever.encode_query(query)

        # 2. Process session feedback (stateless in-memory)
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
        q_lower = query.lower()

        for idx, res in enumerate(self.catalogue):
            # Apply subject filter (checks subject, subfields, and subtopic flexibly)
            if req.subject_filter:
                req_sf = req.subject_filter.strip().lower()
                res_subj = (res.subject or "").strip().lower()
                res_subfields = [sf.strip().lower() for sf in (res.subfields or [])]
                res_subtopic = (res.subtopic or "").strip().lower()
                
                matches_subject = (
                    res_subj == req_sf or
                    req_sf in res_subj or
                    res_subj in req_sf or
                    any(req_sf in sf or sf in req_sf for sf in res_subfields) or
                    (res_subtopic and (req_sf in res_subtopic or res_subtopic in req_sf))
                )
                if not matches_subject:
                    continue

            if req.resource_type_filter and res.resource_type != req.resource_type_filter:
                continue

            sem_score = float(semantic_sims[idx]) if len(semantic_sims) > idx else 0.0
            norm_bm25 = float(bm25_raw_scores[idx] / max_bm25) if max_bm25 > 0 else 0.0

            # Match tokens
            doc_attributions = self.bm25.get_token_attributions(query_tokens, idx)
            matched_terms = [t[0] for t in doc_attributions]

            # 5. Subject and subtopic relevance
            res_subject = (res.subject or "").lower()
            res_subtopic = (res.subtopic or "").lower()
            res_subfields = [sf.lower() for sf in (res.subfields or [])]

            if req.subject_filter:
                subject_score = 1.0
                subject_explanation = f"Direct subject filter match: {res.subject}"
            elif res_subject in q_lower or (res_subtopic and res_subtopic in q_lower):
                subject_score = 1.0
                subject_explanation = f"Direct subject match ({res.subject})"
            elif any(sf in q_lower for sf in res_subfields):
                subject_score = 0.90
                subject_explanation = f"Subfield match ({res.subject} - {res.subfields[0] if res.subfields else ''})"
            elif any(kw.lower() in q_lower for kw in (res.keywords or [])):
                subject_score = 0.80
                subject_explanation = f"Keyword topical overlap in {res.subject}"
            else:
                subject_score = 0.65
                subject_explanation = f"Cross-disciplinary relevant ({res.subject})"

            # 6. Asymmetric difficulty penalty
            level_penalty = 0.0
            level_explanation = "No difficulty constraint provided."
            if req.enable_asymmetric_penalty and req.target_level is not None:
                level_penalty, level_explanation = calculate_asymmetric_difficulty_penalty(
                    req.target_level,
                    res.level
                )

            # 7. Intent & prerequisite separation
            prereq_score = 1.0
            prereq_explanation = "Self-contained: No prerequisites required."
            if req.enable_intent_separation:
                prereq_score, prereq_explanation = evaluate_prerequisite_fit(
                    req.known_prerequisites,
                    res.prerequisites
                )

            # 8. Quality-controlled discovery bonus
            discovery_bonus = 0.0
            discovery_explanation = "Standard circulation."
            if req.enable_discovery_bonus:
                discovery_bonus, discovery_explanation = calculate_discovery_bonus(
                    getattr(res, "borrow_count", 0),
                    getattr(res, "quality_rating", 4.5),
                    self.max_borrows
                )

            # 9. Session feedback direct adjustment
            feedback_boost = SessionFeedbackManager.compute_feedback_adjustment(
                res.id,
                relevant_ids,
                irrelevant_ids
            )

            # 10. Normalized composite scoring
            w_sem = req.semantic_weight
            w_lex = req.lexical_weight
            w_subj = getattr(req, "subject_weight", 0.15)
            w_prereq = getattr(req, "prerequisite_weight", 0.10)
            w_denom = w_sem + w_lex + w_subj + w_prereq

            if w_denom > 0:
                base_retrieval = (
                    w_sem * sem_score +
                    w_lex * norm_bm25 +
                    w_subj * subject_score +
                    w_prereq * prereq_score
                ) / w_denom
            else:
                base_retrieval = sem_score

            # Penalties and bonuses
            composite_score = (
                base_retrieval
                - level_penalty
                + discovery_bonus
                + feedback_boost
            )
            final_score = max(0.001, composite_score)

            score_contributions = {
                "semantic_sim": round(sem_score, 4),
                "bm25_normalized": round(norm_bm25, 4),
                "subject_score": round(subject_score, 4),
                "difficulty_suitability": round(max(0.0, 1.0 - level_penalty), 4),
                "prereq_score": round(prereq_score, 4),
                "level_penalty": round(level_penalty, 4),
                "discovery_bonus": round(discovery_bonus, 4),
                "feedback_boost": round(feedback_boost, 4),
                "base_retrieval": round(base_retrieval, 4),
                "final_score": round(final_score, 4)
            }

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
                target_level=req.target_level,
                subject_fit_score=subject_score,
                subject_explanation=subject_explanation,
                score_contributions=score_contributions
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
                raw_scores=score_contributions,
                explanation=breakdown,
                session_feedback=in_session_status
            ))

        # Sort descending by final score, using ID as secondary key for strict determinism
        candidates.sort(key=lambda x: (x.final_score, x.resource.id), reverse=True)

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
