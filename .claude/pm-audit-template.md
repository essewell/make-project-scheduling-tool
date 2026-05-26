# PM Audit Template — Senior Project Manager Evaluation

**Purpose:** Standardized template for periodic PM audits of the MAKE Scheduling Tool. Each audit uses this structure so results are comparable across versions.

**When to use:** At each roadmap checkpoint (see `pm-roadmap.md` for checkpoint schedule), or on demand when a major feature ships and needs independent evaluation.

---

## How to Run This Audit

1. **Read the roadmap.** Open `.claude/pm-roadmap.md` and identify which checkpoint you are executing. Note the checkpoint's specific scope questions.
2. **Read the previous audit.** Open the most recent `pm-audit-v*.md` file. Note the previous fitness scores, praise, shame, and recommendations.
3. **Scan the codebase.** Read `AGENTS.md`, `.claude/CLAUDE.md`, and the current active plan (`plan-v*.md`) to understand what has shipped and what is pending.
4. **Run the audit.** Fill in every section below. Do not skip sections. If a section is not applicable, write "N/A — reason."
5. **Score honestly.** The fitness score is not a participation trophy. If the product regressed, score it lower. If it advanced, score it higher. Justify every point change from the previous audit.

---

## Audit Header

```
Audit ID:        pm-audit-v[X]
Date:            YYYY-MM-DD
Auditor:         Senior PM lens
Checkpoint:      [1 / 2 / 3 / 4 / 5 / ad-hoc]
Previous audit:  pm-audit-v[X-1] (score: Y.Y/10)
Versions since:  v[A] → v[B]
Time elapsed:    [X weeks/months since last audit]
```

---

## 1. Executive Summary

**[3–5 sentences. What changed since last audit? What is the product now? What is the single most important finding of this audit?]**

**Previous verdict:** [Quote the previous audit's final verdict in 1 sentence.]

**This verdict:** [Your verdict in 1 sentence.]

**Direction:** ▲ Improved / ◆ Stable / ▼ Regressed

---

## 2. Fitness Score by Dimension

Score each dimension 0–10. Compare to previous audit scores. Explain every change of ≥1 point.

| Dimension | Previous | Current | Δ | Notes |
|-----------|----------|---------|---|-------|
| **Task management** | | | | |
| **Dependency logic** | | | | |
| **Baseline/variance** | | | | |
| **Resource management** | | | | |
| **Cost management** | | | | |
| **Collaboration** | | | | |
| **Reporting** | | | | |
| **Schedule quality** | | | | |
| **Integration** | | | | |
| **Mobile / field** | | | | |
| **WBS / hierarchy** | | | | |
| **Calendar / delays** | | | | |
| **Visual discipline** | | | | |
| **Performance** | | | | |
| **Print output** | | | | |

**Composite score:** [Weighted average — use equal weighting unless checkpoint specifies otherwise.]

**Previous composite:** [X.X/10]
**Current composite:** [Y.Y/10]
**Net change:** [+/- Z.Z]

---

## 3. What Changed Since Last Audit

### 3.1 What Shipped
- [Feature/version] — [1-line description of what it does]
- [Feature/version] — [1-line description]

### 3.2 What Was Deferred or Removed
- [Feature/version] — [reason]

### 3.3 What Broke or Regressed
- [Specific regression] — [impact, severity]

### 3.4 What the Codebase Says vs. What the User Sees
- [Any gap between what the code implements and what the PM actually experiences]

---

## 4. Praise (What Earns Respect)

**[List 3–7 things the product does well. Be specific. Name the feature, explain why it matters to a construction PM, and why it is better than the alternative (P6, MS Project, Excel, or nothing).]**

1. **[Feature/capability]** — [Why it earns respect]
2. ...

---

## 5. Shame (What Deserves Criticism)

**[List 3–7 things the product does poorly or not at all. Be specific. Name the gap, explain the impact on a construction PM's workflow, and what the minimum acceptable solution looks like.]**

1. **[Missing feature / poor implementation]** — [Why it deserves criticism, what the PM needs instead]
2. ...

---

## 6. Checkpoint-Specific Questions

**[Answer the specific questions listed for this checkpoint in the roadmap (`pm-roadmap.md`). Copy the questions from the roadmap and answer each one.]**

**Q1:** [Question from roadmap checkpoint]
**A:** [Your answer]

**Q2:** [Question from roadmap checkpoint]
**A:** [Your answer]

[... continue for all checkpoint questions]

---

## 7. Instrument Feel Assessment

This is the most important qualitative check. The product's identity is a "precision instrument" — not a bloated enterprise platform. Evaluate whether that identity has been preserved.

| Criterion | Pass / Fail | Notes |
|-----------|-------------|-------|
| **Swiss visual discipline maintained?** | | [Any gradients, card spam, or AI tells?] |
| **Keyboard-first operation preserved?** | | [Can a power user work without a mouse?] |
| **Print output still production-grade?** | | [A3 print verified?] |
| **Performance target met?** | | [500 tasks (v1.x) / 2,000 tasks (v2.x) at 55fps?] |
| **No hardcoded hex in components?** | | [All colors via tokens?] |
| **Dense, not decorated?** | | [Information density appropriate for construction PM?] |
| **Feels like a tool, not a toy?** | | [Would a 20-year superintendent take it seriously?] |

**Instrument feel verdict:** [Strong / Holding / Slipping / Lost]

---

## 8. Comparison to Prior Audits

### 8.1 Score Trend
```
v0 audit:   [X.X/10]  (if applicable)
v1 audit:   [X.X/10]
v1.3 audit: [X.X/10]  (Checkpoint 1)
v1.5 audit: [X.X/10]  (Checkpoint 2)
v1.8 audit: [X.X/10]  (Checkpoint 3)
v2.0 audit: [X.X/10]  (Checkpoint 4)
v2.2 audit: [X.X/10]  (Checkpoint 5 — Final)
this audit: [X.X/10]
```

### 8.2 Repeated Praise
**[Things praised in multiple consecutive audits — these are the product's core strengths. List them.]**
1. ...

### 8.3 Repeated Shame
**[Things criticized in multiple consecutive audits — these are chronic gaps that keep getting deferred. Flag them as urgent.]**
1. ...

### 8.4 Resolved Items
**[Things criticized in a prior audit that are now fixed. Acknowledge the improvement.]**
1. ...

---

## 9. Decision Gate

**[Answer the decision gate question from the roadmap checkpoint.]**

**Checkpoint question:** [Copy from roadmap]

**Your answer:** [Pass / Conditional Pass / Fail]

**Score threshold:** [e.g., "If below 5.5/10, pause next version."]

**Your score:** [X.X/10]

**Recommendation:** [Proceed to next version / Fix identified gaps before proceeding / Escalate to stakeholder]

---

## 10. Recommendations for Next Version

### 10.1 Must Fix (Blocking)
- [Specific issue] — [Why it blocks the next version]

### 10.2 Should Fix (High Priority)
- [Specific issue] — [Impact if not fixed]

### 10.3 Nice to Have (Low Priority)
- [Specific issue] — [Value add, but not blocking]

### 10.4 Scope Creep Warning
**[Identify any features that are being considered for the next version that do NOT make a construction PM's job easier. Flag them for removal or deferral.]**
- [Feature idea] — [Why it doesn't belong]

---

## 11. Final Verdict

**[3–5 sentences. Honest assessment of where the product stands, whether it is moving in the right direction, and what the single most important thing is to focus on before the next audit.]**

**One-line summary:** [The product is X, needs Y, and should not Z.]

---

## Filing Instructions

1. Save this audit as `.claude/pm-audit-v[X].md` where `[X]` is the next sequential number.
2. Update the score trend table in this audit (Section 8.1) with the new score.
3. Update `.claude/version-status.md`:
   - Add the audit to the PM Audit Index table (file link, date, score).
   - If the audit failed the decision gate, note the failure on the corresponding checkpoint row in the Version Tracker.
4. Update the roadmap (`pm-roadmap.md`) version summary table with the actual fitness score achieved (if different from target).
5. If the audit identified blocking issues, add them to the active plan's Build Changelog as follow-up items.
