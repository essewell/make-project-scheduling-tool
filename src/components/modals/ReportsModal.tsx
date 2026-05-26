import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useDialogA11y } from '../../hooks/useDialogA11y'
import { X } from '../../lib/icons'
import { ReportTypeList, type ReportType } from '../reports/ReportTypeList'

interface ReportsModalProps {
  open: boolean
  hasTasks: boolean
  selectedType: ReportType
  onSelectType: (type: ReportType) => void
  preview: ReactNode
  onClose: () => void
}

export function ReportsModal({
  open,
  hasTasks,
  selectedType,
  onSelectType,
  preview,
  onClose,
}: ReportsModalProps) {
  const panelRef = useRef<HTMLDivElement | null>(null)
  const closeBtnRef = useRef<HTMLButtonElement | null>(null)
  const [showLoadingBar, setShowLoadingBar] = useState(false)
  useDialogA11y({ containerRef: panelRef, initialFocusRef: closeBtnRef, onClose })

  useEffect(() => {
    if (!open || !hasTasks) {
      setShowLoadingBar(false)
      return
    }
    const timer = window.setTimeout(() => setShowLoadingBar(true), 100)
    const raf = window.requestAnimationFrame(() => {
      window.clearTimeout(timer)
      setShowLoadingBar(false)
    })
    return () => {
      window.clearTimeout(timer)
      window.cancelAnimationFrame(raf)
      setShowLoadingBar(false)
    }
  }, [selectedType, open, hasTasks])

  if (!open) return null

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Reports modal">
      <div
        ref={panelRef}
        className="modal-box"
        tabIndex={-1}
        style={{ width: 1060, maxWidth: '96vw', padding: 'var(--space-4)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
          <div style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)' }}>
            Reports
          </div>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Close reports modal"
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

        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 'var(--space-3)', minHeight: 420 }}>
          <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', padding: 'var(--space-3)' }}>
            <ReportTypeList selectedType={selectedType} onSelect={onSelectType} />
          </div>
          <div
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              background: 'var(--color-surface)',
              padding: 'var(--space-3)',
              overflow: 'auto',
            }}
          >
            {showLoadingBar && <div className="computing-bar" aria-hidden="true" style={{ position: 'relative', marginBottom: 8 }} />}
            {!hasTasks ? (
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                Load a schedule to generate reports.
              </div>
            ) : (
              preview
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
