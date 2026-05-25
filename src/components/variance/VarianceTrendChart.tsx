import { useMemo, useState } from 'react'
import type { VarianceSnapshot } from '../../types'

interface VarianceTrendChartProps {
  snapshots: VarianceSnapshot[]
  activeBaselineId: string | null
}

interface Point {
  date: string
  variance: number
}

const CHART_HEIGHT = 140
const CHART_WIDTH = 360
const PAD_X = 28
const PAD_Y = 14

function toDate(date: string): number {
  return new Date(`${date}T00:00:00`).getTime()
}

export function VarianceTrendChart({ snapshots, activeBaselineId }: VarianceTrendChartProps) {
  const [hoveredDate, setHoveredDate] = useState<string | null>(null)

  const points = useMemo<Point[]>(() => {
    if (!activeBaselineId) return []
    const filtered = snapshots
      .filter((snapshot) => snapshot.activeBaselineId === activeBaselineId)
      .sort((left, right) => left.date.localeCompare(right.date))
    if (filtered.length === 0) return []
    if (filtered.length < 90) {
      return filtered.map((snapshot) => ({ date: snapshot.date, variance: snapshot.projectFinishVariance }))
    }
    return filtered.slice(filtered.length - 90).map((snapshot) => ({
      date: snapshot.date,
      variance: snapshot.projectFinishVariance,
    }))
  }, [snapshots, activeBaselineId])

  const hovered = hoveredDate ? points.find((point) => point.date === hoveredDate) ?? null : null

  const trendDegrading = useMemo(() => {
    if (points.length < 8) return false
    const recent = points.slice(points.length - 8)
    const first = recent[0]?.variance ?? 0
    const last = recent[recent.length - 1]?.variance ?? 0
    return last - first > 0
  }, [points])

  if (points.length < 2) {
    return (
      <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', padding: 10 }}>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-dim)' }}>
          Capture baseline and wait for trend to build.
        </div>
      </div>
    )
  }

  const minX = toDate(points[0]!.date)
  const maxX = toDate(points[points.length - 1]!.date)
  const minY = Math.min(...points.map((point) => point.variance), 0)
  const maxY = Math.max(...points.map((point) => point.variance), 0)
  const ySpan = Math.max(1, maxY - minY)
  const xSpan = Math.max(1, maxX - minX)

  const toSvgX = (date: string): number => {
    const ratio = (toDate(date) - minX) / xSpan
    return PAD_X + ratio * (CHART_WIDTH - PAD_X * 2)
  }
  const toSvgY = (variance: number): number => {
    const ratio = (variance - minY) / ySpan
    return CHART_HEIGHT - PAD_Y - ratio * (CHART_HEIGHT - PAD_Y * 2)
  }

  const polyline = points.map((point) => `${toSvgX(point.date)},${toSvgY(point.variance)}`).join(' ')
  const zeroY = toSvgY(0)
  const lineColor = trendDegrading ? 'var(--health-amber)' : 'var(--health-green)'

  return (
    <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', padding: 10 }}>
      <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
        Variance Trend
      </div>
      <svg width="100%" viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} role="img" aria-label="Variance trend chart">
        <line
          x1={PAD_X}
          y1={zeroY}
          x2={CHART_WIDTH - PAD_X}
          y2={zeroY}
          stroke="var(--color-border)"
          strokeWidth="1"
        />
        <polyline fill="none" stroke={lineColor} strokeWidth="2" points={polyline} />
        {points.map((point) => {
          const x = toSvgX(point.date)
          const y = toSvgY(point.variance)
          return (
            <circle
              key={point.date}
              cx={x}
              cy={y}
              r={3}
              fill={hoveredDate === point.date ? 'var(--accent)' : lineColor}
              onMouseEnter={() => setHoveredDate(point.date)}
              onMouseLeave={() => setHoveredDate(null)}
            />
          )
        })}
      </svg>
      {hovered && (
        <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-secondary)', marginTop: 4 }}>
          {hovered.date} · variance {hovered.variance >= 0 ? '+' : ''}{hovered.variance}d
        </div>
      )}
    </div>
  )
}
