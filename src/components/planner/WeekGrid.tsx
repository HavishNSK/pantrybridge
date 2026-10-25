import { money } from '../../lib/format'
import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { shortDate, todayIndex, weekOf } from '../../lib/format'
import { DAYS, DAY_NAMES, SLOTS, type PlanAnalysis } from '../../lib/planner'
import type { MealSlot } from '../../types'
import { findMeal, SLOT_LABEL } from './helpers'
import { SlotCell } from './SlotCell'

export function WeekGrid({ analysis, onPick }: { analysis: PlanAnalysis; onPick: (day: number, slot: MealSlot) => void }) {
  const today = todayIndex()
  const monday = weekOf()
  const dateOf = (d: number) => {
    const x = new Date(monday)
    x.setDate(x.getDate() + d)
    return shortDate(x)
  }
  const [active, setActive] = useState(today)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])

  const onTabKey = (e: KeyboardEvent) => {
    const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!delta) return
    e.preventDefault()
    const next = (active + delta + 7) % 7
    setActive(next)
    tabs.current[next]?.focus()
  }

  const dayCost = (d: number) => analysis.meals.filter((m) => m.day === d).reduce((s, m) => s + (m.match?.additionalCost ?? 0), 0)

  return (
    <section aria-label="Meals this week">
      {/* Desktop: ruled module grid, 7 days across, meals down */}
      <div className="hidden lg:block">
      <div className="modules" style={{ gridTemplateColumns: '6.5rem repeat(7, minmax(0, 1fr))' }}>
        <div className="bg-paper" />
        {DAYS.map((d, i) => (
          <div key={d} className={`px-3 py-2.5 ${i === today ? 'bg-forest text-cream' : 'bg-paper text-forest'}`}>
            <p className="condensed text-[15px] font-extrabold uppercase tracking-[0.04em]">
              {d}
              {i === today && <span className="ml-1.5 text-xs font-semibold normal-case tracking-normal text-leaf">Today</span>}
            </p>
            <p className={`num text-xs ${i === today ? 'text-cream/80' : 'text-ink-2'}`}>{dateOf(i)}</p>
          </div>
        ))}
        {SLOTS.map((slot) => (
          <Row key={slot} slot={slot}>
            {DAYS.map((_, day) => (
              <div key={day} className={`p-2 ${day === today ? 'bg-leaf-wash/45' : 'bg-paper'}`}>
                <SlotCell layout="compact" day={day} slot={slot} meal={findMeal(analysis, day, slot)} onPick={onPick} />
              </div>
            ))}
          </Row>
        ))}
      </div>
      </div>

      {/* Mobile and tablet: day tabs with stacked meals */}
      <div className="lg:hidden">
        <div role="tablist" aria-label="Day of the week" onKeyDown={onTabKey} className="modules grid-cols-7">
          {DAYS.map((d, i) => {
            const selected = i === active
            const count = SLOTS.filter((s) => findMeal(analysis, i, s)).length
            return (
              <button
                key={d}
                ref={(el) => { tabs.current[i] = el }}
                role="tab"
                id={`day-tab-${i}`}
                aria-selected={selected}
                aria-controls="day-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(i)}
                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 transition-colors ${selected ? 'bg-forest text-cream' : 'bg-paper text-forest hover:bg-cream'}`}
              >
                <span className="condensed text-sm font-extrabold uppercase">{d}</span>
                <span className="flex h-2 items-center gap-0.5" aria-hidden="true">
                  {i === today ? (
                    <span className={`text-[10px] font-semibold leading-none ${selected ? 'text-leaf' : 'text-leaf-ink'}`}>today</span>
                  ) : (
                    SLOTS.map((_, k) => <span key={k} className={`size-1.5 rounded-full ${k < count ? (selected ? 'bg-leaf' : 'bg-forest') : selected ? 'bg-cream/25' : 'bg-rule'}`} />)
                  )}
                </span>
                <span className="sr-only">{count} of 3 meals planned</span>
              </button>
            )
          })}
        </div>
        <div id="day-panel" role="tabpanel" aria-labelledby={`day-tab-${active}`} className="modules mt-3">
          <div className="module flex items-baseline justify-between gap-3 !py-3">
            <h2 className="display text-2xl text-forest">{DAY_NAMES[active]} <span className="num text-base font-semibold text-ink-2">{dateOf(active)}</span></h2>
            <span className="num text-sm text-ink-2">{dayCost(active) > 0.01 ? `+${money(dayCost(active))} est.` : 'All from pantry'}</span>
          </div>
          {SLOTS.map((slot) => (
            <div key={slot} className="module">
              <h3 className="condensed mb-2 text-[13px] font-extrabold uppercase tracking-[0.04em] text-ink-2">{SLOT_LABEL[slot]}</h3>
              <SlotCell layout="roomy" day={active} slot={slot} meal={findMeal(analysis, active, slot)} onPick={onPick} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Row({ slot, children }: { slot: MealSlot; children: ReactNode }) {
  return (
    <>
      <div className="bg-paper px-3 py-3">
        <p className="condensed text-[13px] font-extrabold uppercase tracking-[0.04em] text-ink-2">{SLOT_LABEL[slot]}</p>
      </div>
      {children}
    </>
  )
}
