/** PantryBridge mark: a bridge arch over a shelf line, with a sprouting leaf. */
export function LogoMark({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <rect width="32" height="32" rx="7" fill="#173F35" />
      <path d="M6 21c3-6 7-9 10-9s7 3 10 9" fill="none" stroke="#8DBF75" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M6 24h20" stroke="#F7F4EC" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M16 12V7c2 0 4 1.5 4 4" fill="none" stroke="#F7F4EC" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark />
      <span translate="no" className="condensed text-[21px] font-extrabold tracking-[-0.02em]">
        Pantry<span className="text-leaf">Bridge</span>
      </span>
    </span>
  )
}
