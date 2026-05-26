import type {
  Baseline,
  CpmResult,
  DcmaAssessmentResult,
  DcmaCheckId,
  DcmaCheckResult,
  Dependency,
  Group,
  Resource,
  ResourceAssignment,
  Task,
} from '../types'
import { computeCriticalPath } from './cpm'
import { addDays, daysBetween } from './dates'

export interface DcmaAssessmentContext {
  tasks: Task[]
  groups: Group[]
  dependencies: Dependency[]
  baselines: Baseline[]
  activeBaselineId: string | null
  resources: Resource[]
  assignments: ResourceAssignment[]
  cpm: CpmResult | null
  today: string
}

export interface DcmaCheckDefinition {
  id: DcmaCheckId
  name: string
  threshold: number
  plainEnglish: string
  run: (context: DcmaAssessmentContext) => DcmaCheckResult
}

const CPLI_DELAY_DAYS = 600

function toPercent(numerator: number, denominator: number): number {
  if (denominator <= 0) return 100
  return (numerator / denominator) * 100
}

function buildTaskEdgeMaps(tasks: Task[], dependencies: Dependency[]): {
  predecessorCount: Map<string, number>
  successorCount: Map<string, number>
} {
  const ids = new Set(tasks.map((task) => task.id))
  const predecessorCount = new Map<string, number>()
  const successorCount = new Map<string, number>()

  tasks.forEach((task) => {
    predecessorCount.set(task.id, 0)
    successorCount.set(task.id, 0)
  })

  dependencies.forEach((dep) => {
    if (!ids.has(dep.fromId) || !ids.has(dep.toId)) return
    predecessorCount.set(dep.toId, (predecessorCount.get(dep.toId) ?? 0) + 1)
    successorCount.set(dep.fromId, (successorCount.get(dep.fromId) ?? 0) + 1)
  })

  return { predecessorCount, successorCount }
}

function checkLogic(context: DcmaAssessmentContext): DcmaCheckResult {
  const threshold = 95
  const { predecessorCount, successorCount } = buildTaskEdgeMaps(context.tasks, context.dependencies)
  const affectedTaskIds = context.tasks
    .filter((task) => (predecessorCount.get(task.id) ?? 0) === 0 || (successorCount.get(task.id) ?? 0) === 0)
    .map((task) => task.id)
  const linkedCount = context.tasks.length - affectedTaskIds.length
  const score = toPercent(linkedCount, context.tasks.length)

  return {
    id: 1,
    name: 'Logic',
    passed: score >= threshold,
    score,
    threshold,
    plainEnglish: 'Tasks should be connected on both sides — orphans risk slipping silently.',
    affectedTaskIds,
  }
}

function checkLeads(context: DcmaAssessmentContext): DcmaCheckResult {
  const threshold = 0
  const affectedTaskIds = Array.from(
    new Set(
      context.dependencies
        .filter((dep) => dep.lag < 0)
        .flatMap((dep) => [dep.fromId, dep.toId]),
    ),
  )
  const score = context.dependencies.filter((dep) => dep.lag < 0).length
  return {
    id: 2,
    name: 'Leads',
    passed: score <= threshold,
    score,
    threshold,
    plainEnglish: 'Negative lag hides real overlap.',
    affectedTaskIds,
  }
}

function checkLags(context: DcmaAssessmentContext): DcmaCheckResult {
  const threshold = 5
  const lagged = context.dependencies.filter((dep) => dep.lag > 0)
  const score = toPercent(lagged.length, context.dependencies.length)
  const affectedTaskIds = Array.from(new Set(lagged.flatMap((dep) => [dep.fromId, dep.toId])))
  return {
    id: 3,
    name: 'Lags',
    passed: score <= threshold,
    score,
    threshold,
    plainEnglish: 'Excessive lag inflates duration without showing why work is not progressing.',
    affectedTaskIds,
  }
}

function checkRelationshipTypes(context: DcmaAssessmentContext): DcmaCheckResult {
  const threshold = 90
  const fsCount = context.dependencies.filter((dep) => dep.type === 'FS').length
  const score = toPercent(fsCount, context.dependencies.length)
  const affectedTaskIds = Array.from(
    new Set(
      context.dependencies
        .filter((dep) => dep.type !== 'FS')
        .flatMap((dep) => [dep.fromId, dep.toId]),
    ),
  )
  return {
    id: 4,
    name: 'Relationship Types',
    passed: score >= threshold,
    score,
    threshold,
    plainEnglish: 'FS should be dominant as default logic.',
    affectedTaskIds,
  }
}

function checkHardConstraints(_context: DcmaAssessmentContext): DcmaCheckResult {
  return {
    id: 5,
    name: 'Hard Constraints',
    passed: true,
    score: 0,
    threshold: 5,
    plainEnglish: 'Hard constraints should be minimized.',
    affectedTaskIds: [],
    note: 'Constraint fields are not modeled in v1.4. This check is intentionally neutral.',
  }
}

function checkHighFloat(context: DcmaAssessmentContext): DcmaCheckResult {
  const threshold = 5
  const totalFloat = context.cpm?.totalFloat
  if (!totalFloat) {
    return {
      id: 6,
      name: 'High Float',
      passed: true,
      score: 0,
      threshold,
      plainEnglish: 'Too much high float suggests missing logic links.',
      affectedTaskIds: [],
      note: 'No CPM result available; treating as neutral.',
    }
  }
  const affectedTaskIds = context.tasks
    .filter((task) => (totalFloat.get(task.id) ?? 0) > 44)
    .map((task) => task.id)
  const score = toPercent(affectedTaskIds.length, context.tasks.length)
  return {
    id: 6,
    name: 'High Float',
    passed: score < threshold,
    score,
    threshold,
    plainEnglish: 'Too much high float suggests missing logic links.',
    affectedTaskIds,
  }
}

function checkNegativeFloat(context: DcmaAssessmentContext): DcmaCheckResult {
  const threshold = 0
  const totalFloat = context.cpm?.totalFloat
  if (!totalFloat) {
    return {
      id: 7,
      name: 'Negative Float',
      passed: true,
      score: 0,
      threshold,
      plainEnglish: 'Negative float indicates an impossible schedule condition.',
      affectedTaskIds: [],
      note: 'No CPM result available; treating as neutral.',
    }
  }
  const affectedTaskIds = context.tasks
    .filter((task) => (totalFloat.get(task.id) ?? 0) < 0)
    .map((task) => task.id)
  const score = affectedTaskIds.length
  return {
    id: 7,
    name: 'Negative Float',
    passed: score <= threshold,
    score,
    threshold,
    plainEnglish: 'Negative float indicates an impossible schedule condition.',
    affectedTaskIds,
  }
}

function checkHighDuration(context: DcmaAssessmentContext): DcmaCheckResult {
  const threshold = 5
  const affectedTaskIds = context.tasks
    .filter((task) => !task.milestone && (daysBetween(task.s, task.e) + 1) > 44)
    .map((task) => task.id)
  const score = toPercent(affectedTaskIds.length, context.tasks.length)
  return {
    id: 8,
    name: 'High Duration',
    passed: score < threshold,
    score,
    threshold,
    plainEnglish: 'Long tasks should be decomposed into smaller activities.',
    affectedTaskIds,
  }
}

function checkInvalidDates(context: DcmaAssessmentContext): DcmaCheckResult {
  const threshold = 0
  const affectedTaskIds = context.tasks
    .filter((task) => {
      if (task.actualStart && task.actualStart > context.today) return true
      if (task.actualFinish && task.actualFinish > context.today) return true
      if (task.actualStart && task.actualFinish && task.actualFinish < task.actualStart) return true
      return false
    })
    .map((task) => task.id)
  const score = affectedTaskIds.length
  return {
    id: 9,
    name: 'Invalid Dates',
    passed: score <= threshold,
    score,
    threshold,
    plainEnglish: 'Future actuals and stale dates indicate data integrity issues.',
    affectedTaskIds,
  }
}

function checkResources(context: DcmaAssessmentContext): DcmaCheckResult {
  const threshold = 95
  const assignmentTaskIds = new Set(context.assignments.map((assignment) => assignment.taskId))
  const workTasks = context.tasks.filter((task) => !task.milestone)
  const affectedTaskIds = workTasks
    .filter((task) => !assignmentTaskIds.has(task.id))
    .map((task) => task.id)
  const resourcedCount = workTasks.length - affectedTaskIds.length
  const score = toPercent(resourcedCount, workTasks.length)
  return {
    id: 10,
    name: 'Resources',
    passed: score >= threshold,
    score,
    threshold,
    plainEnglish: 'Most non-milestone work should be resource-assigned.',
    affectedTaskIds,
  }
}

function checkMissedTasks(context: DcmaAssessmentContext): DcmaCheckResult {
  const threshold = 5
  const affectedTaskIds = context.tasks
    .filter((task) => !task.milestone && task.e < context.today && task.status !== 'complete')
    .map((task) => task.id)
  const score = toPercent(affectedTaskIds.length, context.tasks.length)
  return {
    id: 11,
    name: 'Missed Tasks',
    passed: score < threshold,
    score,
    threshold,
    plainEnglish: 'Past-due incomplete tasks should be minimized.',
    affectedTaskIds,
  }
}

function checkCriticalPathTest(context: DcmaAssessmentContext): DcmaCheckResult {
  const threshold = 100
  if (!context.cpm || context.cpm.criticalIds.size === 0 || context.tasks.length === 0) {
    return {
      id: 12,
      name: 'Critical Path Test',
      passed: false,
      score: 0,
      threshold,
      plainEnglish: 'Forced-delay test should propagate to project finish.',
      affectedTaskIds: [],
      note: 'No critical path available to run forced-delay test.',
    }
  }

  const baseEnd = context.tasks.reduce((max, task) => (task.e > max ? task.e : max), context.tasks[0]!.e)
  const delayedTaskId = context.tasks.find((task) => context.cpm!.criticalIds.has(task.id))?.id
  if (!delayedTaskId) {
    return {
      id: 12,
      name: 'Critical Path Test',
      passed: false,
      score: 0,
      threshold,
      plainEnglish: 'Forced-delay test should propagate to project finish.',
      affectedTaskIds: [],
      note: 'No critical task candidate found for forced-delay test.',
    }
  }

  const delayedTasks = context.tasks.map((task) => {
    if (task.id !== delayedTaskId) return task
    return {
      ...task,
      s: addDays(task.s, CPLI_DELAY_DAYS),
      e: addDays(task.e, CPLI_DELAY_DAYS),
    }
  })

  const delayedCpm = computeCriticalPath(delayedTasks, context.dependencies)
  if (!delayedCpm) {
    return {
      id: 12,
      name: 'Critical Path Test',
      passed: false,
      score: 0,
      threshold,
      plainEnglish: 'Forced-delay test should propagate to project finish.',
      affectedTaskIds: [delayedTaskId],
      note: 'Forced-delay graph produced a cycle in CPM recomputation.',
    }
  }

  const delayedEnd = delayedTasks.reduce((max, task) => (task.e > max ? task.e : max), delayedTasks[0]!.e)
  const shiftDays = daysBetween(baseEnd, delayedEnd)
  const score = Math.max(0, Math.min(100, (shiftDays / CPLI_DELAY_DAYS) * 100))
  return {
    id: 12,
    name: 'Critical Path Test',
    passed: score >= threshold,
    score,
    threshold,
    plainEnglish: 'Forced-delay test should propagate to project finish.',
    affectedTaskIds: [delayedTaskId],
  }
}

function checkCpli(context: DcmaAssessmentContext): DcmaCheckResult {
  const threshold = 0.95
  if (!context.cpm || context.tasks.length === 0 || context.cpm.criticalIds.size === 0) {
    return {
      id: 13,
      name: 'CPLI',
      passed: false,
      score: 0,
      threshold,
      plainEnglish: 'CPLI below threshold indicates insufficient recovery margin.',
      affectedTaskIds: [],
      note: 'No critical-path context available for CPLI calculation.',
    }
  }

  const projectEnd = context.tasks.reduce((max, task) => (task.e > max ? task.e : max), context.tasks[0]!.e)
  const remainingDuration = Math.max(0, daysBetween(context.today, projectEnd))
  if (remainingDuration === 0) {
    return {
      id: 13,
      name: 'CPLI',
      passed: true,
      score: 1,
      threshold,
      plainEnglish: 'CPLI below threshold indicates insufficient recovery margin.',
      affectedTaskIds: [],
      note: 'Project remaining duration is zero; CPLI treated as complete.',
    }
  }

  const cpFloats = context.tasks
    .filter((task) => context.cpm!.criticalIds.has(task.id))
    .map((task) => context.cpm!.totalFloat.get(task.id) ?? 0)
  const criticalFloat = cpFloats.length > 0 ? Math.max(...cpFloats) : 0
  const score = (remainingDuration + criticalFloat) / remainingDuration

  return {
    id: 13,
    name: 'CPLI',
    passed: score >= threshold,
    score,
    threshold,
    plainEnglish: 'CPLI below threshold indicates insufficient recovery margin.',
    affectedTaskIds: context.tasks.filter((task) => context.cpm!.criticalIds.has(task.id)).map((task) => task.id),
  }
}

function checkBei(context: DcmaAssessmentContext): DcmaCheckResult {
  const threshold = 0.95
  if (!context.activeBaselineId) {
    return {
      id: 14,
      name: 'BEI',
      passed: false,
      score: 0,
      threshold,
      plainEnglish: 'BEI below threshold signals execution behind baseline intent.',
      affectedTaskIds: [],
      note: 'N/A — select an active baseline.',
    }
  }

  const baseline = context.baselines.find((item) => item.id === context.activeBaselineId)
  if (!baseline) {
    return {
      id: 14,
      name: 'BEI',
      passed: false,
      score: 0,
      threshold,
      plainEnglish: 'BEI below threshold signals execution behind baseline intent.',
      affectedTaskIds: [],
      note: 'N/A — select an active baseline.',
    }
  }

  const baselineMap = new Map(baseline.tasks.map((task) => [task.id, task]))
  const planned = context.tasks.filter((task) => {
    const baseTask = baselineMap.get(task.id)
    return Boolean(baseTask && baseTask.e <= context.today)
  })
  const completedOnOrBeforeBaseline = planned.filter((task) => {
    const baseTask = baselineMap.get(task.id)
    if (!baseTask || !task.actualFinish) return false
    return task.actualFinish <= baseTask.e
  })
  const score = planned.length > 0 ? completedOnOrBeforeBaseline.length / planned.length : 1
  const affectedTaskIds = planned
    .filter((task) => !completedOnOrBeforeBaseline.some((done) => done.id === task.id))
    .map((task) => task.id)

  return {
    id: 14,
    name: 'BEI',
    passed: score >= threshold,
    score,
    threshold,
    plainEnglish: 'BEI below threshold signals execution behind baseline intent.',
    affectedTaskIds,
  }
}

function checkWbsCompleteness(context: DcmaAssessmentContext): DcmaCheckResult {
  const threshold = 100
  const groupById = new Map(context.groups.map((group) => [group.id, group]))
  const taskCountByGroup = new Map<string, number>()
  const childGroupCountByParent = new Map<string, number>()

  context.tasks.forEach((task) => {
    if (!task.group) return
    taskCountByGroup.set(task.group, (taskCountByGroup.get(task.group) ?? 0) + 1)
  })
  context.groups.forEach((group) => {
    if (!group.parentId) return
    childGroupCountByParent.set(group.parentId, (childGroupCountByParent.get(group.parentId) ?? 0) + 1)
  })

  const invalidTaskIds = context.tasks
    .filter((task) => !task.group || !groupById.has(task.group))
    .map((task) => task.id)
  const orphanGroupIds = context.groups
    .filter((group) => group.parentId !== null && !groupById.has(group.parentId))
    .map((group) => group.id)
  const emptyGroupIds = context.groups
    .filter((group) => (taskCountByGroup.get(group.id) ?? 0) === 0 && (childGroupCountByParent.get(group.id) ?? 0) === 0)
    .map((group) => group.id)

  const totalChecks = context.tasks.length + context.groups.length
  const invalidCount = invalidTaskIds.length + orphanGroupIds.length + emptyGroupIds.length
  const score = totalChecks > 0 ? Math.max(0, ((totalChecks - invalidCount) / totalChecks) * 100) : 100
  const affectedTaskIds = Array.from(new Set([...invalidTaskIds, ...orphanGroupIds, ...emptyGroupIds]))

  return {
    id: 15,
    name: 'WBS Completeness',
    passed: score >= threshold,
    score,
    threshold,
    plainEnglish: 'All tasks should belong to valid groups, and group hierarchy should be structurally complete.',
    affectedTaskIds,
  }
}

function checkResourceOverAllocation(context: DcmaAssessmentContext): DcmaCheckResult {
  const threshold = 100
  const taskById = new Map(context.tasks.map((task) => [task.id, task]))
  const resourceById = new Map(context.resources.map((resource) => [resource.id, resource]))
  const demandByResourceDay = new Map<string, number>()

  context.assignments.forEach((assignment) => {
    if (assignment.quantity <= 0) return
    const task = taskById.get(assignment.taskId)
    if (!task) return

    const spanDays = daysBetween(task.s, task.e)
    for (let offset = 0; offset <= spanDays; offset += 1) {
      const day = addDays(task.s, offset)
      const key = `${assignment.resourceId}::${day}`
      demandByResourceDay.set(key, (demandByResourceDay.get(key) ?? 0) + assignment.quantity)
    }
  })

  let totalDemandDays = 0
  let compliantDays = 0
  const overAllocatedResourceIds = new Set<string>()

  demandByResourceDay.forEach((demand, key) => {
    const [resourceId] = key.split('::')
    if (!resourceId) return
    const resource = resourceById.get(resourceId)
    if (!resource || resource.category === 'material') return
    totalDemandDays += 1
    const capacity = Math.max(0, resource.capacity)
    if (demand > capacity) {
      overAllocatedResourceIds.add(resourceId)
      return
    }
    compliantDays += 1
  })

  const score = totalDemandDays > 0 ? (compliantDays / totalDemandDays) * 100 : 100
  return {
    id: 16,
    name: 'Resource Over-Allocation',
    passed: score >= threshold,
    score,
    threshold,
    plainEnglish: 'Resources should fit within declared capacity; over-allocation indicates the plan is not executable as written.',
    affectedTaskIds: Array.from(overAllocatedResourceIds),
  }
}

export const DCMA_CHECKS: DcmaCheckDefinition[] = [
  {
    id: 1,
    name: 'Logic',
    threshold: 95,
    plainEnglish: 'Tasks should be connected on both sides — orphans risk slipping silently.',
    run: checkLogic,
  },
  {
    id: 2,
    name: 'Leads',
    threshold: 0,
    plainEnglish: 'Negative lag hides real overlap.',
    run: checkLeads,
  },
  {
    id: 3,
    name: 'Lags',
    threshold: 5,
    plainEnglish: 'Excessive lag inflates duration without showing why work is not progressing.',
    run: checkLags,
  },
  {
    id: 4,
    name: 'Relationship Types',
    threshold: 90,
    plainEnglish: 'FS should be dominant as default logic.',
    run: checkRelationshipTypes,
  },
  {
    id: 5,
    name: 'Hard Constraints',
    threshold: 5,
    plainEnglish: 'Hard constraints should be minimized.',
    run: checkHardConstraints,
  },
  {
    id: 6,
    name: 'High Float',
    threshold: 5,
    plainEnglish: 'Too much high float suggests missing logic links.',
    run: checkHighFloat,
  },
  {
    id: 7,
    name: 'Negative Float',
    threshold: 0,
    plainEnglish: 'Negative float indicates an impossible schedule condition.',
    run: checkNegativeFloat,
  },
  {
    id: 8,
    name: 'High Duration',
    threshold: 5,
    plainEnglish: 'Long tasks should be decomposed into smaller activities.',
    run: checkHighDuration,
  },
  {
    id: 9,
    name: 'Invalid Dates',
    threshold: 0,
    plainEnglish: 'Future actuals and stale dates indicate data integrity issues.',
    run: checkInvalidDates,
  },
  {
    id: 10,
    name: 'Resources',
    threshold: 95,
    plainEnglish: 'Most non-milestone work should be resource-assigned.',
    run: checkResources,
  },
  {
    id: 11,
    name: 'Missed Tasks',
    threshold: 5,
    plainEnglish: 'Past-due incomplete tasks should be minimized.',
    run: checkMissedTasks,
  },
  {
    id: 12,
    name: 'Critical Path Test',
    threshold: 100,
    plainEnglish: 'Forced-delay test should propagate to project finish.',
    run: checkCriticalPathTest,
  },
  {
    id: 13,
    name: 'CPLI',
    threshold: 0.95,
    plainEnglish: 'CPLI below threshold indicates insufficient recovery margin.',
    run: checkCpli,
  },
  {
    id: 14,
    name: 'BEI',
    threshold: 0.95,
    plainEnglish: 'BEI below threshold signals execution behind baseline intent.',
    run: checkBei,
  },
  {
    id: 15,
    name: 'WBS Completeness',
    threshold: 100,
    plainEnglish: 'All tasks should belong to valid groups, and group hierarchy should be structurally complete.',
    run: checkWbsCompleteness,
  },
  {
    id: 16,
    name: 'Resource Over-Allocation',
    threshold: 100,
    plainEnglish: 'Resources should fit within declared capacity; over-allocation indicates the plan is not executable as written.',
    run: checkResourceOverAllocation,
  },
]

export function runDcmaAssessment(context: DcmaAssessmentContext): DcmaAssessmentResult {
  const checks = DCMA_CHECKS.map((check) => check.run(context))
  return {
    checks,
    generatedAt: new Date().toISOString(),
  }
}
