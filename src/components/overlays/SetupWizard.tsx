import { useId, useRef } from 'react'
import { useDialogA11y } from '../../hooks/useDialogA11y'

// ─── Props ────────────────────────────────────────────────────────────────────

interface SetupWizardProps {
  projectName: string
  onRenameProject: (name: string) => void
  onStartBlank: () => void
  onLoadExample: () => void
}

const WORDMARK_K: React.CSSProperties = {
  display: 'inline-block',
  transform: 'translateY(0.03em)',
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
        background: 'var(--color-bg)',
        display: 'flex', alignItems: 'stretch', justifyContent: 'stretch',
        zIndex: 'var(--z-wizard)' as React.CSSProperties['zIndex'],
        color: 'var(--color-text-primary)',
        fontFamily: 'var(--font-sans)',
        overflow: 'hidden',
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
        style={{ width: '100%', height: '100%' }}
      >
        <div
          className="wizard-split"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 7fr) minmax(0, 5fr)',
            height: '100%',
            minHeight: '100dvh',
          }}
        >
          <div
            style={{
              position: 'relative',
              padding: 'clamp(32px, 6vw, 72px) clamp(24px, 6vw, 80px)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: 'var(--color-bg)',
              borderRight: '1px solid var(--rule)',
            }}
          >
            <img
              src="/wizard-bg.svg"
              alt=""
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: 24,
                right: 24,
                width: 'min(36vw, 420px)',
                opacity: 0.12,
                pointerEvents: 'none',
              }}
            />

            <div className="wizard-rise" data-delay="0" style={{ position: 'relative' }}>
              <div
                style={{
                  fontSize: 'var(--text-2xs)',
                  fontWeight: 'var(--weight-semibold)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: 'var(--color-text-tertiary)',
                  marginBottom: 18,
                }}
              >
                Construction Scheduling Instrument
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 14 }}>
                <div style={{ fontWeight: 700, fontSize: 'clamp(28px, 4.5vw, 48px)', letterSpacing: '0.32em', color: 'var(--brand)' }}>
                  MA<span style={WORDMARK_K}>K</span>E
                </div>
                <div style={{ width: 64, borderTop: '1px solid var(--rule-strong)' }} />
              </div>
              <div id={titleId} style={{ fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 700, lineHeight: 1.02, color: 'var(--ink-strong)', letterSpacing: '-0.02em', maxWidth: '18ch' }}>
                Project schedules that hold up under scrutiny.
              </div>
              <div id={descId} style={{ marginTop: 18, maxWidth: '62ch', fontSize: 'var(--text-md)', lineHeight: 1.55, color: 'var(--ink-secondary)' }}>
                Build and maintain task dependencies, milestones, and phase sequencing with output that reads like an engineering deliverable.
              </div>
            </div>

            <div className="wizard-rise" data-delay="4" style={{ fontSize: 'var(--text-2xs)', color: 'var(--ink-tertiary)', letterSpacing: '0.04em' }}>
              Local-first. Auto-saved. Optimized for weekly owner reviews.
            </div>
          </div>

          <div
            style={{
              background: 'var(--brand)',
              color: 'var(--brand-on-brand)',
              padding: 'clamp(28px, 4vw, 48px)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 18,
              position: 'relative',
            }}
          >
            <div className="wizard-rise" data-delay="1" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 'var(--text-2xs)', fontWeight: 'var(--weight-semibold)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--brand-on-brand-dim)' }}>
                Initialize Project
              </div>
              <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', color: 'var(--brand-on-brand)' }}>
                Project Setup
              </div>
            </div>

            <div className="wizard-rise" data-delay="2" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--brand-tint-2)', background: 'var(--brand-tint-1)', padding: 14 }}>
              <img
                src="/setup-wizard.svg"
                alt="Construction schedule visual reference"
                style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 'var(--radius)' }}
              />
            </div>

            <div className="wizard-rise" data-delay="3" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input
                ref={inputRef}
                type="text"
                placeholder="Project name"
                defaultValue={projectName}
                onChange={e => onRenameProject(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') onStartBlank() }}
                style={{
                  width: '100%', height: 44,
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--brand-tint-2)',
                  padding: '0 12px',
                  fontSize: 15,
                  background: 'var(--surface-overlay)',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-sans)',
                  boxSizing: 'border-box',
                }}
                autoFocus
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button
                  onClick={onStartBlank}
                  style={{
                    height: 42,
                    borderRadius: 'var(--radius)',
                    background: 'var(--accent-on-brand)',
                    color: 'var(--brand)',
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: 'pointer',
                    border: 'none',
                  }}
                >
                  Start blank
                </button>
                <button
                  onClick={onLoadExample}
                  style={{
                    height: 42,
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--brand-tint-2)',
                    color: 'var(--brand-on-brand)',
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: 'pointer',
                    background: 'transparent',
                  }}
                >
                  Load example data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
