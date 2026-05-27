import { memo } from 'react'
import type { Delay } from '../../types'

interface DelayMarkersProps {
  delays: Delay[]
  onOpenDelay: (delayId: string) => void
}

export const DelayMarkers = memo(function DelayMarkers({ delays, onOpenDelay }: DelayMarkersProps) {
  if (delays.length === 0) return null

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', alignItems: 'stretch' }}>
      {delays.map((delay) => {
        const delayTypeLabel = delay.type.replace(/_/g, ' ')
        return (
        <button
          key={delay.id}
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onOpenDelay(delay.id)
          }}
          title={`Delay: ${delayTypeLabel}`}
          aria-label={`Open delay log entry for ${delayTypeLabel}`}
          style={{
            pointerEvents: 'auto',
            border: 'none',
            borderRadius: 0,
            width: 5,
            padding: 0,
            margin: 0,
            cursor: 'pointer',
            background: delay.excusable
              ? 'var(--delay-marker-excusable)'
              : 'var(--delay-marker-non-excusable)',
          }}
        />
      )})}
    </div>
  )
})
