import { test, expect } from '@playwright/test';
import { connectSyntheticAi, syntheticAnimation } from '../ai-fixture';
import { readStoredProject } from '../browser-storage';
import { readFile } from 'node:fs/promises';
for (const concept of ['atelier', 'surprise-box', 'light-premiere'] as const) {
  test(`revision ${concept}: synthetic-provider AI review, consequent choice, offline gift, full preview and undo`, async ({
    page,
    browser,
  }) => {
    await page.goto('/');
    await connectSyntheticAi(page);
    await page.route('http://127.0.0.1:11434/api/chat', (route) =>
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          message: {
            content: JSON.stringify({
              version: 1,
              letter: 'Synthetische öffentliche Worte.',
              wish: 'Zeit für schöne kleine Dinge.',
              surprise: '',
              animation: syntheticAnimation,
              plan: {
                version: 1,
                concept,
                pace: 'gentle',
                sceneOrder:
                  concept === 'surprise-box'
                    ? [
                        'opening',
                        'choice',
                        'surprise',
                        'letter',
                        'finale',
                        'closing',
                      ]
                    : [
                        'opening',
                        'choice',
                        'letter',
                        'surprise',
                        'finale',
                        'closing',
                      ],
              },
            }),
          },
        }),
      }),
    );
    await page.locator('#magic-name').fill('Demo');
    await page.locator(`#magic-form input[value="${concept}"]`).check();
    await page.locator('#magic-form button[type=submit]').click();
    await expect(page.locator('#ai-review')).toBeVisible();
    const review = page.frameLocator('#ai-review-preview');
    await expect(review.locator('body')).toHaveAttribute(
      'data-concept',
      concept,
    );
    await review.locator('#stage-next').click();
    await review.locator('[data-route="letter"]').click();
    await expect(review.locator('body')).toHaveAttribute(
      'data-scene',
      'letter',
    );
    await expect(review.locator('.letter-reveal')).toHaveAttribute('open', '');
    await page.locator('#ai-accept').click();
    expect((await readStoredProject(page)).experience.plan?.concept).toBe(
      concept,
    );
    await expect(page.locator('#revision-refine')).not.toHaveAttribute(
      'open',
      '',
    );
    await page.locator('#open-theatre').click();
    await expect(page.locator('#gift-theatre')).toBeVisible();
    await expect(
      page.frameLocator('#theatre-preview').locator('body'),
    ).toHaveAttribute('data-scene', 'opening');
    await page.locator('#theatre-close').click();
    await expect(page.locator('#open-theatre')).toBeFocused();
    const dl = page.waitForEvent('download');
    await page.locator('#download').click();
    const html = await readFile((await (await dl).path())!, 'utf8');
    expect(html).not.toContain('synthetic-test-model');
    const offlineContext = await browser.newContext({
      offline: true,
      reducedMotion: 'reduce',
    });
    const recipient = await offlineContext.newPage();
    const requests: string[] = [];
    recipient.on('request', (r) => {
      if (/^https?:/.test(r.url())) requests.push(r.url());
    });
    await recipient.emulateMedia({ reducedMotion: 'reduce' });
    await recipient.setContent(html);
    await recipient.locator('#stage-next').click();
    await recipient.locator('[data-route="letter"]').click();
    await expect(recipient.locator('body')).toHaveAttribute(
      'data-scene',
      'letter',
    );
    await recipient.locator('#stage-next').click();
    await recipient.locator('#stage-next').click();
    await expect(recipient.locator('body')).toHaveAttribute(
      'data-scene',
      'finale',
    );
    await expect(
      recipient.locator('.gift-scene[data-scene="finale"] [data-final-words]'),
    ).toContainText('Synthetische öffentliche Worte');
    await recipient.locator('#stage-next').click();
    await recipient.locator('#replay').click();
    await expect(recipient.locator('body')).toHaveAttribute(
      'data-scene',
      'opening',
    );
    expect(requests).toEqual([]);
    await offlineContext.close();
    await page.locator('#undo-reset').click();
    expect((await readStoredProject(page)).experience.plan).toBeUndefined();
  });
}
test('three clearly fictional examples work without AI, storage changes or a login', async ({
  page,
}) => {
  await page.goto('/');
  const before = await readStoredProject(page);
  await page.locator('#try-examples').click();
  for (const concept of ['atelier', 'surprise-box', 'light-premiere']) {
    await page.locator(`[data-demo-concept="${concept}"]`).click();
    const preview = page.frameLocator('#theatre-preview');
    await expect(preview.locator('body')).toHaveAttribute(
      'data-concept',
      concept,
    );
    await preview.locator('#stage-next').click();
    await preview.locator('[data-route="letter"]').click();
    await expect(preview.locator('body')).toHaveAttribute(
      'data-scene',
      'letter',
    );
  }
  await page.locator('#theatre-close').click();
  expect(await readStoredProject(page)).toEqual(before);
});

test('reopened fictional theatre cannot be replaced by an older personal photo read', async ({
  page,
}) => {
  await page.goto('/');
  await connectSyntheticAi(page);
  await page.route('http://127.0.0.1:11434/api/chat', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        message: {
          content: JSON.stringify({
            version: 1,
            letter: 'PERSONAL_SYNTHETIC_SENTINEL',
            wish: 'Öffentlicher Wunsch',
            surprise: '',
            animation: syntheticAnimation,
            plan: {
              version: 1,
              concept: 'atelier',
              pace: 'gentle',
              sceneOrder: [
                'opening',
                'choice',
                'letter',
                'surprise',
                'finale',
                'closing',
              ],
            },
          }),
        },
      }),
    }),
  );
  await page.locator('#magic-name').fill('Demo');
  await page.locator('#magic-form button[type=submit]').click();
  await page.locator('#ai-accept').click();
  await readStoredProject(page);
  await expect(page.locator('#download')).toBeEnabled();
  await page.locator('#revision-refine > summary').click();
  await page.locator('#add-photo').click();
  await expect(page.locator('#media-workspace')).toHaveCount(1);
  const jpeg = await page.evaluate(() => {
    const c = document.createElement('canvas');
    c.width = 400;
    c.height = 300;
    const x = c.getContext('2d')!;
    x.fillStyle = '#9aab83';
    x.fillRect(0, 0, 400, 300);
    return Array.from(
      Uint8Array.from(atob(c.toDataURL('image/jpeg').split(',')[1]), (x) =>
        x.charCodeAt(0),
      ),
    );
  });
  await page.locator('#photo-files').setInputFiles({
    name: 'synthetic.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from(jpeg),
  });
  await expect(page.locator('#download')).toBeEnabled();
  await page.evaluate(() => {
    const original = FileReader.prototype.readAsDataURL;
    const pending: (() => void)[] = [];
    (window as typeof window & { flushReads?: () => void }).flushReads = () =>
      pending.splice(0).forEach((f) => f());
    FileReader.prototype.readAsDataURL = function (blob) {
      pending.push(() => original.call(this, blob));
    };
  });
  await page.locator('#open-theatre').click();
  await page.locator('#theatre-close').click();
  await page.locator('#try-examples').click();
  await page.evaluate(() =>
    (window as typeof window & { flushReads: () => void }).flushReads(),
  );
  await expect(page.locator('#theatre-title')).toContainText(
    'Fiktives Beispiel',
  );
  await expect(
    page.frameLocator('#theatre-preview').locator('body'),
  ).toHaveAttribute('data-concept', 'atelier');
  expect(
    await page.locator('#theatre-preview').getAttribute('srcdoc'),
  ).not.toContain('PERSONAL_SYNTHETIC_SENTINEL');
});
