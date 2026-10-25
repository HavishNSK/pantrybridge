import { HardDrive, RotateCcw, Trash2 } from 'lucide-react'
import { useId, useRef, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { writeSupportCounty } from '../components/support/countyStorage'
import { Button, buttonClass } from '../components/ui/Button'
import { ModuleTitle, PageHeader } from '../components/ui/Section'
import { Stepper } from '../components/ui/Stepper'
import { toast } from '../components/ui/Toast'
import { useStore } from '../store/useStore'

const SOURCES: { name: string; use: string; url: string }[] = [
  { name: 'USDA FoodData Central', use: 'Reference nutrition values per 100 g', url: 'https://fdc.nal.usda.gov/' },
  { name: 'FDA Daily Values', use: 'General reference amounts for protein and fiber', url: 'https://www.fda.gov/food/nutrition-facts-label/daily-value-nutrition-and-supplement-facts-labels' },
  { name: 'USDA Food and Nutrition Service', use: 'What SNAP can and cannot buy; national hotline', url: 'https://www.fns.usda.gov/snap/eligible-food-items' },
  { name: 'Arkansas Department of Human Services', use: 'SNAP applications and Summer EBT', url: 'https://humanservices.arkansas.gov/' },
  { name: 'Arkansas Department of Health', use: 'WIC information', url: 'https://healthy.arkansas.gov/' },
  { name: 'Arkansas 211 and regional food banks', use: 'Food assistance directory, last verified Oct 24, 2026', url: 'https://www.arkansas211.org' },
]

function ConfirmAction({ label, icon, prompt, confirmLabel, onConfirm }: { label: string; icon: ReactNode; prompt: string; confirmLabel: string; onConfirm: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const headingId = useId()
  const promptId = useId()

  const open = () => dialogRef.current?.showModal()
  const close = () => dialogRef.current?.close()
  // Native close (button, Esc, or backdrop) always returns focus to the trigger.
  const handleClose = () => triggerRef.current?.focus()

  return (
    <>
      <button ref={triggerRef} type="button" onClick={open} className={buttonClass('secondary')}>
        {icon}
        {label}
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={headingId}
        aria-describedby={promptId}
        onClose={handleClose}
        onClick={(e) => {
          if (e.target === dialogRef.current) close()
        }}
        className="m-auto w-[min(28rem,calc(100%-2rem))] rounded-[10px] bg-paper p-0 text-ink shadow-[0_12px_40px_-12px_rgba(0,0,0,0.4)] backdrop:bg-ink/40 open:motion-safe:animate-[rise_220ms_var(--ease-out-expo)]"
      >
        <div className="p-5">
          <h2 id={headingId} className="display text-2xl text-forest">{label}?</h2>
          <p id={promptId} className="mt-2 text-[15px] leading-relaxed text-ink-2">{prompt}</p>
          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <Button variant="ghost" onClick={close} autoFocus>
              Cancel
            </Button>
            <Button
              onClick={() => {
                onConfirm()
                close()
              }}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </dialog>
    </>
  )
}

export default function Settings() {
  const household = useStore((s) => s.household)
  const setHousehold = useStore((s) => s.setHousehold)
  const resetDemo = useStore((s) => s.resetDemo)
  const clearAll = useStore((s) => s.clearAll)

  return (
    <div>
      <PageHeader title="Settings" lede="Your preferences live on this device. There's no account to create and nothing to sign in to." />

      <div className="modules grid-cols-1 md:grid-cols-2">
        <section className="module" aria-labelledby="s-household">
          <ModuleTitle id="s-household">Household</ModuleTitle>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[15px] text-ink">People you usually cook for</p>
            <Stepper label="household size" value={household} min={1} max={12} onChange={setHousehold} />
          </div>
          <p className="mt-2 text-sm text-ink-2">Used to scale servings and to show nutrition per person.</p>
        </section>

        <section className="module" aria-labelledby="s-stored">
          <ModuleTitle id="s-stored">What's stored</ModuleTitle>
          <p className="flex gap-2 text-[15px] leading-relaxed text-ink">
            <HardDrive size={18} className="mt-0.5 shrink-0 text-forest" aria-hidden="true" />
            Everything stays only on this device, in this browser: your pantry list, week plan, budget, shopping list, household size, cooking preferences, and the county you last picked on Find Food Support.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">
            Your saved app data is not sent to a server by this demo. PantryBridge never asks for an EBT card number, PIN, or any account login. Photos you scan are not uploaded or analyzed.
          </p>
          <Link to="/privacy" className="mt-2 inline-flex min-h-11 items-center font-semibold text-forest underline">Read privacy &amp; storage information</Link>
        </section>

        <section className="module md:col-span-2" aria-labelledby="s-data">
          <ModuleTitle id="s-data">Your data</ModuleTitle>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="flex flex-col items-start gap-2">
              <p className="text-[15px] text-ink-2">Bring back the sample pantry and suggested week, for trying the app or giving a demo.</p>
              <ConfirmAction
                label="Reset demo data"
                icon={<RotateCcw size={17} aria-hidden="true" />}
                prompt="Replace your pantry, plan, budget, and preferences with the sample data? Your saved county stays unchanged."
                confirmLabel="Yes, reset"
                onConfirm={() => {
                  resetDemo()
                  toast('Demo data restored')
                }}
              />
            </div>
            <div className="flex flex-col items-start gap-2">
              <p className="text-[15px] text-ink-2">Remove everything PantryBridge has saved in this browser and start empty.</p>
              <ConfirmAction
                label="Clear all my data"
                icon={<Trash2 size={17} aria-hidden="true" />}
                prompt="Delete your pantry, plan, budget, lists, and saved county, and reset preferences in this browser? This can't be undone."
                confirmLabel="Yes, clear everything"
                onConfirm={() => {
                  clearAll()
                  writeSupportCounty(null)
                  toast('All data cleared from this device')
                }}
              />
            </div>
          </div>
        </section>

        <section className="module" aria-labelledby="s-sources">
          <ModuleTitle id="s-sources">Data sources</ModuleTitle>
          <ul className="divide-y divide-rule">
            {SOURCES.map((s) => (
              <li key={s.name} className="py-2.5 first:pt-0 last:pb-0">
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-forest underline">
                  {s.name}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
                <p className="text-sm text-ink-2">{s.use}</p>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-ink-2">Grocery prices are rough U.S. estimates for planning. Recipes come from a built-in collection, not AI.</p>
        </section>

        <section className="module" aria-labelledby="s-about">
          <ModuleTitle id="s-about">About PantryBridge</ModuleTitle>
          <div className="space-y-2 text-[15px] leading-relaxed text-ink">
            <p>PantryBridge helps Arkansas households make more from what they have: turn the food already on hand into meals, plan the week on a budget, and find food assistance without having to explain anything.</p>
            <p className="text-ink-2">Built as a student project in the spirit of the Congressional App Challenge, with an Arkansas focus. It is not affiliated with any government agency or food bank.</p>
            <p className="text-ink-2">Nutrition and cost figures are estimates and are not medical or dietary advice. Pantry scanning runs in demo mode: no vision model is connected.</p>
          </div>
        </section>
      </div>
    </div>
  )
}
