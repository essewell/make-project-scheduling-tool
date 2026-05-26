import { useMemo } from 'react'
import type { EVMResult } from '../../../types'

interface EVMChartProps {
  evm: EVMResult
}

export function EVMChart({ evm }: EVMChartProps) {
  const metrics = { width: 720, height: 220, padX: 36, padY: 20 }
  const maxY = Math.max(1, evm.pv, evm.ev)

  const chart = useMemo(() => {
    const toY = (value: number): number => {
      const usable = metrics.height - metrics.padY * 2
      return metrics.height - metrics.padY - (value / maxY) * usable
    }
    const pvY = toY(evm.pv)
    const evY = toY(evm.ev)
    return { pvY, evY }
  }, [evm.pv, evm.ev, maxY, metrics.height, metrics.padY])

  return (
    <svg width="100%" viewBox={`0 0 ${metrics.width} ${metrics.height}`} role="img" aria-label="EVM chart">
      <line
        x1={metrics.padX}
        y1={metrics.height - metrics.padY}
        x2={metrics.width - metrics.padX}
        y2={metrics.height - metrics.padY}
        stroke="var(--color-border)"
      />
      <line x1={metrics.padX} y1={metrics.padY} x2={metrics.padX} y2={metrics.height - metrics.padY} stroke="var(--color-border)" />
      <line
        x1={metrics.padX}
        y1={chart.pvY}
        x2={metrics.width - metrics.padX}
        y2={chart.pvY}
        stroke="var(--evm-line-pv)"
        strokeWidth="2"
      />
      <line
        x1={metrics.padX}
        y1={chart.evY}
        x2={metrics.width - metrics.padX}
        y2={chart.evY}
        stroke="var(--evm-line-ev)"
        strokeWidth="2"
      />
    </svg>
  )
}
