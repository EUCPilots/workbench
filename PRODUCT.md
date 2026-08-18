# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary users:** IT administrators and operations teams managing Windows applications for physical PCs and virtual desktops in enterprise End-User Computing (EUC) environments. Secondary audience: anyone tracking application versions and compatibility across their infrastructure.

**Situation:** Admins need to find, understand, and act on application version information across 550+ apps in their environment. They must verify update availability, check architecture/OS compatibility, and generate deployment commands.

**Job:** Quickly search and reference trusted application version data to make informed deployment decisions.

## Product Purpose

Evergreen Workbench provides a single, searchable interface for exploring application version data tracked by the Evergreen PowerShell module. It makes trusted version information accessible and actionable without context-switching to spreadsheets or generic catalogs.

## Positioning

Evergreen Workbench is distinct because it is backed by the Evergreen PowerShell module, which retrieves application updates only from authentic vendor sources. This source-of-truth approach ensures data can be trusted for infrastructure decisions—unlike generic app catalogs or community-sourced version tracking.

## Operating Context

- **Workflow:** Admins use the workbench during deployment planning, update cycles, and compatibility audits across physical and virtual desktop environments.
- **Environment:** Enterprise Windows infrastructure (PCs, VDAs, hybrid deployments).
- **Data scale:** 550+ applications with real-time update tracking via CI pipeline.
- **Access pattern:** Direct web access via GitHub Pages; offline PWA installation supported.

## Capabilities and Constraints

**Confirmed features:**
- Search and filter across 550+ applications by name and version data
- Version history with sortable, filterable columns (architecture, file type, date)
- Copy version URI for scripting and reference
- Auto-generated `Get-EvergreenApp` PowerShell snippets for deployment
- Light/dark theme with Evergreen brand palette
- Hash-based routing for shareable app links
- Favorites and recent updates tracking (localStorage persisted)
- Keyboard navigation and shortcuts (`/`, `↑↓`, `f`, `?`, `Ctrl+K`, `Escape`)
- PWA with auto-update service worker
- Static build-time data compilation (no runtime API)

**Technical constraints:**
- Data sourced from external JSON files (sparse-cloned from aaronparker/apptracker)
- Builds require `json/` directory populated at build time
- Deployed to GitHub Pages with `/workbench/` base path

## Brand Commitments

- **Name:** Evergreen Workbench (web edition)
- **Visual identity:** Evergreen brand palette with green theme color (`#009485` for PWA manifest and UI)
- **Voice:** Technical, direct, trustworthy—reflects the precision of Evergreen's vendor-source data
- **Association:** Evergreen PowerShell module and vendor-authentic data sources

## Evidence on Hand

- **Architecture:** Astro static-generation with React islands, Vite build, TypeScript
- **Component library:** Fluent UI React components and icons
- **Styling:** CSS custom properties for theming (no Tailwind, no CSS-in-JS)
- **Deployment:** GitHub Pages workflow with daily runs and manual trigger; Cloudflare cache purge
- **PWA support:** Service worker with auto-update; installable on desktop/mobile
- **Existing components:** AppsPage, AppsSidebar, AppDetails, DashboardPage, GlobalSearch, ThemeToggle
- **Live reference:** https://eucpilots.com/workbench/

## Product Principles

1. **Trust through source:** Data sourced from authentic vendor APIs via Evergreen ensures every version is verifiable—admins can deploy with confidence.
2. **Keyboard-first efficiency:** Admins work fast; every critical action must be one keystroke away; search, navigation, and shortcuts are non-negotiable.
3. **Single pane of glass:** One interface for browsing, filtering, and referencing 550+ apps reduces context-switching and decision friction.
4. **Transparent infrastructure:** Export-ready output (copy URI, PowerShell snippets) makes the workbench a tool in the workflow, not a reference-only display.
5. **Inclusive by default:** Accessibility and theme support (light/dark, high contrast) ensure admins in any environment can use the tool effectively.

## Accessibility & Inclusion

- Keyboard navigation is critical for admin workflows; all features must be accessible without mouse
- Theme support (light/dark) and sufficient color contrast required
- WCAG 2.1 AA compliance assumed as baseline for enterprise software
- PowerShell snippet generation must work for screen readers and copy-paste workflows
