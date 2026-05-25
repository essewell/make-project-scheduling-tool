import { daysBetween } from './dates'
import type {
  Baseline,
  BaselineAddedTaskDiff,
  BaselineDiff,
  BaselineRemovedTaskDiff,
  BaselineSlippedTaskDiff,
} from '../types'

export function findBaselineById(baselines: Baseline[], baselineId: string): Baseline | null {
  return baselines.find((baseline) => baseline.id === baselineId) ?? null
}

type LockableBaseline = Baseline & { lockedAt?: string }

export function assertNotLocked(baseline: LockableBaseline): void {
  if (baseline.lockedAt && baseline.lockedAt.length > 0) {
    throw new Error(`Baseline "${baseline.name}" is locked and cannot be modified.`)
  }
}

export function applyBaselineMetadataUpdate(
  baseline: LockableBaseline,
  patch: Partial<Pick<LockableBaseline, 'name' | 'reason' | 'author'>>,
): LockableBaseline {
  assertNotLocked(baseline)
  return {
    ...baseline,
    ...patch,
  }
}

type CostLookup = Map<string, number> | Record<string, number>

function readCost(costs: CostLookup | undefined, taskId: string): number {
  if (!costs) return 0
  if (costs instanceof Map) {
    return costs.get(taskId) ?? 0
  }
  return costs[taskId] ?? 0
}

export function compareBaselines(
  baselineA: Baseline,
  baselineB: Baseline,
  costByTaskIdA?: CostLookup,
  costByTaskIdB?: CostLookup,
): BaselineDiff {
  const taskMapA = new Map(baselineA.tasks.map((task) => [task.id, task]))
  const taskMapB = new Map(baselineB.tasks.map((task) => [task.id, task]))

  const slipped: BaselineSlippedTaskDiff[] = []
  const added: BaselineAddedTaskDiff[] = []
  const removed: BaselineRemovedTaskDiff[] = []

  for (const taskB of baselineB.tasks) {
    const taskA = taskMapA.get(taskB.id)
    if (!taskA) {
      added.push({
        taskId: taskB.id,
        name: taskB.name,
        finish: taskB.e,
        costDelta: readCost(costByTaskIdB, taskB.id),
      })
      continue
    }

    const slipDays = daysBetween(taskA.e, taskB.e)
    if (slipDays > 0) {
      slipped.push({
        taskId: taskB.id,
        name: taskB.name,
        baselineAFinish: taskA.e,
        baselineBFinish: taskB.e,
        slipDays,
        costDelta: readCost(costByTaskIdB, taskB.id) - readCost(costByTaskIdA, taskB.id),
      })
    }
  }

  for (const taskA of baselineA.tasks) {
    if (taskMapB.has(taskA.id)) continue
    removed.push({
      taskId: taskA.id,
      name: taskA.name,
      finish: taskA.e,
      costDelta: -readCost(costByTaskIdA, taskA.id),
    })
  }

  slipped.sort((left, right) => right.slipDays - left.slipDays)

  const totalSlipDays = slipped.reduce((sum, row) => sum + row.slipDays, 0)
  const netTaskCountChange = added.length - removed.length
  const totalCostDelta =
    slipped.reduce((sum, row) => sum + row.costDelta, 0) +
    added.reduce((sum, row) => sum + row.costDelta, 0) +
    removed.reduce((sum, row) => sum + row.costDelta, 0)

  return {
    slipped,
    added,
    removed,
    totals: {
      totalSlipDays,
      netTaskCountChange,
      totalCostDelta,
    },
  }
}
