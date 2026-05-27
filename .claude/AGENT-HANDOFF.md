## v1.8 Session Entry (Codex — 2026-05-27, Phase G)

- Phase reached: **Phase G complete** (calendar + delay modal surfaces and App wiring)
- Branch: `v1.8` tracking `origin/v1.8`
- What landed:
  - Added `ProjectCalendarManager` modal with add/edit/delete calendar event flows.
  - Added `DelayLogPanel` with sortable rows, reconciliation updates, expanded narrative rows, and focused-delay scroll behavior.
  - Added `DelayEntryModal` with delay entry/edit fields and affected-task multi-select.
  - Wired App handlers for calendar CRUD and delay CRUD/reconciliation + computed CP impact stamping.
  - Wired `WorkweekModal` with `Project Calendar ->` action that transitions to the calendar manager.
  - Added interim App-level delay-log CSV export action for panel export button.
  - Appended Phase G entry in `plan-v1.8.md` §17.
- Last 3 decisions:
  - Keep modal scaffolds lean and callback-driven, matching existing modal architecture.
  - Keep delay impact stamping centralized in App `onSave` path to prevent inconsistent persistence.
  - Ship CSV export button now with temporary App implementation; move canonical generator into `lib/csv.ts` in Phase I.
- Verification gates:
  - `npm run lint` ✅
  - `npm run type-check` ✅
  - `npm run test:unit` ✅
  - `npm run build` ✅
  - `npm run test:e2e` ✅
- Next 2 actions:
  1. Start Phase H (`SidePanelDelaysSection` + variance delay-cause attribution in reports).
  2. Add/update tests for attribution math and report rendering path changes.

---

## v1.8 Session Entry (Codex — 2026-05-27, Phase F)

- Phase reached: **Phase F complete** (CalendarOverlay + DelayMarkers)
- Branch: `v1.8` tracking `origin/v1.8`
- What landed:
  - Added `CalendarOverlay` with classification-specific hatch patterns and event edge lines.
  - Mounted overlay in `Gantt` between grid and bars, controlled by `calendarOverlayEnabled`.
  - Added Gantt hover tooltip for calendar event name and classification.
  - Added `DelayMarkers` in `GanttBar` for task-linked delays (excusable vs non-excusable color coding).
  - Wired marker click callback chain up to `App` to open delay log state and store focused delay id.
  - Added overlay/marker color tokens in both light and dark token roots.
  - Appended Phase F entry in `plan-v1.8.md` §17.
- Last 3 decisions:
  - Keep overlay render pure-SVG and pointer-light, with hitboxes separated from paint rects.
  - Keep delay marker implementation inside `GanttBar` to preserve memo behavior on the hot path.
  - Stage scroll-to-focused-delay behavior for Phase G when `DelayLogPanel` exists; Phase F only sets open/focus state.
- Verification gates:
  - `npm run lint` ✅
  - `npm run type-check` ✅
  - `npm run test:unit` ✅
  - `npm run build` ✅
  - `npm run test:e2e` ✅
- Next 2 actions:
  1. Start Phase G modal/panel scaffolds (`ProjectCalendarManager`, `DelayLogPanel`, `DelayEntryModal`).
  2. Wire calendar and delay CRUD/reconciliation callbacks through `App` and modal entry points.

---

## v1.8 Session Entry (Codex — 2026-05-27, Phase E)

- Phase reached: **Phase E complete** (TopBar + Gantt header entry points)
- Branch: `v1.8` tracking `origin/v1.8`
- What landed:
  - Added `CalendarToggle` and wired calendar-overlay toggle through `Gantt` -> `GanttHeader`.
  - Extended TopBar overflow menu actions with `Project Calendar` and `Delay Log`.
  - Wired App callbacks for opening project calendar manager and delay log surfaces.
  - Fixed Playwright accessibility selector regression by changing overlay toggle naming to overlay-specific wording.
  - Appended Phase E entry in `plan-v1.8.md` §17.
- Last 3 decisions:
  - Keep Phase E scoped to entry-point wiring only; modal/panel internals remain in later phases.
  - Avoid broad test selector changes; resolve a11y collision by giving the new overlay toggle a distinct accessible name.
  - Maintain existing calendar button semantics while introducing overlay controls in Gantt header.
- Verification gates:
  - `npm run lint` ✅
  - `npm run type-check` ✅
  - `npm run test:unit` ✅
  - `npm run build` ✅
  - `npm run test:e2e` ✅
- Next 2 actions:
  1. Start Phase F (calendar overlay rendering + delay markers in Gantt rows).
  2. Extend/adjust unit and E2E coverage for overlay visibility and delay marker interactions.

---

## v1.8 Session Entry (Codex — 2026-05-27, Phase D)

- Phase reached: **Phase D complete** (App state + memo wiring)
- Branch: `v1.8` tracking `origin/v1.8`
- What landed:
  - App now reads `projectCalendar` and `delays` from persisted state.
  - App auto-progress memo now passes `projectCalendar` through `refreshAutoProgress`.
  - App CPM memos now pass `projectCalendar` and include it in dependency arrays.
  - Added phase-scaffold transient state for calendar overlay / calendar manager / delay log / delay entry.
  - Added memoized `delayImpactByDelayId` and `varianceByDelayCause` maps.
  - Updated root app `data-*` attributes to surface phase-D state for downstream phase wiring.
  - Appended Phase D entry in `plan-v1.8.md` §17.
- Last 3 decisions:
  - Keep D-phase UI state scaffolded but not user-triggered yet (entry points come in E/G).
  - Preserve back-compat by keeping new progress/calendar args optional with defaults.
  - Keep delay-derived maps local in App for reuse by SidePanel/report phases.
- Verification gates:
  - `npm run lint` ✅
  - `npm run type-check` ✅
  - `npm run test:unit` ✅
  - `npm run build` ✅
  - `npm run test:e2e` ✅
- Next 2 actions:
  1. Begin Phase E (TopBar + Gantt header controls for calendar surfaces).
  2. Wire calendar/delay open actions into overflow and modal orchestration paths.

---
## v1.8 Session Entry (Codex — 2026-05-27, Phase C)

- Phase reached: **Phase C complete** (calendar-aware workday/CPM foundation)
- Branch: `v1.8` tracking `origin/v1.8`
- What landed:
  - `workdays.ts` now accepts optional `projectCalendar` in `isWorkday`, `workdays`, and `workdayRatio` with default `[]`.
  - `non_work` calendar events now suppress workdays; `advisory_only` remains workday-neutral.
  - `computeCriticalPath` now accepts optional `projectCalendar` and preserves legacy output when empty.
  - Added CPM non-work overlap test and explicit empty-calendar parity test.
  - Added workday tests for `non_work` and `advisory_only` behavior.
  - Appended Phase C entry in `plan-v1.8.md` §17.
- Last 3 decisions:
  - Keep API additions optional/defaulted to protect existing call sites until Phase D wiring.
  - Anchor parity guard by serializing map/set output for byte-equivalent comparison.
  - Keep `advisory_only` events display-only in math path (no workday suppression).
- Verification gates:
  - `npm run lint` ✅
  - `npm run type-check` ✅
  - `npm run test:unit` ✅
  - `npm run build` ✅
  - `npm run test:e2e` ✅
- Next 2 actions:
  1. Start Phase D app wiring (`projectCalendar`/`delays` state usage + CPM memo dependency update).
  2. Add regression checks that App-level CPM path updates when calendar changes.

---
## v1.8 Session Entry (Codex — 2026-05-27, Phase B)

- Phase reached: **Phase B complete** (migration hardening + round-trip guarantees)
- Branch: `v1.8` tracking `origin/v1.8`
- What landed:
  - Extended storage migration tests for schema `4 -> 5` additive behavior.
  - Added explicit assertions that migrated v4 payloads receive `projectCalendar = []` and `delays = []`.
  - Added `v4 -> v5 -> v5` round-trip no-drift test.
  - Added v1.7-like fixture migration test ensuring legacy fields remain unchanged beyond additive defaults.
  - Appended Phase B entry in `plan-v1.8.md` §17.
- Last 3 decisions:
  - Treat B.1 as already satisfied by existing `storage.ts` v4-guard logic.
  - Use fixture-driven tests (not synthetic minimal only) to prevent hidden drift risks (S4 guard).
  - Keep phase scope to migration integrity only before moving to Phase C.
- Verification gates:
  - `npm run lint` ✅
  - `npm run type-check` ✅
  - `npm run test:unit` ✅
  - `npm run build` ✅
  - `npm run test:e2e` ✅
- Next 2 actions:
  1. Start Phase C calendar-aware workday + CPM integration and parity test (`projectCalendar = []` no-op).
  2. Extend `workdays`/CPM unit suites for non-work event handling and baseline-equivalence guard.

---
## v1.8 Session Entry (Codex — 2026-05-27, Phase A)

- Phase reached: **Phase A complete** (A.1, A.2, A.4, A.6, A.8)
- Branch: `v1.8` tracking `origin/v1.8`
- What landed:
  - Added v1.8 type surface: `CalendarEvent`, `Delay`, `DcmaCheckId` includes `17`.
  - Bumped persisted schema constant to `5` and added additive persisted fields (`projectCalendar`, `delays`).
  - Added pure libs: `projectCalendar.ts`, `delays.ts`, `delayImpact.ts`.
  - Added unit suites: `projectCalendar.test.ts`, `delays.test.ts`, `delayImpact.test.ts`.
  - Added `docs/calendar-and-delays.md` with model and scope notes.
  - Updated storage tests to assert dynamic schema version instead of hardcoded `4`.
  - Appended Phase A entry in `plan-v1.8.md` §17.
- Last 3 decisions:
  - Keep Phase A strictly pure-lib + schema surface (no UI wiring in this slice).
  - Make v4->v5 additive defaults explicit in `makeDefaultState` now to avoid null-path drift.
  - Use `PERSISTED_SCHEMA_VERSION` in tests to avoid brittle version-literal assertions.
- Verification gates:
  - `npm run lint` ✅
  - `npm run type-check` ✅
  - `npm run test:unit` ✅
  - `npm run build` ✅
  - `npm run test:e2e` ✅
- Next 2 actions:
  1. Begin Phase B migration hardening for schema `4 -> 5` round-trip behavior.
  2. Add/update migration-specific storage tests for `projectCalendar` + `delays` defaults and preservation.

---
## v1.8 Session Entry (Codex — 2026-05-27)

- Phase reached: **Phase 0 complete** (through 0.K)
- Branch: `v1.8` tracking `origin/v1.8`
- What landed:
  - Completed pre-flight checks for v1.7-on-main (`0eac6b6`, `package.json` `0.7.0`).
  - Hit S13 due to dirty `CHANGELOG.md`, paused, and resumed with explicit human direction.
  - Set upstream for `v1.8` via `git push -u origin v1.8`.
  - Added `docs/release-tags-audit.md` (missing `v0.5.0` on `f9382f2`, missing `v0.7.0` on `0eac6b6`, human-owned action).
  - Added v1.8 desktop-first defer entry in `docs/mobile-qa.md`.
  - Added `docs/perf-v1.8-baseline.md` anchored to v1.7 perf references.
  - Appended v1.7 final-ship closure line in `plan-v1.7.md` §17 Phase M.
  - Appended Phase 0 changelog entry in `plan-v1.8.md` §17.
- Decisions captured this session:
  - 0.F marketing-v2 pass remains deferred.
  - 0.G branch pile-up remains below revisit threshold; keep as-is.
  - 0.J `Task.deps[]` direct-write lint rule remains deferred to v2.0.
- Next 2 actions:
  1. Execute full gate run for Phase 0 commit (`lint`, `type-check`, `test:unit`, `build`, `test:e2e`).
  2. Commit Phase 0 slice with message: `chore(v1.8): phase 0 — branch adoption, housekeeping, perf baseline, tags audit`, then start Phase A.1.

---
# AGENT HANDOFF (v1.8 plan written — Codex implementation starts at Phase 0.−2)

## Last Touch
- Date: 2026-05-26
- Branch: `v1.8` (already created locally; content-parity with `origin/main`; no upstream set yet)
- Lane: Claude (planning agent)
- Status: **READY — plan-v1.8.md written; Codex picks up next**

## What Landed This Session (Claude — planning lane)

- **v1.7 ship state confirmed** — PR #16 merged to `main` (merge commit `0eac6b6`); `origin/main:package.json` reads `0.7.0`; v1.8 branch already exists locally and is content-identical to `origin/main`.
- **Continuity errors fixed** across the `.claude/` doc surface and `AGENTS.md`:
  - `.claude/START-HERE.md` §1 / §3 / §5 — flipped active pointer from plan-v1.6 to plan-v1.8; updated read-order table; added "v1.7 shipped" line; updated file map.
  - `.claude/CLAUDE.md` — "What This Is" paragraph now lists v1.7 shipped + v1.8 active; persistence row now reads "schema version 4 (v1.8 plan introduces v5)"; "Where to Look Next" repointed.
  - `AGENTS.md` — persistence schema version (3 → 4) corrected; "Active implementation plan" pointer flipped from plan-v1.6 to plan-v1.8; "Authoritative references" table updated.
  - `.claude/version-status.md` — v1.7 row flipped to ✅ shipped with note on `v0.7.0` tag pending human action; v1.8 row added as ⏳ active linked to `plan-v1.8.md`; "Current Focus" repointed; Build Changelog Index extended with v1.8.
- **`plan-v1.8.md` written** — Calendar & Delays plan, 20 sections, ~1100 lines.
  - Scope: project calendar overlay on Gantt + typed CalendarEvent persistence; delay log with reconciliation workflow; per-task delay records; CPM integration with calendar non-work days; DCMA-17 (open delay reconciliation); variance-by-cause attribution in executive report; CSV export of delay log; `v0.5.0` historical-tag audit (`docs/release-tags-audit.md`).
  - Out of scope (explicit): per-resource calendars, AC import from CSV (defers to v1.9), claims-PDF export, weather data integration, delay approval workflow, scenario / what-if simulation, time-of-day precision, soft-delete on delays, calendar overlay on print mode.
  - Schema bump: 4 → 5 (additive — `projectCalendar: CalendarEvent[]`, `delays: Delay[]`).
  - Performance budget: <+25KB gzipped, no regression on v1.7 baselines.
  - Phases: 0 (pre-flight + branch adoption + housekeeping + perf baseline + release-tags audit), A (pure libs), B (migration), C (workday + CPM), D (App wiring), E (TopBar + Gantt header), F (CalendarOverlay + DelayMarkers), G (modals), H (SidePanel section + variance attribution), I (DCMA-17 + CSV), J (edge states + perf re-verify), K (E2E), L (docs), M (release).
  - Branch hygiene: plan explicitly notes `v1.8` branch already exists — Codex adopts (not creates) and sets upstream via `git push -u origin v1.8`.
  - PM Audit Checkpoint 3 fires after v1.8 ships (Claude job).

## Continuity Issues Surfaced (for human awareness)

1. **`v0.7.0` tag is missing on `origin/main`.** The v1.7 merge commit `0eac6b6` exists; `package.json` reads `0.7.0`; only the tag artefact is absent. Codex Phase M.6 of plan-v1.7 lists this as human action. Phase 0.−2 of plan-v1.8 verifies but does NOT block on the tag alone.
2. **`v0.5.0` historical tag is also missing.** The v1.5 merge commit `f9382f2` is on `main` but never received its release tag. Phase 0.H of plan-v1.8 creates `docs/release-tags-audit.md` to surface this; Codex does NOT auto-create release tags.
3. **`v1.8` branch has no upstream.** Phase 0.0 instructs `git push -u origin v1.8` as the first commit-set step.

## Current Gate State

- `npm.cmd run build` — last green on v1.7 Phase M (2026-05-26)
- `npm.cmd run lint` — last green on v1.7 Phase M
- `npm.cmd run type-check` — last green on v1.7 Phase M
- `npm.cmd run test:unit` — last green on v1.7 Phase M (sequential runner)
- `npm.cmd run test:e2e` — last green on v1.7 Phase M (26/26)

## Decisions (Last 3, Planning Lane)

1. **Bundle calendar + delays into v1.8 as one organ.** Justified in plan-v1.8 §3.3: mutually dependent (delay impact depends on calendar), same architectural surface (both persisted arrays, both modals from TopBar overflow), roadmap intent (`pm-roadmap.md` v1.8 names them together), and audit-timing (Checkpoint 3 sits post-v1.8 and splitting would push the gate into v1.9 architectural-shift territory).
2. **Defer per-resource calendars to v2.x.** Roadmap mentions them but the multiplicative complexity (per-task × per-resource × per-day capacity windows) is not justified by current institutional-build workflow. v1.8 ships project-level calendar only.
3. **Calendar overlay is on-screen only, NOT in print.** Diagonal hatch competes with the existing weekend band on printed A3. The PM needing a printed delay artefact prints the delay log CSV instead. Documented in plan-v1.8 §3.2 and §6.1.

## Next Actions (Codex picks up here)

1. **Read** `.claude/START-HERE.md` → `.claude/AGENT-HANDOFF.md` (this file) → `.claude/version-status.md` → `.claude/CLAUDE.md` → `AGENTS.md` → `.claude/plan-v1.8.md`.
2. **Phase 0.−2** — pre-flight verification (`git fetch origin --tags`, confirm v1.7 merge on `main`, `package.json` reads `0.7.0`). If S13 triggers (verifications fail), STOP. Missing `v0.7.0` tag alone is NOT S13 — surfaced via Phase 0.H sister item.
3. **Phase 0.−1** — verify working tree clean (only `playwright-report/index.html` noise allowed).
4. **Phase 0.0** — `git checkout v1.8`, verify content parity with `origin/main`, `git push -u origin v1.8` to set upstream.
5. **Phase 0.A–0.E** — verify `.claude/` doc surface (Claude has already refreshed; Codex confirms or fixes).
6. **Phase 0.H** — create `docs/release-tags-audit.md` listing tag gaps (`v0.5.0`, `v0.7.0`) and recommended human actions.
7. **Phase 0.I** — re-affirm desktop-first mobile QA defer (6th audit running) in `docs/mobile-qa.md`.
8. **Phase 0.K** — capture v1.7-baseline perf snapshot in `docs/perf-v1.8-baseline.md`.
9. Commit Phase 0 slice with a message like `chore(v1.8): phase 0 — branch adoption, housekeeping, perf baseline, tags audit`.
10. **Move to Phase A** (pure libs — `projectCalendar.ts`, `delays.ts`, `delayImpact.ts` + tests + `docs/calendar-and-delays.md`).

## Working Tree Snapshot

- Modified (planning-lane, awaiting commit):
  - `.claude/AGENT-HANDOFF.md` (this file)
  - `.claude/CLAUDE.md`
  - `.claude/START-HERE.md`
  - `.claude/version-status.md`
  - `AGENTS.md`
- New (planning-lane, awaiting commit):
  - `.claude/plan-v1.8.md`
- Allowed noise (must remain unstaged):
  - `playwright-report/index.html`

## Process Contract Reminders (re-read every phase boundary)

- **One branch per version** — `v1.8` only; never commit to `main` directly.
- **Phase-boundary discipline** — append `plan-v1.8.md §17` entry + update this handoff + commit per phase slice.
- **Context auto-compact every 2 mini-tasks** — summarize last 3 decisions + state into this handoff before continuing.
- **`.gitignore` is absolute** — `playwright-report/index.html` must never be staged.
- **`.claude/` updates commit in the same cycle** — never leave handoff/changelog edits unstaged across handoffs.
- **No new runtime dependencies** — calendar libs, date-picker libs, chart libs, PDF libs, tree libs are all forbidden.
- **Stop-and-ping at any §16 trigger** in plan-v1.8 — surface, wait, do not silently bend the rule.

## Two Pending Human Actions (Codex does NOT auto-resolve)

1. **Tag `v0.7.0`** on the v1.7 merge commit `0eac6b6`:
   ```
   git tag -a v0.7.0 0eac6b6 -m "v1.7 — WBS deepening + AC/CPI close-out"
   git push origin v0.7.0
   ```
2. **Tag `v0.5.0`** on the v1.5 merge commit `f9382f2`:
   ```
   git tag -a v0.5.0 f9382f2 -m "v1.5 — Multi-baseline & change management (retroactive tag)"
   git push origin v0.5.0
   ```
Both tags are documented in `docs/release-tags-audit.md` (created by Codex in Phase 0.H).

## Post-v1.8 Lane Switch

After Phase M.9 lands, lane switches back to **Claude** for **PM Audit Checkpoint 3** — the post-v1.8 single-user maturity gate (last checkpoint before v1.9 data-integration architectural shift and v2.0 cloud / multi-user architectural shift). Audit uses `pm-audit-template.md` and produces `pm-audit-v5.md`. If audit passes ≥8.0/10, Claude authors `plan-v1.9.md` (Data integration & portability).





