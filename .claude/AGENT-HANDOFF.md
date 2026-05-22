# AGENT-HANDOFF

**The freshest "where do I pick up" pointer between agent sessions.**
Read this AFTER `START-HERE.md` and BEFORE the active plan.

---

## Last Touch

- **When:** 2026-05-22
- **Agent:** Claude (planning lane)
- **Did:** Ran an interim PM audit on v1.1 + v1.2 and authored the v1.3 plan.
  - Wrote `.claude/pm-audit-v2.md` (interim, ad-hoc — score 4.5/10 holistic; +0.7 equal-weight composite vs v1; capability dimensions unchanged, visual/mobile/trust dimensions improved).
  - Wrote `.claude/plan-v1.3.md` (Resource Foundation — 13 phases 0 → M; target tag `v0.3.0`).
  - Updated `.claude/version-status.md` — v1.3 plan linked, v2 audit logged, v3 audit row pre-staged.

---

## Current Focus

- **Active version:** v1.3 (resource foundation)
- **Plan:** [`.claude/plan-v1.3.md`](./plan-v1.3.md) — ready for codex execution
- **Phase in progress:** Phase 0 (pre-flight housekeeping) — has not started yet

---

## What Just Landed (this session — Claude planning lane)

- **`.claude/pm-audit-v2.md`** (new) — Interim audit. No decision gate; the next real gate is Checkpoint 1 after v1.3 ships. Recommends three pre-flight items to close before v1.3 work begins (orphan worktree removal, mobile real-device QA, midnight ticker test) — all scoped into v1.3 Phase 0.
- **`.claude/plan-v1.3.md`** (new) — Resource Foundation plan. Five capability deliverables: resource pools, task assignments, synchronized resource histogram, manual leveling via existing drag-to-reschedule, cost loading + project total. Schema migration `1 → 2`. Three new pure libs (`resources.ts`, `cost.ts`, `resourceDemand.ts`). One new modal, one new SidePanel section, one new Gantt lane. CSV in/out as a paired `resources.csv` + `assignments.csv` (existing task CSV format unchanged).
- **`.claude/version-status.md`** — `v1.3` row now links to the plan; audit v2 added to PM Audit Index; v3 (Checkpoint 1) row pre-staged with its decision-gate threshold visible.

All v1.2 ship gates remained green during this planning session — no code changes:
- `npm run lint` ✅
- `npm run type-check` ✅
- `npm run test:unit` ✅ (149/149)
- `npm run build` ✅
- `npm run test:e2e` ✅ (9/9)

## In Progress (Not Landed Yet)

None. v1.3 implementation has not started — codex picks up from Phase 0.

---

## Next Action

1. **Codex lane:** start v1.3 from Phase 0 (pre-flight housekeeping) in `plan-v1.3.md §10`. The five Phase 0 tasks are:
   - 0.1 Remove orphan worktree `.worktrees/phases-3-6`; drop `.worktrees/**` ignore from `eslint.config.js`
   - 0.2 Real-device mobile QA on the bottom sheet → record in `docs/mobile-qa.md` (this closes audit v2 §10.2 carry-over and HK-3 from v1.2 carry-over)
   - 0.3 Add `useMidnightTicker` unit test
   - 0.4 Verify GitHub Actions on origin (HK-2 confirmation)
   - 0.5 Document `Task.deps[]` as derived-read-only in the type JSDoc + a one-line note in `CLAUDE.md §Conventions`
2. **Codex lane:** after Phase 0 lands, proceed to Phase A (data model + schema migration). Phase A's commit MUST land after Phase 0 to keep the migration baseline clean — see plan §11.
3. **Codex lane (per landing):** append to `plan-v1.3.md §17 Build Changelog` and update this handoff file's "Last Touch" + "What Just Landed" sections.
4. **Claude lane (after v1.3 fully ships and `v0.3.0` is tagged):** run Checkpoint 1 audit → save as `.claude/pm-audit-v3.md`. Decision gate: if score < 5.5/10, pause v1.4 planning and address the gaps; if ≥ 5.5/10, author `.claude/plan-v1.4.md` (Schedule Quality Engine).

---

## Blockers / Open Threads

- **None blocking Phase 0 start.** All v1.2 ship gates green; v1.2 housekeeping carry-over (HK-1 orphan worktree, HK-2 CI verification, HK-3 mobile QA, HK-4 ticker test) is now formally scoped into v1.3 Phase 0.
- **Push of `.github/` tracking still pending human approval** — affects HK-2 confirmation (Phase 0.4). If push is rejected before Phase 0 begins, codex should pause and ping the human rather than guessing on CI behavior.
- **No content drift between code and CLAUDE.md / START-HERE / pm-roadmap** as of this handoff. Next mandatory CLAUDE.md edit is Phase 0.5 (`Task.deps[]` deprecation note) — small, scoped.

---

## Read Order Reminder (no change since v1.2 ship)

1. `START-HERE.md` — orientation
2. `AGENT-HANDOFF.md` — **this file**
3. `version-status.md` — what's active / shipped / pending
4. `CLAUDE.md` — project conventions + Key Design Decisions
5. `AGENTS.md` — operating manual
6. `plan-v1.3.md` — the active plan (just landed this session)
7. `pm-audit-v2.md` — the interim audit (just landed this session) — read if context on the v1.1/v1.2 evaluation is needed; otherwise skip until Checkpoint 1
8. `pm-roadmap.md` — long-term roadmap (consult before any "but what about v1.4…" question)
