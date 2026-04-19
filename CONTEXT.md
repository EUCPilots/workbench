# Project Context: Evergreen Workbench (web edition)

This document serves as the primary technical reference for the Evergreen Workbench repository. It is intended for both human developers and AI agents to understand the architecture, technology stack, and core functionality without requiring manual codebase exploration.

## Project Overview

Evergreen Workbench is a web-based dashboard designed to provide a single, searchable interface for exploring and monitoring End User Computing (EUC) pilot application versions. It provides a high-performance, "single pane of glass" experience that mirrors the functionality of the Evergreen desktop application.

## Tech Stack

- **Framework:** [Astro](https://astro.build/) (Static Site Generation with 'Islands' architecture).
- **UI Library:** [React](https://react.dev/) (Used for interactive components/islands).
- **Language:** TypeScript.
- **Build Tool:** [Vite](https://vitejs.dev/).
- **Icons:** [@fluentui/react-icons](https://developer.microsoft.com/en-us/fluentui#/styles/web/icons).
- **Styling:** CSS (utilizing Custom Properties for theme management and lightweight bar charts).

## Architecture & Data Flow

### The "Astro Islands" Model

The application uses a hybrid approach:

1.  **Static Shell:** Astro handles the routing, SEO, and the structural HTML shell.
2.  **Interactive Islands:** Specific parts of the page (like search, sidebar navigation, and dashboards) are hydrated with React components to provide complex state management and interactivity.

### Data Pipeline

The application does **not** use a runtime API. Instead, it relies on build-time data processing:

1.  **Source Data:** Application version information is stored in JSON files located in a sibling directory (external to this repository).
2.  **Build-Time Integration:** The file `src/pages/appdata.json.ts` runs during the Astro build process. It:
    - Globs all relevant `.json` files.
    - Executes `git log` commands against the local git history to extract the most recent commit timestamp for each file, creating a `lastUpdated` field.
3.  **Output:** The resulting processed data is bundled into a static `appdata.json` inside the `dist/` folder, which the React components then consume.

## Key Components

| Component | Path | Responsibility |
| :--- | :--- | :--- |
| **AppsPage** | `src/components/AppsPage.tsx` | The root SPA component; manages global state (active tab, selected app, favorites). |
| **AppsSidebar** | `src/components/AppsSidebar.tsx` | Navigation sidebar; handles pinned/favorite apps and displays "recent update" badges. |
| **AppDetails** | `src/components/AppDetails.tsx` | The main content view; renders version tables, dynamic columns, and PowerShell snippets. |
| **DashboardPage**| `src/components/DashboardPage.tsx`| Displays high-level statistics using CSS-driven bar charts (Architecture, File types). |
| **GlobalSearch** | `src/components/GlobalSearch.tsx` | A `Ctrl+K` overlay search tool; uses a React Portal to allow background blurring of the UI. |
| **ThemeToggle**  | `src/components/ThemeToggle.tsx` | Manages Light/Dark mode switching and persists preference via `localStorage`. |

## Key Features

- **Global Search (`Ctrl+K`):** High-performance search across all apps and version data with a blurred background effect.
- **Two-Panel UI:** A seamless split-view experience (Sidebar + Detail Panel) for efficient navigation.
- **Theme Support:** Integrated light/dark mode using the Evergreen brand palette.
- **Dynamic Versioning:** Real-time tracking of app updates via automated build pipelines.
- **Developer Utilities:** One-click "Copy URI" functionality and auto-generated PowerShell `Get-EvergreenApp` snippets.

## Deployment

The site is deployed to **GitHub Pages** using a GitHub Actions workflow (`.github/workflows/astro-gh-pages.yml`). The deployment process automatically builds the Astro site and uploads the static assets to the production environment.
