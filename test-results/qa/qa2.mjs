// QA Pass 2 — targeted investigation of suspected issues.
// node test-results/qa/qa2.mjs
import { chromium } from '@playwright/test'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const BASE = 'http://localhost:5173'
const SHOTS = 'test-results/qa/screens2'
mkdirSync(SHOTS, { recursive: true })

const bugs = []
const info = []

function bug(id, severity, title, detail) {
  bugs.push({ id, severity, title, detail })
  console.log(`\n🐛 [${severity}] ${id}: ${title}`)
  if (detail) console.log(`   ${detail}`)
}
function ok(label, msg) {
  info.push({ label, msg })
  console.log(`   ✓ ${label}: ${msg}`)
}
function warn(label, msg) {
  info.push({ label, msg: `WARN: ${msg}` })
  console.log(`   ⚠ ${label}: ${msg}`)
}

const consoleErrors = []
const browser = await chromium.launch({ headless: true })

// ────────── Context: desktop with clean localStorage ──────────
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()) })
page.on('pageerror', e => consoleErrors.push(`UNCAUGHT: ${e.message}`))
await page.goto(BASE)
await page.waitForLoadState('networkidle')

// Load example data
await page.getByRole('button', { name: /load example/i }).click()
await page.waitForTimeout(600)

// ═══════════════════════════════════════════════════════
// BUG-01: Example data missing Dependency[] edges
// ═══════════════════════════════════════════════════════
const state = await page.evaluate(() => JSON.parse(localStorage.getItem('schedule-tool-v1') || 'null'))
const depsLen = state?.dependencies?.length ?? -1
const tasksWithOldDeps = state?.tasks?.filter(t => t.deps?.length > 0).length ?? 0
if (depsLen === 0 && tasksWithOldDeps > 0) {
  bug('BUG-01', 'HIGH', 'Example data loads with 0 Dependency edges',
    `${tasksWithOldDeps} tasks have legacy task.deps[] strings but state.dependencies[] is empty. ` +
    'handleLoadExample never constructs Dependency[] objects from the legacy deps arrays. ' +
    'Result: no arrows in Gantt, no CP button, no dependency preview in side panel.'
  )
} else {
  ok('example-deps', `dependencies=${depsLen}`)
}

// CP button visible check
const cpVisible = await page.locator('button:has-text("CP")').isVisible().catch(() => false)
if (!cpVisible && depsLen === 0) {
  bug('BUG-01b', 'HIGH', 'CP toggle absent — consequence of missing Dependency edges',
    'With 0 dependency edges, hasDeps=false, so the CP toggle is hidden. CPM feature invisible to new users loading example data.')
}

// ═══════════════════════════════════════════════════════
// BUG-02: Zoom buttons — verify actual behaviour
// ═══════════════════════════════════════════════════════
// Read the real zoom label from the DOM
const zoomLabel0 = await page.locator('button[title="Zoom out"] + span, button[title="Zoom out"] ~ span').first().textContent().catch(() => null)
  ?? await page.evaluate(() => {
    const out = document.querySelector('button[title="Zoom out"]')
    const par = out?.parentElement
    const spans = par ? [...par.querySelectorAll('span')] : []
    return spans[0]?.textContent?.trim() ?? null
  })
ok('zoom-initial', `zoom label before click: "${zoomLabel0}"`)

await page.locator('button[title="Zoom in"]').first().click()
await page.waitForTimeout(150)
const zoomLabel1 = await page.evaluate(() => {
  const out = document.querySelector('button[title="Zoom out"]')
  const par = out?.parentElement
  const spans = par ? [...par.querySelectorAll('span')] : []
  return spans[0]?.textContent?.trim() ?? null
})
ok('zoom-after-in', `zoom label after zoom-in: "${zoomLabel1}"`)

if (zoomLabel0 === zoomLabel1) {
  bug('BUG-02', 'MEDIUM', 'Zoom-in button does not change the zoom label',
    `Before: "${zoomLabel0}", After: "${zoomLabel1}". Possible causes: button disabled state (already at max zoom), wrong selector, or React state not updating.`)
  // Check if button is disabled
  const isDisabled = await page.locator('button[title="Zoom in"]').first().isDisabled()
  warn('zoom-in-disabled', `button[title="Zoom in"] disabled=${isDisabled}`)
} else {
  ok('zoom', `zoom changed correctly: "${zoomLabel0}" → "${zoomLabel1}"`)
  // restore
  await page.locator('button[title="Zoom out"]').first().click()
}

// ═══════════════════════════════════════════════════════
// BUG-03: Side panel — click task, verify sections render
// ═══════════════════════════════════════════════════════
// Click the first task row
const taskRowSelector = '[data-testid="task-row"], .task-row, [style*="36px"][style*="grid"]'
// Use the keyboard shortcut to open the panel on first task
await page.keyboard.press('ArrowDown')
await page.waitForTimeout(200)

// Try clicking a visible task cell
await page.locator('[style*="height: 36px"]').first().click({ timeout: 2000 }).catch(async () => {
  await page.locator('[style*="height:36px"]').first().click({ timeout: 2000 }).catch(() => {})
})
await page.waitForTimeout(400)
await page.screenshot({ path: join(SHOTS, 'panel-after-click.png'), fullPage: false })

// Check side panel visible
const panelSections = {
  'Status & Progress': false,
  'Planned Dates': false,
  'Actual Dates': false,
  'Resources': false,
  'Dependencies': false,
  'Log': false,
}
for (const [name] of Object.entries(panelSections)) {
  panelSections[name] = await page.locator(`text="${name}"`).isVisible().catch(() => false)
}
const missingSections = Object.entries(panelSections).filter(([, v]) => !v).map(([k]) => k)
if (missingSections.length > 0) {
  bug('BUG-03', 'MEDIUM', `Side panel: ${missingSections.length} section(s) not visible`,
    `Missing: ${missingSections.join(', ')}. Side panel may not have opened, or section headings differ.`)
} else {
  ok('side-panel', 'All 6 sections visible: Status & Progress, Planned Dates, Actual Dates, Resources, Dependencies, Log')
}
ok('side-panel-detail', JSON.stringify(panelSections))

// ═══════════════════════════════════════════════════════
// BUG-04: Key prop warning — reproduce and identify source
// ═══════════════════════════════════════════════════════
// The migration probe triggers it. Let's try with a fresh page to see if it fires on normal use
const keyPage = await ctx.newPage()
const keyErrors = []
keyPage.on('console', m => {
  if (m.type() === 'warning' && m.text().includes('key')) keyErrors.push(m.text())
})
await keyPage.goto(BASE)
await keyPage.waitForLoadState('networkidle')
await keyPage.getByRole('button', { name: /load example/i }).click()
await keyPage.waitForTimeout(500)
// Click a task row to trigger panel
await keyPage.locator('[style*="height: 36px"]').first().click({ timeout: 2000 }).catch(() => {})
await keyPage.waitForTimeout(400)
if (keyErrors.length > 0) {
  bug('BUG-04', 'MEDIUM', 'React key prop warnings during normal use',
    `${keyErrors.length} key warnings:\n${keyErrors.slice(0, 3).join('\n')}`)
} else {
  ok('key-warnings', 'No key prop warnings during normal use (warning may only fire in migration edge case)')
}

// ═══════════════════════════════════════════════════════
// BUG-05: Gantt bars — verify they render for example data
// ═══════════════════════════════════════════════════════
const ganttBars = await page.locator('[style*="position: absolute"][style*="height: 20px"], [style*="position:absolute"][style*="height:20px"]').count()
ok('gantt-bars', `Gantt bar-like elements count: ${ganttBars}`)
if (ganttBars < 5) {
  bug('BUG-05', 'HIGH', `Very few Gantt bars visible (${ganttBars}), expected ≥16 for example data`,
    'Could indicate Gantt rendering failure or scroll container issue.')
}

// ═══════════════════════════════════════════════════════
// BUG-06: Dependency arrows in Gantt
// ═══════════════════════════════════════════════════════
const svgLines = await page.locator('svg path, svg polyline, svg line').count()
ok('dep-arrows', `SVG path/line elements in Gantt: ${svgLines}`)
if (svgLines === 0) {
  bug('BUG-06', 'HIGH', 'No dependency arrows rendered in Gantt',
    'Zero SVG path/polyline/line elements found. Likely consequence of BUG-01 (0 dependency edges).')
}

// ═══════════════════════════════════════════════════════
// BUG-07: Filter / search interaction
// ═══════════════════════════════════════════════════════
const filterBar = page.locator('input[placeholder*="earch"]').first()
if (await filterBar.isVisible().catch(() => false)) {
  await filterBar.fill('foundation')
  await page.waitForTimeout(200)
  const taskRows = await page.locator('[style*="height: 36px"]').count()
  ok('filter-search', `Rows visible after "foundation" filter: ${taskRows}`)
  await filterBar.fill('')
  await page.waitForTimeout(100)
} else {
  bug('BUG-07', 'LOW', 'Search/filter input not found',
    'No input[placeholder*="earch"] visible on main app page.')
}

// ═══════════════════════════════════════════════════════
// BUG-08: Resources modal content
// ═══════════════════════════════════════════════════════
await page.locator('button:has-text("Resources")').first().click()
await page.waitForTimeout(300)
await page.screenshot({ path: join(SHOTS, 'resources-modal.png'), fullPage: true })
const resourcesModal = await page.locator('[role="dialog"], [style*="z-index"]').first().isVisible().catch(() => false)
ok('resources-modal', `Resources modal visible: ${resourcesModal}`)
const resourceModalText = await page.evaluate(() => document.body.innerText)
const hasAddResource = resourceModalText.includes('Add') || resourceModalText.includes('resource') || resourceModalText.includes('Resource')
ok('resources-modal-content', `Has resource-related content: ${hasAddResource}`)
await page.keyboard.press('Escape')
await page.waitForTimeout(200)

// ═══════════════════════════════════════════════════════
// BUG-09: Undo — delete a task then undo
// ═══════════════════════════════════════════════════════
const beforeDelete = (await page.evaluate(() => JSON.parse(localStorage.getItem('schedule-tool-v1') || '{}')))?.tasks?.length ?? 0

// Click first task row, open panel, click Delete
await page.locator('[style*="height: 36px"]').first().click({ timeout: 2000 }).catch(() => {})
await page.waitForTimeout(300)
// Find delete button in panel
const deleteBtn = page.locator('button.btn-delete, button:has-text("Delete")').first()
if (await deleteBtn.isVisible().catch(() => false)) {
  await deleteBtn.click()
  await page.waitForTimeout(200)
  // Confirm dialog if it appears
  const confirmBtn = page.locator('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Delete task")').first()
  if (await confirmBtn.isVisible({ timeout: 500 }).catch(() => false)) {
    await confirmBtn.click()
    await page.waitForTimeout(200)
  }
  const afterDelete = (await page.evaluate(() => JSON.parse(localStorage.getItem('schedule-tool-v1') || '{}')))?.tasks?.length ?? 0

  if (afterDelete >= beforeDelete) {
    bug('BUG-09a', 'MEDIUM', 'Task delete did not reduce task count',
      `Before: ${beforeDelete}, After: ${afterDelete}`)
  } else {
    ok('delete-task', `Task deleted: ${beforeDelete} → ${afterDelete}`)

    // Undo
    await page.keyboard.press('Control+z')
    await page.waitForTimeout(300)
    const afterUndo = (await page.evaluate(() => JSON.parse(localStorage.getItem('schedule-tool-v1') || '{}')))?.tasks?.length ?? 0
    if (afterUndo !== beforeDelete) {
      bug('BUG-09b', 'HIGH', 'Undo did not restore deleted task',
        `After undo: ${afterUndo}, expected: ${beforeDelete}`)
    } else {
      ok('undo-delete', `Undo restored task: ${afterDelete} → ${afterUndo}`)
    }
  }
} else {
  warn('delete-btn', 'Delete button not found in panel — side panel may not have opened')
}
await page.screenshot({ path: join(SHOTS, 'after-undo.png'), fullPage: true })

// ═══════════════════════════════════════════════════════
// BUG-10: Print preview — Gantt and summary modes
// ═══════════════════════════════════════════════════════
await page.locator('button:has-text("Print")').first().click()
await page.waitForTimeout(500)
await page.screenshot({ path: join(SHOTS, 'print-preview.png'), fullPage: true })
const printContent = await page.evaluate(() => document.body.innerText)
const hasPrint = printContent.includes('Print') || printContent.includes('A3') || printContent.includes('Summary')
ok('print-preview', `Print modal opened with relevant content: ${hasPrint}`)

// Check for summary mode toggle
const summaryMode = await page.locator('button:has-text("Summary"), input[value="summary"], label:has-text("Summary")').first().isVisible().catch(() => false)
ok('print-summary-toggle', `Summary mode option visible: ${summaryMode}`)
if (!summaryMode) {
  warn('print', 'No "Summary" toggle found in print preview — may be missing from print modal')
}
await page.keyboard.press('Escape')
await page.waitForTimeout(200)

// ═══════════════════════════════════════════════════════
// BUG-11: Link builder modal (dependency creation UI)
// ═══════════════════════════════════════════════════════
// Open panel, then click Links
await page.locator('[style*="height: 36px"]').first().click({ timeout: 2000 }).catch(() => {})
await page.waitForTimeout(300)
const linksBtn = page.locator('button:has-text("Links")').first()
if (await linksBtn.isVisible().catch(() => false)) {
  await linksBtn.click()
  await page.waitForTimeout(300)
  await page.screenshot({ path: join(SHOTS, 'link-builder.png'), fullPage: true })
  const linkText = await page.evaluate(() => document.body.innerText)
  ok('link-builder', `Link builder modal opened, contains "dependency" or "from": ${linkText.toLowerCase().includes('from') || linkText.toLowerCase().includes('depend')}`)
  await page.keyboard.press('Escape')
} else {
  bug('BUG-11', 'MEDIUM', '"Links" button not visible in side panel footer')
}

// ═══════════════════════════════════════════════════════
// BUG-12: Workweek modal
// ═══════════════════════════════════════════════════════
await page.locator('button:has-text("Calendar")').first().click()
await page.waitForTimeout(300)
await page.screenshot({ path: join(SHOTS, 'workweek-modal.png'), fullPage: true })
const calText = await page.evaluate(() => document.body.innerText)
const hasWorkdays = calText.includes('Mon') || calText.includes('Workweek') || calText.includes('Holiday')
ok('workweek-modal', `Calendar/workweek modal opened with expected content: ${hasWorkdays}`)
await page.keyboard.press('Escape')

// ═══════════════════════════════════════════════════════
// BUG-13: Mobile tab switcher
// ═══════════════════════════════════════════════════════
const mobileCtx = await browser.newContext({ viewport: { width: 375, height: 812 } })
const mobPage = await mobileCtx.newPage()
const mobErrors = []
mobPage.on('console', m => { if (m.type() === 'error') mobErrors.push(m.text()) })
mobPage.on('pageerror', e => mobErrors.push(e.message))
await mobPage.goto(BASE)
await mobPage.waitForLoadState('networkidle')
await mobPage.getByRole('button', { name: /load example/i }).click().catch(() => {})
await mobPage.waitForTimeout(400)
await mobPage.screenshot({ path: join(SHOTS, 'mobile-loaded.png'), fullPage: true })

// Check for tab switcher (List/Gantt tabs)
const tabList = await mobPage.locator('[role="tab"], button:has-text("List"), button:has-text("Gantt")').count()
ok('mobile-tabs', `Mobile tab elements found: ${tabList}`)
if (tabList === 0) {
  warn('mobile-tabs', 'No List/Gantt tab switcher found on mobile — may be hidden or label differs')
}

// Try tapping a task row
const mobRows = await mobPage.locator('[style*="height: 36px"]').count()
ok('mobile-rows', `Task rows on mobile: ${mobRows}`)
if (mobRows > 0) {
  await mobPage.locator('[style*="height: 36px"]').first().tap().catch(() => {})
  await mobPage.waitForTimeout(500)
  await mobPage.screenshot({ path: join(SHOTS, 'mobile-sheet-open.png'), fullPage: true })
  const sheetVisible = await mobPage.locator('[style*="85vh"], [style*="40vh"], [class*="sheet"]').isVisible().catch(() => false)
  ok('mobile-sheet', `Bottom sheet visible after tap: ${sheetVisible}`)
  if (!sheetVisible) {
    bug('BUG-13', 'MEDIUM', 'Mobile bottom sheet not visible after tapping task row',
      'Sheet with 40vh/85vh height not found after tap. May need more specific selector or gesture.')
  }
}

if (mobErrors.length > 0) {
  bug('BUG-13e', 'HIGH', `${mobErrors.length} console errors on mobile`, mobErrors.join('\n'))
}

// ═══════════════════════════════════════════════════════
// BUG-14: Dark mode — check for hardcoded colors / visual regression
// ═══════════════════════════════════════════════════════
const darkCtx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' })
const darkPage = await darkCtx.newPage()
const darkErrors = []
darkPage.on('console', m => { if (m.type() === 'error') darkErrors.push(m.text()) })
await darkPage.goto(BASE)
await darkPage.waitForLoadState('networkidle')
await darkPage.getByRole('button', { name: /load example/i }).click()
await darkPage.waitForTimeout(400)
await darkPage.screenshot({ path: join(SHOTS, 'dark-mode.png'), fullPage: true })
ok('dark-mode', `Dark mode renders without errors: ${darkErrors.length === 0}`)
if (darkErrors.length > 0) {
  bug('BUG-14', 'MEDIUM', `${darkErrors.length} errors in dark mode`, darkErrors.join('\n'))
}

// Check body background is not white in dark mode (naive check via computed style)
const darkBg = await darkPage.evaluate(() => getComputedStyle(document.body).backgroundColor)
ok('dark-mode-bg', `Dark mode body background: ${darkBg}`)
if (darkBg === 'rgb(255, 255, 255)') {
  bug('BUG-14b', 'MEDIUM', 'Body background is white in dark mode — dark theme tokens may not be applied')
}

// ═══════════════════════════════════════════════════════
// BUG-15: StatBar density — check what's visible
// ═══════════════════════════════════════════════════════
const statBarText = await page.evaluate(() => document.querySelector('.stat-bar')?.innerText ?? null)
ok('stat-bar-content', `StatBar text: ${statBarText?.replace(/\n/g, ' | ')}`)

// ═══════════════════════════════════════════════════════
// BUG-16: TaskList key prop — check ResourceAssignmentSection
// ═══════════════════════════════════════════════════════
// Re-check: the key warning in migration test only — is it from ResAssignment render?
// Seed legacy state, reload, check for key warnings
const keyPage2 = await ctx.newPage()
const keyWarnings2 = []
keyPage2.on('console', m => {
  if ((m.type() === 'warning' || m.type() === 'error') && m.text().includes('key')) {
    keyWarnings2.push({ type: m.type(), text: m.text() })
  }
})
await keyPage2.goto(BASE)
await keyPage2.evaluate(() => {
  localStorage.setItem('schedule-tool-v1', JSON.stringify({
    projectName: 'Migration Test',
    tasks: [{ id: 't1', name: 'Old task', s: '2026-01-01', e: '2026-01-10', deps: [], group: 'g1', party: null, notes: '', milestone: false, manualStatus: false, manualPct: false, pct: 0, status: 'not_started', actualStart: null, actualFinish: null }],
    groups: [{ id: 'g1', name: 'Phase 1', color: '#1c3048' }],
    parties: [], notes: [], collapsedGroups: [], baselines: [],
    workweek: { mon:true, tue:true, wed:true, thu:true, fri:true, sat:false, sun:false },
    holidays: [],
    onboardingPhase: 'complete', ghostStyle: 'stripe',
    dependencies: [], resources: [], assignments: [],
  }))
})
await keyPage2.reload()
await keyPage2.waitForLoadState('networkidle')
await keyPage2.waitForTimeout(500)
if (keyWarnings2.length > 0) {
  bug('BUG-16', 'MEDIUM', `React key prop warning reproducible: ${keyWarnings2.length} warnings`,
    keyWarnings2.map(w => w.text.slice(0, 200)).join('\n'))
} else {
  ok('key-prop', 'No key prop warnings with valid migrated state — warning may only fire in edge cases')
}

// ════════════════════════════════════════════════════
// All console errors from main page
// ════════════════════════════════════════════════════
if (consoleErrors.length > 0) {
  bug('BUG-00', 'HIGH', `${consoleErrors.length} console errors on main page`, consoleErrors.join('\n'))
} else {
  ok('console', 'No console errors on main page')
}

await browser.close()

// ════════════════════════════════════════════════════
// Report
// ════════════════════════════════════════════════════
console.log('\n\n══════════════════════════════════════════')
console.log('QA PASS 2 — FINAL BUG LIST')
console.log('══════════════════════════════════════════')
const sev = { HIGH: [], MEDIUM: [], LOW: [] }
for (const b of bugs) (sev[b.severity] ?? []).push(b)
for (const [level, list] of Object.entries(sev)) {
  if (list.length) {
    console.log(`\n${level} (${list.length}):`)
    list.forEach(b => console.log(`  • [${b.id}] ${b.title}`))
  }
}
console.log(`\nINFO entries: ${info.length}`)
console.log('Screenshots → test-results/qa/screens2/')

writeFileSync('test-results/qa/bugs2.json', JSON.stringify({ bugs, info }, null, 2))
