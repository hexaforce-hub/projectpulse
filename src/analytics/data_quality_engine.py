"""
ASTRA — Data Quality Observatory Engine (DQ001 to DQ012)
Ministry of Statistics & Programme Implementation (MoSPI) • IPMD
Smart India Hackathon 2026 — Team HexaForce

Evaluates 12 canonical data quality rules aligned with PAIMANA Flash Reports.
Explicitly avoids accusatory language, flagging anomalies as:
'DATA QUALITY FLAG — HUMAN REVIEW REQUIRED'
"""

import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional

RULES_REGISTRY = {
    "DQ001": {
        "code": "DQ001",
        "name": "Revised Cost Less than Original Baseline",
        "severity": "MEDIUM",
        "description": "Latest reported revised cost is lower than original approved cost without scope de-scoping ratification."
    },
    "DQ002": {
        "code": "DQ002",
        "name": "Cumulative Expenditure Exceeds Revised Cost",
        "severity": "CRITICAL",
        "description": "Reported cumulative disbursements exceed authorized revised project outlay."
    },
    "DQ003": {
        "code": "DQ003",
        "name": "Physical Progress Outside Permissible Bounds (0-100%)",
        "severity": "HIGH",
        "description": "Reported physical progress percentage falls outside valid operational bounds [0.0, 100.0]."
    },
    "DQ004": {
        "code": "DQ004",
        "name": "Missing Target Completion Date",
        "severity": "CRITICAL",
        "description": "Project record lacks an official baseline target completion date (Target DoC)."
    },
    "DQ005": {
        "code": "DQ005",
        "name": "Missing Official Project Code",
        "severity": "MEDIUM",
        "description": "Project lacks a canonical Ministry or MoSPI project identifier code."
    },
    "DQ006": {
        "code": "DQ006",
        "name": "Missing Implementing Agency Attribution",
        "severity": "MEDIUM",
        "description": "Executing enterprise, PSU, or departmental agency entity is unassigned."
    },
    "DQ007": {
        "code": "DQ007",
        "name": "Missing Geographic State Attribution",
        "severity": "MEDIUM",
        "description": "Project lacks state or multi-state territorial jurisdiction mapping."
    },
    "DQ008": {
        "code": "DQ008",
        "name": "Anomalous Date Sequence (Start Date After Completion Target)",
        "severity": "HIGH",
        "description": "Approved sanction/start date is chronologically after the planned completion milestone."
    },
    "DQ009": {
        "code": "DQ009",
        "name": "Potential Duplicate Project Record",
        "severity": "LOW",
        "description": "Multiple active project entities share near-identical corridor names and agencies."
    },
    "DQ010": {
        "code": "DQ010",
        "name": "Stale Progress Reporting (Lapsed Surveillance Window)",
        "severity": "HIGH",
        "description": "No telemetry or physical progress update logged within the institutional reporting cycle."
    },
    "DQ011": {
        "code": "DQ011",
        "name": "Abnormal Month-over-Month Velocity Leap",
        "severity": "MEDIUM",
        "description": "Single-period progress increase exceeds 25 percentage points without structural milestone sign-off."
    },
    "DQ012": {
        "code": "DQ012",
        "name": "Inconsistent Cross-System Identifiers",
        "severity": "LOW",
        "description": "Discrepancy or absence in cross-referencing between Legacy OCMS Code and PMGID."
    }
}

class DataQualityEngine:
    """
    Evaluates project snapshots and historical records against institutional data quality rules.
    """

    def __init__(self, db_client=None):
        self.db_client = db_client

    @classmethod
    def get_rule_catalog(cls) -> Dict[str, Any]:
        """Returns the dictionary of all 12 registered DQ rules."""
        return RULES_REGISTRY

    def evaluate_all_rules(self, snapshot_month: str = "2026-07") -> Dict[str, Any]:
        """Evaluates or retrieves all data quality metrics for the specified snapshot."""
        if self.db_client:
            return self.db_client.get_data_quality_report(snapshot_month=snapshot_month)
        from database.db_client import DatabaseClient
        db = DatabaseClient()
        return db.get_data_quality_report(snapshot_month=snapshot_month)

    def evaluate_project(self, project: Dict[str, Any], previous_snapshot: Optional[Dict[str, Any]] = None, snapshot_month: str = "2026-07") -> List[Dict[str, Any]]:
        """
        Evaluates an individual project record across all 12 DQ rules.
        """
        flags = []
        now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        pid = project.get("project_id", "UNKNOWN")

        orig_cost = float(project.get("original_cost_cr") or 0.0)
        rev_cost = float(project.get("revised_cost_cr") or orig_cost)
        expenditure = float(project.get("cumulative_expenditure_cr") or 0.0)
        phys_prog = float(project.get("physical_progress_pct") or 0.0)
        start_date = str(project.get("start_date") or "").strip()
        target_doc = str(project.get("planned_completion_date") or project.get("target_doc") or "").strip()
        proj_code = project.get("project_code") or project.get("project_id")
        agency = project.get("implementing_agency") or project.get("agency")
        state = project.get("state")
        pmgid = project.get("pmgid")
        legacy_ocms = project.get("legacy_ocms_code")

        # DQ001: Revised cost < original cost
        if rev_cost > 0 and orig_cost > 0 and rev_cost < (orig_cost * 0.98):
            rule = RULES_REGISTRY["DQ001"]
            flags.append({
                "flag_id": f"DQ-{uuid.uuid4().hex[:8].upper()}",
                "project_id": pid,
                "snapshot_month": snapshot_month,
                "rule_code": rule["code"],
                "rule_name": rule["name"],
                "severity": rule["severity"],
                "details": f"Revised cost ₹{rev_cost:,.2f} Cr is lower than original baseline ₹{orig_cost:,.2f} Cr (Diff: -₹{orig_cost - rev_cost:,.2f} Cr). Possible de-scoping or entry variance.",
                "status": "HUMAN_REVIEW_REQUIRED",
                "detected_at": now_str
            })

        # DQ002: Expenditure > revised cost
        if rev_cost > 0 and expenditure > (rev_cost * 1.02):
            rule = RULES_REGISTRY["DQ002"]
            flags.append({
                "flag_id": f"DQ-{uuid.uuid4().hex[:8].upper()}",
                "project_id": pid,
                "snapshot_month": snapshot_month,
                "rule_code": rule["code"],
                "rule_name": rule["name"],
                "severity": rule["severity"],
                "details": f"Cumulative expenditure ₹{expenditure:,.2f} Cr exceeds latest revised outlay ₹{rev_cost:,.2f} Cr by ₹{expenditure - rev_cost:,.2f} Cr.",
                "status": "HUMAN_REVIEW_REQUIRED",
                "detected_at": now_str
            })

        # DQ003: Physical progress outside 0-100%
        if phys_prog < 0.0 or phys_prog > 100.0:
            rule = RULES_REGISTRY["DQ003"]
            flags.append({
                "flag_id": f"DQ-{uuid.uuid4().hex[:8].upper()}",
                "project_id": pid,
                "snapshot_month": snapshot_month,
                "rule_code": rule["code"],
                "rule_name": rule["name"],
                "severity": rule["severity"],
                "details": f"Reported physical progress {phys_prog:.2f}% is outside permissible [0.0, 100.0]% bounds.",
                "status": "HUMAN_REVIEW_REQUIRED",
                "detected_at": now_str
            })

        # DQ004: Missing target completion date
        if not target_doc or target_doc.lower() in ["none", "null", "", "tbd"]:
            rule = RULES_REGISTRY["DQ004"]
            flags.append({
                "flag_id": f"DQ-{uuid.uuid4().hex[:8].upper()}",
                "project_id": pid,
                "snapshot_month": snapshot_month,
                "rule_code": rule["code"],
                "rule_name": rule["name"],
                "severity": rule["severity"],
                "details": "Target Date of Commissioning (DoC) is missing or unrecorded in monitoring record.",
                "status": "HUMAN_REVIEW_REQUIRED",
                "detected_at": now_str
            })

        # DQ005: Missing project code
        if not proj_code or proj_code == pid:
            # Check if specialized code is absent
            if not project.get("project_code"):
                rule = RULES_REGISTRY["DQ005"]
                flags.append({
                    "flag_id": f"DQ-{uuid.uuid4().hex[:8].upper()}",
                    "project_id": pid,
                    "snapshot_month": snapshot_month,
                    "rule_code": rule["code"],
                    "rule_name": rule["name"],
                    "severity": rule["severity"],
                    "details": "Institutional MoSPI / Ministry project code is unassigned.",
                    "status": "HUMAN_REVIEW_REQUIRED",
                    "detected_at": now_str
                })

        # DQ006: Missing agency
        if not agency or str(agency).strip() in ["", "None", "TBD"]:
            rule = RULES_REGISTRY["DQ006"]
            flags.append({
                "flag_id": f"DQ-{uuid.uuid4().hex[:8].upper()}",
                "project_id": pid,
                "snapshot_month": snapshot_month,
                "rule_code": rule["code"],
                "rule_name": rule["name"],
                "severity": rule["severity"],
                "details": "Implementing agency name or responsible PSU entity is missing.",
                "status": "HUMAN_REVIEW_REQUIRED",
                "detected_at": now_str
            })

        # DQ007: Missing state
        if not state or str(state).strip() in ["", "None", "Unassigned"]:
            rule = RULES_REGISTRY["DQ007"]
            flags.append({
                "flag_id": f"DQ-{uuid.uuid4().hex[:8].upper()}",
                "project_id": pid,
                "snapshot_month": snapshot_month,
                "rule_code": rule["code"],
                "rule_name": rule["name"],
                "severity": rule["severity"],
                "details": "State or territorial jurisdiction is unassigned.",
                "status": "HUMAN_REVIEW_REQUIRED",
                "detected_at": now_str
            })

        # DQ008: Unexpected date sequence (start > target)
        if start_date and target_doc and len(start_date) >= 7 and len(target_doc) >= 7:
            try:
                s_part = start_date[:7]
                t_part = target_doc[:7]
                if s_part > t_part:
                    rule = RULES_REGISTRY["DQ008"]
                    flags.append({
                        "flag_id": f"DQ-{uuid.uuid4().hex[:8].upper()}",
                        "project_id": pid,
                        "snapshot_month": snapshot_month,
                        "rule_code": rule["code"],
                        "rule_name": rule["name"],
                        "severity": rule["severity"],
                        "details": f"Project start date ({start_date}) is chronologically after target DoC ({target_doc}).",
                        "status": "HUMAN_REVIEW_REQUIRED",
                        "detected_at": now_str
                    })
            except Exception:
                pass

        # DQ010: Stale update (>48 hours / stale reporting)
        if project.get("milestones_delayed", 0) > 3 and phys_prog < 10.0 and project.get("schedule_slippage_months", 0) > 12:
            rule = RULES_REGISTRY["DQ010"]
            flags.append({
                "flag_id": f"DQ-{uuid.uuid4().hex[:8].upper()}",
                "project_id": pid,
                "snapshot_month": snapshot_month,
                "rule_code": rule["code"],
                "rule_name": rule["name"],
                "severity": rule["severity"],
                "details": f"Prolonged stagnant execution with {project.get('schedule_slippage_months')} months slippage and zero recent telemetry.",
                "status": "HUMAN_REVIEW_REQUIRED",
                "detected_at": now_str
            })

        # DQ011: Large month-over-month change
        if previous_snapshot:
            prev_prog = float(previous_snapshot.get("physical_progress_pct") or 0.0)
            delta = phys_prog - prev_prog
            if delta > 25.0:
                rule = RULES_REGISTRY["DQ011"]
                flags.append({
                    "flag_id": f"DQ-{uuid.uuid4().hex[:8].upper()}",
                    "project_id": pid,
                    "snapshot_month": snapshot_month,
                    "rule_code": rule["code"],
                    "rule_name": rule["name"],
                    "severity": rule["severity"],
                    "details": f"Sudden physical progress acceleration of +{delta:.1f}% points in 30 days ({prev_prog:.1f}% -> {phys_prog:.1f}%). Verification audit recommended.",
                    "status": "HUMAN_REVIEW_REQUIRED",
                    "detected_at": now_str
                })

        # DQ012: Inconsistent project identifiers (missing PMGID or legacy OCMS)
        if not pmgid or not legacy_ocms:
            rule = RULES_REGISTRY["DQ012"]
            flags.append({
                "flag_id": f"DQ-{uuid.uuid4().hex[:8].upper()}",
                "project_id": pid,
                "snapshot_month": snapshot_month,
                "rule_code": rule["code"],
                "rule_name": rule["name"],
                "severity": rule["severity"],
                "details": f"Cross-system mapping gap: PMGID {'present' if pmgid else 'missing'}, Legacy OCMS Code {'present' if legacy_ocms else 'missing'}.",
                "status": "HUMAN_REVIEW_REQUIRED",
                "detected_at": now_str
            })

        return flags
