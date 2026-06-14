---
name: payload-build-modules
description: Step-by-step guide for adding a custom admin view or field component to this Payload CMS project. Use when asked to create a new admin panel view, custom tab, or custom field UI.
---

# Payload — creating a custom admin module

Custom admin components (views, tabs, field UIs) live under `src/app/(payload)/admin/modules/{feature-name}/`. Payload references them via path string + `exportName` — never via JS imports from outside the module.

---

## Full module structure

```
src/app/(payload)/admin/modules/{feature-name}/
├── {feature-name}.tsx          # entry point — server component, guard + render only
├── loader.ts                   # all payload queries + data transforms (when > 1 query)
├── types.ts                    # local types (including the loader return type)
├── constants.ts                # local constants
├── styles.ts                   # inline style objects if needed
├── utils/
│   ├── validate.ts             # field validators
│   ├── format.ts               # label/display helpers
│   └── index.ts                # export * from each file
└── components/
    └── {component-name}/       # every React component gets its own folder
        ├── {component-name}.tsx
        ├── index.ts            # export * from './{component-name}'
        └── hooks/              # (optional) when component has ≥ 2 mutations or complex state
            └── use-{feature}-mutations.ts
```

---

## Steps

### 1. Create the entry point

The entry point is a **server component**. It does two things only: guard (early return if no doc yet) and render. All data fetching goes to `loader.ts`.

```tsx
// src/app/(payload)/admin/modules/workout-structure/workout-structure.tsx
import React from 'react'
import { loadWorkoutStructure } from './loader'
import { WorkoutStructureEditor } from './components/editor'

export async function WorkoutStructureView({
  initPageResult,
  payload,
}: {
  initPageResult?: { docID?: number | string }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any
}) {
  const docId = initPageResult?.docID

  if (!docId || docId === 'create' || !payload) {
    return (
      <div style={{ padding: '24px', color: 'var(--theme-elevation-500)', fontSize: 14 }}>
        Najpierw zapisz rekord, aby zarządzać strukturą.
      </div>
    )
  }

  const data = await loadWorkoutStructure(payload, docId)
  return <WorkoutStructureEditor {...data} />
}
```

### 2. Register in the collection config

Reference via path string. The path must point to the exact file, not an `index.ts`.

```ts
// src/collections/workouts/index.ts
admin: {
  components: {
    views: {
      edit: {
        structure: {
          Component: {
            path: '@/app/(payload)/admin/modules/workout-structure/workout-structure',
            exportName: 'WorkoutStructureView',
          },
          path: '/structure',
          tab: { label: 'Struktura', href: '/structure' },
        },
      },
    },
  },
},
```

After registering, run:
```bash
pnpm payload generate:importmap
```

### 3. Create `loader.ts` (when > 1 query or data transform needed)

A plain async function — not a hook. Takes `payload` and the document ID, returns a typed result matching the main client component's props.

```ts
// loader.ts
import type { ExerciseRow, Group, Section, WorkoutStructureData } from './types'

export async function loadWorkoutStructure(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any,
  docId: number | string,
): Promise<WorkoutStructureData> {
  const workout = await payload.findByID({ collection: 'workouts', id: docId, depth: 0 })

  const groupsResult = await payload.find({
    collection: 'workout-groups',
    where: { workout: { equals: docId } },
    sort: 'order',
    limit: 500,
    depth: 0,
  })

  // ... remaining queries + transforms

  return { sections, initialGroups, initialExerciseRows, groupIdsWithLogs, exerciseRowIdsWithLogs }
}
```

**Rule:** extract `loader.ts` when the entry point has > 1 `payload` query OR maps/transforms raw results. A single `payload.count()` with no transform can stay inline in the entry point.

### 4. Add types

Always add a `WorkoutStructureData`-style type that matches the main client component's props. This is what `loader.ts` returns and the entry point spreads.

```ts
// types.ts
export type WorkoutStructureData = {
  sections: Section[]
  initialGroups: Group[]
  initialExerciseRows: ExerciseRow[]
  groupIdsWithLogs: number[]
  exerciseRowIdsWithLogs: number[]
}
```

### 5. Create components — one folder per component

Every React component gets its own kebab-case folder with an `index.ts` barrel. No flat `.tsx` files directly in `components/`.

```
components/
├── editor/
│   ├── editor.tsx
│   ├── index.ts            # export * from './editor'
│   └── hooks/
│       └── use-workout-mutations.ts
├── exercise-form/
│   ├── exercise-form.tsx
│   └── index.ts
└── group-form/
    ├── group-form.tsx
    └── index.ts
```

The main client component (`editor.tsx`) is `'use client'` — it receives data from the server entry point and manages UI state.

Helper files used by only one component (e.g. a popover, a schema, a sub-item) go **flat inside that component's folder** — not in a sub-folder.

### 6. Extract mutations to a hook (when ≥ 2 mutations share loading state)

```ts
// components/editor/hooks/use-workout-mutations.ts
'use client'

import { useState } from 'react'
import { toast } from '@payloadcms/ui'
import { sdk } from '@/lib/sdk'
import type { ExerciseRow, Group } from '../../../types'

export function useWorkoutMutations(
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>,
  setExerciseRows: React.Dispatch<React.SetStateAction<ExerciseRow[]>>,
) {
  const [deletingGroup, setDeletingGroup] = useState<number | null>(null)
  const [deletingExercise, setDeletingExercise] = useState<number | null>(null)

  const deleteGroup = async (groupId: number) => {
    setDeletingGroup(groupId)
    try {
      await sdk.delete({ collection: 'workout-groups', id: groupId })
      setGroups((prev) => prev.filter((g) => g.id !== groupId))
      toast.success('Usunięto')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Błąd')
    } finally {
      setDeletingGroup(null)
    }
  }

  // ... deleteExercise

  return { deleteGroup, deleteExercise, deletingGroup, deletingExercise }
}
```

Hook placement: `components/{main-component}/hooks/use-{feature}-mutations.ts`. Only create `hooks/` subfolder when there are ≥ 2 mutations or the loading-state logic repeats.

---

## Shared admin utilities

Field schema helpers shared across multiple modules go in:

```
src/app/(payload)/admin/utils/fields.ts
```

Import from there instead of defining locally:

```ts
import { textField } from '@/app/(payload)/admin/utils/fields'
```

Currently available:

| Helper | Description |
|---|---|
| `textField(name, label, placeholder?)` | Creates a `TextFieldClient` config object for use with Payload `<TextField>` |

---

## Key rules

| Rule | Detail |
|---|---|
| No `index.ts` at module root | Payload uses path string — a barrel here is dead code |
| Entry point = guard + render only | Never put `payload.find()` calls in the entry file |
| `loader.ts` = plain async function | Not a hook — it runs on the server |
| One folder per component | Mirror Medusa dashboard pattern — no flat `.tsx` in `components/` |
| Hooks subfolder inside component | `components/{name}/hooks/` — not a module-level `hooks/` |
| `utils/` at module level | For validators, formatters, label helpers |
| `utils/fields.ts` at admin level | For Payload field schema helpers shared across modules |
| `generate:importmap` after registration | Run `pnpm payload generate:importmap` whenever a new `path:` is added |

---

## Naming conventions

| What | Convention | Example |
|---|---|---|
| Module folder | `kebab-case` | `workout-structure/` |
| Entry file | `{module-name}.tsx` | `workout-structure.tsx` |
| Exported function | `PascalCase` + `View` / `Field` suffix | `WorkoutStructureView` |
| Component folders | `kebab-case` | `exercise-form/` |
| Hook files | `use-{feature}-{type}.ts` | `use-workout-mutations.ts` |
| Loader function | `load{FeatureName}` camelCase | `loadWorkoutStructure` |
| Data type (loader return) | `{FeatureName}Data` | `WorkoutStructureData` |
