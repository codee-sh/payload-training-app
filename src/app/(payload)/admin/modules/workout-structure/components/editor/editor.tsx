'use client'

import React, { useState } from 'react'
import { Button } from '@payloadcms/ui'
import type { ExerciseRow, Group, Section } from '../../types'
import { PROTOCOL_LABEL } from '../../constants'
import { exerciseLabel, exerciseMeta, groupLabel } from '../../utils'
import { s } from '../../styles'
import { GroupForm } from '../group-form'
import { ExerciseForm } from '../exercise-form'
import { useWorkoutMutations } from './hooks/use-workout-mutations'

type Props = {
  sections: Section[]
  initialGroups: Group[]
  initialExerciseRows: ExerciseRow[]
  groupIdsWithLogs?: number[]
  exerciseRowIdsWithLogs?: number[]
}

export function WorkoutStructureEditor({
  sections,
  initialGroups,
  initialExerciseRows,
  groupIdsWithLogs = [],
  exerciseRowIdsWithLogs = [],
}: Props) {
  const groupsWithLogs = new Set(groupIdsWithLogs)
  const exerciseRowsWithLogs = new Set(exerciseRowIdsWithLogs)
  const [groups, setGroups] = useState<Group[]>(initialGroups)
  const [exerciseRows, setExerciseRows] = useState<ExerciseRow[]>(initialExerciseRows)
  const [addingGroupFor, setAddingGroupFor] = useState<string | null>(null)
  const [editingGroup, setEditingGroup] = useState<number | null>(null)
  const [addingExerciseFor, setAddingExerciseFor] = useState<number | null>(null)
  const [editingExercise, setEditingExercise] = useState<number | null>(null)

  const { deleteGroup, deleteExercise, deletingGroup, deletingExercise } =
    useWorkoutMutations(setGroups, setExerciseRows)

  const sectionsWithFallback: Section[] =
    sections.length > 0 ? sections : [{ id: undefined, title: null, subtitle: null }]

  const groupsForSection = (sectionId: string | undefined) =>
    groups.filter((g) => g.sectionRowId === (sectionId ?? ''))

  const rowsForGroup = (groupId: number) =>
    exerciseRows.filter((r) => r.group === groupId).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  return (
    <div style={s.container}>

      {exerciseRowsWithLogs.size === 0 && (
        <div style={s.infoMsg}>
          No recorded sets for this workout. Adding the first set will create a session automatically.
        </div>
      )}

      {sectionsWithFallback.map((section, si) => {
        const sectionGroups = groupsForSection(section.id)
        const sectionKey = section.id ?? `no-section-${si}`
        const sectionLabel =
          [section.title, section.subtitle].filter(Boolean).join(' · ') || 'Untitled section'

        return (
          <div key={sectionKey} style={s.sectionBlock}>
            <div style={s.sectionHeader}>
              {sections.length > 0 ? sectionLabel : 'Workout groups'}
            </div>

            {sectionGroups.length === 0 && (
              <div style={s.empty}>No groups in this section.</div>
            )}

            {sectionGroups.map((group) => {
              const rows = rowsForGroup(group.id)

              return (
                <div key={group.id} style={s.groupCard}>
                  {editingGroup === group.id ? (
                    <GroupForm
                      sectionRowId={group.sectionRowId ?? undefined}
                      nextOrder={group.order ?? 0}
                      initial={group}
                      onSaved={(updated) => {
                        setGroups((prev) => prev.map((g) => g.id === updated.id ? { ...g, ...updated } : g))
                        setEditingGroup(null)
                      }}
                      onCancel={() => setEditingGroup(null)}
                    />
                  ) : (
                    <div style={s.groupHeader}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={s.groupTitle}>{group.label ?? PROTOCOL_LABEL[group.protocol ?? 'standard'] ?? group.protocol}</span>
                        <span style={s.groupMeta}>{groupLabel(group)}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <Button
                          buttonStyle="secondary"
                          margin={false}
                          onClick={() => {
                            setAddingGroupFor(null)
                            setAddingExerciseFor(null)
                            setEditingExercise(null)
                            setEditingGroup(group.id)
                          }}
                        >
                          Edit group
                        </Button>
                        {!groupsWithLogs.has(group.id) && (
                          <Button
                            buttonStyle="error"
                            margin={false}
                            disabled={deletingGroup === group.id}
                            onClick={() => {
                              if (confirm('Delete group and all its exercises?')) {
                                deleteGroup(group.id)
                              }
                            }}
                          >
                            {deletingGroup === group.id ? '…' : 'Delete group'}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {rows.length === 0 && editingGroup !== group.id && <div style={s.empty}>No exercises.</div>}

                  {rows.map((row) => (
                    <div key={row.id}>
                      {editingExercise === row.id ? (
                        <div style={{ padding: '6px 12px' }}>
                          <ExerciseForm
                            groupId={group.id}
                            nextOrder={row.order ?? 0}
                            initial={row}
                            onSaved={(updated) => {
                              setExerciseRows((prev) => prev.map((r) => r.id === updated.id ? { ...r, ...updated } : r))
                              setEditingExercise(null)
                            }}
                            onCancel={() => setEditingExercise(null)}
                          />
                        </div>
                      ) : (
                        <div style={row.id === rows[rows.length - 1]?.id ? { ...s.exerciseRow, borderBottom: 'none' } : s.exerciseRow}>
                          <span style={s.exerciseNumer}>{row.numer ?? '—'}</span>
                          <span style={s.exerciseName}>{exerciseLabel(row)}</span>
                          <span style={s.exerciseMeta}>{exerciseMeta(row)}</span>
                          <Button
                            buttonStyle="secondary"
                            size="xsmall"
                            margin={false}
                            onClick={() => {
                              setAddingExerciseFor(null)
                              setEditingGroup(null)
                              setEditingExercise(row.id)
                            }}
                          >
                            Edytuj
                          </Button>
                          {!exerciseRowsWithLogs.has(row.id) && (
                            <Button
                              buttonStyle="error"
                              size="xsmall"
                              margin={false}
                              disabled={deletingExercise === row.id}
                              onClick={() => {
                                if (confirm(`Delete exercise "${exerciseLabel(row)}"?`)) {
                                  deleteExercise(row.id)
                                }
                              }}
                            >
                              {deletingExercise === row.id ? '…' : 'Delete'}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  <div style={{ padding: '6px 12px 10px' }}>
                    {addingExerciseFor === group.id ? (
                      <ExerciseForm
                        groupId={group.id}
                        nextOrder={rows.length}
                        onSaved={(row) => {
                          setExerciseRows((prev) => [...prev, row])
                          setAddingExerciseFor(null)
                        }}
                        onCancel={() => setAddingExerciseFor(null)}
                      />
                    ) : (
                      <Button
                        buttonStyle="dashed"
                        margin={false}
                        onClick={() => {
                          setEditingExercise(null)
                          setAddingExerciseFor(group.id)
                        }}
                        extraButtonProps={{ style: { width: '100%', textAlign: 'left' } }}
                      >
                        + Add exercise
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}

            <div style={{ marginTop: 8 }}>
              {addingGroupFor === sectionKey ? (
                <GroupForm
                  sectionRowId={section.id}
                  nextOrder={sectionGroups.length}
                  onSaved={(group) => {
                    setGroups((prev) => [...prev, group])
                    setAddingGroupFor(null)
                  }}
                  onCancel={() => setAddingGroupFor(null)}
                />
              ) : (
                <Button
                  buttonStyle="dashed"
                  margin={false}
                  onClick={() => setAddingGroupFor(sectionKey)}
                  extraButtonProps={{ style: { width: '100%', textAlign: 'left' } }}
                >
                  + Add group to this section
                </Button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
