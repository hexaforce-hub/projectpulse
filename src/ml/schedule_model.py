"""
ProjectPulse — Model A: Schedule Delay Prediction (Phase 4)
Binary Classification (delay >= 12 mo) + Numerical Delay Months Estimation
"""

from typing import Dict, Any, Tuple
import numpy as np
from sklearn.ensemble import HistGradientBoostingClassifier, HistGradientBoostingRegressor, RandomForestClassifier
from sklearn.pipeline import Pipeline

from src.ml.preprocessing import create_preprocessor

def create_schedule_classifier_candidates(seed: int = 42) -> Dict[str, Pipeline]:
    """Returns candidate classification models for schedule delay risk."""
    return {
        "hist_gradient_boosting": Pipeline([
            ("prep", create_preprocessor(scale_numeric=False)),
            ("model", HistGradientBoostingClassifier(
                max_iter=100, learning_rate=0.08, max_depth=6, random_state=seed, class_weight="balanced"
            ))
        ]),
        "random_forest": Pipeline([
            ("prep", create_preprocessor(scale_numeric=False)),
            ("model", RandomForestClassifier(
                n_estimators=100, max_depth=8, random_state=seed, class_weight="balanced", n_jobs=-1
            ))
        ])
    }

def create_schedule_regressor_candidates(seed: int = 42) -> Dict[str, Pipeline]:
    """Returns candidate regression models for numerical delay months."""
    return {
        "hist_gradient_boosting": Pipeline([
            ("prep", create_preprocessor(scale_numeric=False)),
            ("model", HistGradientBoostingRegressor(
                max_iter=100, learning_rate=0.08, max_depth=6, random_state=seed
            ))
        ])
    }
