# v1.2 Reduced-Motion Audit (Phase N.4)

Date: 2026-05-22  
Scope: Verify v1.2 motion additions (N.1-N.3) collapse under `prefers-reduced-motion: reduce`.

## Surfaces Audited

- `src/components/task-list/StatusBadge.tsx` (N.1 status transitions)
- `src/components/gantt/GanttBar.tsx` (N.2 critical-path shake + cross-fade)
- `src/components/filter/FilterBar.tsx` (N.3 chip entry scale)
- `src/styles/app.css` reduced-motion overrides

## Implementation Checks

- Global reduced-motion block exists in `app.css`:
  - `animation-duration: 0ms !important`
  - `animation-delay: 0ms !important`
  - `transition-duration: 0ms !important`
  - `scroll-behavior: auto !important`
- Explicit animation nulling present for:
  - `.wizard-rise`
  - `.filter-chip--active`

## Behavior Verified

1. Status badge state changes do not animate under reduced-motion.
2. Critical-path bar shake animation collapses to effectively no motion.
3. Critical-path cross-fade transitions collapse to 0ms under reduced-motion.
4. Filter chip entry animation collapses to no perceptible motion.

## Regression Gate

Full local gate passed after verification:

- `npm run lint`
- `npm run type-check`
- `npm run test:unit` (149/149)
- `npm run build`
- `npm run test:e2e` (9/9)

## Result

Phase N.4 accepted. Phase N motion work is complete.
