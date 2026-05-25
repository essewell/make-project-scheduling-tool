# MAKE Scheduling Tool

A Gantt-style scheduling tool for construction PM workflows, built with Vite + React + TypeScript.

## Features

- Task list + Gantt timeline with dependency links (`FS`, `SS`, `FF`, `SF`)
- Resource pools + per-task assignments with category, unit, capacity, and cost rate
- Resource histogram with over-allocation highlighting and manual leveling via drag-reschedule
- Project/task cost rollups with optional TaskList cost column and print-summary cost export
- Multi-baseline capture with ghost overlays, variance tracking, and named baseline comparison (side-by-side diff modal)
- Variance trend chart: per-task finish-variance sparkline history
- Change orders manager: modal + sidepanel section for tracking scope changes
- CSV import/export with append/replace flows and undo support
- Mobile bottom-sheet task details workflow
- Accessibility-focused keyboard and dialog behavior
- Local-first persistence via browser `localStorage` (`schedule-tool-v1`)
- Marketing landing page at `/marketing.html`

## Tech Stack

- React 18
- TypeScript (strict)
- Vite (multi-page build: app + marketing)
- Vitest (unit)
- Playwright (E2E)

## Development

```bash
npm run dev
npm run lint
npm run type-check
npm run test:unit
npm run test:e2e
npm run build
npm run preview
```

## App Structure

- `src/components/App.tsx` owns app state
- `src/lib/*` contains pure scheduling utilities
- `src/hooks/*` encapsulates side effects
- `src/marketing/*` contains the decoupled landing page entry

## Deployment

See [docs/deploy.md](./docs/deploy.md) for target platform and deployment details.
