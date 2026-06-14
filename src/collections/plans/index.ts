import type { CollectionConfig } from 'payload'
import { isAdmin, adminOrOwnByClient } from '../../access'

export const Plans: CollectionConfig = {
  slug: 'plans',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'client', 'status', 'updatedAt'],
    group: 'Training plan',
  },
  access: {
    create: isAdmin,
    read: adminOrOwnByClient,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'client',
      type: 'relationship',
      relationTo: 'clients',
      label: 'Client (plan owner)',
      admin: { position: 'sidebar' },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      defaultValue: 'active',
      admin: { position: 'sidebar' },
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Paused', value: 'paused' },
        { label: 'Completed', value: 'completed' },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'startDate',
          type: 'date',
          label: 'Start date',
          admin: { width: '50%', date: { pickerAppearance: 'dayOnly' } },
        },
        {
          name: 'endDate',
          type: 'date',
          label: 'End date',
          admin: { width: '50%', date: { pickerAppearance: 'dayOnly' } },
        },
      ],
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Plan name',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
    },
    {
      name: 'source',
      type: 'text',
      label: 'Source (file)',
      admin: { description: 'Where the plan was imported from' },
    },
  ],
}
