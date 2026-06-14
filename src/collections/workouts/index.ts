import { APIError, type CollectionConfig } from 'payload'

const hasWorkoutLogs = async (
  req: {
    payload: {
      count: (args: {
        collection: 'workout-logs'
        limit: number
        where: { workout: { equals: number | string } }
      }) => Promise<{ totalDocs: number }>
    }
  },
  workoutId: number | string,
) => {
  const result = await req.payload.count({
    collection: 'workout-logs',
    limit: 1,
    where: { workout: { equals: workoutId } },
  })

  return result.totalDocs > 0
}

export const Workouts: CollectionConfig = {
  slug: 'workouts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'rpe', 'order', 'microcycle'],
    group: 'Training plan',
    components: {
      views: {
        edit: {
          structure: {
            Component: {
              path: '@/app/(payload)/admin/modules/workout-structure/workout-structure',
              exportName: 'WorkoutStructureView',
            },
            path: '/structure',
            tab: {
              label: 'Structure',
              href: '/structure',
            },
          },
        },
      },
    },
  },
  hooks: {
    beforeDelete: [
      async ({ id, req }) => {
        if (await hasWorkoutLogs(req, id)) {
          throw new APIError(
            'Cannot delete a workout that already has logged sessions. Delete the logs first or create a new version of the workout.',
            400,
          )
        }
      },
    ],
  },
  fields: [
    {
      name: 'workoutLogsNotice',
      type: 'ui',
      admin: {
        components: {
          Field: {
            path: '@/app/(payload)/admin/modules/workout-logs-notice/workout-logs-notice',
            exportName: 'WorkoutLogsNotice',
          },
        },
      },
      label: '',
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Workout name',
    },
    {
      name: 'microcycle',
      type: 'relationship',
      relationTo: 'microcycles',
      required: true,
      label: 'Microcycle',
    },
    {
      name: 'rpe',
      type: 'number',
      label: 'RPE',
    },
    {
      name: 'order',
      type: 'number',
      label: 'Order',
      defaultValue: 0,
    },
    {
      name: 'sections',
      type: 'array',
      label: 'Sections',
      labels: { singular: 'Section', plural: 'Sections' },
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Section title',
          admin: { description: 'e.g. Warm-up, Main part' },
        },
        {
          name: 'subtitle',
          type: 'text',
          label: 'Subtitle',
          admin: { description: 'e.g. Upper Body, EMOM' },
        },
      ],
    },
  ],
}
