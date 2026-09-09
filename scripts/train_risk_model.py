"""
ProjectPulse — Script: Train Multi-Class Implementation Risk Model (Phase 4)
Trains Model C: 4-Tier Risk Classification (LOW, MODERATE, HIGH, CRITICAL)
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
from src.ml.baselines import create_classification_baselines
from src.ml.risk_model import create_risk_classifier_candidates
from src.ml.evaluation import evaluate_multiclass_classifier
from src.ml.serialization import save_model_artifact

CLASS_ORDER = ["LOW", "MODERATE", "HIGH", "CRITICAL"]

def main(seed=42):
    t0 = time.time()
    print("=" * 70)
    print(f"TRAINING MODEL C: IMPLEMENTATION RISK (Seed: {seed})")
    print("=" * 70)

    data_dir = Path("data/processed")
    models_dir = Path("models/implementation")
    reports_dir = Path("reports/ml")
    models_dir.mkdir(parents=True, exist_ok=True)
    reports_dir.mkdir(parents=True, exist_ok=True)

    X_train = pd.read_csv(data_dir / "X_train.csv")
    X_val = pd.read_csv(data_dir / "X_val.csv")
    X_test = pd.read_csv(data_dir / "X_test.csv")

    y_train = pd.read_csv(data_dir / "y_train_target_risk_class_multiclass.csv").squeeze("columns")
    y_val = pd.read_csv(data_dir / "y_val_target_risk_class_multiclass.csv").squeeze("columns")
    y_test = pd.read_csv(data_dir / "y_test_target_risk_class_multiclass.csv").squeeze("columns")

    # 1. Baseline Evaluation
    print("\n>>> 1. Training Multi-Class Baselines...")
    cls_baselines = create_classification_baselines(seed=seed)
    baseline_metrics = {}
    for name, pipe in cls_baselines.items():
        pipe.fit(X_train, y_train)
        preds = pipe.predict(X_val)
        m = evaluate_multiclass_classifier(y_val.values, preds, CLASS_ORDER)
        baseline_metrics[name] = m
        print(f"  - Baseline '{name}': Val Macro F1={m['macro_f1']:.4f} | Accuracy={m['accuracy']:.4f}")

    # 2. Candidate Evaluation
    print("\n>>> 2. Training Candidate Multi-Class Classifiers...")
    candidates = create_risk_classifier_candidates(seed=seed)
    candidate_metrics = {}
    best_clf = None
    best_name = None
    best_macro_f1 = -1.0

    for name, pipe in candidates.items():
        pipe.fit(X_train, y_train)
        preds = pipe.predict(X_val)
        m = evaluate_multiclass_classifier(y_val.values, preds, CLASS_ORDER)
        candidate_metrics[name] = m
        print(f"  - Candidate '{name}': Val Macro F1={m['macro_f1']:.4f} | Accuracy={m['accuracy']:.4f}")
        if m["macro_f1"] > best_macro_f1:
            best_macro_f1 = m["macro_f1"]
            best_clf = pipe
            best_name = name

    # 3. Test Evaluation
    print(f"\n>>> 3. Selected Best Multi-Class Classifier: '{best_name}'")
    test_preds = best_clf.predict(X_test)
    final_metrics = evaluate_multiclass_classifier(y_test.values, test_preds, CLASS_ORDER)
    print(f"  - Test Accuracy:   {final_metrics['accuracy']:.4f}")
    print(f"  - Test Macro F1:   {final_metrics['macro_f1']:.4f}")
    print(f"  - Test Weighted F1:{final_metrics['weighted_f1']:.4f}")
    print("  - Per-Class Breakdown:")
    for cls in CLASS_ORDER:
        info = final_metrics["per_class"][cls]
        print(f"    * {cls:8s}: Precision={info['precision']:.4f} | Recall={info['recall']:.4f} | F1={info['f1']:.4f}")

    # 4. Save Artifacts
    meta = {
        "model_name": "implementation_risk",
        "model_version": "implementation_v1",
        "feature_set_version": "features_v1",
        "training_dataset_version": "synthetic_v1",
        "seed": seed,
        "selected_classifier": best_name,
        "classes": CLASS_ORDER,
        "trained_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "target": "target_risk_class",
        "test_metrics": final_metrics
    }

    feature_names = list(X_train.columns)
    save_model_artifact(models_dir, "risk_classifier_v1", best_clf, meta, feature_names)

    with open(reports_dir / "implementation_metrics.json", "w", encoding="utf-8") as f:
        json.dump({
            "baselines": baseline_metrics,
            "candidates": candidate_metrics,
            "test_metrics": final_metrics
        }, f, indent=2)

    elapsed = time.time() - t0
    print(f"[Model C] Training and evaluation finished in {elapsed:.2f}s.")
    print("=" * 70)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()
    main(seed=args.seed)
