// ==========================================================================
// PROJECTPULSE — Phase 10: Ministry Command Center View
// Ministry of Statistics & Programme Implementation (MoSPI) - IPMD
// Smart India Hackathon 2026 — Team HexaForce
// ==========================================================================

const MinistryView = {
  data: null,
  projects: [],
  directives: [],
  selectedMinistry: "Ministry of Road Transport & Highways",

  async render(container) {
    container.innerHTML = `
      <div class="space-y-6 animate-fade-in">
        <div class="p-8 text-center text-slate-500">
          <div class="inline-block animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-3"></div>
          <p class="text-sm font-medium">Aggregating Ministry Portfolio Command Telemetry...</p>
        </div>
      </div>
    `;

    // Determine ministry based on current user scope if applicable
    if (window.APIClient && window.APIClient.currentUser) {
      if (window.APIClient.currentUser.scope_type === "MINISTRY" && window.APIClient.currentUser.scope_value) {
        this.selectedMinistry = window.APIClient.currentUser.scope_value;
      }
    }

    try {
      const [summaryRes, projectsRes, directivesRes] = await Promise.all([
        window.APIClient.getMinistrySummary(this.selectedMinistry),
        window.APIClient.listProjects({ ministry: this.selectedMinistry, page_size: 10, risk_level: "HIGH" }),
        window.APIClient.listDirectives({ target_scope: "MINISTRY" })
      ]);

      this.data = summaryRes;
      this.projects = (projectsRes && projectsRes.items) ? projectsRes.items : [];
      this.directives = (directivesRes && directivesRes.directives) ? directivesRes.directives : [];
      this.renderContent(container);
    } catch (e) {
      console.error("[MinistryView] Render error:", e);
      container.innerHTML = `
        <div class="p-8 text-center bg-red-50 text-red-700 rounded-xl border border-red-200">
          <p class="font-bold mb-1">Failed to load Ministry Command Center telemetry.</p>
          <p class="text-xs">${e.message}</p>
        </div>
      `;
    }
  },

  renderContent(container) {
    const d = this.data;
    const user = window.APIClient.currentUser || {};
    const isOfficial = user.role === "MINISTRY_OFFICIAL" || user.role === "NATIONAL_LEADER" || user.role === "ADMIN";

    container.innerHTML = `
      <div class="space-y-6 animate-fade-in">
        <!-- Ministry Command Header -->
        <div class="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
          <div class="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div class="space-y-2">
              <div class="flex items-center gap-3">
                <span class="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full text-xs font-bold uppercase tracking-wider">
                  🏛️ Ministry Scope Command Center
                </span>
                <span class="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded text-xs font-semibold">
                  Autonomous Radar Active
                </span>
              </div>
              <h1 class="text-2xl lg:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                ${d.ministry_name}
              </h1>
              <p class="text-sm text-slate-300 max-w-2xl">
                Apex ministerial decision support interface monitoring ${d.tracked_projects_count.toLocaleString()} Central Sector capital infrastructure projects. Scope-governed telemetry for the Union Secretary & Implementing Agency Directors.
              </p>
            </div>
            
            <div class="flex flex-col items-end gap-2 bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 backdrop-blur-sm min-w-[240px]">
              <div class="text-xs text-slate-400 uppercase font-semibold tracking-wider">Active Institutional Officer</div>
              <div class="text-sm font-bold text-white">${user.name || "Shri Anurag Jain, IAS"}</div>
              <div class="text-xs text-blue-300 font-medium">${user.designation || "Secretary to Government of India"}</div>
              ${isOfficial ? `
                <button id="btn-issue-ministerial-directive" class="mt-2 w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg shadow transition flex items-center justify-center gap-1.5">
                  <span>✍️</span> Issue Downward Directive
                </button>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- KPI Metric Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          ${CommonUI.renderKPICard(
            "Tracked Ministry Projects",
            d.tracked_projects_count.toLocaleString(),
            "PAIMANA Central Sector Registry",
            `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>`
          )}
          ${CommonUI.renderKPICard(
            "Total Capital at Stake",
            d.total_revised_cost_formatted,
            `Cumulative Overrun: ${d.total_overrun_formatted}`,
            `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
          )}
          ${CommonUI.renderKPICard(
            "Capital at Risk",
            d.capital_at_risk_formatted,
            `${d.projects_requiring_review_count} Projects in High/Critical Tier`,
            `<svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`
          )}
          ${CommonUI.renderKPICard(
            "Avg Schedule Slippage",
            `${d.avg_slippage_months} mos`,
            `Physical ${d.avg_physical_progress}% vs Fin ${d.avg_financial_progress}%`,
            `<svg class="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
          )}
        </div>

        <!-- AI Executive Briefing -->
        <div class="gov-card border-l-4 border-l-blue-600 bg-blue-50/40 p-5">
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black flex-shrink-0 shadow-md">
              AI
            </div>
            <div class="space-y-1 flex-1">
              <div class="flex items-center justify-between">
                <h3 class="font-bold text-slate-900 text-base">Ministry Executive Intelligence Brief</h3>
                <span class="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-semibold">Secretary Briefing</span>
              </div>
              <p class="text-sm text-slate-700 leading-relaxed">
                Portfolio analysis of <strong>${d.ministry_name}</strong> reveals 2 high-density corridor bottlenecks: Land Acquisition awards pending in 4 border districts and Environmental Form-C clearance delays. Current capital at risk stands at <strong>${d.capital_at_risk_formatted}</strong> across <strong>${d.projects_requiring_review_count}</strong> critical project alignments.
              </p>
              <div class="mt-2 text-xs text-blue-900 bg-blue-100/70 p-2.5 rounded-lg border border-blue-200/60 font-medium">
                🎯 <strong>Recommended Strategic Intervention:</strong> Convene an inter-departmental task force with the Ministry of Environment, Forest & Climate Change (MoEFCC) to expedite 14 Compensatory Afforestation handovers.
              </div>
            </div>
          </div>
        </div>

        <!-- Risk Distribution & Sector Composition -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Risk Band Distribution -->
          <div class="gov-card">
            <h3 class="font-bold text-slate-900 text-sm uppercase tracking-wider mb-4">Ministry Risk Profile Distribution</h3>
            <div class="space-y-3">
              <div>
                <div class="flex justify-between text-xs mb-1">
                  <span class="font-semibold text-emerald-700">Low Risk Tier</span>
                  <span class="font-bold">${d.risk_distribution.low} projects</span>
                </div>
                ${CommonUI.renderProgressBar((d.risk_distribution.low / d.tracked_projects_count) * 100, "bg-emerald-500")}
              </div>
              <div>
                <div class="flex justify-between text-xs mb-1">
                  <span class="font-semibold text-blue-700">Moderate Risk Tier</span>
                  <span class="font-bold">${d.risk_distribution.moderate} projects</span>
                </div>
                ${CommonUI.renderProgressBar((d.risk_distribution.moderate / d.tracked_projects_count) * 100, "bg-blue-500")}
              </div>
              <div>
                <div class="flex justify-between text-xs mb-1">
                  <span class="font-semibold text-amber-700">High Risk Tier</span>
                  <span class="font-bold">${d.risk_distribution.high} projects</span>
                </div>
                ${CommonUI.renderProgressBar((d.risk_distribution.high / d.tracked_projects_count) * 100, "bg-amber-500")}
              </div>
              <div>
                <div class="flex justify-between text-xs mb-1">
                  <span class="font-semibold text-rose-700">Critical Risk Tier</span>
                  <span class="font-bold">${d.risk_distribution.critical} projects</span>
                </div>
                ${CommonUI.renderProgressBar((d.risk_distribution.critical / d.tracked_projects_count) * 100, "bg-rose-600")}
              </div>
            </div>
          </div>

          <!-- Sector Distribution -->
          <div class="gov-card">
            <h3 class="font-bold text-slate-900 text-sm uppercase tracking-wider mb-4">Sector Breakdown</h3>
            <div class="space-y-3">
              ${d.sectors.map(s => `
                <div class="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                  <div>
                    <div class="font-semibold text-xs text-slate-800">${s.sector}</div>
                    <div class="text-[11px] text-slate-500">${s.project_count} projects · ₹${Math.round(s.total_cost).toLocaleString()} Cr</div>
                  </div>
                  <span class="text-xs px-2 py-0.5 rounded font-bold ${s.high_risk_count > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}">
                    ${s.high_risk_count} At Risk
                  </span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- State Geographies -->
          <div class="gov-card">
            <h3 class="font-bold text-slate-900 text-sm uppercase tracking-wider mb-4">Top State Alignments</h3>
            <div class="space-y-2">
              ${d.states.map(st => `
                <div class="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 last:border-0">
                  <span class="font-medium text-slate-700">${st.state}</span>
                  <div class="flex items-center gap-2">
                    <span class="text-slate-500">${st.project_count} prj</span>
                    <span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${st.high_risk_count > 50 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'}">
                      ${st.high_risk_count} Flagged
                    </span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Priority Escalation Projects Queue -->
        <div class="gov-card p-0 overflow-hidden">
          <div class="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 class="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                Priority Escalation Queue (High & Critical Risk Corridors)
              </h3>
              <p class="text-xs text-slate-500">Corridors within ${d.ministry_name} requiring immediate ministerial review</p>
            </div>
            <a href="#/projects" class="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1">
              View All Ministry Projects &rarr;
            </a>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold tracking-wider">
                  <th class="p-3">Project ID</th>
                  <th class="p-3">Corridor / Project Name</th>
                  <th class="p-3">Agency</th>
                  <th class="p-3">State</th>
                  <th class="p-3">Overrun (Cr)</th>
                  <th class="p-3">Slippage</th>
                  <th class="p-3">Risk Tier</th>
                  <th class="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${this.projects.length === 0 ? `
                  <tr><td colspan="8" class="p-8 text-center text-slate-400">No high risk projects found in active query.</td></tr>
                ` : this.projects.map(p => `
                  <tr class="hover:bg-slate-50/80 transition-colors">
                    <td class="p-3 font-mono font-bold text-blue-700">${p.project_id}</td>
                    <td class="p-3 font-medium text-slate-900 max-w-xs truncate" title="${p.project_name}">${p.project_name}</td>
                    <td class="p-3 text-slate-600">${p.implementing_agency || "NHAI"}</td>
                    <td class="p-3 text-slate-600">${p.state}</td>
                    <td class="p-3 font-bold text-rose-700 tabular-nums">₹${Math.round(p.cost_overrun_cr || 0).toLocaleString()} Cr</td>
                    <td class="p-3 tabular-nums text-slate-700">${p.schedule_slippage_months || 0} mos</td>
                    <td class="p-3">${CommonUI.renderRiskBadge(p.target_risk_class || "HIGH", p.overall_risk_score)}</td>
                    <td class="p-3 text-right">
                      <a href="#/project/${p.project_id}" class="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded font-semibold hover:bg-blue-100 transition">
                        Open Detail
                      </a>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Downward Directives & Governance Decisions -->
        <div class="gov-card">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="font-bold text-slate-900 text-sm uppercase tracking-wider">Active Downward Ministerial Directives</h3>
              <p class="text-xs text-slate-500">Directives issued to project implementation units and state revenue commissioners</p>
            </div>
            <a href="#/directives" class="text-xs font-semibold text-blue-600 hover:text-blue-800">
              Directives Registry &rarr;
            </a>
          </div>

          <div class="space-y-3">
            ${this.directives.length === 0 ? `
              <p class="text-xs text-slate-400 text-center py-4">No active directives issued.</p>
            ` : this.directives.map(dir => `
              <div class="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 bg-blue-100 text-blue-800 font-mono text-[10px] font-bold rounded">${dir.directive_id}</span>
                    <span class="text-xs font-bold text-slate-900">${dir.title}</span>
                    <span class="px-2 py-0.5 text-[10px] font-bold rounded ${dir.priority === 'IMMEDIATE_ESCALATION' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}">${dir.priority}</span>
                  </div>
                  <p class="text-xs text-slate-600">${dir.instructions}</p>
                  ${dir.compliance_notes ? `<p class="text-[11px] text-emerald-700 font-medium">✔️ Compliance: ${dir.compliance_notes}</p>` : ''}
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                  <span class="text-xs font-bold px-2 py-1 rounded ${dir.status === 'COMPLIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                    ${dir.status}
                  </span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // Event listener for directive creation
    const btnDirective = container.querySelector("#btn-issue-ministerial-directive");
    if (btnDirective) {
      btnDirective.addEventListener("click", () => this.showDirectiveModal());
    }
  },

  showDirectiveModal() {
    const modalId = "modal-ministerial-directive";
    let modal = document.getElementById(modalId);
    if (!modal) {
      modal = document.createElement("div");
      modal.id = modalId;
      modal.className = "fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4";
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 animate-scale-in space-y-4">
        <div class="flex items-center justify-between border-b pb-3">
          <div class="flex items-center gap-2">
            <span class="text-xl">✍️</span>
            <h3 class="font-bold text-slate-900 text-base">Issue Downward Ministerial Directive</h3>
          </div>
          <button id="close-directive-modal" class="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
        </div>

        <form id="form-create-directive" class="space-y-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Target Scope</label>
            <select id="dir-target-scope" class="w-full text-xs p-2 border border-slate-300 rounded-lg">
              <option value="MINISTRY" selected>Ministry Portfolio (${this.selectedMinistry})</option>
              <option value="PROJECT">Specific Corridor / Project (PRJ-SYN-000002)</option>
              <option value="NATIONAL">National Megaprojects Taskforce</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Directive Title</label>
            <input type="text" id="dir-title" class="w-full text-xs p-2 border border-slate-300 rounded-lg" placeholder="e.g. Mandatory Monsoon Drainage & Culvert Verification" required />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Priority Classification</label>
            <select id="dir-priority" class="w-full text-xs p-2 border border-slate-300 rounded-lg">
              <option value="IMMEDIATE_ESCALATION">IMMEDIATE ESCALATION (24-48 Hours)</option>
              <option value="URGENT" selected>URGENT (Weekly Review)</option>
              <option value="ROUTINE">ROUTINE (Standard Compliance)</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Operational Instructions</label>
            <textarea id="dir-instructions" rows="3" class="w-full text-xs p-2 border border-slate-300 rounded-lg" placeholder="Specify statutory requirements, survey submission deadlines, and compliance milestones..." required></textarea>
          </div>

          <div class="pt-2 flex justify-end gap-2">
            <button type="button" id="cancel-directive" class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button type="submit" class="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow">Dispatch Directive</button>
          </div>
        </form>
      </div>
    `;

    modal.classList.remove("hidden");

    modal.querySelector("#close-directive-modal").addEventListener("click", () => modal.remove());
    modal.querySelector("#cancel-directive").addEventListener("click", () => modal.remove());
    
    modal.querySelector("#form-create-directive").addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = {
        target_scope: modal.querySelector("#dir-target-scope").value,
        target_id: this.selectedMinistry,
        title: modal.querySelector("#dir-title").value,
        priority: modal.querySelector("#dir-priority").value,
        instructions: modal.querySelector("#dir-instructions").value
      };

      try {
        await window.APIClient.createDirective(payload);
        modal.remove();
        const mainContainer = document.getElementById("main-content");
        if (mainContainer) this.render(mainContainer);
      } catch (err) {
        alert("Failed to issue directive: " + err.message);
      }
    });
  }
};

window.MinistryView = MinistryView;
