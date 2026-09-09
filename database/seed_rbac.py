"""
ProjectPulse — Phase 10 Role-Based & Scope-Controlled Data Foundation
Ministry of Statistics & Programme Implementation (MoSPI) / IPMD
Smart India Hackathon 2026 — Team HexaForce

Creates relational tables and seeds realistic organizational hierarchies,
project assignments, operational tasks, site issues, documents, and directives.
"""

import sqlite3
from pathlib import Path
import time

DB_PATH = Path(__file__).parent.parent / "data" / "projectpulse.db"

def init_rbac_schema(conn: sqlite3.Connection):
    cursor = conn.cursor()
    
    # 1. Users Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            user_id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            designation TEXT NOT NULL,
            division TEXT NOT NULL,
            ministry TEXT NOT NULL,
            role TEXT NOT NULL,
            scope_type TEXT NOT NULL,
            scope_value TEXT NOT NULL,
            badge TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'ACTIVE',
            created_at TEXT NOT NULL
        )
    """)
    
    # 2. Project Assignments Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS project_assignments (
            assignment_id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
            project_id TEXT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
            assignment_role TEXT NOT NULL,
            site_id TEXT,
            start_date TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'ACTIVE'
        )
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_assignments_user_id ON project_assignments(user_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_assignments_project_id ON project_assignments(project_id)")

    # 3. Operational Tasks Table (Field & Engineering)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            task_id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
            milestone_id TEXT,
            site_id TEXT,
            assigned_to TEXT NOT NULL REFERENCES users(user_id),
            task_type TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            priority TEXT NOT NULL,
            status TEXT NOT NULL,
            due_date TEXT NOT NULL,
            completed_at TEXT,
            evidence_url TEXT,
            remarks TEXT
        )
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)")

    # 4. Site & Technical Issues Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS issues (
            issue_id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
            milestone_id TEXT,
            reported_by TEXT NOT NULL REFERENCES users(user_id),
            category TEXT NOT NULL,
            severity TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            status TEXT NOT NULL,
            assigned_to TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT,
            resolution TEXT,
            evidence TEXT
        )
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_issues_project_id ON issues(project_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status)")

    # 5. Project Documents Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS documents (
            document_id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
            document_type TEXT NOT NULL,
            title TEXT NOT NULL,
            file_path TEXT NOT NULL,
            uploaded_by TEXT NOT NULL,
            uploaded_at TEXT NOT NULL,
            version TEXT NOT NULL,
            access_scope TEXT NOT NULL,
            file_size_kb INTEGER NOT NULL
        )
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_documents_project_id ON documents(project_id)")

    # 6. Downward Directives & Decisions Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS directives (
            directive_id TEXT PRIMARY KEY,
            issued_by TEXT NOT NULL,
            issuer_role TEXT NOT NULL,
            target_scope TEXT NOT NULL,
            target_id TEXT NOT NULL,
            title TEXT NOT NULL,
            instructions TEXT NOT NULL,
            priority TEXT NOT NULL,
            status TEXT NOT NULL,
            created_at TEXT NOT NULL,
            compliance_notes TEXT
        )
    """)

    # 7. Scoped Notifications Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS notifications (
            notification_id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            type TEXT NOT NULL,
            project_id TEXT,
            read_status INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL
        )
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)")
    
    conn.commit()

def seed_rbac_data(conn: sqlite3.Connection):
    cursor = conn.cursor()
    now_iso = time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime())

    # --- Seed 7 Official Personas ---
    users_data = [
        (
            "USR-MINISTER-01", "minister", "minister123",
            "Dr. Jitendra Singh", "Union Minister of State (IC)",
            "Ministry of Statistics & Programme Implementation (MoSPI)",
            "National", "NATIONAL_LEADER", "NATIONAL", "ALL",
            "National Leadership", "ACTIVE", now_iso
        ),
        (
            "USR-OFFICIAL-01", "official", "official123",
            "Shri Anurag Jain, IAS", "Secretary to the Government of India",
            "Department of Road Transport & Highways",
            "Ministry of Road Transport & Highways", "MINISTRY_OFFICIAL", "MINISTRY", "Ministry of Road Transport & Highways",
            "Ministry Secretary", "ACTIVE", now_iso
        ),
        (
            "USR-ANALYST-01", "analyst", "analyst123",
            "Shri Amitav Ghosh", "Senior Data Scientist & Policy Analyst",
            "Predictive Infrastructure Intelligence Unit",
            "MoSPI / IPMD", "ANALYST", "PORTFOLIO", "ALL_ANALYTICS",
            "Senior Analyst", "ACTIVE", now_iso
        ),
        (
            "USR-PM-01", "pm", "pm123",
            "Shri R.K. Singla", "Chief General Manager & Project Director",
            "National Highways Authority of India (NHAI)",
            "Ministry of Road Transport & Highways", "PROJECT_MANAGER", "PROJECT", "PRJ-SYN-000002,PRJ-SYN-000003,PRJ-SYN-000004",
            "Project Manager", "ACTIVE", now_iso
        ),
        (
            "USR-ENGINEER-01", "engineer", "engineer123",
            "Er. Neha Verma", "Executive Resident Engineer (Civil)",
            "NHAI Corridor Project Implementation Unit (PIU)",
            "Ministry of Road Transport & Highways", "ENGINEER", "PROJECT", "PRJ-SYN-000002",
            "Site Engineer", "ACTIVE", now_iso
        ),
        (
            "USR-FIELD-01", "field", "field123",
            "Shri Rajesh Gurjar", "Senior Site Supervisor (PKG-3 Section)",
            "NH-44 Works Division",
            "Ministry of Road Transport & Highways", "FIELD_WORKER", "SITE", "PRJ-SYN-000002",
            "Field Operations", "ACTIVE", now_iso
        ),
        (
            "USR-ADMIN-01", "admin", "admin123",
            "Dr. Rajesh Kumar", "Joint Secretary & Mission Director",
            "Infrastructure and Project Monitoring Division (IPMD)",
            "Ministry of Statistics & Programme Implementation (MoSPI)", "ADMIN", "SYSTEM", "ALL",
            "Central Admin", "ACTIVE", now_iso
        ),
        # Backward compatibility aliases:
        (
            "USR-OFFICER-01", "officer", "officer123",
            "Smt. Priya Sharma", "Director (Infrastructure Monitoring)",
            "MoSPI / IPMD Surveillance Desk",
            "Ministry of Statistics & Programme Implementation (MoSPI)", "MONITORING_OFFICER", "NATIONAL", "ALL",
            "Monitoring Officer", "ACTIVE", now_iso
        ),
        (
            "USR-VIEWER-01", "viewer", "viewer123",
            "Shri Vikram Mehta", "Central Sector Observer",
            "NITI Aayog Infrastructure Liaison",
            "National", "VIEWER", "NATIONAL", "ALL",
            "Observer", "ACTIVE", now_iso
        )
    ]

    cursor.executemany("""
        INSERT OR REPLACE INTO users (
            user_id, username, password, name, designation, division, ministry,
            role, scope_type, scope_value, badge, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, users_data)

    # --- Seed Project Responsibility Assignments ---
    assignments_data = [
        # Project Manager assigned to 3 projects
        ("ASG-PM-001", "USR-PM-01", "PRJ-SYN-000002", "PROJECT_MANAGER", "CORRIDOR-ALL", "2023-01-15", "ACTIVE"),
        ("ASG-PM-002", "USR-PM-01", "PRJ-SYN-000003", "PROJECT_MANAGER", "MMLP-SITE-A", "2023-06-01", "ACTIVE"),
        ("ASG-PM-003", "USR-PM-01", "PRJ-SYN-000004", "PROJECT_MANAGER", "PKG-WDFC-1", "2023-08-10", "ACTIVE"),
        
        # Engineer strictly assigned to PRJ-SYN-000002 only
        ("ASG-ENG-001", "USR-ENGINEER-01", "PRJ-SYN-000002", "ENGINEER", "PKG-3-VIADUCT", "2023-02-01", "ACTIVE"),
        
        # Field Worker strictly assigned to PRJ-SYN-000002 Site PKG-3
        ("ASG-FLD-001", "USR-FIELD-01", "PRJ-SYN-000002", "FIELD_OFFICER", "SITE-PKG-3-FOREST", "2023-03-01", "ACTIVE")
    ]
    cursor.executemany("""
        INSERT OR REPLACE INTO project_assignments (
            assignment_id, user_id, project_id, assignment_role, site_id, start_date, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    """, assignments_data)

    # --- Seed Operational Tasks (for Field Worker & Engineer) ---
    tasks_data = [
        (
            "TSK-001", "PRJ-SYN-000002", "MS-DEMO-05", "SITE-KRISHNA-BRIDGE", "USR-FIELD-01",
            "CIVIL_CONSTRUCTION", "Pier Cap P7 Concrete Reinforcement Inspection",
            "Verify rebar spacing and coordinate load cell calibration before high water surge",
            "HIGH", "IN_PROGRESS", "2026-09-15", None, "https://evidence.projectpulse.gov.in/pier-p7-log.pdf",
            "Monsoon flood level monitoring active; pump dewatering installed."
        ),
        (
            "TSK-002", "PRJ-SYN-000002", "MS-DEMO-06", "SITE-PKG-3-FOREST", "USR-FIELD-01",
            "LAND_CLEARANCE", "Forest Boundary Demarcation & Tree Felling Audit",
            "Complete pillar tagging across Chainage 142+000 to 148+500 with DFO team",
            "CRITICAL", "BLOCKED", "2026-09-12", None, None,
            "Forest Range Officer signature pending on Joint Inspection Memo."
        ),
        (
            "TSK-003", "PRJ-SYN-000002", "MS-DEMO-08", "SITE-PAVING-SEC-A", "USR-FIELD-01",
            "INSPECTION", "PQC Paving Slump & Core Sampling (Km 120-125)",
            "Measure flexural strength of pavement quality concrete batches 14 through 22",
            "MEDIUM", "COMPLETED", "2026-09-08", "2026-09-08 17:30:00",
            "https://evidence.projectpulse.gov.in/core-sample-cert.pdf",
            "Compressive strength 45.2 MPa achieved. Approved for curing."
        ),
        (
            "TSK-004", "PRJ-SYN-000002", "MS-DEMO-07", "SITE-VIADUCT-NORTH", "USR-FIELD-01",
            "SAFETY_CHECK", "Pre-Cast Segment Gantry Crane Load Proofing",
            "Inspect hydraulic tension jacks and guide cables on launching girder G-2",
            "HIGH", "TODO", "2026-09-18", None, None,
            "Awaiting mobile crane contractor mobilization."
        ),
        (
            "TSK-005", "PRJ-SYN-000002", "MS-DEMO-05", "SITE-KRISHNA-BRIDGE", "USR-ENGINEER-01",
            "TECHNICAL_DOCUMENT", "Foundation Soil Profile Core Test Report Ratification",
            "Review geotechnical stratigraphy for Pier P8-P12 riverbed foundations",
            "HIGH", "IN_PROGRESS", "2026-09-16", None,
            "https://evidence.projectpulse.gov.in/soil-profile-p8.pdf",
            "Found soft clay seam at -18m; requires 3m additional socketing into bedrock."
        ),
        (
            "TSK-006", "PRJ-SYN-000002", "MS-DEMO-06", "SITE-PKG-3-FOREST", "USR-ENGINEER-01",
            "CLEARANCE_SUBMISSION", "PARIVESH Portal Form-C Compliance Submission",
            "Upload Compensatory Afforestation Land (CAL) survey maps and GPS coordinates to MoEFCC",
            "CRITICAL", "IN_PROGRESS", "2026-09-14", None, None,
            "Maps endorsed by District Collector; awaiting final digital signature."
        )
    ]
    cursor.executemany("""
        INSERT OR REPLACE INTO tasks (
            task_id, project_id, milestone_id, site_id, assigned_to, task_type,
            title, description, priority, status, due_date, completed_at, evidence_url, remarks
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, tasks_data)

    # --- Seed On-Site & Technical Issues ---
    issues_data = [
        (
            "ISS-001", "PRJ-SYN-000002", "MS-DEMO-06", "USR-FIELD-01",
            "FOREST_CLEARANCE", "CRITICAL",
            "Forest Department Stage-II Handover Stalled at Chainage 144",
            "Local forest ranger halted tree removal awaiting formal Compensatory Afforestation fee credit confirmation.",
            "OPEN", "USR-ENGINEER-01", "2026-09-02 11:30:00", None,
            "Escalated to State Chief Conservator of Forests (PCCF). Treasury challan uploaded.",
            "https://evidence.projectpulse.gov.in/forest-halt-notice.pdf"
        ),
        (
            "ISS-002", "PRJ-SYN-000002", "MS-DEMO-05", "USR-ENGINEER-01",
            "DESIGN_CHANGE", "HIGH",
            "River Bed Scour Depth Recalculation for Monsoon 2026",
            "Central Water Commission updated flood discharge estimates requiring 1.8m deeper pier foundations.",
            "IN_PROGRESS", "USR-PM-01", "2026-08-25 14:15:00", None,
            "Structural consultant appointed to re-issue GFC drawings for Piers 5 through 9.",
            "https://evidence.projectpulse.gov.in/scour-depth-cwc.pdf"
        ),
        (
            "ISS-003", "PRJ-SYN-000002", "MS-DEMO-07", "USR-PM-01",
            "CONTRACTOR", "HIGH",
            "EPC Concessionaire Working Capital Liquidity Strain",
            "Main contractor facing cash flow bottleneck due to delayed mobilization advance bank guarantee.",
            "ESCALATED", "USR-OFFICIAL-01", "2026-08-28 09:40:00", None,
            "Recommended for fast-track dispute arbitration under Vivad se Vishwas II guidelines.",
            "https://evidence.projectpulse.gov.in/contractor-claim.pdf"
        )
    ]
    cursor.executemany("""
        INSERT OR REPLACE INTO issues (
            issue_id, project_id, milestone_id, reported_by, category, severity,
            title, description, status, assigned_to, created_at, updated_at, resolution, evidence
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, issues_data)

    # --- Seed Official Project Documents ---
    documents_data = [
        (
            "DOC-001", "PRJ-SYN-000002", "APPROVAL",
            "Cabinet Committee on Economic Affairs (CCEA) Sanction Order",
            "/docs/NH44/CCEA_Sanction_2022.pdf", "MoRTH Secretarial Desk", "2022-09-10",
            "1.0", "PUBLIC", 2450
        ),
        (
            "DOC-002", "PRJ-SYN-000002", "PROJECT_PLAN",
            "Detailed Project Report (DPR) Volume I - Engineering Feasibility",
            "/docs/NH44/DPR_Vol1_Technical.pdf", "NHAI Planning Wing", "2022-11-15",
            "2.1", "PROJECT_TEAM", 14820
        ),
        (
            "DOC-003", "PRJ-SYN-000002", "COMPLIANCE_DOCUMENT",
            "MoEFCC Stage-I Forest Clearance In-Principle Approval",
            "/docs/NH44/MoEFCC_Stage1_Clearance.pdf", "State Forest Liaison Officer", "2023-04-12",
            "1.0", "MINISTRY", 1850
        ),
        (
            "DOC-004", "PRJ-SYN-000002", "MILESTONE_EVIDENCE",
            "Subgrade Earthwork Section A Completion Certificate",
            "/docs/NH44/Subgrade_SecA_Cert.pdf", "Er. Neha Verma", "2024-01-05",
            "1.0", "PROJECT_TEAM", 3200
        ),
        (
            "DOC-005", "PRJ-SYN-000002", "SITE_EVIDENCE",
            "Geotechnical Bore Hole Stratigraphy Logs (Krishna River Bed)",
            "/docs/NH44/Geotech_Krishna_BoreLogs.pdf", "Er. Neha Verma", "2024-06-18",
            "1.2", "PROJECT_TEAM", 8940
        )
    ]
    cursor.executemany("""
        INSERT OR REPLACE INTO documents (
            document_id, project_id, document_type, title, file_path, uploaded_by,
            uploaded_at, version, access_scope, file_size_kb
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, documents_data)

    # --- Seed Downward Directives & Governance Decisions ---
    directives_data = [
        (
            "DIR-NAT-2026-01", "Dr. Jitendra Singh", "NATIONAL_LEADER", "NATIONAL", "ALL",
            "National Infrastructure Acceleration Mandate — PM GatiShakti De-confliction",
            "All Central Sector Megaprojects ($>$₹1,000 Cr) facing statutory clearance delays over 90 days must be submitted to the Empowered Group of Secretaries (EGoS) for single-window resolution.",
            "IMMEDIATE_ESCALATION", "ACTIVE", "2026-08-15",
            "34 projects forwarded to EGoS registry including NH-44 and EDFC-II."
        ),
        (
            "DIR-MIN-2026-04", "Shri Anurag Jain, IAS", "MINISTRY_OFFICIAL", "MINISTRY", "Ministry of Road Transport & Highways",
            "Special Taskforce on Land Acquisition & RoW Handover for Strategic Corridors",
            "Project Directors must convene weekly coordination meetings with State Revenue Commissioners. Unresolved revenue awards to be settled via direct consent formula within 45 days.",
            "URGENT", "ACKNOWLEDGED", "2026-08-20",
            "Direct consent compensation disbursed in 4 districts of Telangana."
        ),
        (
            "DIR-PRJ-2026-11", "Shri R.K. Singla", "PROJECT_MANAGER", "PROJECT", "PRJ-SYN-000002",
            "Site Mobilization Directive: Double-Shift Execution on Krishna River Viaduct",
            "Concessionaire ordered to mobilize additional 250 MT crane and auxiliary power generators to catch up on monsoon substructure delays before November COD target.",
            "URGENT", "COMPLIED", "2026-09-01",
            "Second shift crane operational as of September 4, 2026."
        )
    ]
    cursor.executemany("""
        INSERT OR REPLACE INTO directives (
            directive_id, issued_by, issuer_role, target_scope, target_id,
            title, instructions, priority, status, created_at, compliance_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, directives_data)

    # --- Seed Scoped Notifications ---
    notifs_data = [
        ("NOTIF-001", "USR-MINISTER-01", "National Risk Escalation", "3 megaprojects entered Critical Risk tier across Road and Rail corridors.", "ALERT", "PRJ-SYN-000002", 0, now_iso),
        ("NOTIF-002", "USR-OFFICIAL-01", "Ministerial Directive Received", "National Infrastructure Acceleration Mandate issued by Cabinet Secretariat.", "DIRECTIVE", "PRJ-SYN-000002", 0, now_iso),
        ("NOTIF-003", "USR-PM-01", "High Priority Issue Logged", "Forest Stage-II Handover Stalled at Chainage 144 on NH-44.", "ALERT", "PRJ-SYN-000002", 0, now_iso),
        ("NOTIF-004", "USR-ENGINEER-01", "Task Re-assignment", "Compensatory Afforestation Land submission due in 48 hours.", "TASK", "PRJ-SYN-000002", 0, now_iso),
        ("NOTIF-005", "USR-FIELD-01", "Daily Task Due", "Pier Cap P7 Concrete Reinforcement Inspection scheduled for completion today.", "TASK", "PRJ-SYN-000002", 0, now_iso)
    ]
    cursor.executemany("""
        INSERT OR REPLACE INTO notifications (
            notification_id, user_id, title, message, type, project_id, read_status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, notifs_data)

    conn.commit()
    print("RBAC & Scope Schema successfully initialized and seeded with official personas!")

if __name__ == "__main__":
    conn = sqlite3.connect(DB_PATH)
    init_rbac_schema(conn)
    seed_rbac_data(conn)
    conn.close()
