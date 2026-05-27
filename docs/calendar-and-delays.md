# Calendar and Delays (v1.8)

## Scope (Phase A)

v1.8 introduces two additive persisted arrays:

- `projectCalendar: CalendarEvent[]`
- `delays: Delay[]`

This phase adds typed models and pure-library scaffolding only. UI wiring and migration integration land in later phases.

## Calendar Model

`CalendarEvent` captures project-level schedule context:

- date span (`start`, `end`)
- type (`holiday`, `owner_shutdown`, `union_action`, `weather_window`, `other`)
- classification (`non_work`, `reduced_capacity`, `advisory_only`)
- name and notes

`src/lib/projectCalendar.ts` provides pure helpers for date-span checks, event expansion, and non-work-day queries.

## Delay Model

`Delay` captures claim/audit-grade schedule events:

- date span and recorded timestamp
- cause type and excusable classification
- affected task IDs
- computed day impact + stamped critical-path impact
- responsible party, narrative, and reconciliation state (`pending`, `accepted`, `rejected`)

`src/lib/delays.ts` provides default excusability mapping, normalization, and validation.

## Delay Impact

`src/lib/delayImpact.ts` computes a bounded first-pass impact result:

- downstream affected task IDs from dependency traversal
- `criticalPathImpactDays` based on overlap with current CPM critical set

This is intentionally deterministic and pure; no persistence or React state concerns are embedded.
