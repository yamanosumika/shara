import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests-pwa',
  fullyParallel: false,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:43818',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium-pwa', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run build && npm run preview -- --port 43818',
    url: 'http://127.0.0.1:43818',
    reuseExistingServer: false,
    timeout: 120000,
  },
});
