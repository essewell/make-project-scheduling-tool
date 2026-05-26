import { test, expect } from '@playwright/test'
import { startBlankProject } from './helpers'

test('reports modal opens and switches across all five report types', async ({ page }) => {
  await startBlankProject(page)
  await page.getByRole('button', { name: /capture/i }).click()
  const captureDialog = page.getByRole('dialog', { name: /capture baseline/i })
  await captureDialog.getByRole('button', { name: /^capture$/i }).click()

  await page.getByRole('button', { name: /^reports$/i }).click()
  const dialog = page.getByRole('dialog', { name: /reports modal/i })
  await expect(dialog).toBeVisible()

  await dialog.getByRole('button', { name: /^S-curve$/i }).click()
  await expect(dialog.getByText(/planned vs actual cumulative progress/i)).toBeVisible()

  await dialog.getByRole('button', { name: /^EVM$/i }).click()
  await expect(dialog.getByText(/Capture a baseline with cost-loaded tasks to enable EVM/i)).toBeVisible()

  await dialog.getByRole('button', { name: /^Cash Flow$/i }).click()
  await expect(dialog.getByText(/Assign costed resources to enable cash flow forecast/i)).toBeVisible()

  await dialog.getByRole('button', { name: /^Executive Summary$/i }).click()
  await expect(dialog.getByText(/Top 3 variances/i)).toBeVisible()

  await dialog.getByRole('button', { name: /^Weekly Progress$/i }).click()
  await expect(dialog.getByText(/Narrative is not saved/i)).toBeVisible()
})
