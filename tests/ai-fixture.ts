import { expect, type Page } from '@playwright/test';
// Synthetic provider responses ONLY. This does not prove real model inference.
export const syntheticAnimation = {
  version: 1 as const,
  source: `function frame(input) {
const out=[];const count=input.scene==='finale'?64:32;
for(let i=0;i<count;i++){
const angle=i*2.39996+input.time*.14;
const final=input.scene==='finale'&&input.phase===2;
const radius=final?((input.time*.12+i*.03)%1)*.45:.3;
out.push({kind:'circle',x:.5+Math.cos(angle)*radius,y:final?.34+Math.sin(angle)*radius:1-((i*.073+input.time*.02)%1),r:final?.006:.002,color:'#D3AF63',alpha:final?.8:.35,glow:.8});
}return out;
}`,
};
export async function mockLocalAi(page: Page) {
  await page.route('http://127.0.0.1:11434/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    const body =
      path === '/api/tags'
        ? { models: [{ name: 'synthetic-test-model:local' }] }
        : path === '/api/show'
          ? { capabilities: ['completion'] }
          : {
              message: {
                content: JSON.stringify({
                  version: 1,
                  letter: 'Ein fiktiver öffentlicher Geburtstagsgruß.',
                  wish: 'Ein guter Start in dein neues Lebensjahr.',
                  surprise: '',
                  animation: syntheticAnimation,
                }),
              },
            };
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(body),
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  });
}
export async function connectLocalAi(page: Page) {
  await mockLocalAi(page);
  await page.locator('#ai-settings').click();
  await page.locator('#ai-local-find').click();
  await expect(page.locator('#ai-local-model option')).toHaveText(
    'synthetic-test-model:local',
  );
  await page.locator('#ai-local-connect').click();
  await expect(page.locator('#ai-status')).toHaveText('Lokale KI');
  await page.locator('#ai-close').click();
}
export async function acceptAiGift(page: Page) {
  await expect(page.locator('#ai-review')).toBeVisible({ timeout: 15000 });
  await expect(
    page.frameLocator('#ai-review-preview').locator('body'),
  ).toHaveAttribute('data-scene', 'opening');
  await expect(
    page.frameLocator('#ai-review-preview').locator('body'),
  ).toHaveAttribute('data-animation-active', 'true');
  await page.locator('#ai-accept').click();
}
