import type { ExerciseRow, Group, RawExerciseRow, Section, WorkoutStructureData } from './types'

export async function loadWorkoutStructure(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any,
  docId: number | string,
): Promise<WorkoutStructureData> {
  const workout = await payload.findByID({ collection: 'workouts', id: docId, depth: 0 })

  const groupsResult = await payload.find({
    collection: 'workout-groups',
    where: { workout: { equals: docId } },
    sort: 'order',
    limit: 500,
    depth: 0,
  })

  const groupIds = groupsResult.docs.map((g: Group) => g.id)

  const exerciseRowsResult = groupIds.length
    ? await payload.find({
        collection: 'workout-exercise-rows',
        where: { group: { in: groupIds } },
        sort: 'order',
        limit: 5000,
        depth: 1,
      })
    : { docs: [] }

  const exerciseRowIds = exerciseRowsResult.docs.map((r: RawExerciseRow) => r.id)

  const [roundLogsResult, setLogsResult] = await Promise.all([
    groupIds.length
      ? payload.find({ collection: 'round-logs', where: { group: { in: groupIds } }, limit: 5000, depth: 0 })
      : { docs: [] },
    exerciseRowIds.length
      ? payload.find({ collection: 'set-logs', where: { exerciseRow: { in: exerciseRowIds } }, limit: 5000, depth: 0 })
      : { docs: [] },
  ])

  const groupIdsWithLogs: number[] = [
    ...new Set(
      roundLogsResult.docs.map((r: { group: number | { id: number } }) =>
        typeof r.group === 'object' ? r.group.id : r.group
      ) as number[],
    ),
  ]

  const exerciseRowIdsWithLogs: number[] = [
    ...new Set(
      setLogsResult.docs.map((r: { exerciseRow: number | { id: number } }) =>
        typeof r.exerciseRow === 'object' ? r.exerciseRow.id : r.exerciseRow
      ) as number[],
    ),
  ]

  const sections: Section[] = (workout.sections ?? []) as Section[]

  const initialGroups: Group[] = groupsResult.docs.map((g: Group) => ({
    id: g.id,
    sectionRowId: g.sectionRowId ?? null,
    order: g.order ?? 0,
    label: g.label ?? null,
    protocol: g.protocol ?? 'standard',
    rounds: g.rounds ?? null,
    durationMinutes: g.durationMinutes ?? null,
    intervalSeconds: g.intervalSeconds ?? null,
    workSeconds: g.workSeconds ?? null,
    restSeconds: g.restSeconds ?? null,
    restBetweenRounds: g.restBetweenRounds ?? null,
  }))

  const initialExerciseRows: ExerciseRow[] = exerciseRowsResult.docs.map((r: RawExerciseRow) => ({
    id: r.id,
    group: typeof r.group === 'object' && r.group !== null ? r.group.id : (r.group ?? null),
    order: r.order ?? 0,
    numer: r.numer ?? null,
    rounds: r.rounds ?? null,
    exercise:
      r.exercise && typeof r.exercise === 'object'
        ? { id: (r.exercise as { id: number }).id, name: (r.exercise as { name?: string | null }).name ?? null }
        : null,
    note: r.note ?? null,
    reps: r.reps ?? null,
    kg: r.kg ?? null,
    tut: r.tut ?? null,
    rir: r.rir ?? null,
    rest: r.rest ?? null,
    durationMin: r.durationMin ?? null,
    durationSec: r.durationSec ?? null,
  }))

  return { sections, initialGroups, initialExerciseRows, groupIdsWithLogs, exerciseRowIdsWithLogs }
}
