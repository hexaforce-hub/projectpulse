"""
Unit and Integration Test Suite for Phase 12 PAIMANA Report Intelligence Center
Smart India Hackathon 2026 — Team HexaForce
MoSPI IPMD / PAIMANA Flash Reports (April, May, June, July 2026)
"""

import sys
import unittest
from pathlib import Path
from fastapi.testclient import TestClient

WORKSPACE_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(WORKSPACE_ROOT))

from backend.app import app
from database.db_client import DatabaseClient
from src.analytics.data_quality_engine import DataQualityEngine
from src.ml.model_comparison import ModelComparisonEngine


class TestReportIntelligenceCenter(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.db = DatabaseClient()

    def test_snapshots_list(self):
        """Verify GET /api/reports/snapshots returns all 4 historical snapshots."""
        response = self.client.get("/api/reports/snapshots")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("snapshots", data)
        self.assertEqual(len(data["snapshots"]), 4)
        snapshot_keys = [s["snapshot_month"] for s in data["snapshots"]]
        self.assertListEqual(snapshot_keys, ["2026-04", "2026-05", "2026-06", "2026-07"])
        for snap in data["snapshots"]:
            self.assertEqual(snap["project_count"], 10000)

    def test_overview_kpis(self):
        """Verify GET /api/reports/overview returns accurate portfolio KPIs for July 2026."""
        response = self.client.get("/api/reports/overview?snapshot_month=2026-07")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["snapshot_month"], "2026-07")
        self.assertIn("paimana_monitoring", data)
        self.assertIn("astra_intelligence", data)
        
        p = data["paimana_monitoring"]
        self.assertEqual(p["tracked_projects"], 10000)
        self.assertGreater(p["original_cost_cr"], 0)
        self.assertGreater(p["revised_cost_cr"], p["original_cost_cr"])
        self.assertGreater(p["cumulative_expenditure_cr"], 0)
        
        a = data["astra_intelligence"]
        self.assertGreater(a["high_risk_projects"], 100)
        self.assertGreater(a["critical_projects"], 50)
        self.assertGreater(a["capital_at_risk_cr"], 0)

    def test_sectors_breakdown(self):
        """Verify GET /api/reports/sectors returns sector-level metrics."""
        response = self.client.get("/api/reports/sectors?snapshot_month=2026-07")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("sectors", data)
        self.assertGreater(len(data["sectors"]), 3)
        for sec in data["sectors"]:
            self.assertIn("sector", sec)
            self.assertIn("project_count", sec)
            self.assertIn("high_risk_projects_count", sec)

    def test_ministries_breakdown(self):
        """Verify GET /api/reports/ministries returns ministry aggregations."""
        response = self.client.get("/api/reports/ministries?snapshot_month=2026-07")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("ministries", data)
        self.assertGreater(len(data["ministries"]), 5)

    def test_states_breakdown(self):
        """Verify GET /api/reports/states returns state aggregations."""
        response = self.client.get("/api/reports/states?snapshot_month=2026-07")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("states", data)
        self.assertGreater(len(data["states"]), 10)

    def test_hml_categories(self):
        """Verify GET /api/reports/hml returns Harmonized Master List categories."""
        response = self.client.get("/api/reports/hml?snapshot_month=2026-07")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("categories", data)
        categories = {cat["hml_category"]: cat["project_count"] for cat in data["categories"]}
        self.assertIn("Transport & Logistics", categories)
        self.assertIn("Energy", categories)
        self.assertEqual(sum(categories.values()), 10000)

    def test_ner_projects(self):
        """Verify GET /api/reports/ner returns North Eastern Region overview."""
        response = self.client.get("/api/reports/ner?snapshot_month=2026-07")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("project_count", data)
        self.assertGreater(data["project_count"], 0)
        self.assertIn("state_breakdown", data)
        self.assertGreaterEqual(len(data["state_breakdown"]), 1)

    def test_major_vs_mega(self):
        """Verify GET /api/reports/major-mega separates mega (>=1000Cr) vs major (<1000Cr)."""
        response = self.client.get("/api/reports/major-mega?snapshot_month=2026-07")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("mega_projects", data)
        self.assertIn("major_projects", data)
        self.assertEqual(data["mega_projects"]["project_count"] + data["major_projects"]["project_count"], 10000)

    def test_table_1_ministry_wise(self):
        """Verify Flash Report Table 1: Ministry-wise project analysis."""
        response = self.client.get("/api/reports/tables/ministry-wise?snapshot_month=2026-07")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("records", data)
        self.assertEqual(data["table_number"], 1)
        self.assertGreater(len(data["records"]), 5)

    def test_table_2_state_wise(self):
        """Verify Flash Report Table 2: State-wise project analysis."""
        response = self.client.get("/api/reports/tables/state-wise?snapshot_month=2026-07")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("records", data)
        self.assertEqual(data["table_number"], 2)
        self.assertGreaterEqual(len(data["records"]), 15)

    def test_table_3_completed(self):
        """Verify Flash Report Table 3: Completed projects list."""
        response = self.client.get("/api/reports/tables/completed?snapshot_month=2026-07")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("projects", data)
        self.assertIn("total_completed", data)
        self.assertEqual(data["table_number"], 3)

    def test_table_4_newly_added(self):
        """Verify Flash Report Table 4: Newly added projects list."""
        response = self.client.get("/api/reports/tables/newly-added?snapshot_month=2026-07")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("projects", data)
        self.assertIn("total_newly_added", data)
        self.assertEqual(data["table_number"], 4)

    def test_table_5_ner(self):
        """Verify Flash Report Table 5: NER project catalog."""
        response = self.client.get("/api/reports/tables/ner-projects?snapshot_month=2026-07")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("records", data)
        self.assertEqual(data["table_number"], 5)
        self.assertGreater(len(data["records"]), 0)

    def test_table_6_ongoing(self):
        """Verify Flash Report Table 6: All Ongoing Projects pagination and schema."""
        res = self.client.get("/api/reports/tables/all-ongoing?snapshot_month=2026-07&page=1&page_size=10")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["table_number"], 6)
        self.assertEqual(len(data["projects"]), 10)
        self.assertEqual(data["total_records"], 10000)
        self.assertIn("legacy_ocms_code", data["projects"][0])
        self.assertIn("overall_risk_score", data["projects"][0])

    def test_mom_comparison(self):
        """Verify Month-over-Month comparison between June and July 2026."""
        response = self.client.get("/api/reports/compare?snapshot_a=2026-06&snapshot_b=2026-07")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["snapshot_a"], "2026-06")
        self.assertEqual(data["snapshot_b"], "2026-07")
        self.assertIn("portfolio_deltas", data)
        self.assertIn("top_risk_escalating_projects", data)
        deltas = data["portfolio_deltas"]
        self.assertIn("project_count_delta", deltas)
        self.assertIn("expenditure_delta_cr", deltas)

    def test_project_forecast_7_step_journey(self):
        """Verify GET /api/reports/forecast/{project_id} returns complete 7-step forecast journey."""
        response = self.client.get("/api/reports/forecast/PRJ-SYN-000002")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["project_id"], "PRJ-SYN-000002")
        self.assertEqual(data["headline"], "PAIMANA Snapshot \u2192 ASTRA Forecast")
        
        # Verify 7 distinct steps
        self.assertIn("step_1_observed", data)
        self.assertIn("step_2_change", data)
        self.assertIn("step_3_detection", data)
        self.assertIn("step_4_explainability", data)
        self.assertIn("step_5_consequence", data)
        self.assertIn("step_6_intervention", data)
        self.assertIn("step_7_what_if", data)

        # Verify step 6 non-accusatory governance notice
        step6 = data["step_6_intervention"]
        self.assertIn("governance_rule", step6)
        self.assertIn("requires human review", step6["governance_rule"])

    def test_data_quality_observatory(self):
        """Verify Data Quality rules DQ001-DQ012 and non-accusatory review semantic."""
        response = self.client.get("/api/reports/data-quality?snapshot_month=2026-07")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("total_flags_count", data)
        self.assertGreater(data["total_flags_count"], 0)
        self.assertEqual(data["label"], "DATA QUALITY FLAG \u2014 HUMAN REVIEW REQUIRED")
        self.assertIn("rules_summary", data)
        self.assertIn("sample_flagged_projects", data)

    def test_model_benchmarking(self):
        """Verify Model A (CUF Baseline) vs Model B (ASTRA Enhanced) benchmarks."""
        response = self.client.get("/api/reports/models/comparison")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("benchmarks", data)
        self.assertIn("key_findings", data)
        self.assertIn("stored_benchmarks", data)
        
        findings = data["key_findings"]["cuf_vs_enhanced_gain"]
        self.assertIn("+17.57", findings["f1_improvement"])
        self.assertIn("+3.7", findings["lead_time_advantage"])

    def test_export_csv_and_html(self):
        """Verify export endpoint returns valid CSV and print-ready HTML."""
        res_csv = self.client.get("/api/reports/export?snapshot_month=2026-07&format=csv")
        self.assertEqual(res_csv.status_code, 200)
        self.assertIn("PAIMANA Monitoring", res_csv.text)
        self.assertIn("ASTRA Intelligence", res_csv.text)

        res_html = self.client.get("/api/reports/export?snapshot_month=2026-07&format=html")
        self.assertEqual(res_html.status_code, 200)
        self.assertIn("ASTRA \u2014 National Infrastructure Intelligence Report", res_html.text)

    def test_data_quality_engine_unit(self):
        """Verify direct execution of DataQualityEngine."""
        catalog = DataQualityEngine.get_rule_catalog()
        self.assertEqual(len(catalog), 12)
        self.assertIn("DQ001", catalog)
        self.assertIn("DQ012", catalog)
        
        engine = DataQualityEngine()
        results = engine.evaluate_all_rules(snapshot_month="2026-07")
        self.assertIn("total_flags_count", results)
        self.assertGreater(results["total_flags_count"], 0)

    def test_model_comparison_engine_unit(self):
        """Verify direct execution of ModelComparisonEngine."""
        engine = ModelComparisonEngine()
        summary = engine.get_full_comparison_summary()
        self.assertIn("summary", summary)
        self.assertIn("key_takeaway", summary["summary"])
        self.assertIn("+17.57 F1 points", summary["summary"]["key_takeaway"])


if __name__ == "__main__":
    unittest.main()
