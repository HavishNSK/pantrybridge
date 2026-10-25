import type { ComponentProps, ReactNode, SelectHTMLAttributes } from 'react'

export const inputClass =
  'h-11 w-full rounded-lg bg-paper px-3 text-[16px] text-ink ring-1 ring-inset ring-rule-strong placeholder:text-ink-2/70 hover:ring-ink-2 focus:outline-none focus:ring-2 focus:ring-forest transition-shadow'

export function Field({ label, hint, children, htmlFor }: { label: string; hint?: ReactNode; children: ReactNode; htmlFor: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-ink">{label}</label>
      {children}
      {hint && <p className="text-xs text-ink-2">{hint}</p>}
    </div>
  )
}

export function Input(props: ComponentProps<'input'>) {
  return <input {...props} className={`${inputClass} ${props.className ?? ''}`} />
}

export function Select({ children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={`${inputClass} appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1.5 6 6.5l5-5' stroke='%23173F35' stroke-width='1.8'/%3E%3C/svg%3E")] bg-[length:12px] bg-[right_12px_center] bg-no-repeat pr-9 ${props.className ?? ''}`}>
      {children}
    </select>
  )
}
