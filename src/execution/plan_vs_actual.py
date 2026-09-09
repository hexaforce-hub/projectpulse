"""
ProjectPulse — Plan vs Actual Intelligence & Variance Engine
Ministry of Statistics & Programme Implementation (MoSPI) / IPMD
Smart India Hackathon 2026 — Team HexaForce

Implements:
1. Schedule, Progress, and Quantity Variance Metrics
2. Target Miss Detection with 9 Canonical Delay Reason Categories
3. Stale Update Surveillance (>48 hours inactivity)
4. Execution Velocity Tracking (Actual Run-Rate vs Required Run-Rate)
5. 0-100 Government-Grade Execution Health Index
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any

CANONICAL_TARGET_MISS_REASONS = [
    "LABOR_SHORTAGE",
    "MATERIAL_UNAVAILABLE",
    "EQUIPMENT_BREAKDOWN",
    "WEATHER_STOPPAGE",
    "PERMIT_DELAY",
    "DESIGN_REVISION",
    "RIGHT_OF_WAY_BLOCKED",
    "PAYMENT_DISPUTE",
    "QUALITY_REJECTION"
]

class PlanVsActualEngine:
    """Computes operational progress slippage, target misses, and execution health."""

    def __init__(self, db_client=None):
        self.db_client = db_client

    def compute_project_execution_health(self, project_id: str) -> Dict[str, Any]:
        """
        Calculates comprehensive Plan vs Actual metrics and a 0-100 Execution Health Score.
        """
        if not self.db_client:
            return {"error": "Database client not provided"}

        project = self.db_client.get_project_by_id(project_id)
        tasks = self.db_client.list_tasks(project_id=project_id)
        progress_records = self.db_client.list_task_progress(project_id=project_id)

        if not tasks:
            return {
                "project_id": project_id,
                "execution_health_score": 100.0,
                "health_class": "OPTIMAL",
                "summary": "No tasks initialized."
            }

        total_tasks = len(tasks)
        completed_tasks = sum(1 for t in tasks if t.get("status") == "COMPLETED")
        in_progress_tasks = sum(1 for t in tasks if t.get("status") == "IN_PROGRESS")
        blocked_tasks = sum(1 for t in tasks if t.get("status") == "BLOCKED")
        critical_tasks = [t for t in tasks if t.get("is_critical", 0) == 1]
        critical_count = len(critical_tasks)

        # 1. Variance Analysis
        total_planned_prog = sum(t.get("planned_progress", 0.0) for t in tasks) / total_tasks
        total_actual_prog = sum(t.get("actual_progress", 0.0) for t in tasks) / total_tasks
        progress_variance = round(total_planned_prog - total_actual_prog, 2)

        # Quantity Analysis
        total_target_qty = sum(t.get("target_quantity", 0.0) for t in tasks)
        total_completed_qty = sum(t.get("completed_quantity", 0.0) for t in tasks)
        qty_fulfillment_pct = round((total_completed_qty / total_target_qty * 100.0) if total_target_qty > 0 else 100.0, 1)

        # 2. Target Misses & Blocker Detection
        # 2. Target Misses & Blocker Detection
        target_misses = []
        for t in tasks:
            t_plan = t.get("planned_progress", 0.0)
            t_act = t.get("actual_progress", 0.0)
            t_stat = t.get("status")
            t_target = t.get("target_quantity", 0.0)
            t_comp = t.get("completed_quantity", 0.0)
            
            task_progs = [p for p in progress_records if p["task_id"] == t["task_id"]]
            has_blocker = any(p.get("blocker_flag") == 1 for p in task_progs)
            is_missed = (t_plan - t_act > 10.0) or t_stat == "BLOCKED" or has_blocker or (t_target > 0 and t_comp < t_target * 0.85 and t_stat != "COMPLETED")

            if is_missed:
                blocker_cat = "EQUIPMENT_BREAKDOWN"
                notes = "Slippage detected against baseline target schedule."
                for p in task_progs:
                    if p.get("blocker_category"):
                        blocker_cat = p["blocker_category"]
                        notes = p.get("notes", notes)
                        break

                target_misses.append({
                    "task_id": t["task_id"],
                    "title": t.get("title"),
                    "assigned_to": t.get("assigned_to"),
                    "target_quantity": t_target,
                    "completed_quantity": t_comp,
                    "unit": t.get("unit"),
                    "planned_progress": t_plan,
                    "actual_progress": t_act,
                    "progress_gap": round(max(0.0, t_plan - t_act), 1),
                    "is_critical": t.get("is_critical", 0),
                    "reason_category": blocker_cat if blocker_cat in CANONICAL_TARGET_MISS_REASONS else "EQUIPMENT_BREAKDOWN",
                    "explanation": notes
                })

        # 3. Stale Update Surveillance (>48 hours without telemetry)
        now_dt = datetime.utcnow()
        stale_threshold_hours = 48
        stale_tasks = []
        for t in tasks:
            if t.get("status") in ["IN_PROGRESS", "BLOCKED"]:
                task_progs = [p for p in progress_records if p["task_id"] == t["task_id"]]
                is_stale = False
                hours_since = 999
                if not task_progs:
                    is_stale = True
                else:
                    latest_date = task_progs[0].get("report_date", "2020-01-01")
                    try:
                        rep_dt = datetime.strptime(latest_date[:10], "%Y-%m-%d")
                        hours_since = (now_dt - rep_dt).total_seconds() / 3600.0
                        if hours_since > stale_threshold_hours:
                            is_stale = True
                    except Exception:
                        is_stale = True

                if is_stale:
                    stale_tasks.append({
                        "task_id": t["task_id"],
                        "title": t.get("title"),
                        "assigned_to": t.get("assigned_to"),
                        "hours_since_last_report": round(hours_since, 1)
                    })

        # 4. Execution Velocity
        # Actual progress velocity (pts / 30-day period)
        actual_velocity_pts_per_week = round((total_actual_prog / 24.0) * 7.0, 2)  # calibrated baseline
        required_velocity_pts_per_week = round(((100.0 - total_actual_prog) / 12.0), 2)
        velocity_gap = round(required_velocity_pts_per_week - actual_velocity_pts_per_week, 2)

        # 5. Composite Execution Health Score (0-100)
        # Factor 1: On-time task ratio (35 pts)
        on_time_ratio = (total_tasks - len(target_misses)) / total_tasks
        score_on_time = 35.0 * on_time_ratio

        # Factor 2: Quantity fulfillment (25 pts)
        score_qty = 25.0 * min(1.0, total_completed_qty / (total_target_qty * 0.7 if total_target_qty > 0 else 1.0))

        # Factor 3: Critical path penalty (25 pts max, deductions for critical slips)
        critical_misses = sum(1 for tm in target_misses if tm["is_critical"] == 1)
        critical_factor = max(0.0, 1.0 - (critical_misses * 0.35))
        score_critical = 25.0 * critical_factor

        # Factor 4: Freshness & Blocker penalty (15 pts max)
        blocker_penalty = (blocked_tasks * 3.0) + (len(stale_tasks) * 1.5)
        score_freshness = max(0.0, 15.0 - blocker_penalty)

        health_score = round(score_on_time + score_qty + score_critical + score_freshness, 1)
        health_score = max(5.0, min(100.0, health_score))

        if health_score >= 80.0:
            health_class = "HEALTHY"
        elif health_score >= 60.0:
            health_class = "MODERATE_RISK"
        elif health_score >= 40.0:
            health_class = "HIGH_CONCERN"
        else:
            health_class = "CRITICAL_SLIPPAGE"

        return {
            "project_id": project_id,
            "project_name": project.get("project_name", "") if project else "",
            "execution_health_score": health_score,
            "health_class": health_class,
            "variance": {
                "planned_progress_pct": round(total_planned_prog, 1),
                "actual_progress_pct": round(total_actual_prog, 1),
                "progress_variance_pct": progress_variance,
                "target_quantity_total": round(total_target_qty, 1),
                "completed_quantity_total": round(total_completed_qty, 1),
                "quantity_fulfillment_pct": qty_fulfillment_pct
            },
            "velocity": {
                "actual_run_rate_pct_per_week": actual_velocity_pts_per_week,
                "required_run_rate_pct_per_week": required_velocity_pts_per_week,
                "velocity_gap_pct": velocity_gap
            },
            "tasks_summary": {
                "total": total_tasks,
                "completed": completed_tasks,
                "in_progress": in_progress_tasks,
                "blocked": blocked_tasks,
                "critical": critical_count
            },
            "target_misses": target_misses,
            "target_misses_count": len(target_misses),
            "stale_tasks": stale_tasks,
            "stale_tasks_count": len(stale_tasks),
            "canonical_reason_categories": CANONICAL_TARGET_MISS_REASONS,
            "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        }
