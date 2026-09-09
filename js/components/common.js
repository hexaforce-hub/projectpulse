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
  }
};

window.CommonUI = CommonUI;
