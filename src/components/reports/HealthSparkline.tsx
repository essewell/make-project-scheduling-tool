interface HealthSparklineProps {
  values: number[]
}

export function HealthSparkline({ values }: HealthSparklineProps) {
  if (values.length < 2) {
    return (
      <svg width="60" height="24" viewBox="0 0 60 24" role="img" aria-label="Health trend sparkline unavailable">
        <line x1="0" y1="12" x2="60" y2="12" stroke="var(--color-border)" />
      </svg>
    )
  }

  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = Math.max(1, max - min)
  const usableW = 56
  const usableH = 18
  const points = values.map((value, index) => {
    const x = 2 + (index / Math.max(1, values.length - 1)) * usableW
    const y = 21 - ((value - min) / span) * usableH
    return `${x},${y}`
  })

  return (
    <svg width="60" height="24" viewBox="0 0 60 24" role="img" aria-label="Health score trend sparkline">
      <polyline fill="none" stroke="var(--health-sparkline)" strokeWidth="1.5" points={points.join(' ')} />
    </svg>
  )
}
