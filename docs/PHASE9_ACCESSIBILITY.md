# PROJECTPULSE — PHASE 9 ACCESSIBILITY (A11Y) COMPLIANCE SPECIFICATION
**Ministry of Statistics & Programme Implementation (MoSPI) • IPMD**  
**Smart India Hackathon 2026 — Team HexaForce (Problem Statement SIH26103)**  

---

## 1. Compliance Baseline: WCAG 2.1 Level AA

In alignment with the **Guidelines for Indian Government Websites (GIGW)** and international accessibility standards, ProjectPulse conforms to **WCAG 2.1 Level AA** criteria.

---

## 2. Key Accessibility Implementations

### 2.1 Color Contrast & Color-Blind Safety
- **Text Contrast**: All body text (Slate-900 `#0f172a` and Slate-700 `#334155`) exceeds a **7:1 contrast ratio** against the white background (exceeding the 4.5:1 minimum).
- **Secondary Caption Contrast**: `#64748b` (Slate-500) provides a **4.8:1 contrast ratio** on white surfaces.
- **Redundant Encoding**: Information is NEVER conveyed by color alone. Every risk indicator combines:
  1. Semantic Color (e.g. Red for Critical)
  2. Text Label (e.g. `CRITICAL`)
  3. Priority Code (e.g. `P1`)
  4. Numerical Metric (e.g. `Score: 84 / 100`)

### 2.2 Keyboard Navigation & Focus Management
- **Full Tab Traversal**: All interactive controls (navigation links, filter buttons, search input, table pagination, scenario sliders, triage buttons) are reachable via standard `Tab` / `Shift+Tab`.
- **Visible Focus Rings**: Active focus states feature a prominent 2px focus ring (`ring-2 ring-blue-600 ring-offset-1`).
- **Modal Dismissal**: Pressing the `Escape` key immediately closes the Demo Role Switcher modal and the mobile drawer.

### 2.3 Semantic HTML & ARIA Attributes
- **Landmark Regions**: Semantic `<header>`, `<nav>`, `<aside>`, `<main>`, and `<footer>` tags define document structure.
- **Data Tables**: `<table>` elements feature explicit `<thead>`, `<tbody>`, and descriptive `<th>` scope tags.
- **Dynamic Live Regions**: Toast notifications and alert state mutations announce updates to assistive technologies using `aria-live="polite"`.
- **Screen Reader Buttons**: Icon-only buttons (such as the notification bell and search refresh) carry descriptive `title` and `aria-label` attributes.

### 2.4 Motion & Visual Sensitivity
- **Reduced Motion**: Respects the user's operating system preferences via CSS `@media (prefers-reduced-motion: reduce)`, disabling all sliding animations and pulses.
