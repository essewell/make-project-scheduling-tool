import type { Resource, ResourceAssignment, Task, Timeline, WorkweekConfig } from '../types'
import { addDays, daysBetween, fmtDate } from './dates'
import { isWorkday, workdays } from './workdays'

export interface ResourceDemandPoint {
  day: Date
  demand: number
  overAllocation: number
}

export interface ResourceDemandContext {
  tasks: Task[]
  assignments: ResourceAssignment[]
  resources: Resource[]
  timeline: Timeline
  workweek: WorkweekConfig
  holidays: string[]
}

export function computeResourceDemand(
  resourceId: string,
  context: ResourceDemandContext,
): ResourceDemandPoint[] {
  const resource = context.resources.find((candidate) => candidate.id === resourceId)
  if (!resource) return []

  const taskMap = new Map(context.tasks.map((task) => [task.id, task]))
  const demandByDay = new Map<string, number>()
  const points = context.timeline.days.map(({ date }) => ({
    day: date,
    demand: 0,
    overAllocation: 0,
  }))

  const timelineStart = fmtDate(context.timeline.min)
  const timelineEnd = fmtDate(context.timeline.max)

  context.assignments.forEach((assignment) => {
    if (assignment.resourceId !== resourceId) return
    if (assignment.quantity <= 0) return

    const task = taskMap.get(assignment.taskId)
    if (!task) return

    const totalWorkdays = workdays(task.s, task.e, context.workweek, context.holidays)
    const materialPerWorkday = totalWorkdays > 0 ? assignment.quantity / totalWorkdays : 0

    const spanStart = task.s > timelineStart ? task.s : timelineStart
    const spanEnd = task.e < timelineEnd ? task.e : timelineEnd
    if (spanStart > spanEnd) return

    const spanDays = daysBetween(spanStart, spanEnd)
    for (let offset = 0; offset <= spanDays; offset += 1) {
      const dayStr = addDays(spanStart, offset)
      if (!isWorkday(dayStr, context.workweek, context.holidays)) continue

      const increment =
        resource.category === 'material'
          ? materialPerWorkday
          : assignment.quantity

      demandByDay.set(dayStr, (demandByDay.get(dayStr) ?? 0) + increment)
    }
  })

  points.forEach((point) => {
    const dayStr = fmtDate(point.day)
    const demand = demandByDay.get(dayStr) ?? 0
    point.demand = demand

    if (resource.category === 'material') {
      point.overAllocation = 0
      return
    }

    const capacity = Math.max(0, resource.capacity)
    point.overAllocation = Math.max(0, demand - capacity)
  })

  return points
}
