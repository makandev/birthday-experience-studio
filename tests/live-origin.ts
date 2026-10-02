import type { Page } from '@playwright/test';
// The cloud browser lacks its proxy CA; Node already trusts the platform CA.
// Preserve normal TLS verification, use only the fixed public Studio origin,
// and fulfill the actual verified GET responses in temporary test contexts.
export async function verifiedLiveResponses(page: Page): Promise<void> {
  if (process.env.BES_LIVE_SMOKE === '1' && process.env.HTTPS_PROXY)
    await page.route(
      'https://makandev.github.io/birthday-experience-studio/**',
      async (route) => {
        const response = await route.fetch();
        await route.fulfill({ response });
      },
    );
}
