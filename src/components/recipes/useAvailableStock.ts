import { useMemo } from 'react'
import { analyzePlan, plannedCount } from '../../lib/planner'
import { useStore } from '../../store/useStore'
import type { WeekPlan } from '../../types'

/**
 * Pantry stock minus what the current week plan already reserves.
 * Pass `exceptRecipeId` to ignore that recipe's own planned servings, so a planned
 * meal doesn't list its own reserved ingredients as "to buy".
 */
export function useAvailableStock(exceptRecipeId?: string) {
  const pantry = useStore((s) => s.pantry)
  const plan = useStore((s) => s.plan)
  const stock = useMemo(() => {
    let p: WeekPlan = plan
    if (exceptRecipeId) {
      p = Object.fromEntries(
        Object.entries(plan).map(([day, slots]) => [day, Object.fromEntries(Object.entries(slots ?? {}).filter(([, e]) => e?.recipeId !== exceptRecipeId))]),
      )
    }
    return analyzePlan(p, pantry).remaining
  }, [plan, pantry, exceptRecipeId])
  const inPlan = !!exceptRecipeId && Object.values(plan).some((slots) => Object.values(slots ?? {}).some((e) => e?.recipeId === exceptRecipeId))
  return { stock, pantry, plan, planned: plannedCount(plan), inPlan }
}
