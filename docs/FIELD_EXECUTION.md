# Field Execution & Ground Telemetry Protocols
## Mobile-Responsive Workstation, Geo-Tagging & 9 Canonical Stoppage Categories

**Ministry of Statistics & Programme Implementation (MoSPI)**  
*ProjectPulse Infrastructure Risk Intelligence & Execution Platform*

---

## 1. Field Operations Workstation (`#/field`)
The field interface is optimized for high-contrast mobile operation under harsh outdoor conditions:
- **Today's Targets Cards**: Displays assigned daily quantities with quick steppers (`+0.5`, `+1.0`).
- **Geo-Stamp Verification**: Simulates GPS coordinate capture ensuring physical presence on the corridor chainage.
- **Offline-First Resilience**: In offline conditions, telemetry submissions are staged in local browser storage and automatically synced upon network re-establishment.

---

## 2. The 9 MoSPI Canonical Stoppage Categories

When work halts on a site, field supervisors must categorize the stoppage according to MoSPI IPMD standards:

1. **`EQUIPMENT_BREAKDOWN`**: Heavy machinery, reverse circulation drill rigs, or launching gantries non-operational.
2. **`LABOR_SHORTAGE`**: Gang demobilization due to festival outflow, agricultural sowing season, or wage disputes.
3. **`MATERIAL_UNAVAILABLE`**: Supply halts in cement (PPC/OPC), high-tensile steel strands, bitumen, or aggregates.
4. **`WEATHER_STOPPAGE`**: River flooding, heavy monsoon runoff, extreme heat wave, or unworkable water table levels.
5. **`PERMIT_DELAY`**: Stage-II forest clearance delay, tree felling permissions, or railway safety commissioner hold-ups.
6. **`DESIGN_REVISION`**: Structural engineering redesign triggered by unanticipated geotechnical subsoil strata.
7. **`RIGHT_OF_WAY_BLOCKED`**: Encroachment, compensation court stay orders, or village access resistance.
8. **`PAYMENT_DISPUTE`**: Interim Payment Certificate (IPC) disbursement delays between concessionaire and subcontractors.
9. **`QUALITY_REJECTION`**: Test failures on concrete cube compressive strength, core compaction, or asphalt gradation.

Submitting any stoppage on a zero-float task immediately triggers automated Critical Path downstream delay propagation and alerts the Project Director.
