-- ==========================================================================
-- ASTRA — Report Intelligence & Monthly Snapshot Relational Schema
-- Ministry of Statistics & Programme Implementation (MoSPI) • IPMD
-- Smart India Hackathon 2026 — Team HexaForce
-- ==========================================================================

PRAGMA foreign_keys = ON;

-- --------------------------------------------------------------------------
-- 1. Agencies Master Table
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS agencies (
    agency_id TEXT PRIMARY KEY,
    agency_name TEXT NOT NULL,
    parent_department TEXT,
    ministry TEXT NOT NULL,
    agency_type TEXT NOT NULL CHECK (agency_type IN ('PSU', 'STATUTORY_BODY', 'SPV', 'DEPARTMENTAL', 'CONCESSIONAIRE'))
);

CREATE INDEX IF NOT EXISTS idx_agencies_ministry ON agencies(ministry);
CREATE INDEX IF NOT EXISTS idx_agencies_type ON agencies(agency_type);

-- --------------------------------------------------------------------------
-- 2. Multi-State Project Mapping Table
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_states (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id TEXT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    state_name TEXT NOT NULL,
    is_primary INTEGER NOT NULL DEFAULT 1,
    source TEXT NOT NULL DEFAULT 'PAIMANA_FLASH_REPORT'
);

CREATE INDEX IF NOT EXISTS idx_project_states_project ON project_states(project_id);
CREATE INDEX IF NOT EXISTS idx_project_states_state ON project_states(state_name);

-- --------------------------------------------------------------------------
-- 3. Monthly Project Snapshots Table (April, May, June, July 2026 + Future)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_snapshots (
    snapshot_id TEXT PRIMARY KEY,
    snapshot_month TEXT NOT NULL, -- e.g. '2026-04', '2026-05', '2026-06', '2026-07'
    snapshot_year INTEGER NOT NULL DEFAULT 2026,
    project_id TEXT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    project_name TEXT NOT NULL,
    project_code TEXT,
    legacy_ocms_code TEXT,
    pmgid TEXT,
    ministry TEXT NOT NULL,
    sector TEXT NOT NULL,
    hml_category TEXT NOT NULL,
    state TEXT NOT NULL,
    agency TEXT NOT NULL,
    original_cost_cr REAL NOT NULL,
    revised_cost_cr REAL NOT NULL,
    cumulative_expenditure_cr REAL NOT NULL,
    physical_progress_pct REAL NOT NULL,
    financial_progress_pct REAL NOT NULL,
    start_date TEXT NOT NULL,
    planned_completion_date TEXT NOT NULL,
    revised_completion_date TEXT NOT NULL,
    project_status TEXT NOT NULL CHECK (project_status IN ('ONGOING', 'COMMISSIONED', 'NEWLY_ADDED')),
    project_classification TEXT NOT NULL CHECK (project_classification IN ('MAJOR', 'MEGA')),
    overall_risk_score REAL NOT NULL,
    target_risk_class TEXT NOT NULL CHECK (target_risk_class IN ('LOW', 'MODERATE', 'HIGH', 'CRITICAL')),
    primary_bottleneck TEXT,
    source_report TEXT NOT NULL,
    ingestion_date TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_snapshots_month ON project_snapshots(snapshot_month);
CREATE INDEX IF NOT EXISTS idx_snapshots_project ON project_snapshots(project_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_month_project ON project_snapshots(snapshot_month, project_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_month_ministry ON project_snapshots(snapshot_month, ministry);
CREATE INDEX IF NOT EXISTS idx_snapshots_month_sector ON project_snapshots(snapshot_month, sector);
CREATE INDEX IF NOT EXISTS idx_snapshots_month_state ON project_snapshots(snapshot_month, state);
CREATE INDEX IF NOT EXISTS idx_snapshots_month_hml ON project_snapshots(snapshot_month, hml_category);
CREATE INDEX IF NOT EXISTS idx_snapshots_month_class ON project_snapshots(snapshot_month, project_classification);
CREATE INDEX IF NOT EXISTS idx_snapshots_month_status ON project_snapshots(snapshot_month, project_status);
CREATE INDEX IF NOT EXISTS idx_snapshots_month_risk ON project_snapshots(snapshot_month, target_risk_class);

-- --------------------------------------------------------------------------
-- 4. Data Quality Observatory Flags Table (Rules DQ001 to DQ012)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS data_quality_flags (
    flag_id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    snapshot_month TEXT NOT NULL,
    rule_code TEXT NOT NULL, -- e.g. 'DQ001', 'DQ002'
    rule_name TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    details TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'HUMAN_REVIEW_REQUIRED',
    detected_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_dq_month ON data_quality_flags(snapshot_month);
CREATE INDEX IF NOT EXISTS idx_dq_project ON data_quality_flags(project_id);
CREATE INDEX IF NOT EXISTS idx_dq_rule ON data_quality_flags(rule_code);
CREATE INDEX IF NOT EXISTS idx_dq_severity ON data_quality_flags(severity);

-- --------------------------------------------------------------------------
-- 5. Model Evaluation & Benchmarking Table (CUF vs Enhanced & Stat vs ML)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS model_benchmarks (
    benchmark_id TEXT PRIMARY KEY,
    model_name TEXT NOT NULL,
    model_family TEXT NOT NULL, -- 'overall_risk', 'schedule_delay', 'cost_overrun'
    feature_tier TEXT NOT NULL CHECK (feature_tier IN ('CUF_ONLY', 'ASTRA_ENHANCED')),
    algorithm_type TEXT NOT NULL CHECK (algorithm_type IN ('STATISTICAL_BASELINE', 'MACHINE_LEARNING')),
    target_name TEXT NOT NULL,
    roc_auc REAL,
    pr_auc REAL,
    precision_score REAL,
    recall_score REAL,
    f1_macro REAL,
    mae REAL,
    rmse REAL,
    r2_score REAL,
    lead_time_months REAL,
    evaluation_dataset TEXT NOT NULL,
    evaluation_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE'
);

CREATE INDEX IF NOT EXISTS idx_mb_family ON model_benchmarks(model_family);
CREATE INDEX IF NOT EXISTS idx_mb_tier ON model_benchmarks(feature_tier);
CREATE INDEX IF NOT EXISTS idx_mb_algo ON model_benchmarks(algorithm_type);
