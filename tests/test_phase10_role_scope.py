"""
ProjectPulse — Phase 10 Role & Scope-Controlled Access Test Suite
Smart India Hackathon 2026 — Team HexaForce (SIH26103)
Ministry of Statistics & Programme Implementation (MoSPI) / IPMD

Validates:
1. 10,000 Projects Database Invariant & Table Schemas
2. Institutional Authentication for all 7 Personas
3. Strict Backend Scope Authorization (HTTP 403 on unassigned access)
4. Field Worker Analytics Restriction (HTTP 403)
5. Scoped Project Catalog Filtering
6. Operational Task Upward Telemetry (Tasks & Issues)
7. Downward Directives & Governance Escalations
8. Notifications & Role-Scoped AI Executive/Operational Briefs
"""

import sys
import sqlite3
import unittest
from pathlib import Path
from fastapi.testclient import TestClient

WORKSPACE_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(WORKSPACE_ROOT))

from backend.app import app
from backend.auth import DEMO_USERS, create_session_for_user

DB_PATH = Path(__file__).parent.parent / "data" / "projectpulse.db"


class TestPhase10RoleAndScope(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        
        # Pre-generate sessions and auth headers for the 7 official personas
        cls.headers = {}
        for role_key, user in DEMO_USERS.items():
            session = create_session_for_user(user)
            cls.headers[role_key] = {
                "Authorization": f"Bearer {session.token}"
            }

    def test_01_database_10000_projects_invariant(self):
        """Zero Regression Rule: Exactly 10,000 projects preserved in database."""
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM projects")
        total_projects = cursor.fetchone()[0]
        self.assertEqual(total_projects, 10000, f"Expected 10,000 projects, found {total_projects}")
        
        cursor.execute("SELECT COUNT(DISTINCT project_id) FROM projects")
        distinct_projects = cursor.fetchone()[0]
        self.assertEqual(distinct_projects, 10000, f"Expected 10,000 distinct projects, found {distinct_projects}")
        
        # Verify Phase 10 tables exist
        for table in ["users", "project_assignments", "tasks", "issues", "documents", "directives", "notifications"]:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            self.assertGreater(count, 0, f"Expected table {table} to have rows, found {count}")
            
        conn.close()

    def test_02_authentication_all_7_personas(self):
        """All 7 official SIH 2026 personas can authenticate successfully."""
        demo_logins = [
            ("minister", "minister123", "NATIONAL_LEADER"),
            ("official", "official123", "MINISTRY_OFFICIAL"),
            ("analyst", "analyst123", "ANALYST"),
            ("pm", "pm123", "PROJECT_MANAGER"),
            ("engineer", "engineer123", "ENGINEER"),
            ("field", "field123", "FIELD_WORKER"),
            ("admin", "admin123", "ADMIN"),
        ]
        
        for username, password, expected_role in demo_logins:
            res = self.client.post("/api/auth/login", json={"username": username, "password": password})
            self.assertEqual(res.status_code, 200, f"Login failed for {username}")
            data = res.json()
            self.assertEqual(data["role"], expected_role)
            self.assertIn("token", data)
            self.assertTrue(len(data["token"]) > 10)

    def test_03_invalid_credentials_rejected(self):
        """Invalid credentials return HTTP 401 Unauthorized."""
        res = self.client.post("/api/auth/login", json={"username": "minister", "password": "wrongpassword"})
        self.assertEqual(res.status_code, 401)

    def test_04_scope_enforcement_project_detail_pm_and_engineer(self):
        """
        Strict Scope Check:
        - PM and Site Engineer can access assigned PRJ-SYN-000002.
        - PM and Site Engineer accessing unassigned project receives HTTP 403 Forbidden.
        """
        # 1. Access assigned project -> 200 OK
        res_pm = self.client.get("/api/projects/PRJ-SYN-000002", headers=self.headers["pm"])
        self.assertEqual(res_pm.status_code, 200)
        self.assertEqual(res_pm.json()["project_id"], "PRJ-SYN-000002")

        res_eng = self.client.get("/api/projects/PRJ-SYN-000002", headers=self.headers["engineer"])
        self.assertEqual(res_eng.status_code, 200)
        self.assertEqual(res_eng.json()["project_id"], "PRJ-SYN-000002")

        # 2. Access unassigned project (PRJ-SYN-000005 - Civil Aviation) -> 403 Forbidden
        res_eng_forbidden = self.client.get("/api/projects/PRJ-SYN-000005", headers=self.headers["engineer"])
        self.assertEqual(res_eng_forbidden.status_code, 403)
        self.assertIn("Access denied", res_eng_forbidden.json()["detail"])

        # PM is assigned to SYN-000002, SYN-000003, SYN-000004. Accessing SYN-000005 -> 403 Forbidden
        res_pm_forbidden = self.client.get("/api/projects/PRJ-SYN-000005", headers=self.headers["pm"])
        self.assertEqual(res_pm_forbidden.status_code, 403)

    def test_05_scope_enforcement_ministry_official(self):
        """Ministry Official can access own ministry's projects, but receives 403 on other ministries."""
        # Find a project belonging to MoRTH and another belonging to Ministry of Railways or Power
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT project_id FROM projects WHERE ministry = 'Ministry of Road Transport & Highways' LIMIT 1")
        morth_prj = cursor.fetchone()["project_id"]

        cursor.execute("SELECT project_id, ministry FROM projects WHERE ministry != 'Ministry of Road Transport & Highways' LIMIT 1")
        other_row = cursor.fetchone()
        other_prj = other_row["project_id"]
        conn.close()

        # MoRTH official accessing MoRTH project -> 200
        res_allowed = self.client.get(f"/api/projects/{morth_prj}", headers=self.headers["official"])
        self.assertEqual(res_allowed.status_code, 200)

        # MoRTH official accessing other ministry project -> 403
        res_denied = self.client.get(f"/api/projects/{other_prj}", headers=self.headers["official"])
        self.assertEqual(res_denied.status_code, 403)
        self.assertIn("Scope violation", res_denied.json()["detail"])

    def test_06_national_leader_full_scope(self):
        """National Leader (Minister) has national scope and can access any project."""
        res_1 = self.client.get("/api/projects/PRJ-SYN-000002", headers=self.headers["minister"])
        self.assertEqual(res_1.status_code, 200)

        res_2 = self.client.get("/api/projects/PRJ-SYN-000500", headers=self.headers["minister"])
        self.assertEqual(res_2.status_code, 200)

    def test_07_field_worker_restricted_from_macro_analytics(self):
        """Field worker attempting to access macro portfolio analytics receives HTTP 403."""
        res_analytics = self.client.get("/api/analytics/summary", headers=self.headers["field"])
        self.assertEqual(res_analytics.status_code, 403)

        res_matrix = self.client.get("/api/portfolio/matrix", headers=self.headers["field"])
        self.assertEqual(res_matrix.status_code, 403)

        # Analyst and Minister can access analytics -> 200
        res_analyst = self.client.get("/api/analytics/summary", headers=self.headers["analyst"])
        self.assertEqual(res_analyst.status_code, 200)

    def test_08_scoped_project_catalog(self):
        """Project catalog list is automatically filtered by user's assigned scope."""
        # Engineer only sees assigned projects (PRJ-SYN-000002)
        res_eng = self.client.get("/api/projects", headers=self.headers["engineer"])
        self.assertEqual(res_eng.status_code, 200)
        items_eng = res_eng.json()["items"]
        self.assertEqual(len(items_eng), 1)
        self.assertEqual(items_eng[0]["project_id"], "PRJ-SYN-000002")

        # Minister sees all projects paginated (e.g. 20 out of 10,000)
        res_min = self.client.get("/api/projects", headers=self.headers["minister"])
        self.assertEqual(res_min.status_code, 200)
        self.assertEqual(res_min.json()["total_records"], 10000)

    def test_09_ministry_command_center_summary(self):
        """GET /api/ministry/summary returns targeted ministry aggregations."""
        res = self.client.get("/api/ministry/summary", headers=self.headers["official"])
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["ministry_name"], "Ministry of Road Transport & Highways")
        self.assertIn("tracked_projects_count", data)
        self.assertIn("capital_at_risk_formatted", data)
        self.assertIn("risk_distribution", data)

    def test_10_operational_tasks_telemetry(self):
        """Field supervisor tasks listing and status updates."""
        # 1. List tasks
        res_list = self.client.get("/api/tasks", headers=self.headers["field"])
        self.assertEqual(res_list.status_code, 200)
        tasks = res_list.json()["tasks"]
        self.assertGreater(len(tasks), 0)
        
        task_id = tasks[0]["task_id"]
        
        # 2. Update task status
        res_update = self.client.patch(
            f"/api/tasks/{task_id}",
            json={"status": "IN_PROGRESS", "remarks": "Compaction equipment deployed at Site 2"},
            headers=self.headers["field"]
        )
        self.assertEqual(res_update.status_code, 200)
        self.assertEqual(res_update.json()["task"]["status"], "IN_PROGRESS")

    def test_11_issues_logging_and_resolution(self):
        """Site Engineer logs technical issue and updates resolution."""
        # 1. Engineer logs new issue on assigned project
        payload = {
            "project_id": "PRJ-SYN-000002",
            "milestone_id": "MS-004",
            "category": "TECHNICAL",
            "severity": "HIGH",
            "title": "Subsurface water ingress during pier excavation",
            "description": "High water table requires specialized well-point dewatering system.",
            "evidence": "img_dewatering_04.jpg"
        }
        res_create = self.client.post("/api/issues", json=payload, headers=self.headers["engineer"])
        self.assertEqual(res_create.status_code, 200)
        created_issue = res_create.json()["issue"]
        issue_id = created_issue["issue_id"]
        
        # 2. Update issue to RESOLVED
        res_resolve = self.client.patch(
            f"/api/issues/{issue_id}",
            json={"status": "RESOLVED", "resolution": "Well-point system installed and functioning."},
            headers=self.headers["engineer"]
        )
        self.assertEqual(res_resolve.status_code, 200)
        self.assertEqual(res_resolve.json()["issue"]["status"], "RESOLVED")

    def test_12_downward_directives_workflow(self):
        """National Leader issues downward directive; field worker cannot."""
        # 1. Minister issues directive
        payload = {
            "target_scope": "MINISTRY",
            "target_id": "Ministry of Road Transport & Highways",
            "title": "Mandatory Monsoon Preparedness & Drainage Audit",
            "instructions": "All corridor directors must submit geo-tagged drainage audit by Friday.",
            "priority": "HIGH"
        }
        res_dir = self.client.post("/api/directives", json=payload, headers=self.headers["minister"])
        self.assertEqual(res_dir.status_code, 200)
        directive_id = res_dir.json()["directive"]["directive_id"]

        # 2. Field worker cannot issue directive (403)
        res_denied = self.client.post("/api/directives", json=payload, headers=self.headers["field"])
        self.assertEqual(res_denied.status_code, 403)

        # 3. Update status with compliance notes
        res_patch = self.client.patch(
            f"/api/directives/{directive_id}/status",
            json={"status": "COMPLIED", "compliance_notes": "All 14 field PIUs have submitted drainage clearance reports."},
            headers=self.headers["official"]
        )
        self.assertEqual(res_patch.status_code, 200)
        self.assertEqual(res_patch.json()["directive"]["status"], "COMPLIED")

    def test_13_notifications_lifecycle(self):
        """User can read scoped notifications and mark them as read."""
        res_list = self.client.get("/api/notifications", headers=self.headers["official"])
        self.assertEqual(res_list.status_code, 200)
        notes = res_list.json()["notifications"]
        self.assertGreater(len(notes), 0)
        
        note_id = notes[0]["notification_id"]
        res_read = self.client.patch(f"/api/notifications/{note_id}/read", headers=self.headers["official"])
        self.assertEqual(res_read.status_code, 200)

    def test_14_ai_role_scoped_brief(self):
        """GET /api/ai/brief generates intelligent briefs specific to active role."""
        roles_to_test = ["minister", "official", "pm", "engineer", "analyst"]
        for r in roles_to_test:
            res = self.client.get("/api/ai/brief", headers=self.headers[r])
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertIn("title", data)
            self.assertIn("summary", data)
            self.assertIn("action_recommendation", data)
            self.assertIn("disclaimer", data)


if __name__ == "__main__":
    unittest.main()
