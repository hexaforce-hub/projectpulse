-- ==========================================================================
-- ASTRA — National Infrastructure Intelligence Platform
-- PostgreSQL Production Schema (Supabase Aligned)
-- Ministry of Statistics & Programme Implementation (MoSPI) • IPMD
-- ==========================================================================

CREATE SCHEMA IF NOT EXISTS public;

-- -------------------------------------------------------------
-- Table: users
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    user_id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    designation TEXT NOT NULL,
    division TEXT NOT NULL,
    ministry TEXT NOT NULL,
    role TEXT NOT NULL,
    scope_type TEXT NOT NULL,
    scope_value TEXT NOT NULL,
    badge TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TEXT NOT NULL
);


-- -------------------------------------------------------------
-- Table: agencies
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.agencies (
    agency_id TEXT PRIMARY KEY,
    agency_name TEXT NOT NULL,
    parent_department TEXT,
    ministry TEXT NOT NULL,
    agency_type TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_agencies_type ON public.agencies (agency_type);
CREATE INDEX IF NOT EXISTS idx_agencies_ministry ON public.agencies (ministry);

-- -------------------------------------------------------------
-- Table: projects
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
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
    original_cost_cr DOUBLE PRECISION NOT NULL,
    revised_cost_cr DOUBLE PRECISION NOT NULL,
    cost_overrun_cr DOUBLE PRECISION NOT NULL,
    cost_growth_pct DOUBLE PRECISION NOT NULL,
    cumulative_expenditure_cr DOUBLE PRECISION NOT NULL,
    physical_progress_pct DOUBLE PRECISION NOT NULL,
    financial_progress_pct DOUBLE PRECISION NOT NULL,
    progress_decoupling_gap DOUBLE PRECISION NOT NULL,
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
    milestone_delay_rate DOUBLE PRECISION NOT NULL,
    primary_bottleneck TEXT NOT NULL,
    secondary_bottleneck TEXT,
    target_schedule_delay_months INTEGER NOT NULL,
    target_cost_overrun_pct DOUBLE PRECISION NOT NULL,
    target_risk_class TEXT NOT NULL,
    overall_risk_score DOUBLE PRECISION NOT NULL,
    data_source TEXT NOT NULL,
    data_status TEXT NOT NULL,
    project_code TEXT,
    legacy_ocms_code TEXT,
    pmgid TEXT,
    hml_category TEXT,
    source_system TEXT DEFAULT 'PAIMANA',
    source_snapshot TEXT DEFAULT '2026-07',
    source_document TEXT DEFAULT 'FlashReport_July_2026.pdf',
    is_multi_state INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_projects_original_cost ON public.projects (original_cost_cr);
CREATE INDEX IF NOT EXISTS idx_projects_bottleneck ON public.projects (primary_bottleneck);
CREATE INDEX IF NOT EXISTS idx_projects_risk_score ON public.projects (overall_risk_score);
CREATE INDEX IF NOT EXISTS idx_projects_risk_class ON public.projects (target_risk_class);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects (project_status);
CREATE INDEX IF NOT EXISTS idx_projects_state ON public.projects (state);
CREATE INDEX IF NOT EXISTS idx_projects_sector ON public.projects (sector);
CREATE INDEX IF NOT EXISTS idx_projects_ministry ON public.projects (ministry);

-- -------------------------------------------------------------
-- Table: project_states
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.project_states (
    id SERIAL PRIMARY KEY,
    project_id TEXT NOT NULL,
    state_name TEXT NOT NULL,
    is_primary INTEGER NOT NULL DEFAULT 1,
    source TEXT NOT NULL DEFAULT 'PAIMANA_FLASH_REPORT',
    FOREIGN KEY (project_id) REFERENCES public.projects(project_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_project_states_state ON public.project_states (state_name);
CREATE INDEX IF NOT EXISTS idx_project_states_project ON public.project_states (project_id);

-- -------------------------------------------------------------
-- Table: project_snapshots
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.project_snapshots (
    snapshot_id TEXT PRIMARY KEY,
    snapshot_month TEXT NOT NULL,
    snapshot_year INTEGER NOT NULL DEFAULT 2026,
    project_id TEXT NOT NULL,
    project_name TEXT NOT NULL,
    project_code TEXT,
    legacy_ocms_code TEXT,
    pmgid TEXT,
    ministry TEXT NOT NULL,
    sector TEXT NOT NULL,
    hml_category TEXT NOT NULL,
    state TEXT NOT NULL,
    agency TEXT NOT NULL,
    original_cost_cr DOUBLE PRECISION NOT NULL,
    revised_cost_cr DOUBLE PRECISION NOT NULL,
    cumulative_expenditure_cr DOUBLE PRECISION NOT NULL,
    physical_progress_pct DOUBLE PRECISION NOT NULL,
    financial_progress_pct DOUBLE PRECISION NOT NULL,
    start_date TEXT NOT NULL,
    planned_completion_date TEXT NOT NULL,
    revised_completion_date TEXT NOT NULL,
    project_status TEXT NOT NULL,
    project_classification TEXT NOT NULL,
    overall_risk_score DOUBLE PRECISION NOT NULL,
    target_risk_class TEXT NOT NULL,
    primary_bottleneck TEXT,
    source_report TEXT NOT NULL,
    ingestion_date TEXT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES public.projects(project_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_snapshots_month_risk ON public.project_snapshots (snapshot_month, target_risk_class);
CREATE INDEX IF NOT EXISTS idx_snapshots_month_status ON public.project_snapshots (snapshot_month, project_status);
CREATE INDEX IF NOT EXISTS idx_snapshots_month_class ON public.project_snapshots (snapshot_month, project_classification);
CREATE INDEX IF NOT EXISTS idx_snapshots_month_hml ON public.project_snapshots (snapshot_month, hml_category);
CREATE INDEX IF NOT EXISTS idx_snapshots_month_state ON public.project_snapshots (snapshot_month, state);
CREATE INDEX IF NOT EXISTS idx_snapshots_month_sector ON public.project_snapshots (snapshot_month, sector);
CREATE INDEX IF NOT EXISTS idx_snapshots_month_ministry ON public.project_snapshots (snapshot_month, ministry);
CREATE INDEX IF NOT EXISTS idx_snapshots_month_project ON public.project_snapshots (snapshot_month, project_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_project ON public.project_snapshots (project_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_month ON public.project_snapshots (snapshot_month);

-- -------------------------------------------------------------
-- Table: project_milestones
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.project_milestones (
    milestone_id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    milestone_name TEXT NOT NULL,
    sequence INTEGER NOT NULL,
    planned_date TEXT NOT NULL,
    actual_date TEXT,
    status TEXT NOT NULL,
    delay_days INTEGER NOT NULL DEFAULT 0,
    dependency_type TEXT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES public.projects(project_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_milestones_status ON public.project_milestones (status);
CREATE INDEX IF NOT EXISTS idx_milestones_project_id ON public.project_milestones (project_id);

-- -------------------------------------------------------------
-- Table: project_progress
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.project_progress (
    id SERIAL PRIMARY KEY,
    project_id TEXT NOT NULL,
    reporting_date TEXT NOT NULL,
    reporting_month INTEGER NOT NULL,
    physical_progress_pct DOUBLE PRECISION NOT NULL,
    cumulative_expenditure_cr DOUBLE PRECISION NOT NULL,
    FOREIGN KEY (project_id) REFERENCES public.projects(project_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_progress_reporting_date ON public.project_progress (reporting_date);
CREATE INDEX IF NOT EXISTS idx_progress_project_id ON public.project_progress (project_id);

-- -------------------------------------------------------------
-- Table: alerts
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.alerts (
    alert_id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    project_name TEXT NOT NULL,
    severity TEXT NOT NULL,
    signal TEXT NOT NULL,
    detected_at TEXT NOT NULL,
    risk_change TEXT NOT NULL,
    status TEXT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES public.projects(project_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_alerts_status ON public.alerts (status);
CREATE INDEX IF NOT EXISTS idx_alerts_project_id ON public.alerts (project_id);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON public.alerts (severity);

-- -------------------------------------------------------------
-- Table: data_quality_flags
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.data_quality_flags (
    flag_id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    snapshot_month TEXT NOT NULL,
    rule_code TEXT NOT NULL,
    rule_name TEXT NOT NULL,
    severity TEXT NOT NULL,
    details TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'HUMAN_REVIEW_REQUIRED',
    detected_at TEXT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES public.projects(project_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_dq_severity ON public.data_quality_flags (severity);
CREATE INDEX IF NOT EXISTS idx_dq_rule ON public.data_quality_flags (rule_code);
CREATE INDEX IF NOT EXISTS idx_dq_project ON public.data_quality_flags (project_id);
CREATE INDEX IF NOT EXISTS idx_dq_month ON public.data_quality_flags (snapshot_month);

-- -------------------------------------------------------------
-- Table: sites
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sites (
    site_id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    name TEXT NOT NULL,
    location TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    status TEXT DEFAULT 'ACTIVE',
    FOREIGN KEY (project_id) REFERENCES public.projects(project_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sites_project ON public.sites (project_id);

-- -------------------------------------------------------------
-- Table: execution_plans
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.execution_plans (
    plan_id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'DRAFT',
    generated_by TEXT NOT NULL,
    approved_by TEXT,
    approved_at TEXT,
    source_basis TEXT DEFAULT 'DOCUMENT_EXTRACTED',
    confidence_score DOUBLE PRECISION DEFAULT 0.85,
    summary TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES public.projects(project_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_exec_plans_project ON public.execution_plans (project_id);

-- -------------------------------------------------------------
-- Table: work_packages
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.work_packages (
    package_id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    plan_id TEXT,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    weightage_pct DOUBLE PRECISION DEFAULT 0.0,
    planned_start TEXT,
    planned_end TEXT,
    actual_start TEXT,
    actual_end TEXT,
    status TEXT NOT NULL DEFAULT 'NOT_STARTED',
    site_id TEXT,
    FOREIGN KEY (plan_id) REFERENCES public.execution_plans(plan_id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES public.projects(project_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_work_packages_project ON public.work_packages (project_id);

-- -------------------------------------------------------------
-- Table: tasks
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tasks (
    task_id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    milestone_id TEXT,
    site_id TEXT,
    assigned_to TEXT NOT NULL,
    task_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT NOT NULL,
    status TEXT NOT NULL,
    due_date TEXT NOT NULL,
    completed_at TEXT,
    evidence_url TEXT,
    remarks TEXT,
    work_package_id TEXT,
    parent_task_id TEXT,
    planned_start TEXT,
    planned_end TEXT,
    actual_start TEXT,
    actual_end TEXT,
    target_quantity DOUBLE PRECISION DEFAULT 0.0,
    completed_quantity DOUBLE PRECISION DEFAULT 0.0,
    unit TEXT DEFAULT 'units',
    target_period TEXT DEFAULT 'DAILY',
    planned_progress DOUBLE PRECISION DEFAULT 0.0,
    actual_progress DOUBLE PRECISION DEFAULT 0.0,
    source TEXT DEFAULT 'HUMAN',
    source_document TEXT,
    ai_generated INTEGER DEFAULT 0,
    ai_confidence DOUBLE PRECISION DEFAULT 1.0,
    approval_status TEXT DEFAULT 'APPROVED',
    verification_status TEXT DEFAULT 'UNVERIFIED',
    early_start INTEGER DEFAULT 0,
    early_finish INTEGER DEFAULT 0,
    late_start INTEGER DEFAULT 0,
    late_finish INTEGER DEFAULT 0,
    total_float INTEGER DEFAULT 0,
    is_critical INTEGER DEFAULT 0,
    FOREIGN KEY (assigned_to) REFERENCES public.users(user_id),
    FOREIGN KEY (project_id) REFERENCES public.projects(project_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tasks_target_period ON public.tasks (target_period);
CREATE INDEX IF NOT EXISTS idx_tasks_work_package ON public.tasks (work_package_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks (status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks (assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks (project_id);

-- -------------------------------------------------------------
-- Table: task_dependencies
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.task_dependencies (
    dependency_id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    predecessor_task_id TEXT NOT NULL,
    successor_task_id TEXT NOT NULL,
    dependency_type TEXT NOT NULL DEFAULT 'FS',
    lag_days INTEGER NOT NULL DEFAULT 0,
    is_critical INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (successor_task_id) REFERENCES public.tasks(task_id) ON DELETE CASCADE,
    FOREIGN KEY (predecessor_task_id) REFERENCES public.tasks(task_id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES public.projects(project_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_deps_succ ON public.task_dependencies (successor_task_id);
CREATE INDEX IF NOT EXISTS idx_deps_pred ON public.task_dependencies (predecessor_task_id);
CREATE INDEX IF NOT EXISTS idx_deps_project ON public.task_dependencies (project_id);

-- -------------------------------------------------------------
-- Table: task_progress
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.task_progress (
    progress_id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    project_id TEXT NOT NULL,
    report_date TEXT NOT NULL,
    quantity_completed DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    unit TEXT,
    progress_pct DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    notes TEXT,
    evidence_url TEXT,
    submitted_by TEXT NOT NULL,
    submitted_at TEXT NOT NULL,
    verification_status TEXT NOT NULL DEFAULT 'PENDING',
    verified_by TEXT,
    verified_at TEXT,
    rejection_reason TEXT,
    blocker_flag INTEGER DEFAULT 0,
    blocker_category TEXT,
    FOREIGN KEY (verified_by) REFERENCES public.users(user_id),
    FOREIGN KEY (submitted_by) REFERENCES public.users(user_id),
    FOREIGN KEY (project_id) REFERENCES public.projects(project_id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES public.tasks(task_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_progress_status ON public.task_progress (verification_status);
CREATE INDEX IF NOT EXISTS idx_progress_proj ON public.task_progress (project_id);
CREATE INDEX IF NOT EXISTS idx_progress_task ON public.task_progress (task_id);

-- -------------------------------------------------------------
-- Table: issues
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.issues (
    issue_id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    milestone_id TEXT,
    reported_by TEXT NOT NULL,
    category TEXT NOT NULL,
    severity TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL,
    assigned_to TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT,
    resolution TEXT,
    evidence TEXT,
    FOREIGN KEY (reported_by) REFERENCES public.users(user_id),
    FOREIGN KEY (project_id) REFERENCES public.projects(project_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_issues_status ON public.issues (status);
CREATE INDEX IF NOT EXISTS idx_issues_project_id ON public.issues (project_id);

-- -------------------------------------------------------------
-- Table: documents
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.documents (
    document_id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    document_type TEXT NOT NULL,
    title TEXT NOT NULL,
    file_path TEXT NOT NULL,
    uploaded_by TEXT NOT NULL,
    uploaded_at TEXT NOT NULL,
    version TEXT NOT NULL,
    access_scope TEXT NOT NULL,
    file_size_kb INTEGER NOT NULL,
    FOREIGN KEY (project_id) REFERENCES public.projects(project_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_documents_project_id ON public.documents (project_id);

-- -------------------------------------------------------------
-- Table: directives
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.directives (
    directive_id TEXT PRIMARY KEY,
    issued_by TEXT NOT NULL,
    issuer_role TEXT NOT NULL,
    target_scope TEXT NOT NULL,
    target_id TEXT NOT NULL,
    title TEXT NOT NULL,
    instructions TEXT NOT NULL,
    priority TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    compliance_notes TEXT
);


-- -------------------------------------------------------------
-- Table: notifications
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    notification_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    project_id TEXT,
    read_status INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications (user_id);

-- -------------------------------------------------------------
-- Table: project_assignments
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.project_assignments (
    assignment_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    project_id TEXT NOT NULL,
    assignment_role TEXT NOT NULL,
    site_id TEXT,
    start_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    FOREIGN KEY (project_id) REFERENCES public.projects(project_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_assignments_project_id ON public.project_assignments (project_id);
CREATE INDEX IF NOT EXISTS idx_assignments_user_id ON public.project_assignments (user_id);

-- -------------------------------------------------------------
-- Table: scenarios
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.scenarios (
    scenario_id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    scenario_name TEXT NOT NULL,
    scenario_description TEXT,
    status TEXT NOT NULL DEFAULT 'SIMULATED',
    created_by TEXT NOT NULL DEFAULT 'IPMD Officer',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    model_version TEXT NOT NULL,
    feature_set_version TEXT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES public.projects(project_id) ON DELETE CASCADE
);


-- -------------------------------------------------------------
-- Table: scenario_modifications
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.scenario_modifications (
    id SERIAL PRIMARY KEY,
    scenario_id TEXT NOT NULL,
    feature_name TEXT NOT NULL,
    baseline_value DOUBLE PRECISION,
    scenario_value DOUBLE PRECISION,
    baseline_str TEXT,
    scenario_str TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (scenario_id) REFERENCES public.scenarios(scenario_id) ON DELETE CASCADE
);


-- -------------------------------------------------------------
-- Table: scenario_results
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.scenario_results (
    scenario_id TEXT PRIMARY KEY,
    baseline_prediction TEXT NOT NULL,
    scenario_prediction TEXT NOT NULL,
    risk_delta DOUBLE PRECISION NOT NULL,
    schedule_delta DOUBLE PRECISION NOT NULL,
    cost_delta DOUBLE PRECISION NOT NULL,
    implementation_delta DOUBLE PRECISION NOT NULL,
    prediction_quality TEXT NOT NULL,
    assumptions TEXT NOT NULL,
    result_summary TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (scenario_id) REFERENCES public.scenarios(scenario_id) ON DELETE CASCADE
);


-- -------------------------------------------------------------
-- Table: model_benchmarks
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.model_benchmarks (
    benchmark_id TEXT PRIMARY KEY,
    model_name TEXT NOT NULL,
    model_family TEXT NOT NULL,
    feature_tier TEXT NOT NULL,
    algorithm_type TEXT NOT NULL,
    target_name TEXT NOT NULL,
    roc_auc DOUBLE PRECISION,
    pr_auc DOUBLE PRECISION,
    precision_score DOUBLE PRECISION,
    recall_score DOUBLE PRECISION,
    f1_macro DOUBLE PRECISION,
    mae DOUBLE PRECISION,
    rmse DOUBLE PRECISION,
    r2_score DOUBLE PRECISION,
    lead_time_months DOUBLE PRECISION,
    evaluation_dataset TEXT NOT NULL,
    evaluation_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE'
);

CREATE INDEX IF NOT EXISTS idx_mb_algo ON public.model_benchmarks (algorithm_type);
CREATE INDEX IF NOT EXISTS idx_mb_tier ON public.model_benchmarks (feature_tier);
CREATE INDEX IF NOT EXISTS idx_mb_family ON public.model_benchmarks (model_family);

-- -------------------------------------------------------------
-- Table: audit_logs
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
    log_id SERIAL PRIMARY KEY,
    timestamp TEXT NOT NULL,
    actor TEXT NOT NULL,
    role TEXT NOT NULL,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    status TEXT NOT NULL,
    details TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_resource ON public.audit_logs (resource);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON public.audit_logs (timestamp);
