import { ArrowLeft, Check, CheckCircle2, ChefHat, Info, Keyboard, Plus, ScanSearch, Package } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { PhotoDrop } from '../components/pantry/PhotoDrop'
import { ReviewRow } from '../components/pantry/ReviewRow'
import { emptyRow, isValidRow, nameInputId, rowFromItem, toPantryItem, validatePhoto, type DraftRow } from '../components/pantry/scanDraft'
import { usePhoto } from '../components/pantry/usePhoto'
import { Button, ButtonLink } from '../components/ui/Button'
import { EmptyState, ModuleTitle, PageHeader } from '../components/ui/Section'
import { DemoTag } from '../components/ui/Tag'
import { scanProvider } from '../lib/vision'
import { useStore } from '../store/useStore'

type Step = 'upload' | 'scanning' | 'review' | 'saved'

const STEPS: { id: 'photo' | 'review' | 'save'; label: string }[] = [
  { id: 'photo', label: 'Photo' },
  { id: 'review', label: 'Review' },
  { id: 'save', label: 'Save' },
]

function StepTrail({ step }: { step: Step }) {
  const current = step === 'upload' || step === 'scanning' ? 0 : step === 'review' ? 1 : 2
  return (
    <ol aria-label="Progress" className="mb-6 flex flex-wrap items-center gap-2 text-sm font-semibold">
      {STEPS.map((s, i) => {
        const done = i < current || step === 'saved'
        const on = i === current
        return (
          <li key={s.id} aria-current={on ? 'step' : undefined} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden="true" className="h-px w-6 bg-rule-strong" />}
            <span className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 ring-1 ring-inset ${on ? 'bg-forest text-cream ring-forest' : done ? 'bg-leaf-wash text-leaf-ink ring-leaf/50' : 'bg-paper text-ink-2 ring-rule'}`}>
              {done && <Check size={14} strokeWidth={3} aria-hidden="true" />}
              {s.label}
              {done && <span className="sr-only">(done)</span>}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

export default function Scan() {
  const addItems = useStore((s) => s.addItems)
  const [step, setStep] = useState<Step>('upload')
  const [photo, setFile] = usePhoto()
  const file = photo?.file ?? null
  const previewUrl = photo?.url ?? null
  const [fileError, setFileError] = useState<string | null>(null)
  const [scanError, setScanError] = useState<string | null>(null)
  const [rows, setRows] = useState<DraftRow[]>([])
  const [fromScan, setFromScan] = useState<{ demo: boolean } | null>(null)
  const [savedCount, setSavedCount] = useState(0)
  const alive = useRef(true)
  const headingRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  // Move focus to the new step's content so keyboard and screen reader users follow along.
  useEffect(() => {
    if (step !== 'upload') headingRef.current?.focus({ preventScroll: false })
  }, [step])

  const onFile = (f: File) => {
    const err = validatePhoto(f)
    setFileError(err)
    setScanError(null)
    if (!err) setFile(f)
  }

  const find = async () => {
    if (!file) return
    setScanError(null)
    setStep('scanning')
    try {
      const res = await scanProvider.scan(file)
      if (!alive.current) return
      setRows(res.items.map(rowFromItem))
      setFromScan({ demo: res.demo })
      setStep('review')
    } catch {
      if (!alive.current) return
      setScanError("We couldn't read that photo. Try again, or enter your items by hand.")
      setStep('upload')
    }
  }

  const byHand = () => {
    setRows([emptyRow()])
    setFromScan(null)
    setStep('review')
  }

  const startOver = () => {
    setFile(null)
    setRows([])
    setFromScan(null)
    setFileError(null)
    setScanError(null)
    setStep('upload')
  }

  const patchRow = (key: string, patch: Partial<DraftRow>) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)))
  const focusTimer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(focusTimer.current), [])
  const addRow = () => {
    const r = emptyRow()
    setRows((rs) => [...rs, r])
    window.clearTimeout(focusTimer.current)
    focusTimer.current = window.setTimeout(() => document.getElementById(nameInputId(r.key))?.focus(), 30)
  }

  const valid = rows.filter(isValidRow)
  const invalidCount = rows.length - valid.length

  const save = () => {
    if (!valid.length) return
    addItems(valid.map(toPantryItem))
    setSavedCount(valid.length)
    setStep('saved')
  }

  return (
    <div>
      <PageHeader
        title="Scan my pantry"
        lede="Snap your shelf or fridge, check the list, and save it to your pantry. You can also type items in."
        meta={<DemoTag>Demo mode: sample results</DemoTag>}
      />
      <StepTrail step={step} />

      {step === 'upload' && (
        <div className="modules lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <section aria-labelledby="photo-title" className="module">
            <ModuleTitle id="photo-title">Your photo</ModuleTitle>
            <PhotoDrop
              file={file}
              previewUrl={previewUrl}
              error={fileError}
              onFile={onFile}
              onRemove={() => {
                setFile(null)
                setFileError(null)
              }}
            />
            {scanError && <p role="alert" className="mt-3 rounded-lg bg-terracotta-wash px-3 py-2 text-[15px] font-medium text-terracotta-ink">{scanError}</p>}
            <div className="mt-5 flex flex-wrap gap-2">
              <Button size="lg" icon={<ScanSearch size={20} />} disabled={!file} onClick={find}>Find ingredients</Button>
              {!file && <p className="self-center text-sm text-ink-2">Add a photo first.</p>}
            </div>
          </section>
          <aside aria-labelledby="how-title" className="module flex flex-col gap-4">
            <ModuleTitle id="how-title">How this works</ModuleTitle>
            <div className="flex gap-3 rounded-lg bg-cream p-3 text-[15px] text-ink ring-1 ring-inset ring-rule">
              <Info size={20} className="mt-0.5 shrink-0 text-forest" aria-hidden="true" />
              <p>
                <strong className="font-semibold">Demo mode.</strong> No image recognition service is connected, so scanning shows sample results. Your photo stays on this device and is not analyzed or uploaded.
              </p>
            </div>
            <ul className="list-disc space-y-1.5 pl-5 text-[15px] text-ink-2">
              <li>Good light and labels facing out make photos easier to check.</li>
              <li>Every result is editable before anything is saved.</li>
              <li>Items you save join your pantry and shape recipe suggestions.</li>
            </ul>
            <div className="mt-auto border-t border-rule pt-4">
              <p className="mb-2 text-[15px] text-ink-2">Prefer to type?</p>
              <Button variant="secondary" icon={<Keyboard size={18} />} onClick={byHand}>Enter items by hand</Button>
            </div>
          </aside>
        </div>
      )}

      {step === 'scanning' && (
        <div className="modules lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="module hidden lg:block">
            {previewUrl && <img src={previewUrl} alt="" className="max-h-72 w-full rounded-lg object-contain opacity-70" />}
          </div>
          <div ref={headingRef} tabIndex={-1} className="module focus:outline-none">
            <p role="status" aria-live="polite" className="mb-4 flex items-center gap-2 font-semibold text-forest">
              <ScanSearch size={18} className="motion-safe:animate-pulse" aria-hidden="true" />
              Preparing results. Demo mode: sample results, no image recognition is connected.
            </p>
            <ul aria-hidden="true" className="divide-y divide-rule">
              {Array.from({ length: 6 }, (_, i) => (
                <li key={i} className="flex items-center gap-3 py-3">
                  <span className="h-11 flex-1 rounded-lg bg-rule/50 motion-safe:animate-pulse" />
                  <span className="hidden h-11 w-20 rounded-lg bg-rule/50 motion-safe:animate-pulse sm:block" />
                  <span className="hidden h-11 w-24 rounded-lg bg-rule/50 motion-safe:animate-pulse sm:block" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {step === 'review' && (
        <div className={`modules ${fromScan && previewUrl ? 'lg:grid-cols-[280px_minmax(0,1fr)]' : ''}`}>
          {fromScan?.demo && (
            <div role="note" className="module flex gap-3 bg-terracotta-wash lg:col-span-full">
              <Info size={22} className="mt-0.5 shrink-0 text-terracotta-ink" aria-hidden="true" />
              <p className="text-[16px] font-medium text-ink">
                <strong className="font-bold">Demo mode: these are sample results.</strong> Your photo was not analyzed, because no image recognition service is connected. Edit anything below.
              </p>
            </div>
          )}
          {fromScan && previewUrl && (
            <div className="module">
              <img src={previewUrl} alt="Your pantry photo" className="max-h-40 w-full rounded-lg bg-cream object-contain lg:max-h-80" />
              <p className="mt-2 text-sm text-ink-2">Not analyzed in demo mode.</p>
            </div>
          )}
          <section aria-labelledby="review-title" className="module">
            <div ref={headingRef} tabIndex={-1} className="focus:outline-none">
              <ModuleTitle id="review-title" right={<span className="num text-sm text-ink-2">{rows.length} {rows.length === 1 ? 'row' : 'rows'}</span>}>
                {fromScan ? 'Check your items' : 'Add your items'}
              </ModuleTitle>
            </div>
            {rows.length === 0 ? (
              <EmptyState title="No items yet" action={<Button icon={<Plus size={18} />} onClick={addRow}>Add an ingredient</Button>}>
                Add what you have, one row per ingredient.
              </EmptyState>
            ) : (
              <>
                <div aria-hidden="true" className="condensed hidden gap-x-3 border-b border-rule pb-2 text-xs font-bold uppercase tracking-[0.06em] text-ink-2 md:grid md:grid-cols-[minmax(0,1fr)_88px_108px_156px_40px]">
                  <span>Ingredient</span>
                  <span>Amount</span>
                  <span>Unit</span>
                  <span>Use by</span>
                  <span />
                </div>
                <ul className="divide-y divide-rule">
                  {rows.map((r) => (
                    <ReviewRow key={r.key} row={r} onChange={(p) => patchRow(r.key, p)} onRemove={() => setRows((rs) => rs.filter((x) => x.key !== r.key))} />
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={addRow}
                  className="mt-1 flex h-12 w-full items-center gap-2 rounded-lg border border-dashed border-rule-strong px-3 text-[15px] font-semibold text-forest hover:border-forest hover:bg-cream"
                >
                  <Plus size={18} aria-hidden="true" />
                  Add an ingredient
                </button>
              </>
            )}

            <div className="mt-6 flex flex-col gap-3 border-t border-rule pt-4 sm:flex-row sm:items-center">
              <Button size="lg" icon={<Package size={20} />} disabled={!valid.length} onClick={save} className="h-auto! min-h-12 w-full py-2 text-left whitespace-normal! sm:w-auto">
                {valid.length ? `Save ${valid.length} ${valid.length === 1 ? 'item' : 'items'} to my pantry` : 'Save to my pantry'}
              </Button>
              <Button variant="ghost" icon={<ArrowLeft size={18} />} onClick={startOver}>Start over</Button>
              <p aria-live="polite" className="text-sm text-ink-2 sm:ml-auto sm:text-right">
                {!valid.length
                  ? 'Add at least one recognized ingredient with an amount to save.'
                  : invalidCount > 0
                    ? `${invalidCount} ${invalidCount === 1 ? 'row needs' : 'rows need'} fixing and won't be saved.`
                    : 'Everything looks ready.'}
              </p>
            </div>
          </section>
        </div>
      )}

      {step === 'saved' && (
        <div className="modules">
          <div ref={headingRef} tabIndex={-1} className="module focus:outline-none">
            <EmptyState
              icon={<CheckCircle2 size={44} strokeWidth={1.6} />}
              title={`Saved ${savedCount} ${savedCount === 1 ? 'item' : 'items'} to your pantry`}
              action={
                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  <ButtonLink to="/pantry" icon={<Package size={18} />}>View my pantry</ButtonLink>
                  <ButtonLink to="/recipes?filter=only-mine" variant="secondary" icon={<ChefHat size={18} />}>Meals I can make now</ButtonLink>
                  <Button variant="ghost" onClick={startOver}>Scan another photo</Button>
                </div>
              }
            >
              Items you already had in the same unit were combined into one line.
            </EmptyState>
          </div>
        </div>
      )}
    </div>
  )
}
