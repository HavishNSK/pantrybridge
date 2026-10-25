import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/dinnerPlanning.ts', 'src/lib/recipeMatching.ts', 'src/components/pantry/scanDraft.ts', 'src/data/intakeSamples.ts'],
      thresholds: { statements: 80, branches: 80, functions: 80, lines: 80 },
      reporter: ['text', 'json-summary'],
    },
  },
})
