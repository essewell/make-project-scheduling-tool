import type { Baseline, GhostStyle, Task, VisibleRow } from '../../types'
import type { Timeline } from '../../types'
import { dateToOffset } from '../../lib/timeline'
import { daysBetween } from '../../lib/dates'
import { GHOST_BAR_HEIGHT, ROW_HEIGHT, GANTT_HEADER_HEIGHT, BAR_HEIGHT, SLIP_LABEL_THRESHOLD, MIN_BAR_PX } from '../../constants'

interface BaselineGhostBarsProps {
  baselines: Baseline[]
  activeBaselineId: string | null
  ghostStyle: GhostStyle
  visibleRows: VisibleRow[]
  timeline: Timeline
  dayPx: number
  today: string
}

/** Index of task ID → current live task for variance computation. */
function buildTaskMap(visibleRows: VisibleRow[]): Map<string, Task> {
  const map = new Map<string, Task>()
  for (const row of visibleRows) {
    if (row.kind === 'task') map.set(row.task.id, row.task)
  }
  return map
}

export function BaselineGhostBars({
  baselines,
  activeBaselineId,
  ghostStyle,
  visibleRows,
  timeline,
  dayPx,
  today,
}: BaselineGhostBarsProps) {
  // Find active baseline
  const baseline = activeBaselineId
    ? baselines.find(b => b.id === activeBaselineId)
    : baselines.length > 0 ? baselines[baselines.length - 1] : undefined

  if (!baseline) return null

  const liveTaskMap = buildTaskMap(visibleRows)

  // Build row index map (task id → row index)
  const rowIndexMap = new Map<string, number>()
  visibleRows.forEach((row, i) => {
    if (row.kind === 'task') rowIndexMap.set(row.task.id, i)
  })

  const ghostBars: React.ReactNode[] = []
  const varianceLabels: React.ReactNode[] = []

  for (const baseTask of baseline.tasks) {
    const rowIndex = rowIndexMap.get(baseTask.id)
    if (rowIndex === undefined) continue

    const left = dateToOffset(baseTask.s, timeline, dayPx)
    const right = dateToOffset(baseTask.e, timeline, dayPx) + dayPx
    const width = Math.max(right - left, MIN_BAR_PX)

    // Vertical position: lower half of the bar row
    const barTop = GANTT_HEADER_HEIGHT + rowIndex * ROW_HEIGHT + (ROW_HEIGHT - BAR_HEIGHT) / 2
    const ghostTop = barTop + BAR_HEIGHT - GHOST_BAR_HEIGHT + 2

    // ── Ghost bar rendering based on style ──────────────────────────────────
    let ghostEl: React.ReactNode

    if (ghostStyle === 'solid') {
      ghostEl = (
        <div
          key={`ghost-${baseTask.id}`}
          style={{
            position: 'absolute',
            left,
            top: ghostTop,
            width,
            height: GHOST_BAR_HEIGHT,
            borderRadius: 2,
            background: 'var(--color-text-dim)',
            opacity: 0.3,
            pointerEvents: 'none',
          }}
        />
      )
    } else if (ghostStyle === 'outline') {
      ghostEl = (
        <div
          key={`ghost-${baseTask.id}`}
          style={{
            position: 'absolute',
            left,
            top: ghostTop,
            width,
            height: GHOST_BAR_HEIGHT,
            borderRadius: 2,
            border: '1.5px solid var(--color-text-dim)',
            opacity: 0.45,
            boxSizing: 'border-box',
            pointerEvents: 'none',
          }}
        />
      )
    } else {
      // stripe (default) — use SVG pattern fill
      ghostEl = (
        <div
          key={`ghost-${baseTask.id}`}
          style={{
            position: 'absolute',
            left,
            top: ghostTop,
            width,
            height: GHOST_BAR_HEIGHT,
            borderRadius: 2,
            overflow: 'hidden',
            opacity: 0.5,
            pointerEvents: 'none',
          }}
        >
          <svg width={width} height={GHOST_BAR_HEIGHT} style={{ display: 'block' }}>
            <defs>
              <pattern id={`stripe-${baseTask.id}`} x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
                <rect width="3" height="6" fill="var(--color-text-tertiary)" opacity="0.6" />
              </pattern>
            </defs>
            <rect width={width} height={GHOST_BAR_HEIGHT} fill={`url(#stripe-${baseTask.id})`} rx="2" />
            <rect width={width} height={GHOST_BAR_HEIGHT} rx="2" fill="none" stroke="var(--color-text-dim)" strokeWidth="1" opacity="0.6" />
          </svg>
        </div>
      )
    }

    ghostBars.push(ghostEl)

    // ── Variance label ───────────────────────────────────────────────────────
    const liveTask = liveTaskMap.get(baseTask.id)
    if (liveTask) {
      const slipDays = daysBetween(baseTask.e, liveTask.e)  // positive = slip, negative = ahead
      if (Math.abs(slipDays) >= SLIP_LABEL_THRESHOLD) {
        const isSlip = slipDays > 0
        const labelX = dateToOffset(liveTask.e, timeline, dayPx) + dayPx + 4
        const labelY = GANTT_HEADER_HEIGHT + rowIndex * ROW_HEIGHT + ROW_HEIGHT / 2 - 8
        const label = isSlip ? `+${slipDays}d` : `${slipDays}d`

        varianceLabels.push(
          <div
            key={`var-${baseTask.id}`}
            style={{
              position: 'absolute',
              left: labelX,
              top: labelY,
              background: 'var(--color-surface)',
              border: `1px solid ${isSlip ? 'var(--color-danger)' : 'var(--color-success)'}`,
              color: isSlip ? 'var(--color-danger)' : 'var(--color-success)',
              fontSize: 'var(--text-2xs)',
              fontWeight: 'var(--weight-medium)',
              padding: '1px 5px',
              borderRadius: 'var(--radius)',
              whiteSpace: 'nowrap',
              boxShadow: 'var(--shadow-sm)',
              pointerEvents: 'none',
              zIndex: 4,
            }}
          >
            {label}
          </div>
        )
      }
    }
  }

  // Suppress unused import warning
  void today

  return (
    <>
      {ghostBars}
      {varianceLabels}
    </>
  )
}
