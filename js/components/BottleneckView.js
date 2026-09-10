// ==========================================================================
// PROJECTPULSE — Bottleneck Intelligence Observatory (Phase 9.5)
// Route: /bottlenecks
// Ministry of Statistics & Programme Implementation (MoSPI) - IPMD / PAIMANA
// Smart India Hackathon 2026 — Team HexaForce
// ==========================================================================

const BottleneckView = {
  activeBottleneck: "land_acquisition",
  bottleneckData: {
    land_acquisition: {
      name: "Land Acquisition & Right-of-Way (RoW)",
      category: "Inter-State / Revenue Jurisdiction",
      affected_count: 3820,
      pct_delayed: 38.2,
      avg_delay_months: 15.4,
      capital_exposed_cr: "16.4L Cr",
      icon: "📍",
      description: "Delays in title verification, compensation awards under RFCTLARR Act 2013, and physical possession handover of linear alignments.",
      mitigations: [
        "Special Land Acquisition Officer (SLAO) Fast-Track Tribunals",
        "Direct Purchase / Consent-Based Compensation Frameworks",
        "PM GatiShakti GIS Alignment De-confliction"
      ]
    },
    clearance_impasse: {
      name: "Statutory & Environmental Clearances",
      category: "Inter-Ministerial Approvals",
      affected_count: 2450,
      pct_delayed: 24.5,
      avg_delay_months: 11.8,
      capital_exposed_cr: "10.2L Cr",
      icon: "🌲",
      description: "Multi-stage Forest Advisory Committee (FAC) Stage-I/II clearances, Wildlife board sanctions, and Coastal Regulatory Zone (CRZ) clearances.",
      mitigations: [
        "PARIVESH 2.0 Single-Window Accelerated Processing",
        "State Forest Department Joint Working Groups",
        "Compensatory Afforestation Land (CA) Pre-Identification"
      ]
    },
    financial_decoupling: {
      name: "Financial-Physical Decoupling Gap",
      category: "Contractual & Governance Anomaly",
      affected_count: 1420,
      pct_delayed: 14.2,
      avg_delay_months: 13.2,
      capital_exposed_cr: "7.8L Cr",
      icon: "⚡",
      description: "Significant disparity where cumulative financial disbursement exceeds actual physical on-site construction by over 20 percentage points.",
      mitigations: [
        "Milestone-Linked Escrow Account Disbursements",
        "Independent Third-Party Drone / LiDAR Verification",
        "Contractor Milestone Re-Baselining Audit"
      ]
    },
    contractor_failure: {
      name: "Contractor Liquidity & Legal Arbitration",
      category: "Vendor Performance & Working Capital",
      affected_count: 1180,
      pct_delayed: 11.8,
      avg_delay_months: 18.6,
      capital_exposed_cr: "5.1L Cr",
      icon: "🏗️",
      description: "Severe contractor balance sheet stress, working capital exhaustion, sub-contractor non-payment, and prolonged arbitral disputes.",
      mitigations: [
        "Vivad se Vishwas II Contractual Dispute Settlement Scheme",
        "Bank Guarantee Mobilization Advance Rationalization",
        "Substitution of Non-Performing Consortium Partners"
      ]
    },
    utility_shifting: {
      name: "Utility Shifting & Transco Encroachment",
      category: "Line Department Coordination",
      affected_count: 710,
      pct_delayed: 7.1,
      avg_delay_months: 8.4,
      capital_exposed_cr: "2.9L Cr",
      icon: "🔌",
      description: "Relocation of high-tension power transmission lines, gas pipelines, and municipal water mains crossing right-of-way zones.",
      mitigations: [
        "Utility Shifting Cost Deposit Matrix Standardization",
        "State DISCOM / TRANSCO Empowered Committee Approvals",
        "Pre-Construction Utility Corridor Dedication"
      ]
    },
    monsoonal_impact: {
      name: "Geological & Extreme Monsoonal Impasse",
      category: "Physical & Natural Constraints",
      affected_count: 420,
      pct_delayed: 4.2,
      avg_delay_months: 7.1,
      capital_exposed_cr: "1.8L Cr",
      icon: "🌧️",
      description: "Himalayan tunneling strata collapses, unseasonal flooding of river basins, and seasonal working window compression.",
      mitigations: [
        "Advanced Tunnel Seismic Prediction (TSP) & Horizontal Coring",
        "Pre-Monsoon Substructure Protective Measures",
        "Seasonal Multi-Shift Heavy Plant Deployment"
      ]
    }
  },

  render() {
    const keys = Object.keys(this.bottleneckData);
    const activeInfo = this.bottleneckData[this.activeBottleneck] || this.bottleneckData.land_acquisition;

    return `
      <div class="max-w-[1440px] mx-auto space-y-6">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-[11px] font-bold uppercase tracking-wider text-orange-800 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded">
                Root Cause Surveillance
              </span>
              <span class="text-caption text-slate-400">•</span>
              <span class="text-caption text-slate-500 font-medium">MoSPI IPMD Central Sector Portfolio</span>
            </div>
            <h1 class="text-page-title mt-1">National Bottleneck Intelligence Observatory</h1>
            <p class="text-caption text-slate-500 mt-0.5">
              Multi-dimensional analysis of systemic delays, statutory impediments, and institutional friction points across the monitored portfolio.
            </p>
          </div>
          <div class="flex items-center gap-2">
            <a href="#/early-warnings" class="btn btn-secondary btn-sm">
              Early Warning Radar ↗
            </a>
          </div>
        </div>

        <!-- Non-Causal Sensitivity Disclaimer Banner -->
        <div class="p-3 bg-blue-50/80 border border-blue-200 rounded-lg flex items-start gap-2.5 text-caption text-blue-950">
          <span class="text-base flex-shrink-0">⚖️</span>
          <div>
            <strong>Institutional Decision-Support Protocol:</strong> Bottleneck taxonomy is derived directly from MoSPI PAIMANA monthly project monitoring returns and LightGBM TreeSHAP feature importance rankings. Interventions model historical statistical sensitivity and do not claim determinism.
          </div>
        </div>

        <!-- Executive KPI Telemetry -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="gov-card p-4">
            <div class="text-caption text-slate-500 font-medium">Dominant Systemic Driver</div>
            <div class="mt-2 flex items-baseline justify-between">
              <span class="text-xl font-bold text-slate-900 truncate">Land & RoW (38.2%)</span>
              <span class="text-base">📍</span>
            </div>
            <div class="text-[11px] text-slate-500 mt-1">Impacts 3,820 Central Sector Projects</div>
          </div>

          <div class="gov-card p-4">
            <div class="text-caption text-slate-500 font-medium">Clearance Impasses</div>
            <div class="mt-2 flex items-baseline justify-between">
              <span class="text-xl font-bold text-slate-900">2,450 Projects</span>
              <span class="text-base">🌲</span>
            </div>
            <div class="text-[11px] text-slate-500 mt-1">Forest, Wildlife & Coastal Approvals</div>
          </div>

          <div class="gov-card p-4">
            <div class="text-caption text-slate-500 font-medium">Decoupled Progress Capex</div>
            <div class="mt-2 flex items-baseline justify-between">
              <span class="text-xl font-bold text-orange-700">₹7.8L Crore</span>
              <span class="text-base">⚡</span>
            </div>
            <div class="text-[11px] text-slate-500 mt-1">Disbursement $>$20% ahead of works</div>
          </div>

          <div class="gov-card p-4">
            <div class="text-caption text-slate-500 font-medium">Contractor Disputes</div>
            <div class="mt-2 flex items-baseline justify-between">
              <span class="text-xl font-bold text-red-700">1,180 Projects</span>
              <span class="text-base">🏗️</span>
            </div>
            <div class="text-[11px] text-slate-500 mt-1">Average schedule delay of 18.6 months</div>
          </div>
        </div>

        <!-- Interactive Bottleneck Category Tabs & Breakdown -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <!-- Left: Bottleneck Selector Deck (5 Cols) -->
          <div class="lg:col-span-5 gov-card p-4 space-y-2.5">
            <div class="border-b border-slate-100 pb-2 mb-2 flex items-center justify-between">
              <h3 class="text-card-title">Bottleneck Distribution</h3>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">MoSPI IPMD Portfolio</span>
            </div>

            <div class="space-y-2" id="bottleneck-tabs-container">
              ${keys.map(k => {
                const b = this.bottleneckData[k];
                const isActive = k === this.activeBottleneck;
                return `
                  <button data-bottleneck="${k}" 
                          class="bn-tab-btn w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between ${
                            isActive 
                              ? 'bg-blue-50/80 border-blue-300 text-blue-950 font-semibold shadow-sm' 
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                          }">
                    <div class="flex items-center gap-2.5 min-w-0">
                      <span class="text-base">${b.icon}</span>
                      <div class="truncate">
                        <div class="text-xs truncate ${isActive ? 'text-blue-950 font-bold' : 'text-slate-800 font-medium'}">${b.name}</div>
                        <div class="text-[10px] text-slate-500">${b.category}</div>
                      </div>
                    </div>
                    <div class="text-right flex-shrink-0 ml-2">
                      <div class="font-mono text-xs ${isActive ? 'text-blue-700 font-bold' : 'text-slate-900 font-semibold'}">${b.affected_count.toLocaleString("en-IN")}</div>
                      <div class="text-[10px] text-slate-400">${b.pct_delayed}%</div>
                    </div>
                  </button>
                `;
              }).join("")}
            </div>
          </div>

          <!-- Right: Selected Bottleneck Profile & Strategic Playbook (7 Cols) -->
          <div class="lg:col-span-7 gov-card p-5 flex flex-col justify-between" id="bottleneck-detail-card">
            <div>
              <div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div class="flex items-center gap-2">
                  <span class="text-2xl">${activeInfo.icon}</span>
                  <div>
                    <h3 class="text-base font-bold text-slate-900" id="bn-title">${activeInfo.name}</h3>
                    <span class="text-[11px] text-slate-500" id="bn-cat">${activeInfo.category}</span>
                  </div>
                </div>
                <div class="text-right">
                  <span class="text-xs font-mono font-bold text-red-700 block" id="bn-exposure">₹${activeInfo.capital_exposed_cr}</span>
                  <span class="text-[10px] text-slate-400">Capital Exposure</span>
                </div>
              </div>

              <p class="text-xs text-slate-600 leading-relaxed mb-4" id="bn-desc">
                ${activeInfo.description}
              </p>

              <!-- Telemetry Sub-grid -->
              <div class="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-lg border border-slate-200 mb-5 text-center">
                <div>
                  <span class="text-[10px] font-semibold text-slate-400 uppercase block">Projects Flagged</span>
                  <span class="text-base font-bold text-slate-900 font-mono" id="bn-count">${activeInfo.affected_count.toLocaleString("en-IN")}</span>
                </div>
                <div>
                  <span class="text-[10px] font-semibold text-slate-400 uppercase block">Delay Contribution</span>
                  <span class="text-base font-bold text-orange-700 font-mono" id="bn-delay">+${activeInfo.avg_delay_months} Mos</span>
                </div>
                <div>
                  <span class="text-[10px] font-semibold text-slate-400 uppercase block">Portfolio Share</span>
                  <span class="text-base font-bold text-blue-700 font-mono" id="bn-share">${activeInfo.pct_delayed}%</span>
                </div>
              </div>

              <!-- Recommended Institutional Remediation Playbook -->
              <div class="space-y-2">
                <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider">Recommended IPMD Policy Actions</h4>
                <div class="space-y-1.5" id="bn-mitigations">
                  ${activeInfo.mitigations.map(m => `
                    <div class="flex items-center gap-2 text-xs text-slate-700 bg-white p-2.5 rounded border border-slate-200">
                      <span class="text-emerald-600 font-bold">✓</span>
                      <span>${m}</span>
                    </div>
                  `).join("")}
                </div>
              </div>
            </div>

            <div class="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span class="text-[11px] text-slate-400">Integrated with PM GatiShakti & PAIMANA reporting</span>
              <a href="#/projects?bottleneck=${this.activeBottleneck}" id="bn-filter-projects-link" class="btn btn-primary btn-sm">
                View All ${activeInfo.affected_count.toLocaleString("en-IN")} Affected Projects ➔
              </a>
            </div>
          </div>

        </div>

        <!-- Projects Impacted by Active Bottleneck Table -->
        <div class="gov-card">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <div>
              <h3 class="text-card-title">High-Exposure Projects Impacted by ${activeInfo.name}</h3>
              <p class="text-caption text-slate-500">Filtered directly from the database matching this primary friction constraint.</p>
            </div>
            <span id="bn-table-status" class="text-caption text-slate-500 font-mono">Loading...</span>
          </div>

          <div class="gov-table-container">
            <table class="gov-table">
              <thead>
                <tr>
                  <th style="min-width: 280px;">Project Identification</th>
                  <th>Ministry / State</th>
                  <th>Outlay</th>
                  <th>Slippage</th>
                  <th>Risk Score</th>
                  <th>Decoupling Gap</th>
                  <th class="text-right">Action</th>
                </tr>
              </thead>
              <tbody id="bn-projects-tbody">
                <tr>
                  <td colspan="7" class="p-8 text-center text-slate-400 text-xs">Loading impacted projects...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  },

  async postRender() {
    this.bindEvents();
    await this.loadImpactedProjects();
  },

  bindEvents() {
    const tabBtns = document.querySelectorAll(".bn-tab-btn");
    tabBtns.forEach(btn => {
      btn.addEventListener("click", async () => {
        const key = btn.getAttribute("data-bottleneck");
        if (key && this.bottleneckData[key]) {
          this.activeBottleneck = key;
          this.updateActiveDetail();
          await this.loadImpactedProjects();
        }
      });
    });
  },

  updateActiveDetail() {
    const activeInfo = this.bottleneckData[this.activeBottleneck];
    if (!activeInfo) return;

    // Update Tab Styles
    document.querySelectorAll(".bn-tab-btn").forEach(btn => {
      const k = btn.getAttribute("data-bottleneck");
      if (k === this.activeBottleneck) {
        btn.className = "bn-tab-btn w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between bg-blue-50/80 border-blue-300 text-blue-950 font-semibold shadow-sm";
      } else {
        btn.className = "bn-tab-btn w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300";
      }
    });

    // Update Detail card fields
    const title = document.getElementById("bn-title");
    const cat = document.getElementById("bn-cat");
    const exposure = document.getElementById("bn-exposure");
    const desc = document.getElementById("bn-desc");
    const count = document.getElementById("bn-count");
    const delay = document.getElementById("bn-delay");
    const share = document.getElementById("bn-share");
    const mitigations = document.getElementById("bn-mitigations");
    const filterLink = document.getElementById("bn-filter-projects-link");

    if (title) title.innerText = activeInfo.name;
    if (cat) cat.innerText = activeInfo.category;
    if (exposure) exposure.innerText = `₹${activeInfo.capital_exposed_cr}`;
    if (desc) desc.innerText = activeInfo.description;
    if (count) count.innerText = activeInfo.affected_count.toLocaleString("en-IN");
    if (delay) delay.innerText = `+${activeInfo.avg_delay_months} Mos`;
    if (share) share.innerText = `${activeInfo.pct_delayed}%`;

    if (mitigations) {
      mitigations.innerHTML = activeInfo.mitigations.map(m => `
        <div class="flex items-center gap-2 text-xs text-slate-700 bg-white p-2.5 rounded border border-slate-200">
          <span class="text-emerald-600 font-bold">✓</span>
          <span>${m}</span>
        </div>
      `).join("");
    }

    if (filterLink) {
      filterLink.href = `#/projects?bottleneck=${this.activeBottleneck}`;
      filterLink.innerText = `View All ${activeInfo.affected_count.toLocaleString("en-IN")} Affected Projects ➔`;
    }
  },

  async loadImpactedProjects() {
    const tbody = document.getElementById("bn-projects-tbody");
    const status = document.getElementById("bn-table-status");
    if (!tbody) return;

    if (status) status.innerText = "Querying database...";

    try {
      if (window.APIClient) {
        const res = await window.APIClient.getProjects({
          bottleneck: this.activeBottleneck,
          page_size: 8,
          sort_by: "cost_overrun_cr",
          sort_order: "desc"
        });

        if (res && res.items && res.items.length > 0) {
          if (status) status.innerText = `Displaying top 8 by cost overrun of ${res.total_records.toLocaleString("en-IN")} projects`;
          tbody.innerHTML = res.items.map(p => `
            <tr>
              <td>
                <div class="font-semibold text-slate-900 text-sm line-clamp-1">${p.project_name}</div>
                <div class="font-mono text-caption text-slate-400 uppercase mt-0.5">${p.project_id}</div>
              </td>
              <td>
                <div class="text-slate-800 font-medium text-xs truncate max-w-[180px]">${p.ministry}</div>
                <div class="text-[11px] text-slate-400">${p.state || 'National'}</div>
              </td>
              <td>
                <div class="font-mono font-semibold text-slate-900 text-xs">₹${Number(p.financials ? p.financials.revised_cost_cr : 0).toLocaleString("en-IN")} Cr</div>
              </td>
              <td>
                <div class="font-mono font-medium text-orange-700 text-xs">+${p.schedule ? p.schedule.delay_duration_months : 0} Mos</div>
              </td>
              <td>
                <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold ${
                  (p.risk && p.risk.level === 'CRITICAL') ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                }">
                  ${p.risk ? p.risk.overall_score : 70}
                </span>
              </td>
              <td>
                <div class="text-xs font-mono font-bold ${
                  (p.progress && p.progress.progress_gap_pct > 20) ? 'text-red-700' : 'text-slate-700'
                }">
                  ${p.progress ? p.progress.progress_gap_pct : 0}% gap
                </div>
              </td>
              <td class="text-right">
                <a href="#/projects/${p.project_id}" class="btn btn-secondary btn-sm">
                  Inspect Dossier ↗
                </a>
              </td>
            </tr>
          `).join("");
          return;
        }
      }
    } catch (e) {
      console.warn("[BottleneckView] Impacted projects error:", e);
    }

    // Fallback display
    const mock = window.MOCK_PROJECTS || [];
    if (status) status.innerText = `Showing ${mock.length} demonstration projects`;
    tbody.innerHTML = mock.map(p => `
      <tr>
        <td>
          <div class="font-semibold text-slate-900 text-sm line-clamp-1">${p.project_name}</div>
          <div class="font-mono text-caption text-slate-400 uppercase mt-0.5">${p.project_id}</div>
        </td>
        <td>
          <div class="text-slate-800 font-medium text-xs">${p.ministry}</div>
          <div class="text-[11px] text-slate-400">${p.state}</div>
        </td>
        <td>
          <div class="font-mono font-semibold text-slate-900 text-xs">₹${p.financials.revised_cost_cr} Cr</div>
        </td>
        <td>
          <div class="font-mono font-medium text-orange-700 text-xs">+${p.schedule.delay_duration_months} Mos</div>
        </td>
        <td>
          <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800">
            ${p.risk.overall_score}
          </span>
        </td>
        <td>
          <div class="text-xs font-mono font-bold text-red-700">${p.progress.progress_gap_pct}% gap</div>
        </td>
        <td class="text-right">
          <a href="#/projects/${p.project_id}" class="btn btn-secondary btn-sm">
            Inspect Dossier ↗
          </a>
        </td>
      </tr>
    `).join("");
  }
};

window.BottleneckView = BottleneckView;
