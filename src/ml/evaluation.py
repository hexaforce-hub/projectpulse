"""
ProjectPulse — Model Evaluation Suite (Phase 4)
Comprehensive Metrics: ROC-AUC, PR-AUC, Confusion Matrices, Calibration & Permutation Importance
"""

from typing import Dict, Any, List
import numpy as np
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, average_precision_score, confusion_matrix,
    mean_absolute_error, mean_squared_error, r2_score, median_absolute_error
)
from sklearn.inspection import permutation_importance

def evaluate_binary_classifier(y_true: np.ndarray, y_prob: np.ndarray, threshold: float = 0.5) -> Dict[str, Any]:
    """
    Computes rigorous binary classification metrics with explicit false negative analysis.
    """
    y_pred = (y_prob >= threshold).astype(int)
    cm = confusion_matrix(y_true, y_pred)
    tn, fp, fn, tp = cm.ravel() if cm.size == 4 else (0, 0, 0, 0)

    try:
        roc_auc = float(roc_auc_score(y_true, y_prob))
    except Exception:
        roc_auc = 0.5

    try:
        pr_auc = float(average_precision_score(y_true, y_prob))
    except Exception:
        pr_auc = 0.0

    return {
        "accuracy": round(float(accuracy_score(y_true, y_pred)), 4),
        "precision": round(float(precision_score(y_true, y_pred, zero_division=0)), 4),
        "recall": round(float(recall_score(y_true, y_pred, zero_division=0)), 4),
        "f1": round(float(f1_score(y_true, y_pred, zero_division=0)), 4),
        "roc_auc": round(roc_auc, 4),
        "pr_auc": round(pr_auc, 4),
        "confusion_matrix": {
            "true_negatives": int(tn),
            "false_positives": int(fp),
            "false_negatives": int(fn),
            "true_positives": int(tp)
        },
        "false_negative_rate": round(float(fn / max(1, fn + tp)), 4),
        "false_positive_rate": round(float(fp / max(1, fp + tn)), 4)
    }

def evaluate_multiclass_classifier(y_true: np.ndarray, y_pred: np.ndarray, classes: List[str]) -> Dict[str, Any]:
    """
    Computes macro/weighted metrics and per-class precision/recall for risk tiers.
    """
    cm = confusion_matrix(y_true, y_pred, labels=classes)
    acc = float(accuracy_score(y_true, y_pred))
    macro_f1 = float(f1_score(y_true, y_pred, average="macro", zero_division=0))
    weighted_f1 = float(f1_score(y_true, y_pred, average="weighted", zero_division=0))

    per_class_p = precision_score(y_true, y_pred, labels=classes, average=None, zero_division=0)
    per_class_r = recall_score(y_true, y_pred, labels=classes, average=None, zero_division=0)
    per_class_f1 = f1_score(y_true, y_pred, labels=classes, average=None, zero_division=0)

    per_class_metrics = {
        cls: {
            "precision": round(float(p), 4),
            "recall": round(float(r), 4),
            "f1": round(float(f), 4)
        }
        for cls, p, r, f in zip(classes, per_class_p, per_class_r, per_class_f1)
    }

    return {
        "accuracy": round(acc, 4),
        "macro_f1": round(macro_f1, 4),
        "weighted_f1": round(weighted_f1, 4),
        "per_class": per_class_metrics,
        "confusion_matrix": {
            "classes": classes,
            "matrix": cm.tolist()
        }
    }

def evaluate_regressor(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, Any]:
    """
    Computes standard continuous regression evaluation metrics.
    """
    mae = float(mean_absolute_error(y_true, y_pred))
    rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
    med_ae = float(median_absolute_error(y_true, y_pred))
    r2 = float(r2_score(y_true, y_pred))

    return {
        "mae": round(mae, 4),
        "rmse": round(rmse, 4),
        "median_absolute_error": round(med_ae, 4),
        "r2": round(r2, 4)
    }

def compute_permutation_importance(model, X_test, y_test, feature_names: List[str], n_repeats: int = 5, seed: int = 42) -> List[Dict[str, Any]]:
    """
    Computes permutation importance on test set.
    """
    res = permutation_importance(model, X_test, y_test, n_repeats=n_repeats, random_state=seed, n_jobs=-1)
    sorted_importances_idx = res.importances_mean.argsort()[::-1]

    items = []
    for idx in sorted_importances_idx:
        items.append({
            "feature": feature_names[idx] if idx < len(feature_names) else f"feature_{idx}",
            "importance_mean": round(float(res.importances_mean[idx]), 4),
            "importance_std": round(float(res.importances_std[idx]), 4)
        })
    return items
