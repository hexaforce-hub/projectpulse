# 🛡️ ProjectPulse — Model Readiness & Anti-Leakage Specification (Phase 2)
**Product:** ProjectPulse — Infrastructure Risk Intelligence  
**Audience:** Phase 4 Machine Learning Engineers & Evaluators  

---

## 1. The Core Anti-Leakage Principle

A common failure mode in predictive government analytics is **Data Leakage** (or target leakage), where features calculated after a project has already failed or been formally extended are mistakenly fed into an early-warning model.

For example:
- If a model is trained using `revised_cost_cr` or `cost_overrun_cr` to predict whether a project will exceed its budget, the model will achieve an artificial 100% accuracy by simply checking if revised cost exceeds original cost.
- If a model is given `schedule_slippage_months` to predict `target_risk_class`, it learns nothing about early warning signals and merely memorizes the label generator.

**In ProjectPulse Phase 2, strict anti-leakage isolation has been engineered directly into the data architecture.**

---

## 2. Feature Classification: Prediction-Time vs. Post-Outcome

| Category | Field Name | Status in `ml_ready_projects.csv` | Rationale & Anti-Leakage Rule |
| :--- | :--- | :--- | :--- |
| **Baseline Feature** | `original_cost_cr` | **INCLUDED** (Input Feature) | Sanctioned budget at time of CCEA investment approval. Known at Day 0. |
| **Baseline Feature** | `planned_duration_months` | **INCLUDED** (Input Feature) | Baseline contractual execution window. Known at Day 0. |
| **Baseline Feature** | `ministry`, `sector`, `state` | **INCLUDED** (Input Feature) | Institutional and geographic context. Known at Day 0. |
| **Baseline Feature** | `implementing_agency` | **INCLUDED** (Input Feature) | SPV/PSU executing entity. Known at Day 0. |
| **Interim Signal** | `cumulative_expenditure_cr` | **INCLUDED** (Input Feature) | Observable interim expenditure spent up to the current monitoring snapshot. |
| **Interim Signal** | `physical_progress_pct` | **INCLUDED** (Input Feature) | Observable interim physical completion percentage reported to date. |
| **Interim Signal** | `interim_financial_progress_pct` | **INCLUDED** (Input Feature) | Current expenditure as percentage of original sanctioned budget. |
| **Interim Signal** | `progress_decoupling_gap` | **INCLUDED** (Input Feature) | Decoupling gap observable at the interim monitoring snapshot. |
| **Interim Signal** | `milestones_completed` | **INCLUDED** (Input Feature) | Monitored checkpoints achieved up to the evaluation snapshot. |
| **Interim Signal** | `milestones_delayed` | **INCLUDED** (Input Feature) | Monitored checkpoints currently experiencing delay. |
| **Interim Signal** | `milestone_delay_rate` | **INCLUDED** (Input Feature) | Rate of milestone slippage observable at evaluation snapshot. |
| **Interim Signal** | `primary_bottleneck` | **INCLUDED** (Input Feature) | Active reported institutional bottleneck (e.g. Land, Forest, Utility). |
| **Post-Outcome** | `revised_cost_cr` | ❌ **STRICTLY EXCLUDED** | Represents post-escalation outcome. Using this would leak cost overrun. |
| **Post-Outcome** | `cost_overrun_cr` | ❌ **STRICTLY EXCLUDED** | Represents post-escalation outcome. |
| **Post-Outcome** | `cost_growth_pct` | ❌ **STRICTLY EXCLUDED** | Target variable derivative; causes trivial leakage. |
| **Post-Outcome** | `revised_completion_date` | ❌ **STRICTLY EXCLUDED** | Extension approved after delay occurred; causes temporal leakage. |
| **Post-Outcome** | `schedule_slippage_months` | ❌ **STRICTLY EXCLUDED** | Ground-truth delay outcome; leaks target directly. |
| **Post-Outcome** | `overall_risk_score` | ❌ **STRICTLY EXCLUDED** | Derived composite score; excluding prevents circular reasoning. |
| **Target Label** | `target_risk_class` | **ISOLATED TARGET** | Ground truth multi-class label (`LOW`, `MODERATE`, `HIGH`, `CRITICAL`). |
| **Target Label** | `target_schedule_delay_months` | **ISOLATED TARGET** | Ground truth continuous schedule slippage in months. |
| **Target Label** | `target_cost_overrun_pct` | **ISOLATED TARGET** | Ground truth continuous cost growth percentage. |

---

## 3. The Prediction Snapshot Paradigm

In production deployment (and Phase 4 evaluation), the model operates under an explicit **Prediction Snapshot**:
- The model evaluates an active project at an interim checkpoint (e.g., Month 12, Month 24, or latest reporting quarter).
- At that snapshot, the model can observe:
  - How many months have elapsed since zero-date (`project_age_months`).
  - The ratio of planned time elapsed (`duration_elapsed_ratio`).
  - How much money has been spent (`cumulative_expenditure_cr`).
  - How much engineering work is physically done (`physical_progress_pct`).
  - What bottlenecks are reported by field engineers (`primary_bottleneck`).
- The model predicts what will happen in the future (the final delay and cost escalation), enabling MoSPI to intervene *before* formal revisions and project cost inflation occur.

---

## 4. Preprocessing & Encoding Recommendations for Phase 4

```python
# Recommended feature pipeline for Phase 4 ML models
categorical_features = [
    "ministry", "sector", "state", "region", 
    "implementing_agency", "project_type", "primary_bottleneck"
]

numerical_features = [
    "original_cost_cr", "planned_duration_months", "project_age_months",
    "duration_elapsed_ratio", "cumulative_expenditure_cr", "physical_progress_pct",
    "interim_financial_progress_pct", "progress_decoupling_gap",
    "milestone_count", "milestones_completed", "milestones_delayed",
    "milestones_at_risk", "milestone_delay_rate"
]

target_columns = [
    "target_schedule_delay_months",
    "target_cost_overrun_pct",
    "target_risk_class"
]
```

---

## 5. Anti-Leakage Automated Verification

The integrity of `ml_ready_projects.csv` is continuously tested in the CI test suite (`tests/test_phase2_data.py::test_no_data_leakage_in_ml_features`):
- Checks that zero forbidden post-outcome columns exist in the feature set.
- All 11 automated unit tests pass with 100% compliance.
