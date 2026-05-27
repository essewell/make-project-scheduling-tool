import type {
  Baseline,
  DcmaAssessmentResult,
  ExecutiveMilestoneItem,
  ExecutiveReportData,
  ExecutiveRiskItem,
  ExecutiveVarianceItem,
  EVMResult,
  Task,
} from '../types'
import { daysBetween } from './dates'
import { computeVarianceByDelayCause } from './variance'

export interface ExecutiveReportInput {
  tasks: Task[]
  baseline: Baseline | null
  assessment: DcmaAssessmentResult
  healthScore: number
  evm: EVMResult
  statusDate: string
  delays: import('../types').Delay[]
}

function buildTopVariances(tasks: Task[], baseline: Baseline | null): ExecutiveVarianceItem[] {
  if (!baseline) return []
  const baselineById = new Map(baseline.tasks.map((task) => [task.id, task]))
  const variances: ExecutiveVarianceItem[] = tasks
    .map((task) => {
      const base = baselineById.get(task.id)
      if (!base) return null
      const slipDays = daysBetween(base.e, task.e)
      if (slipDays <= 0) return null
      return {
        taskId: task.id,
        name: task.name,
        baselineFinish: base.e,
        currentFinish: task.e,
        slipDays,
      }
    })
    .filter((item): item is ExecutiveVarianceItem => item !== null)
    .sort((left, right) => right.slipDays - left.slipDays)
  return variances.slice(0, 3)
}

function buildTopRisks(assessment: DcmaAssessmentResult): ExecutiveRiskItem[] {
  return assessment.checks
    .filter((check) => !check.passed)
    .map((check) => ({
      checkId: check.id,
      name: check.name,
      severity: Math.abs(check.threshold - check.score),
    }))
    .sort((left, right) => right.severity - left.severity)
    .slice(0, 3)
}

function buildNextMilestones(tasks: Task[], statusDate: string): ExecutiveMilestoneItem[] {
  return tasks
    .filter((task) => task.milestone && task.e >= statusDate)
    .sort((left, right) => left.e.localeCompare(right.e))
    .slice(0, 5)
    .map((task) => ({ taskId: task.id, name: task.name, finish: task.e }))
}

export function buildExecutiveReport(input: ExecutiveReportInput): ExecutiveReportData {
  return {
    statusDate: input.statusDate,
    healthScore: input.healthScore,
    spi: input.evm.spi,
    cpi: input.evm.cpi,
    topVariances: buildTopVariances(input.tasks, input.baseline),
    topRisks: buildTopRisks(input.assessment),
    nextMilestones: buildNextMilestones(input.tasks, input.statusDate),
    delayCauseAttribution: computeVarianceByDelayCause(input.delays),
  }
}
