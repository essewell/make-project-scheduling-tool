import type { Group, Party, FilterState, TaskStatus } from '../../types'
import { MagnifyingGlass } from '../../lib/icons'

// ─── Props ────────────────────────────────────────────────────────────────────

interface FilterBarProps {
  groups: Group[]
  parties: Party[]
  taskCount: number
  visibleCount: number
  searchTerm: string
  filterState: FilterState
  onSearch: (q: string) => void
  onFilter: (f: FilterState) => void
}

// ─── Status chip data ─────────────────────────────────────────────────────────

const STATUS_CHIPS: Array<{ value: TaskStatus; label: string }> = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'at_risk',     label: 'At Risk' },
  { value: 'delayed',     label: 'Delayed' },
  { value: 'complete',    label: 'Complete' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toggle<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]
}

// ─── FilterBar ────────────────────────────────────────────────────────────────

export function FilterBar({
  groups, parties, taskCount, visibleCount,
  searchTerm, filterState, onSearch, onFilter,
}: FilterBarProps) {
  const isFiltered = filterState.phases.length > 0 || filterState.statuses.length > 0 || filterState.parties.length > 0

  const clearAll = () => {
    onSearch('')
    onFilter({ phases: [], statuses: [], parties: [] })
  }

  return (
    <div style={{
      background: 'var(--color-surface)',
      borderBottom: '1px solid var(--color-border)',
      display: 'flex', alignItems: 'center',
      padding: '0 16px', height: '100%',
      gap: 8, flexShrink: 0, overflowX: 'auto',
    }}>
      {/* Search with icon prefix */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex' }}>
          <MagnifyingGlass size={12} weight="regular" color="var(--color-text-dim)" aria-hidden="true" />
        </span>
        <input
          type="text"
          placeholder="Search tasks…"
          value={searchTerm}
          onChange={e => onSearch(e.target.value)}
          style={{
            height: 26, borderRadius: 'var(--radius)',
            border: '1px solid var(--color-border)',
            padding: '0 10px 0 26px', fontSize: 'var(--text-xs)', width: 160,
            fontFamily: 'var(--font-sans)',
            background: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
          }}
        />
      </div>

      {/* Phase chips */}
      {groups.length > 0 && (
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-dim)', marginRight: 2 }}>Phase</span>
          {groups.map(g => {
            const active = filterState.phases.includes(g.id)
            return (
              <button
                key={g.id}
                className={`filter-chip${active ? ' filter-chip--active' : ''}`}
                onClick={() => onFilter({ ...filterState, phases: toggle(filterState.phases, g.id) })}
                title={g.name}
                style={{
                  height: 22, padding: '0 8px',
                  borderRadius: 99,
                  border: `1.5px solid ${active ? g.color : 'var(--color-border)'}`,
                  background: active ? `color-mix(in srgb, ${g.color} 14%, transparent)` : 'transparent',
                  color: active ? g.color : 'var(--color-text-secondary)',
                  fontSize: 'var(--text-2xs)',
                  fontWeight: active ? 'var(--weight-semibold)' : 'var(--weight-regular)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transformOrigin: 'center center',
                  transition: 'transform 160ms ease, background 160ms ease, color 160ms ease, border-color 160ms ease',
                }}
              >
                {g.name}
              </button>
            )
          })}
        </div>
      )}

      {/* Status chips */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-dim)', marginRight: 2 }}>Status</span>
        {STATUS_CHIPS.map(s => {
          const active = filterState.statuses.includes(s.value)
          return (
            <button
              key={s.value}
              className={`filter-chip${active ? ' filter-chip--active' : ''}`}
              onClick={() => onFilter({ ...filterState, statuses: toggle(filterState.statuses, s.value) })}
              style={{
                height: 22, padding: '0 8px',
                borderRadius: 99,
                border: `1.5px solid ${active ? 'var(--accent)' : 'var(--color-border)'}`,
                background: active ? 'var(--accent-dim)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--color-text-secondary)',
                fontSize: 'var(--text-2xs)',
                fontWeight: active ? 'var(--weight-semibold)' : 'var(--weight-regular)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transformOrigin: 'center center',
                transition: 'transform 160ms ease, background 160ms ease, color 160ms ease, border-color 160ms ease',
              }}
            >
              {s.label}
            </button>
          )
        })}
      </div>

      {/* Party chips */}
      {parties.length > 0 && (
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-dim)', marginRight: 2 }}>Party</span>
          {parties.map(p => {
            const active = filterState.parties.includes(p.id)
            return (
              <button
                key={p.id}
                className={`filter-chip${active ? ' filter-chip--active' : ''}`}
                onClick={() => onFilter({ ...filterState, parties: toggle(filterState.parties, p.id) })}
                title={p.name}
                style={{
                  height: 22, padding: '0 8px',
                  borderRadius: 99,
                  border: `1.5px solid ${active ? p.color : 'var(--color-border)'}`,
                  background: active ? `color-mix(in srgb, ${p.color} 14%, transparent)` : 'transparent',
                  color: active ? p.color : 'var(--color-text-secondary)',
                  fontSize: 'var(--text-2xs)',
                  fontWeight: active ? 'var(--weight-semibold)' : 'var(--weight-regular)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transformOrigin: 'center center',
                  transition: 'transform 160ms ease, background 160ms ease, color 160ms ease, border-color 160ms ease',
                }}
              >
                {p.abbr}
              </button>
            )
          })}
        </div>
      )}

      <div style={{ flex: 1 }} />

      {/* Clear + count */}
      {isFiltered && (
        <button
          onClick={clearAll}
          style={{
            height: 24, padding: '0 10px',
            borderRadius: 99,
            border: '1px solid var(--color-border)',
            background: 'none',
            color: 'var(--color-text-tertiary)',
            fontSize: 'var(--text-2xs)',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          Clear filters
        </button>
      )}
      <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-dim)', flexShrink: 0 }}>
        {isFiltered ? `${visibleCount} / ${taskCount}` : `${taskCount}`} task{taskCount !== 1 ? 's' : ''}
      </span>
    </div>
  )
}
