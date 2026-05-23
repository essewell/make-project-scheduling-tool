# v1.3 Perf Baseline (Phase 0.2)

Date: 2026-05-22
Branch: v1.4
Method: direct source-library measurement harness (`test-results/qa/phase0-lib-perf.json`) over 30 runs using `scripts/500-tasks.json` with generated 25 resources and 1500 assignments.

## Scenario

- Tasks: 500
- Resources: 25
- Assignments: 1500 (~3/task)
- Workweek: Mon-Fri
- Demand check resource: representative mid-list resource (`resources[12]`)

## Measurements

### A) Project cost recompute

- Mean: 36.18 ms
- Max: 52.46 ms
- Min: 29.09 ms
- Target (plan-v1.3 §9): < 5 ms
- Verdict: FAIL

### B) Resource demand recompute (selected resource)

- Mean: 12.07 ms
- Max: 21.57 ms
- Min: 8.98 ms
- Target (plan-v1.3 §9): < 10 ms
- Verdict: FAIL (slight)

### C) Drag-to-reschedule frame time

- Prior run max frame delta: 16.80 ms
- Prior run avg frame delta: 16.25 ms
- Target (plan-v1.3 §9): no frame drops > 33 ms
- Verdict: PASS

## Summary

- 1/3 targets fully pass.
- Demand is close to target but still above.
- Cost recompute remains materially above target and requires follow-up optimization if strict v1.3 target adherence is required.

## Artifacts

- Perf metrics: `test-results/qa/phase0-lib-perf.json`
- Legacy browser harness output: `test-results/qa/phase0-metrics.json`
