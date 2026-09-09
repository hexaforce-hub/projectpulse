# 🏛️ PROJECTPULSE — Design System Specification
**Product:** ProjectPulse — Infrastructure Project Risk Intelligence  
**Sponsor Organization:** Ministry of Statistics & Programme Implementation (MoSPI)  
**Division:** Infrastructure and Project Monitoring Division (IPMD)  
**Ecosystem:** PAIMANA (*Project Assessment, Infrastructure Monitoring and Analytics for Nation-Building*)  
**Standard:** Institutional Government Digital Interface (WCAG 2.1 AA Compliant)

---

## 1. Design Philosophy
ProjectPulse is designed to communicate **Trust, Precision, Accountability, and National Scale**. It purposefully avoids decorative startup/crypto tropes (no glowing neon, no oversized card radiuses, no excessive glassmorphism, no non-functional 3D) in favor of dense, calm, authoritative government data comprehension.

---

## 2. Color Tokens

### 2.1 Surfaces & Neutrals
| Token | Hex Value | Usage |
| :--- | :--- | :--- |
| `--bg-app` | `#f8fafc` (Slate 50) | Calm neutral canvas background |
| `--surface` | `#ffffff` | Primary card and table background |
| `--surface-secondary`| `#f1f5f9` (Slate 100) | Subtle section fills, table headers, progress tracks |
| `--border` | `#e2e8f0` (Slate 200) | Standard 1px card and container border |
| `--border-subtle` | `#edf2f7` | Table row dividing borders |
| `--border-strong` | `#cbd5e1` (Slate 300) | Input borders, focused states |

### 2.2 Typography Colors
| Token | Hex Value | Contrast Ratio |
| :--- | :--- | :--- |
| `--text-primary` | `#0f172a` (Slate 900) | 16.2:1 (High contrast on white) |
| `--text-secondary`| `#334155` (Slate 700) | 9.4:1 (Secondary descriptions) |
| `--text-muted` | `#64748b` (Slate 500) | 4.8:1 (Captions, timestamps, metadata) |
| `--text-disabled` | `#94a3b8` (Slate 400) | Inactive and disabled states |

### 2.3 Institutional Brand Accent
| Token | Hex Value | Usage |
| :--- | :--- | :--- |
| `--brand` | `#1e40af` (Blue 800) | Authoritative MoSPI primary blue |
| `--brand-hover` | `#1d4ed8` (Blue 700) | Button hover & active interaction |
| `--brand-soft` | `#eff6ff` (Blue 50) | Tinted badges, active nav link fill |
| `--brand-border` | `#bfdbfe` (Blue 200) | Brand element outlines |

### 2.4 Risk States (Strict Government Tiers)
| Risk Level | Score Range | Text / Pill Color | Background Tint | Border |
| :--- | :--- | :--- | :--- | :--- |
| **LOW** | 0 – 24 | `#15803d` (Green 700) | `#f0fdf4` | `#bbf7d0` |
| **MODERATE**| 25 – 49 | `#b45309` (Amber 700) | `#fffbeb` | `#fde68a` |
| **HIGH** | 50 – 74 | `#c2410c` (Orange 700) | `#fff7ed` | `#fed7aa` |
| **CRITICAL**| 75 – 100 | `#b91c1c` (Red 700) | `#fef2f2` | `#fecaca` |

*Principle:* Strong risk colors are strictly isolated to risk indicators, badges, and warning callouts. The entire page never turns red.

---

## 3. Typography Hierarchy

*   **Primary Typeface:** `Inter`, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif.
*   **Monospace Typeface:** `JetBrains Mono`, monospace (used for Project IDs, numeric codes).
*   **Tabular Numerals:** All financial figures, percentages, and milestone dates enforce `font-variant-numeric: tabular-nums` to eliminate column jitter.

| Element | Font Size | Weight | Line Height |
| :--- | :--- | :--- | :--- |
| Application Title | 24–28px | 700 (Bold) | 1.25 |
| Page Title | 24px | 700 (Bold) | 1.25 |
| Section Title | 18px | 650 (SemiBold)| 1.30 |
| Card Title | 14px | 600 (SemiBold)| 1.40 |
| Body Text | 14px | 400 (Regular) | 1.50 |
| Secondary Body | 13px | 400 (Regular) | 1.50 |
| Caption / Metadata | 11–12px | 500 (Medium) | 1.40 |

---

## 4. Spacing Scale & Layout Grid

*   **Spacing Units:** 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px.
*   **Grid System:** 12-column desktop grid, max-width 1440px centered.
*   **Page Padding:**
    *   Desktop (1024px+): 32px padding, 24px section gaps.
    *   Tablet (768px - 1023px): 24px padding.
    *   Mobile (<768px): 16px padding.
*   **Card Internal Padding:** 20px desktop, 16px mobile.
*   **Card Radius:** 10–12px (`--radius-lg`). Pills: 9999px (`--radius-pill`).

---

## 5. Reusable Component Rules

1.  **KPI Cards:** Equal visual height (min 132px), title aligned, value bold tabular, line-icon container (36-40px).
2.  **Risk Badges:** Height 28px, rounded-pill, 1px border, includes level text + numerical score (e.g. `HIGH 82/100`).
3.  **Tables:**
    *   Desktop: Clean 1px borders, subtle row divider, hover background `#f8fafc`.
    *   Headers: 44px height, uppercase 12px font, text-slate-700.
    *   Numeric alignment: Tabular numbers for financial and progress metrics.
    *   Mobile: Horizontal scroll wrapper with sticky project identification column.
4.  **Buttons:**
    *   Primary: 40px height, 8px radius, blue-800 background, white text.
    *   Secondary: 40px height, 8px radius, white background, slate-200 border, slate-800 text.
    *   Small: 32px height for table row actions (`Inspect`).
5.  **Data Status Component:** Persistent pill (`DEMO DATA` / `SYNTHETIC`) placed on top header and project details.

---

## 6. Accessibility & WCAG Compliance

*   **Keyboard Navigation:** All buttons and interactive rows support Tab navigation with visible 2px focus ring (`outline: 2px solid var(--brand)`).
*   **Screen Readers:** Hidden `.sr-only` labels provided for search inputs, select filters, and icon-only controls.
*   **Color Independence:** Risk levels are never communicated by color alone; text label (LOW, MODERATE, HIGH, CRITICAL) and numeric score accompany every badge.
