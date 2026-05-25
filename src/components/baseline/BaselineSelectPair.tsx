import type { Baseline } from '../../types'

interface BaselineSelectPairProps {
  baselines: Baseline[]
  baselineAId: string | null
  baselineBId: string | null
  onChangeBaselineA: (baselineId: string) => void
  onChangeBaselineB: (baselineId: string) => void
}

export function BaselineSelectPair({
  baselines,
  baselineAId,
  baselineBId,
  onChangeBaselineA,
  onChangeBaselineB,
}: BaselineSelectPairProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      <div>
        <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>Baseline A</div>
        <select
          value={baselineAId ?? ''}
          onChange={(event) => onChangeBaselineA(event.target.value)}
          style={{
            width: '100%',
            height: 30,
            borderRadius: 'var(--radius)',
            border: '1px solid var(--color-border)',
            padding: '0 8px',
            fontSize: 'var(--text-xs)',
            background: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
          }}
        >
          {baselines.map((baseline) => (
            <option key={baseline.id} value={baseline.id}>
              {baseline.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>Baseline B</div>
        <select
          value={baselineBId ?? ''}
          onChange={(event) => onChangeBaselineB(event.target.value)}
          style={{
            width: '100%',
            height: 30,
            borderRadius: 'var(--radius)',
            border: '1px solid var(--color-border)',
            padding: '0 8px',
            fontSize: 'var(--text-xs)',
            background: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
          }}
        >
          {baselines.map((baseline) => (
            <option key={baseline.id} value={baseline.id}>
              {baseline.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
