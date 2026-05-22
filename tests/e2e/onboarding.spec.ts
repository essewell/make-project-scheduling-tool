import { test, expect } from '@playwright/test'

async function resetLocalState(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()
}

test('onboarding flow: start blank -> baseline tip -> capture completes onboarding', async ({ page }) => {
  await resetLocalState(page)
  await page.getByRole('button', { name: /start blank/i }).click()

  await page.getByLabel('Task name').fill('Task 1')

  // Add two more tasks (first already added by Start blank) to reach baseline tip threshold.
  await page.getByTitle(/new task \(n\)/i).click()
  await page.getByLabel('Task name').fill('Task 2')
  await page.getByTitle(/new task \(n\)/i).click()
  await page.getByLabel('Task name').fill('Task 3')

  await expect(page.locator('.baseline-tip')).toContainText('Save a baseline to track schedule variance')

  await page.getByRole('button', { name: /capture/i }).click()
  await expect(page.locator('.baseline-tip')).toHaveCount(0)

  // Confirm onboarding completion persists.
  await page.reload()
  await expect(page.locator('.baseline-tip')).toHaveCount(0)
  await expect(page.locator('.app')).toHaveAttribute('data-phase', 'complete')
})

test('onboarding skip path: load example data goes directly to complete', async ({ page }) => {
  await resetLocalState(page)
  await page.getByRole('button', { name: /load example data/i }).click()

  await expect(page.locator('.baseline-tip')).toHaveCount(0)
  await expect(page.locator('.app')).toHaveAttribute('data-phase', 'complete')
})
