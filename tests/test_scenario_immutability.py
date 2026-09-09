"""
ProjectPulse — Unit Tests: Database Immutability Guarantee (Phase 7)
Mandatory verification proving that hypothetical simulations NEVER alter
actual project records, baseline attributes, or operational warning statuses.
"""

import sqlite3
import sys
import unittest
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from database.db_client import DatabaseClient
from src.scenarios.scenario_engine import ScenarioEngine
from src.scenarios.scenario_models import (
    SimulationRequest,
    SensitivityRequest,
    ScenarioModification
)

class TestScenarioImmutability(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.db_client = DatabaseClient()
        cls.engine = ScenarioEngine(db_client=cls.db_client)
        cls.project_id = "PRJ-SYN-002078"

    def test_database_record_strictly_immutable_after_multiple_simulations(self):
        # 1. Fetch exact pre-simulation project snapshot from database
        with self.db_client._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM projects WHERE project_id = ?", (self.project_id,))
            pre_row = dict(cursor.fetchone())

        # 2. Run multiple radical hypothetical simulations
        # Simulation A: clear bottleneck
        req_a = SimulationRequest(
            project_id=self.project_id,
            scenario_name="Immutability Stress Test A",
            modifications=[ScenarioModification(feature="primary_bottleneck", scenario_value="NONE")]
        )
        self.engine.simulate_scenario(req_a)

        # Simulation B: drop delayed milestones to 0 and boost progress
        req_b = SimulationRequest(
            project_id=self.project_id,
            scenario_name="Immutability Stress Test B",
            modifications=[
                ScenarioModification(feature="milestones_delayed", scenario_value=0),
                ScenarioModification(feature="physical_progress_pct", scenario_value=99.0)
            ]
        )
        self.engine.simulate_scenario(req_b)

        # Simulation C: sensitivity sweep
        req_c = SensitivityRequest(
            project_id=self.project_id,
            feature="physical_progress_pct",
            points_count=5
        )
        self.engine.run_sensitivity_analysis(req_c)

        # 3. Re-query project from database
        with self.db_client._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM projects WHERE project_id = ?", (self.project_id,))
            post_row = dict(cursor.fetchone())

        # 4. Strict assertions: every single field must match identically
        for col_name in pre_row.keys():
            self.assertEqual(
                pre_row[col_name],
                post_row[col_name],
                f"FATAL VIOLATION: Database column '{col_name}' was mutated during scenario simulation!"
            )

    def test_warning_status_not_altered_by_optimistic_scenario(self):
        # Check active alerts for project
        with self.db_client._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT alert_id, status FROM alerts WHERE project_id = ?", (self.project_id,))
            pre_alerts = [dict(r) for r in cursor.fetchall()]

        # Run an extremely optimistic turnaround scenario
        req = SimulationRequest(
            project_id=self.project_id,
            scenario_name="Super Optimistic Turnaround",
            modifications=[
                ScenarioModification(feature="primary_bottleneck", scenario_value="NONE"),
                ScenarioModification(feature="milestones_delayed", scenario_value=0),
                ScenarioModification(feature="physical_progress_pct", scenario_value=90.0)
            ]
        )
        sim_res = self.engine.simulate_scenario(req)
        self.assertEqual(sim_res.delta.classification, "IMPROVED")

        # Verify operational alerts remain completely untouched
        with self.db_client._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT alert_id, status FROM alerts WHERE project_id = ?", (self.project_id,))
            post_alerts = [dict(r) for r in cursor.fetchall()]

        self.assertEqual(pre_alerts, post_alerts, "Operational warnings must NEVER be mutated by a simulation!")

if __name__ == "__main__":
    unittest.main()
