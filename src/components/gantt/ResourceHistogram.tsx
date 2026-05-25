import { useMemo } from 'react'
import type { Resource, ResourceAssignment, Task, Timeline, WorkweekConfig } from '../../types'
import { computeResourceDemand } from '../../lib/resourceDemand'
import { HISTOGRAM_BAR_GAP, HISTOGRAM_HEIGHT, HISTOGRAM_PAD_X, MAX_OVERLAY_RESOURCES } from '../../constants'
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
  selectedResourceIds: string[]
  compareMode: boolean
  onToggleCompareMode: () => void
  onSelectResource: (resourceId: string, additive: boolean) => void
  isComputing?: boolean
}

function getResourcesById(resources: Resource[], resourceIds: string[]): Resource[] {
  const set = new Set(resourceIds)
  return resources.filter((resource) => set.has(resource.id))
}

export function ResourceHistogram({
  resources,
  assignments,
  tasks,
  timeline,
  dayPx,
  workweek,
  holidays,
  selectedResourceIds,
  compareMode,
  onToggleCompareMode,
  onSelectResource,
  isComputing = false,
}: ResourceHistogramProps) {
  const selectedResources = getResourcesById(resources, selectedResourceIds).slice(0, MAX_OVERLAY_RESOURCES)
  const selectedResource = selectedResources[0] ?? null

  const demandByResource = useMemo(() => {
    return selectedResources.map((resource) => ({
      resource,
      demand: computeResourceDemand(resource.id, {
        tasks,
        assignments,
        resources,
        timeline,
        workweek,
        holidays,
      }),
    }))
  }, [selectedResources, tasks, assignments, resources, timeline, workweek, holidays])

  const stackedDemand = useMemo(() => {
    const totals = new Array(timeline.days.length).fill(0)
    demandByResource.forEach((entry) => {
      entry.demand.forEach((point, index) => {
        totals[index] += point.demand
      })
    })
    return totals
  }, [demandByResource, timeline.days.length])

  const maxDemand = stackedDemand.reduce((max, value) => Math.max(max, value), 0)
  const denominator = selectedResource && selectedResources.length === 1 && selectedResource.category !== 'material'
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
        position: 'relative',
      }}
    >
      {isComputing && <div className="computing-bar" aria-hidden="true" />}

      <ResourceSelectorPill
        resources={resources}
        selectedResourceIds={selectedResourceIds}
        compareMode={compareMode}
        onToggleCompareMode={onToggleCompareMode}
        onSelectResource={onSelectResource}
      />

      {resources.length === 0 && (
        <EmptyState
          message="No resources defined yet."
          hint="Add resources from the top bar to render a demand histogram."
        />
      )}

      {resources.length > 0 && selectedResources.length === 0 && (
        <EmptyState
          message="No resource selected."
          hint="Choose a resource pill above to render its day-by-day demand."
        />
      )}

      {selectedResources.length > 0 && (
        <div style={{ position: 'relative', height: chartHeight, border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-sm)', background: 'var(--color-surface)' }}>
          {timeline.days.map((day, index) => {
            const left = timeline.days[index]?.offset ?? 0
            const barWidth = Math.max(1, dayPx - HISTOGRAM_BAR_GAP)
            let runningHeight = 0
            const segments: Array<{
              resourceId: string
              name: string
              unit: string
              color: string
              barHeight: number
              overHeight: number
              start: number
            }> = []
            demandByResource.forEach((entry) => {
              const point = entry.demand[index]
              if (!point || point.demand <= 0) return
              const barHeight = Math.max(1, Math.round((point.demand / denominator) * (chartHeight - 8)))
              const overHeight = entry.resource.category === 'material'
                ? 0
                : Math.round((point.overAllocation / denominator) * (chartHeight - 8))
              segments.push({
                resourceId: entry.resource.id,
                name: entry.resource.name,
                unit: entry.resource.unit,
                color: entry.resource.color || 'var(--histogram-bar-bg)',
                barHeight,
                overHeight,
                start: runningHeight,
              })
              runningHeight += barHeight
            })

            return (
              <div key={`${day.date.toISOString()}-${index}`}>
                {segments.map((segment) => {
                  return (
                    <div
                      key={`${segment.resourceId}-${index}`}
                      title={`${segment.name}`}
                      style={{
                        position: 'absolute',
                        left,
                        bottom: segment.start,
                        width: barWidth,
                        height: segment.barHeight,
                        background: segment.color,
                        opacity: 0.75,
                      }}
                    />
                  )
                })}
                {segments.map((segment) => {
                  if (segment.overHeight <= 0) return null
                  return (
                    <div
                      key={`over-${segment.resourceId}-${index}`}
                      style={{
                        position: 'absolute',
                        left,
                        bottom: segment.start + (segment.barHeight - segment.overHeight),
                        width: barWidth,
                        height: segment.overHeight,
                        background: 'var(--histogram-over)',
                      }}
                    />
                  )
                })}
              </div>
            )
          })}

          {selectedResources.length === 1 && selectedResource && selectedResource.category !== 'material' && (
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

function EmptyState({ message, hint }: { message: string; hint?: string }) {
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
      {hint && <span style={{ color: 'var(--color-text-tertiary)' }}>{hint}</span>}
    </div>
  )
}
