# CLAUDE.md — Project Conventions & Design Rationale

This file is the **durable** project reference: what the codebase is, why it is the way it is, and the conventions that govern it. For "where do I start?" read `START-HERE.md`. For "how do I build?" read `AGENTS.md`. For "what state is the project in right now?" read `AGENT-HANDOFF.md` and `version-status.md`.

This file is updated by Claude (planning agent) when a design decision changes or a new clarification lands. Codex (implementation agent) does not normally edit this file.

---

## What This Is

**MAKE Scheduling Tool** — A Gantt-style project scheduling application for construction PMs managing institutional-scale builds (hospitals, community centres, civil infrastructure). v1.0 shipped 2026-05-21; v1.1 shipped 2026-05-22 (`v0.1.0`); v1.2 shipped 2026-05-22 (`v0.2.0`); v1.3 shipped 2026-05-23 (`v0.3.0`); v1.4 shipped 2026-05-25 (`v0.4.0`); **v1.5 shipped 2026-05-25 (`v0.5.0`)**. **v1.6 (reporting & analytics) is the active implementation plan.**

The buyer is institutional (municipal procurement, healthcare authorities). The user is a tradesperson PM who has been on jobsites for 20 years. The output (printed A3, exported PDF) is a defensible deliverable, not a marketing brochure. Every design decision falls out of this.

---

## Tech Stack

| Concern | Choice |
|---------|--------|
| Bundler | Vite (multi-page: `index.html` + `marketing.html`) |
| Language | TypeScript strict |
| UI | React 18 |
| State | `useState` + `useCallback` + `useMemo` — no Redux/Zustand/etc |
| Styling | CSS custom properties (design tokens) in `src/styles/tokens.css` |
| Fonts | Plus Jakarta Sans 400/500/600 + Space Mono 400/700 |
| Persistence | localStorage, key `schedule-tool-v1`, schema version 3 |
| Gantt | Custom (absolutely positioned divs + SVG) — no chart libraries |
| Dark mode | `prefers-color-scheme: dark` — no manual toggle |

High-level shape: `src/components/` (presentational), `src/hooks/` (side effects), `src/lib/` (pure utilities), `src/styles/` (tokens + globals), `src/types/index.ts` (single source of truth for the data model), `src/constants.ts` (every magic number). For the operating manual see `AGENTS.md`.

---

## The Ten Key Design Decisions

These are the load-bearing decisions. Changing any of them is a structural decision that needs its own plan, not a casual refactor. They exist *for reasons* — the rationale is preserved here so a future agent doesn't innocently undo them.

### 1. No Chart Libraries
The Gantt is custom HTML/CSS:
- Bars are absolutely positioned `div` elements (20px height, 5px radius)
- Dependency arrows are SVG with elbow routing
- Zoom adjusts `dayPx`; no D3 / Recharts / VictoryChart / etc

**Why:** Chart libraries assume general-purpose use. Construction Gantt has too many specific behaviours (critical path styling, ghost baseline bars, milestone diamonds, weekend bands, today line, variance pills, lag visualization) that fight any abstraction we'd buy off the shelf. Owning the render path is faster than wrapping a library.

### 2. Scroll Sync via `useRef` Flag, Not State
`useScrollSync` uses `syncingScroll = useRef(false)` to prevent feedback loops between task list and Gantt scroll.

**Why:** If `syncingScroll` were `useState`, every flip would trigger a re-render between the listener and the partner update, defeating the guard and producing infinite scroll loops. The ref pattern is the only correct shape here.

### 3. Auto-Progress with Manual-Flag Overrides
Tasks auto-calculate `status` and `pct` from planned dates unless `manualStatus` or `manualPct` is set. Setting `actualFinish` auto-sets pct=100, status='complete', both manual flags=true. Clearing `actualFinish` reverts to auto.

**Why:** Construction PMs need both "automatic if I haven't said otherwise" *and* "stop touching this row, I've manually overridden it." Without manual flags, the midnight ticker would silently undo user input. The flags are not a UX nicety — they are the integrity guarantee for the auto-progress system.

### 4. Undo Stack — Only Three Actions Push
Delete task, CSV replace, CSV append. Reset clears. Max 20 snapshots (LIFO).

**Why:** Users expect undo to revert "big" operations, not individual field edits. Pushing on every keystroke would burn the stack inside ten seconds of typing. The three-action rule matches the user's mental model of what's recoverable.

### 5. Critical Path Method via Kahn + Forward/Backward Pass
Only computed when `hasDeps = true` AND user enables the toggle. Kahn topological sort, forward pass (early start/finish), backward pass (late start/finish), total float. Zero-float tasks = critical path.

**Why:** CPM is the math construction schedules are evaluated against. The implementation supports per-edge `type` (FS/SS/FF/SF) and `lag` because real schedules have those, not just simple FS chains. See `src/lib/cpm.ts`.

### 6. Design Tokens — Zero Hardcoded Hex in Components
All colors, fonts, spacing, radii live in `:root {}` in `src/styles/tokens.css`. Dark mode via `@media (prefers-color-scheme: dark)` overrides. Components read `var(--token)` only.

**Why:** Dark mode + brand consistency + future-proofing for white-label theming. One exception is intentional: the brand navy header (`#1c3048`) and print paper (`#fff`) are locked.

### 7. Print Preview at A3 × 0.55 Scale
Print modal renders schedule on A3 paper (1587×1122px) at 55% preview scale. Two modes: 2-col Gantt OR summary table. Browser print uses print-specific CSS.

**Why:** Construction PMs print weekly. Often daily. The output is a deliverable shown to owners, inspectors, and lawyers. Designing print as a first-class surface (not an `@media print` afterthought) is what separates this from generic SaaS Gantt tools.

### 8. Mobile = Bottom Sheet, Not a Cramped Desktop Layout
On viewports ≤640px, the SidePanel becomes a `MobileBottomSheet` with peek (40vh) and full (85vh) states, drag-to-dismiss physics (`SHEET_DISMISS_VELOCITY = 0.5`, `SHEET_DISMISS_DELTA = 80`), and a separate tab switcher for List/Gantt navigation.

**Why:** Field PMs use tablets and phones on site. A miniaturized desktop layout fails on real screens. The bottom sheet is the only native-feeling pattern for "open task details" on touch devices.

### 9. Pure-Lib Boundary Is Non-Negotiable
`src/lib/*` modules remain pure input→output transformations. React hooks/UI logic live in components or hooks, and localStorage access is isolated to `src/lib/storage.ts`.

**Why:** The project now relies on a growing pure-core surface (`cpm`, `dcma`, `health`, `floatDistribution`, `variance`, `baselines`, `changeOrders`, and related utilities) with heavy unit-test coverage and predictable performance behavior. Crossing that boundary would degrade testability and make perf regressions harder to isolate.

### 10. Dual Print-Mode Pattern (A3 Schedule + A4 Reports)
Print output is split by artefact type:
- A3 landscape print mode for schedule/Gantt deliverables
- A4 report print mode for owner-facing summaries

**Why:** These outputs solve different communication jobs. Combining them into one print surface increases density and weakens both. Keeping two dedicated print modes preserves legibility and defensibility in meetings.

---

## Resolved Clarifications

These were open questions during v0 implementation. **All four are closed.** Listed here so an agent reading old plans doesn't think they're still open.

| ID | Question | Decision | Shipped in |
|----|----------|----------|------------|
| C1 | Should dependencies persist per-edge `type` + `lag`? | Yes. `Dependency` is `{fromId, toId, type, lag}`. `src/types/index.ts:28-33`. | v1.0 |
| C2 | Should `ghostStyle` (baseline render mode) be persisted? | Yes. Field on `PersistedState`. `src/lib/storage.ts:24,60`. | v1.0 |
| C3 | Should actual-date cross-field validation block save? | No. Non-blocking warning, save proceeds. `ActualDatesSection.tsx`. | v1.0 |
| C5 | Should "Load example data" skip onboarding animations? | Yes. `handleLoadExample` calls `advanceOnboarding()` directly. `App.tsx:254-257`. | v1.0 |

There is no C4. The numbering preserves the original handoff doc.

---

## Conventions

- **CRITICAL: Respect .gitignore absolutely.** NEVER commit, stage, or push ANY file listed in `.gitignore`. This is non-negotiable. Before every `git add` and `git push`, check `.gitignore` first. Violations include: `.env`, `.env.local`, `node_modules/`, `dist/`, `build/`, IDE files (`.vscode/`, `.idea/`), logs, and all generated/temporary files. Committing ignored files risks leaking secrets and polluting the repo.
- **TypeScript strict.** No `any`. No default exports (named exports only — easier to grep + refactor).
- **Components:** PascalCase. **Hooks:** `use` prefix. **Props interfaces:** `{ComponentName}Props`.
- **Magic numbers → `src/constants.ts`.** Colors → `src/styles/tokens.css`. No exceptions outside the brand-navy / print-paper carve-out above.
- **`src/lib/*` modules are pure.** Input → output, no side effects. Only `storage.ts` touches localStorage.
- **No nested ternaries.** Extract to if/else or guard clauses.
- **Match prototype behaviour when spec is ambiguous.** `handoff/MAKE Scheduling Tool v4.html` is the behavioural source of truth.
- **No new dependencies without justification.** Specifically: do NOT add `react-virtual` — manual windowing is fine for the current scale.

---

## Where to Look Next

- **Operating manual** (commands, critical patterns, deploy, testing quirks): `AGENTS.md`
- **Orientation + read order** (which file when): `.claude/START-HERE.md`
- **What state is the project in right now**: `.claude/AGENT-HANDOFF.md`, `.claude/version-status.md`
- **Active plan**: `.claude/plan-v1.6.md` (reporting & analytics).
- **Shipped predecessors**: `.claude/plan-v1.5.md`, `.claude/plan-v1.4.md`, `.claude/plan-v1.3.md`, `.claude/plan-v1.2.md`, `.claude/plan-v1.1.md`.
- **Long-term roadmap (v1.3 → v2.2)**: `.claude/pm-roadmap.md`

---

**Last updated:** 2026-05-25
**Maintained by:** Claude (planning agent). Update when a Key Design Decision changes, a new clarification resolves, or a convention shifts. Do not update for routine code changes.

<!-- Updated 2026-05-22: flipped active version pointer from v1.1 → v1.2 after v1.1 shipped as `v0.1.0`. -->
<!-- Updated 2026-05-21: full restructure with eight Key Design Decisions + resolved clarifications. -->
<!-- Updated 2026-05-25: refreshed active version state to v1.5 shipped / v1.6 active, schema version to 3, expanded key decisions to ten (pure-lib boundary + dual print-mode pattern), and updated active-plan pointers. -->
