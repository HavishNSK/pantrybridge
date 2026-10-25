import { MapPin, Search, X } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { COUNTIES, resolveCounty } from '../../data/arkansasCounties'
import { Button } from '../ui/Button'
import { Input, Select } from '../ui/Field'

/** County or ZIP lookup. Never guesses: unknown ZIPs ask for the county instead. */
export function LocationSearch({ county, onChange }: { county: string | null; onChange: (county: string | null) => void }) {
  const [text, setText] = useState('')
  const [status, setStatus] = useState<'idle' | 'zip-unknown' | 'not-found'>('idle')
  const inputId = useId()
  const listId = useId()
  const selectId = useId()
  const msgId = useId()

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    const r = resolveCounty(text)
    if (r.county) {
      onChange(r.county)
      setStatus('idle')
      setText('')
    } else setStatus(r.zipUnknown ? 'zip-unknown' : 'not-found')
  }

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={submit} role="search" aria-label="Find resources by county or ZIP">
        <label htmlFor={inputId} className="text-sm font-semibold text-ink">County or ZIP code</label>
        <div className="mt-1.5 flex gap-2">
          <Input
            id={inputId}
            list={listId}
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              if (status !== 'idle') setStatus('idle')
            }}
            placeholder="e.g. Pulaski or 72201…"
            autoComplete="off"
            inputMode="text"
            aria-describedby={status !== 'idle' ? msgId : undefined}
            aria-invalid={status !== 'idle' || undefined}
          />
          <Button type="submit" icon={<Search size={17} aria-hidden="true" />} disabled={!text.trim()}>
            Find
          </Button>
        </div>
        <datalist id={listId}>
          {COUNTIES.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </form>

      {status !== 'idle' && (
        <div id={msgId} role="alert" className="rounded-lg bg-terracotta-wash p-3 text-[15px] text-terracotta-ink">
          {status === 'zip-unknown' ? "We don't recognize that ZIP yet; pick your county instead." : "We couldn't match that to an Arkansas county. Pick it from the list below."}
          <div className="mt-2">
            <label htmlFor={selectId} className="sr-only">Choose your county</label>
            <Select
              id={selectId}
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  onChange(e.target.value)
                  setStatus('idle')
                  setText('')
                }
              }}
            >
              <option value="">Choose your county</option>
              {COUNTIES.map((c) => (
                <option key={c} value={c}>{c} County</option>
              ))}
            </Select>
          </div>
        </div>
      )}

      {county && (
        <p className="flex flex-wrap items-center gap-2 text-[15px] text-ink" aria-live="polite">
          <MapPin size={17} className="text-forest" aria-hidden="true" />
          Showing help for <strong className="font-bold text-forest">{county} County</strong>
          <button type="button" onClick={() => onChange(null)} className="inline-flex min-h-10 items-center gap-1 rounded-md px-2 text-sm font-semibold text-forest underline hover:bg-forest/[0.07]">
            <X size={14} aria-hidden="true" />
            Clear
          </button>
        </p>
      )}
    </div>
  )
}
