import { Camera, PackageOpen, Plus, Search, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AddItemSheet } from '../components/pantry/AddItemSheet'
import { ExpiringStrip } from '../components/pantry/ExpiringStrip'
import { PantryRow, ROW_GRID } from '../components/pantry/PantryRow'
import { UndoToast } from '../components/pantry/UndoToast'
import { prefersReducedMotion, rowDomId } from '../components/pantry/dates'
import { Button, ButtonLink } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Field'
import { EmptyState, ModuleTitle, PageHeader } from '../components/ui/Section'
import { DemoTag, Tag } from '../components/ui/Tag'
import { toast } from '../components/ui/Toast'
import { CATEGORY_LABEL, INGREDIENT_BY_ID } from '../data/ingredients'
import { daysUntil, expiringSoon } from '../lib/pantry'
import { isDemoPantry, useStore } from '../store/useStore'
import type { Category, PantryItem } from '../types'

type SortKey = 'expiring' | 'name' | 'category'
type CatFilter = Category | 'all'

const CATEGORY_ORDER = Object.keys(CATEGORY_LABEL) as Category[]
const nameOf = (it: PantryItem) => INGREDIENT_BY_ID[it.ingredientId]?.name ?? it.ingredientId
const catOf = (it: PantryItem): Category | 'other' => INGREDIENT_BY_ID[it.ingredientId]?.category ?? 'other'
const daysOf = (it: PantryItem) => daysUntil(it.expiresAt) ?? Number.POSITIVE_INFINITY

export default function Pantry() {
  const pantry = useStore((s) => s.pantry)
  const removeItem = useStore((s) => s.removeItem)
  const restoreItem = useStore((s) => s.restoreItem)
  const demo = isDemoPantry(pantry)

  const [query, setQuery] = useState('')
  const [cat, setCat] = useState<CatFilter>('all')
  const [sort, setSort] = useState<SortKey>('expiring')
  const [adding, setAdding] = useState(false)
  const [flash, setFlash] = useState<string | null>(null)
  /** Every removal since the toast last closed; Undo restores all of them. */
  const [removed, setRemoved] = useState<{ item: PantryItem; index: number }[]>([])
  /** Where focus goes when the toast closes: the row after the last removed one, or the search box. */
  const returnTo = useRef<string | null>(null)
  const [focusUndo, setFocusUndo] = useState(false)
  const undoRef = useRef<HTMLButtonElement>(null)
  const toastRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const [params] = useSearchParams()
  const target = params.get('item')
  const timers = useRef<number[]>([])

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), [])

  /** Clear filters, then scroll to a row and briefly highlight it. */
  const focusItem = useCallback((uid: string) => {
    setQuery('')
    setCat('all')
    const t1 = window.setTimeout(() => {
      const el = document.getElementById(rowDomId(uid))
      if (!el) {
        toast('That item is no longer in your pantry.', 'info')
        return
      }
      el.scrollIntoView({ block: 'center', behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
      el.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true })
      setFlash(uid)
      const t2 = window.setTimeout(() => setFlash((f) => (f === uid ? null : f)), 2200)
      timers.current.push(t2)
    }, 60)
    timers.current.push(t1)
  }, [])

  useEffect(() => {
    if (!target) return
    const t = window.setTimeout(() => focusItem(target), 0)
    return () => window.clearTimeout(t)
  }, [target, focusItem])

  /** Close the toast; if focus was inside it, hand focus back to the list. */
  const closeToast = useCallback((focusUid?: string | null) => {
    const hadFocus = !!toastRef.current?.contains(document.activeElement)
    setRemoved([])
    setFocusUndo(false)
    if (!hadFocus) return
    window.setTimeout(() => {
      const uid = focusUid ?? returnTo.current
      const row = uid ? document.getElementById(rowDomId(uid)) : null
      const target = row?.querySelector<HTMLElement>('input, button') ?? searchRef.current
      target?.focus()
    }, 0)
  }, [])

  // Auto-dismiss the undo toast; each new removal restarts the clock.
  useEffect(() => {
    if (!removed.length) return
    const t = window.setTimeout(() => closeToast(), 6000)
    return () => window.clearTimeout(t)
  }, [removed, closeToast])

  useEffect(() => {
    if (focusUndo && removed.length) undoRef.current?.focus()
  }, [focusUndo, removed])

  const onRemove = (item: PantryItem, viaKeyboard: boolean) => {
    const index = pantry.findIndex((p) => p.uid === item.uid)
    // Rows in on-screen order; focus returns to the neighbour of the removed row.
    const rows = [...document.querySelectorAll<HTMLElement>('[id^="pantry-row-"]')]
    const pos = rows.findIndex((el) => el.id === rowDomId(item.uid))
    returnTo.current = (rows[pos + 1] ?? rows[pos - 1])?.id.slice('pantry-row-'.length) ?? null
    removeItem(item.uid)
    setRemoved((r) => [...r, { item, index }])
    if (viaKeyboard) setFocusUndo(true)
  }
  const undo = () => {
    if (!removed.length) return
    // Restore newest first so each saved index lines up with the list it was taken from.
    for (const r of [...removed].reverse()) restoreItem(r.item, r.index)
    toast(removed.length === 1 ? `${nameOf(removed[0].item)} is back in your pantry` : `${removed.length} items are back in your pantry`)
    closeToast(removed[removed.length - 1].item.uid)
  }

  const soon = useMemo(() => expiringSoon(pantry), [pantry])

  const presentCats = useMemo(() => {
    const counts = new Map<Category, number>()
    for (const it of pantry) {
      const c = INGREDIENT_BY_ID[it.ingredientId]?.category
      if (c) counts.set(c, (counts.get(c) ?? 0) + 1)
    }
    return CATEGORY_ORDER.filter((c) => counts.has(c)).map((c) => ({ id: c, count: counts.get(c)! }))
  }, [pantry])

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = pantry.filter((it) => {
      const ing = INGREDIENT_BY_ID[it.ingredientId]
      if (cat !== 'all' && ing?.category !== cat) return false
      if (!q) return true
      return [ing?.name ?? it.ingredientId, ...(ing?.aliases ?? [])].some((a) => a.toLowerCase().includes(q))
    })
    const byName = (a: PantryItem, b: PantryItem) => nameOf(a).localeCompare(nameOf(b))
    const cmp = sort === 'expiring' ? (a: PantryItem, b: PantryItem) => daysOf(a) - daysOf(b) || byName(a, b) : byName

    const map = new Map<Category | 'other', PantryItem[]>()
    for (const it of filtered) {
      const k = catOf(it)
      map.set(k, [...(map.get(k) ?? []), it])
    }
    const list = [...map.entries()].map(([id, items]) => ({ id, items: items.sort(cmp), soonest: Math.min(...items.map(daysOf)) }))
    const order = (id: Category | 'other') => (id === 'other' ? 99 : CATEGORY_ORDER.indexOf(id))
    if (sort === 'expiring') list.sort((a, b) => a.soonest - b.soonest || order(a.id) - order(b.id))
    else if (sort === 'name') list.sort((a, b) => label(a.id).localeCompare(label(b.id)))
    else list.sort((a, b) => order(a.id) - order(b.id))
    return list
  }, [pantry, query, cat, sort])

  const shown = groups.reduce((n, g) => n + g.items.length, 0)
  const filtering = query.trim() !== '' || cat !== 'all'

  const header = (
    <PageHeader
      title="My pantry"
      lede="Everything you have on hand. Recipes and the week plan are built from this list."
      meta={
        <>
          <Tag className="num text-[13px]">{pantry.length} {pantry.length === 1 ? 'item' : 'items'}</Tag>
          {demo && <DemoTag>Demo data: sample pantry</DemoTag>}
        </>
      }
      actions={
        <>
          <ButtonLink to="/scan" variant="secondary" icon={<Camera size={18} />}>Scan my pantry</ButtonLink>
          <Button onClick={() => setAdding(true)} icon={<Plus size={18} />}>Add item</Button>
        </>
      }
    />
  )

  return (
    <div>
      {header}

      {pantry.length === 0 ? (
        <div className="modules">
          <div className="module">
            <EmptyState
              icon={<PackageOpen size={40} strokeWidth={1.6} />}
              title="Your pantry is empty"
              action={
                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  <ButtonLink to="/scan" icon={<Camera size={18} />}>Scan my pantry</ButtonLink>
                  <Button variant="secondary" onClick={() => setAdding(true)} icon={<Plus size={18} />}>Add an item</Button>
                </div>
              }
            >
              Add what you have on hand, a few staples is plenty to start. We will suggest meals from it.
            </EmptyState>
          </div>
        </div>
      ) : (
        <>
          <ExpiringStrip items={soon} onPick={focusItem} />

          <div className="modules">
            <div className="module flex flex-col gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-2" />
                  <Input ref={searchRef} type="search" aria-label="Search your pantry" placeholder="Search by name, e.g. beans…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10" />
                </div>
                <label className="flex items-center gap-2 text-sm font-semibold text-ink">
                  Sort
                  <Select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="sm:w-48">
                    <option value="expiring">Expiring soon</option>
                    <option value="name">Name</option>
                    <option value="category">Category</option>
                  </Select>
                </label>
              </div>
              <div role="group" aria-label="Filter by category" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]">
                {[{ id: 'all' as CatFilter, count: pantry.length }, ...presentCats].map((c) => {
                  const on = cat === c.id
                  return (
                    <button
                      key={c.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setCat(c.id)}
                      className={`inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold ring-1 ring-inset transition-colors ${on ? 'bg-forest text-cream ring-forest' : 'bg-paper text-ink ring-rule-strong hover:ring-forest'}`}
                    >
                      {c.id === 'all' ? 'All' : CATEGORY_LABEL[c.id]}
                      <span className={`num text-xs ${on ? 'text-cream/80' : 'text-ink-2'}`}>{c.count}</span>
                    </button>
                  )
                })}
              </div>
              <p className="sr-only" aria-live="polite">{filtering ? `${shown} of ${pantry.length} items shown` : ''}</p>
            </div>

            <div aria-hidden="true" className={`hidden bg-cream px-5 py-2 text-xs font-bold uppercase tracking-[0.06em] text-ink-2 condensed sm:grid sm:gap-x-3 ${ROW_GRID}`}>
              <span>Item</span>
              <span>Amount</span>
              <span>Unit</span>
              <span>Use by</span>
              <span>Days left</span>
              <span />
            </div>

            {groups.length === 0 ? (
              <div className="module">
                <EmptyState
                  title="No matches"
                  action={
                    <Button variant="secondary" icon={<X size={16} />} onClick={() => { setQuery(''); setCat('all') }}>
                      Clear search and filters
                    </Button>
                  }
                >
                  Nothing in your pantry matches {query.trim() ? `"${query.trim()}"` : 'this filter'}.
                </EmptyState>
              </div>
            ) : (
              groups.map((g) => (
                <section key={g.id} aria-labelledby={`grp-${g.id}`} className="module pb-2 pt-4">
                  <ModuleTitle id={`grp-${g.id}`} right={<span className="num text-sm text-ink-2">{g.items.length}</span>}>{label(g.id)}</ModuleTitle>
                  <ul className="divide-y divide-rule">
                    {g.items.map((it) => (
                      <PantryRow key={it.uid} item={it} highlighted={flash === it.uid} onRemove={onRemove} />
                    ))}
                  </ul>
                </section>
              ))
            )}
          </div>
        </>
      )}

      <AddItemSheet open={adding} onClose={() => setAdding(false)} />
      <UndoToast
        rootRef={toastRef}
        undoRef={undoRef}
        message={removed.length === 0 ? null : removed.length === 1 ? `Removed ${nameOf(removed[0].item)}` : `Removed ${removed.length} items`}
        onUndo={undo}
        onDismiss={() => closeToast()}
      />
    </div>
  )
}

function label(id: Category | 'other') {
  return id === 'other' ? 'Other' : CATEGORY_LABEL[id]
}
