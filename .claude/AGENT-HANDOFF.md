# AGENT-HANDOFF

**The freshest "where do I pick up" pointer between agent sessions.**
Read this AFTER `START-HERE.md` and BEFORE the active plan.

---

## Last Touch

- **When:** 2026-05-22
- **Agent:** Codex
- **Did:** Landed v1.2 Phase L complete (L.1–L.8). Marketing page full visual treatment.

---

## Current Focus

- **Active version:** v1.2 (visual refinement / de-vibecoded surface)
- **Plan:** [.claude/plan-v1.2.md](./plan-v1.2.md)
- **Phase in progress:** Phase M (dark mode polish) — ready to start

---

## What Just Landed

- **L.1–L.8** (commit `4c8d66b`) — `src/marketing/MarketingPage.tsx`, `src/marketing/marketing.css`
  - Hero: off-white bg + 3° tilted GanttMock frame with shadow
  - Interface band: 3 focused SVG crop panels (bars, CP, baseline ghost)
  - Process: expanded to 5 steps; step 05 "Export and share." added
  - Closing CTA: navy band with ClosingDiagram SVG visual column
  - Footer: 4-column grid (brand/product/built-with/storage) + version rule
  - Copy pass: all CTAs outcome-specific, zero AI-tell language
- Build Changelog updated in `plan-v1.2.md §23`.
- **Phase L fully complete** (L.1–L.8 all landed).

All gates passed:
- `npm run lint` ✅
- `npm run type-check` ✅
- `npm run test:unit` ✅ (149/149)
- `npm run build` ✅
- `npm run test:e2e` ✅ (9/9)

## In Progress (Not Landed Yet)

None. Clean working tree (only `playwright-report/index.html` is dirty — generated artifact, not tracked).

---

## Next Action

1. Start **Phase M** in `plan-v1.2.md §`: dark mode polish (M.1–M.4).
2. Run full gate after each M.x task, commit, append `plan-v1.2.md §23`, refresh this handoff.
3. Do NOT push to origin without explicit user approval.

---

## Blockers / Open Threads

- **Push still pending human approval:** CI-on-origin confirmation for `.github` tracking remains unverified until push approval.
- **Mobile real-device QA still owed:** tracked in `docs/mobile-qa.md`; required before Phase 11.8 ships.
