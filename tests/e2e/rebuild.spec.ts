import { test, expect } from '@playwright/test';
import { createProject } from '../../src/domain/project';
import { createMagicStart } from '../../src/engines/magic-start';
import { exportHtml } from '../../src/export/html';
import { readStoredProject } from '../browser-storage';
import AxeBuilder from '@axe-core/playwright';

for (const direction of ['emotional', 'funny', 'cinematic'] as const) {
  test(`Challenger ${direction}: offline progression, consequential choice, finale, replay and mobile layout`, async ({
    page,
    context,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.clock.install();
    const p = createProject();
    p.recipient.name = 'Alex';
    p.experience.directionId = direction;
    p.answers.secret = { status: 'answered', value: 'PRIVATE_NOT_A_GIFT' };
    const gift = createMagicStart(
      p,
      'Ein frei erfundener Ausflug voller kleiner Entdeckungen.',
    );
    gift.experience.composition = {
      version: 1,
      variant: 'challenger',
      arc: 'portrait',
    };
    const html = exportHtml(gift);
    expect(html).not.toContain('PRIVATE_NOT_A_GIFT');
    const requests: string[] = [];
    const errors: string[] = [];
    page.on('request', (r) => requests.push(r.url()));
    page.on('pageerror', (e) => errors.push(e.message));
    await context.setOffline(true);
    await page.setContent(html);
    await expect(page.locator('body')).toHaveAttribute(
      'data-variant',
      'challenger',
    );
    await expect(page.locator('body')).toHaveAttribute('data-scene', 'opening');
    const visited: string[] = ['opening'];
    let selected = '';
    for (let i = 0; i < 12; i++) {
      const scene = await page.locator('body').getAttribute('data-scene');
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      if (scene === 'closing') break;
      if (scene === 'choice') {
        const button = page.locator('[data-route="surprise"]');
        await button.click();
        selected = 'surprise';
        await expect(button).toHaveAttribute('aria-pressed', 'true');
      }
      if (scene === 'letter') {
        await page.locator('.letter-reveal summary').click();
        await expect(
          page
            .getByText(
              'Ein frei erfundener Ausflug voller kleiner Entdeckungen.',
              { exact: true },
            )
            .first(),
        ).toBeVisible();
      }
      if (scene === 'curiosity')
        await page.locator('.discovery-note summary').click();
      if (scene === 'encore')
        await page.locator('.encore-reveal summary').click();
      if (scene === 'finale') {
        await expect(page.locator('#stage-next')).toBeDisabled();
        const phase = Number(
          await page.locator('body').getAttribute('data-phase-ms'),
        );
        await page.clock.fastForward(phase);
        await expect(
          page.locator('.finale-message.active .core-message'),
        ).toContainText('frei erfundener Ausflug');
        await page.clock.fastForward(phase * 2);
        await expect(page.locator('#stage-next')).toBeEnabled();
        if (direction !== 'emotional')
          await page.locator('#fireworks-again').click();
      }
      const next = page.locator('#stage-next');
      const box = await next.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
      await next.click();
      const now = (await page.locator('body').getAttribute('data-scene'))!;
      if (scene === 'choice') expect(now).toBe(selected);
      visited.push(now);
    }
    expect(visited.at(-1)).toBe('closing');
    expect(new Set(visited).size).toBe(
      await page.locator('.gift-scene').count(),
    );
    await page.locator('#replay').click();
    await expect(page.locator('body')).toHaveAttribute('data-scene', 'opening');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (
      let i = 0;
      i < 12 &&
      (await page.locator('body').getAttribute('data-scene')) !== 'finale';
      i++
    )
      await page.locator('#stage-next').click();
    await expect(page.locator('#stage-next')).toBeEnabled();
    expect(
      (
        await new AxeBuilder({ page })
          .setLegacyMode(true)
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.locator('#skip-finale').click();
    await expect(page.locator('#replay')).toBeVisible();
    expect(errors).toEqual([]);
    expect(requests).toEqual([]);
  });
}
test('creator compares both ways with the same data, edits at preview, changes coherent arc and undoes safely', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('#magic-name').fill('Alex');
  await page.locator('#magic-form button[type="submit"]').click();
  const frame = page.frameLocator('#gift-preview');
  await page
    .getByText('Zwei Geschenkwege vergleichen', { exact: true })
    .click();
  await page.locator('[data-review-variant="challenger"]').click();
  await expect(frame.locator('body')).toHaveAttribute(
    'data-variant',
    'challenger',
  );
  const before = await readStoredProject(page);
  await expect(
    frame.locator('.gift-scene[data-scene="opening"] h1'),
  ).toBeVisible();
  await page.locator('#surprise-view').click();
  const after = await readStoredProject(page);
  expect(after.experience.composition!.arc).not.toBe(
    before.experience.composition!.arc,
  );
  expect(after.experience.directionId).toBe(before.experience.directionId);
  expect(after.experience.blocks).toEqual(before.experience.blocks);
  await page.locator('#undo-reset').click();
  expect((await readStoredProject(page)).experience.composition).toEqual(
    before.experience.composition,
  );
  await page.locator('#edit-visible-copy').click();
  await page
    .locator('#scene-edit-text')
    .fill('Eine ausdrücklich freigegebene neue Kernbotschaft.');
  await page.locator('#scene-edit-form button[type="submit"]').click();
  await expect(frame.locator('body')).toHaveAttribute('data-scene', 'letter');
  await expect(
    frame
      .getByText('Eine ausdrücklich freigegebene neue Kernbotschaft.', {
        exact: true,
      })
      .first(),
  ).toBeVisible();
  await page.reload();
  expect((await readStoredProject(page)).writing.letter).toBe(
    'Eine ausdrücklich freigegebene neue Kernbotschaft.',
  );
  await page
    .getByText('Zwei Geschenkwege vergleichen', { exact: true })
    .click();
  await page.locator('[data-review-variant="champion"]').click();
  await expect(frame.locator('body')).toHaveAttribute(
    'data-variant',
    'champion',
  );
  await expect(frame.locator('.gift-scene')).toHaveCount(8);
  expect((await readStoredProject(page)).writing.letter).toBe(
    'Eine ausdrücklich freigegebene neue Kernbotschaft.',
  );
});

test('a newly mounted preview rejects a stray parent compatibility click, then accepts deliberate mouse/keyboard activation', async ({
  page,
}) => {
  const p = createProject();
  p.recipient.name = 'Alex';
  const gift = createMagicStart(p, 'Fiktive öffentliche Worte.');
  gift.experience.composition = {
    version: 1,
    variant: 'challenger',
    arc: 'portrait',
  };
  await page.setContent(exportHtml(gift, {}, 'letter'));
  const summary = page.locator('.letter-reveal summary');
  await expect(page.locator('.letter-reveal')).toHaveAttribute('open', '');
  await summary.evaluate((el) =>
    el.dispatchEvent(
      new MouseEvent('click', { detail: 1, bubbles: true, cancelable: true }),
    ),
  );
  await expect(page.locator('.letter-reveal')).toHaveAttribute('open', '');
  await summary.click();
  await expect(page.locator('.letter-reveal')).not.toHaveAttribute('open', '');
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.letter-reveal')).toHaveAttribute('open', '');
});

test('Challenger without JavaScript stays readable, native reveals work and no animated playback is required', async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  try {
    for (const direction of ['emotional', 'funny', 'cinematic'] as const) {
      const p = createProject();
      p.recipient.name = 'Alex';
      p.experience.directionId = direction;
      const gift = createMagicStart(p, 'Fiktive öffentliche Worte.');
      gift.experience.composition = {
        version: 1,
        variant: 'challenger',
        arc: 'portrait',
      };
      await page.setContent(exportHtml(gift));
      await expect(page.locator('.closing-copy')).toBeVisible();
      await page.locator('.letter-reveal summary').click();
      await expect(
        page
          .locator('.letter-reveal')
          .getByText('Fiktive öffentliche Worte.', { exact: true }),
      ).toBeVisible();
      await expect(page.locator('.stage-nav')).not.toBeVisible();
    }
  } finally {
    await context.close();
  }
});
