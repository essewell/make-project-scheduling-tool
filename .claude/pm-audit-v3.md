# PM Audit v3 — Senior Project Manager Evaluation (Checkpoint 1)

**Audit ID:** pm-audit-v3
**Date:** 2026-05-23
**Auditor:** Senior PM lens (institutional construction, schedule defensibility, instrument-grade tooling)
**Checkpoint:** **Roadmap Checkpoint 1** — after v1.3 ships (Resource Foundation)
**Previous audit:** [pm-audit-v2.md](./pm-audit-v2.md) (score: 4.5/10 holistic, 4.4/10 equal-weight)
**Versions since:** v1.2 → v1.3 (`v0.3.0` tag, merged to `main` 2026-05-23)
**Time elapsed:** ~1 day of compressed agent work (real calendar: 2026-05-22 → 2026-05-23)

> **Why this audit:** The roadmap names this as the first formal decision gate. v1.3 was the first version on the fitness roadmap that adds a construction-PM capability rather than a foundation pass. The question this audit answers is binary: did the resource organ transplant land, and is it integrated cleanly enough that v1.4 (schedule quality engine) can grade a resource-loaded schedule without rewriting v1.3 first?

---

## 1. Executive Summary

v1.3 shipped the first real organ. A construction PM can now define labor, equipment, and material resources; assign them to tasks with quantities; see a per-resource demand histogram that shares the Gantt timeline; watch over-allocation surface in `--color-danger` above the capacity line; drag a task within its float and watch the histogram update live; and see a project cost total in the StatBar and on the printed A3 summary. The schema migrated cleanly from 1 → 2 with no destructive change. The undo stack picked up the documented Decision #4 boundary expansion (resource-delete-with-assignments now pushes a snapshot). Unit tests grew from 149 to 173 with no regressions; E2E specs grew from 10 to 13. CI is green. The cost column on the printed deliverable means a PM can now hand an owner a one-page A3 that names dollars per task, not just dates per task.

What did **not** ship — deliberately — is auto-leveling, multi-resource overlay, resource calendars beyond project workweek, rate escalation, EVM, cash flow forecast, and S-curve. Those belong to v1.4 / v1.5 / v1.6 and the v1.3 plan's §3.2 forbidden list held under pressure. The plan called for one organ and one organ landed.

**The single most important finding of this audit:** the resource model is real and usable, but it is **one organ at the foundation level, not at the workflow level**. A PM can use it to spot over-allocation on a single trade. They cannot yet use it to compare two trades, to model a resource that's only available in weeks 14–22, or to cost-load a 36-month project where the carpenter rate escalates 3.5% in year 2. None of those gaps are blocking v1.4 — they are roadmap items at v1.5 / v1.6 / v1.8 — but a PM evaluating v1.3 in isolation would call it "directionally right, not yet load-bearing for a real institutional build."

**Previous verdict:** Excellent bones, now visibly polished, still missing organs — but the operating theatre is sterile and the instrument tray is laid out.

**This verdict:** The first organ is in. It works. It needs to grow into the rest of the body before the patient walks.

**Direction:** ▲ Improved — first material gain on capability dimensions since v1.0.

---

## 2. Fitness Score by Dimension

Scored against the construction-PM lens. Changes of ≥1 point are justified inline.

| Dimension | Previous (v1.2) | Current (v1.3) | Δ | Notes |
|---|---|---|---|---|
| **Task management** | 7.5 | 7.5 | 0 | No change. Task model and editing unchanged. |
| **Dependency logic** | 8 | 8 | 0 | No change. CPM still does not consider resource constraints — RCPSP is v2.x territory. |
| **Baseline/variance** | 7 | 7 | 0 | No change. Single baseline. Resource shifts do not yet track as variance — v1.5. |
| **Resource management** | 1 | **6.5** | **+5.5** | The headline move. CRUD pool with three categories, capacity per workday, per-task assignment with quantity, demand histogram sharing the Gantt axis, over-allocation surfacing, manual leveling via drag-within-float, CSV import/export, schema migration. Capped at 6.5 (not higher) because: single-resource view only (no stacked/overlay), no resource calendars (only project workweek), no skill levels/crew composition, material consumption is linear approximation, no rate periods or escalation. These are real construction realities that the v1.3 model does not yet capture. |
| **Cost management** | 0 | **4** | **+4** | Per-task cost rollup, per-group rollup, project total in StatBar (mono, `$#,###`), cost column in TaskList behind View menu, cost column in printed A3 summary mode, project total footer on the print canvas. Capped at 4 because: USD-only with a `// TODO: i18n` flag, no time-phased rates, no escalation, no overheads/burden/markup, no cash flow distribution (a labor cost on a 90-day task is calculated as `qty × workdays × rate` but not distributed month-by-month for cash flow). EVM / SPI / CPI / planned vs earned value all still missing — v1.6. |
| **Collaboration** | 0 | 0 | 0 | No change. v2.0 territory. |
| **Reporting** | 5.5 | 6 | +0.5 | A3 print canvas now carries cost. Summary mode shows per-task cost + project total footer. Still no S-curve, no EVM dashboard, no executive one-pager — v1.6. |
| **Schedule quality** | 2 | 2 | 0 | No DCMA, no health score, no logic validation. v1.4 is the next version and is explicitly scoped to this dimension. |
| **Integration** | 1 | 1.5 | +0.5 | New CSV pair (`resources.csv`, `assignments.csv`) extends the interchange surface. Task CSV intentionally unchanged — v1.0/v1.1 CSVs remain readable. Still no P6/MPP — v1.9. |
| **Mobile / field** | 6.5 | 6.5 | 0 | `ResourceAssignmentSection` slotted into SidePanel cleanly; bottom sheet drag physics not regressed (E2E `mobile-sheet.spec.ts` green). However, real-device QA on the new assignment section is **still owed** — `docs/mobile-qa.md` was updated as a structured log but human-run iPhone/Android verification was not closed. This is a repeated shame from v2 — see §8.3. |
| **WBS / hierarchy** | 4 | 4 | 0 | No change. v1.7. |
| **Calendar / delays** | 3 | 3 | 0 | No change. v1.8. Worth noting: v1.3 introduces resources without resource-specific calendars. An equipment rental available only in Q3 cannot be modeled; the resource is treated as always-available subject to project workweek. This is a real construction reality that v1.3 punted on (correctly per §3.2). |
| **Visual discipline** | 8.5 | 8.5 | 0 | Held. The histogram, resource selector pill, assignment section, and StatBar cost/over-alloc additions all pass the v1.2 pre-flight test (no gradients, no card spam, no AI tells). The histogram is the largest surface expansion since v1.0 and it preserves the Swiss thesis. Three unlabeled form controls in `ResourcesManager` were caught by the axe sweep extension (K.4) and fixed before ship — that is the right kind of discipline. |
| **Performance** | 7.5 | 7.5 | 0 | Bundle delta within target. 173 unit tests + 13 E2E all green. Demand recompute uses the deferred-bar pattern from v1.2 (the 2px loading bar). No regression observed in drag-with-histogram-visible E2E. **Caveat:** the perf contract in plan §9 (500 tasks × 25 resources × ~3 assignments/task × selected histogram) was not independently re-measured by the auditor; the changelog states E2E passed and lint/build clean. A pre-v1.4 perf re-measurement at 500-task scale should close this as a verification line item, not just a "tests passed" line. |
| **Print output** | 7.5 | 8 | +0.5 | Summary mode now carries cost. Title-bar pattern preserved. A3 deliverable can now show the owner where the money is, not just where the time is. Still no S-curve overlay on print — v1.6. |
| **Trust & defensibility** | 5 | 5.5 | +0.5 | Schema migration 1 → 2 unit-tested and additive; CSV round-trip tested; orphan-prune on load tested; resource-delete-with-assignments undo path E2E-covered. The data layer is honestly more trustworthy than it was a day ago. |

**Composite (equal-weight, 16 dimensions):** previous **4.4/10** → current **5.31/10**.
**Net change:** **+0.91** — almost entirely concentrated in two dimensions (resource management and cost management), exactly as the roadmap intended.

**Holistic verdict:** **5.5/10**. The +0.2 lift over the equal-weight mean reflects that resource management is a dimension with disproportionate weight on a "is this a construction PM tool?" question — moving it from 1 to 6.5 unlocks v1.4 / v1.5 / v1.6 in a way that no other +5.5 move on the scoresheet could.

**Against roadmap target:** roadmap §v1.3 named **3.6 → 5.0** as the target fitness. **Actual: 5.5.** Pass with margin.
**Against decision gate threshold:** the gate is *"if below 5.5/10, pause v1.4."* **Holistic: 5.5.** Marginal pass. Equal-weight 5.31 is below the threshold — see §9 for the resulting recommendation (conditional proceed, not blanket proceed).

---

## 3. What Changed Since Last Audit

### 3.1 What Shipped

**v1.3 — Resource Foundation (`v0.3.0`, 2026-05-23):**

Phase 0 — Pre-flight housekeeping (audit v2 carry-over closure):
- ESLint `.worktrees/**` ignore removed; orphan worktree confirmed absent.
- `docs/mobile-qa.md` converted from stub to structured QA log (physical-device pass still pending human run).
- `useMidnightTicker` regression test added (3 cases — cleanup on unmount, StrictMode double-invoke, single tick per midnight).
- `Task.deps[]` documented as derived-read-only with explicit JSDoc and CLAUDE.md note.

Phase A — Data model & schema migration:
- `Resource`, `ResourceCategory`, `ResourceAssignment` types in `src/types/index.ts`.
- `PERSISTED_SCHEMA_VERSION` bumped to 2.
- `storage.ts.migrateState` extended with additive 1 → 2 walk (empty arrays appended).
- 23 storage tests; migration fixture tested.

Phase B — Pure libraries:
- `src/lib/resources.ts` — validation, lookup-by-id, orphan-prune (5 tests).
- `src/lib/cost.ts` — per-task / per-group / project total cost (5 tests).
- `src/lib/resourceDemand.ts` — per-day demand rollup with over-allocation calculation; material linear distribution.

Phase C — Resource pool management UI:
- `ResourcesManager.tsx` CRUD modal mirroring `PartiesManager` shape with category segmented control (Labor / Equipment / Material).
- TopBar "Resources" button (Phosphor `Users` icon).
- Resource color auto-assigned from `GROUP_PALETTE`.

Phase D — Task assignment UI:
- `ResourceAssignmentSection.tsx` collapsible section in SidePanel.
- Multi-assignment per task with live cost preview per row.

Phase E — Cost surfacing:
- StatBar: project total cost (always shown), over-allocation count (conditional, danger color, clickable).
- TaskList: optional cost column behind FilterBar View menu (defaults off — density preserved).

Phase F — Resource histogram:
- `ResourceHistogram.tsx` rendered below Gantt body when toggled.
- `ResourceSelectorPill.tsx` — horizontally-scrolling resource chips with over-alloc red dot indicator.
- Shared timeline contract — no parallel time axis.
- Capacity line dashed, over-allocation overlaid in `--color-danger` 70% opacity.
- Hover tooltip with day / demand / capacity / over-by.

Phase G — Scroll sync extension:
- `useScrollSync` extended from pair (TaskList ↔ Gantt) to triple with histogram as third lane.
- Single `syncingScroll` ref reused — Key Design Decision #2 preserved.

Phase H — Manual leveling:
- Existing GanttBar drag triggers live histogram recompute via the `tasks` dep chain.
- H.3 predictive overlay correctly deferred — no scope creep into auto-leveling.

Phase I — CSV in/out:
- `parseResourcesCsv` / `generateResourcesCsv` / `parseAssignmentsCsv` / `generateAssignmentsCsv` in `csv.ts`.
- ResourcesManager footer import/export.
- `docs/resources-csv-format.md` format spec.
- Orphan reference pruning on import.

Phase J — Empty / loading / error states:
- ResourcesManager empty state.
- Two distinct histogram empty states (no resources defined vs no resource selected).
- Histogram loading bar reused from v1.2 thin 2px pattern for >500-task recompute.
- Quantity ≤ 0 inline validation.
- Resource-delete-while-assigned confirmation with drop-or-cancel.
- CSV import success toast (shared `ToastMessage` primitive extracted from `UndoToast`).

Phase K — E2E coverage:
- `tests/e2e/resources.spec.ts` — 4 specs (drag, CSV import, undo restore, over-alloc drag recompute).
- Fixture CSVs `tests/e2e/fixtures/resources.csv` and `assignments.csv`.
- `a11y.spec.ts` extended to include ResourcesManager modal — three unlabeled form controls (category select, capacity and cost-rate number inputs) fixed during sweep.

Phase L — Print & docs:
- PrintPreviewModal summary mode: per-task cost column + project total footer.
- `docs/design-system.md` updated with v1.3 tokens.
- `docs/onboarding-qa.md` updated.

Phase M — Release:
- `CHANGELOG.md` `0.3.0` entry.
- `package.json` / `package-lock.json` bumped to `0.3.0`.
- `README.md` resources feature mention.
- PR #11 squash-merged to `main`, tag `v0.3.0` moved to release commit `7284c3a`.

### 3.2 What Was Deferred or Removed

- **H.3 predictive over-allocation overlay** — explicitly deferred. Live recompute on drag landed; the "where would the histogram be if I drop here" hover-state machine was killed as borderline auto-leveling. Correct decision.
- **Marketing landing v2 pass with histogram screenshot** — explicitly noted as a "separate post-ship marketing pass, not in v1.3 ship scope" (Phase L.5). Still untouched. The current marketing landing predates resources entirely.
- **Onboarding hint for "create a resource first"** — deferred. No UI nag for resource-first flow; PMs find Resources via the TopBar.
- **Mobile real-device QA (HK-3 from v2)** — `docs/mobile-qa.md` upgraded from stub to structured log, but the actual physical iPhone/Android pass is still pending human execution. Marked as a blocker for any future mobile-touching change, but it shipped as "documented blocker" rather than "closed blocker."

### 3.3 What Broke or Regressed

Nothing the test suite flagged. All gates green at ship:
- `npm run lint` — clean
- `npm run type-check` — clean
- `npm run test:unit` — **173/173** (independently re-run by auditor 2026-05-23: green, 6.15s)
- `npm run build` — clean
- `npm run test:e2e` — **13/13**

One known minor: `playwright-report/index.html` is shown modified in the working tree post-merge — noise, excluded from any future commit per AGENT-HANDOFF.md.

### 3.4 What the Codebase Says vs. What the User Sees

No drift. The data model in `src/types/index.ts:114` correctly stamps `PERSISTED_SCHEMA_VERSION = 2`. The `PersistedState` interface carries `resources: Resource[]` and `assignments: ResourceAssignment[]`. The codebase and the UI agree.

One soft observation: `Task.deps[]` was documented as derived-read-only in this version (the audit v2 §10.1 recommendation). The JSDoc note is in place at `src/types/index.ts:20-22`. There is no lint rule enforcing the policy — so a future agent could still write to the field. For v1.3 this is fine; for v2.0 (when the data layer gets re-architected for cloud sync) a lint guard would be worth adding.

---

## 4. Praise (What Earns Respect)

1. **The histogram shares the existing `Timeline` object — exactly as audit v2 §10.1 recommended.** `ResourceHistogram.tsx` consumes `timeline: Timeline` as a prop and reads `timeline.days[i].offset` / `timeline.days[i].date` only. No parallel time axis. No double maintenance. When the PM zooms the Gantt via `Ctrl+Scroll`, the histogram zooms with it for free. This is the cheapest possible implementation of a hard requirement, and it survived a real ship cycle without anyone "optimizing" it into a parallel timeline.

2. **The undo stack expansion was reasoned, documented, and bounded.** Resource-delete-with-assignments was correctly identified as the kind of "big, recoverable operation" that the Decision #4 boundary covers, and it pushes a snapshot before the delete. The E2E spec (K.3) verifies the undo toast appears and restores both the resource and its assignments. This is the right shape: extend Decision #4 explicitly, document the extension, test the extension. Compare to the worst version of this change — pushing a snapshot on every assignment edit — which would have burned the 20-deep LIFO inside one session of editing. v1.3 did not do that.

3. **The CSV story did not bloat the task CSV.** Two paired CSVs — `resources.csv` and `assignments.csv` — landed alongside the unchanged task CSV. A v1.0/v1.1 task CSV file remains readable in v1.3. The orphan-prune-on-import handling treats assignment rows referencing missing tasks or resources as non-blocking warnings rather than a refusal to load. This matches the v1.1 §C3 decision on actual-date validation — non-blocking warnings, save proceeds. Internal consistency between two unrelated decisions one year apart is a sign that someone is paying attention.

4. **The axe sweep caught three unlabeled form controls during Phase K.4 and they were fixed before ship.** The category `<select>` and two number inputs in `ResourcesManager` had no associated labels. The CI a11y sweep flagged them; Phase K.4 added the labels in the same commit. This is the difference between a11y as a checklist and a11y as a build gate. Most products would have shipped v1.3 with three avoidable a11y bugs.

5. **The visual surface expanded by ~30% (histogram, selector pill, assignment section, two new StatBar fields, print cost column) and did not break the Swiss thesis.** The histogram bars use `--surface-sunken` background, resource colors from `GROUP_PALETTE`, capacity line dashed in `--histogram-capacity-line`, over-allocation in `--color-danger` 70% opacity. No new gradients. No new card patterns. The selector pill borrows the chip idiom from filter chips. The histogram lane has a 1px top border — the same hairline used between every other Gantt-adjacent surface. v1.2's pre-flight test ("would I notice it missing?") still applies — the histogram has a job, the empty states have jobs, the cost column is opt-in. Nothing is decorative.

6. **The pure libraries are pure.** `src/lib/resources.ts`, `cost.ts`, `resourceDemand.ts` — all are input → output, no React imports, no localStorage touches. Each has a unit test file. The cost rollup is `O(tasks × assignments_per_task)` with no nested-loop pathology. Demand rollup is `O(workdays_in_window × assignments_for_resource)` with a single `Map` for day-keyed accumulation. The roof-line stays well under the perf contract numbers in plan §9.

---

## 5. Shame (What Deserves Criticism)

1. **The histogram is single-resource only.** A PM watching the electrical crew and the mechanical crew compete for the same week of MEP rough-in cannot see both demand curves stacked. They must click between two pills and hold the comparison in their head. The roadmap's Checkpoint 1 scope question — *"is the resource histogram legible and actionable — or is it a chart that looks nice but doesn't drive decisions?"* — has a partial answer: it drives single-resource decisions; multi-trade trade-off decisions still require mental math. This is acceptable for v1.3 (the spec specified single-resource) but it is the first feature a PM will ask for on day 3 of using v1.3. **Flag for v1.5 (multi-baseline already touches the comparison-overlay UX — bundle it there).**

2. **No resource calendars.** A resource's availability is determined by the project's workweek and holidays only. There is no concept of "Crane #2 is on lease from 2026-08-01 to 2026-10-31" or "Foreman J. Diaz is on PTO weeks 22 and 36." Demand is calculated assuming the resource is always available. For institutional builds with rented equipment and rotating crews, this is a meaningful limitation. The roadmap pushes per-resource calendars to v1.8 (calendar & delay management), but the v1.3 audit cannot honestly score this any higher than 6.5/10 on resource management until that gap closes.

3. **No rate escalation, no time-phased rates, no overheads.** A carpenter rate of $85/hr is constant from project start to project finish. Real construction projects with 24+ month duration have annual escalation clauses (typical: 3–5% per year). Real cost loading also carries overhead/burden percentages on labor and markup on materials. v1.3 ships flat unit rates only. A PM doing a real cost-loaded schedule for a $50M hospital build cannot use this — they would still maintain cost loading in a separate workbook. **The roadmap addresses this in v1.6 (EVM + cash flow) but the cost dimension at v1.3 is honestly closer to "labor budget calculator" than "cost-loaded schedule."**

4. **Material consumption is linearly distributed across task duration.** `resourceDemand.ts:43` distributes a material assignment's total quantity evenly across the task's workdays (`materialPerWorkday = totalQuantity / totalWorkdays`). Real construction materials are not consumed linearly — concrete is delivered for a pour day, steel arrives at the start of erection, drywall sheets are stocked in tranches. The linear model is a sensible v1.3 approximation but it overstates cash flow smoothness and understates lumpy delivery scheduling. **This is fine for v1.3 (no cash flow chart yet exists to render the misrepresentation) but it will be visible the moment v1.6 ships the S-curve and PMs see straight-line material consumption that doesn't match their delivery schedule.**

5. **Mobile real-device QA is still owed.** The structured log in `docs/mobile-qa.md` was updated in Phase 0.2 but the actual physical-device pass is still pending. This is a repeated shame from audit v2 §5.4. The `ResourceAssignmentSection` adds expanding height to the SidePanel that the mobile bottom sheet renders. The E2E spec covers desktop Playwright Webkit; it does not cover a real iPhone touch drag at peek state with assignments expanded. **A 5-minute physical-device pass would close the chronic gap. The fact that it has not happened across three versions is a process problem, not a code problem.**

6. **The cost column on TaskList is opt-in but the project total in StatBar is always-on.** This creates a small mental dissonance: the PM sees `Cost $2,431,200` in the StatBar but if they haven't toggled the cost column on, they cannot see which task contributes which slice. The opt-in column was the right density call (per plan §6.6), but the discoverability is weak — a first-time PM seeing the total may not realize it's traceable to per-task numbers in the View menu. A 1-line tooltip on the StatBar cost stat ("Click to enable cost column") would close this in <30 minutes.

7. **No per-resource over-allocation count breakdown.** The StatBar shows `Over-alloc 2` (a count of distinct resources with at least one over-allocated day in the visible window). Clicking it opens the histogram on the first over-allocated resource. There is no way to see, at a glance, *which* two resources are over-allocated or which weeks they overlap. The single-line counter answers "is there a problem?" but not "where is the problem?" — and the latter is the actual PM question on a Tuesday morning.

---

## 6. Checkpoint-Specific Questions

These are the questions the roadmap names for Checkpoint 1.

**Q1: Does the resource model match how construction PMs actually think about labor, equipment, and materials?**

**A:** Mostly yes, with three real gaps. The three-category split (labor / equipment / material) is the standard construction taxonomy and the v1.3 implementation honors the meaningful difference between them: labor and equipment have capacity (units/workday) and accrue cost over duration; materials have no capacity and accrue cost as a one-time consumption. That is correct.

Where the model diverges from how PMs actually think:
- **No crew composition.** A "carpenter crew" in the real world is 1 foreman + 4 carpenters + 1 helper. v1.3 treats this as one resource (qty=6, single rate) which masks the rate differential and the skill mix.
- **No skill levels within a resource.** "Electrician" in v1.3 is a single resource; in the real world it splits into apprentice / journeyman / master with different rates.
- **No calendar-bound availability.** A resource is treated as always-available subject to project workweek. Real construction resources have rental periods, vacation schedules, and rotation patterns.

These gaps do not invalidate v1.3 — they are roadmap items at v1.7 (WBS depth could surface crew composition) and v1.8 (calendars). But a PM evaluating v1.3 against P6 would say "I can model the simple case but not my actual crew mix."

**Q2: Is the resource histogram legible and actionable — or is it a chart that looks nice but doesn't drive decisions?**

**A:** Legible: yes. Actionable: partially.

Legible — bars are positioned on the shared Gantt timeline, capacity is a dashed line with a label, over-allocation is rendered in `--color-danger` above the capacity line, the hover tooltip names the day and the over-by amount. A PM scanning the chart can see at a glance "weeks 12–14 are red on the electrical crew." That part is good.

Actionable — partially. The PM can drag a task within its float and watch the histogram update. That is real manual leveling. But:
- The PM cannot see two resources stacked (the most common real question is "if I delay the electrical work, does the mechanical crew still fit?").
- There is no "click the red bar to see the contributing tasks." The PM has to mentally identify which tasks overlap the red days, then drag them one at a time.
- There is no predictive overlay during drag (correctly deferred per Phase H.3).

The histogram drives decisions at the single-resource level. It does not yet drive cross-resource trade-off decisions. **Score: 6/10 on actionability.**

**Q3: Has the instrument feel been preserved, or has the resource UI added chrome that breaks the Swiss discipline?**

**A:** Preserved. The histogram lane, selector pill row, assignment section, two new StatBar fields, and print cost column all pass the v1.2 pre-flight test:
- "Would another product look identical if I swapped the wordmark?" — No. The dashed capacity line label uses Space Mono. The selector pill chip pattern matches the filter chips. The histogram bars are a flat fill, not gradient.
- "Does this gesture appear in three or more shadcn templates?" — No. The histogram-below-Gantt with shared time axis is a custom shape; the segmented category control on ResourcesManager is a generic pattern but used sparingly.
- "Does it have a job, or is it decorative?" — Every new surface has a job.
- "Would I notice it missing?" — The histogram lane: yes. The over-alloc red dot on chips: yes. The cost column footer on print: yes.

One soft concern: the StatBar is now carrying five conditional stats (task count, complete, critical, variance, over-alloc) plus a permanent project cost. At 1280px width with all five conditional stats active, the bar approaches saturation. v1.5 (multi-baseline) and v1.6 (S-curve / EVM) will each want StatBar real estate. **The StatBar's density budget is now ~70% used at the worst case.** Plan v1.4 should account for this.

**Q4: Are there resource features we missed that PMs expect (skill levels, crew composition, shift patterns)?**

**A:** Yes, three:
- **Skill levels within a resource type** (apprentice/journeyman/master for electricians; operator/oiler for equipment). Adds rate granularity and crew planning realism.
- **Crew composition templates** — "a standard carpentry crew is 1+4+1 at these rates" as a reusable assignment template. Materially speeds up large-schedule assignment entry.
- **Shift patterns** — day shift vs night shift vs swing shift, with shift differentials in rate. Hospital / civil work routinely runs night shifts for occupied-building or traffic-impact reasons.

None of these are blocking. All three could reasonably defer to v1.5 (multi-baseline overlap region) or be folded into v1.8 (calendars include shift patterns). **Flag for plan-v1.4 §future-considerations as candidates for v1.5 or v1.8.**

**Q5: Is the cost-loading model realistic for the firm's actual estimating workflow?**

**A:** Partially. The model captures:
- Per-resource unit rate
- Labor/equipment cost = qty × workdays × rate
- Material cost = qty × rate (one-time)
- Per-task rollup, per-group rollup, project total
- USD currency (hardcoded with `// TODO: i18n` flag)

The model does not capture:
- **Rate escalation** — flat rate for project lifetime, no annual or quarterly bumps.
- **Time-phased rates** — no "rate is $85/hr through Q2, then $90/hr from Q3."
- **Overhead and burden** — no labor burden percentage (typically 25–40% on top of direct labor).
- **Markup** — no markup on materials, no fee on subcontractor pass-through.
- **Cash flow distribution** — cost is a static rollup; there is no month-by-month spend forecast.

For a PM doing the daily working schedule, v1.3's cost model is **enough to spot which task is expensive and to see project total move when assignments change**. For a PM doing formal cost-loaded scheduling against an owner's budget, v1.3 is **not yet enough** — the PM would still maintain a parallel cost-loaded workbook for the formal submission. **Score: 4/10 on realism for estimating workflow. Acceptable for v1.3, expected to close in v1.6.**

---

## 7. Instrument Feel Assessment

| Criterion | Pass / Fail | Notes |
|---|---|---|
| **Swiss visual discipline maintained?** | ✅ Pass | No gradients added, no card spam, no AI tells. Histogram and selector pill respect surface ladder. |
| **Keyboard-first operation preserved?** | ✅ Pass | ResourcesManager modal uses `useDialogA11y`; Tab/Shift+Tab/Escape contract honored. Resource selector pill is focusable. |
| **Print output still production-grade?** | ✅ Pass | A3 summary mode now carries cost column and project total footer. Title-bar pattern preserved. |
| **Performance target met?** | ✅ Pass | E2E 13/13 green, unit 173/173, no perceptible drag lag in E2E with histogram visible. **Caveat:** the 500-task × 25-resource × 3-assignments perf measurement from plan §12.5 was not independently re-run by the auditor. Recommend a one-time perf re-measurement before v1.4 phase work begins. |
| **No hardcoded hex in components?** | ✅ Pass (with the v1.2 documented carve-outs for brand navy and print paper). |
| **Dense, not decorated?** | ✅ Pass | StatBar density budget at ~70% in worst case (see Q3); flagged for v1.4 planning. |
| **Feels like a tool, not a toy?** | ✅ Pass | The 20-year tradesperson superintendent test: a PM looking at a histogram with red over-allocation bars on the same time axis as the Gantt sees an engineering tool, not a SaaS dashboard. |

**Instrument feel verdict:** **Strong, holding.** v1.3 was the most dangerous version yet for instrument feel (largest UI surface expansion since v1.0). It held the line. The risk for v1.4 (schedule quality engine) is the opposite — DCMA scores, health badges, and pass/fail indicators are exactly the surface where "dashboard" creep is easiest. Plan v1.4 must carry the same de-vibecoded pre-flight test forward.

---

## 8. Comparison to Prior Audits

### 8.1 Score Trend

```
v1 audit  (post-v1.0):  3.6/10 (holistic) / 3.7/10 (equal-weight, 15-dim)
v2 audit  (post-v1.2):  4.5/10 (holistic) / 4.4/10 (equal-weight, 16-dim, +trust dim)
v3 audit  (post-v1.3):  5.5/10 (holistic) / 5.3/10 (equal-weight, 16-dim)  ← THIS AUDIT (Checkpoint 1)
v4 audit  (post-v1.5):  pending  (Checkpoint 2)
v5 audit  (post-v1.8):  pending  (Checkpoint 3)
v6 audit  (post-v2.0):  pending  (Checkpoint 4)
v7 audit  (post-v2.2):  pending  (Checkpoint 5 — Final)
```

### 8.2 Repeated Praise (Three audits running — these are the chronic strengths)

1. **Architectural discipline.** State centralized in `App.tsx`, pure `lib/*` modules, dumb components. v1.3 added three new pure libs (`resources.ts`, `cost.ts`, `resourceDemand.ts`) without touching the architectural shape.
2. **Critical path implementation.** Real Kahn + forward/backward pass with FS/SS/FF/SF + lag.
3. **Print-first mentality.** A3 print canvas treated as first-class. v1.3 extended it with cost — preserved the discipline.
4. **Visual restraint.** Three audits in a row. v1.3 added the largest visual surface since v1.0 and the praise still lands.

### 8.3 Repeated Shame (Chronic gaps across multiple audits)

1. ~~**No resources.**~~ ✅ **Closed in v1.3.** Three audits running, finally resolved.
2. **No schedule quality engine.** v1.4 territory. **Now the top remaining chronic gap.**
3. **No collaboration / cloud sync.** v2.0. Still chronic.
4. **Mobile real-device QA is owed.** Two audits running (v2, v3). The structured log in `docs/mobile-qa.md` is current but the physical-device pass has not happened. **This is a process problem, not a code problem.** Flag for v1.4 Phase 0 — close it before any new mobile surface lands.

### 8.4 Resolved Items

1. ✅ **No resources** — v1.3 ships the foundation. The longest-running shame in the audit history is closed.
2. ✅ **Schema migration trust floor** — 1 → 2 migration shipped cleanly, additively, unit-tested. The migration walk infrastructure (now versioned across v0→v1→v2) gives v1.4 / v1.5 / v1.6 free additive-migration capacity.
3. ✅ **`useMidnightTicker` regression test** — v2 audit §5.6 carry-over closed in Phase 0.3.
4. ✅ **Orphan worktree `.worktrees/phases-3-6`** — v2 audit §5.3 / HK-1 carry-over closed in Phase 0.1.
5. ✅ **`Task.deps[]` policy documentation** — v2 audit §10.1 closed in Phase 0.5 with JSDoc and CLAUDE.md note.
6. ◐ **Marketing landing v2 pass with histogram screenshot** — still untouched. Explicitly deferred as a post-ship marketing pass. **Now flag-worthy:** v1.3 is the first version with a screenshot worth marketing.
7. ◐ **Mobile real-device QA** — log updated, physical pass still owed.

---

## 9. Decision Gate

**Checkpoint question (from `pm-roadmap.md`):** *"If the audit scores below 5.5/10, pause v1.4 development and fix the resource foundation. If it scores 5.5+, proceed to v1.4."*

**Your answer:** **Conditional Pass.**

**Score threshold:** 5.5/10.
**Holistic score:** **5.5/10.** Meets threshold.
**Equal-weight score:** **5.3/10.** Below threshold by 0.2.

The two scores disagree because the equal-weight average distributes credit across 16 dimensions equally, while the holistic verdict assigns greater weight to the dimension that the version was explicitly built to address (resource management). Both are defensible reads.

**Recommendation: proceed to v1.4 with three conditions attached, not blanket proceed.**

The three conditions are not blockers — they are explicit close-outs that should be done in v1.4 Phase 0 before any v1.4 capability work starts:

1. **Mobile real-device QA pass.** Two audits running with this owed. Close it. Five minutes of physical iPhone + Android touch testing on the bottom sheet with `ResourceAssignmentSection` expanded. Log the result in `docs/mobile-qa.md`.
2. **Perf re-measurement at 500-task × 25-resource scale** per plan v1.3 §12.5. The targets were named, the E2E gates passed, but the explicit `performance.now()` measurement against the perf contract was not independently recorded. A 30-minute run-and-log closes this.
3. **StatBar density audit.** Document the worst-case StatBar layout at 1280px with all five conditional stats active. If density is >70%, plan v1.4 should allocate a StatBar redesign phase before adding the schedule health score.

If all three close in v1.4 Phase 0, the conditional pass becomes a clean pass and Checkpoint 2 (after v1.5) inherits a clean baseline.

If any of the three slips further, escalate to a manual decision before v1.4 capability phases start.

---

## 10. Recommendations for Next Version (v1.4 — Schedule Quality Engine)

### 10.1 Must Fix (Blocking — close in v1.4 Phase 0, before any v1.4 capability work)

- **Mobile real-device QA.** Close `docs/mobile-qa.md` checklist with at least one physical iPhone (≤375px) and one physical Android (≤360px) touch-pass. Verify: bottom sheet peek/full transitions, `ResourceAssignmentSection` collapse/expand inside sheet, scroll behavior with assignments visible.
- **Perf re-measurement at v1.3 scale.** Run plan-v1.3 §12.5 measurement (500 tasks × 25 resources × ~3 assignments × histogram on) and log results. Compare to the §9 targets. If any target misses by >10%, fix in v1.4 Phase 0 before adding DCMA load on top.
- **StatBar density audit.** Snapshot the worst-case StatBar at 1280px width with all conditional stats active. If density exceeds ~70%, plan a StatBar restructure in v1.4 before adding the schedule health score.

### 10.2 Should Fix (High Priority — close in v1.4 if reasonably possible)

- **Histogram drill-down: "click a red bar to see contributing tasks."** Closes the actionability gap from §6 Q2. Estimated effort: small — the bar already knows the day; the task list can be filtered to overlapping tasks via existing filter mechanics.
- **StatBar over-alloc tooltip naming the affected resources.** Adds "which" to the current "is there a problem?" answer. Estimated effort: very small — the count already exists; add a `title=` attribute listing resource names.
- **Marketing landing v2 pass.** First version with screenshot-worthy capability. Estimated effort: medium — replaces hero and capabilities sections with resource-histogram and cost-rollup screenshots.

### 10.3 Nice to Have (Low Priority — defer if v1.4 schedule pressures)

- **Cost StatBar tooltip indicating cost column is toggleable.** Closes the §5.6 discoverability gap. Effort: trivial.
- **Lint rule preventing direct writes to `Task.deps[]`.** Closes the §3.4 policy enforcement gap. Effort: small (custom ESLint rule).
- **`@types/i18n` placeholder for the hardcoded `$` currency.** Closes the `// TODO: i18n` in StatBar formatting. Effort: small, deferred until v2.1 portfolio (where multi-currency matters).

### 10.4 Scope Creep Warning

v1.4 is the schedule quality engine. The seductive trap is bundling resource-quality checks (resource over-allocation as a DCMA finding, resource calendar gaps as a quality flag) with v1.4. **Do not.** Resource quality scoring is correctly v1.5 / v1.6 territory once multi-baseline and EVM provide the comparison surface.

Specifically, v1.4 must not pick up:
- **Resource leveling automation.** Still v1.5 / v2.x.
- **Cost-loaded health scoring.** Cost is in scope for the quality engine only insofar as cost-loaded tasks contribute to BEI (Baseline Execution Index) — but the BEI math is the v1.4 deliverable, not a cost report. Save the cost report for v1.6.
- **S-curve or EVM previews.** "While we're calculating planned vs. actual progress for BEI…" — no. The S-curve renders that data, the BEI scores it. They are different deliverables. Ship BEI as a number in v1.4; render it as a curve in v1.6.
- **Cross-resource histogram overlay.** It is the most-requested missing feature from v1.3 (see §5.1), but it belongs in v1.5 (the version that introduces comparison views via multi-baseline).
- **Multi-baseline schema work "while we're touching persistence."** v1.4 introduces no schema change — health scores are derived, not persisted. Keep schema version at 2 through v1.4.

---

## 11. Final Verdict

The resource organ landed. It works. A construction PM opening v1.3 cold can define a labor resource, assign it to a task, watch the cost roll up into the StatBar, toggle the histogram on, see over-allocation in red above the capacity line, drag a task within its float, and watch the histogram heal. That sentence was not true two days ago. It is now. The roadmap's first checkpoint passes, marginally — equal-weight 5.3, holistic 5.5 — and the construction-PM fitness needle moves for the first time since v1.0.

What v1.3 does *not* yet do is also clear: no resource calendars, no rate escalation, no crew composition, no multi-resource overlay, no cash flow distribution, no health scoring. Each of those is correctly assigned to a later version on the roadmap and the v1.3 plan's forbidden list held under the pressure of "while we're touching this, can we just…" That discipline is what makes v1.4 / v1.5 / v1.6 buildable. If v1.3 had bundled a half-baked DCMA pass or a stub S-curve, the next two versions would be cleanup. Instead, they get to add capability on a clean foundation.

**One-line summary:** The product now has a real organ for the first time, the foundation under it is honest, and v1.4 should proceed — but only after Phase 0 closes the mobile-QA, perf, and StatBar-density loose ends that two audits in a row have flagged.

---

## Filing Instructions (executed on save)

1. ✅ Saved as `.claude/pm-audit-v3.md`.
2. ✅ Score trend table (§8.1) updated.
3. ◐ `version-status.md` update pending: mark Checkpoint 1 as ✅ (conditional pass), link this audit in the PM Audit Index, update Current Focus to "v1.4 planning — Phase 0 close-outs from pm-audit-v3 §9 required before capability work."
4. ◐ Roadmap (`pm-roadmap.md`) version summary table — update v1.3 actual fitness to 5.5/10 (target was 5.0).
5. ◐ Forward §10.1 must-fix items to plan-v1.4.md Phase 0 once Claude authors the next plan.
6. ◐ Update `.claude/AGENT-HANDOFF.md` — next action: Claude authors `plan-v1.4.md` incorporating the three Phase 0 must-fix items from this audit.
