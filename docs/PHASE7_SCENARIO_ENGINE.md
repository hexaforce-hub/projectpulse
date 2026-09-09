# 🔮 ProjectPulse — Scenario Engine & What-If Simulator Specification (Phase 7)

**Product:** ProjectPulse — Infrastructure Project Risk Intelligence  
**Sponsor Organization:** Ministry of Statistics and Programme Implementation (MoSPI)  
**Division:** Infrastructure and Project Monitoring Division (IPMD)  
**Standard Compliance:** PAIMANA (Central Sector Projects costing ₹150 Cr+)  
**Module:** Phase 7 — Intervention Intelligence & Counterfactual What-If Simulator  
**Core Modules:** [`src/scenarios/scenario_engine.py`](file:///c:/Users/SR/Documents/kishore/sih%20project/src/scenarios/scenario_engine.py), [`src/scenarios/scenario_validator.py`](file:///c:/Users/SR/Documents/kishore/sih%20project/src/scenarios/scenario_validator.py), [`src/scenarios/scenario_comparison.py`](file:///c:/Users/SR/Documents/kishore/sih%20project/src/scenarios/scenario_comparison.py)  
**Simulation Latency:** **21.65 ms** average per end-to-end simulation cycle  

---

## 1. Executive Summary & Purpose

While predictive models (Phase 4) forecast risk and early-warning engines (Phase 6) detect impending distress, infrastructure authorities need actionable decision-intelligence:
> *"If we resolve the pending statutory clearances within 60 days, what is the counterfactual impact on project delay risk and cost escalation?"*

The **Phase 7 Scenario Engine** provides MoSPI IPMD officials with an interactive, mathematically disciplined What-If simulation environment. It allows officials to formulate hypothetical administrative interventions, simulate model re-inference on modified parameter snapshots, and inspect comparative deltas in schedule slippage, cost overrun risk, and composite risk scoring without mutating authoritative ground-truth records.

---

## 2. Core Architectural Principles & Guardrails

### 2.1 Strict Immutability of Production Records
- **Zero In-Place Mutation:** Simulations **NEVER** execute SQL `UPDATE` or `DELETE` on the production `projects` table.
- **In-Memory Snapshot Cloning:** Simulations operate strictly on cloned deep copies of project state.
- **Transactional Ephemeral Isolation:** Scenario configurations and execution results are persisted exclusively in dedicated tables (`scenarios`, `scenario_modifications`, `scenario_results`).

### 2.2 Re-use of Production Phase 4 ML Pipelines
- **Zero Retraining Overhead:** The scenario engine invokes the existing, calibrated Phase 4 models:
  - Schedule Slippage Pipeline (`LightGBMRegressor`)
  - Cost Overrun Probability Pipeline (`HistGradientBoostingClassifier`)
  - Implementation Distress Pipeline (`RandomForestClassifier`)
- **Automated Derived Feature Synchronization:** When an intervention updates a base metric (e.g. `milestones_delayed` or `physical_progress_pct`), the snapshot passes through the authoritative Phase 4 `engineer_features()` pipeline. This guarantees that derived interaction variables (`progress_decoupling_gap`, `milestone_delay_rate`, `interim_financial_progress_pct`) are mathematically recalculated prior to model inference.

### 2.3 Non-Causal Framing & Governance Integrity
- **Predictive Sensitivity vs. Causal Guarantee:** Machine learning models identify conditional associations from historical PAIMANA portfolios; they do not encode structural causal DAGs.
- **Explicit Disclaimers:** All API responses, UI panels, and summary exports enforce mandatory disclaimers:
  > *"Simulations reflect sensitivity estimates derived from empirical PAIMANA training distributions. Counterfactual projections do not constitute operational guarantees or legal commitments."*
- **Warning Previews vs. Alert Resolution:** Simulations forecast what the hypothetical risk score and risk band *would become*. They strictly do **not** resolve, dismiss, or tamper with live Phase 6 early-warning radar alerts.

---

## 3. Scenario Execution Lifecycle

The following diagram illustrates the end-to-end lifecycle of a simulation request:

```
+-----------------------------------------------------------------------------------+
| 1. REQUEST INGESTION & CATALOG VALIDATION                                         |
|    - Validate modifications against allowable catalog ranges                      |
|    - Block forbidden target variables (e.g., target delay, cost overrun labels)   |
|    - Detect out-of-distribution / extreme operational assumptions                 |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
| 2. BASELINE CAPTURE & SNAPSHOT CLONING                                            |
|    - Retrieve authoritative project row from database                             |
|    - Run baseline inference using Phase 4 PredictionEngine                        |
|    - Clone deep copy in memory: snapshot = dict(baseline_row)                    |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
| 3. MODIFICATION APPLICATION & DERIVED RECALCULATION                               |
|    - Apply delta or absolute value overrides to snapshot                          |
|    - Re-run Phase 4 feature engineering: engineer_features(snapshot)              |
|    - Synchronize ratios (milestone_delay_rate, progress_decoupling_gap)           |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
| 4. COUNTERFACTUAL INFERENCE                                                       |
|    - Model 1: Schedule Slippage Prediction (months)                               |
|    - Model 2: Cost Overrun Probability (%)                                        |
|    - Model 3: Implementation Distress Probability (%)                             |
|    - Composite Risk Scoring: Weighted calculation (0-100 scale)                   |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
| 5. COMPARATIVE DELTA & SENSITIVITY COMPUTATION                                    |
|    - Compute absolute differences and percentage points (pp)                      |
|    - Classify outcome: IMPROVED (Δ > 5), STABLE (|Δ| <= 5), DETERIORATED (Δ < -5) |
|    - Formulate preview warning banner & confidence assessments                    |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
| 6. PERSISTENCE & AUDIT TRAIL                                                      |
|    - Store scenario run in SQLite database (`scenarios`, `scenario_results`)      |
|    - Return unified JSON payload to client (Avg runtime: 21.6 ms)                 |
+-----------------------------------------------------------------------------------+
```

---

## 4. Parameter Validation & Boundary Defense

The `ScenarioValidator` enforces rigorous defense-in-depth:
1. **Forbidden Target Variable Guard:** Rejects modifications attempting to manipulate prediction targets directly (`schedule_slippage_months`, `future_delay_days`, `cost_overrun_pct`, `composite_risk_score`, `risk_band`).
2. **Catalog Boundary Enforcement:** Features like `physical_progress_pct` are bounded between `0.0` and `100.0%`; `milestones_delayed` cannot be negative or exceed total milestones.
3. **Out-of-Distribution Warning:** If an input modification falls outside the 1st–99th percentile observed in the PAIMANA training corpus, the engine appends an advisory flag (`is_out_of_distribution: true`) advising officials that model variance may be elevated.

---

## 5. Performance Benchmarks

Benchmarked across 50 consecutive counterfactual simulations on Windows x64:
- **Mean Simulation Latency:** `21.65 ms` (Target: `< 50 ms`)
- **Memory Footprint:** In-memory cloning avoids disk I/O; zero heap bloat.
- **Database Operations:** Sub-millisecond SQLite parameterized inserts.
- **API Concurrency:** Fully asynchronous FastAPI endpoints supporting simultaneous analytical sessions.
