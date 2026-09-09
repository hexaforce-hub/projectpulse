// ==========================================================================
// PROJECTPULSE / ASTRA — Universal Projects Explorer (Phase 9.5 Overhaul)
// Route: #/projects
// Ministry of Statistics & Programme Implementation (MoSPI) - IPMD / PAIMANA
// Smart India Hackathon 2026 — Team HexaForce
// ==========================================================================

const ProjectsView = {
  searchQuery: "",
  selectedMinistry: "all",
  selectedRisk: "all",
  selectedBottleneck: "all",
  selectedState: "all",
  selectedSector: "all",
  selectedCostTier: "all",
  showAdvancedFilters: false,
  currentPage: 1,
  pageSize: 15,
  totalRecords: 0,
  totalPages: 1,
  isLoading: false,
  items: [],
  debounceTimer: null,

  render() {
    return `
      <div class="max-w-[1440px] mx-auto space-y-6">
        
        <!-- Executive Header with Breadcrumbs & Export -->
        <div class="border-b border-slate-200 pb-4">
          <div class="mb-2">
            ${CommonUI.renderBreadcrumbs([
              { label: "Portfolio", href: "#/projects" },
              { label: "Central Projects Registry", href: "#/projects" }
            ])}
          </div>
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-[11px] font-bold uppercase tracking-wider text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                  PAIMANA National Registry
                </span>
                <span class="text-slate-300">•</span>
                <span class="text-caption text-slate-500 font-medium">Surveillance Desk</span>
              </div>
              <h1 class="text-2xl font-bold text-slate-900 tracking-tight mt-1">Central Sector Projects Explorer</h1>
              <p class="text-caption text-slate-500 mt-0.5">
                Universal search, multi-attribute filtering, and real-time risk surveillance across 10,000 infrastructure projects (&gt; ₹150 Cr).
              </p>
            </div>
            <div class="flex items-center gap-3">
              <span id="projects-total-count-badge" class="text-caption text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg font-medium">
                Active Universe: <strong id="projects-count-display" class="text-slate-900 font-bold tabular-nums">10,000</strong> Projects
              </span>
              <button onclick="ProjectsView.exportCSV()" class="btn btn-secondary btn-sm flex items-center gap-1.5" title="Export current filtered view as CSV">
                <span>📥</span>
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Filter Deck: Progressive Disclosure -->
        <div class="gov-card p-4 space-y-3">
          
          <!-- Primary Filter Bar (Always visible) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
            
            <!-- Search -->
            <div class="lg:col-span-4 relative">
              <label for="project-search-input" class="sr-only">Search projects</label>
              <input type="text" id="project-search-input" 
                     placeholder="Search project name, code (e.g. PRJ-), or agency..."
                     value="${this.escapeHtml(this.searchQuery)}"
                     class="gov-input pl-9 text-xs" />
              <span class="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
              ${this.searchQuery ? `
                <button onclick="ProjectsView.clearSearch()" class="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs">✕</button>
              ` : ''}
            </div>

            <!-- Ministry Filter -->
            <div class="lg:col-span-3">
              <label for="filter-ministry-select" class="sr-only">Filter Ministry</label>
              <select id="filter-ministry-select" class="gov-select text-xs">
                <option value="all">All Ministries (National)</option>
                <option value="Ministry of Road Transport and Highways">Road Transport & Highways</option>
                <option value="Ministry of Railways">Railways</option>
                <option value="Ministry of Power">Power & Energy</option>
                <option value="Ministry of Petroleum and Natural Gas">Petroleum & Natural Gas</option>
                <option value="Ministry of Housing and Urban Affairs">Housing & Urban Affairs</option>
                <option value="Ministry of Shipping">Ports, Shipping & Waterways</option>
                <option value="Ministry of Coal">Coal</option>
                <option value="Ministry of Civil Aviation">Civil Aviation</option>
              </select>
            </div>

            <!-- Risk Tier Filter -->
            <div class="lg:col-span-2">
              <label for="filter-risk-select" class="sr-only">Filter Risk</label>
              <select id="filter-risk-select" class="gov-select text-xs">
                <option value="all">All Risk Tiers</option>
                <option value="CRITICAL">🔴 Critical Risk (80-100)</option>
                <option value="HIGH">🟠 High Risk (60-79)</option>
                <option value="MODERATE">🟡 Moderate Watch (40-59)</option>
                <option value="LOW">🟢 Low Risk / On Track (0-39)</option>
              </select>
            </div>

            <!-- Advanced Filters Toggle & Reset -->
            <div class="lg:col-span-3 flex items-center justify-end gap-2">
              <button id="btn-toggle-advanced" onclick="ProjectsView.toggleAdvancedFilters()" 
                      class="btn btn-secondary btn-sm flex items-center gap-1.5 text-xs">
                <span>⚙️</span>
                <span id="adv-filter-label">More Filters</span>
                <span id="adv-filter-count" class="hidden px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">0</span>
              </button>
              <button id="btn-clear-filters" onclick="ProjectsView.clearAllFilters()" class="btn btn-secondary btn-sm text-xs">
                Reset
              </button>
            </div>

          </div>

          <!-- Advanced Filters Panel (Progressive Disclosure) -->
          <div id="advanced-filters-panel" class="${this.showAdvancedFilters ? 'block' : 'hidden'} pt-3 mt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50/70 p-3 rounded-lg">
            
            <!-- State Filter -->
            <div>
              <label for="filter-state-select" class="block text-[11px] font-semibold text-slate-600 mb-1">State / UT</label>
              <select id="filter-state-select" class="gov-select text-xs">
                <option value="all">All States & UTs</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Bihar">Bihar</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="West Bengal">West Bengal</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Odisha">Odisha</option>
                <option value="Assam">Assam</option>
              </select>
            </div>

            <!-- Bottleneck Filter -->
            <div>
              <label for="filter-bottleneck-select" class="block text-[11px] font-semibold text-slate-600 mb-1">Observed Bottleneck</label>
              <select id="filter-bottleneck-select" class="gov-select text-xs">
                <option value="all">All Bottleneck Types</option>
                <option value="land_acquisition">Land Acquisition & RoW</option>
                <option value="clearance_impasse">Regulatory / Forest Clearance</option>
                <option value="contractor_failure">Contractor Cashflow Stress</option>
                <option value="financial_decoupling">Financial Decoupling Gap (&gt;15%)</option>
                <option value="utility_shifting">Utility & Rail Crossing Shifting</option>
                <option value="monsoonal_impact">Monsoon & Geological Impediment</option>
              </select>
            </div>

            <!-- Sector Filter -->
            <div>
              <label for="filter-sector-select" class="block text-[11px] font-semibold text-slate-600 mb-1">Infrastructure Sector</label>
              <select id="filter-sector-select" class="gov-select text-xs">
                <option value="all">All Infrastructure Sectors</option>
                <option value="Roads and Highways">Roads & Highways</option>
                <option value="Railways">Railways</option>
                <option value="Power">Power & Renewable Energy</option>
                <option value="Petroleum">Petroleum & Pipelines</option>
                <option value="Urban Development">Urban Development & Metro</option>
                <option value="Shipping and Ports">Shipping & Inland Ports</option>
                <option value="Coal">Coal & Mining</option>
                <option value="Civil Aviation">Civil Aviation & Airports</option>
              </select>
            </div>

            <!-- Outlay Bracket Filter -->
            <div>
              <label for="filter-cost-select" class="block text-[11px] font-semibold text-slate-600 mb-1">Capital Outlay Tier</label>
              <select id="filter-cost-select" class="gov-select text-xs">
                <option value="all">All Project Sizes (&gt; ₹150 Cr)</option>
                <option value="mega">Mega Projects (&gt; ₹5,000 Cr)</option>
                <option value="major">Major Projects (₹1,000 – ₹5,000 Cr)</option>
                <option value="standard">Standard Projects (₹150 – ₹1,000 Cr)</option>
              </select>
            </div>

          </div>

          <!-- Dynamic Active Filter Chips Bar -->
          <div id="filter-chips-wrapper">
            <!-- Filter chips rendered dynamically here -->
          </div>

        </div>

        <!-- Table Container -->
        <div id="projects-table-card" class="gov-card p-0 overflow-hidden shadow-sm">
          <div class="gov-table-container border-0 rounded-none shadow-none">
            <table class="gov-table">
              <thead>
                <tr>
                  <th style="min-width: 260px;">Project Identification</th>
                  <th style="min-width: 170px;">Ministry & Location</th>
                  <th style="min-width: 150px;">Approved / Revised Outlay</th>
                  <th style="min-width: 180px;">Physical vs Financial</th>
                  <th style="min-width: 130px;">Risk Profile</th>
                  <th style="min-width: 200px;">Primary Root Driver</th>
                  <th class="text-right" style="min-width: 130px;">Surveillance</th>
                </tr>
              </thead>
              <tbody id="projects-table-tbody">
                <tr>
                  <td colspan="7" class="p-12 text-center text-slate-400 text-xs">
                    <div class="inline-block animate-spin text-xl mb-2">⏳</div>
                    <div>Loading Central Sector Projects Universe...</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Government Pagination Bar -->
          <div class="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-caption">
            <div class="text-slate-600 text-xs flex items-center gap-1.5">
              <span>Showing</span>
              <strong id="pagination-start-record" class="font-semibold text-slate-900 tabular-nums">1</strong>
              <span>to</span>
              <strong id="pagination-end-record" class="font-semibold text-slate-900 tabular-nums">15</strong>
              <span>of</span>
              <strong id="total-records-display" class="font-semibold text-slate-900 tabular-nums">10,000</strong>
              <span class="text-slate-400">•</span>
              <span class="text-slate-500">Page <span id="current-page-display" class="font-semibold text-slate-900 font-mono">1</span> of <span id="total-pages-display" class="font-mono">...</span></span>
            </div>
            <div class="flex items-center gap-2">
              <button id="btn-prev-page" class="btn btn-secondary btn-sm" disabled>
                ← Previous
              </button>
              <div id="page-jump-container" class="flex items-center gap-1 text-xs text-slate-500">
                <span>Go to:</span>
                <input type="number" id="page-jump-input" min="1" max="1" value="1" 
                       class="w-12 h-7 text-center rounded border border-slate-300 text-xs" />
              </div>
              <button id="btn-next-page" class="btn btn-secondary btn-sm">
                Next →
              </button>
            </div>
          </div>
        </div>

      </div>
    `;
  },

  escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  async postRender() {
    this.readHashParams();
    this.bindControls();
    await this.fetchAndRenderProjects();
  },

  readHashParams() {
    const hash = window.location.hash || "";
    if (hash.includes("?")) {
      const qStr = hash.split("?")[1];
      const params = new URLSearchParams(qStr);
      if (params.get("bottleneck")) this.selectedBottleneck = params.get("bottleneck");
      if (params.get("risk_tier")) this.selectedRisk = params.get("risk_tier");
      if (params.get("risk_level")) this.selectedRisk = params.get("risk_level");
      if (params.get("ministry")) this.selectedMinistry = params.get("ministry");
      if (params.get("state")) this.selectedState = params.get("state");
      if (params.get("sector")) this.selectedSector = params.get("sector");
      if (params.get("cost_tier")) this.selectedCostTier = params.get("cost_tier");
      if (params.get("search")) this.searchQuery = params.get("search");

      if (this.selectedBottleneck !== "all" || this.selectedState !== "all" || this.selectedSector !== "all" || this.selectedCostTier !== "all") {
        this.showAdvancedFilters = true;
      }
    }
  },

  bindControls() {
    const searchInput = document.getElementById("project-search-input");
    const minSelect = document.getElementById("filter-ministry-select");
    const riskSelect = document.getElementById("filter-risk-select");
    const bnSelect = document.getElementById("filter-bottleneck-select");
    const stateSelect = document.getElementById("filter-state-select");
    const sectorSelect = document.getElementById("filter-sector-select");
    const costSelect = document.getElementById("filter-cost-select");
    const prevBtn = document.getElementById("btn-prev-page");
    const nextBtn = document.getElementById("btn-next-page");
    const pageJumpInput = document.getElementById("page-jump-input");

    if (minSelect) minSelect.value = this.selectedMinistry;
    if (riskSelect) riskSelect.value = this.selectedRisk;
    if (bnSelect) bnSelect.value = this.selectedBottleneck;
    if (stateSelect) stateSelect.value = this.selectedState;
    if (sectorSelect) sectorSelect.value = this.selectedSector;
    if (costSelect) costSelect.value = this.selectedCostTier;

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
          this.searchQuery = e.target.value.trim();
          this.currentPage = 1;
          this.fetchAndRenderProjects();
        }, 300);
      });
    }

    if (minSelect) {
      minSelect.addEventListener("change", (e) => {
        this.selectedMinistry = e.target.value;
        this.currentPage = 1;
        this.fetchAndRenderProjects();
      });
    }

    if (riskSelect) {
      riskSelect.addEventListener("change", (e) => {
        this.selectedRisk = e.target.value;
        this.currentPage = 1;
        this.fetchAndRenderProjects();
      });
    }

    if (bnSelect) {
      bnSelect.addEventListener("change", (e) => {
        this.selectedBottleneck = e.target.value;
        this.currentPage = 1;
        this.fetchAndRenderProjects();
      });
    }

    if (stateSelect) {
      stateSelect.addEventListener("change", (e) => {
        this.selectedState = e.target.value;
        this.currentPage = 1;
        this.fetchAndRenderProjects();
      });
    }

    if (sectorSelect) {
      sectorSelect.addEventListener("change", (e) => {
        this.selectedSector = e.target.value;
        this.currentPage = 1;
        this.fetchAndRenderProjects();
      });
    }

    if (costSelect) {
      costSelect.addEventListener("change", (e) => {
        this.selectedCostTier = e.target.value;
        this.currentPage = 1;
        this.fetchAndRenderProjects();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.fetchAndRenderProjects();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (this.currentPage < this.totalPages) {
          this.currentPage++;
          this.fetchAndRenderProjects();
        }
      });
    }

    if (pageJumpInput) {
      pageJumpInput.addEventListener("change", (e) => {
        const val = parseInt(e.target.value, 10);
        if (val >= 1 && val <= this.totalPages) {
          this.currentPage = val;
          this.fetchAndRenderProjects();
        } else {
          pageJumpInput.value = this.currentPage;
        }
      });
    }
  },

  toggleAdvancedFilters() {
    this.showAdvancedFilters = !this.showAdvancedFilters;
    const panel = document.getElementById("advanced-filters-panel");
    const label = document.getElementById("adv-filter-label");
    if (panel) {
      if (this.showAdvancedFilters) {
        panel.classList.remove("hidden");
        if (label) label.innerText = "Fewer Filters";
      } else {
        panel.classList.add("hidden");
        if (label) label.innerText = "More Filters";
      }
    }
  },

  clearSearch() {
    this.searchQuery = "";
    const input = document.getElementById("project-search-input");
    if (input) input.value = "";
    this.currentPage = 1;
    this.fetchAndRenderProjects();
  },

  removeFilter(key) {
    if (key === "search") {
      this.searchQuery = "";
      const el = document.getElementById("project-search-input");
      if (el) el.value = "";
    } else if (key === "ministry") {
      this.selectedMinistry = "all";
      const el = document.getElementById("filter-ministry-select");
      if (el) el.value = "all";
    } else if (key === "risk") {
      this.selectedRisk = "all";
      const el = document.getElementById("filter-risk-select");
      if (el) el.value = "all";
    } else if (key === "bottleneck") {
      this.selectedBottleneck = "all";
      const el = document.getElementById("filter-bottleneck-select");
      if (el) el.value = "all";
    } else if (key === "state") {
      this.selectedState = "all";
      const el = document.getElementById("filter-state-select");
      if (el) el.value = "all";
    } else if (key === "sector") {
      this.selectedSector = "all";
      const el = document.getElementById("filter-sector-select");
      if (el) el.value = "all";
    } else if (key === "cost_tier") {
      this.selectedCostTier = "all";
      const el = document.getElementById("filter-cost-select");
      if (el) el.value = "all";
    }
    this.currentPage = 1;
    this.fetchAndRenderProjects();
  },

  clearAllFilters() {
    this.searchQuery = "";
    this.selectedMinistry = "all";
    this.selectedRisk = "all";
    this.selectedBottleneck = "all";
    this.selectedState = "all";
    this.selectedSector = "all";
    this.selectedCostTier = "all";
    this.currentPage = 1;

    const searchInput = document.getElementById("project-search-input");
    const minSelect = document.getElementById("filter-ministry-select");
    const riskSelect = document.getElementById("filter-risk-select");
    const bnSelect = document.getElementById("filter-bottleneck-select");
    const stateSelect = document.getElementById("filter-state-select");
    const sectorSelect = document.getElementById("filter-sector-select");
    const costSelect = document.getElementById("filter-cost-select");

    if (searchInput) searchInput.value = "";
    if (minSelect) minSelect.value = "all";
    if (riskSelect) riskSelect.value = "all";
    if (bnSelect) bnSelect.value = "all";
    if (stateSelect) stateSelect.value = "all";
    if (sectorSelect) sectorSelect.value = "all";
    if (costSelect) costSelect.value = "all";

    this.fetchAndRenderProjects();
  },

  updateFilterChips() {
    const chipsWrapper = document.getElementById("filter-chips-wrapper");
    if (!chipsWrapper) return;

    const chips = [];
    if (this.searchQuery) {
      chips.push({ key: "search", label: "Query", value: `"${this.searchQuery}"` });
    }
    if (this.selectedMinistry !== "all") {
      chips.push({ key: "ministry", label: "Ministry", value: this.selectedMinistry });
    }
    if (this.selectedRisk !== "all") {
      chips.push({ key: "risk", label: "Risk Tier", value: this.selectedRisk });
    }
    if (this.selectedBottleneck !== "all") {
      chips.push({ key: "bottleneck", label: "Bottleneck", value: this.selectedBottleneck.replace(/_/g, " ") });
    }
    if (this.selectedState !== "all") {
      chips.push({ key: "state", label: "State", value: this.selectedState });
    }
    if (this.selectedSector !== "all") {
      chips.push({ key: "sector", label: "Sector", value: this.selectedSector });
    }
    if (this.selectedCostTier !== "all") {
      const tierMap = { mega: "> ₹5,000 Cr", major: "₹1,000–5,000 Cr", standard: "₹150–1,000 Cr" };
      chips.push({ key: "cost_tier", label: "Size Tier", value: tierMap[this.selectedCostTier] || this.selectedCostTier });
    }

    const countBadge = document.getElementById("adv-filter-count");
    let advCount = 0;
    if (this.selectedState !== "all") advCount++;
    if (this.selectedBottleneck !== "all") advCount++;
    if (this.selectedSector !== "all") advCount++;
    if (this.selectedCostTier !== "all") advCount++;

    if (countBadge) {
      if (advCount > 0) {
        countBadge.innerText = advCount;
        countBadge.classList.remove("hidden");
      } else {
        countBadge.classList.add("hidden");
      }
    }

    if (chips.length > 0) {
      chipsWrapper.innerHTML = CommonUI.renderFilterChips(chips, "ProjectsView.removeFilter", "ProjectsView.clearAllFilters");
    } else {
      chipsWrapper.innerHTML = `
        <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Displaying full portfolio universe without constraints.</span>
          <span class="text-[11px] text-slate-400 font-mono">10,000 active projects indexed</span>
        </div>
      `;
    }
  },

  async fetchAndRenderProjects() {
    this.updateFilterChips();
    const tbody = document.getElementById("projects-table-tbody");
    if (!tbody) return;

    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="p-12 text-center text-slate-400 text-xs">
          <div class="inline-block animate-spin text-xl mb-2">⏳</div>
          <div class="font-medium text-slate-600">Querying Central Projects Database...</div>
          <div class="text-[11px] text-slate-400 mt-1">Filtering across 10,000 records</div>
        </td>
      </tr>
    `;

    const params = {
      page: this.currentPage,
      page_size: this.pageSize,
      sort_by: "overall_risk_score",
      sort_order: "desc"
    };
    if (this.searchQuery) params.search = this.searchQuery;
    if (this.selectedMinistry !== "all") params.ministry = this.selectedMinistry;
    if (this.selectedRisk !== "all") params.risk_tier = this.selectedRisk;
    if (this.selectedBottleneck !== "all") params.bottleneck = this.selectedBottleneck;
    if (this.selectedState !== "all") params.state = this.selectedState;
    if (this.selectedSector !== "all") params.sector = this.selectedSector;

    let res = null;
    if (window.APIClient) {
      res = await window.APIClient.getProjects(params);
    }

    if (!res || !res.items || res.items.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="p-12 text-center text-slate-500 text-xs">
            <div class="text-2xl mb-2">🔍</div>
            <div class="font-bold text-slate-800 text-sm">No infrastructure projects match the selected criteria</div>
            <p class="text-slate-400 text-xs max-w-md mx-auto mt-1 mb-4">
              We couldn't find any projects matching your active combination of ministry, risk tier, bottleneck, and search parameters.
            </p>
            <button onclick="ProjectsView.clearAllFilters()" class="btn btn-primary btn-sm text-xs">
              Clear All Filters
            </button>
          </td>
        </tr>
      `;
      this.updatePaginationUI(0, 1);
      return;
    }

    // Apply client-side cost tier filter if selected
    let filteredItems = res.items;
    if (this.selectedCostTier !== "all") {
      filteredItems = filteredItems.filter(p => {
        const cost = (p.financials ? p.financials.revised_cost_cr : 0) || p.cost_cr || 0;
        if (this.selectedCostTier === "mega") return cost >= 5000;
        if (this.selectedCostTier === "major") return cost >= 1000 && cost < 5000;
        if (this.selectedCostTier === "standard") return cost < 1000;
        return true;
      });
    }

    this.items = filteredItems;
    this.totalRecords = res.total_records || res.items.length;
    this.totalPages = res.total_pages || Math.ceil(this.totalRecords / this.pageSize) || 1;

    const countDisplay = document.getElementById("projects-count-display");
    if (countDisplay) countDisplay.innerText = Number(this.totalRecords).toLocaleString("en-IN");

    tbody.innerHTML = this.items.map(p => {
      const origCost = p.financials ? p.financials.original_cost_cr : (p.original_cost_cr || 0);
      const revCost = p.financials ? p.financials.revised_cost_cr : (p.cost_cr || 0);
      const costOverrunCr = revCost > origCost ? revCost - origCost : 0;
      const costOverrunPct = origCost > 0 ? Math.round((costOverrunCr / origCost) * 100) : 0;

      const physProg = p.progress ? p.progress.physical_progress_pct : (p.physical_progress || 0);
      const finProg = p.progress ? p.progress.financial_progress_pct : (p.financial_progress || 0);
      const gap = p.progress ? p.progress.progress_gap_pct : Math.max(0, finProg - physProg);
      const riskLevel = p.risk ? p.risk.level : (p.target_risk_class || "LOW");
      const riskScore = p.risk ? p.risk.overall_score : (p.overall_risk_score || 45);

      const driver = p.primary_bottleneck 
        ? p.primary_bottleneck.replace(/_/g, " ") 
        : (p.risk && p.risk.primary_driver ? p.risk.primary_driver : "Scheduled Milestones Pending");

      return `
        <tr class="hover:bg-slate-50/80 transition cursor-pointer" onclick="ProjectsView.handleRowClick(event, '${p.project_id}')">
          <td>
            <div class="font-bold text-slate-900 text-xs line-clamp-1 hover:text-blue-700">
              <a href="#/projects/${p.project_id}" class="hover:underline" onclick="event.stopPropagation()">
                ${this.escapeHtml(p.project_name)}
              </a>
            </div>
            <div class="flex items-center gap-1.5 mt-1">
              <span class="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded uppercase font-semibold">
                ${p.project_id}
              </span>
              <span class="text-slate-300">•</span>
              <span class="text-[11px] text-slate-500 font-medium truncate max-w-[140px]">
                ${p.implementing_agency || 'MoSPI Desk'}
              </span>
            </div>
          </td>
          <td>
            <div class="text-slate-800 text-xs font-medium line-clamp-1">${p.ministry || 'Central Sector'}</div>
            <div class="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
              <span>📍</span>
              <span class="truncate">${p.state || 'National / Multi-State'}</span>
            </div>
          </td>
          <td>
            <div class="text-slate-900 font-bold tabular-nums text-xs">
              ₹${Number(revCost).toLocaleString("en-IN")} Cr
            </div>
            <div class="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
              <span>Orig: ₹${Number(origCost).toLocaleString("en-IN")} Cr</span>
              ${costOverrunPct > 0 ? `
                <span class="px-1 rounded bg-rose-50 text-rose-700 font-bold border border-rose-200">
                  +${costOverrunPct}%
                </span>
              ` : ''}
            </div>
          </td>
          <td>
            <div class="flex justify-between text-[11px] font-semibold mb-1">
              <span class="text-blue-950">Phys: <strong class="text-blue-800 tabular-nums">${physProg}%</strong></span>
              <span class="text-slate-500 font-mono text-[10px] tabular-nums">Fin: ${finProg}%</span>
            </div>
            ${CommonUI.renderProgressBar(physProg, "bg-blue-700")}
            ${gap > 15 ? `
              <div class="mt-1 flex items-center gap-1">
                <span class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300" 
                      title="Expenditure exceeds physical progress by ${gap}% (Financial Decoupling)">
                  ⚠️ Gap: +${gap}%
                </span>
              </div>
            ` : ''}
          </td>
          <td>
            ${CommonUI.renderRiskBadge(riskLevel, riskScore)}
          </td>
          <td>
            <div class="text-xs text-slate-700 line-clamp-2 max-w-[210px] font-medium leading-relaxed">
              ${this.escapeHtml(driver)}
            </div>
          </td>
          <td class="text-right">
            <div class="flex items-center justify-end gap-1" onclick="event.stopPropagation()">
              <button onclick="ProjectsView.openQuickDrawer('${p.project_id}')" 
                      class="px-2 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded shadow-xs transition"
                      title="Quick inspection slide-over drawer">
                Quick View
              </button>
              <a href="#/projects/${p.project_id}" 
                 class="p-1 text-slate-400 hover:text-blue-700 rounded transition text-xs font-bold" 
                 title="Open full Project Intelligence Dossier">
                →
              </a>
            </div>
          </td>
        </tr>
      `;
    }).join("");

    this.updatePaginationUI(this.totalRecords, this.totalPages);
  },

  handleRowClick(e, projectId) {
    // If user didn't click an anchor or button directly, open quick inspection drawer
    if (e.target.tagName !== "A" && e.target.tagName !== "BUTTON") {
      this.openQuickDrawer(projectId);
    }
  },

  async openQuickDrawer(projectId) {
    let p = this.items.find(item => item.project_id === projectId);
    if (!p && window.APIClient) {
      p = await window.APIClient.getProject(projectId);
    }
    if (!p) return;

    const origCost = p.financials ? p.financials.original_cost_cr : (p.original_cost_cr || 0);
    const revCost = p.financials ? p.financials.revised_cost_cr : (p.cost_cr || 0);
    const costOverrunCr = revCost > origCost ? revCost - origCost : 0;
    const physProg = p.progress ? p.progress.physical_progress_pct : (p.physical_progress || 0);
    const finProg = p.progress ? p.progress.financial_progress_pct : (p.financial_progress || 0);
    const riskLevel = p.risk ? p.risk.level : (p.target_risk_class || "LOW");
    const riskScore = p.risk ? p.risk.overall_score : (p.overall_risk_score || 45);

    const health = {
      schedule: riskLevel === "CRITICAL" ? "CRITICAL" : (riskLevel === "HIGH" ? "RISK" : "WATCH"),
      scheduleText: p.delay_months ? `+${p.delay_months} mos drift` : "On Target",
      financial: costOverrunCr > 0 ? "WATCH" : "HEALTHY",
      financialText: costOverrunCr > 0 ? `+₹${costOverrunCr} Cr Overrun` : "Within Budget",
      progress: (finProg - physProg > 15) ? "RISK" : "HEALTHY",
      progressText: `${physProg}% Physical`,
      execution: "WATCH",
      executionText: "Milestones Active",
      data: "HEALTHY",
      dataText: "Verified QA"
    };

    const drawerContent = `
      <div class="space-y-4 text-xs">
        
        <!-- Metadata Header -->
        <div class="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200">
              ${p.project_id}
            </span>
            ${CommonUI.renderStatusBadge(p.status || "ACTIVE")}
          </div>
          <h4 class="font-bold text-slate-900 text-sm leading-snug">${this.escapeHtml(p.project_name)}</h4>
          <div class="text-[11px] text-slate-600 flex flex-wrap gap-x-3 gap-y-1">
            <span><strong>Ministry:</strong> ${p.ministry}</span>
            <span><strong>Agency:</strong> ${p.implementing_agency || 'MoSPI'}</span>
            <span><strong>Location:</strong> ${p.state || 'National'}</span>
          </div>
        </div>

        <!-- 5-Pillar Health Strip -->
        <div>
          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">5-Pillar Executive Health Strip</div>
          ${CommonUI.renderHealthStrip(health)}
        </div>

        <!-- Metric Grid -->
        <div class="grid grid-cols-2 gap-2.5">
          <div class="p-3 bg-white border border-slate-200 rounded-lg">
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Revised Outlay</div>
            <div class="text-base font-bold text-slate-900 tabular-nums mt-0.5">₹${Number(revCost).toLocaleString("en-IN")} Cr</div>
            <div class="text-[10px] text-slate-400">Orig: ₹${Number(origCost).toLocaleString("en-IN")} Cr</div>
          </div>
          <div class="p-3 bg-white border border-slate-200 rounded-lg">
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Physical Progress</div>
            <div class="text-base font-bold text-blue-700 tabular-nums mt-0.5">${physProg}%</div>
            <div class="text-[10px] text-slate-400">Expenditure: ${finProg}%</div>
          </div>
          <div class="p-3 bg-white border border-slate-200 rounded-lg">
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Composite Risk</div>
            <div class="mt-1">
              ${CommonUI.renderRiskBadge(riskLevel, riskScore)}
            </div>
          </div>
          <div class="p-3 bg-white border border-slate-200 rounded-lg">
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Primary Driver</div>
            <div class="text-xs font-semibold text-slate-800 truncate mt-1">
              ${p.primary_bottleneck ? p.primary_bottleneck.replace(/_/g, ' ') : (p.risk ? p.risk.primary_driver : 'Execution Drift')}
            </div>
          </div>
        </div>

        <!-- Why this project needs attention -->
        <div class="p-3.5 bg-amber-50/70 border border-amber-200 rounded-lg space-y-1.5">
          <div class="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
            <span>⚠️</span>
            <span>Surveillance Alert Diagnosis</span>
          </div>
          <p class="text-[11px] text-amber-800 leading-relaxed">
            ${p.executive_summary || `Project demonstrates critical path slippage due to ${p.primary_bottleneck ? p.primary_bottleneck.replace(/_/g, ' ') : 'delayed land clearance'}. Current financial decoupling gap is ${finProg - physProg}%. Requires inter-ministerial coordination.`}
          </p>
        </div>

        <!-- Primary Actions -->
        <div class="pt-2 border-t border-slate-200 flex flex-col gap-2">
          <a href="#/projects/${p.project_id}" onclick="CommonUI.closeDrawer()" 
             class="btn btn-primary w-full justify-center text-xs py-2">
            Open Full Project Intelligence Dossier →
          </a>
          <button onclick="ProjectsView.triggerQuickDirective('${p.project_id}')" 
                  class="btn btn-secondary w-full justify-center text-xs py-2">
            Issue Secretarial Directive
          </button>
        </div>

      </div>
    `;

    CommonUI.openDrawer(`Project Quick Inspection: ${p.project_id}`, drawerContent);
  },

  triggerQuickDirective(projectId) {
    CommonUI.closeDrawer();
    window.location.hash = `#/directives?project_id=${projectId}&action=new`;
  },

  updatePaginationUI(total, totalPages) {
    const curDisplay = document.getElementById("current-page-display");
    const totalDisplay = document.getElementById("total-pages-display");
    const totalRecDisplay = document.getElementById("total-records-display");
    const startRec = document.getElementById("pagination-start-record");
    const endRec = document.getElementById("pagination-end-record");
    const prevBtn = document.getElementById("btn-prev-page");
    const nextBtn = document.getElementById("btn-next-page");
    const pageJumpInput = document.getElementById("page-jump-input");

    const start = total > 0 ? (this.currentPage - 1) * this.pageSize + 1 : 0;
    const end = Math.min(this.currentPage * this.pageSize, total);

    if (curDisplay) curDisplay.innerText = this.currentPage;
    if (totalDisplay) totalDisplay.innerText = totalPages;
    if (totalRecDisplay) totalRecDisplay.innerText = Number(total).toLocaleString("en-IN");
    if (startRec) startRec.innerText = Number(start).toLocaleString("en-IN");
    if (endRec) endRec.innerText = Number(end).toLocaleString("en-IN");

    if (prevBtn) prevBtn.disabled = this.currentPage <= 1;
    if (nextBtn) nextBtn.disabled = this.currentPage >= totalPages;

    if (pageJumpInput) {
      pageJumpInput.value = this.currentPage;
      pageJumpInput.max = totalPages;
    }
  },

  exportCSV() {
    if (!this.items || this.items.length === 0) {
      alert("No data available to export.");
      return;
    }

    const headers = ["Project ID", "Project Name", "Ministry", "Agency", "State", "Revised Cost (Cr)", "Original Cost (Cr)", "Physical Progress (%)", "Financial Progress (%)", "Risk Level", "Risk Score", "Primary Bottleneck"];
    const rows = this.items.map(p => [
      p.project_id,
      `"${(p.project_name || '').replace(/"/g, '""')}"`,
      `"${(p.ministry || '').replace(/"/g, '""')}"`,
      `"${(p.implementing_agency || '').replace(/"/g, '""')}"`,
      `"${(p.state || '').replace(/"/g, '""')}"`,
      p.financials ? p.financials.revised_cost_cr : (p.cost_cr || 0),
      p.financials ? p.financials.original_cost_cr : (p.original_cost_cr || 0),
      p.progress ? p.progress.physical_progress_pct : (p.physical_progress || 0),
      p.progress ? p.progress.financial_progress_pct : (p.financial_progress || 0),
      p.risk ? p.risk.level : (p.target_risk_class || "LOW"),
      p.risk ? p.risk.overall_score : (p.overall_risk_score || 50),
      `"${(p.primary_bottleneck || (p.risk ? p.risk.primary_driver : '')).replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ASTRA_Projects_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

window.ProjectsView = ProjectsView;

