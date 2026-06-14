import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import {
  Users,
  Clients,
  Media,
  Plans,
  Microcycles,
  Workouts,
  WorkoutGroups,
  WorkoutExerciseRows,
  WorkoutLogs,
  RoundLogs,
  SetLogs,
  Exercises,
} from './collections'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Clients,
    Media,
    Plans,
    Microcycles,
    Workouts,
    WorkoutGroups,
    WorkoutExerciseRows,
    WorkoutLogs,
    RoundLogs,
    SetLogs,
    Exercises,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    },
    logger: false,
  }),
  sharp,
})
