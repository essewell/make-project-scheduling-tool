import type { Resource, ResourceAssignment, Task, WorkweekConfig } from '../types'
import { workdays } from './workdays'

export interface CostContext {
  resources: Resource[]
  assignments: ResourceAssignment[]
  workweek: WorkweekConfig
  holidays: string[]
}

function getResourceMap(resources: Resource[]): Map<string, Resource> {
  return new Map(resources.map((resource) => [resource.id, resource]))
}

export function computeTaskCost(task: Task, context: CostContext): number {
  const resourceMap = getResourceMap(context.resources)
  const taskAssignments = context.assignments.filter((assignment) => assignment.taskId === task.id)
  const durationWorkdays = workdays(task.s, task.e, context.workweek, context.holidays)

  return taskAssignments.reduce((sum, assignment) => {
    const resource = resourceMap.get(assignment.resourceId)
    if (!resource) return sum
    if (assignment.quantity <= 0 || resource.costRate < 0) return sum

    if (resource.category === 'material') {
      return sum + assignment.quantity * resource.costRate
    }

    return sum + assignment.quantity * durationWorkdays * resource.costRate
  }, 0)
}

export function computeTaskCosts(tasks: Task[], context: CostContext): Map<string, number> {
  const costs = new Map<string, number>()
  tasks.forEach((task) => {
    costs.set(task.id, computeTaskCost(task, context))
  })
  return costs
}

export function computeGroupCosts(tasks: Task[], taskCosts: Map<string, number>): Map<string, number> {
  const groupCosts = new Map<string, number>()
  tasks.forEach((task) => {
    const taskCost = taskCosts.get(task.id) ?? 0
    groupCosts.set(task.group, (groupCosts.get(task.group) ?? 0) + taskCost)
  })
  return groupCosts
}

export function computeProjectTotalCost(taskCosts: Map<string, number>): number {
  let total = 0
  taskCosts.forEach((value) => {
    total += value
  })
  return total
}
