// ==========================================================================
// PROJECTPULSE — Settings & Governance View Component (Phase 9)
// Ministry of Statistics & Programme Implementation (MoSPI) - IPMD
// Smart India Hackathon 2026 — Team HexaForce
// Route: /settings
// ==========================================================================

const SettingsView = {
  currentTab: "session",
  auditPage: 1,
  auditPageSize: 10,
  auditFilterAction: "",

  render() {
    const user = (window.APIClient && window.APIClient.currentUser) || {
      name: "Smt. Priya Sharma",
      role: "MONITORING_OFFICER",
      badge: "Monitoring Officer",
      designation: "Director (Infrastructure Monitoring)",
      division: "MoSPI / IPMD Surveillance Desk"
    };

    return `
      <div class="max-w-[1440px] mx-auto space-y-6">
        
        <!-- Header & Classification -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-slate-200 text-slate-800 border border-slate-300">
                Administration & Audit
              </span>
              <span class="text-caption text-slate-400">• MoSPI IPMD System Governance</span>
            </div>
            <h1 class="text-page-title">System Settings, Access Control & Audit</h1>
            <p class="text-caption text-slate-500 mt-0.5">
              Role-based access credentials, ML model registry specifications, platform governance, and tamper-evident audit trails
            </p>
          </div>
          <div class="flex items-center gap-2">
            ${CommonUI.renderDataStatus("SYNTHETIC")}
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button data-tab="session" class="settings-tab-btn px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${this.currentTab === 'session' ? 'bg-blue-900 text-white border-blue-900 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}">
            Officer Session & RBAC
          </button>
          <button data-tab="models" class="settings-tab-btn px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${this.currentTab === 'models' ? 'bg-blue-900 text-white border-blue-900 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}">
            ML Model Registry
          </button>
          <button data-tab="governance" class="settings-tab-btn px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${this.currentTab === 'governance' ? 'bg-blue-900 text-white border-blue-900 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}">
            Platform Architecture & Data Source
          </button>
          <button data-tab="audit" class="settings-tab-btn px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${this.currentTab === 'audit' ? 'bg-blue-900 text-white border-blue-900 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}">
            System Audit Log
          </button>
        </div>

        <!-- Tab Content Container -->
        <div id="settings-tab-mount">
          ${this.renderActiveTab()}
        </div>

      </div>
    `;
  },

  renderActiveTab() {
    if (this.currentTab === "session") return this.renderSessionTab();
    if (this.currentTab === "models") return this.renderModelsTab();
    if (this.currentTab === "governance") return this.renderGovernanceTab();
    if (this.currentTab === "audit") return this.renderAuditTab();
    return "";
  },

  renderSessionTab() {
    const user = (window.APIClient && window.APIClient.currentUser) || {
      name: "Smt. Priya Sharma",
      role: "MONITORING_OFFICER",
      badge: "Monitoring Officer",
      designation: "Director (Infrastructure Monitoring)",
      division: "MoSPI / IPMD Surveillance Desk"
    };

    return `
      <div class="space-y-6">
        <!-- Active User Profile Card -->
        <div class="gov-card p-5 bg-white border border-slate-200 shadow-sm">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-full bg-blue-900 text-white font-bold text-xl flex items-center justify-center border-2 border-blue-200 shadow-inner">
                ${user.name.split(" ").map(n => n[0]).filter(Boolean).slice(-2).join("")}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-base font-bold text-slate-900">${user.name}</h3>
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                    ${user.badge || user.role}
                  </span>
                </div>
                <div class="text-caption text-slate-600 mt-0.5">${user.designation}</div>
                <div class="text-[11px] text-slate-400">${user.division}</div>
              </div>
            </div>
            <div class="text-right">
              <span class="text-caption text-slate-400 block">Session Status</span>
              <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mt-1">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Authenticated via Bearer Token
              </span>
            </div>
          </div>

          <!-- Permissions Matrix -->
          <div class="mt-4">
            <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Granted Operational Permissions</h4>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
              ${this.renderPermissionBadge("Portfolio Dashboard", true)}
              ${this.renderPermissionBadge("Project Catalog", true)}
              ${this.renderPermissionBadge("Early Warning Radar", true)}
              ${this.renderPermissionBadge("Alert Triage & Status", user.role === "ADMIN" || user.role === "MONITORING_OFFICER")}
              ${this.renderPermissionBadge("TreeSHAP Explainability", true)}
              ${this.renderPermissionBadge("Run What-If Scenarios", true)}
              ${this.renderPermissionBadge("Save What-If Scenarios", user.role !== "VIEWER")}
              ${this.renderPermissionBadge("System Audit Trail", user.role === "ADMIN" || user.role === "MONITORING_OFFICER")}
            </div>
          </div>
        </div>

        <!-- 1-Click Role Switcher for Hackathon Evaluation -->
        <div class="gov-card p-5 bg-white border border-slate-200 shadow-sm space-y-3">
          <div class="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 class="text-card-title text-slate-900">Judge & Evaluator Role Switcher</h3>
              <p class="text-caption text-slate-500">Instant persona switcher to evaluate the platform from different institutional perspectives</p>
            </div>
            <span class="px-2 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 rounded">
              SIH 2026 DEMO TOOL
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            
            <button data-role="ADMIN" class="role-switch-btn p-3 text-left rounded-lg border transition-all ${user.role === 'ADMIN' ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-200' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}">
              <div class="flex items-center justify-between">
                <span class="font-bold text-xs text-purple-900">1. Central Admin</span>
                <span class="text-caption">👑</span>
              </div>
              <div class="text-[11px] font-medium text-slate-700 mt-1">Dr. Rajesh Kumar</div>
              <div class="text-[10px] text-slate-500 line-clamp-1">Joint Secretary & Mission Director</div>
              <div class="mt-2 text-[10px] text-purple-700 font-semibold flex items-center gap-1">
                <span>Full access, user mgmt, triage</span>
              </div>
            </button>

            <button data-role="MONITORING_OFFICER" class="role-switch-btn p-3 text-left rounded-lg border transition-all ${user.role === 'MONITORING_OFFICER' ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-200' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}">
              <div class="flex items-center justify-between">
                <span class="font-bold text-xs text-emerald-900">2. Monitoring Officer</span>
                <span class="text-caption">🛡️</span>
              </div>
              <div class="text-[11px] font-medium text-slate-700 mt-1">Smt. Priya Sharma</div>
              <div class="text-[10px] text-slate-500 line-clamp-1">Director (Infra Monitoring)</div>
              <div class="mt-2 text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                <span>Alert triage, what-if, audit logs</span>
              </div>
            </button>

            <button data-role="ANALYST" class="role-switch-btn p-3 text-left rounded-lg border transition-all ${user.role === 'ANALYST' ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-200' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}">
              <div class="flex items-center justify-between">
                <span class="font-bold text-xs text-amber-900">3. Senior Analyst</span>
                <span class="text-caption">📊</span>
              </div>
              <div class="text-[11px] font-medium text-slate-700 mt-1">Shri Amitav Ghosh</div>
              <div class="text-[10px] text-slate-500 line-clamp-1">Data Scientist & Policy Analyst</div>
              <div class="mt-2 text-[10px] text-amber-700 font-semibold flex items-center gap-1">
                <span>SHAP deep-dive, run scenarios</span>
              </div>
            </button>

            <button data-role="VIEWER" class="role-switch-btn p-3 text-left rounded-lg border transition-all ${user.role === 'VIEWER' ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-200' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}">
              <div class="flex items-center justify-between">
                <span class="font-bold text-xs text-slate-900">4. Observer / Viewer</span>
                <span class="text-caption">👁️</span>
              </div>
              <div class="text-[11px] font-medium text-slate-700 mt-1">Shri Vikram Mehta</div>
              <div class="text-[10px] text-slate-500 line-clamp-1">Central Sector Observer</div>
              <div class="mt-2 text-[10px] text-slate-600 font-semibold flex items-center gap-1">
                <span>Read-only portfolio surveillance</span>
              </div>
            </button>

          </div>
        </div>
      </div>
    `;
  },

  renderPermissionBadge(label, allowed) {
    if (allowed) {
      return `
        <div class="flex items-center gap-1.5 p-2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
          <span>✓</span>
          <span class="font-medium">${label}</span>
        </div>
      `;
    }
    return `
      <div class="flex items-center gap-1.5 p-2 rounded bg-slate-50 text-slate-400 border border-slate-200 opacity-60">
        <span>✕</span>
        <span class="line-through">${label}</span>
      </div>
    `;
  },

  renderModelsTab() {
    return `
      <div class="space-y-4">
        <div class="gov-card p-5 bg-white border border-slate-200 shadow-sm space-y-4">
          <div class="border-b border-slate-100 pb-2">
            <h3 class="text-card-title text-slate-900">Machine Learning Model Registry</h3>
            <p class="text-caption text-slate-500">Active predictive models powering delay classification, cost growth regression, and risk ranking</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div class="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <div class="flex items-center justify-between">
                <span class="font-bold text-xs text-blue-900">Schedule Slippage Engine</span>
                <span class="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-100 text-emerald-800 rounded">ACTIVE</span>
              </div>
              <div class="text-caption text-slate-600">Dual LightGBM Classifier & Regressor</div>
              <div class="space-y-1 text-xs pt-1 border-t border-slate-200">
                <div class="flex justify-between"><span class="text-slate-500">ROC-AUC:</span> <strong class="font-mono">0.892</strong></div>
                <div class="flex justify-between"><span class="text-slate-500">Regression MAE:</span> <strong class="font-mono">3.8 mos</strong></div>
                <div class="flex justify-between"><span class="text-slate-500">Key Feature:</span> <span class="font-mono text-[11px]">milestone_slippage_rate</span></div>
              </div>
            </div>

            <div class="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <div class="flex items-center justify-between">
                <span class="font-bold text-xs text-blue-900">Cost Escalation Engine</span>
                <span class="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-100 text-emerald-800 rounded">ACTIVE</span>
              </div>
              <div class="text-caption text-slate-600">Dual LightGBM Classifier & Regressor</div>
              <div class="space-y-1 text-xs pt-1 border-t border-slate-200">
                <div class="flex justify-between"><span class="text-slate-500">ROC-AUC:</span> <strong class="font-mono">0.864</strong></div>
                <div class="flex justify-between"><span class="text-slate-500">Growth MAE:</span> <strong class="font-mono">4.2%</strong></div>
                <div class="flex justify-between"><span class="text-slate-500">Key Feature:</span> <span class="font-mono text-[11px]">progress_decoupling_gap</span></div>
              </div>
            </div>

            <div class="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <div class="flex items-center justify-between">
                <span class="font-bold text-xs text-blue-900">Implementation Risk Classifier</span>
                <span class="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-100 text-emerald-800 rounded">ACTIVE</span>
              </div>
              <div class="text-caption text-slate-600">4-Class Ordinal Risk Banding</div>
              <div class="space-y-1 text-xs pt-1 border-t border-slate-200">
                <div class="flex justify-between"><span class="text-slate-500">F1 (Macro):</span> <strong class="font-mono">0.841</strong></div>
                <div class="flex justify-between"><span class="text-slate-500">Classes:</span> <strong class="font-mono">LOW / MOD / HIGH / CRIT</strong></div>
                <div class="flex justify-between"><span class="text-slate-500">Explainability:</span> <span class="text-[11px] font-semibold text-purple-700">TreeSHAP Fast Exact</span></div>
              </div>
            </div>

          </div>

          <div class="p-4 bg-blue-50/60 rounded-lg border border-blue-200 text-xs text-blue-900 space-y-1">
            <div class="font-bold flex items-center gap-1.5">
              <span>⚠️</span> <span>Decision Support & Sensitivity Notice:</span>
            </div>
            <p class="leading-relaxed">
              Models evaluate empirical associative correlations from MoSPI historical patterns. Counterfactual scenario interventions illustrate model sensitivity curves under parameter adjustments and do NOT guarantee causal certainty.
            </p>
          </div>
        </div>
      </div>
    `;
  },

  renderGovernanceTab() {
    return `
      <div class="space-y-4">
        <div class="gov-card p-5 bg-white border border-slate-200 shadow-sm space-y-4">
          <div class="border-b border-slate-100 pb-2">
            <h3 class="text-card-title text-slate-900">Platform Architecture & Data Source Integrity</h3>
            <p class="text-caption text-slate-500">MoSPI PAIMANA architectural alignment and air-gapped execution verification</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <h4 class="font-bold text-xs text-slate-800 uppercase tracking-wide">Data Source Foundation</h4>
              <div class="space-y-1.5 text-caption">
                <div class="flex justify-between py-1 border-b border-slate-200/60">
                  <span class="text-slate-500">Ecosystem Alignment:</span>
                  <strong class="text-slate-900">MoSPI PAIMANA / OCMS Data Schema</strong>
                </div>
                <div class="flex justify-between py-1 border-b border-slate-200/60">
                  <span class="text-slate-500">Portfolio Scale:</span>
                  <strong class="font-mono text-slate-900">10,000 Projects Pre-loaded</strong>
                </div>
                <div class="flex justify-between py-1 border-b border-slate-200/60">
                  <span class="text-slate-500">Data Classification:</span>
                  <span class="font-semibold text-blue-800">SYNTHETIC PROTOTYPE DATA</span>
                </div>
                <div class="flex justify-between py-1">
                  <span class="text-slate-500">Storage Engine:</span>
                  <span class="font-mono text-slate-700">SQLite 3 (ACID, Indexed, Offline)</span>
                </div>
              </div>
            </div>

            <div class="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <h4 class="font-bold text-xs text-slate-800 uppercase tracking-wide">Offline Autonomy Guarantee</h4>
              <div class="space-y-1.5 text-caption">
                <div class="flex justify-between py-1 border-b border-slate-200/60">
                  <span class="text-slate-500">Network Dependency:</span>
                  <strong class="text-emerald-700">Zero External APIs Required</strong>
                </div>
                <div class="flex justify-between py-1 border-b border-slate-200/60">
                  <span class="text-slate-500">Localhost Server:</span>
                  <span class="font-mono text-slate-800">FastAPI on 127.0.0.1:8000</span>
                </div>
                <div class="flex justify-between py-1 border-b border-slate-200/60">
                  <span class="text-slate-500">Launch Script:</span>
                  <span class="font-mono text-slate-800">run_server.bat / run_demo.bat</span>
                </div>
                <div class="flex justify-between py-1">
                  <span class="text-slate-500">Browser Compatibility:</span>
                  <span class="text-slate-700">Chrome, Edge, Firefox, Safari</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  renderAuditTab() {
    return `
      <div class="space-y-4">
        <div class="gov-card p-5 bg-white border border-slate-200 shadow-sm space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 class="text-card-title text-slate-900">Institutional Governance & System Audit Log</h3>
              <p class="text-caption text-slate-500">Immutable transactional log capturing user authentication, role changes, alert triage, and scenario execution</p>
            </div>
            
            <div class="flex items-center gap-2">
              <select id="audit-action-filter" class="form-select text-xs py-1.5 px-2.5 rounded-md border-slate-200 bg-slate-50">
                <option value="">All Audit Actions</option>
                <option value="USER_LOGIN">User Logins</option>
                <option value="ROLE_SWITCH">Role Switches</option>
                <option value="ALERT_STATUS_UPDATE">Alert Status Triages</option>
                <option value="SCENARIO_SIMULATE">Scenario Simulations</option>
                <option value="SCENARIO_SAVED">Scenario Saves</option>
              </select>

              <button id="audit-refresh-btn" class="btn btn-secondary btn-sm text-xs flex items-center gap-1">
                <span>🔄</span> Refresh
              </button>
            </div>
          </div>

          <div class="gov-table-container">
            <table class="gov-table">
              <thead>
                <tr>
                  <th style="width: 70px;">Log ID</th>
                  <th style="width: 140px;">Timestamp</th>
                  <th style="width: 150px;">Officer & Actor</th>
                  <th style="width: 120px;">Active Role</th>
                  <th style="width: 160px;">Action Type</th>
                  <th style="width: 130px;">Resource Target</th>
                  <th>Transaction Details & Notes</th>
                </tr>
              </thead>
              <tbody id="audit-table-body">
                <tr>
                  <td colspan="7" class="text-center py-8 text-slate-400">
                    <div class="inline-flex items-center gap-2">
                      <span class="w-4 h-4 rounded-full border-2 border-slate-300 border-t-blue-600 animate-spin"></span>
                      <span>Loading audit trail...</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Audit Pagination -->
          <div class="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <span class="text-slate-500" id="audit-page-info">Showing audit records...</span>
            <div class="flex items-center gap-2">
              <button id="audit-prev-btn" class="btn btn-secondary btn-sm px-2.5 py-1 disabled:opacity-50" disabled>&larr; Prev</button>
              <span class="font-mono text-slate-700" id="audit-current-page">Page 1</span>
              <button id="audit-next-btn" class="btn btn-secondary btn-sm px-2.5 py-1 disabled:opacity-50">Next &rarr;</button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  async postRender() {
    // Bind Tab switching
    document.querySelectorAll(".settings-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        this.currentTab = btn.dataset.tab;
        this.updateTabStyles();
        const mount = document.getElementById("settings-tab-mount");
        if (mount) {
          mount.innerHTML = this.renderActiveTab();
          this.postRenderActiveTab();
        }
      });
    });

    this.postRenderActiveTab();
  },

  updateTabStyles() {
    document.querySelectorAll(".settings-tab-btn").forEach(btn => {
      const tab = btn.dataset.tab;
      if (tab === this.currentTab) {
        btn.className = "settings-tab-btn px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all bg-blue-900 text-white border-blue-900 shadow-sm";
      } else {
        btn.className = "settings-tab-btn px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all bg-white text-slate-600 border-slate-200 hover:bg-slate-50";
      }
    });
  },

  postRenderActiveTab() {
    if (this.currentTab === "session") {
      // Role Switcher buttons
      document.querySelectorAll(".role-switch-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
          const role = btn.dataset.role;
          await window.APIClient.switchRole(role);
          // Re-render settings view
          const mount = document.getElementById("settings-tab-mount");
          if (mount) {
            mount.innerHTML = this.renderActiveTab();
            this.postRenderActiveTab();
          }
        });
      });
    } else if (this.currentTab === "audit") {
      const filterSelect = document.getElementById("audit-action-filter");
      if (filterSelect) {
        filterSelect.addEventListener("change", (e) => {
          this.auditFilterAction = e.target.value;
          this.auditPage = 1;
          this.loadAuditLogs();
        });
      }

      const refreshBtn = document.getElementById("audit-refresh-btn");
      if (refreshBtn) {
        refreshBtn.addEventListener("click", () => {
          this.loadAuditLogs();
          window.APIClient.showToast("Audit logs refreshed", "info");
        });
      }

      const prevBtn = document.getElementById("audit-prev-btn");
      const nextBtn = document.getElementById("audit-next-btn");
      if (prevBtn) {
        prevBtn.addEventListener("click", () => {
          if (this.auditPage > 1) {
            this.auditPage--;
            this.loadAuditLogs();
          }
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          this.auditPage++;
          this.loadAuditLogs();
        });
      }

      this.loadAuditLogs();
    }
  },

  async loadAuditLogs() {
    const tbody = document.getElementById("audit-table-body");
    if (!tbody) return;

    try {
      const params = {
        page: this.auditPage,
        page_size: this.auditPageSize
      };
      if (this.auditFilterAction) params.action = this.auditFilterAction;

      const data = await window.APIClient.getAuditLogs(params);
      const logs = data.logs || [];

      if (logs.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="7" class="text-center py-8 text-slate-500">
              No audit log entries recorded matching filter.
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = logs.map(l => {
        let actionBadge = "bg-slate-100 text-slate-700";
        if (l.action === "USER_LOGIN" || l.action === "ROLE_SWITCH") actionBadge = "bg-purple-100 text-purple-800";
        else if (l.action === "ALERT_STATUS_UPDATE") actionBadge = "bg-amber-100 text-amber-800";
        else if (l.action.includes("SCENARIO")) actionBadge = "bg-blue-100 text-blue-800";

        return `
          <tr class="hover:bg-slate-50/75">
            <td class="font-mono text-xs text-slate-400">#${l.id}</td>
            <td class="font-mono text-xs text-slate-500">${l.timestamp.replace("T", " ").slice(0, 19)}</td>
            <td class="font-semibold text-xs text-slate-900">${l.actor}</td>
            <td>
              <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                ${l.role}
              </span>
            </td>
            <td>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold ${actionBadge}">
                ${l.action}
              </span>
            </td>
            <td class="font-mono text-xs text-slate-600 line-clamp-1">${l.resource || "System"}</td>
            <td class="text-xs text-slate-700 leading-relaxed">${l.details || "—"}</td>
          </tr>
        `;
      }).join("");

      // Update Pagination info
      const total = data.total || logs.length;
      const pageInfo = document.getElementById("audit-page-info");
      const curPage = document.getElementById("audit-current-page");
      const prevBtn = document.getElementById("audit-prev-btn");
      const nextBtn = document.getElementById("audit-next-btn");

      if (pageInfo) pageInfo.innerText = `Showing page ${this.auditPage} (${total} total audit records)`;
      if (curPage) curPage.innerText = `Page ${this.auditPage}`;
      if (prevBtn) prevBtn.disabled = this.auditPage <= 1;
      if (nextBtn) {
        const maxPages = Math.max(1, Math.ceil(total / this.auditPageSize));
        nextBtn.disabled = this.auditPage >= maxPages;
      }

    } catch (e) {
      console.warn("[SettingsView] Error loading audit logs:", e);
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-6 text-red-600 text-xs">
            Failed to load audit logs from backend.
          </td>
        </tr>
      `;
    }
  }
};

window.SettingsView = SettingsView;
