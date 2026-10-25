import { ContactShadows, Environment, Html, Lightformer, OrbitControls, PerformanceMonitor } from '@react-three/drei'
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { ArrowRight } from 'lucide-react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import * as THREE from 'three'
import { Food } from './foods'
import { KIND_HEIGHT, SHELF, type ShelfObject } from './layout'
import { woodTexture } from './textures'
import { useDocumentVisible, useFontsReady, useMediaQuery, useReducedMotion } from './useWebGL'

export interface PantrySceneProps {
  objects: ShelfObject[]
  description: string
  selected: string | null
  onSelect: (uid: string | null) => void
  onOpenPantry: () => void
  onContextLost: () => void
}

const TARGET = new THREE.Vector3(0, 1.62, 0)
const ITEM_Z = 0.06
const AZIMUTH = THREE.MathUtils.degToRad(25)

/* ---------- camera fit: keep the whole unit in frame at any aspect ---------- */

function CameraFit({ controls }: { controls: boolean }) {
  const get = useThree((s) => s.get)
  const size = useThree((s) => s.size)
  useLayoutEffect(() => {
    const { camera, invalidate } = get()
    if (!(camera instanceof THREE.PerspectiveCamera)) return
    const aspect = size.width / Math.max(size.height, 1)
    const dist = camera.position.distanceTo(TARGET)
    const visibleH = 2 * dist * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
    // Small margin so the crown molding never clips under perspective.
    camera.zoom = Math.min(visibleH / 3.95, (visibleH * aspect) / 4.1)
    if (!controls) camera.lookAt(TARGET)
    camera.updateProjectionMatrix()
    invalidate()
  }, [get, size, controls])
  return null
}

/* ---------- canvas a11y + context loss ---------- */

function CanvasA11y({ description, onContextLost }: { description: string; onContextLost: () => void }) {
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    const el = gl.domElement
    el.setAttribute('role', 'img')
    el.setAttribute('aria-label', description)
  }, [gl, description])
  useEffect(() => {
    const el = gl.domElement
    const lost = (e: Event) => {
      e.preventDefault()
      onContextLost()
    }
    el.addEventListener('webglcontextlost', lost)
    return () => el.removeEventListener('webglcontextlost', lost)
  }, [gl, onContextLost])
  return null
}

/* ---------- shelf unit ---------- */

function ShelfUnit() {
  const wood = useMemo(() => woodTexture(7), [])
  const { innerWidth: W, depth: D, board: B, tops, height: H, side: S } = SHELF
  return (
    <group>
      {[-1, 1].map((dir) => (
        <mesh key={dir} position={[dir * (W / 2 + S / 2), H / 2, 0]}>
          <boxGeometry args={[S, H, D]} />
          <meshStandardMaterial map={wood} color="#F1DEC6" roughness={0.72} />
        </mesh>
      ))}
      <mesh position={[0, H + 0.035, 0.01]}>
        <boxGeometry args={[W + S * 2 + 0.08, 0.07, D + 0.04]} />
        <meshStandardMaterial map={wood} color="#F6E6D0" roughness={0.7} />
      </mesh>
      {tops.map((t) => (
        <group key={t}>
          <mesh position={[0, t - B / 2, 0]}>
            <boxGeometry args={[W, B, D]} />
            <meshStandardMaterial map={wood} color="#FFF3E2" roughness={0.68} />
          </mesh>
          {/* front lip catches the light so each shelf reads as a crisp line */}
          <mesh position={[0, t - B / 2 - 0.012, D / 2 - 0.012]}>
            <boxGeometry args={[W, B + 0.024, 0.024]} />
            <meshStandardMaterial map={wood} color="#E9CFAE" roughness={0.6} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, (tops[0] - B) / 2, D / 2 - 0.03]}>
        <boxGeometry args={[W, tops[0] - B, 0.03]} />
        <meshStandardMaterial map={wood} color="#C9A27A" roughness={0.75} />
      </mesh>
      <mesh position={[0, H / 2, -D / 2 + 0.015]}>
        <boxGeometry args={[W, H, 0.03]} />
        <meshStandardMaterial map={wood} color="#D9BC9A" roughness={0.8} />
      </mesh>
    </group>
  )
}

/* ---------- one interactive item ---------- */

interface ItemProps {
  obj: ShelfObject
  glass: boolean
  rev: number
  hovered: boolean
  selected: boolean
  onHover: Dispatch<SetStateAction<string | null>>
  onSelect: (uid: string | null) => void
  onOpenPantry: () => void
}

function clampLabel(el: THREE.Object3D, camera: THREE.Camera, size: { width: number; height: number }) {
  const v = new THREE.Vector3().setFromMatrixPosition(el.matrixWorld).project(camera)
  const half = Math.min(118, size.width / 2 - 8)
  const x = THREE.MathUtils.clamp((v.x * 0.5 + 0.5) * size.width, half + 8, size.width - half - 8)
  const y = THREE.MathUtils.clamp((-v.y * 0.5 + 0.5) * size.height, 120, size.height - 8)
  return [x, y]
}

function Item({ obj, glass, rev, hovered, selected, onHover, onSelect, onOpenPantry }: ItemProps) {
  const lift = useRef<THREE.Group>(null)
  const invalidate = useThree((s) => s.invalidate)
  const target = selected ? 0.07 : hovered ? 0.04 : 0
  const scaleTarget = hovered || selected ? 1.035 : 1

  useEffect(() => invalidate(), [target, invalidate])

  useFrame((_, delta) => {
    const g = lift.current
    if (!g) return
    const dt = Math.min(delta, 1 / 30)
    g.position.y = THREE.MathUtils.damp(g.position.y, target, 14, dt)
    const s = THREE.MathUtils.damp(g.scale.x, scaleTarget, 14, dt)
    g.scale.setScalar(s)
    if (Math.abs(g.position.y - target) > 1e-4 || Math.abs(s - scaleTarget) > 1e-4) invalidate()
  })

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    onHover(obj.uid)
  }
  const out = () => onHover((cur) => (cur === obj.uid ? null : cur))
  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    onSelect(selected ? null : obj.uid)
  }

  return (
    <group position={[obj.x, SHELF.tops[obj.shelf], ITEM_Z]} onPointerOver={over} onPointerOut={out} onClick={click}>
      <group ref={lift}>
        <Food obj={obj} glass={glass} rev={rev} />
        {selected && (
          <Html position={[0, KIND_HEIGHT[obj.kind] + 0.06, 0]} calculatePosition={clampLabel} zIndexRange={[30, 0]}>
            <div
              className="w-[220px] -translate-x-1/2 -translate-y-full rounded-[10px] border border-rule-strong bg-paper p-3 text-ink motion-safe:animate-[rise_220ms_var(--ease-out-expo)]"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <p className="text-[15px] leading-snug font-semibold text-forest">{obj.name}</p>
              <p className="num mt-0.5 text-[15px] text-ink-2">{obj.qtyText} on hand</p>
              <a
                href="/pantry"
                onClick={(e) => {
                  e.preventDefault()
                  onOpenPantry()
                }}
                className="mt-2 inline-flex min-h-10 items-center gap-1.5 text-[15px] font-semibold text-forest underline decoration-rule-strong hover:decoration-forest"
              >
                Open in pantry
                <ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>
          </Html>
        )}
      </group>
    </group>
  )
}

/* ---------- idle sway + perf probing ---------- */

function Sway({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  const ref = useRef<THREE.Group>(null)
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    if (enabled) invalidate()
  }, [enabled, invalidate])
  useFrame((state, delta) => {
    const g = ref.current
    if (!g) return
    if (enabled) {
      const t = state.clock.elapsedTime
      g.rotation.y = Math.sin(t * 0.32) * 0.045
      g.position.y = Math.sin(t * 0.5) * 0.008
      invalidate()
    } else if (Math.abs(g.rotation.y) > 1e-4 || Math.abs(g.position.y) > 1e-5) {
      const dt = Math.min(delta, 1 / 30)
      g.rotation.y = THREE.MathUtils.damp(g.rotation.y, 0, 4, dt)
      g.position.y = THREE.MathUtils.damp(g.position.y, 0, 4, dt)
      invalidate()
    }
  })
  return <group ref={ref}>{children}</group>
}

/** Keeps frames flowing for a short window so PerformanceMonitor gets honest samples in demand mode. */
function WarmUp({ ms, onDone }: { ms: number; onDone: () => void }) {
  const invalidate = useThree((s) => s.invalidate)
  const start = useRef<number | null>(null)
  const done = useRef(false)
  const alive = useRef(false)
  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])
  useFrame(() => {
    if (done.current || !alive.current) return
    const now = performance.now()
    start.current ??= now
    if (now - start.current < ms) invalidate()
    else {
      done.current = true
      if (alive.current) onDone()
    }
  })
  useEffect(() => invalidate(), [invalidate])
  return null
}

/* ---------- lighting (no network: Lightformers only) ---------- */

function Lights() {
  return (
    <>
      <hemisphereLight args={['#FFF8EC', '#C9A877', 0.9]} />
      <directionalLight position={[-2.5, 5, 4.5]} intensity={2.1} color="#FFE7C7" />
      <directionalLight position={[3.5, 2.2, 3]} intensity={0.55} color="#EAF1FF" />
      <Environment resolution={128} frames={1} environmentIntensity={0.7}>
        <Lightformer form="rect" intensity={2.2} color="#FFF3DE" position={[0, 4, 3]} rotation-x={-Math.PI / 3} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#FFE2C2" position={[-4, 1.5, 2]} rotation-y={Math.PI / 2.5} scale={[3, 5, 1]} />
        <Lightformer form="rect" intensity={0.8} color="#E8F0E6" position={[4, 1.5, 2]} rotation-y={-Math.PI / 2.5} scale={[3, 5, 1]} />
        <Lightformer form="ring" intensity={1.5} color="#FFFFFF" position={[1.5, 3, 5]} scale={1.5} />
      </Environment>
    </>
  )
}

/* ---------- scene ---------- */

export default function PantryScene({ objects, description, selected, onSelect, onOpenPantry, onContextLost }: PantrySceneProps) {
  const reduced = useReducedMotion()
  const visible = useDocumentVisible()
  const coarse = useMediaQuery('(pointer: coarse)')
  const fontsReady = useFontsReady()
  const [hovered, setHovered] = useState<string | null>(null)
  const [factor, setFactor] = useState(0.5)
  const [fallback, setFallback] = useState(false)
  const [warm, setWarm] = useState(true)
  const [width, setWidth] = useState(800)
  const wrap = useRef<HTMLDivElement>(null)

  const maxDpr = typeof window === 'undefined' ? 1 : Math.min(1.5, Math.max(1, window.devicePixelRatio || 1))
  const dpr = fallback ? 1 : Math.round((1 + (maxDpr - 1) * factor) * 100) / 100
  const glass = !fallback && factor >= 0.3 && width >= 640
  const sway = !reduced && visible
  const rev = fontsReady ? 1 : 0

  useLayoutEffect(() => {
    const el = wrap.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const el = wrap.current?.querySelector('canvas')
    if (el) el.style.cursor = hovered ? 'pointer' : coarse ? 'auto' : 'grab'
  }, [hovered, coarse])

  useEffect(() => {
    if (!selected) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onSelect(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected, onSelect])

  // ContactShadows bake once; re-bake when the arrangement changes.
  const layoutKey = objects.map((o) => `${o.uid}:${o.shelf}:${o.x.toFixed(2)}`).join('|')

  return (
    <div ref={wrap} className="absolute inset-0" style={{ touchAction: coarse ? 'pan-y' : undefined }}>
      <Canvas
        frameloop="demand"
        dpr={dpr}
        camera={{ position: [0, 1.95, 6.3], fov: 34, near: 0.1, far: 40 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.NeutralToneMapping, powerPreference: 'default' }}
        onPointerMissed={() => onSelect(null)}
        style={{ touchAction: coarse ? 'pan-y' : 'none' }}
      >
        <CanvasA11y description={description} onContextLost={onContextLost} />
        <CameraFit controls={!coarse} />
        {(warm || sway) && (
          <PerformanceMonitor
            flipflops={3}
            onChange={({ factor: f }) => setFactor(f)}
            onFallback={() => setFallback(true)}
          />
        )}
        {warm && <WarmUp ms={2500} onDone={() => setWarm(false)} />}
        <Lights />
        <Sway enabled={sway}>
          <ShelfUnit />
          {objects.map((o) => (
            <Item
              key={o.uid}
              obj={o}
              glass={glass}
              rev={rev}
              hovered={hovered === o.uid}
              selected={selected === o.uid}
              onHover={setHovered}
              onSelect={onSelect}
              onOpenPantry={onOpenPantry}
            />
          ))}
          <group key={layoutKey}>
            {SHELF.tops.map((t) => (
              <ContactShadows
                key={t}
                frames={1}
                position={[0, t + 0.002, 0]}
                scale={[SHELF.innerWidth, SHELF.depth]}
                resolution={512}
                far={0.55}
                blur={2.2}
                opacity={0.55}
                color="#5A3E22"
              />
            ))}
            <ContactShadows frames={1} position={[0, 0.002, 0.1]} scale={[5.2, 2.2]} resolution={512} far={1.4} blur={2.6} opacity={0.4} color="#6B5238" />
          </group>
        </Sway>
        {!coarse && (
          <OrbitControls
            target={TARGET}
            enableZoom={false}
            enablePan={false}
            rotateSpeed={0.45}
            minAzimuthAngle={-AZIMUTH}
            maxAzimuthAngle={AZIMUTH}
            minPolarAngle={THREE.MathUtils.degToRad(72)}
            maxPolarAngle={THREE.MathUtils.degToRad(96)}
            makeDefault
          />
        )}
      </Canvas>
    </div>
  )
}
