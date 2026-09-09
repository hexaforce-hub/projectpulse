"""
ProjectPulse — Probability Calibration Module (Phase 4)
Probability Calibration & Brier Score Evaluation
"""

from typing import Dict, Any, Tuple
import numpy as np
from sklearn.calibration import CalibratedClassifierCV, calibration_curve
from sklearn.metrics import brier_score_loss

def evaluate_calibration(y_true: np.ndarray, y_prob: np.ndarray, n_bins: int = 10) -> Dict[str, Any]:
    """
    Computes calibration metrics including Brier score and fractional positive curves.
    """
    brier = float(brier_score_loss(y_true, y_prob))
    prob_true, prob_pred = calibration_curve(y_true, y_prob, n_bins=n_bins, strategy="uniform")

    return {
        "brier_score": round(brier, 4),
        "mean_predicted_prob": round(float(np.mean(y_prob)), 4),
        "mean_actual_prob": round(float(np.mean(y_true)), 4),
        "calibration_curve": {
            "predicted": [round(float(p), 4) for p in prob_pred],
            "true": [round(float(t), 4) for t in prob_true]
        }
    }

def calibrate_model(pipeline, X_val, y_val, method="sigmoid"):
    """
    Wraps trained classification pipeline in a CalibratedClassifierCV using validation data.
    """
    calibrated = CalibratedClassifierCV(estimator=pipeline, method=method, cv="prefit")
    calibrated.fit(X_val, y_val)
    return calibrated
