import { ArrowLeft, Check, CheckCircle2, ChefHat, Info, Keyboard, Plus, ScanSearch, Package } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { PhotoDrop } from '../components/pantry/PhotoDrop'
import { ReviewRow } from '../components/pantry/ReviewRow'
import { dateOk, emptyRow, isValidRow, qtyOk, nameInputId, toPantryItem, validatePhoto, type DraftRow } from '../components/pantry/scanDraft'
import { usePhoto } from '../components/pantry/usePhoto'
import { Button, ButtonLink } from '../components/ui/Button'
import { EmptyState, ModuleTitle, PageHeader } from '../components/ui/Section'
import { DemoTag } from '../components/ui/Tag'
import { INTAKE_SOURCES, intakeSample, type IntakeSource } from '../data/intakeSamples'
import { useStore } from '../store/useStore'

type Step = 'upload' | 'review' | 'saved'

const STEPS: { id: 'photo' | 'review' | 'save'; label: string }[] = [
  { id: 'photo', label: 'Source' },
  { id: 'review', label: 'Review' },
  { id: 'save', label: 'Save' },
]

function StepTrail({ step }: { step: Step }) {
  const current = step === 'upload' ? 0 : step === 'review' ? 1 : 2
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
  const [source, setSource] = useState<IntakeSource>('food-box')
  const [excluded, setExcluded] = useState<string[]>([])
  const [reviewError, setReviewError] = useState<string | null>(null)
  const [step, setStep] = useState<Step>('upload')
  const [photo, setFile] = usePhoto()
  const file = photo?.file ?? null
  const previewUrl = photo?.url ?? null
  const [fileError, setFileError] = useState<string | null>(null)
  const [rows, setRows] = useState<DraftRow[]>([])
  const [fromScan, setFromScan] = useState<{ demo: boolean } | null>(null)
  const [savedCount, setSavedCount] = useState(0)
  const headingRef = useRef<HTMLDivElement>(null)

  // Move focus to the new step's content so keyboard and screen reader users follow along.
  useEffect(() => {
    if (step !== 'upload') headingRef.current?.focus({ preventScroll: false })
  }, [step])

  const onFile = (f: File) => {
    const err = validatePhoto(f)
    setFileError(err)
    if (!err) setFile(f)
  }

  const find = () => {
    const sample = intakeSample(source)
    setReviewError(null)
    setRows(sample.rows)
    setExcluded(sample.excluded)
    setFromScan({ demo: true })
    setStep('review')
  }

  const byHand = () => {
    setExcluded([])
    setReviewError(null)
    setRows([emptyRow()])
    setFromScan(null)
    setStep('review')
  }

  const startOver = () => {
    setFile(null)
    setExcluded([])
    setReviewError(null)
    setRows([])
    setFromScan(null)
    setFileError(null)
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
    const invalid = rows.find((row) => !isValidRow(row))
    if (invalid || !rows.length) {
      setReviewError('Correct every retained food row, or remove it, before saving.')
      if (invalid) {
        const field = !invalid.ingredientId ? 'name' : !qtyOk(invalid.quantity) ? 'quantity' : !dateOk(invalid.expiresAt) ? 'date' : 'name'
        document.getElementById(`rev-${invalid.key}-${field}`)?.focus()
      }
      return
    }
    setReviewError(null)
    addItems(valid.map(toPantryItem))
    setSavedCount(valid.length)
    setStep('saved')
  }

  return (
    <div>
      <PageHeader
        title="Add food"
        lede="Check your ingredients, then find meals you can make."
        meta={fromScan?.demo ? <DemoTag>Sample ingredients</DemoTag> : undefined}
      />
      <StepTrail step={step} />

      {step === 'upload' && (
        <div className="modules max-w-3xl">
          <section aria-labelledby="source-title" className="module">
            <ModuleTitle id="source-title">What are you adding?</ModuleTitle>
            <fieldset>
              <legend className="sr-only">Sample source</legend>
              <div className="flex flex-wrap gap-3">
                {INTAKE_SOURCES.map((choice) => <label key={choice.id} className="flex min-h-11 items-center gap-2 rounded-lg border border-rule px-3"><input type="radio" name="intake-source" checked={source === choice.id} onChange={() => setSource(choice.id)} />{choice.label}</label>)}
              </div>
            </fieldset>
            <p className="mt-4 text-sm text-ink-2">Demo: use an editable sample list, or enter your own food. Photos are not analyzed.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button size="lg" icon={<ScanSearch size={20} />} onClick={find}>Review {INTAKE_SOURCES.find((choice) => choice.id === source)?.label.toLowerCase()} sample</Button>
              <Button variant="secondary" icon={<Keyboard size={18} />} onClick={byHand}>Enter items by hand</Button>
            </div>
            <details className="mt-5 border-t border-rule pt-3">
              <summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold text-forest">Add a photo reference (optional)</summary>
              <p className="mb-3 text-sm text-ink-2">For your reference only. Your photo stays on this device and does not change the sample.</p>
              <PhotoDrop file={file} previewUrl={previewUrl} error={fileError} onFile={onFile} onRemove={() => { setFile(null); setFileError(null) }} />
            </details>
          </section>
        </div>
      )}

      {step === 'review' && (
        <div className={`modules ${fromScan && previewUrl ? 'lg:grid-cols-[280px_minmax(0,1fr)]' : ''}`}>
          {fromScan?.demo && (
            <div role="note" className="module flex gap-3 bg-terracotta-wash lg:col-span-full">
              <Info size={22} className="mt-0.5 shrink-0 text-terracotta-ink" aria-hidden="true" />
              <p className="text-[16px] font-medium text-ink">
                <strong className="font-bold">Demo mode: these are sample results.</strong> Check the amounts before saving. Nothing was read from your photo.
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
            {excluded.length > 0 && <p className="mb-3 rounded-lg bg-cream p-3 text-sm">Not food — excluded: {excluded.join(', ')}.</p>}
            {reviewError && <p role="alert" className="mb-3 text-terracotta-ink">{reviewError}</p>}
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
              <Button size="lg" icon={<Package size={20} />} disabled={!rows.length} onClick={save} className="h-auto! min-h-12 w-full py-2 text-left whitespace-normal! sm:w-auto">
                {invalidCount > 0 ? 'Save all food to my pantry' : valid.length ? `Save ${valid.length} ${valid.length === 1 ? 'item' : 'items'} to my pantry` : 'Save to my pantry'}
              </Button>
              <Button variant="ghost" icon={<ArrowLeft size={18} />} onClick={startOver}>Start over</Button>
              <p aria-live="polite" className="text-sm text-ink-2 sm:ml-auto sm:text-right">
                {!valid.length
                  ? 'Add at least one recognized ingredient with an amount to save.'
                  : invalidCount > 0
                    ? `${invalidCount} ${invalidCount === 1 ? 'row needs' : 'rows need'} correcting or removing before saving.`
                    : ''}
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
                  <ButtonLink to="/planner#three-dinners" icon={<ChefHat size={18} />}>Find dinners</ButtonLink>
                  <ButtonLink to="/pantry" variant="secondary">View my pantry</ButtonLink>
                  <Button variant="ghost" onClick={startOver}>Add more food</Button>
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
