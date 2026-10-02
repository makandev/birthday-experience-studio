import { test, expect } from '@playwright/test';
import { createProject } from '../../src/domain/project';
import { createMagicStart } from '../../src/engines/magic-start';
import { exportHtml } from '../../src/export/html';
import { recipientStation } from '../recipient-navigation';
import AxeBuilder from '@axe-core/playwright';
function html() {
  const p = createProject();
  p.recipient.name = 'Anna';
  return exportHtml(createMagicStart(p, 'PERSONAL_LATE_WORDS'));
}
test('exact offline gift bytes provide deliberate seven-station progression, choice, late letter, timed finale and replay', async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  const requests: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('request', (r) => requests.push(r.url()));
  await page.clock.install();
  await context.setOffline(true);
  await page.setContent(html());
  await expect(page.locator('body')).toHaveAttribute('data-scene', 'opening');
  await expect(page.locator('#live-clock')).toHaveText(/\d\d:\d\d:\d\d/);
  await expect(
    page.getByText('PERSONAL_LATE_WORDS', { exact: true }),
  ).not.toBeVisible();
  await page.locator('#stage-next').click();
  await expect(page.locator('#stage-counter')).toHaveText('Station 2 von 7');
  await page.locator('#stage-next').click();
  await page.getByRole('button', { name: 'Ein Lächeln', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Ein Lächeln', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#stage-next').click();
  await expect(page.locator('#moment-intro')).toContainText('Lächeln');
  await page.locator('#stage-next').click();
  await expect(page.locator('.letter-reveal')).not.toHaveAttribute('open', '');
  await page.locator('.letter-reveal summary').click();
  await expect(
    page.getByText('PERSONAL_LATE_WORDS', { exact: true }),
  ).toBeVisible();
  await recipientStation(page, 'surprise');
  await expect(page.locator('.wish-envelope .revealed')).not.toBeVisible();
  await page.locator('.wish-envelope summary').click();
  await expect(page.locator('.wish-envelope .revealed')).toBeVisible();
  await expect(page.locator('#stage-next')).toHaveText(
    'Noch ein letzter Moment',
  );
  await page.locator('#stage-next').click();
  await expect(page.locator('#stage-next')).toBeDisabled();
  await expect(page.locator('.finale-message.active')).toHaveCount(1);
  await page.clock.fastForward(9000);
  await expect(page.locator('.finale-message.active h1')).toContainText('Anna');
  await expect(page.locator('#stage-next')).toBeDisabled();
  await page.clock.fastForward(4500);
  await expect(page.locator('#stage-next')).toBeEnabled();
  await page.locator('#stage-next').click();
  await expect(page.locator('#stage-counter')).toHaveText('Dein Abschluss');
  await page.locator('#replay').click();
  await expect(page.locator('body')).toHaveAttribute('data-scene', 'opening');
  await expect(page.locator('.letter-reveal')).not.toHaveAttribute('open', '');
  expect(requests).toEqual([]);
  expect(errors).toEqual([]);
});
test('reduced motion, pause and skip reveal a usable finale without waiting', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setContent(html());
  await recipientStation(page, 'finale');
  await expect(page.locator('#stage-next')).toBeEnabled();
  await expect(page.locator('.finale-message.active')).toHaveCount(3);
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
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setContent(html());
  await page.locator('#motion-off').check();
  await recipientStation(page, 'finale');
  await expect(page.locator('#stage-next')).toBeEnabled();
  await page.setContent(html());
  await recipientStation(page, 'finale');
  await page.locator('#skip-finale').click();
  await expect(page.locator('#replay')).toBeVisible();
});
test('CSP blocks added executable text and JavaScript-disabled fallback retains readable recipient content', async ({
  page,
  browser,
}) => {
  await page.setContent(
    html().replace('</body>', '<script>window.hacked=true</script></body>'),
  );
  expect(await page.evaluate(() => Object.hasOwn(window, 'hacked'))).toBe(
    false,
  );
  await expect(page.locator('body')).toHaveClass(/enhanced/);
  const context = await browser.newContext({ javaScriptEnabled: false });
  const fallback = await context.newPage();
  try {
    await fallback.setContent(html());
    await expect(fallback.locator('.gift-scene')).toHaveCount(8);
    await expect(fallback.locator('[data-scene="closing"]')).toBeVisible();
    await fallback.locator('.letter-reveal summary').click();
    await expect(
      fallback.getByText('PERSONAL_LATE_WORDS', { exact: true }),
    ).toBeVisible();
    await expect(fallback.locator('.stage-nav')).not.toBeVisible();
  } finally {
    await context.close();
  }
});

test('touch activation ignores a scroll/cancel and deduplicates compatibility clicks without breaking keyboard activation', async ({
  page,
}) => {
  await page.setContent(html());
  const simulate = async (action: 'scroll' | 'cancel' | 'tap') =>
    page.locator('#stage-next').evaluate((button, action) => {
      button.dispatchEvent(
        new PointerEvent('pointerdown', {
          pointerId: 9,
          pointerType: 'touch',
          isPrimary: true,
          clientX: 20,
          clientY: 20,
          bubbles: true,
        }),
      );
      if (action === 'cancel')
        button.dispatchEvent(
          new PointerEvent('pointercancel', {
            pointerId: 9,
            pointerType: 'touch',
            isPrimary: true,
            bubbles: true,
          }),
        );
      button.dispatchEvent(
        new PointerEvent('pointerup', {
          pointerId: 9,
          pointerType: 'touch',
          isPrimary: true,
          clientX: action === 'scroll' ? 50 : 20,
          clientY: 20,
          bubbles: true,
          cancelable: true,
        }),
      );
      if (action === 'tap')
        document.getElementById('skip-finale')!.dispatchEvent(
          new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            detail: 1,
          }),
        );
    }, action);
  await simulate('scroll');
  await expect(page.locator('body')).toHaveAttribute('data-scene', 'opening');
  await simulate('cancel');
  await expect(page.locator('body')).toHaveAttribute('data-scene', 'opening');
  await simulate('tap');
  await expect(page.locator('body')).toHaveAttribute('data-scene', 'curiosity');
  await page.locator('#stage-next').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('body')).toHaveAttribute('data-scene', 'choice');
});
