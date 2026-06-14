'use client'

import React from 'react'
import {
  dangerIconButtonClass,
  dashedButtonClass,
  iconButtonClass,
  joinClasses,
  primaryButtonClass,
  secondaryButtonClass,
} from '@/lib/class-names'

type Variant = 'primary' | 'secondary' | 'dashed' | 'icon' | 'danger' | 'ghost'
type Size = 'md' | 'sm'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  active?: boolean
}

const variantClass: Record<Variant, string> = {
  primary: primaryButtonClass,
  secondary: secondaryButtonClass,
  dashed: dashedButtonClass,
  icon: iconButtonClass,
  danger: dangerIconButtonClass,
  ghost: 'cursor-pointer text-left transition-colors',
}

const sizeClass: Record<Size, string> = {
  md: 'min-h-8',
  sm: 'min-h-6 px-2.5 text-xs',
}

const activeClass: Partial<Record<Variant, string>> = {
  secondary: 'border-ui-border-interactive bg-ui-bg-interactive/10 text-ui-fg-base',
}

export function Button({
  className,
  type = 'button',
  variant = 'primary',
  size = 'md',
  active,
  ...props
}: ButtonProps) {
  return (
    <button
      className={joinClasses(
        variantClass[variant],
        sizeClass[size],
        active && activeClass[variant],
        className,
      )}
      type={type}
      {...props}
    />
  )
}
