import type { Delay } from '../../types'
import { computeVarianceByDelayCause } from '../../lib/variance'

interface DelayCauseAttributionProps {
  delays: Delay[]
}

export function DelayCauseAttribution({ delays }: DelayCauseAttributionProps) {
  if (delays.length === 0) return null
  const items = computeVarianceByDelayCause(delays)
  if (items.length === 0) return null

  return (
    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-primary)' }}>
      {items.map((item) => `${item.type.replace(/_/g, ' ')}: ${item.totalDays}d`).join(' · ')}
    </div>
  )
}
