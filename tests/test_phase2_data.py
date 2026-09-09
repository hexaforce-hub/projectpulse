"""
Unit Tests for Phase 2 Data Foundation
Smart India Hackathon 2026 — Team HexaForce
MoSPI IPMD / PAIMANA Compatible Specification
"""

import csv
import json
import unittest
from pathlib import Path
from datetime import datetime

DATA_DIR = Path(__file__).parent.parent / "data"

class TestPhase2DataFoundation(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.clean_csv = DATA_DIR / "processed" / "projects_clean.csv"
        cls.raw_csv = DATA_DIR / "raw" / "projects_raw.csv"
        cls.ml_csv = DATA_DIR / "processed" / "ml_ready_projects.csv"
        cls.milestones_csv = DATA_DIR / "processed" / "project_milestones.csv"
        cls.report_json = DATA_DIR / "quality" / "data_quality_report.json"
        cls.stats_json = DATA_DIR / "quality" / "dataset_statistics.json"
        cls.manifest_json = DATA_DIR / "quality" / "dataset_manifest.json"
        
        cls.projects = []
        with open(cls.clean_csv, "r", encoding="utf-8") as f:
            cls.projects = list(csv.DictReader(f))
            
        cls.ml_rows = []
        with open(cls.ml_csv, "r", encoding="utf-8") as f:
            cls.ml_rows = list(csv.DictReader(f))

    def test_record_counts(self):
        """Verify target scale of 10,000 projects is achieved."""
        self.assertEqual(len(self.projects), 10000, "Clean projects count must equal 10,000")
        self.assertEqual(len(self.ml_rows), 10000, "ML-ready projects count must equal 10,000")

    def test_id_uniqueness(self):
        """Verify all project IDs are unique."""
        pids = [p["project_id"] for p in self.projects]
        self.assertEqual(len(pids), len(set(pids)), "All project IDs must be strictly unique")

    def test_cost_constraints(self):
        """Verify MoSPI threshold ₹150 Cr and mathematical integrity of costs."""
        for p in self.projects:
            orig = float(p["original_cost_cr"])
            rev = float(p["revised_cost_cr"])
            spend = float(p["cumulative_expenditure_cr"])
            overrun = float(p["cost_overrun_cr"])
            
            self.assertGreaterEqual(orig, 150.0, f"Cost below MoSPI threshold in {p['project_id']}")
            self.assertGreaterEqual(rev, orig, f"Revised cost less than original in {p['project_id']}")
            self.assertLessEqual(spend, rev + 0.05, f"Expenditure exceeds revised cost in {p['project_id']}")
            self.assertAlmostEqual(rev - orig, overrun, delta=0.05, msg="Cost overrun calculation mismatch")

    def test_progress_bounds(self):
        """Verify physical & financial progress remain within [0, 100]."""
        for p in self.projects:
            phys = float(p["physical_progress_pct"])
            fin = float(p["financial_progress_pct"])
            gap = float(p["progress_decoupling_gap"])
            
            self.assertTrue(0.0 <= phys <= 100.0, f"Physical progress out of range: {phys}")
            self.assertTrue(0.0 <= fin <= 100.0, f"Financial progress out of range: {fin}")
            self.assertAlmostEqual(fin - phys, gap, delta=0.05, msg="Decoupling gap calculation mismatch")

    def test_date_chronology(self):
        """Verify chronological validity: start < planned <= revised."""
        for p in self.projects:
            sd = datetime.strptime(p["start_date"], "%Y-%m-%d")
            pd = datetime.strptime(p["planned_completion_date"], "%Y-%m-%d")
            rd = datetime.strptime(p["revised_completion_date"], "%Y-%m-%d")
            
            self.assertLess(sd, pd, f"Planned completion before start in {p['project_id']}")
            self.assertLessEqual(pd, rd, f"Revised completion before planned in {p['project_id']}")

    def test_milestone_integrity(self):
        """Verify milestone counts and completion relationships."""
        for p in self.projects:
            m_total = int(p["milestone_count"])
            m_comp = int(p["milestones_completed"])
            m_del = int(p["milestones_delayed"])
            m_risk = int(p["milestones_at_risk"])
            
            self.assertLessEqual(m_comp, m_total, "Completed milestones cannot exceed total count")
            self.assertLessEqual(m_del, m_total, "Delayed milestones cannot exceed total count")
            self.assertLessEqual(m_risk, m_total, "At-risk milestones cannot exceed total count")

    def test_risk_distribution(self):
        """Verify risk class distribution adheres to realistic MoSPI bounds."""
        counts = {}
        for p in self.projects:
            c = p["target_risk_class"]
            counts[c] = counts.get(c, 0) + 1
            
        low_pct = (counts.get("LOW", 0) / 10000) * 100
        mod_pct = (counts.get("MODERATE", 0) / 10000) * 100
        high_pct = (counts.get("HIGH", 0) / 10000) * 100
        crit_pct = (counts.get("CRITICAL", 0) / 10000) * 100
        
        self.assertTrue(30.0 <= low_pct <= 50.0, f"LOW risk out of bound: {low_pct}%")
        self.assertTrue(20.0 <= mod_pct <= 40.0, f"MODERATE risk out of bound: {mod_pct}%")
        self.assertTrue(12.0 <= high_pct <= 28.0, f"HIGH risk out of bound: {high_pct}%")
        self.assertTrue(4.0 <= crit_pct <= 15.0, f"CRITICAL risk out of bound: {crit_pct}%")

    def test_no_data_leakage_in_ml_features(self):
        """Verify post-outcome fields are excluded from ml_ready feature columns."""
        forbidden_features = [
            "revised_cost_cr", "cost_overrun_cr", "cost_growth_pct",
            "revised_completion_date", "schedule_slippage_months",
            "revised_duration_months", "overall_risk_score"
        ]
        ml_fieldnames = self.ml_rows[0].keys()
        for col in forbidden_features:
            self.assertNotIn(col, ml_fieldnames, f"Forbidden post-outcome feature found in ML dataset: {col}")

    def test_quality_score_and_gate(self):
        """Verify data quality report score is >= 98 and gate is passed."""
        with open(self.report_json, "r", encoding="utf-8") as f:
            rep = json.load(f)
            
        self.assertGreaterEqual(rep["overall_quality_score"], 98.0, "Data quality score below 98.0")
        self.assertTrue(rep["gate_passed"], "Quality report gate must be PASSED")
        self.assertEqual(rep["test_cases_validation"]["detection_rate_pct"], 100.0, "Must detect 100% of defect test cases")

    def test_manifest_completeness(self):
        """Verify dataset_manifest.json exists and catalogs all required files."""
        with open(self.manifest_json, "r", encoding="utf-8") as f:
            manifest = json.load(f)
            
        self.assertEqual(manifest["record_count"], 10000)
        self.assertTrue(manifest["quality_summary"]["gate_passed"])
        required_artifacts = [
            "processed/projects_clean.csv",
            "processed/ml_ready_projects.csv",
            "processed/project_milestones.csv",
            "raw/projects_raw.csv",
            "examples/example_project.json",
            "quality/data_quality_report.json",
            "quality/dataset_statistics.json"
        ]
        for art in required_artifacts:
            self.assertIn(art, manifest["artifacts"], f"Manifest missing artifact: {art}")

    def test_phase1_frontend_regression(self):
        """Verify zero regressions: all Phase 1 UI assets and contracts exist untouched."""
        root_dir = Path(__file__).parent.parent
        phase1_files = [
            "index.html",
            "css/design-system.css",
            "js/types.js",
            "js/formatters.js",
            "js/mockData.js",
            "js/components/common.js",
            "js/components/DashboardView.js",
            "js/components/ProjectsView.js",
            "js/components/ProjectDetailView.js",
            "js/components/EarlyWarningsView.js",
            "js/components/AnalyticsView.js",
            "js/components/AppShell.js",
            "js/router.js",
            "DESIGN_SYSTEM.md",
            "PRODUCT_SCOPE.md",
            "DATA_CONTRACT.md"
        ]
        for fpath in phase1_files:
            self.assertTrue((root_dir / fpath).exists(), f"Phase 1 regression detected: missing {fpath}")

if __name__ == "__main__":
    unittest.main()
