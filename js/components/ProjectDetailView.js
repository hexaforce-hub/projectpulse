// ==========================================================================
// PROJECTPULSE — Project Detail Intelligence View Component (Phase 9)
// Route: /projects/:id
// Ministry of Statistics & Programme Implementation (MoSPI) - IPMD / PAIMANA
// Smart India Hackathon 2026 — Team HexaForce
// ==========================================================================

const ProjectDetailView = {
  render(projectId) {
    const allProjects = window.MOCK_PROJECTS || [];
    const fallback = allProjects.find(p => p.project_id === projectId) || allProjects[0] || {};

    const pId = projectId || fallback.project_id || "PRJ-DEMO-001";
    const isHero = pId === "PRJ-DEMO-001" || pId === "PRJ-SYN-000001";

    return `
      <div class="max-w-[1440px] mx-auto space-y-6">
        
        <!-- Top Navigation Bar & Identity Breadcrumb -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div class="flex items-center gap-3">
            <a href="#/projects" class="btn btn-secondary btn-sm" title="Return to Projects list">
              ← Back to Registry
            </a>
            <div>
              <div class="flex items-center gap-2">
                <span id="dtl-project-id" class="font-mono text-caption text-slate-500 uppercase font-bold">${pId}</span>
                <span class="text-slate-300">•</span>
                <span id="dtl-project-status" class="text-caption font-semibold text-orange-700">
                  Critical Execution Review
                </span>
                ${isHero ? `
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                    HERO DEMO PROJECT
                  </span>
                ` : ''}
              </div>
              <h1 id="dtl-project-name" class="text-page-title mt-0.5">
                ${fallback.project_name || "NH-44 Strategic Corridor Development Project"}
              </h1>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200" title="Data Contract Specification Standard">
              MoSPI PAIMANA Standard
            </span>
            <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              SYNTHETIC PROTOTYPE DATA
            </span>
          </div>
        </div>

        <!-- Role-Aware Adaptive Intelligence & Direct Action Flight Deck -->
        <div id="dtl-role-adaptive-banner" class="animate-fade-in"></div>

        <!-- Above the Fold: Summary Card + Risk Overview -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <!-- Left: Project Summary Specifications (7 Cols) -->
          <div class="lg:col-span-7 gov-card space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 pb-2">
              <div class="flex items-center gap-2">
                <h3 class="text-card-title">Project Summary & Sanction Details</h3>
                <span class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-100 text-slate-700 uppercase tracking-wider">
                  OBSERVED
                </span>
              </div>
              <span class="text-caption text-slate-400 font-mono">Central Sector ₹150 Cr+</span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 gap-y-3.5 gap-x-4 text-caption">
              <div>
                <span class="text-slate-400 block text-[11px]">Central Ministry</span>
                <span id="dtl-ministry" class="font-medium text-slate-900 block truncate">
                  ${fallback.ministry || "Ministry of Road Transport and Highways"}
                </span>
              </div>
              <div>
                <span class="text-slate-400 block text-[11px]">Sector / Department</span>
                <span id="dtl-sector" class="font-medium text-slate-900 block truncate">
                  ${fallback.sector || "Roads & Highways"}
                </span>
              </div>
              <div>
                <span class="text-slate-400 block text-[11px]">Implementing Agency</span>
                <span id="dtl-agency" class="font-medium text-slate-900 block">
                  ${fallback.implementing_agency || "NHAI"}
                </span>
              </div>
              <div>
                <span class="text-slate-400 block text-[11px]">State / Region</span>
                <span id="dtl-state" class="font-medium text-slate-900 block">
                  ${fallback.state || "Telangana / Andhra Pradesh"}
                </span>
              </div>
              <div>
                <span class="text-slate-400 block text-[11px]">Sanctioned Start Date</span>
                <span id="dtl-start-date" class="font-medium text-slate-900 block tabular-nums">2022-09</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[11px]">Original Completion</span>
                <span id="dtl-plan-date" class="font-medium text-slate-900 block tabular-nums">2025-06</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[11px]">Revised Target Date</span>
                <span id="dtl-rev-date" class="font-semibold text-orange-700 block tabular-nums">2027-02 (20 mo delay)</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[11px]">Original Approved Cost</span>
                <span id="dtl-orig-cost" class="font-medium text-slate-900 block tabular-nums">₹1,250.0 Cr</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[11px]">Current Revised Cost</span>
                <span id="dtl-rev-cost" class="font-semibold text-slate-900 block tabular-nums">₹1,840.5 Cr</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[11px]">Cumulative Expenditure</span>
                <span id="dtl-expenditure" class="font-medium text-slate-900 block tabular-nums">₹1,472.4 Cr</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[11px]">Reported Cost Growth</span>
                <span id="dtl-cost-growth" class="font-semibold text-red-700 block tabular-nums">+47.2% (+₹590.5 Cr)</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[11px]">Schedule Extensions</span>
                <span id="dtl-extensions" class="font-medium text-slate-900 block tabular-nums">2 formal revisions</span>
              </div>
            </div>
          </div>

          <!-- Right: Risk Overview Panel (5 Cols) -->
          <div class="lg:col-span-5 gov-card flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                <div class="flex items-center gap-2">
                  <h3 class="text-card-title">Predicted Risk Intelligence</h3>
                  <span class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-800 uppercase tracking-wider">
                    PREDICTED
                  </span>
                </div>
                <span id="dtl-risk-badge">
                  <span class="risk-badge risk-badge-critical">CRITICAL (78.5)</span>
                </span>
              </div>

              <!-- Main Score Display -->
              <div class="text-center py-3 bg-slate-50 rounded-xl border border-slate-200/80 mb-4">
                <div class="text-caption text-slate-500 font-medium">Composite Project Risk Score</div>
                <div id="dtl-score-val" class="text-4xl font-bold text-slate-900 tabular-nums tracking-tight my-1 font-mono">
                  78.5 <span class="text-lg text-slate-400 font-normal">/ 100</span>
                </div>
                <div id="dtl-risk-headline" class="text-caption text-red-700 font-semibold">
                  Severe predicted schedule slippage and cost escalation
                </div>
                <div id="dtl-risk-note" class="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                  Multi-target ensemble: LightGBM Regressor + HistGradientBoosting Classifier
                </div>
              </div>

              <!-- Sub-Risk Predictions -->
              <div class="grid grid-cols-3 gap-2 text-center text-caption">
                <div class="p-2 bg-white rounded border border-slate-200">
                  <span class="text-[10px] text-slate-500 block">Schedule Delay</span>
                  <strong id="dtl-sub-schedule" class="text-base text-slate-900 tabular-nums">20.0 mos</strong>
                </div>
                <div class="p-2 bg-white rounded border border-slate-200">
                  <span class="text-[10px] text-slate-500 block">Cost Overrun</span>
                  <strong id="dtl-sub-cost" class="text-base text-slate-900 tabular-nums">84.2% prob</strong>
                </div>
                <div class="p-2 bg-white rounded border border-slate-200">
                  <span class="text-[10px] text-slate-500 block">Impl. Distress</span>
                  <strong id="dtl-sub-impl" class="text-base text-slate-900 tabular-nums">85.0%</strong>
                </div>
              </div>
            </div>

            <!-- Primary Driver Tag -->
            <div class="mt-4 pt-3 border-t border-slate-100 text-caption text-slate-600 flex items-center justify-between">
              <span>Primary Driver: <strong id="dtl-primary-driver" class="text-slate-900">Land Acquisition & RoW</strong></span>
              <span class="text-[11px] text-slate-400">TreeSHAP Attributed</span>
            </div>
          </div>

        </div>

        <!-- Middle Section: Financial vs Physical Progress Decoupling + Observed Signals -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <!-- Financial vs Physical Progress Decoupling (6 Cols) -->
          <div class="lg:col-span-6 gov-card space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-card-title">Progress Decoupling Surveillance</h3>
                  <span class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider">
                    DERIVED
                  </span>
                </div>
                <p class="text-caption text-slate-500">Expenditure disbursement vs certified physical execution</p>
              </div>
              <span id="dtl-gap-badge" class="px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800 border border-red-200 font-mono">
                Decoupling: +37.5 pp
              </span>
            </div>

            <div class="space-y-4">
              <!-- Physical Progress Bar -->
              <div class="space-y-1">
                <div class="flex justify-between text-caption font-medium">
                  <span class="text-slate-700">Certified Physical Progress</span>
                  <span id="dtl-phys-prog-val" class="font-bold text-slate-900 tabular-nums">42.5%</span>
                </div>
                <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div id="dtl-phys-prog-bar" class="bg-blue-700 h-full rounded-full transition-all" style="width: 42.5%;"></div>
                </div>
              </div>

              <!-- Financial Expenditure Bar -->
              <div class="space-y-1">
                <div class="flex justify-between text-caption font-medium">
                  <span class="text-slate-700">Disbursed Expenditure Progress</span>
                  <span id="dtl-fin-prog-val" class="font-bold text-slate-900 tabular-nums">80.0%</span>
                </div>
                <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div id="dtl-fin-prog-bar" class="bg-amber-600 h-full rounded-full transition-all" style="width: 80.0%;"></div>
                </div>
              </div>

              <!-- Administrative Advisory -->
              <div class="p-3 bg-amber-50 rounded-lg border border-amber-200 text-caption text-amber-950 flex items-start gap-2">
                <span class="text-base flex-shrink-0">⚠️</span>
                <div>
                  <strong>Execution Decoupling Mismatch:</strong> Expenditure is significantly leading certified physical progress on-site. MoSPI IPMD surveillance flagged this pattern as an early warning trigger for contract re-negotiation or billing disputes.
                </div>
              </div>
            </div>
          </div>

          <!-- Observed Signal Breakdown (6 Cols) -->
          <div class="lg:col-span-6 gov-card space-y-3">
            <div class="flex items-center justify-between border-b border-slate-100 pb-2">
              <div class="flex items-center gap-2">
                <h3 class="text-card-title">Key Operational Execution Signals</h3>
                <span class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-100 text-slate-700 uppercase tracking-wider">
                  OBSERVED
                </span>
              </div>
              <span class="text-caption font-mono text-slate-400">Quarterly Return</span>
            </div>

            <div id="dtl-signals-container" class="space-y-2 pt-1">
              <div class="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 text-caption">
                <div>
                  <span class="font-semibold text-slate-900">Physical Works Accomplished</span>
                  <span class="text-slate-500 block text-[11px]">Earthwork, viaduct subgrade completed</span>
                </div>
                <span id="sig-phys" class="font-bold text-slate-900 tabular-nums text-sm">42.5%</span>
              </div>
              <div class="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 text-caption">
                <div>
                  <span class="font-semibold text-slate-900">Total Funds Disbursed</span>
                  <span class="text-slate-500 block text-[11px]">80.0% of approved revised estimate</span>
                </div>
                <span id="sig-exp" class="font-bold text-slate-900 tabular-nums text-sm">₹1,472.4 Cr</span>
              </div>
              <div class="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 text-caption">
                <div>
                  <span class="font-semibold text-slate-900">Critical-Path Checkpoints Delayed</span>
                  <span class="text-slate-500 block text-[11px]">Milestones delayed beyond baseline schedule</span>
                </div>
                <span id="sig-ms" class="font-bold text-red-700 tabular-nums text-sm">4 / 8 Delayed</span>
              </div>
            </div>
          </div>

        </div>

        <!-- TreeSHAP Explainability Waterfall & Milestones -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <!-- TreeSHAP Drivers (5 Cols) -->
          <div class="lg:col-span-5 gov-card space-y-3">
            <div class="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-card-title">TreeSHAP Explainability Decomposition</h3>
                  <span class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-800 uppercase tracking-wider">
                    EXPLAINABLE AI
                  </span>
                </div>
                <p class="text-caption text-slate-500">Exact Shapley attributions explaining why project is flagged</p>
              </div>
              <span class="text-caption font-mono text-slate-400">Σ = 100%</span>
            </div>

            <!-- Explainability Tooltip Notice -->
            <div class="text-[11px] text-slate-500 italic">
              * Feature contribution to model prediction; not a causal certainty.
            </div>

            <div id="dtl-drivers-container" class="space-y-3 pt-1">
              <div class="space-y-1">
                <div class="flex items-center justify-between text-caption">
                  <span class="font-medium text-slate-800">1. Land Acquisition Impasse</span>
                  <span class="font-semibold text-blue-900 tabular-nums">52.0% impact</span>
                </div>
                <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div class="bg-blue-700 h-full rounded-full" style="width: 52%;"></div>
                </div>
                <div class="text-[11px] text-slate-500 leading-tight">ROW handover pending in Krishna river basin section</div>
              </div>

              <div class="space-y-1">
                <div class="flex items-center justify-between text-caption">
                  <span class="font-medium text-slate-800">2. Milestone Slippage Velocity</span>
                  <span class="font-semibold text-blue-900 tabular-nums">28.0% impact</span>
                </div>
                <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div class="bg-blue-700 h-full rounded-full" style="width: 28%;"></div>
                </div>
                <div class="text-[11px] text-slate-500 leading-tight">4 critical-path intermediate milestones delayed</div>
              </div>

              <div class="space-y-1">
                <div class="flex items-center justify-between text-caption">
                  <span class="font-medium text-slate-800">3. Progress Decoupling Gap</span>
                  <span class="font-semibold text-blue-900 tabular-nums">20.0% impact</span>
                </div>
                <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div class="bg-blue-700 h-full rounded-full" style="width: 20%;"></div>
                </div>
                <div class="text-[11px] text-slate-500 leading-tight">Financial outlay leads physical works by 37.5 pp</div>
              </div>
            </div>
          </div>

          <!-- Milestones Detailed List (7 Cols) -->
          <div class="lg:col-span-7 gov-card space-y-3">
            <div class="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 class="text-card-title">Critical Path CPM Milestones</h3>
                <p class="text-caption text-slate-500">Detailed checkpoint schedule tracking from PAIMANA monthly cycle</p>
              </div>
              <span id="dtl-milestone-count" class="text-caption font-mono text-slate-400">8 Milestones</span>
            </div>

            <div id="dtl-milestones-list" class="max-h-[360px] overflow-y-auto pr-1 space-y-2">
              <!-- Milestones dynamically injected by postRender -->
            </div>
          </div>

        </div>

        <!-- Active Project Early Warnings & Operational Triage -->
        <div class="gov-card border-red-200 bg-white space-y-3">
          <div class="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-card-title text-slate-900 font-bold">Active Early Warnings & Operational Triage</h3>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                  SURVEILLANCE RADAR
                </span>
              </div>
              <p class="text-caption text-slate-500">Automated structural anomalies detected on this project requiring administrative intervention</p>
            </div>
            <span class="text-[11px] text-slate-400 font-mono">Role: Monitoring Officer / Admin</span>
          </div>

          <div id="dtl-warnings-container" class="space-y-3">
            <!-- Warning Card injected by postRender -->
            <div class="p-3.5 bg-red-50/60 rounded-lg border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white">CRITICAL • P1</span>
                  <span class="font-bold text-slate-900 text-sm">Severe Decoupling Gap & Milestone Slippage</span>
                  <span id="dtl-alert-status-badge" class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300">OPEN</span>
                </div>
                <p class="text-caption text-slate-700">
                  Disbursement leads physical works by 37.5 percentage points with 4 delayed critical-path checkpoints.
                </p>
                <div class="text-[11px] text-slate-500">
                  Evidence: Expenditure: ₹1,472.4 Cr • Progress: 42.5% • Bottleneck: Land Acquisition
                </div>
              </div>

              <!-- Triage Action Buttons -->
              <div class="flex items-center gap-2 flex-shrink-0">
                <button id="btn-triage-ack" class="btn btn-secondary btn-sm" title="Acknowledge receipt of warning signal">
                  Acknowledge
                </button>
                <button id="btn-triage-review" class="btn btn-secondary btn-sm bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100" title="Start formal inter-ministerial review">
                  Start Review
                </button>
                <button id="btn-triage-resolve" class="btn btn-primary btn-sm" title="Mark friction as resolved">
                  Resolve
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ====================================================================== -->
        <!-- Phase 7: What-If Intervention Simulator (Decision Support Engine)        -->
        <!-- ====================================================================== -->
        <div class="gov-card border-blue-300 bg-white space-y-4 shadow-sm" id="whatif-simulator-container">
          <!-- Header -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div class="flex items-center gap-2.5">
              <span class="w-8 h-8 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-sm shadow-sm">⚡</span>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-card-title text-slate-900 font-bold">What-If Intervention Simulator</h3>
                  <span class="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    SCENARIO
                  </span>
                </div>
                <p class="text-caption text-slate-500">Simulate how predictive risk responds to hypothetical administrative recovery actions (zero production mutation).</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs text-slate-500">Baseline Risk:</span>
              <span id="whatif-base-badge" class="text-xs font-bold px-2.5 py-1 rounded bg-slate-100 text-slate-800 border border-slate-300 font-mono">
                78.5 / 100 — CRITICAL
              </span>
            </div>
          </div>

          <!-- Non-Causal Advisory Notice -->
          <div class="p-2.5 bg-blue-50/60 border border-blue-200 rounded text-[11px] text-blue-950 flex items-start gap-2">
            <span class="flex-shrink-0 text-sm">ℹ️</span>
            <div>
              <strong>Advisory Notice:</strong> All simulation results are <em>model-estimated sensitivity projections</em> based on the specified input assumptions. This tool provides decision-support analysis and does <strong>not</strong> constitute an operational guarantee, automated sanction, or causal certainty.
            </div>
          </div>

          <!-- Configuration Matrix: Presets + Variable Controls -->
          <div class="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-3">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <!-- Preset Selector -->
              <div class="md:col-span-1">
                <label class="block text-xs font-bold text-slate-700 mb-1">Intervention Preset:</label>
                <select id="whatif-preset-select" class="w-full bg-white border border-slate-300 rounded p-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <option value="CUSTOM">Custom Scenario</option>
                  <option value="PRESET_PROCUREMENT">Accelerate Procurement & Approvals (Clear Bottleneck)</option>
                  <option value="PRESET_MILESTONE">Recover Delayed Milestones (50% Recovery)</option>
                  <option value="PRESET_PROGRESS">Physical Construction Velocity Boost (+5%)</option>
                  <option value="PRESET_COMPREHENSIVE">Comprehensive Turnaround Package</option>
                </select>
              </div>

              <!-- Scenario Name -->
              <div class="md:col-span-2">
                <label class="block text-xs font-bold text-slate-700 mb-1">Scenario Title:</label>
                <input type="text" id="whatif-scenario-name" value="Hypothetical Intervention Analysis" class="w-full bg-white border border-slate-300 rounded p-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="e.g. Fast-Track Statutory Clearance Sensitivity">
              </div>
            </div>

            <!-- Controlled Variables Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <!-- Variable 1: Primary Statutory Bottleneck -->
              <div class="p-2.5 bg-white rounded border border-slate-200 space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="text-[11px] font-bold text-slate-700">Primary Bottleneck</span>
                  <span class="text-[10px] text-slate-400 font-mono">Category Lever</span>
                </div>
                <select id="whatif-input-bottleneck" class="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs text-slate-800 font-medium">
                  <option value="LAND_ACQUISITION">Land Acquisition (Current)</option>
                  <option value="ENVIRONMENTAL">Environmental & Forest</option>
                  <option value="CONTRACTOR">Contractor Liquidity / EPC</option>
                  <option value="ROW">Right of Way (RoW)</option>
                  <option value="NONE">NONE (Fully Resolved)</option>
                </select>
                <div class="text-[10px] text-slate-500">Assumes clearance barriers resolved via single-window cell.</div>
              </div>

              <!-- Variable 2: Delayed Milestones Recovery -->
              <div class="p-2.5 bg-white rounded border border-slate-200 space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="text-[11px] font-bold text-slate-700">Delayed Milestones</span>
                  <span id="whatif-milestones-val" class="font-mono font-bold text-xs text-blue-900 bg-blue-50 px-1.5 py-0.2 rounded">4</span>
                </div>
                <input type="range" id="whatif-input-milestones-slider" min="0" max="8" value="4" class="w-full accent-blue-700 cursor-pointer">
                <div class="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>0 (All Recovered)</span>
                  <span id="whatif-milestones-max">8 Max</span>
                </div>
              </div>

              <!-- Variable 3: Physical Progress Acceleration -->
              <div class="p-2.5 bg-white rounded border border-slate-200 space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="text-[11px] font-bold text-slate-700">Physical Progress %</span>
                  <span id="whatif-progress-val" class="font-mono font-bold text-xs text-blue-900 bg-blue-50 px-1.5 py-0.2 rounded">42.5%</span>
                </div>
                <input type="range" id="whatif-input-progress-slider" min="42.5" max="100.0" step="0.5" value="42.5" class="w-full accent-blue-700 cursor-pointer">
                <div class="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span id="whatif-progress-base">42.5% Base</span>
                  <span>100% Complete</span>
                </div>
              </div>
            </div>

            <!-- Action Bar -->
            <div class="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-200">
              <span class="text-[11px] text-slate-500">
                🔒 In-memory simulation: production project records are never modified.
              </span>
              <div class="flex items-center gap-2">
                <button type="button" id="btn-toggle-sensitivity" class="btn btn-secondary btn-sm text-xs" title="Open multi-point parameter sensitivity analysis">
                  <span>📈</span> Sensitivity Curve
                </button>
                <button type="button" id="btn-run-scenario" class="btn btn-primary btn-sm flex items-center gap-1.5 shadow-sm">
                  <span>🚀</span> Run Simulation
                  <span id="btn-sim-spinner" class="hidden animate-spin">⏳</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Simulation Comparative Results Panel (Hidden until run) -->
          <div id="whatif-results-wrapper" class="hidden space-y-4 pt-2">
            <div class="flex items-center justify-between border-b border-slate-200 pb-2">
              <div class="flex items-center gap-2">
                <span class="text-sm font-bold text-slate-900">Simulation Comparative Results</span>
                <span id="res-class-badge" class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  IMPROVED
                </span>
              </div>
              <div class="flex items-center gap-2">
                <button type="button" id="btn-save-scenario" class="btn btn-secondary btn-sm text-xs font-bold text-emerald-800 border-emerald-300 hover:bg-emerald-50">
                  💾 Save Scenario Record
                </button>
              </div>
            </div>

            <!-- 4 Comparative KPI Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <!-- Card 1: Composite Risk Score -->
              <div class="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col justify-between">
                <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Composite Risk Score</div>
                <div class="flex items-baseline gap-2 mt-1">
                  <span id="res-base-risk" class="text-sm font-bold text-slate-400 line-through">--</span>
                  <span class="text-xs text-slate-400">➔</span>
                  <span id="res-scen-risk" class="text-xl font-bold text-slate-900">--</span>
                </div>
                <div class="mt-1 flex items-center justify-between text-[11px]">
                  <span id="res-delta-risk" class="font-bold text-emerald-700 font-mono">--</span>
                  <span id="res-risk-transition" class="text-slate-500 text-[10px]">--</span>
                </div>
              </div>

              <!-- Card 2: Schedule Delay -->
              <div class="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col justify-between">
                <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Schedule Delay (Months)</div>
                <div class="flex items-baseline gap-2 mt-1">
                  <span id="res-base-delay" class="text-sm font-bold text-slate-400 line-through">--</span>
                  <span class="text-xs text-slate-400">➔</span>
                  <span id="res-scen-delay" class="text-xl font-bold text-slate-900">--</span>
                </div>
                <div class="mt-1 flex items-center justify-between text-[11px]">
                  <span id="res-delta-delay" class="font-bold text-emerald-700 font-mono">--</span>
                  <span id="res-delay-saved" class="text-slate-500 text-[10px]">--</span>
                </div>
              </div>

              <!-- Card 3: Cost Overrun Risk -->
              <div class="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col justify-between">
                <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cost Overrun Risk</div>
                <div class="flex items-baseline gap-2 mt-1">
                  <span id="res-base-cost" class="text-sm font-bold text-slate-400 line-through">--</span>
                  <span class="text-xs text-slate-400">➔</span>
                  <span id="res-scen-cost" class="text-xl font-bold text-slate-900">--</span>
                </div>
                <div class="mt-1 flex items-center justify-between text-[11px]">
                  <span id="res-delta-cost" class="font-bold text-emerald-700 font-mono">--</span>
                  <span id="res-cost-cr" class="text-slate-500 text-[10px]">--</span>
                </div>
              </div>

              <!-- Card 4: Implementation Distress -->
              <div class="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col justify-between">
                <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Implementation Distress</div>
                <div class="flex items-baseline gap-2 mt-1">
                  <span id="res-base-impl" class="text-sm font-bold text-slate-400 line-through">--</span>
                  <span class="text-xs text-slate-400">➔</span>
                  <span id="res-scen-impl" class="text-xl font-bold text-slate-900">--</span>
                </div>
                <div class="mt-1 flex items-center justify-between text-[11px]">
                  <span id="res-delta-impl" class="font-bold text-emerald-700 font-mono">--</span>
                  <span id="res-impl-band" class="text-slate-500 text-[10px]">--</span>
                </div>
              </div>
            </div>

            <!-- Warning Preview Banner -->
            <div id="res-warning-banner" class="p-2.5 bg-amber-50 border border-amber-200 rounded text-xs text-amber-950 flex items-start gap-2">
              <span class="text-base flex-shrink-0">⚠️</span>
              <div id="res-warning-text">
                Predicted risk band shifts under scenario assumptions. Active Phase 6 radar warnings remain unchanged.
              </div>
            </div>
          </div>

          <!-- Sensitivity Analysis Drawer (Collapsible) -->
          <div id="whatif-sensitivity-panel" class="hidden p-3.5 bg-slate-50 rounded-lg border border-blue-200 space-y-3">
            <div class="flex items-center justify-between border-b border-slate-200 pb-2">
              <div class="flex items-center gap-2">
                <span class="text-sm font-bold text-slate-800">📊 Multi-Point Sensitivity Analysis</span>
                <span class="text-[10px] text-slate-500 font-mono">(6-point repeated model inference)</span>
              </div>
              <button type="button" id="btn-close-sensitivity" class="text-xs text-slate-500 hover:text-slate-800">✖ Close</button>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 text-[11px]">
                    <th class="p-2">Sweep Step</th>
                    <th class="p-2">Intervention Value</th>
                    <th class="p-2">Modeled Risk Score</th>
                    <th class="p-2">Schedule Delay</th>
                    <th class="p-2">Cost Risk</th>
                    <th class="p-2">Potential Reduction</th>
                  </tr>
                </thead>
                <tbody id="sensitivity-tbody" class="divide-y divide-slate-200"></tbody>
              </table>
            </div>
          </div>

          <!-- Saved Scenarios History Panel -->
          <div id="whatif-saved-panel" class="space-y-2 pt-1 border-t border-slate-200">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-700">Saved Scenarios on Record:</span>
              <span id="saved-scenarios-count" class="text-[11px] text-slate-500">0 scenarios on record</span>
            </div>
            <div id="saved-scenarios-list" class="space-y-1.5 text-xs text-slate-600">
              <p class="text-slate-400 italic text-[11px]">No scenarios saved for this project yet. Run a simulation and click 'Save Scenario'.</p>
            </div>
          </div>
        </div>

        <!-- Project Governance & Administrative Audit Trail -->
        <div class="gov-card space-y-3">
          <div class="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-card-title text-slate-900 font-bold">Project Governance & Audit History</h3>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300 uppercase">
                  AUDIT LOG
                </span>
              </div>
              <p class="text-caption text-slate-500">Chronological administrative activity log and decision trail for this project entity</p>
            </div>
            <span class="text-[11px] text-slate-400 font-mono">Immutable SQLite Ledger</span>
          </div>

          <div id="dtl-audit-history-list" class="space-y-2 text-xs">
            <p class="text-slate-400 italic text-[11px]">Loading administrative audit trail...</p>
          </div>
        </div>

      </div>
    `;
  },

  async postRender(projectId) {
    const pId = projectId || "PRJ-DEMO-001";
    let project = null;

    if (window.APIClient) {
      project = await window.APIClient.getProject(pId, true);
    }

    if (project) {
      this.populateProjectDOM(project);
    }

    // Load Audit History for this project
    this.loadProjectAuditHistory(pId);

    // Render Role-Tailored Adaptive Intelligence Flight Deck
    this.renderRoleAdaptiveBanner(pId, project);

    // Setup What-If Simulator
    this.setupWhatIfSimulator(pId, project);

    // Setup Warning Triage Buttons
    this.setupWarningTriage(pId);
  },

  renderRoleAdaptiveBanner(pId, project) {
    const bannerMount = document.getElementById("dtl-role-adaptive-banner");
    if (!bannerMount) return;

    const user = (window.APIClient && window.APIClient.currentUser) ? window.APIClient.currentUser : { role: "ADMIN", name: "Institutional User" };
    const role = (user.role || "ADMIN").toUpperCase();
    const projName = (project && project.project_name) ? project.project_name : "Corridor Project";
    const ministry = (project && project.ministry) ? project.ministry : "Central Ministry";

    let html = "";

    if (role === "NATIONAL_LEADER" || role === "MINISTER") {
      html = `
        <div class="p-4 rounded-xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white border border-indigo-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs border border-indigo-400/30">🏛️</span>
              <span class="text-xs font-bold uppercase tracking-wider text-indigo-300">National Executive Flight Deck • ${user.name}</span>
              <span class="px-2 py-0.2 rounded text-[10px] font-extrabold bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">MINISTERIAL OVERSIGHT</span>
            </div>
            <p class="text-sm font-semibold text-slate-100">National Governance Authority Active for ${pId}</p>
            <p class="text-xs text-slate-300 max-w-3xl">
              You hold statutory authority to issue enforceable downward directives to ${ministry} and executing project directors. Inter-ministerial coordination reviews and cabinet escalations can be executed directly from this portal.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2 flex-shrink-0">
            <a href="#/directives" class="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5">
              <span>📜</span> Issue Binding Directive
            </a>
            <a href="#/ministry" class="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5">
              <span>🏛️</span> Ministry Command
            </a>
            <button type="button" onclick="document.getElementById('whatif-simulator-container')?.scrollIntoView({ behavior: 'smooth' })" class="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5">
              <span>⚡</span> Policy What-If
            </button>
          </div>
        </div>
      `;
    } else if (role === "MINISTRY_OFFICIAL" || role === "OFFICIAL") {
      html = `
        <div class="p-4 rounded-xl bg-gradient-to-r from-cyan-950 via-slate-900 to-cyan-900 text-white border border-cyan-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs border border-cyan-400/30">🏢</span>
              <span class="text-xs font-bold uppercase tracking-wider text-cyan-300">Ministry Secretarial Oversight • ${user.name}</span>
              <span class="px-2 py-0.2 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-200 border border-cyan-400/30">SECRETARY DESK</span>
            </div>
            <p class="text-sm font-semibold text-slate-100">${ministry} Executive Control Desk</p>
            <p class="text-xs text-slate-300 max-w-3xl">
              Surveillance jurisdiction over state clearances, forest approvals, and implementing agency milestones. Issue department-level compliance notices and track resolution SLAs.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2 flex-shrink-0">
            <a href="#/ministry" class="px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5">
              <span>🏛️</span> Ministry Command Center
            </a>
            <a href="#/directives" class="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5">
              <span>📜</span> Issue Directive
            </a>
            <button type="button" onclick="document.getElementById('whatif-simulator-container')?.scrollIntoView({ behavior: 'smooth' })" class="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5">
              <span>⚡</span> Fast-Track Scenario
            </button>
          </div>
        </div>
      `;
    } else if (role === "PROJECT_MANAGER" || role === "PM") {
      html = `
        <div class="p-4 rounded-xl bg-gradient-to-r from-sky-950 via-slate-900 to-sky-900 text-white border border-sky-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center font-bold text-xs border border-sky-400/30">🛣️</span>
              <span class="text-xs font-bold uppercase tracking-wider text-sky-300">Corridor Project Director Desk • ${user.name}</span>
              <span class="px-2 py-0.2 rounded text-[10px] font-bold bg-sky-500/20 text-sky-200 border border-sky-400/30">PROJECT DIRECTOR</span>
            </div>
            <p class="text-sm font-semibold text-slate-100">Operational Jurisdiction for ${pId}</p>
            <p class="text-xs text-slate-300 max-w-3xl">
              You are assigned direct execution responsibility for this corridor. Review package contractor claims, track intermediate CPM milestones, resolve contractor liquidity/RoW impasses, and test recovery packages in What-If simulator.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2 flex-shrink-0">
            <a href="#/my-projects" class="px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5">
              <span>🛣️</span> Corridors Desk
            </a>
            <button type="button" onclick="document.getElementById('whatif-simulator-container')?.scrollIntoView({ behavior: 'smooth' })" class="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5">
              <span>⚡</span> Run What-If Simulator
            </button>
            <a href="#/engineer" class="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5">
              <span>👷</span> Engineering Station
            </a>
          </div>
        </div>
      `;
    } else if (role === "ENGINEER") {
      html = `
        <div class="p-4 rounded-xl bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white border border-emerald-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs border border-emerald-400/30">👷</span>
              <span class="text-xs font-bold uppercase tracking-wider text-emerald-300">Site & Technical Engineer Station • ${user.name}</span>
              <span class="px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">EXECUTIVE RESIDENT ENGINEER</span>
            </div>
            <p class="text-sm font-semibold text-slate-100">Technical Verification & Critical Path CPM Station</p>
            <p class="text-xs text-slate-300 max-w-3xl">
              Inspect physical checkpoint completion, log structural defect tickets, review civil drawings and geotechnical reports, and verify contractor payment certificate decoupling gaps.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2 flex-shrink-0">
            <a href="#/engineer" class="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5">
              <span>👷</span> Engineering Station
            </a>
            <a href="#/engineer" class="px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5">
              <span>📝</span> Log Site Defect
            </a>
            <a href="#/field" class="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5">
              <span>🚜</span> Field Tasks
            </a>
          </div>
        </div>
      `;
    } else if (role === "FIELD_WORKER" || role === "FIELD") {
      html = `
        <div class="p-4 rounded-xl bg-gradient-to-r from-amber-950 via-slate-900 to-amber-900 text-white border border-amber-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs border border-amber-400/30">🚜</span>
              <span class="text-xs font-bold uppercase tracking-wider text-amber-300">Field Operations Station • ${user.name}</span>
              <span class="px-2 py-0.2 rounded text-[10px] font-bold bg-amber-500/20 text-amber-200 border border-amber-400/30">SITE SUPERVISOR</span>
            </div>
            <p class="text-sm font-semibold text-slate-100">Ground Telemetry & Daily Task Execution</p>
            <p class="text-xs text-slate-300 max-w-3xl">
              Touch-optimized mobile station active. Update daily task status (TODO / IN_PROGRESS / BLOCKED / COMPLETED), report material shortages, submit photo evidence, and flag emergency stop-work conditions.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2 flex-shrink-0">
            <a href="#/field" class="px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5">
              <span>🚜</span> Open Field Workstation
            </a>
            <a href="#/field" class="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5">
              <span>🛑</span> Report Work Stoppage
            </a>
          </div>
        </div>
      `;
    } else if (role === "ANALYST") {
      html = `
        <div class="p-4 rounded-xl bg-gradient-to-r from-violet-950 via-slate-900 to-violet-900 text-white border border-violet-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-violet-500/20 text-violet-300 flex items-center justify-center font-bold text-xs border border-violet-400/30">📊</span>
              <span class="text-xs font-bold uppercase tracking-wider text-violet-300">Predictive Risk & Model Audit • ${user.name}</span>
              <span class="px-2 py-0.2 rounded text-[10px] font-bold bg-violet-500/20 text-violet-200 border border-violet-400/30">DATA SCIENCE</span>
            </div>
            <p class="text-sm font-semibold text-slate-100">LightGBM Predictive Inference & SHAP Attribution Audit</p>
            <p class="text-xs text-slate-300 max-w-3xl">
              Inspect multi-target model sensitivities (Schedule Delay Months, Cost Probability %, Implementation Distress). Run multi-point numerical sweeps to assess non-causal elasticities across project levers.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2 flex-shrink-0">
            <button type="button" onclick="document.getElementById('btn-run-sensitivity')?.click()" class="px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5">
              <span>📊</span> Run Sensitivity Sweep
            </button>
            <a href="#/compare" class="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5">
              <span>⚖️</span> Peer Benchmarking
            </a>
            <a href="#/analytics" class="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5">
              <span>📈</span> Portfolio Matrix
            </a>
          </div>
        </div>
      `;
    } else {
      // ADMIN or default institutional
      html = `
        <div class="p-4 rounded-xl bg-gradient-to-r from-purple-950 via-slate-900 to-purple-900 text-white border border-purple-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs border border-purple-400/30">🛡️</span>
              <span class="text-xs font-bold uppercase tracking-wider text-purple-300">Central Administrative Superuser • ${user.name}</span>
              <span class="px-2 py-0.2 rounded text-[10px] font-bold bg-purple-500/20 text-purple-200 border border-purple-400/30">FULL ACCESS</span>
            </div>
            <p class="text-sm font-semibold text-slate-100">MoSPI / IPMD National Infrastructure Surveillance</p>
            <p class="text-xs text-slate-300 max-w-3xl">
              Unrestricted national access across all 10,000 projects, early warning alerts, downward directives, and immutable SQLite governance ledgers.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2 flex-shrink-0">
            <a href="#/ministry" class="px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5">
              <span>🏛️</span> Ministry
            </a>
            <a href="#/my-projects" class="px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5">
              <span>🛣️</span> Corridors
            </a>
            <a href="#/engineer" class="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5">
              <span>👷</span> Engineer
            </a>
            <a href="#/field" class="px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5">
              <span>🚜</span> Field
            </a>
            <a href="#/directives" class="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5">
              <span>📜</span> Directives
            </a>
          </div>
        </div>
      `;
    }

    bannerMount.innerHTML = html;
  },

  populateProjectDOM(p) {
    const elName = document.getElementById("dtl-project-name");
    const elMin = document.getElementById("dtl-ministry");
    const elSec = document.getElementById("dtl-sector");
    const elAgency = document.getElementById("dtl-agency");
    const elState = document.getElementById("dtl-state");
    const elStart = document.getElementById("dtl-start-date");
    const elPlan = document.getElementById("dtl-plan-date");
    const elRev = document.getElementById("dtl-rev-date");
    const elOrigCost = document.getElementById("dtl-orig-cost");
    const elRevCost = document.getElementById("dtl-rev-cost");
    const elExp = document.getElementById("dtl-expenditure");
    const elGrowth = document.getElementById("dtl-cost-growth");
    const elExt = document.getElementById("dtl-extensions");

    if (elName) elName.innerText = p.project_name;
    if (elMin) elMin.innerText = p.ministry;
    if (elSec) elSec.innerText = p.sector;
    if (elAgency) elAgency.innerText = p.implementing_agency;
    if (elState) elState.innerText = p.state;

    const sched = p.schedule || {};
    if (elStart) elStart.innerText = sched.start_date || "2022-09";
    if (elPlan) elPlan.innerText = sched.planned_completion_date || "2025-06";
    if (elRev) {
      const delay = sched.delay_duration_months || 0;
      elRev.innerText = `${sched.revised_completion_date || "2027-02"} (${delay} mo delay)`;
      elRev.className = delay > 0 ? "font-semibold text-orange-700 block tabular-nums" : "font-semibold text-slate-900 block tabular-nums";
    }
    if (elExt) elExt.innerText = `${sched.schedule_revisions_count || 2} formal revisions`;

    const fin = p.financials || {};
    if (elOrigCost) elOrigCost.innerText = `₹${(fin.original_cost_cr || 1250).toLocaleString("en-IN")} Cr`;
    if (elRevCost) elRevCost.innerText = `₹${(fin.revised_cost_cr || 1840.5).toLocaleString("en-IN")} Cr`;
    if (elExp) elExp.innerText = `₹${(fin.cumulative_expenditure_cr || 1472.4).toLocaleString("en-IN")} Cr`;
    if (elGrowth) {
      const orig = fin.original_cost_cr || 1;
      const rev = fin.revised_cost_cr || orig;
      const diff = rev - orig;
      const growthPct = ((diff / orig) * 100).toFixed(1);
      elGrowth.innerText = diff > 0 ? `+${growthPct}% (+₹${diff.toFixed(1)} Cr)` : "On budget (0%)";
    }

    // Progress & Decoupling
    const prog = p.progress || {};
    const physProg = prog.physical_progress_pct || 42.5;
    const finProg = prog.financial_progress_pct || 80.0;
    const gap = prog.progress_gap_pct || (finProg - physProg);

    const elPhysVal = document.getElementById("dtl-phys-prog-val");
    const elPhysBar = document.getElementById("dtl-phys-prog-bar");
    const elFinVal = document.getElementById("dtl-fin-prog-val");
    const elFinBar = document.getElementById("dtl-fin-prog-bar");
    const elGap = document.getElementById("dtl-gap-badge");

    if (elPhysVal) elPhysVal.innerText = `${physProg.toFixed(1)}%`;
    if (elPhysBar) elPhysBar.style.width = `${physProg}%`;
    if (elFinVal) elFinVal.innerText = `${finProg.toFixed(1)}%`;
    if (elFinBar) elFinBar.style.width = `${Math.min(100, finProg)}%`;
    if (elGap) {
      elGap.innerText = `Decoupling: ${gap > 0 ? '+' : ''}${gap.toFixed(1)} pp`;
      elGap.className = gap > 15 
        ? "px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800 border border-red-200 font-mono"
        : "px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200 font-mono";
    }

    // Risk Scores
    const r = p.risk || {};
    const scoreVal = document.getElementById("dtl-score-val");
    const scoreBadge = document.getElementById("dtl-risk-badge");
    const riskHead = document.getElementById("dtl-risk-headline");
    const subSched = document.getElementById("dtl-sub-schedule");
    const subCost = document.getElementById("dtl-sub-cost");
    const subImpl = document.getElementById("dtl-sub-impl");
    const pDriver = document.getElementById("dtl-primary-driver");
    const whatifBadge = document.getElementById("whatif-base-badge");

    if (scoreVal) scoreVal.innerHTML = `${r.overall_score || 78.5} <span class="text-lg text-slate-400 font-normal">/ 100</span>`;
    if (scoreBadge) scoreBadge.innerHTML = CommonUI.renderRiskBadge(r.level || "CRITICAL", r.overall_score || 78.5);
    if (whatifBadge) whatifBadge.innerText = `${r.overall_score || 78.5} / 100 — ${r.level || 'CRITICAL'}`;

    if (subSched) subSched.innerText = `${sched.delay_duration_months || 20.0} mos`;
    if (subCost) subCost.innerText = `${r.cost_score || 84.2}% prob`;
    if (subImpl) subImpl.innerText = `${r.implementation_score || 85.0}%`;
    if (pDriver) pDriver.innerText = r.primary_driver || "Land Acquisition Constraints";

    // TreeSHAP Drivers
    const driversCont = document.getElementById("dtl-drivers-container");
    if (driversCont && r.drivers && r.drivers.length > 0) {
      driversCont.innerHTML = r.drivers.map((d, i) => `
        <div class="space-y-1">
          <div class="flex items-center justify-between text-caption">
            <span class="font-medium text-slate-800">${i + 1}. ${d.name}</span>
            <span class="font-semibold text-blue-900 tabular-nums">${d.strength_pct}% impact</span>
          </div>
          <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div class="bg-blue-700 h-full rounded-full" style="width: ${d.strength_pct}%;"></div>
          </div>
          <div class="text-[11px] text-slate-500 leading-tight">${d.evidence}</div>
        </div>
      `).join("");
    }

    // Milestones List
    const msList = document.getElementById("dtl-milestones-list");
    const msCount = document.getElementById("dtl-milestone-count");
    if (msList && p.milestones) {
      if (msCount) msCount.innerText = `${p.milestones.length} Milestones`;
      msList.innerHTML = p.milestones.map(m => {
        let bClass = "bg-green-50 text-green-700 border-green-200";
        if (m.status === "Delayed") bClass = "bg-red-50 text-red-700 border-red-200";
        else if (m.status === "At Risk") bClass = "bg-amber-50 text-amber-700 border-amber-200";

        return `
          <div class="p-2.5 rounded-lg border border-slate-200 bg-white flex items-start justify-between gap-3 text-caption">
            <div class="space-y-0.5">
              <div class="flex items-center gap-2">
                <span class="font-mono text-[11px] text-slate-400 font-semibold">${m.id}</span>
                <strong class="text-slate-900">${m.name}</strong>
              </div>
              <div class="text-[11px] text-slate-500">
                Planned: <span class="tabular-nums font-medium text-slate-700">${m.planned_date}</span>
                ${m.dependency && m.dependency !== "None" ? ` • Constraint: <span class="text-slate-600">${m.dependency}</span>` : ''}
              </div>
            </div>
            <div class="text-right flex-shrink-0">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold border ${bClass}">
                ${m.status}
              </span>
              ${m.delay_days > 0 ? `
                <span class="block text-[10px] text-red-600 font-medium tabular-nums mt-0.5">
                  +${m.delay_days} days lag
                </span>
              ` : ''}
            </div>
          </div>
        `;
      }).join("");
    }
  },

  async loadProjectAuditHistory(projectId) {
    const listCont = document.getElementById("dtl-audit-history-list");
    if (!listCont) return;

    let logs = [];
    if (window.APIClient) {
      logs = await window.APIClient.getProjectAuditHistory(projectId);
    }

    if (!logs || logs.length === 0) {
      listCont.innerHTML = `<p class="text-slate-400 italic text-[11px]">No previous administrative actions recorded for ${projectId}. Actions will appear here as decisions are made.</p>`;
      return;
    }

    listCont.innerHTML = logs.map(l => `
      <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start justify-between gap-3">
        <div class="space-y-0.5">
          <div class="flex items-center gap-2">
            <span class="font-bold text-slate-900">${l.action}</span>
            <span class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-800">${l.role}</span>
            <span class="text-slate-400">•</span>
            <span class="text-slate-600">${l.actor}</span>
          </div>
          <p class="text-[11px] text-slate-500">${l.details || l.resource}</p>
        </div>
        <div class="text-[10px] text-slate-400 font-mono tabular-nums whitespace-nowrap">
          ${l.timestamp ? l.timestamp.replace("T", " ").replace("Z", "") : ''}
        </div>
      </div>
    `).join("");
  },

  setupWarningTriage(projectId) {
    const btnAck = document.getElementById("btn-triage-ack");
    const btnReview = document.getElementById("btn-triage-review");
    const btnResolve = document.getElementById("btn-triage-resolve");
    const alertBadge = document.getElementById("dtl-alert-status-badge");

    const alertId = projectId === "PRJ-DEMO-001" ? "ALT-DEMO-001" : "ALT-00001";

    const updateStatus = async (newStatus) => {
      if (!window.APIClient) return;
      const res = await window.APIClient.updateAlertStatus(alertId, newStatus, `Triaged by official for ${projectId}`);
      if (res && !res.error) {
        if (alertBadge) {
          alertBadge.innerText = newStatus;
          alertBadge.className = newStatus === "RESOLVED" 
            ? "px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300"
            : newStatus === "UNDER REVIEW"
            ? "px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300"
            : "px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300";
        }
        // Refresh audit trail
        this.loadProjectAuditHistory(projectId);
      }
    };

    if (btnAck) btnAck.addEventListener("click", () => updateStatus("ACKNOWLEDGED"));
    if (btnReview) btnReview.addEventListener("click", () => updateStatus("UNDER REVIEW"));
    if (btnResolve) btnResolve.addEventListener("click", () => updateStatus("RESOLVED"));
  },

  setupWhatIfSimulator(projectId, project) {
    const pId = projectId;
    const presetSelect = document.getElementById("whatif-preset-select");
    const nameInput = document.getElementById("whatif-scenario-name");
    const inputBottleneck = document.getElementById("whatif-input-bottleneck");
    const sliderMilestones = document.getElementById("whatif-input-milestones-slider");
    const valMilestones = document.getElementById("whatif-milestones-val");
    const sliderProgress = document.getElementById("whatif-input-progress-slider");
    const valProgress = document.getElementById("whatif-progress-val");

    const btnRun = document.getElementById("btn-run-scenario");
    const btnSpinner = document.getElementById("btn-sim-spinner");
    const btnSensitivity = document.getElementById("btn-toggle-sensitivity");
    const btnSave = document.getElementById("btn-save-scenario");
    const resultsWrapper = document.getElementById("whatif-results-wrapper");
    const sensitivityPanel = document.getElementById("whatif-sensitivity-panel");
    const btnCloseSens = document.getElementById("btn-close-sensitivity");

    let currentSimulationResult = null;

    if (sliderMilestones && valMilestones) {
      sliderMilestones.addEventListener("input", () => {
        valMilestones.innerText = sliderMilestones.value;
      });
    }

    if (sliderProgress && valProgress) {
      sliderProgress.addEventListener("input", () => {
        valProgress.innerText = `${parseFloat(sliderProgress.value).toFixed(1)}%`;
      });
    }

    if (presetSelect) {
      presetSelect.addEventListener("change", () => {
        const sel = presetSelect.value;
        if (sel === "PRESET_PROCUREMENT") {
          if (nameInput) nameInput.value = "Fast-Track Statutory Clearance";
          if (inputBottleneck) inputBottleneck.value = "NONE";
        } else if (sel === "PRESET_MILESTONE") {
          if (nameInput) nameInput.value = "Critical Path Milestone Float Recovery";
          if (sliderMilestones && valMilestones) {
            sliderMilestones.value = 2;
            valMilestones.innerText = 2;
          }
        } else if (sel === "PRESET_PROGRESS") {
          if (nameInput) nameInput.value = "Physical Construction Velocity Acceleration";
          if (sliderProgress && valProgress) {
            const cur = parseFloat(sliderProgress.min || 42.5);
            const target = Math.min(100, cur + 5);
            sliderProgress.value = target;
            valProgress.innerText = `${target.toFixed(1)}%`;
          }
        } else if (sel === "PRESET_COMPREHENSIVE") {
          if (nameInput) nameInput.value = "Comprehensive Institutional Turnaround Package";
          if (inputBottleneck) inputBottleneck.value = "NONE";
          if (sliderMilestones && valMilestones) {
            sliderMilestones.value = 1;
            valMilestones.innerText = 1;
          }
          if (sliderProgress && valProgress) {
            const cur = parseFloat(sliderProgress.min || 42.5);
            const target = Math.min(100, cur + 7.5);
            sliderProgress.value = target;
            valProgress.innerText = `${target.toFixed(1)}%`;
          }
        }
      });
    }

    const runSimulation = async () => {
      if (!window.APIClient) return;
      if (btnRun) btnRun.disabled = true;
      if (btnSpinner) btnSpinner.classList.remove("hidden");

      const mods = [];
      if (inputBottleneck) {
        mods.push({ feature: "primary_bottleneck", scenario_value: inputBottleneck.value });
      }
      if (sliderMilestones) {
        mods.push({ feature: "milestones_delayed", scenario_value: parseInt(sliderMilestones.value) });
      }
      if (sliderProgress) {
        mods.push({ feature: "physical_progress_pct", scenario_value: parseFloat(sliderProgress.value) });
      }

      const payload = {
        project_id: pId,
        scenario_name: nameInput ? nameInput.value : "Hypothetical Scenario",
        modifications: mods,
        created_by: window.APIClient.currentUser ? window.APIClient.currentUser.name : "IPMD Officer"
      };

      try {
        const res = await window.APIClient.simulateScenario(payload);
        if (res && !res.error && res.scenario) {
          currentSimulationResult = res;

          if (resultsWrapper) resultsWrapper.classList.remove("hidden");
          if (btnSave) btnSave.classList.remove("hidden");

          const rBaseRisk = document.getElementById("res-base-risk");
          const rScenRisk = document.getElementById("res-scen-risk");
          const rDeltaRisk = document.getElementById("res-delta-risk");
          const rClassBadge = document.getElementById("res-class-badge");

          if (rBaseRisk) rBaseRisk.innerText = `${res.baseline.overall_risk_score}`;
          if (rScenRisk) rScenRisk.innerText = `${res.scenario.overall_risk_score}`;
          if (rDeltaRisk) rDeltaRisk.innerText = res.delta.risk_score_display;
          if (rClassBadge) {
            rClassBadge.innerText = res.delta.classification;
            rClassBadge.className = res.delta.classification === "IMPROVED" 
              ? "px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800"
              : "px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800";
          }

          const rRiskTrans = document.getElementById("res-risk-transition");
          if (rRiskTrans) rRiskTrans.innerText = res.delta.risk_band_transition;

          const rBaseDelay = document.getElementById("res-base-delay");
          const rScenDelay = document.getElementById("res-scen-delay");
          const rDeltaDelay = document.getElementById("res-delta-delay");
          const rDelaySaved = document.getElementById("res-delay-saved");

          if (rBaseDelay) rBaseDelay.innerText = `${res.baseline.predicted_delay_months.toFixed(1)}m`;
          if (rScenDelay) rScenDelay.innerText = `${res.scenario.predicted_delay_months.toFixed(1)}m`;
          if (rDeltaDelay) rDeltaDelay.innerText = res.delta.schedule_delay_display;
          if (rDelaySaved) rDelaySaved.innerText = `${res.delta.delay_reduction_months.toFixed(1)} mos saved`;

          const rBaseCost = document.getElementById("res-base-cost");
          const rScenCost = document.getElementById("res-scen-cost");
          const rDeltaCost = document.getElementById("res-delta-cost");
          const rCostCr = document.getElementById("res-cost-cr");

          if (rBaseCost) rBaseCost.innerText = `${(res.baseline.cost_probability * 100).toFixed(0)}%`;
          if (rScenCost) rScenCost.innerText = `${(res.scenario.cost_probability * 100).toFixed(0)}%`;
          if (rDeltaCost) rDeltaCost.innerText = res.delta.cost_probability_display;
          if (rCostCr) rCostCr.innerText = `₹${res.delta.capital_saved_cr.toFixed(1)} Cr saved`;

          const rBaseImpl = document.getElementById("res-base-impl");
          const rScenImpl = document.getElementById("res-scen-impl");
          const rDeltaImpl = document.getElementById("res-delta-impl");
          const rImplBand = document.getElementById("res-impl-band");

          if (rBaseImpl) rBaseImpl.innerText = `${(res.baseline.implementation_probability * 100).toFixed(0)}%`;
          if (rScenImpl) rScenImpl.innerText = `${(res.scenario.implementation_probability * 100).toFixed(0)}%`;
          if (rDeltaImpl) rDeltaImpl.innerText = res.delta.implementation_probability_display;
          if (rImplBand) rImplBand.innerText = res.scenario.implementation_risk_band;

          const warnText = document.getElementById("res-warning-text");
          if (warnText) warnText.innerText = res.warning_preview;

          window.APIClient.showToast("Simulation completed", "success");
          this.loadProjectAuditHistory(pId);
        } else {
          window.APIClient.showToast(res ? res.error : "Simulation error", "error");
        }
      } catch (err) {
        console.error("Simulation error:", err);
      } finally {
        if (btnRun) btnRun.disabled = false;
        if (btnSpinner) btnSpinner.classList.add("hidden");
      }
    };

    if (btnRun) btnRun.addEventListener("click", runSimulation);

    // Save Scenario
    if (btnSave) {
      btnSave.addEventListener("click", async () => {
        if (!currentSimulationResult) return;
        const res = await window.APIClient.saveScenario(currentSimulationResult.scenario_id, currentSimulationResult);
        if (res && res.status === "success") {
          loadSavedScenarios();
          this.loadProjectAuditHistory(pId);
        }
      });
    }

    // Toggle Sensitivity Panel
    if (btnSensitivity && sensitivityPanel) {
      btnSensitivity.addEventListener("click", async () => {
        sensitivityPanel.classList.toggle("hidden");
        if (!sensitivityPanel.classList.contains("hidden")) {
          const tbody = document.getElementById("sensitivity-tbody");
          if (tbody) tbody.innerHTML = `<tr><td colspan="6" class="p-3 text-center text-slate-400">Computing 6-step sensitivity curve...</td></tr>`;

          const curProg = parseFloat(sliderProgress ? sliderProgress.value : 42.5);
          const sensRes = await window.APIClient.runSensitivity({
            project_id: pId,
            feature_name: "physical_progress_pct",
            min_value: curProg,
            max_value: Math.min(100.0, curProg + 25.0),
            steps: 6
          });

          if (sensRes && sensRes.points) {
            tbody.innerHTML = sensRes.points.map(pt => `
              <tr class="hover:bg-slate-50">
                <td class="p-2 font-mono text-[11px] text-slate-400">Step ${pt.step}</td>
                <td class="p-2 font-bold font-mono text-slate-900">${pt.feature_value.toFixed(1)}%</td>
                <td class="p-2 font-bold font-mono ${pt.overall_risk_score < 60 ? 'text-emerald-700' : 'text-slate-800'}">${pt.overall_risk_score.toFixed(1)} / 100</td>
                <td class="p-2 font-mono text-slate-700">${pt.predicted_delay_months.toFixed(1)} mos</td>
                <td class="p-2 font-mono text-slate-700">${(pt.cost_probability * 100).toFixed(0)}%</td>
                <td class="p-2 font-bold font-mono text-emerald-700">${pt.risk_reduction_pts > 0 ? '-' + pt.risk_reduction_pts.toFixed(1) + ' pts' : '0.0 pts'}</td>
              </tr>
            `).join("");
          }
        }
      });
    }

    if (btnCloseSens && sensitivityPanel) {
      btnCloseSens.addEventListener("click", () => sensitivityPanel.classList.add("hidden"));
    }

    // Saved Scenarios Loading
    const loadSavedScenarios = async () => {
      const listEl = document.getElementById("saved-scenarios-list");
      const countEl = document.getElementById("saved-scenarios-count");
      if (!listEl || !window.APIClient) return;

      const scns = await window.APIClient.getProjectScenarios(pId);
      if (countEl) countEl.innerText = `${scns.length} scenarios on record`;

      if (scns.length === 0) {
        listEl.innerHTML = `<p class="text-slate-400 italic text-[11px]">No saved scenarios on record. Simulate and click 'Save Scenario'.</p>`;
      } else {
        listEl.innerHTML = scns.map(s => `
          <div class="p-2 bg-white rounded border border-slate-200 flex items-center justify-between">
            <div>
              <div class="font-bold text-slate-800">${s.scenario_name}</div>
              <div class="text-[10px] text-slate-400 font-mono">${s.scenario_id} • ${new Date(s.created_at).toLocaleDateString()}</div>
            </div>
            <div class="flex items-center gap-2">
              <span class="font-mono font-bold text-xs text-emerald-700">${s.risk_delta > 0 ? '-' + s.risk_delta + ' pts' : '0 pts'}</span>
              <button class="btn-del-scn text-red-500 hover:text-red-700 text-xs px-1.5 py-0.5 border border-red-200 rounded" data-id="${s.scenario_id}">✕</button>
            </div>
          </div>
        `).join("");

        document.querySelectorAll(".btn-del-scn").forEach(b => {
          b.addEventListener("click", async (e) => {
            const scnId = e.target.getAttribute("data-id");
            await window.APIClient.deleteScenario(scnId);
            loadSavedScenarios();
            this.loadProjectAuditHistory(pId);
          });
        });
      }
    };

    loadSavedScenarios();
  }
};

window.ProjectDetailView = ProjectDetailView;
