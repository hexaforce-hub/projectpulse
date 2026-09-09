-- ==========================================================================
-- ProjectPulse — Infrastructure Project Risk Intelligence
-- Sponsoring Ministry: Ministry of Statistics & Programme Implementation (MoSPI)
-- Division: Infrastructure & Project Monitoring Division (IPMD)
-- Database Schema: PAIMANA-Modeled Central Sector Infrastructure Relational Store
-- ==========================================================================

-- Enable Foreign Key enforcement
PRAGMA foreign_keys = ON;

-- --------------------------------------------------------------------------
-- 1. Primary Projects Table
-- Stores comprehensive baseline, progress, financial, and risk indicators
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
    project_id TEXT PRIMARY KEY,
    project_name TEXT NOT NULL,
    ministry TEXT NOT NULL,
    department TEXT,
    sector TEXT NOT NULL,
    sub_sector TEXT,
    state TEXT NOT NULL,
    region TEXT NOT NULL,
    implementing_agency TEXT NOT NULL,
    project_type TEXT NOT NULL,
    project_status TEXT NOT NULL,
    project_stage TEXT NOT NULL,
    original_cost_cr REAL NOT NULL,
    revised_cost_cr REAL NOT NULL,
    cost_overrun_cr REAL NOT NULL,
    cost_growth_pct REAL NOT NULL,
    cumulative_expenditure_cr REAL NOT NULL,
    physical_progress_pct REAL NOT NULL,
    financial_progress_pct REAL NOT NULL,
    progress_decoupling_gap REAL NOT NULL,
    start_date TEXT NOT NULL,
    planned_completion_date TEXT NOT NULL,
    revised_completion_date TEXT NOT NULL,
    planned_duration_months INTEGER NOT NULL,
    revised_duration_months INTEGER NOT NULL,
    schedule_slippage_months INTEGER NOT NULL,
    schedule_revisions_count INTEGER NOT NULL,
    milestone_count INTEGER NOT NULL,
    milestones_completed INTEGER NOT NULL,
    milestones_delayed INTEGER NOT NULL,
    milestones_at_risk INTEGER NOT NULL,
    milestone_delay_rate REAL NOT NULL,
    primary_bottleneck TEXT NOT NULL,
    secondary_bottleneck TEXT,
    target_schedule_delay_months INTEGER NOT NULL,
    target_cost_overrun_pct REAL NOT NULL,
    target_risk_class TEXT NOT NULL,
    overall_risk_score REAL NOT NULL,
    data_source TEXT NOT NULL,
    data_status TEXT NOT NULL
);

-- --------------------------------------------------------------------------
-- 2. Granular Milestones Table
-- Stores critical path milestone events with dependency classifications
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_milestones (
    milestone_id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    milestone_name TEXT NOT NULL,
    sequence INTEGER NOT NULL,
    planned_date TEXT NOT NULL,
    actual_date TEXT,
    status TEXT NOT NULL,
    delay_days INTEGER NOT NULL DEFAULT 0,
    dependency_type TEXT NOT NULL
);

-- --------------------------------------------------------------------------
-- 3. Time-Series Monthly Progress Table
-- Tracks historical progression of physical works and fund disbursement
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id TEXT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    reporting_date TEXT NOT NULL,
    reporting_month INTEGER NOT NULL,
    physical_progress_pct REAL NOT NULL,
    cumulative_expenditure_cr REAL NOT NULL
);

-- --------------------------------------------------------------------------
-- 4. Active Early Warning Alerts Table
-- Queue of detected execution friction signals for administrative review
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alerts (
    alert_id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    project_name TEXT NOT NULL,
    severity TEXT NOT NULL,
    signal TEXT NOT NULL,
    detected_at TEXT NOT NULL,
    risk_change TEXT NOT NULL,
    status TEXT NOT NULL
);

-- --------------------------------------------------------------------------
-- Performance B-Tree Indexes for Sub-10ms Fast Queries & Aggregations
-- --------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_projects_ministry ON projects(ministry);
CREATE INDEX IF NOT EXISTS idx_projects_sector ON projects(sector);
CREATE INDEX IF NOT EXISTS idx_projects_state ON projects(state);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(project_status);
CREATE INDEX IF NOT EXISTS idx_projects_risk_class ON projects(target_risk_class);
CREATE INDEX IF NOT EXISTS idx_projects_risk_score ON projects(overall_risk_score);
CREATE INDEX IF NOT EXISTS idx_projects_bottleneck ON projects(primary_bottleneck);
CREATE INDEX IF NOT EXISTS idx_projects_original_cost ON projects(original_cost_cr);

CREATE INDEX IF NOT EXISTS idx_milestones_project_id ON project_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_milestones_status ON project_milestones(status);

CREATE INDEX IF NOT EXISTS idx_progress_project_id ON project_progress(project_id);
CREATE INDEX IF NOT EXISTS idx_progress_reporting_date ON project_progress(reporting_date);

CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_project_id ON alerts(project_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
