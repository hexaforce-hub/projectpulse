# 🏷️ ProjectPulse — Dataset Versioning & Release Specification (Phase 2)

**Release Identifier:** `v0.2.0-baseline`  
**Generator Engine Version:** `v0.2.0`  
**Standard:** MoSPI PAIMANA / OCMS Central Sector Schema  
**Release Date:** September 7, 2026  
**Deterministic Seed:** `42`  

---

## 1. Version Manifest & Cryptographic Signatures

All files generated in this release are cataloged below with exact byte sizes and SHA-256 cryptographic hashes:

| Relative Path | Lines | Size (Bytes) | SHA-256 Checksum | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `data/processed/projects_clean.csv` | 10,001 | 4,804,049 | `72b88c138af45063bd44703308c641c0b4e235132702125fd0ea7f4b5c51c7e3` | Fully normalized primary project dataset |
| `data/processed/ml_ready_projects.csv` | 10,001 | 2,314,527 | `70ceb868d55beab60f3f98b51c34eb06d29c91e519be95e6f615a96c9480721e` | Leakage-free ML features & target labels |
| `data/processed/project_milestones.csv`| 100,001 | 14,304,819 | `37fb1aaf35ad948d0443e12547d46ada717fc1698c2ec50569ff9bc30cd5e1a2` | Granular milestone dependency tracking |
| `data/processed/project_progress.csv` | 9,001 | 389,077 | `3eb46da36d5880397b70c0b7140e994dfdacaa2173f6c1eff5a5a9d841d55469` | Monthly time-series progress snapshots |
| `data/raw/projects_raw.csv` | 10,001 | 4,789,185 | `0ad074c81f654dda43cbf64f57b544a1caa3bd3a7b61207227ae0f2c9116dfd7` | Raw input containing realistic missingness |
| `data/examples/example_project.json` | 626 | 19,375 | `7037853fa4fdc123439e25c257b70516597dd87dfe2719116a3b61f9e00faf2f` | 4 complete REST project entity payloads |
| `data/test_cases/data_quality_test_cases.csv`| 13 | 6,788 | `1e125089d098eba0bc89e29c8eaf2054e2a76096e6a30f6085c3cd8001a86393` | 12 corrupted validation defect test cases |
| `data/quality/data_quality_report.json`| 186 | 4,948 | `1c89f55e054b41b9bc9bb0e7b4112e52bca7e8c1481b7e41ebff3b3e2a07c132` | Level 1–5 quality audit and score |
| `data/quality/dataset_statistics.json` | 1,163 | 26,935 | `ea0c205b5e0359a5d7a311179183a14f02304a6d04b16086db8a153a9ac291a8` | Non-parametric percentile profiles |
| `data/quality/dataset_manifest.json` | 69 | 2,545 | Generated | Master pipeline index |

---

## 2. Release Changelog

### Version `v0.2.0` (Current — Phase 2 Completion)
- Established reproducible data generation engine (`scripts/generate_dataset.py`) using seed `42`.
- Generated 10,000 Central Sector infrastructure projects strictly adhering to MoSPI ₹150 Cr threshold.
- Generated 100,000 milestone records with realistic institutional dependencies.
- Built automated 5-level validation suite (`scripts/validate_dataset.py`) achieving **100.0/100.0 Prototype Data Quality Score**.
- Engineered anti-leakage ML feature dataset (`ml_ready_projects.csv`).
- Produced statistical profiling engine (`scripts/profile_dataset.py`) covering 20 numerical and 11 categorical features.
- Implemented one-command pipeline orchestrator (`scripts/build_dataset.py`).
- Maintained 100% backward compatibility with Phase 1 frontend contracts and routes.

### Version `v0.1.0` (Phase 1 Baseline)
- Created Phase 1 frontend mock dataset (`js/mockData.js`) with 26 representative projects including `PRJ-DEMO-001`.
- Defined initial data contracts in `DATA_CONTRACT.md` and `js/types.js`.

---

## 3. Backward & Forward Compatibility Guarantee

1. **Phase 1 UI Compatibility:** The fields defined in `DATA_CONTRACT.md` (`financials`, `progress`, `schedule`, `milestones`, `risk`, `metadata`) map directly 1:1 to the columns in `projects_clean.csv` and the JSON structure in `data/examples/example_project.json`.
2. **Phase 3 Pipeline Compatibility:** The CSV tables are structured for immediate zero-transformation relational ingestion into SQLite / PostgreSQL:
   - Primary table: `projects` (`project_id` PK)
   - Related table: `milestones` (`milestone_id` PK, `project_id` FK)
   - Related table: `progress_history` (`id` PK, `project_id` FK)
3. **Phase 4 ML Compatibility:** `ml_ready_projects.csv` can be loaded into pandas/polars and passed straight to `sklearn.model_selection.train_test_split` with zero manual column filtering required.
