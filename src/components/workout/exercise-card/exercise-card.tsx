'use client'

import { useTranslations } from 'next-intl'
import React, { useState } from 'react'
import { CopyPlus } from 'lucide-react'
import { trackingFields, type MetricField } from '@/collections/exercises/types'
import { mutedTextClass } from '@/lib/class-names'
import { Button } from '@/components/ui/button'
import { SeriesForm } from '@/components/workout/series-form'
import { SeriesRow } from '@/components/workout/series-row'
import type { SetLog, TExercise, Values } from '@/types/workout'
import { setLogToFormValues } from '@/lib/metrics'

export function ExerciseCard({
  ex,
  sets,
  onAdd,
  onUpdate,
  onDelete,
}: {
  ex: TExercise
  sets: SetLog[]
  onAdd: (ex: TExercise, fields: MetricField[], v: Values) => Promise<void>
  onUpdate: (id: number, fields: MetricField[], v: Values) => Promise<void>
  onDelete: (id: number) => Promise<void>
}) {
  const t = useTranslations('exercise')
  const [open, setOpen] = useState(false)
  const fields = trackingFields(ex.trackingType)

  return (
    <div className="border-t border-ui-border-base py-2 first:border-t-0">
      <div className="break-words text-sm text-ui-fg-base">
        {ex.numer ? (
          <span className={`inline-block min-w-7 font-semibold ${mutedTextClass}`}>{ex.numer}</span>
        ) : null}
        {ex.name}
        {ex.videoUrl && (
          <a
            className="ml-2 whitespace-nowrap text-xs text-ui-fg-interactive"
            href={ex.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('video')}
          </a>
        )}
      </div>

      {ex.meta.length > 0 && (
        <div className={`mt-0.5 pl-7 text-xs ${mutedTextClass}`}>{ex.meta.join(' · ')}</div>
      )}
      {ex.note && <div className={`mt-0.5 pl-7 text-xs ${mutedTextClass}`}>{ex.note}</div>}

      {sets.length > 0 && (
        <ul className="mt-2 mb-1 list-none p-0">
          {sets.map((s) => (
            <SeriesRow
              key={s.id}
              set={s}
              fields={fields}
              onUpdate={(values) => onUpdate(s.id, fields, values)}
              onDelete={() => onDelete(s.id)}
            />
          ))}
        </ul>
      )}

      {open ? (
        <SeriesForm
          fields={fields}
          initial={{ reps: ex.prefill.reps ?? '', rir: ex.prefill.rir ?? '', note: '' }}
          onSubmit={async (v) => {
            await onAdd(ex, fields, v)
            setOpen(false)
          }}
          onCancel={() => setOpen(false)}
        />
      ) : (
        <div className="mt-1.5 flex items-center gap-2">
          <Button variant="dashed" onClick={() => setOpen(true)}>
            {t('addSet')}
          </Button>
          {sets.length > 0 && (
            <Button
              variant="dashed"
              aria-label={t('duplicateSet')}
              onClick={() => onAdd(ex, fields, setLogToFormValues(sets[sets.length - 1], fields))}
            >
              <CopyPlus size={14} />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
