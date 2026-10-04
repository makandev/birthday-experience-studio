/* global console, process, window, document */
import { chromium } from '@playwright/test';
import { URL, fileURLToPath } from 'node:url';
import { readFile, mkdir } from 'node:fs/promises';
const out = fileURLToPath(new URL('./visuals', import.meta.url));
const html = await readFile(
  new URL('./konzeptstudio.html', import.meta.url),
  'utf8',
);
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1400, height: 1080 } });
await page.setContent(html);
await page.locator('.opening-paper').waitFor();
const modes = ['editorial', 'play', 'cinema'];
for (const mode of modes) {
  await page.evaluate((m) => window.conceptRender(m, 0, 1), mode);
  await page.screenshot({ path: out + '/' + mode + '-creator.png' });
  await page.evaluate(() =>
    document.body.classList.add('fullscreen', 'recording'),
  );
  await page.setViewportSize({ width: 440, height: 780 });
  await page.evaluate((m) => window.conceptRender(m, 1, 10), mode);
  await page.screenshot({ path: out + '/' + mode + '-recipient.png' });
  await page.evaluate((m) => window.conceptRender(m, 4, 37, 'words'), mode);
  await page.screenshot({ path: out + '/' + mode + '-finale.png' });
  await page.evaluate(() =>
    document.body.classList.remove('fullscreen', 'recording'),
  );
  await page.setViewportSize({ width: 1400, height: 1080 });
}
// Deterministic photographed film frames. These are authored concept animations,
// NOT model-generated gifts or a simulation of OS attachment delivery.
const requested = process.argv[2] ?? 'editorial';
await page.evaluate(() =>
  document.body.classList.add('fullscreen', 'recording'),
);
await page.setViewportSize({ width: 440, height: 780 });
const dir = '/tmp/bes-revision-frames/' + requested;
await mkdir(dir, { recursive: true });
for (let f = 0; f < 360; f++) {
  const t = f / 8;
  const index = Math.min(4, Math.floor(t / 9));
  await page.evaluate(
    ({ m, i, t }) => {
      window.conceptRender(m, i, t, 'words');
      document.querySelector('.scene').style.opacity = String(
        Math.min(1, 0.4 + (t % 9) * 1.5),
      );
    },
    { m: requested, i: index, t },
  );
  await page.screenshot({
    path: dir + '/' + String(f).padStart(4, '0') + '.png',
  });
}
await browser.close();
console.log(
  'Rendered 9 synthetic concept screenshots and 360 ' +
    requested +
    ' film frames (45s at 8fps).',
);
