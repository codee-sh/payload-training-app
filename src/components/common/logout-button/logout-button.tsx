'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
  const t = useTranslations('nav')
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const onClick = async () => {
    setLoading(true)
    await fetch('/api/clients/logout', { method: 'POST' }).catch(() => null)
    router.push('/login')
    router.refresh()
  }

  return (
    <Button variant="secondary" onClick={onClick} disabled={loading}>
      {loading ? '…' : t('logout')}
    </Button>
  )
}
