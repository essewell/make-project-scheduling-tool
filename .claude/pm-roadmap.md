# PM Roadmap — Path to 10/10

> **Agent start-here:** If you are reading this, v1.1 and/or v1.2 are done or in progress. Read `.claude/version-status.md` first to confirm the current version. Then read `.claude/pm-audit-template.md` before running any checkpoint audit. The roadmap below defines what to build; the template defines how to evaluate it.

---

**Context:** This tool is being built as an **internal application** for a construction firm that delivers large-scale projects — healthcare facilities, community centres, civil infrastructure, and private institutional builds. It is not a SaaS product. It is not for sale. It is for the PMs and PDs inside one organization who need to plan, track, and defend schedules on projects that cost tens or hundreds of millions of dollars.

**The goal is not to beat Primavera P6.** That is a different product for a different workflow. The goal is to build the tool that a PM at this firm reaches for every morning — the one that makes their day easier, their schedule defensible, and their communication with owners and subcontractors clearer.

**Current fitness: 3.6/10.** This roadmap describes the path to 10/10.

---

## The 10/10 Vision — What "Perfect" Looks Like

Before the roadmap, here is what the finished product feels like to use:

> A PM opens the tool at 7:30 AM on a Tuesday. They are managing the $85M Memorial Hospital Phase 2 build — 1,800 tasks, 14 subcontractors, 3 active baselines, and a change order pending approval. The schedule loads instantly. The first thing they see is a health score of 78/100 with three flagged items: an over-allocated electrical crew in weeks 12–14, a critical-path slip on the HVAC rough-in (+3 days), and an open-end task in the landscaping phase that has no successor. They click the electrical over-allocation. The resource histogram shows the spike. They drag two tasks within their float to smooth it. The histogram flattens. The health score ticks to 82. They export an A3 PDF for the 10 AM owner meeting — it includes the S-curve, the top 5 risks, and the variance summary against Baseline 2. The owner asks why the MEP phase slipped. The PM opens the baseline comparison view, shows the 14-day change order impact, and points to the variance trend line. The conversation lasts three minutes. The meeting moves on.

That is the 10/10 experience. Not flashy. Not complex. **Fast, accurate, defensible.**

---

## Version Roadmap

### v1.3 — Resource Foundation
**Target fitness: 5.0/10**

The first organ. Without resources, a schedule is a wish list. With resources, it becomes a plan.

**What the PM gets:**
- A place to define the people, equipment, and materials available on the project — electricians, crane hours, concrete pours, steel tons. Each resource has a name, a category, a unit of measure, and an availability calendar.
- The ability to assign resources to tasks. "Task 3.2 — Pour foundation: 2 carpenters for 3 days, 1 concrete pump for 1 day, 120 CY of concrete." The assignment shows up in the task list as a compact badge, and in the side panel as a detailed breakdown.
- A resource histogram — a bar chart below the Gantt that shows demand over time for any selected resource. Red bars mean over-allocation. The PM can see at a glance that the electrical crew is double-booked in weeks 12–14.
- The ability to resolve over-allocation by dragging tasks within their float. The histogram updates live. The PM smooths the demand curve without breaking the schedule logic.
- A cost rate attached to each resource. Every task now has a budget. The schedule becomes a cash flow forecast.

**What it feels like:** The PM is no longer guessing whether the schedule is executable. They can see the resource conflicts before they become problems on site. The schedule has moved from "when should things happen" to "can things actually happen."

**Design note:** The resource histogram lives below the Gantt, not beside it. It shares the same time axis. When the PM zooms the Gantt, the histogram zooms with it. This is one surface, not two. The visual language matches the Gantt — same grid lines, same today line, same phase color coding.

---

### ⚖ PM Audit Checkpoint 1 — After v1.3 Ships

**Why here:** Resources are the single biggest architectural addition to the product. They change the data model, the UI surface area, and the product's identity from "timeline viewer" to "executable schedule." An audit at this point confirms we built the right thing before layering quality scoring on top of it.

**Audit scope:**
- Does the resource model match how construction PMs actually think about labor, equipment, and materials?
- Is the resource histogram legible and actionable — or is it a chart that looks nice but doesn't drive decisions?
- Has the instrument feel been preserved, or has the resource UI added chrome that breaks the Swiss discipline?
- Are there resource features we missed that PMs expect (skill levels, crew composition, shift patterns)?
- Is the cost-loading model realistic for the firm's actual estimating workflow?

**Decision gate:** If the audit scores below 5.5/10, pause v1.4 development and fix the resource foundation. If it scores 5.5+, proceed to v1.4.

---

### v1.4 — Schedule Quality Engine
**Target fitness: 6.0/10**

Before a PM trusts a schedule with a real project, they need to know it is *good*. This version gives the tool the ability to audit itself.

**What the PM gets:**
- A DCMA 14-Point Assessment that runs automatically. The tool scores the schedule against the industry standard and produces a report: logic density, open ends, negative float, critical path length index, baseline execution index. Each metric has a pass/fail indicator and a plain-English explanation of what it means.
- A schedule health score — a single number from 0 to 100 that tells the PM at a glance whether their schedule is professional-grade or amateur-hour. The score is weighted: logic quality (30%), resource feasibility (25%), baseline adherence (20%), float distribution (15%), and completeness (10%).
- Logic validation that runs in real time. Orphan tasks (no predecessors, no successors) get flagged with a warning icon. Circular dependencies are already caught (good). Excessive lag (more than 50% of the task duration) gets a caution flag.
- A float distribution histogram. A healthy schedule has a bell curve centered around 10–20 days of total float. If the histogram is skewed — too many zero-float tasks or too many 100+ day float tasks — the tool flags it.
- A "Schedule Quality" panel that the PM can open at any time to see the full assessment. It looks like an engineering report, not a dashboard. Monospaced numbers. Pass/fail badges. No charts that don't need to exist.

**What it feels like:** The PM is no longer flying blind on schedule quality. Before they send a schedule to the owner, they run the quality check. If it scores 85+, they know it will hold up under scrutiny. If it scores below 70, the tool tells them exactly what to fix.

**Design note:** The health score lives in the StatBar — right next to the existing task count and progress meter. It is always visible. Clicking it opens the full quality panel. The score color-codes: green above 80, amber 60–80, red below 60.

---

### v1.5 — Multi-Baseline & Change Management
**Target fitness: 6.8/10**

Construction projects change. The schedule needs to track *how* they change — not just that they changed.

**What the PM gets:**
- Multiple baselines. Not just "the baseline." Baseline 1 (original plan), Baseline 2 (after change order #3), Baseline 3 (after owner-directed suspension). Each baseline has a date, a reason, and an author. The PM can name them: "Pre-COVID Baseline," "Post-Design-Revision Baseline."
- Baseline comparison. Side-by-side view of any two baselines. What changed? Which tasks slipped? Which were added or deleted? The comparison shows a variance summary: "+14 days overall slip, driven by MEP rough-in (+8d) and interior finishes (+6d)."
- Change order tracking. The PM can log a change order and link it to specific tasks. "CO-007: Added 14 days to MEP rough-in. New completion: 2026-03-15." The change order shows up in the task's side panel and in a dedicated change order log.
- Variance trend analysis. Not just "are we behind?" but "are we getting more behind?" A trend line showing variance against the baseline over time. If the trend is worsening, the tool flags it in amber. If it is improving, green.
- Baseline protection. Once captured, a baseline is immutable. It cannot be edited or deleted — only superseded by a new baseline. This is critical for claims and disputes. The baseline is evidence.

**What it feels like:** The PM has a complete historical record of how the project evolved. When the owner asks "why are we 6 weeks behind?" the PM can show the baseline comparison, point to the three change orders that caused the slip, and show the variance trend that proves the slip happened in a specific 4-week window — not gradually over the life of the project.

**Design note:** The baseline selector in the TopBar becomes a dropdown showing all captured baselines with their dates and names. Selecting two baselines opens the comparison view as a modal overlay. The change order log is a new panel tab — accessible from the TopBar alongside phases and parties.

---

### ⚖ PM Audit Checkpoint 2 — After v1.5 Ships

**Why here:** At this point the tool has resources, quality scoring, AND change tracking. It has crossed from "personal scheduling instrument" into "project management platform." This is the inflection point where scope creep is most dangerous — the temptation to add everything at once. The audit checks whether we are building a coherent platform or a feature soup.

**Audit scope:**
- Does the multi-baseline model reflect how construction PMs actually manage baseline revisions on real projects?
- Is the change order workflow realistic — does it match the firm's actual change order process, or is it an approximation?
- Is the variance trend analysis actionable? Can a PM use it in an owner meeting to defend a position?
- Has the tool become too complex for a single PM to use daily? Are there features that should be hidden behind advanced toggles?
- Are we missing any baseline comparison capabilities that PMs need (e.g., "what-if" baseline simulation)?
- Is the schedule quality engine (v1.4) actually being used, or is it a feature that PMs ignore?

**Decision gate:** If the audit scores below 6.5/10, identify which layer (resources, quality, or baselines) is weakest and fix it before proceeding to v1.6. If it scores 6.5+, proceed to v1.6.

---

### v1.6 — Advanced Reporting & Analytics
**Target fitness: 7.5/10**

PMs don't just build schedules — they report on them. This version gives the tool the charts and reports that owners, executives, and inspectors actually read.

**What the PM gets:**
- An S-curve — planned vs. actual progress over time. The single most important chart in construction management. It shows the planned cumulative progress (the baseline curve) overlaid with the actual cumulative progress (the real curve). The gap between them is the variance. The PM can see at a glance whether the project is ahead, behind, or on track.
- Earned Value Management (EVM). Planned Value (PV), Earned Value (EV), Actual Cost (AC), Schedule Performance Index (SPI), Cost Performance Index (CPI). If the PM doesn't know these acronyms, they don't manage construction projects. The tool calculates them from the schedule data and the cost-loaded resources.
- A cash flow forecast. When will money be spent? By category (labor, material, equipment). By month. By trade. The forecast is derived from the resource assignments and their cost rates, distributed across the task durations.
- An executive summary report — a one-page PDF that the PM can generate for the owner. It includes: the health score, the S-curve, the top 3 risks, the top 3 variances, the next 5 milestones, and the overall SPI/CPI. No Gantt chart. Owners don't read Gantt charts. They read one-page summaries.
- A weekly progress report template — auto-generated from the schedule data. Tasks completed this week. Tasks planned for next week. Variances. Change orders. The PM fills in a few narrative fields, hits export, and sends it to the owner.

**What it feels like:** The PM is no longer spending Sunday nights manually building reports in Excel. The tool generates them from the schedule data. The reports look professional — branded, formatted, with real charts. The owner receives a PDF that looks like it came from a $200K enterprise platform.

**Design note:** Reports are generated from a new "Reports" modal accessible from the TopBar. The modal shows a list of available report types. Each report has a preview pane and an export button (PDF or CSV). The S-curve and EVM charts are rendered as clean SVG — no chart library, consistent with the rest of the app's custom-rendering philosophy.

---

### v1.7 — WBS & Hierarchy Deepening
**Target fitness: 8.0/10**

Large construction projects are organized by Work Breakdown Structure. The tool already supports groups and tasks, but v1.7 makes the WBS a first-class citizen.

**What the PM gets:**
- Standard WBS coding (1.0, 1.1, 1.1.1, 1.1.1.1) that is generated automatically from the hierarchy and exported with the CSV. The WBS code is not just display — it is a data field that can be sorted, filtered, and searched.
- Multi-level nesting. Groups can contain groups, which contain groups, which contain tasks. Unlimited depth. The task list indents each level with a clear visual hierarchy — a thin vertical rule connects parent to child.
- Roll-up summaries. A group shows the aggregate of its children: total duration, total cost, overall progress, resource count. The PM can see the status of an entire phase at a glance without drilling down.
- WBS validation. The tool checks that every task belongs to a group, every group has at least one child, and there are no orphan branches. A schedule with a broken WBS gets a quality flag.
- WBS export. The full hierarchy exports to CSV with WBS codes, parent-child relationships, and roll-up summaries. The PM can share the WBS structure with the owner or the estimator without sharing the full schedule.

**What it feels like:** The PM can organize a 2,000-task hospital build into a logical hierarchy that mirrors the project's actual structure — Division 01 (General Requirements), Division 03 (Concrete), Division 08 (Openings), etc. The WBS is not just a visual grouping — it is a structural framework that the PM can navigate, filter, and report on.

**Design note:** The WBS column in the task list becomes sortable and filterable. The group row gets a collapse/expand caret (already exists) but also a roll-up summary pill showing "12 tasks · 64% · $2.4M." The side panel shows the WBS path for the selected task: "1.3.2.4 — Pour foundation walls."

---

### v1.8 — Calendar & Delay Management
**Target fitness: 8.5/10**

Construction schedules interact with real-world calendars. Weather, owner directives, union rules, and holidays all affect the plan. This version makes those interactions explicit and trackable.

**What the PM gets:**
- A project calendar that overlays the Gantt. Company holidays, owner-mandated shutdowns, union work stoppages, and weather delay windows are marked on the calendar and reflected in the schedule logic.
- Weather delay tracking. The PM can flag a task as "weather delayed" and specify the number of days. The tool recalculates the schedule, pushing dependent tasks forward. The delay is logged with a date and a reason.
- Excusable vs. non-excusable delay classification. When the PM logs a delay, they classify it: excusable (owner-caused, weather, force majeure) or non-excusable (contractor-caused). This classification matters for claims. The tool tracks both types separately and reports them in the variance summary.
- A delay log — a dedicated panel that lists every delay event on the project, with date, type, duration, responsible party, and impact on the critical path. The log is exportable and can be attached to a claim document.
- Calendar-aware scheduling. The workweek modal (already exists) gets enhanced: the PM can define project-specific non-work days (not just weekends) and the tool respects them in all date calculations.

**What it feels like:** The PM is no longer manually tracking delays in a separate spreadsheet. Every delay is logged in the tool, classified, and reflected in the schedule. When the contractor claims a 10-day weather delay, the PM can open the delay log, verify the dates, and see the exact impact on the critical path.

**Design note:** The calendar overlay is a toggle in the Gantt header. When enabled, non-work days get a subtle diagonal stripe pattern (different from the weekend bands). The delay log is a new panel tab. Delay events show up as small markers on the Gantt bars they affect — a tiny weather icon for weather delays, a wrench icon for owner-caused delays.

---

### ⚖ PM Audit Checkpoint 3 — After v1.8 Ships

**Why here:** The tool now has resources, quality scoring, multi-baseline tracking, reporting, WBS hierarchy, AND delay management. It is approaching enterprise capability. This is the last checkpoint before the major architectural shifts (data integration in v1.9, cloud sync in v2.0). The audit ensures the single-user experience is mature enough to justify the investment in collaboration features.

**Audit scope:**
- Is the WBS hierarchy deep enough for the firm's largest projects (2,000+ tasks, 15+ divisions)?
- Does the delay management workflow produce documentation that would hold up in a claim or arbitration?
- Are the reports (v1.6) actually being used by PMs in owner meetings, or are they still building reports in Excel?
- Has the tool become the PM's primary scheduling tool, or is it still a "working copy" alongside P6 or MS Project?
- Is the performance target (500 tasks at 55fps) still holding with all the new features layered in?
- Are there any single-user features we missed that would make the PM's daily workflow significantly easier?

**Decision gate:** If the audit scores below 8.0/10, identify the gap and address it before v1.9. If it scores 8.0+, the single-user experience is mature enough to justify the cloud/collaboration investment. Proceed to v1.9.

---

### v1.9 — Data Integration & Portability
**Target fitness: 9.0/10**

A PM will not trust a tool they can't get data into or out of. This version makes the tool a first-class citizen in the construction technology ecosystem.

**What the PM gets:**
- Primavera P6 (.xer) import. The PM can export a schedule from P6 and import it into this tool. The import maps P6 fields to the tool's data model: activities to tasks, relationships to dependencies, resources to resources, baselines to baselines. Not every P6 field maps — but the core schedule does.
- MS Project (.mpp) import. Same concept. The PM can open a .mpp file and the tool parses it into its native format.
- Export to P6-compatible format. The PM can work in this tool and then export back to a format that P6 can read. This is critical for firms that use P6 as the system of record but want this tool for daily working copies.
- Procore integration (via API). The PM can pull milestone dates from Procore and push schedule updates back. The integration is one-way at first (pull from Procore), then bi-directional.
- A public data model document. The tool's data schema is published internally so that the firm's IT team can build custom integrations — pulling schedule data into a dashboard, pushing cost data from the accounting system, etc.

**What it feels like:** The PM is no longer locked into one tool. They can work in this tool for daily scheduling and export to P6 for formal submissions. They can pull data from Procore for field updates. The tool is part of the ecosystem, not an island.

**Design note:** Import/export options expand in the TopBar. A new "Integrations" modal shows the status of each integration (connected, disconnected, not configured). The import dialogs for P6 and MS Project are similar to the existing CSV import dialog but with field-mapping screens for the proprietary formats.

---

### v2.0 — Collaboration & Multi-User
**Target fitness: 9.5/10**

This is where the tool becomes a platform. Real construction projects have multiple stakeholders. This version enables them to work together.

**What the PM gets:**
- Cloud sync. The schedule is no longer bound to one browser on one machine. It lives in a shared workspace. The PM opens it on their laptop, their desktop, or their tablet — the same schedule, the same state.
- Role-based access. The scheduler has full edit rights. The owner has read-only access with the ability to comment. The subcontractor sees only their tasks. The superintendent sees the next 30 days. Each role gets a view tailored to their needs.
- Change audit trail. Every edit is logged: who changed what, when, and why. "J. Smith changed Task 4.2 duration from 5 days to 8 days on 2026-05-15 at 14:32. Reason: 'Per CO-007.'" The audit trail is immutable and exportable.
- Comment threads on tasks. The PM can attach a comment to any task. "Task 3.1 — delayed due to permit approval. Owner notified. — J. Smith, 2026-05-15." Subcontractors can reply. The thread is visible to everyone with access to the task.
- Real-time presence. The PM can see who else is viewing the schedule. "M. Chen is viewing the MEP phase." This prevents edit conflicts and enables collaboration.
- Notification system. When a task the PM is watching changes, they get a notification. When a subcontractor updates their progress, the PM is alerted. Notifications are configurable — the PM chooses what they want to see.

**What it feels like:** The PM is no longer the single point of truth for the schedule. The schedule is a living document that the whole team contributes to. The PM's job shifts from "maintaining the schedule" to "orchestrating the team's use of the schedule."

**Design note:** This is the biggest architectural shift in the product. The localStorage persistence model moves to a cloud database. The UI gains a presence indicator in the TopBar ("3 viewers"), a notification bell, and a comments panel tab. The visual language stays the same — Swiss-disciplined, dense, keyboard-accessible. The cloud layer is invisible to the user.

---

### ⚖ PM Audit Checkpoint 4 — After v2.0 Ships

**Why here:** v2.0 is the most radical change in the product's history — moving from a local, single-user instrument to a cloud-based, multi-user platform. This is the checkpoint where we verify that the collaboration layer has not compromised the instrument feel that made the tool valuable in the first place. If the audit fails here, the product has lost its soul.

**Audit scope:**
- Has the cloud sync introduced latency that breaks the "instant load" feel? Does the schedule still open in under 1 second?
- Has the multi-user model introduced complexity that makes the tool harder to use for a PM working alone?
- Are the role-based views actually useful, or are they an approximation of what each role needs?
- Is the change audit trail producing information that PMs actually use, or is it a compliance checkbox?
- Are comment threads being used, or are PMs still communicating about schedule changes via email and phone?
- Has the instrument feel been preserved? Does the tool still feel like a precision instrument, or has it become a collaboration platform with a Gantt chart?
- Is the performance target still holding (2,000 tasks at 55fps) with the cloud layer and real-time presence?

**Decision gate:** If the audit scores below 9.0/10, the collaboration layer has compromised the core experience. Identify whether the issue is performance, complexity, or feature misalignment, and fix it before v2.1. If it scores 9.0+, the product has successfully transitioned from instrument to platform without losing its identity. Proceed to v2.1.

---

### v2.1 — Portfolio & Multi-Project View
**Target fitness: 9.8/10**

The firm doesn't manage one project. They manage a portfolio. This version gives leadership the ability to see across all projects.

**What the PM gets (and the VP of Construction gets more):**
- A portfolio dashboard showing all active projects. Each project shows: health score, overall progress, variance against baseline, next milestone, and RAG status. The VP can see the entire portfolio at a glance.
- Cross-project resource visibility. The VP can see that the electrical crew is over-allocated across three projects simultaneously. They can rebalance resources between projects.
- Portfolio-level S-curves. The cumulative progress of all projects combined. The VP can see whether the firm as a whole is ahead or behind plan.
- Executive portfolio report. A one-page PDF for the board: portfolio health, top risks across all projects, cash flow forecast by project, and strategic milestones. No Gantt charts. Just the numbers that matter.
- Project templates. The PM can save a schedule as a template and reuse it for similar projects. "Hospital Phase 2 Template" becomes the starting point for the next hospital build.

**What it feels like:** The VP of Construction opens the portfolio dashboard at the start of the week and sees the health of every project in 30 seconds. They drill into the one project that is red. They see the issue, assign resources, and move on. The PMs on each project continue working in their individual schedules — the portfolio view aggregates their work automatically.

**Design note:** The portfolio dashboard is a separate view — accessible from a new "Portfolio" button in the TopBar. It is a dense, tabular view with health scores, progress bars, and RAG indicators. It looks like a Bloomberg Terminal screen for construction projects. The visual language is consistent with the single-project view but optimized for scanning, not editing.

---

### v2.2 — The 10/10 Polish
**Target fitness: 10/10**

The final pass. Everything that makes the tool feel like it was built by a team of world-class designers and engineers who understand construction.

**What the PM gets:**
- Density modes. Compact (80 rows visible for 2,000-task schedules), Comfortable (default, 50 rows), Spacious (30 rows for presentations). The PM chooses the density that matches their screen and their task count.
- Column customization. The PM can reorder, show/hide, and resize columns in the task list. Different PMs need different information. The estimator wants cost columns. The scheduler wants float. The superintendent wants actual dates. Each PM gets their own layout.
- Saved views. "MEP view" (filter to MEP tasks), "Critical path only," "Next 30 days," "Owner presentation." One-click access to the views the PM uses daily. Saved views include filters, column layouts, density settings, and zoom levels.
- Bulk edit. Select 20 tasks, shift them all by 5 days, or change all their assigned parties to "Electrical Sub." Power users need bulk operations. The tool supports multi-select with keyboard (Shift+arrow) and mouse (click-drag).
- Drag-and-drop dependencies. Draw dependency arrows directly on the Gantt by dragging from one bar to another. The LinkBuilder modal is good for precision, but drag is faster for exploration.
- Keyboard macro recording. The PM records a sequence of actions (filter to critical path, select all, shift by 3 days, clear filter) and replays it with a single keystroke. This is for the power user who does the same operations every week.
- Offline mode. The PM can work on the schedule without an internet connection. Changes sync when connectivity is restored. This is critical for superintendents on sites with poor connectivity.
- A changelog that the PM can read. Every version update includes a plain-English summary of what changed, why it matters, and how to use the new features. No technical jargon. No "bug fixes and improvements."

**What it feels like:** The tool is invisible. The PM doesn't think about the tool — they think about the schedule. The tool gets out of the way and lets them do their job. It is fast, accurate, and reliable. It looks like it was built by people who understand construction. It holds up under scrutiny.

---

### ⚖ PM Audit Checkpoint 5 — After v2.2 Ships (Final Audit)

**Why here:** This is the final assessment. The product has gone through 10 versions of feature development. The audit evaluates whether the finished product actually delivers on the 10/10 vision — or whether we drifted from the original intent along the way.

**Audit scope:**
- Does the product match the 10/10 vision described at the top of this document? If not, where did we drift?
- Would a PM at this firm choose this tool over P6 or MS Project for their daily working copy? Why or why not?
- Is the tool defensible in a claim or arbitration? Would a lawyer accept the schedule output as evidence?
- Has the visual discipline been maintained across all 10 versions, or has feature creep introduced visual inconsistency?
- Is the onboarding experience for a new PM at the firm under 15 minutes? Can they load a CSV, see their schedule, and capture a baseline without reading documentation?
- What features were added that PMs don't use? What features do PMs use that we didn't plan for?
- If we had to remove three features to make the product simpler, which three would go — and would the PMs notice?

**Decision gate:** This is not a go/no-go gate — the product is shipped. This is a learning audit. The results inform v3.0 planning and the long-term product strategy. If the final audit scores below 9.5/10, document the gaps as v3.0 candidates. If it scores 9.5+, the product has achieved its 10/10 vision.

---

## Guiding Principles for All Future Versions

These principles apply to every version from v1.3 onward. They are non-negotiable.

### 1. Never Lose the Instrument Feel
This tool's greatest strength is that it feels like a precision instrument — not a bloated enterprise platform. As features are added, resist the urge to add chrome. Every new surface should feel like it belongs in the same family: Swiss-disciplined, dense, keyboard-accessible, print-ready.

### 2. The Schedule Is a Legal Document
In construction disputes, the schedule is evidence. Every change should be traceable. Every baseline should be immutable once captured. Every variance should be calculable. This tool should produce schedules that hold up in arbitration — not just in a browser.

### 3. Print Is a Feature, Not an Afterthought
Construction PMs print schedules. Weekly. Sometimes daily. Every visual change must be verified against print output. If it looks good on screen but bad on paper, it is not done.

### 4. Performance Is a Feature
A scheduler with 2,000 tasks cannot tolerate 2-second drag lag. The performance target scales with the version: 500 tasks at 55fps for v1.x, 2,000 tasks at 55fps for v2.x. No exceptions.

### 5. Data Portability Is Trust
If a PM can't get their data in or out, they won't trust the tool. CSV is the minimum. P6 and MS Project import are mandatory. A public data model is required for v2.0.

### 6. Build for the User, Not the Buyer
Since this is an internal tool, the user and the buyer are the same person (or at least in the same organization). But the PM who uses the tool daily has different needs than the VP who reviews the portfolio. Design for the daily user. Report for the VP.

### 7. One Feature at a Time
The biggest risk is scope creep. Ship v1.3 (resources) before v1.4 (quality). Ship v1.4 before v1.5 (baselines). Each version should feel complete on its own — not a half-finished feature set waiting for the next version.

---

## Version Summary

| Version | Theme | Fitness Gain | Key Deliverable |
|---------|-------|-------------|-----------------|
| **v1.1** | Production readiness | — | Tests, performance, mobile, CI |
| **v1.2** | Visual refinement | — | De-AI'd surface, Swiss discipline |
| **v1.3** | Resource foundation | 3.6 → **5.5** (target 5.0) ✅ | Resource pools, histograms, cost loading |
| | **⚖ PM Audit Checkpoint 1** | ✅ conditional pass — [pm-audit-v3.md](./pm-audit-v3.md) | Resource model validated; v1.4 Phase 0 close-outs required |
| **v1.4** | Schedule quality | 5.5 → 6.0 (shipped 2026-05-25) | DCMA assessment, health score, logic validation |
| **v1.5** | Multi-baseline & change | 6.0 → **6.7** (target 6.8) ✅ | Multiple baselines, change orders, variance trends |
| | **⚖ PM Audit Checkpoint 2** | ✅ pass w/ one condition — [pm-audit-v4.md](./pm-audit-v4.md) | Platform coherence verified; v1.6 Phase 0 must close Quality Panel cold-open perf debt |
| **v1.6** | Reporting & analytics | 6.8 → 7.5 | S-curve, EVM, cash flow, executive reports |
| **v1.7** | WBS deepening | 7.5 → 8.0 | Standard WBS coding, roll-ups, hierarchy validation |
| **v1.8** | Calendar & delays | 8.0 → 8.5 | Project calendar, delay tracking, excusable classification |
| | **⚖ PM Audit Checkpoint 3** | | Validate single-user maturity before cloud investment |
| **v1.9** | Data integration | 8.5 → 9.0 | P6/MPP import/export, Procore integration |
| **v2.0** | Collaboration | 9.0 → 9.5 | Cloud sync, multi-user, audit trail, comments |
| | **⚖ PM Audit Checkpoint 4** | | Validate instrument feel survived cloud transition |
| **v2.1** | Portfolio view | 9.5 → 9.8 | Multi-project dashboard, cross-project resources |
| **v2.2** | 10/10 polish | 9.8 → 10.0 | Density modes, saved views, bulk edit, offline mode |
| | **⚖ PM Audit Checkpoint 5 (Final)** | | Full assessment against 10/10 vision |

**Total journey: 3.6/10 → 10/10 across 10 versions after v1.2, with 5 PM audit checkpoints at strategic inflection points.**

Each version is a complete, shippable product. None of them are "beta" or "preview." When v1.3 ships, the tool is genuinely better at scheduling than it was at v1.2 — not because it has more features, but because it has the one feature (resources) that turns a timeline into a plan.

Each audit checkpoint is a go/no-go decision point. If the audit fails, the next version does not start until the identified gaps are closed. This prevents the compounding of bad decisions across versions.

That is the philosophy. One organ at a time. Each one vital. Each one tested against the standard: "Does this make a construction PM's job easier?" If the answer is no, it doesn't ship.
