import { Minus, Plus } from 'lucide-react'

export function Stepper({ value, onChange, min = 1, max = 12, label, step = 1, size = 'md' }: { value: number; onChange: (n: number) => void; min?: number; max?: number; step?: number; label: string; size?: 'sm' | 'md' }) {
  const h = size === 'sm' ? 'h-8' : 'h-10'
  const w = size === 'sm' ? 'w-8' : 'w-10'
  return (
    <div role="group" aria-label={label} className={`inline-flex items-center rounded-lg ring-1 ring-inset ring-rule-strong bg-paper ${h}`}>
      <button type="button" aria-label={`Decrease ${label}`} disabled={value <= min} onClick={() => onChange(Math.max(min, value - step))} className={`grid ${w} h-full place-items-center rounded-l-lg text-forest hover:bg-cream disabled:opacity-35`}>
        <Minus size={15} strokeWidth={2.4} />
      </button>
      <output aria-live="polite" className="num min-w-7 text-center text-sm font-bold">{value}</output>
      <button type="button" aria-label={`Increase ${label}`} disabled={value >= max} onClick={() => onChange(Math.min(max, value + step))} className={`grid ${w} h-full place-items-center rounded-r-lg text-forest hover:bg-cream disabled:opacity-35`}>
        <Plus size={15} strokeWidth={2.4} />
      </button>
    </div>
  )
}
