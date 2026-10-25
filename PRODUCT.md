# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack
React 19 + TypeScript + Vite 8 (existing scaffold), Tailwind CSS v4, Three.js via React Three Fiber v9 + Drei v10, React Router v7, Zustand (persisted to localStorage), Lucide icons. No backend; no AI/vision service is connected.

## Users
- **First audience:** competition judges (Congressional App Challenge–style) evaluating a short live demo. They must grasp the value within about five seconds.
- **Intended users:** Arkansas households stretching a grocery budget, including families who use or may qualify for SNAP/WIC. Their job is to turn food already on hand into nutritious meals, plan the week affordably, and find assistance without stigma.

## Product Purpose
Turn the food people already have into nutritious meals, stretch grocery budgets, and connect Arkansas families with food assistance. Success means a user moves through **scan pantry → discover meals → plan and budget the week → find support** in one cohesive flow.

## Positioning
Pantry-first rather than recipe-first. Every suggestion is constrained by the user's confirmed inventory and budget. The product pairs that with Arkansas-specific, source-dated food-assistance discovery, so the practical help and the support sit in the same product.

## Operating Context
Used at home, often on a phone, sometimes standing at a pantry shelf. A judge demo runs on a laptop. Users may be on limited data or older devices. Financial hardship disclosure is never required.

## Capabilities and Constraints
- Photo upload works. With no vision model connected, scan results are **demo mode** and must be labeled as such. Never claim a photo was analyzed.
- Recipes come from a local dataset with deterministic matching. They are not AI-generated.
- Nutrition values are estimates from USDA FoodData Central reference values. No medical claims or deficiency diagnosis.
- The app never collects EBT card numbers, PINs, or credentials, and never checks balances or determines eligibility.
- Assistance resources must come from official or trusted sources and show a last-verified date. No invented pantry addresses.
- All demo data is visibly labeled.

## Brand Commitments
- Name: **PantryBridge**. The mark is to be created (no existing assets).
- Voice: warm, dignified, practical, never shaming. It never implies that poor planning causes food insecurity, and it should never read like a charity form or a government portal.
- The user pinned this palette: forest #173F35, leaf #8DBF75, cream #F7F4EC, paper #FFFEFA, terracotta #D98566, charcoal #252C28.
- Headline copy: "Make more from what you have." / "Discover nourishing meals, stretch your grocery budget, and make every ingredient count."

## Evidence on Hand
No testimonials, users, metrics, or partnerships exist. None may be fabricated. Assistance data must be verified at build time and dated.

## Product Principles
1. Start from what the household already has.
2. Be honest about estimates, demo data, and limits.
3. Help without asking people to prove hardship.
4. Every control does something real.

## Accessibility & Inclusion
WCAG AA contrast, full keyboard operation, reduced-motion support, a WebGL fallback, mobile-first touch targets, and plain-language copy.
