import { test, expect } from '@playwright/test';
import { readStoredProject } from '../browser-storage';
async function preview(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Mein Geschenk gestalten' }).click();
  await page.getByLabel('Wie heißt die Geburtstagsperson?').fill('Sam');
  await page
    .getByRole('button', { name: 'Weiter zu eurer Geschichte' })
    .click();
  await page
    .getByRole('button', { name: 'Ich möchte jetzt schreiben' })
    .click();
  await page.getByLabel('Dein persönlicher Brief').fill('You matter.');
  await page.getByRole('button', { name: 'Mein Geschenk ansehen' }).click();
}
test('coordinated directions, creator control, reduced motion and mobile effect budgets', async ({
  page,
}) => {
  await preview(page);
  await page
    .getByLabel('Wie soll sich dein Geschenk anfühlen?')
    .selectOption('funny');
  await expect(page.locator('#intensity')).not.toBeVisible();
  await page.getByText('Bewegung und Farben anpassen', { exact: true }).click();
  await page.locator('#intensity').focus();
  await page.keyboard.press('End');
  await expect(page.locator('#appearance-settings')).toHaveAttribute(
    'open',
    '',
  );
  await expect(page.locator('#intensity')).toBeFocused();
  const frame = page.frameLocator('#gift-preview');
  await expect(frame.locator('.sparkles i')).toHaveCount(12);
  await frame.getByLabel('Bewegung ausschalten').check();
  expect(
    await frame
      .locator('.motion-block')
      .first()
      .evaluate((element) => getComputedStyle(element).animationName),
  ).toBe('none');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByLabel('Welche Farben passen?').selectOption('minimal');
  expect(
    await frame
      .locator('.motion-block')
      .first()
      .evaluate((element) => getComputedStyle(element).animationName),
  ).toBe('none');
  await expect(frame.locator('.sparkles')).not.toBeVisible();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await frame
      .locator('.sparkles i')
      .evaluateAll(
        (elements) =>
          elements.filter((el) => getComputedStyle(el).display !== 'none')
            .length,
      ),
  ).toBeLessThanOrEqual(6);
  await page.reload();
  await expect(
    page.getByLabel('Wie soll sich dein Geschenk anfühlen?'),
  ).toHaveValue('funny');
});
test('director proposal is reviewed, hostile code fields rejected, valid changes undoable', async ({
  page,
}) => {
  await preview(page);
  await page
    .getByRole('button', { name: 'Optionale Hilfe & Regie-Ideen' })
    .click();
  await expect(
    page.getByRole('dialog', { name: 'Optionale Hilfe für dein Geschenk' }),
  ).toBeVisible();
  const ids = (await readStoredProject(page)).experience.blocks.map(
    (block) => block.id,
  );
  const proposal = {
    schemaVersion: 1,
    directionId: 'cinematic',
    themeId: 'warm',
    intensity: 2,
    tone: 'warm',
    blockOrder: ids.reverse(),
    followUpQuestions: ['<script>alert(1)</script> is inert data'],
  };
  await page
    .getByLabel('Regie-Vorschlag als JSON einfügen')
    .fill(JSON.stringify({ ...proposal, execute: 'fetch secrets' }));
  await page.getByRole('button', { name: 'Vorschlag prüfen' }).click();
  await expect(page.locator('#director-review')).toContainText('nicht gültig');
  await expect(page.locator('#apply-director')).not.toBeVisible();
  await page
    .getByLabel('Regie-Vorschlag als JSON einfügen')
    .fill(JSON.stringify(proposal));
  await page.getByRole('button', { name: 'Vorschlag prüfen' }).click();
  await expect(page.locator('#director-review')).toContainText(
    '<script>alert(1)</script>',
  );
  await expect(page.locator('#director-review script')).toHaveCount(0);
  await page
    .getByRole('button', { name: 'Geprüfte Stimmung & Reihenfolge übernehmen' })
    .click();
  await expect(
    page.getByLabel('Wie soll sich dein Geschenk anfühlen?'),
  ).toHaveValue('cinematic');
  await page
    .getByRole('button', { name: 'Letzte Änderung rückgängig machen' })
    .click();
  await expect(
    page.getByLabel('Wie soll sich dein Geschenk anfühlen?'),
  ).toHaveValue('emotional');
});

test('advanced preview controls remain open and keyboard accessible during editing', async ({
  page,
}) => {
  await preview(page);
  const summary = page.locator('#block-settings summary');
  await expect(page.locator('#block-settings input').first()).not.toBeVisible();
  await summary.focus();
  await page.keyboard.press('Enter');
  const letter = page
    .locator('#block-settings')
    .getByLabel('Dein persönlicher Brief', { exact: true });
  await letter.uncheck();
  await expect(page.locator('#block-settings')).toHaveAttribute('open', '');
  await expect(letter).not.toBeChecked();
  await expect(letter).toBeFocused();
  await letter.check();
  await expect(
    page.frameLocator('#gift-preview').getByText('You matter.'),
  ).toBeVisible();
  await page.getByText('Bewegung und Farben anpassen', { exact: true }).click();
  await page.getByLabel('Welche Farben passen?').focus();
  await page.getByLabel('Welche Farben passen?').selectOption('minimal');
  await expect(page.getByLabel('Welche Farben passen?')).toBeFocused();
  await expect(page.locator('#block-settings')).toHaveAttribute('open', '');
});
