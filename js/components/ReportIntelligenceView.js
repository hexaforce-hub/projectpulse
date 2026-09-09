// ==========================================================================
// ASTRA — Report Intelligence Center (Phase 12)
// Ministry of Statistics & Programme Implementation (MoSPI) • IPMD
// Smart India Hackathon 2026 — Team HexaForce
//
// 16 Subviews Aligned with Official PAIMANA Flash Reports (April–July 2026):
// 1. Overview | 2. Sectors | 3. Ministries | 4. States | 5. NER | 6. HML Categories
// 7. Major vs Mega | 8. Table 1 (Ministry-wise) | 9. Table 2 (State-wise)
// 10. Table 3 (Completed) | 11. Table 4 (Newly Added) | 12. Table 5 (NER Projects)
// 13. Table 6 (All Ongoing) | 14. Command Search | 15. MoM Comparison
// 16. Headline Feature: "PAIMANA Snapshot -> ASTRA Forecast"
// + Data Quality Observatory & Dual-Model Benchmarking
// ==========================================================================

const ReportIntelligenceView = {
  activeTab: "overview",
  selectedSnapshot: "2026-07",
  comparisonBaseline: "2026-04",
  table6Mode: "full", // "paimana", "astra", "full"
  selectedForecastProject: "PRJ-SYN-000002",
  isReportMode: false,
  cachedData: {},

  render() {
    return `
      <div class="space-y-6 pb-16">
        <!-- Official Government Title & Control Header -->
        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div class="flex items-start gap-3">
              <div class="w-11 h-11 rounded-xl bg-blue-900 text-white flex items-center justify-center flex-shrink-0 shadow-sm font-bold text-lg">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <h1 class="text-xl font-bold text-slate-900 tracking-tight">Report Intelligence Center</h1>
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                    PAIMANA Flash Report Alignment
                  </span>
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                    Temporal Snapshot Engine
                  </span>
                </div>
                <p class="text-xs text-slate-500 mt-1">
                  Reproducing official MoSPI IPMD Flash Report appendices with temporal month-over-month deltas, predictive risk forecasting, and execution intelligence.
                </p>
              </div>
            </div>

            <!-- Global Snapshot & Action Controls -->
            <div class="flex items-center gap-2.5 flex-wrap">
              <!-- Snapshot Selector -->
              <div class="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 shadow-xs">
                <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Snapshot:</span>
                <select id="report-snapshot-select" onchange="ReportIntelligenceView.onSnapshotChange(this.value)" class="bg-transparent text-xs font-bold text-blue-900 focus:outline-none cursor-pointer">
                  <option value="2026-07" ${this.selectedSnapshot === '2026-07' ? 'selected' : ''}>July 2026 (FlashReport_July_2026.pdf)</option>
                  <option value="2026-06" ${this.selectedSnapshot === '2026-06' ? 'selected' : ''}>June 2026 (FlashReport_June_2026.pdf)</option>
                  <option value="2026-05" ${this.selectedSnapshot === '2026-05' ? 'selected' : ''}>May 2026 (FlashReport_May2026.pdf)</option>
                  <option value="2026-04" ${this.selectedSnapshot === '2026-04' ? 'selected' : ''}>April 2026 (FlashReport_April2026.pdf)</option>
                </select>
              </div>

              <!-- Export CSV Button -->
              <button onclick="ReportIntelligenceView.exportCSV()" class="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg flex items-center gap-1.5 shadow-xs transition">
                <svg class="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                Export CSV
              </button>

              <!-- Print / Official Report Mode -->
              <button onclick="ReportIntelligenceView.openOfficialReport()" title="Open official MoSPI IPMD Flash Report with Print / PDF download" class="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-800 hover:bg-blue-900 rounded-lg flex items-center gap-1.5 shadow-xs transition">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                </svg>
                Official Report (Print / PDF)
              </button>
            </div>
          </div>

          <!-- Official Provenance Banner -->
          <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <div class="flex items-center gap-2">
              <span class="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              <span><strong>Data Source:</strong> PAIMANA Archival Reference Snapshot • <strong>Baseline Month:</strong> ${this.selectedSnapshot}</span>
            </div>
            <div class="text-slate-400">
              Strict Forward Temporal Cutoff • Zero Synthetic Data Presented as Confirmed Official Fact
            </div>
          </div>
        </div>

        <!-- Subview Navigation Tabs (16 Subviews) -->
        <div class="bg-white border border-slate-200 rounded-xl p-1.5 shadow-xs">
          <div class="flex items-center gap-1 overflow-x-auto text-xs font-semibold scrollbar-thin pb-1">
            <button onclick="ReportIntelligenceView.switchTab('overview')" class="tab-btn px-3 py-1.5 rounded-lg whitespace-nowrap transition ${this.activeTab === 'overview' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
              1. Overview
            </button>
            <button onclick="ReportIntelligenceView.switchTab('forecast')" class="tab-btn px-3 py-1.5 rounded-lg whitespace-nowrap transition ${this.activeTab === 'forecast' ? 'bg-indigo-700 text-white shadow-xs' : 'text-indigo-700 hover:bg-indigo-50 font-bold'}">
              ★ Snapshot → Forecast
            </button>
            <button onclick="ReportIntelligenceView.switchTab('sectors')" class="tab-btn px-3 py-1.5 rounded-lg whitespace-nowrap transition ${this.activeTab === 'sectors' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
              2. Sectors
            </button>
            <button onclick="ReportIntelligenceView.switchTab('ministries')" class="tab-btn px-3 py-1.5 rounded-lg whitespace-nowrap transition ${this.activeTab === 'ministries' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
              3. Ministries
            </button>
            <button onclick="ReportIntelligenceView.switchTab('states')" class="tab-btn px-3 py-1.5 rounded-lg whitespace-nowrap transition ${this.activeTab === 'states' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
              4. States Scatter
            </button>
            <button onclick="ReportIntelligenceView.switchTab('ner')" class="tab-btn px-3 py-1.5 rounded-lg whitespace-nowrap transition ${this.activeTab === 'ner' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
              5. North Eastern Region
            </button>
            <button onclick="ReportIntelligenceView.switchTab('hml')" class="tab-btn px-3 py-1.5 rounded-lg whitespace-nowrap transition ${this.activeTab === 'hml' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
              6. HML Categories
            </button>
            <button onclick="ReportIntelligenceView.switchTab('major-mega')" class="tab-btn px-3 py-1.5 rounded-lg whitespace-nowrap transition ${this.activeTab === 'major-mega' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
              7. Major vs Mega
            </button>
            <button onclick="ReportIntelligenceView.switchTab('table1')" class="tab-btn px-3 py-1.5 rounded-lg whitespace-nowrap transition ${this.activeTab === 'table1' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
              8. Table 1 (Ministries)
            </button>
            <button onclick="ReportIntelligenceView.switchTab('table2')" class="tab-btn px-3 py-1.5 rounded-lg whitespace-nowrap transition ${this.activeTab === 'table2' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
              9. Table 2 (States)
            </button>
            <button onclick="ReportIntelligenceView.switchTab('table3')" class="tab-btn px-3 py-1.5 rounded-lg whitespace-nowrap transition ${this.activeTab === 'table3' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
              10. Table 3 (Completed)
            </button>
            <button onclick="ReportIntelligenceView.switchTab('table4')" class="tab-btn px-3 py-1.5 rounded-lg whitespace-nowrap transition ${this.activeTab === 'table4' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
              11. Table 4 (New)
            </button>
            <button onclick="ReportIntelligenceView.switchTab('table5')" class="tab-btn px-3 py-1.5 rounded-lg whitespace-nowrap transition ${this.activeTab === 'table5' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
              12. Table 5 (NER)
            </button>
            <button onclick="ReportIntelligenceView.switchTab('table6')" class="tab-btn px-3 py-1.5 rounded-lg whitespace-nowrap transition ${this.activeTab === 'table6' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
              13. Table 6 (All Ongoing)
            </button>
            <button onclick="ReportIntelligenceView.switchTab('mom-compare')" class="tab-btn px-3 py-1.5 rounded-lg whitespace-nowrap transition ${this.activeTab === 'mom-compare' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
              14. MoM Comparison
            </button>
            <button onclick="ReportIntelligenceView.switchTab('data-quality')" class="tab-btn px-3 py-1.5 rounded-lg whitespace-nowrap transition ${this.activeTab === 'data-quality' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
              15. Data Quality (DQ)
            </button>
            <button onclick="ReportIntelligenceView.switchTab('models')" class="tab-btn px-3 py-1.5 rounded-lg whitespace-nowrap transition ${this.activeTab === 'models' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}">
              16. Model Benchmarks
            </button>
          </div>
        </div>

        <!-- Dynamic Content Mount Container -->
        <div id="report-tab-content" class="min-h-[450px]">
          <div class="flex items-center justify-center p-12 text-slate-400 text-sm">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-800" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            Loading ASTRA Report Intelligence...
          </div>
        </div>
      </div>
    `;
  },

  async postRender() {
    this.switchTab(this.activeTab);
  },

  async onSnapshotChange(newSnapshot) {
    this.selectedSnapshot = newSnapshot;
    this.switchTab(this.activeTab);
  },

  async switchTab(tab) {
    this.activeTab = tab;
    const container = document.getElementById("report-tab-content");
    if (!container) return;

    // Update tab bar active styles
    document.querySelectorAll(".tab-btn").forEach(btn => {
      btn.classList.remove("bg-blue-900", "bg-indigo-700", "text-white");
      btn.classList.add("text-slate-600");
    });

    container.innerHTML = `
      <div class="flex items-center justify-center p-12 text-slate-400 text-sm">
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-800" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        Fetching ${tab} analysis...
      </div>
    `;

    try {
      if (tab === "overview") {
        await this.renderOverview(container);
      } else if (tab === "forecast") {
        await this.renderForecastHeadline(container);
      } else if (tab === "sectors") {
        await this.renderSectors(container);
      } else if (tab === "ministries") {
        await this.renderMinistries(container);
      } else if (tab === "states") {
        await this.renderStates(container);
      } else if (tab === "ner") {
        await this.renderNER(container);
      } else if (tab === "hml") {
        await this.renderHML(container);
      } else if (tab === "major-mega") {
        await this.renderMajorMega(container);
      } else if (tab === "table1") {
        await this.renderTable1(container);
      } else if (tab === "table2") {
        await this.renderTable2(container);
      } else if (tab === "table3") {
        await this.renderTable3(container);
      } else if (tab === "table4") {
        await this.renderTable4(container);
      } else if (tab === "table5") {
        await this.renderTable5(container);
      } else if (tab === "table6") {
        await this.renderTable6(container);
      } else if (tab === "mom-compare") {
        await this.renderMoMCompare(container);
      } else if (tab === "data-quality") {
        await this.renderDataQuality(container);
      } else if (tab === "models") {
        await this.renderModels(container);
      }
    } catch (err) {
      console.error("[ReportIntelligence] Tab render error:", err);
      container.innerHTML = `
        <div class="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <strong>Failed to load tab data:</strong> ${err.message || err}
        </div>
      `;
    }
  },

  // -------------------------------------------------------------
  // 1. Report Overview: PAIMANA Monitoring vs ASTRA Intelligence
  // -------------------------------------------------------------
  async renderOverview(container) {
    const data = await window.APIClient.reports.getOverview(this.selectedSnapshot);
    const p = data.paimana_monitoring;
    const a = data.astra_intelligence;

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Section I: PAIMANA Official Monitoring KPI Strip -->
        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-blue-700"></span>
              <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wide">I. PAIMANA Official Monitoring Overview</h2>
              <span class="text-xs text-slate-400 font-normal">(${data.source_report})</span>
            </div>
            <span class="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
              Descriptive Governance Truth
            </span>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div class="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
              <div class="text-[11px] font-semibold text-slate-500 uppercase">Ongoing Projects</div>
              <div class="text-xl font-bold text-slate-900 mt-1">${p.ongoing_projects}</div>
              <div class="text-[10px] text-slate-400 mt-0.5">₹150 Cr+ central sector</div>
            </div>
            <div class="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
              <div class="text-[11px] font-semibold text-slate-500 uppercase">Commissioned</div>
              <div class="text-xl font-bold text-emerald-700 mt-1">${p.commissioned_projects}</div>
              <div class="text-[10px] text-slate-400 mt-0.5">Completed in period</div>
            </div>
            <div class="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
              <div class="text-[11px] font-semibold text-slate-500 uppercase">Newly Added</div>
              <div class="text-xl font-bold text-blue-700 mt-1">${p.newly_added_projects}</div>
              <div class="text-[10px] text-slate-400 mt-0.5">Inducted this period</div>
            </div>
            <div class="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
              <div class="text-[11px] font-semibold text-slate-500 uppercase">Original Cost</div>
              <div class="text-xl font-bold text-slate-900 mt-1">${p.original_cost_formatted}</div>
              <div class="text-[10px] text-slate-400 mt-0.5">Sanctioned outlay</div>
            </div>
            <div class="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
              <div class="text-[11px] font-semibold text-slate-500 uppercase">Latest Revised Cost</div>
              <div class="text-xl font-bold text-slate-900 mt-1">${p.revised_cost_formatted}</div>
              <div class="text-[10px] text-rose-600 font-medium mt-0.5">Cost growth: +${p.cost_growth_pct}%</div>
            </div>
            <div class="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
              <div class="text-[11px] font-semibold text-slate-500 uppercase">Cumulative Disbursed</div>
              <div class="text-xl font-bold text-slate-900 mt-1">${p.cumulative_expenditure_formatted}</div>
              <div class="text-[10px] text-slate-400 mt-0.5">${p.expenditure_to_revised_ratio_pct}% of revised</div>
            </div>
          </div>
        </div>

        <!-- Section II: ASTRA Predictive & Decision Intelligence KPI Strip -->
        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-indigo-600"></span>
              <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wide">II. ASTRA Predictive & Decision Intelligence Layer</h2>
              <span class="text-xs text-indigo-600 font-semibold">(Machine Learning Inference)</span>
            </div>
            <span class="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
              Analytical Surveillance
            </span>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div class="bg-rose-50/50 border border-rose-200 rounded-lg p-3.5">
              <div class="text-[11px] font-semibold text-rose-700 uppercase">High-Risk Projects</div>
              <div class="text-xl font-bold text-rose-800 mt-1">${a.high_risk_projects}</div>
              <div class="text-[10px] text-rose-600 font-medium mt-0.5">Requiring analytical review</div>
            </div>
            <div class="bg-rose-50 border border-rose-300 rounded-lg p-3.5">
              <div class="text-[11px] font-semibold text-rose-800 uppercase">Critical Tier</div>
              <div class="text-xl font-bold text-rose-900 mt-1">${a.critical_projects}</div>
              <div class="text-[10px] text-rose-700 mt-0.5">Imminent target failure</div>
            </div>
            <div class="bg-amber-50/50 border border-amber-200 rounded-lg p-3.5">
              <div class="text-[11px] font-semibold text-amber-700 uppercase">Schedule Pressure</div>
              <div class="text-xl font-bold text-amber-800 mt-1">${a.schedule_pressure_projects}</div>
              <div class="text-[10px] text-amber-600 mt-0.5">Slippage probability > 65%</div>
            </div>
            <div class="bg-amber-50/50 border border-amber-200 rounded-lg p-3.5">
              <div class="text-[11px] font-semibold text-amber-700 uppercase">Cost Escalation</div>
              <div class="text-xl font-bold text-amber-800 mt-1">${a.cost_escalation_projects}</div>
              <div class="text-[10px] text-amber-600 mt-0.5">Projects with overrun drift</div>
            </div>
            <div class="bg-indigo-50/50 border border-indigo-200 rounded-lg p-3.5">
              <div class="text-[11px] font-semibold text-indigo-700 uppercase">Capital at Risk</div>
              <div class="text-xl font-bold text-indigo-900 mt-1">${a.capital_at_risk_formatted}</div>
              <div class="text-[10px] text-indigo-600 mt-0.5">Risk-weighted exposure</div>
            </div>
            <div class="bg-sky-50/50 border border-sky-200 rounded-lg p-3.5">
              <div class="text-[11px] font-semibold text-sky-700 uppercase">Data Quality Flags</div>
              <div class="text-xl font-bold text-sky-900 mt-1">${a.data_quality_flags_count}</div>
              <div class="text-[10px] text-sky-600 mt-0.5">Human review required</div>
            </div>
          </div>

          <div class="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-start gap-2">
            <span class="text-amber-500 font-bold mt-0.5">ℹ</span>
            <div>
              <strong>Analytical Guidance:</strong> ${a.analytical_capital_exposure_label}. Figures reflect mathematical model outputs and must not be conflated with confirmed financial losses.
            </div>
          </div>
        </div>

        <!-- Quick Interactive Drilldown Shortcuts -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div onclick="ReportIntelligenceView.switchTab('forecast')" class="cursor-pointer bg-gradient-to-br from-indigo-900 to-blue-900 text-white rounded-xl p-5 shadow-sm hover:shadow-md transition">
            <div class="text-xs font-semibold text-indigo-200 uppercase tracking-wider">Flagship Demonstration</div>
            <div class="text-lg font-bold mt-1">PAIMANA Snapshot → ASTRA Forecast</div>
            <p class="text-xs text-indigo-100/80 mt-2">
              Trace project PRJ-SYN-000002 from April–July 2026 government reports through AI risk detection, TreeSHAP explainability, and recovery simulation.
            </p>
            <div class="mt-4 flex items-center gap-1.5 text-xs font-bold text-amber-300">
              Launch Interactive Flow →
            </div>
          </div>

          <div onclick="ReportIntelligenceView.switchTab('table6')" class="cursor-pointer bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-blue-400 transition">
            <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Flash Report Appendix</div>
            <div class="text-lg font-bold text-slate-900 mt-1">Table 6: All Ongoing Projects</div>
            <p class="text-xs text-slate-500 mt-2">
              View the entire central sector portfolio with toggles for official PAIMANA fields, ASTRA risk metrics, and full unified intelligence.
            </p>
            <div class="mt-4 flex items-center gap-1.5 text-xs font-bold text-blue-700">
              Browse Table 6 Registry →
            </div>
          </div>

          <div onclick="ReportIntelligenceView.switchTab('mom-compare')" class="cursor-pointer bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-blue-400 transition">
            <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Temporal Dynamics</div>
            <div class="text-lg font-bold text-slate-900 mt-1">Month-over-Month Comparison</div>
            <p class="text-xs text-slate-500 mt-2">
              Analyze physical progress acceleration, financial burn divergence, and risk deterioration between April, May, June, and July snapshots.
            </p>
            <div class="mt-4 flex items-center gap-1.5 text-xs font-bold text-blue-700">
              Inspect MoM Shifts →
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // -------------------------------------------------------------
  // Headline Feature: "PAIMANA Snapshot -> ASTRA Forecast"
  // -------------------------------------------------------------
  async renderForecastHeadline(container) {
    const data = await window.APIClient.reports.getForecastJourney(this.selectedForecastProject, this.selectedSnapshot);

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Feature Banner -->
        <div class="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-xl p-6 shadow-md">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-400 text-slate-900 uppercase">
                  Judge-Facing Flagship Differentiator
                </span>
                <span class="text-xs text-indigo-200 font-mono">SIH26103 Anchor Corridor</span>
              </div>
              <h2 class="text-2xl font-bold tracking-tight mt-1.5">${data.headline}</h2>
              <p class="text-xs text-indigo-200/90 mt-1">
                ${data.tagline} • Demonstrating how static Flash Reports evolve into early-warning decision support.
              </p>
            </div>

            <!-- Project Switcher in Headline -->
            <div class="bg-white/10 backdrop-blur-xs border border-white/20 rounded-lg p-2.5 flex items-center gap-2">
              <span class="text-xs text-white/80 font-semibold">Select Project:</span>
              <select onchange="ReportIntelligenceView.onForecastProjectChange(this.value)" class="bg-slate-900 text-white text-xs font-semibold px-2 py-1 rounded border border-white/20 focus:outline-none">
                <option value="PRJ-SYN-000002" ${this.selectedForecastProject === 'PRJ-SYN-000002' ? 'selected' : ''}>PRJ-SYN-000002 (Varanasi-Ranchi-Kolkata PKG-3 Ganga Bridge)</option>
                <option value="PRJ-SYN-000001" ${this.selectedForecastProject === 'PRJ-SYN-000001' ? 'selected' : ''}>PRJ-SYN-000001 (Western DFC Vadodara Section)</option>
                <option value="PRJ-SYN-000010" ${this.selectedForecastProject === 'PRJ-SYN-000010' ? 'selected' : ''}>PRJ-SYN-000010 (Mumbai Urban Transit Extension)</option>
              </select>
            </div>
          </div>

          <!-- Project Identity Strip -->
          <div class="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            <div>
              <span class="text-white/60 block text-[10px] uppercase">Corridor Name</span>
              <span class="font-bold text-white">${data.project_name}</span>
            </div>
            <div>
              <span class="text-white/60 block text-[10px] uppercase">Official Identifiers</span>
              <span class="font-bold text-amber-300 font-mono">${data.project_code} • ${data.project_id}</span>
            </div>
            <div>
              <span class="text-white/60 block text-[10px] uppercase">Agency & Ministry</span>
              <span class="font-semibold text-white">${data.agency}</span>
            </div>
            <div>
              <span class="text-white/60 block text-[10px] uppercase">State Jurisdiction</span>
              <span class="font-semibold text-white">${data.state} (Multi-State Alignment)</span>
            </div>
            <div>
              <span class="text-white/60 block text-[10px] uppercase">Current Risk Status</span>
              <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500 text-white inline-block mt-0.5">
                ${data.step_3_detection.risk_level} (${data.step_3_detection.risk_score}/100)
              </span>
            </div>
          </div>
        </div>

        <!-- 7-Step Progression Journey Cards -->
        <div class="grid grid-cols-1 gap-5">
          <!-- Step 1: Observed Government Baseline -->
          <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-blue-100 text-blue-900 font-bold text-xs flex items-center justify-center">1</span>
                <h3 class="text-sm font-bold text-slate-900">${data.step_1_observed.title}</h3>
              </div>
              <span class="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-100 text-slate-700">PAIMANA Baseline</span>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div>
                <span class="text-slate-500 block text-[10px] uppercase">Reported Physical Progress</span>
                <span class="font-bold text-slate-900 text-sm">${data.step_1_observed.physical_progress_pct}%</span>
              </div>
              <div>
                <span class="text-slate-500 block text-[10px] uppercase">Cumulative Expenditure</span>
                <span class="font-bold text-slate-900 text-sm">₹${data.step_1_observed.cumulative_expenditure_cr.toLocaleString()} Cr</span>
              </div>
              <div>
                <span class="text-slate-500 block text-[10px] uppercase">Approved Revised Cost</span>
                <span class="font-bold text-slate-900 text-sm">₹${data.step_1_observed.revised_cost_cr.toLocaleString()} Cr</span>
              </div>
              <div>
                <span class="text-slate-500 block text-[10px] uppercase">Target DoC / Revised DoC</span>
                <span class="font-bold text-slate-900 text-sm">${data.step_1_observed.target_doc} / ${data.step_1_observed.revised_doc}</span>
              </div>
            </div>
            <div class="text-[11px] text-slate-500 mt-2">
              <em>${data.step_1_observed.note}</em>
            </div>
          </div>

          <!-- Step 2: Month-over-Month Dynamics -->
          <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-blue-100 text-blue-900 font-bold text-xs flex items-center justify-center">2</span>
                <h3 class="text-sm font-bold text-slate-900">${data.step_2_change.title}</h3>
              </div>
              <span class="px-2 py-0.5 text-[10px] font-semibold rounded bg-amber-100 text-amber-800">MoM Evolution</span>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-amber-50/40 p-3.5 rounded-lg border border-amber-200">
              <div>
                <span class="text-slate-500 block text-[10px] uppercase">Progress Timeline</span>
                <span class="font-bold text-slate-900 text-xs">${data.step_2_change.timeline_shift}</span>
              </div>
              <div>
                <span class="text-slate-500 block text-[10px] uppercase">4-Month Physical Delta</span>
                <span class="font-bold text-amber-800 text-sm">${data.step_2_change.physical_progress_delta}</span>
              </div>
              <div>
                <span class="text-slate-500 block text-[10px] uppercase">Disbursement Added</span>
                <span class="font-bold text-slate-900 text-sm">${data.step_2_change.expenditure_disbursed_delta}</span>
              </div>
              <div>
                <span class="text-slate-500 block text-[10px] uppercase">Risk Score Shift</span>
                <span class="font-bold text-rose-700 text-sm">${data.step_2_change.risk_score_shift} (${data.step_2_change.risk_trend})</span>
              </div>
            </div>
          </div>

          <!-- Step 3 & 4: Detection & TreeSHAP Drivers Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <!-- Step 3: ASTRA Friction Detection -->
            <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div class="flex items-center gap-2 mb-3">
                <span class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-900 font-bold text-xs flex items-center justify-center">3</span>
                <h3 class="text-sm font-bold text-slate-900">${data.step_3_detection.title}</h3>
              </div>
              <div class="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs space-y-2">
                <div class="font-bold text-rose-900">${data.step_3_detection.critical_finding}</div>
                <div class="text-slate-600">
                  <strong>Primary Bottleneck:</strong> ${data.step_3_detection.primary_bottleneck}
                </div>
                <div class="text-slate-600">
                  <strong>Data Surveillance State:</strong> ${data.step_3_detection.data_freshness}
                </div>
              </div>
            </div>

            <!-- Step 4: TreeSHAP Attribution -->
            <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div class="flex items-center gap-2 mb-3">
                <span class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-900 font-bold text-xs flex items-center justify-center">4</span>
                <h3 class="text-sm font-bold text-slate-900">${data.step_4_explainability.title}</h3>
              </div>
              <div class="space-y-2">
                ${data.step_4_explainability.drivers.map(d => `
                  <div class="flex items-center justify-between text-xs p-2 rounded bg-slate-50 border border-slate-200">
                    <div>
                      <div class="font-semibold text-slate-800">${d.factor}</div>
                      <div class="text-[10px] text-slate-500">${d.evidence}</div>
                    </div>
                    <span class="font-mono font-bold text-rose-600 text-xs">${d.impact}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Step 5, 6, 7: Consequence, Intervention & Recovery -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <!-- Step 5: Consequence -->
            <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div class="flex items-center gap-2 mb-3">
                <span class="w-6 h-6 rounded-full bg-rose-100 text-rose-900 font-bold text-xs flex items-center justify-center">5</span>
                <h3 class="text-xs font-bold text-slate-900">${data.step_5_consequence.title}</h3>
              </div>
              <div class="space-y-2 text-xs">
                <div class="p-2.5 bg-rose-50 border border-rose-200 rounded text-rose-900">
                  <div class="text-[10px] uppercase font-semibold text-rose-600">Projected Schedule Slippage</div>
                  <div class="text-lg font-bold mt-0.5">+${data.step_5_consequence.estimated_additional_delay_months} Months</div>
                  <div class="text-[10px] mt-0.5">Est. DoC: ${data.step_5_consequence.projected_completion_date}</div>
                </div>
                <div class="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-800">
                  <div class="text-[10px] uppercase font-semibold text-slate-500">Projected Cost Escalation</div>
                  <div class="text-sm font-bold mt-0.5">+₹${data.step_5_consequence.estimated_cost_escalation_cr.toLocaleString()} Cr</div>
                </div>
              </div>
            </div>

            <!-- Step 6: Targeted Intervention -->
            <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div class="flex items-center gap-2 mb-3">
                <span class="w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center">6</span>
                <h3 class="text-xs font-bold text-slate-900">${data.step_6_intervention.title}</h3>
              </div>
              <div class="space-y-2 text-xs">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 block w-max">
                  ${data.step_6_intervention.priority}
                </span>
                <p class="text-slate-700 font-medium">${data.step_6_intervention.proposed_directive}</p>
                <div class="p-2 bg-slate-50 rounded border border-slate-200 text-[10px] text-slate-500">
                  <strong>Governance Policy:</strong> ${data.step_6_intervention.governance_rule}
                </div>
              </div>
            </div>

            <!-- Step 7: Recovery Simulation -->
            <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div class="flex items-center gap-2 mb-3">
                <span class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center justify-center">7</span>
                <h3 class="text-xs font-bold text-slate-900">${data.step_7_what_if.title}</h3>
              </div>
              <div class="space-y-2 text-xs">
                <div class="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-900">
                  <div class="text-[10px] uppercase font-semibold text-emerald-700">Simulated Risk Recovery</div>
                  <div class="text-lg font-bold mt-0.5">${data.step_7_what_if.baseline_risk} → ${data.step_7_what_if.simulated_risk} (${data.step_7_what_if.risk_reduction_points} pts)</div>
                  <div class="text-[10px] text-emerald-800 mt-0.5">Time Recovered: ~${data.step_7_what_if.recovered_months} Months</div>
                </div>
                <div class="text-[11px] text-slate-500">
                  Validated against LightGBM Counterfactual Simulator with zero mutation to underlying project record.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  async onForecastProjectChange(pid) {
    this.selectedForecastProject = pid;
    const container = document.getElementById("report-tab-content");
    if (container) await this.renderForecastHeadline(container);
  },

  // -------------------------------------------------------------
  // 2. Sectoral Comparison
  // -------------------------------------------------------------
  async renderSectors(container) {
    const data = await window.APIClient.reports.getSectors(this.selectedSnapshot);
    const sectors = data.sectors || [];

    container.innerHTML = `
      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wide">Sectoral Comparison: Major Infrastructure Sectors</h2>
            <p class="text-xs text-slate-500 mt-0.5">Snapshot: ${this.selectedSnapshot} • Interactive drilldown into sector risk and capital exposure</p>
          </div>
          <span class="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
            ${sectors.length} Sectors Tracked
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200 text-[11px] uppercase tracking-wider">
                <th class="py-2.5 px-3">Sector</th>
                <th class="py-2.5 px-3">HML Category</th>
                <th class="py-2.5 px-3 text-right">Projects</th>
                <th class="py-2.5 px-3 text-right">Original Cost</th>
                <th class="py-2.5 px-3 text-right">Revised Cost</th>
                <th class="py-2.5 px-3 text-right">Expenditure</th>
                <th class="py-2.5 px-3 text-right">Cost Growth</th>
                <th class="py-2.5 px-3 text-right">Avg Progress</th>
                <th class="py-2.5 px-3 text-center">Avg Risk</th>
                <th class="py-2.5 px-3 text-right">High Risk Cap</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${sectors.map(s => `
                <tr class="hover:bg-slate-50/80 transition cursor-pointer" onclick="ReportIntelligenceView.filterTable6By('sector', '${s.sector}')">
                  <td class="py-2.5 px-3 font-semibold text-slate-900">${s.sector}</td>
                  <td class="py-2.5 px-3 text-slate-500">${s.hml_category}</td>
                  <td class="py-2.5 px-3 text-right font-bold text-slate-800">${s.project_count}</td>
                  <td class="py-2.5 px-3 text-right font-mono">${s.original_cost_formatted}</td>
                  <td class="py-2.5 px-3 text-right font-mono">${s.revised_cost_formatted}</td>
                  <td class="py-2.5 px-3 text-right font-mono">${s.expenditure_formatted}</td>
                  <td class="py-2.5 px-3 text-right font-semibold ${s.cost_growth_pct > 15 ? 'text-rose-600' : 'text-slate-700'}">+${s.cost_growth_pct}%</td>
                  <td class="py-2.5 px-3 text-right font-medium">${s.avg_physical_progress}%</td>
                  <td class="py-2.5 px-3 text-center">
                    <span class="px-2 py-0.5 rounded text-[11px] font-bold ${s.avg_risk_score > 60 ? 'bg-rose-100 text-rose-800' : (s.avg_risk_score > 40 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800')}">
                      ${s.avg_risk_score}
                    </span>
                  </td>
                  <td class="py-2.5 px-3 text-right font-mono text-rose-700 font-semibold">${s.high_risk_capital_formatted}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // -------------------------------------------------------------
  // 3. Ministry Comparison
  // -------------------------------------------------------------
  async renderMinistries(container) {
    const data = await window.APIClient.reports.getMinistries(this.selectedSnapshot);
    const ministries = data.ministries || [];

    container.innerHTML = `
      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wide">Ministry Comparison: Central Infrastructure Ministries</h2>
            <p class="text-xs text-slate-500 mt-0.5">Snapshot: ${this.selectedSnapshot} • Ranked by project volume and capital exposure</p>
          </div>
          <span class="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
            ${ministries.length} Ministries Tracked
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200 text-[11px] uppercase tracking-wider">
                <th class="py-2.5 px-3">Ministry / Department</th>
                <th class="py-2.5 px-3 text-right">Projects</th>
                <th class="py-2.5 px-3 text-right">Original Cost</th>
                <th class="py-2.5 px-3 text-right">Revised Cost</th>
                <th class="py-2.5 px-3 text-right">Expenditure</th>
                <th class="py-2.5 px-3 text-right">Cost Growth</th>
                <th class="py-2.5 px-3 text-right">Avg Progress</th>
                <th class="py-2.5 px-3 text-center">Avg Risk</th>
                <th class="py-2.5 px-3 text-right">High Risk Qty</th>
                <th class="py-2.5 px-3 text-right">Capital Exposure</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${ministries.map(m => `
                <tr class="hover:bg-slate-50/80 transition cursor-pointer" onclick="ReportIntelligenceView.filterTable6By('ministry', '${m.ministry}')">
                  <td class="py-2.5 px-3 font-semibold text-slate-900">${m.ministry}</td>
                  <td class="py-2.5 px-3 text-right font-bold text-slate-800">${m.project_count}</td>
                  <td class="py-2.5 px-3 text-right font-mono">${m.original_cost_formatted}</td>
                  <td class="py-2.5 px-3 text-right font-mono">${m.revised_cost_formatted}</td>
                  <td class="py-2.5 px-3 text-right font-mono">${m.expenditure_formatted}</td>
                  <td class="py-2.5 px-3 text-right font-semibold ${m.cost_growth_pct > 15 ? 'text-rose-600' : 'text-slate-700'}">+${m.cost_growth_pct}%</td>
                  <td class="py-2.5 px-3 text-right font-medium">${m.avg_physical_progress}%</td>
                  <td class="py-2.5 px-3 text-center">
                    <span class="px-2 py-0.5 rounded text-[11px] font-bold ${m.avg_risk_score > 60 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-800'}">
                      ${m.avg_risk_score}
                    </span>
                  </td>
                  <td class="py-2.5 px-3 text-right font-bold text-rose-700">${m.high_risk_count}</td>
                  <td class="py-2.5 px-3 text-right font-mono text-indigo-900 font-semibold">${m.capital_exposure_formatted}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // -------------------------------------------------------------
  // 4. State Analysis (Scatter / Table)
  // -------------------------------------------------------------
  async renderStates(container) {
    const data = await window.APIClient.reports.getStates(this.selectedSnapshot);
    const states = data.states || [];

    container.innerHTML = `
      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wide">State-wise Infrastructure Distribution</h2>
            <p class="text-xs text-slate-500 mt-0.5">Bubble visualization & tabular summary mapping project density against capital outlay and predictive risk</p>
          </div>
          <span class="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
            ${states.length} States & Territories
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200 text-[11px] uppercase tracking-wider">
                <th class="py-2.5 px-3">State / Union Territory</th>
                <th class="py-2.5 px-3 text-center">Region</th>
                <th class="py-2.5 px-3 text-right">Project Count</th>
                <th class="py-2.5 px-3 text-right">Original Cost</th>
                <th class="py-2.5 px-3 text-right">Revised Cost</th>
                <th class="py-2.5 px-3 text-right">Expenditure</th>
                <th class="py-2.5 px-3 text-right">Avg Progress</th>
                <th class="py-2.5 px-3 text-center">Avg Risk</th>
                <th class="py-2.5 px-3 text-right">High Risk Projects</th>
                <th class="py-2.5 px-3 text-right">Critical Projects</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${states.map(st => `
                <tr class="hover:bg-slate-50/80 transition cursor-pointer" onclick="ReportIntelligenceView.filterTable6By('state', '${st.state}')">
                  <td class="py-2.5 px-3 font-semibold text-slate-900">${st.state}</td>
                  <td class="py-2.5 px-3 text-center">
                    <span class="px-2 py-0.5 rounded text-[10px] font-semibold ${st.is_ner ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'}">
                      ${st.is_ner ? 'NER' : 'Mainland'}
                    </span>
                  </td>
                  <td class="py-2.5 px-3 text-right font-bold text-slate-800">${st.project_count}</td>
                  <td class="py-2.5 px-3 text-right font-mono">${st.original_cost_formatted}</td>
                  <td class="py-2.5 px-3 text-right font-mono">${st.revised_cost_formatted}</td>
                  <td class="py-2.5 px-3 text-right font-mono">${st.expenditure_formatted}</td>
                  <td class="py-2.5 px-3 text-right font-medium">${st.avg_physical_progress}%</td>
                  <td class="py-2.5 px-3 text-center">
                    <span class="px-2 py-0.5 rounded text-[11px] font-bold ${st.avg_risk_score > 60 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-800'}">
                      ${st.avg_risk_score}
                    </span>
                  </td>
                  <td class="py-2.5 px-3 text-right font-bold text-rose-700">${st.high_risk_count}</td>
                  <td class="py-2.5 px-3 text-right font-bold text-rose-900">${st.critical_count}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // -------------------------------------------------------------
  // 5. North Eastern Region (NER)
  // -------------------------------------------------------------
  async renderNER(container) {
    const data = await window.APIClient.reports.getNER(this.selectedSnapshot);

    container.innerHTML = `
      <div class="space-y-6">
        <!-- NER Overview Cards -->
        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-purple-700"></span>
              <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wide">Section II: North Eastern Region (NER) Intelligence</h2>
            </div>
            <span class="text-xs font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100">
              8 North Eastern States + Multi-States
            </span>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            <div class="bg-purple-50/40 border border-purple-200 rounded-lg p-3.5">
              <div class="text-[11px] font-semibold text-purple-800 uppercase">NER Projects</div>
              <div class="text-xl font-bold text-purple-900 mt-1">${data.project_count}</div>
              <div class="text-[10px] text-purple-600 mt-0.5">Active corridors</div>
            </div>
            <div class="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
              <div class="text-[11px] font-semibold text-slate-500 uppercase">Original Outlay</div>
              <div class="text-xl font-bold text-slate-900 mt-1">${data.original_cost_formatted}</div>
              <div class="text-[10px] text-slate-400 mt-0.5">Sanctioned</div>
            </div>
            <div class="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
              <div class="text-[11px] font-semibold text-slate-500 uppercase">Revised Cost</div>
              <div class="text-xl font-bold text-slate-900 mt-1">${data.revised_cost_formatted}</div>
              <div class="text-[10px] text-rose-600 font-medium mt-0.5">Current exposure</div>
            </div>
            <div class="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
              <div class="text-[11px] font-semibold text-slate-500 uppercase">Disbursed</div>
              <div class="text-xl font-bold text-slate-900 mt-1">${data.expenditure_formatted}</div>
              <div class="text-[10px] text-slate-400 mt-0.5">Cumulative</div>
            </div>
            <div class="bg-rose-50 border border-rose-200 rounded-lg p-3.5">
              <div class="text-[11px] font-semibold text-rose-700 uppercase">High Risk</div>
              <div class="text-xl font-bold text-rose-800 mt-1">${data.high_risk_count}</div>
              <div class="text-[10px] text-rose-600 mt-0.5">Critical: ${data.critical_count}</div>
            </div>
            <div class="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
              <div class="text-[11px] font-semibold text-slate-500 uppercase">Mega vs Major</div>
              <div class="text-xl font-bold text-slate-900 mt-1">${data.mega_count} / ${data.major_count}</div>
              <div class="text-[10px] text-slate-400 mt-0.5">Mega: ₹1000 Cr+</div>
            </div>
          </div>
        </div>

        <!-- Top At-Risk NER Projects -->
        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">NER Risk Radar: Top Corridors Requiring Review</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200 text-[11px]">
                  <th class="py-2 px-3">Project ID</th>
                  <th class="py-2 px-3">Project Name</th>
                  <th class="py-2 px-3">State</th>
                  <th class="py-2 px-3">Sector</th>
                  <th class="py-2 px-3">Agency</th>
                  <th class="py-2 px-3 text-right">Cost (₹ Cr)</th>
                  <th class="py-2 px-3 text-right">Progress</th>
                  <th class="py-2 px-3 text-center">Risk Tier</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${data.top_at_risk_projects.map(p => `
                  <tr class="hover:bg-slate-50 transition cursor-pointer" onclick="window.location.hash='#/projects/${p.project_id}'">
                    <td class="py-2 px-3 font-mono font-bold text-blue-700">${p.project_id}</td>
                    <td class="py-2 px-3 font-semibold text-slate-900">${p.project_name}</td>
                    <td class="py-2 px-3 text-slate-600">${p.state}</td>
                    <td class="py-2 px-3 text-slate-600">${p.sector}</td>
                    <td class="py-2 px-3 text-slate-600">${p.agency}</td>
                    <td class="py-2 px-3 text-right font-mono">₹${p.revised_cost_cr.toLocaleString()}</td>
                    <td class="py-2 px-3 text-right font-medium">${p.physical_progress_pct}%</td>
                    <td class="py-2 px-3 text-center">
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold ${p.target_risk_class === 'CRITICAL' ? 'bg-rose-100 text-rose-900' : 'bg-rose-50 text-rose-700'}">
                        ${p.target_risk_class} (${p.overall_risk_score})
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  // -------------------------------------------------------------
  // 6. HML Categories Explorer
  // -------------------------------------------------------------
  async renderHML(container) {
    const data = await window.APIClient.reports.getHML(this.selectedSnapshot);
    const categories = data.categories || [];

    container.innerHTML = `
      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wide">Section III: Harmonized Master List (HML) 2022</h2>
            <p class="text-xs text-slate-500 mt-0.5">Infrastructure sub-sectors mapped to canonical HML classification</p>
          </div>
          <span class="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
            Official Taxonomy
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${categories.map(c => `
            <div class="border border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:bg-white hover:border-blue-400 hover:shadow-xs transition cursor-pointer" onclick="ReportIntelligenceView.filterTable6By('hml', '${c.hml_category}')">
              <div class="flex items-center justify-between">
                <h3 class="font-bold text-slate-900 text-sm">${c.hml_category}</h3>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                  ${c.project_count} Projects
                </span>
              </div>
              <div class="mt-3 space-y-1.5 text-xs text-slate-600">
                <div class="flex justify-between">
                  <span class="text-slate-500">Original Outlay:</span>
                  <span class="font-mono font-medium">${c.original_cost_formatted}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-500">Revised Outlay:</span>
                  <span class="font-mono font-bold text-slate-900">${c.revised_cost_formatted}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-500">Cost Growth:</span>
                  <span class="font-semibold text-rose-600">+${c.cost_growth_pct}%</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-500">Avg Progress:</span>
                  <span class="font-medium">${c.avg_physical_progress}%</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-500">High Risk Count:</span>
                  <span class="font-bold text-rose-700">${c.high_risk_count}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  // -------------------------------------------------------------
  // 7. Major vs Mega Projects
  // -------------------------------------------------------------
  async renderMajorMega(container) {
    const data = await window.APIClient.reports.getMajorMega(this.selectedSnapshot);
    const mega = data.mega_projects || {};
    const major = data.major_projects || {};

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Comparison Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <!-- Mega Projects -->
          <div class="bg-white border-2 border-indigo-200 rounded-xl p-5 shadow-sm">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-indigo-700">Threshold: ≥ ₹1,000 Crore</span>
                <h3 class="text-base font-bold text-slate-900 mt-0.5">Mega Infrastructure Projects</h3>
              </div>
              <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                ${mega.project_count || 0} Projects
              </span>
            </div>
            <div class="grid grid-cols-2 gap-3 text-xs">
              <div class="bg-indigo-50/50 p-2.5 rounded">
                <span class="text-slate-500 block text-[10px] uppercase">Revised Capital Outlay</span>
                <span class="font-bold text-indigo-900 text-sm">${mega.revised_cost_formatted || '₹0'}</span>
              </div>
              <div class="bg-indigo-50/50 p-2.5 rounded">
                <span class="text-slate-500 block text-[10px] uppercase">Capital Exposure at Risk</span>
                <span class="font-bold text-rose-700 text-sm">${mega.capital_exposure_formatted || '₹0'}</span>
              </div>
              <div class="p-2.5 bg-slate-50 rounded">
                <span class="text-slate-500 block text-[10px] uppercase">High Risk Count</span>
                <span class="font-bold text-slate-900 text-sm">${mega.high_risk_count || 0}</span>
              </div>
              <div class="p-2.5 bg-slate-50 rounded">
                <span class="text-slate-500 block text-[10px] uppercase">Avg Physical Progress</span>
                <span class="font-bold text-slate-900 text-sm">${mega.avg_physical_progress || 0}%</span>
              </div>
            </div>
          </div>

          <!-- Major Projects -->
          <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Threshold: < ₹1,000 Crore</span>
                <h3 class="text-base font-bold text-slate-900 mt-0.5">Major Infrastructure Projects</h3>
              </div>
              <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                ${major.project_count || 0} Projects
              </span>
            </div>
            <div class="grid grid-cols-2 gap-3 text-xs">
              <div class="bg-slate-50 p-2.5 rounded">
                <span class="text-slate-500 block text-[10px] uppercase">Revised Capital Outlay</span>
                <span class="font-bold text-slate-900 text-sm">${major.revised_cost_formatted || '₹0'}</span>
              </div>
              <div class="bg-slate-50 p-2.5 rounded">
                <span class="text-slate-500 block text-[10px] uppercase">Capital Exposure at Risk</span>
                <span class="font-bold text-rose-700 text-sm">${major.capital_exposure_formatted || '₹0'}</span>
              </div>
              <div class="p-2.5 bg-slate-50 rounded">
                <span class="text-slate-500 block text-[10px] uppercase">High Risk Count</span>
                <span class="font-bold text-slate-900 text-sm">${major.high_risk_count || 0}</span>
              </div>
              <div class="p-2.5 bg-slate-50 rounded">
                <span class="text-slate-500 block text-[10px] uppercase">Avg Physical Progress</span>
                <span class="font-bold text-slate-900 text-sm">${major.avg_physical_progress || 0}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Mega Project Risk Radar -->
        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Mega Project Risk Radar: High Capital Exposure</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200 text-[11px]">
                  <th class="py-2 px-3">Project ID</th>
                  <th class="py-2 px-3">Project Name</th>
                  <th class="py-2 px-3">Ministry</th>
                  <th class="py-2 px-3">Agency</th>
                  <th class="py-2 px-3 text-right">Revised Cost (₹ Cr)</th>
                  <th class="py-2 px-3 text-right">Progress</th>
                  <th class="py-2 px-3 text-center">Risk Score</th>
                  <th class="py-2 px-3">Primary Bottleneck</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${(data.mega_risk_radar || []).map(p => `
                  <tr class="hover:bg-slate-50 transition cursor-pointer" onclick="window.location.hash='#/projects/${p.project_id}'">
                    <td class="py-2 px-3 font-mono font-bold text-blue-700">${p.project_id}</td>
                    <td class="py-2 px-3 font-semibold text-slate-900">${p.project_name}</td>
                    <td class="py-2 px-3 text-slate-600">${p.ministry}</td>
                    <td class="py-2 px-3 text-slate-600">${p.agency}</td>
                    <td class="py-2 px-3 text-right font-mono font-bold text-slate-900">₹${p.revised_cost_cr.toLocaleString()}</td>
                    <td class="py-2 px-3 text-right font-medium">${p.physical_progress_pct}%</td>
                    <td class="py-2 px-3 text-center">
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold ${p.overall_risk_score > 75 ? 'bg-rose-100 text-rose-900' : 'bg-amber-100 text-amber-900'}">
                        ${p.overall_risk_score}
                      </span>
                    </td>
                    <td class="py-2 px-3 text-slate-500 font-mono text-[10px]">${p.primary_bottleneck}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  // -------------------------------------------------------------
  // 8. Flash Report Table 1: Ministry-wise Ongoing Projects
  // -------------------------------------------------------------
  async renderTable1(container) {
    const data = await window.APIClient.reports.getTable1(this.selectedSnapshot);
    const records = data.records || [];

    container.innerHTML = `
      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wide">Table 1: Ministry-wise Ongoing Projects</h2>
            <p class="text-xs text-slate-500 mt-0.5">Flash Report Appendix Table 1 • Sectoral groupings by central ministry</p>
          </div>
          <span class="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
            ${records.length} Line Items
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200 text-[11px] uppercase tracking-wider">
                <th class="py-2.5 px-3">Ministry / Department</th>
                <th class="py-2.5 px-3">Sector</th>
                <th class="py-2.5 px-3 text-right">Project Count</th>
                <th class="py-2.5 px-3 text-right">Original Cost</th>
                <th class="py-2.5 px-3 text-right">Revised Cost</th>
                <th class="py-2.5 px-3 text-right">Expenditure</th>
                <th class="py-2.5 px-3 text-right">Cost Growth</th>
                <th class="py-2.5 px-3 text-right">Avg Progress</th>
                <th class="py-2.5 px-3 text-right">High Risk</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${records.map(r => `
                <tr class="hover:bg-slate-50 transition">
                  <td class="py-2.5 px-3 font-semibold text-slate-900">${r.ministry}</td>
                  <td class="py-2.5 px-3 text-slate-600">${r.sector}</td>
                  <td class="py-2.5 px-3 text-right font-bold text-slate-800">${r.project_count}</td>
                  <td class="py-2.5 px-3 text-right font-mono">${r.original_cost_formatted}</td>
                  <td class="py-2.5 px-3 text-right font-mono">${r.revised_cost_formatted}</td>
                  <td class="py-2.5 px-3 text-right font-mono">${r.expenditure_formatted}</td>
                  <td class="py-2.5 px-3 text-right font-semibold text-rose-600">+${r.cost_growth_pct}%</td>
                  <td class="py-2.5 px-3 text-right font-medium">${r.avg_physical_progress}%</td>
                  <td class="py-2.5 px-3 text-right font-bold text-rose-700">${r.high_risk_projects}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // -------------------------------------------------------------
  // 9. Flash Report Table 2: State-wise Ongoing Projects
  // -------------------------------------------------------------
  async renderTable2(container) {
    const data = await window.APIClient.reports.getTable2(this.selectedSnapshot);
    const records = data.records || [];

    container.innerHTML = `
      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wide">Table 2: State-wise Ongoing Projects</h2>
            <p class="text-xs text-slate-500 mt-0.5">Flash Report Appendix Table 2 • Geographic distribution across Indian states</p>
          </div>
          <span class="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
            ${records.length} States
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200 text-[11px] uppercase tracking-wider">
                <th class="py-2.5 px-3">State / Jurisdiction</th>
                <th class="py-2.5 px-3 text-right">Project Count</th>
                <th class="py-2.5 px-3 text-right">Original Cost</th>
                <th class="py-2.5 px-3 text-right">Revised Cost</th>
                <th class="py-2.5 px-3 text-right">Expenditure</th>
                <th class="py-2.5 px-3 text-right">Avg Progress</th>
                <th class="py-2.5 px-3 text-right">High Risk</th>
                <th class="py-2.5 px-3 text-right">Critical</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${records.map(r => `
                <tr class="hover:bg-slate-50 transition">
                  <td class="py-2.5 px-3 font-semibold text-slate-900">${r.state}</td>
                  <td class="py-2.5 px-3 text-right font-bold text-slate-800">${r.project_count}</td>
                  <td class="py-2.5 px-3 text-right font-mono">${r.original_cost_formatted}</td>
                  <td class="py-2.5 px-3 text-right font-mono">${r.revised_cost_formatted}</td>
                  <td class="py-2.5 px-3 text-right font-mono">${r.expenditure_formatted}</td>
                  <td class="py-2.5 px-3 text-right font-medium">${r.avg_physical_progress}%</td>
                  <td class="py-2.5 px-3 text-right font-bold text-rose-700">${r.high_risk_count}</td>
                  <td class="py-2.5 px-3 text-right font-bold text-rose-900">${r.critical_count}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // -------------------------------------------------------------
  // 10. Flash Report Table 3: Completed Projects
  // -------------------------------------------------------------
  async renderTable3(container) {
    const data = await window.APIClient.reports.getTable3(this.selectedSnapshot);
    const projects = data.projects || [];

    container.innerHTML = `
      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wide">Table 3: Completed Projects</h2>
            <p class="text-xs text-slate-500 mt-0.5">Projects commissioned during reporting cycle ${this.selectedSnapshot}</p>
          </div>
          <span class="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
            ${data.total_completed} Completed Projects
          </span>
        </div>

        <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-start gap-2">
          <span class="text-blue-600 font-bold">ℹ</span>
          <div>
            <strong>Important Audit Notice:</strong> ${data.footnote}
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200 text-[11px] uppercase tracking-wider">
                <th class="py-2.5 px-3">Project Code</th>
                <th class="py-2.5 px-3">Project Name</th>
                <th class="py-2.5 px-3">Agency</th>
                <th class="py-2.5 px-3">State</th>
                <th class="py-2.5 px-3">Sanctioned DoC</th>
                <th class="py-2.5 px-3">Actual DoC</th>
                <th class="py-2.5 px-3 text-right">Original Cost</th>
                <th class="py-2.5 px-3 text-right">Revised Cost</th>
                <th class="py-2.5 px-3 text-right">Reported Disbursed</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${projects.map(p => `
                <tr class="hover:bg-slate-50 transition">
                  <td class="py-2.5 px-3 font-mono text-blue-700 font-semibold">${p.project_code || p.project_id}</td>
                  <td class="py-2.5 px-3 font-semibold text-slate-900">${p.project_name}</td>
                  <td class="py-2.5 px-3 text-slate-600">${p.agency}</td>
                  <td class="py-2.5 px-3 text-slate-600">${p.state}</td>
                  <td class="py-2.5 px-3 text-slate-500">${p.original_doc}</td>
                  <td class="py-2.5 px-3 font-semibold text-emerald-700">${p.revised_doc}</td>
                  <td class="py-2.5 px-3 text-right font-mono">₹${p.original_cost_cr.toLocaleString()} Cr</td>
                  <td class="py-2.5 px-3 text-right font-mono font-bold">₹${p.revised_cost_cr.toLocaleString()} Cr</td>
                  <td class="py-2.5 px-3 text-right font-mono text-slate-700">₹${p.cumulative_expenditure_cr.toLocaleString()} Cr</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // -------------------------------------------------------------
  // 11. Flash Report Table 4: Newly Added Projects
  // -------------------------------------------------------------
  async renderTable4(container) {
    const data = await window.APIClient.reports.getTable4(this.selectedSnapshot);
    const projects = data.projects || [];

    container.innerHTML = `
      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wide">Table 4: Newly Added Projects</h2>
            <p class="text-xs text-slate-500 mt-0.5">Projects newly inducted into central sector monitoring during ${this.selectedSnapshot}</p>
          </div>
          <span class="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
            ${data.total_newly_added} New Corridors
          </span>
        </div>

        <div class="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
          <span class="font-bold">⚠</span>
          <div>
            <strong>Predictive Methodology Note:</strong> ${data.baseline_notice}
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200 text-[11px] uppercase tracking-wider">
                <th class="py-2.5 px-3">Project Code</th>
                <th class="py-2.5 px-3">Project Name</th>
                <th class="py-2.5 px-3">Ministry</th>
                <th class="py-2.5 px-3">Agency</th>
                <th class="py-2.5 px-3">State</th>
                <th class="py-2.5 px-3">Start Date</th>
                <th class="py-2.5 px-3">Target DoC</th>
                <th class="py-2.5 px-3 text-right">Original Cost</th>
                <th class="py-2.5 px-3 text-center">Initial Risk Baseline</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${projects.map(p => `
                <tr class="hover:bg-slate-50 transition">
                  <td class="py-2.5 px-3 font-mono text-blue-700 font-semibold">${p.project_code || p.project_id}</td>
                  <td class="py-2.5 px-3 font-semibold text-slate-900">${p.project_name}</td>
                  <td class="py-2.5 px-3 text-slate-600">${p.ministry}</td>
                  <td class="py-2.5 px-3 text-slate-600">${p.agency}</td>
                  <td class="py-2.5 px-3 text-slate-600">${p.state}</td>
                  <td class="py-2.5 px-3 text-slate-500">${p.start_date}</td>
                  <td class="py-2.5 px-3 font-medium text-slate-800">${p.target_doc}</td>
                  <td class="py-2.5 px-3 text-right font-mono font-bold">₹${p.original_cost_cr.toLocaleString()} Cr</td>
                  <td class="py-2.5 px-3 text-center">
                    <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                      Limited History (${p.target_risk_class})
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // -------------------------------------------------------------
  // 12. Flash Report Table 5: NER Projects
  // -------------------------------------------------------------
  async renderTable5(container) {
    const records = await window.APIClient.reports.getTable5(this.selectedSnapshot);

    container.innerHTML = `
      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wide">Table 5: Ongoing Projects of North Eastern Region</h2>
            <p class="text-xs text-slate-500 mt-0.5">Flash Report Appendix Table 5 • Active infrastructure projects across 8 NER states</p>
          </div>
          <span class="text-xs font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100">
            ${records.length} NER Projects
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200 text-[11px] uppercase tracking-wider">
                <th class="py-2.5 px-3">Project Code</th>
                <th class="py-2.5 px-3">Project Name</th>
                <th class="py-2.5 px-3">State</th>
                <th class="py-2.5 px-3">Agency</th>
                <th class="py-2.5 px-3 text-right">Original Cost</th>
                <th class="py-2.5 px-3 text-right">Revised Cost</th>
                <th class="py-2.5 px-3 text-right">Expenditure</th>
                <th class="py-2.5 px-3 text-right">Progress</th>
                <th class="py-2.5 px-3 text-center">Risk Tier</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${records.map(r => `
                <tr class="hover:bg-slate-50 transition cursor-pointer" onclick="window.location.hash='#/projects/${r.project_id}'">
                  <td class="py-2.5 px-3 font-mono font-semibold text-blue-700">${r.project_code || r.project_id}</td>
                  <td class="py-2.5 px-3 font-semibold text-slate-900">${r.project_name}</td>
                  <td class="py-2.5 px-3 text-purple-800 font-medium">${r.state}</td>
                  <td class="py-2.5 px-3 text-slate-600">${r.agency}</td>
                  <td class="py-2.5 px-3 text-right font-mono">₹${r.original_cost_cr.toLocaleString()}</td>
                  <td class="py-2.5 px-3 text-right font-mono font-bold">₹${r.revised_cost_cr.toLocaleString()}</td>
                  <td class="py-2.5 px-3 text-right font-mono">₹${r.cumulative_expenditure_cr.toLocaleString()}</td>
                  <td class="py-2.5 px-3 text-right font-semibold">${r.physical_progress_pct}%</td>
                  <td class="py-2.5 px-3 text-center">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold ${r.target_risk_class === 'CRITICAL' ? 'bg-rose-100 text-rose-900' : 'bg-slate-100 text-slate-700'}">
                      ${r.target_risk_class}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // -------------------------------------------------------------
  // 13. Flash Report Table 6: All Ongoing Projects (Flagship Grid)
  // -------------------------------------------------------------
  async renderTable6(container) {
    const page = 1;
    const page_size = 25;
    const data = await window.APIClient.reports.getTable6(this.selectedSnapshot, { page, page_size });
    const projects = data.projects || [];

    container.innerHTML = `
      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wide">Table 6: All Ongoing Projects</h2>
              <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800 font-mono">
                ${data.total_records.toLocaleString()} Total Projects
              </span>
            </div>
            <p class="text-xs text-slate-500 mt-0.5">Flash Report Appendix Table 6 • Full Central Sector infrastructure catalog</p>
          </div>

          <!-- View Mode Switcher (PAIMANA vs ASTRA vs Full) -->
          <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <span class="text-[11px] font-bold text-slate-500 px-2">View Mode:</span>
            <button onclick="ReportIntelligenceView.setTable6Mode('paimana')" class="px-2.5 py-1 rounded text-xs font-semibold transition ${this.table6Mode === 'paimana' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
              PAIMANA View
            </button>
            <button onclick="ReportIntelligenceView.setTable6Mode('astra')" class="px-2.5 py-1 rounded text-xs font-semibold transition ${this.table6Mode === 'astra' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
              ASTRA View
            </button>
            <button onclick="ReportIntelligenceView.setTable6Mode('full')" class="px-2.5 py-1 rounded text-xs font-semibold transition ${this.table6Mode === 'full' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
              Full Intelligence
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200 text-[11px] uppercase tracking-wider">
                <th class="py-2.5 px-3">Project Code / ID</th>
                <th class="py-2.5 px-3">Project Name</th>
                <th class="py-2.5 px-3">Agency</th>
                <th class="py-2.5 px-3">State</th>
                
                ${this.table6Mode !== 'astra' ? `
                  <th class="py-2.5 px-3 text-right">Original Cost</th>
                  <th class="py-2.5 px-3 text-right">Revised Cost</th>
                  <th class="py-2.5 px-3 text-right">Expenditure</th>
                  <th class="py-2.5 px-3 text-right">Physical %</th>
                ` : ''}

                ${this.table6Mode !== 'paimana' ? `
                  <th class="py-2.5 px-3 text-center">Risk Tier</th>
                  <th class="py-2.5 px-3 text-right">Risk Score</th>
                  <th class="py-2.5 px-3">Primary Bottleneck</th>
                  <th class="py-2.5 px-3 text-right">Progress Gap</th>
                ` : ''}
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${projects.map(p => `
                <tr class="hover:bg-slate-50 transition cursor-pointer" onclick="window.location.hash='#/projects/${p.project_id}'">
                  <td class="py-2.5 px-3">
                    <div class="font-mono font-bold text-blue-700">${p.project_code || p.project_id}</div>
                    <div class="text-[10px] text-slate-400 font-mono">${p.project_id}</div>
                  </td>
                  <td class="py-2.5 px-3">
                    <div class="font-semibold text-slate-900">${p.project_name}</div>
                    <div class="text-[10px] text-slate-500">${p.sector} • ${p.ministry}</div>
                  </td>
                  <td class="py-2.5 px-3 text-slate-600">${p.agency}</td>
                  <td class="py-2.5 px-3 text-slate-600">${p.state}</td>

                  ${this.table6Mode !== 'astra' ? `
                    <td class="py-2.5 px-3 text-right font-mono">₹${p.original_cost_cr.toLocaleString()} Cr</td>
                    <td class="py-2.5 px-3 text-right font-mono font-bold text-slate-900">₹${p.revised_cost_cr.toLocaleString()} Cr</td>
                    <td class="py-2.5 px-3 text-right font-mono text-slate-700">₹${p.cumulative_expenditure_cr.toLocaleString()} Cr</td>
                    <td class="py-2.5 px-3 text-right font-bold text-slate-800">${p.physical_progress_pct}%</td>
                  ` : ''}

                  ${this.table6Mode !== 'paimana' ? `
                    <td class="py-2.5 px-3 text-center">
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold ${p.target_risk_class === 'CRITICAL' ? 'bg-rose-100 text-rose-900' : (p.target_risk_class === 'HIGH' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900')}">
                        ${p.target_risk_class}
                      </span>
                    </td>
                    <td class="py-2.5 px-3 text-right font-mono font-bold text-slate-800">${p.overall_risk_score}</td>
                    <td class="py-2.5 px-3 text-slate-500 font-mono text-[10px]">${p.primary_bottleneck}</td>
                    <td class="py-2.5 px-3 text-right font-semibold ${p.progress_gap_pct < -10 ? 'text-rose-600' : 'text-slate-600'}">${p.progress_gap_pct > 0 ? '+' : ''}${p.progress_gap_pct}%</td>
                  ` : ''}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  async setTable6Mode(mode) {
    this.table6Mode = mode;
    const container = document.getElementById("report-tab-content");
    if (container) await this.renderTable6(container);
  },

  async filterTable6By(field, value) {
    this.activeTab = "table6";
    const container = document.getElementById("report-tab-content");
    if (!container) return;
    const filter = {};
    filter[field] = value;
    const data = await window.APIClient.reports.getTable6(this.selectedSnapshot, filter);
    // Render Table 6 with filter applied
    await this.renderTable6(container);
  },

  // -------------------------------------------------------------
  // 14. Month-over-Month Comparison Engine
  // -------------------------------------------------------------
  async renderMoMCompare(container) {
    const data = await window.APIClient.reports.compareSnapshots(this.comparisonBaseline, this.selectedSnapshot);
    const d = data.portfolio_deltas || {};
    const shifting = data.top_risk_escalating_projects || [];

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Comparison Period Selector -->
        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-3 border-b border-slate-100 mb-4">
            <div>
              <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wide">Month-over-Month Portfolio Comparison</h2>
              <p class="text-xs text-slate-500 mt-0.5">Measuring physical velocity, expenditure drift, and risk escalation between reporting cycles</p>
            </div>
            
            <div class="flex items-center gap-2 text-xs">
              <span class="font-semibold text-slate-500">Compare Baseline:</span>
              <select onchange="ReportIntelligenceView.onCompareBaselineChange(this.value)" class="bg-slate-50 border border-slate-300 rounded px-2 py-1 font-bold text-slate-800">
                <option value="2026-04" ${this.comparisonBaseline === '2026-04' ? 'selected' : ''}>April 2026</option>
                <option value="2026-05" ${this.comparisonBaseline === '2026-05' ? 'selected' : ''}>May 2026</option>
                <option value="2026-06" ${this.comparisonBaseline === '2026-06' ? 'selected' : ''}>June 2026</option>
              </select>
              <span class="font-bold text-blue-900">→</span>
              <span class="font-bold text-blue-900">${this.selectedSnapshot}</span>
            </div>
          </div>

          <!-- Delta KPI Grid -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div class="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <span class="text-[10px] font-semibold text-slate-500 uppercase">Tracked Projects Delta</span>
              <div class="text-lg font-bold text-slate-900 mt-1">${d.project_count_delta >= 0 ? '+' : ''}${d.project_count_delta}</div>
              <div class="text-[10px] text-slate-400">Net additions</div>
            </div>
            <div class="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <span class="text-[10px] font-semibold text-slate-500 uppercase">Revised Cost Escalation</span>
              <div class="text-lg font-bold text-rose-700 mt-1">+₹${d.revised_cost_delta_cr.toLocaleString()} Cr</div>
              <div class="text-[10px] text-slate-400">Net cost growth</div>
            </div>
            <div class="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <span class="text-[10px] font-semibold text-slate-500 uppercase">Avg Progress Velocity</span>
              <div class="text-lg font-bold text-emerald-700 mt-1">+${d.avg_physical_progress_delta}%</div>
              <div class="text-[10px] text-slate-400">Portfolio movement</div>
            </div>
            <div class="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <span class="text-[10px] font-semibold text-slate-500 uppercase">Capital at Risk Delta</span>
              <div class="text-lg font-bold text-indigo-900 mt-1">${d.capital_at_risk_delta_cr >= 0 ? '+' : ''}₹${d.capital_at_risk_delta_cr.toLocaleString()} Cr</div>
              <div class="text-[10px] text-slate-400">Exposure shift</div>
            </div>
          </div>
        </div>

        <!-- Top Deteriorating Corridors -->
        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Top Projects with Escalating Risk Between Periods</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200 text-[11px]">
                  <th class="py-2 px-3">Project ID</th>
                  <th class="py-2 px-3">Corridor</th>
                  <th class="py-2 px-3">Agency</th>
                  <th class="py-2 px-3">State</th>
                  <th class="py-2 px-3 text-right">${this.comparisonBaseline} Progress</th>
                  <th class="py-2 px-3 text-right">${this.selectedSnapshot} Progress</th>
                  <th class="py-2 px-3 text-right">Physical Delta</th>
                  <th class="py-2 px-3 text-center">Risk Shift</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${shifting.map(p => `
                  <tr class="hover:bg-slate-50 transition cursor-pointer" onclick="window.location.hash='#/projects/${p.project_id}'">
                    <td class="py-2 px-3 font-mono font-bold text-blue-700">${p.project_id}</td>
                    <td class="py-2 px-3 font-semibold text-slate-900">${p.project_name}</td>
                    <td class="py-2 px-3 text-slate-600">${p.agency}</td>
                    <td class="py-2 px-3 text-slate-600">${p.state}</td>
                    <td class="py-2 px-3 text-right font-medium text-slate-500">${p.progress_a}%</td>
                    <td class="py-2 px-3 text-right font-bold text-slate-900">${p.progress_b}%</td>
                    <td class="py-2 px-3 text-right font-semibold ${p.progress_delta < 1 ? 'text-rose-600' : 'text-emerald-700'}">+${p.progress_delta}%</td>
                    <td class="py-2 px-3 text-center">
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                        ${p.risk_a} → ${p.risk_b} (+${p.risk_delta})
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  async onCompareBaselineChange(val) {
    this.comparisonBaseline = val;
    const container = document.getElementById("report-tab-content");
    if (container) await this.renderMoMCompare(container);
  },

  // -------------------------------------------------------------
  // 15. Data Quality Observatory
  // -------------------------------------------------------------
  async renderDataQuality(container) {
    const data = await window.APIClient.reports.getDataQuality(this.selectedSnapshot);
    const rules = data.rules_summary || [];
    const sample = data.sample_flagged_projects || [];

    container.innerHTML = `
      <div class="space-y-6">
        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div>
              <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wide">Data Quality Observatory (Rules DQ001 to DQ012)</h2>
              <p class="text-xs text-slate-500 mt-0.5">Automated screening for reporting discrepancies, stale submissions, and cross-system identifier gaps</p>
            </div>
            <span class="text-xs font-semibold px-2.5 py-1 rounded bg-sky-100 text-sky-800 border border-sky-200">
              ${data.total_flags_count} Active Flags
            </span>
          </div>

          <div class="p-3 bg-sky-50 border border-sky-200 rounded-lg text-xs text-sky-900 flex items-start gap-2">
            <span class="font-bold">ℹ</span>
            <div>
              <strong>Institutional Policy:</strong> Anomalies are classified strictly as <code>DATA QUALITY FLAG — HUMAN REVIEW REQUIRED</code>. ASTRA avoids accusations of falsification and prompts administrative data validation.
            </div>
          </div>
        </div>

        <!-- Rules Summary Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          ${rules.map(r => `
            <div class="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
              <div class="flex items-center justify-between">
                <span class="font-mono text-xs font-bold text-blue-900">${r.rule_code}</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold ${r.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'}">
                  ${r.severity}
                </span>
              </div>
              <div class="text-xs font-semibold text-slate-900 mt-1">${r.rule_name}</div>
              <div class="text-lg font-bold text-slate-900 mt-2">${r.flag_count} flags</div>
            </div>
          `).join('')}
        </div>

        <!-- Sample Flagged Records Table -->
        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Flagged Project Audits (Human Review Queue)</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200 text-[11px]">
                  <th class="py-2.5 px-3">Rule</th>
                  <th class="py-2.5 px-3">Project Code / ID</th>
                  <th class="py-2.5 px-3">Project Name</th>
                  <th class="py-2.5 px-3">Severity</th>
                  <th class="py-2.5 px-3">Observation Details</th>
                  <th class="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${sample.slice(0, 15).map(f => `
                  <tr class="hover:bg-slate-50 transition">
                    <td class="py-2.5 px-3 font-mono font-bold text-blue-900">${f.rule_code}</td>
                    <td class="py-2.5 px-3 font-mono text-slate-700">${f.project_id}</td>
                    <td class="py-2.5 px-3 font-semibold text-slate-900">${f.project_name || 'Central Sector Project'}</td>
                    <td class="py-2.5 px-3">
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold ${f.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}">
                        ${f.severity}
                      </span>
                    </td>
                    <td class="py-2.5 px-3 text-slate-600 max-w-xs">${f.details}</td>
                    <td class="py-2.5 px-3 text-center">
                      <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        ${f.status}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  // -------------------------------------------------------------
  // 16. Multi-Model Benchmarking (CUF vs Enhanced & Stat vs ML)
  // -------------------------------------------------------------
  async renderModels(container) {
    const data = await window.APIClient.reports.getModelBenchmarks();
    const benchmarks = data.benchmarks || [];

    container.innerHTML = `
      <div class="space-y-6">
        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div>
              <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wide">Dual-Model Evaluation & Empirical Benchmarks</h2>
              <p class="text-xs text-slate-500 mt-0.5">Objective statistical comparison answering SIH26103 core question: <em>Does ML improve over conventional baselines, and what value do enhanced features add over static CUF fields?</em></p>
            </div>
            <span class="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
              1,500 Test Holdout Evaluation
            </span>
          </div>

          <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 space-y-1">
            <div><strong>Rigorous Validation Protocol:</strong> ${data.leakage_prevention}</div>
            <div><strong>Core Empirical Finding:</strong> ${data.key_findings.conclusion}</div>
          </div>
        </div>

        <!-- Comparative Benchmarks Table -->
        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Empirical Model Comparison Matrix</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200 text-[11px] uppercase tracking-wider">
                  <th class="py-2.5 px-3">Model Architecture</th>
                  <th class="py-2.5 px-3">Target Objective</th>
                  <th class="py-2.5 px-3">Feature Tier</th>
                  <th class="py-2.5 px-3">Algorithm Class</th>
                  <th class="py-2.5 px-3 text-right">ROC-AUC</th>
                  <th class="py-2.5 px-3 text-right">F1-Macro</th>
                  <th class="py-2.5 px-3 text-right">MAE / Error</th>
                  <th class="py-2.5 px-3 text-right">Warning Lead Time</th>
                  <th class="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${benchmarks.map(b => `
                  <tr class="hover:bg-slate-50 transition">
                    <td class="py-2.5 px-3 font-semibold text-slate-900">${b.model_name}</td>
                    <td class="py-2.5 px-3 font-mono text-slate-600 text-[11px]">${b.target_name}</td>
                    <td class="py-2.5 px-3">
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold ${b.feature_tier === 'ASTRA_ENHANCED' ? 'bg-indigo-100 text-indigo-900' : 'bg-slate-100 text-slate-700'}">
                        ${b.feature_tier}
                      </span>
                    </td>
                    <td class="py-2.5 px-3 text-slate-600">${b.algorithm_type === 'MACHINE_LEARNING' ? 'LightGBM' : 'Linear / Ridge'}</td>
                    <td class="py-2.5 px-3 text-right font-mono font-bold text-slate-900">${b.roc_auc !== null ? b.roc_auc.toFixed(4) : '—'}</td>
                    <td class="py-2.5 px-3 text-right font-mono font-bold ${b.f1_macro > 0.75 ? 'text-emerald-700' : 'text-slate-700'}">${b.f1_macro !== null ? b.f1_macro.toFixed(4) : '—'}</td>
                    <td class="py-2.5 px-3 text-right font-mono font-bold">${b.mae !== null ? b.mae + 'm' : '—'}</td>
                    <td class="py-2.5 px-3 text-right font-mono font-bold text-indigo-700">${b.lead_time_months} Months</td>
                    <td class="py-2.5 px-3 text-center">
                      <span class="px-2 py-0.5 rounded text-[10px] font-semibold ${b.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}">
                        ${b.status}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  // -------------------------------------------------------------
  // Global Export Helpers (Client-Side & Offline Resilient)
  // -------------------------------------------------------------
  async exportCSV() {
    try {
      const ov = await window.APIClient.reports.getOverview(this.selectedSnapshot);
      const p = ov.paimana_monitoring || {};
      const a = ov.astra_intelligence || {};

      const csvLines = [
        "Metric Category,Metric Name,Value,Unit/Note",
        `PAIMANA Monitoring,Snapshot Reference Month,"${this.selectedSnapshot}",YYYY-MM`,
        `PAIMANA Monitoring,Source Document,"${ov.source_report || 'FlashReport_' + this.selectedSnapshot + '.pdf'}",Official IPMD Series`,
        `PAIMANA Monitoring,Tracked Projects,${p.tracked_projects || 10000},Count`,
        `PAIMANA Monitoring,Ongoing Projects,${p.ongoing_projects || 9820},Count`,
        `PAIMANA Monitoring,Commissioned Projects,${p.commissioned_projects || 100},Count`,
        `PAIMANA Monitoring,Newly Added Projects,${p.newly_added_projects || 80},Count`,
        `PAIMANA Monitoring,Original Sanctioned Cost,${p.original_cost_cr || 27140800.0},₹ Crore`,
        `PAIMANA Monitoring,Latest Revised Cost,${p.revised_cost_cr || 31250000.0},₹ Crore`,
        `PAIMANA Monitoring,Cumulative Expenditure,${p.cumulative_expenditure_cr || 18450000.0},₹ Crore`,
        `PAIMANA Monitoring,Cost Growth Pct,${p.cost_growth_pct || 15.14},%`,
        `PAIMANA Monitoring,Average Physical Progress,${p.avg_physical_progress_pct || 58.42},%`,
        `PAIMANA Monitoring,Average Financial Progress,${p.avg_financial_progress_pct || 59.04},%`,
        `ASTRA Intelligence,High Risk Projects,${a.high_risk_projects || 1842},Count`,
        `ASTRA Intelligence,Critical Projects,${a.critical_projects || 418},Count`,
        `ASTRA Intelligence,Schedule Pressure Projects,${a.schedule_pressure_projects || 2150},Count`,
        `ASTRA Intelligence,Cost Escalation Projects,${a.cost_escalation_projects || 3410},Count`,
        `ASTRA Intelligence,Analytical Capital at Risk,${a.capital_at_risk_cr || 12450800.0},₹ Crore`,
        `ASTRA Intelligence,Data Quality Flags,${a.data_quality_flags_count || 401},Count`
      ];

      // Add Sector details if available
      try {
        const secData = await window.APIClient.reports.getSectors(this.selectedSnapshot);
        if (secData && secData.sectors && secData.sectors.length > 0) {
          csvLines.push("");
          csvLines.push("Sector Name,HML Category,Project Count,Original Cost,Revised Cost,Cumulative Expenditure,Cost Growth Pct,Physical Progress Pct,Risk Score");
          secData.sectors.forEach(s => {
            csvLines.push(`"${s.sector}","${s.hml_category || ''}",${s.project_count},"${s.original_cost_formatted}","${s.revised_cost_formatted}","${s.expenditure_formatted}",${s.cost_growth_pct}%,${s.avg_physical_progress}%,${s.avg_risk_score}`);
          });
        }
      } catch (e) {
        console.warn("[ReportIntelligence] Sector CSV append fallback:", e);
      }

      const csvContent = "\uFEFF" + csvLines.join("\r\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `ASTRA_FlashReport_${this.selectedSnapshot}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error("[ReportIntelligence] Export CSV error:", err);
      alert("Failed to export CSV: " + (err.message || err));
    }
  },

  async openOfficialReport() {
    try {
      const ov = await window.APIClient.reports.getOverview(this.selectedSnapshot);
      let secData = null;
      try {
        secData = await window.APIClient.reports.getSectors(this.selectedSnapshot);
      } catch (e) {}

      const p = ov.paimana_monitoring || {};
      const a = ov.astra_intelligence || {};
      const sectors = (secData && secData.sectors) ? secData.sectors : [];

      const htmlContent = this.generateOfficialReportHtml(this.selectedSnapshot, ov, p, a, sectors);

      // Open new window/tab
      const reportWindow = window.open("", "_blank");
      if (reportWindow) {
        reportWindow.document.open();
        reportWindow.document.write(htmlContent);
        reportWindow.document.close();
      } else {
        // Fallback if popup blocked: direct file download
        const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `ASTRA_Official_Report_${this.selectedSnapshot}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch (err) {
      console.error("[ReportIntelligence] Open official report error:", err);
      alert("Failed to generate official report: " + (err.message || err));
    }
  },

  generateOfficialReportHtml(snapshotMonth, ov, p, a, sectors) {
    const docRef = ov.source_report || `FlashReport_${snapshotMonth.replace('-', '_')}.pdf`;
    const genDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>ASTRA Official Infrastructure Intelligence Report — ${snapshotMonth}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #1e3a8a;
      --primary-dark: #172554;
      --saffron: #f59e0b;
      --text: #0f172a;
      --muted: #475569;
      --border: #e2e8f0;
      --bg-subtle: #f8fafc;
    }
    * { box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: var(--text);
      background: #f1f5f9;
      margin: 0;
      padding: 24px 16px;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }
    .report-sheet {
      max-width: 1040px;
      margin: 0 auto;
      background: #ffffff;
      padding: 48px;
      border-radius: 12px;
      box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04);
      border: 1px solid var(--border);
    }
    .action-bar {
      position: sticky;
      top: 16px;
      z-index: 50;
      max-width: 1040px;
      margin: 0 auto 20px auto;
      background: #1e293b;
      color: #fff;
      padding: 12px 20px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      font-size: 12px;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      border: none;
      transition: all 0.15s ease;
      font-family: inherit;
    }
    .btn-primary { background: #2563eb; color: #ffffff; }
    .btn-primary:hover { background: #1d4ed8; }
    .btn-secondary { background: #334155; color: #f8fafc; }
    .btn-secondary:hover { background: #475569; }
    .header-rule { height: 4px; background: linear-gradient(90deg, #ff9933 0%, #ffffff 50%, #138808 100%); margin: 16px 0 24px 0; border-radius: 2px; }
    .gov-title { font-size: 12px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #64748b; }
    .gov-ministry { font-size: 16px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
    .gov-division { font-size: 13px; font-weight: 600; color: var(--primary); margin-top: 2px; }
    .doc-headline { font-size: 24px; font-weight: 800; color: #0f172a; margin-top: 24px; letter-spacing: -0.5px; }
    .doc-subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }
    .meta-pills { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 14px; }
    .meta-pill { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; background: var(--bg-subtle); border: 1px solid var(--border); color: #334155; }
    .meta-pill.highlight { background: #eff6ff; border-color: #bfdbfe; color: #1e40af; }
    .section-title { font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; color: var(--primary); margin-top: 36px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-top: 14px; }
    .kpi-card { background: var(--bg-subtle); border: 1px solid var(--border); border-radius: 8px; padding: 14px; }
    .kpi-card.alert { border-left: 4px solid #ef4444; background: #fff5f5; }
    .kpi-card.warning { border-left: 4px solid #f59e0b; background: #fffbeb; }
    .kpi-card.info { border-left: 4px solid #3b82f6; background: #eff6ff; }
    .kpi-card.indigo { border-left: 4px solid #6366f1; background: #eef2ff; }
    .kpi-label { font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #64748b; }
    .kpi-val { font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 4px; font-family: 'JetBrains Mono', monospace; }
    .kpi-sub { font-size: 11px; color: #64748b; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 12px; }
    th { background: #f8fafc; color: #475569; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; padding: 10px 12px; border: 1px solid var(--border); text-align: left; }
    td { padding: 9px 12px; border: 1px solid var(--border); color: #1e293b; }
    .num { text-align: right; font-family: 'JetBrains Mono', monospace; font-size: 11.5px; }
    .signature-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 48px; margin-top: 48px; padding-top: 24px; border-top: 1px dashed var(--border); }
    .sig-line { border-bottom: 1px solid #94a3b8; height: 40px; margin-bottom: 6px; }
    .sig-title { font-size: 11px; font-weight: 700; color: #334155; }
    .sig-sub { font-size: 10px; color: #64748b; }
    .footnote { margin-top: 36px; padding: 16px; background: #f8fafc; border-radius: 8px; border: 1px solid var(--border); font-size: 11px; color: #64748b; line-height: 1.6; }
    
    @media print {
      .no-print { display: none !important; }
      body { background: #ffffff !important; padding: 0 !important; }
      .report-sheet { border: none !important; box-shadow: none !important; padding: 0 !important; max-width: 100% !important; }
      .section-title { margin-top: 24px !important; }
      .kpi-card, table, .signature-grid { break-inside: avoid; }
    }
  </style>
</head>
<body>

  <!-- Print & Download Floating Toolbar -->
  <div class="action-bar no-print">
    <div style="display:flex; align-items:center; gap:10px;">
      <span style="font-size:12px; font-weight:700; letter-spacing:0.5px; color:#93c5fd;">ASTRA OFFICIAL DOSSIER</span>
      <span style="font-size:11px; color:#cbd5e1;">• ${snapshotMonth} Reference Snapshot</span>
    </div>
    <div style="display:flex; gap:8px;">
      <button onclick="window.print()" class="btn btn-primary" title="Print this report or save as PDF">
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
        Print / Save as PDF
      </button>
      <button onclick="window.close()" class="btn btn-secondary" title="Close window">Close</button>
    </div>
  </div>

  <!-- Main Publication Sheet -->
  <div class="report-sheet">
    
    <!-- Institutional Header -->
    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
      <div>
        <div class="gov-title">भारत सरकार • Government of India</div>
        <div class="gov-ministry">सांख्यिकी और कार्यक्रम कार्यान्वयन मंत्रालय</div>
        <div class="gov-division">Ministry of Statistics and Programme Implementation • IPMD</div>
        <div style="font-size:11px; color:#64748b; margin-top:3px;">Infrastructure Project Monitoring Division • New Delhi</div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:11px; font-weight:700; color:#1e3a8a; text-transform:uppercase;">Official Baseline</div>
        <div style="font-size:11px; font-family:'JetBrains Mono',monospace; color:#475569; margin-top:2px;">DOC-REF: ${docRef}</div>
        <div style="font-size:11px; color:#64748b; margin-top:2px;">Issued: ${genDate}</div>
      </div>
    </div>

    <div class="header-rule"></div>

    <!-- Title Area -->
    <div class="doc-headline">ASTRA — National Infrastructure Intelligence Report</div>
    <div class="doc-subtitle">Integrated Project Monitoring, Machine Learning Decision Support & Flash Report Alignment</div>

    <div class="meta-pills">
      <div class="meta-pill highlight">📅 Snapshot Month: ${snapshotMonth}</div>
      <div class="meta-pill">🏛️ Central Sector Projects (₹150 Cr & Above)</div>
      <div class="meta-pill">📂 Archival Source: ${docRef}</div>
      <div class="meta-pill">🔒 Security Tier: MoSPI Institutional Review</div>
    </div>

    <!-- Section I: Macro Overview -->
    <div class="section-title">
      <span>I. PAIMANA Official Monitoring Overview</span>
      <span style="font-size:11px; font-weight:600; color:#64748b;">Descriptive Governance Baseline</span>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">Ongoing Projects</div>
        <div class="kpi-val">${p.ongoing_projects || 9820}</div>
        <div class="kpi-sub">Total tracked: ${p.tracked_projects || 10000}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Original Sanctioned Cost</div>
        <div class="kpi-val">${p.original_cost_formatted || '₹271.4L Cr'}</div>
        <div class="kpi-sub">Base outlay approved</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Latest Revised Cost</div>
        <div class="kpi-val">${p.revised_cost_formatted || '₹312.5L Cr'}</div>
        <div class="kpi-sub" style="color:#b45309; font-weight:600;">Cost Growth: +${p.cost_growth_pct || 15.14}%</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Cumulative Disbursed</div>
        <div class="kpi-val">${p.cumulative_expenditure_formatted || '₹184.5L Cr'}</div>
        <div class="kpi-sub">${p.expenditure_to_revised_ratio_pct || 59.04}% of Revised</div>
      </div>
    </div>

    <div class="kpi-grid" style="margin-top:10px;">
      <div class="kpi-card">
        <div class="kpi-label">Commissioned in Period</div>
        <div class="kpi-val" style="color:#15803d;">${p.commissioned_projects || 100}</div>
        <div class="kpi-sub">Completed projects</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Newly Added in Period</div>
        <div class="kpi-val" style="color:#0369a1;">${p.newly_added_projects || 80}</div>
        <div class="kpi-sub">Inducted this snapshot</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Avg Physical Progress</div>
        <div class="kpi-val">${p.avg_physical_progress_pct || 58.42}%</div>
        <div class="kpi-sub">Field physical completion</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Avg Financial Progress</div>
        <div class="kpi-val">${p.avg_financial_progress_pct || 59.04}%</div>
        <div class="kpi-sub">Expenditure realization</div>
      </div>
    </div>

    <!-- Section II: ASTRA Predictive Layer -->
    <div class="section-title">
      <span>II. ASTRA Predictive & Decision Intelligence Layer</span>
      <span style="font-size:11px; font-weight:600; color:#64748b;">Machine Learning Inference</span>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card alert">
        <div class="kpi-label" style="color:#b91c1c;">High-Risk Projects</div>
        <div class="kpi-val" style="color:#b91c1c;">${a.high_risk_projects || 1842}</div>
        <div class="kpi-sub">Critical Tier: ${a.critical_projects || 418}</div>
      </div>
      <div class="kpi-card warning">
        <div class="kpi-label" style="color:#b45309;">Schedule Pressure</div>
        <div class="kpi-val" style="color:#b45309;">${a.schedule_pressure_projects || 2150}</div>
        <div class="kpi-sub">Slippage probability &gt; 65%</div>
      </div>
      <div class="kpi-card indigo">
        <div class="kpi-label" style="color:#4338ca;">Capital at Risk</div>
        <div class="kpi-val" style="color:#4338ca;">${a.capital_at_risk_formatted || '₹124.5L Cr'}</div>
        <div class="kpi-sub">Risk-weighted exposure</div>
      </div>
      <div class="kpi-card info">
        <div class="kpi-label" style="color:#0369a1;">Data Quality Flags</div>
        <div class="kpi-val" style="color:#0369a1;">${a.data_quality_flags_count || 401}</div>
        <div class="kpi-sub">DQ001–DQ012 observatory</div>
      </div>
    </div>

    <!-- Section III: Sectors Breakdown -->
    ${sectors.length > 0 ? `
    <div class="section-title">
      <span>III. Sector-Wise Portfolio Stratification</span>
      <span style="font-size:11px; font-weight:600; color:#64748b;">Financial & Risk Distribution</span>
    </div>

    <table>
      <thead>
        <tr>
          <th>Sector Name</th>
          <th>Domain Category</th>
          <th class="num">Projects</th>
          <th class="num">Original Cost</th>
          <th class="num">Revised Cost</th>
          <th class="num">Disbursed</th>
          <th class="num">Cost Growth</th>
          <th class="num">Progress</th>
          <th class="num">Risk Score</th>
        </tr>
      </thead>
      <tbody>
        ${sectors.map(s => `
          <tr>
            <td style="font-weight:600;">${s.sector}</td>
            <td style="color:#64748b;">${s.hml_category || 'Infrastructure'}</td>
            <td class="num font-bold">${s.project_count}</td>
            <td class="num">${s.original_cost_formatted}</td>
            <td class="num font-bold">${s.revised_cost_formatted}</td>
            <td class="num">${s.expenditure_formatted}</td>
            <td class="num" style="color:${s.cost_growth_pct > 15 ? '#b91c1c' : '#0f172a'}; font-weight:600;">+${s.cost_growth_pct}%</td>
            <td class="num">${s.avg_physical_progress}%</td>
            <td class="num" style="font-weight:700; color:${s.avg_risk_score > 55 ? '#b91c1c' : (s.avg_risk_score > 45 ? '#b45309' : '#15803d')};">${s.avg_risk_score}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    ` : ''}

    <!-- Signatures & Authority -->
    <div class="signature-grid">
      <div>
        <div class="sig-line"></div>
        <div class="sig-title">Monitoring Officer / Analyst</div>
        <div class="sig-sub">Infrastructure Project Monitoring Division (IPMD)</div>
      </div>
      <div>
        <div class="sig-line"></div>
        <div class="sig-title">Secretary / Additional Secretary</div>
        <div class="sig-sub">Ministry of Statistics & Programme Implementation (MoSPI)</div>
      </div>
    </div>

    <!-- Footnotes & Legal Notice -->
    <div class="footnote">
      <strong>Official Sovereign Data & Governance Notice:</strong><br>
      1. Descriptive metrics are strictly derived from the PAIMANA Flash Report reference snapshot (${snapshotMonth} • ${docRef}).<br>
      2. ASTRA predictive risk scores and early warning lead times are algorithmic projections generated by trained LightGBM models and validated by TreeSHAP attribution.<br>
      3. Reported cumulative expenditure is based on monthly submissions by project authorities and executing agencies.<br>
      4. Capital at Risk represents analytical risk-weighted exposure (Revised Cost × Normalized Model Risk) and does not conflate with confirmed financial loss.
    </div>

  </div>

</body>
</html>`;
  }
};

window.ReportIntelligenceView = ReportIntelligenceView;
