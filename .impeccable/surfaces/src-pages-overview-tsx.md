---
version: 1
slug: "src-pages-overview-tsx"
primary_target: "src/pages/Overview.tsx"
related_targets: ["src/App.tsx"]
---

Scope: the whole FullPlate app shell + Overview dashboard (route `/`), inherited by My Pantry, Scan, Recipes, Planner, Nutrition, Support. Mode: operate.

Audience/job: judges in a 5-second demo; Arkansas households doing scan → meals → week plan/budget → support. Constraints: PRODUCT.md (demo labels, estimates, no EBT data).

## Direction contract
THESIS: The week as a calm grocery weekly-circular: a ruled module grid where every box is a real job (pantry, budget, use-soon, tonight, the week). Refuses the default SaaS card dashboard of floating rounded tiles with icon+heading+text.
OWN-WORLD: Cream ground, paper modules joined by 1px forest-tinted hairline rules (shared edges, not floating cards), forest masthead band, terracotta price-tag chips for cost/expiry only, leaf for "have it" state. Archivo variable: semi-condensed heavy for headlines and big tabular numerals, normal width for body.
STORY: Visitor sees their pantry in 3D, understands meals come from it, sees cost and budget, plans the week, knows support is one tap away.
FIRST VIEWPORT: Forest masthead with wordmark, "Week of <date>", pantry status chip. Left: headline + copy + Scan/Plan CTAs over the 3D pantry feature module (largest box). Right column: budget capacity strip, Use-soon list, Tonight's meal. Bottom row: Mon–Sun strip.
FORM: Weekly grocery circular, candidate 6 of 7 grounded. Raises: tabular numerals roll in place on change (split-flap); budget as fixed-capacity strip that visibly fills (j-card); every ingredient glyph on one shared scale and ground (botanical folio). seed: 7d80f1da4ad5f9af
SIGNATURE: Cost and quantity numerals that roll in place, and the budget capacity strip filling as meals are planned.
