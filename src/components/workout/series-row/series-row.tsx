'use client'

import React, { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import type { MetricField } from '@/collections/exercises/types'
import { joinClasses, panelClass } from '@/lib/class-names'
import { Button } from '@/components/ui/button'
import { SeriesForm } from '@/components/workout/series-form'
import type { SetLog, Values } from '@/types/workout'
import { setLogToFormValues, setSummary } from '@/lib/metrics'

export function SeriesRow({
  set,
  fields,
  onUpdate,
  onDelete,
}: {
  set: SetLog
  fields: MetricField[]
  onUpdate: (values: Values) => Promise<void>
  onDelete: () => Promise<void>
}) {
  const [editing, setEditing] = useState(false)

  if (editing) {
    return (
      <li className={`px-2.5 py-2 ${joinClasses(panelClass, 'rounded-lg bg-ui-bg-base')}`}>
        <SeriesForm
          fields={fields}
          initial={setLogToFormValues(set, fields)}
          onSubmit={async (v) => {
            await onUpdate(v)
            setEditing(false)
          }}
          onCancel={() => setEditing(false)}
        />
      </li>
    )
  }

  return (
    <li className="mb-1 flex items-center justify-between gap-2 rounded-lg border border-ui-border-base bg-ui-bg-base px-2.5 py-1.5 text-sm">
      <span>
        Seria {set.setNumber}: {setSummary(set)}
      </span>
      <span className="flex shrink-0 gap-0.5">
        <Button variant="icon" onClick={() => setEditing(true)} aria-label="Edytuj">
          <Pencil size={14} />
        </Button>
        <Button variant="danger" onClick={onDelete} aria-label="Usuń">
          <Trash2 size={14} />
        </Button>
      </span>
    </li>
  )
}
