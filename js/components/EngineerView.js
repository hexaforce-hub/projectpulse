// ==========================================================================
// PROJECTPULSE — Phase 10: Site & Technical Engineer Workspace
// Ministry of Statistics & Programme Implementation (MoSPI) - IPMD
// Smart India Hackathon 2026 — Team HexaForce
// ==========================================================================

const EngineerView = {
  project: null,
  tasks: [],
  issues: [],
  documents: [],
  targetProjectId: "PRJ-SYN-000002",

  async render(container) {
    container.innerHTML = `
      <div class="space-y-6 animate-fade-in">
        <div class="p-8 text-center text-slate-500">
          <div class="inline-block animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full mb-3"></div>
          <p class="text-sm font-medium">Loading Site Engineering Workspace...</p>
        </div>
      </div>
    `;

    try {
      const [prjRes, tasksRes, issuesRes, docsRes] = await Promise.all([
        window.APIClient.getProject(this.targetProjectId),
        window.APIClient.listTasks({ project_id: this.targetProjectId }),
        window.APIClient.listIssues({ project_id: this.targetProjectId }),
        window.APIClient.listDocuments({ project_id: this.targetProjectId })
      ]);

      this.project = prjRes;
      this.tasks = (tasksRes && tasksRes.tasks) ? tasksRes.tasks : [];
      this.issues = (issuesRes && issuesRes.issues) ? issuesRes.issues : [];
      this.documents = (docsRes && docsRes.documents) ? docsRes.documents : [];
      this.renderContent(container);
    } catch (e) {
      console.error("[EngineerView] Render error:", e);
      container.innerHTML = `
        <div class="p-8 text-center bg-red-50 text-red-700 rounded-xl border border-red-200">
          <p class="font-bold mb-1">Failed to load Site Engineering workspace.</p>
          <p class="text-xs">${e.message}</p>
        </div>
      `;
    }
  },

  renderContent(container) {
    const p = this.project || {};
    const user = window.APIClient.currentUser || {};

    container.innerHTML = `
      <div class="space-y-6 animate-fade-in">
        <!-- Engineer Workspace Banner -->
        <div class="bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
          <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div class="space-y-2">
              <div class="flex items-center gap-3">
                <span class="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-xs font-bold uppercase tracking-wider">
                  📐 Technical Engineering Scope
                </span>
                <span class="px-2.5 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded text-xs font-semibold">
                  Designated Alignment: ${p.project_id || this.targetProjectId}
                </span>
              </div>
              <h1 class="text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
                ${p.project_name || "Varanasi-Ranchi-Kolkata Expressway — Section I"}
              </h1>
              <p class="text-sm text-slate-300 max-w-2xl">
                Technical execution workspace for <strong>${user.name || "Er. Neha Verma"}</strong> (${user.designation || "Executive Resident Engineer"}). Direct verification of physical milestones, contractor quality submissions, and geotechnical compliance.
              </p>
            </div>

            <button id="btn-open-issue-form" class="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2">
              <span>⚠️</span> Log Technical Site Issue
            </button>
          </div>
        </div>

        <!-- Metric KPI Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          ${CommonUI.renderKPICard(
            "Physical Progress",
            `${p.physical_progress_pct || 48.5}%`,
            `Financial: ${p.financial_progress_pct || 62.1}%`,
            `<svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>`
          )}
          ${CommonUI.renderKPICard(
            "Open Technical Issues",
            this.issues.filter(i => i.status !== 'RESOLVED').length.toString(),
            "Requiring Technical Resolution",
            `<svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`
          )}
          ${CommonUI.renderKPICard(
            "Engineering Documents",
            this.documents.length.toString(),
            "DPRs, Approvals & Logs",
            `<svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`
          )}
          ${CommonUI.renderKPICard(
            "Schedule Slippage",
            `${p.schedule_slippage_months || 14} mos`,
            `Critical Path Delayed`,
            `<svg class="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
          )}
        </div>

        <!-- Technical Issues Section -->
        <div class="gov-card">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="font-bold text-slate-900 text-sm uppercase tracking-wider">Site Issues & Non-Compliance Log</h3>
              <p class="text-xs text-slate-500">Quality, statutory clearance, and geotechnical challenges on this corridor</p>
            </div>
            <button id="btn-quick-log-issue" class="text-xs px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition">
              + New Issue
            </button>
          </div>

          <div class="space-y-3">
            ${this.issues.map(iss => `
              <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div class="space-y-1.5 flex-1">
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 bg-slate-200 text-slate-800 font-mono text-[10px] font-bold rounded">${iss.issue_id}</span>
                    <span class="px-2 py-0.5 text-[10px] font-bold rounded ${iss.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}">${iss.severity}</span>
                    <span class="text-xs font-bold text-slate-900">${iss.title}</span>
                  </div>
                  <p class="text-xs text-slate-600 leading-relaxed">${iss.description}</p>
                  ${iss.resolution ? `<p class="text-xs text-emerald-700 font-semibold">✔️ Resolution: ${iss.resolution}</p>` : ''}
                  <div class="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                    <span>Category: <strong>${iss.category}</strong></span>
                    <span>Reported by: <strong>${iss.reported_by_name || 'Engineer'}</strong></span>
                    ${iss.evidence ? `<a href="${iss.evidence}" target="_blank" class="text-blue-600 underline font-medium">View Evidence Doc</a>` : ''}
                  </div>
                </div>

                <div class="flex items-center gap-2 flex-shrink-0">
                  <span class="text-xs font-bold px-2 py-1 rounded ${iss.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}">
                    ${iss.status}
                  </span>
                  ${iss.status !== 'RESOLVED' ? `
                    <button data-resolve-issue="${iss.issue_id}" class="text-xs px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 font-semibold rounded transition">
                      Mark Resolved
                    </button>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Technical Documents Repository -->
        <div class="gov-card">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="font-bold text-slate-900 text-sm uppercase tracking-wider">Engineering Documents & Statutory Clearances</h3>
              <p class="text-xs text-slate-500">Official DPRs, Stage-I Forest sanctions, bore hole stratigraphy logs</p>
            </div>
          </div>

          <div class="divide-y divide-slate-100">
            ${this.documents.map(doc => `
              <div class="py-3 flex items-center justify-between text-xs">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm">
                    📄
                  </div>
                  <div>
                    <div class="font-bold text-slate-900">${doc.title}</div>
                    <div class="text-[11px] text-slate-500">Uploaded by ${doc.uploaded_by} on ${doc.uploaded_at} · ${(doc.file_size_kb / 1024).toFixed(1)} MB</div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">${doc.access_scope}</span>
                  <a href="${doc.file_path}" target="_blank" class="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded font-semibold hover:bg-blue-100">
                    Download
                  </a>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // Modal and action event listeners
    const btnForm = container.querySelector("#btn-open-issue-form");
    const btnQuick = container.querySelector("#btn-quick-log-issue");
    if (btnForm) btnForm.addEventListener("click", () => this.showIssueModal());
    if (btnQuick) btnQuick.addEventListener("click", () => this.showIssueModal());

    container.querySelectorAll("[data-resolve-issue]").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const issueId = e.currentTarget.getAttribute("data-resolve-issue");
        const resolution = prompt("Enter engineering resolution details for " + issueId + ":", "Correction implemented as per revised design specification.");
        if (resolution) {
          await window.APIClient.updateIssue(issueId, { status: "RESOLVED", resolution });
          const mainContainer = document.getElementById("main-content");
          if (mainContainer) this.render(mainContainer);
        }
      });
    });
  },

  showIssueModal() {
    const modalId = "modal-site-issue";
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
            <span class="text-xl">⚠️</span>
            <h3 class="font-bold text-slate-900 text-base">Log Technical Site Issue / Impediment</h3>
          </div>
          <button id="close-issue-modal" class="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
        </div>

        <form id="form-create-issue" class="space-y-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Issue Category</label>
            <select id="iss-category" class="w-full text-xs p-2 border border-slate-300 rounded-lg">
              <option value="TECHNICAL" selected>TECHNICAL (Design, Geotechnical, Foundation)</option>
              <option value="FOREST_CLEARANCE">STATUTORY (Forest Stage-II, Environmental, Wild Life)</option>
              <option value="CONTRACTOR">CONTRACTOR (Liquidity, Machinery, Mobilization)</option>
              <option value="LAND_ACQUISITION">REVENUE (RoW, Compensation, Encroachment)</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Severity Tier</label>
            <select id="iss-severity" class="w-full text-xs p-2 border border-slate-300 rounded-lg">
              <option value="CRITICAL">CRITICAL (Direct Critical Path Stoppage)</option>
              <option value="HIGH" selected>HIGH (Potential >30 Days Schedule Delay)</option>
              <option value="MEDIUM">MEDIUM (Operational Non-Conformance)</option>
              <option value="LOW">LOW (Informational)</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Issue Title</label>
            <input type="text" id="iss-title" class="w-full text-xs p-2 border border-slate-300 rounded-lg" placeholder="e.g. Subsurface water ingress during pier excavation" required />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Technical Description & Chainage Location</label>
            <textarea id="iss-description" rows="3" class="w-full text-xs p-2 border border-slate-300 rounded-lg" placeholder="Specify chainage, test results, consultant observations, and remediation requirement..." required></textarea>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Evidence / Test Certificate URL (Optional)</label>
            <input type="text" id="iss-evidence" class="w-full text-xs p-2 border border-slate-300 rounded-lg" placeholder="https://evidence.projectpulse.gov.in/soil-test-report.pdf" />
          </div>

          <div class="pt-2 flex justify-end gap-2">
            <button type="button" id="cancel-issue" class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button type="submit" class="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow">Log Issue</button>
          </div>
        </form>
      </div>
    `;

    modal.classList.remove("hidden");
    modal.querySelector("#close-issue-modal").addEventListener("click", () => modal.remove());
    modal.querySelector("#cancel-issue").addEventListener("click", () => modal.remove());

    modal.querySelector("#form-create-issue").addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = {
        project_id: this.targetProjectId,
        milestone_id: "MS-DEMO-05",
        category: modal.querySelector("#iss-category").value,
        severity: modal.querySelector("#iss-severity").value,
        title: modal.querySelector("#iss-title").value,
        description: modal.querySelector("#iss-description").value,
        evidence: modal.querySelector("#iss-evidence").value
      };

      try {
        await window.APIClient.createIssue(payload);
        modal.remove();
        const mainContainer = document.getElementById("main-content");
        if (mainContainer) this.render(mainContainer);
      } catch (err) {
        alert("Failed to log issue: " + err.message);
      }
    });
  }
};

window.EngineerView = EngineerView;
