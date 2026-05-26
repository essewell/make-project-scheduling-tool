import { useEffect, useMemo, useRef, useState } from 'react'
import type { Baseline, BaselineDiff, ChangeOrder } from '../../types'
import { useDialogA11y } from '../../hooks/useDialogA11y'
import { compareBaselines } from '../../lib/baselines'
import { BaselineSelectPair } from '../baseline/BaselineSelectPair'
import { BaselineDiffTable } from '../baseline/BaselineDiffTable'

interface BaselineCompareModalProps {
  open: boolean
  baselines: Baseline[]
  baselineAId: string | null
  baselineBId: string | null
  changeOrders?: ChangeOrder[]
  onChangeBaselineA: (baselineId: string) => void
  onChangeBaselineB: (baselineId: string) => void
  onClose: () => void
}

export function BaselineCompareModal({
  open,
  baselines,
  baselineAId,
  baselineBId,
  changeOrders = [],
  onChangeBaselineA,
  onChangeBaselineB,
  onClose,
}: BaselineCompareModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const [diff, setDiff] = useState<BaselineDiff | null>(null)
  const [loading, setLoading] = useState(false)
  useDialogA11y({ containerRef: dialogRef, onClose, enabled: open })

  const baselineA = useMemo(
    () => baselines.find((baseline) => baseline.id === baselineAId) ?? null,
    [baselines, baselineAId],
  )
  const baselineB = useMemo(
    () => baselines.find((baseline) => baseline.id === baselineBId) ?? null,
    [baselines, baselineBId],
  )

  useEffect(() => {
    if (!open || !baselineA || !baselineB) {
      setDiff(null)
      setLoading(false)
      return
    }

    setDiff(null)
    let canceled = false
    const loadingTimer = window.setTimeout(() => {
      if (!canceled) setLoading(true)
    }, 100)

    const compareTimer = window.setTimeout(() => {
      const nextDiff = compareBaselines(baselineA, baselineB)
      if (canceled) return
      setDiff(nextDiff)
      setLoading(false)
      window.clearTimeout(loadingTimer)
    }, 0)

    return () => {
      canceled = true
      setLoading(false)
      window.clearTimeout(loadingTimer)
      window.clearTimeout(compareTimer)
    }
  }, [open, baselineA, baselineB])

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
        {loading ? (
          <div style={{ height: 2, background: 'linear-gradient(90deg, transparent 0%, var(--accent) 35%, transparent 100%)', width: '100%', animation: 'schedule-gantt-pulse 1.1s ease-in-out infinite' }} />
        ) : (
          <div style={{ height: 2, background: 'transparent', width: '100%' }} />
        )}

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
          {baselines.length < 2 ? (
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-dim)' }}>
              Capture at least two baselines to compare.
            </div>
          ) : diff ? (
            <BaselineDiffTable diff={diff} changeOrders={changeOrders} />
          ) : (
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-dim)' }}>
              Select two baselines to compare.
            </div>
          )}
        </div>

        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          {diff ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 'var(--text-2xs)', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
              <span>Slip +{diff.totals.totalSlipDays}d</span>
              <span>Net Tasks {diff.totals.netTaskCountChange >= 0 ? '+' : ''}{diff.totals.netTaskCountChange}</span>
              <span>Cost {diff.totals.totalCostDelta >= 0 ? '+' : ''}${diff.totals.totalCostDelta.toLocaleString()}</span>
            </div>
          ) : (
            <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-tertiary)' }}>
              {baselineA?.name ?? '—'} vs {baselineB?.name ?? '—'}
            </div>
          )}
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
