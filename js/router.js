// ==========================================================================
// PROJECTPULSE / ASTRA — Client-Side Router (Phase 9.5 Overhaul)
// Robust Hash-Based Navigation with Role-Aware Landing & Breadcrumb Synchronization
// ==========================================================================

const Router = {
  routes: {
    dashboard: window.DashboardView,
    "portfolio-matrix": window.PortfolioMatrixView,
    projects: window.ProjectsView,
    "project-detail": window.ProjectDetailView,
    "early-warnings": window.EarlyWarningsView,
    bottlenecks: window.BottleneckView,
    analytics: window.AnalyticsView,
    compare: window.ProjectCompareView,
    "data-quality": window.DataQualityView,
    settings: window.SettingsView,
    ministry: window.MinistryView,
    "my-projects": window.ProjectManagerView,
    engineer: window.EngineerView,
    field: window.FieldView,
    directives: window.DirectivesView,
    onboarding: window.ProjectOnboardingView,
    execution: window.ExecutionControlView,
    "field-officer": window.FieldOfficerDesk,
    reports: window.ReportIntelligenceView
  },

  init() {
    window.addEventListener("hashchange", () => this.handleRoute());
    this.handleRoute();
  },

  handleRoute() {
    let hash = window.location.hash || "";
    const currentUser = (window.APIClient && window.APIClient.currentUser) ? window.APIClient.currentUser : null;

    // 1. Unauthenticated Gate — Force Sovereign Login Gateway
    if (!currentUser || hash === "#/login") {
      const appRoot = document.getElementById("app-root");
      if (appRoot) {
        if (!document.getElementById("astra-login-form")) {
          appRoot.innerHTML = window.LoginView ? window.LoginView.render() : '<div class="p-8 text-center text-slate-800">Please sign in to ASTRA.</div>';
        }
      }
      if (hash !== "#/login") {
        window.location.hash = "#/login";
      }
      return;
    }

    // 2. Authenticated User: Ensure AppShell is mounted in DOM
    if (!document.getElementById("main-content-mount")) {
      if (window.AppShell && window.AppShell.render) {
        window.AppShell.render();
      }
    }

    // 3. Role-Aware Auto-Landing when hash is empty, root, or login
    if (!hash || hash === "#" || hash === "#/" || hash === "#/login") {
      const role = (currentUser.role || "").toUpperCase();
      if (role === "MINISTRY_OFFICIAL" || role === "OFFICIAL") {
        window.location.hash = "#/ministry";
        return;
      } else if (role === "ANALYST") {
        window.location.hash = "#/analytics";
        return;
      } else if (role === "PROJECT_MANAGER" || role === "PM") {
        window.location.hash = "#/my-projects";
        return;
      } else if (role === "ENGINEER") {
        window.location.hash = "#/engineer";
        return;
      } else if (role === "FIELD_OFFICER" || role === "FO") {
        window.location.hash = "#/field-officer";
        return;
      } else if (role === "FIELD_WORKER" || role === "FIELD") {
        window.location.hash = "#/field";
        return;
      } else if (role === "ADMIN") {
        window.location.hash = "#/settings";
        return;
      } else {
        window.location.hash = "#/dashboard";
        return;
      }
    }

    // Strip hash prefix and split off any query string
    const cleanHash = hash.replace("#/", "");
    const [path, queryString] = cleanHash.split("?");
    const segments = path.split("/");
    const rootRoute = segments[0] || "dashboard";

    const mount = document.getElementById("main-content-mount");
    if (!mount) return;

    // Helper to safely update breadcrumbs via AppShell
    const updateCrumbs = (crumbs) => {
      if (window.AppShell && window.AppShell.updateBreadcrumbs) {
        window.AppShell.updateBreadcrumbs(crumbs);
      }
    };

    // Route matching
    if (rootRoute === "dashboard" || rootRoute === "") {
      mount.innerHTML = window.DashboardView.render();
      if (window.DashboardView.postRender) window.DashboardView.postRender();
      window.AppShell.updateActiveNav("dashboard");
      updateCrumbs([]);
    } else if (rootRoute === "portfolio-matrix") {
      mount.innerHTML = window.PortfolioMatrixView.render();
      if (window.PortfolioMatrixView.postRender) window.PortfolioMatrixView.postRender();
      window.AppShell.updateActiveNav("portfolio-matrix");
      updateCrumbs([
        { label: "Intelligence", href: "#/portfolio-matrix" },
        { label: "Portfolio Risk Matrix", href: "#/portfolio-matrix" }
      ]);
    } else if (rootRoute === "projects" || rootRoute === "project") {
      if (segments[1]) {
        // Project Detail Route: #/projects/PRJ-DEMO-001 or #/project/PRJ-DEMO-001
        const projectId = decodeURIComponent(segments[1]);
        mount.innerHTML = window.ProjectDetailView.render(projectId);
        if (window.ProjectDetailView.postRender) window.ProjectDetailView.postRender(projectId);
        window.AppShell.updateActiveNav("projects/" + projectId);
        updateCrumbs([
          { label: "Portfolio", href: "#/projects" },
          { label: "Projects Registry", href: "#/projects" },
          { label: projectId, href: `#/projects/${projectId}` }
        ]);
      } else {
        // Projects List Route: #/projects
        mount.innerHTML = window.ProjectsView.render();
        if (window.ProjectsView.postRender) window.ProjectsView.postRender();
        window.AppShell.updateActiveNav("projects");
        updateCrumbs([
          { label: "Portfolio", href: "#/projects" },
          { label: "Central Projects Registry", href: "#/projects" }
        ]);
      }
    } else if (rootRoute === "early-warnings") {
      mount.innerHTML = window.EarlyWarningsView.render();
      if (window.EarlyWarningsView.postRender) window.EarlyWarningsView.postRender();
      window.AppShell.updateActiveNav("early-warnings");
      updateCrumbs([
        { label: "Intelligence", href: "#/early-warnings" },
        { label: "Surveillance Radar & Alerts", href: "#/early-warnings" }
      ]);
    } else if (rootRoute === "bottlenecks") {
      mount.innerHTML = window.BottleneckView.render();
      if (window.BottleneckView.postRender) window.BottleneckView.postRender();
      window.AppShell.updateActiveNav("bottlenecks");
      updateCrumbs([
        { label: "Intelligence", href: "#/bottlenecks" },
        { label: "Root-Cause Bottlenecks", href: "#/bottlenecks" }
      ]);
    } else if (rootRoute === "analytics") {
      mount.innerHTML = window.AnalyticsView.render();
      if (window.AnalyticsView.postRender) window.AnalyticsView.postRender();
      window.AppShell.updateActiveNav("analytics");
      updateCrumbs([
        { label: "Intelligence", href: "#/analytics" },
        { label: "Predictive Risk Analytics", href: "#/analytics" }
      ]);
    } else if (rootRoute === "compare") {
      mount.innerHTML = window.ProjectCompareView.render();
      if (window.ProjectCompareView.postRender) window.ProjectCompareView.postRender();
      window.AppShell.updateActiveNav("compare");
      updateCrumbs([
        { label: "Intelligence", href: "#/compare" },
        { label: "Peer Comparison & Benchmarking", href: "#/compare" }
      ]);
    } else if (rootRoute === "data-quality") {
      mount.innerHTML = window.DataQualityView.render();
      if (window.DataQualityView.postRender) window.DataQualityView.postRender();
      window.AppShell.updateActiveNav("data-quality");
      updateCrumbs([
        { label: "Governance", href: "#/data-quality" },
        { label: "Data Quality & Contract Audit", href: "#/data-quality" }
      ]);
    } else if (rootRoute === "settings") {
      mount.innerHTML = window.SettingsView.render();
      if (window.SettingsView.postRender) window.SettingsView.postRender();
      window.AppShell.updateActiveNav("settings");
      updateCrumbs([
        { label: "Governance", href: "#/settings" },
        { label: "Surveillance Settings", href: "#/settings" }
      ]);
    } else if (rootRoute === "ministry") {
      if (window.MinistryView) window.MinistryView.render(mount);
      window.AppShell.updateActiveNav("ministry");
      updateCrumbs([
        { label: "Decisions", href: "#/ministry" },
        { label: "Ministry Secretarial Desk", href: "#/ministry" }
      ]);
    } else if (rootRoute === "my-projects") {
      if (window.ProjectManagerView) window.ProjectManagerView.render(mount);
      window.AppShell.updateActiveNav("my-projects");
      updateCrumbs([
        { label: "Decisions", href: "#/my-projects" },
        { label: "Corridor Project Director Desk", href: "#/my-projects" }
      ]);
    } else if (rootRoute === "engineer") {
      if (window.EngineerView) window.EngineerView.render(mount);
      window.AppShell.updateActiveNav("engineer");
      updateCrumbs([
        { label: "Execution", href: "#/engineer" },
        { label: "Site & Technical Engineer Station", href: "#/engineer" }
      ]);
    } else if (rootRoute === "field") {
      if (window.FieldView) window.FieldView.render(mount);
      window.AppShell.updateActiveNav("field");
      updateCrumbs([
        { label: "Execution", href: "#/field" },
        { label: "Field Operations Station", href: "#/field" }
      ]);
    } else if (rootRoute === "directives") {
      if (window.DirectivesView) window.DirectivesView.render(mount);
      window.AppShell.updateActiveNav("directives");
      updateCrumbs([
        { label: "Decisions", href: "#/directives" },
        { label: "Secretarial Directives", href: "#/directives" }
      ]);
    } else if (rootRoute === "onboarding") {
      if (window.ProjectOnboardingView) window.ProjectOnboardingView.render(mount);
      window.AppShell.updateActiveNav("onboarding");
      updateCrumbs([
        { label: "Execution", href: "#/onboarding" },
        { label: "Project Onboarding & Ingestion", href: "#/onboarding" }
      ]);
    } else if (rootRoute === "execution") {
      const execProjectId = segments[1] ? decodeURIComponent(segments[1]) : null;
      if (window.ExecutionControlView) window.ExecutionControlView.render(mount, execProjectId);
      window.AppShell.updateActiveNav("execution");
      updateCrumbs([
        { label: "Execution", href: "#/execution" },
        { label: execProjectId ? `Control Desk (${execProjectId})` : "Execution Control Desk", href: "#/execution" }
      ]);
    } else if (rootRoute === "field-officer") {
      if (window.FieldOfficerDesk) window.FieldOfficerDesk.render(mount);
      window.AppShell.updateActiveNav("field-officer");
      updateCrumbs([
        { label: "Execution", href: "#/field-officer" },
        { label: "Field Officer Inspection Desk", href: "#/field-officer" }
      ]);
    } else if (rootRoute === "reports") {
      mount.innerHTML = window.ReportIntelligenceView.render();
      if (window.ReportIntelligenceView.postRender) window.ReportIntelligenceView.postRender();
      window.AppShell.updateActiveNav("reports");
      updateCrumbs([
        { label: "Portfolio", href: "#/reports" },
        { label: "Reporting Intelligence", href: "#/reports" }
      ]);
    } else if (rootRoute === "what-if") {
      const qParams = new URLSearchParams(queryString || "");
      const projectId = qParams.get("project_id") || "PRJ-SYN-000002";
      mount.innerHTML = window.ProjectDetailView.render(projectId);
      if (window.ProjectDetailView.postRender) {
        window.ProjectDetailView.postRender(projectId).then(() => {
          if (window.ProjectDetailView.switchTab) window.ProjectDetailView.switchTab("whatif");
        });
      }
      window.AppShell.updateActiveNav("projects/" + projectId);
      updateCrumbs([
        { label: "Decisions", href: "#/what-if" },
        { label: "What-If Simulator", href: `#/what-if?project_id=${projectId}` }
      ]);
    } else {
      // Fallback to Dashboard
      window.location.hash = "#/dashboard";
    }

    // Scroll main viewport to top
    mount.scrollTop = 0;
  },

  renderCurrentRoute() {
    this.handleRoute();
  }
};

window.Router = Router;

