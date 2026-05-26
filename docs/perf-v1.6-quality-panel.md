# v1.6 Phase 0.1 — Quality Panel Cold-Open Perf Close-out

Date: 2026-05-25  
Branch: `v1.6`

## Target

- Metric: Quality Panel first render (cold)
- Source target: `plan-v1.4.md §8`
- Required threshold: `< 100 ms`

## Baseline (carried from v1.5 Phase 0.2)

From [`docs/perf-v1.4-baseline.md`](./perf-v1.4-baseline.md):
- Measured cold-open: `121.0 ms`
- Result: `FAIL` (+21.0%)

## Slow path and fix

Observed hot path on cold-open:
- Right-column charts (float distribution + variance trend) mounted synchronously with the modal shell/table.
- Variance trend filtered/sorted snapshots on each open path.

Fix applied:
1. `QualityPanel` now defers heavy right-column chart mount by one animation frame after open.
2. `App.tsx` pre-groups and sorts variance snapshots by baseline in memoized state.
3. `QualityPanel` receives pre-filtered active-baseline snapshots, and `VarianceTrendChart` consumes preprocessed snapshots directly (no baseline filter/sort in component render path).

Files:
- `src/components/modals/QualityPanel.tsx`
- `src/components/App.tsx`
- `src/components/variance/VarianceTrendChart.tsx`

## Measurement method

- Production build (`npm.cmd run build`) before measurement.
- Chromium headless against `npm run preview -- --port 5174`.
- Browser-side `performance.now()` measurement from Health button click to:
  - Quality panel dialog visible, and
  - Float distribution histogram visible.
- 8 cold-open samples on fresh page loads.

## Results

Samples (ms):
- `52.0`
- `100.8`
- `84.3`
- `79.6`
- `56.8`
- `74.7`
- `71.3`
- `57.2`

Aggregates:
- Mean: `72.1 ms`
- Min: `52.0 ms`
- Max: `100.8 ms`

## Verdict

- Mean cold-open is now below target (`72.1 ms < 100 ms`).
- One outlier slightly exceeded threshold (`100.8 ms`), but the carried debt condition from v1.5 is materially closed versus the 121 ms baseline and the cold-open path is no longer consistently above target.

## Regression guard

- Keep deferred-heavy-panel mount behavior in `QualityPanel`.
- Keep active-baseline snapshot preprocessing at App memo level.
- Re-check this metric after Reports modal and chart surfaces land (Phase K perf pass).
