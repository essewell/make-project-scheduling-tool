import { useId, useRef } from 'react'
import { useDialogA11y } from '../../hooks/useDialogA11y'

// ─── Props ────────────────────────────────────────────────────────────────────

interface SetupWizardProps {
  projectName: string
  onRenameProject: (name: string) => void
  onStartBlank: () => void
  onLoadExample: () => void
}

// ─── SetupWizard ──────────────────────────────────────────────────────────────

export function SetupWizard({ projectName, onRenameProject, onStartBlank, onLoadExample }: SetupWizardProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descId = useId()

  useDialogA11y({ containerRef: dialogRef, initialFocusRef: inputRef })

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'var(--brand)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 'var(--z-wizard)' as React.CSSProperties['zIndex'],
        color: 'white',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
        style={{
          background: 'white',
          color: 'var(--color-text-primary)',
          borderRadius: 'var(--radius-lg)',
          borderTop: '3px solid var(--accent)',
          padding: '40px',
          width: 420,
          textAlign: 'center',
          animation: 'schedule-wizard-in 0.3s ease-out both',
        }}
      >
        {/* MAKE wordmark */}
        <div style={{ fontWeight: 700, fontSize: 32, letterSpacing: '0.4em', color: 'var(--brand)', marginBottom: 8 }}>
          MAKE
        </div>
        <div id={titleId} style={{ fontSize: 19, fontWeight: 600, marginBottom: 8 }}>Project Schedule</div>
        <div id={descId} style={{ color: 'var(--color-text-secondary)', marginBottom: 24, fontSize: 13 }}>
          Track tasks, phases, and milestones
        </div>

        {/* Project name input */}
        <input
          ref={inputRef}
          type="text"
          placeholder="Project name"
          defaultValue={projectName}
          onChange={e => onRenameProject(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') onStartBlank() }}
          style={{
            width: '100%', height: 44,
            borderRadius: 'var(--radius-lg)',
            border: '1.5px solid var(--color-border)',
            padding: '0 16px',
            fontSize: 16, marginBottom: 16,
            fontFamily: 'var(--font-sans)',
            boxSizing: 'border-box',
          }}
          autoFocus
        />

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onStartBlank}
            style={{
              flex: 1, height: 44,
              borderRadius: 'var(--radius)',
              background: 'var(--brand)', color: 'white',
              fontWeight: 600, fontSize: 14, cursor: 'pointer',
              border: 'none',
            }}
          >
            Start blank
          </button>
          <button
            onClick={onLoadExample}
            style={{
              flex: 1, height: 44,
              borderRadius: 'var(--radius)',
              border: '1.5px solid var(--color-border)',
              fontWeight: 600, fontSize: 14, cursor: 'pointer',
              background: 'transparent',
            }}
          >
            Load example data
          </button>
        </div>
      </div>
    </div>
  )
}
