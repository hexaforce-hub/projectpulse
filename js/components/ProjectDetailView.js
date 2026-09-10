// ==========================================================================
// PROJECTPULSE — Project Detail Intelligence View Component (Phase 9)
// Route: /projects/:id
// Ministry of Statistics & Programme Implementation (MoSPI) - IPMD / PAIMANA
// Smart India Hackathon 2026 — Team HexaForce
// ==========================================================================

const ProjectDetailView = {
  activeTab: "overview",

  render(projectId) {
    const allProjects = window.MOCK_PROJECTS || [];
    const fallback = allProjects.find(p => p.project_id === projectId) || allProjects[0] || {};

    const pId = projectId || fallback.project_id || "PRJ-DEMO-001";
    const isHero = pId === "PRJ-DEMO-001" || pId === "PRJ-SYN-000001";

    return `
      <div class="max-w-[1440px] mx-auto space-y-5">
        
        <!-- Breadcrumbs Navigation -->
        <div class="border-b border-slate-200 pb-3">
          <div class="mb-2">
            ${CommonUI.renderBreadcrumbs([
              { label: "Portfolio", href: "#/projects" },
              { label: "Central Projects Registry", href: "#/projects" },
              { label: pId, href: `#/projects/${pId}` }
            ])}
          </div>

          <!-- Executive Header: Identity, Status, Outlay & Primary Actions -->
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div class="space-y-1">
              <div class="flex flex-wrap items-center gap-2">
                <span id="dtl-project-id" class="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200 uppercase tracking-wide">
                  ${pId}
                </span>
                <span class="text-slate-300">•</span>
                <span id="dtl-project-status">
                  ${CommonUI.renderStatusBadge("CRITICAL REVIEW")}
                </span>
                ${isHero ? `
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                    HERO BENCHMARK PROJECT
                  </span>
                ` : ''}
                <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  MoSPI PAIMANA Standard
                </span>
              </div>
              <h1 id="dtl-project-name" class="text-2xl font-bold text-slate-900 tracking-tight mt-1">
                ${fallback.project_name || "NH-44 Strategic Corridor Development Project"}
              </h1>
              <div class="text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                <span><strong>Ministry:</strong> <span id="dtl-header-ministry">${fallback.ministry || 'Ministry of Road Transport and Highways'}</span></span>
                <span class="text-slate-300">•</span>
                <span><strong>Agency:</strong> <span id="dtl-header-agency">${fallback.implementing_agency || 'NHAI'}</span></span>
                <span class="text-slate-300">•</span>
                <span><strong>Location:</strong> <span id="dtl-header-state">${fallback.state || 'Telangana / Andhra Pradesh'}</span></span>
              </div>
            </div>

            <!-- Executive Quick Actions -->
            <div class="flex flex-wrap items-center gap-2 flex-shrink-0">
              <a href="#/projects" class="btn btn-secondary btn-sm flex items-center gap-1 text-xs" title="Return to Projects Explorer">
                <span>←</span>
                <span>Registry</span>
              </a>
              <button onclick="ProjectDetailView.switchTab('whatif')" class="btn btn-secondary btn-sm flex items-center gap-1.5 text-xs">
                <span>⚡</span>
                <span>What-If Test</span>
              </button>
              <a href="#/directives?project_id=${pId}&action=new" class="btn btn-primary btn-sm flex items-center gap-1.5 text-xs">
                <span>📜</span>
                <span>Issue Directive</span>
              </a>
              <button onclick="ProjectDetailView.exportDossier('${pId}')" class="btn btn-secondary btn-sm flex items-center gap-1 text-xs" title="Download official project dossier">
                <span>📥</span>
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Role-Aware Adaptive Flight Deck -->
        <div id="dtl-role-adaptive-banner" class="animate-fade-in"></div>

        <!-- Level 2: 5-Pillar Executive Health Strip (Interactive) -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">5-Pillar Health Surveillance (Click pillar to jump to detail)</span>
            <span class="text-[10px] text-slate-400">PAIMANA Telemetry Cycle: July 2026</span>
          </div>
          <div id="dtl-health-strip-mount">
            ${CommonUI.renderHealthStrip({
              schedule: "CRITICAL",
              scheduleText: "+20 mos drift",
              financial: "WATCH",
              financialText: "+47.2% Overrun",
              progress: "RISK",
              progressText: "42.5% Physical",
              execution: "WATCH",
              executionText: "4 Delayed MS",
              data: "HEALTHY",
              dataText: "Verified QA"
            })}
          </div>
        </div>

        <!-- Level 3: "Why This Project Needs Attention" Diagnosis Banner (Progressive Disclosure) -->
        <div class="gov-card bg-amber-50/50 border-amber-200 p-4 space-y-3 shadow-xs">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-base">⚠️</span>
              <h3 class="text-xs font-bold uppercase tracking-wider text-amber-900">Why This Project Needs Attention</h3>
              <span class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-200/60 text-amber-900 uppercase">
                AUTOMATED SURVEILLANCE
              </span>
            </div>
            <button type="button" onclick="ProjectDetailView.toggleExplainability()" class="text-xs font-bold text-amber-900 hover:text-amber-950 underline cursor-pointer">
              <span id="dtl-explain-btn-text">Show Root Cause Decomposition ▾</span>
            </button>
          </div>

          <p id="dtl-attention-summary" class="text-xs text-amber-950 leading-relaxed font-medium">
            Automated surveillance triggered: project demonstrates critical path slippage (+20 months delay) with primary bottleneck attributed to Land Acquisition & RoW. Financial disbursement significantly leads certified physical execution (+37.5 pp decoupling gap).
          </p>

          <!-- Collapsible Explainability Decomposition Panel -->
          <div id="dtl-explainability-panel" class="hidden pt-3 border-t border-amber-200/80 space-y-3">
            <div class="flex items-center justify-between text-[11px] text-amber-900">
              <span class="font-semibold">TreeSHAP Explainability Decomposition (Multi-target LightGBM + HistGradientBoosting)</span>
              <span class="font-mono text-slate-500">Σ Relative Impact = 100%</span>
            </div>
            <div id="dtl-drivers-container" class="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <!-- TreeSHAP drivers injected dynamically -->
            </div>
            <div class="text-[10px] text-slate-500 italic">
              * Feature contributions represent Shapley values from the trained ensemble model; not a causal certainty or administrative verdict.
            </div>
          </div>
        </div>

        <!-- Level 4: Clean Tab Navigation Bar -->
        <div class="border-b border-slate-200 bg-white px-2 rounded-t-lg pt-1">
          <nav class="flex space-x-2 sm:space-x-4 text-xs font-semibold" aria-label="Project Tabs">
            <button type="button" onclick="ProjectDetailView.switchTab('overview')" id="tab-btn-overview" 
                    class="tab-btn border-b-2 border-blue-800 text-blue-900 pb-3 px-2.5 flex items-center gap-1.5 transition font-bold">
              <span>📊</span>
              <span>Overview & Plan vs Actual</span>
            </button>
            <button type="button" onclick="ProjectDetailView.switchTab('execution')" id="tab-btn-execution" 
                    class="tab-btn border-b-2 border-transparent text-slate-500 hover:text-slate-800 pb-3 px-2.5 flex items-center gap-1.5 transition font-medium">
              <span>👷</span>
              <span>Execution & WBS Tasks</span>
              <span id="tab-badge-tasks" class="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">0</span>
            </button>
            <button type="button" onclick="ProjectDetailView.switchTab('milestones')" id="tab-btn-milestones" 
                    class="tab-btn border-b-2 border-transparent text-slate-500 hover:text-slate-800 pb-3 px-2.5 flex items-center gap-1.5 transition font-medium">
              <span>⏱️</span>
              <span>Critical Path Milestones</span>
              <span id="tab-badge-milestones" class="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">8</span>
            </button>
            <button type="button" onclick="ProjectDetailView.switchTab('warnings')" id="tab-btn-warnings" 
                    class="tab-btn border-b-2 border-transparent text-slate-500 hover:text-slate-800 pb-3 px-2.5 flex items-center gap-1.5 transition font-medium">
              <span>🚨</span>
              <span>Surveillance Radar</span>
              <span id="tab-badge-warnings" class="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">1</span>
            </button>
            <button type="button" onclick="ProjectDetailView.switchTab('whatif')" id="tab-btn-whatif" 
                    class="tab-btn border-b-2 border-transparent text-slate-500 hover:text-slate-800 pb-3 px-2.5 flex items-center gap-1.5 transition font-medium">
              <span>⚡</span>
              <span>What-If Simulator</span>
            </button>
            <button type="button" onclick="ProjectDetailView.switchTab('audit')" id="tab-btn-audit" 
                    class="tab-btn border-b-2 border-transparent text-slate-500 hover:text-slate-800 pb-3 px-2.5 flex items-center gap-1.5 transition font-medium">
              <span>🛡️</span>
              <span>Governance & Audit Trail</span>
            </button>
          </nav>
        </div>

        <!-- ====================================================================== -->
        <!-- TAB PANE 1: Overview & Plan vs Actual                                   -->
        <!-- ====================================================================== -->
        <div id="tab-pane-overview" class="space-y-6">
          
          <!-- Sanction Details & Predicted Risk Grid -->
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

          <!-- Progress Decoupling Surveillance & Observed Signals -->
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

        </div>

        <!-- ====================================================================== -->
        <!-- TAB PANE 2: Critical Path CPM Milestones                                -->
        <!-- ====================================================================== -->
        <div id="tab-pane-milestones" class="hidden space-y-4">
          <div class="gov-card space-y-3">
            <div class="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 class="text-card-title">Critical Path CPM Milestones</h3>
                <p class="text-caption text-slate-500">Detailed checkpoint schedule tracking from PAIMANA monthly cycle</p>
              </div>
              <span id="dtl-milestone-count" class="text-caption font-mono text-slate-400">8 Milestones</span>
            </div>

            <div id="dtl-milestones-list" class="space-y-2">
              <!-- Milestones dynamically injected by postRender -->
            </div>
          </div>
        </div>

        <!-- ====================================================================== -->
        <!-- TAB PANE 3: Surveillance Radar & Alerts Triage                          -->
        <!-- ====================================================================== -->
        <div id="tab-pane-warnings" class="hidden space-y-4">
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
        </div>

        <!-- ====================================================================== -->
        <!-- TAB PANE 4: What-If Intervention Simulator                              -->
        <!-- ====================================================================== -->
        <div id="tab-pane-whatif" class="hidden space-y-4">
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
        </div>

        <!-- ====================================================================== -->
        <!-- TAB PANE 5: Governance & Administrative Audit Trail                     -->
        <!-- ====================================================================== -->
        <div id="tab-pane-audit" class="hidden space-y-4">
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

        <!-- ====================================================================== -->
        <!-- TAB PANE: WBS Tasks & Field Execution                                 -->
        <!-- ====================================================================== -->
        <div id="tab-pane-execution" class="hidden space-y-6">
          <div class="gov-card p-5 space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-sm font-bold text-slate-900">Work Breakdown Structure (WBS) & Tasks</h3>
                  <span class="px-2 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-800">OPERATIONAL WORKFLOW</span>
                </div>
                <p class="text-xs text-slate-500 mt-0.5">
                  AI-assisted personnel recommendation, field progress telemetry, and engineer verification with continuous LightGBM recalculation.
                </p>
              </div>
              <div class="flex items-center gap-2">
                <button type="button" onclick="ProjectDetailView.triggerAiTaskRecommendations('${pId}')" id="btn-ai-recommend-tasks" class="btn btn-secondary btn-sm flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border-indigo-200 hover:bg-indigo-100 cursor-pointer">
                  <span>⚡</span>
                  <span>AI Recommend Assignments</span>
                </button>
              </div>
            </div>

            <!-- AI Recommendations Alert Container -->
            <div id="dtl-ai-recommendations-box" class="hidden p-4 bg-indigo-50/80 border border-indigo-200 rounded-xl space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <span>🤖</span> AI Assignment Recommendations (Discipline & Workload Matched)
                </span>
                <button onclick="document.getElementById('dtl-ai-recommendations-box').classList.add('hidden')" class="text-slate-400 hover:text-slate-600 text-xs">✕</button>
              </div>
              <div id="dtl-ai-recommendations-list" class="space-y-2 text-xs"></div>
            </div>

            <!-- Tasks Table / Cards -->
            <div id="dtl-tasks-container" class="space-y-3">
              <div class="p-8 text-center text-slate-400 text-xs">Loading project execution tasks...</div>
            </div>
          </div>
        </div>

      </div>
    `;
  },

  switchTab(tabKey) {
    const aliasMap = {
      "timeline": "milestones",
      "schedule": "milestones",
      "plan-vs-actual": "overview",
      "financial": "overview",
      "progress-trend": "overview",
      "progress": "overview",
      "execution": "execution",
      "tasks": "execution",
      "wbs": "execution",
      "warnings": "warnings",
      "whatif": "whatif",
      "simulation": "whatif",
      "audit": "audit",
      "data": "audit"
    };
    const target = aliasMap[tabKey] || tabKey || "overview";
    this.activeTab = target;

    const tabs = ["overview", "execution", "milestones", "warnings", "whatif", "audit"];
    tabs.forEach(t => {
      const pane = document.getElementById(`tab-pane-${t}`);
      const btn = document.getElementById(`tab-btn-${t}`);
      if (pane) {
        if (t === target) {
          pane.classList.remove("hidden");
        } else {
          pane.classList.add("hidden");
        }
      }
      if (btn) {
        if (t === target) {
          btn.className = "tab-btn border-b-2 border-blue-800 text-blue-900 pb-3 px-2.5 flex items-center gap-1.5 transition font-bold";
        } else {
          btn.className = "tab-btn border-b-2 border-transparent text-slate-500 hover:text-slate-800 pb-3 px-2.5 flex items-center gap-1.5 transition font-medium";
        }
      }
    });
  },

  toggleExplainability() {
    const panel = document.getElementById("dtl-explainability-panel");
    const btnText = document.getElementById("dtl-explain-btn-text");
    if (!panel) return;
    const isHidden = panel.classList.contains("hidden");
    if (isHidden) {
      panel.classList.remove("hidden");
      if (btnText) btnText.innerText = "Hide Root Cause Decomposition ▴";
    } else {
      panel.classList.add("hidden");
      if (btnText) btnText.innerText = "Show Root Cause Decomposition ▾";
    }
  },

  exportDossier(projectId) {
    const all = window.MOCK_PROJECTS || [];
    const p = all.find(item => item.project_id === projectId) || { project_id: projectId };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(p, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ASTRA_Project_Dossier_${projectId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
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

    // Load WBS Execution Tasks for this project
    this.loadProjectTasks(pId);

    // Render Role-Tailored Adaptive Intelligence Flight Deck
    this.renderRoleAdaptiveBanner(pId, project);

    // Setup What-If Simulator
    this.setupWhatIfSimulator(pId, project);

    // Setup Warning Triage Buttons
    this.setupWarningTriage(pId);

    // Ensure initial tab is visible
    this.switchTab(this.activeTab || "overview");
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

    const headerMin = document.getElementById("dtl-header-ministry");
    const headerAgency = document.getElementById("dtl-header-agency");
    const headerState = document.getElementById("dtl-header-state");
    const headerStatus = document.getElementById("dtl-project-status");

    if (elName) elName.innerText = p.project_name;
    if (elMin) elMin.innerText = p.ministry;
    if (elSec) elSec.innerText = p.sector;
    if (elAgency) elAgency.innerText = p.implementing_agency;
    if (elState) elState.innerText = p.state;

    if (headerMin) headerMin.innerText = p.ministry;
    if (headerAgency) headerAgency.innerText = p.implementing_agency || "MoSPI Desk";
    if (headerState) headerState.innerText = p.state || "National / Multi-State";

    const dsBadge = document.getElementById("dtl-datasource-badge");
    if (dsBadge) {
      if (p.data_source === "REAL_IMPORTED" || (p.metadata && p.metadata.data_status === "REAL_IMPORTED")) {
        dsBadge.className = "px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1";
        dsBadge.innerHTML = "<span>🟢</span> REAL IMPORTED INFRASTRUCTURE PROJECT";
      } else {
        dsBadge.className = "px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1";
        dsBadge.innerHTML = "<span>🔵</span> 10,000 PAIMANA SYNTHETIC BASELINE";
      }
    }

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
    const origCost = fin.original_cost_cr || p.original_cost_cr || 1250;
    const revCost = fin.revised_cost_cr || p.cost_cr || 1840.5;
    const diff = revCost - origCost;
    const growthPct = origCost > 0 ? ((diff / origCost) * 100).toFixed(1) : 0;

    if (elOrigCost) elOrigCost.innerText = `₹${origCost.toLocaleString("en-IN")} Cr`;
    if (elRevCost) elRevCost.innerText = `₹${revCost.toLocaleString("en-IN")} Cr`;
    if (elExp) elExp.innerText = `₹${(fin.cumulative_expenditure_cr || (revCost * 0.8)).toLocaleString("en-IN")} Cr`;
    if (elGrowth) {
      elGrowth.innerText = diff > 0 ? `+${growthPct}% (+₹${diff.toFixed(1)} Cr)` : "On budget (0%)";
    }

    // Progress & Decoupling
    const prog = p.progress || {};
    const physProg = prog.physical_progress_pct || p.physical_progress || 42.5;
    const finProg = prog.financial_progress_pct || p.financial_progress || 80.0;
    const gap = prog.progress_gap_pct || (finProg - physProg);

    const elPhysVal = document.getElementById("dtl-phys-prog-val");
    const elPhysBar = document.getElementById("dtl-phys-prog-bar");
    const elFinVal = document.getElementById("dtl-fin-prog-val");
    const elFinBar = document.getElementById("dtl-fin-prog-bar");
    const elGap = document.getElementById("dtl-gap-badge");

    if (elPhysVal) elPhysVal.innerText = `${Number(physProg).toFixed(1)}%`;
    if (elPhysBar) elPhysBar.style.width = `${physProg}%`;
    if (elFinVal) elFinVal.innerText = `${Number(finProg).toFixed(1)}%`;
    if (elFinBar) elFinBar.style.width = `${Math.min(100, finProg)}%`;
    if (elGap) {
      elGap.innerText = `Decoupling: ${gap > 0 ? '+' : ''}${Number(gap).toFixed(1)} pp`;
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

    const overallScore = r.overall_score || p.overall_risk_score || 78.5;
    const riskLevel = r.level || p.target_risk_class || "CRITICAL";

    if (scoreVal) scoreVal.innerHTML = `${overallScore} <span class="text-lg text-slate-400 font-normal">/ 100</span>`;
    if (scoreBadge) scoreBadge.innerHTML = CommonUI.renderRiskBadge(riskLevel, overallScore);
    if (whatifBadge) whatifBadge.innerText = `${overallScore} / 100 — ${riskLevel}`;
    if (headerStatus) headerStatus.innerHTML = CommonUI.renderStatusBadge(riskLevel === "CRITICAL" ? "CRITICAL REVIEW" : (riskLevel === "HIGH" ? "WATCH / SURVEILLANCE" : "ON TRACK"));

    if (subSched) subSched.innerText = `${sched.delay_duration_months || p.delay_months || 20.0} mos`;
    if (subCost) subCost.innerText = `${r.cost_score || 84.2}% prob`;
    if (subImpl) subImpl.innerText = `${r.implementation_score || 85.0}%`;
    if (pDriver) pDriver.innerText = p.primary_bottleneck ? p.primary_bottleneck.replace(/_/g, ' ') : (r.primary_driver || "Land Acquisition Constraints");

    // Dynamic 5-Pillar Executive Health Strip
    const delayedMsCount = p.milestones ? p.milestones.filter(m => m.status === 'Delayed').length : 4;
    const health = {
      schedule: (riskLevel === "CRITICAL" || (sched.delay_duration_months || 0) > 12) ? "CRITICAL" : ((sched.delay_duration_months || 0) > 3 ? "WATCH" : "HEALTHY"),
      scheduleText: (sched.delay_duration_months || 0) > 0 ? `+${sched.delay_duration_months} mos drift` : "On Schedule",
      financial: diff > 0 ? "WATCH" : "HEALTHY",
      financialText: diff > 0 ? `+${growthPct}% Overrun` : "Within Budget",
      progress: gap > 15 ? "RISK" : "HEALTHY",
      progressText: `${Number(physProg).toFixed(1)}% Physical`,
      execution: delayedMsCount > 0 ? "WATCH" : "HEALTHY",
      executionText: `${delayedMsCount} Delayed MS`,
      data: "HEALTHY",
      dataText: "Verified QA"
    };
    const stripMount = document.getElementById("dtl-health-strip-mount");
    if (stripMount) stripMount.innerHTML = CommonUI.renderHealthStrip(health);

    // Attention Diagnosis Summary
    const attnSummary = document.getElementById("dtl-attention-summary");
    if (attnSummary) {
      attnSummary.innerText = p.executive_summary || `Automated surveillance triggered: project demonstrates critical path slippage (+${sched.delay_duration_months || 20} months delay) with primary bottleneck attributed to ${p.primary_bottleneck ? p.primary_bottleneck.replace(/_/g, ' ') : 'Land Acquisition & RoW'}. Financial disbursement leads certified physical progress by ${Number(gap).toFixed(1)} pp.`;
    }

    // TreeSHAP Drivers
    const driversCont = document.getElementById("dtl-drivers-container");
    if (driversCont) {
      const drivers = (r.drivers && r.drivers.length > 0) ? r.drivers : [
        { name: "Land Acquisition Impasse", strength_pct: 52, evidence: "RoW handover pending in key river basin alignment" },
        { name: "Milestone Slippage Velocity", strength_pct: 28, evidence: "4 critical-path intermediate checkpoints delayed" },
        { name: "Progress Decoupling Gap", strength_pct: 20, evidence: `Financial outlay leads physical works by ${Number(gap).toFixed(1)} pp` }
      ];

      driversCont.innerHTML = drivers.map((d, i) => `
        <div class="p-3 bg-white rounded-lg border border-amber-200/80 space-y-1.5">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-slate-900">${i + 1}. ${d.name}</span>
            <span class="font-mono font-bold text-amber-900 bg-amber-100 px-1.5 py-0.2 rounded text-[10px]">${d.strength_pct}% impact</span>
          </div>
          <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div class="bg-amber-600 h-full rounded-full" style="width: ${d.strength_pct}%;"></div>
          </div>
          <p class="text-[11px] text-slate-600 leading-snug">${d.evidence}</p>
        </div>
      `).join("");
    }

    // Milestones List
    const msList = document.getElementById("dtl-milestones-list");
    const msCount = document.getElementById("dtl-milestone-count");
    const tabBadgeMs = document.getElementById("tab-badge-milestones");
    if (msList && p.milestones) {
      if (msCount) msCount.innerText = `${p.milestones.length} Milestones`;
      if (tabBadgeMs) tabBadgeMs.innerText = `${p.milestones.length}`;
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
  },

  async loadProjectTasks(pId) {
    const mount = document.getElementById("dtl-tasks-container");
    const badge = document.getElementById("tab-badge-tasks");
    if (!mount) return;

    try {
      const res = await window.APIClient.getProjectTasks(pId);
      const tasks = (res && res.tasks) ? res.tasks : (Array.isArray(res) ? res : []);
      
      if (badge) badge.innerText = tasks.length;

      if (!tasks || tasks.length === 0) {
        mount.innerHTML = `
          <div class="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div class="text-3xl">📐</div>
            <div class="font-bold text-slate-800 text-sm">No WBS Execution Tasks Synthesized</div>
            <p class="text-xs text-slate-500 max-w-md mx-auto">
              This project does not yet have granular work packages or field execution tasks assigned.
            </p>
            <button onclick="ProjectDetailView.generateWbsPlan('${pId}')" class="btn btn-primary btn-sm text-xs inline-flex items-center gap-1.5 cursor-pointer">
              <span>⚡</span> Auto-Generate WBS Structure
            </button>
          </div>
        `;
        return;
      }

      mount.innerHTML = tasks.map(t => {
        const isVerified = t.verification_status === "VERIFIED";
        const progressPct = t.actual_progress || 0;
        const assignee = t.assigned_to || "Unassigned";

        return `
          <div class="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition space-y-3">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div class="flex items-center gap-2">
                <span class="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300">
                  ${t.task_id}
                </span>
                <span class="text-xs font-bold text-slate-900">${t.title || 'Execution Task'}</span>
                <span class="px-2 py-0.2 rounded text-[9px] font-bold ${isVerified ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'}">
                  ${isVerified ? '✓ VERIFIED' : (t.verification_status || 'PENDING VERIFICATION')}
                </span>
              </div>
              <div class="flex items-center gap-2 text-xs">
                <span class="text-[11px] text-slate-500">Assignee:</span>
                <span class="font-mono font-bold text-slate-800 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                  ${assignee}
                </span>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-center text-xs">
              <div class="md:col-span-6 space-y-1">
                <p class="text-[11px] text-slate-600 leading-relaxed">${t.description || 'Standard civil/engineering work package execution task.'}</p>
                <div class="text-[10px] text-slate-400 flex items-center gap-3">
                  <span>Scope: ${t.scope || 'Civil Works'}</span>
                  <span>•</span>
                  <span>Target: ${t.target_quantity || 100} ${t.unit || 'units'}</span>
                  <span>•</span>
                  <span>Completed: ${t.completed_quantity || 0} ${t.unit || 'units'}</span>
                </div>
              </div>

              <div class="md:col-span-3 space-y-1">
                <div class="flex items-center justify-between text-[11px]">
                  <span class="text-slate-500">Field Progress:</span>
                  <span class="font-mono font-bold text-slate-900">${progressPct}%</span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div class="bg-blue-600 h-2 rounded-full transition-all" style="width: ${progressPct}%"></div>
                </div>
              </div>

              <div class="md:col-span-3 flex items-center justify-end gap-1.5 flex-wrap">
                <button onclick="ProjectDetailView.promptAssignTask('${t.task_id}', '${pId}', '${assignee}')" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg border border-slate-300 transition cursor-pointer" title="Assign task to engineer or field personnel">
                  Assign
                </button>
                <button onclick="ProjectDetailView.promptSubmitProgress('${t.task_id}', '${pId}')" class="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] rounded-lg border border-blue-200 transition cursor-pointer" title="Submit daily telemetry update">
                  Report
                </button>
                ${!isVerified ? `
                  <button onclick="ProjectDetailView.verifyTask('${t.task_id}', '${pId}')" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg shadow-2xs transition cursor-pointer" title="Engineer verification sign-off (recalculates ML risk)">
                    Verify
                  </button>
                ` : ''}
              </div>
            </div>
          </div>
        `;
      }).join("");

    } catch (err) {
      console.warn("[ProjectDetailView] Could not load tasks:", err);
      mount.innerHTML = `<p class="text-slate-400 text-xs italic">Unable to load tasks for this project.</p>`;
    }
  },

  async triggerAiTaskRecommendations(pId) {
    const box = document.getElementById("dtl-ai-recommendations-box");
    const list = document.getElementById("dtl-ai-recommendations-list");
    const btn = document.getElementById("btn-ai-recommend-tasks");
    if (!box || !list) return;

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span class="inline-block animate-spin">⏳</span> Analyzing Team & Scope...`;
    }

    try {
      const res = await window.APIClient.recommendTaskAssignments(pId);
      if (res && res.recommendations && res.recommendations.length > 0) {
        list.innerHTML = res.recommendations.map(r => `
          <div class="p-2.5 bg-white rounded-lg border border-indigo-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div class="flex items-center gap-1.5">
                <span class="font-mono text-[10px] font-bold bg-indigo-50 text-indigo-900 px-1.5 py-0.2 rounded">${r.task_id}</span>
                <span class="font-bold text-slate-900">${r.task_title || r.task_id}</span>
              </div>
              <p class="text-[11px] text-slate-600 mt-0.5">${r.rationale}</p>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                ${(r.confidence * 100).toFixed(0)}% Match: ${r.recommended_user_name} (${r.recommended_role})
              </span>
              <button onclick="ProjectDetailView.applyRecommendation('${r.task_id}', '${r.recommended_user_id}', '${pId}')" class="btn btn-primary btn-sm text-[10px] py-1 px-2.5 cursor-pointer">
                Accept & Assign
              </button>
            </div>
          </div>
        `).join("");
        box.classList.remove("hidden");
        window.APIClient.showToast(`AI generated ${res.recommendations.length} explainable recommendations!`, "success");
      } else {
        window.APIClient.showToast("No tasks available for recommendation.", "info");
      }
    } catch (e) {
      window.APIClient.showToast("Recommendation engine error: " + e.message, "error");
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<span>⚡</span> <span>AI Recommend Assignments</span>`;
      }
    }
  },

  async applyRecommendation(taskId, userId, pId) {
    try {
      const res = await window.APIClient.assignTask(taskId, {
        assigned_to: userId,
        remarks: "Approved AI assignment recommendation based on discipline match.",
        priority: "HIGH"
      });
      if (res && res.status === "success") {
        window.APIClient.showToast(`Task ${taskId} assigned to ${userId}`, "success");
        await this.loadProjectTasks(pId);
        this.loadProjectAuditHistory(pId);
      }
    } catch (e) {
      window.APIClient.showToast("Assignment failed: " + e.message, "error");
    }
  },

  async promptAssignTask(taskId, pId, currentAssignee) {
    const target = prompt(`Assign Task ${taskId} to institutional personnel (e.g. USR-ENGINEER-01, USR-FIELD-01, USR-FO-01):`, currentAssignee !== "Unassigned" ? currentAssignee : "USR-FIELD-01");
    if (!target) return;
    try {
      const res = await window.APIClient.assignTask(taskId, {
        assigned_to: target.trim(),
        remarks: "Manager assignment from project execution flight deck.",
        priority: "NORMAL"
      });
      if (res && res.status === "success") {
        window.APIClient.showToast(`Assigned ${taskId} to ${target}`, "success");
        await this.loadProjectTasks(pId);
        this.loadProjectAuditHistory(pId);
      }
    } catch (e) {
      window.APIClient.showToast("Assignment failed: " + e.message, "error");
    }
  },

  async promptSubmitProgress(taskId, pId) {
    const rawPct = prompt(`Report updated physical completion % for Task ${taskId} (0-100):`, "75");
    if (rawPct === null) return;
    const pct = parseFloat(rawPct);
    if (isNaN(pct) || pct < 0 || pct > 100) {
      alert("Please enter a valid percentage between 0 and 100.");
      return;
    }
    const remarks = prompt("Enter telemetry notes / site observations:", "Physical milestone progressed on schedule.");
    try {
      const res = await window.APIClient.submitTaskProgress(taskId, {
        progress_pct: pct,
        quantity_completed: pct * 10,
        remarks: remarks || "Telemetry submitted from ASTRA interface.",
        location_tag: "22.5N, 72.8E",
        weather_conditions: "Clear"
      });
      if (res) {
        window.APIClient.showToast(`Progress reported (${pct}%). Pending Engineer sign-off.`, "success");
        await this.loadProjectTasks(pId);
      }
    } catch (e) {
      window.APIClient.showToast("Progress submission failed: " + e.message, "error");
    }
  },

  async verifyTask(taskId, pId) {
    if (!confirm(`Verify technical execution for Task ${taskId}? This will roll progress up to project level and trigger continuous LightGBM risk recalculation.`)) return;

    try {
      const progRes = await window.APIClient.getTaskProgress(taskId);
      const reports = (progRes && progRes.history) ? progRes.history : (Array.isArray(progRes) ? progRes : []);
      let progressId = null;
      if (reports.length > 0) {
        const pending = reports.find(r => r.verification_status !== "VERIFIED");
        progressId = pending ? pending.progress_id : reports[reports.length - 1].progress_id;
      }

      if (progressId) {
        const vRes = await window.APIClient.verifyTaskProgress(progressId, {
          verification_status: "VERIFIED",
          verification_notes: "On-site measurements and drawings verified by Executive Engineer."
        });
        if (vRes && vRes.ai_recalculation) {
          window.APIClient.showToast(`Progress Verified! LightGBM recalculated score: ${vRes.ai_recalculation.recalculated_risk_score || 'Updated'} (${vRes.ai_recalculation.recalculated_risk_class})`, "success");
        } else {
          window.APIClient.showToast(`Progress for ${taskId} certified and verified.`, "success");
        }
      } else {
        await window.APIClient.updateTaskStatus(taskId, {
          status: "COMPLETED",
          actual_progress: 100.0,
          verification_status: "VERIFIED",
          remarks: "Verified and approved by Engineer."
        });
        window.APIClient.showToast(`Task ${taskId} verified and approved.`, "success");
      }

      // Refresh project and tasks
      const proj = await window.APIClient.getProject(pId, true);
      if (proj) this.populateProjectDOM(proj);
      await this.loadProjectTasks(pId);
      this.loadProjectAuditHistory(pId);
    } catch (e) {
      window.APIClient.showToast("Verification failed: " + e.message, "error");
    }
  },

  async generateWbsPlan(pId) {
    try {
      window.APIClient.showToast("Synthesizing WBS structure...", "info");
      const res = await window.APIClient.generateWbsPlan(pId);
      if (res && res.tasks) {
        window.APIClient.showToast(`WBS generated: ${res.tasks.length} tasks ready for execution!`, "success");
        await this.loadProjectTasks(pId);
      }
    } catch (e) {
      window.APIClient.showToast("WBS synthesis failed: " + e.message, "error");
    }
  }
};

window.ProjectDetailView = ProjectDetailView;
