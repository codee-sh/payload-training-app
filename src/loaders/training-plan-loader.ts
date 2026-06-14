import { headers as getHeaders } from 'next/headers.js'
import { getTranslations } from 'next-intl/server'
import { getPayload } from 'payload'

import config from '@/payload.config'
import { STATUS_LABEL } from '@/types/constants'
import type { TPlanAccordionItem } from '@/types/plan'
import type { TWorkout } from '@/types/workout'

type LoadResult =
  | { user: { id: number | string; name?: string | null; email?: string | null }; plans: TPlanAccordionItem[] }
  | { user: null }

export async function loadTrainingPlans(): Promise<LoadResult> {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  if (!user || user.collection !== 'clients') {
    return { user: null }
  }

  const t = await getTranslations('home')

  const plans = await payload.find({
    collection: 'plans',
    where: { client: { equals: user.id } },
    sort: '-createdAt',
    depth: 0,
    limit: 100,
  })

  const planIds = plans.docs.map((p) => p.id)

  const microcycles = planIds.length
    ? await payload.find({
        collection: 'microcycles',
        where: { plan: { in: planIds } },
        sort: 'order',
        depth: 0,
        limit: 500,
      })
    : { docs: [] }

  const mcIds = microcycles.docs.map((m) => m.id)

  const workouts = mcIds.length
    ? await payload.find({
        collection: 'workouts',
        where: { microcycle: { in: mcIds } },
        sort: 'order',
        depth: 0,
        limit: 1000,
      })
    : { docs: [] }

  const workoutIds = workouts.docs.map((w) => w.id)

  const workoutGroups = workoutIds.length
    ? await payload.find({
        collection: 'workout-groups',
        where: { workout: { in: workoutIds } },
        sort: 'order',
        depth: 0,
        limit: 10000,
      })
    : { docs: [] }

  const groupIds = workoutGroups.docs.map((g) => g.id)

  const exerciseRows = groupIds.length
    ? await payload.find({
        collection: 'workout-exercise-rows',
        where: { group: { in: groupIds } },
        sort: 'order',
        depth: 1,
        limit: 10000,
      })
    : { docs: [] }

  const relId = (rel: unknown): number | string | undefined =>
    rel && typeof rel === 'object' ? (rel as { id: number | string }).id : (rel as number | string)

  const mcByPlan = (planId: number | string) =>
    microcycles.docs.filter((m) => relId(m.plan) === planId)
  const woByMc = (mcId: number | string) =>
    workouts.docs.filter((w) => relId(w.microcycle) === mcId)
  const groupsByWorkout = (workoutId: number | string) =>
    workoutGroups.docs.filter((g) => relId(g.workout) === workoutId)
  const rowsByGroup = (groupId: number | string) =>
    exerciseRows.docs.filter((r) => relId(r.group) === groupId)

  const fmtDuration = (min?: number | null, sec?: number | null): string | null => {
    const m = min ?? 0
    const s = sec ?? 0
    if (!m && !s) return null
    const p: string[] = []
    if (m) p.push(`${m} min`)
    if (s) p.push(`${s} sek`)
    return p.join(' ')
  }

  const ok = (v?: string | null) => v && v.trim() !== '' && v.trim().toLowerCase() !== 'x'

  const exMeta = (ex: {
    rounds?: string | null
    reps?: string | null
    durationMin?: number | null
    durationSec?: number | null
    rest?: string | null
    tut?: string | null
    rir?: string | null
    kg?: string | null
  }): string[] => {
    const parts: string[] = []
    if (ok(ex.rounds)) parts.push(`${t('seriesPrefix')}: ${ex.rounds}`)
    if (ok(ex.reps)) parts.push(`${t('repsPrefix')}: ${ex.reps}`)
    const dur = fmtDuration(ex.durationMin, ex.durationSec)
    if (dur) parts.push(`${t('durationPrefix')}: ${dur}`)
    if (ok(ex.rest)) parts.push(`${t('restPrefix')}: ${ex.rest}`)
    if (ok(ex.tut)) parts.push(`TUT: ${ex.tut}`)
    if (ok(ex.rir)) parts.push(`RIR: ${ex.rir}`)
    if (ok(ex.kg)) parts.push(`${ex.kg} kg`)
    return parts
  }

  const groupLabel = (g: (typeof workoutGroups.docs)[number]): string => {
    if (g.label) return g.label as string
    const protocol = g.protocol as string
    const rounds = g.rounds as string | null | undefined
    const durationMinutes = g.durationMinutes as number | null | undefined

    if (protocol === 'emom') return rounds ? `EMOM · ${rounds} min` : 'EMOM'
    if (protocol === 'amrap') return durationMinutes ? `AMRAP · ${durationMinutes} min` : 'AMRAP'
    if (protocol === 'for_time') return rounds ? `For Time · ${rounds} rund` : 'For Time'
    if (protocol === 'tabata') return 'Tabata'
    return rounds ? `${rounds} serie` : ''
  }

  const serializeWorkout = (w: (typeof workouts.docs)[number]): TWorkout => {
    const sections = (w.sections ?? []) as Array<{
      id?: string
      title?: string | null
      subtitle?: string | null
    }>

    const groups = groupsByWorkout(w.id)

    return {
      id: w.id,
      title: w.title,
      rpe: w.rpe ?? null,
      sections: sections.map((section) => {
        const sectionGroups = groups.filter(
          (g) => (g.sectionRowId as string | null | undefined) === section.id,
        )

        return {
          title: section.title ?? null,
          subtitle: section.subtitle ?? null,
          groups: sectionGroups.map((group) => {
            const rows = rowsByGroup(group.id)

            return {
              protocol: (group.protocol as string) ?? 'standard',
              label: groupLabel(group),
              exercises: rows.map((ex) => {
                const cat =
                  ex.exercise && typeof ex.exercise === 'object'
                    ? (ex.exercise as { id: number; name?: string; trackingType?: string; videoUrl?: string })
                    : null
                const name = cat?.name || ex.note || ''
                const extraNote = cat && ex.note && ex.note !== cat.name ? ex.note : null

                return {
                  rowId: String(ex.id),
                  numer: (ex.numer as string | null) ?? null,
                  name,
                  note: extraNote as string | null,
                  exerciseId: cat?.id ?? null,
                  exerciseName: name,
                  trackingType: cat?.trackingType ?? null,
                  videoUrl: (cat?.videoUrl as string | null | undefined) ?? null,
                  rounds: (ex.rounds as string | null) ?? null,
                  meta: exMeta(ex as Parameters<typeof exMeta>[0]),
                  prefill: {
                    reps: (ex.reps as string | null) ?? null,
                    rir: (ex.rir as string | null) ?? null,
                  },
                  setParameters:
                    (ex.setParameters as Array<{ setNumber: number; reps?: string | null; kg?: string | null }> | null | undefined) ?? null,
                }
              }),
            }
          }),
        }
      }),
    }
  }

  const accordionPlans: TPlanAccordionItem[] = plans.docs.map((plan) => {
    const status = (plan.status as string) || 'active'

    return {
      id: plan.id,
      title: plan.title,
      status,
      statusLabel: STATUS_LABEL[status] || status,
      dateRange:
        plan.startDate || plan.endDate
          ? [plan.startDate, plan.endDate]
              .map((d) => (d ? new Date(d).toLocaleDateString('pl-PL') : '…'))
              .join(' – ')
          : null,
      description: plan.description ?? null,
      microcycles: mcByPlan(plan.id).map((mc) => ({
        id: mc.id,
        title: mc.title,
        rpe: mc.rpe ?? null,
        workouts: woByMc(mc.id).map((w) => serializeWorkout(w)),
      })),
    }
  })

  return {
    user: { id: user.id, name: user.name ?? null, email: user.email ?? null },
    plans: accordionPlans,
  }
}
