# Onboarding QA — v1.3

Date: 2026-05-22  
Scope: Onboarding continuity checks through v1.3 resource foundation

## Coverage

- `tests/e2e/onboarding.spec.ts`
- Flow A: `fresh` -> Start blank -> add to 3 tasks -> baseline tip visible -> Capture baseline -> onboarding `complete`
- Flow B: `fresh` -> Load example data -> onboarding `complete` immediately
- Flow C (v1.3 manual pass): create first resource from `TopBar -> Resources` after blank start, then continue normal task creation path

## Results

- Baseline tip appears when task count reaches 3 in first-run path.
- Capturing baseline now transitions onboarding to `complete` and dismisses tip.
- Example-data path skips onboarding prompts and lands directly in usable app shell.
- Resource creation is available from initial app shell without requiring onboarding completion; no forced onboarding branch for resources.

## Notes

- This QA pass is executable and repeatable in Playwright.  
- Real touch-device UX remains tracked separately under mobile manual QA.
- v1.3 keeps onboarding non-prescriptive for resources (no extra UI nag), consistent with plan guidance.

## v1.5 Recommendation

After CSV import, prompt the PM to capture a baseline before editing dates. Suggested tip location: the same "capture baseline" nudge that fires at 3 tasks, or a one-time inline banner beneath the Baselines button that reads:

> "CSV imported — capture a baseline to track variance from this plan."

The banner should auto-dismiss on first baseline capture and never re-appear (persisted flag). This is not yet implemented; logged here for the v1.6 onboarding pass.
