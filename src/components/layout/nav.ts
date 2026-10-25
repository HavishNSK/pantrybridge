import { CalendarDays, HandHeart, LayoutGrid, Package, Salad, type LucideIcon } from 'lucide-react'

export const NAV: { to: string; label: string; short: string; icon: LucideIcon }[] = [
  { to: '/', label: 'Overview', short: 'Overview', icon: LayoutGrid },
  { to: '/pantry', label: 'My Pantry', short: 'Pantry', icon: Package },
  { to: '/planner', label: 'Meal Planner', short: 'Planner', icon: CalendarDays },
  { to: '/nutrition', label: 'Nutrition', short: 'Nutrition', icon: Salad },
  { to: '/support', label: 'Find Food Support', short: 'Support', icon: HandHeart },
]
