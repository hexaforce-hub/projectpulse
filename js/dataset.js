// ==========================================================================
// ProjectPulse AI - Synthetic MoSPI PAIMANA Master Dataset
// Modeled strictly on official MoSPI IPMD Central Sector Infrastructure Schema
// Cost >= ₹150 Crore | 17 Central Ministries | 1,981+ Project Universe
// ==========================================================================

const FLAGSHIP_PROJECTS = [
  {
    id: "MOSPI-MORTH-2024-082",
    name: "Delhi-Mumbai Expressway (PKG-14 Vadodara Bypass)",
    ministry: "Ministry of Road Transport and Highways",
    sector: "Roads & Highways",
    agency: "NHAI",
    state: "Gujarat",
    originalCost: 3850,
    revisedCost: 4620,
    expenditure: 3280,
    physicalProgress: 61,
    financialProgress: 71.0,
    originalCompletion: "2025-06",
    revisedCompletion: "2027-03",
    milestones: { total: 28, completed: 16, delayed: 7, pending: 5 },
    primaryBottleneck: "Land Acquisition & ROW Disputes",
    secondaryBottleneck: "Utility Shifting (Gas & High-Tension Lines)",
    bottleneckDaysLost: 210,
    agencyHistoricalDelayRate: 0.38, // 38% past projects delayed
    coordinates: { lat: 22.3072, lng: 73.1812, city: "Vadodara" }
  },
  {
    id: "MOSPI-RAIL-2023-019",
    name: "Eastern Dedicated Freight Corridor (Sonnagar-Dankuni)",
    ministry: "Ministry of Railways",
    sector: "Railways & Logistics",
    agency: "DFCCIL",
    state: "West Bengal / Bihar",
    originalCost: 14200,
    revisedCost: 17850,
    expenditure: 11400,
    physicalProgress: 52,
    financialProgress: 63.9,
    originalCompletion: "2024-12",
    revisedCompletion: "2027-08",
    milestones: { total: 42, completed: 21, delayed: 12, pending: 9 },
    primaryBottleneck: "PPP Concessionaire Financing & Procurement",
    secondaryBottleneck: "Forest Land Diversion Clearances",
    bottleneckDaysLost: 380,
    agencyHistoricalDelayRate: 0.44,
    coordinates: { lat: 23.5204, lng: 87.3119, city: "Dankuni" }
  },
  {
    id: "MOSPI-MOHUA-2024-104",
    name: "Bengaluru Metro Phase 2A (Silk Board to KR Puram)",
    ministry: "Ministry of Housing and Urban Affairs",
    sector: "Urban Transit",
    agency: "BMRCL",
    state: "Karnataka",
    originalCost: 5600,
    revisedCost: 6350,
    expenditure: 4120,
    physicalProgress: 64,
    financialProgress: 64.9,
    originalCompletion: "2025-09",
    revisedCompletion: "2026-12",
    milestones: { total: 32, completed: 20, delayed: 5, pending: 7 },
    primaryBottleneck: "Underground Utility Shifting & Traffic Diversion",
    secondaryBottleneck: "Steel & Pre-cast Supply Chain Variance",
    bottleneckDaysLost: 140,
    agencyHistoricalDelayRate: 0.29,
    coordinates: { lat: 12.9172, lng: 77.6228, city: "Bengaluru" }
  },
  {
    id: "MOSPI-POWER-2023-044",
    name: "Talcher Ultra-Supercritical Thermal Power Project Stage-III",
    ministry: "Ministry of Power",
    sector: "Thermal Power & Energy",
    agency: "NTPC",
    state: "Odisha",
    originalCost: 7920,
    revisedCost: 9140,
    expenditure: 5980,
    physicalProgress: 58,
    financialProgress: 65.4,
    originalCompletion: "2025-03",
    revisedCompletion: "2027-01",
    milestones: { total: 36, completed: 19, delayed: 8, pending: 9 },
    primaryBottleneck: "Heavy Equipment Boiler/Turbine Delivery Bottleneck",
    secondaryBottleneck: "Environmental Emission Scrubbing Retrofit",
    bottleneckDaysLost: 240,
    agencyHistoricalDelayRate: 0.32,
    coordinates: { lat: 20.9509, lng: 85.2168, city: "Talcher" }
  },
  {
    id: "MOSPI-PETRO-2024-031",
    name: "Jagdishpur-Haldia & Bokaro-Dhamra Gas Pipeline (JHBDPL)",
    ministry: "Ministry of Petroleum and Natural Gas",
    sector: "Pipelines & Hydrocarbons",
    agency: "GAIL",
    state: "Jharkhand / West Bengal",
    originalCost: 3200,
    revisedCost: 3450,
    expenditure: 2900,
    physicalProgress: 88,
    financialProgress: 84.1,
    originalCompletion: "2025-01",
    revisedCompletion: "2025-11",
    milestones: { total: 22, completed: 19, delayed: 2, pending: 1 },
    primaryBottleneck: "River Crossing Micro-Tunneling Delays",
    secondaryBottleneck: "Local Farmer Land Compensation",
    bottleneckDaysLost: 65,
    agencyHistoricalDelayRate: 0.18,
    coordinates: { lat: 23.7957, lng: 86.4304, city: "Dhanbad" }
  },
  {
    id: "MOSPI-RAIL-2022-003",
    name: "Udhampur-Srinagar-Baramulla Rail Link (USBRL Mega Tunnel)",
    ministry: "Ministry of Railways",
    sector: "Railways & Logistics",
    agency: "Northern Railway / KRCL",
    state: "Jammu & Kashmir",
    originalCost: 21600,
    revisedCost: 37400,
    expenditure: 32100,
    physicalProgress: 94,
    financialProgress: 85.8,
    originalCompletion: "2020-03",
    revisedCompletion: "2026-10",
    milestones: { total: 60, completed: 55, delayed: 4, pending: 1 },
    primaryBottleneck: "Unforeseen Himalayan Geological Faults & Water Seepage",
    secondaryBottleneck: "Extreme Weather Seismic Design Reinforcement",
    bottleneckDaysLost: 730,
    agencyHistoricalDelayRate: 0.55,
    coordinates: { lat: 33.1511, lng: 75.1482, city: "Reasi" }
  },
  {
    id: "MOSPI-CIVIL-2024-015",
    name: "Navi Mumbai International Airport (NMIA Phase-1)",
    ministry: "Ministry of Civil Aviation",
    sector: "Civil Aviation",
    agency: "CIDCO / Adani Airports",
    state: "Maharashtra",
    originalCost: 14100,
    revisedCost: 16700,
    expenditure: 12200,
    physicalProgress: 79,
    financialProgress: 73.1,
    originalCompletion: "2024-12",
    revisedCompletion: "2026-03",
    milestones: { total: 38, completed: 30, delayed: 4, pending: 4 },
    primaryBottleneck: "Ulwe River Diversion & Hill Cutting Clearance",
    secondaryBottleneck: "Airspace Calibration & Radar Testing Clearance",
    bottleneckDaysLost: 110,
    agencyHistoricalDelayRate: 0.25,
    coordinates: { lat: 18.9902, lng: 73.0688, city: "Navi Mumbai" }
  },
  {
    id: "MOSPI-MOHFW-2024-007",
    name: "AIIMS Madurai 750-Bed Super Speciality Medical Institute",
    ministry: "Ministry of Health and Family Welfare",
    sector: "Health Infrastructure",
    agency: "MoHFW / HITES",
    state: "Tamil Nadu",
    originalCost: 1980,
    revisedCost: 2350,
    expenditure: 680,
    physicalProgress: 32,
    financialProgress: 28.9,
    originalCompletion: "2026-04",
    revisedCompletion: "2028-09",
    milestones: { total: 24, completed: 7, delayed: 9, pending: 8 },
    primaryBottleneck: "JICA Loan Disbursement & EPC Re-Tendering Cycle",
    secondaryBottleneck: "Site Soil Consolidation & Structural Redesign",
    bottleneckDaysLost: 290,
    agencyHistoricalDelayRate: 0.42,
    coordinates: { lat: 9.9252, lng: 78.1198, city: "Madurai" }
  }
];

// Procedural generator to create a realistic 1,200 project MoSPI Universe
function generateMoSPIUniverse(count = 1200) {
  const MINISTRIES = [
    { name: "Ministry of Road Transport and Highways", sector: "Roads & Highways", agency: "NHAI", share: 0.45 },
    { name: "Ministry of Railways", sector: "Railways & Logistics", agency: "Indian Railways / DFCCIL", share: 0.25 },
    { name: "Ministry of Power", sector: "Thermal & Hydro Energy", agency: "NTPC / NHPC", share: 0.12 },
    { name: "Ministry of Petroleum and Natural Gas", sector: "Pipelines & Refineries", agency: "IOCL / GAIL / ONGC", share: 0.08 },
    { name: "Ministry of Housing and Urban Affairs", sector: "Urban Transit & Smart Cities", agency: "Metro Rail Corps", share: 0.05 },
    { name: "Ministry of Civil Aviation", sector: "Airports", agency: "AAI", share: 0.03 },
    { name: "Ministry of Ports, Shipping and Waterways", sector: "Ports & Waterways", agency: "Major Port Authorities", share: 0.02 }
  ];

  const BOTTLENECKS = [
    "Land Acquisition & Right-of-Way",
    "Forest, Wildlife & Coastal Environmental Clearances",
    "Contractor Financial Distress & Underperformance",
    "Procurement / Tendering Dispute & Litigation",
    "Underground Utility Shifting (Water/Power/Gas)",
    "Unforeseen Geological & Extreme Weather Variations",
    "Inter-Agency Multi-Department Coordination Delays"
  ];

  const STATES = [
    { name: "Maharashtra", lat: 19.7515, lng: 75.7139 },
    { name: "Uttar Pradesh", lat: 26.8467, lng: 80.9462 },
    { name: "Gujarat", lat: 22.2587, lng: 71.1924 },
    { name: "Karnataka", lat: 15.3173, lng: 75.7139 },
    { name: "Tamil Nadu", lat: 11.1271, lng: 78.6569 },
    { name: "Odisha", lat: 20.9517, lng: 85.0985 },
    { name: "Madhya Pradesh", lat: 22.9734, lng: 78.6569 },
    { name: "Rajasthan", lat: 27.0238, lng: 74.2179 },
    { name: "West Bengal", lat: 22.9868, lng: 87.8550 },
    { name: "Bihar", lat: 25.0961, lng: 85.3131 },
    { name: "Assam", lat: 26.2006, lng: 92.9376 },
    { name: "Telangana", lat: 18.1124, lng: 79.0193 },
    { name: "Andhra Pradesh", lat: 15.9129, lng: 79.7400 }
  ];

  const projects = [...FLAGSHIP_PROJECTS];
  const generatedCount = count - FLAGSHIP_PROJECTS.length;

  for (let i = 0; i < generatedCount; i++) {
    // Select ministry based on distribution
    const rand = Math.random();
    let cumulative = 0;
    let selectedMinistry = MINISTRIES[0];
    for (const m of MINISTRIES) {
      cumulative += m.share;
      if (rand <= cumulative) {
        selectedMinistry = m;
        break;
      }
    }

    const stateObj = STATES[Math.floor(Math.random() * STATES.length)];
    const originalCost = Math.round(180 + Math.random() * 4500); // ₹180 Cr to ₹4,680 Cr
    const physicalProgress = Math.round(10 + Math.random() * 85);
    
    // Financial physical decoupling factor
    const decouplingNoise = (Math.random() - 0.35) * 25; 
    const financialProgress = Math.min(100, Math.max(5, Math.round(physicalProgress + decouplingNoise)));
    
    // Expenditure
    const revisedCost = Math.round(originalCost * (1 + Math.max(0, (financialProgress - physicalProgress) / 100 * 0.8)));
    const expenditure = Math.round(revisedCost * (financialProgress / 100));

    const totalMilestones = Math.round(12 + Math.random() * 30);
    const delayedMilestones = Math.round((Math.random() * totalMilestones * 0.35));
    const completedMilestones = Math.min(totalMilestones - delayedMilestones, Math.round(totalMilestones * (physicalProgress / 100)));
    const pendingMilestones = Math.max(0, totalMilestones - completedMilestones - delayedMilestones);

    const primaryBottleneck = BOTTLENECKS[Math.floor(Math.random() * BOTTLENECKS.length)];
    const daysLost = Math.round(delayedMilestones * (15 + Math.random() * 40));

    projects.push({
      id: `MOSPI-${selectedMinistry.agency.split(' ')[0]}-2025-${String(i + 100).padStart(4, '0')}`,
      name: `${stateObj.name} ${selectedMinistry.sector} Package-${(i % 15) + 1}`,
      ministry: selectedMinistry.name,
      sector: selectedMinistry.sector,
      agency: selectedMinistry.agency,
      state: stateObj.name,
      originalCost,
      revisedCost,
      expenditure,
      physicalProgress,
      financialProgress,
      originalCompletion: "2025-12",
      revisedCompletion: delayedMilestones > 3 ? "2027-06" : "2026-03",
      milestones: { total: totalMilestones, completed: completedMilestones, delayed: delayedMilestones, pending: pendingMilestones },
      primaryBottleneck,
      secondaryBottleneck: BOTTLENECKS[(Math.floor(Math.random() * BOTTLENECKS.length) + 1) % BOTTLENECKS.length],
      bottleneckDaysLost: daysLost,
      agencyHistoricalDelayRate: 0.20 + Math.random() * 0.30,
      coordinates: {
        lat: stateObj.lat + (Math.random() - 0.5) * 2.5,
        lng: stateObj.lng + (Math.random() - 0.5) * 2.5,
        city: stateObj.name
      }
    });
  }

  return projects;
}

// Global dataset instance
window.PAIMANA_DATASET = generateMoSPIUniverse(1200);
console.log(`[PAIMANA Engine] Ingested ${window.PAIMANA_DATASET.length} Central Sector Infrastructure Projects.`);
