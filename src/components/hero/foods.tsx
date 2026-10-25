import { RoundedBox } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'
import type { ShelfObject } from './layout'
import { canLabel, grainTexture, hash, panelLabel, rng } from './textures'

export interface FoodProps {
  obj: ShelfObject
  /** use real glass transmission (off on small screens / low perf) */
  glass: boolean
  /** bumps when web fonts load so labels redraw */
  rev: number
}

/* ---------- shared geometry (module cache, built once) ---------- */

const geoCache = new Map<string, THREE.BufferGeometry>()
function geo<T extends THREE.BufferGeometry>(key: string, make: () => T): T {
  let g = geoCache.get(key)
  if (!g) {
    g = make()
    geoCache.set(key, g)
  }
  return g as T
}

const v2 = (x: number, y: number) => new THREE.Vector2(x, y)

function jarGeo(r: number, h: number) {
  return geo(`jar${r}${h}`, () =>
    new THREE.LatheGeometry(
      [v2(0, 0), v2(r * 0.9, 0), v2(r, 0.025), v2(r, h * 0.8), v2(r * 0.9, h * 0.88), v2(r * 0.8, h * 0.9), v2(r * 0.8, h * 0.94)],
      40,
    ),
  )
}

function bottleGeo() {
  return geo('bottle', () =>
    new THREE.LatheGeometry(
      [v2(0, 0), v2(0.085, 0), v2(0.092, 0.02), v2(0.092, 0.36), v2(0.075, 0.45), v2(0.036, 0.52), v2(0.034, 0.58), v2(0, 0.58)],
      36,
    ),
  )
}

function onionGeo(R: number) {
  return geo(`onion${R}`, () => {
    const pts: THREE.Vector2[] = []
    const h = R * 2.2
    for (let i = 0; i <= 20; i++) {
      const t = i / 20
      const r = R * Math.pow(Math.sin(Math.PI * Math.min(t * 1.05, 1)), 0.75) * (1 - 0.3 * t)
      pts.push(v2(Math.max(r, 0.0005), t * h))
    }
    pts.push(v2(0.006, h * 1.08))
    pts.push(v2(0, h * 1.1))
    return new THREE.LatheGeometry(pts, 28)
  })
}

function appleGeo(R: number) {
  return geo(`apple${R}`, () => {
    const pts: THREE.Vector2[] = [v2(0, R * 0.2)]
    for (let i = 0; i <= 20; i++) {
      const a = -Math.PI / 2 + (i / 20) * Math.PI
      const bulge = 1 + 0.08 * Math.sin(a)
      pts.push(v2(Math.max(R * Math.cos(a) * bulge, 0.0005), R * (1 + Math.sin(a)) * 0.95))
    }
    pts.push(v2(0, R * 1.7))
    return new THREE.LatheGeometry(pts, 32)
  })
}

/** Lumpy ellipsoid for potatoes, deterministic per seed. */
function potatoGeo(seed: number) {
  return geo(`potato${seed}`, () => {
    const g = new THREE.SphereGeometry(0.1, 28, 20)
    const rand = rng(seed)
    const bumps = Array.from({ length: 6 }, () => new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize())
    const pos = g.attributes.position as THREE.BufferAttribute
    const v = new THREE.Vector3()
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i)
      const n = v.clone().normalize()
      let d = 0
      for (const b of bumps) d += Math.max(0, n.dot(b)) ** 6 * 0.012
      v.addScaledVector(n, d)
      pos.setXYZ(i, v.x, v.y, v.z)
    }
    g.computeVertexNormals()
    return g
  })
}

/** Banana: a tube along a gentle arc, tapered at both ends. */
function bananaGeo() {
  return geo('banana', () => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.22, 0.13, 0),
      new THREE.Vector3(-0.12, 0.05, 0),
      new THREE.Vector3(0.04, 0.035, 0),
      new THREE.Vector3(0.16, 0.08, 0),
      new THREE.Vector3(0.23, 0.17, 0),
    ])
    const segs = 40
    const radial = 10
    const g = new THREE.TubeGeometry(curve, segs, 0.04, radial, false)
    const pos = g.attributes.position as THREE.BufferAttribute
    const c = new THREE.Vector3()
    const v = new THREE.Vector3()
    for (let i = 0; i <= segs; i++) {
      const u = i / segs
      curve.getPointAt(u, c)
      const taper = 0.25 + 0.75 * Math.pow(Math.sin(Math.PI * u), 0.55)
      for (let j = 0; j <= radial; j++) {
        const idx = i * (radial + 1) + j
        v.fromBufferAttribute(pos, idx).sub(c).multiplyScalar(taper).add(c)
        pos.setXYZ(idx, v.x, v.y, v.z)
      }
    }
    g.computeVertexNormals()
    return g
  })
}

function cartonRoofGeo(w: number, d: number, rise: number) {
  return geo(`roof${w}${d}${rise}`, () => {
    const s = new THREE.Shape()
    s.moveTo(-d / 2, 0)
    s.lineTo(d / 2, 0)
    s.lineTo(0, rise)
    s.closePath()
    const g = new THREE.ExtrudeGeometry(s, { depth: w, bevelEnabled: false })
    // extrude runs along +z: rotate so the ridge runs left-right (x) and center it
    g.rotateY(Math.PI / 2)
    g.translate(-w / 2, 0, 0)
    return g
  })
}

/* ---------- materials ---------- */

function Glass({ glass }: { glass: boolean }) {
  return glass ? (
    <meshPhysicalMaterial
      color="#ffffff"
      transmission={1}
      thickness={0.08}
      roughness={0.06}
      ior={1.45}
      attenuationColor="#eaf2ec"
      attenuationDistance={1.5}
      specularIntensity={1}
    />
  ) : (
    <meshPhysicalMaterial color="#f2f6f1" transparent opacity={0.26} roughness={0.05} clearcoat={1} depthWrite={false} />
  )
}

const Metal = () => <meshStandardMaterial color="#c9ccc8" metalness={0.85} roughness={0.32} />

/* ---------- foods ---------- */

function Jar({ obj, glass, rev, small }: FoodProps & { small?: boolean }) {
  const r = small ? 0.075 : 0.155
  const h = small ? 0.26 : 0.48
  const fill = obj.ingredientId === 'peanut-butter' ? 0.82 : 0.7
  const grain = useMemo(() => {
    const t = grainTexture(obj.style.food, hash(obj.ingredientId)).clone()
    t.repeat.set(3, 2)
    t.needsUpdate = true
    return t
  }, [obj.style.food, obj.ingredientId])
  const arc = (Math.PI * 2) / 3
  const labelH = small ? 0.09 : 0.14
  const label = useMemo(
    () => panelLabel(obj.label, obj.style, small ? 'spice' : 'jar', (r * 1.02 * arc) / labelH, rev),
    [obj.label, obj.style, small, r, arc, labelH, rev],
  )
  return (
    <group>
      <mesh position-y={(h * fill) / 2 + 0.01}>
        <cylinderGeometry args={[r * 0.9, r * 0.9, h * fill, 32]} />
        <meshStandardMaterial map={grain} roughness={0.9} />
      </mesh>
      <mesh geometry={jarGeo(r, h)} renderOrder={2}>
        <Glass glass={glass} />
      </mesh>
      <mesh position-y={h * 0.94 + 0.03}>
        <cylinderGeometry args={[r * 0.86, r * 0.86, small ? 0.05 : 0.07, 32]} />
        {small ? <meshStandardMaterial color="#173F35" roughness={0.5} /> : <meshStandardMaterial color={obj.style.accent} roughness={0.45} metalness={0.2} />}
      </mesh>
      <mesh position-y={h * 0.42}>
        <cylinderGeometry args={[r * 1.012, r * 1.012, labelH, 32, 1, true, -arc / 2, arc]} />
        <meshStandardMaterial map={label} roughness={0.85} side={THREE.FrontSide} />
      </mesh>
    </group>
  )
}

function Can({ obj, rev }: FoodProps) {
  const r = 0.145
  const h = 0.4
  const label = useMemo(() => canLabel(obj.label, obj.style, rev), [obj.label, obj.style, rev])
  return (
    <group>
      <mesh position-y={h / 2}>
        <cylinderGeometry args={[r, r, h - 0.02, 40, 1, false, Math.PI, Math.PI * 2]} />
        <meshStandardMaterial attach="material-0" map={label} roughness={0.55} metalness={0.05} />
        <meshStandardMaterial attach="material-1" color="#c9ccc8" metalness={0.85} roughness={0.32} />
        <meshStandardMaterial attach="material-2" color="#c9ccc8" metalness={0.85} roughness={0.32} />
      </mesh>
      {[0.012, h - 0.008].map((y) => (
        <mesh key={y} position-y={y} rotation-x={Math.PI / 2}>
          <torusGeometry args={[r * 0.985, 0.009, 8, 40]} />
          <Metal />
        </mesh>
      ))}
    </group>
  )
}

function PastaBox({ obj, rev }: FoodProps) {
  const [w, h, d] = [0.34, 0.58, 0.14]
  const front = useMemo(() => panelLabel(obj.label, obj.style, 'box', w / h, rev), [obj.label, obj.style, rev, w, h])
  return (
    <mesh position-y={h / 2} rotation-y={-0.06}>
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial attach="material-0" color={obj.style.pack} roughness={0.7} />
      <meshStandardMaterial attach="material-1" color={obj.style.pack} roughness={0.7} />
      <meshStandardMaterial attach="material-2" color={obj.style.pack} roughness={0.7} />
      <meshStandardMaterial attach="material-3" color={obj.style.pack} roughness={0.7} />
      <meshStandardMaterial attach="material-4" map={front} roughness={0.65} />
      <meshStandardMaterial attach="material-5" color={obj.style.pack} roughness={0.7} />
    </mesh>
  )
}

function Bag({ obj, rev }: FoodProps) {
  const [w, h, d] = [0.4, 0.5, 0.2]
  const glossy = ['spinach', 'mixed-veg', 'peas', 'berries', 'frozen-spinach', 'bread'].includes(obj.ingredientId)
  const front = useMemo(() => panelLabel(obj.label, obj.style, 'bag', (w - 0.06) / (h - 0.1), rev), [obj.label, obj.style, rev, w, h])
  return (
    <group rotation-y={0.05}>
      <RoundedBox args={[w, h, d]} radius={0.06} smoothness={4} position-y={h / 2} scale={[1, 1, 0.92]}>
        <meshStandardMaterial color={obj.style.pack} roughness={glossy ? 0.35 : 0.85} />
      </RoundedBox>
      <mesh position={[0, h + 0.012, 0]}>
        <boxGeometry args={[w * 0.9, 0.05, 0.035]} />
        <meshStandardMaterial color={obj.style.pack} roughness={0.8} />
      </mesh>
      <mesh position={[0, h / 2 - 0.01, (d * 0.92) / 2 + 0.002]}>
        <planeGeometry args={[w - 0.06, h - 0.1]} />
        <meshStandardMaterial map={front} roughness={glossy ? 0.4 : 0.85} />
      </mesh>
    </group>
  )
}

function Carton({ obj, rev }: FoodProps) {
  const [w, h, d] = [0.24, 0.46, 0.22]
  const rise = 0.11
  const front = useMemo(() => panelLabel(obj.label, obj.style, 'carton', w / h, rev), [obj.label, obj.style, rev, w, h])
  return (
    <group rotation-y={0.08}>
      <mesh position-y={h / 2}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial attach="material-0" color={obj.style.pack} roughness={0.6} />
        <meshStandardMaterial attach="material-1" color={obj.style.pack} roughness={0.6} />
        <meshStandardMaterial attach="material-2" color={obj.style.pack} roughness={0.6} />
        <meshStandardMaterial attach="material-3" color={obj.style.pack} roughness={0.6} />
        <meshStandardMaterial attach="material-4" map={front} roughness={0.55} />
        <meshStandardMaterial attach="material-5" color={obj.style.pack} roughness={0.6} />
      </mesh>
      <mesh geometry={cartonRoofGeo(w, d, rise)} position-y={h}>
        <meshStandardMaterial color={obj.style.pack} roughness={0.6} />
      </mesh>
      <mesh position-y={h + rise + 0.02}>
        <boxGeometry args={[w, 0.05, 0.012]} />
        <meshStandardMaterial color={obj.style.pack} roughness={0.6} />
      </mesh>
      <mesh position={[w * 0.22, h + rise * 0.55, d * 0.22]} rotation-x={-0.9}>
        <cylinderGeometry args={[0.025, 0.025, 0.02, 20]} />
        <meshStandardMaterial color={obj.style.accent} roughness={0.5} />
      </mesh>
    </group>
  )
}

function Bottle({ obj, glass, rev }: FoodProps) {
  const arc = (Math.PI * 2) / 3
  const label = useMemo(() => panelLabel(obj.label, obj.style, 'bottle', (0.095 * arc) / 0.15, rev), [obj.label, obj.style, rev, arc])
  return (
    <group>
      <mesh geometry={bottleGeo()}>
        {glass ? (
          <meshPhysicalMaterial color={obj.style.food} transmission={0.9} thickness={0.3} roughness={0.08} ior={1.4} attenuationColor={obj.style.food} attenuationDistance={0.25} />
        ) : (
          <meshPhysicalMaterial color={obj.style.food} transparent opacity={0.82} roughness={0.12} clearcoat={1} />
        )}
      </mesh>
      <mesh position-y={0.61}>
        <cylinderGeometry args={[0.042, 0.042, 0.065, 24]} />
        <meshStandardMaterial color="#173F35" roughness={0.45} />
      </mesh>
      <mesh position-y={0.2}>
        <cylinderGeometry args={[0.095, 0.095, 0.15, 32, 1, true, -arc / 2, arc]} />
        <meshStandardMaterial map={label} roughness={0.8} />
      </mesh>
    </group>
  )
}

function Tub({ obj, rev }: FoodProps) {
  const arc = (Math.PI * 2) / 3
  const label = useMemo(() => panelLabel(obj.label, obj.style, 'tub', (0.142 * arc) / 0.12, rev), [obj.label, obj.style, rev, arc])
  return (
    <group>
      <mesh position-y={0.11}>
        <cylinderGeometry args={[0.15, 0.125, 0.22, 36]} />
        <meshStandardMaterial color={obj.style.pack} roughness={0.5} />
      </mesh>
      <mesh position-y={0.11}>
        <cylinderGeometry args={[0.1435, 0.131, 0.12, 36, 1, true, -arc / 2, arc]} />
        <meshStandardMaterial map={label} roughness={0.6} />
      </mesh>
      <mesh position-y={0.232}>
        <cylinderGeometry args={[0.158, 0.158, 0.028, 36]} />
        <meshStandardMaterial color={obj.style.accent} roughness={0.45} />
      </mesh>
    </group>
  )
}

function Block({ obj, rev }: FoodProps) {
  const [w, h, d] = [0.32, 0.15, 0.2]
  const front = useMemo(() => panelLabel(obj.label, obj.style, 'block', (w - 0.04) / (h - 0.03), rev), [obj.label, obj.style, rev, w, h])
  return (
    <group rotation-y={-0.1}>
      <RoundedBox args={[w, h, d]} radius={0.018} smoothness={3} position-y={h / 2}>
        <meshStandardMaterial color={obj.style.food} roughness={0.55} />
      </RoundedBox>
      <mesh position={[0, h / 2, d / 2 + 0.002]}>
        <planeGeometry args={[w - 0.04, h - 0.03]} />
        <meshStandardMaterial map={front} roughness={0.5} />
      </mesh>
    </group>
  )
}

function Stack({ obj }: FoodProps) {
  const rand = rng(hash(obj.uid))
  const discs = Array.from({ length: 5 }, (_, i) => ({ y: 0.012 + i * 0.022, x: (rand() - 0.5) * 0.015, z: (rand() - 0.5) * 0.015 }))
  return (
    <group>
      {discs.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]}>
          <cylinderGeometry args={[0.19, 0.19, 0.02, 36]} />
          <meshStandardMaterial color={obj.style.food} roughness={0.9} />
        </mesh>
      ))}
      <mesh position-y={0.058}>
        <cylinderGeometry args={[0.196, 0.196, 0.04, 36, 1, true]} />
        <meshStandardMaterial color="#173F35" roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function Tray({ obj }: FoodProps) {
  return (
    <group>
      <RoundedBox args={[0.44, 0.06, 0.28]} radius={0.015} smoothness={2} position-y={0.03}>
        <meshStandardMaterial color="#F7F4EC" roughness={0.7} />
      </RoundedBox>
      {[-0.1, 0.1].map((x) => (
        <mesh key={x} position={[x, 0.075, 0]} scale={[1.3, 0.45, 0.9]}>
          <sphereGeometry args={[0.09, 24, 16]} />
          <meshStandardMaterial color={obj.style.food} roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

function Eggs() {
  const eggs: [number, number][] = []
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) eggs.push([-0.15 + i * 0.15, -0.065 + j * 0.13])
  return (
    <group>
      <mesh position-y={0.04}>
        <boxGeometry args={[0.48, 0.08, 0.28]} />
        <meshStandardMaterial color="#CBB998" roughness={0.95} />
      </mesh>
      {eggs.map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 0.11, z]} scale={[1, 1.28, 1]}>
          <sphereGeometry args={[0.055, 20, 14]} />
          <meshStandardMaterial color="#F3E7D2" roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

const CLUSTER: [number, number, number][] = [
  [-0.1, 0, -0.03],
  [0.1, 0, -0.05],
  [0, 0, 0.08],
]

function clusterFor(count: number) {
  if (count === 1) return [[0, 0, 0] as [number, number, number]]
  if (count === 2) return [CLUSTER[0], [0.1, 0, 0.04] as [number, number, number]]
  return CLUSTER
}

function Onion({ obj }: FoodProps) {
  const garlic = obj.ingredientId === 'garlic'
  const R = garlic ? 0.065 : 0.1
  return (
    <group>
      {clusterFor(obj.count).map((p, i) => (
        <mesh key={i} geometry={onionGeo(R)} position={[p[0] * (garlic ? 0.7 : 1), 0, p[2]]} rotation={[0.08 * (i - 1), i * 1.7, 0.1 * (i - 1)]}>
          <meshStandardMaterial color={obj.style.food} roughness={0.55} />
        </mesh>
      ))}
    </group>
  )
}

function Potato({ obj }: FoodProps) {
  const sweet = obj.ingredientId === 'sweet-potatoes'
  return (
    <group>
      {clusterFor(obj.count).map((p, i) => (
        <mesh
          key={i}
          geometry={potatoGeo(11 + i)}
          position={[p[0] * 1.15, 0.07, p[2]]}
          rotation={[0, 0.4 + i * 1.1, 0.06 * (i - 1)]}
          scale={sweet ? [1.65, 0.72, 0.78] : [1.3, 0.78, 0.95]}
        >
          <meshStandardMaterial color={obj.style.food} roughness={0.85} />
        </mesh>
      ))}
    </group>
  )
}

function Apple({ obj }: FoodProps) {
  const tomato = obj.ingredientId === 'tomatoes'
  const R = 0.095
  return (
    <group>
      {clusterFor(obj.count).map((p, i) => (
        <group key={i} position={[p[0], 0, p[2]]} rotation={[0, i * 2.1, 0.08 * (i - 1)]} scale={tomato ? [1.05, 0.85, 1.05] : 1}>
          <mesh geometry={appleGeo(R)}>
            <meshPhysicalMaterial color={obj.style.food} roughness={0.35} clearcoat={0.5} clearcoatRoughness={0.4} />
          </mesh>
          {tomato ? (
            <mesh position-y={R * 1.72} scale={[1, 0.25, 1]}>
              <coneGeometry args={[0.045, 0.06, 5]} />
              <meshStandardMaterial color={obj.style.accent} roughness={0.6} />
            </mesh>
          ) : (
            <mesh position={[0.005, R * 1.82, 0]} rotation-z={-0.25}>
              <cylinderGeometry args={[0.006, 0.008, 0.06, 6]} />
              <meshStandardMaterial color={obj.style.accent} roughness={0.8} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  )
}

function Round({ obj }: FoodProps) {
  const big = obj.ingredientId === 'cabbage'
  const n = big ? 1 : Math.min(obj.count, 2)
  const R = big ? 0.17 : 0.11
  return (
    <group>
      {Array.from({ length: n }, (_, i) => (
        <mesh key={i} position={[n === 1 ? 0 : (i - 0.5) * 0.2, R * 0.92, i * 0.04]} scale={[1, 0.92, 1]}>
          <sphereGeometry args={[R, 32, 24]} />
          <meshStandardMaterial color={obj.style.food} roughness={big ? 0.7 : 0.5} />
        </mesh>
      ))}
    </group>
  )
}

function Banana({ obj }: FoodProps) {
  const n = Math.min(obj.count, 3)
  return (
    <group position-y={0.0}>
      {Array.from({ length: n }, (_, i) => (
        <group key={i} position={[0, 0.005 + i * 0.03, (i - (n - 1) / 2) * 0.07]} rotation={[0.25 * (i - 1), 0.12 * (i - 1), 0]}>
          <mesh geometry={bananaGeo()}>
            <meshStandardMaterial color={obj.style.food} roughness={0.5} />
          </mesh>
          <mesh position={[0.235, 0.18, 0]} rotation-z={0.7}>
            <cylinderGeometry args={[0.008, 0.012, 0.04, 8]} />
            <meshStandardMaterial color={obj.style.accent} roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Carrot({ obj }: FoodProps) {
  const n = Math.min(obj.count, 3)
  return (
    <group>
      {Array.from({ length: n }, (_, i) => (
        <group key={i} position={[0, 0.04 + (i === 2 ? 0.06 : 0), (i === 2 ? 0 : i - 0.5) * 0.09]} rotation-y={(i - 1) * 0.12}>
          <mesh rotation-z={-Math.PI / 2}>
            <coneGeometry args={[0.04, 0.36, 18]} />
            <meshStandardMaterial color={obj.style.food} roughness={0.6} />
          </mesh>
          {[-0.35, 0, 0.35].map((a) => (
            <mesh key={a} position={[-0.21, 0.01, 0]} rotation-z={Math.PI / 2 + a}>
              <coneGeometry args={[0.012, 0.11, 6]} />
              <meshStandardMaterial color={obj.style.accent} roughness={0.7} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

export function Food(props: FoodProps) {
  switch (props.obj.kind) {
    case 'jar':
      return <Jar {...props} />
    case 'spice':
      return <Jar {...props} small />
    case 'can':
      return <Can {...props} />
    case 'box':
      return <PastaBox {...props} />
    case 'bag':
      return <Bag {...props} />
    case 'carton':
      return <Carton {...props} />
    case 'bottle':
      return <Bottle {...props} />
    case 'tub':
      return <Tub {...props} />
    case 'block':
      return <Block {...props} />
    case 'stack':
      return <Stack {...props} />
    case 'tray':
      return <Tray {...props} />
    case 'eggs':
      return <Eggs />
    case 'onion':
      return <Onion {...props} />
    case 'potato':
      return <Potato {...props} />
    case 'apple':
      return <Apple {...props} />
    case 'round':
      return <Round {...props} />
    case 'banana':
      return <Banana {...props} />
    case 'carrot':
      return <Carrot {...props} />
  }
}
