import type { CollectionConfig } from 'payload'
import { adminOrOwnByClient } from '../../access'

export const WorkoutLogs: CollectionConfig = {
  slug: 'workout-logs',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'workout', 'startedAt', 'finishedAt', 'client'],
    group: 'Training log',
  },
  access: {
    create: ({ req: { user } }) => Boolean(user),
    read: adminOrOwnByClient,
    update: adminOrOwnByClient,
    delete: adminOrOwnByClient,
  },
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (req.user?.collection === 'clients') {
          data.client = req.user.id
        }
        if (operation === 'create' && !data.title && data.workout) {
          try {
            const w = await req.payload.findByID({
              collection: 'workouts',
              id: data.workout,
              depth: 0,
            })
            data.title = `${w?.title ?? 'Workout'} — ${new Date().toLocaleDateString('en-GB')}`
          } catch {
            /* title will remain empty — we do not block the save */
          }
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Session description',
      admin: { readOnly: true, description: 'Auto-generated' },
    },
    {
      name: 'workout',
      type: 'relationship',
      relationTo: 'workouts',
      required: true,
      label: 'Workout',
    },
    {
      name: 'client',
      type: 'relationship',
      relationTo: 'clients',
      label: 'Client',
      defaultValue: ({ user }) => (user?.collection === 'clients' ? user.id : undefined),
    },
    {
      name: 'startedAt',
      type: 'date',
      label: 'Started at',
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'finishedAt',
      type: 'date',
      label: 'Finished at',
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'General notes',
    },
  ],
}
