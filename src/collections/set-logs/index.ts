import type { CollectionConfig } from 'payload'
import { adminOrOwnByClient } from '../../access'
import { trackingFields, ALL_METRIC_FIELDS } from '../exercises/types'

export const SetLogs: CollectionConfig = {
  slug: 'set-logs',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['exerciseName', 'setNumber', 'weight', 'reps', 'client'],
    group: 'Training log',
  },
  access: {
    create: ({ req: { user } }) => Boolean(user),
    read: adminOrOwnByClient,
    update: adminOrOwnByClient,
    delete: adminOrOwnByClient,
  },
  hooks: {
    beforeValidate: [
      async ({ data, req }) => {
        if (!data) return data
        if (req.user?.collection === 'clients' && data.session) {
          const session = await req.payload.findByID({
            collection: 'workout-logs',
            id: data.session,
            depth: 0,
          })
          const owner = typeof session.client === 'object' ? session.client?.id : session.client
          if (owner !== req.user.id) {
            throw new Error('You cannot log sets to someone else\'s session.')
          }
        }
        if (data.exercise) {
          const ex = await req.payload.findByID({
            collection: 'exercises',
            id: data.exercise,
            depth: 0,
          })
          const allowed = trackingFields(ex?.trackingType)
          for (const f of ALL_METRIC_FIELDS) {
            if (!allowed.includes(f) && data[f] != null) data[f] = null
          }
        }
        return data
      },
    ],
    beforeChange: [
      ({ data, req }) => {
        if (req.user?.collection === 'clients') {
          data.client = req.user.id
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'session',
      type: 'relationship',
      relationTo: 'workout-logs',
      required: true,
      label: 'Session',
    },
    {
      name: 'client',
      type: 'relationship',
      relationTo: 'clients',
      label: 'Client',
      defaultValue: ({ user }) => (user?.collection === 'clients' ? user.id : undefined),
    },
    {
      name: 'exercise',
      type: 'relationship',
      relationTo: 'exercises',
      label: 'Exercise (catalog)',
    },
    {
      name: 'exerciseName',
      type: 'text',
      label: 'Exercise (name, snapshot)',
    },
    {
      name: 'exerciseRow',
      type: 'relationship',
      relationTo: 'workout-exercise-rows',
      label: 'Exercise row in workout',
      admin: { readOnly: true },
    },
    {
      name: 'roundLog',
      type: 'relationship',
      relationTo: 'round-logs',
      label: 'Round',
      admin: { readOnly: true },
    },
    {
      name: 'setNumber',
      type: 'number',
      label: 'Set number',
    },
    {
      name: 'weight',
      type: 'number',
      label: 'Weight (kg)',
    },
    {
      name: 'isBodyweight',
      type: 'checkbox',
      label: 'Bodyweight',
      defaultValue: false,
    },
    {
      name: 'distanceM',
      type: 'number',
      label: 'Distance (m)',
    },
    {
      name: 'durationSec',
      type: 'number',
      label: 'Duration (s)',
    },
    {
      name: 'reps',
      type: 'text',
      label: 'Reps',
    },
    {
      name: 'rir',
      type: 'text',
      label: 'RIR',
    },
    {
      name: 'note',
      type: 'text',
      label: 'Note',
    },
    {
      name: 'completedAt',
      type: 'date',
      label: 'Completed',
      defaultValue: () => new Date().toISOString(),
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
  ],
}
