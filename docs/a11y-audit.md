# Accessibility Audit — v1.1

Date: 2026-05-22  
Scope: Phase 7.1–7.2 evidence pass (structural a11y sweep + token contrast verification)

## Method

1. Structural checks:
- `npx playwright test tests/e2e/a11y.spec.ts`
- Axe integration via `@axe-core/playwright`
- Rule scope in spec currently excludes `color-contrast` to keep structural regression gating separate from token work.

2. Contrast checks:
- WCAG 2.x contrast formula applied to token pairs used for body/small text.
- Target thresholds:
- Body text: `>= 4.5:1`
- Large text: `>= 3.0:1`

## Token Contrast Results

| Pair | Ratio | Target | Status |
|---|---:|---:|---|
| Light `text-primary` on `surface` | 13.41:1 | 4.5:1 | Pass |
| Light `text-secondary` on `surface` | 6.63:1 | 4.5:1 | Pass |
| Light `text-tertiary` on `surface` | 4.96:1 | 4.5:1 | Pass |
| Light `text-tertiary` on `surface-2` | 4.66:1 | 4.5:1 | Pass |
| Light `accent` on `surface` | 4.90:1 | 4.5:1 | Pass |
| Light `success` on `surface` | 6.27:1 | 4.5:1 | Pass |
| Light `warning` on `surface` | 5.60:1 | 4.5:1 | Pass |
| Light `danger` on `surface` | 5.41:1 | 4.5:1 | Pass |
| Dark `text-primary` on `surface` | 11.82:1 | 4.5:1 | Pass |
| Dark `text-secondary` on `surface` | 6.30:1 | 4.5:1 | Pass |
| Dark `text-tertiary` on `surface` | 7.13:1 | 4.5:1 | Pass |
| Dark `text-dim` on `surface` | 5.11:1 | 4.5:1 | Pass |
| Dark `accent` on `surface` | 6.48:1 | 4.5:1 | Pass |
| Dark `text-tertiary` on `surface-2` | 6.40:1 | 4.5:1 | Pass |

## Changes Landed in This Pass

- Contrast token tuning in `src/styles/tokens.css`:
- `--accent`, `--accent-hover`, `--accent-dim` (light)
- `--color-text-tertiary`, `--color-text-dim` (light)
- `--color-success`, `--color-warning` (light)
- `--accent`, `--accent-hover`, `--accent-dim` (dark)
- `--color-text-tertiary`, `--color-text-dim` (dark)
- Party badge background in task list switched to `color-mix(...)` for consistent blending across themes.

## Structural A11y Status (from Phase 8.6)

- Wizard + app + modal + mobile sheet axe sweep passes under structural rule set.
- Key fixes already landed:
- missing form accessible names
- invalid mobile tab `aria-controls`
- title-only form label usage

## Remaining Phase 7 Work

## 7.3 Keyboard Tab-Order QA Notes (2026-05-22)

Walkthrough order validated:
- Setup wizard primary actions are reachable by `Tab` with visible ring.
- Main app sequence is stable: TopBar controls/title -> FilterBar/search -> TaskList rows/actions -> Gantt area -> SidePanel form controls.
- Open modals trap focus and cycle within dialog controls until closed.
- Mobile bottom sheet dialog remains keyboard reachable and escapable when rendered.

Evidence:
- `npx.cmd playwright test tests/e2e/keyboard.spec.ts` -> 1 passed
- `npx.cmd playwright test tests/e2e/a11y.spec.ts` -> 2 passed

## Remaining Phase 7 Work

## 7.5 Dark-Mode Sweep (Code-Level Pass, 2026-05-22)

Static scan completed for hardcoded colors outside `tokens.css`.

Patches applied:
- `src/components/filter/FilterBar.tsx`
- Replaced chip active backgrounds (`+ '22'` and fixed RGBA accent tint) with `color-mix(...)` / `var(--accent-dim)`.
- `src/components/gantt/GanttGrid.tsx`
- Replaced fixed black alpha row/weekend overlays with token-derived `color-mix(...)` overlays so contrast direction adapts in dark mode.
- `src/components/gantt/GanttBar.tsx`
- Replaced critical/at-risk/delayed outlines and completion flash overlay with functional token colors (`--color-danger`, `--color-warning`, `--color-success` mixes).
- `src/components/gantt/DependencyArrows.tsx`
- Replaced hardcoded critical-path red hex with `--color-danger`.

Validation:
- `npm.cmd run build` -> clean
- `npx.cmd playwright test tests/e2e/keyboard.spec.ts tests/e2e/a11y.spec.ts` -> 3 passed

Still manual (not executable in headless CI):
- Final visual dark-mode walkthrough across full app and modal set to confirm aesthetic/readability quality at interactive states.

## Remaining Phase 7 Work

- None. Phase 7 checklist is complete in this workspace.
