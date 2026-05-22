# AGENT-HANDOFF

**The freshest "where do I pick up" pointer between agent sessions.**
Read this AFTER `START-HERE.md` and BEFORE the active plan.

---

## Last Touch

- **When:** 2026-05-22
- **Agent:** Codex
- **Did:** Completed v1.2 Phases D and E, including SetupWizard redesign milestone and TopBar polish, with full local gate runs.

---

## Current Focus

- **Active version:** v1.2 (visual refinement / de-vibecoded surface)
- **Plan:** [.claude/plan-v1.2.md](./plan-v1.2.md)
- **Phase in progress:** Ready for Phase F (Gantt diagrammatic polish)

---

## What Just Landed

- **D.1–D.6** `src/components/overlays/SetupWizard.tsx`, `src/styles/app.css`, `public/setup-wizard.svg`, `public/wizard-bg.svg`
  - Replaced centered wizard card with split asymmetric composition.
  - Added upgraded copy hierarchy, wordmark detail, right-panel visual asset, craft overlay asset, and staggered motion with reduced-motion fallback.
- **E.1–E.4** `src/components/topbar/TopBar.tsx`, `src/components/topbar/EditableTitle.tsx`
  - Reduced divider clutter to two structural rules and widened group spacing.
  - Demoted Print visual weight.
  - Refined wordmark tracking and added project-title keyboard focus underline affordance.
  - Added New Task inner-top highlight and refined mono key badge.
- Build Changelog updated in `plan-v1.2.md §23`.

All gates passed:
- `npm run lint`
- `npm run type-check`
- `npm run test:unit`
- `npm run build`
- `npm run test:e2e`

---

## Next Action

1. Start **Phase F.1** in `plan-v1.2.md §16`: critical path styling (3px left rail + non-critical dimming polish).
2. Continue F.2–F.8 (today pill, header tier differentiation, baseline ghost refinement, dependency arrow tuning, milestone logic, ghost toggle, zoom pill) with full gates after each landing.
3. Keep appending `plan-v1.2.md §23` and refreshing this file at each stop.

---

## Blockers / Open Threads

- **Push still pending human approval:** CI-on-origin confirmation for `.github` tracking remains unverified until push approval.
- **Mobile real-device QA still owed:** tracked in `docs/mobile-qa.md`; required before Phase 11.8 ships.
