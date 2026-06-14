import type { TWorkout } from './workout'

export type TPlanAccordionItem = {
  id: number | string
  title: string
  status: string
  statusLabel: string
  dateRange?: string | null
  description?: string | null
  microcycles: Array<{
    id: number | string
    title: string
    rpe?: number | null
    workouts: TWorkout[]
  }>
}
