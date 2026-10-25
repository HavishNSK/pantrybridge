import { Check, PackageCheck, Search, X } from 'lucide-react'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { GridFillers, RecipeEntry } from '../components/recipes/RecipeEntry'
import { missingNames } from '../components/recipes/matchText'
import { stockMap } from '../lib/pantry'
import { useAvailableStock } from '../components/recipes/useAvailableStock'
import { Button, ButtonLink } from '../components/ui/Button'
import { EmptyState, PageHeader } from '../components/ui/Section'
import { DemoTag } from '../components/ui/Tag'
import { RECIPES } from '../data/recipes'
import { money } from '../lib/format'
import { applyFilters, FILTERS, matchRecipe, type FilterId, type RecipeMatch } from '../lib/recipeMatching'
import { isDemoPantry } from '../store/useStore'

const VALID = new Set<string>(FILTERS.map((f) => f.id))
const LABEL = Object.fromEntries(FILTERS.map((f) => [f.id, f.label])) as Record<FilterId, string>

function parseFilters(raw: string | null): FilterId[] {
  if (!raw) return []
  return raw.split(',').filter((id, i, all): id is FilterId => VALID.has(id) && all.indexOf(id) === i)
}

const SORT_LABEL = (active: Set<FilterId>) =>
  active.has('lowest-cost') ? 'lowest added cost first' : active.has('protein') ? 'most protein first' : active.has('veg') ? 'most vegetables first' : 'best pantry match first'

export default function Recipes() {
  const [params, setParams] = useSearchParams()
  // Browsing counts the whole pantry; opting in sets aside what the week plan already uses.
  const reserve = params.get('reserve') === '1'
  const available = useAvailableStock()
  const { pantry, planned } = available
  const stock = useMemo(() => (reserve ? available.stock : stockMap(pantry)), [reserve, available.stock, pantry])
  const filterKey = params.get('filter')
  const active = useMemo(() => new Set(parseFilters(filterKey)), [filterKey])
  const query = params.get('q') ?? ''

  const matches = useMemo(() => RECIPES.map((r) => matchRecipe(r, stock)), [stock])
  const results = useMemo(() => applyFilters(matches, active, query), [matches, active, query])

  const update = (next: Set<FilterId>, q = query) => {
    const p = new URLSearchParams(params)
    // Keep the URL in FILTERS order so links are stable.
    const ids = FILTERS.map((f) => f.id).filter((id) => next.has(id))
    if (ids.length) p.set('filter', ids.join(','))
    else p.delete('filter')
    if (q.trim()) p.set('q', q)
    else p.delete('q')
    setParams(p, { replace: true })
  }
  const toggle = (id: FilterId) => {
    const next = new Set(active)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    update(next)
  }

  const primary = FILTERS[0]
  const rest = FILTERS.slice(1)
  const onlyMine = active.has('only-mine')

  return (
    <div>
      <PageHeader
        title="Recipes"
        lede="Meals matched to what you already have, with the cost of anything you would still need to buy."
        meta={
          <>
            {isDemoPantry(pantry) && <DemoTag>Demo pantry</DemoTag>}
            {planned > 0 ? (
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink-2">
                <input
                  type="checkbox"
                  checked={reserve}
                  onChange={(e) => {
                    const p = new URLSearchParams(params)
                    if (e.target.checked) p.set('reserve', '1')
                    else p.delete('reserve')
                    setParams(p, { replace: true })
                  }}
                  className="size-4 accent-[var(--color-forest)]"
                />
                Set aside ingredients for the {planned} {planned === 1 ? 'meal' : 'meals'} already in my week plan
              </label>
            ) : (
              <p className="text-sm text-ink-2">Matches count everything in your pantry.</p>
            )}
          </>
        }
      />

      <section aria-label="Filter recipes" className="modules mb-6">
        <div className="module flex flex-col gap-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <button
              type="button"
              aria-pressed={onlyMine}
              title={primary.hint}
              onClick={() => toggle(primary.id)}
              className={`inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg px-4 text-[15px] font-bold transition-colors duration-150 ${
                onlyMine ? 'bg-forest text-cream hover:bg-forest-2' : 'bg-paper text-forest ring-2 ring-inset ring-forest hover:bg-leaf-wash'
              }`}
            >
              {onlyMine ? <Check size={18} strokeWidth={2.6} aria-hidden /> : <PackageCheck size={18} aria-hidden />}
              {primary.label}
            </button>
            <label className="relative flex-1">
              <span className="sr-only">Search recipes or ingredients</span>
              <Search size={17} aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-2" />
              <input
                type="search"
                value={query}
                onChange={(e) => update(active, e.target.value)}
                placeholder="Search recipes or ingredients…"
                className="h-12 w-full rounded-lg bg-paper pl-10 pr-3 text-[16px] text-ink ring-1 ring-inset ring-rule-strong placeholder:text-ink-2/70 hover:ring-ink-2 focus:outline-none focus:ring-2 focus:ring-forest"
              />
            </label>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="More filters">
            {rest.map((f) => {
              const on = active.has(f.id)
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={on}
                  title={f.hint}
                  onClick={() => toggle(f.id)}
                  className={`inline-flex h-10 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold transition-colors duration-150 ${
                    on ? 'bg-leaf-wash text-forest ring-1 ring-inset ring-forest' : 'bg-cream text-ink-2 ring-1 ring-inset ring-rule-strong hover:text-forest hover:ring-forest'
                  }`}
                >
                  {on && <Check size={15} strokeWidth={2.6} aria-hidden />}
                  {f.label}
                </button>
              )
            })}
            {(active.size > 0 || query) && (
              <button type="button" onClick={() => update(new Set(), '')} className="inline-flex h-10 items-center gap-1 rounded-full px-3 text-sm font-semibold text-forest underline underline-offset-4 hover:bg-forest/[0.07]">
                <X size={15} aria-hidden /> Clear all
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2" aria-live="polite">
        <p className="text-[15px] text-ink">
          <span className="num font-bold">{results.length}</span> {results.length === 1 ? 'recipe' : 'recipes'}
          <span className="text-ink-2"> of {RECIPES.length}</span>
        </p>
        {results.length > 1 && <p className="text-sm text-ink-2">Sorted {SORT_LABEL(active)}</p>}
      </div>

      {results.length > 0 ? (
        <ul className="modules grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((m) => (
            <li key={m.recipe.id} className="module flex flex-col p-0!">
              <RecipeEntry match={m} />
            </li>
          ))}
          <GridFillers count={results.length} />
        </ul>
      ) : (
        <div className="modules">
          <div className="module">
            <NoResults matches={matches} active={active} query={query} pantryEmpty={pantry.length === 0} onUpdate={update} />
          </div>
        </div>
      )}
    </div>
  )
}

function NoResults({ matches, active, query, pantryEmpty, onUpdate }: { matches: RecipeMatch[]; active: Set<FilterId>; query: string; pantryEmpty: boolean; onUpdate: (next: Set<FilterId>, q?: string) => void }) {
  const without = (id: FilterId) => {
    const s = new Set(active)
    s.delete(id)
    return s
  }
  // Which single filter, when removed, brings results back?
  const culprits = [...active].filter((id) => applyFilters(matches, without(id), query).length > 0)
  const queryCulprit = query.trim() !== '' && applyFilters(matches, active, '').length > 0

  if (active.has('only-mine')) {
    const pool = applyFilters(matches, without('only-mine'), query)
    const closest = [...pool].sort((a, b) => a.missingRequired.length - b.missingRequired.length || a.additionalCost - b.additionalCost)[0]
    if (pantryEmpty) {
      return (
        <EmptyState title="Your pantry is empty" action={<ButtonLink to="/pantry">Add what you have</ButtonLink>}>
          “Use only my ingredients” needs a pantry to work from. Add a few items, or scan a shelf, and matching meals will appear here.
        </EmptyState>
      )
    }
    if (closest) {
      const names = missingNames(closest)
      return (
        <EmptyState
          title="Nothing is fully covered yet"
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <ButtonLink to={`/recipes/${closest.recipe.id}`}>See {closest.recipe.name}</ButtonLink>
              <Button variant="secondary" onClick={() => onUpdate(without('only-mine'))}>Show recipes that need a few items</Button>
            </div>
          }
        >
          The closest match is <strong className="text-forest">{closest.recipe.name}</strong>. You would only need{' '}
          <span className="text-terracotta-ink font-semibold">{names.join(', ')}</span>, about <span className="num">{money(closest.additionalCost)}</span> more (est.).
        </EmptyState>
      )
    }
  }

  const named = culprits[0]
  return (
    <EmptyState
      title="No recipes match all of these"
      action={
        <div className="flex flex-wrap justify-center gap-2">
          {named && <Button onClick={() => onUpdate(without(named))}>Remove “{LABEL[named]}”</Button>}
          {!named && queryCulprit && <Button onClick={() => onUpdate(active, '')}>Clear the search</Button>}
          <Button variant="secondary" onClick={() => onUpdate(new Set(), '')}>Clear all filters</Button>
        </div>
      }
    >
      {named ? (
        <>“{LABEL[named]}” is the filter ruling everything out. Removing it brings back <span className="num">{applyFilters(matches, without(named), query).length}</span> recipes.</>
      ) : queryCulprit ? (
        <>No recipe or ingredient matches “{query}” with these filters. Try a different word, such as an ingredient you have.</>
      ) : (
        <>No single filter is the cause; together they rule everything out. Try removing one or two.</>
      )}
    </EmptyState>
  )
}
