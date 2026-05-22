import type { Page } from '@playwright/test'

export async function startBlankProject(page: Page) {
  await page.goto('/')
  await page.getByRole('button', { name: /start blank/i }).click()
}
