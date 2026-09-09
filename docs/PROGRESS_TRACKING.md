# Ground Progress Tracking & Physical Verification Queue
## Telemetry Ingestion, Site Geo-Tagging, and Resident Engineer Ratification

**Ministry of Statistics & Programme Implementation (MoSPI)**  
*ProjectPulse Infrastructure Risk Intelligence & Execution Platform*

---

## 1. Problem Statement: Telemetry Integrity
In many infrastructure tracking systems, progress reports are entered manually weeks after work occurs, or financial payouts are registered without verifying physical ground completion.

ProjectPulse implements a **two-tier physical quantity verification protocol**:
1. **Field Worker Submission (`USR-FIELD-01`)**: Site supervisors input daily output along with geo-coordinates, photos, and stratigraphy observations.
2. **Resident Engineer Ratification (`USR-ENGINEER-01`)**: Only after the designated PIU Resident Engineer physically checks core samples, density logs, or survey benchmarks does the quantity graduate to the official verified progress ledger.

---

## 2. Telemetry Ingestion Schema (`task_progress`)

```sql
CREATE TABLE task_progress (
    progress_id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    reported_by_user_id TEXT NOT NULL,
    reported_by_role TEXT NOT NULL,
    reported_date DATE NOT NULL,
    quantity_completed REAL NOT NULL,
    cumulative_quantity REAL DEFAULT 0.0,
    unit TEXT,
    work_hours REAL DEFAULT 8.0,
    labor_count INTEGER DEFAULT 0,
    equipment_operating_hours REAL DEFAULT 0.0,
    weather_condition TEXT DEFAULT 'CLEAR',
    verification_status TEXT DEFAULT 'PENDING_VERIFICATION', -- PENDING_VERIFICATION, VERIFIED, REJECTED
    verified_by_user_id TEXT,
    verified_at TIMESTAMP,
    rejection_reason TEXT,
    geo_latitude REAL,
    geo_longitude REAL,
    photo_evidence_url TEXT,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(task_id)
);
```

---

## 3. Verification Workflow & Ledger Credit

1. **Submission**:
   - Call: `POST /api/tasks/{task_id}/progress`
   - Payload: `{"quantity_completed": 0.5, "unit": "meters", "remarks": "Pneumatic reverse-circulation rig active"}`
   - Outcome: Record created in `task_progress` with `verification_status = 'PENDING_VERIFICATION'`.
2. **Queue Display**:
   - The Resident Engineer logs into `#/engineer` and views all pending items in the designated PIU corridor.
3. **Verification Decision**:
   - **Ratify**: `POST /api/progress/{progress_id}/verify` increments the official task `completed_quantity`, recalculates `actual_progress %`, and updates the corridor S-Curve.
   - **Reject**: `POST /api/progress/{progress_id}/reject` marks status as `REJECTED` with a mandatory deficiency notice (e.g. core sample failed compaction density).
