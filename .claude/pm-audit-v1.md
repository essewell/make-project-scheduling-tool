# PM Audit v1 — Senior Project Manager Evaluation

**Date:** 2026-05-21
**Auditor:** Senior PM lens (portfolio management, risk analysis, enterprise-scale construction scheduling)
**Scope:** MAKE Scheduling Tool — current codebase state, planned direction, and fitness for complex construction project management

---

## 1. Executive Summary

The MAKE Scheduling Tool is a **competent single-user Gantt scheduler** with clean architecture, deliberate visual discipline, and a clear understanding of its audience: construction PMs building institutional-scale projects (hospitals, community centres, civic facilities). It gets the fundamentals right — critical path method, baseline/variance tracking, dependency types with lag, CSV import/export, A3 print output, keyboard-first operation.

**But it is not yet a tool I would trust to run a $50M hospital build.** It is a very good personal scheduling instrument. It is not yet a project management platform. The gap is not in the code quality — the code is disciplined. The gap is in scope, collaboration, and the realities of how large construction projects actually get managed.

This audit is honest about what works, what doesn't, and what I would build if given creative direction. No code changes — purely evaluation and vision.

---

## 2. What Is Good (Praise Where Earned)

### 2.1 Architecture Discipline
The decision to put all state in `App.tsx` with pure `lib/` utilities is the right call for a tool this size. It means the data layer is testable, the components are dumb, and there are no hidden side effects. 149 unit tests across `lib/*` at ~3s runtime is excellent. The `useRef` scroll-sync pattern (not `useState`) shows someone understands React's render cycle deeply enough to avoid feedback loops.

**This is rare.** Most scheduling tools I've evaluated are spaghetti — state scattered across components, no test coverage, no separation of concerns. This codebase is cleaner than 80% of commercial SaaS products in this space.

### 2.2 Critical Path Method Implementation
CPM with Kahn topological sort, forward/backward pass, and total float calculation is the real algorithm — not a simplified approximation. Supporting FS, SS, FF, SF dependency types with lag is what separates a toy from a tool. Construction schedules live and die on dependency logic. This is correct.

### 2.3 Baseline + Variance Tracking
The concept of capturing a baseline snapshot and then showing variance (slip/ahead) against it is exactly how real construction PMs think. You don't just track "what's happening now." You track "what we said would happen vs. what is happening." The ghost bar visualization with stripe/solid/outline modes is a good UX choice.

### 2.4 Print-First Mentality
A3 print output at 55% scale with page-break awareness is not a feature — it's a requirement. Construction PMs print schedules for owner meetings, lawyer reviews, and site walkthroughs. The fact that this was designed in from the handoff prototype (not bolted on later) tells me the product team understands the buyer.

### 2.5 Visual Restraint
The Swiss-design discipline — one signal color (cyan), no gradients, no card spam, tabular numerals, 8px grid — is exactly right for institutional software. Construction PMs don't want pretty. They want legible under stress. The "instrument" aesthetic (Linear meets Bloomberg Terminal meets Massimo Vignelli) is the correct reference frame.

### 2.6 Keyboard-First Operation
N for new task, arrow navigation, Ctrl+Z undo, Ctrl+Scroll zoom — this is how power users work. Mouse-driven scheduling tools are slow. The keyboard shortcut table in `CLAUDE.md` shows intentional design, not afterthought.

### 2.7 No-Account, No-Cloud, LocalStorage
For a v0.1 product, this is the right constraint. It means zero infrastructure cost, zero auth complexity, and instant time-to-value. A PM can open the URL, load a CSV, and have a schedule in 30 seconds. That's a feature, not a limitation.

---

## 3. What Is Bad (Shame Where Due)

### 3.1 No Resource Management
**This is the single biggest gap for construction-scale projects.** A 500-task schedule means nothing if you don't know whether you have enough electricians, crane hours, or concrete pours to execute it. Real construction schedules are resource-constrained. This tool has no concept of:
- Resource pools (labor, equipment, materials)
- Resource allocation per task
- Resource leveling (resolving over-allocation)
- Resource histograms or utilization charts
- Cost loading (labor rates, material costs, equipment rates)

**Without resources, this is a pretty timeline — not a schedule.** It tells you *when* things should happen but not *whether they can* happen.

### 3.2 No Multi-User or Collaboration
Every real construction project has multiple stakeholders: the GC's scheduler, the owner's rep, the architect, the subcontractors. This tool is single-user, single-device, localStorage-bound. There is no:
- Cloud sync
- Multi-user editing
- Change tracking (who changed what, when)
- Comment threads on tasks
- Subcontractor-specific views or exports
- Permission levels (read-only for owner, edit for scheduler)

**I understand this is v0.1.** But the architecture needs to be designed with multi-user in mind from the start, or the migration will be painful.

### 3.3 No WBS Code Export or Import
The tool supports WBS hierarchy (groups → tasks) but has no concept of standard WBS coding (1.0, 1.1, 1.1.1, etc.) that construction PMs use to communicate with owners, subs, and inspectors. The WBS numbers exist but are display-only — they don't export, they don't validate, and they don't enforce hierarchy rules.

### 3.4 No Schedule Quality Metrics
A professional scheduler needs to know: is this schedule *good*? Metrics like:
- **DCMA 14-Point Assessment** (the US Defense Contract Management Agency standard)
- Logic density (average successors per task)
- Open ends (tasks with no predecessors or successors)
- Negative float count
- High float count
- Critical path length index (CPLI)
- Baseline Execution Index (BEI)

None of these exist. A PM could build a schedule with 500 tasks, zero dependencies, and the tool would happily display it as if it were valid. **It should flag this.**

### 3.5 E2E Tests Are Stubs
149 unit tests on pure functions is great. But the user-facing flows have stub E2E specs. If I'm a PM evaluating this tool, I need to know that the drag-to-reschedule, baseline capture, CSV import, and mobile sheet flows actually work end-to-end. Unit tests don't prove that.

### 3.6 Marketing Is Untracked and Unfinished
The marketing landing page exists on disk but is untracked in git. This means the product has no public face. A PM evaluating this tool would land on... nothing. No description, no screenshots, no "what does it do." For a tool that's supposed to look like "real software," having no deployable marketing page is a credibility gap.

### 3.7 No Calendar Integration
Construction schedules interact with real calendars: weather delays, owner-mandated shutdowns, union work rules, holiday schedules. The tool has a workweek modal (good) but no way to:
- Import or link to external calendars
- Flag weather-delayed tasks
- Mark owner-directed suspensions
- Track excusable vs. non-excusable delays

These are the things that turn a schedule into a claim document.

---

## 4. Fitness for Complex Construction Projects

### Current State Assessment

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Task management** | 7/10 | Good for single-user, small-to-medium projects (50-200 tasks). Virtualization at 500+ is solid. |
| **Dependency logic** | 8/10 | FS/SS/FF/SF with lag is correct. CPM algorithm is real. Missing resource dependencies. |
| **Baseline/variance** | 7/10 | Concept is right. Needs multiple baselines, baseline comparison, and variance trend analysis. |
| **Resource management** | 1/10 | Nonexistent. This is the dealbreaker for large projects. |
| **Cost management** | 0/10 | Nonexistent. No budgets, no actuals, no earned value. |
| **Collaboration** | 0/10 | Single-user only. No sharing, no permissions, no audit trail. |
| **Reporting** | 5/10 | A3 print is good. Needs PDF export, S-curves, histograms, and executive dashboards. |
| **Schedule quality** | 2/10 | No DCMA assessment, no logic checks, no open-end detection. |
| **Integration** | 1/10 | CSV import/export only. No Primavera P6, no MS Project, no Procore, no API. |
| **Mobile** | 5/10 | Bottom sheet is a good start. But field teams need offline access, photo attachments, and daily reporting. |

**Overall: 3.6/10 for complex construction projects.** Excellent bones, missing the organs.

### Where It Shines
- **Small-to-medium projects** (community centres, small commercial builds, tenant improvements): 7/10
- **Personal schedule management** (a PM's working copy before sharing with the team): 8/10
- **Quick what-if analysis** (drag a bar, see the critical path shift, capture a baseline): 8/10
- **Owner presentations** (A3 print, clean visual, no clutter): 7/10

### Where It Falls Short
- **Hospital builds** ($50M+, 2,000+ tasks, 15+ subcontractors, resource-constrained): 2/10
- **Multi-year programs** (baseline drift, multiple phases, change orders): 3/10
- **Claims and disputes** (delay analysis, as-planned vs. as-built, impact documentation): 1/10
- **Enterprise deployment** (multiple projects, portfolio view, executive dashboards): 1/10

---

## 5. If I Had Creative Direction — What I Would Build

### 5.1 Phase 1: Resource Foundation (v1.3–v1.5)

**Resources are the missing organ.** Before anything else, I would add:

- **Resource pools:** Define labor categories (electrician, plumber, carpenter), equipment (crane, excavator, concrete pump), and materials (concrete CY, steel tons, drywall SF). Each with availability calendars and cost rates.
- **Task resource assignment:** Assign resources to tasks with quantities and durations. "Task 3.2 — Pour foundation: 2 carpenters × 3 days, 1 concrete pump × 1 day, 120 CY concrete."
- **Resource histogram:** Visual chart showing resource demand over time. Red zones = over-allocation. This is how PMs spot problems before they happen.
- **Resource leveling:** Automatic or manual resolution of over-allocation. Shift tasks within their float to smooth resource demand.
- **Cost loading:** Every task gets a budget (labor + material + equipment). Every resource has a rate. The schedule becomes a cash flow forecast.

**Why this first:** Without resources, the schedule is fiction. With resources, it becomes a plan.

### 5.2 Phase 2: Schedule Quality Engine (v1.5–v1.6)

Before a PM trusts this tool with a real project, it needs to tell them whether their schedule is *good*:

- **DCMA 14-Point Assessment:** Automated scoring against the industry standard. Logic density ≥ 1.3, open ends = 0, negative float = 0, critical path length index ≥ 0.95.
- **Logic validation:** Flag tasks with no predecessors (orphan starts) or no successors (orphan ends). Flag circular dependencies (already done — good). Flag excessive lag (> 50% of task duration).
- **Critical path health:** How many tasks are on the critical path? If > 30%, the schedule is too rigid. If < 5%, it's too loose.
- **Float distribution:** Show the histogram of total float values. A healthy schedule has a bell curve centered around 10-20 days.
- **Schedule health score:** A single number (0-100) that tells the PM at a glance whether their schedule is professional-grade or amateur-hour.

**Why this matters:** A PM presenting a schedule to an owner needs to defend its quality. This tool should do the defense work for them.

### 5.3 Phase 3: Multi-Baseline & Change Management (v1.6–v1.8)

Construction projects change. The schedule needs to track *how* they change:

- **Multiple baselines:** Not just "the baseline." Baseline 1 (original), Baseline 2 (after change order #3), Baseline 3 (after owner-directed suspension). Each with a date, reason, and author.
- **Baseline comparison:** Side-by-side view of two baselines. What changed? Which tasks slipped? Which were added or deleted?
- **Change order tracking:** Link change orders to schedule impacts. "CO-007: Added 14 days to MEP rough-in. New completion: 2026-03-15."
- **Variance trend analysis:** Not just "are we behind?" but "are we getting more behind?" A trend line showing variance over time is more valuable than a single snapshot.

### 5.4 Phase 4: Collaboration & Cloud (v2.0)

This is where the tool becomes a platform:

- **Cloud sync:** Move from localStorage to a cloud database. Real-time or near-real-time sync across devices.
- **Multi-user editing:** Role-based permissions. Scheduler = full edit. Owner = read-only + comment. Subcontractor = view their tasks only.
- **Change audit trail:** Every edit logged. Who changed the duration of Task 4.2 from 5 days to 8 days? When? Why?
- **Comment threads:** Attach comments to specific tasks. "Task 3.1 — delayed due to permit approval. Owner notified. — J. Smith, 2026-05-15."
- **Subcontractor portals:** Each sub gets a filtered view of their tasks only, with their own progress updates and daily logs.
- **API:** REST API for integration with Procore, Primavera P6, MS Project, and accounting systems.

### 5.5 Phase 5: Reporting & Analytics (v2.0–v2.2)

PMs don't just build schedules — they report on them:

- **S-curve:** Planned vs. actual progress over time. The single most important chart in construction management.
- **Earned Value Management (EVM):** PV, EV, AC, SPI, CPI. If you don't know these acronyms, you don't manage construction projects.
- **Cash flow forecast:** When will money be spent? By category (labor, material, equipment). By month. By trade.
- **Executive dashboard:** One-page view for the owner. Red/amber/green status. Key milestones. Top 3 risks. No Gantt chart — owners don't read Gantt charts.
- **PDF report generator:** Weekly, monthly, or ad-hoc reports. Branded. With charts. Ready to email to the owner.

### 5.6 Visual & UX Refinements (Parallel with Above)

The v1.2 plan is excellent. I would add:

- **Density modes:** Compact (for 500+ task schedules), Comfortable (default), Spacious (for presentations). A PM managing a hospital build needs to see 80 rows on screen, not 30.
- **Column customization:** Let users reorder, show/hide, and resize columns in the task list. Different PMs need different information.
- **Saved views:** "MEP view" (filter to MEP tasks), "Critical path only," "Next 30 days." One-click access to the views a PM uses daily.
- **Bulk edit:** Select 20 tasks, shift them all by 5 days, or change all their parties to "Electrical Sub." Power users need bulk operations.
- **Drag-and-drop dependencies:** Draw dependency arrows directly on the Gantt by dragging from one bar to another. The LinkBuilder modal is good for precision, but drag is faster for exploration.

---

## 6. Guidelines for Future Development

### 6.1 Never Lose the Instrument Feel
This tool's greatest strength is that it feels like a precision instrument — not a bloated enterprise platform. As you add features, resist the urge to add chrome. Every new surface should feel like it belongs in the same family: Swiss-disciplined, dense, keyboard-accessible, print-ready.

### 6.2 The Buyer Is Not the User
The person buying this tool (a firm's IT director or VP of Construction) is not the person using it (a scheduler at a desk or a superintendent on site). Design for the user, sell to the buyer. The marketing page should speak to the buyer's concerns (compliance, auditability, integration). The app should serve the user's workflow (speed, accuracy, legibility).

### 6.3 Print Is a Feature, Not an Afterthought
Construction PMs print schedules. Weekly. Sometimes daily. Every visual change must be verified against print output. If it looks good on screen but bad on paper, it's not done.

### 6.4 Performance Is a Feature
A scheduler with 2,000 tasks cannot tolerate 2-second drag lag. The 500-task performance target (55fps scroll, < 33ms drag, < 100ms CP recompute) is good. For v2.0 with resources and EVM, the target should be 2,000 tasks at the same performance level.

### 6.5 Data Portability Is Trust
CSV import/export is the minimum. v2.0 needs Primavera P6 (.xer) import, MS Project (.mpp) import, and a public API. If a PM can't get their data in or out, they won't trust the tool.

### 6.6 The Schedule Is a Legal Document
In construction disputes, the schedule is evidence. Every change should be traceable. Every baseline should be immutable once captured. Every variance should be calculable. This tool should produce schedules that hold up in arbitration — not just in a browser.

---

## 7. Prioritized Roadmap

| Priority | Feature | Why | Effort |
|----------|---------|-----|--------|
| **P0** | Resource pools + task assignment | Without resources, not a real schedule | 3-4 weeks |
| **P0** | DCMA 14-point assessment | PMs need to know their schedule is valid | 1-2 weeks |
| **P1** | Multiple baselines + comparison | Single baseline is insufficient for real projects | 2-3 weeks |
| **P1** | Resource histogram + leveling | Visualize and resolve over-allocation | 2-3 weeks |
| **P1** | Cost loading + cash flow forecast | Schedule → budget integration | 2-3 weeks |
| **P2** | S-curve + EVM (SPI/CPI) | The charts owners actually read | 2 weeks |
| **P2** | Cloud sync + multi-user | Collaboration is non-negotiable at scale | 4-6 weeks |
| **P2** | Primavera P6 import (.xer) | Data portability = trust | 2-3 weeks |
| **P3** | Subcontractor portals | Field teams need their own views | 3-4 weeks |
| **P3** | Change order tracking | Link schedule impacts to contractual changes | 2 weeks |
| **P3** | API + webhooks | Integration with Procore, accounting, ERP | 3-4 weeks |

**v1.2 (visual refinement) should ship before any of these.** A tool that looks like "real software" gets taken seriously. A tool that looks like a side project doesn't. The v1.2 plan is correct — execute it.

---

## 8. Final Verdict

**Current state:** A well-architected, visually disciplined personal scheduling tool with excellent bones and missing organs. 3.6/10 for complex construction projects. 7/10 for small-to-medium projects and personal schedule management.

**Potential:** If resources, schedule quality, multi-baseline, and cloud sync are added with the same discipline that produced the current codebase, this could become a legitimate competitor to mid-market scheduling tools (not Primavera P6 — that's a different league — but tools like Float, GanttPRO, and Smartsheet).

**The biggest risk is not technical.** It's scope creep. The v1.1 and v1.2 plans are disciplined — they harden and polish what exists. Do not let the temptation to add resources or cloud sync derail the production-readiness pass. Ship v1.1. Ship v1.2. Then add resources. One organ at a time.

**The biggest opportunity is trust.** Construction PMs are skeptical of new tools. They've been burned by "simple" scheduling apps that couldn't handle their complexity. Every design decision — from the Swiss visual discipline to the A3 print output to the DCMA quality scores — should signal: "This tool was built by people who understand construction."

If you do that, you won't just build a scheduling tool. You'll build the scheduling tool.
