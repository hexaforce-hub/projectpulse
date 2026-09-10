// ==========================================================================
// PROJECTPULSE — Phase 10 & 11: Field Operations & Daily Telemetry Workstation
// Ministry of Statistics & Programme Implementation (MoSPI) - IPMD
// Smart India Hackathon 2026 — Team HexaForce
// ==========================================================================

const FieldView = {
  tasks: [],
  targets: [],
  selectedFilter: "ALL",

  async render(container) {
    if (!container) {
      container = document.getElementById("main-content-mount");
    }
    if (!container) return;

    container.innerHTML = `
      <div class="space-y-6 animate-fade-in max-w-4xl mx-auto pb-16">
        <div class="p-8 text-center text-slate-500">
          <div class="inline-block animate-spin w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full mb-3"></div>
          <p class="text-sm font-medium">Syncing Ground Tasks & Daily Targets Telemetry...</p>
        </div>
      </div>
    `;

    try {
      const [tasksRes, targetsRes] = await Promise.all([
        window.APIClient.listTasks(),
        window.APIClient.getMyTargets()
      ]);

      this.tasks = (tasksRes && tasksRes.tasks) ? tasksRes.tasks : [];
      this.targets = (targetsRes && targetsRes.targets) ? targetsRes.targets : [];
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

    const user = window.APIClient.currentUser || {};
    const fullName = user.name || "Shri Rajesh Gurjar";
    const nameParts = fullName.split(" ");
    const firstName = nameParts.length > 1 ? (nameParts[1].length > 2 ? nameParts[1] : nameParts[0]) : nameParts[0];

    const filteredTasks = this.selectedFilter === "ALL" 
      ? this.tasks 
      : this.tasks.filter(t => t.status === this.selectedFilter);

    const completedCount = this.tasks.filter(t => t.status === "COMPLETED").length;
    const inProgressCount = this.tasks.filter(t => t.status === "IN_PROGRESS").length;
    const blockedCount = this.tasks.filter(t => t.status === "BLOCKED").length;

    container.innerHTML = `
      <div class="space-y-4 animate-fade-in max-w-3xl mx-auto pb-16">
        
        <!-- Field Supervisor Greeting Header -->
        <div class="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-800">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <i data-lucide="truck" class="w-3 h-3"></i>
                  Ground Operations Workstation
                </span>
                <span class="text-xs text-slate-400 font-mono">PKG-3 Ganga River Viaduct</span>
              </div>
              <h1 class="text-xl font-black text-white tracking-tight">
                Good morning, ${firstName} • Today's Work
              </h1>
              <p class="text-xs text-slate-300">
                ${user.designation || "Senior Site Supervisor"} · Varanasi-Ranchi-Kolkata Expressway
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <a href="#/execution" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-1.5 shadow-2xs">
                <i data-lucide="clock" class="w-3.5 h-3.5"></i>
                <span>Execution CPM</span>
              </a>
              <button id="btn-report-stoppage" class="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer">
                <i data-lucide="alert-octagon" class="w-3.5 h-3.5"></i>
                <span>Report Ground Stoppage</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Today's Assigned Operational Targets -->
        <div class="bg-white rounded-xl p-4 border border-amber-200 shadow-2xs space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <div class="flex items-center gap-1.5">
                <i data-lucide="target" class="w-4 h-4 text-amber-600"></i>
                <h3 class="font-bold text-slate-900 text-xs uppercase tracking-wider">Today's Physical Targets & Telemetry</h3>
              </div>
              <p class="text-[11px] text-slate-500 mt-0.5">Log verified completed quantities for Resident Engineer approval</p>
            </div>
            <span class="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200">
              ${this.targets.length} Active Targets
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            ${this.targets.map(tgt => `
              <div class="p-3.5 rounded-xl border ${tgt.status === 'BLOCKED' ? 'border-rose-300 bg-rose-50/60' : 'border-slate-200 bg-slate-50/80'} space-y-2 flex flex-col justify-between text-xs">
                <div class="space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="font-mono text-[9px] font-bold px-1.5 py-0.2 rounded ${tgt.is_critical ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-slate-200 text-slate-800'}">
                      ${tgt.is_critical ? 'CRITICAL PATH' : 'SUB-CRITICAL'}
                    </span>
                    <span class="text-[10px] font-bold ${tgt.status === 'BLOCKED' ? 'text-rose-700' : 'text-emerald-700'}">${tgt.status}</span>
                  </div>
                  <h4 class="font-bold text-slate-900 text-xs line-clamp-2">${tgt.task_name}</h4>
                  ${tgt.impediment ? `<div class="text-[10px] text-rose-800 bg-rose-100/80 p-1.5 rounded font-medium">⚠️ ${tgt.impediment}</div>` : ''}
                </div>

                <div class="pt-2 border-t border-slate-200 space-y-1.5">
                  <div class="flex justify-between items-center text-slate-600 text-[11px]">
                    <span>Target:</span>
                    <strong class="text-slate-900 font-mono">${tgt.target_quantity} ${tgt.unit}</strong>
                  </div>
                  <div class="flex justify-between items-center text-slate-600 text-[11px]">
                    <span>Logged:</span>
                    <strong class="text-blue-700 font-mono font-bold">${tgt.completed_quantity} ${tgt.unit}</strong>
                  </div>

                  <button data-log-progress="${tgt.task_id}" data-task-name="${tgt.task_name}" data-unit="${tgt.unit}" class="w-full py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg shadow-2xs transition flex items-center justify-center gap-1 cursor-pointer text-xs">
                    <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
                    <span>Log Physical Quantity</span>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Task Completion Quick Counters -->
        <div class="grid grid-cols-3 gap-2.5">
          <div class="p-3 bg-white rounded-xl border border-blue-100 shadow-2xs text-center">
            <div class="text-xl font-black text-blue-600 tabular-nums">${inProgressCount}</div>
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">In Progress</div>
          </div>
          <div class="p-3 bg-white rounded-xl border border-rose-100 shadow-2xs text-center">
            <div class="text-xl font-black text-rose-600 tabular-nums">${blockedCount}</div>
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Blocked</div>
          </div>
          <div class="p-3 bg-white rounded-xl border border-emerald-100 shadow-2xs text-center">
            <div class="text-xl font-black text-emerald-600 tabular-nums">${completedCount}</div>
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Done Today</div>
          </div>
        </div>

        <!-- Task Status Filter Tabs -->
        <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs overflow-x-auto">
          ${["ALL", "IN_PROGRESS", "BLOCKED", "COMPLETED", "TODO"].map(f => `
            <button data-filter="${f}" class="px-3 py-1.5 font-bold rounded-lg transition whitespace-nowrap cursor-pointer ${
              this.selectedFilter === f ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }">
              ${f.replace("_", " ")}
            </button>
          `).join('')}
        </div>

        <!-- Operational Tasks Minimalist Card Deck -->
        <div class="space-y-3">
          ${filteredTasks.length === 0 ? `
            <div class="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs font-medium">
              No operational tasks matching selected filter.
            </div>
          ` : filteredTasks.map(t => `
            <div class="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-300 shadow-2xs space-y-3 transition">
              <div class="flex items-start justify-between gap-2">
                <div class="space-y-1">
                  <div class="flex items-center gap-1.5">
                    <span class="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">${t.task_id}</span>
                    <span class="px-2 py-0.5 text-[9px] font-bold rounded ${
                      t.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                      t.priority === 'HIGH' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }">
                      ${t.priority || 'NORMAL'}
                    </span>
                    <span class="text-[10px] text-slate-400 font-semibold">• ${t.site_id || 'SITE-B'}</span>
                  </div>
                  <h4 class="font-bold text-slate-900 text-sm">${t.title || t.task_name}</h4>
                  <p class="text-xs text-slate-600 leading-relaxed">${t.description || ''}</p>
                </div>

                <span class="text-xs font-bold px-2 py-1 rounded flex-shrink-0 ${
                  t.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                  t.status === 'BLOCKED' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                  t.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                }">
                  ${(t.status || '').replace("_", " ")}
                </span>
              </div>

              ${t.remarks ? `
                <div class="p-2.5 bg-slate-50 rounded-lg text-xs text-slate-700 border border-slate-100 flex items-start gap-1.5">
                  <span class="text-slate-400">💬</span>
                  <div>
                    <span class="font-semibold text-slate-900">Field Remark:</span> ${t.remarks}
                  </div>
                </div>
              ` : ''}

              <!-- Direct Actions Deck: [ UPDATE PROGRESS ], [ REPORT ISSUE ], [ ADD EVIDENCE ] -->
              <div class="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-2 flex-wrap">
                  <button data-action-progress="${t.task_id}" data-task-name="${t.title || t.task_name}" class="btn btn-primary btn-sm text-[11px] py-1.5 px-3 flex items-center gap-1.5 font-bold cursor-pointer shadow-2xs">
                    <i data-lucide="trending-up" class="w-3.5 h-3.5"></i>
                    <span>UPDATE PROGRESS</span>
                  </button>
                  <button data-action-issue="${t.task_id}" class="btn btn-secondary btn-sm text-[11px] py-1.5 px-3 flex items-center gap-1.5 font-bold text-rose-700 hover:bg-rose-50 border-rose-200 cursor-pointer shadow-2xs">
                    <i data-lucide="alert-triangle" class="w-3.5 h-3.5 text-rose-600"></i>
                    <span>REPORT ISSUE</span>
                  </button>
                  <button data-action-evidence="${t.task_id}" data-task-name="${t.title || t.task_name}" class="btn btn-secondary btn-sm text-[11px] py-1.5 px-3 flex items-center gap-1.5 font-bold text-blue-700 hover:bg-blue-50 border-blue-200 cursor-pointer shadow-2xs">
                    <i data-lucide="camera" class="w-3.5 h-3.5 text-blue-600"></i>
                    <span>ADD EVIDENCE</span>
                  </button>
                </div>

                <div class="flex items-center gap-1">
                  <button data-task-action="${t.task_id}" data-new-status="IN_PROGRESS" class="px-2 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-[10px] font-bold rounded border border-slate-200 transition cursor-pointer" title="Mark In Progress">
                    ▶ In Progress
                  </button>
                  <button data-task-action="${t.task_id}" data-new-status="BLOCKED" class="px-2 py-1 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 text-[10px] font-bold rounded border border-slate-200 transition cursor-pointer" title="Mark Blocked">
                    ⛔ Blocked
                  </button>
                  <button data-task-action="${t.task_id}" data-new-status="COMPLETED" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded shadow-2xs transition cursor-pointer" title="Mark Complete">
                    ✔️ Done
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    this.bindEvents(container);
    if (window.CommonUI && window.CommonUI.initIcons) window.CommonUI.initIcons();
  },

  bindEvents(container) {
    // Filter event handlers
    container.querySelectorAll("[data-filter]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        this.selectedFilter = e.currentTarget.getAttribute("data-filter");
        this.renderContent(container);
      });
    });

    // Direct Action: [ UPDATE PROGRESS ]
    container.querySelectorAll("[data-action-progress]").forEach(btn => {
      btn.addEventListener("click", () => {
        const taskId = btn.getAttribute("data-action-progress");
        const taskName = btn.getAttribute("data-task-name");
        this.showProgressModal(taskId, taskName, "meters");
      });
    });

    // Direct Action: [ REPORT ISSUE ]
    container.querySelectorAll("[data-action-issue]").forEach(btn => {
      btn.addEventListener("click", () => {
        this.showStoppageModal();
      });
    });

    // Direct Action: [ ADD EVIDENCE ]
    container.querySelectorAll("[data-action-evidence]").forEach(btn => {
      btn.addEventListener("click", () => {
        const taskId = btn.getAttribute("data-action-evidence");
        const taskName = btn.getAttribute("data-task-name");
        this.showEvidenceModal(taskId, taskName);
      });
    });

    // 1-Tap status update handlers
    container.querySelectorAll("[data-task-action]").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const taskId = e.currentTarget.getAttribute("data-task-action");
        const newStatus = e.currentTarget.getAttribute("data-new-status");
        let remarks = "";
        if (newStatus === "BLOCKED") {
          remarks = prompt("Enter blocker details (e.g. Subsurface boulder):", "Subsurface obstruction encountered.");
        } else if (newStatus === "COMPLETED") {
          remarks = prompt("Enter completion verification notes:", "Inspected and measured as per specification.");
        }

        await window.APIClient.updateTask(taskId, { status: newStatus, remarks });
        this.render(container);
      });
    });

    // Log progress modal trigger from target card
    container.querySelectorAll("[data-log-progress]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const taskId = btn.getAttribute("data-log-progress");
        const taskName = btn.getAttribute("data-task-name");
        const unit = btn.getAttribute("data-unit") || "meters";
        this.showProgressModal(taskId, taskName, unit);
      });
    });

    // Report ground stoppage trigger (with 9 canonical categories)
    const btnStoppage = container.querySelector("#btn-report-stoppage");
    if (btnStoppage) {
      btnStoppage.addEventListener("click", () => {
        this.showStoppageModal();
      });
    }
  },

  showEvidenceModal(taskId, taskName) {
    const note = prompt(`Add field verification photo / geo-tagged evidence note for ${taskId} (${taskName}):`, "Site inspection photo captured. Subgrade elevation verified with total station survey.");
    if (note) {
      window.APIClient.submitTaskProgress(taskId, {
        remarks: `[SITE EVIDENCE] ${note}`,
        location_tag: "25°19'N, 83°00'E (GPS Timestamped)"
      }).then(() => {
        if (window.APIClient.showToast) {
          window.APIClient.showToast("Evidence attached & geo-stamped successfully!", "success");
        }
        this.render();
      });
    }
  },

  showProgressModal(taskId, taskName, unit) {
    const modalId = "modal-progress-log";
    let modal = document.getElementById(modalId);
    if (!modal) {
      modal = document.createElement("div");
      modal.id = modalId;
      modal.className = "fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4";
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-scale-in space-y-4">
        <div class="flex items-center justify-between border-b pb-3">
          <div class="flex items-center gap-2">
            <span class="text-xl">📝</span>
            <h3 class="font-bold text-slate-900 text-sm">Log Physical Quantity Telemetry</h3>
          </div>
          <button id="close-prog-modal" class="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
        </div>

        <div class="space-y-3 text-xs">
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div class="text-[10px] text-slate-400 uppercase font-mono">${taskId}</div>
            <div class="font-bold text-slate-900">${taskName}</div>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Quantity Completed Today (${unit}) *</label>
            <div class="flex items-center gap-2">
              <input type="number" id="inp-log-qty" step="0.1" value="0.5" class="flex-1 p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 text-sm font-bold font-mono" required />
              <button type="button" id="btn-add-05" class="px-2.5 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold">+0.5</button>
              <button type="button" id="btn-add-10" class="px-2.5 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold">+1.0</button>
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Field Observations / Stratigraphy Remarks</label>
            <textarea id="inp-log-notes" rows="2" class="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500" placeholder="e.g. Reverse circulation rig drilling through basalt layer"></textarea>
          </div>

          <div class="p-2.5 bg-blue-50 text-blue-900 rounded-xl border border-blue-200 flex items-center justify-between text-[11px]">
            <span>📍 Geo-Stamped: 25°19'N, 83°00'E</span>
            <span class="font-bold text-emerald-700">GPS Verified ✓</span>
          </div>

          <button id="btn-submit-telemetry" class="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow transition">
            Submit to Resident Engineer Verification Queue
          </button>
        </div>
      </div>
    `;

    modal.querySelector("#close-prog-modal").addEventListener("click", () => modal.remove());
    modal.querySelector("#btn-add-05").addEventListener("click", () => {
      const inp = modal.querySelector("#inp-log-qty");
      inp.value = (parseFloat(inp.value || 0) + 0.5).toFixed(1);
    });
    modal.querySelector("#btn-add-10").addEventListener("click", () => {
      const inp = modal.querySelector("#inp-log-qty");
      inp.value = (parseFloat(inp.value || 0) + 1.0).toFixed(1);
    });

    modal.querySelector("#btn-submit-telemetry").addEventListener("click", async () => {
      const qty = parseFloat(modal.querySelector("#inp-log-qty")?.value) || 0.5;
      const notes = modal.querySelector("#inp-log-notes")?.value || "Field telemetry report";
      await window.APIClient.submitTaskProgress(taskId, { quantity_completed: qty, unit, remarks: notes });
      modal.remove();
      this.render();
    });
  },

  showStoppageModal() {
    const modalId = "modal-stoppage-report";
    let modal = document.getElementById(modalId);
    if (!modal) {
      modal = document.createElement("div");
      modal.id = modalId;
      modal.className = "fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4";
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 animate-scale-in space-y-4">
        <div class="flex items-center justify-between border-b pb-3">
          <div class="flex items-center gap-2">
            <span class="text-xl">🚨</span>
            <h3 class="font-bold text-slate-900 text-sm">Report Ground Stoppage (9 MoSPI Categories)</h3>
          </div>
          <button id="close-stop-modal" class="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Stoppage Cause Category *</label>
            <select id="sel-stop-category" class="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 font-semibold">
              <option value="EQUIPMENT_BREAKDOWN" selected>EQUIPMENT_BREAKDOWN — Machinery Failure / Rig Inoperable</option>
              <option value="LABOR_SHORTAGE">LABOR_SHORTAGE — Gang Demobilization / Festival Outflow</option>
              <option value="MATERIAL_UNAVAILABLE">MATERIAL_UNAVAILABLE — Cement, Aggregate or Bitumen Supply Halt</option>
              <option value="WEATHER_STOPPAGE">WEATHER_STOPPAGE — Monsoon River Surge / Unsafe Flood Current</option>
              <option value="PERMIT_DELAY">PERMIT_DELAY — Stage-II Wildlife / Statutory Stop Notice</option>
              <option value="DESIGN_REVISION">DESIGN_REVISION — Pier Foundation Depth Modification</option>
              <option value="RIGHT_OF_WAY_BLOCKED">RIGHT_OF_WAY_BLOCKED — Encroachment / Land Litigation Dispute</option>
              <option value="PAYMENT_DISPUTE">PAYMENT_DISPUTE — Milestone IPC Payment Clearance Delay</option>
              <option value="QUALITY_REJECTION">QUALITY_REJECTION — Core Compaction Test Non-Conformance</option>
            </select>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Affected Work Package / Task *</label>
            <select id="sel-stop-task" class="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500">
              <option value="TSK-001">TSK-001: Ganga River Pier P-04 Well Excavation (CRITICAL PATH)</option>
              <option value="TSK-002">TSK-002: Pier P-05 Pneumatic Caisson Sinking (CRITICAL PATH)</option>
              <option value="TSK-005">TSK-005: Ch 12+400 to 18+200 Embankment Compaction</option>
            </select>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Ground Narrative & Resolution Requirement</label>
            <textarea id="txt-stop-desc" rows="3" class="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500" placeholder="e.g. Well cutting edge hit basalt boulder at 16.2m depth. Excavation halted. Urgently require reverse circulation pneumatic drill rig."></textarea>
          </div>

          <div class="p-2.5 bg-rose-50 text-rose-900 rounded-xl border border-rose-200 text-[11px]">
            ⚡ Submitting this stoppage triggers automated Critical Path downstream delay propagation and alerts the Project Director.
          </div>

          <button id="btn-submit-stoppage" class="w-full py-2.5 bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow transition">
            Dispatch Stoppage Alert to Project Director & CPM Scheduler
          </button>
        </div>
      </div>
    `;

    modal.querySelector("#close-stop-modal").addEventListener("click", () => modal.remove());
    modal.querySelector("#btn-submit-stoppage").addEventListener("click", async () => {
      const cat = modal.querySelector("#sel-stop-category")?.value;
      const tid = modal.querySelector("#sel-stop-task")?.value;
      const desc = modal.querySelector("#txt-stop-desc")?.value || "Ground stoppage reported";
      
      await window.APIClient.updateTask(tid, { status: "BLOCKED", remarks: `[${cat}] ${desc}` });
      window.APIClient.showToast(`Stoppage logged under ${cat}. Critical path recalculated.`, "warning");
      modal.remove();
      this.render();
    });
  }
};

window.FieldView = FieldView;
