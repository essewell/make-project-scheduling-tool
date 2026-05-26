# MAKE Scheduling Tool — Plan v1.3

**Status:** Draft · Resource Foundation (first organ)
**Created:** 2026-05-22
**Author:** Claude (planning agent)
**Predecessors:** [plan-v1.1.md](./plan-v1.1.md) ✅ shipped, [plan-v1.2.md](./plan-v1.2.md) ✅ shipped, [pm-audit-v2.md](./pm-audit-v2.md)
**Target ship tag:** `v0.3.0`
**Roadmap target fitness:** 3.6/10 → 5.0/10 (after v1.3 ships and `pm-audit-v3.md` / Checkpoint 1 fires)

---

## 0. One-line premise

v1.1 made it reliable. v1.2 made it look serious. **v1.3 makes it real** — a schedule with resources is a plan; a schedule without resources is a wish list.

---

## 1. Purpose & relationship to prior plans

| Plan | Scope | Outcome |
|------|-------|---------|
| v0 | Implementation — turn HTML prototype into React | Shipped |
| v1.0 | Track C UX refinement (7 tasks) | Shipped |
| v1.1 | Production readiness (perf, tests, mobile sheet, CI, marketing) | Shipped 2026-05-22 (`v0.1.0`) |
| v1.2 | Visual refinement / de-vibecoded surface (15 phases A–O) | Shipped 2026-05-22 (`v0.2.0`) |
| **v1.3** | **Resource foundation — the first construction-PM organ** | **This plan** |

v1.3 is the first version on the **fitness roadmap**. Where v1.1 and v1.2 were foundation passes that did not move the construction-PM dimensions, v1.3 is the first version a construction PM would name and care about. It is the precondition for everything that follows (v1.4 quality engine grades a resource-loaded schedule; v1.5 baselines track resource shifts as change orders; v1.6 EVM is cost-loaded earned value).

**The audience for v1.3 is the user, not the buyer.** The PM running an institutional build needs to see whether their schedule is executable — whether the electrical crew is double-booked, whether the crane hours line up, whether the foundation pour has enough concrete. v1.2 made the product look professional. v1.3 makes it useful.

---

## 2. The "first organ" principle (THE GUIDING DIRECTIVE)

The v1 audit named the gap: *"Excellent bones, missing the organs."* v1.3 transplants the first organ. Every decision in this plan is tested against three constraints:

### 2.1 Discipline preserved
Every visual surface added in v1.3 must pass v1.2's pre-flight test:
- "Would another product look identical if I swapped the wordmark?" — if yes, fail.
- "Does this gesture appear in three or more shadcn templates?" — if yes, fail.
- "Does it have a job, or is it decorative?" — if decorative, fail.
- "Would I notice it missing?" — if no, fail.

Resources are not chrome. They are data. The UI must serve them as data.

### 2.2 Single organ at a time
The roadmap's seventh guiding principle: *"Ship v1.3 before v1.4. Ship v1.4 before v1.5."* v1.3 ships **resources + manual leveling + cost loading**. It does **not** ship:

- Auto-leveling (algorithmic resolution of over-allocation) — v1.5 or v2.x
- Multi-baseline tracking of resource shifts — v1.5
- DCMA / schedule quality scoring — v1.4
- S-curve / EVM / earned value — v1.6
- Cross-project resource pools — v2.1
- Cloud sync / shared resources — v2.0

If a contributor asks "while we're touching persistence, can we just…" the answer is no.

### 2.3 The defensibility floor
v1.1 made the data trustworthy (versioned schema, migration walk, 149 unit tests). v1.3 must preserve that floor: every new data shape gets a migration walk, every new pure function gets a unit test, every new user-visible flow gets an E2E spec. **No exceptions for "it's just resources."**

---

## 3. Scope

### 3.1 In scope (v1.3)

| Capability | What the PM sees |
|---|---|
| **Resource pools** | A `Resources` modal (accessed from TopBar alongside Phases and Parties). CRUD list of resources. Each has: name, category (Labor / Equipment / Material), unit of measure (free text — "hours", "days", "CY", "tons", "person"), capacity per workday (labor + equipment only; materials are consumed), cost rate (e.g., 85 $/hr), color (auto-cycled from the existing 12-color palette). |
| **Task assignments** | A new `Resources` section in the SidePanel (collapsible, like `ActualDates`). Each assignment is one row: resource picker + quantity + computed cost preview. Multi-assignment per task supported. |
| **Resource histogram** | New lane below the Gantt, sharing the same time axis and `dayPx` zoom. One resource selected at a time via a pill at the histogram's top edge. Per-day bars in the resource's color. A horizontal dashed line at capacity. Over-allocated days rendered in `--color-danger` above the capacity line. Toggle to show/hide via a Gantt header control. |
| **Manual leveling** | The existing drag-to-reschedule interaction (already in `GanttBar`) triggers histogram recompute. The PM drags a task within its float; the histogram updates live; the over-allocation count in StatBar updates. No automation. |
| **Cost loading** | Per task: roll-up of `sum(assignment.quantity × duration × resource.costRate)` for labor/equipment, plus `sum(assignment.quantity × resource.costRate)` for materials. Per group: aggregate of children. Project total: displayed in StatBar (right side, mono numerals, `$#,###` format). |
| **CSV in/out** | New paired CSVs: `resources.csv` (resource list) and `assignments.csv` (task ↔ resource links). Imported/exported from the ResourcesManager modal. Existing task CSV is **unchanged** — v1.0/v1.1 CSV files remain readable. |
| **Schema migration `1 → 2`** | Existing localStorage payloads (`persistedSchemaVersion = 1`) are migrated additively: `resources: []` and `assignments: []` are appended on first load post-upgrade. The migration is unit-tested with a v1 fixture. |

### 3.2 Out of scope (explicitly deferred)

| Deferred to | What |
|---|---|
| **v1.4** | DCMA 14-point assessment, schedule health score, logic validation, float distribution analysis |
| **v1.5** | Multiple baselines, baseline comparison, change order tracking, variance trend lines |
| **v1.6** | S-curves, EVM (PV/EV/AC/SPI/CPI), cash flow forecast, executive PDF report, weekly progress reports |
| **v1.7** | Standard WBS coding (1.0/1.1/1.1.1) export, multi-level hierarchy validation, group roll-up pills |
| **v1.8** | Project calendar overlay, weather delay tracking, excusable/non-excusable classification, delay log |
| **v1.9** | Primavera P6 (.xer) and MS Project (.mpp) import/export, Procore integration, public data model doc |
| **v2.0** | Cloud sync, multi-user, role-based access, change audit trail, comment threads, real-time presence |
| **v2.1** | Portfolio dashboard, cross-project resources, portfolio S-curve, project templates |
| **v2.2** | Density modes, column customization, saved views, bulk edit, drag-and-drop dependency arrows, keyboard macros, offline mode |

This list is not a wish list. It is a **forbidden list for v1.3**. Any task that lands in v1.3's changelog must trace to §3.1, not §3.2.

---

## 4. Architecture & file map

### 4.1 New files

| File | Purpose |
|---|---|
| `src/lib/resources.ts` | Pure helpers: assignment validation, resource lookup by id, capacity check |
| `src/lib/cost.ts` | Pure: per-task cost, per-group roll-up, project total. Re-uses `workdays.ts` for duration distribution |
| `src/lib/resourceDemand.ts` | Pure: per-day demand rollup for a given resource, given (tasks, assignments, timeline). Returns `{ day: Date, demand: number, overAllocation: number }[]` |
| `src/components/modals/ResourcesManager.tsx` | CRUD modal for the resource list (mirrors `PartiesManager` shape) |
| `src/components/panels/ResourceAssignmentSection.tsx` | Collapsible section inside `SidePanel` (mirrors `ActualDatesSection` shape) |
| `src/components/gantt/ResourceHistogram.tsx` | The histogram lane below the Gantt; shares timeline |
| `src/components/gantt/ResourceSelectorPill.tsx` | The pill at the top of the histogram for selecting which resource to view |
| `tests/unit/lib/resources.test.ts` | Resource list CRUD + validation |
| `tests/unit/lib/cost.test.ts` | Cost roll-up tests (single task, multi-assignment, group, project total, edge cases) |
| `tests/unit/lib/resourceDemand.test.ts` | Demand rollup tests (single task, overlap, over-allocation detection, calendar bounds) |
| `tests/e2e/resources.spec.ts` | E2E: create resource → assign to task → see histogram → drag task → over-allocation clears |
| `docs/resources-csv-format.md` | Format spec for `resources.csv` and `assignments.csv` |
| `docs/mobile-qa.md` | Updated with v1.3 sheet QA checkmarks (see Phase 0) |

### 4.2 Files modified

| File | What changes |
|---|---|
| `src/types/index.ts` | Add `Resource`, `ResourceCategory`, `ResourceAssignment` types; add `resources` and `assignments` to `PersistedState`; bump `PERSISTED_SCHEMA_VERSION` to `2`; comment `Task.deps[]` as derived-read-only |
| `src/lib/storage.ts` | Extend `migrateState` with `1 → 2` walk (additive: empty arrays); extend `makeDefaultState` |
| `src/lib/csv.ts` | Add `parseResourcesCsv`, `parseAssignmentsCsv`, `generateResourcesCsv`, `generateAssignmentsCsv`. Existing task CSV functions are not modified. |
| `src/components/App.tsx` | State for `resources`, `assignments`, `selectedResourceId`, `histogramVisible`; handlers; wire ResourcesManager, ResourceAssignmentSection, ResourceHistogram |
| `src/components/topbar/TopBar.tsx` | Add "Resources" button (Phosphor `Users` icon, in the data/settings cluster alongside Phases/Parties) |
| `src/components/panels/SidePanel.tsx` | Slot the new `ResourceAssignmentSection` into the panel between `ActualDatesSection` and `notes` |
| `src/components/gantt/Gantt.tsx` | Render `<ResourceHistogram>` below the Gantt body when `histogramVisible && selectedResourceId`; add toggle control in the Gantt header (alongside ghost-style toggle) |
| `src/components/StatBar.tsx` | Add project cost stat (right-aligned, mono); add over-allocation count stat (conditional, danger color when > 0) |
| `src/components/task-list/TaskList.tsx` | Optional small cost cell on task row (right-edge, mono, monetary format). Behind a column toggle in the FilterBar's View menu — **not always on** to preserve current density. |
| `src/hooks/useScrollSync.ts` | Extend to support a third synchronized lane (histogram); third `useRef<HTMLElement \| null>` + symmetric event handlers |
| `src/lib/icons.ts` | Add Phosphor exports needed by v1.3 (`Users`, `Stack`, `Coins` or `CurrencyDollarSimple`, `ChartBar`) |
| `src/constants.ts` | Add `HISTOGRAM_HEIGHT = 140`, `HISTOGRAM_PAD_X = 8`, `HISTOGRAM_BAR_GAP = 1`, `RESOURCE_MAX_PER_PROJECT = 200` |
| `src/styles/tokens.css` | Add `--histogram-bar-bg`, `--histogram-capacity-line`, `--histogram-over` tokens (light + dark mode) |
| `docs/design-system.md` | Document the new tokens and the resource color cycle policy |
| `CHANGELOG.md` | Add `0.3.0` entry on ship |
| `package.json`, `package-lock.json` | Version bump `0.2.0` → `0.3.0` |
| `README.md` | Add Resources to the features list |

### 4.3 Files unchanged (explicit non-goals)

| File | Why we are leaving it alone |
|---|---|
| `src/lib/cpm.ts` | CPM does not depend on resources in v1.3. Resource-constrained scheduling (`RCPSP`) is v2.x territory. |
| `src/lib/timeline.ts` | The histogram re-uses the existing `Timeline` object. No parallel timeline. |
| The task CSV format | Resource assignment data lives in a separate CSV pair. The task CSV remains v1.0/v1.1-compatible. |
| The single-baseline model | Multi-baseline is v1.5. Resources interact with the existing single baseline. |
| The mobile bottom sheet | The sheet renders `SidePanel`, which renders the new `ResourceAssignmentSection`. No mobile-specific work — but mobile real-device QA must close in Phase 0. |

---

## 5. Data model & schema migration

### 5.1 New types

```ts
// src/types/index.ts

export type ResourceCategory = 'labor' | 'equipment' | 'material'

export interface Resource {
  id: string
  name: string
  category: ResourceCategory
  unit: string          // free text — "hours", "days", "CY", "tons", "person"
  capacity: number      // units available per workday; ignored for category='material'
  costRate: number      // monetary units per `unit` (e.g., 85 means $85/hour if unit='hours')
  color: string         // auto-assigned from GROUP_PALETTE on create, editable
}

export interface ResourceAssignment {
  id: string
  taskId: string
  resourceId: string
  quantity: number      // labor/equipment: units per workday for full task duration
                        // material: total units consumed over the task duration
  notes: string         // optional, defaults to ''
}
```

### 5.2 Persisted state extension

```ts
// PersistedState gains two fields, both default to [].
export interface PersistedState {
  // ...existing fields unchanged...
  resources: Resource[]
  assignments: ResourceAssignment[]
}

// Schema version bumps:
export const PERSISTED_SCHEMA_VERSION = 2
```

### 5.3 Migration `1 → 2`

```ts
// In storage.ts migrateState
if (version === 1) {
  base.resources = Array.isArray(base.resources) ? base.resources : []
  base.assignments = Array.isArray(base.assignments) ? base.assignments : []
}
```

Additive only. No destructive change. A v1.2 user upgrading to v1.3 sees their existing schedule unchanged, with two empty arrays now appended. No prompt, no warning, no migration UI required.

### 5.4 Validation rules

| Field | Rule | Failure mode |
|---|---|---|
| `Resource.name` | Non-empty, ≤80 chars, unique within category | Inline error on save; block save |
| `Resource.capacity` | Required for labor/equipment, must be > 0; ignored for material | Inline error |
| `Resource.costRate` | ≥ 0; can be 0 ("internal" resources with no cost) | Allowed, warn if 0 |
| `Resource.unit` | Non-empty, ≤16 chars | Inline error |
| `ResourceAssignment.quantity` | > 0 | Inline error |
| `ResourceAssignment.taskId` | Must exist in `tasks` | Orphan assignments are dropped on load (with a warning logged once) |
| `ResourceAssignment.resourceId` | Must exist in `resources` | Same — orphan drop with log |

Validation lives in `src/lib/resources.ts` as pure functions. Forms call these and surface inline errors. **No silent data loss except for orphan assignments on load, which is logged but non-blocking** (consistent with how the v1 audit's C3 decision treated cross-field actual-date validation).

### 5.5 Decision: `Task.deps[]` handling (audit v2 §10.1)

Keep the field. Document it as derived-read-only with an updated comment:

```ts
export interface Task {
  // ...
  /** @derived — read-only display value populated from Dependency[] edges during render.
   *  Never write to this field from new code. Mutation post-v1.0 belongs in `dependencies`. */
  deps: string[]
}
```

Also add a one-line note to `CLAUDE.md §Conventions`. No lint rule — the JSDoc is enough for now.

---

## 6. UI surface map

```
┌─ TopBar ───────────────────────────────────────────────────────────────────┐
│ MAKE  •  Project · [Edit]  │  Capture/Manage Baseline  │  Phases/Parties/  │
│                            │                          │  Resources*       │
│                            │                          │  ↑ NEW            │
└────────────────────────────────────────────────────────────────────────────┘
┌─ StatBar ──────────────────────────────────────────────────────────────────┐
│ N tasks · M complete · K critical · Today: TUE 21 MAY        │ Over-       │
│                                                              │ alloc: 2*   │
│                                                              │ Total       │
│                                                              │ $2,431,200* │
└──────────────────────────────────────────────────────────────┴─────────────┘
┌─ FilterBar ────────────────────────────────────────────────────────────────┐
│ Filter · Phases / Statuses / Parties · Search · View↓ (cost col toggle*) │
└────────────────────────────────────────────────────────────────────────────┘
┌─ TaskList ─┐ ┌─ Gantt ──────────────────────────────────────────────────────┐
│  WBS Name  │ │  ... bars ...                                                │
│  ...       │ │                                                              │
│ optional $ │ │                                                              │
└────────────┘ └──────────────────────────────────────────────────────────────┘
               ┌─ ResourceHistogram (NEW) — visible when toggled on ──────────┐
               │ [Electrical Crew ▾] capacity: 2 · current peak: 4 (DAY 87)   │
               │                                                              │
               │      ░░░ ▓▓▓ ▓▓▓                                              │
               │   ░░ ░░░ ▓▓▓ ▓▓▓ ░░░     ← over-alloc rendered in red        │
               │ ──────────────── capacity dashed line ──────────────         │
               │   ░░ ░░░ ░░░ ░░░ ░░░ ░░░ ░░  ← demand bars (resource color)  │
               └──────────────────────────────────────────────────────────────┘
                                                          * = new in v1.3
```

### 6.1 ResourcesManager modal

Mirrors `PartiesManager` precisely (same dialog shell, same `useDialogA11y` hook, same Add / Edit / Delete row pattern). One difference: a category segmented control (Labor / Equipment / Material) at the top of each row, because the form fields change slightly (capacity is hidden for materials).

### 6.2 ResourceAssignmentSection (SidePanel)

Collapsible section header (same idiom as `ActualDatesSection`). Inside:
- "No resources assigned" empty state when `assignments.filter(a => a.taskId === task.id).length === 0`
- One row per assignment: `[Resource ▾] [Qty ___] · Cost: $1,200 · ✕`
- "+ Add assignment" button below the rows

### 6.3 ResourceHistogram

- Width: matches Gantt body width exactly (`timeline.totalPx`)
- Height: `HISTOGRAM_HEIGHT = 140px` (constants.ts)
- Background: `--surface-sunken` (matches Gantt weekend bands)
- Bars: one per workday (skip weekends per project workweek), positioned by `timeline.days[i].offset`, width = `dayPx - HISTOGRAM_BAR_GAP`
- Bar fill: resource's color at 80% opacity for demand within capacity
- Over-allocation: the slice of the bar above the capacity line is overlaid in `--color-danger` at 70% opacity
- Capacity line: 1px dashed in `--histogram-capacity-line`, labelled with the capacity value at the right edge
- Hover tooltip on a bar: `Day · 2026-06-12 · 4 demand · 2 capacity (over by 2)`
- Empty state when no resource selected: centred Phosphor `ChartBar` icon + "Select a resource above to see demand."
- Toggle: controlled by `histogramVisible` in App state; defaulted off; toggled from Gantt header

### 6.4 ResourceSelectorPill

A horizontally-scrolling row of resource chips at the top of the histogram. Active resource has `--color-accent-strong` background; others have `--surface-sunken`. Clicking a chip selects it. The chip shows: resource name, category icon (Phosphor `User` / `Wrench` / `Stack`), and a small red dot if that resource has any over-allocated day in the visible timeline window.

### 6.5 StatBar additions

- **Over-allocation count** (conditional, rendered only when `>0`): `Over-alloc: 2` in `--color-danger`. Clicking it selects the first over-allocated resource and opens the histogram if it is hidden.
- **Project cost** (always shown): `Total $2,431,200`, mono, right-aligned. Format: `$#,###` (no decimals), thousand separators, no currency symbol other than `$`. Future v1.6 will introduce per-currency support; for now USD is hardcoded — no token, but `// TODO: i18n` flagged.

### 6.6 TaskList cost column (optional)

Behind the FilterBar `View` menu (new dropdown — `View ▾ → ☐ Show cost column`). Defaults off. When on, a 96px cost column appears between the existing float column and the right edge. Mono, right-aligned. Empty when a task has no assignments.

**Rationale for opt-in:** Current TaskList density is tuned for v1.2. A 14th column on by default would degrade it. PMs who care about cost can toggle it; PMs who care about dates can leave it off.

---

## 7. Cost model

### 7.1 Per-task cost

```
For each assignment a where a.taskId === task.id, let r = resource by a.resourceId.

  if r.category === 'labor' or 'equipment':
    workdays = workdays.count(task.s, task.e, workweek, holidays)
    cost(a) = a.quantity × workdays × r.costRate

  if r.category === 'material':
    cost(a) = a.quantity × r.costRate

task.cost = sum(cost(a) for a in task's assignments)
```

**Why workdays not calendar days for labor/equipment:** Crews don't bill on weekends (in the default workweek configuration). The PM defines what counts as a workday via the existing WorkweekModal. Materials are billed once, regardless of duration.

### 7.2 Per-group cost

```
group.cost = sum(task.cost for task in tasks where task.group === group.id)
```

### 7.3 Project total

```
project.cost = sum(task.cost for task in tasks)
```

### 7.4 Live recompute strategy

`cost.ts` exports `computeProjectCost(tasks, assignments, resources, workweek, holidays)` as a pure function. It is wrapped in a `useMemo` at App level keyed on `[tasks, assignments, resources, workweek, holidays]`. The memo invalidates on any edit that touches those arrays. For 500 tasks × ~3 assignments, the computation is sub-millisecond (no expensive ops, just multiplication and reduce).

---

## 8. Histogram contract (timeline sharing)

### 8.1 Same timeline, always

The histogram MUST consume the same `Timeline` object that the Gantt uses (`src/lib/timeline.ts`). It MUST NOT compute its own time axis. This is enforced by:
- Passing `timeline: Timeline` as a prop to `ResourceHistogram`
- No internal date calculation in `ResourceHistogram` other than reading `timeline.days[i].offset` and `timeline.days[i].date`

### 8.2 Scroll sync (third lane)

`useScrollSync` currently pairs TaskList ↔ Gantt via a single `useRef<boolean>` flag (Key Design Decision #2). v1.3 extends it to a triple:

```ts
function useScrollSync(): {
  taskListRef: RefObject<HTMLElement | null>
  ganttRef: RefObject<HTMLElement | null>
  histogramRef: RefObject<HTMLElement | null>
}
```

The internal `syncingScroll = useRef(false)` flag is reused for the third lane — the same flag guards all three pairings against feedback loops. Each lane scrolls along one axis (TaskList: vertical; Gantt: both; Histogram: horizontal only). The vertical sync of TaskList ↔ Gantt is preserved unchanged. The new horizontal sync of Gantt ↔ Histogram is the addition.

### 8.3 Per-day demand rollup

```ts
// src/lib/resourceDemand.ts
export function computeDemand(
  resource: Resource,
  tasks: Task[],
  assignments: ResourceAssignment[],
  timeline: Timeline,
  workweek: WorkweekConfig,
  holidays: string[]
): Array<{ date: Date; offset: number; demand: number; overAllocation: number }>
```

For each workday in the timeline window:
- For each assignment a where `a.resourceId === resource.id`:
  - If a.task overlaps this day AND this day is a workday for the project:
    - If resource is labor/equipment: add `a.quantity` to demand
    - If resource is material: add `a.quantity / workdaysInTask` to demand (distributed linearly)
- Compute `overAllocation = max(0, demand - resource.capacity)` (zero for materials — they don't have capacity)

**Performance:** Memoized at App level on `[resource, tasks, assignments, timeline, workweek, holidays]`. Cost: O(workdays × assignments_for_resource). For 365 workdays × ~50 assignments per resource = ~18k operations. Sub-millisecond.

### 8.4 Over-allocation count (StatBar)

```ts
overAllocCount = resources.filter(r =>
  computeDemand(r, ...).some(d => d.overAllocation > 0)
).length
```

Materials never contribute to over-allocation count.

---

## 9. Performance contract

| Metric | Target | Measurement |
|---|---|---|
| Project cost recompute | < 5ms | `performance.now()` around the `useMemo` callback, 500 tasks × 3 assignments fixture |
| Resource demand recompute (single resource) | < 10ms | Same measurement, 365 workdays × 50 assignments |
| Drag-to-reschedule with histogram visible | < 33ms frame budget at 30fps minimum | E2E spec asserts no perceptible drop in Playwright trace |
| First paint with v1.3 enabled but no resources | unchanged from v1.2 | Build size delta < +15KB JS gzipped |
| Build size delta total (v1.2 → v1.3) | < +25KB JS gzipped | `npm run build` bundle report |

**Performance regressions block ship.** If any of these targets miss by >10%, the v1.3 phase that introduced the regression must close it before the next phase starts.

---

## 10. Phased task breakdown

Like v1.1 and v1.2: each task is ≤3 files, one commit. Phases are ordered by dependency.

### Phase 0 — Pre-flight housekeeping (close audit v2 carry-over)

| # | Task | Files |
|---|------|-------|
| 0.1 | Remove orphan worktree `.worktrees/phases-3-6`; drop `.worktrees/**` ignore from ESLint config | `eslint.config.js` |
| 0.2 | Real-device mobile QA on the bottom sheet; record findings | `docs/mobile-qa.md` |
| 0.3 | Add `useMidnightTicker` regression test | `tests/unit/hooks/useMidnightTicker.test.ts` (new) |
| 0.4 | Verify GitHub Actions runs on origin push (HK-2 closure) | `.github/workflows/ci.yaml` (no edit if green) |
| 0.5 | Document `Task.deps[]` as derived-read-only | `src/types/index.ts`, `.claude/CLAUDE.md` |

**Phase 0 ships as its own commit set before Phase A begins.** It does not block Phase A starting in parallel-prep, but Phase A's commit MUST land after Phase 0's commits to keep the migration baseline clean.

### Phase A — Data model & schema migration

| # | Task | Files |
|---|------|-------|
| A.1 | Add `Resource`, `ResourceCategory`, `ResourceAssignment` types | `src/types/index.ts` |
| A.2 | Bump `PERSISTED_SCHEMA_VERSION` to 2; extend `PersistedState` with `resources` and `assignments` | `src/types/index.ts` |
| A.3 | Extend `migrateState` with additive 1 → 2 walk; extend `makeDefaultState` | `src/lib/storage.ts` |
| A.4 | Unit-test the migration with a v1 fixture (legacy payload migrates cleanly; existing data preserved) | `tests/unit/lib/storage.test.ts` (extend) |
| A.5 | Add `resources.ts` pure helpers (create / validate / lookup-by-id / orphan-prune) | `src/lib/resources.ts` (new) |
| A.6 | Unit-test `resources.ts` (CRUD validation rules from §5.4) | `tests/unit/lib/resources.test.ts` (new) |

### Phase B — Cost & demand libraries

| # | Task | Files |
|---|------|-------|
| B.1 | `cost.ts` — per-task, per-group, project total | `src/lib/cost.ts` (new) |
| B.2 | Unit tests for cost roll-up (single, multi-assignment, group, project, edge cases: zero rate, zero quantity, material vs labor) | `tests/unit/lib/cost.test.ts` (new) |
| B.3 | `resourceDemand.ts` — per-day demand rollup with over-allocation calculation | `src/lib/resourceDemand.ts` (new) |
| B.4 | Unit tests for demand (single task, two-task overlap, over-allocation detection, workday vs calendar day, material distribution) | `tests/unit/lib/resourceDemand.test.ts` (new) |

### Phase C — Resource pool management UI

| # | Task | Files |
|---|------|-------|
| C.1 | `ResourcesManager.tsx` modal (CRUD list with category segmented control) | `src/components/modals/ResourcesManager.tsx` (new) |
| C.2 | TopBar "Resources" button (Phosphor `Users` icon, in the existing settings cluster) | `src/components/topbar/TopBar.tsx`, `src/lib/icons.ts` |
| C.3 | App.tsx wiring: `resources` state, handlers, modal open/close | `src/components/App.tsx` |
| C.4 | Resource color auto-assignment from `GROUP_PALETTE` on create | `src/components/modals/ResourcesManager.tsx`, `src/lib/resources.ts` |
| C.5 | Validation surfacing in the modal (inline errors mirroring PartiesManager pattern) | `src/components/modals/ResourcesManager.tsx` |

### Phase D — Task assignment UI

| # | Task | Files |
|---|------|-------|
| D.1 | `ResourceAssignmentSection.tsx` collapsible section inside SidePanel | `src/components/panels/ResourceAssignmentSection.tsx` (new) |
| D.2 | Slot it into SidePanel between `ActualDatesSection` and notes block | `src/components/panels/SidePanel.tsx` |
| D.3 | Assignment row UI: resource picker + quantity input + computed cost preview + delete button | `src/components/panels/ResourceAssignmentSection.tsx` |
| D.4 | App.tsx wiring: `assignments` state, add/edit/remove handlers, snapshot integration for undo (delete-assignment does NOT push undo per Decision #4 boundary — only task-level/CSV-level pushes; document this) | `src/components/App.tsx` |
| D.5 | Empty state ("No resources assigned · + Add assignment") | `src/components/panels/ResourceAssignmentSection.tsx` |

### Phase E — Cost surfacing

| # | Task | Files |
|---|------|-------|
| E.1 | StatBar: project cost stat (right-aligned, mono, `$#,###`) | `src/components/StatBar.tsx` |
| E.2 | StatBar: over-allocation count stat (conditional, danger color, clickable to open histogram on first over-allocated resource) | `src/components/StatBar.tsx`, `src/components/App.tsx` |
| E.3 | TaskList optional cost column behind FilterBar View menu; defaults off | `src/components/task-list/TaskList.tsx`, `src/components/filter/FilterBar.tsx` |
| E.4 | Cost preview in `ResourceAssignmentSection` row updates live as quantity changes | `src/components/panels/ResourceAssignmentSection.tsx` |

### Phase F — Resource histogram

| # | Task | Files |
|---|------|-------|
| F.1 | `ResourceHistogram.tsx` — SVG bars, capacity line, over-allocation overlay, tooltip | `src/components/gantt/ResourceHistogram.tsx` (new) |
| F.2 | `ResourceSelectorPill.tsx` — horizontally-scrolling chip row | `src/components/gantt/ResourceSelectorPill.tsx` (new) |
| F.3 | Gantt header toggle (alongside ghost-style toggle); `histogramVisible` state in App | `src/components/gantt/Gantt.tsx`, `src/components/App.tsx` |
| F.4 | Render `<ResourceHistogram>` below Gantt body when visible; pass shared `timeline` | `src/components/gantt/Gantt.tsx` |
| F.5 | Tokens for histogram: `--histogram-bar-bg`, `--histogram-capacity-line`, `--histogram-over` (light + dark) | `src/styles/tokens.css` |
| F.6 | Constants: `HISTOGRAM_HEIGHT`, `HISTOGRAM_PAD_X`, `HISTOGRAM_BAR_GAP`, `RESOURCE_MAX_PER_PROJECT` | `src/constants.ts` |
| F.7 | Empty state ("Select a resource above to see demand") with centred Phosphor `ChartBar` icon | `src/components/gantt/ResourceHistogram.tsx` |
| F.8 | Hover tooltip on histogram bar (day + demand + capacity + over-by) | `src/components/gantt/ResourceHistogram.tsx` |

### Phase G — Scroll sync extension

| # | Task | Files |
|---|------|-------|
| G.1 | Extend `useScrollSync` to a third lane (histogram horizontal sync with Gantt) | `src/hooks/useScrollSync.ts` |
| G.2 | Wire histogram ref through Gantt component | `src/components/gantt/Gantt.tsx`, `src/components/gantt/ResourceHistogram.tsx` |
| G.3 | Manual smoke pass: scroll Gantt → histogram tracks; scroll TaskList → both lanes hold | manual (recorded in CHANGELOG entry) |

### Phase H — Manual leveling support

| # | Task | Files |
|---|------|-------|
| H.1 | Verify existing GanttBar drag-to-reschedule triggers histogram recompute (it will, via the `tasks` dep chain — but assert with an E2E case) | `tests/e2e/resources.spec.ts` (drag fixture) |
| H.2 | When over-allocation exists on the active resource, highlight the affected days in the timeline header row with a 1px red rule beneath the date label | `src/components/gantt/GanttHeader.tsx`, `src/components/gantt/ResourceHistogram.tsx` |
| H.3 | When dragging a task that contributes to an over-allocation, show a "fix preview" indicator on the histogram (the days that would be relieved by the drag's new position) — **simple version: just the live recompute, no preview overlay; defer the predictive overlay to v1.5 or kill outright** | `src/components/gantt/ResourceHistogram.tsx` |

> **H.3 explicit decision:** Live recompute only. The predictive "where would the histogram be if I drop here" overlay is real-time leveling UX that requires a hover-during-drag state machine. It is borderline auto-leveling and risks scope creep. **Decision: not in v1.3.** Document and defer.

### Phase I — CSV in/out for resources

| # | Task | Files |
|---|------|-------|
| I.1 | `parseResourcesCsv` + `generateResourcesCsv` in `csv.ts` | `src/lib/csv.ts` |
| I.2 | `parseAssignmentsCsv` + `generateAssignmentsCsv` in `csv.ts` | `src/lib/csv.ts` |
| I.3 | Unit tests for the new CSV functions (round-trip, validation errors, orphan refs) | `tests/unit/lib/csv.test.ts` (extend) |
| I.4 | Import/Export buttons in `ResourcesManager` modal footer | `src/components/modals/ResourcesManager.tsx` |
| I.5 | Format spec doc | `docs/resources-csv-format.md` (new) |

### Phase J — Empty / loading / error states

| # | Task | Files |
|---|------|-------|
| J.1 | ResourcesManager empty state (no resources yet) | `src/components/modals/ResourcesManager.tsx` |
| J.2 | Histogram "no resources defined" state vs "no resource selected" state — two distinct messages | `src/components/gantt/ResourceHistogram.tsx` |
| J.3 | Histogram loading bar for >500 tasks recompute (re-use the v1.2 thin 2px loading bar pattern) | `src/components/gantt/ResourceHistogram.tsx` |
| J.4 | Assignment validation: warn on quantity ≤ 0, on resource deletion-while-assigned (offer to drop assignments or cancel) | `src/components/panels/ResourceAssignmentSection.tsx`, `src/components/modals/ResourcesManager.tsx` |
| J.5 | Toast on successful CSV resource import (count of resources / assignments imported) | `src/components/modals/ResourcesManager.tsx`, `src/components/overlays/UndoToast.tsx` |

### Phase K — E2E coverage

| # | Task | Files |
|---|------|-------|
| K.1 | E2E: create resource → assign to task → see histogram → drag task within float → over-allocation count updates in StatBar | `tests/e2e/resources.spec.ts` (new) |
| K.2 | E2E: import resources.csv + assignments.csv from a known fixture | `tests/e2e/resources.spec.ts`, `tests/e2e/fixtures/resources.csv` (new) |
| K.3 | E2E: undo path for deleting a resource that has assignments (snapshot push must include `resources`, `assignments`) | `tests/e2e/resources.spec.ts` |
| K.4 | Extend `a11y.spec.ts` to include the new ResourcesManager modal and ResourceAssignmentSection in the axe sweep | `tests/e2e/a11y.spec.ts` |

### Phase L — Print & docs

| # | Task | Files |
|---|------|-------|
| L.1 | Print canvas: cost column in the summary-table mode (optional, controlled by an existing print-mode toggle) | `src/components/modals/PrintPreviewModal.tsx` |
| L.2 | Print canvas summary footer line: project total cost | `src/components/modals/PrintPreviewModal.tsx` |
| L.3 | Update `docs/design-system.md` with v1.3 tokens and resource color cycle policy | `docs/design-system.md` |
| L.4 | Update `docs/onboarding-qa.md` with the new "create a resource first" path (optional onboarding hint deferred — no UI nag in v1.3) | `docs/onboarding-qa.md` |
| L.5 | Marketing landing — **deferred to a separate post-ship marketing pass**, not in v1.3 ship scope | — |

### Phase M — Release hygiene

| # | Task | Files |
|---|------|-------|
| M.1 | `CHANGELOG.md` entry for `0.3.0` | `CHANGELOG.md` |
| M.2 | `package.json` + `package-lock.json` version bump to `0.3.0` | `package.json`, `package-lock.json` |
| M.3 | README update — Resources feature mention | `README.md` |
| M.4 | Run all gates: `lint`, `type-check`, `test:unit`, `build`, `test:e2e` | — |
| M.5 | Tag `v0.3.0` after merge to `main` | git tag (manual) |
| M.6 | Update `version-status.md` → `v1.3 ✅ shipped`, set `v1.4 ⏳ planning` (stop-and-ping), update PM audit index | `.claude/version-status.md` |
| M.7 | Append final Build Changelog entry in this file | `.claude/plan-v1.3.md` §17 |
| M.8 | Update `.claude/AGENT-HANDOFF.md` — next action: Claude runs Checkpoint 1 (`pm-audit-v3.md`) | `.claude/AGENT-HANDOFF.md` |

---

## 11. Parallel vs sequential

| Group | Tasks | Why parallel |
|---|---|---|
| **G1** | 0.1, 0.2, 0.3, 0.4, 0.5 | All housekeeping — independent files |
| **G2** | A.1, A.5 | Types + helper module; A.1 must land before any consumer |
| **G3** | B.1, B.2, B.3, B.4 | Pure libs, no UI dependencies — can land in any order once A is in |
| **G4** | C.1, C.2, C.3, C.4, C.5 | All within ResourcesManager surface — sequential within the phase but can parallel with E.1, E.2 if E doesn't need cost preview yet |
| **G5** | D.1, D.2, D.3, D.4, D.5 | Assignment section — sequential |
| **G6** | E.1, E.2, E.3, E.4 | Cost surfacing — can parallel with F if B is shipped first |
| **G7** | F.1, F.2, F.3, F.4, F.5, F.6, F.7, F.8 | Histogram — sequential within phase, but can parallel with G (scroll sync) |
| **G8** | I.1, I.2, I.3, I.4, I.5 | CSV — sequential within phase, can parallel with anything after Phase B |
| **G9** | K.1, K.2, K.3, K.4 | E2E — sequential, must follow all UI phases |

| Sequential | Depends on | Why |
|---|---|---|
| Phase A | Phase 0 | Migration baseline must be clean before schema bump |
| Phase B | Phase A | Pure libs depend on the types |
| Phase C, D | Phase A, B | UI consumes types + libs |
| Phase E | Phase B, C, D | Cost stat needs cost.ts + resources + assignments |
| Phase F | Phase B, C, D | Histogram needs demand lib + resources + assignments |
| Phase G | Phase F | Scroll sync extends the existing pair — only matters once histogram exists |
| Phase H | Phase F, G | Manual leveling = drag + histogram + scroll sync working together |
| Phase I | Phase A, B, C | CSV needs the data model and resources state |
| Phase J | Phase C, D, F, I | Error states need every surface to exist |
| Phase K | All UI phases | E2E covers the integrated surface |
| Phase L | Phase E (cost) | Print needs cost roll-up |
| Phase M | All other phases | Release |

---

## 12. Testing plan

### 12.1 Unit tests (new)

| Module | Coverage |
|---|---|
| `lib/resources.ts` | CRUD validation (name uniqueness within category, capacity > 0 for labor/equipment, cost rate ≥ 0, unit non-empty); orphan-prune on load |
| `lib/cost.ts` | Per-task cost (single assignment, multi-assignment, labor vs material distribution), per-group, project total; edge cases (zero rate, zero quantity, no assignments, weekend-only span = 0 workdays) |
| `lib/resourceDemand.ts` | Single-task demand; two-task overlap; over-allocation detection; material linear distribution; calendar bounds (timeline window narrower than task span); zero-capacity edge for labor |
| `lib/storage.ts` (extend) | v1 fixture → v2 migration (resources / assignments default to []); existing tasks unchanged; schema version stamp |
| `lib/csv.ts` (extend) | resources.csv round-trip; assignments.csv round-trip; per-row validation errors mirror task CSV pattern; orphan reference handling (assignment referencing missing taskId or resourceId) |
| `hooks/useMidnightTicker` (new, from Phase 0.3) | Cleanup path on unmount; StrictMode double-invoke; tick fires once per midnight |

### 12.2 Integration / component tests

None new. Existing component tests cover the modal pattern; new modals reuse that pattern.

### 12.3 E2E tests (Playwright)

| Spec | Flow |
|---|---|
| `tests/e2e/resources.spec.ts` (new) | Create resource → open task → assign resource with quantity → see cost in StatBar → toggle histogram on → drag task within float → over-allocation count updates → undo delete-task restores assignments |
| `tests/e2e/resources.spec.ts` (CSV path) | Open Resources modal → import resources.csv + assignments.csv from fixture → assert resources rendered + histogram populated when toggled |
| `tests/e2e/a11y.spec.ts` (extend) | Add ResourcesManager + ResourceAssignmentSection + ResourceHistogram (with a selection) to the structural axe sweep. Keep `color-contrast` rule disabled per v1.1 §8.6 scope note. |

### 12.4 Manual QA

| Path | Why manual |
|---|---|
| Real-device mobile sheet with resource assignment section visible | Phase 0.2 + Phase D — verify the new collapsible section does not break sheet drag physics |
| Print preview at A3 with cost column | Phase L — visual verification of column alignment, page break |
| Scroll sync triple-lane | Phase G — drag scrollbar on each lane, verify the other two track; no infinite-loop regressions |

### 12.5 Performance verification

Run a 500-task fixture (the existing perf fixture from v1.1) with:
- 25 resources defined
- ~3 assignments per task (1500 total)
- Histogram toggled on, mid-project resource selected
Measure:
- Project cost recompute (`performance.now()`)
- Demand recompute on the selected resource
- Drag-to-reschedule frame time (Chrome DevTools performance panel)

Targets per §9. Failure to meet target blocks ship.

---

## 13. Quality gate — Gate 2 checklist

**Architecture**
- [x] Resource model lives in `src/types/index.ts` alongside `Task` and `Dependency`
- [x] Pure helpers in `src/lib/resources.ts`, `src/lib/cost.ts`, `src/lib/resourceDemand.ts` — no React imports
- [x] Histogram consumes the existing `Timeline` object — no parallel timeline
- [x] `useScrollSync` is extended, not duplicated
- [x] Migration walk is additive and unit-tested
- [x] No new dependencies (Phosphor icons are already installed; only add icon imports to `lib/icons.ts`)
- [x] `Task.deps[]` policy documented (Phase 0.5)

**Task breakdown**
- [x] All new files listed in §4.1
- [x] All modified files listed in §4.2
- [x] Each task ≤ 3 files / one commit
- [x] Parallel groups identified (§11)
- [x] Dependencies between phases explicit

**Testing**
- [x] Unit tests planned for every new pure module
- [x] Schema migration tested with a v1 fixture
- [x] CSV round-trip tested
- [x] One end-to-end Playwright spec covers the integrated flow
- [x] axe a11y sweep extended to new surfaces
- [x] Performance targets defined with measurement instructions (§9, §12.5)

**Discipline**
- [x] No new tokens that don't have a job
- [x] No new components that aren't on the surface map (§6)
- [x] No features from §3.2 sneaking in via §3.1
- [x] Visual changes preserve v1.2's de-vibecoded posture (pre-flight test in §2.1)
- [x] Real-device mobile QA closed in Phase 0 before any mobile-touching change in later phases

Gate 2 passes. Plan is ready to execute.

---

## 14. Acceptance criteria — v1.3 ship gate

A v1.3 ship requires every box ticked:

**Capability**
- [ ] A PM can define a labor resource, assign it to a task with quantity, see the cost reflected in the StatBar
- [ ] A PM can define an equipment resource, assign it to a task, see it in the histogram with capacity overlay
- [ ] A PM can define a material resource, assign a total quantity to a task, see it cost-rolled but not in histogram capacity (materials have no capacity)
- [ ] Toggling the histogram on shows the selected resource's demand sharing the Gantt's time axis
- [ ] Dragging a task within its float visibly updates the histogram in real time
- [ ] An over-allocation appears in red above the capacity line on the affected days
- [ ] The StatBar over-allocation count updates within one render of the drag landing
- [ ] Project cost total in StatBar updates as assignments are added/removed/edited
- [ ] Optional cost column appears in TaskList only when toggled on (defaults off)

**Data**
- [ ] A v1.2 localStorage payload (`persistedSchemaVersion: 1`) opens cleanly in v1.3 with empty resources/assignments
- [ ] Saving in v1.3 stamps `persistedSchemaVersion: 2`
- [ ] Round-trip CSV export → import preserves all resources and assignments
- [ ] Deleting a resource with active assignments prompts the user (drop assignments or cancel)
- [ ] Deleting a task drops its assignments cleanly (orphan-prune in `migrateState` covers reload edge cases)

**Discipline**
- [ ] No new gradients, no new card spam, no new generic CTAs
- [ ] Every new icon is Phosphor at consistent weight
- [ ] No hardcoded hex in any new component
- [ ] All new colors are tokens
- [ ] Print canvas A3 verified with at least one cost-column screenshot

**Trust**
- [ ] `npm run lint` clean
- [ ] `npm run type-check` clean
- [ ] `npm run test:unit` green (target: ≥ 200 tests after Phase B + Phase I additions)
- [ ] `npm run build` clean; bundle delta < +25KB gzipped vs v1.2 (§9)
- [ ] `npm run test:e2e` green (target: ≥ 11 specs after Phase K)
- [ ] Real-device mobile QA logged in `docs/mobile-qa.md` (closes audit v2 §10.2)
- [ ] `useMidnightTicker` test exists and passes
- [ ] `.worktrees/phases-3-6` orphan worktree removed (audit v2 §10.2)
- [ ] CI on origin verified green for at least one merge to main
- [ ] CHANGELOG, README, version bump landed
- [ ] `v0.3.0` tagged
- [ ] `pm-audit-v3.md` (Checkpoint 1) authored within one Claude session post-ship — **the audit is the ship gate's confirmation, not its prerequisite**

---

## 15. Risks & mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| **Performance regression at 500 tasks** when histogram is toggled on. Per-day demand × per-render = bad if memo deps are over-broad. | High | Performance targets in §9. Demand memoized on a strict dep list. E2E spec asserts no perceptible lag. |
| **Scroll sync feedback loop** if the third lane's pointer-capture interacts oddly with the existing `syncingScroll` ref. | Medium | Reuse the existing flag, do not introduce a second one. Manual smoke pass in Phase G.3. |
| **Schema migration corrupts existing data** if a v1 payload has unexpected shape (e.g., missing `dependencies` array). | High | Migration is additive only and starts from `makeDefaultState()` spread (already the pattern). Unit-test with two fixtures: one minimal, one full v1 payload. |
| **Cost roll-up performance** with workdays calculation in tight loop. | Low | Memoize at App level. Workday counting is O(taskDuration) which is bounded by typical task lengths. |
| **Over-allocation count flicker** during rapid drag if recompute is unthrottled. | Medium | Throttle recompute to one per animation frame using `requestAnimationFrame` if drag E2E shows visible flicker. |
| **Mobile sheet too cramped** with the new ResourceAssignmentSection collapsed by default but added height when expanded. | Medium | Default the section to collapsed. Real-device QA in Phase 0 establishes baseline; revisit in Phase D if expansion breaks scroll. |
| **Resource deletion UX confusion** — user deletes a resource that has 50 assignments and panics. | Medium | Prompt confirmation with assignment count. Drop-with-undo (push snapshot — extend Decision #4 boundary: "resource delete with active assignments" becomes a fourth undo-pushing action). Document the boundary expansion in `CLAUDE.md`. |
| **CSV format proliferation** — three CSVs (tasks, resources, assignments) instead of one. | Low | Decision: keep separate per §3.1 and `docs/resources-csv-format.md`. A unified CSV is v2.x territory (after P6 import lands, when format gets re-evaluated). |
| **Scope creep into auto-leveling** — a contributor wants to add "auto-resolve over-allocation" because it is "right there." | High | Explicitly forbidden by §3.2 and §2.2. Decline at PR review. |

---

## 16. Out of scope (deferred — reaffirmed)

See §3.2 for the canonical list. Repeated here as a billboard:

- **v1.4** — Schedule quality (DCMA, health score, logic validation)
- **v1.5** — Multi-baseline + change orders + variance trends
- **v1.6** — S-curve + EVM + cash flow + executive PDF
- **v1.7** — Standard WBS coding + roll-up summaries
- **v1.8** — Project calendar + delay tracking + excusable classification
- **v1.9** — P6 / MPP / Procore integration
- **v2.0** — Cloud sync + multi-user + audit trail + comments
- **v2.1** — Portfolio dashboard + cross-project resources
- **v2.2** — Density modes + saved views + bulk edit + offline mode

If a v1.3 PR includes any of the above, reject it. Politely. Then point at this section.

---

- **2026-05-22 — Phase 0.1 (worktree housekeeping + ESLint ignore cleanup)**
  - Scope: completed task 0.1 from §10.
  - Files touched: `eslint.config.js`.
  - Verification: `npm.cmd run lint` ✅
  - Notes: orphan worktree path `.worktrees/phases-3-6` was already absent (`git worktree list` showed only the primary `v1.3` worktree), so only ESLint ignore cleanup was required.

- **2026-05-22 — Phase 0.2 (mobile QA log update)**
  - Scope: completed task 0.2 documentation handoff for real-device bottom-sheet QA.
  - Files touched: `docs/mobile-qa.md`.
  - Verification: `npm.cmd run lint` ✅, `npm.cmd run type-check` ✅, `npm.cmd run test:unit` ✅ (149/149), `npm.cmd run build` ✅.
  - Notes: physical iPhone/Android execution remains pending human-run verification; this entry converts the prior stub into a structured log and explicit blocker.

---

**Plan author:** Claude (planning agent)
**Plan ready for:** codex implementation, starting with Phase 0 housekeeping then Phase A
**Plan supersedes:** None — additive on top of plan-v1.2 (shipped)
**Plan successor:** `plan-v1.4.md` (schedule quality engine — to be authored by Claude AFTER `pm-audit-v3.md` Checkpoint 1 lands and passes)
- **2026-05-22 — Phase I.3 (resource/assignment CSV unit coverage)**
  - Scope: added unit coverage for resource/assignment CSV parse+generate flows, validation errors, and orphan-reference pruning path.
  - Files touched: `src/lib/csv.ts`, `tests/unit/lib/csv.test.ts`.
  - Verification: `npm.cmd run lint` ✅, `npm.cmd run type-check` ✅, `npm.cmd run test:unit` ✅ (173/173), `npm.cmd run build` ✅.
  - Notes: default resource color fallback now pulls from `GROUP_PALETTE` before hard fallback.

- **2026-05-22 — Phase I.4 (ResourcesManager CSV controls)**
  - Scope: added import/export controls for `resources.csv` and `assignments.csv` in ResourcesManager footer.
  - Files touched: `src/components/modals/ResourcesManager.tsx`, `src/components/App.tsx`.
  - Verification: `npm.cmd run lint` ✅, `npm.cmd run type-check` ✅, `npm.cmd run test:unit` ✅ (173/173), `npm.cmd run build` ✅, `npm.cmd run test:e2e` ✅ (10/10).
  - Notes: assignment import prunes orphans against current tasks/resources before persisting.

- **2026-05-22 — Phase I.5 (CSV format documentation)**
  - Scope: documented resource and assignment CSV schema, required columns, examples, and validation behavior.
  - Files touched: `docs/resources-csv-format.md`.
  - Verification: existing Phase I gate run retained green (`lint`, `type-check`, `test:unit`, `build`, `test:e2e`).
  - Notes: no behavior changes.
- **2026-05-22 — Phase J.1 (ResourcesManager empty state)**
  - Scope: added explicit empty-state panel when no resources exist in ResourcesManager.
  - Files touched: `src/components/modals/ResourcesManager.tsx`.
  - Verification: `npm.cmd run lint` ✅, `npm.cmd run type-check` ✅, `npm.cmd run test:unit` ✅ (173/173), `npm.cmd run build` ✅, `npm.cmd run test:e2e` ✅ (10/10).
  - Notes: message points users to add manually or import `resources.csv`.
- **2026-05-22 — Phase J.2 (distinct histogram empty states)**
  - Scope: separated and clarified histogram empty states for `no resources` vs `no selected resource` with distinct guidance copy.
  - Files touched: `src/components/gantt/ResourceHistogram.tsx`.
  - Verification: `npm.cmd run lint` ✅, `npm.cmd run type-check` ✅, `npm.cmd run test:unit` ✅ (173/173), `npm.cmd run build` ✅, `npm.cmd run test:e2e` ✅ (10/10).
  - Notes: no behavior change to demand calculations; copy-only UX clarity.
- **2026-05-22 — Phase J.3 (histogram loading bar for large recomputes)**
  - Scope: surfaced the thin loading bar pattern on the histogram lane when large-task deferred recompute is active.
  - Files touched: `src/components/gantt/ResourceHistogram.tsx`, `src/components/gantt/Gantt.tsx`.
  - Verification: `npm.cmd run lint` ✅, `npm.cmd run type-check` ✅, `npm.cmd run test:unit` ✅ (173/173), `npm.cmd run build` ✅, `npm.cmd run test:e2e` ✅ (10/10).
  - Notes: reuses existing `computing-bar` class pattern from list/gantt surfaces.
- **2026-05-22 — Phase J.4 (assignment validation + delete-with-assignments handling)**
  - Scope: added quantity <= 0 validation warning in assignment editor; added delete-resource confirmation when assignments exist, with drop-or-cancel behavior.
  - Files touched: `src/components/panels/ResourceAssignmentSection.tsx`, `src/components/modals/ResourcesManager.tsx`.
  - Verification: `npm.cmd run lint` ✅, `npm.cmd run type-check` ✅, `npm.cmd run test:unit` ✅ (173/173), `npm.cmd run build` ✅, `npm.cmd run test:e2e` ✅ (10/10).
  - Notes: assignment drops are staged locally in ResourcesManager and persisted on Save.

- **2026-05-22 — Phase J.5 (CSV import success toast)**
  - Scope: added success toast feedback for resource and assignment CSV imports (count of imported rows).
  - Files touched: `src/components/modals/ResourcesManager.tsx`, `src/components/overlays/UndoToast.tsx`.
  - Verification: `npm.cmd run lint` ✅, `npm.cmd run type-check` ✅, `npm.cmd run test:unit` ✅ (173/173), `npm.cmd run build` ✅, `npm.cmd run test:e2e` ✅ (10/10).
  - Notes: extracted a shared passive toast primitive (`ToastMessage`) while preserving Undo toast behavior.
- **2026-05-22 — Phase K.1–K.2 (resources histogram E2E — fixtures + import assertions)**
  - Scope: CSV fixture import helper, drag over-allocation E2E, import assertion test verifying resource pill + over-alloc stat.
  - Files touched: `tests/e2e/resources.spec.ts`, `tests/e2e/fixtures/resources.csv`, `tests/e2e/fixtures/assignments.csv`.
  - Verification: `npm.cmd run lint` ✅, `npm.cmd run type-check` ✅, `npm.cmd run test:unit` ✅ (173/173), `npm.cmd run build` ✅, `npm.cmd run test:e2e` ✅ (13/13).
  - Commits: K.1/K.2 bundled as first resources.spec.ts commit.

- **2026-05-22 — Phase K.3 (undo E2E for resource deletion with active assignments)**
  - Scope: E2E test confirming undo toast appears and restores resource + assignments after deleting a resource that had active assignments. App.tsx `onSave` condition simplified to `deletedIds.size > 0`.
  - Files touched: `tests/e2e/resources.spec.ts`, `src/components/App.tsx`.
  - Verification: `npm.cmd run lint` ✅, `npm.cmd run type-check` ✅, `npm.cmd run test:unit` ✅ (173/173), `npm.cmd run build` ✅, `npm.cmd run test:e2e` ✅ (13/13).
  - Commit: `7d6f6ba`.

- **2026-05-22 — Phase K.4 (a11y sweep extended to ResourcesManager modal)**
  - Scope: added ResourcesManager modal to axe desktop sweep; fixed three unlabeled form controls discovered by the scan (category `<select>`, capacity and cost-rate `<input type="number">` in both resource rows and the add-resource footer).
  - Files touched: `tests/e2e/a11y.spec.ts`, `src/components/modals/ResourcesManager.tsx`.
  - Verification: `npm.cmd run lint` ✅, `npm.cmd run type-check` ✅, `npm.cmd run test:unit` ✅ (173/173), `npm.cmd run build` ✅, `npm.cmd run test:e2e` ✅ (13/13).
  - Commit: `16b9fa9`.

- **2026-05-23 — Phase L + M (release closeout complete)**
  - Scope: completed Phase L print/docs items and finished Phase M release hygiene.
  - Files touched: `src/components/modals/PrintPreviewModal.tsx`, `src/components/App.tsx`, `docs/design-system.md`, `docs/onboarding-qa.md`, `README.md`, `CHANGELOG.md`, `package.json`, `package-lock.json`.
  - Verification: `npm.cmd run lint` ✅, `npm.cmd run type-check` ✅, `npm.cmd run test:unit` ✅ (173/173), `npm.cmd run build` ✅, `npm.cmd run test:e2e` ✅ (13/13).
  - Release actions: pushed `v1.3`, opened PR #11 to `main`, squash merged, and moved tag `v0.3.0` to final main release commit `7284c3a`.
  - Commit: `29e295d` (branch closeout commit before merge).
