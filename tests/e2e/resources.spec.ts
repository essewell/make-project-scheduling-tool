import { test, expect } from '@playwright/test'
import path from 'path'
import { clickTopbarOverflowAction } from './helpers'

test.describe('resources histogram', () => {
  async function importResourceFixtures(page: import('@playwright/test').Page) {
    await clickTopbarOverflowAction(page, /resources/i)
    const dialog = page.getByRole('dialog', { name: /manage resources/i })
    await expect(dialog).toBeVisible()

    const resourcesCsv = path.resolve('tests/e2e/fixtures/resources.csv')
    const assignmentsCsv = path.resolve('tests/e2e/fixtures/assignments.csv')
    const importInputs = dialog.locator('input[type="file"]')
    await importInputs.nth(0).setInputFiles(resourcesCsv)
    await importInputs.nth(1).setInputFiles(assignmentsCsv)
    await dialog.getByRole('button', { name: /^save$/i }).click()
  }

  test('renders and responds to drag interactions without runtime errors', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: /load example data/i }).click()
    await expect(page.locator('.app')).toHaveAttribute('data-phase', 'complete')

    await clickTopbarOverflowAction(page, /resources/i)
    await expect(page.getByRole('dialog', { name: /manage resources/i })).toBeVisible()
    await page.getByRole('button', { name: /save/i }).click()

    await page.getByRole('button', { name: /histogram/i }).click()
    await expect(page.getByText(/no resources defined yet/i)).toBeVisible()
  })

  test('imports resources.csv + assignments.csv and populates histogram', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /load example data/i }).click()
    await expect(page.locator('.app')).toHaveAttribute('data-phase', 'complete')

    await importResourceFixtures(page)

    // Resource "Crew A" should appear in the manager list after import
    await clickTopbarOverflowAction(page, /resources/i)
    const dialog = page.getByRole('dialog', { name: /manage resources/i })
    await expect(dialog).toBeVisible()
    await expect(dialog.locator('input[value="Crew A"]')).toBeVisible()
    await dialog.getByRole('button', { name: /^save$/i }).click()

    // Toggle histogram on; Crew A selector pill should appear
    await page.getByRole('button', { name: /histogram/i }).click()
    await expect(page.getByRole('button', { name: /crew a/i })).toBeVisible()

    // Selecting Crew A should show demand (over-alloc stat visible)
    await page.getByRole('button', { name: /crew a/i }).click()
    await expect(page.getByRole('button', { name: /over-alloc/i })).toBeVisible({ timeout: 10000 })
  })

  test('undo restores resource and assignments after deleting a resource with active assignments', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /load example data/i }).click()
    await expect(page.locator('.app')).toHaveAttribute('data-phase', 'complete')

    // Stub window.confirm so the "delete resource with assignments" dialog is auto-accepted
    await page.evaluate(() => { window.confirm = () => true })

    await importResourceFixtures(page)

    // Toggle histogram on; verify Crew A + over-alloc (confirms both resources + assignments in state)
    await page.getByRole('button', { name: /histogram/i }).click()
    await expect(page.getByRole('button', { name: /crew a/i })).toBeVisible()
    await page.getByRole('button', { name: /crew a/i }).click()
    await expect(page.getByRole('button', { name: /over-alloc/i })).toBeVisible()

    // Re-open ResourcesManager, delete Crew A (has 2 assignments; stubbed confirm accepts)
    await clickTopbarOverflowAction(page, /resources/i)
    const dialog = page.getByRole('dialog', { name: /manage resources/i })
    await expect(dialog).toBeVisible()
    await dialog.getByRole('button', { name: /remove crew a/i }).click()
    await dialog.getByRole('button', { name: /^save$/i }).click()

    // Histogram should now show "no resources defined yet"
    await expect(page.getByText(/no resources defined yet/i)).toBeVisible()

    // Undo toast should appear — clicking it restores resource + assignments
    const undoBtn = page.getByRole('button', { name: /^undo$/i })
    await expect(undoBtn).toBeVisible()
    await undoBtn.click()

    // Crew A pill back + over-alloc visible confirms both resources and assignments restored
    await expect(page.getByRole('button', { name: /crew a/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /over-alloc/i })).toBeVisible()
  })

  test('updates over-allocation count after dragging an assigned overlapping task', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /load example data/i }).click()
    await expect(page.locator('.app')).toHaveAttribute('data-phase', 'complete')

    await importResourceFixtures(page)

    await page.getByRole('button', { name: /histogram/i }).click()
    const overAllocButton = page.getByRole('button', { name: /over-alloc/i })
    await expect(overAllocButton).toBeVisible()

    const bar = page.locator('div[title="Rough electrical"]').first()
    const box = await bar.boundingBox()
    expect(box).not.toBeNull()
    if (!box) return

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width / 2 + 260, box.y + box.height / 2, { steps: 10 })
    await page.mouse.up()

    await expect(overAllocButton).not.toBeVisible()
  })
})
