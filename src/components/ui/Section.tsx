import type { ReactNode } from 'react'

/** Page heading row: big condensed title, one line of context, actions on the right. */
export function PageHeader({ title, lede, actions, meta }: { title: string; lede?: ReactNode; actions?: ReactNode; meta?: ReactNode }) {
  return (
    <header className="flex flex-col gap-4 pb-6 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <h1 className="display text-[clamp(2.25rem,5vw,3.75rem)] text-forest">{title}</h1>
        {lede && <p className="mt-3 text-[17px] leading-relaxed text-ink-2">{lede}</p>}
        {meta && <div className="mt-3 flex flex-wrap items-center gap-2">{meta}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  )
}

/** Module title inside a ruled box: small, heavy, condensed, with an optional right slot. */
export function ModuleTitle({ children, right, as: As = 'h2', id }: { children: ReactNode; right?: ReactNode; as?: 'h2' | 'h3'; id?: string }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <As id={id} className="condensed text-[15px] font-extrabold uppercase tracking-[0.04em] text-forest">{children}</As>
      {right}
    </div>
  )
}

export function EmptyState({ icon, title, children, action }: { icon?: ReactNode; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      {icon && <div className="text-leaf-ink">{icon}</div>}
      <h3 className="display text-2xl text-forest">{title}</h3>
      {children && <p className="max-w-sm text-ink-2">{children}</p>}
      {action}
    </div>
  )
}
