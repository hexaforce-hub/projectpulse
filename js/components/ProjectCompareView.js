// ==========================================================================
// PROJECTPULSE — Project Comparison Matrix Component (Phase 9.5)
// Route: /compare
// Ministry of Statistics & Programme Implementation (MoSPI) - IPMD / PAIMANA
// Smart India Hackathon 2026 — Team HexaForce
// ==========================================================================

const ProjectCompareView = {
  projectIds: ["PRJ-DEMO-001", "PRJ-DEMO-002"],
  loadedProjects: [],
  catalog: [],
  chartInstance: null,

  render() {
    return `
      <div class="max-w-[1440px] mx-auto space-y-6">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-[11px] font-bold uppercase tracking-wider text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                Benchmarking Suite
              </span>
              <span class="text-caption text-slate-400">•</span>
              <span class="text-caption text-slate-500 font-medium">Multi-Project Comparative Risk Intelligence</span>
            </div>
            <h1 class="text-page-title mt-1">Project Peer Benchmarking Matrix</h1>
            <p class="text-caption text-slate-500 mt-0.5">
              Side-by-side comparative analysis of cost overrun velocity, milestone slippage, decoupling gaps, and risk distributions.
            </p>
          </div>
          <div class="flex items-center gap-2">
            <button id="compare-btn-swap" class="btn btn-secondary btn-sm" title="Swap Slot A and Slot B">
              ⇄ Swap Projects
            </button>
          </div>
        </div>

        <!-- Project Selector Ribbon -->
        <div class="gov-card p-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-bold text-slate-700 block mb-1.5 flex items-center justify-between">
                <span>Slot A (Primary Project)</span>
                <span class="text-[10px] text-blue-700 font-mono" id="compare-label-a">PRJ-DEMO-001</span>
              </label>
              <select id="compare-select-a" class="gov-select text-xs">
                <option value="PRJ-DEMO-001">PRJ-DEMO-001: NH-44 Strategic Corridor Development Project</option>
                <option value="PRJ-DEMO-002">PRJ-DEMO-002: Eastern Dedicated Freight Corridor (EDFC-II)</option>
                <option value="PRJ-DEMO-003">PRJ-DEMO-003: Mumbai Metro Line 3 Underground Corridor</option>
                <option value="PRJ-DEMO-004">PRJ-DEMO-004: Dibrugarh Multi-Modal Logistics Park</option>
                <option value="PRJ-DEMO-005">PRJ-DEMO-005: AIIMS Madurai Healthcare Infrastructure Complex</option>
              </select>
            </div>

            <div>
              <label class="text-xs font-bold text-slate-700 block mb-1.5 flex items-center justify-between">
                <span>Slot B (Benchmark Project)</span>
                <span class="text-[10px] text-indigo-700 font-mono" id="compare-label-b">PRJ-DEMO-002</span>
              </label>
              <select id="compare-select-b" class="gov-select text-xs">
                <option value="PRJ-DEMO-002" selected>PRJ-DEMO-002: Eastern Dedicated Freight Corridor (EDFC-II)</option>
                <option value="PRJ-DEMO-001">PRJ-DEMO-001: NH-44 Strategic Corridor Development Project</option>
                <option value="PRJ-DEMO-003">PRJ-DEMO-003: Mumbai Metro Line 3 Underground Corridor</option>
                <option value="PRJ-DEMO-004">PRJ-DEMO-004: Dibrugarh Multi-Modal Logistics Park</option>
                <option value="PRJ-DEMO-005">PRJ-DEMO-005: AIIMS Madurai Healthcare Infrastructure Complex</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Comparative Metric Radar / Bar Chart -->
        <div class="gov-card p-4">
          <div class="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <div>
              <h3 class="text-card-title">Comparative Execution Health Metric Profile</h3>
              <p class="text-caption text-slate-500">Normalized performance comparison across key risk, cost, schedule, and governance vectors.</p>
            </div>
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Normalized Scale</span>
          </div>

          <div class="h-64 w-full relative">
            <canvas id="compare-chart-canvas"></canvas>
          </div>
        </div>

        <!-- Detailed Side-by-Side Comparison Matrix -->
        <div class="gov-card p-0 overflow-hidden">
          <div class="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <h3 class="text-card-title">Side-by-Side Specification & Risk Indicators</h3>
            <span class="text-[11px] text-slate-500">MoSPI PAIMANA Standard Data Fields</span>
          </div>

          <div class="gov-table-container border-0 rounded-none shadow-none">
            <table class="gov-table">
              <thead>
                <tr>
                  <th style="width: 25%;">Analytical Vector</th>
                  <th style="width: 37.5%;" id="compare-th-a">Slot A: NH-44 Corridor</th>
                  <th style="width: 37.5%;" id="compare-th-b">Slot B: EDFC-II</th>
                </tr>
              </thead>
              <tbody id="compare-table-tbody">
                <tr>
                  <td colspan="3" class="p-8 text-center text-slate-400 text-xs">Loading comparison matrix...</td>
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
    await this.loadProjects();
  },

  bindEvents() {
    const selA = document.getElementById("compare-select-a");
    const selB = document.getElementById("compare-select-b");
    const btnSwap = document.getElementById("compare-btn-swap");

    if (selA) {
      selA.value = this.projectIds[0];
      selA.addEventListener("change", async (e) => {
        this.projectIds[0] = e.target.value;
        const lbl = document.getElementById("compare-label-a");
        if (lbl) lbl.innerText = this.projectIds[0];
        await this.loadProjects();
      });
    }

    if (selB) {
      selB.value = this.projectIds[1];
      selB.addEventListener("change", async (e) => {
        this.projectIds[1] = e.target.value;
        const lbl = document.getElementById("compare-label-b");
        if (lbl) lbl.innerText = this.projectIds[1];
        await this.loadProjects();
      });
    }

    if (btnSwap) {
      btnSwap.addEventListener("click", async () => {
        const temp = this.projectIds[0];
        this.projectIds[0] = this.projectIds[1];
        this.projectIds[1] = temp;
        if (selA) selA.value = this.projectIds[0];
        if (selB) selB.value = this.projectIds[1];
        const lblA = document.getElementById("compare-label-a");
        const lblB = document.getElementById("compare-label-b");
        if (lblA) lblA.innerText = this.projectIds[0];
        if (lblB) lblB.innerText = this.projectIds[1];
        await this.loadProjects();
      });
    }
  },

  async loadProjects() {
    try {
      if (window.APIClient) {
        const p1 = await window.APIClient.getProject(this.projectIds[0]);
        const p2 = await window.APIClient.getProject(this.projectIds[1]);
        this.loadedProjects = [p1, p2].filter(Boolean);
      }
    } catch (e) {
      console.warn("[ProjectCompareView] Load projects error:", e);
    }

    if (this.loadedProjects.length < 2) {
      const all = window.MOCK_PROJECTS || [];
      this.loadedProjects = [
        all.find(p => p.project_id === this.projectIds[0]) || all[0],
        all.find(p => p.project_id === this.projectIds[1]) || all[1] || all[0]
      ];
    }

    this.renderComparisonTable();
    this.renderChart();
  },

  renderComparisonTable() {
    const tbody = document.getElementById("compare-table-tbody");
    const thA = document.getElementById("compare-th-a");
    const thB = document.getElementById("compare-th-b");
    if (!tbody || this.loadedProjects.length < 2) return;

    const pA = this.loadedProjects[0];
    const pB = this.loadedProjects[1];

    if (thA) thA.innerText = `${pA.project_id}: ${pA.project_name}`;
    if (thB) thB.innerText = `${pB.project_id}: ${pB.project_name}`;

    const costA = pA.financials ? pA.financials.revised_cost_cr : 0;
    const costB = pB.financials ? pB.financials.revised_cost_cr : 0;

    const origA = pA.financials ? pA.financials.original_cost_cr : costA;
    const origB = pB.financials ? pB.financials.original_cost_cr : costB;

    const overrunA = pA.financials ? pA.financials.cost_overrun_cr : 0;
    const overrunB = pB.financials ? pB.financials.cost_overrun_cr : 0;

    const overrunPctA = origA > 0 ? ((overrunA / origA) * 100).toFixed(1) : 0;
    const overrunPctB = origB > 0 ? ((overrunB / origB) * 100).toFixed(1) : 0;

    const delayA = pA.schedule ? pA.schedule.delay_duration_months : 0;
    const delayB = pB.schedule ? pB.schedule.delay_duration_months : 0;

    const physA = pA.progress ? pA.progress.physical_progress_pct : 0;
    const physB = pB.progress ? pB.progress.physical_progress_pct : 0;

    const finA = pA.progress ? pA.progress.financial_progress_pct : 0;
    const finB = pB.progress ? pB.progress.financial_progress_pct : 0;

    const gapA = pA.progress ? pA.progress.progress_gap_pct : 0;
    const gapB = pB.progress ? pB.progress.progress_gap_pct : 0;

    const riskA = pA.risk ? pA.risk.overall_score : 50;
    const riskB = pB.risk ? pB.risk.overall_score : 50;

    const driverA = pA.risk ? pA.risk.primary_driver : (pA.primary_bottleneck || "Clearance");
    const driverB = pB.risk ? pB.risk.primary_driver : (pB.primary_bottleneck || "Clearance");

    tbody.innerHTML = `
      <tr>
        <td class="font-semibold text-slate-700">Central Ministry</td>
        <td class="text-slate-900">${pA.ministry}</td>
        <td class="text-slate-900">${pB.ministry}</td>
      </tr>
      <tr>
        <td class="font-semibold text-slate-700">Sector & State</td>
        <td>${pA.sector} • <span class="text-slate-500">${pA.state || 'National'}</span></td>
        <td>${pB.sector} • <span class="text-slate-500">${pB.state || 'National'}</span></td>
      </tr>
      <tr>
        <td class="font-semibold text-slate-700">Sanctioned Outlay</td>
        <td class="font-mono font-medium">₹${Number(origA).toLocaleString("en-IN")} Cr</td>
        <td class="font-mono font-medium">₹${Number(origB).toLocaleString("en-IN")} Cr</td>
      </tr>
      <tr>
        <td class="font-semibold text-slate-700">Current Revised Outlay</td>
        <td class="font-mono font-bold text-slate-900">₹${Number(costA).toLocaleString("en-IN")} Cr</td>
        <td class="font-mono font-bold text-slate-900">₹${Number(costB).toLocaleString("en-IN")} Cr</td>
      </tr>
      <tr>
        <td class="font-semibold text-slate-700">Cost Overrun</td>
        <td>
          <span class="font-mono font-semibold ${overrunA > 0 ? 'text-red-700' : 'text-slate-700'}">+₹${Number(overrunA).toLocaleString("en-IN")} Cr</span>
          <span class="text-[11px] text-slate-500 ml-1">(${overrunPctA}%)</span>
        </td>
        <td>
          <span class="font-mono font-semibold ${overrunB > 0 ? 'text-red-700' : 'text-slate-700'}">+₹${Number(overrunB).toLocaleString("en-IN")} Cr</span>
          <span class="text-[11px] text-slate-500 ml-1">(${overrunPctB}%)</span>
        </td>
      </tr>
      <tr>
        <td class="font-semibold text-slate-700">Schedule Slippage</td>
        <td class="font-mono font-semibold text-orange-700">+${delayA} Months</td>
        <td class="font-mono font-semibold text-orange-700">+${delayB} Months</td>
      </tr>
      <tr>
        <td class="font-semibold text-slate-700">Physical vs Financial</td>
        <td>
          <div class="text-xs mb-1">Physical: <strong class="text-slate-900">${physA}%</strong> | Spent: <strong class="text-slate-900">${finA}%</strong></div>
          <div class="decoupling-track">
            <div class="decoupling-physical" style="width: ${physA}%;"></div>
            <div class="decoupling-financial" style="width: ${finA}%;"></div>
          </div>
        </td>
        <td>
          <div class="text-xs mb-1">Physical: <strong class="text-slate-900">${physB}%</strong> | Spent: <strong class="text-slate-900">${finB}%</strong></div>
          <div class="decoupling-track">
            <div class="decoupling-physical" style="width: ${physB}%;"></div>
            <div class="decoupling-financial" style="width: ${finB}%;"></div>
          </div>
        </td>
      </tr>
      <tr>
        <td class="font-semibold text-slate-700">Decoupling Gap</td>
        <td>
          <span class="font-mono font-bold ${gapA > 20 ? 'text-red-700' : 'text-slate-700'}">${gapA}% disparity</span>
          ${gapA > 20 ? '<span class="text-[9px] font-bold bg-red-100 text-red-800 px-1 py-0.2 rounded ml-1">FLAGGED</span>' : ''}
        </td>
        <td>
          <span class="font-mono font-bold ${gapB > 20 ? 'text-red-700' : 'text-slate-700'}">${gapB}% disparity</span>
          ${gapB > 20 ? '<span class="text-[9px] font-bold bg-red-100 text-red-800 px-1 py-0.2 rounded ml-1">FLAGGED</span>' : ''}
        </td>
      </tr>
      <tr>
        <td class="font-semibold text-slate-700">Predictive Risk Tier</td>
        <td>
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
            (pA.risk && pA.risk.level === 'CRITICAL') ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
          }">
            ${pA.risk ? pA.risk.level : 'HIGH'} (${riskA}/100)
          </span>
        </td>
        <td>
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
            (pB.risk && pB.risk.level === 'CRITICAL') ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
          }">
            ${pB.risk ? pB.risk.level : 'HIGH'} (${riskB}/100)
          </span>
        </td>
      </tr>
      <tr>
        <td class="font-semibold text-slate-700">Primary Execution Friction</td>
        <td class="text-xs text-slate-700">${driverA}</td>
        <td class="text-xs text-slate-700">${driverB}</td>
      </tr>
      <tr class="bg-slate-50/50">
        <td class="font-semibold text-slate-700">Intervention Analysis</td>
        <td>
          <a href="#/projects/${pA.project_id}" class="btn btn-secondary btn-sm">
            Inspect Full Dossier ↗
          </a>
        </td>
        <td>
          <a href="#/projects/${pB.project_id}" class="btn btn-secondary btn-sm">
            Inspect Full Dossier ↗
          </a>
        </td>
      </tr>
    `;
  },

  renderChart() {
    const canvas = document.getElementById("compare-chart-canvas");
    if (!canvas || typeof Chart === "undefined" || this.loadedProjects.length < 2) return;

    const pA = this.loadedProjects[0];
    const pB = this.loadedProjects[1];

    const riskA = pA.risk ? pA.risk.overall_score : 50;
    const riskB = pB.risk ? pB.risk.overall_score : 50;

    const delayA = pA.schedule ? pA.schedule.delay_duration_months : 0;
    const delayB = pB.schedule ? pB.schedule.delay_duration_months : 0;

    const gapA = pA.progress ? pA.progress.progress_gap_pct : 0;
    const gapB = pB.progress ? pB.progress.progress_gap_pct : 0;

    const origA = (pA.financials && pA.financials.original_cost_cr) || 1000;
    const origB = (pB.financials && pB.financials.original_cost_cr) || 1000;
    const overrunA = (pA.financials && pA.financials.cost_overrun_cr) || 0;
    const overrunB = (pB.financials && pB.financials.cost_overrun_cr) || 0;
    const overrunPctA = parseFloat(((overrunA / origA) * 100).toFixed(1));
    const overrunPctB = parseFloat(((overrunB / origB) * 100).toFixed(1));

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    this.chartInstance = new Chart(canvas, {
      type: "bar",
      data: {
        labels: ["Composite Risk (0-100)", "Slippage (Months)", "Decoupling Gap (%)", "Cost Overrun (%)"],
        datasets: [
          {
            label: `${pA.project_id}: ${pA.project_name.substring(0, 24)}...`,
            data: [riskA, delayA, gapA, overrunPctA],
            backgroundColor: "#2563eb",
            borderRadius: 4
          },
          {
            label: `${pB.project_id}: ${pB.project_name.substring(0, 24)}...`,
            data: [riskB, delayB, gapB, overrunPctB],
            backgroundColor: "#6366f1",
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: "#f1f5f9" }
          },
          x: {
            grid: { display: false }
          }
        },
        plugins: {
          legend: {
            position: "top",
            labels: { font: { family: "Inter", size: 11 }, boxWidth: 12 }
          },
          tooltip: {
            backgroundColor: "#0f172a",
            titleFont: { size: 12, family: "Inter" },
            bodyFont: { size: 11, family: "Inter" }
          }
        }
      }
    });
  }
};

window.ProjectCompareView = ProjectCompareView;
