import pytest
from backend.app.models.resource import DifficultyLevel
from backend.app.ranking.penalties import (
    calculate_asymmetric_difficulty_penalty,
    calculate_discovery_bonus,
    evaluate_prerequisite_fit,
    calculate_topic_diversity_penalty
)

def test_exact_level_match():
    penalty, expl = calculate_asymmetric_difficulty_penalty(
        student_level=DifficultyLevel.INTERMEDIATE,
        resource_level=DifficultyLevel.INTERMEDIATE
    )
    assert penalty == 0.0
    assert "Exact level match" in expl

def test_over_difficulty_asymmetry():
    # Introductory student given a Research resource (diff = +3)
    heavy_penalty, heavy_expl = calculate_asymmetric_difficulty_penalty(
        student_level=DifficultyLevel.INTRODUCTORY,
        resource_level=DifficultyLevel.RESEARCH
    )
    
    # Advanced student given an Introductory resource (diff = -2)
    mild_penalty, mild_expl = calculate_asymmetric_difficulty_penalty(
        student_level=DifficultyLevel.ADVANCED,
        resource_level=DifficultyLevel.INTRODUCTORY
    )
    
    # Crucial property of proposed novelty:
    # Too hard (diff = +3) must be penalized significantly more harshly than too easy (diff = -2)
    assert heavy_penalty > mild_penalty * 2.0
    assert "Cognitive load warning" in heavy_expl
    assert "Foundational review" in mild_expl

def test_prerequisite_evaluation():
    # Full coverage
    score, expl = evaluate_prerequisite_fit(
        known_prerequisites="Linear Algebra and Multivariable Calculus",
        resource_prerequisites=["Linear Algebra", "Calculus"]
    )
    assert score == 1.0
    assert "Prerequisite match" in expl

    # Missing prerequisite
    score_gap, expl_gap = evaluate_prerequisite_fit(
        known_prerequisites="Basic Python",
        resource_prerequisites=["Quantum Mechanics", "Spectral Theory"]
    )
    assert score_gap < 1.0
    assert "Prerequisite gap" in expl_gap

def test_discovery_bonus():
    # High quality, low circulation
    bonus, expl = calculate_discovery_bonus(borrow_count=10, quality_rating=4.9, max_catalogue_borrows=200)
    assert bonus > 0.0
    assert "Long-tail discovery bonus" in expl

    # Heavily borrowed
    bonus_heavy, _ = calculate_discovery_bonus(borrow_count=200, quality_rating=4.9, max_catalogue_borrows=200)
    assert bonus_heavy == 0.0

def test_topic_diversity_penalty():
    # First appearance: zero penalty
    pen0, expl0 = calculate_topic_diversity_penalty("Deep Learning", ["Linear Algebra", "Calculus"])
    assert pen0 == 0.0
    assert "Diverse topic coverage" in expl0

    # Duplicate appearance: penalization
    pen1, expl1 = calculate_topic_diversity_penalty("Deep Learning", ["Deep Learning", "Calculus"])
    assert pen1 > 0.0
    assert "Topic redundancy adjustment" in expl1

    # Multiple duplicates: scaled penalization
    pen2, _ = calculate_topic_diversity_penalty("Deep Learning", ["Deep Learning", "Deep Learning", "Calculus"])
    assert pen2 > pen1
