// ==========================================================================
// PROJECTPULSE — National Overview Dashboard Component (Phase 9)
// Route: / or /dashboard
// Ministry of Statistics & Programme Implementation (MoSPI) - IPMD / PAIMANA
// Smart India Hackathon 2026 — Team HexaForce
// ==========================================================================

const DashboardView = {
  render() {
    const summary = window.MOCK_DASHBOARD_SUMMARY || {};
    const projects = window.MOCK_PROJECTS || [];

    // Fallback priority projects
    const priorityProjects = projects
      .filter(p => p.risk && (p.risk.level === "CRITICAL" || p.risk.level === "HIGH"))
      .slice(0, 6);

    return `
      <div class="max-w-[1440px] mx-auto space-y-6">
        
        <!-- Page Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-[11px] font-bold uppercase tracking-wider text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                Executive Flight Deck
              </span>
              <span class="text-caption text-slate-400">•</span>
              <span class="text-caption text-slate-500 font-medium">MoSPI IPMD Surveillance Standard</span>
            </div>
            <h1 class="text-page-title mt-1">National Portfolio Overview</h1>
            <p class="text-caption text-slate-500 mt-0.5">
              Autonomous risk prediction, execution decoupling surveillance, and intervention intelligence across Central Sector Projects (₹150 Cr+)
            </p>
          </div>
          <div class="flex items-center gap-2">
            <span id="dashboard-last-updated" class="text-caption text-slate-500 hidden sm:inline tabular-nums">
              Baseline: MoSPI PAIMANA Standard
            </span>
            <a href="#/projects" class="btn btn-secondary btn-sm">
              Explore All Projects ↗
            </a>
          </div>
        </div>

        <!-- Prototype Governance Disclaimer Banner -->
        <div class="p-3 bg-blue-50/70 border border-blue-200 rounded-lg flex items-start gap-2.5 text-caption text-blue-950">
          <span class="text-base flex-shrink-0">🏛️</span>
          <div>
            <strong>Institutional Decision-Support Layer:</strong> Operating over 10,000 Central Sector Infrastructure Projects ($>$ ₹150 Crore). ProjectPulse identifies early execution friction signals, models non-causal intervention sensitivities, and prioritizes executive review queues for the Cabinet Secretariat and IPMD.
          </div>
        </div>

        <!-- 4 Primary Portfolio KPI Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="gov-card p-4 flex flex-col justify-between">
            <div class="flex items-center justify-between text-slate-500 text-caption font-medium">
              <span>Tracked Projects</span>
              <span class="p-1.5 rounded-md bg-slate-100 text-slate-600">📊</span>
            </div>
            <div class="mt-2">
              <div id="kpi-tracked-count" class="kpi-metric-val text-2xl lg:text-3xl font-bold text-slate-900 font-mono">10,000</div>
              <div id="kpi-tracked-subtext" class="text-[11px] text-slate-500 mt-1">Central Sector projects (₹150 Cr+)</div>
            </div>
          </div>

          <div class="gov-card p-4 flex flex-col justify-between">
            <div class="flex items-center justify-between text-slate-500 text-caption font-medium">
              <span>Revised Portfolio Cost</span>
              <span class="p-1.5 rounded-md bg-blue-50 text-blue-700">₹</span>
            </div>
            <div class="mt-2">
              <div id="kpi-revised-cost" class="kpi-metric-val text-2xl lg:text-3xl font-bold text-slate-900 font-mono">₹42.5L Cr</div>
              <div class="text-[11px] text-slate-500 mt-1">Total revised capital exposure</div>
            </div>
          </div>

          <div class="gov-card p-4 flex flex-col justify-between">
            <div class="flex items-center justify-between text-slate-500 text-caption font-medium">
              <span>Projects Requiring Review</span>
              <span class="p-1.5 rounded-md bg-orange-50 text-orange-700">⚠️</span>
            </div>
            <div class="mt-2">
              <div id="kpi-review-count" class="kpi-metric-val text-2xl lg:text-3xl font-bold text-orange-700 font-mono">3,640</div>
              <div class="text-[11px] text-slate-500 mt-1">Elevated risk (High / Critical)</div>
            </div>
          </div>

          <div class="gov-card p-4 flex flex-col justify-between">
            <div class="flex items-center justify-between text-slate-500 text-caption font-medium">
              <span>Capital at Risk</span>
              <span class="p-1.5 rounded-md bg-red-50 text-red-700" title="Model-derived aggregate exposure associated with High/Critical risk projects">🛡️</span>
            </div>
            <div class="mt-2">
              <div id="kpi-capital-risk" class="kpi-metric-val text-2xl lg:text-3xl font-bold text-red-700 font-mono">₹15.8L Cr</div>
              <div class="text-[11px] text-slate-500 mt-1" title="Model-estimated capital exposure associated with elevated risk tiers">Associated with higher-risk projects</div>
            </div>
          </div>
        </div>

        <!-- Middle Section: Portfolio Risk Distribution & Insights -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <!-- Risk Distribution Chart (5 Cols) -->
          <div class="lg:col-span-5 gov-card flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-1">
                <h3 class="text-card-title">Portfolio Risk Distribution</h3>
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Multi-Class ML</span>
              </div>
              <p class="text-caption text-slate-500 mb-3">
                Categorization of national projects by composite predictive risk score
              </p>

              <!-- Chart Container -->
              <div class="h-44 w-full flex items-center justify-center relative">
                <canvas id="dashboard-risk-donut-canvas"></canvas>
              </div>
            </div>

            <!-- Accessible Legend & Figures -->
            <div class="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-caption mt-2">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-sm bg-green-600 flex-shrink-0"></span>
                <span class="text-slate-600 text-[11px]">Low Risk:</span>
                <strong id="legend-low-count" class="font-mono text-slate-900 ml-auto text-[11px]">4,210</strong>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-sm bg-amber-600 flex-shrink-0"></span>
                <span class="text-slate-600 text-[11px]">Moderate:</span>
                <strong id="legend-mod-count" class="font-mono text-slate-900 ml-auto text-[11px]">2,150</strong>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-sm bg-orange-600 flex-shrink-0"></span>
                <span class="text-slate-600 text-[11px]">High Risk:</span>
                <strong id="legend-high-count" class="font-mono text-slate-900 ml-auto text-[11px]">2,480</strong>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-sm bg-red-600 flex-shrink-0"></span>
                <span class="text-slate-600 text-[11px]">Critical:</span>
                <strong id="legend-crit-count" class="font-mono text-slate-900 ml-auto text-[11px]">1,160</strong>
              </div>
            </div>
          </div>

          <!-- Analytical Insights & Early Warning Pulse (7 Cols) -->
          <div class="lg:col-span-7 gov-card flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                <h3 class="text-card-title">Top Execution Bottlenecks & Friction Signals</h3>
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Automated Signals</span>
              </div>

              <!-- Key Signal Rows -->
              <div class="space-y-3 text-caption">
                <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                  <div class="w-7 h-7 rounded-md bg-red-100 text-red-800 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                    92%
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="font-semibold text-slate-900 flex items-center justify-between">
                      <span>Land Acquisition & Right-of-Way (RoW)</span>
                      <span class="text-[10px] text-red-700 font-bold uppercase">Primary Constraint</span>
                    </div>
                    <p class="text-slate-500 text-[11px] mt-0.5">
                      Leading driver across 38% of delayed megaprojects; accounts for average schedule slippage of 14.8 months.
                    </p>
                  </div>
                </div>

                <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                  <div class="w-7 h-7 rounded-md bg-orange-100 text-orange-800 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                    84%
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="font-semibold text-slate-900 flex items-center justify-between">
                      <span>Financial-Physical Progress Decoupling</span>
                      <span class="text-[10px] text-orange-700 font-bold uppercase">Structural Trigger</span>
                    </div>
                    <p class="text-slate-500 text-[11px] mt-0.5">
                      Cumulative expenditure leading physical works by $>$20 percentage points flagged in 1,420 projects.
                    </p>
                  </div>
                </div>

                <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                  <div class="w-7 h-7 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                    76%
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="font-semibold text-slate-900 flex items-center justify-between">
                      <span>Statutory & Environmental Clearances</span>
                      <span class="text-[10px] text-amber-700 font-bold uppercase">Inter-Ministerial</span>
                    </div>
                    <p class="text-slate-500 text-[11px] mt-0.5">
                      Forest stage-I/II approvals and coastal regulatory permissions pending across 890 highway & rail packages.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Model Health Status Footer -->
            <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-caption text-slate-500">
              <span class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Active Engines: <strong class="text-slate-800">LightGBM Regressor + TreeSHAP + What-If Simulator</strong></span>
              </span>
              <span class="text-[11px] text-slate-400 font-mono">100% Offline Autonomy</span>
            </div>
          </div>

        </div>

        <!-- Priority Review Queue Table -->
        <div class="gov-card">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-card-title">Priority Administrative Review Queue</h3>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                  CRITICAL ATTENTION
                </span>
              </div>
              <p class="text-caption text-slate-500 mt-0.5">
                Central sector projects requiring earliest executive intervention based on compound predictive risk indicators
              </p>
            </div>
            <a href="#/projects" class="text-caption font-bold text-blue-800 hover:text-blue-900 flex items-center gap-1">
              <span>View All 10,000 Projects</span>
              <span>→</span>
            </a>
          </div>

          <div class="gov-table-container">
            <table class="gov-table">
              <thead>
                <tr>
                  <th style="min-width: 280px;">Project Identification</th>
                  <th>Ministry / Sector</th>
                  <th style="min-width: 140px;">Physical Progress</th>
                  <th style="min-width: 140px;">Expenditure</th>
                  <th>Risk Score</th>
                  <th>Primary Driver</th>
                  <th class="text-right">Action</th>
                </tr>
              </thead>
              <tbody id="priority-projects-tbody">
                ${priorityProjects.map(p => `
                  <tr>
                    <td>
                      <div class="font-semibold text-slate-900 text-sm line-clamp-1">${p.project_name}</div>
                      <div class="font-mono text-caption text-slate-400 uppercase mt-0.5">${p.project_id}</div>
                    </td>
                    <td>
                      <div class="text-slate-800 font-medium text-xs">${p.sector}</div>
                      <div class="text-[11px] text-slate-400 truncate max-w-[180px]">${p.implementing_agency}</div>
                    </td>
                    <td>
                      <div class="flex justify-between text-[11px] font-medium mb-1">
                        <span>${p.progress ? p.progress.physical_progress_pct : 42.5}%</span>
                      </div>
                      ${CommonUI.renderProgressBar(p.progress ? p.progress.physical_progress_pct : 42.5, "bg-blue-700")}
                    </td>
                    <td>
                      <div class="text-slate-900 font-semibold text-xs tabular-nums">${p.progress ? p.progress.financial_progress_pct : 80}% spent</div>
                      <div class="text-[11px] text-slate-500 tabular-nums">₹${p.financials ? p.financials.cumulative_expenditure_cr : 1472} Cr</div>
                    </td>
                    <td>
                      ${CommonUI.renderRiskBadge(p.risk ? p.risk.level : "CRITICAL", p.risk ? p.risk.overall_score : 78.5)}
                    </td>
                    <td class="text-caption text-slate-600 max-w-xs text-xs">
                      ${p.risk ? p.risk.primary_driver : "Bottleneck: Land Acquisition"}
                    </td>
                    <td class="text-right">
                      <a href="#/projects/${p.project_id}" class="btn btn-secondary btn-sm">
                        Inspect
                      </a>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  },

  async postRender() {
    const canvas = document.getElementById("dashboard-risk-donut-canvas");
    if (!canvas || typeof Chart === "undefined") return;

    let dist = { low: 4210, moderate: 2150, high: 2480, critical: 1160 };

    if (window.APIClient && window.APIClient.isLive) {
      try {
        const live = await window.APIClient.getDashboardSummary();
        if (live) {
          if (live.risk_distribution) dist = live.risk_distribution;
          
          const elTracked = document.getElementById("kpi-tracked-count");
          const elCost = document.getElementById("kpi-revised-cost");
          const elReview = document.getElementById("kpi-review-count");
          const elCap = document.getElementById("kpi-capital-risk");

          if (elTracked) elTracked.innerText = Number(live.tracked_projects_count).toLocaleString("en-IN");
          if (elCost) elCost.innerText = live.total_revised_cost_formatted;
          if (elReview) elReview.innerText = Number(live.projects_requiring_review_count).toLocaleString("en-IN");
          if (elCap) elCap.innerText = live.capital_at_risk_formatted;

          // Update legend values
          const lLow = document.getElementById("legend-low-count");
          const lMod = document.getElementById("legend-mod-count");
          const lHigh = document.getElementById("legend-high-count");
          const lCrit = document.getElementById("legend-crit-count");
          if (lLow) lLow.innerText = dist.low.toLocaleString("en-IN");
          if (lMod) lMod.innerText = dist.moderate.toLocaleString("en-IN");
          if (lHigh) lHigh.innerText = dist.high.toLocaleString("en-IN");
          if (lCrit) lCrit.innerText = dist.critical.toLocaleString("en-IN");
        }

        // Fetch top priority projects from live database
        const projData = await window.APIClient.getProjects({
          risk_level: "CRITICAL",
          page_size: 6,
          sort_by: "overall_risk_score",
          sort_order: "desc"
        });

        if (projData && projData.items && projData.items.length > 0) {
          const tbody = document.getElementById("priority-projects-tbody");
          if (tbody) {
            tbody.innerHTML = projData.items.map(p => `
              <tr>
                <td>
                  <div class="font-semibold text-slate-900 text-sm line-clamp-1">${p.project_name}</div>
                  <div class="font-mono text-caption text-slate-400 uppercase mt-0.5">${p.project_id}</div>
                </td>
                <td>
                  <div class="text-slate-800 font-medium text-xs">${p.sector}</div>
                  <div class="text-[11px] text-slate-400 truncate max-w-[180px]">${p.implementing_agency}</div>
                </td>
                <td>
                  <div class="flex justify-between text-[11px] font-medium mb-1">
                    <span>${p.progress ? p.progress.physical_progress_pct : 0}%</span>
                  </div>
                  ${CommonUI.renderProgressBar(p.progress ? p.progress.physical_progress_pct : 0, "bg-blue-700")}
                </td>
                <td>
                  <div class="text-slate-900 font-semibold text-xs tabular-nums">${p.progress ? p.progress.financial_progress_pct : 0}% spent</div>
                  <div class="text-[11px] text-slate-500 tabular-nums">₹${p.financials ? p.financials.cumulative_expenditure_cr : 0} Cr</div>
                </td>
                <td>
                  ${CommonUI.renderRiskBadge(p.risk ? p.risk.level : "CRITICAL", p.risk ? p.risk.overall_score : 70)}
                </td>
                <td class="text-caption text-slate-600 max-w-xs text-xs">
                  ${p.risk ? p.risk.primary_driver : "Bottleneck: Clearance Impasse"}
                </td>
                <td class="text-right">
                  <a href="#/projects/${p.project_id}" class="btn btn-secondary btn-sm">
                    Inspect
                  </a>
                </td>
              </tr>
            `).join("");
          }
        }
      } catch (e) {
        console.warn("[DashboardView] Live KPI fetch fallback:", e);
      }
    }

    if (window._dashboardChartInstance) {
      window._dashboardChartInstance.destroy();
    }

    window._dashboardChartInstance = new Chart(canvas, {
      type: "doughnut",
      data: {
        labels: ["Low Risk", "Moderate Risk", "High Risk", "Critical Risk"],
        datasets: [{
          data: [dist.low, dist.moderate, dist.high, dist.critical],
          backgroundColor: ["#15803d", "#b45309", "#c2410c", "#b91c1c"],
          borderColor: "#ffffff",
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "68%",
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#0f172a",
            titleFont: { size: 12, family: "Inter" },
            bodyFont: { size: 11, family: "Inter" },
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${ctx.parsed.toLocaleString("en-IN")} projects`
            }
          }
        }
      }
    });
  }
};

window.DashboardView = DashboardView;
