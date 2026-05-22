import { useId, useRef, useState } from 'react'
import type { Group } from '../../types'
import { useDialogA11y } from '../../hooks/useDialogA11y'

interface GroupsManagerProps {
  groups: Group[]
  onSave: (groups: Group[]) => void
  onClose: () => void
}

const OVERLAY: React.CSSProperties = {
  position: 'fixed', inset: 0,
  background: 'rgba(10,18,30,0.54)',
  zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
}

const BOX: React.CSSProperties = {
  width: 460, maxWidth: '95vw', maxHeight: '80vh',
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-lg)',
  borderTop: '3px solid var(--accent)',
  boxShadow: 'var(--shadow-xl)',
  display: 'flex', flexDirection: 'column', overflow: 'hidden',
  animation: 'schedule-slide-in 0.16s ease-out both',
}

const INPUT: React.CSSProperties = {
  height: 30, borderRadius: 'var(--radius)',
  border: '1px solid var(--color-border)',
  padding: '0 8px', fontSize: 'var(--text-xs)',
  fontFamily: 'var(--font-sans)',
  background: 'var(--color-surface)', color: 'var(--color-text-primary)',
  boxSizing: 'border-box',
}

const PRESET_COLORS = ['#378ADD','#27AAE1','#2ECC71','#F39C12','#E74C3C','#9B59B6','#1ABC9C','#E67E22','#34495E','#16A085']

function genId() { return Math.random().toString(36).slice(2, 10) }

export function GroupsManager({ groups, onSave, onClose }: GroupsManagerProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descId = useId()
  const [items, setItems] = useState<Group[]>(groups.map(g => ({ ...g })))
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(PRESET_COLORS[0] ?? '#378ADD')

  useDialogA11y({ containerRef: dialogRef, onClose })

  const update = (id: string, patch: Partial<Group>) => {
    setItems(prev => prev.map(g => g.id === id ? { ...g, ...patch } : g))
  }

  const remove = (id: string) => {
    setItems(prev => prev.filter(g => g.id !== id))
  }

  const add = () => {
    const name = newName.trim()
    if (!name) return
    setItems(prev => [...prev, { id: genId(), name, color: newColor }])
    setNewName('')
  }

  return (
    <div style={OVERLAY} onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
        style={BOX}
        onClick={e => e.stopPropagation()}
      >

        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--color-border)' }}>
          <div id={titleId} style={{ fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-sm)' }}>Manage Phases</div>
          <div id={descId} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', marginTop: 2 }}>
            {items.length} phase{items.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.map(g => (
            <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="color"
                value={g.color}
                onChange={e => update(g.id, { color: e.target.value })}
                aria-label={`Phase color for ${g.name || 'unnamed phase'}`}
                style={{ width: 26, height: 26, padding: 2, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', background: 'none' }}
              />
              <input
                type="text"
                value={g.name}
                onChange={e => update(g.id, { name: e.target.value })}
                style={{ ...INPUT, flex: 1 }}
              />
              <button
                onClick={() => remove(g.id)}
                aria-label={`Remove ${g.name || 'phase'}`}
                style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-dim)', fontSize: 16, flexShrink: 0 }}
              >×</button>
            </div>
          ))}
        </div>

        {/* Add form */}
        <div style={{ padding: '10px 20px', borderTop: '1px solid var(--color-border-light)', background: 'var(--color-surface-2)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-tertiary)', fontWeight: 'var(--weight-semibold)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Add Phase
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="color"
              value={newColor}
              onChange={e => setNewColor(e.target.value)}
              aria-label="New phase color"
              style={{ width: 26, height: 26, padding: 2, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', background: 'none', flexShrink: 0 }}
            />
            <input
              type="text"
              placeholder="Phase name..."
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && add()}
              style={{ ...INPUT, flex: 1 }}
            />
            <button
              onClick={add}
              style={{ height: 30, padding: '0 12px', borderRadius: 'var(--radius)', border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 'var(--text-xs)', cursor: 'pointer', flexShrink: 0 }}
            >
              Add
            </button>
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                onClick={() => setNewColor(c)}
                aria-label={`Use preset color ${c}`}
                style={{
                  width: 18, height: 18, borderRadius: '50%',
                  background: c, border: newColor === c ? '2px solid var(--color-text-primary)' : '2px solid transparent',
                  cursor: 'pointer', padding: 0,
                }}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={{ height: 30, padding: '0 14px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'none', color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)', cursor: 'pointer' }}>
            Cancel
          </button>
          <button
            onClick={() => { onSave(items); onClose() }}
            style={{ height: 30, padding: '0 14px', borderRadius: 'var(--radius)', border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)', cursor: 'pointer' }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
