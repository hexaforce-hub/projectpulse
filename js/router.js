// ==========================================================================
// PROJECTPULSE — Client-Side Router
// Robust Hash-Based Navigation with Browser Back/Forward & Direct URL Access
// ==========================================================================

const Router = {
  routes: {
    dashboard: window.DashboardView,
    projects: window.ProjectsView,
    "project-detail": window.ProjectDetailView,
    "early-warnings": window.EarlyWarningsView,
    analytics: window.AnalyticsView,
    settings: window.SettingsView
  },

  init() {
    window.addEventListener("hashchange", () => this.handleRoute());
    this.handleRoute();
  },

  handleRoute() {
    let hash = window.location.hash || "#/dashboard";
    if (hash === "#" || hash === "#/") hash = "#/dashboard";

    const path = hash.replace("#/", "");
    const segments = path.split("/");

    const mount = document.getElementById("main-content-mount");
    if (!mount) return;

    // Route matching
    if (segments[0] === "dashboard" || segments[0] === "") {
      mount.innerHTML = window.DashboardView.render();
      if (window.DashboardView.postRender) window.DashboardView.postRender();
      window.AppShell.updateActiveNav("dashboard");
    } else if (segments[0] === "projects") {
      if (segments[1]) {
        // Project Detail Route: #/projects/PRJ-DEMO-001
        const projectId = decodeURIComponent(segments[1]);
        mount.innerHTML = window.ProjectDetailView.render(projectId);
        if (window.ProjectDetailView.postRender) window.ProjectDetailView.postRender(projectId);
        window.AppShell.updateActiveNav("projects");
      } else {
        // Projects List Route: #/projects
        mount.innerHTML = window.ProjectsView.render();
        if (window.ProjectsView.postRender) window.ProjectsView.postRender();
        window.AppShell.updateActiveNav("projects");
      }
    } else if (segments[0] === "early-warnings") {
      mount.innerHTML = window.EarlyWarningsView.render();
      if (window.EarlyWarningsView.postRender) window.EarlyWarningsView.postRender();
      window.AppShell.updateActiveNav("early-warnings");
    } else if (segments[0] === "analytics") {
      mount.innerHTML = window.AnalyticsView.render();
      if (window.AnalyticsView.postRender) window.AnalyticsView.postRender();
      window.AppShell.updateActiveNav("analytics");
    } else if (segments[0] === "settings") {
      mount.innerHTML = window.SettingsView.render();
      if (window.SettingsView.postRender) window.SettingsView.postRender();
      window.AppShell.updateActiveNav("settings");
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
