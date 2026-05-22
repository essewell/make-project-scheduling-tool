import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]],
  webServer: {
    command: 'npm run preview -- --port 5174',
    url: 'http://localhost:5174',
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
  use: {
    headless: true,
    baseURL: 'http://localhost:5174',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
})
