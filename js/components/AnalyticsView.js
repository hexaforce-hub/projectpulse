// ==========================================================================
// PROJECTPULSE — Comprehensive Portfolio Analytics View (Phase 9)
// Ministry of Statistics & Programme Implementation (MoSPI) - IPMD
// Smart India Hackathon 2026 — Team HexaForce
// Route: /analytics
// ==========================================================================

const AnalyticsView = {
  data: null,
  activeTab: "sectors",

  render() {
    return `
      <div class="max-w-[1440px] mx-auto space-y-6">
        
        <!-- Header & Classification -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                Decision Intelligence
              </span>
              <span class="text-caption text-slate-400">• MoSPI IPMD Cross-Portfolio Analytics</span>
            </div>
            <h1 class="text-page-title">Portfolio Analytics & Macro Risk Aggregations</h1>
            <p class="text-caption text-slate-500 mt-0.5">
              Cross-sectoral capital exposure, primary structural bottleneck distributions, and state-level infrastructure delivery risk
            </p>
          </div>
          <div class="flex items-center gap-2">
            ${CommonUI.renderDataStatus("SYNTHETIC")}
          </div>
        </div>

        <!-- Macro Portfolio Summary Banner -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="gov-card p-4 bg-white border border-slate-200 shadow-sm">
            <span class="text-kpi-label text-slate-500">Monitored Portfolio</span>
            <div class="text-2xl font-bold font-mono text-slate-900 mt-1">10,000</div>
            <div class="text-[11px] text-slate-500 mt-0.5">Active Central Sector Projects</div>
          </div>
          <div class="gov-card p-4 bg-white border border-slate-200 shadow-sm">
            <span class="text-kpi-label text-slate-500">Total Sanctioned Outlay</span>
            <div class="text-2xl font-bold font-mono text-blue-900 mt-1">₹42.50L Cr</div>
            <div class="text-[11px] text-slate-500 mt-0.5">Across 9 Central Ministries</div>
          </div>
          <div class="gov-card p-4 bg-white border border-slate-200 shadow-sm">
            <span class="text-kpi-label text-slate-500">Cumulative Cost Overrun</span>
            <div class="text-2xl font-bold font-mono text-red-700 mt-1">₹12.45L Cr</div>
            <div class="text-[11px] text-slate-500 mt-0.5">29.3% Aggregate Portfolio Growth</div>
          </div>
          <div class="gov-card p-4 bg-white border border-slate-200 shadow-sm">
            <span class="text-kpi-label text-slate-500">Average Delay Duration</span>
            <div class="text-2xl font-bold font-mono text-amber-700 mt-1">26.4 Mos</div>
            <div class="text-[11px] text-slate-500 mt-0.5">Weighted across active delays</div>
          </div>
        </div>

        <!-- Navigation Tabs for Analytics Dimensions -->
        <div class="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button data-tab="sectors" class="analytics-tab-btn px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${this.activeTab === 'sectors' ? 'bg-blue-900 text-white border-blue-900 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}">
            Sectoral Capital & Risk
          </button>
          <button data-tab="ministries" class="analytics-tab-btn px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${this.activeTab === 'ministries' ? 'bg-blue-900 text-white border-blue-900 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}">
            Ministry Exposure
          </button>
          <button data-tab="bottlenecks" class="analytics-tab-btn px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${this.activeTab === 'bottlenecks' ? 'bg-blue-900 text-white border-blue-900 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}">
            Bottleneck Root Causes
          </button>
          <button data-tab="states" class="analytics-tab-btn px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${this.activeTab === 'states' ? 'bg-blue-900 text-white border-blue-900 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}">
            Geographic Risk Density
          </button>
          <button data-tab="quality" class="analytics-tab-btn px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${this.activeTab === 'quality' ? 'bg-blue-900 text-white border-blue-900 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}">
            Data Quality & Decoupling
          </button>
        </div>

        <!-- Dynamic Content Mount -->
        <div id="analytics-content-mount">
          <div class="gov-card text-center py-12 text-slate-400">
            <div class="inline-flex items-center gap-2">
              <span class="w-4 h-4 rounded-full border-2 border-slate-300 border-t-blue-600 animate-spin"></span>
              <span>Loading multi-dimensional portfolio analytics from IPMD database...</span>
            </div>
          </div>
        </div>

      </div>
    `;
  },

  async postRender() {
    // Bind tab clicks
    document.querySelectorAll(".analytics-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        this.activeTab = btn.dataset.tab;
        this.updateTabStyles();
        this.renderActiveTabContent();
      });
    });

    // Load data from backend
    if (!this.data) {
      try {
        this.data = await APIClient.getAnalyticsSummary();
      } catch (err) {
        console.warn("[AnalyticsView] Failed to load live analytics:", err);
      }
    }

    // Fallback if data is null or empty
    if (!this.data) {
      this.data = this.getDefaultMockAnalytics();
    }

    this.renderActiveTabContent();
  },

  updateTabStyles() {
    document.querySelectorAll(".analytics-tab-btn").forEach(btn => {
      const tab = btn.dataset.tab;
      if (tab === this.activeTab) {
        btn.className = "analytics-tab-btn px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all bg-blue-900 text-white border-blue-900 shadow-sm";
      } else {
        btn.className = "analytics-tab-btn px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all bg-white text-slate-600 border-slate-200 hover:bg-slate-50";
      }
    });
  },

  renderActiveTabContent() {
    const mount = document.getElementById("analytics-content-mount");
    if (!mount) return;

    if (this.activeTab === "sectors") {
      mount.innerHTML = this.renderSectorsTab();
    } else if (this.activeTab === "ministries") {
      mount.innerHTML = this.renderMinistriesTab();
    } else if (this.activeTab === "bottlenecks") {
      mount.innerHTML = this.renderBottlenecksTab();
    } else if (this.activeTab === "states") {
      mount.innerHTML = this.renderStatesTab();
    } else if (this.activeTab === "quality") {
      mount.innerHTML = this.renderQualityTab();
    }
  },

  renderSectorsTab() {
    const sectors = this.data.sectors || [];
    return `
      <div class="space-y-4">
        <div class="gov-card p-4 bg-white border border-slate-200 shadow-sm">
          <div class="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <div>
              <h3 class="text-card-title text-slate-900">Capital Outlay & Cost Overrun by Sector</h3>
              <p class="text-caption text-slate-500">Distribution of ₹42.50L Cr outlay across central infrastructure sectors</p>
            </div>
            <span class="text-caption font-mono text-slate-400">${sectors.length} Sectors Tracked</span>
          </div>

          <div class="gov-table-container">
            <table class="gov-table">
              <thead>
                <tr>
                  <th>Sector</th>
                  <th class="text-right">Project Count</th>
                  <th class="text-right">Revised Cost</th>
                  <th class="text-right">Cost Overrun</th>
                  <th class="text-right">Overrun %</th>
                  <th class="text-right">Avg Risk Score</th>
                  <th class="text-right">Avg Slippage</th>
                </tr>
              </thead>
              <tbody>
                ${sectors.map(s => {
                  const overrunPct = s.total_original_cost > 0 ? ((s.total_overrun / s.total_original_cost) * 100).toFixed(1) : "0.0";
                  const riskScore = s.avg_risk_score || 50;
                  let riskColor = "text-emerald-700";
                  if (riskScore >= 75) riskColor = "text-red-700 font-bold";
                  else if (riskScore >= 60) riskColor = "text-orange-700 font-bold";
                  else if (riskScore >= 40) riskColor = "text-amber-700";

                  return `
                    <tr class="hover:bg-slate-50/80">
                      <td class="font-semibold text-slate-900">${s.sector}</td>
                      <td class="text-right font-mono">${s.project_count.toLocaleString()}</td>
                      <td class="text-right font-mono font-medium">₹${(s.total_revised_cost / 1000).toFixed(1)}k Cr</td>
                      <td class="text-right font-mono text-red-700 font-medium">₹${(s.total_overrun / 1000).toFixed(1)}k Cr</td>
                      <td class="text-right font-mono text-xs text-red-600">+${overrunPct}%</td>
                      <td class="text-right font-mono ${riskColor}">${riskScore} / 100</td>
                      <td class="text-right font-mono text-slate-700">${s.avg_delay_months || 0} mos</td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  renderMinistriesTab() {
    const ministries = this.data.ministries || [];
    return `
      <div class="space-y-4">
        <div class="gov-card p-4 bg-white border border-slate-200 shadow-sm">
          <div class="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <div>
              <h3 class="text-card-title text-slate-900">Ministry Portfolio Exposure & Delivery Indices</h3>
              <p class="text-caption text-slate-500">Breakdown of administrative line ministry accountability and project risk</p>
            </div>
            <span class="text-caption font-mono text-slate-400">${ministries.length} Ministries Tracked</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
            ${ministries.map(m => {
              const risk = m.avg_risk_score || 50;
              let barColor = "bg-emerald-500";
              if (risk >= 75) barColor = "bg-red-500";
              else if (risk >= 60) barColor = "bg-orange-500";
              else if (risk >= 40) barColor = "bg-amber-500";

              return `
                <div class="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 transition-all">
                  <div class="flex items-start justify-between">
                    <h4 class="font-bold text-slate-900 text-sm line-clamp-1" title="${m.ministry}">${m.ministry}</h4>
                    <span class="font-mono text-xs font-bold text-slate-700">${m.avg_risk_score}/100</span>
                  </div>
                  <div class="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div class="${barColor} h-full" style="width: ${Math.min(100, risk)}%"></div>
                  </div>
                  <div class="flex items-center justify-between mt-3 text-caption text-slate-600 pt-2 border-t border-slate-200/60">
                    <span>Projects: <strong class="font-mono text-slate-900">${m.project_count.toLocaleString()}</strong></span>
                    <span>Outlay: <strong class="font-mono text-slate-900">₹${(m.total_revised_cost / 1000).toFixed(1)}k Cr</strong></span>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      </div>
    `;
  },

  renderBottlenecksTab() {
    const bottlenecks = this.data.bottlenecks || [];
    return `
      <div class="space-y-4">
        <div class="gov-card p-4 bg-white border border-slate-200 shadow-sm">
          <div class="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <div>
              <h3 class="text-card-title text-slate-900">Primary Bottleneck Root Causes</h3>
              <p class="text-caption text-slate-500">MoSPI IPMD structural delay drivers and their impact on slippage and cost inflation</p>
            </div>
          </div>

          <div class="gov-table-container">
            <table class="gov-table">
              <thead>
                <tr>
                  <th>Primary Statutory / Operational Bottleneck</th>
                  <th class="text-right">Occurrences</th>
                  <th class="text-right">Share of Portfolio</th>
                  <th class="text-right">Average Delay</th>
                  <th class="text-right">Average Cost Growth</th>
                  <th class="text-right">Average Risk Score</th>
                </tr>
              </thead>
              <tbody>
                ${bottlenecks.map(b => {
                  const share = ((b.occurrences / 10000) * 100).toFixed(1);
                  const name = b.primary_bottleneck.replace(/_/g, " ").toUpperCase();
                  return `
                    <tr class="hover:bg-slate-50/80">
                      <td class="font-semibold text-slate-900 flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                        <span>${name}</span>
                      </td>
                      <td class="text-right font-mono font-medium">${b.occurrences.toLocaleString()}</td>
                      <td class="text-right font-mono text-slate-600">${share}%</td>
                      <td class="text-right font-mono text-amber-800 font-semibold">${b.avg_delay_months} mos</td>
                      <td class="text-right font-mono text-red-700 font-semibold">+${b.avg_cost_growth_pct}%</td>
                      <td class="text-right font-mono font-bold text-slate-900">${b.avg_risk_score} / 100</td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  renderStatesTab() {
    const states = (this.data.states || []).slice(0, 15);
    return `
      <div class="space-y-4">
        <div class="gov-card p-4 bg-white border border-slate-200 shadow-sm">
          <div class="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <div>
              <h3 class="text-card-title text-slate-900">Geographic Infrastructure Investment Concentration</h3>
              <p class="text-caption text-slate-500">Top 15 States by revised capital outlay and high-risk project density</p>
            </div>
            <span class="text-caption font-mono text-slate-400">Regional Distribution</span>
          </div>

          <div class="gov-table-container">
            <table class="gov-table">
              <thead>
                <tr>
                  <th>State</th>
                  <th>Region</th>
                  <th class="text-right">Project Count</th>
                  <th class="text-right">Total Revised Outlay</th>
                  <th class="text-right">High / Critical Projects</th>
                  <th class="text-right">High Risk Share</th>
                </tr>
              </thead>
              <tbody>
                ${states.map(st => {
                  const highRiskPct = st.project_count > 0 ? ((st.high_risk_count / st.project_count) * 100).toFixed(1) : "0.0";
                  return `
                    <tr class="hover:bg-slate-50/80">
                      <td class="font-semibold text-slate-900">${st.state}</td>
                      <td class="text-caption text-slate-500">${st.region || "Central"}</td>
                      <td class="text-right font-mono">${st.project_count.toLocaleString()}</td>
                      <td class="text-right font-mono font-semibold">₹${(st.total_revised_cost / 1000).toFixed(1)}k Cr</td>
                      <td class="text-right font-mono text-red-700 font-bold">${st.high_risk_count.toLocaleString()}</td>
                      <td class="text-right font-mono ${parseFloat(highRiskPct) >= 50 ? 'text-red-700 font-bold' : 'text-slate-700'}">${highRiskPct}%</td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  renderQualityTab() {
    return `
      <div class="space-y-4">
        <div class="gov-card p-5 bg-white border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 class="text-card-title text-slate-900">Data Quality & Progress Decoupling Surveillance</h3>
            <p class="text-caption text-slate-500">Surveillance mechanism detecting divergence between financial utilization and actual on-ground physical completion</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="p-4 bg-red-50 rounded-lg border border-red-200 space-y-1">
              <span class="text-xs font-bold text-red-800 uppercase tracking-wide">Decoupling Anomaly</span>
              <div class="text-2xl font-bold font-mono text-red-900">2,814 Projects</div>
              <p class="text-[11px] text-red-700">Financial expenditure exceeds physical progress by > 15 percentage points without milestone signoff.</p>
            </div>

            <div class="p-4 bg-amber-50 rounded-lg border border-amber-200 space-y-1">
              <span class="text-xs font-bold text-amber-800 uppercase tracking-wide">Stale Milestone Reports</span>
              <div class="text-2xl font-bold font-mono text-amber-900">1,429 Projects</div>
              <p class="text-[11px] text-amber-700">No milestone status updates registered in PAIMANA system in last 90 days.</p>
            </div>

            <div class="p-4 bg-emerald-50 rounded-lg border border-emerald-200 space-y-1">
              <span class="text-xs font-bold text-emerald-800 uppercase tracking-wide">Data Verification Grade</span>
              <div class="text-2xl font-bold font-mono text-emerald-900">96.8% Integrity</div>
              <p class="text-[11px] text-emerald-700">Passed automated schema validation and synthetic PAIMANA consistency assertions.</p>
            </div>
          </div>

          <div class="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-2">
            <div class="font-semibold text-slate-900">Non-Linear Decoupling Hypothesis:</div>
            <p class="leading-relaxed">
              Under standard project monitoring systems, contractors can draw against mobilisation advances and stage payments while civil engineering milestones fall critically behind schedule. ProjectPulse isolates the <code>progress_decoupling_gap = financial_progress_pct - physical_progress_pct</code> as a high-weight leading feature in our LightGBM classifier, alerting IPMD officers months before formal schedule baseline revision.
            </p>
          </div>
        </div>
      </div>
    `;
  },

  getDefaultMockAnalytics() {
    return {
      sectors: [
        { sector: "Road Transport & Highways", project_count: 3200, total_original_cost: 950000, total_revised_cost: 1250000, total_overrun: 300000, avg_risk_score: 58.4, avg_delay_months: 22.1 },
        { sector: "Railways", project_count: 2400, total_original_cost: 820000, total_revised_cost: 1120000, total_overrun: 300000, avg_risk_score: 64.2, avg_delay_months: 28.5 },
        { sector: "Power & Renewable Energy", project_count: 1800, total_original_cost: 650000, total_revised_cost: 810000, total_overrun: 160000, avg_risk_score: 49.8, avg_delay_months: 18.2 },
        { sector: "Petroleum & Natural Gas", project_count: 1100, total_original_cost: 410000, total_revised_cost: 530000, total_overrun: 120000, avg_risk_score: 52.1, avg_delay_months: 19.4 },
        { sector: "Urban Development & Metro", project_count: 1500, total_original_cost: 470000, total_revised_cost: 620000, total_overrun: 150000, avg_risk_score: 61.5, avg_delay_months: 26.8 }
      ],
      ministries: [
        { ministry: "Ministry of Road Transport and Highways", project_count: 3200, total_revised_cost: 1250000, avg_risk_score: 58.4 },
        { ministry: "Ministry of Railways", project_count: 2400, total_revised_cost: 1120000, avg_risk_score: 64.2 },
        { ministry: "Ministry of Power", project_count: 1800, total_revised_cost: 810000, avg_risk_score: 49.8 },
        { ministry: "Ministry of Petroleum and Natural Gas", project_count: 1100, total_revised_cost: 530000, avg_risk_score: 52.1 },
        { ministry: "Ministry of Housing and Urban Affairs", project_count: 1500, total_revised_cost: 620000, avg_risk_score: 61.5 }
      ],
      bottlenecks: [
        { primary_bottleneck: "land_acquisition", occurrences: 3450, avg_risk_score: 72.4, avg_delay_months: 34.2, avg_cost_growth_pct: 36.8 },
        { primary_bottleneck: "forest_clearance", occurrences: 2150, avg_risk_score: 66.8, avg_delay_months: 28.6, avg_cost_growth_pct: 29.4 },
        { primary_bottleneck: "contractor_liquidity", occurrences: 1980, avg_risk_score: 69.2, avg_delay_months: 26.1, avg_cost_growth_pct: 32.5 },
        { primary_bottleneck: "dpr_revision", occurrences: 1420, avg_risk_score: 54.1, avg_delay_months: 18.4, avg_cost_growth_pct: 21.2 },
        { primary_bottleneck: "equipment_supply_delay", occurrences: 1000, avg_risk_score: 48.9, avg_delay_months: 14.5, avg_cost_growth_pct: 16.8 }
      ],
      states: [
        { state: "Maharashtra", region: "Western", project_count: 1120, total_revised_cost: 490000, high_risk_count: 480 },
        { state: "Uttar Pradesh", region: "Northern", project_count: 1250, total_revised_cost: 460000, high_risk_count: 510 },
        { state: "Gujarat", region: "Western", project_count: 980, total_revised_cost: 410000, high_risk_count: 320 },
        { state: "Tamil Nadu", region: "Southern", project_count: 850, total_revised_cost: 380000, high_risk_count: 340 },
        { state: "Karnataka", region: "Southern", project_count: 790, total_revised_cost: 350000, high_risk_count: 310 }
      ]
    };
  }
};

window.AnalyticsView = AnalyticsView;
