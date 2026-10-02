import { test, expect } from '@playwright/test';
import { createProject } from '../../src/domain/project';
import { createMagicStart } from '../../src/engines/magic-start';
import { exportHtml } from '../../src/export/html';
import { syntheticAnimation } from '../ai-fixture';
function html(source = syntheticAnimation.source) {
  const p = createProject();
  p.recipient.name = 'Demo';
  const g = createMagicStart(p, 'Fiktive öffentliche Worte.');
  g.experience.composition = {
    version: 1,
    variant: 'challenger',
    arc: 'portrait',
  };
  g.experience.animation = { version: 1, source };
  return exportHtml(g);
}
test('generated animation actually draws changing offline frames; pause/reduced motion removes worker work', async ({
  page,
  context,
}) => {
  await context.setOffline(true);
  const requests: string[] = [];
  page.on('request', (r) => {
    if (/^https?:/.test(r.url())) requests.push(r.url());
  });
  await page.setContent(html());
  await expect(page.locator('body')).toHaveAttribute(
    'data-animation-active',
    'true',
  );
  const first = await page
    .locator('#ai-animation')
    .evaluate((c) => (c as HTMLCanvasElement).toDataURL());
  await expect
    .poll(() =>
      page
        .locator('#ai-animation')
        .evaluate((c) => (c as HTMLCanvasElement).toDataURL()),
    )
    .not.toBe(first);
  await page.locator('#motion-off').check();
  await expect(page.locator('body')).toHaveAttribute(
    'data-animation-active',
    'false',
  );
  await page.locator('#stage-next').tap();
  await expect(page.locator('body')).toHaveAttribute('data-scene', 'choice');
  await page.locator('#motion-off').uncheck();
  await expect(page.locator('body')).toHaveAttribute(
    'data-animation-active',
    'true',
  );
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(
    await page.evaluate(
      () => matchMedia('(prefers-reduced-motion: reduce)').matches,
    ),
  ).toBe(true);
  await expect(page.locator('body')).toHaveAttribute(
    'data-animation-active',
    'false',
  );
  expect(requests).toEqual([]);
});
test('opaque generated worker cannot read DOM/storage or make an obfuscated network request', async ({
  page,
}) => {
  const requests: string[] = [];
  page.on('request', (r) => {
    if (/^https?:/.test(r.url())) requests.push(r.url());
  });
  await page.setContent(
    html(
      `let denied=false;try{self['indexed'+'DB'].open('private');}catch{denied=true;}let blocked=false;self['fe'+'tch']('https://makandev.github.io/bes-isolation-probe').catch(()=>{blocked=true;});function frame(){return [{kind:'circle',x:.5,y:.5,r:.1,color:denied&&blocked&&typeof self['doc'+'ument']==='undefined'?'#00FF00':'#FF0000',alpha:1}];}`,
    ),
  );
  await expect(page.locator('body')).toHaveAttribute(
    'data-animation-active',
    'true',
  );
  await expect
    .poll(() =>
      page.locator('#ai-animation').evaluate((c) => {
        const canvas = c as HTMLCanvasElement;
        return [
          ...canvas
            .getContext('2d')!
            .getImageData(
              Math.floor(canvas.width / 2),
              Math.floor(canvas.height / 2),
              1,
              1,
            ).data,
        ].slice(0, 3);
      }),
    )
    .toEqual([0, 255, 0]);
  expect(requests).toEqual([]);
});
test('infinite generated computation is terminated and gift controls remain responsive', async ({
  page,
}) => {
  await page.setContent(html('function frame(){while(true){} }'));
  await expect(page.locator('body')).toHaveAttribute(
    'data-animation-failed',
    'true',
    { timeout: 5000 },
  );
  await page.locator('#stage-next').tap();
  await expect(page.locator('body')).toHaveAttribute('data-scene', 'choice');
  await page.setContent(
    html(
      'function frame(){return [{kind:"rect",x:.5,y:.5,w:1.5,h:.2,color:"#123456",alpha:1}];}',
    ),
  );
  await expect(page.locator('body')).toHaveAttribute(
    'data-animation-failed',
    'true',
  );
});
test('hostile drawing payload fails closed and forged parent messages are ignored', async ({
  page,
}) => {
  await page.setContent(
    html(
      'function frame(){return [{kind:"circle",x:.5,y:.5,r:.2,color:"javascript:attack",alpha:1}];}',
    ),
  );
  await expect(page.locator('body')).toHaveAttribute(
    'data-animation-failed',
    'true',
  );
  await page.evaluate(() =>
    dispatchEvent(
      new MessageEvent('message', {
        source: window,
        data: { type: 'bes-animation-frame', commands: [{}] },
      }),
    ),
  );
  await page.locator('#stage-next').tap();
  await expect(page.locator('body')).toHaveAttribute('data-scene', 'choice');
  await page.setContent(
    html(
      'function frame(){return [{kind:"rect",x:.5,y:.5,w:1.5,h:.2,color:"#123456",alpha:1}];}',
    ),
  );
  await expect(page.locator('body')).toHaveAttribute(
    'data-animation-failed',
    'true',
  );
});
