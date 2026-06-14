export const joinClasses = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ')

export const surfaceClass = 'rounded-xl border border-ui-border-base bg-ui-bg-component'
export const panelClass = 'rounded-xl border border-ui-border-base bg-ui-bg-subtle'
export const mutedTextClass = 'text-ui-fg-muted'
export const sectionLabelClass = 'text-xs uppercase tracking-wider text-ui-fg-muted'
export const inputClass =
  'rounded-lg border border-ui-border-base bg-ui-bg-base px-3 py-[7px] text-base text-ui-fg-base outline-none transition placeholder:opacity-40 focus-visible:border-ui-border-interactive focus-visible:ring-2 focus-visible:ring-ui-border-interactive/20'
export const compactInputClass = joinClasses('w-20 px-2.5 py-1.5 sm:py-2', inputClass)
export const compactUnitInputClass = joinClasses('w-16 px-2.5 py-1.5 sm:py-2', inputClass)
export const selectClass = joinClasses('px-2 py-1.5 sm:py-2', inputClass)
export const primaryButtonClass =
  'appearance-none flex w-fit cursor-pointer items-center justify-center rounded-lg bg-ui-bg-interactive px-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60'
export const secondaryButtonClass =
  'appearance-none flex w-fit cursor-pointer items-center justify-center rounded-lg border border-ui-border-base px-2.5 text-sm font-medium text-ui-fg-muted transition hover:border-ui-border-strong hover:text-ui-fg-base focus-visible:border-ui-border-interactive focus-visible:ring-2 focus-visible:ring-ui-border-interactive/20 disabled:cursor-not-allowed disabled:opacity-60'
export const dashedButtonClass =
  'appearance-none flex w-fit cursor-pointer items-center justify-center rounded-lg border border-dashed border-ui-border-base px-2.5 text-sm text-ui-fg-interactive transition-colors hover:border-ui-border-interactive focus-visible:border-ui-border-interactive focus-visible:ring-2 focus-visible:ring-ui-border-interactive/20'
export const iconButtonClass =
  'cursor-pointer rounded px-1.5 py-0.5 text-sm text-ui-fg-muted transition-colors hover:text-ui-fg-interactive focus-visible:text-ui-fg-interactive'
export const dangerIconButtonClass =
  'cursor-pointer rounded px-1.5 py-0.5 text-sm text-ui-fg-muted transition-colors hover:text-ui-fg-error focus-visible:text-ui-fg-error'
export const errorBannerClass =
  'rounded-lg border border-ui-border-error px-3 py-2.5 text-sm text-ui-fg-error bg-ui-tag-red-bg'

export const statusBadgeClass = (status: string) =>
  joinClasses(
    'flex rounded-full px-1.5 py-1 text-xs font-semibold uppercase tracking-wide',
    status === 'active' && 'bg-ui-tag-blue-bg text-ui-tag-blue-text',
    status === 'paused' && 'bg-ui-tag-orange-bg text-ui-tag-orange-text',
    status === 'completed' && 'bg-ui-tag-neutral-bg text-ui-tag-neutral-text',
  )
