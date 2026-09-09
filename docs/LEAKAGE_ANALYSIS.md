# 🛡️ ProjectPulse — Data Leakage Prevention Audit (Phase 4)

**Product:** ProjectPulse — Infrastructure Project Risk Intelligence  
**Sponsor:** Ministry of Statistics and Programme Implementation (MoSPI) / IPMD  
**Team:** HexaForce  
**Audit Standard:** Strict Snapshot Anti-Leakage Protocol  

---

## 1. Core Principle: Prediction-Time Isolation

A predictive model that achieves high accuracy by peeking into future outcome information is invalid for public administration. Every feature included in the ProjectPulse model space must satisfy the governing criterion:

> *"Would this value genuinely be documented and verifiable within the monitoring system at the exact moment this prediction is generated?"*

If the answer is **NO**, the feature is strictly quarantined as a target label or excluded entirely from input feature matrices.

---

## 2. Comprehensive Field Classification Matrix

| Field Name | Classification | Prediction Availability | Justification & Safeguard |
| :--- | :--- | :--- | :--- |
| `original_cost_cr` | **SAFE** | Yes | Sanctioned baseline budget established at CCEA/Cabinet approval. |
| `planned_duration_months`| **SAFE** | Yes | Contractual gestation period defined in original sanction. |
| `project_age_months` | **SAFE** | Yes | Months elapsed between sanction start date and current monitoring date. |
| `duration_elapsed_ratio` | **SAFE** | Yes | $\frac{\text{Project Age}}{\text{Planned Duration}}$; temporal progression snapshot. |
| `cumulative_expenditure_cr`| **SAFE** | Yes | Certified disbursements logged in PAIMANA up to current month. |
| `physical_progress_pct` | **SAFE** | Yes | Field engineering physical execution certified by Project Authority. |
| `interim_financial_progress_pct`| **SAFE** | Yes | $\frac{\text{Cumulative Spend}}{\text{Original Cost}} \times 100$; interim financial burn rate. |
| `progress_decoupling_gap`| **SAFE** | Yes | Difference between financial and physical progress at current snapshot. |
| `milestone_count` | **SAFE** | Yes | Total planned milestones established in package baseline network. |
| `milestones_completed` | **SAFE** | Yes | Checkpoints completed up to snapshot date. |
| `milestones_delayed` | **SAFE** | Yes | Checkpoints past planned deadline without completion certification. |
| `milestones_at_risk` | **SAFE** | Yes | Checkpoints with zero remaining float approaching current date. |
| `milestone_delay_rate` | **SAFE** | Yes | Ratio of delayed milestones to total milestones at snapshot. |
| `primary_bottleneck` | **SAFE** | Yes | Primary active operational impediment logged by implementing agency. |
| `ministry`, `sector`, `state` | **SAFE** | Yes | Static institutional and geographic administrative classifications. |
| `implementing_agency` | **SAFE** | Yes | Executing authority (e.g. NHAI, RVNL, NTPC, PGCIL). |
| `project_type` | **SAFE** | Yes | Greenfield, Brownfield, or Capacity Augmentation. |
| `project_id`, `project_name` | **EXCLUDE** | Yes | High-cardinality nominal identifiers excluded to prevent memorization. |
| `revised_cost_cr` | **LEAKAGE / TARGET**| **NO** | Reflects future post-overrun cost escalation. Excluded from X. |
| `cost_overrun_cr` | **LEAKAGE / TARGET**| **NO** | Direct mathematical derivative of target cost overrun. Excluded from X. |
| `cost_growth_pct` | **LEAKAGE / TARGET**| **NO** | Continuous cost overrun target label. Excluded from X. |
| `schedule_slippage_months`| **LEAKAGE / TARGET**| **NO** | Final post-facto delay outcome. Excluded from X. |
| `revised_completion_date` | **LEAKAGE / TARGET**| **NO** | Post-escalation revised date reflecting final slippage. Excluded from X. |
| `schedule_revisions_count`| **LEAKAGE / TARGET**| **NO** | Reflects post-hoc extension approvals. Quarantined. |
| `target_risk_class` | **TARGET** | **NO** | Supervised multi-class outcome label. Excluded from X. |
| `target_schedule_delay_months`| **TARGET** | **NO** | Supervised schedule delay regression label. Excluded from X. |
| `target_cost_overrun_pct` | **TARGET** | **NO** | Supervised cost overrun regression label. Excluded from X. |

---

## 3. Automated Leakage Prevention Verification

ProjectPulse implements an automated unit test [`tests/ml/test_leakage.py`](file:///c:/Users/SR/Documents/kishore/sih%20project/tests/ml/test_leakage.py) that inspects every trained model's feature set and verifies:
1. Zero instances of `revised_cost`, `cost_overrun`, `slippage`, or `final_completion` in feature column lists.
2. All inputs strictly conform to `features_v1` catalog.
3. Feature transformers never ingest target columns.
