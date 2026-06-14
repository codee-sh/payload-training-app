import type { CollectionConfig } from 'payload'
import { isAdmin, isAuthenticated } from '../../access'
import { trackingOptions, DEFAULT_TRACKING } from './types'

export const Exercises: CollectionConfig = {
  slug: 'exercises',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'muscleGroup', 'equipment'],
    group: 'Catalog',
  },
  access: {
    create: isAdmin,
    read: isAuthenticated,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Name',
    },
    {
      name: 'trackingType',
      type: 'select',
      label: 'Tracking type',
      defaultValue: DEFAULT_TRACKING,
      options: trackingOptions,
      admin: { description: 'Determines which fields are shown in the set logging form' },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Technical description',
    },
    {
      name: 'videoUrl',
      type: 'text',
      label: 'Video (link)',
      admin: { description: 'URL to instructional video (e.g. YouTube)' },
    },
    {
      name: 'muscleGroup',
      type: 'text',
      label: 'Muscle group',
    },
    {
      name: 'equipment',
      type: 'text',
      label: 'Equipment',
    },
  ],
}
