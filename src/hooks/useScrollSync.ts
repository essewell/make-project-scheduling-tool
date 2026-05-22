import { useRef, useCallback } from 'react'

/**
 * Returns refs to attach to the task-list and gantt scroll containers.
 * Keeps both containers in vertical sync without feedback loops.
 */
export function useScrollSync() {
  const listRef = useRef<HTMLDivElement>(null)
  const ganttRef = useRef<HTMLDivElement>(null)
  const histogramRef = useRef<HTMLDivElement>(null)
  // Mutex flag — set by the "winner" scroll event to suppress the mirrored update
  const syncing = useRef(false)

  const handleListScroll = useCallback(() => {
    if (syncing.current) return
    const list = listRef.current
    const gantt = ganttRef.current
    if (!list || !gantt) return
    syncing.current = true
    gantt.scrollTop = list.scrollTop
    requestAnimationFrame(() => { syncing.current = false })
  }, [])

  const handleGanttScroll = useCallback(() => {
    if (syncing.current) return
    const list = listRef.current
    const gantt = ganttRef.current
    const histogram = histogramRef.current
    if (!list || !gantt) return
    syncing.current = true
    list.scrollTop = gantt.scrollTop
    if (histogram) histogram.scrollLeft = gantt.scrollLeft
    requestAnimationFrame(() => { syncing.current = false })
  }, [])

  const handleHistogramScroll = useCallback(() => {
    if (syncing.current) return
    const histogram = histogramRef.current
    const gantt = ganttRef.current
    if (!histogram || !gantt) return
    syncing.current = true
    gantt.scrollLeft = histogram.scrollLeft
    requestAnimationFrame(() => { syncing.current = false })
  }, [])

  return { listRef, ganttRef, histogramRef, handleListScroll, handleGanttScroll, handleHistogramScroll }
}
