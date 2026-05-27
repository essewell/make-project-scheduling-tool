import type { Delay } from '../../types'

interface SidePanelDelaysSectionProps {
  taskId: string
  delays: Delay[]
  onAddDelay: (taskId: string) => void
}

export function SidePanelDelaysSection({ taskId, delays, onAddDelay }: SidePanelDelaysSectionProps) {
  const taskDelays = delays
    .filter((delay) => delay.affectedTaskIds.includes(taskId))
    .sort((left, right) => right.recordedAt.localeCompare(left.recordedAt))

  return (
    <div>
      <div style={{ width: 32, height: 1, background: 'var(--rule-soft)', marginBottom: 8 }} aria-hidden="true" />
      <div style={{ fontSize: 'var(--text-2xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
        Delays
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
          {taskDelays.length === 0 ? 'No delays recorded for this task.' : `${taskDelays.length} delay entr${taskDelays.length === 1 ? 'y' : 'ies'}`}
        </div>
        <button
          onClick={() => onAddDelay(taskId)}
          style={{
            height: 24,
            padding: '0 8px',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--color-border)',
            background: 'none',
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--text-2xs)',
            cursor: 'pointer',
          }}
        >
          + Add delay…
        </button>
      </div>

      {taskDelays.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {taskDelays.map((delay) => (
            <div key={delay.id} style={{ padding: '6px 8px', border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-sm)', background: 'var(--color-surface-2)' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-primary)' }}>
                {delay.type.replace(/_/g, ' ')} · {delay.daysImpact}d ({delay.excusable ? 'excusable' : 'non-excusable'})
              </div>
              <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-dim)', marginTop: 2 }}>
                {delay.start} → {delay.end}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
