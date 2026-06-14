export type TExercise = {
  rowId: string
  numer?: string | null
  name: string
  note?: string | null
  exerciseId?: number | null
  exerciseName: string
  trackingType?: string | null
  videoUrl?: string | null
  rounds?: string | null
  meta: string[]
  prefill: { reps?: string | null; rir?: string | null }
  setParameters?: Array<{ setNumber: number; reps?: string | null; kg?: string | null }> | null
}

export type TGroup = {
  protocol: string
  label: string
  exercises: TExercise[]
}

export type TSection = { title?: string | null; subtitle?: string | null; groups: TGroup[] }
export type TWorkout = { id: number; title: string; rpe?: number | null; sections: TSection[] }

export type Session = { id: number; startedAt?: string | null; finishedAt?: string | null }

export type SetLog = {
  id: number
  exerciseRow?: number | null
  setNumber?: number | null
  weight?: number | null
  isBodyweight?: boolean | null
  distanceM?: number | null
  durationSec?: number | null
  reps?: string | null
  rir?: string | null
  note?: string | null
}

export type Values = Record<string, string>
