"""
ProjectPulse — Model C: Multi-Class Implementation Risk (Phase 4)
4-Tier Implementation Distress Classification (LOW, MODERATE, HIGH, CRITICAL)
"""

from typing import Dict, Any
from sklearn.ensemble import HistGradientBoostingClassifier, RandomForestClassifier
from sklearn.pipeline import Pipeline

from src.ml.preprocessing import create_preprocessor

def create_risk_classifier_candidates(seed: int = 42) -> Dict[str, Pipeline]:
    """Returns candidate multi-class classification models for implementation risk."""
    return {
        "hist_gradient_boosting": Pipeline([
            ("prep", create_preprocessor(scale_numeric=False)),
            ("model", HistGradientBoostingClassifier(
                max_iter=120, learning_rate=0.08, max_depth=6, random_state=seed, class_weight="balanced"
            ))
        ]),
        "random_forest": Pipeline([
            ("prep", create_preprocessor(scale_numeric=False)),
            ("model", RandomForestClassifier(
                n_estimators=120, max_depth=8, random_state=seed, class_weight="balanced", n_jobs=-1
            ))
        ])
    }
