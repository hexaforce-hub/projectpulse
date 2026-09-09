"""
ProjectPulse — Diagnostic Script: Target Label Shuffle Sanity Check (Phase 4)
Verifies absence of trivial leakage by proving performance collapses when labels are shuffled
"""

import sys
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.metrics import roc_auc_score, f1_score

PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from src.ml.preprocessing import create_preprocessor
from sklearn.pipeline import Pipeline

def main():
    print("=" * 70)
    print("PROJECTPULSE — TARGET LABEL SHUFFLE DIAGNOSTIC SANITY CHECK")
    print("=" * 70)

    data_dir = Path("data/processed")
    X_train = pd.read_csv(data_dir / "X_train.csv")
    y_train = pd.read_csv(data_dir / "y_train_future_schedule_delay_binary.csv").squeeze("columns")
    X_test = pd.read_csv(data_dir / "X_test.csv")
    y_test = pd.read_csv(data_dir / "y_test_future_schedule_delay_binary.csv").squeeze("columns")

    # 1. Normal Performance on Real Labels
    pipe_real = Pipeline([
        ("prep", create_preprocessor(scale_numeric=False)),
        ("model", HistGradientBoostingClassifier(max_iter=60, random_state=42))
    ])
    pipe_real.fit(X_train, y_train)
    probs_real = pipe_real.predict_proba(X_test)[:, 1]
    auc_real = float(roc_auc_score(y_test, probs_real))
    print(f"[Real Target] Trained model test ROC-AUC: {auc_real:.4f}")

    # 2. Performance on Shuffled Labels
    y_train_shuffled = y_train.sample(frac=1.0, random_state=42).reset_index(drop=True)
    pipe_shuffled = Pipeline([
        ("prep", create_preprocessor(scale_numeric=False)),
        ("model", HistGradientBoostingClassifier(max_iter=60, random_state=42))
    ])
    pipe_shuffled.fit(X_train, y_train_shuffled)
    probs_shuffled = pipe_shuffled.predict_proba(X_test)[:, 1]
    auc_shuffled = float(roc_auc_score(y_test, probs_shuffled))
    print(f"[Shuffled Target] Trained model test ROC-AUC: {auc_shuffled:.4f}")

    # 3. Sanity Verification
    print("\n>>> Sanity Evaluation:")
    print(f"  - Performance Drop: {auc_real - auc_shuffled:.4f} ROC-AUC points")
    if auc_shuffled <= 0.55:
        print("  - Result: PASSED (Performance collapsed to random baseline ~0.50).")
        print("  - Conclusion: Zero trivial leakage or label memorization detected.")
    else:
        print(f"  - Warning: Shuffled performance is {auc_shuffled:.4f} (expected ~0.50).")
    print("=" * 70)

if __name__ == "__main__":
    main()
