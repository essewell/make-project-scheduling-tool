import type { DcmaAssessmentResult, Task } from '../types'
import type { FloatBucketCount } from './floatDistribution'

export interface HealthSubscores {
  logicSubscore: number | null
  resourceSubscore: number | null
  baselineSubscore: number | null
  floatSubscore: number | null
  completenessSubscore: number | null
}

export interface HealthWeights {
  logic: number
  resource: number
  baseline: number
  float: number
  completeness: number
}

export interface ScheduleHealthResult {
  score: number
  normalizedWeights: HealthWeights
  subscores: HealthSubscores
}

const DEFAULT_WEIGHTS: HealthWeights = {
  logic: 0.3,
  resource: 0.25,
  baseline: 0.2,
  float: 0.15,
  completeness: 0.1,
}

function clamp01(value: number): number {
  if (value < 0) return 0
  if (value > 1) return 1
  return value
}

function clamp100(value: number): number {
  if (value < 0) return 0
  if (value > 100) return 100
  return value
}

function normalizeWeights(subscores: HealthSubscores, weights: HealthWeights): HealthWeights {
  const active = {
    logic: subscores.logicSubscore !== null,
    resource: subscores.resourceSubscore !== null,
    baseline: subscores.baselineSubscore !== null,
    float: subscores.floatSubscore !== null,
    completeness: subscores.completenessSubscore !== null,
  }

  const activeSum =
    (active.logic ? weights.logic : 0) +
    (active.resource ? weights.resource : 0) +
    (active.baseline ? weights.baseline : 0) +
    (active.float ? weights.float : 0) +
    (active.completeness ? weights.completeness : 0)

  if (activeSum <= 0) {
    return { logic: 0, resource: 0, baseline: 0, float: 0, completeness: 0 }
  }

  return {
    logic: active.logic ? weights.logic / activeSum : 0,
    resource: active.resource ? weights.resource / activeSum : 0,
    baseline: active.baseline ? weights.baseline / activeSum : 0,
    float: active.float ? weights.float / activeSum : 0,
    completeness: active.completeness ? weights.completeness / activeSum : 0,
  }
}

export function computeCompositeHealthScore(
  subscores: HealthSubscores,
  normalizedWeights: HealthWeights,
): number {
  return clamp100(Math.round(
    (normalizedWeights.logic * (subscores.logicSubscore ?? 0)) +
    (normalizedWeights.resource * (subscores.resourceSubscore ?? 0)) +
    (normalizedWeights.baseline * (subscores.baselineSubscore ?? 0)) +
    (normalizedWeights.float * (subscores.floatSubscore ?? 0)) +
    (normalizedWeights.completeness * (subscores.completenessSubscore ?? 0)),
  ))
}

function getCheckScore(assessment: DcmaAssessmentResult, checkId: number): number | null {
  const check = assessment.checks.find((candidate) => candidate.id === checkId)
  if (!check) return null
  if (check.id === 13 || check.id === 14) {
    return clamp100(check.score * 100)
  }
  return clamp100(check.score)
}

export interface BuildHealthInput {
  assessment: DcmaAssessmentResult
  tasks: Task[]
  overAllocatedResourceCount: number
  totalResourceCount: number
  floatDistribution: FloatBucketCount[]
  weights?: Partial<HealthWeights>
}

export function computeScheduleHealth(input: BuildHealthInput): ScheduleHealthResult {
  const weights: HealthWeights = {
    ...DEFAULT_WEIGHTS,
    ...(input.weights ?? {}),
  }

  const logicCheckIds = [1, 2, 3, 4]
  const logicScores = logicCheckIds
    .map((id) => getCheckScore(input.assessment, id))
    .filter((score): score is number => score !== null)
  const logicSubscore = logicScores.length > 0
    ? clamp100(logicScores.reduce((sum, score) => sum + score, 0) / logicScores.length)
    : null

  const resourceSubscore = input.totalResourceCount > 0
    ? clamp100(100 - (100 * (input.overAllocatedResourceCount / input.totalResourceCount)))
    : 100

  const beiCheck = input.assessment.checks.find((check) => check.id === 14)
  const baselineSubscore = beiCheck && !beiCheck.note
    ? clamp100(beiCheck.score * 100)
    : null

  const totalTaskCount = input.floatDistribution.reduce((sum, bucket) => sum + bucket.count, 0)
  const extremeCount = input.floatDistribution
    .filter((bucket) => bucket.key === 'neg' || bucket.key === 'gt100')
    .reduce((sum, bucket) => sum + bucket.count, 0)
  const extremePct = totalTaskCount > 0 ? (extremeCount / totalTaskCount) * 100 : 0
  const floatSubscore = clamp100(100 - (100 * clamp01(extremePct / 5)))

  const resourcedTaskCount = new Set(
    input.assessment.checks.find((check) => check.id === 10)?.affectedTaskIds ?? [],
  )
  const linkedTaskCount = new Set(
    input.assessment.checks.find((check) => check.id === 1)?.affectedTaskIds ?? [],
  )
  const completeCount = input.tasks.filter((task) => task.status === 'complete').length
  const totalTasks = input.tasks.length
  const resourcedPct = totalTasks > 0 ? ((totalTasks - resourcedTaskCount.size) / totalTasks) * 100 : 100
  const linkedPct = totalTasks > 0 ? ((totalTasks - linkedTaskCount.size) / totalTasks) * 100 : 100
  const completionPct = totalTasks > 0 ? (completeCount / totalTasks) * 100 : 100
  const completenessSubscore = clamp100((resourcedPct + linkedPct + completionPct) / 3)

  const subscores: HealthSubscores = {
    logicSubscore,
    resourceSubscore,
    baselineSubscore,
    floatSubscore,
    completenessSubscore,
  }

  const normalizedWeights = normalizeWeights(subscores, weights)
  const score = computeCompositeHealthScore(subscores, normalizedWeights)

  return { score, normalizedWeights, subscores }
}
