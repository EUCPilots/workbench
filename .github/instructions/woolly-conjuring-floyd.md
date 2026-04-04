# Plan: Fluent 2 Theming Alignment

## Context
The Evergreen Workbench currently uses a custom teal-tinted design system (Inter font, teal-grey neutrals, mixed border radii, ad-hoc transition durations). The goal is to align all visual styling to Microsoft's Fluent 2 design language — updating color neutrals to true Fluent 2 grays, typography to Segoe UI, button/table/nav dimensions to Fluent 2 component specs, border radii to the Fluent 2 ramp, and motion durations to 150ms — while preserving the Evergreen brand accent (`#009485`) and all existing class names (no React component changes needed).

## Critical Files
- `src/styles/global.css` — all styling (~2194 lines, single file)
- `src/layouts/Layout.astro` — Google Fonts link to remove

## What Is NOT Changing
- All class names (`.btn-primary`, `.version-table`, `.sidebar-nav__item`, etc.)
- No React/TSX component files modified
- `#009485` brand accent preserved as `--color-brand-background`
- Cascadia Code monospace font (already appropriate for Fluent 2)
- `@keyframes` animations, PWA/manifest/JS files

---

## Step 1 — Remove Google Fonts (Layout.astro)
Remove the 3 Inter Google Fonts `<link>` tags. Segoe UI is a system font; no replacement link needed.

---

## Step 2 — Replace `:root` Token Block

Switch to a **two-layer token system**:
- **Primitive tokens** (`--f2-*`) hold raw Fluent 2 values, never used directly in components
- **Semantic alias tokens** map primitives to role names, replacing all current tokens

### Fluent 2 Neutral Ramp Primitives (light)
| Token | Value |
|---|---|
| `--f2-white` | `#ffffff` |
| `--f2-grey2` | `#fafafa` |
| `--f2-grey4` | `#f5f5f5` |
| `--f2-grey6` | `#ebebeb` |
| `--f2-grey8` | `#e0e0e0` |
| `--f2-grey10` | `#d1d1d1` |
| `--f2-neutral-fg1` | `#242424` |
| `--f2-neutral-fg2` | `#424242` |
| `--f2-neutral-fg3` | `#616161` |
| `--f2-brand` | `#009485` |
| `--f2-brand-dark` | `#01786c` |
| `--f2-brand-tint10` | `#D9F2EF` |
| `--f2-success-fg` | `#107c10` |
| `--f2-error-fg` | `#c50f1f` |

### Dark Ramp Primitives
| Token | Value |
|---|---|
| `--f2-dark-bg1` | `#1f1f1f` |
| `--f2-dark-bg2` | `#292929` |
| `--f2-dark-bg3` | `#333333` |
| `--f2-dark-bg4` | `#3d3d3d` |
| `--f2-dark-stroke1` | `#424242` |
| `--f2-dark-stroke2` | `#383838` |
| `--f2-dark-fg1` | `#ffffff` |
| `--f2-dark-fg2` | `#d6d6d6` |
| `--f2-dark-fg3` | `#adadad` |
| `--f2-dark-brand` | `#4db8ad` |
| `--f2-dark-brand-hover` | `#67cac0` |
| `--f2-dark-brand-tint` | `#0d2926` |
| `--f2-dark-success-fg` | `#54b454` |
| `--f2-dark-error-fg` | `#f1707b` |

### New Semantic Tokens (replacing current tokens + fixing undefined ones)

**Typography:**
```css
--font-family-base: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif;
--font-size-100: 10px  --font-size-200: 12px  --font-size-300: 14px  --font-size-400: 16px
--font-weight-regular: 400  --font-weight-semibold: 600  --font-weight-bold: 700
--line-height-300: 20px
```

**Spacing:** `--space-xs: 4px`, `--space-s: 8px`, `--space-m: 12px`, `--space-l: 16px`, `--space-xl: 20px`

**Border Radius:** `--radius-small: 2px`, `--radius-medium: 4px`, `--radius-large: 6px`, `--radius-xlarge: 8px`, `--radius-circular: 9999px`

**Motion:**
```css
--duration-fast: 150ms  --duration-normal: 200ms  --duration-slower: 400ms
--easing-ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1)
--easing-ease-in-out: cubic-bezier(0.45, 0, 0.55, 1)
```

**Color semantic tokens → role aliases:**
- `--color-neutral-background-1..5` → `--f2-white` through `--f2-grey8`
- `--color-neutral-stroke-1..2` → `--f2-grey10`, `--f2-grey8`
- `--color-neutral-foreground-1..4` → `--f2-neutral-fg1..4`
- `--color-brand-background` → `--f2-brand` (preserves #009485)

**Role aliases (map existing token names → new semantic tokens so component CSS needs minimal edits):**
```css
--accent → --color-brand-background
--text-primary → --color-neutral-foreground-1
--text-secondary → --color-neutral-foreground-2
--text-muted → --color-neutral-foreground-3
--sidebar-bg → --color-neutral-background-3
--sidebar-border → --color-neutral-stroke-2
--table-header-bg → --color-neutral-background-2
--status-positive → --color-status-success-foreground (#107c10)
--status-error → --color-status-error-foreground (#c50f1f)
```
Also **define currently-undefined tokens**: `--bg-secondary`, `--border`, `--sidebar-hover`, `--text`, `--status-warning`.

---

## Step 3 — Replace `[data-theme="dark"]` Block
Same two-layer structure using `--f2-dark-*` primitives. Key dark-mode differences:
- `--header-bg` → `--color-neutral-background-4` (`#3d3d3d`) — neutral surface instead of teal-tinted
- `--header-text` → `--color-neutral-foreground-1` (`#ffffff`)
- `--sidebar-bg` → `--color-neutral-background-2`
- `--btn-outline-bg` → `--color-neutral-background-3` (slightly elevated vs light)
- `--table-header-bg` → `--color-neutral-background-3`

---

## Step 4 — Base Styles
- `font-family` → `var(--font-family-base)` (Segoe UI-first)
- `line-height: 1.5` → `var(--line-height-300)` (20px)
- Theme transition: `background 0.2s, color 0.2s` → use `var(--duration-normal)`

---

## Step 5 — Sidebar Nav (lines ~311–339)
- Active indicator: `border-left: 3px` → `border-left: 2px` (Fluent 2 Nav uses 2px)
- Active font weight: `500` → `var(--font-weight-semibold)` (600)
- Transition: `0.1s` → `var(--duration-fast)`

---

## Step 6 — App List Items (lines ~394–483)
- Active font weight: `500` → `var(--font-weight-semibold)`
- All transitions: `0.1s` → `var(--duration-fast)`

---

## Step 7 — Buttons (lines ~790–819) ⚠️ Most visible change
Fluent 2 buttons are height-based (32px medium), semibold labels, primary has no border ring:

```css
/* .btn base */
display: inline-flex; align-items: center; justify-content: center;
min-height: 32px;
padding: 0 var(--space-m);           /* was: 5px 12px */
border-radius: var(--radius-medium);
font-size: var(--font-size-300);     /* 14px, was 13px */
font-weight: var(--font-weight-semibold);  /* was not set */
transition: background var(--duration-fast), border-color var(--duration-fast);

/* .btn-primary */
border: 1px solid transparent;      /* was: border matches bg — Fluent 2 has no visible border */

/* Add .btn--small utility */
min-height: 24px; padding: 0 var(--space-s); font-size: var(--font-size-200);
```

Also update `.btn-refresh-list` to use `min-height: 32px` and spacing tokens.

---

## Step 8 — Version Table / DataGrid (lines ~824–963)
Fluent 2 DataGrid uses 14px body text, 44px row height, non-uppercase headers:

```css
.version-table { font-size: var(--font-size-300); }   /* 14px, was 13px */
.version-table th {
  padding: 0 var(--space-m); height: 44px;
  font-size: var(--font-size-300);  /* was 12px */
  font-weight: var(--font-weight-semibold);
}
.th-sort-btn {
  text-transform: none;   /* remove uppercase — not Fluent 2 */
  letter-spacing: 0;
}
.version-table td { padding: 0 var(--space-m); height: 44px; }
.table-wrapper { border-radius: var(--radius-large); }
```

---

## Step 9 — Filter Section, Inputs, Modals
- Filter section: `border-radius: 6px` → `var(--radius-large)`
- Inputs: `border-radius: 4px` → `var(--radius-medium)`, transitions → `var(--duration-fast)`
- Modal dialogs: `border-radius: 10px` → `var(--radius-xlarge)` (8px)
- Dashboard cards: `border-radius: 8px` → `var(--radius-xlarge)` (token-driven, same value)

---

## Step 10 — Global Transition Audit
Replace all hardcoded durations throughout the file:

| Current | New token | Used for |
|---|---|---|
| `0.1s`, `0.12s`, `0.15s` | `var(--duration-fast)` (150ms) | Hover states, inputs, buttons |
| `0.2s` | `var(--duration-normal)` (200ms) | Sidebar open/close, theme switch |
| `0.4s` | `var(--duration-slower)` (400ms) | Bar chart fill animation |

---

## Step 11 — Font Weight 500 Elimination
Audit all `font-weight: 500` — change to `600` (semibold) for active labels, selected states, and headings; `400` (regular) for metadata/secondary values. Key instances: sidebar nav active, app list active, empty state title, stat card labels.

---

## Step 12 — Typography Label Cleanup
All `11px` uppercase section labels (apps-panel count, filter group labels, search history headers) → `var(--font-size-200)` (12px), retain uppercase where semantically a section header.

---

## Step 13 — Minor Cleanup
- Inline SVG chevron in `th-search-select`: change fill from `%239AADAA` (teal-grey) to `%239e9e9e` (true neutral)
- Remove redundant `[data-theme="dark"] .search-highlight` override (tokens cascade correctly now)
- Add `--status-warning` alias to `:root` (currently used but undefined)
- Normalize `3px` → `var(--radius-small)` and `5px` → `var(--radius-medium)` across micro-UI elements

---

## Implementation Order
1. Layout.astro — remove Google Fonts
2. `:root` + `[data-theme="dark"]` blocks together (atomic token foundation)
3. Base font/line-height
4. Sidebar nav + app list
5. Buttons
6. Table
7. Filter section + inputs + modals
8. Global transition audit + weight/label cleanup

---

## Verification
1. `npm run dev` — visual inspection of light and dark themes
2. Check header, sidebar, app list, buttons, version table, filter section, search modal, shortcuts modal
3. Check dark mode via theme toggle — neutrals should be true grays, not teal-tinted
4. Verify no console errors (no missing CSS variable warnings)
5. `npm run build` — ensure static build completes without error
