"""
ProjectPulse — Script: Train All Models Master Pipeline (Phase 4)
One-Command Reproducible Pipeline for Dataset Building, Model Training, Evaluation, and Prediction
"""

import argparse
import sys
import time
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from scripts.build_ml_dataset import main as build_dataset
from scripts.train_schedule_model import main as train_schedule
from scripts.train_cost_model import main as train_cost
from scripts.train_risk_model import main as train_risk
from scripts.evaluate_models import main as evaluate_all
from scripts.generate_predictions import main as generate_preds

def main(seed=42):
    t_master = time.time()
    print("=" * 80)
    print("PROJECTPULSE — MASTER PREDICTIVE MODEL TRAINING PIPELINE (PHASE 4)")
    print(f"Random Seed: {seed} | Timestamp: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)

    # 1. Build Dataset & Check Leakage
    print("\n[STEP 1/6] BUILDING ML DATASET & ISOLATING LEAKAGE...")
    build_dataset(seed=seed)

    # 2. Train Model A: Schedule Delay
    print("\n[STEP 2/6] TRAINING MODEL A (SCHEDULE DELAY CLASSIFIER & REGRESSOR)...")
    train_schedule(seed=seed)

    # 3. Train Model B: Cost Overrun
    print("\n[STEP 3/6] TRAINING MODEL B (COST OVERRUN CLASSIFIER & REGRESSOR)...")
    train_cost(seed=seed)

    # 4. Train Model C: Multi-Class Implementation Risk
    print("\n[STEP 4/6] TRAINING MODEL C (MULTI-CLASS IMPLEMENTATION RISK)...")
    train_risk(seed=seed)

    # 5. Comprehensive Evaluation & Permutation Importance
    print("\n[STEP 5/6] COMPUTING UNIFIED EVALUATION & PERMUTATION IMPORTANCE...")
    evaluate_all()

    # 6. Generate Portfolio Predictions
    print("\n[STEP 6/6] GENERATING BATCH PREDICTIONS FOR PORTFOLIO...")
    generate_preds()

    duration = time.time() - t_master
    print("\n" + "=" * 80)
    print(f"MASTER TRAINING PIPELINE COMPLETED IN {duration:.2f} SECONDS!")
    print("Artifacts Stored in: models/ (schedule/, cost/, implementation/)")
    print("Reports Stored in: reports/ml/")
    print("Predictions Stored in: data/processed/predictions.csv")
    print("=" * 80)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Master training pipeline for ProjectPulse ML models.")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for reproducibility (default: 42)")
    args = parser.parse_args()
    main(seed=args.seed)
