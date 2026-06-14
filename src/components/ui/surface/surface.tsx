import React from 'react'
import { joinClasses, panelClass, surfaceClass } from '@/lib/class-names'

type Variant = 'card' | 'panel'

const variantClass: Record<Variant, string> = {
  card: surfaceClass,
  panel: panelClass,
}

type DivSurfaceProps = React.HTMLAttributes<HTMLDivElement> & {
  as?: 'div'
  variant?: Variant
}

type FormSurfaceProps = React.FormHTMLAttributes<HTMLFormElement> & {
  as: 'form'
  variant?: Variant
}

type SurfaceProps = DivSurfaceProps | FormSurfaceProps

export function Surface(props: SurfaceProps) {
  const { className, variant = 'card' } = props

  if (props.as === 'form') {
    const { as: _as, ...rest } = props
    return <form className={joinClasses(variantClass[variant], className)} {...rest} />
  }

  const { as: _as, ...rest } = props
  return <div className={joinClasses(variantClass[variant], className)} {...rest} />
}
