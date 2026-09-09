"""
ProjectPulse — Model B: Cost Overrun Prediction (Phase 4)
Binary Classification (growth >= 15%) + Numerical Cost Overrun % Estimation
"""

from typing import Dict, Any, Tuple
import numpy as np
from sklearn.ensemble import HistGradientBoostingClassifier, HistGradientBoostingRegressor, RandomForestClassifier
from sklearn.pipeline import Pipeline

from src.ml.preprocessing import create_preprocessor

def create_cost_classifier_candidates(seed: int = 42) -> Dict[str, Pipeline]:
    """Returns candidate classification models for cost overrun risk."""
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

def create_cost_regressor_candidates(seed: int = 42) -> Dict[str, Pipeline]:
    """Returns candidate regression models for numerical cost growth percentage."""
    return {
        "hist_gradient_boosting": Pipeline([
            ("prep", create_preprocessor(scale_numeric=False)),
            ("model", HistGradientBoostingRegressor(
                max_iter=100, learning_rate=0.08, max_depth=6, random_state=seed
            ))
        ])
    }
