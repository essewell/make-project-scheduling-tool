# AGENT HANDOFF (v1.7 implementation active on branch)

## Last Touch
- Date: 2026-05-26
- Branch: `v1.7`
- Lane: Codex (implementation)
- Status: **ACTIVE — v1.7 Phase 0 in progress**

## What Landed This Session

- Pre-flight release closure actions completed:
  - Confirmed `origin/main` contains v1.6 merge commit `53e28cf`.
  - Created and pushed missing release tag `v0.6.0`.
  - Confirmed `origin/main:package.json` version is `0.6.0`.
  - Restored acceptable working tree state (only recurring `playwright-report/index.html` noise).
- Branch setup closed:
  - `v1.7` branch verified active and upstream configured (`origin/v1.7`).
- Phase `0.1` TopBar overflow restructure (blocking carry-over) implemented:
  - Moved `Phases`, `Parties`, `Resources`, `Change Orders` into a new `More` overflow menu.
  - Kept `Baselines`, `Quality`, and `Reports` in-line.
  - Added outside-click + `Escape` close behavior with focus return.
  - Added `data-testid` hooks for repeatable topbar density measurement.
- Documentation created:
  - `docs/topbar-density-v1.7.md`
  - `docs/v1.7-screenshots-topbar-1280.png`

## Current Gate State

- `npm.cmd run build` ✅
- `npm.cmd run lint` ✅
- `npm.cmd run type-check` ✅

## Decisions (Last 3)

1. Closed S13 blockers directly (tag + branch upstream + tree hygiene) instead of working around pre-flight failures.
2. Implemented a keyboard-accessible overflow menu in `TopBar` rather than reducing labels or shrinking hit targets.
3. Measured 1280px density as actions-cluster footprint over full topbar width for reproducible pass/fail reporting.

## Next Actions

1. Finish Phase `0.2` and `0.3` docs (`mobile-qa` defer entry + perf baseline re-measure note).
2. Append Phase 0 entries to `.claude/plan-v1.7.md` §17.
3. Commit Phase 0 slice (including `.claude` updates) before starting Phase A.

## Working Tree Snapshot

- Modified:
  - `.claude/AGENT-HANDOFF.md`
  - `.claude/CLAUDE.md`
  - `.claude/version-status.md`
  - `src/components/topbar/TopBar.tsx`
  - `src/lib/icons.ts`
- New:
  - `docs/topbar-density-v1.7.md`
  - `docs/v1.7-screenshots-topbar-1280.png`
- Allowed noise remains unstaged:
  - `playwright-report/index.html`
## Phase A Update (2026-05-26)

- Completed Phase A (A.1-A.8):
  - Schema/type extensions for v1.7 (`PERSISTED_SCHEMA_VERSION = 4`, Task/Group WBS + actualCost fields, DCMA check IDs 15/16).
  - Added pure libs: `wbs.ts`, `rollups.ts`, `actualCost.ts`.
  - Added unit suites: `wbs.test.ts`, `rollups.test.ts`, `actualCost.test.ts`.
  - Added v1.7 WBS spec doc: `docs/wbs.md`.
  - Updated storage unit assertions from v3->v4 expectations.
- Verification:
  - `npm.cmd run lint` ✅
  - `npm.cmd run type-check` ✅
  - `npm.cmd run test:unit` ✅ (sequential runner)
- Last 3 decisions:
  1. Keep WBS/rollup/actual-cost modules pure and independent to preserve lib boundary.
  2. Treat orphan group parents as top-level during WBS computation for deterministic codes.
  3. Keep `test:unit` sequential to avoid historic worker-exit hangs.
- Next 2 actions:
  1. Start Phase B migration wiring in `storage.ts` (v3->v4 defaulting + WBS stamping).
  2. Add migration regression tests for round-trip safety.
## Phase B Update (2026-05-26)

- Completed Phase B migration wiring:
  - Added v3->v4 normalization in storage load path:
    - `Group.parentId` defaulting
    - `Task.actualCost` defaulting
    - WBS stamp for groups/tasks
  - Added deterministic WBS stamping in save path for current tasks and baseline snapshot tasks.
  - Added/updated storage migration tests for v4 behavior and round-trip safety.
- Verification:
  - `npm.cmd run lint` ✅
  - `npm.cmd run type-check` ✅
  - `npm.cmd run test:unit` ✅
- Last 3 decisions:
  1. Recompute and stamp WBS on both `loadState` and `saveState` to guarantee consistency.
  2. Keep baseline task WBS synchronized by stamping baseline task arrays using the same group tree.
  3. Normalize legacy payloads defensively before stamping to prevent `undefined` drift.
- Next 2 actions:
  1. Start Phase C App.tsx wiring for WBS-aware derived state and rollup integration.
  2. Begin TaskList WBS column + group indentation integration in Phase D.
## Phase C Update (2026-05-26)

- Completed Phase C App wiring:
  - Added App-level memoized hierarchy derivations:
    - `groupNodes = walkGroupTree(groups)`
    - `groupRollups` map (memoized, ready for Phase D surface wiring)
    - `totalActualCost = computeTotalActualCost(enrichedTasks)`
  - Rewrote `visibleRows` to tree-order traversal based on group hierarchy depth instead of flat task-first grouping.
  - Preserved collapsed-group behavior while rendering depth/WBS metadata on group rows.
  - Wired EVM memo to consume `totalActualCost` and updated `computeEVM` to accept AC input and compute CPI.
- Verification:
  - `npm.cmd run lint` ✅
  - `npm.cmd run type-check` ✅
  - `npm.cmd run test:unit` ✅
- Last 3 decisions:
  1. Keep group rollups memoized in App even before TaskList consumption (Phase D).
  2. Keep orphaned tasks visible by appending ungroupped rows after tree render.
  3. Move AC/CPI compute hook-up earlier to remove fake dependencies and keep lint strict.
- Next 2 actions:
  1. Phase D: TaskList WBS column and group indentation/rollup pill rendering.
  2. Phase E: SidePanel actual-cost input section wiring.
## Phase D Update (2026-05-26)

- Completed Phase D TaskList structural UI work:
  - WBS column width widened from 24px to 48px.
  - Switched WBS rendering from transient `computeWbs` helper to persisted `row.wbsCode` / `task.wbsCode`.
  - Added depth-based indentation for group/task rows.
  - Added group indentation connector rule.
  - Added monospaced rollup pill on group rows (`tasks · % · cost · resources`).
  - Wired App-provided `groupRollups` into TaskList.
- Verification:
  - `npm.cmd run lint` ✅
  - `npm.cmd run type-check` ✅
  - `npm.cmd run test:unit` ✅
- Last 3 decisions:
  1. Keep rollup pill compact and text-only (no icon/RAG treatments).
  2. Derive task indentation depth from visible group depth map to match tree state.
  3. Preserve orphan-task rendering fallback after tree pass.
- Next 2 actions:
  1. Phase E: add SidePanel actual-cost section with blur-save behavior.
  2. Phase F: extend GroupsManager for parent picker and cycle prevention.

## Phase E Update (2026-05-26)

- Completed Phase E SidePanel WBS + AC surface:
  - Added `SidePanelWbsBreadcrumb` component to render task WBS code + group path context.
  - Added `SidePanelActualCostSection` component with local draft state, blur-save commit, and parse guard (`NaN`/negative rejected with field reset).
  - Wired both into `SidePanel.tsx` header/body and connected AC commits through existing `onUpdateTask` patch flow.
  - Enforced disabled-with-advisory state when no resource assignments exist.
- Verification:
  - `npm.cmd run lint` ✅
  - `npm.cmd run type-check` ✅
  - `npm.cmd run test:unit` ✅
- Last 3 decisions:
  1. Keep AC editing local until blur to avoid EVM recompute churn on each keystroke.
  2. Disable AC entry when assignments are absent and show explicit advisory copy.
  3. Keep WBS breadcrumb read-only and derived from persisted task/group hierarchy.
- Next 2 actions:
  1. Phase F: extend GroupsManager with parent picker, cycle prevention, and depth advisory.
  2. Phase G: implement DCMA checks 15/16 and unit coverage.

## Phase F Update (2026-05-26)

- Completed Phase F GroupsManager hierarchy controls:
  - Added parent-phase picker for each group row.
  - Added cycle prevention by excluding self and descendants from parent options.
  - Added depth advisory warning when selected nesting reaches configured threshold.
  - Added schema-safe defaults for newly created groups (`parentId: null`, `wbsCode: ''`).
  - Added shared constant `GROUP_NEST_DEPTH_WARN = 6`.
- Verification:
  - `npm.cmd run lint` ✅
  - `npm.cmd run type-check` ✅
  - `npm.cmd run test:unit` ✅
- Last 3 decisions:
  1. Enforce cycle prevention at selection time rather than post-save validation.
  2. Keep depth warning advisory-only, not blocking, per plan intent.
  3. Keep hierarchy logic local to GroupsManager (no new runtime deps).
- Next 2 actions:
  1. Phase G: implement DCMA checks 15/16 in `dcma.ts`.
  2. Extend `dcma.test.ts` with pass/fail fixtures for new checks.
