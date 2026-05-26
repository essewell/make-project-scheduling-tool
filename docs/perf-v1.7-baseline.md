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
