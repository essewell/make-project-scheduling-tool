import { test, expect } from '@playwright/test'
import { startBlankProject, clickTopbarOverflowAction } from './helpers'

test('groups manager exposes hierarchy parent picker controls', async ({ page }) => {
  await startBlankProject(page)

  await clickTopbarOverflowAction(page, /phases/i)
  const dialog = page.getByRole('dialog', { name: /manage phases/i })
  await expect(dialog).toBeVisible()

  await dialog.getByPlaceholder(/phase name/i).fill('Hierarchy Parent')
  await dialog.getByRole('button', { name: /^add$/i }).click()

  await dialog.getByPlaceholder(/phase name/i).fill('Hierarchy Child')
  await dialog.getByRole('button', { name: /^add$/i }).click()

  const parentSelects = dialog.locator('select')
  await expect(parentSelects).toHaveCount(2)
  await expect(parentSelects.nth(0).locator('option', { hasText: 'Top level' })).toHaveCount(1)
  await dialog.getByRole('button', { name: /^save$/i }).click()

  await expect(page.getByRole('dialog', { name: /manage phases/i })).toHaveCount(0)
  await expect(page.getByRole('tabpanel', { name: /tasks/i }).getByText('New Task', { exact: true }).first()).toBeVisible()
})
