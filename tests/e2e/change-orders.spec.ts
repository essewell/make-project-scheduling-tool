import { test, expect } from '@playwright/test'
import { startBlankProject } from './helpers'

test('create change order, show it on task panel, then unlink', async ({ page }) => {
  await startBlankProject(page)

  await page.getByRole('button', { name: /^change orders$/i }).click()
  const manager = page.getByRole('dialog', { name: /change order manager/i })
  await expect(manager).toBeVisible()

  await manager.getByRole('button', { name: /\+ new change order/i }).click()
  await manager.getByPlaceholder('CO number').fill('CO-001')
  await manager.getByPlaceholder('CO name').fill('Scope add')
  await manager.getByPlaceholder('Reason').fill('Owner requested additional task')
  await manager.getByRole('button', { name: /^save$/i }).first().click()
  await manager.getByRole('button', { name: /^close$/i }).click()
  await expect(manager).toHaveCount(0)

  await page.evaluate(() => {
    const key = 'schedule-tool-v1'
    const raw = localStorage.getItem(key)
    if (!raw) return
    const state = JSON.parse(raw) as {
      selectedTaskId?: string | null
      tasks?: Array<{ id: string }>
      changeOrders?: Array<{ id: string; affectedTaskIds: string[] }>
    }
    const taskId = state.selectedTaskId ?? state.tasks?.[0]?.id
    const first = state.changeOrders?.[0]
    if (!taskId || !first) return
    first.affectedTaskIds = [taskId]
    localStorage.setItem(key, JSON.stringify(state))
  })
  await page.reload()
  await page.getByRole('tabpanel', { name: /tasks/i }).getByText(/new task/i).first().dblclick()

  const showButton = page.getByRole('button', { name: /^show$/i }).first()
  if (await showButton.isVisible()) {
    await showButton.click()
  }
  await expect(page.getByText(/CO-001 · Scope add/i)).toBeVisible()

  await page.getByRole('button', { name: /^unlink$/i }).first().click()
  await expect(page.getByText(/CO-001 · Scope add/i)).toHaveCount(0)
})
