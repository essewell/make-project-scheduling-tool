import { daysBetween } from '../../lib/dates'
import { CalendarBlank } from '../../lib/icons'
import type { Task } from '../../types'

interface ActualDatesSectionProps {
  plannedStart: string
  plannedFinish: string
  actualStart: string | null
  actualFinish: string | null
  onChange: (patch: Partial<Task>) => void
}

const INPUT: React.CSSProperties = {
  height: 30,
  borderRadius: 'var(--radius)',
  border: '1px solid var(--color-border)',
  padding: '0 8px',
  fontSize: 'var(--text-xs)',
  fontFamily: 'var(--font-mono)',
  background: 'var(--color-surface)',
  color: 'var(--color-text-primary)',
  width: '100%',
  boxSizing: 'border-box',
  paddingLeft: 28,
}

export function ActualDatesSection({
  plannedStart,
  plannedFinish,
  actualStart,
  actualFinish,
  onChange,
}: ActualDatesSectionProps) {
  const showWarning = !!(actualFinish && actualStart && actualFinish < actualStart)
  const finishVariance = actualFinish ? daysBetween(plannedFinish, actualFinish) : null
  const startVariance = actualStart ? daysBetween(plannedStart, actualStart) : null
  const varianceTone =
    finishVariance === null || finishVariance === 0
      ? 'var(--data-neutral)'
      : finishVariance > 0
        ? 'var(--data-negative)'
        : 'var(--data-positive)'

  const handleFinishChange = (val: string) => {
    const finish = val || null
    if (finish) {
      // C3: setting actualFinish → cascade to complete
      onChange({
        actualFinish: finish,
        pct: 100,
        status: 'complete',
        manualStatus: true,
        manualPct: true,
      })
    } else {
      // Clearing actualFinish → revert to auto-progress
      onChange({
        actualFinish: null,
        manualStatus: false,
        manualPct: false,
      })
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ width: 32, height: 1, background: 'var(--rule-soft)', marginBottom: 2 }} aria-hidden="true" />
      <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Actual Dates
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-tertiary)' }}>
            Actual Start
          </label>
          <div style={{ position: 'relative' }}>
            <CalendarBlank size={14} weight="regular" style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-quiet)', pointerEvents: 'none' }} aria-hidden="true" />
            <input
              type="date"
              value={actualStart ?? ''}
              aria-label="Actual start date"
              onChange={e => onChange({ actualStart: e.target.value || null })}
              style={INPUT}
            />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-tertiary)' }}>
            Actual Finish
          </label>
          <div style={{ position: 'relative' }}>
            <CalendarBlank size={14} weight="regular" style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-quiet)', pointerEvents: 'none' }} aria-hidden="true" />
            <input
              type="date"
              value={actualFinish ?? ''}
              aria-label="Actual finish date"
              onChange={e => handleFinishChange(e.target.value)}
              style={INPUT}
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{ background: 'var(--surface-sunken)', borderRadius: 'var(--radius)', padding: '6px 10px', border: '1px solid var(--rule-soft)' }}>
          <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--ink-quiet)' }}>Start Variance</div>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', fontFamily: 'var(--font-mono)' }}>
            {startVariance === null ? '—' : `${startVariance > 0 ? '+' : ''}${startVariance}d`}
          </div>
        </div>
        <div style={{ background: 'var(--surface-sunken)', borderRadius: 'var(--radius)', padding: '6px 10px', border: '1px solid var(--rule-soft)' }}>
          <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--ink-quiet)' }}>Finish Variance</div>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', fontFamily: 'var(--font-mono)', color: varianceTone }}>
            {finishVariance === null ? '—' : `${finishVariance > 0 ? '+' : ''}${finishVariance}d`}
          </div>
        </div>
      </div>

      {/* C3 — non-blocking advisory */}
      {showWarning && (
        <div style={{
          fontSize: 'var(--text-2xs)',
          color: 'var(--color-warning)',
          background: 'var(--color-warning-dim)',
          border: '1px solid var(--color-warning)',
          borderRadius: 'var(--radius-sm)',
          padding: '4px 8px',
        }}>
          Actual finish is before actual start
        </div>
      )}
    </div>
  )
}
