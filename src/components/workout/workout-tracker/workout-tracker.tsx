'use client'

import React, { useEffect, useRef, useState } from 'react'
import type { MetricField } from '@/collections/exercises/types'
import { errorBannerClass, mutedTextClass, panelClass, sectionLabelClass } from '@/lib/class-names'
import { ExerciseCard } from '@/components/workout/exercise-card'
import { SessionTimesBadge, SessionTimesForm } from '@/components/workout/session-times'
import type { Session, SetLog, TExercise, TWorkout, Values } from '@/types/workout'
import { metricBody } from '@/lib/metrics'
import { sdk } from '@/lib/sdk'

export function WorkoutTracker({ workout }: { workout: TWorkout }) {
  const [session, setSession] = useState<Session | null>(null)
  const [sets, setSets] = useState<SetLog[]>([])
  const [timeEditorOpen, setTimeEditorOpen] = useState(false)
  const [loadedWorkoutId, setLoadedWorkoutId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const hasLoadedWorkout = loadedWorkoutId === workout.id
  const displayedSession = hasLoadedWorkout ? session : null
  const displayedSets = hasLoadedWorkout ? sets : []

  useEffect(() => {
    let active = true

    sdk.find({ collection: 'workout-logs', where: { workout: { equals: workout.id } }, limit: 1, depth: 0, sort: '-updatedAt' })
      .then(async (result) => {
        if (!active) return
        const s = (result.docs[0] ?? null) as Session | null

        if (!s) {
          setSession(null)
          setSets([])
          setLoadedWorkoutId(workout.id)
          return
        }

        setSession(s)
        const setsResult = await sdk.find({ collection: 'set-logs', where: { session: { equals: s.id } }, limit: 500, depth: 0, sort: 'setNumber' })
        if (!active) return

        setSets(setsResult.docs as unknown as SetLog[])
        setLoadedWorkoutId(workout.id)
      })
      .catch((e) => {
        if (!active) return
        setError(e instanceof Error ? e.message : 'Błąd ładowania sesji')
        setLoadedWorkoutId(workout.id)
      })

    return () => {
      active = false
    }
  }, [workout.id])

  const creating = useRef<Promise<Session> | null>(null)
  const ensureSession = async (): Promise<Session> => {
    if (displayedSession) return displayedSession
    if (!creating.current) {
      creating.current = sdk
        .create({ collection: 'workout-logs', data: { workout: workout.id } as never })
        .then((doc) => {
          const s = doc as unknown as Session
          setSession(s)
          setLoadedWorkoutId(workout.id)
          return s
        })
    }
    return creating.current
  }

  const setTime = async (field: 'startedAt' | 'finishedAt', iso: string | null) => {
    try {
      const s = await ensureSession()
      const doc = await sdk.update({ collection: 'workout-logs', id: s.id, data: { [field]: iso } as never })
      setSession(doc as unknown as Session)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Błąd zapisu czasu')
    }
  }

  const saveTimes = async (startedAt: string | null, finishedAt: string | null) => {
    try {
      const s = await ensureSession()
      const doc = await sdk.update({ collection: 'workout-logs', id: s.id, data: { startedAt, finishedAt } as never })
      setSession(doc as unknown as Session)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Błąd zapisu czasu')
    }
  }

  const setsForRow = (rowId: string) =>
    displayedSets
      .filter((s) => String(s.exerciseRow) === rowId)
      .sort((a, b) => (a.setNumber ?? 0) - (b.setNumber ?? 0))

  const onAdd = async (ex: TExercise, fields: MetricField[], v: Values) => {
    try {
      const s = await ensureSession()
      const setNumber = setsForRow(ex.rowId).length + 1
      const doc = await sdk.create({
        collection: 'set-logs',
        depth: 0,
        data: {
          session: s.id,
          exercise: ex.exerciseId ?? undefined,
          exerciseName: ex.exerciseName,
          exerciseRow: Number(ex.rowId),
          setNumber,
          ...metricBody(fields, v),
        } as never,
      })
      setSets((prev) => [...prev, doc as unknown as SetLog])
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Błąd zapisu serii')
    }
  }

  const onUpdate = async (id: number, fields: MetricField[], v: Values) => {
    try {
      const doc = await sdk.update({ collection: 'set-logs', id, depth: 0, data: metricBody(fields, v) as never })
      setSets((prev) => prev.map((s) => (s.id === id ? { ...s, ...(doc as unknown as SetLog) } : s)))
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Błąd aktualizacji serii')
    }
  }

  const onDelete = async (id: number) => {
    try {
      await sdk.delete({ collection: 'set-logs', id })
      setSets((prev) => prev.filter((s) => s.id !== id))
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Błąd usunięcia serii')
    }
  }

  return (
    <div className={`mb-3 px-4 py-3 ${panelClass}`}>
      <div className="flex items-center justify-between gap-3 border-b border-ui-border-base pb-2.5 text-sm font-semibold text-ui-fg-base">
        <span>
          <span className="break-words">{workout.title}</span>
          {workout.rpe != null && <span className={mutedTextClass}> · RPE {workout.rpe}</span>}
        </span>
        <SessionTimesBadge
          session={displayedSession}
          open={timeEditorOpen}
          onOpen={() => setTimeEditorOpen((p) => !p)}
        />
      </div>

      {timeEditorOpen && (
        <SessionTimesForm
          session={displayedSession}
          onSet={setTime}
          onSave={saveTimes}
          onClose={() => setTimeEditorOpen(false)}
        />
      )}

      {error && (
        <div className={`mt-2 ${errorBannerClass}`} role="alert">
          {error}
          <button
            className="ml-3 underline opacity-70 hover:opacity-100"
            onClick={() => setError(null)}
          >
            ✕
          </button>
        </div>
      )}

      {hasLoadedWorkout && !displayedSession && (
        <div className={`mt-3 text-xs ${mutedTextClass}`}>
          Brak zapisanych serii dla tego treningu. Dodanie pierwszej serii utworzy sesję automatycznie.
        </div>
      )}

      {workout.sections.map((section, si) => (
        <div className="mt-3" key={si}>
          {(section.title || section.subtitle) && (
            <div className="mb-2 text-sm font-semibold text-ui-fg-interactive">
              {section.title}
              {section.subtitle ? ` · ${section.subtitle}` : ''}
            </div>
          )}
          {section.groups.map((group, gi) => (
            <div className="my-2 mb-3" key={gi}>
              {group.label && <div className={`mb-1 ${sectionLabelClass}`}>{group.label}</div>}
              {group.exercises.map((ex) => (
                <ExerciseCard
                  key={ex.rowId}
                  ex={ex}
                  sets={setsForRow(ex.rowId)}
                  onAdd={onAdd}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                />
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
