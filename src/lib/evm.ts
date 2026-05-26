import type { Baseline, EVMResult, Resource, ResourceAssignment, Task, WorkweekConfig } from '../types'
import { workdays } from './workdays'

const DEFAULT_WORKWEEK: WorkweekConfig = {
  mon: true,
  tue: true,
  wed: true,
  thu: true,
  fri: true,
  sat: false,
  sun: false,
}

function computeTaskCost(task: Task, assignments: ResourceAssignment[], resources: Map<string, Resource>): number {
  const taskAssignments = assignments.filter((assignment) => assignment.taskId === task.id && assignment.quantity > 0)
  const duration = Math.max(1, workdays(task.s, task.e, DEFAULT_WORKWEEK, []))
  return taskAssignments.reduce((sum, assignment) => {
    const resource = resources.get(assignment.resourceId)
    if (!resource || resource.costRate < 0) return sum
    if (resource.category === 'material') {
      return sum + assignment.quantity * resource.costRate
    }
    return sum + assignment.quantity * duration * resource.costRate
  }, 0)
}

function plannedTaskRatio(task: Task, statusDate: string): number {
  if (statusDate < task.s) return 0
  if (statusDate >= task.e) return 1
  const total = Math.max(1, workdays(task.s, task.e, DEFAULT_WORKWEEK, []))
  const elapsed = Math.max(0, workdays(task.s, statusDate, DEFAULT_WORKWEEK, []))
  return Math.min(1, elapsed / total)
}

export function computeEVM(
  tasks: Task[],
  baseline: Baseline | null,
  assignments: ResourceAssignment[],
  resources: Resource[],
  statusDate: string,
  totalActualCost = 0,
): EVMResult {
  if (!baseline) return { pv: 0, ev: 0, ac: totalActualCost, spi: null, cpi: null }

  const resourceMap = new Map(resources.map((resource) => [resource.id, resource]))
  const currentById = new Map(tasks.map((task) => [task.id, task]))
  let pv = 0
  let ev = 0

  baseline.tasks.forEach((baselineTask) => {
    const baselineCost = computeTaskCost(baselineTask, assignments, resourceMap)
    pv += baselineCost * plannedTaskRatio(baselineTask, statusDate)
    const currentTask = currentById.get(baselineTask.id)
    const actualProgress = currentTask ? Math.max(0, Math.min(100, currentTask.pct)) / 100 : plannedTaskRatio(baselineTask, statusDate)
    ev += baselineCost * actualProgress
  })

  const spi = pv > 0 ? ev / pv : null
  const cpi = totalActualCost > 0 ? ev / totalActualCost : null
  return { pv, ev, ac: totalActualCost, spi, cpi }
}
