import { ArrowLeft, CalendarPlus, Check, Clock, CookingPot, Repeat, ShoppingBasket } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AddToPlanSheet } from '../components/recipes/AddToPlanSheet'
import { CoverageBar, ExtraCostTag } from '../components/recipes/RecipeEntry'
import { RecipeIllustration } from '../components/recipes/RecipeIllustration'
import { stockMap } from '../lib/pantry'
import { useAvailableStock } from '../components/recipes/useAvailableStock'
import { Button, ButtonLink } from '../components/ui/Button'
import { RollingNumber } from '../components/ui/RollingNumber'
import { EmptyState, ModuleTitle } from '../components/ui/Section'
import { Stepper } from '../components/ui/Stepper'
import { DemoTag, EstimateTag, Tag } from '../components/ui/Tag'
import { INGREDIENT_BY_ID } from '../data/ingredients'
import { RECIPE_BY_ID } from '../data/recipes'
import { money } from '../lib/format'
import { matchRecipe, substitutionsFor, type LineMatch } from '../lib/recipeMatching'
import { displayAmount, formatQty } from '../lib/units'
import { isDemoPantry } from '../store/useStore'
import type { Equipment, Recipe } from '../types'

const EQUIPMENT_LABEL: Record<Equipment, string> = {
  pot: 'Pot',
  skillet: 'Skillet',
  oven: 'Oven',
  'sheet-pan': 'Sheet pan',
  microwave: 'Microwave',
  blender: 'Blender',
  none: 'No cooking needed',
}

const amount = (l: LineMatch, base: number) => {
  const ing = INGREDIENT_BY_ID[l.item.ingredientId]
  const { qty, unit } = displayAmount(ing, base, l.item.unit)
  return formatQty(qty, unit)
}
const lineCost = (l: LineMatch) => (l.need / 100) * INGREDIENT_BY_ID[l.item.ingredientId].pricePerBase

export default function RecipeDetail() {
  const { id = '' } = useParams()
  const recipe = RECIPE_BY_ID[id]
  if (!recipe) {
    return (
      <div className="modules">
        <div className="module">
          <EmptyState title="We couldn’t find that recipe" action={<ButtonLink to="/recipes" icon={<ArrowLeft size={17} />}>Back to recipes</ButtonLink>}>
            The link may be old or mistyped. All of our recipes are on the Recipes page.
          </EmptyState>
        </div>
      </div>
    )
  }
  return <Detail key={recipe.id} recipe={recipe} />
}

function Detail({ recipe }: { recipe: Recipe }) {
  const { pantry, inPlan } = useAvailableStock(recipe.id)
  const stock = useMemo(() => stockMap(pantry), [pantry])
  const [servings, setServings] = useState(recipe.servings)
  const [sheetOpen, setSheetOpen] = useState(false)
  const match = useMemo(() => matchRecipe(recipe, stock, servings), [recipe, stock, servings])
  const subs = useMemo(() => substitutionsFor(match, stock), [match, stock])

  const inPantry = match.lines.filter((l) => l.staple || l.missing <= 0.5)
  const toBuy = match.lines.filter((l) => !l.staple && l.missing > 0.5)
  const nutrition = [
    { label: 'Calories', value: `${Math.round(match.perServing.kcal)}`, unit: 'kcal' },
    { label: 'Protein', value: `${Math.round(match.perServing.protein)}`, unit: 'g' },
    { label: 'Fiber', value: `${Math.round(match.perServing.fiber)}`, unit: 'g' },
    { label: 'Vegetables & fruit', value: match.vegServings.toFixed(1), unit: 'servings' },
  ]

  return (
    <div>
      <ButtonLink to="/recipes" variant="ghost" size="sm" className="-ml-3 mb-4" icon={<ArrowLeft size={16} />}>All recipes</ButtonLink>

      <div className="modules mb-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="module p-0! relative">
          <RecipeIllustration recipe={recipe} className="block aspect-[4/3] h-full w-full" />
        </div>
        <div className="module flex flex-col gap-5">
          <div>
            <h1 className="display text-[clamp(2.25rem,5vw,3.5rem)] text-forest">{recipe.name}</h1>
            <p className="mt-3 text-[17px] leading-relaxed text-ink-2">{recipe.blurb}</p>
            <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-ink-2">
              <span className="inline-flex items-center gap-1"><Clock size={15} aria-hidden /> <span className="num">{recipe.minutes}</span> min</span>
              {isDemoPantry(pantry) && <DemoTag>Demo pantry</DemoTag>}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-ink">Servings</span>
            <Stepper value={servings} onChange={setServings} label="servings" min={1} max={12} />
            {servings !== recipe.servings && (
              <button type="button" onClick={() => setServings(recipe.servings)} className="h-10 rounded-lg px-2 text-sm font-semibold text-forest underline underline-offset-4 hover:bg-forest/[0.07]">
                Reset to {recipe.servings}
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-rule ring-1 ring-rule">
            <div className="bg-paper p-3">
              <p className="text-xs font-semibold text-ink-2">Cost per serving <span className="font-normal">(est.)</span></p>
              <RollingNumber value={money(match.costPerServing)} className="display mt-1 text-3xl text-forest" />
            </div>
            <div className="bg-paper p-3">
              <p className="text-xs font-semibold text-ink-2">Still to buy <span className="font-normal">(est.)</span></p>
              <div className="mt-1.5"><ExtraCostTag match={match} /></div>
            </div>
          </div>

          <CoverageBar match={match} />
          <p className="text-xs text-ink-2">
            {inPlan ? 'This meal is already in your week plan. Amounts below count everything in your pantry.' : 'Amounts below count everything in your pantry.'}
          </p>

          <Button size="lg" icon={<CalendarPlus size={18} />} onClick={() => setSheetOpen(true)} className="self-start">
            Add to meal plan
          </Button>
        </div>
      </div>

      <div className="modules lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className="module" aria-labelledby="ing-title">
          <ModuleTitle id="ing-title" right={<span className="text-xs text-ink-2">for <span className="num">{servings}</span> servings</span>}>Ingredients</ModuleTitle>

          <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-leaf-ink"><Check size={16} aria-hidden /> In your pantry <span className="num font-normal text-ink-2">({inPantry.length})</span></h3>
          {inPantry.length ? (
            <ul className="mb-5 divide-y divide-leaf/40 overflow-hidden rounded-lg bg-leaf-wash">
              {inPantry.map((l, i) => (
                <IngredientRow key={`${l.item.ingredientId}-${i}`} line={l} amountText={amount(l, l.need)} cost={lineCost(l)} />
              ))}
            </ul>
          ) : (
            <p className="mb-5 rounded-lg bg-cream px-3 py-3 text-sm text-ink-2">None of these are in your pantry yet.</p>
          )}

          <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-terracotta-ink"><ShoppingBasket size={16} aria-hidden /> To buy <span className="num font-normal text-ink-2">({toBuy.length})</span></h3>
          {toBuy.length ? (
            <ul className="divide-y divide-terracotta/30 overflow-hidden rounded-lg bg-terracotta-wash">
              {toBuy.map((l, i) => {
                const sub = subs.find((s) => s.from === l.item.ingredientId)
                return (
                  <IngredientRow
                    key={`${l.item.ingredientId}-${i}`}
                    line={l}
                    amountText={amount(l, l.missing)}
                    cost={l.missingCost}
                    partial={l.have > 0.5 ? amount(l, l.have) : undefined}
                    sub={sub ? { name: INGREDIENT_BY_ID[sub.to]?.name ?? sub.to, note: sub.note } : undefined}
                  />
                )
              })}
            </ul>
          ) : (
            <p className="rounded-lg bg-leaf-wash px-3 py-3 text-sm font-semibold text-leaf-ink">Nothing to buy. You can make this with what you have.</p>
          )}
          <p className="mt-3 text-xs text-ink-2">Costs are rough U.S. grocery estimates; local prices vary. Optional items are not counted in the cost to buy.</p>
        </section>

        <section className="module" aria-labelledby="nut-title">
          <ModuleTitle id="nut-title" right={<EstimateTag />}>Nutrition per serving</ModuleTitle>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-rule ring-1 ring-rule">
            {nutrition.map((n) => (
              <div key={n.label} className="bg-paper p-3">
                <dt className="text-xs font-semibold text-ink-2">{n.label}</dt>
                <dd className="mt-1 flex items-baseline gap-1">
                  <RollingNumber value={n.value} className="display text-3xl text-forest" />
                  <span className="text-sm text-ink-2">{n.unit}</span>
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 rounded-lg bg-cream px-4 py-3 text-sm leading-relaxed text-ink-2">
            <p className="font-semibold text-ink">How we estimate</p>
            <p className="mt-1">
              We add up USDA FoodData Central reference values for each ingredient, including optional ones only when you have them, and divide by servings.
              A vegetable or fruit serving is about 80 g. Actual amounts vary by brand and preparation. This is general information, not medical or dietary advice.
            </p>
          </div>
        </section>

        <section className="module" aria-labelledby="steps-title">
          <ModuleTitle id="steps-title">Steps</ModuleTitle>
          <ol className="space-y-4">
            {recipe.steps.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="display num grid size-8 shrink-0 place-items-center rounded-full bg-forest text-[15px] text-cream" aria-hidden>{i + 1}</span>
                <p className="pt-1 text-[15px] leading-relaxed text-ink"><span className="sr-only">Step {i + 1}: </span>{s}</p>
              </li>
            ))}
          </ol>
          {servings !== recipe.servings && <p className="mt-4 text-xs text-ink-2">Steps are written for {recipe.servings} servings; cook times may run a little longer for bigger batches.</p>}
        </section>

        <section className="module flex flex-col gap-5" aria-labelledby="eq-title">
          <div>
            <ModuleTitle id="eq-title">Equipment</ModuleTitle>
            <ul className="flex flex-wrap gap-2">
              {recipe.equipment.map((e) => (
                <li key={e}><Tag icon={<CookingPot size={13} aria-hidden />} className="px-2 py-1 text-sm">{EQUIPMENT_LABEL[e]}</Tag></li>
              ))}
            </ul>
          </div>
          <div>
            <ModuleTitle as="h3">Good for</ModuleTitle>
            <ul className="flex flex-wrap gap-2">
              {recipe.meal.map((m) => <li key={m}><Tag className="px-2 py-1 text-sm capitalize">{m}</Tag></li>)}
              {recipe.tags.map((t) => <li key={t}><Tag tone="have" className="px-2 py-1 text-sm">{t}</Tag></li>)}
            </ul>
          </div>
        </section>
      </div>

      <AddToPlanSheet key={recipe.id} recipe={recipe} servings={servings} open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  )
}

function IngredientRow({ line, amountText, cost, partial, sub }: { line: LineMatch; amountText: string; cost: number; partial?: string; sub?: { name: string; note: string } }) {
  const ing = INGREDIENT_BY_ID[line.item.ingredientId]
  return (
    <li className="flex items-start justify-between gap-3 px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-[15px] text-ink">
          <span className="num font-bold">{amountText}</span> {ing.name.toLowerCase()}
          {line.item.optional && <Tag className="ml-2 align-middle">optional</Tag>}
          {line.staple && <Tag className="ml-2 align-middle">pantry basic</Tag>}
        </p>
        {line.item.note && <p className="text-sm text-ink-2">{line.item.note}</p>}
        {partial && <p className="text-sm text-ink-2">You have {partial}; this is the rest.</p>}
        {sub && (
          <p className="mt-1 flex items-start gap-1.5 text-sm text-leaf-ink">
            <Repeat size={14} className="mt-0.5 shrink-0" aria-hidden />
            <span>Or use <strong>{sub.name.toLowerCase()}</strong> (in your pantry). <span className="text-ink-2">{sub.note}</span></span>
          </p>
        )}
      </div>
      <span className="num shrink-0 pt-0.5 text-sm text-ink-2">{money(cost)}</span>
    </li>
  )
}
