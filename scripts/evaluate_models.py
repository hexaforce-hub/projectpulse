"""
ProjectPulse — Script: Evaluate Models & Generate Reports (Phase 4)
Computes Unified Evaluation, Permutation Importance, and Calibration Reports
"""

import json
import sys
from pathlib import Path
import pandas as pd
import numpy as np

PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from src.ml.evaluation import compute_permutation_importance
from src.ml.serialization import load_model_artifact

def main():
    print("=" * 70)
    print("PROJECTPULSE — GENERATING UNIFIED MODEL EVALUATION REPORTS")
    print("=" * 70)

    data_dir = Path("data/processed")
    models_dir = Path("models")
    reports_dir = Path("reports/ml")
    reports_dir.mkdir(parents=True, exist_ok=True)

    X_test = pd.read_csv(data_dir / "X_test.csv")
    y_test_sched_bin = pd.read_csv(data_dir / "y_test_future_schedule_delay_binary.csv").squeeze("columns")
    y_test_cost_bin = pd.read_csv(data_dir / "y_test_future_cost_overrun_binary.csv").squeeze("columns")
    y_test_risk = pd.read_csv(data_dir / "y_test_target_risk_class_multiclass.csv").squeeze("columns")

    # Load artifacts
    sched_clf_art = load_model_artifact(models_dir / "schedule", "schedule_classifier_v1")
    cost_clf_art = load_model_artifact(models_dir / "cost", "cost_classifier_v1")
    risk_clf_art = load_model_artifact(models_dir / "implementation", "risk_classifier_v1")

    # 1. Permutation Importance
    print("\n>>> 1. Computing Permutation Importance on Test Set...")
    sched_feat_imp = compute_permutation_importance(
        sched_clf_art["pipeline"], X_test, y_test_sched_bin, sched_clf_art["features"]
    )
    cost_feat_imp = compute_permutation_importance(
        cost_clf_art["pipeline"], X_test, y_test_cost_bin, cost_clf_art["features"]
    )
    risk_feat_imp = compute_permutation_importance(
        risk_clf_art["pipeline"], X_test, y_test_risk, risk_clf_art["features"]
    )

    with open(reports_dir / "feature_importance.json", "w", encoding="utf-8") as f:
        json.dump({
            "schedule_delay_importance": sched_feat_imp[:10],
            "cost_overrun_importance": cost_feat_imp[:10],
            "implementation_risk_importance": risk_feat_imp[:10]
        }, f, indent=2)
    print("  - Saved reports/ml/feature_importance.json")

    # 2. Compile Unified Model Evaluation Report
    print("\n>>> 2. Compiling reports/ml/model_evaluation.json...")
    unified_report = {
        "dataset": {
            "version": "synthetic_v1",
            "total_samples": 10000,
            "train_samples": 7000,
            "val_samples": 1500,
            "test_samples": 1500,
            "feature_count": len(X_test.columns)
        },
        "models": {
            "schedule_delay": sched_clf_art["metadata"],
            "cost_overrun": cost_clf_art["metadata"],
            "implementation_risk": risk_clf_art["metadata"]
        },
        "top_predictive_drivers": {
            "schedule": [f["feature"] for f in sched_feat_imp[:5]],
            "cost": [f["feature"] for f in cost_feat_imp[:5]],
            "risk": [f["feature"] for f in risk_feat_imp[:5]]
        }
    }

    with open(reports_dir / "model_evaluation.json", "w", encoding="utf-8") as f:
        json.dump(unified_report, f, indent=2)

    # 3. Calibration Report
    print("\n>>> 3. Compiling reports/ml/calibration_report.json...")
    calib_report = {
        "schedule_model": sched_clf_art["metadata"]["test_metrics"]["calibration"],
        "cost_model": cost_clf_art["metadata"]["test_metrics"]["calibration"]
    }
    with open(reports_dir / "calibration_report.json", "w", encoding="utf-8") as f:
        json.dump(calib_report, f, indent=2)

    print("=" * 70)
    print("ALL EVALUATION REPORTS GENERATED SUCCESSFULLY!")
    print("=" * 70)

if __name__ == "__main__":
    main()
