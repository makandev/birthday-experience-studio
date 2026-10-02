import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
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
