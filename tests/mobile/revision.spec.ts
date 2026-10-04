import { test, expect } from '@playwright/test';
import { createProject } from '../../src/domain/project';
import { createMagicStart } from '../../src/engines/magic-start';
import { exportHtml } from '../../src/export/html';
import { verifiedLiveResponses } from '../live-origin';
import { readStoredProject } from '../browser-storage';
import { syntheticAnimation } from '../ai-fixture';
for (const concept of ['atelier', 'surprise-box', 'light-premiere'] as const) {
  test(`touch revision ${concept}: chosen photo/words persist in final image, quiet scenes and offline replay`, async ({
    page,
    context,
  }) => {
    const src = await page.evaluate(() => {
      const c = document.createElement('canvas');
      c.width = 640;
      c.height = 480;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#9db7a2';
      ctx.fillRect(0, 0, 640, 480);
      ctx.fillStyle = '#dfad7d';
      ctx.fillRect(120, 80, 400, 300);
      return c.toDataURL('image/jpeg', 0.8);
    });
    const p = createProject();
    p.recipient.name = 'Demo';
    const gift = createMagicStart(
      p,
      'Synthetische öffentliche Worte zum Geburtstag.',
    );
    gift.media.push({
      id: 'demo-photo',
      kind: 'image',
      name: 'PRIVATE_ORIGINAL.jpg',
      mimeType: 'image/jpeg',
      size: 1000,
      source: { type: 'local', assetId: 'synthetic-asset' },
    });
    gift.experience.blocks.push({
      id: 'photo-1',
      type: 'photo',
      version: 1,
      enabled: true,
      data: {
        mediaId: 'demo-photo',
        alt: 'Synthetische Farbflächen',
        caption: 'Fiktives Beispielmotiv',
        fit: 'contain',
        position: 'center',
      },
    });
    gift.experience.animation = syntheticAnimation;
    gift.experience.plan = {
      version: 1,
      concept,
      pace: 'gentle',
      sceneOrder:
        concept === 'surprise-box'
          ? [
              'opening',
              'choice',
              'surprise',
              'moments',
              'letter',
              'finale',
              'closing',
            ]
          : concept === 'light-premiere'
            ? [
                'opening',
                'choice',
                'letter',
                'moments',
                'surprise',
                'finale',
                'closing',
              ]
            : [
                'opening',
                'choice',
                'moments',
                'letter',
                'surprise',
                'finale',
                'closing',
              ],
    };
    const html = exportHtml(gift, { 'synthetic-asset': src });
    expect(html).not.toContain('PRIVATE_ORIGINAL');
    await context.setOffline(true);
    for (const focus of ['moments', 'letter']) {
      const recipient = await context.newPage();
      const urls: string[] = [];
      const errors: string[] = [];
      recipient.on('request', (r) => {
        if (/^https?:/.test(r.url())) urls.push(r.url());
      });
      recipient.on('pageerror', (e) => errors.push(e.message));
      await recipient.setContent(html);
      await expect(recipient.locator('body')).toHaveAttribute(
        'data-animation-active',
        'true',
      );
      await recipient.locator('#stage-next').tap();
      await recipient.locator(`[data-route="${focus}"]`).tap();
      await expect(recipient.locator('body')).toHaveAttribute(
        'data-scene',
        focus,
      );
      await expect(recipient.locator('body')).toHaveAttribute(
        'data-animation-active',
        'false',
      );
      expect(
        await recipient
          .locator('.gold-field')
          .evaluate((e) => getComputedStyle(e).display),
      ).toBe('none');
      if (focus === 'moments')
        await expect(
          recipient.locator('.gift-scene[data-scene="moments"] img'),
        ).toBeVisible();
      else {
        await expect(recipient.locator('.letter-reveal')).toHaveAttribute(
          'open',
          '',
        );
      }
      for (let i = 0; i < 8; i++) {
        const scene = await recipient
          .locator('body')
          .getAttribute('data-scene');
        expect(
          await recipient.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        if (scene === 'finale') break;
        await recipient.locator('#stage-next').tap();
      }
      if (process.env.BES_REVISION_CAPTURE === '1') {
        await expect(recipient.locator('body')).toHaveAttribute(
          'data-finale-phase',
          '2',
        );
        await recipient.screenshot({
          path: `/tmp/bes-production-acceptance/${concept}-${focus}-${test.info().project.name}-finale.png`,
        });
      }
      await recipient.locator('#motion-off').check();
      await expect(recipient.locator('body')).toHaveAttribute(
        'data-finale-complete',
        'true',
      );
      if (focus === 'moments')
        await expect(
          recipient.locator(
            '.gift-scene[data-scene="finale"] [data-revision-final-keepsake] img',
          ),
        ).toBeVisible();
      else
        await expect(
          recipient.locator(
            '.gift-scene[data-scene="finale"] [data-final-sentence]',
          ),
        ).toContainText('Synthetische öffentliche Worte');
      await expect(recipient.locator('body')).toHaveAttribute(
        'data-animation-active',
        'false',
      );
      await recipient.locator('#stage-next').tap();
      await recipient.locator('#replay').tap();
      await expect(recipient.locator('body')).toHaveAttribute(
        'data-scene',
        'opening',
      );
      await expect(recipient.locator('body')).toHaveAttribute(
        'data-final-focus',
        'words',
      );
      expect(urls).toEqual([]);
      expect(errors).toEqual([]);
      await recipient.close();
    }
  });
}
test('mobile creator: full-screen examples are tappable, reversible and never change stored projects', async ({
  page,
}) => {
  await verifiedLiveResponses(page);
  await page.goto('/');
  const before = await readStoredProject(page);
  await page.locator('#try-examples').tap();
  for (const concept of ['atelier', 'surprise-box', 'light-premiere']) {
    await page.locator(`[data-demo-concept="${concept}"]`).tap();
    const preview = page.frameLocator('#theatre-preview');
    await expect(preview.locator('body')).toHaveAttribute(
      'data-concept',
      concept,
    );
    await preview.locator('#stage-next').tap();
    await preview.locator('[data-route="letter"]').tap();
    await expect(preview.locator('body')).toHaveAttribute(
      'data-scene',
      'letter',
    );
  }
  expect(
    await page
      .locator('#theatre-close')
      .evaluate((e) => e.getBoundingClientRect().height >= 44),
  ).toBe(true);
  await page.locator('#theatre-close').tap();
  await expect(page.locator('#try-examples')).toBeFocused();
  expect(await readStoredProject(page)).toEqual(before);
});

test('stopped revision ignores a formerly valid late worker frame in the open letter', async ({
  page,
}) => {
  const p = createProject();
  p.recipient.name = 'Demo';
  const gift = createMagicStart(p, 'Synthetische Worte.');
  gift.experience.plan = {
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
  };
  gift.experience.animation = syntheticAnimation;
  await page.setContent(exportHtml(gift));
  await page.locator('#stage-next').tap();
  await page.evaluate(() => {
    const state = window as typeof window & {
      lateFrame?: { source: MessageEventSource | null; data: unknown };
    };
    window.addEventListener('message', (event) => {
      if (event.data?.type === 'bes-animation-frame')
        state.lateFrame = { source: event.source, data: event.data };
    });
  });
  await expect
    .poll(() =>
      page.evaluate(
        () => !!(window as typeof window & { lateFrame?: unknown }).lateFrame,
      ),
    )
    .toBe(true);
  await page.evaluate(() => {
    const state = window as typeof window & {
      lateFrame: { source: MessageEventSource | null; data: unknown };
    };
    const old = state.lateFrame;
    document.querySelector<HTMLButtonElement>('[data-route="letter"]')!.click();
    window.dispatchEvent(
      new MessageEvent('message', { source: old.source, data: old.data }),
    );
  });
  await expect(page.locator('body')).toHaveAttribute('data-scene', 'letter');
  await expect(page.locator('.letter-reveal')).toHaveAttribute('open', '');
  await expect(page.locator('body')).toHaveAttribute(
    'data-animation-active',
    'false',
  );
  expect(
    await page.locator('#ai-animation').evaluate((e) => {
      const c = e as HTMLCanvasElement;
      return c
        .getContext('2d')!
        .getImageData(0, 0, c.width, c.height)
        .data.every((n) => n === 0);
    }),
  ).toBe(true);
});

test('detached animation host ignores a late load and stops its pending frame loop', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const project = createProject();
  project.recipient.name = 'Demo';
  const gift = createMagicStart(project, 'Synthetische Worte.');
  gift.experience.animation = syntheticAnimation;
  await page.setContent(exportHtml(gift));
  await expect(page.locator('body')).toHaveAttribute(
    'data-animation-active',
    'true',
  );
  await page.evaluate(() => {
    const host = document.querySelector<HTMLIFrameElement>('iframe')!;
    const lateLoad = host.onload;
    host.remove();
    lateLoad?.call(host, new Event('load'));
  });
  await expect(page.locator('body')).toHaveAttribute(
    'data-animation-active',
    'false',
  );
  expect(errors).toEqual([]);
});
