# v1.6 Phase 0.3 — TopBar/StatBar Density Audit (1280px)

Date: 2026-05-25  
Branch: `v1.6`

## Scope

- Re-audit top navigation density at 1280px before adding a v1.6 Reports button.
- Validate against plan stop rule `S7` (halt if TopBar density exceeds 85%).

## Method

- Built app (`npm.cmd run build`) and served production preview on port 5174.
- Loaded example data to force full topbar/statbar control sets.
- Browser context viewport set to `1280x900`.
- Measured TopBar content footprint from rendered control-group widths against available topbar width.

## Measurement

- Viewport width: `1280 px` (`window.innerWidth` confirmed).
- TopBar measured used width: `1529.7 px`.
- TopBar density: `90.84%` (per measured topbar width basis used in prior audits); content also overflows the 1280px viewport width.

## Verdict

- `S7` TRIGGERED: TopBar density exceeds the 85% ceiling before adding Reports.
- Do not add a Reports button in current topbar layout until overflow/compaction strategy is decided (overflow menu or topbar restructuring).

## Notes

- StatBar is also visually saturated in the same 1280px scenario.
- This is a stop-and-ping point by plan contract and requires human direction before continuing Phase A capability work.
