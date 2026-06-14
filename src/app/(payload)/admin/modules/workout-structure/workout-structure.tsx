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
        Save the workout first to manage its structure.
      </div>
    )
  }

  const data = await loadWorkoutStructure(payload, docId)
  return <WorkoutStructureEditor {...data} />
}
