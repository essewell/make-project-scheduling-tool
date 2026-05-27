import type { Timeline } from '../../types'
import { getTiersForDayPx } from '../../lib/timeline'
import { GANTT_HEADER_HEIGHT } from '../../constants'
import { CalendarToggle } from '../topbar/CalendarToggle'

interface GanttHeaderProps {
  timeline: Timeline
  dayPx: number
  totalPx: number
  overAllocatedOffsets?: Set<number>
  calendarOverlayEnabled: boolean
  onToggleCalendarOverlay: () => void
}

const TIER_H = GANTT_HEADER_HEIGHT / 2  // 32px each

export function GanttHeader({
  timeline,
  dayPx,
  totalPx,
  overAllocatedOffsets,
  calendarOverlayEnabled,
  onToggleCalendarOverlay,
}: GanttHeaderProps) {
  const { primary, secondary } = getTiersForDayPx(dayPx)

  // ── Primary tier buckets ──────────────────────────────────────────────────
  const primaryBuckets = primary === 'month'
    ? timeline.months
    : primary === 'quarter'
    ? timeline.quarters
    : timeline.years

  // ── Secondary tier ────────────────────────────────────────────────────────
  // Build labels for each secondary bucket based on type
  type SecondaryItem = { offset: number; label: string; width: number }

  let secondaryItems: SecondaryItem[] = []

  if (secondary === 'day') {
    secondaryItems = timeline.days.map((d, i) => {
      const next = timeline.days[i + 1]
      const width = next ? next.offset - d.offset : dayPx
      const dow = d.date.getDay()
      const isWeekend = dow === 0 || dow === 6
      return {
        offset: d.offset,
        label: String(d.date.getDate()),
        width: Math.max(width, 1),
        // carry isWeekend for styling
        ...(isWeekend ? { _weekend: true } : {}),
      } as SecondaryItem & { _weekend?: boolean }
    })
  } else if (secondary === 'week') {
    secondaryItems = timeline.weeks.map((w, i) => {
      const next = timeline.weeks[i + 1]
      const width = next ? next.offset - w.offset : dayPx * 7
      return { offset: w.offset, label: w.label, width: Math.max(width, 1) }
    })
  } else if (secondary === 'month') {
    secondaryItems = timeline.months.map((m, i) => {
      const next = timeline.months[i + 1]
      const width = next ? next.offset - m.offset : m.days * dayPx
      return { offset: m.offset, label: m.label, width: Math.max(width, 1) }
    })
  } else {
    // quarter
    secondaryItems = timeline.quarters.map((q, i) => {
      const next = timeline.quarters[i + 1]
      const width = next ? next.offset - q.offset : q.days * dayPx
      return { offset: q.offset, label: q.label, width: Math.max(width, 1) }
    })
  }

  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 'var(--z-gantt-header)' as unknown as number,
      height: GANTT_HEADER_HEIGHT,
      width: totalPx,
      background: 'var(--color-surface)',
      borderBottom: '1px solid var(--color-border)',
      pointerEvents: 'none',
      userSelect: 'none',
    }}>
      {/* ── Primary tier ── */}
      <div style={{ position: 'relative', height: TIER_H, borderBottom: '1px solid var(--rule)', background: 'var(--color-surface)' }}>
        {primaryBuckets.map((bucket, i) => {
          const next = primaryBuckets[i + 1]
          const width = next ? next.offset - bucket.offset : bucket.days * dayPx
          return (
            <div
              key={bucket.label + i}
              style={{
                position: 'absolute',
                left: bucket.offset,
                top: 0,
                width: Math.max(width, 1),
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                paddingLeft: 8,
                overflow: 'hidden',
                boxSizing: 'border-box',
                borderRight: '1px solid var(--color-border-light)',
              }}
            >
              <span style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--weight-semibold)',
                color: 'var(--ink-primary)',
                letterSpacing: '0.01em',
                whiteSpace: 'nowrap',
              }}>
                {bucket.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* ── Secondary tier ── */}
      <div style={{ position: 'relative', height: TIER_H, background: 'var(--color-surface-2)' }}>
        {secondaryItems.map((item, i) => {
          const isWeekend = '_weekend' in item && (item as SecondaryItem & { _weekend?: boolean })._weekend
          // At Month zoom (dayPx < 6) hide every other week label to prevent crowding;
          // the tick border still shows so rhythm is preserved
          const hideWeekLabel = secondary === 'week' && dayPx < 6 && i % 2 !== 0
          return (
            <div
              key={item.label + item.offset + i}
              style={{
                position: 'absolute',
                left: item.offset,
                top: 0,
                width: item.width,
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: secondary === 'day' ? 'center' : 'flex-start',
                paddingLeft: secondary === 'day' ? 0 : 6,
                overflow: 'hidden',
                boxSizing: 'border-box',
                borderRight: secondary === 'day' || secondary === 'week'
                  ? '1px solid var(--color-border-light)'
                  : undefined,
                background: isWeekend ? 'var(--color-surface-2)' : undefined,
                borderBottom: overAllocatedOffsets?.has(item.offset)
                  ? '1px solid var(--color-danger)'
                  : undefined,
              }}
            >
              {!hideWeekLabel && (
                <span style={{
                  fontSize: 'var(--text-2xs)',
                  color: isWeekend ? 'var(--ink-quiet)' : 'var(--ink-tertiary)',
                  whiteSpace: 'nowrap',
                  fontFamily: secondary === 'day' ? 'var(--font-mono)' : undefined,
                  fontWeight: 'var(--weight-medium)',
                }}>
                  {item.label}
                </span>
              )}
            </div>
          )
        })}

        <div
          style={{
            position: 'absolute',
            right: 8,
            top: 4,
            pointerEvents: 'auto',
          }}
        >
          <CalendarToggle
            enabled={calendarOverlayEnabled}
            onToggle={onToggleCalendarOverlay}
          />
        </div>
      </div>
    </div>
  )
}
