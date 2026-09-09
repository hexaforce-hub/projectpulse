# 📑 ProjectPulse — Prediction API & Data Contract (Phase 4)

**Product:** ProjectPulse — Infrastructure Project Risk Intelligence  
**Sponsor:** Ministry of Statistics and Programme Implementation (MoSPI) / IPMD  
**Version:** `v1.0.0` | **Feature Set:** `features_v1`  

---

## 1. Single Project Prediction Endpoint

### `GET /api/predictions/project/{project_id}`
Retrieves pre-computed or on-demand model prediction for an indexed project.

#### Request Parameters
- `project_id` (path, required, string): Unique project identifier (e.g. `PRJ-SYN-000001`).

#### Success Response (`200 OK`)
```json
{
  "project_id": "PRJ-SYN-000001",
  "prediction_timestamp": "2026-09-07T14:55:00Z",
  "overall_risk_score": 79.4,
  "overall_risk_band": "CRITICAL",
  "schedule": {
    "probability": 0.8241,
    "risk_band": "HIGH",
    "predicted_delay_months": 24.3,
    "prediction_horizon": "future_project_outcome",
    "model_version": "schedule_v1"
  },
  "cost": {
    "probability": 0.7618,
    "risk_band": "HIGH",
    "predicted_overrun_pct": 27.85,
    "predicted_overrun_cr": 823.6,
    "model_version": "cost_v1"
  },
  "implementation": {
    "probability": 0.8415,
    "risk_band": "CRITICAL",
    "class_probabilities": {
      "LOW": 0.0215,
      "MODERATE": 0.1370,
      "HIGH": 0.3120,
      "CRITICAL": 0.5295
    },
    "model_version": "implementation_v1"
  },
  "prediction_quality": "HIGH",
  "data_quality_score": 96.5,
  "data_quality_warning": false,
  "model_versions": {
    "schedule": "schedule_v1",
    "cost": "cost_v1",
    "implementation": "implementation_v1"
  },
  "feature_set_version": "features_v1",
  "status": "success"
}
```

---

## 2. Ad-Hoc Project Snapshot Prediction Endpoint

### `POST /api/predictions/project`
Scores an arbitrary project snapshot dictionary for scenario evaluation or new project appraisal.

#### Request Body
```json
{
  "project_id": "PRJ-AD-HOC-001",
  "ministry": "Ministry of Railways",
  "sector": "Railways",
  "state": "Maharashtra",
  "region": "West",
  "implementing_agency": "RVNL",
  "project_type": "Greenfield",
  "original_cost_cr": 1850.0,
  "planned_duration_months": 48,
  "project_age_months": 24,
  "cumulative_expenditure_cr": 920.0,
  "physical_progress_pct": 36.5,
  "milestone_count": 12,
  "milestones_completed": 4,
  "milestones_delayed": 2,
  "milestones_at_risk": 1,
  "primary_bottleneck": "LAND_ACQUISITION"
}
```

---

## 3. Portfolio Summary Endpoint

### `GET /api/predictions/portfolio`
Returns macro predictive portfolio risk distribution and capital exposure.

#### Success Response (`200 OK`)
```json
{
  "total_projects": 10000,
  "risk_distribution": {
    "LOW": 3845,
    "MODERATE": 3273,
    "HIGH": 1999,
    "CRITICAL": 883
  },
  "average_risk_score": 42.6,
  "capital_at_risk_cr": 481240.5,
  "high_priority_projects_count": 2882,
  "data_quality_average": 94.2,
  "model_versions": {
    "schedule": "schedule_v1",
    "cost": "cost_v1",
    "implementation": "implementation_v1"
  }
}
```

---

## 4. Prediction Health Endpoint

### `GET /api/predictions/health`
```json
{
  "status": "healthy",
  "models_loaded": 3,
  "feature_set_version": "features_v1",
  "models": {
    "schedule": "schedule_v1",
    "cost": "cost_v1",
    "implementation": "implementation_v1"
  }
}
```
