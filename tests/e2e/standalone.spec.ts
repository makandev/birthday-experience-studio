import { recipientStation } from '../recipient-navigation';
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
  await page.locator('nav button[data-go="person"]').click();
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
  await page.locator('#manual-preview > summary').click();
  await recipientStation(page.frameLocator('#gift-preview'), 'letter');
  await expect(
    page
      .frameLocator('#gift-preview')
      .getByText('Standalone birthday words', { exact: true }),
  ).toBeVisible();
  const event = page.waitForEvent('download');
  await page
    .getByRole('button', { name: 'Geschenk als HTML sichern', exact: false })
    .click();
  const file = await event;
  const gift = await readFile((await file.path())!, 'utf8');
  expect(gift).not.toMatch(/<(link|iframe)\b|https?:\/\//i);
  expect(gift.match(/<script\b/g)).toHaveLength(1);
  await page.goto('about:blank');
  await page.setContent(gift);
  await recipientStation(page, 'letter');
  await expect(
    page.getByText('Standalone birthday words', { exact: true }),
  ).toBeVisible();
  expect(requests).toEqual([]);
  expect(errors).toEqual([]);
});
