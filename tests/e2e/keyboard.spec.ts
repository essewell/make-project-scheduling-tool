import { test, expect } from '@playwright/test'
import { startBlankProject } from './helpers'

test('keyboard shortcuts work with and without input focus', async ({ page }) => {
  await startBlankProject(page)

  const taskNameInput = page.getByLabel('Task name')
  await taskNameInput.fill('Task A')

  // N creates a task when focus is not in an input.
  await page.keyboard.press('Escape')
  await page.keyboard.press('n')
  await expect(taskNameInput).toHaveValue('New Task')
  await taskNameInput.fill('Task B')

  // Non-ctrl shortcuts are blocked while an input is focused.
  await taskNameInput.click()
  await page.keyboard.press('n')
  await expect(taskNameInput).toHaveValue('Task Bn')
  await taskNameInput.fill('Task B')

  // Escape remains active even when an input has focus.
  await taskNameInput.click()
  await page.keyboard.press('Escape')
  await expect(taskNameInput).toBeHidden()

  // Arrow navigation + Enter opens the keyboard-focused task.
  await page.keyboard.press('ArrowDown') // focus Task A from null
  await page.keyboard.press('ArrowDown') // move focus to Task B
  await page.keyboard.press('ArrowUp')
  await page.keyboard.press(' ')
  await page.keyboard.press('Enter')
  await expect(taskNameInput).toHaveValue('Task A')

  // Delete task, then Ctrl/Cmd+Z while an input is focused restores it.
  await page.getByRole('button', { name: /^Delete$/ }).click()
  await page.getByRole('button', { name: /^Delete\?$/ }).click()
  await expect(page.getByText(/deleted "task a"/i)).toBeVisible()

  const searchInput = page.getByPlaceholder('Search tasks…')
  await searchInput.click()
  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+z' : 'Control+z')

  const taskPanel = page.getByRole('tabpanel', { name: /tasks/i })
  await expect(taskPanel.getByText('Task A', { exact: true })).toBeVisible()
})
