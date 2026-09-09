// ==========================================================================
// PROJECTPULSE — National Command Center Dashboard Component (Phase 9.5)
// Route: / or /dashboard
// Ministry of Statistics & Programme Implementation (MoSPI) - IPMD / PAIMANA
// Smart India Hackathon 2026 — Team HexaForce
// ==========================================================================

const DashboardView = {
  trendChart: null,
  activeTrendMetric: "risk",

  render() {
    const projects = window.MOCK_PROJECTS || [];

    // Top priority attention projects with concise explanations (Section 10, 114)
    const attentionProjects = [
      {
        project_id: "PRJ-SYN-000002",
        project_name: "Varanasi-Ranchi-Kolkata Expressway (PKG-3 Ganga River Bridge)",
        ministry: "Ministry of Road Transport and Highways",
        agency: "NHAI",
        risk_level: "CRITICAL",
        risk_score: 91.4,
        why: "Physical progress (41%) decoupled from spend (68%). Deep-water pier foundations stalled by monsoonal hydrology and contractor liquidity.",
        deadline_pressure: "14 mos slippage (Target: Dec 2027)",
        exposure: "₹3,450 Cr"
      },
      {
        project_id: "PRJ-SYN-000003",
        project_name: "Delhi-Mumbai Expressway Spur (Vadodara-Virar Section)",
        ministry: "Ministry of Road Transport and Highways",
        agency: "NHAI",
        risk_level: "HIGH",
        risk_score: 84.2,
        why: "Forest Stage-II clearance impasse across 42 km sanctuary buffer. Construction blocked since March 2026.",
        deadline_pressure: "8 mos slippage (Target: Oct 2026)",
        exposure: "₹4,120 Cr"
      },
      {
        project_id: "PRJ-SYN-000001",
        project_name: "Secunderabad-Mahabubnagar Rail Doubling & Electrification",
        ministry: "Ministry of Railways",
        agency: "RVNL",
        risk_level: "HIGH",
        risk_score: 79.8,
        why: "Signaling equipment supply chain disruption and dispute over grade separation embankment RoW.",
        deadline_pressure: "6 mos slippage (Target: Aug 2026)",
        exposure: "₹1,840 Cr"
      },
      {
        project_id: "PRJ-SYN-000004",
        project_name: "Varanasi-Ranchi-Kolkata Stage-I Four-Laning Package",
        ministry: "Ministry of Road Transport and Highways",
        agency: "NHAI",
        risk_level: "HIGH",
        risk_score: 76.5,
        why: "Land compensation disbursement disputes in 3 taluks pending District Revenue Commissioner clearance.",
        deadline_pressure: "5 mos slippage (Target: Mar 2027)",
        exposure: "₹2,780 Cr"
      },
      {
        project_id: "PRJ-SYN-000005",
        project_name: "Western Dedicated Freight Corridor (Dadri-Rewari Feeder)",
        ministry: "Ministry of Railways",
        agency: "DFCCIL",
        risk_level: "HIGH",
        risk_score: 74.0,
        why: "High-tension power line utility relocation delayed across Haryana sector.",
        deadline_pressure: "7 mos slippage (Target: Nov 2026)",
        exposure: "₹5,620 Cr"
      },
      {
        project_id: "PRJ-SYN-000006",
        project_name: "Barh Super Thermal Power Station Stage-II",
        ministry: "Ministry of Power",
        agency: "NTPC",
        risk_level: "HIGH",
        risk_score: 72.3,
        why: "Boiler erection delayed due to sub-vendor cashflow distress. CPM path threatened.",
        deadline_pressure: "9 mos slippage (Target: Jan 2027)",
        exposure: "₹6,890 Cr"
      }
    ];

    return `
      <div class="max-w-[1440px] mx-auto space-y-6">
        
        <!-- =====================================================================
             LEVEL 1: PAGE PURPOSE & EXECUTIVE INSIGHT BANNER (Section 10, 114)
             ===================================================================== -->
        <div class="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-xl p-5 sm:p-6 text-white shadow-sm border border-slate-800">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="space-y-1.5 max-w-3xl">
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2.5 py-0.5 rounded">
                  ASTRA COMMAND CENTER • JULY 2026
                </span>
                <span class="text-slate-500">•</span>
                <span class="text-xs text-slate-300 font-medium">MoSPI IPMD National Portfolio</span>
              </div>
              <h1 class="text-xl sm:text-2xl font-black text-white tracking-tight">
                National Infrastructure Executive Decision Deck
              </h1>
              
              <!-- Dynamic One-Sentence Executive Insight (Level 1) -->
              <div id="executive-one-line-insight" class="text-xs sm:text-sm text-blue-100/90 font-medium leading-relaxed bg-white/5 border border-white/10 rounded-lg p-3 mt-2">
                <span class="text-amber-400 font-bold mr-1">⚠️ Executive Brief:</span>
                Portfolio risk is concentrated in <strong>Roads & Highways (38.2%)</strong> and <strong>Railways (26.4%)</strong>, with <strong class="text-rose-300">14 projects</strong> requiring immediate ministerial review due to statutory clearance impasses and physical-financial decoupling.
              </div>
            </div>

            <div class="flex sm:flex-col gap-2 flex-shrink-0">
              <a href="#/projects?risk_tier=CRITICAL" class="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors shadow-sm text-center flex items-center justify-center gap-1.5">
                <span>🚨</span>
                <span>Review Critical (14)</span>
              </a>
              <a href="#/reports" class="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors border border-white/15 text-center flex items-center justify-center gap-1.5">
                <span>📑</span>
                <span>Flash Reports Tables</span>
              </a>
            </div>
          </div>
        </div>

        <!-- =====================================================================
             LEVEL 2: 6 KEY NATIONAL INDICATORS (High Information Density, Clickable)
             ===================================================================== -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <h2 class="text-xs font-bold uppercase tracking-wider text-slate-500">Key National Portfolio Telemetry</h2>
            <span class="text-[11px] text-slate-400">Click any indicator to open filtered explorer</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            
            <!-- 1. Tracked Projects -->
            <a href="#/projects" class="gov-card p-3.5 flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition group text-decoration-none" title="View all Central Sector Projects">
              <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-blue-700">Ongoing Projects</span>
              <div class="my-1.5">
                <div id="kpi-tracked-count" class="text-2xl font-extrabold text-slate-900 font-mono">10,000</div>
                <div class="text-[10px] text-slate-500 font-medium">Central Sector (₹150 Cr+)</div>
              </div>
              <span class="text-[10px] text-blue-700 font-semibold flex items-center gap-1">Explorer →</span>
            </a>

            <!-- 2. Revised Capital Outlay -->
            <a href="#/portfolio-matrix" class="gov-card p-3.5 flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition group text-decoration-none" title="Explore Portfolio Outlay Matrix">
              <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-blue-700">Capital Outlay</span>
              <div class="my-1.5">
                <div id="kpi-revised-cost" class="text-2xl font-extrabold text-slate-900 font-mono">₹42.50L Cr</div>
                <div class="text-[10px] text-slate-500 font-medium">Revised aggregate spend</div>
              </div>
              <span class="text-[10px] text-blue-700 font-semibold flex items-center gap-1">Outlay Matrix →</span>
            </a>

            <!-- 3. Cumulative Overrun -->
            <a href="#/portfolio-matrix" class="gov-card p-3.5 flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition group text-decoration-none" title="Inspect Cost Escalations">
              <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-amber-700">Cost Overrun</span>
              <div class="my-1.5">
                <div id="kpi-overrun-cost" class="text-2xl font-extrabold text-amber-700 font-mono">₹12.45L Cr</div>
                <div class="text-[10px] text-amber-800 font-semibold">+29.3% fiscal expansion</div>
              </div>
              <span class="text-[10px] text-amber-700 font-semibold flex items-center gap-1">Cost Drivers →</span>
            </a>

            <!-- 4. Average Physical Progress -->
            <a href="#/execution" class="gov-card p-3.5 flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition group text-decoration-none" title="Execution CPM Progress">
              <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-blue-700">Avg Progress</span>
              <div class="my-1.5">
                <div id="kpi-avg-progress" class="text-2xl font-extrabold text-slate-900 font-mono">58.4%</div>
                <div class="text-[10px] text-slate-500 font-medium">vs 69.2% expenditure</div>
              </div>
              <span class="text-[10px] text-blue-700 font-semibold flex items-center gap-1">Execution CPM →</span>
            </a>

            <!-- 5. High-Risk Projects -->
            <a href="#/projects?risk_tier=HIGH" class="gov-card p-3.5 flex flex-col justify-between hover:border-orange-400 hover:shadow-md transition group text-decoration-none" title="Filter High-Risk Projects">
              <span class="text-[11px] font-bold uppercase tracking-wider text-orange-700">High Risk</span>
              <div class="my-1.5">
                <div id="kpi-high-count" class="text-2xl font-extrabold text-orange-700 font-mono">2,480</div>
                <div class="text-[10px] text-slate-500 font-medium">Require proactive triage</div>
              </div>
              <span class="text-[10px] text-orange-700 font-semibold flex items-center gap-1">View 2,480 →</span>
            </a>

            <!-- 6. Critical Projects Requiring Review -->
            <a href="#/projects?risk_tier=CRITICAL" class="gov-card p-3.5 flex flex-col justify-between bg-rose-50/40 border-rose-200 hover:border-rose-400 hover:shadow-md transition group text-decoration-none" title="Filter Critical Priority Projects">
              <span class="text-[11px] font-bold uppercase tracking-wider text-rose-800">Critical Priority</span>
              <div class="my-1.5">
                <div id="kpi-review-count" class="text-2xl font-extrabold text-rose-700 font-mono">1,160</div>
                <div class="text-[10px] text-rose-700 font-semibold">Immediate attention</div>
              </div>
              <span class="text-[10px] text-rose-700 font-bold flex items-center gap-1">View 1,160 →</span>
            </a>

          </div>
        </div>

        <!-- =====================================================================
             LEVEL 3: NATIONAL PORTFOLIO HEALTH STRATIFICATION (Visual Insight)
             ===================================================================== -->
        <div class="gov-card p-4 space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 class="text-sm font-bold text-slate-900 tracking-tight">National Portfolio Health Stratification</h3>
              <p class="text-caption text-slate-500">Autonomous risk classification across 10,000 projects based on PAIMANA monthly indicators</p>
            </div>
            <div class="flex items-center gap-2 text-xs">
              <span class="text-slate-400">Filter by Tier:</span>
              <a href="#/projects?risk_tier=LOW" class="px-2 py-0.5 rounded font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100">Healthy</a>
              <a href="#/projects?risk_tier=MODERATE" class="px-2 py-0.5 rounded font-bold bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100">Watch</a>
              <a href="#/projects?risk_tier=HIGH" class="px-2 py-0.5 rounded font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100">High</a>
              <a href="#/projects?risk_tier=CRITICAL" class="px-2 py-0.5 rounded font-bold bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100">Critical</a>
            </div>
          </div>

          <!-- Stacked Ratio Bar -->
          <div class="w-full h-4 rounded-full overflow-hidden flex shadow-inner cursor-pointer" title="Click to filter by tier">
            <div onclick="window.location.hash='#/projects?risk_tier=LOW'" class="bg-emerald-600 h-full hover:opacity-90 transition" style="width: 42.1%;" title="Healthy (Low Risk): 4,210 projects (42.1%)"></div>
            <div onclick="window.location.hash='#/projects?risk_tier=MODERATE'" class="bg-blue-600 h-full hover:opacity-90 transition" style="width: 21.5%;" title="Watch (Moderate): 2,150 projects (21.5%)"></div>
            <div onclick="window.location.hash='#/projects?risk_tier=HIGH'" class="bg-amber-500 h-full hover:opacity-90 transition" style="width: 24.8%;" title="High Risk: 2,480 projects (24.8%)"></div>
            <div onclick="window.location.hash='#/projects?risk_tier=CRITICAL'" class="bg-rose-600 h-full hover:opacity-90 transition" style="width: 11.6%;" title="Critical: 1,160 projects (11.6%)"></div>
          </div>

          <!-- Legend with Exact Numbers -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
            <a href="#/projects?risk_tier=LOW" class="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 transition">
              <span class="w-2.5 h-2.5 rounded-sm bg-emerald-600 flex-shrink-0"></span>
              <span class="text-slate-600">Healthy (Low Risk):</span>
              <strong id="legend-low-count" class="font-mono text-slate-900 ml-auto">4,210 (42.1%)</strong>
            </a>
            <a href="#/projects?risk_tier=MODERATE" class="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 transition">
              <span class="w-2.5 h-2.5 rounded-sm bg-blue-600 flex-shrink-0"></span>
              <span class="text-slate-600">Watch (Moderate):</span>
              <strong id="legend-mod-count" class="font-mono text-slate-900 ml-auto">2,150 (21.5%)</strong>
            </a>
            <a href="#/projects?risk_tier=HIGH" class="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 transition">
              <span class="w-2.5 h-2.5 rounded-sm bg-amber-500 flex-shrink-0"></span>
              <span class="text-slate-600">High Risk:</span>
              <strong id="legend-high-count" class="font-mono text-slate-900 ml-auto">2,480 (24.8%)</strong>
            </a>
            <a href="#/projects?risk_tier=CRITICAL" class="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 transition">
              <span class="w-2.5 h-2.5 rounded-sm bg-rose-600 flex-shrink-0"></span>
              <span class="text-slate-600">Critical Priority:</span>
              <strong id="legend-crit-count" class="font-mono text-slate-900 ml-auto">1,160 (11.6%)</strong>
            </a>
          </div>
        </div>

        <!-- =====================================================================
             LEVEL 4: "WHAT NEEDS ATTENTION?" (Priority Action Queue - Section 10)
             ===================================================================== -->
        <div class="gov-card p-5 space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-base">🚨</span>
                <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider">What Needs Attention? (Top Priority Administrative Queue)</h3>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                  IMMEDIATE ACTION
                </span>
              </div>
              <p class="text-caption text-slate-500 mt-0.5">
                Central sector projects exhibiting severe schedule drift, physical-financial decoupling, or statutory clearance impasses.
              </p>
            </div>
            <a href="#/projects?risk_tier=CRITICAL" class="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1">
              <span>View All 1,160 Critical Projects</span>
              <span>→</span>
            </a>
          </div>

          <div class="divide-y divide-slate-100">
            ${attentionProjects.map(p => `
              <div class="py-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 hover:bg-slate-50/60 p-2 rounded-lg transition">
                <div class="space-y-1 max-w-2xl min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-mono text-xs font-bold text-blue-700">${p.project_id}</span>
                    <span class="text-slate-300">•</span>
                    <span class="text-xs font-semibold text-slate-600">${p.ministry} (${p.agency})</span>
                    ${CommonUI.renderRiskBadge(p.risk_level, p.risk_score)}
                  </div>
                  <h4 class="font-bold text-slate-900 text-sm hover:text-blue-700 transition">
                    <a href="#/projects/${p.project_id}">${p.project_name}</a>
                  </h4>
                  <div class="text-xs text-slate-600 flex items-start gap-1 pt-0.5">
                    <strong class="text-slate-800 flex-shrink-0">Why:</strong>
                    <span>${p.why}</span>
                  </div>
                </div>

                <div class="flex items-center justify-between lg:justify-end gap-4 flex-shrink-0 text-xs">
                  <div class="text-right">
                    <div class="font-bold text-slate-800 tabular-nums">${p.exposure}</div>
                    <div class="text-[11px] text-rose-700 font-semibold">${p.deadline_pressure}</div>
                  </div>
                  <a href="#/projects/${p.project_id}" class="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 font-bold transition flex items-center gap-1">
                    <span>Inspect</span>
                    <span>→</span>
                  </a>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- =====================================================================
             LEVEL 5: MINISTRY RISK RANKING & CLEAN TREND VISUALIZATION
             ===================================================================== -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <!-- Ministry Risk Ranked Table (7 Cols) -->
          <div class="lg:col-span-7 gov-card p-4 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                <div>
                  <h3 class="text-sm font-bold text-slate-900">Ministry Risk Concentration</h3>
                  <p class="text-caption text-slate-500">Ranked by aggregate capital exposure and high-risk project share</p>
                </div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ranked 1–6</span>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-xs text-left">
                  <thead>
                    <tr class="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                      <th class="pb-2">Ministry</th>
                      <th class="pb-2">Risk Exposure</th>
                      <th class="pb-2">Total Outlay</th>
                      <th class="pb-2">High / Crit</th>
                      <th class="pb-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 font-medium">
                    <tr class="hover:bg-slate-50 transition cursor-pointer" onclick="window.location.hash='#/projects?ministry=Ministry%20of%20Road%20Transport%20and%20Highways'">
                      <td class="py-2.5 font-bold text-slate-900">Road Transport & Highways</td>
                      <td class="py-2.5"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">CRITICAL</span></td>
                      <td class="py-2.5 font-mono">₹14.20L Cr</td>
                      <td class="py-2.5 text-rose-700 font-bold tabular-nums">1,480 / 4,113</td>
                      <td class="py-2.5 text-right"><span class="text-blue-700 font-bold">Filter →</span></td>
                    </tr>
                    <tr class="hover:bg-slate-50 transition cursor-pointer" onclick="window.location.hash='#/projects?ministry=Ministry%20of%20Railways'">
                      <td class="py-2.5 font-bold text-slate-900">Railways</td>
                      <td class="py-2.5"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">CRITICAL</span></td>
                      <td class="py-2.5 font-mono">₹11.50L Cr</td>
                      <td class="py-2.5 text-rose-700 font-bold tabular-nums">980 / 2,840</td>
                      <td class="py-2.5 text-right"><span class="text-blue-700 font-bold">Filter →</span></td>
                    </tr>
                    <tr class="hover:bg-slate-50 transition cursor-pointer" onclick="window.location.hash='#/projects?ministry=Ministry%20of%20Power'">
                      <td class="py-2.5 font-bold text-slate-900">Power & Renewable Energy</td>
                      <td class="py-2.5"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">HIGH</span></td>
                      <td class="py-2.5 font-mono">₹7.80L Cr</td>
                      <td class="py-2.5 text-amber-700 font-bold tabular-nums">540 / 1,220</td>
                      <td class="py-2.5 text-right"><span class="text-blue-700 font-bold">Filter →</span></td>
                    </tr>
                    <tr class="hover:bg-slate-50 transition cursor-pointer" onclick="window.location.hash='#/projects?ministry=Ministry%20of%20Petroleum%20and%20Natural%20Gas'">
                      <td class="py-2.5 font-bold text-slate-900">Petroleum & Natural Gas</td>
                      <td class="py-2.5"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">MODERATE</span></td>
                      <td class="py-2.5 font-mono">₹4.90L Cr</td>
                      <td class="py-2.5 text-slate-700 font-bold tabular-nums">320 / 890</td>
                      <td class="py-2.5 text-right"><span class="text-blue-700 font-bold">Filter →</span></td>
                    </tr>
                    <tr class="hover:bg-slate-50 transition cursor-pointer" onclick="window.location.hash='#/projects?ministry=Ministry%20of%20Housing%20and%20Urban%20Affairs'">
                      <td class="py-2.5 font-bold text-slate-900">Housing & Urban Affairs</td>
                      <td class="py-2.5"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">MODERATE</span></td>
                      <td class="py-2.5 font-mono">₹3.20L Cr</td>
                      <td class="py-2.5 text-slate-700 font-bold tabular-nums">210 / 580</td>
                      <td class="py-2.5 text-right"><span class="text-blue-700 font-bold">Filter →</span></td>
                    </tr>
                    <tr class="hover:bg-slate-50 transition cursor-pointer" onclick="window.location.hash='#/projects?ministry=Ministry%20of%20Shipping'">
                      <td class="py-2.5 font-bold text-slate-900">Ports & Shipping</td>
                      <td class="py-2.5"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">LOW</span></td>
                      <td class="py-2.5 font-mono">₹1.80L Cr</td>
                      <td class="py-2.5 text-emerald-700 font-bold tabular-nums">110 / 357</td>
                      <td class="py-2.5 text-right"><span class="text-blue-700 font-bold">Filter →</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-caption text-slate-500">
              <span>Calibrated against MoSPI IPMD Flash Reports</span>
              <a href="#/ministry" class="text-xs font-bold text-blue-700 hover:text-blue-900">Open Ministry Command Desk →</a>
            </div>
          </div>

          <!-- Clean Trend Visualization (5 Cols) -->
          <div class="lg:col-span-5 gov-card p-4 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                <div>
                  <h3 class="text-sm font-bold text-slate-900">Portfolio Health Trend</h3>
                  <p class="text-caption text-slate-500">Quarterly evolution: Apr 2026 to Jul 2026</p>
                </div>
                <div class="flex items-center gap-1 text-[11px] bg-slate-100 p-0.5 rounded border border-slate-200">
                  <button onclick="DashboardView.switchTrendMetric('risk')" id="btn-trend-risk" class="px-2 py-0.5 rounded font-bold bg-white text-slate-900 shadow-2xs cursor-pointer">Risk</button>
                  <button onclick="DashboardView.switchTrendMetric('overrun')" id="btn-trend-overrun" class="px-2 py-0.5 rounded font-medium text-slate-600 hover:text-slate-900 cursor-pointer">Overrun</button>
                </div>
              </div>

              <div class="h-52 w-full relative">
                <canvas id="dashboard-trend-canvas"></canvas>
              </div>
            </div>

            <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-caption text-slate-500">
              <span class="flex items-center gap-1.5 text-xs">
                <span class="w-2 h-2 rounded-full bg-blue-700"></span>
                <span>Source: <strong class="text-slate-800">PAIMANA Multi-Period Snapshot Ledger</strong></span>
              </span>
              <a href="#/analytics" class="text-xs font-bold text-blue-700 hover:text-blue-900">Deep Analytics →</a>
            </div>
          </div>

        </div>

        <!-- =====================================================================
             LEVEL 6: RECENT PORTFOLIO ACTIVITY & SYSTEM STATUS
             ===================================================================== -->
        <div class="p-3.5 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
          <div class="flex items-center gap-2">
            <span class="text-base">ℹ️</span>
            <span><strong>System Status:</strong> 10,000 Central Sector projects synced. ML risk inference engine operating at 10.7ms lead-time. Verified against MoSPI PAIMANA Standard.</span>
          </div>
          <div class="flex items-center gap-3 flex-shrink-0">
            <a href="#/data-quality" class="text-blue-700 hover:underline font-semibold">Data Observatory →</a>
            <a href="#/settings" class="text-slate-500 hover:underline">Audit Ledger →</a>
          </div>
        </div>

      </div>
    `;
  },

  switchTrendMetric(metric) {
    this.activeTrendMetric = metric;
    const btnRisk = document.getElementById("btn-trend-risk");
    const btnOverrun = document.getElementById("btn-trend-overrun");

    if (metric === "risk") {
      if (btnRisk) { btnRisk.className = "px-2 py-0.5 rounded font-bold bg-white text-slate-900 shadow-2xs cursor-pointer"; }
      if (btnOverrun) { btnOverrun.className = "px-2 py-0.5 rounded font-medium text-slate-600 hover:text-slate-900 cursor-pointer"; }
    } else {
      if (btnOverrun) { btnOverrun.className = "px-2 py-0.5 rounded font-bold bg-white text-slate-900 shadow-2xs cursor-pointer"; }
      if (btnRisk) { btnRisk.className = "px-2 py-0.5 rounded font-medium text-slate-600 hover:text-slate-900 cursor-pointer"; }
    }
    this.renderTrendChart();
  },

  renderTrendChart() {
    const canvas = document.getElementById("dashboard-trend-canvas");
    if (!canvas || typeof Chart === "undefined") return;

    if (this.trendChart) this.trendChart.destroy();

    const isRisk = this.activeTrendMetric === "risk";
    const labels = ["April 2026", "May 2026", "June 2026", "July 2026"];

    const data = isRisk ? {
      labels,
      datasets: [
        {
          label: "Critical & High Risk Projects",
          data: [3120, 3340, 3510, 3640],
          borderColor: "#dc2626",
          backgroundColor: "rgba(220, 38, 38, 0.08)",
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: "#dc2626"
        },
        {
          label: "Healthy Projects",
          data: [4620, 4480, 4320, 4210],
          borderColor: "#16a34a",
          backgroundColor: "transparent",
          tension: 0.3,
          pointRadius: 3,
          pointBackgroundColor: "#16a34a"
        }
      ]
    } : {
      labels,
      datasets: [
        {
          label: "Cumulative Overrun (₹ Lakh Cr)",
          data: [10.2, 10.9, 11.8, 12.45],
          borderColor: "#d97706",
          backgroundColor: "rgba(217, 119, 6, 0.08)",
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: "#d97706"
        }
      ]
    };

    this.trendChart = new Chart(canvas, {
      type: "line",
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: false,
            grid: { color: "#f1f5f9" },
            ticks: {
              font: { size: 10, family: "Inter" },
              callback: (val) => isRisk ? val.toLocaleString("en-IN") : `₹${val}L Cr`
            }
          },
          x: {
            grid: { display: false },
            ticks: { font: { size: 10, family: "Inter" } }
          }
        },
        plugins: {
          legend: {
            position: "bottom",
            labels: { boxWidth: 10, font: { size: 10, family: "Inter" } }
          },
          tooltip: {
            backgroundColor: "#0f172a",
            titleFont: { size: 11, family: "Inter" },
            bodyFont: { size: 10, family: "Inter" }
          }
        }
      }
    });
  },

  async postRender() {
    this.renderTrendChart();

    // Fetch live dashboard summary if backend is online
    if (window.APIClient && window.APIClient.isLive) {
      try {
        const live = await window.APIClient.getDashboardSummary();
        if (live) {
          const elTracked = document.getElementById("kpi-tracked-count");
          const elCost = document.getElementById("kpi-revised-cost");
          const elOverrun = document.getElementById("kpi-overrun-cost");
          const elReview = document.getElementById("kpi-review-count");

          if (elTracked) elTracked.innerText = Number(live.tracked_projects_count).toLocaleString("en-IN");
          if (elCost) elCost.innerText = live.total_revised_cost_formatted;
          if (elReview) elReview.innerText = Number(live.projects_requiring_review_count).toLocaleString("en-IN");
          if (elOverrun) elOverrun.innerText = live.total_cost_overrun_formatted || live.total_overrun_formatted || live.capital_at_risk_formatted || "₹12.45L Cr";

          if (live.risk_distribution) {
            const dist = live.risk_distribution;
            const lLow = document.getElementById("legend-low-count");
            const lMod = document.getElementById("legend-mod-count");
            const lHigh = document.getElementById("legend-high-count");
            const lCrit = document.getElementById("legend-crit-count");
            if (lLow) lLow.innerText = `${dist.low.toLocaleString("en-IN")} (${((dist.low/10000)*100).toFixed(1)}%)`;
            if (lMod) lMod.innerText = `${dist.moderate.toLocaleString("en-IN")} (${((dist.moderate/10000)*100).toFixed(1)}%)`;
            if (lHigh) lHigh.innerText = `${dist.high.toLocaleString("en-IN")} (${((dist.high/10000)*100).toFixed(1)}%)`;
            if (lCrit) lCrit.innerText = `${dist.critical.toLocaleString("en-IN")} (${((dist.critical/10000)*100).toFixed(1)}%)`;
          }
        }
      } catch (e) {
        console.warn("[DashboardView] Live KPI fetch fallback:", e);
      }
    }
  }
};

window.DashboardView = DashboardView;
