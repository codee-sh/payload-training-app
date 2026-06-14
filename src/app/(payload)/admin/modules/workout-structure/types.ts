export type Section = { id?: string; title?: string | null; subtitle?: string | null }

export type Group = {
  id: number
  sectionRowId?: string | null
  order?: number | null
  label?: string | null
  protocol?: string | null
  rounds?: string | null
  durationMinutes?: number | null
  intervalSeconds?: number | null
  workSeconds?: number | null
  restSeconds?: number | null
  restBetweenRounds?: string | null
}

export type ExerciseRow = {
  id: number
  group?: number | null
  order?: number | null
  numer?: string | null
  exercise?: { id: number; name?: string | null } | null
  note?: string | null
  rounds?: string | null
  reps?: string | null
  kg?: string | null
  tut?: string | null
  rir?: string | null
  rest?: string | null
  durationMin?: number | null
  durationSec?: number | null
}

export type RawExerciseRow = Omit<ExerciseRow, 'group' | 'exercise'> & {
  group?: number | { id: number } | null
  exercise?: { id: number; name?: string | null } | number | null
}

export type WorkoutStructureData = {
  sections: Section[]
  initialGroups: Group[]
  initialExerciseRows: ExerciseRow[]
  groupIdsWithLogs: number[]
  exerciseRowIdsWithLogs: number[]
}
