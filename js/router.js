// ==========================================================================
// PROJECTPULSE — Client-Side Router (Phase 9.5)
// Robust Hash-Based Navigation with Browser Back/Forward & Direct URL Access
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
    let hash = window.location.hash || "#/dashboard";
    if (hash === "#" || hash === "#/") hash = "#/dashboard";

    // Strip hash prefix and split off any query string
    const cleanHash = hash.replace("#/", "");
    const [path, queryString] = cleanHash.split("?");
    const segments = path.split("/");
    const rootRoute = segments[0] || "dashboard";

    const mount = document.getElementById("main-content-mount");
    if (!mount) return;

    // Route matching
    if (rootRoute === "dashboard" || rootRoute === "") {
      mount.innerHTML = window.DashboardView.render();
      if (window.DashboardView.postRender) window.DashboardView.postRender();
      window.AppShell.updateActiveNav("dashboard");
    } else if (rootRoute === "portfolio-matrix") {
      mount.innerHTML = window.PortfolioMatrixView.render();
      if (window.PortfolioMatrixView.postRender) window.PortfolioMatrixView.postRender();
      window.AppShell.updateActiveNav("portfolio-matrix");
    } else if (rootRoute === "projects" || rootRoute === "project") {
      if (segments[1]) {
        // Project Detail Route: #/projects/PRJ-DEMO-001 or #/project/PRJ-DEMO-001
        const projectId = decodeURIComponent(segments[1]);
        mount.innerHTML = window.ProjectDetailView.render(projectId);
        if (window.ProjectDetailView.postRender) window.ProjectDetailView.postRender(projectId);
        window.AppShell.updateActiveNav("projects/" + projectId);
      } else {
        // Projects List Route: #/projects
        mount.innerHTML = window.ProjectsView.render();
        if (window.ProjectsView.postRender) window.ProjectsView.postRender();
        window.AppShell.updateActiveNav("projects");
      }
    } else if (rootRoute === "early-warnings") {
      mount.innerHTML = window.EarlyWarningsView.render();
      if (window.EarlyWarningsView.postRender) window.EarlyWarningsView.postRender();
      window.AppShell.updateActiveNav("early-warnings");
    } else if (rootRoute === "bottlenecks") {
      mount.innerHTML = window.BottleneckView.render();
      if (window.BottleneckView.postRender) window.BottleneckView.postRender();
      window.AppShell.updateActiveNav("bottlenecks");
    } else if (rootRoute === "analytics") {
      mount.innerHTML = window.AnalyticsView.render();
      if (window.AnalyticsView.postRender) window.AnalyticsView.postRender();
      window.AppShell.updateActiveNav("analytics");
    } else if (rootRoute === "compare") {
      mount.innerHTML = window.ProjectCompareView.render();
      if (window.ProjectCompareView.postRender) window.ProjectCompareView.postRender();
      window.AppShell.updateActiveNav("compare");
    } else if (rootRoute === "data-quality") {
      mount.innerHTML = window.DataQualityView.render();
      if (window.DataQualityView.postRender) window.DataQualityView.postRender();
      window.AppShell.updateActiveNav("data-quality");
    } else if (rootRoute === "settings") {
      mount.innerHTML = window.SettingsView.render();
      if (window.SettingsView.postRender) window.SettingsView.postRender();
      window.AppShell.updateActiveNav("settings");
    } else if (rootRoute === "ministry") {
      if (window.MinistryView) window.MinistryView.render(mount);
      window.AppShell.updateActiveNav("ministry");
    } else if (rootRoute === "my-projects") {
      if (window.ProjectManagerView) window.ProjectManagerView.render(mount);
      window.AppShell.updateActiveNav("my-projects");
    } else if (rootRoute === "engineer") {
      if (window.EngineerView) window.EngineerView.render(mount);
      window.AppShell.updateActiveNav("engineer");
    } else if (rootRoute === "field") {
      if (window.FieldView) window.FieldView.render(mount);
      window.AppShell.updateActiveNav("field");
    } else if (rootRoute === "directives") {
      if (window.DirectivesView) window.DirectivesView.render(mount);
      window.AppShell.updateActiveNav("directives");
    } else if (rootRoute === "onboarding") {
      if (window.ProjectOnboardingView) window.ProjectOnboardingView.render(mount);
      window.AppShell.updateActiveNav("onboarding");
    } else if (rootRoute === "execution") {
      if (window.ExecutionControlView) window.ExecutionControlView.render(mount);
      window.AppShell.updateActiveNav("execution");
    } else if (rootRoute === "field-officer") {
      if (window.FieldOfficerDesk) window.FieldOfficerDesk.render(mount);
      window.AppShell.updateActiveNav("field-officer");
    } else if (rootRoute === "reports") {
      mount.innerHTML = window.ReportIntelligenceView.render();
      if (window.ReportIntelligenceView.postRender) window.ReportIntelligenceView.postRender();
      window.AppShell.updateActiveNav("reports");
    } else if (rootRoute === "what-if") {
      const qParams = new URLSearchParams(queryString || "");
      const projectId = qParams.get("project_id") || "PRJ-SYN-000002";
      mount.innerHTML = window.ProjectDetailView.render(projectId);
      if (window.ProjectDetailView.postRender) window.ProjectDetailView.postRender(projectId);
      window.AppShell.updateActiveNav("projects/" + projectId);
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
