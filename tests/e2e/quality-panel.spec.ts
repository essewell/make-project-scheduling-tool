import { test, expect, type Page } from '@playwright/test'
import { startBlankProject } from './helpers'

const DCMA_NAMES = [
  'Logic',
  'Leads',
  'Lags',
  'Relationship Types',
  'Hard Constraints',
  'High Float',
  'Negative Float',
  'High Duration',
  'Invalid Dates',
  'Resources',
  'Missed Tasks',
  'Critical Path Test',
  'CPLI',
  'BEI',
]

async function openQualityPanel(page: Page) {
  const healthButtons = page.getByRole('button', { name: /health/i })
  if (await healthButtons.count()) {
    await healthButtons.first().click()
  } else {
    await page.getByTitle(/click for full quality report/i).click()
  }
}

test('opens quality panel from stat bar and renders checks + histogram', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /load example data/i }).click()
  await expect(page.locator('.app')).toHaveAttribute('data-phase', 'complete')

  await openQualityPanel(page)
  const dialog = page.getByRole('dialog', { name: /schedule quality panel/i })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByText('Schedule Quality Report')).toBeVisible()

  for (const name of DCMA_NAMES) {
    await expect(dialog.getByText(name, { exact: true }).first()).toBeVisible()
  }

  await expect(dialog.locator('svg[aria-label="Float distribution histogram"]')).toBeVisible()
})

test('shows orphan warning icon and opens link builder from task list', async ({ page }) => {
  await startBlankProject(page)

  const orphanButtons = page.getByRole('button', { name: /open links for orphan task/i })
  await expect(orphanButtons.first()).toBeVisible()
  await orphanButtons.first().click()

  await expect(page.getByRole('dialog', { name: /edit dependencies/i })).toBeVisible()
})

test('BEI shows N/A without baseline and clears after capture baseline', async ({ page }) => {
  await startBlankProject(page)

  await openQualityPanel(page)
  const dialog = page.getByRole('dialog', { name: /schedule quality panel/i })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('button', { name: /select an active baseline/i })).toBeVisible()

  await dialog.getByRole('button', { name: /select an active baseline/i }).click()
  await expect(dialog).toHaveCount(0)
  await expect(page.getByText(/no baselines yet/i)).toBeVisible()

  await page.getByRole('button', { name: /^capture$/i }).first().click()
  const captureDialog = page.getByRole('dialog', { name: /capture baseline/i })
  await expect(captureDialog).toBeVisible()
  await captureDialog.getByRole('button', { name: /^capture$/i }).click()
  await expect(page.getByRole('button', { name: /baselines · baseline 1/i })).toBeVisible()

  await openQualityPanel(page)
  const reopened = page.getByRole('dialog', { name: /schedule quality panel/i })
  await expect(reopened).toBeVisible()
  await expect(reopened.getByRole('button', { name: /select an active baseline/i })).toHaveCount(0)
})
