import { METRIC_FIELDS, type MetricField } from '@/collections/exercises/types'
import type { SetLog, Values } from '@/types/workout'
import { fmtSec } from './date'

export const metricBody = (fields: MetricField[], v: Values): Record<string, unknown> => {
  const body: Record<string, unknown> = {}

  for (const f of fields) {
    const meta = METRIC_FIELDS[f]
    if (meta.composite === 'duration') {
      const mins = (v[`${f}__min`] ?? '').trim()
      const secs = (v[`${f}__sec`] ?? '').trim()
      body[f] = mins === '' && secs === '' ? null : (Number(mins) || 0) * 60 + (Number(secs) || 0)
      continue
    }

    if (f === 'weight' && v['weight__bodyweight'] === 'true') {
      body.weight = null
      continue
    }

    const raw = (v[f] ?? '').trim()
    if (raw === '') {
      body[f] = null
    } else if (meta.units) {
      const unit = v[`${f}__unit`] || meta.units.default
      const factor = meta.units.options.find((o) => o.value === unit)?.factor ?? 1
      body[f] = Number(raw) * factor
    } else {
      body[f] = meta.numeric ? Number(raw) : raw
    }
  }

  body.isBodyweight = v['weight__bodyweight'] === 'true'
  body.note = v.note?.trim() || null
  return body
}

export const toDefaultUnit = (f: MetricField, base: number): { value: string; unit: string } => {
  const meta = METRIC_FIELDS[f]
  if (!meta.units) return { value: String(base), unit: '' }
  const unit = meta.units.default
  const factor = meta.units.options.find((o) => o.value === unit)?.factor ?? 1
  return { value: String(base / factor), unit }
}

export const setSummary = (s: SetLog): string => {
  const parts: string[] = []
  if (s.isBodyweight) parts.push('MC')
  else if (s.weight != null) parts.push(`${s.weight} kg`)
  if (s.distanceM != null) parts.push(`${s.distanceM} m`)
  if (s.durationSec != null) parts.push(fmtSec(s.durationSec))
  if (s.reps) parts.push(`× ${s.reps}`)
  if (s.rir) parts.push(`RIR ${s.rir}`)
  if (s.note) parts.push(s.note)
  return parts.length ? parts.join(' · ') : '—'
}

export const setLogToFormValues = (set: SetLog, fields: MetricField[]): Values => {
  const initial: Values = { note: set.note ?? '' }
  if (set.isBodyweight) initial['weight__bodyweight'] = 'true'

  for (const f of fields) {
    const v = (set as Record<string, unknown>)[f]
    if (v == null) {
      initial[f] = ''
    } else if (METRIC_FIELDS[f].composite === 'duration') {
      const base = Number(v)
      initial[`${f}__min`] = String(Math.floor(base / 60))
      initial[`${f}__sec`] = String(base % 60)
    } else if (METRIC_FIELDS[f].units) {
      const conv = toDefaultUnit(f, Number(v))
      initial[f] = conv.value
      initial[`${f}__unit`] = conv.unit
    } else {
      initial[f] = String(v)
    }
  }
  return initial
}
