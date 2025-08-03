// playwright.config.ts
import { defineConfig } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  // Directory where your Playwright tests live (adjust if needed)
  testDir: 'tests/uitests',

  // Global timeouts and retries
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,

  // Reporters
  reporter: [
    ['list'],
    ['html', {outputFolder: 'reports/playwright-html',  open: 'never' }]
  ],

  use: {
    // Base URL pulled from your .env
    baseURL: process.env.UI_BASE_URL || process.env.UI_BASE_URL,
    headless: process.env.HEADLESS !== 'true',

    // Capture traces/screenshots on failure
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
});
