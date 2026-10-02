import { defineConfig } from '@playwright/test';
const live = process.env.BES_LIVE_SMOKE === '1';
const proxyUrl =
  live && process.env.HTTPS_PROXY
    ? new URL(process.env.HTTPS_PROXY)
    : undefined;
const proxy = proxyUrl
  ? {
      server: `${proxyUrl.protocol}//${proxyUrl.host}`,
      username: decodeURIComponent(proxyUrl.username),
      password: decodeURIComponent(proxyUrl.password),
    }
  : undefined;
export default defineConfig({
  testDir: './tests/pages',
  use: {
    baseURL: live
      ? 'https://makandev.github.io/birthday-experience-studio/'
      : 'http://127.0.0.1:4174/birthday-experience-studio/',
    proxy,
    headless: true,
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    },
  },
  webServer: live
    ? undefined
    : {
        command:
          'npm run preview -- --base /birthday-experience-studio/ --port 4174 --strictPort',
        url: 'http://127.0.0.1:4174/birthday-experience-studio/',
        reuseExistingServer: false,
      },
});
