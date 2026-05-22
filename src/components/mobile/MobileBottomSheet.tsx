import { useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  SHEET_DISMISS_DELTA,
  SHEET_DISMISS_VELOCITY,
  SHEET_FULL_HEIGHT,
  SHEET_PEEK_HEIGHT,
  SHEET_TAP_THRESHOLD,
} from '../../constants'
import { useDialogA11y } from '../../hooks/useDialogA11y'

interface MobileBottomSheetProps {
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
}

type SheetState = 'peek' | 'full'

export function MobileBottomSheet({ open, title, onClose, children }: MobileBottomSheetProps) {
  const [sheetState, setSheetState] = useState<SheetState>('peek')
  const [dragOffset, setDragOffset] = useState(0)
  const [dragging, setDragging] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const pointerIdRef = useRef<number | null>(null)
  const dragStartYRef = useRef(0)
  const dragStartTimeRef = useRef(0)
  const dragDirectionRef = useRef(0)
  const titleId = useId()

  useDialogA11y({ containerRef: dialogRef, onClose })

  useEffect(() => {
    if (!open) {
      setSheetState('peek')
      setDragOffset(0)
      setDragging(false)
    }
  }, [open])

  const baseHeight = sheetState === 'full' ? SHEET_FULL_HEIGHT : SHEET_PEEK_HEIGHT

  const transform = useMemo(() => {
    if (!open) return 'translateY(100%)'
    return `translateY(${Math.max(0, dragOffset)}px)`
  }, [open, dragOffset])

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    pointerIdRef.current = event.pointerId
    dragStartYRef.current = event.clientY
    dragStartTimeRef.current = performance.now()
    dragDirectionRef.current = 0
    setDragging(true)
    setDragOffset(0)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || pointerIdRef.current !== event.pointerId) return
    const delta = event.clientY - dragStartYRef.current
    dragDirectionRef.current = delta

    if (sheetState === 'peek' && delta < 0) {
      setDragOffset(delta / 3)
      return
    }

    setDragOffset(Math.max(0, delta))
  }

  const finishDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId) return

    const delta = dragDirectionRef.current
    const elapsed = Math.max(1, performance.now() - dragStartTimeRef.current)
    const velocity = Math.abs(delta) / elapsed

    setDragging(false)
    setDragOffset(0)
    pointerIdRef.current = null
    event.currentTarget.releasePointerCapture(event.pointerId)

    if (Math.abs(delta) < SHEET_TAP_THRESHOLD) {
      setSheetState(prev => prev === 'peek' ? 'full' : 'peek')
      return
    }

    if (delta > 0 && (delta > SHEET_DISMISS_DELTA || velocity > SHEET_DISMISS_VELOCITY)) {
      if (sheetState === 'full') {
        setSheetState('peek')
      } else {
        onClose()
      }
      return
    }

    if (delta < 0 && (Math.abs(delta) > SHEET_DISMISS_DELTA || velocity > SHEET_DISMISS_VELOCITY)) {
      setSheetState('full')
      return
    }
  }

  if (!open) return null

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(10,18,30,0.4)',
          zIndex: 199,
        }}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 56,
          height: baseHeight,
          background: 'var(--color-surface)',
          borderTopLeftRadius: 'var(--radius-xl)',
          borderTopRightRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          zIndex: 200,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transform,
          transition: dragging ? 'none' : 'transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
          style={{
            padding: '10px 0 6px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            cursor: 'grab',
            touchAction: 'none',
            borderBottom: '1px solid var(--color-border-light)',
            background: 'var(--color-surface)',
          }}
        >
          <div
            style={{
              width: 40,
              height: 4,
              borderRadius: 999,
              background: 'var(--color-border)',
            }}
          />
          <div id={titleId} style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-tertiary)', fontWeight: 'var(--weight-semibold)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {title}
          </div>
        </div>
        <div style={{ minHeight: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
      </div>
    </>
  )
}
