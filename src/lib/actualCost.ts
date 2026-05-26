import type { Task } from '../types'

export function computeTotalActualCost(tasks: Task[]): number {
  return tasks.reduce((sum, task) => {
    if (!Number.isFinite(task.actualCost) || task.actualCost <= 0) return sum
    return sum + task.actualCost
  }, 0)
}
