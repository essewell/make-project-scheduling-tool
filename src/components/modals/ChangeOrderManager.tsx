import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeOrder, ChangeOrderStatus } from '../../types'
import { useDialogA11y } from '../../hooks/useDialogA11y'
import { validateChangeOrder } from '../../lib/changeOrders'

interface ChangeOrderManagerProps {
  open: boolean
  changeOrders: ChangeOrder[]
  selectedChangeOrderId?: string | null
  onSave: (changeOrders: ChangeOrder[]) => void
  onClose: () => void
}

const STATUS_FILTERS: Array<{ value: 'all' | ChangeOrderStatus; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

export function ChangeOrderManager({
  open,
  changeOrders,
  selectedChangeOrderId,
  onSave,
  onClose,
}: ChangeOrderManagerProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const [filter, setFilter] = useState<'all' | ChangeOrderStatus>('all')
  const [items, setItems] = useState<ChangeOrder[]>([])
  const [errorsById, setErrorsById] = useState<Record<string, string[]>>({})
  useDialogA11y({ containerRef: dialogRef, onClose, enabled: open })

  useEffect(() => {
    if (!open) return
    setItems(changeOrders.map((changeOrder) => ({ ...changeOrder })))
    setErrorsById({})
  }, [open, changeOrders])

  const visible = useMemo(
    () => items.filter((changeOrder) => filter === 'all' || changeOrder.status === filter),
    [items, filter],
  )
  const originalStatusById = useMemo(
    () => new Map(changeOrders.map((changeOrder) => [changeOrder.id, changeOrder.status])),
    [changeOrders],
  )

  const updateItem = (id: string, patch: Partial<ChangeOrder>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)))
    setErrorsById((prev) => {
      if (!prev[id]) return prev
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const saveItem = (id: string) => {
    const item = items.find((changeOrder) => changeOrder.id === id)
    if (!item) return
    const previousStatus = originalStatusById.get(id)
    const errors = validateChangeOrder(item, { previousStatus })
    if (errors.length > 0) {
      setErrorsById((prev) => ({ ...prev, [id]: errors }))
      return
    }
    setErrorsById((prev) => {
      if (!prev[id]) return prev
      const next = { ...prev }
      delete next[id]
      return next
    })
    onSave(items)
  }

  const addDraft = () => {
    const now = new Date().toISOString()
    const newItem: ChangeOrder = {
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      number: '',
      name: '',
      reason: '',
      status: 'draft',
      createdAt: now,
      lockedAt: now.slice(0, 10),
      affectedTaskIds: [],
      daysImpact: 0,
      costImpact: 0,
    }
    setItems((prev) => [newItem, ...prev])
    setFilter('all')
  }

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
        aria-label="Change order manager"
        tabIndex={-1}
        style={{
          width: 720,
          maxWidth: '95vw',
          maxHeight: '80vh',
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          borderTop: '3px solid var(--accent)',
          boxShadow: 'var(--shadow-xl)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'schedule-slide-in 0.16s ease-out both',
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={{ padding: '18px 20px 12px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-sm)' }}>Change Orders</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', marginTop: 2 }}>
            {visible.length} of {items.length}
          </div>
        </div>

        <div style={{ padding: '10px 20px', borderBottom: '1px solid var(--color-border-light)', background: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {STATUS_FILTERS.map((item) => (
              <button
                key={item.value}
                onClick={() => setFilter(item.value)}
                style={{
                  height: 26,
                  borderRadius: 'var(--radius)',
                  border: `1px solid ${filter === item.value ? 'var(--accent)' : 'var(--color-border)'}`,
                  background: filter === item.value ? 'var(--accent)' : 'var(--color-surface)',
                  color: filter === item.value ? '#fff' : 'var(--color-text-secondary)',
                  fontSize: 'var(--text-2xs)',
                  padding: '0 9px',
                  cursor: 'pointer',
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button
            onClick={addDraft}
            style={{
              height: 28,
              borderRadius: 'var(--radius)',
              border: 'none',
              background: 'var(--accent)',
              color: '#fff',
              fontSize: 'var(--text-xs)',
              padding: '0 12px',
              cursor: 'pointer',
            }}
          >
            + New Change Order
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {visible.length === 0 ? (
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-dim)' }}>
              No change orders for this filter.
            </div>
          ) : (
            visible.map((changeOrder) => (
              <div
                key={changeOrder.id}
                style={{
                  border: '1px solid var(--color-border)',
                  outline: selectedChangeOrderId === changeOrder.id ? '2px solid var(--accent)' : 'none',
                  borderRadius: 'var(--radius)',
                  padding: '10px',
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: 8,
                }}
              >
                <div style={{ minWidth: 0, display: 'grid', gap: 6 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    <input
                      type="text"
                      value={changeOrder.number}
                      placeholder="CO number"
                      onChange={(event) => updateItem(changeOrder.id, { number: event.target.value })}
                      style={{
                        height: 28,
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border)',
                        background: 'var(--color-surface)',
                        color: 'var(--color-text-primary)',
                        fontSize: 'var(--text-xs)',
                        padding: '0 8px',
                      }}
                    />
                    <input
                      type="text"
                      value={changeOrder.name}
                      placeholder="CO name"
                      onChange={(event) => updateItem(changeOrder.id, { name: event.target.value })}
                      style={{
                        height: 28,
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border)',
                        background: 'var(--color-surface)',
                        color: 'var(--color-text-primary)',
                        fontSize: 'var(--text-xs)',
                        padding: '0 8px',
                      }}
                    />
                  </div>
                  <input
                    type="text"
                    value={changeOrder.reason}
                    placeholder="Reason"
                    onChange={(event) => updateItem(changeOrder.id, { reason: event.target.value })}
                    style={{
                      height: 28,
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-surface)',
                      color: 'var(--color-text-primary)',
                      fontSize: 'var(--text-xs)',
                      padding: '0 8px',
                    }}
                  />
                  {(errorsById[changeOrder.id] ?? []).map((error) => (
                    <div key={error} style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-danger)' }}>
                      {error}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'grid', gap: 6, justifyItems: 'end' }}>
                  <select
                    value={changeOrder.status}
                    onChange={(event) => {
                      const value = event.target.value as ChangeOrderStatus
                      updateItem(changeOrder.id, { status: value })
                    }}
                    style={{
                      height: 28,
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-surface)',
                      color: 'var(--color-text-secondary)',
                      fontSize: 'var(--text-2xs)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      padding: '0 6px',
                    }}
                  >
                    <option value="draft">draft</option>
                    <option value="approved">approved</option>
                    <option value="rejected">rejected</option>
                  </select>
                  <button
                    onClick={() => saveItem(changeOrder.id)}
                    style={{
                      height: 24,
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-surface-2)',
                      color: 'var(--color-text-secondary)',
                      fontSize: 'var(--text-2xs)',
                      padding: '0 8px',
                      cursor: 'pointer',
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end' }}>
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
