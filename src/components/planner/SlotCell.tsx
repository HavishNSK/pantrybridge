import { Plus, RefreshCw, Repeat2, X } from 'lucide-react'
import { RECIPE_BY_ID } from '../../data/recipes'
import { DAY_NAMES, type PlannedMeal } from '../../lib/planner'
import { money } from '../../lib/format'
import { useStore } from '../../store/useStore'
import type { MealSlot } from '../../types'
import { RecipeIllustration } from '../recipes/RecipeIllustration'
import { IconButton } from '../ui/Button'
import { Stepper } from '../ui/Stepper'
import { Tag } from '../ui/Tag'
import { leftoverAvailable, leftoverSource, SLOT_LABEL } from './helpers'

interface Props {
  day: number
  slot: MealSlot
  meal?: PlannedMeal
  onPick: (day: number, slot: MealSlot) => void
  /** compact = desktop week grid column; roomy = mobile stacked list */
  layout: 'compact' | 'roomy'
}

export function SlotCell({ day, slot, meal, onPick, layout }: Props) {
  const setMeal = useStore((s) => s.setMeal)
  const setServings = useStore((s) => s.setServings)
  const plan = useStore((s) => s.plan)
  const where = `${DAY_NAMES[day]} ${SLOT_LABEL[slot].toLowerCase()}`

  if (!meal) {
    return (
      <button
        type="button"
        onClick={() => onPick(day, slot)}
        aria-label={`Add meal for ${where}`}
        className={`group flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-rule-strong text-sm font-semibold text-ink-2 transition-colors hover:border-forest hover:bg-cream hover:text-forest ${layout === 'compact' ? 'min-h-[9.5rem] flex-col' : 'min-h-14'}`}
      >
        <Plus size={18} strokeWidth={2.4} />
        Add meal
      </button>
    )
  }

  const recipe = RECIPE_BY_ID[meal.entry.recipeId]
  const leftover = !!meal.entry.leftover
  const extra = meal.match?.additionalCost ?? 0
  const tags = (
    <div className="flex flex-wrap gap-1">
      {leftover && <Tag tone="neutral" icon={<Repeat2 size={12} />}>Leftover</Tag>}
      {leftover || extra < 0.01 ? <Tag tone="have">From pantry</Tag> : <Tag tone="price">+{money(extra)} est.</Tag>}
    </div>
  )
  const actions = (
    <div className="flex items-center">
      <IconButton label={`Replace ${where}`} onClick={() => onPick(day, slot)}><RefreshCw size={16} /></IconButton>
      <IconButton label={`Remove ${where}`} onClick={() => setMeal(day, slot, null)} className="hover:!text-terracotta-ink hover:!bg-terracotta-wash"><X size={17} /></IconButton>
    </div>
  )
  // Leftovers can't exceed what the source meal still has free.
  let max = 12
  if (leftover) {
    const src = leftoverSource(plan, day, slot, meal.entry.recipeId)
    max = Math.max(1, src ? leftoverAvailable(plan, src, meal.entry.recipeId, { day, slot }) : meal.entry.servings)
  }
  const stepper = (
    <Stepper size={layout === 'compact' ? 'sm' : 'md'} max={max} value={meal.entry.servings} onChange={(n) => setServings(day, slot, n)} label={`servings for ${where}`} />
  )

  if (layout === 'roomy') {
    return (
      <div className="flex gap-3">
        <RecipeIllustration recipe={recipe} className="size-20 shrink-0 overflow-hidden rounded-lg" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold leading-snug text-ink">{recipe.name}</p>
            {actions}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {stepper}
            <span className="text-sm text-ink-2">servings</span>
            {tags}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-2">
      <RecipeIllustration recipe={recipe} className="block aspect-[4/3] w-full overflow-hidden rounded-md" />
      <p className="line-clamp-2 text-sm font-semibold leading-snug text-ink" title={recipe.name}>{recipe.name}</p>
      {tags}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-1">
        {stepper}
        {actions}
      </div>
    </div>
  )
}
