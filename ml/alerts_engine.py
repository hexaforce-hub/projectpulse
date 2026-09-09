"""
ProjectPulse — Automated Early Warning Signals & Alert Triage Engine
Ministry of Statistics & Programme Implementation (MoSPI) / IPMD
Smart India Hackathon 2026 — Team HexaForce

Continuously scans infrastructure projects for multi-factor execution friction:
1. Financial-Physical Decoupling Alarm (disproportionate spend vs physical progress)
2. Milestone Cascade Slippage (critical path cluster failure)
3. Machine Learning Predictive Escalation (LightGBM high-probability delay forecast)
4. Statutory Bottleneck Impasse (ROW, forest, legal clearances stalling progress)

Generates prioritized alerts with concrete administrative intervention directives.
Conforms strictly to DATA_CONTRACT.md.
"""

from datetime import datetime
from pathlib import Path
import sqlite3

class EarlyWarningEngine:
    def __init__(self, db_path=None):
        self.db_path = str(db_path or (Path(__file__).parent.parent / "data" / "projectpulse.db"))

    def evaluate_project(self, p):
        """
        Evaluates a single project dictionary against the 4 early-warning signal rules.
        Returns a list of detected alert dicts.
        """
        alerts = []
        pid = p["project_id"]
        pname = p["project_name"]
        today_str = "2026-03-31"
        
        gap = float(p.get("progress_decoupling_gap", 0.0))
        phys = float(p.get("physical_progress_pct", 0.0))
        fin = float(p.get("financial_progress_pct", 0.0))
        spend = float(p.get("cumulative_expenditure_cr", 0.0))
        rev_cost = float(p.get("revised_cost_cr", 0.0))
        
        m_delayed = int(p.get("milestones_delayed", 0))
        m_total = int(p.get("milestone_count", 10))
        delay_rate = float(p.get("milestone_delay_rate", 0.0))
        
        r_class = p.get("target_risk_class", "LOW")
        delay_months = int(p.get("target_schedule_delay_months", 0))
        
        bottleneck = p.get("primary_bottleneck", "NONE")
        btn_title = bottleneck.replace("_", " ").title()
        
        elapsed_ratio = float(p.get("duration_elapsed_ratio", 0.0))
        if elapsed_ratio == 0.0 and "planned_duration_months" in p and "project_age_months" in p:
            elapsed_ratio = round(float(p["project_age_months"]) / max(1.0, float(p["planned_duration_months"])), 2)
            
        state = p.get("state", "State Jurisdiction")
        ministry = p.get("ministry", "Central Ministry")

        # -------------------------------------------------------------
        # SIGNAL 1: Financial-Physical Decoupling Alarm
        # -------------------------------------------------------------
        if gap > 25.0:
            severity = "CRITICAL"
            action = f"Initiate financial-physical reconciliation audit; restrict further fund release pending site verification."
            alerts.append({
                "alert_id": f"ALT-DEC-{pid}",
                "project_id": pid,
                "project_name": pname,
                "severity": severity,
                "trigger_type": "DECOUPLING_GAP",
                "signal": f"Severe Decoupling: Expenditure ({fin:.1f}%) leads physical progress ({phys:.1f}%) by {gap:+.1f} points",
                "detected_at": today_str,
                "risk_change": "+26 points",
                "status": "Escalated",
                "recommended_action": action
            })
        elif gap > 18.0:
            severity = "HIGH"
            action = f"Issue discrepancy notice to {p.get('implementing_agency', 'executing agency')} for expenditure mismatch."
            alerts.append({
                "alert_id": f"ALT-DEC-{pid}",
                "project_id": pid,
                "project_name": pname,
                "severity": severity,
                "trigger_type": "DECOUPLING_GAP",
                "signal": f"Decoupling Warning: Expenditure leads physical progress by {gap:+.1f} percentage points",
                "detected_at": today_str,
                "risk_change": "+16 points",
                "status": "Requires Review",
                "recommended_action": action
            })

        # -------------------------------------------------------------
        # SIGNAL 2: Critical Path Milestone Cascade Slippage
        # -------------------------------------------------------------
        if delay_rate >= 0.40 or m_delayed >= 4:
            severity = "CRITICAL"
            action = f"Empowered Committee must conduct critical path review for {m_delayed} breached milestones."
            alerts.append({
                "alert_id": f"ALT-MLS-{pid}",
                "project_id": pid,
                "project_name": pname,
                "severity": severity,
                "trigger_type": "MILESTONE_CASCADE",
                "signal": f"Milestone Cascade: {m_delayed} of {m_total} checkpoints delayed beyond baseline COD",
                "detected_at": today_str,
                "risk_change": "+22 points",
                "status": "Escalated",
                "recommended_action": action
            })
        elif delay_rate >= 0.25 or m_delayed >= 2:
            severity = "HIGH"
            action = f"Instruct Project Director to submit catch-up recovery schedule within 14 days."
            alerts.append({
                "alert_id": f"ALT-MLS-{pid}",
                "project_id": pid,
                "project_name": pname,
                "severity": severity,
                "trigger_type": "MILESTONE_CASCADE",
                "signal": f"Milestone Slippage: {m_delayed} checkpoints overdue ({delay_rate*100:.0f}% slippage rate)",
                "detected_at": today_str,
                "risk_change": "+14 points",
                "status": "Under Investigation",
                "recommended_action": action
            })

        # -------------------------------------------------------------
        # SIGNAL 3: Machine Learning Predictive Escalation
        # -------------------------------------------------------------
        if r_class == "CRITICAL" or delay_months >= 20:
            severity = "CRITICAL"
            action = f"Submit urgent briefing to Cabinet Committee on Infrastructure; project faces {delay_months} months anticipated delay."
            alerts.append({
                "alert_id": f"ALT-MLP-{pid}",
                "project_id": pid,
                "project_name": pname,
                "severity": severity,
                "trigger_type": "ML_PREDICTIVE_ESCALATION",
                "signal": f"Predictive Distress: LightGBM forecast indicates {delay_months} months delay beyond COD",
                "detected_at": today_str,
                "risk_change": "+28 points",
                "status": "Escalated",
                "recommended_action": action
            })
        elif r_class == "HIGH" or delay_months >= 12:
            severity = "HIGH"
            action = f"Schedule IPMD inter-ministerial coordination meeting with {ministry}."
            alerts.append({
                "alert_id": f"ALT-MLP-{pid}",
                "project_id": pid,
                "project_name": pname,
                "severity": severity,
                "trigger_type": "ML_PREDICTIVE_ESCALATION",
                "signal": f"Elevated Risk Trajectory: Model predicts high probability of project escalation",
                "detected_at": today_str,
                "risk_change": "+18 points",
                "status": "Requires Review",
                "recommended_action": action
            })

        # -------------------------------------------------------------
        # SIGNAL 4: Statutory Bottleneck Impasse
        # -------------------------------------------------------------
        statutory_bottlenecks = {"LAND_ACQUISITION", "FOREST_CLEARANCE", "LEGAL_DISPUTE", "UTILITY_SHIFTING"}
        if bottleneck in statutory_bottlenecks and elapsed_ratio >= 0.40 and phys < 50.0:
            severity = "HIGH"
            action = f"Direct Chief Secretary of {state} to convene State Task Force on {btn_title}."
            alerts.append({
                "alert_id": f"ALT-BTN-{pid}",
                "project_id": pid,
                "project_name": pname,
                "severity": severity,
                "trigger_type": "STATUTORY_IMPASSE",
                "signal": f"Statutory Impasse: {btn_title} blocking progress with {elapsed_ratio*100:.0f}% duration elapsed",
                "detected_at": today_str,
                "risk_change": "+15 points",
                "status": "Under Investigation",
                "recommended_action": action
            })

        return alerts

    def scan_portfolio(self, limit=None):
        """
        Scans all projects in the database and generates prioritized alerts.
        Returns total alerts generated, categorized by severity.
        """
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        query = "SELECT * FROM projects"
        if limit:
            query += f" LIMIT {int(limit)}"
        cursor.execute(query)
        rows = cursor.fetchall()
        
        all_alerts = []
        for r in rows:
            p_dict = dict(r)
            p_alerts = self.evaluate_project(p_dict)
            all_alerts.extend(p_alerts)
            
        conn.close()
        
        # Sort by severity hierarchy: CRITICAL -> HIGH -> MODERATE -> LOW
        severity_rank = {"CRITICAL": 1, "HIGH": 2, "MODERATE": 3, "LOW": 4}
        all_alerts.sort(key=lambda x: severity_rank.get(x["severity"], 5))
        
        return all_alerts

    def sync_to_database(self, alerts_list):
        """
        Persists the generated alerts into the SQLite alerts table with full foreign key consistency.
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("PRAGMA foreign_keys = ON;")
        
        # Clear existing alerts
        cursor.execute("DELETE FROM alerts;")
        
        insert_sql = """
            INSERT INTO alerts (alert_id, project_id, project_name, severity, signal, detected_at, risk_change, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """
        records = [
            (
                a["alert_id"], a["project_id"], a["project_name"],
                a["severity"], a["signal"], a["detected_at"],
                a["risk_change"], a["status"]
            )
            for a in alerts_list
        ]
        
        cursor.executemany(insert_sql, records)
        conn.commit()
        conn.close()
        return len(records)
