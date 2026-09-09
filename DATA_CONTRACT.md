# 📜 PROJECTPULSE — Data Contract & API Specification
**Product:** ProjectPulse — Infrastructure Project Risk Intelligence  
**Standard:** FastAPI / JSON Schema REST Contract  
**Schema Mapping:** MoSPI PAIMANA / OCMS Central Sector Infrastructure Format

---

## 1. Primary Entity Schemas

### 1.1 `Project` Schema
```typescript
interface Project {
  project_id: string;               // Unique stable code (e.g. "PRJ-DEMO-001")
  project_name: string;             // Official infrastructure project title
  ministry: string;                 // Central Ministry (e.g. "Ministry of Road Transport and Highways")
  department: string;               // Line department
  sector: string;                   // "Roads & Highways" | "Railways" | "Power" | "Urban Transit"
  state: string;                    // State / Union Territory
  implementing_agency: string;      // Executing PSU / SPV (e.g. "NHAI", "DFCCIL", "NTPC")
  status: "Ongoing" | "Delayed" | "Commissioned";

  financials: {
    original_cost_cr: number;          // Sanctioned budget in ₹ Crores
    revised_cost_cr: number;           // Current anticipated cost in ₹ Crores
    cumulative_expenditure_cr: number; // Funds spent to date in ₹ Crores
    cost_overrun_cr: number;           // Calculated cost growth (revised - original)
  };

  progress: {
    physical_progress_pct: number;     // Reported physical completion percentage (0-100)
    financial_progress_pct: number;    // Cumulative expenditure as % of revised cost
    progress_gap_pct: number;          // Financial % minus Physical % (Decoupling metric)
  };

  schedule: {
    start_date: string;                // YYYY-MM
    planned_completion_date: string;   // Baseline target COD (YYYY-MM)
    revised_completion_date: string;   // Current revised expected COD (YYYY-MM)
    delay_duration_months: number;     // Months delayed beyond planned date
    schedule_revisions_count: number;  // Number of formal schedule extensions
  };

  milestones: Array<{
    id: string;                        // "M-01", "M-02"
    name: string;                      // Milestone description
    planned_date: string;              // Target completion date
    status: "Completed" | "On Track" | "At Risk" | "Delayed";
    delay_days: number;                // Slippage in days
    dependency: string;                // Constraint description
  }>;

  risk: {
    overall_score: number;             // Composite risk score (0-100)
    level: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
    schedule_score: number;            // Predicted schedule risk score (0-100)
    cost_score: number;                // Predicted cost escalation risk score (0-100)
    implementation_score: number;      // Bottleneck severity score (0-100)
    primary_driver: string;            // Leading driver title
    drivers: Array<{
      rank: number;
      name: string;
      strength_pct: number;            // Relative impact percentage
      evidence: string;                // Empirical data backing
    }>;
    observed_signals: Array<{
      label: string;
      value: string | number;
      context: string;
    }>;
    attribution_note: string;
  };

  metadata: {
    data_source: string;
    data_status: "SYNTHETIC" | "DEMO" | "LIVE" | "STALE";
    last_updated: string;
  };
}
```

---

## 2. API Endpoint Contracts (FastAPI Readiness)

These endpoints define the contract for Phase 2/3 backend integration. The Phase 1 frontend can switch from `mockData.js` to fetching from these routes with zero layout redesign.

### 2.1 `GET /api/dashboard/summary`
Returns portfolio-level metrics.
```json
{
  "tracked_projects_count": 1987,
  "tracked_projects_subtext": "Projects in demonstration portfolio",
  "total_revised_cost_formatted": "₹42.5L Cr",
  "total_revised_cost_subtext": "Latest revised portfolio exposure",
  "projects_requiring_review_count": 128,
  "projects_requiring_review_subtext": "Elevated predicted risk",
  "capital_at_risk_formatted": "₹3.4L Cr",
  "capital_at_risk_subtext": "Estimated exposure associated with elevated risk",
  "risk_distribution": {
    "low": 1120,
    "moderate": 510,
    "high": 280,
    "critical": 77
  },
  "last_updated": "Demo dataset • Updated for prototype",
  "metadata": {
    "data_source": "MoSPI IPMD PAIMANA Schema",
    "data_status": "SYNTHETIC"
  }
}
```

### 2.2 `GET /api/projects`
Query parameters: `?search={query}&ministry={ministry}&sector={sector}&risk_level={level}&page={num}&page_size={size}`  
Returns paginated project records conforming to `Project[]`.

### 2.3 `GET /api/projects/{project_id}`
Returns a single `Project` entity with full breakdown of milestones, risk drivers, and observed signals.

### 2.4 `GET /api/alerts`
Returns active early-warning signals for the monitoring desk:
```typescript
interface Alert {
  alert_id: string;
  project_id: string;
  project_name: string;
  severity: "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
  signal: string;
  detected_at: string;
  risk_change: string;
  status: "Requires Review" | "Under Investigation" | "Escalated" | "Resolved";
}
```

---

## 3. Data Integrity & Synthetic Disclaimer
All Phase 1 records are generated under the `data_status: "SYNTHETIC"` flag. Frontends must display the persistent **`DEMO DATA`** status badge whenever this flag is active.
