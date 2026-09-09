"""
ProjectPulse — Demonstration Project & Seed Manager
Seeds PRJ-DEMO-001 (NH-44 Strategic Corridor Development Project) into SQLite
"""
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent.parent / "data" / "projectpulse.db"

def seed_demo_project():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM projects WHERE project_id = ?", ("PRJ-DEMO-001",))
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
            INSERT INTO projects (
                project_id, project_name, ministry, department, sector, sub_sector,
                state, region, implementing_agency, project_type, project_status, project_stage,
                original_cost_cr, revised_cost_cr, cost_overrun_cr, cost_growth_pct,
                cumulative_expenditure_cr, physical_progress_pct, financial_progress_pct,
                progress_decoupling_gap, start_date, planned_completion_date, revised_completion_date,
                planned_duration_months, revised_duration_months, schedule_slippage_months,
                schedule_revisions_count, milestone_count, milestones_completed, milestones_delayed,
                milestones_at_risk, milestone_delay_rate, primary_bottleneck, secondary_bottleneck,
                target_schedule_delay_months, target_cost_overrun_pct, target_risk_class,
                overall_risk_score, data_source, data_status
            ) VALUES (
                'PRJ-DEMO-001', 'NH-44 Strategic Corridor Development Project',
                'Ministry of Road Transport and Highways', 'National Highways Division',
                'Roads & Highways', 'Expressways & Corridors', 'Telangana / Andhra Pradesh', 'South',
                'National Highways Authority of India (NHAI)', 'Capacity Augmentation / 6-Laning',
                'CRITICAL', 'Execution', 1250.0, 1840.5, 590.5, 47.24, 1472.4, 42.5, 80.0, 37.5,
                '2022-09-01', '2025-06-01', '2027-02-01', 33, 53, 20, 2, 8, 4, 4, 2, 0.5,
                'LAND_ACQUISITION', 'ENVIRONMENTAL', 20, 47.24, 'CRITICAL', 78.5,
                'MoSPI PAIMANA Demonstration Standard', 'SYNTHETIC'
            )
        """)
        ms = [
            ('MS-DEMO-01', 'PRJ-DEMO-001', 'Detailed Project Report & Feasibility', 1, '2022-12-01', '2022-12-01', 'Completed', 0, 'None'),
            ('MS-DEMO-02', 'PRJ-DEMO-001', 'Environmental & Coastal Clearances', 2, '2023-04-01', '2023-04-15', 'Completed', 15, 'State EAC'),
            ('MS-DEMO-03', 'PRJ-DEMO-001', 'EPC Tender Award & Concessionaire Mobilization', 3, '2023-08-01', '2023-08-30', 'Completed', 30, 'Procurement'),
            ('MS-DEMO-04', 'PRJ-DEMO-001', 'Subgrade Earthwork & Embankment Section A', 4, '2024-01-01', '2024-01-01', 'Completed', 0, 'ROW Clearance'),
            ('MS-DEMO-05', 'PRJ-DEMO-001', 'Major Bridge Substructure (Krishna River Basin)', 5, '2024-06-01', None, 'Delayed', 110, 'High Monsoonal Flood Level'),
            ('MS-DEMO-06', 'PRJ-DEMO-001', 'Forest Land ROW Handover (PKG-3 Forest Section)', 6, '2024-09-01', None, 'Delayed', 145, 'MoEFCC Clearance'),
            ('MS-DEMO-07', 'PRJ-DEMO-001', 'Four-Lane Elevated Viaduct Superstructure', 7, '2024-12-01', None, 'Delayed', 95, 'Steel Girder Logistics'),
            ('MS-DEMO-08', 'PRJ-DEMO-001', 'Pavement Quality Concrete (PQC) Paving', 8, '2025-03-01', None, 'Delayed', 80, 'Continuous Subgrade Handover')
        ]
        cursor.executemany("""
            INSERT INTO project_milestones (milestone_id, project_id, milestone_name, sequence, planned_date, actual_date, status, delay_days, dependency_type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, ms)
        cursor.execute("""
            INSERT OR IGNORE INTO alerts (alert_id, project_id, project_name, severity, signal, detected_at, risk_change, status)
            VALUES ('ALT-DEMO-001', 'PRJ-DEMO-001', 'NH-44 Strategic Corridor Development Project', 'CRITICAL', 'Severe Decoupling Gap: Expenditure leads Physical completion by 37.5 percentage points with 4 delayed critical-path milestones', '2026-03-31', '+14.5 pts', 'OPEN')
        """)
        conn.commit()
        print("Seeded PRJ-DEMO-001 successfully!")
    else:
        print("PRJ-DEMO-001 already exists in database")
    conn.close()

if __name__ == "__main__":
    seed_demo_project()
