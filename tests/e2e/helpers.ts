import type { Page } from '@playwright/test'

export async function startBlankProject(page: Page) {
  await page.goto('/')
  await page.getByRole('button', { name: /start blank/i }).click()
}

export async function clickTopbarOverflowAction(page: Page, actionName: RegExp) {
  await page.getByRole('button', { name: /^more$/i }).click()
  await page.getByRole('menuitem', { name: actionName }).click()
}
