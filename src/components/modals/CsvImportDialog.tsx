import { useState, useRef, useCallback } from 'react'
import type { Task } from '../../types'
import { parseCSVText, csvRowsToTasks } from '../../lib/csv'
import type { CsvRow } from '../../lib/csv'

// ─── Props ────────────────────────────────────────────────────────────────────

interface CsvImportDialogProps {
  existingTasks: Task[]
  onImport: (tasks: Task[], mode: 'replace' | 'append') => void
  onClose: () => void
}

// ─── Types ────────────────────────────────────────────────────────────────────

type ImportMode = 'replace' | 'append'

type MappableField = keyof Task | 'skip'

const FIELD_OPTIONS: Array<{ value: MappableField; label: string }> = [
  { value: 'skip',         label: '— skip —' },
  { value: 'name',         label: 'Name' },
  { value: 'group',        label: 'Phase / Group' },
  { value: 's',            label: 'Start Date' },
  { value: 'e',            label: 'End Date' },
  { value: 'actualStart',  label: 'Actual Start' },
  { value: 'actualFinish', label: 'Actual Finish' },
  { value: 'pct',          label: 'Progress %' },
  { value: 'status',       label: 'Status' },
  { value: 'party',        label: 'Party' },
  { value: 'milestone',    label: 'Milestone' },
  { value: 'notes',        label: 'Notes' },
  { value: 'id',           label: 'ID' },
]

// ─── Styles ───────────────────────────────────────────────────────────────────

const OVERLAY: React.CSSProperties = {
  position: 'fixed', inset: 0,
  background: 'rgba(10,18,30,0.54)',
  backdropFilter: 'blur(3px)',
  zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
}

const BOX: React.CSSProperties = {
  width: 560, maxWidth: '95vw', maxHeight: '86vh',
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-xl)',
  display: 'flex', flexDirection: 'column', overflow: 'hidden',
  animation: 'schedule-slide-in 0.16s ease-out both',
}

const INPUT: React.CSSProperties = {
  height: 30, borderRadius: 'var(--radius)',
  border: '1px solid var(--color-border)',
  padding: '0 8px', fontSize: 'var(--text-xs)',
  fontFamily: 'var(--font-sans)',
  background: 'var(--color-surface)', color: 'var(--color-text-primary)',
  boxSizing: 'border-box',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function guessField(header: string): MappableField {
  const h = header.toLowerCase().replace(/[^a-z]/g, '')
  if (h.includes('name') || h === 'task') return 'name'
  if (h.includes('phase') || h.includes('group') || h.includes('wbs')) return 'group'
  if (h === 'start' || h === 'startdate' || h === 's') return 's'
  if (h === 'end' || h === 'finish' || h === 'enddate' || h === 'e') return 'e'
  if (h.includes('actualstart')) return 'actualStart'
  if (h.includes('actualfinish') || h.includes('actualend')) return 'actualFinish'
  if (h.includes('pct') || h.includes('progress') || h.includes('percent') || h.includes('complete')) return 'pct'
  if (h.includes('status')) return 'status'
  if (h.includes('party') || h.includes('responsible') || h.includes('owner')) return 'party'
  if (h.includes('milestone')) return 'milestone'
  if (h.includes('note') || h.includes('comment') || h.includes('description')) return 'notes'
  if (h === 'id') return 'id'
  return 'skip'
}

// ─── CsvImportDialog ──────────────────────────────────────────────────────────

export function CsvImportDialog({ existingTasks, onImport, onClose }: CsvImportDialogProps) {
  const [step, setStep] = useState<'upload' | 'map'>('upload')
  const [mode, setMode] = useState<ImportMode>('append')
  const [rawRows, setRawRows] = useState<CsvRow[]>([])
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [columnMap, setColumnMap] = useState<Record<string, MappableField>>({})
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processText = useCallback((text: string) => {
    const rows = parseCSVText(text)
    if (rows.length === 0) {
      setError('No data rows found in the CSV file.')
      return
    }
    const headers = Object.keys(rows[0] ?? {})
    const initialMap: Record<string, MappableField> = {}
    headers.forEach(h => { initialMap[h] = guessField(h) })
    setRawRows(rows)
    setCsvHeaders(headers)
    setColumnMap(initialMap)
    setError(null)
    setStep('map')
  }, [])

  const handleFileSelect = useCallback((file: File) => {
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setError('Please select a .csv file.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => processText(reader.result as string)
    reader.onerror = () => setError('Failed to read the file.')
    reader.readAsText(file)
  }, [processText])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }, [handleFileSelect])

  const handleImport = () => {
    const tasks = csvRowsToTasks(rawRows, columnMap, mode === 'append' ? existingTasks : [])
    if (tasks.length === 0) {
      setError('No tasks could be imported. Check your column mapping.')
      return
    }
    onImport(tasks, mode)
    onClose()
  }

  const previewRows = rawRows.slice(0, 4)
  const importCount = rawRows.length

  return (
    <div style={OVERLAY} onClick={onClose}>
      <div style={BOX} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-sm)' }}>
            Import CSV
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', marginTop: 2 }}>
            {step === 'upload' ? 'Upload a CSV file to import tasks' : `${importCount} row${importCount !== 1 ? 's' : ''} found — map your columns`}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>

          {/* Step 1: Upload */}
          {step === 'upload' && (
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragging ? 'var(--accent)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: '32px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: dragging ? 'var(--color-selected-bg)' : 'var(--color-surface-2)',
                  transition: 'border-color 0.12s, background 0.12s',
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>📄</div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 4 }}>
                  Drop your CSV here
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                  or click to browse
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f) }}
                />
              </div>

              {error && (
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-danger)', padding: '6px 10px', background: 'var(--color-danger-dim)', borderRadius: 'var(--radius-sm)' }}>
                  {error}
                </div>
              )}

              {/* Mode selector */}
              <div>
                <div style={{ fontSize: 'var(--text-2xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                  Import Mode
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['append', 'replace'] as ImportMode[]).map(m => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      style={{
                        flex: 1, height: 34, borderRadius: 'var(--radius)',
                        border: `1px solid ${mode === m ? 'var(--accent)' : 'var(--color-border)'}`,
                        background: mode === m ? 'var(--accent)' : 'var(--color-surface-2)',
                        color: mode === m ? '#fff' : 'var(--color-text-secondary)',
                        fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)',
                        cursor: 'pointer', transition: 'all 0.12s',
                      }}
                    >
                      {m === 'append' ? 'Append to existing' : 'Replace all tasks'}
                    </button>
                  ))}
                </div>
                {mode === 'replace' && (
                  <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-warning)', marginTop: 6 }}>
                    Replace will remove all {existingTasks.length} existing task{existingTasks.length !== 1 ? 's' : ''}.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Column mapping */}
          {step === 'map' && (
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>

              {error && (
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-danger)', padding: '6px 10px', background: 'var(--color-danger-dim)', borderRadius: 'var(--radius-sm)' }}>
                  {error}
                </div>
              )}

              {/* Column mapping grid */}
              <div>
                <div style={{ fontSize: 'var(--text-2xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                  Column Mapping
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {csvHeaders.map(header => (
                    <div key={header} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, alignItems: 'center' }}>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)' }}>
                        {header}
                      </div>
                      <select
                        value={columnMap[header] ?? 'skip'}
                        onChange={e => setColumnMap(prev => ({ ...prev, [header]: e.target.value as MappableField }))}
                        style={{ ...INPUT, width: '100%' }}
                      >
                        {FIELD_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview table */}
              {previewRows.length > 0 && (
                <div>
                  <div style={{ fontSize: 'var(--text-2xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                    Preview (first {previewRows.length} rows)
                  </div>
                  <div style={{ overflowX: 'auto', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}>
                    <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 'var(--text-2xs)' }}>
                      <thead>
                        <tr style={{ background: 'var(--color-surface-2)' }}>
                          {csvHeaders.map(h => (
                            <th key={h} style={{ padding: '5px 8px', textAlign: 'left', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap', borderBottom: '1px solid var(--color-border)' }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewRows.map((row, i) => (
                          <tr key={i} style={{ borderBottom: i < previewRows.length - 1 ? '1px solid var(--color-border-light)' : undefined }}>
                            {csvHeaders.map(h => (
                              <td key={h} style={{ padding: '5px 8px', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {row[h] ?? ''}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {importCount > 4 && (
                    <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-dim)', marginTop: 4 }}>
                      …and {importCount - 4} more rows
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {step === 'map' && (
              <button
                onClick={() => { setStep('upload'); setError(null) }}
                style={{ height: 30, padding: '0 12px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'none', color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)', cursor: 'pointer' }}
              >
                ← Back
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={onClose}
              style={{ height: 30, padding: '0 14px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'none', color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)', cursor: 'pointer' }}
            >
              Cancel
            </button>
            {step === 'map' && (
              <button
                onClick={handleImport}
                style={{ height: 30, padding: '0 14px', borderRadius: 'var(--radius)', border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)', cursor: 'pointer' }}
              >
                Import {importCount} task{importCount !== 1 ? 's' : ''}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
