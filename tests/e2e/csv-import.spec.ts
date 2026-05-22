import { test, expect, type Page } from '@playwright/test'
import { startBlankProject } from './helpers'

const APPEND_CSV = `Name,Start,End,Progress %
Imported Alpha,2026-05-01,2026-05-05,25
Imported Beta,2026-05-06,2026-05-08,75
`

const REPLACE_CSV = `Name,Start,End,Progress %
Replacement Task,2026-06-01,2026-06-03,10
`

async function uploadCsvInImportDialog(page: Page, content: string, mode: 'append' | 'replace' = 'append') {
  await page.getByRole('button', { name: /^Import$/ }).click()
  if (mode === 'replace') {
    await page.getByRole('button', { name: /replace all tasks/i }).click()
  }
  await page.locator('input[type="file"]').setInputFiles({
    name: 'import.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from(content, 'utf-8'),
  })
}

test('csv import append, undo, and replace', async ({ page }) => {
  await startBlankProject(page)

  await uploadCsvInImportDialog(page, APPEND_CSV)
  await expect(page.getByText('Preview (first 2 rows)')).toBeVisible()
  await page.getByRole('button', { name: /import 2 tasks/i }).click()

  const taskPanel = page.getByRole('tabpanel', { name: /tasks/i })
  await expect(taskPanel.getByText('Imported Alpha', { exact: true })).toBeVisible()
  await expect(taskPanel.getByText('Imported Beta', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: /^Undo$/ }).click()
  await expect(taskPanel.getByText('Imported Alpha', { exact: true })).toHaveCount(0)
  await expect(taskPanel.getByText('Imported Beta', { exact: true })).toHaveCount(0)
  await expect(taskPanel.getByText('New Task', { exact: true })).toBeVisible()

  await uploadCsvInImportDialog(page, REPLACE_CSV, 'replace')
  await page.getByRole('button', { name: /import 1 task/i }).click()

  await expect(taskPanel.getByText('Replacement Task', { exact: true })).toBeVisible()
  await expect(taskPanel.getByText('New Task', { exact: true })).toHaveCount(0)
})
