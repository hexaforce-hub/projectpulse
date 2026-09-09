"""
ProjectPulse — Master Dataset Build Pipeline
Ministry of Statistics & Programme Implementation (MoSPI) / IPMD
Smart India Hackathon 2026 — Team HexaForce

One-command pipeline executing:
1. Data generation (projects_raw, projects_clean, ml_ready_projects, milestones, progress, test cases, examples)
2. Data validation (5 levels + corrupted defect catch tests + data quality score)
3. Data profiling (percentiles, central tendencies, category breakdowns)
4. Cryptographic manifest creation (SHA-256 checksums, byte sizes, line counts)
"""

import argparse
import hashlib
import json
import os
import sys
import time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.resolve()))

# Import pipeline steps directly
from generate_dataset import generate_dataset
from validate_dataset import validate_dataset
from profile_dataset import profile_dataset

def sha256_file(filepath):
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()

def count_lines(filepath):
    try:
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            return sum(1 for _ in f)
    except Exception:
        return 0

def build_dataset(num_records=10000, seed=42, output_dir="data", config_path="config/data_generation_config.json"):
    t_start = time.time()
    print("=" * 70)
    print("PROJECTPULSE — PHASE 2 MASTER DATASET BUILD PIPELINE")
    print(f"Target Records: {num_records} | Seed: {seed} | Output Dir: {output_dir}")
    print("=" * 70)

    # 1. Generation
    print("\n>>> STEP 1 / 4: DATA GENERATION")
    generate_dataset(num_records=num_records, seed=seed, output_dir=output_dir, config_path=config_path)
    
    # 2. Validation
    print("\n>>> STEP 2 / 4: DATA VALIDATION & QUALITY AUDIT")
    report = validate_dataset(data_dir=output_dir, output_report=f"{output_dir}/quality/data_quality_report.json")
    
    # 3. Profiling
    print("\n>>> STEP 3 / 4: STATISTICAL PROFILING & DISTRIBUTION ANALYSIS")
    profile = profile_dataset(input_csv=f"{output_dir}/processed/projects_clean.csv", output_json=f"{output_dir}/quality/dataset_statistics.json")
    
    # 4. Manifest
    print("\n>>> STEP 4 / 4: CRYPTOGRAPHIC MANIFEST & CHECKSUMS")
    out_path = Path(output_dir)
    manifest_files = {}
    
    for root, _, files in os.walk(out_path):
        for file in sorted(files):
            if file == "dataset_manifest.json":
                continue
            full_p = Path(root) / file
            rel_p = full_p.relative_to(out_path).as_posix()
            manifest_files[rel_p] = {
                "size_bytes": full_p.stat().st_size,
                "lines": count_lines(full_p),
                "sha256": sha256_file(full_p)
            }
            
    manifest = {
        "build_timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "generator_version": "v0.2.0",
        "dataset_version": "v0.2.0",
        "seed": seed,
        "record_count": num_records,
        "provenance": {
            "sponsoring_ministry": "Ministry of Statistics and Programme Implementation (MoSPI)",
            "division": "Infrastructure and Project Monitoring Division (IPMD)",
            "reference_system": "PAIMANA (Central Sector Projects ₹150 Cr+)",
            "status": "SYNTHETIC_DEMONSTRATION",
            "prototype_disclaimer": "This synthetic dataset is generated for SIH26103 prototype demonstration and validation. It does not represent live classified MoSPI records."
        },
        "quality_summary": {
            "prototype_data_quality_score": report["overall_quality_score"],
            "gate_passed": report["gate_passed"],
            "completeness_score": report["metrics"]["completeness_score"],
            "validity_score": report["metrics"]["validity_score"],
            "uniqueness_score": report["metrics"]["uniqueness_score"],
            "consistency_score": report["metrics"]["consistency_score"]
        },
        "artifacts": manifest_files
    }
    
    manifest_path = out_path / "quality" / "dataset_manifest.json"
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
        
    duration = time.time() - t_start
    print(f"\n[Manifest Generator] Manifest written to {manifest_path} ({len(manifest_files)} artifacts cataloged)")
    print("=" * 70)
    print("BUILD SUMMARY:")
    print(f"  - Total Execution Time: {duration:.2f} seconds")
    print(f"  - Generated Projects: {num_records}")
    print(f"  - Prototype Quality Score: {report['overall_quality_score']} / 100.0")
    print(f"  - Defect Catch Rate: {report['test_cases_validation']['detection_rate_pct']}%")
    print(f"  - Gate Status: {'GO FOR PHASE 3' if report['gate_passed'] else 'NO-GO'}")
    print("=" * 70)
    
    if not report["gate_passed"]:
        print("[CRITICAL] Build failed gate requirements!")
        sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Master dataset build pipeline for ProjectPulse.")
    parser.add_argument("--projects", type=int, default=10000, help="Number of records to generate")
    parser.add_argument("--seed", type=int, default=42, help="Deterministic seed")
    parser.add_argument("--output-dir", type=str, default="data", help="Output directory")
    parser.add_argument("--config", type=str, default="config/data_generation_config.json", help="Config file")
    args = parser.parse_args()
    
    build_dataset(num_records=args.projects, seed=args.seed, output_dir=args.output_dir, config_path=args.config)
