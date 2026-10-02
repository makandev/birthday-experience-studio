import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
import { readStoredProject } from '../browser-storage';
async function writing(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Mein Geschenk gestalten' }).click();
  await page
    .getByLabel('Wie heißt die Geburtstagsperson?')
    .fill('Photo recipient');
  await page
    .getByRole('button', { name: 'Weiter zu eurer Geschichte' })
    .click();
  await page
    .getByRole('button', { name: 'Ich möchte jetzt schreiben' })
    .click();
  await page
    .getByLabel('Dein persönlicher Brief')
    .fill('A personal birthday letter.');
  await page
    .getByText('Fotos & Erinnerungsmomente hinzufügen', { exact: true })
    .click();
}
async function jpeg(
  page: import('@playwright/test').Page,
  width = 24,
  height = 12,
): Promise<Buffer> {
  const base64 = await page.evaluate(
    ({ width, height }) => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#dd8844';
      ctx.fillRect(0, 0, width, height);
      return canvas.toDataURL('image/jpeg').split(',')[1];
    },
    { width, height },
  );
  return Buffer.from(base64, 'base64');
}
function withExif(original: Buffer): Buffer {
  const exif = Buffer.from(
    '45786966000049492a0008000000010012010300010000000600000000000000',
    'hex',
  );
  const app1 = Buffer.alloc(4);
  app1[0] = 255;
  app1[1] = 225;
  app1.writeUInt16BE(exif.length + 2, 2);
  const secret = Buffer.from('PRIVATE_EXIF_COMMENT_SENTINEL');
  const comment = Buffer.alloc(4);
  comment[0] = 255;
  comment[1] = 254;
  comment.writeUInt16BE(secret.length + 2, 2);
  return Buffer.concat([
    original.subarray(0, 2),
    app1,
    exif,
    comment,
    secret,
    original.subarray(2),
  ]);
}

test('photos normalize orientation, preserve original, remove metadata and transfer to a fresh browser', async ({
  page,
  context,
  browser,
}) => {
  await writing(page);
  const original = withExif(await jpeg(page));
  await page.getByLabel('Fotos auswählen oder hierher ziehen').setInputFiles({
    name: 'PRIVATE_ORIGINAL_NAME.jpg',
    mimeType: 'image/jpeg',
    buffer: original,
  });
  await expect(page.locator('.photo-editor')).toHaveCount(1);
  await expect(page.locator('[data-thumbnail]')).toBeVisible();
  const photo = (await readStoredProject(page)).media[0];
  if (photo.source.type !== 'local')
    throw new Error('Expected local photo source');
  expect(photo.width).toBe(12);
  expect(photo.height).toBe(24);
  const originalEvent = page.waitForEvent('download');
  await page
    .getByRole('button', { name: 'Original auf diesem Gerät sichern' })
    .click();
  const originalDownload = await originalEvent;
  expect(await readFile((await originalDownload.path())!)).toEqual(original);
  await page.getByLabel('Was zeigt dieses Foto?').fill('Our sunny breakfast.');
  await page
    .getByLabel('Deine Worte zu diesem Moment')
    .fill('A memory just for you.');
  await page.getByRole('button', { name: 'Mein Geschenk ansehen' }).click();
  const frame = page.frameLocator('#gift-preview');
  await expect(
    frame.getByRole('img', { name: 'Our sunny breakfast.' }),
  ).toBeVisible();
  const giftEvent = page.waitForEvent('download');
  await page
    .getByRole('button', { name: 'Geschenk erstellen', exact: false })
    .click();
  const gift = await giftEvent;
  const html = await readFile((await gift.path())!, 'utf8');
  expect(html).not.toContain('PRIVATE_ORIGINAL_NAME');
  expect(html).not.toContain('PRIVATE_EXIF_COMMENT_SENTINEL');
  expect(html).not.toContain(photo.source.assetId);
  const src = html.match(/src="(data:image\/jpeg;base64,[^"]+)"/)![1];
  expect(html.split(src)).toHaveLength(2);
  expect(
    Buffer.from(src.split(',')[1], 'base64').includes(
      Buffer.from('PRIVATE_EXIF_COMMENT_SENTINEL'),
    ),
  ).toBe(false);
  await page
    .getByRole('button', { name: 'Meine Geschenke & Sicherung' })
    .click();
  const draftEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Entwurf als Datei sichern' }).click();
  const draft = await draftEvent;
  const draftRaw = await readFile((await draft.path())!, 'utf8');
  expect(JSON.parse(draftRaw).assets).toHaveLength(1);
  const other = await browser.newContext();
  const otherPage = await other.newPage();
  await otherPage.goto('http://127.0.0.1:4173/');
  await otherPage
    .getByRole('button', { name: 'Meine Geschenke & Sicherung' })
    .click();
  await otherPage.getByLabel('Gesicherten BES-Entwurf öffnen').setInputFiles({
    name: 'portable.json',
    mimeType: 'application/json',
    buffer: Buffer.from(draftRaw),
  });
  await expect(otherPage.locator('#import-summary')).toContainText(
    'Geprüfter Entwurf',
  );
  await otherPage
    .getByRole('button', { name: 'Geprüften Entwurf öffnen' })
    .click();
  await expect(
    otherPage
      .frameLocator('#gift-preview')
      .getByRole('img', { name: 'Our sunny breakfast.' }),
  ).toBeVisible();
  await other.close();
  await page.goto('about:blank');
  await context.setOffline(true);
  await page.setContent(html);
  await expect(
    page.getByRole('img', { name: 'Our sunny breakfast.' }),
  ).toBeVisible();
  expect(
    await page
      .getByRole('img')
      .evaluate((image) => (image as HTMLImageElement).naturalWidth),
  ).toBe(12);
  const view = page.locator('.photo-view');
  const control = view.locator('summary');
  const image = page.getByRole('img', { name: 'Our sunny breakfast.' });
  await control.focus();
  await page.keyboard.press('Enter');
  await expect(view).toHaveAttribute('open', '');
  await expect(control).toContainText('Zum Bildausschnitt zurück');
  await expect(image).toHaveCSS('object-fit', 'contain');
  await expect(image).toHaveCSS('max-height', 'none');
  await expect(control).toBeFocused();
  await page.setViewportSize({ width: 390, height: 844 });
  const size = await image.boundingBox();
  expect(size!.height / size!.width).toBeCloseTo(2, 1);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(
    (
      await new AxeBuilder({ page })
        .setLegacyMode(true)
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.keyboard.press('Enter');
  await expect(view).not.toHaveAttribute('open');
  await expect(image).toHaveCSS('max-height', '650px');
});

test('large photos resize, risky formats and pixel bombs fail without losing authored text', async ({
  page,
}) => {
  await writing(page);
  const large = await jpeg(page, 2400, 1200);
  await page.getByLabel('Fotos auswählen oder hierher ziehen').setInputFiles({
    name: 'large.jpg',
    mimeType: 'image/jpeg',
    buffer: large,
  });
  await expect(page.locator('.photo-editor')).toHaveCount(1);
  const metadata = (await readStoredProject(page)).media[0];
  expect(metadata.width).toBeLessThanOrEqual(1600);
  expect(metadata.size).toBeLessThanOrEqual(512 * 1024);
  await page.getByLabel('Fotos auswählen oder hierher ziehen').setInputFiles({
    name: 'fake.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from('<svg onload="alert(1)">hostile instructions</svg>'),
  });
  await expect(page.locator('#notice')).toContainText('echtes JPEG');
  const bomb = Buffer.alloc(24);
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).copy(bomb);
  bomb.write('IHDR', 12);
  bomb.writeUInt32BE(100000, 16);
  bomb.writeUInt32BE(100000, 20);
  await page
    .getByLabel('Fotos auswählen oder hierher ziehen')
    .setInputFiles({ name: 'bomb.png', mimeType: 'image/png', buffer: bomb });
  await expect(page.locator('#notice')).toContainText('Bildpunkte');
  await expect(page.getByLabel('Dein persönlicher Brief')).toHaveValue(
    'A personal birthday letter.',
  );
});

test('external photos require explicit online consent and keep fallback text', async ({
  page,
}) => {
  const requests: string[] = [];
  await page.route('https://images.example.com/**', (route) => {
    requests.push(route.request().url());
    return route.abort();
  });
  await writing(page);
  await page
    .getByText('Optional: öffentliches Online-Foto', { exact: true })
    .click();
  await page
    .getByLabel('Öffentliche HTTPS-Fotoadresse')
    .fill('https://images.example.com/photo.jpg');
  await page
    .getByRole('button', { name: 'Externe Fotoquelle vormerken' })
    .click();
  expect(requests).toEqual([]);
  await page
    .getByLabel('Was zeigt dieses Foto?')
    .fill('The original moment stays meaningful.');
  await page.getByRole('button', { name: 'Mein Geschenk ansehen' }).click();
  await expect(page.locator('#preview-error')).toContainText(
    'Offline-Geschenke',
  );
  await expect(
    page.getByRole('button', { name: 'Geschenk erstellen', exact: false }),
  ).toBeDisabled();
  expect(requests).toEqual([]);
  await page
    .getByLabel('Wo soll das Geschenk funktionieren?')
    .selectOption('online');
  await expect(page.locator('#preview-error')).toContainText('bestätige');
  expect(requests).toEqual([]);
  await page
    .getByLabel('Ich möchte diese externen Fotos verwenden.', { exact: false })
    .check();
  const frame = page.frameLocator('#gift-preview');
  await page.locator('#gift-preview').scrollIntoViewIfNeeded();
  await expect(
    frame.getByText('The original moment stays meaningful.', { exact: true }),
  ).toBeVisible();
  await expect.poll(() => requests.length).toBeGreaterThan(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(frame.locator('.external-photo')).not.toBeVisible();
  await expect(frame.locator('.external-photo-view')).not.toBeVisible();
  await expect(frame.locator('.photo-description')).toContainText(
    'The original moment stays meaningful.',
  );
  const requestCount = requests.length;
  await page
    .getByLabel('Wo soll das Geschenk funktionieren?')
    .selectOption('offline');
  await expect(page.locator('#preview-error')).toContainText(
    'Offline-Geschenke',
  );
  expect(requests.length).toBe(requestCount);
});

test('IndexedDB failure keeps text creation usable', async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, 'indexedDB', {
      get() {
        throw new DOMException('Blocked', 'SecurityError');
      },
    }),
  );
  await writing(page);
  await page.getByLabel('Fotos auswählen oder hierher ziehen').setInputFiles({
    name: 'local.jpg',
    mimeType: 'image/jpeg',
    buffer: await jpeg(page),
  });
  await expect(page.locator('#notice')).toContainText(
    'gerade nicht gespeichert',
  );
  await expect(page.locator('.photo-editor')).toHaveCount(0);
  await page.getByRole('button', { name: 'Mein Geschenk ansehen' }).click();
  await expect(
    page
      .frameLocator('#gift-preview')
      .getByText('A personal birthday letter.', { exact: true }),
  ).toBeVisible();
});

test('drag/drop is usable, photo removal is reversible and the editor remains accessible', async ({
  page,
}) => {
  await writing(page);
  const bytes = await jpeg(page);
  await page.locator('#photo-drop').evaluate(
    (element, data) => {
      const transfer = new DataTransfer();
      transfer.items.add(
        new File([new Uint8Array(data)], 'dropped.jpg', { type: 'image/jpeg' }),
      );
      element.dispatchEvent(
        new DragEvent('drop', {
          dataTransfer: transfer,
          bubbles: true,
          cancelable: true,
        }),
      );
    },
    [...bytes],
  );
  await expect(page.locator('.photo-editor')).toHaveCount(1);
  await page.getByLabel('Was zeigt dieses Foto?').fill('A memory');
  const { default: AxeBuilder } = await import('@axe-core/playwright');
  const result = await new AxeBuilder({ page })
    .setLegacyMode(true)
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(result.violations).toEqual([]);
  await page
    .getByRole('button', { name: 'Aus diesem Geschenk entfernen' })
    .click();
  await expect(page.locator('.photo-editor')).toHaveCount(0);
  await page
    .getByRole('button', { name: 'Letzte Änderung rückgängig machen' })
    .click();
  await expect(page.locator('.photo-editor')).toHaveCount(1);
  await expect(page.getByLabel('Was zeigt dieses Foto?')).toHaveValue(
    'A memory',
  );
});
