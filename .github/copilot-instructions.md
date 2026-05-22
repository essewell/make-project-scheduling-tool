# Copilot Instructions for this Repository

Purpose

This file gives repository-specific guidance to future Copilot sessions: how to build/run/lint, the high-level architecture, and conventions that require cross-file knowledge.

Build / Dev / Lint

- Install deps: `npm install`
- Dev server (HMR): `npm run dev` (script: "dev": "vite")
- Build (prod): `npm run build` (script: "build": "tsc -b && vite build")
- Preview production build: `npm run preview` (script: "preview": "vite preview")
- Lint: `npm run lint` (script: "lint": "eslint . --report-unused-disable-directives --max-warnings 0")
- Type-check: `npm run type-check` (script: "type-check": "tsc --noEmit")

Notes: There are no test scripts in package.json at time of writing. If tests are added, follow the project README or add a `test` script. Use `npm run <script>` to run single/targeted tasks.

Authoritative Sources

- handoff/README.md — full implementation spec and behaviour (source of truth)
- handoff/*.html — interactive prototypes; open in a browser to verify interactions and animations
- .claude/CLAUDE.md — existing AI-specific guidance; consult it for stack, architecture patterns, build commands and clarifications

High-level architecture (big picture)

- App.tsx is the single top-level owner of application state. Most UI state and persisted state live here.
- State groups:
  - Persisted (PersistedState): tasks, groups, phases, parties, workweek, baselineVersion, undoStack
  - Transient/UI: kbFocusId, completionFlashId, selectedTaskId, panel/modal open flags
  - Computed/memoized: visibleRows, timeline, criticalPath
- Component layout (high level): src/components/{topbar, gantt, task-list, panels, modals, overlays, filter, mobile}
  - Gantt: custom implementation (absolutely positioned div bars) + SVG overlay for dependency arrows
  - Task list: left column with rows that must sync vertically with the Gantt
  - Side panel / modals: task editing, CSV import, Print preview, link builder, etc.
- Utility modules (pure, no side effects except storage.ts): src/lib/{dates, progress, cpm, csv, storage, timeline, workdays}
  - cpm.ts implements Kahn topological sort + forward/backward passes to compute critical path
  - storage.ts handles localStorage persistence and undo stack
- Hooks: custom hooks encapsulate complex behaviour: useKeyboard, useScrollSync, useMidnightTicker, useOnboarding
- Persistence: localStorage key = 'schedule-tool-v1' (see constants.ts)
- Performance: expensive calculations must be wrapped in useMemo; Gantt bars should be lightweight and memoized

Key conventions and repo-specific patterns

- TypeScript strict mode: do not use `any`. Use explicit interfaces in src/types/index.ts and named exports (avoid default exports).
- Component & hook naming:
  - Components: PascalCase (e.g., TaskList.tsx)
  - Hooks: camelCase with `use` prefix (e.g., useKeyboard.ts)
  - Props interfaces: `{ComponentName}Props`
- CSS & design tokens:
  - All colors, fonts, spacing, radii are CSS custom properties in tokens.css; components should reference vars — avoid hardcoded hex values in components
  - Dark mode handled via `prefers-color-scheme: dark` overrides
- Gantt specifics:
  - Bars are absolutely positioned divs (20px height, border-radius 5px). Dependency arrows are SVG elbow routing.
  - Zoom levels and header tiers are computed by timeline utilities (day ↔ px conversion) — change dayPx via constants/ZOOM_LEVELS
  - Scroll sync: use a `syncingScroll` useRef guard to prevent feedback loops (task list ↔ gantt)
- Undo stack policy: only push on big operations (delete task, CSV replace, CSV append). Undo stack is LIFO with max 20 entries. Small field edits should not push to undo.
- Auto-progress & midnight ticker: tasks auto-calc status/pct daily unless manual flags are set. useMidnightTicker schedules a setTimeout to the next midnight + 100ms and re-runs auto-progress.

Open design/clarifications to resolve (copied from handoff):
- C1: Should `depType` and `lag` be persisted per-edge? Currently they are discarded on save. (Critical)
- C2: Persist `ghostStyle` (baseline visualization) in localStorage (recommended)
- C3: Should actual-date cross-field validation block save or remain advisory?
- C5: Should example-data loading skip onboarding animations?

Other AI assistant configs found

- .claude/CLAUDE.md — contains detailed guidance for Claude and includes the same build commands, architecture overview, tests/validation guidance, and clarifications. Use it as a reference when a CLAUDE-specific prompt is needed.
- No other AI-assistant rule files detected (e.g., .cursorrules, AGENTS.md, .windsurfrules).

When opening the code for tasks that require fidelity

- Keep the HTML prototypes open and verify interactions visually (dragging, arrows, onboarding flow, print preview). Many behaviours live only in the design HTML files.
- Consult handoff/MAKE Handoff v4 FINAL.html for tokens, constants, and state-shape.

If making changes to state shape or persistence

- Update src/types/index.ts and storage.ts together; coordinate any change to the persisted schema (migrations/backwards compatibility) in storage.ts
- If adding persisted fields (e.g., ghostStyle), add tests or a small migration path on load

Contact points / next steps (for Copilot sessions)

- Read handoff/README.md and the HTML prototypes before implementing UI behaviour
- Resolve clarifications C1/C2/C3/C5 with stakeholders early

---

(End of copilot guidance)
