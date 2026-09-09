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
      FIELD_OFFICER: { user_id: "USR-FO-01", username: "fo", name: "Shri Sanjay Sharma", role: "FIELD_OFFICER", badge: "Field Officer", designation: "Divisional Field Operations Officer", division: "NHAI Field Division", ministry: "Ministry of Road Transport & Highways", scope_type: "PROJECT", scope_value: "PRJ-SYN-000002", assigned_projects: ["PRJ-SYN-000002"] },
      FO: { user_id: "USR-FO-01", username: "fo", name: "Shri Sanjay Sharma", role: "FIELD_OFFICER", badge: "Field Officer", designation: "Divisional Field Operations Officer", division: "NHAI Field Division", ministry: "Ministry of Road Transport & Highways", scope_type: "PROJECT", scope_value: "PRJ-SYN-000002", assigned_projects: ["PRJ-SYN-000002"] },
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
        else if (this.currentUser.role === "FIELD_OFFICER") color = "bg-orange-100 text-orange-900 border-orange-300 font-bold";
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

  // Alias: listProjects → getProjects (used by MinistryView, ProjectManagerView)
  async listProjects(params = {}) {
    return this.getProjects(params);
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
  },

  // ==========================================================================
  // PHASE 11: AI-Assisted Execution & Intelligence Engine Methods
  // ==========================================================================

  async onboardProject(projectData) {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/api/projects`, {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(projectData)
        });
        if (res.ok) {
          const data = await res.json();
          this.showToast(`Project ${data.project_id || data.project?.project_id} onboarded successfully!`, "success");
          return data;
        }
      } catch (e) {
        console.warn("[ProjectPulse API] Project onboarding live call error:", e);
      }
    }
    const pid = projectData.project_id || `PRJ-ONBOARD-${Date.now().toString().slice(-4)}`;
    const mockPrj = {
      project_id: pid,
      project_name: projectData.project_name || "New Infrastructure Corridor",
      ministry: projectData.ministry || "Ministry of Road Transport & Highways",
      implementing_agency: projectData.implementing_agency || "NHAI",
      state: projectData.state || "Uttar Pradesh",
      district: projectData.district || "Varanasi",
      original_cost_inr_cr: projectData.original_cost_inr_cr || 1250.0,
      revised_cost_inr_cr: projectData.original_cost_inr_cr || 1250.0,
      start_date: projectData.start_date || "2026-04-01",
      target_completion_date: projectData.target_completion_date || "2029-03-31",
      status: "APPROVED",
      created_at: new Date().toISOString()
    };
    this.showToast(`[Offline] Project ${pid} onboarded into registry`, "success");
    return { status: "success", project: mockPrj, project_id: pid };
  },

  async uploadProjectDocument(projectId, docData) {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/api/projects/${encodeURIComponent(projectId)}/documents`, {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(docData)
        });
        if (res.ok) {
          this.showToast("Document attached successfully", "success");
          return await res.json();
        }
      } catch (e) {
        console.warn("[ProjectPulse API] Document upload error:", e);
      }
    }
    const docId = `DOC-${Date.now().toString().slice(-4)}`;
    this.showToast("Document parsed and entity-extracted", "info");
    return { status: "success", document_id: docId, ...docData };
  },

  async getProjectDocuments(projectId) {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/api/projects/${encodeURIComponent(projectId)}/documents`, {
          headers: this.getAuthHeaders()
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn("[ProjectPulse API] Get documents error:", e);
      }
    }
    return {
      status: "success",
      count: 4,
      documents: [
        { doc_id: "DOC-DPR-01", document_name: "Detailed Project Report (DPR) Vol 1", document_type: "DPR", file_size_kb: 14200, uploaded_at: "2026-01-15", verified: true },
        { doc_id: "DOC-CA-02", document_name: "EPC Concession Agreement & Schedule H", document_type: "CONTRACT", file_size_kb: 8900, uploaded_at: "2026-02-01", verified: true },
        { doc_id: "DOC-GEO-03", document_name: "Geotechnical Borehole Stratigraphy Survey", document_type: "GEOTECHNICAL", file_size_kb: 5600, uploaded_at: "2026-02-18", verified: true },
        { doc_id: "DOC-ENV-04", document_name: "Stage-II Forest & Wildlife Clearance Sanction", document_type: "CLEARANCE", file_size_kb: 3200, uploaded_at: "2026-03-05", verified: true }
      ]
    };
  },

  async analyzeProjectDocuments(projectId) {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/api/projects/${encodeURIComponent(projectId)}/execution/analyze`, {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: JSON.stringify({ project_id: projectId })
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn("[ProjectPulse API] Analyze docs error:", e);
      }
    }
    return {
      status: "success",
      project_id: projectId,
      extracted_entities: {
        corridor_length_km: 42.5,
        lanes: 6,
        major_bridges: 2,
        minor_bridges: 14,
        culverts: 68,
        contractor_name: "Larsen & Toubro Ltd - Infrastructure Division",
        sanctioned_amount_cr: 1420.5,
        completion_deadline_months: 36,
        key_bill_of_quantities: [
          { item: "Ganga Viaduct Well Sinking (12m dia)", quantity: 18, unit: "wells", spec: "M35 Grade Concrete" },
          { item: "Pier Caps & Segmental Piers", quantity: 36, unit: "piers", spec: "High Performance Concrete" },
          { item: "Prestressed Segmental Box Girders", quantity: 24, unit: "spans", spec: "50m span each" },
          { item: "Subgrade Compaction & Embankment", quantity: 680000, unit: "cum", spec: "IRC:36-2010 Standard" },
          { item: "Dense Bituminous Macadam (DBM)", quantity: 245000, unit: "sqm", spec: "VG-40 Bitumen" }
        ]
      }
    };
  },

  async generateExecutionPlan(projectId) {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/api/projects/${encodeURIComponent(projectId)}/execution/plan/generate`, {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: JSON.stringify({ project_id: projectId })
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn("[ProjectPulse API] Generate plan error:", e);
      }
    }
    return {
      status: "success",
      plan_id: `EXP-PLAN-${projectId}`,
      project_id: projectId,
      work_packages_count: 12,
      tasks_count: 54,
      ai_confidence_score: 94.2,
      message: "AI Work Breakdown Structure synthesized from DPR & BOQ entities with human approval gate pending."
    };
  },

  async getExecutionPlan(projectId) {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/api/projects/${encodeURIComponent(projectId)}/execution/plan`, {
          headers: this.getAuthHeaders()
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn("[ProjectPulse API] Get plan error:", e);
      }
    }
    return {
      plan_id: `EXP-PLAN-${projectId}`,
      project_id: projectId,
      status: "APPROVED",
      approved_by: "USR-PM-01",
      approved_at: "2026-03-01T10:00:00Z",
      work_packages_count: 12,
      tasks_count: 54,
      dependencies_count: 37,
      ai_confidence_score: 94.2
    };
  },

  async approveExecutionPlan(projectId, approvalNotes = "") {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/api/projects/${encodeURIComponent(projectId)}/execution/plan/approve`, {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: JSON.stringify({ notes: approvalNotes })
        });
        if (res.ok) {
          this.showToast("Execution Plan baselined and ratified!", "success");
          return await res.json();
        }
      } catch (e) {
        console.warn("[ProjectPulse API] Approve plan error:", e);
      }
    }
    this.showToast("Execution Plan baselined and ratified by Project Director", "success");
    return { status: "success", plan_id: `EXP-PLAN-${projectId}`, approval_status: "APPROVED", approved_at: new Date().toISOString() };
  },

  async getWorkPackages(projectId) {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/api/projects/${encodeURIComponent(projectId)}/work-packages`, {
          headers: this.getAuthHeaders()
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn("[ProjectPulse API] Get work packages error:", e);
      }
    }
    return {
      project_id: projectId,
      count: 12,
      work_packages: [
        { work_package_id: "WP-01", wbs_code: "WBS 1.1", title: "Project Inception & Geotechnical Borehole Survey", planned_start_date: "2026-01-01", planned_end_date: "2026-03-31", progress_pct: 100.0, status: "COMPLETED", task_count: 3 },
        { work_package_id: "WP-02", wbs_code: "WBS 1.2", title: "Statutory Forest & Environmental Approvals", planned_start_date: "2026-02-01", planned_end_date: "2026-05-31", progress_pct: 75.0, status: "IN_PROGRESS", task_count: 4 },
        { work_package_id: "WP-03", wbs_code: "WBS 1.3", title: "Right-of-Way & Land Acquisition Encumbrance Clearance", planned_start_date: "2026-02-15", planned_end_date: "2026-06-30", progress_pct: 60.0, status: "IN_PROGRESS", task_count: 4 },
        { work_package_id: "WP-04", wbs_code: "WBS 1.4", title: "Ganga River Viaduct Deep Well Sinking & Steining", planned_start_date: "2026-04-01", planned_end_date: "2026-12-31", progress_pct: 38.5, status: "IN_PROGRESS", task_count: 6, is_critical: true },
        { work_package_id: "WP-05", wbs_code: "WBS 1.5", title: "Substructure Piers, Abutments & Seismic Bearings", planned_start_date: "2026-08-01", planned_end_date: "2027-04-30", progress_pct: 12.0, status: "IN_PROGRESS", task_count: 5, is_critical: true },
        { work_package_id: "WP-06", wbs_code: "WBS 1.6", title: "Segmental Box Girder Precast Yard Operations", planned_start_date: "2026-07-01", planned_end_date: "2027-08-31", progress_pct: 20.0, status: "IN_PROGRESS", task_count: 5 },
        { work_package_id: "WP-07", wbs_code: "WBS 1.7", title: "Superstructure Segment Erection & Post-Tensioning", planned_start_date: "2027-01-15", planned_end_date: "2027-12-31", progress_pct: 0.0, status: "TODO", task_count: 5, is_critical: true },
        { work_package_id: "WP-08", wbs_code: "WBS 1.8", title: "Embankment Earthwork & Granular Sub-Base (GSB)", planned_start_date: "2026-05-01", planned_end_date: "2027-06-30", progress_pct: 45.0, status: "IN_PROGRESS", task_count: 5 },
        { work_package_id: "WP-09", wbs_code: "WBS 1.9", title: "Pavement Paving: Wet Mix Macadam & DBM", planned_start_date: "2027-04-01", planned_end_date: "2028-02-28", progress_pct: 0.0, status: "TODO", task_count: 4 },
        { work_package_id: "WP-10", wbs_code: "WBS 1.10", title: "Safety Crash Barriers, Median Drains & Signage", planned_start_date: "2027-10-01", planned_end_date: "2028-06-30", progress_pct: 0.0, status: "TODO", task_count: 4 },
        { work_package_id: "WP-11", wbs_code: "WBS 1.11", title: "Intelligent Transport Systems (ITS) & Tolling Infrastructure", planned_start_date: "2028-01-01", planned_end_date: "2028-08-31", progress_pct: 0.0, status: "TODO", task_count: 5 },
        { work_package_id: "WP-12", wbs_code: "WBS 1.12", title: "CRS Load Testing, Safety Certification & Final Commissioning", planned_start_date: "2028-07-01", planned_end_date: "2028-12-31", progress_pct: 0.0, status: "TODO", task_count: 4, is_critical: true }
      ]
    };
  },

  async createTask(projectId, taskData) {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/api/projects/${encodeURIComponent(projectId)}/tasks`, {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(taskData)
        });
        if (res.ok) {
          this.showToast("Task created successfully", "success");
          return await res.json();
        }
      } catch (e) {
        console.warn("[ProjectPulse API] Create task error:", e);
      }
    }
    const tid = `TSK-${Date.now().toString().slice(-4)}`;
    this.showToast(`[Offline] Task ${tid} created`, "success");
    return { status: "success", task: { ...taskData, task_id: tid, project_id: projectId } };
  },

  async getProjectTasks(projectId, params = {}) {
    if (this.isLive) {
      try {
        const qs = new URLSearchParams(params).toString();
        const url = `${this.baseUrl}/api/projects/${encodeURIComponent(projectId)}/tasks${qs ? '?' + qs : ''}`;
        const res = await fetch(url, { headers: this.getAuthHeaders() });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn("[ProjectPulse API] Get tasks error:", e);
      }
    }
    // Mock fallback 12 sample high-impact tasks
    return {
      project_id: projectId,
      count: 12,
      tasks: [
        { task_id: "TSK-001", task_name: "Ganga River Pier P-04 Well Excavation & Steining", work_package_id: "WP-04", wbs_code: "WBS 1.4.1", status: "BLOCKED", is_critical: true, total_float: 0, target_quantity: 28.5, completed_quantity: 16.2, unit: "meters", planned_progress: 85.0, actual_progress: 56.8, source: "DOCUMENT_EXTRACTED", assigned_to_name: "Shri Rajesh Gurjar", site_name: "Ganga Viaduct Main Span Pier P-04" },
        { task_id: "TSK-002", task_name: "Pier P-05 Pneumatic Caisson Sinking", work_package_id: "WP-04", wbs_code: "WBS 1.4.2", status: "IN_PROGRESS", is_critical: true, total_float: 0, target_quantity: 32.0, completed_quantity: 22.0, unit: "meters", planned_progress: 68.0, actual_progress: 68.75, source: "DOCUMENT_EXTRACTED", assigned_to_name: "Shri Sanjay Sharma", site_name: "Ganga Viaduct Pier P-05" },
        { task_id: "TSK-003", task_name: "Pier Cap P-03 Reinforcement & Formwork", work_package_id: "WP-05", wbs_code: "WBS 1.5.1", status: "IN_PROGRESS", is_critical: false, total_float: 14, target_quantity: 120.0, completed_quantity: 90.0, unit: "cum", planned_progress: 75.0, actual_progress: 75.0, source: "AI_INFERRED", assigned_to_name: "Er. Neha Verma", site_name: "Ganga North Approach Pier P-03" },
        { task_id: "TSK-004", task_name: "Segment Casting Span S-08 in Precast Yard", work_package_id: "WP-06", wbs_code: "WBS 1.6.2", status: "IN_PROGRESS", is_critical: false, total_float: 28, target_quantity: 16.0, completed_quantity: 12.0, unit: "segments", planned_progress: 70.0, actual_progress: 75.0, source: "DOCUMENT_EXTRACTED", assigned_to_name: "Shri Rajesh Gurjar", site_name: "Central Casting Yard Mugalsarai" },
        { task_id: "TSK-005", task_name: "Ch 12+400 to 18+200 Embankment Compaction Layer-4", work_package_id: "WP-08", wbs_code: "WBS 1.8.3", status: "IN_PROGRESS", is_critical: false, total_float: 45, target_quantity: 45000.0, completed_quantity: 38000.0, unit: "cum", planned_progress: 80.0, actual_progress: 84.4, source: "AI_INFERRED", assigned_to_name: "Shri Rajesh Gurjar", site_name: "Package 3 North Section" },
        { task_id: "TSK-006", task_name: "Pier P-04 Subsurface Boulder Hydro-Jetting", work_package_id: "WP-04", wbs_code: "WBS 1.4.3", status: "BLOCKED", is_critical: true, total_float: 0, target_quantity: 1.0, completed_quantity: 0.3, unit: "bore", planned_progress: 100.0, actual_progress: 30.0, source: "AI_INFERRED", assigned_to_name: "Er. Neha Verma", site_name: "Pier P-04 Well Bottom" },
        { task_id: "TSK-007", task_name: "Seismic Elastomeric Bearing Installation Pier P-01", work_package_id: "WP-05", wbs_code: "WBS 1.5.3", status: "TODO", is_critical: false, total_float: 22, target_quantity: 8.0, completed_quantity: 0.0, unit: "units", planned_progress: 0.0, actual_progress: 0.0, source: "DOCUMENT_EXTRACTED", assigned_to_name: "Er. Neha Verma", site_name: "Pier P-01 Abutment" },
        { task_id: "TSK-008", task_name: "Stage-II Forest Border Demarcation Pillars", work_package_id: "WP-02", wbs_code: "WBS 1.2.4", status: "COMPLETED", is_critical: false, total_float: 60, target_quantity: 240.0, completed_quantity: 240.0, unit: "pillars", planned_progress: 100.0, actual_progress: 100.0, source: "DOCUMENT_EXTRACTED", assigned_to_name: "Shri Sanjay Sharma", site_name: "Chandauli Reserve Forest" },
        { task_id: "TSK-009", task_name: "Span 4 Cantilever Launching Gantry Setup", work_package_id: "WP-07", wbs_code: "WBS 1.7.1", status: "TODO", is_critical: true, total_float: 0, target_quantity: 1.0, completed_quantity: 0.0, unit: "gantry", planned_progress: 0.0, actual_progress: 0.0, source: "AI_INFERRED", assigned_to_name: "Er. Neha Verma", site_name: "Pier P-04 to P-05 Launch Site" },
        { task_id: "TSK-010", task_name: "Culvert C-24 Box Cast-in-Situ Concreting", work_package_id: "WP-08", wbs_code: "WBS 1.8.5", status: "COMPLETED", is_critical: false, total_float: 90, target_quantity: 85.0, completed_quantity: 85.0, unit: "cum", planned_progress: 100.0, actual_progress: 100.0, source: "DOCUMENT_EXTRACTED", assigned_to_name: "Shri Rajesh Gurjar", site_name: "Chainage 16+800" },
        { task_id: "TSK-011", task_name: "Granular Sub-Base (GSB) Layer 1 Paving", work_package_id: "WP-08", wbs_code: "WBS 1.8.4", status: "IN_PROGRESS", is_critical: false, total_float: 35, target_quantity: 12000.0, completed_quantity: 8400.0, unit: "sqm", planned_progress: 70.0, actual_progress: 70.0, source: "DOCUMENT_EXTRACTED", assigned_to_name: "Shri Rajesh Gurjar", site_name: "Chainage 14+200" },
        { task_id: "TSK-012", task_name: "Bridge Health Sensor Strain Gauge Cabling", work_package_id: "WP-11", wbs_code: "WBS 1.11.2", status: "TODO", is_critical: false, total_float: 110, target_quantity: 48.0, completed_quantity: 0.0, unit: "nodes", planned_progress: 0.0, actual_progress: 0.0, source: "AI_INFERRED", assigned_to_name: "Er. Neha Verma", site_name: "Main Navigational Span" }
      ]
    };
  },

  async getSingleTask(taskId) {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/api/tasks/${encodeURIComponent(taskId)}`, {
          headers: this.getAuthHeaders()
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn("[ProjectPulse API] Get task error:", e);
      }
    }
    const tasks = (await this.getProjectTasks("PRJ-SYN-000002")).tasks;
    return tasks.find(t => t.task_id === taskId) || tasks[0];
  },

  async getMyTargets() {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/api/users/me/targets`, {
          headers: this.getAuthHeaders()
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn("[ProjectPulse API] Get targets error:", e);
      }
    }
    return {
      user_id: this.currentUser?.user_id || "USR-FIELD-01",
      date: new Date().toISOString().slice(0, 10),
      count: 3,
      targets: [
        {
          task_id: "TSK-001",
          task_name: "Ganga River Pier P-04 Well Excavation & Steining",
          project_id: "PRJ-SYN-000002",
          project_name: "Varanasi-Ranchi-Kolkata Expressway PKG-3",
          target_quantity: 4.5,
          completed_quantity: 1.8,
          unit: "meters",
          target_period: "TODAY",
          status: "BLOCKED",
          is_critical: true,
          impediment: "Subsurface basalt boulder layer obstructing cutting edge",
          last_update_hours_ago: 3
        },
        {
          task_id: "TSK-002",
          task_name: "Pier P-05 Pneumatic Caisson Sinking",
          project_id: "PRJ-SYN-000002",
          project_name: "Varanasi-Ranchi-Kolkata Expressway PKG-3",
          target_quantity: 3.0,
          completed_quantity: 2.4,
          unit: "meters",
          target_period: "TODAY",
          status: "IN_PROGRESS",
          is_critical: true,
          impediment: null,
          last_update_hours_ago: 6
        },
        {
          task_id: "TSK-005",
          task_name: "Ch 12+400 to 18+200 Embankment Compaction Layer-4",
          project_id: "PRJ-SYN-000002",
          project_name: "Varanasi-Ranchi-Kolkata Expressway PKG-3",
          target_quantity: 1200.0,
          completed_quantity: 950.0,
          unit: "cum",
          target_period: "TODAY",
          status: "IN_PROGRESS",
          is_critical: false,
          impediment: null,
          last_update_hours_ago: 8
        }
      ]
    };
  },

  async getMyTasks() {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/api/users/me/tasks`, {
          headers: this.getAuthHeaders()
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn("[ProjectPulse API] Get my tasks error:", e);
      }
    }
    return await this.getMyTargets();
  },

  async submitTaskProgress(taskId, progressData) {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/api/tasks/${encodeURIComponent(taskId)}/progress`, {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(progressData)
        });
        if (res.ok) {
          this.showToast("Daily progress telemetry logged and queued for engineer verification", "success");
          return await res.json();
        }
      } catch (e) {
        console.warn("[ProjectPulse API] Submit progress error:", e);
      }
    }
    const pid = `PRG-${Date.now().toString().slice(-4)}`;
    this.showToast(`[Offline] Progress logged (${progressData.quantity_completed} ${progressData.unit || ''}) · Pending Verification`, "success");
    return {
      status: "success",
      progress_id: pid,
      task_id: taskId,
      quantity_completed: progressData.quantity_completed,
      verification_status: "PENDING_VERIFICATION",
      created_at: new Date().toISOString()
    };
  },

  async getTaskProgressHistory(taskId) {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/api/tasks/${encodeURIComponent(taskId)}/progress`, {
          headers: this.getAuthHeaders()
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn("[ProjectPulse API] Get progress history error:", e);
      }
    }
    return {
      task_id: taskId,
      count: 3,
      history: [
        { progress_id: "PRG-001", reported_date: "2026-03-08", quantity_completed: 0.8, unit: "meters", verification_status: "VERIFIED", verified_by_name: "Er. Neha Verma", remarks: "Hydro-jet test shot" },
        { progress_id: "PRG-002", reported_date: "2026-03-09", quantity_completed: 0.5, unit: "meters", verification_status: "PENDING_VERIFICATION", remarks: "Heavy silt resistance encountered" },
        { progress_id: "PRG-003", reported_date: "2026-03-09", quantity_completed: 0.0, unit: "meters", verification_status: "PENDING_VERIFICATION", remarks: "Stoppage due to boulder layer" }
      ]
    };
  },

  async verifyTaskProgress(progressId, payload = {}) {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/api/progress/${encodeURIComponent(progressId)}/verify`, {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          this.showToast("Progress verified and ratified into ledger", "success");
          return await res.json();
        }
      } catch (e) {
        console.warn("[ProjectPulse API] Verify progress error:", e);
      }
    }
    this.showToast(`Progress ${progressId} verified & ratified by Engineer`, "success");
    return {
      status: "success",
      progress_id: progressId,
      verification_status: "VERIFIED",
      verified_by: this.currentUser?.user_id || "USR-ENGINEER-01",
      notes: payload.notes || "Inspected on site and corroborated against field level survey."
    };
  },

  async rejectTaskProgress(progressId, payload = {}) {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/api/progress/${encodeURIComponent(progressId)}/reject`, {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          this.showToast("Progress rejected with deficiency note", "info");
          return await res.json();
        }
      } catch (e) {
        console.warn("[ProjectPulse API] Reject progress error:", e);
      }
    }
    this.showToast(`Progress ${progressId} rejected: ${payload.rejection_reason || 'Deficiency reported'}`, "warning");
    return {
      status: "success",
      progress_id: progressId,
      verification_status: "REJECTED",
      rejection_reason: payload.rejection_reason || "Discrepancy between reported quantity and onsite core check."
    };
  },

  async getExecutionTimeline(projectId) {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/api/projects/${encodeURIComponent(projectId)}/execution/timeline`, {
          headers: this.getAuthHeaders()
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn("[ProjectPulse API] Timeline error:", e);
      }
    }
    // CPM schedule timeline
    return {
      project_id: projectId,
      critical_path_duration_days: 980,
      critical_tasks_count: 14,
      total_tasks: 54,
      milestones: [
        { milestone_id: "M-01", name: "Inception & Geotechnical Clearance", target_date: "2026-03-31", actual_date: "2026-03-25", is_critical: true, status: "COMPLETED", progress_pct: 100 },
        { milestone_id: "M-02", name: "Stage-II Forest & RoW Clearance", target_date: "2026-06-30", actual_date: null, is_critical: false, status: "IN_PROGRESS", progress_pct: 65 },
        { milestone_id: "M-03", name: "Ganga Viaduct Deep Wells Sinking Substructure", target_date: "2026-12-31", actual_date: null, is_critical: true, status: "AT_RISK", progress_pct: 38, float_days: 0 },
        { milestone_id: "M-04", name: "Pier Caps & Seismic Isolation Installation", target_date: "2027-04-30", actual_date: null, is_critical: true, status: "PENDING", progress_pct: 12, float_days: 0 },
        { milestone_id: "M-05", name: "Cantilever Segment Box Girder Launching", target_date: "2027-12-31", actual_date: null, is_critical: true, status: "PENDING", progress_pct: 0, float_days: 0 },
        { milestone_id: "M-06", name: "Subgrade & Granular Sub-Base Paving", target_date: "2027-06-30", actual_date: null, is_critical: false, status: "IN_PROGRESS", progress_pct: 45, float_days: 42 },
        { milestone_id: "M-07", name: "Bituminous Concrete & Asphalt Wearing Course", target_date: "2028-02-28", actual_date: null, is_critical: false, status: "PENDING", progress_pct: 0, float_days: 35 },
        { milestone_id: "M-08", name: "Crash Barrier & Intelligent Lighting Corridor", target_date: "2028-06-30", actual_date: null, is_critical: false, status: "PENDING", progress_pct: 0, float_days: 28 },
        { milestone_id: "M-09", name: "Intelligent Tolling Plaza & Weigh-in-Motion", target_date: "2028-08-31", actual_date: null, is_critical: false, status: "PENDING", progress_pct: 0, float_days: 50 },
        { milestone_id: "M-10", name: "CRS High-Speed Load Testing & Final Commissioning", target_date: "2028-12-31", actual_date: null, is_critical: true, status: "PENDING", progress_pct: 0, float_days: 0 }
      ]
    };
  },

  async addDependency(projectId, depData) {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/api/projects/${encodeURIComponent(projectId)}/dependencies`, {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(depData)
        });
        if (res.ok) {
          this.showToast("Task dependency link created", "success");
          return await res.json();
        }
      } catch (e) {
        console.warn("[ProjectPulse API] Add dependency error:", e);
      }
    }
    return { status: "success", dependency_id: `DEP-${Date.now().toString().slice(-4)}`, ...depData };
  },

  async deleteDependency(depId) {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/api/dependencies/${encodeURIComponent(depId)}`, {
          method: "DELETE",
          headers: this.getAuthHeaders()
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn("[ProjectPulse API] Delete dependency error:", e);
      }
    }
    return { status: "success", dependency_id: depId, message: "Dependency removed" };
  },

  async getPlanVsActual(projectId) {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/api/projects/${encodeURIComponent(projectId)}/execution/plan-vs-actual`, {
          headers: this.getAuthHeaders()
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn("[ProjectPulse API] Plan-vs-actual error:", e);
      }
    }
    return {
      project_id: projectId,
      schedule_variance_days: 42,
      cost_variance_inr_cr: 18.5,
      target_misses_count: 3,
      stale_updates_count: 1,
      execution_velocity: 0.74,
      health_index: 68.2,
      status: "AT_RISK",
      primary_blocker: {
        task_id: "TSK-001",
        task_name: "Ganga River Pier P-04 Well Excavation",
        category: "EQUIPMENT_BREAKDOWN",
        days_delayed: 42,
        details: "Subsurface basalt boulder layer obstructing cutting edge; requires pneumatic reverse-circulation drilling rig."
      },
      s_curve: {
        labels: ["Month 1", "Month 2", "Month 3", "Month 4", "Month 5", "Month 6", "Month 7", "Month 8", "Month 9", "Month 10", "Month 11", "Month 12"],
        planned_curve: [3.5, 8.0, 14.5, 22.0, 31.0, 42.0, 54.0, 67.0, 78.0, 88.0, 95.0, 100.0],
        actual_curve:  [3.2, 7.8, 13.8, 20.1, 26.5, 34.0, null, null, null, null, null, null],
        projected_curve: [null, null, null, null, null, 34.0, 41.5, 51.0, 62.0, 73.5, 85.0, 94.0]
      }
    };
  },

  async getExecutionHealth(projectId) {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/api/projects/${encodeURIComponent(projectId)}/execution/health`, {
          headers: this.getAuthHeaders()
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn("[ProjectPulse API] Health error:", e);
      }
    }
    return {
      project_id: projectId,
      health_index: 68.2,
      tier: "MODERATE_RISK",
      critical_path_slippage_days: 42,
      active_blockers_count: 2,
      verification_queue_count: 2,
      velocity_ratio: 0.74
    };
  },

  async getRecoveryOptions(projectId) {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/api/projects/${encodeURIComponent(projectId)}/execution/recovery-options`, {
          headers: this.getAuthHeaders()
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn("[ProjectPulse API] Recovery options error:", e);
      }
    }
    return {
      project_id: projectId,
      critical_delay_days: 42,
      options: [
        {
          id: "REC-01",
          strategy: "FAST_TRACKING",
          name: "Parallelize Substructure & Segment Precasting",
          description: "Execute Pier Cap P-05 and Cantilever Segment Casting concurrently with foundation sinking rather than sequentially.",
          days_recovered: 28,
          cost_impact_inr_cr: 2.4,
          risk_level: "MEDIUM",
          feasibility_score: 92,
          recommendation_tag: "RECOMMENDED"
        },
        {
          id: "REC-02",
          strategy: "CRASHING",
          name: "Mobilize Dual Hydraulic Reverse-Circulation Rig",
          description: "Contract specialized marine drilling contractor with 2400-ton torque hammer to clear Pier P-04 boulder obstruction within 10 days.",
          days_recovered: 35,
          cost_impact_inr_cr: 5.8,
          risk_level: "LOW",
          feasibility_score: 88,
          recommendation_tag: "FASTEST"
        },
        {
          id: "REC-03",
          strategy: "SHIFT_OPTIMIZATION",
          name: "Transition to 24/7 3-Shift Continuous Marine Operations",
          description: "Deploy additional marine safety crew and night lighting arrays to maintain around-the-clock de-watering and steining.",
          days_recovered: 22,
          cost_impact_inr_cr: 1.8,
          risk_level: "LOW",
          feasibility_score: 95,
          recommendation_tag: "COST_OPTIMAL"
        },
        {
          id: "REC-04",
          strategy: "SCOPE_PHASING",
          name: "Sectional Commissioning of 2-Lane Viaduct Carriageway",
          description: "Complete and open Left Hand Carriageway (LHC) 3 months ahead of Right Hand Carriageway (RHC) to allow commercial traffic diversion.",
          days_recovered: 45,
          cost_impact_inr_cr: -1.2,
          risk_level: "HIGH",
          feasibility_score: 74,
          recommendation_tag: "ALTERNATIVE"
        },
        {
          id: "REC-05",
          strategy: "BUFFERING",
          name: "Buffer Absorption on Non-Critical Pavement Packages",
          description: "Compress 42 days of non-critical total float in Package 1.8 (Subgrade) and 1.9 (DBM) to absorb substructure slippage.",
          days_recovered: 18,
          cost_impact_inr_cr: 0.0,
          risk_level: "MINIMAL",
          feasibility_score: 98,
          recommendation_tag: "ZERO_COST"
        }
      ]
    };
  },

  async getProjectSites(projectId) {
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/api/projects/${encodeURIComponent(projectId)}/sites`, {
          headers: this.getAuthHeaders()
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn("[ProjectPulse API] Get sites error:", e);
      }
    }
    return {
      project_id: projectId,
      count: 3,
      sites: [
        { site_id: "SITE-01", name: "Site Alpha — Varanasi Approach & Ch 0+000 to 14+200", chainage_start_km: 0.0, chainage_end_km: 14.2, incharge_name: "Er. Neha Verma", status: "ACTIVE" },
        { site_id: "SITE-02", name: "Site Beta — Ganga River Viaduct Corridor Ch 14+200 to 19+800", chainage_start_km: 14.2, chainage_end_km: 19.8, incharge_name: "Shri Sanjay Sharma", status: "CRITICAL_EXECUTION" },
        { site_id: "SITE-03", name: "Site Gamma — South Connector Ch 19+800 to 42+500", chainage_start_km: 19.8, chainage_end_km: 42.5, incharge_name: "Shri Rajesh Gurjar", status: "ACTIVE" }
      ]
    };
  },

  reports: {
    async getSnapshots() {
      if (window.APIClient.isLive) {
        try {
          const res = await fetch(`${window.APIClient.baseUrl}/api/reports/snapshots`, { headers: window.APIClient.getAuthHeaders() });
          if (res.ok) return await res.json();
        } catch (e) {
          console.warn("[ASTRA API] Get snapshots failed, using fallback:", e);
        }
      }
      return {
        snapshots: [
          { snapshot_month: "2026-07", snapshot_year: 2026, source_report: "FlashReport_July_2026.pdf", project_count: 10000, total_original_cost_cr: 27140800.0, total_revised_cost_cr: 31250000.0, total_expenditure_cr: 18450000.0, display_name: "July 2026" },
          { snapshot_month: "2026-06", snapshot_year: 2026, source_report: "FlashReport_June_2026.pdf", project_count: 9950, total_original_cost_cr: 27010000.0, total_revised_cost_cr: 30980000.0, total_expenditure_cr: 18120000.0, display_name: "June 2026" },
          { snapshot_month: "2026-05", snapshot_year: 2026, source_report: "FlashReport_May2026.pdf", project_count: 9900, total_original_cost_cr: 26850000.0, total_revised_cost_cr: 30650000.0, total_expenditure_cr: 17800000.0, display_name: "May 2026" },
          { snapshot_month: "2026-04", snapshot_year: 2026, source_report: "FlashReport_April2026.pdf", project_count: 9850, total_original_cost_cr: 26700000.0, total_revised_cost_cr: 30400000.0, total_expenditure_cr: 17500000.0, display_name: "April 2026" }
        ]
      };
    },

    async getOverview(snapshotMonth = "2026-07") {
      if (window.APIClient.isLive) {
        try {
          const res = await fetch(`${window.APIClient.baseUrl}/api/reports/overview?snapshot_month=${encodeURIComponent(snapshotMonth)}`, { headers: window.APIClient.getAuthHeaders() });
          if (res.ok) return await res.json();
        } catch (e) {
          console.warn("[ASTRA API] Get overview failed, using fallback:", e);
        }
      }
      return {
        snapshot_month: snapshotMonth,
        snapshot_display: snapshotMonth === "2026-07" ? "July 2026" : (snapshotMonth === "2026-06" ? "June 2026" : (snapshotMonth === "2026-05" ? "May 2026" : "April 2026")),
        source_report: `FlashReport_${snapshotMonth.replace('-', '_')}.pdf`,
        source_banner: {
          text: "PAIMANA REFERENCE SNAPSHOT • OFFICIAL IPMD ARCHIVAL SERIES",
          snapshot: snapshotMonth,
          document: `FlashReport_${snapshotMonth}.pdf`,
          provenance: `MoSPI IPMD Monthly Flash Report Series (${snapshotMonth})`
        },
        paimana_monitoring: {
          tracked_projects: 10000,
          ongoing_projects: 9820,
          commissioned_projects: 100,
          newly_added_projects: 80,
          original_cost_cr: 27140800.0,
          original_cost_formatted: "₹271.4L Cr",
          revised_cost_cr: 31250000.0,
          revised_cost_formatted: "₹312.5L Cr",
          cumulative_expenditure_cr: 18450000.0,
          cumulative_expenditure_formatted: "₹184.5L Cr",
          cost_growth_cr: 4109200.0,
          cost_growth_pct: 15.14,
          avg_physical_progress_pct: 58.42,
          avg_financial_progress_pct: 59.04,
          expenditure_to_revised_ratio_pct: 59.04
        },
        astra_intelligence: {
          high_risk_projects: 1842,
          critical_projects: 418,
          schedule_pressure_projects: 2150,
          cost_escalation_projects: 3410,
          stale_telemetry_flags: 38,
          data_quality_flags_count: 401,
          capital_at_risk_cr: 12450800.0,
          capital_at_risk_formatted: "₹124.5L Cr",
          analytical_capital_exposure_label: "Analytical risk-weighted exposure (Revised Cost × Normalized Model Risk)",
          active_bottlenecks_count: 4210
        }
      };
    },

    async getSectors(snapshotMonth = "2026-07") {
      if (window.APIClient.isLive) {
        try {
          const res = await fetch(`${window.APIClient.baseUrl}/api/reports/sectors?snapshot_month=${encodeURIComponent(snapshotMonth)}`, { headers: window.APIClient.getAuthHeaders() });
          if (res.ok) return await res.json();
        } catch (e) {}
      }
      return {
        snapshot_month: snapshotMonth,
        sectors: [
          { sector: "Roads & Highways", hml_category: "Transport & Logistics", project_count: 2840, original_cost_formatted: "₹84.2L Cr", revised_cost_formatted: "₹96.5L Cr", expenditure_formatted: "₹58.1L Cr", cost_growth_pct: 14.6, avg_physical_progress: 62.4, avg_risk_score: 54.2, high_risk_capital_formatted: "₹38.4L Cr" },
          { sector: "Railways", hml_category: "Transport & Logistics", project_count: 2120, original_cost_formatted: "₹72.1L Cr", revised_cost_formatted: "₹85.4L Cr", expenditure_formatted: "₹51.2L Cr", cost_growth_pct: 18.4, avg_physical_progress: 56.1, avg_risk_score: 58.6, high_risk_capital_formatted: "₹36.1L Cr" },
          { sector: "Power", hml_category: "Energy", project_count: 1420, original_cost_formatted: "₹45.0L Cr", revised_cost_formatted: "₹51.2L Cr", expenditure_formatted: "₹32.4L Cr", cost_growth_pct: 13.8, avg_physical_progress: 64.2, avg_risk_score: 48.2, high_risk_capital_formatted: "₹18.2L Cr" },
          { sector: "Petroleum & Natural Gas", hml_category: "Energy", project_count: 1100, original_cost_formatted: "₹34.5L Cr", revised_cost_formatted: "₹38.2L Cr", expenditure_formatted: "₹24.0L Cr", cost_growth_pct: 10.7, avg_physical_progress: 66.8, avg_risk_score: 42.1, high_risk_capital_formatted: "₹12.0L Cr" },
          { sector: "Coal Infrastructure", hml_category: "Energy", project_count: 850, original_cost_formatted: "₹18.2L Cr", revised_cost_formatted: "₹20.4L Cr", expenditure_formatted: "₹12.1L Cr", cost_growth_pct: 12.1, avg_physical_progress: 59.2, avg_risk_score: 46.4, high_risk_capital_formatted: "₹6.8L Cr" },
          { sector: "Urban Transit", hml_category: "Transport & Logistics", project_count: 720, original_cost_formatted: "₹21.4L Cr", revised_cost_formatted: "₹26.1L Cr", expenditure_formatted: "₹14.2L Cr", cost_growth_pct: 21.9, avg_physical_progress: 52.8, avg_risk_score: 64.2, high_risk_capital_formatted: "₹14.5L Cr" },
          { sector: "Civil Aviation", hml_category: "Transport & Logistics", project_count: 480, original_cost_formatted: "₹8.2L Cr", revised_cost_formatted: "₹9.1L Cr", expenditure_formatted: "₹5.8L Cr", cost_growth_pct: 11.0, avg_physical_progress: 68.4, avg_risk_score: 38.2, high_risk_capital_formatted: "₹2.4L Cr" },
          { sector: "Ports & Shipping", hml_category: "Transport & Logistics", project_count: 320, original_cost_formatted: "₹6.4L Cr", revised_cost_formatted: "₹7.2L Cr", expenditure_formatted: "₹4.5L Cr", cost_growth_pct: 12.5, avg_physical_progress: 65.1, avg_risk_score: 41.0, high_risk_capital_formatted: "₹1.9L Cr" },
          { sector: "Water Resources", hml_category: "Water & Sanitation", project_count: 150, original_cost_formatted: "₹3.2L Cr", revised_cost_formatted: "₹3.8L Cr", expenditure_formatted: "₹2.1L Cr", cost_growth_pct: 18.8, avg_physical_progress: 54.0, avg_risk_score: 56.4, high_risk_capital_formatted: "₹1.5L Cr" }
        ]
      };
    },

    async getMinistries(snapshotMonth = "2026-07") {
      if (window.APIClient.isLive) {
        try {
          const res = await fetch(`${window.APIClient.baseUrl}/api/reports/ministries?snapshot_month=${encodeURIComponent(snapshotMonth)}`, { headers: window.APIClient.getAuthHeaders() });
          if (res.ok) return await res.json();
        } catch (e) {}
      }
      return {
        snapshot_month: snapshotMonth,
        ministries: [
          { ministry: "Ministry of Road Transport & Highways", project_count: 2840, original_cost_formatted: "₹84.2L Cr", revised_cost_formatted: "₹96.5L Cr", expenditure_formatted: "₹58.1L Cr", cost_growth_pct: 14.6, avg_physical_progress: 62.4, avg_risk_score: 54.2, high_risk_count: 512, critical_count: 110, capital_exposure_formatted: "₹38.4L Cr" },
          { ministry: "Ministry of Railways", project_count: 2120, original_cost_formatted: "₹72.1L Cr", revised_cost_formatted: "₹85.4L Cr", expenditure_formatted: "₹51.2L Cr", cost_growth_pct: 18.4, avg_physical_progress: 56.1, avg_risk_score: 58.6, high_risk_count: 480, critical_count: 124, capital_exposure_formatted: "₹36.1L Cr" },
          { ministry: "Ministry of Power", project_count: 1420, original_cost_formatted: "₹45.0L Cr", revised_cost_formatted: "₹51.2L Cr", expenditure_formatted: "₹32.4L Cr", cost_growth_pct: 13.8, avg_physical_progress: 64.2, avg_risk_score: 48.2, high_risk_count: 210, critical_count: 42, capital_exposure_formatted: "₹18.2L Cr" },
          { ministry: "Ministry of Petroleum & Natural Gas", project_count: 1100, original_cost_formatted: "₹34.5L Cr", revised_cost_formatted: "₹38.2L Cr", expenditure_formatted: "₹24.0L Cr", cost_growth_pct: 10.7, avg_physical_progress: 66.8, avg_risk_score: 42.1, high_risk_count: 140, critical_count: 28, capital_exposure_formatted: "₹12.0L Cr" },
          { ministry: "Ministry of Housing & Urban Affairs", project_count: 720, original_cost_formatted: "₹21.4L Cr", revised_cost_formatted: "₹26.1L Cr", expenditure_formatted: "₹14.2L Cr", cost_growth_pct: 21.9, avg_physical_progress: 52.8, avg_risk_score: 64.2, high_risk_count: 220, critical_count: 65, capital_exposure_formatted: "₹14.5L Cr" }
        ]
      };
    },

    async getStates(snapshotMonth = "2026-07") {
      if (window.APIClient.isLive) {
        try {
          const res = await fetch(`${window.APIClient.baseUrl}/api/reports/states?snapshot_month=${encodeURIComponent(snapshotMonth)}`, { headers: window.APIClient.getAuthHeaders() });
          if (res.ok) return await res.json();
        } catch (e) {}
      }
      return {
        snapshot_month: snapshotMonth,
        states: [
          { state: "Uttar Pradesh", is_ner: false, project_count: 1120, original_cost_formatted: "₹32.4L Cr", revised_cost_formatted: "₹37.8L Cr", expenditure_formatted: "₹22.1L Cr", avg_physical_progress: 58.2, avg_risk_score: 56.4, high_risk_count: 240, critical_count: 54 },
          { state: "Maharashtra", is_ner: false, project_count: 1040, original_cost_formatted: "₹36.1L Cr", revised_cost_formatted: "₹42.0L Cr", expenditure_formatted: "₹25.4L Cr", avg_physical_progress: 61.0, avg_risk_score: 52.1, high_risk_count: 195, critical_count: 41 },
          { state: "Gujarat", is_ner: false, project_count: 980, original_cost_formatted: "₹29.8L Cr", revised_cost_formatted: "₹33.2L Cr", expenditure_formatted: "₹21.0L Cr", avg_physical_progress: 67.4, avg_risk_score: 44.0, high_risk_count: 120, critical_count: 22 },
          { state: "Bihar", is_ner: false, project_count: 850, original_cost_formatted: "₹22.4L Cr", revised_cost_formatted: "₹26.9L Cr", expenditure_formatted: "₹14.8L Cr", avg_physical_progress: 51.2, avg_risk_score: 64.8, high_risk_count: 280, critical_count: 76 },
          { state: "Assam", is_ner: true, project_count: 373, original_cost_formatted: "₹9.8L Cr", revised_cost_formatted: "₹11.6L Cr", expenditure_formatted: "₹6.9L Cr", avg_physical_progress: 54.8, avg_risk_score: 61.2, high_risk_count: 92, critical_count: 24 }
        ]
      };
    },

    async getHML(snapshotMonth = "2026-07") {
      if (window.APIClient.isLive) {
        try {
          const res = await fetch(`${window.APIClient.baseUrl}/api/reports/hml?snapshot_month=${encodeURIComponent(snapshotMonth)}`, { headers: window.APIClient.getAuthHeaders() });
          if (res.ok) return await res.json();
        } catch (e) {}
      }
      return {
        snapshot_month: snapshotMonth,
        categories: [
          { hml_category: "Transport & Logistics", project_count: 6480, original_cost_formatted: "₹192.3L Cr", revised_cost_formatted: "₹224.3L Cr", expenditure_formatted: "₹133.6L Cr", cost_growth_pct: 16.6, avg_physical_progress: 59.4, avg_risk_score: 56.1, high_risk_count: 1324 },
          { hml_category: "Energy", project_count: 3370, original_cost_formatted: "₹97.7L Cr", revised_cost_formatted: "₹109.8L Cr", expenditure_formatted: "₹68.5L Cr", cost_growth_pct: 12.4, avg_physical_progress: 63.8, avg_risk_score: 46.2, high_risk_count: 480 },
          { hml_category: "Water & Sanitation", project_count: 150, original_cost_formatted: "₹3.2L Cr", revised_cost_formatted: "₹3.8L Cr", expenditure_formatted: "₹2.1L Cr", cost_growth_pct: 18.8, avg_physical_progress: 54.0, avg_risk_score: 56.4, high_risk_count: 38 }
        ]
      };
    },

    async getNER(snapshotMonth = "2026-07") {
      if (window.APIClient.isLive) {
        try {
          const res = await fetch(`${window.APIClient.baseUrl}/api/reports/ner?snapshot_month=${encodeURIComponent(snapshotMonth)}`, { headers: window.APIClient.getAuthHeaders() });
          if (res.ok) return await res.json();
        } catch (e) {}
      }
      return {
        snapshot_month: snapshotMonth,
        project_count: 373,
        original_cost_formatted: "₹9.8L Cr",
        revised_cost_formatted: "₹11.6L Cr",
        expenditure_formatted: "₹6.9L Cr",
        avg_physical_progress: 54.8,
        avg_risk_score: 61.2,
        high_risk_count: 92,
        critical_count: 24,
        mega_count: 184,
        major_count: 189,
        top_at_risk_projects: [
          { project_id: "PRJ-SYN-000412", project_name: "Guwahati-Shillong High-Speed Expressway Extension", state: "Assam", sector: "Roads & Highways", agency: "NHAI", revised_cost_cr: 4210.0, physical_progress_pct: 42.1, overall_risk_score: 84.2, target_risk_class: "CRITICAL" },
          { project_id: "PRJ-SYN-000588", project_name: "Lower Subansiri Hydro Electric Power Station Transmission", state: "Assam", sector: "Power", agency: "POWERGRID", revised_cost_cr: 3890.0, physical_progress_pct: 48.6, overall_risk_score: 79.5, target_risk_class: "HIGH" }
        ]
      };
    },

    async getMajorMega(snapshotMonth = "2026-07") {
      if (window.APIClient.isLive) {
        try {
          const res = await fetch(`${window.APIClient.baseUrl}/api/reports/major-mega?snapshot_month=${encodeURIComponent(snapshotMonth)}`, { headers: window.APIClient.getAuthHeaders() });
          if (res.ok) return await res.json();
        } catch (e) {}
      }
      return {
        snapshot_month: snapshotMonth,
        mega_projects: { project_count: 4561, revised_cost_formatted: "₹248.6L Cr", capital_exposure_formatted: "₹104.2L Cr", high_risk_count: 980, avg_physical_progress: 59.2 },
        major_projects: { project_count: 5439, revised_cost_formatted: "₹63.9L Cr", capital_exposure_formatted: "₹20.3L Cr", high_risk_count: 862, avg_physical_progress: 57.6 },
        mega_risk_radar: [
          { project_id: "PRJ-SYN-000002", project_name: "Varanasi-Ranchi-Kolkata Expressway PKG-3 Ganga River Bridge", ministry: "MoRTH", agency: "NHAI", revised_cost_cr: 1845.2, physical_progress_pct: 62.16, overall_risk_score: 88.5, primary_bottleneck: "CONTRACTOR_LIQUIDITY" },
          { project_id: "PRJ-SYN-000018", project_name: "Mumbai-Ahmedabad High Speed Rail Coastal Marine Viaduct", ministry: "Ministry of Railways", agency: "NHSRCL", revised_cost_cr: 8420.0, physical_progress_pct: 54.2, overall_risk_score: 82.1, primary_bottleneck: "ENVIRONMENTAL_CLEARANCE" }
        ]
      };
    },

    async getTable1(snapshotMonth = "2026-07") {
      if (window.APIClient.isLive) {
        try {
          const res = await fetch(`${window.APIClient.baseUrl}/api/reports/tables/ministry-wise?snapshot_month=${encodeURIComponent(snapshotMonth)}`, { headers: window.APIClient.getAuthHeaders() });
          if (res.ok) return await res.json();
        } catch (e) {}
      }
      return { records: [
        { ministry: "Ministry of Road Transport & Highways", sector: "Roads & Highways", project_count: 2840, original_cost_formatted: "₹84.2L Cr", revised_cost_formatted: "₹96.5L Cr", expenditure_formatted: "₹58.1L Cr", cost_growth_pct: 14.6, avg_physical_progress: 62.4, high_risk_projects: 512 },
        { ministry: "Ministry of Railways", sector: "Railways", project_count: 2120, original_cost_formatted: "₹72.1L Cr", revised_cost_formatted: "₹85.4L Cr", expenditure_formatted: "₹51.2L Cr", cost_growth_pct: 18.4, avg_physical_progress: 56.1, high_risk_projects: 480 }
      ] };
    },

    async getTable2(snapshotMonth = "2026-07") {
      if (window.APIClient.isLive) {
        try {
          const res = await fetch(`${window.APIClient.baseUrl}/api/reports/tables/state-wise?snapshot_month=${encodeURIComponent(snapshotMonth)}`, { headers: window.APIClient.getAuthHeaders() });
          if (res.ok) return await res.json();
        } catch (e) {}
      }
      return { records: [
        { state: "Uttar Pradesh", project_count: 1120, original_cost_formatted: "₹32.4L Cr", revised_cost_formatted: "₹37.8L Cr", expenditure_formatted: "₹22.1L Cr", avg_physical_progress: 58.2, high_risk_count: 240, critical_count: 54 },
        { state: "Maharashtra", project_count: 1040, original_cost_formatted: "₹36.1L Cr", revised_cost_formatted: "₹42.0L Cr", expenditure_formatted: "₹25.4L Cr", avg_physical_progress: 61.0, high_risk_count: 195, critical_count: 41 }
      ] };
    },

    async getTable3(snapshotMonth = "2026-07") {
      if (window.APIClient.isLive) {
        try {
          const res = await fetch(`${window.APIClient.baseUrl}/api/reports/tables/completed?snapshot_month=${encodeURIComponent(snapshotMonth)}`, { headers: window.APIClient.getAuthHeaders() });
          if (res.ok) return await res.json();
        } catch (e) {}
      }
      return {
        snapshot_month: snapshotMonth,
        total_completed: 2,
        footnote: "Reported cumulative expenditure is based on the last reporting by ministries/departments and may not represent final project completion cost.",
        projects: [
          { project_id: "PRJ-SYN-000100", project_code: "NHAI-DEL-EXP1", project_name: "Delhi-Dehradun Access Controlled Highway PKG-1", agency: "NHAI", state: "Uttar Pradesh", original_doc: "2026-04-30", revised_doc: "2026-06-30", original_cost_cr: 1420.0, revised_cost_cr: 1540.0, cumulative_expenditure_cr: 1512.0 },
          { project_id: "PRJ-SYN-000200", project_code: "DFCCIL-W-PKG4", project_name: "Western DFC Rewari-Madar Double Stack Electrification", agency: "DFCCIL", state: "Rajasthan", original_doc: "2026-03-31", revised_doc: "2026-05-31", original_cost_cr: 2840.0, revised_cost_cr: 3100.0, cumulative_expenditure_cr: 3040.0 }
        ]
      };
    },

    async getTable4(snapshotMonth = "2026-07") {
      if (window.APIClient.isLive) {
        try {
          const res = await fetch(`${window.APIClient.baseUrl}/api/reports/tables/newly-added?snapshot_month=${encodeURIComponent(snapshotMonth)}`, { headers: window.APIClient.getAuthHeaders() });
          if (res.ok) return await res.json();
        } catch (e) {}
      }
      return {
        snapshot_month: snapshotMonth,
        total_newly_added: 2,
        baseline_notice: "Limited history — baseline predictive models apply historical sector prior distributions.",
        projects: [
          { project_id: "PRJ-SYN-009910", project_code: "PRJ-GOI-109910", project_name: "Bengaluru Peripheral Ring Road Elevated Viaduct PKG-2", ministry: "MoRTH", agency: "NHAI", state: "Karnataka", start_date: "2026-06-01", target_doc: "2029-06-30", original_cost_cr: 3200.0, target_risk_class: "MODERATE" },
          { project_id: "PRJ-SYN-009920", project_code: "PRJ-GOI-109920", project_name: "Paradip Port Western Dock Mechanization Terminal", ministry: "Ministry of Ports, Shipping & Waterways", agency: "Major Ports Authority", state: "Odisha", start_date: "2026-06-15", target_doc: "2028-12-31", original_cost_cr: 1850.0, target_risk_class: "LOW" }
        ]
      };
    },

    async getTable5(snapshotMonth = "2026-07") {
      if (window.APIClient.isLive) {
        try {
          const res = await fetch(`${window.APIClient.baseUrl}/api/reports/tables/ner-projects?snapshot_month=${encodeURIComponent(snapshotMonth)}`, { headers: window.APIClient.getAuthHeaders() });
          if (res.ok) return (await res.json()).records || [];
        } catch (e) {}
      }
      return [
        { project_id: "PRJ-SYN-000412", project_code: "NHAI-NER-412", project_name: "Guwahati-Shillong High-Speed Expressway Extension", state: "Assam", agency: "NHAI", original_cost_cr: 3800.0, revised_cost_cr: 4210.0, cumulative_expenditure_cr: 1780.0, physical_progress_pct: 42.1, target_risk_class: "CRITICAL" }
      ];
    },

    async getTable6(snapshotMonth = "2026-07", params = {}) {
      if (window.APIClient.isLive) {
        try {
          const q = new URLSearchParams({ snapshot_month: snapshotMonth, ...params });
          const res = await fetch(`${window.APIClient.baseUrl}/api/reports/tables/all-ongoing?${q.toString()}`, { headers: window.APIClient.getAuthHeaders() });
          if (res.ok) return await res.json();
        } catch (e) {}
      }
      return {
        total_records: 10000,
        projects: [
          { project_id: "PRJ-SYN-000002", project_code: "NHAI-VRK-PKG3", project_name: "Varanasi-Ranchi-Kolkata Expressway PKG-3 Ganga River Bridge & Viaduct", agency: "NHAI", ministry: "MoRTH", sector: "Roads & Highways", state: "Uttar Pradesh", original_cost_cr: 1680.0, revised_cost_cr: 1845.2, cumulative_expenditure_cr: 1643.47, physical_progress_pct: 62.16, financial_progress_pct: 89.07, overall_risk_score: 88.5, target_risk_class: "CRITICAL", primary_bottleneck: "CONTRACTOR_LIQUIDITY", progress_gap_pct: -26.91 },
          { project_id: "PRJ-SYN-000001", project_code: "DFCCIL-W-VAD", project_name: "Western Dedicated Freight Corridor (Vadodara-Makarpura Junction PKG-1)", agency: "DFCCIL", ministry: "Ministry of Railways", sector: "Railways", state: "Gujarat", original_cost_cr: 3450.0, revised_cost_cr: 3620.0, cumulative_expenditure_cr: 2180.0, physical_progress_pct: 68.4, financial_progress_pct: 60.2, overall_risk_score: 46.2, target_risk_class: "MODERATE", primary_bottleneck: "NONE", progress_gap_pct: 8.2 }
        ]
      };
    },

    async compareSnapshots(snapshotA = "2026-04", snapshotB = "2026-07") {
      if (window.APIClient.isLive) {
        try {
          const res = await fetch(`${window.APIClient.baseUrl}/api/reports/compare?snapshot_a=${encodeURIComponent(snapshotA)}&snapshot_b=${encodeURIComponent(snapshotB)}`, { headers: window.APIClient.getAuthHeaders() });
          if (res.ok) return await res.json();
        } catch (e) {}
      }
      return {
        snapshot_a: snapshotA,
        snapshot_b: snapshotB,
        portfolio_deltas: {
          project_count_delta: 150,
          original_cost_delta_cr: 440800.0,
          revised_cost_delta_cr: 850000.0,
          expenditure_delta_cr: 950000.0,
          avg_physical_progress_delta: 3.84,
          high_risk_count_delta: 142,
          critical_count_delta: 38,
          capital_at_risk_delta_cr: 420500.0
        },
        top_risk_escalating_projects: [
          { project_id: "PRJ-SYN-000002", project_name: "Varanasi-Ranchi-Kolkata Expressway PKG-3 Ganga River Bridge", agency: "NHAI", state: "Uttar Pradesh", progress_a: 59.86, progress_b: 62.16, progress_delta: 2.30, risk_a: 42.5, risk_b: 88.5, risk_delta: 46.0 }
        ]
      };
    },

    async getForecastJourney(projectId = "PRJ-SYN-000002", snapshotMonth = "2026-07") {
      if (window.APIClient.isLive) {
        try {
          const res = await fetch(`${window.APIClient.baseUrl}/api/reports/forecast/${encodeURIComponent(projectId)}?snapshot_month=${encodeURIComponent(snapshotMonth)}`, { headers: window.APIClient.getAuthHeaders() });
          if (res.ok) return await res.json();
        } catch (e) {}
      }
      return {
        project_id: projectId,
        project_name: "Varanasi-Ranchi-Kolkata Expressway PKG-3 Ganga River Bridge & Viaduct",
        project_code: "NHAI-VRK-PKG3",
        agency: "National Highways Authority of India (NHAI)",
        ministry: "Ministry of Road Transport & Highways",
        state: "Uttar Pradesh",
        headline: "PAIMANA Snapshot → ASTRA Forecast",
        tagline: "Transforming Monthly Monitoring Observations into Predictive & Actionable Decisions",
        step_1_observed: {
          title: "1. What the Government Reported",
          source_report: "FlashReport_July_2026.pdf",
          physical_progress_pct: 62.16,
          cumulative_expenditure_cr: 1643.47,
          revised_cost_cr: 1845.2,
          target_doc: "2026-09-30",
          revised_doc: "2026-11-30",
          note: "Official reported figures from the PAIMANA Flash Report database without inference."
        },
        step_2_change: {
          title: "2. How the Project Changed (MoM Dynamics)",
          timeline_shift: "2026-04 (59.86%) → 2026-07 (62.16%)",
          physical_progress_delta: "+2.30% points",
          expenditure_disbursed_delta: "₹154.28 Cr",
          risk_trend: "DETERIORATING",
          risk_score_shift: "42.5 → 88.5"
        },
        step_3_detection: {
          title: "3. What ASTRA Detects",
          risk_level: "CRITICAL",
          risk_score: 88.5,
          critical_finding: "Execution velocity (0.76%/month) is severely insufficient to complete remaining 37.84% before target deadline.",
          primary_bottleneck: "CONTRACTOR_LIQUIDITY",
          data_freshness: "FRESH (Updated in current cycle)"
        },
        step_4_explainability: {
          title: "4. Why ASTRA is Alerting (Evidence Attribution)",
          drivers: [
            { factor: "Physical Progress vs Target Timeline Divergence", impact: "+31.2 Risk Points", evidence: "Actual progress 62.16% vs scheduled benchmark 82.5%" },
            { factor: "Primary Bottleneck / Execution Drag", impact: "+24.5 Risk Points", evidence: "Unresolved statutory/clearance impediment (CONTRACTOR_LIQUIDITY)" },
            { factor: "Physical-Financial Decoupling Gap", impact: "+18.1 Risk Points", evidence: "Disbursement 89.1% outpaces physical realization 62.2%" }
          ]
        },
        step_5_consequence: {
          title: "5. What May Happen if Current Trend Continues",
          estimated_additional_delay_months: 7.4,
          projected_completion_date: "2027-03-31",
          estimated_cost_escalation_cr: 221.4,
          projected_final_cost_cr: 2066.6
        },
        step_6_intervention: {
          title: "6. Which Intervention Should Be Reviewed",
          priority: "P1 — URGENT EXECUTIVE INTERVENTION",
          proposed_directive: "Deploy dual reverse-circulation drilling rigs, ratify revised pier cap schedule, and expedite inter-departmental utility diversion clearance.",
          governance_rule: "Intervention requires human review & administrative sign-off; ASTRA will NOT automatically execute binding orders."
        },
        step_7_what_if: {
          title: "7. What-If Counterfactual Recovery Outcome",
          baseline_risk: 88.5,
          simulated_risk: 44.2,
          risk_reduction_points: 44.3,
          recovered_months: 4.5
        }
      };
    },

    async getDataQuality(snapshotMonth = "2026-07") {
      if (window.APIClient.isLive) {
        try {
          const res = await fetch(`${window.APIClient.baseUrl}/api/reports/data-quality?snapshot_month=${encodeURIComponent(snapshotMonth)}`, { headers: window.APIClient.getAuthHeaders() });
          if (res.ok) return await res.json();
        } catch (e) {}
      }
      return {
        snapshot_month: snapshotMonth,
        total_flags_count: 401,
        rules_summary: [
          { rule_code: "DQ002", rule_name: "Expenditure Exceeds Revised Cost", severity: "CRITICAL", flag_count: 42 },
          { rule_code: "DQ008", rule_name: "Anomalous Date Sequence", severity: "HIGH", flag_count: 31 },
          { rule_code: "DQ010", rule_name: "Stale Progress Reporting", severity: "HIGH", flag_count: 38 },
          { rule_code: "DQ001", rule_name: "Revised Cost Less than Baseline", severity: "MEDIUM", flag_count: 54 },
          { rule_code: "DQ012", rule_name: "Inconsistent Identifiers", severity: "LOW", flag_count: 236 }
        ],
        sample_flagged_projects: [
          { rule_code: "DQ002", project_id: "PRJ-SYN-000045", project_name: "Deendayal Port Berth Modernization", severity: "CRITICAL", details: "Cumulative expenditure ₹845 Cr exceeds revised cost ₹820 Cr.", status: "HUMAN_REVIEW_REQUIRED" }
        ]
      };
    },

    async getModelBenchmarks() {
      if (window.APIClient.isLive) {
        try {
          const res = await fetch(`${window.APIClient.baseUrl}/api/reports/models/comparison`, { headers: window.APIClient.getAuthHeaders() });
          if (res.ok) return await res.json();
        } catch (e) {}
      }
      return {
        leakage_prevention: "Strict Forward Temporal Cutoff (No future revisions or progress utilized)",
        key_findings: {
          conclusion: "Empirical testing objectively confirms that ASTRA dynamic execution variables deliver statistically significant gains (+17.57 F1 points, +3.7 months early warning lead time) over conventional CUF baselines."
        },
        benchmarks: [
          { model_name: "CUF Baseline — Logistic Regression", target_name: "overall_risk", feature_tier: "CUF_ONLY", algorithm_type: "STATISTICAL_BASELINE", roc_auc: 0.6942, f1_macro: 0.6087, mae: null, lead_time_months: 2.1, status: "BENCHMARK" },
          { model_name: "CUF Baseline — LightGBM Classifier", target_name: "overall_risk", feature_tier: "CUF_ONLY", algorithm_type: "MACHINE_LEARNING", roc_auc: 0.7718, f1_macro: 0.7084, mae: null, lead_time_months: 3.4, status: "VALIDATED" },
          { model_name: "ASTRA Enhanced — LightGBM Classifier", target_name: "overall_risk", feature_tier: "ASTRA_ENHANCED", algorithm_type: "MACHINE_LEARNING", roc_auc: 0.8845, f1_macro: 0.7844, mae: null, lead_time_months: 5.8, status: "ACTIVE" },
          { model_name: "CUF Baseline — Ridge Regression", target_name: "schedule_delay", feature_tier: "CUF_ONLY", algorithm_type: "STATISTICAL_BASELINE", roc_auc: null, f1_macro: null, mae: 3.84, lead_time_months: 2.4, status: "BENCHMARK" },
          { model_name: "ASTRA Enhanced — LightGBM Regressor", target_name: "schedule_delay", feature_tier: "ASTRA_ENHANCED", algorithm_type: "MACHINE_LEARNING", roc_auc: null, f1_macro: null, mae: 1.48, lead_time_months: 6.2, status: "ACTIVE" }
        ]
      };
    }
  }
};

window.APIClient = APIClient;
