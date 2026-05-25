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
  await expect(captureDialog).toBeVisible()
  await captureDialog.getByRole('button', { name: /^capture$/i }).click()
  await expect(page.getByRole('button', { name: /baselines · baseline 1/i })).toBeVisible()

  await page.locator('input[type="date"]').nth(1).fill(addDaysIso(4))
  await expect(page.getByText('+4d')).toBeVisible()

  await page.getByTitle('Ghost style: outline').click()
  await expect(page.locator('pattern[id^="stripe-"]')).toHaveCount(0)

  await page.reload()
  await expect(page.getByText('+4d')).toBeVisible()
  await expect(page.locator('pattern[id^="stripe-"]')).toHaveCount(0)
})
