import React from 'react'

type WorkoutLogsNoticeProps = {
  id?: number | string
  payload: {
    count: (args: {
      collection: 'workout-logs'
      limit: number
      where: { workout: { equals: number | string } }
    }) => Promise<{ totalDocs: number }>
  }
}

export async function WorkoutLogsNotice({ id, payload }: WorkoutLogsNoticeProps) {
  if (!id || id === 'create') {
    return null
  }

  const workoutLogs = await payload.count({
    collection: 'workout-logs',
    limit: 1,
    where: { workout: { equals: id } },
  })

  if (workoutLogs.totalDocs === 0) {
    return null
  }

  return (
    <div
      style={{
        background: '#fff7ed',
        border: '1px solid #fdba74',
        borderRadius: 12,
        color: '#7c2d12',
        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
        marginBottom: 16,
        padding: '6px 10px',
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 1 }}>
        This workout has recorded logs.
      </div>
      <div style={{ color: '#9a3412', fontSize: 10, lineHeight: 1 }}>
        Workouts and exercises with recorded sets cannot be deleted. You can edit descriptions
        and add new exercises and groups.
      </div>
    </div>
  )
}
