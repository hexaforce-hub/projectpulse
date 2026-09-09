# 🤝 ProjectPulse — Phase 2 to Phase 3/4 Master Handoff Specification

**Project:** ProjectPulse — Infrastructure Risk Intelligence  
**Problem Statement:** SIH26103 (MoSPI IPMD)  
**Authoring Phase:** Phase 2 (Data Foundation)  
**Target Consumers:** Phase 3 (Database & Pipeline) & Phase 4 (Predictive Models)  
**Status:** ✅ **APPROVED — GO FOR PHASE 3**  

---

## 1. Executive Summary & Deliverables Handed Off

Phase 2 has successfully established an authoritative, 100% reproducible, machine-learning-ready synthetic infrastructure dataset consisting of:
1. `data/processed/projects_clean.csv`: 10,000 Central Sector projects (₹150 Cr+).
2. `data/processed/ml_ready_projects.csv`: 10,000 leakage-free feature vectors for predictive modeling.
3. `data/processed/project_milestones.csv`: 100,000 milestone records with statutory/agency dependencies.
4. `data/processed/project_progress.csv`: 9,000 time-series progress records.
5. `data/examples/example_project.json`: 4 complete JSON payloads conforming to `DATA_CONTRACT.md`.
6. Complete validation audit (`data/quality/data_quality_report.json`) with **100.0/100.0 Quality Score**.
7. Deterministic build pipeline (`scripts/build_dataset.py --seed 42`).

---

## 2. Technical Handoff to Phase 3 (Database & Data Pipeline)

### 2.1 Relational Ingestion Schema
Phase 3 should ingest the processed CSVs into three relational tables:

```sql
-- 1. Primary Projects Table
CREATE TABLE projects (
    project_id VARCHAR(32) PRIMARY KEY,
    project_name VARCHAR(255) NOT NULL,
    ministry VARCHAR(128) NOT NULL,
    department VARCHAR(128),
    sector VARCHAR(64) NOT NULL,
    sub_sector VARCHAR(64),
    state VARCHAR(64) NOT NULL,
    region VARCHAR(32) NOT NULL,
    implementing_agency VARCHAR(128) NOT NULL,
    project_type VARCHAR(64) NOT NULL,
    project_status VARCHAR(32) NOT NULL,
    project_stage VARCHAR(32) NOT NULL,
    original_cost_cr NUMERIC(12, 2) NOT NULL,
    revised_cost_cr NUMERIC(12, 2) NOT NULL,
    cost_overrun_cr NUMERIC(12, 2) NOT NULL,
    cost_growth_pct NUMERIC(6, 2) NOT NULL,
    cumulative_expenditure_cr NUMERIC(12, 2) NOT NULL,
    physical_progress_pct NUMERIC(5, 2) NOT NULL,
    financial_progress_pct NUMERIC(5, 2) NOT NULL,
    progress_decoupling_gap NUMERIC(6, 2) NOT NULL,
    start_date DATE NOT NULL,
    planned_completion_date DATE NOT NULL,
    revised_completion_date DATE NOT NULL,
    planned_duration_months INT NOT NULL,
    revised_duration_months INT NOT NULL,
    schedule_slippage_months INT NOT NULL,
    schedule_revisions_count INT NOT NULL,
    milestone_count INT NOT NULL,
    milestones_completed INT NOT NULL,
    milestones_delayed INT NOT NULL,
    milestones_at_risk INT NOT NULL,
    milestone_delay_rate NUMERIC(6, 4) NOT NULL,
    primary_bottleneck VARCHAR(64) NOT NULL,
    secondary_bottleneck VARCHAR(64),
    target_schedule_delay_months INT NOT NULL,
    target_cost_overrun_pct NUMERIC(6, 2) NOT NULL,
    target_risk_class VARCHAR(16) NOT NULL,
    overall_risk_score NUMERIC(5, 1) NOT NULL,
    data_source VARCHAR(64) DEFAULT 'PAIMANA-Modeled Synthetic Baseline',
    data_status VARCHAR(16) DEFAULT 'SYNTHETIC'
);

-- 2. Granular Milestones Table
CREATE TABLE project_milestones (
    milestone_id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(32) REFERENCES projects(project_id) ON DELETE CASCADE,
    milestone_name VARCHAR(255) NOT NULL,
    sequence INT NOT NULL,
    planned_date DATE NOT NULL,
    actual_date DATE,
    status VARCHAR(32) NOT NULL,
    delay_days INT DEFAULT 0,
    dependency_type VARCHAR(64) NOT NULL
);

-- 3. Monthly Time-Series Progress Table
CREATE TABLE project_progress (
    id SERIAL PRIMARY KEY,
    project_id VARCHAR(32) REFERENCES projects(project_id) ON DELETE CASCADE,
    reporting_date DATE NOT NULL,
    reporting_month INT NOT NULL,
    physical_progress_pct NUMERIC(5, 2) NOT NULL,
    cumulative_expenditure_cr NUMERIC(12, 2) NOT NULL
);
```

---

## 3. Technical Handoff to Phase 4 (Predictive Modeling)

### 3.1 Dataset to Ingest
Load `data/processed/ml_ready_projects.csv`. It contains 10,000 pre-cleaned, anti-leakage records.

### 3.2 Feature Matrix ($X$) & Target Vectors ($y$)
```python
import pandas as pd
from sklearn.model_selection import train_test_split

df = pd.read_csv("data/processed/ml_ready_projects.csv")

# Input Features (Observable at evaluation snapshot)
feature_cols = [
    "ministry", "sector", "state", "region", "implementing_agency", "project_type",
    "original_cost_cr", "planned_duration_months", "project_age_months", "duration_elapsed_ratio",
    "cumulative_expenditure_cr", "physical_progress_pct", "interim_financial_progress_pct",
    "progress_decoupling_gap", "milestone_count", "milestones_completed",
    "milestones_delayed", "milestones_at_risk", "milestone_delay_rate", "primary_bottleneck"
]

X = df[feature_cols]

# Target 1: Multi-Class Risk Classification
y_class = df["target_risk_class"]

# Target 2: Schedule Slippage Regression (Months)
y_delay = df["target_schedule_delay_months"]

# Target 3: Cost Growth Regression (%)
y_cost = df["target_cost_overrun_pct"]

# Train/Val/Test Split (70/15/15)
X_train, X_temp, y_train, y_temp = train_test_split(X, y_class, test_size=0.30, random_state=42, stratify=y_class)
X_val, X_test, y_val, y_test = train_test_split(X_temp, y_temp, test_size=0.50, random_state=42, stratify=y_temp)
```

---

## 4. Technical Handoff to Phase 5, 6, 7 & 9

1. **Phase 5 (Explainability / SHAP):**
   - Use TreeSHAP on the trained LightGBM models.
   - Map top SHAP impact features back to the `primary_bottleneck` and `progress_decoupling_gap` fields to explain predictions in clear administrative language.
2. **Phase 6 (Early Warning Signals):**
   - Early warnings should trigger when:
     - `progress_decoupling_gap > 15.0%`
     - `milestone_delay_rate > 0.25`
     - `primary_bottleneck in ['LAND_ACQUISITION', 'FOREST_CLEARANCE']` and `duration_elapsed_ratio > 0.40`.
3. **Phase 7 (What-If Intervention Simulator):**
   - Counterfactual simulator: Modify `primary_bottleneck` from `"LAND_ACQUISITION"` to `"NONE"` (simulating fast-track cabinet resolution) and observe the delta in predicted delay and predicted cost growth.
4. **Phase 9 (Frontend Integration):**
   - The FastAPI endpoints will return project models matching `data/examples/example_project.json`.
   - The Phase 1 UI requires **zero layout changes** — it will render the live API data seamlessly.
