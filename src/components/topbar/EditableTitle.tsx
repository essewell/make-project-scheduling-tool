import { useState, useRef, useEffect, useCallback } from 'react'

interface EditableTitleProps {
  value: string
  onChange: (v: string) => void
}

export function EditableTitle({ value, onChange }: EditableTitleProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      setDraft(value)
      inputRef.current?.select()
    }
  }, [editing, value])

  const commit = useCallback(() => {
    const trimmed = draft.trim()
    if (trimmed) onChange(trimmed)
    setEditing(false)
  }, [draft, onChange])

  const cancel = useCallback(() => {
    setDraft(value)
    setEditing(false)
  }, [value])

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') { e.preventDefault(); commit() }
          if (e.key === 'Escape') { e.preventDefault(); cancel() }
        }}
        style={{
          height: 28,
          borderRadius: 'var(--radius)',
          border: '1px solid rgba(255,255,255,0.5)',
          background: 'rgba(255,255,255,0.12)',
          color: 'white',
          fontFamily: 'var(--font-sans)',
          fontWeight: 'var(--weight-semibold)',
          fontSize: 'var(--text-sm)',
          padding: '0 8px',
          width: 200,
          outline: 'none',
        }}
        autoFocus
      />
    )
  }

  return (
    <span
      onClick={() => setEditing(true)}
      title="Click to rename"
      style={{
        fontWeight: 'var(--weight-semibold)',
        fontSize: 'var(--text-sm)',
        color: 'white',
        cursor: 'text',
        padding: '2px 4px',
        borderRadius: 'var(--radius-sm)',
        transition: 'background 0.1s',
        maxWidth: 240,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        display: 'block',
      }}
      onMouseEnter={e => { (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.1)' }}
      onMouseLeave={e => { (e.target as HTMLElement).style.background = 'transparent' }}
    >
      {value}
    </span>
  )
}
