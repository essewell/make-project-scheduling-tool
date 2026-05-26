# Changelog

All notable changes to this project are documented in this file.

## [0.7.0] - 2026-05-26

### Added
- Persistent WBS and hierarchy deepening:
  - `Task.wbsCode` and `Group.wbsCode` persisted in schema v4.
  - `Group.parentId` support with parent-picker controls and cycle-prevention in GroupsManager.
  - Tree-ordered TaskList rendering with depth indentation and connector rule.
  - Group rollup summaries (tasks, completion, cost, resource count) on group rows.
- DCMA quality expansion:
  - Check 15: WBS Completeness.
  - Check 16: Resource Over-Allocation.
  - Quality panel copy updated to 16-check mode and failing-first workflow.
- Cost-tracking completion:
  - SidePanel actual-cost section with blur-save numeric validation and assignment-aware advisory state.
  - EVM now surfaces PV/EV/AC/SPI/CPI and removes v1.6 AC/CPI deferral messaging.
  - Executive summary preview now includes CPI alongside SPI.
- CSV surface expansion:
  - Task CSV export includes `WBS Code` and `Actual Cost` columns.
  - Task CSV import supports mapping/parsing for WBS and actual cost values.
- Expanded E2E coverage for v1.7 surfaces (WBS hierarchy, CSV WBS/AC roundtrip, AC/EVM, DCMA 15/16, EVM, executive report, a11y/overflow paths).

### Changed
- Unit test runner hardened to prevent recurring worker-hang issues by running per-file Vitest execution via `scripts/run-unit-tests.mjs`.
- Example data and new-task seed paths aligned with schema v4 strict typing defaults (`wbsCode`, `actualCost`, group hierarchy fields).

## [0.6.0] - 2026-05-26

### Added
- Reporting & analytics foundation:
  - Reports modal with five report modes (S-curve, EVM, Cash Flow, Executive Summary, Weekly Progress).
  - Pure analytics libraries: `scurve`, `evm`, `cashflow`, `reportData`, `weeklyReport`.
  - S-curve preview and chart with planned vs actual lines and variance summary.
  - EVM preview with PV/EV/SPI and explicit AC/CPI deferral note.
  - Cash-flow preview with stacked monthly category bars.
  - Executive summary preview with six owner-facing sections and report print-mode export path.
  - Weekly progress editor with transient narrative fields and export advisory.
- Audit-v4 carry-over closures:
  - Quality Panel failing-only default with “Show all 14 checks” toggle.
  - Variance trend health-line toggle and health sparkline in score breakdown.
  - Baseline compare change-order chips on slipped rows.
  - A3 Gantt print title now includes `Quality: NN/100`.
- New/extended E2E coverage for reports modal and updated quality/baseline behaviors.

### Changed
- Performance close-out for Quality Panel cold-open path via deferred heavy chart mount and preprocessed baseline snapshot grouping.
- Documentation refresh for v1.6:
  - `CLAUDE.md` active-version/schema/design-decision updates.
  - design-system, onboarding QA, and DCMA docs updated for reporting/quality behavior.

## [0.4.0] - 2026-05-25

### Added
- Schedule quality engine (v1.4):
  - DCMA 14-point assessment with per-check pass/fail, score, and plain-English explanation.
  - Composite health score (0–100) with weighted subscores (logic / resource feasibility / baseline adherence / float distribution / completeness).
  - Logic validation surface (orphan tasks, excessive lag, circular dependency confirmation).
  - Float distribution histogram with banded targets.
  - Quality Panel modal accessible from the StatBar with full assessment.
- StatBar density refinements and a11y verification documented in `docs/statbar-density-v1.4.md`.

### Changed
- Tokens + components extended for quality surfaces with no new hardcoded hex.
- Documentation: design-system + onboarding QA updated for v1.4 quality behaviors.

## [0.5.0] - 2026-05-25

### Added
- Multi-baseline support: capture up to N named baselines, each with reason, author, and date metadata; locked-baseline icon and BaselineMenu overlay for fast switching.
- Baseline comparison modal (side-by-side diff) with A/B baseline selector and slip/added/removed row classification.
- Variance trend chart: per-task finish-variance sparkline history persisted across sessions.
- Change orders manager: modal with expandable change order rows and sidepanel section for tracking scope changes.
- Baseline section in print preview header shows active baseline name and project-level finish variance.
- Extended E2E coverage: variance trend, baseline metadata (reason, author, locked icon, Escape close), BaselineCompareModal axe sweep, ChangeOrderManager axe sweep, BaselineMenu overlay axe sweep.

### Fixed
- `select-name` axe violation in BaselineSelectPair: added `aria-label` to both `<select>` elements.
- `scrollable-region-focusable` axe violation in DcmaFindingsTable: added `tabIndex={0}` to scrollable container.
- Escape key in BaselineMenu now uses `stopPropagation()` on the document handler, preventing the window-level `useKeyboard` hook from also closing the SidePanel.

### Changed
- Design-system doc updated with v1.5 canonical icon additions and token-reuse rationale (no new color tokens needed).
- Onboarding QA doc appended v1.5 capture-baseline-after-import recommendation.
- Removed ephemeral Phase 0 QA scratch scripts accidentally committed to repo.

## [0.3.0] - 2026-05-23

### Added
- Resource foundation: resource pools, per-task assignments, resource histogram, over-allocation surfacing, and cost rollups.
- Resource CSV import/export support (`resources.csv`, `assignments.csv`) with E2E coverage for import, drag leveling, and undo restore flows.
- Print summary cost visibility via per-task cost column and project total footer.

### Changed
- Extended accessibility sweep coverage to include the ResourcesManager modal and assignment-related controls.
- Updated design-system and onboarding QA docs for v1.3 resource behavior and token surface.

## [0.2.0] - 2026-05-22

### Changed
- Visual refinement / de-vibecoded surface (v1.2):
  - Swiss-design discipline applied across all surfaces (typography hierarchy, density, accent restraint).
  - Removed generic AI patterns: gradients, KPI tile spam, low-contrast gray-on-gray layouts, decorative card chrome.
  - Token consolidation in `src/styles/tokens.css` with dark-mode parity overrides.
  - TopBar hierarchy refinement; party tint behavior; Gantt header tier distinction tightened.
- Documentation refresh for v1.2 visual posture.

## [0.1.0] - 2026-05-22

### Added
- Expanded end-to-end coverage across create-task, CSV import, baseline, keyboard, mobile sheet, accessibility, and onboarding flows.
- Accessibility audit documentation with contrast evidence and keyboard walkthrough notes.
- Onboarding QA documentation and executable onboarding regression spec.
- Marketing deployment documentation and social metadata assets.

### Changed
- Hardened dark-mode and contrast behavior across tokens and Gantt/filter overlays using theme-driven color tokens and `color-mix(...)`.
- Improved modal and wizard accessibility semantics, focus handling, and live region behavior.
- Completed Swiss audit deferred UI refinements (TopBar hierarchy/divider tuning, party tint behavior, Gantt header tier distinction).
- Finalized marketing page metadata/copy polish and social sharing setup.

## [0.0.1] - 2026-05-21

### Added
- v1.0 production baseline with core scheduling UI, baseline capture, dependency links, onboarding, local persistence, and marketing entry scaffold.
