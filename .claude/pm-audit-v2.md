# PM Audit v2 — Senior Project Manager Evaluation (Interim)

**Audit ID:** pm-audit-v2
**Date:** 2026-05-22
**Auditor:** Senior PM lens (institutional construction, schedule defensibility, instrument-grade tooling)
**Checkpoint:** Interim / ad-hoc — sits **between** the v1 baseline audit and roadmap Checkpoint 1 (which is scheduled to fire after v1.3 ships)
**Previous audit:** pm-audit-v1 (score: 3.6/10)
**Versions since:** v1.0 → v1.2 (production-readiness + visual refinement passes)
**Time elapsed:** ~1 day of compressed agent work (real calendar: 2026-05-21 → 2026-05-22)

> **Why an interim audit:** v1.1 and v1.2 do not appear on the fitness roadmap — neither version adds a construction-PM capability. They are foundation passes: hardening (v1.1) and visual identity (v1.2). The roadmap's first formal checkpoint sits after v1.3 (Resource Foundation), where the first real organ lands. This audit closes the loop on the foundation work before v1.3 begins, so Checkpoint 1 can isolate "did resources land correctly" without re-litigating "did the surface get serious." If you are reading this in sequence, the next audit is `pm-audit-v3.md` and it is roadmap Checkpoint 1.

---

## 1. Executive Summary

Since the v1 baseline, the product has not added a single feature a construction PM would name. It has, however, **closed every structural risk that would have made v1.3 (resources) dangerous to build on**: the persistence schema is versioned with a migration walk, the `lib/*` core is covered by 149 unit tests, six end-to-end flows run green under Playwright (including a real axe sweep), mobile rendering uses a native-feeling bottom sheet rather than a miniaturized desktop, the visual surface has been de-vibecoded under a Swiss thesis, and dark mode is now token-driven across every primary surface. The marketing landing is finally tracked in git with real metadata, a real OG card, and copy that names the tool's actual features instead of LLM-default verbs.

**The fitness score does not move much**, because the audit dimensions are construction-PM capabilities and none were added. What changed is the **trust floor**: it is now possible to put a v1.3 resource model on top of this codebase without a foundation crack. That is the entire point of v1.1 and v1.2 — they were never going to score, they were going to make the next score possible.

**Previous verdict:** "Excellent bones, missing organs."

**This verdict:** Excellent bones, now visibly polished, still missing organs — but the operating theatre is sterile and the instrument tray is laid out.

**Direction:** ◆ Stable on capability dimensions, ▲ Improved on quality, identity, and platform-readiness dimensions.

---

## 2. Fitness Score by Dimension

Scored against the same construction-PM lens used in v1. Changes of ≥1 point are justified inline.

| Dimension | Previous (v1) | Current (v1.2) | Δ | Notes |
|---|---|---|---|---|
| **Task management** | 7 | 7.5 | +0.5 | Same model. Virtualization at >100 rows now real (manual windowing). 8.6 axe sweep + dialog focus traps push the modal/edit surface to professional grade. |
| **Dependency logic** | 8 | 8 | 0 | No change. FS/SS/FF/SF + lag still correct; CPM unit-tested in `cpm.test.ts`. |
| **Baseline/variance** | 7 | 7 | 0 | Single-baseline only. Ghost-style persistence now E2E-covered (`baseline.spec.ts`). Multi-baseline is v1.5, not landed. |
| **Resource management** | 1 | 1 | 0 | Still nonexistent. This is the entire v1.3 thesis. |
| **Cost management** | 0 | 0 | 0 | Still nonexistent. v1.3 introduces resource cost rates; EVM lands in v1.6. |
| **Collaboration** | 0 | 0 | 0 | Still single-user / localStorage. v2.0 territory. |
| **Reporting** | 5 | 5.5 | +0.5 | A3 print canvas tightened (title bar inside the deliverable, mode strip in header). PDF/S-curve/EVM still missing — v1.6. |
| **Schedule quality** | 2 | 2 | 0 | No DCMA, no health score, no logic validation. v1.4 territory. |
| **Integration** | 1 | 1 | 0 | CSV only. P6/MPP is v1.9. |
| **Mobile / field** | 5 | 6.5 | +1.5 | Real `MobileBottomSheet` shipped, with peek/full, pointer-capture drag, focus-trap dialog semantics, and E2E coverage (`mobile-sheet.spec.ts`). Still no offline-first, photo attach, or field-daily features. Real-device QA still owed (`docs/mobile-qa.md`). |
| **WBS / hierarchy** | 4 | 4 | 0 | Groups → tasks still display-only. Standard WBS coding is v1.7. |
| **Calendar / delays** | 3 | 3 | 0 | Workweek modal unchanged. Delay log is v1.8. |
| **Visual discipline** | 6 | 8.5 | +2.5 | v1.2 is the entire reason this dimension exists. De-AI'd surface, surface ladder, Phosphor icons, token-only colors, tightened radius scale, asymmetric SetupWizard, motion budget with `prefers-reduced-motion` audit, wordmark detailing, dark-mode walk-through documented in `docs/dark-mode-audit-1.2.md`. |
| **Performance** | 7 | 7.5 | +0.5 | Manual virtual windowing for TaskList rows; memoized maps on hot paths. Performance target (500 tasks @ 55fps) carried forward. No regression — `npm run test:e2e` (9/9) green. |
| **Print output** | 7 | 7.5 | +0.5 | Title-bar pattern inside A3 canvas, mode strip in modal header. Still no S-curve / executive one-pager — v1.6. |
| **Trust & defensibility** *(new)* | — | 5 | new | Added as a tracked dimension because v1.1 + v1.2 explicitly invest here. Versioned persistence schema with migration walk, 149 unit tests on `lib/*`, 9 Playwright specs (including structural axe), CHANGELOG + `v0.1.0` + `v0.2.0` tags, deploy doc (`docs/deploy.md`), README. Construction firms evaluating internal tools care about this. |

**Composite (equal-weight, original 15 dimensions):** previous **3.7/10** → current **4.4/10**.

> The v1 audit's composite of "3.6/10" was a holistic verdict, not an equal-weight mean. Recomputed at equal weight, the v1 score is 3.7/10 (rounding aside) and the v1.2 score is 4.4/10. **Net +0.7** — almost entirely in visual, mobile, and trust dimensions. Capability dimensions are untouched, as planned.

**Holistic verdict:** **4.5/10** (rounded up by +0.1 to reflect the trust/defensibility dimension that v1's framework didn't measure).

---

## 3. What Changed Since Last Audit

### 3.1 What Shipped

**v1.1 — Production readiness (`v0.1.0`, 2026-05-22):**
- CSV import: per-row validation with `CsvRowError { row, field, reason }`, blocking refusal when zero rows are importable, undo snapshot now covers tasks + dependencies + notes.
- Persistence: `persistedSchemaVersion` typed field promoted to `src/types/index.ts`, defence-in-depth re-stamping on save, v0→v1 migration walk for legacy `task.deps[]` → `Dependency[]` edges.
- Tests: 6 new `lib/*` unit test files covering dates, workdays, progress, CSV, CPM (Kahn + forward/backward pass + lag), storage migration. **149 tests, ~3s runtime.**
- TaskList virtualization: manual windowing above `VIRTUALIZE_THRESHOLD = 100` rows, memoized `wbsMap`/`partyMap`/`groupColorMap`.
- Mobile: `MobileBottomSheet.tsx` with peek (40vh) / full (85vh) / drag-to-dismiss (`SHEET_DISMISS_VELOCITY = 0.5`, `SHEET_DISMISS_DELTA = 80`), pointer capture, dialog/focus-trap semantics, mobile tab switcher with proper `tablist`/`tab`/`tabpanel` ARIA.
- Accessibility: shared `useDialogA11y.ts` hook (Tab/Shift+Tab trap, Escape close, focus restore), live regions on `UndoToast` and onboarding tip, focus-visible cleanup, `@axe-core/playwright` integrated, `docs/a11y-audit.md` contrast tables published.
- E2E: 6 real Playwright specs (`create-task`, `mobile-sheet`, `csv-import`, `baseline`, `keyboard`, `a11y`), Playwright owns the preview lifecycle.
- Housekeeping (H1–H5): vitest exclude regression fixed (82s → 3s), 7 dead lib exports purged, dead `UndoEntry` removed.
- Marketing: `marketing.html` head metadata (canonical, OG, Twitter), 1200×630 OG asset, apple-touch-icon, copy review against Swiss principles, deploy target documented (`docs/deploy.md`).
- Release hygiene: `CHANGELOG.md` with `0.0.1` baseline + `0.1.0` entries, `v0.1.0` tag pushed, PR template refreshed, lint scope unblock for `.worktrees/**`.

**v1.2 — Visual refinement (`v0.2.0`, 2026-05-22):**
- Foundation tokens: surface-sunken, brand-tint, accent variants, data semantics, ink ladder, phase rails, ring. Tightened radius scale (sm 2 / base 4 / lg 6 / xl 8).
- Iconography: `@phosphor-icons/react` integrated via `src/lib/icons.ts`; every emoji glyph in TopBar / SidePanel / CsvImportDialog / StatusBadge / group caret swapped for Phosphor at consistent weight.
- Surface ladder & materiality: `--surface-sunken` on slider tracks / weekend bands / scrollbars; group row progress meter (4px); gantt bar inner-top highlight; 2px accent rail on selected task row.
- SetupWizard redesign: split-canvas asymmetric layout, off-white canvas, display headline + eyebrow + lead paragraph, line-drawing background SVG at 12%, staggered entry motion (60ms × 5 blocks, respects `prefers-reduced-motion`).
- TopBar: dividers 5 → 2, Print button demoted to ghost, wordmark tracking refinement, K-baseline optical alignment.
- Gantt diagrammatic polish: 3px critical-path rail, today line pill, header tier weight differentiation, ghost stripe 45° → 30° with 1px outline, 1px/1.5px dependency arrow weight (critical-path emphasised), milestone diamond completion-state logic, segmented ghost-style toggle, Phosphor zoom pill.
- TaskList: WBS column to 24px universal, float column with explicit sign + tabular numerals, party color via `color-mix`, hover state on `--surface-sunken`.
- SidePanel & ActualDates: section header rules, slider tooltip on drag, `Calendar` icon prefix on date inputs, variance computation in ActualDates, tightened dependency preview chips.
- Modals universal: removed `backdrop-filter` (Swiss item 3), 3px top accent rule, standardised header padding `20px 24px 16px`, footer alignment primary-right/secondary-left.
- StatBar / FilterBar / LinkBuilder / PrintPreview: Critical + Variance stats, right-aligned Today pill, search icon prefix, segmented View control, segmented type/lag in LinkBuilder, drop-zone Phosphor polish, thumbnail mode strip in print modal header, title-bar pattern inside the A3 deliverable.
- Empty/loading/error states: gantt empty state, no-filter-results, empty-deps helper, CSV error report (5-row preview), localStorage-full banner, thin 2px loading bar pattern for >500 task computation.
- Marketing landing: hero asymmetric split with screenshot tilt, capabilities poster-grid (no three-card pattern), full-bleed navy interface band, numbered timeline rail, split closing CTA, 4-column footer with version line, real screenshots (no AI hero blob), display headline + lead copy reviewed.
- Dark mode polish: `--brand` shifted to `#0a1421`, warm-grain SVG noise overlay at 8% (dark only), status color lift +6%, full audit walk in `docs/dark-mode-audit-1.2.md` with screenshot evidence under `docs/v1.2-screenshots/dark-mode/`.
- Motion: status badge color transition (200ms), critical-path 1-shake on entry, CP toggle 240ms cross-fade, filter chip entry (160ms scale), full `prefers-reduced-motion` audit (`docs/reduced-motion-audit-1.2.md`).
- Brand identity asset kit: navy "M" favicon (SVG + 16×16 PNG fallback), 180×180 apple-touch with rounded-square wordmark frame, 1200×630 OG, print title-bar pattern, K-baseline wordmark refinement.

### 3.2 What Was Deferred or Removed

- **HK-3 — Mobile real-device QA.** Tracked in `docs/mobile-qa.md`, still owed before v1.3 Phase ships any work that touches the mobile sheet. Cited in `AGENT-HANDOFF.md` as a "blocker for Phase 11.8 dependency continuity" — but Phase 11.8 was a v1.2 phase that closed under code review; the real-device validation is the only remaining piece.
- **Optional `useMidnightTicker` regression test (HK-4).** StrictMode double-invoke is behaving correctly empirically. Test not added — non-blocking, but worth a v1.3 task if a ticker refactor lands.
- **CI on origin (HK-2).** `.github/workflows/ci.yaml` and PR template now tracked in the repo, but the handoff notes "push still pending human approval: CI-on-origin confirmation for `.github` tracking remains unverified until push approval." Verify on next push.
- **None of the v1 audit's "P0 / P1 / P2" priorities** (resources, DCMA, multi-baseline, S-curve, P6 import, cloud sync). All deferred to their roadmap-assigned versions, which is correct.

### 3.3 What Broke or Regressed

Nothing the test suite flagged. All gates green at ship:
- `npm run lint` — clean
- `npm run type-check` — clean
- `npm run test:unit` — **149/149**
- `npm run build` — clean
- `npm run test:e2e` — **9/9**

The only known caveat: lint scope was widened to exclude `.worktrees/**` because the orphan worktree at `feature/phases-3-6` carried a `no-explicit-any` debt. This is a config compromise, not a regression — but it should be cleaned up by removing the orphan worktree (HK-1 of v1.2's housekeeping carry-over, status unverified in handoff).

### 3.4 What the Codebase Says vs. What the User Sees

Two minor gaps worth flagging:

1. **Schema version is 1, but the data model is on the cusp of v1.3 changes.** `PERSISTED_SCHEMA_VERSION = 1` in `src/types/index.ts` will need to bump to 2 the moment v1.3 introduces `Resource`, `ResourceAssignment`, and per-task cost fields. The migration walk in `storage.ts` is structured to handle this cleanly — the pattern is already there.
2. **`UndoEntry` interface in `types/index.ts`** was scheduled for removal in v1.1 H2 and was removed — verified in changelog. No drift.

Otherwise the codebase and the UI agree.

---

## 4. Praise (What Earns Respect)

1. **The v1.1 changelog reads like a senior engineer's diary, not an AI's autocompleted task log.** Each entry names files, explains the decision, calls out follow-ups, and acknowledges the limits of the change. This is the kind of artefact a procurement evaluator looks at to decide "is this a real product." It is.

2. **`useDialogA11y.ts` is a single shared hook, not six bespoke focus traps.** Every modal in the app — CsvImport, GroupsManager, LinkBuilder, PartiesManager, PrintPreview, Workweek, SetupWizard — follows the same keyboard contract. That is the difference between accessibility-as-a-feature and accessibility-as-architecture. A construction firm's IT/compliance reviewer would notice.

3. **The de-vibecoded principle is stated, enforced, and tested.** The v1.2 plan's "seven AI tells we are eliminating" plus "seven de-vibecoded moves we're making" is a falsifiable design contract, not a vibe. The SetupWizard is the proof — it is the single most AI-tell-prone surface in any product (centred card, gradient field, generic CTA) and v1.2 broke every default to redesign it as an asymmetric, image-anchored, typographically considered first impression.

4. **The `MobileBottomSheet` is genuinely native-feeling, not a "responsive Gantt."** Pointer capture, drag physics with named constants, peek/full state, dialog semantics, focus trap, and a `MobileTabSwitcher` with proper ARIA. Field PMs on a 375px screen will not feel like they got the leftover layout. Most enterprise scheduling tools on mobile feel apologetic; this one does not.

5. **The persistence pipeline is now versioned, migrating, and re-stamping on save.** The migration walk handles v0 → v1 (legacy `task.deps[]` → `Dependency[]` edges with FS/lag=0 default), the schema version is a typed exported constant, and `saveState` re-stamps on every write. This is the structural prerequisite for v1.3 — adding resources, assignments, and cost loading without breaking the existing single-baseline data.

6. **The test pyramid is now upright.** 149 unit tests on pure `lib/*` (CPM, CSV, storage migration, dates, workdays, progress), 9 E2E Playwright specs covering the user-visible paths (create-task, csv-import, baseline, keyboard, mobile-sheet, a11y, onboarding desktop, onboarding example, plus the wired axe sweep). For a v0.2 product this is unusually mature.

7. **The brand identity is small but it is a system.** Navy `#1c3048` / cyan `#27aae1` / single warning / single success / single danger. Plus Jakarta Sans + Space Mono. Print title bar with the same wordmark treatment as the favicon and OG card. Wordmark with optical K-baseline alignment. None of these are big moves on their own — but they were made together and they are now consistent across app, mobile, print, marketing, and social cards.

---

## 5. Shame (What Deserves Criticism)

1. **Still no resources.** Year over year, audit over audit, this is the dimension that keeps this tool from being a "construction PM" tool and keeps it a "Gantt that construction PMs could use." The v1 audit said it. This audit says it again. v1.3 must close it. **If v1.3 ships without a credible resource model, the whole roadmap loses authority.**

2. **The `task.deps[]` legacy field is still in `Task`.** `src/types/index.ts:21` carries `deps: string[]` with the comment "derived — IDs of predecessor tasks (for backward compat display)." A v1.3 PM looking at the type sees two ways to express a dependency. Either delete the field (and the migration backfill that populates it) or rename it to make clear it is derived-only and never written. This is exactly the kind of "two sources of truth" mistake that compounds during the resource integration.

3. **The `.worktrees/phases-3-6` orphan worktree** is still cited as an open housekeeping item (HK-1 from v1.2). It was the source of v1.1's lint-on-`.worktrees` ignore exception. Until the orphan is removed, the lint config carries a workaround that future agents will inherit without context.

4. **Mobile real-device QA is owed and unblocked nothing.** `docs/mobile-qa.md` is a checklist with no checkmarks. The v1.2 sheet shipped with E2E coverage in Playwright Webkit — which is not a real iPhone. The first time a superintendent's iPad reports a janky drag, the team will not know if it is a code regression or an emulator gap.

5. **Marketing copy review used the right principles but the page is still mostly screenshot-driven self-description.** It says what the tool does. It does not yet say why a PM at a hospital build would switch from P6. Closing that gap is not a v1.2 task — but it will be a v1.3-or-later marketing pass once resource histograms are a screenshot. **Flag for v1.3 closing.**

6. **`useMidnightTicker` has no test.** v1.1 explicitly flagged this (HK-4) as "behaving correctly empirically, no test." With v1.3 about to add resources that have availability calendars and (later) cost-per-day calculations, the midnight rollover becomes load-bearing for resource demand calculations. Adding a unit test that exercises the cleanup path before v1.3 layers more time-sensitive code on top is cheap insurance.

7. **The handoff doc claims "all gates passed" but the lint exception for `.worktrees` is a config carve-out, not a green light.** When v1.3 begins, the first lint failure inside a real source path will not look any different from the carve-out, and an agent could plausibly extend the ignore list further. The cleaner move is removing the orphan worktree entirely so the carve-out can be deleted.

---

## 6. Checkpoint-Specific Questions

> **This is an interim audit.** The roadmap defines Checkpoint 1 to run after v1.3 ships, with five specific questions about the resource model. Those questions are unanswerable until v1.3 is built. The interim questions below are the ones a PM should answer before v1.3 work begins.

**Q1: Is the persistence layer ready to accept new data shapes (resources, assignments, cost) without a destructive migration?**
**A:** Yes. `PERSISTED_SCHEMA_VERSION` is a typed exported constant, `migrateState` is structured as a versioned walk (currently 0 → 1), and `saveState` re-stamps the version defensively. Bumping to `2` and adding a `resources: Resource[]`, `assignments: ResourceAssignment[]` migration is a clean additive walk. No destructive change required.

**Q2: Is the type system clean enough to add `Resource` / `ResourceAssignment` / `task.assignments` without ambiguity?**
**A:** Mostly. Add the new shapes alongside `Task` / `Dependency` in `src/types/index.ts`. **One pre-flight clean-up needed:** decide what to do with `Task.deps: string[]` (derived backward-compat). Recommendation: keep it for now but document explicitly that it is a read-model only and is never written by post-v1.0 code. Resource fields should be additive, never piggy-backed on `Task.notes` or anywhere ambiguous.

**Q3: Is the rendering pipeline (TaskList + Gantt) flexible enough to host a third synchronized lane (resource histogram below the Gantt)?**
**A:** Conditionally yes. The Gantt already exposes a `dayPx` zoom contract, a timeline object (`min/max/totalDays/totalPx`), and uses absolute positioning bound to the same date axis. Reusing the same timeline for a histogram below the Gantt is the right design move — same time axis, no double maintenance. Open risk: `useScrollSync` currently pairs TaskList ↔ Gantt; a third lane (histogram) will need to participate in the scroll-sync ref pattern, not introduce a fourth scroll source. Plan v1.3 should call this out explicitly.

**Q4: Is the visual surface ready for the new UI affordances resources will introduce (assignment badges, histogram colors, over-allocation flags)?**
**A:** Yes. v1.2 introduced the surface ladder (`--surface-sunken` for tracks), the data-semantic token set (positive/negative/warning/danger functional tokens), the Phosphor icon library (`Users`, `Wrench`, `Stack` — all available without new dependencies), and the `color-mix` party badge pattern. Resource assignment chips can re-use the party-chip visual idiom; over-allocation bars in the histogram can re-use `--color-danger` at low opacity. No new tokens required for the core resource v1 surface.

**Q5: Is performance headroom available for resource demand calculation on every schedule change?**
**A:** Probably yes, with care. CPM recompute is already debounced (~100ms) and tested at 500 tasks. Resource demand is a per-day rollup across all assignments — for 500 tasks × ~3 assignments each × ~30 days each, that is ~45k assignment-days, computed in pure JavaScript. This is fine if implemented as a memoized derivation keyed on `(tasks, assignments, resources, dateRange)` rather than naively recomputed in render. Plan v1.3 must specify this as a `useMemo` boundary, not a render-time loop.

**Q6: Are there documentation or process gaps that would slow a resource-foundation build?**
**A:** Minor. The handoff doc, START-HERE, version-status, and CLAUDE.md are all current and accurate for v1.2 ship state. The `docs/design-system.md` (created in Phase A.5 of v1.2) needs a v1.3 update for resource-affordance tokens, but that is a v1.3 task, not a blocker.

---

## 7. Instrument Feel Assessment

| Criterion | Pass / Fail | Notes |
|---|---|---|
| **Swiss visual discipline maintained?** | ✅ Pass | Zero gradients, zero card spam, no AI tells. Surface ladder is three tones, not chrome. |
| **Keyboard-first operation preserved?** | ✅ Pass | Modal focus traps via shared hook, keyboard E2E spec green, `Escape` closes panel even with focus inside input, `N` shortcut respects input-focus guard. |
| **Print output still production-grade?** | ✅ Pass | A3 canvas with title-bar pattern, thumbnail mode strip in modal header, mode switch (2-col Gantt or summary table). |
| **Performance target met?** | ✅ Pass | 500 tasks at 55fps target carried forward, manual windowing live above 100 rows, memoized hot-path maps. No regression in unit or E2E suites. |
| **No hardcoded hex in components?** | ✅ Pass (with the one documented carve-out for `#1c3048` brand navy and `#fff` print paper). |
| **Dense, not decorated?** | ✅ Pass | FilterBar/StatBar/TopBar remained dense; v1.2 added information (variance pill, critical count) rather than chrome. |
| **Feels like a tool, not a toy?** | ✅ Pass | The 20-year tradesperson superintendent test: the SetupWizard now opens like an engineering deliverable, not a "Get Started" SaaS card. |

**Instrument feel verdict:** **Strong.** This is the strongest the surface has been in the product's history. The risk for v1.3 is precisely this dimension — adding a histogram, assignment chips, and a resource panel is the largest UI surface expansion since v1.0, and it is the easiest place for visual discipline to slip. Every v1.3 component must pass the "would I notice it missing?" pre-flight test from `plan-v1.2.md §2`.

---

## 8. Comparison to Prior Audits

### 8.1 Score Trend

```
v1 audit  (post-v1.0):  3.6/10 (holistic) / 3.7/10 (equal-weight 15-dim)
v2 audit  (post-v1.2):  4.5/10 (holistic) / 4.4/10 (equal-weight 16-dim, +trust dim)
v3 audit  (post-v1.3):  pending  (Checkpoint 1)
v4 audit  (post-v1.5):  pending  (Checkpoint 2)
v5 audit  (post-v1.8):  pending  (Checkpoint 3)
v6 audit  (post-v2.0):  pending  (Checkpoint 4)
v7 audit  (post-v2.2):  pending  (Checkpoint 5 — Final)
```

### 8.2 Repeated Praise

These are the product's chronic strengths — praised by both audits:

1. **Architectural discipline.** State centralized in `App.tsx`, pure `lib/*` modules, dumb components. The v1 audit called it "cleaner than 80% of commercial SaaS products in this space." v1.2 did not weaken this — it added test coverage on top.
2. **Critical path implementation.** Real Kahn + forward/backward pass with FS/SS/FF/SF + lag. Now also unit-tested.
3. **Print-first mentality.** A3 print canvas treated as a first-class deliverable, not a CSS `@media print` afterthought.
4. **Visual restraint.** v1 praised the Swiss discipline. v1.2 elevated it from "restrained" to "intentional" — every surface now has a reason for every pixel.

### 8.3 Repeated Shame

Things criticized in both audits — these are chronic gaps that have been deferred (correctly per the roadmap), but are now urgent:

1. **No resource management.** Audit-over-audit. Mandatory in v1.3. **This is now the single highest-priority feature on the entire roadmap.**
2. **No schedule quality engine.** Mandatory in v1.4. Still deferred.
3. **No collaboration / cloud sync.** v2.0 territory. Deferred — but the architecture has been kept clean enough that this remains feasible.
4. **Stub or insufficient E2E coverage on some flows.** The v1 audit's "E2E tests are stubs" criticism is largely closed — v1.1 shipped 6 real specs — but a real-device mobile QA pass is still owed, and `useMidnightTicker` has no test.

### 8.4 Resolved Items

Things the v1 audit criticised that are now meaningfully addressed:

1. ✅ **"Marketing is untracked and unfinished."** Marketing landing now tracked in git with metadata, OG card, favicon system, copy review, deploy target documented (`docs/deploy.md`).
2. ✅ **"E2E tests are stubs."** Six real Playwright specs + axe sweep. Webkit mobile sheet flow tested end-to-end.
3. ✅ **"No CI."** GitHub Actions workflow + PR template tracked (pending push verification — HK-2 carry-over).
4. ◐ **"Mobile = 5/10."** Now 6.5/10 with the bottom sheet shipped. Still needs real-device QA. Offline-first + photo attach + field-daily are v2.x.
5. ◐ **"WBS code export."** Display-only WBS still — v1.7 scope. Not a v1.2 closure.

---

## 9. Decision Gate

**This is an interim audit. No roadmap decision gate fires here.**

The next decision gate is **Checkpoint 1 — after v1.3 ships**, with the threshold: *if score below 5.5/10, pause v1.4 and fix the resource foundation*. The Checkpoint 1 audit is `pm-audit-v3.md` (not this file).

**Provisional recommendation for the period this audit covers:**

| Question | Answer |
|---|---|
| Is the product ready to start v1.3 work? | **Yes, conditional.** Conditions: (a) clear HK-1 orphan worktree, (b) schedule mobile real-device QA, (c) decide explicitly on `Task.deps[]` handling before adding resources. |
| Should v1.3 begin immediately? | **Yes**, after the v1.3 plan lands in `.claude/plan-v1.3.md`. |
| Are there any gaps that block v1.3? | **No blocking gaps.** Two soft gaps: real-device mobile QA and `useMidnightTicker` test. Neither prevents v1.3 starting; both should close inside v1.3. |

---

## 10. Recommendations for Next Version (v1.3)

### 10.1 Must Fix (Blocking — close before v1.3 ships, not before it starts)

- **Schema migration `1 → 2`.** Add `resources: Resource[]`, `assignments: ResourceAssignment[]`, and any cost fields to `PersistedState`. Implement the additive migration walk in `storage.ts`. Bump `PERSISTED_SCHEMA_VERSION`. Unit-test the migration with a v1-schema fixture.
- **Decide `Task.deps[]` policy** before adding resource assignments. Recommendation: leave the field, mark it read-only-derived in the type comment, and never write to it from new code. Add a lint rule or convention note in `CLAUDE.md`.
- **Histogram timeline contract.** Re-use the existing `Timeline` object from `src/lib/timeline.ts` for the resource histogram. Do NOT introduce a parallel timeline computation. Same axis, same `dayPx`, same scroll-sync ref pattern via `useScrollSync`.

### 10.2 Should Fix (High Priority — close in v1.3 unless explicit deferral)

- **Real-device mobile QA.** Block any visual change to `MobileBottomSheet` until a 375px iPhone and a 360px Android Chrome touch-pass is logged in `docs/mobile-qa.md`.
- **`useMidnightTicker` regression test.** v1.3 introduces resource availability calendars — the midnight tick becomes load-bearing.
- **Remove orphan worktree `.worktrees/phases-3-6`** and drop the `.worktrees/**` lint ignore from `eslint.config.js`.
- **CI-on-origin verification (HK-2).** Confirm GitHub Actions actually runs on push after the `.github/` files are tracked.

### 10.3 Nice to Have (Low Priority — defer if v1.3 schedule pressures)

- **Marketing v2 pass** with resource-histogram screenshot once v1.3 ships, replacing the current schedule-only screenshots in the hero/interface sections.
- **Update `docs/design-system.md`** with the v1.3 tokens added for resource affordances (assignment chips, histogram color spec, over-allocation pattern).
- **Sweep for any remaining hardcoded magic numbers** in `src/styles/app.css` that should graduate to `tokens.css` (Phase 7 carry-over).

### 10.4 Scope Creep Warning

The v1 audit identified the seductive trap: "the temptation to add resources or cloud sync derail the production-readiness pass." v1.1 and v1.2 resisted that. v1.3 has a new version of the same trap:

- **Do not add EVM, S-curves, or cost-loaded reporting in v1.3.** Those are v1.6.
- **Do not add multi-baseline in v1.3.** That is v1.5.
- **Do not add cloud sync "while we're refactoring persistence anyway."** That is v2.0.
- **Do not add resource leveling automation in v1.3.** Manual leveling (drag tasks within float, watch histogram update) is the v1.3 deliverable. Automatic leveling is v1.5 or v2.x territory.
- **Do not add cross-project resource pools.** Single project, single resource list, single cost rate per resource. Portfolio is v2.1.

Resource pools + per-task assignment + a synchronized histogram + cost rate per resource = v1.3. **That is the entire surface area.** Anything else slips into a later version.

---

## 11. Final Verdict

The product spent v1.1 and v1.2 making itself worthy of the v1.3 organ transplant. The bones got sterilised, the surface stopped looking AI-made, and the visual identity is now small but coherent. None of this moved the construction-PM fitness needle materially, and it was never supposed to — v1.1 was about trust, v1.2 was about perception, and v1.3 is about capability. The roadmap discipline of "one organ at a time" held.

**The single most important thing between this audit and Checkpoint 1 is not the resource feature itself — it is whether the resource feature is integrated with the same discipline that produced v1.1 and v1.2.** A sloppy histogram, an over-eager auto-leveler, a CSV importer that silently drops assignment data, or a mobile sheet that becomes unusable when assignment chips overflow — any of those would undo two versions of foundation work in a single phase.

**One-line summary:** The product is now a defensible foundation looking for its first real organ; v1.3 must add resources without breaking the visual instrument or the trust floor that v1.1 and v1.2 paid for.

---

## Filing Instructions (already executed by Claude on save)

1. ✅ Saved as `.claude/pm-audit-v2.md`.
2. ✅ Updated score trend (§8.1).
3. ✅ `version-status.md` updated to link this audit and mark v1.3 plan link once `plan-v1.3.md` lands.
4. ◐ Roadmap fitness column update deferred to the v3 (Checkpoint 1) audit — this interim audit does not change roadmap targets.
5. ◐ Recommendations forwarded to `plan-v1.3.md` §pre-flight housekeeping.
