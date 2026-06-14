'use client'

import React, { useState } from 'react'
import { joinClasses, mutedTextClass } from '@/lib/class-names'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Session } from '@/types/workout'
import { combineDateTime, fmtDuration, isoToDateInput, isoToTimeInput } from '@/lib/date'

export function SessionTimesBadge({
  session,
  open,
  onOpen,
}: {
  session: Session | null
  open: boolean
  onOpen: () => void
}) {
  const startIso = session?.startedAt ?? null
  const finishIso = session?.finishedAt ?? null
  const duration = fmtDuration(startIso, finishIso)
  const dateLabel = startIso ? isoToDateInput(startIso).slice(5).replace('-', '.') : null

  const iconClass = open ? 'text-white' : mutedTextClass

  return (
    <Button
      variant="secondary"
      className={joinClasses(
        'rounded-full px-2.5 text-xs font-normal',
        open ? 'border-ui-border-interactive bg-ui-bg-interactive text-white' : 'bg-ui-bg-subtle text-ui-fg-base',
      )}
      onClick={onOpen}
    >
      {open ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={iconClass}>
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      ) : dateLabel || duration ? (
        <span className="flex items-center gap-1.5 whitespace-nowrap">
          {dateLabel && <span>{dateLabel}</span>}
          {duration && <span className="font-bold text-ui-fg-interactive">{duration}</span>}
        </span>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClass}>
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      )}
    </Button>
  )
}

export function SessionTimesForm({
  session,
  onSet,
  onSave,
  onClose,
}: {
  session: Session | null
  onSet: (field: 'startedAt' | 'finishedAt', iso: string | null) => void
  onSave: (startedAt: string | null, finishedAt: string | null) => Promise<void>
  onClose: () => void
}) {
  const startIso = session?.startedAt ?? null
  const finishIso = session?.finishedAt ?? null

  const [saving, setSaving] = useState(false)
  const [sd, setSd] = useState(() => isoToDateInput(startIso))
  const [st, setSt] = useState(() => isoToTimeInput(startIso))
  const [ed, setEd] = useState(() => isoToDateInput(finishIso))
  const [et, setEt] = useState(() => isoToTimeInput(finishIso))

  const [prevStart, setPrevStart] = useState(startIso)
  if (startIso !== prevStart) {
    setPrevStart(startIso)
    setSd(isoToDateInput(startIso))
    setSt(isoToTimeInput(startIso))
  }

  const [prevFinish, setPrevFinish] = useState(finishIso)
  if (finishIso !== prevFinish) {
    setPrevFinish(finishIso)
    setEd(isoToDateInput(finishIso))
    setEt(isoToTimeInput(finishIso))
  }

  const setStartNow = () => {
    const iso = new Date().toISOString()
    setSd(isoToDateInput(iso))
    setSt(isoToTimeInput(iso))
    onSet('startedAt', iso)
  }

  const addToStart = (hours: number) => {
    const base = combineDateTime(sd, st) ?? new Date().toISOString()
    const iso = new Date(new Date(base).getTime() + hours * 3600 * 1000).toISOString()
    setEd(sd || isoToDateInput(iso))
    setEt(isoToTimeInput(iso))
    onSet('finishedAt', combineDateTime(sd || isoToDateInput(iso), isoToTimeInput(iso)))
  }

  const save = async () => {
    setSaving(true)
    try {
      await onSave(combineDateTime(sd, st), combineDateTime(ed || sd, et))
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-2 font-normal">
      <div className="flex flex-col gap-2.5">
        <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-1.5 text-sm">
          <span className={`text-xs ${mutedTextClass}`}>Rozpoczęto</span>
          <div className="flex items-center gap-1.5">
            <Input
              type="date"
              className="w-31.5 [&::-webkit-calendar-picker-indicator]:hidden"
              value={sd}
              onChange={(e) => setSd(e.target.value)}
              onBlur={() => onSet('startedAt', combineDateTime(sd, st))}
            />
            <Input
              type="time"
              className="w-22 [&::-webkit-calendar-picker-indicator]:hidden"
              value={st}
              onChange={(e) => setSt(e.target.value)}
              onBlur={() => onSet('startedAt', combineDateTime(sd, st))}
            />
            <Button variant="secondary" onClick={setStartNow}>
              teraz
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-1.5 text-sm">
          <span className={`text-xs ${mutedTextClass}`}>Zakończono</span>
          <div className="flex flex-wrap items-center gap-1.5">
            <Input
              type="time"
              value={et}
              onChange={(e) => setEt(e.target.value)}
              onBlur={() => onSet('finishedAt', combineDateTime(ed || sd, et))}
            />
            {([1, 1.5, 2] as const).map((h) => (
              <Button key={h} variant="secondary" onClick={() => addToStart(h)}>
                +{h}h
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Button size="sm" onClick={save} disabled={saving}>
            {saving ? '…' : 'Zapisz'}
          </Button>
        </div>
      </div>
    </div>
  )
}
