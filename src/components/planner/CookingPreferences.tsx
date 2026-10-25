import type { CookingPreferences as Preferences } from '../../lib/dinnerPlanning'
import { Field, Input, Select } from '../ui/Field'


export function CookingPreferences({ value, onChange }: { value: Preferences; onChange: (value: Preferences) => void }) {
  const patch = (next: Partial<Preferences>) => onChange({ ...value, ...next })
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Cooking setup</legend>
        <label className="inline-flex min-h-11 items-center gap-2 text-sm">
          <input type="checkbox" className="size-4 accent-forest" checked={value.equipment.includes('pot')} onChange={(e) => patch({ equipment: e.target.checked ? [...value.equipment.filter((tool) => tool !== 'pot'), 'pot'] : value.equipment.filter((tool) => tool !== 'pot') })} />
          Pot + stovetop
        </label>
        <p className="mt-1 text-sm text-ink-2">The current dinner recipes use one pot and a stovetop.</p>
      </fieldset>
      <div className="space-y-3">
        <Field label="Maximum time per dinner" htmlFor="dinner-minutes">
          <Select id="dinner-minutes" value={value.maxMinutes} onChange={(e) => patch({ maxMinutes: Number(e.target.value) })}>
            {[15, 20, 25, 30, 45, 60].map((n) => <option key={n} value={n}>{n} minutes</option>)}
          </Select>
        </Field>
        <label className="flex min-h-11 items-center gap-2 text-sm font-semibold">
          <input type="checkbox" className="size-4 accent-forest" checked={value.safeWater} onChange={(e) => patch({ safeWater: e.target.checked })} />
          I have safe water for cooking
        </label>
      </div>
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input type="checkbox" checked={value.noShopping} onChange={(e) => patch({ noShopping: e.target.checked })} /> No additional purchases
      </label>
      {!value.noShopping && (
        <Field label="Total additional budget ($)" htmlFor="dinner-budget" hint="Includes groceries already missing from meals you keep. Prices are estimates.">
          <Input id="dinner-budget" type="number" min="0" max="10000" step="0.01" value={value.budget} onChange={(e) => patch({ budget: Number(e.target.value) })} />
        </Field>
      )}
    </div>
  )
}
