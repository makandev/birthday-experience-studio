import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
import { readStoredProject } from '../browser-storage';

test('Magic Start saves its public seed, restores it and creates an editable offline gift', async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page
    .getByRole('button', { name: 'Schnell zur ersten Vorschau' })
    .click();
  await expect(page.locator('#magic-name')).toBeFocused();
  await page.getByLabel('Wie heißt die Geburtstagsperson?').fill('Anna');
  await page.getByLabel('Was verbindet euch?').selectOption('friend');
  await page
    .getByLabel('Was möchtest du ihr oder ihm sagen?')
    .fill('Danke, dass du immer ein offenes Ohr hast.');
  await expect(page.locator('#save-status')).toHaveText(
    'Auf diesem Gerät gespeichert',
  );
  await page.reload();
  await page
    .getByRole('button', { name: 'Schnell zur ersten Vorschau' })
    .click();
  await expect(page.locator('#magic-name')).toHaveValue('Anna');
  await expect(page.locator('#magic-message')).toHaveValue(
    'Danke, dass du immer ein offenes Ohr hast.',
  );
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page
    .getByRole('button', { name: 'Meine erste Vorschau erstellen' })
    .click();
  await expect(page.locator('h1')).toBeFocused();
  await expect(
    page
      .frameLocator('#gift-preview')
      .getByText('Danke, dass du immer ein offenes Ohr hast.', {
        exact: false,
      }),
  ).toBeVisible();
  const project = await readStoredProject(page);
  expect(project.answers).toEqual({});
  expect(
    project.experience.blocks.filter((b) => b.enabled).map((b) => b.type),
  ).toEqual(['intro', 'letter', 'wish', 'finale']);
  const event = page.waitForEvent('download');
  await page
    .getByRole('button', { name: 'Geschenk erstellen', exact: false })
    .click();
  const html = await readFile((await (await event).path())!, 'utf8');
  expect(html).not.toMatch(/<(script|link|iframe)\b|https?:\/\//i);
  await page
    .getByRole('button', { name: 'Text bearbeiten & Fotos ergänzen' })
    .click();
  await expect(page.getByLabel('Dein persönlicher Brief')).toContainText(
    'Danke, dass du immer ein offenes Ohr hast.',
  );
  await page.getByRole('button', { name: 'Mein Geschenk ansehen' }).click();
  await page
    .getByRole('button', { name: 'Mit Fragen persönlicher machen' })
    .click();
  await page.locator('#question-mode').focus();
  await page
    .getByLabel('Wie viel Raum möchtest du eurer Geschichte geben?')
    .selectOption('deep');
  await expect(page.locator('#question-mode')).toBeFocused();
  expect((await readStoredProject(page)).mode).toBe('deep');
  await page.goto('about:blank');
  await context.setOffline(true);
  await page.setContent(html);
  await expect(
    page.getByText('Danke, dass du immer ein offenes Ohr hast.', {
      exact: false,
    }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test('mobile Magic Start keeps validation, back/undo and professional tone understandable', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page
    .getByRole('button', { name: 'Schnell zur ersten Vorschau' })
    .click();
  await page.getByLabel('Wie heißt die Geburtstagsperson?').fill(' ');
  await page
    .getByLabel('Was möchtest du ihr oder ihm sagen?')
    .fill('Danke für die gute Zusammenarbeit.');
  await page
    .getByRole('button', { name: 'Meine erste Vorschau erstellen' })
    .click();
  await expect(page.locator('#magic-error')).toContainText(
    'Bitte gib einen Namen',
  );
  await page.getByLabel('Wie heißt die Geburtstagsperson?').fill('Kim');
  await page.getByLabel('Was verbindet euch?').selectOption('colleague');
  await page.getByRole('button', { name: 'Zurück zum Start' }).click();
  await expect(page.locator('#magic-start')).toBeFocused();
  await page
    .getByRole('button', { name: 'Schnell zur ersten Vorschau' })
    .click();
  await page
    .getByRole('button', { name: 'Meine erste Vorschau erstellen' })
    .click();
  await expect(
    page.getByLabel('Wie soll sich dein Geschenk anfühlen?'),
  ).toHaveValue('elegant');
  await page
    .getByRole('button', { name: 'Letzte Änderung rückgängig machen' })
    .click();
  await page
    .getByRole('button', { name: 'Schnell zur ersten Vorschau' })
    .click();
  await expect(page.locator('#magic-message')).toHaveValue(
    'Danke für die gute Zusammenarbeit.',
  );
  const dimensions = await page.locator('dialog[open]').evaluate((dialog) => ({
    width: dialog.getBoundingClientRect().width,
    viewport: innerWidth,
  }));
  expect(dimensions.width).toBeLessThanOrEqual(dimensions.viewport);
  await page.screenshot({
    path: 'test-results/magic-start-mobile.png',
    fullPage: true,
  });
});
