import { useState, useCallback, useMemo, useEffect, useRef, useTransition } from 'react'
import type { DelayType, PersistedState, Task, FilterState, OnboardingPhase, GhostStyle, Note, Baseline, ResourceAssignment } from '../types'
import { loadState, saveState } from '../lib/storage'
import { refreshAutoProgress } from '../lib/progress'
import { computeCriticalPath } from '../lib/cpm'
import { buildTimeline } from '../lib/timeline'
import { generateCSV, triggerCSVDownload } from '../lib/csv'
import { EXAMPLE_TASKS, EXAMPLE_GROUPS, EXAMPLE_PARTIES } from '../lib/exampleData'
import { computeProjectTotalCost, computeTaskCosts } from '../lib/cost'
import { computeResourceDemand } from '../lib/resourceDemand'
import { runDcmaAssessment } from '../lib/dcma'
import { buildFloatDistribution } from '../lib/floatDistribution'
import { computeScheduleHealth } from '../lib/health'
import { computeSCurve } from '../lib/scurve'
import { computeEVM } from '../lib/evm'
import { computeMonthlyCashFlow } from '../lib/cashflow'
import { buildExecutiveReport } from '../lib/reportData'
import { buildWeeklyReport } from '../lib/weeklyReport'
import { computeTotalActualCost } from '../lib/actualCost'
import { computeGroupRollup } from '../lib/rollups'
import { getDescendantTaskIds, walkGroupTree } from '../lib/wbs'
import { computeDelayImpact } from '../lib/delayImpact'
import { linkChangeOrderToTask, unlinkChangeOrderFromTask } from '../lib/changeOrders'
import { findBaselineById } from '../lib/baselines'
import { appendVarianceSnapshot, computeProjectFinishVariance, trimSnapshots } from '../lib/variance'
import { todayStr } from '../lib/dates'
import { useMidnightTicker } from '../hooks/useMidnightTicker'
import { useScrollSync } from '../hooks/useScrollSync'
import { useKeyboard } from '../hooks/useKeyboard'
import { useOnboarding } from '../hooks/useOnboarding'
import { DEFAULT_ZOOM_INDEX, ZOOM_LEVELS, UNDO_STACK_MAX, LARGE_TASK_THRESHOLD, HEALTH_WEIGHTS, MAX_OVERLAY_RESOURCES } from '../constants'
import { TaskList } from './task-list/TaskList'
import { Gantt } from './gantt/Gantt'
import { SidePanel } from './panels/SidePanel'
import { TopBar } from './topbar/TopBar'
import { FilterBar } from './filter/FilterBar'
import { SetupWizard } from './overlays/SetupWizard'
import { UndoToast } from './overlays/UndoToast'
import type { UndoEntry } from './overlays/UndoToast'
import { MobileTabSwitcher } from './mobile/MobileTabSwitcher'
import type { MobileTab } from './mobile/MobileTabSwitcher'
import { MobileBottomSheet } from './mobile/MobileBottomSheet'
import { LinkBuilderModal } from './modals/LinkBuilderModal'
import { WorkweekModal } from './modals/WorkweekModal'
import { GroupsManager } from './modals/GroupsManager'
import { PartiesManager } from './modals/PartiesManager'
import { ResourcesManager } from './modals/ResourcesManager'
import { CsvImportDialog } from './modals/CsvImportDialog'
import { PrintPreviewModal } from './modals/PrintPreviewModal'
import { QualityPanel } from './modals/QualityPanel'
import { CaptureBaselineModal, type CaptureBaselineValues } from './modals/CaptureBaselineModal'
import { ChangeOrderManager } from './modals/ChangeOrderManager'
import { BaselineCompareModal } from './modals/BaselineCompareModal'
import { ReportsModal } from './modals/ReportsModal'
import type { ReportType } from './reports/ReportTypeList'
import { SCurvePreview } from './reports/SCurvePreview'
import { EVMPreview } from './reports/EVMPreview'
import { CashFlowPreview } from './reports/CashFlowPreview'
import { ExecutiveReportPreview } from './reports/ExecutiveReportPreview'
import { WeeklyReportEditor } from './reports/WeeklyReportEditor'
import { StatBar } from './StatBar'

// ─── Initial state ────────────────────────────────────────────────────────────

const INITIAL_STATE: PersistedState = loadState()

const INITIAL_FILTER: FilterState = { phases: [], statuses: [], parties: [] }

// ─── App ─────────────────────────────────────────────────────────────────────

export function App() {
  // ── Persisted state ───────────────────────────────────────────────────────
  const [state, setState] = useState<PersistedState>(INITIAL_STATE)
  const { tasks, groups, parties, dependencies, notes, collapsedGroups,
          workweek, holidays, onboardingPhase,
          projectName, baselines, ghostStyle, assignments, changeOrders, varianceSnapshots,
          projectCalendar, delays } = state
  const resources = state.resources

  // ── Transient UI state ────────────────────────────────────────────────────
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [kbFocusId, setKbFocusId] = useState<string | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterState, setFilterState] = useState<FilterState>(INITIAL_FILTER)
  const [isPending, startTransition] = useTransition()
  const [zoomIndex, setZoomIndex] = useState(DEFAULT_ZOOM_INDEX)
  const [showCriticalPath, setShowCriticalPath] = useState(false)
  const [calendarOverlayEnabled, setCalendarOverlayEnabled] = useState(false)
  const [showCostColumn, setShowCostColumn] = useState(false)
  const [completionFlashId, setCompletionFlashId] = useState<string | null>(null)
  const [activeBaselineId, setActiveBaselineId] = useState<string | null>(null)
  const [selectedResourceIds, setSelectedResourceIds] = useState<string[]>([])
  const [compareResourcesMode, setCompareResourcesMode] = useState(false)
  const [histogramVisible, setHistogramVisible] = useState(false)
  const [qualityPanelOpen, setQualityPanelOpen] = useState(false)
  const [baselineMenuOpenSignal, setBaselineMenuOpenSignal] = useState(0)

  // ── Modal state ───────────────────────────────────────────────────────────
  const [linkBuilderTaskId, setLinkBuilderTaskId] = useState<string | null>(null)
  const [workweekModalOpen, setWorkweekModalOpen] = useState(false)
  const [groupsManagerOpen, setGroupsManagerOpen] = useState(false)
  const [partiesManagerOpen, setPartiesManagerOpen] = useState(false)
  const [resourcesManagerOpen, setResourcesManagerOpen] = useState(false)
  const [csvImportOpen, setCsvImportOpen] = useState(false)
  const [printPreviewOpen, setPrintPreviewOpen] = useState(false)
  const [captureBaselineOpen, setCaptureBaselineOpen] = useState(false)
  const [changeOrderManagerOpen, setChangeOrderManagerOpen] = useState(false)
  const [changeOrderEditingId, setChangeOrderEditingId] = useState<string | null>(null)
  const [compareModalOpen, setCompareModalOpen] = useState<{ aId: string | null; bId: string | null } | null>(null)
  const [reportsModalOpen, setReportsModalOpen] = useState(false)
  const [reportsModalSelectedType, setReportsModalSelectedType] = useState<ReportType>('s-curve')
  const [weeklyNarrative, setWeeklyNarrative] = useState({
    highlights: '',
    concerns: '',
    lookAhead: '',
  })

  // ── Undo stack (transient — restore fns can't be serialized) ─────────────────
  const [undoStack, setUndoStack] = useState<UndoEntry[]>([])

  // ── Mobile tab ────────────────────────────────────────────────────────────────
  const [mobileTab, setMobileTab] = useState<MobileTab>('tasks')
  const [isMobile, setIsMobile] = useState(false)
  const [projectCalendarManagerOpen, setProjectCalendarManagerOpen] = useState(false)
  const [delayLogPanelOpen, setDelayLogPanelOpen] = useState(false)
  const [delayLogFocusDelayId, setDelayLogFocusDelayId] = useState<string | null>(null)
  const [delayEntryModalOpen] = useState(false)

  // ── Hooks ─────────────────────────────────────────────────────────────────
  const today = useMidnightTicker(() => {
    if (!activeBaselineId) return
    const activeBaseline = findBaselineById(baselines, activeBaselineId)
    if (!activeBaseline) return

    const next = appendVarianceSnapshot(varianceSnapshots, {
      date: todayStr(),
      activeBaselineId,
      projectFinishVariance: computeProjectFinishVariance(enrichedTasks, activeBaseline),
      criticalPathLength: qualityCpm?.criticalIds.size ?? 0,
      compositeHealthScore: scheduleHealth.score,
    })
    updateState({ varianceSnapshots: trimSnapshots(next) })
  })
  const { listRef, ganttRef, histogramRef, handleListScroll, handleGanttScroll, handleHistogramScroll } = useScrollSync()

  const dayPx = ZOOM_LEVELS[zoomIndex]?.dayPx ?? 16

  // Tracks the last-created task while it's still unmodified; cleared on first edit
  const lastCreatedEmptyTaskId = useRef<string | null>(null)

  // ── Derived / memoized ────────────────────────────────────────────────────

  const enrichedTasks = useMemo(
    () => refreshAutoProgress(tasks, workweek, holidays, today, projectCalendar),
    [tasks, workweek, holidays, today, projectCalendar],
  )

  const filteredTasks = useMemo(() => {
    return enrichedTasks.filter(t => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        if (!t.name.toLowerCase().includes(q)) return false
      }
      if (filterState.statuses.length > 0 && !filterState.statuses.includes(t.status)) return false
      if (filterState.parties.length > 0 && !(t.party && filterState.parties.includes(t.party))) return false
      if (filterState.phases.length > 0 && !filterState.phases.includes(t.group)) return false
      return true
    })
  }, [enrichedTasks, searchTerm, filterState])

  const groupNodes = useMemo(() => walkGroupTree(groups), [groups])

  const visibleRows = useMemo(() => {
    const rows: import('../types').VisibleRow[] = []
    const tasksByGroup = new Map<string, Task[]>()
    filteredTasks.forEach((task) => {
      const bucket = tasksByGroup.get(task.group)
      if (bucket) {
        bucket.push(task)
      } else {
        tasksByGroup.set(task.group, [task])
      }
    })

    const groupById = new Map(groups.map((group) => [group.id, group]))

    groupNodes.forEach((node) => {
      const group = groupById.get(node.id)
      if (!group) return

      const descendantTaskIds = new Set(getDescendantTaskIds(node.id, groups, filteredTasks))
      if (descendantTaskIds.size === 0) return

      const directTasks = tasksByGroup.get(node.id) ?? []
      const collapsed = collapsedGroups.includes(node.id)
      rows.push({
        kind: 'group',
        groupId: node.id,
        name: group.name,
        color: group.color,
        count: descendantTaskIds.size,
        collapsed,
        depth: node.depth,
        wbsCode: node.wbsCode,
      })

      if (collapsed) return
      directTasks.forEach((task) => rows.push({ kind: 'task', task }))
    })

    const groupedTaskIds = new Set(rows.filter((row) => row.kind === 'task').map((row) => row.task.id))
    filteredTasks.forEach((task) => {
      if (!groupById.has(task.group) && !groupedTaskIds.has(task.id)) {
        rows.push({ kind: 'task', task })
      }
    })

    return rows
  }, [filteredTasks, groups, collapsedGroups, groupNodes])

  const visibleTaskIds = useMemo(
    () => visibleRows.filter(r => r.kind === 'task').map(r => (r as { kind: 'task'; task: Task }).task.id),
    [visibleRows],
  )

  const timeline = useMemo(() => {
    if (enrichedTasks.length === 0) {
      const base = today
      return buildTimeline(base, base, dayPx)
    }
    const minDate = enrichedTasks.reduce((min, t) => t.s < min ? t.s : min, enrichedTasks[0]!.s)
    const maxDate = enrichedTasks.reduce((max, t) => t.e > max ? t.e : max, enrichedTasks[0]!.e)
    return buildTimeline(minDate, maxDate, dayPx)
  }, [enrichedTasks, dayPx, today])

  const hasDeps = dependencies.length > 0

  const criticalPath = useMemo(() => {
    if (!showCriticalPath || !hasDeps) return null
    return computeCriticalPath(enrichedTasks, dependencies, projectCalendar)
  }, [showCriticalPath, hasDeps, enrichedTasks, dependencies, projectCalendar])

  const qualityCpm = useMemo(() => {
    if (!hasDeps) return null
    return computeCriticalPath(enrichedTasks, dependencies, projectCalendar)
  }, [hasDeps, enrichedTasks, dependencies, projectCalendar])

  const _delayImpactByDelayId = useMemo(() => {
    const out = new Map<string, ReturnType<typeof computeDelayImpact>>()
    delays.forEach((delay) => {
      out.set(delay.id, computeDelayImpact(delay, enrichedTasks, dependencies, qualityCpm))
    })
    return out
  }, [delays, enrichedTasks, dependencies, qualityCpm])

  const _varianceByDelayCause = useMemo(() => {
    const out = new Map<DelayType, number>()
    delays.forEach((delay) => {
      const current = out.get(delay.type) ?? 0
      out.set(delay.type, current + delay.daysImpact)
    })
    return out
  }, [delays])

  const taskCosts = useMemo(
    () =>
      computeTaskCosts(enrichedTasks, {
        resources,
        assignments,
        workweek,
        holidays,
      }),
    [enrichedTasks, resources, assignments, workweek, holidays],
  )

  const projectCost = useMemo(() => computeProjectTotalCost(taskCosts), [taskCosts])
  const totalActualCost = useMemo(() => computeTotalActualCost(enrichedTasks), [enrichedTasks])

  const _groupRollups = useMemo(
    () =>
      new Map(
        groups.map((group) => [
          group.id,
          computeGroupRollup(group.id, groups, enrichedTasks, taskCosts, assignments),
        ]),
      ),
    [groups, enrichedTasks, taskCosts, assignments],
  )

  const overAllocationByResource = useMemo(() => {
    return resources.map((resource) => {
      const demand = computeResourceDemand(resource.id, {
        tasks: enrichedTasks,
        assignments,
        resources,
        timeline,
        workweek,
        holidays,
      })
      const overCount = demand.filter((point) => point.overAllocation > 0).length
      return { resourceId: resource.id, overCount }
    })
  }, [resources, enrichedTasks, assignments, timeline, workweek, holidays])

  const overAllocationCount = useMemo(
    () => overAllocationByResource.reduce((sum, item) => sum + item.overCount, 0),
    [overAllocationByResource],
  )

  const overAllocatedResourceCount = useMemo(
    () => overAllocationByResource.filter((item) => item.overCount > 0).length,
    [overAllocationByResource],
  )

  const firstOverAllocatedResourceId = useMemo(
    () => overAllocationByResource.find((item) => item.overCount > 0)?.resourceId ?? null,
    [overAllocationByResource],
  )
  const overAllocatedResourceNames = useMemo(
    () => overAllocationByResource
      .filter((item) => item.overCount > 0)
      .map((item) => resources.find((resource) => resource.id === item.resourceId)?.name ?? item.resourceId),
    [overAllocationByResource, resources],
  )

  const dcmaAssessment = useMemo(() => {
    return runDcmaAssessment({
      tasks: enrichedTasks,
      groups,
      dependencies,
      baselines,
      activeBaselineId,
      resources,
      assignments,
      cpm: qualityCpm,
      today,
    })
  }, [enrichedTasks, groups, dependencies, baselines, activeBaselineId, resources, assignments, qualityCpm, today])

  const floatDistribution = useMemo(() => {
    return buildFloatDistribution(enrichedTasks, qualityCpm?.totalFloat ?? new Map())
  }, [enrichedTasks, qualityCpm])

  const scheduleHealth = useMemo(() => {
    return computeScheduleHealth({
      assessment: dcmaAssessment,
      tasks: enrichedTasks,
      overAllocatedResourceCount,
      totalResourceCount: resources.length,
      floatDistribution,
      weights: HEALTH_WEIGHTS,
    })
  }, [dcmaAssessment, enrichedTasks, overAllocatedResourceCount, resources.length, floatDistribution])

  const activeBaseline = useMemo(
    () => (activeBaselineId ? findBaselineById(baselines, activeBaselineId) : null),
    [baselines, activeBaselineId],
  )

  const scurveSeries = useMemo(
    () => computeSCurve(enrichedTasks, activeBaseline, 'monthly'),
    [enrichedTasks, activeBaseline],
  )

  const evmResult = useMemo(
    () => computeEVM(enrichedTasks, activeBaseline, assignments, resources, today, totalActualCost),
    [enrichedTasks, activeBaseline, assignments, resources, today, totalActualCost],
  )

  const cashFlowBuckets = useMemo(
    () => computeMonthlyCashFlow(enrichedTasks, assignments, resources),
    [enrichedTasks, assignments, resources],
  )

  const executiveReport = useMemo(
    () => buildExecutiveReport({
      tasks: enrichedTasks,
      baseline: activeBaseline,
      assessment: dcmaAssessment,
      healthScore: scheduleHealth.score,
      evm: evmResult,
      statusDate: today,
    }),
    [enrichedTasks, activeBaseline, dcmaAssessment, scheduleHealth.score, evmResult, today],
  )

  const weeklyReport = useMemo(
    () => buildWeeklyReport({
      tasks: enrichedTasks,
      changeOrders,
      weekEnding: today,
    }),
    [enrichedTasks, changeOrders, today],
  )

  const varianceSnapshotsByBaseline = useMemo(() => {
    const grouped = new Map<string, typeof varianceSnapshots>()
    varianceSnapshots.forEach((snapshot) => {
      const list = grouped.get(snapshot.activeBaselineId)
      if (list) {
        list.push(snapshot)
      } else {
        grouped.set(snapshot.activeBaselineId, [snapshot])
      }
    })
    grouped.forEach((snapshotsForBaseline) => {
      snapshotsForBaseline.sort((left, right) => left.date.localeCompare(right.date))
    })
    return grouped
  }, [varianceSnapshots])

  const activeBaselineSnapshots = useMemo(() => {
    if (!activeBaselineId) return []
    return varianceSnapshotsByBaseline.get(activeBaselineId) ?? []
  }, [activeBaselineId, varianceSnapshotsByBaseline])

  const healthHistory = useMemo(
    () =>
      activeBaselineSnapshots
        .map((snapshot) => snapshot.compositeHealthScore)
        .filter((score): score is number => typeof score === 'number'),
    [activeBaselineSnapshots],
  )

  useEffect(() => {
    if (resources.length === 0) {
      setSelectedResourceIds([])
      return
    }
    const valid = selectedResourceIds.filter((id) => resources.some((resource) => resource.id === id))
    if (valid.length > 0) {
      if (valid.length !== selectedResourceIds.length) {
        setSelectedResourceIds(valid.slice(0, MAX_OVERLAY_RESOURCES))
      }
      return
    }
    setSelectedResourceIds(resources[0] ? [resources[0].id] : [])
  }, [resources, selectedResourceIds])

  const handleSelectResource = useCallback((resourceId: string, additive: boolean) => {
    setSelectedResourceIds((prev) => {
      if (!additive) return [resourceId]
      if (prev.includes(resourceId)) {
        const trimmed = prev.filter((id) => id !== resourceId)
        return trimmed.length > 0 ? trimmed : [resourceId]
      }
      return [...prev, resourceId].slice(0, MAX_OVERLAY_RESOURCES)
    })
  }, [])

  // ── Persistence ───────────────────────────────────────────────────────────

  const [storageFullBanner, setStorageFullBanner] = useState(false)

  useEffect(() => {
    const ok = saveState(state)
    if (!ok) setStorageFullBanner(true)
  }, [state])

  useEffect(() => {
    const media = window.matchMedia('(max-width: 640px)')
    const update = () => setIsMobile(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  // ── State updaters ────────────────────────────────────────────────────────

  const updateState = useCallback((patch: Partial<PersistedState>) => {
    setState(prev => ({ ...prev, ...patch }))
  }, [])

  const setTasks = useCallback((t: Task[]) => updateState({ tasks: t }), [updateState])

  const setOnboardingPhase = useCallback(
    (p: OnboardingPhase) => updateState({ onboardingPhase: p }),
    [updateState],
  )

  const setGhostStyle = useCallback(
    (style: GhostStyle) => updateState({ ghostStyle: style }),
    [updateState],
  )

  // ── Task mutations ────────────────────────────────────────────────────────

  const onUpdateTask = useCallback((id: string, patch: Partial<Task>) => {
    if (id === lastCreatedEmptyTaskId.current) {
      lastCreatedEmptyTaskId.current = null
    }
    if (patch.status === 'complete') {
      setCompletionFlashId(id)
      setTimeout(() => setCompletionFlashId(null), 1200)
    }
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, ...patch } : t),
    }))
  }, [])

  const onDeleteTask = useCallback((id: string) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return

    const snapTasks = tasks
    const snapDeps = dependencies
    const snapNotes = notes
    const entryId = Math.random().toString(36).slice(2)

    setState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id),
      dependencies: prev.dependencies.filter(d => d.fromId !== id && d.toId !== id),
      notes: prev.notes.filter(n => n.taskId !== id),
      assignments: prev.assignments.filter(a => a.taskId !== id),
    }))
    if (selectedTaskId === id) {
      setSelectedTaskId(null)
      setPanelOpen(false)
    }

    setUndoStack(prev => [{
      id: entryId,
      label: `Deleted "${task.name}"`,
      restore: () => setState(s => ({ ...s, tasks: snapTasks, dependencies: snapDeps, notes: snapNotes })),
    }, ...prev].slice(0, UNDO_STACK_MAX))
  }, [tasks, dependencies, notes, selectedTaskId])

  const onAddNote = useCallback((taskId: string, text: string) => {
    const note: Note = {
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      taskId,
      text,
      when: new Date().toISOString(),
    }
    setState(prev => ({ ...prev, notes: [...prev.notes, note] }))
  }, [])

  const onAddAssignment = useCallback((taskId: string) => {
    const defaultResourceId = resources[0]?.id
    if (!defaultResourceId) return

    const assignment: ResourceAssignment = {
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      taskId,
      resourceId: defaultResourceId,
      quantity: 1,
      notes: '',
    }

    setState(prev => ({ ...prev, assignments: [...prev.assignments, assignment] }))
  }, [resources])

  const onUpdateAssignment = useCallback((assignmentId: string, patch: Partial<ResourceAssignment>) => {
    setState(prev => ({
      ...prev,
      assignments: prev.assignments.map((assignment) =>
        assignment.id === assignmentId ? { ...assignment, ...patch } : assignment,
      ),
    }))
  }, [])

  const onRemoveAssignment = useCallback((assignmentId: string) => {
    setState(prev => ({
      ...prev,
      assignments: prev.assignments.filter((assignment) => assignment.id !== assignmentId),
    }))
  }, [])

  const onLinkChangeOrder = useCallback((changeOrderId: string, taskId: string) => {
    setState((prev) => ({
      ...prev,
      changeOrders: prev.changeOrders.map((changeOrder) =>
        changeOrder.id === changeOrderId ? linkChangeOrderToTask(changeOrder, taskId) : changeOrder,
      ),
    }))
  }, [])

  const onUnlinkChangeOrder = useCallback((changeOrderId: string, taskId: string) => {
    setState((prev) => ({
      ...prev,
      changeOrders: prev.changeOrders.map((changeOrder) =>
        changeOrder.id === changeOrderId ? unlinkChangeOrderFromTask(changeOrder, taskId) : changeOrder,
      ),
    }))
  }, [])

  const onToggleGroup = useCallback((groupId: string) => {
    setState(prev => {
      const collapsed = prev.collapsedGroups.includes(groupId)
        ? prev.collapsedGroups.filter(id => id !== groupId)
        : [...prev.collapsedGroups, groupId]
      return { ...prev, collapsedGroups: collapsed }
    })
  }, [])

  // ── Zoom ─────────────────────────────────────────────────────────────────

  const onZoomIn = useCallback(() => {
    setZoomIndex(prev => Math.max(0, prev - 1))
  }, [])

  const onZoomOut = useCallback(() => {
    setZoomIndex(prev => Math.min(ZOOM_LEVELS.length - 1, prev + 1))
  }, [])

  // ── Onboarding ────────────────────────────────────────────────────────────

  const { onTaskAdded, onTaskCountChange, onBaselineLocked, onExampleDataLoaded: advanceOnboarding } = useOnboarding(
    onboardingPhase,
    tasks.length,
    setOnboardingPhase,
  )

  useEffect(() => {
    onTaskCountChange(tasks.length)
  }, [tasks.length, onTaskCountChange])

  const handleLoadExample = useCallback(() => {
    updateState({ tasks: EXAMPLE_TASKS, groups: EXAMPLE_GROUPS, parties: EXAMPLE_PARTIES, projectName: 'Residential Build' })
    advanceOnboarding()
  }, [updateState, advanceOnboarding])

  // ── Task actions ──────────────────────────────────────────────────────────

  const handleNewTask = useCallback(() => {
    // If the last created task is still unmodified, focus it instead of creating another
    if (lastCreatedEmptyTaskId.current !== null) {
      const stillExists = tasks.some(t => t.id === lastCreatedEmptyTaskId.current)
      if (stillExists) {
        setSelectedTaskId(lastCreatedEmptyTaskId.current)
        setPanelOpen(true)
        return
      }
      lastCreatedEmptyTaskId.current = null
    }

    const id = Math.random().toString(36).slice(2) + Date.now().toString(36)
    const newTask: Task = {
      id,
      name: 'New Task',
      group: groups[0]?.id ?? '',
      s: today,
      e: today,
      actualStart: null,
      actualFinish: null,
      pct: 0,
      status: 'not_started',
      party: null,
      notes: '',
      milestone: false,
      manualStatus: false,
      manualPct: false,
      deps: [],
      wbsCode: '',
      actualCost: 0,
    }
    lastCreatedEmptyTaskId.current = id
    setTasks([...tasks, newTask])
    setSelectedTaskId(id)
    setPanelOpen(true)
    if (isMobile) {
      setMobileTab('panel')
    }
    onTaskAdded()
  }, [tasks, groups, today, setTasks, onTaskAdded, isMobile])

  const handleSelectTask = useCallback((id: string) => {
    setSelectedTaskId(id)
    setKbFocusId(id)
    if (isMobile) {
      setPanelOpen(true)
      setMobileTab('panel')
    }
  }, [isMobile])

  const handleOpenPanel = useCallback((id: string) => {
    setSelectedTaskId(id)
    setPanelOpen(true)
    if (isMobile) {
      setMobileTab('panel')
    }
  }, [isMobile])

  // ── CSV import ────────────────────────────────────────────────────────────

  const handleCsvImport = useCallback((imported: Task[], mode: 'replace' | 'append') => {
    // Snapshot everything an import can affect transitively. A replace blows away tasks AND
    // any dependency edges that reference them; an append doesn't touch existing edges, but
    // the user's mental "undo this import" includes both layers, so we snapshot uniformly.
    const snapTasks = tasks
    const snapDeps = dependencies
    const snapNotes = notes
    const entryId = Math.random().toString(36).slice(2)
    setState(prev => ({
      ...prev,
      tasks: mode === 'replace' ? imported : [...prev.tasks, ...imported],
      // On replace, drop dependency edges that reference removed task IDs.
      dependencies: mode === 'replace'
        ? prev.dependencies.filter(d => {
            const ids = new Set(imported.map(t => t.id))
            return ids.has(d.fromId) && ids.has(d.toId)
          })
        : prev.dependencies,
      // Replace also discards notes attached to removed tasks.
      notes: mode === 'replace'
        ? prev.notes.filter(n => imported.some(t => t.id === n.taskId))
        : prev.notes,
    }))
    setUndoStack(prev => [{
      id: entryId,
      label: mode === 'replace'
        ? 'CSV import (replaced all tasks)'
        : `CSV import (added ${imported.length} task${imported.length !== 1 ? 's' : ''})`,
      restore: () => setState(s => ({ ...s, tasks: snapTasks, dependencies: snapDeps, notes: snapNotes })),
    }, ...prev].slice(0, UNDO_STACK_MAX))
  }, [tasks, dependencies, notes])

  // ── Baseline actions ──────────────────────────────────────────────────────

  const captureBaseline = useCallback((values: CaptureBaselineValues) => {
    const baselineDate = today
    const newBaseline: Baseline = {
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      name: values.name,
      date: baselineDate,
      reason: values.reason,
      lockedAt: baselineDate,
      author: values.author,
      tasks: enrichedTasks,
    }
    updateState({ baselines: [...baselines, newBaseline] })
    setActiveBaselineId(newBaseline.id)
    setCaptureBaselineOpen(false)
    onBaselineLocked()
  }, [baselines, enrichedTasks, today, updateState, onBaselineLocked])

  const deleteBaseline = useCallback((id: string) => {
    updateState({ baselines: baselines.filter(b => b.id !== id) })
    if (activeBaselineId === id) setActiveBaselineId(null)
  }, [baselines, activeBaselineId, updateState])

  // ── Reset ─────────────────────────────────────────────────────────────────

  const handleReset = useCallback(() => {
    const baselineCount = baselines.length
    const changeOrderCount = changeOrders.length
    const extraScope = baselineCount > 0 || changeOrderCount > 0
      ? ` This will also delete ${baselineCount} baseline${baselineCount !== 1 ? 's' : ''} and ${changeOrderCount} change order${changeOrderCount !== 1 ? 's' : ''}.`
      : ''
    if (!window.confirm(`Reset project? This will clear all tasks, groups, and baselines.${extraScope}`)) return
    const snapTasks = tasks
    const snapDeps = dependencies
    const snapNotes = notes
    const entryId = Math.random().toString(36).slice(2)
    updateState({
      tasks: [],
      dependencies: [],
      notes: [],
      baselines: [],
      groups: INITIAL_STATE.groups,
      parties: INITIAL_STATE.parties,
      onboardingPhase: 'fresh',
    })
    setSelectedTaskId(null)
    setPanelOpen(false)
    setActiveBaselineId(null)
    setUndoStack(prev => [{
      id: entryId,
      label: 'Reset project',
      restore: () => setState(s => ({ ...s, tasks: snapTasks, dependencies: snapDeps, notes: snapNotes })),
    }, ...prev].slice(0, UNDO_STACK_MAX))
  }, [tasks, dependencies, notes, baselines.length, changeOrders.length, updateState])

  // ── Export ────────────────────────────────────────────────────────────────

  const handleExportCsv = useCallback(() => {
    const csv = generateCSV(enrichedTasks)
    triggerCSVDownload(csv, `${projectName}-schedule.csv`)
  }, [enrichedTasks, projectName])

  // ── Keyboard ──────────────────────────────────────────────────────────────

  const handleNavigate = useCallback((dir: 'up' | 'down') => {
    if (visibleTaskIds.length === 0) return
    const idx = kbFocusId ? visibleTaskIds.indexOf(kbFocusId) : -1
    let next: number
    if (dir === 'up') {
      next = idx <= 0 ? visibleTaskIds.length - 1 : idx - 1
    } else {
      next = idx >= visibleTaskIds.length - 1 ? 0 : idx + 1
    }
    setKbFocusId(visibleTaskIds[next] ?? null)
  }, [kbFocusId, visibleTaskIds])

  const handleEscape = useCallback(() => {
    setPanelOpen(false)
    setKbFocusId(null)
    if (isMobile) {
      setMobileTab('tasks')
    }
  }, [isMobile])

  const handleUndo = useCallback(() => {
    const [top, ...rest] = undoStack
    if (!top) return
    top.restore()
    setUndoStack(rest)
  }, [undoStack])

  useKeyboard({
    kbFocusId,
    onNewTask: handleNewTask,
    onNavigate: handleNavigate,
    onSelect: setSelectedTaskId,
    onOpenPanel: handleOpenPanel,
    onEscape: handleEscape,
    onUndo: handleUndo,
  })

  // ── Render ────────────────────────────────────────────────────────────────

  const showWizard = onboardingPhase === 'fresh' && tasks.length === 0

  const selectedTask = enrichedTasks.find(t => t.id === selectedTaskId) ?? null
  const mobilePanelOpen = isMobile && panelOpen && mobileTab === 'panel' && selectedTask !== null
  const desktopPanelOpen = !isMobile && panelOpen && selectedTask !== null

  useEffect(() => {
    if (!isMobile) return
    if (!selectedTask && mobileTab === 'panel') {
      setMobileTab('tasks')
    }
  }, [isMobile, selectedTask, mobileTab])

  const handleClosePanel = useCallback(() => {
    setPanelOpen(false)
    if (isMobile) {
      setMobileTab('tasks')
    }
  }, [isMobile])

  const handleOpenChangeOrders = useCallback((changeOrderId?: string) => {
    setChangeOrderEditingId(changeOrderId ?? null)
    setChangeOrderManagerOpen(true)
  }, [])

  const handleOpenBaselineMenuFromQuality = useCallback(() => {
    setQualityPanelOpen(false)
    setBaselineMenuOpenSignal((value) => value + 1)
  }, [])

  const handleOpenCompareBaselines = useCallback((seedBaselineId?: string) => {
    if (baselines.length < 2) {
      setCompareModalOpen({ aId: baselines[0]?.id ?? null, bId: null })
      return
    }
    const newest = baselines[baselines.length - 1] ?? null
    const previous = baselines[baselines.length - 2] ?? null
    const seeded = seedBaselineId
      ? baselines.find((baseline) => baseline.id === seedBaselineId) ?? null
      : null
    const first = seeded ?? newest
    const second = baselines.find((baseline) => baseline.id !== first?.id) ?? previous
    setCompareModalOpen({ aId: first?.id ?? null, bId: second?.id ?? null })
  }, [baselines])

  const handleExportReportPdf = useCallback(() => {
    const body = document.body
    const className = 'report-print'
    const cleanup = () => {
      body.classList.remove(className)
      window.removeEventListener('afterprint', cleanup)
    }
    body.classList.add(className)
    window.addEventListener('afterprint', cleanup)
    window.requestAnimationFrame(() => {
      window.print()
      window.setTimeout(cleanup, 500)
    })
  }, [])

  return (
    <div
      className="app"
      data-phase={onboardingPhase}
      data-calendar-overlay={calendarOverlayEnabled ? 'on' : 'off'}
      data-calendar-manager-open={projectCalendarManagerOpen ? 'true' : 'false'}
      data-delay-log-open={delayLogPanelOpen ? 'true' : 'false'}
      data-delay-log-focus-id={delayLogFocusDelayId ?? ''}
      data-delay-entry-open={delayEntryModalOpen ? 'true' : 'false'}
      data-delay-impact-count={_delayImpactByDelayId.size}
      data-delay-cause-count={_varianceByDelayCause.size}
    >
      {showWizard && (
        <SetupWizard
          projectName={projectName}
          onRenameProject={name => updateState({ projectName: name })}
          onStartBlank={handleNewTask}
          onLoadExample={handleLoadExample}
        />
      )}

      {/* Main app shell */}
      {!showWizard && (
        <>
          <TopBar
            projectName={projectName}
            onRenameProject={name => updateState({ projectName: name })}
            zoomIndex={zoomIndex}
            onZoomIn={onZoomIn}
            onZoomOut={onZoomOut}
            baselines={baselines}
            activeBaselineId={activeBaselineId}
            ghostStyle={ghostStyle}
            onCaptureBaseline={() => setCaptureBaselineOpen(true)}
            onSetActiveBaseline={setActiveBaselineId}
            onDeleteBaseline={deleteBaseline}
            onCompareBaselines={handleOpenCompareBaselines}
            onSetGhostStyle={setGhostStyle}
            onOpenWorkweek={() => setWorkweekModalOpen(true)}
            onOpenGroups={() => setGroupsManagerOpen(true)}
            onOpenParties={() => setPartiesManagerOpen(true)}
            onOpenResources={() => setResourcesManagerOpen(true)}
            onOpenProjectCalendar={() => setProjectCalendarManagerOpen(true)}
            onOpenDelayLog={() => setDelayLogPanelOpen(true)}
            onOpenChangeOrders={() => handleOpenChangeOrders()}
            onOpenQuality={() => setQualityPanelOpen(true)}
            onOpenReports={() => setReportsModalOpen(true)}
            onOpenCsvImport={() => setCsvImportOpen(true)}
            onOpenPrint={() => setPrintPreviewOpen(true)}
            onExportCsv={handleExportCsv}
            baselineMenuOpenSignal={baselineMenuOpenSignal}
            hasDeps={hasDeps}
            showCriticalPath={showCriticalPath}
            onToggleCriticalPath={() => setShowCriticalPath(v => !v)}
            onReset={handleReset}
            onNewTask={handleNewTask}
          />

          {storageFullBanner && (
            <div style={{
              background: 'var(--color-danger-dim)',
              borderBottom: '1px solid var(--color-danger)',
              padding: '6px 16px',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              flexShrink: 0,
            }}>
              <span>
                <strong>Storage full.</strong> Your last change could not be saved. Export a CSV backup to avoid losing work.
              </span>
              <button
                onClick={() => setStorageFullBanner(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', fontSize: 'var(--text-xs)', padding: '0 4px', flexShrink: 0 }}
                aria-label="Dismiss storage warning"
              >
                ✕
              </button>
            </div>
          )}

          <StatBar
            tasks={enrichedTasks}
            today={today}
            criticalPath={criticalPath}
            projectCost={projectCost}
            overAllocationCount={overAllocationCount}
            overAllocatedResourceNames={overAllocatedResourceNames}
            healthScore={scheduleHealth.score}
            onOpenOverAllocations={() => {
              if (!firstOverAllocatedResourceId) return
              setSelectedResourceIds([firstOverAllocatedResourceId])
              setHistogramVisible(true)
            }}
            onOpenQualityPanel={() => setQualityPanelOpen(true)}
          />

          <FilterBar
            groups={groups}
            parties={parties}
            taskCount={enrichedTasks.length}
            visibleCount={visibleTaskIds.length}
            searchTerm={searchTerm}
            filterState={filterState}
            showCostColumn={showCostColumn}
            onSearch={(q) => startTransition(() => setSearchTerm(q))}
            onFilter={(f) => startTransition(() => setFilterState(f))}
            onToggleCostColumn={() => setShowCostColumn((value) => !value)}
          />

          {/* ── Main content area ── */}
          <div className={`app-main${desktopPanelOpen ? ' panel-open' : ''}`} data-mobile-tab={mobileTab}>
            <div id="mobile-view-tasks" role="tabpanel" aria-labelledby="mobile-tab-tasks" hidden={isMobile && mobileTab !== 'tasks'}>
              <TaskList
              visibleRows={visibleRows}
              filteredTasks={filteredTasks}
              taskCount={enrichedTasks.length}
              isComputing={isPending && enrichedTasks.length > LARGE_TASK_THRESHOLD}
              groups={groups}
              parties={parties}
              today={today}
              selectedTaskId={selectedTaskId}
              kbFocusId={kbFocusId}
              completionFlashId={completionFlashId}
              showCostColumn={showCostColumn}
              taskCosts={taskCosts}
              groupRollups={_groupRollups}
              dependencies={dependencies}
              listRef={listRef}
              onScroll={handleListScroll}
              onSelectTask={handleSelectTask}
              onOpenPanel={handleOpenPanel}
              onOpenLinks={(id) => setLinkBuilderTaskId(id)}
              onToggleGroup={onToggleGroup}
              onNewTask={handleNewTask}
            />
            </div>

            <div id="mobile-view-gantt" role="tabpanel" aria-labelledby="mobile-tab-gantt" hidden={isMobile && mobileTab !== 'gantt'}>
              <Gantt
              visibleRows={visibleRows}
              groups={groups}
              timeline={timeline}
              dayPx={dayPx}
              zoomIndex={zoomIndex}
              today={today}
              selectedTaskId={selectedTaskId}
              kbFocusId={kbFocusId}
              completionFlashId={completionFlashId}
              dependencies={dependencies}
              resources={resources}
              assignments={assignments}
              selectedResourceIds={selectedResourceIds}
              compareResourcesMode={compareResourcesMode}
              histogramVisible={histogramVisible}
              histogramRef={histogramRef}
              baselines={baselines}
              activeBaselineId={activeBaselineId}
              ghostStyle={ghostStyle}
              showCriticalPath={showCriticalPath}
              criticalPath={criticalPath}
              workweek={workweek}
              holidays={holidays}
              projectCalendar={projectCalendar}
              delays={delays}
              ganttRef={ganttRef}
              onScroll={handleGanttScroll}
              onUpdateTask={onUpdateTask}
              onSelectTask={handleSelectTask}
              onOpenPanel={handleOpenPanel}
              onZoomIn={onZoomIn}
              onZoomOut={onZoomOut}
              onSetGhostStyle={setGhostStyle}
              onToggleHistogram={() => setHistogramVisible((value) => !value)}
              onToggleCompareResourcesMode={() => setCompareResourcesMode((value) => !value)}
              onSelectResource={handleSelectResource}
              onHistogramScroll={handleHistogramScroll}
              calendarOverlayEnabled={calendarOverlayEnabled}
              onToggleCalendarOverlay={() => setCalendarOverlayEnabled((value) => !value)}
              onOpenDelayLog={(delayId) => {
                setDelayLogFocusDelayId(delayId)
                setDelayLogPanelOpen(true)
              }}
              isComputing={isPending && enrichedTasks.length > LARGE_TASK_THRESHOLD}
            />
            </div>

            {/* Side panel */}
            {desktopPanelOpen && (
              <SidePanel
                task={selectedTask}
                tasks={enrichedTasks}
                groups={groups}
                parties={parties}
                notes={notes}
                dependencies={dependencies}
                resources={resources}
                assignments={assignments}
                changeOrders={changeOrders}
                workweek={workweek}
                holidays={holidays}
                today={today}
                onUpdateTask={onUpdateTask}
                onDeleteTask={onDeleteTask}
                onAddNote={onAddNote}
                onAddAssignment={onAddAssignment}
                onUpdateAssignment={onUpdateAssignment}
                onRemoveAssignment={onRemoveAssignment}
                onClose={handleClosePanel}
                onOpenLinkBuilder={id => setLinkBuilderTaskId(id)}
                onOpenChangeOrders={handleOpenChangeOrders}
                onStartLinkChangeOrder={() => handleOpenChangeOrders()}
                onLinkChangeOrder={onLinkChangeOrder}
                onUnlinkChangeOrder={onUnlinkChangeOrder}
              />
            )}
          </div>
        </>
      )}

      {/* ── Modals ── */}

      {linkBuilderTaskId && (
        <LinkBuilderModal
          taskId={linkBuilderTaskId}
          tasks={enrichedTasks}
          dependencies={dependencies}
          onSave={newDeps => updateState({ dependencies: newDeps })}
          onClose={() => setLinkBuilderTaskId(null)}
        />
      )}

      {workweekModalOpen && (
        <WorkweekModal
          workweek={workweek}
          holidays={holidays}
          onSave={(ww, hols) => updateState({ workweek: ww, holidays: hols })}
          onClose={() => setWorkweekModalOpen(false)}
        />
      )}

      {groupsManagerOpen && (
        <GroupsManager
          groups={groups}
          onSave={newGroups => updateState({ groups: newGroups })}
          onClose={() => setGroupsManagerOpen(false)}
        />
      )}

      {partiesManagerOpen && (
        <PartiesManager
          parties={parties}
          onSave={newParties => updateState({ parties: newParties })}
          onClose={() => setPartiesManagerOpen(false)}
        />
      )}

      {resourcesManagerOpen && (
        <ResourcesManager
          resources={resources}
          assignments={assignments}
          tasks={enrichedTasks}
          onSave={(newResources) => {
            const deletedIds = new Set(resources.map(r => r.id))
            newResources.forEach(r => deletedIds.delete(r.id))
            if (deletedIds.size > 0) {
              const snapResources = resources
              const snapAssignments = assignments
              const entryId = Math.random().toString(36).slice(2)
              setUndoStack(prev => [{
                id: entryId,
                label: 'Deleted resource',
                restore: () => setState(s => ({ ...s, resources: snapResources, assignments: snapAssignments })),
              }, ...prev].slice(0, UNDO_STACK_MAX))
            }
            updateState({ resources: newResources })
          }}
          onSaveAssignments={(newAssignments) => updateState({ assignments: newAssignments })}
          onClose={() => setResourcesManagerOpen(false)}
        />
      )}

      {csvImportOpen && (
        <CsvImportDialog
          existingTasks={tasks}
          onImport={handleCsvImport}
          onClose={() => setCsvImportOpen(false)}
        />
      )}

      {printPreviewOpen && (
        <PrintPreviewModal
          tasks={enrichedTasks}
          groups={groups}
          parties={parties}
          taskCosts={taskCosts}
          projectCost={projectCost}
          healthScore={scheduleHealth.score}
          projectName={projectName}
          workweek={workweek}
          holidays={holidays}
          today={today}
          activeBaselineName={activeBaselineId ? findBaselineById(baselines, activeBaselineId)?.name : null}
          projectFinishVariance={activeBaselineId ? computeProjectFinishVariance(enrichedTasks, findBaselineById(baselines, activeBaselineId)!) : null}
          onClose={() => setPrintPreviewOpen(false)}
        />
      )}

      <QualityPanel
        open={qualityPanelOpen}
        taskCount={enrichedTasks.length}
        hasResources={resources.length > 0}
        isComputing={isPending && enrichedTasks.length > LARGE_TASK_THRESHOLD}
        assessment={dcmaAssessment}
        health={scheduleHealth}
        floatDistribution={floatDistribution}
        activeBaselineSnapshots={activeBaselineSnapshots}
        healthHistory={healthHistory}
        onOpenBaselineMenu={handleOpenBaselineMenuFromQuality}
        onClose={() => setQualityPanelOpen(false)}
      />

      <CaptureBaselineModal
        open={captureBaselineOpen}
        defaultName={`Baseline ${baselines.length + 1}`}
        onConfirm={captureBaseline}
        onClose={() => setCaptureBaselineOpen(false)}
      />

      <ChangeOrderManager
        open={changeOrderManagerOpen}
        changeOrders={changeOrders}
        selectedChangeOrderId={changeOrderEditingId}
        onSave={(nextChangeOrders) => updateState({ changeOrders: nextChangeOrders })}
        onClose={() => {
          setChangeOrderManagerOpen(false)
          setChangeOrderEditingId(null)
        }}
      />

      <BaselineCompareModal
        open={compareModalOpen !== null}
        baselines={baselines}
        baselineAId={compareModalOpen?.aId ?? null}
        baselineBId={compareModalOpen?.bId ?? null}
        changeOrders={changeOrders}
        onChangeBaselineA={(baselineId) => {
          setCompareModalOpen((prev) => (prev ? { ...prev, aId: baselineId } : prev))
        }}
        onChangeBaselineB={(baselineId) => {
          setCompareModalOpen((prev) => (prev ? { ...prev, bId: baselineId } : prev))
        }}
        onClose={() => setCompareModalOpen(null)}
      />

      <ReportsModal
        open={reportsModalOpen}
        hasTasks={enrichedTasks.length > 0}
        selectedType={reportsModalSelectedType}
        onSelectType={setReportsModalSelectedType}
        onClose={() => setReportsModalOpen(false)}
        preview={(
          <div
            style={{
              margin: 0,
              fontSize: 'var(--text-2xs)',
              color: 'var(--color-text-secondary)',
            }}
          >
            {reportsModalSelectedType === 's-curve' && <SCurvePreview series={scurveSeries} statusDate={today} />}
            {reportsModalSelectedType === 'evm' && <EVMPreview evm={evmResult} hasBaseline={activeBaseline !== null} />}
            {reportsModalSelectedType === 'cash-flow' && <CashFlowPreview buckets={cashFlowBuckets} />}
            {reportsModalSelectedType === 'executive-summary' && (
              <ExecutiveReportPreview
                report={executiveReport}
                scurve={scurveSeries}
                hasBaseline={activeBaseline !== null}
                hasCostData={cashFlowBuckets.some((bucket) => bucket.total > 0)}
                onExportPdf={handleExportReportPdf}
              />
            )}
            {reportsModalSelectedType === 'weekly-progress' && (
              <WeeklyReportEditor
                report={weeklyReport}
                narrative={weeklyNarrative}
                onChange={setWeeklyNarrative}
                onExportPdf={handleExportReportPdf}
              />
            )}
          </div>
        )}
      />

      {mobilePanelOpen && (
        <MobileBottomSheet
          open={mobilePanelOpen}
          title="Task details"
          onClose={handleClosePanel}
        >
          <SidePanel
            task={selectedTask}
            tasks={enrichedTasks}
            groups={groups}
            parties={parties}
            notes={notes}
            dependencies={dependencies}
            resources={resources}
            assignments={assignments}
            changeOrders={changeOrders}
            workweek={workweek}
            holidays={holidays}
            today={today}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
            onAddNote={onAddNote}
            onAddAssignment={onAddAssignment}
            onUpdateAssignment={onUpdateAssignment}
            onRemoveAssignment={onRemoveAssignment}
            onClose={handleClosePanel}
            onOpenLinkBuilder={id => setLinkBuilderTaskId(id)}
            onOpenChangeOrders={handleOpenChangeOrders}
            onStartLinkChangeOrder={() => handleOpenChangeOrders()}
            onLinkChangeOrder={onLinkChangeOrder}
            onUnlinkChangeOrder={onUnlinkChangeOrder}
            mode="mobile"
          />
        </MobileBottomSheet>
      )}

      {/* ── Onboarding baseline tip ── */}
      {onboardingPhase === 'baseline_tip' && (
        <div className="baseline-tip" role="status" aria-live="polite" aria-atomic="true">
          Save a baseline to track schedule variance
        </div>
      )}

      {/* ── Undo toast ── */}
      {undoStack[0] && (
        <UndoToast
          entry={undoStack[0]}
          onUndo={handleUndo}
          onDismiss={() => setUndoStack(prev => prev.slice(1))}
        />
      )}

      {/* ── Mobile tab switcher ── */}
      <MobileTabSwitcher
        activeTab={mobileTab}
        panelAvailable={selectedTask !== null}
        onChange={setMobileTab}
      />
    </div>
  )
}
