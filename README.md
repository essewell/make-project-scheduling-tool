# MAKE Scheduling Tool

A Gantt-style project scheduler built for construction PMs managing institutional-scale builds. Purpose-built for weekly printing, multi-baseline tracking, resource management, and earned-value analysis.

**Current version:** 0.7.0 (v1.7)  
**Status:** Active development. Six versions shipped since May 2026.  
**Target user:** Tradesperson PM with 20+ years site experience, evaluating schedules against printouts in meetings with owners and inspectors.

---

## What You Get

### Core Scheduling
- **Task list + Gantt timeline** with dependency links (`FS`, `SS`, `FF`, `SF`) and lag support
- **Critical path method** enabled via Kahn topological sort; shows which tasks have zero float
- **Baseline capture** — up to N named baselines per project with reason, author, and date; ghost-bar overlay for variance visualization
- **Baseline comparison modal** — side-by-side diff showing slips, added tasks, removed tasks
- **Actual progress tracking** — auto-calculate completion from planned dates; override manually when needed

### Resource Management
- **Resource pools** defined per category (crews, equipment, materials)
- **Per-task assignments** with unit, capacity, and cost rate
- **Resource histogram** showing utilization by week; over-allocation highlighted
- **Drag-to-reschedule leveling** — move tasks horizontally in Gantt to flatten peaks

### Project Financials
- **Task cost rollups** — automatic aggregate from assignments
- **Multi-baseline cost tracking** — compare planned vs actual spend
- **Earned value management** — PV, EV, AC, SPI, CPI with EVM charts
- **Change order log** — modal + sidepanel section to track scope changes
- **Cash flow by month** — stacked bar chart, exportable to reports

### Analytics & Reports
- **S-curve** — planned vs actual burndown with variance summary
- **Executive summary** — owner-facing six-section report (timeline, spend, critical path, top risks, change summary, next week)
- **Weekly progress report** — transient narrative fields for status updates
- **Variance trend chart** — per-task sparkline history of schedule variance
- **Quality panel** — 16 DCMA completeness checks (schedule logic, constraints, resource allocation, etc.)

### Work Breakdown Structure
- **Nested hierarchy** — phases, groups, and tasks in tree order
- **Group rollups** — automatic sum of tasks, completion %, resource count
- **WBS codes** — persistent codes for scope traceability and export

### Printing & Export
- **A3 landscape print mode** — 55% preview scale with team info, baseline, title block
- **A4 report mode** — executive summaries and S-curve on letter-size paper
- **CSV round-trip** — import/export tasks with WBS codes, actual cost, and resource assignments
- **PDF export** — browser print-to-PDF for delivered printouts

### Accessibility & Mobile
- **WCAG 2.1 AA** — tested for contrast, keyboard nav, screen reader support
- **Dark mode** — follows system preference; no manual toggle
- **Mobile bottom sheet** — phone/tablet task detail panel with drag-to-dismiss physics
- **Keyboard-first UX** — navigate timeline, resize bars, edit fields via keyboard

---

## Getting Started

### Clone & Install
```bash
git clone <repo>
cd make-project-scheduling-tool
npm install
```

### Run Locally
```bash
npm run dev
```
Opens `http://localhost:5173` (app) and `http://localhost:5173/marketing.html` (landing page).

### Build for Production
```bash
npm run build
npm run preview
```
Output in `dist/`.

---

## Development

### Commands
```bash
npm run dev              # Dev server
npm run build            # TypeScript + Vite build
npm run lint             # ESLint (strict, zero warnings)
npm run type-check       # Full TypeScript check
npm run test:unit        # Vitest unit suite
npm run test:e2e         # Playwright end-to-end
```

### Code Structure
```
src/
  components/            # React presentational components
  hooks/                 # React side effects (scroll sync, keyboard, storage)
  lib/                   # Pure scheduling utilities (CPM, EVM, DCMA, etc.)
  styles/                # CSS tokens, globals, theme
  types/index.ts         # Data model — single source of truth
  constants.ts           # All magic numbers
  App.tsx                # App shell + state root
  marketing/             # Decoupled landing page

.claude/
  CLAUDE.md              # Design decisions & conventions
  AGENTS.md              # Operating manual for development
  START-HERE.md          # Read order for new agents
  plan-v1.7.md           # Active development plan
  version-status.md      # Release history and roadmap
```

### Key Design Decisions

The project follows ten load-bearing design decisions documented in `.claude/CLAUDE.md`. The most important:

1. **Custom Gantt, no chart libraries** — Absolutely positioned divs + SVG for dependency arrows. Allows precise control over critical path styling, baselines, milestone diamonds, weekend bands, today line.
2. **Pure-lib boundary** — `src/lib/*` modules are input→output only; no React, no localStorage. Enables testability and predictable perf.
3. **Auto-progress with manual overrides** — Tasks auto-calculate status from dates unless `manualStatus` or `manualPct` is set. Without manual flags, user edits would be silently reverted by the clock.
4. **Print as a first-class surface** — A3 Gantt + A4 reports designed as primary outputs, not afterthoughts. Construction PMs print daily.
5. **Design tokens, zero hardcoded hex** — All colors, spacing, fonts live in `src/styles/tokens.css`. Dark mode via `@media (prefers-color-scheme: dark)` overrides.

---

## Testing

### Unit Tests
```bash
npm run test:unit
```
Vitest suite for pure utilities, components, and hooks. Run per-file via `scripts/run-unit-tests.mjs` to avoid worker hangs.

### End-to-End Tests
```bash
npm run test:e2e
```
Playwright suite covering create/edit/delete, CSV import/export, baselines, resources, mobile workflows, accessibility (axe), and keyboard navigation.

### Coverage
- Critical path algorithm (Kahn + forward/backward pass)
- Earned value math (PV, EV, AC, SPI, CPI)
- DCMA 16-check quality validation
- Resource histogram and over-allocation detection
- Baseline capture and variance calculation

---

## Storage & Persistence

Tasks, baselines, resources, and settings persist to browser `localStorage` under key `schedule-tool-v1`. Storage schema is versioned; v4 (shipped in v1.7) adds WBS codes and actual-cost fields. Max 20 undo snapshots (LIFO). Only three actions push to the undo stack: delete task, CSV replace, CSV append.

---

## Deployment

See `docs/deploy.md` for target platform and CI/CD setup.

---

## Documentation

- **`.claude/CLAUDE.md`** — Design rationale and conventions
- **`.claude/AGENTS.md`** — Development workflow and command reference
- **`.claude/START-HERE.md`** — Read order for onboarding
- **`.claude/plan-v1.7.md`** — Active implementation plan
- **`.claude/version-status.md`** — Release history and roadmap
- **`docs/design-system.md`** — Token reference and component patterns
- **`docs/resources-csv-format.md`** — CSV schema for import/export
- **`docs/dcma-checks.md`** — Quality panel rules and definitions
- **`docs/deploy.md`** — Deployment and hosting

---

## Tech Stack

| Concern | Choice | Rationale |
|---------|--------|-----------|
| **Bundler** | Vite | Fast dev server, multi-page build (app + marketing) |
| **Language** | TypeScript strict | Zero `any`, no default exports, predictable refactor surface |
| **UI Framework** | React 18 | Hooks + component model for encapsulation |
| **State** | `useState` + `useCallback` + `useMemo` | No Redux/Zustand; simple, auditable state flow |
| **Styling** | CSS custom properties + tokens | Dark mode, future white-label support, zero hardcoded hex |
| **Gantt** | Custom HTML/CSS + SVG | Precise control over construction-specific behavior (baselines, critical path, lag) |
| **Charts** | Pure utilities (`scurve`, `evm`, `cashflow`) | Plotting via Canvas/SVG; no D3/Recharts dependencies |
| **Testing** | Vitest + Playwright | Fast unit suite, comprehensive E2E coverage |

---

## Browser Support

Modern browsers with:
- ES2020+ support
- CSS Grid + Flexbox
- CSS custom properties
- `localStorage` API
- SVG rendering

Tested on Chrome, Firefox, Safari, Edge. Mobile tested on iOS Safari and Chrome Android.

---

## Questions?

- **Development workflow:** See `.claude/AGENTS.md`
- **Design decisions:** See `.claude/CLAUDE.md`
- **Onboarding:** See `.claude/START-HERE.md`
- **Roadmap:** See `.claude/pm-roadmap.md`

---

**Last updated:** 2026-07-09  
**Maintained by:** Development team
