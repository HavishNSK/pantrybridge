import { Clock, Repeat2, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { INGREDIENT_BY_ID } from '../../data/ingredients'
import { RECIPES, RECIPE_BY_ID } from '../../data/recipes'
import { money } from '../../lib/format'
import { analyzePlan, DAY_NAMES, DAYS, iterPlan, SLOTS } from '../../lib/planner'
import { matchRecipe } from '../../lib/recipeMatching'
import { useStore } from '../../store/useStore'
import type { MealSlot } from '../../types'
import { RecipeIllustration } from '../recipes/RecipeIllustration'
import { EmptyState } from '../ui/Section'
import { Sheet } from '../ui/Sheet'
import { Tag } from '../ui/Tag'
import { toast } from '../ui/Toast'
import { inputClass } from '../ui/Field'
import { isEarlier, leftoverAvailable, SLOT_LABEL, withoutSlot } from './helpers'

export interface PickTarget { day: number; slot: MealSlot }

export function MealPicker({ target, onClose }: { target: PickTarget | null; onClose: () => void }) {
  return (
    <Sheet open={!!target} onClose={onClose} title={target ? `${DAY_NAMES[target.day]} ${SLOT_LABEL[target.slot].toLowerCase()}` : 'Choose a meal'} width="sm:max-w-lg">
      {target && <PickerBody key={`${target.day}-${target.slot}`} target={target} onClose={onClose} />}
    </Sheet>
  )
}

function PickerBody({ target, onClose }: { target: PickTarget; onClose: () => void }) {
  const { day, slot } = target
  const plan = useStore((s) => s.plan)
  const pantry = useStore((s) => s.pantry)
  const household = useStore((s) => s.household)
  const setMeal = useStore((s) => s.setMeal)
  const [query, setQuery] = useState('')
  const [pantryOnly, setPantryOnly] = useState(false)

  const current = plan[day]?.[slot]
  const servings = current?.servings ?? household

  // Rank against what the rest of the week leaves in the pantry, not the full pantry.
  const matches = useMemo(() => {
    const { remaining } = analyzePlan(withoutSlot(plan, day, slot), pantry)
    return RECIPES.filter((r) => r.meal.includes(slot))
      .map((r) => matchRecipe(r, remaining, servings))
      .sort((a, b) => b.coverage - a.coverage || a.additionalCost - b.additionalCost)
  }, [plan, pantry, day, slot, servings])

  const q = query.trim().toLowerCase()
  const shown = matches.filter((m) => {
    if (pantryOnly && !m.canMake) return false
    if (!q) return true
    return m.recipe.name.toLowerCase().includes(q) || m.recipe.ingredients.some((i) => INGREDIENT_BY_ID[i.ingredientId]?.name.toLowerCase().includes(q))
  })

  // Earlier in week order only; one source per recipe (the most recent cook, which leftovers resolve to).
  const sources = new Map<string, { day: number; slot: MealSlot; servings: number }>()
  for (const m of iterPlan(plan)) {
    if (m.entry.leftover || !isEarlier(m, target)) continue
    sources.set(m.entry.recipeId, { day: m.day, slot: m.slot, servings: m.entry.servings })
  }
  const earlier = [...sources.entries()]
    .map(([recipeId, src]) => ({ recipeId, src, available: leftoverAvailable(plan, src, recipeId, target) }))
    .sort((a, b) => b.src.day * 3 + SLOTS.indexOf(b.src.slot) - (a.src.day * 3 + SLOTS.indexOf(a.src.slot)))

  const choose = (recipeId: string, leftoverServings?: number) => {
    const leftover = leftoverServings != null
    setMeal(day, slot, leftover ? { recipeId, servings: leftoverServings, leftover: true } : { recipeId, servings })
    toast(`${leftover ? 'Leftovers' : RECIPE_BY_ID[recipeId].name} added to ${DAYS[day]} ${slot}`)
    onClose()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-2" aria-hidden="true" />
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search meals or ingredients…" aria-label="Search meals or ingredients" className={`${inputClass} pl-10`} />
      </div>
      <label className="flex min-h-10 cursor-pointer items-center justify-between gap-3 rounded-lg bg-cream px-3 py-2">
        <span className="text-[15px] font-semibold text-ink">From my pantry only</span>
        <input type="checkbox" role="switch" checked={pantryOnly} onChange={(e) => setPantryOnly(e.target.checked)} className="size-5 accent-forest" />
      </label>

      <p className="text-sm text-ink-2">Ranked by what is left in your pantry after the rest of this week. Costs are estimates for {servings} servings.</p>

      {shown.length === 0 ? (
        <EmptyState title="No meals match">
          {pantryOnly ? 'Nothing for this slot can be made only from what is left. Turn off "From my pantry only" to see meals that need a few items.' : 'Try a different search.'}
        </EmptyState>
      ) : (
        <ul className="modules">
          {shown.map((m) => {
            const required = m.lines.filter((l) => !l.item.optional).length
            const have = Math.round(m.coverage * required)
            const isCurrent = current && !current.leftover && current.recipeId === m.recipe.id
            return (
              <li key={m.recipe.id} className="bg-paper">
                <button type="button" onClick={() => choose(m.recipe.id)} className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-cream">
                  <RecipeIllustration recipe={m.recipe} className="size-16 shrink-0 overflow-hidden rounded-md" />
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="font-semibold leading-snug text-ink">
                      {m.recipe.name}
                      {isCurrent && <span className="ml-2 text-xs font-semibold text-ink-2">(current)</span>}
                    </span>
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-2">
                      <span className="num" aria-hidden="true">{have} of {required} on hand</span>
                      <span className="inline-flex items-center gap-1"><Clock size={13} aria-hidden="true" />{m.recipe.minutes} min</span>
                    </span>
                    <span className="sr-only">You have {have} of {required} ingredients</span>
                    <span className="h-1.5 w-full max-w-40 overflow-hidden rounded-full bg-terracotta-wash" aria-hidden="true">
                      <span className="block h-full rounded-full bg-leaf" style={{ width: `${m.coverage * 100}%` }} />
                    </span>
                  </span>
                  {m.canMake ? <Tag tone="have">From pantry</Tag> : <Tag tone="price">+{money(m.additionalCost)} est.</Tag>}
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <div className="flex flex-col gap-2 pt-2">
        <h3 className="condensed text-[15px] font-extrabold uppercase tracking-[0.04em] text-forest">Leftovers from…</h3>
        {earlier.length === 0 ? (
          <p className="text-sm text-ink-2">No earlier meals this week yet. Leftovers from a bigger dinner can fill a later lunch.</p>
        ) : (
          <ul className="modules">
            {earlier.map(({ recipeId, src, available }) => (
              <li key={recipeId} className="bg-paper">
                <button type="button" disabled={available < 1} onClick={() => choose(recipeId, Math.min(household, available))} className="flex min-h-12 w-full items-center gap-3 px-3 py-2 text-left hover:bg-cream disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:bg-paper">
                  <Repeat2 size={18} className="shrink-0 text-leaf-ink" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-ink-2">{DAYS[src.day]} {src.slot} · <span className="num">{available}</span> of <span className="num">{src.servings}</span> servings free</span>
                    <span className="block font-semibold text-ink">{RECIPE_BY_ID[recipeId].name}</span>
                  </span>
                  {available >= 1 ? <Tag tone="have">No new cost</Tag> : <Tag tone="neutral">All taken</Tag>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
