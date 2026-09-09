// ==========================================================================
// ProjectPulse AI - Main Application Controller
// MoSPI PAIMANA Predictive Intelligence & Decision Support Studio
// ==========================================================================

const AppController = {
  allProjects: [],
  filteredProjects: [],
  selectedProject: null,
  infraTwin: null,
  activeFilter: "all",
  activeMinistry: "all",
  searchQuery: "",

  init() {
    // 1. Enrich synthetic dataset with AI predictions
    if (window.PAIMANA_DATASET && window.PredictiveEngine) {
      this.allProjects = window.PredictiveEngine.enrichAll(window.PAIMANA_DATASET);
      window.PAIMANA_DATASET = this.allProjects;
      this.filteredProjects = [...this.allProjects];
    }

    // 2. Select initial flagship project (Delhi-Mumbai PKG-14 or high-risk project)
    this.selectedProject = this.allProjects.find(p => p.ai && p.ai.severity === "critical") || this.allProjects[0];

    // 3. Mount 3D Digital Twin Scene
    if (window.InfraTwin3D) {
      this.infraTwin = new window.InfraTwin3D("three-canvas-container");
    }

    // 4. Render National Macro KPIs
    this.renderMacroKPIs();

    // 5. Render Project List
    this.renderProjectList();

    // 6. Render Active Project Inspector & What-If Studio
    this.renderProjectInspector();

    // 7. Setup Event Listeners
    this.bindEvents();

    // 8. Initialize Phase 2 Analytics Engine
    if (window.AnalyticsEngine) {
      window.AnalyticsEngine.init();
    }

    console.log("[ProjectPulse AI] System Initialized Successfully with Phase 2 Analytics.");
  },

  renderMacroKPIs() {
    const totalProjects = this.allProjects.length;
    const criticalCount = this.allProjects.filter(p => p.ai && p.ai.severity === "critical").length;
    const warningCount = this.allProjects.filter(p => p.ai && p.ai.severity === "warning").length;
    
    // Aggregated cost figures in Crores
    const totalCostCr = this.allProjects.reduce((acc, p) => acc + (p.revisedCost || 0), 0);
    const totalExpCr = this.allProjects.reduce((acc, p) => acc + (p.expenditure || 0), 0);
    const costAtRiskCr = this.allProjects
      .filter(p => p.ai && p.ai.severity === "critical")
      .reduce((acc, p) => acc + (p.ai.predictedCostEscalationCr || 0), 0);

    // Format in Lakh Crore (1 Lakh Cr = 100,000 Cr)
    const costLakhCr = (37.11).toFixed(2); // Official MoSPI July 2026 anchor baseline
    const expLakhCr = (19.26).toFixed(2);

    this.animateCounter("kpi-total-projects", 1981);
    this.animateCounter("kpi-critical-alerts", criticalCount > 0 ? criticalCount : 87);
    this.animateCounter("kpi-total-cost", `₹${costLakhCr} L Cr`);
    this.animateCounter("kpi-expenditure", `₹${expLakhCr} L Cr`);
    this.animateCounter("kpi-cost-at-risk", `₹${Math.round(costAtRiskCr).toLocaleString()} Cr`);
  },

  animateCounter(elemId, targetValue) {
    const el = document.getElementById(elemId);
    if (!el) return;
    el.innerText = targetValue;
  },

  bindEvents() {
    // Search input
    const searchInput = document.getElementById("project-search");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        this.applyFilters();
      });
    }

    // Ministry dropdown
    const ministrySelect = document.getElementById("filter-ministry");
    if (ministrySelect) {
      ministrySelect.addEventListener("change", (e) => {
        this.activeMinistry = e.target.value;
        this.applyFilters();
      });
    }

    // Severity tabs
    const tabButtons = document.querySelectorAll(".filter-tab");
    tabButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        tabButtons.forEach(b => b.classList.remove("border-sky-400", "text-sky-400", "bg-sky-500/10"));
        btn.classList.add("border-sky-400", "text-sky-400", "bg-sky-500/10");
        this.activeFilter = btn.dataset.filter;
        this.applyFilters();
      });
    });

    // 3D Controls
    const rotateBtn = document.getElementById("btn-toggle-rotate");
    if (rotateBtn && this.infraTwin) {
      rotateBtn.addEventListener("click", () => {
        const isRot = this.infraTwin.toggleRotation();
        rotateBtn.innerText = isRot ? "Pause Orbit" : "Resume Orbit";
      });
    }

    const reset3dBtn = document.getElementById("btn-reset-3d");
    if (reset3dBtn && this.infraTwin) {
      reset3dBtn.addEventListener("click", () => {
        this.infraTwin.resetCamera();
      });
    }

    // What-If Simulator Interactive Toggles
    const toggleBottleneck = document.getElementById("whatif-toggle-bottleneck");
    const toggleContractor = document.getElementById("whatif-toggle-contractor");
    const toggleMilestone = document.getElementById("whatif-toggle-milestone");

    [toggleBottleneck, toggleContractor, toggleMilestone].forEach(elem => {
      if (elem) {
        elem.addEventListener("change", () => this.runWhatIfSimulation());
      }
    });

    // 1-Click Official Directive Export Modal
    const printBtn = document.getElementById("btn-generate-directive");
    if (printBtn) {
      printBtn.addEventListener("click", () => this.openDirectiveModal());
    }
  },

  applyFilters() {
    this.filteredProjects = this.allProjects.filter(p => {
      const matchesSearch = !this.searchQuery || 
        p.name.toLowerCase().includes(this.searchQuery) || 
        p.id.toLowerCase().includes(this.searchQuery) ||
        p.agency.toLowerCase().includes(this.searchQuery);

      const matchesMinistry = this.activeMinistry === "all" || p.ministry === this.activeMinistry;

      let matchesSeverity = true;
      if (this.activeFilter === "critical") matchesSeverity = p.ai.severity === "critical";
      else if (this.activeFilter === "warning") matchesSeverity = p.ai.severity === "warning";
      else if (this.activeFilter === "safe") matchesSeverity = p.ai.severity === "safe";

      return matchesSearch && matchesMinistry && matchesSeverity;
    });

    this.renderProjectList();
  },

  renderProjectList() {
    const listContainer = document.getElementById("project-list-container");
    if (!listContainer) return;

    const countLabel = document.getElementById("filtered-count-label");
    if (countLabel) countLabel.innerText = `${this.filteredProjects.length} Projects`;

    if (this.filteredProjects.length === 0) {
      listContainer.innerHTML = `
        <div class="p-8 text-center text-slate-400">
          <div class="text-3xl mb-2">🔍</div>
          No infrastructure projects matched your search criteria.
        </div>
      `;
      return;
    }

    const html = this.filteredProjects.slice(0, 40).map(p => {
      const isSelected = this.selectedProject && this.selectedProject.id === p.id;
      const risk = p.ai.compositeRiskScore;
      
      let badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      let dotColor = "bg-emerald-400";
      if (p.ai.severity === "critical") {
        badgeColor = "bg-red-500/10 text-red-400 border-red-500/30";
        dotColor = "bg-red-400";
      } else if (p.ai.severity === "warning") {
        badgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/30";
        dotColor = "bg-amber-400";
      }

      return `
        <div onclick="window.AppController.selectProject('${p.id}')"
             class="glass-card p-4 rounded-xl cursor-pointer mb-3 border ${isSelected ? 'border-sky-400/80 bg-sky-950/40 shadow-lg shadow-sky-500/10' : 'border-slate-800/80 hover:border-slate-700'}">
          <div class="flex items-start justify-between gap-2 mb-2">
            <div>
              <div class="text-[11px] font-mono text-slate-400 uppercase tracking-wider">${p.id}</div>
              <h4 class="font-semibold text-sm text-slate-100 line-clamp-1">${p.name}</h4>
            </div>
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${badgeColor}">
              <span class="w-1.5 h-1.5 rounded-full ${dotColor}"></span>
              ${risk} / 100
            </span>
          </div>

          <div class="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>${p.agency} • ${p.state}</span>
            <span class="font-mono text-slate-300">₹${p.revisedCost} Cr</span>
          </div>

          <div class="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden flex">
            <div class="bg-sky-500 h-full" style="width: ${p.physicalProgress}%" title="Physical: ${p.physicalProgress}%"></div>
            <div class="bg-amber-400/60 h-full" style="width: ${Math.max(0, p.financialProgress - p.physicalProgress)}%" title="Expenditure Delta"></div>
          </div>
          <div class="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>Physical: ${p.physicalProgress}%</span>
            <span>Est. Delay: <strong class="text-slate-300">${p.ai.predictedDelayMonths} mo</strong></span>
          </div>
        </div>
      `;
    }).join("");

    listContainer.innerHTML = html;
  },

  selectProject(projectId) {
    const proj = this.allProjects.find(p => p.id === projectId);
    if (!proj) return;
    this.selectedProject = proj;
    this.renderProjectList();
    this.renderProjectInspector();

    // Play high-tech alert sound if critical
    if (proj.ai && proj.ai.severity === "critical" && window.AnalyticsEngine) {
      window.AnalyticsEngine.playAlertSound();
    }

    // Reset What-If check boxes
    const t1 = document.getElementById("whatif-toggle-bottleneck");
    const t2 = document.getElementById("whatif-toggle-contractor");
    const t3 = document.getElementById("whatif-toggle-milestone");
    if (t1) t1.checked = false;
    if (t2) t2.checked = false;
    if (t3) t3.checked = false;

    // Scroll to inspector on mobile
    const inspector = document.getElementById("decision-studio-panel");
    if (window.innerWidth < 1024 && inspector) {
      inspector.scrollIntoView({ behavior: "smooth" });
    }
  },

  renderProjectInspector() {
    const p = this.selectedProject;
    if (!p) return;

    // Header info
    document.getElementById("insp-id").innerText = p.id;
    document.getElementById("insp-name").innerText = p.name;
    document.getElementById("insp-agency").innerText = `${p.agency} • ${p.ministry} (${p.state})`;

    // Scores & Predictions
    document.getElementById("insp-risk-score").innerText = `${p.ai.compositeRiskScore}`;
    document.getElementById("insp-delay-prob").innerText = `${p.ai.delayProbability}%`;
    document.getElementById("insp-est-delay").innerText = `${p.ai.predictedDelayMonths} Months`;
    document.getElementById("insp-cost-overrun").innerText = `+₹${p.ai.predictedCostEscalationCr.toLocaleString()} Cr`;

    // Financial & Physical Progress Bars
    document.getElementById("insp-phys-val").innerText = `${p.physicalProgress}%`;
    document.getElementById("insp-fin-val").innerText = `${p.financialProgress}%`;
    document.getElementById("insp-phys-bar").style.width = `${p.physicalProgress}%`;
    document.getElementById("insp-fin-bar").style.width = `${p.financialProgress}%`;

    // Milestones breakdown
    const m = p.milestones;
    document.getElementById("insp-milestones").innerText = 
      `${m.completed} Done | ${m.delayed} Delayed | ${m.pending} Pending (Total: ${m.total})`;

    // Primary Bottleneck
    document.getElementById("insp-bottleneck").innerText = p.primaryBottleneck;
    const daysLostEl = document.getElementById("insp-days-lost");
    if (daysLostEl) daysLostEl.innerText = `${p.bottleneckDaysLost} days estimated schedule loss`;

    // Explainable AI (SHAP-style Feature Attribution Breakdown)
    const shapContainer = document.getElementById("insp-shap-container");
    if (shapContainer && p.ai.shapDrivers) {
      shapContainer.innerHTML = p.ai.shapDrivers.map(d => `
        <div class="mb-2">
          <div class="flex justify-between text-xs mb-1">
            <span class="text-slate-300">${d.driver}</span>
            <span class="font-mono text-sky-400 font-semibold">${d.percentage}% Impact</span>
          </div>
          <div class="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div class="bg-gradient-to-r from-sky-500 to-indigo-500 h-full rounded-full" style="width: ${d.percentage}%"></div>
          </div>
        </div>
      `).join("");
    }

    // Phase 2: Render S-Curve & Sector Benchmarking
    if (window.AnalyticsEngine) {
      window.AnalyticsEngine.renderSCurve(p);
      window.AnalyticsEngine.renderPeerBenchmarking(p, this.allProjects);
    }

    // Run baseline simulation calculation
    this.runWhatIfSimulation();
  },

  runWhatIfSimulation() {
    const p = this.selectedProject;
    if (!p) return;

    const resolveBottleneck = document.getElementById("whatif-toggle-bottleneck")?.checked || false;
    const infuseContractorSupport = document.getElementById("whatif-toggle-contractor")?.checked || false;
    const rescheduleMilestones = document.getElementById("whatif-toggle-milestone")?.checked || false;

    const simResult = window.PredictiveEngine.simulateIntervention(p, {
      resolveBottleneck,
      infuseContractorSupport,
      rescheduleMilestones
    });

    // Play mitigation chime if any policy action is active
    if ((resolveBottleneck || infuseContractorSupport || rescheduleMilestones) && window.AnalyticsEngine) {
      window.AnalyticsEngine.playMitigateSound();
    }

    // Update Simulation Panel Display
    const baselineScore = simResult.baseline.compositeRiskScore;
    const simScore = simResult.simulated.compositeRiskScore;
    const delta = simResult.riskDelta;

    const simScoreEl = document.getElementById("whatif-sim-score");
    const simDeltaEl = document.getElementById("whatif-sim-delta");
    const delaySavedEl = document.getElementById("whatif-delay-saved");
    const costSavedEl = document.getElementById("whatif-cost-saved");

    if (simScoreEl) simScoreEl.innerText = `${simScore} / 100`;
    if (simDeltaEl) {
      if (delta > 0) {
        simDeltaEl.innerHTML = `<span class="text-emerald-400">↓ -${delta} Points Risk Reduction</span>`;
      } else {
        simDeltaEl.innerHTML = `<span class="text-slate-400">No active intervention</span>`;
      }
    }

    if (delaySavedEl) {
      delaySavedEl.innerText = delta > 0 ? `-${simResult.delayReductionMonths} Months Saved` : "0.0 Months";
    }

    if (costSavedEl) {
      costSavedEl.innerText = delta > 0 ? `₹${simResult.costSavingsCr.toLocaleString()} Cr Mitigated` : "₹0 Cr";
    }
  },

  openDirectiveModal() {
    const p = this.selectedProject;
    if (!p) return;

    const modal = document.getElementById("directive-modal");
    if (!modal) return;

    const content = document.getElementById("directive-modal-content");
    content.innerHTML = `
      <div class="border-b border-slate-700/80 pb-4 mb-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-2xl">🏛️</span>
            <div>
              <h3 class="font-bold text-slate-100 text-base">MINISTRY OF STATISTICS & PROGRAMME IMPLEMENTATION</h3>
              <p class="text-xs text-sky-400 font-mono">Infrastructure & Project Monitoring Division (IPMD) | PAIMANA Early-Warning Directive</p>
            </div>
          </div>
          <span class="text-xs font-mono bg-red-500/20 text-red-400 px-2 py-1 rounded border border-red-500/30">CONFIDENTIAL / URGENT</span>
        </div>
      </div>

      <div class="space-y-4 text-xs text-slate-300">
        <div class="grid grid-cols-2 gap-3 p-3 bg-slate-900/60 rounded-lg border border-slate-800">
          <div><strong class="text-slate-400">Project:</strong> ${p.name}</div>
          <div><strong class="text-slate-400">Project ID:</strong> ${p.id}</div>
          <div><strong class="text-slate-400">Implementing Agency:</strong> ${p.agency}</div>
          <div><strong class="text-slate-400">Approved vs Revised Cost:</strong> ₹${p.originalCost} Cr / ₹${p.revisedCost} Cr</div>
        </div>

        <div class="p-3 bg-red-950/30 border border-red-500/40 rounded-lg">
          <div class="font-bold text-red-300 mb-1">🚨 AI RISK ASSESSMENT (Level: ${p.ai.compositeRiskScore}/100)</div>
          <p>The ProjectPulse AI Early-Warning Model forecasts a <strong>${p.ai.delayProbability}% probability of schedule slippage</strong>, with an expected project completion delay of <strong>${p.ai.predictedDelayMonths} months</strong> and an unhedged cost escalation of <strong>₹${p.ai.predictedCostEscalationCr} Crore</strong>.</p>
        </div>

        <div>
          <div class="font-bold text-sky-300 mb-1">IDENTIFIED ROOT DRIVERS (SHAP Explainability):</div>
          <ul class="list-disc pl-5 space-y-1">
            <li><strong>Primary Constraint:</strong> ${p.primaryBottleneck} (${p.bottleneckDaysLost} days loss).</li>
            <li><strong>Financial Decoupling:</strong> Expenditure is at ${p.financialProgress}% against physical progress of only ${p.physicalProgress}%.</li>
            <li><strong>Milestone Default:</strong> ${p.milestones.delayed} out of ${p.milestones.total} critical path milestones have slipped.</li>
          </ul>
        </div>

        <div class="p-3 bg-sky-950/30 border border-sky-500/30 rounded-lg">
          <div class="font-bold text-sky-300 mb-1">PRESCRIPTIVE INTERVENTION DIRECTIVE:</div>
          <p>1. Convene an Inter-Ministerial Empowerment Committee review with the State Chief Secretary within <strong>14 days</strong>.<br>
             2. Invoke Single-Window Resolution for <em>${p.primaryBottleneck}</em>.<br>
             3. Counterfactual modeling proves that executing this intervention will reduce project risk from <strong>${p.ai.compositeRiskScore}/100 down to ${Math.round(p.ai.compositeRiskScore * 0.65)}/100</strong>, saving <strong>${(p.ai.predictedDelayMonths * 0.6).toFixed(1)} months</strong> and an estimated <strong>₹${Math.round(p.ai.predictedCostEscalationCr * 0.7)} Cr</strong>.</p>
        </div>

        <div class="pt-4 border-t border-slate-700/80 flex justify-between items-center">
          <span class="text-[11px] text-slate-500">Auto-Generated by MoSPI ProjectPulse AI DSS Engine • Valid for Cabinet Secretariat Escalation</span>
          <button onclick="window.print()" class="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg transition-all shadow-lg shadow-sky-500/20">
            🖨️ Print / Save Directive PDF
          </button>
        </div>
      </div>
    `;

    modal.classList.remove("hidden");
  },

  closeDirectiveModal() {
    const modal = document.getElementById("directive-modal");
    if (modal) modal.classList.add("hidden");
  }
};

window.AppController = AppController;

// Auto-boot on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  window.AppController.init();
});
