# Food box dinners implementation plan

Goal: implement the approved local intake-to-three-dinners design.
Architecture: reuse scan review and persisted pantry; deterministic audited dinners reserve shared stock and respect tools/time/budget; factual privacy page and draft terms use General Legal sources.
Stack: existing React/TypeScript/Vite with Vitest for domain/integration checks and browser flow verification.
Spec: ../specs/2026-10-25-food-box-dinners-design.md

## Constraints and review focus
Preserve existing user changes and storage keys. No recognition or external processing. Require all staples; never double allocate stock. Preserve unmodified weekly slots. Invalid persisted preferences get conservative defaults. Sample data remains labeled. No invented legal operator or compliance claims.

## Tasks
- [x] Core worker: write failing Vitest tests for strict matching, sequential stock, household scaling, equipment/time, aggregate budget, safe water, and preserved-plan allocation; implement matcher/planner and audited recipe subset; run focused tests.
- [x] Intake worker: write failing validation/provenance tests; extend Scan with source/sample choices and receipt review; block invalid retained rows; preserve demo provenance in store and merges; test reset/persistence.
- [x] Privacy worker: inspect General Legal CC0 templates; add factual privacy/storage screen and draft terms; wire route and shell/Settings navigation; preserve credit.
- [x] Root: install Vitest/coverage tool; add scripts; build three-dinner preference/preview/confirmation UI using core interfaces; add overview entry; integrate and test.
- [x] Verify lint/build/tests/coverage and browser desktop/mobile flows, refresh, reset, invalid receipt, no tools, and confirmation; independent code/security review; fix findings; update README/PRODUCT/AGENTS and record actual verification.

No commits, publishing, pushing, or deployment are part of this task. User approved implementation; execute in this session with bounded local workers.
