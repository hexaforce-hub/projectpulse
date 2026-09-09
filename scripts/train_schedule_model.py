"""
ProjectPulse — Script: Train Schedule Delay Models (Phase 4)
Trains Model A: Schedule Classifier & Regressor, Evaluates vs Baselines
"""

import argparse
import json
import sys
import time
from pathlib import Path
import pandas as pd
import numpy as np

PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from src.ml.config import ML_CONFIG
from src.ml.baselines import create_classification_baselines, create_regression_baselines
from src.ml.schedule_model import create_schedule_classifier_candidates, create_schedule_regressor_candidates
from src.ml.evaluation import evaluate_binary_classifier, evaluate_regressor
from src.ml.calibration import evaluate_calibration
from src.ml.serialization import save_model_artifact

def main(seed=42):
    t0 = time.time()
    print("=" * 70)
    print(f"TRAINING MODEL A: SCHEDULE DELAY RISK (Seed: {seed})")
    print("=" * 70)

    data_dir = Path("data/processed")
    models_dir = Path("models/schedule")
    reports_dir = Path("reports/ml")
    models_dir.mkdir(parents=True, exist_ok=True)
    reports_dir.mkdir(parents=True, exist_ok=True)

    X_train = pd.read_csv(data_dir / "X_train.csv")
    X_val = pd.read_csv(data_dir / "X_val.csv")
    X_test = pd.read_csv(data_dir / "X_test.csv")

    y_train_bin = pd.read_csv(data_dir / "y_train_future_schedule_delay_binary.csv").squeeze("columns")
    y_val_bin = pd.read_csv(data_dir / "y_val_future_schedule_delay_binary.csv").squeeze("columns")
    y_test_bin = pd.read_csv(data_dir / "y_test_future_schedule_delay_binary.csv").squeeze("columns")

    y_train_cont = pd.read_csv(data_dir / "y_train_future_delay_months_continuous.csv").squeeze("columns")
    y_val_cont = pd.read_csv(data_dir / "y_val_future_delay_months_continuous.csv").squeeze("columns")
    y_test_cont = pd.read_csv(data_dir / "y_test_future_delay_months_continuous.csv").squeeze("columns")

    # 1. Evaluate Classification Baselines
    print("\n>>> 1. Training Classification Baselines...")
    cls_baselines = create_classification_baselines(seed=seed)
    baseline_metrics = {}
    for name, pipe in cls_baselines.items():
        pipe.fit(X_train, y_train_bin)
        probs = pipe.predict_proba(X_val)[:, 1] if hasattr(pipe, "predict_proba") else pipe.predict(X_val)
        m = evaluate_binary_classifier(y_val_bin.values, probs)
        baseline_metrics[name] = m
        print(f"  - Baseline '{name}': Val F1={m['f1']:.4f} | ROC-AUC={m['roc_auc']:.4f}")

    # 2. Train Candidate Classifiers
    print("\n>>> 2. Training Candidate Schedule Classifiers...")
    candidates = create_schedule_classifier_candidates(seed=seed)
    candidate_metrics = {}
    best_clf = None
    best_name = None
    best_score = -1.0

    for name, pipe in candidates.items():
        pipe.fit(X_train, y_train_bin)
        probs = pipe.predict_proba(X_val)[:, 1]
        m = evaluate_binary_classifier(y_val_bin.values, probs)
        candidate_metrics[name] = m
        print(f"  - Candidate '{name}': Val F1={m['f1']:.4f} | ROC-AUC={m['roc_auc']:.4f} | Recall={m['recall']:.4f}")
        if m["roc_auc"] > best_score:
            best_score = m["roc_auc"]
            best_clf = pipe
            best_name = name

    # 3. Evaluate Best Classifier on Test Set
    print(f"\n>>> 3. Selected Best Classifier: '{best_name}'")
    test_probs = best_clf.predict_proba(X_test)[:, 1]
    final_clf_metrics = evaluate_binary_classifier(y_test_bin.values, test_probs)
    calib_metrics = evaluate_calibration(y_test_bin.values, test_probs)
    print(f"  - Test Accuracy:  {final_clf_metrics['accuracy']:.4f}")
    print(f"  - Test ROC-AUC:   {final_clf_metrics['roc_auc']:.4f}")
    print(f"  - Test PR-AUC:    {final_clf_metrics['pr_auc']:.4f}")
    print(f"  - Test Recall:    {final_clf_metrics['recall']:.4f}")
    print(f"  - Test F1:        {final_clf_metrics['f1']:.4f}")
    print(f"  - Brier Score:    {calib_metrics['brier_score']:.4f}")

    # 4. Train Schedule Delay Regressor
    print("\n>>> 4. Training Schedule Delay Regressor...")
    reg_baselines = create_regression_baselines(seed=seed)
    reg_baseline_metrics = {}
    for name, pipe in reg_baselines.items():
        pipe.fit(X_train, y_train_cont)
        preds = pipe.predict(X_val)
        m = evaluate_regressor(y_val_cont.values, preds)
        reg_baseline_metrics[name] = m
        print(f"  - Baseline '{name}': Val MAE={m['mae']:.2f} mo | R2={m['r2']:.4f}")

    reg_candidates = create_schedule_regressor_candidates(seed=seed)
    reg_cand_metrics = {}
    best_reg = None
    best_reg_name = None
    best_r2 = -999.0

    for name, pipe in reg_candidates.items():
        pipe.fit(X_train, y_train_cont)
        preds = pipe.predict(X_val)
        m = evaluate_regressor(y_val_cont.values, preds)
        reg_cand_metrics[name] = m
        print(f"  - Candidate '{name}': Val MAE={m['mae']:.2f} mo | R2={m['r2']:.4f}")
        if m["r2"] > best_r2:
            best_r2 = m["r2"]
            best_reg = pipe
            best_reg_name = name

    test_preds = best_reg.predict(X_test)
    final_reg_metrics = evaluate_regressor(y_test_cont.values, test_preds)
    print(f"  - Test Regressor MAE:  {final_reg_metrics['mae']:.2f} months")
    print(f"  - Test Regressor R2:   {final_reg_metrics['r2']:.4f}")

    # 5. Persist Model Artifacts
    meta = {
        "model_name": "schedule_delay",
        "model_version": "schedule_v1",
        "feature_set_version": "features_v1",
        "training_dataset_version": "synthetic_v1",
        "seed": seed,
        "selected_classifier": best_name,
        "selected_regressor": best_reg_name,
        "trained_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "target": "future_schedule_delay",
        "test_metrics": {
            "classifier": final_clf_metrics,
            "calibration": calib_metrics,
            "regressor": final_reg_metrics
        }
    }

    feature_names = list(X_train.columns)
    save_model_artifact(models_dir, "schedule_classifier_v1", best_clf, meta, feature_names)
    save_model_artifact(models_dir, "schedule_regressor_v1", best_reg, meta, feature_names)

    # Save metrics report
    with open(reports_dir / "schedule_metrics.json", "w", encoding="utf-8") as f:
        json.dump({
            "classifier_baselines": baseline_metrics,
            "classifier_candidates": candidate_metrics,
            "classifier_test": final_clf_metrics,
            "regressor_baselines": reg_baseline_metrics,
            "regressor_candidates": reg_cand_metrics,
            "regressor_test": final_reg_metrics,
            "calibration": calib_metrics
        }, f, indent=2)

    elapsed = time.time() - t0
    print(f"[Model A] Training and evaluation finished in {elapsed:.2f}s.")
    print("=" * 70)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()
    main(seed=args.seed)
