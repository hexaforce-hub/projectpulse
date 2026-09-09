// ==========================================================================
// PROJECTPULSE — Phase 10: Downward Directives & Governance Escalations
// Ministry of Statistics & Programme Implementation (MoSPI) - IPMD
// Smart India Hackathon 2026 — Team HexaForce
// ==========================================================================

const DirectivesView = {
  directives: [],
  selectedScope: "ALL",

  async render(container) {
    container.innerHTML = `
      <div class="space-y-6 animate-fade-in">
        <div class="p-8 text-center text-slate-500">
          <div class="inline-block animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mb-3"></div>
          <p class="text-sm font-medium">Loading Directives & Escalation Registry...</p>
        </div>
      </div>
    `;

    try {
      const res = await window.APIClient.listDirectives();
      this.directives = (res && res.directives) ? res.directives : [];
      this.renderContent(container);
    } catch (e) {
      console.error("[DirectivesView] Render error:", e);
      container.innerHTML = `
        <div class="p-8 text-center bg-red-50 text-red-700 rounded-xl border border-red-200">
          <p class="font-bold mb-1">Failed to load directives.</p>
          <p class="text-xs">${e.message}</p>
        </div>
      `;
    }
  },

  renderContent(container) {
    const user = window.APIClient.currentUser || {};
    const canIssue = ["NATIONAL_LEADER", "MINISTRY_OFFICIAL", "ADMIN"].includes(user.role);

    const filtered = this.selectedScope === "ALL"
      ? this.directives
      : this.directives.filter(d => d.target_scope === this.selectedScope);

    container.innerHTML = `
      <div class="space-y-6 animate-fade-in">
        <!-- Directives Header Banner -->
        <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 rounded-full text-xs font-bold uppercase tracking-wider">
                📜 Downward Governance Directives
              </span>
              <span class="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded text-xs font-semibold">
                Two-Way Policy Flow
              </span>
            </div>
            <h1 class="text-2xl font-extrabold text-white">
              Institutional Directives & Escalation Tracker
            </h1>
            <p class="text-xs text-slate-300 max-w-2xl">
              Official binding instructions dispatched from Union Ministerial leadership and Ministry Secretaries down to Corridor Directors and Field Implementation Units.
            </p>
          </div>

          ${canIssue ? `
            <button id="btn-issue-new-dir" class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 flex-shrink-0">
              <span>✍️</span> Issue New Directive
            </button>
          ` : ''}
        </div>

        <!-- Filter Bar -->
        <div class="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 text-xs">
          <span class="text-slate-500 font-bold px-2">Scope Filter:</span>
          ${["ALL", "NATIONAL", "MINISTRY", "PROJECT"].map(sc => `
            <button data-scope-filter="${sc}" class="px-3 py-1.5 font-bold rounded-lg transition ${
              this.selectedScope === sc ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }">
              ${sc}
            </button>
          `).join('')}
        </div>

        <!-- Directives List -->
        <div class="space-y-4">
          ${filtered.length === 0 ? `
            <div class="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
              No directives found for selected scope.
            </div>
          ` : filtered.map(d => `
            <div class="gov-card space-y-3">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="px-2 py-0.5 bg-indigo-100 text-indigo-900 font-mono text-xs font-bold rounded">${d.directive_id}</span>
                  <span class="px-2 py-0.5 text-xs font-bold rounded ${
                    d.priority === 'IMMEDIATE_ESCALATION' ? 'bg-rose-100 text-rose-800' :
                    d.priority === 'URGENT' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                  }">
                    ${d.priority}
                  </span>
                  <span class="text-xs px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded font-semibold">
                    Scope: ${d.target_scope} (${d.target_id})
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold px-2.5 py-1 rounded ${
                    d.status === 'COMPLIED' ? 'bg-emerald-100 text-emerald-800' :
                    d.status === 'ACKNOWLEDGED' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                  }">
                    ${d.status}
                  </span>
                  <button data-update-directive="${d.directive_id}" class="text-xs px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold rounded transition">
                    Update Status
                  </button>
                </div>
              </div>

              <div>
                <h3 class="font-bold text-slate-900 text-sm mb-1">${d.title}</h3>
                <p class="text-xs text-slate-600 leading-relaxed">${d.instructions}</p>
              </div>

              ${d.compliance_notes ? `
                <div class="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs text-emerald-900 space-y-1">
                  <div class="font-bold flex items-center gap-1.5">
                    <span>✔️</span> Compliance Response & Field Verification
                  </div>
                  <p class="text-emerald-800 leading-relaxed">${d.compliance_notes}</p>
                </div>
              ` : ''}

              <div class="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                <span>Issued by: <strong>${d.issued_by}</strong> (${d.issuer_role.replace("_", " ")})</span>
                <span>Date: ${d.created_at}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Filter event handlers
    container.querySelectorAll("[data-scope-filter]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        this.selectedScope = e.currentTarget.getAttribute("data-scope-filter");
        this.renderContent(container);
      });
    });

    // Action button to issue new directive
    const btnNew = container.querySelector("#btn-issue-new-dir");
    if (btnNew) {
      btnNew.addEventListener("click", () => {
        if (window.MinistryView) {
          window.MinistryView.showDirectiveModal();
        }
      });
    }

    // Directive status updater
    container.querySelectorAll("[data-update-directive]").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const dirId = e.currentTarget.getAttribute("data-update-directive");
        const status = prompt("Update status to (ACTIVE, ACKNOWLEDGED, COMPLIED):", "COMPLIED");
        if (status) {
          const notes = prompt("Enter compliance progress notes:", "Field PIU verified compliance.");
          await window.APIClient.updateDirectiveStatus(dirId, { status: status.toUpperCase(), compliance_notes: notes });
          const mainContainer = document.getElementById("main-content");
          if (mainContainer) this.render(mainContainer);
        }
      });
    });
  }
};

window.DirectivesView = DirectivesView;
