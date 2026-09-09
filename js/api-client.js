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
      ADMIN: { username: "admin", name: "Dr. Rajesh Kumar", role: "ADMIN", badge: "Central Admin", designation: "Joint Secretary & Mission Director" },
      MONITORING_OFFICER: { username: "officer", name: "Smt. Priya Sharma", role: "MONITORING_OFFICER", badge: "Monitoring Officer", designation: "Director (Infrastructure Monitoring)" },
      ANALYST: { username: "analyst", name: "Shri Amitav Ghosh", role: "ANALYST", badge: "Senior Analyst", designation: "Senior Data Scientist & Policy Analyst" },
      VIEWER: { username: "viewer", name: "Shri Vikram Mehta", role: "VIEWER", badge: "Observer", designation: "Central Sector Observer" }
    };

    const sel = rolesMap[roleName.toUpperCase()] || rolesMap["MONITORING_OFFICER"];
    this.currentUser = {
      ...sel,
      division: "MoSPI / IPMD Oversight Desk",
      permissions: {
        can_view_dashboard: true,
        can_view_projects: true,
        can_view_warnings: true,
        can_manage_warnings: sel.role === "ADMIN" || sel.role === "MONITORING_OFFICER",
        can_run_scenarios: true,
        can_save_scenarios: sel.role !== "VIEWER",
        can_view_analytics: true,
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
        if (this.currentUser.role === "ADMIN") color = "bg-purple-100 text-purple-800 border-purple-200";
        else if (this.currentUser.role === "MONITORING_OFFICER") color = "bg-emerald-100 text-emerald-800 border-emerald-200";
        else if (this.currentUser.role === "ANALYST") color = "bg-amber-100 text-amber-800 border-amber-200";
        else if (this.currentUser.role === "VIEWER") color = "bg-slate-100 text-slate-800 border-slate-200";
        userBadgeMount.className = `px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${color}`;
        userBadgeMount.innerText = this.currentUser.role.replace("_", " ");
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
  }
};

window.APIClient = APIClient;
