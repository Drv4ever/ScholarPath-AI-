from typing import List, Dict, Any, Optional
from backend.app.models.resource import AcademicResource, DifficultyLevel
from backend.app.models.response import (
    ExplanationBreakdown,
    ContrastiveFactor,
    ContrastiveExplanationResponse
)
from backend.app.retrieval.bm25 import tokenize

class ExplanationEngine:
    """
    Explainability Engine for ScholarPath AI.
    Produces both component-wise breakdown explanations and
    contrastive 'Why Resource A over Resource B?' comparative explanations.
    """

    @staticmethod
    def generate_breakdown(
        resource: AcademicResource,
        query: str,
        semantic_sim: float,
        lexical_score: float,
        matched_tokens: List[str],
        level_penalty: float,
        level_explanation: str,
        prereq_score: float,
        prereq_explanation: str,
        discovery_bonus: float,
        discovery_explanation: str,
        feedback_boost: float,
        target_level: Optional[DifficultyLevel]
    ) -> ExplanationBreakdown:
        semantic_pct = round(min(100.0, max(0.0, semantic_sim * 100.0)), 1)
        
        # Subject fit
        query_lower = query.lower()
        subject_fit_score = 1.0 if resource.subject.lower() in query_lower else 0.8
        subject_explanation = (
            f"Direct subject match ({resource.subject})"
            if subject_fit_score == 1.0
            else f"Subject: {resource.subject} (cross-disciplinary relevant)"
        )

        level_fit_score = max(0.0, 1.0 - level_penalty)

        # Craft concise summary sentence
        reasons = []
        if semantic_pct >= 65:
            reasons.append(f"{semantic_pct}% conceptual alignment")
        if matched_tokens:
            reasons.append(f"matched keywords ({', '.join(matched_tokens[:3])})")
        if level_penalty == 0.0 and target_level is not None:
            reasons.append(f"exact {resource.level.value} level fit")
        elif level_penalty > 0.0:
            reasons.append(f"adjusted for cognitive difficulty ({resource.level.value})")

        summary = (
            f"Recommended because of " + "; ".join(reasons) + "."
            if reasons
            else f"Matches academic catalogue topics for {resource.subject} at {resource.level.value} level."
        )

        return ExplanationBreakdown(
            semantic_match_pct=semantic_pct,
            semantic_explanation=f"{semantic_pct}% semantic concept match with student learning goal.",
            matched_keywords=matched_tokens,
            subject_fit_score=subject_fit_score,
            subject_explanation=subject_explanation,
            level_fit_score=round(level_fit_score, 3),
            level_penalty_applied=round(level_penalty, 3),
            level_explanation=level_explanation,
            prerequisite_satisfaction=prereq_explanation,
            discovery_bonus_applied=round(discovery_bonus, 3),
            feedback_boost_applied=round(feedback_boost, 3),
            summary_sentence=summary
        )

    @staticmethod
    def generate_contrastive_explanation(
        target_res: AcademicResource,
        target_scores: Dict[str, float],
        target_breakdown: ExplanationBreakdown,
        alt_res: AcademicResource,
        alt_scores: Dict[str, float],
        alt_breakdown: ExplanationBreakdown,
        student_level: Optional[DifficultyLevel],
        query: str
    ) -> ContrastiveExplanationResponse:
        """
        Contrastive explanation: Explains why Target was ranked above Alternative.
        """
        factors: List[ContrastiveFactor] = []

        # 1. Semantic fit
        target_sem = target_scores.get("semantic_sim", 0.0)
        alt_sem = alt_scores.get("semantic_sim", 0.0)
        sem_diff = target_sem - alt_sem
        sem_adv = "Target" if sem_diff > 0.03 else ("Alternative" if sem_diff < -0.03 else "Tie")
        factors.append(ContrastiveFactor(
            criterion="Semantic Relevance",
            target_value=f"{target_sem * 100:.1f}% match",
            alternative_value=f"{alt_sem * 100:.1f}% match",
            advantage=sem_adv,
            impact="High" if abs(sem_diff) > 0.1 else "Medium"
        ))

        # 2. Keyword overlap
        t_kw = len(target_breakdown.matched_keywords)
        a_kw = len(alt_breakdown.matched_keywords)
        kw_adv = "Target" if t_kw > a_kw else ("Alternative" if a_kw > t_kw else "Tie")
        factors.append(ContrastiveFactor(
            criterion="Keyword Overlap",
            target_value=f"{t_kw} terms ({', '.join(target_breakdown.matched_keywords[:3]) or 'none'})",
            alternative_value=f"{a_kw} terms ({', '.join(alt_breakdown.matched_keywords[:3]) or 'none'})",
            advantage=kw_adv,
            impact="Medium"
        ))

        # 3. Difficulty Level & Cognitive Fit
        t_pen = target_scores.get("level_penalty", 0.0)
        a_pen = alt_scores.get("level_penalty", 0.0)
        pen_diff = a_pen - t_pen  # positive if alt suffered higher penalty (target advantage)
        level_adv = "Target" if pen_diff > 0.05 else ("Alternative" if pen_diff < -0.05 else "Tie")
        req_lvl_str = student_level.value if student_level else "Not specified"
        factors.append(ContrastiveFactor(
            criterion=f"Cognitive Difficulty (Goal: {req_lvl_str})",
            target_value=f"{target_res.level.value} (penalty: -{t_pen:.2f})",
            alternative_value=f"{alt_res.level.value} (penalty: -{a_pen:.2f})",
            advantage=level_adv,
            impact="High" if abs(pen_diff) > 0.1 else "Low"
        ))

        # 4. Prerequisite Burden
        t_prereqs = len(target_res.prerequisites)
        a_prereqs = len(alt_res.prerequisites)
        prereq_adv = "Target" if t_prereqs < a_prereqs else ("Alternative" if a_prereqs < t_prereqs else "Tie")
        factors.append(ContrastiveFactor(
            criterion="Prerequisite Burden",
            target_value=f"{t_prereqs} required ({', '.join(target_res.prerequisites) or 'None'})",
            alternative_value=f"{a_prereqs} required ({', '.join(alt_res.prerequisites) or 'None'})",
            advantage=prereq_adv,
            impact="Medium"
        ))

        # 5. Discovery & Diversity
        t_disc = target_scores.get("discovery_bonus", 0.0)
        a_disc = alt_scores.get("discovery_bonus", 0.0)
        disc_adv = "Target" if t_disc > a_disc else ("Alternative" if a_disc > t_disc else "Tie")
        factors.append(ContrastiveFactor(
            criterion="Catalogue Discovery Balance",
            target_value=f"{target_res.borrow_count} borrows (bonus: +{t_disc:.3f})",
            alternative_value=f"{alt_res.borrow_count} borrows (bonus: +{a_disc:.3f})",
            advantage=disc_adv,
            impact="Low"
        ))

        # Narrative explanation
        key_advantages = [f.criterion for f in factors if f.advantage == "Target"]
        if key_advantages:
            adv_str = " and ".join(key_advantages[:2])
            narrative = (
                f"'{target_res.title}' is ranked ahead of '{alt_res.title}' predominantly due to superior "
                f"{adv_str}. "
            )
            if pen_diff > 0.05:
                narrative += (
                    f"Specifically, '{alt_res.title}' ({alt_res.level.value}) suffered an asymmetric difficulty "
                    f"penalty of -{a_pen:.2f} relative to the requested {req_lvl_str} level."
                )
            elif sem_diff > 0.05:
                narrative += (
                    f"It exhibits a {(target_sem - alt_sem)*100:.1f}% stronger conceptual correlation with your query."
                )
        else:
            narrative = (
                f"'{target_res.title}' and '{alt_res.title}' are closely matched, with the former having a slight edge "
                f"in overall composite score ({target_scores.get('final_score', 0):.3f} vs {alt_scores.get('final_score', 0):.3f})."
            )

        return ContrastiveExplanationResponse(
            target_id=target_res.id,
            alternative_id=alt_res.id,
            target_title=target_res.title,
            alternative_title=alt_res.title,
            winner=target_res.title,
            factors=factors,
            narrative_explanation=narrative
        )
