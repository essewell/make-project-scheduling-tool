# AGENT-HANDOFF

**The freshest "where do I pick up" pointer between agent sessions.**
Read this AFTER `START-HERE.md` and BEFORE the active plan.

---

## Last Touch

- **When:** 2026-05-22
- **Agent:** Codex
- **Did:** Completed v1.2 Phase F (F.1–F.8) Gantt diagrammatic polish with full local gates per landed task.

---

## Current Focus

- **Active version:** v1.2 (visual refinement / de-vibecoded surface)
- **Plan:** [.claude/plan-v1.2.md](./plan-v1.2.md)
- **Phase in progress:** Ready for Phase G (TaskList refinement)

---

## What Just Landed

- **F.1** `src/components/gantt/GanttBar.tsx`
  - Critical-path bars now use a 3px left rail; non-critical bars dimmed to 60%.
- **F.2** `src/components/gantt/GanttGrid.tsx`
  - Today pill now shows `TODAY · <DAY DATE>`.
- **F.3** `src/components/gantt/GanttHeader.tsx`
  - Clearer primary/secondary tier contrast and ink hierarchy.
- **F.4** `src/components/gantt/BaselineGhostBars.tsx`
  - Ghost stripe angle updated to 30° with subtle outline.
- **F.5** `src/components/gantt/DependencyArrows.tsx`
  - Arrow stroke tuning (1px default / 1.5px critical) and `--data-negative` for critical.
- **F.6** `src/components/gantt/GanttBar.tsx`
  - Milestone fill/outline semantics now respond to task completion/risk state.
- **F.7–F.8** `src/components/gantt/Gantt.tsx`
  - Ghost-style toggle converted to icon segmented control; zoom pill now uses icon buttons + explicit mode label.
- Build Changelog updated in `plan-v1.2.md §23`.

All gates passed after each landed task:
- `npm run lint`
- `npm run type-check`
- `npm run test:unit`
- `npm run build`
- `npm run test:e2e`

---

## Next Action

1. Start **Phase G.1** in `plan-v1.2.md §16`: normalize WBS column to 24px.
2. Continue G.2–G.4 (float sign/tabular, party tint `color-mix`, hover `--surface-sunken`) with full gates per landing.
3. Keep appending `plan-v1.2.md §23` and refreshing this handoff at each stop.

---

## Blockers / Open Threads

- **Push still pending human approval:** CI-on-origin confirmation for `.github` tracking remains unverified until push approval.
- **Mobile real-device QA still owed:** tracked in `docs/mobile-qa.md`; required before Phase 11.8 ships.
