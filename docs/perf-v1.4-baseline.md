# v1.4 Perf Baseline (v1.5 Phase 0.2)

Date: 2026-05-23  
Branch: v1.5  
Method:
- Pure-library timing harness on `scripts/500-tasks.json` with 25 resources and 1500 assignments (30 samples).
- Playwright preview-run timing on `http://127.0.0.1:5174` for Quality Panel open and drag-frame timing with histogram open.

## Scenario

- Tasks: 500
- Resources: 25
- Assignments: 1500 (~3/task)
- Dependencies: linear chain up to 220 links for DCMA context

## Measurements vs v1.4 §8 Targets

### A) DCMA full assessment

- Mean: 1.83 ms
- Target: < 30 ms
- Verdict: PASS

### B) Health composition

- Mean: 0.03 ms
- Target: < 5 ms
- Verdict: PASS

### C) Quality Panel first render (cold)

- Measured: 121.0 ms (best measured in this run set)
- Target: < 100 ms
- Verdict: FAIL (+21.0%)

### D) Drag-frame time with histogram open

- Max frame delta: 16.8 ms
- Avg frame delta: 16.3 ms
- Target: no frame drops > 33 ms
- Verdict: PASS

## Summary

- 3/4 metrics pass target.
- Quality Panel cold first render exceeds target by ~21 ms.
- **Approved exception:** proceed with v1.5 execution and defer this optimization for later follow-up.

## Artifacts

- `test-results/qa/phase0-v1.4-lib-perf.json`
- `test-results/qa/phase0-v1.4-ui-perf.json`
