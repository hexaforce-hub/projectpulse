// ==========================================================================
// PROJECTPULSE — Portfolio Risk Matrix Component (Phase 9.5)
// Route: /portfolio-matrix
// Ministry of Statistics & Programme Implementation (MoSPI) - IPMD / PAIMANA
// Smart India Hackathon 2026 — Team HexaForce
// ==========================================================================

const PortfolioMatrixView = {
  matrixData: [],
  filteredData: [],
  selectedSector: "ALL",
  selectedBottleneck: "ALL",
  minRisk: 0,
  tooltipEl: null,

  render() {
    return `
      <div class="max-w-[1440px] mx-auto space-y-6">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-[11px] font-bold uppercase tracking-wider text-purple-800 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
                Executive Decision Matrix
              </span>
              <span class="text-caption text-slate-400">•</span>
              <span class="text-caption text-slate-500 font-medium">Risk Score vs. Fiscal Exposure (2D Quadrants)</span>
            </div>
            <h1 class="text-page-title mt-1">Portfolio Risk vs Capital Exposure Matrix</h1>
            <p class="text-caption text-slate-500 mt-0.5">
              Pinpoint megaprojects in the critical high-risk / high-exposure danger zone requiring immediate inter-ministerial intervention.
            </p>
          </div>
          <div class="flex items-center gap-2">
            <span id="matrix-dataset-caption" class="text-caption text-slate-500 hidden sm:inline tabular-nums">
              Portfolio Universe: Loading...
            </span>
            <a href="#/projects" class="btn btn-secondary btn-sm">
              Projects Registry ↗
            </a>
          </div>
        </div>

        <!-- Quadrant Summary KPI Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="gov-card p-4 border-l-4 border-l-red-600">
            <div class="text-caption text-slate-500 font-semibold uppercase tracking-wider">Quadrant I: Critical Escalation</div>
            <div class="mt-2 flex items-baseline justify-between">
              <span id="matrix-kpi-q1-count" class="text-2xl font-bold text-red-700 font-mono">--</span>
              <span class="text-[11px] font-bold bg-red-100 text-red-800 px-1.5 py-0.5 rounded">High Risk + High Cost</span>
            </div>
            <p class="text-[11px] text-slate-500 mt-1">Primary targets for Cabinet Committee on Infrastructure</p>
          </div>

          <div class="gov-card p-4 border-l-4 border-l-amber-500">
            <div class="text-caption text-slate-500 font-semibold uppercase tracking-wider">Quadrant II: Early Warning</div>
            <div class="mt-2 flex items-baseline justify-between">
              <span id="matrix-kpi-q2-count" class="text-2xl font-bold text-amber-700 font-mono">--</span>
              <span class="text-[11px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">High Risk + Mod Cost</span>
            </div>
            <p class="text-[11px] text-slate-500 mt-1">Requires preventive mitigation to avoid cascading slippage</p>
          </div>

          <div class="gov-card p-4 border-l-4 border-l-blue-600">
            <div class="text-caption text-slate-500 font-semibold uppercase tracking-wider">Quadrant III: Fiscal Vigilance</div>
            <div class="mt-2 flex items-baseline justify-between">
              <span id="matrix-kpi-q3-count" class="text-2xl font-bold text-blue-700 font-mono">--</span>
              <span class="text-[11px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Low Risk + High Cost</span>
            </div>
            <p class="text-[11px] text-slate-500 mt-1">Megaprojects on track; monitor milestone cash outflows</p>
          </div>

          <div class="gov-card p-4 border-l-4 border-l-emerald-600">
            <div class="text-caption text-slate-500 font-semibold uppercase tracking-wider">Quadrant IV: Controlled Execution</div>
            <div class="mt-2 flex items-baseline justify-between">
              <span id="matrix-kpi-q4-count" class="text-2xl font-bold text-emerald-700 font-mono">--</span>
              <span class="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">Low Risk + Mod Cost</span>
            </div>
            <p class="text-[11px] text-slate-500 mt-1">Healthy execution trajectory within baseline variance</p>
          </div>
        </div>

        <!-- Filter & Control Deck -->
        <div class="gov-card p-4 space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex flex-wrap items-center gap-3">
              <div>
                <label class="text-[11px] font-semibold text-slate-600 block mb-1">Filter by Sector</label>
                <select id="matrix-filter-sector" class="gov-select text-xs py-1.5">
                  <option value="ALL">All Sectors</option>
                  <option value="Roads & Highways">Roads & Highways</option>
                  <option value="Railways">Railways</option>
                  <option value="Power">Power & Renewable</option>
                  <option value="Petroleum">Petroleum & Natural Gas</option>
                  <option value="Urban Development">Urban Development</option>
                  <option value="Ports & Shipping">Ports & Shipping</option>
                  <option value="Civil Aviation">Civil Aviation</option>
                </select>
              </div>

              <div>
                <label class="text-[11px] font-semibold text-slate-600 block mb-1">Filter by Primary Bottleneck</label>
                <select id="matrix-filter-bottleneck" class="gov-select text-xs py-1.5">
                  <option value="ALL">All Bottlenecks</option>
                  <option value="land_acquisition">Land Acquisition & RoW</option>
                  <option value="clearance_impasse">Statutory & Forest Clearances</option>
                  <option value="contractor_failure">Contractor Cashflow / Disputes</option>
                  <option value="financial_decoupling">Financial-Physical Decoupling</option>
                  <option value="utility_shifting">Utility Shifting</option>
                  <option value="monsoonal_impact">Monsoonal / Geological</option>
                </select>
              </div>

              <div>
                <label class="text-[11px] font-semibold text-slate-600 block mb-1">Minimum Risk Score</label>
                <div class="flex items-center gap-2">
                  <input type="range" id="matrix-filter-risk" min="0" max="90" step="5" value="0" class="w-28 cursor-pointer" />
                  <span id="matrix-filter-risk-val" class="font-mono text-xs font-bold text-slate-700">0+</span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <span id="matrix-filtered-count" class="text-xs font-semibold text-slate-600">Loading projects...</span>
              <button id="matrix-btn-reset" class="btn btn-secondary btn-sm">Reset Filters</button>
            </div>
          </div>
        </div>

        <!-- 2D Interactive Scatter Canvas / SVG Plot -->
        <div class="gov-card p-4">
          <div class="flex items-center justify-between mb-3">
            <div>
              <h3 class="text-card-title">Risk vs. Capital Exposure 2D Coordinate Map</h3>
              <p class="text-caption text-slate-500">Each dot represents a project. Dot size correlates with cumulative cost overrun. Click dot to inspect.</p>
            </div>
            <div class="flex items-center gap-3 text-[11px] text-slate-600">
              <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-red-600 inline-block"></span> Critical Risk</span>
              <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> High Risk</span>
              <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span> Moderate</span>
              <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span> Low Risk</span>
            </div>
          </div>

          <div class="matrix-container h-[520px] w-full relative select-none">
            <!-- Quadrant Labels -->
            <div class="matrix-quadrant matrix-q-critical">
              Quadrant I: Critical Escalation
              <div class="text-[9px] font-normal text-red-600/80">High Risk • High Exposure</div>
            </div>
            <div class="matrix-quadrant matrix-q-monitor">
              Quadrant II: Early Warning Radar
              <div class="text-[9px] font-normal text-amber-600/80">High Risk • Mod Exposure</div>
            </div>
            <div class="matrix-quadrant matrix-q-highcost">
              Quadrant III: Fiscal Outlay Monitor
              <div class="text-[9px] font-normal text-blue-600/80">Low Risk • High Exposure</div>
            </div>
            <div class="matrix-quadrant matrix-q-healthy">
              Quadrant IV: Controlled Progress
              <div class="text-[9px] font-normal text-emerald-600/80">Low Risk • Controlled Outlay</div>
            </div>

            <!-- SVG Plot Area -->
            <svg id="matrix-svg" class="w-full h-full" viewBox="0 0 1000 500" preserveAspectRatio="none">
              <!-- Grid & Quadrant Dividers -->
              <rect x="500" y="0" width="500" height="250" fill="rgba(239, 68, 68, 0.03)" />
              <rect x="0" y="0" width="500" height="250" fill="rgba(245, 158, 11, 0.03)" />
              <rect x="500" y="250" width="500" height="250" fill="rgba(59, 130, 246, 0.02)" />
              <rect x="0" y="250" width="500" height="250" fill="rgba(16, 185, 129, 0.03)" />

              <!-- Crosshairs -->
              <line x1="500" y1="0" x2="500" y2="500" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="4 4" />
              <line x1="0" y1="250" x2="1000" y2="250" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="4 4" />

              <!-- Axis Labels -->
              <text x="980" y="270" text-anchor="end" fill="#64748b" font-size="11" font-weight="600">Capital Exposure (₹ Cr) →</text>
              <text x="510" y="20" fill="#64748b" font-size="11" font-weight="600">↑ Composite Risk Score</text>

              <!-- Points Container -->
              <g id="matrix-points-group"></g>
            </svg>

            <!-- Floating Tooltip -->
            <div id="matrix-tooltip" class="hidden absolute pointer-events-none z-50 bg-slate-900 text-white rounded-lg p-3 text-xs shadow-xl border border-slate-700 max-w-xs transition-opacity duration-150">
              <!-- Injected by hover -->
            </div>
          </div>
        </div>

        <!-- Quadrant I Critical Focus Table -->
        <div class="gov-card">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-card-title">Quadrant I Megaprojects (Critical Attention Required)</h3>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
                  RED ESCALATION ZONE
                </span>
              </div>
              <p class="text-caption text-slate-500">Highest financial exposure projects facing severe execution friction.</p>
            </div>
            <span id="matrix-table-count" class="text-caption text-slate-500 font-mono">0 projects</span>
          </div>

          <div class="gov-table-container">
            <table class="gov-table">
              <thead>
                <tr>
                  <th style="min-width: 260px;">Project Identification</th>
                  <th>Ministry / State</th>
                  <th>Revised Outlay</th>
                  <th>Cost Overrun</th>
                  <th>Risk Score</th>
                  <th>Primary Driver</th>
                  <th class="text-right">Action</th>
                </tr>
              </thead>
              <tbody id="matrix-table-tbody">
                <tr>
                  <td colspan="7" class="p-6 text-center text-slate-400 text-xs">Loading matrix projects...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  },

  async postRender() {
    this.tooltipEl = document.getElementById("matrix-tooltip");
    this.bindEvents();
    await this.loadData();
  },

  bindEvents() {
    const sSector = document.getElementById("matrix-filter-sector");
    const sBottleneck = document.getElementById("matrix-filter-bottleneck");
    const rRisk = document.getElementById("matrix-filter-risk");
    const rRiskVal = document.getElementById("matrix-filter-risk-val");
    const btnReset = document.getElementById("matrix-btn-reset");

    if (sSector) {
      sSector.addEventListener("change", (e) => {
        this.selectedSector = e.target.value;
        this.applyFilters();
      });
    }

    if (sBottleneck) {
      sBottleneck.addEventListener("change", (e) => {
        this.selectedBottleneck = e.target.value;
        this.applyFilters();
      });
    }

    if (rRisk) {
      rRisk.addEventListener("input", (e) => {
        this.minRisk = parseInt(e.target.value, 10);
        if (rRiskVal) rRiskVal.innerText = `${this.minRisk}+`;
        this.applyFilters();
      });
    }

    if (btnReset) {
      btnReset.addEventListener("click", () => {
        this.selectedSector = "ALL";
        this.selectedBottleneck = "ALL";
        this.minRisk = 0;
        if (sSector) sSector.value = "ALL";
        if (sBottleneck) sBottleneck.value = "ALL";
        if (rRisk) rRisk.value = 0;
        if (rRiskVal) rRiskVal.innerText = "0+";
        this.applyFilters();
      });
    }
  },

  async loadData() {
    try {
      if (window.APIClient) {
        const res = await window.APIClient.getPortfolioMatrix(250);
        if (res && res.matrix) {
          this.matrixData = res.matrix;
          this.applyFilters();
          return;
        }
      }
    } catch (e) {
      console.warn("[PortfolioMatrixView] Data load error:", e);
    }
    this.matrixData = (window.MOCK_PROJECTS || []).map(p => ({
      project_id: p.project_id,
      project_name: p.project_name,
      ministry: p.ministry,
      sector: p.sector,
      state: p.state || "National",
      revised_cost_cr: (p.financials && p.financials.revised_cost_cr) || 5000,
      cost_overrun_cr: (p.financials && p.financials.cost_overrun_cr) || 500,
      overall_risk_score: (p.risk && p.risk.overall_score) || 75.0,
      target_risk_class: (p.risk && p.risk.level) || "HIGH",
      schedule_slippage_months: (p.schedule && p.schedule.delay_duration_months) || 12,
      progress_decoupling_gap: (p.progress && p.progress.progress_gap_pct) || 15,
      primary_bottleneck: p.primary_bottleneck || "land_acquisition"
    }));
    this.applyFilters();
  },

  applyFilters() {
    let filtered = [...this.matrixData];

    if (this.selectedSector !== "ALL") {
      filtered = filtered.filter(p => p.sector === this.selectedSector);
    }

    if (this.selectedBottleneck !== "ALL") {
      const bn = this.selectedBottleneck.toLowerCase();
      filtered = filtered.filter(p => {
        const val = (p.primary_bottleneck || "").toLowerCase();
        return val.includes(bn);
      });
    }

    if (this.minRisk > 0) {
      filtered = filtered.filter(p => (p.overall_risk_score || 0) >= this.minRisk);
    }

    this.filteredData = filtered;
    
    const dsCaption = document.getElementById("matrix-dataset-caption");
    if (dsCaption) dsCaption.innerText = `Portfolio Universe: ${this.matrixData.length} Projects by Outlay`;

    const countBadge = document.getElementById("matrix-filtered-count");
    if (countBadge) countBadge.innerText = `Showing ${filtered.length} of ${this.matrixData.length} projects`;

    this.computeQuadrants();
    this.renderSvgPlot();
    this.renderCriticalTable();
  },

  computeQuadrants() {
    let q1 = 0, q2 = 0, q3 = 0, q4 = 0;
    // Thresholds: Risk >= 60 = High, Outlay >= 4,000 Cr = High Exposure
    this.filteredData.forEach(p => {
      const isHighRisk = (p.overall_risk_score || 0) >= 60;
      const isHighCost = (p.revised_cost_cr || 0) >= 4000;

      if (isHighRisk && isHighCost) q1++;
      else if (isHighRisk && !isHighCost) q2++;
      else if (!isHighRisk && isHighCost) q3++;
      else q4++;
    });

    const elQ1 = document.getElementById("matrix-kpi-q1-count");
    const elQ2 = document.getElementById("matrix-kpi-q2-count");
    const elQ3 = document.getElementById("matrix-kpi-q3-count");
    const elQ4 = document.getElementById("matrix-kpi-q4-count");

    if (elQ1) elQ1.innerText = q1.toLocaleString("en-IN");
    if (elQ2) elQ2.innerText = q2.toLocaleString("en-IN");
    if (elQ3) elQ3.innerText = q3.toLocaleString("en-IN");
    if (elQ4) elQ4.innerText = q4.toLocaleString("en-IN");
  },

  renderSvgPlot() {
    const group = document.getElementById("matrix-points-group");
    if (!group) return;

    if (this.filteredData.length === 0) {
      group.innerHTML = `<text x="500" y="250" text-anchor="middle" fill="#94a3b8" font-size="14">No projects match the selected filters</text>`;
      return;
    }

    // Determine min/max costs for logarithmic/linear scale
    const maxCost = Math.max(...this.filteredData.map(p => p.revised_cost_cr || 1000), 10000);

    const pointsHtml = this.filteredData.map(p => {
      const risk = p.overall_risk_score || 50;
      // Map risk (0 to 100) to SVG Y (500 to 0)
      const cy = 500 - (risk / 100) * 460 - 20;

      // Map cost to SVG X (logarithmic approximation for visual balance)
      const normCost = Math.log10(Math.max(p.revised_cost_cr || 150, 150)) / Math.log10(maxCost);
      const cx = Math.max(30, Math.min(970, normCost * 920 + 40));

      // Radius based on cost overrun
      const overrun = p.cost_overrun_cr || 0;
      const r = Math.max(4.5, Math.min(13, 5 + (overrun / 1200) * 8));

      // Color based on risk class
      let fill = "#10b981"; // Low
      if (p.target_risk_class === "CRITICAL" || risk >= 80) fill = "#ef4444";
      else if (p.target_risk_class === "HIGH" || risk >= 60) fill = "#f59e0b";
      else if (p.target_risk_class === "MODERATE" || risk >= 35) fill = "#3b82f6";

      return `
        <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}"
                fill="${fill}" fill-opacity="0.82" stroke="#ffffff" stroke-width="1.5"
                class="matrix-point"
                data-id="${p.project_id}"
                data-name="${encodeURIComponent(p.project_name)}"
                data-ministry="${encodeURIComponent(p.ministry)}"
                data-cost="${p.revised_cost_cr || 0}"
                data-overrun="${p.cost_overrun_cr || 0}"
                data-risk="${risk.toFixed(1)}"
                data-class="${p.target_risk_class || 'HIGH'}"
                data-bottleneck="${encodeURIComponent(p.primary_bottleneck || 'Clearance')}" />
      `;
    }).join("");

    group.innerHTML = pointsHtml;

    // Attach hover & click events
    group.querySelectorAll("circle").forEach(circle => {
      circle.addEventListener("mouseenter", (e) => this.showTooltip(e));
      circle.addEventListener("mousemove", (e) => this.positionTooltip(e));
      circle.addEventListener("mouseleave", () => this.hideTooltip());
      circle.addEventListener("click", () => {
        const id = circle.getAttribute("data-id");
        if (id) window.location.hash = `#/projects/${id}`;
      });
    });
  },

  showTooltip(e) {
    if (!this.tooltipEl) return;
    const c = e.currentTarget;
    const name = decodeURIComponent(c.getAttribute("data-name"));
    const id = c.getAttribute("data-id");
    const ministry = decodeURIComponent(c.getAttribute("data-ministry"));
    const cost = Number(c.getAttribute("data-cost")).toLocaleString("en-IN");
    const overrun = Number(c.getAttribute("data-overrun")).toLocaleString("en-IN");
    const risk = c.getAttribute("data-risk");
    const rClass = c.getAttribute("data-class");
    const bottleneck = decodeURIComponent(c.getAttribute("data-bottleneck")).replace(/_/g, " ");

    this.tooltipEl.innerHTML = `
      <div class="font-bold text-slate-100 text-xs">${name}</div>
      <div class="text-[10px] text-slate-400 font-mono mt-0.5">${id} • ${ministry}</div>
      <div class="mt-2 pt-2 border-t border-slate-700/80 grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
        <div>Outlay: <span class="font-mono text-slate-200">₹${cost} Cr</span></div>
        <div>Overrun: <span class="font-mono text-red-300">₹${overrun} Cr</span></div>
        <div>Risk Score: <span class="font-bold text-amber-300">${risk}/100</span></div>
        <div>Tier: <span class="font-semibold text-slate-200">${rClass}</span></div>
      </div>
      <div class="mt-1.5 text-[10px] text-slate-400">Bottleneck: <span class="text-slate-200 capitalize font-medium">${bottleneck}</span></div>
      <div class="mt-2 text-[10px] text-blue-400 font-medium">Click circle to open project dossier ↗</div>
    `;
    this.tooltipEl.classList.remove("hidden");
    this.positionTooltip(e);
  },

  positionTooltip(e) {
    if (!this.tooltipEl) return;
    const container = document.querySelector(".matrix-container");
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left + 14;
    const y = e.clientY - rect.top - 20;

    this.tooltipEl.style.left = `${Math.min(x, rect.width - 260)}px`;
    this.tooltipEl.style.top = `${Math.max(10, Math.min(y, rect.height - 150))}px`;
  },

  hideTooltip() {
    if (this.tooltipEl) this.tooltipEl.classList.add("hidden");
  },

  renderCriticalTable() {
    const tbody = document.getElementById("matrix-table-tbody");
    const tableCount = document.getElementById("matrix-table-count");
    if (!tbody) return;

    // Filter for Quadrant 1 (Risk >= 60 AND Outlay >= 4,000 Cr)
    const q1Projects = this.filteredData
      .filter(p => (p.overall_risk_score || 0) >= 60 && (p.revised_cost_cr || 0) >= 4000)
      .sort((a, b) => (b.revised_cost_cr || 0) - (a.revised_cost_cr || 0));

    if (tableCount) tableCount.innerText = `${q1Projects.length} critical megaprojects`;

    if (q1Projects.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="p-8 text-center text-slate-400 text-xs">
            No megaprojects in Quadrant I under the current filter selection.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = q1Projects.slice(0, 10).map(p => `
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
          <div class="font-mono font-semibold text-slate-900 text-xs">₹${Number(p.revised_cost_cr || 0).toLocaleString("en-IN")} Cr</div>
        </td>
        <td>
          <div class="font-mono font-medium text-red-700 text-xs">+₹${Number(p.cost_overrun_cr || 0).toLocaleString("en-IN")} Cr</div>
        </td>
        <td>
          <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800 border border-red-200">
            <span class="w-1.5 h-1.5 rounded-full bg-red-600"></span>
            ${(p.overall_risk_score || 0).toFixed(1)}
          </span>
        </td>
        <td>
          <span class="text-xs text-slate-600 capitalize">${(p.primary_bottleneck || 'Land Acquisition').replace(/_/g, ' ')}</span>
        </td>
        <td class="text-right">
          <a href="#/projects/${p.project_id}" class="btn btn-secondary btn-sm">
            Inspect ↗
          </a>
        </td>
      </tr>
    `).join("");
  }
};

window.PortfolioMatrixView = PortfolioMatrixView;
