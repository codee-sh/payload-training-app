---
name: payload-build-collections
description: Step-by-step guide for adding a new Payload CMS collection to this project. Use when asked to create a new collection, add a new data type, or extend the backend schema.
---

# Payload — creating a new collection

Every collection lives in its own folder under `src/collections/{kebab-case}/`. Never create collection files directly inside `src/collections/`.

## Steps

### 1. Create the folder and collection file

```
src/collections/{kebab-case-name}/
├── index.ts       # CollectionConfig — always required
└── types.ts       # optional: only if the collection has its own domain types
```

Minimal `index.ts`:

```ts
import type { CollectionConfig } from 'payload'
import { isAdmin, isAuthenticated } from '../../access'

export const MyCollection: CollectionConfig = {
  slug: 'my-collection',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'updatedAt'],
    group: 'Panel group name',
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
  ],
}
```

### 2. Register in the barrel `src/collections/index.ts`

Add one line at the end of the export list:

```ts
export { MyCollection } from './my-collection'
```

`payload.config.ts` imports from this barrel — nothing else changes there.

### 3. Add to the collections array in `payload.config.ts`

```ts
import {
  // ... existing
  MyCollection,
} from './collections'

export default buildConfig({
  collections: [
    // ... existing
    MyCollection,
  ],
})
```

---

## Naming conventions

| What | How |
|---|---|
| Folder name | `kebab-case` — must match the collection slug |
| Export name | `PascalCase` — `export const WorkoutLogs` |
| Collection slug | `kebab-case` — `'workout-logs'` |
| Collection file | always `index.ts` |
| Domain types | `types.ts` in the same folder |
| Access import | always from `'../../access'` (two levels up) |

---

## Domain types — when and how

Create `types.ts` when the collection has:
- its own enums / select options used in multiple places
- types that the frontend needs to import

```ts
// src/collections/exercises/types.ts
export type TrackingType = 'strength' | 'cardio'
export const TRACKING = { ... }
export const trackingOptions = [...]
```

Import inside the collection's `index.ts`:
```ts
import { trackingOptions, DEFAULT_TRACKING } from './types'
```

Import from the frontend:
```ts
import type { TrackingType } from '@/collections/exercises/types'
```

---

## Access — available functions from `src/access/index.ts`

| Function | When to use |
|---|---|
| `isAdmin` | only trainer/admin can create, edit, delete |
| `isAuthenticated` | any logged-in user can read (admin + client) |
| `adminOrSelf` | admin sees everyone, client sees only themselves (use for the `clients` collection) |
| `adminOrOwnByClient` | admin sees everything, client sees only records where the `client` field points to them |

---

## Payload hooks — where to put them

Simple hooks (1-2 lines of logic) — inline in `index.ts`:

```ts
hooks: {
  beforeChange: [
    ({ data, req }) => {
      if (req.user?.collection === 'clients') data.client = req.user.id
      return data
    },
  ],
},
```

Complex hooks (custom queries, validations, side effects) — extract to `hooks.ts` in the same folder:

```ts
// src/collections/workout-logs/hooks.ts
export const autoAssignClient: CollectionBeforeChangeHook = async ({ data, req, operation }) => {
  // ...
}
```

```ts
// src/collections/workout-logs/index.ts
import { autoAssignClient } from './hooks'

hooks: {
  beforeChange: [autoAssignClient],
},
```

---

## Relationships between collections

```ts
{
  name: 'client',
  type: 'relationship',
  relationTo: 'clients',   // slug of the target collection
  required: true,
  label: 'Client',
}
```

Reverse relation (join) — on the parent collection's side:
```ts
{
  name: 'plans',
  type: 'join',
  collection: 'plans',
  on: 'client',            // the field in `plans` pointing back to this collection
  label: 'Client plans',
}
```

---

## Full example — collection with hook, types, and relationships

```
src/collections/progress-photos/
├── index.ts
└── types.ts
```

```ts
// types.ts
export type PhotoAngle = 'front' | 'side' | 'back'
export const PHOTO_ANGLE_OPTIONS: { label: string; value: PhotoAngle }[] = [
  { label: 'Front', value: 'front' },
  { label: 'Side', value: 'side' },
  { label: 'Back', value: 'back' },
]
```

```ts
// index.ts
import type { CollectionConfig } from 'payload'
import { isAdmin, adminOrOwnByClient } from '../../access'
import { PHOTO_ANGLE_OPTIONS } from './types'

export const ProgressPhotos: CollectionConfig = {
  slug: 'progress-photos',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['client', 'angle', 'takenAt'],
    group: 'Clients',
  },
  access: {
    create: ({ req: { user } }) => Boolean(user),
    read: adminOrOwnByClient,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        if (req.user?.collection === 'clients') data.client = req.user.id
        return data
      },
    ],
  },
  fields: [
    {
      name: 'client',
      type: 'relationship',
      relationTo: 'clients',
      label: 'Client',
      defaultValue: ({ user }) => (user?.collection === 'clients' ? user.id : undefined),
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Photo',
    },
    {
      name: 'angle',
      type: 'select',
      label: 'Angle',
      options: PHOTO_ANGLE_OPTIONS,
    },
    {
      name: 'takenAt',
      type: 'date',
      label: 'Date',
      admin: { date: { pickerAppearance: 'dayOnly' } },
    },
  ],
}
```

Register in `src/collections/index.ts`:
```ts
export { ProgressPhotos } from './progress-photos'
```

Add to `payload.config.ts`:
```ts
import { ..., ProgressPhotos } from './collections'

collections: [..., ProgressPhotos],
```
