'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'
import { errorBannerClass } from '@/lib/class-names'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Surface } from '@/components/ui/surface'

export default function LoginPage() {
  const t = useTranslations('login')
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/clients/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setError(data?.errors?.[0]?.message || t('invalidCredentials'))
        setLoading(false)
        return
      }
      // cookie payload-token ustawione przez Payload — przechodzimy do dashboardu
      router.push('/')
      router.refresh()
    } catch {
      setError(t('genericError'))
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-6">
      <Surface as="form" className="w-full max-w-sm p-6 sm:p-8" onSubmit={onSubmit}>
        <div className="mb-6 flex justify-center">
          <img src="/images/logo.svg" alt="Logo" className="h-24 w-auto" />
        </div>
        <h1 className="text-xl font-semibold text-ui-fg-base">{t('title')}</h1>
        <p className="mt-1 mb-6 text-sm text-ui-fg-muted">{t('subtitle')}</p>

        {error && <div className={`mb-4 ${errorBannerClass}`}>{error}</div>}

        <div className="mb-4">
          <label className="mb-1.5 block text-xs text-ui-fg-muted" htmlFor="email">
            {t('emailLabel')}
          </label>
          <Input
            className="w-full"
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="mb-1.5 block text-xs text-ui-fg-muted" htmlFor="password">
            {t('passwordLabel')}
          </label>
          <Input
            className="w-full"
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button className="mt-2 w-full" type="submit" disabled={loading}>
          {loading ? t('loggingIn') : t('button')}
        </Button>
      </Surface>
    </div>
  )
}
