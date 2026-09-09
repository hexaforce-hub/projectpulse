// ==========================================================================
// PROJECTPULSE — Phase 11: Field Officer Supervisory Desk
// Ministry of Statistics & Programme Implementation (MoSPI) - IPMD
// Smart India Hackathon 2026 — Team HexaForce
// ==========================================================================

const FieldOfficerDesk = {
  projectId: "PRJ-SYN-000002",
  sites: [],
  inspections: [
    {
      id: "INSP-2026-088",
      site_name: "Site Beta — Ganga River Viaduct Corridor Ch 14+200 to 19+800",
      location: "Pier P-04 Well Excavation Ground",
      category: "GEOTECHNICAL_OBSTRUCTION",
      severity: "CRITICAL",
      inspector: "Shri Sanjay Sharma",
      date: "2026-03-09 09:30 AM",
      summary: "Physical verification of boulder layer obstruction. Well cutting edge tilted by 1.8 degrees. Verified stopped state.",
      status: "VERIFIED_BLOCKED",
      photo_url: "assets/pier_p04_core_sample.jpg"
    },
    {
      id: "INSP-2026-087",
      site_name: "Site Beta — Ganga River Viaduct Corridor Ch 14+200 to 19+800",
      location: "Pier P-05 Caisson Sinking Rig",
      category: "QUALITY_AUDIT",
      severity: "NORMAL",
      inspector: "Shri Sanjay Sharma",
      date: "2026-03-08 04:15 PM",
      summary: "Pneumatic caisson pressure calibration test verified within MoRTH 5th revision specification limits.",
      status: "PASSED",
      photo_url: "assets/pier_p05_pressure.jpg"
    },
    {
      id: "INSP-2026-086",
      site_name: "Site Alpha — Varanasi Approach Ch 0+000 to 14+200",
      location: "Chainage 12+400 Embankment Compaction",
      category: "COMPACTION_TEST",
      severity: "NORMAL",
      inspector: "Shri Sanjay Sharma",
      date: "2026-03-08 11:00 AM",
      summary: "Nuclear density gauge test recorded 98.4% Modified Proctor Density against 98.0% design standard.",
      status: "PASSED",
      photo_url: "assets/ch12_density.jpg"
    }
  ],

  async render(container) {
    if (!container) {
      container = document.getElementById("main-content-mount");
    }
    if (!container) return;

    container.innerHTML = `
      <div class="space-y-6 animate-fade-in max-w-6xl mx-auto pb-16">
        <div class="p-8 text-center text-slate-500">
          <div class="inline-block animate-spin w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full mb-3"></div>
          <p class="text-sm font-medium">Loading Field Officer Supervisory Desk...</p>
        </div>
      </div>
    `;

    try {
      const sitesRes = await window.APIClient.getProjectSites(this.projectId);
      this.sites = (sitesRes && sitesRes.sites) ? sitesRes.sites : [];
      this.renderContent(container);
    } catch (e) {
      console.error("[FieldOfficerDesk] Render error:", e);
      container.innerHTML = `
        <div class="p-8 text-center bg-red-50 text-red-700 rounded-xl border border-red-200">
          <p class="font-bold mb-1">Failed to load Field Officer Desk.</p>
          <p class="text-xs">${e.message}</p>
        </div>
      `;
    }
  },

  renderContent(container) {
    const user = window.APIClient.currentUser || {};

    container.innerHTML = `
      <div class="space-y-6 animate-fade-in max-w-6xl mx-auto pb-16">
        
        <!-- Header Banner -->
        <div class="bg-gradient-to-r from-slate-900 via-orange-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 bg-orange-500/20 text-orange-300 border border-orange-400/30 rounded-full text-xs font-bold uppercase tracking-wider">
                  🛡️ Field Supervisory Command
                </span>
                <span class="text-xs text-slate-400 font-mono">ID: USR-FO-01 · NHAI Field Division</span>
              </div>
              <h1 class="text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
                Field Officer Supervisory Desk
              </h1>
              <p class="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Supervisory operations led by <strong>${user.name || "Shri Sanjay Sharma"}</strong>. Onsite physical verification, drone surveillance oversight, statutory RoW demarcation, and urgent contractor dispatches.
              </p>
            </div>

            <div class="flex items-center gap-2">
              <button id="btn-dispatch-notice" class="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2">
                <span>📢</span> Dispatch Field Directive
              </button>
            </div>
          </div>
        </div>

        <!-- 3 Sites Overview Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          ${this.sites.map(s => `
            <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2">
              <div class="flex items-center justify-between">
                <span class="font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                  s.status === 'CRITICAL_EXECUTION' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                }">${s.status}</span>
                <span class="text-xs text-slate-400">Ch ${s.chainage_start_km} - ${s.chainage_end_km} km</span>
              </div>
              <h3 class="font-bold text-slate-900 text-xs">${s.name}</h3>
              <div class="text-[11px] text-slate-500 flex justify-between pt-1 border-t border-slate-100">
                <span>In-Charge: <strong>${s.incharge_name}</strong></span>
                <span class="text-emerald-700 font-semibold">Active Roster</span>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Physical Onsite Inspection Queue -->
        <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 class="font-bold text-slate-900 text-sm uppercase tracking-wider">Field Inspection & Verification Log</h3>
              <p class="text-xs text-slate-500">Official ground audits signed off by the Divisional Field Officer</p>
            </div>
            <button id="btn-new-inspection" class="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition">
              + Record Site Inspection
            </button>
          </div>

          <div class="space-y-3">
            ${this.inspections.map(insp => `
              <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-start justify-between gap-3 text-xs">
                <div class="space-y-1.5 flex-1">
                  <div class="flex items-center gap-2">
                    <span class="font-mono text-[10px] font-bold bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded">${insp.id}</span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
                      insp.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                    }">${insp.category}</span>
                    <span class="font-bold text-slate-900">${insp.location}</span>
                  </div>
                  <p class="text-slate-600 leading-relaxed text-xs">${insp.summary}</p>
                  <div class="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <span>Audit Date: <strong>${insp.date}</strong></span>
                    <span>Auditor: <strong>${insp.inspector}</strong></span>
                    <span class="text-blue-600 underline cursor-pointer">Attached Geo-Photo</span>
                  </div>
                </div>

                <div class="flex items-center gap-2 flex-shrink-0">
                  <span class="px-2.5 py-1 rounded text-xs font-bold ${
                    insp.status === 'VERIFIED_BLOCKED' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }">
                    ${insp.status}
                  </span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Field Dispatches & Statutory Clearances -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <h3 class="font-bold text-slate-900 text-xs uppercase tracking-wider">Statutory RoW & Forest Border Demarcation</h3>
            <p class="text-xs text-slate-500">Chandauli Reserve Forest border clearance verification</p>
            <div class="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
              <div class="font-bold">Stage-II Clearance Demarcation Complete</div>
              <div class="text-[11px]">240 boundary pillars established and validated against GPS coordinates. Zero pending revenue litigation on PKG-3 alignment.</div>
            </div>
          </div>

          <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <h3 class="font-bold text-slate-900 text-xs uppercase tracking-wider">Contractor Compliance Escalation</h3>
            <p class="text-xs text-slate-500">Formal notices issued under Concession Agreement Clause 12.4</p>
            <div class="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <div class="font-bold">Notice to Mobilize Hydro-Jetting Contractor</div>
              <div class="text-[11px]">Notice served to L&T Infrastructure on 2026-03-08. Required on-site arrival: within 72 hours to prevent liquidated damages.</div>
            </div>
          </div>
        </div>

      </div>
    `;

    this.bindEvents(container);
  },

  bindEvents(container) {
    const dispatchBtn = container.querySelector("#btn-dispatch-notice");
    if (dispatchBtn) {
      dispatchBtn.addEventListener("click", () => {
        const text = prompt("Enter formal field directive text to contractor PIU:", "Directing immediate deployment of pneumatic reverse-circulation drilling rig at Pier P-04.");
        if (text) {
          window.APIClient.showToast("Field directive recorded and dispatched to Concessionaire", "success");
        }
      });
    }

    const newInspBtn = container.querySelector("#btn-new-inspection");
    if (newInspBtn) {
      newInspBtn.addEventListener("click", () => {
        const loc = prompt("Enter inspection location / chainage:", "Ganga Pier P-04 Well Bottom");
        if (loc) {
          this.inspections.unshift({
            id: `INSP-${Date.now().toString().slice(-4)}`,
            site_name: "Site Beta — Ganga Viaduct",
            location: loc,
            category: "PHYSICAL_AUDIT",
            severity: "NORMAL",
            inspector: "Shri Sanjay Sharma",
            date: new Date().toLocaleString(),
            summary: "Onsite physical verification completed. Quantities verified against field book.",
            status: "PASSED",
            photo_url: "assets/geo_audit.jpg"
          });
          this.renderContent(container);
          window.APIClient.showToast("Site inspection logged into ledger", "success");
        }
      });
    }
  }
};

window.FieldOfficerDesk = FieldOfficerDesk;
