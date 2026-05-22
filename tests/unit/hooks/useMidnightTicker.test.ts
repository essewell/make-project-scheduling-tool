import { StrictMode } from 'react'
import { renderHook, act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

let todayValue = '2026-05-22'

vi.mock('../../../src/lib/dates', () => ({
  todayStr: () => todayValue,
  msToNextMidnight: () => 1_000,
}))

import { useMidnightTicker } from '../../../src/hooks/useMidnightTicker'

describe('useMidnightTicker', () => {
  beforeEach(() => {
    todayValue = '2026-05-22'
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('cleans up pending timeout on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout')
    const { unmount } = renderHook(() => useMidnightTicker())

    expect(vi.getTimerCount()).toBe(1)
    unmount()

    expect(clearTimeoutSpy).toHaveBeenCalled()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('reschedules and updates the day at midnight tick', () => {
    const { result } = renderHook(() => useMidnightTicker())
    expect(result.current).toBe('2026-05-22')

    todayValue = '2026-05-23'
    act(() => {
      vi.advanceTimersByTime(1_000)
    })

    expect(result.current).toBe('2026-05-23')
    expect(vi.getTimerCount()).toBe(1)
  })

  it('does not leak duplicate timers in StrictMode', () => {
    const { unmount } = renderHook(() => useMidnightTicker(), {
      wrapper: StrictMode,
    })

    expect(vi.getTimerCount()).toBe(1)
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})
