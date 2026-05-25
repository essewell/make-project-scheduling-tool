import { test, expect } from '@playwright/test'
import { startBlankProject } from './helpers'

function addDaysIso(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

test('compare modal renders slipped, added, removed rows and footer totals', async ({ page }) => {
  await startBlankProject(page)

  await page.getByLabel('Task name').fill('Task A')
  await page.getByRole('button', { name: /\+ new task/i }).click()
  await page.getByLabel('Task name').fill('Task B')

  await page.getByRole('button', { name: /capture/i }).click()
  const captureDialog = page.getByRole('dialog', { name: /capture baseline/i })
  await captureDialog.getByRole('button', { name: /^capture$/i }).click()
  await expect(page.getByRole('button', { name: /baselines · baseline 1/i })).toBeVisible()

  await page.getByRole('tabpanel', { name: /tasks/i }).getByText('Task A', { exact: true }).dblclick()
  await page.locator('input[type="date"]').nth(1).fill(addDaysIso(10))
  await page.getByRole('button', { name: /\+ new task/i }).click()
  await page.getByLabel('Task name').fill('Task C')

  await page.getByRole('tabpanel', { name: /tasks/i }).getByText('Task B', { exact: true }).dblclick()
  await page.getByRole('button', { name: /delete/i }).click()
  await page.getByRole('button', { name: /delete\?/i }).click()

  await page.getByRole('button', { name: /capture/i }).click()
  const captureAgain = page.getByRole('dialog', { name: /capture baseline/i })
  await captureAgain.getByRole('button', { name: /^capture$/i }).click()
  const baselinesButton = page.getByRole('button', { name: /baselines · /i })
  await expect(baselinesButton).toBeVisible()
  await baselinesButton.click()
  await page.getByRole('button', { name: /compare baselines/i }).click()

  const compareDialog = page.getByRole('dialog', { name: /compare baselines/i })
  await expect(compareDialog).toBeVisible()
  const baselineSelects = compareDialog.locator('select')
  await baselineSelects.nth(0).selectOption({ index: 0 })
  await baselineSelects.nth(1).selectOption({ index: 1 })
  await expect(compareDialog.getByText('Slipped Tasks', { exact: true })).toBeVisible()
  await expect(compareDialog.getByText('Added Tasks', { exact: true })).toBeVisible()
  await expect(compareDialog.getByText('Removed Tasks', { exact: true })).toBeVisible()
  await expect(compareDialog.getByText('Task C', { exact: true })).toBeVisible()
  await expect(compareDialog.getByText('Task B', { exact: true })).toBeVisible()
  await expect(compareDialog.getByText('No slipped tasks.')).toHaveCount(0)
  await expect(compareDialog.getByText(/Slip \+\d+d/)).toBeVisible()
  await expect(compareDialog.getByText(/Net Tasks [+-]\d+/)).toBeVisible()
  await expect(compareDialog.getByText(/Cost [+-]\$/)).toBeVisible()
})
