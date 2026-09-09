# Document Intelligence & Natural Language Extraction Engine
## Semantic Entity Parsing of DPRs, EPC Agreements, and Geotechnical Logs

**Ministry of Statistics & Programme Implementation (MoSPI)**  
*ProjectPulse Infrastructure Risk Intelligence & Execution Platform*

---

## 1. Document Extraction Architecture (`src/execution/plan_engine.py`)

Project documents are parsed through a multi-stage semantic pipeline:

```
[ Raw Document Ingestion: PDF / Text ]
                   │
                   ▼
  [ Document Classification & Layout Analysis ]
                   │
                   ▼
  [ Regex & Named Entity Recognition (NER) ]
    • Alignment chainage regex: (?:km|chainage)\s*(\d+\+?\d*)
    • Structural entity matcher: (?:bridge|viaduct|pier|culvert)\s*([A-Z0-9\-]+)
    • BOQ quantity extractor: (\d+(?:,\d+)*(?:\.\d+)?)\s*(cum|sqm|tonnes|meters|wells)
                   │
                   ▼
  [ Contract Clause & Penalty Threshold Parser ]
                   │
                   ▼
  [ Confidence Scoring & Provenance Attribution ]
```

---

## 2. Extraction Schema & Benchmark Entities

For the anchor demonstration project `PRJ-SYN-000002`:
- **Document Title**: *Detailed Project Report — PKG-3 Ganga River Bridge & Viaduct Corridor*
- **Alignment Length**: 42.5 km (6-lane access-controlled expressway).
- **Major Structures**:
  - 1 Major Ganga River Viaduct (1.2 km length).
  - 18 Deep Well Foundations (12m outer diameter, M35 grade concrete, 28.5m depth).
  - 36 Substructure Piers & Abutment Caps.
  - 24 Precast Segmental Box Girder Spans (50m span each).
- **Extracted Quantities**:
  - Earthwork Excavation & Compaction: 680,000 cum.
  - Granular Sub-Base (GSB): 120,000 sqm.
  - Dense Bituminous Macadam (DBM): 245,000 sqm.
- **Contractual Baseline**: Sanctioned Outlay ₹1,420.5 Cr; Appointed Duration 36 Months.
