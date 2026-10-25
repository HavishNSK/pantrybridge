import * as THREE from 'three'
import type { FoodKind, FoodStyle } from './layout'

const FONT = '"Archivo Variable", "Archivo", ui-sans-serif, system-ui, sans-serif'
const cache = new Map<string, THREE.CanvasTexture>()

/** Small seeded PRNG so procedural textures are identical on every load. */
export function rng(seed: number) {
  let s = seed >>> 0 || 1
  return () => {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    return ((s >>> 0) % 100000) / 100000
  }
}

export function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619)
  return h >>> 0
}

function makeCanvas(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return [c, c.getContext('2d')!] as const
}

function finish(key: string, canvas: HTMLCanvasElement, opts?: { repeat?: boolean; anisotropy?: number }) {
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = opts?.anisotropy ?? 4
  if (opts?.repeat) tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  cache.set(key, tex)
  return tex
}

function setFont(ctx: CanvasRenderingContext2D, size: number, weight = 800) {
  ctx.font = `${weight} ${size}px ${FONT}`
  if ('fontStretch' in ctx) ctx.fontStretch = 'condensed'
}

/** Fit 1–2 lines of text into a box; returns lines + font size. */
function fitText(ctx: CanvasRenderingContext2D, text: string, maxW: number, maxSize: number, minSize: number, weight = 800) {
  const words = text.toUpperCase().split(/\s+/)
  for (let size = maxSize; size >= minSize; size -= 2) {
    setFont(ctx, size, weight)
    if (ctx.measureText(words.join(' ')).width <= maxW) return { lines: [words.join(' ')], size }
  }
  // Two lines: best split.
  for (let size = maxSize * 0.82; size >= minSize * 0.7; size -= 2) {
    setFont(ctx, size, weight)
    for (let i = 1; i < words.length; i++) {
      const a = words.slice(0, i).join(' ')
      const b = words.slice(i).join(' ')
      if (ctx.measureText(a).width <= maxW && ctx.measureText(b).width <= maxW) return { lines: [a, b], size }
    }
  }
  setFont(ctx, minSize * 0.7, weight)
  return { lines: [words.join(' ')], size: minSize * 0.7 }
}

function drawLines(ctx: CanvasRenderingContext2D, lines: string[], size: number, cx: number, cy: number) {
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const lh = size * 0.98
  const start = cy - ((lines.length - 1) * lh) / 2
  lines.forEach((l, i) => ctx.fillText(l, cx, start + i * lh))
}

function motifDots(ctx: CanvasRenderingContext2D, color: string, cx: number, cy: number, r: number, seed: number) {
  const rand = rng(seed)
  ctx.fillStyle = color
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + rand() * 0.4
    const d = r * (0.35 + rand() * 0.55)
    ctx.beginPath()
    ctx.ellipse(cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.6, r * 0.2, r * 0.14, a, 0, Math.PI * 2)
    ctx.fill()
  }
}

/**
 * Wrap-around can label. The front of the can maps to u = 0.5 (the cylinder uses thetaStart = PI),
 * so the design is centered horizontally. Canvas aspect ≈ circumference : label height.
 */
export function canLabel(label: string, style: FoodStyle, rev = 0): THREE.CanvasTexture {
  const key = `can${rev}|${label}|${style.pack}|${style.ink}|${style.accent}`
  const hit = cache.get(key)
  if (hit) return hit
  // 2π·r : label height ≈ 2.3 : 1, so the canvas keeps that aspect and text is not stretched.
  const W = 1024
  const H = 448
  const [c, ctx] = makeCanvas(W, H)
  ctx.fillStyle = style.pack
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = style.ink
  ctx.globalAlpha = 0.9
  ctx.fillRect(0, 0, W, 26)
  ctx.fillRect(0, H - 26, W, 26)
  ctx.globalAlpha = 1
  // back seam stripes
  ctx.fillStyle = style.accent
  ctx.fillRect(0, 26, 90, H - 52)
  ctx.fillRect(W - 90, 26, 90, H - 52)
  // motif disc above the name
  ctx.fillStyle = style.ink
  ctx.globalAlpha = 0.12
  ctx.beginPath()
  ctx.arc(W / 2, 140, 68, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1
  motifDots(ctx, style.accent, W / 2, 140, 64, hash(label))
  ctx.fillStyle = style.ink
  const { lines, size } = fitText(ctx, label, 270, 66, 36)
  drawLines(ctx, lines, size, W / 2, lines.length > 1 ? 296 : 290)
  ctx.globalAlpha = 0.5
  ctx.fillRect(W / 2 - 60, H - 70, 120, 5)
  ctx.globalAlpha = 1
  return finish(key, c)
}

/** Flat front panel for boxes, bags, cartons, blocks, jars. */
export function panelLabel(label: string, style: FoodStyle, kind: FoodKind, aspect: number, rev = 0): THREE.CanvasTexture {
  const key = `panel${rev}|${kind}|${label}|${style.pack}|${style.ink}|${aspect.toFixed(2)}`
  const hit = cache.get(key)
  if (hit) return hit
  const W = 512
  const H = Math.round(W / aspect)
  const [c, ctx] = makeCanvas(W, H)
  ctx.fillStyle = style.pack
  ctx.fillRect(0, 0, W, H)

  if (kind === 'box') {
    // pasta box: window with penne
    ctx.fillStyle = style.accent
    ctx.fillRect(0, H * 0.06, W, H * 0.05)
    const wx = W * 0.16
    const wy = H * 0.5
    const ww = W * 0.68
    const wh = H * 0.34
    ctx.fillStyle = '#FFF6DE'
    roundRect(ctx, wx, wy, ww, wh, 26)
    ctx.fill()
    const rand = rng(hash(label))
    ctx.fillStyle = style.food
    for (let i = 0; i < 14; i++) {
      ctx.save()
      ctx.translate(wx + 30 + rand() * (ww - 60), wy + 24 + rand() * (wh - 48))
      ctx.rotate(rand() * Math.PI)
      roundRect(ctx, -34, -10, 68, 20, 6)
      ctx.fill()
      ctx.restore()
    }
    ctx.fillStyle = style.ink
    const { lines, size } = fitText(ctx, label, W * 0.84, 120, 50)
    drawLines(ctx, lines, size, W / 2, H * 0.3)
    return finish(key, c)
  }

  if (kind === 'carton') {
    ctx.fillStyle = style.accent
    ctx.beginPath()
    ctx.moveTo(0, H * 0.72)
    ctx.bezierCurveTo(W * 0.3, H * 0.62, W * 0.7, H * 0.82, W, H * 0.7)
    ctx.lineTo(W, H)
    ctx.lineTo(0, H)
    ctx.fill()
    ctx.fillStyle = style.ink
    const { lines, size } = fitText(ctx, label, W * 0.82, 130, 50)
    drawLines(ctx, lines, size, W / 2, H * 0.38)
    return finish(key, c)
  }

  if (kind === 'jar' || kind === 'spice') {
    // paper band label on glass
    ctx.strokeStyle = style.ink
    ctx.globalAlpha = 0.5
    ctx.lineWidth = 6
    ctx.strokeRect(14, 14, W - 28, H - 28)
    ctx.globalAlpha = 1
    ctx.fillStyle = style.ink
    const { lines, size } = fitText(ctx, label, W * 0.8, H * 0.5, 40)
    drawLines(ctx, lines, size, W / 2, H / 2)
    return finish(key, c)
  }

  // bags, blocks, tubs, bottles, trays: name + a simple band
  ctx.fillStyle = style.ink
  ctx.globalAlpha = 0.14
  ctx.fillRect(0, H * 0.66, W, H * 0.12)
  ctx.globalAlpha = 1
  ctx.fillStyle = style.accent
  ctx.fillRect(0, H * 0.78, W, H * 0.22)
  ctx.fillStyle = style.ink
  const { lines, size } = fitText(ctx, label, W * 0.84, Math.min(130, H * 0.32), 40)
  drawLines(ctx, lines, size, W / 2, H * 0.38)
  return finish(key, c)
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** Speckled grain/bean fill for jar contents. */
export function grainTexture(color: string, seed: number): THREE.CanvasTexture {
  const key = `grain|${color}|${seed}`
  const hit = cache.get(key)
  if (hit) return hit
  const [c, ctx] = makeCanvas(256, 256)
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 256, 256)
  const rand = rng(seed)
  const base = new THREE.Color(color)
  for (let i = 0; i < 900; i++) {
    const shade = base.clone().offsetHSL(0, 0, (rand() - 0.5) * 0.22)
    ctx.fillStyle = `#${shade.getHexString()}`
    ctx.beginPath()
    ctx.ellipse(rand() * 256, rand() * 256, 3 + rand() * 4, 2 + rand() * 2.5, rand() * Math.PI, 0, Math.PI * 2)
    ctx.fill()
  }
  return finish(key, c, { repeat: true })
}

/** Warm wood grain for the shelf. */
export function woodTexture(seed = 7): THREE.CanvasTexture {
  const key = `wood|${seed}`
  const hit = cache.get(key)
  if (hit) return hit
  const [c, ctx] = makeCanvas(512, 512)
  const g = ctx.createLinearGradient(0, 0, 0, 512)
  g.addColorStop(0, '#D2A777')
  g.addColorStop(1, '#C99B69')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 512, 512)
  const rand = rng(seed)
  for (let i = 0; i < 70; i++) {
    const y = rand() * 512
    const amp = 2 + rand() * 6
    const freq = 0.006 + rand() * 0.014
    const phase = rand() * 10
    ctx.strokeStyle = rand() > 0.5 ? 'rgba(130, 82, 42, 0.16)' : 'rgba(250, 226, 190, 0.18)'
    ctx.lineWidth = 0.8 + rand() * 2.4
    ctx.beginPath()
    for (let x = 0; x <= 512; x += 8) {
      const yy = y + Math.sin(x * freq + phase) * amp
      if (x === 0) ctx.moveTo(x, yy)
      else ctx.lineTo(x, yy)
    }
    ctx.stroke()
  }
  return finish(key, c, { repeat: true, anisotropy: 8 })
}
