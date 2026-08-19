---
name: Evergreen Workbench
description: Clean, modern admin dashboard for trusted application version tracking
colors:
  primary: "#00766f"
  primary-dark: "#006b63"
  primary-pressed: "#005d57"
  primary-light: "#d9f7f3"
  primary-dark-light: "#0d2926"
  neutral-bg-primary: "#ffffff"
  neutral-bg-secondary: "#fafafa"
  neutral-bg-tertiary: "#f0f0f0"
  neutral-bg-hover: "#f5f5f5"
  neutral-stroke: "#e0e0e0"
  neutral-fg-primary: "#242424"
  neutral-fg-secondary: "#424242"
  neutral-fg-tertiary: "#616161"
  neutral-fg-on-brand: "#ffffff"
  accent-rss: "#C55A11"
  accent-rss-bg: "#FDF0E8"
typography:
  base:
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif"
  mono:
    fontFamily: "'Cascadia Code', 'Menlo', Consolas, 'DejaVu Sans Mono', monospace"
  display:
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.2
  headline:
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.25
  body:
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.4
  label:
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  xs: "2px"
  sm: "4px"
  md: "6px"
  lg: "8px"
  circular: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
motion:
  fast: "150ms"
  normal: "200ms"
  slow: "400ms"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-fg-on-brand}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
  button-subtle:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
  input-base:
    backgroundColor: "{colors.neutral-bg-primary}"
    textColor: "{colors.neutral-fg-primary}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
---

# Design System: Evergreen Workbench

## Overview

**Creative North Star: "The Control Room"**

The Evergreen Workbench is a clean, modern admin dashboard designed for IT professionals who need to trust, find, and act on application version data quickly. The visual system prioritizes clarity and confidence: a neutral, minimal foundation that stays out of the way, paired with the Evergreen green as a vibrant, forward-facing signature color that commands attention for critical actions and brand presence. Every element is purposeful; nothing is decorative. The interface feels contemporary and professional—familiar enough for admins to navigate intuitively, distinctive enough to feel like a premium tool in their workflow.

**Key Characteristics:**
- **Neutral foundation** with high contrast for readability in both light and dark contexts
- **Vibrant green accent** used strategically on primary actions, navigation, and brand touchpoints
- **Generous whitespace and rhythm** that balances density with breathability
- **Accessible by default** with keyboard-first navigation and high contrast ratios
- **Flat, contemporary form language** with minimal shadows (used only for elevation on mobile)
- **Fluent UI component library** as the structural baseline, customized for Evergreen brand

## Colors

The palette divides into three roles: a vibrant signature green for brand and actions, a neutral grayscale for structure and text, and an accent orange-brown for RSS/feed indicators.

### Primary (Evergreen Green)

- **Evergreen Vibrant** (#00766f): The signature brand color. Used on primary buttons, active navigation states, hover effects, the top navigation bar background, and any element requiring maximum visual emphasis. Its vibrant character defines the brand presence and commands trust while preserving WCAG color contrast for text on light surfaces.
- **Evergreen Dark** (#006b63): Hover state for primary buttons and pressed navigation items. Slightly deeper, maintaining the forward-facing energy.
- **Evergreen Pressed** (#005d57): Pressed/active state for buttons and toggles. The deepest variant, establishing clear state feedback.
- **Evergreen Light** (#d9f7f3): Very light tint used as secondary background or badge fills. Provides visual hierarchy without competing with text.
- **Evergreen Dark Light** (#0d2926): The light-mode dark variant of the light tint. Used in dark theme backgrounds.

### Neutral

- **White Prime** (#ffffff): Primary background for light mode. Default surface for all content areas.
- **Cool Gray 50** (#fafafa): Secondary background in light mode. Used for sidebar, tab navigation, and subtle container differentiation.
- **Cool Gray 100** (#f0f0f0): Tertiary background or disabled states.
- **Cool Gray 150** (#f5f5f5): Hover state for neutral surfaces; subtle interactive feedback.
- **Cool Gray 300** (#e0e0e0): Border stroke color; dividers between sections and table cells.
- **Charcoal 900** (#242424): Primary text color in light mode. High contrast on white backgrounds.
- **Charcoal 700** (#424242): Secondary text; labels and helper copy.
- **Charcoal 600** (#616161): Tertiary text; disabled states and deemphasized copy.
- **White** (#ffffff): Text on brand. Used exclusively on green backgrounds for maximum contrast.

### Dark Mode Adaptations

All neutral backgrounds shift to dark grays with inverted contrast:
- Background 1 becomes #1f1f1f (near-black)
- Background 2 becomes #292929
- Foreground flips to white (#ffffff)
- Green slightly lightens to #4db8ad for readability on dark backgrounds
- All other rules scale proportionally to maintain contrast and hierarchy

### Named Rules

**The Green Discipline Rule.** The Evergreen green is a signature color—used on ≤15% of most screens. Its rarity and vibrance make primary actions unmistakable and brand presence immediate. Overuse dilutes impact; restraint earns recognition.

**The Neutral Majority Rule.** 80%+ of screens are neutral (white, gray, text). This restraint makes the green pop and keeps the interface professional and focused on content, not decoration.

## Typography

**Font Stack:** `'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif`

**Monospace / Fixed-Width Stack:** `'Cascadia Code', 'Menlo', Consolas, 'DejaVu Sans Mono', monospace`

Segoe UI is the system default on Windows and macOS; fallbacks ensure consistency across platforms. For code, URIs, command-like values, and other fixed-width content, use the monospace stack above, preferring `Cascadia Code` on Windows and `Menlo` on macOS. All type is sans-serif for clarity and contemporary feel, while monospace is reserved for technical values that benefit from aligned spacing.

**Character:** Direct, efficient, professional. No decorative serif; no playful flourishes. Type serves the content and the admin's task, not self-expression.

### Hierarchy

- **Display** (600 weight, 20px, 1.2 line-height): Hero headlines; title bar headings. Used sparingly.
- **Headline** (600 weight, 16px, 1.25 line-height): Section headers, modal titles, card titles. Clear visual breaks between sections.
- **Body** (400 weight, 14px, 1.4 line-height): Main content, table cells, descriptions. Optimized for on-screen reading. Typical max line length is ~70 characters for dense tables, unconstrained in prose contexts.
- **Label** (500 weight, 12px, 1.4 line-height): Form labels, badges, chips, filter toggles. Slightly heavier weight adds emphasis despite smaller size.

### Named Rules

**The 14px Body Rule.** Body text is always 14px in light mode, never smaller. Screen-based reading requires legibility; 12px body is reserved for labels and helper text only. This ensures comfortable reading at typical admin workstations.

**The 600 Weight Rule.** Bold/heavy text is always 600 (semibold), never 700 (bold). The extra weight difference is subtle but modern; 600 reads as confident without aggression.

## Layout

### Grid & Container

The Workbench uses a flexible, two-column layout: a 320px left sidebar (or 300px on mobile) containing app navigation and search, and a variable-width main content area. No strict grid is imposed; CSS flexbox and CSS Grid are used contextually.

### Spacing Rhythm

The spacing system follows a 4px base unit:

- **xs** (4px): Inline spacing within components, icon-to-text gaps
- **sm** (8px): Small gaps between related elements, internal padding on buttons and inputs
- **md** (12px): Standard spacing between sections, form field margins
- **lg** (16px): Major layout spacing, container padding, header/sidebar padding
- **xl** (20px): Large gaps between distinct sections, modal top/bottom margins

Example: `.app-header` uses `padding: 0 16px` (lg); `.app-list__item` uses `padding: 7px 12px 7px 16px` (mixed sm/md/lg); table cells use `padding: 12px 16px` (md/lg).

### Responsive Behavior

- **Desktop (>768px):** Two-column layout; sidebar 320px, main area flexible. Full navigation visible.
- **Tablet/Mobile (<768px):** Sidebar collapses into a fixed overlay (300px, full height, -100% off-screen). Toggle button in header reveals/hides it. Main area takes full width when sidebar is closed.
- **Tab Navigation:** Horizontal tab bar below header; scrollable on narrow screens. Tab text is single-line (no wrapping).

### Density

**Comfortable density with generous whitespace.** Cards, lists, and tables are neither cramped nor sparse. Row heights in tables are ~40px (12px padding top/bottom + text height); list items are ~44px. This balances information density with clickability and readability.

## Elevation & Depth

The Workbench is **flat by default**. Surfaces are layered tonally (backgrounds 1, 2, 3) rather than via shadow. Shadows are used only on mobile when the sidebar overlays the main content:

- **Mobile Sidebar Shadow:** `2px 0 12px rgba(0, 0, 0, 0.2)`. A soft, ambient shadow indicates the sidebar is floating above the page.

**No drop shadows on desktop elements.** Buttons, cards, and inputs rely on fill color, borders, and state changes (hover, focus, active) to communicate interactivity. This keeps the interface clean and modern.

### Color Layering (Tonal Depth)

- **Layer 1 (Primary Surface):** #ffffff (or #1f1f1f in dark mode). Main content area, modals, default state.
- **Layer 2 (Secondary Surface):** #fafafa (or #292929). Sidebar, tab bar, secondary containers. Clearly distinct from Layer 1 but not visually heavy.
- **Layer 3 (Tertiary Surface):** #f0f0f0 (or #333333). Disabled states, subtle dividers, inactive tabs.

This three-level tonal hierarchy replaces shadow-based depth, keeping the interface flat and contemporary.

## Shapes

### Border Radius

The radius system is intentionally minimal and modern:

- **xs** (2px): Very subtle; scrollbar corners, minimal visual impact.
- **sm** (4px): Buttons, inputs, chips, small interactive elements. The most common radius.
- **md** (6px): Cards, larger containers, search boxes.
- **lg** (8px): Modals, major containers, popovers.
- **circular** (9999px): Toggle buttons (to make them fully rounded), badges when appropriate.

**Named Rule: The Slight-Radius Rule.** Corners are never sharp (0px) and never aggressively rounded (16px+). 2–8px keeps the interface contemporary, sharp, and professional.

### Borders

Borders are minimal and always use the neutral stroke color (#e0e0e0 light, #383838 dark):

- **Table borders:** 1px solid between cells and rows. Separates data without overwhelming.
- **Input borders:** 1px solid, appears on focus or on interaction. No visible border at rest (flat style) or very light.
- **Card borders:** Optional; sidebar uses a right border (1px) to separate it from the main area.
- **Never use colored borders.** Borders are always neutral (stroke color); color is reserved for fills and text.

## Components

### Buttons

**Character:** Flat, direct, confident. Buttons are high-contrast and clickable at a glance.

- **Primary Button**
  - Background: Evergreen green (#009485)
  - Text: White (#ffffff)
  - Padding: 8px 12px (compact, Fluent standard)
  - Border-radius: 4px (sm)
  - Hover: Background darkens to #008575; slight visual lift (no shadow, just color shift)
  - Focus: 2px focus ring (typically browser default or Fluent-managed)
  - Active/Pressed: #016e61 (deepest green)
  - Transition: `background 0.15s ease` (fast motion token)

- **Subtle Button**
  - Background: Transparent or very light fill (#f5f5f5 on hover)
  - Text: Green (#009485)
  - Icon: Same color as text
  - Padding: 8px 12px
  - Border-radius: 4px
  - Hover: Light gray background (#f5f5f5) with green text
  - Use: Secondary actions, icon buttons in headers, toggle buttons for filters

- **Ghost / Tertiary Button**
  - Background: Transparent
  - Text: Neutral foreground (#424242 on white, #d6d6d6 on dark)
  - Border: Optional 1px stroke (gray)
  - Padding: 8px 12px
  - Hover: Very light background (#f5f5f5) or subtle color shift
  - Use: Less important actions, back buttons, cancel buttons

### Inputs & Search Boxes

- **Text Input / Search Box**
  - Background: White (#ffffff light, #292929 dark)
  - Text color: Neutral foreground 1
  - Border: 1px solid neutral stroke (#e0e0e0) on focus or interaction; subtle/invisible at rest
  - Border-radius: 4px
  - Padding: 8px 12px
  - Focus: 2px focus ring (green or browser default), border color brightens
  - Placeholder text: Neutral foreground 3 (#616161), italic or lighter weight for distinction
  - Icon (if present): Gray (#424242); turns green on focus

### Navigation

- **Tab Navigation (Horizontal)**
  - Background: Neutral background 2 (#fafafa)
  - Border: 1px bottom border (neutral stroke) separates tabs from content
  - Active Tab: Green (#009485) text + no underline or subtle green underline (2–3px thick)
  - Inactive Tab: Neutral foreground 2 text
  - Hover (inactive): Very light background or color shift to green
  - Padding: ~12px 16px per tab
  - Height: 44px total (tab bar)
  - Focus ring: Visible on keyboard navigation

- **Sidebar Navigation (Vertical List)**
  - Background: Neutral background 2
  - Item: `.app-list__item` class
  - Active Item: Green text or green left border (4px) + light green background (#d9f7f3)
  - Inactive Item: Neutral text
  - Hover: Light gray background (#f5f5f5) or very subtle gray
  - Padding: 7px 12px (custom; icon + text)
  - Keyboard shortcut: `↑↓` to navigate, `f` to favorite, `/` to focus search
  - Recent badge: Small green circle or indicator next to updated items

### Chips / Filter Toggles

- **Chip / Toggle Button (small, for Recent filters)**
  - Background: Transparent or neutral background 3
  - Text: Neutral foreground 1
  - Border: 1px stroke (neutral stroke)
  - Border-radius: 4px (small) or 6px (medium)
  - Padding: 4px 8px
  - Selected/Checked: Green background (#009485) + white text
  - Hover: Light gray background or green text
  - Transition: 0.15s ease

### Cards & Containers

- **Card / Panel**
  - Background: White (#ffffff light, #1f1f1f dark)
  - Border: None (relies on tonal layering and context)
  - Shadow: None on desktop; optional on mobile for floating panels
  - Padding: Typically 16px (lg)
  - Border-radius: 6px (md) for emphasis, or no radius for structured layouts
  - Dividers between cards: 1px neutral stroke

- **Details Panel (Main Content Area)**
  - Background: White
  - Padding: 16px
  - Title (header): 16px semibold, green text or neutral + green accent bar
  - Metadata (e.g., "Updated 3 weeks ago"): 12px neutral foreground 3
  - Actions (Copy, RSS, About link): Subtle buttons or inline links in green

- **Table**
  - Header row: Neutral background 2 (#fafafa) + bold 12px label text
  - Data rows: White (#ffffff), alternating rows (every even row uses #f5f5f5 for scannability)
  - Borders: 1px neutral stroke between cells and below header
  - Padding: 12px per cell
  - Row height: ~40px
  - Hover row: Subtle gray highlight (#f5f5f5)
  - Sorted column: Green text or green indicator (▲▼)

### Global Search Overlay

- **Trigger Button** (in header): Subtle button style (white text on green, 32px icon button or text+kbd trigger)
- **Overlay / Modal**
  - Background: White with 40% black backdrop over main content
  - Width: ~600px max, centered, or full width on mobile
  - Border-radius: 6px
  - Padding: 16px
  - Search input: Full width, 14px body text, 8px padding, no border (flat)
  - Results: List of apps + version fields; highlighted matches in green
  - Keyboard: Enter to select, ↑↓ to navigate, Escape to close

### Toggle / Checkbox

- **Toggle Button / Checkbox**
  - Background: Fluent UI default (typically light gray or white with border)
  - Checked state: Green fill (#009485) or green checkmark
  - Unchecked state: Light gray or white + border
  - Padding: 4px
  - Border-radius: 3–4px
  - Size: 16px × 16px typical
  - Hover: Subtle shade shift
  - Focus: 2px green focus ring

## Do's and Don'ts

### Do:

- **Do use the green (#009485) on primary actions only.** Button clicks, active navigation, brand presence. Every instance of green should feel intentional and important.
- **Do maintain high contrast.** Text on background must pass WCAG AA (4.5:1 for body text). Test in both light and dark mode.
- **Do use 14px body text.** Never go below 14px for on-screen reading, even on mobile. Labels and helpers can be 12px.
- **Do pair green with white.** Green text on white background, or white text on green background. Never green on gray or green on green.
- **Do make interactive elements obvious.** Button hover states must change (color, background, or subtle lift). Invisible states frustrate admins.
- **Do keep padding and spacing generous.** 8px minimum between unrelated elements. Admins need room to click accurately, especially on touch devices.
- **Do organize tables by density, not decoration.** Subtle alternating rows (white / light gray), light borders, align text left for easy scanning.
- **Do use keyboard shortcuts.** Every navigation and action must be accessible by keyboard. Shortcuts (/, f, ?) are listed and always discoverable.
- **Do respect dark mode.** All colors must invert intelligently. Test both themes equally; they're equally valid.
- **Do use motion conservatively.** 150ms–200ms transitions on hover/focus. No decorative animations. Motion is feedback, not flourish.

### Don't:

- **Don't use green as a neutral fill.** Backgrounds, containers, and cards are always white/gray, never tinted green.
- **Don't use drop shadows on desktop.** Flat, tonal layering only. Shadows are reserved for mobile overlays.
- **Don't mix rounded corners.** Use the radius scale (xs/sm/md/lg) consistently within a component family. Random radii look accidental.
- **Don't nest too many grays.** The palette is intentionally limited (3–4 distinct backgrounds). More grays muddy hierarchy.
- **Don't use color to convey information alone.** Status or importance must be supported by text labels or icons, not just color.
- **Don't override focus rings.** All interactive elements must have a visible keyboard focus indicator. Don't hide it for aesthetics.
- **Don't use decorative typefaces or serifs.** Segoe UI only. No Georgia, no custom fonts. Professional, familiar, efficient.
- **Don't add unnecessary icons.** Icons clarify action, not decorate. Every icon should be immediately clear; if users need a label anyway, the icon didn't help.
- **Don't use animations for state changes in tables.** Sorting, filtering, and column swaps should be instant. Animation here feels slow and defensive.
- **Don't let content overflow containers.** Truncate long text with ellipsis (...) or wrap thoughtfully. Overflow breaks the layout's integrity.
