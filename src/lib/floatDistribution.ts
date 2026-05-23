import type { Task } from '../types'

export interface FloatBucket {
  key: string
  label: string
  min: number
  max: number | null
}

export interface FloatBucketCount extends FloatBucket {
  count: number
}

const FLOAT_BUCKETS: FloatBucket[] = [
  { key: 'neg', label: '<0', min: Number.NEGATIVE_INFINITY, max: -1 },
  { key: 'zero', label: '0', min: 0, max: 0 },
  { key: '1-5', label: '1–5', min: 1, max: 5 },
  { key: '6-10', label: '6–10', min: 6, max: 10 },
  { key: '11-20', label: '11–20', min: 11, max: 20 },
  { key: '21-50', label: '21–50', min: 21, max: 50 },
  { key: '51-100', label: '51–100', min: 51, max: 100 },
  { key: 'gt100', label: '>100', min: 101, max: null },
]

function bucketIndexForFloat(value: number): number {
  for (let index = 0; index < FLOAT_BUCKETS.length; index += 1) {
    const bucket = FLOAT_BUCKETS[index]!
    const inMin = value >= bucket.min
    const inMax = bucket.max === null ? true : value <= bucket.max
    if (inMin && inMax) return index
  }
  return 0
}

export function buildFloatDistribution(
  tasks: Task[],
  totalFloatByTaskId: Map<string, number>,
): FloatBucketCount[] {
  const counts = FLOAT_BUCKETS.map((bucket) => ({ ...bucket, count: 0 }))

  tasks.forEach((task) => {
    const totalFloat = totalFloatByTaskId.get(task.id)
    if (typeof totalFloat !== 'number' || Number.isNaN(totalFloat)) return
    const index = bucketIndexForFloat(totalFloat)
    counts[index]!.count += 1
  })

  return counts
}
