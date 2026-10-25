/**
 * Signature move: numerals roll into place when a value changes, like a flap
 * board updating one cell at a time. Unchanged characters stay still.
 */
export function RollingNumber({ value, className = '', label }: { value: string; className?: string; label?: string }) {
  const chars = value.split('')
  return (
    <span className={`num inline-flex overflow-hidden align-baseline ${className}`} aria-label={label ?? value} role="text">
      {chars.map((c, i) => (
        <span
          // Key by position from the right + char, so a changed digit remounts and rolls.
          key={`${chars.length - i}-${c}`}
          aria-hidden="true"
          className="inline-block motion-safe:animate-[roll-in_300ms_var(--ease-out-expo)_both]"
          style={{ animationDelay: `${Math.min(i, 6) * 18}ms` }}
        >
          {c}
        </span>
      ))}
    </span>
  )
}
