# PROJECTPULSE — Phase 9.5 UX & Technical Architecture Guide
## Ministry of Statistics & Programme Implementation (MoSPI) — IPMD / PAIMANA
### Smart India Hackathon 2026 — Problem Statement SIH26103 | Team HexaForce

---

## 1. Architectural Philosophy

ProjectPulse utilizes a modern, zero-dependency, native ECMAScript 6+ architecture that operates with 100% autonomy in both online cloud environments (Vercel / GitHub Pages) and secure offline government intranets (local Python FastAPI + SQLite).

```
+-------------------------------------------------------------------------+
|                      PROJECTPULSE FRONTEND ENGINE                       |
|                                                                         |
|  +--------------------+  +----------------------+  +-----------------+  |
|  |     AppShell.js    |  |       Router.js      |  |   CommonUI.js   |  |
|  | (Grouped Nav +     |  | (Hash-based Routing  |  | (Risk badges,   |  |
|  |  Command Palette)  |  |  & Query Param Sync) |  |  progress bars) |  |
|  +--------------------+  +----------------------+  +-----------------+  |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  |                       APIClient (api-client.js)                   |  |
|  |                                                                   |  |
|  |    +-----------------------------+   +-----------------------+    |  |
|  |    | Live Mode (FastAPI/SQLite)  |   | Offline Fallback Mode |    |  |
|  |    |  http://127.0.0.1:8000      |   |  mockData.js dataset  |    |  |
|  |    +-----------------------------+   +-----------------------+    |  |
|  +-------------------------------------------------------------------+  |
+-------------------------------------------------------------------------+
```

---

## 2. Key UX Architectural Innovations

### 2.1 Dual-Mode Gateway Pattern (`api-client.js`)
- On bootstrap, `APIClient.init()` sends a 2-second timeout probe to `/api/health`.
- If the live backend responds, all subsequent requests seamlessly hit the live SQLite database (10,000 projects) and LightGBM model.
- If deployed statically on Vercel without a live backend running locally, it gracefully transitions to offline mode, serving rich mock data with full client-side filtering, searching, and pagination.

### 2.2 Global Command Palette (`Ctrl+K` / `/`)
- Mounted once in `AppShell.js`, allowing instant hotkey activation anywhere in the application.
- Real-time client-side substring matching over all navigation views and featured megaproject IDs (`PRJ-DEMO-001`, `PRJ-DEMO-002`, etc.).
- Traps and handles `Escape` key cleanly without contaminating route state.

### 2.3 SVG-Based 2D Portfolio Matrix Plotting
- Renders an interactive 2D coordinate system natively in pure SVG (`<svg viewBox="0 0 1000 500">`), eliminating heavy chart library dependencies for custom scatter layouts.
- Projects are plotted on logarithmic X-axes (Capital Exposure in ₹ Cr) and linear Y-axes (Composite Risk Score 0-100).
- Quadrants are statically demarcated with clear color tints and dashed divider lines.
- Hover cards are positioned dynamically using `getBoundingClientRect()` with edge overflow protection.

### 2.4 Deep Link Query Parameter Synchronization
- When navigating from the Command Center or Bottleneck Observatory (e.g. `#/projects?bottleneck=land_acquisition&risk_tier=CRITICAL`), `ProjectsView` extracts parameters from `window.location.hash` and synchronizes the dropdowns and data queries automatically.

---

## 3. Accessibility & Performance Benchmarks

- **Screen Reader Support**: All interactive buttons, modals, and charts include `aria-label`, role tags, and hidden assistive labels (`.sr-only`).
- **Color Contrast**: All text elements strictly exceed WCAG 2.1 AA contrast requirements (minimum 4.5:1 ratio).
- **Zero Heavy Bundles**: No Webpack, Vite, or large framework overhead. The entire application loads in under 120ms with 0 compilation delay.
