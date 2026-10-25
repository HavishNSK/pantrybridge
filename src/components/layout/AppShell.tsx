import { ChefHat, Settings } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { isDemoPantry, useStore } from '../../store/useStore'
import { weekOf, shortDate } from '../../lib/format'
import { Toaster } from '../ui/Toast'
import { Wordmark } from './Logo'
import { NAV } from './nav'

/** Forest masthead band, the circular's dated header. */
function Masthead() {
  const pantry = useStore((s) => s.pantry)
  const demo = isDemoPantry(pantry)
  return (
    <header className="on-dark sticky top-0 z-40 bg-forest text-cream">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-4 px-4 sm:px-6">
        <NavLink to="/" aria-label="PantryBridge home" className="rounded-md">
          <Wordmark />
        </NavLink>
        <span className="hidden md:inline condensed text-sm font-semibold uppercase tracking-[0.08em] text-cream/70 border-l border-cream/20 pl-4">
          Week of {shortDate(weekOf())}
        </span>

        <nav aria-label="Primary" className="ml-6 hidden lg:flex items-center gap-1">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) =>
                `relative rounded-md px-3 py-2 text-[15px] font-semibold transition-colors ${isActive ? 'text-cream after:absolute after:inset-x-3 after:-bottom-[13px] after:h-[3px] after:rounded-full after:bg-leaf' : 'text-cream/70 hover:text-cream'}`
              }
            >
              {n.label}
            </NavLink>
          ))}
          <NavLink to="/recipes" className={({ isActive }) => `relative rounded-md px-3 py-2 text-[15px] font-semibold ${isActive ? 'text-cream after:absolute after:inset-x-3 after:-bottom-[13px] after:h-[3px] after:rounded-full after:bg-leaf' : 'text-cream/70 hover:text-cream'}`}>
            Recipes
          </NavLink>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <NavLink
            to="/pantry"
            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold hover:bg-white/15"
            aria-label={`Pantry status: ${pantry.length} items${demo ? ', demo data' : ''}`}
          >
            <span className={`size-2 rounded-full ${pantry.length ? 'bg-leaf' : 'bg-terracotta'}`} aria-hidden="true" />
            <span className="num">{pantry.length}</span> items
            {demo && <span className="rounded bg-cream/90 px-1 text-[10px] font-bold uppercase tracking-wide text-forest">Demo</span>}
          </NavLink>
          <NavLink to="/settings" aria-label="Profile and settings" title="Profile and settings" className="grid size-10 place-items-center rounded-lg text-cream/80 hover:bg-white/10 hover:text-cream">
            <Settings size={20} />
          </NavLink>
        </div>
      </div>
    </header>
  )
}

/** Bottom tab bar on phones and tablets. */
function MobileNav() {
  return (
    <nav aria-label="Primary" className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-rule bg-paper/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto grid max-w-xl grid-cols-6">
        {[...NAV.slice(0, 3), { to: '/recipes', label: 'Recipes', short: 'Recipes', icon: ChefHat }, ...NAV.slice(3)].map((n) => (
          <li key={n.to}>
            <NavLink
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) => `flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold ${isActive ? 'text-forest' : 'text-ink-2'}`}
            >
              {({ isActive }) => (
                <>
                  <span className={`grid h-7 w-12 place-items-center rounded-full transition-colors ${isActive ? 'bg-leaf-wash' : ''}`}>
                    <n.icon size={19} strokeWidth={isActive ? 2.4 : 2} />
                  </span>
                  {n.short}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function AppShell() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])
  return (
    <div className="min-h-dvh bg-cream">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-paper focus:px-4 focus:py-2 focus:text-forest">
        Skip to content
      </a>
      <Masthead />
      <main id="main" className="mx-auto max-w-[1440px] px-4 pb-28 pt-6 sm:px-6 lg:pb-16 lg:pt-8">
        <Outlet />
      </main>
      <footer className="mx-auto max-w-[1440px] px-4 pb-24 text-sm text-ink-2 sm:px-6 lg:pb-6">
        <NavLink to="/privacy" className="inline-flex min-h-11 items-center font-semibold text-forest underline">Privacy &amp; storage</NavLink>
      </footer>
      <MobileNav />
      <Toaster />
    </div>
  )
}
