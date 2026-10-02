import { defineConfig, devices } from '@playwright/test';
import pagesConfig from './playwright.pages.config';
const live = process.env.BES_LIVE_SMOKE === '1';
const production = process.env.BES_MOBILE_PAGES === '1';
const localUrl = production
  ? 'http://127.0.0.1:4176/birthday-experience-studio/'
  : 'http://127.0.0.1:4175/';
export default defineConfig({
  testDir: './tests/mobile',
  use: {
    baseURL: live ? pagesConfig.use!.baseURL : localUrl,
    proxy: live ? pagesConfig.use!.proxy : undefined,
    headless: true,
  },
  projects: [
    {
      name: 'mobile-chromium',
      use: {
        ...devices['Pixel 7'],
        defaultBrowserType: 'chromium',
        browserName: 'chromium',
        launchOptions: {
          executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
        },
      },
    },
    {
      name: 'mobile-webkit',
      use: {
        ...devices['iPhone 13'],
        browserName: 'webkit',
        launchOptions: {
          executablePath: process.env.PLAYWRIGHT_WEBKIT_EXECUTABLE_PATH,
        },
      },
    },
  ],
  webServer: live
    ? undefined
    : {
        command: production
          ? 'npm run preview -- --base /birthday-experience-studio/ --port 4176 --strictPort'
          : 'npm run dev -- --port 4175 --strictPort',
        url: localUrl,
        reuseExistingServer: !production && !process.env.CI,
      },
});
