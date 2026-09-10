// ==========================================================================
// ASTRA — Sovereign Government Institutional Login Gateway
// Ministry of Statistics & Programme Implementation (MoSPI) • IPMD
// National Infrastructure Intelligence Platform
// ==========================================================================

const LoginView = {
  selectedRole: null,

  DEMO_CREDENTIALS: [
    { username: "minister", password: "minister123", role: "NATIONAL_LEADER", label: "Union Minister", badge: "National Command", icon: "🏛️", desc: "Strategic portfolio oversight & apex decisions" },
    { username: "official", password: "official123", role: "MINISTRY_OFFICIAL", label: "Ministry Secretary", badge: "MoRTH Portfolio", icon: "🏢", desc: "Departmental project pipeline & executive directives" },
    { username: "analyst", password: "analyst123", role: "ANALYST", label: "Senior Analyst", badge: "Intelligence Unit", icon: "🔬", desc: "TreeSHAP attribution, sensitivity sweeps & forecasting" },
    { username: "pm", password: "pm123", role: "PROJECT_MANAGER", label: "Project Director", badge: "Corridor Control", icon: "📐", desc: "WBS scheduling, CPM critical path & resource allocation" },
    { username: "engineer", password: "engineer123", role: "ENGINEER", label: "Site Engineer", badge: "Technical Desk", icon: "⚙️", desc: "Technical sign-offs, milestone verification & drawings" },
    { username: "fo", password: "fo123", role: "FIELD_OFFICER", label: "Field Officer", badge: "Site Inspections", icon: "🛡️", desc: "Ground inspection, work packages & compliance review" },
    { username: "field", password: "field123", role: "FIELD_WORKER", label: "Field Worker", badge: "Daily Execution", icon: "👷", desc: "Today's physical targets, telemetry & photo evidence" },
    { username: "admin", password: "admin123", role: "ADMIN", label: "System Admin", badge: "Governance & Audit", icon: "⚙️", desc: "Audit surveillance ledger, data quality & model registry" }
  ],

  render() {
    return `
      <div class="min-h-screen bg-slate-900 flex flex-col justify-between text-slate-100 selection:bg-blue-600 selection:text-white">
        
        <!-- Sovereign Tricolor Top Accent Line -->
        <div class="h-1.5 w-full bg-gradient-to-r from-[#ff9933] via-[#ffffff] to-[#138808] flex-shrink-0"></div>

        <!-- Main Authentication Card Container -->
        <div class="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
          <div class="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 bg-slate-950/80 border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
            
            <!-- Left Panel: Institutional Identity & National Scale -->
            <div class="lg:col-span-5 bg-gradient-to-br from-blue-950/90 via-slate-900 to-indigo-950/80 p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800">
              <div>
                <!-- Institutional Header -->
                <div class="flex items-center gap-3">
                  <img src="assets/astra_logo.png" alt="ASTRA Emblem" class="w-12 h-12 rounded-2xl p-1 bg-white/10 border border-white/20 shadow-lg object-contain" />
                  <div>
                    <div class="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">भारत सरकार • MoSPI</div>
                    <div class="text-xl font-black tracking-tight text-white">ASTRA</div>
                    <div class="text-[10px] text-slate-300 font-medium">National Infrastructure Intelligence</div>
                  </div>
                </div>

                <div class="mt-8 space-y-3">
                  <h2 class="text-lg font-bold text-white tracking-tight leading-snug">
                    Integrated Surveillance & Decision-Support System
                  </h2>
                  <p class="text-xs text-slate-300 leading-relaxed">
                    Connecting ₹150 Cr+ Central Sector Projects from Ground Telemetry and Machine Learning Early Warnings to Apex Ministerial Directives.
                  </p>
                </div>

                <!-- Strategic Statistics Mini-Grid -->
                <div class="grid grid-cols-2 gap-2.5 mt-6 pt-6 border-t border-slate-800/80 text-[11px]">
                  <div class="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <div class="text-slate-400 text-[10px]">Tracked Projects</div>
                    <div class="font-bold text-sm text-white font-mono mt-0.5">10,000+</div>
                    <div class="text-[9px] text-emerald-400">Central Sector</div>
                  </div>
                  <div class="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <div class="text-slate-400 text-[10px]">Total Outlay</div>
                    <div class="font-bold text-sm text-white font-mono mt-0.5">₹312.5L Cr</div>
                    <div class="text-[9px] text-blue-400">PAIMANA Baseline</div>
                  </div>
                  <div class="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <div class="text-slate-400 text-[10px]">Early Warning</div>
                    <div class="font-bold text-sm text-amber-400 font-mono mt-0.5">5.8 Months</div>
                    <div class="text-[9px] text-slate-400">Average Lead Time</div>
                  </div>
                  <div class="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <div class="text-slate-400 text-[10px]">Explainability</div>
                    <div class="font-bold text-sm text-indigo-400 font-mono mt-0.5">TreeSHAP</div>
                    <div class="text-[9px] text-slate-400">LightGBM Pipeline</div>
                  </div>
                </div>
              </div>

              <!-- Security Notice -->
              <div class="mt-8 pt-4 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Role-Based Sovereign Access Gate • IPMD / PAIMANA</span>
              </div>
            </div>

            <!-- Right Panel: Sign-In Form & Persona Quick-Access -->
            <div class="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-lg font-bold text-white tracking-tight">Institutional Sign In</h3>
                    <p class="text-xs text-slate-400 mt-0.5">Enter your official credentials or select an authenticated persona</p>
                  </div>
                  <span class="px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold rounded-full uppercase tracking-wider">
                    Official v1.0
                  </span>
                </div>

                <!-- Error Alert Box -->
                <div id="login-error-alert" class="hidden mt-4 p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-300 flex items-center gap-2.5 animate-shake">
                  <span class="text-base">⚠️</span>
                  <span id="login-error-text">Authentication failed. Please verify credentials.</span>
                </div>

                <!-- Direct Credentials Form -->
                <form id="astra-login-form" onsubmit="LoginView.handleFormSubmit(event)" class="mt-5 space-y-4">
                  <div>
                    <label class="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5" for="login-username">
                      Username / Official Email
                    </label>
                    <div class="relative">
                      <input 
                        type="text" 
                        id="login-username" 
                        required 
                        placeholder="e.g. minister, official, analyst, pm, engineer, field"
                        value=""
                        autocomplete="username"
                        class="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 transition outline-none font-mono"
                      />
                      <span class="absolute right-3 top-2.5 text-slate-500 text-xs">👤</span>
                    </div>
                  </div>

                  <div>
                    <div class="flex items-center justify-between mb-1.5">
                      <label class="block text-[11px] font-bold text-slate-300 uppercase tracking-wider" for="login-password">
                        Security Password
                      </label>
                      <span class="text-[10px] text-slate-400">Case-sensitive</span>
                    </div>
                    <div class="relative">
                      <input 
                        type="password" 
                        id="login-password" 
                        required 
                        placeholder="Enter official institutional password"
                        value=""
                        autocomplete="current-password"
                        class="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 transition outline-none font-mono"
                      />
                      <span class="absolute right-3 top-2.5 text-slate-500 text-xs">🔒</span>
                    </div>
                  </div>

                  <div class="flex items-center justify-between text-xs pt-1">
                    <label class="flex items-center gap-2 cursor-pointer text-slate-300 text-[11px]">
                      <input type="checkbox" id="login-remember-me" checked class="rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-900" />
                      <span>Remember institutional session</span>
                    </label>
                    <span class="text-[10px] text-slate-400">PAIMANA TLS 1.3</span>
                  </div>

                  <button 
                    type="submit" 
                    id="btn-login-submit"
                    class="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Sign In to ASTRA Platform</span>
                    <span class="text-sm">→</span>
                  </button>
                </form>

                <!-- Quick-Sign-In Persona Selector for Evaluators/Judges -->
                <div class="mt-6 pt-5 border-t border-slate-800">
                  <div class="flex items-center justify-between mb-2.5">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      ⚡ Evaluator Quick-Access: 8 Official Personas
                    </span>
                    <span class="text-[10px] text-amber-400 font-semibold">1-Click Sign-In</span>
                  </div>

                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    ${this.DEMO_CREDENTIALS.map(c => `
                      <button 
                        type="button"
                        onclick="LoginView.quickLogin('${c.username}', '${c.password}')"
                        class="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 rounded-xl text-left transition group cursor-pointer"
                        title="${c.desc}"
                      >
                        <div class="flex items-center justify-between text-xs">
                          <span>${c.icon}</span>
                          <span class="text-[9px] font-bold font-mono text-slate-400 group-hover:text-blue-400">${c.username}</span>
                        </div>
                        <div class="text-[11px] font-bold text-white truncate mt-1 group-hover:text-blue-300">${c.label}</div>
                        <div class="text-[9px] text-slate-400 truncate">${c.badge}</div>
                      </button>
                    `).join('')}
                  </div>
                </div>
              </div>

              <!-- Footer notice -->
              <div class="mt-5 pt-3 border-t border-slate-800/80 text-[10px] text-slate-400 text-center">
                Ministry of Statistics & Programme Implementation (MoSPI) • Infrastructure Project Monitoring Division (IPMD)
              </div>
            </div>

          </div>
        </div>

        <!-- Tricolor Bottom Footer Stripe -->
        <div class="h-1 w-full bg-slate-800 flex-shrink-0"></div>
      </div>
    `;
  },

  async handleFormSubmit(event) {
    if (event) event.preventDefault();
    const uInput = document.getElementById("login-username");
    const pInput = document.getElementById("login-password");
    const btn = document.getElementById("btn-login-submit");
    const errBox = document.getElementById("login-error-alert");
    const errText = document.getElementById("login-error-text");

    const username = (uInput ? uInput.value : "").trim().toLowerCase();
    const password = (pInput ? pInput.value : "").trim();

    if (!username || !password) return;

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg> Authenticating...`;
    }
    if (errBox) errBox.classList.add("hidden");

    try {
      const res = await window.APIClient.login(username, password);
      if (res && res.success) {
        // Boot application shell and redirect to role-specific landing view
        this.onLoginSuccess(res.user);
      } else {
        if (errBox && errText) {
          errText.textContent = res.detail || "Invalid institutional credentials. Please check username and password.";
          errBox.classList.remove("hidden");
        }
      }
    } catch (e) {
      if (errBox && errText) {
        errText.textContent = e.message || "Sign in network failure.";
        errBox.classList.remove("hidden");
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<span>Sign In to ASTRA Platform</span> <span class="text-sm">→</span>`;
      }
    }
  },

  async quickLogin(username, password) {
    const uInput = document.getElementById("login-username");
    const pInput = document.getElementById("login-password");
    if (uInput) uInput.value = username;
    if (pInput) pInput.value = password;
    await this.handleFormSubmit(null);
  },

  onLoginSuccess(user) {
    // Determine role-specific destination
    const role = (user && user.role) ? user.role.toUpperCase() : "NATIONAL_LEADER";
    let targetHash = "#/dashboard";

    if (role === "NATIONAL_LEADER" || role === "MINISTER") {
      targetHash = "#/dashboard";
    } else if (role === "MINISTRY_OFFICIAL" || role === "OFFICIAL") {
      targetHash = "#/ministry";
    } else if (role === "ANALYST") {
      targetHash = "#/analytics";
    } else if (role === "PROJECT_MANAGER" || role === "PM") {
      targetHash = "#/my-projects";
    } else if (role === "ENGINEER") {
      targetHash = "#/engineer";
    } else if (role === "FIELD_OFFICER" || role === "FO") {
      targetHash = "#/field-officer";
    } else if (role === "FIELD_WORKER" || role === "FIELD") {
      targetHash = "#/field";
    } else if (role === "ADMIN") {
      targetHash = "#/settings";
    }

    // Render full application shell
    if (window.AppShell && window.AppShell.render) {
      window.AppShell.render();
    }
    
    // Switch to target view
    window.location.hash = targetHash;
    if (window.Router && window.Router.handleRoute) {
      window.Router.handleRoute();
    }
  }
};

window.LoginView = LoginView;
