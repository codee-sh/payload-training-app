/**
 * Eksportuje dane z bazy do pliku seed-data.json.
 * Pomija: Users, Clients, WorkoutLogs, RoundLogs, SetLogs.
 */
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'
import config from '../payload.config.js'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const OUTPUT = path.resolve(dirname, '../data/seed-data.json')

async function fetchAll<T>(
  payload: Awaited<ReturnType<typeof getPayload>>,
  collection: Parameters<typeof payload.find>[0]['collection'],
): Promise<T[]> {
  const result = await payload.find({
    collection,
    limit: 10000,
    depth: 0,
    pagination: false,
  } as Parameters<typeof payload.find>[0])
  return result.docs as T[]
}

async function run() {
  const payload = await getPayload({ config })

  payload.logger.info('Eksportowanie danych...')

  const exercises = await fetchAll(payload, 'exercises')
  payload.logger.info(`  exercises: ${exercises.length}`)

  const plans = await fetchAll(payload, 'plans')
  payload.logger.info(`  plans: ${plans.length}`)

  const microcycles = await fetchAll(payload, 'microcycles')
  payload.logger.info(`  microcycles: ${microcycles.length}`)

  const workouts = await fetchAll(payload, 'workouts')
  payload.logger.info(`  workouts: ${workouts.length}`)

  const workoutGroups = await fetchAll(payload, 'workout-groups')
  payload.logger.info(`  workout-groups: ${workoutGroups.length}`)

  const workoutExerciseRows = await fetchAll(payload, 'workout-exercise-rows')
  payload.logger.info(`  workout-exercise-rows: ${workoutExerciseRows.length}`)

  const seedData = {
    exportedAt: new Date().toISOString(),
    exercises,
    plans,
    microcycles,
    workouts,
    workoutGroups,
    workoutExerciseRows,
  }

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true })
  fs.writeFileSync(OUTPUT, JSON.stringify(seedData, null, 2), 'utf-8')

  payload.logger.info(`\nEksport zakończony → ${OUTPUT}`)
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
