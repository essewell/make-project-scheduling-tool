import type { Dependency, Task } from '../types'
import { daysBetween } from './dates'

export interface LogicValidationResult {
  orphanTaskIds: string[]
  negativeFloatTaskIds: string[]
  excessiveLagDependencyTaskIds: string[]
  excessiveLagDependencyPairs: Array<{ fromId: string; toId: string; lag: number }>
}

export function findOrphanTaskIds(tasks: Task[], dependencies: Dependency[]): string[] {
  const predecessorCount = new Map<string, number>()
  const successorCount = new Map<string, number>()

  tasks.forEach((task) => {
    predecessorCount.set(task.id, 0)
    successorCount.set(task.id, 0)
  })

  const taskIds = new Set(tasks.map((task) => task.id))
  dependencies.forEach((dependency) => {
    if (!taskIds.has(dependency.fromId) || !taskIds.has(dependency.toId)) return
    predecessorCount.set(dependency.toId, (predecessorCount.get(dependency.toId) ?? 0) + 1)
    successorCount.set(dependency.fromId, (successorCount.get(dependency.fromId) ?? 0) + 1)
  })

  return tasks
    .filter((task) => (predecessorCount.get(task.id) ?? 0) === 0 && (successorCount.get(task.id) ?? 0) === 0)
    .map((task) => task.id)
}

export function findNegativeFloatTaskIds(tasks: Task[], totalFloatByTaskId: Map<string, number>): string[] {
  return tasks
    .filter((task) => (totalFloatByTaskId.get(task.id) ?? 0) < 0)
    .map((task) => task.id)
}

export function findExcessiveLagDependencies(
  tasks: Task[],
  dependencies: Dependency[],
  ratio = 0.5,
): Array<{ fromId: string; toId: string; lag: number }> {
  const taskMap = new Map(tasks.map((task) => [task.id, task]))
  return dependencies.filter((dependency) => {
    if (dependency.lag <= 0) return false
    const predecessor = taskMap.get(dependency.fromId)
    if (!predecessor) return false
    const predecessorDuration = Math.max(1, daysBetween(predecessor.s, predecessor.e) + 1)
    return dependency.lag > predecessorDuration * ratio
  }).map((dependency) => ({
    fromId: dependency.fromId,
    toId: dependency.toId,
    lag: dependency.lag,
  }))
}

export function runLogicValidation(
  tasks: Task[],
  dependencies: Dependency[],
  totalFloatByTaskId: Map<string, number>,
  excessiveLagRatio = 0.5,
): LogicValidationResult {
  const orphanTaskIds = findOrphanTaskIds(tasks, dependencies)
  const negativeFloatTaskIds = findNegativeFloatTaskIds(tasks, totalFloatByTaskId)
  const excessiveLagDependencyPairs = findExcessiveLagDependencies(tasks, dependencies, excessiveLagRatio)
  const excessiveLagDependencyTaskIds = Array.from(
    new Set(excessiveLagDependencyPairs.flatMap((pair) => [pair.fromId, pair.toId])),
  )

  return {
    orphanTaskIds,
    negativeFloatTaskIds,
    excessiveLagDependencyTaskIds,
    excessiveLagDependencyPairs,
  }
}
