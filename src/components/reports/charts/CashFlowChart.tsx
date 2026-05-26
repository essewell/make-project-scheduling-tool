import { useMemo, useState } from 'react'
import type { MonthlyCashFlowBucket } from '../../../types'

interface CashFlowChartProps {
  buckets: MonthlyCashFlowBucket[]
}

export function CashFlowChart({ buckets }: CashFlowChartProps) {
  const [hoverMonth, setHoverMonth] = useState<string | null>(null)
  const metrics = { width: 720, height: 260, padX: 36, padY: 20 }
  const maxTotal = Math.max(1, ...buckets.map((bucket) => bucket.total))
  const barWidth = Math.max(6, (metrics.width - metrics.padX * 2) / Math.max(1, buckets.length) - 4)

  const chart = useMemo(() => {
    return buckets.map((bucket, index) => {
      const x = metrics.padX + index * (barWidth + 4)
      const toHeight = (value: number): number => ((metrics.height - metrics.padY * 2) * value) / maxTotal
      const laborH = toHeight(bucket.labor)
      const equipH = toHeight(bucket.equipment)
      const materialH = toHeight(bucket.material)
      const baseY = metrics.height - metrics.padY
      return { x, baseY, laborH, equipH, materialH }
    })
  }, [buckets, barWidth, maxTotal, metrics.height, metrics.padX, metrics.padY])

  const hovered = hoverMonth ? buckets.find((bucket) => bucket.month === hoverMonth) ?? null : null

  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${metrics.width} ${metrics.height}`} role="img" aria-label="Cash flow chart">
        <line
          x1={metrics.padX}
          y1={metrics.height - metrics.padY}
          x2={metrics.width - metrics.padX}
          y2={metrics.height - metrics.padY}
          stroke="var(--color-border)"
        />
        {buckets.map((bucket, index) => {
          const c = chart[index]!
          const materialY = c.baseY - c.materialH
          const equipY = materialY - c.equipH
          const laborY = equipY - c.laborH
          return (
            <g key={bucket.month} onMouseEnter={() => setHoverMonth(bucket.month)} onMouseLeave={() => setHoverMonth(null)}>
              <rect x={c.x} y={materialY} width={barWidth} height={c.materialH} fill="var(--cashflow-material)" />
              <rect x={c.x} y={equipY} width={barWidth} height={c.equipH} fill="var(--cashflow-equipment)" />
              <rect x={c.x} y={laborY} width={barWidth} height={c.laborH} fill="var(--cashflow-labor)" />
            </g>
          )
        })}
      </svg>
      {hovered && (
        <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-secondary)', marginTop: 4 }}>
          {hovered.month} · labor {money(hovered.labor)} · equipment {money(hovered.equipment)} · material {money(hovered.material)} · total {money(hovered.total)}
        </div>
      )}
    </div>
  )
}

function money(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}
