# Onboarding QA — v1.1

Date: 2026-05-22  
Scope: Phase 10.1 / 10.2 onboarding continuity checks

## Coverage

- `tests/e2e/onboarding.spec.ts`
- Flow A: `fresh` -> Start blank -> add to 3 tasks -> baseline tip visible -> Capture baseline -> onboarding `complete`
- Flow B: `fresh` -> Load example data -> onboarding `complete` immediately

## Results

- Baseline tip appears when task count reaches 3 in first-run path.
- Capturing baseline now transitions onboarding to `complete` and dismisses tip.
- Example-data path skips onboarding prompts and lands directly in usable app shell.

## Notes

- This QA pass is executable and repeatable in Playwright.  
- Real touch-device UX remains tracked separately under mobile manual QA.
