"""
ProjectPulse — Data Foundation Generator
Ministry of Statistics & Programme Implementation (MoSPI) / IPMD
Smart India Hackathon 2026 — Team HexaForce

Generates synthetic, structurally consistent, PAIMANA-modeled infrastructure project data.
Deterministic generation via fixed random seed (default: 42).
"""

import argparse
import csv
import json
import math
import os
import random
from datetime import datetime, timedelta
from pathlib import Path

# Names bank for generating realistic Indian infrastructure project titles
CORRIDORS_ROADS = [
    "NH-44 North-South Corridor", "NH-48 Golden Quadrilateral", "Delhi-Mumbai Expressway",
    "Amritsar-Jamnagar Economic Corridor", "Bengaluru-Chennai Expressway", "Raipur-Visakhapatnam Corridor",
    "Purvanchal Expressway Link", "Bundelkhand Expressway Spur", "Trans-Haryana Expressway",
    "Coastal Road Coastal Highway", "Char Dham Highway Connectivity", "Zojila Tunnel Approach Road",
    "Varanasi-Ranchi-Kolkata Expressway", "Ahmedabad-Dholera Expressway", "Ganga Expressway Phase-I"
]

CORRIDORS_RAIL = [
    "Western Dedicated Freight Corridor", "Eastern Dedicated Freight Corridor",
    "Mumbai-Ahmedabad High Speed Rail", "Delhi-Meerut RRTS Corridor", "Sonnagar-Dankuni Freight Link",
    "Udhampur-Srinagar-Baramulla Rail Link", "Rishikesh-Karanprayag Rail Line", "Bilaspur-Manali-Leh Line",
    "Bhubaneswar-Visakhapatnam 3rd Line", "Pune-Nashik Semi High-Speed Rail", "Bhopal-Ramganjmandi Line",
    "Secunderabad-Mahabubnagar Doubling", "Khurda Road-Bolangir New Line", "Jiribam-Imphal Rail Project"
]

ENERGY_PROJECTS = [
    "Barh Super Thermal Power Station Stage-II", "North Karanpura Super Thermal Power Project",
    "Kudankulam Nuclear Power Plant Unit 3&4", "Khavda Renewable Energy Park Grid Interconnection",
    "Subansiri Lower Hydroelectric Project", "Dibang Multipurpose Hydropower Scheme",
    "Ratle Hydroelectric Power Project", "Rewa Ultra Mega Solar Transmission Network",
    "Bhadla Solar Park Phase-IV Evacuation", "Gorakhpur Haryana Anu Vidyut Pariyojana"
]

OIL_GAS_PROJECTS = [
    "Jagdishpur-Haldia-Bokaro-Dhamra Pipeline (JHBDPL)", "Barauni-Guwahati Natural Gas Pipeline",
    "Kandla-Gorakhpur LPG Pipeline", "Paradip-Hyderabad Petroleum Pipeline",
    "Mumbai High North Redevelopment Phase-IV", "Ennore-Thiruvallur-Bengaluru Gas Pipeline",
    "Rajasthan Refinery Project Pachpadra", "Visakh Refinery Modernization Project"
]

URBAN_PROJECTS = [
    "Bangalore Metro Rail Project Phase-2A & 2B", "Chennai Metro Rail Phase-II Corridor 3, 4 & 5",
    "Mumbai Metro Line 4 & 4A (Wadala-Kasarvadavali)", "Patna Metro Rail Project Priority Corridor",
    "Kanpur Metro Rail Project Phase-I", "Agra Metro Rail Project Priority Section",
    "Surat Metro Rail Phase-I", "Kochi Metro Rail Phase-II Kakkanad Extension"
]

WATER_PROJECTS = [
    "Polavaram Irrigation Multipurpose Project", "Ken-Betwa River Interlinking National Project",
    "Kaleshwaram Lift Irrigation Augmentation", "Mandal Dam North Koel Reservoir Project",
    "Shahpur Kandi Dam Project", "Upper Bhadra National Irrigation Scheme"
]

AVIATION_PORT_PROJECTS = [
    "Noida International Airport Jewar Phase-I", "Navi Mumbai International Greenfield Airport",
    "Dholera Greenfield International Airport", "Great Nicobar Transshipment Terminal",
    "Vadhavan Mega Container Port Project", "Kolkata Port Deep Draft Inner Harbour Berth"
]

COAL_PROJECTS = [
    "Tori-Shivpur Coal Rail Evacuation Line", "MGR Coal Transportation Corridor Phase-II",
    "Talcher Coalfield Heavy Haul Loop", "North Karanpura Coal Handling Plant Rapid Loading"
]

STRETCHES = [
    "Section I (Km 0.00 to 45.50)", "Section II (Km 45.50 to 112.00)", "Package 3 (Design & Build EPC)",
    "Contract Package 4B (Elevated Viaduct)", "Civil Package 1 (Underground Tunnel)",
    "EPC Package II (Terminal & Marine Berths)", "Stage-I Commissioning Phase", "Reach 2 (Ch. 24+000 to 68+500)"
]

MILESTONE_TEMPLATES = [
    ("M-01", "Feasibility Study & Detailed Project Report (DPR) Approval", 0.08, "ADMINISTRATIVE"),
    ("M-02", "Statutory Environmental & Forest Clearance Stage-I", 0.18, "STATUTORY"),
    ("M-03", "Land Acquisition 80% ROW Notification (Sec 3D/19)", 0.28, "LAND_ACQUISITION"),
    ("M-04", "EPC Tendering, Technical Evaluation & Contract Award", 0.38, "PROCUREMENT"),
    ("M-05", "Contractor Mobilization, ROW Handover & Utility Relocation", 0.50, "RIGHT_OF_WAY"),
    ("M-06", "Major Substructure, Earthwork & Foundation Works (50%)", 0.65, "CIVIL_WORKS"),
    ("M-07", "Superstructure Erection, Track/Line Laying & Core Fabrication", 0.80, "CIVIL_WORKS"),
    ("M-08", "Equipment Installation, Signaling & Substation Integration", 0.90, "SYSTEMS_EQUIPMENT"),
    ("M-09", "Safety Audit, Statutory Inspection (CRS/DGCA/CEA)", 0.96, "STATUTORY_INSPECTION"),
    ("M-10", "Final Trial Runs, COD Commercial Operation & Handover", 1.00, "COMMISSIONING")
]

def load_config(config_path):
    default_config = {
        "seed": 42,
        "default_record_count": 10000,
        "generator_version": "v0.2.0",
        "dataset_version": "v0.2.0",
        "provenance": {
            "data_source": "Synthetic demonstration dataset",
            "data_status": "SYNTHETIC",
            "schema_basis": "PAIMANA-modeled project monitoring schema"
        },
        "ministries": [
            { "name": "Ministry of Road Transport & Highways", "share": 0.42, "agency": "National Highways Authority of India (NHAI)" },
            { "name": "Ministry of Railways", "share": 0.24, "agency": "Railway Infrastructure Board / DFCCIL" },
            { "name": "Ministry of Power", "share": 0.12, "agency": "National Thermal & Hydro Power Corp (NTPC/NHPC)" },
            { "name": "Ministry of Petroleum & Natural Gas", "share": 0.08, "agency": "Gas & Oil Infrastructure Authority (GAIL/IOCL)" },
            { "name": "Ministry of Housing & Urban Affairs", "share": 0.06, "agency": "Metro Rail Infrastructure SPV" },
            { "name": "Ministry of Jal Shakti", "share": 0.03, "agency": "National Water Development Agency" },
            { "name": "Ministry of Civil Aviation", "share": 0.02, "agency": "Airports Authority of India (AAI)" },
            { "name": "Ministry of Ports, Shipping & Waterways", "share": 0.02, "agency": "Major Ports Authority" },
            { "name": "Ministry of Coal", "share": 0.01, "agency": "Coal Infrastructure PSU" }
        ],
        "states": [
            { "name": "Uttar Pradesh", "region": "North", "weight": 0.12 },
            { "name": "Maharashtra", "region": "West", "weight": 0.11 },
            { "name": "Gujarat", "region": "West", "weight": 0.09 },
            { "name": "Tamil Nadu", "region": "South", "weight": 0.08 },
            { "name": "Karnataka", "region": "South", "weight": 0.08 },
            { "name": "Andhra Pradesh", "region": "South", "weight": 0.07 },
            { "name": "Telangana", "region": "South", "weight": 0.06 },
            { "name": "Madhya Pradesh", "region": "Central", "weight": 0.07 },
            { "name": "Rajasthan", "region": "North", "weight": 0.07 },
            { "name": "Odisha", "region": "East", "weight": 0.06 },
            { "name": "West Bengal", "region": "East", "weight": 0.05 },
            { "name": "Bihar", "region": "East", "weight": 0.05 },
            { "name": "Assam", "region": "Northeast", "weight": 0.04 },
            { "name": "Jharkhand", "region": "East", "weight": 0.03 },
            { "name": "Chhattisgarh", "region": "Central", "weight": 0.02 }
        ],
        "bottlenecks": [
            "NONE", "LAND_ACQUISITION", "ENVIRONMENTAL_CLEARANCE", "FOREST_CLEARANCE",
            "PROCUREMENT", "CONTRACTOR", "UTILITY_SHIFTING", "DESIGN_CHANGE",
            "LEGAL_DISPUTE", "INTERDEPARTMENTAL_DEPENDENCY"
        ],
        "cost_parameters": {
            "min_cost_cr": 150.0,
            "lognormal_mean": 6.8,
            "lognormal_sigma": 0.95
        },
        "missingness": {
            "department_missing_pct": 2.5,
            "sub_sector_missing_pct": 3.0,
            "secondary_bottleneck_missing_pct": 5.0
        }
    }
    if config_path and os.path.exists(config_path):
        with open(config_path, "r", encoding="utf-8-sig") as f:
            user_config = json.load(f)
            default_config.update(user_config)
    return default_config


def generate_dataset(num_records=10000, seed=42, output_dir="data", config_path="config/data_generation_config.json"):
    print(f"[Dataset Generator] Initializing with seed={seed}, target_records={num_records}")
    random.seed(seed)
    
    cfg = load_config(config_path)
    
    # Setup output paths
    out_dir = Path(output_dir)
    raw_dir = out_dir / "raw"
    proc_dir = out_dir / "processed"
    ex_dir = out_dir / "examples"
    tc_dir = out_dir / "test_cases"
    
    for d in [raw_dir, proc_dir, ex_dir, tc_dir]:
        d.mkdir(parents=True, exist_ok=True)
        
    projects_clean = []
    projects_raw = []
    ml_ready_projects = []
    project_milestones = []
    project_progress = []
    
    # Cumulative distributions for sampling
    ministries_list = cfg["ministries"]
    ministry_weights = [m["share"] for m in ministries_list]
    
    states_list = cfg["states"]
    state_names = [s["name"] for s in states_list]
    state_regions = {s["name"]: s["region"] for s in states_list}
    state_weights = [s["weight"] for s in states_list]
    
    bottlenecks_pool = cfg["bottlenecks"]
    bottleneck_weights = [0.35, 0.20, 0.10, 0.08, 0.06, 0.07, 0.05, 0.04, 0.03, 0.02]
    
    # Simulation reference snapshot date
    snapshot_date = datetime(2026, 3, 31)
    
    print(f"[Dataset Generator] Generating {num_records} project records...")
    
    for i in range(1, num_records + 1):
        project_id = f"PRJ-SYN-{i:06d}"
        
        # 1. Ministry & Agency Selection
        min_obj = random.choices(ministries_list, weights=ministry_weights, k=1)[0]
        ministry = min_obj["name"]
        implementing_agency = min_obj["agency"]
        
        # Determine Sector and Titles
        if "Road" in ministry:
            sector = "Roads & Highways"
            sub_sector = random.choice(["Expressways", "National Corridors", "Economic Arteries", "Bridges & Tunnels"])
            title_base = random.choice(CORRIDORS_ROADS)
            department = "Highways & Connectivity Wing"
        elif "Rail" in ministry:
            sector = "Railways"
            sub_sector = random.choice(["Freight Corridors", "High Speed Rail", "Track Doubling", "Electrification"])
            title_base = random.choice(CORRIDORS_RAIL)
            department = "Project Development Directorate"
        elif "Power" in ministry:
            sector = "Power"
            sub_sector = random.choice(["Thermal Generation", "Hydroelectric Power", "Green Transmission Grid", "Solar Parks"])
            title_base = random.choice(ENERGY_PROJECTS)
            department = "Thermal & Hydro Energy Bureau"
        elif "Petroleum" in ministry:
            sector = "Petroleum & Natural Gas"
            sub_sector = random.choice(["Hydrocarbon Pipelines", "Refinery Modernization", "Strategic Storage"])
            title_base = random.choice(OIL_GAS_PROJECTS)
            department = "Pipeline & Downstream Directorate"
        elif "Urban" in ministry:
            sector = "Urban Transit"
            sub_sector = random.choice(["Metro Rail Rapid Transit", "Regional Transit", "Urban Water Infrastructure"])
            title_base = random.choice(URBAN_PROJECTS)
            department = "Urban Mass Transit Cell"
        elif "Jal" in ministry:
            sector = "Water Resources"
            sub_sector = random.choice(["Multipurpose Dam Project", "Inter-Basin Link", "Canal Network"])
            title_base = random.choice(WATER_PROJECTS)
            department = "National Water Mission Directorate"
        elif "Aviation" in ministry:
            sector = "Civil Aviation"
            sub_sector = random.choice(["Greenfield Airport", "Terminal Expansion", "Runway & Cargo"])
            title_base = random.choice(AVIATION_PORT_PROJECTS[:3])
            department = "Airport Infrastructure Cell"
        elif "Port" in ministry:
            sector = "Ports & Shipping"
            sub_sector = random.choice(["Deep Water Berths", "Port Rail Connectivity", "Inland Waterway"])
            title_base = random.choice(AVIATION_PORT_PROJECTS[3:])
            department = "Major Port Infrastructure Wing"
        else: # Coal
            sector = "Coal Infrastructure"
            sub_sector = random.choice(["Coal Evacuation Railway", "Pithead Coal Handling", "Merry-Go-Round System"])
            title_base = random.choice(COAL_PROJECTS)
            department = "Coal Project Monitoring Board"
            
        project_name = f"{title_base} — {random.choice(STRETCHES)}"
        
        # 2. State & Region
        state = random.choices(state_names, weights=state_weights, k=1)[0]
        region = state_regions[state]
        
        # 3. Project Type & Stage
        project_type = random.choice([
            "Greenfield Construction", "Capacity Augmentation / 6-Laning", 
            "Corridor Modernization", "Strategic Interconnection", "Rehabilitation & Upgradation"
        ])
        
        # 4. Project Sanction Cost (lognormal, min ₹150.0 Cr)
        raw_cost = math.exp(random.normalvariate(cfg["cost_parameters"]["lognormal_mean"], cfg["cost_parameters"]["lognormal_sigma"]))
        original_cost_cr = round(max(cfg["cost_parameters"]["min_cost_cr"], raw_cost), 2)
        
        # 5. Timeline & Dates
        # Start date between Jan 2018 and Dec 2023
        start_year = random.randint(2018, 2023)
        start_month = random.randint(1, 12)
        start_date = datetime(start_year, start_month, 1)
        
        planned_duration_months = random.randint(24, 72)
        # Add planned months
        p_end_year = start_year + (start_month + planned_duration_months - 1) // 12
        p_end_month = (start_month + planned_duration_months - 1) % 12 + 1
        planned_completion_date = datetime(p_end_year, p_end_month, 1)
        planned_duration_days = (planned_completion_date - start_date).days
        
        # Elapsed age until simulation snapshot (2026-03-31)
        age_days = (snapshot_date - start_date).days
        age_months = max(1, round(age_days / 30.4375))
        
        # 6. Bottleneck & Latent Delay Dynamic
        primary_bottleneck = random.choices(bottlenecks_pool, weights=bottleneck_weights, k=1)[0]
        if primary_bottleneck != "NONE":
            remaining_bottlenecks = [b for b in bottlenecks_pool if b != primary_bottleneck and b != "NONE"]
            secondary_bottleneck = random.choice(remaining_bottlenecks) if random.random() < 0.40 else "NONE"
        else:
            secondary_bottleneck = "NONE"
            
        # Bottleneck severity weight
        bottleneck_drag = {
            "NONE": 0.0, "PROCUREMENT": 0.15, "UTILITY_SHIFTING": 0.20,
            "DESIGN_CHANGE": 0.22, "CONTRACTOR": 0.28, "INTERDEPARTMENTAL_DEPENDENCY": 0.30,
            "ENVIRONMENTAL_CLEARANCE": 0.35, "FOREST_CLEARANCE": 0.38,
            "LEGAL_DISPUTE": 0.42, "LAND_ACQUISITION": 0.45
        }.get(primary_bottleneck, 0.1)
        
        # Project execution efficiency latent factor
        execution_efficiency = random.betavariate(3.5, 2.0) # centered around 0.64
        
        # Determine delay slippage months
        # Delay increases with bottleneck severity, project duration, and lower efficiency
        base_slippage = (bottleneck_drag * 1.5 + (1.0 - execution_efficiency) * 0.8) * planned_duration_months * 0.4
        stochastic_noise = random.gauss(0, 3.0)
        calculated_slippage_months = max(0, round(base_slippage + stochastic_noise))
        
        # Completed vs Ongoing
        is_completed = False
        revised_duration_months = planned_duration_months + calculated_slippage_months
        r_end_year = start_year + (start_month + revised_duration_months - 1) // 12
        r_end_month = (start_month + revised_duration_months - 1) % 12 + 1
        revised_completion_date = datetime(r_end_year, r_end_month, 1)
        revised_duration_days = (revised_completion_date - start_date).days
        
        if revised_completion_date <= snapshot_date:
            is_completed = True
            project_stage = "Commissioned"
            project_status = "COMPLETED"
        else:
            project_stage = "Execution"
            if calculated_slippage_months == 0:
                project_status = "ON_TRACK"
            elif calculated_slippage_months <= 6:
                project_status = "AT_RISK"
            elif calculated_slippage_months <= 18:
                project_status = "DELAYED"
            else:
                project_status = "CRITICAL"
                
        schedule_revisions_count = 0 if calculated_slippage_months == 0 else min(5, math.ceil(calculated_slippage_months / 8.0))
        
        # 7. Physical Progress %
        duration_consumed_ratio = min(1.0, max(0.05, age_days / max(1, revised_duration_days)))
        if is_completed:
            physical_progress_pct = 100.0
        else:
            # S-curve progression with bottleneck drag
            expected_prog = (1.0 / (1.0 + math.exp(-6.0 * (duration_consumed_ratio - 0.45)))) * 100.0
            prog_noise = random.uniform(-4.0, 4.0) - (bottleneck_drag * 8.0)
            physical_progress_pct = round(min(99.0, max(2.0, expected_prog + prog_noise)), 2)
            
        # 8. Cost Escalation & Expenditure
        # Cost growth correlates with delay slippage and bottleneck
        cost_escalation_factor = (calculated_slippage_months / max(12, planned_duration_months)) * 0.45 + (bottleneck_drag * 0.20) + random.uniform(-0.03, 0.05)
        cost_growth_pct = round(max(0.0, cost_escalation_factor * 100.0), 2)
        
        revised_cost_cr = round(original_cost_cr * (1.0 + cost_growth_pct / 100.0), 2)
        cost_overrun_cr = round(revised_cost_cr - original_cost_cr, 2)
        
        # Cumulative Expenditure
        if is_completed:
            # At completion, expenditure is between 96% and 100% of revised cost
            cumulative_expenditure_cr = round(revised_cost_cr * random.uniform(0.97, 1.00), 2)
        else:
            # Financial progress is physical progress +/- decoupling gap
            # Decoupling gap positive = front-loaded payment / advanced procurement / early utility cost
            decoupling_draw = random.gauss(bottleneck_drag * 15.0, 6.0)
            target_fin_pct = min(98.0, max(1.0, physical_progress_pct + decoupling_draw))
            cumulative_expenditure_cr = round(min(revised_cost_cr * 0.98, revised_cost_cr * (target_fin_pct / 100.0)), 2)
            
        financial_progress_pct = round(min(100.0, (cumulative_expenditure_cr / revised_cost_cr) * 100.0), 2)
        progress_decoupling_gap = round(financial_progress_pct - physical_progress_pct, 2)
        
        # 9. Milestones Generation
        total_milestones = 10
        # Determine completed milestones based on physical progress
        completed_m_count = min(total_milestones, max(0, int(physical_progress_pct / 10.5)))
        if is_completed:
            completed_m_count = total_milestones
            
        delayed_m_count = 0
        at_risk_m_count = 0
        
        project_m_list = []
        for m_idx, (m_code, m_desc, m_target_share, m_dep) in enumerate(MILESTONE_TEMPLATES, 1):
            m_planned_day = int(planned_duration_days * m_target_share)
            m_planned_date = start_date + timedelta(days=m_planned_day)
            
            if m_idx <= completed_m_count:
                m_status = "COMPLETED"
                m_delay = max(0, round(calculated_slippage_months * 30.4 * (m_idx / total_milestones) * 0.8 + random.uniform(-10, 15)))
                m_actual_date = (m_planned_date + timedelta(days=m_delay)).strftime("%Y-%m-%d")
                if m_delay > 30:
                    delayed_m_count += 1
            elif m_idx == completed_m_count + 1 and not is_completed:
                if calculated_slippage_months > 6:
                    m_status = "DELAYED"
                    m_delay = calculated_slippage_months * 30
                    delayed_m_count += 1
                elif calculated_slippage_months > 2:
                    m_status = "AT_RISK"
                    m_delay = calculated_slippage_months * 15
                    at_risk_m_count += 1
                else:
                    m_status = "ON_TRACK"
                    m_delay = 0
                m_actual_date = ""
            else:
                m_status = "NOT_STARTED"
                m_delay = 0
                m_actual_date = ""
                
            project_milestones.append({
                "milestone_id": f"{project_id}-{m_code}",
                "project_id": project_id,
                "milestone_name": m_desc,
                "sequence": m_idx,
                "planned_date": m_planned_date.strftime("%Y-%m-%d"),
                "actual_date": m_actual_date,
                "status": m_status,
                "delay_days": m_delay,
                "dependency_type": m_dep
            })
            
        milestone_delay_rate = round(delayed_m_count / total_milestones, 4)
        
        # 10. Temporal Monthly Progress Sample (for a subset of projects or recent 12 months)
        if i <= 500: # detailed time-series for 500 representative projects
            num_months_history = min(18, age_months)
            cur_phys = physical_progress_pct
            cur_spend = cumulative_expenditure_cr
            for hist_m in range(num_months_history, 0, -1):
                hist_date = snapshot_date - timedelta(days=hist_m * 30)
                m_ratio = max(0.01, (age_months - hist_m) / max(1, age_months))
                hist_phys = round(max(0.5, cur_phys * (m_ratio ** 1.2)), 2)
                hist_spend = round(max(1.0, cur_spend * (m_ratio ** 1.1)), 2)
                project_progress.append({
                    "project_id": project_id,
                    "reporting_date": hist_date.strftime("%Y-%m-%d"),
                    "reporting_month": (age_months - hist_m),
                    "physical_progress_pct": hist_phys,
                    "cumulative_expenditure_cr": hist_spend
                })
                
        # 11. Ground-Truth Target Labels (Continuous & Discrete)
        # Latent continuous delay in months
        target_schedule_delay_months = calculated_slippage_months
        target_cost_overrun_pct = cost_growth_pct
        
        # Target Risk Tier (Classification ground truth)
        # Realistic infrastructure distribution: LOW ~40%, MODERATE ~30%, HIGH ~20%, CRITICAL ~10%
        delay_component = min(40.0, (target_schedule_delay_months / 32.0) * 40.0)
        cost_component = min(30.0, (target_cost_overrun_pct / 38.0) * 30.0)
        gap_component = min(15.0, (max(0.0, progress_decoupling_gap) / 25.0) * 15.0)
        milestone_component = min(15.0, milestone_delay_rate * 15.0)
        
        raw_risk_score = delay_component + cost_component + gap_component + milestone_component + random.uniform(-2.5, 2.5)
        overall_risk_score = round(min(100.0, max(0.0, raw_risk_score)), 1)
        
        if overall_risk_score < 35.0:
            target_risk_class = "LOW"
        elif overall_risk_score < 53.0:
            target_risk_class = "MODERATE"
        elif overall_risk_score < 66.0:
            target_risk_class = "HIGH"
        else:
            target_risk_class = "CRITICAL"
        
        # Form clean project entity
        clean_record = {
            "project_id": project_id,
            "project_name": project_name,
            "ministry": ministry,
            "department": department,
            "sector": sector,
            "sub_sector": sub_sector,
            "state": state,
            "region": region,
            "implementing_agency": implementing_agency,
            "project_type": project_type,
            "project_status": project_status,
            "project_stage": project_stage,
            "original_cost_cr": original_cost_cr,
            "revised_cost_cr": revised_cost_cr,
            "cost_overrun_cr": cost_overrun_cr,
            "cost_growth_pct": cost_growth_pct,
            "cumulative_expenditure_cr": cumulative_expenditure_cr,
            "physical_progress_pct": physical_progress_pct,
            "financial_progress_pct": financial_progress_pct,
            "progress_decoupling_gap": progress_decoupling_gap,
            "start_date": start_date.strftime("%Y-%m-%d"),
            "planned_completion_date": planned_completion_date.strftime("%Y-%m-%d"),
            "revised_completion_date": revised_completion_date.strftime("%Y-%m-%d"),
            "planned_duration_months": planned_duration_months,
            "revised_duration_months": revised_duration_months,
            "schedule_slippage_months": calculated_slippage_months,
            "schedule_revisions_count": schedule_revisions_count,
            "milestone_count": total_milestones,
            "milestones_completed": completed_m_count,
            "milestones_delayed": delayed_m_count,
            "milestones_at_risk": at_risk_m_count,
            "milestone_delay_rate": milestone_delay_rate,
            "primary_bottleneck": primary_bottleneck,
            "secondary_bottleneck": secondary_bottleneck,
            "target_schedule_delay_months": target_schedule_delay_months,
            "target_cost_overrun_pct": target_cost_overrun_pct,
            "target_risk_class": target_risk_class,
            "overall_risk_score": overall_risk_score,
            "data_source": "PAIMANA-Modeled Synthetic Baseline",
            "data_status": "SYNTHETIC"
        }
        projects_clean.append(clean_record)
        
        # Form raw record with realistic controlled missingness
        raw_record = dict(clean_record)
        if random.random() < (cfg["missingness"]["department_missing_pct"] / 100.0):
            raw_record["department"] = ""
        if random.random() < (cfg["missingness"]["sub_sector_missing_pct"] / 100.0):
            raw_record["sub_sector"] = ""
        if raw_record["secondary_bottleneck"] != "NONE" and random.random() < (cfg["missingness"]["secondary_bottleneck_missing_pct"] / 100.0):
            raw_record["secondary_bottleneck"] = ""
        projects_raw.append(raw_record)
        
        # Form ML-Ready feature record (PREDICTION-TIME FEATURES ONLY + SEPARATED TARGETS)
        # Note: revised_cost_cr, cost_overrun_cr, revised_completion_date, schedule_slippage_months
        # are OUTCOMES of delay/cost growth and MUST NOT be fed as input features to prevent leakage!
        ml_record = {
            "project_id": project_id,
            # Categorical static features
            "ministry": ministry,
            "sector": sector,
            "state": state,
            "region": region,
            "implementing_agency": implementing_agency,
            "project_type": project_type,
            # Baseline financial & schedule constraints
            "original_cost_cr": original_cost_cr,
            "planned_duration_months": planned_duration_months,
            "project_age_months": age_months,
            "duration_elapsed_ratio": round(duration_consumed_ratio, 4),
            # Interim execution observation signals (observable at snapshot)
            "cumulative_expenditure_cr": cumulative_expenditure_cr,
            "physical_progress_pct": physical_progress_pct,
            "interim_financial_progress_pct": round((cumulative_expenditure_cr / original_cost_cr) * 100.0, 2),
            "progress_decoupling_gap": progress_decoupling_gap,
            "milestone_count": total_milestones,
            "milestones_completed": completed_m_count,
            "milestones_delayed": delayed_m_count,
            "milestones_at_risk": at_risk_m_count,
            "milestone_delay_rate": milestone_delay_rate,
            "primary_bottleneck": primary_bottleneck,
            # Ground-Truth Targets (Explicitly isolated for training)
            "target_schedule_delay_months": target_schedule_delay_months,
            "target_cost_overrun_pct": target_cost_overrun_pct,
            "target_risk_class": target_risk_class
        }
        ml_ready_projects.append(ml_record)

    # 12. Write CSV Files
    print(f"[Dataset Generator] Writing projects_clean.csv...")
    with open(proc_dir / "projects_clean.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=projects_clean[0].keys())
        writer.writeheader()
        writer.writerows(projects_clean)
        
    print(f"[Dataset Generator] Writing projects_raw.csv...")
    with open(raw_dir / "projects_raw.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=projects_raw[0].keys())
        writer.writeheader()
        writer.writerows(projects_raw)

    print(f"[Dataset Generator] Writing ml_ready_projects.csv...")
    with open(proc_dir / "ml_ready_projects.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=ml_ready_projects[0].keys())
        writer.writeheader()
        writer.writerows(ml_ready_projects)

    print(f"[Dataset Generator] Writing project_milestones.csv...")
    with open(proc_dir / "project_milestones.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=project_milestones[0].keys())
        writer.writeheader()
        writer.writerows(project_milestones)

    print(f"[Dataset Generator] Writing project_progress.csv...")
    with open(proc_dir / "project_progress.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=project_progress[0].keys())
        writer.writeheader()
        writer.writerows(project_progress)

    # 13. Write Example JSON (4 distinct representatives: LOW, MODERATE, HIGH, CRITICAL)
    print(f"[Dataset Generator] Generating example_project.json...")
    examples_by_class = {}
    for p in projects_clean:
        cls = p["target_risk_class"]
        if cls not in examples_by_class:
            examples_by_class[cls] = p
        if len(examples_by_class) == 4:
            break
            
    example_payload = []
    for cls in ["LOW", "MODERATE", "HIGH", "CRITICAL"]:
        p = examples_by_class.get(cls)
        if p:
            # Find its milestones
            m_subset = [m for m in project_milestones if m["project_id"] == p["project_id"]]
            example_item = {
                "project_id": p["project_id"],
                "project_name": p["project_name"],
                "ministry": p["ministry"],
                "department": p["department"],
                "sector": p["sector"],
                "state": p["state"],
                "implementing_agency": p["implementing_agency"],
                "status": "Ongoing" if p["project_status"] != "COMPLETED" else "Commissioned",
                "financials": {
                    "original_cost_cr": p["original_cost_cr"],
                    "revised_cost_cr": p["revised_cost_cr"],
                    "cumulative_expenditure_cr": p["cumulative_expenditure_cr"],
                    "cost_overrun_cr": p["cost_overrun_cr"]
                },
                "progress": {
                    "physical_progress_pct": p["physical_progress_pct"],
                    "financial_progress_pct": p["financial_progress_pct"],
                    "progress_gap_pct": p["progress_decoupling_gap"]
                },
                "schedule": {
                    "start_date": p["start_date"][:7],
                    "planned_completion_date": p["planned_completion_date"][:7],
                    "revised_completion_date": p["revised_completion_date"][:7],
                    "delay_duration_months": p["schedule_slippage_months"],
                    "schedule_revisions_count": p["schedule_revisions_count"]
                },
                "milestones": [
                    {
                        "id": m["milestone_id"].split("-")[-1],
                        "name": m["milestone_name"],
                        "planned_date": m["planned_date"],
                        "status": m["status"],
                        "delay_days": m["delay_days"],
                        "dependency": m["dependency_type"]
                    }
                    for m in m_subset
                ],
                "risk": {
                    "overall_score": p["overall_risk_score"],
                    "level": p["target_risk_class"],
                    "schedule_score": min(100, round(p["target_schedule_delay_months"] * 2.8, 1)),
                    "cost_score": min(100, round(p["target_cost_overrun_pct"] * 2.2, 1)),
                    "implementation_score": 85.0 if p["primary_bottleneck"] != "NONE" else 15.0,
                    "primary_driver": f"Bottleneck: {p['primary_bottleneck'].replace('_', ' ').title()}",
                    "drivers": [
                        { "rank": 1, "name": p["primary_bottleneck"].replace('_', ' ').title(), "strength_pct": 52, "evidence": f"Reported constraint in {p['state']}" },
                        { "rank": 2, "name": "Milestone Slippage Rate", "strength_pct": 28, "evidence": f"{p['milestones_delayed']} milestones delayed" },
                        { "rank": 3, "name": "Decoupling Gap", "strength_pct": 20, "evidence": f"Expenditure leads physical progress by {p['progress_decoupling_gap']}%" }
                    ],
                    "observed_signals": [
                        { "label": "Physical Completion", "value": f"{p['physical_progress_pct']}%", "context": "Reported work accomplished" },
                        { "label": "Expenditure", "value": f"₹{p['cumulative_expenditure_cr']} Cr", "context": f"{p['financial_progress_pct']}% of sanctioned budget" }
                    ],
                    "attribution_note": "Synthetic risk attribution generated for Phase 1/2 demonstration"
                },
                "metadata": {
                    "data_source": "MoSPI IPMD PAIMANA Schema",
                    "data_status": "SYNTHETIC",
                    "last_updated": "2026-03-31"
                }
            }
            example_payload.append(example_item)
            
    with open(ex_dir / "example_project.json", "w", encoding="utf-8") as f:
        json.dump(example_payload, f, indent=2)

    # 14. Write Corrupted Data Quality Test Cases (for Level 1-5 validation test suite)
    print(f"[Dataset Generator] Generating data_quality_test_cases.csv...")
    corrupted_cases = [
        # 1. Negative cost
        dict(projects_clean[0], project_id="TC-ERR-0001", original_cost_cr=-250.0, test_defect_type="NEGATIVE_COST"),
        # 2. Cost below MoSPI ₹150 Cr threshold
        dict(projects_clean[1], project_id="TC-ERR-0002", original_cost_cr=45.0, test_defect_type="COST_BELOW_MOSPI_THRESHOLD"),
        # 3. Expenditure exceeds revised cost
        dict(projects_clean[2], project_id="TC-ERR-0003", revised_cost_cr=500.0, cumulative_expenditure_cr=750.0, test_defect_type="EXPENDITURE_EXCEEDS_REVISED_COST"),
        # 4. Physical progress > 100
        dict(projects_clean[3], project_id="TC-ERR-0004", physical_progress_pct=135.5, test_defect_type="PHYSICAL_PROGRESS_OVER_100"),
        # 5. Financial progress > 100
        dict(projects_clean[4], project_id="TC-ERR-0005", financial_progress_pct=142.0, test_defect_type="FINANCIAL_PROGRESS_OVER_100"),
        # 6. Inverted timeline: planned date earlier than start date
        dict(projects_clean[5], project_id="TC-ERR-0006", start_date="2022-06-01", planned_completion_date="2021-01-01", test_defect_type="PLANNED_BEFORE_START"),
        # 7. Inverted timeline: revised date earlier than planned date
        dict(projects_clean[6], project_id="TC-ERR-0007", planned_completion_date="2025-12-01", revised_completion_date="2024-01-01", test_defect_type="REVISED_BEFORE_PLANNED"),
        # 8. Duplicate Project ID
        dict(projects_clean[7], project_id="PRJ-SYN-000001", test_defect_type="DUPLICATE_ID"),
        # 9. Milestones completed exceeds total milestone count
        dict(projects_clean[8], project_id="TC-ERR-0009", milestone_count=8, milestones_completed=12, test_defect_type="COMPLETED_EXCEEDS_TOTAL_MILESTONES"),
        # 10. Milestones delayed exceeds total milestone count
        dict(projects_clean[9], project_id="TC-ERR-0010", milestone_count=10, milestones_delayed=15, test_defect_type="DELAYED_EXCEEDS_TOTAL_MILESTONES"),
        # 11. Invalid categorical ministry
        dict(projects_clean[10], project_id="TC-ERR-0011", ministry="Ministry of Magic & Sorcery", test_defect_type="INVALID_MINISTRY_ENUM"),
        # 12. Invalid categorical status
        dict(projects_clean[11], project_id="TC-ERR-0012", project_status="SUPER_DELAYED", test_defect_type="INVALID_STATUS_ENUM")
    ]
    with open(tc_dir / "data_quality_test_cases.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=corrupted_cases[0].keys())
        writer.writeheader()
        writer.writerows(corrupted_cases)

    print(f"[Dataset Generator] Generation complete! Output directory: {output_dir}")
    print(f"  - Clean projects: {len(projects_clean)}")
    print(f"  - Raw projects: {len(projects_raw)}")
    print(f"  - ML-Ready projects: {len(ml_ready_projects)}")
    print(f"  - Milestones: {len(project_milestones)}")
    print(f"  - Progress history snapshots: {len(project_progress)}")
    print(f"  - Corrupted test cases: {len(corrupted_cases)}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate synthetic PAIMANA-modeled infrastructure dataset.")
    parser.add_argument("--projects", type=int, default=10000, help="Number of projects to generate")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for reproducibility")
    parser.add_argument("--output-dir", type=str, default="data", help="Output directory path")
    parser.add_argument("--config", type=str, default="config/data_generation_config.json", help="Configuration file path")
    args = parser.parse_args()
    
    generate_dataset(num_records=args.projects, seed=args.seed, output_dir=args.output_dir, config_path=args.config)
