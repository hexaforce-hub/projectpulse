# 🔬 ProjectPulse — Data Quality & Validation Report (Phase 2)
**Standard:** MoSPI IPMD / PAIMANA Quality Assurance Framework  
**Evaluator:** Automated Multi-Level Quality Engine (`scripts/validate_dataset.py`)  
**Audit Status:** ✅ **PASSED (GO FOR PHASE 3)**  
**Overall Prototype Quality Score:** **100.0 / 100.0**  

---

## 1. Prototype Data Quality Score

The **Prototype Data Quality Score** is a composite metric designed to evaluate the operational readiness of the dataset across four core dimensions:

$$\text{Data Quality Score} = 0.30 \times \text{Completeness} + 0.30 \times \text{Validity} + 0.20 \times \text{Uniqueness} + 0.20 \times \text{Consistency}$$

### Dimensional Scores Breakdown

| Dimension | Weight | Mathematical Definition | Audit Result | Score Contribution |
| :--- | :--- | :--- | :--- | :--- |
| **Completeness** | 30% | $100 - \left(\frac{\text{Missing Required Cells}}{\text{Total Cells}} \times 100\right)$ | 0 missing cells out of 400,000 clean cells | **100.0%** (30.0 / 30.0) |
| **Validity** | 30% | $\left(\frac{\text{Cells Conforming to Domain Rules}}{\text{Total Evaluated Cells}}\right) \times 100$ | Zero range, regex, or type violations | **100.0%** (30.0 / 30.0) |
| **Uniqueness** | 20% | $\left(\frac{\text{Unique Project IDs}}{\text{Total Records}}\right) \times 100$ | 10,000 unique IDs / 10,000 records | **100.0%** (20.0 / 20.0) |
| **Consistency** | 20% | $\left(\frac{\text{Internally Consistent Records}}{\text{Total Records}}\right) \times 100$ | Zero cross-field logic contradictions | **100.0%** (20.0 / 20.0) |
| **Overall Score**| **100%** | **Weighted Composite** | **Zero Defects in Clean Set** | **100.0 / 100.0** |

> [!NOTE]
> **Score Limitation:** The Prototype Data Quality Score is an engineering verification benchmark developed for SIH26103 prototype assurance. It does not represent an official MoSPI / IPMD statutory compliance audit score.

---

## 2. Multi-Level Validation Audit Results

### Level 1: Schema Integrity
- **Status:** ✅ **PASS**
- **Verified Files:**
  - `projects_clean.csv`: 40 columns present, exact header match, non-empty.
  - `projects_raw.csv`: 40 columns present, exact header match.
  - `ml_ready_projects.csv`: 24 columns present, no target leakage.
  - `project_milestones.csv`: 9 columns present, correct foreign keys.
  - `project_progress.csv`: 5 columns present, chronological sequences.

### Level 2: Field Range & Domain Bounds
- **Status:** ✅ **PASS** (0 violations across 10,000 projects)
- **Rules Enforced:**
  - `project_id`: Format conforms to `^PRJ-[A-Z0-9]+-\d+$` (0 violations)
  - `original_cost_cr`: Value $\ge ₹150.00\text{ Cr}$ (0 violations)
  - `cumulative_expenditure_cr`: Value $\ge ₹0.00\text{ Cr}$ (0 violations)
  - `physical_progress_pct`: Value within $[0.00\%, 100.00\%]$ (0 violations)
  - `financial_progress_pct`: Value within $[0.00\%, 100.00\%]$ (0 violations)
  - Date validity: All dates conform to `YYYY-MM-DD` (0 violations)
  - Permitted enums: `project_status`, `project_stage`, `target_risk_class`, `primary_bottleneck` strictly confined to enumerated domains (0 violations).

### Level 3: Cross-Field Business Logic
- **Status:** ✅ **PASS** (0 violations across 10,000 projects)
- **Logic Rules Verified:**
  - Chronology: `planned_completion_date > start_date` (100% pass)
  - Schedule extension: `revised_completion_date >= planned_completion_date` (100% pass)
  - Expenditure ceiling: `cumulative_expenditure_cr <= revised_cost_cr + 0.05` (100% pass)
  - Overrun equation: `cost_overrun_cr == round(revised_cost_cr - original_cost_cr, 2)` (100% pass)
  - Decoupling equation: `progress_decoupling_gap == round(financial_progress_pct - physical_progress_pct, 2)` (100% pass)
  - Milestone capacity: `milestones_completed <= milestone_count` and `milestones_delayed <= milestone_count` (100% pass)
  - Commissioned status: All `COMPLETED` projects have `physical_progress_pct == 100.0%` (100% pass).

### Level 4: Referential Integrity
- **Status:** ✅ **PASS**
- **Orphan Check Results:**
  - Duplicate project IDs: **0**
  - Orphan milestone records: **0** (all 100,000 milestones link to a valid project ID)
  - Orphan progress records: **0** (all 9,000 progress records link to a valid project ID)

### Level 5: Statistical Sanity & Missingness
- **Status:** ✅ **PASS**
- **Missingness Profile:**
  - `projects_clean.csv`: **0.00%** missingness across all required fields.
  - `projects_raw.csv`: Controlled realistic real-world missingness:
    - `department`: 2.5% missing (simulating legacy data gaps)
    - `sub_sector`: 3.0% missing
    - `secondary_bottleneck`: 5.0% missing
    - Overall raw missingness: **0.18%** of total raw cells.
- **Distribution Sanity:**
  - No degenerate single-class collapse. Every sector, state, and risk class has robust statistical representation.

---

## 3. Corrupted Defect Test Suite Audit

To prove that the validator is active and capable of catching real-world data corruption, 12 intentional defects were evaluated (`data/test_cases/data_quality_test_cases.csv`).

**Detection Rate:** **100.0% (12 / 12 detected)**

| Case ID | Defect Injected | Detector Rule | Validation Outcome |
| :--- | :--- | :--- | :--- |
| `TC-ERR-0001` | Negative project cost (₹-250.0 Cr) | `original_cost_cr >= 150.0` | 🛑 **CAUGHT** |
| `TC-ERR-0002` | Cost below MoSPI threshold (₹45.0 Cr) | `original_cost_cr >= 150.0` | 🛑 **CAUGHT** |
| `TC-ERR-0003` | Expenditure exceeds revised cost (₹750 vs ₹500 Cr) | `expenditure <= revised_cost` | 🛑 **CAUGHT** |
| `TC-ERR-0004` | Physical progress > 100% (135.5%) | `physical_progress_pct <= 100` | 🛑 **CAUGHT** |
| `TC-ERR-0005` | Financial progress > 100% (142.0%) | `financial_progress_pct <= 100` | 🛑 **CAUGHT** |
| `TC-ERR-0006` | Inverted timeline: planned COD before start date | `planned_date > start_date` | 🛑 **CAUGHT** |
| `TC-ERR-0007` | Inverted timeline: revised COD before planned COD | `revised_date >= planned_date` | 🛑 **CAUGHT** |
| `TC-ERR-0008` | Duplicate Project ID (`PRJ-SYN-000001`) | Primary key uniqueness check | 🛑 **CAUGHT** |
| `TC-ERR-0009` | Completed milestones exceeds total (12 of 8) | `completed <= milestone_count` | 🛑 **CAUGHT** |
| `TC-ERR-0010` | Delayed milestones exceeds total (15 of 10) | `delayed <= milestone_count` | 🛑 **CAUGHT** |
| `TC-ERR-0011` | Invalid Ministry enum ("Ministry of Magic") | Sponsoring ministry validation | 🛑 **CAUGHT** |
| `TC-ERR-0012` | Invalid status enum ("SUPER_DELAYED") | Operational status check | 🛑 **CAUGHT** |
