# v1.8 Phase 0.K — Baseline Perf Snapshot (From v1.7)

Date: 2026-05-27  
Branch: `v1.8`

## Baseline Source

v1.8 baseline is anchored to v1.7 post-implementation measurements and verification notes:

- `docs/perf-v1.7-baseline.md`
- `docs/perf-v1.6-quality-panel.md` (heavy-path benchmark reference)

## Baseline Snapshot Carried Forward

- Quality Panel heavy path reference: mean `72.1 ms` (target `<100 ms`).
- Task-list virtualization threshold remains `VIRTUALIZE_THRESHOLD = 100`.
- No known regressions in v1.7 post-implementation gate/runtime behavior.

## v1.8 Delta Policy

All v1.8 phases must preserve v1.7 baseline behavior and re-measure in Phase J before release. Any measurable regression against these baselines must be documented and resolved before Phase M ship.
