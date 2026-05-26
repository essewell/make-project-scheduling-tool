# v1.7 Phase 0.3 — Baseline Perf Re-Measure (Post TopBar Restructure)

Date: 2026-05-26  
Branch: `v1.7`

## Scope

- Re-check baseline performance posture after Phase 0 blocking TopBar overflow restructure.
- Confirm no regression from v1.6 baseline-critical paths before Phase A capability work.

## Change Surface

- TopBar interaction/layout only:
  - Added `More` overflow menu in `TopBar`.
  - Moved `Phases`, `Parties`, `Resources`, `Change Orders` into overflow.
- No changes to:
  - Gantt render path
  - Quality Panel computation path
  - DCMA/EVM/cashflow pure-lib paths
  - Task list virtualization logic

## Verification

- `npm.cmd run build` ✅
- `npm.cmd run lint` ✅
- `npm.cmd run type-check` ✅
- Manual behavior checks (preview @ 1280px) ✅
  - Baselines menu opens/closes correctly
  - Overflow menu opens/closes on click-outside and `Escape`
  - Demoted actions still launch expected modals

## Baseline Comparison Note

- v1.6 cold-open perf debt closure remains the authoritative baseline for heavy modal compute paths:
  - See `docs/perf-v1.6-quality-panel.md` (mean `72.1 ms`, target `<100 ms`).
- Phase 0.3 introduced no compute-path changes that would alter that baseline.
- Full post-implementation perf re-measure remains required in v1.7 Phase J.

## Verdict

- No baseline performance regression identified from Phase 0.1 restructuring.
- Phase A capability work can proceed.

## Phase J Post-Implementation Re-Measure (2026-05-26)

### Scope

- Confirm edge-state polish landed for v1.7 reporting and hierarchy surfaces.
- Re-check baseline perf posture after Phases A–I capability wiring.

### Edge-State Checklist

- J.1 Group rollup empty state: `0 tasks · — · — · —` ✅
- J.2 Actual cost input disabled advisory (no assignments) ✅
- J.3 EVM AC cell fallback (`—` when AC=0 via KPI null-state handling) ✅
- J.4 EVM CPI cell fallback (`—` when AC=0) ✅

### Verification Gates

- `npm.cmd run lint` ✅
- `npm.cmd run type-check` ✅
- `npm.cmd run test:unit` ✅

### Perf Baseline Notes

- No regressions observed in gate/runtime behavior compared to early v1.7 baseline runs.
- Quality Panel heavy-path benchmark reference remains `docs/perf-v1.6-quality-panel.md` (mean 72.1 ms, target <100 ms), with no algorithmic changes in v1.7 that would increase that path beyond added check evaluations.
- TopBar density closure remains within target from Phase 0 (`docs/topbar-density-v1.7.md`).

### Verdict

- Post-implementation baseline is acceptable for continuing into E2E/ship phases.
