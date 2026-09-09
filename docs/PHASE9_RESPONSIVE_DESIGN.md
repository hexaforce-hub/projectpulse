# PROJECTPULSE — PHASE 9 RESPONSIVE DESIGN SPECIFICATION
**Ministry of Statistics & Programme Implementation (MoSPI) • IPMD**  
**Smart India Hackathon 2026 — Team HexaForce (Problem Statement SIH26103)**  

---

## 1. Breakpoint Grid Architecture

ProjectPulse is engineered with full responsive adaptability across diverse screen geometries, from executive command center video walls down to field officer smartphones.

| Breakpoint Tier | Screen Width | Target Device Class | Primary Layout Behavior |
|---|---|---|---|
| **Ultra-Wide / Desktop** | `>= 1440px` | 4K Command Walls, 27" Executive Monitors | Fixed 260px sidebar, multi-column cards, full table data density. |
| **Laptop / Desktop** | `1024px - 1439px` | Office Workstations, Laptops (13"-16") | Persistent sidebar, 4-column KPI grid, standard table widths. |
| **Tablet / Surface** | `768px - 1023px` | iPad Pro, Galaxy Tab, Surface Tablets | Collapsed sidebar icons, 2-column KPI grid, horizontally scrollable tables. |
| **Mobile Handheld** | `< 768px` | iPhone 14/15, Pixel 8, Android Handhelds | Off-canvas sliding drawer (`#mobile-drawer`), stacked cards, sticky triage buttons. |

---

## 2. Adaptive Navigation Patterns

### 2.1 Desktop & Laptop Viewports (`>= 768px`)
- **Left Rail Navigation**: Persistent vertical sidebar (`w-64` / 256px width) with MoSPI IPMD branding, active route highlight chips, and live early warning alert counts.
- **Top Utility Header**: Breadcrumbs navigation (`Home / Projects / PRJ-DEMO-001`), persistent synthetic data badge, live backend connection pulse indicator, notification bell, and user avatar.

### 2.2 Mobile Viewports (`< 768px`)
- **Hamburger Trigger**: Top header features a dedicated hamburger toggle (`#btn-mobile-menu-open`).
- **Off-Canvas Drawer**: Smooth CSS transform transition (`-translate-x-full` to `translate-x-0`) with dark backdrop overlay (`#mobile-drawer-backdrop`).
- **Auto-Dismiss**: Any route click automatically closes the mobile drawer and navigates to the selected screen.

---

## 3. Data Tables & High-Density Visualizations

### 3.1 Responsive Table Containers
All data tables (`ProjectsView`, `EarlyWarningsView`, `AnalyticsView`, `SettingsView`) are wrapped inside `.gov-table-container` with:
- `overflow-x: auto` with webkit-momentum scrolling.
- Fixed minimal column widths ensuring critical data (Project Name, Severity, Primary Driver) remains readable without awkward text wrapping.
- Sticky action columns on mobile allowing instant access to the "Inspect" or "Triage" buttons.

### 3.2 What-If Scenario Simulator Drawer
- **Desktop**: Renders as a dedicated side-by-side comparison pane alongside TreeSHAP waterfall attributions.
- **Mobile / Tablet**: Renders full-width stacked sliders with clear percentage readouts and touch-friendly thumb hitboxes (44px minimum touch target).
