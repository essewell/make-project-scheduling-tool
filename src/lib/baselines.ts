import type { Baseline } from '../types'

export function findBaselineById(baselines: Baseline[], baselineId: string): Baseline | null {
  return baselines.find((baseline) => baseline.id === baselineId) ?? null
}

type LockableBaseline = Baseline & { lockedAt?: string }

export function assertNotLocked(baseline: LockableBaseline): void {
  if (baseline.lockedAt && baseline.lockedAt.length > 0) {
    throw new Error(`Baseline "${baseline.name}" is locked and cannot be modified.`)
  }
}
