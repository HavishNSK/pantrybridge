import { INGREDIENT_BY_ID } from '../../data/ingredients'
import { formatQty } from '../../lib/units'
import type { Ingredient, PantryItem } from '../../types'

/** Every shape the shelf knows how to draw. */
export type FoodKind =
  | 'jar'
  | 'spice'
  | 'can'
  | 'box'
  | 'bag'
  | 'carton'
  | 'bottle'
  | 'tub'
  | 'block'
  | 'stack'
  | 'tray'
  | 'eggs'
  | 'onion'
  | 'potato'
  | 'apple'
  | 'round'
  | 'banana'
  | 'carrot'

export interface FoodStyle {
  /** label / packaging color */
  pack: string
  /** label text + motif color */
  ink: string
  /** food color (jar contents, produce skin) */
  food: string
  /** secondary accent (motif dots, stems, lids) */
  accent: string
}

export interface ShelfObject {
  uid: string
  ingredientId: string
  kind: FoodKind
  name: string
  /** short label printed on packaging */
  label: string
  qtyText: string
  /** how many produce pieces to show in a cluster */
  count: number
  style: FoodStyle
  shelf: number
  x: number
  width: number
}

/** Approximate height of each kind, for placing the selection label. */
export const KIND_HEIGHT: Record<FoodKind, number> = {
  jar: 0.5,
  spice: 0.3,
  can: 0.42,
  box: 0.58,
  bag: 0.56,
  carton: 0.66,
  bottle: 0.64,
  tub: 0.26,
  block: 0.16,
  stack: 0.12,
  tray: 0.14,
  eggs: 0.2,
  onion: 0.26,
  potato: 0.2,
  apple: 0.24,
  round: 0.26,
  banana: 0.22,
  carrot: 0.16,
}

export const MAX_OBJECTS = 18

/** Shelf geometry, in scene units. Shared by the scene and the SVG fallback. */
export const SHELF = {
  innerWidth: 3.2,
  depth: 0.9,
  board: 0.06,
  /** y of the top surface of each shelf board, bottom to top */
  tops: [0.16, 1.18, 2.2] as const,
  height: 3.24,
  side: 0.09,
} as const

const WIDTH: Record<FoodKind, number> = {
  jar: 0.36,
  spice: 0.2,
  can: 0.3,
  box: 0.38,
  bag: 0.44,
  carton: 0.28,
  bottle: 0.24,
  tub: 0.32,
  block: 0.34,
  stack: 0.42,
  tray: 0.46,
  eggs: 0.5,
  onion: 0.42,
  potato: 0.48,
  apple: 0.4,
  round: 0.38,
  banana: 0.5,
  carrot: 0.5,
}

/** Preferred shelf: 0 bottom (heavy bags + produce), 1 middle (cans + boxes), 2 top (glass + bottles). */
const PREFERRED: Record<FoodKind, number> = {
  jar: 2,
  spice: 2,
  bottle: 2,
  tub: 2,
  block: 2,
  can: 1,
  box: 1,
  carton: 1,
  eggs: 1,
  stack: 1,
  tray: 1,
  bag: 0,
  onion: 0,
  potato: 0,
  apple: 0,
  round: 0,
  banana: 0,
  carrot: 0,
}

const P = {
  forest: '#173F35',
  forest2: '#1F5244',
  leaf: '#8DBF75',
  leafWash: '#E5EFD9',
  cream: '#F7F4EC',
  paper: '#FFFEFA',
  terracotta: '#D98566',
  terraInk: '#9C4A2B',
  terraWash: '#F6E2D8',
  ink: '#252C28',
}

const KIND_BY_ID: Record<string, FoodKind> = {
  rice: 'bag',
  'brown-rice': 'jar',
  oats: 'jar',
  pasta: 'box',
  bread: 'bag',
  tortillas: 'stack',
  flour: 'bag',
  cornmeal: 'bag',
  sugar: 'bag',
  lentils: 'jar',
  'peanut-butter': 'jar',
  eggs: 'eggs',
  milk: 'carton',
  broth: 'carton',
  cheddar: 'block',
  butter: 'block',
  yogurt: 'tub',
  chicken: 'tray',
  'ground-turkey': 'tray',
  onion: 'onion',
  garlic: 'onion',
  potatoes: 'potato',
  'sweet-potatoes': 'potato',
  carrots: 'carrot',
  apples: 'apple',
  tomatoes: 'apple',
  bananas: 'banana',
  oranges: 'round',
  cabbage: 'round',
  'bell-pepper': 'round',
  spinach: 'bag',
  raisins: 'box',
  oil: 'bottle',
  'soy-sauce': 'bottle',
  honey: 'bottle',
  spices: 'spice',
  'baking-powder': 'spice',
}

export function kindFor(item: PantryItem, ing: Ingredient): FoodKind {
  if (item.unit === 'can') return 'can'
  const direct = KIND_BY_ID[ing.id]
  if (direct) return direct
  switch (ing.category) {
    case 'canned':
      return 'can'
    case 'grains':
    case 'legumes':
      return 'jar'
    case 'produce':
      return 'potato'
    case 'fruit':
      return 'apple'
    case 'dairy':
      return ing.base === 'ml' ? 'carton' : 'block'
    case 'protein':
      return 'tray'
    case 'baking':
    case 'frozen':
      return 'bag'
    case 'condiments':
      return ing.base === 'ml' ? 'bottle' : 'spice'
  }
}

const STYLE_BY_ID: Record<string, Partial<FoodStyle>> = {
  rice: { pack: P.paper, ink: P.forest, accent: P.leaf },
  'brown-rice': { food: '#C9A877' },
  oats: { food: '#E3CC98', accent: P.terracotta },
  pasta: { pack: P.forest, ink: P.cream, food: '#F0C96A', accent: P.leaf },
  lentils: { food: '#C0703F', accent: P.forest },
  'peanut-butter': { food: '#B9773D', accent: P.terracotta },
  'black-beans': { pack: P.forest, ink: P.cream, accent: '#2B2B2B' },
  'pinto-beans': { pack: P.terracotta, ink: P.paper, accent: '#E9C9A6' },
  chickpeas: { pack: P.leafWash, ink: P.forest, accent: '#E2BE7E' },
  'diced-tomatoes': { pack: P.terracotta, ink: P.paper, accent: '#B8392A' },
  'tomato-paste': { pack: P.terraInk, ink: P.paper, accent: '#D9533F' },
  corn: { pack: P.leaf, ink: P.forest, accent: '#F2CF55' },
  'green-beans': { pack: P.leaf, ink: P.forest, accent: P.forest2 },
  tuna: { pack: P.cream, ink: P.forest, accent: P.terracotta },
  peaches: { pack: P.terraWash, ink: P.terraInk, accent: '#F0A060' },
  milk: { pack: P.paper, ink: P.forest, accent: P.leaf },
  broth: { pack: P.terraWash, ink: P.terraInk, accent: P.terracotta },
  cheddar: { pack: '#F2B84B', ink: P.forest, food: '#F2B84B' },
  butter: { pack: '#F6E7B0', ink: P.forest, food: '#F6E7B0' },
  yogurt: { pack: P.paper, ink: P.forest, accent: P.leaf },
  tortillas: { food: '#EBD3A2', pack: P.cream },
  bread: { pack: '#D9A464', ink: P.forest },
  spinach: { pack: P.leaf, ink: P.forest },
  'mixed-veg': { pack: P.leaf, ink: P.forest, accent: P.terracotta },
  peas: { pack: P.leaf, ink: P.forest, accent: P.forest2 },
  berries: { pack: '#5A4A78', ink: P.paper, accent: '#8B6FB8' },
  'frozen-spinach': { pack: P.forest2, ink: P.cream },
  flour: { pack: P.paper, ink: P.terraInk, accent: P.terracotta },
  cornmeal: { pack: '#F2CF55', ink: P.forest },
  sugar: { pack: P.paper, ink: P.forest },
  onion: { food: '#C98B4A', accent: '#8A5A2B' },
  garlic: { food: '#F1EAD9', accent: '#C9B79A' },
  potatoes: { food: '#B88A58' },
  'sweet-potatoes': { food: '#A4523B' },
  carrots: { food: '#E07B2E', accent: '#4E8A3A' },
  apples: { food: '#C2402F', accent: '#5B3A1E' },
  tomatoes: { food: '#D2432F', accent: '#3F7A2E' },
  bananas: { food: '#F1CC4E', accent: '#5B4A1E' },
  oranges: { food: '#EE8A2C' },
  cabbage: { food: '#9CC37E' },
  'bell-pepper': { food: '#C9372C', accent: '#3F7A2E' },
  oil: { food: '#E3B23C', pack: P.paper, ink: P.forest, accent: P.leaf },
  'soy-sauce': { food: '#3A2016', pack: P.terracotta, ink: P.paper },
  honey: { food: '#D99A2B', pack: P.paper, ink: P.terraInk },
  spices: { food: '#9C4A2B', pack: P.cream, ink: P.forest },
  chicken: { food: '#E8B4A0' },
  'ground-turkey': { food: '#C9806E' },
  raisins: { pack: P.terracotta, ink: P.paper, accent: '#5A2E3A' },
}

const DEFAULT_STYLE: FoodStyle = { pack: P.cream, ink: P.forest, food: '#D8C49A', accent: P.terracotta }

function styleFor(ing: Ingredient): FoodStyle {
  return { ...DEFAULT_STYLE, ...STYLE_BY_ID[ing.id] }
}

/** "Black beans (canned)" -> "Black Beans"; keeps labels short enough for a can. */
export function shortLabel(name: string): string {
  const cleaned = name
    .replace(/\s*\(.*?\)\s*/g, ' ')
    .replace(/^(Canned|Frozen|Fresh|Dry|Plain)\s+/i, '')
    .replace(/,.*$/, '')
    .trim()
  return cleaned.replace(/\b\w/g, (c) => c.toUpperCase())
}

function pieces(item: PantryItem): number {
  if (item.unit === 'each' || item.unit === 'bunch') return Math.max(1, Math.min(3, Math.ceil(item.quantity)))
  if (item.unit === 'dozen') return 3
  return 2
}

interface Candidate {
  item: PantryItem
  ing: Ingredient
  kind: FoodKind
  order: number
}

/**
 * Deterministic shelf layout from the live pantry.
 * Picks a varied set (one of each kind per round, two cans per round) up to MAX_OBJECTS,
 * then packs each shelf left to right in pantry order and centers the row.
 */
export function layoutPantry(pantry: PantryItem[]): ShelfObject[] {
  const byKind = new Map<FoodKind, Candidate[]>()
  pantry.forEach((item, order) => {
    const ing = INGREDIENT_BY_ID[item.ingredientId]
    if (!ing || ing.id === 'water' || item.quantity <= 0) return
    const kind = kindFor(item, ing)
    const list = byKind.get(kind) ?? []
    list.push({ item, ing, kind, order })
    byKind.set(kind, list)
  })

  const used = [0, 0, 0]
  const capacity = SHELF.innerWidth - 0.24
  const gap = 0.07
  const placed: (Candidate & { shelf: number })[] = []

  const tryPlace = (c: Candidate): boolean => {
    const w = WIDTH[c.kind]
    const pref = PREFERRED[c.kind]
    const order = [pref, ...[0, 1, 2].filter((s) => s !== pref).sort((a, b) => Math.abs(a - pref) - Math.abs(b - pref))]
    for (const s of order) {
      const add = (used[s] > 0 ? gap : 0) + w
      if (used[s] + add <= capacity) {
        used[s] += add
        placed.push({ ...c, shelf: s })
        return true
      }
    }
    return false
  }

  const queues = [...byKind.values()].sort((a, b) => a[0].order - b[0].order)
  let progress = true
  while (placed.length < MAX_OBJECTS && progress) {
    progress = false
    for (const q of queues) {
      const quota = q[0]?.kind === 'can' ? 2 : 1
      for (let i = 0; i < quota && q.length && placed.length < MAX_OBJECTS; i++) {
        const c = q.shift()!
        if (tryPlace(c)) progress = true
      }
    }
  }

  const out: ShelfObject[] = []
  for (let s = 0; s < 3; s++) {
    const row = placed.filter((p) => p.shelf === s).sort((a, b) => a.order - b.order)
    const total = row.reduce((sum, p, i) => sum + WIDTH[p.kind] + (i ? gap : 0), 0)
    let cursor = -total / 2
    for (const p of row) {
      const w = WIDTH[p.kind]
      out.push({
        uid: p.item.uid,
        ingredientId: p.ing.id,
        kind: p.kind,
        name: p.ing.name,
        label: shortLabel(p.ing.name),
        qtyText: formatQty(p.item.quantity, p.item.unit),
        count: pieces(p.item),
        style: styleFor(p.ing),
        shelf: s,
        x: cursor + w / 2,
        width: w,
      })
      cursor += w + gap
    }
  }
  return out
}

/** Sentence for the canvas aria-label. */
export function describeShelf(objects: ShelfObject[], total: number): string {
  if (!objects.length) return 'An empty wooden pantry shelf. Add items to your pantry to see them here.'
  const names = objects.map((o) => o.label.toLowerCase())
  const list = names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names[0]
  const more = total > objects.length ? ` Showing ${objects.length} of ${total} pantry items.` : ''
  return `A 3D wooden pantry shelf holding ${list}.${more}`
}
