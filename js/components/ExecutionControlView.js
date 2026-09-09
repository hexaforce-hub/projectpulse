// ==========================================================================
// PROJECTPULSE — Phase 11: Execution & CPM Control Center
// Ministry of Statistics & Programme Implementation (MoSPI) - IPMD
// Smart India Hackathon 2026 — Team HexaForce
// ==========================================================================

const ExecutionControlView = {
  projectId: "PRJ-SYN-000002",
  timelineData: null,
  planVsActualData: null,
  recoveryData: null,
  workPackages: [],
  tasks: [],
  selectedRecoveryOption: null,
  chartInstance: null,

  async render(container) {
    if (!container) {
      container = document.getElementById("main-content-mount");
    }
    if (!container) return;

    container.innerHTML = `
      <div class="space-y-6 animate-fade-in max-w-7xl mx-auto pb-16">
        <div class="p-12 text-center text-slate-500">
          <div class="inline-block animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-3"></div>
          <p class="text-sm font-medium">Initializing Execution Intelligence & CPM Scheduler...</p>
        </div>
      </div>
    `;

    try {
      const [timeline, pva, recovery, wpRes, tasksRes] = await Promise.all([
        window.APIClient.getExecutionTimeline(this.projectId),
        window.APIClient.getPlanVsActual(this.projectId),
        window.APIClient.getRecoveryOptions(this.projectId),
        window.APIClient.getWorkPackages(this.projectId),
        window.APIClient.getProjectTasks(this.projectId)
      ]);

      this.timelineData = timeline;
      this.planVsActualData = pva;
      this.recoveryData = recovery;
      this.workPackages = (wpRes && wpRes.work_packages) ? wpRes.work_packages : [];
      this.tasks = (tasksRes && tasksRes.tasks) ? tasksRes.tasks : [];

      this.renderContent(container);
    } catch (e) {
      console.error("[ExecutionControlView] Render error:", e);
      container.innerHTML = `
        <div class="p-8 text-center bg-red-50 text-red-700 rounded-xl border border-red-200">
          <p class="font-bold mb-1">Failed to load Execution Control Center.</p>
          <p class="text-xs">${e.message}</p>
        </div>
      `;
    }
  },

  renderContent(container) {
    const pva = this.planVsActualData || {};
    const recovery = this.recoveryData || {};
    const timeline = this.timelineData || {};

    container.innerHTML = `
      <div class="space-y-6 animate-fade-in max-w-7xl mx-auto pb-16">

        <!-- Top Header Flight Deck -->
        <div class="bg-gradient-to-r from-slate-900 via-slate-950 to-blue-950 text-white rounded-2xl p-6 shadow-xl border border-slate-800">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div class="space-y-1.5">
              <div class="flex flex-wrap items-center gap-2">
                <span class="px-2.5 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full text-xs font-bold uppercase tracking-wider">
                  ⏱️ CPM Execution Control Center
                </span>
                <span class="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-400/30 rounded text-xs font-semibold">
                  Critical Path Bottleneck Active
                </span>
                <span class="text-xs text-slate-400 font-mono">ID: ${this.projectId}</span>
              </div>
              <h1 class="text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
                Varanasi-Ranchi-Kolkata Expressway — PKG-3 Ganga River Bridge
              </h1>
              <p class="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                Integrated execution management linking ground-worker physical quantity telemetry with Critical Path Method (CPM) forward/backward pass calculations and AI-driven delay mitigation.
              </p>
            </div>

            <div class="flex items-center gap-3">
              <a href="#/onboarding" class="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-2">
                <span>⚡</span> Onboard New Project
              </a>
              <a href="#/engineer" class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-2">
                <span>👷</span> Verification Queue (2)
              </a>
            </div>
          </div>
        </div>

        <!-- 5-Metric Execution Health Bar -->
        <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Schedule Slippage</div>
            <div class="text-2xl font-black text-rose-600 mt-0.5">+${pva.schedule_variance_days || 42} <span class="text-xs font-normal text-slate-500">days</span></div>
            <div class="text-[10px] text-rose-700 font-semibold mt-1">Direct Critical Path Delay</div>
          </div>

          <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cost Variance</div>
            <div class="text-2xl font-black text-amber-600 mt-0.5">+₹ ${pva.cost_variance_inr_cr || 18.5} <span class="text-xs font-normal text-slate-500">Cr</span></div>
            <div class="text-[10px] text-amber-700 font-semibold mt-1">Estimated Escalation Drift</div>
          </div>

          <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Physical Velocity</div>
            <div class="text-2xl font-black text-blue-600 mt-0.5">${pva.execution_velocity || 0.74} <span class="text-xs font-normal text-slate-500">x</span></div>
            <div class="text-[10px] text-blue-700 font-semibold mt-1">Plan Ratio (Target: 1.0)</div>
          </div>

          <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Target Misses</div>
            <div class="text-2xl font-black text-orange-600 mt-0.5">${pva.target_misses_count || 3} <span class="text-xs font-normal text-slate-500">tasks</span></div>
            <div class="text-[10px] text-orange-700 font-semibold mt-1">${pva.stale_updates_count || 1} Stale Telemetry (>48h)</div>
          </div>

          <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm col-span-2 md:col-span-1">
            <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Execution Health Index</div>
            <div class="text-2xl font-black text-indigo-600 mt-0.5">${pva.health_index || 68.2} <span class="text-xs font-normal text-slate-500">/ 100</span></div>
            <div class="text-[10px] text-indigo-700 font-semibold mt-1">Tier: MODERATE RISK</div>
          </div>
        </div>

        <!-- Critical Blocker Escalation Strip -->
        <div class="p-4 bg-rose-50 border-2 border-rose-200 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
              🚨
            </div>
            <div>
              <div class="font-extrabold text-rose-950 text-sm">
                Critical Path Impediment: Ganga River Pier P-04 Well Excavation (TSK-001)
              </div>
              <p class="text-rose-800 text-[11px] mt-0.5">
                Subsurface basalt boulder layer obstructing cutting edge at 16.2m depth. Schedule buffer exhausted (Float = 0 days). Downstream delay propagating to Superstructure Erection (+42 days).
              </p>
            </div>
          </div>
          <button id="btn-scroll-recovery" class="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xl shadow transition flex-shrink-0 whitespace-nowrap">
            Simulate 5 AI Recovery Options &darr;
          </button>
        </div>

        <!-- Middle Row: Plan vs Actual S-Curve & Critical Path Downstream Impact -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <!-- S-Curve Chart (7 cols) -->
          <div class="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-bold text-slate-900 text-sm">Plan vs Actual Physical S-Curve</h3>
                <p class="text-xs text-slate-500">Cumulative physical execution baseline vs verified field quantities</p>
              </div>
              <span class="text-[10px] bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded font-bold">12-Month Horizon</span>
            </div>
            <div class="h-64 relative">
              <canvas id="chart-s-curve"></canvas>
            </div>
            <div class="flex items-center justify-center gap-6 text-[11px] text-slate-600 pt-2 border-t border-slate-100">
              <div class="flex items-center gap-2">
                <span class="w-3 h-0.5 bg-blue-600"></span>
                <span>Planned Baseline</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-3 h-0.5 bg-emerald-600"></span>
                <span>Actual Verified</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-3 h-0.5 bg-rose-600 border-dashed"></span>
                <span>AI Projected (With Bottleneck)</span>
              </div>
            </div>
          </div>

          <!-- Critical Path Milestones (5 cols) -->
          <div class="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-bold text-slate-900 text-sm">CPM Milestone Schedule & Float</h3>
                <p class="text-xs text-slate-500">Forward/Backward pass early & late date calculations</p>
              </div>
              <span class="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded">Critical: Red</span>
            </div>

            <div class="space-y-2 max-h-72 overflow-y-auto pr-1 text-xs">
              ${(timeline.milestones || []).map(m => `
                <div class="p-2.5 rounded-xl border ${m.is_critical ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 bg-slate-50/50'} flex items-center justify-between">
                  <div class="min-w-0 pr-2">
                    <div class="flex items-center gap-1.5">
                      <span class="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded ${m.is_critical ? 'bg-rose-200 text-rose-900' : 'bg-slate-200 text-slate-800'}">${m.milestone_id}</span>
                      <span class="font-bold text-slate-900 truncate">${m.name}</span>
                    </div>
                    <div class="text-[10px] text-slate-500 mt-0.5">Target: ${m.target_date} · Progress: ${m.progress_pct}%</div>
                  </div>
                  <div class="text-right flex-shrink-0">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
                      m.is_critical 
                        ? 'bg-rose-100 text-rose-800' 
                        : 'bg-emerald-100 text-emerald-800'
                    }">
                      ${m.is_critical ? 'Float: 0d (CP)' : `Float: +${m.float_days || 14}d`}
                    </span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- 5 AI Recovery Options Simulator Section -->
        <div id="section-recovery" class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-lg">🤖</span>
                <h3 class="font-bold text-slate-900 text-base">AI Dynamic Rescheduling & Recovery Simulator</h3>
              </div>
              <p class="text-xs text-slate-500">5 algorithmic strategies synthesized by the scheduling engine to recover +42 days of critical path slippage.</p>
            </div>
            <span class="text-xs text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200 font-bold self-start sm:self-auto">
              Simulated Schedule Savings
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-5 gap-3">
            ${(recovery.options || []).map(opt => `
              <div data-recovery-id="${opt.id}" class="opt-recovery-card p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                this.selectedRecoveryOption === opt.id 
                  ? 'border-blue-600 bg-blue-50/70 shadow-md ring-2 ring-blue-400/30' 
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
              }">
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="font-mono text-[10px] font-bold bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded">${opt.strategy}</span>
                    <span class="text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                      opt.recommendation_tag === 'RECOMMENDED' ? 'bg-emerald-100 text-emerald-800' :
                      opt.recommendation_tag === 'FASTEST' ? 'bg-rose-100 text-rose-800' :
                      opt.recommendation_tag === 'COST_OPTIMAL' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                    }">${opt.recommendation_tag}</span>
                  </div>
                  <h4 class="font-bold text-slate-900 text-xs leading-snug">${opt.name}</h4>
                  <p class="text-[11px] text-slate-600 leading-relaxed">${opt.description}</p>
                </div>

                <div class="pt-3 border-t border-slate-200/80 mt-3 space-y-1.5 text-xs">
                  <div class="flex justify-between">
                    <span class="text-slate-500">Days Recovered:</span>
                    <strong class="text-emerald-700 font-bold">-${opt.days_recovered} Days</strong>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-500">Cost Impact:</span>
                    <strong class="${opt.cost_impact_inr_cr > 0 ? 'text-amber-700' : 'text-emerald-700'}">₹ ${opt.cost_impact_inr_cr > 0 ? '+' : ''}${opt.cost_impact_inr_cr} Cr</strong>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-500">Feasibility:</span>
                    <strong class="text-blue-700">${opt.feasibility_score}%</strong>
                  </div>

                  <button class="w-full mt-2 py-1.5 text-[11px] font-bold rounded-lg transition ${
                    this.selectedRecoveryOption === opt.id 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                  }">
                    ${this.selectedRecoveryOption === opt.id ? 'Applied in Simulator ✓' : 'Simulate Strategy'}
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 12 Work Packages & 54 Tasks Registry Table -->
        <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 class="font-bold text-slate-900 text-sm uppercase tracking-wider">Work Packages & Physical Tasks Registry</h3>
              <p class="text-xs text-slate-500">Granular target vs verified quantities across all 12 WBS packages</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs text-slate-500">Showing sample high-impact execution tasks</span>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th class="py-2.5 px-3">WBS Code</th>
                  <th class="py-2.5 px-3">Task Description</th>
                  <th class="py-2.5 px-3">Status</th>
                  <th class="py-2.5 px-3">Critical Path</th>
                  <th class="py-2.5 px-3 text-right">Target Qty</th>
                  <th class="py-2.5 px-3 text-right">Completed Qty</th>
                  <th class="py-2.5 px-3 text-right">Physical %</th>
                  <th class="py-2.5 px-3">Assigned Lead</th>
                  <th class="py-2.5 px-3">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${this.tasks.map(t => `
                  <tr class="hover:bg-slate-50/80 transition">
                    <td class="py-2.5 px-3 font-mono font-bold text-slate-700">${t.wbs_code}</td>
                    <td class="py-2.5 px-3 font-medium text-slate-900">
                      <div>${t.task_name}</div>
                      <div class="text-[10px] text-slate-400">${t.site_name || 'Alignment PKG-3'}</div>
                    </td>
                    <td class="py-2.5 px-3">
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                        t.status === 'BLOCKED' ? 'bg-rose-100 text-rose-800' :
                        t.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                      }">
                        ${t.status}
                      </span>
                    </td>
                    <td class="py-2.5 px-3">
                      <span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        t.is_critical ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                      }">
                        ${t.is_critical ? 'CRITICAL (0d)' : `+${t.total_float || 14}d Float`}
                      </span>
                    </td>
                    <td class="py-2.5 px-3 text-right font-mono">${t.target_quantity} ${t.unit}</td>
                    <td class="py-2.5 px-3 text-right font-mono font-bold ${t.status === 'BLOCKED' ? 'text-rose-700' : 'text-slate-900'}">${t.completed_quantity} ${t.unit}</td>
                    <td class="py-2.5 px-3 text-right">
                      <div class="font-bold">${t.actual_progress}%</div>
                      <div class="w-16 bg-slate-200 h-1.5 rounded-full mt-1 ml-auto overflow-hidden">
                        <div class="bg-blue-600 h-full rounded-full" style="width: ${Math.min(100, t.actual_progress)}%"></div>
                      </div>
                    </td>
                    <td class="py-2.5 px-3 text-slate-600">${t.assigned_to_name || 'Site Crew'}</td>
                    <td class="py-2.5 px-3">
                      <button data-task-log="${t.task_id}" class="text-[11px] text-blue-700 hover:text-blue-900 font-semibold underline">
                        History
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;

    this.initSCurveChart();
    this.bindEvents(container);
  },

  initSCurveChart() {
    const canvas = document.getElementById("chart-s-curve");
    if (!canvas) return;

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const sCurve = this.planVsActualData?.s_curve || {
      labels: ["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8", "M9", "M10", "M11", "M12"],
      planned_curve: [3.5, 8.0, 14.5, 22.0, 31.0, 42.0, 54.0, 67.0, 78.0, 88.0, 95.0, 100.0],
      actual_curve:  [3.2, 7.8, 13.8, 20.1, 26.5, 34.0, null, null, null, null, null, null],
      projected_curve: [null, null, null, null, null, 34.0, 41.5, 51.0, 62.0, 73.5, 85.0, 94.0]
    };

    // If recovery option selected, improve projected curve!
    let activeProjected = [...sCurve.projected_curve];
    if (this.selectedRecoveryOption) {
      activeProjected = [null, null, null, null, null, 34.0, 46.0, 58.5, 71.0, 83.5, 93.0, 100.0];
    }

    this.chartInstance = new Chart(canvas, {
      type: "line",
      data: {
        labels: sCurve.labels,
        datasets: [
          {
            label: "Planned Baseline (%)",
            data: sCurve.planned_curve,
            borderColor: "#2563eb",
            backgroundColor: "rgba(37, 99, 235, 0.05)",
            borderWidth: 2.5,
            fill: true,
            tension: 0.3
          },
          {
            label: "Actual Verified (%)",
            data: sCurve.actual_curve,
            borderColor: "#059669",
            backgroundColor: "#059669",
            borderWidth: 3,
            pointRadius: 4,
            tension: 0.3
          },
          {
            label: this.selectedRecoveryOption ? "Recovered Trajectory (%)" : "Projected Delay (%)",
            data: activeProjected,
            borderColor: this.selectedRecoveryOption ? "#8b5cf6" : "#e11d48",
            borderDash: [6, 4],
            borderWidth: 2,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            min: 0,
            max: 105,
            ticks: {
              callback: v => `${v}%`,
              font: { size: 10 }
            }
          },
          x: {
            ticks: { font: { size: 10 } }
          }
        }
      }
    });
  },

  bindEvents(container) {
    // Scroll to recovery simulator
    const scrollBtn = container.querySelector("#btn-scroll-recovery");
    if (scrollBtn) {
      scrollBtn.addEventListener("click", () => {
        container.querySelector("#section-recovery")?.scrollIntoView({ behavior: "smooth" });
      });
    }

    // Recovery option cards selection
    container.querySelectorAll(".opt-recovery-card").forEach(card => {
      card.addEventListener("click", (e) => {
        const optId = card.getAttribute("data-recovery-id");
        this.selectedRecoveryOption = (this.selectedRecoveryOption === optId) ? null : optId;
        const opt = (this.recoveryData.options || []).find(o => o.id === optId);
        if (this.selectedRecoveryOption && opt) {
          window.APIClient.showToast(`Simulating: ${opt.name} (-${opt.days_recovered} days)`, "success");
        } else {
          window.APIClient.showToast("Reset simulation to unmitigated delay trajectory", "info");
        }
        this.renderContent(container);
      });
    });

    // Task history click
    container.querySelectorAll("[data-task-log]").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const taskId = btn.getAttribute("data-task-log");
        const histRes = await window.APIClient.getTaskProgressHistory(taskId);
        alert(`Telemetry history for ${taskId}:\n` + 
          (histRes.history || []).map(h => `${h.reported_date}: ${h.quantity_completed} ${h.unit || ''} [${h.verification_status}] - ${h.remarks}`).join('\n')
        );
      });
    });
  }
};

window.ExecutionControlView = ExecutionControlView;
