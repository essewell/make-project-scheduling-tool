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
- Check 14 returns an N/A note when no baseline exists.
- Unit coverage is in `tests/unit/lib/dcma.test.ts`.
