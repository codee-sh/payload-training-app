'use client'

import React from 'react'
import {
  compactInputClass,
  compactUnitInputClass,
  inputClass,
  joinClasses,
  selectClass,
} from '@/lib/class-names'

type InputVariant = 'default' | 'compact' | 'compact-unit'

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  variant?: InputVariant
}

const inputVariantClass: Record<InputVariant, string> = {
  default: inputClass,
  compact: compactInputClass,
  'compact-unit': compactUnitInputClass,
}

export function Input({ className, variant = 'default', ...props }: InputProps) {
  return <input className={joinClasses(inputVariantClass[variant], className)} {...props} />
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>

export function Select({ className, ...props }: SelectProps) {
  return <select className={joinClasses(selectClass, className)} {...props} />
}
