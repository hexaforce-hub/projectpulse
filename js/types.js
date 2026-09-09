// ==========================================================================
// PROJECTPULSE — Data Contracts & TypeScript-grade JSDoc Definitions
// Ministry of Statistics & Programme Implementation (MoSPI) - IPMD
// This file formalizes the exact schema for Phase 1 and future FastAPI endpoints.
// ==========================================================================

/**
 * @typedef {Object} Financials
 * @property {number} original_cost_cr - Initial sanctioned cost in ₹ Crores
 * @property {number} revised_cost_cr - Current revised anticipated cost in ₹ Crores
 * @property {number} cumulative_expenditure_cr - Total expenditure incurred so far in ₹ Crores
 * @property {number} cost_overrun_cr - Calculated cost growth (revised - original) in ₹ Crores
 */

/**
 * @typedef {Object} Progress
 * @property {number} physical_progress_pct - Actual reported physical completion (0-100)
 * @property {number} financial_progress_pct - Cumulative expenditure as % of revised cost
 * @property {number} progress_gap_pct - Decoupling gap (financial_progress - physical_progress)
 */

/**
 * @typedef {Object} Schedule
 * @property {string} start_date - Original sanctioned start date (YYYY-MM)
 * @property {string} planned_completion_date - Baseline planned completion (YYYY-MM)
 * @property {string} revised_completion_date - Current revised expected completion (YYYY-MM)
 * @property {number} delay_duration_months - Months elapsed beyond planned date
 * @property {number} schedule_revisions_count - Number of formal schedule extensions
 */

/**
 * @typedef {Object} Milestone
 * @property {string} id - Milestone unique code (e.g. "M-01")
 * @property {string} name - Milestone description
 * @property {string} planned_date - Target completion date
 * @property {"Completed" | "On Track" | "At Risk" | "Delayed"} status - Operational status
 * @property {number} delay_days - Days delayed beyond target
 * @property {string} dependency - Dependency constraints (e.g. "Forest Clearance", "Contractor")
 */

/**
 * @typedef {Object} RiskDriver
 * @property {number} rank - Priority order (1, 2, 3...)
 * @property {string} name - Driver title (e.g. "Expenditure / Progress Mismatch")
 * @property {number} strength_pct - Relative impact attribution percentage
 * @property {string} evidence - Observed data supporting this driver
 */

/**
 * @typedef {Object} ObservedSignal
 * @property {string} label - Signal name
 * @property {string | number} value - Signal observed value
 * @property {string} context - Contextual interpretation
 */

/**
 * @typedef {Object} RiskAssessment
 * @property {number} overall_score - Composite risk score (0-100)
 * @property {"LOW" | "MODERATE" | "HIGH" | "CRITICAL"} level - Categorized severity
 * @property {number} schedule_score - Predicted schedule risk score (0-100)
 * @property {number} cost_score - Predicted cost escalation risk score (0-100)
 * @property {number} implementation_score - Implementation bottleneck severity (0-100)
 * @property {string} primary_driver - Main driving reason
 * @property {RiskDriver[]} drivers - Detailed risk driver breakdown
 * @property {ObservedSignal[]} observed_signals - Direct empirical evidence
 * @property {string} attribution_note - Disclaimer ("Illustrative model output for prototype")
 */

/**
 * @typedef {Object} Metadata
 * @property {string} data_source - Source system ("PAIMANA / OCMS Process Schema")
 * @property {"SYNTHETIC" | "DEMO" | "LIVE" | "STALE"} data_status - Integrity status
 * @property {string} last_updated - ISO or human timestamp
 */

/**
 * @typedef {Object} Project
 * @property {string} project_id - Stable project identifier (e.g. "PRJ-DEMO-001")
 * @property {string} project_name - Full official name of infrastructure project
 * @property {string} ministry - Responsible Central Ministry (e.g. "Ministry of Road Transport and Highways")
 * @property {string} department - Line department / division
 * @property {string} sector - Sector classification (e.g. "Roads & Highways", "Railways")
 * @property {string} state - Geographic state / union territory
 * @property {string} implementing_agency - Agency executing the work (e.g. "NHAI", "NTPC")
 * @property {string} status - Project lifecycle status ("Ongoing", "Delayed", "Commissioned")
 * @property {Financials} financials - Financial audit records
 * @property {Progress} progress - Physical and financial progress
 * @property {Schedule} schedule - Timeline schedules
 * @property {Milestone[]} milestones - Milestones list
 * @property {RiskAssessment} risk - Risk scoring and drivers
 * @property {Metadata} metadata - Audit metadata
 */

/**
 * @typedef {Object} Alert
 * @property {string} alert_id - Unique alert code (e.g. "ALT-2026-01")
 * @property {string} project_id - Foreign key to Project
 * @property {string} project_name - Name for quick display
 * @property {"CRITICAL" | "HIGH" | "MODERATE" | "LOW"} severity - Alert urgency
 * @property {string} signal - Trigger reason (e.g. "Physical progress significantly below expenditure trajectory")
 * @property {string} detected_at - Timestamp of trigger
 * @property {string} risk_change - Trend delta (e.g. "+18 points")
 * @property {"Requires Review" | "Under Investigation" | "Escalated" | "Resolved"} status - Action status
 */

/**
 * @typedef {Object} DashboardSummary
 * @property {number} tracked_projects_count - Total projects in portfolio (e.g. 1987)
 * @property {string} tracked_projects_subtext - Card subtitle
 * @property {string} total_revised_cost_formatted - Formatted portfolio exposure (e.g. "₹42.5L Cr")
 * @property {number} projects_requiring_review_count - Count of elevated risk projects (e.g. 128)
 * @property {string} capital_at_risk_formatted - Estimated exposure at risk (e.g. "₹3.4L Cr")
 * @property {Object} risk_distribution - Distribution counts { low, moderate, high, critical }
 * @property {string} last_updated - Freshness label
 * @property {Metadata} metadata - Data status metadata
 */

// Export dummy object for JS environments
window.PROJECTPULSE_TYPES = true;
