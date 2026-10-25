import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'inverse'
type Size = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold whitespace-nowrap select-none transition-[background-color,color,box-shadow,transform] duration-150 ease-out active:scale-[0.97] disabled:opacity-45 disabled:active:scale-100'
const variants: Record<Variant, string> = {
  primary: 'bg-forest text-cream hover:bg-forest-2 shadow-[0_1px_0_rgba(0,0,0,0.25),0_2px_6px_-2px_rgba(23,63,53,0.5)]',
  secondary: 'bg-paper text-forest ring-1 ring-inset ring-rule-strong hover:ring-forest hover:bg-cream',
  ghost: 'text-forest hover:bg-forest/[0.07]',
  danger: 'text-terracotta-ink hover:bg-terracotta-wash',
  inverse: 'bg-cream text-forest hover:bg-paper on-dark',
}
const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-[15px]',
  lg: 'h-12 px-5 text-base',
}

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', extra = '') {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: ReactNode
}

export function Button({ variant = 'primary', size = 'md', icon, className = '', children, type = 'button', ...rest }: Props) {
  return (
    <button type={type} className={buttonClass(variant, size, className)} {...rest}>
      {icon}
      {children}
    </button>
  )
}

export function ButtonLink({ variant = 'primary', size = 'md', icon, className = '', children, ...rest }: LinkProps & { variant?: Variant; size?: Size; icon?: ReactNode }) {
  return (
    <Link className={buttonClass(variant, size, className)} {...rest}>
      {icon}
      {children}
    </Link>
  )
}

/** Square icon-only button; `label` is required for screen readers. */
export function IconButton({ label, children, className = '', ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button type="button" aria-label={label} title={label} className={`inline-grid size-10 place-items-center rounded-lg text-ink-2 hover:bg-forest/[0.07] hover:text-forest transition-colors ${className}`} {...rest}>
      {children}
    </button>
  )
}
