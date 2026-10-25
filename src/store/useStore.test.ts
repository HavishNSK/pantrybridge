import { beforeEach, describe, expect, it, vi } from 'vitest'
vi.hoisted(() => {
  const storage = { getItem: () => null, setItem: () => undefined, removeItem: () => undefined }
  Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true })
  Object.defineProperty(globalThis, 'sessionStorage', { value: storage, configurable: true })
})
import { useStore } from './useStore'
import { DEFAULT_COOKING_PREFERENCES } from '../lib/dinnerPlanning'

beforeEach(() => useStore.getState().clearAll())
describe('local pantry state', () => {
  it('keeps sample provenance through add and edits', () => {
    useStore.getState().addItems([{ uid: 'sample', ingredientId: 'rice', quantity: 1, unit: 'g', addedAt: '', demo: true }])
    useStore.getState().updateItem('sample', { quantity: 2, demo: false })
    expect(useStore.getState().pantry[0].demo).toBe(true)
  })
  it('hydrates older saves with conservative normalized cooking defaults', () => {
    const merge = useStore.persist.getOptions().merge!
    expect(merge({ household: 4 }, useStore.getState()).cookingPreferences).toEqual(DEFAULT_COOKING_PREFERENCES)
    expect(merge({ cookingPreferences: { equipment: ['laser'], safeWater: 'yes' } }, useStore.getState()).cookingPreferences).toEqual(DEFAULT_COOKING_PREFERENCES)
    const partialize = useStore.persist.getOptions().partialize!
    expect(partialize(useStore.getState())).toHaveProperty('cookingPreferences')
  })
  it('normalizes cooking preferences and resets them', () => {
    useStore.getState().setCookingPreferences({ ...DEFAULT_COOKING_PREFERENCES, maxMinutes: NaN })
    expect(useStore.getState().cookingPreferences.maxMinutes).toBe(DEFAULT_COOKING_PREFERENCES.maxMinutes)
    useStore.getState().clearAll()
    expect(useStore.getState().cookingPreferences).toEqual(DEFAULT_COOKING_PREFERENCES)
    useStore.getState().resetDemo()
    expect(useStore.getState().cookingPreferences).toEqual(DEFAULT_COOKING_PREFERENCES)
  })
})
