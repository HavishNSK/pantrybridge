# Food box and receipt to three dinners

Status: approved and implemented on October 25, 2026. Local demo approach selected by the user.

## Intent

Extend PantryBridge so food received from a pantry or bought at a store becomes confirmed inventory and up to three practical dinners for a household. Preserve the existing pantry, recipes, weekly planner, nutrition, and Arkansas support flows.

Success means a user can review a sample box or receipt, correct quantities, select household cooking constraints, and see dinners supported by the available stock. Insufficient food produces fewer suggestions and clear shortfalls.

## Selected approach and alternatives

1. **Complete local demo (selected):** source-specific sample intake, editable review, deterministic planning, and browser-only persistence. This exercises the full flow without provider accounts, recognition accuracy claims, or photo transmission.
2. **Real recognition:** server-side photo/receipt processing, provider credentials, privacy disclosure, result validation, and cost controls. Deferred by the user's selection.
3. **Only another photo entry point:** small implementation but would leave assumed staples, equipment, and household portions unresolved. Rejected as insufficient for the proposed product promise.

## Goals

- Lead with food box to family dinners; receipt intake feeds the same inventory.
- Validate quantities before adding inventory and merge using the existing pantry rules.
- Account for all required ingredients, household portions, available tools, cooking time, and shared stock across three dinners.
- Give an explicit no-additional-purchases option and an optional total additional grocery budget.
- Explain what each meal uses, serves, requires, and would still need.
- Add accurate, accessible privacy/storage information informed by General Legal's templates.

## Non-goals

No real OCR or image recognition, remote processing, accounts, analytics, pantry partnerships, food-safety inference from photos, live prices, medical recommendations, or measured savings claims. Multilingual/audio instruction, QR box manifests, automatic rescheduling, detailed receipt-cost accounting, and completed-meal stock deductions are later work. Never imply those features exist.

## Intake flow

Extend the current scan flow with pantry photo, food-box photo, and grocery receipt choices. Each mode offers an explicit sample action without requiring a personal photo; optional photo selection retains existing size/type checks and object-URL cleanup. Labels remain clear throughout: sample results are independent of the selected image, which is never analyzed or uploaded.

Reuse editable ingredient, unit, quantity, date, add-row, and remove-row controls. Receipt rows show illustrative abbreviated source text alongside editable ingredient mappings. Sample nonfood entries are visibly excluded. Uncertain package amounts start blank and require correction; do not infer package size from purchase count. Saving is blocked until all retained food rows are valid, with actionable errors and focus on the first invalid field. Users can remove unwanted rows.

Nothing enters the pantry until explicit save. Sample-derived entries retain demo provenance after confirmation, including merges with existing entries; edited quantities do not imply photo recognition happened. Manual entries remain ordinary entries. Preserve the original review/reset paths and both browser-storage keys.

## Household and dinner flow

Add a three-dinner panel within the planner, linked from successful intake and the overview. Household size uses the existing 1–12 preference. New preferences include available recipe tools, maximum minutes, explicit access to safe cooking water, and either no additional purchases or a total additional budget. Defaults are conservative: no tools or safe-water access assumed, no shopping, 30 minutes.

Tool choices use the existing recipe equipment taxonomy with plain labels, explicitly explaining that pot/skillet cooking also needs a heat source. Persist preferences locally with validated defaults for existing saved state; reset and clear actions reset new preferences too.

Preview up to three distinct dinners scaled to household size. Evaluate candidate sequences against remaining stock, allocating required quantities once per meal and charging only the shared shortages against the total additional budget. Omit optional ingredients unless fully available; keep them distinct from required additions. Do not silently apply substitutions.

Display each dinner's name, portions, time, tools, required quantities, pantry contributions, and missing purchases with estimated cost. A short explanation states why it fits. Zero/fewer than three dinners includes an honest constraint/shortfall explanation and links to adjust pantry or food support. Do not promise an optimal or exhaustive plan.

Save the preview only after a separate confirmation. Map suggestions to Monday–Wednesday dinner slots. Preserve other slots and explicitly disclose any replaced dinners. Generate against inventory left after the preserved plan's allocations; include the preserved plan's shopping needs in the displayed total. If preserved meals already exceed the added budget, show that before offering new meals. Recompute and invalidate the preview when pantry, plan, servings, or preferences change. Planning reserves inventory; it does not claim the user has cooked or deduct physical stock.

## Matching and recipe integrity

Remove unlimited-staple assumptions consistently from recipe matching, weekly planning, analysis, remaining stock, shopping totals, substitutions, and displayed copy. All required ingredients need confirmed quantities. Optional items do not block readiness and cannot consume stock needed for required items. Quantities use the existing base-unit conversions and a documented small numerical tolerance, never dollar-price rounding as an availability test.

Safe cooking water is an explicitly confirmed household resource for the new flow. Model its required quantity in the audited recipes and account for it consistently without charging a fabricated grocery price. Existing general recipe browsing must also stop claiming unavailable staples are owned.

Bound three-dinner suggestions to a manually audited subset of the built-in dinner recipes. Audit ingredients against steps, raw versus cooked quantities, cooking-water requirements, tools/heat source, and total cooking time. Add suitable simple recipes only if needed for a coherent sample flow. Avoid relying on a generic spice entry to establish a specific seasoning is available. Show the scope as a small curated local recipe collection; do not call it professionally tested.

Use a purpose-made sample food box and recipe subset that can support three dinners under one clearly described equipment setup. Changing quantities or removing a tool must visibly change suggestions. Never modify the user's pantry automatically to make a demo succeed.

## Privacy and legal-template use

Use General Legal's CC0 privacy-policy and cookie-notice structures as source material, retaining credit and source links. Add an in-app privacy and storage information page accessible from Settings and the app shell, with factual sections for data entered, local retention, temporary photos, deletion, third-party links, and prototype limits.

Describe localStorage/sessionStorage accurately, including no cloud sync, shared-device exposure, and Settings clearing. State that the application currently adds no analytics or tracking cookies; do not make claims about a future hosting provider's logs. Receipt samples must not contain real names, loyalty IDs, payment details, or assistance status.

Keep draft Terms of Use in project documentation, clearly marked for owner review before publication. Do not invent an operator identity, contact address, governing state, binding arbitration, age restrictions, or compliance certification. Unknown owner-specific details remain a documented publication blocker rather than guessed legal text. A factual in-app information page must not present itself as a completed legal review.

Sources:
- https://github.com/General-Legal/legal-templates
- https://github.com/General-Legal/legal-templates/blob/main/templates/privacy-policy-us/template.md
- https://github.com/General-Legal/legal-templates/blob/main/templates/cookie-notice/template.md
- https://github.com/General-Legal/legal-templates/blob/main/templates/terms-of-use/template.md

## Architecture and implementation choices

Keep React/TypeScript/Vite and existing components/tokens. Put intake sample data and audited recipes in src/data, validation and deterministic planning in src/lib or focused feature helpers, and UI in feature components. Extend shared types and the Zustand store without changing existing storage keys. Preserve the current 3D fallback and unrelated flows.

Builder choices: exact audited recipes and sample amounts, component names, minor layout, deterministic scoring/tie breaks, and test tooling selection. Prefer a lightweight setup supporting unit/integration tests and browser verification; use existing installed tools where possible. All sample data must be synthetic.

## Verification and delivery

Use tests before behavior implementation. Cover missing staples, zero-price required ingredients, optional allocation, household scaling, shared stock across meals, equipment/time exclusion, preserved-plan reservations, aggregate budget, invalid persisted preferences, sample provenance, and invalid/nonfood receipt rows. Target at least 80% coverage for newly introduced domain logic and report actual measurements.

Verify the intake-to-preview-to-save flow in a browser, including incomplete review, empty pantry, insufficient inventory, no tools, changing preferences, confirmation before overwrite, refresh persistence, clear/reset, mobile layout, keyboard/focus, and privacy navigation. Run lint, type/build, and diff checks. Get independent code and security review, fix critical/high findings, and document checks actually run.

Update README.md, PRODUCT.md, and AGENTS.md to reflect implemented features, test commands, and remaining limits. Preserve unrelated existing edits. Do not commit, push, publish, or deploy without authorization.
