"""
ProjectPulse — Script: Build ML Ready Dataset (Phase 4)
Extracts prediction-time features, builds targets, isolates leakage, and generates splits
"""

import argparse
import os
import sys
from pathlib import Path
import pandas as pd

PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from src.ml.config import ML_CONFIG
from src.ml.feature_engineering import engineer_features, check_for_leakage, ALL_FEATURE_COLS
from src.ml.target_builder import build_targets
from src.ml.split import split_data

def main(raw_path=None, output_dir=None, seed=42):
    raw_csv = Path(raw_path or ML_CONFIG["paths"]["raw_data"])
    out_dir = Path(output_dir or "data/processed")
    reports_dir = Path("reports/ml")
    reports_dir.mkdir(parents=True, exist_ok=True)
    out_dir.mkdir(parents=True, exist_ok=True)

    print("=" * 70)
    print("PROJECTPULSE — BUILDING ML DATASET (PHASE 4)")
    print(f"Source: {raw_csv} | Seed: {seed}")
    print("=" * 70)

    if not raw_csv.exists():
        raise FileNotFoundError(f"Missing source file: {raw_csv}")

    df_raw = pd.read_csv(raw_csv)
    initial_rows = len(df_raw)
    print(f"[Dataset] Initial rows loaded: {initial_rows:,}")

    # 1. Quality and valid rows filter
    valid_mask = (df_raw["original_cost_cr"] >= 150.0) & (df_raw["planned_duration_months"] > 0)
    df_clean = df_raw[valid_mask].copy()

    # Track exclusions
    excluded_mask = ~valid_mask
    exclusions = []
    for idx, row in df_raw[excluded_mask].iterrows():
        exclusions.append({
            "project_id": row.get("project_id", f"ROW_{idx}"),
            "reason": "cost_below_150cr_or_invalid_duration"
        })
    df_exclusions = pd.DataFrame(exclusions if exclusions else [{"project_id": "NONE", "reason": "all_valid"}])
    df_exclusions.to_csv(reports_dir / "training_exclusions.csv", index=False)
    print(f"[Dataset] Excluded rows: {len(exclusions)} (saved to reports/ml/training_exclusions.csv)")

    # 2. Engineer features
    df_features = engineer_features(df_clean)
    print(f"[Dataset] Engineered {len(df_features.columns)} features:")
    for col in df_features.columns:
        print(f"  - {col}")

    # 3. Check for leakage
    leakage = check_for_leakage(list(df_features.columns))
    if leakage:
        raise ValueError(f"CRITICAL LEAKAGE DETECTED in feature set: {leakage}")
    print("[Dataset] Strict leakage check: PASSED (Zero leakage columns found).")

    # 4. Construct supervised targets
    target_dict = build_targets(df_clean)
    df_targets = pd.DataFrame(target_dict, index=df_clean.index)
    print(f"[Dataset] Constructed {len(df_targets.columns)} prediction targets:")
    for t in df_targets.columns:
        print(f"  - {t}")

    # 5. Execute 70/15/15 Split
    splits = split_data(df_features, df_targets, seed=seed)
    print(f"[Dataset] Train count: {len(splits['X_train']):,} | Val count: {len(splits['X_val']):,} | Test count: {len(splits['X_test']):,}")

    # 6. Save split datasets
    splits["X_train"].to_csv(out_dir / "X_train.csv", index=False)
    splits["X_val"].to_csv(out_dir / "X_val.csv", index=False)
    splits["X_test"].to_csv(out_dir / "X_test.csv", index=False)

    for k in target_dict.keys():
        splits["y_train"][k].to_csv(out_dir / f"y_train_{k}.csv", index=False)
        splits["y_val"][k].to_csv(out_dir / f"y_val_{k}.csv", index=False)
        splits["y_test"][k].to_csv(out_dir / f"y_test_{k}.csv", index=False)

    print("=" * 70)
    print("ML DATASET BUILD COMPLETE!")
    print("=" * 70)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--raw", type=str, default=None)
    parser.add_argument("--output", type=str, default=None)
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()
    main(raw_path=args.raw, output_dir=args.output, seed=args.seed)
