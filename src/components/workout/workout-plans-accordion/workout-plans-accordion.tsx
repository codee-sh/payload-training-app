'use client'

import { useTranslations } from 'next-intl'
import React, { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { WorkoutTracker } from '@/components/workout/workout-tracker'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { Surface } from '@/components/ui/surface'
import { mutedTextClass, sectionLabelClass } from '@/lib/class-names'
import { STORAGE_KEY, SSR_SNAPSHOT } from '@/types/constants'
import type { TPlanAccordionItem } from '@/types/plan'

type Selection = {
  planId: number | string | null
  microcycleId: number | string | null
  workoutId: number | string | null
}

const subscribeToSelection = (onStoreChange: () => void) => {
  window.addEventListener('storage', onStoreChange)
  return () => window.removeEventListener('storage', onStoreChange)
}

const firstAvailableSelection = (plans: TPlanAccordionItem[]) => {
  const plan = plans[0]
  const microcycle = plan?.microcycles[0]
  const workout = microcycle?.workouts[0]

  return {
    microcycleId: microcycle?.id ?? null,
    planId: plan?.id ?? null,
    workoutId: workout?.id ?? null,
  }
}

const isValidSelection = (plans: TPlanAccordionItem[], selection: Selection) => {
  const plan = plans.find((item) => item.id === selection.planId)
  if (!plan) return false

  const microcycle = plan.microcycles.find((item) => item.id === selection.microcycleId)
  if (!microcycle) return false

  return microcycle.workouts.some((item) => item.id === selection.workoutId)
}

export function WorkoutPlansAccordion({ plans }: { plans: TPlanAccordionItem[] }) {
  const t = useTranslations('workout')
  const initialSelection = useMemo(() => firstAvailableSelection(plans), [plans])
  const [selection, setSelection] = useState<Selection | null>(null)
  const storedSelectionRaw = useSyncExternalStore(
    subscribeToSelection,
    () => window.localStorage.getItem(STORAGE_KEY),
    () => SSR_SNAPSHOT,
  )
  const storedSelection = useMemo(() => {
    if (storedSelectionRaw === SSR_SNAPSHOT || !storedSelectionRaw) return initialSelection

    try {
      return JSON.parse(storedSelectionRaw) as Selection
    } catch {
      window.localStorage.removeItem(STORAGE_KEY)
      return initialSelection
    }
  }, [initialSelection, storedSelectionRaw])

  const preferredSelection = selection ?? storedSelection
  const resolvedSelection = isValidSelection(plans, preferredSelection) ? preferredSelection : initialSelection

  useEffect(() => {
    if (storedSelectionRaw === SSR_SNAPSHOT) return
    if (!isValidSelection(plans, resolvedSelection)) return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(resolvedSelection))
  }, [plans, resolvedSelection, storedSelectionRaw])

  const selectPlan = (plan: TPlanAccordionItem) => {
    const nextMicrocycle = plan.microcycles[0] ?? null
    const nextWorkout = nextMicrocycle?.workouts[0] ?? null
    setSelection({
      planId: plan.id,
      microcycleId: nextMicrocycle?.id ?? null,
      workoutId: nextWorkout?.id ?? null,
    })
  }

  const selectMicrocycle = (plan: TPlanAccordionItem, microcycleId: number | string) => {
    const microcycle = plan.microcycles.find((item) => item.id === microcycleId) ?? null
    const nextWorkout = microcycle?.workouts[0] ?? null
    setSelection({
      planId: plan.id,
      microcycleId,
      workoutId: nextWorkout?.id ?? null,
    })
  }

  const activePlan = plans.find((plan) => plan.id === resolvedSelection.planId) ?? null
  const activeMicrocycle =
    activePlan?.microcycles.find((microcycle) => microcycle.id === resolvedSelection.microcycleId) ?? null
  const activeWorkout =
    activeMicrocycle?.workouts.find((workout) => workout.id === resolvedSelection.workoutId) ?? null

  return (
    <div className="space-y-2.5">
      <Surface className="overflow-hidden py-1">
        {plans.map((plan) => {
          const isActivePlan = plan.id === resolvedSelection.planId

          return (
            <div className="border-t border-ui-border-base first:border-t-0" key={plan.id}>
              <Button
                variant="ghost"
                className="flex w-full items-center justify-between gap-3 pl-0 pr-4 py-2 hover:bg-ui-bg-subtle/60"
                onClick={() => selectPlan(plan)}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-ui-fg-base">{plan.title}</span>
                    <StatusBadge status={plan.status}>{plan.statusLabel}</StatusBadge>
                  </div>
                  {plan.dateRange && <div className="mt-0.5 text-xs text-ui-fg-muted">{plan.dateRange}</div>}
                </div>
                <span className={`shrink-0 text-xs ${mutedTextClass}`}>{isActivePlan ? '−' : '+'}</span>
              </Button>

              {isActivePlan && (
                <div className="border-t border-ui-border-base bg-ui-bg-subtle/40 py-2 space-y-1.5">
                  {plan.description && (
                    <div className="text-sm text-ui-fg-muted">{plan.description}</div>
                  )}

                  <div className="flex gap-1.5">
                    {plan.microcycles.map((microcycle, idx) => {
                      const isActiveMicrocycle = microcycle.id === resolvedSelection.microcycleId
                      return (
                        <Button
                          key={microcycle.id}
                          size="sm"
                          variant={isActiveMicrocycle ? 'primary' : 'secondary'}
                          className="flex-1"
                          onClick={() => selectMicrocycle(plan, microcycle.id)}
                        >
                          M{idx + 1}({microcycle.workouts.length})
                        </Button>
                      )
                    })}
                  </div>

                  {activeMicrocycle && activeMicrocycle.workouts.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {activeMicrocycle.workouts.map((workout) => (
                        <Button
                          key={workout.id}
                          size="sm"
                          variant="secondary"
                          active={workout.id === resolvedSelection.workoutId}
                          onClick={() => setSelection({ ...resolvedSelection, workoutId: workout.id })}
                        >
                          {workout.title}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </Surface>

      {activePlan && activeMicrocycle && activeWorkout && (
        <div className="space-y-2.5">
          <div className="rounded-lg border border-ui-border-base bg-ui-bg-subtle/60 px-4 py-2">
            <div className={sectionLabelClass}>{t('activeContext')}</div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ui-fg-base">
              <span>{activePlan.title}</span>
              <span className={mutedTextClass}>/</span>
              <span>{activeMicrocycle.title}</span>
              <span className={mutedTextClass}>/</span>
              <span className="font-semibold">{activeWorkout.title}</span>
            </div>
          </div>

          <WorkoutTracker key={activeWorkout.id} workout={activeWorkout} />
        </div>
      )}
    </div>
  )
}
