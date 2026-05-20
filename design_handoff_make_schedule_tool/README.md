# Handoff: MAKE Project Schedule Tool — v4

## Overview

This is a full-featured Gantt-style project scheduling tool built for MAKE Projects. It tracks tasks, phases, milestones, responsible parties, dependencies, baselines, and variance across any construction or project management workflow.

The tool is currently a single-file HTML prototype. The task is to **reimplement it as a production Vite + TypeScript + React 18 application**, preserving every interaction, animation, and design detail documented here.

---

## About the Design Files

The HTML files in this bundle are **high-fidelity design references** — fully interactive prototypes built in plain HTML/CSS/React-via-Babel. They are **not production code to ship directly**. Your task is to recreate these designs in a proper Vite + TypeScript project structure, extracting and organising the logic into well-typed modules, components, and hooks.

The prototypes demonstrate exact intended behaviour. When in doubt about an interaction, open the HTML file in a browser and test it directly.

**Reference files included:**
- `MAKE Scheduling Tool v4.html` — the current interactive prototype (source of truth for all behaviour)
- `MAKE Handoff v4 FINAL.html` — the comprehensive design specification document (read this first)

---

## Fidelity

**High-fidelity.** The prototype uses the final colour palette, typography, spacing, animation curves, and interaction model. Recreate pixel-perfectly. Exact hex values, spacing tokens, and keyframe params are all documented in the handoff spec.

---

## Tech Stack

| Concern | Choice |
|---|---|
| Bundler | Vite |
| Language | TypeScript (strict) |
| UI | React 18 (`tsx` throughout) |
| State | `useState` + `useCallback` + `useMemo` — no external state library |
| Styling | CSS custom properties (design tokens) + component-scoped CSS modules or a single global stylesheet |
| Fonts | Plus Jakarta Sans 400/500/600 · Space Mono 400/700 (Google Fonts) |
| Persistence | `localStorage`, key `schedule-tool-v1`, JSON |
| Gantt | Custom — absolutely positioned `div` bars. **Do not use a chart library.** |
| Dark mode | `prefers-color-scheme: dark` only — no manual toggle |

---

## Project Structure (recommended)

```
src/
  components/
    App.tsx               ← root; owns all state
    gantt/
      Gantt.tsx
      GanttHeader.tsx
      GanttGrid.tsx
      GanttBar.tsx
      DependencyArrows.tsx
      BaselineGhostBars.tsx
      GhostStyleToggle.tsx  ← inline in Gantt, not a separate component
    task-list/
      TaskList.tsx
      StatusBadge.tsx
    panels/
      SidePanel.tsx
      ActualDatesSection.tsx
    modals/
      LinkBuilderModal.tsx
      WorkweekModal.tsx
      GroupsManager.tsx
      PartiesManager.tsx
      CsvImportDialog.tsx
      PrintPreviewModal.tsx
    overlays/
      SetupWizard.tsx
      UndoToast.tsx
      BaselineMenu.tsx
    topbar/
      TopBar.tsx
      EditableTitle.tsx
    filter/
      FilterBar.tsx
    mobile/
      MobileTabSwitcher.tsx
  hooks/
    useKeyboard.ts         ← N / ↑↓ / Space / Enter / Ctrl+Z / Escape
    useScrollSync.ts       ← list ↔ gantt vertical sync
    useMidnightTicker.ts   ← updates todayDate at midnight
    useOnboarding.ts       ← onboardingPhase state machine
  lib/
    dates.ts               ← toD, fmtDate, prettyDate, shortDate, addDays, daysBetween, durationDays
    progress.ts            ← computeAutoProgress, refreshAutoProgress, enrichTask
    cpm.ts                 ← computeCriticalPath (Kahn + forward/backward pass)
    csv.ts                 ← parseCSVText, generateCSV, normalizeDate, triggerCSVImport
    storage.ts             ← loadState, saveState, STORAGE_KEY
    timeline.ts            ← buildTimeline, getTiersForDayPx, ZOOM_LEVELS
    workdays.ts            ← workdayRatio, workdays
  types/
    index.ts               ← all TypeScript interfaces (see §State Shape in handoff spec)
  styles/
    tokens.css             ← all CSS custom properties (light + dark)
    reset.css
    app.css
    components.css         ← or per-component CSS modules
  constants.ts             ← all magic numbers (see §Constants in handoff spec)
  main.tsx
```

---

## Screens / Views

### 1 · Setup Wizard
**Purpose:** First-run project configuration.  
**Trigger:** No data in localStorage.  
**Layout:** Fixed full-viewport overlay (z-index 300), brand navy background with 32px dot-pattern. Centred white card (420px wide, 10px border-radius, 3px accent top border).  
**Content:** MAKE wordmark (32px, 700, 0.4em tracking), "Project Schedule" title (19px/600), subtitle, mono tagline, project name input (44px height, 10px radius, 16px font), two action buttons.  
**Animation:** Card entrance — `schedule-wizard-in 0.3s ease-out` (translateY 8px → 0 + opacity 0 → 1).  
**Buttons:** "Start blank" (brand navy filled) + "Load example data" (ghost).  
**Keyboard:** Enter commits blank start.

### 2 · Main App Shell
**Purpose:** Full 3-pane scheduling interface.  
**Grid:** `grid-template-rows: auto auto auto 1fr` (topbar / stat-bar / filter-bar / main).  
**Main pane:** `grid-template-columns: 490px 1fr auto` (task list / Gantt / side panel when open).  
**Overflow:** App and main are `overflow: hidden`; scrolling is per-pane.

### 3 · Topbar (52px)
Brand navy (#1c3048) strip. Left: MAKE wordmark + divider + editable project title + subtitle. Right: zoom tabs, Phases, Parties, Baseline, Import, Export, PDF, calendar icon, Critical Path toggle (conditional), reset, New task button with N-key hover badge.

### 4 · Stat Bar (32px)
White surface below topbar. Shows: Project window (dates), Tasks (count), Overall progress (mini progress bar + %). Stats are comma-separated with 1px dividers.

### 5 · Filter Bar
White surface, horizontal scroll on overflow. Left: search input (168px). Middle: Phase chips, Status chips, Party chips (only shown when used). Right: "Showing N of M" count.

### 6 · Task List (490px)
Scrollable. Sticky header (64px). Column grid: `1fr 52px 80px 48px` (Task / Party / Dates / Float).  
- **Group rows:** surface-2 bg, left accent border on hover, collapse caret, WBS group number, task count
- **Task rows:** 36px height, colour bar (3px), WBS number, task name, status badge, note badge (if any), party abbreviation badge, date pair (mono 10px), float value (mono, red if negative)
- **States:** default / hover (surface-2) / selected (selected-bg fill) / kb-focused (2px accent outline, no fill) / completion-flash animation

### 7 · Gantt Area
Fills remaining width. `overflow: hidden` outer; inner `gantt-scroll` scrolls both X and Y.  
- **Header (sticky 64px):** Two-tier (primary/secondary). Tier selection by dayPx: ≥16→month+day, ≥5→month+week, ≥2→quarter+month, else→year+quarter
- **Grid:** Weekend bands (day zoom only), month/week vertical lines, group band highlights, today line with flag pill
- **Bars:** Absolutely positioned, 20px height, `border-radius: 5px`. Drag: move / left-resize / right-resize. Status modifiers. Critical path: red outline / dimmed. Min width: 3px.
- **Milestones:** Rotated 45° square, 16px, click to select
- **Dependency arrows:** SVG overlay, elbow routing, arrowhead markers, red on critical path
- **Ghost bars:** 8px height, positioned lower-half of row. Three variants: stripe (default) / solid / outline
- **Variance labels:** Pill badges with surface background, red for slip / green for ahead (threshold: ≥3 days)
- **Zoom pill:** Bottom-right, above ghost-style-toggle. −, zoom label, + buttons
- **Ghost style toggle:** Bottom-right, 44px above zoom pill. Visible only when baseline active.

### 8 · Side Panel (360px desktop / bottom sheet mobile)
Task detail editor. Sections: Status + progress + date inputs + meta grid (duration/workdays) + party select + phase select + milestone checkbox + task notes textarea + Actual Dates + Dependencies + Log.  
Footer: Delete task (danger) + Links button + "Autosaves" hint.  
**Mobile:** Bottom sheet, 40vh peek / 85vh full, spring physics drag (see §Motion in handoff spec).

### 9 · Modals
All use: fixed overlay `rgba(10,18,30,0.54)` + `backdrop-filter: blur(3px)`, z-index 200, `schedule-slide-in 0.16s` animation on the box.  
- **LinkBuilderModal** (580px): task search + checkbox list + dep type select + lag input + circular dep detection
- **WorkweekModal** (440px): 7-day toggle grid + holiday list + date picker
- **GroupsManager / PartiesManager** (460px): inline-edit list + colour picker + add form
- **CsvImportDialog** (560px): column mapping grid + preview table + import mode toggle

### 10 · Print Preview Modal (z-index 800)
92vw / max 1140px / 88vh chrome. Scrollable paper tray (grey #8f9aaa). A3 page at 55% scale. Mode tabs: 2-col Gantt / Summary table. Readability chip (ok/warn). Footer: close + Print button.

---

## Interactions & Behaviour

### Keyboard Shortcuts
| Key | Action | Guard |
|---|---|---|
| `N` | New task | No input focused |
| `↑` / `↓` | Navigate task rows (wraps) | No input focused |
| `Space` | Select/deselect focused row | No input focused, kbFocusId set |
| `Enter` | Open side panel for focused row | No input focused, kbFocusId set |
| `Escape` | Close panel/modal/dropdown, clear kbFocus | — |
| `Ctrl+Z` | Undo (stack of 20) | — |
| `Ctrl+Enter` | Post log entry | Note textarea focused |
| `Ctrl+Scroll` | Zoom Gantt in/out (continuous) | Cursor over gantt-scroll |

### Animations
See §Motion in `MAKE Handoff v4 FINAL.html` for all keyframe specs and exact easing curves. Hardware-accelerated (transform/opacity) where noted.

### Auto-progress
Tasks auto-calculate `status` and `pct` from planned dates unless `manualStatus` / `manualPct` = true. Setting `actualFinish` auto-sets pct→100, status→complete, both manual flags. Clearing `actualFinish` reverts. Daily midnight ticker re-runs auto-progress for all tasks.

### Undo Stack
Max 20 entries, LIFO. Actions that push: delete task, CSV replace, CSV append. Action that clears: reset project. `Ctrl+Z` pops and calls `restore()` closure.

### Onboarding State Machine
`fresh` → `first_added` (1st task; Gantt pulses) → `baseline_tip` (3+ tasks; tooltip near Baseline; 900ms delay) → `complete` (baseline locked). Persisted to localStorage.

### Scroll Sync
Task list and Gantt scroll vertically in lockstep via `syncingScroll` ref guard (prevents feedback loops).

### CPM (Critical Path)
Kahn topological sort → forward pass (earlyStart/earlyFinish) → backward pass (lateStart/lateFinish) → total float. Zero-float tasks = critical path. Only shown when `hasDeps = true` and user enables the toggle.

---

## State Management

See the **§State Shape** section of `MAKE Handoff v4 FINAL.html` for the full TypeScript interface including every `useState`, derived/memoised value, and the `PersistedState` schema.

Key points:
- All expensive calculations (`buildTimeline`, `computeCriticalPath`, `visibleRows`) are `useMemo`
- `kbFocusId` (keyboard cursor) and `completionFlashId` (animation trigger) are transient — not persisted
- `ghostStyle` is **not** persisted in the v4 prototype but **should be** added to `saveState()` in the production implementation
- `depType` and `lag` from `LinkBuilderModal` are currently **discarded** by App — see §Clarifications C1 in handoff spec

---

## Design Tokens

All tokens are documented in §Design Tokens in `MAKE Handoff v4 FINAL.html`. Key values:

```css
/* Fonts */
--font-sans: "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif;
--font-mono: "Space Mono", ui-monospace, Menlo, monospace;

/* Brand */
--brand: #1c3048;
--accent: #27aae1;
--accent-hover: #1a96cc;
--accent-dim: rgba(39, 170, 225, 0.11);

/* Surfaces (light) */
--color-bg: #eff2f6;
--color-surface: #ffffff;
--color-surface-2: #f5f8fb;

/* Text (light) */
--color-text-primary: #1c3048;
--color-text-secondary: #466070;
--color-text-tertiary: #7894a6;
--color-text-dim: #a6bcca;

/* Functional */
--color-danger: #bf3b2e;
--color-success: #1D9E75;
--color-toast-bg: #1c2d3f;
--color-selected-bg: #e2f2fb;

/* Radii */
--radius-sm: 3px; --radius: 5px; --radius-lg: 10px;

/* Type scale */
--text-2xs: 11px; --text-xs: 12px; --text-sm: 13px;
--text-base: 14px; --text-md: 16px; --text-lg: 19px;

/* Spacing (8px grid) */
--space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
--space-5: 20px; --space-6: 24px; --space-8: 32px; --space-10: 40px;
```

Dark mode overrides are documented in the handoff spec under §Design Tokens → Dark mode.

---

## Constants

All magic numbers are in §Constants in `MAKE Handoff v4 FINAL.html`. Extract these to `src/constants.ts`:

```typescript
export const STORAGE_KEY             = 'schedule-tool-v1';
export const ROW_HEIGHT              = 36;
export const TIMELINE_PAD_BEFORE     = 14; // days
export const TIMELINE_PAD_AFTER      = 21; // days
export const MIN_BAR_PX              = 3;
export const UNDO_STACK_MAX          = 20;
export const TOAST_DURATION_MS       = 5000;
export const PRINT_SCALE             = 0.55;
export const PRINT_DAY_PX_BASE       = 4;
export const A3_W                    = 1587;
export const A3_H                    = 1122;
export const PRINT_TL_W              = 220;
export const PRINT_ROW_H             = 20;
export const PRINT_HDR_H             = 36;
export const SLIP_LABEL_THRESHOLD    = 3;  // days
export const SHEET_DISMISS_VELOCITY  = 0.5; // px/ms
export const SHEET_DISMISS_DELTA     = 80;  // px
export const SHEET_TAP_THRESHOLD     = 12;  // px
export const SHEET_PEEK_HEIGHT       = '40vh';
export const SHEET_FULL_HEIGHT       = '85vh';
export const GANTT_PULSE_DURATION_MS = 3200;
export const BASELINE_TIP_DELAY_MS  = 900;
export const PRINT_LOADING_DELAY_MS = 800;
export const COMPLETION_FLASH_MS    = 600;
```

---

## Clarifications (Resolve Before Implementing)

Four decisions need stakeholder input before starting:

1. **C1 (Critical):** Should `depType` and `lag` be stored per-task or per-dependency-edge? Currently discarded at save. See §Clarifications C1 in handoff spec.
2. **C2:** Add `ghostStyle` to localStorage persistence (recommended — low risk).
3. **C3:** Should actual-date cross-field validation block save, or remain advisory?
4. **C5:** Should example-data users skip the onboarding animation (gantt pulse + baseline tip)?

---

## Assets

No external image assets. All icons are inline SVG within components. Fonts via Google Fonts CDN. See the prototype for exact SVG paths for each icon.

---

## Files in This Package

| File | Purpose |
|---|---|
| `README.md` | This document — full implementation specification |
| `MAKE Scheduling Tool v4.html` | Interactive prototype — open in browser to test all behaviour |
| `MAKE Handoff v4 FINAL.html` | Design specification — tokens, interfaces, animations, flows |

---

## Implementation Notes

- **Performance:** Target smooth rendering at 500+ tasks. Wrap all expensive computations in `useMemo`. Bar components must be flat (no nested React component trees inside bars).
- **Scroll sync:** Use a `useRef` flag (`syncingScroll`) to prevent feedback loops between task list and Gantt scroll handlers.
- **Keyboard handler:** Mount a single `keydown` listener on `window` in a `useEffect` with `kbFocusId` in deps. Guard non-Ctrl shortcuts with `inputFocused()` check.
- **Midnight ticker:** `useEffect` that schedules a `setTimeout` to the next midnight + 100ms, updates `todayDate`, then reschedules itself recursively.
- **CSS vars:** Define all tokens in a `:root {}` block in a global CSS file. All component styles reference vars — zero hardcoded hex except print page paper (#fff) and brand header (#1c3048).
