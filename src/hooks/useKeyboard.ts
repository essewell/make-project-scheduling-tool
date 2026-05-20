import { useEffect, useCallback } from 'react'

interface UseKeyboardOptions {
  kbFocusId: string | null
  onNewTask: () => void
  onNavigate: (direction: 'up' | 'down') => void
  onSelect: (id: string) => void
  onOpenPanel: (id: string) => void
  onEscape: () => void
  onUndo: () => void
  onPostLog?: () => void   // Ctrl+Enter when note textarea is focused
}

/** Returns true if focus is inside an input/textarea/select/contenteditable. */
function inputFocused(): boolean {
  const el = document.activeElement
  if (!el) return false
  const tag = el.tagName.toLowerCase()
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return true
  if ((el as HTMLElement).isContentEditable) return true
  return false
}

function isNoteTextarea(): boolean {
  const el = document.activeElement
  return el?.tagName.toLowerCase() === 'textarea' && el.getAttribute('data-note') === 'true'
}

/**
 * Mounts a single keydown listener on window.
 * Guards non-Ctrl shortcuts against firing when an input is focused.
 */
export function useKeyboard({
  kbFocusId,
  onNewTask,
  onNavigate,
  onSelect,
  onOpenPanel,
  onEscape,
  onUndo,
  onPostLog,
}: UseKeyboardOptions) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const ctrl = e.ctrlKey || e.metaKey

    // ── Ctrl combos (always active) ──────────────────────────────────────────
    if (ctrl && e.key === 'z') {
      e.preventDefault()
      onUndo()
      return
    }

    if (ctrl && e.key === 'Enter') {
      if (isNoteTextarea() && onPostLog) {
        e.preventDefault()
        onPostLog()
      }
      return
    }

    // ── Escape (always active) ────────────────────────────────────────────────
    if (e.key === 'Escape') {
      onEscape()
      return
    }

    // ── Remaining shortcuts — guard against input focus ──────────────────────
    if (inputFocused()) return

    switch (e.key) {
      case 'n':
      case 'N':
        e.preventDefault()
        onNewTask()
        break

      case 'ArrowUp':
        e.preventDefault()
        onNavigate('up')
        break

      case 'ArrowDown':
        e.preventDefault()
        onNavigate('down')
        break

      case ' ':
        e.preventDefault()
        if (kbFocusId) onSelect(kbFocusId)
        break

      case 'Enter':
        e.preventDefault()
        if (kbFocusId) onOpenPanel(kbFocusId)
        break
    }
  }, [kbFocusId, onNewTask, onNavigate, onSelect, onOpenPanel, onEscape, onUndo, onPostLog])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
