"""
ProjectPulse — Institutional Audit Trail & Governance Log Manager
Ministry of Statistics & Programme Implementation (MoSPI) / IPMD
Smart India Hackathon 2026 — Team HexaForce

Provides transparent, immutable tracking of administrative actions:
- Authentication events (Login / Logout / Role Switch)
- Warning status updates (Acknowledge, Review, Resolve, Dismiss)
- Predictive risk model evaluations
- What-If counterfactual scenario simulations and saves
"""

import sqlite3
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any

DB_PATH = Path(__file__).parent.parent / "data" / "projectpulse.db"

class AuditManager:
    def __init__(self, db_path: Optional[Path] = None):
        self.db_path = str(db_path or DB_PATH)
        self._init_table()

    def _get_conn(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_table(self):
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS audit_logs (
                    log_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    actor TEXT NOT NULL,
                    role TEXT NOT NULL,
                    action TEXT NOT NULL,
                    resource TEXT NOT NULL,
                    status TEXT NOT NULL,
                    details TEXT
                )
            """)
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_logs(resource);")
            conn.commit()
            
            # Seed initial records if empty
            cursor.execute("SELECT COUNT(*) as count FROM audit_logs")
            if cursor.fetchone()["count"] == 0:
                self._seed_initial_logs(cursor)
                conn.commit()

    def _seed_initial_logs(self, cursor):
        now = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
        initial_events = [
            (now, "System Engine", "SYSTEM", "ENGINE_INITIALIZED", "PredictionEngine", "SUCCESS", "Phase 4 models (LightGBM & RF) loaded and calibrated"),
            (now, "System Engine", "SYSTEM", "RADAR_SCAN", "EarlyWarningRadar", "SUCCESS", "Scanned 10,000 projects; 14,164 active execution alerts detected"),
            (now, "Smt. Priya Sharma", "MONITORING_OFFICER", "PREDICTION_EVALUATION", "PRJ-SYN-000001", "SUCCESS", "TreeSHAP feature attributions generated (52% Land Acquisition)"),
            (now, "Smt. Priya Sharma", "MONITORING_OFFICER", "WARNING_TRIAGE", "ALT-00001", "ACKNOWLEDGED", "Milestone delay flagged for inter-ministerial review"),
            (now, "Shri Amitav Ghosh", "ANALYST", "SCENARIO_SIMULATION", "PRJ-SYN-000001", "SUCCESS", "Simulated 'Expedite Forest / Land Clearances' (-11.3 pts risk reduction)")
        ]
        cursor.executemany("""
            INSERT INTO audit_logs (timestamp, actor, role, action, resource, status, details)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, initial_events)

    def record_event(
        self,
        actor: str,
        role: str,
        action: str,
        resource: str,
        status: str = "SUCCESS",
        details: str = ""
    ) -> int:
        timestamp = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO audit_logs (timestamp, actor, role, action, resource, status, details)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (timestamp, actor, role, action, resource, status, details))
            conn.commit()
            return cursor.lastrowid

    def list_logs(
        self,
        page: int = 1,
        page_size: int = 20,
        action: Optional[str] = None,
        actor: Optional[str] = None,
        resource: Optional[str] = None
    ) -> Dict[str, Any]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            where_clauses = ["1=1"]
            params = []

            if action and action != "ALL":
                where_clauses.append("action = ?")
                params.append(action)
            if actor and actor != "ALL":
                where_clauses.append("actor LIKE ?")
                params.append(f"%{actor}%")
            if resource and resource != "ALL":
                where_clauses.append("resource LIKE ?")
                params.append(f"%{resource}%")

            where_sql = " AND ".join(where_clauses)
            
            cursor.execute(f"SELECT COUNT(*) as total FROM audit_logs WHERE {where_sql}", params)
            total = cursor.fetchone()["total"]

            offset = max(0, (page - 1) * page_size)
            query = f"""
                SELECT log_id, timestamp, actor, role, action, resource, status, details
                FROM audit_logs
                WHERE {where_sql}
                ORDER BY log_id DESC
                LIMIT ? OFFSET ?
            """
            cursor.execute(query, params + [page_size, offset])
            rows = cursor.fetchall()

            return {
                "total": total,
                "page": page,
                "page_size": page_size,
                "total_pages": (total + page_size - 1) // page_size if total > 0 else 1,
                "logs": [dict(r) for r in rows]
            }

    def get_project_history(self, project_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT log_id, timestamp, actor, role, action, resource, status, details
                FROM audit_logs
                WHERE resource LIKE ? OR details LIKE ?
                ORDER BY log_id DESC
                LIMIT ?
            """, (f"%{project_id}%", f"%{project_id}%", limit))
            return [dict(r) for r in cursor.fetchall()]

_audit_manager = None
def get_audit_manager() -> AuditManager:
    global _audit_manager
    if _audit_manager is None:
        _audit_manager = AuditManager()
    return _audit_manager
