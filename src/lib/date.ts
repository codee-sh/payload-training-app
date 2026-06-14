export const pad2 = (n: number) => String(n).padStart(2, '0')

export const isoToDateInput = (iso?: string | null): string => {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

export const isoToTimeInput = (iso?: string | null): string => {
  if (!iso) return ''
  const d = new Date(iso)
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

export const combineDateTime = (date: string, time: string): string | null => {
  if (!date && !time) return null
  const d = date || isoToDateInput(new Date().toISOString())
  const t = time || '00:00'
  return new Date(`${d}T${t}`).toISOString()
}

export const fmtDuration = (start?: string | null, end?: string | null): string | null => {
  if (!start || !end) return null
  const ms = new Date(end).getTime() - new Date(start).getTime()
  if (ms < 0) return null
  const totalMin = Math.round(ms / 60000)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return h ? `${h}h ${m}min` : `${m}min`
}

export const fmtSec = (s: number): string => {
  if (s < 60) return `${s} s`
  const m = Math.floor(s / 60)
  const rest = s % 60
  return rest ? `${m} min ${rest} s` : `${m} min`
}
