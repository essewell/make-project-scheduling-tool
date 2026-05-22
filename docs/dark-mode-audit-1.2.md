# Dark Mode Audit — v1.2

## Summary

This audit captures the primary product surfaces in dark mode and evaluates visual quality, contrast, hierarchy, and UI clarity. The screenshots live in `docs/v1.2-screenshots/dark-mode/`.

## Methodology

- Environment: `npm run dev` on `http://127.0.0.1:5173`
- Browser: local Playwright page with `page.emulateMedia({ colorScheme: 'dark' })`
- Surfaces captured:
  1. Blank slate (project setup)
  2. App with example tasks loaded
  3. Side panel open (task selected)
  4. Modal open (`Manage Parties`)
  5. Filter bar with active filters
  6. Marketing page

## Findings

### 1. Blank slate

- Screenshot: `v1.2-screenshots/dark-mode/blank-slate.png`
- Verdict: PASS
- Notes:
  - Heading and hero copy have strong contrast against the dark background.
  - The primary CTA buttons are clearly visible and maintain good contrast in dark mode.
  - The page uses a restrained, readable dark palette without over-saturating the background.

### 2. App with tasks loaded

- Screenshot: `v1.2-screenshots/dark-mode/app-with-tasks.png`
- Verdict: PASS
- Notes:
  - Task rows and Gantt surfaces are legible.
  - The task list and timeline remain distinct with sufficient contrast.
  - Status chips and party badges are visible, though the cyan accent is relatively subtle. This is acceptable for the intended instrument UI.

### 3. Side panel open

- Screenshot: `v1.2-screenshots/dark-mode/sidepanel-task-selected.png`
- Verdict: PASS
- Notes:
  - Form fields and labels maintain sufficient contrast in dark mode.
  - The side panel overlay is clearly separated from the underlying content.
  - Task metadata sections remain easy to scan.

### 4. Modal open (`Manage Parties`)

- Screenshot: `v1.2-screenshots/dark-mode/modal-open.png`
- Verdict: PASS
- Notes:
  - The modal surface stands out without feeling too bright.
  - Input fields and buttons are readable and distinct.
  - The close/Cancel actions are visible and accessible.

### 5. Filter bar with active filters

- Screenshot: `v1.2-screenshots/dark-mode/filterbar-active.png`
- Verdict: PASS
- Notes:
  - Active filter chips are clearly indicated.
  - The `Clear filters` action is visible and the filtered task count is easy to read.
  - The dark mode state preserves the overall instrument UI without losing control affordances.

### 6. Marketing page

- Screenshot: `v1.2-screenshots/dark-mode/marketing-page.png`
- Verdict: PASS
- Notes:
  - The hero section is readable in dark mode and the image treatment remains strong.
  - The marketing layout holds up in the darker theme, with good separation between sections.
  - The overall page retains the intended premium, restrained tone.

## Overall conclusion

The dark mode surfaces are visually coherent and maintain strong contrast across the main app and marketing page. No blocking dark-mode issues were found during this audit.
