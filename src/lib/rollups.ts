import type { Group, GroupRollup, ResourceAssignment, Task } from '../types'
import { getDescendantTaskIds } from './wbs'

function roundToWhole(value: number): number {
  return Math.round(value)
}

export function computeGroupRollup(
  groupId: string,
  groups: Group[],
  tasks: Task[],
  taskCosts: Map<string, number>,
  assignments: ResourceAssignment[],
): GroupRollup {
  const descendantTaskIds = getDescendantTaskIds(groupId, groups, tasks)
  const taskCount = descendantTaskIds.length

  if (taskCount === 0) {
    return { taskCount: 0, completionPct: 0, totalCost: 0, resourceCount: 0 }
  }

  const taskById = new Map(tasks.map((task) => [task.id, task]))
  let pctSum = 0
  let totalCost = 0

  descendantTaskIds.forEach((taskId) => {
    const task = taskById.get(taskId)
    if (task) pctSum += task.pct
    totalCost += taskCosts.get(taskId) ?? 0
  })

  const resourceIds = new Set(
    assignments
      .filter((assignment) => descendantTaskIds.includes(assignment.taskId))
      .map((assignment) => assignment.resourceId),
  )

  return {
    taskCount,
    completionPct: roundToWhole(pctSum / taskCount),
    totalCost,
    resourceCount: resourceIds.size,
  }
}
