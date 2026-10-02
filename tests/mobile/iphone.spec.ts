import { verifiedLiveResponses } from '../live-origin';
import { test, expect, type Locator } from '@playwright/test';
import { readFile } from 'node:fs/promises';
test.beforeEach(async ({ page }) => verifiedLiveResponses(page));
async function comfortable(control: Locator) {
  await expect(control).toBeVisible();
  const box = await control.boundingBox();
  expect(box!.width).toBeGreaterThanOrEqual(44);
  expect(box!.height).toBeGreaterThanOrEqual(44);
  await control.tap();
}
test('touch creator: minimum-input opening, public refinement, optional photo and Safari recipient file round-trip', async ({
  page,
}) => {
  test.setTimeout(60000);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('./');
  await page.getByLabel('Wie heißt die Geburtstagsperson?').fill('Anna');
  await comfortable(
    page.getByRole('button', { name: 'Meinen ersten Moment ansehen' }),
  );
  const frame = page.frameLocator('#gift-preview');
  await expect(frame.locator('body')).toHaveAttribute('data-scene', 'opening');
  await comfortable(frame.locator('#stage-next'));
  await expect(frame.locator('body')).toHaveAttribute(
    'data-scene',
    'curiosity',
  );
  await comfortable(
    page.getByRole('button', { name: 'Gefällt mir', exact: true }),
  );
  await page.locator('#public-detail').fill('Eine Nachricht nur für dich.');
  await comfortable(page.getByRole('button', { name: 'Meine Worte ansehen' }));
  await expect(
    frame.getByText('Eine Nachricht nur für dich.', { exact: true }),
  ).toBeVisible();
  await comfortable(
    page.getByRole('button', { name: 'Gefällt mir', exact: true }),
  );
  await comfortable(page.getByRole('button', { name: 'Ohne Foto weiter' }));
  const delivery = page.locator('#iphone-delivery');
  if ((await delivery.getAttribute('open')) === null)
    await delivery.locator('summary').tap();
  const event = page.waitForEvent('download');
  const ios = test.info().project.name === 'mobile-webkit';
  if (ios) {
    await expect(delivery).toHaveAttribute('open', '');
    await expect(page.locator('#download')).toHaveText('Für Safari sichern ↓');
  }
  await comfortable(page.locator(ios ? '#download' : '#recipient-export'));
  const file = await event;
  expect(file.suggestedFilename()).toMatch(/\.bes-gift\.json$/);
  const raw = await readFile((await file.path())!, 'utf8');
  expect(raw).not.toContain('answers');
  expect(raw).not.toContain('createdAt');
  await page.goto('./#gift');
  await page.locator('#recipient-file').setInputFiles({
    name: 'Anna.bes-gift.json',
    mimeType: 'application/json',
    buffer: Buffer.from(raw),
  });
  const recipient = page.frameLocator('#recipient-preview');
  await expect(recipient.locator('body')).toHaveAttribute(
    'data-scene',
    'opening',
  );
  for (const scene of [
    'curiosity',
    'choice',
    'moments',
    'letter',
    'surprise',
    'finale',
  ]) {
    await comfortable(recipient.locator('#stage-next'));
    await expect(recipient.locator('body')).toHaveAttribute(
      'data-scene',
      scene,
    );
    if (scene === 'choice') {
      await comfortable(
        recipient.getByRole('button', { name: 'Ein Lächeln', exact: true }),
      );
      await expect(recipient.locator('#choice-response')).toContainText(
        'Lächeln',
      );
    }
    if (scene === 'surprise') {
      await comfortable(recipient.locator('.wish-envelope summary'));
      await expect(recipient.locator('.wish-envelope .revealed')).toBeVisible();
    }
    if (scene === 'letter') {
      await comfortable(recipient.locator('.letter-reveal summary'));
      await expect(
        recipient.getByText('Eine Nachricht nur für dich.', { exact: true }),
      ).toBeVisible();
    }
  }
  await comfortable(recipient.locator('#skip-finale'));
  await comfortable(recipient.locator('#replay'));
  await expect(recipient.locator('body')).toHaveAttribute(
    'data-scene',
    'opening',
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
test('recipient mode avoids all creator storage, refuses hostile files and reads gift locally after page loading', async ({
  page,
  context,
}) => {
  await page.addInitScript(() => {
    for (const key of ['localStorage', 'indexedDB'])
      Object.defineProperty(window, key, {
        get() {
          throw new Error('Creator storage must not be read');
        },
      });
  });
  await page.goto('./#gift');
  // Hash switching reloads out of the creator. The optional opener must load
  // before asserting that reading the selected gift itself makes no requests.
  await expect(page.locator('#recipient-file')).toBeVisible();
  await page.waitForLoadState('load');
  const requests: string[] = [];
  page.on('request', (r) => requests.push(r.url()));
  await context.setOffline(true);
  await page.locator('#recipient-file').setInputFiles({
    name: 'bad.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"kind":"creator-project","script":"alert(1)"}'),
  });
  await expect(page.locator('#recipient-error')).toContainText(
    'kein unterstütztes',
  );
  expect(requests).toEqual([]);
  await expect(page.locator('#recipient-preview')).not.toBeVisible();
});

test('exact portable HTML works offline with touch progression, late reveal, back, reduced finale and replay', async ({
  page,
  context,
}) => {
  test.setTimeout(60000);
  const { createProject } = await import('../../src/domain/project');
  const { createMagicStart } = await import('../../src/engines/magic-start');
  const { exportHtml } = await import('../../src/export/html');
  const p = createProject();
  p.recipient.name = 'Sam';
  const html = exportHtml(createMagicStart(p, 'Offline personal words.'));
  await context.setOffline(true);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const requests: string[] = [];
  page.on('request', (r) => requests.push(r.url()));
  await page.setContent(html);
  for (const scene of [
    'curiosity',
    'choice',
    'moments',
    'letter',
    'surprise',
    'finale',
  ]) {
    await comfortable(page.locator('#stage-next'));
    await expect(page.locator('body')).toHaveAttribute('data-scene', scene);
    if (scene === 'choice')
      await comfortable(
        page.getByRole('button', { name: 'Ein warmer Moment', exact: true }),
      );
    if (scene === 'letter') {
      await comfortable(page.locator('.letter-reveal summary'));
      await expect(
        page.getByText('Offline personal words.', { exact: true }),
      ).toBeVisible();
    }
  }
  await expect(page.locator('#stage-next')).toBeEnabled();
  await comfortable(page.locator('#stage-back'));
  await expect(page.locator('body')).toHaveAttribute('data-scene', 'surprise');
  await comfortable(page.locator('#stage-next'));
  await comfortable(page.locator('#stage-next'));
  await comfortable(page.locator('#replay'));
  await expect(page.locator('body')).toHaveAttribute('data-scene', 'opening');
  expect(requests).toEqual([]);
  await page.screenshot({
    path: `test-results/recipient-${test.info().project.name}.png`,
  });
});

test('prepared public file sharing stays inside the intentional user gesture and has a cancellation fallback', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'canShare', { value: () => true });
    Object.defineProperty(navigator, 'share', {
      value: (data: { files: File[] }) => {
        const state = window as typeof window & {
          shareCall?: {
            active: boolean | undefined;
            name: string;
            size: number;
          };
        };
        state.shareCall = {
          active: navigator.userActivation?.isActive,
          name: data.files[0].name,
          size: data.files[0].size,
        };
        return Promise.reject(new DOMException('Cancelled', 'AbortError'));
      },
    });
  });
  await page.goto('./');
  await page.locator('#magic-name').fill('Share recipient');
  await page
    .getByRole('button', { name: 'Meinen ersten Moment ansehen' })
    .tap();
  const delivery = page.locator('#iphone-delivery');
  if ((await delivery.getAttribute('open')) === null)
    await delivery.locator('summary').tap();
  await comfortable(page.locator('#recipient-share'));
  const call = await page.evaluate(
    () =>
      (
        window as typeof window & {
          shareCall?: {
            active: boolean | undefined;
            name: string;
            size: number;
          };
        }
      ).shareCall,
  );
  expect(call?.name).toMatch(/\.bes-gift\.json$/);
  expect(call?.size).toBeGreaterThan(0);
  if (call?.active !== undefined) expect(call.active).toBe(true);
  await expect(page.locator('#notice')).not.toContainText(
    'Teilen war nicht möglich',
  );
  await expect(page.locator('#recipient-export')).toBeEnabled();
});
