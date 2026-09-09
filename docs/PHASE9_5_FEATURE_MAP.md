# PROJECTPULSE — Phase 9.5 Complete Feature Map & Data Contracts
## Ministry of Statistics & Programme Implementation (MoSPI) — IPMD / PAIMANA
### Smart India Hackathon 2026 — Problem Statement SIH26103 | Team HexaForce

---

## 1. Complete Architecture & Route Map

| Route | View Component | Description | Primary Data Source |
|---|---|---|---|
| `#/dashboard` | `DashboardView.js` | National Command Center with 5 telemetry metrics, risk donut, sector bars, friction cards, and priority queue | `GET /api/dashboard/summary`, `GET /api/projects` |
| `#/portfolio-matrix` | `PortfolioMatrixView.js` | Interactive 2D scatter quadrant map (Risk Score vs Capital Exposure) with hover tooltips | `GET /api/portfolio/matrix?limit=250` |
| `#/projects` | `ProjectsView.js` | Multi-parameter filtered project catalog with pagination (search, ministry, risk, bottleneck, state) | `GET /api/projects` |
| `#/projects/:id` | `ProjectDetailView.js` | Complete project intelligence dossier with TreeSHAP explanations, decoupling bar, milestones, and What-If simulator | `GET /api/projects/:id`, `POST /api/simulate` |
| `#/early-warnings` | `EarlyWarningsView.js` | Early warning alert triage radar with severity filtering and triage workflows (Acknowledge / Review / Resolve) | `GET /api/alerts`, `PATCH /api/alerts/:id/status` |
| `#/bottlenecks` | `BottleneckView.js` | Systemic root cause intelligence across 6 structural bottleneck categories with 1-click project drilldown | `GET /api/projects?bottleneck=...` |
| `#/analytics` | `AnalyticsView.js` | Macro portfolio analytics, cost overrun distribution, milestone completion velocities, and state distributions | `GET /api/analytics/summary` |
| `#/compare` | `ProjectCompareView.js` | Side-by-side comparative benchmarking of 2 projects across 10 analytical dimensions | `GET /api/projects/:id` |
| `#/data-quality` | `DataQualityView.js` | PAIMANA data contract integrity checks, decoupling gap distribution, and audit log table | `GET /api/projects?sort_by=progress_decoupling_gap` |
| `#/settings` | `SettingsView.js` | Role-based access control administration, institutional audit trail, and engine health diagnostics | `GET /api/audit`, `GET /api/health` |

---

## 2. API Contract Specifications

### 2.1 `GET /api/portfolio/matrix`
- **Query Parameters**:
  - `limit` (integer, optional, default: 250): Number of megaprojects to return, ordered by `revised_cost_cr DESC`.
- **Response Contract**:
  ```json
  {
    "status": "success",
    "total": 250,
    "matrix": [
      {
        "project_id": "PRJ-DEMO-001",
        "project_name": "NH-44 Strategic Corridor Development Project",
        "ministry": "Ministry of Road Transport and Highways",
        "sector": "Roads & Highways",
        "state": "Telangana / Andhra Pradesh",
        "revised_cost_cr": 1840.5,
        "cost_overrun_cr": 590.5,
        "overall_risk_score": 82.0,
        "target_risk_class": "HIGH",
        "schedule_slippage_months": 20.0,
        "progress_decoupling_gap": 37.5,
        "primary_bottleneck": "land_acquisition"
      }
    ]
  }
  ```

### 2.2 `GET /api/projects`
- **Query Parameters**:
  - `search` (string, optional): Substring search on `project_name`, `project_id`, or `implementing_agency`.
  - `ministry` (string, optional): Exact filter by central ministry name.
  - `sector` (string, optional): Exact filter by infrastructure sector.
  - `risk_tier` / `risk_level` (string, optional): One of `LOW`, `MODERATE`, `HIGH`, `CRITICAL`.
  - `bottleneck` (string, optional): Substring or slug filter matching `primary_bottleneck` (e.g. `land_acquisition`, `clearance_impasse`).
  - `state` (string, optional): Filter by state jurisdiction.
  - `page` (integer, optional, default: 1): 1-indexed page.
  - `page_size` (integer, optional, default: 20): Items per page.
  - `sort_by` (string, optional, default: `overall_risk_score`): Validated sort column.
  - `sort_order` (string, optional, default: `desc`): `asc` or `desc`.

---

## 3. RBAC Permission Matrix

| Role | Dashboard & Matrix | Projects Registry | Early Warning Triage | What-If Simulator Run | What-If Record Save | Audit Trail | System Settings |
|---|---|---|---|---|---|---|---|
| **Admin** (`Dr. Rajesh Kumar`) | Full | Full | Full (Ack/Review/Resolve) | Full | Full | Full | Full |
| **Monitoring Officer** (`Smt. Priya Sharma`) | Full | Full | Full (Ack/Review/Resolve) | Full | Full | Read | Read |
| **Analyst** (`Shri Amitav Ghosh`) | Full | Full | Read-Only | Full | Full | Read | Read |
| **Viewer** (`Shri Vikram Mehta`) | Full | Full | Read-Only | Simulation Only | Forbidden | Hidden | Hidden |
