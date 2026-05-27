import { memo, useMemo } from 'react'
import type { CalendarEvent, Timeline } from '../../types'
import { GANTT_HEADER_HEIGHT, ROW_HEIGHT } from '../../constants'
import { dateToOffset } from '../../lib/timeline'

interface CalendarOverlayProps {
  projectCalendar: CalendarEvent[]
  timeline: Timeline
  dayPx: number
  rowCount: number
  totalPx: number
  onHoverEvent: (event: CalendarEvent | null, clientX?: number, clientY?: number) => void
}

const CLASS_FILL: Record<CalendarEvent['classification'], string> = {
  non_work: 'url(#calendar-overlay-non-work)',
  reduced_capacity: 'url(#calendar-overlay-reduced-capacity)',
  advisory_only: 'url(#calendar-overlay-advisory)',
}

export const CalendarOverlay = memo(function CalendarOverlay({
  projectCalendar,
  timeline,
  dayPx,
  rowCount,
  totalPx,
  onHoverEvent,
}: CalendarOverlayProps) {
  const bars = useMemo(() => {
    const overlayTop = GANTT_HEADER_HEIGHT
    const overlayHeight = rowCount * ROW_HEIGHT
    return projectCalendar.map((event) => {
      const left = dateToOffset(event.start, timeline, dayPx)
      const right = dateToOffset(event.end, timeline, dayPx) + dayPx
      return {
        event,
        left: Math.max(0, left),
        width: Math.max(dayPx, right - left),
        top: overlayTop,
        height: overlayHeight,
      }
    })
  }, [projectCalendar, timeline, dayPx, rowCount])

  if (projectCalendar.length === 0 || rowCount === 0) return null

  return (
    <svg
      width={totalPx}
      height={GANTT_HEADER_HEIGHT + rowCount * ROW_HEIGHT}
      style={{ position: 'absolute', top: 0, left: 0, zIndex: 1, pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <defs>
        <pattern id="calendar-overlay-non-work" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="8" height="8" fill="transparent" />
          <line x1="0" y1="0" x2="0" y2="8" stroke="var(--calendar-overlay-stripe)" strokeWidth="3" />
        </pattern>
        <pattern id="calendar-overlay-reduced-capacity" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="10" height="10" fill="transparent" />
          <line x1="0" y1="0" x2="0" y2="10" stroke="var(--calendar-overlay-stripe)" strokeWidth="2" />
        </pattern>
        <pattern id="calendar-overlay-advisory" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="14" height="14" fill="transparent" />
          <line x1="0" y1="0" x2="0" y2="14" stroke="var(--calendar-overlay-stripe)" strokeWidth="1" />
        </pattern>
      </defs>

      {bars.map(({ event, left, width, top, height }) => (
        <g key={event.id} style={{ pointerEvents: 'auto' }}>
          <rect
            x={left}
            y={top}
            width={width}
            height={height}
            fill={CLASS_FILL[event.classification]}
            opacity={event.classification === 'advisory_only' ? 0.3 : 0.5}
            pointerEvents="none"
          />
          <rect
            x={left}
            y={top}
            width={width}
            height={height}
            fill="transparent"
            stroke="var(--calendar-event-edge)"
            strokeWidth="1"
            onMouseEnter={(mouseEvent) => onHoverEvent(event, mouseEvent.clientX, mouseEvent.clientY)}
            onMouseMove={(mouseEvent) => onHoverEvent(event, mouseEvent.clientX, mouseEvent.clientY)}
            onMouseLeave={() => onHoverEvent(null)}
          />
        </g>
      ))}
    </svg>
  )
})
