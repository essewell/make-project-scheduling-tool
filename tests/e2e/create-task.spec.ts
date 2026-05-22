import { test, expect } from '@playwright/test'
import { startBlankProject } from './helpers'

test('create, rename, persist, and delete task flow', async ({ page }) => {
  await startBlankProject(page)

  await expect(page.getByRole('button', { name: /delete/i })).toBeVisible()
  await page.getByLabel('Task name').fill('QA Task')
  await expect(page.getByText('QA Task')).toBeVisible()

  await page.reload()
  await expect(page.getByText('QA Task')).toBeVisible()

  await page.getByRole('tabpanel', { name: /tasks/i }).getByText('QA Task', { exact: true }).dblclick()
  await expect(page.getByRole('button', { name: /delete/i })).toBeVisible()
  await page.getByRole('button', { name: /delete/i }).click()
  await page.getByRole('button', { name: /delete\?/i }).click()
  await expect(page.getByText(/undo/i)).toBeVisible()
})
