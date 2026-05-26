# MAKE Scheduling Tool — Plan v1.6

**Status:** Draft · Reporting & Analytics (the fourth organ — the surface that speaks to owners)
**Created:** 2026-05-25
**Author:** Claude (planning agent)
**Predecessors:** [plan-v1.5.md](./plan-v1.5.md) ✅ shipped 2026-05-25 (`v0.5.0`), [pm-audit-v4.md](./pm-audit-v4.md) (Checkpoint 2 — pass at 6.7/10 with one condition: Quality Panel cold-open perf close-out in Phase 0)
**Target ship tag:** `v0.6.0`
**Roadmap target fitness:** 6.7/10 → 7.5/10
**Checkpoint:** None during v1.6 (next checkpoint is Checkpoint 3 after v1.8 ships)

---

## 0. One-line premise

v1.3 made the schedule **executable**. v1.4 made it **auditable**. v1.5 made it **defensible over time**. **v1.6 makes the schedule speak to owners** — when the PM has built a defensible schedule and tracked its evolution, v1.6 produces the artefacts that go in front of a $50M-budget owner on Monday morning: the S-curve that shows planned vs actual progress, the SPI that tells whether the project is performing to plan, the cash flow forecast that tells when money will hit the books, and the one-page executive PDF that the owner reads in 90 seconds.

---

## ⚠ Branch hygiene reminder (one-branch-per-version)

Codified as a permanent rule in `AGENTS.md § Conventions` since v1.4. Implementation agent MUST start with:

```
git checkout main
git pull --ff-only origin main
git checkout -b v1.6
git push -u origin v1.6
```

Verify with `git branch --show-current` → must print `v1.6`. Every v1.6 commit lands on `v1.6`; ship merges via PR `v1.6 → main`, then tag `v0.6.0` on the merge commit. No work goes directly to `main`. This is not re-documented per phase — agents who skip it must stop and fix before any other work.

---

## ⚠ Codex operating rules (READ AT EVERY PHASE BOUNDARY)

These are not v1.6-specific; they are the always-on rules for implementing any plan in this codebase. Embedded here because v1.6 carries more new modal surfaces (Reports, S-curve, EVM, cash flow, executive PDF preview, weekly report editor) than any prior version and process discipline matters most under that load.

- **One process at a time.** No background `vitest --watch`. No parallel `vite preview` servers. Foreground each gate, wait for it to finish, then move on.
- **Build before every E2E run.** `npm run build` then `npm run test:e2e`. The E2E harness reads `dist/`. Running E2E against a stale build silently masks regressions.
- **Stop-and-ping triggers are mandatory.** Each is named in §16. Do not push past a failing gate.
- **All icons from `src/lib/icons.ts` only.** Add new Phosphor exports there first; consumers import from `src/lib/icons.ts` only. No direct `@phosphor-icons/react` imports in components.
- **All colors via `var(--token)`.** Zero hardcoded hex in components. New tokens land in `src/styles/tokens.css` under both light root and `@media (prefers-color-scheme: dark)` overrides.
- **`src/lib/*` modules are pure.** Input → output. No React imports. No localStorage touches. Only `src/lib/storage.ts` touches persistence.
- **No new runtime dependencies.** Specifically: no chart libraries (D3, Recharts, VictoryChart, Chart.js, etc.) and no PDF libraries (jsPDF, html2canvas, pdfmake). SVG is rendered by the browser; PDF is the browser's `window.print()` against a print-mode-styled DOM. Dev-only types are case-by-case but must be surfaced via S7.
- **No `any`, no force-unwrap.** TypeScript strict stays clean.
- **No nested ternaries.** Extract to if/else or guard clauses.

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
| **v1.6** | **Reporting & analytics — the owner-facing organ** | **This plan** |

The audience widens. v1.3 through v1.5 served the PM — the daily user. v1.6 serves the **owner**, the **VP of Construction**, the **inspector**, and the **claims lawyer** — the consumers of the artefact the PM produces. The PM still uses the tool; what changes is that the tool now produces deliverables that leave the PM's desk and land on other desks.

The deliverable v1.6 produces is a one-page executive PDF the PM exports on Sunday night and the owner reads at the Monday 10 AM coordination meeting. The PDF carries: the health score, the S-curve, the top 3 risks, the top 3 variances against the active baseline, the next 5 milestones, the SPI, and (stretch) the CPI. That single page is what justifies v1.6 in the audit — it is the moment the tool stops being a working copy and starts being communication infrastructure.

---

## 2. The "single organ at a time" principle (CARRIED FORWARD)

The roadmap's seventh guiding principle still holds. v1.6 ships:

- S-curve (planned cumulative progress % vs actual cumulative progress %, over project lifetime)
- EVM math (Planned Value, Earned Value, SPI). Actual Cost and CPI are **out of v1.6 base scope** and named as an optional stretch — see §3.2.
- Cash flow forecast (monthly planned spend, bar chart, category-broken down)
- Reports modal (TopBar entry, list of report types, preview pane, export button)
- Executive summary report (one-page PDF via browser print, no Gantt chart)
- Weekly progress report (auto-generated from schedule data, 2–3 narrative fields, exportable)
- Composite health score history capture (audit v4 §10.2 — extend `VarianceSnapshot` to also carry `compositeHealthScore`)
- Change-order causality attribution on the BaselineCompareModal (audit v4 §10.2 — show CO numbers next to affected slipped tasks)

v1.6 does **not** ship:

- AC (Actual Cost) input form and CPI computation (deferred to v1.7 or v1.8 — see §3.2)
- WBS coding, roll-up summary pills, hierarchy depth validation (v1.7)
- Project calendar overlays, per-resource calendars, weather/delay tracking (v1.8)
- P6 / MPP / Procore import-export (v1.9)
- Cloud sync / multi-user / comments / audit trail (v2.0)
- "What-if" baseline simulation (v2.x)
- Drag-to-scrub / zoom / brush on any of the new charts (v2.2)
- Per-project portfolio reporting (v2.1)
- Saved report templates (v2.2 — defer the persistence layer for report preferences if it threatens to bump schema)
- Chart libraries (any version — explicit non-goal per CLAUDE.md design decision #1)
- PDF libraries (any version — explicit non-goal; `window.print()` is the export path)

If a contributor asks "while we're touching the reporting layer, can we also…" the answer is no.

### 2.1 Discipline preserved

Every visual surface added in v1.6 must pass the v1.2 pre-flight:
- "Would another product look identical if I swapped the wordmark?" — if yes, fail.
- "Does it have a job, or is it decorative?" — if decorative, fail.
- "Would I notice it missing?" — if no, fail.

**Reports are the surface where "dashboard creep" is at its highest risk in the entire roadmap.** S-curves invite drag-to-scrub. EVM invites KPI tiles. Cash flow invites donut breakdowns by category. Executive PDFs invite logo blobs and gradient banners. **All of these temptations must be rejected.** Each chart is single-series or two-series at most. Each PDF is print-mode CSS, monospaced numbers, one-page A4 (the executive PDF is A4 letter — owner-facing — not A3 like the Gantt print).

### 2.2 The defensibility floor

v1.6 preserves the floor:
- Every new pure function gets a unit test.
- Every new user-visible flow gets an E2E spec.
- **Schema stays at v3** (audit v4 §10.4 named the value of a schema-stable v1.6). If v1.6 needs persistence for saved report preferences, **defer that to v2.2** — the report types are derived from existing data; export is one-shot.
- No new runtime dependencies (see §14).
- No regression on existing 220 unit tests or 19 E2E specs.
- Performance contract: no regression on v1.5 baselines; the Quality Panel cold-open debt from audit v4 §10.1 closes in Phase 0 before any v1.6 surface lands.

---

## 3. Scope

### 3.1 In scope (v1.6)

| Capability | What the PM sees |
|---|---|
| **Reports modal** | New entry in TopBar between Quality and the right-hand cluster. Phosphor `ChartLine` icon. Opens `ReportsModal`. Modal layout: left pane = report type list (S-curve, EVM, Cash Flow, Executive Summary, Weekly Progress, *future* Health Trend); right pane = preview surface + export controls. Each report type has its own preview pane component; export buttons are context-specific ("Export PDF" / "Export CSV" / both). |
| **S-curve chart** | Planned cumulative progress % vs actual cumulative progress %, plotted over time from project start to project finish. Two SVG lines: planned (solid, `--scurve-planned`) and actual (solid, `--scurve-actual`). X-axis is time (week or month buckets depending on project duration — see §6). Y-axis is 0–100% cumulative progress. Status-date today-line drops in vertically; "today" intersection point gets a small dot on each line. Below the chart, a one-line variance summary: "Actual 64% · Planned 71% · Variance −7%" with the variance number color-coded (green if ≥0, amber if −5 ≤ variance < 0, red if < −5). |
| **EVM panel (PV / EV / SPI)** | A small KPI strip (3 cells, monospaced) followed by a single SVG chart showing PV and EV over time (two lines, same X axis as S-curve). PV (Planned Value) = baseline-snapshot planned cost cumulative-over-time. EV (Earned Value) = actual progress % × baseline-snapshot total cost. SPI = EV / PV. **No AC, no CPI in v1.6 base scope.** A footer note reads "AC (Actual Cost) tracking is not yet implemented — CPI will appear when actuals can be entered (v1.7+)." Requires an `activeBaselineId` with cost-loaded tasks; falls back to an empty state otherwise. |
| **Cash flow forecast** | A monthly bar chart spanning project duration (or up to 24 months for projects longer than two years — see §6.4). Bars are segmented by resource category (labor / equipment / material). Hover names the month + the per-category breakdown + the monthly total. Derived from task durations × resource cost rates × daily distribution (linear within task — same approximation v1.3 uses for material distribution). |
| **Executive summary PDF** | One-page A4 portrait, owner-facing. Header band: project name, report date, active baseline name + capture date. Sections in fixed order: (1) Health score 0–100 with banding color; (2) S-curve thumbnail (320×120px, no axis labels — just the two lines, today-marker, and the variance summary line below); (3) Top 3 variances (table: task name, baseline finish, current finish, slip days, slip $, primary CO if linked); (4) Top 3 risks (sourced from DCMA findings sorted by severity); (5) Next 5 milestones (from tasks marked `milestone: true`, sorted by finish ascending, filtered to those finishing after today); (6) SPI (and SPI footer mentioning AC/CPI deferred). No Gantt chart. No logo blobs. No marketing copy. Export via browser print to PDF — a print-mode stylesheet renders this layout when the report-print class is active. |
| **Weekly progress report** | Two-pane editor. Left pane = auto-generated content: (a) tasks completed this week (`actualFinish` within last 7 days), (b) tasks planned for next week (`plannedStart` within next 7 days, not yet started), (c) variances logged this week (tasks where pct moved but plannedFinish slipped), (d) change orders logged this week. Right pane = three PM narrative fields: "Highlights", "Concerns", "Look-ahead notes". The PM types into the narrative fields, the auto-generated content is rendered alongside, and "Export PDF" produces a 1–2 page A4 letter document. |
| **Composite health score history** | Audit v4 §10.2 carry. `VarianceSnapshot` gets a new field `compositeHealthScore: number | null`. Midnight ticker captures it alongside the existing fields. Variance trend chart in Quality Panel gains an optional second line (toggle: "Show health score") rendered as a thin secondary-axis line. Sparkline in `HealthScoreBreakdown` card showing last 30 days. |
| **Change-order causality on BaselineCompareModal** | Audit v4 §10.2 carry. Each slipped task row in `BaselineDiffTable` shows an optional trailing chip cluster listing CO numbers linked to that task (e.g., `[CO-007]`). Click to open the change order in `ChangeOrderManager`. |
| **Quality score on print A3** | Audit v4 §10.3 carry. The existing A3 Gantt print canvas title bar gets an optional `Quality: NN/100` segment after the project name and baseline header (same band as the v1.5 baseline-header line). Color-coded green/amber/red. |
| **Top-3-failing DCMA findings as Quality Panel default** | Audit v4 §10.3 carry. `DcmaFindingsTable` renders only failing findings by default with a "Show all 14 checks" toggle below the table. When a schedule has all checks passing, the table shows a friendly "All 14 checks passing" state. |

### 3.2 Out of scope (explicitly deferred)

| Deferred to | What |
|---|---|
| **v1.7** | Standard WBS coding export, group roll-up summary pills, hierarchy depth validation, **AC (Actual Cost) input form + CPI** (folded into the WBS / cost-tracking widening) |
| **v1.8** | Project calendar overlay, per-resource calendars, weather/delay tracking, excusable vs non-excusable classification |
| **v1.9** | P6 (`.xer`) / MS Project (`.mpp`) import-export, Procore integration |
| **v2.0** | Cloud sync, multi-user, audit trail, comments, presence, change-order approval routing |
| **v2.1** | Portfolio dashboard, cross-project reports, project templates |
| **v2.2** | Density modes, column customization, **saved report templates**, drag-to-scrub on charts, per-task variance trends, bulk edit, drag-and-drop dependencies |

**Specifically NOT in v1.6** even though they are tempting:
- **Actual Cost (AC) input form** — AC + CPI completes the EVM picture, but it is its own organ (per-task / per-week actual-cost entry, payroll integration concept). Defer to v1.7. v1.6 ships SPI (which uses PV + EV only, both derivable from baseline + actual progress).
- **DCMA check 15 — resource over-allocation as a quality finding.** Audit v4 §5.8 names the gap. **Defer to v1.7 or a dedicated "Schedule Quality v2" pass.**
- **AI-generated change order narratives** — never in scope.
- **Logo / branding on the executive PDF** — the PDF is monospaced numbers and section headers. No logos in v1.6. (Brand identity is a v2.x design pass.)
- **Custom report builder / drag-and-drop sections** — v2.2 saved views.
- **Per-resource cash flow breakdown beyond category** (i.e., "show me cash flow for just the electrical crew") — v1.7 once WBS hierarchy gives the rollup primitive.
- **S-curve overlay on the printed A3 Gantt** — flagged in audit v3 §3.1 but explicit non-goal for v1.6. The S-curve has its own report; bundling it onto the Gantt print canvas is visual pollution. Defer indefinitely.
- **Interactive S-curve scrub** — v2.2 territory.
- **Resource histograms in the executive PDF** — too dense for an owner read. Single S-curve thumbnail is enough.

If a v1.6 PR includes any of the above, reject. Point at this section.

---

## 4. Phase 0 — Mandatory carry-overs from audit v4 §10.1

### 4.1 Pre-flight verification (BLOCKING — do these BEFORE branching)

| # | Task | Verification | Stop-and-ping |
|---|------|--------------|---------------|
| 0.−2 | **Verify v1.5 shipped to `main`.** `git fetch origin && git log origin/main --oneline -5` must show the v1.5 merge commit. `git tag --list 'v0.5.*'` on a freshly-fetched repo must include `v0.5.0`. `cat package.json \| grep version` on `main` must read `0.5.0`. If any of these is missing, the v1.5 PR + tag (human actions per `AGENT-HANDOFF.md`) have not completed yet — **stop via S13 and do not branch v1.6 from a stale `main`.** | git output captured in commit message of the first v1.6 commit, OR S13 surfaced. | S13 |
| 0.−1 | **Verify working tree is clean** (or only carries the recurring `playwright-report/index.html` noise per audit v3 §3.3). If anything else is dirty, stop and surface. The `playwright-report/index.html` modification is acceptable noise — it MUST NOT be staged or committed to `v1.6` at any point. Confirm `.gitignore` and per-CLAUDE.md "respect .gitignore absolutely" before any `git add`. | `git status` clean except for known noise. | S13 |

### 4.2 Branch creation

| # | Task | Verification |
|---|------|--------------|
| 0.0 | Create branch `v1.6` from latest `main`, push to origin | `git branch --show-current` returns `v1.6` |

### 4.3 Project documentation refresh (BLOCKING — does not need to land before Phase A starts, but MUST land in Phase 0 commit set)

| # | Task | Deliverable | Files |
|---|------|-------------|-------|
| 0.A | **Refresh `.claude/CLAUDE.md`.** The file's "Last updated 2026-05-22" still describes v1.2 as the active build, names schema version 1, and the Eight Key Design Decisions do not mention resources, quality engine, or baselines. This file is the durable project reference; future agents read it cold and need accurate truth. **Update:** (i) "What This Is" paragraph to name v1.5 shipped and v1.6 active; (ii) "Persistence: schema version 3"; (iii) Add a ninth and tenth Key Design Decision capturing the pure-lib boundary discipline that has held across 10 lib modules now, and the modal-print-mode pattern (A3 Gantt + A4 reports) shipping in v1.6; (iv) "Where to Look Next" pointing to plan-v1.6.md as active and listing predecessors as shipped. Treat this as a planning-agent task that Claude writes during Phase 0 once Codex branches; Codex's job is to commit the file. | Updated `.claude/CLAUDE.md` with accurate version state, schema version, design decisions, and active-plan pointer. | `.claude/CLAUDE.md` |
| 0.B | **Update `.claude/AGENT-HANDOFF.md`** to point at v1.6 implementation. Currently states "next action: Claude writes pm-audit-v4.md" — that work is complete. The handoff must reflect: pm-audit-v4 filed (Checkpoint 2 pass with one condition), plan-v1.6 written, Codex's next action is Phase 0.−2 (pre-flight verification) → Phase 0.0 (branch) → Phase 0.1 (Quality Panel perf close-out). | Updated `.claude/AGENT-HANDOFF.md`. | `.claude/AGENT-HANDOFF.md` |
| 0.C | **Backfill `plan-v1.5.md` §17 Build Changelog** to the extent reasonably possible OR document the gap. Current §17 has four entries (Phase 0.1, 0.2, D.4, L) against ~30 implementation phases. The convention is one-entry-per-commit-set. If backfilling is high-effort, accept the gap explicitly with a one-line note at the top of plan-v1.5 §17 ("Changelog backfill not performed — see git log on branch v1.5 for full phase history") and **commit to entry-per-phase discipline in v1.6 §17 from Phase 0.−2 onward.** | Either backfilled §17 in plan-v1.5 OR an explicit gap-acknowledgement note. | `.claude/plan-v1.5.md` |

### 4.4 The audit-v4 §10.1 close-outs

| # | Task | Deliverable | Files |
|---|------|-------------|-------|
| 0.1 | **Quality Panel cold-open perf debt close-out.** Re-measure Quality Panel first-render cold-open at v1.5 scale (500 tasks × 25 resources × all v1.5 surfaces active — baselines, change orders, variance snapshots, stacked histogram). Identify the slow path. Likely culprits: synchronous DCMA run on first open (memoize or lazy), variance trend chart computing slope inline (memoize), float distribution chart re-bucketing on every open (memoize on `[tasks]`). Fix until the cold-open hits the plan-v1.4 §8 target. Document the fix in `docs/perf-v1.6-quality-panel.md`. **Blocking: no v1.6 capability work until this closes.** | `docs/perf-v1.6-quality-panel.md` (new) with before/after measurements, code-level fix description, regression-prevention note. | `src/components/modals/QualityPanel.tsx`, `src/components/quality/*.tsx`, possibly `src/lib/dcma.ts` if memoization needs to happen one level deeper. `docs/perf-v1.6-quality-panel.md` (new). |
| 0.2 | Re-affirm desktop-first mobile QA defer with a new dated entry in `docs/mobile-qa.md`. v1.6 adds modal surfaces (Reports modal) and a print-mode flow (executive PDF). On mobile the Reports modal renders full-screen at ≤640px — that path inherits v1.0/v1.2 chrome but has never been touched on a real device. The defer remains intentional under desktop-first direction; the dated entry continues the discipline pattern. **Note:** chronic gap is now four audits running. If the firm acquires a physical iPad for v1.7 or v1.8 testing, the gap closes then; until then, the dated defer holds. | One dated paragraph in `docs/mobile-qa.md` referencing v1.6 scope. | `docs/mobile-qa.md` |
| 0.3 | Re-run StatBar + TopBar density audit at 1280px. v1.6 adds the TopBar "Reports" button (one new slot adjacent to "Quality") and nothing to the StatBar itself. Confirm no StatBar change and document the no-op verdict. **If TopBar density at 1280px is now >85%** (the TopBar carries: project name + 6 buttons + baseline dropdown), restructure TopBar before adding Reports — likely group into a "More…" overflow menu. Triggers S7. | `docs/topbar-density-v1.6.md` (new) with screenshot, measurement, verdict. | `docs/topbar-density-v1.6.md` (new), `docs/v1.5-screenshots/topbar-1280.png` (new) |

### 4.5 Chronic-gap explicit deferral (audit v4 §8.3 / §10.3)

| # | Task | Decision |
|---|------|----------|
| 0.D | **Marketing landing v2 pass — explicit deferral for v1.6.** v1.6 produces the first owner-facing deliverable worth screenshotting (executive PDF, S-curve, cash flow). Audit v3 / v4 §8.3 names this as a chronic 3-audit gap. **Decision for v1.6: still deferred.** Rationale: the marketing pass is a separate craft (copy, hero composition, capability framing) that does not belong in the same plan as the capability build that produces its raw material. **Bake into post-v1.6 follow-ups** — after v1.6 ships, the marketing pass should be its own standalone work (one or two commits on a `marketing-v2` branch off `main`, not bundled into v1.7). Audit v5 (Checkpoint 3, post-v1.8) will re-flag this if still untouched. |
| 0.E | **Branch pile-up — decision for v1.6.** `v1.3`, `v1.4`, `v1.5` branches are all preserved per the "keep per pattern" convention since v1.3. **Decision for v1.6: continue keeping.** Rationale: branches are cheap; the audit trail value of preserved version branches exceeds the cleanup value of deleting them. If the count exceeds ~10 preserved branches (current: 3), revisit at that point. No action required for v1.6. |
| 0.F | **`Task.deps[]` direct-write lint rule (audit v3 §3.4 / audit v4 §3.4) — explicit deferral.** Recommended as low-priority since audit v3. Defer to v2.0 (cloud sync re-architects the data layer; that is the right time to make the convention a runtime invariant). v1.6 does not add a lint rule. |

**Gate:** Phase 0 must close cleanly before Phase A begins. Phase 0.−2, 0.−1, 0.0, 0.A, 0.B, 0.C, 0.1, 0.2, 0.3 are all required before Phase A starts. Phase 0.D / 0.E / 0.F are explicit-deferral decisions with no implementation work — they document the path forward. Phase 0.1 (Quality Panel perf close-out) is a hard blocker: if the cold-open does not hit the §8 target after the fix, escalate via stop-and-ping S1.

---

## 5. Architecture & file map

### 5.1 No schema change

S-curve, EVM, cash flow forecast, executive PDF, weekly report are all **derived from existing persisted data** (tasks, dependencies, baselines, resources, assignments, change orders, variance snapshots).

The two carry-over additions DO touch persisted state in a minor additive way:
- `VarianceSnapshot` gains a `compositeHealthScore: number | null` field. **This is additive at the runtime level only** — old snapshots in localStorage that don't carry the field load with `compositeHealthScore = null`, which renders as "no health line" in the variance trend. **No schema bump required** because:
  - `PERSISTED_SCHEMA_VERSION` reflects the *shape* of the persisted state object; this is a backward-compatible field addition on a nested array element.
  - The migration walk does not need to touch existing snapshots — they remain valid v3 records with one fewer field.
  - On midnight tick, new snapshots include the field. Over 30 days the trend line populates organically.

`PERSISTED_SCHEMA_VERSION` stays at **3**. This is deliberate. v1.7 will likely bump to 4 (WBS codes need first-class persistence). A schema-stable v1.6 between schema-changing v1.5 and v1.7 is a clean diff target for the v1.7 migration tests.

If during implementation a real persistence need surfaces (e.g., the team decides to save the PM's preferred report-type ordering), STOP via S2 before introducing it. Saved report preferences are explicitly v2.2.

### 5.2 New files

| File | Purpose |
|---|---|
| `src/lib/scurve.ts` | Pure: `computeSCurve(tasks, baseline, bucketing) → SCurveSeries`. Bucket cumulative planned % and cumulative actual % by week or month depending on project duration. Returns `{ planned: SCurvePoint[], actual: SCurvePoint[], today: SCurvePoint, variance: { actualPct, plannedPct, diff } }`. |
| `src/lib/evm.ts` | Pure: `computeEVM(tasks, baseline, assignments, resources, statusDate) → EVMResult`. PV = baseline-snapshot cumulative planned cost by date. EV = actual progress % × baseline-snapshot total cost. SPI = EV / PV. AC/CPI return null in v1.6. |
| `src/lib/cashflow.ts` | Pure: `computeMonthlyCashFlow(tasks, assignments, resources) → MonthlyCashFlowBucket[]`. Distributes task cost linearly across task workdays, accumulates by calendar month, segments by resource category. |
| `src/lib/reportData.ts` | Pure: `buildExecutiveReport(state, statusDate) → ExecutiveReportData`. Aggregates health score, S-curve thumbnail data, top 3 variances, top 3 risks (DCMA findings sorted by severity), next 5 milestones, SPI. |
| `src/lib/weeklyReport.ts` | Pure: `buildWeeklyReport(state, weekEnding) → WeeklyReportData`. Tasks completed in last 7 days, tasks planned for next 7 days, variances logged this week, change orders logged this week. |
| `src/components/modals/ReportsModal.tsx` | Two-pane modal: left = report-type list, right = preview surface + export controls |
| `src/components/reports/ReportTypeList.tsx` | The left-pane list of available report types |
| `src/components/reports/SCurvePreview.tsx` | Full-size S-curve preview pane (right pane) |
| `src/components/reports/EVMPreview.tsx` | Full-size EVM preview pane (KPI strip + PV/EV chart) |
| `src/components/reports/CashFlowPreview.tsx` | Full-size cash flow preview pane (monthly stacked bars) |
| `src/components/reports/ExecutiveReportPreview.tsx` | A4-portrait preview pane for executive summary report |
| `src/components/reports/WeeklyReportEditor.tsx` | Two-pane editor (auto-content left, narrative right) for weekly report |
| `src/components/reports/charts/SCurveChart.tsx` | The SVG chart itself; reused at thumbnail size in ExecutiveReportPreview and full size in SCurvePreview (`size: 'thumbnail' | 'full'` prop) |
| `src/components/reports/charts/PVEVChart.tsx` | The SVG chart for PV vs EV over time |
| `src/components/reports/charts/CashFlowChart.tsx` | The SVG chart for monthly stacked cash flow bars |
| `src/components/reports/HealthSparkline.tsx` | Tiny inline SVG sparkline for composite health history in HealthScoreBreakdown |
| `src/styles/print-report.css` | Print-mode stylesheet activated by `body.report-print` class. Hides app chrome, renders A4 portrait layout for executive / weekly reports. |
| `tests/unit/lib/scurve.test.ts` | Bucketing edge cases (1-day project, 5-year project, project with no actual progress, project with 100% actual progress); cumulative monotonicity; variance computation |
| `tests/unit/lib/evm.test.ts` | PV monotonicity, EV computation against partial progress, SPI = EV/PV under various states, fallback when no active baseline |
| `tests/unit/lib/cashflow.test.ts` | Linear distribution across workdays, month boundary handling, category segmentation, project spanning multiple years |
| `tests/unit/lib/reportData.test.ts` | Top-3 variance ordering, top-3 risk ordering (DCMA severity), next-5 milestone filter, SPI null fallback |
| `tests/unit/lib/weeklyReport.test.ts` | Window calculation, empty state, change orders in/out of window |
| `tests/e2e/reports-modal.spec.ts` | Open Reports modal → switch between report types → assert each preview renders |
| `tests/e2e/scurve-report.spec.ts` | Load example, capture baseline, advance some tasks to actuals, open Reports → S-curve, assert two lines render |
| `tests/e2e/evm-report.spec.ts` | Load example with cost-loaded tasks, capture baseline, open Reports → EVM, assert KPI strip values and chart |
| `tests/e2e/cashflow-report.spec.ts` | Load example with cost-loaded tasks, open Reports → Cash Flow, assert stacked bars render across project duration |
| `tests/e2e/executive-report.spec.ts` | Load example, capture baseline, open Reports → Executive Summary, assert all 6 sections render, trigger print-mode (via `--print-preview` query param) and assert layout |
| `tests/e2e/weekly-report.spec.ts` | Load example, advance some tasks, open Reports → Weekly Progress, type narrative, assert auto-content + narrative both render |
| `docs/reports.md` | Spec of all 5 report types: data sources, computation rules, layout |

### 5.3 Files modified

| File | What changes |
|---|---|
| `src/types/index.ts` | Add `SCurvePoint`, `SCurveSeries`, `EVMResult`, `MonthlyCashFlowBucket`, `ExecutiveReportData`, `WeeklyReportData`, `ReportType` types. Extend `VarianceSnapshot` with optional `compositeHealthScore?: number \| null`. **No `PERSISTED_SCHEMA_VERSION` bump.** |
| `src/lib/storage.ts` | The v3 walk continues to accept variance snapshots with or without `compositeHealthScore`. No new migration step. |
| `src/lib/health.ts` | Export `computeCompositeHealthScore(state) → number` as a standalone helper (it already exists internally; this exposes it for snapshot capture). |
| `src/hooks/useMidnightTicker.ts` | Snapshot-capture callback also stores `compositeHealthScore` (use the new exported helper). |
| `src/components/App.tsx` | State: `reportsModalOpen: boolean`, `reportsModalSelectedType: ReportType`. Wire ReportsModal. Memoize EVM, S-curve, cashflow, executive report data, weekly report data at App level keyed on their respective inputs. |
| `src/components/topbar/TopBar.tsx` | Add "Reports" button (Phosphor `ChartLine` icon) adjacent to "Quality" in the data/settings cluster. |
| `src/components/modals/QualityPanel.tsx` | `DcmaFindingsTable` defaults to failing-only view with "Show all 14 checks" toggle (audit v4 §10.3 carry). `VarianceTrendChart` gains a "Show health score" toggle that overlays a secondary line. `HealthScoreBreakdown` gains `HealthSparkline` sub-component. |
| `src/components/quality/DcmaFindingsTable.tsx` | Default-failing-only filter; "Show all" toggle; "All 14 passing" empty state. |
| `src/components/variance/VarianceTrendChart.tsx` | Optional second line for composite health score (different stroke color, different Y-axis scale 0–100 secondary). |
| `src/components/quality/HealthScoreBreakdown.tsx` | Inline `HealthSparkline` (last 30 snapshots). |
| `src/components/baseline/BaselineDiffTable.tsx` | Each slipped-task row gets an optional trailing chip cluster of CO numbers linked to the task (audit v4 §10.2 carry). Click chip opens `ChangeOrderManager` with that CO pre-selected. |
| `src/components/modals/PrintPreviewModal.tsx` | A3 Gantt print canvas title bar gets optional `Quality: NN/100` segment (audit v4 §10.3 carry). |
| `src/lib/icons.ts` | Add `ChartLine` (reports button) and `Printer` (export button — already exported, verify). |
| `src/constants.ts` | Add: `SCURVE_BUCKET_WEEKS_MAX = 12` (switch to monthly buckets above this), `CASHFLOW_MAX_MONTHS_DISPLAY = 24` (cap displayed range for very long projects), `EXEC_REPORT_TOP_N = 3`, `EXEC_REPORT_MILESTONE_N = 5`, `WEEKLY_REPORT_WINDOW_DAYS = 7`, `HEALTH_SPARKLINE_DAYS = 30`. |
| `src/styles/tokens.css` | Add: `--scurve-planned`, `--scurve-actual`, `--scurve-today`, `--evm-pv`, `--evm-ev`, `--cashflow-labor`, `--cashflow-equipment`, `--cashflow-material`, `--report-page-bg`, `--report-page-text`, `--variance-line-health` (secondary), `--diff-co-chip-bg`. |
| `src/styles/globals.css` | Import `print-report.css` (scoped to `body.report-print`). |
| `docs/design-system.md` | Document v1.6 tokens. |
| `docs/onboarding-qa.md` | Mention Reports modal as a recommended action after capturing a baseline and entering some actuals. |
| `CHANGELOG.md` | Add `0.6.0` entry on ship. |
| `package.json`, `package-lock.json` | Version bump `0.5.0` → `0.6.0`. |
| `README.md` | Mention reporting & analytics: S-curve, EVM (SPI), cash flow, executive PDF, weekly report. |

### 5.4 Files unchanged (explicit non-goals)

| File | Why we are leaving it alone |
|---|---|
| `src/lib/cpm.ts` | CPM is unchanged. Reports consume CPM output (status, critical path) via existing surface. |
| `src/lib/cost.ts` | Cost rollup is reused as-is for EVM and cashflow inputs. No time-phased rate support added (v1.7+). |
| `src/lib/resourceDemand.ts` | Histograms are unchanged. Cashflow is a separate computation. |
| `src/lib/dcma.ts`, `floatDistribution.ts`, `logicValidation.ts` | Read-only consumers in reports; no changes to the checks themselves. |
| `src/lib/baselines.ts` | Reports consume baseline snapshots via existing helpers. |
| `src/lib/changeOrders.ts` | The CO-chip cluster on BaselineDiffTable uses `aggregateImpacts(taskId, changeOrders)` — already exists. |
| `src/lib/variance.ts` | Snapshot append is unchanged. The optional `compositeHealthScore` field is captured at the call site, not inside `appendVarianceSnapshot`. |
| The Gantt component | No on-Gantt S-curve overlay. (Roadmap puts that explicitly out of scope for the Gantt.) |
| Mobile bottom sheet | No mobile-specific UI for v1.6; Reports modal is desktop-first. Mobile inherits full-screen modal chrome. |
| Marketing page | Marketing v2 pass remains chronic — flag for post-v1.6. |

---

## 6. UI surface map

```
┌─ TopBar ─────────────────────────────────────────────────────────────────────┐
│ MAKE · Project │ Baselines ▾ │ Phases │ Parties │ Resources │ Change │       │
│                                                                Orders │       │
│                                                       Quality │ Reports*     │
│                                                                       ↑ NEW  │
└──────────────────────────────────────────────────────────────────────────────┘

┌─ Reports Modal ──────────────────────────────────────────────────────────────┐
│  Reports                                                            [✕]      │
│  ┌─ Type ──────────────────┐  ┌─ Preview ────────────────────────────────┐   │
│  │ ● S-curve               │  │                                          │   │
│  │ ○ EVM (PV / EV / SPI)   │  │     [preview surface for selected type]  │   │
│  │ ○ Cash flow forecast    │  │                                          │   │
│  │ ○ Executive summary     │  │                                          │   │
│  │ ○ Weekly progress       │  │                                          │   │
│  └─────────────────────────┘  │                          [Export PDF] [CSV]  │
│                                └──────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────┘

┌─ S-curve preview pane ───────────────────────────────────────────────────────┐
│ 100% ┤                                              ╭───────────── planned   │
│      │                                  ╭────────── ╯                        │
│  75% ┤                              ╭───╯                                    │
│      │                          ╭───╯ ╭────────────────── actual            │
│  50% ┤                      ╭───╯  ╭──╯                                      │
│      │                  ╭───╯  ╭──╯                                          │
│  25% ┤              ╭───╯  ╭──╯                                              │
│      │          ╭───╯  ╭──╯                                                  │
│   0% ┴──╴──╴──╴──╴──╴──╴──╴── today (status date) ──╴──╴──╴──╴──╴──╴         │
│       Jan  Feb  Mar  Apr  May  Jun  Jul  Aug  Sep  Oct  Nov  Dec             │
│  Actual 64% · Planned 71% · Variance −7%                                     │
└──────────────────────────────────────────────────────────────────────────────┘

┌─ EVM preview pane ───────────────────────────────────────────────────────────┐
│   PV: $4,820,000     EV: $4,440,000     SPI: 0.92                            │
│   ───────────────────────────────────────────────────────                    │
│   $5M ┤                                  ╭────── PV                          │
│       │                              ╭───╯                                   │
│   $4M ┤                          ╭───╯  ╭───── EV                            │
│       │                      ╭───╯   ╭──╯                                    │
│   $3M ┤                  ╭───╯   ╭───╯                                       │
│       │              ╭───╯   ╭───╯                                           │
│   $2M ┤          ╭───╯   ╭───╯                                               │
│       │      ╭───╯   ╭───╯                                                   │
│   $0  ┴──╴──╴──╴──╴── today ──╴──╴──╴──╴                                     │
│       Jan  Feb  Mar  Apr  May  Jun  Jul  Aug                                 │
│   Note: AC (Actual Cost) tracking not yet implemented — CPI will appear      │
│   when actuals can be entered (v1.7+).                                       │
└──────────────────────────────────────────────────────────────────────────────┘

┌─ Cash flow preview pane ─────────────────────────────────────────────────────┐
│  $800K ┤                                                                     │
│        │             ▓░░                                                     │
│  $600K ┤             ▓▒░          ▓░░                                        │
│        │       ▓░░   ▓▒░    ▓▒░   ▓▒░                                       │
│  $400K ┤   ▓░░ ▓▒░   ▓▒░    ▓▒░   ▓▒░    ▓░░                                │
│        │   ▓▒░ ▓▒░   ▓▒░    ▓▒░   ▓▒░    ▓▒░                                │
│  $200K ┤   ▓▒░ ▓▒░   ▓▒░    ▓▒░   ▓▒░    ▓▒░    ▓░░                         │
│   $0   ┴───╴───╴────╴────╴─────╴────╴────╴────╴─────                         │
│       Jan  Feb  Mar  Apr  May  Jun  Jul  Aug                                 │
│   ▓ labor  ▒ equipment  ░ material                                           │
│   Hover: April 2026 — Labor $310K · Equipment $80K · Material $60K = $450K   │
└──────────────────────────────────────────────────────────────────────────────┘

┌─ Executive summary preview (A4 portrait) ────────────────────────────────────┐
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ Memorial Hospital Phase 2 — Executive Summary                          │  │
│  │ Report date 2026-05-25 · Active baseline Baseline 2 (2026-03-21)       │  │
│  │ ──────────────────────────────────────────────────────────────         │  │
│  │ Schedule Health    78 / 100   ●                                        │  │
│  │ ──────────────────────────────────────────────────────────────         │  │
│  │ S-curve (320×120 thumbnail)                                            │  │
│  │ Actual 64% · Planned 71% · Variance −7%                                │  │
│  │ ──────────────────────────────────────────────────────────────         │  │
│  │ Top variances                                                          │  │
│  │   MEP rough-in       2026-04-15 → 2026-04-23   +8d   $14,200  CO-007  │  │
│  │   Drywall hang       2026-05-02 → 2026-05-08   +6d   $3,400           │  │
│  │   Interior paint     2026-05-15 → 2026-05-19   +4d   $1,800           │  │
│  │ ──────────────────────────────────────────────────────────────         │  │
│  │ Top risks                                                              │  │
│  │   3 orphan tasks (no successor) — DCMA 4                               │  │
│  │   Electrical crew over-allocated weeks 12–14                           │  │
│  │   Float distribution skewed low (median 4d, target 10–20d) — DCMA 6   │  │
│  │ ──────────────────────────────────────────────────────────────         │  │
│  │ Next milestones                                                        │  │
│  │   Foundation complete         2026-06-01                               │  │
│  │   Structure topped out        2026-08-15                               │  │
│  │   Building dried in           2026-10-30                               │  │
│  │   MEP rough-in complete       2026-12-15                               │  │
│  │   Substantial completion      2027-04-20                               │  │
│  │ ──────────────────────────────────────────────────────────────         │  │
│  │ SPI 0.92      (AC / CPI deferred — see Reports → EVM)                 │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                              [Export PDF]    │
└──────────────────────────────────────────────────────────────────────────────┘

┌─ Weekly report editor ───────────────────────────────────────────────────────┐
│  Week ending 2026-05-23                                                      │
│  ┌─ Auto-generated ──────────────┐  ┌─ Narrative ────────────────────────┐  │
│  │ Completed this week (4):       │  │ Highlights                         │  │
│  │   Footing inspection           │  │ ┌────────────────────────────────┐ │  │
│  │   Concrete pour zone A         │  │ │ Foundation work on schedule…   │ │  │
│  │   …                            │  │ └────────────────────────────────┘ │  │
│  │ Planned next week (6):         │  │ Concerns                           │  │
│  │   Wall framing zone A          │  │ ┌────────────────────────────────┐ │  │
│  │   …                            │  │ │ MEP coordination delayed —     │ │  │
│  │ Variances logged (2):          │  │ │ pending RFI-014                │ │  │
│  │   MEP rough-in +3d             │  │ └────────────────────────────────┘ │  │
│  │ Change orders (1):              │  │ Look-ahead                         │  │
│  │   CO-012 site logistics draft  │  │ ┌────────────────────────────────┐ │  │
│  │                                 │  │ │ Owner walk-through 2026-06-01  │ │  │
│  │                                 │  │ └────────────────────────────────┘ │  │
│  └────────────────────────────────┘  └────────────────────────────────────┘  │
│                                                              [Export PDF]    │
└──────────────────────────────────────────────────────────────────────────────┘

┌─ Quality Panel (additions) ──────────────────────────────────────────────────┐
│  DCMA findings (top failing) — Show all 14 checks ▾                          │
│    4. Orphan tasks               FAIL    3 tasks affected                    │
│    6. Float distribution         FAIL    median 4d (target 10–20d)          │
│   14. BEI                        FAIL    0.91 (target ≥0.95)                │
│  ─────────────────────────────────────────────────────                       │
│  Variance trend  ☐ Show health score                                         │
│    [existing chart + optional secondary health line]                         │
│  ─────────────────────────────────────────────────────                       │
│  Health score breakdown   78 / 100                                            │
│    [breakdown rows] + sparkline showing last 30 days ────────                │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 6.1 ReportsModal layout

- Two-pane: left ~220px, right flex.
- Left pane is a vertical list of report-type rows, single-select. Each row: icon (small) + label. Selected row gets a left-edge accent stripe in `--accent`.
- Right pane is the preview surface for the selected report. The surface fills the modal body; export controls live in the modal footer, context-aware per type.
- Modal width: 1120px (~max-content for an A4 portrait preview at 0.6 scale). Modal height: 720px (constrained by viewport).

### 6.2 SCurveChart sizing

- Two render modes selected by prop:
  - `size: 'full'` — used in `SCurvePreview`. Full chart with axes, today line, hover dots, variance summary footer.
  - `size: 'thumbnail'` — used in `ExecutiveReportPreview`. 320×120px. No axis labels (just the two lines + today marker + variance line below).
- X-axis bucketing: `WEEK` if project duration ≤ `SCURVE_BUCKET_WEEKS_MAX` (12 weeks), else `MONTH`.
- Y-axis is always 0–100% cumulative.
- Today marker: vertical hairline at `statusDate` X position; small dot on each line at that X. If statusDate is past project finish, the today marker is omitted.
- Color tokens: planned `--scurve-planned`, actual `--scurve-actual`, today `--scurve-today`.

### 6.3 EVM chart

- Two lines (PV solid, EV dashed) over the same X axis as the S-curve.
- KPI strip above the chart, three cells: PV, EV, SPI. Cells are monospaced, formatted `$NNN,NNN` / `$NNN,NNN` / `0.NN`.
- SPI cell color-coded: green ≥1.00, amber 0.90–0.99, red <0.90.
- Footer note about AC/CPI deferral (single line, dim text).
- Empty state when no active baseline OR when no cost-loaded tasks: "Capture a baseline with cost-loaded tasks to enable EVM."

### 6.4 CashFlowChart

- Stacked vertical bars, one per month.
- Project longer than `CASHFLOW_MAX_MONTHS_DISPLAY = 24` months: chart shows the next 24 months from today (configurable via a "show from" date picker — but that picker is out of v1.6 scope; fixed window for v1.6).
- Hover tooltip: month name + per-category breakdown + monthly total.
- No drill-down on hover (per §2.1 anti-creep).
- Color tokens: labor `--cashflow-labor`, equipment `--cashflow-equipment`, material `--cashflow-material`.

### 6.5 Executive PDF

- A4 portrait (210mm × 297mm). At 96 DPI: ~794×1123 px content area.
- Print-mode CSS activated by `body.report-print` class. Hides app chrome (TopBar, sidebars, Gantt). Renders the executive-report preview at full-page scale.
- Export flow: `Export PDF` button → `document.body.classList.add('report-print')` → `window.print()` → user picks "Save as PDF" in browser print dialog → on `afterprint`, remove class.
- The same `print-report.css` stylesheet covers the weekly report too (different page-class selector).

### 6.6 Weekly report editor

- Two-pane editor.
- Left pane = auto-content from `buildWeeklyReport(state, weekEnding)`. Read-only.
- Right pane = three `<textarea>` fields: Highlights, Concerns, Look-ahead. Each capped at ~600 chars (soft cap with character counter).
- The narrative fields are NOT persisted (no schema change for v1.6). When the modal closes, narratives are lost. **Surface this in the UI** with a small advisory: "Narrative is not saved — export to PDF before closing." Persistence is v2.2 saved-views territory.
- Export PDF uses the same `report-print` flow.

### 6.7 DcmaFindingsTable default + toggle

- Default view: only findings where `passed === false`. Sorted by severity (DCMA-defined ordering).
- "Show all 14 checks" toggle below the table (link-style, monospaced). When toggled, all 14 render with passing ones in dim text.
- Empty state when no failing findings: "All 14 checks passing" with `Check` icon in `--health-green`.

### 6.8 BaselineDiffTable CO-chip cluster

- Each slipped-task row gets a trailing chip cluster after the existing `cost delta` column.
- Chip text: CO number only (e.g., `CO-007`). Multiple COs stack with 4px gap.
- Click opens `ChangeOrderManager` with that CO pre-selected (existing `changeOrderEditingId` flow from v1.5 Phase D).
- If no COs affect the task, no chip cluster renders.
- Token: `--diff-co-chip-bg` (subtle background, hairline border).

### 6.9 Variance trend chart — secondary health line

- "Show health score" toggle in the chart header (default off).
- When on: thin secondary line in `--variance-line-health` over the existing primary line. Y-axis dual-scaled (primary remains variance days, secondary is 0–100% health on the right edge with subtle tick marks).
- Hover tooltip names both values when both lines are visible.

### 6.10 HealthSparkline

- 60px wide × 24px tall, inline at the end of the `HealthScoreBreakdown` card header.
- Renders last 30 days of `compositeHealthScore` from `varianceSnapshots`. Empty state (under 7 snapshots): omit the sparkline.
- No axis labels, no hover. It is a glanceable trend, not a chart.

---

## 7. Architecture impact

### 7.1 State ownership

`App.tsx` continues to own all state. New transient state slices:
- `reportsModalOpen: boolean`
- `reportsModalSelectedType: ReportType` (default `'s-curve'`)
- `weeklyReportNarrative: { highlights: string; concerns: string; lookAhead: string }` — **not persisted** per §6.6
- `dcmaShowAllChecks: boolean` (Quality Panel UI state, default false)
- `varianceTrendShowHealth: boolean` (Quality Panel UI state, default false)

No new persisted state slices. `VarianceSnapshot` gains an optional field; no migration step.

### 7.2 Pure library boundary

All five new lib modules (`scurve.ts`, `evm.ts`, `cashflow.ts`, `reportData.ts`, `weeklyReport.ts`) are pure. They take inputs, return outputs. No React imports. No localStorage touches. Only `storage.ts` knows persistence. v1.3 / v1.4 / v1.5 / v1.6 architectural shape held.

### 7.3 No new dependencies

v1.6 uses only primitives already in the project:
- SVG for all charts (same custom-rendering philosophy as Gantt, histogram, float distribution, variance trend)
- `window.print()` + print-mode CSS for PDF export — no jsPDF, no html2canvas, no pdfmake
- React state for modal open/close
- Phosphor icons (existing dep, add `ChartLine`)
- CSS custom properties for new colors

If a contributor proposes `chart.js`, `d3`, `recharts`, `jspdf`, `html2canvas`, or `pdfmake`, reject at PR review. Surface via S7 if the proposer is the implementation agent.

### 7.4 Memoization plan

Reports computations are O(tasks) or O(tasks × workdays) per render. They must be memoized at the App level keyed on their inputs:

```ts
const sCurve = useMemo(
  () => computeSCurve(tasks, activeBaseline, bucketing),
  [tasks, activeBaseline, bucketing]
);
const evm = useMemo(
  () => computeEVM(tasks, activeBaseline, assignments, resources, statusDate),
  [tasks, activeBaseline, assignments, resources, statusDate]
);
const cashFlow = useMemo(
  () => computeMonthlyCashFlow(tasks, assignments, resources),
  [tasks, assignments, resources]
);
const executiveReport = useMemo(
  () => buildExecutiveReport(state, statusDate),
  [state, statusDate]  // state stitched from above + DCMA + variance
);
```

These memos compute lazily — they fire only when Reports modal is opened (the report previews mount lazily). The Phase 0.1 Quality Panel close-out establishes the memoization pattern; v1.6 reuses it.

### 7.5 Print-mode CSS scope

`src/styles/print-report.css` is scoped to `body.report-print`. Only when the export flow activates this class does the print-mode layout engage. The existing A3 Gantt print mode (`body.print-preview` or similar — verify during implementation) is untouched. **Do not collapse the two print modes into one** — they serve different deliverables (A3 landscape Gantt vs A4 portrait report).

---

## 8. Performance contract

| Metric | Target | Measurement |
|---|---|---|
| Phase 0.1 — Quality Panel cold-open first-render | Hit plan-v1.4 §8 target (the one that was missed in v1.5 Phase 0.2) | `performance.now()` around panel mount |
| S-curve compute (500 tasks, baseline, weekly bucketing) | <30ms | `performance.now()` around `computeSCurve` |
| EVM compute (500 tasks, 25 resources, baseline) | <40ms | `performance.now()` around `computeEVM` |
| Cash flow compute (500 tasks, 25 resources, 24 months) | <50ms | `performance.now()` around `computeMonthlyCashFlow` |
| ExecutiveReport build (full aggregation) | <80ms | `performance.now()` around `buildExecutiveReport` |
| Weekly report build | <20ms | `performance.now()` around `buildWeeklyReport` |
| Reports modal first render with default S-curve type | <150ms | E2E trace |
| Switch between report types (any → any) | <100ms | E2E trace |
| Print-mode class activation → `window.print()` dialog open | <300ms | Manual check |
| Build size delta (v1.5 → v1.6) | <+35KB JS gzipped | `npm run build` bundle report |
| No regression on v1.5 perf baselines | unchanged | Re-run after Phase J |

**Recompute strategy:** Per §7.4, all five computations are memoized at App level. The lazy mount in `ReportsModal` ensures they fire on demand.

---

## 9. Phased task breakdown

Each task ≤3 files, one commit. Phases ordered by dependency.

### Phase 0 — Pre-flight + housekeeping + carry-overs (BLOCKING)

| # | Task | Files |
|---|------|-------|
| 0.−2 | **Pre-flight: verify v1.5 shipped to `main`.** `git fetch origin`, check `git log origin/main` for v1.5 merge, check `git tag` for `v0.5.0`, check `package.json` on `main` reads `0.5.0`. If any fails → S13. | (git) |
| 0.−1 | **Pre-flight: verify clean working tree** (or only `playwright-report/index.html` noise). If anything else dirty → S13. | (git) |
| 0.0 | Create branch `v1.6` from main, push to origin | (git) |
| 0.A | **Housekeeping: refresh `.claude/CLAUDE.md`** (active version, schema version 3, two new Key Design Decisions for pure-lib boundary + modal-print-mode pattern, "Where to Look Next" pointer to plan-v1.6) | `.claude/CLAUDE.md` |
| 0.B | **Housekeeping: update `.claude/AGENT-HANDOFF.md`** to point at v1.6 Codex implementation as next action | `.claude/AGENT-HANDOFF.md` |
| 0.C | **Housekeeping: backfill or gap-acknowledge `plan-v1.5.md` §17 Build Changelog** | `.claude/plan-v1.5.md` |
| 0.1 | **Close Quality Panel cold-open perf debt.** Measure → identify slow path → memoize/lazy-load → re-measure → document. | `src/components/modals/QualityPanel.tsx`, `src/components/quality/*.tsx`, possibly `src/lib/dcma.ts`. `docs/perf-v1.6-quality-panel.md` (new). |
| 0.2 | Re-affirm desktop-first mobile QA defer with dated v1.6 entry | `docs/mobile-qa.md` |
| 0.3 | Re-run StatBar + TopBar density audit at 1280px; document verdict (S7 if TopBar >85%) | `docs/topbar-density-v1.6.md` (new), screenshot |
| 0.D | Document marketing-v2-pass explicit deferral decision (no implementation; recorded in §4.5) | (no file change — decision recorded in this plan) |
| 0.E | Document branch-pile-up continue-keeping decision (no implementation; recorded in §4.5) | (no file change) |
| 0.F | Document `Task.deps[]` lint-rule explicit deferral to v2.0 (no implementation; recorded in §4.5) | (no file change) |

### Phase A — Pure libraries

| # | Task | Files |
|---|------|-------|
| A.1 | Scaffold `src/lib/scurve.ts` with `SCurvePoint`, `SCurveSeries` types and `computeSCurve(tasks, baseline, bucketing)` | `src/lib/scurve.ts` (new), `src/types/index.ts` (extend) |
| A.2 | Unit tests for scurve lib (bucketing, monotonicity, variance) | `tests/unit/lib/scurve.test.ts` (new) |
| A.3 | Scaffold `src/lib/evm.ts` with `EVMResult` type and `computeEVM(tasks, baseline, assignments, resources, statusDate)` | `src/lib/evm.ts` (new), `src/types/index.ts` (extend) |
| A.4 | Unit tests for evm lib (PV monotonicity, EV computation, SPI fallback, no-baseline empty state) | `tests/unit/lib/evm.test.ts` (new) |
| A.5 | Scaffold `src/lib/cashflow.ts` with `MonthlyCashFlowBucket` and `computeMonthlyCashFlow(tasks, assignments, resources)` | `src/lib/cashflow.ts` (new), `src/types/index.ts` (extend) |
| A.6 | Unit tests for cashflow lib (linear distribution, month boundaries, category segmentation, multi-year project) | `tests/unit/lib/cashflow.test.ts` (new) |
| A.7 | Scaffold `src/lib/reportData.ts` with `ExecutiveReportData` and `buildExecutiveReport(state, statusDate)` | `src/lib/reportData.ts` (new), `src/types/index.ts` (extend) |
| A.8 | Unit tests for reportData lib (top-3 ordering for variances + risks, next-5 milestone filter, SPI null fallback) | `tests/unit/lib/reportData.test.ts` (new) |
| A.9 | Scaffold `src/lib/weeklyReport.ts` with `WeeklyReportData` and `buildWeeklyReport(state, weekEnding)` | `src/lib/weeklyReport.ts` (new), `src/types/index.ts` (extend) |
| A.10 | Unit tests for weeklyReport lib (window calculation, empty state, COs in/out of window) | `tests/unit/lib/weeklyReport.test.ts` (new) |
| A.11 | Expose `computeCompositeHealthScore` as a standalone helper from `src/lib/health.ts` (used by midnight ticker for snapshot capture) | `src/lib/health.ts` |
| A.12 | Document the five report types in `docs/reports.md` | `docs/reports.md` (new) |

### Phase B — Variance snapshot health field

| # | Task | Files |
|---|------|-------|
| B.1 | Extend `VarianceSnapshot` type with optional `compositeHealthScore?: number \| null`. Confirm no schema bump needed (additive field on nested array element). | `src/types/index.ts` |
| B.2 | Update midnight ticker callback to capture `compositeHealthScore` via the v1.6 A.11 helper | `src/hooks/useMidnightTicker.ts`, `src/components/App.tsx` |
| B.3 | Unit test for snapshot append with health field; verify legacy snapshots (no field) still load | `tests/unit/lib/variance.test.ts` (extend), `tests/unit/lib/storage.test.ts` (extend) |

### Phase C — Reports modal shell

| # | Task | Files |
|---|------|-------|
| C.1 | `ReportsModal.tsx` shell with two-pane layout + `useDialogA11y`; opens via App state | `src/components/modals/ReportsModal.tsx` (new) |
| C.2 | `ReportTypeList.tsx` left-pane component | `src/components/reports/ReportTypeList.tsx` (new) |
| C.3 | TopBar "Reports" button (Phosphor `ChartLine`) opens modal | `src/components/topbar/TopBar.tsx`, `src/lib/icons.ts`, `src/components/App.tsx` |
| C.4 | State wiring: `reportsModalOpen`, `reportsModalSelectedType` (default `'s-curve'`) in App.tsx; memoize all five compute outputs at App level | `src/components/App.tsx` |

### Phase D — S-curve report

| # | Task | Files |
|---|------|-------|
| D.1 | `SCurveChart.tsx` — SVG chart with `size: 'full' \| 'thumbnail'` prop, today marker, hover dots | `src/components/reports/charts/SCurveChart.tsx` (new) |
| D.2 | `SCurvePreview.tsx` — preview pane wrapper consuming memoized `sCurve` from App | `src/components/reports/SCurvePreview.tsx` (new) |
| D.3 | Tokens for scurve lines | `src/styles/tokens.css` |
| D.4 | Wire SCurvePreview into ReportsModal right pane | `src/components/modals/ReportsModal.tsx` |

### Phase E — EVM report

| # | Task | Files |
|---|------|-------|
| E.1 | `PVEVChart.tsx` — SVG chart (two lines, today marker, dollar Y-axis) | `src/components/reports/charts/PVEVChart.tsx` (new) |
| E.2 | `EVMPreview.tsx` — preview pane with KPI strip (PV / EV / SPI) and chart | `src/components/reports/EVMPreview.tsx` (new) |
| E.3 | Empty state copy: "Capture a baseline with cost-loaded tasks to enable EVM." | `src/components/reports/EVMPreview.tsx` |
| E.4 | AC/CPI deferral footer note | `src/components/reports/EVMPreview.tsx` |
| E.5 | Tokens for PV / EV lines | `src/styles/tokens.css` |
| E.6 | Wire EVMPreview into ReportsModal | `src/components/modals/ReportsModal.tsx` |

### Phase F — Cash flow report

| # | Task | Files |
|---|------|-------|
| F.1 | `CashFlowChart.tsx` — SVG stacked bars, monthly buckets, hover tooltip | `src/components/reports/charts/CashFlowChart.tsx` (new) |
| F.2 | `CashFlowPreview.tsx` — preview pane wrapper | `src/components/reports/CashFlowPreview.tsx` (new) |
| F.3 | Tokens for category fills | `src/styles/tokens.css` |
| F.4 | Wire CashFlowPreview into ReportsModal | `src/components/modals/ReportsModal.tsx` |

### Phase G — Executive summary report

| # | Task | Files |
|---|------|-------|
| G.1 | `ExecutiveReportPreview.tsx` — A4-portrait preview layout, six sections per §6.5 | `src/components/reports/ExecutiveReportPreview.tsx` (new) |
| G.2 | Embed `SCurveChart size="thumbnail"` | `src/components/reports/ExecutiveReportPreview.tsx` |
| G.3 | `src/styles/print-report.css` — print-mode stylesheet activated by `body.report-print`; A4 portrait sizing | `src/styles/print-report.css` (new), `src/styles/globals.css` (import) |
| G.4 | Export-to-PDF flow: button → add class → `window.print()` → remove class on `afterprint` | `src/components/modals/ReportsModal.tsx`, `src/components/reports/ExecutiveReportPreview.tsx` |
| G.5 | Wire ExecutiveReportPreview into ReportsModal | `src/components/modals/ReportsModal.tsx` |

### Phase H — Weekly progress report

| # | Task | Files |
|---|------|-------|
| H.1 | `WeeklyReportEditor.tsx` — two-pane editor, auto-content + 3 narrative fields | `src/components/reports/WeeklyReportEditor.tsx` (new) |
| H.2 | Narrative state in App.tsx (transient, not persisted); advisory copy "Narrative is not saved — export before closing" | `src/components/App.tsx`, `src/components/reports/WeeklyReportEditor.tsx` |
| H.3 | Export-to-PDF flow reuses Phase G print-mode flow with a different page class | `src/styles/print-report.css`, `src/components/reports/WeeklyReportEditor.tsx` |
| H.4 | Wire WeeklyReportEditor into ReportsModal | `src/components/modals/ReportsModal.tsx` |

### Phase I — Audit v4 carry-overs

| # | Task | Files |
|---|------|-------|
| I.1 | `DcmaFindingsTable` default-failing-only + "Show all 14 checks" toggle + "All 14 passing" empty state (audit v4 §10.3) | `src/components/quality/DcmaFindingsTable.tsx` |
| I.2 | `VarianceTrendChart` "Show health score" toggle + secondary line rendering (audit v4 §10.2) | `src/components/variance/VarianceTrendChart.tsx`, `src/styles/tokens.css` |
| I.3 | `HealthSparkline.tsx` (60×24px inline) + embed in `HealthScoreBreakdown` (audit v4 §10.2) | `src/components/reports/HealthSparkline.tsx` (new), `src/components/quality/HealthScoreBreakdown.tsx` |
| I.4 | `BaselineDiffTable` CO-chip cluster on slipped-task rows (audit v4 §10.2) | `src/components/baseline/BaselineDiffTable.tsx`, `src/styles/tokens.css` |
| I.5 | A3 Gantt print canvas title bar `Quality: NN/100` segment (audit v4 §10.3) | `src/components/modals/PrintPreviewModal.tsx` |

### Phase J — Empty / loading / error states

| # | Task | Files |
|---|------|-------|
| J.1 | ReportsModal empty state when no tasks loaded: "Load a schedule to generate reports." | `src/components/modals/ReportsModal.tsx` |
| J.2 | SCurvePreview empty state: no baseline → "Capture a baseline to enable the S-curve." | `src/components/reports/SCurvePreview.tsx` |
| J.3 | CashFlowPreview empty state: no cost-loaded tasks → "Assign costed resources to enable cash flow forecast." | `src/components/reports/CashFlowPreview.tsx` |
| J.4 | ExecutiveReportPreview empty state composites: missing baseline AND missing cost shows aggregate guidance | `src/components/reports/ExecutiveReportPreview.tsx` |
| J.5 | Loading bar (2px) reuse for any preview that takes >100ms first render | individual preview files |

### Phase K — E2E coverage

| # | Task | Files |
|---|------|-------|
| K.1 | `tests/e2e/reports-modal.spec.ts` — open modal, switch between all 5 types, assert previews render | `tests/e2e/reports-modal.spec.ts` (new) |
| K.2 | `tests/e2e/scurve-report.spec.ts` — capture baseline, advance actuals, assert two lines render with variance summary | `tests/e2e/scurve-report.spec.ts` (new) |
| K.3 | `tests/e2e/evm-report.spec.ts` — cost-loaded schedule, capture baseline, assert KPI strip + chart + AC deferral note | `tests/e2e/evm-report.spec.ts` (new) |
| K.4 | `tests/e2e/cashflow-report.spec.ts` — cost-loaded schedule, assert stacked bars with three category fills | `tests/e2e/cashflow-report.spec.ts` (new) |
| K.5 | `tests/e2e/executive-report.spec.ts` — assert all 6 sections render; activate print-mode via test hook; assert print-mode layout | `tests/e2e/executive-report.spec.ts` (new) |
| K.6 | `tests/e2e/weekly-report.spec.ts` — assert auto-content sections render; type narrative; assert narrative-not-saved advisory; trigger export | `tests/e2e/weekly-report.spec.ts` (new) |
| K.7 | Extend `tests/e2e/a11y.spec.ts` to include ReportsModal and each preview pane in axe sweep | `tests/e2e/a11y.spec.ts` |
| K.8 | Extend `tests/e2e/quality-panel.spec.ts` for default-failing-only DCMA view + "Show all" toggle + health sparkline + variance-trend secondary line | `tests/e2e/quality-panel.spec.ts` |
| K.9 | Extend `tests/e2e/baseline-compare.spec.ts` for CO-chip cluster on slipped-task rows | `tests/e2e/baseline-compare.spec.ts` |

### Phase L — Print + docs

| # | Task | Files |
|---|------|-------|
| L.1 | Print canvas summary mode integration test for new `Quality: NN/100` segment + existing baseline header | manual + screenshot in `docs/v1.6-screenshots/` |
| L.2 | Update `docs/design-system.md` with v1.6 tokens (scurve, evm, cashflow, report-page, variance-line-health, diff-co-chip-bg) | `docs/design-system.md` |
| L.3 | Update `docs/onboarding-qa.md` mentioning Reports as a recommended action after capturing a baseline | `docs/onboarding-qa.md` |
| L.4 | Update `docs/dcma-checks.md` noting the default-failing-only view in v1.6 | `docs/dcma-checks.md` |

### Phase M — Release hygiene

| # | Task | Files |
|---|------|-------|
| M.1 | `CHANGELOG.md` entry for `0.6.0` | `CHANGELOG.md` |
| M.2 | `package.json` + `package-lock.json` version bump to `0.6.0` | `package.json`, `package-lock.json` |
| M.3 | README update — reporting & analytics features | `README.md` |
| M.4 | Run all gates: `npm run lint`, `npm run type-check`, `npm run test:unit`, `npm run build`, `npm run test:e2e` | — |
| M.5 | Open PR `v1.6 → main`, squash merge after green CI | git |
| M.6 | Tag `v0.6.0` on the merge commit on `main` | git tag |
| M.7 | Update `version-status.md` → v1.6 ✅ shipped; no checkpoint fires here (next checkpoint is Checkpoint 3 after v1.8) | `.claude/version-status.md` |
| M.8 | Append final Build Changelog entry in this file | `.claude/plan-v1.6.md` §17 |
| M.9 | Update `AGENT-HANDOFF.md` — next action: Claude authors `plan-v1.7.md` (WBS deepening) | `.claude/AGENT-HANDOFF.md` |

---

## 10. Parallel vs sequential

| Parallel group | Tasks | Why |
|---|---|---|
| **G1a** | 0.−2 → 0.−1 → 0.0 (sequential — pre-flight gates the branch) | Pre-flight must pass before branching |
| **G1b** | 0.A, 0.B, 0.C, 0.1, 0.2, 0.3 in parallel after 0.0 | Housekeeping doc refreshes + three independent close-outs (different files) |
| **G1c** | 0.D, 0.E, 0.F — decision-only entries, no implementation | Recorded in §4.5; no commit required |
| **G2** | A.1+A.2, A.3+A.4, A.5+A.6, A.7+A.8, A.9+A.10 in parallel | Five independent pure libs with independent test files |
| **G3** | D, E, F can run in parallel after C (modal shell) lands | Each preview pane is independent |
| **G4** | I.1, I.2, I.3, I.4, I.5 in parallel | Five independent audit-carry surfaces |
| **G5** | J.1–J.5 in parallel after D, E, F, G, H land | Empty states across different files |
| **G6** | K.1–K.6 can run in parallel after each report type's surface lands | One E2E spec per report type |

| Sequential | Depends on | Why |
|---|---|---|
| Phase A | Phase 0 | Branch + Quality Panel perf close-out first |
| Phase B | Phase A.11 | Health-score helper export precedes snapshot capture wiring |
| Phase C | Phase A | Modal shell consumes lib outputs via memoized App-level data |
| Phase D | Phase C + A.1+A.2 | Preview pane needs modal + lib |
| Phase E | Phase C + A.3+A.4 | Same pattern |
| Phase F | Phase C + A.5+A.6 | Same pattern |
| Phase G | Phase C + A.7+A.8 + D (thumbnail) | Executive report embeds S-curve thumbnail |
| Phase H | Phase C + A.9+A.10 | Weekly report uses Phase G print-flow plumbing |
| Phase I | Phase B (for health score parts) | Health sparkline + variance trend secondary line consume snapshot health field |
| Phase J | Phase D, E, F, G, H | Empty states need previews to exist |
| Phase K | Phase D, E, F, G, H, I | E2E covers integrated surface |
| Phase L | Phase G, I | Print canvas changes after Phase I |
| Phase M | All other phases | Release |

**Critical path:** 0.−2 → 0.−1 → 0.0 → (0.A/0.B/0.C + 0.1/0.2/0.3 parallel) → A → C → G → I → K → M. Phases D/E/F/H join the parallel work once C lands.

---

## 11. Testing strategy

### 11.1 Unit tests (new)

| Module | Coverage |
|---|---|
| `lib/scurve.ts` | Bucketing weekly vs monthly threshold; 1-day project edge; 5-year project; project with no actual progress (actual = flat 0); project at 100% complete (actual = flat 100); cumulative monotonicity; variance computation correctness; today marker when statusDate is before / during / after project window. |
| `lib/evm.ts` | PV monotonicity; EV computation against varied pct values; SPI = EV/PV; SPI fallback when PV = 0 (return null, not Infinity); empty state when no active baseline; empty state when no cost-loaded tasks; AC and CPI return null in v1.6 base. |
| `lib/cashflow.ts` | Linear distribution within task workdays; month boundary handling (task spanning two months); category segmentation; multi-year project (24-month display cap); zero-cost project (empty buckets); material vs labor/equipment distribution semantics preserved from v1.3. |
| `lib/reportData.ts` | Top-3 variance ordering (sorted by slip days desc); top-3 risk ordering (DCMA severity); next-5 milestone filter (excludes past milestones); SPI null fallback; health score = composite from `health.ts`. |
| `lib/weeklyReport.ts` | Window calculation (last 7 days for completed, next 7 days for planned); empty state when no activity; COs included only if `createdAt` within last 7 days; variances logged this week filter. |
| `lib/health.ts` (extend) | `computeCompositeHealthScore` standalone helper returns identical value to v1.5 inlined computation; idempotent. |
| `lib/variance.ts` (extend) | Snapshot append with `compositeHealthScore` field; snapshot append without field (legacy); trimming preserves both shapes. |
| `lib/storage.ts` (extend) | Round-trip with mixed snapshots (some with health, some without); no schema bump verification. |

**Target:** ≥320 unit tests after Phase A (currently 220 post-v1.5).

### 11.2 E2E tests (Playwright)

| Spec | Flow |
|---|---|
| `tests/e2e/reports-modal.spec.ts` (new) | Open modal, switch between all 5 types, assert previews render and modal title updates |
| `tests/e2e/scurve-report.spec.ts` (new) | Capture baseline, advance actuals via task panel, open S-curve, assert two lines + today marker + variance summary |
| `tests/e2e/evm-report.spec.ts` (new) | Cost-loaded schedule, capture baseline, open EVM, assert KPI strip (PV/EV/SPI), assert AC/CPI deferral note |
| `tests/e2e/cashflow-report.spec.ts` (new) | Cost-loaded schedule, open Cash Flow, assert stacked bars with three category fills, hover one month, assert tooltip |
| `tests/e2e/executive-report.spec.ts` (new) | Assert all 6 sections, activate print-mode via test hook (`?print-preview=true` query param), assert print layout |
| `tests/e2e/weekly-report.spec.ts` (new) | Assert auto-content sections, type narrative, assert advisory, trigger export |
| `tests/e2e/a11y.spec.ts` (extend) | Add ReportsModal + 5 preview panes + WeeklyReportEditor to axe sweep |
| `tests/e2e/quality-panel.spec.ts` (extend) | Default-failing-only DCMA view; "Show all 14 checks" toggle; variance trend "Show health score" toggle; health sparkline (mock 7+ snapshots) |
| `tests/e2e/baseline-compare.spec.ts` (extend) | CO-chip cluster on slipped-task rows; click chip opens ChangeOrderManager |

**Target:** ≥28 E2E specs after Phase K (currently 19 post-v1.5).

### 11.3 Accessibility tests

- All new modals (`ReportsModal`) use `useDialogA11y` (Tab/Shift+Tab/Escape contract).
- All new charts expose meaningful `aria-label` describing what they show + variance summary.
- Narrative textareas have explicit `<label>` associations.
- Print-mode CSS does not break screen-reader output of preview content (preview is the same DOM as print; print just hides chrome).
- Sparkline has `aria-label` describing 30-day health trend.

### 11.4 Performance verification

After Phase K, re-run perf baseline at v1.5 scale with v1.6 features active. Verify:
- Phase 0.1 Quality Panel cold-open holds the §8 target.
- S-curve / EVM / cashflow / executive / weekly compute targets met per §8.
- Reports modal first-render <150ms target met.
- Switch-between-types <100ms target met.
- No regression on v1.5 perf baselines.
- Build size delta <+35KB gzipped.

### 11.5 Manual QA

| Path | Why manual |
|---|---|
| Capture a baseline, advance 30% of tasks to actuals, open S-curve report | Subjective — does the curve shape match expectation? Is the variance summary clear? |
| Cost-loaded schedule with 5+ resources, open Cash Flow | Visual density — confirm stacked bars stay legible across 24 months |
| Open Executive Summary → Export PDF → save to disk → open the PDF | The end-to-end deliverable — does it look professional? |
| Open Weekly Progress → type narrative → close modal → reopen | Confirm narrative loss advisory works and is acted upon |
| Print A3 Gantt with new `Quality: NN/100` segment | Header band fits, color-coding renders correctly |
| QualityPanel with all 14 DCMA checks passing | "All 14 passing" empty state renders correctly |

---

## 12. Quality gate — Gate 2 checklist

**Branch hygiene**
- [x] Plan reminds of the one-branch-per-version rule
- [x] AGENTS.md § Conventions codifies the rule as permanent (since v1.4)

**Pre-flight & housekeeping**
- [x] Phase 0.−2 verifies v1.5 merged to `main` and `v0.5.0` tagged (gates branch creation; S13 if fails)
- [x] Phase 0.−1 verifies clean working tree (or only known `playwright-report/index.html` noise)
- [x] Phase 0.A refreshes `.claude/CLAUDE.md` (stale since v1.2)
- [x] Phase 0.B repoints `.claude/AGENT-HANDOFF.md` for Codex v1.6 implementation
- [x] Phase 0.C backfills or gap-acknowledges `plan-v1.5.md` §17 Build Changelog
- [x] Phase 0.D / 0.E / 0.F document explicit deferrals (marketing v2, branch pile-up, `Task.deps[]` lint)

**Audit-v4 carry-overs**
- [x] Phase 0.1 closes Quality Panel cold-open perf debt (blocking — audit v4 §10.1)
- [x] Phase 0.2 re-affirms desktop-first mobile QA defer (4 audits running — explicitly noted)
- [x] Phase 0.3 re-runs StatBar + TopBar density audit (S7 if >85%)
- [x] Phase I covers all four "should fix" / "nice to have" carry-overs from audit v4 §10.2 / §10.3

**Architecture**
- [x] Reports computations live in pure `src/lib/*` modules (scurve, evm, cashflow, reportData, weeklyReport)
- [x] **Schema stays at v3** — audit v4 §10.4 named the value of a stable v1.6
- [x] No new runtime dependencies (no chart libs, no PDF libs)
- [x] PDF export via `window.print()` against print-mode CSS
- [x] Custom SVG for all charts — same render-path philosophy as Gantt
- [x] App.tsx remains the single state owner; new transient state slices only (narrative + UI toggles)
- [x] Memoization plan at App level (§7.4)

**Task breakdown**
- [x] All new files listed in §5.2
- [x] All modified files listed in §5.3
- [x] Each task ≤3 files / one commit
- [x] Parallel groups identified
- [x] Dependencies between phases explicit

**Testing**
- [x] Unit tests planned for every new pure module
- [x] E2E spec planned for each report type and each carry-over surface
- [x] axe a11y sweep extended to all new modal + preview surfaces
- [x] Performance targets defined with measurement instructions
- [x] Phase 0.1 has a measurable success criterion (hit plan-v1.4 §8 target)

**Discipline**
- [x] Scope-creep traps from §3.2 explicitly excluded
- [x] No chart libraries (CLAUDE.md design decision #1)
- [x] No PDF libraries (`window.print()` only)
- [x] No `AC` / `CPI` in v1.6 base scope (deferred to v1.7+)
- [x] No saved-report-templates (deferred to v2.2)
- [x] Visual changes preserve v1.2's de-vibecoded posture
- [x] Executive PDF is monospaced, one-page A4, no logos / gradients / KPI tiles
- [x] All charts single-series or two-series only — no donuts, no heatmaps, no RAG dots
- [x] Codex operating rules embedded at top of plan

Gate 2 passes. Plan is ready to execute.

---

## 13. Acceptance criteria — v1.6 ship gate

**Branch**
- [ ] All v1.6 commits live on branch `v1.6`
- [ ] Ship merges via PR `v1.6 → main`
- [ ] Tag `v0.6.0` placed on the merge commit
- [ ] Branch deletion deferred (kept per v1.3 / v1.4 / v1.5 pattern)

**Pre-flight & housekeeping (Phase 0)**
- [ ] `main` carries v1.5 merge commit; `v0.5.0` tag present; `package.json` on `main` reads `0.5.0`
- [ ] `.claude/CLAUDE.md` refreshed (active version, schema version 3, design decisions, plan pointer)
- [ ] `.claude/AGENT-HANDOFF.md` repointed to v1.6 Codex implementation
- [ ] `plan-v1.5.md` §17 either backfilled or gap-acknowledged
- [ ] `plan-v1.6.md` §17 maintained entry-per-phase from Phase 0.−2 onward

**Carry-overs from audit v4**
- [ ] `docs/perf-v1.6-quality-panel.md` exists; Quality Panel cold-open hits plan-v1.4 §8 target
- [ ] `docs/mobile-qa.md` carries a dated v1.6 desktop-first defer entry
- [ ] `docs/topbar-density-v1.6.md` exists with verdict
- [ ] `DcmaFindingsTable` defaults to failing-only view with "Show all" toggle
- [ ] `VarianceTrendChart` has "Show health score" toggle and renders secondary line
- [ ] `HealthSparkline` renders inline in `HealthScoreBreakdown`
- [ ] `BaselineDiffTable` shows CO-chip clusters on slipped-task rows
- [ ] A3 Gantt print canvas title bar shows optional `Quality: NN/100` segment

**Capability**
- [ ] Reports modal opens from TopBar
- [ ] S-curve report renders two lines (planned + actual), today marker, variance summary
- [ ] EVM report renders KPI strip (PV / EV / SPI) and PV/EV chart; AC/CPI deferral note shown
- [ ] Cash flow report renders monthly stacked bars by category
- [ ] Executive summary renders all 6 sections + S-curve thumbnail; print-mode CSS produces A4 portrait layout
- [ ] Weekly progress report renders auto-content + 3 narrative fields with not-saved advisory
- [ ] `VarianceSnapshot` carries `compositeHealthScore` when captured at midnight
- [ ] Midnight ticker captures health score alongside variance

**Discipline**
- [ ] `PERSISTED_SCHEMA_VERSION` stays at 3 (no schema bump)
- [ ] No new runtime dependencies (no chart libs, no PDF libs)
- [ ] No new gradients, card spam, generic CTAs, KPI tiles
- [ ] Every new icon is Phosphor from `src/lib/icons.ts`
- [ ] No hardcoded hex in any new component
- [ ] All new colors are tokens
- [ ] No `any`, no force-unwrap, TypeScript strict still clean
- [ ] All charts custom SVG; no chart-library imports

**Trust**
- [ ] `npm run lint` clean
- [ ] `npm run type-check` clean
- [ ] `npm run test:unit` green (target: ≥320 tests after Phase A)
- [ ] `npm run build` clean; bundle delta <+35KB gzipped vs v1.5
- [ ] `npm run test:e2e` green (target: ≥28 specs after Phase K)
- [ ] Phase 0.1 perf close-out documented and verified
- [ ] CI on `v1.6` and on the merge to `main` verified green
- [ ] CHANGELOG, README, version bump landed
- [ ] `v0.6.0` tagged

---

## 14. Risks & mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| **Quality Panel cold-open perf debt does not close cleanly in Phase 0.1** | High | S1 triggers. Document the measurement, identify the slow path, attempt fixes (memoize DCMA result, lazy-mount chart sub-components, defer secondary-line rendering until toggle). If still missing target after a reasonable effort, surface to human — do not "approve and defer" a second time. |
| **Browser print fidelity varies across Chrome / Firefox / Safari** | High | Test print-mode CSS in all three major browsers during Phase G. Pin layout dimensions in mm (A4) not px. Use `@page` rules. Document any browser-specific quirks in `docs/reports.md`. **Manual QA only — automated print fidelity testing is not in scope.** |
| **Executive PDF doesn't fit on one A4 page when section data is dense** (5 long task names, 5 long milestone names) | Medium | Truncate task/milestone names with ellipsis at fixed column widths. Cap top variances / risks at 3, milestones at 5 (`EXEC_REPORT_TOP_N`, `EXEC_REPORT_MILESTONE_N`). If overflow still occurs, prioritize sections in order: health → S-curve → top variances → top risks → next milestones → SPI. **Drop SPI line if overflow forces it; never split into two pages in v1.6.** |
| **EVM PV/EV math diverges from industry standard under partial cost-loading** (some tasks costed, others not) | Medium | Document the v1.6 assumption: PV and EV are computed only over cost-loaded tasks; uncosted tasks are excluded from EVM (with a footer note "EVM excludes N uncosted tasks"). This is the right call — including uncosted tasks would deflate EV. |
| **Cash flow distribution is misleading for lumpy material costs** | Low | Audit v3 §5.4 already flagged this for the v1.6 cash flow report. v1.6 distributes material linearly (consistent with v1.3 `resourceDemand.ts:43`). Document in `docs/reports.md` that material distribution is a linear approximation; lumpy delivery scheduling is v2.x. |
| **"Show all 14 checks" toggle in DcmaFindingsTable hides current QualityPanel test snapshots** | Medium | Update `quality-panel.spec.ts` to toggle "Show all" before asserting individual check rows. Adjust any test that relied on the default-show-all behavior. |
| **Weekly report narrative loss when modal closes** | Medium | Strong advisory copy. Optional: a "save draft" prompt on modal close if narrative has unsaved content. **Out of v1.6 scope** — explicit narrative loss is the v1.6 contract; v2.2 saved views handle persistence. |
| **`window.print()` + class flip race condition** producing blank PDF | Medium | Add a `requestAnimationFrame` between `add('report-print')` and `window.print()` to let the DOM settle. Test in Chrome + Firefox + Safari. |
| **S-curve bucketing decision (week vs month) misfires near the 12-week boundary** | Low | The threshold is `SCURVE_BUCKET_WEEKS_MAX = 12`. Edge case: project duration ~12 weeks switches bucketing mid-development. Decision: projects ≤ 12 weeks use weekly; > 12 weeks use monthly. Document and test. |
| **Composite health snapshot field bloats `varianceSnapshots` array** | Low | Already capped at 365 per baseline via `trimSnapshots`. One more number per row is negligible (~8 bytes). |
| **Schema-stable v1.6 promise breaks if persistence creeps in** | High | Sectioned out in §2.2 + §5.1. S2 triggers if any phase wants to add persistence. Strictly forbidden in v1.6. |
| **TopBar density tips over 1280px after adding "Reports" button** | Medium | Phase 0.3 measures first. If >85%, restructure TopBar via overflow menu before adding the button. Do not "approve and ship" past saturation. |
| **Stop-and-ping triggers ignored** | High | Codified at top of plan + listed in §16. Every phase boundary reads the rules. |
| **Branch hygiene drift** | High | Codified in AGENTS.md; reminder at top of plan; verification step in Phase 0.0. |

---

## 15. Out of scope (deferred — reaffirmed)

See §3.2 for the canonical list. Highlights:

- **v1.7** — Standard WBS coding + roll-up summary pills + hierarchy depth validation + **AC (Actual Cost) input form + CPI computation** + DCMA check 15 (resource over-allocation as quality finding)
- **v1.8** — Project calendar overlay + per-resource calendars + delay tracking + shift patterns
- **v1.9** — P6 / MPP / Procore integration
- **v2.0** — Cloud sync + multi-user + change-order approval routing + audit trail + comments
- **v2.1** — Portfolio dashboard + cross-project resources + project templates
- **v2.2** — Density modes + saved views + bulk edit + drag dependencies + offline mode + variance trend interactivity + per-task variance trends + **saved report templates** + drag-to-scrub on charts + weekly-report narrative persistence

If a v1.6 PR includes any of the above, reject. Point at this section.

---

## 16. Stop-and-ping points (implementation agent pauses)

These are decisions the implementation agent must NOT make alone. Pause, surface, wait for human.

| # | Trigger | What to surface |
|---|---------|-----------------|
| **S1** | Phase 0.1 — Quality Panel cold-open perf debt does not close after first round of fixes | Stop. Surface the measurements, the attempted fixes, and the remaining gap. Do not "approve and defer" a second time — audit v4 §10.1 named this as the blocking condition. |
| **S2** | Any phase requires `PERSISTED_SCHEMA_VERSION` bump or new persisted-state field beyond the additive `compositeHealthScore` on snapshots | Stop. v1.6 is schema-stable per §5.1 and audit v4 §10.4. Surface the need before bumping. |
| **S3** | Any phase requires a new runtime dependency (chart library, PDF library, etc.) | Stop. Surface the dependency, alternatives rejected, and bundle-size impact. v1.6 forbids new deps. |
| **S4** | Executive PDF or weekly report overflows one A4 page on a representative schedule (e.g., 500-task fixture) | Stop. Default behavior is to truncate via §14 priority order. Surface for confirmation if a different priority order seems warranted. |
| **S5** | Phase K E2E print-mode tests fail on a specific browser engine | Stop. Surface the engine + symptom. Decide between fixing print-mode CSS, restricting export to Chrome only with documented caveat, or deferring browser-fidelity work. |
| **S6** | EVM math diverges from expected industry-standard SPI for a representative cost-loaded fixture | Stop. Surface the input, the computed PV/EV/SPI, and the expected value. Do not paper over with a constant. |
| **S7** | Phase 0.3 — TopBar density at 1280px is >85% before adding Reports button | Stop. Surface the screenshot + measurement. Either restructure TopBar via overflow menu or defer Reports button to a TopBar-redesign phase. |
| **S8** | Cash flow distribution diverges from expected output on a fixture with cross-month tasks | Stop. Surface the linear-distribution assumption and the divergence. Confirm before adjusting. |
| **S9** | Phase 0.0 — branch `v1.6` already exists or local tree is dirty | Stop. Surface state. Do not force-push, do not auto-delete. |
| **S10** | Phase 0.1 measurement reveals the Quality Panel cold-open was NEVER actually missing the target (i.e., the v1.5 Phase 0.2 measurement was wrong) | Stop. Document the new measurement, surface for confirmation, and downgrade the carry-over to "verify and document" rather than "fix." |
| **S11** | Composite health score history captured on midnight tick exceeds 365 entries unexpectedly | Stop. Verify `trimSnapshots` is being called on the new field. Surface for fix direction. |
| **S12** | The print-mode CSS conflicts with the existing A3 Gantt print mode (both classes inadvertently active, or one breaks the other) | Stop. The two print modes must be independently activatable. Surface the conflict, do not collapse them into one. |
| **S13** | Pre-flight (Phase 0.−2 / 0.−1) fails: `v0.5.0` tag missing on `main`, v1.5 merge commit absent, `main` `package.json` not at `0.5.0`, or working tree dirty beyond the known `playwright-report/index.html` noise | Stop. Do not branch `v1.6`. Surface the state of `main`, the missing artefact, and wait for direction. The human actions for v1.5 PR + tag may still be pending — do not work around. |

If none of these trigger, the agent proceeds phase by phase without further pings until Phase M.5 (the PR open) and Phase M.7 (the version-status update — which is itself the next stop-and-ping, as Claude takes over to write `plan-v1.7.md`).

---

## 17. Build Changelog

> Codex appends an entry here per phase commit set. Format follows plan-v1.5.md §17 and plan-v1.4.md §17.

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

### Phase 0.-1 — Working tree verification

- Scope
  - Verified branch state on `v1.6`.
  - Verified working tree contains only known recurring noise (`playwright-report/index.html`).
- Files touched
  - none
- Verification
  - `git branch --show-current` → `v1.6`
  - `git status --short` → only `M playwright-report/index.html`
- Notes
  - Phase `0.-1` passed under allowed-noise rule.

### Phase 0.A / 0.B / 0.C — Documentation refresh and carry-forward hygiene

- Scope
  - Refreshed `.claude/CLAUDE.md` to current project reality (v1.5 shipped, v1.6 active, schema version 3).
  - Added Key Design Decisions #9 (pure-lib boundary) and #10 (dual print-mode pattern A3/A4).
  - Updated `.claude/AGENT-HANDOFF.md` to v1.6 implementation state.
  - Added explicit v1.5 changelog gap-acknowledgement line at `plan-v1.5.md §17`.
- Files touched
  - `.claude/CLAUDE.md`
  - `.claude/AGENT-HANDOFF.md`
  - `.claude/plan-v1.5.md`
- Verification
  - Manual doc review for structure/voice continuity and required content updates.
- Notes
  - Backfill was intentionally not expanded; gap acknowledgement points to authoritative `v1.5` git history.

### Phase 0.1 — Quality Panel cold-open performance close-out

- Scope
  - Closed carried perf debt path by deferring heavy chart mount and precomputing baseline-filtered variance snapshots.
  - Documented before/after measurement with production preview and browser-side timing samples.
- Files touched
  - `src/components/modals/QualityPanel.tsx`
  - `src/components/App.tsx`
  - `src/components/variance/VarianceTrendChart.tsx`
  - `docs/perf-v1.6-quality-panel.md`
- Verification
  - `npm.cmd run build` ✅
  - Browser-side cold-open sampling (8 runs) mean `72.1 ms` vs baseline `121.0 ms`.
- Notes
  - One outlier run was `100.8 ms`; average and majority runs are below the `<100 ms` target threshold.

### Phase 0.2 — v1.6 desktop-first mobile QA defer entry

- Scope
  - Added dated v1.6 defer reaffirmation for physical-device QA in desktop-first Phase 0.
- Files touched
  - `docs/mobile-qa.md`
- Verification
  - Manual doc check for dated continuity across v1.3/v1.5/v1.6 entries.
- Notes
  - No mobile interaction model changes were introduced in this phase.

### Phase 0.3 — TopBar/StatBar density audit at 1280px

- Scope
  - Measured topbar density before any v1.6 topbar expansion.
  - Documented measurements and verdict in `docs/topbar-density-v1.6.md`.
- Files touched
  - `docs/topbar-density-v1.6.md`
- Verification
  - Production preview measurement at `1280x900` viewport with example data loaded.
  - TopBar density measured at `90.84%`.
- Notes
  - `S7` triggered (>85%). Human direction received to continue execution after documenting the gate result.

### Phase 0.D / 0.E / 0.F — Explicit deferral decisions (no implementation)

- Scope
  - Reaffirmed existing plan-recorded deferrals:
    - `0.D` Marketing landing v2 pass deferred post-v1.6.
    - `0.E` Branch-preservation pattern continues for v1.6.
    - `0.F` `Task.deps[]` direct-write lint rule deferred to v2.0.
- Files touched
  - none (decisions are already codified in `§4.5`)
- Verification
  - Manual confirmation against `§4.5` decision table.
- Notes
  - Phase 0 close-out complete; capability work may proceed to Phase A.

### Phase A — Pure reporting-library foundation

- Scope
  - Added pure foundational libraries:
    - `scurve.ts` (`computeSCurve`)
    - `evm.ts` (`computeEVM`)
    - `cashflow.ts` (`computeMonthlyCashFlow`)
    - `reportData.ts` (`buildExecutiveReport`)
    - `weeklyReport.ts` (`buildWeeklyReport`)
  - Extended shared types for reporting/EVM/cashflow/report payloads in `src/types/index.ts`.
  - Exposed `computeCompositeHealthScore` from `health.ts` and wired existing health computation through it.
  - Added v1.6 report-surface reference doc (`docs/reports.md`).
  - Added unit test coverage for all five new libs + health helper compatibility path.
- Files touched
  - `src/types/index.ts`
  - `src/lib/scurve.ts`
  - `src/lib/evm.ts`
  - `src/lib/cashflow.ts`
  - `src/lib/reportData.ts`
  - `src/lib/weeklyReport.ts`
  - `src/lib/health.ts`
  - `tests/unit/lib/scurve.test.ts`
  - `tests/unit/lib/evm.test.ts`
  - `tests/unit/lib/cashflow.test.ts`
  - `tests/unit/lib/reportData.test.ts`
  - `tests/unit/lib/weeklyReport.test.ts`
  - `docs/reports.md`
- Verification
  - `npm.cmd run type-check` ✅
  - `npx.cmd vitest run tests/unit/lib/scurve.test.ts tests/unit/lib/evm.test.ts tests/unit/lib/cashflow.test.ts tests/unit/lib/reportData.test.ts tests/unit/lib/weeklyReport.test.ts tests/unit/lib/health.test.ts` ✅
  - `npm.cmd run test:unit` timed out in this environment; targeted suites above passed.
- Notes
  - Full-suite timeout appears environment/tooling related; no failures surfaced in targeted Phase A suites.

### Phase B — Variance snapshot health field

- Scope
  - Extended `VarianceSnapshot` with optional `compositeHealthScore`.
  - Wired midnight snapshot capture to include `scheduleHealth.score`.
  - Extended variance/storage unit coverage for mixed snapshot shapes (with and without health score).
- Files touched
  - `src/types/index.ts`
  - `src/components/App.tsx`
  - `tests/unit/lib/variance.test.ts`
  - `tests/unit/lib/storage.test.ts`
- Verification
  - `npm.cmd run type-check` ✅
  - `npx.cmd vitest run tests/unit/lib/variance.test.ts tests/unit/lib/storage.test.ts` ✅
  - `npm.cmd run lint` ✅
- Notes
  - No schema bump required (additive optional nested field only).

### Phase C — Reports modal shell

- Scope
  - Added `ReportsModal` (two-pane shell) with `useDialogA11y`.
  - Added left-pane `ReportTypeList` with five report types.
  - Added TopBar `Reports` entry (`ChartLine`) and App state wiring:
    - `reportsModalOpen`
    - `reportsModalSelectedType` (default `s-curve`)
  - Added App-level memoized compute outputs for S-curve, EVM, cashflow, executive report, and weekly report; modal preview currently renders structured JSON payloads.
- Files touched
  - `src/components/modals/ReportsModal.tsx`
  - `src/components/reports/ReportTypeList.tsx`
  - `src/components/topbar/TopBar.tsx`
  - `src/components/App.tsx`
  - `src/lib/icons.ts`
- Verification
  - `npm.cmd run type-check` ✅
  - `npm.cmd run lint` ✅
- Notes
  - Preview surface is intentionally scaffold-level in Phase C; visual report panes land in subsequent phases.

### Phase D — S-curve report

- Scope
  - Added `SCurveChart` SVG component with `size: 'full' | 'thumbnail'`, today marker, and hover-state points in full mode.
  - Added `SCurvePreview` wrapper with variance summary line and baseline-required empty state.
  - Added S-curve tokens (`--scurve-planned`, `--scurve-actual`) for light/dark themes.
  - Wired `s-curve` report type in Reports modal to render `SCurvePreview` instead of JSON scaffold.
- Files touched
  - `src/components/reports/charts/SCurveChart.tsx`
  - `src/components/reports/SCurvePreview.tsx`
  - `src/styles/tokens.css`
  - `src/components/App.tsx`
- Verification
  - `npm.cmd run type-check` ✅
  - `npm.cmd run lint` ✅
- Notes
  - Non-S-curve report types remain scaffold-previews until Phases E–H.

### Phase E — EVM report

- Scope
  - Added `EVMChart` (SVG PV/EV line view).
  - Added `EVMPreview` with KPI strip (PV/EV/SPI), empty-state gating, and AC/CPI deferral footer note.
  - Added EVM line tokens (`--evm-line-pv`, `--evm-line-ev`) for light/dark themes.
  - Wired `evm` report type in Reports modal to `EVMPreview`.
- Files touched
  - `src/components/reports/charts/EVMChart.tsx`
  - `src/components/reports/EVMPreview.tsx`
  - `src/styles/tokens.css`
  - `src/components/App.tsx`
- Verification
  - `npm.cmd run type-check` ✅
  - `npm.cmd run lint` ✅
- Notes
  - AC/CPI stays explicitly deferred in preview copy per v1.6 scope rules.

### Phase F — Cash flow report

- Scope
  - Added `CashFlowChart` (stacked monthly SVG bars with hover breakdown).
  - Added `CashFlowPreview` wrapper with empty state and forecast-total summary.
  - Added cashflow category tokens (`--cashflow-labor`, `--cashflow-equipment`, `--cashflow-material`).
  - Wired `cash-flow` report type in Reports modal to `CashFlowPreview`.
- Files touched
  - `src/components/reports/charts/CashFlowChart.tsx`
  - `src/components/reports/CashFlowPreview.tsx`
  - `src/styles/tokens.css`
  - `src/components/App.tsx`
- Verification
  - `npm.cmd run type-check` ✅
  - `npm.cmd run lint` ✅
- Notes
  - Uses existing monthly buckets from the Phase A cashflow pure library.

### Phase G — Executive summary report

- Scope
  - Added `ExecutiveReportPreview` with six required sections (health, S-curve thumbnail, top variances, top risks, next milestones, SPI).
  - Embedded `SCurveChart size=\"thumbnail\"` in the executive surface.
  - Added dedicated report print stylesheet (`body.report-print`) and imported it in app entry.
  - Wired report PDF export flow:
    - add `report-print` class
    - call `window.print()` on next animation frame
    - remove class on `afterprint` (and timeout fallback).
  - Wired `executive-summary` report type to `ExecutiveReportPreview`.
- Files touched
  - `src/components/reports/ExecutiveReportPreview.tsx`
  - `src/styles/print-report.css`
  - `src/main.tsx`
  - `src/components/App.tsx`
- Verification
  - `npm.cmd run type-check` ✅
  - `npm.cmd run lint` ✅
- Notes
  - Report print mode is isolated from existing A3 schedule print flow.

### Phase H — Weekly progress report

- Scope
  - Added `WeeklyReportEditor` two-pane layout:
    - left: auto-generated report lists
    - right: three narrative text areas (highlights, concerns, look-ahead).
  - Added transient narrative state in `App.tsx` (not persisted).
  - Added advisory copy: “Narrative is not saved — export before closing.”
  - Reused report-print export flow for weekly report export.
  - Added weekly page print-class hook (`weekly-report-page`) in print stylesheet.
  - Wired `weekly-progress` report type in Reports modal to `WeeklyReportEditor`.
- Files touched
  - `src/components/reports/WeeklyReportEditor.tsx`
  - `src/components/App.tsx`
  - `src/styles/print-report.css`
- Verification
  - `npm.cmd run type-check` ✅
  - `npm.cmd run lint` ✅
- Notes
  - Weekly narrative remains intentionally transient in v1.6 scope.

### Phase I — Audit v4 carry-overs

- Scope
  - `I.1` `DcmaFindingsTable` now defaults to failing-only view, includes “Show all 14 checks” toggle, and renders “All 14 checks passing” state.
  - `I.2` `VarianceTrendChart` now supports “Show health score” toggle and renders a secondary health-score line when snapshot health values exist.
  - `I.3` Added `HealthSparkline` and embedded it in `HealthScoreBreakdown` as 30-day trend.
  - `I.4` `BaselineDiffTable` now renders change-order chips on slipped-task rows (via `BaselineCompareModal`/App change-order wiring).
  - `I.5` Added `Quality: NN/100` segment to A3 Gantt print title area.
- Files touched
  - `src/components/quality/DcmaFindingsTable.tsx`
  - `src/components/variance/VarianceTrendChart.tsx`
  - `src/components/reports/HealthSparkline.tsx`
  - `src/components/quality/HealthScoreBreakdown.tsx`
  - `src/components/baseline/BaselineDiffTable.tsx`
  - `src/components/modals/BaselineCompareModal.tsx`
  - `src/components/modals/PrintPreviewModal.tsx`
  - `src/components/modals/QualityPanel.tsx`
  - `src/components/App.tsx`
  - `src/styles/tokens.css`
- Verification
  - `npm.cmd run type-check` ✅
  - `npm.cmd run lint` ✅
- Notes
  - Health secondary line only appears when snapshot health values are present.

### Phase J — Empty/loading/error states

- Scope
  - `J.1` Added Reports modal-level empty state when no tasks are loaded.
  - `J.2` S-curve preview empty-state messaging retained for no-data path.
  - `J.3` Cash-flow preview empty-state messaging retained for no-cost path.
  - `J.4` Added executive-report composite empty guidance when both baseline and cost data are missing.
  - `J.5` Added report-type switch loading-bar pattern for renders exceeding 100ms threshold.
- Files touched
  - `src/components/modals/ReportsModal.tsx`
  - `src/components/reports/ExecutiveReportPreview.tsx`
  - `src/components/App.tsx`
- Verification
  - `npm.cmd run type-check` ✅
  - `npm.cmd run lint` ✅
- Notes
  - Loading bar uses the existing computing-bar visual pattern for consistency.

### Phase K — E2E coverage (core subset)

- Scope
  - Added `tests/e2e/reports-modal.spec.ts` covering open/switch across all five report types.
  - Extended `tests/e2e/quality-panel.spec.ts` for failing-only default + show-all toggle path.
  - Extended `tests/e2e/baseline-compare.spec.ts` for CO-chip visibility on slipped rows (via seeded CO fixture state).
  - Extended `tests/e2e/a11y.spec.ts` to include Reports modal and report pane sweeps.
- Files touched
  - `tests/e2e/reports-modal.spec.ts`
  - `tests/e2e/quality-panel.spec.ts`
  - `tests/e2e/baseline-compare.spec.ts`
  - `tests/e2e/a11y.spec.ts`
- Verification
  - `npm.cmd run build` ✅ (required before E2E)
  - `npm.cmd run test:e2e -- tests/e2e/reports-modal.spec.ts tests/e2e/quality-panel.spec.ts tests/e2e/baseline-compare.spec.ts` ✅ (5/5 passing)
  - `npm.cmd run type-check` ✅
  - `npm.cmd run lint` ✅
- Notes
  - Phase-K report-specific specs K.2–K.6 remain to be added/expanded for full per-report deep assertions.

### Phase L — Print + docs

- Scope
  - `L.1` Documented print-integration check status and screenshot artifact target for A3 quality segment (`docs/v1.6-screenshots/README.md`).
  - `L.2` Updated `docs/design-system.md` for v1.6 reporting tokens and icon additions.
  - `L.3` Updated onboarding QA recommendations to include Reports as the post-baseline next action.
  - `L.4` Updated DCMA docs to reflect v1.6 default-failing-only table behavior + show-all toggle.
- Files touched
  - `docs/v1.6-screenshots/README.md`
  - `docs/design-system.md`
  - `docs/onboarding-qa.md`
  - `docs/dcma-checks.md`
- Verification
  - `npm.cmd run type-check` ✅
  - `npm.cmd run lint` ✅
- Notes
  - Human-captured screenshot artifact is still needed to fully close L.1 visual evidence expectations.

### Phase M — Release hygiene (partial)

- Scope
  - `M.1` Updated `CHANGELOG.md` with `0.6.0` entry.
  - `M.2` Updated `README.md` feature set for reporting/analytics additions.
  - `M.3` Bumped app version to `0.6.0` (`package.json`, `package-lock.json`) via `npm.cmd version 0.6.0 --no-git-tag-version`.
  - Began `M.4` gate sequence.
- Files touched
  - `CHANGELOG.md`
  - `README.md`
  - `package.json`
  - `package-lock.json`
- Verification
  - `npm.cmd run lint` ✅
  - `npm.cmd run type-check` ✅
  - `npm.cmd run test:unit` ⚠ timed out in this tool run; retry was interrupted
- Notes
  - `M.4` remains open; required `build` + `test:e2e` full-chain verification is still pending.
  - Resume from `M.4` before any release-close steps (`M.5+`).

### Phase M — Release hygiene (completion update)

- Scope
  - Completed `M.4` release verification chain from branch state.
  - Completed `M.5/M.6` implementation close by committing v1.6 source/docs/tests changes.
- Files touched
  - `CHANGELOG.md`
  - `README.md`
  - `package.json`
  - `package-lock.json`
  - `.claude/AGENT-HANDOFF.md`
  - `.claude/version-status.md`
- Verification
  - `npm.cmd run lint` ✅
  - `npm.cmd run type-check` ✅
  - Unit suite executed per-file (`tests/unit/lib/*.test.ts`) ✅
  - `npm.cmd run build` ✅
  - `npm.cmd run test:e2e` ✅ (20/20)
- Notes
  - v1.6 implementation commit: `e2517cb` (`Implement v1.6 reporting and analytics`).
  - Human-owned release actions remain: open/merge PR `v1.6 -> main`, then apply tag `v0.6.0`.

---

## 18. Plan metadata

**Plan author:** Claude (planning agent)
**Plan ready for:** Codex implementation, starting at Phase 0.0 (branch creation), then Phase 0.1 (Quality Panel perf close-out — BLOCKING), then Phase 0.2 / 0.3, then Phase A.
**Plan supersedes:** None — additive on top of plan-v1.5 (shipped)
**Plan successor:** `plan-v1.7.md` (WBS deepening). v1.7 is itself authored after v1.6 ships. **No PM Audit checkpoint fires after v1.6** — the next checkpoint is Checkpoint 3 after v1.8 ships.

---

## 19. Assumptions made

These are the assumptions that shaped this plan. If any prove false, surface immediately.

1. **v1.5 is shipped on `main` tagged `v0.5.0`.** Confirmed by `version-status.md` (v1.5 ✅ shipped, 2026-05-25) and PR pending at branch `v1.5`.
2. **The existing `VarianceSnapshot` type is extensible additively.** Confirmed — current shape includes optional fields and the persistence layer's `migrateState` walk supports defaults on load.
3. **Adding `compositeHealthScore: number | null` to `VarianceSnapshot` does not require a schema bump.** Confirmed for additive optional fields per the v1.3/v1.5 migration patterns. If during implementation the schema bump becomes necessary for any reason, S2 triggers.
4. **`window.print()` + print-mode CSS is acceptable PDF export.** Confirmed by CLAUDE.md design discipline (no new dependencies). Browser print fidelity varies but is industry-standard for the construction-PM use case (PMs are accustomed to "print to PDF" from any browser).
5. **AC (Actual Cost) input is genuinely a v1.7 organ.** Roadmap §v1.6 names PV/EV/AC/SPI/CPI together, but AC requires a per-task / per-week actual-cost entry form that is its own scope. v1.6 ships PV + EV + SPI; v1.7 plan-author surfaces the AC question for confirmation.
6. **The Quality Panel cold-open perf debt is closable in Phase 0.** Audit v4 §10.1 named it as the only blocking carry-over. If it proves unclosable, S1 triggers and the plan re-scopes.
7. **TopBar can absorb one more button at 1280px without restructure.** Phase 0.3 verifies. If density exceeds 85%, restructure precedes Reports button (S7).
8. **Weekly report narrative loss on close is acceptable for v1.6.** v2.2 saved views handle persistence. v1.6 strong advisory + export-before-close is sufficient.
9. **Three category fills (labor / equipment / material) on cash flow is enough granularity.** Per-resource breakdown is v1.7 WBS territory.
10. **No icon in `src/lib/icons.ts` blocks Reports work.** `ChartLine` needs to be added; all other Phosphor icons used by v1.6 are already exported (verified via `src/lib/icons.ts`).
11. **`useDialogA11y` is the modal a11y hook.** Inferred from v1.4 + v1.5 plans; if the hook is named differently in code, Phase C.1 adapts during implementation.
12. **Plan files are local artifacts and need not be committed.** User direction: "Local planning/docs files can be updated locally but should not be assumed as committed artifacts unless explicitly requested." This plan is written to `.claude/plan-v1.6.md` locally; commit decision is the human's.
13. **The existing A3 Gantt print mode and the new A4 Report print mode are independently activatable.** Phase G.3 implements distinct body classes (`report-print` vs whatever existing class the A3 flow uses — verify during implementation). S12 triggers if they conflict.

---

**Plan ready for Codex implementation starting at Phase 0.0.**
