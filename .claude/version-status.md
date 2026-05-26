# Version Status — MAKE Scheduling Tool

**Last updated:** 2026-05-25 (v1.6 implementation complete on branch `v1.6`; awaiting PR merge/tag)
**Maintainer:** Any agent that ships a version. Update this file when a version ships.

---

## How to Update This File

> **Codex updates this file only when a full version ships** (not for individual phases — those go in the active plan's Build Changelog). Claude updates this file when a new plan or audit is written.

When a version ships (code merged, tested, verified):
1. Change its status from `⏳ active` or `📋 planning` to `✅ shipped`
2. Add the ship date
3. Move the next version from `⏳ next` to `⏳ active`
4. If the next version has a plan file, link it. If not, note that planning is needed (this is the **stop-and-ping** point for codex — return to the human, do not auto-write the next plan).
5. If a PM audit checkpoint was triggered, link to the audit file.
6. **Always update `.claude/AGENT-HANDOFF.md` after editing this file** so the next agent sees the new active version immediately.

---

## Version Tracker

| Version | Theme | Status | Plan File | Audit File | Ship Date |
|---------|-------|--------|-----------|------------|-----------|
| **v0** | Initial implementation | ✅ shipped | — | — | 2025 (pre-tracking) |
| **v1.0** | Track C UX refinement | ✅ shipped | — | — | 2026-05-21 |
| **v1.1** | Production readiness | ✅ shipped | [plan-v1.1.md](./plan-v1.1.md) | — | 2026-05-22 |
| **v1.2** | Visual refinement | ✅ shipped | [plan-v1.2.md](./plan-v1.2.md) | — | 2026-05-22 |
| **v1.3** | Resource foundation | ✅ shipped | [plan-v1.3.md](./plan-v1.3.md) | [pm-audit-v3.md](./pm-audit-v3.md) | 2026-05-23 |
| | *⚖ PM Audit Checkpoint 1* | ✅ conditional pass (5.5/10 holistic) | — | [pm-audit-v3.md](./pm-audit-v3.md) | 2026-05-23 |
| **v1.4** | Schedule quality | ✅ shipped | [plan-v1.4.md](./plan-v1.4.md) | — | 2026-05-25 |
| **v1.5** | Multi-baseline & change | ✅ shipped | [plan-v1.5.md](./plan-v1.5.md) | [pm-audit-v4.md](./pm-audit-v4.md) | 2026-05-25 |
| | *⚖ PM Audit Checkpoint 2* | ✅ pass with one condition (6.7/10 holistic) | — | [pm-audit-v4.md](./pm-audit-v4.md) | 2026-05-25 |
| **v1.6** | Reporting & analytics | ⏳ active | [plan-v1.6.md](./plan-v1.6.md) | — | — |
| **v1.7** | WBS deepening | ⬜ pending | — | — | — |
| **v1.8** | Calendar & delays | ⬜ pending | — | — | — |
| | *⚖ PM Audit Checkpoint 3* | ⬜ pending | — | — | — |
| **v1.9** | Data integration | ⬜ pending | — | — | — |
| **v2.0** | Collaboration | ⬜ pending | — | — | — |
| | *⚖ PM Audit Checkpoint 4* | ⬜ pending | — | — | — |
| **v2.1** | Portfolio view | ⬜ pending | — | — | — |
| **v2.2** | 10/10 polish | ⬜ pending | — | — | — |
| | *⚖ PM Audit Checkpoint 5 (Final)* | ⬜ pending | — | — | — |

### Status Legend
- `✅ shipped` — Code merged, tested, verified
- `⏳ active` — Currently being built
- `📋 planning` — Plan written, not started
- `⬜ pending` — Defined in roadmap, no plan yet

---

## Current Focus

**Active work:** v1.6 implementation complete on branch `v1.6` (commit `e2517cb`), with lint/type-check/build/e2e gates passing; pending human PR merge and `v0.6.0` tag.
**Just shipped:** v1.5 (multi-baseline & change management) on 2026-05-25 (`v0.5.0`)
**Latest audit:** [pm-audit-v4.md](./pm-audit-v4.md) — 2026-05-25, Checkpoint 2, **6.7/10 holistic (6.3 equal-weight)** — pass with one condition (Quality Panel cold-open perf must close in v1.6 Phase 0). Checkpoint 3 (post-v1.8) is the next gate.
**Roadmap:** [pm-roadmap.md](./pm-roadmap.md)

---

## Build Changelog Index

Each plan file has a build changelog section at the bottom. This table links to them for quick reference.

| Version | Changelog Location |
|---------|-------------------|
| v1.1 | [plan-v1.1.md §13 — Build Changelog](./plan-v1.1.md) |
| v1.2 | [plan-v1.2.md §23 — Build Changelog](./plan-v1.2.md) |
| v1.3 | [plan-v1.3.md §17 — Build Changelog](./plan-v1.3.md) |
| v1.4 | [plan-v1.4.md §17 — Build Changelog](./plan-v1.4.md) |
| v1.5 | [plan-v1.5.md §17 — Build Changelog](./plan-v1.5.md) |
| v1.6 | [plan-v1.6.md §17 — Build Changelog](./plan-v1.6.md) |

---

## PM Audit Index

| Audit | File | Date | Score | Notes |
|-------|------|------|-------|-------|
| v1 — Initial evaluation | [pm-audit-v1.md](./pm-audit-v1.md) | 2026-05-21 | 3.6/10 | Baseline; no decision gate |
| v2 — Interim (post-v1.2) | [pm-audit-v2.md](./pm-audit-v2.md) | 2026-05-22 | 4.5/10 | Ad-hoc — sits between v1 baseline and roadmap Checkpoint 1; no decision gate |
| v3 — Checkpoint 1 (post-v1.3) | [pm-audit-v3.md](./pm-audit-v3.md) | 2026-05-23 | **5.5/10** (5.3 equal-weight) | Conditional pass — proceed to v1.4 with three Phase 0 close-outs (mobile QA, perf re-measurement, StatBar density audit) |
| v4 — Checkpoint 2 (post-v1.5) | [pm-audit-v4.md](./pm-audit-v4.md) | 2026-05-25 | **6.7/10** (6.3 equal-weight) | Pass with one condition — proceed to v1.6 with Quality Panel cold-open perf debt closed in v1.6 Phase 0 |

---

## Agent Instructions

Full read order and workflow live in `.claude/START-HERE.md`. This file is just the version tracker — read START-HERE first.
