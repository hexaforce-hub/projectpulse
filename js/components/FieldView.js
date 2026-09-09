// ==========================================================================
// PROJECTPULSE — Phase 10: Field Operations & Ground Task Workstation
// Ministry of Statistics & Programme Implementation (MoSPI) - IPMD
// Smart India Hackathon 2026 — Team HexaForce
// ==========================================================================

const FieldView = {
  tasks: [],
  selectedFilter: "ALL",

  async render(container) {
    container.innerHTML = `
      <div class="space-y-6 animate-fade-in max-w-4xl mx-auto">
        <div class="p-8 text-center text-slate-500">
          <div class="inline-block animate-spin w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full mb-3"></div>
          <p class="text-sm font-medium">Syncing Ground Tasks Telemetry...</p>
        </div>
      </div>
    `;

    try {
      const tasksRes = await window.APIClient.listTasks();
      this.tasks = (tasksRes && tasksRes.tasks) ? tasksRes.tasks : [];
      this.renderContent(container);
    } catch (e) {
      console.error("[FieldView] Render error:", e);
      container.innerHTML = `
        <div class="p-8 text-center bg-red-50 text-red-700 rounded-xl border border-red-200">
          <p class="font-bold mb-1">Failed to load field tasks.</p>
          <p class="text-xs">${e.message}</p>
        </div>
      `;
    }
  },

  renderContent(container) {
    const user = window.APIClient.currentUser || {};
    const filteredTasks = this.selectedFilter === "ALL" 
      ? this.tasks 
      : this.tasks.filter(t => t.status === this.selectedFilter);

    const completedCount = this.tasks.filter(t => t.status === "COMPLETED").length;
    const inProgressCount = this.tasks.filter(t => t.status === "IN_PROGRESS").length;
    const blockedCount = this.tasks.filter(t => t.status === "BLOCKED").length;

    container.innerHTML = `
      <div class="space-y-5 animate-fade-in max-w-4xl mx-auto pb-12">
        <!-- Field Supervisor Header -->
        <div class="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white rounded-2xl p-5 shadow-xl border border-slate-800">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-bold uppercase tracking-wider">
                  👷 Site Operations Workstation
                </span>
                <span class="text-xs text-slate-400 font-mono">PKG-3 Section</span>
              </div>
              <h1 class="text-xl font-extrabold text-white flex items-center gap-2">
                ${user.name || "Shri Rajesh Gurjar"}
              </h1>
              <p class="text-xs text-slate-300">
                ${user.designation || "Senior Site Supervisor"} · Varanasi-Ranchi-Kolkata Expressway
              </p>
            </div>

            <div class="flex items-center gap-2">
              <button id="btn-quick-field-hazard" class="w-full sm:w-auto px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow transition flex items-center justify-center gap-1.5">
                <span>🚨</span> Report Ground Stoppage
              </button>
            </div>
          </div>
        </div>

        <!-- Task Completion Quick Counters -->
        <div class="grid grid-cols-3 gap-3">
          <div class="p-3 bg-white rounded-xl border border-slate-200 shadow-sm text-center">
            <div class="text-xl font-black text-blue-600">${inProgressCount}</div>
            <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">In Progress</div>
          </div>
          <div class="p-3 bg-white rounded-xl border border-slate-200 shadow-sm text-center">
            <div class="text-xl font-black text-rose-600">${blockedCount}</div>
            <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Blocked</div>
          </div>
          <div class="p-3 bg-white rounded-xl border border-slate-200 shadow-sm text-center">
            <div class="text-xl font-black text-emerald-600">${completedCount}</div>
            <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Done Today</div>
          </div>
        </div>

        <!-- Task Status Filter Tabs -->
        <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs overflow-x-auto">
          ${["ALL", "IN_PROGRESS", "BLOCKED", "COMPLETED", "TODO"].map(f => `
            <button data-filter="${f}" class="px-3 py-1.5 font-bold rounded-lg transition whitespace-nowrap ${
              this.selectedFilter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }">
              ${f.replace("_", " ")}
            </button>
          `).join('')}
        </div>

        <!-- Operational Tasks Interactive List -->
        <div class="space-y-3">
          ${filteredTasks.length === 0 ? `
            <div class="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs font-medium">
              No operational tasks matching selected filter.
            </div>
          ` : filteredTasks.map(t => `
            <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div class="flex items-start justify-between gap-2">
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="font-mono text-[10px] font-bold text-slate-500">${t.task_id}</span>
                    <span class="px-2 py-0.5 text-[10px] font-bold rounded ${
                      t.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                      t.priority === 'HIGH' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                    }">
                      ${t.priority}
                    </span>
                    <span class="text-[10px] text-slate-500 font-semibold">${t.site_id || 'SITE-A'}</span>
                  </div>
                  <h4 class="font-bold text-slate-900 text-sm">${t.title}</h4>
                  <p class="text-xs text-slate-600 leading-relaxed">${t.description}</p>
                </div>

                <span class="text-xs font-bold px-2 py-1 rounded flex-shrink-0 ${
                  t.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                  t.status === 'BLOCKED' ? 'bg-rose-100 text-rose-800' :
                  t.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                }">
                  ${t.status.replace("_", " ")}
                </span>
              </div>

              ${t.remarks ? `
                <div class="p-2.5 bg-slate-50 rounded-lg text-xs text-slate-700 border border-slate-100">
                  <span class="font-semibold text-slate-900">Field Remark:</span> ${t.remarks}
                </div>
              ` : ''}

              <!-- 1-Tap Action Bar -->
              <div class="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div class="text-[11px] text-slate-500">
                  Due: <strong>${t.due_date}</strong>
                </div>

                <div class="flex items-center gap-1.5">
                  <button data-task-action="${t.task_id}" data-new-status="IN_PROGRESS" class="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded border border-blue-200 transition">
                    ▶ In Progress
                  </button>
                  <button data-task-action="${t.task_id}" data-new-status="BLOCKED" class="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded border border-rose-200 transition">
                    ⛔ Blocked
                  </button>
                  <button data-task-action="${t.task_id}" data-new-status="COMPLETED" class="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded shadow transition">
                    ✔️ Complete
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Filter event handlers
    container.querySelectorAll("[data-filter]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        this.selectedFilter = e.currentTarget.getAttribute("data-filter");
        this.renderContent(container);
      });
    });

    // Action handlers for 1-Tap status updates
    container.querySelectorAll("[data-task-action]").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const taskId = e.currentTarget.getAttribute("data-task-action");
        const newStatus = e.currentTarget.getAttribute("data-new-status");
        let remarks = "";
        if (newStatus === "BLOCKED") {
          remarks = prompt("Enter blocker details (e.g. Forest department inspection pending):", "Site halted due to statutory inspection notice.");
        } else if (newStatus === "COMPLETED") {
          remarks = prompt("Enter completion notes / test verification:", "Work inspected and approved as per specifications.");
        }

        await window.APIClient.updateTask(taskId, { status: newStatus, remarks });
        const mainContainer = document.getElementById("main-content");
        if (mainContainer) this.render(mainContainer);
      });
    });

    // Quick hazard report button
    const btnHazard = container.querySelector("#btn-quick-field-hazard");
    if (btnHazard) {
      btnHazard.addEventListener("click", () => {
        if (window.EngineerView) {
          window.EngineerView.showIssueModal();
        }
      });
    }
  }
};

window.FieldView = FieldView;
