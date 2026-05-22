import { test, expect } from '@playwright/test'
import { startBlankProject } from './helpers'

test('mobile start blank opens the task details sheet and can dismiss back to tasks', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await startBlankProject(page)

  await expect(page.getByRole('dialog', { name: /task details/i })).toBeVisible()
  await expect(page.getByLabel('Task name')).toBeVisible()

  await page.getByRole('button', { name: /close task details/i }).click()
  await expect(page.getByRole('dialog', { name: /task details/i })).toBeHidden()

  await page.getByRole('tab', { name: /tasks/i }).click()
  await expect(page.getByRole('tabpanel', { name: /tasks/i }).getByText('New Task', { exact: true })).toBeVisible()

  await page.getByRole('tabpanel', { name: /tasks/i }).getByText('New Task', { exact: true }).click()
  await expect(page.getByRole('dialog', { name: /task details/i })).toBeVisible()
})
