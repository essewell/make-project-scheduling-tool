import { test, expect } from '@playwright/test'

test('basic accessibility smoke check', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText(/Project Schedule/i)).toBeVisible()
  await expect(page.getByRole('button', { name: /start blank/i })).toBeVisible()
})
