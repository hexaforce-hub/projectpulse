"""
ProjectPulse — Script: Generate Batch Predictions (Phase 4)
Runs PredictionEngine across Portfolio and Outputs predictions.csv & predictions_summary.json
"""

import json
import sys
import time
from pathlib import Path
import pandas as pd

PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from src.ml.config import ML_CONFIG
from src.ml.prediction import PredictionEngine

def main():
    t0 = time.time()
    print("=" * 70)
    print("PROJECTPULSE — GENERATING BATCH PORTFOLIO PREDICTIONS")
    print("=" * 70)

    data_dir = Path("data/processed")
    reports_dir = Path("reports/ml")
    reports_dir.mkdir(parents=True, exist_ok=True)

    input_csv = data_dir / "projects_clean.csv"
    if not input_csv.exists():
        input_csv = data_dir / "ml_ready_projects.csv"

    print(f"[Predictions] Reading projects from: {input_csv}")
    df_projects = pd.read_csv(input_csv)
    print(f"[Predictions] Total projects to score: {len(df_projects):,}")

    engine = PredictionEngine()
    df_preds, summary = engine.predict_portfolio(df_projects)

    out_csv = data_dir / "predictions.csv"
    df_preds.to_csv(out_csv, index=False)
    print(f"[Predictions] Stored {len(df_preds):,} predictions at: {out_csv}")

    # Save summary report
    summary_path = reports_dir / "predictions_summary.json"
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(summary.model_dump(), f, indent=2)
    print(f"[Predictions] Stored portfolio summary at: {summary_path}")

    elapsed = time.time() - t0
    rate = len(df_projects) / max(0.001, elapsed)
    print("=" * 70)
    print(f"BATCH SCORING COMPLETED IN {elapsed:.2f}s ({rate:.0f} projects/sec)")
    print(f"  - Risk Distribution: {summary.risk_distribution}")
    print(f"  - Average Risk Score: {summary.average_risk_score} / 100")
    print(f"  - High/Critical Priority Count: {summary.high_priority_projects_count:,}")
    print(f"  - Capital at Risk Exposure: Rs. {summary.capital_at_risk_cr:,.1f} Cr")
    print("=" * 70)

if __name__ == "__main__":
    main()
