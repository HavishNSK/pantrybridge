import { ArrowRight, CalendarDays, Clock, HandHeart, ScanLine } from 'lucide-react'
import { lazy, Suspense, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { StaticPantryFallback } from '../components/hero/StaticPantryFallback'
import { RecipeIllustration } from '../components/recipes/RecipeIllustration'
import { ButtonLink } from '../components/ui/Button'
import { RollingNumber } from '../components/ui/RollingNumber'
import { ModuleTitle } from '../components/ui/Section'
import { DemoTag, EstimateTag, Tag } from '../components/ui/Tag'
import { CATEGORY_LABEL, INGREDIENT_BY_ID } from '../data/ingredients'
import { RECIPE_BY_ID } from '../data/recipes'
import { money, shortDate, todayIndex, weekOf } from '../lib/format'
import { expiringSoon, pantryValue } from '../lib/pantry'
import { analyzePlan, budgetPace, DAYS, plannedCount, SLOTS } from '../lib/planner'
import { formatQty } from '../lib/units'
import { isDemoPantry, useStore } from '../store/useStore'
import type { Category, PantryItem } from '../types'

const PantryHero = lazy(() => import('../components/hero/PantryHero'))

export function Overview() {
  const pantry = useStore((s) => s.pantry)
  const plan = useStore((s) => s.plan)
  const budget = useStore((s) => s.budget)
  const demo = isDemoPantry(pantry)
  const safeWater = useStore((s) => s.cookingPreferences.safeWater)
  const analysis = useMemo(() => analyzePlan(plan, pantry, { safeWater }), [plan, pantry, safeWater])
  const soon = useMemo(() => expiringSoon(pantry, 7).slice(0, 5), [pantry])
  const today = todayIndex()

  return (
    <div className="space-y-6">
      <section aria-labelledby="hero-title" className="modules lg:grid-cols-12">
        {/* Lead feature: headline over the live 3D pantry. */}
        <div className="module flex flex-col lg:col-span-7 lg:row-span-3 !p-0">
          <div className="p-5 sm:p-7 pb-0 sm:pb-0">
            <div className="flex flex-wrap items-center gap-2 text-sm text-ink-2">
              {demo && <DemoTag>Demo pantry</DemoTag>}
              <span className="num">{pantry.length} ingredients on hand</span>
              <span aria-hidden="true">·</span>
              <span>worth about {money(pantryValue(pantry), 0)} <span className="text-ink-2/80">(est.)</span></span>
            </div>
            <h1 id="hero-title" className="display mt-3 text-[clamp(2.6rem,6.2vw,5.25rem)] text-forest">
              Make more from what you have.
            </h1>
            <p className="mt-4 max-w-[34rem] text-[17px] leading-relaxed text-ink-2">
              Discover nourishing meals, stretch your grocery budget, and make every ingredient count.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink to="/scan" size="lg" icon={<ScanLine size={19} />}>Add food</ButtonLink>
              <ButtonLink to="/planner#three-dinners" size="lg" variant="secondary" icon={<CalendarDays size={19} />}>Find three dinners</ButtonLink>
            </div>
          </div>
          <div className="relative mt-5 aspect-square sm:aspect-[4/3] lg:aspect-auto lg:min-h-[420px] lg:flex-1 border-t border-rule bg-cream">
            <Suspense fallback={<StaticPantryFallback className="absolute inset-0" />}>
              <PantryHero className="absolute inset-0" />
            </Suspense>
          </div>
        </div>

        <BudgetModule extra={analysis.additionalCost} budget={budget} />
        <UseSoonModule items={soon} />
        <TonightModule today={today} plan={plan} analysis={analysis} />

        <WeekStrip today={today} plan={plan} analysis={analysis} />

        <InventoryModule pantry={pantry} />
        <SupportModule />
      </section>
    </div>
  )
}

type Plan = ReturnType<typeof useStore.getState>['plan']
type Analysis = ReturnType<typeof analyzePlan>

function TonightModule({ today, plan, analysis }: { today: number; plan: Plan; analysis: Analysis }) {
    const day = plan[today] ?? {}
    const entry = day.dinner ?? day.lunch ?? day.breakfast
    const meal = analysis.meals.find((m) => m.day === today && m.entry === entry)
    const recipe = entry ? RECIPE_BY_ID[entry.recipeId] : undefined
    return (
      <div className="module lg:col-span-5">
        <ModuleTitle right={<Link to="/recipes" className="text-sm font-semibold text-forest underline">All recipes</Link>}>
          Today's suggested meal
        </ModuleTitle>
        {recipe && entry ? (
          <Link to={`/recipes/${recipe.id}`} className="group flex items-center gap-4 rounded-lg">
            <RecipeIllustration recipe={recipe} className="h-20 w-[106px] shrink-0 rounded-md" />
            <div className="min-w-0">
              <p className="condensed text-xl font-bold leading-tight text-ink group-hover:text-forest group-hover:underline">{recipe.name}</p>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-2">
                <span className="inline-flex items-center gap-1"><Clock size={14} /> {recipe.minutes} min</span>
                <span className="num">Serves {entry.servings}</span>
                {entry.leftover ? (
                  <Tag tone="have">Leftovers</Tag>
                ) : meal?.match && meal.match.canMake ? (
                  <Tag tone="have">All from your pantry</Tag>
                ) : (
                  meal?.match && <Tag tone="price">+{money(meal.match.additionalCost)}</Tag>
                )}
              </p>
            </div>
          </Link>
        ) : (
          <p className="text-ink-2">
            Nothing planned for today. <Link to="/planner" className="font-semibold text-forest underline">Pick a meal</Link> or{' '}
            <Link to="/recipes?filter=only-mine" className="font-semibold text-forest underline">see what you can make now</Link>.
          </p>
        )}
      </div>
    )
  }

function WeekStrip({ today, plan, analysis }: { today: number; plan: Plan; analysis: Analysis }) {
    const count = plannedCount(plan)
    const days = useMemo(() => {
      const start = weekOf()
      return DAYS.map((_, i) => {
        const d = new Date(start)
        d.setDate(d.getDate() + i)
        return d
      })
    }, [])
    return (
      <div className="module lg:col-span-12">
        <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h2 className="condensed text-[15px] font-extrabold uppercase tracking-[0.04em] text-forest">This week</h2>
          <p className="num text-sm text-ink-2"><strong className="text-ink">{count}</strong> of 21 meals planned · {analysis.fromPantryCount} from your pantry</p>
        </div>
        <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-rule" role="progressbar" aria-label="Meals planned this week" aria-valuemin={0} aria-valuemax={21} aria-valuenow={count}>
          <div className="h-full rounded-full bg-leaf transition-[width] duration-500 ease-[var(--ease-out-expo)]" style={{ width: `${(count / 21) * 100}%` }} />
        </div>
        <ol className="-mx-5 grid grid-cols-2 border-t border-rule sm:grid-cols-4 lg:grid-cols-7">
          {DAYS.map((d, i) => {
            const dinner = plan[i]?.dinner
            const recipe = dinner ? RECIPE_BY_ID[dinner.recipeId] : undefined
            const n = SLOTS.filter((s) => plan[i]?.[s]).length
            return (
              <li key={d} aria-current={i === today ? 'date' : undefined} className={`border-b border-r border-rule px-5 py-3 ${i === today ? 'bg-leaf-wash/60' : ''}`}>
                <p className="flex items-baseline justify-between">
                  <span className={`condensed text-sm font-extrabold uppercase tracking-wide ${i === today ? 'text-forest' : 'text-ink-2'}`}>
                    {d} <span className="num font-semibold">{shortDate(days[i]).split(' ')[1]}</span>
                    {i === today && <span className="ml-1.5 normal-case tracking-normal font-semibold text-leaf-ink">Today</span>}
                  </span>
                  <span className="num text-xs text-ink-2" aria-label={`${n} of 3 meals planned`}>{n}/3</span>
                </p>
                <p className="mt-1 line-clamp-2 min-h-[2.5em] text-[15px] font-medium leading-tight text-ink">
                  {recipe ? recipe.name : <span className="text-ink-2">No dinner yet</span>}
                </p>
              </li>
            )
          })}
        </ol>
        <div className="mt-4 flex justify-end">
          <ButtonLink to="/planner" variant="ghost" size="sm">Open the planner <ArrowRight size={16} /></ButtonLink>
        </div>
      </div>
    )
  }

function InventoryModule({ pantry }: { pantry: PantryItem[] }) {
    const byCat = new Map<Category, number>()
    for (const p of pantry) {
      const ing = INGREDIENT_BY_ID[p.ingredientId]
      if (!ing || ing.staple) continue
      byCat.set(ing.category, (byCat.get(ing.category) ?? 0) + 1)
    }
    const rows = [...byCat.entries()].sort((a, b) => b[1] - a[1])
    const max = Math.max(1, ...rows.map((r) => r[1]))
    return (
      <div className="module lg:col-span-8">
        <ModuleTitle right={<Link to="/pantry" className="text-sm font-semibold text-forest underline">Manage pantry</Link>}>Pantry inventory</ModuleTitle>
        {rows.length ? (
          <dl className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
            {rows.map(([cat, n]) => (
              <div key={cat} className="grid grid-cols-[1fr_auto] items-center gap-x-3">
                <dt className="text-[15px] text-ink">{CATEGORY_LABEL[cat]}</dt>
                <dd className="num text-sm font-bold text-ink">{n}</dd>
                <div className="col-span-2 h-1 rounded-full bg-cream" aria-hidden="true">
                  <div className="h-full rounded-full bg-forest/70" style={{ width: `${(n / max) * 100}%` }} />
                </div>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-ink-2">Your pantry is empty. <Link to="/scan" className="font-semibold text-forest underline">Scan</Link> or add items to get meal ideas.</p>
        )}
      </div>
    )
}

function BudgetModule({ extra, budget }: { extra: number; budget: ReturnType<typeof useStore.getState>['budget'] }) {
  const pace = budgetPace(budget)
  const share = pace ? Math.min(1, extra / Math.max(0.01, pace.perWeek)) : 0
  const over = pace ? extra > pace.perWeek : false
  return (
    <div className="module lg:col-span-5">
      <ModuleTitle right={<EstimateTag />}>Grocery budget</ModuleTitle>
      <p className="flex items-baseline gap-2">
        <RollingNumber value={money(extra)} className="display text-5xl text-forest" label={`${money(extra)} estimated to buy this week`} />
        <span className="text-ink-2">{pace ? <>of <span className="num font-semibold text-ink">{money(pace.perWeek, 0)}</span> this week</> : 'to buy this week'}</span>
      </p>
      {pace ? (
        <>
          {/* Fixed-capacity strip: the week's allowance is the whole bar. */}
          <div className="mt-3 flex h-3 gap-[2px]" role="meter" aria-label="Share of weekly budget planned" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(share * 100)} aria-valuetext={over ? `Over this week's budget by ${money(extra - (pace?.perWeek ?? 0))}` : `${Math.round(share * 100)}% of this week's budget`}>
            {Array.from({ length: 20 }, (_, i) => (
              <span key={i} className={`flex-1 rounded-[2px] transition-colors duration-300 ${i < Math.round(share * 20) ? (over ? 'bg-terracotta' : 'bg-leaf') : 'bg-rule'}`} style={{ transitionDelay: `${i * 15}ms` }} />
            ))}
          </div>
          <p className="mt-2 text-sm text-ink-2">
            {over ? (
              <><strong className="font-semibold text-terracotta-ink">Over by {money(extra - pace.perWeek)}.</strong> <Link to="/planner#budget" className="font-semibold text-forest underline">See lower-cost swaps</Link></>
            ) : (
              <><span className="num">{money(pace.perWeek - extra)}</span> left this week for the rest of your list.</>
            )}
          </p>
        </>
      ) : (
        <p className="mt-2 text-sm text-ink-2">
          Extra groceries for this week's plan. <Link to="/planner#budget" className="font-semibold text-forest underline">Set a budget</Link> to pace your spending. It's optional.
        </p>
      )}
    </div>
  )
}

function UseSoonModule({ items }: { items: ReturnType<typeof expiringSoon> }) {
  return (
    <div className="module lg:col-span-5">
      <ModuleTitle right={<Link to="/pantry" className="text-sm font-semibold text-forest underline">See all</Link>}>Use soon</ModuleTitle>
      {items.length ? (
        <ul className="divide-y divide-rule">
          {items.map((it) => {
            const ing = INGREDIENT_BY_ID[it.ingredientId]
            return (
              <li key={it.uid} className="flex items-center justify-between gap-3 py-2">
                <span className="min-w-0 truncate text-[15px] text-ink">
                  {ing?.name} <span className="num text-ink-2">· {formatQty(it.quantity, it.unit)}</span>
                </span>
                <Tag tone={it.days <= 2 ? 'need' : 'neutral'} className="num shrink-0">
                  {it.days < 0 ? 'Past date' : it.days === 0 ? 'Today' : `${it.days} day${it.days === 1 ? '' : 's'}`}
                </Tag>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="text-ink-2">Nothing expires in the next week.</p>
      )}
    </div>
  )
}

function SupportModule() {
  return (
    <Link to="/support" className="module group flex items-start gap-4 lg:col-span-4 hover:bg-cream transition-colors">
      <HandHeart className="mt-0.5 shrink-0 text-leaf-ink" size={22} />
      <span>
        <span className="condensed block text-lg font-bold text-forest group-hover:underline">Find food assistance</span>
        <span className="mt-1 block text-[15px] text-ink-2">Food banks, SNAP, WIC, and kids' meals across Arkansas. Private, and no sign-up needed.</span>
      </span>
    </Link>
  )
}
