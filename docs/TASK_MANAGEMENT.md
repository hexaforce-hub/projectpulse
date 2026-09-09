# Operational Task Management & Quantity Accounting
## Schema, Lifecycle, and Granular Execution Protocols

**Ministry of Statistics & Programme Implementation (MoSPI)**  
*ProjectPulse Infrastructure Risk Intelligence & Execution Platform*

---

## 1. Relational Task Schema
The `tasks` table represents the atomic unit of field execution:

```sql
CREATE TABLE tasks (
    task_id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    work_package_id TEXT,
    milestone_id TEXT,
    site_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    task_type TEXT DEFAULT 'CONSTRUCTION',
    status TEXT DEFAULT 'TODO',
    priority TEXT DEFAULT 'MEDIUM',
    assigned_to_user_id TEXT,
    assigned_to_role TEXT,
    planned_start_date DATE,
    planned_end_date DATE,
    actual_start_date DATE,
    actual_end_date DATE,
    duration_days INTEGER DEFAULT 1,
    target_quantity REAL DEFAULT 0.0,
    completed_quantity REAL DEFAULT 0.0,
    unit TEXT DEFAULT 'units',
    target_period TEXT DEFAULT 'DAILY',
    planned_progress REAL DEFAULT 0.0,
    actual_progress REAL DEFAULT 0.0,
    source TEXT DEFAULT 'DOCUMENT_EXTRACTED',
    source_document TEXT,
    ai_generated INTEGER DEFAULT 0,
    ai_confidence REAL DEFAULT 1.0,
    approval_status TEXT DEFAULT 'APPROVED',
    verification_status TEXT DEFAULT 'VERIFIED',
    early_start INTEGER DEFAULT 0,
    early_finish INTEGER DEFAULT 0,
    late_start INTEGER DEFAULT 0,
    late_finish INTEGER DEFAULT 0,
    total_float INTEGER DEFAULT 0,
    free_float INTEGER DEFAULT 0,
    is_critical INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(project_id)
);
```

---

## 2. Task State Machine & Lifecycle Transitions

```
   [ TODO ]
      │
      │ (Field Team Starts Work)
      ▼
 [ IN_PROGRESS ] ◄──────────────┐
      │                         │
      ├──────(Ground Impediment)│ (Impediment Cleared)
      │                         │
      ▼                         │
  [ BLOCKED ] ──────────────────┘
      │
      │ (Physical Quantity Completed)
      ▼
 [ PENDING_VERIFICATION ]
      │
      ├──────(Engineer Rejects) ───► [ REJECTED ] ──► (Rework)
      │
      ▼ (Resident Engineer Verifies)
 [ COMPLETED ]
```

---

## 3. Physical Quantity Steppers & Telemetry Logging
- Site supervisors submit incremental daily physical production (e.g. +0.5 meters of well sinking, +950 cum of earthwork).
- The system prevents completed quantity from exceeding target quantity without formal scope variation approval.
- Each submission generates a cryptographically indexed entry in `task_progress`.
