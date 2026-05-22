# Design System — v1.2 Foundation

Date: 2026-05-22

## Scope

This document tracks v1.2 Phase A foundation work:
- token additions in `src/styles/tokens.css`
- radius scale tightening
- Phosphor icon canonical usage surface

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
- `Check`
- `CircleHalf`
- `Clock`
- `Download`
- `FileArrowUp`
- `Funnel`
- `Minus`
- `Path`
- `Plus`
- `Printer`
- `SquaresFour`
- `UploadSimple`
- `UsersThree`
- `Warning`
- `X`
