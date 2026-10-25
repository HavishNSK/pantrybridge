import type { ReactNode } from 'react'
import { round } from '../../lib/format'

/**
 * Horizontal meter with a neutral reference tick. The reference is a general
 * Daily Value, shown for orientation only, never as a pass/fail target.
 */
export function ReferenceMeter({ label, value, reference, unit, note }: { label: string; value: number; reference: number; unit: string; note: ReactNode }) {
  // Scale so the reference sits at about two-thirds of the track; values beyond extend to the end.
  const max = Math.max(reference * 1.5, value * 1.05)
  const pct = Math.min(100, (value / max) * 100)
  const refPct = (reference / max) * 100
  const id = label.toLowerCase().replace(/\W+/g, '-')
  return (
    <div>
      <p className="flex items-baseline gap-1.5">
        <span className="display num text-5xl text-forest">{round(value, value < 10 ? 1 : 0)}</span>
        <span className="text-[15px] font-semibold text-ink-2">{unit} per person per day</span>
      </p>
      <div className="relative mt-5 mb-7">
        <div
          role="meter"
          aria-labelledby={`${id}-label`}
          aria-valuemin={0}
          aria-valuemax={round(max)}
          aria-valuenow={round(value, 1)}
          aria-valuetext={`${round(value, 1)} ${unit} per person per day, estimated. General reference ${reference} ${unit}.`}
          className="h-3.5 overflow-hidden rounded-full bg-cream ring-1 ring-inset ring-rule"
        >
          <div className="h-full rounded-full bg-leaf motion-safe:transition-[width] motion-safe:duration-700 motion-safe:ease-[var(--ease-out-expo)]" style={{ width: `${pct}%` }} />
        </div>
        <div aria-hidden="true" className="absolute -top-1.5 h-6.5 w-0.5 bg-ink" style={{ left: `calc(${refPct}% - 1px)` }} />
        <span aria-hidden="true" className="num absolute top-6 w-16 text-center text-xs font-semibold whitespace-nowrap text-ink-2" style={{ left: `clamp(0px, calc(${refPct}% - 2rem), calc(100% - 4rem))` }}>
          ref. {reference} {unit}
        </span>
      </div>
      <p id={`${id}-label`} className="sr-only">{label}</p>
      <p className="text-[15px] leading-relaxed text-ink-2">{note}</p>
    </div>
  )
}
