// ==========================================================================
// ProjectPulse AI - Deep Analytics, S-Curve & Sector Benchmarking Module
// Integrates Chart.js for Planned vs Actual S-Curves and Peer Benchmarking
// ==========================================================================

const AnalyticsEngine = {
  sCurveChart: null,
  sectorChart: null,
  audioCtx: null,
  soundEnabled: false,

  init() {
    this.initAudio();
    this.bindEvents();
    console.log("[AnalyticsEngine] Initialized Phase 2 Visual Analytics.");
  },

  // Web Audio API Synthesizer for High-Tech Sound FX
  initAudio() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    } catch (e) {
      console.warn("Web Audio API not supported in this environment.", e);
    }
  },

  playBlip(freq = 440, type = "sine", duration = 0.08) {
    if (!this.soundEnabled || !this.audioCtx) return;
    try {
      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {}
  },

  playAlertSound() {
    this.playBlip(880, "triangle", 0.12);
    setTimeout(() => this.playBlip(440, "triangle", 0.18), 100);
  },

  playMitigateSound() {
    this.playBlip(523.25, "sine", 0.08);
    setTimeout(() => this.playBlip(659.25, "sine", 0.08), 80);
    setTimeout(() => this.playBlip(783.99, "sine", 0.15), 160);
  },

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    const btn = document.getElementById("btn-toggle-sound");
    if (btn) {
      btn.innerHTML = this.soundEnabled ? "🔊 Sound: ON" : "🔇 Sound: OFF";
      btn.className = this.soundEnabled 
        ? "px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-400/40 text-xs transition" 
        : "px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 text-xs transition";
    }
    if (this.soundEnabled) this.playMitigateSound();
    return this.soundEnabled;
  },

  bindEvents() {
    const soundBtn = document.getElementById("btn-toggle-sound");
    if (soundBtn) {
      soundBtn.addEventListener("click", () => this.toggleSound());
    }

    // View tab switching (Project View vs Sector Analytics View)
    const viewTabs = document.querySelectorAll(".view-switch-tab");
    viewTabs.forEach(tab => {
      tab.addEventListener("click", () => {
        viewTabs.forEach(t => t.classList.remove("border-sky-400", "text-sky-400", "bg-sky-500/10"));
        tab.classList.add("border-sky-400", "text-sky-400", "bg-sky-500/10");
        this.switchView(tab.dataset.view);
      });
    });
  },

  switchView(viewMode) {
    const projectView = document.getElementById("view-project-details");
    const sectorView = document.getElementById("view-sector-analytics");

    if (viewMode === "sector") {
      if (projectView) projectView.classList.add("hidden");
      if (sectorView) sectorView.classList.remove("hidden");
      this.renderSectorDistribution();
    } else {
      if (sectorView) sectorView.classList.add("hidden");
      if (projectView) projectView.classList.remove("hidden");
    }
  },

  // Renders the Planned vs Actual S-Curve with decoupling visualization
  renderSCurve(project) {
    const canvas = document.getElementById("scurve-chart-canvas");
    if (!canvas || typeof Chart === "undefined") return;

    const ctx = canvas.getContext("2d");

    // Generate timeline months (e.g. Month 0 to Month 36)
    const labels = ["M0", "M6", "M12", "M18", "M24", "M30", "M36 (Target)", "M42", "M48"];
    
    // Ideal S-curve trajectory
    const plannedPhysical = [0, 8, 22, 45, 72, 90, 100, 100, 100];

    // Actual physical trajectory based on current progress
    const currentPhys = project.physicalProgress || 50;
    const currentFin = project.financialProgress || 60;
    const delayMos = (project.ai && project.ai.predictedDelayMonths) || 6;

    // Construct curve points leading up to current state (around M24) and projected future
    const actualPhysical = [
      0,
      Math.round(8 * 0.9),
      Math.round(22 * 0.8),
      Math.round(45 * (currentPhys / 55)),
      currentPhys,
      Math.min(100, Math.round(currentPhys + (100 - currentPhys) * 0.35)),
      Math.min(100, Math.round(currentPhys + (100 - currentPhys) * 0.65)),
      Math.min(100, Math.round(currentPhys + (100 - currentPhys) * 0.88)),
      100
    ];

    // Financial Expenditure Curve (often decoupled and running ahead)
    const financialCurve = [
      0,
      Math.round(12),
      Math.round(28),
      Math.round(52 * (currentFin / 60)),
      currentFin,
      Math.min(100, Math.round(currentFin + (100 - currentFin) * 0.45)),
      Math.min(100, Math.round(currentFin + (100 - currentFin) * 0.78)),
      Math.min(100, Math.round(currentFin + (100 - currentFin) * 0.95)),
      100
    ];

    if (this.sCurveChart) {
      this.sCurveChart.destroy();
    }

    this.sCurveChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Planned Baseline (S-Curve)",
            data: plannedPhysical,
            borderColor: "rgba(56, 189, 248, 0.8)",
            backgroundColor: "transparent",
            borderDash: [5, 5],
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 2
          },
          {
            label: "Actual Construction Progress",
            data: actualPhysical,
            borderColor: "#38bdf8",
            backgroundColor: "rgba(56, 189, 248, 0.15)",
            borderWidth: 3,
            fill: true,
            tension: 0.35,
            pointRadius: 3,
            pointBackgroundColor: "#38bdf8"
          },
          {
            label: "Financial Expenditure Incurred",
            data: financialCurve,
            borderColor: "#f59e0b",
            backgroundColor: "rgba(245, 158, 11, 0.08)",
            borderWidth: 2.5,
            tension: 0.35,
            pointRadius: 3,
            pointBackgroundColor: "#f59e0b"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false
        },
        plugins: {
          legend: {
            position: "top",
            labels: {
              color: "#94a3b8",
              font: { size: 10, family: "Plus Jakarta Sans" },
              boxWidth: 12
            }
          },
          tooltip: {
            backgroundColor: "rgba(15, 23, 42, 0.9)",
            borderColor: "rgba(56, 189, 248, 0.3)",
            borderWidth: 1,
            titleFont: { size: 11 },
            bodyFont: { size: 10 },
            callbacks: {
              label: (context) => ` ${context.dataset.label}: ${context.parsed.y}%`
            }
          }
        },
        scales: {
          x: {
            grid: { color: "rgba(255, 255, 255, 0.04)" },
            ticks: { color: "#64748b", font: { size: 9, family: "JetBrains Mono" } }
          },
          y: {
            min: 0,
            max: 100,
            grid: { color: "rgba(255, 255, 255, 0.04)" },
            ticks: {
              color: "#64748b",
              font: { size: 9, family: "JetBrains Mono" },
              callback: (val) => `${val}%`
            }
          }
        }
      }
    });
  },

  // Computes and renders Peer Project Sector Benchmarking
  renderPeerBenchmarking(project, allProjects) {
    const container = document.getElementById("peer-benchmark-container");
    if (!container) return;

    // Filter peers in same ministry or sector
    const peers = allProjects.filter(p => p.ministry === project.ministry && p.id !== project.id);
    const peerCount = peers.length || 1;

    // Calculate peer averages
    const avgRisk = Math.round(peers.reduce((acc, p) => acc + (p.ai ? p.ai.compositeRiskScore : 50), 0) / peerCount);
    const avgDelayMonths = parseFloat((peers.reduce((acc, p) => acc + (p.ai ? p.ai.predictedDelayMonths : 5), 0) / peerCount).toFixed(1));
    const avgPhysicalProgress = Math.round(peers.reduce((acc, p) => acc + (p.physicalProgress || 50), 0) / peerCount);

    const projRisk = project.ai ? project.ai.compositeRiskScore : 50;
    const projDelay = project.ai ? project.ai.predictedDelayMonths : 6;
    const projPhys = project.physicalProgress || 50;

    const riskVariance = projRisk - avgRisk;
    const delayVariance = parseFloat((projDelay - avgDelayMonths).toFixed(1));
    const physVariance = projPhys - avgPhysicalProgress;

    const riskBadge = riskVariance > 10 
      ? `<span class="text-red-400 font-bold">▲ +${riskVariance} pts worse than peers</span>`
      : riskVariance < -5 
        ? `<span class="text-emerald-400 font-bold">▼ ${Math.abs(riskVariance)} pts better than peers</span>`
        : `<span class="text-amber-400 font-medium">≈ Matches sector average</span>`;

    container.innerHTML = `
      <div class="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3 text-xs">
        <div class="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <div>
            <div class="font-bold text-slate-200">Sector Peer Comparison: ${project.sector}</div>
            <div class="text-[10px] text-slate-400">Benchmark baseline: ${peers.length} active projects in ${project.agency} / ${project.ministry}</div>
          </div>
          <div class="text-right text-[11px]">
            ${riskBadge}
          </div>
        </div>

        <div class="grid grid-cols-3 gap-2 text-center">
          <div class="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
            <div class="text-[10px] text-slate-400">Project Risk vs Avg</div>
            <div class="font-mono font-bold text-sm text-slate-200 mt-0.5">
              ${projRisk} <span class="text-xs text-slate-500 font-normal">/ Avg ${avgRisk}</span>
            </div>
          </div>

          <div class="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
            <div class="text-[10px] text-slate-400">Est. Delay vs Avg</div>
            <div class="font-mono font-bold text-sm ${delayVariance > 2 ? 'text-red-400' : 'text-slate-200'} mt-0.5">
              ${projDelay}m <span class="text-xs text-slate-500 font-normal">/ Avg ${avgDelayMonths}m</span>
            </div>
          </div>

          <div class="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
            <div class="text-[10px] text-slate-400">Physical Velocity</div>
            <div class="font-mono font-bold text-sm ${physVariance < 0 ? 'text-amber-400' : 'text-emerald-400'} mt-0.5">
              ${projPhys}% <span class="text-xs text-slate-500 font-normal">/ Avg ${avgPhysicalProgress}%</span>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // Renders Sector Distribution & Bottleneck Frequencies in the Analytics Tab
  renderSectorDistribution() {
    const canvas = document.getElementById("sector-chart-canvas");
    if (!canvas || typeof Chart === "undefined" || !window.PAIMANA_DATASET) return;

    const ctx = canvas.getContext("2d");

    // Compute distribution
    const counts = {
      "Roads & Highways (MoRTH)": 0,
      "Railways & Logistics": 0,
      "Power & Energy": 0,
      "Petroleum & Pipelines": 0,
      "Urban Transit / Metro": 0,
      "Civil Aviation": 0,
      "Health & Social Infra": 0
    };

    window.PAIMANA_DATASET.forEach(p => {
      const sec = p.sector || "Other";
      if (sec.includes("Road")) counts["Roads & Highways (MoRTH)"]++;
      else if (sec.includes("Rail")) counts["Railways & Logistics"]++;
      else if (sec.includes("Power") || sec.includes("Energy")) counts["Power & Energy"]++;
      else if (sec.includes("Pipe") || sec.includes("Petro")) counts["Petroleum & Pipelines"]++;
      else if (sec.includes("Transit") || sec.includes("Urban")) counts["Urban Transit / Metro"]++;
      else if (sec.includes("Aviation") || sec.includes("Airport")) counts["Civil Aviation"]++;
      else counts["Health & Social Infra"]++;
    });

    if (this.sectorChart) {
      this.sectorChart.destroy();
    }

    this.sectorChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: Object.keys(counts),
        datasets: [
          {
            data: Object.values(counts),
            backgroundColor: [
              "#38bdf8",
              "#6366f1",
              "#f59e0b",
              "#10b981",
              "#ec4899",
              "#8b5cf6",
              "#06b6d4"
            ],
            borderColor: "#090d16",
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
            labels: {
              color: "#94a3b8",
              font: { size: 10, family: "Plus Jakarta Sans" },
              boxWidth: 12
            }
          },
          tooltip: {
            backgroundColor: "rgba(15, 23, 42, 0.9)",
            borderColor: "rgba(56, 189, 248, 0.3)",
            borderWidth: 1
          }
        },
        cutout: "68%"
      }
    });
  }
};

window.AnalyticsEngine = AnalyticsEngine;
