# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**MAKE Scheduling Tool v4** — A Gantt-style project scheduling application for tracking tasks, phases, milestones, dependencies, baselines, and variance across construction and project management workflows.

**Status:** Design handoff phase. The interactive HTML prototypes (`MAKE Scheduling Tool v4.html` and `MAKE Handoff v4 FINAL.html`) are the source of truth for all behavior, design tokens, animations, and interactions. The task is to reimplement these as a production Vite + TypeScript + React 18 application.

**Key Reference:** `design_handoff_make_schedule_tool/README.md` is the full implementation specification. Always refer to it and the HTML prototypes when questions arise about behavior.

---

## Tech Stack & Setup

| Concern | Choice |
|---------|--------|
| Bundler | Vite |
| Language | TypeScript (strict mode) |
| UI Library | React 18 (`.tsx` throughout) |
| State Management | `useState` + `useCallback` + `useMemo` (no Redux/Zustand/etc) |
| Styling | CSS custom properties (design tokens) + global stylesheet or CSS modules |
| Fonts | Plus Jakarta Sans (400/500/600) + Space Mono (400/700) from Google Fonts |
| Persistence | localStorage, key `schedule-tool-v1`, JSON |
| Gantt Implementation | Custom (absolutely positioned divs) — **no chart libraries** |
| Dark Mode | `prefers-color-scheme: dark` only — no manual toggle |

### Project Structure

Follow this directory layout:

```
src/
  components/
    App.tsx                    ← root component; owns all state
    gantt/
      Gantt.tsx
      GanttHeader.tsx
      GanttGrid.tsx
      GanttBar.tsx
      DependencyArrows.tsx
      BaselineGhostBars.tsx
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
    useKeyboard.ts             ← keyboard shortcut handling
    useScrollSync.ts           ← sync task list ↔ gantt scroll
    useMidnightTicker.ts       ← update todayDate at midnight
    useOnboarding.ts           ← onboarding state machine
  lib/
    dates.ts                   ← date utilities (toD, fmtDate, addDays, etc)
    progress.ts                ← auto-progress and task enrichment
    cpm.ts                     ← Critical Path Method (Kahn + forward/backward pass)
    csv.ts                     ← CSV import/export parsing
    storage.ts                 ← localStorage load/save with undo stack
    timeline.ts                ← gantt timeline building and zoom levels
    workdays.ts                ← workday ratio and workday calculations
  types/
    index.ts                   ← all TypeScript interfaces
  styles/
    tokens.css                 ← design tokens (CSS custom properties)
    reset.css
    app.css
    components.css
  constants.ts                 ← magic numbers (ROW_HEIGHT, UNDO_STACK_MAX, etc)
  main.tsx
```

---

## Build & Development Commands

```bash
# Install dependencies
npm install
# or
yarn install

# Development server (watch mode, HMR)
npm run dev
# or
yarn dev

# Build for production
npm run build
# or
yarn build

# Preview production build locally
npm run preview
# or
yarn preview

# Lint TypeScript (when configured)
npm run lint
# or
yarn lint
```

**Note:** Exact scripts depend on your `package.json` configuration. These are standard Vite + TypeScript conventions.

---

## Core Architecture Patterns

### State Management (Top-Level in App.tsx)

All state lives in `App.tsx` via `useState`. No external state library. Key state groups:

1. **Schedule Data** (`PersistedState`):
   - `tasks` — array of task objects with all properties
   - `groups` — WBS hierarchy
   - `phases`, `parties`, `workweek` — configuration
   - `baselineVersion` — baseline state
   - `undoStack` — max 20 snapshots

2. **Transient UI State**:
   - `kbFocusId` — keyboard cursor (not persisted)
   - `completionFlashId` — animation trigger (not persisted)
   - `selectedTaskId`, `panelOpen`, `modalOpen` — UI state
   - `onboardingPhase` — persisted state machine (`fresh` → `first_added` → `baseline_tip` → `complete`)

3. **Computed/Memoized**:
   - `visibleRows` — filtered task rows after search/filter/grouping
   - `timeline` — gantt header tiers (month+day / month+week / etc by dayPx)
   - `criticalPath` — set of task IDs on the critical path (if `hasDeps` and user enabled toggle)

**Rule:** Wrap expensive calculations in `useMemo` with explicit dependency arrays. Examples:
- `buildTimeline()` — depends on dateRange, dayPx, zoom level
- `computeCriticalPath()` — depends on tasks, dependencies
- `visibleRows` — depends on tasks, filterState, searchTerm, grouping

### Hooks for Complex Logic

Four custom hooks encapsulate complex state transitions:

1. **`useKeyboard()`** — Keyboard shortcut handler
   - Shortcuts: N (new task), ↑↓ (navigate), Space (select), Enter (open panel), Escape, Ctrl+Z, Ctrl+Enter (post log)
   - Guard non-Ctrl shortcuts with `inputFocused()` check
   - Mount once via `useEffect` on window

2. **`useScrollSync()`** — Sync task list and gantt scroll
   - Use a `syncingScroll` ref flag to prevent feedback loops
   - Both scroll containers listen; winner updates loser with offset

3. **`useMidnightTicker()`** — Update `todayDate` at midnight
   - Schedule `setTimeout` to next midnight + 100ms
   - Update `todayDate`, re-run auto-progress, reschedule recursively
   - Critical for daily progress roll-forward

4. **`useOnboarding()`** — State machine for first-run experience
   - State: `fresh` → `first_added` (1st task added) → `baseline_tip` (3+ tasks) → `complete`
   - Transitions on specific events (e.g., task count crosses thresholds)
   - Persisted to localStorage

### Utility Libraries (No Side Effects)

Each `lib/*.ts` file is a pure module:

- **`dates.ts`** — ISO string ↔ Date object conversions, formatting, day math
- **`progress.ts`** — Auto-calculate task status/pct from dates, enrich tasks with computed fields
- **`cpm.ts`** — Kahn topological sort, forward/backward pass, identify critical path
- **`csv.ts`** — Parse CSV text → task array, generate CSV from tasks, normalize dates
- **`storage.ts`** — Load/save state to localStorage, manage undo stack (LIFO, max 20)
- **`timeline.ts`** — Build gantt header (tiers by dayPx), define ZOOM_LEVELS, convert day ↔ px
- **`workdays.ts`** — Calculate workday ratio, filter weekends/holidays

**Important:** These are all stateless. They take input, return output. No localStorage reads/writes except in `storage.ts`.

---

## Key Design Decisions & Constraints

### 1. No Chart Libraries
The Gantt is custom HTML/CSS:
- Bars are absolutely positioned `div` elements (20px height, 5px border-radius)
- Dependency arrows are SVG with elbow routing and arrowheads
- Zoom is via CSS transform or DAyPx adjustment; no D3/VictoryChart/etc

### 2. Scroll Sync (Task List ↔ Gantt)
Both scroll containers must stay vertically aligned:
- Use a `useRef(false)` flag (`syncingScroll`) to prevent feedback loops
- When task list scrolls, update gantt's scrollTop
- When gantt scrolls, update task list's scrollTop
- Check the flag before each update to avoid infinite loops

### 3. Auto-Progress (Daily Recalculation)
Tasks auto-calculate `status` and `pct` from planned dates **unless manual flags are set**:
- `manualStatus = true` → status is locked to user value
- `manualPct = true` → pct is locked to user value
- Setting `actualFinish` → auto-sets pct=100, status='complete', both manual flags=true
- Clearing `actualFinish` → reverts to auto-calculated values
- **Midnight ticker re-runs auto-progress for all tasks** (e.g., today's date advances)

### 4. Undo Stack (Max 20 Snapshots)
Actions that push: delete task, CSV replace, CSV append.  
Actions that clear: reset project.  
`Ctrl+Z` pops stack and calls the `restore()` closure.

**Important:** Only these three actions push. Don't push on every edit. Users expect undo to revert "big" operations, not individual field changes.

### 5. Critical Path Method (CPM)
Only computed when `hasDeps = true` AND user enables the toggle:
- Kahn topological sort → forward pass (earlyStart/earlyFinish) → backward pass (lateStart/lateFinish) → total float
- Zero-float tasks = critical path
- Red outline on bars, dimmed non-critical bars, red arrows

### 6. Design Tokens as CSS Custom Properties
All colors, fonts, spacing, radii live in `:root {}` CSS block:
```css
--brand: #1c3048;
--accent: #27aae1;
--color-bg: #eff2f6;
--color-surface: #ffffff;
--font-sans: "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif;
--text-base: 14px;
--space-2: 8px;
```
Dark mode via `@media (prefers-color-scheme: dark)` overrides. **Zero hardcoded hex values in components.**

### 7. Print Preview (A3, 55% Scale)
Print modal renders schedule on A3 paper:
- Two modes: 2-column Gantt layout OR summary table
- A3 = 1587×1122px at 55% scale
- Uses print-specific CSS (e.g., break-inside, page-break-after)
- Print button triggers browser print dialog

### 8. Mobile: Bottom Sheet for Side Panel
On mobile, the side panel becomes a bottom sheet:
- 40vh peek height, 85vh full height
- Drag gesture support (spring physics)
- Dismiss velocity / delta thresholds (see CONSTANTS in README)

---

## Important Clarifications (Resolve Before Implementation)

Four decisions need stakeholder input:

1. **C1 (Critical):** Dependencies currently store only `fromId`, `toId`, `type` (SS/SF/FS/FF). But `type` and `lag` are discarded on save. Should they be persisted per-edge? Affects task/dependency model.

2. **C2 (Recommended):** Add `ghostStyle` (baseline visualization mode) to localStorage. Currently not persisted — user loses preference on reload.

3. **C3:** Should actual-date cross-field validation (e.g., actualFinish ≥ actualStart) block save, or remain advisory with a warning toast?

4. **C5:** Should users who load example data skip the onboarding animations (gantt pulse + baseline tip) to speed up the flow?

**Action:** Get answers from the product/design team before starting implementation.

---

## Testing & Validation Strategy

1. **Prototype as Reference:** Keep `MAKE Scheduling Tool v4.html` open in a browser. Click, drag, type, and observe. Match exact behavior.

2. **Design Tokens Validation:** Extract all hex values, fonts, sizes, radii from the handoff spec. Build a visual checklist. Pixel-perfect matching required.

3. **Keyboard Shortcuts:** Test all shortcuts (N, ↑↓, Space, Enter, Escape, Ctrl+Z, Ctrl+Enter) with and without focus guards.

4. **Scroll Sync:** Drag the scrollbar in both task list and gantt. Verify they stay in sync and don't stutter.

5. **Performance:** Test with 500+ tasks. Ensure smooth 60fps scroll, drag, and filter. Profile with DevTools.

6. **Dark Mode:** Test under `prefers-color-scheme: dark`. All text should be readable, no hardcoded light colors.

7. **Undo Stack:** Trigger undo actions (delete task, CSV import). Verify state rolls back correctly. Max 20 entries.

8. **Print Preview:** Open print modal, render on A3 at 55% scale. Verify layout, fonts, and pagination.

---

## Performance Considerations

1. **500+ Tasks:** Target smooth rendering with this volume.
   - Virtualize task list rows (or memoize individual row components aggressively)
   - Memoize gantt bars with `React.memo`
   - Avoid re-rendering the entire Gantt on every scroll

2. **useMemo Dependencies:** Be explicit and minimal.
   - If you have `useMemo(() => ..., [tasks, filters])`, ensure only those two dependencies actually affect the result.
   - Missing dependencies = stale cache. Extra dependencies = cache thrashing.

3. **CSS Selectors:** Keep selectors simple. Avoid deep nesting. CSS Grid and Flexbox are fast; use them.

4. **localStorage:** Calls to `JSON.stringify()` and `JSON.parse()` are synchronous. For a schedule with 500+ tasks, this can block. Consider throttling or debouncing saves.

---

## Code Style & Conventions

1. **TypeScript:** Strict mode. No `any`. Use explicit types for all function parameters and return values.

2. **React Conventions:**
   - Component files: PascalCase (e.g., `TaskList.tsx`)
   - Hooks: camelCase with `use` prefix (e.g., `useKeyboard.ts`)
   - Props interfaces: `{ComponentName}Props` (e.g., `TaskListProps`)

3. **CSS:** 
   - Use CSS custom properties for all colors, fonts, sizes
   - Prefer global stylesheet + component-scoped styles (CSS modules or inline styles)
   - Avoid inline styles except for dynamic positioning (gantt bars)

4. **Naming:**
   - Task state: `tasks`, `selectedTaskId`, `taskToDelete`
   - Filter state: `filterState`, `searchTerm`, `visibleRows`
   - Modal state: `modalOpen`, `modalData`
   - Transient: `kbFocusId`, `completionFlashId` (underscore suffix optional but clear)

5. **Avoid:**
   - Default exports (use named exports for easier refactoring)
   - Nested ternaries (extract to if/else or guard clauses)
   - Magic numbers (move to `constants.ts`)

---

## File References: Design Specification

| File | Purpose |
|------|---------|
| `design_handoff_make_schedule_tool/README.md` | Full implementation specification — read this first for any question |
| `design_handoff_make_schedule_tool/MAKE Scheduling Tool v4.html` | Interactive prototype — test all behavior here |
| `design_handoff_make_schedule_tool/MAKE Handoff v4 FINAL.html` | Design specification doc — design tokens, interfaces, animations, detailed flows |

---

## Next Steps

1. Set up Vite + TypeScript + React 18 project
2. Install Plus Jakarta Sans + Space Mono from Google Fonts
3. Create `src/constants.ts` with all magic numbers from README §Constants
4. Build `src/types/index.ts` with all TypeScript interfaces from the handoff spec
5. Create CSS with design tokens in `:root {}` block
6. Resolve the four clarifications (C1, C2, C3, C5) with stakeholders
7. Implement `src/lib/*` utility functions (dates, progress, CPM, CSV, storage, timeline, workdays)
8. Build core components (App, Gantt, TaskList, SidePanel)
9. Validate against HTML prototype using visual + interaction testing
10. Performance profiling with 500+ tasks

---

**Last Updated:** 2026-05-19  
**Current Phase:** Design handoff → implementation planning
