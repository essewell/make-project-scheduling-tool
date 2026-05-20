import { useEffect } from 'react'
import { TOAST_DURATION_MS } from '../../constants'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UndoEntry {
  id: string
  label: string
  restore: () => void
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface UndoToastProps {
  entry: UndoEntry
  onUndo: () => void
  onDismiss: () => void
}

// ─── UndoToast ────────────────────────────────────────────────────────────────

export function UndoToast({ entry, onUndo, onDismiss }: UndoToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, TOAST_DURATION_MS)
    return () => clearTimeout(timer)
  }, [entry.id, onDismiss])

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: 24,
        zIndex: 500,
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-xl)',
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px',
        fontSize: 'var(--text-xs)',
        animation: 'schedule-toast-in 0.22s cubic-bezier(0.22,1,0.36,1) both',
        minWidth: 240,
      }}
    >
      <span style={{ flex: 1, color: 'var(--color-text-primary)' }}>
        {entry.label}
      </span>
      <button
        onClick={onUndo}
        style={{
          height: 26, padding: '0 12px',
          borderRadius: 'var(--radius)',
          border: 'none',
          background: 'var(--accent)',
          color: '#fff',
          fontSize: 'var(--text-xs)',
          fontWeight: 'var(--weight-semibold)',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        Undo
      </button>
      <button
        onClick={onDismiss}
        style={{
          width: 24, height: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--color-text-dim)', fontSize: 16,
        }}
      >×</button>
    </div>
  )
}
