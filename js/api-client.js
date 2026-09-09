// ==========================================================================
// PROJECTPULSE — Unified API Client & Offline Fallback Gateway (Phase 9)
// Ministry of Statistics & Programme Implementation (MoSPI) - IPMD / PAIMANA
// Smart India Hackathon 2026 — Team HexaForce
// ==========================================================================

const APIClient = {
  baseUrl: (window.location && window.location.protocol.startsWith("http")) 
    ? window.location.origin 
    : "http://127.0.0.1:8000",
  isLive: false,
  healthData: null,
  currentUser: null,
  token: null,

  async init() {
    // Restore session from localStorage if present
    try {
      this.token = localStorage.getItem("projectpulse_token");
      const storedUser = localStorage.getItem("projectpulse_user");
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
      }
    } catch (e) {
      console.warn("[ProjectPulse API] Could not restore local session:", e);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${this.baseUrl}/api/health`, {
        method: "GET",
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.status === "healthy") {
          this.isLive = true;
          this.healthData = data;
          window.IS_LIVE_BACKEND = true;
          console.log("[ProjectPulse API] Connected to live backend at", this.baseUrl);
          this.renderStatusBadge(true, data);

          // Verify or initialize user session
          await this.verifySession();
          return true;
        }
      }
    } catch (err) {
      console.log("[ProjectPulse API] Live backend not detected, operating in offline fallback mode.");
    }

    this.isLive = false;
    window.IS_LIVE_BACKEND = false;
    if (!this.currentUser) {
      this.currentUser = {
        username: "officer",
        name: "Smt. Priya Sharma",
        designation: "Director (Infrastructure Monitoring)",
        division: "MoSPI / IPMD Surveillance Desk",
        role: "MONITORING_OFFICER",
        badge: "Monitoring Officer",
        permissions: {
          can_view_dashboard: true,
          can_view_projects: true,
          can_view_warnings: true,
          can_manage_warnings: true,
          can_run_scenarios: true,
          can_save_scenarios: true,
          can_view_analytics: true,
          can_view_audit: true,
          can_manage_users: false,
          can_manage_system: false
        }
      };
    }
    this.renderStatusBadge(false);
    this.updateUserInterface();
    return false;
  },

  getAuthHeaders() {
    const headers = { "Content-Type": "application/json" };
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }
    return headers;
  },

  async verifySession() {
    if (!this.isLive) return;
    try {
      const res = await fetch(`${this.baseUrl}/api/auth/me`, {
        headers: this.getAuthHeaders()
      });
      if (res.ok) {
        this.currentUser = await res.json();
        this.updateUserInterface();
      } else if (res.status === 401) {
        // Fallback to default monitoring officer
        await this.switchRole("MONITORING_OFFICER");
      }
    } catch (e) {
      console.warn("[ProjectPulse API] Session verification fallback:", e);
    }
  },

  async login(username, password) {
    if (!this.isLive) {
      this.currentUser = {
        username: username,
        name: username.toUpperCase(),
        designation: "MoSPI Institutional User",
        division: "IPMD Oversight Desk",
        role: username === "admin" ? "ADMIN" : "MONITORING_OFFICER",
        badge: username === "admin" ? "Central Admin" : "Monitoring Officer",
        permissions: { can_view_dashboard: true, can_view_projects: true, can_view_warnings: true, can_manage_warnings: true, can_run_scenarios: true, can_save_scenarios: true, can_view_analytics: true, can_view_audit: true }
      };
      this.updateUserInterface();
      return { success: true, user: this.currentUser };
    }

    try {
      const res = await fetch(`${this.baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const user = await res.json();
        this.currentUser = user;
        this.token = user.token;
        localStorage.setItem("projectpulse_token", user.token);
        localStorage.setItem("projectpulse_user", JSON.stringify(user));
        this.updateUserInterface();
        this.showToast(`Logged in as ${user.name} (${user.role})`, "success");
        return { success: true, user };
      }
      const err = await res.json();
      return { success: false, detail: err.detail || "Authentication failed" };
    } catch (e) {
      return { success: false, detail: e.message };
    }
  },

  async logout() {
    if (this.isLive && this.token) {
      try {
        await fetch(`${this.baseUrl}/api/auth/logout`, {
          method: "POST",
          headers: this.getAuthHeaders()
        });
      } catch (e) {
        // ignore logout errors
      }
    }
    this.token = null;
    this.currentUser = null;
    localStorage.removeItem("projectpulse_token");
    localStorage.removeItem("projectpulse_user");
    await this.switchRole("VIEWER");
    this.showToast("Logged out to Observer mode", "info");
  },

  async switchRole(roleName) {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/api/auth/switch-role`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: roleName })
        });
        if (res.ok) {
          const user = await res.json();
          this.currentUser = user;
          this.token = user.token;
          localStorage.setItem("projectpulse_token", user.token);
          localStorage.setItem("projectpulse_user", JSON.stringify(user));
          this.updateUserInterface();
          this.showToast(`Switched active role to ${user.role}`, "success");
          if (window.Router) window.Router.renderCurrentRoute();
          return user;
        }
      } catch (e) {
        console.warn("[ProjectPulse API] Error switching role:", e);
      }
    }

    // Client fallback role switch
    const rolesMap = {
      NATIONAL_LEADER: { user_id: "USR-MINISTER-01", username: "minister", name: "Dr. Jitendra Singh", role: "NATIONAL_LEADER", badge: "National Leadership", designation: "Union Minister of State (IC)", division: "MoSPI", ministry: "National", scope_type: "NATIONAL", scope_value: "ALL", assigned_projects: [] },
      MINISTER: { user_id: "USR-MINISTER-01", username: "minister", name: "Dr. Jitendra Singh", role: "NATIONAL_LEADER", badge: "National Leadership", designation: "Union Minister of State (IC)", division: "MoSPI", ministry: "National", scope_type: "NATIONAL", scope_value: "ALL", assigned_projects: [] },
      MINISTRY_OFFICIAL: { user_id: "USR-OFFICIAL-01", username: "official", name: "Shri Anurag Jain, IAS", role: "MINISTRY_OFFICIAL", badge: "Ministry Secretary", designation: "Secretary to Government of India", division: "DoRTH", ministry: "Ministry of Road Transport & Highways", scope_type: "MINISTRY", scope_value: "Ministry of Road Transport & Highways", assigned_projects: [] },
      OFFICIAL: { user_id: "USR-OFFICIAL-01", username: "official", name: "Shri Anurag Jain, IAS", role: "MINISTRY_OFFICIAL", badge: "Ministry Secretary", designation: "Secretary to Government of India", division: "DoRTH", ministry: "Ministry of Road Transport & Highways", scope_type: "MINISTRY", scope_value: "Ministry of Road Transport & Highways", assigned_projects: [] },
      ANALYST: { user_id: "USR-ANALYST-01", username: "analyst", name: "Shri Amitav Ghosh", role: "ANALYST", badge: "Senior Analyst", designation: "Senior Data Scientist & Policy Analyst", division: "IPMD Analytics Unit", ministry: "MoSPI / IPMD", scope_type: "PORTFOLIO", scope_value: "ALL_ANALYTICS", assigned_projects: [] },
      PROJECT_MANAGER: { user_id: "USR-PM-01", username: "pm", name: "Shri R.K. Singla", role: "PROJECT_MANAGER", badge: "Project Manager", designation: "Chief General Manager & Project Director", division: "NHAI Corridor PIU", ministry: "Ministry of Road Transport & Highways", scope_type: "PROJECT", scope_value: "PRJ-SYN-000002,PRJ-SYN-000003,PRJ-SYN-000004", assigned_projects: ["PRJ-SYN-000002", "PRJ-SYN-000003", "PRJ-SYN-000004"] },
      PM: { user_id: "USR-PM-01", username: "pm", name: "Shri R.K. Singla", role: "PROJECT_MANAGER", badge: "Project Manager", designation: "Chief General Manager & Project Director", division: "NHAI Corridor PIU", ministry: "Ministry of Road Transport & Highways", scope_type: "PROJECT", scope_value: "PRJ-SYN-000002,PRJ-SYN-000003,PRJ-SYN-000004", assigned_projects: ["PRJ-SYN-000002", "PRJ-SYN-000003", "PRJ-SYN-000004"] },
      ENGINEER: { user_id: "USR-ENGINEER-01", username: "engineer", name: "Er. Neha Verma", role: "ENGINEER", badge: "Site Engineer", designation: "Executive Resident Engineer (Civil)", division: "NHAI Corridor PIU", ministry: "Ministry of Road Transport & Highways", scope_type: "PROJECT", scope_value: "PRJ-SYN-000002", assigned_projects: ["PRJ-SYN-000002"] },
      FIELD_WORKER: { user_id: "USR-FIELD-01", username: "field", name: "Shri Rajesh Gurjar", role: "FIELD_WORKER", badge: "Field Operations", designation: "Senior Site Supervisor (PKG-3)", division: "NH Field Unit", ministry: "Ministry of Road Transport & Highways", scope_type: "SITE", scope_value: "PRJ-SYN-000002", assigned_projects: ["PRJ-SYN-000002"] },
      FIELD: { user_id: "USR-FIELD-01", username: "field", name: "Shri Rajesh Gurjar", role: "FIELD_WORKER", badge: "Field Operations", designation: "Senior Site Supervisor (PKG-3)", division: "NH Field Unit", ministry: "Ministry of Road Transport & Highways", scope_type: "SITE", scope_value: "PRJ-SYN-000002", assigned_projects: ["PRJ-SYN-000002"] },
      ADMIN: { user_id: "USR-ADMIN-01", username: "admin", name: "Dr. Rajesh Kumar", role: "ADMIN", badge: "Central Admin", designation: "Joint Secretary & Mission Director", division: "MoSPI / IPMD", ministry: "MoSPI", scope_type: "SYSTEM", scope_value: "ALL", assigned_projects: [] },
      MONITORING_OFFICER: { user_id: "USR-OFFICER-01", username: "officer", name: "Smt. Priya Sharma", role: "MONITORING_OFFICER", badge: "Monitoring Officer", designation: "Director (Infrastructure Monitoring)", division: "MoSPI / IPMD Surveillance Desk", ministry: "MoSPI", scope_type: "NATIONAL", scope_value: "ALL", assigned_projects: [] },
      VIEWER: { user_id: "USR-VIEWER-01", username: "viewer", name: "Shri Vikram Mehta", role: "VIEWER", badge: "Observer", designation: "Central Sector Observer", division: "NITI Aayog", ministry: "National", scope_type: "NATIONAL", scope_value: "ALL", assigned_projects: [] }
    };

    const sel = rolesMap[roleName.toUpperCase()] || rolesMap["MONITORING_OFFICER"];
    this.currentUser = {
      ...sel,
      permissions: {
        can_view_dashboard: true,
        can_view_projects: true,
        can_view_warnings: true,
        can_manage_warnings: sel.role === "ADMIN" || sel.role === "MONITORING_OFFICER",
        can_run_scenarios: true,
        can_save_scenarios: sel.role !== "VIEWER" && sel.role !== "FIELD_WORKER",
        can_view_analytics: sel.role !== "FIELD_WORKER",
        can_view_audit: sel.role === "ADMIN" || sel.role === "MONITORING_OFFICER"
      }
    };
    this.updateUserInterface();
    this.showToast(`Switched active role to ${this.currentUser.role}`, "success");
    if (window.Router) window.Router.renderCurrentRoute();
    return this.currentUser;
  },

  updateUserInterface() {
    const userBadgeMount = document.getElementById("header-user-badge");
    const userNameMount = document.getElementById("header-user-name");
    const userRoleMount = document.getElementById("header-user-role");
    const userAvatarMount = document.getElementById("header-user-avatar");

    if (this.currentUser) {
      if (userNameMount) userNameMount.innerText = this.currentUser.name;
      if (userRoleMount) userRoleMount.innerText = `${this.currentUser.badge || this.currentUser.role}`;
      if (userAvatarMount) {
        const initials = this.currentUser.name.split(" ").map(n => n[0]).filter(Boolean).slice(-2).join("") || "MO";
        userAvatarMount.innerText = initials;
      }
      if (userBadgeMount) {
        let color = "bg-blue-100 text-blue-800 border-blue-200";
        if (this.currentUser.role === "NATIONAL_LEADER") color = "bg-indigo-100 text-indigo-900 border-indigo-300 font-extrabold";
        else if (this.currentUser.role === "MINISTRY_OFFICIAL") color = "bg-cyan-100 text-cyan-900 border-cyan-300 font-bold";
        else if (this.currentUser.role === "ADMIN") color = "bg-purple-100 text-purple-800 border-purple-200";
        else if (this.currentUser.role === "PROJECT_MANAGER") color = "bg-sky-100 text-sky-800 border-sky-300";
        else if (this.currentUser.role === "ENGINEER") color = "bg-emerald-100 text-emerald-800 border-emerald-300";
        else if (this.currentUser.role === "FIELD_WORKER") color = "bg-amber-100 text-amber-900 border-amber-300";
        else if (this.currentUser.role === "MONITORING_OFFICER") color = "bg-teal-100 text-teal-800 border-teal-200";
        else if (this.currentUser.role === "ANALYST") color = "bg-violet-100 text-violet-800 border-violet-200";
        else if (this.currentUser.role === "VIEWER") color = "bg-slate-100 text-slate-800 border-slate-200";
        userBadgeMount.className = `px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${color}`;
        userBadgeMount.innerText = this.currentUser.role.replace("_", " ");
      }
      if (window.AppShell && window.AppShell.updateNavForRole) {
        window.AppShell.updateNavForRole(this.currentUser.role);
      }
    }
  },

  renderStatusBadge(isLive, data = null) {
    const mount = document.getElementById("backend-status-indicator");
    if (!mount) return;

    if (isLive) {
      mount.innerHTML = `
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-sm" title="Connected to local SQLite database & LightGBM inference engine">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>LIVE ENGINE: 10,000 Projects (SQLite + LightGBM)</span>
        </span>
      `;
    } else {
      mount.innerHTML = `
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200" title="Running in standalone browser offline mode">
          <span class="w-2 h-2 rounded-full bg-slate-400"></span>
          <span>OFFLINE LOCAL REPOSITORY</span>
        </span>
      `;
    }
  },

  showToast(message, type = "info") {
    let toastContainer = document.getElementById("app-toast-container");
    if (!toastContainer) {
      toastContainer = document.createElement("div");
      toastContainer.id = "app-toast-container";
      toastContainer.className = "fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none";
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement("div");
    let bg = "bg-slate-900 text-white border-slate-800";
    let icon = "ℹ️";
    if (type === "success") { bg = "bg-emerald-900 text-emerald-50 border-emerald-700"; icon = "✅"; }
    else if (type === "warning") { bg = "bg-amber-900 text-amber-50 border-amber-700"; icon = "⚠️"; }
    else if (type === "error") { bg = "bg-red-900 text-red-50 border-red-700"; icon = "❌"; }

    toast.className = `pointer-events-auto px-4 py-2.5 rounded-lg shadow-lg border text-xs font-medium flex items-center gap-2.5 transition-all transform duration-200 translate-y-2 opacity-0 ${bg}`;
    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove("translate-y-2", "opacity-0");
    });

    setTimeout(() => {
      toast.classList.add("translate-y-2", "opacity-0");
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  },

  async getDashboardSummary() {
    if (!this.isLive) return window.MOCK_DASHBOARD_SUMMARY || null;
    try {
      const res = await fetch(`${this.baseUrl}/api/dashboard/summary`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("[ProjectPulse API] Dashboard fetch failed, falling back to mock:", e);
    }
    return window.MOCK_DASHBOARD_SUMMARY || null;
  },

  async getAnalyticsSummary() {
    if (!this.isLive) return null;
    try {
      const res = await fetch(`${this.baseUrl}/api/analytics/summary`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("[ProjectPulse API] Analytics fetch failed:", e);
    }
    return null;
  },

  async getPortfolioMatrix(limit = 250) {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/api/portfolio/matrix?limit=${limit}`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn("[ProjectPulse API] Portfolio matrix fetch failed, falling back to mock:", e);
      }
    }
    const all = window.MOCK_PROJECTS || [];
    const matrix = all.slice(0, limit).map(p => ({
      project_id: p.project_id,
      project_name: p.project_name,
      ministry: p.ministry,
      sector: p.sector,
      state: p.state || "National",
      revised_cost_cr: (p.financials && p.financials.revised_cost_cr) || 5000,
      cost_overrun_cr: (p.financials && p.financials.cost_overrun_cr) || 500,
      overall_risk_score: (p.risk && p.risk.overall_score) || 65.0,
      target_risk_class: (p.risk && p.risk.level) || "HIGH",
      schedule_slippage_months: (p.schedule && p.schedule.delay_duration_months) || 12.0,
      progress_decoupling_gap: (p.progress && p.progress.progress_gap_pct) || 15.0,
      primary_bottleneck: p.primary_bottleneck || "land_acquisition"
    }));
    return { status: "success", total: matrix.length, matrix };
  },

  async getProjects(params = {}) {
    if (!this.isLive) {
      let all = [...(window.MOCK_PROJECTS || [])];
      if (params.search) {
        const q = params.search.toLowerCase();
        all = all.filter(p => (p.project_name || "").toLowerCase().includes(q) || (p.project_id || "").toLowerCase().includes(q));
      }
      if (params.sector && params.sector !== "ALL") {
        all = all.filter(p => p.sector === params.sector);
      }
      if (params.ministry && params.ministry !== "ALL") {
        all = all.filter(p => p.ministry === params.ministry);
      }
      if (params.risk_tier && params.risk_tier !== "ALL") {
        all = all.filter(p => (p.risk && p.risk.level === params.risk_tier) || p.target_risk_class === params.risk_tier);
      }
      if (params.bottleneck && params.bottleneck !== "ALL") {
        const bn = params.bottleneck.toLowerCase().replace(/ /g, "_");
        all = all.filter(p => {
          const val = (p.primary_bottleneck || (p.risk && p.risk.primary_driver) || "").toLowerCase();
          return val.includes(bn) || val.includes(params.bottleneck.toLowerCase());
        });
      }
      if (params.state && params.state !== "ALL") {
        all = all.filter(p => p.state === params.state);
      }
      const page = parseInt(params.page || 1, 10);
      const pageSize = parseInt(params.page_size || 20, 10);
      const start = (page - 1) * pageSize;
      const paginated = all.slice(start, start + pageSize);
      return { total_records: all.length, page, page_size: pageSize, items: paginated };
    }
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${this.baseUrl}/api/projects?${query}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("[ProjectPulse API] Projects fetch failed:", e);
    }
    const all = window.MOCK_PROJECTS || [];
    return { total_records: all.length, page: 1, page_size: all.length, items: all };
  },

  async getProject(projectId, includeShap = true) {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/api/projects/${encodeURIComponent(projectId)}?include_shap=${includeShap}`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn(`[ProjectPulse API] Project ${projectId} fetch failed:`, e);
      }
    }
    const all = window.MOCK_PROJECTS || [];
    return all.find(p => p.project_id === projectId) || all[0] || null;
  },

  async getAlerts(params = {}) {
    if (!this.isLive) {
      const all = window.MOCK_ALERTS || [];
      return { total_records: all.length, page: 1, page_size: all.length, items: all };
    }
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${this.baseUrl}/api/alerts?${query}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("[ProjectPulse API] Alerts fetch failed:", e);
    }
    const all = window.MOCK_ALERTS || [];
    return { total_records: all.length, page: 1, page_size: all.length, items: all };
  },

  async updateAlertStatus(alertId, newStatus, notes = "") {
    if (!this.currentUser || (this.currentUser.role !== "ADMIN" && this.currentUser.role !== "MONITORING_OFFICER")) {
      this.showToast("Action forbidden: Only Monitoring Officers or Admins can triage alerts", "error");
      return { error: "Permission denied" };
    }

    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/api/alerts/${encodeURIComponent(alertId)}/status`, {
          method: "PATCH",
          headers: this.getAuthHeaders(),
          body: JSON.stringify({ status: newStatus, notes })
        });
        if (res.ok) {
          const data = await res.json();
          this.showToast(`Alert ${alertId} marked as ${newStatus}`, "success");
          return data;
        }
        const err = await res.json();
        this.showToast(err.detail || "Failed to update alert", "error");
        return { error: err.detail };
      } catch (e) {
        console.warn("[ProjectPulse API] Alert update error:", e);
        return { error: e.message };
      }
    }

    // Mock fallback
    this.showToast(`[Mock] Alert ${alertId} updated to ${newStatus}`, "success");
    return { alert_id: alertId, new_status: newStatus };
  },

  async getAuditLogs(params = {}) {
    if (this.isLive) {
      try {
        const query = new URLSearchParams(params).toString();
        const res = await fetch(`${this.baseUrl}/api/audit?${query}`, {
          headers: this.getAuthHeaders()
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn("[ProjectPulse API] Failed to fetch audit logs:", e);
      }
    }
    return { total: 0, page: 1, page_size: 20, logs: [] };
  },

  async getProjectAuditHistory(projectId) {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/api/projects/${encodeURIComponent(projectId)}/history`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn(`[ProjectPulse API] Project history failed for ${projectId}:`, e);
      }
    }
    return [];
  },

  // ==========================================================================
  // Phase 7: What-If Scenario API Methods
  // ==========================================================================
  async getScenarioCatalog() {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/api/scenarios/catalog`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn("[ProjectPulse API] Failed to fetch scenario catalog:", e);
      }
    }
    return null;
  },

  async simulateScenario(payload) {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/api/scenarios/simulate`, {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(payload)
        });
        if (res.ok) return await res.json();
        const err = await res.json();
        console.error("[ProjectPulse API] Simulation error:", err);
        return { error: err.detail || "Simulation validation failed" };
      } catch (e) {
        console.warn("[ProjectPulse API] Scenario simulation error:", e);
        return { error: e.message };
      }
    }
    return null;
  },

  async runSensitivity(payload) {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/api/scenarios/sensitivity`, {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(payload)
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn("[ProjectPulse API] Sensitivity analysis error:", e);
      }
    }
    return null;
  },

  async getProjectScenarios(projectId) {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/api/projects/${encodeURIComponent(projectId)}/scenarios`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn("[ProjectPulse API] Failed to list project scenarios:", e);
      }
    }
    return [];
  },

  async saveScenario(scenarioId, data) {
    if (!this.currentUser || this.currentUser.role === "VIEWER") {
      this.showToast("Action forbidden: Viewers cannot save scenarios to database", "error");
      return { error: "Permission denied" };
    }

    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/api/scenarios/${encodeURIComponent(scenarioId)}/save`, {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(data)
        });
        if (res.ok) {
          this.showToast("Scenario saved to institutional records", "success");
          return await res.json();
        }
      } catch (e) {
        console.warn("[ProjectPulse API] Failed to save scenario:", e);
      }
    }
    return { status: "error" };
  },

  async deleteScenario(scenarioId) {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/api/scenarios/${encodeURIComponent(scenarioId)}`, {
          method: "DELETE",
          headers: this.getAuthHeaders()
        });
        if (res.ok) {
          this.showToast("Scenario removed from records", "info");
          return await res.json();
        }
      } catch (e) {
        console.warn("[ProjectPulse API] Failed to delete scenario:", e);
      }
    }
    return { status: "error" };
  },

  async compareScenarios(payload) {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/api/scenarios/compare`, {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(payload)
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn("[ProjectPulse API] Scenario comparison error:", e);
      }
    }
    return null;
  },

  async simulate(payload) {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/api/simulate`, {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(payload)
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn("[ProjectPulse API] Simulation endpoint error, running client fallback:", e);
      }
    }
    return this.fallbackSimulate(payload);
  },

  fallbackSimulate(payload) {
    const all = window.MOCK_PROJECTS || [];
    const p = all.find(x => x.project_id === payload.project_id) || all[0] || {};
    const baseScore = p.risk ? p.risk.overall_score : 75.0;
    const baseDelay = p.schedule ? (p.schedule.delay_duration_months || 18.0) : 18.0;
    const baseCost = p.financials ? (p.financials.cost_overrun_cr || 350.0) : 350.0;

    let deltaScore = 0;
    let deltaDelay = 0;
    let deltaCost = 0;
    const applied = [];

    if (payload.resolve_bottleneck) {
      deltaScore += 18.5;
      deltaDelay += 7.2;
      deltaCost += baseCost * 0.32;
      applied.push("Statutory Clearance Fast-Track (Single-Window Clearance)");
    }
    if (payload.infuse_contractor_support) {
      deltaScore += 12.0;
      deltaDelay += 4.5;
      deltaCost += baseCost * 0.22;
      applied.push("Contractor Liquidity Mobilization & Dispute Arbitration");
    }
    if (payload.reschedule_milestones) {
      deltaScore += 9.5;
      deltaDelay += 3.8;
      deltaCost += baseCost * 0.15;
      applied.push("Critical Path CPM Milestone Re-baselining");
    }
    if (payload.progress_boost_pct > 0) {
      deltaScore += payload.progress_boost_pct * 0.8;
      deltaDelay += payload.progress_boost_pct * 0.3;
      applied.push(`Direct Physical Acceleration (+${payload.progress_boost_pct}%)`);
    }

    const simScore = Math.max(15.0, Math.round(baseScore - deltaScore));
    const simDelay = Math.max(0.0, parseFloat((baseDelay - deltaDelay).toFixed(1)));
    const simCost = Math.max(0.0, parseFloat((baseCost - deltaCost).toFixed(1)));
    const capSaved = parseFloat(deltaCost.toFixed(1));

    const simClass = simScore < 30 ? "LOW" : simScore < 60 ? "MODERATE" : simScore < 80 ? "HIGH" : "CRITICAL";
    const baseClass = p.risk ? p.risk.level : "HIGH";

    return {
      project_id: p.project_id || "PRJ-SIM",
      project_name: p.project_name || "Demonstration Project",
      baseline: {
        risk_class: baseClass,
        risk_score: baseScore,
        delay_months: baseDelay,
        cost_overrun_cr: baseCost
      },
      simulated: {
        risk_class: simClass,
        risk_score: simScore,
        delay_months: simDelay,
        cost_overrun_cr: simCost
      },
      impact: {
        risk_score_reduction: Math.round(baseScore - simScore),
        delay_reduction_months: parseFloat((baseDelay - simDelay).toFixed(1)),
        capital_saved_cr: capSaved,
        total_economic_benefit_cr: parseFloat((capSaved + (deltaDelay * 4.2)).toFixed(1)),
        tier_transition: `${baseClass} ➔ ${simClass}`,
        interventions_applied: applied,
        recommendation_level: (deltaScore >= 18) ? "HIGH_PRIORITY_INTERVENTION" : (deltaScore > 0) ? "MODERATE_BENEFIT_INTERVENTION" : "BASELINE_MAINTAINED",
        executive_rationale: (deltaScore >= 18) 
          ? "Highly recommended for immediate Empowered Committee ratification. Delivers substantial fiscal and schedule recovery." 
          : "Standard policy adjustment."
      }
    };
  },

  // -------------------------------------------------------------
  // Phase 10: Mock Fallback Datasets & API Methods
  // -------------------------------------------------------------
  mockTasks: [
    { task_id: "TSK-001", project_id: "PRJ-SYN-000002", project_name: "Varanasi-Ranchi-Kolkata Expressway — Section I", milestone_id: "MS-DEMO-05", site_id: "SITE-KRISHNA-BRIDGE", assigned_to: "USR-FIELD-01", task_type: "CIVIL_CONSTRUCTION", title: "Pier Cap P7 Concrete Reinforcement Inspection", description: "Verify rebar spacing and coordinate load cell calibration before high water surge", priority: "HIGH", status: "IN_PROGRESS", due_date: "2026-09-15", completed_at: null, evidence_url: "https://evidence.projectpulse.gov.in/pier-p7-log.pdf", remarks: "Monsoon flood level monitoring active; pump dewatering installed." },
    { task_id: "TSK-002", project_id: "PRJ-SYN-000002", project_name: "Varanasi-Ranchi-Kolkata Expressway — Section I", milestone_id: "MS-DEMO-06", site_id: "SITE-PKG-3-FOREST", assigned_to: "USR-FIELD-01", task_type: "LAND_CLEARANCE", title: "Forest Boundary Demarcation & Tree Felling Audit", description: "Complete pillar tagging across Chainage 142+000 to 148+500 with DFO team", priority: "CRITICAL", status: "BLOCKED", due_date: "2026-09-12", completed_at: null, evidence_url: null, remarks: "Forest Range Officer signature pending on Joint Inspection Memo." },
    { task_id: "TSK-003", project_id: "PRJ-SYN-000002", project_name: "Varanasi-Ranchi-Kolkata Expressway — Section I", milestone_id: "MS-DEMO-08", site_id: "SITE-PAVING-SEC-A", assigned_to: "USR-FIELD-01", task_type: "INSPECTION", title: "PQC Paving Slump & Core Sampling (Km 120-125)", description: "Measure flexural strength of pavement quality concrete batches 14 through 22", priority: "MEDIUM", status: "COMPLETED", due_date: "2026-09-08", completed_at: "2026-09-08 17:30:00", evidence_url: "https://evidence.projectpulse.gov.in/core-sample-cert.pdf", remarks: "Compressive strength 45.2 MPa achieved. Approved for curing." },
    { task_id: "TSK-004", project_id: "PRJ-SYN-000002", project_name: "Varanasi-Ranchi-Kolkata Expressway — Section I", milestone_id: "MS-DEMO-07", site_id: "SITE-VIADUCT-NORTH", assigned_to: "USR-FIELD-01", task_type: "SAFETY_CHECK", title: "Pre-Cast Segment Gantry Crane Load Proofing", description: "Inspect hydraulic tension jacks and guide cables on launching girder G-2", priority: "HIGH", status: "TODO", due_date: "2026-09-18", completed_at: null, evidence_url: null, remarks: "Awaiting mobile crane contractor mobilization." },
    { task_id: "TSK-005", project_id: "PRJ-SYN-000002", project_name: "Varanasi-Ranchi-Kolkata Expressway — Section I", milestone_id: "MS-DEMO-05", site_id: "SITE-KRISHNA-BRIDGE", assigned_to: "USR-ENGINEER-01", task_type: "TECHNICAL_DOCUMENT", title: "Foundation Soil Profile Core Test Report Ratification", description: "Review geotechnical stratigraphy for Pier P8-P12 riverbed foundations", priority: "HIGH", status: "IN_PROGRESS", due_date: "2026-09-16", completed_at: null, evidence_url: "https://evidence.projectpulse.gov.in/soil-profile-p8.pdf", remarks: "Found soft clay seam at -18m; requires 3m additional socketing into bedrock." },
    { task_id: "TSK-006", project_id: "PRJ-SYN-000002", project_name: "Varanasi-Ranchi-Kolkata Expressway — Section I", milestone_id: "MS-DEMO-06", site_id: "SITE-PKG-3-FOREST", assigned_to: "USR-ENGINEER-01", task_type: "CLEARANCE_SUBMISSION", title: "PARIVESH Portal Form-C Compliance Submission", description: "Upload Compensatory Afforestation Land (CAL) survey maps and GPS coordinates to MoEFCC", priority: "CRITICAL", status: "IN_PROGRESS", due_date: "2026-09-14", completed_at: null, evidence_url: null, remarks: "Maps endorsed by District Collector; awaiting final digital signature." }
  ],
  mockIssues: [
    { issue_id: "ISS-001", project_id: "PRJ-SYN-000002", project_name: "Varanasi-Ranchi-Kolkata Expressway — Section I", milestone_id: "MS-DEMO-06", reported_by: "USR-FIELD-01", reported_by_name: "Shri Rajesh Gurjar", category: "FOREST_CLEARANCE", severity: "CRITICAL", title: "Forest Department Stage-II Handover Stalled at Chainage 144", description: "Local forest ranger halted tree removal awaiting formal Compensatory Afforestation fee credit confirmation.", status: "OPEN", assigned_to: "USR-ENGINEER-01", created_at: "2026-09-02 11:30:00", updated_at: null, resolution: null, evidence: "https://evidence.projectpulse.gov.in/forest-halt-notice.pdf" },
    { issue_id: "ISS-002", project_id: "PRJ-SYN-000002", project_name: "Varanasi-Ranchi-Kolkata Expressway — Section I", milestone_id: "MS-DEMO-05", reported_by: "USR-ENGINEER-01", reported_by_name: "Er. Neha Verma", category: "DESIGN_CHANGE", severity: "HIGH", title: "River Bed Scour Depth Recalculation for Monsoon 2026", description: "Central Water Commission updated flood discharge estimates requiring 1.8m deeper pier foundations.", status: "IN_PROGRESS", assigned_to: "USR-PM-01", created_at: "2026-08-25 14:15:00", updated_at: null, resolution: null, evidence: "https://evidence.projectpulse.gov.in/scour-depth-cwc.pdf" },
    { issue_id: "ISS-003", project_id: "PRJ-SYN-000002", project_name: "Varanasi-Ranchi-Kolkata Expressway — Section I", milestone_id: "MS-DEMO-07", reported_by: "USR-PM-01", reported_by_name: "Shri R.K. Singla", category: "CONTRACTOR", severity: "HIGH", title: "EPC Concessionaire Working Capital Liquidity Strain", description: "Main contractor facing cash flow bottleneck due to delayed mobilization advance bank guarantee.", status: "ESCALATED", assigned_to: "USR-OFFICIAL-01", created_at: "2026-08-28 09:40:00", updated_at: null, resolution: null, evidence: "https://evidence.projectpulse.gov.in/contractor-claim.pdf" }
  ],
  mockDirectives: [
    { directive_id: "DIR-NAT-2026-01", issued_by: "Dr. Jitendra Singh", issuer_role: "NATIONAL_LEADER", target_scope: "NATIONAL", target_id: "ALL", title: "National Infrastructure Acceleration Mandate — PM GatiShakti De-confliction", instructions: "All Central Sector Megaprojects facing statutory clearance delays over 90 days must be submitted to the Empowered Group of Secretaries (EGoS) for single-window resolution.", priority: "IMMEDIATE_ESCALATION", status: "ACTIVE", created_at: "2026-08-15", compliance_notes: "34 projects forwarded to EGoS registry including NH-44 and EDFC-II." },
    { directive_id: "DIR-MIN-2026-04", issued_by: "Shri Anurag Jain, IAS", issuer_role: "MINISTRY_OFFICIAL", target_scope: "MINISTRY", target_id: "Ministry of Road Transport & Highways", title: "Special Taskforce on Land Acquisition & RoW Handover for Strategic Corridors", instructions: "Project Directors must convene weekly coordination meetings with State Revenue Commissioners. Unresolved revenue awards to be settled via direct consent formula within 45 days.", priority: "URGENT", status: "ACKNOWLEDGED", created_at: "2026-08-20", compliance_notes: "Direct consent compensation disbursed in 4 districts of Telangana." },
    { directive_id: "DIR-PRJ-2026-11", issued_by: "Shri R.K. Singla", issuer_role: "PROJECT_MANAGER", target_scope: "PROJECT", target_id: "PRJ-SYN-000002", title: "Site Mobilization Directive: Double-Shift Execution on Krishna River Viaduct", instructions: "Concessionaire ordered to mobilize additional 250 MT crane and auxiliary power generators to catch up on monsoon substructure delays before November COD target.", priority: "URGENT", status: "COMPLIED", created_at: "2026-09-01", compliance_notes: "Second shift crane operational as of September 4, 2026." }
  ],
  mockDocuments: [
    { document_id: "DOC-001", project_id: "PRJ-SYN-000002", document_type: "APPROVAL", title: "Cabinet Committee on Economic Affairs (CCEA) Sanction Order", file_path: "/docs/NH44/CCEA_Sanction_2022.pdf", uploaded_by: "MoRTH Secretarial Desk", uploaded_at: "2022-09-10", version: "1.0", access_scope: "PUBLIC", file_size_kb: 2450 },
    { document_id: "DOC-002", project_id: "PRJ-SYN-000002", document_type: "PROJECT_PLAN", title: "Detailed Project Report (DPR) Volume I - Engineering Feasibility", file_path: "/docs/NH44/DPR_Vol1_Technical.pdf", uploaded_by: "NHAI Planning Wing", uploaded_at: "2022-11-15", version: "2.1", access_scope: "PROJECT_TEAM", file_size_kb: 14820 },
    { document_id: "DOC-003", project_id: "PRJ-SYN-000002", document_type: "COMPLIANCE_DOCUMENT", title: "MoEFCC Stage-I Forest Clearance In-Principle Approval", file_path: "/docs/NH44/MoEFCC_Stage1_Clearance.pdf", uploaded_by: "State Forest Liaison Officer", uploaded_at: "2023-04-12", version: "1.0", access_scope: "MINISTRY", file_size_kb: 1850 },
    { document_id: "DOC-004", project_id: "PRJ-SYN-000002", document_type: "MILESTONE_EVIDENCE", title: "Subgrade Earthwork Section A Completion Certificate", file_path: "/docs/NH44/Subgrade_SecA_Cert.pdf", uploaded_by: "Er. Neha Verma", uploaded_at: "2024-01-05", version: "1.0", access_scope: "PROJECT_TEAM", file_size_kb: 3200 },
    { document_id: "DOC-005", project_id: "PRJ-SYN-000002", document_type: "SITE_EVIDENCE", title: "Geotechnical Bore Hole Stratigraphy Logs (Krishna River Bed)", file_path: "/docs/NH44/Geotech_Krishna_BoreLogs.pdf", uploaded_by: "Er. Neha Verma", uploaded_at: "2024-06-18", version: "1.2", access_scope: "PROJECT_TEAM", file_size_kb: 8940 }
  ],
  mockNotifications: [
    { notification_id: "NOTIF-001", user_id: "USR-MINISTER-01", title: "National Risk Escalation", message: "3 megaprojects entered Critical Risk tier across Road and Rail corridors.", type: "ALERT", project_id: "PRJ-SYN-000002", read_status: 0, created_at: "2026-09-09 10:00:00" },
    { notification_id: "NOTIF-002", user_id: "USR-OFFICIAL-01", title: "Ministerial Directive Received", message: "National Infrastructure Acceleration Mandate issued by Cabinet Secretariat.", type: "DIRECTIVE", project_id: "PRJ-SYN-000002", read_status: 0, created_at: "2026-09-09 09:30:00" },
    { notification_id: "NOTIF-003", user_id: "USR-PM-01", title: "High Priority Issue Logged", message: "Forest Stage-II Handover Stalled at Chainage 144 on NH-44.", type: "ALERT", project_id: "PRJ-SYN-000002", read_status: 0, created_at: "2026-09-09 08:45:00" },
    { notification_id: "NOTIF-004", user_id: "USR-ENGINEER-01", title: "Task Re-assignment", message: "Compensatory Afforestation Land submission due in 48 hours.", type: "TASK", project_id: "PRJ-SYN-000002", read_status: 0, created_at: "2026-09-09 08:00:00" },
    { notification_id: "NOTIF-005", user_id: "USR-FIELD-01", title: "Daily Task Due", message: "Pier Cap P7 Concrete Reinforcement Inspection scheduled for completion today.", type: "TASK", project_id: "PRJ-SYN-000002", read_status: 0, created_at: "2026-09-09 07:30:00" }
  ],

  async getMinistrySummary(ministry = null) {
    if (this.isLive) {
      try {
        const url = ministry 
          ? `${this.baseUrl}/api/ministry/summary?ministry=${encodeURIComponent(ministry)}`
          : `${this.baseUrl}/api/ministry/summary`;
        const res = await fetch(url, { headers: this.getAuthHeaders() });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn("[ProjectPulse API] Ministry summary fetch error:", e);
      }
    }
    return this.fallbackMinistrySummary(ministry || "Ministry of Road Transport & Highways");
  },

  fallbackMinistrySummary(ministryName) {
    return {
      ministry_name: ministryName,
      tracked_projects_count: 4113,
      total_revised_cost_formatted: "₹ 16,84,200.0 Cr",
      total_revised_cost_raw: 1684200.0,
      total_overrun_formatted: "₹ 2,14,500.0 Cr",
      total_overrun_raw: 214500.0,
      projects_requiring_review_count: 742,
      capital_at_risk_formatted: "₹ 3,42,800.0 Cr",
      avg_physical_progress: 58.4,
      avg_financial_progress: 69.2,
      avg_slippage_months: 14.6,
      risk_distribution: { low: 1840, moderate: 1531, high: 612, critical: 130 },
      sectors: [
        { sector: "Roads & Highways", project_count: 3950, total_cost: 1620000.0, high_risk_count: 710 },
        { sector: "Bridges & Tunnels", project_count: 163, total_cost: 64200.0, high_risk_count: 32 }
      ],
      states: [
        { state: "Uttar Pradesh", project_count: 512, total_cost: 210000.0, high_risk_count: 94 },
        { state: "Maharashtra", project_count: 480, total_cost: 195000.0, high_risk_count: 82 },
        { state: "Bihar", project_count: 380, total_cost: 154000.0, high_risk_count: 88 },
        { state: "Rajasthan", project_count: 340, total_cost: 138000.0, high_risk_count: 62 },
        { state: "Madhya Pradesh", project_count: 320, total_cost: 129000.0, high_risk_count: 58 }
      ]
    };
  },

  async listTasks(params = {}) {
    if (this.isLive) {
      try {
        const q = new URLSearchParams();
        if (params.project_id) q.set("project_id", params.project_id);
        if (params.assigned_to) q.set("assigned_to", params.assigned_to);
        if (params.status) q.set("status", params.status);
        const res = await fetch(`${this.baseUrl}/api/tasks?${q.toString()}`, { headers: this.getAuthHeaders() });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn("[ProjectPulse API] List tasks error:", e);
      }
    }
    let tasks = [...this.mockTasks];
    if (params.project_id) tasks = tasks.filter(t => t.project_id === params.project_id);
    if (params.assigned_to) tasks = tasks.filter(t => t.assigned_to === params.assigned_to);
    if (params.status) tasks = tasks.filter(t => t.status === params.status);
    return { status: "success", count: tasks.length, tasks };
  },

  async updateTask(taskId, payload) {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/api/tasks/${encodeURIComponent(taskId)}`, {
          method: "PATCH",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          this.showToast(`Task ${taskId} updated: ${payload.status}`, "success");
          return await res.json();
        }
      } catch (e) {
        console.warn("[ProjectPulse API] Task update error:", e);
      }
    }
    const t = this.mockTasks.find(x => x.task_id === taskId);
    if (t) {
      if (payload.status) t.status = payload.status;
      if (payload.remarks) t.remarks = payload.remarks;
      if (payload.evidence_url) t.evidence_url = payload.evidence_url;
      if (payload.status === "COMPLETED") t.completed_at = new Date().toISOString().replace("T", " ").substring(0, 19);
    }
    this.showToast(`Task ${taskId} updated: ${payload.status}`, "success");
    return { status: "success", task: t };
  },

  async listIssues(params = {}) {
    if (this.isLive) {
      try {
        const q = new URLSearchParams();
        if (params.project_id) q.set("project_id", params.project_id);
        if (params.status) q.set("status", params.status);
        const res = await fetch(`${this.baseUrl}/api/issues?${q.toString()}`, { headers: this.getAuthHeaders() });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn("[ProjectPulse API] List issues error:", e);
      }
    }
    let issues = [...this.mockIssues];
    if (params.project_id) issues = issues.filter(i => i.project_id === params.project_id);
    if (params.status) issues = issues.filter(i => i.status === params.status);
    return { status: "success", count: issues.length, issues };
  },

  async createIssue(payload) {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/api/issues`, {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          this.showToast("Technical issue logged successfully", "success");
          return await res.json();
        }
      } catch (e) {
        console.warn("[ProjectPulse API] Create issue error:", e);
      }
    }
    const newIssue = {
      issue_id: `ISS-${Math.floor(1000 + Math.random() * 9000)}`,
      project_id: payload.project_id,
      project_name: "Varanasi-Ranchi-Kolkata Expressway — Section I",
      milestone_id: payload.milestone_id || "MS-DEMO-04",
      reported_by: this.currentUser ? this.currentUser.user_id : "USR-ENGINEER-01",
      reported_by_name: this.currentUser ? this.currentUser.name : "Er. Neha Verma",
      category: payload.category || "TECHNICAL",
      severity: payload.severity || "HIGH",
      title: payload.title,
      description: payload.description,
      status: "OPEN",
      assigned_to: "USR-PM-01",
      created_at: new Date().toISOString().replace("T", " ").substring(0, 19),
      evidence: payload.evidence || null
    };
    this.mockIssues.unshift(newIssue);
    this.showToast("Technical issue logged successfully", "success");
    return { status: "success", issue: newIssue };
  },

  async updateIssue(issueId, payload) {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/api/issues/${encodeURIComponent(issueId)}`, {
          method: "PATCH",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          this.showToast(`Issue ${issueId} updated`, "success");
          return await res.json();
        }
      } catch (e) {
        console.warn("[ProjectPulse API] Update issue error:", e);
      }
    }
    const issue = this.mockIssues.find(i => i.issue_id === issueId);
    if (issue) {
      if (payload.status) issue.status = payload.status;
      if (payload.resolution) issue.resolution = payload.resolution;
      issue.updated_at = new Date().toISOString().replace("T", " ").substring(0, 19);
    }
    this.showToast(`Issue ${issueId} updated`, "success");
    return { status: "success", issue };
  },

  async listDocuments(params = {}) {
    if (this.isLive) {
      try {
        const q = new URLSearchParams();
        if (params.project_id) q.set("project_id", params.project_id);
        if (params.access_scope) q.set("access_scope", params.access_scope);
        const res = await fetch(`${this.baseUrl}/api/documents?${q.toString()}`, { headers: this.getAuthHeaders() });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn("[ProjectPulse API] List documents error:", e);
      }
    }
    let docs = [...this.mockDocuments];
    if (params.project_id) docs = docs.filter(d => d.project_id === params.project_id);
    return { status: "success", count: docs.length, documents: docs };
  },

  async listDirectives(params = {}) {
    if (this.isLive) {
      try {
        const q = new URLSearchParams();
        if (params.target_scope) q.set("target_scope", params.target_scope);
        if (params.target_id) q.set("target_id", params.target_id);
        if (params.status) q.set("status", params.status);
        const res = await fetch(`${this.baseUrl}/api/directives?${q.toString()}`, { headers: this.getAuthHeaders() });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn("[ProjectPulse API] List directives error:", e);
      }
    }
    return { status: "success", count: this.mockDirectives.length, directives: this.mockDirectives };
  },

  async createDirective(payload) {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/api/directives`, {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          this.showToast("Policy directive issued successfully", "success");
          return await res.json();
        }
      } catch (e) {
        console.warn("[ProjectPulse API] Create directive error:", e);
      }
    }
    const newDir = {
      directive_id: `DIR-${Math.floor(1000 + Math.random() * 9000)}`,
      issued_by: this.currentUser ? this.currentUser.name : "Union Minister",
      issuer_role: this.currentUser ? this.currentUser.role : "NATIONAL_LEADER",
      target_scope: payload.target_scope,
      target_id: payload.target_id,
      title: payload.title,
      instructions: payload.instructions,
      priority: payload.priority || "HIGH",
      status: "ACTIVE",
      created_at: new Date().toISOString().substring(0, 10),
      compliance_notes: ""
    };
    this.mockDirectives.unshift(newDir);
    this.showToast("Policy directive issued successfully", "success");
    return { status: "success", directive: newDir };
  },

  async updateDirectiveStatus(directiveId, payload) {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/api/directives/${encodeURIComponent(directiveId)}/status`, {
          method: "PATCH",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          this.showToast(`Directive updated: ${payload.status}`, "success");
          return await res.json();
        }
      } catch (e) {
        console.warn("[ProjectPulse API] Directive status update error:", e);
      }
    }
    const d = this.mockDirectives.find(x => x.directive_id === directiveId);
    if (d) {
      d.status = payload.status;
      if (payload.compliance_notes) d.compliance_notes = payload.compliance_notes;
    }
    this.showToast(`Directive updated: ${payload.status}`, "success");
    return { status: "success", directive: d };
  },

  async listNotifications(unreadOnly = false) {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/api/notifications?unread_only=${unreadOnly}`, { headers: this.getAuthHeaders() });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn("[ProjectPulse API] Notifications error:", e);
      }
    }
    return { status: "success", count: this.mockNotifications.length, notifications: this.mockNotifications };
  },

  async markNotificationRead(notificationId) {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/api/notifications/${encodeURIComponent(notificationId)}/read`, {
          method: "PATCH",
          headers: this.getAuthHeaders()
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn("[ProjectPulse API] Mark read error:", e);
      }
    }
    const note = this.mockNotifications.find(n => n.notification_id === notificationId);
    if (note) note.read_status = 1;
    return { status: "success", notification_id: notificationId };
  },

  async getAIBrief(params = {}) {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/api/ai/brief`, { headers: this.getAuthHeaders() });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn("[ProjectPulse API] AI Brief error:", e);
      }
    }
    const role = this.currentUser ? this.currentUser.role : "MONITORING_OFFICER";
    if (role === "NATIONAL_LEADER") {
      return {
        title: "National Infrastructure Strategic Briefing",
        role: role,
        target: "Union Cabinet & Apex Leadership",
        summary: "10,000 Central Sector Projects monitored under MoSPI IPMD. Total Capital at Risk in High/Critical band is ₹1,63,607.7 Cr across 1,847 flagged projects. Primary macro systemic risk driver: Land Acquisition clearances (38.2%) and Forest Clearances (22.5%).",
        action_recommendation: "Recommend convening PMG (Project Monitoring Group) apex review for top 10 highway and rail corridors currently exhibiting severe progress decoupling.",
        disclaimer: "AI briefing generated from deterministic IPMD telemetry and LightGBM predictive models. Non-causal sensitivity indicators."
      };
    } else if (role === "MINISTRY_OFFICIAL") {
      return {
        title: "Ministry Executive Intelligence Brief: MoRTH",
        role: role,
        target: "Ministry Secretary & Heads of Implementing Agencies",
        summary: "MoRTH portfolio analysis highlights 2 critical corridors with decoupling gap exceeding 25 percentage points. 3 state boundary land acquisition clearances pending beyond 180 days.",
        action_recommendation: "Expedite ROW clearance in NH-44 Package-3 corridor to avert estimated ₹42.5 Cr monthly escalation liability.",
        disclaimer: "AI briefing generated from deterministic IPMD telemetry and LightGBM predictive models. Non-causal sensitivity indicators."
      };
    } else if (role === "PROJECT_MANAGER") {
      return {
        title: "Operational Project Manager Intervention Brief",
        role: role,
        target: "Project Director / PIU Heads",
        summary: "Assigned project PRJ-SYN-000002 is experiencing acute critical path bottleneck on Forest Clearance Section-IV. Milestone 4 is currently 42 days overdue.",
        action_recommendation: "Initiate contractor liquidity advance and mobilize joint survey team with State Forest Department to clear Section 4.5km ROW.",
        disclaimer: "AI counterfactual sensitivity model. Actual schedule impacts depend on contractor performance and regulatory execution."
      };
    } else if (role === "ENGINEER" || role === "FIELD_WORKER") {
      return {
        title: "Site Engineering & Operational Execution Brief",
        role: role,
        target: "Site Resident Engineer & Field Supervisors",
        summary: "Site telemetry for Varanasi-Ranchi-Kolkata Expressway: 3 open issues requiring technical signoff. Pier Cap P7 inspection pending high water surge.",
        action_recommendation: "Complete safety barrier check and submit geo-tagged compaction density test reports for Chainage 42+500.",
        disclaimer: "Operational telemetry feed. Physical progress validated against field geo-coordinates."
      };
    }
    return {
      title: "Institutional Infrastructure Risk Intelligence Brief",
      role: role,
      target: "Monitoring & Evaluation Division",
      summary: "10,000 Central Sector projects evaluated with TreeSHAP feature attribution. Predictive accuracy: 88.4% ROC-AUC on 90-day delay classification.",
      action_recommendation: "Review early warning radar triage queue for 12 new high-priority escalation signals.",
      disclaimer: "Decision support system complementing PAIMANA. All predictions require administrative verification."
    };
  }
};

window.APIClient = APIClient;
