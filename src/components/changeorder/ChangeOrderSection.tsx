import { useEffect, useMemo, useState } from 'react'
import type { ChangeOrder } from '../../types'

interface ChangeOrderSectionProps {
  taskId: string
  changeOrders: ChangeOrder[]
  onOpenManager: (changeOrderId?: string) => void
  onStartLink: () => void
  onLinkChangeOrder: (changeOrderId: string) => void
  onUnlinkChangeOrder: (changeOrderId: string) => void
}

const SECTION_TITLE: React.CSSProperties = {
  fontSize: 'var(--text-2xs)',
  fontWeight: 'var(--weight-semibold)',
  color: 'var(--color-text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: 6,
}

const SECTION_RULE: React.CSSProperties = {
  width: 32,
  height: 1,
  background: 'var(--rule-soft)',
  marginBottom: 8,
}

export function ChangeOrderSection({
  taskId,
  changeOrders,
  onOpenManager,
  onStartLink,
  onLinkChangeOrder,
  onUnlinkChangeOrder,
}: ChangeOrderSectionProps) {
  const linked = useMemo(
    () => changeOrders.filter((changeOrder) => changeOrder.affectedTaskIds.includes(taskId)),
    [changeOrders, taskId],
  )
  const [expanded, setExpanded] = useState(linked.length > 0)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    setExpanded(linked.length > 0)
  }, [taskId, linked.length])

  const linkable = useMemo(() => {
    const linkedIds = new Set(linked.map((changeOrder) => changeOrder.id))
    const normalizedQuery = query.trim().toLowerCase()
    return changeOrders.filter((changeOrder) => {
      if (linkedIds.has(changeOrder.id)) return false
      if (!normalizedQuery) return true
      return (
        changeOrder.number.toLowerCase().includes(normalizedQuery) ||
        changeOrder.name.toLowerCase().includes(normalizedQuery)
      )
    })
  }, [changeOrders, linked, query])

  return (
    <div>
      <div style={SECTION_RULE} aria-hidden="true" />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={SECTION_TITLE}>Change Orders</div>
        <button
          onClick={() => setExpanded((value) => !value)}
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
          {expanded ? 'Hide' : 'Show'}
        </button>
      </div>

      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {linked.length === 0 ? (
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-dim)' }}>
              No change orders affect this task.
            </div>
          ) : (
            linked.map((changeOrder) => (
              <div
                key={changeOrder.id}
                style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--surface-sunken)',
                  padding: '7px 9px',
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: 8,
                  alignItems: 'start',
                }}
              >
                <button
                  onClick={() => onOpenManager(changeOrder.id)}
                  style={{
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    margin: 0,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-primary)', fontWeight: 'var(--weight-medium)' }}>
                    {changeOrder.number} · {changeOrder.name}
                  </div>
                  <div style={{ marginTop: 2, fontSize: 'var(--text-2xs)', color: 'var(--color-text-tertiary)' }}>
                    {changeOrder.daysImpact >= 0 ? '+' : ''}
                    {changeOrder.daysImpact}d
                    {typeof changeOrder.costImpact === 'number'
                      ? ` · $${changeOrder.costImpact.toLocaleString()}`
                      : ''}
                  </div>
                </button>
                <button
                  onClick={() => onUnlinkChangeOrder(changeOrder.id)}
                  style={{
                    height: 22,
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    color: 'var(--color-text-tertiary)',
                    fontSize: 'var(--text-2xs)',
                    padding: '0 6px',
                    cursor: 'pointer',
                  }}
                >
                  Unlink
                </button>
              </div>
            ))
          )}
          <div style={{ position: 'relative', alignSelf: 'flex-start' }}>
            <button
              onClick={() => {
                onStartLink()
                setPickerOpen((value) => !value)
              }}
              style={{
                height: 26,
                borderRadius: 'var(--radius)',
                border: '1px solid var(--color-border)',
                background: 'none',
                color: 'var(--accent)',
                fontSize: 'var(--text-xs)',
                padding: '0 10px',
                cursor: 'pointer',
              }}
            >
              + Link change order
            </button>
            {pickerOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 30,
                  left: 0,
                  width: 280,
                  maxWidth: 'calc(100vw - 64px)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius)',
                  background: 'var(--color-surface)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: 8,
                  zIndex: 10,
                  display: 'grid',
                  gap: 6,
                }}
              >
                <input
                  type="search"
                  placeholder="Search change orders..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
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
                <div style={{ maxHeight: 180, overflowY: 'auto', display: 'grid', gap: 4 }}>
                  {linkable.length === 0 ? (
                    <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-dim)' }}>
                      No matching unlinked change orders.
                    </div>
                  ) : (
                    linkable.map((changeOrder) => (
                      <button
                        key={changeOrder.id}
                        onClick={() => {
                          onLinkChangeOrder(changeOrder.id)
                          setPickerOpen(false)
                          setQuery('')
                        }}
                        style={{
                          textAlign: 'left',
                          border: '1px solid var(--color-border-light)',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--color-surface-2)',
                          color: 'var(--color-text-primary)',
                          fontSize: 'var(--text-xs)',
                          padding: '6px 7px',
                          cursor: 'pointer',
                        }}
                      >
                        {changeOrder.number} · {changeOrder.name}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
