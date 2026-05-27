import { useCallback, useMemo, useState, type RefObject } from 'react'
import type {
  Baseline, CalendarEvent, CpmResult, Delay, Dependency, GhostStyle,
  Group, Resource, ResourceAssignment, Task, VisibleRow, WorkweekConfig,
} from '../../types'
import type { Timeline } from '../../types'
import { GANTT_HEADER_HEIGHT, ROW_HEIGHT, ZOOM_LEVELS } from '../../constants'
import { GanttHeader } from './GanttHeader'
import { GanttGrid } from './GanttGrid'
import { GanttBar } from './GanttBar'
import { DependencyArrows } from './DependencyArrows'
import { BaselineGhostBars } from './BaselineGhostBars'
import { ResourceHistogram } from './ResourceHistogram'
import { computeResourceDemand } from '../../lib/resourceDemand'
import { CalendarBlank, CircleHalf, Minus, Path, Plus, SquaresFour } from '../../lib/icons'
import { CalendarOverlay } from './CalendarOverlay'

// ─── Props ────────────────────────────────────────────────────────────────────

interface GanttProps {
  visibleRows: VisibleRow[]
  groups: Group[]
  timeline: Timeline
  dayPx: number
  zoomIndex: number
  today: string
  selectedTaskId: string | null
  kbFocusId: string | null
  completionFlashId: string | null
  dependencies: Dependency[]
  baselines: Baseline[]
  activeBaselineId: string | null
  ghostStyle: GhostStyle
  showCriticalPath: boolean
  criticalPath: CpmResult | null
  workweek: WorkweekConfig
  holidays: string[]
  projectCalendar: CalendarEvent[]
  delays: Delay[]
  resources: Resource[]
  assignments: ResourceAssignment[]
  selectedResourceIds: string[]
  compareResourcesMode: boolean
  histogramVisible: boolean
  ganttRef: RefObject<HTMLDivElement>
  histogramRef: RefObject<HTMLDivElement>
  onScroll: () => void
  onUpdateTask: (id: string, patch: Partial<Task>) => void
  onSelectTask: (id: string) => void
  onOpenPanel: (id: string) => void
  onZoomIn: () => void
  onZoomOut: () => void
  onSetGhostStyle: (style: GhostStyle) => void
  onToggleHistogram: () => void
  onToggleCompareResourcesMode: () => void
  onSelectResource: (resourceId: string, additive: boolean) => void
  onHistogramScroll: () => void
  calendarOverlayEnabled: boolean
  onToggleCalendarOverlay: () => void
  onOpenDelayLog: (delayId: string) => void
  isComputing?: boolean
}

// ─── Gantt ────────────────────────────────────────────────────────────────────

export function Gantt({
  visibleRows,
  groups,
  timeline,
  dayPx,
  zoomIndex,
  today,
  selectedTaskId,
  kbFocusId,
  completionFlashId,
  dependencies,
  baselines,
  activeBaselineId,
  ghostStyle,
  showCriticalPath,
  criticalPath,
  workweek,
  holidays,
  projectCalendar,
  delays,
  resources,
  assignments,
  selectedResourceIds,
  compareResourcesMode,
  histogramVisible,
  ganttRef,
  histogramRef,
  onScroll,
  onUpdateTask,
  onSelectTask,
  onOpenPanel,
  onZoomIn,
  onZoomOut,
  onSetGhostStyle,
  onToggleHistogram,
  onToggleCompareResourcesMode,
  onSelectResource,
  onHistogramScroll,
  calendarOverlayEnabled,
  onToggleCalendarOverlay,
  onOpenDelayLog,
  isComputing = false,
}: GanttProps) {
  const [hoveredCalendarEvent, setHoveredCalendarEvent] = useState<CalendarEvent | null>(null)
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null)
  // ── Derived ────────────────────────────────────────────────────────────────

  // Build task map for arrows and ghost bars
  const taskMap = useMemo(() => {
    const map = new Map<string, Task>()
    for (const row of visibleRows) {
      if (row.kind === 'task') map.set(row.task.id, row.task)
    }
    return map
  }, [visibleRows])
  const visibleTasks = useMemo(
    () => visibleRows.filter((row): row is { kind: 'task'; task: Task } => row.kind === 'task').map((row) => row.task),
    [visibleRows],
  )

  const groupColorMap = useMemo(() =>
    new Map(groups.map(g => [g.id, g.color])),
    [groups]
  )
  const overAllocatedOffsets = useMemo(() => {
    const primaryResourceId = selectedResourceIds[0]
    if (!primaryResourceId) return new Set<number>()
    const demand = computeResourceDemand(primaryResourceId, {
      tasks: visibleTasks,
      assignments,
      resources,
      timeline,
      workweek,
      holidays,
    })
    const offsets = new Set<number>()
    demand.forEach((point, index) => {
      if (point.overAllocation <= 0) return
      const offset = timeline.days[index]?.offset
      if (offset !== undefined) offsets.add(offset)
    })
    return offsets
  }, [selectedResourceIds, visibleTasks, assignments, resources, timeline, workweek, holidays])

  const totalPx = timeline.totalPx
  const totalHeight = GANTT_HEADER_HEIGHT + visibleRows.length * ROW_HEIGHT
  const delaysByTaskId = useMemo(() => {
    const out = new Map<string, Delay[]>()
    delays.forEach((delay) => {
      delay.affectedTaskIds.forEach((taskId) => {
        const current = out.get(taskId) ?? []
        current.push(delay)
        out.set(taskId, current)
      })
    })
    return out
  }, [delays])

  // ── Ctrl+Scroll zoom ───────────────────────────────────────────────────────

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return
    e.preventDefault()
    if (e.deltaY < 0) {
      onZoomIn()
    } else {
      onZoomOut()
    }
  }, [onZoomIn, onZoomOut])

  // ── Zoom pill label ────────────────────────────────────────────────────────

  const zoomLabel = ZOOM_LEVELS[zoomIndex]?.label ?? 'Week'
  const canZoomIn  = zoomIndex > 0
  const canZoomOut = zoomIndex < ZOOM_LEVELS.length - 1

  void holidays

  return (
    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', background: 'var(--color-surface-2)' }}>
      {isComputing && <div className="computing-bar" aria-hidden="true" />}
      {/* ── Scrollable gantt area ── */}
      <div
        ref={ganttRef}
        className="gantt-scroll"
        onScroll={onScroll}
        onWheel={handleWheel}
        style={{ flex: 1, overflow: 'auto', position: 'relative' }}
      >
        {/* Inner canvas sized to timeline */}
        <div style={{ width: totalPx, height: totalHeight, position: 'relative' }}>

          {/* Header (sticky) */}
          <GanttHeader
            timeline={timeline}
            dayPx={dayPx}
            totalPx={totalPx}
            overAllocatedOffsets={overAllocatedOffsets}
            calendarOverlayEnabled={calendarOverlayEnabled}
            onToggleCalendarOverlay={onToggleCalendarOverlay}
          />

          {/* Grid: weekend bands, lines, today, row dividers */}
          <GanttGrid
            timeline={timeline}
            dayPx={dayPx}
            totalPx={totalPx}
            visibleRows={visibleRows}
            groups={groups}
            today={today}
            workweek={workweek}
          />

          {calendarOverlayEnabled && (
            <CalendarOverlay
              projectCalendar={projectCalendar}
              timeline={timeline}
              dayPx={dayPx}
              rowCount={visibleRows.length}
              totalPx={totalPx}
              onHoverEvent={(event, clientX, clientY) => {
                setHoveredCalendarEvent(event)
                if (event && clientX !== undefined && clientY !== undefined) {
                  setHoverPosition({ x: clientX, y: clientY })
                } else {
                  setHoverPosition(null)
                }
              }}
            />
          )}

          {/* Ghost bars layer (behind live bars) */}
          {baselines.length > 0 && (
            <div style={{ position: 'absolute', top: 0, left: 0, width: totalPx, height: totalHeight, pointerEvents: 'none', zIndex: 1 }}>
              <BaselineGhostBars
                baselines={baselines}
                activeBaselineId={activeBaselineId}
                ghostStyle={ghostStyle}
                visibleRows={visibleRows}
                timeline={timeline}
                dayPx={dayPx}
                today={today}
              />
            </div>
          )}

          {/* Live bars */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: totalPx, height: totalHeight, zIndex: 2 }}>
            {visibleRows.map((row, i) => {
              if (row.kind !== 'task') return null
              const { task } = row
              const groupColor = groupColorMap.get(task.group) ?? '#378ADD'
              const isCritical = !!(showCriticalPath && criticalPath?.criticalIds.has(task.id))
              const isDimmed = !!(showCriticalPath && criticalPath && !criticalPath.criticalIds.has(task.id))

              return (
                <GanttBar
                  key={task.id}
                  task={task}
                  rowIndex={i}
                  groupColor={groupColor}
                  timeline={timeline}
                  dayPx={dayPx}
                  isSelected={task.id === selectedTaskId}
                  isKbFocused={task.id === kbFocusId}
                  isCritical={isCritical}
                  isDimmed={isDimmed}
                  isFlashing={task.id === completionFlashId}
                  onUpdateTask={onUpdateTask}
                  onSelectTask={onSelectTask}
                  onOpenPanel={onOpenPanel}
                  delays={delaysByTaskId.get(task.id) ?? []}
                  onOpenDelay={onOpenDelayLog}
                />
              )
            })}
          </div>

          {/* Dependency arrows */}
          {dependencies.length > 0 && (
            <div style={{ position: 'absolute', top: 0, left: 0, width: totalPx, height: totalHeight, zIndex: 3, pointerEvents: 'none' }}>
              <DependencyArrows
                dependencies={dependencies}
                visibleRows={visibleRows}
                taskMap={taskMap}
                timeline={timeline}
                dayPx={dayPx}
                totalPx={totalPx}
                totalRows={visibleRows.length}
                criticalPath={showCriticalPath ? criticalPath : null}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Zoom pill (bottom-right) ── */}
      <div style={{
        position: 'absolute',
        bottom: 16,
        right: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow)',
        zIndex: 10,
        overflow: 'hidden',
      }}>
        <button
          onClick={onZoomOut}
          disabled={!canZoomOut}
          style={{
            width: 28, height: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'none', border: 'none', cursor: canZoomOut ? 'pointer' : 'default',
            color: canZoomOut ? 'var(--color-text-secondary)' : 'var(--color-text-dim)',
            fontSize: 16,
          }}
          title="Zoom out"
        >
          <Minus size={14} weight="regular" aria-hidden="true" />
        </button>
        <span style={{
          padding: '0 8px',
          fontSize: 'var(--text-xs)',
          fontWeight: 'var(--weight-medium)',
          color: 'var(--color-text-secondary)',
          borderLeft: '1px solid var(--color-border)',
          borderRight: '1px solid var(--color-border)',
          lineHeight: '28px',
          whiteSpace: 'nowrap',
        }}>
          {`Zoom · ${zoomLabel}`}
        </span>
        <button
          onClick={onZoomIn}
          disabled={!canZoomIn}
          style={{
            width: 28, height: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'none', border: 'none', cursor: canZoomIn ? 'pointer' : 'default',
            color: canZoomIn ? 'var(--color-text-secondary)' : 'var(--color-text-dim)',
            fontSize: 16,
          }}
          title="Zoom in"
        >
          <Plus size={14} weight="regular" aria-hidden="true" />
        </button>
      </div>

      {/* ── Ghost style toggle (bottom-right, above zoom pill, when baseline active) ── */}
      {baselines.length > 0 && (
        <div style={{
          position: 'absolute',
          bottom: 56,
          right: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-sm)',
          zIndex: 10,
          overflow: 'hidden',
        }}>
          {(['stripe', 'solid', 'outline'] as GhostStyle[]).map(style => {
            const icon = style === 'stripe'
              ? <Path size={12} weight="regular" aria-hidden="true" />
              : style === 'solid'
                ? <CircleHalf size={12} weight="regular" aria-hidden="true" />
                : <SquaresFour size={12} weight="regular" aria-hidden="true" />
            return (
            <button
              key={style}
              onClick={() => onSetGhostStyle(style)}
              style={{
                height: 24,
                padding: '0 7px',
                background: ghostStyle === style ? 'var(--accent-dim)' : 'none',
                border: 'none',
                color: ghostStyle === style ? 'var(--accent)' : 'var(--color-text-tertiary)',
                fontSize: 'var(--text-2xs)',
                fontWeight: 'var(--weight-medium)',
                cursor: 'pointer',
                borderRight: style !== 'outline' ? '1px solid var(--color-border)' : undefined,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title={`Ghost style: ${style}`}
            >
              {icon}
            </button>
            )
          })}
        </div>
      )}

      {hoveredCalendarEvent && hoverPosition && (
        <div
          style={{
            position: 'fixed',
            left: hoverPosition.x + 12,
            top: hoverPosition.y + 12,
            background: 'var(--surface-overlay)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow-sm)',
            padding: '6px 8px',
            zIndex: 110,
            pointerEvents: 'none',
            maxWidth: 260,
          }}
        >
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)' }}>
            {hoveredCalendarEvent.name}
          </div>
          <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-secondary)' }}>
            {hoveredCalendarEvent.classification.replace(/_/g, ' ')}
          </div>
        </div>
      )}

      <div style={{
        position: 'absolute',
        bottom: baselines.length > 0 ? 96 : 56,
        right: 16,
        zIndex: 10,
      }}>
        <button
          onClick={onToggleHistogram}
          style={{
            height: 24,
            padding: '0 8px',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--color-border)',
            background: histogramVisible ? 'var(--accent-dim)' : 'var(--color-surface)',
            color: histogramVisible ? 'var(--accent)' : 'var(--color-text-secondary)',
            fontSize: 'var(--text-2xs)',
            cursor: 'pointer',
          }}
        >
          Histogram
        </button>
      </div>

      {/* Empty state */}
      {visibleRows.length === 0 && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          pointerEvents: 'none',
        }}>
          <CalendarBlank size={28} weight="regular" color="var(--color-text-dim)" aria-hidden="true" />
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-tertiary)' }}>
            No tasks yet
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-dim)' }}>
            Add a task to see your schedule.
          </div>
        </div>
      )}

      {histogramVisible && (
        <div
          ref={histogramRef}
          onScroll={onHistogramScroll}
          style={{ overflowX: 'auto', overflowY: 'hidden', borderTop: '1px solid var(--color-border)' }}
        >
          <ResourceHistogram
            resources={resources}
            assignments={assignments}
            tasks={visibleTasks}
            timeline={timeline}
            dayPx={dayPx}
            workweek={workweek}
            holidays={holidays}
            selectedResourceIds={selectedResourceIds}
            compareMode={compareResourcesMode}
            onToggleCompareMode={onToggleCompareResourcesMode}
            onSelectResource={onSelectResource}
            isComputing={isComputing}
          />
        </div>
      )}
    </div>
  )
}
