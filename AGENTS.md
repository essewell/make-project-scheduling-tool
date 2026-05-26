# AGENTS.md — Operating Manual

> Build commands, critical patterns, and operational quirks. **Read `.claude/START-HERE.md` first** to orient and confirm your lane (codex vs Claude). Read `.claude/CLAUDE.md` for the *why* behind the architecture; this file is the *how*.

## Commands

```
npm run dev          # Vite dev server (HMR)
npm run build        # tsc -b && vite build (multi-page: app + marketing)
npm run preview      # serve dist/ (Playwright baseURL uses :5174)
npm run lint         # eslint --max-warnings 0
npm run type-check   # tsc --noEmit
npm run test:unit    # vitest run tests/unit
npm run test:e2e     # playwright test (needs preview server on :5174)
```

**CI order:** lint → type-check → test:unit --coverage → build → E2E (`.github/workflows/ci.yaml`)

## Architecture (one-line)

All state in `App.tsx` (useState). Components are presentational + callback-driven. `lib/` = pure utilities (no React, no localStorage except `storage.ts`). `hooks/` = side-effect encapsulation. No external state library.

```
src/
  components/App.tsx           ← owns ALL state
  components/{gantt,task-list,panels,modals,overlays,topbar,filter,mobile}/
  hooks/{useKeyboard,useScrollSync,useMidnightTicker,useOnboarding}
  lib/{dates,progress,cpm,csv,storage,timeline,workdays,exampleData}
  styles/{tokens.css,reset.css,app.css,components.css}
  types/index.ts               ← single source of truth for data model
  constants.ts                 ← ALL magic numbers
  marketing/                   ← second Vite entry point (decoupled)
```

## Critical Patterns (get these wrong and things break)

### Scroll sync uses `useRef` flag, NOT state
`useScrollSync` uses `syncingScroll = useRef(false)` to prevent feedback loops between task list and Gantt scroll. If you change this to `useState`, you get infinite loops.

### Undo stack: only 3 actions push
Delete task, CSV replace, CSV append. Reset clears. Do NOT push on individual field edits. Max 20 snapshots (LIFO).

### Midnight ticker + React.StrictMode
`useMidnightTicker` schedules `setTimeout` to next midnight. StrictMode double-invokes effects in dev — the cleanup must cancel the timer or you get two timers firing.

### useMemo dependency arrays
Wrap expensive calcs (`buildTimeline`, `computeCriticalPath`, `visibleRows`) in `useMemo` with **explicit, minimal** deps. Missing = stale cache. Extra = cache thrashing.

### No hardcoded hex in components
All colors via `var(--token)` from `src/styles/tokens.css`. Dark mode via `@media (prefers-color-scheme: dark)`. Only exception: brand header `#1c3048` and print paper `#fff`.

### Gantt bars are `React.memo`'d
`GanttBar.tsx` is the hottest render path. Must stay `React.memo` with custom comparator. Never pass inline arrow functions as props to memoized children — wrap in `useCallback`.

## Persistence

- **Key:** `schedule-tool-v1` in localStorage
- **Schema version:** `persistedSchemaVersion: 3` stamped on every save
- **Migration:** `storage.ts` handles legacy payload migration up to v3
- **Schema changes:** Update `types/index.ts` + `storage.ts` together. Add migration on load.

## Multi-page Vite build

Two entry points: `index.html` → app, `marketing.html` → landing page. Configured in `vite.config.ts`. They share **no runtime state**. Marketing is in `src/marketing/` with its own `main.tsx`.

## Deploy

- **Netlify:** `netlify.toml` — SPA rewrite to `/index.html`
- **Vercel:** `vercel.json` — same rewrite
- **CI:** GitHub Actions on push/PR to `main` + `develop`

## Testing quirks

- **Vitest:** `exclude: [...configDefaults.exclude, 'tests/e2e/**']` — the spread of `configDefaults` is critical. Without it, vitest scans `node_modules` and picks up broken jest-format tests (82s run, spurious failures — fixed in v1.1 H1).
- **Playwright:** targets `http://localhost:5174` (not 5173). E2E runs against `npm run preview` build, not dev server.
- **Unit tests:** `tests/unit/lib/` (pure-function suites only, no React).

## Performance targets

- 500+ tasks: list scroll ≥ 55fps, drag no frame drops > 33ms, CP recompute < 100ms
- Task list virtualization at `VIRTUALIZE_THRESHOLD = 100` rows (manual windowing, no `react-virtual` dep)
- 500-task fixture: `scripts/500-tasks.json` + `scripts/generate-500-tasks.ts`

## Current implementation state

> Not duplicated here. See `.claude/version-status.md` for the version tracker, `.claude/AGENT-HANDOFF.md` for the freshest "what just landed / what's next," and the active plan's Build Changelog (currently `plan-v1.6.md §17`) for detailed history.

## Authoritative references

| File | Purpose |
|------|---------|
| `.claude/CLAUDE.md` | Project conventions, architecture, code style |
| `.claude/plan-v1.6.md` | **Active implementation plan** — reporting & analytics (Build Changelog in §17) |
| `.claude/plan-v1.5.md` | ✅ Shipped 2026-05-25 (`v0.5.0`). Prior build changelog reference. |
| `.claude/taste-audit-swiss.md` | Swiss design audit (items 1-8 applied in v1.0; 9-12 in v1.1; structural items roll into v1.2) |
| `handoff/README.md` | Full implementation spec (gitignored — design reference) |
| `handoff/*.html` | Interactive prototypes (gitignored — behavioral source of truth) |

## Context Compaction Every 2 Mini-Tasks

**Agents must auto-compact context after every 2 consecutive mini-tasks complete** (e.g., Phase A.1 + A.2). This prevents token bloat during long implementation sessions.

- **Trigger:** After every 2nd phase/mini-task (not every 1, not every 3+)
- **Action:** Summarize last 3 decisions + current state → update AGENT-HANDOFF.md → optionally use `/spartan:context-save`
- **Preserve:** Branch state, what landed, next 2 actions, recent decisions
- **Drop:** Verbose logs, old error messages, failed attempts already documented elsewhere
- **Update:** AGENT-HANDOFF.md is the single source of truth for continuity; keep it fresh

This keeps the session lean without losing the thread.

## .gitignore — The Absolute Rule

**NEVER commit, stage, or push any file listed in `.gitignore`.** This is the single most important convention.

**Check `.gitignore` BEFORE every `git add`.** Check `git status` BEFORE every `git push`. The key violations are:
- **Secrets:** `.env`, `.env.local`, `.env.*.local` — these MUST never reach git
- **Build outputs:** `dist/`, `build/`, `node_modules/` — generated, not source
- **IDE files:** `.vscode/`, `.idea/`, `*.swp`, etc. — personal editor config
- **Logs:** `*.log`, `logs/` — verbose output
- **Any generated file** listed in the `.gitignore` → stays out of git, always

If you're unsure, read `.gitignore` and verify the file is not there. Committing ignored files can leak secrets to the public repo and break the development workflow.

## .claude Commit Rule

All meaningful `.claude/` updates must be committed in the same branch cycle they are made. Do not leave `.claude` plan, status, handoff, or audit-doc edits unstaged across handoffs.

- Required when changed: `.claude/AGENT-HANDOFF.md`, `.claude/version-status.md`, active `plan-v*.md` changelog sections, and any `.claude` governance docs touched during the version.
- Before handoff/PR: run `git status` and ensure `.claude/` changes are either committed or intentionally reverted.
- Exception: temporary scratch notes are allowed only if kept outside `.claude/` or in gitignored paths.

## Phase-Boundary Procedure (Mandatory)

At every phase or mini-phase boundary in an active plan:
- Stop and summarize what landed.
- Update `.claude/AGENT-HANDOFF.md`.
- Append the phase entry to the active plan Build Changelog section.
- Commit that phase slice before continuing to the next phase.

Do not batch multiple phases into one commit unless the active plan explicitly says to do so.

## Conventions

- TypeScript strict. No `any`. Named exports only (no default exports).
- Components: PascalCase. Hooks: `use` prefix. Props: `{Name}Props`.
- Magic numbers → `constants.ts`. Colors → `tokens.css`.
- `lib/` modules are stateless (input → output). Only `storage.ts` touches localStorage.
- Match behavior against HTML prototypes when spec is ambiguous.
- **One branch per version (MANDATORY).** Before the first commit of any new version, the implementation agent MUST create and check out a branch named exactly `v{N}` (e.g. `v1.4`, `v1.5`, `v2.0`) from `main`. All work for that version lands on that branch. Ship merges via PR to `main`, then tag `v0.{N}.0`. **Never commit version work directly to `main`.** This rule is in effect for every version from v1.4 onward — agents should not need to be reminded per plan.

## PM Audit System

See `.claude/START-HERE.md` for the full workflow (read order, agent lanes, continuity cycle). PM audits run at the checkpoints defined in `.claude/pm-roadmap.md` using `.claude/pm-audit-template.md`. **PM audits are a Claude (planning agent) job, not codex.**
