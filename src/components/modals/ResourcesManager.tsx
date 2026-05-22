import { useId, useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import type { Resource, ResourceAssignment, ResourceCategory, Task } from '../../types'
import { useDialogA11y } from '../../hooks/useDialogA11y'
import { createResource, pruneOrphanAssignments, validateResource } from '../../lib/resources'
import { generateAssignmentsCsv, generateResourcesCsv, parseAssignmentsCsv, parseResourcesCsv, triggerCSVDownload } from '../../lib/csv'

interface ResourcesManagerProps {
  resources: Resource[]
  assignments: ResourceAssignment[]
  tasks: Task[]
  onSave: (resources: Resource[]) => void
  onSaveAssignments: (assignments: ResourceAssignment[]) => void
  onClose: () => void
}

interface ResourceValidationState {
  name?: string
  unit?: string
  capacity?: string
  costRate?: string
}

const OVERLAY: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(10,18,30,0.54)',
  zIndex: 200,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const BOX: React.CSSProperties = {
  width: 760,
  maxWidth: '95vw',
  maxHeight: '84vh',
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-lg)',
  borderTop: '3px solid var(--accent)',
  boxShadow: 'var(--shadow-xl)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  animation: 'schedule-slide-in 0.16s ease-out both',
}

const INPUT: React.CSSProperties = {
  height: 30,
  borderRadius: 'var(--radius)',
  border: '1px solid var(--color-border)',
  padding: '0 8px',
  fontSize: 'var(--text-xs)',
  fontFamily: 'var(--font-sans)',
  background: 'var(--color-surface)',
  color: 'var(--color-text-primary)',
  boxSizing: 'border-box',
}

function genId() {
  return Math.random().toString(36).slice(2, 10)
}

function toValidationState(resources: Resource[]): Record<string, ResourceValidationState> {
  const out: Record<string, ResourceValidationState> = {}

  resources.forEach((resource) => {
    const errors = validateResource(resource, resources)
    if (errors.length === 0) return

    out[resource.id] = errors.reduce<ResourceValidationState>((acc, error) => {
      acc[error.field] = error.reason
      return acc
    }, {})
  })

  return out
}

function categoryLabel(category: ResourceCategory): string {
  switch (category) {
    case 'labor': return 'Labor'
    case 'equipment': return 'Equipment'
    case 'material': return 'Material'
    default: return category
  }
}

export function ResourcesManager({
  resources,
  assignments,
  tasks,
  onSave,
  onSaveAssignments,
  onClose,
}: ResourcesManagerProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descId = useId()
  const [items, setItems] = useState<Resource[]>(resources.map((resource) => ({ ...resource })))
  const [localAssignments, setLocalAssignments] = useState<ResourceAssignment[]>(assignments.map((assignment) => ({ ...assignment })))
  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState<ResourceCategory>('labor')
  const [newUnit, setNewUnit] = useState('hours')
  const [newCapacity, setNewCapacity] = useState(1)
  const [newCostRate, setNewCostRate] = useState(0)
  const resourcesImportRef = useRef<HTMLInputElement>(null)
  const assignmentsImportRef = useRef<HTMLInputElement>(null)

  useDialogA11y({ containerRef: dialogRef, onClose })

  const validationState = useMemo(() => toValidationState(items), [items])
  const hasValidationErrors = Object.keys(validationState).length > 0

  const updateResource = (id: string, patch: Partial<Resource>) => {
    setItems((prev) => prev.map((resource) => (resource.id === id ? { ...resource, ...patch } : resource)))
  }

  const removeResource = (id: string) => {
    const assignmentCount = localAssignments.filter((assignment) => assignment.resourceId === id).length
    if (assignmentCount > 0) {
      const shouldDrop = window.confirm(
        `This resource has ${assignmentCount} assignment${assignmentCount !== 1 ? 's' : ''}. Delete resource and drop those assignments?`,
      )
      if (!shouldDrop) return
      setLocalAssignments((prev) => prev.filter((assignment) => assignment.resourceId !== id))
    }
    setItems((prev) => prev.filter((resource) => resource.id !== id))
  }

  const addResource = () => {
    const draft = createResource(
      genId(),
      {
        name: newName,
        category: newCategory,
        unit: newUnit,
        capacity: newCategory === 'material' ? 0 : newCapacity,
        costRate: newCostRate,
      },
      items,
    )

    setItems((prev) => [...prev, draft])
    setNewName('')
    setNewUnit(newCategory === 'material' ? 'tons' : 'hours')
    setNewCapacity(1)
    setNewCostRate(0)
  }

  const handleImportResources = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const parsed = parseResourcesCsv(text)
    if (parsed.resources.length > 0) {
      setItems(parsed.resources)
    }
    if (parsed.errors.length > 0) {
      window.alert(`Imported ${parsed.resources.length} resources with ${parsed.errors.length} row issues.`)
    }
    event.target.value = ''
  }

  const handleImportAssignments = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const parsed = parseAssignmentsCsv(text)
    const pruned = pruneOrphanAssignments(parsed.assignments, tasks, items)
    setLocalAssignments(pruned.assignments)

    const droppedText = pruned.droppedCount > 0 ? ` and dropped ${pruned.droppedCount} orphan assignment(s)` : ''
    if (parsed.errors.length > 0 || pruned.droppedCount > 0) {
      window.alert(
        `Imported ${pruned.assignments.length} assignments with ${parsed.errors.length} row issue(s)${droppedText}.`,
      )
    }
    event.target.value = ''
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
        onClick={(event) => event.stopPropagation()}
      >
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--color-border)' }}>
          <div id={titleId} style={{ fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-sm)' }}>Manage Resources</div>
          <div id={descId} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', marginTop: 2 }}>
            {items.length} resource{items.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.length === 0 && (
            <div
              style={{
                border: '1px dashed var(--color-border)',
                borderRadius: 'var(--radius)',
                padding: '18px 14px',
                textAlign: 'center',
                color: 'var(--color-text-dim)',
                fontSize: 'var(--text-xs)',
                lineHeight: 1.5,
              }}
            >
              No resources yet. Add one below or import a `resources.csv` file.
            </div>
          )}

          {items.map((resource) => {
            const resourceErrors = validationState[resource.id] ?? {}
            const isMaterial = resource.category === 'material'

            return (
              <div key={resource.id} style={{ border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius)', padding: '8px 10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="color"
                    value={resource.color}
                    onChange={(event) => updateResource(resource.id, { color: event.target.value })}
                    aria-label={`Resource color for ${resource.name || 'resource'}`}
                    style={{ width: 24, height: 24, padding: 2, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'none', flexShrink: 0 }}
                  />

                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    {(['labor', 'equipment', 'material'] as const).map((category) => (
                      <button
                        key={category}
                        onClick={() => updateResource(resource.id, { category, capacity: category === 'material' ? 0 : Math.max(1, resource.capacity) })}
                        style={{
                          height: 26,
                          padding: '0 8px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--color-border)',
                          background: resource.category === category ? 'var(--accent-muted)' : 'var(--color-surface)',
                          color: resource.category === category ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                          fontSize: 'var(--text-2xs)',
                          cursor: 'pointer',
                        }}
                      >
                        {categoryLabel(category)}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    value={resource.name}
                    onChange={(event) => updateResource(resource.id, { name: event.target.value })}
                    placeholder="Resource name"
                    style={{ ...INPUT, flex: 1, borderColor: resourceErrors.name ? 'var(--color-danger)' : 'var(--color-border)' }}
                  />

                  <input
                    type="text"
                    value={resource.unit}
                    onChange={(event) => updateResource(resource.id, { unit: event.target.value })}
                    placeholder="unit"
                    style={{ ...INPUT, width: 76, borderColor: resourceErrors.unit ? 'var(--color-danger)' : 'var(--color-border)' }}
                  />

                  <input
                    type="number"
                    min={0}
                    step="0.1"
                    value={resource.capacity}
                    disabled={isMaterial}
                    onChange={(event) => updateResource(resource.id, { capacity: Number(event.target.value) })}
                    title={isMaterial ? 'Capacity not used for material resources' : 'Capacity per workday'}
                    style={{ ...INPUT, width: 74, opacity: isMaterial ? 0.5 : 1, borderColor: resourceErrors.capacity ? 'var(--color-danger)' : 'var(--color-border)' }}
                  />

                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={resource.costRate}
                    onChange={(event) => updateResource(resource.id, { costRate: Number(event.target.value) })}
                    style={{ ...INPUT, width: 84, borderColor: resourceErrors.costRate ? 'var(--color-danger)' : 'var(--color-border)' }}
                  />

                  <button
                    onClick={() => removeResource(resource.id)}
                    aria-label={`Remove ${resource.name || 'resource'}`}
                    style={{ width: 28, height: 28, border: 'none', background: 'none', color: 'var(--color-text-dim)', fontSize: 16, cursor: 'pointer', flexShrink: 0 }}
                  >
                    ×
                  </button>
                </div>

                {Object.values(resourceErrors).length > 0 && (
                  <div style={{ marginTop: 6, fontSize: 'var(--text-2xs)', color: 'var(--color-danger)', display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {Object.entries(resourceErrors).map(([field, reason]) => (
                      <span key={field}>{reason}</span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div style={{ padding: '10px 20px', borderTop: '1px solid var(--color-border-light)', background: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="text"
            placeholder="Resource name..."
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            style={{ ...INPUT, flex: 1 }}
          />

          <select
            value={newCategory}
            onChange={(event) => setNewCategory(event.target.value as ResourceCategory)}
            style={{ ...INPUT, width: 110 }}
          >
            <option value="labor">Labor</option>
            <option value="equipment">Equipment</option>
            <option value="material">Material</option>
          </select>

          <input
            type="text"
            placeholder="unit"
            value={newUnit}
            onChange={(event) => setNewUnit(event.target.value)}
            style={{ ...INPUT, width: 76 }}
          />

          <input
            type="number"
            min={0}
            step="0.1"
            value={newCategory === 'material' ? 0 : newCapacity}
            disabled={newCategory === 'material'}
            onChange={(event) => setNewCapacity(Number(event.target.value))}
            style={{ ...INPUT, width: 74, opacity: newCategory === 'material' ? 0.5 : 1 }}
          />

          <input
            type="number"
            min={0}
            step="0.01"
            value={newCostRate}
            onChange={(event) => setNewCostRate(Number(event.target.value))}
            style={{ ...INPUT, width: 84 }}
          />

          <button
            onClick={addResource}
            style={{ height: 30, padding: '0 12px', borderRadius: 'var(--radius)', border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 'var(--text-xs)', cursor: 'pointer' }}
          >
            Add
          </button>
        </div>

        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <input
              ref={resourcesImportRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleImportResources}
              style={{ display: 'none' }}
            />
            <input
              ref={assignmentsImportRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleImportAssignments}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => resourcesImportRef.current?.click()}
              style={{ height: 30, padding: '0 10px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'none', color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)', cursor: 'pointer' }}
            >
              Import Resources
            </button>
            <button
              onClick={() => triggerCSVDownload(generateResourcesCsv(items), 'resources.csv')}
              style={{ height: 30, padding: '0 10px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'none', color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)', cursor: 'pointer' }}
            >
              Export Resources
            </button>
            <button
              onClick={() => assignmentsImportRef.current?.click()}
              style={{ height: 30, padding: '0 10px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'none', color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)', cursor: 'pointer' }}
            >
              Import Assignments
            </button>
            <button
              onClick={() => triggerCSVDownload(generateAssignmentsCsv(assignments), 'assignments.csv')}
              style={{ height: 30, padding: '0 10px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'none', color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)', cursor: 'pointer' }}
            >
              Export Assignments
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={onClose}
              style={{ height: 30, padding: '0 14px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'none', color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              disabled={hasValidationErrors}
              onClick={() => { onSave(items); onSaveAssignments(localAssignments); onClose() }}
              style={{
                height: 30,
                padding: '0 14px',
                borderRadius: 'var(--radius)',
                border: 'none',
                background: hasValidationErrors ? 'var(--color-border)' : 'var(--accent)',
                color: '#fff',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--weight-medium)',
                cursor: hasValidationErrors ? 'not-allowed' : 'pointer',
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
