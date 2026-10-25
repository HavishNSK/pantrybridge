import { AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { RECIPE_BY_ID } from '../../data/recipes'
import { todayIndex } from '../../lib/format'
import { DAY_NAMES, DAYS, SLOTS } from '../../lib/planner'
import { useStore } from '../../store/useStore'
import type { MealSlot, Recipe } from '../../types'
import { Button } from '../ui/Button'
import { Sheet } from '../ui/Sheet'
import { toast } from '../ui/Toast'

const SLOT_LABEL: Record<MealSlot, string> = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' }

export function AddToPlanSheet({ recipe, servings, open, onClose }: { recipe: Recipe; servings: number; open: boolean; onClose: () => void }) {
  const plan = useStore((s) => s.plan)
  const setMeal = useStore((s) => s.setMeal)
  const slots = SLOTS.filter((s) => recipe.meal.includes(s))
  const [day, setDay] = useState(todayIndex)
  const [slot, setSlot] = useState<MealSlot>(slots.includes('dinner') ? 'dinner' : slots[0] ?? 'dinner')
  const [confirming, setConfirming] = useState(false)

  const taken = plan[day]?.[slot]
  const takenRecipe = taken ? RECIPE_BY_ID[taken.recipeId] : undefined
  const sameRecipe = taken?.recipeId === recipe.id && !taken.leftover
  const needsConfirm = !!takenRecipe && !sameRecipe

  const close = () => {
    setConfirming(false)
    onClose()
  }
  const commit = () => {
    setMeal(day, slot, { recipeId: recipe.id, servings })
    toast(
      takenRecipe && !sameRecipe
        ? `Replaced ${takenRecipe.name} on ${DAY_NAMES[day]} ${slot}`
        : sameRecipe
          ? `Updated to ${servings} servings on ${DAY_NAMES[day]} ${slot}`
          : `Added to ${DAY_NAMES[day]} ${slot}`,
    )
    close()
  }
  const submit = () => {
    if (needsConfirm && !confirming) setConfirming(true)
    else commit()
  }
  const pickDay = (d: number) => {
    setDay(d)
    setConfirming(false)
  }
  const pickSlot = (s: MealSlot) => {
    setSlot(s)
    setConfirming(false)
  }

  const chip = (on: boolean) =>
    `flex h-11 items-center justify-center rounded-lg text-sm font-semibold transition-colors duration-150 ${on ? 'bg-forest text-cream' : 'bg-paper text-ink ring-1 ring-inset ring-rule-strong hover:ring-forest hover:text-forest'}`

  return (
    <Sheet
      open={open}
      onClose={close}
      title="Add to meal plan"
      footer={
        confirming ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-ink">
              Replace <strong>{takenRecipe?.name}</strong> on {DAY_NAMES[day]} {slot} with {recipe.name}?
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setConfirming(false)}>Keep it</Button>
              <Button className="flex-1" onClick={commit}>Replace</Button>
            </div>
          </div>
        ) : (
          <Button className="w-full" onClick={submit}>
            {needsConfirm ? 'Replace this meal…' : sameRecipe ? `Update to ${servings} servings` : `Add to ${DAYS[day]} ${slot}`}
          </Button>
        )
      }
    >
      <p className="text-[15px] text-ink-2">
        <strong className="text-forest">{recipe.name}</strong>, <span className="num">{servings}</span> {servings === 1 ? 'serving' : 'servings'}.
      </p>

      <fieldset className="mt-5">
        <legend className="mb-2 text-sm font-semibold text-ink">Day</legend>
        <div className="grid grid-cols-7 gap-1.5">
          {DAYS.map((d, i) => {
            const busy = !!plan[i]?.[slot]
            return (
              <button key={d} type="button" aria-pressed={day === i} aria-label={`${DAY_NAMES[i]}${busy ? `, ${slot} planned` : ''}`} onClick={() => pickDay(i)} className={`${chip(day === i)} relative flex-col gap-0.5`}>
                {d}
                <span aria-hidden className={`size-1.5 rounded-full ${busy ? (day === i ? 'bg-leaf' : 'bg-terracotta') : 'bg-transparent'}`} />
              </button>
            )
          })}
        </div>
        <p className="mt-2 text-xs text-ink-2">A dot means that day already has a {slot} planned.</p>
      </fieldset>

      <fieldset className="mt-5">
        <legend className="mb-2 text-sm font-semibold text-ink">Meal</legend>
        <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${slots.length}, minmax(0, 1fr))` }}>
          {slots.map((s) => (
            <button key={s} type="button" aria-pressed={slot === s} onClick={() => pickSlot(s)} className={chip(slot === s)}>
              {SLOT_LABEL[s]}
            </button>
          ))}
        </div>
        {slots.length < 3 && <p className="mt-2 text-xs text-ink-2">This recipe suits {slots.join(' or ')}.</p>}
      </fieldset>

      <div className="mt-5 rounded-lg bg-cream px-4 py-3 text-sm" aria-live="polite">
        {takenRecipe ? (
          sameRecipe ? (
            <p className="text-ink">{DAY_NAMES[day]} {slot} already has this recipe ({taken?.servings} servings). Saving updates the servings.</p>
          ) : (
            <p className="flex gap-2 text-terracotta-ink">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden />
              <span>
                {DAY_NAMES[day]} {slot} is taken by <strong>{takenRecipe.name}</strong>{taken?.leftover ? ' (leftovers)' : ''}. Adding this will replace it.
              </span>
            </p>
          )
        ) : (
          <p className="text-leaf-ink font-semibold">{DAY_NAMES[day]} {slot} is open.</p>
        )}
      </div>
    </Sheet>
  )
}
