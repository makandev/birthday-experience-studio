import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
test('reproducible standalone Studio creates an offline gift without fetching bundle assets', async ({
  page,
  context,
}) => {
  await page.goto('/');
  const html = await readFile('dist/BES-Test-0.2.html', 'utf8');
  const requests: string[] = [];
  const errors: string[] = [];
  page.on('request', (r) => {
    if (/^https?:/.test(r.url())) requests.push(r.url());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await context.setOffline(true);
  await page.setContent(html);
  await page.getByRole('button', { name: 'Mein Geschenk gestalten' }).click();
  await page
    .getByLabel('Wie heißt die Geburtstagsperson?')
    .fill('Standalone recipient');
  await page
    .getByRole('button', { name: 'Weiter zu eurer Geschichte' })
    .click();
  await page
    .getByRole('button', { name: 'Ich möchte jetzt schreiben' })
    .click();
  await page
    .getByLabel('Dein persönlicher Brief')
    .fill('Standalone birthday words');
  await page.getByRole('button', { name: 'Mein Geschenk ansehen' }).click();
  await expect(
    page
      .frameLocator('#gift-preview')
      .getByText('Standalone birthday words', { exact: true }),
  ).toBeVisible();
  const event = page.waitForEvent('download');
  await page
    .getByRole('button', { name: 'Geschenk erstellen', exact: false })
    .click();
  const file = await event;
  const gift = await readFile((await file.path())!, 'utf8');
  expect(gift).not.toMatch(/<(script|link|iframe)\b|https?:\/\//i);
  await page.goto('about:blank');
  await page.setContent(gift);
  await expect(
    page.getByText('Standalone birthday words', { exact: true }),
  ).toBeVisible();
  expect(requests).toEqual([]);
  expect(errors).toEqual([]);
});
