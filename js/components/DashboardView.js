// ==========================================================================
// PROJECTPULSE — National Command Center Dashboard Component (Phase 9.5)
// Route: / or /dashboard
// Ministry of Statistics & Programme Implementation (MoSPI) - IPMD / PAIMANA
// Smart India Hackathon 2026 — Team HexaForce
// ==========================================================================

const DashboardView = {
  donutChart: null,
  sectorChart: null,

  render() {
    const summary = window.MOCK_DASHBOARD_SUMMARY || {};
    const projects = window.MOCK_PROJECTS || [];

    // Fallback priority projects
    const priorityProjects = projects
      .filter(p => p.risk && (p.risk.level === "CRITICAL" || p.risk.level === "HIGH"))
      .slice(0, 6);

    return `
      <div class="max-w-[1440px] mx-auto space-y-6">
        
        <!-- =====================================================================
             EXECUTIVE TELEMETRY FLIGHT DECK (Hero Command Banner)
             ===================================================================== -->
        <div class="command-deck-hero rounded-2xl p-6 sm:p-7 relative overflow-hidden">
          
          <!-- Subtle MoSPI Watermark Grid Background -->
          <div class="absolute -right-10 -bottom-10 opacity-10 pointer-events-none select-none text-[160px] font-black tracking-tighter">
            IPMD
          </div>

          <div class="relative z-10 space-y-5">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-200 border border-blue-400/30 px-2.5 py-0.5 rounded-full">
                    Surveillance Deck • PAIMANA 2.0 Standard
                  </span>
                  <span class="text-white/40">•</span>
                  <span class="text-xs text-blue-200 font-medium">Cabinet Secretariat & IPMD Surveillance</span>
                </div>
                <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                  National Infrastructure Project Command Center
                </h1>
                <p class="text-xs sm:text-sm text-slate-300 max-w-3xl mt-0.5">
                  Autonomous early risk detection, execution decoupling surveillance, and intervention intelligence across 10,000 Central Sector Infrastructure Projects (₹150 Cr+).
                </p>
              </div>

              <div class="flex items-center gap-2 flex-shrink-0">
                <a href="#/portfolio-matrix" class="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-sm flex items-center gap-1.5">
                  <span>🎯</span>
                  <span>Portfolio Matrix ↗</span>
                </a>
                <a href="#/projects" class="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors border border-white/15">
                  Registry ↗
                </a>
              </div>
            </div>

            <!-- 5 Key Executive Telemetry Metrics -->
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
              <div class="command-deck-stat p-3.5 flex flex-col justify-between">
                <div class="text-[11px] font-medium text-slate-300">Tracked Projects</div>
                <div class="mt-2">
                  <div id="kpi-tracked-count" class="text-2xl lg:text-3xl font-bold text-white font-mono">10,000</div>
                  <div class="text-[10px] text-slate-400 mt-0.5">Central Sector (₹150 Cr+)</div>
                </div>
              </div>

              <div class="command-deck-stat p-3.5 flex flex-col justify-between">
                <div class="text-[11px] font-medium text-slate-300">Total Capital Outlay</div>
                <div class="mt-2">
                  <div id="kpi-revised-cost" class="text-2xl lg:text-3xl font-bold text-white font-mono">₹42.50L Cr</div>
                  <div class="text-[10px] text-slate-400 mt-0.5">Revised aggregate exposure</div>
                </div>
              </div>

              <div class="command-deck-stat p-3.5 flex flex-col justify-between">
                <div class="text-[11px] font-medium text-slate-300">Cumulative Overrun</div>
                <div class="mt-2">
                  <div id="kpi-overrun-cost" class="text-2xl lg:text-3xl font-bold text-amber-300 font-mono">₹12.45L Cr</div>
                  <div class="text-[10px] text-amber-200/70 mt-0.5">+29.3% fiscal expansion</div>
                </div>
              </div>

              <div class="command-deck-stat p-3.5 flex flex-col justify-between">
                <div class="text-[11px] font-medium text-slate-300">Critical / High Focus</div>
                <div class="mt-2">
                  <div id="kpi-review-count" class="text-2xl lg:text-3xl font-bold text-red-300 font-mono">3,640</div>
                  <div class="text-[10px] text-red-200/70 mt-0.5">Projects needing review</div>
                </div>
              </div>

              <div class="command-deck-stat p-3.5 flex flex-col justify-between">
                <div class="text-[11px] font-medium text-slate-300 flex items-center justify-between">
                  <span>Early Warnings</span>
                  <span class="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
                </div>
                <div class="mt-2">
                  <div id="kpi-warnings-count" class="text-2xl lg:text-3xl font-bold text-red-400 font-mono">14,164</div>
                  <a href="#/early-warnings" class="text-[10px] text-blue-300 hover:text-white underline mt-0.5 block">Triage Radar ➔</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- =====================================================================
             QUICK ACTION & SYSTEM STATUS RIBBON
             ===================================================================== -->
        <div class="p-3 bg-blue-50/80 border border-blue-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-caption text-blue-950">
          <div class="flex items-center gap-2.5">
            <span class="text-lg">🏛️</span>
            <div>
              <strong>Institutional Decision-Support Layer:</strong> Real-time surveillance over 10,000 Central Sector projects. Non-causal sensitivity modeling is calibrated on historical IPMD monthly project returns.
            </div>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0 text-xs">
            <a href="#/bottlenecks" class="px-2.5 py-1 bg-white hover:bg-blue-100/70 border border-blue-200 rounded-md font-semibold text-blue-900 transition-colors">
              Bottlenecks Intel ➔
            </a>
            <a href="#/data-quality" class="px-2.5 py-1 bg-white hover:bg-blue-100/70 border border-blue-200 rounded-md font-semibold text-blue-900 transition-colors">
              Data Quality ➔
            </a>
          </div>
        </div>

        <!-- =====================================================================
             MIDDLE SECTION: RISK DISTRIBUTION & SECTOR FISCAL EXPOSURE
             ===================================================================== -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <!-- Risk Distribution Donut (5 Cols) -->
          <div class="lg:col-span-5 gov-card flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-1">
                <h3 class="text-card-title">Portfolio Risk Stratification</h3>
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Multi-Class ML</span>
              </div>
              <p class="text-caption text-slate-500 mb-3">
                Categorization of national projects by composite predictive risk score. Click segment to cross-filter.
              </p>

              <!-- Chart Container -->
              <div class="h-44 w-full flex items-center justify-center relative cursor-pointer" title="Click to filter projects by risk tier">
                <canvas id="dashboard-risk-donut-canvas"></canvas>
              </div>
            </div>

            <!-- Clickable Interactive Legend & Figures -->
            <div class="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-caption mt-2">
              <a href="#/projects?risk_tier=LOW" class="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 transition-colors">
                <span class="w-3 h-3 rounded-sm bg-emerald-600 flex-shrink-0"></span>
                <span class="text-slate-600 text-[11px]">Low Risk:</span>
                <strong id="legend-low-count" class="font-mono text-slate-900 ml-auto text-[11px]">4,210</strong>
              </a>
              <a href="#/projects?risk_tier=MODERATE" class="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 transition-colors">
                <span class="w-3 h-3 rounded-sm bg-blue-600 flex-shrink-0"></span>
                <span class="text-slate-600 text-[11px]">Moderate:</span>
                <strong id="legend-mod-count" class="font-mono text-slate-900 ml-auto text-[11px]">2,150</strong>
              </a>
              <a href="#/projects?risk_tier=HIGH" class="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 transition-colors">
                <span class="w-3 h-3 rounded-sm bg-amber-500 flex-shrink-0"></span>
                <span class="text-slate-600 text-[11px]">High Risk:</span>
                <strong id="legend-high-count" class="font-mono text-slate-900 ml-auto text-[11px]">2,480</strong>
              </a>
              <a href="#/projects?risk_tier=CRITICAL" class="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 transition-colors">
                <span class="w-3 h-3 rounded-sm bg-red-600 flex-shrink-0"></span>
                <span class="text-slate-600 text-[11px]">Critical:</span>
                <strong id="legend-crit-count" class="font-mono text-slate-900 ml-auto text-[11px]">1,160</strong>
              </a>
            </div>
          </div>

          <!-- Sector Capital Outlay & Risk Exposure (7 Cols) -->
          <div class="lg:col-span-7 gov-card flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                <h3 class="text-card-title">Sectoral Exposure & Outlay Breakdown</h3>
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top 6 Infrastructure Sectors</span>
              </div>
              <p class="text-caption text-slate-500 mb-3">
                Total revised expenditure (₹ Crore) across strategic infrastructure domains. Click bar to explore sector registry.
              </p>

              <div class="h-44 w-full relative">
                <canvas id="dashboard-sector-canvas"></canvas>
              </div>
            </div>

            <!-- Footer: Navigation link to full portfolio matrix -->
            <div class="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-caption text-slate-500">
              <span class="flex items-center gap-1.5 text-xs">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Active Model: <strong class="text-slate-800">LightGBM (125 Evaluated Invariants) + TreeSHAP</strong></span>
              </span>
              <a href="#/portfolio-matrix" class="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1">
                <span>View Full 2D Risk Matrix</span>
                <span>➔</span>
              </a>
            </div>
          </div>

        </div>

        <!-- =====================================================================
             SYSTEMIC BOTTLENECKS & STRUCTURAL FRICTION CARDS
             ===================================================================== -->
        <div class="gov-card p-5">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-card-title">Top Execution Bottlenecks & Strategic Friction Signals</h3>
                <span class="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded uppercase">Autonomous Insights</span>
              </div>
              <p class="text-caption text-slate-500 mt-0.5">
                Dominant root causes driving project cost escalation and completion slippage across the national portfolio.
              </p>
            </div>
            <a href="#/bottlenecks" class="text-xs font-bold text-blue-800 hover:text-blue-900 flex items-center gap-1">
              <span>Bottlenecks Intel Observatory</span>
              <span>➔</span>
            </a>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between hover:border-slate-300 transition-colors">
              <div>
                <div class="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span class="flex items-center gap-1.5"><span>📍</span> <span>Land Acquisition & RoW</span></span>
                  <span class="text-[10px] text-red-700 bg-red-100 px-1.5 py-0.2 rounded">38.2% SHARE</span>
                </div>
                <p class="text-slate-500 text-xs mt-2 leading-relaxed">
                  Leading constraint across 3,820 delayed megaprojects. Causes an average schedule slippage of 15.4 months.
                </p>
              </div>
              <div class="mt-4 pt-2.5 border-t border-slate-200/80 flex items-center justify-between">
                <span class="text-[11px] font-mono font-semibold text-slate-700">₹16.4L Cr Exposure</span>
                <a href="#/projects?bottleneck=land_acquisition" class="text-[11px] font-bold text-blue-700 hover:text-blue-900">Filter 3,820 Projects ➔</a>
              </div>
            </div>

            <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between hover:border-slate-300 transition-colors">
              <div>
                <div class="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span class="flex items-center gap-1.5"><span>🌲</span> <span>Clearance Impasses</span></span>
                  <span class="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">24.5% SHARE</span>
                </div>
                <p class="text-slate-500 text-xs mt-2 leading-relaxed">
                  Forest Stage-I/II clearances and Wildlife Board permissions pending across 2,450 packages in Highways & Rail.
                </p>
              </div>
              <div class="mt-4 pt-2.5 border-t border-slate-200/80 flex items-center justify-between">
                <span class="text-[11px] font-mono font-semibold text-slate-700">₹10.2L Cr Exposure</span>
                <a href="#/projects?bottleneck=clearance_impasse" class="text-[11px] font-bold text-blue-700 hover:text-blue-900">Filter 2,450 Projects ➔</a>
              </div>
            </div>

            <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between hover:border-slate-300 transition-colors">
              <div>
                <div class="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span class="flex items-center gap-1.5"><span>⚡</span> <span>Progress Decoupling Gap</span></span>
                  <span class="text-[10px] text-orange-700 bg-orange-100 px-1.5 py-0.2 rounded">14.2% SHARE</span>
                </div>
                <p class="text-slate-500 text-xs mt-2 leading-relaxed">
                  Disbursement exceeding physical construction by &gt;20 percentage points flagged in 1,420 projects.
                </p>
              </div>
              <div class="mt-4 pt-2.5 border-t border-slate-200/80 flex items-center justify-between">
                <span class="text-[11px] font-mono font-semibold text-slate-700">₹7.8L Cr Exposure</span>
                <a href="#/data-quality" class="text-[11px] font-bold text-blue-700 hover:text-blue-900">Audit Decoupling ➔</a>
              </div>
            </div>

          </div>
        </div>

        <!-- =====================================================================
             PRIORITY ADMINISTRATIVE REVIEW QUEUE TABLE
             ===================================================================== -->
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
                Central sector projects requiring earliest executive intervention based on compound predictive risk indicators.
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
                        Inspect Dossier ↗
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
    const donutCanvas = document.getElementById("dashboard-risk-donut-canvas");
    const sectorCanvas = document.getElementById("dashboard-sector-canvas");

    let dist = { low: 4210, moderate: 2150, high: 2480, critical: 1160 };

    if (window.APIClient && window.APIClient.isLive) {
      try {
        const live = await window.APIClient.getDashboardSummary();
        if (live) {
          if (live.risk_distribution) dist = live.risk_distribution;
          
          const elTracked = document.getElementById("kpi-tracked-count");
          const elCost = document.getElementById("kpi-revised-cost");
          const elOverrun = document.getElementById("kpi-overrun-cost");
          const elReview = document.getElementById("kpi-review-count");

          if (elTracked) elTracked.innerText = Number(live.tracked_projects_count).toLocaleString("en-IN");
          if (elCost) elCost.innerText = live.total_revised_cost_formatted;
          if (elReview) elReview.innerText = Number(live.projects_requiring_review_count).toLocaleString("en-IN");
          if (elOverrun && live.total_cost_overrun_formatted) elOverrun.innerText = live.total_cost_overrun_formatted;

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
          risk_tier: "CRITICAL",
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
                    Inspect Dossier ↗
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

    // 1. Render Risk Donut Chart
    if (donutCanvas && typeof Chart !== "undefined") {
      if (this.donutChart) this.donutChart.destroy();
      this.donutChart = new Chart(donutCanvas, {
        type: "doughnut",
        data: {
          labels: ["Low Risk", "Moderate Risk", "High Risk", "Critical Risk"],
          datasets: [{
            data: [dist.low, dist.moderate, dist.high, dist.critical],
            backgroundColor: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"],
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

    // 2. Render Sector Bar Chart
    if (sectorCanvas && typeof Chart !== "undefined") {
      if (this.sectorChart) this.sectorChart.destroy();
      this.sectorChart = new Chart(sectorCanvas, {
        type: "bar",
        data: {
          labels: ["Roads", "Railways", "Power", "Petroleum", "Urban Dev", "Shipping"],
          datasets: [{
            label: "Revised Outlay (₹ Thousand Cr)",
            data: [1420, 1150, 780, 490, 320, 180],
            backgroundColor: ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#cbd5e1"],
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: "#f8fafc" },
              ticks: { callback: (val) => `₹${val}k Cr` }
            },
            x: {
              grid: { display: false }
            }
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "#0f172a",
              callbacks: {
                label: (ctx) => ` Outlay: ₹${ctx.parsed.y * 1000} Crore`
              }
            }
          }
        }
      });
    }
  }
};

window.DashboardView = DashboardView;
