---
target: src/components/
total_score: 32.5
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 3
p1a_wcag_contrast: "CRITICAL"
p1b_aria_roles: "HIGH"
timestamp: 2026-08-18T23-22-06Z
slug: src-components
assessment_b_status: "complete"
assessment_b_deterministic_issues: 5
---
# Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3/4 | No loading indicators for async operations; search debounce is invisible |
| 2 | Match System / Real World | 3.5/4 | Language is technical but clear; missing: jargon glossary (Ring, Channel, Track, BundleType) |
| 3 | User Control and Freedom | 3.5/4 | Keyboard shortcuts dominate; missing: undo for filters/favorites, bulk actions |
| 4 | Consistency and Standards | 4/4 | Fluent UI components, focus rings, states consistent throughout; desktop/mobile breakpoint standard |
| 5 | Error Prevention | 2/4 | No confirm dialogs for destructive actions (favorite toggle, column visibility changes are instant) |
| 6 | Recognition Rather Than Recall | 3/4 | Sidebar shows all apps by default; missing: inline keystroke hints during workflow |
| 7 | Flexibility and Efficiency | 3.5/4 | Keyboard shortcuts powerful; missing: saved filter presets, multi-column sort, bulk operations |
| 8 | Aesthetic and Minimalist Design | 4/4 | Clean, flat interface; generous whitespace; no decorative clutter |
| 9 | Error Recovery | 2/4 | Copy-to-clipboard has toast; missing: undo for favorites, rollback for filters, error retry |
| 10 | Help and Documentation | 2.5/4 | Keyboard shortcut modal exists; missing: contextual help, tooltips, glossary for jargon, onboarding |
| **TOTAL** | | **32.5/40** | **81% — Above average for admin dashboards** |

## Design Specificity Verdict

The Workbench has clear functional specificity (PowerShell export, keyboard shortcuts, RSS feeds, "recent" filtering) but generic visual language (Fluent UI two-column layout, flat design, green + neutral palette). Visual identity is professional but interchangeable across admin tools.

**Design Specificity: 2.5/5** — Interaction model is authored; visual identity is stock.

## Overall Impression

Confident, purposeful tool that respects admin time. Keyboard-first design and PowerShell integration are thoughtful. **Critical gap:** WCAG contrast violations and missing ARIA roles block accessibility compliance. Incomplete at margins: no safety nets, minimal help, unpolished edge cases.

**Rating: 7.5/10** (functionally competent, but accessibility gaps require immediate attention before production ship)

**Accessibility Audit Verdict (Assessment B):**
- ✅ Keyboard navigation: comprehensive, works well
- ✅ Responsive design: solid across 4 breakpoints
- ⚠️ Color contrast: CRITICAL violations (light mode green text, dark mode green backgrounds)
- ⚠️ ARIA/semantic HTML: missing critical roles on list and dialog widgets
- ✅ Focus indicators: Fluent UI defaults work; one custom rule needs verification on dark mode

## What's Working

1. **Keyboard-First Accessibility** — `/`, `↑↓`, `f`, `Ctrl+K`, `?` are discoverable and powerful. Every action has a keyboard path.
2. **Data-First Two-Panel Layout** — Sidebar + detail panel is proven pattern (IDEs, email, Jira). Sidebar collapses on mobile.
3. **PowerShell Integration** — `Get-EvergreenApp`, RSS feeds, CSV export are workflow-native outputs.

## Priority Issues

### **[P0 — WCAG VIOLATION] Green Text Contrast Fails in Light Mode**
Heuristic #5 (Error Prevention) + Accessibility. Green text (#009485) on white/light gray fails WCAG AA (3.77 ratio; needs 4.5+). Affects links, filter tags, status indicators. Light gray on green in dark mode is critical (1.65 ratio).

**Assessment B deterministic finding:** 5 contrast failures detected across components.

**Fix:** 
- Light mode: Darken green to #006b62 for 4.5+ ratio, OR use green only as background with white text
- Dark mode: Lighten secondary text on green backgrounds to white (#ffffff) or light gray (#e8e8e8)
- Verify all text/background combos meet WCAG AA before ship

**Timeline:** Fix before Phase 1 completion (blocks accessibility compliance).

### **[P0] Missing Confirmation Dialogs**
Favorite toggles, column visibility changes are instant and non-recoverable. **Fix:** Add toast undo ("Pinned [app]. Undo?") and confirm modals for destructive UI changes.

### **[P1 — ACCESSIBILITY GAP] Missing ARIA Roles on Compound Widgets**
Assessment B deterministic finding: Missing `role="listbox"` on app list, `role="dialog"` on search overlay, HTML `<label>` elements on inputs. Screen reader users can't understand widget structure.

**Fix:**
- Wrap app list with `role="listbox"` and add `role="option"` (already present) to items
- Wrap GlobalSearch overlay with `role="dialog"` and `aria-modal="true"`
- Add `<label>` elements to all filter inputs (associate with `htmlFor`)
- Test with screen reader (NVDA/JAWS on Windows, VoiceOver on Mac)

### **[P1] Cognitive Load — 16+ Filters at Once**
Jargon (Ring, Track, Edition, LTS) without glossary causes paralysis. **Fix:** Group filters, add tooltips, smart defaults, searchable dropdowns.

### **[P1] "Recent" Badge and Filter are Decoupled**
Green badge at top of sidebar, threshold toggle at bottom. Connection invisible. **Fix:** Move toggle to top; show "last 48h" in header.

### **[P2] No Async Feedback**
Sorting, searching large datasets has no spinner. Users click twice thinking action failed. **Fix:** Add spinner (if render > 200ms), "Sorted by..." indicator.

### **[P2] Mobile Swipe Undiscoverable**
Sidebar swipe-to-close exists but has no affordance. First-timers feel trapped. **Fix:** Add drag handle, first-load hint "Swipe left to close."

### **[P3] Help Hidden Behind Modal**
Keyboard shortcuts only accessible via `?` key. New users land on Apps tab with no guidance. **Fix:** Add first-load inline hint, collapsible "Quick Start" card in sidebar.

## Persona Red Flags

**Alex (Power User):** No saved presets, single-column sort, no bulk ops, no search history in sidebar.

**Jordan (First-Timer):** Jargon without glossary, hidden "Recent" logic, no onboarding, cryptic error messages.

## Minor Observations

1. **Cascadia Code monospace in URI input** — Valid but undocumented in DESIGN.md. Update system fonts section to include monospace fallback (or remove font-family override).
2. RSS link unlabeled (younger admins won't recognize icon)
3. Column visibility toggle buried in table header
4. Empty state doesn't hint at `/` search
5. Focus rings work well on light mode; verify contrast on dark mode (Assessment A: "may blend")
6. Search debounce is silent (no "(searching...)" feedback)
7. Sidebar search clears on app select (risky on mobile)
8. No "Back to Top" for 550-item list
9. Copy toast duration inconsistent (1.5s vs 2.5s)
10. Sort indicator is subtle (↑ or ↓ text-only)
11. Dark mode green desaturated; increase saturation to #4db8ad (confirmed by detector)

## Questions to Consider

1. Is this a daily driver (invest in power features) or reference tool (invest in help)?
2. Primary user: junior tech (needs guardrails) or automation engineer (needs presets)?
3. Should filters persist across sessions to prevent mistakes?
4. Value of Dashboard tab—is it used?
5. Should sidebar and main panel sync when sorting/filtering?
