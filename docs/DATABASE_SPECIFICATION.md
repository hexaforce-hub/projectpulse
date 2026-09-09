# 🗄️ ProjectPulse — Relational Database Specification (Phase 3)

**Product:** ProjectPulse — Infrastructure Project Risk Intelligence  
**Sponsor Organization:** Ministry of Statistics and Programme Implementation (MoSPI)  
**Division:** Infrastructure and Project Monitoring Division (IPMD)  
**Reference Standard:** PAIMANA (Central Sector Projects costing ₹150 Cr+)  
**Storage Engine:** SQLite 3 (WAL Mode) / PostgreSQL-Ready ANSI SQL DDL  
**Database File:** `data/projectpulse.db` (32.5 MB)  
**Query Latency Benchmark:** **0.70 ms** average per indexed project lookup  

---

## 1. Architectural Overview

Phase 3 transitions ProjectPulse from static CSV flat files to a production-grade relational database architecture capable of supporting high-concurrency REST endpoints for FastAPI, interactive filtering for the frontend, and fast batch loading for machine learning models.

```
+-------------------------------------------------------------------------------+
|                      PHASE 2 CSV FOUNDATION                                   |
|   projects_clean.csv       project_milestones.csv      project_progress.csv   |
|     (10,000 rows)              (100,000 rows)              (9,000 rows)       |
+-------------------------------------------------------------------------------+
                                       │
                                       ▼ (scripts/ingest_to_db.py)
+-------------------------------------------------------------------------------+
|                    RELATIONAL DATABASE: data/projectpulse.db                  |
|                                                                               |
|   ┌────────────────────────────────┐       ┌──────────────────────────────┐   |
|   │         PROJECTS (10,000)      │◀──────│  PROJECT_MILESTONES(100,000) │   |
|   │ PK: project_id                 │ 1   * │ PK: milestone_id             │   |
|   │ (40 PAIMANA-modeled attributes)│       │ FK: project_id               │   |
|   └────────────────────────────────┘       └──────────────────────────────┘   |
|            ▲                      ▲                                           |
|            │ 1                    │ 1                                         |
|            │ *                    │ *                                         |
|   ┌────────────────────────┐   ┌──────────────────────────────┐               |
|   │ PROJECT_PROGRESS(9,000)│   │       ALERTS (9,256)         │               |
|   │ PK: id                 │   │ PK: alert_id                 │               |
|   │ FK: project_id         │   │ FK: project_id               │               |
|   └────────────────────────┘   └──────────────────────────────┘               |
+-------------------------------------------------------------------------------+
                                       │
                                       ▼ (database/db_client.py)
+-------------------------------------------------------------------------------+
|                      DATABASE CLIENT ACCESS LAYER                             |
|  - get_dashboard_summary() ──> Fast aggregate stats & risk distribution       |
|  - list_projects()         ──> Multi-filter paginated grid (<15ms)            |
|  - get_project(id)         ──> Full project entity with child milestones (<1ms)|
|  - list_alerts()           ──> Prioritized early warning queue (<10ms)        |
|  - get_analytics_summary() ──> Sector, Ministry & State aggregations          |
+-------------------------------------------------------------------------------+
```

---

## 2. Relational Schema Definition

### 2.1 Table: `projects`
Contains 40 normalized attributes representing the complete MoSPI IPMD project profile:
* **Primary Key:** `project_id TEXT` (e.g. `PRJ-SYN-000001`)
* **Identity & Governance:** `project_name`, `ministry`, `department`, `sector`, `sub_sector`, `state`, `region`, `implementing_agency`, `project_type`
* **Operational Status:** `project_status` (`ON_TRACK`, `AT_RISK`, `DELAYED`, `CRITICAL`, `COMPLETED`), `project_stage`
* **Financial Constraints:** `original_cost_cr` (≥ ₹150 Cr), `revised_cost_cr`, `cost_overrun_cr`, `cost_growth_pct`, `cumulative_expenditure_cr`
* **Progress Metrics:** `physical_progress_pct`, `financial_progress_pct`, `progress_decoupling_gap`
* **Schedules & Timelines:** `start_date`, `planned_completion_date`, `revised_completion_date`, `planned_duration_months`, `revised_duration_months`, `schedule_slippage_months`, `schedule_revisions_count`
* **Milestone Summary:** `milestone_count`, `milestones_completed`, `milestones_delayed`, `milestones_at_risk`, `milestone_delay_rate`
* **Friction & Bottlenecks:** `primary_bottleneck`, `secondary_bottleneck`
* **Ground-Truth Targets:** `target_schedule_delay_months`, `target_cost_overrun_pct`, `target_risk_class`
* **Composite Risk Index:** `overall_risk_score` (0.0 to 100.0)
* **Metadata:** `data_source`, `data_status`

### 2.2 Table: `project_milestones`
Tracks granular critical path events with institutional dependencies:
* **Primary Key:** `milestone_id TEXT` (e.g. `PRJ-SYN-000001-M-03`)
* **Foreign Key:** `project_id TEXT REFERENCES projects(project_id) ON DELETE CASCADE`
* **Attributes:** `milestone_name`, `sequence` (1 to 10), `planned_date`, `actual_date`, `status`, `delay_days`, `dependency_type` (`STATUTORY`, `LAND_ACQUISITION`, `CIVIL_WORKS`, `COMMISSIONING`, etc.)

### 2.3 Table: `project_progress`
Maintains historical time-series progression snapshots:
* **Primary Key:** `id INTEGER AUTOINCREMENT`
* **Foreign Key:** `project_id TEXT REFERENCES projects(project_id) ON DELETE CASCADE`
* **Attributes:** `reporting_date`, `reporting_month`, `physical_progress_pct`, `cumulative_expenditure_cr`

### 2.4 Table: `alerts`
Queue of active early warnings synthesized from risk scores, milestone slippage, and progress decoupling:
* **Primary Key:** `alert_id TEXT` (e.g. `ALT-00001`)
* **Foreign Key:** `project_id TEXT REFERENCES projects(project_id) ON DELETE CASCADE`
* **Attributes:** `project_name`, `severity` (`CRITICAL`, `HIGH`, `MODERATE`), `signal`, `detected_at`, `risk_change`, `status`

---

## 3. Performance & Indexing Optimization

To achieve sub-millisecond retrieval on large national infrastructure queries, 12 specialized B-Tree indexes were created:

| Index Name | Target Table | Indexed Columns | Query Acceleration Purpose |
| :--- | :--- | :--- | :--- |
| `idx_projects_ministry` | `projects` | `ministry` | Rapid filtering by sponsoring ministry |
| `idx_projects_sector` | `projects` | `sector` | Sectoral portfolio dashboards |
| `idx_projects_state` | `projects` | `state` | Geographic infrastructure heatmaps |
| `idx_projects_status` | `projects` | `project_status` | Operational status segmentation |
| `idx_projects_risk_class` | `projects` | `target_risk_class` | Filtering by risk tier (`CRITICAL`, `HIGH`) |
| `idx_projects_risk_score` | `projects` | `overall_risk_score` | Sorting projects by risk priority |
| `idx_projects_bottleneck` | `projects` | `primary_bottleneck` | Bottleneck impact analytics |
| `idx_projects_original_cost`| `projects` | `original_cost_cr` | Budget tier queries (Mega projects >₹1000 Cr) |
| `idx_milestones_project_id` | `project_milestones` | `project_id` | Instant project detail milestone join |
| `idx_progress_project_id` | `project_progress` | `project_id` | Time-series charting joins |
| `idx_alerts_severity` | `alerts` | `severity` | Filtering early warnings by urgency |
| `idx_alerts_project_id` | `alerts` | `project_id` | Project-specific alert lookups |

---

## 4. Benchmark Performance Metrics

Automated performance benchmarks executed via `tests/test_database.py`:
* **Single Project Lookup Latency:** **0.70 ms** average (Target: < 5 ms)
* **100 Consecutive Random Lookups:** **69.6 ms** total elapsed time
* **Multi-Attribute Filtered Pagination Query:** **6.2 ms** (Ministry + High Risk + Search)
* **Dashboard Portfolio Aggregation (10,000 projects):** **4.8 ms**
* **Orphan Records Across All Tables:** **0** (100% referential integrity)
