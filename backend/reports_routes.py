"""
ASTRA — Report Intelligence & PAIMANA Flash Report Endpoints (Phase 12)
Ministry of Statistics & Programme Implementation (MoSPI) • IPMD
Smart India Hackathon 2026 — Team HexaForce

Provides scoped REST APIs reproducing Flash Report structure:
- Snapshot management (April, May, June, July 2026)
- Report Overview (PAIMANA Monitoring vs ASTRA Intelligence)
- Sector, Ministry, State, HML 2022, and NER Intelligence
- Major vs Mega Classification
- Tables 1 through 6 (Ministry, State, Completed, Newly Added, NER, All Ongoing)
- Month-over-Month Temporal Comparison
- Headline Feature: "PAIMANA Snapshot -> ASTRA Forecast"
- Data Quality Observatory (DQ001 to DQ012)
- Multi-Model Benchmarks (CUF vs Enhanced & Statistical vs ML)
- Report Export (CSV & Print-ready HTML)
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Depends, Response
from fastapi.responses import HTMLResponse, PlainTextResponse

from database.db_client import DatabaseClient
from backend.auth import get_current_user_from_header

router = APIRouter(prefix="/api/reports", tags=["Report Intelligence"])
db_client = DatabaseClient()

@router.get("/snapshots")
def list_snapshots():
    """Returns available monthly snapshot periods with aggregate metadata."""
    try:
        return {"snapshots": db_client.get_available_snapshots()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch snapshots: {str(e)}")

@router.get("/overview")
def get_report_overview(snapshot_month: str = Query("2026-07", description="Snapshot period (YYYY-MM)")):
    """Returns executive Flash Report overview distinguishing PAIMANA monitoring from ASTRA intelligence."""
    try:
        return db_client.get_snapshot_overview(snapshot_month=snapshot_month)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate report overview: {str(e)}")

@router.get("/sectors")
def get_report_sectors(snapshot_month: str = Query("2026-07", description="Snapshot period (YYYY-MM)")):
    """Returns Sectoral Comparison data matching Flash Report Section II/III."""
    try:
        return {"snapshot_month": snapshot_month, "sectors": db_client.get_snapshot_sectors(snapshot_month=snapshot_month)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch sector analysis: {str(e)}")

@router.get("/ministries")
def get_report_ministries(snapshot_month: str = Query("2026-07", description="Snapshot period (YYYY-MM)")):
    """Returns Major Central Ministries Comparison matching Flash Report Section IV."""
    try:
        return {"snapshot_month": snapshot_month, "ministries": db_client.get_snapshot_ministries(snapshot_month=snapshot_month)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch ministry analysis: {str(e)}")

@router.get("/states")
def get_report_states(snapshot_month: str = Query("2026-07", description="Snapshot period (YYYY-MM)")):
    """Returns State-wise distribution data for spatial scatter and table analytics."""
    try:
        return {"snapshot_month": snapshot_month, "states": db_client.get_snapshot_states(snapshot_month=snapshot_month)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch state analysis: {str(e)}")

@router.get("/hml")
def get_report_hml(snapshot_month: str = Query("2026-07", description="Snapshot period (YYYY-MM)")):
    """Returns Harmonized Master List (HML) 2022 infrastructure categories analysis."""
    try:
        return {"snapshot_month": snapshot_month, "categories": db_client.get_snapshot_hml(snapshot_month=snapshot_month)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch HML analysis: {str(e)}")

@router.get("/ner")
def get_report_ner(snapshot_month: str = Query("2026-07", description="Snapshot period (YYYY-MM)")):
    """Returns North Eastern Region (NER) dedicated monitoring and risk intelligence."""
    try:
        return db_client.get_snapshot_ner(snapshot_month=snapshot_month)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch NER intelligence: {str(e)}")

@router.get("/major-mega")
def get_report_major_mega(snapshot_month: str = Query("2026-07", description="Snapshot period (YYYY-MM)")):
    """Returns Mega (>= ₹1000 Cr) vs Major (< ₹1000 Cr) breakdown and Mega Project Risk Radar."""
    try:
        return db_client.get_snapshot_major_mega(snapshot_month=snapshot_month)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch major/mega breakdown: {str(e)}")

@router.get("/tables/ministry-wise")
def get_table_ministry_wise(snapshot_month: str = Query("2026-07", description="Snapshot period")):
    """Reproduces Flash Report Table 1: Ministry-wise Ongoing Projects."""
    try:
        return {
            "snapshot_month": snapshot_month,
            "table_number": 1,
            "table_title": "Ministry-wise Ongoing Projects",
            "records": db_client.get_table_ministry_wise(snapshot_month=snapshot_month)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch Table 1: {str(e)}")

@router.get("/tables/state-wise")
def get_table_state_wise(snapshot_month: str = Query("2026-07", description="Snapshot period")):
    """Reproduces Flash Report Table 2: State-wise Ongoing Projects."""
    try:
        return {
            "snapshot_month": snapshot_month,
            "table_number": 2,
            "table_title": "State-wise Ongoing Projects",
            "records": db_client.get_table_state_wise(snapshot_month=snapshot_month)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch Table 2: {str(e)}")

@router.get("/tables/completed")
def get_table_completed(snapshot_month: str = Query("2026-07", description="Snapshot period")):
    """Reproduces Flash Report Table 3: Completed Projects."""
    try:
        data = db_client.get_table_completed(snapshot_month=snapshot_month)
        data["table_number"] = 3
        data["table_title"] = "Completed Projects in Reporting Period"
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch Table 3: {str(e)}")

@router.get("/tables/newly-added")
def get_table_newly_added(snapshot_month: str = Query("2026-07", description="Snapshot period")):
    """Reproduces Flash Report Table 4: Newly Added Projects."""
    try:
        data = db_client.get_table_newly_added(snapshot_month=snapshot_month)
        data["table_number"] = 4
        data["table_title"] = "Newly Added Projects in Reporting Period"
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch Table 4: {str(e)}")

@router.get("/tables/ner-projects")
def get_table_ner_projects(snapshot_month: str = Query("2026-07", description="Snapshot period")):
    """Reproduces Flash Report Table 5: Ongoing Projects of North Eastern Region."""
    try:
        return {
            "snapshot_month": snapshot_month,
            "table_number": 5,
            "table_title": "Ongoing Projects of North Eastern Region",
            "records": db_client.get_table_ner_projects(snapshot_month=snapshot_month)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch Table 5: {str(e)}")

@router.get("/tables/all-ongoing")
def get_table_all_ongoing(
    snapshot_month: str = Query("2026-07", description="Snapshot period"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Page size"),
    search: str = Query("", description="Keyword search across IDs, names, codes, agencies"),
    ministry: str = Query("", description="Filter by Ministry"),
    sector: str = Query("", description="Filter by Sector"),
    state: str = Query("", description="Filter by State"),
    risk_level: str = Query("", description="Filter by Risk Level"),
    hml_category: str = Query("", description="Filter by HML Category"),
    classification: str = Query("", description="Filter by MAJOR or MEGA"),
    sort_by: str = Query("overall_risk_score", description="Sort attribute"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$", description="Sort order")
):
    """
    Reproduces Flash Report Table 6: All Ongoing Projects.
    Supports switching between PAIMANA View, ASTRA View, and Full Intelligence View.
    """
    try:
        data = db_client.get_table_all_ongoing(
            snapshot_month=snapshot_month,
            page=page,
            page_size=page_size,
            search=search,
            ministry=ministry,
            sector=sector,
            state=state,
            risk_level=risk_level,
            hml_category=hml_category,
            classification=classification,
            sort_by=sort_by,
            sort_order=sort_order
        )
        data["table_number"] = 6
        data["table_title"] = "All Ongoing Projects"
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch Table 6: {str(e)}")

@router.get("/compare")
def compare_snapshots(
    snapshot_a: str = Query("2026-04", description="Baseline snapshot"),
    snapshot_b: str = Query("2026-07", description="Comparison snapshot")
):
    """Calculates month-over-month differences between any two historical snapshots."""
    try:
        return db_client.get_snapshot_comparison(snapshot_a=snapshot_a, snapshot_b=snapshot_b)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Snapshot comparison failed: {str(e)}")

@router.get("/forecast/{project_id}")
def get_project_forecast_journey(
    project_id: str,
    snapshot_month: str = Query("2026-07", description="Reference snapshot")
):
    """
    Headline Feature: "PAIMANA Snapshot -> ASTRA Forecast"
    Traces a project from official observation to AI risk detection, TreeSHAP drivers,
    consequence projection, and simulated recovery.
    """
    try:
        journey = db_client.get_project_forecast_journey(project_id=project_id, snapshot_month=snapshot_month)
        if not journey:
            raise HTTPException(status_code=404, detail=f"Project {project_id} not found in snapshots.")
        return journey
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate forecast journey: {str(e)}")

@router.get("/data-quality")
def get_data_quality_observatory(
    snapshot_month: str = Query("2026-07", description="Snapshot period")
):
    """Returns Data Quality Observatory metrics and flagged items (DQ001 to DQ012)."""
    try:
        return db_client.get_data_quality_report(snapshot_month=snapshot_month)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate data quality report: {str(e)}")

@router.get("/models/comparison")
def get_models_comparison():
    """Returns empirical benchmarks comparing CUF vs Enhanced models and Statistical vs ML."""
    try:
        return db_client.get_model_benchmarks()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve model benchmarks: {str(e)}")

@router.get("/export")
def export_report(
    snapshot_month: str = Query("2026-07", description="Snapshot period"),
    format: str = Query("csv", pattern="^(csv|json|html)$", description="Export format")
):
    """Exports structured analytical report in CSV or print-ready HTML format."""
    try:
        ov = db_client.get_snapshot_overview(snapshot_month=snapshot_month)
        p = ov["paimana_monitoring"]
        a = ov["astra_intelligence"]

        if format == "json":
            return ov

        if format == "csv":
            csv_lines = [
                "Metric Category,Metric Name,Value,Unit/Note",
                f"PAIMANA Monitoring,Tracked Projects,{p['tracked_projects']},Count",
                f"PAIMANA Monitoring,Ongoing Projects,{p['ongoing_projects']},Count",
                f"PAIMANA Monitoring,Commissioned Projects,{p['commissioned_projects']},Count",
                f"PAIMANA Monitoring,Newly Added Projects,{p['newly_added_projects']},Count",
                f"PAIMANA Monitoring,Original Cost,{p['original_cost_cr']},₹ Crore",
                f"PAIMANA Monitoring,Latest Revised Cost,{p['revised_cost_cr']},₹ Crore",
                f"PAIMANA Monitoring,Cumulative Expenditure,{p['cumulative_expenditure_cr']},₹ Crore",
                f"PAIMANA Monitoring,Cost Growth Pct,{p['cost_growth_pct']},%",
                f"PAIMANA Monitoring,Average Physical Progress,{p['avg_physical_progress_pct']},%",
                f"ASTRA Intelligence,High Risk Projects,{a['high_risk_projects']},Count",
                f"ASTRA Intelligence,Critical Projects,{a['critical_projects']},Count",
                f"ASTRA Intelligence,Schedule Pressure Projects,{a['schedule_pressure_projects']},Count",
                f"ASTRA Intelligence,Cost Escalation Projects,{a['cost_escalation_projects']},Count",
                f"ASTRA Intelligence,Analytical Capital at Risk,{a['capital_at_risk_cr']},₹ Crore",
                f"ASTRA Intelligence,Data Quality Flags,{a['data_quality_flags_count']},Count"
            ]
            return PlainTextResponse(
                "\n".join(csv_lines),
                media_type="text/csv",
                headers={"Content-Disposition": f"attachment; filename=ASTRA_Report_{snapshot_month}.csv"}
            )

        # Print-ready official HTML report format
        html_content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>ASTRA Infrastructure Intelligence Report — {snapshot_month}</title>
  <style>
    body {{ font-family: 'Inter', -apple-system, sans-serif; color: #0f172a; margin: 40px; background: #fff; }}
    .header {{ border-bottom: 3px double #1e40af; padding-bottom: 16px; margin-bottom: 24px; }}
    .title {{ font-size: 24px; font-weight: bold; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.5px; }}
    .subtitle {{ font-size: 13px; color: #475569; margin-top: 4px; }}
    .badge {{ display: inline-block; padding: 4px 10px; background: #f1f5f9; border: 1px solid #cbd5e1; font-size: 11px; font-weight: 600; border-radius: 4px; margin-top: 8px; }}
    .kpi-grid {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 30px; }}
    .kpi-card {{ border: 1px solid #e2e8f0; padding: 14px; border-radius: 6px; background: #f8fafc; }}
    .kpi-label {{ font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; }}
    .kpi-value {{ font-size: 20px; font-weight: bold; color: #0f172a; margin-top: 4px; }}
    .kpi-sub {{ font-size: 11px; color: #94a3b8; margin-top: 2px; }}
    .section-title {{ font-size: 16px; font-weight: bold; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-top: 30px; margin-bottom: 14px; }}
    .footnote {{ margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 11px; color: #64748b; line-height: 1.6; }}
  </style>
</head>
<body>
  <div class="header">
    <div class="title">ASTRA — National Infrastructure Intelligence Report</div>
    <div class="subtitle">Ministry of Statistics & Programme Implementation (MoSPI) • IPMD / PAIMANA Baseline</div>
    <div class="badge">Reference Snapshot: {snapshot_month} • Source: {ov['source_report']}</div>
  </div>

  <div class="section-title">I. PAIMANA Official Monitoring Overview</div>
  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-label">Ongoing Projects</div>
      <div class="kpi-value">{p['ongoing_projects']}</div>
      <div class="kpi-sub">Central Sector (₹150 Cr+)</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Original Cost</div>
      <div class="kpi-value">{p['original_cost_formatted']}</div>
      <div class="kpi-sub">Sanctioned Baseline</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Latest Revised Cost</div>
      <div class="kpi-value">{p['revised_cost_formatted']}</div>
      <div class="kpi-sub">Growth: +{p['cost_growth_pct']}%</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Cumulative Expenditure</div>
      <div class="kpi-value">{p['cumulative_expenditure_formatted']}</div>
      <div class="kpi-sub">{p['expenditure_to_revised_ratio_pct']}% of Revised</div>
    </div>
  </div>

  <div class="section-title">II. ASTRA Predictive & Decision Intelligence</div>
  <div class="kpi-grid">
    <div class="kpi-card" style="border-left: 4px solid #ef4444;">
      <div class="kpi-label">High-Risk Projects</div>
      <div class="kpi-value" style="color: #b91c1c;">{a['high_risk_projects']}</div>
      <div class="kpi-sub">Critical: {a['critical_projects']}</div>
    </div>
    <div class="kpi-card" style="border-left: 4px solid #f59e0b;">
      <div class="kpi-label">Schedule Pressure</div>
      <div class="kpi-value" style="color: #b45309;">{a['schedule_pressure_projects']}</div>
      <div class="kpi-sub">Elevated slippage probability</div>
    </div>
    <div class="kpi-card" style="border-left: 4px solid #6366f1;">
      <div class="kpi-label">Capital at Risk</div>
      <div class="kpi-value" style="color: #4338ca;">{a['capital_at_risk_formatted']}</div>
      <div class="kpi-sub">Risk-weighted exposure</div>
    </div>
    <div class="kpi-card" style="border-left: 4px solid #0284c7;">
      <div class="kpi-label">Data Quality Flags</div>
      <div class="kpi-value" style="color: #0369a1;">{a['data_quality_flags_count']}</div>
      <div class="kpi-sub">Human review required</div>
    </div>
  </div>

  <div class="footnote">
    <strong>Official Sovereign Data & Governance Notice:</strong><br>
    1. Descriptive metrics are strictly derived from the PAIMANA Flash Report reference snapshot ({snapshot_month}).<br>
    2. ASTRA predictive risk scores and early warning lead times are algorithmic analytical projections generated via LightGBM models trained on historical data.<br>
    3. Reported cumulative expenditure is based on the last reporting by ministries/departments and may not represent final project completion cost.<br>
    4. Capital at Risk represents analytical risk-weighted exposure (Revised Cost × Normalized Risk) and does not imply actual confirmed financial loss.
  </div>
</body>
</html>"""
        return HTMLResponse(content=html_content)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export generation failed: {str(e)}")
