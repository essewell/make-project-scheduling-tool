# Design System — v1.3 Foundation

Date: 2026-05-22

## Scope

This document tracks foundation token and icon conventions through v1.3:
- token additions in `src/styles/tokens.css`
- radius scale tightening
- Phosphor icon canonical usage surface
- resource histogram tokenization
- resource color-cycle policy

## Token Additions

Added in light + dark mode:
- Surface ladder: `--surface-sunken`, `--surface-raised`, `--surface-overlay`
- Brand tints/text-on-brand: `--brand-tint-1`, `--brand-tint-2`, `--brand-on-brand`, `--brand-on-brand-dim`
- Accent variants: `--accent-on-brand`, `--accent-pressed`
- Data semantics: `--data-positive`, `--data-negative`, `--data-caution`, `--data-neutral`, `--data-info`
- Ink ladder: `--ink-strong`, `--ink-primary`, `--ink-secondary`, `--ink-tertiary`, `--ink-quiet`
- Rule hierarchy: `--rule`, `--rule-soft`, `--rule-strong`
- Phase rails: `--phase-1`, `--phase-2`, `--phase-3`, `--phase-4`, `--phase-5`
- Focus ring tokens: `--ring`, `--ring-offset`
- Histogram tokens: `--histogram-bar-bg`, `--histogram-capacity-line`, `--histogram-over`

## Resource Color Cycle Policy

Resources inherit color assignments from the existing `GROUP_PALETTE` sequence to keep visual semantics stable across the app:
- default assignment follows palette order when creating resources
- explicit resource color edits are allowed and persisted
- CSV imports without a valid `Color` value auto-assign from the same palette

## Radius Scale

v1.2 standardized corner radii:
- `--radius-sm: 2px`
- `--radius: 4px`
- `--radius-lg: 6px`
- `--radius-xl: 8px`

Component radii should reference these tokens. Circle controls continue to use `50%`.

## Icon Library

Installed package:
- `@phosphor-icons/react`

Single source of icon imports:
- `src/lib/icons.ts`

No other file should import directly from `@phosphor-icons/react`.

## Canonical Icon List

Current approved exports in `src/lib/icons.ts`:
- `ArrowCounterClockwise`
- `ArrowLeft`
- `Bookmarks`
- `CalendarBlank`
- `Camera`
- `CaretDown`
- `CaretRight`
- `ChartBar`
- `Check`
- `CircleHalf`
- `Clock`
- `Download`
- `FileArrowUp`
- `FileText`
- `Funnel`
- `GitDiff`
- `Lock`
- `MagnifyingGlass`
- `Minus`
- `Path`
- `Plus`
- `Printer`
- `ShieldCheck`
- `SquaresFour`
- `UploadSimple`
- `Users`
- `UsersThree`
- `Warning`
- `WarningCircle`
- `X`

## v1.5 Token Notes

v1.5 (multi-baseline & change management) adds no new color tokens. The plan called for `--variance-line-healthy`, `--variance-line-degrading`, `--diff-added`, `--diff-removed`, `--diff-slipped`, and `--baseline-locked-fg`, but implementation reused existing semantic tokens instead:

- Variance trend healthy/degrading line colors → `--health-green` / `--health-amber` (same palette as schedule health)
- Baseline diff section text → existing `--color-text-*` scale
- Baseline locked icon → `--color-text-tertiary` inline

This was the correct decision: new tokens are only introduced when an existing token would be semantically misleading. The health palette maps cleanly to "on track / drifting," so no new token was needed.
