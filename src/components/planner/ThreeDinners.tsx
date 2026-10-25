import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { INGREDIENT_BY_ID } from '../../data/ingredients'
import { suggestDinners } from '../../lib/dinnerPlanning'
import { money } from '../../lib/format'
import { useStore } from '../../store/useStore'
import { Button, ButtonLink } from '../ui/Button'
import { ModuleTitle } from '../ui/Section'
import { toast } from '../ui/Toast'
import { ConfirmSheet } from './ConfirmSheet'
import { CookingPreferences } from './CookingPreferences'
import { EQUIPMENT_LABEL } from './equipment'

type Preview = ReturnType<typeof suggestDinners>

export function ThreeDinners() {
  const pantry = useStore((s) => s.pantry)
  const plan = useStore((s) => s.plan)
  const household = useStore((s) => s.household)
  const preferences = useStore((s) => s.cookingPreferences)
  const setPreferences = useStore((s) => s.setCookingPreferences)
  const replacePlan = useStore((s) => s.replacePlan)
  const [snapshot, setSnapshot] = useState<{ key: string; result: Preview } | null>(null)
  const [confirm, setConfirm] = useState(false)
  const key = JSON.stringify([pantry, plan, household, preferences])
  const preview = snapshot?.key === key ? snapshot.result : null
  const ref = useRef<HTMLElement>(null)
  const { hash } = useLocation()
  useEffect(() => {
    if (hash === '#three-dinners') ref.current?.scrollIntoView({ block: 'start' })
  }, [hash])

  const save = () => {
    if (!preview?.meals.length) return
    replacePlan(preview.plan)
    setSnapshot(null)
    toast('Dinners saved. Your pantry is unchanged.')
  }

  return (
    <section id="three-dinners" ref={ref} aria-labelledby="three-title" className="modules mb-6 scroll-mt-24">
      <div className="module">
        <ModuleTitle id="three-title">Your next three dinners</ModuleTitle>
        <p className="mb-5 max-w-3xl text-[15px] leading-relaxed text-ink-2">Choose your cooking setup. We’ll find up to three dinners for {household} {household === 1 ? 'person' : 'people'}.</p>
        <CookingPreferences value={preferences} onChange={setPreferences} />
        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-rule pt-4">
          <Button onClick={() => { setSnapshot({ key, result: suggestDinners(pantry, plan, household, preferences) }); setConfirm(false) }}>Preview three dinners</Button>
          <ButtonLink to="/scan" variant="secondary">Add a food box or receipt</ButtonLink>
        </div>
      </div>
      {snapshot && !preview && <p role="status" className="module text-sm text-ink-2">Your pantry, plan, or preferences changed. Preview again before saving.</p>}
      {preview && (
        <div className="module" aria-live="polite">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="display text-2xl text-forest">{preview.meals.length} of 3 dinners fit</h3>
            <p className="text-sm">Groceries for your week: <strong>{money(preview.additionalCost)}</strong> (est.)</p>
          </div>
          {preview.meals.length === 0 && <p className="mb-4 text-sm text-ink-2">{preview.reason}</p>}
          {preview.preservedCost > 0 && <p className="mb-4 text-sm text-terracotta-ink">Meals you’re keeping already need {money(preview.preservedCost)} in additional groceries (est.). Adjust those meals or use “Clear week” above to start a new plan.</p>}
          <ol className="grid gap-4 lg:grid-cols-3">
            {preview.meals.map((meal, i) => (
              <li key={meal.recipe.id} className="rounded-lg border border-rule p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-leaf-ink">{['Monday', 'Tuesday', 'Wednesday'][i]} dinner</p>
                <Link to={`/recipes/${meal.recipe.id}`} className="mt-1 block text-lg font-bold text-forest underline">{meal.recipe.name}</Link>
                <p className="mt-2 text-sm text-ink-2">Serves {meal.servings} · {meal.recipe.minutes} min · {meal.recipe.equipment.map((e) => EQUIPMENT_LABEL[e]).join(', ')}</p>
                <p className="mt-2 text-sm">{meal.canMake ? 'All required ingredients covered.' : `${money(meal.additionalCost)} extra groceries (est.).`}</p>
                <details className="mt-3 text-sm">
                  <summary className="min-h-10 cursor-pointer font-semibold text-forest">Ingredients and quantities</summary>
                  <ul className="space-y-2 pt-2">
                    {meal.lines.map((line, j) => {
                      const ingredient = INGREDIENT_BY_ID[line.item.ingredientId]
                      return <li key={`${line.item.ingredientId}-${j}`}><strong>{ingredient.name}</strong>{line.item.optional ? ' (optional)' : ''}: {Number(line.need.toFixed(1))} {ingredient.base} needed, {Number(line.have.toFixed(1))} {ingredient.base} covered{line.missing > 0.000001 ? `; ${Number(line.missing.toFixed(1))} ${ingredient.base} missing` : ''}.</li>
                    })}
                  </ul>
                </details>
              </li>
            ))}
          </ol>
          {preview.meals.length < 3 && <p className="mt-4 text-sm text-ink-2">Food, portions, equipment, or time may limit this selection. <Link to="/pantry" className="font-semibold text-forest underline">Check your quantities</Link> or <Link to="/support" className="font-semibold text-forest underline">find food support</Link>.</p>}
          {preview.meals.length > 0 && <div className="mt-5 border-t border-rule pt-4"><Button onClick={() => setConfirm(true)}>Save these dinners</Button><p className="mt-2 text-sm text-ink-2">Up to three Monday–Wednesday dinner slots change. Other meals stay in place.</p></div>}
        </div>
      )}
      <ConfirmSheet open={confirm && !!preview} title="Save these dinners?" confirmLabel="Save dinners to my week" onConfirm={save} onClose={() => setConfirm(false)}>
        Save {preview?.meals.length ?? 0} dinners for {household} people to Monday–Wednesday. This replaces {preview?.replaced ?? 0} existing dinner entries in those slots. Other meals stay in place. Your pantry quantities won’t change.
      </ConfirmSheet>
    </section>
  )
}
