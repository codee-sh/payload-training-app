'use client'

import { useTranslations } from 'next-intl'
import React, { useState, useCallback } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { METRIC_FIELDS, type MetricField } from '@/collections/exercises/types'
import { errorBannerClass, mutedTextClass } from '@/lib/class-names'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/input'
import type { Values } from '@/types/workout'

function parseMmSs(raw: string): { min: string; sec: string } {
  const clean = raw.replace(/[^\d:]/g, '')
  if (clean.includes(':')) {
    const [m, s] = clean.split(':')
    return { min: m ?? '', sec: s ?? '' }
  }
  if (clean.length <= 2) return { min: clean, sec: '' }
  return { min: clean.slice(0, -2), sec: clean.slice(-2) }
}

function formatMmSs(min: string, sec: string): string {
  if (!min && !sec) return ''
  return `${String(min || '0').padStart(2, '0')}:${String(sec || '0').padStart(2, '0')}`
}

function DurationInput({
  initialMin,
  initialSec,
  autoFocus,
  onCommit,
  className,
}: {
  initialMin: string
  initialSec: string
  autoFocus?: boolean
  onCommit: (min: string, sec: string) => void
  className?: string
}) {
  const [display, setDisplay] = useState(() => formatMmSs(initialMin, initialSec))

  const handleBlur = () => {
    const { min, sec } = parseMmSs(display)
    const formatted = formatMmSs(min, sec)
    setDisplay(formatted)
    onCommit(min, sec)
  }

  return (
    <Input
      variant="compact"
      type="text"
      inputMode="numeric"
      placeholder="00:00"
      autoFocus={autoFocus}
      value={display}
      className={className}
      onChange={(e) => setDisplay(e.target.value)}
      onBlur={handleBlur}
    />
  )
}

export function SeriesForm({
  fields,
  initial,
  onSubmit,
  onCancel,
}: {
  fields: MetricField[]
  initial: Values
  onSubmit: (v: Values) => Promise<void>
  onCancel?: () => void
}) {
  const t = useTranslations('seriesForm')
  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ defaultValues: initial })

  const isBodyweight = useWatch({ control, name: 'weight__bodyweight' }) === 'true'
  const toggleBodyweight = useCallback(() => {
    setValue('weight__bodyweight', isBodyweight ? 'false' : 'true')
    if (!isBodyweight) setValue('weight', '')
  }, [isBodyweight, setValue])

  const validateAtLeastOne = () => {
    const vals = getValues()
    const filled = fields.some((f) => {
      const meta = METRIC_FIELDS[f]
      if (meta.composite === 'duration') {
        return (vals[`${f}__min`] ?? '').trim() !== '' || (vals[`${f}__sec`] ?? '').trim() !== ''
      }
      return (vals[f] ?? '').trim() !== ''
    })
    return filled || t('atLeastOneValue')
  }

  const submit = handleSubmit(async (data) => {
    await onSubmit(data)
  })

  const firstField = fields[0]

  return (
    <form className="mt-1.5 flex flex-col gap-2" onSubmit={submit} noValidate>
      <div className="flex flex-wrap gap-2">
        {fields.map((f, i) => {
          const meta = METRIC_FIELDS[f]
          const isFirst = f === firstField

          if (meta.composite === 'duration') {
            const minKey = `${f}__min` as keyof Values
            const secKey = `${f}__sec` as keyof Values
            return (
              <div className="flex flex-col gap-1" key={f}>
                <span className={`text-xs ${mutedTextClass}`}>{meta.label}</span>
                <input type="hidden" {...register(minKey, isFirst ? { validate: validateAtLeastOne } : {})} />
                <input type="hidden" {...register(secKey)} />
                <DurationInput
                  initialMin={String(initial[minKey] ?? '')}
                  initialSec={String(initial[secKey] ?? '')}
                  autoFocus={i === 0}
                  onCommit={(min, sec) => {
                    setValue(minKey, min)
                    setValue(secKey, sec)
                  }}
                />
              </div>
            )
          }

          if (meta.units) {
            return (
              <div className="flex flex-col gap-1" key={f}>
                <span className={`text-xs ${mutedTextClass}`}>{meta.label}</span>
                <span className="inline-flex items-stretch gap-1">
                  <Input
                    variant="compact-unit"
                    type="number"
                    step="any"
                    placeholder={meta.placeholder}
                    autoFocus={i === 0}
                    {...register(f, isFirst ? { validate: validateAtLeastOne } : {})}
                  />
                  <Controller
                    name={`${f}__unit`}
                    control={control}
                    defaultValue={meta.units.default}
                    render={({ field }) => (
                      <Select {...field}>
                        {meta.units!.options.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </Select>
                    )}
                  />
                </span>
              </div>
            )
          }

          if (f === 'weight') {
            return (
              <div className="flex flex-col gap-1" key={f}>
                <span className={`text-xs ${mutedTextClass}`}>{meta.label}</span>
                {isBodyweight ? (
                  <button
                    type="button"
                    onClick={toggleBodyweight}
                    className={`h-8 rounded-md border border-ui-border-base bg-ui-bg-subtle px-2.5 text-xs ${mutedTextClass} text-left`}
                  >
                    {t('bodyweightActive')}
                  </button>
                ) : (
                  <span className="inline-flex items-stretch gap-1">
                    <Input
                      variant="compact"
                      type="number"
                      step="0.5"
                      placeholder={meta.placeholder}
                      autoFocus={i === 0}
                      {...register(f, isFirst ? { validate: validateAtLeastOne } : {})}
                    />
                    <button
                      type="button"
                      onClick={toggleBodyweight}
                      title={t('bodyweightTitle')}
                      className={`rounded-md border border-ui-border-base bg-ui-bg-subtle px-2 text-xs ${mutedTextClass} hover:bg-ui-bg-base-hover`}
                    >
                      MC
                    </button>
                  </span>
                )}
                <input type="hidden" {...register('weight__bodyweight')} />
              </div>
            )
          }

          return (
            <div className="flex flex-col gap-1" key={f}>
              <span className={`text-xs ${mutedTextClass}`}>{meta.label}</span>
              <Input
                variant="compact"
                type={meta.numeric ? 'number' : 'text'}
                step={meta.numeric ? '0.5' : undefined}
                placeholder={meta.placeholder}
                autoFocus={i === 0}
                {...register(f, isFirst ? { validate: validateAtLeastOne } : {})}
              />
            </div>
          )
        })}
      </div>

      <div className="flex flex-col gap-1">
        <span className={`text-xs ${mutedTextClass}`}>{t('note')}</span>
        <Input className="w-full" type="text" placeholder={t('notePlaceholder')} {...register('note')} />
      </div>

      <div className="flex items-center gap-1.5">
        <Button size="sm" type="submit" disabled={isSubmitting}>
          {isSubmitting ? '…' : t('save')}
        </Button>
        {onCancel && (
          <Button size="sm" variant="secondary" type="button" onClick={onCancel} aria-label={t('cancel')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </Button>
        )}
      </div>

      {errors[firstField]?.message && (
        <div className={`w-full ${errorBannerClass}`} role="alert">
          {errors[firstField]!.message as string}
        </div>
      )}
    </form>
  )
}
