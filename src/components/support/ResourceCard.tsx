import { ExternalLink, Phone, ShieldCheck } from 'lucide-react'
import { RESOURCE_TYPE_LABEL } from '../../data/arkansasResources'
import type { Resource } from '../../types'
import { Tag } from '../ui/Tag'

function formatVerified(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`

/** One resource inside a ruled module grid (the parent supplies `modules`). */
export function ResourceCard({ resource: r, local }: { resource: Resource; local?: string }) {
  return (
    <article className="module flex flex-col gap-3" aria-labelledby={`res-${r.id}`}>
      <div className="flex flex-wrap items-center gap-1.5">
        <Tag>{RESOURCE_TYPE_LABEL[r.type]}</Tag>
        {r.official && (
          <Tag tone="have" icon={<ShieldCheck size={12} aria-hidden="true" />}>
            Official
          </Tag>
        )}
        {local && <span className="inline-flex items-center rounded-md bg-forest px-1.5 py-0.5 text-xs font-semibold text-cream">Serves {local} County</span>}
      </div>
      <h3 id={`res-${r.id}`} className="display text-2xl text-forest">{r.name}</h3>
      <p className="text-[15px] leading-relaxed text-ink-2">{r.description}</p>
      <div className="mt-auto flex flex-wrap gap-2 pt-1">
        {r.phone && (
          <a href={telHref(r.phone)} className="inline-flex h-11 items-center gap-2 rounded-lg bg-forest px-4 text-[15px] font-semibold text-cream hover:bg-forest-2">
            <Phone size={16} aria-hidden="true" />
            <span className="num">Call {r.phone}</span>
          </a>
        )}
        <a
          href={r.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-paper px-4 text-[15px] font-semibold text-forest ring-1 ring-inset ring-rule-strong hover:bg-cream hover:ring-forest"
        >
          Visit website
          <ExternalLink size={15} aria-hidden="true" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </div>
      <p className="text-xs leading-relaxed text-ink-2">
        Source: {r.source} · Last verified {formatVerified(r.lastVerified)}
      </p>
    </article>
  )
}
