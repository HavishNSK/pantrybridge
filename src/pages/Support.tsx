import { ExternalLink, Lock, MessageSquareText, Phone } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { LocationSearch } from '../components/support/LocationSearch'
import { ResourceCard } from '../components/support/ResourceCard'
import { readSupportCounty, writeSupportCounty } from '../components/support/countyStorage'
import { ModuleTitle, PageHeader } from '../components/ui/Section'
import { COUNTIES } from '../data/arkansasCounties'
import { RESOURCES } from '../data/arkansasResources'
import type { Resource, ResourceType } from '../types'

type FilterId = 'all' | 'food' | 'snap' | 'wic' | 'kids' | 'hotline'

const FILTERS: { id: FilterId; label: string; types: ResourceType[] }[] = [
  { id: 'all', label: 'All', types: [] },
  { id: 'food', label: 'Food banks & pantries', types: ['food-bank', 'pantry-finder', 'meals', 'seniors'] },
  { id: 'snap', label: 'SNAP', types: ['snap'] },
  { id: 'wic', label: 'WIC', types: ['wic'] },
  { id: 'kids', label: 'Kids & school', types: ['kids'] },
  { id: 'hotline', label: 'Helplines', types: ['hotline'] },
]

const ext = { target: '_blank', rel: 'noopener noreferrer' } as const
const linkClass = 'font-semibold text-forest underline'

function initialCounty(): string | null {
  const saved = readSupportCounty()
  return saved && COUNTIES.includes(saved) ? saved : null
}

export default function Support() {
  const [county, setCountyState] = useState<string | null>(initialCounty)
  const [filter, setFilter] = useState<FilterId>('all')

  const setCounty = (c: string | null) => {
    setCountyState(c)
    writeSupportCounty(c)
  }

  const { local, statewide } = useMemo(() => {
    const f = FILTERS.find((x) => x.id === filter)!
    const pass = (r: Resource) => f.types.length === 0 || f.types.includes(r.type)
    return {
      local: county ? RESOURCES.filter((r) => r.counties.includes(county) && pass(r)) : [],
      statewide: RESOURCES.filter((r) => r.counties.length === 0 && pass(r)),
    }
  }, [county, filter])

  const regionalCount = RESOURCES.filter((r) => r.counties.length > 0).length

  return (
    <div>
      <PageHeader
        title="Find food support"
        lede="Free, confidential help near you. You don't need to explain your situation to use this page."
        meta={
          <span className="inline-flex items-center gap-1.5 text-sm text-ink-2">
            <Lock size={14} aria-hidden="true" />
            No sign-in. Your county is saved only in this browser.
          </span>
        }
      />

      <div className="modules grid-cols-1 lg:grid-cols-[1.15fr_1fr]">
        <section className="module bg-forest! text-cream on-dark" aria-labelledby="h-211">
          <h2 id="h-211" className="display text-3xl text-cream">Talk to someone: Arkansas 211</h2>
          <p className="mt-2 max-w-prose text-[15px] leading-relaxed text-cream/85">
            Free and confidential, 24 hours a day. A real person can point you to pantries, meals, and programs near you.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href="tel:211" className="inline-flex h-12 items-center gap-2 rounded-lg bg-cream px-5 text-base font-semibold text-forest hover:bg-paper">
              <Phone size={18} aria-hidden="true" />
              Call 211
            </a>
            <a href="sms:898211" className="inline-flex h-12 items-center gap-2 rounded-lg px-5 text-base font-semibold text-cream ring-1 ring-inset ring-cream/40 hover:bg-white/10">
              <MessageSquareText size={18} aria-hidden="true" />
              Text your ZIP to <span className="num">898-211</span>
            </a>
          </div>
        </section>

        <section className="module" aria-labelledby="h-where">
          <ModuleTitle id="h-where">Where are you?</ModuleTitle>
          <LocationSearch county={county} onChange={setCounty} />
          {!county && <p className="mt-3 text-sm text-ink-2">Add your county to see your regional food bank. Statewide help is listed below either way.</p>}
        </section>
      </div>

      <div role="group" aria-label="Filter by type of help" className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={`h-10 rounded-full px-4 text-sm font-semibold ring-1 ring-inset transition-colors ${filter === f.id ? 'bg-forest text-cream ring-forest' : 'bg-paper text-forest ring-rule-strong hover:ring-forest'}`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm text-ink-2">Hours and services change. Please call ahead.</p>

      {county && (
        <section className="mt-6" aria-labelledby="h-local">
          <h2 id="h-local" className="display mb-3 text-3xl text-forest">Near {county} County</h2>
          {local.length > 0 ? (
            <div className="modules grid-cols-1 md:grid-cols-2">
              {local.map((r) => (
                <ResourceCard key={r.id} resource={r} local={county} />
              ))}
            </div>
          ) : (
            <div className="modules"><p className="module text-[15px] text-ink-2">
              {filter === 'all' || filter === 'food'
                ? `We don't have a regional food bank listed for ${county} County yet. Arkansas 211 and the statewide pantry finder below cover every county.`
                : 'Nothing local in this category. Statewide options are below.'}
            </p></div>
          )}
        </section>
      )}

      <section className="mt-8" aria-labelledby="h-state">
        <h2 id="h-state" className="display mb-3 text-3xl text-forest">Across Arkansas</h2>
        {statewide.length > 0 ? (
          <div className="modules grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {statewide.map((r) => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </div>
        ) : (
          <div className="modules"><p className="module text-[15px] text-ink-2">No statewide listings in this category. Try All.</p></div>
        )}
        {!county && (filter === 'all' || filter === 'food') && (
          <p className="mt-3 text-sm text-ink-2">
            Arkansas has <span className="num">{regionalCount}</span> regional food banks. Choose your county above to see yours.
          </p>
        )}
      </section>

      <div className="modules mt-8 grid-cols-1 md:grid-cols-2">
        <section className="module" aria-labelledby="h-snap">
          <ModuleTitle id="h-snap">SNAP &amp; benefits: official information</ModuleTitle>
          <ul className="list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-ink">
            <li>
              Apply for SNAP through{' '}
              <a href="https://access.arkansas.gov" {...ext} className={linkClass}>
                Access Arkansas<span className="sr-only"> (opens in a new tab)</span>
              </a>
              , by phone at <a href="tel:18553721084" className={`${linkClass} num`}>1-855-372-1084</a>, or at a county DHS office.
            </li>
            <li>The Arkansas Department of Human Services (DHS) decides eligibility and benefit amounts.</li>
            <li>PantryBridge never asks for your EBT card number or PIN, and it can't check balances.</li>
            <li>
              SNAP buys food for home preparation. It can't be used for household supplies, hot prepared foods, or non-food items.{' '}
              <a href="https://www.fns.usda.gov/snap/eligible-food-items" {...ext} className={`${linkClass} inline-flex items-center gap-1`}>
                What SNAP covers <ExternalLink size={13} aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          </ul>
          <p className="mt-3 text-xs text-ink-2">Sources: humanservices.arkansas.gov, fns.usda.gov · Last verified Oct 24, 2026</p>
        </section>

        <section className="module bg-cream!" aria-labelledby="h-budget">
          <ModuleTitle id="h-budget">General budgeting guidance</ModuleTitle>
          <p className="mb-2 text-sm text-ink-2">Practical ideas, not official program rules.</p>
          <ul className="list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-ink">
            <li>Plan meals around what's already in your cupboard before making a list.</li>
            <li>Dry beans, rice, oats, and frozen vegetables keep well and go a long way.</li>
            <li>Cook once, eat twice: extra dinner servings make easy lunches.</li>
            <li>Use soon-to-expire items early in the week.</li>
          </ul>
          <Link to="/planner" className="mt-4 inline-flex h-11 items-center rounded-lg bg-forest px-4 text-[15px] font-semibold text-cream hover:bg-forest-2">
            Set a weekly budget in the planner
          </Link>
        </section>
      </div>
    </div>
  )
}
