import { useMemo, useRef, useState } from 'react'
import type { ChangeOrder, ChangeOrderStatus } from '../../types'
import { useDialogA11y } from '../../hooks/useDialogA11y'

interface ChangeOrderManagerProps {
  open: boolean
  changeOrders: ChangeOrder[]
  onClose: () => void
}

const STATUS_FILTERS: Array<{ value: 'all' | ChangeOrderStatus; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

export function ChangeOrderManager({ open, changeOrders, onClose }: ChangeOrderManagerProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const [filter, setFilter] = useState<'all' | ChangeOrderStatus>('all')
  useDialogA11y({ containerRef: dialogRef, onClose, enabled: open })

  const visible = useMemo(
    () => changeOrders.filter((changeOrder) => filter === 'all' || changeOrder.status === filter),
    [changeOrders, filter],
  )

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
            {visible.length} of {changeOrders.length}
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
                  borderRadius: 'var(--radius)',
                  padding: '10px',
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: 8,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {changeOrder.number} · {changeOrder.name}
                  </div>
                  <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-tertiary)', marginTop: 3 }}>
                    {changeOrder.reason || 'No reason provided'}
                  </div>
                </div>
                <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {changeOrder.status}
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
