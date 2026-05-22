import type { Dependency, Task, VisibleRow, CpmResult } from '../../types'
import type { Timeline } from '../../types'
import { dateToOffset } from '../../lib/timeline'
import { ROW_HEIGHT, GANTT_HEADER_HEIGHT, BAR_HEIGHT } from '../../constants'

interface DependencyArrowsProps {
  dependencies: Dependency[]
  visibleRows: VisibleRow[]
  taskMap: Map<string, Task>
  timeline: Timeline
  dayPx: number
  totalPx: number
  totalRows: number
  criticalPath: CpmResult | null
}

/** Build a map of task ID → row index in the visible rows array. */
function buildRowIndexMap(visibleRows: VisibleRow[]): Map<string, number> {
  const map = new Map<string, number>()
  visibleRows.forEach((row, i) => {
    if (row.kind === 'task') map.set(row.task.id, i)
  })
  return map
}

/** Elbow path: from (x1,y1) to (x2,y2) with a fixed horizontal arm length. */
function elbowPath(x1: number, y1: number, x2: number, y2: number): string {
  const ARM = 10
  // Route: x1 → x1+ARM → (x2-ARM, y2) → x2
  const mx = x1 + ARM
  const mx2 = Math.min(x2 - ARM, x1 + ARM)

  if (Math.abs(y1 - y2) < 2) {
    // Same row — straight line
    return `M ${x1} ${y1} L ${x2} ${y2}`
  }

  // Standard elbow: right → down/up → right
  return [
    `M ${x1} ${y1}`,
    `L ${mx} ${y1}`,
    `L ${mx2} ${y2}`,
    `L ${x2} ${y2}`,
  ].join(' ')
}

export function DependencyArrows({
  dependencies,
  visibleRows,
  taskMap,
  timeline,
  dayPx,
  totalPx,
  totalRows,
  criticalPath,
}: DependencyArrowsProps) {
  const rowIndexMap = buildRowIndexMap(visibleRows)
  const totalHeight = GANTT_HEADER_HEIGHT + totalRows * ROW_HEIGHT

  const barMidY = (rowIndex: number) =>
    GANTT_HEADER_HEIGHT + rowIndex * ROW_HEIGHT + (ROW_HEIGHT - BAR_HEIGHT) / 2 + BAR_HEIGHT / 2

  const arrows: Array<{ path: string; isCritical: boolean; key: string }> = []

  for (const dep of dependencies) {
    const from = taskMap.get(dep.fromId)
    const to = taskMap.get(dep.toId)
    if (!from || !to) continue

    const fromRow = rowIndexMap.get(dep.fromId)
    const toRow = rowIndexMap.get(dep.toId)
    if (fromRow === undefined || toRow === undefined) continue

    // Source/dest points depend on dep type
    let x1: number, y1: number, x2: number, y2: number

    const fromLeft = dateToOffset(from.s, timeline, dayPx)
    const fromRight = dateToOffset(from.e, timeline, dayPx) + dayPx
    const toLeft = dateToOffset(to.s, timeline, dayPx)
    const toRight = dateToOffset(to.e, timeline, dayPx) + dayPx
    const fromY = barMidY(fromRow)
    const toY = barMidY(toRow)

    switch (dep.type) {
      case 'FS':
        x1 = fromRight; y1 = fromY
        x2 = toLeft;    y2 = toY
        break
      case 'SS':
        x1 = fromLeft;  y1 = fromY
        x2 = toLeft;    y2 = toY
        break
      case 'FF':
        x1 = fromRight; y1 = fromY
        x2 = toRight;   y2 = toY
        break
      case 'SF':
        x1 = fromLeft;  y1 = fromY
        x2 = toRight;   y2 = toY
        break
      default:
        x1 = fromRight; y1 = fromY
        x2 = toLeft;    y2 = toY
    }

    const isCritical = !!(criticalPath?.criticalIds.has(dep.fromId) && criticalPath.criticalIds.has(dep.toId))
    const path = elbowPath(x1, y1, x2, y2)

    arrows.push({ path, isCritical, key: `${dep.fromId}-${dep.toId}-${dep.type}` })
  }

  if (arrows.length === 0) return null

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: totalPx,
        height: totalHeight,
        pointerEvents: 'none',
        overflow: 'visible',
        zIndex: 1,
      }}
    >
      <defs>
        {/* Normal arrowhead */}
        <marker
          id="arrow-normal"
          markerWidth="7"
          markerHeight="7"
          refX="5"
          refY="3.5"
          orient="auto"
        >
          <polyline
            points="0,0 5,3.5 0,7"
            fill="none"
            stroke="var(--color-text-dim)"
            strokeWidth="1.2"
          />
        </marker>
        {/* Critical arrowhead */}
        <marker
          id="arrow-critical"
          markerWidth="7"
          markerHeight="7"
          refX="5"
          refY="3.5"
          orient="auto"
        >
          <polyline
            points="0,0 5,3.5 0,7"
            fill="none"
            stroke="var(--color-danger)"
            strokeWidth="1.2"
          />
        </marker>
      </defs>

      {arrows.map(({ path, isCritical, key }) => (
        <path
          key={key}
          d={path}
          fill="none"
          stroke={isCritical ? 'var(--color-danger)' : 'var(--color-text-dim)'}
          strokeWidth={isCritical ? 1.5 : 1}
          markerEnd={isCritical ? 'url(#arrow-critical)' : 'url(#arrow-normal)'}
          strokeDasharray={isCritical ? undefined : '4 2'}
          opacity={isCritical ? 0.85 : 0.6}
        />
      ))}
    </svg>
  )
}
