// ─── Types ────────────────────────────────────────────────────────────────────

export type MobileTab = 'tasks' | 'gantt' | 'panel'

// ─── Props ────────────────────────────────────────────────────────────────────

interface MobileTabSwitcherProps {
  activeTab: MobileTab
  panelAvailable: boolean
  onChange: (tab: MobileTab) => void
}

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS: Array<{ value: MobileTab; label: string; icon: string }> = [
  { value: 'tasks', label: 'Tasks',  icon: '☰' },
  { value: 'gantt', label: 'Gantt',  icon: '▬' },
  { value: 'panel', label: 'Detail', icon: '◧' },
]

// ─── MobileTabSwitcher ────────────────────────────────────────────────────────

export function MobileTabSwitcher({ activeTab, panelAvailable, onChange }: MobileTabSwitcherProps) {
  return (
    <div
      className="mobile-tab-switcher"
      role="tablist"
      aria-label="Mobile view switcher"
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        height: 56,
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        zIndex: 100,
        boxShadow: '0 -2px 12px rgba(0,0,0,0.08)',
      }}
    >
      {TABS.map(tab => {
        if (tab.value === 'panel' && !panelAvailable) return null
        const active = activeTab === tab.value
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            role="tab"
            aria-selected={active}
            aria-controls={tab.value === 'panel' ? undefined : `mobile-view-${tab.value}`}
            id={`mobile-tab-${tab.value}`}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 3,
              background: 'none', border: 'none', cursor: 'pointer',
              color: active ? 'var(--accent)' : 'var(--color-text-tertiary)',
              transition: 'color 0.12s',
            }}
          >
            <span aria-hidden="true" style={{ fontSize: 18, lineHeight: 1 }}>{tab.icon}</span>
            <span style={{
              fontSize: 'var(--text-2xs)',
              fontWeight: active ? 'var(--weight-semibold)' : 'var(--weight-regular)',
              fontFamily: 'var(--font-sans)',
            }}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
