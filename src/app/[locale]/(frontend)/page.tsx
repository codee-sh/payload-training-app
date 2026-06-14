import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { loadTrainingPlans } from '@/loaders/training-plan-loader'
import { WorkoutPlansAccordion } from '@/components/workout/workout-plans-accordion'
import { LogoutButton } from '@/components/common/logout-button'

export default async function HomePage() {
  const t = await getTranslations('home')
  const result = await loadTrainingPlans()

  if (!result.user) redirect('/login')

  return (
    <div className="mx-auto max-w-3xl px-5 py-6 sm:px-6 sm:py-8">
      <div className="mb-4 flex items-center justify-between gap-3 sm:mb-7 sm:gap-4">
        <div className="flex items-center gap-3">
          <img src="/images/logo.svg" alt="Logo" className="h-7 w-auto sm:h-8" />
          <div>
            <h1 className="text-sm font-semibold text-ui-fg-base sm:text-xl">
              {t('greeting', { name: result.user.name || result.user.email || '' })}
            </h1>
            <span className="mt-0.5 block text-xs text-ui-fg-muted sm:mt-1">{t('yourTrainingPlans')}</span>
          </div>
        </div>
        <LogoutButton />
      </div>

      {result.plans.length === 0 && (
        <div className="py-10 text-center text-sm text-ui-fg-muted">{t('noPlans')}</div>
      )}
      {result.plans.length > 0 && <WorkoutPlansAccordion plans={result.plans} />}
    </div>
  )
}
