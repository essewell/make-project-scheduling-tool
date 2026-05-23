# Changelog

All notable changes to this project are documented in this file.

## [0.3.0] - 2026-05-23

### Added
- Resource foundation: resource pools, per-task assignments, resource histogram, over-allocation surfacing, and cost rollups.
- Resource CSV import/export support (`resources.csv`, `assignments.csv`) with E2E coverage for import, drag leveling, and undo restore flows.
- Print summary cost visibility via per-task cost column and project total footer.

### Changed
- Extended accessibility sweep coverage to include the ResourcesManager modal and assignment-related controls.
- Updated design-system and onboarding QA docs for v1.3 resource behavior and token surface.

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
