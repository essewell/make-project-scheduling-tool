# WORKFLOW.md — Human Cheatsheet

> One-page reference for the human (you). Agent-facing docs live in `START-HERE.md` and the files it points to. This file is just a quick reminder of how to drive the cycle from the human side.

---

## The Two-Agent Split

| Agent | What they do | What they update |
|-------|-------------|------------------|
| **Codex (hands)** | Implements code per the active plan. | `AGENT-HANDOFF.md` + active plan's Build Changelog. Sometimes `version-status.md`. |
| **Claude (brain)** | Writes plans, writes audits, restructures docs, higher-order reasoning. | New `plan-v*.md` or `pm-audit-v*.md` files. Structural docs (`START-HERE.md`, `CLAUDE.md`, `AGENTS.md`, `version-status.md`). |

When in doubt, default to codex for code work and Claude for planning/audit/doc-architecture work.

---

## Non-Negotiable Implementation Procedure

For active-version execution (currently v1.6):
- Work phase-by-phase in plan order.
- At each phase boundary: update `AGENT-HANDOFF.md`, append the active plan Build Changelog entry, and commit that phase slice.
- Do not batch multiple phases into one commit unless the active plan explicitly authorizes bundling.
- If a stop trigger or gate failure occurs, stop and ping the human before continuing.

---

## What You Say to Each Agent

| Goal | Say to which agent | What to say |
|------|------------------|------------|
| Implement the next task | Codex | "Continue the active plan per `AGENT-HANDOFF.md`." |
| Ship the current version | Codex (or Claude if depth needed) | "Verify acceptance criteria for the active plan and update `version-status.md` if all green." |
| Write a new plan | Claude | "Write the plan for v[N] per `pm-roadmap.md`." |
| Run a PM audit | Claude | "Run PM Audit Checkpoint [N] using `pm-audit-template.md`." |
| Audit doc continuity | Claude | "Audit the .md files for drift, duplication, or staleness." |
| Understand the project | Either | "Read `START-HERE.md` and summarize." |

---

## Decision Gates (PM Audit Checkpoints)

| Checkpoint | After version | Must score ≥ | If fails |
|------------|--------------|-------------|----------|
| 1 | v1.3 | 5.5/10 | Fix gaps before v1.4 |
| 2 | v1.5 | 6.5/10 | Fix gaps before v1.6 |
| 3 | v1.8 | 8.0/10 | Fix gaps before v1.9 |
| 4 | v2.0 | 9.0/10 | Fix gaps before v2.1 |
| 5 (Final) | v2.2 | 9.5/10 | Document gaps as v3.0 candidates |

Full roadmap and audit scope: `pm-roadmap.md`.

---

**Last updated:** 2026-05-25
