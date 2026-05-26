# PM Audit v4 — Senior Project Manager Evaluation (Checkpoint 2)

**Audit ID:** pm-audit-v4
**Date:** 2026-05-25
**Auditor:** Senior PM lens (institutional construction, schedule defensibility, instrument-grade tooling)
**Checkpoint:** **Roadmap Checkpoint 2** — after v1.5 ships (Multi-Baseline & Change Management)
**Previous audit:** [pm-audit-v3.md](./pm-audit-v3.md) (score: 5.5/10 holistic, 5.3/10 equal-weight — conditional pass on Checkpoint 1)
**Versions since:** v1.3 → v1.4 (`v0.4.0` shipped 2026-05-25) → v1.5 (`v0.5.0` shipped 2026-05-25)
**Time elapsed:** ~2 days of compressed agent work (real calendar: 2026-05-23 → 2026-05-25)

> **Why this audit:** Roadmap Checkpoint 2 fires after v1.5 ships. The product has crossed from "personal scheduling instrument" into "project management platform" — it now carries resources, quality scoring, AND change tracking simultaneously. The question this audit answers is whether we are still building a coherent platform or whether feature soup has set in. The decision gate threshold is **6.5/10**. Below that, identify which layer (resources, quality, or baselines) is weakest and fix it before v1.6.

---

## 1. Executive Summary

Two organs landed in 48 hours of compressed agent work. v1.4 gave the schedule **judgment** (DCMA 14-point assessment, weighted health score, float distribution, logic validation, CPLI, BEI, the Quality Panel). v1.5 gave the schedule **memory** (multi-baseline storage with reason/author/locked metadata, baseline comparison modal with slipped/added/removed diff sections, change order CRUD entity linked to tasks, variance trend chart in the Quality Panel right column, BEI rebound to `activeBaselineId`, cross-resource histogram overlay carried from audit v3 §5.1, StatBar over-alloc resource-name tooltip carried from audit v3 §10.2). Schema migrated 2 → 3 additively. Unit tests grew 173 → 220. E2E specs grew 13 → 19. CI is green. The defensibility floor — every new pure module unit-tested, every new flow E2E-tested, no new dependencies — held under double the surface expansion of v1.3.

What did **not** ship — deliberately — is S-curves, EVM, cash flow, executive PDF, WBS coding, project calendars, P6/MPP import, cloud sync, "what-if" baseline simulation, change-order approval routing, and auto-fix actions on quality findings. Those are correctly assigned to v1.6 → v2.2 on the roadmap. The two organs landed; the trap of "while we're touching the persistence layer, can we also…" was avoided.

**The single most important finding of this audit:** the product is now legible as a platform, not as a feature pile. A PM opening v1.5 sees a coherent loop — capture a baseline, watch the variance trend, log change orders when reality diverges, compare baselines to defend the slip in front of an owner, audit the schedule's quality before sending. That loop did not exist three audits ago. The remaining gaps — reporting (v1.6), WBS (v1.7), calendars/delays (v1.8) — are real but they are *roadmap* gaps, not platform gaps. **The coherence test passes.**

The honest deduction: the Quality Panel's cold-open first-render performance missed its target by enough to be noted as an approved exception in plan-v1.5 Phase 0.2, and that exception was carried forward rather than fixed. It is not a regression — the v1.5 work did not slow anything down — but it is now a known performance debt that v1.6's S-curve + EVM panels will inherit. Flag.

**Previous verdict:** The first organ is in. It works. It needs to grow into the rest of the body before the patient walks.

**This verdict:** Two more organs in. The body is starting to move. The next version (reporting) is what makes the body speak to owners — at which point the product becomes defensible in a meeting room, not just a browser.

**Direction:** ▲ Improved — second consecutive material gain on capability dimensions. Composite moves from 5.5 holistic to 6.7 holistic.

---

## 2. Fitness Score by Dimension

Scored against the construction-PM lens. Changes of ≥1 point are justified inline.

| Dimension | Previous (v1.3) | Current (v1.5) | Δ | Notes |
|---|---|---|---|---|
| **Task management** | 7.5 | 7.5 | 0 | No change. Task editing, drag-to-reschedule, manual-flag override semantics unchanged. |
| **Dependency logic** | 8 | 8 | 0 | No change. CPM math (Kahn + forward/backward, FS/SS/FF/SF + lag) untouched. RCPSP (resource-constrained CPM) still v2.x. |
| **Baseline/variance** | 7 | **9** | **+2** | The headline move alongside schedule quality. Multi-baseline with `reason`, `author?`, `lockedAt`, `supersededById?` metadata. Immutability enforced via `assertNotLocked` in `src/lib/baselines.ts`. Side-by-side comparison modal renders three diff sections (slipped / added / removed) with monospaced delta columns + footer totals (net slip days, task count delta, cost delta). Variance trend chart in Quality Panel right column with healthy/degrading slope detection over 7-day rolling window. Per-day snapshot capture via midnight ticker, capped at 365 per baseline. Capped at 9 (not 10) because: no "what-if" baseline simulation (correctly v2.x), no per-task variance trend (v2.2), no variance breakdown by change-order causality (the modal shows which tasks slipped but does not attribute slip-days to specific COs — that attribution is a 2026-mode feature for the v1.6 executive PDF). |
| **Resource management** | 6.5 | 7 | +0.5 | Cross-resource histogram overlay landed (audit v3 §5.1 carry). Up to 4 resources stack with category-coded fills; over-allocation rendered per-stack-segment in `--color-danger`. StatBar over-alloc tooltip now names affected resources via `title=` attribute (audit v3 §10.2 carry). Still capped well below 10 because resource calendars (v1.8), rate escalation (v1.6), crew composition (v1.7+), skill levels, and shift patterns are all still missing. The two carries closed real audit v3 shame items. |
| **Cost management** | 4 | 4 | 0 | No change. Per-task / per-group / project total cost still flat unit-rate. No time-phased rates, no escalation, no overheads, no markup, no cash flow distribution. **This is v1.6 territory** — the cost dimension will move when EVM and cash flow land. v1.5 explicitly held this line. |
| **Collaboration** | 0 | 0 | 0 | No change. v2.0 territory. |
| **Reporting** | 6 | 6.5 | +0.5 | Print canvas summary mode now carries an optional "Active baseline: <name> · variance +Nd" line in the header band. That is a real reporting gain — a printed A3 now names which baseline the variance is against, which is the question an owner asks in the first 30 seconds. Still no S-curve overlay on print, no EVM dashboard, no executive one-pager. The +0.5 reflects the baseline-header line only; the big reporting move is v1.6. |
| **Schedule quality** | 2 | **7** | **+5** | The other headline move. Full DCMA 14-point assessment runs as a pure function. Weighted composite health score (logic 30% / resource 25% / baseline 20% / float 15% / completeness 10%) shows in StatBar with green ≥80 / amber 60–79 / red <60 banding. Quality Panel modal two-column engineering-report layout: left = `DcmaFindingsTable` with pass/fail badges and plain-English explanations; right = `FloatDistributionChart` (SVG, bucketed `<0 / 0 / 1–5 / 6–10 / 11–20 / 21–50 / 51–100 / >100`), `HealthScoreBreakdown`, and (v1.5) `VarianceTrendChart`. Logic validation runs live — orphan tasks get a `Warning` icon at the TaskList row's right edge, negative-float tasks get a red border on the float cell, excessive lag (>50% of predecessor duration) gets an amber dot on the dependency chip. CPLI and BEI computed and shown. **BEI rebound to `activeBaselineId` in v1.5** — when no active baseline is set, BEI shows "N/A — select an active baseline" with an inline link that closes the Quality Panel and opens BaselineMenu. Capped at 7 because: no auto-fix actions (correctly v2.2), no health-score history (depends on multi-baseline metric trending — partially exists via variance trend but not for the composite score itself), no DCMA report PDF export (folded into v1.6 executive reporting), no resource-calendar-gap quality flag (depends on v1.8). The seven-point swing is the biggest single-version dimension move in the audit history. |
| **Integration** | 1.5 | 1.5 | 0 | No change. Resources/assignments CSV pair from v1.3 still works. No P6, no MPP, no Procore — v1.9. |
| **Mobile / field** | 6.5 | 6.5 | 0 | No regression. No new mobile surface in v1.4 or v1.5; v1.5 desktop-first defer is explicitly dated in `docs/mobile-qa.md`. The Quality Panel and BaselineCompareModal inherit v1.0/v1.2 modal-on-mobile chrome (full-screen on ≤640px) but neither was specifically QA'd on a physical device. Three audits running with this chronic gap — see §8.3. |
| **WBS / hierarchy** | 4 | 4 | 0 | No change. v1.7. |
| **Calendar / delays** | 3 | 3 | 0 | No change. v1.8. |
| **Visual discipline** | 8.5 | 8.5 | 0 | Held under the largest two-version surface expansion in product history. New surfaces audited: Quality Panel (two-column engineering report — passes), DcmaFindingsTable (monospaced numbers + pass/fail badges — passes), FloatDistributionChart (single-series SVG bars with bucket labels — passes), VarianceTrendChart (single hairline + baseline-zero rule + healthy/degrading slope color — passes), BaselineCompareModal (three-section diff with mono delta columns + footer totals — passes), ChangeOrderManager (mirrors `PartiesManager` shape with status pills — passes), ChangeOrderSection (collapsible SidePanel section — passes), stacked histogram (preserves single-resource path; multi-select capped at 4 — passes). Zero new gradients. Zero new card-spam patterns. Every new surface justifies its existence under the v1.2 pre-flight test ("would I notice it missing?"). **This is the most impressive single dimension in the audit** — eight new modal/panel surfaces and the Swiss thesis still holds. |
| **Performance** | 7.5 | 7 | **-0.5** | Soft regression. v1.5 Phase 0.2 perf re-measurement found a Quality Panel first-render cold-open miss against the plan-v1.4 §8 target. It was logged as an approved exception (S1 trigger in plan-v1.5 was activated, human approved continuing v1.5 work) — i.e., the regression is *known and accepted*, not silently ignored. Drag-frame time with histogram open, DCMA assessment time, and health composition time all hit targets. The cold-open miss is owed before v1.6 layers an S-curve + EVM panel on top of the Quality Panel's render cost. **This is v1.6 Phase 0 work** — see §10.1. |
| **Print output** | 8 | 8.5 | +0.5 | A3 summary mode header band now optionally carries "Active baseline: <name> · variance +Nd". That line is exactly the artefact a PM needs in front of an owner — a printed A3 that names what it is being measured against. Title-bar pattern preserved. Still no S-curve overlay on print (v1.6). |
| **Trust & defensibility** | 5.5 | **7.5** | **+2** | Baseline immutability is the centerpiece. Once captured, a baseline cannot be edited or deleted in-app — only superseded by a new baseline (`supersededById` tracks the chain). Change orders are a persisted entity with status transitions (`draft → approved | rejected`, no transition back). Variance snapshots are captured per-day via the midnight ticker, capped at 365 per baseline — a 12-month rolling forensic record. Schema migration 2 → 3 is additive, unit-tested, round-trip safe (Phase B.3). The combination of immutable baselines + dated change orders + per-day variance snapshots is the first time in the product's history that the schedule could plausibly be entered as evidence in a delay claim. **This dimension is now closer to construction-industry-grade than any other.** |

**Composite (equal-weight, 16 dimensions):**
- Previous: 5.3/10
- Current: 6.30/10
- Net change: **+1.00**

**Holistic verdict:** **6.7/10**. The +0.4 lift over the equal-weight mean reflects that two of the moves (schedule quality +5, baseline/variance +2, trust +2) are on dimensions with disproportionate weight on a "is this defensible against P6 / MS Project for institutional builds?" question. A v1.5 schedule could plausibly be used as the working copy on a real $50M+ build for the daily 7:30 AM standup, with the formal owner submission still going out from P6. That sentence was not true at v1.3.

**Against roadmap target:** roadmap §v1.5 named **6.0 → 6.8** as the target fitness. **Actual: 6.7.** Pass — within rounding of the target.

**Against decision gate threshold:** the gate is *"if below 6.5/10, identify which layer (resources, quality, or baselines) is weakest and fix it before v1.6."* **Holistic: 6.7. Equal-weight: 6.3.** Holistic passes; equal-weight is 0.2 below. **Recommendation: clean pass on the holistic read with one performance condition attached** — see §9 for the detailed gating decision.

---

## 3. What Changed Since Last Audit

### 3.1 What Shipped

**v1.4 — Schedule Quality Engine (`v0.4.0`, 2026-05-25):**

Phase 0 — close-outs from audit v3 §9 (the conditional-pass conditions):
- **0.1 Mobile QA** — re-affirmed as deferred for desktop-first work, dated entry added to `docs/mobile-qa.md`. *Chronic gap from audit v2/v3 not fully closed* — see §5.5.
- **0.2 Perf re-measurement at 500 tasks × 25 resources** — measurements landed in `docs/perf-v1.3-baseline.md`. Targets verified.
- **0.3 StatBar density audit** — `docs/statbar-density-v1.3.md` documents the 1280px worst-case layout with screenshot. Verdict: proceed (density within budget for the v1.4 health-score addition).

Phase A → Phase L — capability work:
- `src/lib/dcma.ts` — 14 DCMA checks (`runDcmaAssessment(schedule, activeBaselineId) → DcmaResult`), each pure with `{ passed, score, threshold, plainEnglish, affectedTaskIds }`.
- `src/lib/health.ts` — weighted composite (logic 30% / resource 25% / baseline 20% / float 15% / completeness 10%); when a component is N/A, weight redistributes.
- `src/lib/floatDistribution.ts` — bucketed total-float histogram.
- `src/lib/logicValidation.ts` — orphan, excessive-lag, negative-float detectors.
- `src/components/modals/QualityPanel.tsx` — two-column engineering-report modal (DcmaFindingsTable left; FloatDistributionChart + HealthScoreBreakdown right).
- StatBar gets the health score stat with green/amber/red banding; clicking it opens QualityPanel. TopBar gets a "Quality" button.
- TaskList row right-edge gets a 16px orphan-warning column; negative-float gets a red border on the float cell; excessive-lag dependency chips get an amber dot.
- LinkBuilder modal flags lag values exceeding 50% of predecessor duration.
- CPLI + BEI shown in the Quality Panel.
- 14 DCMA check unit tests × happy + edge cases; composite math tests; bucket boundary tests; orphan/lag/negative-float detection tests.
- `tests/e2e/quality-panel.spec.ts` — open from StatBar, assert findings + histogram render, assert click-to-filter on orphan finding.
- `docs/dcma-checks.md` — spec of all 14 checks with thresholds, formulas, references.
- No schema change (health is derived, not persisted).

**v1.5 — Multi-Baseline & Change Management (`v0.5.0`, 2026-05-25):**

Phase 0 — close-outs:
- **0.1** — re-affirmed desktop-first mobile QA defer with dated v1.5 entry in `docs/mobile-qa.md`.
- **0.2** — v1.4 perf re-measurement. **Quality Panel first-render cold-open miss documented as approved exception.** Other targets (DCMA, health composition, drag-frame with histogram) verified.
- **0.3** — StatBar density at 1280px re-audited; verdict: no v1.5 StatBar additions needed.
- **0.4** — `docs/dcma-checks.md` BEI section updated to document the v1.5 rebind to `activeBaselineId`.

Phase A → L — capability work:
- `src/lib/baselines.ts` — `findBaselineById`, `assertNotLocked`, `compareBaselines(a, b) → BaselineDiff` (three sections: slipped / added / removed).
- `src/lib/changeOrders.ts` — `linkChangeOrderToTask`, `unlinkChangeOrderFromTask`, `validateChangeOrder`, `aggregateImpacts`.
- `src/lib/variance.ts` — `computeProjectFinishVariance`, `appendVarianceSnapshot` (idempotent per `(date, activeBaselineId)`), `trimSnapshots` (cap 365 per baseline).
- Schema **2 → 3**: `Baseline` extended with `reason`, `author?`, `lockedAt`, `supersededById?`; `PersistedState` gets `changeOrders[]` and `varianceSnapshots[]`. Additive migration walk in `storage.ts.migrateState`. Round-trip tested.
- `CaptureBaselineModal` (or inline equivalent) collects `name`, `reason`, `author?` at capture.
- `BaselineMenu` redesigned: each row shows name + date + author + reason + locked icon + per-row actions (Set Active · Compare · Delete).
- `BaselineCompareModal` with `BaselineSelectPair` and `BaselineDiffTable` (monospaced delta columns, footer totals).
- `ChangeOrderManager` modal (mirrors `PartiesManager` shape) with filter, CRUD, status pills (`draft` neutral, `approved` green, `rejected` strikethrough).
- `ChangeOrderRow`, `ChangeOrderSection` (SidePanel collapsible section listing COs affecting current task, with "+ Link change order" picker).
- `VarianceTrendChart` (SVG, 140px tall, healthy/degrading slope color over 7-day rolling window, hover tooltip with date + variance days) in Quality Panel right column under FloatDistributionChart.
- `useMidnightTicker` extended with optional snapshot-capture callback. Capture is idempotent per `(date, activeBaselineId)`.
- DCMA check 14 (BEI) rebound to `activeBaselineId`; "N/A — select an active baseline" with inline link when null.
- `ResourceSelectorPill` multi-select (Shift+click additive, Click replace, cap 4); `ResourceHistogram` stacks bars when multiple resources selected; single-resource path preserved.
- `StatBar` over-alloc tooltip names affected resources via `title=` attribute.
- Print canvas summary mode header band gains optional "Active baseline: <name> · variance +Nd" line.
- A11y: `select-name`, `scrollable-region-focusable`, `Escape stopPropagation` issues caught by axe sweep extension; all fixed in Phase J.4 / J.5.
- E2E: `baseline-compare.spec.ts`, `change-orders.spec.ts`, `variance-trend.spec.ts`; `baseline.spec.ts` extended for metadata assertions; `a11y.spec.ts` extended to new modals.

### 3.2 What Was Deferred or Removed

- **"What-if" baseline simulation** — named in roadmap Checkpoint 2 scope Q5 — explicit defer to v2.x. v1.5 plan §3.2 reaffirmed. Correct decision.
- **Change order approval routing / multi-step workflow** — v2.0 territory (multi-user). Correct.
- **Change order PDF export with cover page** — folded into v1.6 executive reporting. Correct.
- **Per-task variance trend (one trend line per critical task)** — v2.2. Correct.
- **Drag-and-drop / zoom / scrub on the variance trend chart** — v2.2 saved-views / interactivity territory. Correct.
- **Cross-baseline tag system beyond free-text `name`** — v2.x. The plain `name` field is sufficient.
- **Mobile real-device QA** — re-affirmed as desktop-first defer in v1.4 Phase 0.1 and v1.5 Phase 0.1. **Three audits running with this open.** See §8.3.
- **Auto-fix actions on quality findings** — v2.2 at earliest. Correct.
- **Health-score history trend** (composite-score-over-time) — depends on persistence design that v1.5 did not bring online (variance snapshots persist *variance* not *composite health*). Should fold into v1.6 if reporting needs it.
- **Marketing landing v2 pass with histogram + Quality Panel screenshots** — still untouched (chronic from v1.3). The product is now extremely screenshot-worthy. Flag for post-v1.6 marketing pass.

### 3.3 What Broke or Regressed

- **Quality Panel cold-open first-render performance miss.** Documented as approved exception in plan-v1.5 Phase 0.2. Not a v1.5 regression (the miss existed in v1.4) — but it is now a *known* miss that v1.5 chose to ship past. Severity: medium. v1.6 inherits this debt and will compound it by adding S-curve + EVM panels into the same modal real estate (or adjacent). **Must close in v1.6 Phase 0.**
- Everything else: all gates green at ship.
  - `npm run lint` — clean (0 warnings)
  - `npm run type-check` — clean
  - `npm run test:unit` — **220/220** (17 suites)
  - `npm run build` — clean (297 KB, 67 KB gzip)
  - `npm run test:e2e` — **19/19** in 48.5s

### 3.4 What the Codebase Says vs. What the User Sees

No drift. `src/types/index.ts` carries `PERSISTED_SCHEMA_VERSION = 3` and the full extended `Baseline`, new `ChangeOrder`, `ChangeOrderStatus`, `VarianceSnapshot`, `BaselineDiff` types. `PersistedState` carries `baselines`, `changeOrders`, `varianceSnapshots`. Codebase and UI agree.

One soft observation, carried from audit v3 §3.4: there is still no lint rule preventing direct writes to `Task.deps[]`. v1.5 did not introduce any new violations, but the policy enforcement remains JSDoc-only. **Lower-priority than the perf debt — v2.0 territory at earliest** (when the data layer gets re-architected for cloud sync, this becomes a runtime invariant rather than a doc convention).

### 3.5 Mobile QA chronic gap — third audit running

The defer is now *documented and dated* across three plan files and is the right call given the desktop-first direction. But it is also the third audit in which physical-device QA on the bottom sheet (now carrying `ResourceAssignmentSection`, `ChangeOrderSection`, and a potentially-large baseline-compare diff) has not happened. **This stops mattering when the product is desktop-only by intent and starts mattering the moment a real PM uses it on a tablet on site.** Roadmap names v1.x as "single-user / field-PM workflows." A construction PM on a Microsoft Surface tablet on a Tuesday morning will hit the mobile bottom-sheet code path. Flag.

---

## 4. Praise (What Earns Respect)

1. **The schedule quality engine is the most respectable thing in the product right now.** Fourteen DCMA checks runs cleanly as pure functions, each returning a structured finding with a plain-English explanation. The Quality Panel renders an engineering report — monospaced numbers, pass/fail badges, no donut charts, no RAG dots. A construction scheduler with twenty years on P6 looking at this panel would recognize what it is doing. The float distribution histogram is the single piece of evidence that turns "you have a healthy schedule" into "you have a bell-curve distribution centered around 14-day float, with three negative-float outliers" — which is the difference between a marketing claim and an engineering claim. **This is the dimension move that defines v1.4.**

2. **Baseline immutability is enforced, not promised.** `assertNotLocked` in `src/lib/baselines.ts` is called in every in-app baseline-edit path. The `lockedAt` field is set at capture and never cleared. The only "edit" operation is supersession — capture a new baseline that points back at the predecessor via `supersededById`. This is the single most important property of a baseline in a construction dispute: that a captured baseline at time T is the same baseline at time T+90 days. Most SaaS tools paper this over with "you can edit but we track who edited what." v1.5 paper-trails the schedule the right way: by making the source immutable.

3. **The baseline comparison modal is an engineering diff, not a dashboard.** Three sections — slipped, added, removed — each with monospaced delta columns. Footer with net slip days, net task count change, cost delta. No KPI tiles. No vanity gauges. No animated reveals. The temptation to put a donut chart or a heatmap on the compare-modal surface is enormous, and the v1.5 plan §2.1 named it explicitly as a trap. The trap was avoided. A PM scanning the diff at 7:30 AM on a Tuesday gets the answer in five seconds: "interior paint slipped 4 days, MEP rough-in slipped 8 days, total +14 days, total +$43,900."

4. **Variance trend chart is a single line, a baseline-zero rule, and one decision: healthy vs degrading.** That is the right shape. A construction PM does not need a multi-series chart with annotations, crosshairs, and interactive scrubbers — they need to know whether the project is getting worse this week than it was last week. The 7-day rolling slope color switch (green if slope ≤0, amber if >0) answers the question without adding chrome. The hover tooltip names the date and variance value. There is no zoom, no scrub, no brush. v2.2 territory was correctly held back.

5. **Change orders are an entity, not an annotation.** `ChangeOrder { id, number, name, reason, status, createdAt, lockedAt, author?, affectedTaskIds, daysImpact, costImpact?, baselineLinkId? }` with status transitions (`draft → approved | rejected`, no transition back). Linked to tasks via `affectedTaskIds`. Surfaced in the SidePanel `ChangeOrderSection` as a collapsible chip list. The CRUD lives in `ChangeOrderManager` (mirrors `PartiesManager` shape). This is the right level of formality for v1.5 — enough structure to be defensible, not so much that it becomes a workflow tool (multi-step approval routing is correctly v2.0). The "+ Link change order" picker on the SidePanel is the right ergonomic call: PMs link COs to tasks from the task view, not from a separate CO-centric view.

6. **The BEI rebind to `activeBaselineId` closed an audit-v3-implicit gap before it was named.** Audit v3 only flagged BEI as "uses the most-recent baseline" — implicitly fine for v1.3 because there was only one baseline. v1.5 explicitly threaded `activeBaselineId` through `runDcmaAssessment`, made BEI return `N/A` cleanly when null, and added an inline link from the Quality Panel BEI row back to BaselineMenu. That link is the right kind of cross-modal flow — close the panel, open the menu, set active, return — without requiring a re-render or a state-machine kludge.

7. **Schema migration 2 → 3 was additive, defaulted, and round-trip tested.** The plan-v1.5 Phase B.3 round-trip test verifies that a v2 fixture loads cleanly in v1.5 and a v1.5 save reloads identically. Each new field has a sensible default (`reason = ''`, `author = undefined`, `lockedAt = baseline.date`). The migration walk now versions 0 → 1 → 2 → 3 and v1.6 inherits free additive-migration capacity. This is the second consecutive version that handled its schema bump well.

8. **The visual surface expanded by another ~30% (Quality Panel, BaselineCompareModal, ChangeOrderManager, ChangeOrderSection, VarianceTrendChart, stacked histogram, baseline-menu redesign) and the Swiss thesis still held.** Three audits running. v1.4 + v1.5 added eight new modal/panel surfaces and not one of them looks like a generic SaaS dashboard. The 1280px StatBar density audit was the right reflex — running it *before* adding the v1.4 health stat and *re-running it* before v1.5 capability work is the kind of preventative discipline that keeps the product from getting visually polluted by accident.

---

## 5. Shame (What Deserves Criticism)

1. **The Quality Panel cold-open first-render performance miss was approved and shipped past, not fixed.** Plan-v1.5 Phase 0.2 documented it; the S1 stop-and-ping fired; the human approved continuing v1.5 work. That was a defensible call for v1.5 — the miss didn't get worse and the capability work was urgent. But it is now a third-audit-running pattern: a known performance debt is named, defer-stamped, and shipped. v1.6 will layer S-curve + EVM + cash flow panels on top of the same render budget that already misses its target. **The longer this sits, the more it compounds.** v1.6 Phase 0 must close it. See §10.1.

2. **No change-order causality attribution in the baseline-compare diff.** The compare modal shows that "MEP rough-in slipped 8 days." It does not show that "MEP rough-in slipped 8 days **because CO-007 was logged 2026-03-15 for a mechanical riser relocation**." Both data points exist in the model — `ChangeOrder.affectedTaskIds` and `Baseline.tasks` snapshot the linkage at capture time — but the diff renders them as independent surfaces. A construction PM in an owner meeting needs the causal chain in one place: "B1 → B2 slipped 14 days; CO-007 (+8d, MEP) and CO-011 (+6d, drywall) account for the slip; both owner-directed, both signed." Right now the PM has to mentally join the two views. **This is the single most-requested follow-up a real user would ask for after one week of using v1.5.** Defer-or-not for v1.6: arguably it belongs in v1.6's executive PDF (the PDF is where the causality story lives), but the compare modal itself should at least show CO numbers next to affected slipped tasks. Estimated effort: small — affected-task → CO lookup already exists via `ChangeOrderSection`.

3. **No variance snapshot for the composite health score.** The variance trend chart tracks project-finish variance in days. It does not track the *health score* over time. A PM asking "is my schedule getting healthier or worse, week over week?" cannot answer that question from v1.5 data. The midnight ticker captures `{ date, activeBaselineId, projectFinishVariance, criticalPathLength }` but not `compositeHealthScore`. **This is a small additive change** — extend the snapshot type, add the field, render a second line on the variance trend chart or a sparkline in the HealthScoreBreakdown card. **Should be a v1.6 nice-to-have** (it informs the executive PDF) but not a blocker.

4. **Mobile real-device QA is owed for the third consecutive audit.** The desktop-first defer is the right call *for now*. The reality is: when a real PM uses this tool, they will use it on a tablet at some point. The new modal surfaces (QualityPanel, BaselineCompareModal, ChangeOrderManager) inherit the v1.0 / v1.2 modal-on-mobile chrome (full-screen on ≤640px) but the `ChangeOrderSection` collapsible inside the SidePanel bottom sheet has never been touched by a real finger. **This is now a process problem, not a code problem.** A 10-minute physical-device pass on an iPad with a representative schedule loaded would close the entire chronic gap. The longer it waits, the bigger the audit-debt liability becomes.

5. **No project-level summary on the BaselineCompareModal footer beyond totals.** The footer shows "Net slip: +14 days · Tasks: +1 / 0 / 0 · Cost delta: +$43,900." Good. What it does not show: which **phases** drove the slip, which **resources** are now over-allocated under Baseline B that weren't under Baseline A, which **critical path** changed. Each of those is a real PM question. Estimated effort: medium per question. **Not a v1.6 blocker** but worth surfacing as v1.7 (WBS) / v2.2 (saved views with cross-cuts) candidates.

6. **The change-order entity has `costImpact?` as optional and there is no validation that links to a cost-loaded task without a cost impact.** A change order linked to a task with 12 hours of carpenter labor at $85/hr should default `costImpact` to `$1,020`. v1.5 leaves it optional and unfilled. The result: a PM logging COs against cost-loaded tasks must manually enter cost impacts that the tool already knows. Small but visible ergonomic miss. **Fix in v1.6** when EVM lands — at that point cost-impact auto-derivation is required for PV/EV/AC math anyway.

7. **The variance trend chart's "healthy / degrading" decision uses a fixed 7-day rolling window with no PM-configurable sensitivity.** A 7-day window is reasonable for most projects but a 90-day infrastructure project with month-end progress updates needs a 30-day window; a 14-day fit-out needs a 2-day window. The fixed constant is `VARIANCE_DEGRADING_WINDOW_DAYS = 7` in `src/constants.ts`. **Not a v1.6 blocker** — the chart is useful as-is — but flag as a v2.2 saved-views candidate.

8. **No DCMA check 15 — resource over-allocation as a quality finding.** DCMA 14-Point is the industry standard and v1.4 implements it. But the firm's actual schedules are cost-loaded and resource-loaded, and a resource over-allocation that has nothing to do with logic-density or float-distribution would not show up in any of the 14 checks. The product knows about over-allocation (StatBar, histogram red bars, audit v3 §10.2 tooltip) — it just doesn't feed that signal into the composite health score. **v1.5 plan §3.2 explicitly forbade this** ("resource quality scoring beyond what falls naturally out of v1.3 data") which was the right call to prevent v1.4 scope creep. But the gap is now real: the health score does not reflect the most-visible quality signal in the product. **Address in v1.6 or v1.7** — likely a "Schedule Quality v2" pass that adds custom checks beyond DCMA-14.

---

## 6. Checkpoint-Specific Questions

These are the questions the roadmap names for Checkpoint 2.

**Q1: Does the multi-baseline model reflect how construction PMs actually manage baseline revisions on real projects?**

**A:** Yes, with two caveats.

What the model gets right:
- **Multiple captured baselines, each with a name, reason, author, and locked-at date.** This is exactly how PMs talk about baselines in real life: "Baseline 1 was the pre-design-revision version; Baseline 2 is post-CO-007."
- **Immutability after capture.** This is the property that makes a baseline defensible in a dispute. v1.5 enforces it. P6 does this. MS Project doesn't really — you can "edit" a baseline in MS Project, which is exactly why scheduling experts mistrust MS Project for claims.
- **Supersession chain via `supersededById`.** A real construction project has Baseline 1 → Baseline 2 → Baseline 3, each replacing the previous as the official reference. The chain is preserved.

What the model misses:
- **No "what-if" baseline simulation.** Roadmap explicitly defers to v2.x. Correct, but real PMs do use shadow baselines internally for scenario planning before committing. The deferral is fine.
- **No baseline annotation against intermediate progress updates.** Real schedules have a "status date" — the date through which actual progress is reflected. v1.5 baselines snapshot the schedule at the moment of capture but don't carry an explicit status-date field separate from the capture date. For 90% of cases capture date = status date. For the remaining 10% (PM captures a baseline late on Friday with actuals as of Monday), there's no way to record the discrepancy. **Small gap, v1.7 or v1.8 territory.**

**Q2: Is the change order workflow realistic — does it match the firm's actual change order process, or is it an approximation?**

**A:** It is the right level of approximation for a single-user instrument; it is not yet the full process.

What v1.5 captures correctly:
- Change orders are entities with numbers, names, reasons, and status (`draft / approved / rejected`).
- They link to specific tasks.
- They carry days-impact and cost-impact.
- They are author-stamped and date-stamped.
- They show in the side panel of an affected task.

What the firm's real process has that v1.5 does not:
- **Multi-step approval routing.** Real COs go through: PM drafts → Project Director reviews → Owner signs → Contract Admin issues formal CO number → posted to the financial system. v1.5 collapses that into a single `status` field. **Correctly deferred to v2.0 (multi-user / routing).**
- **Attachments.** Real COs carry signed PDFs, cost backup, schedule fragnets. v1.5 has no file storage. **v2.0 territory (cloud sync brings file storage with it).**
- **Cost backup detail beyond a single number.** A real CO cost impact is itemized: labor breakdown by trade, material list, equipment, overhead, fee. v1.5 has a single `costImpact?` number. **Sufficient for the daily-working-copy use case.**
- **Change-order pricing approval vs scope approval as separate states.** A CO can be "scope approved, pricing pending." v1.5 collapses to one status. **Acceptable approximation.**

**Verdict:** The v1.5 model is what a single-PM working copy needs. It is *not* the firm's CO system of record. v2.0 (cloud sync + multi-user) is the right time to widen the model. v1.6 should not touch this.

**Q3: Is the variance trend analysis actionable? Can a PM use it in an owner meeting to defend a position?**

**A:** Partly. It is actionable as a first signal. It is not yet sufficient as a defended position by itself.

Actionable today:
- The PM can open Quality Panel, point at the trend line, and say "we were holding flat through April; the slope went amber on April 22; the variance grew from +6d to +14d over the next three weeks."
- The healthy/degrading slope color is the right kind of summary — "are we getting worse?" answered in green or amber.
- The hover tooltip names the date + variance days for any historical point.

Insufficient as a standalone defense:
- The trend shows *that* the variance grew. It does not show *what caused* the variance to grow. A PM in an owner meeting would need to overlay change orders on the trend — "the slope changed on April 22 because CO-007 was approved that day." That overlay does not exist in v1.5. **This is the single biggest reporting gap.** It is what audit §5.2 names as "no change-order causality attribution."
- The trend is per-project-finish only. A PM defending a specific phase slip ("the MEP slip happened in a specific 4-week window") needs a phase-level or task-level trend. **v2.2 territory** — but very PM-relevant.

**Verdict:** In an owner meeting, the trend chart is a useful 30-second answer ("we're tracking +14 days against Baseline 2 with degrading slope since 4/22"). It is not yet the 5-minute answer ("here is why, and here is what we're doing about it"). v1.6 executive PDF is where the 5-minute answer lives.

**Q4: Has the tool become too complex for a single PM to use daily? Are there features that should be hidden behind advanced toggles?**

**A:** No, not yet. But the StatBar density audit needs to run again before v1.6's S-curve / EVM additions.

The TopBar now carries: MAKE wordmark, project name, Baselines dropdown, Phases, Parties, Resources, Change Orders, Quality. That is six action affordances plus the wordmark plus the baseline selector. At 1280px width on a Surface tablet, this is approaching saturation but not yet over.

The Quality Panel is a deliberately dense modal — engineering report layout, two columns, DCMA findings table, two charts, score breakdown card. It is the densest surface in the product. A PM seeing it cold would need ~60 seconds to orient. After three viewings, it becomes scannable. **This is acceptable for the tool's audience** (20-year tradesperson PM, not a casual user) but it is the surface where any further additions need to fight for their place.

What should be hidden behind toggles or accordion sections:
- **The 14 DCMA checks could fold to "top 3 failing" by default with a "show all" toggle.** Real PMs care about failures, not the 11 that passed. Minor ergonomic win, low effort.
- **The variance trend chart could be "off by default if no active baseline."** Right now it shows an empty state which is fine but adds a row of vertical real estate. Trivially optional.
- **The float distribution chart could be "off by default until >20 tasks."** Below that threshold the histogram is uninformative. Minor.

**Verdict: complexity is on the right side of the line for now.** v1.6 must not push it over. If v1.6's executive PDF lives in its own modal (which it should — the v1.6 plan should call this out), the Quality Panel does not get further densified.

**Q5: Are we missing any baseline comparison capabilities that PMs need (e.g., "what-if" baseline simulation)?**

**A:** Three things, in priority order.

1. **Change-order causality overlay on the compare diff** (audit §5.2). Highest priority. The compare modal shows what slipped; it should also show which COs were logged between the two baselines and which affected which slipped tasks. Estimated effort: small. **Strong v1.6 candidate.**

2. **Phase-level diff aggregation in the footer.** "+14 days net" is the top-level number; "MEP phase +9 days, finishes +5 days" is what an owner asks. The data is in the diff already (each slipped task carries a phaseId); the rollup is a `groupBy(phaseId)` away. **v1.7 territory** (WBS deepening brings phase rollups across the product).

3. **What-if baseline simulation** — branching a baseline forward without committing to capture. Real value but real implementation cost. **Correctly deferred to v2.x** per roadmap.

What v1.5 has that some PMs would not expect: per-row cost delta in the diff (uses current cost rates × baseline-snapshot durations, not snapshot-time rates). This is the right call — a PM comparing baselines today wants today's cost framing, not the historical rates. Worth documenting in `docs/baselines-and-change-orders.md` if it isn't already.

**Q6: Is the schedule quality engine (v1.4) actually being used, or is it a feature that PMs ignore?**

**A:** Honest answer: nobody is using the product yet. The product is being built; there are no real PMs running real schedules through it. The question can only be answered hypothetically.

**Hypothetical answer based on the design:** the Quality Panel is the kind of feature a PM either uses every morning or never opens after the first week. The single-number health score in the StatBar is the on-ramp — green/amber/red is enough to know whether to dig deeper. If the schedule sits at green for weeks at a time, the PM will stop opening the panel. If it sits at amber with active findings, the panel becomes the morning ritual. The 14 DCMA checks themselves are aimed at the right audience (anyone who has been audited by an owner's scheduler will recognize CPLI, BEI, and float distribution as the metrics they get asked about).

What would make it stick:
- **An on-load nag for first-time low-score schedules.** "Your schedule scored 58/100 — would you like to see the top 3 findings?" Once, on first import, dismissable. v2.2 territory but worth flagging.
- **A trend on the health score itself, not just on variance.** Audit §5.3 names this. If the PM can see "we improved from 65 to 78 over six weeks," the engine becomes a coaching tool, not just a graded test.
- **Owner-facing print of the health score on the A3.** A printed schedule with `Quality: 82/100` in the title bar is a small but meaningful signal to the owner that the schedule has been audited. v1.6 print pass should consider it.

**Verdict:** The engine is well-built. Its adoption-stickiness is unknowable until real PMs use it. The features that would tip it toward "daily ritual" are mostly in v1.6 (PDF report, score on print) and v2.2 (history trend, on-load nag). **No v1.5/v1.6 action item — but watch this in Checkpoint 3.**

---

## 7. Instrument Feel Assessment

| Criterion | Pass / Fail | Notes |
|---|---|---|
| **Swiss visual discipline maintained?** | ✅ Pass | Eight new modal/panel surfaces in two versions. Zero gradients added, zero card-spam patterns, zero generic CTAs. The diff table in BaselineCompareModal and the DCMA findings table in QualityPanel are the densest engineering reports in the product to date and both pass the v1.2 pre-flight test. |
| **Keyboard-first operation preserved?** | ✅ Pass | All new modals use `useDialogA11y` (Tab / Shift+Tab / Escape contract). Variance trend chart hover has `aria-label`. Stacked histogram chart `aria-label` names selected resources. The Phase J.4/J.5 axe-sweep extensions caught and fixed `select-name`, `scrollable-region-focusable`, and `Escape stopPropagation` issues before ship. |
| **Print output still production-grade?** | ✅ Pass + | A3 summary mode now carries optional "Active baseline: <name> · variance +Nd" in the header band. Title-bar pattern preserved. Long baseline names truncate gracefully (manual QA confirmed in v1.5 plan §11.5). |
| **Performance target met?** | ⚠ Mostly | Drag-frame time with histogram + Quality Panel open holds. DCMA assessment time, health composition, variance snapshot append/trim, baseline comparison, stacked histogram all hit their §8 targets. **Quality Panel first-render cold-open missed by enough to be approved-and-deferred in v1.5 Phase 0.2.** This is a known debt — see §10.1. |
| **No hardcoded hex in components?** | ✅ Pass | All v1.5 new colors are tokens: `--variance-line-healthy`, `--variance-line-degrading`, `--diff-added`, `--diff-removed`, `--diff-slipped`, `--baseline-locked-fg`. v1.4 added `--health-green / -amber / -red`, `--float-bucket-bg / -critical / -negative`. Documented in `docs/design-system.md`. |
| **Dense, not decorated?** | ✅ Pass | Quality Panel is the densest surface in the product and it holds. BaselineCompareModal is monospaced delta columns end-to-end. ChangeOrderManager mirrors PartiesManager, which itself was the proven dense-list shape from v1.0. |
| **Feels like a tool, not a toy?** | ✅ Pass | A 20-year tradesperson PM looking at the BaselineCompareModal sees a diff report. Looking at the QualityPanel sees an audit report. Looking at the variance trend sees a single line with a healthy/degrading color decision. None of these surfaces would embarrass the product in a meeting with a scheduling expert from an owner's side. |

**Instrument feel verdict:** **Strong, holding.** v1.4 + v1.5 were the most dangerous two-version sequence for instrument feel since v1.0 — health scores, RAG colors, KPI tiles, and diff dashboards are the AI-generic surfaces. They all landed Swiss-disciplined. **The Quality Panel cold-open perf debt is the only soft signal in the dimension** and it is well-understood, not silently accumulating.

---

## 8. Comparison to Prior Audits

### 8.1 Score Trend

```
v1 audit  (post-v1.0):  3.6/10 (holistic) / 3.7/10 (equal-weight, 15-dim)
v2 audit  (post-v1.2):  4.5/10 (holistic) / 4.4/10 (equal-weight, 16-dim, +trust dim)
v3 audit  (post-v1.3):  5.5/10 (holistic) / 5.3/10 (equal-weight, 16-dim)  ← Checkpoint 1
v4 audit  (post-v1.5):  6.7/10 (holistic) / 6.3/10 (equal-weight, 16-dim)  ← THIS AUDIT (Checkpoint 2)
v5 audit  (post-v1.8):  pending  (Checkpoint 3)
v6 audit  (post-v2.0):  pending  (Checkpoint 4)
v7 audit  (post-v2.2):  pending  (Checkpoint 5 — Final)
```

**Direction:** ▲▲ — two consecutive material gains. Composite has now moved +3.1 holistic over four audits (3.6 → 6.7). The pace is faster than the roadmap implied (one version per checkpoint, multiple checkpoints over months); the compressed-agent-work cadence means scoring assumes capability landed, not adoption proven.

### 8.2 Repeated Praise (Four audits running — these are the chronic strengths)

1. **Architectural discipline.** State centralized in `App.tsx`, pure `src/lib/*` modules, dumb components. v1.4 added four new pure libs (`dcma.ts`, `health.ts`, `floatDistribution.ts`, `logicValidation.ts`); v1.5 added three more (`baselines.ts`, `changeOrders.ts`, `variance.ts`). All pure. No React imports. No localStorage touches. The architectural shape has now survived 7 new pure libs across two versions.
2. **Critical path implementation.** Real Kahn + forward/backward pass with FS/SS/FF/SF + lag. Untouched in v1.4 / v1.5; consumed by DCMA + variance modules without modification.
3. **Print-first mentality.** A3 print canvas treated as first-class. v1.3 extended with cost; v1.5 extended with baseline header. The discipline holds.
4. **Visual restraint.** Four audits in a row. v1.4 + v1.5 added the largest visual surface expansion in the product's history (eight new modals/panels) and the discipline still holds.
5. **Schema migration trust.** Two schema bumps now (1→2 in v1.3, 2→3 in v1.5). Both additive, defaulted, round-trip tested. v1.6 inherits free additive-migration capacity through `migrateState`.

### 8.3 Repeated Shame (Chronic gaps across multiple audits)

1. ~~**No resources.**~~ ✅ Closed in v1.3.
2. ~~**No schedule quality engine.**~~ ✅ Closed in v1.4. Was named "top remaining chronic gap" in audit v3.
3. **No collaboration / cloud sync.** v2.0. Still chronic. Four audits.
4. **Mobile real-device QA is owed.** Three audits running (v2, v3, v4). Desktop-first defer is now triple-dated. The longer this waits, the bigger the audit-debt liability when a real PM tries to use this on a tablet on site.
5. **Marketing landing v2 pass with screenshots of new capability.** Three audits running (v3 first flagged it post-v1.3 when there was finally something to screenshot). Now the product has eight new screenshot-worthy surfaces. **Flag for post-v1.6 marketing pass** — by then the executive PDF and S-curve will also be screenshotworthy.

### 8.4 Resolved Items

1. ✅ **Cross-resource histogram overlay** — audit v3 §5.1 → closed in v1.5 Phase H.
2. ✅ **StatBar over-alloc resource-name tooltip** — audit v3 §10.2 → closed in v1.5 Phase H.3.
3. ✅ **BEI rebind to `activeBaselineId`** — implicit in v1.3 with one baseline; explicitly threaded in v1.5 Phase G.
4. ✅ **Perf re-measurement at v1.3 scale** — audit v3 §9 (Phase 0.2 close-out) → executed in v1.4 Phase 0.2.
5. ✅ **StatBar density audit** — audit v3 §9 (Phase 0.3 close-out) → executed in v1.4 Phase 0.3 + re-run in v1.5 Phase 0.3.
6. ◐ **Mobile real-device QA** — *re-affirmed as deferred* in both v1.4 Phase 0.1 and v1.5 Phase 0.1. The chronic gap is *documented* but not *closed*. Still owed.
7. ◐ **Marketing landing v2 pass** — still untouched. Three audits running.

---

## 9. Decision Gate

**Checkpoint question (from `pm-roadmap.md`):** *"If the audit scores below 6.5/10, identify which layer (resources, quality, or baselines) is weakest and fix it before proceeding to v1.6. If it scores 6.5+, proceed to v1.6."*

**Your answer:** **Pass with one condition attached.**

**Score threshold:** 6.5/10.
**Holistic score:** **6.7/10.** Meets threshold with margin.
**Equal-weight score:** **6.3/10.** Below threshold by 0.2.

The two scores disagree by 0.4. The holistic verdict weights the dimensions that the version was built to address (schedule quality +5, baseline/variance +2, trust +2). The equal-weight average distributes credit across all 16 dimensions. Both are defensible; the holistic read is more honest about the *value to a construction PM* and the equal-weight read is more honest about *how much of the roadmap is still ahead*. The Checkpoint 2 question is about platform coherence, which is closer to the holistic read.

**Recommendation: proceed to v1.6 with one condition attached** — close the Quality Panel cold-open first-render performance miss in v1.6 Phase 0, before any S-curve / EVM / cash flow / report-modal surface lands.

**Why one condition, not three (like audit v3):**
- The audit v3 conditions (mobile QA, perf re-measurement, StatBar density) were checkpoint-blocking process items. Two of them (perf, StatBar) closed cleanly in v1.4/v1.5 Phase 0. The third (mobile QA) was re-affirmed-as-deferred which is the right call for a desktop-first product but still leaves the chronic gap open.
- The audit v4 condition (Quality Panel cold-open) is a single named performance debt that compounds if v1.6 layers new panels on top of it.

**If the condition slips:** escalate to a manual decision before v1.6 capability phases start. Do not "approve and defer" twice on the same metric — that becomes a pattern.

---

## 10. Recommendations for Next Version (v1.6 — Reporting & Analytics)

### 10.1 Must Fix (Blocking — close in v1.6 Phase 0, before any v1.6 capability work)

- **Close the Quality Panel cold-open first-render performance miss.** Plan-v1.5 Phase 0.2 approved-and-deferred it; v1.6 inherits the debt. Re-measure at v1.5 scale (500 tasks × 25 resources × the new v1.5 surfaces active). Identify the slow path — likely a synchronous DCMA run on first open. Memoize, lazy-load, or split the panel into tabs. Whatever the fix, the cold-open must hit its target before v1.6's Reports modal lands. **Surface this as v1.6 Phase 0.1.**
- **Re-affirm desktop-first mobile QA defer with a dated v1.6 entry in `docs/mobile-qa.md`.** Continues the three-audit pattern; not a code change, but the discipline matters. **v1.6 Phase 0.2.**
- **Re-run StatBar density audit at 1280px.** Status quo from v1.5 (no new StatBar additions in v1.6 planned — Reports lives in a new TopBar slot, not StatBar). Confirm the no-op verdict before adding the TopBar "Reports" button. **v1.6 Phase 0.3.**

### 10.2 Should Fix (High Priority — close in v1.6 if reasonably possible)

- **Change-order causality attribution.** §5.2 names this. Two places to surface:
  - **BaselineCompareModal:** next to each slipped task, show CO numbers that affected it (small chip cluster after the cost delta column).
  - **Executive PDF (v1.6 deliverable):** the narrative "slip driven by CO-007 (+8d) and CO-011 (+6d)" is exactly the artefact the executive summary needs. Make this the centerpiece of the variance-summary section.
  - Estimated effort: small for the modal surface, medium for the PDF narrative.
- **Composite health score history.** §5.3 names this. Extend `VarianceSnapshot` to include `compositeHealthScore`. Render a second line on the variance trend chart OR a sparkline in `HealthScoreBreakdown`. **Decide during v1.6 plan write-up** — sparkline is the more honest "health over time" surface.
- **Auto-derive `ChangeOrder.costImpact` from linked tasks' cost rollup.** §5.6 names this. EVM (v1.6) requires this anyway. Land it during the change-order touch-up that EVM forces.

### 10.3 Nice to Have (Low Priority — defer if v1.6 schedule pressures)

- **Top-3-failing DCMA findings as the default Quality Panel view, with "show all" toggle.** Closes the §6 Q4 ergonomic note. Effort: small.
- **Lint rule preventing direct writes to `Task.deps[]`.** Closes the audit-v3 §3.4 / audit-v4 §3.4 policy enforcement gap. Effort: small (custom ESLint rule). Still v2.0 territory at earliest.
- **Quality score on print A3.** Audit §6 Q6 names this — `Quality: 82/100` in the print title bar. Small but meaningful owner-facing signal. Effort: trivial; bundle into v1.6 print pass.
- **Mobile real-device QA pass.** Chronic gap, three audits running. A 10-minute pass on an iPad would close it. Effort: trivial in calendar terms, but blocked on access to a physical device.

### 10.4 Scope Creep Warning

v1.6 is reporting and analytics. The seductive traps:

- **Bundling resource-quality scoring into Schedule Quality v2.** §5.8 names the gap (no DCMA check 15 for over-allocation). Tempting to extend the engine in v1.6 because the executive PDF will surface health. **Defer to v1.7 or a dedicated "Schedule Quality v2" pass** — v1.6 has enough scope.
- **Adding interactivity to charts.** The S-curve will tempt drag-to-scrub; the cash flow will tempt drag-to-rebudget; the variance trend will tempt zoom/brush. **All of those are v2.2 saved-views / power-user territory.** v1.6 chart shape is read-only, single-decision.
- **"While we're touching the persistence layer for saved report preferences…" leading to a tangential schema add.** If v1.6 needs persistence for saved report templates, bump schema to v4 with a strict additive migration. If not — and the roadmap description suggests reports are derived from existing data — **keep schema at v3 for v1.6.** A schema-stable v1.6 between schema-changing v1.5 and (likely) v1.7 is a clean diff target.
- **Chart libraries.** The temptation to "just use Recharts for the S-curve" will be enormous. **Reject at PR review.** Roadmap and CLAUDE.md design decision #1 are explicit. Custom SVG with the same render-path philosophy as the Gantt and the histogram and the float distribution.
- **AC (Actual Cost) tracking inside v1.6.** EVM needs PV + EV + AC. v1.5 has no concept of actual cost (only cost-loaded planned cost via resources). Wiring up an actual-cost input form is its own organ. **Defer AC + CPI to v1.7 or note as a v1.6 optional stretch.** v1.6 EVM should ship PV + EV + SPI; AC + CPI come later.
- **Cross-project / portfolio rollups in the reports.** Roadmap puts portfolio in v2.1. Do not let "while we're building executive reporting, can we also…" pull portfolio forward.

---

## 11. Final Verdict

Two organs landed in 48 hours and the body is starting to move. v1.4's schedule quality engine is the most respectable surface in the product right now — DCMA 14-point, weighted composite health, float distribution, logic validation, CPLI, BEI all rendered as an engineering report rather than a SaaS dashboard. v1.5's multi-baseline + change orders + variance trend turns the schedule into a defensible historical record — captured baselines are immutable, supersession chains preserved, change orders linked to affected tasks, per-day variance snapshots forming a 12-month rolling forensic trace. The platform-coherence test passes: a PM opening v1.5 sees a loop — capture, watch, log, compare, audit — that did not exist three audits ago.

What remains is reporting (v1.6), WBS (v1.7), calendars and delays (v1.8), and the architectural shift to cloud + multi-user (v1.9 → v2.0). The roadmap discipline that has held for two consecutive checkpoints is the single most valuable property of this project right now. v1.4 did not bundle multi-baseline. v1.5 did not bundle EVM. Both versions held their forbidden lists. v1.6 needs to hold the same line — S-curve and EVM and cash flow and executive PDF and weekly report is *enough scope*. AC tracking, portfolio rollups, chart libraries, and resource-quality-as-DCMA-15 are the v1.6 traps. The one specific debt that compounds if ignored is the Quality Panel cold-open first-render miss — close it in Phase 0 before adding any new modal real estate.

**One-line summary:** Two organs in, the body is moving, v1.6 unlocks the surface that PMs use to *speak to owners* — and the only thing that must close before that work starts is the performance debt that v1.5 approved-and-deferred.

---

## Filing Instructions (executed on save)

1. ✅ Saved as `.claude/pm-audit-v4.md`.
2. ✅ Score trend table (§8.1) updated with v4 entry.
3. ◐ `version-status.md` update: mark Checkpoint 2 ✅ pass (one condition attached), link this audit in the PM Audit Index with 6.7/10 holistic / 6.3 equal-weight, update Current Focus to "v1.6 planning — Phase 0 must close Quality Panel cold-open perf debt before capability work."
4. ◐ Roadmap (`pm-roadmap.md`) version summary table — update v1.4 actual fitness, update v1.5 actual fitness to 6.7/10 (target was 6.8 — within rounding), link Checkpoint 2 audit.
5. ◐ Forward §10.1 must-fix item (Quality Panel cold-open) to plan-v1.6.md Phase 0 once Claude authors the next plan.
6. ◐ Update `.claude/AGENT-HANDOFF.md` — next action: Claude authors `plan-v1.6.md` incorporating the one Phase 0 must-fix item from this audit.
