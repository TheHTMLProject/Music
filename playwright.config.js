import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './test/browser',
  timeout: 120000,
  expect: { timeout: 30000 },
  use: {
    baseURL: 'http://127.0.0.1:3340',
    headless: true,
    trace: 'retain-on-failure'
  },
  webServer: {
    command: 'node server.js',
    env: { PORT: '3340', GEMINI_API_KEY: '', GOOGLE_TRANSLATE_API_KEY: '' },
    url: 'http://127.0.0.1:3340/music/ai/status',
    timeout: 60000,
    reuseExistingServer: false
  },
  projects: [
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'chromium', use: { browserName: 'chromium' } }
  ]
});
