import type {
  Baseline,
  CpmResult,
  DcmaAssessmentResult,
  DcmaCheckId,
  DcmaCheckResult,
  Dependency,
  Resource,
  ResourceAssignment,
  Task,
} from '../types'

export interface DcmaAssessmentContext {
  tasks: Task[]
  dependencies: Dependency[]
  baselines: Baseline[]
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

function createPendingCheck(
  id: DcmaCheckId,
  name: string,
  threshold: number,
  plainEnglish: string,
): DcmaCheckDefinition {
  return {
    id,
    name,
    threshold,
    plainEnglish,
    run: () => ({
      id,
      name,
      passed: false,
      score: 0,
      threshold,
      plainEnglish,
      affectedTaskIds: [],
      note: 'Pending implementation in Phase A.',
    }),
  }
}

export const DCMA_CHECKS: DcmaCheckDefinition[] = [
  createPendingCheck(1, 'Logic', 95, 'Tasks should be connected on both sides — orphans risk slipping silently.'),
  createPendingCheck(2, 'Leads', 0, 'Negative lag hides real overlap.'),
  createPendingCheck(3, 'Lags', 5, 'Excessive lag inflates duration without showing why work is not progressing.'),
  createPendingCheck(4, 'Relationship Types', 90, 'FS should be dominant as default logic.'),
  createPendingCheck(5, 'Hard Constraints', 5, 'Hard constraints should be minimized.'),
  createPendingCheck(6, 'High Float', 5, 'Too much high float suggests missing logic links.'),
  createPendingCheck(7, 'Negative Float', 0, 'Negative float indicates an impossible schedule condition.'),
  createPendingCheck(8, 'High Duration', 5, 'Long tasks should be decomposed into smaller activities.'),
  createPendingCheck(9, 'Invalid Dates', 0, 'Future actuals and stale dates indicate data integrity issues.'),
  createPendingCheck(10, 'Resources', 95, 'Most non-milestone work should be resource-assigned.'),
  createPendingCheck(11, 'Missed Tasks', 5, 'Past-due incomplete tasks should be minimized.'),
  createPendingCheck(12, 'Critical Path Test', 100, 'Forced-delay test should propagate to project finish.'),
  createPendingCheck(13, 'CPLI', 0.95, 'CPLI below threshold indicates insufficient recovery margin.'),
  createPendingCheck(14, 'BEI', 0.95, 'BEI below threshold signals execution behind baseline intent.'),
]

export function runDcmaAssessment(context: DcmaAssessmentContext): DcmaAssessmentResult {
  const checks = DCMA_CHECKS.map((check) => check.run(context))
  return {
    checks,
    generatedAt: new Date().toISOString(),
  }
}
