/* global console, process, window, document, getComputedStyle */
import { chromium, webkit } from '@playwright/test';
import { URL } from 'node:url';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const html = await readFile(
  new URL('./konzeptstudio.html', import.meta.url),
  'utf8',
);
const safari = process.argv.includes('--webkit');
const browser = await (safari ? webkit : chromium).launch({
  executablePath: safari
    ? process.env.PLAYWRIGHT_WEBKIT_EXECUTABLE_PATH
    : process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
  headless: true,
});
let checks = 0;
for (const width of [390, 1400]) {
  const page = await browser.newPage({
    viewport: { width, height: 844 },
    hasTouch: width === 390,
  });
  let requests = 0;
  page.on('request', (r) => {
    if (/^https?:/.test(r.url())) requests++;
  });
  await page.setContent(html);
  for (const mode of ['editorial', 'play', 'cinema']) {
    await page.locator('[data-mode="' + mode + '"]').click();
    await page.locator('#large-mobile').click();
    await page.locator('[data-action="open"]').click();
    if (mode !== 'play')
      assert.ok(
        await page
          .locator('.photo')
          .evaluate((e) =>
            getComputedStyle(e).backgroundImage.startsWith(
              'url("data:image/png;base64,',
            ),
          ),
      );
    else assert.equal(await page.locator('.gift-door').count(), 2);
    checks++;
    await page.locator('[data-action="choose-words"]').click();
    await page.locator('[data-action="wish"]').click();
    await page.locator('[data-action="keep-words"]').click();
    assert.equal(await page.locator('.final-photo').count(), 0);
    checks++;
    assert.match(
      await page.locator('.scene').innerText(),
      /Ein kleiner Moment/,
    );
    checks++;
    await page.locator('[data-action="replay"]').click();
    await page.locator('[data-action="open"]').click();
    await page.locator('[data-action="choose-photo"]').click();
    await page.locator('[data-action="wish"]').click();
    await page.locator('[data-action="keep-photo"]').click();
    assert.equal(await page.locator('.final-photo').count(), 1);
    checks++;
    await page.locator('#back').click();
    assert.equal(await page.locator('[data-action="keep-photo"]').count(), 1);
    checks++;
    assert.ok(
      await page.locator('#exit').evaluate((e) => {
        const r = e.getBoundingClientRect();
        const top = document.elementFromPoint(
          r.x + r.width / 2,
          r.y + r.height / 2,
        );
        return e === top || e.contains(top);
      }),
    );
    checks++;
    assert.ok(
      await page
        .locator('#exit')
        .evaluate((e) => e.getBoundingClientRect().height >= 44),
    );
    checks++;
    await page.locator('#exit').click();
  }
  await page.locator('#name').fill('<img src=x onerror="window.pwned=1">');
  await page.locator('#update').click();
  assert.equal(await page.evaluate(() => window.pwned), undefined);
  assert.equal(await page.locator('.scene img').count(), 0);
  checks += 2;
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('#large-mobile').click();
  await page.locator('[data-action="open"]').click();
  assert.equal(await page.locator('[data-action="choose-photo"]').count(), 1);
  checks++;
  assert.equal(requests, 0);
  checks++;
  await page.close();
}
await browser.close();
console.log(
  checks +
    ' concept assertions passed: 3 concepts × mobile/desktop, real clicks, consequential choices, replay/back, touch geometry, synthetic XSS, reduced motion, no network.',
);
