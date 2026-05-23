import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { startBlankProject } from './helpers'

async function expectNoSeriousOrCriticalViolations(page: Page, context: string) {
  const results = await new AxeBuilder({ page })
    // Contrast token tuning is tracked under Phase 7.2; this sweep gates structural a11y regressions.
    .disableRules(['color-contrast'])
    .analyze()
  const blocking = results.violations.filter(v =>
    v.impact === 'serious' || v.impact === 'critical',
  )
  expect(
    blocking,
    `${context} has serious/critical accessibility violations: ${blocking.map(v => v.id).join(', ')}`,
  ).toHaveLength(0)
}

async function openModalAndScan(page: Page, buttonName: RegExp, context: string) {
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.getByRole('button', { name: buttonName }).click()
  const dialog = page.getByRole('dialog').last()
  await expect(dialog).toBeVisible()
  await expectNoSeriousOrCriticalViolations(page, context)
  const dismiss = dialog.getByRole('button', { name: /cancel|close/i }).first()
  await dismiss.click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
}

test('axe sweep: wizard, main app, and desktop modals', async ({ page }) => {
  test.setTimeout(90_000)
  await page.setViewportSize({ width: 1680, height: 980 })
  await page.goto('/')
  await expect(page.getByRole('button', { name: /start blank/i })).toBeVisible()
  await expectNoSeriousOrCriticalViolations(page, 'Setup wizard')

  await startBlankProject(page)
  await expect(page.getByLabel('Task name')).toBeVisible()
  await expectNoSeriousOrCriticalViolations(page, 'Main app shell')

  await openModalAndScan(page, /calendar/i, 'Workweek modal')
  await openModalAndScan(page, /phases/i, 'Groups modal')
  await openModalAndScan(page, /parties/i, 'Parties modal')
  await openModalAndScan(page, /import/i, 'CSV import modal')
  await openModalAndScan(page, /links/i, 'Link builder modal')
  await openModalAndScan(page, /print/i, 'Print preview modal')

  // ResourcesManager: toolbar may render multiple "Resources" buttons; use .first()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.getByRole('button', { name: /resources/i }).first().click()
  const resourcesDialog = page.getByRole('dialog').last()
  await expect(resourcesDialog).toBeVisible()
  await expectNoSeriousOrCriticalViolations(page, 'Resources manager modal')
  await resourcesDialog.getByRole('button', { name: /cancel|close/i }).first().click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('axe sweep: mobile bottom sheet', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await startBlankProject(page)
  await expect(page.getByRole('dialog', { name: /task details/i })).toBeVisible()
  await expectNoSeriousOrCriticalViolations(page, 'Mobile bottom sheet')
})
