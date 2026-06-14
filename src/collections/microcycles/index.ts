import type { CollectionConfig } from 'payload'

export const Microcycles: CollectionConfig = {
  slug: 'microcycles',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'rpe', 'order', 'plan'],
    group: 'Training plan',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Microcycle name',
    },
    {
      name: 'plan',
      type: 'relationship',
      relationTo: 'plans',
      required: true,
      label: 'Plan',
    },
    {
      name: 'rpe',
      type: 'number',
      label: 'RPE',
      admin: { description: 'Target RPE for the microcycle (6–9)' },
    },
    {
      name: 'order',
      type: 'number',
      label: 'Order',
      defaultValue: 0,
    },
  ],
}
