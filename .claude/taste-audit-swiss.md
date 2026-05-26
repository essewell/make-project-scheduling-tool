# Taste Audit — MAKE Scheduling Tool

> **✅ COMPLETE — all 12 items applied.**
> Items 1–8 (the safe-to-apply batch) shipped with v1.0 (2026-05-21).
> Items 9–12 (deferred for side-by-side review) shipped in v1.1 Phase 6 (2026-05-21). See `plan-v1.1.md §13` for the specific commits.
> The deeper structural items in the "Out of scope" section below remain reference material for v1.2 visual refinement. **Do not re-apply items 1–12.** Use this file only as historical reference for the Swiss discipline applied to v1.0/v1.1.

---

**Lens:** Swiss System (International Typographic Style)
**Dials:** `DESIGN_VARIANCE: 4` · `MOTION_INTENSITY: 1` · `VISUAL_DENSITY: 5`
**Scope:** Post-v1.0 refinement. Locked tokens. No persistence changes. No new dependencies.
**Date:** 2026-05-20

---

## Premise

The app is already Swiss-adjacent. It uses a grid layout, monospace numerals for data, a single accent color, restrained motion, and a rational 8px spacing scale. This audit doesn't redesign the system — it tightens what's already there.

Swiss design asks three questions: *Is the grid felt? Is the type doing the work? Does every element earn its place?* The recommendations below target moments where the answer slips.

---

## What's already right (preserve)

These choices are working — do not change them:

- **Single accent color** — cyan `--accent` is used surgically (today line, focus ring, primary CTA, slider fill). No purple-blue gradients, no decorative neon.
- **Mono numerals for data** — WBS, dates, float days, and zoom labels all use `--font-mono`. Numbers stay aligned across rows.
- **Section titles** ([SidePanel.tsx:53-60](src/components/panels/SidePanel.tsx#L53-L60)) — uppercase, 0.06em tracking, semibold, `--text-2xs`. Textbook Swiss eyebrow.
- **Rational type scale** — 11/12/13/14/16/19 climbs cleanly. Headlines are exact, not arbitrary.
- **Group color as 3px left rail** — a structural cue, not decorative. Reads as a system, not a sticker.
- **Motion budget** — `--transition-fast: 120ms` and `--transition: 200ms`. No wobble springs, no magnetic hovers.
- **Status badges, party pills** — small, monochromatic-leaning, no shadows. Restrained.

---

## Recommendations

Each item has: **Severity** (Critical / Recommended / Nice-to-have), **Risk** (Low / Medium / High), **Files**, and a one-line rationale.

### 1. Tabular numerals on all numeric inputs and percentage displays
- **Severity:** Recommended · **Risk:** Low
- **Files:** `src/styles/tokens.css` (add utility), `src/components/panels/SidePanel.tsx` (Progress %)
- **Why:** Plus Jakarta Sans renders proportional figures by default. In a scheduling tool, every number that changes (a percent ticking from 71→72) should slot into a fixed-width column. Add `font-variant-numeric: tabular-nums` to numeric `<input type="number">`.

### 2. Add `--text-3xs: 10px` token; replace hardcoded `fontSize: 10` in TaskList
- **Severity:** Recommended · **Risk:** Low
- **Files:** [src/styles/tokens.css](src/styles/tokens.css), [src/components/task-list/TaskList.tsx:293, 301, 319](src/components/task-list/TaskList.tsx#L293)
- **Why:** Task list dates and float use raw `fontSize: 10` — the only places in the app that escape the type-scale token. Swiss systems make the scale visible by *only* using it. Adding `--text-3xs` ratifies the existing usage instead of leaking magic numbers.

### 3. Remove `backdrop-filter: blur(3px)` from modal overlay
- **Severity:** Recommended · **Risk:** Low
- **File:** [src/styles/app.css:94-103](src/styles/app.css#L94-L103)
- **Why:** Swiss SKILL line 186: *"Keep surfaces flat and exact; no blur, no plush depth, no decorative haze."* The 54%-opacity tint already provides separation. The 3px blur adds GPU cost on modal open with no readability benefit, and it's the only luxe-haze gesture in the codebase. Removing it strengthens the system's discipline.

### 4. Lift "Autosaves" hint from `--color-text-dim` to `--color-text-tertiary`
- **Severity:** Critical · **Risk:** Low
- **File:** [src/components/panels/SidePanel.tsx:481](src/components/panels/SidePanel.tsx#L481)
- **Why:** Flagged in the v1.0 PR review — `#a6bcca` on white = **1.9:1**, fails WCAG AA. `--color-text-tertiary` (`#7894a6`) gives **3.5:1** — borderline for body but acceptable for an 11px hint. Swiss demands the text be readable; if it isn't, remove it. Lift is the smaller change.

### 5. Align WBS column `minWidth` to a single value
- **Severity:** Nice-to-have · **Risk:** Low
- **Files:** [TaskList.tsx:115](src/components/task-list/TaskList.tsx#L115) (group: 18), [TaskList.tsx:214](src/components/task-list/TaskList.tsx#L214) (task: 22)
- **Why:** Group rows reserve 18px, task rows 22px. The mono WBS slug ("1" vs "1.3") needs ~22px to stay non-shifty when the count climbs to two digits. Pick a single value (24px) for both. Tiny visual rhythm fix.

### 6. Add explicit label to Reset button
- **Severity:** Nice-to-have · **Risk:** Low
- **File:** [TopBar.tsx:175-181](src/components/topbar/TopBar.tsx#L175-L181)
- **Why:** `↺` alone with a tooltip violates Swiss SKILL line 82: *"Primary CTAs must say what happens next, not hide behind vague text."* The icon is destructive (clears project). `↺ Reset` text makes intent obvious.

### 7. Promote `aria-label` on the progress slider
- **Severity:** Critical · **Risk:** Low
- **File:** [SidePanel.tsx:241-253](src/components/panels/SidePanel.tsx#L241-L253)
- **Why:** Carried over from the v1.0 PR review. The number input above is labeled "Progress %", but the range slider has no programmatic association — screen readers announce a bare "slider". One-line fix.

### 8. Firefox slider thumb to 14×14 for engine parity
- **Severity:** Nice-to-have · **Risk:** Low
- **File:** [src/styles/app.css:247-249](src/styles/app.css#L247-L249)
- **Why:** WebKit thumb is 14px, Firefox is 10px. Two different visual languages for the same control.

### 9. Reduce TopBar divider count
- **Severity:** Recommended · **Risk:** Medium
- **File:** [src/components/topbar/TopBar.tsx](src/components/topbar/TopBar.tsx)
- **Why:** The toolbar has **5 dividers** between 7 groups: zoom · baselines · settings · data · CP/reset · new-task. That's a wall every ~120px. Swiss layout uses **spacing as the divider**. Replace dividers with a wider gap (`gap: 16-20` between groups), keep at most two dividers (one before the primary CTA, one separating destructive `↺ Reset`). The toolbar will breathe and the New Task button will gain visual primacy.
- **Defer reason:** Visual-rhythm change — wants a side-by-side comparison before/after, not a same-session apply.

### 10. Demote the Print button to standard ghost
- **Severity:** Recommended · **Risk:** Medium
- **File:** [TopBar.tsx:149-154](src/components/topbar/TopBar.tsx#L149-L154)
- **Why:** Print currently has `background: rgba(255,255,255,0.12)` and a stronger border — a half-promotion. Either it's a primary action (it isn't — New Task is) or it's a utility (then it should match Import/Export visually). The half-state competes with the real CTA and reads as design noise.
- **Defer reason:** Visual hierarchy decision — ask first.

### 11. Replace `party.color + '22'` hex8 with `color-mix`
- **Severity:** Nice-to-have · **Risk:** Medium
- **File:** [TaskList.tsx:270-271](src/components/task-list/TaskList.tsx#L270-L271)
- **Why:** The party pill is the only place in the app concatenating raw hex strings with alpha suffixes. Replace with `background: color-mix(in srgb, ${party.color} 13%, transparent)`. Cleaner system; same render result; works in dark mode without manual mapping.
- **Defer reason:** Touches dynamic inline style — wants its own smoke test.

### 12. Header tier weight differentiation
- **Severity:** Nice-to-have · **Risk:** Medium
- **File:** [src/components/gantt/GanttHeader.tsx](src/components/gantt/GanttHeader.tsx)
- **Why:** Both header tiers use `--text-2xs`. Swiss would give the primary tier (months/quarters) a slightly heavier weight or a `--color-surface-2` background tone — the way a magazine header differs from a caption. Subtle hierarchy without adding a third visual element.
- **Defer reason:** Touches the most-scanned chrome in the product; A/B intuition needed.

---

## Out of scope (structural — defer to v1.1 or later)

- Task list virtualization (already deferred)
- Group color treatment swap (rail vs. eyebrow label)
- Bento/card system in the side panel (Swiss prefers inline rules over wrappers)
- Top-bar navigation re-architecture (consider a left sidebar for settings/data on wider viewports)
- Print preview Swiss-grade pass — A3 layout polish
- Light-mode-only "presentation mode" for board reviews

---

## Apply plan (low-risk batch, this session)

Eight items fall into the safe-to-apply set: **1, 2, 3, 4, 5, 6, 7, 8**. All are additive or strictly contained, no behavior changes, no schema impact.

Items **9–12** wait for explicit go.

---

## Closing note

The app's identity is already correct: it sells precision through restraint. The improvements above are about removing the last few moments where the system blinks — a stray hex, a missing label, a blur where there should be a clean line. Swiss design rewards finishing.
