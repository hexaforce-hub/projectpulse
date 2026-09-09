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
                <img src="assets/astra_logo.png" alt="ASTRA" class="w-9 h-9 rounded-xl object-contain flex-shrink-0 shadow-sm border border-slate-200 bg-white p-0.5" />
                <div class="sidebar-text-brand leading-tight">
                  <span class="font-extrabold text-slate-900 tracking-tight text-sm block">ASTRA</span>
                  <span class="text-[9px] text-slate-500 font-semibold block leading-none">MoSPI • ProjectPulse</span>
                </div>
              </a>
              <button id="btn-collapse-sidebar" class="text-slate-400 hover:text-slate-700 p-1.5 rounded-md text-xs hover:bg-slate-100" title="Toggle Sidebar">
                ⇥
              </button>
            </div>

            <!-- Grouped Navigation Links (Rendered Dynamically by Role) -->
            <nav id="sidebar-nav-container" class="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
              
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
                  <a href="#/dashboard" id="header-breadcrumb-root" class="text-caption text-slate-500 hover:text-blue-700 font-medium">ASTRA</a>
                  <span class="text-slate-300 text-xs">/</span>
                  <span id="header-breadcrumb-page" class="text-sm font-bold text-slate-900">National Command Center</span>
                </nav>

                <!-- Official ASTRA Institutional Header Badge -->
                <div class="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200">
                  <img src="assets/astra_logo.png" alt="ASTRA" class="w-6 h-6 object-contain rounded" />
                  <div class="leading-none text-left">
                    <span class="text-[10px] font-extrabold text-slate-900 tracking-wider block">ASTRA</span>
                    <span class="text-[8px] text-slate-400 font-medium block">MoSPI • IPMD</span>
                  </div>
                </div>
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

            <!-- Main Content Area with Institutional ASTRA Watermark -->
            <div class="flex-1 relative overflow-hidden flex flex-col">
              <!-- ASTRA Institutional Watermark Overlay (Centrally positioned, ultra-low opacity watermark) -->
              <div class="astra-watermark-overlay" aria-hidden="true">
                <img src="assets/astra_logo.png" alt="ASTRA Watermark" />
              </div>

              <!-- Main Scrollable Content Mount -->
              <main id="main-content-mount" class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative z-10" role="main">
                <!-- Dynamic route content injected here by Router -->
              </main>
            </div>

          </div>

          <!-- =====================================================================
               MOBILE SLIDE-OVER DRAWER
               ===================================================================== -->
          <div id="mobile-drawer-backdrop" class="fixed inset-0 bg-slate-900/40 z-40 hidden md:hidden"></div>
          <aside id="mobile-drawer" class="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 z-50 transform -translate-x-full transition-transform duration-200 md:hidden flex flex-col">
            <div class="h-16 flex items-center justify-between px-4 border-b border-slate-200">
              <div class="flex items-center gap-2.5">
                <img src="assets/astra_logo.png" alt="ASTRA" class="w-8 h-8 rounded-lg object-contain border border-slate-200 bg-white p-0.5" />
                <div class="leading-tight">
                  <span class="font-extrabold text-slate-900 text-sm block">ASTRA</span>
                  <span class="text-[9px] text-slate-500 font-medium block">MoSPI • ProjectPulse</span>
                </div>
              </div>
              <button id="btn-close-mobile-drawer" class="text-slate-500 hover:text-slate-800 text-lg p-1.5" aria-label="Close menu">✕</button>
            </div>
            <nav id="mobile-drawer-nav-container" class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
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
                <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2.5 py-1">Quick Navigation & Workspaces</div>
                <a href="#/dashboard" class="palette-item flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-100 text-slate-700">
                  <span class="flex items-center gap-2"><span>📊</span> <span>National Command Center</span></span>
                  <span class="text-[10px] text-slate-400">#/dashboard</span>
                </a>
                <a href="#/ministry" class="palette-item flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-100 text-slate-700">
                  <span class="flex items-center gap-2"><span>🏛️</span> <span>Ministry Command Center (MoRTH)</span></span>
                  <span class="text-[10px] text-slate-400">#/ministry</span>
                </a>
                <a href="#/my-projects" class="palette-item flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-100 text-slate-700">
                  <span class="flex items-center gap-2"><span>🛣️</span> <span>Corridors Project Manager Workspace</span></span>
                  <span class="text-[10px] text-slate-400">#/my-projects</span>
                </a>
                <a href="#/engineer" class="palette-item flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-100 text-slate-700">
                  <span class="flex items-center gap-2"><span>👷</span> <span>Site & Technical Engineering Station</span></span>
                  <span class="text-[10px] text-slate-400">#/engineer</span>
                </a>
                <a href="#/field" class="palette-item flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-100 text-slate-700">
                  <span class="flex items-center gap-2"><span>🚜</span> <span>Field Operations & Ground Workstation</span></span>
                  <span class="text-[10px] text-slate-400">#/field</span>
                </a>
                <a href="#/directives" class="palette-item flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-100 text-slate-700">
                  <span class="flex items-center gap-2"><span>📜</span> <span>National Directives & Escalations</span></span>
                  <span class="text-[10px] text-slate-400">#/directives</span>
                </a>
                <a href="#/portfolio-matrix" class="palette-item flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-100 text-slate-700">
                  <span class="flex items-center gap-2"><span>🎯</span> <span>Portfolio Risk vs Outlay Matrix</span></span>
                  <span class="text-[10px] text-slate-400">#/portfolio-matrix</span>
                </a>
                <a href="#/early-warnings" class="palette-item flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-100 text-slate-700">
                  <span class="flex items-center gap-2"><span>⚠️</span> <span>Early Warning Radar</span></span>
                  <span class="text-[10px] text-slate-400">#/early-warnings</span>
                </a>
                <a href="#/bottlenecks" class="palette-item flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-100 text-slate-700">
                  <span class="flex items-center gap-2"><span>📍</span> <span>Bottleneck Intelligence Observatory</span></span>
                  <span class="text-[10px] text-slate-400">#/bottlenecks</span>
                </a>
                <a href="#/analytics" class="palette-item flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-100 text-slate-700">
                  <span class="flex items-center gap-2"><span>📈</span> <span>Portfolio Analytics (LightGBM)</span></span>
                  <span class="text-[10px] text-slate-400">#/analytics</span>
                </a>

                <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2.5 pt-2 pb-1">Primary Indexed Projects</div>
                <a href="#/projects/PRJ-SYN-000002" class="palette-item flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-100 text-slate-700">
                  <span class="flex items-center gap-2"><span>🛣️</span> <span>Varanasi-Ranchi-Kolkata Expressway (PKG-3)</span></span>
                  <span class="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1 rounded">PRJ-SYN-000002</span>
                </a>
                <a href="#/projects/PRJ-SYN-000003" class="palette-item flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-100 text-slate-700">
                  <span class="flex items-center gap-2"><span>🛣️</span> <span>Delhi-Mumbai Expressway Spur (MoRTH)</span></span>
                  <span class="text-[10px] font-mono text-blue-700 bg-blue-50 px-1 rounded">PRJ-SYN-000003</span>
                </a>
                <a href="#/projects/PRJ-SYN-000004" class="palette-item flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-100 text-slate-700">
                  <span class="flex items-center gap-2"><span>🛣️</span> <span>Varanasi-Ranchi-Kolkata Stage-I</span></span>
                  <span class="text-[10px] font-mono text-purple-700 bg-purple-50 px-1 rounded">PRJ-SYN-000004</span>
                </a>
                <a href="#/projects/PRJ-SYN-000001" class="palette-item flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-100 text-slate-700">
                  <span class="flex items-center gap-2"><span>🚆</span> <span>Secunderabad-Mahabubnagar Doubling (Railways)</span></span>
                  <span class="text-[10px] font-mono text-amber-700 bg-amber-50 px-1 rounded">PRJ-SYN-000001</span>
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

              <div class="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                <!-- 1. National Leadership (Minister) -->
                <button data-switch-role="NATIONAL_LEADER" class="btn-role-opt w-full text-left p-3 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 flex items-start gap-3 transition-colors">
                  <span class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-900 flex items-center justify-center font-bold text-xs flex-shrink-0">JS</span>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-bold text-slate-900">Dr. Jitendra Singh (MINISTER)</span>
                      <span class="text-[9px] bg-indigo-100 text-indigo-900 font-bold px-1.5 py-0.2 rounded border border-indigo-200">National Scope</span>
                    </div>
                    <div class="text-[11px] text-slate-500">Union Minister of State (IC) MoSPI • Macro governance, directives & inter-ministerial reviews</div>
                  </div>
                </button>

                <!-- 2. Ministry Official (Secretary) -->
                <button data-switch-role="MINISTRY_OFFICIAL" class="btn-role-opt w-full text-left p-3 rounded-lg border border-slate-200 hover:border-cyan-400 hover:bg-cyan-50/50 flex items-start gap-3 transition-colors">
                  <span class="w-8 h-8 rounded-full bg-cyan-100 text-cyan-900 flex items-center justify-center font-bold text-xs flex-shrink-0">AJ</span>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-bold text-slate-900">Shri Anurag Jain, IAS (SECRETARY)</span>
                      <span class="text-[9px] bg-cyan-100 text-cyan-900 font-bold px-1.5 py-0.2 rounded border border-cyan-200">Ministry Scope</span>
                    </div>
                    <div class="text-[11px] text-slate-500">Secretary, MoRTH • Ministry portfolio command, corridor escalations & clearance tracking</div>
                  </div>
                </button>

                <!-- 3. Policy & ML Analyst -->
                <button data-switch-role="ANALYST" class="btn-role-opt w-full text-left p-3 rounded-lg border border-slate-200 hover:border-violet-400 hover:bg-violet-50/50 flex items-start gap-3 transition-colors">
                  <span class="w-8 h-8 rounded-full bg-violet-100 text-violet-900 flex items-center justify-center font-bold text-xs flex-shrink-0">AG</span>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-bold text-slate-900">Shri Amitav Ghosh (ANALYST)</span>
                      <span class="text-[9px] bg-violet-100 text-violet-900 font-bold px-1.5 py-0.2 rounded border border-violet-200">Portfolio ML Scope</span>
                    </div>
                    <div class="text-[11px] text-slate-500">Senior Policy Analyst • Deep ML explainability, LightGBM sensitivity sweeps & benchmarking</div>
                  </div>
                </button>

                <!-- 4. Project Manager (Corridors) -->
                <button data-switch-role="PROJECT_MANAGER" class="btn-role-opt w-full text-left p-3 rounded-lg border border-slate-200 hover:border-sky-400 hover:bg-sky-50/50 flex items-start gap-3 transition-colors">
                  <span class="w-8 h-8 rounded-full bg-sky-100 text-sky-900 flex items-center justify-center font-bold text-xs flex-shrink-0">RS</span>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-bold text-slate-900">Shri R.K. Singla (PROJECT MANAGER)</span>
                      <span class="text-[9px] bg-sky-100 text-sky-900 font-bold px-1.5 py-0.2 rounded border border-sky-200">Multi-Project Scope</span>
                    </div>
                    <div class="text-[11px] text-slate-500">Chief Project Director (NHAI PIU) • 3 assigned corridors, contractor triage & What-If simulator</div>
                  </div>
                </button>

                <!-- 5. Site & Technical Engineer -->
                <button data-switch-role="ENGINEER" class="btn-role-opt w-full text-left p-3 rounded-lg border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 flex items-start gap-3 transition-colors">
                  <span class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-xs flex-shrink-0">NV</span>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-bold text-slate-900">Er. Neha Verma (SITE ENGINEER)</span>
                      <span class="text-[9px] bg-emerald-100 text-emerald-900 font-bold px-1.5 py-0.2 rounded border border-emerald-200">Single Project Scope</span>
                    </div>
                    <div class="text-[11px] text-slate-500">Executive Resident Engineer (Civil) • Expressway CPM milestones, technical issue logging & docs</div>
                  </div>
                </button>

                <!-- 6. Field Operations Supervisor -->
                <button data-switch-role="FIELD_WORKER" class="btn-role-opt w-full text-left p-3 rounded-lg border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 flex items-start gap-3 transition-colors">
                  <span class="w-8 h-8 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs flex-shrink-0">RG</span>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-bold text-slate-900">Shri Rajesh Gurjar (FIELD SUPERVISOR)</span>
                      <span class="text-[9px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded border border-amber-200">Site Task Scope</span>
                    </div>
                    <div class="text-[11px] text-slate-500">Senior Site Operations Supervisor • Ground telemetry, daily labor tasks & work stop alerts</div>
                  </div>
                </button>

                <!-- 7. Divisional Field Officer -->
                <button data-switch-role="FIELD_OFFICER" class="btn-role-opt w-full text-left p-3 rounded-lg border border-slate-200 hover:border-orange-400 hover:bg-orange-50/50 flex items-start gap-3 transition-colors">
                  <span class="w-8 h-8 rounded-full bg-orange-100 text-orange-900 flex items-center justify-center font-bold text-xs flex-shrink-0">SS</span>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-bold text-slate-900">Shri Sanjay Sharma (FIELD OFFICER)</span>
                      <span class="text-[9px] bg-orange-100 text-orange-900 font-bold px-1.5 py-0.2 rounded border border-orange-200">Field Project Scope</span>
                    </div>
                    <div class="text-[11px] text-slate-500">Divisional Field Operations Officer • Site inspection audit, RoW clear-cut, contractor notice dispatches</div>
                  </div>
                </button>

                <!-- 8. Central Admin & Mission Director -->
                <button data-switch-role="ADMIN" class="btn-role-opt w-full text-left p-3 rounded-lg border border-slate-200 hover:border-purple-400 hover:bg-purple-50/50 flex items-start gap-3 transition-colors">
                  <span class="w-8 h-8 rounded-full bg-purple-100 text-purple-900 flex items-center justify-center font-bold text-xs flex-shrink-0">RK</span>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-bold text-slate-900">Dr. Rajesh Kumar (ADMIN)</span>
                      <span class="text-[9px] bg-purple-100 text-purple-900 font-bold px-1.5 py-0.2 rounded border border-purple-200">System Superuser</span>
                    </div>
                    <div class="text-[11px] text-slate-500">Joint Secretary & Mission Director • Full audit, system settings, RBAC management & all views</div>
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
    const activeRole = (window.APIClient && window.APIClient.currentUser) ? window.APIClient.currentUser.role : "ADMIN";
    this.updateNavForRole(activeRole);
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
        this.updateNavForRole(role);

        // Auto-navigate to persona's primary operational flight deck
        const homeRoutes = {
          NATIONAL_LEADER: "#/dashboard",
          MINISTRY_OFFICIAL: "#/ministry",
          ANALYST: "#/analytics",
          PROJECT_MANAGER: "#/execution",
          ENGINEER: "#/engineer",
          FIELD_WORKER: "#/field",
          FIELD_OFFICER: "#/field-officer",
          ADMIN: "#/execution",
          MONITORING_OFFICER: "#/execution",
          VIEWER: "#/dashboard"
        };
        const targetHash = homeRoutes[role.toUpperCase()] || "#/dashboard";
        if (window.location.hash !== targetHash) {
          window.location.hash = targetHash;
        } else if (window.Router) {
          window.Router.renderCurrentRoute();
        }

        closeModal();
      });
    });
  },

  getNavGroups(role) {
    const r = (role || "ADMIN").toUpperCase();

    if (r === "NATIONAL_LEADER" || r === "MINISTER") {
      return [
        {
          heading: "National Command",
          items: [
            { route: "dashboard", icon: "📊", label: "National Command Center" },
            { route: "execution", icon: "⏱️", label: "National CPM Control", badge: "CPM" },
            { route: "directives", icon: "📜", label: "Directives & Escalations", badge: "Action" },
            { route: "portfolio-matrix", icon: "🎯", label: "Risk vs Outlay Matrix" },
            { route: "projects", icon: "📁", label: "Central Projects Registry" }
          ]
        },
        {
          heading: "Portfolio Surveillance",
          items: [
            { route: "early-warnings", icon: "⚠️", label: "Early Warning Radar", badge: "14k" },
            { route: "ministry", icon: "🏛️", label: "Ministry Oversight Desk" },
            { route: "analytics", icon: "📈", label: "Portfolio Analytics" },
            { route: "bottlenecks", icon: "📍", label: "Bottlenecks Intel" }
          ]
        },
        {
          heading: "Governance",
          items: [
            { route: "data-quality", icon: "🛡️", label: "Data Quality & Decoupling" },
            { route: "settings", icon: "⚙️", label: "Governance & System" }
          ]
        }
      ];
    }

    if (r === "MINISTRY_OFFICIAL" || r === "OFFICIAL") {
      return [
        {
          heading: "Ministry Command",
          items: [
            { route: "ministry", icon: "🏛️", label: "Ministry Command Center", badge: "MoRTH" },
            { route: "execution", icon: "⏱️", label: "Corridor CPM Control", badge: "CPM" },
            { route: "directives", icon: "📜", label: "Downward Directives" },
            { route: "projects", icon: "📁", label: "Ministry Projects (4,113)" }
          ]
        },
        {
          heading: "Risk & Corridor Execution",
          items: [
            { route: "my-projects", icon: "🛣️", label: "Corridor Pipeline" },
            { route: "early-warnings", icon: "⚠️", label: "Early Warning Radar", badge: "P1" },
            { route: "bottlenecks", icon: "📍", label: "Bottlenecks Intel" },
            { route: "portfolio-matrix", icon: "🎯", label: "Risk vs Outlay Matrix" }
          ]
        },
        {
          heading: "Governance & Gaps",
          items: [
            { route: "data-quality", icon: "🛡️", label: "Data Quality & Gaps" },
            { route: "settings", icon: "⚙️", label: "Ministry Settings & Audit" }
          ]
        }
      ];
    }

    if (r === "PROJECT_MANAGER" || r === "PM") {
      return [
        {
          heading: "Execution & Corridor Command",
          items: [
            { route: "execution", icon: "⏱️", label: "Execution & CPM Control", badge: "Live CPM" },
            { route: "onboarding", icon: "⚡", label: "AI Project Onboarding & WBS" },
            { route: "my-projects", icon: "🛣️", label: "My Corridors (3 Active)", badge: "Active" },
            { route: "projects", icon: "📁", label: "Corridors Registry" },
            { route: "directives", icon: "📜", label: "Directives & Action Items" }
          ]
        },
        {
          heading: "Engineering & Field Desk",
          items: [
            { route: "engineer", icon: "👷", label: "Site Engineering Station" },
            { route: "field", icon: "🚜", label: "Field Ground Tasks" },
            { route: "field-officer", icon: "🛡️", label: "Field Officer Supervisory" },
            { route: "early-warnings", icon: "⚠️", label: "Corridor Warnings Queue" },
            { route: "bottlenecks", icon: "📍", label: "Bottlenecks Intel" }
          ]
        },
        {
          heading: "Quality & Review",
          items: [
            { route: "data-quality", icon: "🛡️", label: "Data Quality Check" }
          ]
        }
      ];
    }

    if (r === "ENGINEER") {
      return [
        {
          heading: "Site Engineering Desk",
          items: [
            { route: "engineer", icon: "👷", label: "Expressway Engineering", badge: "Live" },
            { route: "execution", icon: "⏱️", label: "Execution & CPM Control", badge: "CPM" },
            { route: "projects", icon: "📁", label: "Assigned Corridor Project" },
            { route: "field", icon: "🚜", label: "Field Tasks Progress" }
          ]
        },
        {
          heading: "Compliance & Safety",
          items: [
            { route: "directives", icon: "📜", label: "Compliance Directives" },
            { route: "early-warnings", icon: "⚠️", label: "Project Early Warnings" },
            { route: "bottlenecks", icon: "📍", label: "Site Bottlenecks" }
          ]
        }
      ];
    }

    if (r === "FIELD_OFFICER" || r === "FO") {
      return [
        {
          heading: "Field Supervisory Desk",
          items: [
            { route: "field-officer", icon: "🛡️", label: "Field Officer Desk", badge: "Supervisory" },
            { route: "execution", icon: "⏱️", label: "Execution & CPM Timeline", badge: "CPM" },
            { route: "field", icon: "🚜", label: "Ground Field Tasks" },
            { route: "engineer", icon: "👷", label: "Site Engineering Station" }
          ]
        },
        {
          heading: "Clearances & Safety",
          items: [
            { route: "directives", icon: "📜", label: "Directives & Clearances" },
            { route: "early-warnings", icon: "⚠️", label: "Corridor Early Warnings" }
          ]
        }
      ];
    }

    if (r === "FIELD_WORKER" || r === "FIELD") {
      return [
        {
          heading: "Field Workstation",
          items: [
            { route: "field", icon: "🚜", label: "My Ground Tasks Desk", badge: "Today" },
            { route: "execution", icon: "⏱️", label: "CPM Execution Schedule" },
            { route: "engineer", icon: "👷", label: "Engineering Dossier" }
          ]
        },
        {
          heading: "Safety & Urgent Alerts",
          items: [
            { route: "early-warnings", icon: "⚠️", label: "Active Stoppage Alerts" }
          ]
        }
      ];
    }

    if (r === "ANALYST") {
      return [
        {
          heading: "Predictive Analytics Suite",
          items: [
            { route: "analytics", icon: "📈", label: "Portfolio Analytics", badge: "ML" },
            { route: "execution", icon: "⏱️", label: "CPM Execution Analysis", badge: "CPM" },
            { route: "dashboard", icon: "📊", label: "National Command Center" },
            { route: "portfolio-matrix", icon: "🎯", label: "Risk vs Outlay Matrix" },
            { route: "compare", icon: "⚖️", label: "Peer Benchmarking" }
          ]
        },
        {
          heading: "Data Integrity & Risk",
          items: [
            { route: "data-quality", icon: "🛡️", label: "Data Quality Observatory" },
            { route: "early-warnings", icon: "⚠️", label: "Early Warning Radar" },
            { route: "bottlenecks", icon: "📍", label: "Bottlenecks Intel" },
            { route: "projects", icon: "📁", label: "Projects Registry" }
          ]
        }
      ];
    }

    // Default / ADMIN / MONITORING_OFFICER: Full access
    return [
      {
        heading: "Command & Portfolios",
        items: [
          { route: "dashboard", icon: "📊", label: "National Command Center" },
          { route: "execution", icon: "⏱️", label: "Execution & CPM Control", badge: "Live CPM" },
          { route: "onboarding", icon: "⚡", label: "AI Project Onboarding & WBS", badge: "AI" },
          { route: "ministry", icon: "🏛️", label: "Ministry Command Center" },
          { route: "my-projects", icon: "🛣️", label: "Corridors Workspace" },
          { route: "engineer", icon: "👷", label: "Site Engineering" },
          { route: "field-officer", icon: "🛡️", label: "Field Officer Desk" },
          { route: "field", icon: "🚜", label: "Field Operations" },
          { route: "portfolio-matrix", icon: "🎯", label: "Risk vs Outlay Matrix" },
          { route: "projects", icon: "📁", label: "Projects Registry" }
        ]
      },
      {
        heading: "Intelligence Suite",
        items: [
          { route: "early-warnings", icon: "⚠️", label: "Early Warning Radar", badge: "14k" },
          { route: "bottlenecks", icon: "📍", label: "Bottlenecks Intel" },
          { route: "analytics", icon: "📈", label: "Portfolio Analytics" },
          { route: "compare", icon: "⚖️", label: "Peer Benchmarking" }
        ]
      },
      {
        heading: "Governance & Directives",
        items: [
          { route: "directives", icon: "📜", label: "National Directives" },
          { route: "data-quality", icon: "🛡️", label: "Data Quality & Gaps" },
          { route: "settings", icon: "⚙️", label: "System & Governance" }
        ]
      }
    ];
  },

  renderSidebarNav(role) {
    const container = document.getElementById("sidebar-nav-container");
    if (!container) return;
    const groups = this.getNavGroups(role);

    container.innerHTML = groups.map(grp => `
      <div>
        <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1.5 sidebar-heading">
          ${grp.heading}
        </div>
        <div class="space-y-0.5">
          ${grp.items.map(it => `
            <a href="#/${it.route}" data-route="${it.route}" class="nav-item flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-slate-700 hover:bg-slate-100">
              <span class="text-base">${it.icon}</span>
              <span class="sidebar-text">${it.label}</span>
              ${it.badge ? `<span class="ml-auto text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded-full sidebar-badge">${it.badge}</span>` : ''}
            </a>
          `).join("")}
        </div>
      </div>
    `).join("");

    const currentHash = (window.location.hash || "#/dashboard").replace("#/", "").split("?")[0];
    this.updateActiveNav(currentHash);
  },

  renderMobileNav(role) {
    const container = document.getElementById("mobile-drawer-nav-container");
    if (!container) return;
    const groups = this.getNavGroups(role);

    container.innerHTML = groups.flatMap(grp => grp.items).map(it => `
      <a href="#/${it.route}" class="mobile-nav-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100">
        <span>${it.icon}</span> ${it.label}
      </a>
    `).join("");

    const backdrop = document.getElementById("mobile-drawer-backdrop");
    const drawer = document.getElementById("mobile-drawer");
    document.querySelectorAll(".mobile-nav-link").forEach(link => {
      link.addEventListener("click", () => {
        if (drawer && backdrop) {
          drawer.classList.add("-translate-x-full");
          backdrop.classList.add("hidden");
        }
      });
    });
  },

  updateNavForRole(role) {
    this.renderSidebarNav(role);
    this.renderMobileNav(role);
  },

  updateActiveNav(activeRoute) {
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach(item => {
      const route = item.dataset.route;
      if (route === activeRoute || (activeRoute && activeRoute.startsWith("projects") && route === "projects")) {
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
        "settings": "System & Governance",
        "ministry": "Ministry Command Center (MoRTH)",
        "my-projects": "Corridors Project Manager Workspace",
        "engineer": "Site & Technical Engineering Station",
        "field": "Field Operations & Ground Station",
        "directives": "National Directives & Escalations"
      };

      if (activeRoute && activeRoute.startsWith("projects/")) {
        breadcrumbPage.innerText = "Project Dossier";
      } else {
        breadcrumbPage.innerText = routeMap[activeRoute] || "National Command Center";
      }
    }
  }
};

window.AppShell = AppShell;
