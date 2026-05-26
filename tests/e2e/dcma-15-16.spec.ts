import { test, expect } from '@playwright/test'

async function openQuality(page: import('@playwright/test').Page) {
  const healthButtons = page.getByRole('button', { name: /health/i })
  if (await healthButtons.count()) {
    await healthButtons.first().click()
  } else {
    await page.getByTitle(/click for full quality report/i).click()
  }
}

test('quality panel includes DCMA checks 15 and 16', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /load example data/i }).click()
  await expect(page.locator('.app')).toHaveAttribute('data-phase', 'complete')

  await openQuality(page)
  const dialog = page.getByRole('dialog', { name: /schedule quality panel/i })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: /show all 16 checks/i }).click()

  await expect(dialog.getByText('WBS Completeness', { exact: true }).first()).toBeVisible()
  await expect(dialog.getByText('Resource Over-Allocation', { exact: true }).first()).toBeVisible()
})
