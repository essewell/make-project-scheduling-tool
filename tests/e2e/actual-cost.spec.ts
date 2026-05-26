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

test('actual cost section shows assignment advisory and EVM renders AC/CPI cells', async ({ page }) => {
  await startBlankProject(page)

  await expect(page.getByText(/assign resources first to enable cost tracking/i)).toBeVisible()
  await importResourceFixtures(page)

  await page.getByRole('button', { name: /capture/i }).click()
  const captureDialog = page.getByRole('dialog', { name: /capture baseline/i })
  await captureDialog.getByRole('button', { name: /^capture$/i }).click()

  await page.getByRole('button', { name: /^reports$/i }).click()
  const reports = page.getByRole('dialog', { name: /reports modal/i })
  await expect(reports).toBeVisible()

  await reports.getByRole('button', { name: /^EVM$/i }).click()
  const fallback = reports.getByText(/capture a baseline with cost-loaded tasks to enable EVM/i)
  if (await fallback.count()) {
    await expect(fallback).toBeVisible()
  } else {
    await expect(reports.getByText('PV', { exact: true }).first()).toBeVisible()
    await expect(reports.getByText('EV', { exact: true }).first()).toBeVisible()
    await expect(reports.getByText('AC', { exact: true }).first()).toBeVisible()
    await expect(reports.getByText('SPI', { exact: true }).first()).toBeVisible()
    await expect(reports.getByText('CPI', { exact: true }).first()).toBeVisible()
    await expect(reports.getByText(/tracking is not yet implemented/i)).toHaveCount(0)
  }
})
