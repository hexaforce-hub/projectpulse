// ==========================================================================
// PROJECTPULSE — Application Shell Component (Phase 9.5 Command Center)
// Ministry of Statistics & Programme Implementation (MoSPI) - IPMD / PAIMANA
// Smart India Hackathon 2026 — Team HexaForce
// ==========================================================================

const AppShell = {
  isSidebarCollapsed: false,
  isMobileDrawerOpen: false,
  isPaletteOpen: false,

  render() {
    const appContainer = document.getElementById("app-root");
    if (!appContainer) return;

    appContainer.innerHTML = `
      <div class="flex h-screen overflow-hidden bg-slate-50 flex-col">
        
        <!-- Government Security Tricolor Accent Line -->
        <div class="gov-security-strip flex-shrink-0"></div>

        <div class="flex flex-1 overflow-hidden">

          <!-- =====================================================================
               DESKTOP SIDEBAR (256px / 72px Collapsed)
               ===================================================================== -->
          <aside id="app-sidebar" 
                 class="hidden md:flex flex-col flex-shrink-0 bg-white border-r border-slate-200 transition-all duration-200 z-30"
                 style="width: var(--sidebar-width);">
            
            <!-- Logo & Branding -->
            <div class="h-16 flex items-center px-4 border-b border-slate-200 justify-between">
              <a href="#/dashboard" class="flex items-center gap-2.5 overflow-hidden text-decoration-none">
                <div class="w-8 h-8 rounded-lg bg-blue-800 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
                  P
                </div>
                <div class="sidebar-text-brand leading-tight">
                  <span class="font-bold text-slate-900 tracking-tight text-sm block">PROJECTPULSE</span>
                  <span class="text-[10px] text-slate-500 font-medium block">MoSPI • Command Center</span>
                </div>
              </a>
              <button id="btn-collapse-sidebar" class="text-slate-400 hover:text-slate-700 p-1.5 rounded-md text-xs hover:bg-slate-100" title="Toggle Sidebar">
                ⇥
              </button>
            </div>

            <!-- Grouped Navigation Links -->
            <nav class="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
              
              <!-- Group 1: Command & Portfolio -->
              <div>
                <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1.5 sidebar-heading">
                  Command & Portfolio
                </div>
                <div class="space-y-0.5">
                  <a href="#/dashboard" data-route="dashboard" class="nav-item flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-slate-700 hover:bg-slate-100">
                    <span class="text-base">📊</span>
                    <span class="sidebar-text">Command Center</span>
                  </a>

                  <a href="#/portfolio-matrix" data-route="portfolio-matrix" class="nav-item flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-slate-700 hover:bg-slate-100">
                    <span class="text-base">🎯</span>
                    <span class="sidebar-text">Risk vs Outlay Matrix</span>
                  </a>

                  <a href="#/projects" data-route="projects" class="nav-item flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-slate-700 hover:bg-slate-100">
                    <span class="text-base">📁</span>
                    <span class="sidebar-text">Projects Registry</span>
                  </a>
                </div>
              </div>

              <!-- Group 2: Intelligence Suite -->
              <div>
                <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1.5 sidebar-heading">
                  Intelligence Suite
                </div>
                <div class="space-y-0.5">
                  <a href="#/early-warnings" data-route="early-warnings" class="nav-item flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-slate-700 hover:bg-slate-100">
                    <span class="text-base">⚠️</span>
                    <span class="sidebar-text">Early Warning Radar</span>
                    <span id="sidebar-alert-badge" class="ml-auto text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded-full sidebar-badge">14k</span>
                  </a>

                  <a href="#/bottlenecks" data-route="bottlenecks" class="nav-item flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-slate-700 hover:bg-slate-100">
                    <span class="text-base">📍</span>
                    <span class="sidebar-text">Bottlenecks Intel</span>
                  </a>

                  <a href="#/analytics" data-route="analytics" class="nav-item flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-slate-700 hover:bg-slate-100">
                    <span class="text-base">📈</span>
                    <span class="sidebar-text">Portfolio Analytics</span>
                  </a>

                  <a href="#/compare" data-route="compare" class="nav-item flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-slate-700 hover:bg-slate-100">
                    <span class="text-base">⚖️</span>
                    <span class="sidebar-text">Peer Benchmarking</span>
                  </a>
                </div>
              </div>

              <!-- Group 3: Governance & Decision -->
              <div>
                <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1.5 sidebar-heading">
                  Governance & Decision
                </div>
                <div class="space-y-0.5">
                  <a href="#/data-quality" data-route="data-quality" class="nav-item flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-slate-700 hover:bg-slate-100">
                    <span class="text-base">🛡️</span>
                    <span class="sidebar-text">Data Quality & Gaps</span>
                  </a>

                  <a href="#/settings" data-route="settings" class="nav-item flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-slate-700 hover:bg-slate-100">
                    <span class="text-base">⚙️</span>
                    <span class="sidebar-text">System & Governance</span>
                  </a>
                </div>
              </div>

            </nav>

            <!-- Sidebar Footer: Organization Context -->
            <div class="p-3 border-t border-slate-200 text-caption text-slate-500 bg-slate-50/70 sidebar-text">
              <div class="flex items-center justify-between">
                <div class="font-semibold text-slate-800 text-xs">MoSPI • IPMD</div>
                <span class="text-[9px] font-bold bg-blue-100 text-blue-800 px-1 py-0.2 rounded">PAIMANA</span>
              </div>
              <div class="text-[11px] text-slate-400 truncate mt-0.5">10,000 Central Sector Projects</div>
            </div>
          </aside>

          <!-- =====================================================================
               MAIN VIEWPORT WRAPPER (Top Header + Dynamic Route Content)
               ===================================================================== -->
          <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
            
            <!-- Top Header (64px) -->
            <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-20 flex-shrink-0">
              
              <!-- Left: Mobile Hamburger & Breadcrumb -->
              <div class="flex items-center gap-3">
                <button id="btn-mobile-menu" class="md:hidden p-2 rounded-md text-slate-600 hover:bg-slate-100 text-lg" aria-label="Open Navigation Menu">
                  ☰
                </button>
                <nav class="flex items-center gap-2" aria-label="Breadcrumb">
                  <a href="#/dashboard" id="header-breadcrumb-root" class="text-caption text-slate-500 hover:text-blue-700 font-medium">ProjectPulse</a>
                  <span class="text-slate-300 text-xs">/</span>
                  <span id="header-breadcrumb-page" class="text-sm font-bold text-slate-900">National Command Center</span>
                </nav>
              </div>

              <!-- Center: Quick Jump / Command Palette Search Input -->
              <div class="hidden lg:flex items-center">
                <button id="btn-trigger-palette" class="flex items-center gap-2.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-lg text-xs text-slate-500 transition-colors w-72 justify-between">
                  <span class="flex items-center gap-2">
                    <span>🔍</span>
                    <span>Search projects, alerts, tools...</span>
                  </span>
                  <kbd class="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-white border border-slate-300 rounded text-slate-600 shadow-2xs">Ctrl K</kbd>
                </button>
              </div>

              <!-- Right: Status Indicators & Officer Profile -->
              <div class="flex items-center gap-3 sm:gap-4 text-caption">
                
                <!-- Live Backend Engine Status Indicator -->
                <div id="backend-status-indicator"></div>

                <!-- Early Warnings Notification Bell -->
                <a href="#/early-warnings" class="relative p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors" title="Active Early Warnings Queue">
                  <span class="text-base">🔔</span>
                  <span class="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-red-600 ring-2 ring-white"></span>
                </a>

                <!-- User Profile & Quick Demo Role Switcher -->
                <div class="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <button id="btn-open-role-switcher" class="flex items-center gap-2 text-left p-1 rounded-lg hover:bg-slate-100 transition-colors group" title="Click to switch demo role (Admin, Officer, Analyst, Viewer)">
                    <div id="header-user-avatar" class="w-8 h-8 rounded-full bg-blue-800 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      PS
                    </div>
                    <div class="hidden sm:block leading-tight">
                      <div id="header-user-name" class="text-xs font-bold text-slate-900 group-hover:text-blue-800">Smt. Priya Sharma</div>
                      <div class="flex items-center gap-1.5 mt-0.5">
                        <span id="header-user-role" class="text-[10px] text-slate-500">Director IPMD</span>
                        <span id="header-user-badge" class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">OFFICER</span>
                      </div>
                    </div>
                    <span class="text-[10px] text-slate-400 group-hover:text-slate-700 ml-0.5">▾</span>
                  </button>
                </div>

              </div>
            </header>

            <!-- Main Scrollable Content Mount -->
            <main id="main-content-mount" class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8" role="main">
              <!-- Dynamic route content injected here by Router -->
            </main>

          </div>

          <!-- =====================================================================
               MOBILE SLIDE-OVER DRAWER
               ===================================================================== -->
          <div id="mobile-drawer-backdrop" class="fixed inset-0 bg-slate-900/40 z-40 hidden md:hidden"></div>
          <aside id="mobile-drawer" class="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 z-50 transform -translate-x-full transition-transform duration-200 md:hidden flex flex-col">
            <div class="h-16 flex items-center justify-between px-4 border-b border-slate-200">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-blue-800 flex items-center justify-center text-white font-bold text-xs">P</div>
                <div class="font-bold text-slate-900 text-sm">PROJECTPULSE</div>
              </div>
              <button id="btn-close-mobile-drawer" class="text-slate-500 hover:text-slate-800 text-lg p-1.5" aria-label="Close menu">✕</button>
            </div>
            <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              <a href="#/dashboard" class="mobile-nav-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100">
                <span>📊</span> Command Center
              </a>
              <a href="#/portfolio-matrix" class="mobile-nav-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100">
                <span>🎯</span> Risk vs Outlay Matrix
              </a>
              <a href="#/projects" class="mobile-nav-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100">
                <span>📁</span> Projects Registry
              </a>
              <a href="#/early-warnings" class="mobile-nav-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100">
                <span>⚠️</span> Early Warnings
              </a>
              <a href="#/bottlenecks" class="mobile-nav-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100">
                <span>📍</span> Bottlenecks Intel
              </a>
              <a href="#/analytics" class="mobile-nav-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100">
                <span>📈</span> Portfolio Analytics
              </a>
              <a href="#/compare" class="mobile-nav-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100">
                <span>⚖️</span> Peer Benchmarking
              </a>
              <a href="#/data-quality" class="mobile-nav-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100">
                <span>🛡️</span> Data Quality & Gaps
              </a>
              <a href="#/settings" class="mobile-nav-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100">
                <span>⚙️</span> System & Governance
              </a>
            </nav>
            <div class="p-3 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500">
              <div class="font-semibold text-slate-700">MoSPI • IPMD Platform</div>
              <div>Smart India Hackathon 2026</div>
            </div>
          </aside>

          <!-- =====================================================================
               GLOBAL COMMAND PALETTE MODAL (Ctrl+K)
               ===================================================================== -->
          <div id="command-palette-backdrop" class="command-palette-backdrop hidden">
            <div class="command-palette-modal">
              <div class="p-3 border-b border-slate-200 flex items-center gap-3">
                <span class="text-slate-400 text-base">🔍</span>
                <input type="text" id="palette-search-input" 
                       placeholder="Type a command, project name, or route..." 
                       class="w-full text-sm outline-none text-slate-800 placeholder-slate-400" />
                <kbd class="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">ESC</kbd>
              </div>

              <div class="p-2 max-h-80 overflow-y-auto space-y-1 text-xs" id="palette-results-list">
                <!-- Dynamic or default command items -->
                <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2.5 py-1">Quick Navigation</div>
                <a href="#/dashboard" class="palette-item flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-100 text-slate-700">
                  <span class="flex items-center gap-2"><span>📊</span> <span>National Command Center</span></span>
                  <span class="text-[10px] text-slate-400">#/dashboard</span>
                </a>
                <a href="#/portfolio-matrix" class="palette-item flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-100 text-slate-700">
                  <span class="flex items-center gap-2"><span>🎯</span> <span>Portfolio Risk vs Outlay Matrix</span></span>
                  <span class="text-[10px] text-slate-400">#/portfolio-matrix</span>
                </a>
                <a href="#/bottlenecks" class="palette-item flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-100 text-slate-700">
                  <span class="flex items-center gap-2"><span>📍</span> <span>Bottleneck Intelligence Observatory</span></span>
                  <span class="text-[10px] text-slate-400">#/bottlenecks</span>
                </a>
                <a href="#/compare" class="palette-item flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-100 text-slate-700">
                  <span class="flex items-center gap-2"><span>⚖️</span> <span>Project Peer Benchmarking</span></span>
                  <span class="text-[10px] text-slate-400">#/compare</span>
                </a>
                <a href="#/data-quality" class="palette-item flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-100 text-slate-700">
                  <span class="flex items-center gap-2"><span>🛡️</span> <span>Data Quality & Decoupling Observatory</span></span>
                  <span class="text-[10px] text-slate-400">#/data-quality</span>
                </a>

                <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2.5 pt-2 pb-1">Sample Project Dossiers</div>
                <a href="#/projects/PRJ-DEMO-001" class="palette-item flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-100 text-slate-700">
                  <span class="flex items-center gap-2"><span>🛣️</span> <span>NH-44 Strategic Corridor Project (Hero)</span></span>
                  <span class="text-[10px] font-mono text-purple-700 bg-purple-50 px-1 rounded">PRJ-DEMO-001</span>
                </a>
                <a href="#/projects/PRJ-DEMO-002" class="palette-item flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-100 text-slate-700">
                  <span class="flex items-center gap-2"><span>🚆</span> <span>Eastern Dedicated Freight Corridor (EDFC-II)</span></span>
                  <span class="text-[10px] font-mono text-blue-700 bg-blue-50 px-1 rounded">PRJ-DEMO-002</span>
                </a>
                <a href="#/projects/PRJ-DEMO-003" class="palette-item flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-100 text-slate-700">
                  <span class="flex items-center gap-2"><span>🚇</span> <span>Mumbai Metro Line 3 Underground Corridor</span></span>
                  <span class="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1 rounded">PRJ-DEMO-003</span>
                </a>
              </div>

              <div class="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                <span>Navigate using <kbd class="px-1 bg-white border rounded">↑</kbd> <kbd class="px-1 bg-white border rounded">↓</kbd> or click</span>
                <span>Press <kbd class="px-1 bg-white border rounded">ESC</kbd> to exit</span>
              </div>
            </div>
          </div>

          <!-- =====================================================================
               QUICK DEMO ROLE SWITCHER MODAL
               ===================================================================== -->
          <div id="role-switcher-modal" class="fixed inset-0 bg-slate-900/50 z-50 hidden flex items-center justify-center p-4">
            <div class="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4">
              <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 class="text-sm font-bold text-slate-900">Switch Demonstration Role</h3>
                  <p class="text-[11px] text-slate-500">Test role-based access control and administrative permissions</p>
                </div>
                <button id="btn-close-role-switcher" class="text-slate-400 hover:text-slate-700 text-sm p-1">✕</button>
              </div>

              <div class="space-y-2">
                <!-- Admin -->
                <button data-switch-role="ADMIN" class="btn-role-opt w-full text-left p-3 rounded-lg border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 flex items-start gap-3 transition-colors">
                  <span class="w-8 h-8 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs flex-shrink-0">JS</span>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-bold text-slate-900">Dr. Rajesh Kumar (ADMIN)</span>
                      <span class="text-[9px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.2 rounded">Full Access</span>
                    </div>
                    <div class="text-[11px] text-slate-500">Joint Secretary & Mission Director • Full audit, system settings & user administration</div>
                  </div>
                </button>

                <!-- Monitoring Officer -->
                <button data-switch-role="MONITORING_OFFICER" class="btn-role-opt w-full text-left p-3 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 flex items-start gap-3 transition-colors">
                  <span class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs flex-shrink-0">PS</span>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-bold text-slate-900">Smt. Priya Sharma (OFFICER)</span>
                      <span class="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">Recommended Demo</span>
                    </div>
                    <div class="text-[11px] text-slate-500">Director IPMD • Early warning triage, What-If simulator saves & audit review</div>
                  </div>
                </button>

                <!-- Analyst -->
                <button data-switch-role="ANALYST" class="btn-role-opt w-full text-left p-3 rounded-lg border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 flex items-start gap-3 transition-colors">
                  <span class="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs flex-shrink-0">AG</span>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-bold text-slate-900">Shri Amitav Ghosh (ANALYST)</span>
                      <span class="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">Data Science</span>
                    </div>
                    <div class="text-[11px] text-slate-500">Senior Policy Analyst • Deep ML explainability & scenario sensitivity sweeps</div>
                  </div>
                </button>

                <!-- Viewer -->
                <button data-switch-role="VIEWER" class="btn-role-opt w-full text-left p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 flex items-start gap-3 transition-colors">
                  <span class="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs flex-shrink-0">VM</span>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-bold text-slate-900">Shri Vikram Mehta (VIEWER)</span>
                      <span class="text-[9px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.2 rounded">Read-Only</span>
                    </div>
                    <div class="text-[11px] text-slate-500">Central Sector Observer • Read-only portfolio monitoring without triage rights</div>
                  </div>
                </button>
              </div>

              <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>MoSPI RBAC Security Enforcement</span>
                <button id="btn-cancel-role-switcher" class="text-slate-600 hover:text-slate-900 font-medium">Cancel</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    `;

    this.bindEvents();
    if (window.APIClient) window.APIClient.updateUserInterface();
  },

  bindEvents() {
    // Desktop Sidebar Collapse Toggle
    const collapseBtn = document.getElementById("btn-collapse-sidebar");
    const sidebar = document.getElementById("app-sidebar");
    if (collapseBtn && sidebar) {
      collapseBtn.addEventListener("click", () => {
        this.isSidebarCollapsed = !this.isSidebarCollapsed;
        if (this.isSidebarCollapsed) {
          sidebar.style.width = "var(--sidebar-collapsed-width)";
          sidebar.querySelectorAll(".sidebar-text, .sidebar-heading, .sidebar-badge, .sidebar-text-brand").forEach(el => el.classList.add("hidden"));
          collapseBtn.innerText = "⇥";
        } else {
          sidebar.style.width = "var(--sidebar-width)";
          sidebar.querySelectorAll(".sidebar-text, .sidebar-heading, .sidebar-badge, .sidebar-text-brand").forEach(el => el.classList.remove("hidden"));
          collapseBtn.innerText = "⇤";
        }
      });
    }

    // Mobile Drawer Handlers
    const mobileBtn = document.getElementById("btn-mobile-menu");
    const closeBtn = document.getElementById("btn-close-mobile-drawer");
    const backdrop = document.getElementById("mobile-drawer-backdrop");
    const drawer = document.getElementById("mobile-drawer");

    const openDrawer = () => {
      if (drawer && backdrop) {
        drawer.classList.remove("-translate-x-full");
        backdrop.classList.remove("hidden");
      }
    };

    const closeDrawer = () => {
      if (drawer && backdrop) {
        drawer.classList.add("-translate-x-full");
        backdrop.classList.add("hidden");
      }
    };

    if (mobileBtn) mobileBtn.addEventListener("click", openDrawer);
    if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
    if (backdrop) backdrop.addEventListener("click", closeDrawer);

    document.querySelectorAll(".mobile-nav-link").forEach(link => {
      link.addEventListener("click", closeDrawer);
    });

    // Command Palette Handlers
    const paletteTrigger = document.getElementById("btn-trigger-palette");
    const paletteBackdrop = document.getElementById("command-palette-backdrop");
    const paletteInput = document.getElementById("palette-search-input");

    const openPalette = () => {
      if (paletteBackdrop) {
        paletteBackdrop.classList.remove("hidden");
        this.isPaletteOpen = true;
        if (paletteInput) {
          paletteInput.value = "";
          paletteInput.focus();
        }
      }
    };

    const closePalette = () => {
      if (paletteBackdrop) {
        paletteBackdrop.classList.add("hidden");
        this.isPaletteOpen = false;
      }
    };

    if (paletteTrigger) paletteTrigger.addEventListener("click", openPalette);

    if (paletteBackdrop) {
      paletteBackdrop.addEventListener("click", (e) => {
        if (e.target === paletteBackdrop) closePalette();
      });
    }

    // Keyboard Shortcuts: Ctrl+K or / opens palette, ESC closes it
    window.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (this.isPaletteOpen) closePalette();
        else openPalette();
      } else if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) {
        e.preventDefault();
        openPalette();
      } else if (e.key === "Escape") {
        closePalette();
        const roleModal = document.getElementById("role-switcher-modal");
        if (roleModal) roleModal.classList.add("hidden");
      }
    });

    // Close palette on clicking any item
    document.querySelectorAll(".palette-item").forEach(item => {
      item.addEventListener("click", closePalette);
    });

    // Filter palette results on typing
    if (paletteInput) {
      paletteInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase().trim();
        const items = document.querySelectorAll(".palette-item");
        items.forEach(it => {
          const text = it.textContent.toLowerCase();
          if (!query || text.includes(query)) {
            it.classList.remove("hidden");
          } else {
            it.classList.add("hidden");
          }
        });
      });
    }

    // Role Switcher Modal Handlers
    const roleModal = document.getElementById("role-switcher-modal");
    const openRoleBtn = document.getElementById("btn-open-role-switcher");
    const closeRoleBtn = document.getElementById("btn-close-role-switcher");
    const cancelRoleBtn = document.getElementById("btn-cancel-role-switcher");

    const openModal = () => { if (roleModal) roleModal.classList.remove("hidden"); };
    const closeModal = () => { if (roleModal) roleModal.classList.add("hidden"); };

    if (openRoleBtn) openRoleBtn.addEventListener("click", openModal);
    if (closeRoleBtn) closeRoleBtn.addEventListener("click", closeModal);
    if (cancelRoleBtn) cancelRoleBtn.addEventListener("click", closeModal);

    document.querySelectorAll(".btn-role-opt").forEach(btn => {
      btn.addEventListener("click", async () => {
        const role = btn.getAttribute("data-switch-role");
        if (window.APIClient) {
          await window.APIClient.switchRole(role);
        }
        closeModal();
      });
    });
  },

  updateActiveNav(activeRoute) {
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach(item => {
      const route = item.dataset.route;
      if (route === activeRoute || (activeRoute.startsWith("projects") && route === "projects")) {
        item.classList.add("bg-blue-50", "text-blue-900", "font-semibold");
        item.classList.remove("text-slate-700");
      } else {
        item.classList.remove("bg-blue-50", "text-blue-900", "font-semibold");
        item.classList.add("text-slate-700");
      }
    });

    // Update Breadcrumb text
    const breadcrumbPage = document.getElementById("header-breadcrumb-page");
    if (breadcrumbPage) {
      const routeMap = {
        "dashboard": "National Command Center",
        "portfolio-matrix": "Risk vs Outlay Matrix",
        "projects": "Projects Registry",
        "early-warnings": "Early Warning Radar",
        "bottlenecks": "Bottlenecks Intel",
        "analytics": "Portfolio Analytics",
        "compare": "Peer Benchmarking",
        "data-quality": "Data Quality Observatory",
        "settings": "System & Governance"
      };

      if (activeRoute.startsWith("projects/")) {
        breadcrumbPage.innerText = "Project Dossier";
      } else {
        breadcrumbPage.innerText = routeMap[activeRoute] || "National Command Center";
      }
    }
  }
};

window.AppShell = AppShell;
