import type { CollectionConfig } from 'payload'
import { isAdmin, adminOrSelf, isAdminField } from '../../access'

export const Clients: CollectionConfig = {
  slug: 'clients',
  auth: true,
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email'],
    group: 'Accounts',
  },
  access: {
    create: isAdmin,
    read: adminOrSelf,
    update: adminOrSelf,
    delete: isAdmin,
    admin: () => false,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Full name',
    },
    {
      name: 'plans',
      type: 'join',
      collection: 'plans',
      on: 'client',
      label: "Client's plans",
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Trainer notes',
      access: {
        read: isAdminField,
        update: isAdminField,
      },
    },
  ],
}
