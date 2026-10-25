# PantryBridge

**Turn the food you already have into nutritious meals, stretch your grocery budget, and connect Arkansas families with food assistance.**

Scan your food → discover nutritious meals → stretch your budget → find support when you need it.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
npm run lint
```

Add `?nowebgl` to any URL to preview the static fallback used when WebGL isn't available.

## What's inside

| Area | Where | Notes |
| --- | --- | --- |
| 3D pantry hero | `src/components/hero/` | React Three Fiber + Drei, lazy-loaded, rendered on demand, reduced-motion aware. The shelf reflects your real pantry. |
| Pantry & scanner | `src/pages/Pantry.tsx`, `src/pages/Scan.tsx` | Photo upload works; **demo mode** returns editable sample results because no image model is connected. |
| Recipe matching | `src/lib/recipeMatching.ts`, `src/data/recipes.ts` | Deterministic matching against a local recipe set. "Use only my ingredients" is a hard quantity check. |
| Weekly planner | `src/lib/planner.ts`, `src/pages/Planner.tsx` | Draws each meal from what's left, builds a consolidated shopping list, and suggests lower-cost swaps. |
| Nutrition | `src/lib/nutrition.ts`, `src/data/ingredients.ts` | Estimates from rounded USDA FoodData Central reference values. Not medical advice. |
| Arkansas support | `src/data/arkansasResources.ts` | Regional food banks covering all 75 counties, plus SNAP, WIC, Summer EBT, 211, and the USDA hotline. Each entry shows its source and last-verified date. |

State lives in `localStorage` on the device only (`pantrybridge:v1`). There are no accounts, no servers, and no API keys.

## Honesty rules

- Demo data is labeled as demo data.
- Costs and nutrition are labeled as estimates.
- The app never asks for EBT card numbers, PINs, or credentials, and never claims to check balances or eligibility.
- Assistance listings link to each organization's own pantry finder rather than inventing addresses.

## Adding a real vision model

`src/lib/vision.ts` defines a `ScanProvider` interface. Implement it with a **server-side** endpoint so no key reaches the browser, then swap `scanProvider`.
