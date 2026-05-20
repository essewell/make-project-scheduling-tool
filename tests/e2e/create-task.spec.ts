import { test, expect } from '@playwright/test'

test('create and delete task flow', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /start blank/i }).click()
  // The new task should open the task panel directly.
  await expect(page.getByRole('button', { name: /delete/i })).toBeVisible()
  await page.getByRole('button', { name: /delete/i }).click()
  await expect(page.getByText(/undo/i)).toBeVisible()
})
