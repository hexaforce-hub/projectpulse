# 📖 ProjectPulse — Complete Data Dictionary (Phase 2)
**Standard:** MoSPI IPMD / PAIMANA Infrastructure Monitoring Schema  
**Dataset Version:** v0.2.0  
**Target Scale:** 10,000 Project Records • 100,000 Milestone Entries • 9,000 Time-Series Snapshots  

---

## 1. Classification Taxonomy
Every field is classified into one of the four rigorous architectural classes:
1. **`OBSERVED_SCHEMA_CONCEPT`**: Official field mapped directly from MoSPI PAIMANA / OCMS reporting formats.
2. **`DERIVED`**: Deterministically computed from observed fields (e.g. progress decoupling gap, overrun).
3. **`SYNTHETIC`**: Ground-truth structural parameters generated for prototype simulation.
4. **`LABEL`**: Prediction targets isolated strictly for machine learning training without data leakage.

---

## 2. Primary Project Entity Schema (`projects_clean.csv` & `projects_raw.csv`)

| Field Name | Data Type | Source Class | Description | Allowed Values / Format | Unit | Range / Constraints | Nullable | Example | Downstream Usage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `project_id` | String | `OBSERVED_SCHEMA_CONCEPT` | Unique stable project identifier | Regex `^PRJ-[A-Z0-9]+-\d+$` | — | Non-empty, unique | No | `"PRJ-SYN-000001"` | Primary Key, API routes |
| `project_name` | String | `OBSERVED_SCHEMA_CONCEPT` | Official title of infrastructure project | Text | — | 10–255 chars | No | `"NH-44 North-South Corridor — Section I"` | Search, UI headers |
| `ministry` | String | `OBSERVED_SCHEMA_CONCEPT` | Central Administrative Ministry | 9 Central Ministries | — | Controlled enum | No | `"Ministry of Road Transport & Highways"` | Filter, aggregation |
| `department` | String | `OBSERVED_SCHEMA_CONCEPT` | Sponsoring Line Directorate / Department | Text | — | Controlled enum | Yes (Raw only) | `"Highways & Connectivity Wing"` | Reporting drilldown |
| `sector` | String | `OBSERVED_SCHEMA_CONCEPT` | Primary infrastructure sector | Roads, Rail, Power, Petroleum, Urban, Water, Aviation, Ports, Coal | — | Controlled enum | No | `"Roads & Highways"` | Grouping, dashboard |
| `sub_sector` | String | `OBSERVED_SCHEMA_CONCEPT` | Specialized sub-sector domain | Text | — | Controlled enum | Yes (Raw only) | `"Expressways"` | Drilldown analysis |
| `state` | String | `OBSERVED_SCHEMA_CONCEPT` | State / Union Territory of project execution | 15 Major Indian States | — | Controlled enum | No | `"Maharashtra"` | Geographic mapping |
| `region` | String | `DERIVED` | Administrative geographic zone | North, South, East, West, Central, Northeast | — | Controlled enum | No | `"West"` | Regional analytics |
| `implementing_agency` | String | `OBSERVED_SCHEMA_CONCEPT` | Executing Central PSU or Special Purpose Vehicle | NHAI, DFCCIL, NTPC, GAIL, DMRC, etc. | — | Controlled enum | No | `"National Highways Authority of India (NHAI)"` | Agency accountability |
| `project_type` | String | `OBSERVED_SCHEMA_CONCEPT` | Construction type and contract profile | Greenfield, Augmentation, Modernization, Interconnection | — | Controlled enum | No | `"Capacity Augmentation / 6-Laning"` | Model stratification |
| `project_status` | String | `OBSERVED_SCHEMA_CONCEPT` | Operational progress classification | ON_TRACK, AT_RISK, DELAYED, CRITICAL, COMPLETED | — | Controlled enum | No | `"AT_RISK"` | Status badge, filters |
| `project_stage` | String | `OBSERVED_SCHEMA_CONCEPT` | Lifecycle stage of project | Execution, Commissioned, Pre-Construction | — | Controlled enum | No | `"Execution"` | Portfolio segregation |
| `original_cost_cr` | Float | `OBSERVED_SCHEMA_CONCEPT` | Sanctioned baseline budget approved by CCEA | Float (2 decimal places) | ₹ Crore | ≥ 150.00 | No | `1250.50` | Baseline feature |
| `revised_cost_cr` | Float | `OBSERVED_SCHEMA_CONCEPT` | Current anticipated or revised total cost | Float (2 decimal places) | ₹ Crore | ≥ original_cost_cr | No | `1425.00` | Post-outcome reporting |
| `cost_overrun_cr` | Float | `DERIVED` | Absolute cost expansion (`revised - original`) | Float (2 decimal places) | ₹ Crore | ≥ 0.00 | No | `174.50` | Escalation metric |
| `cost_growth_pct` | Float | `DERIVED` | Cost increase as percentage of original budget | Float (2 decimal places) | % | ≥ 0.00% | No | `13.95` | Historical overrun rate |
| `cumulative_expenditure_cr`| Float | `OBSERVED_SCHEMA_CONCEPT` | Total funds disbursed/spent to date | Float (2 decimal places) | ₹ Crore | 0.00 to revised_cost | No | `780.25` | Financial monitoring |
| `physical_progress_pct`| Float | `OBSERVED_SCHEMA_CONCEPT` | Actual engineering / physical works completed | Float (2 decimal places) | % | 0.00% to 100.00% | No | `54.50` | Progress gauge |
| `financial_progress_pct`| Float | `DERIVED` | Percentage of sanctioned expenditure spent | Float (2 decimal places) | % | 0.00% to 100.00% | No | `62.40` | Financial completion |
| `progress_decoupling_gap`| Float | `DERIVED` | Decoupling gap (`financial% - physical%`) | Float (2 decimal places) | % points | -50.00 to +60.00 | No | `7.90` | Early warning signal |
| `start_date` | Date | `OBSERVED_SCHEMA_CONCEPT` | Zero-date of project commencement | ISO Date `YYYY-MM-DD` | Date | 2018-01-01 to 2023-12-31 | No | `"2020-04-01"` | Timeline analysis |
| `planned_completion_date`| Date | `OBSERVED_SCHEMA_CONCEPT` | Baseline Commercial Operation Date (COD) | ISO Date `YYYY-MM-DD` | Date | > start_date | No | `"2023-10-01"` | Timeline analysis |
| `revised_completion_date`| Date | `OBSERVED_SCHEMA_CONCEPT` | Current anticipated or extended COD | ISO Date `YYYY-MM-DD` | Date | ≥ planned_completion_date | No | `"2024-06-01"` | Timeline analysis |
| `planned_duration_months`| Integer | `DERIVED` | Baseline planned execution duration | Integer | Months | 24 to 84 | No | `42` | Baseline feature |
| `revised_duration_months`| Integer | `DERIVED` | Total duration including extensions | Integer | Months | ≥ planned_duration | No | `50` | Post-outcome duration |
| `schedule_slippage_months`| Integer | `DERIVED` | Delay beyond baseline planned completion | Integer | Months | ≥ 0 | No | `8` | Ground truth outcome |
| `schedule_revisions_count`| Integer | `OBSERVED_SCHEMA_CONCEPT` | Formal extensions sanctioned | Integer | Count | 0 to 5 | No | `1` | Extension frequency |
| `milestone_count` | Integer | `OBSERVED_SCHEMA_CONCEPT` | Total monitored milestone checkpoints | Integer | Count | 4 to 12 (Fixed 10) | No | `10` | Milestone denominator |
| `milestones_completed` | Integer | `OBSERVED_SCHEMA_CONCEPT` | Milestones achieved to date | Integer | Count | 0 to milestone_count | No | `5` | Progress tracking |
| `milestones_delayed` | Integer | `OBSERVED_SCHEMA_CONCEPT` | Milestones breached beyond planned dates | Integer | Count | 0 to milestone_count | No | `2` | Schedule friction |
| `milestones_at_risk` | Integer | `OBSERVED_SCHEMA_CONCEPT` | Milestones nearing critical dependency breach | Integer | Count | 0 to milestone_count | No | `1` | Early warning |
| `milestone_delay_rate` | Float | `DERIVED` | Ratio of delayed milestones (`delayed / total`) | Float (4 decimal places) | Ratio | 0.0000 to 1.0000 | No | `0.2000` | Critical risk feature |
| `primary_bottleneck` | String | `OBSERVED_SCHEMA_CONCEPT` | Dominant reported institutional constraint | LAND_ACQUISITION, FOREST_CLEARANCE, CONTRACTOR, etc. | — | Controlled enum | No | `"LAND_ACQUISITION"` | Bottleneck attribution |
| `secondary_bottleneck` | String | `OBSERVED_SCHEMA_CONCEPT` | Secondary reported contributing friction | Controlled bottleneck pool or NONE | — | Controlled enum | Yes (Raw only) | `"UTILITY_SHIFTING"` | Multi-factor risk |
| `target_schedule_delay_months` | Integer | `LABEL` | Ground truth schedule delay for ML regression | Integer | Months | 0 to 60+ | No | `8` | Target Variable (Phase 4) |
| `target_cost_overrun_pct` | Float | `LABEL` | Ground truth cost overrun percentage | Float (2 decimal places) | % | 0.00% to 85.00% | No | `13.95` | Target Variable (Phase 4) |
| `target_risk_class` | String | `LABEL` | Ground truth multi-class risk classification | LOW, MODERATE, HIGH, CRITICAL | — | 4-tier categorical | No | `"MODERATE"` | Target Variable (Phase 4) |
| `overall_risk_score` | Float | `DERIVED` | Composite calculated risk index (0-100) | Float (1 decimal place) | Index | 0.0 to 100.0 | No | `42.5` | UI Risk score badge |
| `data_source` | String | `SYNTHETIC` | Provenance attribution | Text | — | Constant | No | `"PAIMANA-Modeled Synthetic Baseline"` | Audit |
| `data_status` | String | `SYNTHETIC` | Production status indicator | SYNTHETIC | — | Constant | No | `"SYNTHETIC"` | Persistent UI badge |

---

## 3. Granular Milestone Schema (`project_milestones.csv`)

| Field Name | Type | Class | Description | Constraints | Nullable | Example |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `milestone_id` | String | `OBSERVED_SCHEMA_CONCEPT` | Composite unique milestone key | `{project_id}-M-XX` | No | `"PRJ-SYN-000001-M-03"` |
| `project_id` | String | `OBSERVED_SCHEMA_CONCEPT` | Foreign key referencing projects table | Exists in `projects_clean.csv` | No | `"PRJ-SYN-000001"` |
| `milestone_name` | String | `OBSERVED_SCHEMA_CONCEPT` | Standardized stage description | DPR, Land Acquisition, Civil, etc. | No | `"Land Acquisition 80% ROW Notification"` |
| `sequence` | Integer | `OBSERVED_SCHEMA_CONCEPT` | Sequential order of execution | 1 to 10 | No | `3` |
| `planned_date` | Date | `OBSERVED_SCHEMA_CONCEPT` | Target milestone completion date | `YYYY-MM-DD` | No | `"2021-03-15"` |
| `actual_date` | Date | `OBSERVED_SCHEMA_CONCEPT` | Actual completion date (blank if pending) | `YYYY-MM-DD` or empty | Yes | `"2021-05-20"` |
| `status` | String | `OBSERVED_SCHEMA_CONCEPT` | Current milestone state | COMPLETED, ON_TRACK, AT_RISK, DELAYED, NOT_STARTED | No | `"COMPLETED"` |
| `delay_days` | Integer | `DERIVED` | Slippage days beyond planned date | ≥ 0 | No | `66` |
| `dependency_type` | String | `OBSERVED_SCHEMA_CONCEPT` | Critical institutional dependency category | STATUTORY, LAND_ACQUISITION, CIVIL_WORKS, etc. | No | `"LAND_ACQUISITION"` |

---

## 4. Time-Series Progress Schema (`project_progress.csv`)

| Field Name | Type | Class | Description | Constraints | Nullable | Example |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `project_id` | String | `OBSERVED_SCHEMA_CONCEPT` | Foreign key referencing project | Exists in `projects_clean.csv` | No | `"PRJ-SYN-000001"` |
| `reporting_date` | Date | `OBSERVED_SCHEMA_CONCEPT` | Monthly snapshot reporting date | `YYYY-MM-DD` | No | `"2025-10-02"` |
| `reporting_month` | Integer | `DERIVED` | Months elapsed from zero-date | ≥ 1 | No | `32` |
| `physical_progress_pct` | Float | `OBSERVED_SCHEMA_CONCEPT` | Physical progress at that snapshot date | 0.00% to 100.00% | No | `42.50` |
| `cumulative_expenditure_cr`| Float | `OBSERVED_SCHEMA_CONCEPT` | Cumulative expenditure at snapshot date | 0.00 to revised_cost | No | `610.80` |
