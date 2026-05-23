import { useRef } from 'react'
import type { DcmaAssessmentResult } from '../../types'
import type { FloatBucketCount } from '../../lib/floatDistribution'
import type { ScheduleHealthResult } from '../../lib/health'
import { useDialogA11y } from '../../hooks/useDialogA11y'
import { DcmaFindingsTable } from '../quality/DcmaFindingsTable'
import { FloatDistributionChart } from '../quality/FloatDistributionChart'
import { HealthScoreBreakdown } from '../quality/HealthScoreBreakdown'
import { X } from '../../lib/icons'

interface QualityPanelProps {
  open: boolean
  taskCount: number
  hasResources: boolean
  isComputing: boolean
  assessment: DcmaAssessmentResult
  health: ScheduleHealthResult
  floatDistribution: FloatBucketCount[]
  onCaptureBaseline: () => void
  onClose: () => void
}

export function QualityPanel({
  open,
  taskCount,
  hasResources,
  isComputing,
  assessment,
  health,
  floatDistribution,
  onCaptureBaseline,
  onClose,
}: QualityPanelProps) {
  const panelRef = useRef<HTMLDivElement | null>(null)
  const closeBtnRef = useRef<HTMLButtonElement | null>(null)
  useDialogA11y({ containerRef: panelRef, initialFocusRef: closeBtnRef, onClose })

  if (!open) return null

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Schedule quality panel">
      <div
        ref={panelRef}
        className="modal-box"
        tabIndex={-1}
        style={{ width: 980, maxWidth: '96vw', padding: 'var(--space-4)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
          <div>
            <div style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)' }}>
              Schedule Quality Report
            </div>
            <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-tertiary)' }}>
              DCMA checks, health composition, and float distribution
            </div>
          </div>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Close quality panel"
            style={{
              width: 28,
              height: 28,
              borderRadius: 'var(--radius)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={14} weight="bold" aria-hidden="true" />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 12 }}>
          {isComputing && <div className="computing-bar" aria-hidden="true" style={{ position: 'relative', gridColumn: '1 / -1' }} />}
          {taskCount === 0 ? (
            <div
              style={{
                gridColumn: '1 / -1',
                border: '1px dashed var(--color-border)',
                borderRadius: 'var(--radius)',
                padding: 'var(--space-6)',
                textAlign: 'center',
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--text-sm)',
              }}
            >
              Add tasks before running quality assessment.
            </div>
          ) : (
            <>
              <DcmaFindingsTable checks={assessment.checks} hasResources={hasResources} onCaptureBaseline={onCaptureBaseline} />
              <div style={{ display: 'grid', gap: 12, alignContent: 'start' }}>
                <HealthScoreBreakdown health={health} />
                <FloatDistributionChart buckets={floatDistribution} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
