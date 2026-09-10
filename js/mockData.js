// PROJECTPULSE — Central Demonstration Dataset
// Ministry of Statistics & Programme Implementation (MoSPI) - IPMD / PAIMANA

const MOCK_PROJECTS = [
  {
    project_id: "PRJ-DEMO-001",
    project_name: "NH-44 Strategic Corridor Development Project",
    ministry: "Ministry of Road Transport and Highways",
    department: "National Highways Division",
    sector: "Roads & Highways",
    state: "Telangana / Andhra Pradesh",
    implementing_agency: "National Highways Authority of India (NHAI)",
    status: "Delayed",
    financials: {
      original_cost_cr: 1250.0,
      revised_cost_cr: 1840.5,
      cumulative_expenditure_cr: 1472.4,
      cost_overrun_cr: 590.5
    },
    progress: {
      physical_progress_pct: 42.5,
      financial_progress_pct: 80.0,
      progress_gap_pct: 37.5
    },
    schedule: {
      start_date: "2022-09",
      planned_completion_date: "2025-06",
      revised_completion_date: "2027-02",
      delay_duration_months: 20.0,
      schedule_revisions_count: 2
    },
    milestones: [
      { id: "M-01", name: "Detailed Project Report & Feasibility", planned_date: "2022-12", status: "Completed", delay_days: 0, dependency: "None" },
      { id: "M-02", name: "Environmental & Coastal Clearances", planned_date: "2023-04", status: "Completed", delay_days: 15, dependency: "State EAC" },
      { id: "M-03", name: "EPC Tender Award & Concessionaire Mobilization", planned_date: "2023-08", status: "Completed", delay_days: 30, dependency: "Procurement" },
      { id: "M-04", name: "Subgrade Earthwork & Embankment Section A", planned_date: "2024-01", status: "Completed", delay_days: 0, dependency: "ROW Clearance" },
      { id: "M-05", name: "Major Bridge Substructure (Krishna River Basin)", planned_date: "2024-06", status: "Delayed", delay_days: 110, dependency: "High Monsoonal Flood Level" },
      { id: "M-06", name: "Forest Land ROW Handover (PKG-3 Forest Section)", planned_date: "2024-09", status: "Delayed", delay_days: 145, dependency: "MoEFCC Clearance" },
      { id: "M-07", name: "Four-Lane Elevated Viaduct Superstructure", planned_date: "2024-12", status: "Delayed", delay_days: 95, dependency: "Steel Girder Logistics" },
      { id: "M-08", name: "Pavement Quality Concrete (PQC) Paving", planned_date: "2025-03", status: "Delayed", delay_days: 80, dependency: "Continuous Subgrade Handover" },
      { id: "M-09", name: "Underground High-Tension Utility Shifting", planned_date: "2025-06", status: "Delayed", delay_days: 75, dependency: "State Transco Clearance" },
      { id: "M-10", name: "Toll Plaza & Smart Weigh-in-Motion (WIM)", planned_date: "2025-09", status: "At Risk", delay_days: 25, dependency: "Civil Foundations" },
      { id: "M-11", name: "Signage, Crash Barriers & Lighting", planned_date: "2025-12", status: "On Track", delay_days: 0, dependency: "Paving Completion" },
      { id: "M-12", name: "Safety Audit & Final Commercial COD", planned_date: "2026-03", status: "At Risk", delay_days: 60, dependency: "Commissioning Inspection" }
    ],
    risk: {
      overall_score: 82,
      level: "HIGH",
      schedule_score: 78,
      cost_score: 71,
      implementation_score: 84,
      primary_driver: "Expenditure / Progress Mismatch",
      drivers: [
        { rank: 1, name: "Expenditure / Progress Mismatch", strength_pct: 38, evidence: "Cumulative funds spent are 37.5 percentage points ahead of physical construction." },
        { rank: 2, name: "Milestone Slippage Velocity", strength_pct: 28, evidence: "5 out of 12 critical path milestones have suffered persistent completion delays." },
        { rank: 3, name: "Schedule Revisions", strength_pct: 20, evidence: "2 formal completion extensions granted, delaying original COD by 20 months." },
        { rank: 4, name: "ROW & Environmental Dependency", strength_pct: 14, evidence: "Forest land handover in PKG-3 unresolved for over 145 days." }
      ],
      observed_signals: [
        { label: "Physical Progress", value: "42.5%", context: "Reported actual on-site completion" },
        { label: "Cumulative Expenditure", value: "80.0%", context: "Total funds drawn against revised estimate" },
        { label: "Milestones Delayed", value: "5 of 12", context: "Key critical path milestones behind schedule" },
        { label: "Schedule Extensions", value: "2 Revisions", context: "Revised from Jun 2025 to Feb 2027" }
      ],
      attribution_note: "Illustrative risk output based on demonstration features."
    },
    metadata: {
      data_source: "PAIMANA Demonstration Schema",
      data_status: "SYNTHETIC",
      last_updated: "2026-09-01"
    }
  }
];
MOCK_PROJECTS.push(
  {
    project_id: "PRJ-DEMO-002",
    project_name: "Eastern Dedicated Freight Corridor (Sonnagar-Dankuni)",
    ministry: "Ministry of Railways",
    department: "Railway Board",
    sector: "Railways & Logistics",
    state: "West Bengal / Bihar",
    implementing_agency: "Dedicated Freight Corridor Corp (DFCCIL)",
    status: "Delayed",
    financials: { original_cost_cr: 14200.0, revised_cost_cr: 17850.0, cumulative_expenditure_cr: 11400.0, cost_overrun_cr: 3650.0 },
    progress: { physical_progress_pct: 51.0, financial_progress_pct: 63.9, progress_gap_pct: 12.9 },
    schedule: { start_date: "2020-01", planned_completion_date: "2024-12", revised_completion_date: "2027-08", delay_duration_months: 32.0, schedule_revisions_count: 3 },
    milestones: [
      { id: "M-01", name: "Land Acquisition Handover", planned_date: "2021-06", status: "Completed", delay_days: 90, dependency: "State Revenue" },
      { id: "M-02", name: "Track Formation & Ballast", planned_date: "2023-01", status: "Delayed", delay_days: 180, dependency: "Contractor" },
      { id: "M-03", name: "Electrification (25kV OHE)", planned_date: "2024-03", status: "Delayed", delay_days: 210, dependency: "Supply Chain" },
      { id: "M-04", name: "Signaling & Telecommunications", planned_date: "2024-12", status: "At Risk", delay_days: 90, dependency: "OEM" }
    ],
    risk: {
      overall_score: 89, level: "CRITICAL", schedule_score: 92, cost_score: 84, implementation_score: 88,
      primary_driver: "Contractor Underperformance & Land Delay",
      drivers: [
        { rank: 1, name: "Concessionaire Financing & Dispute", strength_pct: 42, evidence: "PPP concessionaire dispute locked funding for 9 months." },
        { rank: 2, name: "Milestone Slippage Velocity", strength_pct: 31, evidence: "Major track laying milestones delayed over 180 days." },
        { rank: 3, name: "Cost Escalation", strength_pct: 27, evidence: "Approved cost escalated by ₹3,650 Cr due to exchange & inflation." }
      ],
      observed_signals: [
        { label: "Physical Progress", value: "51.0%", context: "Physical track completed" },
        { label: "Cumulative Expenditure", value: "63.9%", context: "Disbursed funds" },
        { label: "Schedule Delay", value: "32 Months", context: "Substantial slippage past planned COD" }
      ],
      attribution_note: "Illustrative risk output based on demonstration features."
    },
    metadata: { data_source: "PAIMANA Demonstration Schema", data_status: "SYNTHETIC", last_updated: "2026-09-01" }
  },
  {
    project_id: "PRJ-DEMO-003",
    project_name: "Bengaluru Metro Phase 2A (Silk Board to KR Puram)",
    ministry: "Ministry of Housing and Urban Affairs",
    department: "Urban Transit",
    sector: "Urban Transit",
    state: "Karnataka",
    implementing_agency: "Bangalore Metro Rail Corp (BMRCL)",
    status: "Ongoing",
    financials: { original_cost_cr: 5600.0, revised_cost_cr: 6150.0, cumulative_expenditure_cr: 3980.0, cost_overrun_cr: 550.0 },
    progress: { physical_progress_pct: 64.0, financial_progress_pct: 64.7, progress_gap_pct: 0.7 },
    schedule: { start_date: "2021-06", planned_completion_date: "2025-09", revised_completion_date: "2026-06", delay_duration_months: 9.0, schedule_revisions_count: 1 },
    milestones: [
      { id: "M-01", name: "Pier Construction (Outer Ring Road)", planned_date: "2023-08", status: "Completed", delay_days: 20, dependency: "Traffic Police" },
      { id: "M-02", name: "U-Girder Erection Corridor A", planned_date: "2024-05", status: "Completed", delay_days: 15, dependency: "Night Traffic" },
      { id: "M-03", name: "Station Civil Shells (6 Stations)", planned_date: "2025-01", status: "At Risk", delay_days: 45, dependency: "Underground Utilities" },
      { id: "M-04", name: "Third Rail Power Traction", planned_date: "2025-07", status: "On Track", delay_days: 0, dependency: "Viaduct Handover" }
    ],
    risk: {
      overall_score: 48, level: "MODERATE", schedule_score: 52, cost_score: 41, implementation_score: 51,
      primary_driver: "Underground Utility Shifting Constraints",
      drivers: [
        { rank: 1, name: "Utility Shifting in Dense Traffic", strength_pct: 45, evidence: "High-density BWSSB water pipelines require night-only diversion." },
        { rank: 2, name: "Material Cost Variance", strength_pct: 35, evidence: "Structural steel and pre-cast concrete unit price escalation." },
        { rank: 3, name: "Traffic Permissions", strength_pct: 20, evidence: "Restricted working window on Outer Ring Road corridor." }
      ],
      observed_signals: [
        { label: "Physical Progress", value: "64.0%", context: "Viaduct piers & girders in place" },
        { label: "Cumulative Expenditure", value: "64.7%", context: "Financial spend tightly tracks physical work" },
        { label: "Progress Gap", value: "0.7%", context: "Healthy spending-to-progress ratio" }
      ],
      attribution_note: "Illustrative risk output based on demonstration features."
    },
    metadata: { data_source: "PAIMANA Demonstration Schema", data_status: "SYNTHETIC", last_updated: "2026-09-01" }
  },
  {
    project_id: "PRJ-DEMO-004",
    project_name: "Pavagada Solar Park Expansion (500 MW Unit)",
    ministry: "Ministry of Power",
    department: "New & Renewable Energy",
    sector: "Renewable Energy",
    state: "Karnataka",
    implementing_agency: "NTPC Renewable Energy",
    status: "Ongoing",
    financials: { original_cost_cr: 2100.0, revised_cost_cr: 2100.0, cumulative_expenditure_cr: 1720.0, cost_overrun_cr: 0.0 },
    progress: { physical_progress_pct: 82.0, financial_progress_pct: 81.9, progress_gap_pct: -0.1 },
    schedule: { start_date: "2023-01", planned_completion_date: "2025-06", revised_completion_date: "2025-06", delay_duration_months: 0.0, schedule_revisions_count: 0 },
    milestones: [
      { id: "M-01", name: "Land Lease Finalization", planned_date: "2023-04", status: "Completed", delay_days: 0, dependency: "None" },
      { id: "M-02", name: "Solar PV Module Mounting Structures", planned_date: "2024-02", status: "Completed", delay_days: 0, dependency: "None" },
      { id: "M-03", name: "Inverter Station & Substation", planned_date: "2024-10", status: "Completed", delay_days: 0, dependency: "None" },
      { id: "M-04", name: "Grid Interconnection Line", planned_date: "2025-04", status: "On Track", delay_days: 0, dependency: "PGCIL Link" }
    ],
    risk: {
      overall_score: 18, level: "LOW", schedule_score: 15, cost_score: 12, implementation_score: 22,
      primary_driver: "Normal Execution Variance",
      drivers: [
        { rank: 1, name: "Weather-Related Installation Variance", strength_pct: 60, evidence: "High summer temperatures reduced afternoon panel installation speeds." },
        { rank: 2, name: "Logistics", strength_pct: 40, evidence: "Container transport from port experienced minor customs clearance lag." }
      ],
      observed_signals: [
        { label: "Physical Progress", value: "82.0%", context: "Ahead of schedule benchmark" },
        { label: "Cost Escalation", value: "₹0 Cr", context: "Strictly within original approved sanction" },
        { label: "Milestones", value: "3 of 4 Done", context: "Final interconnection on track" }
      ],
      attribution_note: "Illustrative risk output based on demonstration features."
    },
    metadata: { data_source: "PAIMANA Demonstration Schema", data_status: "SYNTHETIC", last_updated: "2026-09-01" }
  }
);
MOCK_PROJECTS.push(
  {
    project_id: "PRJ-DEMO-005",
    project_name: "Talcher Ultra-Supercritical Thermal Power Stage-III",
    ministry: "Ministry of Power",
    department: "Thermal Division",
    sector: "Thermal Power",
    state: "Odisha",
    implementing_agency: "NTPC Limited",
    status: "Delayed",
    financials: { original_cost_cr: 7920.0, revised_cost_cr: 9140.0, cumulative_expenditure_cr: 5980.0, cost_overrun_cr: 1220.0 },
    progress: { physical_progress_pct: 58.0, financial_progress_pct: 65.4, progress_gap_pct: 7.4 },
    schedule: { start_date: "2020-04", planned_completion_date: "2025-03", revised_completion_date: "2027-01", delay_duration_months: 22.0, schedule_revisions_count: 2 },
    milestones: [
      { id: "M-01", name: "Main Boiler Structural Erection", planned_date: "2023-01", status: "Completed", delay_days: 60, dependency: "BHEL Supply" },
      { id: "M-02", name: "Turbine Generator Island Civil Works", planned_date: "2024-02", status: "Completed", delay_days: 45, dependency: "Foundation" },
      { id: "M-03", name: "Flue Gas Desulfurization (FGD) Plant", planned_date: "2024-11", status: "Delayed", delay_days: 130, dependency: "Import Customs" },
      { id: "M-04", name: "Ash Handling & Water Reservoir", planned_date: "2025-06", status: "At Risk", delay_days: 75, dependency: "Local Village Land" }
    ],
    risk: {
      overall_score: 76, level: "HIGH", schedule_score: 79, cost_score: 72, implementation_score: 77,
      primary_driver: "Equipment Supply Delay & Emission Retrofit",
      drivers: [
        { rank: 1, name: "Boiler & Turbine Delivery Slippage", strength_pct: 44, evidence: "Heavy engineering delivery delayed by 180 days." },
        { rank: 2, name: "Emission Standard Retrofit", strength_pct: 34, evidence: "Mandatory FGD system altered procurement timeline." },
        { rank: 3, name: "Ash Pipeline ROW Disruption", strength_pct: 22, evidence: "Local landowner dispute on pipeline corridor." }
      ],
      observed_signals: [
        { label: "Physical Progress", value: "58.0%", context: "Plant construction behind target" },
        { label: "Delay Duration", value: "22 Months", context: "Prolonged commissioning revision" },
        { label: "Cost Overrun", value: "₹1,220 Cr", context: "Anticipated cost escalation" }
      ],
      attribution_note: "Illustrative risk output based on demonstration features."
    },
    metadata: { data_source: "PAIMANA Demonstration Schema", data_status: "SYNTHETIC", last_updated: "2026-09-01" }
  },
  {
    project_id: "PRJ-DEMO-006",
    project_name: "AIIMS Madurai 750-Bed Apex Medical Campus",
    ministry: "Ministry of Health and Family Welfare",
    department: "PMSSY Division",
    sector: "Health Infrastructure",
    state: "Tamil Nadu",
    implementing_agency: "HLL Infra Tech Services (HITES)",
    status: "Delayed",
    financials: { original_cost_cr: 1980.0, revised_cost_cr: 2350.0, cumulative_expenditure_cr: 680.0, cost_overrun_cr: 370.0 },
    progress: { physical_progress_pct: 32.0, financial_progress_pct: 28.9, progress_gap_pct: -3.1 },
    schedule: { start_date: "2021-02", planned_completion_date: "2026-04", revised_completion_date: "2028-09", delay_duration_months: 29.0, schedule_revisions_count: 2 },
    milestones: [
      { id: "M-01", name: "Master Plan & JICA Loan Agreement", planned_date: "2021-10", status: "Completed", delay_days: 45, dependency: "Finance Ministry" },
      { id: "M-02", name: "EPC Tender Award (Hospital Complex)", planned_date: "2023-05", status: "Completed", delay_days: 120, dependency: "Tender Re-issue" },
      { id: "M-03", name: "Foundation & Basement Substructure", planned_date: "2024-04", status: "Delayed", delay_days: 160, dependency: "Soil Stabilization" },
      { id: "M-04", name: "OPD & Academic Block Civil Frame", planned_date: "2025-03", status: "At Risk", delay_days: 90, dependency: "Contractor Staffing" }
    ],
    risk: {
      overall_score: 84, level: "CRITICAL", schedule_score: 88, cost_score: 75, implementation_score: 89,
      primary_driver: "Tender Retendering & Substructure Soil Failure",
      drivers: [
        { rank: 1, name: "Re-tendering Cycle & Procurement Delays", strength_pct: 46, evidence: "Cancelled initial tender caused 14 months of administrative delay." },
        { rank: 2, name: "Soil Consolidation & Seismic Redesign", strength_pct: 32, evidence: "Unanticipated ground water table required deep pile redesign." },
        { rank: 3, name: "Slow Contractor Mobilization", strength_pct: 22, evidence: "Labor deployment remains 40% below contracted baseline." }
      ],
      observed_signals: [
        { label: "Physical Progress", value: "32.0%", context: "Severe lag after 4 years of sanction" },
        { label: "Delay Duration", value: "29 Months", context: "Pushed to late 2028" },
        { label: "Milestone Slippage", value: "2 Critical Slipped", context: "EPC execution behind schedule" }
      ],
      attribution_note: "Illustrative risk output based on demonstration features."
    },
    metadata: { data_source: "PAIMANA Demonstration Schema", data_status: "SYNTHETIC", last_updated: "2026-09-01" }
  },
  {
    project_id: "PRJ-DEMO-007",
    project_name: "Navi Mumbai International Airport (Phase-1 Cargo & Terminal)",
    ministry: "Ministry of Civil Aviation",
    department: "Airports Division",
    sector: "Civil Aviation",
    state: "Maharashtra",
    implementing_agency: "CIDCO / Adani Airports",
    status: "Ongoing",
    financials: { original_cost_cr: 14100.0, revised_cost_cr: 16700.0, cumulative_expenditure_cr: 12200.0, cost_overrun_cr: 2600.0 },
    progress: { physical_progress_pct: 79.0, financial_progress_pct: 73.1, progress_gap_pct: -5.9 },
    schedule: { start_date: "2019-11", planned_completion_date: "2024-12", revised_completion_date: "2026-03", delay_duration_months: 15.0, schedule_revisions_count: 2 },
    milestones: [
      { id: "M-01", name: "Ulwe River Diversion & Hill Cutting", planned_date: "2022-06", status: "Completed", delay_days: 90, dependency: "Environmental EAC" },
      { id: "M-02", name: "Runway 08/26 Paving & Drainage", planned_date: "2023-12", status: "Completed", delay_days: 45, dependency: "None" },
      { id: "M-03", name: "Passenger Terminal Building Facade", planned_date: "2024-09", status: "At Risk", delay_days: 50, dependency: "Imported Glazing" },
      { id: "M-04", name: "ATC Tower & Radar Calibration", planned_date: "2025-03", status: "On Track", delay_days: 0, dependency: "DGCA Inspection" }
    ],
    risk: {
      overall_score: 54, level: "MODERATE", schedule_score: 58, cost_score: 49, implementation_score: 55,
      primary_driver: "Airspace Calibration & Terminal Finishing",
      drivers: [
        { rank: 1, name: "River Diversion Engineering Challenges", strength_pct: 48, evidence: "Extensive rock blasting and river channeling delayed site handover." },
        { rank: 2, name: "Airspace Calibration & Radar Testing", strength_pct: 32, evidence: "DGCA calibration flights require weather clearance windows." },
        { rank: 3, name: "Concession Cost Growth", strength_pct: 20, evidence: "Increased terminal specifications approved by steering committee." }
      ],
      observed_signals: [
        { label: "Physical Progress", value: "79.0%", context: "Runway and structures mostly built" },
        { label: "Expenditure", value: "73.1%", context: "Well synchronized with progress" },
        { label: "Target COD", value: "Mar 2026", context: "Commercial test flights underway" }
      ],
      attribution_note: "Illustrative risk output based on demonstration features."
    },
    metadata: { data_source: "PAIMANA Demonstration Schema", data_status: "SYNTHETIC", last_updated: "2026-09-01" }
  }
);
(function populateRemainingProjects() {
  const STATES = ["Uttar Pradesh", "Maharashtra", "Madhya Pradesh", "Rajasthan", "Gujarat", "Assam", "Bihar", "Punjab", "Haryana", "Kerala", "West Bengal", "Jharkhand", "Andhra Pradesh", "Telangana", "Tamil Nadu", "Odisha", "Karnataka", "Chhattisgarh"];
  const SECTORS = [
    { ministry: "Ministry of Road Transport and Highways", sector: "Roads & Highways", agency: "NHAI" },
    { ministry: "Ministry of Railways", sector: "Railways & Logistics", agency: "Indian Railways" },
    { ministry: "Ministry of Power", sector: "Thermal & Hydro Power", agency: "NTPC" },
    { ministry: "Ministry of Petroleum and Natural Gas", sector: "Pipelines & Refineries", agency: "IOCL" },
    { ministry: "Ministry of Housing and Urban Affairs", sector: "Urban Infrastructure", agency: "Smart City SPV" }
  ];

  for (let i = 8; i <= 26; i++) {
    const sec = SECTORS[i % SECTORS.length];
    const state = STATES[i % STATES.length];
    const origCost = Math.round(450 + (i * 125));
    const physPct = Math.round(18 + ((i * 19) % 78));
    
    let riskScore = 15 + ((i * 27) % 80);
    let riskLevel = "LOW";
    if (riskScore >= 75) riskLevel = "CRITICAL";
    else if (riskScore >= 50) riskLevel = "HIGH";
    else if (riskScore >= 25) riskLevel = "MODERATE";

    const finPct = Math.min(98, Math.max(12, Math.round(physPct + (riskScore > 50 ? 14 : -3))));
    const revisedCost = Math.round(origCost * (1 + (riskScore > 60 ? 0.22 : 0.04)));
    const exp = Math.round(revisedCost * (finPct / 100));
    const delayMos = riskScore > 50 ? Math.round(riskScore / 5) : 0;

    MOCK_PROJECTS.push({
      project_id: `PRJ-DEMO-${String(i).padStart(3, '0')}`,
      project_name: `${state} ${sec.sector} Package-${(i % 5) + 1}`,
      ministry: sec.ministry,
      department: "Project Monitoring Wing",
      sector: sec.sector,
      state: state,
      implementing_agency: sec.agency,
      status: delayMos > 6 ? "Delayed" : "Ongoing",
      financials: {
        original_cost_cr: origCost,
        revised_cost_cr: revisedCost,
        cumulative_expenditure_cr: exp,
        cost_overrun_cr: revisedCost - origCost
      },
      progress: {
        physical_progress_pct: physPct,
        financial_progress_pct: finPct,
        progress_gap_pct: parseFloat((finPct - physPct).toFixed(1))
      },
      schedule: {
        start_date: "2022-03",
        planned_completion_date: "2025-08",
        revised_completion_date: delayMos > 0 ? "2026-11" : "2025-08",
        delay_duration_months: delayMos,
        schedule_revisions_count: delayMos > 6 ? 2 : 0
      },
      milestones: [
        { id: "M-01", name: "Land Acquisition & Feasibility", planned_date: "2022-09", status: "Completed", delay_days: 0, dependency: "None" },
        { id: "M-02", name: "Contractor Procurement", planned_date: "2023-05", status: "Completed", delay_days: 10, dependency: "None" },
        { id: "M-03", name: "Civil Execution Package", planned_date: "2024-11", status: riskScore > 50 ? "Delayed" : "Completed", delay_days: delayMos * 15, dependency: "Site Handover" },
        { id: "M-04", name: "Commissioning & COD", planned_date: "2025-08", status: riskScore > 50 ? "At Risk" : "On Track", delay_days: delayMos * 10, dependency: "Inspection" }
      ],
      risk: {
        overall_score: riskScore,
        level: riskLevel,
        schedule_score: Math.min(99, Math.round(riskScore * 1.04)),
        cost_score: Math.min(99, Math.round(riskScore * 0.96)),
        implementation_score: riskScore,
        primary_driver: riskScore > 50 ? "Milestone Schedule Slippage" : "Normal Construction Variance",
        drivers: [
          { rank: 1, name: "Milestone Schedule Slippage", strength_pct: 45, evidence: "Civil execution milestones tracking behind target." },
          { rank: 2, name: "Expenditure / Progress Variance", strength_pct: 35, evidence: "Capital spending decoupled from physical milestones." },
          { rank: 3, name: "Contractor Equipment Allocation", strength_pct: 20, evidence: "Equipment deployment variation against plan." }
        ],
        observed_signals: [
          { label: "Physical Progress", value: `${physPct}%`, context: "On-site completion" },
          { label: "Expenditure", value: `${finPct}%`, context: "Drawn funds" },
          { label: "Predicted Risk", value: `${riskScore}/100`, context: "Demonstration indicator" }
        ],
        attribution_note: "Illustrative risk output based on demonstration features."
      },
      metadata: {
        data_source: "PAIMANA Demonstration Schema",
        data_status: "SYNTHETIC",
        last_updated: "2026-09-01"
      }
    });
  }
})();

const MOCK_DASHBOARD_SUMMARY = {
  tracked_projects_count: 1987,
  tracked_projects_subtext: "Projects in demonstration portfolio",
  total_revised_cost_formatted: "₹42.5L Cr",
  total_revised_cost_subtext: "Latest revised portfolio exposure",
  projects_requiring_review_count: 128,
  projects_requiring_review_subtext: "Elevated predicted risk",
  capital_at_risk_formatted: "₹3.4L Cr",
  capital_at_risk_subtext: "Estimated exposure associated with elevated risk",
  risk_distribution: {
    low: 1120,
    moderate: 510,
    high: 280,
    critical: 77
  },
  last_updated: "Demo dataset • Updated for prototype",
  metadata: {
    data_source: "MoSPI IPMD PAIMANA Schema",
    data_status: "SYNTHETIC"
  }
};

const MOCK_ALERTS = [
  {
    alert_id: "ALT-2026-001",
    project_id: "PRJ-DEMO-001",
    project_name: "NH-44 Strategic Corridor Development Project",
    severity: "HIGH",
    signal: "Physical progress significantly below expenditure trajectory (37.5% Gap)",
    detected_at: "2026-09-02 09:30",
    risk_change: "+18 points",
    status: "Requires Review"
  },
  {
    alert_id: "ALT-2026-002",
    project_id: "PRJ-DEMO-002",
    project_name: "Eastern Dedicated Freight Corridor (Sonnagar-Dankuni)",
    severity: "CRITICAL",
    signal: "Consecutive critical path milestone failures in Track Formation (>180 Days)",
    detected_at: "2026-09-01 14:15",
    risk_change: "+24 points",
    status: "Escalated"
  },
  {
    alert_id: "ALT-2026-003",
    project_id: "PRJ-DEMO-006",
    project_name: "AIIMS Madurai 750-Bed Apex Medical Campus",
    severity: "CRITICAL",
    signal: "Substructure construction frozen; contractor labor deployment 40% below baseline",
    detected_at: "2026-08-28 11:00",
    risk_change: "+15 points",
    status: "Requires Review"
  },
  {
    alert_id: "ALT-2026-004",
    project_id: "PRJ-DEMO-005",
    project_name: "Talcher Ultra-Supercritical Thermal Power Stage-III",
    severity: "HIGH",
    signal: "Flue Gas Desulfurization (FGD) plant import customs hold impacting COD",
    detected_at: "2026-08-25 16:45",
    risk_change: "+12 points",
    status: "Under Investigation"
  },
  {
    alert_id: "ALT-2026-005",
    project_id: "PRJ-DEMO-010",
    project_name: "Raipur-Visakhapatnam Economic Corridor (PKG-7)",
    severity: "HIGH",
    signal: "Tunnel geological fracture zone encountered; water pumping active",
    detected_at: "2026-08-22 10:20",
    risk_change: "+19 points",
    status: "Requires Review"
  },
  {
    alert_id: "ALT-2026-006",
    project_id: "PRJ-DEMO-003",
    project_name: "Bengaluru Metro Phase 2A (Silk Board to KR Puram)",
    severity: "MODERATE",
    signal: "BWSSB underground water utility shifting permit delayed by 45 days",
    detected_at: "2026-08-19 13:10",
    risk_change: "+6 points",
    status: "Under Investigation"
  },
  {
    alert_id: "ALT-2026-007",
    project_id: "PRJ-DEMO-007",
    project_name: "Navi Mumbai International Airport (Phase-1)",
    severity: "MODERATE",
    signal: "Passenger terminal imported glazing shipment variance recorded",
    detected_at: "2026-08-15 09:00",
    risk_change: "+5 points",
    status: "Resolved"
  }
];

window.MOCK_PROJECTS = MOCK_PROJECTS;
window.ORIGINAL_MOCK_PROJECTS = JSON.parse(JSON.stringify(MOCK_PROJECTS));
window.MOCK_DASHBOARD_SUMMARY = MOCK_DASHBOARD_SUMMARY;
window.MOCK_ALERTS = MOCK_ALERTS;
window.ORIGINAL_MOCK_ALERTS = JSON.parse(JSON.stringify(MOCK_ALERTS));
