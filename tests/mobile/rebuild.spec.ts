import { connectSyntheticAi, acceptAiGift } from '../ai-fixture';
import { test, expect } from '@playwright/test';
import { createProject } from '../../src/domain/project';
import { createMagicStart } from '../../src/engines/magic-start';
import { exportHtml } from '../../src/export/html';
import { readStoredProject } from '../browser-storage';
import { verifiedLiveResponses } from '../live-origin';

for (const direction of ['emotional', 'funny', 'cinematic'] as const) {
  test(`touch ${direction} Challenger: exact offline HTML, photo exhibit, choice route, late words, climax and replay`, async ({
    page,
    context,
  }) => {
    const src = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#8bbfb3';
      ctx.fillRect(0, 0, 640, 480);
      ctx.fillStyle = '#f4d09a';
      ctx.fillRect(140, 80, 360, 280);
      return canvas.toDataURL('image/jpeg', 0.8);
    });
    const p = createProject();
    p.recipient.name = 'Alex';
    p.experience.directionId = direction;
    const gift = createMagicStart(
      p,
      'Fiktive öffentliche Worte: auf die kleinen Entdeckungen.',
    );
    gift.experience.composition = {
      version: 1,
      variant: 'challenger',
      arc: 'portrait',
    };
    gift.media.push({
      id: 'demo-photo',
      kind: 'image',
      name: 'DO_NOT_EXPORT.jpg',
      mimeType: 'image/jpeg',
      size: 1000,
      width: 640,
      height: 480,
      source: { type: 'local', assetId: 'demo-asset' },
    });
    for (let i = 0; i < 2; i++)
      gift.experience.blocks.push({
        id: `photo-${i}`,
        type: 'photo',
        version: 1,
        enabled: true,
        data: {
          mediaId: 'demo-photo',
          alt: 'Synthetische Farbflächen',
          caption: `Fiktives Bild ${i + 1}`,
          fit: 'contain',
          position: 'center',
        },
      });
    const html = exportHtml(gift, { 'demo-asset': src });
    expect(html).not.toContain('DO_NOT_EXPORT');
    await page.clock.install();
    await context.setOffline(true);
    const requests: string[] = [];
    const errors: string[] = [];
    page.on('request', (r) => requests.push(r.url()));
    page.on('pageerror', (e) => errors.push(e.message));
    await page.setContent(html);
    for (let i = 0; i < 12; i++) {
      const scene = await page.locator('body').getAttribute('data-scene');
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      if (scene === 'closing') break;
      if (scene === 'choice') {
        const choice = page.locator('[data-route="surprise"]');
        await choice.tap();
        await page.locator('#stage-next').tap();
        await expect(page.locator('body')).toHaveAttribute(
          'data-scene',
          'surprise',
        );
        continue;
      }
      if (scene === 'letter') {
        await page.locator('.letter-reveal summary').tap();
        await expect(
          page
            .getByText(
              'Fiktive öffentliche Worte: auf die kleinen Entdeckungen.',
              { exact: true },
            )
            .first(),
        ).toBeVisible();
      }
      if (scene === 'moments') {
        await expect(page.locator('[data-photo="0"]')).toBeVisible();
        await expect(page.locator('[data-photo="1"]')).not.toBeVisible();
        await page.locator('[data-photo-select="1"]').tap();
        await expect(page.locator('[data-photo="1"]')).toBeVisible();
        await expect(page.locator('[data-photo="0"]')).not.toBeVisible();
        await expect
          .poll(() =>
            page
              .locator('[data-photo="1"] img')
              .evaluate(
                (img: HTMLImageElement) =>
                  img.complete && img.naturalWidth === 640,
              ),
          )
          .toBe(true);
      }
      if (scene === 'encore')
        await page.locator('.encore-reveal summary').tap();
      if (scene === 'finale') {
        await page.clock.fastForward(
          Number(await page.locator('body').getAttribute('data-phase-ms')) * 3,
        );
        await expect(page.locator('.finale-message.active')).toHaveCount(1);
        if (direction !== 'emotional')
          await page.locator('#fireworks-again').tap();
      }
      const box = await page.locator('#stage-next').boundingBox();
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);
      await page.locator('#stage-next').tap();
    }
    await expect(page.locator('body')).toHaveAttribute('data-scene', 'closing');
    await page.locator('#replay').tap();
    await expect(page.locator('body')).toHaveAttribute('data-scene', 'opening');
    await expect(page.locator('.letter-reveal')).not.toHaveAttribute(
      'open',
      '',
    );
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (
      let i = 0;
      i < 12 &&
      (await page.locator('body').getAttribute('data-scene')) !== 'finale';
      i++
    )
      await page.locator('#stage-next').tap();
    await expect(page.locator('#stage-next')).toBeEnabled();
    await page.locator('#skip-finale').tap();
    await expect(page.locator('#replay')).toBeVisible();
    expect(requests).toEqual([]);
    expect(errors).toEqual([]);
  });
}
test('mobile creator compares a playable alternative and edits public copy at the preview', async ({
  page,
}) => {
  await verifiedLiveResponses(page);
  await page.goto('./');
  await connectSyntheticAi(page);
  await page.locator('#magic-name').fill('Alex');
  await page.locator('#magic-form button[type="submit"]').tap();
  await acceptAiGift(page);
  const frame = page.frameLocator('#gift-preview');
  await page.getByText('Zwei Geschenkwege vergleichen', { exact: true }).tap();
  await page.locator('[data-review-variant="challenger"]').tap();
  await expect(frame.locator('body')).toHaveAttribute(
    'data-variant',
    'challenger',
  );
  await expect(
    frame.locator('.gift-scene[data-scene="opening"] h1'),
  ).toBeVisible();
  await page.locator('#surprise-view').tap();
  expect((await readStoredProject(page)).experience.composition!.arc).toBe(
    'encore',
  );
  await page.locator('#edit-visible-copy').tap();
  await page
    .locator('#scene-edit-text')
    .fill('Fiktiver öffentlicher Geburtstagsgruß.');
  await page.locator('#scene-edit-form button[type="submit"]').tap();
  await expect(frame.locator('body')).toHaveAttribute('data-scene', 'letter');
  await expect(
    frame
      .getByText('Fiktiver öffentlicher Geburtstagsgruß.', { exact: true })
      .first(),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
