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

function groupAssignmentsByTask(assignments: ResourceAssignment[]): Map<string, ResourceAssignment[]> {
  const grouped = new Map<string, ResourceAssignment[]>()
  assignments.forEach((assignment) => {
    const bucket = grouped.get(assignment.taskId)
    if (bucket) {
      bucket.push(assignment)
      return
    }
    grouped.set(assignment.taskId, [assignment])
  })
  return grouped
}

export function computeTaskCost(task: Task, context: CostContext): number {
  const resourceMap = getResourceMap(context.resources)
  const assignmentsByTask = groupAssignmentsByTask(context.assignments)
  const taskAssignments = assignmentsByTask.get(task.id) ?? []
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
  const resourceMap = getResourceMap(context.resources)
  const assignmentsByTask = groupAssignmentsByTask(context.assignments)
  const costs = new Map<string, number>()

  tasks.forEach((task) => {
    const durationWorkdays = workdays(task.s, task.e, context.workweek, context.holidays)
    const taskAssignments = assignmentsByTask.get(task.id) ?? []
    const total = taskAssignments.reduce((sum, assignment) => {
      const resource = resourceMap.get(assignment.resourceId)
      if (!resource) return sum
      if (assignment.quantity <= 0 || resource.costRate < 0) return sum

      if (resource.category === 'material') {
        return sum + assignment.quantity * resource.costRate
      }

      return sum + assignment.quantity * durationWorkdays * resource.costRate
    }, 0)

    costs.set(task.id, total)
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
