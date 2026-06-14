import { APIError, type CollectionConfig } from 'payload'
import { isAdmin, isAuthenticated } from '../../access'

const PROTOCOL_OPTIONS = [
  { label: 'Standard', value: 'standard' },
  { label: 'EMOM', value: 'emom' },
  { label: 'AMRAP', value: 'amrap' },
  { label: 'For Time', value: 'for_time' },
  { label: 'Tabata', value: 'tabata' },
]

export const WorkoutGroups: CollectionConfig = {
  slug: 'workout-groups',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['workout', 'protocol', 'rounds', 'order'],
    group: 'Training plan',
  },
  access: {
    create: isAdmin,
    read: isAuthenticated,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeDelete: [
      async ({ id, req }) => {
        const rows = await req.payload.find({
          collection: 'workout-exercise-rows',
          where: { group: { equals: id } },
          limit: 1000,
          depth: 0,
        })
        const rowIds = rows.docs.map((r) => r.id)
        if (rowIds.length === 0) return

        const logs = await req.payload.count({
          collection: 'set-logs',
          where: { exerciseRow: { in: rowIds } },
        })
        if (logs.totalDocs > 0) {
          throw new APIError(
            'Cannot delete a group that has exercises with logged sets.',
            400,
          )
        }
      },
    ],
  },
  fields: [
    {
      name: 'workout',
      type: 'relationship',
      relationTo: 'workouts',
      required: true,
      label: 'Workout',
    },
    {
      name: 'sectionRowId',
      type: 'text',
      label: 'Section ID',
      admin: { description: 'Row ID of the section from workout.sections' },
    },
    {
      name: 'label',
      type: 'text',
      label: 'Group name',
      admin: { description: 'e.g. "Upper superset", "Main part A" (optional)' },
    },
    {
      name: 'order',
      type: 'number',
      label: 'Order',
      defaultValue: 0,
    },
    {
      name: 'protocol',
      type: 'select',
      label: 'Protocol',
      defaultValue: 'standard',
      options: PROTOCOL_OPTIONS,
    },
    {
      name: 'rounds',
      type: 'text',
      label: 'Sets / rounds',
      admin: { description: 'e.g. "4", "1-3"' },
    },
    {
      name: 'durationMinutes',
      type: 'number',
      label: 'Duration (minutes)',
      min: 0,
      admin: { description: 'Used for AMRAP' },
    },
    {
      name: 'intervalSeconds',
      type: 'number',
      label: 'Interval (s)',
      min: 1,
      admin: { description: 'Used for EMOM — default 60' },
      defaultValue: 60,
    },
    {
      name: 'workSeconds',
      type: 'number',
      label: 'Work time (s)',
      min: 1,
      admin: { description: 'Used for Tabata — default 20' },
      defaultValue: 20,
    },
    {
      name: 'restSeconds',
      type: 'number',
      label: 'Rest (s)',
      min: 0,
      admin: { description: 'Used for Tabata — default 10' },
      defaultValue: 10,
    },
    {
      name: 'restBetweenRounds',
      type: 'text',
      label: 'Rest between rounds',
      admin: { description: 'Rest after completing a full round/circuit' },
    },
  ],
}
