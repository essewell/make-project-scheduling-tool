import { useCallback, useMemo, type RefObject } from 'react'
import type {
  Baseline, CpmResult, Dependency, GhostStyle,
  Group, Task, VisibleRow, WorkweekConfig,
} from '../../types'
import type { Timeline } from '../../types'
import { GANTT_HEADER_HEIGHT, ROW_HEIGHT, ZOOM_LEVELS } from '../../constants'
import { GanttHeader } from './GanttHeader'
import { GanttGrid } from './GanttGrid'
import { GanttBar } from './GanttBar'
import { DependencyArrows } from './DependencyArrows'
import { BaselineGhostBars } from './BaselineGhostBars'

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
  ganttRef: RefObject<HTMLDivElement>
  onScroll: () => void
  onUpdateTask: (id: string, patch: Partial<Task>) => void
  onSelectTask: (id: string) => void
  onOpenPanel: (id: string) => void
  onZoomIn: () => void
  onZoomOut: () => void
  onSetGhostStyle: (style: GhostStyle) => void
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
  ganttRef,
  onScroll,
  onUpdateTask,
  onSelectTask,
  onOpenPanel,
  onZoomIn,
  onZoomOut,
  onSetGhostStyle,
}: GanttProps) {
  // ── Derived ────────────────────────────────────────────────────────────────

  // Build task map for arrows and ghost bars
  const taskMap = useMemo(() => {
    const map = new Map<string, Task>()
    for (const row of visibleRows) {
      if (row.kind === 'task') map.set(row.task.id, row.task)
    }
    return map
  }, [visibleRows])

  const groupColorMap = useMemo(() =>
    new Map(groups.map(g => [g.id, g.color])),
    [groups]
  )

  const totalPx = timeline.totalPx
  const totalHeight = GANTT_HEADER_HEIGHT + visibleRows.length * ROW_HEIGHT

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
          −
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
          {zoomLabel}
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
          +
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
          {(['stripe', 'solid', 'outline'] as GhostStyle[]).map(style => (
            <button
              key={style}
              onClick={() => onSetGhostStyle(style)}
              style={{
                height: 24,
                padding: '0 8px',
                background: ghostStyle === style ? 'var(--accent-dim)' : 'none',
                border: 'none',
                color: ghostStyle === style ? 'var(--accent)' : 'var(--color-text-tertiary)',
                fontSize: 'var(--text-2xs)',
                fontWeight: 'var(--weight-medium)',
                cursor: 'pointer',
                borderRight: style !== 'outline' ? '1px solid var(--color-border)' : undefined,
              }}
              title={`Ghost style: ${style}`}
            >
              {style[0]?.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {visibleRows.length === 0 && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-tertiary)',
          fontSize: 'var(--text-sm)',
          pointerEvents: 'none',
        }}>
          Add tasks to see the Gantt chart.
        </div>
      )}
    </div>
  )
}
