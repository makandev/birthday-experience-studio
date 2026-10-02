import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import legacy from '../fixtures/project-v1.json' with { type: 'json' };
import { STORAGE_KEY } from '../../src/persistence/storage';

test('draft backup, reviewed legacy import and switching between retained gifts', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Mein Geschenk gestalten' }).click();
  await page
    .getByLabel('Wie heißt die Geburtstagsperson?')
    .fill('Current gift');
  await page
    .getByRole('button', { name: 'Meine Geschenke & Sicherung' })
    .click();
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Entwurf als Datei sichern' }).click();
  const downloaded = await downloadEvent;
  const raw = await readFile((await downloaded.path())!, 'utf8');
  expect(JSON.parse(raw).recipient.name).toBe('Current gift');
  await page.getByLabel('Gesicherten BES-Entwurf öffnen').setInputFiles({
    name: '../hostile-name.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(legacy)),
  });
  await expect(page.locator('#import-summary')).toContainText(
    'Geprüfter Entwurf für Anna',
  );
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!).recipient.name,
      STORAGE_KEY,
    ),
  ).toBe('Current gift');
  await page.getByRole('button', { name: 'Geprüften Entwurf öffnen' }).click();
  await expect(page.getByLabel('Dein persönlicher Brief')).toHaveValue(
    legacy.writing.letter,
  );
  await page
    .getByRole('button', { name: 'Meine Geschenke & Sicherung' })
    .click();
  await expect(page.getByText('Current gift', { exact: true })).toBeVisible();
  await page
    .getByRole('button', { name: 'Geschenk öffnen', exact: true })
    .click();
  await expect(page.getByLabel('Wie heißt die Geburtstagsperson?')).toHaveValue(
    'Current gift',
  );
  await page.reload();
  await expect(page.getByLabel('Wie heißt die Geburtstagsperson?')).toHaveValue(
    'Current gift',
  );
});

test('hostile imports are refused, no files are executed and active data stays unchanged', async ({
  page,
}) => {
  await page.goto('/');
  await page
    .getByRole('button', { name: 'Meine Geschenke & Sicherung' })
    .click();
  await page.getByLabel('Gesicherten BES-Entwurf öffnen').setInputFiles({
    name: 'gift.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"__proto__":{"evil":true}}'),
  });
  await expect(page.locator('#import-summary')).toContainText(
    'beschädigt oder nicht unterstützt',
  );
  await expect(
    page.getByRole('button', { name: 'Geprüften Entwurf öffnen' }),
  ).not.toBeVisible();
  await page.getByLabel('Gesicherten BES-Entwurf öffnen').setInputFiles({
    name: 'big.json',
    mimeType: 'application/json',
    buffer: Buffer.alloc(8 * 1024 * 1024 + 1, 'a'),
  });
  await expect(page.locator('#import-summary')).toContainText('zu groß');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
});
