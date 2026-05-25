import type { Resource } from '../../types'
import { MAX_OVERLAY_RESOURCES } from '../../constants'

interface ResourceSelectorPillProps {
  resources: Resource[]
  selectedResourceIds: string[]
  compareMode: boolean
  onToggleCompareMode: () => void
  onSelectResource: (resourceId: string, additive: boolean) => void
}

export function ResourceSelectorPill({
  resources,
  selectedResourceIds,
  compareMode,
  onToggleCompareMode,
  onSelectResource,
}: ResourceSelectorPillProps) {
  if (resources.length === 0) return null

  return (
    <div style={{ display: 'grid', gap: 6, paddingBottom: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-tertiary)' }}>
          {compareMode ? `Compare mode on (${selectedResourceIds.length}/${MAX_OVERLAY_RESOURCES})` : 'Single resource mode'}
        </div>
        <button
          onClick={onToggleCompareMode}
          style={{
            height: 22,
            padding: '0 8px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
            background: compareMode ? 'var(--accent-dim)' : 'var(--color-surface)',
            color: compareMode ? 'var(--accent)' : 'var(--color-text-secondary)',
            fontSize: 'var(--text-2xs)',
            cursor: 'pointer',
          }}
        >
          Compare resources
        </button>
      </div>
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
        {resources.map((resource) => {
          const active = selectedResourceIds.includes(resource.id)
          return (
            <button
              key={resource.id}
              onClick={(event) => onSelectResource(resource.id, compareMode && event.shiftKey)}
              style={{
                height: 24,
                padding: '0 10px',
                borderRadius: 999,
                border: `1px solid ${active ? resource.color : 'var(--color-border)'}`,
                background: active ? `color-mix(in srgb, ${resource.color} 14%, transparent)` : 'var(--color-surface)',
                color: active ? resource.color : 'var(--color-text-secondary)',
                fontSize: 'var(--text-2xs)',
                fontWeight: active ? 'var(--weight-semibold)' : 'var(--weight-medium)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {resource.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
