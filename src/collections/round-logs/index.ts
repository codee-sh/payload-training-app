import type { CollectionConfig } from 'payload'
import { adminOrOwnByClient, isAdmin } from '../../access'

export const RoundLogs: CollectionConfig = {
  slug: 'round-logs',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['session', 'group', 'roundNumber', 'status', 'client'],
    group: 'Training log',
  },
  access: {
    create: ({ req: { user } }) => Boolean(user),
    read: adminOrOwnByClient,
    update: adminOrOwnByClient,
    delete: isAdmin,
  },
  hooks: {
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
      name: 'group',
      type: 'relationship',
      relationTo: 'workout-groups',
      required: true,
      label: 'Group',
    },
    {
      name: 'client',
      type: 'relationship',
      relationTo: 'clients',
      label: 'Client',
      defaultValue: ({ user }) => (user?.collection === 'clients' ? user.id : undefined),
    },
    {
      name: 'roundNumber',
      type: 'number',
      label: 'Round number',
      required: true,
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
      name: 'status',
      type: 'select',
      label: 'Status',
      defaultValue: 'completed',
      options: [
        { label: 'Completed', value: 'completed' },
        { label: 'Partial', value: 'partial' },
        { label: 'Skipped', value: 'skipped' },
      ],
    },
  ],
}
