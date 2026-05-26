import { useMemo, useState } from 'react'
import type { SCurveSeries } from '../../../types'

interface SCurveChartProps {
  series: SCurveSeries
  size?: 'full' | 'thumbnail'
  statusDate?: string
}

const FULL = { width: 720, height: 260, padX: 36, padY: 20 }
const THUMB = { width: 320, height: 120, padX: 16, padY: 12 }

function clamp(n: number, min: number, max: number): number {
  if (n < min) return min
  if (n > max) return max
  return n
}

export function SCurveChart({ series, size = 'full', statusDate }: SCurveChartProps) {
  const [hoverDate, setHoverDate] = useState<string | null>(null)
  const metrics = size === 'thumbnail' ? THUMB : FULL
  const { points } = series

  const hoverPoint = hoverDate ? points.find((point) => point.date === hoverDate) ?? null : null

  const chart = useMemo(() => {
    if (points.length < 2) return null
    const minX = points[0]!.date
    const maxX = points[points.length - 1]!.date
    const xSpan = Math.max(1, new Date(`${maxX}T00:00:00`).getTime() - new Date(`${minX}T00:00:00`).getTime())
    const usableWidth = metrics.width - metrics.padX * 2
    const usableHeight = metrics.height - metrics.padY * 2

    const toX = (date: string): number => {
      const value = new Date(`${date}T00:00:00`).getTime() - new Date(`${minX}T00:00:00`).getTime()
      return metrics.padX + (value / xSpan) * usableWidth
    }
    const toY = (pct: number): number => {
      const bounded = clamp(pct, 0, 100)
      return metrics.height - metrics.padY - (bounded / 100) * usableHeight
    }

    const plannedPath = points.map((point) => `${toX(point.date)},${toY(point.plannedPct)}`).join(' ')
    const actualPath = points.map((point) => `${toX(point.date)},${toY(point.actualPct)}`).join(' ')

    const todayX = statusDate ? toX(clampDate(statusDate, minX, maxX)) : null
    return { toX, toY, plannedPath, actualPath, todayX }
  }, [points, metrics.width, metrics.height, metrics.padX, metrics.padY, statusDate])

  if (!chart) {
    return (
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
        Need at least two points to render S-curve.
      </div>
    )
  }

  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${metrics.width} ${metrics.height}`} role="img" aria-label="S-curve chart">
        <line
          x1={metrics.padX}
          y1={metrics.height - metrics.padY}
          x2={metrics.width - metrics.padX}
          y2={metrics.height - metrics.padY}
          stroke="var(--color-border)"
          strokeWidth="1"
        />
        <line
          x1={metrics.padX}
          y1={metrics.padY}
          x2={metrics.padX}
          y2={metrics.height - metrics.padY}
          stroke="var(--color-border)"
          strokeWidth="1"
        />
        {chart.todayX !== null && (
          <line
            x1={chart.todayX}
            y1={metrics.padY}
            x2={chart.todayX}
            y2={metrics.height - metrics.padY}
            stroke="var(--color-today)"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
        )}
        <polyline fill="none" stroke="var(--scurve-planned)" strokeWidth="2" points={chart.plannedPath} />
        <polyline fill="none" stroke="var(--scurve-actual)" strokeWidth="2" points={chart.actualPath} />
        {size === 'full' &&
          points.map((point) => (
            <circle
              key={point.date}
              cx={chart.toX(point.date)}
              cy={chart.toY(point.actualPct)}
              r={2.5}
              fill={hoverDate === point.date ? 'var(--accent)' : 'var(--scurve-actual)'}
              onMouseEnter={() => setHoverDate(point.date)}
              onMouseLeave={() => setHoverDate(null)}
            />
          ))}
      </svg>
      {size === 'full' && hoverPoint && (
        <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-secondary)', marginTop: 4 }}>
          {hoverPoint.date} · planned {hoverPoint.plannedPct.toFixed(1)}% · actual {hoverPoint.actualPct.toFixed(1)}%
        </div>
      )}
    </div>
  )
}

function clampDate(value: string, min: string, max: string): string {
  if (value < min) return min
  if (value > max) return max
  return value
}
