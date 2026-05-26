# v1.7 Phase 0.1 — TopBar Density Close-Out (1280px)

Date: 2026-05-26  
Branch: `v1.7`

## Scope

- Close v1.6 carry-over `S7` debt (TopBar crowding at 1280px).
- Demote `Phases`, `Parties`, `Resources`, and `Change Orders` behind a `More` overflow menu.
- Keep `Baselines`, `Quality`, and `Reports` in-line as primary controls.

## Method

- Built app with `npm.cmd run build`.
- Ran preview on `http://localhost:5174`.
- Loaded the scheduling app state via Setup Wizard `Load example data`.
- Captured measurements at viewport `1280x900` using Playwright and DOM bounding boxes.

## Measurement

- TopBar width: `1457.52 px`
- TopBar actions cluster width: `1037.39 px`
- Density (actions cluster / full topbar width): **`71.18%`**

## Verdict

- v1.7 target (`<=75%`) is met on the measured basis above.
- Overflow restructure closes the v1.6 TopBar density debt for 1280px.

## Artifacts

- Screenshot: `docs/v1.7-screenshots-topbar-1280.png`

## Notes

- Overflow menu closes on outside pointer click and on `Escape`, restoring focus to the trigger button.
- `data-testid` hooks were added to TopBar for repeatable density measurement (`topbar`, `topbar-actions`).
