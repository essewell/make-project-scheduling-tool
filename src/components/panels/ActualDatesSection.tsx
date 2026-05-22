import type { Task } from '../../types'

interface ActualDatesSectionProps {
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
}

export function ActualDatesSection({ actualStart, actualFinish, onChange }: ActualDatesSectionProps) {
  const showWarning = !!(actualFinish && actualStart && actualFinish < actualStart)

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
      <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Actual Dates
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-tertiary)' }}>
            Actual Start
          </label>
          <input
            type="date"
            value={actualStart ?? ''}
            aria-label="Actual start date"
            onChange={e => onChange({ actualStart: e.target.value || null })}
            style={INPUT}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-tertiary)' }}>
            Actual Finish
          </label>
          <input
            type="date"
            value={actualFinish ?? ''}
            aria-label="Actual finish date"
            onChange={e => handleFinishChange(e.target.value)}
            style={INPUT}
          />
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
