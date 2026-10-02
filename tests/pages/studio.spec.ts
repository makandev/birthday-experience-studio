import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
// This cloud's Chromium lacks its proxy CA; Node already trusts the supplied CA.
// Intercept only our fixed live origin, retain TLS verification in route.fetch,
// and serve the actual verified responses into the temporary browser context.
test.beforeEach(async ({ page }) => {
  if (process.env.BES_LIVE_SMOKE === '1' && process.env.HTTPS_PROXY) {
    await page.route(
      'https://makandev.github.io/birthday-experience-studio/**',
      async (route) => {
        const response = await route.fetch();
        await route.fulfill({ response });
      },
    );
  }
});

test('production Pages subpath loads assets and creates an isolated offline gift', async ({
  page,
}) => {
  const errors: string[] = [];
  const failed: string[] = [];
  const assets: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('requestfailed', (request) => failed.push(request.url()));
  page.on('response', (response) => {
    if (response.status() >= 400) failed.push(response.url());
    if (/\/assets\//.test(response.url())) assets.push(response.url());
  });
  await page.goto('./');
  await page.getByRole('button', { name: 'Mein Geschenk gestalten' }).click();
  await page
    .getByLabel('Wie heißt die Geburtstagsperson?')
    .fill('Pages smoke recipient');
  await page
    .getByRole('button', { name: 'Weiter zu eurer Geschichte' })
    .click();
  await page
    .getByRole('button', { name: 'Ich möchte jetzt schreiben' })
    .click();
  await page
    .getByLabel('Dein persönlicher Brief')
    .fill('A personal Pages birthday gift');
  await page.getByRole('button', { name: 'Mein Geschenk ansehen' }).click();
  await expect(
    page
      .frameLocator('#gift-preview')
      .getByText('A personal Pages birthday gift', { exact: true }),
  ).toBeVisible();
  const event = page.waitForEvent('download');
  await page
    .getByRole('button', { name: 'Geschenk erstellen', exact: false })
    .click();
  const file = await event;
  const gift = await readFile((await file.path())!, 'utf8');
  expect(gift).not.toMatch(/<(script|link|iframe)\b|https?:\/\//i);
  expect(assets.length).toBeGreaterThanOrEqual(2);
  expect(
    assets.every((url) => url.includes('/birthday-experience-studio/assets/')),
  ).toBe(true);
  expect(errors).toEqual([]);
  expect(failed).toEqual([]);
});

test('production Pages Magic Start reaches a real recipient preview', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('./');
  await page
    .getByRole('button', { name: 'Schnell zur ersten Vorschau' })
    .click();
  await page
    .getByLabel('Wie heißt die Geburtstagsperson?')
    .fill('Pages Magic recipient');
  await page.getByLabel('Was verbindet euch?').selectOption('colleague');
  await page
    .getByLabel('Was möchtest du ihr oder ihm sagen?')
    .fill('Danke für die schöne Zusammenarbeit.');
  await page
    .getByRole('button', { name: 'Meine erste Vorschau erstellen' })
    .click();
  await expect(
    page.getByLabel('Wie soll sich dein Geschenk anfühlen?'),
  ).toHaveValue('elegant');
  await expect(
    page
      .frameLocator('#gift-preview')
      .getByText('Danke für die schöne Zusammenarbeit.', { exact: false }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
