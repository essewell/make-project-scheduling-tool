# MAKE Scheduling Tool v4 — Implementation Plan

> **📦 ARCHIVED — historical reference only.**
> This is the original v0 implementation plan. All ten phases shipped in 2026 (v0). Retained here so future audits and plan files can cite the original architectural intent. **Do not build from this file.** For active work, see `version-status.md` and the current `plan-v*.md`.

---

## Context

The repository currently contains only a design handoff package:
- `handoff/MAKE Scheduling Tool v4.html` — interactive prototype (behavioral source of truth)
- `handoff/MAKE Handoff v4 FINAL.html` — design specification (tokens, motion, state shape)
- `handoff/README.md` — full implementation spec
- `CLAUDE.md` — project guidance (just created)

The goal is to reimplement this Gantt-style project scheduling tool as a production **Vite + TypeScript (strict) + React 18** application, preserving every interaction, animation, and pixel of the prototype while organising the code into well-typed, performant modules.

The HTML prototype demonstrates exact intended behaviour. When the spec is silent or ambiguous, the prototype's behaviour wins.

---

## Locked Decisions (Clarifications Resolved)

| ID | Decision |
|----|----------|
| **C1** | **Per-edge `depType` + `lag`** — Dependencies become objects: `{ fromId: string, toId: string, type: 'FS' \| 'SS' \| 'FF' \| 'SF', lag: number }`. Task's `deps: string[]` becomes a derived/legacy accessor; storage is the edge list. CPM consumes `type` + `lag` for accurate float math. |
| **C2** | **Persist `ghostStyle`** in `PersistedState`. Add to `saveState()` / `loadState()`. |
| **C3** | **Advisory validation only.** Actual-date inconsistencies (e.g., `actualFinish < actualStart`) show a non-blocking inline warning. Save proceeds. |
| **C5** | **Example data skips onboarding.** "Load example data" sets `onboardingPhase = 'complete'` immediately. Blank-start runs the full state machine. |

---

## Critical Reference Material

- **Design tokens** (light + dark): `§Design Tokens` in handoff HTML — both light and dark hex values
- **Motion / keyframes**: `§Motion` in handoff HTML — durations, easings, exact keyframe params
- **State shape**: `§State Shape` in handoff HTML — every field's name + type
- **CSV schema**: 11 columns (`name, start, end, status, pct, party, group, actualStart, actualFinish, milestone, notes`)
- **Status taxonomy**: `not_started | in_progress | at_risk | delayed | complete`
- **Zoom tiers**: dayPx ≥ 16 → Month/Day; ≥ 5 → Month/Week; ≥ 2 → Quarter/Month; else → Year/Quarter

---

## Implementation Phases

### Phase 0 — Scaffold & Tooling

1. `npm create vite@latest scheduling-tool -- --template react-ts` (root of repo, *not* under `handoff/`)
2. Configure `tsconfig.json`: `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`, `noImplicitAny: true`, `noUncheckedIndexedAccess: true`.
3. Add ESLint + Prettier (React + TS configs). Hook into `npm run lint`.
4. Inject Google Fonts in `index.html`: Plus Jakarta Sans 400/500/600, Space Mono 400/700 (use `preconnect` + `display=swap`).
5. Create empty file skeleton per the directory structure in `CLAUDE.md`.
6. Confirm `npm run dev`, `npm run build`, `npm run preview` work on an empty React shell.

### Phase 1 — Foundation Layer (types, tokens, constants, utilities)

**Files to create:**
- `src/types/index.ts` — all interfaces from `§State Shape`:
  - `Task` (note: **no `deps: string[]`** field — derived from `dependencies` list)
  - `Dependency` (`{ fromId, toId, type: DepType, lag: number }`) ← **new per C1**
  - `Group`, `Party`, `Note`, `Baseline`, `WorkweekConfig`, `UndoEntry`
  - `PersistedState` — now includes `dependencies: Dependency[]` and `ghostStyle` per C1/C2
  - `OnboardingPhase`, `TaskStatus`, `DepType`, `GhostStyle`, `ZoomLevel` enums/unions
- `src/constants.ts` — every magic number from `§Constants` (`STORAGE_KEY`, `ROW_HEIGHT=36`, `UNDO_STACK_MAX=20`, `SHEET_DISMISS_VELOCITY=0.5`, `SHEET_DISMISS_DELTA=80`, `SHEET_TAP_THRESHOLD=12`, `COMPLETION_FLASH_MS=600`, `GANTT_PULSE_DURATION_MS=3200`, `BASELINE_TIP_DELAY_MS=900`, etc.)
- `src/styles/tokens.css` — `:root {}` with light tokens; `@media (prefers-color-scheme: dark) { :root {} }` with dark overrides (full set from `§Design Tokens — Dark Mode`)
- `src/styles/reset.css` — modern reset (border-box, no margin defaults, system line-height)
- `src/styles/app.css` — `body` + grid layout for app shell
- `src/lib/dates.ts` — `toD`, `fmtDate`, `prettyDate`, `shortDate`, `addDays`, `daysBetween`, `durationDays` (all pure functions on ISO strings or Date objects)
- `src/lib/workdays.ts` — `workdayRatio(start, end, workweek, holidays)`, `workdays(start, end, ...)`
- `src/lib/timeline.ts` — `buildTimeline(start, end, dayPx)`, `getTiersForDayPx(dayPx)`, `ZOOM_LEVELS` array
- `src/lib/storage.ts` — `loadState()`, `saveState()`, `STORAGE_KEY`, undo-stack helpers (`pushUndo`, `popUndo`, `clearUndo`)

**Acceptance:** All utilities have explicit return types. No `any`. Each lib file is side-effect-free except `storage.ts`.

### Phase 2 — Business Logic

**Files to create:**
- `src/lib/progress.ts` — `computeAutoProgress(task, today)`, `refreshAutoProgress(tasks, today)`, `enrichTask(task, today, workweek, holidays)`. Honour `manualStatus` / `manualPct`. Setting `actualFinish` → pct=100, status='complete', both manual flags=true.
- `src/lib/cpm.ts` — `computeCriticalPath(tasks, dependencies, workweek, holidays)`. Kahn topological sort, then forward pass (earlyStart/earlyFinish using `type` + `lag`), then backward pass (lateStart/lateFinish), then total float. Returns `Set<TaskId>` for critical-path tasks plus per-task float map.
- `src/lib/csv.ts` — `parseCSVText(text)`, `generateCSV(tasks)`, `normalizeDate(rawDate)`, `triggerCSVImport(file)` (FileReader wrapper). Surface up to 5 row errors during import. Two import modes: replace + append.

**Acceptance:** Unit-testable in isolation. CPM correctness verified against a manually-traced 5-task graph with one SS lag.

### Phase 3 — Custom Hooks

**Files to create:**
- `src/hooks/useKeyboard.ts` — single window `keydown` listener, `kbFocusId` in deps. Guard with `inputFocused()` helper. Shortcuts: `N`, `↑`, `↓`, `Space`, `Enter`, `Escape`, `Ctrl+Z`, `Ctrl+Enter` (note context), `Ctrl+Scroll` (delegated to Gantt overlay).
- `src/hooks/useScrollSync.ts` — accepts `taskListRef` + `ganttScrollRef`. Uses `useRef<boolean>(false)` as `syncingScroll` flag. Wires `scroll` listeners on both; sets the flag before updating the partner element, clears it on next tick.
- `src/hooks/useMidnightTicker.ts` — `useEffect` schedules `setTimeout` to next midnight + 100ms, updates `todayDate`, re-runs `refreshAutoProgress`, reschedules recursively. Clean up timer on unmount.
- `src/hooks/useOnboarding.ts` — state machine: `fresh` → `first_added` (1st task; triggers `ganttPulse` for 3200ms) → `baseline_tip` (3+ tasks; 900ms delayed tooltip near Baseline button) → `complete`. Persisted via `saveState()`. **Example-data load short-circuits to `complete` (C5).**

### Phase 4 — App Shell + Static Components

**Files to create:**
- `src/components/App.tsx` — root component, owns **all** persisted + transient state. Wires `loadState()` on mount, `saveState()` on relevant state changes (debounced ~150ms). Renders `SetupWizard` if no data, else the main grid.
- `src/components/topbar/TopBar.tsx` — 52px brand-navy strip; left: wordmark + divider + `EditableTitle` + subtitle; right: zoom tabs, Phases/Parties/Baseline buttons, Import, Export, PDF, calendar icon, Critical Path toggle (only if `hasDeps`), reset, "New task" button + N-key badge.
- `src/components/topbar/EditableTitle.tsx` — inline-editable input that swaps to text on blur/Escape.
- `src/components/filter/FilterBar.tsx` — search input + chip rows for phase/status/party + "Showing N of M" count.
- `src/components/overlays/SetupWizard.tsx` — fixed full-viewport overlay (z-index 300). 420px white card with 3px accent top border. Project-name input, "Start blank" + "Load example data" buttons. **Load-example sets `onboardingPhase = 'complete'` (C5).** Card entrance animation: `schedule-wizard-in 0.3s ease-out`.

Stat bar can live inside `App.tsx` (3-line render); not worth extracting until it gets logic.

### Phase 5 — Task List (left pane, 490px)

**Files to create:**
- `src/components/task-list/TaskList.tsx` — sticky 64px header; column grid `1fr 52px 80px 48px`. Renders group rows (collapse caret, WBS number, count) and task rows (3px colour bar, WBS, name, status badge, note badge, party abbr, mono date pair, float in red if negative). States: default / hover / selected / kb-focused (2px accent outline, no fill) / completion-flash. Memoize each row.
- `src/components/task-list/StatusBadge.tsx` — small pill, 5 variants mapping to status palette. Pure presentational.

### Phase 6 — Gantt (custom, no chart libraries)

**Files to create:**
- `src/components/gantt/Gantt.tsx` — container with `overflow: hidden` outer + `gantt-scroll` inner (scrolls both axes). Hosts header + grid + bars + arrows + ghost layer + zoom pill + ghost-style toggle. Wires `Ctrl+Scroll` zoom.
- `src/components/gantt/GanttHeader.tsx` — sticky 64px, two-tier driven by `getTiersForDayPx(dayPx)`.
- `src/components/gantt/GanttGrid.tsx` — weekend bands (day zoom only), month/week vertical lines, group band highlights, today line with flag pill. Pure SVG/CSS, no per-row React components.
- `src/components/gantt/GanttBar.tsx` — `React.memo`'d. Absolutely positioned `div`, 20px tall, `border-radius: 5px`, `transition: left 0.12s, width 0.12s`. Drag handlers: move, left-resize, right-resize (mouse + touch). Status modifiers (`opacity: 0.50` for not_started, inset rings for at_risk/delayed, faded fill for complete). Milestones: 45°-rotated 16px squares. **Min width: 3px (`MIN_BAR_PX`).** Critical-path classes: `cp-critical` / `cp-dimmed`.
- `src/components/gantt/DependencyArrows.tsx` — single SVG overlay sized to inner content. Elbow routing per edge using `depType` + `lag`. Arrowhead markers. Red `stroke` on critical-path edges.
- `src/components/gantt/BaselineGhostBars.tsx` — 8px-tall lower-half bars per active baseline. Three render modes driven by `ghostStyle`: `stripe` (default diagonal pattern) / `solid` / `outline`. Variance label appears when `|delta| ≥ SLIP_LABEL_THRESHOLD` (3 days) — red for slip, green for ahead.

The ghost-style toggle and zoom pill are small inline components inside `Gantt.tsx`.

### Phase 7 — Side Panel + Modals

**Files to create:**
- `src/components/panels/SidePanel.tsx` — 360px desktop / bottom-sheet mobile. Sections in order: status + progress + date inputs + meta grid (duration / workdays) + party select + phase select + milestone checkbox + task notes textarea + `ActualDatesSection` + dependencies preview + log. Footer: Delete (danger) + Links button + autosave hint. **Mobile bottom sheet** uses `dragRef` (useRef, not state) with thresholds: `velocity > 0.5 px/ms` OR `delta > 80px` → dismiss; `|delta| < 12px` → toggle peek↔full; else spring-snap (`0.32s cubic-bezier(0.34,1.56,0.64,1)`). Peek = 40vh, full = 85vh.
- `src/components/panels/ActualDatesSection.tsx` — actualStart / actualFinish inputs + advisory warning when `actualFinish < actualStart` **(C3 — non-blocking)**.
- `src/components/modals/LinkBuilderModal.tsx` — 580px. Task search + checkbox list of candidate predecessors + per-row `depType` select + per-row `lag` input. Circular dep detection (depth-first traversal on the edge list). **`onSave` writes the full edge list to `dependencies` (C1).**
- `src/components/modals/WorkweekModal.tsx` — 440px. 7-day toggle grid + holiday list + date picker.
- `src/components/modals/GroupsManager.tsx`, `PartiesManager.tsx` — 460px each. Inline-edit list + colour picker + add form.
- `src/components/modals/CsvImportDialog.tsx` — 560px. Column-mapping grid + preview table + replace/append toggle.
- `src/components/modals/PrintPreviewModal.tsx` — z-index 800; 92vw / max 1140px / 88vh chrome. Scrollable paper tray (grey `#8f9aaa`). A3 page (1587×1122) at `PRINT_SCALE = 0.55`. Mode tabs: 2-col Gantt / Summary table. Readability chip (ok/warn). Footer: close + Print. Triggers browser print via dedicated print stylesheet.

All modals share: `position: fixed` overlay `rgba(10,18,30,0.54)` + `backdrop-filter: blur(3px)`, z-index 200, `schedule-slide-in 0.18s ease-out` on the box.

### Phase 8 — Overlays + Mobile

**Files to create:**
- `src/components/overlays/UndoToast.tsx` — bottom-centred toast, `schedule-toast-in` animation, `TOAST_DURATION_MS = 5000`, calls `onUndo` closure on click.
- `src/components/overlays/BaselineMenu.tsx` — dropdown from Baseline button: save / activate / delete baselines.
- `src/components/mobile/MobileTabSwitcher.tsx` — segmented control: List | Gantt; controls `mobileTab` state.

### Phase 9 — Print Stylesheet + Polish

- `src/styles/print.css` — `@media print` rules: page-break-after, hide chrome, force light tokens, A3 sizing.
- Wire `BaselineGhostBars` `ghostStyle` to `saveState()` (C2 persistence).
- Inline-warning component in `ActualDatesSection` (C3).
- Audit: ensure every component reads design tokens via `var(--…)` — zero hardcoded hex except brand header (`#1c3048`) and print paper (`#fff`).

### Phase 10 — Performance, Validation, QA

1. **Generate 500-task fixture** (script in `scripts/seed-large.ts`). Load in dev. Profile with React DevTools + Chrome Performance.
2. **Memoization audit:**
   - `GanttBar` wrapped in `React.memo` with custom comparator on `task.s/e/status/pct/depType/lag` and `dayPx`
   - `visibleRows`, `timeline`, `criticalPath`, `enrichedTasks` all `useMemo` with **explicit, minimal** dependency arrays
   - Avoid passing inline `() => {}` to memoized children — wrap in `useCallback`
3. **Scroll sync regression** — drag both scrollbars rapidly; no stutter or feedback loops
4. **Pixel-diff against prototype** — open `MAKE Scheduling Tool v4.html` in one tab + dev build in another. Compare side-by-side at desktop (1440), tablet (768), mobile (375). Specifically check: row heights, bar radius, today line, weekend bands, critical-path styling.
5. **Dark mode pass** — toggle OS dark mode; verify all `--color-*` tokens render correctly. No hardcoded light colours.
6. **Keyboard pass** — every shortcut in the table tested with and without an input focused.
7. **localStorage save debouncing** — verify `saveState()` is debounced (~150ms) so rapid edits don't block the main thread.

---

## Critical Files (Quick Reference)

| Path | Purpose |
|------|---------|
| `src/types/index.ts` | All TS interfaces. Single source of truth for the data model. |
| `src/constants.ts` | All magic numbers. No constants anywhere else. |
| `src/styles/tokens.css` | Light + dark CSS variables. All other CSS reads from `var(--…)`. |
| `src/lib/storage.ts` | localStorage I/O + undo stack. Only file with `localStorage` calls. |
| `src/lib/cpm.ts` | Kahn + forward/backward pass. Consumes per-edge `type` + `lag` (C1). |
| `src/lib/progress.ts` | Auto-progress respecting `manualStatus` / `manualPct`. |
| `src/hooks/useKeyboard.ts` | Single source for keyboard shortcuts. |
| `src/hooks/useScrollSync.ts` | Owns the `syncingScroll` ref pattern. |
| `src/components/App.tsx` | Owns all state. Every other component is presentational + callback-driven. |
| `src/components/gantt/GanttBar.tsx` | The single hottest render path. Must be `React.memo`'d. |
| `src/components/modals/LinkBuilderModal.tsx` | Now writes per-edge `depType` + `lag` (C1). |

---

## Verification (End-to-End)

```bash
# Dev loop
npm install
npm run dev          # → http://localhost:5173

# Production build
npm run build
npm run preview      # serve the build

# Type-check + lint
npm run typecheck    # or: tsc --noEmit
npm run lint
```

**Manual QA checklist (run against the deployed build, with `MAKE Scheduling Tool v4.html` open in another tab):**

1. **Cold start** — no localStorage → Setup Wizard appears with entrance animation. "Start blank" begins onboarding state machine. "Load example data" skips it (C5).
2. **First-task gantt pulse** — add 1st task → 3200ms accent box-shadow pulse on Gantt.
3. **Baseline tip** — add 3rd task → 900ms later, tooltip near Baseline button.
4. **Keyboard** — `N` creates task; `↑/↓` navigate wrapping; `Space` selects; `Enter` opens panel; `Escape` closes; `Ctrl+Z` undoes (max 20); `Ctrl+Enter` posts log when notes textarea focused.
5. **Drag** — move bar, left-resize, right-resize — `s` / `e` update; snap ghost shows live position; 0.12s transition on release.
6. **Critical path** — add deps with mixed FS/SS/FF types and non-zero lag; toggle CP on; bars on the path show red outline (`cp-critical`), others dim (`cp-dimmed`); arrows turn red on path. Verify float values match a hand-computed example.
7. **Baseline + ghost styles** — save baseline → ghost bars render under live bars; toggle stripe/solid/outline; **reload page → style persists (C2)**.
8. **Variance labels** — modify task to slip 3+ days → red variance pill; modify to be 3+ days ahead → green pill.
9. **Actual dates** — set `actualFinish` < `actualStart` → inline warning appears, save still proceeds (C3); set `actualFinish` → pct snaps to 100, status to complete, manual flags set; clear `actualFinish` → reverts to auto values.
10. **Undo** — delete task, then `Ctrl+Z` → restored. CSV replace, then `Ctrl+Z` → all previous tasks restored. Stack capped at 20.
11. **CSV** — export → all 11 columns present; re-import → matching columns auto-mapped; replace vs append both work; 5+ bad rows show only the first 5 errors.
12. **Scroll sync** — drag task-list scrollbar fast → Gantt follows without jitter; reverse direction → no stutter.
13. **Zoom** — `Ctrl+Scroll` over Gantt → continuous zoom; header tier swaps at `dayPx` thresholds (16 / 5 / 2). Zoom pill `-`/`+` buttons step between named levels.
14. **Mobile (375 width)** — tab switcher shows List | Gantt; side panel becomes bottom sheet with peek/full snap; drag with velocity > 0.5 px/ms dismisses; tap (<12px move) toggles peek↔full.
15. **Dark mode** — toggle OS appearance → all surfaces/text/borders use dark token values; brand header stays `#1c3048`; print paper stays white.
16. **Print preview** — open → A3 paper at 55% scale; switch modes; click Print → browser print dialog with chrome hidden.
17. **Performance** — seed 500 tasks → scroll list + Gantt at 60fps; drag a bar → no frame drops; toggle CP → recompute < 100ms (timed via DevTools).
18. **Persistence** — make 10 edits, refresh → state restored. Verify `ghostStyle` and `dependencies[]` (with type/lag) are present in the saved JSON (`localStorage.getItem('schedule-tool-v1')`).

---

## Risks & Notes

- **Bar drag math at edges** — `MIN_BAR_PX = 3` may visually misrepresent very short tasks at zoomed-out views. Prototype's behaviour wins; don't auto-snap to a larger minimum.
- **CPM with lag** — most CPM implementations assume `lag = 0`. With per-edge lag, forward/backward pass must add the lag to the predecessor's relevant date based on `type` (e.g., FS+lag = pred.EF + lag → succ.ES). Cross-check against a 5-task hand trace before trusting.
- **Scroll-sync feedback loop** — the `syncingScroll` ref must be a `useRef`, **not** state, otherwise re-renders defeat the guard.
- **Midnight ticker drift** — long-lived tabs may drift if the timer is scheduled with relative `setTimeout`. Always compute the next midnight as an absolute timestamp.
- **`React.StrictMode`** double-invokes effects in dev — the midnight ticker and any timer-setting effect must clean up properly or you'll get two timers firing.
- **CSV with embedded commas / quotes** — use a tested CSV parser (e.g., `papaparse`) rather than naïve `split(',')`. Verify before bringing in a dependency.
- **Per-edge dependency migration (C1)** — there is no existing v4 persisted data, so no migration shim is needed. If a future user pastes example data from the v4 prototype, it must be transformed on import: `task.deps[] → dependencies[]` with default `type='FS', lag=0`.
