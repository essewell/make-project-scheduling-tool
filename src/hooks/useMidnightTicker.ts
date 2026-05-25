import { useState, useEffect, useRef } from 'react'
import { todayStr, msToNextMidnight } from '../lib/dates'

/**
 * Returns today's date string (YYYY-MM-DD) and re-renders at each midnight.
 * Uses a self-rescheduling setTimeout to avoid drift.
 */
export function useMidnightTicker(onMidnightTick?: () => void): string {
  const [today, setToday] = useState<string>(todayStr)
  const onMidnightTickRef = useRef(onMidnightTick)

  useEffect(() => {
    onMidnightTickRef.current = onMidnightTick
  }, [onMidnightTick])

  useEffect(() => {
    let id: ReturnType<typeof setTimeout>

    function scheduleNext() {
      const ms = msToNextMidnight(100)
      id = setTimeout(() => {
        setToday(todayStr())
        onMidnightTickRef.current?.()
        scheduleNext()
      }, ms)
    }

    scheduleNext()
    return () => clearTimeout(id)
  }, [])

  return today
}
