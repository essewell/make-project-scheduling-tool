# MAKE Scheduling Tool — Plan v1.0

> **📦 ARCHIVED — historical reference only.**
> The Track C narrow UX refinement shipped 2026-05-21. All seven tasks (T1–T7) landed; the four clarifications (C1, C2, C3, C5) were quietly absorbed during the work. Retained for traceability. **Do not build from this file.** For active work, see `version-status.md` and the current `plan-v*.md`.

---

## Purpose

A narrow, build-ready refinement pass over the v0 implementation. The goal is to ship a v1.0 that **feels usable**: friction is removed from the most common flows (edit progress, delete a task, explore example data, read the timeline) without touching the data model or persistence layer.

Heavier production work — full dependency edge objects, `ghostStyle` persistence + migrations, CSV import validation, task-list virtualization, CI — is **deferred to v1.1**. See `plan-v1.1.md` (to be written after v1.0 ships).

This plan is the source of truth for the build. Cross-reference `.claude/CLAUDE.md` for project conventions and `handoff/README.md` for the spec.

---

## Scope

### In scope (Track C — narrow refinement)
1. Side panel: real progress slider + visually prominent delete
2. Example data: unlock in-progress task so manual override doesn't feel sticky
3. Top bar: clarify baseline controls (capture button label, active state legibility)
4. Task list: prevent disposable/placeholder task spam on rapid "New Task"
5. Gantt header: week-mode label spacing so dates don't crowd or overlap
6. Onboarding: skip the first-task pulse + baseline tip when the user loads example data

### Out of scope (deferred to v1.1)
- Persisting `type` and `lag` on dependency edges (clarification **C1**)
- Persisting `ghostStyle` to `PersistedState` + migration (**C2**)
- Actual-date cross-field validation policy (**C3**)
- CSV import schema validation, migration, undo correctness
- Task-list virtualization for 500+ rows
- CI workflow, axe/a11y automation, Playwright matrix
- Mobile bottom-sheet drag physics
- Print preview A3 polish

---

## Current State (verified 2026-05-20)

- `npm run build` is clean (70 modules, 256 KB JS, 7 KB CSS).
- Phases 0–6 done. Phase 7 components (SidePanel + all six modals + overlays) exist on disk.
- `SidePanel.tsx` already has:
  - A numeric Progress % input ([SidePanel.tsx:200-211](../src/components/panels/SidePanel.tsx#L200-L211))
  - A non-interactive progress bar visual ([SidePanel.tsx:214-216](../src/components/panels/SidePanel.tsx#L214-L216))
  - A "Reset to auto" button when manual flags are set ([SidePanel.tsx:218-224](../src/components/panels/SidePanel.tsx#L218-L224))
  - A Delete button in the footer with `color-danger` border ([SidePanel.tsx:427-441](../src/components/panels/SidePanel.tsx#L427-L441)) — visible but small and tucked left
- `TopBar.tsx`: baseline button already shows active baseline name and a subtle background tint ([TopBar.tsx:117-135](../src/components/topbar/TopBar.tsx#L117-L135)); the ⊕ capture button has only a `title` tooltip
- `exampleData.ts:40-41`: task `t-03` ("Earthworks & grading") sets `manualStatus: true, manualPct: true` while in-progress — this is the "feels locked" symptom
- `useOnboarding.ts` exists; onboarding skip-on-example-load is not implemented

---

## Tasks

Each task: target file, acceptance, and any guard rails. Implement in order — they're sized to land as a single PR each.

### T1 — Progress slider in SidePanel
**File:** `src/components/panels/SidePanel.tsx`

- Replace the static progress bar visual (lines ~214-216) with an interactive `<input type="range" min="0" max="100" step="1">` styled to match design tokens.
- Keep the numeric `<input type="number">` in the grid — slider and number stay in sync, both write to the same handler.
- Both controls must call `update({ pct: n, manualPct: true })` — slider drag = explicit user intent to override auto.
- Slider thumb uses `var(--accent)`; track uses `var(--color-border)` with a filled portion using `var(--accent)` (gradient or pseudo-element).
- Slider is keyboard-accessible (arrow keys move by 1, Shift+arrow by 10 is a browser default — leave it).
- Don't add any new state to App.tsx. Slider derives from `task.pct` like the existing number input.

**Acceptance:** Dragging the slider updates the percent in real time, sets `manualPct: true`, and the "Reset to auto" button appears.

---

### T2 — Make Delete visually prominent in SidePanel footer
**File:** `src/components/panels/SidePanel.tsx`

- Promote the Delete button from outline to filled destructive: background `var(--color-danger)`, color `white`, keep height 30, padding `0 14px`.
- Move it to the **right** side of the footer (after `<span flex:1>`) so it sits at the end of the user's read flow, not next to "Links."
- Keep the "Autosaves" hint — but move it to **before** the flex spacer (left side) so the footer reads: `[Links] [Autosaves]   ←spacer→   [Delete]`.
- Add a confirm step: on click, swap label to "Delete?" with a 3-second window to confirm or revert. **Do not** introduce a modal — inline confirmation only.
- Hover: subtle darken filter (`filter: brightness(0.92)`).

**Acceptance:** Delete is clearly the most prominent footer action, requires two clicks to fire, and respects undo (already wired via App.tsx — verify it still pushes to `undoStack`).

---

### T3 — Unlock in-progress example task
**File:** `src/lib/exampleData.ts:36-42`

- Change `t-03` to `manualStatus: false, manualPct: false`.
- Keep its `pct: 75` and `status: 'in_progress'` as starting values — they'll be respected on first load because there's no auto-calc that overrides existing values mid-range without a date trigger.
- Audit other example tasks: only **fully complete** tasks (`actualFinish` set + `pct: 100` + `status: 'complete'`) should keep `manualPct: true, manualStatus: true`. Anything else should be auto.

**Acceptance:** Loading example data shows t-03 in progress, but editing its status or progress doesn't require the "Reset to auto" button first. The "Reset to auto" button only appears when the user actively overrides.

---

### T4 — Top bar: label the baseline capture button
**File:** `src/components/topbar/TopBar.tsx:128-134`

- Replace the bare `⊕` glyph with `⊕ Capture` (or `+ Snapshot`). Pick the verb that's consistent with the BaselineMenu copy — check `BaselineMenu.tsx` first.
- Keep `title="Capture current schedule as a baseline"` for accessibility.
- When `activeBaseline` is set, the "◎ Baselines · {name}" button keeps its current highlighted background — that's good. Just verify the text contrast is ≥4.5:1 against `var(--brand)`.

**Acceptance:** A new user can identify the capture action without hovering.

---

### T5 — Prevent placeholder task spam
**Files:** `src/components/task-list/TaskList.tsx`, possibly `src/components/App.tsx`

- Investigate the current "+ New Task" flow first. Identify what makes it possible to create disposable tasks rapidly (likely: pressing N or clicking + immediately creates a row before any field is filled).
- Add a rule: if the previous-created task has `name === ''` (or `name === 'New Task'` placeholder) AND is unmodified by user input, **focus it instead of creating a new one**. Track this via a transient ref in App.tsx (`lastCreatedEmptyTaskId`), cleared as soon as the user types a real name or changes any field.
- Do not block N or + entirely — users may genuinely want multiple new tasks. The rule only fires when the prior task is still empty.

**Acceptance:** Hammering N five times in a row produces one new task focused for naming, not five blank rows.

---

### T6 — Polish Gantt week-mode header
**Files:** `src/components/gantt/GanttHeader.tsx`, possibly `src/lib/timeline.ts`

- Investigate which `dayPx` ranges trigger the "week" tier. Reproduce the crowding by zooming to that level with example data loaded.
- Two likely fixes (pick whichever matches the prototype):
  1. Add `min-width` constraints to week-tier cells so labels don't compress below readable width — overflow with ellipsis.
  2. Hide every other week label when dayPx falls below a threshold (e.g., `dayPx < 6`), keeping ticks but thinning text.
- Verify the today-line and current-day indicator remain visible and aligned. Test at every zoom level in `ZOOM_LEVELS`.

**Acceptance:** Week-mode labels never overlap; today indicator is always visible.

---

### T7 — Skip onboarding on example-data load
**File:** `src/hooks/useOnboarding.ts`, possibly the Setup Wizard / example-load entry point

- When the user clicks "Load example data" (find the entry point — likely SetupWizard or an empty-state CTA), set `onboardingPhase` directly to `complete`.
- This must be a one-way transition: a user who manually clears state after loading examples should NOT see onboarding replayed. (Persistence of `onboardingPhase` to localStorage already handles this.)
- Do not affect users who add their own first task — they still get `fresh → first_added → baseline_tip → complete` flow.

**Acceptance:** Loading example data goes straight into the app with no first-task pulse or baseline tip.

---

## Verification

After each task and before opening a PR:

1. `npm run build` — must pass with zero errors.
2. `npm run lint` — must pass with zero warnings.
3. `npm run type-check` — must pass.
4. `npm run dev` — manually exercise the affected flow.
5. Compare side-by-side with `handoff/MAKE Scheduling Tool v4.html` where applicable.
6. Check dark mode (`prefers-color-scheme: dark`) for any new visual element.
7. Verify localStorage `schedule-tool-v1` still loads + saves correctly.

After all tasks land:
- 500-task smoke test: paste 500 generated tasks via `EXAMPLE_TASKS` array expansion, verify scroll doesn't visibly stutter. (If it does, that's a v1.1 concern — don't fix here.)
- Ctrl+Z still undoes delete operations and CSV replace.

---

## Acceptance Criteria (v1.0 ship gate)

- [ ] All seven tasks above pass their individual acceptance checks
- [ ] `npm run build`, `lint`, `type-check` all clean
- [ ] No regressions in: task creation, edit, save/reload, baselines, dependencies, CSV export, print preview
- [ ] No hardcoded hex values introduced (all colors via design tokens)
- [ ] No new `any` types, no default exports, no magic numbers outside `constants.ts`

---

## Notes & Conventions

- Follow `CLAUDE.md` § Code Style: TypeScript strict, named exports, design tokens for all colors.
- Prefer **the smallest possible change** per task. Don't refactor surrounding code.
- Do NOT push to git unless explicitly asked.
- Do NOT modify the persistence schema or `PersistedState` shape — that's v1.1 territory (clarifications C1 and C2 still unresolved).
- If a task reveals a deeper issue, surface it in the PR description; don't bundle a fix into v1.0.

---

## Deferred (v1.1 — write a separate plan)

Once v1.0 ships, the v1.1 plan should address:
- Dependency edge objects: persist `type` and `lag` per edge (resolves C1) + `LinkBuilderModal` UX to edit them
- `ghostStyle` in `PersistedState` with `persistedSchemaVersion` + `migrateState()` (resolves C2)
- Actual-date validation policy (resolves C3 — advisory vs blocking)
- CSV import: schema validation, error reporting, undo correctness
- Task-list virtualization (`react-virtual` or manual windowing)
- Mobile bottom-sheet panel with drag-to-dismiss
- Print preview A3 layout pass
- CI: GitHub Actions skeleton, axe-playwright, coverage targets

---

**Last updated:** 2026-05-20
**Status:** Ready for build
