import { useMemo } from 'react'
import type { Resource, ResourceAssignment, Task, Timeline, WorkweekConfig } from '../../types'
import { computeResourceDemand } from '../../lib/resourceDemand'
import { HISTOGRAM_BAR_GAP, HISTOGRAM_HEIGHT, HISTOGRAM_PAD_X } from '../../constants'
import { ChartBar } from '../../lib/icons'
import { ResourceSelectorPill } from './ResourceSelectorPill'

interface ResourceHistogramProps {
  resources: Resource[]
  assignments: ResourceAssignment[]
  tasks: Task[]
  timeline: Timeline
  dayPx: number
  workweek: WorkweekConfig
  holidays: string[]
  selectedResourceId: string | null
  onSelectResource: (resourceId: string) => void
}

function getResourceById(resources: Resource[], resourceId: string | null): Resource | null {
  if (!resourceId) return null
  return resources.find((resource) => resource.id === resourceId) ?? null
}

export function ResourceHistogram({
  resources,
  assignments,
  tasks,
  timeline,
  dayPx,
  workweek,
  holidays,
  selectedResourceId,
  onSelectResource,
}: ResourceHistogramProps) {
  const selectedResource = getResourceById(resources, selectedResourceId)

  const demand = useMemo(() => {
    if (!selectedResource) return []
    return computeResourceDemand(selectedResource.id, {
      tasks,
      assignments,
      resources,
      timeline,
      workweek,
      holidays,
    })
  }, [selectedResource, tasks, assignments, resources, timeline, workweek, holidays])

  const maxDemand = demand.reduce((max, point) => Math.max(max, point.demand), 0)
  const denominator = selectedResource && selectedResource.category !== 'material'
    ? Math.max(maxDemand, selectedResource.capacity, 1)
    : Math.max(maxDemand, 1)
  const chartHeight = HISTOGRAM_HEIGHT - 28

  return (
    <div
      style={{
        width: timeline.totalPx,
        height: HISTOGRAM_HEIGHT,
        borderTop: '1px solid var(--color-border)',
        background: 'var(--surface-sunken)',
        padding: `8px ${HISTOGRAM_PAD_X}px`,
        boxSizing: 'border-box',
      }}
    >
      <ResourceSelectorPill
        resources={resources}
        selectedResourceId={selectedResourceId}
        onSelectResource={onSelectResource}
      />

      {resources.length === 0 && (
        <EmptyState message="No resources defined yet." />
      )}

      {resources.length > 0 && !selectedResource && (
        <EmptyState message="Select a resource above to see demand." />
      )}

      {selectedResource && (
        <div style={{ position: 'relative', height: chartHeight, border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-sm)', background: 'var(--color-surface)' }}>
          {demand.map((point, index) => {
            const left = timeline.days[index]?.offset ?? 0
            const barWidth = Math.max(1, dayPx - HISTOGRAM_BAR_GAP)
            const barHeight = Math.max(1, Math.round((point.demand / denominator) * (chartHeight - 8)))
            const overHeight = selectedResource.category === 'material'
              ? 0
              : Math.round((point.overAllocation / denominator) * (chartHeight - 8))

            return (
              <div key={`${left}-${index}`}>
                <div
                  title={`${point.demand.toFixed(2)} ${selectedResource.unit}`}
                  style={{
                    position: 'absolute',
                    left,
                    bottom: 0,
                    width: barWidth,
                    height: barHeight,
                    background: selectedResource.color || 'var(--histogram-bar-bg)',
                    opacity: 0.75,
                  }}
                />
                {overHeight > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      left,
                      bottom: barHeight - overHeight,
                      width: barWidth,
                      height: overHeight,
                      background: 'var(--histogram-over)',
                    }}
                  />
                )}
              </div>
            )
          })}

          {selectedResource.category !== 'material' && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: Math.round((selectedResource.capacity / denominator) * (chartHeight - 8)),
                borderTop: '1px dashed var(--histogram-capacity-line)',
              }}
            />
          )}
        </div>
      )}
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div
      style={{
        height: HISTOGRAM_HEIGHT - 38,
        border: '1px dashed var(--color-border)',
        borderRadius: 'var(--radius)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        color: 'var(--color-text-dim)',
        fontSize: 'var(--text-xs)',
      }}
    >
      <ChartBar size={14} weight="regular" aria-hidden="true" />
      <span>{message}</span>
    </div>
  )
}
