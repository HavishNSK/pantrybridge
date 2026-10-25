import { Component, lazy, Suspense, useCallback, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { ButtonLink } from '../ui/Button'
import { describeShelf, layoutPantry } from './layout'
import { StaticPantryFallback } from './StaticPantryFallback'
import { useWebGL } from './useWebGL'

// three.js only loads through this chunk, and only when WebGL is usable.
const PantryScene = lazy(() => import('./PantryScene'))

class SceneBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

export default function PantryHero({ className }: { className?: string }) {
  const pantry = useStore((s) => s.pantry)
  const webgl = useWebGL()
  const navigate = useNavigate()
  const [lost, setLost] = useState(false)
  const [picked, setPicked] = useState<string | null>(null)

  const objects = useMemo(() => layoutPantry(pantry), [pantry])
  const description = useMemo(() => describeShelf(objects, pantry.length), [objects, pantry.length])
  const selected = picked && objects.some((o) => o.uid === picked) ? picked : null
  const current = objects.find((o) => o.uid === selected)

  const openPantry = useCallback(() => navigate('/pantry'), [navigate])
  const onContextLost = useCallback(() => setLost(true), [])

  const root = `${className || 'relative h-full w-full'} isolate overflow-hidden bg-cream`
  const fallback = <StaticPantryFallback className="absolute inset-0" />

  if (!webgl || lost) {
    return (
      <div className={root}>
        {fallback}
        {!objects.length && <EmptyPrompt />}
      </div>
    )
  }

  return (
    <div className={root}>
      <SceneBoundary fallback={fallback}>
        <Suspense fallback={fallback}>
          <PantryScene
            objects={objects}
            description={description}
            selected={selected}
            onSelect={setPicked}
            onOpenPantry={openPantry}
            onContextLost={onContextLost}
          />
        </Suspense>
      </SceneBoundary>

      {!objects.length && <EmptyPrompt />}

      {objects.length > 0 && (
        <div
          role="group"
          aria-label="Items on the 3D shelf"
          className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:inset-x-2 focus-within:bottom-2 focus-within:z-40 focus-within:flex focus-within:flex-wrap focus-within:gap-1 focus-within:rounded-[10px] focus-within:border focus-within:border-rule-strong focus-within:bg-paper focus-within:p-2"
        >
          {objects.map((o) => (
            <button
              key={o.uid}
              type="button"
              aria-pressed={selected === o.uid}
              onClick={() => setPicked(selected === o.uid ? null : o.uid)}
              className="min-h-10 rounded-lg px-2.5 text-[15px] text-forest hover:bg-forest/[0.07] aria-pressed:bg-leaf-wash aria-pressed:font-semibold"
            >
              {o.label} <span className="num text-ink-2">· {o.qtyText}</span>
            </button>
          ))}
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {current ? `${current.name}, ${current.qtyText} on hand. Label shown on the shelf.` : ''}
      </p>
    </div>
  )
}

function EmptyPrompt() {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center p-4">
      <div className="pointer-events-auto max-w-[19rem] rounded-[10px] border border-rule bg-paper/95 p-4 text-center">
        <p className="display text-[22px] text-forest">Your shelf is ready</p>
        <p className="mt-1.5 text-[15px] leading-relaxed text-ink-2">Add what you have on hand and it will show up here.</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <ButtonLink to="/scan" size="sm">Scan pantry</ButtonLink>
          <ButtonLink to="/pantry" size="sm" variant="secondary">Add items</ButtonLink>
        </div>
      </div>
    </div>
  )
}
