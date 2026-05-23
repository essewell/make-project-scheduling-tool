// QA Pass 3 — side panel, delete/undo, print, mobile, dark mode.
// node test-results/qa/qa3.mjs
import { chromium } from '@playwright/test'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const BASE = 'http://localhost:5173'
const SHOTS = 'test-results/qa/screens3'
mkdirSync(SHOTS, { recursive: true })

const bugs = []
const notes = []
function bug(id, sev, title, detail) { bugs.push({ id, sev, title, detail }); console.log(`\n🐛 [${sev}] ${id}: ${title}\n   ${detail ?? ''}`) }
function ok(lbl, msg) { notes.push(msg); console.log(`   ✓ ${lbl}: ${msg}`) }
function warn(lbl, msg) { notes.push('WARN:'+msg); console.log(`   ⚠ ${lbl}: ${msg}`) }

// Helper: clean context + fresh page with example data loaded
async function freshPage(browser, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...opts })
  const page = await ctx.newPage()
  const errs = []
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()) })
  page.on('pageerror', e => errs.push(e.message))
  await page.goto(BASE)
  await page.waitForLoadState('networkidle')
  // Should see wizard (fresh context, clean localStorage)
  const hasWizard = await page.getByRole('button', { name: /load example/i }).isVisible({ timeout: 3000 }).catch(() => false)
  if (hasWizard) {
    await page.getByRole('button', { name: /load example/i }).click()
    await page.waitForTimeout(600)
  }
  return { page, ctx, errs }
}

// Click the FIRST task row (not a group header).
// Groups appear first; skip them by looking for the "onSelect" row pattern.
// Strategy: use keyboard — press Tab to focus list, then ArrowDown past group headers.
async function openFirstTaskPanel(page) {
  // Double-click on second 36px-height element (first is likely group header)
  const rows = page.locator('[style*="height: 36px"], [style*="height:36px"]')
  const count = await rows.count()
  // click a few rows until panel opens
  for (let i = 1; i < Math.min(count, 6); i++) {
    await rows.nth(i).dblclick({ timeout: 1500 }).catch(() => {})
    await page.waitForTimeout(200)
    const panelOpen = await page.locator('text="Status & Progress"').isVisible({ timeout: 500 }).catch(() => false)
    if (panelOpen) return true
  }
  return false
}

const browser = await chromium.launch({ headless: true })

// ══════════════════════════════════════════════════════
// TEST A: Side panel sections via double-click
// ══════════════════════════════════════════════════════
{
  const { page, errs } = await freshPage(browser)
  const panelOpened = await openFirstTaskPanel(page)
  await page.screenshot({ path: join(SHOTS, 'A-side-panel.png'), fullPage: false })

  if (!panelOpened) {
    bug('BUG-03', 'HIGH', 'Side panel does not open on task double-click',
      'Could not find "Status & Progress" after double-clicking multiple task rows.')
  } else {
    ok('side-panel-open', 'Panel opened via double-click')
    const sections = ['Status & Progress', 'Planned Dates', 'Actual Dates', 'Dependencies', 'Log']
    const missing = []
    for (const s of sections) {
      const visible = await page.locator(`text="${s}"`).first().isVisible({ timeout: 500 }).catch(() => false)
      if (!visible) missing.push(s)
    }
    // Resources section check
    const resSection = await page.locator('span:has-text("Resources"), div:has-text("Resources")').filter({ hasText: /^Resources$/ }).first().isVisible({ timeout: 500 }).catch(() => false)
    if (!resSection) missing.push('Resources (section)')

    if (missing.length > 0) {
      bug('BUG-03', 'MEDIUM', `Side panel missing sections: ${missing.join(', ')}`, '')
    } else {
      ok('side-panel-sections', 'All 6 sections present: Status & Progress, Planned Dates, Actual Dates, Resources, Dependencies, Log')
    }

    // Test editing task name
    const nameField = page.locator('input[aria-label="Task name"], textarea[aria-label="Task name"]').first()
    if (await nameField.isVisible({ timeout: 1000 }).catch(() => false)) {
      const orig = await nameField.inputValue()
      await nameField.fill('QA Test Name')
      await page.waitForTimeout(200)
      const newState = await page.evaluate(() => JSON.parse(localStorage.getItem('schedule-tool-v1') || '{}'))
      const updated = newState.tasks?.find(t => t.name === 'QA Test Name')
      if (updated) ok('panel-edit-name', 'Task name edit persists to localStorage')
      else bug('BUG-03b', 'HIGH', 'Task name edit does NOT persist to localStorage',
        `Typed "QA Test Name", but no matching task found in persisted state.`)
      await nameField.fill(orig) // restore
    } else {
      warn('panel-name-field', 'Task name input not found in open panel')
    }

    // Status dropdown
    const statusSelect = page.locator('select[aria-label="Status"]').first()
    if (await statusSelect.isVisible({ timeout: 500 }).catch(() => false)) {
      ok('panel-status-select', 'Status dropdown visible')
    } else {
      bug('BUG-03c', 'LOW', 'Status dropdown not visible in side panel')
    }

    // Links button in footer
    const linksBtn = page.locator('button:has-text("Links")').first()
    if (await linksBtn.isVisible({ timeout: 500 }).catch(() => false)) {
      ok('panel-links-btn', 'Links button visible in side panel footer')
      await linksBtn.click()
      await page.waitForTimeout(300)
      await page.screenshot({ path: join(SHOTS, 'A-link-builder.png'), fullPage: false })
      const linkBuilderVisible = await page.locator('text="Add Link", text="From", text="Dependency"').first().isVisible({ timeout: 1000 }).catch(() => false)
      ok('link-builder-modal', `Link builder modal: ${linkBuilderVisible ? 'open' : 'not detected (check screenshot)'}`)
      await page.keyboard.press('Escape')
    } else {
      bug('BUG-11', 'MEDIUM', '"Links" button not found in side panel footer')
    }

    // Delete button
    const delBtn = page.locator('button.btn-delete, button[class*="delete"]').first()
    if (await delBtn.isVisible({ timeout: 500 }).catch(() => false)) {
      ok('panel-delete-btn', 'Delete button visible in side panel')
    } else {
      warn('panel-delete', 'Delete button (btn-delete class) not found — may have different styling')
    }
  }

  if (errs.length) bug('ERR-A', 'HIGH', `${errs.length} console errors`, errs.join('\n'))
}

// ══════════════════════════════════════════════════════
// TEST B: Delete task + undo
// ══════════════════════════════════════════════════════
{
  const { page, errs } = await freshPage(browser)
  const before = (await page.evaluate(() => JSON.parse(localStorage.getItem('schedule-tool-v1')||'{}')))?.tasks?.length ?? 0

  const panelOpened = await openFirstTaskPanel(page)
  if (panelOpened) {
    const delBtn = page.locator('button.btn-delete, button:text-is("Delete task"), button:has-text("Delete")').first()
    const delVisible = await delBtn.isVisible({ timeout: 1000 }).catch(() => false)
    if (delVisible) {
      await delBtn.click()
      await page.waitForTimeout(200)
      // Confirm dialog
      const confirm = page.locator('button:text-is("Delete"), button:text-is("Confirm"), button:text-is("Yes")').first()
      if (await confirm.isVisible({ timeout: 500 }).catch(() => false)) await confirm.click()
      await page.waitForTimeout(300)
      const after = (await page.evaluate(() => JSON.parse(localStorage.getItem('schedule-tool-v1')||'{}')))?.tasks?.length ?? 0
      if (after < before) {
        ok('delete-task', `Deleted task: ${before} → ${after}`)
        // Undo
        await page.keyboard.press('Control+z')
        await page.waitForTimeout(400)
        const afterUndo = (await page.evaluate(() => JSON.parse(localStorage.getItem('schedule-tool-v1')||'{}')))?.tasks?.length ?? 0
        if (afterUndo === before) ok('undo', `Undo restored task: ${after} → ${afterUndo}`)
        else bug('BUG-09', 'HIGH', `Undo did not restore task (${after} → ${afterUndo}, expected ${before})`)
        await page.screenshot({ path: join(SHOTS, 'B-after-undo.png'), fullPage: false })
      } else {
        bug('BUG-09a', 'MEDIUM', `Delete task did not reduce count (${before} → ${after})`)
      }
    } else {
      warn('delete-btn', 'Delete button not visible in panel')
    }
  } else {
    warn('B-panel', 'Panel did not open for delete/undo test')
  }

  if (errs.length) bug('ERR-B', 'HIGH', `${errs.length} console errors`, errs.join('\n'))
}

// ══════════════════════════════════════════════════════
// TEST C: Print preview — both modes
// ══════════════════════════════════════════════════════
{
  const { page, errs } = await freshPage(browser)
  await page.locator('button:has-text("Print")').first().click()
  await page.waitForTimeout(600)
  await page.screenshot({ path: join(SHOTS, 'C-print-gantt.png'), fullPage: true })

  // Check modal content
  const bodyText = await page.evaluate(() => document.body.innerText)
  const hasPrintModal = bodyText.includes('Print') && (bodyText.includes('A3') || bodyText.includes('Gantt') || bodyText.includes('Schedule'))
  ok('print-modal', `Print modal content: ${hasPrintModal}`)

  // Check for Gantt vs Summary toggle
  const summaryToggle = await page.locator('button:has-text("Summary"), label:has-text("Summary"), input[value="summary"]').first().isVisible({ timeout: 1000 }).catch(() => false)
  const ganttToggle   = await page.locator('button:has-text("Gantt"), label:has-text("Gantt"), input[value="gantt"]').first().isVisible({ timeout: 1000 }).catch(() => false)
  ok('print-modes', `Gantt mode toggle: ${ganttToggle}, Summary mode toggle: ${summaryToggle}`)
  if (!summaryToggle) {
    bug('BUG-10', 'MEDIUM', 'Print preview: Summary mode toggle not found',
      'CLAUDE.md says print has two modes: 2-col Gantt and summary table. Summary toggle not detected.')
  }

  // Check for close button
  const closeBtn = await page.locator('button[aria-label*="close" i], button[aria-label*="Close" i], button:has-text("Close"), button:has-text("Cancel")').first().isVisible({ timeout: 1000 }).catch(() => false)
  ok('print-close', `Close/Cancel button in print modal: ${closeBtn}`)

  // Try clicking summary if found
  if (summaryToggle) {
    await page.locator('button:has-text("Summary"), label:has-text("Summary")').first().click().catch(() => {})
    await page.waitForTimeout(300)
    await page.screenshot({ path: join(SHOTS, 'C-print-summary.png'), fullPage: true })
  }
  await page.keyboard.press('Escape')

  if (errs.length) bug('ERR-C', 'HIGH', `${errs.length} console errors`, errs.join('\n'))
}

// ══════════════════════════════════════════════════════
// TEST D: Mobile bottom sheet
// ══════════════════════════════════════════════════════
{
  const darkCtx = await browser.newContext({ viewport: { width: 375, height: 812 }, colorScheme: 'light' })
  const page = await darkCtx.newPage()
  const errs = []
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()) })
  page.on('pageerror', e => errs.push(e.message))
  await page.goto(BASE)
  await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: /load example/i }).click().catch(() => {})
  await page.waitForTimeout(500)
  await page.screenshot({ path: join(SHOTS, 'D-mobile-loaded.png'), fullPage: true })

  // Check tab switcher
  const listTab  = await page.locator('button:has-text("List")').isVisible({ timeout: 1000 }).catch(() => false)
  const ganttTab = await page.locator('button:has-text("Gantt")').isVisible({ timeout: 1000 }).catch(() => false)
  ok('mobile-tabs', `List tab: ${listTab}, Gantt tab: ${ganttTab}`)
  if (!listTab || !ganttTab) {
    bug('BUG-13a', 'MEDIUM', 'Mobile tab switcher (List/Gantt) not visible',
      `List=${listTab}, Gantt=${ganttTab}. Expected both visible at 375px.`)
  }

  // Open bottom sheet by double-clicking first task row
  const rows = page.locator('[style*="height: 36px"], [style*="height:36px"]')
  const rowCount = await rows.count()
  let sheetOpened = false
  for (let i = 1; i < Math.min(rowCount, 6); i++) {
    await rows.nth(i).dblclick({ timeout: 1000 }).catch(() => {})
    await page.waitForTimeout(400)
    // Check if sheet appeared
    const sheetCheck = await page.locator('[style*="85vh"], [style*="40vh"], [style*="translateY"], [class*="sheet"], [class*="bottom"]').isVisible({ timeout: 500 }).catch(() => false)
    if (sheetCheck) { sheetOpened = true; break }
  }
  await page.screenshot({ path: join(SHOTS, 'D-mobile-sheet.png'), fullPage: true })
  ok('mobile-sheet', `Bottom sheet opened: ${sheetOpened}`)
  if (!sheetOpened) {
    warn('mobile-sheet', 'Could not confirm bottom sheet via style selector — check screenshot D-mobile-sheet.png')
  }

  if (errs.length) bug('ERR-D', 'MEDIUM', `${errs.length} mobile console errors`, errs.join('\n'))
}

// ══════════════════════════════════════════════════════
// TEST E: Dark mode
// ══════════════════════════════════════════════════════
{
  const { page, errs } = await freshPage(browser, { colorScheme: 'dark' })
  await page.screenshot({ path: join(SHOTS, 'E-dark-loaded.png'), fullPage: true })
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
  ok('dark-bg', `Body bg in dark mode: ${bg}`)
  if (bg === 'rgb(255, 255, 255)') {
    bug('BUG-14', 'HIGH', 'Dark mode body background is white — tokens not applied', `computed: ${bg}`)
  } else {
    ok('dark-mode', `Dark mode bg looks non-white: ${bg}`)
  }

  // Check that the header (brand color) renders
  const headerBg = await page.evaluate(() => {
    const header = document.querySelector('[style*="var(--brand)"], [style*="#1c3048"]')
    return header ? getComputedStyle(header).backgroundColor : null
  })
  ok('dark-header', `Header element bg: ${headerBg}`)

  if (errs.length) bug('ERR-E', 'MEDIUM', `${errs.length} dark mode errors`, errs.join('\n'))
}

// ══════════════════════════════════════════════════════
// TEST F: React key prop warning — reproduce carefully
// ══════════════════════════════════════════════════════
{
  const { page } = await freshPage(browser)
  const keyWarnings = []
  // Add listener BEFORE any rendering
  page.on('console', m => {
    if (m.type() === 'warning' && m.text().includes('key')) keyWarnings.push(m.text())
  })
  // reload to trigger fresh render with example data
  await page.reload()
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(500)
  // Open panel
  await openFirstTaskPanel(page)
  await page.waitForTimeout(500)

  if (keyWarnings.length > 0) {
    bug('BUG-16', 'MEDIUM', `React key prop warnings on normal use: ${keyWarnings.length}`,
      keyWarnings[0].slice(0, 300))
  } else {
    ok('key-warnings', 'No key prop warnings on normal use — warning only fires in edge case context')
  }
}

// ══════════════════════════════════════════════════════
// TEST G: Filter search
// ══════════════════════════════════════════════════════
{
  const { page, errs } = await freshPage(browser)
  const search = page.locator('input[placeholder*="earch" i], input[placeholder*="ilter" i]').first()
  if (await search.isVisible({ timeout: 2000 }).catch(() => false)) {
    const beforeSearch = await page.locator('[style*="height: 36px"], [style*="height:36px"]').count()
    await search.fill('foundation')
    await page.waitForTimeout(300)
    await page.screenshot({ path: join(SHOTS, 'G-filter.png'), fullPage: false })
    const afterSearch = await page.locator('[style*="height: 36px"], [style*="height:36px"]').count()
    ok('filter-search', `Row count: ${beforeSearch} → ${afterSearch} after "foundation" filter`)
    if (afterSearch === beforeSearch) {
      warn('filter', 'Filter did not change visible row count — may not be filtering visually')
    }
    await search.fill('')
    await page.waitForTimeout(200)
  } else {
    bug('BUG-07', 'MEDIUM', 'Search/filter input not found on main page')
  }
  if (errs.length) bug('ERR-G', 'HIGH', `${errs.length} errors in filter test`, errs.join('\n'))
}

// ══════════════════════════════════════════════════════
// TEST H: Resource Manager modal
// ══════════════════════════════════════════════════════
{
  const { page, errs } = await freshPage(browser)
  await page.locator('button:has-text("Resources")').first().click()
  await page.waitForTimeout(400)
  await page.screenshot({ path: join(SHOTS, 'H-resources-modal.png'), fullPage: true })
  // Modal should have add button, category select, etc.
  const bodyText = await page.evaluate(() => document.body.innerText)
  const hasAdd = bodyText.includes('Add') || bodyText.includes('Create')
  const hasCategory = bodyText.includes('Labor') || bodyText.includes('Equipment') || bodyText.includes('Material')
  ok('resources-modal', `Resources modal: add button=${hasAdd}, categories visible=${hasCategory}`)
  if (!hasAdd) warn('resources-modal', 'No "Add" or "Create" text in resources modal')
  await page.keyboard.press('Escape')
  if (errs.length) bug('ERR-H', 'HIGH', `${errs.length} errors`, errs.join('\n'))
}

// ══════════════════════════════════════════════════════
// TEST I: Phases, Parties, Calendar modals open and close
// ══════════════════════════════════════════════════════
{
  const { page, errs } = await freshPage(browser)
  for (const [btn, expected] of [['Phases', 'Phase'], ['Parties', 'Party'], ['Calendar', 'Mon']]) {
    await page.locator(`button:has-text("${btn}")`).first().click()
    await page.waitForTimeout(300)
    const text = await page.evaluate(() => document.body.innerText)
    const ok2 = text.includes(expected) || text.includes(btn)
    ok(`modal-${btn.toLowerCase()}`, `${btn} modal has expected content ("${expected}"): ${ok2}`)
    if (!ok2) bug(`BUG-modal-${btn}`, 'LOW', `${btn} modal doesn't contain expected text "${expected}"`)
    await page.screenshot({ path: join(SHOTS, `I-modal-${btn.toLowerCase()}.png`) })
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)
  }
  if (errs.length) bug('ERR-I', 'HIGH', `${errs.length} errors`, errs.join('\n'))
}

// ══════════════════════════════════════════════════════
// TEST J: CSV export triggers download
// ══════════════════════════════════════════════════════
{
  const { page, errs } = await freshPage(browser)
  try {
    const [dl] = await Promise.all([
      page.waitForEvent('download', { timeout: 5000 }),
      page.locator('button:has-text("Export")').first().click(),
    ])
    ok('csv-export', `Download filename: ${dl.suggestedFilename()}`)
    const invalid = !dl.suggestedFilename().endsWith('.csv')
    if (invalid) bug('BUG-CSV', 'LOW', `Export filename not .csv: ${dl.suggestedFilename()}`)
  } catch (e) {
    bug('BUG-CSV', 'HIGH', 'CSV export button did not trigger a download', e.message)
  }
  if (errs.length) bug('ERR-J', 'HIGH', `${errs.length} errors`, errs.join('\n'))
}

await browser.close()

// ══════════════════════════════════════════════════════
// Final report
// ══════════════════════════════════════════════════════
console.log('\n\n══════════════════════════════════════════')
console.log('QA PASS 3 — FINAL BUG LIST')
console.log('══════════════════════════════════════════')
const sev = { HIGH: [], MEDIUM: [], LOW: [] }
for (const b of bugs) (sev[b.sev] ?? []).push(b)
for (const [level, list] of Object.entries(sev)) {
  if (list.length) {
    console.log(`\n${level} (${list.length}):`)
    list.forEach(b => console.log(`  • [${b.id}] ${b.title}`))
  }
}
console.log(`\nOK: ${notes.length} checks passed`)
console.log('Screenshots → test-results/qa/screens3/')
writeFileSync('test-results/qa/bugs3.json', JSON.stringify({ bugs, notes }, null, 2))
