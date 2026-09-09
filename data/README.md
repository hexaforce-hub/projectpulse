# 📊 ProjectPulse — Synthetic Data Foundation (Phase 2)

> **⚠️ SYNTHETIC DEMONSTRATION DATASET DISCLAIMER**  
> This dataset is synthetically generated to model the structural, operational, and financial dynamics of Central Sector Infrastructure Projects monitored under the **Ministry of Statistics and Programme Implementation (MoSPI)** / **Infrastructure and Project Monitoring Division (IPMD)** **PAIMANA** framework.  
> **This is NOT live classified Government of India data.** It serves exclusively as a mathematically validated ground truth for AI/ML experimentation, statistical evaluation, and interactive hackathon demonstration for **Smart India Hackathon 2026 (Problem Statement: SIH26103)** by **Team HexaForce**.

---

## 1. Directory Structure

```
data/
├── raw/
│   └── projects_raw.csv           # 10,000 raw simulated project records with realistic controlled missingness
├── processed/
│   ├── projects_clean.csv         # 10,000 fully normalized, validated infrastructure project records
│   ├── ml_ready_projects.csv      # 10,000 pre-processed ML feature rows (leakage-free predictive inputs + separated targets)
│   ├── project_milestones.csv     # 100,000 granular milestone tracking entries (10 milestones per project)
│   └── project_progress.csv       # 9,000 monthly time-series progress and expenditure tracking snapshots
├── quality/
│   ├── data_quality_report.json   # Formal Level 1–5 validation audit & Prototype Data Quality Score (100.0/100.0)
│   ├── dataset_statistics.json    # Full parametric & non-parametric percentiles (Min, P25, Median, P75, P95, Max)
│   └── dataset_manifest.json      # Cryptographic SHA-256 checksums, byte sizes, and provenance metadata
├── examples/
│   └── example_project.json       # 4 complete JSON payloads representing LOW, MODERATE, HIGH, and CRITICAL projects
└── test_cases/
    └── data_quality_test_cases.csv# 12 synthetic corruption test cases used to verify validator defect detection
```

---

## 2. Key Dataset Characteristics

| Parameter | Value | Reference / Standard |
| :--- | :--- | :--- |
| **Total Project Records** | 10,000 | Exceeds minimum volume (5,000–10,000) |
| **Minimum Sanction Cost** | ₹150.00 Cr | Strict MoSPI IPMD Central Sector Threshold |
| **Cost Range (Clean)** | ₹150.00 Cr – ₹67,239.52 Cr | Lognormal distribution matching mega infrastructure |
| **Median Cost (P50)** | ₹895.84 Cr | Typical highway/rail/power package size |
| **Random Seed** | `42` | 100% Deterministic & Reproducible |
| **Validation Passing Rate** | 100.0% | Zero Level 1–5 schema or domain violations |
| **Data Quality Score** | **100.0 / 100.0** | Weighted across Completeness, Validity, Uniqueness, Consistency |
| **Defect Detection Rate** | **100.0% (12/12)** | Injected negative costs, corrupt progress, inverted dates detected |

---

## 3. Ground-Truth Risk Distribution

The ground-truth risk tiers reflect empirical realities of large-scale infrastructure monitoring in India:

```
[█████████████████████] 38.45% (3,845 projects) — LOW RISK (Normal progression)
[█████████████████    ] 32.73% (3,273 projects) — MODERATE RISK (Minor slippage / early warning)
[███████████          ] 19.99% (1,999 projects) — HIGH RISK (Significant bottleneck / cost growth)
[████                 ]  8.83% (  883 projects) — CRITICAL RISK (Acute distress requiring MoSPI/CCI review)
```

---

## 4. How to Regenerate the Dataset

The entire dataset generation, validation, profiling, and cryptographic manifest pipeline is orchestrated via a single command:

```powershell
# Execute the master build pipeline (generates 10,000 records with seed 42)
.\python.bat scripts/build_dataset.py --projects 10000 --seed 42 --output-dir data
```

### Individual Script Usage
```powershell
# 1. Generate only
.\python.bat scripts/generate_dataset.py --projects 10000 --seed 42 --output-dir data

# 2. Run 5-level validation audit
.\python.bat scripts/validate_dataset.py --data-dir data

# 3. Compute statistical distribution profile
.\python.bat scripts/profile_dataset.py --input data/processed/projects_clean.csv

# 4. Run automated test suite
.\python.bat -m unittest discover -s tests -p "test_phase2_data.py"
```

---

## 5. Downstream Consumer Handoff
- **Phase 3 (Database & Data Pipeline):** Ingests `projects_clean.csv`, `project_milestones.csv`, and `project_progress.csv` directly into PostgreSQL/SQLite schema.
- **Phase 4 (Predictive Models):** Consumes `ml_ready_projects.csv` for delay classification, duration regression, and cost overrun prediction without risk of feature leakage.
