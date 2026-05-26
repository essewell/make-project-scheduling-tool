# MAKE Scheduling Tool — Plan v1.4

**Status:** Draft · Schedule Quality Engine (the second organ — self-audit)
**Created:** 2026-05-23
**Author:** Claude (planning agent)
**Predecessors:** [plan-v1.3.md](./plan-v1.3.md) ✅ shipped, [pm-audit-v3.md](./pm-audit-v3.md) (Checkpoint 1 — conditional pass at 5.5/10)
**Target ship tag:** `v0.4.0`
**Roadmap target fitness:** 5.5/10 → 6.0/10 (after v1.4 ships and `pm-audit-v4.md` / Checkpoint 2 fires, post-v1.5)

---

## 0. One-line premise

v1.3 made the schedule executable (resources). **v1.4 makes the schedule auditable** — before a PM hands a schedule to an owner, they need to know whether it is professional-grade or amateur-hour. v1.4 gives the tool the ability to audit itself.

---

## ⚠ Mandatory pre-work — branch creation (READ FIRST)

**Before doing anything else** — before reading the rest of this plan in implementation mode, before opening a single source file, before running a single test — the implementation agent MUST:

1. Confirm the working tree is clean. Stash or commit `playwright-report/index.html` noise if present.
2. Confirm local `main` is up-to-date with `origin/main` (`git fetch origin && git status -uno`).
3. Create and check out a new branch named exactly `v1.4` from `main`:
   ```
   git checkout main
   git pull --ff-only origin main
   git checkout -b v1.4
   ```
4. Push the branch to origin so CI tracks it: `git push -u origin v1.4`.
5. Verify with `git branch --show-current` → must print `v1.4`.

**Every commit for this version lands on `v1.4`.** No work goes directly to `main`. Ship merges via PR `v1.4 → main`, then tag `v0.4.0` on the merge commit.

**This is a permanent rule for every future version**, codified in `AGENTS.md § Conventions`. Future plans (v1.5, v1.6, …) will not re-document it — they will assume it. v1.4 is the first version operating under the rule, so it is spelled out here.

If the working tree is not on `v1.4` when implementation begins, **stop and create the branch.** Do not proceed.

---

## 1. Purpose & relationship to prior plans

| Plan | Scope | Outcome |
|------|-------|---------|
| v1.0 | Track C UX refinement (7 tasks) | Shipped |
| v1.1 | Production readiness | Shipped 2026-05-22 (`v0.1.0`) |
| v1.2 | Visual refinement / de-vibecoded surface | Shipped 2026-05-22 (`v0.2.0`) |
| v1.3 | Resource foundation — the first organ | Shipped 2026-05-23 (`v0.3.0`) |
| **v1.4** | **Schedule quality engine — the self-audit organ** | **This plan** |

v1.3 introduced data (resources, assignments, cost). v1.4 introduces **judgment about that data**. Where v1.3 answered "can this schedule be executed?", v1.4 answers "is this schedule any good?" A PM who runs v1.4's health check against a 1,800-task hospital schedule and gets back "78/100 — three flagged items: open-end task in landscaping, excessive lag on HVAC rough-in, electrical crew over-allocated weeks 12–14" has just been handed a defensible artifact. That is the v1.4 deliverable.

**The audience for v1.4 is the same audience as v1.3 — the user, not the buyer.** The PM running a schedule wants to ship something they can defend in an owner meeting or an arbitration. The DCMA standard is what schedulers grade against. v1.4 implements that grade.

---

## 2. The "single organ at a time" principle (CARRIED FORWARD)

The roadmap's seventh guiding principle still holds. v1.4 ships **schedule quality scoring + logic validation + float distribution + the quality panel UI**. It does **not** ship:

- Resource quality scoring beyond what falls naturally out of v1.3 data (i.e., resource over-allocation is a DCMA-relevant signal — that is acceptable; cost-loaded EVM-style grading is not)
- Multi-baseline (v1.5)
- S-curves, EVM, cash flow, executive PDF (v1.6)
- Auto-fixes for quality issues ("click to add a successor to this orphan task")
- AI-suggested schedule improvements

If a contributor asks "while we're touching the quality engine, can we also…" the answer is no.

### 2.1 Discipline preserved

Every visual surface added in v1.4 must pass v1.2's pre-flight test:
- "Would another product look identical if I swapped the wordmark?" — if yes, fail.
- "Does it have a job, or is it decorative?" — if decorative, fail.
- "Would I notice it missing?" — if no, fail.

Health scores and DCMA findings are the surface where "dashboard creep" is easiest. **The quality panel must look like an engineering report, not a SaaS dashboard.** Monospaced numbers. Pass/fail badges. No charts that do not need to exist.

### 2.2 The defensibility floor

v1.4 must preserve the floor that v1.1 / v1.2 / v1.3 built:
- Every new pure function gets a unit test.
- Every new user-visible flow gets an E2E spec.
- No schema change (health is derived, not persisted — see §5.1).
- No new dependencies.
- No regression on existing 173 unit tests or 13 E2E specs.

---

## 3. Scope

### 3.1 In scope (v1.4)

| Capability | What the PM sees |
|---|---|
| **DCMA 14-Point Assessment** | Each of the 14 checks runs as a pure function over the current schedule. Each returns `{ passed: boolean, score: number, threshold: number, plainEnglish: string, affectedTaskIds: string[] }`. The 14 are listed in §6. |
| **Schedule Health Score** | A single 0–100 number with a weighted composite of: logic quality (30%), resource feasibility (25%), baseline adherence (20%), float distribution (15%), completeness (10%). Displayed in StatBar between the existing critical/variance stats and the cost stat. Color-coded: green ≥80, amber 60–79, red <60. |
| **Schedule Quality Panel** | New modal accessible from the StatBar health score (click to open) and from a new TopBar "Quality" button. Shows the 14 DCMA checks, the composite score breakdown, and the float distribution histogram. Layout is a two-column engineering report — left column DCMA findings table, right column distribution chart + score breakdown. |
| **Logic validation (live)** | Orphan task detection: tasks with no predecessors AND no successors get a small `Warning` icon in the TaskList row (right edge, before float column). Hovering names the issue ("No predecessors or successors"). Already-detected circular dependencies are also surfaced here. |
| **Float distribution histogram** | A bar chart showing the count of tasks bucketed by total float days: `<0` (negative), `0` (critical), `1–5`, `6–10`, `11–20`, `21–50`, `51–100`, `>100`. A healthy schedule shows a bell curve centered around 10–20 days. Rendered as SVG inside the Quality Panel (same custom-rendering philosophy as the Gantt and histogram — no chart libraries). |
| **Excessive-lag flag** | Lag on any dependency edge > 50% of the predecessor task's duration is flagged in the LinkBuilder modal and in the DCMA panel. The dependency's caret/chip in the TaskList gets a small amber dot. |
| **Negative float detection** | Tasks with computed total float < 0 (impossible — they need to start before now) are highlighted in the TaskList with a red border on the float cell. |
| **Critical Path Length Index (CPLI)** | One of the DCMA outputs. `CPLI = (project_remaining_duration + total_float_critical_path) / project_remaining_duration`. >0.95 is healthy. Displayed as a stat in the Quality Panel. |
| **Baseline Execution Index (BEI)** | DCMA output. `BEI = tasks_completed_on_or_before_baseline / tasks_planned_complete_by_status_date`. >0.95 is healthy. Requires a captured baseline; falls back to "N/A — capture a baseline first" if absent. |

### 3.2 Out of scope (explicitly deferred)

| Deferred to | What |
|---|---|
| **v1.5** | Multiple baselines, baseline comparison, change orders, variance trend lines, **cross-resource histogram overlay** (called out in audit v3 §5.1) |
| **v1.6** | S-curves, EVM (PV/EV/AC/SPI/CPI), cash flow forecast, executive PDF report |
| **v1.7** | Standard WBS coding export, group roll-up summary pills, hierarchy depth validation |
| **v1.8** | Project calendar overlay, weather delay tracking, excusable/non-excusable classification, **per-resource calendars** (audit v3 §5.2) |
| **v1.9** | Primavera P6 / MS Project import/export, Procore integration |
| **v2.0** | Cloud sync, multi-user, audit trail, comments, presence |
| **v2.1** | Portfolio dashboard, cross-project resources, project templates |
| **v2.2** | Density modes, column customization, saved views, bulk edit, drag-and-drop dependency arrows |

**Specifically not in v1.4** even though they are tempting:
- Auto-fix actions ("click to add a successor") — v2.2 territory at earliest
- Health score history (a trend line of the score over time) — depends on multi-baseline, so v1.5+
- DCMA report PDF export — folded into v1.6 executive reporting
- Resource calendar gaps as a quality flag — depends on v1.8 calendars existing

---

## 4. Phase 0 — Mandatory close-outs from pm-audit-v3 §9

**Phase 0 runs BEFORE any capability work.** Per audit v3 §9, the conditional pass on Checkpoint 1 attached three conditions to proceeding to v1.4. They close here.

### 4.1 Branch creation (see top of this plan)

| # | Task | Verification |
|---|------|--------------|
| 0.0 | Create branch `v1.4` from latest `main`, push to origin | `git branch --show-current` returns `v1.4` |

### 4.2 The three audit-v3 §9 close-outs

| # | Task | Deliverable | Files |
|---|------|-------------|-------|
| 0.1 | Mobile real-device QA pass on the v1.3 bottom sheet with `ResourceAssignmentSection` expanded. Physical iPhone (≤375px) + physical Android (≤360px) Chrome. Verify: sheet peek/full transitions hold, assignment section expand/collapse inside sheet does not break scroll, drag-to-dismiss physics intact. | Checked-off log entries in `docs/mobile-qa.md` with device names, OS versions, dates, observations. **Chronic gap from audit v2 and v3 — closes here.** | `docs/mobile-qa.md` |
| 0.2 | Perf re-measurement at v1.3 scale. Load a 500-task fixture with 25 resources × ~3 assignments/task. Toggle histogram on a mid-project resource. Instrument with `performance.now()` around: (a) project cost recompute, (b) demand recompute on selected resource, (c) drag-to-reschedule frame time (Chrome DevTools performance panel). Compare against plan-v1.3 §9 targets. | A short markdown report at `docs/perf-v1.3-baseline.md` with the measurements and a pass/fail line per target. If any target misses by >10%, open a follow-up task in this plan §17 Build Changelog and fix before Phase A. | `docs/perf-v1.3-baseline.md` (new), `tests/fixtures/perf-500-task.json` (new if not already present) |
| 0.3 | StatBar density audit at 1280px width. Force all five conditional stats active (task count, complete, critical, variance, over-alloc) plus the permanent project cost. Capture a screenshot at 1280×800. Measure used horizontal space. If >70%, this plan must allocate a StatBar restructure in Phase A; if ≤70%, document the headroom and proceed. | `docs/statbar-density-v1.3.md` with screenshot, measurement, and verdict (proceed / restructure). | `docs/statbar-density-v1.3.md` (new), `docs/v1.3-screenshots/statbar-1280.png` (new) |

**Gate:** Phase 0 must close cleanly before Phase A begins. The three deliverables above are committed on `v1.4` as the first three commits.

If Phase 0.2 surfaces a perf regression that misses the §9 targets by >10%, Phase A is paused until the regression is closed. The fix lands on `v1.4` as its own commit set, then Phase A resumes.

If Phase 0.3 finds StatBar density >70%, **insert a Phase A.0** that restructures the StatBar (split into two rows on narrower viewports, or move project cost to its own slot) before any health-score work lands on the StatBar.

---

## 5. Architecture & file map

### 5.1 No schema change

Health scores, DCMA findings, float distribution, CPLI, and BEI are **all derived from existing persisted data** (tasks, dependencies, baselines, resources, assignments). Nothing about v1.4 requires a schema bump. `PERSISTED_SCHEMA_VERSION` stays at `2`. The migration walk does not change.

This is deliberate. A schema-stable version between two schema-changing versions (v1.3 bumped to 2, v1.5 will bump to 3 for multi-baseline) gives us a clean diff target for the v1.5 migration tests.

### 5.2 New files

| File | Purpose |
|---|---|
| `src/lib/dcma.ts` | Pure: 14 DCMA checks. Exports `runDcmaAssessment(schedule) → DcmaResult` |
| `src/lib/health.ts` | Pure: composite health score from DCMA result + resource demand + baseline + float distribution |
| `src/lib/floatDistribution.ts` | Pure: bucketed total-float histogram |
| `src/lib/logicValidation.ts` | Pure: orphan detection, excessive lag detection, negative float detection |
| `src/components/modals/QualityPanel.tsx` | The two-column engineering-report modal |
| `src/components/quality/DcmaFindingsTable.tsx` | Left-column table of the 14 DCMA checks with pass/fail badges |
| `src/components/quality/FloatDistributionChart.tsx` | Right-column SVG bar chart |
| `src/components/quality/HealthScoreBreakdown.tsx` | Right-column score-composition card (weights × subscores) |
| `tests/unit/lib/dcma.test.ts` | Per-check unit tests (14 checks × happy + edge cases) |
| `tests/unit/lib/health.test.ts` | Composite score math, weight rebalancing when components are N/A |
| `tests/unit/lib/floatDistribution.test.ts` | Bucket boundary tests |
| `tests/unit/lib/logicValidation.test.ts` | Orphan, excessive lag, negative float detection |
| `tests/e2e/quality-panel.spec.ts` | Open panel from StatBar → assert DCMA findings render → assert float histogram renders → assert click-to-filter on orphan finding |
| `docs/dcma-checks.md` | Spec of all 14 checks with thresholds, formulas, references |

### 5.3 Files modified

| File | What changes |
|---|---|
| `src/components/StatBar.tsx` | Add health score stat (always shown, color-coded). If audit-v3 §9.3 found density >70%, this is where the StatBar restructure lands. |
| `src/components/topbar/TopBar.tsx` | Add "Quality" button (Phosphor `ShieldCheck` icon) in the data/settings cluster alongside Resources / Phases / Parties |
| `src/components/task-list/TaskList.tsx` | Add right-edge orphan-warning icon column (16px); add negative-float red border on float cell; add amber dot on excessive-lag dependency chip |
| `src/components/modals/LinkBuilderModal.tsx` | Flag lag values that exceed 50% of predecessor duration with inline warning text |
| `src/components/App.tsx` | State for `qualityPanelOpen`; wire QualityPanel modal; memoize DCMA + health computations |
| `src/lib/icons.ts` | Add Phosphor exports needed by v1.4 (`ShieldCheck`, `Warning`, `WarningCircle`) |
| `src/constants.ts` | Add `FLOAT_BUCKETS`, `EXCESSIVE_LAG_RATIO = 0.5`, `HEALTH_GREEN_THRESHOLD = 80`, `HEALTH_AMBER_THRESHOLD = 60`, `HEALTH_WEIGHTS` |
| `src/styles/tokens.css` | Add `--health-green`, `--health-amber`, `--health-red`, `--float-bucket-bg`, `--float-bucket-critical`, `--float-bucket-negative` |
| `docs/design-system.md` | Document the new health tokens |
| `CHANGELOG.md` | Add `0.4.0` entry on ship |
| `package.json`, `package-lock.json` | Version bump `0.3.0` → `0.4.0` |
| `README.md` | Mention schedule quality engine in features |

### 5.4 Files unchanged (explicit non-goals)

| File | Why we are leaving it alone |
|---|---|
| `src/lib/cpm.ts` | CPM produces the total-float values the quality engine consumes. The engine reads CPM output — it does not modify CPM. |
| `src/lib/storage.ts` | No schema change. |
| `src/lib/resources.ts`, `cost.ts`, `resourceDemand.ts` | v1.3 modules consumed by the resource-feasibility subscore. Read-only here. |
| The Gantt component | No new on-Gantt UI. Orphan warnings land in the TaskList, not on bars. |
| The mobile bottom sheet | The Quality Panel modal is the same modal shell pattern; no mobile-specific UI work. |

---

## 6. The 14 DCMA checks

Each check returns `{ id, name, passed, score, threshold, plainEnglish, affectedTaskIds }`. The 14 are the industry-standard DCMA 14-Point Assessment. Thresholds are the DCMA defaults; v1.4 ships these — future versions can make them configurable per project.

| # | Check | Threshold | Plain-English |
|---|-------|-----------|---------------|
| 1 | **Logic** | ≥95% of tasks have at least one predecessor AND at least one successor | "Tasks should be connected on both sides — orphans risk slipping silently." |
| 2 | **Leads** | 0 dependencies with negative lag | "Negative lag (lead time) hides real overlap. Use SS+lag or FF-lag instead." |
| 3 | **Lags** | ≤5% of dependencies have lag > 0 | "Excessive lag inflates duration without showing why work isn't progressing." |
| 4 | **Relationship Types** | ≥90% FS (Finish-to-Start) | "FS is the default. Heavy use of SS / FF / SF suggests modeling gaps." |
| 5 | **Hard Constraints** | <5% of tasks have hard date constraints | (v1.4 surface: tasks with `actualStart` or `actualFinish` aren't constraints; this check flags 0% in v1.4 — placeholder until v1.8 introduces real date constraints) |
| 6 | **High Float** | <5% of tasks with total float >44 days | "Excessive float means logic is missing — that long buffer isn't real." |
| 7 | **Negative Float** | 0 tasks with total float <0 | "Negative float means the schedule is mathematically impossible." |
| 8 | **High Duration** | <5% of tasks with duration >44 working days | "Long-duration tasks hide subtasks — break them down." |
| 9 | **Invalid Dates** | 0 tasks with `actualStart > today` or `actualFinish > today` (forecasted in the past) | "Actual dates in the future or planned dates in the past indicate stale entries." |
| 10 | **Resources** | ≥95% of work tasks (non-milestone) have at least one resource assignment | "A schedule without resources is a wish list — not a plan." |
| 11 | **Missed Tasks** | <5% of tasks past their planned finish without actual completion | "Past-due incomplete tasks need replanning or completion confirmation." |
| 12 | **Critical Path Test** | A 600-day forced delay on a critical task pushes project finish by 600 days | "Tests whether the critical path is truly critical. If it doesn't push the end, your CPM is broken." |
| 13 | **Critical Path Length Index (CPLI)** | CPLI ≥ 0.95 | "(Remaining + Float on CP) / Remaining. Below 0.95 means the schedule has slipped." |
| 14 | **Baseline Execution Index (BEI)** | BEI ≥ 0.95 | "Tasks completed by status date / tasks planned to be complete. Requires a baseline." |

For full formulas, see `docs/dcma-checks.md` (Phase B deliverable).

### 6.1 Health score composition

```
HealthScore = round(
  0.30 * logicSubscore     +  // average pass-rate of checks 1–4
  0.25 * resourceSubscore  +  // 100 - 100×(over_alloc_resource_count / total_resources), 100 if no resources
  0.20 * baselineSubscore  +  // 100 × BEI clamped 0..100, or "N/A" if no baseline (redistribute weight)
  0.15 * floatSubscore     +  // 100 - 100×(extreme_float_pct / threshold_pct), where extreme = bucket <0 or >100
  0.10 * completenessSubscore // 100 × (resourced_task_pct + linked_task_pct + completion_pct) / 3
)
```

If a subscore is N/A (e.g., no baseline captured), its weight is redistributed proportionally across the remaining subscores so the total still sums to 1.0.

---

## 7. UI surface map

```
┌─ TopBar ─────────────────────────────────────────────────────────────────────┐
│ MAKE · Project │ Baseline │ Phases/Parties/Resources/Quality*                │
│                                                       ↑ NEW                  │
└──────────────────────────────────────────────────────────────────────────────┘
┌─ StatBar ────────────────────────────────────────────────────────────────────┐
│ N tasks · Complete M · Critical K · Variance V · Health 78*    │ $2,431,200  │
│                                                  ↑ NEW         │ Over-alloc  │
└──────────────────────────────────────────────────────────────────────────────┘

┌─ Quality Panel (modal) ──────────────────────────────────────────────────────┐
│  Schedule Quality · 78 / 100  ─────────────────────────────────  [✕]         │
│  ─────────────────────────────────────────────────────────────────           │
│  ┌─ DCMA 14-Point Assessment ──────┐  ┌─ Composite ──────────────┐           │
│  │  ✓  1. Logic           97%      │  │ Logic       30%   29.1   │           │
│  │  ✓  2. Leads            0       │  │ Resources   25%   22.5   │           │
│  │  ⚠  3. Lags             7%      │  │ Baseline    20%   18.2   │           │
│  │  ✓  4. Rel. Types      92%      │  │ Float       15%    8.3   │           │
│  │  ─                              │  │ Completeness 10%    0.0  │           │
│  │  ✓  7. Negative Float   0       │  │ ──────────────────────── │           │
│  │  ✗ 10. Resources       63%      │  │ Total              78    │           │
│  │  ✓ 14. BEI            0.97      │  └──────────────────────────┘           │
│  │  (14 rows total, scrollable)    │                                          │
│  └─────────────────────────────────┘  ┌─ Float Distribution ─────┐           │
│                                       │  <0  ▎                   │           │
│                                       │   0  ████  (critical)    │           │
│                                       │  1–5 ███                 │           │
│                                       │ 6–10 ██████              │           │
│                                       │ 11–20 ████████   (healthy)│          │
│                                       │ 21–50 ████               │           │
│                                       │ 51–100 ██                │           │
│                                       │ >100  ▎                  │           │
│                                       └──────────────────────────┘           │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 7.1 StatBar Health Score stat

- Position: between Variance and the right-side cost/over-alloc cluster
- Format: `Health 78` — label tertiary color, value strong with health-color (`--health-green` / `--health-amber` / `--health-red`)
- Mono digits
- Clickable: opens Quality Panel
- Hover tooltip: "Click for full quality report"

### 7.2 TopBar Quality button

- Phosphor `ShieldCheck` icon
- Sits in the data/settings cluster alongside `Users` (Resources), `Stack` (Phases), `UsersThree` (Parties)
- Click opens Quality Panel modal

### 7.3 TaskList orphan warning

- 16px-wide column, right edge, between float column and any optional cost column
- Phosphor `Warning` icon in `--color-text-tertiary` when orphan, hidden otherwise
- Hover tooltip names the issue ("No predecessors or successors")
- Clicking the icon opens the LinkBuilderModal pre-filtered to this task

### 7.4 Float cell negative border

- TaskList float cell gets a 1px `--color-danger` border + 4px left rule when total float <0
- Mono digits keep their alignment

### 7.5 Excessive lag dot

- Dependency chip in TaskList caret area gets a 6px amber dot when any lag exceeds 50% of predecessor duration
- LinkBuilderModal lag input shows inline warning text below the field: "Lag exceeds 50% of predecessor — consider modeling intermediate work."

---

## 8. Performance contract

| Metric | Target | Measurement |
|---|---|---|
| DCMA full assessment (500 tasks) | <30ms | `performance.now()` around `runDcmaAssessment` |
| Health score composition | <5ms | Same instrumentation |
| Float distribution bucket | <5ms | Same |
| Quality Panel first render (cold) | <100ms | E2E trace, panel open to fully rendered |
| Build size delta (v1.3 → v1.4) | <+20KB JS gzipped | `npm run build` bundle report |
| No regression on existing perf targets | unchanged | Re-run Phase 0.2 baseline after Phase F |

**DCMA recompute strategy:** `useMemo` at App level keyed on `[tasks, dependencies, baselines, resources, assignments, workweek, holidays]`. The memo invalidates on any edit that touches those arrays. The deferred-bar pattern from v1.2 / v1.3 is reused if recompute exceeds 100ms.

---

## 9. Phased task breakdown

Each task ≤3 files, one commit. Phases ordered by dependency.

### Phase 0 — Branch + audit-v3 §9 close-outs

| # | Task | Files |
|---|------|-------|
| 0.0 | Create branch `v1.4` from main, push to origin | (git) |
| 0.1 | Mobile real-device QA log update | `docs/mobile-qa.md` |
| 0.2 | Perf re-measurement at v1.3 scale; document baseline | `docs/perf-v1.3-baseline.md` (new), perf fixture if needed |
| 0.3 | StatBar density audit; document verdict | `docs/statbar-density-v1.3.md` (new), screenshot |

### Phase A — Pure DCMA library

| # | Task | Files |
|---|------|-------|
| A.1 | Scaffold `src/lib/dcma.ts` with `DcmaCheck` / `DcmaResult` types and the check registry skeleton | `src/lib/dcma.ts` (new), `src/types/index.ts` (extend) |
| A.2 | Implement checks 1–4 (logic, leads, lags, relationship types) | `src/lib/dcma.ts` |
| A.3 | Implement checks 5–8 (hard constraints placeholder, high float, negative float, high duration) | `src/lib/dcma.ts` |
| A.4 | Implement checks 9–11 (invalid dates, resources, missed tasks) | `src/lib/dcma.ts` |
| A.5 | Implement checks 12–14 (critical path test, CPLI, BEI) | `src/lib/dcma.ts` |
| A.6 | Unit tests for all 14 checks (happy + edge cases) | `tests/unit/lib/dcma.test.ts` (new) |
| A.7 | Document all 14 with formulas, thresholds, references | `docs/dcma-checks.md` (new) |

### Phase B — Health score & float distribution

| # | Task | Files |
|---|------|-------|
| B.1 | `src/lib/health.ts` — composite score with weight redistribution when subscores are N/A | `src/lib/health.ts` (new) |
| B.2 | Unit tests for health composition (all subscores present, baseline N/A, no resources, etc.) | `tests/unit/lib/health.test.ts` (new) |
| B.3 | `src/lib/floatDistribution.ts` — bucketed histogram | `src/lib/floatDistribution.ts` (new) |
| B.4 | Unit tests for bucket boundaries (negative, critical, healthy ranges, edge cases at boundary values) | `tests/unit/lib/floatDistribution.test.ts` (new) |
| B.5 | `src/lib/logicValidation.ts` — orphan, excessive lag, negative float helpers | `src/lib/logicValidation.ts` (new) |
| B.6 | Unit tests for logic validation | `tests/unit/lib/logicValidation.test.ts` (new) |

### Phase C — StatBar Health stat (and restructure if needed)

| # | Task | Files |
|---|------|-------|
| C.1 | If Phase 0.3 found density >70%: restructure StatBar (two-row layout at narrow viewports OR move project cost to a right slot) | `src/components/StatBar.tsx` |
| C.2 | Add Health Score stat to StatBar with color coding (green/amber/red) and click-to-open behavior | `src/components/StatBar.tsx`, `src/components/App.tsx` |
| C.3 | Add health tokens to `tokens.css` (light + dark) and constants for thresholds + weights | `src/styles/tokens.css`, `src/constants.ts` |

### Phase D — Quality Panel modal

| # | Task | Files |
|---|------|-------|
| D.1 | `QualityPanel.tsx` modal shell with two-column layout, `useDialogA11y` hook | `src/components/modals/QualityPanel.tsx` (new) |
| D.2 | `DcmaFindingsTable.tsx` — left column, scrollable, pass/fail badge per row, click-to-expand for affectedTaskIds | `src/components/quality/DcmaFindingsTable.tsx` (new) |
| D.3 | `HealthScoreBreakdown.tsx` — right column top, weights × subscores card with total | `src/components/quality/HealthScoreBreakdown.tsx` (new) |
| D.4 | `FloatDistributionChart.tsx` — right column bottom, SVG bars, no chart library | `src/components/quality/FloatDistributionChart.tsx` (new) |
| D.5 | Wire panel open/close from StatBar Health stat AND TopBar Quality button | `src/components/App.tsx`, `src/components/topbar/TopBar.tsx`, `src/lib/icons.ts` |

### Phase E — In-context logic validation

| # | Task | Files |
|---|------|-------|
| E.1 | TaskList orphan warning column (16px right-edge `Warning` icon, hover tooltip, click opens LinkBuilder pre-filtered) | `src/components/task-list/TaskList.tsx`, `src/lib/icons.ts` |
| E.2 | TaskList negative-float cell border | `src/components/task-list/TaskList.tsx` |
| E.3 | Dependency chip excessive-lag amber dot | `src/components/task-list/TaskList.tsx` |
| E.4 | LinkBuilderModal inline excessive-lag warning text under the lag field | `src/components/modals/LinkBuilderModal.tsx` |

### Phase F — Empty / loading / error states

| # | Task | Files |
|---|------|-------|
| F.1 | Quality Panel empty state: schedule with 0 tasks shows "Add tasks before running quality assessment" | `src/components/modals/QualityPanel.tsx` |
| F.2 | BEI row shows "N/A — capture a baseline first" with link that closes panel and opens baseline capture | `src/components/quality/DcmaFindingsTable.tsx` |
| F.3 | Resource check (10) shows informational note when 0 resources exist: "No resources defined — open Resources to add" | `src/components/quality/DcmaFindingsTable.tsx` |
| F.4 | Loading bar pattern for >500-task DCMA recompute (reuse the thin 2px loading bar from v1.2 / v1.3) | `src/components/modals/QualityPanel.tsx` |

### Phase G — E2E coverage

| # | Task | Files |
|---|------|-------|
| G.1 | E2E: load example data → open Quality Panel from StatBar → assert 14 DCMA rows render → assert at least one finding has a click-to-filter target | `tests/e2e/quality-panel.spec.ts` (new) |
| G.2 | E2E: create a schedule with one orphan task → assert warning icon appears in TaskList → click icon opens LinkBuilder | `tests/e2e/quality-panel.spec.ts` |
| G.3 | E2E: capture a baseline → reopen Quality Panel → assert BEI row no longer shows N/A | `tests/e2e/quality-panel.spec.ts` |
| G.4 | Extend `a11y.spec.ts` to include QualityPanel modal in the axe sweep | `tests/e2e/a11y.spec.ts` |

### Phase H — Print & docs

| # | Task | Files |
|---|------|-------|
| H.1 | Print canvas summary-table mode adds an optional "Quality score: N/100" line in the header band (behind existing print-mode toggle) | `src/components/modals/PrintPreviewModal.tsx` |
| H.2 | Update `docs/design-system.md` with v1.4 tokens (health colors, float buckets) | `docs/design-system.md` |
| H.3 | Update `docs/onboarding-qa.md` with "open the Quality Panel" as a recommended early action after CSV import | `docs/onboarding-qa.md` |

### Phase I — Release hygiene

| # | Task | Files |
|---|------|-------|
| I.1 | `CHANGELOG.md` entry for `0.4.0` | `CHANGELOG.md` |
| I.2 | `package.json` + `package-lock.json` version bump to `0.4.0` | `package.json`, `package-lock.json` |
| I.3 | README update — Schedule Quality Engine mention | `README.md` |
| I.4 | Run all gates: `lint`, `type-check`, `test:unit`, `build`, `test:e2e` | — |
| I.5 | Open PR `v1.4 → main`, squash merge after green CI | git |
| I.6 | Tag `v0.4.0` on the merge commit on `main` | git tag |
| I.7 | Update `version-status.md` → v1.4 ✅ shipped, v1.5 ⏳ planning (stop-and-ping) | `.claude/version-status.md` |
| I.8 | Append final Build Changelog entry in this file | `.claude/plan-v1.4.md` §17 |
| I.9 | Update `AGENT-HANDOFF.md` — next action: Claude authors `plan-v1.5.md` (no audit between v1.4 and v1.5 — Checkpoint 2 fires after v1.5) | `.claude/AGENT-HANDOFF.md` |

---

## 10. Parallel vs sequential

| Group | Tasks | Why parallel |
|---|---|---|
| **G1** | 0.0, 0.1, 0.2, 0.3 | Branch creation, then three independent close-outs (different files) |
| **G2** | A.2, A.3, A.4, A.5 | Independent DCMA checks once A.1 lands |
| **G3** | B.1, B.3, B.5 | Independent pure libs |
| **G4** | D.2, D.3, D.4 | Independent panel sub-components once D.1 shell lands |
| **G5** | E.1, E.2, E.3, E.4 | Independent TaskList / LinkBuilder edits |

| Sequential | Depends on | Why |
|---|---|---|
| Phase A | Phase 0 | Branch + close-outs first |
| Phase B | Phase A | Health composition reads DCMA result |
| Phase C | Phase 0.3 | StatBar restructure decision is upstream of Health stat |
| Phase D | Phase A, B | Panel renders DCMA + health output |
| Phase E | Phase B | TaskList warnings consume logicValidation helpers |
| Phase F | Phase D, E | Empty states need surfaces to exist |
| Phase G | Phase D, E, F | E2E covers integrated surface |
| Phase H | Phase C, D | Print needs the health number |
| Phase I | All other phases | Release |

---

## 11. Testing plan

### 11.1 Unit tests (new)

| Module | Coverage |
|---|---|
| `lib/dcma.ts` | All 14 checks, happy + edge: empty schedule, single-task schedule, schedule with no dependencies, schedule with all FS, schedule with 100% lag, schedule with no baseline, schedule with no resources |
| `lib/health.ts` | All 5 subscores present; baseline N/A (weight redistribution); no resources (resource subscore = N/A); all-N/A edge (returns 0 with note); clamping at 0 and 100 |
| `lib/floatDistribution.ts` | Bucket boundaries (-1, 0, 1, 5, 6, 10, 11, 20, 21, 50, 51, 100, 101) |
| `lib/logicValidation.ts` | Orphan with no preds + no succs; task with only preds (succ-orphan); task with only succs (pred-orphan); excessive lag at exactly 50% (not flagged); excessive lag at 51% (flagged) |

Target: ≥220 unit tests after Phase B (currently 173).

### 11.2 E2E tests (Playwright)

| Spec | Flow |
|---|---|
| `tests/e2e/quality-panel.spec.ts` (new) | Open panel from StatBar, render 14 DCMA findings, BEI N/A → capture baseline → BEI populated, orphan-warning click → LinkBuilder opens |
| `tests/e2e/a11y.spec.ts` (extend) | QualityPanel added to axe sweep |

Target: ≥15 E2E specs after Phase G (currently 13).

### 11.3 Manual QA

| Path | Why manual |
|---|---|
| Real-device mobile pass — closed in Phase 0.1 | Audit-v3 chronic gap |
| QualityPanel on 1280px and 1920px | Layout integrity — two-column does not collapse |
| Print canvas with quality score line | Header band fits inside A3 |

### 11.4 Performance verification

After Phase F, re-run the Phase 0.2 perf baseline with DCMA + health enabled. Confirm:
- No regression on cost recompute / demand recompute / drag-frame-time
- DCMA assessment under target (<30ms at 500 tasks)
- Quality Panel first render under target (<100ms)

---

## 12. Quality gate — Gate 2 checklist

**Branch hygiene**
- [x] Plan opens with a mandatory branch-creation step (top of this file)
- [x] AGENTS.md § Conventions codifies the one-branch-per-version rule as permanent

**Audit-v3 close-outs**
- [x] Phase 0.1 closes mobile real-device QA
- [x] Phase 0.2 closes perf re-measurement
- [x] Phase 0.3 closes StatBar density audit
- [x] If Phase 0.3 finds density >70%, Phase C.1 picks up the restructure

**Architecture**
- [x] DCMA / health / float / logic-validation live in pure `src/lib/*` modules
- [x] No schema change — `PERSISTED_SCHEMA_VERSION` stays at 2
- [x] No new dependencies (Phosphor icons already installed)
- [x] No on-Gantt UI additions — quality lands in StatBar / TaskList / modal

**Task breakdown**
- [x] All new files listed in §5.2
- [x] All modified files listed in §5.3
- [x] Each task ≤3 files / one commit
- [x] Parallel groups identified
- [x] Dependencies between phases explicit

**Testing**
- [x] Unit tests planned for every new pure module
- [x] E2E spec covers the integrated flow
- [x] axe a11y sweep extended to QualityPanel
- [x] Performance targets defined with measurement instructions

**Discipline**
- [x] Scope-creep traps from audit v3 §10.4 explicitly excluded (§3.2)
- [x] No new tokens that lack a job
- [x] Visual changes preserve v1.2's de-vibecoded posture
- [x] Quality panel is engineering report, not SaaS dashboard (§2.1)

Gate 2 passes. Plan is ready to execute.

---

## 13. Acceptance criteria — v1.4 ship gate

**Branch**
- [ ] All v1.4 commits live on branch `v1.4`
- [ ] Ship merges via PR `v1.4 → main`
- [ ] Tag `v0.4.0` placed on the merge commit
- [ ] Branch deletion deferred (kept for changelog/reference per v1.3 pattern)

**Audit-v3 close-outs**
- [ ] `docs/mobile-qa.md` shows real-device pass entries with dates/devices
- [ ] `docs/perf-v1.3-baseline.md` exists with measurements against §9 targets
- [ ] `docs/statbar-density-v1.3.md` exists with verdict (proceed / restructure)

**Capability**
- [ ] All 14 DCMA checks render in the Quality Panel with pass/fail badges
- [ ] Health score appears in the StatBar with appropriate color
- [ ] Clicking the Health stat opens the Quality Panel
- [ ] TopBar Quality button opens the Quality Panel
- [ ] Float distribution histogram renders inside the Quality Panel
- [ ] Orphan tasks show a Warning icon in the TaskList row
- [ ] Negative-float tasks show a red border on the float cell
- [ ] Excessive-lag dependencies show an amber dot on the dependency chip
- [ ] BEI shows "N/A" when no baseline is captured; populates after a baseline is captured
- [ ] Health score recomputes within target after any schedule edit

**Discipline**
- [ ] No schema change (`PERSISTED_SCHEMA_VERSION` still 2)
- [ ] No new gradients, card spam, generic CTAs
- [ ] Every new icon is Phosphor at consistent weight
- [ ] No hardcoded hex in any new component
- [ ] All new colors are tokens

**Trust**
- [ ] `npm run lint` clean
- [ ] `npm run type-check` clean
- [ ] `npm run test:unit` green (target: ≥220 tests after Phase B)
- [ ] `npm run build` clean; bundle delta <+20KB gzipped vs v1.3
- [ ] `npm run test:e2e` green (target: ≥15 specs after Phase G)
- [ ] Real-device mobile QA logged (Phase 0.1)
- [ ] Perf baseline documented (Phase 0.2)
- [ ] CI on `v1.4` and on the merge to `main` verified green
- [ ] CHANGELOG, README, version bump landed
- [ ] `v0.4.0` tagged

---

## 14. Risks & mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| **DCMA computation cost** at 500 tasks every edit | Medium | Memoize at App level with strict dep list. Performance target <30ms enforced in §8. If exceeded, defer with the 2px loading bar pattern (precedent from v1.3 histogram). |
| **Quality Panel "dashboard creep"** — color blocks, donut charts, large vanity metrics | High | Plan §2.1 + §7 ASCII surface map locks the engineering-report layout. PR review against the de-vibecoded pre-flight test. |
| **StatBar overflow** if Phase 0.3 finds density >70% but Phase C skips the restructure | High | Phase C.1 is conditional but required if §0.3 verdict says restructure. Document explicitly in the §0.3 deliverable. |
| **BEI false-negatives** when baseline schema differs from current | Medium | BEI computes against the latest baseline; v1.5 will introduce multi-baseline. v1.4 BEI is explicitly "against the single captured baseline" and the panel labels it as such. |
| **Health score "gameable"** by setting all task floats to ~15 days | Low | Quality engine is advisory, not enforcement. A PM who games their own self-audit is hurting only themselves. Document this in `docs/dcma-checks.md`. |
| **Orphan warning icon adds visual noise** at 1,800-task scale | Medium | Icon is `--color-text-tertiary` (low contrast); only renders when orphan. At <5% orphan rate (the DCMA threshold), the column is mostly empty. |
| **Critical Path Test (check 12)** requires a simulated forced delay — expensive if naive | Medium | Implementation: clone the schedule in memory, force-delay the deepest critical task by 600d, re-run CPM, compare end dates. ~2× cost of normal CPM, which is already well under perf target. |
| **Branch hygiene drift** — agents skipping the v1.4 branch step and committing on main | High | Mandatory top-of-plan section; codified in AGENTS.md § Conventions; verification step at end of Phase 0.0. |

---

## 15. Out of scope (deferred — reaffirmed)

See §3.2 for the canonical list. Highlights:

- **v1.5** — Multi-baseline + change orders + variance trends + cross-resource histogram overlay
- **v1.6** — S-curve + EVM + cash flow + executive PDF + per-resource cost escalation
- **v1.7** — Standard WBS coding + roll-up summaries
- **v1.8** — Project calendar + per-resource calendars + delay tracking
- **v1.9** — P6 / MPP / Procore integration
- **v2.0** — Cloud sync + multi-user + audit trail + comments
- **v2.1** — Portfolio dashboard
- **v2.2** — Density modes + saved views + bulk edit

If a v1.4 PR includes any of the above, reject. Point at this section.

---

## 16. Plan metadata

**Plan author:** Claude (planning agent)
**Plan ready for:** Codex implementation, starting with Phase 0.0 (branch creation) then Phase 0.1–0.3 (audit-v3 close-outs) then Phase A
**Plan supersedes:** None — additive on top of plan-v1.3 (shipped)
**Plan successor:** `plan-v1.5.md` (multi-baseline & change management — to be authored by Claude AFTER v1.4 ships; no audit between v1.4 and v1.5 — Checkpoint 2 fires after v1.5)

---

## 17. Build Changelog

> Codex appends an entry here per phase commit set. Format follows plan-v1.3.md §17.

### Phase 0.1 — Mobile QA priority note (desktop-first defer)

- Scope
  - Updated `docs/mobile-qa.md` with a dated product-priority note documenting that v1.4 execution is desktop/Vercel-first and that physical-device mobile QA is intentionally deferred.
- Files touched
  - `docs/mobile-qa.md`
- Verification
  - Manual doc review for clarity and explicit date stamp.
- Notes
  - This closes the requested documentation update without fabricating physical-device test results.
