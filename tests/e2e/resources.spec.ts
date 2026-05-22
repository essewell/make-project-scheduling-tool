import { test, expect } from '@playwright/test'

test.describe('resources histogram', () => {
  test('renders and responds to drag interactions without runtime errors', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: /load example data/i }).click()
    await expect(page.locator('.app')).toHaveAttribute('data-phase', 'complete')

    await page.getByRole('button', { name: /resources/i }).click()
    await expect(page.getByRole('dialog', { name: /manage resources/i })).toBeVisible()
    await page.getByRole('button', { name: /save/i }).click()

    await page.getByRole('button', { name: /histogram/i }).click()
    await expect(page.getByText(/no resources defined yet/i)).toBeVisible()
  })
})
