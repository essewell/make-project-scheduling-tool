import type { Resource } from '../../types'

interface ResourceSelectorPillProps {
  resources: Resource[]
  selectedResourceId: string | null
  onSelectResource: (resourceId: string) => void
}

export function ResourceSelectorPill({
  resources,
  selectedResourceId,
  onSelectResource,
}: ResourceSelectorPillProps) {
  if (resources.length === 0) return null

  return (
    <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6 }}>
      {resources.map((resource) => {
        const active = selectedResourceId === resource.id
        return (
          <button
            key={resource.id}
            onClick={() => onSelectResource(resource.id)}
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
  )
}
