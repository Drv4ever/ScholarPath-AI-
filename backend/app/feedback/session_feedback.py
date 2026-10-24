from typing import List, Dict, Tuple, Set
from backend.app.models.request import SessionFeedbackItem

class SessionFeedbackManager:
    """
    Manages in-session active feedback without persistent user tracking.
    Feedback is submitted per session/request, enabling immediate Rocchio vector
    steering and direct item score adjustment.
    """

    @staticmethod
    def extract_feedback_sets(
        feedback_items: List[SessionFeedbackItem]
    ) -> Tuple[Set[str], Set[str]]:
        """Separate feedback items into relevant and irrelevant sets."""
        relevant_ids: Set[str] = set()
        irrelevant_ids: Set[str] = set()
        
        for item in feedback_items:
            if item.feedback_type == "relevant":
                relevant_ids.add(item.resource_id)
                irrelevant_ids.discard(item.resource_id)
            elif item.feedback_type == "irrelevant":
                irrelevant_ids.add(item.resource_id)
                relevant_ids.discard(item.resource_id)
                
        return relevant_ids, irrelevant_ids

    @staticmethod
    def compute_feedback_adjustment(
        resource_id: str,
        relevant_ids: Set[str],
        irrelevant_ids: Set[str]
    ) -> float:
        """
        Direct item-level score adjustment:
        - +0.25 boost if learner marked it relevant.
        - -0.40 penalty if learner marked it irrelevant.
        """
        if resource_id in relevant_ids:
            return 0.25
        elif resource_id in irrelevant_ids:
            return -0.40
        return 0.0
