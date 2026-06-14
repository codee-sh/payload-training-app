import { APIError, type CollectionConfig } from 'payload'
import { isAdmin, isAuthenticated } from '../../access'

const PROTOCOL_OPTIONS = [
  { label: 'None (inherits from group)', value: '' },
  { label: 'Standard', value: 'standard' },
  { label: 'EMOM', value: 'emom' },
  { label: 'AMRAP', value: 'amrap' },
  { label: 'For Time', value: 'for_time' },
  { label: 'Tabata', value: 'tabata' },
]

export const WorkoutExerciseRows: CollectionConfig = {
  slug: 'workout-exercise-rows',
  admin: {
    useAsTitle: 'numer',
    defaultColumns: ['numer', 'exercise', 'group', 'reps', 'kg'],
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
        const result = await req.payload.count({
          collection: 'set-logs',
          where: { exerciseRow: { equals: id } },
        })
        if (result.totalDocs > 0) {
          throw new APIError(
            'Cannot delete an exercise that already has logged sets. Create a new version of the workout instead of modifying the existing one.',
            400,
          )
        }
      },
    ],
  },
  fields: [
    {
      name: 'group',
      type: 'relationship',
      relationTo: 'workout-groups',
      required: true,
      label: 'Group',
    },
    {
      name: 'order',
      type: 'number',
      label: 'Order',
      defaultValue: 0,
    },
    {
      name: 'numer',
      type: 'text',
      label: 'Number',
      admin: { description: 'e.g. "1a", "2b"' },
    },
    {
      name: 'exercise',
      type: 'relationship',
      relationTo: 'exercises',
      label: 'Exercise (catalog)',
      admin: { description: 'Link to the catalog — for video and progress tracking' },
    },
    {
      name: 'note',
      type: 'text',
      label: 'Note / variant',
    },
    {
      type: 'row',
      fields: [
        { name: 'rounds', type: 'text', label: 'Sets', admin: { width: '25%', description: 'e.g. 4, 3-4' } },
        { name: 'reps', type: 'text', label: 'Reps', admin: { width: '25%' } },
        { name: 'kg', type: 'text', label: 'KG', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'tut', type: 'text', label: 'TUT', admin: { width: '33%' } },
        { name: 'rir', type: 'text', label: 'RIR', admin: { width: '33%' } },
        { name: 'rest', type: 'text', label: 'Rest', admin: { width: '34%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'durationMin',
          type: 'number',
          label: 'Duration — minutes',
          min: 0,
          admin: { width: '50%' },
        },
        {
          name: 'durationSec',
          type: 'number',
          label: 'Duration — seconds',
          min: 0,
          max: 59,
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'setParameters',
      type: 'array',
      label: 'Per-set parameters',
      labels: { singular: 'Set', plural: 'Sets' },
      admin: {
        description: 'Fill in only for drop sets / pyramids. Empty = all sets identical.',
        initCollapsed: true,
      },
      fields: [
        { name: 'setNumber', type: 'number', label: 'Set number', required: true },
        { name: 'reps', type: 'text', label: 'Reps' },
        { name: 'kg', type: 'text', label: 'KG' },
      ],
    },
    {
      name: 'override',
      type: 'group',
      label: 'Group protocol override',
      admin: { description: 'Leave empty if the exercise inherits the protocol from the group.' },
      fields: [
        {
          name: 'protocol',
          type: 'select',
          label: 'Protocol',
          options: PROTOCOL_OPTIONS,
        },
        { name: 'rounds', type: 'text', label: 'Sets / rounds' },
        { name: 'durationMinutes', type: 'number', label: 'Duration (minutes)', min: 0 },
        { name: 'intervalSeconds', type: 'number', label: 'Interval (s)', min: 1 },
        { name: 'workSeconds', type: 'number', label: 'Work time (s)', min: 1 },
        { name: 'restSeconds', type: 'number', label: 'Rest (s)', min: 0 },
      ],
    },
  ],
}
