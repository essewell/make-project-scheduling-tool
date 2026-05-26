import type { ChangeOrder, Task, WeeklyReportData } from '../types'
import { addDays } from './dates'

export interface WeeklyReportInput {
  tasks: Task[]
  changeOrders: ChangeOrder[]
  weekEnding: string
}

export function buildWeeklyReport(input: WeeklyReportInput): WeeklyReportData {
  const weekStart = addDays(input.weekEnding, -6)
  const nextWeekStart = addDays(input.weekEnding, 1)
  const nextWeekEnd = addDays(input.weekEnding, 7)

  const completedTaskIds = input.tasks
    .filter((task) => Boolean(task.actualFinish && task.actualFinish >= weekStart && task.actualFinish <= input.weekEnding))
    .map((task) => task.id)

  const plannedTaskIds = input.tasks
    .filter((task) => task.s >= nextWeekStart && task.s <= nextWeekEnd && task.status !== 'complete')
    .map((task) => task.id)

  const varianceTaskIds = input.tasks
    .filter((task) => task.pct > 0 && task.e > input.weekEnding && task.status !== 'complete')
    .map((task) => task.id)

  const recentChangeOrderIds = input.changeOrders
    .filter((changeOrder) => changeOrder.createdAt.slice(0, 10) >= weekStart && changeOrder.createdAt.slice(0, 10) <= input.weekEnding)
    .map((changeOrder) => changeOrder.id)

  return {
    weekEnding: input.weekEnding,
    completedTaskIds,
    plannedTaskIds,
    varianceTaskIds,
    recentChangeOrderIds,
  }
}
