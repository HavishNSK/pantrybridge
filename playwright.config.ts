import { defineConfig } from '@playwright/test'

const testServerURL = 'http://127.0.0.1:4173'

export default defineConfig({
  testDir: './e2e',
  use: { baseURL: testServerURL, headless: true, channel: 'chromium' },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4173 --strictPort',
    url: testServerURL,
    reuseExistingServer: false,
  },
})
