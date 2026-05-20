import type { Group, Timeline, VisibleRow, WorkweekConfig } from '../../types'
import { dateToOffset } from '../../lib/timeline'
import { ROW_HEIGHT, GANTT_HEADER_HEIGHT } from '../../constants'
import { fmtDate, daysBetween } from '../../lib/dates'

interface GanttGridProps {
  timeline: Timeline
  dayPx: number
  totalPx: number
  visibleRows: VisibleRow[]
  groups: Group[]
  today: string
  workweek: WorkweekConfig
}

export function GanttGrid({
  timeline,
  dayPx,
  totalPx,
  visibleRows,
  groups,
  today,
  workweek,
}: GanttGridProps) {
  const totalHeight = GANTT_HEADER_HEIGHT + visibleRows.length * ROW_HEIGHT

  const todayOffset = dateToOffset(today, timeline, dayPx)
  const showDayGrid = dayPx >= 16

  // ── Group band row spans ──────────────────────────────────────────────────
  // Alternating group highlights
  type BandInfo = { groupId: string; startRow: number; rowCount: number; color: string }
  const bands: BandInfo[] = []
  let rowIdx = 0
  let curGroupId: string | null = null
  let bandStart = 0

  for (const row of visibleRows) {
    if (row.kind === 'group') {
      if (curGroupId !== null) {
        const g = groups.find(g => g.id === curGroupId)
        bands.push({ groupId: curGroupId, startRow: bandStart, rowCount: rowIdx - bandStart, color: g?.color ?? '#378ADD' })
      }
      curGroupId = row.groupId
      bandStart = rowIdx
    }
    rowIdx++
  }
  if (curGroupId !== null) {
    const g = groups.find(g => g.id === curGroupId)
    bands.push({ groupId: curGroupId, startRow: bandStart, rowCount: rowIdx - bandStart, color: g?.color ?? '#378ADD' })
  }

  // ── Weekend bands (day zoom only) ─────────────────────────────────────────
  // Map JS getDay() (0=Sun..6=Sat) to WorkweekConfig keys
  const DOW_KEYS: Array<keyof WorkweekConfig> = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  const weekendBands: Array<{ offset: number; width: number }> = []
  if (showDayGrid) {
    for (const d of timeline.days) {
      const key = DOW_KEYS[d.date.getDay()]
      if (key && !workweek[key]) {
        weekendBands.push({ offset: d.offset, width: dayPx })
      }
    }
  }

  // ── Month separator x-offsets ─────────────────────────────────────────────
  const monthLines = timeline.months.map(m => m.offset)

  // ── Week separator x-offsets ─────────────────────────────────────────────
  const weekLines = dayPx >= 5 ? timeline.weeks.map(w => w.offset) : []

  // ── Today line ────────────────────────────────────────────────────────────
  const todayVisible = todayOffset >= 0 && todayOffset <= totalPx

  // Today pill label: short day-of-week + date
  const todayDate = new Date(today + 'T00:00:00')
  const dayLabel = todayDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  // Days between first/last task for row-band height
  const _firstTaskDate = fmtDate(timeline.min)
  const _lastTaskDate = fmtDate(timeline.max)
  const _totalDays = daysBetween(_firstTaskDate, _lastTaskDate) + 1
  void _totalDays  // used in SVG sizing

  return (
    <div style={{
      position: 'absolute',
      top: GANTT_HEADER_HEIGHT,
      left: 0,
      width: totalPx,
      height: Math.max(totalHeight - GANTT_HEADER_HEIGHT, 0),
      pointerEvents: 'none',
    }}>
      {/* ── Group band highlights ── */}
      {bands.map((band, i) => (
        <div
          key={band.groupId + i}
          style={{
            position: 'absolute',
            left: 0,
            top: band.startRow * ROW_HEIGHT,
            width: totalPx,
            height: band.rowCount * ROW_HEIGHT,
            background: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.015)',
            borderTop: '1px solid var(--color-border-light)',
            boxSizing: 'border-box',
          }}
        />
      ))}

      {/* ── Row dividers ── */}
      {visibleRows.map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: 0,
            top: (i + 1) * ROW_HEIGHT - 1,
            width: totalPx,
            height: 1,
            background: 'var(--color-border-light)',
          }}
        />
      ))}

      {/* ── Weekend bands (day zoom) ── */}
      {weekendBands.map((band, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: band.offset,
            top: 0,
            width: band.width,
            height: '100%',
            background: 'rgba(0,0,0,0.025)',
          }}
        />
      ))}

      {/* ── Month separator lines ── */}
      {monthLines.map((x, i) => (
        <div
          key={'m' + i}
          style={{
            position: 'absolute',
            left: x,
            top: 0,
            width: 1,
            height: '100%',
            background: 'var(--color-border)',
            opacity: 0.6,
          }}
        />
      ))}

      {/* ── Week separator lines (only at month+week zoom) ── */}
      {dayPx >= 5 && dayPx < 16 && weekLines.map((x, i) => (
        <div
          key={'w' + i}
          style={{
            position: 'absolute',
            left: x,
            top: 0,
            width: 1,
            height: '100%',
            background: 'var(--color-border-light)',
          }}
        />
      ))}

      {/* ── Today line + pill ── */}
      {todayVisible && (
        <>
          <div style={{
            position: 'absolute',
            left: todayOffset,
            top: 0,
            width: 2,
            height: '100%',
            background: 'var(--color-today)',
            zIndex: 'var(--z-today-line)' as unknown as number,
            opacity: 0.9,
          }} />
          {/* Today pill — positioned relative to the outer gantt-scroll container */}
          <div style={{
            position: 'absolute',
            left: todayOffset - 1,
            top: -24,
            transform: 'translateX(-50%)',
            background: 'var(--color-today)',
            color: '#fff',
            fontSize: 'var(--text-2xs)',
            fontWeight: 'var(--weight-semibold)',
            padding: '2px 7px',
            borderRadius: 'var(--radius)',
            whiteSpace: 'nowrap',
            boxShadow: 'var(--shadow-sm)',
            pointerEvents: 'none',
          }}>
            {dayLabel}
          </div>
        </>
      )}

      {/* ── Left group color bar per group row ── */}
      {visibleRows.map((row, i) => {
        if (row.kind !== 'group') return null
        return (
          <div
            key={'gbar' + row.groupId}
            style={{
              position: 'absolute',
              left: 0,
              top: i * ROW_HEIGHT,
              width: 3,
              height: ROW_HEIGHT,
              background: row.color,
            }}
          />
        )
      })}

    </div>
  )
}
