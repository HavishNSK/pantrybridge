import type { ReactNode } from 'react'

type Tone = 'neutral' | 'have' | 'need' | 'price' | 'demo' | 'estimate' | 'dark'

const tones: Record<Tone, string> = {
  neutral: 'bg-cream text-ink-2 ring-rule',
  have: 'bg-leaf-wash text-leaf-ink ring-leaf/50',
  need: 'bg-terracotta-wash text-terracotta-ink ring-terracotta/40',
  // The circular's price-tag chip: terracotta fill, ink text.
  price: 'bg-terracotta text-ink ring-transparent font-bold num',
  demo: 'bg-ink text-cream ring-transparent',
  estimate: 'bg-paper text-ink-2 ring-rule-strong border-dashed',
  dark: 'bg-white/10 text-cream ring-white/15',
}

export function Tag({ tone = 'neutral', children, className = '', icon }: { tone?: Tone; children: ReactNode; className?: string; icon?: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${tones[tone]} ${className}`}>
      {icon}
      {children}
    </span>
  )
}

export function DemoTag({ children = 'Demo data' }: { children?: ReactNode }) {
  return (
    <Tag tone="demo" className="uppercase tracking-wide text-[10px]">
      {children}
    </Tag>
  )
}

export function EstimateTag({ children = 'Estimate' }: { children?: ReactNode }) {
  return <Tag tone="estimate" className="text-[11px]">{children}</Tag>
}
