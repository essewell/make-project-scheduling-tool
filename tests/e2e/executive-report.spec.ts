import { test, expect } from '@playwright/test'
import { startBlankProject } from './helpers'

test('executive report includes SPI and CPI line', async ({ page }) => {
  await startBlankProject(page)

  await page.getByRole('button', { name: /capture/i }).click()
  const captureDialog = page.getByRole('dialog', { name: /capture baseline/i })
  await captureDialog.getByRole('button', { name: /^capture$/i }).click()

  await page.getByRole('button', { name: /^reports$/i }).click()
  const reports = page.getByRole('dialog', { name: /reports modal/i })
  await reports.getByRole('button', { name: /^Executive Summary$/i }).click()

  await expect(reports.getByText(/SPI\s+—\s+·\s+CPI\s+—|SPI\s+\d+\.\d+\s+·\s+CPI\s+(—|\d+\.\d+)/i)).toBeVisible()
})
