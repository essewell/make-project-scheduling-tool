import { useRef, useState } from 'react'
import { useDialogA11y } from '../../hooks/useDialogA11y'
import { X } from '../../lib/icons'

export interface CaptureBaselineValues {
  name: string
  reason: string
  author?: string
}

interface CaptureBaselineModalProps {
  open: boolean
  defaultName: string
  onConfirm: (values: CaptureBaselineValues) => void
  onClose: () => void
}

export function CaptureBaselineModal({
  open,
  defaultName,
  onConfirm,
  onClose,
}: CaptureBaselineModalProps) {
  const [name, setName] = useState(defaultName)
  const [reason, setReason] = useState('')
  const [author, setAuthor] = useState('')
  const panelRef = useRef<HTMLDivElement | null>(null)
  const closeBtnRef = useRef<HTMLButtonElement | null>(null)
  useDialogA11y({ containerRef: panelRef, initialFocusRef: closeBtnRef, onClose, enabled: open })

  if (!open) return null

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Capture baseline">
      <div
        ref={panelRef}
        className="modal-box"
        tabIndex={-1}
        style={{ width: 460, maxWidth: '96vw', padding: 'var(--space-4)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
          <div>
            <div style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)' }}>
              Capture Baseline
            </div>
            <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-tertiary)' }}>
              Save the current schedule snapshot with change context.
            </div>
          </div>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Close capture baseline modal"
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

        <div style={{ display: 'grid', gap: 10 }}>
          <label style={{ display: 'grid', gap: 4 }}>
            <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-secondary)' }}>Name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              style={{
                height: 30,
                borderRadius: 'var(--radius)',
                border: '1px solid var(--color-border)',
                padding: '0 8px',
                fontSize: 'var(--text-xs)',
                fontFamily: 'var(--font-sans)',
              }}
            />
          </label>

          <label style={{ display: 'grid', gap: 4 }}>
            <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-secondary)' }}>Reason</span>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              maxLength={120}
              rows={3}
              style={{
                borderRadius: 'var(--radius)',
                border: '1px solid var(--color-border)',
                padding: '8px',
                fontSize: 'var(--text-xs)',
                fontFamily: 'var(--font-sans)',
                resize: 'none',
              }}
            />
          </label>

          <label style={{ display: 'grid', gap: 4 }}>
            <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-secondary)' }}>Author (optional)</span>
            <input
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              style={{
                height: 30,
                borderRadius: 'var(--radius)',
                border: '1px solid var(--color-border)',
                padding: '0 8px',
                fontSize: 'var(--text-xs)',
                fontFamily: 'var(--font-sans)',
              }}
            />
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 'var(--space-4)' }}>
          <button
            onClick={onClose}
            style={{
              height: 30,
              borderRadius: 'var(--radius)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface-2)',
              color: 'var(--color-text-secondary)',
              padding: '0 10px',
              fontSize: 'var(--text-xs)',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm({ name: name.trim() || defaultName, reason: reason.trim(), author: author.trim() || undefined })}
            style={{
              height: 30,
              borderRadius: 'var(--radius)',
              border: '1px solid var(--accent)',
              background: 'var(--accent)',
              color: '#fff',
              padding: '0 10px',
              fontSize: 'var(--text-xs)',
              cursor: 'pointer',
            }}
          >
            Capture
          </button>
        </div>
      </div>
    </div>
  )
}
