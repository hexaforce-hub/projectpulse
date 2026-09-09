"""
ProjectPulse — Data Foundation Profiler
Ministry of Statistics & Programme Implementation (MoSPI) / IPMD
Smart India Hackathon 2026 — Team HexaForce

Generates comprehensive mathematical & distributional profiles:
- Parametric & non-parametric percentiles (min, P25, median, P75, P90, P95, P99, max)
- Central tendencies & standard deviations
- Categorical frequency & portfolio distribution breakdowns
Outputs to data/quality/dataset_statistics.json.
"""

import argparse
import csv
import json
import math
from datetime import datetime
from pathlib import Path

NUMERIC_COLUMNS = [
    "original_cost_cr", "revised_cost_cr", "cost_overrun_cr", "cost_growth_pct",
    "cumulative_expenditure_cr", "physical_progress_pct", "financial_progress_pct",
    "progress_decoupling_gap", "planned_duration_months", "revised_duration_months",
    "schedule_slippage_months", "schedule_revisions_count", "milestone_count",
    "milestones_completed", "milestones_delayed", "milestones_at_risk",
    "milestone_delay_rate", "target_schedule_delay_months", "target_cost_overrun_pct",
    "overall_risk_score"
]

CATEGORICAL_COLUMNS = [
    "ministry", "sector", "state", "region", "implementing_agency",
    "project_type", "project_status", "project_stage", "primary_bottleneck",
    "secondary_bottleneck", "target_risk_class"
]

def percentile(sorted_vals, p):
    if not sorted_vals:
        return 0.0
    k = (len(sorted_vals) - 1) * (p / 100.0)
    f = math.floor(k)
    c = math.ceil(k)
    if f == c:
        return sorted_vals[int(k)]
    d0 = sorted_vals[int(f)] * (c - k)
    d1 = sorted_vals[int(c)] * (k - f)
    return d0 + d1

def profile_dataset(input_csv="data/processed/projects_clean.csv", output_json="data/quality/dataset_statistics.json"):
    print(f"[Dataset Profiler] Profiling dataset from {input_csv}...")
    csv_path = Path(input_csv)
    if not csv_path.exists():
        raise FileNotFoundError(f"Input file not found: {input_csv}")
        
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        records = list(reader)
        
    total_records = len(records)
    print(f"[Dataset Profiler] Loaded {total_records} records.")
    
    numeric_stats = {}
    for col in NUMERIC_COLUMNS:
        vals = []
        for r in records:
            v = r.get(col, "")
            if v != "":
                try:
                    vals.append(float(v))
                except ValueError:
                    pass
        if not vals:
            continue
            
        vals.sort()
        n = len(vals)
        mean_val = sum(vals) / n
        variance = sum((x - mean_val) ** 2 for x in vals) / n if n > 1 else 0.0
        std_val = math.sqrt(variance)
        
        numeric_stats[col] = {
            "count": n,
            "mean": round(mean_val, 2),
            "std": round(std_val, 2),
            "min": round(vals[0], 2),
            "p25": round(percentile(vals, 25), 2),
            "p50_median": round(percentile(vals, 50), 2),
            "p75": round(percentile(vals, 75), 2),
            "p90": round(percentile(vals, 90), 2),
            "p95": round(percentile(vals, 95), 2),
            "p99": round(percentile(vals, 99), 2),
            "max": round(vals[-1], 2)
        }
        
    categorical_stats = {}
    for col in CATEGORICAL_COLUMNS:
        counts = {}
        for r in records:
            v = r.get(col, "") or "(Missing/Blank)"
            counts[v] = counts.get(v, 0) + 1
            
        freqs = [
            {"category": k, "count": v, "share_pct": round(v / total_records * 100.0, 2)}
            for k, v in sorted(counts.items(), key=lambda x: x[1], reverse=True)
        ]
        
        categorical_stats[col] = {
            "cardinality": len(counts),
            "top_categories": freqs[:10],
            "all_categories": freqs
        }
        
    profile_data = {
        "timestamp": datetime.now().isoformat(),
        "profiler_version": "v0.2.0",
        "dataset_name": "ProjectPulse PAIMANA-Modeled Clean Baseline",
        "dataset_status": "SYNTHETIC",
        "total_records": total_records,
        "numeric_profiles": numeric_stats,
        "categorical_profiles": categorical_stats
    }
    
    out_path = Path(output_json)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(profile_data, f, indent=2)
        
    print(f"[Dataset Profiler] Profile written successfully to {output_json}")
    return profile_data

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Profile PAIMANA-modeled infrastructure dataset.")
    parser.add_argument("--input", type=str, default="data/processed/projects_clean.csv", help="Path to clean CSV")
    parser.add_argument("--output", type=str, default="data/quality/dataset_statistics.json", help="Path to output profile JSON")
    args = parser.parse_args()
    
    profile_dataset(input_csv=args.input, output_json=args.output)
