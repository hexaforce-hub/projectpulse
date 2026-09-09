// ==========================================================================
// PROJECTPULSE — Phase 10: Project Manager Operational Workspace
// Ministry of Statistics & Programme Implementation (MoSPI) - IPMD
// Smart India Hackathon 2026 — Team HexaForce
// ==========================================================================

const ProjectManagerView = {
  projects: [],
  tasks: [],
  issues: [],

  async render(container) {
    container.innerHTML = `
      <div class="space-y-6 animate-fade-in">
        <div class="p-8 text-center text-slate-500">
          <div class="inline-block animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-3"></div>
          <p class="text-sm font-medium">Loading Project Manager Operational Workspace...</p>
        </div>
      </div>
    `;

    try {
      const [projectsRes, tasksRes, issuesRes] = await Promise.all([
        window.APIClient.listProjects({ page_size: 10 }),
        window.APIClient.listTasks(),
        window.APIClient.listIssues()
      ]);

      this.projects = (projectsRes && projectsRes.items) ? projectsRes.items : [];
      this.tasks = (tasksRes && tasksRes.tasks) ? tasksRes.tasks : [];
      this.issues = (issuesRes && issuesRes.issues) ? issuesRes.issues : [];
      this.renderContent(container);
    } catch (e) {
      console.error("[ProjectManagerView] Render error:", e);
      container.innerHTML = `
        <div class="p-8 text-center bg-red-50 text-red-700 rounded-xl border border-red-200">
          <p class="font-bold mb-1">Failed to load Project Manager workspace.</p>
          <p class="text-xs">${e.message}</p>
        </div>
      `;
    }
  },

  renderContent(container) {
    const user = window.APIClient.currentUser || {};
    const assignedIds = user.assigned_projects || ["PRJ-SYN-000002", "PRJ-SYN-000003", "PRJ-SYN-000004"];

    container.innerHTML = `
      <div class="space-y-6 animate-fade-in">
        <!-- PM Header Banner -->
        <div class="bg-gradient-to-r from-slate-900 via-sky-950 to-blue-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
          <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div class="space-y-2">
              <div class="flex items-center gap-3">
                <span class="px-3 py-1 bg-sky-500/20 text-sky-300 border border-sky-400/30 rounded-full text-xs font-bold uppercase tracking-wider">
                  🏗️ Project Scope Operational Workspace
                </span>
                <span class="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded text-xs font-semibold">
                  Assigned Responsibility: ${assignedIds.length} Corridors
                </span>
              </div>
              <h1 class="text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
                Corridor Project Implementation Unit (PIU)
              </h1>
              <p class="text-sm text-slate-300 max-w-2xl">
                Operational dashboard for <strong>${user.name || "Shri R.K. Singla"}</strong> (${user.designation || "Project Director"}). Real-time oversight over milestone progress, site bottlenecks, contractor claims, and prescriptive counterfactual interventions.
              </p>
            </div>

            <div class="flex items-center gap-2">
              <a href="#/what-if" class="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2">
                <span>⚡</span> Run What-If Simulator
              </a>
            </div>
          </div>
        </div>

        <!-- Metric KPI Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          ${CommonUI.renderKPICard(
            "Assigned Corridors",
            assignedIds.length.toString(),
            "Designated Project Directorate",
            `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>`
          )}
          ${CommonUI.renderKPICard(
            "Active Site Issues",
            this.issues.filter(i => i.status !== 'RESOLVED').length.toString(),
            "Contractor & Statutory Delays",
            `<svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`
          )}
          ${CommonUI.renderKPICard(
            "Operational Field Tasks",
            this.tasks.length.toString(),
            `${this.tasks.filter(t => t.status === 'COMPLETED').length} Completed · ${this.tasks.filter(t => t.status === 'BLOCKED').length} Blocked`,
            `<svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>`
          )}
          ${CommonUI.renderKPICard(
            "Simulation Interventions",
            "3 Active",
            "Prescriptive Counterfactual Engine",
            `<svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`
          )}
        </div>

        <!-- Assigned Projects Detail Cards -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-slate-900 text-sm uppercase tracking-wider">Your Assigned Infrastructure Corridors</h3>
            <span class="text-xs text-slate-500">Authorized by MoRTH PIU Charter</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            ${this.projects.map(p => `
              <div class="gov-card flex flex-col justify-between hover:shadow-md transition">
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="font-mono text-xs font-bold text-blue-700">${p.project_id}</span>
                    ${CommonUI.renderRiskBadge(p.target_risk_class || "MODERATE", p.overall_risk_score)}
                  </div>
                  <h4 class="font-bold text-slate-900 text-sm line-clamp-2" title="${p.project_name}">
                    ${p.project_name}
                  </h4>
                  <div class="text-xs text-slate-500 flex items-center justify-between pt-1">
                    <span>${p.state}</span>
                    <span class="font-semibold text-slate-700">₹${Math.round(p.revised_cost_cr || 0).toLocaleString()} Cr</span>
                  </div>
                  <div class="pt-2">
                    ${CommonUI.renderDualProgress(p.physical_progress_pct || 45, p.financial_progress_pct || 58)}
                  </div>
                </div>

                <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <a href="#/project/${p.project_id}" class="text-xs font-bold text-blue-700 hover:text-blue-900">
                    Open Detail &rarr;
                  </a>
                  <a href="#/what-if?project_id=${p.project_id}" class="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold rounded-lg hover:bg-amber-100 transition">
                    Simulate
                  </a>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Operational Site Issues & Milestones -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Active Site Issues -->
          <div class="gov-card">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold text-slate-900 text-sm uppercase tracking-wider">Active Site Issues & Bottlenecks</h3>
              <span class="text-xs px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold">${this.issues.length} Logged</span>
            </div>

            <div class="space-y-3">
              ${this.issues.map(iss => `
                <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="px-2 py-0.5 bg-slate-200 text-slate-800 font-mono text-[10px] font-bold rounded">${iss.issue_id}</span>
                      <span class="px-2 py-0.5 text-[10px] font-bold rounded ${iss.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}">${iss.severity}</span>
                      <span class="text-xs font-bold text-slate-800">${iss.category}</span>
                    </div>
                    <span class="text-[11px] font-bold px-2 py-0.5 rounded ${iss.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}">${iss.status}</span>
                  </div>
                  <h5 class="text-xs font-bold text-slate-900">${iss.title}</h5>
                  <p class="text-xs text-slate-600 leading-relaxed">${iss.description}</p>
                  <div class="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                    <span>Reported by: <strong>${iss.reported_by_name || "Engineer"}</strong></span>
                    <span>${iss.created_at ? iss.created_at.substring(0, 10) : ''}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Field Execution Tasks -->
          <div class="gov-card">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold text-slate-900 text-sm uppercase tracking-wider">Field Operations Telemetry</h3>
              <span class="text-xs text-slate-500">Live Upward Sync</span>
            </div>

            <div class="space-y-3">
              ${this.tasks.map(t => `
                <div class="p-3 bg-white rounded-lg border border-slate-200 shadow-sm flex items-start justify-between gap-3">
                  <div class="space-y-1">
                    <div class="flex items-center gap-2">
                      <span class="font-mono text-[10px] font-bold text-slate-500">${t.task_id}</span>
                      <span class="text-xs font-bold text-slate-900">${t.title}</span>
                      <span class="px-1.5 py-0.5 text-[9px] font-bold rounded ${t.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'}">${t.priority}</span>
                    </div>
                    <p class="text-xs text-slate-600 line-clamp-1">${t.description}</p>
                    ${t.remarks ? `<p class="text-[11px] text-blue-700 font-medium">💬 ${t.remarks}</p>` : ''}
                  </div>
                  <span class="text-xs font-bold px-2 py-1 rounded flex-shrink-0 ${
                    t.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                    t.status === 'BLOCKED' ? 'bg-rose-100 text-rose-800' :
                    t.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                  }">
                    ${t.status.replace("_", " ")}
                  </span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }
};

window.ProjectManagerView = ProjectManagerView;
