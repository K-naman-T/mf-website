import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  timeout: 30_000,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000',
    headless: true,
  },
  webServer: {
    command: 'npm run dev -- -p 3000',
    port: 3000,
    timeout: 30_000,
    reuseExistingServer: true,
  },
  projects: [
    {
      name: 'desktop-chromium',
      use: { browserName: 'chromium' },
    },
  ],
});
