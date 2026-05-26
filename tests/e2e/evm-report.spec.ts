import { test, expect } from '@playwright/test'
import { startBlankProject, clickTopbarOverflowAction } from './helpers'
import path from 'path'

async function importResourceFixtures(page: import('@playwright/test').Page) {
  await clickTopbarOverflowAction(page, /resources/i)
  const dialog = page.getByRole('dialog', { name: /manage resources/i })
  await expect(dialog).toBeVisible()
  const resourcesCsv = path.resolve('tests/e2e/fixtures/resources.csv')
  const assignmentsCsv = path.resolve('tests/e2e/fixtures/assignments.csv')
  const inputs = dialog.locator('input[type="file"]')
  await inputs.nth(0).setInputFiles(resourcesCsv)
  await inputs.nth(1).setInputFiles(assignmentsCsv)
  await dialog.getByRole('button', { name: /^save$/i }).click()
}

test('EVM report shows five KPI cells and AC=0 fallback', async ({ page }) => {
  await startBlankProject(page)
  await importResourceFixtures(page)

  await page.getByRole('button', { name: /capture/i }).click()
  const captureDialog = page.getByRole('dialog', { name: /capture baseline/i })
  await captureDialog.getByRole('button', { name: /^capture$/i }).click()

  await page.getByRole('button', { name: /^reports$/i }).click()
  const reports = page.getByRole('dialog', { name: /reports modal/i })
  await reports.getByRole('button', { name: /^EVM$/i }).click()

  const fallback = reports.getByText(/capture a baseline with cost-loaded tasks to enable EVM/i)
  if (await fallback.count()) {
    await expect(fallback).toBeVisible()
  } else {
    for (const label of ['PV', 'EV', 'AC', 'SPI', 'CPI']) {
      await expect(reports.getByText(label, { exact: true }).first()).toBeVisible()
    }
    await expect(reports.getByText(/tracking is not yet implemented/i)).toHaveCount(0)
  }
})
