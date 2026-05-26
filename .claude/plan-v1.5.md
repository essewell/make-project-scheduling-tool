# MAKE Scheduling Tool — Plan v1.5

**Status:** Draft · Multi-Baseline & Change Management (the third organ — historical record)
**Created:** 2026-05-23
**Author:** Claude (planning agent)
**Predecessors:** [plan-v1.4.md](./plan-v1.4.md) ✅ shipped 2026-05-22 (`v0.4.0`), [pm-audit-v3.md](./pm-audit-v3.md) (Checkpoint 1 — conditional pass at 5.5/10)
**Target ship tag:** `v0.5.0`
**Roadmap target fitness:** 6.0/10 → 6.8/10
**Checkpoint:** PM Audit Checkpoint 2 fires AFTER v1.5 ships (Claude writes `pm-audit-v4.md`)

---

## 0. One-line premise

v1.3 made the schedule **executable** (resources). v1.4 made the schedule **auditable** (DCMA + health). **v1.5 makes the schedule defensible over time** — when an owner asks "why are we six weeks behind?", the PM opens a baseline comparison view, points at the three change orders that drove the slip, and shows the variance trend that proves the slip happened in a specific four-week window.

---

## ⚠ Branch hygiene reminder (one-branch-per-version)

Codified as a permanent rule in `AGENTS.md § Conventions` since v1.4. Implementation agent MUST start with:

```
git checkout main
git pull --ff-only origin main
git checkout -b v1.5
git push -u origin v1.5
```

Verify with `git branch --show-current` → must print `v1.5`. Every v1.5 commit lands on `v1.5`; ship merges via PR `v1.5 → main`, then tag `v0.5.0` on the merge commit. No work goes directly to `main`. This is not re-documented per phase — agents who skip it must stop and fix before any other work.

---

## 1. Purpose & relationship to prior plans

| Plan | Scope | Outcome |
|------|-------|---------|
| v1.0 | Track C UX refinement | Shipped |
| v1.1 | Production readiness | Shipped 2026-05-22 (`v0.1.0`) |
| v1.2 | Visual refinement / de-vibecoded surface | Shipped 2026-05-22 (`v0.2.0`) |
| v1.3 | Resource foundation — the first organ | Shipped 2026-05-23 (`v0.3.0`) |
| v1.4 | Schedule quality engine — the self-audit organ | Shipped 2026-05-22 (`v0.4.0`) |
| **v1.5** | **Multi-baseline & change management — the historical-record organ** | **This plan** |

v1.0–v1.2 established the instrument. v1.3 added executable data (resources, cost). v1.4 added judgment about that data (DCMA, health). **v1.5 adds memory** — a complete, immutable record of how the project evolved, with the change orders that drove each shift and the variance trend that proves *when* the slip happened, not just *that* it happened.

The audience is unchanged: the PM running a real institutional build. The deliverable v1.5 produces is the artefact a PM puts in front of an owner in a contentious meeting — a side-by-side baseline comparison overlaid with change-order causality. That artefact is the difference between "we're behind, we'll catch up" and "we're behind by 14 days because of CO-007 (8 days) and CO-011 (6 days), both owner-directed, both signed, and here is the trend line that shows the slip was a step change, not gradual drift."

---

## 2. The "single organ at a time" principle (CARRIED FORWARD)

The roadmap's seventh guiding principle still holds. v1.5 ships:

- Multi-baseline storage + metadata + immutability
- Change-order tracking linked to tasks
- Baseline comparison view (modal)
- Variance trend analysis (line chart)
- BEI rebind to active baseline (light surgery on v1.4's quality engine)
- **Cross-resource histogram overlay** (deferred from v1.3 audit §5.1; legitimately bundled here because comparison-overlay UX shares chrome with baseline comparison)

v1.5 does **not** ship:

- S-curves, EVM, cash flow, executive PDF (v1.6)
- WBS coding, roll-up summary pills (v1.7)
- Project calendar overlays, per-resource calendars, weather/delay tracking (v1.8)
- P6 / MPP / Procore import-export (v1.9)
- Cloud sync / multi-user / comments / audit trail (v2.0)
- "What-if" baseline simulation (named in roadmap Q5 — explicit defer to v2.x)
- Auto-fix actions on change-order-driven slips
- AI-generated change-order narratives

If a contributor asks "while we're touching the baseline layer, can we also…" the answer is no.

### 2.1 Discipline preserved

Every visual surface added in v1.5 must pass the v1.2 pre-flight:
- "Would another product look identical if I swapped the wordmark?" — if yes, fail.
- "Does it have a job, or is it decorative?" — if decorative, fail.
- "Would I notice it missing?" — if no, fail.

**Baseline comparison and variance trend are the surfaces where 'dashboard creep' is easiest** — color-coded diff tables, trend gauges, and KPI tiles are the temptation. The comparison modal must look like an engineering diff report (monospaced numbers, +/- signs, plain-English driver list), not a Tableau dashboard. The variance trend line is a single SVG line with the baseline-zero rule — not a chart with annotations, gradients, or interactive crosshairs (v2.2 territory at earliest).

### 2.2 The defensibility floor

v1.5 preserves the floor that v1.1 → v1.4 built:
- Every new pure function gets a unit test.
- Every new user-visible flow gets an E2E spec.
- Schema migration 2 → 3 is additive, unit-tested, and round-trip safe.
- No new runtime dependencies. (Dev-only types if absolutely required — see §14.)
- No regression on existing 173 (v1.3) → ≥220 (v1.4) unit tests or ≥15 E2E specs.
- Performance contract: no regression on v1.4 baselines; new comparison computations meet §8 targets.

---

## 3. Scope

### 3.1 In scope (v1.5)

| Capability | What the PM sees |
|---|---|
| **Baseline metadata (reason, author, locked-at)** | When capturing a baseline, a small modal asks for `name`, `reason` (free text, ~120 char), and optionally `author` (defaults to a single-user placeholder — see §16). Captured baseline is immutable: cannot edit name/reason/snapshot after capture. Only "supersede with new baseline" (capture a new one) or "delete" (with confirm + undo). |
| **Baseline list view** | `BaselineMenu` (existing) becomes a richer overlay: each baseline row shows name, date, reason, author, task-count, and an actions cluster (Set Active · Compare · Delete). Active baseline is bolded; locked icon next to every row. |
| **Baseline comparison modal** | New modal. Pick any two baselines (`Baseline A` vs `Baseline B`) from two dropdowns. Body renders a diff table with three sections: **Slipped tasks** (sorted by slip days descending), **Added tasks** (in B but not A), **Removed tasks** (in A but not B). Per row: task name, A finish, B finish, Δ days, Δ cost (uses v1.3 cost rollup with current rates — see §16). Footer shows aggregate: total slip days, net task count change, total cost delta. |
| **Change orders** | New entity: `ChangeOrder { id, number, name, reason, status, createdAt, lockedAt, author?, affectedTaskIds, daysImpact, costImpact?, baselineLinkId? }`. Statuses: `draft`, `approved`, `rejected`. A `ChangeOrderManager` modal (mirrors `PartiesManager`) lists all change orders with filterable status. Each row expands to show affected tasks. |
| **Change order linkage from task panel** | SidePanel gets a small **Change Orders** section (collapsible, below `ResourceAssignmentSection`) listing change orders that affect this task. Click to open the change order in `ChangeOrderManager`. Side panel also shows "+ Link Change Order" action. |
| **Variance trend chart** | New chart in TopBar's stat cluster (or in the Quality Panel right column — see §7): a thin SVG line chart, ~140px tall, showing per-day variance in project finish vs the *active baseline* over time. Two states: **healthy** (variance trending flat or improving — green line) and **degrading** (variance worsening over last 7-day rolling window — amber line). No interactivity beyond hover for date + variance days. |
| **Variance snapshot persistence** | The variance trend reads from a new persisted store: `varianceSnapshots: VarianceSnapshot[]` — one entry per day, captured by the midnight ticker. Each snapshot stores `{ date, activeBaselineId, projectFinishVariance, criticalPathLength }`. Capped at 365 entries per baseline (rolling window). |
| **BEI rebind to active baseline** | The v1.4 DCMA check 14 (BEI) currently uses the most-recent baseline. v1.5 rebinds it to `activeBaselineId`. If `activeBaselineId` is null, BEI shows "N/A — select an active baseline" with a link that opens BaselineMenu. |
| **Cross-resource histogram overlay** *(carry from audit v3 §5.1)* | Resource selector pill allows multi-select (up to 4 resources). Histogram stacks selected resources with category-coded fills (labor/equipment/material follow existing palette). Single-resource path unchanged when only one is selected. Over-allocation rendered per-stack-segment in `--color-danger`. |
| **StatBar over-alloc resource names in tooltip** *(carry from audit v3 §10.2)* | Hover on `Over-alloc N` shows the names of affected resources in a `title=` attribute. Already-functional click behavior preserved. |
| **Reset confirmation copy update** | The reset confirm now lists "X baselines and Y change orders will be deleted" when those exist, matching the v1.3 pattern for resources. |

### 3.2 Out of scope (explicitly deferred)

| Deferred to | What |
|---|---|
| **v1.6** | S-curve, EVM (PV/EV/AC/SPI/CPI), cash flow forecast, executive PDF, time-phased rates, rate escalation |
| **v1.7** | Standard WBS coding export, group roll-up summary pills, hierarchy depth validation |
| **v1.8** | Project calendar overlay, weather/delay classification, per-resource calendars, shift patterns |
| **v1.9** | P6 (`.xer`) / MS Project (`.mpp`) import-export, Procore integration |
| **v2.0** | Cloud sync, multi-user, audit trail, comments, presence, role-based access |
| **v2.1** | Portfolio dashboard, cross-project resources, project templates |
| **v2.2** | Density modes, column customization, saved views, bulk edit, drag-to-create dependencies, offline mode |

**Specifically NOT in v1.5** even though they are tempting:
- **"What-if" baseline simulation** — branching a baseline forward without affecting current schedule. Real value but it is a second organ. Defer to v2.x.
- **Change order approval workflow** (multi-step routing, approvers, e-signatures) — v2.0 territory (multi-user).
- **Change order PDF export with cover page** — v1.6 (folds into executive reporting).
- **Resource-side variance** (e.g., "labor variance vs baseline") — v1.6 once EVM lands.
- **Variance trend per-task** (one trend line per critical task) — v2.2 (saved views / advanced charts).
- **Drag-and-drop on the variance trend chart** to scrub historical points — interactivity creep; v2.2.
- **Cross-baseline tag system** ("Pre-COVID", "Post-Design-Rev") beyond the free-text `name` field — sufficient as plain naming; tags are v2.x.

If a v1.5 PR includes any of the above, reject. Point at this section.

---

## 4. Phase 0 — Mandatory close-outs

### 4.1 Branch creation

| # | Task | Verification |
|---|------|--------------|
| 0.0 | Create branch `v1.5` from latest `main`, push to origin | `git branch --show-current` returns `v1.5` |

### 4.2 Chronic-gap close-outs carried from v1.4

The v1.4 changelog shows **Phase 0.1 was reverted then re-landed as a "desktop-first mobile QA defer" doc note** — i.e., the physical-device QA chronic gap from audit v2 and v3 was **documented as deferred but not closed**. That is acceptable while the product is desktop-first, but the deferral must remain explicit and dated in v1.5. v1.5 itself is desktop-first per user direction.

| # | Task | Deliverable | Files |
|---|------|-------------|-------|
| 0.1 | Re-affirm desktop-first mobile-QA defer with a new dated entry in `docs/mobile-qa.md`. If/when v1.5 lands any new mobile surface, this entry is revisited; otherwise the defer holds. | One dated paragraph in `docs/mobile-qa.md` referencing v1.5 scope. | `docs/mobile-qa.md` |
| 0.2 | Perf re-measurement at v1.4 scale. Load 500-task fixture, capture: (a) DCMA full assessment time, (b) health composition time, (c) Quality Panel first-render time, (d) drag-frame time with histogram open. Compare to plan-v1.4 §8 targets. If any miss >10%, fix on `v1.5` before Phase A capability work. | `docs/perf-v1.4-baseline.md` with measurements + pass/fail per target. | `docs/perf-v1.4-baseline.md` (new) |
| 0.3 | StatBar density re-audit at 1280px. v1.4 added the Health stat; v1.5 may add nothing to the StatBar but the existing density posture must be verified before any v1.5 visual surface lands. If density >75% (tighter than v1.4's 70% gate because v1.5 needs no new slot), restructure deferred to v1.6 (S-curve will need slots regardless). | `docs/statbar-density-v1.4.md` with screenshot, measurement, verdict (no-op / defer to v1.6). | `docs/statbar-density-v1.4.md` (new), `docs/v1.4-screenshots/statbar-1280.png` (new) |
| 0.4 | Verify v1.4 BEI computation against the **most-recent** baseline (current behavior). Document in a short note that v1.5 Phase G rebinds it to `activeBaselineId`. | One-paragraph note in `docs/dcma-checks.md` under BEI section. | `docs/dcma-checks.md` |

**Gate:** Phase 0 must close cleanly before Phase A begins. If Phase 0.2 surfaces a v1.4 perf regression that misses §8 targets by >10%, Phase A is paused until the regression is closed on `v1.5` as its own commit set.

---

## 5. Architecture & file map

### 5.1 Schema change — `PERSISTED_SCHEMA_VERSION` 2 → 3 (JUSTIFIED)

This is the second schema bump in the product's history. It is justified because:
- **`Baseline` gains metadata fields** (`reason`, `author?`, `lockedAt`, `supersededById?`). Adding them as new properties on the existing `Baseline` interface is additive and trivially migrate-able (defaults applied on load).
- **`ChangeOrder[]` is a new top-level persisted array** that did not exist in v1.4. There is no v1.4-compatible way to persist it without bumping the schema.
- **`varianceSnapshots: VarianceSnapshot[]` is a new top-level persisted array** for the variance trend chart.

The migration walk follows the v1.3 pattern: additive, defaults applied, no destructive change. A v1.4 `0.4.0` save file must continue to load cleanly in v1.5 and round-trip without data loss.

```ts
// migrateState walk: 0 → 1 → 2 → 3
// v2 → v3 step: append `changeOrders: []`, `varianceSnapshots: []`,
//               and for each baseline: lockedAt = baseline.date, reason = ''
```

### 5.2 New files

| File | Purpose |
|---|---|
| `src/lib/baselines.ts` | Pure: baseline metadata helpers, immutability assertion (`assertNotLocked`), `compareBaselines(a, b) → BaselineDiff`, `findBaselineById` |
| `src/lib/changeOrders.ts` | Pure: `linkChangeOrderToTask`, `unlinkChangeOrderFromTask`, `validateChangeOrder`, `aggregateImpacts(taskId, changeOrders)` |
| `src/lib/variance.ts` | Pure: `computeProjectFinishVariance(tasks, baseline) → days`, `appendVarianceSnapshot(snapshots, snapshot)`, `trimSnapshots(snapshots, maxPerBaseline = 365)` |
| `src/components/modals/BaselineCompareModal.tsx` | The diff-table modal |
| `src/components/modals/ChangeOrderManager.tsx` | CRUD modal mirroring `PartiesManager` shape |
| `src/components/baseline/BaselineDiffTable.tsx` | Inside compare modal: three-section diff (slipped / added / removed) |
| `src/components/baseline/BaselineSelectPair.tsx` | Two-dropdown picker used by compare modal |
| `src/components/changeorder/ChangeOrderRow.tsx` | Row component used in `ChangeOrderManager` and inside the SidePanel section |
| `src/components/changeorder/ChangeOrderSection.tsx` | Collapsible SidePanel section listing change orders affecting current task |
| `src/components/variance/VarianceTrendChart.tsx` | Thin SVG line chart for variance over time |
| `tests/unit/lib/baselines.test.ts` | Metadata, immutability, comparison happy + edge (empty baselines, one-task-different) |
| `tests/unit/lib/changeOrders.test.ts` | Linking, unlinking, validation (required fields, status transitions), aggregation |
| `tests/unit/lib/variance.test.ts` | Variance computation, snapshot append, snapshot trimming at 365 |
| `tests/e2e/baseline-compare.spec.ts` | Capture two baselines → open compare → assert slipped/added/removed rows → assert footer totals |
| `tests/e2e/change-orders.spec.ts` | Create change order → link to task → open task panel → assert section shows CO → unlink |
| `tests/e2e/variance-trend.spec.ts` | Capture baseline → advance midnight ticker (mock) → assert trend chart renders a line |
| `docs/baselines-and-change-orders.md` | Spec of baseline metadata, immutability rules, change order entity, comparison semantics |

### 5.3 Files modified

| File | What changes |
|---|---|
| `src/types/index.ts` | Extend `Baseline` (add `reason`, `author?`, `lockedAt`, `supersededById?`); add `ChangeOrder`, `ChangeOrderStatus`, `VarianceSnapshot`, `BaselineDiff` types; bump `PERSISTED_SCHEMA_VERSION` to 3; extend `PersistedState` with `changeOrders` and `varianceSnapshots` |
| `src/lib/storage.ts` | Extend `migrateState` with v2 → v3 walk (additive); update default state to include new arrays |
| `src/lib/dcma.ts` | DCMA check 14 (BEI) takes `activeBaselineId` as input; falls back to "N/A — select active baseline" when null |
| `src/lib/health.ts` | Same activeBaselineId plumbing for the baseline subscore |
| `src/components/App.tsx` | State: `compareModalOpen`, `changeOrderManagerOpen`, `changeOrderEditingId`; wire new modals; memoize variance snapshots; integrate midnight ticker for snapshot capture; pass `activeBaselineId` to DCMA |
| `src/hooks/useMidnightTicker.ts` | On tick, append a `VarianceSnapshot` for the active baseline (if any) |
| `src/components/topbar/TopBar.tsx` | Add "Change Orders" button (Phosphor `FileText` icon) alongside Resources / Phases / Parties / Quality; BaselineMenu gains "Compare baselines…" entry |
| `src/components/overlays/BaselineMenu.tsx` | Richer rows: reason, author, locked icon; per-row actions (Set Active · Compare · Delete); "Compare baselines…" action opens compare modal |
| `src/components/modals/QualityPanel.tsx` | If active baseline absent, BEI row shows the activeBaselineId-aware "select active baseline" copy with a link that closes the panel and opens BaselineMenu; add `VarianceTrendChart` to right column under `FloatDistributionChart` |
| `src/components/SidePanel.tsx` | Insert `ChangeOrderSection` below `ResourceAssignmentSection`, above existing dependency section |
| `src/components/StatBar.tsx` | Add resource-name list to over-alloc stat tooltip (audit v3 §10.2) |
| `src/components/ResourceSelectorPill.tsx` | Allow up to 4 resources selected (multi-select with `Shift+click` or a dedicated toggle); pass selected array to histogram |
| `src/components/ResourceHistogram.tsx` | Render stacked bars when multiple resources selected; single-resource path unchanged |
| `src/components/App.tsx` (reset) | Reset confirm copy mentions baselines and change orders when present |
| `src/lib/icons.ts` | Add `FileText` (change orders), `Lock` (baseline locked badge), `GitDiff` (compare action), `TrendUp` / `TrendDown` (variance trend) |
| `src/constants.ts` | Add `VARIANCE_SNAPSHOT_MAX_PER_BASELINE = 365`, `MAX_OVERLAY_RESOURCES = 4`, `VARIANCE_DEGRADING_WINDOW_DAYS = 7`, `VARIANCE_TREND_HEIGHT = 140` |
| `src/styles/tokens.css` | Add `--variance-line-healthy`, `--variance-line-degrading`, `--diff-added`, `--diff-removed`, `--diff-slipped`, `--baseline-locked-fg` |
| `docs/design-system.md` | Document v1.5 tokens |
| `CHANGELOG.md` | Add `0.5.0` entry on ship |
| `package.json`, `package-lock.json` | Version bump `0.4.0` → `0.5.0` |
| `README.md` | Mention multi-baseline + change orders |

### 5.4 Files unchanged (explicit non-goals)

| File | Why we are leaving it alone |
|---|---|
| `src/lib/cpm.ts` | Comparison computes against snapshots; CPM is unchanged |
| `src/lib/cost.ts`, `resourceDemand.ts`, `resources.ts` | v1.3 modules. Read-only for change-order cost impact via existing cost rollup. |
| `src/lib/floatDistribution.ts`, `logicValidation.ts` | v1.4 modules. Untouched. |
| The Gantt component | No on-Gantt change-order markers. (Roadmap puts task-bar markers in v1.8 with delay events — keep here.) |
| Mobile bottom sheet | No mobile-specific UI for v1.5; ChangeOrderSection inherits the sheet's scroll mechanics |
| Marketing page | Marketing pass is a separate post-ship task (chronic audit-v3 §8.4 item) |

---

## 6. UI surface map

```
┌─ TopBar ─────────────────────────────────────────────────────────────────────┐
│ MAKE · Project │ Baselines (3) ▾ │ Phases │ Parties │ Resources │ Change*    │
│                 ↑ now opens richer menu              │ Quality │  Orders     │
│                                                                  ↑ NEW       │
└──────────────────────────────────────────────────────────────────────────────┘

┌─ Baselines menu (overlay) ───────────────────────────────────────────────────┐
│  ● Baseline 1 · 2026-02-14 · J. Smith        🔒 124 tasks · "Pre-CO"        │
│       Set Active · Compare · Delete                                          │
│  ○ Baseline 2 · 2026-03-21 · J. Smith        🔒 131 tasks · "Post CO-007"   │
│       Set Active · Compare · Delete                                          │
│  ○ Baseline 3 · 2026-04-30 · J. Smith        🔒 136 tasks · "Owner pause"   │
│       Set Active · Compare · Delete                                          │
│  ─────────────────────────────────────────────────────────────────           │
│  + Capture baseline             ⚖ Compare baselines…                          │
└──────────────────────────────────────────────────────────────────────────────┘

┌─ Baseline Compare Modal ─────────────────────────────────────────────────────┐
│  Compare Baselines · Baseline 1 ↔ Baseline 2          [✕]                     │
│  ┌─ A: [Baseline 1 ▾] ─────┐  ┌─ B: [Baseline 2 ▾] ──────┐                   │
│                                                                               │
│  ─── Slipped tasks (8) ────────────────────────────────────────────           │
│  MEP rough-in              2026-04-15 → 2026-04-23   +8d   +$14,200          │
│  Drywall hang              2026-05-02 → 2026-05-08   +6d   +$3,400           │
│  Interior paint            2026-05-15 → 2026-05-19   +4d   +$1,800           │
│  …                                                                            │
│                                                                               │
│  ─── Added tasks (1) ──────────────────────────────────────────────           │
│  CO-007 remediation work   2026-03-25 → 2026-04-01   7d    $24,500           │
│                                                                               │
│  ─── Removed tasks (0) ────────────────────────────────────────────           │
│  (none)                                                                       │
│                                                                               │
│  ─── Totals ───────────────────────────────────────────────────────           │
│  Net slip: +14 days · Tasks: +1 / 0 / 0 · Cost delta: +$43,900               │
└──────────────────────────────────────────────────────────────────────────────┘

┌─ Change Order Manager ───────────────────────────────────────────────────────┐
│  Change Orders · 7 total · Filter: [All ▾]              [+ New]              │
│  ─────────────────────────────────────────────────────────────────           │
│  CO-007  Mechanical riser relocation     approved · +14d · +$38,400          │
│         3 tasks affected · J. Smith · 2026-03-15                              │
│  CO-011  Owner-directed paint upgrade    approved · +0d · +$8,900            │
│         2 tasks affected · J. Smith · 2026-04-02                              │
│  CO-012  Site logistics replan           draft    · — · —                     │
│         0 tasks linked · J. Smith · 2026-05-20                                │
│  …                                                                            │
└──────────────────────────────────────────────────────────────────────────────┘

┌─ Side Panel (task selected) ─────────────────────────────────────────────────┐
│  Task: MEP rough-in                                                          │
│  Planned: 2026-04-15 → 2026-04-23  ·  +8d vs Baseline 1                      │
│  Resources: ▼ Mech crew × 4 · Plumber × 2                                    │
│  Change orders: ▼                                                            │
│    • CO-007 Mechanical riser relocation  +8d  +$14,200                       │
│    + Link change order                                                        │
│  Dependencies: ▼                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

┌─ Quality Panel right column (additions) ─────────────────────────────────────┐
│ … Float Distribution Chart (v1.4) …                                          │
│ ─── Variance Trend (v1.5) ──────────────────────────────────────             │
│ +14 ─────────────────────────────────────╱── (degrading)                     │
│  +7 ───────────────────────╱────────────                                     │
│   0 ──────╱────────────────                                                  │
│  -7 ──────                                                                   │
│      Feb         Mar         Apr         May                                  │
│ Hover: 2026-04-15 · variance +6d                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 6.1 BaselineMenu redesign details

- Each row uses a 3-column grid: status dot · name+date+author · actions
- Locked icon is a small `Lock` glyph in `--baseline-locked-fg` (low-contrast)
- Compare action highlights the row and waits for second selection (or opens Compare modal pre-filled if only one)
- Delete confirms with "supersede with new baseline instead?" hint when this is the only baseline

### 6.2 ChangeOrderManager

- Mirrors `PartiesManager` exactly: header (title + count + new button), filterable list, click-to-expand row showing affected tasks
- Status pill colors: `draft` neutral, `approved` `--health-green`, `rejected` `--color-text-tertiary` strikethrough
- `daysImpact` and `costImpact` are read-only computed fields when linked tasks are loaded (`aggregateImpacts(taskId, changeOrders)` is the reverse direction)

### 6.3 ChangeOrderSection in SidePanel

- Collapsible (default collapsed if zero change orders linked, expanded if ≥1)
- Each chip shows CO number + name + impact summary
- Click chip → opens `ChangeOrderManager` with that CO pre-selected
- "+ Link change order" action opens a small picker

### 6.4 Variance trend chart

- 140px tall, full panel-column width inside Quality Panel
- Y-axis: variance days vs active baseline (negative = ahead, positive = behind)
- X-axis: time (last 90 days of snapshots, or all of them if <90)
- Line color: `--variance-line-healthy` (green) if 7-day rolling slope ≤0, `--variance-line-degrading` (amber) if >0
- Single hairline at y=0 (the baseline-zero rule)
- Hover dot shows date + variance days; no scrubber, no zoom

### 6.5 Cross-resource histogram overlay

- Up to 4 resources stacked
- Order: first selected on top, last selected on bottom (PM-controlled visual ordering)
- Capacity line per resource? No — capacity line only shown when a single resource selected. Multi-select hides individual capacity lines (charts too busy); over-allocation rendered per-segment as before
- Selector pill multi-select via `Shift+click` (additive) and `Click` (replace); a small "Compare resources" toggle in the pill row lets users opt into multi-select explicitly

---

## 7. Architecture impact

### 7.1 State ownership

`App.tsx` continues to own all state. New state slices:
- `changeOrders: ChangeOrder[]` (persisted)
- `varianceSnapshots: VarianceSnapshot[]` (persisted, capped at 365 per baseline)
- `compareModalOpen: { aId: string | null; bId: string | null } | null`
- `changeOrderManagerOpen: boolean`
- `changeOrderEditingId: string | null`
- `selectedResources: string[]` (transient — replaces v1.3's `selectedResource: string | null`; single-select case preserves identical behavior when length === 1)

### 7.2 Pure library boundary

`src/lib/baselines.ts`, `changeOrders.ts`, `variance.ts` are pure. They take inputs, return outputs. No React imports. No localStorage touches. Only `storage.ts` knows about persistence. This is the v1.3/v1.4 architectural shape held forward.

### 7.3 Snapshot capture & midnight ticker

`useMidnightTicker` (existing) ticks once per midnight. v1.5 adds a callback on tick:
```ts
useMidnightTicker(() => {
  if (activeBaselineId) {
    setVarianceSnapshots(prev => appendVarianceSnapshot(prev, {
      date: todayIso(),
      activeBaselineId,
      projectFinishVariance: computeProjectFinishVariance(tasks, activeBaseline),
      criticalPathLength: cpm.criticalPathLength
    }))
  }
})
```
The append is idempotent per `(date, activeBaselineId)` — a second call on the same day overwrites the snapshot. This means the trend reflects state at end-of-day, not session-start.

### 7.4 BEI rebinding

DCMA check 14 currently passes `baselines[baselines.length - 1]` internally. v1.5 changes the signature so `runDcmaAssessment` takes an `activeBaselineId` parameter; the check resolves it from the baselines array. If null, the check returns `{ passed: null, score: null, plainEnglish: "N/A — select an active baseline" }`. The health composition then redistributes the baseline subscore's weight across remaining subscores (existing v1.4 behavior).

### 7.5 No new dependencies

All v1.5 work uses primitives already in the project:
- SVG line chart for variance trend (same custom-rendering philosophy as histogram and float distribution chart)
- React state for modal open/close
- Phosphor icons (existing dep)
- CSS custom properties for new colors

If a contributor proposes `react-virtual` (rejected per CLAUDE.md), `chart.js`, `date-fns-tz`, or any cloud sync primitive, reject at PR review.

---

## 8. Performance contract

| Metric | Target | Measurement |
|---|---|---|
| Baseline comparison (500 tasks × 2 baselines) | <50ms | `performance.now()` around `compareBaselines` |
| Variance snapshot append + trim | <2ms | Same instrumentation |
| Variance trend chart first render (90 snapshots) | <50ms | E2E trace |
| BaselineCompareModal first render (cold) | <120ms | E2E trace |
| ChangeOrderManager first render (50 COs) | <100ms | E2E trace |
| Cross-resource histogram (4 stacked, 500 tasks) | <16ms (1 frame) | `performance.now()` around histogram render |
| Build size delta (v1.4 → v1.5) | <+25KB JS gzipped | `npm run build` bundle report |
| No regression on v1.4 perf baselines | unchanged | Re-run Phase 0.2 baseline after Phase J |

**Recompute strategy:** Comparison output is memoized at App level keyed on `[selectedAId, selectedBId, baselines]`. Variance snapshot capture is event-driven (midnight tick), not memo-driven. Cross-resource histogram render is memoized on `[selectedResources, demand, timeline]`.

---

## 9. Phased task breakdown

Each task ≤3 files, one commit. Phases ordered by dependency.

### Phase 0 — Branch + close-outs

| # | Task | Files |
|---|------|-------|
| 0.0 | Create branch `v1.5` from main, push to origin | (git) |
| 0.1 | Re-affirm desktop-first mobile QA defer with a dated entry | `docs/mobile-qa.md` |
| 0.2 | Perf re-measurement at v1.4 scale; document baseline | `docs/perf-v1.4-baseline.md` (new), perf fixture if needed |
| 0.3 | StatBar density re-audit; document verdict | `docs/statbar-density-v1.4.md` (new), screenshot |
| 0.4 | BEI activeBaselineId note in dcma docs | `docs/dcma-checks.md` |

### Phase A — Pure libraries

| # | Task | Files |
|---|------|-------|
| A.1 | Scaffold `src/lib/baselines.ts` with helpers: `findBaselineById`, `assertNotLocked` | `src/lib/baselines.ts` (new) |
| A.2 | Implement `compareBaselines(a, b) → BaselineDiff` (slipped / added / removed sections with cost delta via existing cost rollup) | `src/lib/baselines.ts`, `src/types/index.ts` (extend with `BaselineDiff`) |
| A.3 | Unit tests for baselines lib | `tests/unit/lib/baselines.test.ts` (new) |
| A.4 | Scaffold `src/lib/changeOrders.ts` with types + helpers (`linkChangeOrderToTask`, `unlinkChangeOrderFromTask`, `validateChangeOrder`, `aggregateImpacts`) | `src/lib/changeOrders.ts` (new), `src/types/index.ts` (extend with `ChangeOrder`, `ChangeOrderStatus`) |
| A.5 | Unit tests for change orders lib | `tests/unit/lib/changeOrders.test.ts` (new) |
| A.6 | Scaffold `src/lib/variance.ts` with `computeProjectFinishVariance`, `appendVarianceSnapshot`, `trimSnapshots` | `src/lib/variance.ts` (new), `src/types/index.ts` (extend with `VarianceSnapshot`) |
| A.7 | Unit tests for variance lib | `tests/unit/lib/variance.test.ts` (new) |
| A.8 | Document the entity model and immutability/comparison semantics | `docs/baselines-and-change-orders.md` (new) |

### Phase B — Schema migration 2 → 3

| # | Task | Files |
|---|------|-------|
| B.1 | Bump `PERSISTED_SCHEMA_VERSION` to 3; extend `PersistedState` with `changeOrders`, `varianceSnapshots`; extend `Baseline` with `reason`, `author?`, `lockedAt`, `supersededById?` | `src/types/index.ts` |
| B.2 | Extend `migrateState` with additive v2 → v3 walk (defaults applied) | `src/lib/storage.ts` |
| B.3 | Migration round-trip tests: v2 fixture loads in v1.5 → re-save → re-load produces equivalent state | `tests/unit/lib/storage.test.ts` (extend) |

### Phase C — Baseline metadata UI

| # | Task | Files |
|---|------|-------|
| C.1 | Update `captureBaseline` in App.tsx to open a small "Capture Baseline" modal (or extend existing call site) collecting `name`, `reason`, `author?` | `src/components/App.tsx`, `src/components/modals/CaptureBaselineModal.tsx` (new — or extend topbar BaselineMenu inline form, decide during implementation) |
| C.2 | Apply `lockedAt = baseline.date` at capture; enforce immutability via `assertNotLocked` in any baseline-edit code path | `src/lib/baselines.ts`, `src/components/App.tsx` |
| C.3 | Redesign `BaselineMenu` rows: reason, author, locked icon, per-row actions (Set Active · Compare · Delete) | `src/components/overlays/BaselineMenu.tsx`, `src/lib/icons.ts` (add `Lock`) |
| C.4 | Reset confirm copy lists baselines and change orders when present | `src/components/App.tsx` |

### Phase D — Change orders

| # | Task | Files |
|---|------|-------|
| D.1 | `ChangeOrderManager.tsx` shell — header, filter, list, new-button (mirror `PartiesManager`) | `src/components/modals/ChangeOrderManager.tsx` (new) |
| D.2 | `ChangeOrderRow.tsx` — list row + expanded affected-tasks section | `src/components/changeorder/ChangeOrderRow.tsx` (new) |
| D.3 | Wire TopBar "Change Orders" button (Phosphor `FileText` icon) opening the manager | `src/components/topbar/TopBar.tsx`, `src/lib/icons.ts` (add `FileText`), `src/components/App.tsx` |
| D.4 | `ChangeOrderSection.tsx` in SidePanel below `ResourceAssignmentSection`; lists COs affecting current task; "+ Link change order" action | `src/components/changeorder/ChangeOrderSection.tsx` (new), `src/components/SidePanel.tsx` |
| D.5 | Inline picker for linking COs to a task (small overlay with searchable list) | `src/components/changeorder/ChangeOrderSection.tsx` |
| D.6 | Validation rules: required `number`, `name`; status transitions (`draft → approved | rejected`; no transition back); inline error display | `src/lib/changeOrders.ts`, `src/components/modals/ChangeOrderManager.tsx` |

### Phase E — Baseline comparison

| # | Task | Files |
|---|------|-------|
| E.1 | `BaselineCompareModal.tsx` shell with two dropdowns and footer (uses `useDialogA11y`) | `src/components/modals/BaselineCompareModal.tsx` (new) |
| E.2 | `BaselineSelectPair.tsx` — controlled two-dropdown component | `src/components/baseline/BaselineSelectPair.tsx` (new) |
| E.3 | `BaselineDiffTable.tsx` — three sections (slipped / added / removed) with monospaced delta columns | `src/components/baseline/BaselineDiffTable.tsx` (new) |
| E.4 | Footer totals row computed from `BaselineDiff` | `src/components/modals/BaselineCompareModal.tsx` |
| E.5 | Wire "Compare baselines…" action in `BaselineMenu` → opens compare modal pre-filled with most-recent-two | `src/components/overlays/BaselineMenu.tsx`, `src/components/App.tsx`, `src/lib/icons.ts` (add `GitDiff`) |

### Phase F — Variance trend

| # | Task | Files |
|---|------|-------|
| F.1 | `VarianceTrendChart.tsx` — SVG line, healthy/degrading color logic, hover tooltip | `src/components/variance/VarianceTrendChart.tsx` (new) |
| F.2 | Wire chart into Quality Panel right column under `FloatDistributionChart` | `src/components/modals/QualityPanel.tsx` |
| F.3 | Extend `useMidnightTicker` with snapshot-capture callback; wire from App.tsx | `src/hooks/useMidnightTicker.ts`, `src/components/App.tsx` |
| F.4 | Edge cases: <2 snapshots → "Capture baseline and wait for trend to build" empty state; baseline-changed mid-trend → reset window | `src/components/variance/VarianceTrendChart.tsx` |

### Phase G — BEI rebind & DCMA wiring

| # | Task | Files |
|---|------|-------|
| G.1 | `runDcmaAssessment(...) ` signature: add `activeBaselineId: string | null` parameter; BEI check resolves from baselines array | `src/lib/dcma.ts`, `src/lib/health.ts`, `tests/unit/lib/dcma.test.ts` (extend) |
| G.2 | App.tsx passes `activeBaselineId` to memoized DCMA call | `src/components/App.tsx` |
| G.3 | Quality Panel: when BEI N/A, copy reads "N/A — select an active baseline" with an inline link that closes panel and opens BaselineMenu | `src/components/modals/QualityPanel.tsx`, `src/components/quality/DcmaFindingsTable.tsx` |

### Phase H — Cross-resource overlay + StatBar polish

| # | Task | Files |
|---|------|-------|
| H.1 | `ResourceSelectorPill` multi-select (`Shift+click` additive, `Click` replace, up to `MAX_OVERLAY_RESOURCES = 4`); explicit "Compare resources" toggle on the pill row | `src/components/ResourceSelectorPill.tsx`, `src/constants.ts` |
| H.2 | `ResourceHistogram` stacked rendering when multiple resources selected; single-resource path preserved | `src/components/ResourceHistogram.tsx` |
| H.3 | StatBar over-alloc tooltip lists affected resource names via `title=` attribute | `src/components/StatBar.tsx` |

### Phase I — Empty / loading / error states

| # | Task | Files |
|---|------|-------|
| I.1 | BaselineCompareModal empty state (zero or one baseline captured): "Capture at least two baselines to compare" | `src/components/modals/BaselineCompareModal.tsx` |
| I.2 | ChangeOrderManager empty state: "Log a change order to track schedule impacts" | `src/components/modals/ChangeOrderManager.tsx` |
| I.3 | VarianceTrendChart empty state (<2 snapshots) | `src/components/variance/VarianceTrendChart.tsx` |
| I.4 | ChangeOrderSection empty state (zero COs linked): "No change orders affect this task" with link to create one | `src/components/changeorder/ChangeOrderSection.tsx` |
| I.5 | Loading bar (2px) on compare modal if comparison >100ms (reuse v1.2 / v1.3 / v1.4 pattern) | `src/components/modals/BaselineCompareModal.tsx` |

### Phase J — E2E coverage

| # | Task | Files |
|---|------|-------|
| J.1 | E2E: capture two baselines → open compare modal → assert slipped/added/removed rows render → assert footer totals | `tests/e2e/baseline-compare.spec.ts` (new) |
| J.2 | E2E: open ChangeOrderManager → create CO → link to task → open task panel → assert section shows CO → unlink | `tests/e2e/change-orders.spec.ts` (new) |
| J.3 | E2E: capture baseline → mock midnight tick (use `--shift-clock` query param or fixture) → assert variance trend chart renders ≥2 points | `tests/e2e/variance-trend.spec.ts` (new) |
| J.4 | Extend `a11y.spec.ts` to include BaselineCompareModal, ChangeOrderManager, BaselineMenu overlay in the axe sweep | `tests/e2e/a11y.spec.ts` |
| J.5 | Extend `baseline.spec.ts` to assert metadata fields (name, reason, locked icon) on captured baseline | `tests/e2e/baseline.spec.ts` |

### Phase K — Print & docs

| # | Task | Files |
|---|------|-------|
| K.1 | Print canvas summary mode adds optional "Active baseline: <name> · variance +Nd" line in the header band (behind existing print-mode toggle) | `src/components/modals/PrintPreviewModal.tsx` |
| K.2 | Update `docs/design-system.md` with v1.5 tokens (variance colors, diff colors, baseline-locked color) | `docs/design-system.md` |
| K.3 | Update `docs/onboarding-qa.md` mentioning baseline capture as a recommended action after CSV import | `docs/onboarding-qa.md` |

### Phase L — Release hygiene

| # | Task | Files |
|---|------|-------|
| L.1 | `CHANGELOG.md` entry for `0.5.0` | `CHANGELOG.md` |
| L.2 | `package.json` + `package-lock.json` version bump to `0.5.0` | `package.json`, `package-lock.json` |
| L.3 | README update — multi-baseline + change orders mention | `README.md` |
| L.4 | Run all gates: `npm run lint`, `npm run type-check`, `npm run test:unit`, `npm run build`, `npm run test:e2e` | — |
| L.5 | Open PR `v1.5 → main`, squash merge after green CI | git |
| L.6 | Tag `v0.5.0` on the merge commit on `main` | git tag |
| L.7 | Update `version-status.md` → v1.5 ✅ shipped, ⚖ Checkpoint 2 ⏳ pending (stop-and-ping: Claude authors `pm-audit-v4.md`) | `.claude/version-status.md` |
| L.8 | Append final Build Changelog entry in this file | `.claude/plan-v1.5.md` §17 |
| L.9 | Update `AGENT-HANDOFF.md` — next action: Claude authors `pm-audit-v4.md` (Checkpoint 2) before any v1.6 planning | `.claude/AGENT-HANDOFF.md` |

---

## 10. Parallel vs sequential

| Parallel group | Tasks | Why |
|---|---|---|
| **G1** | 0.0, then 0.1, 0.2, 0.3, 0.4 in parallel | Branch first, then four independent close-outs (different files) |
| **G2** | A.1+A.2+A.3, A.4+A.5, A.6+A.7 in parallel | Three independent pure libs with independent test files |
| **G3** | D.1, D.2 in parallel after B.1 lands | Manager shell and row component are independent |
| **G4** | E.1, E.2, E.3 in parallel after A.2 + B.1 land | Compare modal sub-components independent |
| **G5** | H.1, H.2, H.3 in parallel | Three independent component edits |
| **G6** | I.1, I.2, I.3, I.4 in parallel after D and E land | Empty states across different files |

| Sequential | Depends on | Why |
|---|---|---|
| Phase A | Phase 0 | Branch + close-outs first |
| Phase B | Phase A (types are defined there) | Migration walk needs final type shape |
| Phase C | Phase B | Baseline UI consumes new metadata fields |
| Phase D | Phase B + A.4 | Change order UI consumes lib + persisted state |
| Phase E | Phase A.2 + Phase B + Phase C | Compare modal needs metadata to display |
| Phase F | Phase A.6 + Phase B | Variance chart needs snapshots stored |
| Phase G | Phase B + Phase C | BEI rebind needs activeBaselineId surface and baseline metadata |
| Phase H | Phase 0 | Independent — could run in parallel with Phase A actually; sequenced after for clarity |
| Phase I | Phase D, E, F | Empty states need surfaces to exist |
| Phase J | Phase D, E, F, G, H | E2E covers integrated surface |
| Phase K | Phase C, E, F | Print needs baseline metadata; docs reflect new tokens |
| Phase L | All other phases | Release |

**Critical path:** 0 → A → B → C → E → I → J → L. Phase H can join the parallel work once Phase 0 closes; Phase D can start once B.1 lands; Phase F needs A.6 + B.

---

## 11. Testing strategy

### 11.1 Unit tests (new)

| Module | Coverage |
|---|---|
| `lib/baselines.ts` | Comparison: identical baselines → empty diff; one slipped task; one added; one removed; mixed; baselines with different task counts; baseline with zero tasks. `assertNotLocked` throws when called on locked baseline. |
| `lib/changeOrders.ts` | Validation: missing number, missing name, invalid status transition. Linking: link/unlink idempotency, link to non-existent task. Aggregation: zero COs → zero impact, multiple COs aggregated correctly. |
| `lib/variance.ts` | Variance computation: positive (behind), negative (ahead), zero (on baseline). Snapshot append: same day overwrites; different day appends. Trim: array stays ≤365 per baseline; trimming preserves most recent. |
| `lib/dcma.ts` (extend) | BEI with `activeBaselineId = null` returns N/A; BEI with valid baseline produces same value as v1.4; BEI with `activeBaselineId` referencing non-existent baseline returns N/A. |
| `lib/storage.ts` (extend) | v2 → v3 migration: legacy fixture loads cleanly; baseline metadata defaults applied; changeOrders + varianceSnapshots default to `[]`. Round-trip: save → load produces equivalent state. |

**Target:** ≥260 unit tests after Phase A (currently ~220 post-v1.4).

### 11.2 E2E tests (Playwright)

| Spec | Flow |
|---|---|
| `tests/e2e/baseline-compare.spec.ts` (new) | Load example, capture B1, edit a task, capture B2, open compare → assert diff renders, assert totals |
| `tests/e2e/change-orders.spec.ts` (new) | Create CO, link to task, open side panel → CO chip visible, unlink, manager filter by status |
| `tests/e2e/variance-trend.spec.ts` (new) | Capture baseline, advance mocked clock (test hook), assert trend chart renders ≥2 points |
| `tests/e2e/baseline.spec.ts` (extend) | Assert reason + author + locked icon on captured baseline |
| `tests/e2e/a11y.spec.ts` (extend) | Add BaselineCompareModal, ChangeOrderManager, BaselineMenu to axe sweep |

**Target:** ≥18 E2E specs after Phase J (currently 9 spec files post-v1.4 with 13 individual specs equivalent).

### 11.3 Accessibility tests

- All three new modals (`BaselineCompareModal`, `ChangeOrderManager`, capture-baseline modal if separate) use `useDialogA11y` (Tab/Shift+Tab/Escape contract)
- All new interactive elements have labels (axe-core sweep enforces)
- Variance trend chart hover tooltips have `aria-label` describing the date and variance value
- Cross-resource histogram exposes selected resource names in chart `aria-label`

### 11.4 Performance verification

After Phase J, re-run Phase 0.2 perf baseline with v1.5 features active. Verify:
- DCMA + health composition unchanged (BEI rebind has zero perf delta — just a parameter pass)
- Comparison <50ms at 500 tasks × 2 baselines
- Cross-resource stacked histogram <16ms at 4 resources × 500 tasks
- No regression on existing v1.4 targets (drag frame time, Quality Panel first render)

### 11.5 Manual QA

| Path | Why manual |
|---|---|
| Capture 3 baselines and run pairwise comparisons | Subjective — does the diff make sense? Are the driver labels readable? |
| Variance trend with 30+ days of snapshots | Layout integrity — does the line stay readable as the dataset grows? |
| Quality Panel with BEI N/A → link to BaselineMenu → set active → return to Quality Panel | Cross-modal flow — verify panel reopens cleanly with BEI populated |
| Stacked histogram with 4 mid-allocation resources | Visual density — confirm the chart does not become illegible |
| Print canvas with new baseline header line | Header band fits inside A3, line truncates gracefully with long baseline names |

---

## 12. Quality gate — Gate 2 checklist

**Branch hygiene**
- [x] Plan reminds of the one-branch-per-version rule
- [x] AGENTS.md § Conventions codifies the rule as permanent (since v1.4)

**Audit-v3 / v1.4 carry-overs**
- [x] Phase 0.1 re-affirms mobile QA defer (desktop-first)
- [x] Phase 0.2 closes v1.4 perf re-measurement
- [x] Phase 0.3 closes StatBar density re-audit
- [x] Phase 0.4 documents BEI activeBaselineId rebind plan in dcma docs
- [x] Cross-resource histogram overlay scheduled in Phase H (audit v3 §5.1 carry)
- [x] StatBar over-alloc resource-name tooltip scheduled in Phase H.3 (audit v3 §10.2 carry)

**Architecture**
- [x] Baselines / change orders / variance live in pure `src/lib/*` modules
- [x] Schema bump to 3 is additive and migration-tested (justified — see §5.1)
- [x] No new runtime dependencies
- [x] No on-Gantt UI additions for v1.5 (change-order task markers deferred to v1.8 with delay markers)
- [x] App.tsx remains the single state owner

**Task breakdown**
- [x] All new files listed in §5.2
- [x] All modified files listed in §5.3
- [x] Each task ≤3 files / one commit
- [x] Parallel groups identified
- [x] Dependencies between phases explicit

**Testing**
- [x] Unit tests planned for every new pure module
- [x] Migration round-trip test planned
- [x] E2E spec covers each integrated flow
- [x] axe a11y sweep extended to all new modals
- [x] Performance targets defined with measurement instructions

**Discipline**
- [x] Scope-creep traps from §3.2 explicitly excluded
- [x] No new tokens that lack a job
- [x] Visual changes preserve v1.2's de-vibecoded posture
- [x] Baseline compare modal is engineering diff, not SaaS dashboard (§2.1)
- [x] Variance trend is a single line + baseline-zero rule, not a multi-series chart

Gate 2 passes. Plan is ready to execute.

---

## 13. Acceptance criteria — v1.5 ship gate

**Branch**
- [ ] All v1.5 commits live on branch `v1.5`
- [ ] Ship merges via PR `v1.5 → main`
- [ ] Tag `v0.5.0` placed on the merge commit
- [ ] Branch deletion deferred (kept per v1.3 / v1.4 pattern)

**Carry-overs**
- [ ] `docs/mobile-qa.md` carries a dated v1.5 desktop-first defer entry
- [ ] `docs/perf-v1.4-baseline.md` exists with measurements vs plan-v1.4 §8 targets
- [ ] `docs/statbar-density-v1.4.md` exists with verdict
- [ ] `docs/dcma-checks.md` BEI section notes activeBaselineId rebind

**Capability**
- [ ] Capturing a baseline records `name`, `reason`, `lockedAt`; baseline is immutable after capture
- [ ] BaselineMenu shows all baselines with metadata, locked icon, per-row actions
- [ ] BaselineCompareModal renders three diff sections + footer totals for any two baselines
- [ ] ChangeOrderManager supports CRUD with status transitions (`draft → approved | rejected`)
- [ ] SidePanel `ChangeOrderSection` lists COs affecting selected task, supports link/unlink
- [ ] VarianceTrendChart renders in Quality Panel right column with healthy/degrading color logic
- [ ] Midnight ticker captures a `VarianceSnapshot` per day for the active baseline
- [ ] BEI uses `activeBaselineId` and shows N/A with link-to-menu copy when null
- [ ] ResourceSelectorPill supports multi-select up to 4; ResourceHistogram renders stacked bars
- [ ] StatBar over-alloc tooltip lists affected resource names

**Discipline**
- [ ] `PERSISTED_SCHEMA_VERSION = 3`; v2 fixtures load + round-trip cleanly
- [ ] No new runtime dependencies
- [ ] No new gradients, card spam, generic CTAs
- [ ] Every new icon is Phosphor at consistent weight
- [ ] No hardcoded hex in any new component
- [ ] All new colors are tokens
- [ ] No `any`, no force-unwrap, TypeScript strict still clean

**Trust**
- [ ] `npm run lint` clean
- [ ] `npm run type-check` clean
- [ ] `npm run test:unit` green (target: ≥260 tests after Phase A)
- [ ] `npm run build` clean; bundle delta <+25KB gzipped vs v1.4
- [ ] `npm run test:e2e` green (target: ≥18 specs after Phase J)
- [ ] Perf baseline documented (Phase 0.2) and no v1.5 regression
- [ ] CI on `v1.5` and on the merge to `main` verified green
- [ ] CHANGELOG, README, version bump landed
- [ ] `v0.5.0` tagged

---

## 14. Risks & mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| **Schema migration data loss** for users with v2 saves | High | Round-trip migration test (B.3) covers any v2 fixture. Default empty arrays for new fields; default `lockedAt = baseline.date` so existing baselines are treated as locked at capture-equivalent timestamp. |
| **Baseline immutability bypass** via direct localStorage edit | Low | Out of scope — `assertNotLocked` enforces in-app paths; localStorage is the user's machine and not a trust boundary. Document in `docs/baselines-and-change-orders.md`. |
| **Variance trend snapshot bloat** | Medium | Capped at 365 per baseline (`VARIANCE_SNAPSHOT_MAX_PER_BASELINE`). `trimSnapshots` runs on append. Long-term solution (compaction by week/month) is v2.x. |
| **Cross-resource overlay illegibility** at 4 stacked resources | Medium | `MAX_OVERLAY_RESOURCES = 4` enforced; selector UI disables 5th selection. Manual QA confirms visual density. If 4 is still illegible, drop to 3 in a follow-up. |
| **Comparison-modal "dashboard creep"** — vanity KPIs, donuts, RAG dots | High | §2.1 + §6 ASCII surface map lock the engineering-diff layout. PR review against de-vibecoded pre-flight test. |
| **BEI rebind breaks existing v1.4 quality flow** | Medium | Backwards-compatible: when no `activeBaselineId` is set but a baseline exists, fall back to most-recent for one release with a `console.warn`; explicit N/A behavior fully takes over in v1.6. Decide during Phase G implementation; default-on the explicit N/A behavior. |
| **Midnight ticker double-tick** in StrictMode regressing variance snapshots | Medium | The `useMidnightTicker` cleanup contract was tested in v1.3 Phase 0.3. Add a v1.5 test specifically for snapshot idempotency on double-tick. |
| **Change order entity becomes a junk drawer** (every PR wants a new field) | Medium | Schema is fixed at v1.5 ship: `{ id, number, name, reason, status, createdAt, lockedAt, author?, affectedTaskIds, daysImpact, costImpact?, baselineLinkId? }`. New fields require a v1.6+ plan entry. |
| **Variance trend becomes interactive (zoom, scrub, brush)** | Medium | Hover tooltip only. No zoom, no scrub. Document in §6.4. Defer interactivity to v2.2. |
| **`useMidnightTicker` callback signature change** breaks v1.4 onboarding flow | Medium | Add the callback as an optional argument with no behavior change when absent. Existing v1.4 call sites pass nothing. |
| **Time skew across user sessions** producing inconsistent variance snapshots | Low | Snapshot uses `todayIso()` (local timezone, midnight-rounded). Users on multiple machines will see snapshots from each — acceptable for v1.5; cloud sync (v2.0) reconciles. |
| **Branch hygiene drift** | High | Codified in AGENTS.md; reminder at top of plan; verification step in Phase 0.0. |

---

## 15. Out of scope (deferred — reaffirmed)

See §3.2 for the canonical list. Highlights:

- **v1.6** — S-curve + EVM (PV/EV/AC/SPI/CPI) + cash flow + executive PDF + time-phased rates + rate escalation
- **v1.7** — Standard WBS coding + roll-up summary pills + hierarchy depth validation
- **v1.8** — Project calendar overlay + per-resource calendars + delay tracking + shift patterns
- **v1.9** — P6 / MPP / Procore integration
- **v2.0** — Cloud sync + multi-user + change order approval routing + audit trail + comments
- **v2.1** — Portfolio dashboard + cross-project resources + project templates
- **v2.2** — Density modes + saved views + bulk edit + drag dependencies + offline mode + variance trend interactivity (zoom/scrub) + per-task variance trends

If a v1.5 PR includes any of the above, reject. Point at this section.

---

## 16. Stop-and-ping points (implementation agent pauses)

These are decisions the implementation agent must NOT make alone. Pause, surface, wait for human.

| # | Trigger | What to surface |
|---|---------|-----------------|
| **S1** | Phase 0.2 finds a v1.4 perf regression >10% on any §8 metric | Stop. Surface the measurements and the suspected cause. Wait for direction (fix here vs roll back v1.4 commit). |
| **S2** | Phase B.3 migration round-trip test fails on any v2 fixture | Stop. Do not ship the schema bump. Surface the failing fixture + diff. Wait for direction (fix migration vs add fixture-specific shim). |
| **S3** | Phase D.6 `ChangeOrderStatus` lifecycle needs an additional transition (e.g., `approved → rejected` for late corrections) | Stop. Default behavior is strict (`draft → approved | rejected`, no transition back). Surface the use case before extending. |
| **S4** | Phase F.4 reveals the variance trend is misleading when the active baseline changes mid-window | Stop. Default behavior is to reset the trend window when `activeBaselineId` changes. Surface for confirmation if a different policy (carry-forward, dual-line) seems warranted. |
| **S5** | Phase G.1 BEI rebind exposes a v1.4 health-score change that breaks the v1.4 E2E for `quality-panel.spec.ts` | Stop. Update the E2E only after confirming the new BEI behavior is intentional and documented. |
| **S6** | Phase H.2 stacked histogram performance exceeds 16ms at 4 resources × 500 tasks | Stop. Surface measurements. Wait for direction (drop overlay limit to 3, defer overlay to v1.6, or invest in render optimization). |
| **S7** | Any phase requires a new runtime dependency | Stop. Surface the dependency, alternatives rejected, and bundle-size impact. v1.5 forbids new deps without explicit human approval. |
| **S8** | Phase 0.0 — branch `v1.5` already exists or local tree is dirty | Stop. Surface state. Do not force-push, do not auto-delete. |
| **S9** | `author` field: single-user defaults — surface the placeholder (e.g., `"local-user"` or read from a `localStorage` "you" key) before committing the default | Stop on first encounter. v2.0 introduces real auth; v1.5 needs a sensible placeholder. |

If none of these trigger, the agent proceeds phase by phase without further pings until Phase L.5 (the PR open) and Phase L.7 (the version-status update, which is itself the next stop-and-ping — Claude takes over to write `pm-audit-v4.md`).

---

## 17. Build Changelog

> Codex appends an entry here per phase commit set. Format follows plan-v1.4.md §17 and plan-v1.3.md §17.
> Gap acknowledgement (added in v1.6 Phase 0.C): full phase-by-phase backfill was not performed; branch `v1.5` git history is the authoritative record for missing entries.

### Phase 0.X — <title>

- Scope
  - <what landed>
- Files touched
  - `path/to/file.ts`
- Verification
  - `npm run lint` / `type-check` / `test:unit` / `test:e2e` results
  - Manual checks performed
- Notes
  - Anything future agents need to know

(One entry per commit set. Phases A through L follow the same template. Final entry on ship summarises the version, version bump, tag, and links the PR.)

### Phase 0.1 — Re-affirm desktop-first mobile QA defer

- Scope
  - Added a dated v1.5 note confirming mobile real-device QA defer remains intentional for this desktop-first version.
- Files touched
  - `docs/mobile-qa.md`
- Verification
  - `npm run lint` pending in commit gate
  - `npm run type-check` pending in commit gate
  - `npm run test:unit` pending in commit gate
  - Manual check: verified dated v1.5 paragraph references scope and defer policy
- Notes
  - This closes Phase 0.1 documentation requirement without adding mobile-surface scope to v1.5.

### Phase 0.2 — v1.4 perf re-measurement baseline

- Scope
  - Added v1.4 baseline perf report covering DCMA assessment, health composition, Quality Panel first render, and drag-frame timing with histogram open.
  - Documented approved exception for the Quality Panel cold-open metric miss.
- Files touched
  - `docs/perf-v1.4-baseline.md`
- Verification
  - `npm run lint` pass
  - `npm run type-check` pass
  - `npm run test:unit` pass (199 tests)
  - Manual check: measurement values and pass/fail verdicts align with plan-v1.4 §8 targets.
- Notes
  - S1 threshold miss remains on Quality Panel first render; approved to defer and continue v1.5 execution.

### Phase L — Release hygiene (v1.5 ships as v0.5.0)

- Scope
  - CHANGELOG.md entry for `0.5.0` (multi-baseline, change orders, variance trend, a11y fixes)
  - `package.json` + `package-lock.json` version bumped `0.4.0` → `0.5.0`
  - README.md updated to mention multi-baseline, variance trend, change orders
  - All gates passed (lint, type-check, unit, build, E2E)
- Files touched
  - `CHANGELOG.md`
  - `package.json`
  - `package-lock.json`
  - `README.md`
  - `.claude/version-status.md`
  - `.claude/AGENT-HANDOFF.md`
  - `.claude/plan-v1.5.md` (this entry)
- Verification
  - `npm run lint` ✅ 0 warnings
  - `npm run type-check` ✅ clean
  - `npm run test:unit` ✅ 220 tests passing (17 suites)
  - `npm run build` ✅ clean (app-DLdEGcBM.js 297 kB, gzip 67 kB)
  - `npm run test:e2e` ✅ 19/19 passing (48.5s)
- Notes
  - PR `v1.5 → main` and tag `v0.5.0` are human actions — not scripted.
  - Next agent is Claude (planning), authoring `pm-audit-v4.md` (Checkpoint 2).

### Phase D.4 — SidePanel change-order section

- Scope
  - Added a new `ChangeOrderSection` below `ResourceAssignmentSection` in `SidePanel`.
  - Lists all change orders affecting the current task and supports opening the manager from a row click.
  - Added a `+ Link change order` action entry point for the D.5 picker work.
- Files touched
  - `src/components/changeorder/ChangeOrderSection.tsx`
  - `src/components/panels/SidePanel.tsx`
  - `src/components/App.tsx`
  - `src/components/modals/ChangeOrderManager.tsx`
- Verification
  - `npm run lint` pass (executed as `npm.cmd run lint` due local PowerShell policy)
  - `npm run type-check` pass (executed as `npm.cmd run type-check`)
  - `npm run test:unit` pass (220 tests, executed as `npm.cmd run test:unit`)
  - Manual check: linked CO rows in SidePanel open ChangeOrderManager with selected-row highlight.
- Notes
  - Added `changeOrderEditingId` in `App.tsx` for pre-selection flow from SidePanel chips.

---

## 18. Plan metadata

**Plan author:** Claude (planning agent)
**Plan ready for:** Codex implementation, starting at Phase 0.0 (branch creation), then Phase 0.1–0.4 (carry-over close-outs), then Phase A
**Plan supersedes:** None — additive on top of plan-v1.4 (shipped)
**Plan successor:** `pm-audit-v4.md` (Checkpoint 2 — Claude authors AFTER v1.5 ships, BEFORE any v1.6 work). v1.6 plan is itself authored only after Checkpoint 2 closes with a pass or conditional pass.

---

## 19. Assumptions made

These are the assumptions that shaped this plan. If any prove false, surface immediately.

1. **v1.4 is shipped on `main` tagged `v0.4.0`.** Confirmed by git log (5d393c6, e9d6eb9) and `package.json` (`"version": "0.4.0"`).
2. **The existing `Baseline` type is extensible additively.** Confirmed — current shape is `{ id, name, date, tasks }`; v1.5 appends optional fields.
3. **The existing `activeBaselineId: string | null` state in App.tsx is the canonical "which baseline is the comparison reference" pointer.** Confirmed at `App.tsx:67`.
4. **`useMidnightTicker` can accept an optional callback.** Confirmed — its current shape supports it cleanly without breaking v1.4 callers.
5. **The single-user placeholder for `author` is acceptable for v1.5.** Real user identity is a v2.0 concern (cloud sync / multi-user). v1.5 stores a sensible string default; pinned by stop-and-ping S9.
6. **Cross-resource histogram overlay belongs in v1.5.** Audit v3 §10.4 named it as the most-requested v1.3 follow-up, and the multi-select UI shares chrome with multi-baseline selection. Both bundling and deferring to v1.6 are defensible; bundling here is the lower-risk choice because v1.6 already carries S-curve + EVM + cash flow weight.
7. **Variance trend chart belongs in the Quality Panel right column, not the StatBar.** The StatBar density audit (Phase 0.3) verifies the StatBar cannot absorb a trend chart. The Quality Panel right column has room beneath the float distribution chart.
8. **Schema bump 2 → 3 is acceptable.** The user direction said "no schema change unless justified"; multi-baseline + change orders + variance snapshots all require persistence and cannot exist without the bump. The bump is additive and round-trip safe.
9. **Mobile-first work is not required in v1.5.** User direction is desktop-first; mobile QA defer is re-affirmed in Phase 0.1.
10. **`a11y.spec.ts` is the project's accessibility harness.** Confirmed (`tests/e2e/a11y.spec.ts` exists; v1.4 extended it to QualityPanel).
11. **`useDialogA11y` is the modal a11y hook.** Inferred from v1.4 plan; if the hook is named differently in code (e.g., `useDialog`), Phase E.1 adapts during implementation. Not a stop-and-ping — name-only mismatch.
12. **Plan files are local artifacts and need not be committed.** User direction: "Local planning/docs files can be updated locally but should not be assumed as committed artifacts unless explicitly requested." This plan is written to `.claude/plan-v1.5.md` locally; commit decision is the human's.

---

**Plan ready for Codex implementation starting at Phase 0.0.**
