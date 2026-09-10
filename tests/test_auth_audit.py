"""
PROJECTPULSE — Phase 9 Authentication, RBAC & Audit Trail Unit Test Suite
Ministry of Statistics & Programme Implementation (MoSPI) - IPMD
Smart India Hackathon 2026 — Team HexaForce
"""

import sys
from pathlib import Path
WORKSPACE_ROOT = Path(__file__).parent.parent
if str(WORKSPACE_ROOT) not in sys.path:
    sys.path.insert(0, str(WORKSPACE_ROOT))

import unittest
from fastapi.testclient import TestClient
from backend.app import app
from backend.auth import DEMO_USERS, ACTIVE_SESSIONS, ROLE_PERMISSIONS
from backend.audit import get_audit_manager
from database.db_client import DatabaseClient

class TestAuthAndRBAC(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.db = DatabaseClient()
        cls.audit = get_audit_manager()

    def test_demo_user_logins(self):
        """Test successful authentication for all 4 pre-seeded demo roles."""
        roles = [
            ("admin", "admin123", "ADMIN"),
            ("officer", "officer123", "MONITORING_OFFICER"),
            ("analyst", "analyst123", "ANALYST"),
            ("viewer", "viewer123", "VIEWER")
        ]
        for username, password, expected_role in roles:
            res = self.client.post("/api/auth/login", json={"username": username, "password": password})
            self.assertEqual(res.status_code, 200, f"Failed login for {username}")
            data = res.json()
            self.assertEqual(data["role"], expected_role)
            self.assertIn("token", data)
            self.assertTrue(len(data["token"]) > 10)
            self.assertIn("permissions", data)

    def test_invalid_login(self):
        """Test invalid credentials rejection."""
        res = self.client.post("/api/auth/login", json={"username": "officer", "password": "wrongpassword"})
        self.assertEqual(res.status_code, 401)
        self.assertIn("Invalid MoSPI institutional credentials", res.json()["detail"])

    def test_session_me_endpoint(self):
        """Test /api/auth/me returns currently authenticated user."""
        login_res = self.client.post("/api/auth/login", json={"username": "officer", "password": "officer123"})
        token = login_res.json()["token"]

        me_res = self.client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(me_res.status_code, 200)
        self.assertEqual(me_res.json()["username"], "officer")
        self.assertEqual(me_res.json()["role"], "MONITORING_OFFICER")

    def test_role_switch_endpoint(self):
        """Test quick demo role switcher."""
        res = self.client.post("/api/auth/switch-role", json={"role": "ADMIN"})
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["role"], "ADMIN")
        self.assertEqual(data["name"], "Dr. Rajesh Kumar")

    def test_alert_triage_rbac_permissions(self):
        """Test that Monitoring Officer and Admin can triage alerts, but Viewer is denied (403)."""
        # First retrieve a valid alert_id
        alerts_res = self.client.get("/api/alerts?page=1&page_size=1")
        self.assertEqual(alerts_res.status_code, 200)
        items = alerts_res.json()["items"]
        self.assertTrue(len(items) > 0)
        test_alert_id = items[0]["alert_id"]

        # 1. Login as Viewer
        v_login = self.client.post("/api/auth/login", json={"username": "viewer", "password": "viewer123"})
        v_token = v_login.json()["token"]

        # Attempt triage as Viewer -> Expect 403
        patch_res = self.client.patch(
            f"/api/alerts/{test_alert_id}/status",
            json={"status": "UNDER REVIEW", "notes": "Viewer attempt"},
            headers={"Authorization": f"Bearer {v_token}"}
        )
        self.assertEqual(patch_res.status_code, 403)
        self.assertIn("Only Monitoring Officers or Admins", patch_res.json()["detail"])

        # 2. Login as Monitoring Officer
        o_login = self.client.post("/api/auth/login", json={"username": "officer", "password": "officer123"})
        o_token = o_login.json()["token"]

        # Attempt triage as Officer -> Expect 200
        patch_res_ok = self.client.patch(
            f"/api/alerts/{test_alert_id}/status",
            json={"status": "UNDER REVIEW", "notes": "Officer review initiated"},
            headers={"Authorization": f"Bearer {o_token}"}
        )
        self.assertEqual(patch_res_ok.status_code, 200)
        self.assertEqual(patch_res_ok.json()["new_status"], "UNDER REVIEW")

    def test_audit_log_recording_and_query(self):
        """Test recording custom audit event and retrieving through /api/audit."""
        self.audit.record_event(
            actor="Test Officer",
            role="MONITORING_OFFICER",
            action="TEST_ACTION",
            resource="PRJ-TEST-AUDIT",
            status="SUCCESS",
            details="Testing audit persistence"
        )

        res = self.client.get("/api/audit?action=TEST_ACTION")
        self.assertEqual(res.status_code, 200)
        logs = res.json()["logs"]
        self.assertTrue(any(l["action"] == "TEST_ACTION" and l["resource"] == "PRJ-TEST-AUDIT" for l in logs))

    def test_project_history_audit_trail(self):
        """Test that project history endpoint returns chronological audit events for that project."""
        target_project = "PRJ-SYN-000001"
        self.audit.record_event(
            actor="Director IPMD",
            role="MONITORING_OFFICER",
            action="INTERVENTION_REVIEW",
            resource=f"{target_project} / Milestone Audit",
            status="SUCCESS",
            details=f"Project {target_project}: Statutory clearances reviewed by inter-ministerial panel"
        )

        res = self.client.get(f"/api/projects/{target_project}/history")
        self.assertEqual(res.status_code, 200)
        history = res.json()
        self.assertIsInstance(history, list)
        self.assertTrue(len(history) > 0)
        self.assertTrue(any(target_project in h.get("details", "") or target_project in h.get("resource", "") for h in history))

if __name__ == "__main__":
    unittest.main()
