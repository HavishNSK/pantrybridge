/** Plate, leaf, and terracotta dot shared by the tile and plate-only marks (32-unit grid). */
function PlateArt() {
  return (
    <>
      <circle cx="16" cy="16" r="11.5" fill="#F7F4EC" />
      <circle cx="16" cy="16" r="8.6" fill="none" stroke="#D5D8CF" strokeWidth="0.9" />
      <path d="M22 10C14.5 10.4 11 15 11.6 21.4C17.4 21.4 21.6 17.2 22 10Z" fill="#8DBF75" />
      <path d="M22 10L11.6 21.4C17.4 21.4 21.6 17.2 22 10Z" fill="#77A85F" />
      <path d="M19.8 12.4L10 22.4" stroke="#2F5A2A" strokeWidth="1.15" strokeLinecap="round" />
      <circle cx="20.6" cy="20.4" r="2.1" fill="#D98566" />
    </>
  )
}

/** FullPlate app mark: a cream plate holding a leaf and a terracotta dot on a forest tile. */
export function LogoMark({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <rect width="32" height="32" rx="7" fill="#173F35" />
      <PlateArt />
    </svg>
  )
}

/** Plate-only mark for placement on the forest masthead, where the tile would disappear. */
export function PlateMark({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="4.5 4.5 23 23" aria-hidden="true" className={className}>
      <PlateArt />
    </svg>
  )
}

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <PlateMark size={30} />
      <span translate="no" className="condensed text-[21px] font-extrabold tracking-[-0.02em]">
        Full<span className="text-leaf">Plate</span>
      </span>
    </span>
  )
}
