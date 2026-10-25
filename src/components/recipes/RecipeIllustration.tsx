import type { ReactNode } from 'react'
import type { Recipe } from '../../types'

/**
 * Flat vector food plates on one shared scale and ground ("botanical folio"):
 * every recipe sits on the same cream field, same shadow, same vessel size,
 * so the set reads as a series. Contents are seeded by recipe id.
 */

const GROUND = '#F7F4EC'
const CERAMIC = '#FFFEFA'
const CERAMIC_SHADE = '#E7E2D2'
const LINE = '#B9B6A4'
const IRON = '#2F3430'
const IRON_HI = '#454B46'
const STEEL = '#C9C6B8'
const STEEL_SHADE = '#ABA897'

function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function rng(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Rand = () => number
type Kind = 'bean' | 'grain' | 'leaf' | 'dot' | 'chunk'

interface Area {
  cx: number
  cy: number
  rx: number
  ry: number
}

/** Scatter points inside an ellipse with a minimum spacing (rejection sampling, deterministic). */
function scatter(r: Rand, area: Area, count: number, gap: number): [number, number][] {
  const pts: [number, number][] = []
  for (let tries = 0; pts.length < count && tries < count * 40; tries++) {
    const a = r() * Math.PI * 2
    const d = Math.sqrt(r()) * 0.86
    const x = area.cx + Math.cos(a) * area.rx * d
    const y = area.cy + Math.sin(a) * area.ry * d
    if (pts.every(([px, py]) => (px - x) ** 2 + ((py - y) * 1.6) ** 2 > gap * gap)) pts.push([x, y])
  }
  return pts
}

function piece(kind: Kind, x: number, y: number, color: string, r: Rand, key: string): ReactNode {
  const rot = Math.round(r() * 180)
  const s = 0.85 + r() * 0.35
  const t = `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot}) scale(${s.toFixed(2)})`
  switch (kind) {
    case 'bean':
      return <ellipse key={key} transform={t} rx="4.2" ry="2.6" fill={color} />
    case 'grain':
      return <ellipse key={key} transform={t} rx="2.2" ry="1.1" fill={color} />
    case 'leaf':
      return (
        <g key={key} transform={t}>
          <path d="M-6 0 Q0 -4.4 6 0 Q0 4.4 -6 0Z" fill={color} />
          <path d="M-5 0 H5" stroke={GROUND} strokeOpacity="0.55" strokeWidth="0.7" />
        </g>
      )
    case 'dot':
      return <circle key={key} transform={t} r="2.6" fill={color} />
    case 'chunk':
      return <rect key={key} transform={t} x="-4" y="-3.4" width="8" height="6.8" rx="1.6" fill={color} />
  }
}

/** Contents: a base fill plus a few shapes in the secondary and accent colors. */
function Contents({ area, colors, r, density = 1 }: { area: Area; colors: [string, string, string]; r: Rand; density?: number }) {
  const [, b, c] = colors
  const kinds: Kind[] = ['bean', 'grain', 'leaf', 'dot', 'chunk']
  const k1 = kinds[Math.floor(r() * kinds.length)]
  let k2 = kinds[Math.floor(r() * kinds.length)]
  if (k2 === k1) k2 = 'leaf'
  const n = Math.round((7 + r() * 6) * density)
  const pts = scatter(r, area, n, 7.5)
  const grains = scatter(r, area, Math.round((5 + r() * 6) * density), 4)
  return (
    <g>
      {grains.map(([x, y], i) => piece('grain', x, y, b, r, `g${i}`))}
      {pts.map(([x, y], i) => (i % 3 === 2 ? piece(k2, x, y, c, r, `p${i}`) : piece(k1, x, y, i % 2 ? c : b, r, `p${i}`)))}
    </g>
  )
}

function Bowl({ colors, r }: { colors: [string, string, string]; r: Rand }) {
  const [a] = colors
  return (
    <g>
      <ellipse cx="80" cy="99" rx="44" ry="8" fill="#252C28" opacity="0.09" />
      <path d="M28 58 C30 84 52 98 80 98 C108 98 130 84 132 58Z" fill={CERAMIC} />
      <path d="M33 72 C42 88 60 95 80 95 C100 95 118 88 127 72 C121 86 102 92 80 92 C58 92 39 86 33 72Z" fill={CERAMIC_SHADE} />
      <path d="M44 90 C56 96 104 96 116 90" stroke={LINE} strokeWidth="1" fill="none" />
      <ellipse cx="80" cy="58" rx="52" ry="17" fill={CERAMIC} stroke={LINE} strokeWidth="1" />
      <ellipse cx="80" cy="59" rx="46" ry="13.5" fill={a} />
      <Contents area={{ cx: 80, cy: 59, rx: 44, ry: 12 }} colors={colors} r={r} />
    </g>
  )
}

function Skillet({ colors, r }: { colors: [string, string, string]; r: Rand }) {
  const [a] = colors
  return (
    <g>
      <ellipse cx="74" cy="96" rx="50" ry="8" fill="#252C28" opacity="0.09" />
      <path d="M118 62 L150 52 Q155 51 156 55 Q157 59 152 60 L121 70Z" fill={IRON} />
      <ellipse cx="72" cy="68" rx="52" ry="25" fill={IRON} />
      <ellipse cx="72" cy="64" rx="52" ry="24" fill={IRON_HI} />
      <ellipse cx="72" cy="65" rx="45" ry="19.5" fill={IRON} />
      <ellipse cx="72" cy="66" rx="42" ry="17" fill={a} />
      <Contents area={{ cx: 72, cy: 66, rx: 40, ry: 15.5 }} colors={colors} r={r} density={1.15} />
    </g>
  )
}

function Plate({ colors, r }: { colors: [string, string, string]; r: Rand }) {
  const [a, b] = colors
  const wide = r() > 0.5
  return (
    <g>
      <ellipse cx="80" cy="94" rx="58" ry="9" fill="#252C28" opacity="0.09" />
      <ellipse cx="80" cy="68" rx="62" ry="26" fill={CERAMIC_SHADE} />
      <ellipse cx="80" cy="66" rx="62" ry="26" fill={CERAMIC} stroke={LINE} strokeWidth="1" />
      <ellipse cx="80" cy="67" rx="45" ry="18" fill="none" stroke={CERAMIC_SHADE} strokeWidth="1.5" />
      {wide ? (
        <>
          <path d="M44 66 Q46 52 66 52 L98 52 Q116 52 116 66 Q116 78 98 78 L62 78 Q44 78 44 66Z" fill={a} />
          <path d="M50 64 Q52 56 66 56 L96 56 Q110 56 110 64" stroke={b} strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.8" />
        </>
      ) : (
        <ellipse cx="80" cy="64" rx="34" ry="13" fill={a} />
      )}
      <Contents area={{ cx: 80, cy: 64, rx: 32, ry: 11 }} colors={colors} r={r} density={0.8} />
    </g>
  )
}

function Mug({ colors, r }: { colors: [string, string, string]; r: Rand }) {
  const [a, b] = colors
  return (
    <g>
      <ellipse cx="82" cy="104" rx="36" ry="6" fill="#252C28" opacity="0.09" />
      <path d="M104 46 Q126 46 126 66 Q126 86 104 84" stroke={CERAMIC_SHADE} strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M52 34 L52 92 Q52 104 64 104 L100 104 Q112 104 112 92 L112 34Z" fill={CERAMIC} stroke={LINE} strokeWidth="1" />
      {/* layers seen through a jar wall */}
      <path d="M55 78 L109 78 L109 92 Q109 101 99 101 L65 101 Q55 101 55 92Z" fill={a} />
      <path d="M55 66 Q68 61 82 66 Q96 71 109 66 L109 78 L55 78Z" fill={b} />
      <rect x="55" y="58" width="54" height="8" fill={a} opacity="0.65" />
      <ellipse cx="82" cy="34" rx="30" ry="8" fill={CERAMIC} stroke={LINE} strokeWidth="1" />
      <ellipse cx="82" cy="35" rx="26" ry="6" fill={a} />
      <Contents area={{ cx: 82, cy: 35, rx: 24, ry: 5 }} colors={colors} r={r} density={0.55} />
    </g>
  )
}

function Tray({ colors, r }: { colors: [string, string, string]; r: Rand }) {
  const [a, b, c] = colors
  const cols = 5
  const rows = 3
  const items: ReactNode[] = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (r() < 0.12) continue
      const x = 38 + col * 21 + (r() - 0.5) * 6 + row * 2
      const y = 54 + row * 13 + (r() - 0.5) * 4
      const pick = r()
      const color = pick < 0.4 ? a : pick < 0.75 ? b : c
      const key = `${row}-${col}`
      if (pick < 0.4) items.push(<ellipse key={key} cx={x} cy={y} rx="8" ry="5" fill={color} transform={`rotate(${Math.round((r() - 0.5) * 40)} ${x} ${y})`} />)
      else if (pick < 0.75) items.push(<rect key={key} x={x - 5} y={y - 4} width="10" height="8" rx="2" fill={color} transform={`rotate(${Math.round((r() - 0.5) * 50)} ${x} ${y})`} />)
      else items.push(piece('leaf', x, y, color, r, key))
    }
  }
  return (
    <g>
      <ellipse cx="80" cy="99" rx="62" ry="7" fill="#252C28" opacity="0.09" />
      <path d="M22 46 L138 46 L146 92 L14 92Z" fill={STEEL_SHADE} />
      <path d="M24 42 L136 42 L144 88 L16 88Z" fill={STEEL} />
      <path d="M30 47 L130 47 L136 83 L24 83Z" fill="#DCD9CC" />
      {items}
    </g>
  )
}

const MOTIFS = { bowl: Bowl, skillet: Skillet, plate: Plate, mug: Mug, tray: Tray } as const

export function RecipeIllustration({ recipe, className = '' }: { recipe: Recipe; className?: string }) {
  const r = rng(hash(recipe.id))
  const Motif = MOTIFS[recipe.art.motif] ?? Bowl
  return (
    <svg viewBox="0 0 160 120" role="img" aria-label={`Illustration of ${recipe.name}`} className={className} preserveAspectRatio="xMidYMid meet">
      <rect width="160" height="120" fill={GROUND} />
      <Motif colors={recipe.art.colors} r={r} />
    </svg>
  )
}
