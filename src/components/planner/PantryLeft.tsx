import { Archive } from 'lucide-react'
import { useMemo } from 'react'
import { CATEGORY_LABEL, INGREDIENT_BY_ID } from '../../data/ingredients'
import { stockMap } from '../../lib/pantry'
import type { PlanAnalysis } from '../../lib/planner'
import { isDemoPantry, useStore } from '../../store/useStore'
import { ButtonLink } from '../ui/Button'
import { EmptyState, ModuleTitle } from '../ui/Section'
import { DemoTag, Tag } from '../ui/Tag'
import { amountText } from './helpers'

export function PantryLeft({ analysis }: { analysis: PlanAnalysis }) {
  const pantry = useStore((s) => s.pantry)
  const demo = isDemoPantry(pantry)

  const { left, usedUp } = useMemo(() => {
    const start = stockMap(pantry)
    const left: { id: string; base: number; used: number }[] = []
    const usedUp: string[] = []
    for (const [id, base] of Object.entries(start)) {
      const ing = INGREDIENT_BY_ID[id]
      if (!ing || ing.staple || base <= 0.5) continue
      const rem = analysis.remaining[id] ?? 0
      if (rem <= 0.5) usedUp.push(id)
      else left.push({ id, base: rem, used: base - rem })
    }
    left.sort((a, b) => INGREDIENT_BY_ID[a.id].category.localeCompare(INGREDIENT_BY_ID[b.id].category) || INGREDIENT_BY_ID[a.id].name.localeCompare(INGREDIENT_BY_ID[b.id].name))
    return { left, usedUp }
  }, [pantry, analysis.remaining])

  return (
    <div className="module flex flex-col gap-3">
      <ModuleTitle right={demo ? <DemoTag /> : undefined}>Left in your pantry after this week</ModuleTitle>
      {pantry.length === 0 ? (
        <EmptyState icon={<Archive size={30} />} title="Your pantry is empty" action={<ButtonLink to="/pantry" variant="secondary" size="sm">Add what you have</ButtonLink>}>
          Add a few items and the planner will build meals around them.
        </EmptyState>
      ) : (
        <>
          {left.length === 0 ? (
            <p className="text-[15px] text-ink-2">This week's plan uses everything in your pantry.</p>
          ) : (
            <ul className="divide-y divide-rule">
              {left.map((l) => (
                <li key={l.id} className="flex items-baseline justify-between gap-3 py-2">
                  <span className="min-w-0">
                    <span className="block font-medium text-ink">{INGREDIENT_BY_ID[l.id].name}</span>
                    <span className="block text-xs text-ink-2">{CATEGORY_LABEL[INGREDIENT_BY_ID[l.id].category]}{l.used > 0.5 && ' · some used this week'}</span>
                  </span>
                  <span className="num shrink-0 text-sm font-semibold text-ink">{amountText(l.id, l.base)}</span>
                </li>
              ))}
            </ul>
          )}
          {usedUp.length > 0 && (
            <div className="border-t border-rule pt-3">
              <h3 className="condensed mb-2 text-[13px] font-extrabold uppercase tracking-[0.04em] text-ink-2">Fully used this week</h3>
              <div className="flex flex-wrap gap-1.5">
                {usedUp.map((id) => <Tag key={id} tone="have">{INGREDIENT_BY_ID[id].name}</Tag>)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
