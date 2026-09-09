# 🌐 ProjectPulse — Scenario REST API Specification (Phase 7)

**Product:** ProjectPulse — Infrastructure Project Risk Intelligence  
**Module:** Phase 7 Scenario & What-If Simulation API  
**Base Path:** `/api/scenarios`  
**Framework:** FastAPI / Pydantic v2  
**Authentication:** Standard Session / MoSPI Official Gateway  

---

## 1. Overview of Endpoints

| Method | Endpoint | Description | Latency SLA |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/scenarios/catalog` | Retrieves intervention categories, presets, and allowable feature bounds | `< 5 ms` |
| `POST` | `/api/scenarios/simulate` | Executes an in-memory counterfactual simulation without mutating project state | `< 35 ms` |
| `POST` | `/api/scenarios/sensitivity` | Executes a multi-point parameter sensitivity sweep (5–10 steps) | `< 120 ms` |
| `GET` | `/api/scenarios/{scenario_id}` | Retrieves a previously stored scenario and its comparative results | `< 5 ms` |
| `POST` | `/api/scenarios/{scenario_id}/save` | Persists an ephemeral simulation result with custom administrative notes | `< 10 ms` |
| `DELETE` | `/api/scenarios/{scenario_id}` | Deletes a stored scenario from audit history | `< 10 ms` |
| `POST` | `/api/scenarios/compare` | Compares and ranks up to 5 scenarios side-by-side | `< 25 ms` |
| `GET` | `/api/projects/{project_id}/scenarios` | Lists all saved scenario records for a given project ID | `< 10 ms` |

---

## 2. Endpoint Details & Schemas

### 2.1 `GET /api/scenarios/catalog`

Returns the official administrative intervention catalog, presets, allowable bounds, and non-causal legal disclaimers.

#### Response Example (`200 OK`):
```json
{
  "categories": [
    {
      "id": "STATUTORY_CLEARANCES",
      "name": "Statutory Clearances & Right-of-Way",
      "description": "Expedited inter-ministerial resolution of land, forest, and environmental clearances",
      "presets": [
        {
          "preset_id": "EXPEDITE_ROW_FOREST",
          "name": "Expedite Forest / Land Clearances",
          "modifications": [
            { "feature": "primary_bottleneck", "value": "NONE", "modification_type": "absolute" },
            { "feature": "milestones_delayed", "value": -2, "modification_type": "delta" }
          ]
        }
      ],
      "supported_features": ["primary_bottleneck", "milestones_delayed", "milestones_at_risk"]
    }
  ],
  "feature_bounds": {
    "milestones_delayed": { "min": 0, "max": 20, "type": "integer" },
    "physical_progress_pct": { "min": 0.0, "max": 100.0, "type": "float" },
    "cumulative_expenditure_cr": { "min": 0.0, "max": 200000.0, "type": "float" }
  },
  "disclaimer": "Simulations reflect sensitivity estimates derived from empirical PAIMANA training distributions. Counterfactual projections do not constitute operational guarantees or legal commitments."
}
```

---

### 2.2 `POST /api/scenarios/simulate`

Simulates the counterfactual impact of one or more parameter changes. Re-executes the Phase 4 prediction pipeline on a cloned snapshot.

#### Request Body:
```json
{
  "project_id": "PRJ-NHAI-001",
  "scenario_name": "Expedited Clearances + 5% Civil Push",
  "notes": "Hypothetical assessment for MoRTH Empowered Group review",
  "modifications": [
    { "feature": "primary_bottleneck", "value": "NONE", "modification_type": "absolute" },
    { "feature": "physical_progress_pct", "value": 5.0, "modification_type": "delta" },
    { "feature": "milestones_delayed", "value": -1, "modification_type": "delta" }
  ]
}
```

#### Response Example (`200 OK`):
```json
{
  "scenario_id": "SCN-PRJ-NHAI-001-A79F21B3",
  "project_id": "PRJ-NHAI-001",
  "scenario_name": "Expedited Clearances + 5% Civil Push",
  "created_at": "2026-09-08T09:15:20Z",
  "baseline": {
    "schedule_delay_months": 14.8,
    "cost_overrun_prob": 0.62,
    "implementation_distress_prob": 0.48,
    "composite_risk_score": 67.4,
    "risk_band": "HIGH"
  },
  "scenario": {
    "schedule_delay_months": 11.2,
    "cost_overrun_prob": 0.54,
    "implementation_distress_prob": 0.39,
    "composite_risk_score": 56.1,
    "risk_band": "MEDIUM"
  },
  "deltas": {
    "schedule_delay_months": -3.6,
    "cost_overrun_prob_pp": -8.0,
    "implementation_distress_prob_pp": -9.0,
    "composite_risk_score": -11.3,
    "risk_band_transition": "HIGH -> MEDIUM",
    "outcome_classification": "IMPROVED"
  },
  "warning_preview": {
    "summary": "Hypothetical risk band shifts from HIGH to MEDIUM under scenario assumptions.",
    "active_warnings_impact": "Active Phase 6 radar alerts remain authoritative and unchanged."
  },
  "assumptions_summary": [
    "primary_bottleneck set to NONE",
    "physical_progress_pct increased by 5.0%",
    "milestones_delayed decreased by 1"
  ],
  "disclaimer": "Simulations reflect sensitivity estimates derived from empirical PAIMANA training distributions. Counterfactual projections do not constitute operational guarantees or legal commitments."
}
```

---

### 2.3 `POST /api/scenarios/sensitivity`

Runs a parameterized sweep across a single numerical variable to plot sensitivity curves.

#### Request Body:
```json
{
  "project_id": "PRJ-NHAI-001",
  "feature": "physical_progress_pct",
  "min_val": 40.0,
  "max_val": 65.0,
  "steps": 6
}
```

#### Response Example (`200 OK`):
```json
{
  "project_id": "PRJ-NHAI-001",
  "feature": "physical_progress_pct",
  "baseline_val": 45.0,
  "curve": [
    { "val": 40.0, "risk_score": 71.2, "schedule_delay": 16.1, "cost_overrun_prob": 0.65 },
    { "val": 45.0, "risk_score": 67.4, "schedule_delay": 14.8, "cost_overrun_prob": 0.62 },
    { "val": 50.0, "risk_score": 62.0, "schedule_delay": 13.1, "cost_overrun_prob": 0.58 },
    { "val": 55.0, "risk_score": 57.3, "schedule_delay": 11.5, "cost_overrun_prob": 0.53 },
    { "val": 60.0, "risk_score": 52.8, "schedule_delay": 10.0, "cost_overrun_prob": 0.49 },
    { "val": 65.0, "risk_score": 48.9, "schedule_delay": 8.7, "cost_overrun_prob": 0.45 }
  ]
}
```

---

### 2.4 Error Handling & Status Codes

| Code | Meaning | Reason |
| :--- | :--- | :--- |
| `400 Bad Request` | Forbidden Target Feature | Modification attempted to alter `future_delay_days`, `revised_cost_cr`, etc. |
| `400 Bad Request` | Value Out of Range | Modification value violates catalog boundaries (e.g. negative delayed milestones). |
| `404 Not Found` | Unknown Project | Specified `project_id` does not exist in the database. |
| `422 Unprocessable` | Schema Mismatch | Missing required parameters or invalid modification types. |
