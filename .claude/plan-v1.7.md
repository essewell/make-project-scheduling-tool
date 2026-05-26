# MAKE Scheduling Tool — Plan v1.7

**Status:** Draft · WBS & Hierarchy Deepening (the fifth organ — the schedule's spine, plus the cost-tracking close-out)
**Created:** 2026-05-26
**Author:** Claude (planning agent)
**Predecessors:** [plan-v1.6.md](./plan-v1.6.md) ✅ implementation complete on branch `v1.6` 2026-05-25 (`v0.6.0` pending PR/tag), [pm-audit-v4.md](./pm-audit-v4.md) (Checkpoint 2 — pass with one condition closed in v1.6 Phase 0.1)
**Target ship tag:** `v0.7.0`
**Roadmap target fitness:** 7.5/10 → 8.0/10
**Checkpoint:** None during v1.7 (next checkpoint is Checkpoint 3 after v1.8 ships)

---

## 0. One-line premise

v1.3 made the schedule **executable**. v1.4 made it **auditable**. v1.5 made it **defensible over time**. v1.6 made it **speak to owners**. **v1.7 makes the schedule a structural framework** — when a PM is scheduling a 1,800-task hospital build organised by Division 01 / Division 03 / Division 08 / etc., the WBS is no longer a number computed at render time for cosmetic indentation — it is a persistent data field on every task and every group, sortable, filterable, exportable, validatable, and rollable-up. The cost-tracking organ (AC + CPI) lands alongside, closing the EVM picture that v1.6 deferred.

---

## ⚠ Branch hygiene reminder (one-branch-per-version)

Codified as a permanent rule in `AGENTS.md § Conventions` since v1.4. Implementation agent MUST start with:

```
git checkout main
git pull --ff-only origin main
git checkout -b v1.7
git push -u origin v1.7
```

Verify with `git branch --show-current` → must print `v1.7`. Every v1.7 commit lands on `v1.7`; ship merges via PR `v1.7 → main`, then tag `v0.7.0` on the merge commit. No work goes directly to `main`. This is not re-documented per phase — agents who skip it must stop and fix before any other work.

---

## ⚠ Codex operating rules (READ AT EVERY PHASE BOUNDARY)

These are not v1.7-specific; they are the always-on rules for implementing any plan in this codebase. Embedded here because v1.7 is the first schema-changing version since v1.5 and the first version to widen *both* the data model (`Task`, `Group`) and the cost-tracking surface in the same cycle — process discipline matters most under that load.

- **One process at a time.** No background `vitest --watch`. No parallel `vite preview` servers. Foreground each gate, wait for it to finish, then move on.
- **Build before every E2E run.** `npm run build` then `npm run test:e2e`. The E2E harness reads `dist/`. Running E2E against a stale build silently masks regressions.
- **Stop-and-ping triggers are mandatory.** Each is named in §16. Do not push past a failing gate.
- **All icons from `src/lib/icons.ts` only.** Add new Phosphor exports there first; consumers import from `src/lib/icons.ts` only. No direct `@phosphor-icons/react` imports in components.
- **All colors via `var(--token)`.** Zero hardcoded hex in components. New tokens land in `src/styles/tokens.css` under both light root and `@media (prefers-color-scheme: dark)` overrides.
- **`src/lib/*` modules are pure.** Input → output. No React imports. No localStorage touches. Only `src/lib/storage.ts` touches persistence. This is Key Design Decision #9 in `CLAUDE.md`; v1.7's `wbs.ts` and `actualCost.ts` modules must hold it.
- **Schema migration is additive only.** The 3 → 4 walk applies defaults; existing v3 saves must round-trip without data loss. See §5.1.
- **`Task.deps[]` is render-only.** Never write to it from new code. The `Task.deps[]` direct-write lint rule is still deferred to v2.0 per plan-v1.6 §4.5 Phase 0.F.
- **No new runtime dependencies.** Specifically: no tree/hierarchy libraries (react-arborist, react-sortable-tree, etc.), no chart libraries (carry-forward from v1.6), no PDF libraries. Manual recursion is fine — see §7.3.
- **No `any`, no force-unwrap.** TypeScript strict stays clean.
- **No nested ternaries.** Extract to if/else or guard clauses.
- **`.gitignore` is absolute.** Per `START-HERE.md` §⚠ — check before every `git add`, verify before every `git push`. The recurring `playwright-report/index.html` noise file MUST NOT be staged at any point.
- **`.claude/` updates are commit-required in the same branch cycle.** Per `AGENTS.md § .claude Commit Rule`. Do not leave handoff or build-changelog edits unstaged across handoffs.
- **Context auto-compaction.** Per `START-HERE.md` §📝 — after every 2 consecutive mini-tasks, summarize last 3 decisions + state into `AGENT-HANDOFF.md` before continuing.

If any of the above is in tension with a phase task, stop and ping. Do not silently bend the rule.

---

## 1. Purpose & relationship to prior plans

| Plan | Scope | Outcome |
|------|-------|---------|
| v1.0 | Track C UX refinement | Shipped |
| v1.1 | Production readiness | Shipped 2026-05-22 (`v0.1.0`) |
| v1.2 | Visual refinement / de-vibecoded surface | Shipped 2026-05-22 (`v0.2.0`) |
| v1.3 | Resource foundation — the first organ | Shipped 2026-05-23 (`v0.3.0`) |
| v1.4 | Schedule quality engine — the self-audit organ | Shipped 2026-05-25 (`v0.4.0`) |
| v1.5 | Multi-baseline & change management — the historical-record organ | Shipped 2026-05-25 (`v0.5.0`) |
| v1.6 | Reporting & analytics — the owner-facing organ | Implementation complete 2026-05-25, awaiting human PR/tag (`v0.6.0`) |
| **v1.7** | **WBS & hierarchy deepening + AC/CPI close-out — the spine organ** | **This plan** |

The audience widens *down the org chart*. v1.3 → v1.5 served the PM running one project. v1.6 served the owner / VP / inspector consuming artefacts. **v1.7 serves the estimator, the superintendent, and the project controls analyst** — the people who think about a project as a *structure* of 1.0 → 1.3.2.4, not as a flat task list with cosmetic indentation. The PM still uses the tool; what changes is that the WBS becomes a real data column they can sort, filter, search by, and roll up against.

The deliverable v1.7 produces is twofold:
1. **A structural framework** — a 2,000-task hospital build organised by Division (Group → Subgroup → Sub-subgroup → Task), each row carrying its own immutable WBS code (e.g., `1.3.2.4 — Pour foundation walls`), with cost / progress / resource roll-ups visible on every parent row.
2. **A complete EVM picture** — v1.6 shipped PV / EV / SPI with an explicit "AC tracking not yet implemented" footer. v1.7 ships per-task actual cost entry and CPI computation, removing that footer and finishing what v1.6 started.

These two deliverables are bundled in v1.7 (not separately released) because audit-v4 §10.2 named AC/CPI as a "should-fix carry into v1.6 if reasonably possible, else v1.7", and plan-v1.6 §3.2 explicitly deferred AC + CPI to "v1.7 or v1.8 (folded into the WBS / cost-tracking widening)". The WBS work touches cost roll-ups on group rows, which is the natural place to also surface actuals.

---

## 2. The "single organ at a time" principle (CARRIED FORWARD)

The roadmap's seventh guiding principle still holds. **v1.7 ships exactly one new organ (WBS) plus one close-out of a v1.6 deferral (AC/CPI).** Both touch the same architectural surface (cost & hierarchy on group rows), which is the bundling justification.

v1.7 ships:

- Persistent WBS codes on `Task` (`wbsCode: string`) and `Group` (`wbsCode: string`), recomputed on hierarchy mutations and stamped on save
- Multi-level group nesting via `Group.parentId: string | null` (unlimited depth, with practical guard at 5 levels — see §6.6)
- Roll-up summary pills on group rows: task count · overall % complete · total cost · resource count
- WBS validation as DCMA check 15 (the audit-v4 §10.2 carry — re-purposed; see §5.3 for the rename)
- DCMA check 16 — resource over-allocation as a quality finding (the *other* audit-v4 §10.2 carry, the one originally named §5.8 in audit v4)
- WBS column visibility toggle in `TaskList`: a column header pill that reveals the actual `wbsCode` as a sortable data field (instead of the cosmetic render-time string today)
- WBS round-trip in CSV (export includes `WBS Code` column; import reads `wbs` / `wbs_code` and rebuilds hierarchy from the codes — see §6.7)
- **AC (Actual Cost) per-task input** in `SidePanel` — a single field on each task (`Task.actualCost: number`, default 0)
- **CPI computation** in the EVM report — `CPI = EV / AC`, with empty-state fallback when AC = 0
- Removal of the v1.6 EVM "AC not yet implemented" footer note

v1.7 does **not** ship:

- **Per-week / per-month / per-resource AC entry** — a single per-task field is enough. Time-phased actuals are v2.x (payroll integration concept; explicitly out of scope per §3.2)
- **AC import from CSV** — v1.7 ships UI entry only. CSV AC field is a v1.8 / v1.9 follow-up
- **WBS-code edit by user** — codes are auto-generated from hierarchy position. Manual override is a v2.2 saved-views feature
- **Re-parenting a group via drag** — v2.2 (bulk edit / drag dependencies)
- **Group-level resource assignments** — only tasks carry assignments; groups carry roll-ups of their children
- **WBS-based filter** in the existing FilterState (`phases` already filters by group ID) — v2.2 saved views (WBS-prefix filter)
- **Group-level critical path** — CPM stays task-level; group "criticality" is not a defined concept in DCMA / PMBOK
- **Cross-project / portfolio WBS rollups** — v2.1
- **Project calendar overlays + delay tracking** — v1.8
- **P6 / MPP / Procore integration** — v1.9
- **Cloud sync / multi-user / comments** — v2.0
- **AI-generated WBS recommendations** — never
- **Chart libraries / PDF libraries** — never (CLAUDE.md design decision #1, carried into v1.6 §2.1)
- **Saved-view persistence for WBS column toggle** — v2.2

If a contributor asks "while we're touching the hierarchy layer, can we also…" the answer is no.

### 2.1 Discipline preserved

Every visual surface added in v1.7 must pass the v1.2 pre-flight:
- "Would another product look identical if I swapped the wordmark?" — if yes, fail.
- "Does it have a job, or is it decorative?" — if decorative, fail.
- "Would I notice it missing?" — if no, fail.

**Roll-up pills are the surface where 'dashboard creep' is at its highest risk in v1.7.** The temptation to render group rows as mini-dashboards (KPI tiles, RAG indicators, spark-bars, donuts of resource mix) must be rejected. The pills are: `12 tasks · 64% · $2.4M · 5 resources`. Monospaced. Single line. No icons inside the pill. No color-coded backgrounds beyond the v1.2 swiss-discipline palette. If a pill needs an icon, the pill is wrong.

**The WBS code column** in TaskList is a 24px-wide gutter today (cosmetic). v1.7 widens it to ~48px to accommodate `1.3.2.4` codes without truncation, adds a sort-by-WBS column header click, but does *not* add column drag-resize (v2.2). The font is monospaced (`Space Mono` per `tokens.css`) — codes must align by digit, not by proportional kerning.

### 2.2 The defensibility floor

v1.7 preserves the floor:
- Every new pure function gets a unit test.
- Every new user-visible flow gets an E2E spec.
- **Schema migration 3 → 4 is additive, unit-tested, and round-trip safe.** A v1.6 `0.6.0` save file must continue to load cleanly in v1.7 and round-trip without data loss. Round-trip includes: load v3 → save v4 → load v4 → no field drift.
- No new runtime dependencies (see §7.3).
- No regression on existing unit tests (≥320 post-v1.6) or E2E specs (≥20 post-v1.6).
- Performance contract: no regression on v1.6 baselines; new WBS / roll-up / AC computations meet §8 targets.
- The Quality Panel cold-open close-out from v1.6 Phase 0.1 (`docs/perf-v1.6-quality-panel.md`) must hold after DCMA check 15 + 16 land. Re-measure in Phase J.

---

## 3. Scope

### 3.1 In scope (v1.7)

| Capability | What the PM sees |
|---|---|
| **WBS code on every task and group** | Every task carries an immutable-during-session `wbsCode` (e.g., `1.3.2.4`). Every group carries its own (e.g., `1.3`). Codes are auto-generated from hierarchy position: top-level group → `N`; nested group → `parent.M`; task within group → `parent.K`. Recomputed on every mutation that changes hierarchy ordering (group reorder, task move, group re-parent — though re-parenting itself is not a v1.7 UI capability). Persisted on save. Migration assigns codes to existing groups/tasks. |
| **Multi-level group nesting** | `Group.parentId: string \| null`. A group with `parentId = null` is a top-level group. A group with `parentId = "G3"` is nested under G3. Nesting depth is practically unlimited in the data model; the UI guards against runaway nesting at depth 5 (advisory warning if user attempts depth ≥6 — see §6.6). Existing flat groups all migrate to `parentId = null`. |
| **Roll-up summary pills on group rows** | After the group name, before the existing collapse-toggle area, render a single-line monospaced pill: `12 tasks · 64% · $2.4M · 5 res`. Computed recursively (group totals include nested children). For groups with deeply nested children, the count is the *recursive* task count (not just direct children). When the group is collapsed, the pill becomes the primary glance; when expanded, it remains visible above the indented children. |
| **WBS column in TaskList** | The existing `WBS_COL_WIDTH = 24` cosmetic gutter (TaskList.tsx:9) widens to `WBS_COL_WIDTH = 48`. The contents change from render-time `computeWbs(rows)` (TaskList.tsx:39) to `task.wbsCode` / `group:wbsCode`. Column header gets a sort-toggle (default sort by WBS ascending). |
| **WBS code visibility in SidePanel** | When a task is selected, the SidePanel header shows the WBS path: `1.3.2.4 — Pour foundation walls` instead of just the task name. Path is breadcrumb-style with the code rendered in `--color-text-tertiary`. |
| **Indentation visual hierarchy** | Group rows indent by depth: top-level = 0px, depth-1 = 16px, depth-2 = 32px, etc. A 1px vertical rule in `--color-border-light` connects parent to child group rows in the task list, mirroring tree-view conventions. Tasks within a group are indented one level beyond their group. |
| **DCMA check 15 — WBS completeness (audit v4 §10.2 carry)** | New check: validates every task belongs to a group, every non-leaf group has ≥1 child (group or task), and no orphan branches exist (a group with `parentId` pointing at a non-existent group ID). Pass when: 100% of tasks have a group AND 100% of groups have valid parents/children. Affected entities listed in `affectedTaskIds`. |
| **DCMA check 16 — resource over-allocation (audit v4 §5.8 carry)** | New check: counts days in the project window where any resource's allocation exceeds its `capacity`. Pass when: zero over-allocated resource-days. Score = percent of resource-days within capacity. Plain-English: "Resources should fit within their declared capacity — over-allocation means the schedule cannot execute as written." Folds the existing histogram over-allocation surface into the formal DCMA assessment. |
| **WBS round-trip in CSV** | `generateCSV` adds `WBS Code` column (after `ID`, before `Name`). Import (`CsvImportDialog`) recognises `wbs`, `wbs_code`, `WBS Code` headers and reconstructs the group hierarchy from the codes (codes like `1.3.2.4` imply a chain of groups `1`, `1.3`, `1.3.2` — created if absent during import). If import contains WBS codes that conflict with an existing hierarchy, S5 triggers. |
| **AC (Actual Cost) per-task field** | New on `Task`: `actualCost: number` (default 0). Surfaced in SidePanel under `ResourceAssignmentSection` as a labeled input: "Actual cost (USD): [______]". Editable inline; auto-saves on blur. Read-only when the task has no resource assignments (advisory: "Assign resources first to enable cost tracking"). |
| **CPI in the EVM report** | The v1.6 EVM KPI strip currently shows `PV · EV · SPI` with an `AC/CPI deferred` footer note. v1.7 expands it to `PV · EV · AC · SPI · CPI`. AC = `Σ task.actualCost`. CPI = EV / AC when AC > 0; null when AC = 0 (KPI cell renders `—`). The deferral footer is removed. |
| **Executive PDF — CPI in SPI row** | The v1.6 executive PDF SPI line (`SPI 0.92 (AC / CPI deferred — see Reports → EVM)`) becomes `SPI 0.92 · CPI 0.88` (or `SPI 0.92 · CPI —` when AC = 0 for all costed tasks). |
| **TopBar overflow close-out (v1.6 S7 carry)** | v1.6 Phase 0.3 measured TopBar density at 1280px = 90.84% (S7 triggered; human approved continue). v1.7 closes the debt by restructuring the data/settings cluster behind a single "More…" overflow menu (Phosphor `DotsThree`), keeping the highest-affinity buttons in line (`Baselines ▾`, `Quality`, `Reports`) and demoting `Phases`, `Parties`, `Resources`, `Change Orders` behind the overflow. **This restructure is BLOCKING — Phase 0.1.** |

### 3.2 Out of scope (explicitly deferred)

| Deferred to | What |
|---|---|
| **v1.8** | Project calendar overlay, per-resource calendars, weather/delay tracking, excusable vs non-excusable classification, AC import from CSV |
| **v1.9** | P6 (`.xer`) / MS Project (`.mpp`) import-export, Procore integration, AC pull from accounting integration |
| **v2.0** | Cloud sync, multi-user, audit trail, comments, presence, change-order approval routing |
| **v2.1** | Portfolio dashboard, cross-project WBS rollups, project templates |
| **v2.2** | Density modes, column customization (including WBS column drag-resize), **WBS-based saved-view filters**, drag-to-reparent groups, bulk edit, drag dependencies, WBS-code manual override, manual `Task.actualCost` time-phasing |

**Specifically NOT in v1.7** even though they are tempting:
- **Time-phased AC entry** (per-week / per-month / per-resource) — a single per-task field is enough for v1.7. Time-phasing is a v2.x payroll-integration concept.
- **AC import from CSV** — v1.7 UI-entry only. Round-trip on export is fine (one new `Actual Cost` column); import is v1.8.
- **Drag-to-reparent a group** — v2.2 (bulk edit / drag dependencies). v1.7 ships `Group.parentId` as a data field that can be set via the GroupManager modal (a small picker), not via drag.
- **Auto-WBS-from-hierarchy as a one-shot button** — codes are *always* computed from hierarchy. There is no button.
- **Roll-up of resource demand histograms by group** — interesting but v2.x (resource hierarchies). v1.7's pill shows the *count* of unique resources used by descendants, not a histogram.
- **Group-level critical path / float** — CPM stays task-level. Group-level criticality is not a defined PMBOK / DCMA concept.
- **WBS code as a writable field on `Task` directly** — v2.2 (saved views / power-user). v1.7 derives codes from hierarchy.
- **Removing the rendered cosmetic WBS string entirely from `computeWbs(rows)`** — keep the helper as a fallback for unmigrated state (defensive). The actual rendered code is `task.wbsCode` when present.
- **Re-purposing the `phases` filter array in `FilterState` to also accept WBS prefixes** — v2.2 saved views.

If a v1.7 PR includes any of the above, reject. Point at this section.

### 3.3 The "two-organ bundling" justification

Audit v4 §10.2 named AC + CPI as a should-fix; plan-v1.6 §3.2 deferred to "v1.7 or v1.8 (folded into the WBS / cost-tracking widening)". Bundling AC + CPI into v1.7 is justified by:
1. **Same architectural surface** — group roll-up pills already touch cost on group rows. Adding per-task actual cost surfaces the *missing half* of that cost story.
2. **Audit pressure** — the EVM report shipped in v1.6 with a "deferred" footer. Holding that footer through v1.8 is technical debt that compounds when v1.8's calendar overlay lands.
3. **Small scope** — AC is *one number* on `Task`. CPI is *one math op* on EV / AC. No new modal surface, no new persistence array, no new lib module (folds into existing `cost.ts` + `evm.ts`).
4. **The single-organ-at-a-time rule applies to themed scope, not to every persistable field.** v1.7's theme is "the schedule's spine, plus its cost truth" — WBS gives the spine; AC + CPI completes the cost picture v1.6 promised.

If AC + CPI threatens to bloat past Phase H (the budgeted slot), S2 triggers — defer to v1.8 cleanly. Do not let cost-tracking creep into v1.7's WBS phases.

---

## 4. Phase 0 — Mandatory carry-overs from v1.6 + audit v4

### 4.1 Pre-flight verification (BLOCKING — do these BEFORE branching)

| # | Task | Verification | Stop-and-ping |
|---|------|--------------|---------------|
| 0.−2 | **Verify v1.6 shipped to `main`.** `git fetch origin && git log origin/main --oneline -5` must show the v1.6 merge commit (`e2517cb` or its squash equivalent). `git tag --list 'v0.6.*'` on a freshly-fetched repo must include `v0.6.0`. `cat package.json \| grep version` on `main` must read `0.6.0`. If any of these is missing, the v1.6 PR + tag (human actions per `.claude/AGENT-HANDOFF.md`) have not completed yet — **stop via S13 and do not branch v1.7 from a stale `main`.** | git output captured in commit message of the first v1.7 commit, OR S13 surfaced. | S13 |
| 0.−1 | **Verify working tree is clean** (or only carries the recurring `playwright-report/index.html` noise per audit v3 §3.3). If anything else is dirty, stop and surface. The `playwright-report/index.html` modification is acceptable noise — it MUST NOT be staged or committed to `v1.7` at any point. Confirm `.gitignore` discipline before any `git add`. | `git status` clean except for known noise. | S13 |

### 4.2 Branch creation

| # | Task | Verification |
|---|------|--------------|
| 0.0 | Create branch `v1.7` from latest `main`, push to origin | `git branch --show-current` returns `v1.7` |

### 4.3 Project documentation refresh (BLOCKING — does not need to land before Phase A starts, but MUST land in Phase 0 commit set)

| # | Task | Deliverable | Files |
|---|------|-------------|-------|
| 0.A | **Refresh `.claude/CLAUDE.md`.** "What This Is" paragraph must name v1.6 shipped (`v0.6.0`) and v1.7 active. "Persistence: schema version 4." Optionally add an eleventh Key Design Decision capturing the WBS-as-data principle (codes are computed from hierarchy, persisted for round-trip, never authored by the user). "Where to Look Next" must point at plan-v1.7.md as active and list plan-v1.6.md as shipped. | Updated `.claude/CLAUDE.md` with accurate version state, schema version 4, design decisions, and active-plan pointer. | `.claude/CLAUDE.md` |
| 0.B | **Update `.claude/AGENT-HANDOFF.md`** to point at v1.7 implementation. The handoff must reflect: v1.6 shipped + tagged (assumed by pre-flight 0.−2), plan-v1.7 written, Codex's next action is Phase 0.−2 → Phase 0.0 (branch) → Phase 0.1 (TopBar overflow restructure). | Updated `.claude/AGENT-HANDOFF.md`. | `.claude/AGENT-HANDOFF.md` |
| 0.C | **Verify `plan-v1.6.md` §17 Build Changelog is complete.** Plan-v1.6 §17 already carries Phase 0.−1 through Phase M completion entries. Confirm no gaps and commit any missing final-ship entries (e.g., "PR merged / `v0.6.0` tagged" once those human-owned actions complete). If §17 is genuinely complete, this is a no-op verification with a one-line confirmation in the v1.7 Phase 0 commit message. | Either a final-ship entry appended to `plan-v1.6.md §17` OR a no-op verification noted in v1.7 Phase 0 commit. | `.claude/plan-v1.6.md` (only if appending) |
| 0.D | **Update `.claude/version-status.md`** to mark v1.6 ✅ shipped (assuming pre-flight 0.−2 confirms PR + tag completed). Flip v1.7 from `⬜ pending` to `⏳ active`. Link `plan-v1.7.md`. **This row update can be done by Codex once pre-flight confirms `main` is at `0.6.0`.** | Updated tracker table. | `.claude/version-status.md` |

### 4.4 v1.6 S7 close-out — TopBar overflow restructure (BLOCKING)

Plan-v1.6 §17 Phase 0.3 documented TopBar density at 1280px = 90.84% with explicit S7 trigger; human direction was to continue. **v1.7 closes this debt before adding any new TopBar real estate or hierarchy-touching surface.** The restructure is small, structural, and lower-risk to land first than to defer behind the WBS migration work.

| # | Task | Deliverable | Files |
|---|------|-------------|-------|
| 0.1 | **TopBar overflow restructure.** Group the data/settings cluster behind a single "More…" overflow menu using Phosphor `DotsThree`. Highest-affinity buttons stay in the main bar (`Baselines ▾`, `Quality`, `Reports`). Demoted behind overflow: `Phases`, `Parties`, `Resources`, `Change Orders`. The overflow opens a small popover (reuse `BaselineMenu` overlay pattern from v1.5). Keyboard a11y: Tab into the More… button, Enter opens, ArrowDown navigates entries, Escape closes. Re-measure density at 1280px; target ≤75%. **Blocking: no v1.7 capability work until this closes and density target is verified.** | Updated TopBar; `docs/topbar-density-v1.7.md` with before/after measurements + screenshot at 1280px. | `src/components/topbar/TopBar.tsx`, `src/lib/icons.ts` (add `DotsThree`), new `src/components/topbar/TopBarOverflowMenu.tsx`, `src/styles/tokens.css` if any new tokens needed. `docs/topbar-density-v1.7.md` (new). |
| 0.2 | Re-affirm desktop-first mobile QA defer with a new dated entry in `docs/mobile-qa.md`. **Chronic gap is now five audits running.** The defer remains intentional under desktop-first direction; the dated entry continues the discipline pattern. Note: if the firm acquires a physical iPad for v1.8 or v1.9 testing, the gap closes then; until then, the dated defer holds. | One dated paragraph in `docs/mobile-qa.md` referencing v1.7 scope. | `docs/mobile-qa.md` |
| 0.3 | **Re-measure perf at v1.6 baseline post-restructure.** Confirm TopBar restructure did not regress: (a) initial app render, (b) Quality Panel cold-open (must still hit the §8 target from `docs/perf-v1.6-quality-panel.md`), (c) Reports modal first-render. Document in `docs/perf-v1.7-baseline.md`. | `docs/perf-v1.7-baseline.md` (new) with before/after table. | `docs/perf-v1.7-baseline.md` (new) |

### 4.5 Chronic-gap explicit deferral (continued from v1.6 §4.5)

| # | Task | Decision |
|---|------|----------|
| 0.E | **Marketing landing v2 pass — explicit deferral for v1.7.** Audit v3 / v4 §8.3 named this as a chronic gap. **Decision for v1.7: still deferred.** Same rationale as v1.6: marketing is a separate craft. v1.7 produces *more* screenshot-worthy material (WBS pills, CPI in EVM) but the marketing pass is still its own standalone work after v1.7 ships. Audit v5 (Checkpoint 3, post-v1.8) will re-flag if still untouched. |
| 0.F | **Branch pile-up — decision for v1.7.** Current preserved branches: `v1.3`, `v1.4`, `v1.5`, `v1.6` (count: 4 — within the v1.6 "revisit at 10" threshold). **Decision for v1.7: continue keeping.** No action required. |
| 0.G | **`Task.deps[]` direct-write lint rule — explicit deferral.** Recommended as low-priority since audit v3. Defer to v2.0 (cloud sync re-architects the data layer; that is the right time to make the convention a runtime invariant). v1.7 does not add a lint rule. |

**Gate:** Phase 0 must close cleanly before Phase A begins. Phase 0.−2, 0.−1, 0.0, 0.A, 0.B, 0.C, 0.D, 0.1, 0.2, 0.3 are all required. Phase 0.E / 0.F / 0.G are explicit-deferral decisions with no implementation work. Phase 0.1 (TopBar overflow restructure) is a hard blocker: if density at 1280px does not hit ≤75% after the restructure, escalate via S7.

---

## 5. Architecture & file map

### 5.1 Schema change — `PERSISTED_SCHEMA_VERSION` 3 → 4 (JUSTIFIED)

This is the third schema bump in the product's history (after 0 → 1 → 2 → 3 in v1.5). It is justified because:

- **`Task` gains two new fields:** `wbsCode: string` and `actualCost: number`. Adding them as new properties on the existing `Task` interface is additive and trivially migrate-able (defaults applied on load: `wbsCode` computed from current hierarchy, `actualCost = 0`).
- **`Group` gains two new fields:** `parentId: string | null` and `wbsCode: string`. Existing v3 saves have no `parentId` — migration sets all to `null` (flat hierarchy preserved). `wbsCode` is computed from position on load.
- **No new top-level arrays.** Unlike v1.5 (which added `changeOrders`, `varianceSnapshots`), v1.7 only widens existing entity shapes.

The migration walk follows the v1.3 / v1.5 pattern: additive, defaults applied, no destructive change. A v1.6 `0.6.0` save file must continue to load cleanly in v1.7 and round-trip without data loss. Round-trip semantics:
- Load v3 → migrate to v4 with `parentId = null`, `wbsCode` computed → save → reload → no field drift, codes stable across reloads when hierarchy unchanged.

```ts
// migrateState walk: 0 → 1 → 2 → 3 → 4
// v3 → v4 step:
//   - for each group: parentId = parentId ?? null
//   - for each task: actualCost = actualCost ?? 0
//   - then run computeWbsCodes(groups, tasks) → stamp wbsCode on every group and task
```

**Round-trip safety test:** `tests/unit/lib/storage.test.ts` extends with a v3-payload-load-then-save-then-reload assertion that checks no field is added/removed/mutated unexpectedly beyond the v3 → v4 walk.

`PERSISTED_SCHEMA_VERSION` becomes **4**.

### 5.2 New files

| File | Purpose |
|---|---|
| `src/lib/wbs.ts` | Pure: `computeWbsCodes(groups, tasks) → { groupCodes: Map<string, string>, taskCodes: Map<string, string> }`. Walks the group tree (groups by `parentId`), assigns codes top-down. Sibling order = current array order. Also: `walkGroupTree(groups) → GroupNode[]` (returns a depth-tagged flat traversal for indentation), `getGroupDepth(groups, groupId) → number`, `getDescendantTaskIds(tasks, groups, groupId) → string[]`. |
| `src/lib/rollups.ts` | Pure: `computeGroupRollup(groupId, groups, tasks, assignments, resources) → GroupRollup`. Returns `{ taskCount, completionPct, totalCost, resourceCount }` aggregated recursively across descendants. |
| `src/lib/actualCost.ts` | Pure: `computeTotalActualCost(tasks) → number`. Sums `task.actualCost` across all tasks. Used by EVM AC computation and by the executive PDF. |
| `src/components/topbar/TopBarOverflowMenu.tsx` | The "More…" overflow popover for the TopBar restructure (Phase 0.1) |
| `src/components/task-list/GroupRollupPill.tsx` | The single-line monospaced pill rendered on group rows |
| `src/components/SidePanelActualCostSection.tsx` | The AC input field section, placed under `ResourceAssignmentSection` |
| `src/components/SidePanelWbsBreadcrumb.tsx` | The `1.3.2.4 — Pour foundation walls` header breadcrumb for the SidePanel |
| `src/components/modals/GroupsManager.tsx` *(if not already present — verify during implementation)* | If a `GroupsManager` modal does not already exist, scaffold it with parent-group picker per group row. If it does exist, extend it with the parent picker; do NOT create a duplicate. |
| `tests/unit/lib/wbs.test.ts` | Code computation: flat hierarchy, two-level, five-level, sibling order changes, orphan-parent (parentId points to non-existent group → resolve to root with warning), single group with no tasks, empty project |
| `tests/unit/lib/rollups.test.ts` | Roll-up: empty group, group with one task, deeply nested group with mixed task states, completion% rounding, total cost when some tasks costed and some not, resource count uniqueness across descendants |
| `tests/unit/lib/actualCost.test.ts` | Sum with zero values, sum with mixed values, sum across 500-task fixture |
| `tests/e2e/wbs-hierarchy.spec.ts` | Load example, open GroupsManager, nest a group under another, assert WBS codes update in TaskList, assert roll-up pills update on parent group |
| `tests/e2e/wbs-csv-roundtrip.spec.ts` | Export CSV → re-import → assert hierarchy reconstructed from codes |
| `tests/e2e/actual-cost.spec.ts` | Select task, enter actual cost, assert SidePanel persists, open EVM report, assert AC and CPI render |
| `tests/e2e/dcma-15-16.spec.ts` | Construct a schedule with WBS gaps and over-allocation; open Quality Panel; assert checks 15 and 16 surface as failing |
| `docs/wbs.md` | Spec of: WBS code generation rules, hierarchy depth guidance, roll-up semantics, CSV round-trip behaviour |
| `docs/perf-v1.7-baseline.md` | Phase 0.3 perf measurements |
| `docs/topbar-density-v1.7.md` | Phase 0.1 TopBar restructure measurements + screenshot |

### 5.3 Files modified

| File | What changes |
|---|---|
| `src/types/index.ts` | Extend `Task` with `wbsCode: string`, `actualCost: number`; extend `Group` with `parentId: string \| null`, `wbsCode: string`. Add `GroupNode { id, depth, parentId, wbsCode }`, `GroupRollup { taskCount, completionPct, totalCost, resourceCount }`. Extend `DcmaCheckId` union to include `15 \| 16`. Bump `PERSISTED_SCHEMA_VERSION` to **4**. Extend `EVMResult` (or its sibling type) to include `ac: number`, `cpi: number \| null`. |
| `src/lib/storage.ts` | Extend `migrateState` with v3 → v4 walk: `parentId ?? null`, `actualCost ?? 0`, then call `computeWbsCodes(groups, tasks)` and stamp `wbsCode` on every group and task. Round-trip-safe. Update `makeDefaultState` to include the new fields. |
| `src/lib/dcma.ts` | Add check 15 (`checkWbsCompleteness`) and check 16 (`checkResourceOverAllocation`). Update `CHECK_DEFINITIONS` array. Both new checks consume the existing `DcmaAssessmentContext` (no new context fields required — check 16 already has `resources` + `assignments`). |
| `src/lib/health.ts` | The composite health subscore weights live here. **Decision:** v1.7 does NOT reweight subscores; checks 15 and 16 enter under the existing "logic quality" and "resource feasibility" subscore buckets respectively (verify and document in `docs/dcma-checks.md`). Reweighting is v1.8 / Schedule Quality v2 territory. |
| `src/lib/evm.ts` | Extend `computeEVM` output with `ac` (sum of `task.actualCost`) and `cpi` (`ev / ac` when `ac > 0`, else `null`). |
| `src/lib/cost.ts` | If a per-group total-cost helper exists, extend it to recurse via `wbs.ts`. Otherwise leave alone; `rollups.ts` is the new home for hierarchy-aware aggregation. |
| `src/lib/csv.ts` | `generateCSV` adds `WBS Code` column after `ID`, before `Name`. `csvRowsToTasks` recognises `wbs`, `wbs_code`, `WBS Code` headers; when present, reconstruct group hierarchy from codes (create missing intermediate groups as needed; preserve existing groups by name match where possible). |
| `src/components/modals/CsvImportDialog.tsx` | The header-auto-detection (`CsvImportDialog.tsx:72`) already maps `wbs` → `group`. Extend to also surface as a separate `wbs_code` column when imported alongside `group`. If the dialog has a column-mapping preview, show the WBS column. |
| `src/components/App.tsx` | State derivation: a memoized `groupNodes = useMemo(() => walkGroupTree(groups), [groups])`; a memoized `groupRollups = useMemo(() => new Map(groups.map(g => [g.id, computeGroupRollup(g.id, ...)])), [groups, tasks, assignments, resources])`. Update `visibleRows` to render the depth-tagged tree (groups in tree order, not flat-by-task-first). Wire AC field changes. |
| `src/components/task-list/TaskList.tsx` | `WBS_COL_WIDTH` 24 → 48. Drop the cosmetic `computeWbs(rows)` helper in favor of `task.wbsCode` / lookup-by-`groupId` for group rows. Pass `groupRollup` prop to GroupRow. Render `GroupRollupPill` inside GroupRow. Indent group rows by depth using a `paddingLeft` style binding. Add column header sort-by-WBS click. |
| `src/components/SidePanel.tsx` | Render `SidePanelWbsBreadcrumb` in the header. Insert `SidePanelActualCostSection` below `ResourceAssignmentSection`, above `ChangeOrderSection`. |
| `src/components/topbar/TopBar.tsx` | Phase 0.1: collapse `Phases`, `Parties`, `Resources`, `Change Orders` into the new `TopBarOverflowMenu` (`DotsThree` icon). Keep `Baselines ▾`, `Quality`, `Reports` in the main bar. |
| `src/components/reports/EVMPreview.tsx` | KPI strip expands from 3 cells (PV / EV / SPI) to 5 cells (PV / EV / AC / SPI / CPI). Remove the "AC (Actual Cost) tracking is not yet implemented" footer note. AC cell renders `$NNN,NNN` (or `—` when 0). CPI cell renders `0.NN` (or `—` when AC=0); color-coded green ≥1.00, amber 0.90–0.99, red <0.90 (matches SPI banding). |
| `src/components/reports/charts/EVMChart.tsx` | Optionally add a third line for AC if AC > 0 (decision: yes — but only when AC > 0; dotted style in `--evm-ac`). When AC = 0, only PV + EV render (current v1.6 shape). |
| `src/components/reports/ExecutiveReportPreview.tsx` | The SPI footer line becomes `SPI 0.92 · CPI 0.88` (or `· CPI —` when AC = 0). Remove the v1.6 "AC / CPI deferred" parenthetical. |
| `src/components/quality/DcmaFindingsTable.tsx` | Renders 16 checks instead of 14. "Show all 14 checks" toggle copy updates to "Show all 16 checks". The default-failing-only view (v1.6 Phase I.1) is preserved. |
| `src/lib/icons.ts` | Add `DotsThree` (overflow menu). All other v1.7 surfaces reuse existing icons. |
| `src/constants.ts` | Add: `WBS_COL_WIDTH = 48` (replaces TaskList-local constant), `GROUP_NEST_DEPTH_WARN = 6`, `GROUP_INDENT_PX = 16`, `ROLLUP_PILL_MIN_WIDTH = 180`. |
| `src/styles/tokens.css` | Add: `--rollup-pill-bg`, `--rollup-pill-fg`, `--rollup-pill-border`, `--group-indent-rule`, `--wbs-code-fg`, `--actual-cost-input-bg`, `--evm-ac` (dotted-line color for AC in EVM chart). |
| `docs/design-system.md` | Document v1.7 tokens. |
| `docs/dcma-checks.md` | Add entries for check 15 and check 16. Document the "no subscore reweight in v1.7" decision. |
| `docs/onboarding-qa.md` | Recommend exploring group nesting + WBS export after the first baseline capture. |
| `docs/reports.md` | EVM section updates to reflect AC + CPI shipping. Remove the v1.6 "AC / CPI deferred" caveat. |
| `CHANGELOG.md` | Add `0.7.0` entry on ship. |
| `package.json`, `package-lock.json` | Version bump `0.6.0` → `0.7.0`. |
| `README.md` | Mention WBS hierarchy + per-task actual cost + CPI completion. |

### 5.4 Files unchanged (explicit non-goals)

| File | Why we are leaving it alone |
|---|---|
| `src/lib/cpm.ts` | CPM is task-level only. Group-level critical path is not a defined concept. |
| `src/lib/scurve.ts`, `cashflow.ts`, `weeklyReport.ts`, `reportData.ts` | v1.6 modules. Consume cost / hierarchy via existing surface. `cashflow.ts` may need a small extension to optionally group rollups by WBS (defer to v1.8 — current category-only breakdown is sufficient). |
| `src/lib/baselines.ts` | Baseline snapshots already capture full task records; WBS codes ride along automatically once added to `Task`. Comparison views will show WBS in slip rows once `BaselineDiffTable` is told to render them (decision: defer to v1.8 — v1.7 keeps diff-table format unchanged to limit blast radius). |
| `src/lib/changeOrders.ts` | Unchanged. |
| `src/lib/variance.ts` | Snapshot append unchanged. |
| `src/lib/floatDistribution.ts`, `logicValidation.ts` | v1.4 modules; untouched. The over-allocation logic that DCMA-16 needs already exists in `resourceDemand.ts` (verify and reuse). |
| Mobile bottom sheet | No mobile-specific UI for v1.7; desktop-first per Phase 0.2. |
| Marketing page | Chronic deferral continued (Phase 0.E). |

---

## 6. UI surface map

```
┌─ TopBar (post-Phase-0.1 restructure) ────────────────────────────────────────┐
│ MAKE · Project │ Baselines ▾ │ Quality │ Reports │              [More… ▾]   │
│                                                                       ↑       │
│                                  Overflow menu opens:                         │
│                                    Phases · Parties · Resources · COs         │
└──────────────────────────────────────────────────────────────────────────────┘

┌─ TaskList — Group row with rollup pill + WBS code ───────────────────────────┐
│ [1.0]  Division 01 — General Reqs   ▾   12 tasks · 64% · $2.4M · 5 res       │
│ [1.1]    Submittals                 ▾    3 tasks · 100% · $42K · 2 res       │
│ [1.1.1]    │ Shop drawings — steel       2026-02-12 → 2026-02-19  ✓          │
│ [1.1.2]    │ Shop drawings — concrete    2026-02-15 → 2026-02-26  ✓          │
│ [1.1.3]    │ Mockup approval             2026-03-01 → 2026-03-08  ✓          │
│ [1.2]    Permits                    ▸    4 tasks · 50%  · $180K · 1 res      │
│ [1.3]    Mobilization                ▾    5 tasks · 60%  · $2.18M · 4 res    │
│ [1.3.1]    │ Site logistics             2026-02-01 → 2026-02-14  ◐            │
│ [1.3.2]    │ Subcontract foundation     ▾   3 tasks · 33% · $1.4M · 2 res    │
│ [1.3.2.1]    │ │ Excavation              2026-03-01 → 2026-03-14  ◐          │
│ [1.3.2.2]    │ │ Form/rebar              2026-03-15 → 2026-04-01  ◯          │
│ [1.3.2.3]    │ │ Pour                     2026-04-02 → 2026-04-10  ◯         │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
       ↑           ↑                  ↑                                         
   WBS col      indent rule       rollup pill (monospaced, single line)         

┌─ SidePanel (task selected) ──────────────────────────────────────────────────┐
│ 1.3.2.1 — Excavation                                                   [✕]   │
│ ──────────────────────────────────────────────────                            │
│ Planned: 2026-03-01 → 2026-03-14                                              │
│ Actuals: 2026-03-01 → —                                                       │
│ Resources: ▼ Excavator × 1 · Operator × 2                                     │
│ ── Actual cost ──────────────────────────────────                             │
│ Actual cost (USD):  [  18,420.00          ]                                   │
│                                                                                │
│ Change orders: ▼  CO-007 Site logistics replan  +0d  +$0                      │
│ Dependencies: ▼                                                                │
└──────────────────────────────────────────────────────────────────────────────┘

┌─ EVM preview pane (post-v1.7) ───────────────────────────────────────────────┐
│  PV: $4,820,000   EV: $4,440,000   AC: $4,610,000   SPI: 0.92   CPI: 0.96    │
│  ─────────────────────────────────────────────────────────────                │
│  $5M ┤                                  ╭────── PV                            │
│      │                              ╭───╯                                     │
│  $4M ┤                          ╭───╯ ╭──── EV                                │
│      │                      ╭───╯  ╭─╯  ╭──· AC (dotted, when AC > 0)         │
│  $3M ┤                  ╭───╯   ╭──╯ ╭──╯                                     │
│      │              ╭───╯   ╭───╯   ╭╯                                        │
│  $2M ┤          ╭───╯   ╭───╯   ╭──╯                                          │
│      │      ╭───╯   ╭───╯   ╭──╯                                              │
│  $0  ┴──╴──╴──╴──╴── today ──╴──╴──╴──╴                                       │
│      Jan  Feb  Mar  Apr  May  Jun  Jul  Aug                                   │
│  (footer note from v1.6 about AC/CPI deferral REMOVED)                        │
└──────────────────────────────────────────────────────────────────────────────┘

┌─ Quality Panel — DCMA table with 16 checks ──────────────────────────────────┐
│ DCMA findings (failing only) — Show all 16 checks ▾                          │
│   4. Orphan tasks               FAIL    3 tasks affected                     │
│   6. Float distribution         FAIL    median 4d (target 10–20d)            │
│  15. WBS completeness           FAIL    2 groups without children            │
│  16. Resource over-alloc        FAIL    Electrical crew over wk 12–14        │
└──────────────────────────────────────────────────────────────────────────────┘

┌─ GroupsManager (extended with parent picker) ────────────────────────────────┐
│ Groups · 14 total                                                  [+ New]   │
│ ─────────────────────────────────────────────────────────────────             │
│  1.0  Division 01 — General Requirements   parent: (top)     ▾                │
│  1.1    Submittals                          parent: Division 01 ▾             │
│  1.3    Mobilization                        parent: Division 01 ▾             │
│  1.3.2    Subcontract foundation            parent: Mobilization ▾            │
│  2.0  Division 03 — Concrete                parent: (top)     ▾                │
│  …                                                                            │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 6.1 GroupRollupPill

- Inline monospaced pill positioned after the group name, before the collapse caret area.
- Format: `{N} tasks · {P}% · {C} · {R} res`
- `N` = recursive descendant task count
- `P` = recursive completion percentage (weighted by task count, not by duration — see §11.1 unit test for rounding rule)
- `C` = total cost (formatted `$NNN.NK` or `$NN.NM` for compactness)
- `R` = count of unique resources used by any descendant task
- Background: `--rollup-pill-bg` (subtle); border: hairline `--rollup-pill-border`
- Min-width: `ROLLUP_PILL_MIN_WIDTH = 180px` (prevents pill resizing during expand/collapse)
- **No icons. No color-coding by status. No graphical bars.** Single line. Monospaced.

### 6.2 GroupRow indentation

- `paddingLeft = GROUP_INDENT_PX * depth` (depth=0 → 0px, depth=1 → 16px, depth=2 → 32px, etc.)
- A 1px vertical rule in `--group-indent-rule` connects each child group to its parent — rendered as a `border-left` on a `::before` pseudo-element positioned at `depth * GROUP_INDENT_PX - 8px`.
- Task rows inside a group are indented one level beyond their group (so a task in a depth-2 group has `paddingLeft = 48px`).

### 6.3 WBS column in TaskList

- `WBS_COL_WIDTH = 48px` (was 24).
- Font: `var(--font-mono)` (Space Mono per `tokens.css`).
- Color: `--wbs-code-fg` (low-contrast secondary).
- Column header click toggles a project-wide sort-by-WBS-ascending; default sort is WBS-ascending.
- Codes are read from `task.wbsCode` (for tasks) and the matching `Group.wbsCode` (for group rows).

### 6.4 SidePanel WBS breadcrumb

- Replaces the simple task-name header.
- Format: `{wbsCode} — {task.name}`
- Code in `--color-text-tertiary`, name in `--color-text-primary`.
- Truncates with ellipsis if the combined string exceeds the panel header width.

### 6.5 SidePanelActualCostSection

- Section heading: "Actual cost" (matches existing section-heading typography).
- One input field, labeled "Actual cost (USD):", numeric, currency formatting on blur (`$18,420.00`).
- Auto-saves on blur (same pattern as existing `actualStart` / `actualFinish` inputs).
- Read-only with advisory copy when task has zero resource assignments: "Assign resources first to enable cost tracking."
- The advisory is informational, not blocking — the user *can* still type a value if assignments are added later. The read-only state only renders when the user opens a task with no assignments yet.

### 6.6 Multi-level nesting — depth guard

- The data model allows unlimited nesting depth.
- `GroupsManager` advises against depth ≥6: a small inline warning when selecting a parent that would push the group to depth 6+. "Depth ≥6 may hurt legibility on print. Continue?"
- The warning is advisory, not blocking. The user can override.
- `getGroupDepth(groups, groupId)` returns the depth (0-indexed). Orphan groups (parentId pointing to a non-existent groupId) resolve to depth 0 with a console warning and surface in DCMA-15 as failing.

### 6.7 CSV round-trip

**Export (`generateCSV`):**
- Header columns become: `ID, WBS Code, Name, Group, Start, End, Actual Start, Actual Finish, Progress %, Status, Party, Milestone, Notes, Actual Cost`
- `WBS Code` is the task's `wbsCode`.
- `Actual Cost` is `String(t.actualCost)` (no formatting; raw number).
- `Group` remains the existing group name string (for backward compatibility with v1.6 CSV consumers).

**Import (`csvRowsToTasks`):**
- Header detection recognises `wbs`, `wbs_code`, `WBS Code`.
- When WBS column is present, hierarchy is reconstructed from codes:
  - Code `1` → top-level group
  - Code `1.3` → group `3` nested under group `1`
  - Code `1.3.2` → group `2` nested under group `3` (which is under group `1`)
  - Missing intermediate groups are auto-created (named e.g. `WBS 1.3` if no `Group` cell provides a name)
- When WBS column is absent (legacy CSV), import behaves exactly as v1.6 (flat groups by name). Migration assigns WBS codes post-import.
- **S5 triggers** if WBS codes conflict with an existing project's hierarchy AND the import is "append" (not "replace"). Replace-mode wipes existing groups, so no conflict.

### 6.8 GroupsManager parent picker

- Each group row in `GroupsManager` gains a "Parent" dropdown.
- Options: `(top)` plus every other group, excluding self and descendants of self (to prevent cycles).
- Cycle prevention: the dropdown filter computes descendants of the current group via `getDescendantTaskIds`/`walkGroupTree` and excludes them.
- Changing the parent immediately triggers `computeWbsCodes` and the visible WBS codes update across the app.

### 6.9 EVM KPI strip — 5 cells

- Cells in order: `PV` · `EV` · `AC` · `SPI` · `CPI`.
- All monospaced.
- `AC` renders `—` when sum of `task.actualCost` is 0.
- `CPI` renders `—` when AC = 0; otherwise color-coded same as SPI (green ≥1.00, amber 0.90–0.99, red <0.90).
- The v1.6 footer note "AC (Actual Cost) tracking is not yet implemented — CPI will appear when actuals can be entered (v1.7+)" is removed entirely.

### 6.10 DCMA findings — 16 checks

- "Show all 14 checks" toggle copy becomes "Show all 16 checks".
- Default-failing-only view (v1.6 Phase I.1) preserved.
- Check 15 ("WBS completeness") and 16 ("Resource over-allocation") sort alongside existing checks by DCMA-defined severity ordering (decision: 15 between 4 and 5; 16 between 9 and 10 — verify and document in `docs/dcma-checks.md`).

---

## 7. Architecture impact

### 7.1 State ownership

`App.tsx` continues to own all state. No new state slices for v1.7 — WBS codes and rollups are *derived* from `groups` + `tasks` and memoized at App level. New transient UI state:
- `groupsManagerEditingId: string | null` (already exists if GroupsManager exists; verify)
- `wbsSortAscending: boolean` (default true; transient column-header sort state)

Persisted state widens via the schema 3 → 4 walk (§5.1):
- `Task.wbsCode`, `Task.actualCost`
- `Group.parentId`, `Group.wbsCode`

No new persisted top-level arrays.

### 7.2 Pure library boundary

All three new lib modules (`wbs.ts`, `rollups.ts`, `actualCost.ts`) are pure. They take inputs, return outputs. No React imports. No localStorage touches. Only `storage.ts` knows persistence. The v1.3 / v1.4 / v1.5 / v1.6 / v1.7 architectural shape holds — this is Key Design Decision #9 per CLAUDE.md.

### 7.3 No new dependencies

v1.7 uses only primitives already in the project:
- Manual recursion over `groups` (no tree libraries — no `react-arborist`, `react-sortable-tree`, etc.)
- Existing React state for transient UI flags
- Phosphor icons (existing dep, add `DotsThree`)
- CSS custom properties for new colors

If a contributor proposes a tree library, S3 triggers.

### 7.4 Memoization plan

WBS / rollup computations are O(groups + tasks) per derivation. They must be memoized at the App level:

```ts
const groupNodes = useMemo(() => walkGroupTree(groups), [groups]);
const wbsCodes = useMemo(
  () => computeWbsCodes(groups, tasks),
  [groups, tasks]
);
const groupRollups = useMemo(() => {
  const map = new Map<string, GroupRollup>();
  for (const g of groups) {
    map.set(g.id, computeGroupRollup(g.id, groups, tasks, assignments, resources));
  }
  return map;
}, [groups, tasks, assignments, resources]);
const totalActualCost = useMemo(
  () => computeTotalActualCost(tasks),
  [tasks]
);
```

The existing v1.6 `evm` memoization at App level extends to consume `totalActualCost` (and triggers when `tasks` changes anyway):
```ts
const evm = useMemo(
  () => computeEVM(tasks, activeBaseline, assignments, resources, statusDate, totalActualCost),
  [tasks, activeBaseline, assignments, resources, statusDate, totalActualCost]
);
```

### 7.5 Stamping WBS codes on save

Two options considered:
- (a) **Compute on load and save**, stamp `wbsCode` on every record — codes are persisted.
- (b) **Compute on the fly during render**, never persist — codes are derived.

**Decision: (a) — persist codes.** Rationale: CSV export needs codes; baseline snapshots capture full task records and codes must travel with them; round-trip safety is easier to test when codes are concrete values rather than derived strings.

Implementation: `storage.ts` `saveState` stamps codes via `computeWbsCodes` before writing. `loadState` re-computes codes during migration (v3 → v4) and on every subsequent load to guarantee freshness against the current hierarchy. The persisted code is the source of truth for CSV/baseline; the live code (recomputed on load) is the source of truth for the UI.

---

## 8. Performance contract

| Metric | Target | Measurement |
|---|---|---|
| Phase 0.3 — initial app render at 500 tasks × 25 resources, after TopBar restructure | No regression vs v1.6 baseline (`docs/perf-v1.6-quality-panel.md` reference: 72ms mean) | `performance.now()` around `App` mount |
| Phase 0.3 — Quality Panel cold-open with 16 checks | Hold v1.6 §8 target (≤100ms mean, ≤120ms 95p) | `performance.now()` around panel mount |
| Phase 0.3 — Reports modal first render | No regression (§v1.6 §8: <150ms target) | E2E trace |
| `computeWbsCodes(500 tasks, 50 groups, depth 5)` | <15ms | `performance.now()` around the call |
| `walkGroupTree(50 groups)` | <2ms | `performance.now()` |
| `computeGroupRollup` per group at 500-task fixture | <5ms per group; <100ms total for all 50 groups | `performance.now()` over the rollup loop |
| TaskList re-render with rollup pills on collapse/expand | No frame drops >33ms at 500-task fixture | Devtools profiler |
| EVM compute with AC field | <40ms (matches v1.6 §8 EVM target — adding a sum across tasks is negligible) | `performance.now()` around `computeEVM` |
| CSV export with WBS column at 500 tasks | <50ms | `performance.now()` |
| CSV import + hierarchy reconstruction at 500 tasks | <200ms | `performance.now()` |
| Build size delta (v1.6 → v1.7) | <+20KB JS gzipped | `npm run build` bundle report |
| No regression on v1.6 perf baselines | unchanged | Re-run after Phase J |

---

## 9. Phased task breakdown

Each task ≤3 files, one commit. Phases ordered by dependency.

### Phase 0 — Pre-flight + housekeeping + TopBar close-out (BLOCKING)

| # | Task | Files |
|---|------|-------|
| 0.−2 | **Pre-flight: verify v1.6 shipped to `main`.** `git fetch origin`, check `git log origin/main` for v1.6 merge, check `git tag` for `v0.6.0`, check `package.json` on `main` reads `0.6.0`. If any fails → S13. | (git) |
| 0.−1 | **Pre-flight: verify clean working tree** (or only `playwright-report/index.html` noise). If anything else dirty → S13. | (git) |
| 0.0 | Create branch `v1.7` from main, push to origin | (git) |
| 0.A | **Housekeeping: refresh `.claude/CLAUDE.md`** (active version v1.7, schema version 4, optional Key Design Decision #11 for "WBS as data, not display", "Where to Look Next" pointer to plan-v1.7) | `.claude/CLAUDE.md` |
| 0.B | **Housekeeping: update `.claude/AGENT-HANDOFF.md`** to point at v1.7 Codex implementation as next action | `.claude/AGENT-HANDOFF.md` |
| 0.C | **Housekeeping: verify or append final-ship entry to `plan-v1.6.md` §17** | `.claude/plan-v1.6.md` (only if appending) |
| 0.D | **Housekeeping: update `.claude/version-status.md`** — flip v1.6 to ✅ shipped, v1.7 to ⏳ active, link plan-v1.7 | `.claude/version-status.md` |
| 0.1 | **TopBar overflow restructure (v1.6 S7 close-out).** Build `TopBarOverflowMenu.tsx`, demote `Phases`, `Parties`, `Resources`, `Change Orders` behind `DotsThree` overflow. Re-measure density at 1280px; target ≤75%. Document in `docs/topbar-density-v1.7.md`. **BLOCKING.** | `src/components/topbar/TopBar.tsx`, `src/components/topbar/TopBarOverflowMenu.tsx` (new), `src/lib/icons.ts`. `docs/topbar-density-v1.7.md` (new). |
| 0.2 | Re-affirm desktop-first mobile QA defer with dated v1.7 entry (5th audit running) | `docs/mobile-qa.md` |
| 0.3 | **Perf re-measurement at v1.6 baseline post-restructure.** Confirm no regression on initial render, Quality Panel cold-open, Reports modal first-render. Document in `docs/perf-v1.7-baseline.md`. | `docs/perf-v1.7-baseline.md` (new) |
| 0.E | Document marketing-v2-pass explicit deferral decision (no implementation; recorded in §4.5) | (no file change) |
| 0.F | Document branch-pile-up continue-keeping decision (no implementation) | (no file change) |
| 0.G | Document `Task.deps[]` lint-rule explicit deferral to v2.0 (no implementation) | (no file change) |

### Phase A — Pure WBS + rollup + actualCost libraries

| # | Task | Files |
|---|------|-------|
| A.1 | Extend `Task` and `Group` types; add `GroupNode`, `GroupRollup`; bump `PERSISTED_SCHEMA_VERSION` to 4; extend `DcmaCheckId` union to include 15 \| 16; extend `EVMResult` to include `ac`, `cpi`. | `src/types/index.ts` |
| A.2 | Scaffold `src/lib/wbs.ts` with `computeWbsCodes`, `walkGroupTree`, `getGroupDepth`, `getDescendantTaskIds` | `src/lib/wbs.ts` (new) |
| A.3 | Unit tests for `wbs.ts` (flat, two-level, five-level, sibling reorder, orphan parent, empty project) | `tests/unit/lib/wbs.test.ts` (new) |
| A.4 | Scaffold `src/lib/rollups.ts` with `computeGroupRollup` | `src/lib/rollups.ts` (new) |
| A.5 | Unit tests for `rollups.ts` (empty group, one task, nested with mixed states, rounding, total cost mix, resource count uniqueness) | `tests/unit/lib/rollups.test.ts` (new) |
| A.6 | Scaffold `src/lib/actualCost.ts` with `computeTotalActualCost` | `src/lib/actualCost.ts` (new) |
| A.7 | Unit tests for `actualCost.ts` (zero, mixed, 500-task fixture) | `tests/unit/lib/actualCost.test.ts` (new) |
| A.8 | Document v1.7 hierarchy + WBS spec in `docs/wbs.md` | `docs/wbs.md` (new) |

### Phase B — Schema migration v3 → v4

| # | Task | Files |
|---|------|-------|
| B.1 | Extend `migrateState` with v3 → v4 walk (parentId default null, actualCost default 0, then call `computeWbsCodes` and stamp codes); update `makeDefaultState` | `src/lib/storage.ts` |
| B.2 | Extend `saveState` to stamp WBS codes via `computeWbsCodes` before writing | `src/lib/storage.ts` |
| B.3 | Unit tests for migration (v3 payload loads cleanly; round-trip v3 → v4 → v4 has no field drift; flat hierarchy preserves; codes recompute on save) | `tests/unit/lib/storage.test.ts` (extend) |

### Phase C — App.tsx wiring + visibleRows rewrite

| # | Task | Files |
|---|------|-------|
| C.1 | Memoize `groupNodes`, `wbsCodes`, `groupRollups`, `totalActualCost` at App level; update `visibleRows` to walk the tree (depth-tagged) | `src/components/App.tsx` |
| C.2 | Update EVM memo to include `totalActualCost` input | `src/components/App.tsx` |
| C.3 | Wire AC field changes via existing task-mutation callbacks | `src/components/App.tsx` |

### Phase D — TaskList + WBS column + GroupRollupPill

| # | Task | Files |
|---|------|-------|
| D.1 | Update `WBS_COL_WIDTH` constant 24 → 48; move into `src/constants.ts`; remove TaskList-local declaration | `src/constants.ts`, `src/components/task-list/TaskList.tsx` |
| D.2 | Replace cosmetic `computeWbs(rows)` with `task.wbsCode` / `group.wbsCode` lookup; drop the helper (or keep as defensive fallback) | `src/components/task-list/TaskList.tsx` |
| D.3 | Implement group-row depth indentation + vertical rule via `paddingLeft` and `::before` pseudo | `src/components/task-list/TaskList.tsx`, `src/styles/tokens.css` |
| D.4 | `GroupRollupPill.tsx` component | `src/components/task-list/GroupRollupPill.tsx` (new), `src/styles/tokens.css` |
| D.5 | Wire `GroupRollupPill` into `GroupRow` (TaskList.tsx) | `src/components/task-list/TaskList.tsx` |
| D.6 | Column-header sort-by-WBS-ascending toggle | `src/components/task-list/TaskList.tsx` |

### Phase E — SidePanel breadcrumb + AC input

| # | Task | Files |
|---|------|-------|
| E.1 | `SidePanelWbsBreadcrumb.tsx` component | `src/components/SidePanelWbsBreadcrumb.tsx` (new) |
| E.2 | `SidePanelActualCostSection.tsx` component | `src/components/SidePanelActualCostSection.tsx` (new), `src/styles/tokens.css` |
| E.3 | Wire breadcrumb + AC section into `SidePanel.tsx`; auto-save on blur | `src/components/SidePanel.tsx` |

### Phase F — GroupsManager parent picker

| # | Task | Files |
|---|------|-------|
| F.1 | If `GroupsManager` modal does not exist, scaffold it; else extend with parent-picker column | `src/components/modals/GroupsManager.tsx` (new or extend) |
| F.2 | Cycle-prevention logic in the dropdown (exclude self + descendants) | `src/components/modals/GroupsManager.tsx` |
| F.3 | Depth-≥6 advisory warning when selecting parent | `src/components/modals/GroupsManager.tsx`, `src/constants.ts` (`GROUP_NEST_DEPTH_WARN = 6`) |

### Phase G — DCMA checks 15 + 16

| # | Task | Files |
|---|------|-------|
| G.1 | Implement `checkWbsCompleteness` (DCMA-15): every task has group, every non-leaf group has children, no orphan parentIds | `src/lib/dcma.ts` |
| G.2 | Implement `checkResourceOverAllocation` (DCMA-16): count days where any resource exceeds capacity; reuse `resourceDemand.ts` over-allocation logic | `src/lib/dcma.ts` |
| G.3 | Add to `CHECK_DEFINITIONS` array in correct severity-ordering position | `src/lib/dcma.ts` |
| G.4 | Extend unit tests for both checks (passing fixtures, failing fixtures with affected entities) | `tests/unit/lib/dcma.test.ts` (extend) |
| G.5 | Update `DcmaFindingsTable` "Show all 14 checks" copy → "Show all 16 checks" | `src/components/quality/DcmaFindingsTable.tsx` |
| G.6 | Document checks 15 + 16 in `docs/dcma-checks.md`; note no subscore reweight in v1.7 | `docs/dcma-checks.md` |

### Phase H — AC + CPI in EVM + executive PDF

| # | Task | Files |
|---|------|-------|
| H.1 | Extend `computeEVM` to compute `ac` and `cpi`; update `EVMResult` consumers | `src/lib/evm.ts`, `tests/unit/lib/evm.test.ts` (extend) |
| H.2 | Update `EVMPreview.tsx` KPI strip: 3 cells → 5 cells (PV / EV / AC / SPI / CPI); remove footer deferral note | `src/components/reports/EVMPreview.tsx` |
| H.3 | Optionally extend `EVMChart.tsx` with dotted AC line when AC > 0 | `src/components/reports/charts/EVMChart.tsx`, `src/styles/tokens.css` (`--evm-ac`) |
| H.4 | Update `ExecutiveReportPreview.tsx` SPI line: append `· CPI X.XX` (or `· CPI —`); remove deferral parenthetical | `src/components/reports/ExecutiveReportPreview.tsx` |
| H.5 | Update `docs/reports.md` — remove AC/CPI deferral caveat; add AC-input section | `docs/reports.md` |

### Phase I — CSV round-trip

| # | Task | Files |
|---|------|-------|
| I.1 | `generateCSV` adds `WBS Code` (after ID) and `Actual Cost` (end) columns | `src/lib/csv.ts` |
| I.2 | `csvRowsToTasks` recognises `wbs` / `wbs_code` / `WBS Code` headers; reconstruct hierarchy from codes; create missing intermediate groups | `src/lib/csv.ts` |
| I.3 | Extend `CsvImportDialog` to surface the new column in preview if present | `src/components/modals/CsvImportDialog.tsx` |
| I.4 | Unit tests for CSV round-trip (export → import → assert hierarchy equality) | `tests/unit/lib/csv.test.ts` (extend) |

### Phase J — Empty / loading / edge states + perf re-verify

| # | Task | Files |
|---|------|-------|
| J.1 | GroupRollupPill empty state for zero-task group: render `0 tasks · — · — · —` | `src/components/task-list/GroupRollupPill.tsx` |
| J.2 | AC input disabled-with-advisory copy when task has no assignments | `src/components/SidePanelActualCostSection.tsx` |
| J.3 | EVM AC cell renders `—` when total AC = 0 | `src/components/reports/EVMPreview.tsx` |
| J.4 | CPI cell renders `—` when AC = 0 | `src/components/reports/EVMPreview.tsx` |
| J.5 | Re-measure perf targets from §8; document in `docs/perf-v1.7-baseline.md` (append "post-implementation" section) | `docs/perf-v1.7-baseline.md` |

### Phase K — E2E coverage

| # | Task | Files |
|---|------|-------|
| K.1 | `tests/e2e/wbs-hierarchy.spec.ts` — open GroupsManager, nest a group, assert WBS codes + rollups update | `tests/e2e/wbs-hierarchy.spec.ts` (new) |
| K.2 | `tests/e2e/wbs-csv-roundtrip.spec.ts` — export → re-import → assert hierarchy equality | `tests/e2e/wbs-csv-roundtrip.spec.ts` (new) |
| K.3 | `tests/e2e/actual-cost.spec.ts` — enter AC on task, assert SidePanel persists, open EVM, assert AC + CPI render | `tests/e2e/actual-cost.spec.ts` (new) |
| K.4 | `tests/e2e/dcma-15-16.spec.ts` — schedule with WBS gap + over-allocation; Quality Panel shows both checks failing | `tests/e2e/dcma-15-16.spec.ts` (new) |
| K.5 | Extend `tests/e2e/quality-panel.spec.ts` — assert 16 checks render, "Show all 16 checks" copy | `tests/e2e/quality-panel.spec.ts` |
| K.6 | Extend `tests/e2e/evm-report.spec.ts` — assert 5-cell KPI strip; assert deferral footer is gone; AC = 0 path shows `—` | `tests/e2e/evm-report.spec.ts` |
| K.7 | Extend `tests/e2e/executive-report.spec.ts` — assert CPI line in SPI row | `tests/e2e/executive-report.spec.ts` |
| K.8 | Extend `tests/e2e/a11y.spec.ts` — sweep GroupsManager + TopBarOverflowMenu | `tests/e2e/a11y.spec.ts` |

### Phase L — Docs

| # | Task | Files |
|---|------|-------|
| L.1 | Update `docs/design-system.md` — v1.7 tokens (rollup pill, group indent rule, wbs code, evm AC, actual cost input bg) | `docs/design-system.md` |
| L.2 | Update `docs/onboarding-qa.md` — recommend exploring group nesting + WBS export after first baseline | `docs/onboarding-qa.md` |
| L.3 | Update `docs/dcma-checks.md` — checks 15 + 16, no-reweight decision | `docs/dcma-checks.md` |
| L.4 | Update `docs/reports.md` — EVM AC + CPI sections, deferral text removed | `docs/reports.md` |

### Phase M — Release hygiene

| # | Task | Files |
|---|------|-------|
| M.1 | `CHANGELOG.md` entry for `0.7.0` | `CHANGELOG.md` |
| M.2 | `package.json` + `package-lock.json` version bump to `0.7.0` | `package.json`, `package-lock.json` |
| M.3 | README update — WBS, AC, CPI features | `README.md` |
| M.4 | Run all gates: `npm run lint`, `npm run type-check`, `npm run test:unit`, `npm run build`, `npm run test:e2e` | — |
| M.5 | Open PR `v1.7 → main`, squash merge after green CI | git |
| M.6 | Tag `v0.7.0` on the merge commit on `main` | git tag |
| M.7 | Update `version-status.md` → v1.7 ✅ shipped; no checkpoint fires here (Checkpoint 3 is after v1.8) | `.claude/version-status.md` |
| M.8 | Append final Build Changelog entry in this file | `.claude/plan-v1.7.md` §17 |
| M.9 | Update `AGENT-HANDOFF.md` — next action: Claude authors `plan-v1.8.md` (Calendar & delays) | `.claude/AGENT-HANDOFF.md` |

---

## 10. Parallel vs sequential

| Parallel group | Tasks | Why |
|---|---|---|
| **G1a** | 0.−2 → 0.−1 → 0.0 (sequential — pre-flight gates the branch) | Pre-flight must pass before branching |
| **G1b** | 0.A, 0.B, 0.C, 0.D in parallel after 0.0 | Doc refreshes touch different files |
| **G1c** | 0.1 (TopBar restructure) is sequential after 0.B (handoff updated) and blocking on 0.3 (perf re-measure) | Restructure must precede perf re-measurement |
| **G1d** | 0.2 (mobile defer), 0.E, 0.F, 0.G — doc-only, parallel | Independent |
| **G2** | A.2+A.3, A.4+A.5, A.6+A.7 in parallel after A.1 (types) | Three independent pure libs with independent test files |
| **G3** | B.1+B.2 sequential; B.3 after B.2 | Migration is one file |
| **G4** | D.1–D.6 mostly sequential within TaskList; D.4 (pill component) can run in parallel with D.1–D.3 | Pill is its own file |
| **G5** | E.1, E.2 parallel; E.3 after both | Two components then wire-up |
| **G6** | G.1, G.2 in parallel; G.3–G.6 sequential | Two checks then registration + docs |
| **G7** | H.1 → H.2 → H.4 sequential; H.3 parallel with H.2 | Math first, then UI cells, then PDF |
| **G8** | K.1–K.7 in parallel after their respective phases land | Independent specs |

| Sequential | Depends on | Why |
|---|---|---|
| Phase A | Phase 0 | Branch + TopBar close-out first |
| Phase B | Phase A.1 + A.2 | Migration needs types + `computeWbsCodes` |
| Phase C | Phase B | App wiring needs migrated state shape |
| Phase D | Phase C | TaskList consumes memoized rollups from App |
| Phase E | Phase C | SidePanel consumes memoized state from App |
| Phase F | Phase A.2 | GroupsManager parent picker needs `walkGroupTree` |
| Phase G | Phase A + existing v1.4 DCMA infra | New checks consume existing context |
| Phase H | Phase A.6 + A.7 + existing v1.6 EVM | AC sum feeds into EVM |
| Phase I | Phase A.2 + B | CSV round-trip needs codes computed and migration in place |
| Phase J | Phases D, E, G, H | Empty states need consumers |
| Phase K | Phases D, E, F, G, H, I | E2E covers integrated surface |
| Phase L | Phases D–I | Docs reflect implemented behaviour |
| Phase M | All other phases | Release |

**Critical path:** 0.−2 → 0.−1 → 0.0 → 0.1 (TopBar) → A.1 → A.2 → B → C → D → E → G → H → K → M. Phases F / I / J / L join as parallel work.

---

## 11. Testing strategy

### 11.1 Unit tests (new + extended)

| Module | Coverage |
|---|---|
| `lib/wbs.ts` | Flat hierarchy (all depth 0); two-level (parent + child); five-level (deeply nested); sibling reorder changes code; orphan parentId resolves to root with console warning; empty project; large fixture (500 tasks, 50 groups, depth 5) under 15ms. |
| `lib/rollups.ts` | Empty group → `{0, 0, 0, 0}`; group with one task → matches the task; nested with mixed task states → recursive percent correct; rounding rule (50% rounds via banker's rule? simple round-half-up — decide and document); total cost with some uncosted tasks; resource count uniqueness across descendants. |
| `lib/actualCost.ts` | Zero (all tasks AC=0) → 0; mixed → exact sum; 500-task fixture < 5ms. |
| `lib/storage.ts` (extend) | v3-payload-load-then-save-then-reload assertion (no field drift); flat hierarchy preserves (`parentId = null` on all groups after migration); codes recompute on every save; round-trip is idempotent. |
| `lib/dcma.ts` (extend) | DCMA-15 passing fixture (every task in group, every non-leaf has child, no orphans); DCMA-15 failing fixture (orphan group, empty parent group, orphan parentId); DCMA-16 passing (no over-allocation); DCMA-16 failing (single resource over capacity for 3 days). |
| `lib/evm.ts` (extend) | AC = 0 → CPI = null; AC > 0 → CPI = EV/AC; AC > 0 and EV = 0 → CPI = 0. |
| `lib/csv.ts` (extend) | Export contains `WBS Code` column and `Actual Cost` column; import with WBS reconstructs hierarchy; import without WBS works exactly as v1.6 (regression); import with conflicting codes triggers S5 (append mode). |
| Existing perf-sensitive tests | No regression — re-run after Phase J. |

**Target:** ≥360 unit tests after Phase A (currently ≥320 post-v1.6).

### 11.2 E2E tests (Playwright)

| Spec | Flow |
|---|---|
| `tests/e2e/wbs-hierarchy.spec.ts` (new) | Open GroupsManager, nest a group under another, close, assert TaskList WBS codes update, assert parent group's rollup pill task count incremented. |
| `tests/e2e/wbs-csv-roundtrip.spec.ts` (new) | Load example, capture initial hierarchy, export CSV, clear state, re-import CSV, assert hierarchy reconstructed (same groups, same parents, same WBS codes). |
| `tests/e2e/actual-cost.spec.ts` (new) | Select task, enter actual cost, click elsewhere (blur), assert value persists across reload, open Reports → EVM, assert AC = entered value and CPI ≠ "—". |
| `tests/e2e/dcma-15-16.spec.ts` (new) | Construct schedule with orphan parentId and over-allocation; open Quality Panel; assert checks 15 and 16 surface as failing with correct affected entities. |
| `tests/e2e/quality-panel.spec.ts` (extend) | Default-failing-only view still works; "Show all 16 checks" copy correct; toggle reveals all 16. |
| `tests/e2e/evm-report.spec.ts` (extend) | KPI strip has 5 cells (PV, EV, AC, SPI, CPI); deferral footer absent; AC = 0 path renders `—`. |
| `tests/e2e/executive-report.spec.ts` (extend) | SPI line includes `· CPI X.XX`; "AC / CPI deferred" text absent. |
| `tests/e2e/a11y.spec.ts` (extend) | GroupsManager (with parent picker) + TopBarOverflowMenu pass axe sweep. |

**Target:** ≥28 E2E specs after Phase K (currently ≥20 post-v1.6).

### 11.3 Accessibility tests

- TopBarOverflowMenu: Tab into the trigger, Enter opens, ArrowDown navigates entries, Escape closes, Tab cycles within the popover.
- GroupsManager parent dropdown: standard `<select>` semantics; `aria-label` describing "Parent group for {group name}".
- SidePanelActualCostSection input: explicit `<label>` association; describes "USD per task".
- GroupRollupPill: has descriptive `aria-label` (e.g., "Group totals: 12 tasks, 64% complete, $2.4M, 5 resources").
- WBS code column in TaskList: monospaced rendering must not break screen-reader output of codes — verify by axe sweep.

### 11.4 Performance verification

After Phase K, re-run perf baseline at v1.6 scale with v1.7 features active:
- Initial render at 500 tasks × 25 resources × 50 groups × depth 5 hierarchy: hold v1.6 baseline (`docs/perf-v1.6-quality-panel.md`).
- Quality Panel cold-open with 16 checks: hold ≤100ms target.
- TaskList re-render on collapse/expand: no frame drops >33ms.
- CSV round-trip at 500 tasks: <200ms.
- Build size delta: <+20KB gzipped.

### 11.5 Manual QA

| Path | Why manual |
|---|---|
| Construct a 5-level-deep hierarchy in GroupsManager | Subjective — does the indentation read cleanly? Are rollup pills legible at depth 5? |
| Print A3 Gantt with deeply nested groups | Print pagination — do group rows wrap or truncate? Are WBS codes visible? |
| Enter actual cost across 20 tasks, open EVM | End-to-end — does CPI compute correctly? Is the AC line in the chart legible at 24-month range? |
| Open Reports → Executive Summary → Export PDF | Does the SPI · CPI line fit on one page? Are CPI values within the truncation budget? |
| Import a v1.6 CSV (no WBS column) | Backwards compat — does flat-import still work? Are codes assigned post-import? |
| Import a CSV with conflicting WBS codes in append mode | Does S5 trigger appropriately? |
| Toggle WBS column sort on a 500-task fixture | Frame drops on sort? Does it match WBS-ascending exactly? |

---

## 12. Quality gate — Gate 2 checklist

**Branch hygiene**
- [x] Plan reminds of the one-branch-per-version rule
- [x] AGENTS.md § Conventions codifies the rule as permanent (since v1.4)

**Pre-flight & housekeeping**
- [x] Phase 0.−2 verifies v1.6 merged to `main` and `v0.6.0` tagged (gates branch creation; S13 if fails)
- [x] Phase 0.−1 verifies clean working tree (or only known `playwright-report/index.html` noise)
- [x] Phase 0.A refreshes `.claude/CLAUDE.md` (active v1.7, schema 4)
- [x] Phase 0.B repoints `.claude/AGENT-HANDOFF.md` for Codex v1.7 implementation
- [x] Phase 0.C verifies / appends to `plan-v1.6.md` §17
- [x] Phase 0.D flips `version-status.md` to v1.7 ⏳ active

**v1.6 carry-overs**
- [x] Phase 0.1 closes TopBar density debt (v1.6 S7) via overflow restructure — BLOCKING
- [x] Phase 0.2 re-affirms desktop-first mobile QA defer (5 audits running — explicitly noted)
- [x] Phase 0.3 re-measures perf at v1.6 baseline post-restructure
- [x] Phases G/H absorb audit-v4 §10.2 should-fix carries (DCMA-15 / DCMA-16 / AC / CPI)

**Architecture**
- [x] WBS computations live in pure `src/lib/*` modules (wbs, rollups, actualCost)
- [x] **Schema bump 3 → 4** is additive, defaults applied, round-trip safe
- [x] No new runtime dependencies (no tree libraries, no chart libraries, no PDF libraries)
- [x] WBS codes are derived from hierarchy + stamped on save (decision rationale §7.5)
- [x] App.tsx remains the single state owner; new derivations memoized at App level
- [x] No `any`, no force-unwrap, TypeScript strict still clean
- [x] All new colors are tokens

**Task breakdown**
- [x] All new files listed in §5.2
- [x] All modified files listed in §5.3
- [x] Each task ≤3 files / one commit
- [x] Parallel groups identified
- [x] Dependencies between phases explicit

**Testing**
- [x] Unit tests planned for every new pure module
- [x] E2E spec planned for each user-visible flow
- [x] axe a11y sweep extended to new modal + popover surfaces
- [x] Performance targets defined with measurement instructions
- [x] Round-trip migration test specified

**Discipline**
- [x] Scope-creep traps from §3.2 explicitly excluded
- [x] No chart libraries / no PDF libraries (carried from v1.6)
- [x] No tree libraries
- [x] No time-phased AC entry
- [x] No drag-to-reparent
- [x] No WBS-code manual override
- [x] Two-organ bundling (WBS + AC/CPI) justified in §3.3
- [x] Visual changes preserve v1.2's de-vibecoded posture
- [x] Roll-up pills are monospaced, single-line, no icons, no color-coding
- [x] Codex operating rules embedded at top of plan
- [x] `.claude/` commit rule reaffirmed
- [x] `.gitignore` discipline reaffirmed
- [x] Context auto-compaction reaffirmed

Gate 2 passes. Plan is ready to execute.

---

## 13. Acceptance criteria — v1.7 ship gate

**Branch**
- [ ] All v1.7 commits live on branch `v1.7`
- [ ] Ship merges via PR `v1.7 → main`
- [ ] Tag `v0.7.0` placed on the merge commit
- [ ] Branch deletion deferred (kept per v1.3 / v1.4 / v1.5 / v1.6 pattern)

**Pre-flight & housekeeping (Phase 0)**
- [ ] `main` carries v1.6 merge commit; `v0.6.0` tag present; `package.json` on `main` reads `0.6.0`
- [ ] `.claude/CLAUDE.md` refreshed (active v1.7, schema 4, design decisions, plan pointer)
- [ ] `.claude/AGENT-HANDOFF.md` repointed to v1.7 Codex implementation
- [ ] `plan-v1.6.md` §17 final-ship entry appended (or verified complete)
- [ ] `.claude/version-status.md` updated (v1.6 ✅ shipped, v1.7 ⏳ active)
- [ ] `plan-v1.7.md` §17 maintained entry-per-phase from Phase 0.−2 onward

**v1.6 carry-overs**
- [ ] `docs/topbar-density-v1.7.md` exists with verdict ≤75%; before/after screenshot
- [ ] `docs/mobile-qa.md` carries a dated v1.7 desktop-first defer entry
- [ ] `docs/perf-v1.7-baseline.md` exists with v1.6-baseline comparison + post-implementation re-measure

**Capability — WBS**
- [ ] Every task and every group carries a persisted `wbsCode`
- [ ] `Group.parentId` is set on all groups (null for top-level)
- [ ] TaskList WBS column is 48px wide and shows real codes from `task.wbsCode`
- [ ] Group rows are indented by depth with vertical connector rule
- [ ] Group rows render a single-line monospaced rollup pill
- [ ] GroupsManager parent picker prevents cycles and warns at depth ≥6
- [ ] SidePanel header shows WBS breadcrumb `code — name`
- [ ] CSV export includes `WBS Code` and `Actual Cost` columns
- [ ] CSV import with `wbs` / `wbs_code` / `WBS Code` reconstructs hierarchy
- [ ] CSV import without WBS column behaves exactly as v1.6 (regression)

**Capability — AC / CPI close-out**
- [ ] `Task.actualCost` exists and persists on every task (default 0)
- [ ] SidePanel renders `SidePanelActualCostSection` with auto-save on blur
- [ ] AC input is disabled-with-advisory when task has no resource assignments
- [ ] EVM KPI strip shows 5 cells (PV / EV / AC / SPI / CPI)
- [ ] EVM "AC / CPI deferred" footer is removed
- [ ] CPI cell renders `—` when AC = 0, otherwise color-coded (green ≥1.00, amber 0.90–0.99, red <0.90)
- [ ] EVMChart shows dotted AC line when AC > 0
- [ ] Executive PDF SPI row appends `· CPI X.XX` (or `· CPI —`)

**Capability — DCMA checks 15 + 16**
- [ ] `DcmaFindingsTable` renders 16 checks; "Show all 16 checks" copy correct
- [ ] DCMA-15 (WBS completeness) passes on a well-formed schedule, fails on a broken hierarchy
- [ ] DCMA-16 (resource over-allocation) passes on a leveled schedule, fails on an over-allocated one
- [ ] Health subscore weights unchanged (no reweight in v1.7 per §5.3 decision)

**Discipline**
- [ ] `PERSISTED_SCHEMA_VERSION` is `4`
- [ ] Round-trip migration test green (v3 → v4 → reload → no drift)
- [ ] No new runtime dependencies (no tree libs, no chart libs, no PDF libs)
- [ ] No new gradients, card spam, KPI tiles, RAG indicators
- [ ] Every new icon is Phosphor from `src/lib/icons.ts`
- [ ] No hardcoded hex in any new component
- [ ] No `any`, no force-unwrap, TypeScript strict still clean
- [ ] TopBar density at 1280px ≤75% post-restructure

**Trust**
- [ ] `npm run lint` clean
- [ ] `npm run type-check` clean
- [ ] `npm run test:unit` green (target: ≥360 tests after Phase A)
- [ ] `npm run build` clean; bundle delta <+20KB gzipped vs v1.6
- [ ] `npm run test:e2e` green (target: ≥28 specs after Phase K)
- [ ] Phase 0.3 perf measurements documented and no regressions
- [ ] Phase J post-implementation perf re-measure passes
- [ ] CI on `v1.7` and on the merge to `main` verified green
- [ ] CHANGELOG, README, version bump landed
- [ ] `v0.7.0` tagged

---

## 14. Risks & mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| **Schema migration 3 → 4 corrupts existing v3 saves** | High | Unit test the v3 → v4 walk exhaustively (B.3). Round-trip test asserts no field drift. Test fixtures from `scripts/500-tasks.json` round-trip through migration. If any corruption surfaces in manual QA, S2 triggers. |
| **WBS code recomputation on every save creates churn in localStorage** | Medium | Codes are deterministic from hierarchy. Stamping on save is O(groups + tasks). At 500 tasks + 50 groups, the stamping step is <15ms per §8. Memo-cached during a render cycle to prevent re-stamping on every keystroke. |
| **Deeply nested hierarchy (depth 5+) breaks print A3 column width** | Medium | Group rows in print indent via the same `paddingLeft` rule but the `--gantt-task-col` width is fixed. If depth 5+ causes truncation, add a print-specific reduced indent (`GROUP_INDENT_PX_PRINT = 8`). Manual QA in Phase L verifies. |
| **GroupsManager parent picker creates cycles silently** | High | Cycle prevention is enforced in the dropdown filter (F.2). Unit test asserts: no group can pick itself, no group can pick a descendant. Defense in depth: `computeWbsCodes` detects cycles and falls back to flat hierarchy with a console warning + DCMA-15 failure. |
| **AC input renders `NaN` or `$NaN` when user types non-numeric** | Medium | Numeric input with `inputMode="decimal"`. On blur, parse with `Number()` and fall back to previous value (don't write `NaN`). Currency formatting only applied on blur for valid numbers. |
| **CPI division by zero shows `Infinity`** | Medium | Explicit `null` fallback in `computeEVM` when AC = 0. KPI cell renders `—`. Unit test E2.x verifies. |
| **CSV import with conflicting WBS codes corrupts hierarchy in append mode** | High | S5 triggers if codes conflict in append mode. Replace-mode wipes existing state so no conflict possible. Document the append-mode behaviour in `docs/wbs.md`. |
| **TopBar overflow restructure breaks existing E2E specs** | Medium | Phase 0.1 commits the restructure before any v1.7 capability work. Update existing specs (`tests/e2e/baseline-compare.spec.ts`, `change-orders.spec.ts`, etc.) that reference moved buttons to navigate via the overflow menu. Test in Phase K.8. |
| **DCMA check 16 double-counts over-allocation already shown in histogram** | Low | The histogram and check 16 read the same underlying `resourceDemand.ts` output. Test that the affected-resources list in check 16 matches the histogram's over-allocation markers. |
| **WBS code stability across reorder churn** | Low | Codes update on every group/task reorder. This is expected. Document in `docs/wbs.md` that codes are *not* stable identifiers — `Task.id` is the stable identifier; `wbsCode` is a display+export field. |
| **Rollup pill recomputation on every keystroke** | Medium | App-level memoization (§7.4) keyed on `[groups, tasks, assignments, resources]`. Inside a typing burst on a task name, `tasks` changes per keystroke — memo invalidates. Acceptable trade-off (rollup compute is <100ms total at 500 tasks); if profiling shows churn, debounce. |
| **AC field churn on every keystroke similarly invalidates EVM memo** | Medium | AC field auto-saves on *blur* only. Mid-edit keystrokes update local input state, not the persisted `task.actualCost` and not the EVM memo. Auto-save on blur is the explicit pattern (matches `actualStart` / `actualFinish` in v1.0). |
| **Stop-and-ping triggers ignored** | High | Codified at top of plan + listed in §16. Every phase boundary reads the rules. |
| **Branch hygiene drift** | High | Codified in AGENTS.md; reminder at top of plan; verification step in Phase 0.0. |

---

## 15. Out of scope (deferred — reaffirmed)

See §3.2 for the canonical list. Highlights:

- **v1.8** — Project calendar overlay + per-resource calendars + delay tracking + shift patterns + excusable classification + AC import from CSV
- **v1.9** — P6 / MPP / Procore integration + AC pull from accounting
- **v2.0** — Cloud sync + multi-user + change-order approval routing + audit trail + comments + presence
- **v2.1** — Portfolio dashboard + cross-project WBS rollups + project templates
- **v2.2** — Density modes + saved views (including WBS-based filters) + bulk edit + drag-to-reparent + drag dependencies + offline mode + WBS-code manual override + per-week/per-month AC time-phasing + WBS column drag-resize

If a v1.7 PR includes any of the above, reject. Point at this section.

---

## 16. Stop-and-ping points (implementation agent pauses)

These are decisions the implementation agent must NOT make alone. Pause, surface, wait for human.

| # | Trigger | What to surface |
|---|---------|-----------------|
| **S1** | Phase 0.1 — TopBar density at 1280px does NOT hit ≤75% after the overflow restructure | Stop. Surface the new measurement and the popover layout chosen. Decide between further demoting buttons or accepting a higher threshold with documentation. |
| **S2** | Any phase requires schema bump beyond v3 → v4 (i.e., needs more than additive `wbsCode` / `parentId` / `actualCost`), OR AC/CPI scope creeps past Phase H budget | Stop. v1.7 is constrained to one schema bump and a bounded AC scope per §3.3. Surface the need before bumping again or expanding cost-tracking scope. |
| **S3** | Any phase requires a new runtime dependency (tree library, chart library, PDF library) | Stop. Surface the dependency, alternatives rejected, and bundle-size impact. v1.7 forbids new deps. |
| **S4** | A 500-task fixture round-trip through migration 3 → 4 loses or mutates any field beyond the documented additive changes | Stop. Surface the diff. Migration is required to be round-trip safe. |
| **S5** | CSV import with WBS codes that conflict with an existing project's hierarchy in append mode | Stop. Surface the conflict. Decide between forcing replace mode, prompting the user, or rejecting the import. |
| **S6** | DCMA check 15 or 16 produces obviously wrong affected-entity lists on a representative fixture | Stop. Surface the input fixture and the computed output. Confirm before adjusting check logic. |
| **S7** | Phase 0.1 — overflow popover keyboard a11y cannot be made compliant within reasonable effort (e.g., Tab cycle leaks, Escape doesn't restore focus) | Stop. Surface the symptom. Decide between a different popover pattern (e.g., full modal) and deferring the demoted-buttons subset behind a slot in the existing modal stack. |
| **S8** | AC input shows `NaN` or breaks SidePanel layout on non-numeric input | Stop. Surface the input that broke parsing. Fix in `SidePanelActualCostSection.tsx`. |
| **S9** | Phase 0.0 — branch `v1.7` already exists or local tree is dirty | Stop. Surface state. Do not force-push, do not auto-delete. |
| **S10** | WBS code computation produces inconsistent codes across reloads at depth 5+ | Stop. Surface the diverging codes. Likely cause: sibling ordering drift in `groups[]` array. Decide whether to enforce a stable secondary sort key (e.g., `Group.id`). |
| **S11** | Roll-up pill computation exceeds 100ms total at 500-task fixture | Stop. Profile. Memoize at a finer grain or move computation to a Web Worker (v2.x territory — surface for human direction). |
| **S12** | DCMA check 16 double-counts over-allocation already shown in histogram, OR the affected-resources list doesn't match the histogram | Stop. The two surfaces must read from the same `resourceDemand.ts` output. Surface the divergence. |
| **S13** | Pre-flight (Phase 0.−2 / 0.−1) fails: `v0.6.0` tag missing on `main`, v1.6 merge commit absent, `main` `package.json` not at `0.6.0`, or working tree dirty beyond the known `playwright-report/index.html` noise | Stop. Do not branch `v1.7`. Surface the state of `main`, the missing artefact, and wait for direction. The human actions for v1.6 PR + tag may still be pending — do not work around. |

If none of these trigger, the agent proceeds phase by phase without further pings until Phase M.5 (the PR open) and Phase M.7 (the version-status update — which is itself the next stop-and-ping, as Claude takes over to write `plan-v1.8.md`).

---

## 17. Build Changelog

> Codex appends an entry here per phase commit set. Format follows plan-v1.6.md §17 and plan-v1.5.md §17.

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

(One entry per commit set. Phases A through M follow the same template. Final entry on ship summarises the version, version bump, tag, and links the PR.)

---

## 18. Plan metadata

**Plan author:** Claude (planning agent)
**Plan ready for:** Codex implementation, starting at Phase 0.−2 (pre-flight verification of v1.6 on `main`), then Phase 0.0 (branch creation), then Phase 0.1 (TopBar overflow restructure — BLOCKING), then Phase 0.2 / 0.3, then Phase A.
**Plan supersedes:** None — additive on top of plan-v1.6 (implementation complete, awaiting human PR/tag)
**Plan successor:** `plan-v1.8.md` (Calendar & delays). v1.8 is itself authored after v1.7 ships. **No PM Audit checkpoint fires after v1.7** — the next checkpoint is Checkpoint 3 after v1.8 ships.

---

## 19. Assumptions made

These are the assumptions that shaped this plan. If any prove false, surface immediately.

1. **v1.6 will be shipped on `main` tagged `v0.6.0` by the time v1.7 implementation begins.** Confirmed by `version-status.md` (v1.6 ⏳ active, implementation complete on branch `v1.6`, commit `e2517cb`, awaiting human PR/tag). Pre-flight 0.−2 verifies before branching. If the human-owned PR/tag is still pending, S13 triggers.
2. **The existing `Task` and `Group` types are extensible additively.** Confirmed by `src/types/index.ts` — both are simple interfaces with no `readonly` modifiers; adding optional / defaulted fields is round-trip safe per the v1.5 schema-bump precedent.
3. **`PERSISTED_SCHEMA_VERSION` bump 3 → 4 is the right call for this scope.** Per `CLAUDE.md` "Persistence" + the v1.3 / v1.5 migration patterns, additive schema bumps are the standard. Schema-stable v1.7 was considered (computing WBS codes on the fly without persistence) but rejected per §7.5 — CSV export and baseline snapshots need codes to travel.
4. **The current `computeWbs(rows)` cosmetic helper at `TaskList.tsx:39` can be retired in favor of `task.wbsCode` / `group.wbsCode` lookups.** Confirmed by code inspection — it's a pure render-time function with no external callers (single use inside `TaskList.tsx:469`).
5. **No existing `GroupsManager` modal — or if it exists, it can be extended with a parent picker without breaking.** To be verified during Phase F. If the modal doesn't exist, F.1 scaffolds it; if it exists, F.1 extends it.
6. **Bundling AC + CPI into v1.7 is the right call.** Per audit-v4 §10.2 (should-fix carry) and plan-v1.6 §3.2 (deferred to "v1.7 or v1.8 — folded into the WBS / cost-tracking widening"). Bundling is justified in §3.3. If implementation reveals AC scope creep (e.g., per-week entry, payroll integration), S2 triggers and AC defers to v1.8.
7. **DCMA-15 (WBS) and DCMA-16 (resource over-allocation) belong in v1.7 alongside the WBS organ.** Per audit-v4 §10.2 (DCMA-15 carry) and §5.8 (over-allocation gap). Both touch existing v1.4 DCMA infrastructure; bundling avoids a second DCMA touch in v1.8.
8. **No subscore reweight in v1.7.** Health composition weights stay as v1.4 shipped. Reweighting to accommodate two new checks is a v1.8 / Schedule Quality v2 concern. Document in `docs/dcma-checks.md` (Phase G.6).
9. **TopBar overflow restructure (v1.6 S7 close-out) belongs in v1.7 Phase 0, not deferred further.** v1.7 doesn't add a new TopBar button, but the chronic density debt from v1.6 (90.84% at 1280px) compounds if ignored. Closing it now in Phase 0 unblocks v1.8's calendar overlay toggle (which *will* need a new TopBar slot).
10. **The `WBS_COL_WIDTH = 48` widening does not break TaskList layout at typical widths.** At 1280px viewport, the column total budget should accommodate +24px. Phase D verifies; if it breaks, the column gets a configurable show/hide toggle (already implied by §6.3 column header click).
11. **`generateCSV` adding two new columns (`WBS Code`, `Actual Cost`) does not break v1.6 CSV consumers.** CSV is for human/spreadsheet consumption; new columns at the end are safe. Append `Actual Cost` at the end (after `Notes`) to preserve any positional parsers; insert `WBS Code` after `ID` to position alongside identifiers. v1.6 had no documented external consumers beyond the round-trip import.
12. **`resourceDemand.ts` over-allocation output is the correct source for DCMA-16.** Confirmed by code inspection — the existing histogram over-allocation surface uses this module; reusing it for DCMA-16 keeps the two surfaces consistent.
13. **Plan files are local artifacts and need not be committed until human direction.** User direction from v1.6 plan stands: "Local planning/docs files can be updated locally but should not be assumed as committed artifacts unless explicitly requested." This plan is written to `.claude/plan-v1.7.md` locally; commit decision is the human's. Per `AGENTS.md § .claude Commit Rule`, the commit must happen in the same branch cycle the file is touched.

---

**Plan ready for Codex implementation starting at Phase 0.−2 (pre-flight verification).**
### Phase 0.−2 through 0.3 — Pre-flight, Branch Setup, TopBar Debt Close-Out, and Carry-Over Docs

- Scope
  - Verified `origin/main` contains v1.6 merge commit (`53e28cf`) and `package.json` at `0.6.0`.
  - Created and pushed missing `v0.6.0` tag.
  - Confirmed/accepted working-tree noise policy (`playwright-report/index.html` only).
  - Verified branch `v1.7`, set upstream with `git push -u origin v1.7`.
  - Implemented blocking TopBar overflow restructure:
    - Demoted `Phases`, `Parties`, `Resources`, and `Change Orders` behind `More`.
    - Kept `Baselines`, `Quality`, `Reports` in-line.
    - Added outside-click and `Escape` close behavior with focus return.
  - Documented topbar density close-out and captured screenshot.
  - Refreshed Phase 0 carry-over docs (`mobile-qa` defer, perf baseline note).
  - Refreshed `.claude` continuity docs for v1.6 shipped / v1.7 active state.
- Files touched
  - `src/components/topbar/TopBar.tsx`
  - `src/lib/icons.ts`
  - `docs/topbar-density-v1.7.md`
  - `docs/v1.7-screenshots-topbar-1280.png`
  - `docs/mobile-qa.md`
  - `docs/perf-v1.7-baseline.md`
  - `.claude/CLAUDE.md`
  - `.claude/version-status.md`
  - `.claude/AGENT-HANDOFF.md`
- Verification
  - `npm.cmd run build` ✅
  - `npm.cmd run lint` ✅
  - `npm.cmd run type-check` ✅
  - 1280px density measurement doc recorded (`71.18%` on full-topbar basis).
- Notes
  - Pre-flight S13 blockers were closed before capability work proceeded.
  - Remaining known noise file (`playwright-report/index.html`) stayed unstaged.
### Phase A — Pure WBS, Rollup, and Actual Cost Libraries

- Scope
  - Implemented A.1 schema/type updates in `src/types/index.ts`:
    - `Task.wbsCode`, `Task.actualCost`
    - `Group.parentId`, `Group.wbsCode`
    - `GroupNode`, `GroupRollup`
    - `DcmaCheckId` expanded to include `15 | 16`
    - `PERSISTED_SCHEMA_VERSION` bumped to `4`
    - `EVMResult.ac` normalized to numeric field
  - Implemented A.2/A.4/A.6 pure libs:
    - `src/lib/wbs.ts` (`computeWbsCodes`, `walkGroupTree`, `getGroupDepth`, `getDescendantTaskIds`)
    - `src/lib/rollups.ts` (`computeGroupRollup`)
    - `src/lib/actualCost.ts` (`computeTotalActualCost`)
  - Implemented A.3/A.5/A.7 unit tests:
    - `tests/unit/lib/wbs.test.ts`
    - `tests/unit/lib/rollups.test.ts`
    - `tests/unit/lib/actualCost.test.ts`
  - Implemented A.8 documentation:
    - `docs/wbs.md`
  - Updated storage unit expectations to schema v4 in `tests/unit/lib/storage.test.ts`.
- Files touched
  - `src/types/index.ts`
  - `src/lib/wbs.ts`
  - `src/lib/rollups.ts`
  - `src/lib/actualCost.ts`
  - `tests/unit/lib/wbs.test.ts`
  - `tests/unit/lib/rollups.test.ts`
  - `tests/unit/lib/actualCost.test.ts`
  - `tests/unit/lib/storage.test.ts`
  - `docs/wbs.md`
- Verification
  - `npm.cmd run lint` ✅
  - `npm.cmd run type-check` ✅
  - `npm.cmd run test:unit` ✅
- Notes
  - WBS computation currently treats orphan-parent groups as top-level for deterministic output; DCMA integrity checks land in Phase G.
### Phase B — Schema Migration v3 to v4

- Scope
  - Implemented `storage.ts` migration/update path for v1.7 schema:
    - Added normalization helpers for groups/tasks (`parentId`, `wbsCode`, `actualCost`).
    - Added WBS stamping helper that computes and stamps group/task `wbsCode` deterministically.
    - Applied normalization + WBS stamping during `loadState` migration flow.
    - Applied deterministic WBS stamping during `saveState` for both current tasks and baseline snapshot tasks.
  - Expanded migration regression tests in `storage.test.ts`:
    - v3 payload parentId defaulting + WBS stamp assertions.
    - Save-path WBS restamp assertions.
    - Updated v4 schema expectations and round-trip naming.
- Files touched
  - `src/lib/storage.ts`
  - `tests/unit/lib/storage.test.ts`
  - `.claude/AGENT-HANDOFF.md`
- Verification
  - `npm.cmd run lint` ✅
  - `npm.cmd run type-check` ✅
  - `npm.cmd run test:unit` ✅
- Notes
  - Migration remains additive and round-trip safe for legacy payloads exercised in storage unit suite.
### Phase C — App Wiring and Tree-Ordered Visible Rows

- Scope
  - Implemented App-level derived hierarchy/cost state:
    - `groupNodes` via `walkGroupTree(groups)`
    - memoized group rollups map via `computeGroupRollup`
    - memoized `totalActualCost` via `computeTotalActualCost`
  - Replaced flat `visibleRows` builder with hierarchy-driven tree order:
    - renders groups in depth order from `groupNodes`
    - carries `depth` + `wbsCode` metadata on group rows
    - preserves collapse behavior
    - appends orphan/un-grouped tasks defensively
  - Updated EVM integration path:
    - `computeEVM` now accepts `totalActualCost`
    - returns `ac` numeric and `cpi` when AC > 0
    - updated EVM unit tests accordingly
- Files touched
  - `src/components/App.tsx`
  - `src/lib/evm.ts`
  - `src/types/index.ts`
  - `tests/unit/lib/evm.test.ts`
  - `.claude/AGENT-HANDOFF.md`
- Verification
  - `npm.cmd run lint` ✅
  - `npm.cmd run type-check` ✅
  - `npm.cmd run test:unit` ✅
- Notes
  - Group rollups are memoized in App and intentionally staged for Phase D UI consumption.
### Phase D — TaskList WBS Column, Depth Indentation, and Rollup Pill

- Scope
  - Updated App -> TaskList wiring to pass memoized group rollups.
  - TaskList structural updates:
    - widened WBS column (`48px`)
    - removed transient WBS computation helper
    - rendered persisted WBS values from state (`row.wbsCode`, `task.wbsCode`)
    - added hierarchy indentation for group + task rows
    - added group indent connector rule
    - rendered single-line monospaced rollup pill per group row
  - Extended `VisibleRow` group shape to include optional `depth` / `wbsCode` metadata for list rendering.
- Files touched
  - `src/components/App.tsx`
  - `src/components/task-list/TaskList.tsx`
  - `src/types/index.ts`
  - `.claude/AGENT-HANDOFF.md`
- Verification
  - `npm.cmd run lint` ✅
  - `npm.cmd run type-check` ✅
  - `npm.cmd run test:unit` ✅
- Notes
  - Rollup data is consumed from App memoization; no per-row recompute in list render path.
### Phase E — SidePanel WBS Breadcrumb and Actual Cost Input

- Scope
  - Added `SidePanelWbsBreadcrumb` to show task WBS code and derived group path context in the SidePanel header.
  - Added `SidePanelActualCostSection` for per-task AC entry with local draft, blur-save commit, and numeric guardrails.
  - Wired breadcrumb + AC section into `SidePanel.tsx`.
  - Implemented disabled AC input advisory when no assignments exist (`Assign resources first to enable cost tracking.`).
- Files touched
  - `src/components/SidePanelWbsBreadcrumb.tsx`
  - `src/components/SidePanelActualCostSection.tsx`
  - `src/components/panels/SidePanel.tsx`
  - `.claude/AGENT-HANDOFF.md`
- Verification
  - `npm.cmd run lint` ✅
  - `npm.cmd run type-check` ✅
  - `npm.cmd run test:unit` ✅
- Notes
  - AC commits through existing `onUpdateTask` flow on blur only; invalid numeric input resets to persisted task value.
