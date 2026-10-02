import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { verifiedLiveResponses } from '../live-origin';
test.beforeEach(async ({ page }) => verifiedLiveResponses(page));

test('production Pages preview-first loads subpath assets and downloads an isolated staged gift', async ({
  page,
}) => {
  const errors: string[] = [];
  const failures: string[] = [];
  const assets: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('requestfailed', (r) => failures.push(r.url()));
  page.on('response', (r) => {
    if (r.status() >= 400) failures.push(r.url());
    if (/\/assets\//.test(r.url())) assets.push(r.url());
  });
  await page.goto('./');
  await page
    .getByLabel('Wie heißt die Geburtstagsperson?')
    .fill('Pages recipient');
  await page.getByLabel('Was verbindet euch?').selectOption('colleague');
  await page
    .getByRole('button', { name: 'Meinen ersten Moment ansehen' })
    .click();
  const frame = page.frameLocator('#gift-preview');
  await expect(frame.locator('body')).toHaveAttribute('data-scene', 'opening');
  await expect(frame.locator('body')).toHaveAttribute(
    'data-direction',
    'elegant',
  );
  await frame.locator('#stage-next').click();
  await expect(frame.locator('body')).toHaveAttribute(
    'data-scene',
    'curiosity',
  );
  await page
    .getByRole('button', { name: 'Direkt das ganze Geschenk ansehen' })
    .click();
  const event = page.waitForEvent('download');
  await page.locator('#download').click();
  const html = await readFile((await (await event).path())!, 'utf8');
  expect(html.match(/<script\b/g)).toHaveLength(1);
  expect(html).not.toMatch(/<(link|iframe)\b|https?:\/\//i);
  expect(assets.length).toBeGreaterThanOrEqual(2);
  expect(
    assets.every((url) => url.includes('/birthday-experience-studio/assets/')),
  ).toBe(true);
  expect(errors).toEqual([]);
  expect(failures).toEqual([]);
});
test('production Pages recipient opener reads only public gift data with no upload', async ({
  page,
}) => {
  await page.goto('./');
  await page.getByLabel('Wie heißt die Geburtstagsperson?').fill('Gift reader');
  await page
    .getByRole('button', { name: 'Meinen ersten Moment ansehen' })
    .click();
  await page.locator('#iphone-delivery summary').click();
  const event = page.waitForEvent('download');
  await page.locator('#recipient-export').click();
  const raw = await readFile((await (await event).path())!, 'utf8');
  await page.goto('./#gift');
  // Hash switching reloads out of the creator. The optional opener must load
  // before asserting that reading the selected gift itself makes no requests.
  await expect(page.locator('#recipient-file')).toBeVisible();
  await page.waitForLoadState('load');
  const requests: string[] = [];
  page.on('request', (r) => requests.push(r.url()));
  await page.locator('#recipient-file').setInputFiles({
    name: 'gift.bes-gift.json',
    mimeType: 'application/json',
    buffer: Buffer.from(raw),
  });
  const frame = page.frameLocator('#recipient-preview');
  await expect(frame.locator('body')).toHaveAttribute('data-scene', 'opening');
  await frame.locator('#stage-next').click();
  await expect(frame.locator('body')).toHaveAttribute(
    'data-scene',
    'curiosity',
  );
  expect(requests).toEqual([]);
});
