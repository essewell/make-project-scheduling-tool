# Reports (v1.6)

This document defines the five report surfaces introduced by the v1.6 reporting foundation.

## 1. S-curve

- Shows planned cumulative progress vs actual cumulative progress over the project window.
- Uses week/month bucketing depending on report context.
- Output source: `src/lib/scurve.ts`.

## 2. EVM (PV/EV/SPI)

- Computes planned value (PV), earned value (EV), and schedule performance index (SPI).
- AC/CPI remain deferred in base v1.6 scope.
- Output source: `src/lib/evm.ts`.

## 3. Cash flow forecast

- Produces monthly planned spend buckets split by `labor`, `equipment`, and `material`.
- Uses linear per-workday distribution across task spans.
- Output source: `src/lib/cashflow.ts`.

## 4. Executive summary report

- Aggregates owner-facing summary data:
  - health score
  - SPI
  - top 3 variances
  - top 3 risks
  - next 5 milestones
- Output source: `src/lib/reportData.ts`.

## 5. Weekly progress report

- Aggregates week-window operational data:
  - completed tasks in the past week
  - planned tasks in the coming week
  - variance candidates
  - recent change orders
- Output source: `src/lib/weeklyReport.ts`.
