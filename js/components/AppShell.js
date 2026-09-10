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
              <button id="btn-collapse-sidebar" class="text-slate-400 hover:text-slate-700 p-1.5 rounded-md text-xs hover:bg-slate-100 transition-colors cursor-pointer" title="Toggle Sidebar">
                <i data-lucide="chevrons-left" class="w-4 h-4"></i>
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

                  <a href="#/reports" data-route="reports" class="nav-item flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-blue-900 bg-blue-50/60 hover:bg-blue-100/60 border border-blue-200/50">
                    <span class="text-base">📑</span>
                    <span class="sidebar-text">Report Intelligence</span>
                    <span class="ml-auto text-[9px] bg-blue-700 text-white font-bold px-1.5 py-0.5 rounded-full">FLASH</span>
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
              
              <!-- Left: Mobile Hamburger & Dynamic Breadcrumbs -->
              <div class="flex items-center gap-3 min-w-0">
                <button id="btn-mobile-menu" class="md:hidden p-2 rounded-md text-slate-600 hover:bg-slate-100 text-lg flex-shrink-0" aria-label="Open Navigation Menu">
                  ☰
                </button>
                <div id="header-breadcrumb-container" class="min-w-0">
                  <nav class="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto whitespace-nowrap" aria-label="Breadcrumb">
                    <a href="#/dashboard" class="text-slate-500 hover:text-blue-700 font-medium">ASTRA</a>
                    <span class="text-slate-300">/</span>
                    <span id="header-breadcrumb-page" class="font-bold text-slate-900 truncate">National Command Center</span>
                  </nav>
                </div>

                <!-- Official ASTRA Institutional Header Badge -->
                <div class="hidden xl:flex items-center gap-2 pl-3 border-l border-slate-200 flex-shrink-0">
                  <img src="assets/astra_logo.png" alt="ASTRA" class="w-6 h-6 object-contain rounded" />
                  <div class="leading-none text-left">
                    <span class="text-[10px] font-extrabold text-slate-900 tracking-wider block">ASTRA</span>
                    <span class="text-[8px] text-slate-400 font-medium block">MoSPI • IPMD</span>
                  </div>
                </div>
              </div>

              <!-- Center: Quick Jump / Global Multi-Category Search Input -->
              <div class="hidden md:flex items-center mx-3 flex-1 max-w-md justify-center">
                <button id="btn-trigger-palette" class="flex items-center gap-2.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-lg text-xs text-slate-500 transition-colors w-full justify-between shadow-2xs">
                  <span class="flex items-center gap-2 truncate">
                    <i data-lucide="search" class="w-3.5 h-3.5 text-slate-400"></i>
                    <span class="truncate">Search project, ministry, agency, state...</span>
                  </span>
                  <kbd class="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-white border border-slate-300 rounded text-slate-600 shadow-2xs flex-shrink-0">Ctrl K</kbd>
                </button>
              </div>

              <!-- Right: Snapshot Selector, Attention Bell & Officer Profile -->
              <div class="flex items-center gap-2 sm:gap-3 text-caption flex-shrink-0">
                
                <!-- Snapshot Selector -->
                <div class="hidden sm:flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs shadow-2xs" title="Official PAIMANA Baseline Snapshot">
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Snapshot:</span>
                  <select id="global-snapshot-selector" onchange="window.AppShell.onGlobalSnapshotChange(this.value)" class="bg-transparent text-xs font-bold text-blue-900 focus:outline-none cursor-pointer">
                    <option value="2026-07">July 2026</option>
                    <option value="2026-06">June 2026</option>
                    <option value="2026-05">May 2026</option>
                    <option value="2026-04">April 2026</option>
                  </select>
                </div>

                <!-- Live Backend Engine Status Indicator -->
                <div id="backend-status-indicator"></div>

                <!-- Early Warnings Attention Dropdown -->
                <div class="relative">
                  <button id="btn-attention-center" onclick="window.AppShell.toggleAttentionDropdown()" class="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer" title="Attention Required Queue">
                    <i data-lucide="bell" class="w-4 h-4 text-slate-600"></i>
                    <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600 ring-2 ring-white"></span>
                  </button>
                  <div id="attention-dropdown-menu" class="hidden absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-3 space-y-2">
                    <div class="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span class="text-xs font-bold text-slate-900 uppercase tracking-wide">Attention Required</span>
                      <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700">14 Active</span>
                    </div>
                    <div class="space-y-1.5 text-xs max-h-60 overflow-y-auto">
                      <a href="#/projects/PRJ-SYN-000002" class="block p-2 rounded-lg bg-rose-50/60 hover:bg-rose-100/60 border border-rose-200/60">
                        <div class="flex items-center justify-between">
                          <span class="font-bold text-slate-900 truncate">Varanasi-Ranchi-Kolkata PKG-3</span>
                          <span class="text-[9px] font-extrabold text-rose-700">CRITICAL</span>
                        </div>
                        <div class="text-[11px] text-slate-600 mt-0.5">Physical progress stalled at Ganga Pier Foundation</div>
                      </a>
                      <a href="#/projects/PRJ-SYN-000003" class="block p-2 rounded-lg bg-amber-50/60 hover:bg-amber-100/60 border border-amber-200/60">
                        <div class="flex items-center justify-between">
                          <span class="font-bold text-slate-900 truncate">Delhi-Mumbai Expressway Spur</span>
                          <span class="text-[9px] font-extrabold text-amber-700">HIGH</span>
                        </div>
                        <div class="text-[11px] text-slate-600 mt-0.5">Stage-II Forest Clearance pending in MP section</div>
                      </a>
                      <a href="#/projects/PRJ-SYN-000001" class="block p-2 rounded-lg bg-amber-50/60 hover:bg-amber-100/60 border border-amber-200/60">
                        <div class="flex items-center justify-between">
                          <span class="font-bold text-slate-900 truncate">Secunderabad-Mahabubnagar Doubling</span>
                          <span class="text-[9px] font-extrabold text-amber-700">HIGH</span>
                        </div>
                        <div class="text-[11px] text-slate-600 mt-0.5">Contractor liquidity crunch; 4 mos slippage</div>
                      </a>
                    </div>
                    <div class="pt-2 border-t border-slate-100 text-center">
                      <a href="#/early-warnings" onclick="window.AppShell.toggleAttentionDropdown()" class="text-xs font-bold text-blue-700 hover:text-blue-900">View All 14 Early Warnings →</a>
                    </div>
                  </div>
                </div>

                <!-- User Profile & Quick Demo Role Switcher -->
                <div class="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <button id="btn-open-role-switcher" class="flex items-center gap-2 text-left p-1 rounded-lg hover:bg-slate-100 transition-colors group cursor-pointer" title="Click to switch demo role (Admin, Minister, Official, PM, Engineer)">
                    <div id="header-user-avatar" class="w-8 h-8 rounded-full bg-blue-800 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      PS
                    </div>
                    <div class="hidden md:block leading-tight">
                      <div id="header-user-name" class="text-xs font-bold text-slate-900 group-hover:text-blue-800">Smt. Priya Sharma</div>
                      <div class="flex items-center gap-1.5 mt-0.5">
                        <span id="header-user-role" class="text-[10px] text-slate-500">Director IPMD</span>
                        <span id="header-user-badge" class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">OFFICER</span>
                      </div>
                    </div>
                    <span class="text-[10px] text-slate-400 group-hover:text-slate-700 ml-0.5">▾</span>
                  </button>

                  <!-- Sovereign Sign Out Button -->
                  <button id="btn-header-signout" onclick="window.APIClient.logout()" class="ml-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs" title="Sign Out of ASTRA Platform">
                    <i data-lucide="log-out" class="w-3.5 h-3.5 text-rose-600"></i>
                    <span class="hidden lg:inline">Sign Out</span>
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
                <button id="btn-modal-logout" onclick="window.APIClient.logout()" class="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer">
                  <span>🚪</span>
                  <span>Sign Out Session</span>
                </button>
                <button id="btn-cancel-role-switcher" class="text-slate-600 hover:text-slate-900 font-medium cursor-pointer">Cancel</button>
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
          collapseBtn.innerHTML = '<i data-lucide="chevrons-right" class="w-4 h-4"></i>';
        } else {
          sidebar.style.width = "var(--sidebar-width)";
          sidebar.querySelectorAll(".sidebar-text, .sidebar-heading, .sidebar-badge, .sidebar-text-brand").forEach(el => el.classList.remove("hidden"));
          collapseBtn.innerHTML = '<i data-lucide="chevrons-left" class="w-4 h-4"></i>';
        }
        if (window.CommonUI && window.CommonUI.initIcons) window.CommonUI.initIcons();
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

    // Multi-Category Search on Typing (Section 9)
    if (paletteInput) {
      paletteInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase().trim();
        const resultsContainer = document.getElementById("palette-results-list");
        if (!resultsContainer) return;

        if (!query) {
          // Restore default list
          resultsContainer.innerHTML = `
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2.5 py-1">Quick Navigation & Workspaces</div>
            <a href="#/dashboard" class="palette-item flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-100 text-slate-700">
              <span class="flex items-center gap-2"><span>📊</span> <span>National Command Center</span></span>
              <span class="text-[10px] text-slate-400">#/dashboard</span>
            </a>
            <a href="#/projects" class="palette-item flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-100 text-slate-700">
              <span class="flex items-center gap-2"><span>📁</span> <span>Projects Explorer</span></span>
              <span class="text-[10px] text-slate-400">#/projects</span>
            </a>
            <a href="#/reports" class="palette-item flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-100 text-slate-700">
              <span class="flex items-center gap-2"><span>📑</span> <span>Report Intelligence Center</span></span>
              <span class="text-[10px] text-slate-400">#/reports</span>
            </a>
            <a href="#/early-warnings" class="palette-item flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-100 text-slate-700">
              <span class="flex items-center gap-2"><span>⚠️</span> <span>Early Warning Radar</span></span>
              <span class="text-[10px] text-slate-400">#/early-warnings</span>
            </a>
            <a href="#/execution" class="palette-item flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-100 text-slate-700">
              <span class="flex items-center gap-2"><span>⏱️</span> <span>Execution Control (CPM)</span></span>
              <span class="text-[10px] text-slate-400">#/execution</span>
            </a>
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2.5 pt-2 pb-1">Primary Indexed Corridors</div>
            <a href="#/projects/PRJ-SYN-000002" class="palette-item flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-100 text-slate-700">
              <span class="flex items-center gap-2"><span>🛣️</span> <span>Varanasi-Ranchi-Kolkata Expressway (PKG-3)</span></span>
              <span class="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1 rounded">PRJ-SYN-000002</span>
            </a>
            <a href="#/projects/PRJ-SYN-000003" class="palette-item flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-100 text-slate-700">
              <span class="flex items-center gap-2"><span>🛣️</span> <span>Delhi-Mumbai Expressway Spur (MoRTH)</span></span>
              <span class="text-[10px] font-mono text-blue-700 bg-blue-50 px-1 rounded">PRJ-SYN-000003</span>
            </a>
          `;
          resultsContainer.querySelectorAll(".palette-item").forEach(it => it.addEventListener("click", closePalette));
          return;
        }

        const allProjects = window.MOCK_PROJECTS || [];
        const matchedProjects = allProjects.filter(p => 
          (p.project_name && p.project_name.toLowerCase().includes(query)) || 
          (p.project_id && p.project_id.toLowerCase().includes(query)) ||
          (p.implementing_agency && p.implementing_agency.toLowerCase().includes(query))
        ).slice(0, 5);

        const ministries = [
          "Ministry of Road Transport and Highways", "Ministry of Railways", "Ministry of Power", 
          "Ministry of Petroleum and Natural Gas", "Ministry of Housing and Urban Affairs", 
          "Ministry of Shipping", "Ministry of Coal", "Ministry of Civil Aviation"
        ];
        const matchedMinistries = ministries.filter(m => m.toLowerCase().includes(query)).slice(0, 3);

        const states = [
          "Uttar Pradesh", "Maharashtra", "Bihar", "Rajasthan", "Madhya Pradesh", 
          "Gujarat", "Tamil Nadu", "West Bengal", "Odisha", "Assam"
        ];
        const matchedStates = states.filter(s => s.toLowerCase().includes(query)).slice(0, 3);

        let html = "";
        if (matchedProjects.length > 0) {
          html += `<div class="text-[10px] font-bold text-blue-800 uppercase tracking-wider px-2.5 pt-1 pb-1">Projects</div>`;
          html += matchedProjects.map(p => `
            <a href="#/projects/${p.project_id}" class="palette-item flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-blue-50/70 border border-transparent hover:border-blue-200 text-slate-800 text-xs transition">
              <div class="truncate max-w-[340px]">
                <div class="font-bold text-slate-900">${p.project_name}</div>
                <div class="text-[10px] text-slate-400 font-mono mt-0.5">${p.project_id} • ${p.sector} • ${p.state}</div>
              </div>
              <span class="text-[10px] font-bold ${p.risk && p.risk.level === 'CRITICAL' ? 'text-rose-700 bg-rose-50' : 'text-amber-700 bg-amber-50'} px-1.5 py-0.5 rounded border border-slate-200 flex-shrink-0">${p.risk ? p.risk.level : 'HIGH'}</span>
            </a>
          `).join("");
        }

        if (matchedMinistries.length > 0) {
          html += `<div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2.5 pt-2 pb-1">Ministries</div>`;
          html += matchedMinistries.map(m => `
            <a href="#/projects?ministry=${encodeURIComponent(m)}" class="palette-item flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700 text-xs">
              <span class="font-medium">${m}</span>
              <span class="text-[10px] text-slate-400">View Ministry Projects →</span>
            </a>
          `).join("");
        }

        if (matchedStates.length > 0) {
          html += `<div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2.5 pt-2 pb-1">States</div>`;
          html += matchedStates.map(s => `
            <a href="#/projects?state=${encodeURIComponent(s)}" class="palette-item flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700 text-xs">
              <span class="font-medium">${s}</span>
              <span class="text-[10px] text-slate-400">View State Projects →</span>
            </a>
          `).join("");
        }

        if (!html) {
          html = `<div class="p-6 text-center text-slate-400 text-xs">No projects, ministries, or tools matching "${query}".</div>`;
        }

        resultsContainer.innerHTML = html;
        resultsContainer.querySelectorAll(".palette-item").forEach(it => it.addEventListener("click", closePalette));
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

  // Toggle Attention Dropdown
  toggleAttentionDropdown() {
    const dd = document.getElementById("attention-dropdown-menu");
    if (dd) dd.classList.toggle("hidden");
  },

  // Global Snapshot Switcher
  onGlobalSnapshotChange(snapshot) {
    window.ASTRA_SELECTED_SNAPSHOT = snapshot;
    if (window.ReportIntelligenceView && window.ReportIntelligenceView.onSnapshotChange) {
      window.ReportIntelligenceView.onSnapshotChange(snapshot);
    }
    if (window.APIClient && window.APIClient.showToast) {
      window.APIClient.showToast(`Active Snapshot set to ${snapshot} (PAIMANA Archive)`, "info");
    }
  },

  // Dynamic Breadcrumbs updater
  updateBreadcrumbs(crumbs = []) {
    const container = document.getElementById("header-breadcrumb-container");
    if (container && window.CommonUI && window.CommonUI.renderBreadcrumbs) {
      container.innerHTML = window.CommonUI.renderBreadcrumbs(crumbs);
    }
  },

  getNavGroups(role) {
    const r = (role || "ADMIN").toUpperCase();

    if (r === "NATIONAL_LEADER" || r === "MINISTER") {
      return [
        {
          heading: "COMMAND CENTER",
          items: [
            { route: "dashboard", lucide: "layout-dashboard", icon: "📊", label: "National Command Center" }
          ]
        },
        {
          heading: "PORTFOLIO",
          items: [
            { route: "projects", lucide: "folder-kanban", icon: "📁", label: "Central Projects Registry" },
            { route: "reports", lucide: "file-text", icon: "📑", label: "Report Intelligence", badge: "PAIMANA" }
          ]
        },
        {
          heading: "INTELLIGENCE",
          items: [
            { route: "portfolio-matrix", lucide: "pie-chart", icon: "🎯", label: "Risk Stratification" },
            { route: "early-warnings", lucide: "alert-triangle", icon: "⚠️", label: "Early Warning Radar", badge: "14k" },
            { route: "bottlenecks", lucide: "map-pin", icon: "📍", label: "Bottlenecks Intel" },
            { route: "analytics", lucide: "trending-up", icon: "📈", label: "Portfolio Analytics" }
          ]
        },
        {
          heading: "DECISIONS",
          items: [
            { route: "directives", lucide: "file-signature", icon: "📜", label: "Directives & Escalations" },
            { route: "what-if", lucide: "zap", icon: "⚡", label: "What-If Sandbox" }
          ]
        },
        {
          heading: "GOVERNANCE",
          items: [
            { route: "data-quality", lucide: "shield-check", icon: "🛡️", label: "Data Quality Observatory" },
            { route: "settings", lucide: "settings", icon: "⚙️", label: "Governance & Audit" }
          ]
        }
      ];
    }

    if (r === "MINISTRY_OFFICIAL" || r === "OFFICIAL") {
      return [
        {
          heading: "COMMAND CENTER",
          items: [
            { route: "ministry", lucide: "landmark", icon: "🏛️", label: "Ministry Command Desk", badge: "MoRTH" }
          ]
        },
        {
          heading: "PORTFOLIO",
          items: [
            { route: "projects", lucide: "folder-kanban", icon: "📁", label: "Ministry Projects (4,113)" },
            { route: "reports", lucide: "file-text", icon: "📑", label: "Report Intelligence", badge: "PAIMANA" }
          ]
        },
        {
          heading: "INTELLIGENCE",
          items: [
            { route: "early-warnings", lucide: "alert-triangle", icon: "⚠️", label: "Early Warning Radar", badge: "P1" },
            { route: "bottlenecks", lucide: "map-pin", icon: "📍", label: "Bottlenecks Intel" },
            { route: "portfolio-matrix", lucide: "pie-chart", icon: "🎯", label: "Risk Stratification" }
          ]
        },
        {
          heading: "EXECUTION",
          items: [
            { route: "execution", lucide: "clock", icon: "⏱️", label: "Corridor CPM Control", badge: "CPM" },
            { route: "my-projects", lucide: "milestone", icon: "🛣️", label: "Corridor Pipeline" }
          ]
        },
        {
          heading: "DECISIONS & GOVERNANCE",
          items: [
            { route: "directives", lucide: "file-signature", icon: "📜", label: "Downward Directives" },
            { route: "data-quality", lucide: "shield-check", icon: "🛡️", label: "Data Quality & Gaps" },
            { route: "settings", lucide: "settings", icon: "⚙️", label: "Settings & Audit" }
          ]
        }
      ];
    }

    if (r === "PROJECT_MANAGER" || r === "PM") {
      return [
        {
          heading: "EXECUTION CONTROL",
          items: [
            { route: "execution", lucide: "clock", icon: "⏱️", label: "Execution & CPM Control", badge: "Live CPM" },
            { route: "onboarding", lucide: "sparkles", icon: "⚡", label: "AI Onboarding & WBS" },
            { route: "my-projects", lucide: "milestone", icon: "🛣️", label: "My Corridors (3 Active)" }
          ]
        },
        {
          heading: "OPERATIONS",
          items: [
            { route: "projects", lucide: "folder-kanban", icon: "📁", label: "Corridor Projects" },
            { route: "early-warnings", lucide: "alert-triangle", icon: "⚠️", label: "Corridor Alerts Queue" },
            { route: "directives", lucide: "file-signature", icon: "📜", label: "Directives & Actions" }
          ]
        },
        {
          heading: "DECISIONS",
          items: [
            { route: "what-if", lucide: "zap", icon: "⚡", label: "What-If Simulator" },
            { route: "data-quality", lucide: "shield-check", icon: "🛡️", label: "Data Quality Check" }
          ]
        }
      ];
    }

    if (r === "ENGINEER") {
      return [
        {
          heading: "TECHNICAL WORKSPACE",
          items: [
            { route: "engineer", lucide: "hard-hat", icon: "👷", label: "Site Engineering Desk", badge: "Live" },
            { route: "execution", lucide: "clock", icon: "⏱️", label: "CPM Work Packages", badge: "CPM" },
            { route: "projects", lucide: "folder-kanban", icon: "📁", label: "Assigned Corridor" }
          ]
        },
        {
          heading: "OPERATIONS & SAFETY",
          items: [
            { route: "field", lucide: "truck", icon: "🚜", label: "Field Progress Log" },
            { route: "early-warnings", lucide: "alert-triangle", icon: "⚠️", label: "Project Early Warnings" },
            { route: "directives", lucide: "file-signature", icon: "📜", label: "Compliance Directives" }
          ]
        }
      ];
    }

    if (r === "FIELD_WORKER" || r === "FIELD") {
      return [
        {
          heading: "TODAY'S TARGETS",
          items: [
            { route: "field", lucide: "truck", icon: "🚜", label: "My Ground Targets", badge: "Today" },
            { route: "engineer", lucide: "hard-hat", icon: "👷", label: "Resident Engineer Desk" }
          ]
        },
        {
          heading: "ALERTS",
          items: [
            { route: "early-warnings", lucide: "alert-triangle", icon: "⚠️", label: "Active Stoppage Alerts" }
          ]
        }
      ];
    }

    if (r === "FIELD_OFFICER" || r === "FO") {
      return [
        {
          heading: "FIELD OPERATIONS",
          items: [
            { route: "field-officer", lucide: "clipboard-check", icon: "🛡️", label: "Field Inspection Desk", badge: "Field" },
            { route: "field", lucide: "truck", icon: "🚜", label: "Ground Telemetry & Crew" },
            { route: "engineer", lucide: "hard-hat", icon: "⚙️", label: "Site Technical Desk" }
          ]
        },
        {
          heading: "OPERATIONS & ALERTS",
          items: [
            { route: "execution", lucide: "clock", icon: "⏱️", label: "Work Packages & WBS", badge: "CPM" },
            { route: "early-warnings", lucide: "alert-triangle", icon: "⚠️", label: "Site Risk Alerts" }
          ]
        }
      ];
    }

    if (r === "ANALYST") {
      return [
        {
          heading: "COMMAND CENTER",
          items: [
            { route: "dashboard", lucide: "layout-dashboard", icon: "📊", label: "National Command Center" }
          ]
        },
        {
          heading: "PORTFOLIO",
          items: [
            { route: "projects", lucide: "folder-kanban", icon: "📁", label: "Projects Explorer" },
            { route: "reports", lucide: "file-text", icon: "📑", label: "Report Intelligence", badge: "Flash" }
          ]
        },
        {
          heading: "INTELLIGENCE",
          items: [
            { route: "analytics", lucide: "trending-up", icon: "📈", label: "Portfolio Analytics", badge: "ML" },
            { route: "portfolio-matrix", lucide: "pie-chart", icon: "🎯", label: "Risk Stratification" },
            { route: "compare", lucide: "scale", icon: "⚖️", label: "Peer Benchmarking" },
            { route: "early-warnings", lucide: "alert-triangle", icon: "⚠️", label: "Early Warning Radar" },
            { route: "bottlenecks", lucide: "map-pin", icon: "📍", label: "Bottlenecks Intel" }
          ]
        },
        {
          heading: "GOVERNANCE",
          items: [
            { route: "data-quality", lucide: "shield-check", icon: "🛡️", label: "Data Quality Observatory" },
            { route: "settings", lucide: "settings", icon: "⚙️", label: "Model Registry & Audit" }
          ]
        }
      ];
    }

    // Default / ADMIN / MONITORING_OFFICER: 6 Canonical Sections
    return [
      {
        heading: "COMMAND CENTER",
        items: [
          { route: "dashboard", lucide: "layout-dashboard", icon: "📊", label: "Command Center" }
        ]
      },
      {
        heading: "PORTFOLIO",
        items: [
          { route: "projects", lucide: "folder-kanban", icon: "📁", label: "Projects Explorer" },
          { route: "reports", lucide: "file-text", icon: "📑", label: "Report Center", badge: "PAIMANA" }
        ]
      },
      {
        heading: "INTELLIGENCE",
        items: [
          { route: "portfolio-matrix", lucide: "pie-chart", icon: "🎯", label: "Risk Stratification" },
          { route: "early-warnings", lucide: "alert-triangle", icon: "⚠️", label: "Early Warnings", badge: "14k" },
          { route: "bottlenecks", lucide: "map-pin", icon: "📍", label: "Bottlenecks & RoW" },
          { route: "analytics", lucide: "trending-up", icon: "📈", label: "Portfolio Analytics" },
          { route: "compare", lucide: "scale", icon: "⚖️", label: "Peer Benchmarking" }
        ]
      },
      {
        heading: "EXECUTION",
        items: [
          { route: "execution", lucide: "clock", icon: "⏱️", label: "Execution (CPM)", badge: "Live" },
          { route: "onboarding", lucide: "sparkles", icon: "⚡", label: "Onboarding & WBS" },
          { route: "engineer", lucide: "hard-hat", icon: "👷", label: "Site Engineering" },
          { route: "field-officer", lucide: "clipboard-check", icon: "🛡️", label: "Field Officer Desk" },
          { route: "field", lucide: "truck", icon: "🚜", label: "Field Operations" }
        ]
      },
      {
        heading: "DECISIONS",
        items: [
          { route: "directives", lucide: "file-signature", icon: "📜", label: "Directives & Actions" },
          { route: "what-if", lucide: "zap", icon: "⚡", label: "What-If Sandbox" },
          { route: "ministry", lucide: "landmark", icon: "🏛️", label: "Ministry Desk" },
          { route: "my-projects", lucide: "milestone", icon: "🛣️", label: "Corridors Workspace" }
        ]
      },
      {
        heading: "GOVERNANCE",
        items: [
          { route: "data-quality", lucide: "shield-check", icon: "🛡️", label: "Data Quality" },
          { route: "settings", lucide: "settings", icon: "⚙️", label: "Audit & Settings" }
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
            <a href="#/${it.route}" data-route="${it.route}" class="nav-item group flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-slate-600 hover:text-slate-900 hover:bg-slate-100" title="${it.label}">
              <span class="w-5 h-5 flex items-center justify-center flex-shrink-0 text-slate-400 group-hover:text-blue-700">
                ${it.lucide ? `<i data-lucide="${it.lucide}" class="w-4 h-4"></i>` : `<span class="text-sm">${it.icon}</span>`}
              </span>
              <span class="sidebar-text truncate">${it.label}</span>
              ${it.badge ? `<span class="ml-auto text-[9px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded-full sidebar-badge flex-shrink-0">${it.badge}</span>` : ''}
            </a>
          `).join("")}
        </div>
      </div>
    `).join("");

    const currentHash = (window.location.hash || "#/dashboard").replace("#/", "").split("?")[0];
    this.updateActiveNav(currentHash);
    if (window.CommonUI && window.CommonUI.initIcons) window.CommonUI.initIcons();
  },

  renderMobileNav(role) {
    const container = document.getElementById("mobile-drawer-nav-container");
    if (!container) return;
    const groups = this.getNavGroups(role);

    container.innerHTML = groups.flatMap(grp => grp.items).map(it => `
      <a href="#/${it.route}" class="mobile-nav-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100">
        <span class="w-5 h-5 flex items-center justify-center text-slate-500">
          ${it.lucide ? `<i data-lucide="${it.lucide}" class="w-4 h-4"></i>` : it.icon}
        </span>
        <span>${it.label}</span>
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
    if (window.CommonUI && window.CommonUI.initIcons) window.CommonUI.initIcons();
  },

  updateNavForRole(role) {
    this.renderSidebarNav(role);
    this.renderMobileNav(role);
  },

  updateActiveNav(activeRoute) {
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach(item => {
      const route = item.dataset.route;
      const iconSpan = item.querySelector(".w-5");
      if (route === activeRoute || (activeRoute && activeRoute.startsWith("projects") && route === "projects")) {
        item.classList.add("bg-blue-50", "text-blue-900", "font-bold");
        item.classList.remove("text-slate-600", "font-medium");
        if (iconSpan) {
          iconSpan.classList.add("text-blue-700");
          iconSpan.classList.remove("text-slate-400");
        }
      } else {
        item.classList.remove("bg-blue-50", "text-blue-900", "font-bold");
        item.classList.add("text-slate-600", "font-medium");
        if (iconSpan) {
          iconSpan.classList.remove("text-blue-700");
          iconSpan.classList.add("text-slate-400");
        }
      }
    });

    // Update Breadcrumb text
    const breadcrumbPage = document.getElementById("header-breadcrumb-page");
    if (breadcrumbPage) {
      const routeMap = {
        "dashboard": "National Command Center",
        "portfolio-matrix": "Risk Stratification",
        "projects": "Projects Explorer",
        "reports": "Report Intelligence Center (PAIMANA Flash Reports)",
        "early-warnings": "Early Warning Radar",
        "bottlenecks": "Bottlenecks & Clearances",
        "analytics": "Portfolio Analytics",
        "compare": "Peer Benchmarking",
        "data-quality": "Data Quality Observatory",
        "settings": "System & Governance",
        "ministry": "Ministry Command Desk (MoRTH)",
        "my-projects": "Corridors Workspace",
        "engineer": "Site Engineering Station",
        "field": "Field Ground Operations",
        "directives": "Directives & Escalations",
        "execution": "Execution & CPM Control",
        "onboarding": "Project Onboarding & WBS",
        "field-officer": "Field Officer Desk",
        "what-if": "What-If Scenario Sandbox"
      };

      if (activeRoute && activeRoute.startsWith("projects/")) {
        const pId = decodeURIComponent(activeRoute.replace("projects/", ""));
        this.updateBreadcrumbs([
          { label: "Projects Explorer", href: "#/projects" },
          { label: pId }
        ]);
      } else {
        const title = routeMap[activeRoute] || "National Command Center";
        breadcrumbPage.innerText = title;
        this.updateBreadcrumbs([
          { label: title }
        ]);
      }
    }
  }
};

window.AppShell = AppShell;
