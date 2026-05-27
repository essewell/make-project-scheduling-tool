import { CalendarBlank } from '../../lib/icons'

interface CalendarToggleProps {
  enabled: boolean
  onToggle: () => void
}

export function CalendarToggle({ enabled, onToggle }: CalendarToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={enabled}
      aria-label="Toggle overlay bands"
      title="Toggle overlay bands"
      style={{
        height: 24,
        padding: '0 8px',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)',
        background: enabled ? 'var(--accent-dim)' : 'var(--color-surface)',
        color: enabled ? 'var(--accent)' : 'var(--color-text-secondary)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 'var(--text-2xs)',
        fontFamily: 'var(--font-mono)',
        cursor: 'pointer',
        pointerEvents: 'auto',
      }}
    >
      <CalendarBlank size={12} weight="regular" aria-hidden="true" />
      Overlay
    </button>
  )
}
