# 📚 ProjectPulse — Feature Catalog (`features_v1`)

**Version:** `features_v1`  
**Dataset Reference:** `synthetic_v1` (10,000 Central Sector Infrastructure Projects)  
**Sponsor:** Ministry of Statistics and Programme Implementation (MoSPI) / IPMD  

---

## 1. Feature Specifications

| Feature Name | Data Type | Feature Family | Definition & Mathematical Formula | Prediction Availability | Leakage Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`original_cost_cr`** | Numeric (`float64`) | Financial Scale | Original sanctioned project cost in ₹ Crores. | Yes (Baseline) | **SAFE** |
| **`planned_duration_months`** | Numeric (`int64`) | Temporal Horizon | Sanctioned construction gestation period in months. | Yes (Baseline) | **SAFE** |
| **`project_age_months`** | Numeric (`int64`) | Temporal Evolution | Calendar months elapsed from project start date to current snapshot. | Yes (Snapshot) | **SAFE** |
| **`duration_elapsed_ratio`** | Numeric (`float64`) | Temporal Evolution | $\frac{\text{project\_age\_months}}{\text{planned\_duration\_months}}$ (Clamped 0.0 to 1.5). | Yes (Derived) | **SAFE** |
| **`cumulative_expenditure_cr`**| Numeric (`float64`) | Financial Velocity | Total capital disbursed and audited up to current snapshot date. | Yes (Snapshot) | **SAFE** |
| **`physical_progress_pct`** | Numeric (`float64`) | Engineering Execution | Certified physical works completion percentage (0.0% to 100.0%). | Yes (Snapshot) | **SAFE** |
| **`interim_financial_progress_pct`** | Numeric (`float64`) | Financial Velocity | $\frac{\text{cumulative\_expenditure\_cr}}{\text{original\_cost\_cr}} \times 100$. | Yes (Derived) | **SAFE** |
| **`progress_decoupling_gap`** | Numeric (`float64`) | Decoupling Friction | $\text{interim\_financial\_progress\_pct} - \text{physical\_progress\_pct}$. | Yes (Derived) | **SAFE** |
| **`milestone_count`** | Numeric (`int64`) | Milestone Network | Total scheduled critical path checkpoints defined in contract. | Yes (Baseline) | **SAFE** |
| **`milestones_completed`** | Numeric (`int64`) | Milestone Network | Number of checkpoints successfully certified up to current date. | Yes (Snapshot) | **SAFE** |
| **`milestones_delayed`** | Numeric (`int64`) | Milestone Network | Number of checkpoints whose planned date has elapsed without completion. | Yes (Snapshot) | **SAFE** |
| **`milestones_at_risk`** | Numeric (`int64`) | Milestone Network | Checkpoints due within 60 days with critical path float depleted. | Yes (Snapshot) | **SAFE** |
| **`milestone_delay_rate`** | Numeric (`float64`) | Milestone Network | $\frac{\text{milestones\_delayed}}{\max(1, \text{milestone\_count})}$. | Yes (Derived) | **SAFE** |
| **`primary_bottleneck`** | Categorical (`str`) | Institutional Block | Dominant friction category: `LAND_ACQUISITION`, `FOREST_CLEARANCE`, `ENVIRONMENTAL_CLEARANCE`, `CONTRACTOR`, `UTILITY_SHIFTING`, `LEGAL_DISPUTE`, `PROCUREMENT`, `DESIGN_CHANGE`, `INTERDEPARTMENTAL_DEPENDENCY`, `NONE`. | Yes (Snapshot) | **SAFE** |
| **`ministry`** | Categorical (`str`) | Administrative Context | Sponsoring Union Ministry (e.g. MoRTH, Railways, Power, Petroleum, Jal Shakti). | Yes (Baseline) | **SAFE** |
| **`sector`** | Categorical (`str`) | Economic Context | Infrastructure sector (e.g. Roads & Highways, Railways, Power, Transit). | Yes (Baseline) | **SAFE** |
| **`state`** | Categorical (`str`) | Geographic Context | Primary state of execution across 15 major infrastructure states. | Yes (Baseline) | **SAFE** |
| **`region`** | Categorical (`str`) | Geographic Context | Regional classification: North, South, East, West, Central, Northeast. | Yes (Baseline) | **SAFE** |
| **`implementing_agency`** | Categorical (`str`) | Organizational Capability| Executing PSU / Authority (NHAI, RVNL, NTPC, PGCIL, ONGC, etc.). | Yes (Baseline) | **SAFE** |
| **`project_type`** | Categorical (`str`) | Engineering Complexity | Greenfield, Brownfield, Capacity Augmentation, Strategic Corridor. | Yes (Baseline) | **SAFE** |

---

## 2. Excluded Identifiers & Target Labels

- **Identifiers (Excluded):** `project_id`, `project_name`
- **Supervised Targets (Quarantined):** `target_schedule_delay_months`, `target_cost_overrun_pct`, `target_risk_class`
- **Post-Outcome Leakage Fields (Quarantined):** `revised_cost_cr`, `cost_overrun_cr`, `schedule_slippage_months`, `revised_completion_date`, `schedule_revisions_count`
