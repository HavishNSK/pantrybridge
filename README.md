# PantryBridge

**Make more from what you have.**

PantryBridge helps Arkansas households turn food already on hand into meals, plan a week on a budget, and find food assistance without having to explain their circumstances.

> Status: working frontend prototype. Photo scanning uses labeled sample results; no vision service is connected.

## What you can do

- **Turn a food box into dinners:** confirm a synthetic box or receipt, select household size, tools, cooking time, and safe water, then preview up to three dinners sharing available stock. No-shopping mode checks every required ingredient, including staples.
- **Manage your pantry:** add and edit ingredients, quantities, units, and dates; review sample scan results before adding them.
- **Find meals:** match a built-in recipe collection against available ingredients. “Use only my ingredients” checks every required quantity, including staples. Optional additions do not block availability.
- **Plan the week:** scale servings, account for remaining pantry stock, generate a consolidated shopping list, and explore lower-cost swaps.
- **Review nutrition:** see estimated protein, fiber, and other nutrition values based on rounded USDA FoodData Central reference data.
- **Find Arkansas support:** browse regional food banks and SNAP, WIC, Summer EBT, and other support links. Resource records include sources and verification dates.
- **Try the demo:** explore a sample pantry and suggested week, restore demo data, or clear saved data from Settings.

Recipes are deterministic and locally bundled. Grocery prices and nutrition figures are estimates. PantryBridge does not determine benefit eligibility, check EBT balances, or collect EBT card numbers, PINs, or credentials. It is not affiliated with a government agency or food bank.

## Quick start

Use Node.js **22.12 or newer** and npm. The locked Vite version also supports Node 20.19+, but Node 22.12+ is the recommended baseline here.

```bash
git clone https://github.com/HavishNSK/pantrybridge.git
cd pantrybridge
npm ci
npm run dev
```

Open the URL printed by Vite, normally <http://localhost:5173>. No environment variables, API keys, database, or provider accounts are required.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check app, tooling, and E2E files, then create `dist/` |
| `npm run lint` | Run Oxlint |
| `npm run preview` | Preview a production build locally |

Tests use Vitest for domain/integration checks and Playwright for browser flows. Run `npm test`, `npm run test:coverage`, and `npm run test:e2e`. On first use, install Chromium with `npx playwright install chromium`. Coverage is scoped to the configured matching, dinner-planning, and intake-validation modules; it is not whole-app coverage.

## Demo walkthrough

1. In **Settings**, choose **Clear all my data** and confirm to begin with an empty pantry and week. This removes your current local data; use a separate browser profile if you want to preserve it.
2. Open **Add food**, select **Food box**, then load the sample. No photo is needed, and selected photos are never analyzed.
3. Review and save the six ingredients. Sample-derived entries keep their demo labels.
4. Open **Your next three dinners** in the planner. Choose household size (the sample covers up to four), **Pot + stovetop**, **30 minutes**, and confirm safe cooking water. Leave **No additional purchases** selected.
5. Preview three dinners, inspect ingredient quantities, choose **Save these dinners**, then confirm saving to Monday–Wednesday. Expand **Weekly calendar** to see them. Other slots are preserved and their stock and grocery needs are accounted for. If existing meals exhaust the pantry or budget, adjust them or explicitly clear the week first.
6. Remove a tool or reduce quantities to see fewer dinners rather than fabricated portions.
7. Try **Grocery receipt**: the sample pasta amount starts blank and must be corrected or removed. Household supplies are visibly excluded.
8. Open **Privacy & storage** from Settings or the footer to review local retention and deletion.

Append `?nowebgl` to a page URL, such as `http://localhost:5173/?nowebgl`, to inspect the static pantry hero fallback.

Browser tests start their own Vite server at `http://127.0.0.1:4173` with a strict port and server reuse disabled. An occupied port fails the run rather than testing an unrelated server. The normal development server remains on port 5173.

The main path is **Add food → Find dinners → Save**. Optional photo references, the weekly calendar, weekly budget, and remaining-stock details are tucked into expandable sections.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Overview and pantry hero |
| `/pantry` | Inventory management |
| `/scan` | Food-box, receipt, and pantry samples with optional photo reference and editable review |
| `/recipes` | Recipe matching and filtering |
| `/recipes/:id` | Recipe details |
| `/planner` | Weekly meals, budget, and shopping list |
| `/nutrition` | Estimated nutrition summaries |
| `/support` | Arkansas food-assistance directory |
| `/settings` | Household preferences, demo reset, data clearing, and sources |
| `/privacy` | Factual privacy, storage, photo handling, and deletion information |

## Architecture

The app runs in the browser: React 19, TypeScript, Vite 8, Tailwind CSS 4, React Router 7, and Zustand. The pantry hero uses Three.js through React Three Fiber and Drei. Icons come from Lucide; typography uses Archivo Variable.

```text
Pages and shared components
    ├── local ingredient, recipe, and assistance datasets
    ├── matching, planning, unit, and nutrition calculations
    └── Zustand store → browser storage
```

Most route screens and the 3D hero are lazy-loaded. The hero renders on demand and includes reduced-motion handling and a static WebGL fallback. There is no backend, database, authentication, or live AI integration.

```text
src/
├── components/   # Feature UI, shared controls, layout, and 3D hero
├── data/         # Ingredients, recipes, demo inventory, counties, support resources
├── lib/          # Pantry, recipe matching, planner, nutrition, units, scan interface
├── pages/        # Route-level screens
├── store/        # Persisted Zustand state
├── styles/       # Global styles and design tokens
├── types/        # Shared domain types
├── App.tsx       # Browser router and lazy route boundaries
└── main.tsx      # Application entry
public/          # Static assets
PRODUCT.md       # Product scope, audience, tone, and constraints
AGENTS.md        # Repository guidance for coding agents
```

## Storage and photo handling

Pantry inventory, meal plans, household size, budget, shopping lists, cooking preferences, and onboarding state persist under `pantrybridge:v1` in `localStorage`. The store attempts `sessionStorage` if access to `localStorage` throws. The selected support county is stored separately as `pantrybridge:support-county`.

Data is scoped to this browser and origin; it does not sync between devices. Clearing browser storage can remove it. Browser storage is not an access-control boundary on shared devices. Settings provides a clearing action that resets app data and removes the saved county.

Photo selection accepts JPEG, PNG, WebP, HEIC, and HEIF up to 10 MiB. Browser preview support varies, especially for HEIC/HEIF. Photos remain temporary in-memory selections and object URLs; the current demo provider neither uploads nor analyzes them. Preview URLs are revoked on replacement, removal, and unmount. Client file checks are not server-side content verification.

## Design and accessibility

The visual system is defined in `src/styles/index.css`: forest `#173F35`, leaf `#8DBF75`, cream `#F7F4EC`, paper `#FFFEFA`, terracotta `#D98566`, and charcoal `#252C28`, with Archivo Variable typography, Lucide icons, and a 10px box radius token.

Contributions should preserve the warm, practical voice and mobile-first layout. Verify keyboard access, visible focus, labels, contrast, reduced-motion behavior, and WebGL fallback when changing UI. These are product requirements, not a claim of completed accessibility certification.

## Extending the scanner

`src/lib/vision.ts` defines `ScanProvider` and currently exports `DemoScanProvider` as `scanProvider`. A real provider requires a server-side endpoint: keep credentials there, validate files and structured results, bound processing time and cost, and keep results editable before inventory changes. Update privacy copy and documentation when photos begin leaving the device.

## Deployment and limitations

Build with `npm run build` and serve `dist/` from a static host. Configure SPA rewrites to `index.html` so direct visits to routes such as `/planner` work. `npm run preview` is for local verification. No hosting platform or deployment pipeline is configured in this repository.

- Photo results are sample data, regardless of the selected image.
- Recipes and assistance listings are bundled datasets, with no live availability feed.
- Resource dates describe the recorded verification in the data; this documentation update does not reverify listings.
- Cost and nutrition estimates are not live prices or medical or dietary advice.
- There is no account recovery, cloud backup, or cross-device synchronization.
- Three-dinner suggestions use three curated pot recipes. No-cook/microwave-only options, real OCR, multilingual guidance, receipt-price accounting, QR box manifests, completed-meal stock deductions, and automatic rescheduling are not implemented.
- Saved plans reserve ingredients; they do not mark meals as cooked or deduct physical pantry inventory.
- Existing broader recipe metadata has not received the same audit as the three-dinner collection.

## Contributing and agent guidance

Read [AGENTS.md](AGENTS.md) and [PRODUCT.md](PRODUCT.md), inspect the affected code, keep changes focused, and run the relevant checks. Update documentation when setup, storage, features, or limitations change. Do not add claims of partnerships, users, impact, or production readiness without evidence.

The documentation structure is adapted from [your Template repository](https://github.com/rakshithj09/Template). Agent guidance draws on relevant resources from [your starred repositories](https://github.com/rakshithj09?tab=stars), especially [ECC](https://github.com/affaan-m/ECC) and [Superpowers](https://github.com/obra/superpowers). See AGENTS.md for task-specific selection rules.

## Privacy and legal source material

The in-app `/privacy` page describes the prototype's actual data handling. It is adapted from [General Legal's CC0 templates](https://github.com/General-Legal/legal-templates), with credit retained. [Source records](docs/legal/sources.md) identify the templates used. [Draft Terms of Use](docs/legal/terms-of-use-draft.md) remain unpublished pending operator details and owner/legal review; they are not a binding agreement presented to app users.

## License

No license file is currently provided. Do not assume permission to redistribute third-party material; check its license before adopting it.


## PR reviews

Every PR requires a Greptile review of its latest head. `.greptile/` supplies repository settings and product-specific review context; the PR template records the review and verification evidence. Specialist agent reviews supplement Greptile.

Install the CLI with `npm install -g greptile@latest`, sign in with `greptile login`, and complete repository access using [Greptile onboarding](https://www.greptile.com/docs/code-review/cli-onboarding). The GitHub App must have this repository enabled before automatic PR reviews can run. These local files do not themselves install the App or configure remote branch protection.

On a committed feature branch, run `npm run review:greptile -- --branch main` (substitute the actual PR base), then inspect the findings. `npm run review:status` reports completion for HEAD. The CLI excludes uncommitted and untracked changes. Do not present an empty main-to-main review as review of local work; record auth/access/billing/scope blockers honestly. See [CLI reference](https://www.greptile.com/docs/code-review/greptile-cli).
