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

test('capture baseline, show variance, persist ghost style on reload', async ({ page }) => {
  await startBlankProject(page)

  await page.getByRole('button', { name: /capture/i }).click()
  const captureDialog = page.getByRole('dialog', { name: /capture baseline/i })
  await captureDialog.getByLabel('Name').fill('Baseline Alpha')
  await captureDialog.getByLabel('Reason').fill('Initial approved plan')
  await captureDialog.getByLabel('Author').fill('QA')
  await expect(captureDialog).toBeVisible()
  await captureDialog.getByRole('button', { name: /^capture$/i }).click()
  await expect(page.getByRole('button', { name: /baselines · baseline alpha/i })).toBeVisible()

  await page.getByRole('button', { name: /baselines · baseline alpha/i }).click()
  const baselineRow = page.locator('div').filter({ hasText: 'Baseline Alpha' }).first()
  await expect(baselineRow).toContainText('Reason: Initial approved plan')
  await expect(baselineRow).toContainText('Author: QA')
  await expect(page.getByLabel('Locked baseline').first()).toBeVisible()
  await page.keyboard.press('Escape')

  await page.locator('input[type="date"]').nth(1).fill(addDaysIso(4))
  await expect(page.getByText('+4d')).toBeVisible()

  await page.getByTitle('Ghost style: outline').click()
  await expect(page.locator('pattern[id^="stripe-"]')).toHaveCount(0)

  await page.reload()
  await expect(page.getByText('+4d')).toBeVisible()
  await expect(page.locator('pattern[id^="stripe-"]')).toHaveCount(0)
})
