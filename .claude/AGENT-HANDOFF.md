# AGENT-HANDOFF

**The freshest "where do I pick up" pointer between agent sessions.**
Read this AFTER `START-HERE.md` and BEFORE the active plan.

---

## Last Touch

- **When:** 2026-05-22
- **Agent:** Codex
- **Did:** Completed v1.2 Phase G (G.1–G.4) TaskList refinement with full local gates.

---

## Current Focus

- **Active version:** v1.2 (visual refinement / de-vibecoded surface)
- **Plan:** [.claude/plan-v1.2.md](./plan-v1.2.md)
- **Phase in progress:** Ready for Phase G (TaskList refinement)
- **Phase in progress:** Ready for Phase H (SidePanel & ActualDates polish)

---

## What Just Landed

- **G.1** `src/components/task-list/TaskList.tsx`
  - WBS column normalized to 24px.
- **G.2** `src/components/task-list/TaskList.tsx`
  - Float values now use explicit sign formatting and tabular numeral alignment.
- **G.3** no file changes required
  - Verified party tint already used `color-mix` in existing implementation.
- **G.4** `src/components/task-list/TaskList.tsx`, `src/styles/app.css`
  - Non-selected row hover now uses `--surface-sunken` (replacing `--color-surface-2` behavior).
- Build Changelog updated in `plan-v1.2.md §23`.

All gates passed after each landed task:
- `npm run lint`
- `npm run type-check`
- `npm run test:unit`
- `npm run build`
- `npm run test:e2e`

---

## Next Action

1. Start **Phase H.1** in `plan-v1.2.md §16`: add rule-above section headers in SidePanel.
2. Continue H.2–H.4 (slider drag tooltip, date icon/variance polish, dependency chip tightening) with full gates per landing.
3. Keep appending `plan-v1.2.md §23` and refreshing this handoff at each stop.

---

## Blockers / Open Threads

- **Push still pending human approval:** CI-on-origin confirmation for `.github` tracking remains unverified until push approval.
- **Mobile real-device QA still owed:** tracked in `docs/mobile-qa.md`; required before Phase 11.8 ships.
