import { useMemo, useRef } from 'react'
import type { Baseline } from '../../types'
import { useDialogA11y } from '../../hooks/useDialogA11y'
import { compareBaselines } from '../../lib/baselines'
import { BaselineSelectPair } from '../baseline/BaselineSelectPair'
import { BaselineDiffTable } from '../baseline/BaselineDiffTable'

interface BaselineCompareModalProps {
  open: boolean
  baselines: Baseline[]
  baselineAId: string | null
  baselineBId: string | null
  onChangeBaselineA: (baselineId: string) => void
  onChangeBaselineB: (baselineId: string) => void
  onClose: () => void
}

export function BaselineCompareModal({
  open,
  baselines,
  baselineAId,
  baselineBId,
  onChangeBaselineA,
  onChangeBaselineB,
  onClose,
}: BaselineCompareModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  useDialogA11y({ containerRef: dialogRef, onClose, enabled: open })

  const baselineA = useMemo(
    () => baselines.find((baseline) => baseline.id === baselineAId) ?? null,
    [baselines, baselineAId],
  )
  const baselineB = useMemo(
    () => baselines.find((baseline) => baseline.id === baselineBId) ?? null,
    [baselines, baselineBId],
  )
  const diff = useMemo(
    () => (baselineA && baselineB ? compareBaselines(baselineA, baselineB) : null),
    [baselineA, baselineB],
  )

  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(10,18,30,0.54)',
        zIndex: 220,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Compare baselines"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        style={{
          width: 760,
          maxWidth: '95vw',
          maxHeight: '82vh',
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          borderTop: '3px solid var(--accent)',
          boxShadow: 'var(--shadow-xl)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'schedule-slide-in 0.16s ease-out both',
        }}
      >
        <div style={{ padding: '18px 20px 12px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-sm)' }}>Compare Baselines</div>
          <div style={{ marginTop: 2, fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
            Select two snapshots to review scope and schedule deltas.
          </div>
        </div>

        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--color-border-light)', background: 'var(--color-surface-2)' }}>
          <BaselineSelectPair
            baselines={baselines}
            baselineAId={baselineAId}
            baselineBId={baselineBId}
            onChangeBaselineA={onChangeBaselineA}
            onChangeBaselineB={onChangeBaselineB}
          />
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px' }}>
          {diff ? (
            <BaselineDiffTable diff={diff} />
          ) : (
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-dim)' }}>
              Select two baselines to compare.
            </div>
          )}
        </div>

        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-tertiary)' }}>
            {baselineA?.name ?? '—'} vs {baselineB?.name ?? '—'}
          </div>
          <button
            onClick={onClose}
            style={{
              height: 30,
              borderRadius: 'var(--radius)',
              border: '1px solid var(--color-border)',
              background: 'none',
              color: 'var(--color-text-secondary)',
              padding: '0 12px',
              fontSize: 'var(--text-xs)',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
