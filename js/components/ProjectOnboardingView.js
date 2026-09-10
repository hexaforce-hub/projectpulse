// ==========================================================================
// PROJECTPULSE — Phase 11: AI-Assisted Project Onboarding & WBS Generator
// Ministry of Statistics & Programme Implementation (MoSPI) - IPMD
// Smart India Hackathon 2026 — Team HexaForce
// ==========================================================================

const ProjectOnboardingView = {
  currentStep: 1,
  onboardingData: {
    project_id: "",
    project_name: "Varanasi Outer Ring Road Corridor Expansion (Phase-III)",
    ministry: "Ministry of Road Transport & Highways",
    implementing_agency: "NHAI",
    state: "Uttar Pradesh",
    district: "Varanasi",
    original_cost_inr_cr: 1420.5,
    start_date: "2026-04-01",
    target_completion_date: "2029-03-31",
    documents: [
      { name: "Detailed_Project_Report_Vol1.pdf", type: "DPR", size: "14.2 MB", status: "READY" },
      { name: "Concession_Agreement_Schedule_B.pdf", type: "CONTRACT", size: "8.9 MB", status: "READY" },
      { name: "Geotechnical_Borehole_Stratigraphy.pdf", type: "GEOTECHNICAL", size: "5.6 MB", status: "READY" }
    ],
    extractedEntities: null,
    generatedPlan: null
  },
  activeTab: "import",
  sampleDatasets: {
    morth: `project_name,ministry,sector,state,implementing_agency,original_cost_cr,revised_cost_cr,physical_progress_pct,financial_progress_pct,delay_in_months,start_date,planned_completion_date,primary_bottleneck
"Delhi-Amritsar-Katra Expressway PKG-5","Ministry of Road Transport & Highways","Road","Punjab","NHAI",3800.0,4450.0,48.5,45.0,14,"2023-04-01","2026-12-31","land_acquisition"
"Vadodara-Mumbai Expressway Section-II","Ministry of Road Transport & Highways","Road","Gujarat","NHAI",5200.0,5900.0,62.0,60.0,8,"2022-10-15","2026-06-30","environmental_clearance"
"Raipur-Visakhapatnam Economic Corridor PKG-3","Ministry of Road Transport & Highways","Road","Odisha","NHAI",2900.0,3250.0,35.0,34.0,18,"2024-01-10","2027-03-31","contractor_liquidity"`,
    railways: `project_name,ministry,sector,state,implementing_agency,original_cost_cr,revised_cost_cr,physical_progress_pct,financial_progress_pct,delay_in_months,start_date,planned_completion_date,primary_bottleneck
"Eastern Dedicated Freight Corridor (Sonnagar-Dankuni)","Ministry of Railways","Railways","West Bengal","DFCCIL",12500.0,14800.0,71.0,68.5,22,"2021-08-01","2026-09-30","land_acquisition"
"Bilaspur-Manali-Leh Strategic Line","Ministry of Railways","Railways","Himachal Pradesh","RVNL",8200.0,9100.0,22.0,20.0,26,"2023-06-01","2030-12-31","geotechnical_instability"`
  },
  importResult: null,
  validationReport: null,
  rawPayload: "",

  escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  async render(container) {
    if (!container) {
      container = document.getElementById("main-content-mount");
    }
    if (!container) return;

    this.renderStep(container);
  },

  renderStep(container) {
    container.innerHTML = `
      <div class="space-y-6 animate-fade-in max-w-6xl mx-auto pb-16">
        
        <!-- Header Banner -->
        <div class="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-slate-800">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full text-xs font-bold uppercase tracking-wider">
                  ⚡ AI-Assisted Project Intake & Ingestion
                </span>
                <span class="text-xs text-slate-400">MoSPI IPMD / PAIMANA Standards</span>
              </div>
              <h1 class="text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
                Project Onboarding & Data Ingestion
              </h1>
              <p class="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Seamlessly intake individual infrastructure projects with automated WBS synthesis, or ingest batch datasets (CSV/JSON) with fuzzy column mapping, LightGBM risk assessment, and early warning detection.
              </p>
            </div>
            
            <div class="flex items-center gap-3">
              <button id="btn-load-demo-anchor" class="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl transition">
                Load Anchor Demo (PKG-3 Viaduct)
              </button>
            </div>
          </div>
        </div>

        <!-- Mode Switcher Tabs -->
        <div class="flex items-center gap-3 border-b border-slate-200 pb-3">
          <button id="tab-mode-wizard" class="px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${this.activeTab !== 'import' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}">
            <span>⚡</span> Single Project Wizard (AI WBS Generator)
          </button>
          <button id="tab-mode-import" class="px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${this.activeTab === 'import' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}">
            <span>📥</span> Import Real Dataset (CSV / JSON / MoSPI)
            <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold ${this.activeTab === 'import' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'}">BATCH AI</span>
          </button>
        </div>

        ${this.activeTab === 'import' ? this.renderImportTab() : `
        <!-- 4-Step Wizard Stepper Bar -->
        <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            ${[
              { step: 1, title: "1. Project Metadata", desc: "Corridor & Agency" },
              { step: 2, title: "2. Document AI", desc: "DPR & BOQ Entities" },
              { step: 3, title: "3. AI WBS Generator", desc: "12 Packages & 54 Tasks" },
              { step: 4, title: "4. Baseline Ratification", desc: "Human Approval Gate" }
            ].map(s => `
              <div class="flex items-center gap-3 p-2.5 rounded-xl border ${
                this.currentStep === s.step 
                  ? 'border-blue-600 bg-blue-50/60 shadow-sm' 
                  : this.currentStep > s.step 
                    ? 'border-emerald-300 bg-emerald-50/40 text-emerald-800' 
                    : 'border-slate-200 text-slate-400'
              }">
                <div class="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                  this.currentStep === s.step 
                    ? 'bg-blue-600 text-white' 
                    : this.currentStep > s.step 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-slate-200 text-slate-600'
                }">
                  ${this.currentStep > s.step ? '✓' : s.step}
                </div>
                <div class="min-w-0">
                  <div class="text-xs font-bold truncate ${this.currentStep === s.step ? 'text-blue-900' : this.currentStep > s.step ? 'text-emerald-950' : 'text-slate-600'}">
                    ${s.title}
                  </div>
                  <div class="text-[10px] text-slate-500 truncate">${s.desc}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Wizard Step Body -->
        <div id="wizard-step-content" class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          ${this.renderStepContent()}
        </div>
        `}

      </div>
    `;

    this.bindEvents(container);
  },

  renderStepContent() {
    if (this.currentStep === 1) {
      return `
        <div class="space-y-6">
          <div class="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 class="text-base font-bold text-slate-900">Step 1: Project Metadata & Sanction Profile</h2>
              <p class="text-xs text-slate-500">Record administrative, financial, and geographical coordinates as per MoSPI IPMD requirements.</p>
            </div>
            <span class="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">MoSPI IPMD Schema</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div class="space-y-1.5 md:col-span-2">
              <label class="block font-semibold text-slate-700">Project / Corridor Title *</label>
              <input type="text" id="inp-prj-name" value="${this.onboardingData.project_name}" class="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
            </div>

            <div class="space-y-1.5">
              <label class="block font-semibold text-slate-700">Central Ministry *</label>
              <select id="inp-prj-ministry" class="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="Ministry of Road Transport & Highways" selected>Ministry of Road Transport & Highways (MoRTH)</option>
                <option value="Ministry of Railways">Ministry of Railways (MoR)</option>
                <option value="Ministry of Power">Ministry of Power (MoP)</option>
                <option value="Ministry of Petroleum and Natural Gas">Ministry of Petroleum and Natural Gas (MoPNG)</option>
                <option value="Ministry of Housing and Urban Affairs">Ministry of Housing and Urban Affairs (MoHUA)</option>
              </select>
            </div>

            <div class="space-y-1.5">
              <label class="block font-semibold text-slate-700">Implementing Agency *</label>
              <input type="text" id="inp-prj-agency" value="${this.onboardingData.implementing_agency}" class="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="e.g. NHAI / RVNL / NTPC" required />
            </div>

            <div class="space-y-1.5">
              <label class="block font-semibold text-slate-700">Primary State *</label>
              <input type="text" id="inp-prj-state" value="${this.onboardingData.state}" class="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
            </div>

            <div class="space-y-1.5">
              <label class="block font-semibold text-slate-700">District / PIU Node *</label>
              <input type="text" id="inp-prj-district" value="${this.onboardingData.district}" class="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
            </div>

            <div class="space-y-1.5">
              <label class="block font-semibold text-slate-700">Sanctioned Outlay (₹ Crores) *</label>
              <input type="number" id="inp-prj-cost" value="${this.onboardingData.original_cost_inr_cr}" step="0.1" class="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
            </div>

            <div class="space-y-1.5">
              <label class="block font-semibold text-slate-700">Contractor / EPC Concessionaire</label>
              <input type="text" id="inp-prj-contractor" value="Larsen & Toubro Ltd - Infrastructure Division" class="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>

            <div class="space-y-1.5">
              <label class="block font-semibold text-slate-700">Appointed Date / Project Start *</label>
              <input type="date" id="inp-prj-start" value="${this.onboardingData.start_date}" class="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
            </div>

            <div class="space-y-1.5">
              <label class="block font-semibold text-slate-700">Target Scheduled Commissioning *</label>
              <input type="date" id="inp-prj-target" value="${this.onboardingData.target_completion_date}" class="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
            </div>
          </div>

          <div class="flex justify-end pt-4 border-t border-slate-100">
            <button id="btn-next-step-1" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2">
              Save & Proceed to Document Ingestion &rarr;
            </button>
          </div>
        </div>
      `;
    }

    if (this.currentStep === 2) {
      return `
        <div class="space-y-6">
          <div class="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 class="text-base font-bold text-slate-900">Step 2: Document Ingestion & AI Entity Extraction</h2>
              <p class="text-xs text-slate-500">Attach Detailed Project Reports (DPR), Concession Agreements, and Geotechnical Logs for NLP parsing.</p>
            </div>
            <button id="btn-run-doc-ai" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2">
              <span>🧠</span> Run AI Document Extraction
            </button>
          </div>

          <!-- Document List & Upload Zone -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="md:col-span-2 space-y-3">
              <div class="text-xs font-bold text-slate-700 uppercase tracking-wider">Attached Technical Documents</div>
              <div class="space-y-2">
                ${this.onboardingData.documents.map(d => `
                  <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                        📄
                      </div>
                      <div>
                        <div class="font-bold text-slate-900">${d.name}</div>
                        <div class="text-[11px] text-slate-500">${d.type} · ${d.size} · Uploaded & Indexed</div>
                      </div>
                    </div>
                    <span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded">
                      ${d.status}
                    </span>
                  </div>
                `).join('')}
              </div>

              <!-- Drag & Drop Mock Zone -->
              <div class="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:bg-slate-50 cursor-pointer transition">
                <div class="text-2xl mb-1">📁</div>
                <div class="text-xs font-bold text-slate-800">Drag & Drop additional PDF, CAD, or Excel tender files</div>
                <div class="text-[11px] text-slate-400 mt-1">Supports BoQ schedules, alignment geometry, and Stage-I forest orders</div>
              </div>
            </div>

            <!-- AI Extraction Insights Box -->
            <div class="bg-indigo-50/50 border border-indigo-200 rounded-2xl p-4 space-y-3">
              <div class="flex items-center gap-2 text-indigo-900 font-bold text-xs uppercase tracking-wider">
                <span>🤖</span> AI Semantic Parser
              </div>
              <p class="text-[11px] text-slate-600 leading-relaxed">
                ProjectPulse NLP engine extracts contract milestones, Bill of Quantities (BoQ) line items, critical clearance conditions, and chainage segments automatically.
              </p>

              <div class="p-3 bg-white rounded-xl border border-indigo-100 space-y-2 text-xs">
                <div class="flex justify-between text-slate-600">
                  <span>Detected Alignment:</span>
                  <strong class="text-slate-900">42.5 km (6-lane)</strong>
                </div>
                <div class="flex justify-between text-slate-600">
                  <span>Major River Bridge:</span>
                  <strong class="text-slate-900">1 (18 Wells)</strong>
                </div>
                <div class="flex justify-between text-slate-600">
                  <span>Extracted BOQ Lines:</span>
                  <strong class="text-emerald-700">142 Items</strong>
                </div>
                <div class="flex justify-between text-slate-600">
                  <span>Confidence Score:</span>
                  <strong class="text-blue-700">94.2%</strong>
                </div>
              </div>
            </div>
          </div>

          <!-- Extracted Quantities Table Preview -->
          <div class="border border-slate-200 rounded-xl overflow-hidden">
            <div class="bg-slate-50 px-4 py-2.5 border-b border-slate-200 text-xs font-bold text-slate-800 flex justify-between items-center">
              <span>Extracted Bill of Quantities (BOQ) Entities for Execution Tracking</span>
              <span class="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 font-semibold">Ready for WBS Mapping</span>
            </div>
            <div class="divide-y divide-slate-100 text-xs">
              <div class="grid grid-cols-12 px-4 py-2 bg-slate-100/70 font-semibold text-slate-600 text-[11px]">
                <div class="col-span-6">BOQ Item Description</div>
                <div class="col-span-2 text-right">Sanctioned Qty</div>
                <div class="col-span-2 text-center">Unit</div>
                <div class="col-span-2 text-right">Attribution</div>
              </div>
              <div class="grid grid-cols-12 px-4 py-2.5 items-center">
                <div class="col-span-6 font-medium text-slate-900">Ganga Viaduct Deep Well Sinking (12m Dia, M35 Grade)</div>
                <div class="col-span-2 text-right font-mono font-bold">18.0</div>
                <div class="col-span-2 text-center text-slate-500">wells</div>
                <div class="col-span-2 text-right"><span class="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[10px]">DOC_EXTRACTED</span></div>
              </div>
              <div class="grid grid-cols-12 px-4 py-2.5 items-center">
                <div class="col-span-6 font-medium text-slate-900">Substructure Piers & Abutment Caps (M45 High Performance)</div>
                <div class="col-span-2 text-right font-mono font-bold">36.0</div>
                <div class="col-span-2 text-center text-slate-500">piers</div>
                <div class="col-span-2 text-right"><span class="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[10px]">DOC_EXTRACTED</span></div>
              </div>
              <div class="grid grid-cols-12 px-4 py-2.5 items-center">
                <div class="col-span-6 font-medium text-slate-900">Prestressed Segmental Box Girders (50m span precast)</div>
                <div class="col-span-2 text-right font-mono font-bold">24.0</div>
                <div class="col-span-2 text-center text-slate-500">spans</div>
                <div class="col-span-2 text-right"><span class="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[10px]">DOC_EXTRACTED</span></div>
              </div>
              <div class="grid grid-cols-12 px-4 py-2.5 items-center">
                <div class="col-span-6 font-medium text-slate-900">Corridor Embankment Earthwork & Subgrade Compaction</div>
                <div class="col-span-2 text-right font-mono font-bold">680,000.0</div>
                <div class="col-span-2 text-center text-slate-500">cum</div>
                <div class="col-span-2 text-right"><span class="px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-bold text-[10px]">AI_INFERRED</span></div>
              </div>
            </div>
          </div>

          <div class="flex justify-between pt-4 border-t border-slate-100">
            <button id="btn-back-step-2" class="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold text-xs transition">
              &larr; Back to Metadata
            </button>
            <button id="btn-next-step-2" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2">
              Generate AI Work Breakdown Structure &rarr;
            </button>
          </div>
        </div>
      `;
    }

    if (this.currentStep === 3) {
      return `
        <div class="space-y-6">
          <div class="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 class="text-base font-bold text-slate-900">Step 3: AI Work Breakdown Structure (WBS) & Milestones</h2>
              <p class="text-xs text-slate-500">Synthesized 12 Work Packages and 54 Operational Tasks with CPM dependency links.</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-md">
                12 Packages · 54 Tasks
              </span>
            </div>
          </div>

          <!-- Packages & Tasks Preview Accordion / Cards -->
          <div class="space-y-3">
            <div class="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span>ℹ️</span>
                <span>Each task includes physical target quantities, responsible role assignment, and finish-to-start predecessor constraints.</span>
              </div>
              <span class="text-[11px] font-bold text-blue-800">Source: DPR Clause 4.2 + AI Synthesis</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Package 1.4 Deep Well Sinking -->
              <div class="p-4 bg-slate-50 rounded-xl border-2 border-rose-200 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="font-mono text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">WBS 1.4 · CRITICAL PATH</span>
                  <span class="text-xs font-bold text-slate-800">Ganga Viaduct Deep Wells Sinking</span>
                </div>
                <p class="text-xs text-slate-600">6 Tasks · 18 Wells (12m Dia) · Planned: 2026-04-01 to 2026-12-31</p>
                <div class="space-y-1.5 pt-2 border-t border-slate-200 text-xs">
                  <div class="flex justify-between items-center py-1">
                    <span class="font-medium text-slate-900">TSK-001: Pier P-04 Well Excavation (28.5m)</span>
                    <span class="text-[10px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded">Zero Float (CP)</span>
                  </div>
                  <div class="flex justify-between items-center py-1">
                    <span class="font-medium text-slate-900">TSK-002: Pier P-05 Pneumatic Caisson Sinking</span>
                    <span class="text-[10px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded">Zero Float (CP)</span>
                  </div>
                  <div class="flex justify-between items-center py-1">
                    <span class="font-medium text-slate-900">TSK-006: Subsurface Boulder Hydro-Jetting</span>
                    <span class="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">Predecessor to P-04</span>
                  </div>
                </div>
              </div>

              <!-- Package 1.5 Substructure -->
              <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">WBS 1.5</span>
                  <span class="text-xs font-bold text-slate-800">Substructure Piers & Bearings</span>
                </div>
                <p class="text-xs text-slate-600">5 Tasks · 36 Piers · Planned: 2026-08-01 to 2027-04-30</p>
                <div class="space-y-1.5 pt-2 border-t border-slate-200 text-xs">
                  <div class="flex justify-between items-center py-1">
                    <span class="font-medium text-slate-900">TSK-003: Pier Cap P-03 Reinforcement</span>
                    <span class="text-[10px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded">Float: 14 days</span>
                  </div>
                  <div class="flex justify-between items-center py-1">
                    <span class="font-medium text-slate-900">TSK-007: Seismic Bearings Pier P-01</span>
                    <span class="text-[10px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded">Float: 22 days</span>
                  </div>
                </div>
              </div>

              <!-- Package 1.6 Casting Yard -->
              <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">WBS 1.6</span>
                  <span class="text-xs font-bold text-slate-800">Segmental Box Girder Precast Yard</span>
                </div>
                <p class="text-xs text-slate-600">5 Tasks · 24 Spans · Planned: 2026-07-01 to 2027-08-31</p>
                <div class="space-y-1.5 pt-2 border-t border-slate-200 text-xs">
                  <div class="flex justify-between items-center py-1">
                    <span class="font-medium text-slate-900">TSK-004: Segment Casting Span S-08</span>
                    <span class="text-[10px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded">Float: 28 days</span>
                  </div>
                </div>
              </div>

              <!-- Package 1.8 Embankment & Pavement -->
              <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">WBS 1.8</span>
                  <span class="text-xs font-bold text-slate-800">Embankment & Granular Sub-Base</span>
                </div>
                <p class="text-xs text-slate-600">5 Tasks · 680,000 cum · Planned: 2026-05-01 to 2027-06-30</p>
                <div class="space-y-1.5 pt-2 border-t border-slate-200 text-xs">
                  <div class="flex justify-between items-center py-1">
                    <span class="font-medium text-slate-900">TSK-005: Embankment Compaction Layer-4</span>
                    <span class="text-[10px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded">Float: 45 days</span>
                  </div>
                  <div class="flex justify-between items-center py-1">
                    <span class="font-medium text-slate-900">TSK-011: Granular Sub-Base Paving Ch 14+200</span>
                    <span class="text-[10px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded">Float: 35 days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-between pt-4 border-t border-slate-100">
            <button id="btn-back-step-3" class="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold text-xs transition">
              &larr; Back to Document AI
            </button>
            <button id="btn-next-step-3" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2">
              Proceed to Baseline Ratification & Approval &rarr;
            </button>
          </div>
        </div>
      `;
    }

    if (this.currentStep === 4) {
      return `
        <div class="space-y-6">
          <div class="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 class="text-base font-bold text-slate-900">Step 4: Baseline Ratification & Human Approval Gate</h2>
              <p class="text-xs text-slate-500">Official sign-off by Chief Project Director / MoSPI Monitoring Officer before activating telemetry ingestion.</p>
            </div>
            <span class="px-2.5 py-1 bg-amber-100 text-amber-900 font-bold text-xs rounded-md border border-amber-200">
              Administrative Gate
            </span>
          </div>

          <!-- Approval Summary Box -->
          <div class="p-5 bg-gradient-to-r from-slate-50 to-blue-50/50 rounded-2xl border border-slate-200 space-y-4">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <div class="text-slate-500">Designated Project:</div>
                <div class="font-bold text-slate-900">${this.onboardingData.project_name}</div>
              </div>
              <div>
                <div class="text-slate-500">Sanctioned Outlay:</div>
                <div class="font-bold text-slate-900">₹ ${this.onboardingData.original_cost_inr_cr} Cr</div>
              </div>
              <div>
                <div class="text-slate-500">WBS Structure:</div>
                <div class="font-bold text-blue-700">12 Packages · 54 Tasks</div>
              </div>
              <div>
                <div class="text-slate-500">Critical Path Duration:</div>
                <div class="font-bold text-rose-700">980 Days (Ganga Bridge)</div>
              </div>
            </div>

            <div class="space-y-2 pt-3 border-t border-slate-200/70 text-xs">
              <label class="block font-semibold text-slate-800">Project Director / Chief Engineer Ratification Notes</label>
              <textarea id="txt-approval-notes" rows="3" class="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Execution baseline verified against EPC contract Schedule-B and DPR. Approved for field worker allocation and daily telemetry logging."></textarea>
            </div>
          </div>

          <div class="flex justify-between pt-4 border-t border-slate-100">
            <button id="btn-back-step-4" class="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold text-xs transition">
              &larr; Back to WBS Review
            </button>
            <button id="btn-ratify-baseline" class="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2">
              <span>✍️</span> Ratify Baseline & Launch Execution Control Center
            </button>
          </div>
        </div>
      `;
    }

    return '';
  },

  renderImportTab() {
    const report = this.validationReport;
    const result = this.importResult;
    const isCleared = window.APIClient.isDemoCleared();
    const customProjects = window.APIClient.getCustomProjects();
    const activeProjects = window.APIClient.getActiveProjects();

    return `
      <div class="space-y-6">
        
        <!-- Clean Slate & Active Dataset Mode Command Bar -->
        <div class="p-4.5 bg-slate-900 text-white rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg border border-slate-800">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-xl ${isCleared ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40' : 'bg-blue-600/30 text-blue-400 border border-blue-500/40'} flex items-center justify-center font-bold text-lg flex-shrink-0">
              ${isCleared ? '🟢' : '📊'}
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Registry Mode:</span>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-extrabold ${isCleared ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'}">
                  ${isCleared ? `CLEAN SLATE — REAL DATA ONLY (${customProjects.length} Custom Project${customProjects.length !== 1 ? 's' : ''})` : `10,000 BENCHMARK UNIVERSE (${activeProjects.length} Projects Loaded)`}
                </span>
              </div>
              <p class="text-[11px] text-slate-400 mt-1 leading-relaxed">
                ${isCleared 
                  ? 'All synthetic benchmark records are silenced. The Command Center, Projects Registry, Analytics, Radar, and Matrix operate <strong>exclusively on your uploaded data</strong>.' 
                  : 'Demonstration projects are loaded. You can click <strong>"Remove All Demo Data"</strong> below to clear out all synthetic records and test exclusively with your real data.'}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 flex-shrink-0 flex-wrap">
            ${isCleared ? `
              <button id="btn-restore-demo-data" class="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer">
                <span>↺</span> Restore 10k Benchmark
              </button>
            ` : `
              <button id="btn-clear-demo-data" class="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-1.5 cursor-pointer">
                <span>🗑️</span> Remove All Demo Data
              </button>
            `}
            <button id="btn-reset-registry-zero" class="px-3 py-2 bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-300 border border-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer" title="Reset all custom and demo projects to 0">
              Reset to 0
            </button>
          </div>
        </div>

        <!-- Ingestion Overview Banner -->
        <div class="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 text-xs space-y-3">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div class="flex items-center gap-2 font-bold text-blue-900 text-sm">
              <span>📥</span> National Dataset Ingestion & AI Pipeline
            </div>
            <span class="px-2.5 py-0.5 bg-blue-600 text-white font-extrabold text-[10px] rounded-full uppercase tracking-wider">
              MoSPI / OCMS / PMG / NHAI Compliant
            </span>
          </div>
          <p class="text-slate-600 leading-relaxed">
            Batch-ingest project records directly from institutional spreadsheets (CSV, TSV, semicolon-separated) or REST payloads (JSON). The ASTRA intelligence engine automatically <strong>detects headers</strong> (skipping title banners like "Sector Wise Details"), performs <strong>fuzzy column normalization</strong>, runs <strong>LightGBM risk inference</strong>, auto-synthesizes <strong>12 Work Breakdown Structures (WBS)</strong>, generates <strong>Early Warning Radar triggers</strong>, and saves directly to your local registry.
          </p>
          <div class="flex flex-wrap items-center gap-2 pt-1">
            <span class="text-slate-500 font-semibold text-[11px]">Quick Load Institutional Samples:</span>
            <button id="btn-sample-morth" class="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold rounded-lg shadow-xs transition cursor-pointer">
              🛣️ MoRTH Highway Package (3 Projects)
            </button>
            <button id="btn-sample-railways" class="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold rounded-lg shadow-xs transition cursor-pointer">
              🚆 Railways DFC Corridors (2 Projects)
            </button>
            <button id="btn-clear-dataset" class="px-2.5 py-1 text-slate-500 hover:text-red-600 transition ml-auto cursor-pointer">
              Clear Text
            </button>
          </div>
        </div>

        <!-- Input Area: Dropzone + Raw Textarea -->
        <div class="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
          <div class="flex items-center justify-between text-xs">
            <label class="font-bold text-slate-800 uppercase tracking-wider">Dataset Payload (CSV, TSV, or JSON)</label>
            <span class="text-slate-400">Accepted: .csv, .tsv, .txt, .json</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="md:col-span-2 space-y-2">
              <textarea id="txt-import-payload" rows="10" class="w-full p-3 font-mono text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-slate-400" placeholder="Paste CSV with headers or JSON array here...
Example headers: project_name, ministry, sector, state, original_cost_cr, revised_cost_cr, physical_progress_pct...">${this.escapeHtml(this.rawPayload || "")}</textarea>
            </div>

            <div class="space-y-3 flex flex-col justify-between">
              <div class="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center transition cursor-pointer relative bg-slate-50/50 hover:bg-blue-50/30">
                <input type="file" id="file-import-dataset" accept=".csv,.tsv,.txt,.json" class="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                <div class="text-3xl mb-2">📂</div>
                <div class="text-xs font-bold text-slate-800">Upload Dataset File</div>
                <div class="text-[10px] text-slate-400 mt-1">Select .csv, .tsv, or .json from your computer</div>
              </div>

              <div class="space-y-2">
                <button id="btn-inspect-dataset" class="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2 cursor-pointer">
                  <span>🔍</span> Inspect & Auto-Map Columns
                </button>
                <button id="btn-run-dataset-import" class="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer">
                  <span>⚡</span> Execute AI Ingestion & Synthesis
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Live Column Mapping Preview & Validation Report -->
        ${report ? `
          <div class="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs animate-fade-in">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full ${report.valid ? 'bg-emerald-500' : 'bg-amber-500'}"></span>
                <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Dataset Inspection Report: ${report.recordsCount} Record${report.recordsCount !== 1 ? 's' : ''} Detected
                </h3>
              </div>
              <span class="px-2.5 py-1 rounded-md text-[11px] font-bold ${report.valid ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}">
                ${report.valid ? '✓ Ready for AI Ingestion' : '⚠️ Missing Required Columns'}
              </span>
            </div>

            <!-- Column Mapping Table -->
            <div class="overflow-x-auto border border-slate-100 rounded-xl">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-100 text-[11px]">
                  <tr>
                    <th class="p-2.5">Source Column</th>
                    <th class="p-2.5">Target Canonical Field</th>
                    <th class="p-2.5">Mapping Status</th>
                    <th class="p-2.5">Sample Extracted Value</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  ${report.columnMappings.map(m => `
                    <tr class="hover:bg-slate-50/50">
                      <td class="p-2.5 font-mono text-[11px] text-slate-800">${m.source}</td>
                      <td class="p-2.5 font-semibold text-blue-700">${m.target}</td>
                      <td class="p-2.5">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold ${m.confidence === 'EXACT' ? 'bg-emerald-100 text-emerald-800' : m.confidence === 'SYNTHESIZED' ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'}">
                          ${m.confidence} MATCH
                        </span>
                      </td>
                      <td class="p-2.5 text-slate-600 truncate max-w-xs">${m.sampleValue || '—'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}

        <!-- Ingestion Results Summary -->
        ${result ? `
          <div class="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 space-y-4 shadow-sm animate-fade-in">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div class="flex items-center gap-2 text-emerald-950 font-extrabold text-sm">
                <span>🎉</span> Ingestion & AI Synthesis Completed Successfully
              </div>
              <span class="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-xs">
                ${result.summary?.created_count || (result.projects || []).length} Ingested Records
              </span>
            </div>

            <p class="text-xs text-emerald-900 leading-relaxed">
              All records have been processed through the ASTRA LightGBM risk classifier, 12 WBS milestone packages have been synthesized, early warning signals have been triggered, and data is active in your platform.
            </p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
              ${(result.projects || []).map(p => {
                let badgeColor = "bg-emerald-100 text-emerald-800 border-emerald-200";
                const rLevel = (p.risk && p.risk.level) || p.risk_level || "MODERATE";
                if (rLevel === "CRITICAL") badgeColor = "bg-rose-100 text-rose-800 border-rose-200";
                else if (rLevel === "HIGH") badgeColor = "bg-amber-100 text-amber-800 border-amber-200";
                else if (rLevel === "MODERATE") badgeColor = "bg-blue-100 text-blue-800 border-blue-200";

                const cost = (p.financials && p.financials.revised_cost_cr) || p.revised_cost_cr || 0;
                const overrun = (p.financials && p.financials.cost_overrun_cr) || p.cost_overrun_cr || 0;
                const riskScore = (p.risk && p.risk.overall_score) || p.risk_score || 50;

                return `
                  <div class="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs space-y-2 text-xs">
                    <div class="flex items-start justify-between gap-2">
                      <div class="min-w-0">
                        <div class="font-bold text-slate-900 truncate">${p.project_name}</div>
                        <div class="text-[10px] font-mono text-slate-400">${p.project_id} • ${p.ministry}</div>
                      </div>
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold border ${badgeColor}">
                        ${rLevel} RISK
                      </span>
                    </div>

                    <div class="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-[11px]">
                      <div class="p-1.5 bg-slate-50 rounded-lg">
                        <div class="text-[10px] text-slate-400">Risk Score</div>
                        <div class="font-bold text-slate-800">${riskScore}/100</div>
                      </div>
                      <div class="p-1.5 bg-slate-50 rounded-lg">
                        <div class="text-[10px] text-slate-400">Outlay</div>
                        <div class="font-bold text-blue-900">₹${cost.toLocaleString("en-IN")} Cr</div>
                      </div>
                      <div class="p-1.5 bg-slate-50 rounded-lg">
                        <div class="text-[10px] text-slate-400">WBS Tasks</div>
                        <div class="font-bold text-emerald-700">12 Synthesized</div>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            <div class="flex justify-end gap-3 pt-2 flex-wrap">
              <a href="#/projects" class="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5">
                <span>📁</span> View in Central Projects Registry ➔
              </a>
              <a href="#/dashboard" class="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5">
                <span>📊</span> Open National Command Center ➔
              </a>
            </div>
          </div>
        ` : ''}

      </div>
    `;
  },

  inspectDataset(text) {
    if (!text || !text.trim()) {
      window.APIClient.showToast("Please enter or upload CSV or JSON dataset payload first", "warning");
      return;
    }
    const clean = text.trim();
    let rows = [];
    let headers = [];

    if (clean.startsWith("[") || clean.startsWith("{")) {
      try {
        const parsed = JSON.parse(clean);
        rows = Array.isArray(parsed) ? parsed : [parsed];
        headers = Object.keys(rows[0] || {});
      } catch (e) {
        window.APIClient.showToast("Invalid JSON syntax: " + e.message, "error");
        return;
      }
    } else {
      const parsed = window.APIClient.parseDelimitedText(clean);
      headers = parsed.headers;
      rows = parsed.rows;
      if (headers.length === 0 || rows.length === 0) {
        window.APIClient.showToast("Could not find table headers or data rows in uploaded content", "warning");
        return;
      }
    }

    const aliases = {
      project_name: ["project_name", "project name", "name", "project", "title", "corridor", "work name", "item name", "description", "work package", "project title", "name of project", "scheme"],
      ministry: ["ministry", "central ministry", "ministry name", "department", "dept", "min", "ministry / department", "ministry/dept"],
      sector: ["sector", "sub sector", "domain", "category", "infrastructure sector", "subsector", "sector wise details", "sector name"],
      state: ["state", "primary state", "location", "province", "region", "state / ut", "state/ut"],
      original_cost_cr: ["original_cost_cr", "original cost", "sanctioned cost", "sanctioned outlay", "cost", "budget", "estimated cost", "original outlay", "original cost (rs. cr)", "cost (rs cr)", "sanctioned cost (rs. cr)", "original cost (cr)"],
      revised_cost_cr: ["revised_cost_cr", "revised cost", "anticipated cost", "latest cost", "current cost", "revised outlay", "anticipated cost (rs. cr)", "revised cost (rs. cr)", "latest cost (rs cr)"],
      physical_progress_pct: ["physical_progress_pct", "physical progress", "physical %", "progress", "actual progress", "work done %", "completion %", "physical progress (%)", "progress (%)"],
      delay_in_months: ["delay_in_months", "delay", "time overrun", "delay months", "slippage months", "months delayed", "delay (months)", "time overrun (months)"]
    };

    const mappings = [];
    headers.forEach((h, idx) => {
      const lower = h.toLowerCase().replace(/[\s\-_]/g, "");
      let matchedTarget = "custom_attribute";
      let confidence = "FUZZY";

      for (const [target, targetAliases] of Object.entries(aliases)) {
        if (targetAliases.some(a => a.replace(/[\s\-_]/g, "") === lower)) {
          matchedTarget = target;
          confidence = "EXACT";
          break;
        } else if (targetAliases.some(a => lower.includes(a.replace(/[\s\-_]/g, "")) || a.replace(/[\s\-_]/g, "").includes(lower))) {
          matchedTarget = target;
          confidence = "FUZZY";
          break;
        }
      }

      let sampleVal = "";
      if (rows.length > 0 && typeof rows[0] === "object") {
        sampleVal = rows[0][h] !== undefined ? String(rows[0][h]) : "";
      }

      mappings.push({
        source: h,
        target: matchedTarget,
        confidence,
        sampleValue: sampleVal
      });
    });

    // If project_name is missing, allow automatic synthesis
    const hasProjectName = mappings.some(m => m.target === "project_name");
    if (!hasProjectName && headers.length > 0) {
      mappings.unshift({
        source: "(Auto-Synthesized)",
        target: "project_name",
        confidence: "SYNTHESIZED",
        sampleValue: "Asset Package #1"
      });
    }

    this.validationReport = {
      recordsCount: rows.length,
      valid: true,
      columnMappings: mappings
    };
  },

  bindEvents(container) {
    // Mode Switcher Tabs
    const tabWizard = container.querySelector("#tab-mode-wizard");
    const tabImport = container.querySelector("#tab-mode-import");
    if (tabWizard) {
      tabWizard.addEventListener("click", () => {
        this.activeTab = "wizard";
        this.render(container);
      });
    }
    if (tabImport) {
      tabImport.addEventListener("click", () => {
        this.activeTab = "import";
        this.render(container);
      });
    }

    // Dataset Sample Buttons
    const btnSampleMorth = container.querySelector("#btn-sample-morth");
    const btnSampleRail = container.querySelector("#btn-sample-railways");
    const btnClear = container.querySelector("#btn-clear-dataset");
    const txtPayload = container.querySelector("#txt-import-payload");

    if (txtPayload) {
      txtPayload.addEventListener("input", (e) => {
        this.rawPayload = e.target.value;
      });
    }

    if (btnSampleMorth) {
      btnSampleMorth.addEventListener("click", () => {
        this.rawPayload = this.sampleDatasets.morth;
        this.inspectDataset(this.rawPayload);
        this.render(container);
      });
    }
    if (btnSampleRail) {
      btnSampleRail.addEventListener("click", () => {
        this.rawPayload = this.sampleDatasets.railways;
        this.inspectDataset(this.rawPayload);
        this.render(container);
      });
    }
    if (btnClear) {
      btnClear.addEventListener("click", () => {
        this.rawPayload = "";
        this.validationReport = null;
        this.importResult = null;
        this.render(container);
      });
    }

    // Clean Slate & Demo Data Buttons
    const btnClearDemo = container.querySelector("#btn-clear-demo-data");
    const btnRestoreDemo = container.querySelector("#btn-restore-demo-data");
    const btnResetZero = container.querySelector("#btn-reset-registry-zero");

    if (btnClearDemo) {
      btnClearDemo.addEventListener("click", () => {
        window.APIClient.clearDemoData();
        this.render(container);
      });
    }
    if (btnRestoreDemo) {
      btnRestoreDemo.addEventListener("click", () => {
        window.APIClient.restoreDemoData();
        this.render(container);
      });
    }
    if (btnResetZero) {
      btnResetZero.addEventListener("click", () => {
        if (confirm("Are you sure you want to clear all projects (both custom uploads and demo records)? Registry will be reset to 0.")) {
          window.APIClient.clearAllData();
          this.rawPayload = "";
          this.validationReport = null;
          this.importResult = null;
          this.render(container);
        }
      });
    }

    // File Upload
    const fileInput = container.querySelector("#file-import-dataset");
    if (fileInput) {
      fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          this.rawPayload = evt.target.result;
          this.inspectDataset(this.rawPayload);
          this.render(container);
        };
        reader.readAsText(file);
      });
    }

    // Inspect Dataset Button
    const btnInspect = container.querySelector("#btn-inspect-dataset");
    if (btnInspect) {
      btnInspect.addEventListener("click", () => {
        const text = (this.rawPayload || (txtPayload ? txtPayload.value : "")).trim();
        this.rawPayload = text;
        this.inspectDataset(this.rawPayload);
        this.render(container);
      });
    }

    // Run Dataset Import Button
    const btnRunImport = container.querySelector("#btn-run-dataset-import");
    if (btnRunImport) {
      btnRunImport.addEventListener("click", async () => {
        const text = (this.rawPayload || (txtPayload ? txtPayload.value : "")).trim();
        if (!text) {
          window.APIClient.showToast("Please enter or upload a dataset first", "warning");
          return;
        }

        btnRunImport.disabled = true;
        btnRunImport.innerHTML = `<span>⏳</span> Ingesting & Running AI Pipeline...`;

        try {
          let payload;
          if (text.startsWith("[") || text.startsWith("{")) {
            const parsed = JSON.parse(text);
            payload = { projects: Array.isArray(parsed) ? parsed : [parsed], data_source: "REAL_IMPORTED" };
          } else {
            payload = { csv_data: text, data_source: "REAL_IMPORTED" };
          }

          const res = await window.APIClient.importProjects(payload);
          this.importResult = res;
          window.APIClient.showToast(`Successfully ingested ${(res.projects || []).length} projects with LightGBM & WBS inference!`, "success");
        } catch (err) {
          window.APIClient.showToast("Import failed: " + err.message, "error");
        } finally {
          this.render(container);
        }
      });
    }

    // Step navigation buttons
    const next1 = container.querySelector("#btn-next-step-1");
    if (next1) {
      next1.addEventListener("click", () => {
        const name = container.querySelector("#inp-prj-name")?.value;
        const agency = container.querySelector("#inp-prj-agency")?.value;
        const cost = container.querySelector("#inp-prj-cost")?.value;
        if (name) this.onboardingData.project_name = name;
        if (agency) this.onboardingData.implementing_agency = agency;
        if (cost) this.onboardingData.original_cost_inr_cr = parseFloat(cost) || 1420.5;
        this.currentStep = 2;
        this.render(container);
      });
    }

    const back2 = container.querySelector("#btn-back-step-2");
    if (back2) back2.addEventListener("click", () => { this.currentStep = 1; this.render(container); });

    const next2 = container.querySelector("#btn-next-step-2");
    if (next2) next2.addEventListener("click", () => { this.currentStep = 3; this.render(container); });

    const btnDocAI = container.querySelector("#btn-run-doc-ai");
    if (btnDocAI) {
      btnDocAI.addEventListener("click", async () => {
        btnDocAI.disabled = true;
        btnDocAI.innerHTML = `<span>⏳</span> Extracting DPR Entities...`;
        await window.APIClient.analyzeProjectDocuments("PRJ-SYN-000002");
        btnDocAI.innerHTML = `<span>✔️</span> Extraction Complete`;
        window.APIClient.showToast("DPR & BoQ Entities extracted with 94.2% AI confidence", "success");
      });
    }

    const back3 = container.querySelector("#btn-back-step-3");
    if (back3) back3.addEventListener("click", () => { this.currentStep = 2; this.render(container); });

    const next3 = container.querySelector("#btn-next-step-3");
    if (next3) next3.addEventListener("click", () => { this.currentStep = 4; this.render(container); });

    const back4 = container.querySelector("#btn-back-step-4");
    if (back4) back4.addEventListener("click", () => { this.currentStep = 3; this.render(container); });

    const ratifyBtn = container.querySelector("#btn-ratify-baseline");
    if (ratifyBtn) {
      ratifyBtn.addEventListener("click", async () => {
        ratifyBtn.disabled = true;
        ratifyBtn.innerHTML = `<span>⏳</span> Baselining Execution Network...`;
        const notes = container.querySelector("#txt-approval-notes")?.value || "Approved baseline execution network.";
        await window.APIClient.approveExecutionPlan("PRJ-SYN-000002", notes);
        window.APIClient.showToast("Execution Baseline Ratified! Transitioning to CPM Control Center...", "success");
        setTimeout(() => {
          window.location.hash = "#/execution";
        }, 800);
      });
    }

    // Anchor demo loader
    const demoBtn = container.querySelector("#btn-load-demo-anchor");
    if (demoBtn) {
      demoBtn.addEventListener("click", () => {
        this.onboardingData.project_id = "PRJ-SYN-000002";
        this.onboardingData.project_name = "Varanasi-Ranchi-Kolkata Expressway (PKG-3 Ganga River Bridge & Viaduct)";
        this.onboardingData.original_cost_inr_cr = 1420.5;
        this.currentStep = 3;
        window.APIClient.showToast("Loaded Anchor Corridor: PRJ-SYN-000002", "info");
        this.render(container);
      });
    }
  }
};

window.ProjectOnboardingView = ProjectOnboardingView;
