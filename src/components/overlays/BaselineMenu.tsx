import { useEffect, useRef, type RefObject } from 'react'
import type { Baseline, GhostStyle } from '../../types'
import { GitDiff, Lock } from '../../lib/icons'

// ─── Props ────────────────────────────────────────────────────────────────────

interface BaselineMenuProps {
  baselines: Baseline[]
  activeBaselineId: string | null
  ghostStyle: GhostStyle
  anchorRef: RefObject<HTMLButtonElement | null>
  onSetActive: (id: string | null) => void
  onDelete: (id: string) => void
  onCompare: (id?: string) => void
  onSetGhostStyle: (style: GhostStyle) => void
  onClose: () => void
}

// ─── Ghost style options ──────────────────────────────────────────────────────

const GHOST_OPTIONS: Array<{ value: GhostStyle; label: string; desc: string }> = [
  { value: 'stripe', label: 'Stripe', desc: 'Hatched pattern' },
  { value: 'solid',  label: 'Solid',  desc: 'Filled color' },
  { value: 'outline', label: 'Outline', desc: 'Border only' },
]

// ─── BaselineMenu ─────────────────────────────────────────────────────────────

export function BaselineMenu({
  baselines, activeBaselineId, ghostStyle,
  anchorRef, onSetActive, onDelete, onCompare, onSetGhostStyle, onClose,
}: BaselineMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        anchorRef.current && !anchorRef.current.contains(e.target as Node)
      ) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [anchorRef, onClose])

  // Position below the anchor button
  const anchorRect = anchorRef.current?.getBoundingClientRect()
  const top = anchorRect ? anchorRect.bottom + 6 : 60
  const left = anchorRect ? anchorRect.left : 100

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        top, left,
        width: 280, maxHeight: 380,
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-xl)',
        border: '1px solid var(--color-border)',
        zIndex: 300,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        animation: 'schedule-slide-in 0.14s ease-out both',
      }}
    >
      {/* Header */}
      <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-xs)' }}>Baselines</div>
        <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-tertiary)', marginTop: 1 }}>
          {baselines.length} snapshot{baselines.length !== 1 ? 's' : ''}
        </div>
        <button
          onClick={() => onCompare()}
          style={{
            marginTop: 8,
            height: 24,
            width: '100%',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface-2)',
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--text-2xs)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <GitDiff size={12} weight="regular" aria-hidden="true" />
          Compare baselines…
        </button>
      </div>

      {/* Baseline list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
        {baselines.length === 0 && (
          <div style={{ padding: '10px 14px', fontSize: 'var(--text-xs)', color: 'var(--color-text-dim)' }}>
            No baselines yet. Use ⊕ in the toolbar to capture one.
          </div>
        )}

        {/* "None" option */}
        {baselines.length > 0 && (
          <div
            onClick={() => onSetActive(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '5px 14px',
              cursor: 'pointer',
              fontSize: 'var(--text-xs)',
              color: activeBaselineId === null ? 'var(--accent)' : 'var(--color-text-secondary)',
              background: activeBaselineId === null ? 'var(--color-selected-bg)' : 'transparent',
            }}
          >
            <span style={{ width: 14, textAlign: 'center' }}>{activeBaselineId === null ? '●' : '○'}</span>
            <span>None (hide ghosts)</span>
          </div>
        )}

        {baselines.map(b => (
          <div
            key={b.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '18px 1fr',
              alignItems: 'start',
              gap: 8,
              padding: '7px 14px',
              background: b.id === activeBaselineId ? 'var(--color-selected-bg)' : 'transparent',
              transition: 'background 0.1s',
            }}
          >
            <span style={{ width: 14, textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--accent)' }}>
              {b.id === activeBaselineId ? '●' : '○'}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {b.name}
                </span>
                <Lock size={12} weight="fill" color="var(--color-text-tertiary)" aria-hidden="true" />
              </div>
              <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-dim)' }}>
                {b.date} · {b.tasks.length} task{b.tasks.length !== 1 ? 's' : ''}
              </div>
              <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-dim)' }}>
                Reason: {b.reason || '—'}
              </div>
              <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-dim)' }}>
                Author: {b.author || '—'}
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 5 }}>
                <button
                  onClick={() => onSetActive(b.id)}
                  style={{
                    height: 22,
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    background: b.id === activeBaselineId ? 'var(--accent)' : 'var(--color-surface-2)',
                    color: b.id === activeBaselineId ? '#fff' : 'var(--color-text-secondary)',
                    fontSize: '10px',
                    padding: '0 6px',
                    cursor: 'pointer',
                  }}
                >
                  Set Active
                </button>
                <button
                  onClick={() => onCompare(b.id)}
                  style={{
                    height: 22,
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface-2)',
                    color: 'var(--color-text-secondary)',
                    fontSize: '10px',
                    padding: '0 6px',
                    cursor: 'pointer',
                  }}
                >
                  Compare
                </button>
                <button
                  onClick={() => onDelete(b.id)}
                  style={{
                    height: 22,
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-danger)',
                    background: 'var(--color-danger-dim)',
                    color: 'var(--color-danger)',
                    fontSize: '10px',
                    padding: '0 6px',
                    cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ghost style section */}
      {activeBaselineId !== null && baselines.length > 0 && (
        <div style={{ borderTop: '1px solid var(--color-border)', padding: '8px 14px' }}>
          <div style={{ fontSize: 'var(--text-2xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
            Ghost Style
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {GHOST_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => onSetGhostStyle(opt.value)}
                title={opt.desc}
                style={{
                  flex: 1, height: 26,
                  borderRadius: 'var(--radius)',
                  border: `1px solid ${ghostStyle === opt.value ? 'var(--accent)' : 'var(--color-border)'}`,
                  background: ghostStyle === opt.value ? 'var(--accent)' : 'var(--color-surface-2)',
                  color: ghostStyle === opt.value ? '#fff' : 'var(--color-text-secondary)',
                  fontSize: 'var(--text-2xs)',
                  cursor: 'pointer',
                  transition: 'all 0.12s',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
