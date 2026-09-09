// ==========================================================================
// PROJECTPULSE — Projects Registry Component (Phase 9)
// Route: /projects
// Ministry of Statistics & Programme Implementation (MoSPI) - IPMD / PAIMANA
// Smart India Hackathon 2026 — Team HexaForce
// ==========================================================================

const ProjectsView = {
  searchQuery: "",
  selectedMinistry: "all",
  selectedRisk: "all",
  selectedSector: "all",
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
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-[11px] font-bold uppercase tracking-wider text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                National Database
              </span>
              <span class="text-caption text-slate-400">•</span>
              <span class="text-caption text-slate-500 font-medium">PAIMANA Central Sector Catalog</span>
            </div>
            <h1 class="text-page-title mt-1">Central Projects Registry</h1>
            <p class="text-caption text-slate-500 mt-0.5">
              Comprehensive catalog of 10,000 Central Sector Infrastructure Projects ($>$ ₹150 Cr) with multi-attribute filtering
            </p>
          </div>
          <div class="flex items-center gap-2">
            <span id="projects-total-count-badge" class="text-caption text-slate-500">
              Showing <strong id="projects-count-display" class="text-slate-900 font-semibold tabular-nums">10,000</strong> Projects
            </span>
          </div>
        </div>

        <!-- Filter Row -->
        <div class="gov-card p-4 space-y-3">
          <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            
            <!-- Search -->
            <div class="sm:col-span-4 relative">
              <label for="project-search-input" class="sr-only">Search project</label>
              <input type="text" id="project-search-input" 
                     placeholder="Search project name, ID, or agency..."
                     value="${this.searchQuery}"
                     class="gov-input pl-9" />
              <span class="absolute left-3 top-2.5 text-slate-400 text-sm">🔍</span>
            </div>

            <!-- Ministry Filter -->
            <div class="sm:col-span-3">
              <label for="filter-ministry-select" class="sr-only">Filter Ministry</label>
              <select id="filter-ministry-select" class="gov-select">
                <option value="all">All Central Ministries</option>
                <option value="Ministry of Road Transport and Highways">Road Transport & Highways</option>
                <option value="Ministry of Railways">Railways</option>
                <option value="Ministry of Power">Power</option>
                <option value="Ministry of Petroleum and Natural Gas">Petroleum & Natural Gas</option>
                <option value="Ministry of Housing and Urban Affairs">Housing & Urban Affairs</option>
                <option value="Ministry of Shipping">Ports, Shipping & Waterways</option>
                <option value="Ministry of Coal">Coal</option>
                <option value="Ministry of Civil Aviation">Civil Aviation</option>
              </select>
            </div>

            <!-- Risk Filter -->
            <div class="sm:col-span-3">
              <label for="filter-risk-select" class="sr-only">Filter Risk</label>
              <select id="filter-risk-select" class="gov-select">
                <option value="all">All Risk Levels</option>
                <option value="CRITICAL">Critical Risk (Immediate Review)</option>
                <option value="HIGH">High Risk (Elevated Friction)</option>
                <option value="MODERATE">Moderate Risk</option>
                <option value="LOW">Low Risk</option>
              </select>
            </div>

            <!-- Clear Action -->
            <div class="sm:col-span-2 flex justify-end">
              <button id="btn-clear-filters" class="btn btn-secondary btn-sm w-full sm:w-auto">
                Clear Filters
              </button>
            </div>

          </div>

          <!-- Active Filter Summary Chips -->
          <div id="filter-chips-container" class="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <span class="font-medium">Active Filters:</span>
            <span id="chip-search" class="hidden px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200"></span>
            <span id="chip-ministry" class="hidden px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200"></span>
            <span id="chip-risk" class="hidden px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200"></span>
            <span id="chip-none" class="text-slate-400 italic">None (Displaying full portfolio)</span>
          </div>
        </div>

        <!-- Table Container -->
        <div id="projects-table-card" class="gov-card p-0 overflow-hidden">
          <div class="gov-table-container border-0 rounded-none shadow-none">
            <table class="gov-table">
              <thead>
                <tr>
                  <th style="min-width: 280px;">Project Identification</th>
                  <th>Ministry / Implementing Agency</th>
                  <th style="min-width: 140px;">Approved / Revised Cost</th>
                  <th style="min-width: 150px;">Physical vs Financial</th>
                  <th>Risk Assessment</th>
                  <th>Primary Observed Driver</th>
                  <th class="text-right">Action</th>
                </tr>
              </thead>
              <tbody id="projects-table-tbody">
                <tr>
                  <td colspan="7" class="p-8 text-center text-slate-400 text-xs">
                    Loading Central Sector Projects...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination Bar -->
          <div class="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-caption">
            <div class="text-slate-500 text-xs">
              Page <strong id="current-page-display" class="text-slate-900 font-semibold font-mono">1</strong> of <span id="total-pages-display" class="font-mono">...</span>
              <span class="text-slate-400 mx-1">•</span>
              <span id="pagination-records-info">15 projects per page</span>
            </div>
            <div class="flex items-center gap-2">
              <button id="btn-prev-page" class="btn btn-secondary btn-sm" disabled>
                ← Previous
              </button>
              <button id="btn-next-page" class="btn btn-secondary btn-sm">
                Next →
              </button>
            </div>
          </div>
        </div>

      </div>
    `;
  },

  async postRender() {
    this.bindControls();
    await this.fetchAndRenderProjects();
  },

  bindControls() {
    const searchInput = document.getElementById("project-search-input");
    const minSelect = document.getElementById("filter-ministry-select");
    const riskSelect = document.getElementById("filter-risk-select");
    const clearBtn = document.getElementById("btn-clear-filters");
    const prevBtn = document.getElementById("btn-prev-page");
    const nextBtn = document.getElementById("btn-next-page");

    if (minSelect) minSelect.value = this.selectedMinistry;
    if (riskSelect) riskSelect.value = this.selectedRisk;

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

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        this.searchQuery = "";
        this.selectedMinistry = "all";
        this.selectedRisk = "all";
        this.currentPage = 1;
        if (searchInput) searchInput.value = "";
        if (minSelect) minSelect.value = "all";
        if (riskSelect) riskSelect.value = "all";
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
  },

  updateFilterChips() {
    const chipSearch = document.getElementById("chip-search");
    const chipMinistry = document.getElementById("chip-ministry");
    const chipRisk = document.getElementById("chip-risk");
    const chipNone = document.getElementById("chip-none");

    let activeCount = 0;
    if (this.searchQuery) {
      if (chipSearch) { chipSearch.innerText = `Search: "${this.searchQuery}"`; chipSearch.classList.remove("hidden"); }
      activeCount++;
    } else if (chipSearch) {
      chipSearch.classList.add("hidden");
    }

    if (this.selectedMinistry !== "all") {
      if (chipMinistry) { chipMinistry.innerText = `Ministry: ${this.selectedMinistry}`; chipMinistry.classList.remove("hidden"); }
      activeCount++;
    } else if (chipMinistry) {
      chipMinistry.classList.add("hidden");
    }

    if (this.selectedRisk !== "all") {
      if (chipRisk) { chipRisk.innerText = `Risk Tier: ${this.selectedRisk}`; chipRisk.classList.remove("hidden"); }
      activeCount++;
    } else if (chipRisk) {
      chipRisk.classList.add("hidden");
    }

    if (chipNone) {
      if (activeCount === 0) chipNone.classList.remove("hidden");
      else chipNone.classList.add("hidden");
    }
  },

  async fetchAndRenderProjects() {
    this.updateFilterChips();
    const tbody = document.getElementById("projects-table-tbody");
    if (!tbody) return;

    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="p-8 text-center text-slate-400 text-xs">
          <div class="inline-block animate-spin text-base mb-2">⏳</div>
          <div>Loading Central Sector Projects...</div>
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
    if (this.selectedRisk !== "all") params.risk_level = this.selectedRisk;

    let res = null;
    if (window.APIClient) {
      res = await window.APIClient.getProjects(params);
    }

    if (!res || !res.items || res.items.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="p-8 text-center text-slate-500 text-xs">
            <div class="text-xl mb-1">🔍</div>
            <div class="font-bold text-slate-800 text-sm">No projects match the selected filters</div>
            <p class="text-slate-400 text-[11px] mt-0.5">Try adjusting your search query or clearing the ministry/risk filters.</p>
          </td>
        </tr>
      `;
      this.updatePaginationUI(0, 1);
      return;
    }

    this.items = res.items;
    this.totalRecords = res.total_records || res.items.length;
    this.totalPages = res.total_pages || Math.ceil(this.totalRecords / this.pageSize) || 1;

    const countDisplay = document.getElementById("projects-count-display");
    if (countDisplay) countDisplay.innerText = Number(this.totalRecords).toLocaleString("en-IN");

    tbody.innerHTML = this.items.map(p => {
      const origCost = p.financials ? p.financials.original_cost_cr : 0;
      const revCost = p.financials ? p.financials.revised_cost_cr : 0;
      const physProg = p.progress ? p.progress.physical_progress_pct : 0;
      const finProg = p.progress ? p.progress.financial_progress_pct : 0;
      const gap = p.progress ? p.progress.progress_gap_pct : 0;
      const riskLevel = p.risk ? p.risk.level : "LOW";
      const riskScore = p.risk ? p.risk.overall_score : 50;

      return `
        <tr>
          <td>
            <div class="font-semibold text-slate-900 text-sm line-clamp-1">${p.project_name}</div>
            <div class="font-mono text-caption text-slate-400 uppercase mt-0.5">${p.project_id}</div>
          </td>
          <td>
            <div class="text-slate-800 text-caption font-medium line-clamp-1">${p.ministry}</div>
            <div class="text-caption text-slate-400 line-clamp-1">${p.implementing_agency} • ${p.state}</div>
          </td>
          <td>
            <div class="text-slate-900 font-semibold tabular-nums text-caption">₹${revCost.toLocaleString("en-IN")} Cr</div>
            <div class="text-caption text-slate-400 tabular-nums">Orig: ₹${origCost.toLocaleString("en-IN")} Cr</div>
          </td>
          <td>
            <div class="flex justify-between text-[11px] font-medium mb-1">
              <span>Phys: <strong>${physProg}%</strong></span>
              <span class="text-slate-400 font-mono text-[10px]">Fin: ${finProg}%</span>
            </div>
            ${CommonUI.renderProgressBar(physProg, "bg-blue-700")}
            ${gap > 15 ? `
              <div class="mt-1">
                <span class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-orange-100 text-orange-800 border border-orange-200" title="Financial expenditure leads physical completion by ${gap}%">
                  Gap: +${gap}%
                </span>
              </div>
            ` : ''}
          </td>
          <td>
            ${CommonUI.renderRiskBadge(riskLevel, riskScore)}
          </td>
          <td class="text-caption text-slate-600 max-w-xs text-xs">
            ${p.risk ? p.risk.primary_driver : "Routine Clearance"}
          </td>
          <td class="text-right">
            <a href="#/projects/${p.project_id}" class="btn btn-secondary btn-sm">
              Inspect ➔
            </a>
          </td>
        </tr>
      `;
    }).join("");

    this.updatePaginationUI(this.totalRecords, this.totalPages);
  },

  updatePaginationUI(total, totalPages) {
    const curDisplay = document.getElementById("current-page-display");
    const totalDisplay = document.getElementById("total-pages-display");
    const prevBtn = document.getElementById("btn-prev-page");
    const nextBtn = document.getElementById("btn-next-page");

    if (curDisplay) curDisplay.innerText = this.currentPage;
    if (totalDisplay) totalDisplay.innerText = totalPages;

    if (prevBtn) prevBtn.disabled = this.currentPage <= 1;
    if (nextBtn) nextBtn.disabled = this.currentPage >= totalPages;
  }
};

window.ProjectsView = ProjectsView;
