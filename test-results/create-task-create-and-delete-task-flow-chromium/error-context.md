# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: create-task.spec.ts >> create and delete task flow
- Location: tests\e2e\create-task.spec.ts:3:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /delete/i })
    - locator resolved to <button>Delete</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <button>…</button> from <div class="mobile-tab-switcher">…</div> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <button>…</button> from <div class="mobile-tab-switcher">…</div> subtree intercepts pointer events
    - retrying click action
      - waiting 100ms
    55 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <button>…</button> from <div class="mobile-tab-switcher">…</div> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e5]: MAKE
    - generic "Click to rename" [ref=e7]: My Project
    - generic [ref=e8]:
      - button "−" [ref=e9] [cursor=pointer]
      - generic [ref=e10]: Week
      - button "+" [ref=e11] [cursor=pointer]
    - generic [ref=e13]:
      - button "◎ Baselines" [ref=e14] [cursor=pointer]
      - button "⊕" [ref=e15] [cursor=pointer]
    - button "Calendar" [ref=e17] [cursor=pointer]
    - button "Phases" [ref=e18] [cursor=pointer]
    - button "Parties" [ref=e19] [cursor=pointer]
    - button "Import" [ref=e21] [cursor=pointer]
    - button "Export" [ref=e22] [cursor=pointer]
    - button "Print" [ref=e23] [cursor=pointer]
    - button "↺" [ref=e25] [cursor=pointer]
    - button "+ New Task N" [ref=e27] [cursor=pointer]:
      - text: + New Task
      - generic [ref=e28]: "N"
  - generic [ref=e29]:
    - generic [ref=e30]:
      - text: Window
      - generic [ref=e31]: May 20 – May 20
    - generic [ref=e33]:
      - text: Tasks
      - strong [ref=e34]: "1"
    - generic [ref=e36]:
      - generic [ref=e37]: Progress
      - strong [ref=e40]: 100%
  - generic [ref=e41]:
    - textbox "Search tasks…" [ref=e42]
    - generic [ref=e43]:
      - generic [ref=e44]: Status
      - button "Not Started" [ref=e45] [cursor=pointer]
      - button "In Progress" [ref=e46] [cursor=pointer]
      - button "At Risk" [ref=e47] [cursor=pointer]
      - button "Delayed" [ref=e48] [cursor=pointer]
      - button "Complete" [ref=e49] [cursor=pointer]
    - generic [ref=e50]: 1 task
  - generic [ref=e51]:
    - generic [ref=e52]:
      - generic [ref=e53]:
        - generic [ref=e54]: Task
        - generic [ref=e55]: Party
        - generic [ref=e56]: Dates
        - generic [ref=e57]: Float
      - generic [ref=e58]:
        - generic [ref=e60] [cursor=pointer]:
          - img [ref=e61]
          - generic [ref=e63]: "1"
          - generic [ref=e64]: (1)
        - generic [ref=e65] [cursor=pointer]:
          - generic [ref=e66]:
            - generic [ref=e67]: "1.1"
            - generic [ref=e68]: New Task
            - generic [ref=e69]: Complete
          - generic [ref=e70]:
            - generic [ref=e71]: May 20
            - generic [ref=e72]: May 20
        - button "+ New Task" [ref=e74] [cursor=pointer]
    - generic [ref=e75]:
      - generic [ref=e77]:
        - generic:
          - generic:
            - generic:
              - generic: May 2026
            - generic:
              - generic: Jun 2026
          - generic:
            - generic:
              - generic: "6"
            - generic:
              - generic: "7"
            - generic:
              - generic: "8"
            - generic:
              - generic: "9"
            - generic:
              - generic: "10"
            - generic:
              - generic: "11"
            - generic:
              - generic: "12"
            - generic:
              - generic: "13"
            - generic:
              - generic: "14"
            - generic:
              - generic: "15"
            - generic:
              - generic: "16"
            - generic:
              - generic: "17"
            - generic:
              - generic: "18"
            - generic:
              - generic: "19"
            - generic:
              - generic: "20"
            - generic:
              - generic: "21"
            - generic:
              - generic: "22"
            - generic:
              - generic: "23"
            - generic:
              - generic: "24"
            - generic:
              - generic: "25"
            - generic:
              - generic: "26"
            - generic:
              - generic: "27"
            - generic:
              - generic: "28"
            - generic:
              - generic: "29"
            - generic:
              - generic: "30"
            - generic:
              - generic: "31"
            - generic:
              - generic: "1"
            - generic:
              - generic: "2"
            - generic:
              - generic: "3"
            - generic:
              - generic: "4"
            - generic:
              - generic: "5"
            - generic:
              - generic: "6"
            - generic:
              - generic: "7"
            - generic:
              - generic: "8"
            - generic:
              - generic: "9"
            - generic:
              - generic: "10"
        - generic:
          - generic: Wed, May 20
        - generic "New Task" [ref=e79]
      - generic [ref=e82]:
        - button "−" [ref=e83] [cursor=pointer]
        - generic [ref=e84]: Week
        - button "+" [ref=e85] [cursor=pointer]
    - generic [ref=e86]:
      - generic [ref=e87]:
        - textbox [ref=e88]: New Task
        - button "×" [ref=e89] [cursor=pointer]
      - generic [ref=e90]:
        - generic [ref=e91]:
          - generic [ref=e92]: Status & Progress
          - generic [ref=e93]:
            - generic [ref=e94]:
              - generic [ref=e95]: Status
              - combobox [ref=e96] [cursor=pointer]:
                - option "Not Started"
                - option "In Progress"
                - option "At Risk"
                - option "Delayed"
                - option "Complete" [selected]
            - generic [ref=e97]:
              - generic [ref=e98]: Progress %
              - spinbutton [ref=e99]: "100"
        - generic [ref=e102]:
          - generic [ref=e103]: Planned Dates
          - generic [ref=e104]:
            - generic [ref=e105]:
              - generic [ref=e106]: Start
              - textbox [ref=e107]: 2026-05-20
            - generic [ref=e108]:
              - generic [ref=e109]: End
              - textbox [ref=e110]: 2026-05-20
          - generic [ref=e111]:
            - generic [ref=e112]:
              - generic [ref=e113]: Duration
              - generic [ref=e114]: 1d
            - generic [ref=e115]:
              - generic [ref=e116]: Workdays
              - generic [ref=e117]: 1d
        - generic [ref=e118]:
          - generic [ref=e119]:
            - generic [ref=e120]: Responsible Party
            - combobox [ref=e121] [cursor=pointer]:
              - option "— None —" [selected]
          - generic [ref=e122]:
            - generic [ref=e123]: Phase
            - combobox [ref=e124] [cursor=pointer]
        - generic [ref=e125] [cursor=pointer]:
          - checkbox "Milestone" [ref=e126]
          - generic [ref=e127]: Milestone
        - generic [ref=e128]:
          - generic [ref=e129]: Task Notes
          - textbox "Add notes about this task..." [ref=e130]
        - generic [ref=e131]:
          - generic [ref=e132]: Actual Dates
          - generic [ref=e133]:
            - generic [ref=e134]:
              - generic [ref=e135]: Actual Start
              - textbox [ref=e136]
            - generic [ref=e137]:
              - generic [ref=e138]: Actual Finish
              - textbox [ref=e139]
        - generic [ref=e140]:
          - generic [ref=e141]: Dependencies
          - generic [ref=e142]: No predecessors set
        - generic [ref=e143]:
          - generic [ref=e144]: Log
          - textbox "Add log entry (Ctrl+Enter to save)..." [ref=e145]
      - generic [ref=e146]:
        - button "Delete" [ref=e147] [cursor=pointer]
        - button "Links" [ref=e148] [cursor=pointer]
        - generic [ref=e149]: Autosaves
  - generic [ref=e150]:
    - button "☰ Tasks" [ref=e151] [cursor=pointer]:
      - generic [ref=e152]: ☰
      - generic [ref=e153]: Tasks
    - button "▬ Gantt" [ref=e154] [cursor=pointer]:
      - generic [ref=e155]: ▬
      - generic [ref=e156]: Gantt
    - button "◧ Detail" [ref=e157] [cursor=pointer]:
      - generic [ref=e158]: ◧
      - generic [ref=e159]: Detail
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test('create and delete task flow', async ({ page }) => {
  4  |   await page.goto('/')
  5  |   await page.getByRole('button', { name: /start blank/i }).click()
  6  |   // The new task should open the task panel directly.
  7  |   await expect(page.getByRole('button', { name: /delete/i })).toBeVisible()
> 8  |   await page.getByRole('button', { name: /delete/i }).click()
     |                                                       ^ Error: locator.click: Test timeout of 30000ms exceeded.
  9  |   await expect(page.getByText(/undo/i)).toBeVisible()
  10 | })
  11 | 
```