# DCMA Checks (v1.4 Phase A)

Date: 2026-05-22
Status: Local-only implementation reference

## Implemented checks

1. Logic: percent of tasks with predecessor and successor >= 95.
2. Leads: negative lag count must be 0.
3. Lags: percent of dependencies with lag > 0 <= 5%.
4. Relationship Types: percent FS dependencies >= 90%.
5. Hard Constraints: neutral placeholder in v1.4 (no constraint model fields).
6. High Float: percent of tasks with total float > 44 < 5%.
7. Negative Float: count of tasks with total float < 0 must be 0.
8. High Duration: percent of non-milestone tasks longer than 44 days < 5%.
9. Invalid Dates: future actuals and actualFinish < actualStart invalid.
10. Resources: percent of non-milestone tasks with >=1 assignment >= 95%.
11. Missed Tasks: percent of tasks past planned finish and incomplete < 5%.
12. Critical Path Test: shift one critical task by 600 days and expect 100% propagation.
13. CPLI: (remaining + critical float) / remaining >= 0.95.
14. BEI: completed on-or-before baseline / planned complete by status date >= 0.95.

## Notes

- Check 5 remains intentionally neutral until a hard-constraint model exists.
- Check 14 (BEI) in v1.4 currently computes against the most-recent captured baseline and returns N/A when no baseline exists.
- v1.5 Phase G will rebind BEI to `activeBaselineId` so the quality engine compares against the user-selected active baseline instead of implicit most-recent baseline selection.
- Unit coverage is in `tests/unit/lib/dcma.test.ts`.

## v1.6 Quality Panel Presentation Update

- `DcmaFindingsTable` now defaults to **failing checks only** to prioritize actionable issues on open.
- A toggle allows switching to **Show all 14 checks** for full audit review.
- When all checks pass, the panel shows an explicit all-clear state instead of an empty table.
