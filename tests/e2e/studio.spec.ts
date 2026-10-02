import { recipientStation } from '../recipient-navigation';
import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
import { STORAGE_KEY } from '../../src/persistence/storage';

test('vertical slice, restore, isolated preview and offline gift with no network requests', async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.locator('nav button[data-go="person"]').click();
  await page.getByLabel('Wie heißt die Geburtstagsperson?').fill('Anna');
  await page
    .getByRole('button', { name: 'Weiter zu eurer Geschichte' })
    .click();
  await page
    .getByLabel('Wie viel Raum möchtest du eurer Geschichte geben?')
    .selectOption('deep');
  await page
    .getByLabel('Was schätzt du besonders an dieser Person?')
    .fill('Du hörst immer zu.');
  await expect(page.locator('#save-status')).toHaveText(
    'Auf diesem Gerät gespeichert',
  );
  await page.reload();
  await expect(
    page.getByLabel('Was schätzt du besonders an dieser Person?'),
  ).toHaveValue('Du hörst immer zu.');
  await page.getByRole('button', { name: 'Nächste Frage' }).click();
  await page
    .getByLabel('Gibt es eine Erinnerung, die du erzählen möchtest?')
    .fill('PRIVATE_MEMORY_NOT_EXPORTED');
  await page.getByRole('button', { name: 'Nächste Frage' }).click();
  await page.getByLabel('Passt ein bisschen Humor').selectOption('yes');
  await page.getByRole('button', { name: 'Nächste Frage' }).click();
  await expect(
    page.getByLabel('Worüber könnt nur ihr beide lachen?'),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Frage überspringen' }).click();
  await page.getByRole('button', { name: 'Frage überspringen' }).click();
  await page.getByRole('button', { name: 'Frage überspringen' }).click();
  await page
    .getByLabel('Was soll auf keinen Fall')
    .fill('PRIVATE_BOUNDARY_NOT_EXPORTED');
  await page.getByRole('button', { name: 'Nächste Frage' }).click();
  await page.getByLabel('Wie soll sich das Geschenk').selectOption('warm');
  await page
    .getByRole('button', { name: 'Ich möchte jetzt schreiben' })
    .click();
  await page
    .getByLabel('Dein persönlicher Brief')
    .fill('Liebe Anna, danke für dein offenes Ohr.');
  await page
    .getByLabel('Dein Geburtstagswunsch')
    .fill('Viele kleine Abenteuer!');
  await page
    .getByLabel('Eine kleine Überraschung', { exact: false })
    .fill('Wir gehen zusammen frühstücken.');
  await page.getByRole('button', { name: 'Mein Geschenk ansehen' }).click();
  await page.locator('#manual-preview > summary').click();
  const frame = page.frameLocator('#gift-preview');
  await recipientStation(frame, 'letter');
  await expect(
    frame.getByText('Liebe Anna, danke für dein offenes Ohr.'),
  ).toBeVisible();
  await expect(
    frame.getByText('Wir gehen zusammen frühstücken.'),
  ).not.toBeVisible();
  await recipientStation(frame, 'surprise');
  await frame.getByText('Eine kleine Überraschung für dich').click();
  await expect(
    frame.getByText('Wir gehen zusammen frühstücken.'),
  ).toBeVisible();
  await page.getByText('Bewegung und Farben anpassen', { exact: true }).click();
  await page.getByLabel('Welche Farben passen?').selectOption('minimal');
  const downloadEvent = page.waitForEvent('download');
  await page
    .getByRole('button', { name: 'Geschenk als HTML sichern', exact: false })
    .click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe('Happy-Birthday-Anna.html');
  const path = await download.path();
  const html = await readFile(path!, 'utf8');
  expect(html).not.toContain('PRIVATE_MEMORY_NOT_EXPORTED');
  expect(html).not.toContain('PRIVATE_BOUNDARY_NOT_EXPORTED');
  expect(html).not.toContain('Birthday Experience Studio');
  const network: string[] = [];
  page.on('request', (request) => {
    if (/^https?:/.test(request.url())) network.push(request.url());
  });
  await page.goto('about:blank');
  await context.setOffline(true);
  await page.setContent(html);
  await recipientStation(page, 'letter');
  await expect(
    page.getByText('Liebe Anna, danke für dein offenes Ohr.'),
  ).toBeVisible();
  await recipientStation(page, 'surprise');
  await page.getByText('Eine kleine Überraschung für dich').click();
  await expect(page.getByText('Wir gehen zusammen frühstücken.')).toBeVisible();
  const giftAccessibility = await new AxeBuilder({ page })
    .setLegacyMode(true)
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(giftAccessibility.violations).toEqual([]);
  expect(network).toEqual([]);
  expect(errors).toEqual([]);
});

test('guided writing requires approval, reset can be cancelled and undone', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('nav button[data-go="person"]').click();
  await page.getByLabel('Wie heißt die Geburtstagsperson?').fill('Alex');
  await page
    .getByRole('button', { name: 'Weiter zu eurer Geschichte' })
    .click();
  await page.getByLabel('Was schätzt du besonders').fill('Du bist immer da.');
  await page
    .getByRole('button', { name: 'Ich möchte jetzt schreiben' })
    .click();
  await page
    .getByRole('button', { name: 'Antworten als Textvorschlag übernehmen' })
    .click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Abbrechen', exact: true }).click();
  await expect(page.getByLabel('Dein persönlicher Brief')).toHaveValue('');
  await page
    .getByRole('button', { name: 'Antworten als Textvorschlag übernehmen' })
    .click();
  await page
    .getByRole('button', { name: 'In meinen Brief übernehmen' })
    .click();
  await expect(page.getByLabel('Dein persönlicher Brief')).toHaveValue(
    /Du bist immer da/,
  );
  await page.getByRole('button', { name: 'Neu anfangen', exact: true }).click();
  await page.getByRole('button', { name: 'Entwurf behalten' }).click();
  await expect(page.getByLabel('Dein persönlicher Brief')).toHaveValue(
    /Du bist immer da/,
  );
  await page.getByRole('button', { name: 'Neu anfangen', exact: true }).click();
  await page.getByRole('button', { name: 'Neues Geschenk beginnen' }).click();
  await expect(page.locator('#magic-form')).toBeVisible();
  await page
    .getByRole('button', { name: 'Letzte Änderung rückgängig machen' })
    .click();
  await expect(page.getByLabel('Dein persönlicher Brief')).toHaveValue(
    /Du bist immer da/,
  );
});

test('unreadable drafts remain protected and hostile text is inert', async ({
  page,
}) => {
  await page.addInitScript((key) => {
    if (!localStorage.getItem(`${key}.backup`))
      localStorage.setItem(key, '{broken');
  }, STORAGE_KEY);
  await page.goto('/');
  await expect(
    page.getByRole('heading', {
      name: 'Dein vorhandener Entwurf bleibt geschützt.',
    }),
  ).toBeVisible();
  expect(
    await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY),
  ).toBe('{broken');
  await page.getByRole('button', { name: 'Neu anfangen', exact: true }).click();
  await page.getByRole('button', { name: 'Neues Geschenk beginnen' }).click();
  expect(
    await page.evaluate(
      (key) => localStorage.getItem(`${key}.backup`),
      STORAGE_KEY,
    ),
  ).toBe('{broken');
  await page.locator('nav button[data-go="person"]').click();
  await page
    .getByLabel('Wie heißt die Geburtstagsperson?')
    .fill('<img src=x onerror=alert(1)>');
  await page
    .getByRole('button', { name: 'Weiter zu eurer Geschichte' })
    .click();
  await page
    .getByRole('button', { name: 'Ich möchte jetzt schreiben' })
    .click();
  await page
    .getByLabel('Dein persönlicher Brief')
    .fill('<script>window.hacked=true</script>');
  await page.getByRole('button', { name: 'Mein Geschenk ansehen' }).click();
  await page.locator('#manual-preview > summary').click();
  const frame = page.frameLocator('#gift-preview');
  await recipientStation(frame, 'letter');
  await expect(frame.locator('script[data-bes-runtime="1"]')).toHaveCount(1);
  await expect(frame.locator('script:not([data-bes-runtime])')).toHaveCount(0);
  await expect(frame.locator('img')).toHaveCount(0);
  await expect(
    frame.getByText('<script>window.hacked=true</script>'),
  ).toBeVisible();
});

test('mobile layout and core accessibility checks', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const check = async () => {
    const results = await new AxeBuilder({ page })
      .setLegacyMode(true)
      .exclude('#gift-preview')
      .options({ iframes: false })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  };
  await check();
  await page.screenshot({
    path: 'test-results/studio-mobile.png',
    fullPage: true,
  });
  await page.locator('nav button[data-go="person"]').click();
  await check();
  await page.getByLabel('Wie heißt die Geburtstagsperson?').fill('Sam');
  await page
    .getByRole('button', { name: 'Weiter zu eurer Geschichte' })
    .click();
  await check();
  await page
    .getByRole('button', { name: 'Ich möchte jetzt schreiben' })
    .click();
  await check();
  await page.getByLabel('Dein persönlicher Brief').fill('Du bist wunderbar.');
  await page.getByRole('button', { name: 'Mein Geschenk ansehen' }).click();
  await page.locator('#manual-preview > summary').click();
  await check();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.locator('nav button[data-go="start"]').click();
  await page.screenshot({
    path: 'test-results/studio-desktop.png',
    fullPage: true,
  });
});

test('blocked storage gives a warning while editing remains usable', async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new DOMException('Blocked', 'SecurityError');
      },
    }),
  );
  await page.goto('/');
  await expect(
    page.getByRole('status').filter({ hasText: 'Dein Browser erlaubt' }),
  ).toBeVisible();
  await page.locator('nav button[data-go="person"]').click();
  await page.getByLabel('Wie heißt die Geburtstagsperson?').fill('Sam');
  await expect(page.locator('#save-status')).toHaveText(
    'Speichern nicht möglich – Seite bitte offen lassen',
  );
});
