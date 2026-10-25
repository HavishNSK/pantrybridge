import { Clock } from 'lucide-react'
import { Tag } from '../ui/Tag'
import { daysLabel } from './dates'

/** Days-left chip: terracotta "need" tone at 3 days or fewer, neutral otherwise. */
export function DaysTag({ days, className = '' }: { days: number; className?: string }) {
  return (
    <Tag tone={days <= 3 ? 'need' : 'neutral'} icon={<Clock size={12} aria-hidden="true" />} className={`num whitespace-nowrap ${className}`}>
      {daysLabel(days)}
    </Tag>
  )
}
