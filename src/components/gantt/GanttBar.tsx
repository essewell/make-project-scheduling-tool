import { memo, useRef, useCallback } from 'react'
import type { Task } from '../../types'
import type { Timeline } from '../../types'
import { dateToOffset } from '../../lib/timeline'
import { daysBetween, addDays } from '../../lib/dates'
import { BAR_HEIGHT, MIN_BAR_PX, MILESTONE_SIZE, ROW_HEIGHT, GANTT_HEADER_HEIGHT } from '../../constants'

// ─── Props ────────────────────────────────────────────────────────────────────

interface GanttBarProps {
  task: Task
  rowIndex: number        // position in visible rows
  groupColor: string
  timeline: Timeline
  dayPx: number
  isSelected: boolean
  isKbFocused: boolean
  isCritical: boolean     // cp-critical: red outline
  isDimmed: boolean       // cp-dimmed: low opacity
  isFlashing: boolean     // completion flash animation
  onUpdateTask: (id: string, patch: Partial<Task>) => void
  onSelectTask: (id: string) => void
  onOpenPanel: (id: string) => void
}

// ─── Drag types ───────────────────────────────────────────────────────────────

type DragMode = 'move' | 'left' | 'right'

interface DragState {
  mode: DragMode
  startX: number
  origS: string
  origE: string
}

// ─── Status style modifiers ───────────────────────────────────────────────────

function barFill(task: Task, groupColor: string): string {
  if (task.status === 'complete') return groupColor + 'AA'  // faded
  return groupColor
}

function barBorder(task: Task): string | undefined {
  if (task.status === 'at_risk') return '2px solid color-mix(in srgb, var(--color-warning) 72%, transparent)'
  if (task.status === 'delayed') return '2px solid color-mix(in srgb, var(--color-danger) 80%, transparent)'
  return undefined
}

function milestoneStyle(task: Task, groupColor: string): { fill: string; outline: string } {
  if (task.status === 'complete') {
    return {
      fill: `color-mix(in srgb, ${groupColor} 55%, var(--surface-overlay))`,
      outline: 'var(--data-positive)',
    }
  }
  if (task.status === 'delayed') {
    return {
      fill: `color-mix(in srgb, ${groupColor} 78%, var(--data-negative))`,
      outline: 'var(--data-negative)',
    }
  }
  if (task.status === 'at_risk') {
    return {
      fill: `color-mix(in srgb, ${groupColor} 78%, var(--data-caution))`,
      outline: 'var(--data-caution)',
    }
  }
  return { fill: groupColor, outline: `color-mix(in srgb, ${groupColor} 78%, var(--ink-strong))` }
}

// ─── GanttBar ────────────────────────────────────────────────────────────────

export const GanttBar = memo(function GanttBar({
  task,
  rowIndex,
  groupColor,
  timeline,
  dayPx,
  isSelected,
  isKbFocused,
  isCritical,
  isDimmed,
  isFlashing,
  onUpdateTask,
  onSelectTask,
  onOpenPanel,
}: GanttBarProps) {
  const dragRef = useRef<DragState | null>(null)

  const left = dateToOffset(task.s, timeline, dayPx)
  const right = dateToOffset(task.e, timeline, dayPx) + dayPx
  const rawWidth = right - left
  const width = Math.max(rawWidth, MIN_BAR_PX)

  const top = GANTT_HEADER_HEIGHT + rowIndex * ROW_HEIGHT + (ROW_HEIGHT - BAR_HEIGHT) / 2

  // ── Progress fill overlay ──────────────────────────────────────────────────
  const pctWidth = (task.pct / 100) * width

  // ── Drag handler — must be defined before any early return (rules-of-hooks) ─
  const onMouseDown = useCallback((e: React.MouseEvent, mode: DragMode) => {
    if (e.button !== 0) return
    e.stopPropagation()
    onSelectTask(task.id)

    dragRef.current = {
      mode,
      startX: e.clientX,
      origS: task.s,
      origE: task.e,
    }

    const onMove = (ev: MouseEvent) => {
      const drag = dragRef.current
      if (!drag) return

      const dx = ev.clientX - drag.startX
      const dDays = Math.round(dx / dayPx)
      if (dDays === 0) return

      let s = drag.origS
      let e = drag.origE

      if (drag.mode === 'move') {
        s = addDays(drag.origS, dDays)
        e = addDays(drag.origE, dDays)
      } else if (drag.mode === 'left') {
        s = addDays(drag.origS, dDays)
        // Don't allow start > end - 1 day
        if (daysBetween(s, drag.origE) < 0) {
          s = addDays(drag.origE, -1)
        }
      } else {
        e = addDays(drag.origE, dDays)
        // Don't allow end < start + 1 day
        if (daysBetween(drag.origS, e) < 0) {
          e = addDays(drag.origS, 1)
        }
      }

      onUpdateTask(task.id, { s, e })
    }

    const onUp = () => {
      dragRef.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [task.id, task.s, task.e, dayPx, onSelectTask, onUpdateTask])

  // ── Milestone rendering ────────────────────────────────────────────────────
  if (task.milestone) {
    const cx = left + dayPx / 2
    const cy = GANTT_HEADER_HEIGHT + rowIndex * ROW_HEIGHT + ROW_HEIGHT / 2

    const milestoneVisual = milestoneStyle(task, groupColor)

    return (
      <div
        onClick={(e) => { e.stopPropagation(); onSelectTask(task.id) }}
        onDoubleClick={(e) => { e.stopPropagation(); onOpenPanel(task.id) }}
        style={{
          position: 'absolute',
          left: cx - MILESTONE_SIZE / 2,
          top: cy - MILESTONE_SIZE / 2,
          width: MILESTONE_SIZE,
          height: MILESTONE_SIZE,
          background: milestoneVisual.fill,
          border: `1px solid ${milestoneVisual.outline}`,
          transform: 'rotate(45deg)',
          borderRadius: 2,
          cursor: 'pointer',
          opacity: isDimmed ? 0.6 : 1,
          outline: isSelected || isCritical
            ? `2px solid ${isCritical ? 'var(--color-danger)' : 'var(--accent)'}`
            : isKbFocused ? '2px solid var(--accent)' : undefined,
          outlineOffset: 2,
          zIndex: 2,
        }}
        title={task.name}
      />
    )
  }

  // ── Normal bar ────────────────────────────────────────────────────────────

  const border = barBorder(task)
  const fill = barFill(task, groupColor)

  const HANDLE_W = Math.min(6, width / 3)

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onSelectTask(task.id) }}
      onDoubleClick={(e) => { e.stopPropagation(); onOpenPanel(task.id) }}
      onMouseDown={(e) => onMouseDown(e, 'move')}
      style={{
        position: 'absolute',
        left,
        top,
        width,
        height: BAR_HEIGHT,
        borderRadius: 'var(--radius)',
        background: fill,
        border,
        boxSizing: 'border-box',
        cursor: 'grab',
        userSelect: 'none',
        opacity: isDimmed ? 0.6 : task.status === 'not_started' ? 0.55 : 1,
        transition: 'left 120ms ease, width 120ms ease, opacity 240ms ease, background 240ms ease, border 240ms ease, outline 240ms ease, box-shadow 240ms ease',
        animation: isCritical ? 'schedule-critical-path-shake 240ms ease' : undefined,
        animationFillMode: 'forwards',
        transformOrigin: 'center center',
        zIndex: isSelected ? 3 : 2,
        outline: (isSelected || isKbFocused) && !isCritical
          ? '2px solid var(--accent)'
          : undefined,
        outlineOffset: -1,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18)',
        overflow: 'hidden',
      }}
      title={task.name}
    >
      {isCritical && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 3,
            height: '100%',
            background: 'var(--data-negative)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      )}

      {/* Progress fill */}
      {task.pct > 0 && task.pct < 100 && (
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: pctWidth,
          height: '100%',
          background: 'rgba(255,255,255,0.25)',
          borderRadius: 'inherit',
          pointerEvents: 'none',
        }} />
      )}

      {/* Completion flash overlay */}
      {isFlashing && (
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          background: 'color-mix(in srgb, var(--color-success) 46%, transparent)',
          animation: 'schedule-completion-pulse 0.9s ease-out both',
          pointerEvents: 'none',
        }} />
      )}

      {/* Left resize handle */}
      <div
        onMouseDown={(e) => onMouseDown(e, 'left')}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: HANDLE_W,
          height: '100%',
          cursor: 'ew-resize',
          zIndex: 2,
        }}
      />

      {/* Right resize handle */}
      <div
        onMouseDown={(e) => onMouseDown(e, 'right')}
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          width: HANDLE_W,
          height: '100%',
          cursor: 'ew-resize',
          zIndex: 2,
        }}
      />
    </div>
  )
}, (prev, next) => {
  // Custom comparator — only re-render if visual inputs changed
  return (
    prev.task.s === next.task.s &&
    prev.task.e === next.task.e &&
    prev.task.status === next.task.status &&
    prev.task.pct === next.task.pct &&
    prev.task.milestone === next.task.milestone &&
    prev.rowIndex === next.rowIndex &&
    prev.groupColor === next.groupColor &&
    prev.dayPx === next.dayPx &&
    prev.isSelected === next.isSelected &&
    prev.isKbFocused === next.isKbFocused &&
    prev.isCritical === next.isCritical &&
    prev.isDimmed === next.isDimmed
  )
})
