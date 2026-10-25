import { INGREDIENT_BY_ID } from '../../data/ingredients'
import { formatQty } from '../../lib/units'
import type { PantryItem } from '../../types'
import { ModuleTitle } from '../ui/Section'
import { DaysTag } from './DaysTag'

/** "Expiring soon" strip: the items to use first, each jumping to its row. */
export function ExpiringStrip({ items, onPick }: { items: (PantryItem & { days: number })[]; onPick: (uid: string) => void }) {
  if (!items.length) return null
  return (
    <section aria-labelledby="expiring-title" className="modules mb-6">
      <div className="module">
        <ModuleTitle id="expiring-title" right={<span className="text-sm text-ink-2">Within 7 days</span>}>Expiring soon</ModuleTitle>
        <ul className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]">
          {items.map((it) => {
            const ing = INGREDIENT_BY_ID[it.ingredientId]
            return (
              <li key={it.uid} className="shrink-0">
                <button
                  type="button"
                  onClick={() => onPick(it.uid)}
                  className={`flex min-h-12 flex-col items-start gap-1 rounded-lg px-3 py-2 text-left ring-1 ring-inset transition-colors ${it.days <= 3 ? 'bg-terracotta-wash/60 ring-terracotta/40 hover:bg-terracotta-wash' : 'bg-cream ring-rule hover:ring-rule-strong'}`}
                >
                  <span className="text-[15px] font-semibold text-ink">
                    {ing?.name ?? it.ingredientId} <span className="num font-normal text-ink-2">· {formatQty(it.quantity, it.unit)}</span>
                  </span>
                  <DaysTag days={it.days} />
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
