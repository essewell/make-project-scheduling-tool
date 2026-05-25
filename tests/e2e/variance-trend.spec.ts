import { test, expect } from '@playwright/test'
import { startBlankProject } from './helpers'

test('variance trend renders at least two points after baseline + injected snapshots', async ({ page }) => {
  await startBlankProject(page)

  await page.getByRole('button', { name: /capture/i }).click()
  const captureDialog = page.getByRole('dialog', { name: /capture baseline/i })
  await expect(captureDialog).toBeVisible()
  await captureDialog.getByRole('button', { name: /^capture$/i }).click()
  await expect(page.getByRole('button', { name: /baselines · baseline 1/i })).toBeVisible()

  await page.evaluate(() => {
    const key = 'schedule-tool-v1'
    const raw = localStorage.getItem(key)
    if (!raw) return
    const state = JSON.parse(raw) as {
      baselines?: Array<{ id: string }>
      varianceSnapshots?: Array<{ date: string; projectFinishVariance: number; activeBaselineId: string }>
    }
    const baselineId = state.baselines?.[0]?.id
    if (!baselineId) return
    state.varianceSnapshots = [
      { date: '2026-05-24', projectFinishVariance: 1, activeBaselineId: baselineId, criticalPathLength: 4 },
      { date: '2026-05-25', projectFinishVariance: 3, activeBaselineId: baselineId, criticalPathLength: 5 },
    ]
    localStorage.setItem(key, JSON.stringify(state))
  })

  await page.reload()
  await page.getByRole('button', { name: /baselines/i }).first().click()
  await page.getByRole('button', { name: /^set active$/i }).first().click()
  await page.getByTitle(/click for full quality report/i).click()
  const qualityDialog = page.getByRole('dialog', { name: /schedule quality panel/i })
  await expect(qualityDialog).toBeVisible()
  const chart = qualityDialog.locator('svg[aria-label="Variance trend chart"]')
  await expect(chart).toBeVisible()
  await expect(chart.locator('circle')).toHaveCount(2)
})
