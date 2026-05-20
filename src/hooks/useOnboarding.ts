import { useCallback } from 'react'
import type { OnboardingPhase } from '../types'

/**
 * Onboarding state machine transitions.
 * State is owned by App and persisted via saveState — this hook only provides transition logic.
 *
 *   fresh → first_added  (when first task is added)
 *   first_added → baseline_tip  (when task count reaches 3+)
 *   baseline_tip → complete     (when baseline is locked)
 *   * → complete                (when "Load example data" is used — C5)
 */
export function useOnboarding(
  phase: OnboardingPhase,
  taskCount: number,
  setPhase: (p: OnboardingPhase) => void,
) {
  /** Call after a task is added. */
  const onTaskAdded = useCallback(() => {
    if (phase === 'fresh') {
      setPhase('first_added')
    } else if (phase === 'first_added' && taskCount >= 2) {
      // 3rd task (count is pre-add), transition after add
      setPhase('baseline_tip')
    }
  }, [phase, taskCount, setPhase])

  /** Call when task count changes (for deferred check). */
  const onTaskCountChange = useCallback((count: number) => {
    if (phase === 'first_added' && count >= 3) {
      setPhase('baseline_tip')
    }
  }, [phase, setPhase])

  /** Call when a baseline is locked. */
  const onBaselineLocked = useCallback(() => {
    if (phase !== 'complete') setPhase('complete')
  }, [phase, setPhase])

  /** Call when example data is loaded (C5 — skip to complete immediately). */
  const onExampleDataLoaded = useCallback(() => {
    setPhase('complete')
  }, [setPhase])

  return { onTaskAdded, onTaskCountChange, onBaselineLocked, onExampleDataLoaded }
}
