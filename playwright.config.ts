import { defineConfig } from '@playwright/test';
import path from 'node:path';
export default defineConfig({
  testDir: './tests/browser',
  timeout: 30000,
  use: { baseURL: 'http://127.0.0.1:3000', channel: process.env.PLAYWRIGHT_CHANNEL || undefined, headless: true },
  webServer: { command: 'node ../../node_modules/vite/bin/vite.js --port=3000 --host=127.0.0.1 --strictPort', cwd: path.resolve('apps/web'), url: 'http://127.0.0.1:3000', reuseExistingServer: !process.env.CI, timeout: 60000 },
});
