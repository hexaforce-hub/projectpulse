# Project Onboarding & Document Understanding Specification
## 4-Step Project Ingestion & Document-to-WBS Synthesis

**Ministry of Statistics & Programme Implementation (MoSPI)**  
*ProjectPulse Infrastructure Risk Intelligence & Execution Platform*

---

## 1. Overview
Project onboarding in public sector infrastructure historically requires months of manual data entry, mapping tender Bill of Quantities (BOQ) into proprietary enterprise software. ProjectPulse introduces an automated 4-step onboarding pipeline that ingests standard PDFs (DPRs, Concession Agreements, Geotechnical Survey logs) and transforms them into an actionable, verified execution baseline.

---

## 2. The 4-Step Onboarding Architecture

```
[ Step 1: Administrative Metadata ]
   • Project Title, Central Ministry, Agency (NHAI/RVNL)
   • Geographical Bounds (State, District, Coordinates)
   • Financial Sanction (Original Outlay in ₹ Cr)
   • Schedule Appointed Date & Statutory Target
                   │
                   ▼
[ Step 2: Document Understanding & BOQ NLP ]
   • PDF Ingestion: DPR Vol 1, Concession Agreement Schedule B/H, Geotechnical Borehole Logs
   • NLP Semantic Tokenizer extracts BOQ line items, quantities, units, and corridor specifications
   • Confidence scoring on extracted entity attributes
                   │
                   ▼
[ Step 3: AI Work Breakdown Structure (WBS) Synthesis ]
   • Decomposes project into 12 Level-1 Work Packages (WBS 1.1 to 1.12)
   • Generates 54 execution-level Tasks with Finish-to-Start dependency constraints
   • Transparent source attribution: DOCUMENT_EXTRACTED vs. AI_INFERRED
                   │
                   ▼
[ Step 4: Baseline Ratification Gate ]
   • Project Director / Chief Engineer review & verification
   • Cryptographic timestamping and immutable baseline ledger entry
   • Activates real-time field telemetry ingestion & CPM scheduler
```

---

## 3. Semantic Document Extraction Specifications

### 3.1 Supported Document Types
1. **Detailed Project Reports (DPR)**: Extracts alignment length, carriage lanes, major/minor bridges, culvert frequencies, and structural engineering designs.
2. **EPC Concession Agreements (Schedule B/H)**: Extracts contract milestones, penalty trigger thresholds, and statutory delivery deadlines.
3. **Geotechnical Borehole Logs**: Extracts subsoil stratigraphy (e.g., standard penetration test $N$-values, rock strata depths, groundwater table).
4. **Statutory Sanction Orders**: Extracts Stage-I/II forest clearance conditions, wildlife corridors, and environmental compliance requisites.

### 3.2 Attribution Taxonomy
Every generated task explicitly records its provenance:
- `DOCUMENT_EXTRACTED`: Parameter derived directly from tender schedules or contract clauses (e.g. 18 deep wells of 12m diameter as specified in DPR Clause 4.2).
- `AI_INFERRED`: Operational sub-task synthesized by the model to satisfy engineering construction sequencing standards (IRC / IS codes) between extracted milestones.

---

## 4. API Endpoints

### `POST /api/projects`
Onboards administrative metadata into `projects` registry:
```json
{
  "project_name": "Varanasi-Ranchi-Kolkata Expressway PKG-3",
  "ministry": "Ministry of Road Transport & Highways",
  "implementing_agency": "NHAI",
  "state": "Uttar Pradesh",
  "district": "Varanasi",
  "original_cost_inr_cr": 1420.5,
  "start_date": "2026-04-01",
  "target_completion_date": "2029-03-31"
}
```

### `POST /api/projects/{id}/documents`
Attaches technical documents with metadata and triggers background vector indexing.

### `POST /api/projects/{id}/execution/analyze`
Extracts BOQ line items and corridor specifications.

### `POST /api/projects/{id}/execution/plan/approve`
Official human sign-off approving the baseline execution plan.
