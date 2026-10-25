import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { demoPantry, makeUid } from '../data/demoPantry'
import { mergeItems } from '../lib/pantry'
import { suggestWeek } from '../lib/planner'
import type { Budget, ListItem, MealSlot, PantryItem, PlanEntry, WeekPlan } from '../types'

interface State {
  pantry: PantryItem[]
  plan: WeekPlan
  household: number
  budget: Budget | null
  /** ingredient ids ticked off the generated shopping list */
  checked: string[]
  extras: ListItem[]
  onboarded: boolean

  addItems: (items: PantryItem[]) => void
  updateItem: (uid: string, patch: Partial<PantryItem>) => void
  removeItem: (uid: string) => void
  /** Put a removed item back exactly as it was (no merging), at its old position when given. */
  restoreItem: (item: PantryItem, index?: number) => void
  clearPantry: () => void

  setMeal: (day: number, slot: MealSlot, entry: PlanEntry | null) => void
  setServings: (day: number, slot: MealSlot, servings: number) => void
  replacePlan: (plan: WeekPlan) => void
  suggest: () => void
  clearPlan: () => void

  setHousehold: (n: number) => void
  setBudget: (b: Budget | null) => void
  toggleChecked: (id: string) => void
  addExtra: (name: string, food: boolean) => void
  toggleExtra: (id: string) => void
  removeExtra: (id: string) => void

  resetDemo: () => void
  clearAll: () => void
}

const initialPantry = demoPantry()

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      pantry: initialPantry,
      plan: suggestWeek(initialPantry, 3),
      household: 3,
      budget: null,
      checked: [],
      extras: [],
      onboarded: false,

      addItems: (items) => set((s) => ({ pantry: mergeItems(s.pantry, items.map((i) => ({ ...i, demo: false }))), onboarded: true })),
      updateItem: (uid, patch) => set((s) => ({ pantry: s.pantry.map((p) => (p.uid === uid ? { ...p, ...patch, demo: false } : p)) })),
      removeItem: (uid) => set((s) => ({ pantry: s.pantry.filter((p) => p.uid !== uid) })),
      restoreItem: (item, index) =>
        set((s) => {
          if (s.pantry.some((p) => p.uid === item.uid)) return {}
          const pantry = [...s.pantry]
          const at = index == null ? pantry.length : Math.max(0, Math.min(index, pantry.length))
          pantry.splice(at, 0, item)
          return { pantry }
        }),
      clearPantry: () => set({ pantry: [] }),

      setMeal: (day, slot, entry) =>
        set((s) => {
          const dayPlan = { ...(s.plan[day] ?? {}) }
          if (entry) dayPlan[slot] = entry
          else delete dayPlan[slot]
          return { plan: { ...s.plan, [day]: dayPlan } }
        }),
      setServings: (day, slot, servings) => {
        const e = get().plan[day]?.[slot]
        if (e) get().setMeal(day, slot, { ...e, servings: Math.max(1, Math.min(12, servings)) })
      },
      replacePlan: (plan) => set({ plan }),
      suggest: () => set((s) => ({ plan: suggestWeek(s.pantry, s.household), checked: [] })),
      clearPlan: () => set({ plan: {}, checked: [] }),

      setHousehold: (n) => set({ household: Math.max(1, Math.min(12, n)) }),
      setBudget: (budget) => set({ budget }),
      toggleChecked: (id) => set((s) => ({ checked: s.checked.includes(id) ? s.checked.filter((c) => c !== id) : [...s.checked, id] })),
      addExtra: (name, food) => set((s) => ({ extras: [...s.extras, { id: makeUid(), name, food, done: false }] })),
      toggleExtra: (id) => set((s) => ({ extras: s.extras.map((e) => (e.id === id ? { ...e, done: !e.done } : e)) })),
      removeExtra: (id) => set((s) => ({ extras: s.extras.filter((e) => e.id !== id) })),

      resetDemo: () => {
        const pantry = demoPantry()
        set({ pantry, plan: suggestWeek(pantry, 3), household: 3, budget: null, checked: [], extras: [], onboarded: false })
      },
      clearAll: () => set({ pantry: [], plan: {}, household: 3, budget: null, checked: [], extras: [], onboarded: true }),
    }),
    {
      name: 'pantrybridge:v1',
      version: 1,
      storage: createJSONStorage(() => {
        try {
          return localStorage
        } catch {
          return sessionStorage
        }
      }),
      partialize: ({ pantry, plan, household, budget, checked, extras, onboarded }) => ({ pantry, plan, household, budget, checked, extras, onboarded }),
    },
  ),
)

export const isDemoPantry = (pantry: PantryItem[]) => pantry.length > 0 && pantry.some((p) => p.demo)
