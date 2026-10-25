import { Clock, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { money } from '../../lib/format'
import type { RecipeMatch } from '../../lib/recipeMatching'
import { EstimateTag, Tag } from '../ui/Tag'
import { coverageCounts, missingSummary } from './matchText'
import { RecipeIllustration } from './RecipeIllustration'

export function CoverageBar({ match, className = '' }: { match: RecipeMatch; className?: string }) {
  const { have, total } = coverageCounts(match)
  const pct = total ? (have / total) * 100 : 100
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="font-semibold text-ink">
          You have <span className="num">{have}</span> of <span className="num">{total}</span>
        </span>
        <span className="text-xs text-ink-2">main ingredients</span>
      </div>
      <div
        className="mt-1.5 h-2 overflow-hidden rounded-full bg-terracotta-wash"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={have}
        aria-label={`You have ${have} of ${total} main ingredients`}
      >
        <div className="h-full rounded-full bg-leaf motion-safe:transition-[width] motion-safe:duration-500 motion-safe:ease-[var(--ease-out-expo)]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function ExtraCostTag({ match }: { match: RecipeMatch }) {
  return <Tag tone="price">{match.canMake ? '$0 extra' : `+${money(match.additionalCost)} extra est.`}</Tag>
}

export function RecipeEntry({ match }: { match: RecipeMatch }) {
  const { recipe } = match
  return (
    <Link
      to={`/recipes/${recipe.id}`}
      className="group flex flex-1 flex-col gap-3 bg-paper transition-colors hover:bg-cream/60 focus-visible:-outline-offset-2"
    >
      <div className="relative overflow-hidden border-b border-rule">
        <RecipeIllustration recipe={recipe} className="block aspect-[16/7] w-full motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-[var(--ease-out-expo)] motion-safe:group-hover:scale-[1.03]" />
        <span className="absolute right-3 top-3">
          <ExtraCostTag match={match} />
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 px-4 pb-4">
        <div>
          <h3 className="display text-[22px] text-forest group-hover:underline decoration-1 underline-offset-4">{recipe.name}</h3>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-2">
            <span className="inline-flex items-center gap-1"><Clock size={14} aria-hidden /> <span className="num">{recipe.minutes}</span> min</span>
            <span className="inline-flex items-center gap-1"><Users size={14} aria-hidden /> <span className="num">{recipe.servings}</span> servings</span>
            <span><span className="num">{money(match.costPerServing)}</span>/serving est.</span>
          </p>
        </div>
        <CoverageBar match={match} />
        <p className={`text-sm ${match.canMake ? 'text-leaf-ink font-semibold' : 'text-terracotta-ink'}`}>
          {match.canMake ? 'Everything is on hand' : <>Need: {missingSummary(match)}</>}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-rule pt-3 text-sm text-ink">
          <span><span className="num font-bold">{Math.round(match.perServing.protein)} g</span> protein</span>
          <span><span className="num font-bold">{Math.round(match.perServing.fiber)} g</span> fiber</span>
          <span className="text-ink-2">per serving</span>
          <EstimateTag />
        </div>
      </div>
    </Link>
  )
}

/** Paper fillers so a ruled grid never shows bare rule-colored cells in its last row. */
export function GridFillers({ count }: { count: number }) {
  const f2 = (2 - (count % 2)) % 2
  const f3 = (3 - (count % 3)) % 3
  return (
    <>
      {[0, 1].map((i) => {
        const sm = i < f2 ? 'sm:block' : ''
        const xl = i < f3 ? 'xl:block' : 'xl:hidden'
        if (!sm && xl === 'xl:hidden') return null
        return <li key={i} aria-hidden="true" role="presentation" className={`module hidden ${sm} ${xl}`} />
      })}
    </>
  )
}
