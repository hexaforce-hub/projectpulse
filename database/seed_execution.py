"""
ProjectPulse — Phase 11 / SIH 2026 Execution Intelligence Schema & Seeder
Ministry of Statistics & Programme Implementation (MoSPI) / IPMD
Smart India Hackathon 2026 — Team HexaForce

Initializes:
1. execution_plans, work_packages, task_dependencies, task_progress, sites tables
2. Tasks schema evolution (safely ALTER TABLE tasks ADD COLUMN ...)
3. Field Officer persona (USR-FO-01 / fo)
4. Synthetic Bridge Execution Portfolio (PRJ-SYN-000002):
   - 1 Execution Plan (APPROVED)
   - 12 Work Packages (WBS 1.1 to 1.12)
   - 54 Tasks with physical targets & quantities
   - 18 CPM Milestones
   - 37 Finish-to-Start Dependencies (DAG)
   - 3 Construction Sites
   - Historical task progress log + pending engineer verification queue
"""

import sqlite3
import time
from pathlib import Path
from datetime import datetime, timedelta

DB_PATH = Path(__file__).parent.parent / "data" / "projectpulse.db"

def init_execution_schema(conn: sqlite3.Connection):
    cursor = conn.cursor()

    # 1. Execution Plans Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS execution_plans (
            plan_id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
            version INTEGER NOT NULL DEFAULT 1,
            status TEXT NOT NULL DEFAULT 'DRAFT',
            generated_by TEXT NOT NULL,
            approved_by TEXT,
            approved_at TEXT,
            source_basis TEXT DEFAULT 'DOCUMENT_EXTRACTED',
            confidence_score REAL DEFAULT 0.85,
            summary TEXT,
            created_at TEXT NOT NULL
        )
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_exec_plans_project ON execution_plans(project_id)")

    # 2. Work Packages (WBS) Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS work_packages (
            package_id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
            plan_id TEXT REFERENCES execution_plans(plan_id) ON DELETE CASCADE,
            code TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            weightage_pct REAL DEFAULT 0.0,
            planned_start TEXT,
            planned_end TEXT,
            actual_start TEXT,
            actual_end TEXT,
            status TEXT NOT NULL DEFAULT 'NOT_STARTED',
            site_id TEXT
        )
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_work_packages_project ON work_packages(project_id)")

    # 3. Safe Schema Evolution on Tasks Table
    cursor.execute("PRAGMA table_info(tasks)")
    existing_cols = {row[1] for row in cursor.fetchall()}
    
    new_cols = [
        ("work_package_id", "TEXT"),
        ("parent_task_id", "TEXT"),
        ("planned_start", "TEXT"),
        ("planned_end", "TEXT"),
        ("actual_start", "TEXT"),
        ("actual_end", "TEXT"),
        ("target_quantity", "REAL DEFAULT 0.0"),
        ("completed_quantity", "REAL DEFAULT 0.0"),
        ("unit", "TEXT DEFAULT 'units'"),
        ("target_period", "TEXT DEFAULT 'DAILY'"),
        ("planned_progress", "REAL DEFAULT 0.0"),
        ("actual_progress", "REAL DEFAULT 0.0"),
        ("source", "TEXT DEFAULT 'HUMAN'"),
        ("source_document", "TEXT"),
        ("ai_generated", "INTEGER DEFAULT 0"),
        ("ai_confidence", "REAL DEFAULT 1.0"),
        ("approval_status", "TEXT DEFAULT 'APPROVED'"),
        ("verification_status", "TEXT DEFAULT 'UNVERIFIED'"),
        ("early_start", "INTEGER DEFAULT 0"),
        ("early_finish", "INTEGER DEFAULT 0"),
        ("late_start", "INTEGER DEFAULT 0"),
        ("late_finish", "INTEGER DEFAULT 0"),
        ("total_float", "INTEGER DEFAULT 0"),
        ("is_critical", "INTEGER DEFAULT 0")
    ]

    for col_name, col_type in new_cols:
        if col_name not in existing_cols:
            cursor.execute(f"ALTER TABLE tasks ADD COLUMN {col_name} {col_type}")

    cursor.execute("CREATE INDEX IF NOT EXISTS idx_tasks_work_package ON tasks(work_package_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_tasks_target_period ON tasks(target_period)")

    # 4. Task Dependencies Table (Graph Edges)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS task_dependencies (
            dependency_id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
            predecessor_task_id TEXT NOT NULL REFERENCES tasks(task_id) ON DELETE CASCADE,
            successor_task_id TEXT NOT NULL REFERENCES tasks(task_id) ON DELETE CASCADE,
            dependency_type TEXT NOT NULL DEFAULT 'FS',
            lag_days INTEGER NOT NULL DEFAULT 0,
            is_critical INTEGER NOT NULL DEFAULT 0
        )
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_deps_project ON task_dependencies(project_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_deps_pred ON task_dependencies(predecessor_task_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_deps_succ ON task_dependencies(successor_task_id)")

    # 5. Task Progress Execution Time-Series Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS task_progress (
            progress_id TEXT PRIMARY KEY,
            task_id TEXT NOT NULL REFERENCES tasks(task_id) ON DELETE CASCADE,
            project_id TEXT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
            report_date TEXT NOT NULL,
            quantity_completed REAL NOT NULL DEFAULT 0.0,
            unit TEXT,
            progress_pct REAL NOT NULL DEFAULT 0.0,
            notes TEXT,
            evidence_url TEXT,
            submitted_by TEXT NOT NULL REFERENCES users(user_id),
            submitted_at TEXT NOT NULL,
            verification_status TEXT NOT NULL DEFAULT 'PENDING',
            verified_by TEXT REFERENCES users(user_id),
            verified_at TEXT,
            rejection_reason TEXT,
            blocker_flag INTEGER DEFAULT 0,
            blocker_category TEXT
        )
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_progress_task ON task_progress(task_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_progress_proj ON task_progress(project_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_progress_status ON task_progress(verification_status)")

    # 6. Sites Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sites (
            site_id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            location TEXT,
            latitude REAL,
            longitude REAL,
            status TEXT DEFAULT 'ACTIVE'
        )
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_sites_project ON sites(project_id)")

    conn.commit()


def seed_execution_data(conn: sqlite3.Connection):
    cursor = conn.cursor()
    now_iso = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

    # 1. Ensure Field Officer (USR-FO-01) is registered
    cursor.execute("""
        INSERT OR REPLACE INTO users (
            user_id, username, password, name, designation, division, ministry,
            role, scope_type, scope_value, badge, status, created_at
        ) VALUES (
            'USR-FO-01', 'fo', 'fo123',
            'Shri Sanjay Sharma', 'Resident Field Officer & Site Inspector',
            'NH-44 Works Division (PKG-3)', 'Ministry of Road Transport & Highways',
            'FIELD_OFFICER', 'SITE', 'PRJ-SYN-000002',
            'Field Officer', 'ACTIVE', ?
        )
    """, (now_iso,))

    cursor.execute("""
        INSERT OR REPLACE INTO project_assignments (
            assignment_id, user_id, project_id, assignment_role, site_id, start_date, status
        ) VALUES (
            'ASG-FO-001', 'USR-FO-01', 'PRJ-SYN-000002', 'FIELD_OFFICER', 'SITE-GANGA-PIER', '2024-01-10', 'ACTIVE'
        )
    """)

    # 2. Seed Sites for PRJ-SYN-000002
    sites_data = [
        ("SITE-GANGA-NORTH", "PRJ-SYN-000002", "North Bank Viaduct & Abutment A1", "Km 0+000 to Km 12+400", 25.3216, 83.0210, "ACTIVE"),
        ("SITE-GANGA-PIER", "PRJ-SYN-000002", "Ganga River Midstream Piers P-01 to P-12", "Km 12+400 to Km 26+800", 25.3188, 83.0285, "ACTIVE"),
        ("SITE-GANGA-SOUTH", "PRJ-SYN-000002", "South Bank Interchange & Approach Corridor", "Km 26+800 to Km 45+500", 25.3050, 83.0450, "ACTIVE")
    ]
    cursor.executemany("""
        INSERT OR REPLACE INTO sites (site_id, project_id, name, location, latitude, longitude, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, sites_data)

    # 3. Seed Execution Plan for PRJ-SYN-000002
    plan_id = "PLAN-PRJ-SYN-000002-V1"
    cursor.execute("""
        INSERT OR REPLACE INTO execution_plans (
            plan_id, project_id, version, status, generated_by, approved_by, approved_at,
            source_basis, confidence_score, summary, created_at
        ) VALUES (
            ?, 'PRJ-SYN-000002', 1, 'APPROVED', 'AI_PIPELINE', 'USR-PM-01', '2024-03-01 10:00:00',
            'DOCUMENT_EXTRACTED', 0.94,
            'Master WBS Execution Baseline synthesized from DPR, EPC Schedule III, Geotechnical Borehole Logs, and MoRTH Specifications.',
            '2024-02-28 14:20:00'
        )
    """, (plan_id,))

    # 4. Seed 12 Work Packages (WBS 1.1 to 1.12)
    work_packages = [
        ("WP-01", "PRJ-SYN-000002", plan_id, "WBS 1.1", "Site Mobilization, ROW Clearance & Utility Diversion", "Establishment of base camp, batching plants, and right-of-way demarcation", 5.0, "2024-02-01", "2024-06-30", "2024-02-01", "2024-06-25", "COMPLETED", "SITE-GANGA-NORTH"),
        ("WP-02", "PRJ-SYN-000002", plan_id, "WBS 1.2", "Geotechnical Investigations & Deep River Soil Profiling", "Sonic logging, standard penetration tests, and riverbed strata characterization", 5.0, "2024-03-01", "2024-07-31", "2024-03-05", "2024-07-28", "COMPLETED", "SITE-GANGA-PIER"),
        ("WP-03", "PRJ-SYN-000002", plan_id, "WBS 1.3", "North Viaduct Substructure & Pile Foundations (P1-P4)", "Bored cast-in-situ piles of 2.0m dia and pile caps for north shore piers", 12.0, "2024-07-01", "2025-02-28", "2024-07-10", None, "IN_PROGRESS", "SITE-GANGA-NORTH"),
        ("WP-04", "PRJ-SYN-000002", plan_id, "WBS 1.4", "River Well Foundations & Caissons (P5-P8)", "Pneumatic/open caisson sinking in deep river channel with scour protection", 15.0, "2024-08-15", "2025-05-31", "2024-08-20", None, "IN_PROGRESS", "SITE-GANGA-PIER"),
        ("WP-05", "PRJ-SYN-000002", plan_id, "WBS 1.5", "South Viaduct Substructure & Piles (P9-P12)", "Pile group drilling and reinforcement cage installation for south bank viaduct", 10.0, "2024-10-01", "2025-06-30", "2024-10-15", None, "IN_PROGRESS", "SITE-GANGA-SOUTH"),
        ("WP-06", "PRJ-SYN-000002", plan_id, "WBS 1.6", "Pier Shafts & Heavy Duty Pier Caps Concreting", "Slipform climbing shuttering for pier columns and cantilever pier caps", 12.0, "2025-01-01", "2025-10-31", "2025-01-15", None, "IN_PROGRESS", "SITE-GANGA-PIER"),
        ("WP-07", "PRJ-SYN-000002", plan_id, "WBS 1.7", "Precast Segment Casting Yard Setup & Production", "Short-line match casting method for 640 precast box girder segments", 10.0, "2024-06-01", "2025-12-31", "2024-06-15", None, "IN_PROGRESS", "SITE-GANGA-NORTH"),
        ("WP-08", "PRJ-SYN-000002", plan_id, "WBS 1.8", "Superstructure Balanced Cantilever Segment Erection", "Launching gantry operations for span-by-span epoxy glued segment erection", 15.0, "2025-06-01", "2026-06-30", None, None, "NOT_STARTED", "SITE-GANGA-PIER"),
        ("WP-09", "PRJ-SYN-000002", plan_id, "WBS 1.9", "Extradosed Stay Cable Supply, Tensioning & Damping", "High tensile galvanized strands with internal waxing and viscoelastic dampers", 6.0, "2025-11-01", "2026-08-31", None, None, "NOT_STARTED", "SITE-GANGA-PIER"),
        ("WP-10", "PRJ-SYN-000002", plan_id, "WBS 1.10", "Bridge Deck Concreting, Waterproofing & Wearing Course", "Mastic asphalt wearing coat, expansion joints, and bridge drainage manifolds", 5.0, "2026-04-01", "2026-11-30", None, None, "NOT_STARTED", "SITE-GANGA-PIER"),
        ("WP-11", "PRJ-SYN-000002", plan_id, "WBS 1.11", "North & South Approach Embankment & RE Walls", "Reinforced earth retaining walls and granular sub-base for high approach fills", 3.0, "2025-08-01", "2026-12-31", "2025-08-15", None, "IN_PROGRESS", "SITE-GANGA-SOUTH"),
        ("WP-12", "PRJ-SYN-000002", plan_id, "WBS 1.12", "Highway Safety Barriers, Lighting & Static Load Testing", "Crash barriers, navigational lighting, solar SCADA, and proof loading", 2.0, "2026-10-01", "2027-04-30", None, None, "NOT_STARTED", "SITE-GANGA-PIER")
    ]

    cursor.executemany("""
        INSERT OR REPLACE INTO work_packages (
            package_id, project_id, plan_id, code, name, description, weightage_pct,
            planned_start, planned_end, actual_start, actual_end, status, site_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, work_packages)

    # 5. Seed / Update 10 Macro CPM Milestones for PRJ-SYN-000002 (Preserves exactly 100,000 global milestones invariant)
    milestones_data = [
        ("PRJ-SYN-000002-M-01", "PRJ-SYN-000002", "Feasibility Study & DPR Approval", 1, "2024-01-23", "2024-01-23", "COMPLETED", 0, "MANDATORY"),
        ("PRJ-SYN-000002-M-02", "PRJ-SYN-000002", "Statutory Forest & Wildlife Clearances", 2, "2024-06-14", "2024-06-14", "COMPLETED", 0, "MANDATORY"),
        ("PRJ-SYN-000002-M-03", "PRJ-SYN-000002", "Land Acquisition 80% ROW Handover", 3, "2024-11-04", "2024-11-04", "COMPLETED", 0, "CRITICAL"),
        ("PRJ-SYN-000002-M-04", "PRJ-SYN-000002", "EPC Contractor Mobilization & Batching Plants", 4, "2025-03-27", "2025-03-27", "COMPLETED", 0, "MANDATORY"),
        ("PRJ-SYN-000002-M-05", "PRJ-SYN-000002", "North Viaduct Substructure & Piles P1-P4 (50%)", 5, "2025-09-15", None, "DELAYED", 14, "CRITICAL"),
        ("PRJ-SYN-000002-M-06", "PRJ-SYN-000002", "River Well Foundations & Caissons P5-P8 Sinking", 6, "2026-04-18", None, "IN_PROGRESS", 0, "CRITICAL"),
        ("PRJ-SYN-000002-M-07", "PRJ-SYN-000002", "Precast Yard 640 Segments Casting & Gantry Assembly", 7, "2026-08-30", None, "NOT_STARTED", 0, "TECHNICAL"),
        ("PRJ-SYN-000002-M-08", "PRJ-SYN-000002", "Superstructure Cantilever Erection & Stay Cables", 8, "2026-11-18", None, "NOT_STARTED", 0, "CRITICAL"),
        ("PRJ-SYN-000002-M-09", "PRJ-SYN-000002", "Deck Concreting, Waterproofing & Approach RE Walls", 9, "2027-04-10", None, "NOT_STARTED", 0, "TECHNICAL"),
        ("PRJ-SYN-000002-M-10", "PRJ-SYN-000002", "Static Proof Load Testing, Safety Audit & Public COD", 10, "2027-09-01", None, "NOT_STARTED", 0, "CRITICAL")
    ]

    cursor.executemany("""
        INSERT OR REPLACE INTO project_milestones (
            milestone_id, project_id, milestone_name, sequence, planned_date, actual_date, status, delay_days, dependency_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, milestones_data)

    # 6. Seed 54 Tasks for PRJ-SYN-000002
    tasks_catalog = [
        # WP-01: Preliminaries & ROW
        ("TSK-001", "PRJ-SYN-000002", "WP-06", "PRJ-SYN-000002-M-05", "SITE-GANGA-PIER", "USR-FIELD-01",
         "CIVIL_CONSTRUCTION", "Pier Cap P7 Concrete Reinforcement Inspection",
         "Verify rebar spacing, shear link tie-wires, and anchor bolt positioning before concrete pour",
         "HIGH", "IN_PROGRESS", "2026-09-15", "2024-07-01", "2026-09-15", "2024-07-05", None,
         80.0, 52.0, "m3", "DAILY", 65.0, 65.0, "DOCUMENT_EXTRACTED", "DPR_Section_4.pdf", 1, 0.95, "APPROVED", "VERIFIED", 0, 0),
        
        ("TSK-002", "PRJ-SYN-000002", "WP-01", "PRJ-SYN-000002-M-02", "SITE-GANGA-NORTH", "USR-FIELD-01",
         "LAND_CLEARANCE", "Forest Boundary Demarcation & Tree Felling Audit",
         "Complete pillar tagging across Chainage 142+000 to 148+500 with DFO team",
         "CRITICAL", "IN_PROGRESS", "2026-09-12", "2024-02-15", "2024-06-15", "2024-02-20", None,
         15.0, 11.0, "km", "WEEKLY", 73.3, 73.3, "DOCUMENT_EXTRACTED", "ForestClearance_Stage1.pdf", 1, 0.92, "APPROVED", "VERIFIED", 0, 0),

        ("TSK-003", "PRJ-SYN-000002", "WP-11", "PRJ-SYN-000002-M-09", "SITE-GANGA-SOUTH", "USR-FIELD-01",
         "CIVIL_CONSTRUCTION", "PQC Paving Slump & Core Sampling (Km 120-125)",
         "Quality testing on rigid pavement trial stretches and core compression analysis",
         "MEDIUM", "COMPLETED", "2024-06-20", "2024-05-01", "2024-06-20", "2024-05-01", "2024-06-18",
         240.0, 240.0, "samples", "DAILY", 100.0, 100.0, "DOCUMENT_EXTRACTED", "IRC_SP_84.pdf", 0, 1.0, "APPROVED", "VERIFIED", 0, 0),

        ("TSK-004", "PRJ-SYN-000002", "WP-07", "PRJ-SYN-000002-M-07", "SITE-GANGA-NORTH", "USR-ENGINEER-01",
         "EQUIPMENT_MAINTENANCE", "Pre-Cast Segment Gantry Crane Load Proofing",
         "Static deflection test and overload safety cutout certification by third-party inspector",
         "HIGH", "TODO", "2025-01-10", "2024-12-01", "2025-01-10", None, None,
         1.0, 0.0, "unit", "MONTHLY", 0.0, 0.0, "DOCUMENT_EXTRACTED", "Gantry_SOP.pdf", 1, 0.88, "APPROVED", "UNVERIFIED", 0, 0),

        ("TSK-005", "PRJ-SYN-000002", "WP-02", "PRJ-SYN-000002-M-01", "SITE-GANGA-PIER", "USR-ENGINEER-01",
         "SOIL_TESTING", "Foundation Soil Profile Core Test Report Ratification",
         "Review borehole core samples at Pier P-04 through P-08 and ratify bearing capacity",
         "HIGH", "IN_PROGRESS", "2024-07-15", "2024-04-01", "2024-07-15", "2024-04-05", None,
         18.0, 14.0, "boreholes", "WEEKLY", 77.8, 77.8, "DOCUMENT_EXTRACTED", "GeoTech_Borehole_P1_P12.pdf", 1, 0.96, "APPROVED", "VERIFIED", 0, 0),

        ("TSK-006", "PRJ-SYN-000002", "WP-01", "PRJ-SYN-000002-M-02", "SITE-GANGA-NORTH", "USR-ENGINEER-01",
         "STATUTORY_COMPLIANCE", "PARIVESH Portal Form-C Compliance Submission",
         "File compensatory afforestation deposit slip and geo-referenced boundary shapefiles",
         "MEDIUM", "COMPLETED", "2024-05-30", "2024-04-01", "2024-05-30", "2024-04-01", "2024-05-28",
         1.0, 1.0, "filing", "MONTHLY", 100.0, 100.0, "HUMAN", None, 0, 1.0, "APPROVED", "VERIFIED", 0, 0),
    ]

    detailed_tasks = [
        # WP-01 (Preliminaries)
        ("TSK-007", "WP-01", "PRJ-SYN-000002-M-04", "SITE-GANGA-NORTH", "USR-FIELD-01", "CIVIL_CONSTRUCTION", "Batching Plant 1 (60 m3/hr) Commissioning", "Calibration of aggregate hoppers and cement silos", "HIGH", "COMPLETED", "2024-04-10", "2024-03-01", "2024-04-10", "2024-03-01", "2024-04-08", 1.0, 1.0, "unit", "DAILY", 100.0, 100.0, 1, 0),
        ("TSK-008", "WP-01", "PRJ-SYN-000002-M-04", "SITE-GANGA-SOUTH", "USR-FIELD-01", "CIVIL_CONSTRUCTION", "Batching Plant 2 (60 m3/hr) South Bank Erection", "Erection of twin horizontal shaft mixer and fly ash silo", "HIGH", "COMPLETED", "2024-05-15", "2024-04-01", "2024-05-15", "2024-04-05", "2024-05-12", 1.0, 1.0, "unit", "DAILY", 100.0, 100.0, 1, 0),
        ("TSK-009", "WP-01", "PRJ-SYN-000002-M-03", "SITE-GANGA-NORTH", "USR-FO-01", "LAND_CLEARANCE", "High-Tension Power Line Relocation km 14+200", "Tower raising and conductor stringing over future approach", "CRITICAL", "COMPLETED", "2024-08-30", "2024-06-01", "2024-08-30", "2024-06-05", "2024-08-25", 2.0, 2.0, "towers", "WEEKLY", 100.0, 100.0, 1, 0),
        ("TSK-010", "WP-01", "PRJ-SYN-000002-M-04", "SITE-GANGA-PIER", "USR-FIELD-01", "EQUIPMENT_MAINTENANCE", "River Pontoon Jetty & Temporary Staging Construction", "Floating barge ramp for transporting heavy cranes into river", "CRITICAL", "COMPLETED", "2024-06-30", "2024-04-15", "2024-06-30", "2024-04-20", "2024-06-28", 450.0, 450.0, "m", "DAILY", 100.0, 100.0, 1, 0),

        # WP-02 (Geotech)
        ("TSK-011", "WP-02", "PRJ-SYN-000002-M-01", "SITE-GANGA-PIER", "USR-ENGINEER-01", "SOIL_TESTING", "Seismic Refraction Tomography across Riverbed", "Continuous geophysical mapping of bedrock depth across river width", "MEDIUM", "COMPLETED", "2024-05-20", "2024-04-01", "2024-05-20", "2024-04-02", "2024-05-18", 3.2, 3.2, "km", "DAILY", 100.0, 100.0, 0, 0),
        ("TSK-012", "WP-02", "PRJ-SYN-000002-M-01", "SITE-GANGA-PIER", "USR-ENGINEER-01", "SOIL_TESTING", "Crosshole Sonic Logging on Test Piles TP-01 & TP-02", "Acoustic profiling of concrete integrity and bedrock socketing", "HIGH", "COMPLETED", "2024-06-15", "2024-05-15", "2024-06-15", "2024-05-18", "2024-06-12", 2.0, 2.0, "piles", "WEEKLY", 100.0, 100.0, 1, 0),

        # WP-03 (North Viaduct Piles P1-P4)
        ("TSK-013", "WP-03", "PRJ-SYN-000002-M-05", "SITE-GANGA-NORTH", "USR-FIELD-01", "CIVIL_CONSTRUCTION", "Pier P-01 Bored Pile Drilling & Bentonite Circulation", "Hydraulic rotary rig drilling of 16 piles to 45m depth", "HIGH", "COMPLETED", "2024-09-30", "2024-07-10", "2024-09-30", "2024-07-12", "2024-09-28", 16.0, 16.0, "piles", "DAILY", 100.0, 100.0, 1, 0),
        ("TSK-014", "WP-03", "PRJ-SYN-000002-M-05", "SITE-GANGA-NORTH", "USR-FIELD-01", "CIVIL_CONSTRUCTION", "Pier P-04 Well Foundation Excavation & Sinking", "Well curb sinking with heavy grab dredging; 80 m3 daily target", "CRITICAL", "IN_PROGRESS", "2025-01-20", "2024-10-01", "2025-01-20", "2024-10-05", None, 80.0, 52.0, "m3", "DAILY", 65.0, 65.0, 1, 1),
        ("TSK-015", "WP-03", "PRJ-SYN-000002-M-05", "SITE-GANGA-NORTH", "USR-FIELD-01", "CIVIL_CONSTRUCTION", "Pier P-02 Pile Cap Reinforcement & M45 Pour", "Mass concrete pour of 850 m3 pile cap with chilled water batching", "HIGH", "COMPLETED", "2024-11-15", "2024-10-01", "2024-11-15", "2024-10-02", "2024-11-12", 850.0, 850.0, "m3", "DAILY", 100.0, 100.0, 1, 0),
        ("TSK-016", "WP-03", "PRJ-SYN-000002-M-05", "SITE-GANGA-NORTH", "USR-ENGINEER-01", "QUALITY_INSPECTION", "Sonic Integrity Testing on Pier P-03 Pile Group", "Low-strain impact testing of 16 piles for pile necking/voids", "HIGH", "COMPLETED", "2024-12-10", "2024-11-20", "2024-12-10", "2024-11-22", "2024-12-08", 16.0, 16.0, "piles", "DAILY", 100.0, 100.0, 0, 0),

        # WP-04 (Deep River Caissons P5-P8)
        ("TSK-017", "WP-04", "PRJ-SYN-000002-M-06", "SITE-GANGA-PIER", "USR-FIELD-01", "CIVIL_CONSTRUCTION", "Pier P-05 Steel Cutting Edge Assembly & Floating", "Fabrication of 24m diameter double-walled steel cutting curb", "CRITICAL", "COMPLETED", "2024-10-31", "2024-08-20", "2024-10-31", "2024-08-25", "2024-10-28", 1.0, 1.0, "unit", "WEEKLY", 100.0, 100.0, 1, 1),
        ("TSK-018", "WP-04", "PRJ-SYN-000002-M-06", "SITE-GANGA-PIER", "USR-FIELD-01", "CIVIL_CONSTRUCTION", "Pier P-05 Well Steining Concreting Lift 1 to 5", "Cast M35 steining wall in 2.5m lifts using slipform shutters", "CRITICAL", "IN_PROGRESS", "2025-02-28", "2024-11-01", "2025-02-28", "2024-11-05", None, 12.5, 8.5, "m", "DAILY", 68.0, 68.0, 1, 1),
        ("TSK-019", "WP-04", "PRJ-SYN-000002-M-06", "SITE-GANGA-PIER", "USR-FO-01", "QUALITY_INSPECTION", "Tilt and Shift Monitoring Pier P-05 River Caisson", "Dual-axis inclinometer and Total Station survey during sinking", "HIGH", "IN_PROGRESS", "2025-03-15", "2024-11-10", "2025-03-15", "2024-11-10", None, 45.0, 32.0, "scans", "DAILY", 71.1, 71.1, 1, 0),
        ("TSK-020", "WP-04", "PRJ-SYN-000002-M-08", "SITE-GANGA-PIER", "USR-FIELD-01", "CIVIL_CONSTRUCTION", "Pier P-06 Deep Well Sinking in Main River Channel", "Water jetting and underwater grab dredging below river bed level", "CRITICAL", "IN_PROGRESS", "2025-05-30", "2024-12-01", "2025-05-30", "2024-12-10", None, 38.0, 16.0, "m", "DAILY", 42.1, 42.1, 1, 1),
        ("TSK-021", "WP-04", "PRJ-SYN-000002-M-08", "SITE-GANGA-PIER", "USR-FIELD-01", "CIVIL_CONSTRUCTION", "Pier P-07 River Caisson Steining Lift 1 to 4", "Concreting outer wall steining under controlled river conditions", "HIGH", "IN_PROGRESS", "2025-06-15", "2025-01-10", "2025-06-15", "2025-01-15", None, 10.0, 4.0, "m", "DAILY", 40.0, 40.0, 1, 0),
        ("TSK-022", "WP-04", "PRJ-SYN-000002-M-08", "SITE-GANGA-PIER", "USR-FIELD-01", "CIVIL_CONSTRUCTION", "Pier P-08 Well Bottom Plug Tremie Concrete M35", "Continuous underwater tremie pour of 1200 m3 bottom seal plug", "CRITICAL", "TODO", "2025-08-30", "2025-06-01", "2025-08-30", None, None, 1200.0, 0.0, "m3", "DAILY", 0.0, 0.0, 1, 1),

        # WP-05 (South Viaduct Substructure P9-P12)
        ("TSK-023", "WP-05", "PRJ-SYN-000002-M-08", "SITE-GANGA-SOUTH", "USR-FIELD-01", "CIVIL_CONSTRUCTION", "Pier P-09 South Abutment Pile Drilling (12 Piles)", "Bored cast in situ 1500mm diameter piles down to dense sand layer", "HIGH", "IN_PROGRESS", "2025-03-31", "2024-11-15", "2025-03-31", "2024-11-20", None, 12.0, 9.0, "piles", "WEEKLY", 75.0, 75.0, 0, 0),
        ("TSK-024", "WP-05", "PRJ-SYN-000002-M-08", "SITE-GANGA-SOUTH", "USR-FIELD-01", "CIVIL_CONSTRUCTION", "Pier P-10 & P-11 Pile Cap Concrete Pour", "Chilled M45 self-compacting concrete pour with curing membrane", "HIGH", "TODO", "2025-05-15", "2025-03-01", "2025-05-15", None, None, 1400.0, 0.0, "m3", "DAILY", 0.0, 0.0, 1, 0),
        ("TSK-025", "WP-05", "PRJ-SYN-000002-M-08", "SITE-GANGA-SOUTH", "USR-ENGINEER-01", "QUALITY_INSPECTION", "South Viaduct Abutment A2 Load Test Proofing", "Static test load of 2500 tonnes on reaction anchor assembly", "MEDIUM", "TODO", "2025-06-30", "2025-05-15", "2025-06-30", None, None, 1.0, 0.0, "test", "MONTHLY", 0.0, 0.0, 0, 0),

        # WP-06 (Pier Shafts & Pier Caps)
        ("TSK-026", "WP-06", "PRJ-SYN-000002-M-09", "SITE-GANGA-NORTH", "USR-FIELD-01", "CIVIL_CONSTRUCTION", "Pier P-01 & P-02 Column Shaft Climbing Formwork", "Slipform casting of 18m height hollow rectangular column shaft", "HIGH", "IN_PROGRESS", "2025-04-30", "2025-01-15", "2025-04-30", "2025-01-20", None, 36.0, 22.0, "m", "DAILY", 61.1, 61.1, 1, 1),
        ("TSK-027", "WP-06", "PRJ-SYN-000002-M-09", "SITE-GANGA-NORTH", "USR-FIELD-01", "CIVIL_CONSTRUCTION", "Pier P-03 Cantilever Pier Cap Shuttering & Post-Tensioning", "High-strength strand threading and two-stage hydraulic tensioning", "HIGH", "TODO", "2025-06-30", "2025-04-01", "2025-06-30", None, None, 2.0, 0.0, "caps", "WEEKLY", 0.0, 0.0, 1, 0),
        ("TSK-028", "WP-06", "PRJ-SYN-000002-M-09", "SITE-GANGA-PIER", "USR-FIELD-01", "CIVIL_CONSTRUCTION", "Main Pylon P-05 Lower Column Segment (0m to 25m)", "Slipform shuttering of diamond-leg pylon with embedded anchor plates", "CRITICAL", "TODO", "2025-08-30", "2025-05-01", "2025-08-30", None, None, 25.0, 0.0, "m", "DAILY", 0.0, 0.0, 1, 1),
        ("TSK-029", "WP-06", "PRJ-SYN-000002-M-09", "SITE-GANGA-PIER", "USR-FIELD-01", "CIVIL_CONSTRUCTION", "Main Pylon P-06 Lower Column Segment (0m to 25m)", "Twin pylon leg construction with internal maintenance staircase", "CRITICAL", "TODO", "2025-09-30", "2025-06-01", "2025-09-30", None, None, 25.0, 0.0, "m", "DAILY", 0.0, 0.0, 1, 1),
        ("TSK-030", "WP-06", "PRJ-SYN-000002-M-09", "SITE-GANGA-PIER", "USR-ENGINEER-01", "QUALITY_INSPECTION", "Pot-PTFE Bearings Seating & Alignment Inspection", "Laser alignment and leveling of spherical sliding bearings", "HIGH", "TODO", "2025-10-31", "2025-08-01", "2025-10-31", None, None, 24.0, 0.0, "bearings", "WEEKLY", 0.0, 0.0, 0, 0),

        # WP-07 (Casting Yard)
        ("TSK-031", "WP-07", "PRJ-SYN-000002-M-07", "SITE-GANGA-NORTH", "USR-FIELD-01", "CIVIL_CONSTRUCTION", "Casting Yard Bed Setup - 6 Match Casting Beds", "Precision steel bed leveling and micro-adjustment screw alignment", "HIGH", "COMPLETED", "2024-08-15", "2024-06-15", "2024-08-15", "2024-06-15", "2024-08-10", 6.0, 6.0, "beds", "MONTHLY", 100.0, 100.0, 1, 0),
        ("TSK-032", "WP-07", "PRJ-SYN-000002-M-07", "SITE-GANGA-NORTH", "USR-FIELD-01", "CIVIL_CONSTRUCTION", "Casting Box Girder Segments Batch 1 (Segments 1-80)", "M60 grade high performance micro-silica concrete match casting", "HIGH", "IN_PROGRESS", "2025-03-31", "2024-09-01", "2025-03-31", "2024-09-05", None, 80.0, 58.0, "segments", "DAILY", 72.5, 72.5, 1, 0),
        ("TSK-033", "WP-07", "PRJ-SYN-000002-M-07", "SITE-GANGA-NORTH", "USR-FIELD-01", "CIVIL_CONSTRUCTION", "Casting Box Girder Segments Batch 2 (Segments 81-200)", "Steam curing and 7-day cube crushing strength verification", "HIGH", "TODO", "2025-07-31", "2025-03-01", "2025-07-31", None, None, 120.0, 0.0, "segments", "DAILY", 0.0, 0.0, 1, 0),
        ("TSK-034", "WP-07", "PRJ-SYN-000002-M-07", "SITE-GANGA-NORTH", "USR-ENGINEER-01", "QUALITY_INSPECTION", "Match Cast Segment Shear Key Profile & Geometry Audit", "3D laser scan of shear keys to guarantee watertight joint tolerances", "HIGH", "IN_PROGRESS", "2025-05-31", "2024-10-01", "2025-05-31", "2024-10-15", None, 80.0, 55.0, "scans", "WEEKLY", 68.8, 68.8, 1, 0),

        # WP-08 (Superstructure Segment Erection)
        ("TSK-035", "WP-08", "PRJ-SYN-000002-M-07", "SITE-GANGA-NORTH", "USR-FIELD-01", "CIVIL_CONSTRUCTION", "Assembly of 180-Tonne Balanced Cantilever Launching Gantry", "Proof loading and gantry traversal winches electrical integration", "CRITICAL", "TODO", "2025-08-31", "2025-06-01", "2025-08-31", None, None, 1.0, 0.0, "gantry", "MONTHLY", 0.0, 0.0, 1, 1),
        ("TSK-036", "WP-08", "PRJ-SYN-000002-M-08", "SITE-GANGA-PIER", "USR-FIELD-01", "CIVIL_CONSTRUCTION", "Pier Table P-05 Cast-in-Situ Segment Concreting", "Zero-segment casting directly on top of river pylon pier cap", "CRITICAL", "TODO", "2025-10-31", "2025-09-01", "2025-10-31", None, None, 1.0, 0.0, "table", "MONTHLY", 0.0, 0.0, 1, 1),
        ("TSK-037", "WP-08", "PRJ-SYN-000002-M-08", "SITE-GANGA-PIER", "USR-FIELD-01", "CIVIL_CONSTRUCTION", "Erection of Cantilever Spans S-05A & S-05B (Segments 1-14)", "Epoxy application on segment joints and temporary prestress bars", "CRITICAL", "TODO", "2026-02-28", "2025-11-01", "2026-02-28", None, None, 28.0, 0.0, "segments", "WEEKLY", 0.0, 0.0, 1, 1),
        ("TSK-038", "WP-08", "PRJ-SYN-000002-M-08", "SITE-GANGA-PIER", "USR-FIELD-01", "CIVIL_CONSTRUCTION", "Midspan Stitch Concreting & Longitudinal Prestressing", "Form traveler placement and 2.0m closure pour under thermal stability", "CRITICAL", "TODO", "2026-06-30", "2026-04-01", "2026-06-30", None, None, 2.0, 0.0, "closures", "MONTHLY", 0.0, 0.0, 1, 1),

        # WP-09 (Stay Cables)
        ("TSK-039", "WP-09", "PRJ-SYN-000002-M-08", "SITE-GANGA-PIER", "USR-FIELD-01", "CIVIL_CONSTRUCTION", "Guide Pipe & Pylon Anchor Head Assembly", "Installation of cast-in pylon guide trumpets and stay damper sleeves", "HIGH", "TODO", "2026-02-15", "2025-12-01", "2026-02-15", None, None, 32.0, 0.0, "anchors", "WEEKLY", 0.0, 0.0, 1, 0),
        ("TSK-040", "WP-09", "PRJ-SYN-000002-M-08", "SITE-GANGA-PIER", "USR-FIELD-01", "CIVIL_CONSTRUCTION", "Strand Threading & Isostatic Tensioning Cycle 1", "Threading 55 strands per cable and mono-strand stressing to 45% UTS", "CRITICAL", "TODO", "2026-05-31", "2026-02-15", "2026-05-31", None, None, 32.0, 0.0, "cables", "WEEKLY", 0.0, 0.0, 1, 1),
        ("TSK-041", "WP-09", "PRJ-SYN-000002-M-08", "SITE-GANGA-PIER", "USR-ENGINEER-01", "QUALITY_INSPECTION", "Vibration Frequency & Laser Sag Resonance Validation", "Accelerometer measurement of natural frequencies and damping ratios", "HIGH", "TODO", "2026-08-31", "2026-06-01", "2026-08-31", None, None, 32.0, 0.0, "tests", "WEEKLY", 0.0, 0.0, 0, 0),

        # WP-10 (Deck & Waterproofing)
        ("TSK-042", "WP-10", "PRJ-SYN-000002-M-09", "SITE-GANGA-PIER", "USR-FIELD-01", "CIVIL_CONSTRUCTION", "Shotblasting & Deck Slab Primer Application", "Mechanical surface preparation to achieve CSP 3 profile", "MEDIUM", "TODO", "2026-06-30", "2026-05-01", "2026-06-30", None, None, 45000.0, 0.0, "m2", "DAILY", 0.0, 0.0, 1, 0),
        ("TSK-043", "WP-10", "PRJ-SYN-000002-M-09", "SITE-GANGA-PIER", "USR-FIELD-01", "CIVIL_CONSTRUCTION", "Seamless Polyurea Waterproofing Membrane Spraying", "High-pressure heated spray application of 2.5mm elastomeric membrane", "HIGH", "TODO", "2026-08-31", "2026-07-01", "2026-08-31", None, None, 45000.0, 0.0, "m2", "DAILY", 0.0, 0.0, 1, 0),
        ("TSK-044", "WP-10", "PRJ-SYN-000002-M-09", "SITE-GANGA-PIER", "USR-FIELD-01", "CIVIL_CONSTRUCTION", "Mastic Asphalt Base & Bituminous Concrete Wearing Course", "Dual-paver compaction of 40mm mastic asphalt and 50mm BC overlay", "HIGH", "TODO", "2026-10-31", "2026-08-15", "2026-10-31", None, None, 3.2, 0.0, "km", "DAILY", 0.0, 0.0, 1, 0),
        ("TSK-045", "WP-10", "PRJ-SYN-000002-M-09", "SITE-GANGA-PIER", "USR-FIELD-01", "CIVIL_CONSTRUCTION", "Modular Expansion Joints (600mm Movement) Installation", "Setting swivel joystick modular joints at piers P-04, P-08, and abutments", "CRITICAL", "TODO", "2026-11-30", "2026-09-15", "2026-11-30", None, None, 6.0, 0.0, "joints", "WEEKLY", 0.0, 0.0, 1, 1),

        # WP-11 (Approaches & RE Walls)
        ("TSK-046", "WP-11", "PRJ-SYN-000002-M-09", "SITE-GANGA-SOUTH", "USR-FIELD-01", "CIVIL_CONSTRUCTION", "South Approach Fly Ash Embankment Filling (Km 28-35)", "High embankment filling in 250mm compacted layers using fly ash mix", "MEDIUM", "IN_PROGRESS", "2026-04-30", "2025-08-15", "2026-04-30", "2025-08-20", None, 350000.0, 145000.0, "m3", "DAILY", 41.4, 41.4, 1, 0),
        ("TSK-047", "WP-11", "PRJ-SYN-000002-M-09", "SITE-GANGA-SOUTH", "USR-FIELD-01", "CIVIL_CONSTRUCTION", "Reinforced Earth (RE) Wall Fascia Panel Erection", "Cruciform concrete fascia panels with polymeric friction geogrids", "HIGH", "IN_PROGRESS", "2026-06-30", "2025-10-01", "2026-06-30", "2025-10-10", None, 18000.0, 7200.0, "m2", "DAILY", 40.0, 40.0, 1, 0),
        ("TSK-048", "WP-11", "PRJ-SYN-000002-M-09", "SITE-GANGA-NORTH", "USR-FIELD-01", "CIVIL_CONSTRUCTION", "North Approach Subgrade Compaction & Drainage Ditch", "Vibratory roller compaction to 98% Proctor density and stone pitching", "MEDIUM", "TODO", "2026-09-30", "2026-04-01", "2026-09-30", None, None, 12.4, 0.0, "km", "WEEKLY", 0.0, 0.0, 0, 0),
        ("TSK-049", "WP-11", "PRJ-SYN-000002-M-09", "SITE-GANGA-SOUTH", "USR-ENGINEER-01", "QUALITY_INSPECTION", "Nuclear Density Gauge Compaction Testing on RE Backfill", "In-situ field dry density verification at 50m intervals", "MEDIUM", "IN_PROGRESS", "2026-05-31", "2025-11-01", "2026-05-31", "2025-11-05", None, 320.0, 130.0, "tests", "DAILY", 40.6, 40.6, 0, 0),

        # WP-12 (Finishes, Load Tests & Handover)
        ("TSK-050", "WP-12", "PRJ-SYN-000002-M-10", "SITE-GANGA-PIER", "USR-FIELD-01", "CIVIL_CONSTRUCTION", "High-Containment TL-4 Concrete Crash Barriers", "Slipform extrusion of reinforced crash barrier with friction slab ties", "HIGH", "TODO", "2026-12-31", "2026-10-01", "2026-12-31", None, None, 6.4, 0.0, "km", "DAILY", 0.0, 0.0, 1, 0),
        ("TSK-051", "WP-12", "PRJ-SYN-000002-M-10", "SITE-GANGA-PIER", "USR-FO-01", "ELECTRICAL_WORKS", "Solar Aviation Warning & Navigational River Light System", "Aviation obstruction lanterns on pylon tops and solar navigational beacons", "HIGH", "TODO", "2027-02-28", "2026-12-01", "2027-02-28", None, None, 1.0, 0.0, "system", "MONTHLY", 0.0, 0.0, 1, 0),
        ("TSK-052", "WP-12", "PRJ-SYN-000002-M-10", "SITE-GANGA-PIER", "USR-ENGINEER-01", "QUALITY_INSPECTION", "Static Bridge Proof Loading with 32 Heavy Multi-Axle Trucks", "Measurement of deflection, settlement, and strain recovery under 1280T", "CRITICAL", "TODO", "2027-06-30", "2027-05-01", "2027-06-30", None, None, 1.0, 0.0, "test", "MONTHLY", 0.0, 0.0, 1, 1),
        ("TSK-053", "WP-12", "PRJ-SYN-000002-M-10", "SITE-GANGA-PIER", "USR-ENGINEER-01", "STATUTORY_COMPLIANCE", "Independent Engineer & MoRTH Joint Final Inspection", "Defect punch list walkover and statutory safety compliance signoff", "CRITICAL", "TODO", "2027-08-15", "2027-07-01", "2027-08-15", None, None, 1.0, 0.0, "audit", "MONTHLY", 0.0, 0.0, 1, 1),
        ("TSK-054", "WP-12", "PRJ-SYN-000002-M-10", "SITE-GANGA-PIER", "USR-PM-01", "MANAGEMENT", "Final As-Built Handover & Public COD Commissioning", "Transfer of toll plaza assets, as-built BIM models, and O&M manual", "CRITICAL", "TODO", "2027-09-01", "2027-08-01", "2027-09-01", None, None, 1.0, 0.0, "handover", "MONTHLY", 0.0, 0.0, 1, 1)
    ]

    for item in detailed_tasks:
        tid, wpid, mid, sid, assigned, ttype, title, desc, prio, stat, ddate, pstart, pend, astart, aend, tqty, cqty, unit, tperiod, pprog, aprog, aigen, iscrit = item
        tasks_catalog.append((
            tid, "PRJ-SYN-000002", wpid, mid, sid, assigned,
            ttype, title, desc, prio, stat, ddate, pstart, pend, astart, aend,
            tqty, cqty, unit, tperiod, pprog, aprog,
            "DOCUMENT_EXTRACTED", "EPC_Contract_Volume_2.pdf", aigen, 0.95, "APPROVED", "UNVERIFIED", 0, iscrit
        ))

    # Insert / Replace tasks
    cursor.executemany("""
        INSERT OR REPLACE INTO tasks (
            task_id, project_id, work_package_id, milestone_id, site_id, assigned_to,
            task_type, title, description, priority, status, due_date,
            planned_start, planned_end, actual_start, actual_end,
            target_quantity, completed_quantity, unit, target_period,
            planned_progress, actual_progress, source, source_document,
            ai_generated, ai_confidence, approval_status, verification_status,
            total_float, is_critical
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, tasks_catalog)

    # 7. Seed 37 Finish-to-Start (FS) Dependencies (Verified Acyclic DAG)
    dependencies_data = [
        # (dep_id, pred, succ, lag, is_critical)
        ("DEP-01", "TSK-007", "TSK-013", 0, 1), # Plant 1 -> P1 drilling
        ("DEP-02", "TSK-008", "TSK-023", 0, 0), # Plant 2 -> South piles
        ("DEP-03", "TSK-009", "TSK-048", 5, 0), # Power line -> North approach
        ("DEP-04", "TSK-010", "TSK-017", 0, 1), # Pontoon jetty -> P-05 caisson
        ("DEP-05", "TSK-011", "TSK-012", 0, 0), # Seismic -> Sonic logging
        ("DEP-06", "TSK-005", "TSK-014", 0, 1), # Soil ratification -> P-04 sinking
        ("DEP-07", "TSK-013", "TSK-015", 0, 1), # P-01 piles -> P-02 pile cap
        ("DEP-08", "TSK-015", "TSK-016", 0, 0), # Pile cap -> Sonic testing
        ("DEP-09", "TSK-014", "TSK-026", 0, 1), # P-04 well -> P-01/P-02 column shaft
        ("DEP-10", "TSK-017", "TSK-018", 0, 1), # P-05 steel curb -> P-05 steining
        ("DEP-11", "TSK-018", "TSK-019", 0, 0), # Steining -> Inclinometer monitor
        ("DEP-12", "TSK-018", "TSK-020", 0, 1), # P-05 sinking -> P-06 sinking
        ("DEP-13", "TSK-020", "TSK-021", 0, 0), # P-06 -> P-07 steining
        ("DEP-14", "TSK-021", "TSK-022", 0, 1), # P-07 steining -> P-08 bottom plug
        ("DEP-15", "TSK-023", "TSK-024", 0, 0), # South piles -> South cap
        ("DEP-16", "TSK-024", "TSK-025", 0, 0), # South cap -> Abutment load test
        ("DEP-17", "TSK-026", "TSK-027", 0, 0), # Pier columns -> Pier caps
        ("DEP-18", "TSK-022", "TSK-028", 0, 1), # P-08 bottom plug -> Pylon P-05 column
        ("DEP-19", "TSK-028", "TSK-029", 0, 1), # Pylon P-05 -> Pylon P-06
        ("DEP-20", "TSK-029", "TSK-030", 0, 0), # Pylon -> Spherical bearings
        ("DEP-21", "TSK-031", "TSK-032", 0, 0), # Casting bed -> Segments batch 1
        ("DEP-22", "TSK-032", "TSK-033", 0, 0), # Segments batch 1 -> Batch 2
        ("DEP-23", "TSK-032", "TSK-034", 0, 0), # Segments batch 1 -> Laser scan
        ("DEP-24", "TSK-004", "TSK-035", 0, 1), # Gantry load proof -> Launching gantry assembly
        ("DEP-25", "TSK-028", "TSK-036", 0, 1), # Pylon P-05 -> Pier table P-05
        ("DEP-26", "TSK-035", "TSK-037", 0, 1), # Launching gantry -> Segment erection
        ("DEP-27", "TSK-036", "TSK-037", 0, 1), # Pier table -> Segment erection
        ("DEP-28", "TSK-037", "TSK-038", 0, 1), # Segment erection -> Midspan stitch
        ("DEP-29", "TSK-028", "TSK-039", 0, 0), # Pylon P-05 -> Guide pipe assembly
        ("DEP-30", "TSK-038", "TSK-040", 0, 1), # Midspan stitch -> Stay tensioning
        ("DEP-31", "TSK-040", "TSK-041", 0, 0), # Stay tensioning -> Laser sag validate
        ("DEP-32", "TSK-040", "TSK-042", 0, 1), # Stay tensioning -> Deck shotblasting
        ("DEP-33", "TSK-042", "TSK-043", 0, 0), # Shotblasting -> Polyurea waterproofing
        ("DEP-34", "TSK-043", "TSK-044", 0, 0), # Waterproofing -> Mastic asphalt
        ("DEP-35", "TSK-044", "TSK-045", 0, 1), # Asphalt -> Modular expansion joints
        ("DEP-36", "TSK-047", "TSK-050", 0, 0), # RE wall -> Crash barriers
        ("DEP-37", "TSK-045", "TSK-052", 0, 1), # Joints -> Static load proofing
    ]

    dep_tuples = [
        (d[0], "PRJ-SYN-000002", d[1], d[2], "FS", d[3], d[4]) for d in dependencies_data
    ]

    cursor.executemany("""
        INSERT OR REPLACE INTO task_dependencies (
            dependency_id, project_id, predecessor_task_id, successor_task_id,
            dependency_type, lag_days, is_critical
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    """, dep_tuples)

    # 8. Seed Historical Task Progress Log (01 Sep to 04 Sep 2026) + Verification Queue
    progress_logs = [
        ("PRG-001", "TSK-001", "PRJ-SYN-000002", "2026-09-01", 12.0, "m3", 15.0, "Rebar tying on south cantilever wing complete", "https://evidence.gov.in/p7_rebar_01.jpg", "USR-FIELD-01", "2026-09-01 17:30:00", "VERIFIED", "USR-ENGINEER-01", "2026-09-01 19:15:00", None, 0, None),
        ("PRG-002", "TSK-001", "PRJ-SYN-000002", "2026-09-02", 15.0, "m3", 33.7, "Main tension rebar cluster placed and welded", "https://evidence.gov.in/p7_rebar_02.jpg", "USR-FIELD-01", "2026-09-02 18:00:00", "VERIFIED", "USR-ENGINEER-01", "2026-09-02 19:40:00", None, 0, None),
        ("PRG-003", "TSK-001", "PRJ-SYN-000002", "2026-09-03", 15.0, "m3", 52.5, "Shear stirrups and post-tension ducts fixed", "https://evidence.gov.in/p7_rebar_03.jpg", "USR-FIELD-01", "2026-09-03 17:45:00", "VERIFIED", "USR-ENGINEER-01", "2026-09-03 19:00:00", None, 0, None),
        # P-04 Well excavation with blocker:
        ("PRG-004", "TSK-014", "PRJ-SYN-000002", "2026-09-02", 40.0, "m3", 50.0, "Dredging grab operational in north compartment", "https://evidence.gov.in/p4_excav_01.jpg", "USR-FIELD-01", "2026-09-02 17:10:00", "VERIFIED", "USR-ENGINEER-01", "2026-09-02 18:30:00", None, 0, None),
        ("PRG-005", "TSK-014", "PRJ-SYN-000002", "2026-09-03", 12.0, "m3", 65.0, "Hydraulic winch seal failure on Dredger D-02 caused 4 hour downtime", "https://evidence.gov.in/p4_leak.jpg", "USR-FIELD-01", "2026-09-03 18:20:00", "VERIFIED", "USR-ENGINEER-01", "2026-09-03 20:10:00", None, 1, "EQUIPMENT_BREAKDOWN"),
        # Today's Progress Record awaiting Engineer Verification:
        ("PRG-006", "TSK-001", "PRJ-SYN-000002", "2026-09-04", 10.0, "m3", 65.0, "Anchor bolt box setting and top mesh installation completed; ready for pre-pour inspection", "https://evidence.gov.in/p7_rebar_04.jpg", "USR-FIELD-01", "2026-09-04 16:30:00", "PENDING", None, None, None, 0, None),
        ("PRG-007", "TSK-046", "PRJ-SYN-000002", "2026-09-04", 1200.0, "m3", 41.4, "South approach fill layer 18 compacted and moisture tested", "https://evidence.gov.in/south_fill_18.jpg", "USR-FIELD-01", "2026-09-04 17:00:00", "PENDING", None, None, None, 0, None)
    ]

    cursor.executemany("""
        INSERT OR REPLACE INTO task_progress (
            progress_id, task_id, project_id, report_date, quantity_completed,
            unit, progress_pct, notes, evidence_url, submitted_by, submitted_at,
            verification_status, verified_by, verified_at, rejection_reason,
            blocker_flag, blocker_category
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, progress_logs)

    conn.commit()
    print("Execution Intelligence schema & data seeded successfully!")

if __name__ == "__main__":
    conn = sqlite3.connect(DB_PATH)
    init_execution_schema(conn)
    seed_execution_data(conn)
    conn.close()
