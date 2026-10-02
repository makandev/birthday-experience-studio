import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
import { readStoredProject } from '../browser-storage';
import { recipientStation } from '../recipient-navigation';

test('two actions to first opening; confirm, public detail, optional photo and full staged gift', async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  // Defaults need no extra interaction: fill name, press preview = two actions.
  await expect(page.locator('#magic-form textarea')).toHaveCount(0);
  await page.getByLabel('Wie heißt die Geburtstagsperson?').fill('Anna');
  await page
    .getByRole('button', { name: 'Meinen ersten Moment ansehen' })
    .click();
  const frame = page.frameLocator('#gift-preview');
  await expect(frame.locator('body')).toHaveAttribute('data-scene', 'opening');
  await expect(frame.getByRole('heading', { name: /Anna/ })).toBeVisible();
  await expect(frame.locator('.letter-reveal')).not.toBeVisible();
  await expect(page.locator('#download')).not.toBeVisible();
  const initial = await readStoredProject(page);
  expect(initial.answers).toEqual({});
  await page.getByRole('button', { name: 'Gefällt mir', exact: true }).click();
  await expect(page.locator('#public-detail')).toBeFocused();
  await page.locator('#public-detail').fill('Danke für dein offenes Ohr.');
  await page.getByRole('button', { name: 'Meine Worte ansehen' }).click();
  await expect(frame.locator('body')).toHaveAttribute('data-scene', 'letter');
  await expect(
    frame.getByText('Danke für dein offenes Ohr.', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Gefällt mir', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Ohne Foto weiter' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Ohne Foto weiter' }).click();
  await expect(frame.locator('body')).toHaveAttribute('data-scene', 'opening');
  await expect(page.locator('#download')).toBeVisible();
  expect((await readStoredProject(page)).answers).toEqual({});
  expect(
    (
      await new AxeBuilder({ page })
        .exclude('#gift-preview')
        .options({ iframes: false })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
  const event = page.waitForEvent('download');
  await page.locator('#download').click();
  const html = await readFile((await (await event).path())!, 'utf8');
  expect(html.match(/<script\b/g)).toHaveLength(1);
  expect(html).not.toMatch(/<(link|iframe)\b|https?:\/\//i);
  await page.reload();
  await expect(page.locator('#gift-preview')).toBeVisible();
  expect((await readStoredProject(page)).writing.letter).toContain(
    'Danke für dein offenes Ohr.',
  );
  await page.goto('about:blank');
  await context.setOffline(true);
  await page.setContent(html);
  await expect(page.locator('body')).toHaveAttribute('data-scene', 'opening');
  await expect(
    page.getByText('Danke für dein offenes Ohr.', { exact: true }),
  ).not.toBeVisible();
  await recipientStation(page, 'letter');
  await expect(
    page.getByText('Danke für dein offenes Ohr.', { exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test('mobile vibe alternatives preserve public text with undo; professional defaults and optional Deep', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByLabel('Wie heißt die Geburtstagsperson?').fill(' ');
  await page
    .getByRole('button', { name: 'Meinen ersten Moment ansehen' })
    .click();
  await expect(page.locator('#magic-error')).toContainText(
    'Bitte gib einen Namen',
  );
  await page.getByLabel('Wie heißt die Geburtstagsperson?').fill('Kim');
  await page.getByLabel('Was verbindet euch?').selectOption('colleague');
  await expect(page.locator('#magic-vibe-elegant')).toBeChecked();
  await page
    .getByRole('button', { name: 'Meinen ersten Moment ansehen' })
    .click();
  await page.getByRole('button', { name: 'Anders machen' }).click();
  await page.getByRole('button', { name: 'Fröhlich', exact: true }).click();
  expect((await readStoredProject(page)).experience.directionId).toBe('funny');
  await page
    .getByRole('button', { name: 'Letzte Änderung rückgängig machen' })
    .click();
  expect((await readStoredProject(page)).experience.directionId).toBe(
    'elegant',
  );
  await page.getByRole('button', { name: 'Überrasch mich' }).click();
  expect((await readStoredProject(page)).writing.letter).toContain('Hallo Kim');
  await page.getByRole('button', { name: 'Eine Erinnerung ergänzen' }).click();
  await page
    .getByRole('button', { name: 'Ein herzliches Danke', exact: true })
    .click();
  await page.getByRole('button', { name: 'Meine Worte ansehen' }).click();
  await page
    .getByRole('button', { name: 'Direkt das ganze Geschenk ansehen' })
    .click();
  await page
    .getByRole('button', { name: 'Mehr erzählen · freiwillig' })
    .click();
  await page
    .getByLabel('Wie viel Raum möchtest du eurer Geschichte geben?')
    .selectOption('deep');
  expect((await readStoredProject(page)).mode).toBe('deep');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
