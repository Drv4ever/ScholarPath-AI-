import math
from typing import Tuple, List, Optional
from backend.app.models.resource import DifficultyLevel, DIFFICULTY_NUMERIC_MAP
from backend.app.config import settings

def calculate_asymmetric_difficulty_penalty(
    student_level: Optional[DifficultyLevel],
    resource_level: DifficultyLevel,
    over_mult: float = settings.OVER_DIFFICULTY_PENALTY,
    under_mult: float = settings.UNDER_DIFFICULTY_PENALTY
) -> Tuple[float, str]:
    """
    Asymmetric cognitive difficulty penalty:
    - Recommending an overly advanced resource to an introductory learner causes cognitive overload:
      heavy asymmetric penalization.
    - Recommending an introductory resource to an advanced learner is merely redundant:
      mild linear penalization.
    
    Returns: (penalty_amount, explanation_string)
    """
    if student_level is None:
        return 0.0, "No difficulty constraint specified; standard ranking applied."

    student_num = DIFFICULTY_NUMERIC_MAP[student_level]
    resource_num = DIFFICULTY_NUMERIC_MAP[resource_level]
    diff = resource_num - student_num

    if diff == 0:
        return 0.0, f"Exact level match ({resource_level.value}). Optimal cognitive fit."

    if diff > 0:
        # Resource is harder than student requested
        # Convex penalty: quadratic-like growth with over_mult
        raw_penalty = 0.22 * (diff ** 1.4) * over_mult
        penalty = min(0.85, raw_penalty)
        return penalty, (
            f"Cognitive load warning: Resource level '{resource_level.value}' exceeds "
            f"requested '{student_level.value}' by {diff} tier(s). Asymmetric penalty of -{penalty:.2f} applied."
        )
    else:
        # Resource is more basic than student requested
        # Mild linear penalty
        under_diff = abs(diff)
        raw_penalty = 0.08 * under_diff * under_mult
        penalty = min(0.35, raw_penalty)
        return penalty, (
            f"Foundational review: Resource level '{resource_level.value}' is {under_diff} tier(s) below "
            f"requested '{student_level.value}'. Mild penalty of -{penalty:.2f} applied."
        )

def calculate_discovery_bonus(
    borrow_count: int,
    quality_rating: float,
    max_catalogue_borrows: int = 250,
    bonus_weight: float = settings.DEFAULT_DISCOVERY_BONUS
) -> Tuple[float, str]:
    """
    Quality-controlled discovery bonus for relevant, less-discovered resources.
    Counteracts 'Rich-Get-Richer' popularity bias without recommending low-quality materials.
    """
    if max_catalogue_borrows <= 0:
        return 0.0, "No popularity baseline available."

    # Normalized obscurity: 1.0 = completely unborrowed (long-tail), 0.0 = top borrowed
    obscurity_ratio = max(0.0, 1.0 - (borrow_count / max_catalogue_borrows))
    
    # Only award discovery bonus if quality is high (>= 4.0 out of 5.0)
    if quality_rating >= 4.0 and obscurity_ratio > 0.4:
        # Scale bonus by obscurity and quality confidence
        quality_factor = (quality_rating - 3.5) / 1.5  # maps 4.0-5.0 to 0.33-1.0
        bonus = obscurity_ratio * quality_factor * bonus_weight
        return round(bonus, 3), (
            f"Long-tail discovery bonus (+{bonus:.3f}): Highly rated resource ({quality_rating}/5.0) "
            f"with low circulation ({borrow_count} borrows), counteracting popularity bias."
        )
    
    return 0.0, f"Standard catalogue circulation ({borrow_count} borrows, {quality_rating}/5.0 rating)."

def evaluate_prerequisite_fit(
    known_prerequisites: Optional[str],
    resource_prerequisites: List[str]
) -> Tuple[float, str]:
    """
    Intent & Prerequisite separation:
    Check whether the student's declared background covers the resource's requirements.
    """
    if not resource_prerequisites:
        return 1.0, "Self-contained: No formal prerequisites required."

    if not known_prerequisites or known_prerequisites.strip() == "":
        req_str = ", ".join(resource_prerequisites)
        return 0.8, f"Requires prior familiarity with: {req_str}."

    known_lower = known_prerequisites.lower()
    matched = []
    unmatched = []

    for prereq in resource_prerequisites:
        if prereq.lower() in known_lower or any(word in known_lower for word in prereq.lower().split()):
            matched.append(prereq)
        else:
            unmatched.append(prereq)

    match_ratio = len(matched) / len(resource_prerequisites)
    if match_ratio == 1.0:
        return 1.0, f"Prerequisite match: Learner has covered all requirements ({', '.join(matched)})."
    elif match_ratio > 0.0:
        return 0.85, f"Partial prerequisite match: Covers {', '.join(matched)}; may need review of {', '.join(unmatched)}."
    else:
        return 0.65, f"Prerequisite gap: Resource assumes familiarity with {', '.join(unmatched)}."
