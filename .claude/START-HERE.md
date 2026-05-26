# START HERE — Agent Project Entry Point

**If you are an agent picking up this project, read this file first.** It tells you what the project is, which lane you are in (codex vs Claude), what to read next, and the rules of the cycle. It is intentionally short — detailed content lives in the files this one points to.

---

## ⚠️ CRITICAL: .gitignore Rule

**NEVER commit, stage, or push any file that is listed in `.gitignore`.** This is non-negotiable.

- **Before any `git add`:** check if the file is in `.gitignore`. If it is, do NOT stage it.
- **Before any `git push`:** run `git status` and verify that NO ignored files appear in the commit.
- **Environment secrets (`.env`, `.env.local`):** These are permanently ignored. Never commit them under any circumstances.
- **Build outputs (`dist/`, `build/`, `node_modules/`):** These are generated and gitignored. Never commit them.
- **IDE files (`.vscode/`, `.idea/`):** Personal editor config, gitignored. Never commit.
- **When in doubt:** Read `.gitignore` first. If the file is there, it stays out of git. Period.

**The consequence of violating this is severe:** secrets could leak to the public repo, build artifacts could pollute history, and the repo becomes unclean. Every commit must respect `.gitignore` absolutely.

---

## 📝 Context Management — Auto-Compact Every 2 Mini-Tasks

**After completing every 2 consecutive mini-tasks (e.g., Phase A.1 + A.2), run a context compaction.** This keeps the conversation from becoming unwieldy during long sessions.

- **When:** After every 2nd phase/mini-task completes (not after every 1, not after 3+)
- **How:** Use the `/spartan:context-save` command or manually summarize key decisions + state into a handoff file
- **What to preserve:** Last 3 decisions, current branch state, what just landed, next 2 actions
- **What to drop:** Verbose logs, detailed error messages, old attempts, rationale that's now in docs
- **Update AGENT-HANDOFF.md** with the summary before compacting

This prevents token bloat without losing continuity.

---

## ✅ Process Contract (Unbreakable)

For active-version implementation work, this procedure is mandatory:
- Follow phases in order from the active `plan-v*.md`.
- At each phase boundary: update `AGENT-HANDOFF.md`, append the Build Changelog entry, and commit that phase slice.
- Do not batch multiple phases into one commit unless the plan explicitly authorizes bundling.
- Keep `.claude/` updates committed in the same branch cycle they are made.

If any required gate fails, stop and ping the human per the plan's stop triggers.

---

## 1. What This Project Is (One Paragraph)

**MAKE Scheduling Tool** — a Gantt-style project scheduling app for construction PMs running institutional-scale builds (hospitals, civic facilities, infrastructure). Vite + TypeScript strict + React 18 + CSS custom properties + localStorage. No external state library. Custom Gantt (no chart libraries). v1.0 shipped 2026-05-21; v1.1 shipped 2026-05-22 (`v0.1.0`); v1.2 shipped 2026-05-22 (`v0.2.0`); v1.3 shipped 2026-05-23 (`v0.3.0`); v1.4 shipped 2026-05-25 (`v0.4.0`); v1.5 shipped 2026-05-25 (`v0.5.0`). **v1.6 (reporting & analytics) is implemented on branch `v1.6` and awaiting PR merge/tag for release closure.** Long-term roadmap extends to v2.2 ("10/10 fitness" — see `pm-roadmap.md`).

---

## 2. Agent Lanes — Which One Are You?

Two agent roles work on this project. **Know your lane before you touch anything.**

| Lane | Who | Does | Does NOT do |
|------|-----|------|-------------|
| **Hands (codex)** | Codex CLI / lower-cost implementation agents | Implements code per the active plan. Edits `.ts/.tsx/.css`. Runs lint/type-check/tests/build. **Updates `AGENT-HANDOFF.md` + appends to the active plan's Build Changelog when work lands.** May update `version-status.md` when a version ships. | Writes new `plan-v*.md` or `pm-audit-v*.md` files. Structural docs are Claude-owned by default unless explicitly requested by the human for continuity maintenance. |
| **Brain (Claude)** | Claude Code (Opus, high effort) | Writes plans, writes audits, restructures docs, does higher-order reasoning. Can ship code when the work needs depth, but defers most implementation to hands. | Does not need to ask permission to edit any structural doc — that's the lane. |

**Stop-and-ping rule for codex:** if the active plan in `version-status.md` is fully shipped and no successor plan exists, **stop and return to the human.** Do not auto-write the next plan. That is a Claude job.

If you are not sure which lane you are in, you are in the codex lane (writing a plan from scratch is a deliberate decision, not a default).

---

## 3. Read Order — Where to Go Next

Read these in order. Stop when you have what you need.

| # | File | Why |
|---|------|-----|
| **1** | `AGENT-HANDOFF.md` | **What happened last? Where do I pick up?** Volatile pointer — last touch, current focus, next action, blockers. Updated before any agent ends a session. |
| **2** | `version-status.md` | **What version is active, shipped, or pending?** Single source of truth for the version tracker. |
| **3** | `CLAUDE.md` | **What is the codebase? Why is it this way?** Project identity, the eight Key Design Decisions with rationale, resolved clarifications, conventions. |
| **4** | `AGENTS.md` *(project root)* | **How do I operate?** Build commands, critical patterns, deploy, testing quirks, performance targets. Read before touching code. |
| **5** | `plan-v1.6.md` | **What am I building right now?** Reporting & analytics plan with phased Build Changelog (§17). |
| **6** | `plan-v1.5.md` *(reference only)* | **What shipped immediately before v1.6?** Prior version changelog and release context. |
| **7** | `pm-roadmap.md` *(when planning v1.3+)* | **What is the long-term vision?** v1.3 → v2.2 roadmap, audit checkpoints, guiding principles. |
| **8** | `pm-audit-template.md` *(when running an audit)* | **How do I run a PM audit?** Standardized template with decision gates. |
| **9** | `pm-audit-v*.md` *(when running an audit)* | **What did previous audits find?** Read the most recent one before running a new one. |

**Quick decision tree:**
```
What do you need to do?
│
├─ Implement the next task          → Read AGENT-HANDOFF → confirm version-status → skim AGENTS.md (critical patterns) → read plan-v1.6 (active plan) → build
├─ Ship a version (any agent)       → Update version-status → append plan changelog → update AGENT-HANDOFF
├─ Write a new plan (Claude only)   → Read pm-roadmap → write plan-v*.md → update version-status → update AGENT-HANDOFF
├─ Run a PM audit (Claude only)     → Read pm-audit-template → read latest pm-audit-v* → run audit → save pm-audit-v[N].md → update version-status + AGENT-HANDOFF
└─ Understand the codebase          → Read CLAUDE.md → read AGENTS.md → scan src/
```

**Whatever you do, update `AGENT-HANDOFF.md` before you stop.** That is the only rule that keeps continuity working.

---

## 4. Historical Housekeeping (v1.2 cycle, archived)

These items are historical carry-overs from the v1.2 cycle and are retained only for audit traceability. Do not treat them as active v1.6 work items.

| # | Item | Action | Risk if skipped |
|---|------|--------|-----------------|
| **HK-1** | Orphan git worktree `.worktrees/phases-3-6/` on dead branch `feature/phases-3-6` (commit `bb27bf6`) | `git worktree remove .worktrees/phases-3-6 --force` then `git branch -D feature/phases-3-6` | Confuses future agents; was source of the v1.1 lint blocker that needed the `.worktrees/**` eslint ignore. |
| **HK-2** | `.github/` is gitignored — CI workflow (`.github/workflows/ci.yaml`) and PR template (`.github/PULL_REQUEST_TEMPLATE.md`) exist locally but are **not tracked in the repo**, so CI is not actually running on origin despite plan changelogs claiming it does. | Decide: (a) remove `.github/` from `.gitignore` and commit the workflow + PR template so CI runs on push (recommended — v1.2 Phase A onward benefits from real CI gating), OR (b) remove the misleading references from CHANGELOG and plan changelogs. | Visual-refinement work will land without CI gating; regressions slip through. |
| **HK-3** | Manual touch-device QA on the mobile bottom sheet | Run through Start blank → tap task → peek/full drag → dismiss on a real iPhone or Android device. Record findings in `docs/onboarding-qa.md` or a new `docs/mobile-qa.md`. | v1.2 Phase 11.8 (mobile sheet visual polish) needs a confirmed baseline before any styling changes; otherwise visual regressions are indistinguishable from interaction bugs. |
| **HK-4** | `useMidnightTicker` StrictMode double-invoke is currently behaving correctly but has no regression test | Optional — add a unit test that exercises the cleanup path. Defer if Phase A has higher priority. | Future ticker refactor could silently regress; not v1.2-blocking. |

These housekeeping notes are closed context and should not gate current implementation phases.

---

## 5. File Map — What Each .md File Does

| File | Purpose | Who Updates It |
|------|---------|---------------|
| `START-HERE.md` *(this file)* | Single entry point. Lane statement, read order, housekeeping pointer, decision tree. | Claude — when read order, file map, or housekeeping changes. |
| `AGENT-HANDOFF.md` | Volatile "where do I pick up" pointer — last touch, current focus, next action, blockers. | **Every agent before ending a session.** |
| `version-status.md` | Living version tracker. Active / shipped / pending. | Any agent that ships a version. |
| `CLAUDE.md` | Project conventions + the eight Key Design Decisions + resolved clarifications. Durable. | Claude — when a design decision changes or the active version flips. |
| `AGENTS.md` *(project root)* | Operating manual: commands, critical patterns, testing quirks, performance targets. | Claude — when commands or patterns change. |
| `plan-v1.6.md` | **Active plan** — reporting & analytics, with Build Changelog (§17). | Codex appends to changelog when work lands. Claude updates structure. |
| `plan-v1.5.md` | ✅ Shipped 2026-05-25 (`v0.5.0`). Prior build changelog reference. | Frozen reference. Do not edit. |
| `pm-roadmap.md` | v1.3 → v2.2 long-term roadmap with 5 PM audit checkpoints. | Claude — when the long-term vision shifts. |
| `pm-audit-template.md` | Standardized 11-section audit template. | Claude — rarely. |
| `pm-audit-v1.md` | Baseline audit (3.6/10 fitness). | Immutable. Never edit historical audits. |
| `taste-audit-swiss.md` | Swiss-design audit (items 1-12 applied across v1.0/v1.1). Structural items absorbed by v1.2. | Claude — only when adding new audits. |
| `plan-v0.md`, `plan-v1.0.md` | Archived plans. Historical reference. | Never. |
| `WORKFLOW.md` | Human cheatsheet for day-to-day operation. | Human-facing; rarely changes. |
| `handoff/README.md` | Full implementation spec (gitignored design ref). | Never — it's a frozen handoff artefact. |

---

## 6. The Continuity Cycle (How This All Stays Up to Date)

This is the loop that keeps the doc system from rotting:

```
Codex finishes a task
   ↓
Codex appends Build Changelog entry in active plan-v*.md
   ↓
Codex updates AGENT-HANDOFF.md (last touch, what landed, next action)
   ↓
Codex stops. Hands off to next agent (Claude or another codex).
   ↓
Next agent reads START-HERE.md → AGENT-HANDOFF.md → picks up immediately
```

```
Claude finishes a plan or audit
   ↓
Claude saves new file (plan-v*.md or pm-audit-v*.md)
   ↓
Claude updates version-status.md (add to tracker tables)
   ↓
Claude updates AGENT-HANDOFF.md (next action points at the new plan)
   ↓
Codex picks up the new plan from AGENT-HANDOFF on next session
```

If every agent honours its two updates (changelog + handoff for codex; new file + status + handoff for Claude), the cycle is self-maintaining.

---

## 7. Self-Maintenance — When to Update This File

**Do NOT update this file on every session.** Only when something structural changes:

| Trigger | What to Change |
|---------|---------------|
| A new `.md` file is added that agents should know about | Add it to §3 Read Order and §5 File Map |
| A file is renamed, moved, or deleted | Update §3 + §5 |
| The agent lane split changes (new agent role, different responsibilities) | Update §2 |
| The continuity cycle changes (new file becomes mandatory in the loop) | Update §6 |
| The active version changes | The version-specific row in §3 needs adjustment (e.g., "if v1.3 active"). Housekeeping §4 may also need refresh or removal. |
| A version ships and housekeeping items become irrelevant | Strike §4 items or replace with the new cycle's housekeeping |

**Do NOT update this file for:** routine code changes, changelog entries, version status flips, audit results. Those have their own homes.

---

**Last updated:** 2026-05-25
**Maintained by:** Claude (planning agent). One-line note when you update: `<!-- Updated YYYY-MM-DD: what changed -->`. Keep history to the last 5 entries.

<!-- Updated 2026-05-22: v1.1 shipped as v0.1.0 — flipped active plan pointer to plan-v1.2.md, added §4 housekeeping carry-over (HK-1..HK-4), refreshed read order. -->
<!-- Updated 2026-05-21: full restructure — added agent lane statement, continuity cycle, trimmed duplicate content (commands/patterns/perf now in AGENTS.md only), promoted AGENT-HANDOFF.md to read-order #1. -->
<!-- Updated 2026-05-25: refreshed active pointers to v1.6/plan-v1.6, marked v1.2 housekeeping as archival, and aligned read-order + file map with current cycle. -->
<!-- Updated 2026-05-25: added explicit unbreakable process-contract section (phase-boundary update/changelog/commit discipline + stop-trigger behavior). -->
