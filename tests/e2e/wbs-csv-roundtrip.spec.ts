import { test, expect } from '@playwright/test'
import { startBlankProject } from './helpers'
import * as fs from 'node:fs'

test('csv export includes WBS/Actual Cost and can be re-imported', async ({ page }) => {
  await startBlankProject(page)
  await page.getByLabel('Task name').fill('Roundtrip Task')

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: /^export$/i }).click()
  const download = await downloadPromise
  const filePath = await download.path()
  expect(filePath).toBeTruthy()

  const csvText = filePath ? fs.readFileSync(filePath, 'utf-8') : ''
  expect(csvText).toContain('WBS Code')
  expect(csvText).toContain('Actual Cost')

  await page.getByRole('button', { name: /^import$/i }).click()
  await page.locator('input[type="file"]').setInputFiles({
    name: 'roundtrip.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from(csvText, 'utf-8'),
  })

  await expect(page.getByText(/preview/i)).toBeVisible()
  await page.getByRole('button', { name: /import \d+ task/i }).click()
  await expect(page.getByRole('tabpanel', { name: /tasks/i }).getByText('Roundtrip Task', { exact: true }).first()).toBeVisible()
})
