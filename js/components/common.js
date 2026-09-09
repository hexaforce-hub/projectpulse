// ==========================================================================
// PROJECTPULSE — Reusable UI Components
// Ministry of Statistics & Programme Implementation (MoSPI) - IPMD
// ==========================================================================

const CommonUI = {
  // Global Data Status Pill (Never pretends synthetic data is live)
  renderDataStatus(status = "SYNTHETIC") {
    return `
      <span class="data-status-pill" title="Prototype uses synthetic demonstration data">
        ${status === "SYNTHETIC" ? "DEMO DATA" : status}
      </span>
    `;
  },

  // Standardized Government Risk Badge
  renderRiskBadge(scoreOrLevel, score = null) {
    let numericScore = typeof scoreOrLevel === "number" ? scoreOrLevel : score;
    const style = window.Formatters.getRiskStyle(scoreOrLevel);
    const scoreText = numericScore !== null && numericScore !== undefined ? ` ${Math.round(numericScore)}/100` : "";
    
    return `
      <span class="risk-badge ${style.className}">
        <span class="w-1.5 h-1.5 rounded-full" style="background-color: ${style.color}"></span>
        ${style.level}${scoreText}
      </span>
    `;
  },

  // Standard KPI Card (Equal visual height, strict alignment)
  renderKPICard(title, value, subtext, iconSvg) {
    return `
      <div class="gov-card flex flex-col justify-between min-h-[132px]">
        <div class="flex items-center justify-between gap-2 mb-2">
          <span class="text-caption font-semibold uppercase tracking-wider text-slate-500">${title}</span>
          <div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
            ${iconSvg}
          </div>
        </div>
        <div>
          <div class="kpi-metric-val text-2xl lg:text-3xl font-bold text-slate-900 tabular-nums tracking-tight mb-1">${value}</div>
          <div class="text-caption text-slate-500 line-clamp-1">${subtext}</div>
        </div>
      </div>
    `;
  },

  // Progress Bar
  renderProgressBar(pct, colorClass = "bg-blue-700") {
    const clamped = Math.min(100, Math.max(0, pct || 0));
    return `
      <div class="gov-progress-track">
        <div class="gov-progress-fill ${colorClass}" style="width: ${clamped}%"></div>
      </div>
    `;
  },

  // Financial vs Physical Progress Dual Comparison
  renderDualProgress(physPct, finPct) {
    const gap = window.Formatters.calculateProgressGap(finPct, physPct);
    const isMismatch = gap > 15;
    return `
      <div class="space-y-2">
        <div class="flex items-center justify-between text-caption">
          <span class="text-slate-600">Physical Progress: <strong class="text-slate-900 font-semibold tabular-nums">${window.Formatters.formatPercentage(physPct)}</strong></span>
          <span class="text-slate-600">Expenditure: <strong class="text-slate-900 font-semibold tabular-nums">${window.Formatters.formatPercentage(finPct)}</strong></span>
        </div>
        <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
          <div class="bg-blue-700 h-full transition-all" style="width: ${Math.min(100, physPct)}%" title="Physical: ${physPct}%"></div>
          <div class="bg-amber-500/70 h-full transition-all" style="width: ${Math.max(0, finPct - physPct)}%" title="Expenditure Gap: ${gap}%"></div>
        </div>
        <div class="flex items-center justify-between text-caption pt-1 border-t border-slate-100">
          <span class="text-slate-500">Decoupling Gap:</span>
          <span class="font-semibold tabular-nums ${isMismatch ? 'text-orange-700 font-bold' : 'text-slate-700'}">
            ${gap > 0 ? `+${gap}%` : `${gap}%`} ${isMismatch ? '⚠️ Elevated' : 'Normal'}
          </span>
        </div>
      </div>
    `;
  },

  // Standard Empty State
  renderEmptyState(title, message, actionHtml = "") {
    return `
      <div class="p-12 text-center border border-dashed border-slate-200 rounded-xl bg-white">
        <div class="w-12 h-12 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400 mb-3 text-xl">
          🔍
        </div>
        <h4 class="font-semibold text-slate-800 text-sm mb-1">${title}</h4>
        <p class="text-caption text-slate-500 max-w-sm mx-auto mb-4">${message}</p>
        ${actionHtml}
      </div>
    `;
  },

  // Loading Skeleton
  renderLoadingSkeleton(rows = 5) {
    return Array.from({ length: rows }).map(() => `
      <div class="animate-pulse p-4 border-b border-slate-100 flex items-center justify-between">
        <div class="space-y-2 w-1/3">
          <div class="h-4 bg-slate-200 rounded w-3/4"></div>
          <div class="h-3 bg-slate-100 rounded w-1/2"></div>
        </div>
        <div class="h-3 bg-slate-100 rounded w-24"></div>
        <div class="h-4 bg-slate-200 rounded w-16"></div>
      </div>
    `).join("");
  },

  // Dynamic Breadcrumb Component (Section 8)
  renderBreadcrumbs(items = []) {
    if (!items || items.length === 0) return "";
    return `
      <nav class="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto whitespace-nowrap py-1" aria-label="Breadcrumb">
        <a href="#/dashboard" class="hover:text-blue-700 font-medium transition-colors flex items-center gap-1">
          <span>🏛️</span>
          <span>Command Center</span>
        </a>
        ${items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return `
            <span class="text-slate-300">/</span>
            ${isLast 
              ? `<span class="font-semibold text-slate-900 truncate max-w-[240px]" aria-current="page">${item.label}</span>`
              : `<a href="${item.href || '#'}" class="hover:text-blue-700 transition-colors truncate max-w-[200px]">${item.label}</a>`
            }
          `;
        }).join('')}
      </nav>
    `;
  },

  // Standardized Government Status Badge (Section 53)
  renderStatusBadge(status = "ON TRACK") {
    const s = String(status).toUpperCase();
    let bg = "bg-slate-100 text-slate-700 border-slate-200";
    let dot = "bg-slate-500";

    if (s.includes("ON TRACK") || s.includes("COMPLETED") || s.includes("HEALTHY")) {
      bg = "bg-emerald-50 text-emerald-800 border-emerald-200";
      dot = "bg-emerald-600";
    } else if (s.includes("WATCH") || s.includes("MODERATE") || s.includes("REVIEW")) {
      bg = "bg-amber-50 text-amber-800 border-amber-200";
      dot = "bg-amber-600";
    } else if (s.includes("HIGH") || s.includes("CRITICAL") || s.includes("BLOCKED") || s.includes("STOPPAGE")) {
      bg = "bg-rose-50 text-rose-800 border-rose-200";
      dot = "bg-rose-600";
    } else if (s.includes("STALE")) {
      bg = "bg-slate-100 text-slate-600 border-slate-300";
      dot = "bg-slate-400";
    }

    return `
      <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold border ${bg}">
        <span class="w-1.5 h-1.5 rounded-full ${dot}"></span>
        ${s}
      </span>
    `;
  },

  // 5-Pillar Project Health Strip (Section 21)
  renderHealthStrip(health = {}) {
    const pillars = [
      { key: "schedule", label: "Schedule", status: health.schedule || "WATCH", subtext: health.scheduleText || "+4 mos drift" },
      { key: "financial", label: "Financial", status: health.financial || "HEALTHY", subtext: health.financialText || "Within budget" },
      { key: "progress", label: "Progress", status: health.progress || "WATCH", subtext: health.progressText || "62% Physical" },
      { key: "execution", label: "Execution", status: health.execution || "WATCH", subtext: health.executionText || "Pier 4 Delayed" },
      { key: "data", label: "Data Quality", status: health.data || "HEALTHY", subtext: health.dataText || "Verified QA" }
    ];

    return `
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        ${pillars.map(p => {
          let borderClass = "status-healthy";
          let badgeColor = "text-emerald-700 bg-emerald-50";
          if (p.status === "WATCH") {
            borderClass = "status-watch";
            badgeColor = "text-amber-700 bg-amber-50";
          } else if (p.status === "RISK" || p.status === "CRITICAL" || p.status === "HIGH") {
            borderClass = "status-risk";
            badgeColor = "text-rose-700 bg-rose-50";
          }
          return `
            <div class="health-pillar ${borderClass}" onclick="CommonUI.onHealthPillarClick('${p.key}')">
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500">${p.label}</span>
                <span class="text-[10px] font-extrabold px-1.5 py-0.5 rounded ${badgeColor}">${p.status}</span>
              </div>
              <div class="text-xs font-semibold text-slate-800 mt-1 truncate">${p.subtext}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  onHealthPillarClick(key) {
    if (window.ProjectDetailView && window.ProjectDetailView.switchTab) {
      const tabMap = { schedule: "timeline", financial: "plan-vs-actual", progress: "progress-trend", execution: "execution", data: "audit" };
      window.ProjectDetailView.switchTab(tabMap[key] || "overview");
    }
  },

  // Filter Chips Bar (Section 16)
  renderFilterChips(chips = [], onRemoveFnName = "ProjectsView.removeFilter", onClearAllFnName = "ProjectsView.clearAllFilters") {
    if (!chips || chips.length === 0) return "";
    return `
      <div class="flex items-center gap-2 flex-wrap py-2 border-b border-slate-100">
        <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Filters:</span>
        ${chips.map(c => `
          <span class="filter-chip">
            <span>${c.label}: <strong>${c.value}</strong></span>
            <button onclick="${onRemoveFnName}('${c.key}')" title="Remove filter" aria-label="Remove filter ${c.label}">×</button>
          </span>
        `).join('')}
        <button onclick="${onClearAllFnName}()" class="text-xs text-blue-700 hover:text-blue-900 font-semibold underline ml-1 cursor-pointer">
          Clear all
        </button>
      </div>
    `;
  },

  // Slide-over Side Drawer (Section 34)
  openDrawer(title, contentHtml) {
    let backdrop = document.getElementById("astra-global-drawer-backdrop");
    let panel = document.getElementById("astra-global-drawer-panel");

    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.id = "astra-global-drawer-backdrop";
      backdrop.className = "astra-drawer-backdrop";
      backdrop.onclick = () => CommonUI.closeDrawer();
      document.body.appendChild(backdrop);
    }

    if (!panel) {
      panel = document.createElement("div");
      panel.id = "astra-global-drawer-panel";
      panel.className = "astra-drawer-panel";
      document.body.appendChild(panel);
    }

    panel.innerHTML = `
      <div class="h-16 px-5 border-b border-slate-200 flex items-center justify-between flex-shrink-0 bg-slate-50">
        <h3 class="font-bold text-slate-900 text-sm tracking-tight">${title}</h3>
        <button onclick="CommonUI.closeDrawer()" class="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition text-base">✕</button>
      </div>
      <div class="flex-1 overflow-y-auto p-5 space-y-4">
        ${contentHtml}
      </div>
    `;

    backdrop.style.display = "block";
    requestAnimationFrame(() => panel.classList.add("open"));
  },

  closeDrawer() {
    const backdrop = document.getElementById("astra-global-drawer-backdrop");
    const panel = document.getElementById("astra-global-drawer-panel");
    if (panel) panel.classList.remove("open");
    if (backdrop) {
      setTimeout(() => { backdrop.style.display = "none"; }, 200);
    }
  }
};

window.CommonUI = CommonUI;
