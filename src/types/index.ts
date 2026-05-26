// ─── Task ────────────────────────────────────────────────────────────────────

export type TaskStatus = 'not_started' | 'in_progress' | 'at_risk' | 'delayed' | 'complete'

export interface Task {
  id: string
  name: string
  group: string
  wbsCode: string
  s: string         // planned start — YYYY-MM-DD
  e: string         // planned end   — YYYY-MM-DD
  actualStart: string | null
  actualFinish: string | null
  actualCost: number
  pct: number       // 0–100
  status: TaskStatus
  party: string | null
  notes: string
  milestone: boolean
  manualStatus: boolean
  manualPct: boolean
  /** @derived — read-only display value populated from Dependency[] edges during render.
   *  Never write to this field from new code. Mutations belong in `dependencies`. */
  deps: string[]
}

// ─── Dependency edge (C1 — per-edge type+lag) ─────────────────────────────────

export type DepType = 'FS' | 'SS' | 'FF' | 'SF'

export interface Dependency {
  fromId: string
  toId: string
  type: DepType
  lag: number   // calendar days; negative = lead
}

// ─── Resources ───────────────────────────────────────────────────────────────

export type ResourceCategory = 'labor' | 'equipment' | 'material'

export interface Resource {
  id: string
  name: string
  category: ResourceCategory
  unit: string
  capacity: number
  costRate: number
  color: string
}

export interface ResourceAssignment {
  id: string
  taskId: string
  resourceId: string
  quantity: number
  notes: string
}

// ─── Groups / Parties ────────────────────────────────────────────────────────

export interface Group {
  id: string
  name: string
  color: string
  parentId: string | null
  wbsCode: string
}

export interface GroupNode {
  id: string
  depth: number
  parentId: string | null
  wbsCode: string
}

export interface GroupRollup {
  taskCount: number
  completionPct: number
  totalCost: number
  resourceCount: number
}

export interface Party {
  id: string
  name: string
  abbr: string
  color: string
}

// ─── Notes / Log ─────────────────────────────────────────────────────────────

export interface Note {
  id: string
  taskId: string
  text: string
  when: string   // ISO timestamp
}

// ─── Baseline ────────────────────────────────────────────────────────────────

export interface Baseline {
  id: string
  name: string
  date: string   // YYYY-MM-DD snapshot date
  reason: string
  lockedAt: string
  author?: string
  supersededById?: string
  tasks: Task[]
}

export interface BaselineSlippedTaskDiff {
  taskId: string
  name: string
  baselineAFinish: string
  baselineBFinish: string
  slipDays: number
  costDelta: number
}

export interface BaselineAddedTaskDiff {
  taskId: string
  name: string
  finish: string
  costDelta: number
}

export interface BaselineRemovedTaskDiff {
  taskId: string
  name: string
  finish: string
  costDelta: number
}

export interface BaselineDiff {
  slipped: BaselineSlippedTaskDiff[]
  added: BaselineAddedTaskDiff[]
  removed: BaselineRemovedTaskDiff[]
  totals: {
    totalSlipDays: number
    netTaskCountChange: number
    totalCostDelta: number
  }
}

export type ChangeOrderStatus = 'draft' | 'approved' | 'rejected'

export interface ChangeOrder {
  id: string
  number: string
  name: string
  reason: string
  status: ChangeOrderStatus
  createdAt: string
  lockedAt: string
  author?: string
  affectedTaskIds: string[]
  daysImpact: number
  costImpact?: number
  baselineLinkId?: string
}

export interface VarianceSnapshot {
  date: string
  activeBaselineId: string
  projectFinishVariance: number
  criticalPathLength: number
  compositeHealthScore?: number | null
}

// ─── Reporting / analytics ───────────────────────────────────────────────────

export type SCurveBucketing = 'weekly' | 'monthly'

export interface SCurvePoint {
  date: string
  plannedPct: number
  actualPct: number
}

export interface SCurveSeries {
  bucketing: SCurveBucketing
  points: SCurvePoint[]
  variancePct: number
}

export interface EVMResult {
  pv: number
  ev: number
  ac: number
  spi: number | null
  cpi: number | null
}

export interface MonthlyCashFlowBucket {
  month: string
  labor: number
  equipment: number
  material: number
  total: number
}

export interface ExecutiveVarianceItem {
  taskId: string
  name: string
  baselineFinish: string
  currentFinish: string
  slipDays: number
}

export interface ExecutiveRiskItem {
  checkId: number
  name: string
  severity: number
}

export interface ExecutiveMilestoneItem {
  taskId: string
  name: string
  finish: string
}

export interface ExecutiveReportData {
  statusDate: string
  healthScore: number
  spi: number | null
  topVariances: ExecutiveVarianceItem[]
  topRisks: ExecutiveRiskItem[]
  nextMilestones: ExecutiveMilestoneItem[]
}

export interface WeeklyReportData {
  weekEnding: string
  completedTaskIds: string[]
  plannedTaskIds: string[]
  varianceTaskIds: string[]
  recentChangeOrderIds: string[]
}

// ─── Workweek / Calendar ─────────────────────────────────────────────────────

export interface WorkweekConfig {
  mon: boolean
  tue: boolean
  wed: boolean
  thu: boolean
  fri: boolean
  sat: boolean
  sun: boolean
}

// ─── Onboarding ──────────────────────────────────────────────────────────────

export type OnboardingPhase = 'fresh' | 'first_added' | 'baseline_tip' | 'complete'

// ─── Ghost style (C2 — persisted) ────────────────────────────────────────────

export type GhostStyle = 'stripe' | 'solid' | 'outline'

// ─── Persisted state (localStorage) ─────────────────────────────────────────

/** Current persisted-state schema version. Bump in lockstep with `migrateState` in storage.ts. */
export const PERSISTED_SCHEMA_VERSION = 4

export interface PersistedState {
  /** Stamped on save by storage.ts. Absent on legacy (v0) payloads. */
  persistedSchemaVersion: number
  projectName: string
  tasks: Task[]
  groups: Group[]
  parties: Party[]
  notes: Note[]
  dependencies: Dependency[]   // C1 — per-edge storage
  collapsedGroups: string[]
  baselines: Baseline[]
  workweek: WorkweekConfig
  holidays: string[]           // YYYY-MM-DD strings
  onboardingPhase: OnboardingPhase
  ghostStyle: GhostStyle       // C2 — persisted
  resources: Resource[]
  assignments: ResourceAssignment[]
  changeOrders: ChangeOrder[]
  varianceSnapshots: VarianceSnapshot[]
}

// ─── Visible rows (task list rendering) ──────────────────────────────────────

export type VisibleRow =
  | { kind: 'group'; groupId: string; name: string; color: string; count: number; collapsed: boolean }
  | { kind: 'task'; task: Task }

// ─── Gantt timeline ──────────────────────────────────────────────────────────

export interface TimelineBucket {
  label: string
  year?: number
  days: number
  offset: number   // px from gantt left edge
}

export interface Timeline {
  min: Date
  max: Date
  totalDays: number
  totalPx: number
  months: TimelineBucket[]
  quarters: TimelineBucket[]
  years: TimelineBucket[]
  weeks: Array<{ offset: number; label: string }>
  days: Array<{ offset: number; date: Date }>
}

// ─── CPM output ──────────────────────────────────────────────────────────────

export interface CpmResult {
  /** task IDs on the critical path (total float = 0) */
  criticalIds: Set<string>
  earlyStart: Map<string, number>
  earlyFinish: Map<string, number>
  lateStart: Map<string, number>
  lateFinish: Map<string, number>
  totalFloat: Map<string, number>
}

// ─── Schedule quality / DCMA ────────────────────────────────────────────────

export type DcmaCheckId =
  | 1 | 2 | 3 | 4 | 5 | 6 | 7
  | 8 | 9 | 10 | 11 | 12 | 13 | 14
  | 15 | 16

export interface DcmaCheckResult {
  id: DcmaCheckId
  name: string
  passed: boolean
  score: number
  threshold: number
  plainEnglish: string
  affectedTaskIds: string[]
  note?: string
}

export interface DcmaAssessmentResult {
  checks: DcmaCheckResult[]
  generatedAt: string
}

// ─── Filter state ────────────────────────────────────────────────────────────

export interface FilterState {
  phases: string[]    // group IDs
  statuses: TaskStatus[]
  parties: string[]   // party IDs
}

// ─── Zoom ─────────────────────────────────────────────────────────────────────

export interface ZoomLevel {
  label: string
  dayPx: number
}
