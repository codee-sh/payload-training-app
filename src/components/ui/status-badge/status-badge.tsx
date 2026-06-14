import React from 'react'
import { statusBadgeClass } from '@/lib/class-names'

export function StatusBadge({ children, status }: { children: React.ReactNode; status: string }) {
  return <span className={statusBadgeClass(status)}>{children}</span>
}
