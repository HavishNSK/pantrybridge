import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { NotFound } from './pages/NotFound'
import { Overview } from './pages/Overview'

const Pantry = lazy(() => import('./pages/Pantry'))
const Scan = lazy(() => import('./pages/Scan'))
const Recipes = lazy(() => import('./pages/Recipes'))
const RecipeDetail = lazy(() => import('./pages/RecipeDetail'))
const Planner = lazy(() => import('./pages/Planner'))
const Nutrition = lazy(() => import('./pages/Nutrition'))
const Support = lazy(() => import('./pages/Support'))
const Settings = lazy(() => import('./pages/Settings'))
const Privacy = lazy(() => import('./pages/Privacy'))

function PageFallback() {
  return (
    <div role="status" aria-label="Loading page" className="space-y-4">
      <div className="h-14 w-2/3 max-w-lg rounded-lg bg-rule/60 motion-safe:animate-pulse" />
      <div className="h-64 rounded-[10px] bg-rule/40 motion-safe:animate-pulse" />
    </div>
  )
}

const wrap = (el: React.ReactNode) => <Suspense fallback={<PageFallback />}>{el}</Suspense>

const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <Overview /> },
      { path: '/pantry', element: wrap(<Pantry />) },
      { path: '/scan', element: wrap(<Scan />) },
      { path: '/recipes', element: wrap(<Recipes />) },
      { path: '/recipes/:id', element: wrap(<RecipeDetail />) },
      { path: '/planner', element: wrap(<Planner />) },
      { path: '/nutrition', element: wrap(<Nutrition />) },
      { path: '/support', element: wrap(<Support />) },
      { path: '/settings', element: wrap(<Settings />) },
      { path: '/privacy', element: wrap(<Privacy />) },
      { path: '*', element: <NotFound /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
