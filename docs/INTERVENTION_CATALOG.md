# 📋 ProjectPulse — Intervention Catalog Specification (Phase 7)

**Product:** ProjectPulse — Infrastructure Project Risk Intelligence  
**Standard Compliance:** PAIMANA (Central Sector Projects costing ₹150 Cr+)  
**Config File Source:** [`config/interventions.yaml`](file:///c:/Users/SR/Documents/kishore/sih%20project/config/interventions.yaml)  
**Governance Hierarchy:** MoSPI IPMD / Line Ministries / Project Implementation Units (PIUs)  

---

## 1. Catalog Architecture & Purpose

In infrastructure project governance, interventions cannot be treated as abstract mathematical numbers. Real-world administrative actions fall into defined bureaucratic, statutory, and contractual levers.

The **ProjectPulse Intervention Catalog** maps high-level administrative decisions into specific, mathematically disciplined model parameter shifts. It enforces operational boundaries, defines pre-configured administrative packages ("presets"), and dictates how dependent features are recalculated.

---

## 2. The 5 Administrative Intervention Categories

```
+-----------------------------------------------------------------------------------+
|                        ADMINISTRATIVE INTERVENTION TAXONOMY                       |
+-----------------------------------------------------------------------------------+
| 1. STATUTORY CLEARANCES & ROW     -> Right-of-way, forest, environment, utilities |
| 2. MILESTONE MANAGEMENT           -> Fast-track recovery of delayed critical path  |
| 3. PROGRESS ACCELERATION          -> Manpower surge, double-shifting civil works  |
| 4. FINANCIAL GOVERNANCE           -> Capex rationalization, disbursement alignment |
| 5. CONTRACTOR GOVERNANCE          -> Penalty enforcement, tier-1 EPC replacement  |
+-----------------------------------------------------------------------------------+
```

---

## 3. Detailed Category Specifications

### Category 1: Statutory Clearances & Right-of-Way (`STATUTORY_CLEARANCES`)
* **Administrative Context:** Right-of-way handover and environmental approvals are the leading drivers of schedule escalation in road, rail, and port infrastructure.
* **Supported Levers:**
  * `primary_bottleneck`: Set to `NONE` upon inter-ministerial resolution.
  * `milestones_delayed`: Decremented as blocked clearance milestones are approved.
* **Presets:**
  * `EXPEDITE_ROW_FOREST`: Clears bottlenecks (`primary_bottleneck = 'NONE'`) and decrements delayed milestones by `2`.
  * `UTILITY_SHIFTING_PACKAGE`: Expedites statutory utility relocation (`milestones_delayed = -1`).

### Category 2: Milestone Management (`MILESTONE_MANAGEMENT`)
* **Administrative Context:** Intermediate milestone delivery governs critical-path civil momentum.
* **Supported Levers:**
  * `milestones_delayed`: Absolute or delta adjustment of delayed checkpoints.
  * `milestones_at_risk`: Reduction of flagged near-term milestone risks.
* **Derived Recalculation:**
  * Recomputing `milestone_delay_rate = milestones_delayed / total_milestones`.
* **Presets:**
  * `RECOVER_DELAYED_MILESTONES`: Recovers `2` delayed milestones via fast-tracked supervisory inspections.

### Category 3: Civil Progress Acceleration (`PROGRESS_ACCELERATION`)
* **Administrative Context:** Deploying additional heavy machinery, 24/7 double-shifting, or parallel tunneling/bridge works.
* **Supported Levers:**
  * `physical_progress_pct`: Incremental boost (e.g. `+5%`, `+10%`).
* **Operational Boundary:** Bounded strictly between current progress and `100.0%`.
* **Derived Recalculation:**
  * Recalculates `progress_decoupling_gap = interim_financial_progress_pct - physical_progress_pct`.
* **Presets:**
  * `CIVIL_WORKS_SURGE_5PCT`: Adds `+5.0%` physical progress.
  * `AGGRESSIVE_CATCHUP_10PCT`: Adds `+10.0%` physical progress (triggers high-assumption advisory).

### Category 4: Financial Governance (`FINANCIAL_GOVERNANCE`)
* **Administrative Context:** Accelerating billing verification or synchronizing contractor disbursement with on-site certified works.
* **Supported Levers:**
  * `cumulative_expenditure_cr`: Adjust expenditure to reflect audited disbursements.
* **Derived Recalculation:**
  * `interim_financial_progress_pct = (cumulative_expenditure_cr / original_cost_cr) * 100`.
  * `progress_decoupling_gap` recalculated.
* **Presets:**
  * `EXPENDITURE_ALIGNMENT`: Closes expenditure mismatch by aligning financial outlay with physical completion.

### Category 5: Contractor & Vendor Governance (`CONTRACTOR_GOVERNANCE`)
* **Administrative Context:** Enforcing liquidated damages, replacing underperforming sub-contractors, or injecting Tier-1 EPC supervisory management.
* **Supported Levers:**
  * `contractor_risk_tier`: Downgrading risk category (e.g., from `HIGH` to `MEDIUM` or `LOW`).
  * `milestones_at_risk`: Decremented by `1` to `3`.
* **Presets:**
  * `EPC_SUPERVISORY_INJECTION`: Lowers contractor risk tier to `LOW` and mitigates `2` at-risk checkpoints.

---

## 4. Forbidden Target Variables

To ensure scientific integrity and eliminate synthetic data leakage, the following target variables are **strictly prohibited** from manual modification:
1. `future_delay_days` (Phase 4 Schedule target)
2. `schedule_slippage_months` (Phase 4 Target)
3. `cost_overrun_pct` (Phase 4 Cost target)
4. `revised_cost_cr` (Directly determines cost overrun)
5. `composite_risk_score` (Synthetic aggregate)
6. `risk_band` (Derived classification)

Any simulation payload specifying a forbidden target returns an immediate `HTTP 400 Bad Request` with an explicit governance violation error.

---

## 5. Non-Causal Policy & Legal Disclaimer

All outputs generated through the intervention catalog enforce the standardized MoSPI decision-support disclaimer:

> **Official Disclaimer:**  
> *"Intervention simulations represent sensitivity projections computed using historical empirical distributions from the MoSPI PAIMANA database. Counterfactual estimates do not constitute legal assurances, administrative guarantees, or causal certainty. They are intended exclusively for comparative executive scenario prioritization."*
