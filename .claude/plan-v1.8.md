# MAKE Scheduling Tool — Plan v1.8

**Status:** Draft · Calendar & Delay Management (the sixth organ — the schedule's reality check against real-world calendars and claim-defensible delay records)
**Created:** 2026-05-26
**Author:** Claude (planning agent)
**Predecessors:** [plan-v1.7.md](./plan-v1.7.md) ✅ shipped 2026-05-26 (PR #16 merged to `main` — merge commit `0eac6b6`; `v0.7.0` tag pending human action), [pm-audit-v4.md](./pm-audit-v4.md) (Checkpoint 2 — pass with one condition closed in v1.6 Phase 0.1)
**Target ship tag:** `v0.8.0`
**Roadmap target fitness:** 8.0/10 → 8.5/10
**Checkpoint:** **PM Audit Checkpoint 3 fires AFTER v1.8 ships** — the last single-user maturity gate before the v1.9 (data integration) and v2.0 (cloud / multi-user) architectural shifts. Audit is a Claude job after Phase M closes.

---

## 0. One-line premise

v1.3 made the schedule **executable**. v1.4 made it **auditable**. v1.5 made it **defensible over time**. v1.6 made it **speak to owners**. v1.7 made it **a structural framework**. **v1.8 makes the schedule honest about the real world** — weather doesn't stop, owners stop crews, unions strike, Christmas Eve isn't a workday in most provinces, and every PM keeps a delay log in a separate spreadsheet today because no scheduling tool surfaces the question "who caused this slip and is it excusable?" v1.8 brings the calendar overlay onto the Gantt, the delay log onto a first-class panel, and the excusable/non-excusable classification onto every recorded event so the schedule output holds up under claim or arbitration scrutiny.

---

## ⚠ Branch hygiene reminder (one-branch-per-version)

Codified as a permanent rule in `AGENTS.md § Conventions` since v1.4. **A `v1.8` branch already exists locally and is content-identical to `origin/main`.** The implementation agent MUST verify and adopt it (not delete-and-recreate, which would lose any local-only commits if any exist):

```
git fetch origin --tags
git checkout main
git pull --ff-only origin main
git checkout v1.8                           # branch already exists locally
git rev-list --count main..v1.8             # must print 0 if v1.8 is at parity with main
git rev-list --count v1.8..main             # must print 0; otherwise fast-forward v1.8
git push -u origin v1.8                     # set upstream (branch has none currently)
```

Verify with `git branch --show-current` → must print `v1.8`. Every v1.8 commit lands on `v1.8`; ship merges via PR `v1.8 → main`, then tag `v0.8.0` on the merge commit. No work goes directly to `main`. The `playwright-report/index.html` modification is allowed noise and MUST NOT be staged or committed at any point (see Phase 0.−1).

**Why the v1.8 branch already exists:** It was created from the v1.7 branch tip (`0dd2c15`) immediately before PR #16 was merged. The tree state of `v1.8` and `origin/main` is identical at the file level; only the commit-graph topology differs (main has the merge commit `0eac6b6` and the v1.6/v1.5 merge commits as ancestors; v1.8 has the underlying feature-branch commit history). For practical purposes this is fine — v1.8 is on v1.7-shipped code. If for any reason the agent prefers a clean topology, `git reset --hard origin/main` on `v1.8` is acceptable (no v1.8 work has landed yet), but the default recommendation is **adopt as-is** and start phase 0.

---

## ⚠ Codex operating rules (READ AT EVERY PHASE BOUNDARY)

These are not v1.8-specific; they are the always-on rules for implementing any plan in this codebase. Embedded here because v1.8 is the third schema-changing version in three cycles (v1.5 → 3, v1.7 → 4, v1.8 → 5) and the calendar overlay + delay log are the broadest visual additions since v1.5's change-order surface — process discipline matters most under that load.

- **One process at a time.** No background `vitest --watch`. No parallel `vite preview` servers. Foreground each gate, wait for it to finish, then move on.
- **Build before every E2E run.** `npm run build` then `npm run test:e2e`. The E2E harness reads `dist/`. Running E2E against a stale build silently masks regressions.
- **Stop-and-ping triggers are mandatory.** Each is named in §16. Do not push past a failing gate.
- **All icons from `src/lib/icons.ts` only.** Add new Phosphor exports there first; consumers import from `src/lib/icons.ts` only. No direct `@phosphor-icons/react` imports in components.
- **All colors via `var(--token)`.** Zero hardcoded hex in components. New tokens land in `src/styles/tokens.css` under both light root and `@media (prefers-color-scheme: dark)` overrides.
- **`src/lib/*` modules are pure.** Input → output. No React imports. No localStorage touches. Only `src/lib/storage.ts` touches persistence. This is Key Design Decision #9 in `CLAUDE.md`; v1.8's `projectCalendar.ts`, `delays.ts`, and `delayImpact.ts` must hold it.
- **Schema migration is additive only.** The 4 → 5 walk applies defaults; existing v4 saves must round-trip without data loss. See §5.1.
- **`Task.deps[]` is render-only.** Never write to it from new code. The `Task.deps[]` direct-write lint rule is still deferred to v2.0 (per plan-v1.6 §4.5 Phase 0.F and reaffirmed in plan-v1.7 §4.5 Phase 0.G).
- **No new runtime dependencies.** Specifically: no calendar / date-picker libraries (use plain `<input type="date">` and native `Intl.DateTimeFormat`), no chart libraries (carry-forward from v1.6 / v1.7), no PDF libraries, no tree libraries. Manual recursion is fine.
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
| v1.5 | Multi-baseline & change management — the historical-record organ | Shipped 2026-05-25 (`v0.5.0` tag missing on remote — see §4.5 Phase 0.H) |
| v1.6 | Reporting & analytics — the owner-facing organ | Shipped 2026-05-26 (`v0.6.0`) |
| v1.7 | WBS deepening + AC/CPI close-out — the spine organ | Shipped 2026-05-26 — PR #16 merged to `main`; `v0.7.0` tag pending human action |
| **v1.8** | **Calendar & delay management — the reality-check organ** | **This plan** |

The audience for v1.8 is the **PM defending the schedule in front of an owner, a claim consultant, or a lawyer**. v1.6 gave them the report. v1.7 gave them the structure. v1.8 gives them the chain of custody for *why* the schedule moved — a date-stamped, classified, exportable record of every event that pushed the plan against the wall.

The deliverable v1.8 produces is twofold:
1. **A project calendar layer** — distinct from the existing per-day workweek mask (`workweek: WorkweekConfig` + `holidays: string[]`), v1.8 introduces a typed-event calendar (`projectCalendar: CalendarEvent[]`) for owner-mandated shutdowns, union work stoppages, regional holidays beyond the existing flat list, and explicit weather-delay windows. The calendar overlays the Gantt with a subtle diagonal stripe pattern distinct from the existing weekend bands, and is respected by all date arithmetic (CPM, workday counts, progress auto-calc).
2. **A delay log** — `delays: Delay[]` is a new persisted array. Each `Delay` is: date range, type (`weather` / `owner_directive` / `force_majeure` / `contractor_caused` / `subcontractor_caused` / `other`), excusable classification (`excusable` / `non_excusable` — derived from type with override), affected task IDs, days impact, responsible party, narrative, and the resulting critical-path delta computed on save. The delay log opens as a panel from the TopBar overflow menu (the slot v1.7 Phase 0.1 created), is exportable as CSV (claim-attachment grade), and surfaces on individual task SidePanels as a "Delays" section listing events affecting that task.

These two deliverables are bundled in v1.8 because **a calendar without a delay log is decoration, and a delay log without a calendar can't show the impact**. They are the same conceptual organ (the schedule's reality interface), split into the data layer (calendar + delay records) and the consumption layer (Gantt overlay + CPM-aware impact computation).

---

## 2. The "single organ at a time" principle (CARRIED FORWARD)

The roadmap's seventh guiding principle still holds. **v1.8 ships exactly one new organ (calendar + delay management as a single conceptual surface) plus targeted close-outs of v1.7 housekeeping**. The two surfaces inside the organ — calendar events and delay records — are bundled because they are mutually dependent (see §3.3).

v1.8 ships:

- New persisted shape: `projectCalendar: CalendarEvent[]` (typed calendar events distinct from the flat `holidays: string[]`)
- New persisted shape: `delays: Delay[]` (date-ranged, classified, narrative-bearing event records)
- Calendar overlay toggle on the Gantt header (off by default; user-enabled per session)
- Calendar event management modal (`ProjectCalendarManager`), accessible from the TopBar overflow menu
- Delay log panel (`DelayLogPanel`), accessible from the TopBar overflow menu
- SidePanel `DelaysSection` per task — lists delays touching the selected task with a quick-add affordance
- Delay impact computation: when a delay is recorded against tasks, the *projected* schedule impact (days pushed on critical path) is computed pure-fn from CPM output and surfaced on the delay record
- Excusable / non-excusable classification on every delay, with default derivation from type (weather / owner / force majeure → excusable; contractor / subcontractor → non-excusable; other → user-choice, no default)
- Variance summary in reports gains a delay-attributed slice ("MEP slip: 14 days, of which 9 days excusable, 5 days non-excusable")
- DCMA check 17: **Open delay reconciliation** — every recorded delay must be reconciled (either accepted into the variance or marked rejected) before a baseline can be captured. Adds to the §3.1 capability map.
- CSV export of the delay log (`delays.csv` — separate export, NOT part of the main schedule CSV, to preserve v1.7's CSV format stability)
- Workweek modal extended with per-project non-work-day input (existing `holidays: string[]` stays as the simple list; the new `projectCalendar` adds typed events on top)
- **`v0.7.0` tag verification** — Phase 0.−2 pre-flight verifies the human-owned tag landed; if missing, S13 triggers
- **`v0.5.0` historical-tag close-out** — `v0.5.0` is missing from `origin/main` tags (only `v0.1.0` through `v0.4.0` and `v0.6.0` are present). Phase 0.H surfaces this for human resolution (creating the tag on the v1.5 merge commit `f9382f2` from a clean local position)

v1.8 does **not** ship:

- **Per-resource calendars** — the roadmap mentions "per-resource calendars" but the use case (different shift patterns per crew) is rare for the firm's institutional builds and adds a multiplicative complexity (per-task × per-resource × per-day capacity windows). Defer to v2.x. v1.8 ships *project-level* calendar only.
- **AC import from CSV** — v1.7 §3.2 deferred this to v1.8 / v1.9. **Decision for v1.8: still deferred to v1.9** (folded into the P6/MPP integration work where field-mapping UI lands). v1.8 stays focused on the calendar/delay organ.
- **Delay approval workflow** (PM submits → owner approves) — that's a multi-user / cloud feature, v2.0 territory.
- **Weather data integration** (NOAA / Environment Canada API pulls) — v1.9 (P6/Procore integrations bracket).
- **Drag-to-resize a delay on the Gantt** — v2.2 (bulk edit / drag dependencies).
- **Auto-recompute baseline against delay-projected schedule** — baselines stay user-captured snapshots. Delays affect variance reporting and CPM, never the baseline itself (baselines are evidence, per the v1.5 Key Design Decision).
- **Cascading delay impact prediction beyond the immediate task** ("if I delay task A by 5 days, what does that mean for milestone Z three months out?") — partially implicit via CPM recomputation, but no purpose-built "scenario" view in v1.8. Defer to v2.2 (saved views / what-if).
- **Excusable-only / non-excusable-only filters on the task list** — v2.2 saved views.
- **Claims-document PDF export** — v1.9 / v2.0 (collaboration & owner-facing artefacts).
- **Cross-project / portfolio delay rollups** — v2.1.
- **AI-generated delay narratives** — never.
- **Chart libraries / PDF libraries / calendar libraries / tree libraries** — never (CLAUDE.md design decisions; carried through every plan since v1.2).
- **Group-level delay records** — delays attach to *tasks*, not groups. Group-level impact is rendered by the existing group rollup (v1.7) via the task records under it.
- **Time-of-day on delay events** — date-precision only (YYYY-MM-DD start, YYYY-MM-DD end). Construction delays are tracked in calendar days, not hours.
- **Soft-delete on delay records** — once recorded and reconciled, a delay is immutable (claim evidence). v1.8 supports "rejected" status (marked but kept) but never hard delete. A separate "void" / "duplicate" surface is v2.x.

If a contributor asks "while we're touching the calendar layer, can we also…" the answer is no.

### 2.1 Discipline preserved

Every visual surface added in v1.8 must pass the v1.2 pre-flight:
- "Would another product look identical if I swapped the wordmark?" — if yes, fail.
- "Does it have a job, or is it decorative?" — if decorative, fail.
- "Would I notice it missing?" — if no, fail.

**The Gantt calendar overlay is the surface where 'visual noise' is the highest risk in v1.8.** The overlay must not compete with the existing weekend bands, today line, critical-path styling, baseline ghost bars, or dependency arrows. The overlay is: a diagonal hatch pattern (45° lines, 1px stroke, 6px spacing) in `--calendar-overlay-stripe` with `opacity: 0.35`, layered *behind* the bars (`z-index: 0`), *in front of* the day grid (`z-index: 1` for the grid). Different from the weekend band (which uses a flat `--gantt-weekend-bg` tint). Calendar events have a single-pixel left/right edge in `--calendar-event-edge` so the boundaries are crisp on print. **No emoji icons in the overlay. No labels in the overlay** — labels live in tooltips on hover and in the calendar event modal.

**The delay record visual** on the Gantt is a small marker (a 6px-tall colored bar) at the very top of the affected task's bar, in `--delay-marker-excusable` or `--delay-marker-non-excusable`. **No icons, no badges, no popovers on hover** — just the marker. Click drills into the delay log entry. The decision rule: if a feature needs a tooltip just to be understood, it is the wrong feature.

**The delay log panel** is a list, not a dashboard. Columns: Date range · Type · Excusable · Days · Affected · Reconciliation. Monospaced numeric columns. No charts inside the panel. No RAG indicators. No coloured row backgrounds. The variance-by-cause donut that an enterprise product would put here is *intentionally absent* — it's in the executive report (one chart, one place).

### 2.2 The defensibility floor

v1.8 preserves the floor:
- Every new pure function gets a unit test.
- Every new user-visible flow gets an E2E spec.
- **Schema migration 4 → 5 is additive, unit-tested, and round-trip safe.** A v1.7 `0.7.0` save file must continue to load cleanly in v1.8 and round-trip without data loss. Round-trip includes: load v4 → save v5 → load v5 → no field drift.
- No new runtime dependencies (see §7.3).
- No regression on existing unit tests (≥360 post-v1.7) or E2E specs (≥26 post-v1.7).
- Performance contract: no regression on v1.7 baselines; new calendar / delay / impact computations meet §8 targets.
- The Quality Panel cold-open close-out from v1.6 Phase 0.1 (`docs/perf-v1.6-quality-panel.md`) must hold after DCMA-17 lands. Re-measure in Phase J.

---

## 3. Scope

### 3.1 In scope (v1.8)

| Capability | What the PM sees |
|---|---|
| **`CalendarEvent[]` persisted shape** | New `projectCalendar: CalendarEvent[]` array on `PersistedState`. Each event is `{ id, name, start, end, type, classification, notes }` where `type ∈ {'holiday', 'owner_shutdown', 'union_action', 'weather_window', 'other'}` and `classification ∈ {'non_work', 'reduced_capacity', 'advisory_only'}`. Migration assigns empty array `[]` to all v4 saves. |
| **`Delay[]` persisted shape** | New `delays: Delay[]` array on `PersistedState`. Each delay is `{ id, recordedAt, start, end, type, excusable, affectedTaskIds, daysImpact, criticalPathImpactDays, responsibleParty, narrative, reconciliation }` where `type ∈ {'weather', 'owner_directive', 'force_majeure', 'contractor_caused', 'subcontractor_caused', 'other'}`, `excusable: boolean` (derived from type with override), and `reconciliation ∈ {'pending', 'accepted', 'rejected'}`. Migration assigns empty array `[]` to all v4 saves. |
| **Calendar overlay toggle on Gantt header** | A small `CalendarToggle` chip in the Gantt header (existing `GanttHeader.tsx`) next to the existing zoom controls. When ON, calendar events with classification `non_work` render as diagonal-hatch overlay bands. When OFF (default), only the existing weekend bands render. Per-session state — not persisted (deliberate; matches the existing CPM toggle pattern). |
| **`ProjectCalendarManager` modal** | New modal accessible from the TopBar overflow menu (the slot v1.7 Phase 0.1 created via `TopBarOverflowMenu`). Lists all `CalendarEvent` rows. Per-row: start, end, name, type, classification, notes. Add / edit / delete. Type and classification default sensibly (e.g., `holiday` → `non_work`). |
| **`DelayLogPanel`** | New panel accessible from the TopBar overflow menu. Tabular list of all `Delay` rows sorted by `start` descending. Columns: Date range · Type · Excusable · Days · Affected · Reconciliation. Click a row to expand: shows narrative, responsible party, full affected-task list, critical-path impact. Per-row actions: Edit, Reconcile (set status to `accepted` or `rejected`), Export single (CSV row to clipboard). |
| **`SidePanelDelaysSection`** | New section in `SidePanel`, between `ChangeOrderSection` and `DependenciesSection`. Lists all delays where the selected task is in `affectedTaskIds`. Per-row mini-display: date range, type pill, days impact. "Add delay…" button opens the delay-creation modal pre-filled with the current task. |
| **Delay impact computation (pure)** | `src/lib/delayImpact.ts` exports `computeDelayImpact(delay, tasks, dependencies, cpmResult)` → `{ criticalPathImpactDays: number, affectedDownstreamTaskIds: string[] }`. Run on delay save and on every CPM recompute. Result is *stamped* on the delay record (criticalPathImpactDays) so historical records show the impact at the time of recording. |
| **Calendar-aware date math** | `src/lib/projectCalendar.ts` exports `isCalendarNonWorkDay(date, projectCalendar)`. `workdays.ts` `isWorkday()` is extended (additively — does not change existing signature) with an optional `projectCalendar?: CalendarEvent[]` parameter. When provided, days within `non_work`-classified events are treated as non-work in addition to the existing workweek/holidays mask. Existing callers continue to work without passing the new argument (defensive default = `[]`). |
| **CPM respect for calendar non-work days** | `src/lib/cpm.ts` gains an optional `projectCalendar` input. When provided, forward/backward pass arithmetic treats `non_work` calendar days as non-work (in addition to weekend + holiday). The existing `cpm` test suite is extended with new fixtures — no existing test is modified. App-level call site passes `projectCalendar` so the live CPM reflects calendar. |
| **Variance summary delay slice** | The existing variance trend (`varianceSnapshots`) and the v1.6 executive report variance section gain a **"by delay cause"** breakdown: total slip attributed to weather, owner, force majeure, contractor, etc. Surfaced as plain text (no chart): "Variance attribution: 9d weather (excusable), 5d owner directive (excusable), 2d contractor-caused (non-excusable). 14d total slip." |
| **DCMA check 17 — open delay reconciliation** | New check: count of `Delay[]` rows with `reconciliation === 'pending'`. Passes when zero. Plain English: "Recorded delays should be reconciled (accepted or rejected) before each baseline capture so the variance attribution is complete." Affected entities are the pending delay IDs. Enters under the **logic quality** subscore bucket (no reweight — same as v1.7 §5.3). |
| **CSV export of delay log** | New "Export delay log…" button in `DelayLogPanel`. Generates a separate `delays-{projectName}-{ISO date}.csv` with columns: `ID, Recorded At, Start, End, Type, Excusable, Affected Task IDs, Affected Task Names, Days Impact, Critical Path Impact Days, Responsible Party, Narrative, Reconciliation`. The schedule CSV (v1.7) is unchanged — delays do not pollute the main export. |
| **`WorkweekModal` extension** | The existing `WorkweekModal` (workweek booleans + flat `holidays: string[]`) gains a "Project Calendar →" button at the bottom that opens `ProjectCalendarManager`. The two surfaces share data via separate fields; the modal does not duplicate calendar entry UI. |
| **Pre-flight `v0.7.0` tag verification** | Phase 0.−2 (BLOCKING). If the tag is missing on `origin`, S13 triggers. |
| **Phase 0.H — `v0.5.0` historical tag close-out** | Phase 0.H surfaces the missing `v0.5.0` tag (only `v0.1.0` through `v0.4.0` and `v0.6.0` present on origin). Decision tree: (a) Codex creates the tag locally on the v1.5 merge commit `f9382f2` and pushes — IF the human pre-authorizes via the v1.8 kickoff message; (b) otherwise document in `docs/release-tags-audit.md` and defer to human. **Default: defer to human.** Tag-creation is not a phase-blocking task. |

### 3.2 Out of scope (explicitly deferred)

| Deferred to | What |
|---|---|
| **v1.9** | Primavera P6 (`.xer`) import-export, MS Project (`.mpp`) import-export, Procore integration, AC import from CSV (carried from v1.7 §3.2), weather data integration (NOAA / Environment Canada API), auto-pull of delay narratives from project journal |
| **v2.0** | Cloud sync, multi-user, audit trail, comments, presence, change-order approval routing, delay approval workflow (PM submits → owner approves) |
| **v2.1** | Portfolio dashboard, cross-project delay rollups, portfolio-level delay-cause distribution chart, project templates |
| **v2.2** | Density modes, saved views (including delay-cause filters and excusable-only views), bulk edit, drag-to-reparent, drag dependencies, drag-to-resize delays on Gantt, scenario / what-if delay simulation, claims-PDF export, per-resource calendars, time-of-day precision on calendar events, manual override of derived `excusable` field on bulk-import |

**Specifically NOT in v1.8** even though they are tempting:
- **Per-resource calendars** — roadmap mentions this but it is a multiplicative scope explosion. Defer cleanly to v2.x.
- **Cascading "what-if" simulation** — "if I push this 5 days, what milestones miss?" — partially answered by live CPM recomputation; a purpose-built scenario surface is v2.2.
- **Excusable filter on the task list** — v2.2 saved views.
- **Delay record on a group** — delays are task-level. Group impact is via the task records.
- **Soft-delete or hard-delete of a delay** — once recorded, immutable (claim evidence). Reconciliation status (`accepted` / `rejected`) replaces deletion.
- **Time-of-day on delay events** — calendar days only.
- **Auto-suggest "this looks like weather" from the date range** — never (no AI).
- **Calendar overlay on the print A3 output** — v1.8 ships the on-screen overlay only. Print mode A3 stays as v1.7 ships it. The diagonal hatch would compete with the weekend band on paper. **Decision: print mode is unchanged in v1.8.** If a PM needs the calendar in a print artefact, they print the delay log directly (A4 list).
- **Calendar event field on the executive PDF** — v1.8 executive PDF stays v1.7 shape plus the variance delay-cause slice. No calendar visualization on the PDF.
- **Notifications when a delay's end date approaches** — v2.0 (collaboration / notification system).
- **Cost impact on delays** (auto-compute lost productivity cost) — v1.9 / v2.1. Days impact only in v1.8.

If a v1.8 PR includes any of the above, reject. Point at this section.

### 3.3 The "calendar + delays = one organ" justification

Calendar events and delay records are bundled into one v1.8 because:
1. **Mutually dependent** — a delay's `daysImpact` calculation depends on the calendar (a weather-window event that already exists in `projectCalendar` may mean the delay's start/end is partially overlapping non-work days, which changes the days-pushed math). A calendar without delays has no claim documentation; delays without a calendar have no anchoring against the workweek mask.
2. **Same architectural surface** — both are persisted arrays on `PersistedState`, both have a manager modal in the TopBar overflow, both have a SidePanel section per task, both gain a CSV export.
3. **Roadmap intent** — `pm-roadmap.md` § v1.8 names "Calendar & Delay Management" as a single version theme. Splitting into v1.8a / v1.8b would violate the single-organ-at-a-time rule by *under*-bundling.
4. **Audit coverage** — the next checkpoint (PM Audit Checkpoint 3) is positioned after v1.8 ships. Splitting calendar and delays into separate versions would push the audit past v1.8 and into v1.9 territory, where the architectural shift (data integration) muddies the single-user-maturity evaluation.

If delay-impact computation threatens to bloat past Phase G (the budgeted slot), S2 triggers — defer impact computation depth (cascading downstream-task analysis) to v1.9 cleanly. Do not let delay scope creep into the calendar overlay phases.

---

## 4. Phase 0 — Mandatory pre-flight + carry-overs + housekeeping

### 4.1 Pre-flight verification (BLOCKING — do these BEFORE any v1.8 work)

| # | Task | Verification | Stop-and-ping |
|---|------|--------------|---------------|
| 0.−2 | **Verify v1.7 shipped to `main`.** `git fetch origin --tags && git log origin/main --oneline -5` must show the v1.7 merge commit `0eac6b6`. `git tag --list 'v0.7.0'` SHOULD return `v0.7.0` (human action — if missing, do NOT auto-create unless pre-authorized; surface via S13). `git show origin/main:package.json \| grep version` must read `0.7.0`. If main is missing the v1.7 merge or `package.json` is not at `0.7.0` → **S13 → STOP, do not proceed.** | git output captured in commit message of the first v1.8 commit, OR S13 surfaced. | S13 |
| 0.−1 | **Verify working tree is clean** (or only carries the recurring `playwright-report/index.html` noise per audit v3 §3.3). If anything else is dirty, stop and surface. The `playwright-report/index.html` modification is acceptable noise — it MUST NOT be staged or committed to `v1.8` at any point. Confirm `.gitignore` discipline before any `git add`. | `git status` clean except for known noise. | S13 |

### 4.2 Branch adoption (NOT creation — `v1.8` already exists)

| # | Task | Verification |
|---|------|--------------|
| 0.0 | **Adopt the existing `v1.8` branch.** `git checkout v1.8`. Verify `git diff origin/main v1.8 --stat` is empty (content parity confirmed). Verify `git rev-list --count main..v1.8` is `0` and `git rev-list --count v1.8..main` is `0` (or, if non-zero in either direction, fast-forward v1.8 to main: `git merge --ff-only main`). Set upstream: `git push -u origin v1.8` (the local `v1.8` currently has no remote tracking). | `git branch --show-current` returns `v1.8`; `git rev-parse --abbrev-ref v1.8@{upstream}` returns `origin/v1.8`. |

### 4.3 Project documentation refresh (BLOCKING — Phase 0 commit set must include these)

| # | Task | Deliverable | Files |
|---|------|-------------|-------|
| 0.A | **Verify `.claude/CLAUDE.md` is up to date** (Claude has already refreshed it for v1.8 active / schema version 4-bound-for-5). If any stale v1.7 active-pointer language remains, fix it. | Verified or fixed `.claude/CLAUDE.md`. | `.claude/CLAUDE.md` |
| 0.B | **Verify `.claude/START-HERE.md` is up to date** (Claude has already flipped active pointer to plan-v1.8). If any v1.7 / v1.6 active-pointer language remains, fix it. | Verified or fixed `.claude/START-HERE.md`. | `.claude/START-HERE.md` |
| 0.C | **Verify `.claude/version-status.md` reflects v1.7 ✅ shipped + v1.8 ⏳ active**, with the `v0.7.0` tag flag noted (human action pending). If any tracker row is stale, fix it. | Verified or fixed `.claude/version-status.md`. | `.claude/version-status.md` |
| 0.D | **Update `.claude/AGENT-HANDOFF.md`** to point at v1.8 implementation. The handoff must reflect: v1.7 shipped (merge commit `0eac6b6`), `v0.7.0` tag pending, plan-v1.8 written, Codex's next action is Phase 0.−2 → 0.0 → 0.1 (calendar foundation types). | Updated `.claude/AGENT-HANDOFF.md`. | `.claude/AGENT-HANDOFF.md` |
| 0.E | **Verify `plan-v1.7.md` §17 Build Changelog is final-ship complete.** Plan-v1.7 §17 already documents Phase 0 through Phase M. M.5 / M.6 / M.7 are listed as "pending human release actions." After v1.7 PR #16 merge confirmed, append a single-line "PR #16 merged to main on 2026-05-26 as merge commit `0eac6b6`. `v0.7.0` tag pending." entry in plan-v1.7 §17 to close the loop. | Final-ship entry appended to plan-v1.7 §17. | `.claude/plan-v1.7.md` |

### 4.4 v1.7 carry-overs (none structural — confirmation only)

v1.7 closed cleanly: WBS shipped, AC/CPI shipped, DCMA-15/16 shipped, TopBar overflow restructure shipped (Phase 0.1 → 71.18% density at 1280px, comfortably under the ≤75% target). No structural carry-overs to v1.8.

**Confirmation-only checks** (one-line each — no implementation):

| # | Task | Decision |
|---|------|----------|
| 0.F | **Marketing landing v2 pass — explicit deferral for v1.8.** Audits v3 / v4 / (implicit v1.7) named this as a chronic gap. **Decision for v1.8: still deferred.** Same rationale as v1.6 / v1.7: marketing is a separate craft. v1.8 produces more screenshot-worthy material (calendar overlay, delay log) but the marketing pass is its own standalone work. PM Audit Checkpoint 3 (post-v1.8) will re-flag if still untouched. |
| 0.G | **Branch pile-up — decision for v1.8.** Current preserved branches: `v1.3`, `v1.4`, `v1.5`, `v1.6`, `v1.7` (count: 5 — still under the v1.6 "revisit at 10" threshold). **Decision for v1.8: continue keeping.** No action required. Re-evaluate at PM Audit Checkpoint 3. |
| 0.H | **`v0.5.0` historical tag close-out.** `origin/main` tag listing is missing `v0.5.0` (only `v0.1.0` through `v0.4.0` and `v0.6.0` present). The v1.5 merge commit `f9382f2` is on `main` but never received its tag. **Decision for v1.8: defer to human action.** Codex documents the gap in a new `docs/release-tags-audit.md` (one paragraph: which tags exist, which are missing, which commits they belong on) and notes in §17 build changelog. Tag creation requires human direction — Codex does not auto-create release tags. |
| 0.I | **Mobile QA defer — 6 audits running.** Re-affirm desktop-first mobile QA defer with a dated v1.8 entry in `docs/mobile-qa.md`. The chronic gap continues. PM Audit Checkpoint 3 (post-v1.8) is the right moment to formally retire the gap or schedule a v1.9 iPad-acquisition QA pass. |
| 0.J | **`Task.deps[]` direct-write lint rule — explicit deferral.** Recommended as low-priority since audit v3. Defer to v2.0 (cloud sync re-architects the data layer; that is the right time to make the convention a runtime invariant). v1.8 does not add a lint rule. |

**Gate:** Phase 0 must close cleanly before Phase A begins. Phase 0.−2, 0.−1, 0.0, 0.A, 0.B, 0.C, 0.D, 0.E are all required. Phase 0.F / 0.G / 0.H / 0.I / 0.J are explicit-deferral decisions, with 0.H producing a single doc artefact (`docs/release-tags-audit.md`) and 0.I producing one paragraph in `docs/mobile-qa.md`.

---

## 5. Architecture & file map

### 5.1 Schema change — `PERSISTED_SCHEMA_VERSION` 4 → 5 (JUSTIFIED)

This is the fourth schema bump in the product's history (after 0 → 1 → 2 → 3 in v1.5, 3 → 4 in v1.7). It is justified because:

- **`PersistedState` gains two new arrays:** `projectCalendar: CalendarEvent[]` and `delays: Delay[]`. Both default to `[]` for v4 saves on migration.
- **No existing entity gets new fields.** `Task`, `Group`, `Resource`, `Dependency`, `Baseline`, `ChangeOrder` are all untouched. This is a *purely additive* schema bump at the top level.
- **No destructive change.** v4 saves migrate to v5 by adding the two empty arrays. Round-trip safety is trivial to verify.

The migration walk follows the v1.3 / v1.5 / v1.7 pattern: additive, defaults applied, no destructive change. A v1.7 `0.7.0` save file must continue to load cleanly in v1.8 and round-trip without data loss. Round-trip semantics:
- Load v4 → migrate to v5 with `projectCalendar = []`, `delays = []` → save → reload → no field drift.

```ts
// migrateState walk: 0 → 1 → 2 → 3 → 4 → 5
// v4 → v5 step:
//   - state.projectCalendar = state.projectCalendar ?? []
//   - state.delays = state.delays ?? []
```

**Round-trip safety test:** `tests/unit/lib/storage.test.ts` extends with a v4-payload-load-then-save-then-reload assertion that confirms `projectCalendar = []` and `delays = []` appear post-migration and no other field is mutated.

`PERSISTED_SCHEMA_VERSION` becomes **5**.

### 5.2 New files

| File | Purpose |
|---|---|
| `src/lib/projectCalendar.ts` | Pure: `isCalendarNonWorkDay(dateStr, projectCalendar) → boolean`. `getActiveCalendarEvents(dateStr, projectCalendar) → CalendarEvent[]` (returns events covering this date). `validateCalendarEvent(event) → string[]` (returns array of validation errors). |
| `src/lib/delays.ts` | Pure: `createDelay(input) → Delay` (with id stamp + recordedAt stamp + excusable default derived from type). `validateDelay(delay, tasks) → string[]`. `groupDelaysByCause(delays) → Map<DelayType, number>` (used by variance-attribution slice). |
| `src/lib/delayImpact.ts` | Pure: `computeDelayImpact(delay, tasks, dependencies, cpmResult, projectCalendar) → { criticalPathImpactDays, affectedDownstreamTaskIds }`. Uses `cpmResult.totalFloat` to determine whether a delay consumes float or directly pushes the critical path. |
| `src/components/topbar/CalendarToggle.tsx` | Small chip in the Gantt header for the calendar-overlay on/off state |
| `src/components/gantt/CalendarOverlay.tsx` | SVG layer rendering the diagonal-hatch bands for `non_work` calendar events |
| `src/components/gantt/DelayMarkers.tsx` | The 6px-tall marker overlays on the top edge of task bars where delays are recorded |
| `src/components/modals/ProjectCalendarManager.tsx` | The calendar event management modal |
| `src/components/modals/DelayLogPanel.tsx` | The full delay log panel modal |
| `src/components/modals/DelayEntryModal.tsx` | The add/edit delay form modal (opens from `DelayLogPanel` and from `SidePanelDelaysSection`) |
| `src/components/panels/SidePanelDelaysSection.tsx` | The per-task delays list section in the SidePanel |
| `src/components/variance/DelayCauseAttribution.tsx` | The plain-text variance-by-cause slice in reports |
| `tests/unit/lib/projectCalendar.test.ts` | non-work detection across event types, overlapping events, advisory-only events (not treated as non-work), validation rule coverage |
| `tests/unit/lib/delays.test.ts` | createDelay defaults (excusable derived correctly per type), validation (start > end rejected, empty affectedTaskIds rejected, narrative length check), groupDelaysByCause aggregation |
| `tests/unit/lib/delayImpact.test.ts` | float-consuming delay (no critical-path impact), critical-path push (1d delay pushes CP by 1d), delay overlapping weekend (workday-only impact), delay during existing non-work calendar event (no impact) |
| `tests/unit/lib/cpm.test.ts` (extend) | CPM with projectCalendar non-work day shifts task forward; cpm with empty projectCalendar matches existing v1.7 behaviour exactly |
| `tests/unit/lib/workdays.test.ts` (extend if exists, else new) | `isWorkday` with `projectCalendar` arg matches existing behaviour when arg is `[]`; non-work calendar event makes a workday into a non-workday |
| `tests/e2e/calendar-overlay.spec.ts` | Toggle calendar overlay, add a non-work event, assert diagonal-hatch band appears on Gantt over the event date range |
| `tests/e2e/delay-log.spec.ts` | Open DelayLogPanel, add a weather delay against a task, assert SidePanelDelaysSection shows it, assert DCMA-17 flags pending reconciliation, reconcile it, assert DCMA-17 passes |
| `tests/e2e/delay-impact.spec.ts` | Record a delay that pushes critical path; assert criticalPathImpactDays is computed and displayed in the delay row |
| `tests/e2e/delay-csv-export.spec.ts` | Export delay log CSV, assert correct columns and row count |
| `tests/e2e/calendar-cpm.spec.ts` | Set a calendar non-work week; assert CPM-recomputed task ends shift accordingly |
| `docs/calendar-and-delays.md` | Spec of: calendar event types, classifications, delay types, excusable derivation rules, reconciliation workflow, impact computation semantics, CSV export schema |
| `docs/perf-v1.8-baseline.md` | Phase 0 perf baseline measurements + Phase J post-implementation re-measure |
| `docs/release-tags-audit.md` | Phase 0.H tag audit + recommended human actions for `v0.5.0` and `v0.7.0` |

### 5.3 Files modified

| File | What changes |
|---|---|
| `src/types/index.ts` | Add `CalendarEvent` interface, `CalendarEventType`, `CalendarEventClassification` unions. Add `Delay` interface, `DelayType`, `DelayReconciliation` unions. Extend `DcmaCheckId` union to include `17`. Extend `PersistedState` with `projectCalendar: CalendarEvent[]` and `delays: Delay[]`. Bump `PERSISTED_SCHEMA_VERSION` to **5**. |
| `src/lib/storage.ts` | Extend `migrateState` with v4 → v5 walk: `projectCalendar ??= []`, `delays ??= []`. Update `makeDefaultState` to include both fields as `[]`. |
| `src/lib/dcma.ts` | Add check 17 (`checkOpenDelayReconciliation`). Extend `DcmaAssessmentContext` to include `delays` array. Update `CHECK_DEFINITIONS` array — DCMA-17 enters under logic-quality subscore bucket. |
| `src/lib/health.ts` | The composite health subscore weights live here. **Decision:** v1.8 does NOT reweight subscores. DCMA-17 enters the existing "logic quality" subscore bucket alongside checks 4, 5, 6, 13, 15. Document in `docs/dcma-checks.md`. |
| `src/lib/cpm.ts` | Add optional `projectCalendar?: CalendarEvent[]` parameter to `computeCriticalPath`. When provided, forward/backward pass uses `isCalendarNonWorkDay` in addition to weekend/holiday checks. Default = `[]` so existing callers are not broken. Unit test extends. |
| `src/lib/workdays.ts` | Add optional `projectCalendar?: CalendarEvent[]` parameter to `isWorkday` and `workdays`. Default = `[]`. When provided, `non_work` classified events disable the day. Existing callers continue to work. |
| `src/lib/variance.ts` | Add `computeVarianceByDelayCause(delays, varianceSnapshots, baselines, tasks) → Map<DelayType, { days, excusable, nonExcusable }>`. Used by the executive report and the variance trend section. |
| `src/lib/reportData.ts` | Extend `buildExecutiveReportData` to include `delayCauseAttribution: Array<{ cause, days, excusable }>`. Surfaced as plain text in `ExecutiveReportPreview`. |
| `src/lib/csv.ts` | Add `generateDelayLogCSV(delays, tasks) → string`. Schedule CSV (existing v1.7 export) is unchanged. |
| `src/components/App.tsx` | Add state derivations: `projectCalendar`, `delays` (both from `persistedState`). Update CPM memo to consume `projectCalendar`. Update workday-dependent memos (`progress`, `dcma`) to pass `projectCalendar` where applicable. Add `calendarOverlayEnabled: boolean` transient state with default `false`. Wire the modals (`ProjectCalendarManager`, `DelayLogPanel`, `DelayEntryModal`) via the existing modal-open pattern. |
| `src/components/topbar/TopBarOverflowMenu.tsx` | Add two new entries: "Project Calendar…" and "Delay Log…". The overflow menu already exists (v1.7 Phase 0.1) — extend the entry list. |
| `src/components/gantt/GanttHeader.tsx` | Add `CalendarToggle` chip next to zoom controls (right side). |
| `src/components/gantt/Gantt.tsx` | Render `CalendarOverlay` above the grid layer, below the task-bar layer, when `calendarOverlayEnabled === true`. Render `DelayMarkers` over task bars unconditionally (markers are part of the bar, not the overlay toggle). |
| `src/components/modals/WorkweekModal.tsx` | Add "Project Calendar →" button at the bottom that calls the prop callback to open `ProjectCalendarManager`. |
| `src/components/panels/SidePanel.tsx` | Insert `SidePanelDelaysSection` between `ChangeOrderSection` and `DependenciesSection`. |
| `src/components/quality/DcmaFindingsTable.tsx` | Renders 17 checks instead of 16. "Show all 16 checks" toggle copy updates to "Show all 17 checks". |
| `src/components/reports/ExecutiveReportPreview.tsx` | Add the variance-by-delay-cause plain-text slice under the existing variance section. |
| `src/lib/icons.ts` | Add `CalendarBlank`, `Cloud`, `Wrench`, `WarningCircle` (Phosphor) — used by `CalendarToggle`, `DelayLogPanel` row indicators, and the SidePanel sections. |
| `src/constants.ts` | Add: `CALENDAR_OVERLAY_HATCH_STROKE = 1`, `CALENDAR_OVERLAY_HATCH_SPACING = 6`, `CALENDAR_OVERLAY_OPACITY = 0.35`, `DELAY_MARKER_HEIGHT = 6`, `DELAY_NARRATIVE_MAX_LENGTH = 1000`, `DELAY_CSV_HEADER_VERSION = 1`. |
| `src/styles/tokens.css` | Add: `--calendar-overlay-stripe`, `--calendar-event-edge`, `--delay-marker-excusable`, `--delay-marker-non-excusable`, `--delay-log-pending-bg`, `--delay-log-accepted-bg`, `--delay-log-rejected-bg`, `--variance-attribution-text` — under both light root and dark-mode overrides. |
| `docs/design-system.md` | Document v1.8 tokens (calendar overlay stripe, delay markers, variance-attribution typography). |
| `docs/dcma-checks.md` | Add entry for check 17. Document the "no subscore reweight in v1.8" decision (consistent with v1.7 §5.3). |
| `docs/onboarding-qa.md` | Recommend exploring calendar add + delay log after first baseline capture. |
| `docs/reports.md` | Variance section: document the new delay-cause attribution slice. |
| `CHANGELOG.md` | Add `0.8.0` entry on ship. |
| `package.json`, `package-lock.json` | Version bump `0.7.0` → `0.8.0`. |
| `README.md` | Mention project calendar overlay + delay log + DCMA-17 + variance by delay cause. |

### 5.4 Files unchanged (explicit non-goals)

| File | Why we are leaving it alone |
|---|---|
| `src/lib/baselines.ts` | Baselines remain user-captured immutable snapshots. Delays affect *variance* against the baseline (computed live), never the baseline itself. |
| `src/lib/changeOrders.ts` | Unchanged. Delays are distinct from change orders — a change order is a *contract amendment*, a delay is an *event record*. They may coexist on the same task. |
| `src/lib/wbs.ts`, `rollups.ts`, `actualCost.ts` | v1.7 modules; untouched. |
| `src/lib/floatDistribution.ts`, `logicValidation.ts` | v1.4 modules; untouched. |
| `src/lib/cost.ts`, `evm.ts`, `scurve.ts`, `cashflow.ts`, `weeklyReport.ts` | v1.6 / v1.7 modules; untouched. |
| `src/lib/csv.ts` *(main schedule export)* | The schedule CSV columns are unchanged. Delays export is a separate `generateDelayLogCSV` function in the same file. |
| `src/components/reports/EVMPreview.tsx`, `SCurvePreview.tsx`, `CashFlowPreview.tsx` | v1.6 / v1.7 surfaces; untouched. |
| `src/components/reports/charts/*` | v1.6 / v1.7 charts; untouched. |
| `src/components/modals/PrintPreviewModal.tsx` | Print stays as v1.7 ships it. Calendar overlay is on-screen only per §3.2 decision. |
| Mobile bottom sheet | No mobile-specific UI for v1.8; desktop-first per Phase 0.I. |
| Marketing page | Chronic deferral continued (Phase 0.F). |

---

## 6. UI surface map

```
┌─ TopBar (post-v1.7 — overflow menu carrying v1.8 additions) ─────────────────┐
│ MAKE · Project │ Baselines ▾ │ Quality │ Reports │              [More… ▾]   │
│                                                                       ↑       │
│                                  Overflow menu opens:                         │
│                                    Phases · Parties · Resources · COs         │
│                                    ── (v1.8 additions) ──                     │
│                                    Project Calendar… · Delay Log…             │
└──────────────────────────────────────────────────────────────────────────────┘

┌─ Gantt header — Calendar toggle next to zoom controls ───────────────────────┐
│ [▥ Cal]   1d ▼  1w   1m   3m         ← zoom + new calendar overlay toggle    │
└──────────────────────────────────────────────────────────────────────────────┘

┌─ Gantt body — calendar overlay (diagonal hatch) over Mar 14-17 owner shutdown┐
│              Feb         Mar               Apr                                │
│  Excav     ████████                                                          │
│  Form         ████████████░░░░░             ← delay marker on bar top         │
│  Pour                  ░░░░░░░██████████                                      │
│                        ╱╱╱╱╱╱╱  ← diagonal hatch overlay = non-work calendar  │
└──────────────────────────────────────────────────────────────────────────────┘

┌─ ProjectCalendarManager modal ───────────────────────────────────────────────┐
│ Project Calendar · 5 events                                       [+ New]    │
│ ─────────────────────────────────────────────────────────────────             │
│ Start        End          Name                  Type           Class         │
│ 2026-03-14   2026-03-17   Owner shutdown        owner_shutdown non_work      │
│ 2026-04-01   2026-04-01   Provincial holiday    holiday        non_work      │
│ 2026-04-15   2026-04-22   Spring break (advisory) other         advisory     │
│ 2026-06-30   2026-07-01   Canada Day window     holiday        non_work      │
│ 2026-08-12   2026-08-13   Forecast storm        weather_window non_work      │
└──────────────────────────────────────────────────────────────────────────────┘

┌─ DelayLogPanel modal ────────────────────────────────────────────────────────┐
│ Delay Log · 4 events · 2 pending reconciliation         [Export CSV]  [+ New]│
│ ─────────────────────────────────────────────────────────────────             │
│ Date range            Type            Excusable   Days   Affected    Recon. │
│ 2026-03-14→2026-03-17 owner_directive yes          4     12 tasks    accept │
│ 2026-08-12→2026-08-13 weather         yes          2     3 tasks     pending│
│ 2026-04-22→2026-04-25 contractor      no           4     1 task      reject │
│ 2026-05-03→2026-05-05 weather         yes          3     5 tasks     pending│
│   ▾ expanded row:                                                            │
│     Responsible: Owner (CO-007 reference)                                    │
│     Critical path impact: +4 days                                            │
│     Narrative: Owner-directed site closure for substation switchover…        │
│     Affected tasks: 1.3.2.1 Excavation; 1.3.2.2 Form/rebar; …                │
└──────────────────────────────────────────────────────────────────────────────┘

┌─ SidePanel (task selected) — new Delays section ─────────────────────────────┐
│ 1.3.2.1 — Excavation                                                   [✕]   │
│ ──────────────────────────────────────────────────                            │
│ Planned: 2026-03-01 → 2026-03-14                                              │
│ Actuals: 2026-03-01 → —                                                       │
│ Resources: ▼ Excavator × 1 · Operator × 2                                     │
│ Actual cost (USD):  [  18,420.00          ]                                   │
│ Change orders: ▼  CO-007 Site logistics replan  +0d  +$0                      │
│ Delays: ▼                                                                     │
│   • 2026-03-14→2026-03-17  owner_directive  4d (excusable)    pending →      │
│   • 2026-05-03→2026-05-05  weather          3d (excusable)    pending →      │
│   [+ Add delay…]                                                             │
│ Dependencies: ▼                                                                │
└──────────────────────────────────────────────────────────────────────────────┘

┌─ Quality Panel — DCMA table with 17 checks ──────────────────────────────────┐
│ DCMA findings (failing only) — Show all 17 checks ▾                          │
│   4. Orphan tasks               FAIL    3 tasks affected                     │
│   6. Float distribution         FAIL    median 4d (target 10–20d)            │
│  15. WBS completeness           FAIL    2 groups without children            │
│  17. Open delay reconciliation  FAIL    2 delays pending reconciliation      │
└──────────────────────────────────────────────────────────────────────────────┘

┌─ Executive report — variance section gains delay-cause attribution ──────────┐
│ Variance against Baseline 2:                                                 │
│   Total slip: 14 days                                                        │
│   Attribution: 9d owner_directive (excusable) · 3d weather (excusable)       │
│                · 2d contractor_caused (non-excusable)                         │
│   Top variances:  1.3.2.4 Pour foundation walls  +6d                         │
│                   1.4.1   MEP rough-in           +5d                         │
│                   2.1.3   Slab on grade          +3d                         │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 6.1 CalendarOverlay rendering

- SVG layer absolutely positioned over the Gantt grid, sized to match `timeline.totalPx × ganttHeight`.
- Diagonal hatch via `<pattern>` (45° rotation, 1px stroke, 6px spacing) referenced by each event's `<rect>`.
- Stroke color: `--calendar-overlay-stripe`. Background fill: `transparent`.
- Each event rect has 1px left + right border in `--calendar-event-edge` for crisp boundaries.
- Z-index strictly: grid (0) → overlay (1) → bars (2) → arrows (3) → today line (4).
- `pointer-events: none` so overlay never blocks bar clicks.
- Hover detection happens via a *separate* invisible hit area in `Gantt.tsx`; hovering an overlay reveals a small tooltip with event name + classification.

### 6.2 DelayMarkers

- Rendered as part of `GanttBar.tsx` (NOT as a separate overlay layer) for memo-correctness — markers move with bars.
- 6px tall, full bar width minus 2px on each side.
- Background color: `--delay-marker-excusable` (when delay.excusable=true) or `--delay-marker-non-excusable` (otherwise).
- Positioned at `top: -7px` relative to the 20px bar (so it sits just above the bar, not overlapping the date).
- Multiple delays on the same task render as side-by-side segments (proportional to days), not stacked.
- `aria-label="2 delays recorded on this task (1 excusable, 1 non-excusable)"`.
- Click on a marker opens `DelayLogPanel` scrolled to the matching delay.

### 6.3 ProjectCalendarManager modal

- Standard modal pattern (matches `GroupsManager`, `ResourcesManager`, `PartiesManager`).
- Per-row columns: Start, End, Name, Type, Classification, Notes (truncated), Actions (edit, delete).
- "New event" inline form at top expands to: date pickers (start, end), text input (name, 80 char max), type select, classification select (defaults from type — `holiday` → `non_work`, `weather_window` → `non_work`, `union_action` → `non_work`, `owner_shutdown` → `non_work`, `other` → `advisory_only`), notes textarea (200 char max).
- Validation: `start ≤ end`, `name` required, dates within timeline range or surface advisory.

### 6.4 DelayLogPanel modal

- Tabular layout with sortable columns. Default sort: `start` descending.
- Reconciliation pill colors: `--delay-log-pending-bg` (amber), `--delay-log-accepted-bg` (green), `--delay-log-rejected-bg` (red).
- Row expansion (click chevron) reveals: narrative (full text, no truncation), responsible party, critical-path impact days, full affected-task list with WBS codes.
- Actions row: `Edit`, `Reconcile → accepted`, `Reconcile → rejected`, `Copy as CSV row`.
- Bulk action: `Export CSV` (top right).
- Empty state: "No delays recorded yet. When a delay happens, log it here so the variance attribution is complete."

### 6.5 DelayEntryModal

- Opens from `DelayLogPanel [+ New]`, `SidePanelDelaysSection [+ Add delay…]`, and `DelayLogPanel row Edit`.
- Fields: start date, end date, type (select), affected-tasks (multi-select with type-ahead, defaulted to current task if invoked from SidePanel), responsible party (text), narrative (textarea, `DELAY_NARRATIVE_MAX_LENGTH` = 1000), excusable (toggle — defaulted from type, user can override).
- On save: `delays.ts:createDelay` stamps `id`, `recordedAt`, derived `excusable` (if user didn't override). `delayImpact.ts:computeDelayImpact` runs to stamp `criticalPathImpactDays`. Result is added to `persistedState.delays`.
- Save closes modal and re-opens parent context (delay log panel or SidePanel) with the new row visible.

### 6.6 SidePanelDelaysSection

- Section heading: "Delays" (matches existing section-heading typography).
- List of delays where `delay.affectedTaskIds.includes(currentTaskId)`.
- Per-row compact display: `start→end  type  Nd (excusable/non-excusable)  reconciliation` with `→` chevron.
- Click row → opens `DelayLogPanel` scrolled to that delay.
- `[+ Add delay…]` button at the bottom opens `DelayEntryModal` pre-filled with the current task.
- Empty state: "No delays recorded for this task."

### 6.7 CalendarToggle chip

- Small monospaced chip in `GanttHeader`, immediately to the right of the zoom selector (or above on narrow widths).
- Label: `Cal` (when off) / `Cal ✓` (when on) — monospaced uppercase.
- Icon-prefixed with Phosphor `CalendarBlank`.
- Click toggles `calendarOverlayEnabled` state in App.
- Keyboard: Tab into chip, Enter / Space toggles.
- ARIA pressed state reflected.

### 6.8 DelayCauseAttribution

- Plain-text component, no chart.
- Format: `Attribution: {N1}d {cause1} ({excusable_class}) · {N2}d {cause2} ({excusable_class}) · …`.
- Sorted by days descending.
- Renders nothing when `delays.length === 0`.
- Used in `ExecutiveReportPreview.tsx`.

### 6.9 CSV export — delay log

- Filename: `delays-{slugged-project-name}-{ISO-date}.csv`.
- Columns: `ID, Recorded At, Start, End, Type, Excusable, Affected Task IDs, Affected Task Names, Days Impact, Critical Path Impact Days, Responsible Party, Narrative, Reconciliation`.
- Narrative is double-quoted to preserve commas and newlines.
- `Affected Task IDs` and `Affected Task Names` are semicolon-joined within a quoted cell (so a CSV consumer doesn't have to split on commas).
- Encoding: UTF-8 with BOM (for Excel compatibility).

---

## 7. Architecture impact

### 7.1 State ownership

`App.tsx` continues to own all state. New persisted slices via the v4 → v5 walk (§5.1):
- `projectCalendar: CalendarEvent[]`
- `delays: Delay[]`

New transient UI state:
- `calendarOverlayEnabled: boolean` (default `false`, per-session)
- `projectCalendarModalOpen: boolean`
- `delayLogPanelOpen: boolean`
- `delayEntryModalContext: { mode: 'create' | 'edit', taskId?: string, delayId?: string } | null`

### 7.2 Pure library boundary

All three new lib modules (`projectCalendar.ts`, `delays.ts`, `delayImpact.ts`) are pure. They take inputs, return outputs. No React imports. No localStorage touches. Only `storage.ts` knows persistence. The v1.3 / v1.4 / v1.5 / v1.6 / v1.7 / v1.8 architectural shape holds — this is Key Design Decision #9 per CLAUDE.md.

### 7.3 No new dependencies

v1.8 uses only primitives already in the project:
- Native `<input type="date">` for date pickers (no `react-datepicker`, `flatpickr`, etc.)
- Native `Intl.DateTimeFormat` for any date formatting
- Existing React state for transient UI flags
- Phosphor icons (existing dep, add `CalendarBlank`, `Cloud`, `Wrench`, `WarningCircle`)
- CSS custom properties for new colors
- Pure SVG `<pattern>` for diagonal-hatch overlay (no calendar libs, no canvas)

If a contributor proposes a calendar / date-picker library, S3 triggers.

### 7.4 Memoization plan

Calendar / delay computations are O(events + delays + tasks) per derivation. They must be memoized at the App level:

```ts
const isCalendarNonWorkDayMemo = useMemo(
  () => (dateStr: string) => isCalendarNonWorkDay(dateStr, projectCalendar),
  [projectCalendar]
);

const cpm = useMemo(
  () => computeCriticalPath(tasks, dependencies, workweek, holidays, projectCalendar),
  [tasks, dependencies, workweek, holidays, projectCalendar]
);

const delayImpactByDelayId = useMemo(() => {
  const map = new Map<string, { criticalPathImpactDays: number; affectedDownstreamTaskIds: string[] }>();
  for (const d of delays) {
    map.set(d.id, computeDelayImpact(d, tasks, dependencies, cpm, projectCalendar));
  }
  return map;
}, [delays, tasks, dependencies, cpm, projectCalendar]);

const varianceByDelayCause = useMemo(
  () => computeVarianceByDelayCause(delays, varianceSnapshots, baselines, tasks),
  [delays, varianceSnapshots, baselines, tasks]
);
```

The existing v1.7 CPM memo at App level extends its dependency list to include `projectCalendar` (and triggers when calendar changes). The performance impact is bounded because typical calendar event count is <20 even on large projects.

### 7.5 Stamping critical-path impact on delay records

Two options considered:
- (a) **Compute on save**, stamp `criticalPathImpactDays` on the delay record at the moment of creation/edit. Persisted on the record.
- (b) **Compute on the fly during render**, never persist — recompute every time.

**Decision: (a) — stamp at save time.** Rationale: The delay record is *evidence*. The impact at the time of recording is what mattered to the PM in the moment. If CPM later changes (because other tasks shifted), the historical impact recorded on the delay should NOT silently change — that would corrupt the audit trail. A re-recompute is available via the DelayLogPanel "Recalculate" action per row (manual, deliberate).

Implementation: `DelayEntryModal` save flow calls `computeDelayImpact` and writes the result back into the delay record before persisting. Same on Edit. A manual "Recalculate impact" action on the DelayLogPanel re-runs the computation against current state.

### 7.6 Calendar-CPM integration semantics

The existing `cpm.ts` already respects workweek + holidays via `workdays.ts`. v1.8 adds `projectCalendar` as a *third* non-work source:
- A day is a workday if and only if: `workweek[dow] === true` AND `!holidays.includes(date)` AND `!isCalendarNonWorkDay(date, projectCalendar)`.
- Calendar events with classification `advisory_only` do NOT make the day non-work — they're informational only (e.g., "Spring break — reduced sub availability").
- Calendar events with classification `reduced_capacity` do NOT make the day non-work in v1.8 — they're surfaced visually (different overlay style? **decision: no — same hatch style for v1.8, defer differentiation to v2.x**) but treated as workdays in CPM math. (Reduced capacity is a per-resource semantic; v1.8 doesn't ship per-resource calendars per §3.2.)
- Only `non_work` classification disables the day in CPM.

This split is documented in `docs/calendar-and-delays.md` so the agent reading the spec at audit time has clear semantics.

---

## 8. Performance contract

| Metric | Target | Measurement |
|---|---|---|
| Phase 0.3 — initial app render at 500 tasks × 25 resources × 50 groups, with empty calendar / delays | No regression vs v1.7 baseline (`docs/perf-v1.7-baseline.md`) | `performance.now()` around `App` mount |
| Initial render at 500 tasks × 25 resources × 20 calendar events × 30 delays | <+10% vs empty-calendar baseline | Phase J re-measure |
| Quality Panel cold-open with 17 checks (DCMA-17 added) | Hold v1.6 §8 target (≤100ms mean, ≤120ms 95p) — DCMA-17 is O(delays) which is small | `performance.now()` around panel mount |
| CalendarOverlay render at 500-task fixture × 20 calendar events | <8ms first paint; <33ms re-render on scroll/zoom | Devtools profiler |
| CPM recompute with `projectCalendar = []` (empty) | Identical to v1.7 baseline (no regression) | `performance.now()` around `computeCriticalPath` |
| CPM recompute with 20 calendar events | <+15% vs empty-calendar CPM | `performance.now()` |
| `computeDelayImpact` per delay at 500-task fixture | <8ms per delay | `performance.now()` |
| DelayLogPanel render with 100 delay rows | <40ms first paint | Devtools profiler |
| `generateDelayLogCSV` with 100 delays | <30ms | `performance.now()` |
| Build size delta (v1.7 → v1.8) | <+25KB JS gzipped | `npm run build` bundle report |
| No regression on v1.7 perf baselines | unchanged | Re-run after Phase J |

---

## 9. Phased task breakdown

Each task ≤3 files, one commit. Phases ordered by dependency.

### Phase 0 — Pre-flight + branch adoption + housekeeping (BLOCKING)

| # | Task | Files |
|---|------|-------|
| 0.−2 | **Pre-flight: verify v1.7 shipped to `main`.** `git fetch origin --tags`, check `git log origin/main` for v1.7 merge `0eac6b6`, check `git tag --list 'v0.7.0'` (surface S13 only if BOTH merge and `package.json:0.7.0` not in place; the missing tag alone is acknowledged in §4.4 Phase 0.H sister item — record but do not block). Verify `package.json` on `main` reads `0.7.0`. If verification fails → S13. | (git) |
| 0.−1 | **Pre-flight: verify clean working tree** (or only `playwright-report/index.html` noise). If anything else dirty → S13. | (git) |
| 0.0 | **Adopt existing `v1.8` branch.** `git checkout v1.8`, verify parity with `origin/main` via `git diff origin/main v1.8 --stat` (must be empty), fast-forward if needed, set upstream via `git push -u origin v1.8`. Capture the verification output in the first commit message. | (git) |
| 0.A | **Verify `.claude/CLAUDE.md` reflects v1.7 shipped / v1.8 active** (Claude has already refreshed) | `.claude/CLAUDE.md` |
| 0.B | **Verify `.claude/START-HERE.md` active pointer = plan-v1.8** (Claude has already refreshed) | `.claude/START-HERE.md` |
| 0.C | **Verify `.claude/version-status.md` shows v1.7 ✅ shipped + v1.8 ⏳ active** (Claude has already refreshed) | `.claude/version-status.md` |
| 0.D | **Update `.claude/AGENT-HANDOFF.md` for v1.8 implementation start** (Codex writes this entry at the start of its first v1.8 session) | `.claude/AGENT-HANDOFF.md` |
| 0.E | **Append final-ship entry to `plan-v1.7.md §17`** noting PR #16 merge + `v0.7.0` tag-pending state | `.claude/plan-v1.7.md` |
| 0.F | Document marketing-v2-pass explicit deferral decision (no implementation; recorded in §4.4) | (no file change) |
| 0.G | Document branch-pile-up continue-keeping decision (no implementation) | (no file change) |
| 0.H | **`v0.5.0` historical tag audit.** Create `docs/release-tags-audit.md` listing which tags exist on origin (`v0.1.0`, `v0.2.0`, `v0.3.0`, `v0.4.0`, `v0.6.0`) and which are missing (`v0.5.0`, `v0.7.0`), with the merge commits they belong on. Recommend human action. Do NOT auto-create tags. | `docs/release-tags-audit.md` (new) |
| 0.I | Re-affirm desktop-first mobile QA defer with dated v1.8 entry (6th audit running) | `docs/mobile-qa.md` |
| 0.J | Document `Task.deps[]` lint-rule explicit deferral to v2.0 (no implementation) | (no file change) |
| 0.K | **Capture v1.7-baseline perf snapshot** for delta comparison post-implementation. Document in `docs/perf-v1.8-baseline.md`. | `docs/perf-v1.8-baseline.md` (new) |

### Phase A — Pure calendar + delays + impact libraries

| # | Task | Files |
|---|------|-------|
| A.1 | Extend types: `CalendarEvent`, `CalendarEventType`, `CalendarEventClassification`, `Delay`, `DelayType`, `DelayReconciliation`. Extend `PersistedState` with `projectCalendar`, `delays`. Bump `PERSISTED_SCHEMA_VERSION` to **5**. Extend `DcmaCheckId` union to include `17`. | `src/types/index.ts` |
| A.2 | Scaffold `src/lib/projectCalendar.ts` with `isCalendarNonWorkDay`, `getActiveCalendarEvents`, `validateCalendarEvent` | `src/lib/projectCalendar.ts` (new) |
| A.3 | Unit tests for `projectCalendar.ts` (non-work detection, overlapping events, advisory-only ignored, validation rules) | `tests/unit/lib/projectCalendar.test.ts` (new) |
| A.4 | Scaffold `src/lib/delays.ts` with `createDelay`, `validateDelay`, `groupDelaysByCause` | `src/lib/delays.ts` (new) |
| A.5 | Unit tests for `delays.ts` (excusable defaults derived correctly, validation, grouping aggregation) | `tests/unit/lib/delays.test.ts` (new) |
| A.6 | Scaffold `src/lib/delayImpact.ts` with `computeDelayImpact` (consumes CPM result + projectCalendar) | `src/lib/delayImpact.ts` (new) |
| A.7 | Unit tests for `delayImpact.ts` (float-consumed → no CP impact, CP-pushing delay, overlapping weekend, overlapping calendar event) | `tests/unit/lib/delayImpact.test.ts` (new) |
| A.8 | Document v1.8 calendar + delay spec in `docs/calendar-and-delays.md` (event types, classifications, delay types, excusable rules, reconciliation states, impact semantics, CSV schema) | `docs/calendar-and-delays.md` (new) |

### Phase B — Schema migration v4 → v5

| # | Task | Files |
|---|------|-------|
| B.1 | Extend `migrateState` with v4 → v5 walk: `projectCalendar ??= []`, `delays ??= []`. Update `makeDefaultState`. | `src/lib/storage.ts` |
| B.2 | Unit tests for migration (v4 payload loads cleanly with empty arrays; round-trip v4 → v5 → v5 has no field drift; v1.7 fixture migrates without other-field mutation) | `tests/unit/lib/storage.test.ts` (extend) |

### Phase C — Workday + CPM integration with project calendar

| # | Task | Files |
|---|------|-------|
| C.1 | Extend `workdays.ts:isWorkday` and `workdays.ts:workdays` with optional `projectCalendar` argument; default `[]` for back-compat. | `src/lib/workdays.ts` |
| C.2 | Unit tests for extended `workdays.ts` (empty calendar matches existing behaviour; non_work event disables a day; advisory_only event leaves day workday). | `tests/unit/lib/workdays.test.ts` (new or extend) |
| C.3 | Extend `cpm.ts:computeCriticalPath` with optional `projectCalendar` argument; default `[]`. Forward/backward pass consumes via `workdays.ts`. | `src/lib/cpm.ts` |
| C.4 | Extend `cpm.test.ts` — new fixture asserting CPM with calendar event shifts task end; assert empty-calendar CPM is byte-identical to v1.7 output. | `tests/unit/lib/cpm.test.ts` (extend) |

### Phase D — App.tsx wiring

| # | Task | Files |
|---|------|-------|
| D.1 | Read `projectCalendar` and `delays` from persisted state; thread into App-level memoizations. | `src/components/App.tsx` |
| D.2 | Extend CPM memo dependency list to include `projectCalendar`; pass argument. | `src/components/App.tsx` |
| D.3 | Add `calendarOverlayEnabled` transient state + setter; add modal-open transient state for ProjectCalendarManager / DelayLogPanel / DelayEntryModal. | `src/components/App.tsx` |
| D.4 | Memoize `delayImpactByDelayId` map (per-delay impact snapshot) and `varianceByDelayCause` map. | `src/components/App.tsx` |

### Phase E — TopBar + Gantt header integration

| # | Task | Files |
|---|------|-------|
| E.1 | Extend `TopBarOverflowMenu` entries with "Project Calendar…" and "Delay Log…" — wire to App modal-open callbacks. | `src/components/topbar/TopBarOverflowMenu.tsx` |
| E.2 | Add `CalendarToggle.tsx` chip component (icon + label + ARIA pressed). | `src/components/topbar/CalendarToggle.tsx` (new), `src/lib/icons.ts` (`CalendarBlank`) |
| E.3 | Wire `CalendarToggle` into `GanttHeader.tsx`, passing the App-level `calendarOverlayEnabled` state. | `src/components/gantt/GanttHeader.tsx` |

### Phase F — CalendarOverlay + DelayMarkers

| # | Task | Files |
|---|------|-------|
| F.1 | Scaffold `CalendarOverlay.tsx` — SVG layer with `<pattern>` diagonal-hatch fills per event. Respect z-index per §6.1. | `src/components/gantt/CalendarOverlay.tsx` (new), `src/styles/tokens.css` (`--calendar-overlay-stripe`, `--calendar-event-edge`) |
| F.2 | Mount `CalendarOverlay` in `Gantt.tsx` between grid and bars, gated by `calendarOverlayEnabled`. | `src/components/gantt/Gantt.tsx` |
| F.3 | Implement hover-tooltip surface in `Gantt.tsx` (invisible hit area → event name + classification). | `src/components/gantt/Gantt.tsx` |
| F.4 | Scaffold `DelayMarkers.tsx` — segment-style markers inside the bar div, rendered as part of `GanttBar.tsx` for memo correctness. | `src/components/gantt/DelayMarkers.tsx` (new), `src/components/gantt/GanttBar.tsx`, `src/styles/tokens.css` (`--delay-marker-excusable`, `--delay-marker-non-excusable`) |
| F.5 | Marker click → open `DelayLogPanel` scrolled to matching delay (callback from `GanttBar` up through Gantt to App). | `src/components/gantt/GanttBar.tsx`, `src/components/gantt/Gantt.tsx`, `src/components/App.tsx` |

### Phase G — ProjectCalendarManager + DelayLogPanel + DelayEntryModal

| # | Task | Files |
|---|------|-------|
| G.1 | Scaffold `ProjectCalendarManager.tsx` — list view + inline new-event form + per-row edit/delete. | `src/components/modals/ProjectCalendarManager.tsx` (new) |
| G.2 | Wire calendar event add/edit/delete actions through App callbacks (`onAddCalendarEvent`, `onUpdateCalendarEvent`, `onDeleteCalendarEvent`). | `src/components/App.tsx`, `src/components/modals/ProjectCalendarManager.tsx` |
| G.3 | Extend `WorkweekModal` with "Project Calendar →" button. | `src/components/modals/WorkweekModal.tsx` |
| G.4 | Scaffold `DelayLogPanel.tsx` — sortable table, reconciliation pills, expanded-row narrative, CSV export button, [+ New] button. | `src/components/modals/DelayLogPanel.tsx` (new), `src/styles/tokens.css` (delay-log reconciliation tokens) |
| G.5 | Scaffold `DelayEntryModal.tsx` — date pickers, type/excusable selects (with derivation), multi-select task picker, narrative textarea. Run `computeDelayImpact` on save and stamp `criticalPathImpactDays`. | `src/components/modals/DelayEntryModal.tsx` (new) |
| G.6 | Wire delay add/edit/reconcile/recalculate actions through App callbacks. | `src/components/App.tsx`, `src/components/modals/DelayLogPanel.tsx`, `src/components/modals/DelayEntryModal.tsx` |

### Phase H — SidePanelDelaysSection + variance attribution

| # | Task | Files |
|---|------|-------|
| H.1 | Scaffold `SidePanelDelaysSection.tsx` — per-task delay list with [+ Add delay…]. | `src/components/panels/SidePanelDelaysSection.tsx` (new) |
| H.2 | Wire `SidePanelDelaysSection` into `SidePanel.tsx` between ChangeOrderSection and DependenciesSection. | `src/components/panels/SidePanel.tsx` |
| H.3 | Add `computeVarianceByDelayCause` to `variance.ts`. | `src/lib/variance.ts`, `tests/unit/lib/variance.test.ts` (extend) |
| H.4 | Extend `reportData.ts:buildExecutiveReportData` with `delayCauseAttribution`. | `src/lib/reportData.ts`, `tests/unit/lib/reportData.test.ts` (extend) |
| H.5 | Scaffold `DelayCauseAttribution.tsx` — plain-text component. Mount inside `ExecutiveReportPreview.tsx`. | `src/components/variance/DelayCauseAttribution.tsx` (new), `src/components/reports/ExecutiveReportPreview.tsx` |

### Phase I — DCMA check 17 + CSV export

| # | Task | Files |
|---|------|-------|
| I.1 | Implement `checkOpenDelayReconciliation` (DCMA-17) in `dcma.ts`. Extend `DcmaAssessmentContext` with `delays`. | `src/lib/dcma.ts` |
| I.2 | Wire `delays` into App's DCMA assessment callsite. | `src/components/App.tsx` |
| I.3 | Add DCMA-17 to `CHECK_DEFINITIONS`. Update `DcmaFindingsTable` copy "Show all 16 checks" → "Show all 17 checks". | `src/lib/dcma.ts`, `src/components/quality/DcmaFindingsTable.tsx` |
| I.4 | Extend `dcma.test.ts` with DCMA-17 passing fixture (zero pending delays) and failing fixture (multiple pending). | `tests/unit/lib/dcma.test.ts` (extend) |
| I.5 | Document DCMA-17 in `docs/dcma-checks.md`; note no subscore reweight in v1.8 (consistent with v1.7). | `docs/dcma-checks.md` |
| I.6 | Add `generateDelayLogCSV` to `csv.ts`. Schedule CSV signature unchanged. | `src/lib/csv.ts`, `tests/unit/lib/csv.test.ts` (extend) |
| I.7 | Wire "Export CSV" button in `DelayLogPanel` to download the generated CSV. | `src/components/modals/DelayLogPanel.tsx` |

### Phase J — Edge / loading / empty states + perf re-verify

| # | Task | Files |
|---|------|-------|
| J.1 | CalendarOverlay empty state (zero events) renders nothing; no SVG layer mounted. | `src/components/gantt/CalendarOverlay.tsx` |
| J.2 | DelayMarkers empty state (zero delays on task) renders nothing on the bar. | `src/components/gantt/GanttBar.tsx`, `src/components/gantt/DelayMarkers.tsx` |
| J.3 | DelayLogPanel empty state copy ("No delays recorded yet. When a delay happens, log it here so the variance attribution is complete."). | `src/components/modals/DelayLogPanel.tsx` |
| J.4 | SidePanelDelaysSection empty state copy ("No delays recorded for this task."). | `src/components/panels/SidePanelDelaysSection.tsx` |
| J.5 | DelayCauseAttribution renders `null` when `delays.length === 0`. | `src/components/variance/DelayCauseAttribution.tsx` |
| J.6 | Re-measure perf targets from §8; append post-implementation section to `docs/perf-v1.8-baseline.md`. | `docs/perf-v1.8-baseline.md` |

### Phase K — E2E coverage

| # | Task | Files |
|---|------|-------|
| K.1 | `tests/e2e/calendar-overlay.spec.ts` — toggle on, add an event, assert diagonal-hatch band visible on Gantt. | `tests/e2e/calendar-overlay.spec.ts` (new) |
| K.2 | `tests/e2e/delay-log.spec.ts` — add weather delay against a task, assert SidePanelDelaysSection updates, assert DCMA-17 flags pending, reconcile, assert DCMA-17 passes. | `tests/e2e/delay-log.spec.ts` (new) |
| K.3 | `tests/e2e/delay-impact.spec.ts` — record delay that pushes CP, assert criticalPathImpactDays computed and displayed. | `tests/e2e/delay-impact.spec.ts` (new) |
| K.4 | `tests/e2e/delay-csv-export.spec.ts` — export delay log CSV, assert columns + row count + CRLF/quoting. | `tests/e2e/delay-csv-export.spec.ts` (new) |
| K.5 | `tests/e2e/calendar-cpm.spec.ts` — add owner_shutdown event spanning a workweek, assert downstream tasks shift end dates. | `tests/e2e/calendar-cpm.spec.ts` (new) |
| K.6 | Extend `tests/e2e/quality-panel.spec.ts` — assert 17 checks render, "Show all 17 checks" copy. | `tests/e2e/quality-panel.spec.ts` |
| K.7 | Extend `tests/e2e/executive-report.spec.ts` — assert delay-cause attribution line renders when delays exist. | `tests/e2e/executive-report.spec.ts` |
| K.8 | Extend `tests/e2e/a11y.spec.ts` — axe sweep for ProjectCalendarManager, DelayLogPanel, DelayEntryModal, SidePanelDelaysSection. | `tests/e2e/a11y.spec.ts` |

### Phase L — Docs

| # | Task | Files |
|---|------|-------|
| L.1 | Update `docs/design-system.md` — v1.8 tokens (calendar overlay stripe, delay markers, reconciliation pills, variance-attribution text). | `docs/design-system.md` |
| L.2 | Update `docs/onboarding-qa.md` — recommend exploring project calendar + delay log after first baseline. | `docs/onboarding-qa.md` |
| L.3 | Verify `docs/dcma-checks.md` reflects 17 checks. | `docs/dcma-checks.md` |
| L.4 | Update `docs/reports.md` — variance section: delay-cause attribution slice. | `docs/reports.md` |
| L.5 | Verify `docs/calendar-and-delays.md` (created in A.8) is complete and reflects shipped surface. | `docs/calendar-and-delays.md` |

### Phase M — Release hygiene

| # | Task | Files |
|---|------|-------|
| M.1 | `CHANGELOG.md` entry for `0.8.0`. | `CHANGELOG.md` |
| M.2 | `package.json` + `package-lock.json` version bump to `0.8.0`. | `package.json`, `package-lock.json` |
| M.3 | README update — calendar, delay log, DCMA-17, variance-by-cause attribution. | `README.md` |
| M.4 | Run all gates: `npm run lint`, `npm run type-check`, `npm run test:unit`, `npm run build`, `npm run test:e2e`. | — |
| M.5 | Open PR `v1.8 → main`, await human review, squash/merge after green CI. | git |
| M.6 | Tag `v0.8.0` on the merge commit on `main` (human action; Codex surfaces the SHA and proposed tag command). | git tag |
| M.7 | Update `version-status.md` → v1.8 ✅ shipped; flag PM Audit Checkpoint 3 (Claude job). | `.claude/version-status.md` |
| M.8 | Append final Build Changelog entry in this file. | `.claude/plan-v1.8.md` §17 |
| M.9 | Update `AGENT-HANDOFF.md` — next action: Claude runs **PM Audit Checkpoint 3** (post-v1.8 single-user maturity gate) using `pm-audit-template.md`. | `.claude/AGENT-HANDOFF.md` |

---

## 10. Parallel vs sequential

| Parallel group | Tasks | Why |
|---|---|---|
| **G1a** | 0.−2 → 0.−1 → 0.0 (sequential — pre-flight gates the branch adoption) | Pre-flight must pass before branch adoption |
| **G1b** | 0.A, 0.B, 0.C, 0.D, 0.E in parallel after 0.0 | Doc verifies / single-line refreshes touch different files |
| **G1c** | 0.F, 0.G, 0.I, 0.J — doc-only or no-implementation, parallel | Independent |
| **G1d** | 0.H (release tags audit doc) parallel with 0.K (perf baseline) | Independent doc tasks |
| **G2** | A.2+A.3, A.4+A.5, A.6+A.7 in parallel after A.1 (types) | Three independent pure libs with independent test files. A.6 depends on CPM types being present in A.1; ok in parallel. |
| **G3** | B.1 → B.2 sequential | Migration is one file |
| **G4** | C.1 → C.2 sequential; C.3 → C.4 sequential; C.1+C.2 and C.3+C.4 can interleave | Workdays change is independent of CPM API change |
| **G5** | D.1–D.4 mostly sequential within App.tsx | One file |
| **G6** | E.1, E.2, E.3 sequential within TopBar/Gantt header chain | Each depends on the previous |
| **G7** | F.1+F.2+F.3 (overlay) and F.4+F.5 (markers) can run in parallel | Two distinct surfaces |
| **G8** | G.1+G.2 parallel with G.4+G.5; G.3 after G.1; G.6 after G.4 & G.5 | ProjectCalendarManager and DelayLogPanel are independent modals |
| **G9** | H.1+H.2 sequential; H.3+H.4+H.5 sequential after H.2 | SidePanel section first, then variance attribution chain |
| **G10** | I.1+I.2+I.3+I.4+I.5 sequential (DCMA-17 chain); I.6+I.7 in parallel with I.1–I.5 | CSV export is independent of DCMA |
| **G11** | K.1–K.8 in parallel after their respective phases land | Independent specs |

| Sequential | Depends on | Why |
|---|---|---|
| Phase A | Phase 0 | Branch adoption first |
| Phase B | Phase A.1 | Migration needs types |
| Phase C | Phase A.2 + A.6 | CPM extension uses projectCalendar |
| Phase D | Phase B + Phase C | App wiring needs migrated state + extended CPM |
| Phase E | Phase D | TopBar consumes App state |
| Phase F | Phase D + Phase E | Overlay + markers consume calendarOverlayEnabled + delays |
| Phase G | Phase D | Modals consume App state and callbacks |
| Phase H | Phase D + Phase G | SidePanel section + variance attribution use existing modal infra |
| Phase I | Phase A + existing v1.4–v1.7 DCMA infra | DCMA-17 consumes delays |
| Phase J | Phases F, G, H, I | Empty states need consumers |
| Phase K | Phases E, F, G, H, I | E2E covers integrated surface |
| Phase L | Phases E–I | Docs reflect implemented behaviour |
| Phase M | All other phases | Release |

**Critical path:** 0.−2 → 0.−1 → 0.0 → A.1 → A.2 → A.6 → B → C → D → F → G → H → I → K → M. Phases E joins parallel after D; Phases J / L join in parallel with K.

---

## 11. Testing strategy

### 11.1 Unit tests (new + extended)

| Module | Coverage |
|---|---|
| `lib/projectCalendar.ts` | Non-work detection (single event, overlapping events, advisory-only ignored, before-event date, after-event date); `getActiveCalendarEvents` returns the right events; `validateCalendarEvent` catches invalid date order, missing name, oversize notes. |
| `lib/delays.ts` | `createDelay` excusable defaults — weather/owner/force_majeure → excusable=true; contractor/subcontractor → false; other → user-supplied; recordedAt stamped to ISO string; id non-empty. `validateDelay` — start ≤ end, affectedTaskIds non-empty, narrative length ≤ DELAY_NARRATIVE_MAX_LENGTH. `groupDelaysByCause` — empty → empty map; mixed types → correct buckets. |
| `lib/delayImpact.ts` | Float-consumed delay (5d delay on task with 10d float) → CP impact = 0; CP-pushing delay → CP impact > 0 and equals net push; delay overlapping weekend → impact counts workdays only; delay during existing non_work calendar event → impact = 0; non-existent affectedTaskIds → impact = 0 with warning. |
| `lib/cpm.ts` (extend) | With `projectCalendar = []`, output is byte-identical to v1.7 output (regression guard); with a non_work event spanning a workweek, downstream task end dates shift by the workday count of the event; with an advisory_only event, no shift. |
| `lib/workdays.ts` (extend) | `isWorkday(d, ww, h, [])` matches `isWorkday(d, ww, h)` (back-compat); `isWorkday(d, ww, h, [{ start: d, end: d, classification: 'non_work', … }])` → false; `isWorkday(d, ww, h, [{ start: d, end: d, classification: 'advisory_only', … }])` → true. |
| `lib/storage.ts` (extend) | v4 payload migrates to v5 with `projectCalendar = []`, `delays = []`; round-trip v4 → v5 → v5 has no field drift; other v4 fields (wbsCode, actualCost, etc.) untouched. |
| `lib/dcma.ts` (extend) | DCMA-17 passing fixture (zero pending) → passed=true, score=1.0; DCMA-17 failing fixture (3 pending) → passed=false, affectedTaskIds = pending delay IDs. |
| `lib/variance.ts` (extend) | `computeVarianceByDelayCause` — single delay maps to one bucket; multiple delays of same type aggregate; excusable / non-excusable counts split correctly. |
| `lib/reportData.ts` (extend) | `buildExecutiveReportData` includes `delayCauseAttribution` array; empty delays → empty array (not null). |
| `lib/csv.ts` (extend) | `generateDelayLogCSV` produces correct header; narrative with commas + newlines is properly quoted; empty `delays` produces header-only CSV (with BOM). |
| Existing perf-sensitive tests | No regression — re-run after Phase J. |

**Target:** ≥400 unit tests after Phase I (currently ≥360 post-v1.7).

### 11.2 E2E tests (Playwright)

| Spec | Flow |
|---|---|
| `tests/e2e/calendar-overlay.spec.ts` (new) | Open ProjectCalendarManager, add `owner_shutdown` event spanning 3 days, close modal, toggle CalendarToggle ON, assert diagonal-hatch band visible on Gantt over the event date range; toggle OFF, assert overlay disappears. |
| `tests/e2e/delay-log.spec.ts` (new) | Open DelayLogPanel, [+ New], record a weather delay against a task, save; assert it appears in panel with reconciliation=pending; assert SidePanelDelaysSection on that task shows the row; assert DCMA-17 flags 1 pending; reconcile → accepted; assert DCMA-17 passes. |
| `tests/e2e/delay-impact.spec.ts` (new) | Record a delay overlapping a task with zero float; save; assert delay row shows `criticalPathImpactDays > 0`; assert downstream task end dates shifted accordingly. |
| `tests/e2e/delay-csv-export.spec.ts` (new) | Add 3 delays of mixed types; click Export CSV; assert downloaded filename pattern; parse CSV content; assert headers and row count match. |
| `tests/e2e/calendar-cpm.spec.ts` (new) | Add `owner_shutdown` event spanning Mar 14–17 on a task that starts Mar 14; assert task's end date shifts by 4 workdays; toggle CalendarToggle ON to confirm visual band. |
| `tests/e2e/quality-panel.spec.ts` (extend) | Default-failing-only view still works; "Show all 17 checks" copy correct; toggle reveals all 17 including DCMA-17. |
| `tests/e2e/executive-report.spec.ts` (extend) | With delays recorded, variance attribution line renders "Attribution: …"; without delays, line absent. |
| `tests/e2e/a11y.spec.ts` (extend) | ProjectCalendarManager, DelayLogPanel, DelayEntryModal, SidePanelDelaysSection all pass axe sweep. |

**Target:** ≥34 E2E specs after Phase K (currently ≥26 post-v1.7).

### 11.3 Accessibility tests

- `CalendarToggle`: button with `aria-pressed`; keyboard activates with Enter/Space.
- `ProjectCalendarManager` inline form: explicit `<label>` for every input; date inputs use `<input type="date">` with `aria-describedby` for hint text.
- `DelayLogPanel`: table semantics; sortable column headers have `aria-sort` attribute; row expansion chevrons have `aria-expanded`.
- `DelayEntryModal`: focus traps in modal, focus restored to invoker on close; multi-select task picker keyboard-navigable.
- `DelayMarkers` on Gantt bars: `aria-label="N delays recorded on this task"`; markers are keyboard-focusable when tabbing through bars.
- `SidePanelDelaysSection`: `<section>` landmark with heading; "[+ Add delay…]" is a `<button>` not an anchor.

### 11.4 Performance verification

After Phase K, re-run perf baseline at v1.7 scale with v1.8 features active:
- Initial render at 500 tasks × 25 resources × 50 groups × 20 calendar events × 30 delays: <+10% vs v1.7 baseline.
- Quality Panel cold-open with 17 checks: hold ≤100ms target.
- CalendarOverlay first paint: <8ms; re-render on scroll/zoom: <33ms.
- CPM recompute with `projectCalendar = []`: identical to v1.7 baseline.
- CPM recompute with 20 calendar events: <+15% vs empty-calendar baseline.
- DelayLogPanel render with 100 delay rows: <40ms.
- `generateDelayLogCSV` with 100 delays: <30ms.
- Build size delta: <+25KB gzipped.

### 11.5 Manual QA

| Path | Why manual |
|---|---|
| Add 5 calendar events of mixed types (holiday, owner_shutdown, weather_window, union_action, advisory) | Subjective — does the overlay read cleanly with multiple bands? Is type semantics obvious from name + classification? |
| Add a delay then edit a task's planned dates so the delay falls outside the task range | What happens to `criticalPathImpactDays`? Is the orphaned delay surfaced (or silently misleading)? Decide if a manual "Recalculate" button is required or if it auto-recomputes. |
| Print A3 Gantt with calendar overlay enabled on-screen | Confirm overlay is suppressed in print (§3.2 decision) — print stays clean. |
| Export delay log CSV and open in Excel | Encoding (BOM), narrative quoting (with commas + newlines), affected-task-name list formatting. |
| Toggle CalendarToggle ON at a 24-month zoom level | Frame drops on overlay render? Hover tooltip latency at this zoom? |
| Record a non-excusable delay and a weather delay on the same task | Both markers render side-by-side on the bar? Correct colors? |
| Reconcile all pending delays → assert DCMA-17 passes → capture a baseline | Workflow check: does the baseline-capture flow properly gate behind DCMA-17 (it does NOT need to block, but DCMA-17 should be visible in the Quality Panel before the user clicks capture). |

---

## 12. Quality gate — Gate 2 checklist

**Branch hygiene**
- [x] Plan reminds of the one-branch-per-version rule (and notes that `v1.8` already exists locally — adoption, not creation)
- [x] AGENTS.md § Conventions codifies the rule as permanent (since v1.4)
- [x] Phase 0.0 sets upstream tracking on `v1.8`

**Pre-flight & housekeeping**
- [x] Phase 0.−2 verifies v1.7 merged to `main` (merge commit `0eac6b6`) and `package.json` reads `0.7.0`; `v0.7.0` tag absence is acknowledged via Phase 0.H sister item but does NOT block branch adoption
- [x] Phase 0.−1 verifies clean working tree (or only known `playwright-report/index.html` noise)
- [x] Phase 0.A–0.E refresh / verify the `.claude/` doc surface
- [x] Phase 0.H surfaces the missing `v0.5.0` historical tag for human action (does not auto-create)
- [x] Phase 0.K captures v1.7 perf baseline for v1.8 delta comparison

**v1.7 carry-overs**
- [x] v1.7 closed cleanly; no structural carry-overs
- [x] Phase 0.I re-affirms desktop-first mobile QA defer (6 audits running)
- [x] Phase 0.J reaffirms `Task.deps[]` lint-rule deferral to v2.0
- [x] Phase 0.F reaffirms marketing-v2-pass deferral

**Architecture**
- [x] Calendar / delays / impact computations live in pure `src/lib/*` modules
- [x] **Schema bump 4 → 5** is additive, defaults applied, round-trip safe
- [x] No new runtime dependencies (no calendar libs, no date-picker libs, no chart libs, no PDF libs, no tree libs)
- [x] Delay records stamp `criticalPathImpactDays` at save time (audit-trail semantics)
- [x] App.tsx remains the single state owner; new derivations memoized at App level
- [x] CPM gains optional `projectCalendar` arg with `[]` default (back-compat for any external callers; none exist in repo)
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
- [x] E2E spec planned for each user-visible flow (overlay, delay log, delay impact, CSV, CPM integration)
- [x] axe a11y sweep extended to new modals + panels
- [x] Performance targets defined with measurement instructions
- [x] Round-trip migration test specified
- [x] Regression-guard test on empty-`projectCalendar` CPM output (must match v1.7 byte-for-byte)

**Discipline**
- [x] Scope-creep traps from §3.2 explicitly excluded
- [x] No chart libraries / no PDF libraries / no calendar libraries / no date-picker libraries (carry-forward)
- [x] No per-resource calendars
- [x] No claims-PDF export
- [x] No weather data integration
- [x] No delay approval workflow
- [x] Calendar + delays bundling justified in §3.3
- [x] Visual changes preserve v1.2's de-vibecoded posture
- [x] Delay markers are 6px bars, no icons, no tooltips
- [x] Calendar overlay is diagonal-hatch SVG, no labels, no decorations
- [x] DelayLogPanel is a list, not a dashboard (no charts, no donuts)
- [x] Codex operating rules embedded at top of plan
- [x] `.claude/` commit rule reaffirmed
- [x] `.gitignore` discipline reaffirmed
- [x] Context auto-compaction reaffirmed

Gate 2 passes. Plan is ready to execute.

---

## 13. Acceptance criteria — v1.8 ship gate

**Branch**
- [ ] All v1.8 commits live on branch `v1.8`
- [ ] `v1.8` upstream is `origin/v1.8`
- [ ] Ship merges via PR `v1.8 → main`
- [ ] Tag `v0.8.0` placed on the merge commit
- [ ] Branch deletion deferred (kept per v1.3–v1.7 pattern; revisited at PM Audit Checkpoint 3)

**Pre-flight & housekeeping (Phase 0)**
- [ ] `main` carries v1.7 merge commit `0eac6b6`; `package.json` on `main` reads `0.7.0`
- [ ] `v1.8` branch is content-parity with `origin/main` at Phase 0.0
- [ ] `.claude/CLAUDE.md` reflects v1.7 shipped / v1.8 active / schema bound for v5
- [ ] `.claude/AGENT-HANDOFF.md` repointed to v1.8 Codex implementation
- [ ] `.claude/version-status.md` shows v1.7 ✅ shipped, v1.8 ⏳ active
- [ ] `plan-v1.7.md` §17 final-ship entry appended
- [ ] `plan-v1.8.md` §17 maintained entry-per-phase from Phase 0.−2 onward
- [ ] `docs/release-tags-audit.md` documents missing tags for human action
- [ ] `docs/mobile-qa.md` carries a dated v1.8 desktop-first defer entry
- [ ] `docs/perf-v1.8-baseline.md` exists with v1.7-baseline comparison + post-implementation re-measure

**Capability — Calendar**
- [ ] `PersistedState.projectCalendar: CalendarEvent[]` exists; migration assigns `[]` to v4 saves
- [ ] `ProjectCalendarManager` modal opens from TopBar overflow; add/edit/delete works
- [ ] `WorkweekModal` shows "Project Calendar →" entry that opens the manager
- [ ] `CalendarToggle` chip in `GanttHeader` toggles overlay visibility
- [ ] `CalendarOverlay` renders diagonal-hatch bands for `non_work` events when toggle is ON; renders nothing when OFF
- [ ] Calendar events with `advisory_only` classification do NOT render as bands (text-only in the manager)
- [ ] CPM respects `non_work` events; downstream task end dates shift correctly
- [ ] Empty calendar (`projectCalendar = []`) produces byte-identical CPM output to v1.7

**Capability — Delays**
- [ ] `PersistedState.delays: Delay[]` exists; migration assigns `[]` to v4 saves
- [ ] `DelayLogPanel` modal opens from TopBar overflow; sortable, expandable rows
- [ ] `DelayEntryModal` add/edit flow works; `excusable` defaults derived from `type`; user can override
- [ ] `criticalPathImpactDays` stamped at save time on every delay record
- [ ] `SidePanelDelaysSection` lists delays per task; "[+ Add delay…]" pre-fills current task
- [ ] `DelayMarkers` render on Gantt bars: excusable vs non-excusable color-coded; multiple delays render side-by-side
- [ ] Reconciliation pill on each delay row (pending / accepted / rejected)
- [ ] CSV export of delay log produces a separate file (schedule CSV unchanged)
- [ ] CSV narrative cells properly quoted, BOM present, affected-task-IDs / -names semicolon-joined

**Capability — DCMA + variance attribution**
- [ ] DCMA check 17 ("Open delay reconciliation") exists; passes when zero pending, fails otherwise
- [ ] `DcmaFindingsTable` renders 17 checks; "Show all 17 checks" copy correct
- [ ] Variance-by-delay-cause section renders in executive report when delays exist; absent when empty
- [ ] Health subscore weights unchanged (no reweight in v1.8 per §5.3 decision)

**Discipline**
- [ ] `PERSISTED_SCHEMA_VERSION` is `5`
- [ ] Round-trip migration test green (v4 → v5 → reload → no drift)
- [ ] No new runtime dependencies
- [ ] No new gradients, card spam, KPI tiles, RAG indicators
- [ ] Every new icon is Phosphor from `src/lib/icons.ts`
- [ ] No hardcoded hex in any new component
- [ ] No `any`, no force-unwrap, TypeScript strict still clean
- [ ] Print mode unchanged (calendar overlay on-screen only)

**Trust**
- [ ] `npm run lint` clean
- [ ] `npm run type-check` clean
- [ ] `npm run test:unit` green (target: ≥400 tests after Phase I)
- [ ] `npm run build` clean; bundle delta <+25KB gzipped vs v1.7
- [ ] `npm run test:e2e` green (target: ≥34 specs after Phase K)
- [ ] Phase 0.K perf baseline + Phase J post-implementation re-measure documented
- [ ] CI on `v1.8` and on the merge to `main` verified green
- [ ] CHANGELOG, README, version bump landed
- [ ] `v0.8.0` tagged
- [ ] **PM Audit Checkpoint 3 scheduled** (Claude job — runs after ship per M.9)

---

## 14. Risks & mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| **Schema migration 4 → 5 corrupts existing v4 saves** | High | Unit test the v4 → v5 walk exhaustively (B.2). Round-trip test asserts no field drift. v1.7 fixture migrates without other-field mutation. If any corruption surfaces in manual QA, S2 triggers. |
| **CalendarOverlay competes visually with weekend bands / today line / dependency arrows** | Medium | Z-index strictly ordered (§6.1); diagonal-hatch pattern is distinct from flat weekend tint; manual QA path in §11.5 confirms legibility at multi-month zoom levels. If the overlay reads noisy, reduce opacity (`--calendar-overlay-stripe` alpha tweak) before changing the pattern. |
| **CPM with calendar arg silently regresses empty-calendar behavior** | High | Regression test in C.4 asserts byte-identical output when `projectCalendar = []`. Any deviation = fail. |
| **`criticalPathImpactDays` stamped at save becomes stale when CPM later changes** | Medium | This is intentional (audit-trail semantics per §7.5). Document in `docs/calendar-and-delays.md`. Provide a manual "Recalculate impact" action on the DelayLogPanel row for explicit user-driven refresh. |
| **DelayLogPanel grows large (>500 delays) and slows down** | Low | Empirically rare on a single project. Manual windowing if needed (already pattern in TaskList). For v1.8 ship, accept O(n) render; document threshold in `docs/calendar-and-delays.md`. |
| **DelayCauseAttribution renders confusingly when only one cause exists** | Low | Empty array → render nothing; single cause → "Attribution: 9d weather (excusable). 9d total slip." (no leading "·"). Document in `docs/reports.md`. |
| **CSV export with embedded narrative newlines breaks Excel** | Medium | Narrative is double-quoted per RFC 4180; CRLF line endings; BOM. Manual QA path in §11.5 confirms Excel opens cleanly. |
| **Calendar overlay tooltip latency at 24-month zoom** | Low | Hover-detection happens via single hit-area `<g>` element per event, not per day. O(events) which is small. If latency surfaces, debounce hover or pre-bake event lookups. |
| **Delay record references a deleted task (orphan affectedTaskId)** | Medium | `validateDelay` checks task existence at save time. On load, orphan IDs are filtered out with a console warning; `criticalPathImpactDays` is left as recorded (historical truth). Surface in DCMA-17 as a separate sub-condition? **Decision: v1.8 ships without orphan detection in DCMA-17.** Defer to v1.9 audit-trail work. |
| **Date-picker UX differs across browsers** (`<input type="date">`) | Low | Native picker variance is acceptable for an internal tool; Phase 0.I documents the desktop-first context. If a PM complains, swap to a single common picker style in v2.x. |
| **`v0.7.0` tag still missing at v1.8 ship time** | Medium | Phase M.7 surfaces it explicitly via `docs/release-tags-audit.md` update. Codex does NOT auto-create release tags. The pending-tag state does NOT block v1.8 PR open / merge (verified at M.5). |
| **PM Audit Checkpoint 3 fails on shipped v1.8** | Medium | Audit is post-ship; failure → identify gap → v1.9 Phase 0 close-out before v1.9 capability work. This is by design. |
| **Stop-and-ping triggers ignored** | High | Codified at top of plan + listed in §16. Every phase boundary reads the rules. |
| **Branch hygiene drift** | High | Codified in AGENTS.md; reminder at top of plan; verification step in Phase 0.0. |
| **Calendar event count creep (PMs adding decorative events)** | Low | `validateCalendarEvent` does not cap count. Document in `docs/calendar-and-delays.md` that the calendar is for *non-work and advisory* events only; do not use as a project journal. Self-discipline issue, not a code issue. |

---

## 15. Out of scope (deferred — reaffirmed)

See §3.2 for the canonical list. Highlights:

- **v1.9** — P6 / MPP / Procore integration + AC import from CSV + weather data integration + auto-pull delay narratives + claims-PDF export (partial)
- **v2.0** — Cloud sync + multi-user + change-order approval routing + audit trail + comments + presence + delay approval workflow
- **v2.1** — Portfolio dashboard + cross-project rollups (including delay-cause rollups) + project templates
- **v2.2** — Density modes + saved views (delay-cause filters, excusable-only views) + bulk edit + drag-to-resize delays on Gantt + drag-to-reparent + drag dependencies + offline mode + scenario / what-if delay simulation + per-resource calendars + time-of-day on calendar events

If a v1.8 PR includes any of the above, reject. Point at this section.

---

## 16. Stop-and-ping points (implementation agent pauses)

These are decisions the implementation agent must NOT make alone. Pause, surface, wait for human.

| # | Trigger | What to surface |
|---|---------|-----------------|
| **S1** | Phase F.1 — CalendarOverlay render at 500-task × 20-event fixture exceeds 8ms first paint OR 33ms re-render | Stop. Surface the profile. Decide between SVG-pattern simplification, reduced opacity, or deferring the overlay to a `requestIdleCallback`-driven mount. |
| **S2** | Any phase requires schema bump beyond v4 → v5 (i.e., needs more than additive `projectCalendar` / `delays`), OR delay-impact computation scope creeps past Phase G budget (e.g., cascading downstream prediction) | Stop. v1.8 is constrained to one schema bump and the bounded scope per §3.3. Surface the need before bumping again or expanding scope. |
| **S3** | Any phase requires a new runtime dependency (calendar lib, date-picker lib, chart lib, PDF lib, tree lib) | Stop. Surface the dependency, alternatives rejected, and bundle-size impact. v1.8 forbids new deps. |
| **S4** | A 500-task fixture round-trip through migration 4 → 5 loses or mutates any field beyond the documented additive changes | Stop. Surface the diff. Migration is required to be round-trip safe. |
| **S5** | `delays.csv` import (NOT in scope) or any other import path tries to reconstruct delay records from CSV — i.e., scope creep | Stop. v1.8 ships delay CSV *export* only. Import is v1.9. |
| **S6** | DCMA-17 produces obviously wrong affected-entity lists | Stop. Surface fixture + output. Confirm before adjusting check logic. |
| **S7** | CalendarToggle keyboard a11y cannot be made compliant within reasonable effort (focus visibility, ARIA pressed state, Escape behavior in modal) | Stop. Surface the symptom. Decide between a different toggle pattern (e.g., menu item inside the overflow) and deferring keyboard parity to v1.9 with documented caveat. |
| **S8** | DelayEntryModal save fails to stamp `criticalPathImpactDays` (e.g., CPM result not available, multi-task affectedIds span disconnected dependency chains) | Stop. Surface the path. v1.8 needs every save to stamp the impact (audit-trail integrity). |
| **S9** | Phase 0.0 — `v1.8` local branch differs in content from `origin/main` (i.e., someone has been working on v1.8 prematurely) | Stop. Surface the diff. Do not force-push, do not auto-discard. Decide whether to adopt the existing local work or reset to `origin/main`. |
| **S10** | CPM with `projectCalendar = []` does NOT produce byte-identical output to v1.7 | Stop. The default-empty path must be a no-op against v1.7 behavior. Surface the divergence. |
| **S11** | DelayLogPanel render with 100+ delays exceeds 40ms first paint | Stop. Profile. Move to manual windowing (same TaskList pattern). Surface for direction before introducing virtualization. |
| **S12** | Calendar overlay tooltip latency exceeds 100ms p95 at 24-month zoom | Stop. Profile. Debounce hover or pre-bake the event-to-day lookup. Surface choice. |
| **S13** | Pre-flight (Phase 0.−2 / 0.−1) fails: v1.7 merge commit absent from `main`, `main` `package.json` not at `0.7.0`, or working tree dirty beyond the known `playwright-report/index.html` noise | Stop. Do not adopt `v1.8`. Surface the state of `main`, the missing artefact, and wait for direction. **NOTE: missing `v0.7.0` tag alone is NOT a S13 trigger** — it is handled by Phase 0.H sister item (`docs/release-tags-audit.md`) and human action. |
| **S14** | `v0.5.0` historical tag — if Codex is asked to auto-create the tag without explicit human pre-authorization in the v1.8 kickoff message | Stop. Tag creation is a human action. Defer per Phase 0.H default. |

If none of these trigger, the agent proceeds phase by phase without further pings until Phase M.5 (the PR open) and Phase M.6 (the tag — itself a human action, Codex surfaces the SHA), and Phase M.9 (handoff to Claude for PM Audit Checkpoint 3).

---

## 17. Build Changelog

> Codex appends an entry here per phase commit set. Format follows plan-v1.7.md §17 and plan-v1.6.md §17.

### Phase 0 — Branch adoption, housekeeping, perf baseline, tags audit

- Scope
  - Completed pre-flight verification: `origin/main` contains v1.7 merge `0eac6b6`; `origin/main:package.json` is `0.7.0`.
  - S13 triggered on initial dirty working tree (`CHANGELOG.md`); surfaced to human and proceeded with explicit approval.
  - Adopted existing `v1.8` branch and set upstream (`origin/v1.8`).
  - Verified `.claude` continuity docs align with v1.7 shipped / v1.8 active state.
  - Appended plan-v1.7 post-merge final-ship note in §17 Phase M.
  - Recorded explicit deferrals for 0.F/0.G/0.J with no implementation expansion.
  - Created `docs/release-tags-audit.md` (0.H) documenting missing `v0.5.0` and `v0.7.0` tags and human-owned action.
  - Appended v1.8 desktop-first mobile QA defer in `docs/mobile-qa.md` (0.I).
  - Created `docs/perf-v1.8-baseline.md` baseline snapshot anchored to v1.7 metrics (0.K).
- Files touched
  - `.claude/plan-v1.8.md`
  - `.claude/plan-v1.7.md`
  - `.claude/AGENT-HANDOFF.md`
  - `docs/release-tags-audit.md`
  - `docs/mobile-qa.md`
  - `docs/perf-v1.8-baseline.md`
- Verification
  - `npm run lint` / `npm run type-check` / `npm run test:unit` / `npm run build` / `npm run test:e2e` to be executed in this phase before commit.
  - Manual checks:
    - `git log origin/main --oneline -5` includes `0eac6b6`
    - `git show origin/main:package.json` reads `0.7.0`
    - `git branch --show-current` is `v1.8`
- Notes
  - `git rev-list --count main..v1.8` returned `73` while `git diff origin/main v1.8 --stat` was empty; topology differs but content parity holds, consistent with prior handoff context.

### Phase A — Pure library scaffold (types, calendar, delays, delay impact)

- Scope
  - Extended core types for v1.8 with `CalendarEvent`, `Delay`, and `DcmaCheckId` expansion to include `17`.
  - Bumped persisted schema constant `PERSISTED_SCHEMA_VERSION` from `4` to `5`.
  - Added additive persisted fields on `PersistedState`: `projectCalendar` and `delays`.
  - Added pure calendar helper module `src/lib/projectCalendar.ts`.
  - Added pure delay helper module `src/lib/delays.ts`.
  - Added pure delay-impact helper module `src/lib/delayImpact.ts`.
  - Added unit test coverage for all three new pure modules.
  - Added v1.8 implementation notes doc `docs/calendar-and-delays.md`.
- Files touched
  - `src/types/index.ts`
  - `src/lib/storage.ts`
  - `src/lib/projectCalendar.ts`
  - `src/lib/delays.ts`
  - `src/lib/delayImpact.ts`
  - `tests/unit/lib/projectCalendar.test.ts`
  - `tests/unit/lib/delays.test.ts`
  - `tests/unit/lib/delayImpact.test.ts`
  - `tests/unit/lib/storage.test.ts`
  - `docs/calendar-and-delays.md`
  - `.claude/AGENT-HANDOFF.md`
  - `.claude/plan-v1.8.md`
- Verification
  - `npm run lint` ✅
  - `npm run type-check` ✅
  - `npm run test:unit` ✅
  - `npm run build` ✅
  - `npm run test:e2e` ✅
- Notes
  - Unit test failures initially surfaced due hardcoded schema-version assertions (`4`); updated to assert against `PERSISTED_SCHEMA_VERSION`.
  - Phase A is intentionally pure-library and schema-surface only; UI wiring and migration-deep behavior continue in Phase B onward.

### Phase B — Schema migration hardening (v4 to v5)

- Scope
  - Added explicit migration test coverage for v4 payload behavior into v5 schema.
  - Verified additive defaults are applied for `projectCalendar` and `delays` on v4 load.
  - Added v4 round-trip assertion (`v4 -> v5 -> v5`) to guarantee no non-additive field drift.
  - Added v1.7-like fixture migration assertion to confirm legacy fields remain intact while new arrays are added.
- Files touched
  - `tests/unit/lib/storage.test.ts`
  - `.claude/AGENT-HANDOFF.md`
  - `.claude/plan-v1.8.md`
- Verification
  - `npm run lint` ✅
  - `npm run type-check` ✅
  - `npm run test:unit` ✅
  - `npm run build` ✅
  - `npm run test:e2e` ✅
- Notes
  - Migration logic itself already satisfied B.1 from prior slice; this phase focused on B.2 round-trip and fixture-proof validation depth.

### Phase C — Workday and CPM integration with project calendar

- Scope
  - Extended `workdays.ts` functions with optional `projectCalendar` input and back-compatible defaults.
  - Integrated `non_work` calendar-day exclusion into `isWorkday` checks while leaving `advisory_only` unaffected.
  - Extended `computeCriticalPath` signature with optional `projectCalendar` and preserved legacy behavior when empty.
  - Added CPM behavior for non-work-day overlap in task effective duration.
  - Added unit coverage for:
    - workday behavior under `non_work` and `advisory_only` classifications
    - CPM shift when a non-work day falls inside task window
    - explicit empty-calendar parity (`computeCriticalPath(..., [])` equals legacy call)
- Files touched
  - `src/lib/workdays.ts`
  - `src/lib/cpm.ts`
  - `tests/unit/lib/workdays.test.ts`
  - `tests/unit/lib/cpm.test.ts`
  - `.claude/AGENT-HANDOFF.md`
  - `.claude/plan-v1.8.md`
- Verification
  - `npm run lint` ✅
  - `npm run type-check` ✅
  - `npm run test:unit` ✅
  - `npm run build` ✅
  - `npm run test:e2e` ✅
- Notes
  - Call-site wiring in `App.tsx` is intentionally deferred to Phase D per plan sequencing.

### Phase D — App wiring for calendar and delay state surfaces

- Scope
  - Threaded `projectCalendar` and `delays` from persisted state into `App.tsx` derived logic.
  - Updated auto-progress derivation to pass `projectCalendar` into `refreshAutoProgress`.
  - Updated both CPM memo call sites to pass `projectCalendar` and include it in dependency lists.
  - Added transient UI state placeholders for calendar/delay surfaces (`calendarOverlayEnabled`, calendar manager, delay log, delay entry).
  - Added memoized delay-derived structures:
    - `delayImpactByDelayId` map via `computeDelayImpact`
    - `varianceByDelayCause` map by `DelayType`
  - Exposed phase-D transient/memo values on root `data-*` attrs for continuity and later-phase wiring.
- Files touched
  - `src/components/App.tsx`
  - `src/lib/progress.ts`
  - `.claude/AGENT-HANDOFF.md`
  - `.claude/plan-v1.8.md`
- Verification
  - `npm run lint` ✅
  - `npm run type-check` ✅
  - `npm run test:unit` ✅
  - `npm run build` ✅
  - `npm run test:e2e` ✅
- Notes
  - This phase intentionally wires state and memo plumbing only; user-facing entry points for calendar/delay modals follow in Phases E–G.

### Phase E — TopBar and Gantt header entry-point wiring

- Scope
  - Added calendar overlay toggle component and threaded it into Gantt header controls.
  - Extended `GanttHeader` and `Gantt` props with `calendarOverlayEnabled` and `onToggleCalendarOverlay`.
  - Extended TopBar overflow actions with:
    - `onOpenProjectCalendar`
    - `onOpenDelayLog`
  - Added overflow menu entries for `Project Calendar` and `Delay Log`.
  - Wired App callbacks to open calendar manager / delay log and toggle overlay.
  - Resolved E2E accessibility locator collision by renaming the overlay toggle accessible name to avoid overlap with existing calendar button locators.
- Files touched
  - `src/components/topbar/CalendarToggle.tsx`
  - `src/components/gantt/GanttHeader.tsx`
  - `src/components/gantt/Gantt.tsx`
  - `src/components/topbar/TopBar.tsx`
  - `src/components/App.tsx`
  - `.claude/AGENT-HANDOFF.md`
  - `.claude/plan-v1.8.md`
- Verification
  - `npm run lint` ✅
  - `npm run type-check` ✅
  - `npm run test:unit` ✅
  - `npm run build` ✅
  - `npm run test:e2e` ✅
- Notes
  - Phase E only establishes entry points and state wiring. Calendar manager and delay log UI surfaces continue in later phases.

### Phase F — Calendar overlay and delay markers in Gantt

- Scope
  - Added `CalendarOverlay` SVG layer with per-classification diagonal hatch patterns.
  - Mounted calendar overlay in `Gantt` between grid and bars, gated by `calendarOverlayEnabled`.
  - Added hover tooltip surface in `Gantt` for event name + classification.
  - Added `DelayMarkers` overlay rendered inside each non-milestone bar for memo-safe rendering.
  - Wired marker click callback path from `GanttBar` up through `Gantt` to App state (`delayLogPanelOpen` + focused delay id).
  - Added calendar/delay token entries in light/dark themes.
- Files touched
  - `src/components/gantt/CalendarOverlay.tsx`
  - `src/components/gantt/DelayMarkers.tsx`
  - `src/components/gantt/GanttBar.tsx`
  - `src/components/gantt/Gantt.tsx`
  - `src/components/App.tsx`
  - `src/styles/tokens.css`
  - `.claude/AGENT-HANDOFF.md`
  - `.claude/plan-v1.8.md`
- Verification
  - `npm run lint` ✅
  - `npm run type-check` ✅
  - `npm run test:unit` ✅
  - `npm run build` ✅
  - `npm run test:e2e` ✅
- Notes
  - Delay marker click currently sets focus state + opens the delay log surface; the actual panel scroll-to-focus behavior lands with Phase G panel implementation.

### Phase G — ProjectCalendarManager + DelayLogPanel + DelayEntryModal wiring

- Scope
  - Added `ProjectCalendarManager` modal scaffold with add/edit/delete event flows.
  - Added `DelayLogPanel` modal scaffold with sorting, reconciliation pills, narrative expand rows, and CSV export action.
  - Added `DelayEntryModal` scaffold with date/type/excusable/task-picker/narrative fields.
  - Wired App callbacks for:
    - calendar add/update/delete
    - delay add/edit (with `computeDelayImpact` + recomputed `criticalPathImpactDays`)
    - delay reconciliation updates
    - delay CSV export trigger
  - Wired marker-driven focused delay path into `DelayLogPanel` scroll/highlight behavior.
  - Extended `WorkweekModal` with `Project Calendar ->` entry action to open calendar manager directly.
- Files touched
  - `src/components/modals/ProjectCalendarManager.tsx`
  - `src/components/modals/DelayLogPanel.tsx`
  - `src/components/modals/DelayEntryModal.tsx`
  - `src/components/modals/WorkweekModal.tsx`
  - `src/components/App.tsx`
  - `.claude/AGENT-HANDOFF.md`
  - `.claude/plan-v1.8.md`
- Verification
  - `npm run lint` ✅
  - `npm run type-check` ✅
  - `npm run test:unit` ✅
  - `npm run build` ✅
  - `npm run test:e2e` ✅
- Notes
  - Delay CSV export uses an interim App-level generator for Phase G. Dedicated `generateDelayLogCSV` helper lands in Phase I.

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
**Plan ready for:** Codex implementation, starting at Phase 0.−2 (pre-flight verification of v1.7 on `main`), then Phase 0.0 (adopt existing `v1.8` branch + set upstream), then Phase 0.A–0.K housekeeping/doc updates, then Phase A.
**Plan supersedes:** None — additive on top of plan-v1.7 (shipped 2026-05-26 via PR #16 to `main`; `v0.7.0` tag pending).
**Plan successor:** **PM Audit Checkpoint 3 (Claude job)** runs after v1.8 ships, then `plan-v1.9.md` (Data integration & portability) authored by Claude if the audit passes ≥8.0/10.

---

## 19. Assumptions made

These are the assumptions that shaped this plan. If any prove false, surface immediately.

1. **v1.7 is shipped to `main` as PR #16 (merge commit `0eac6b6`); `package.json` on `main` reads `0.7.0`; `v0.7.0` tag is the only pending human release artefact.** Confirmed by `git log origin/main` and `git show origin/main:package.json`. Pre-flight 0.−2 re-verifies before adopting `v1.8`.
2. **The `v1.8` branch already exists locally at `0dd2c15` (v1.7 phase M commit) and is content-identical to `origin/main`.** Verified: `git diff origin/main v1.8 --stat` returns empty. Phase 0.0 adopts as-is, sets upstream, optionally fast-forwards to main if topology preferred.
3. **The existing `WorkweekConfig` + `holidays: string[]` shape is preserved.** v1.8 does NOT replace or refactor existing workweek persistence — it adds `projectCalendar` as a separate, typed layer. Both surfaces coexist; `isWorkday` checks all three (workweek mask + flat holidays + calendar non-work events).
4. **`PERSISTED_SCHEMA_VERSION` bump 4 → 5 is the right call for this scope.** Per `CLAUDE.md` "Persistence" + the v1.3 / v1.5 / v1.7 migration patterns, additive schema bumps are the standard. Schema-stable v1.8 (computing calendars and delays on the fly without persistence) was considered and rejected — calendars and delays are *the* deliverables.
5. **The existing `TopBarOverflowMenu` from v1.7 Phase 0.1 is the right home for "Project Calendar…" and "Delay Log…"** — confirmed by inspection of v1.7 §3.1 Phase 0.1 changelog. The overflow menu is the structural slot v1.7 created specifically for low-density-tier features.
6. **CPM extension (`projectCalendar` optional arg) is non-breaking for the existing test suite.** v1.7 cpm tests do not pass a `projectCalendar` argument; default `[]` preserves behaviour. C.4 regression test guards this.
7. **`<input type="date">` is the right primitive for date pickers.** Browser variance is acceptable for an internal tool; no design library exists in the codebase, and adding one would violate the "no new deps" rule. If UX feedback drives a different choice, that's a v2.x concern.
8. **`computeDelayImpact` is bounded** — for a delay affecting ≤10 tasks (typical), running CPM-aware impact analysis is O(tasks + dependencies), which is the same cost as one CPM recompute. The App-level memo cache makes this acceptable.
9. **Delay records are immutable evidence** — no hard delete in v1.8. Reconciliation status (`accepted` / `rejected`) is the disposal mechanism. This is a deliberate audit-trail decision (matches v1.5 baseline immutability). Manual QA in §11.5 confirms the workflow.
10. **No subscore reweight in v1.8.** Health composition weights stay as v1.4 shipped. DCMA-17 enters the existing "logic quality" bucket (consistent with v1.7 §5.3). Document in `docs/dcma-checks.md`.
11. **Calendar overlay is on-screen only (not print).** The diagonal hatch would compete with the weekend band on printed A3. Decision documented in §3.2 and §6.1. If PMs request print-overlay later, that's v1.9 / v2.x.
12. **`v0.5.0` and `v0.7.0` historical tags do not block v1.8 implementation.** Both are surfaced via `docs/release-tags-audit.md` (Phase 0.H) and human action. v1.8 work proceeds independently.
13. **PM Audit Checkpoint 3 runs after v1.8 ships (Claude job).** Per `pm-roadmap.md` §v1.8 and `version-status.md` row. Codex does NOT run the audit — that's a planning-lane responsibility per `START-HERE.md` §2.
14. **Plan files are local artifacts and need not be committed until human direction.** User direction from prior plans stands: "Local planning/docs files can be updated locally but should not be assumed as committed artifacts unless explicitly requested." This plan is written to `.claude/plan-v1.8.md` locally; commit decision is the human's. Per `AGENTS.md § .claude Commit Rule`, the commit must happen in the same branch cycle the file is touched.

---

**Plan ready for Codex implementation starting at Phase 0.−2 (pre-flight verification).**

---

## 20. Codex kickoff prompt (paste this to start v1.8)

> **Lane:** Codex (implementation)
> **Branch:** `v1.8` (already exists locally; adopt — do not delete-and-recreate)
> **Plan:** `.claude/plan-v1.8.md`
> **First action:** Phase 0.−2 (pre-flight verification of v1.7 on `main`)
>
> Read in order before touching code:
> 1. `.claude/START-HERE.md` — confirm lane, read the .gitignore + context-compaction rules
> 2. `.claude/AGENT-HANDOFF.md` — current state (v1.7 shipped, v1.8 active)
> 3. `.claude/CLAUDE.md` — durable design decisions
> 4. `AGENTS.md` — commands + critical patterns
> 5. `.claude/plan-v1.8.md` — this plan, in full (especially §0, §⚠ Codex operating rules, §3.2 out-of-scope, §16 stop-and-ping)
>
> Then:
> - Run Phase 0.−2 verification (`git fetch origin --tags`, confirm `0eac6b6` on `main`, confirm `package.json` reads `0.7.0`). If S13 triggers, STOP.
> - Run Phase 0.−1 (clean working tree check).
> - Run Phase 0.0 (`git checkout v1.8`, verify parity, `git push -u origin v1.8`).
> - Continue with Phase 0.A through 0.K (housekeeping + doc verifies + perf baseline + release tags audit).
> - Commit Phase 0 slice with a message like `chore(v1.8): phase 0 — branch adoption, housekeeping, perf baseline, tags audit`.
> - Update `.claude/AGENT-HANDOFF.md` at the phase boundary (per process contract).
> - Move to Phase A (pure libs).
>
> **Operating reminders (re-read at every phase boundary):**
> - One process at a time. Foreground every gate.
> - Build before E2E.
> - `.gitignore` is absolute — never stage `playwright-report/index.html`.
> - `.claude/` updates commit in the same cycle.
> - Context compaction every 2 mini-tasks.
> - No new runtime deps. No `any`. No force-unwrap. No nested ternaries. All colors via tokens. All icons via `src/lib/icons.ts`.
> - Stop-and-ping at any §16 trigger.
>
> **Two known human-pending items** (do not auto-resolve):
> 1. `v0.7.0` tag on the v1.7 merge commit — Phase 0.H surfaces; Codex does not create release tags.
> 2. `v0.5.0` historical tag on `f9382f2` — same — Phase 0.H surfaces.
>
> Welcome to v1.8 — the schedule's reality-check organ. Ship the calendar overlay and delay log such that a PM, after a slip happens, can defend the variance in 90 seconds with a one-page CSV from the delay log and the executive report attribution slice. That is the bar.
