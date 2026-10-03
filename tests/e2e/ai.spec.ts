import { test, expect } from '@playwright/test';
import {
  connectSyntheticAi,
  acceptAiGift,
  syntheticAnimation,
} from '../ai-fixture';
import { readStoredProject } from '../browser-storage';
import { readFile } from 'node:fs/promises';
test('new AI-first flow never silently substitutes a template when no provider is connected', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('#magic-name').fill('Demo');
  await page.locator('#magic-form button[type="submit"]').click();
  await expect(page.locator('#ai-dialog')).toBeVisible();
  await page.locator('#ai-generate').click();
  await expect(page.locator('#ai-error')).toContainText('zuerst');
  await expect(page.locator('#gift-preview')).toHaveCount(0);
  expect((await readStoredProject(page)).experience.animation).toBeUndefined();
  await page.locator('#ai-close').click();
  await expect(page.locator('#magic-name')).toHaveValue('Demo');
});
test('review can be discarded, code can be regenerated without changing authored text and undo restores the prior program', async ({
  page,
}) => {
  await page.goto('/');
  await connectSyntheticAi(page);
  await page.locator('#magic-name').fill('Demo');
  await page.locator('#magic-form button[type="submit"]').click();
  await expect(page.locator('#ai-review')).toBeVisible();
  await page.locator('#ai-reject').click();
  expect((await readStoredProject(page)).experience.animation).toBeUndefined();
  await page.locator('#magic-form button[type="submit"]').click();
  await acceptAiGift(page);
  const before = await readStoredProject(page);
  await page.route('http://127.0.0.1:11434/api/chat', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        message: {
          content: JSON.stringify({
            version: 1,
            letter: 'Do not silently replace authored words.',
            wish: 'Other wish',
            surprise: '',
            animation: {
              ...syntheticAnimation,
              source: syntheticAnimation.source.replace('#D3AF63', '#739FD3'),
            },
          }),
        },
      }),
    }),
  );
  await page.locator('#manual-preview > summary').click();
  await page.locator('#ai-recompose').click();
  await page.locator('#ai-generate').click();
  await acceptAiGift(page);
  const after = await readStoredProject(page);
  expect(after.writing).toEqual(before.writing);
  expect(after.experience.animation!.source).not.toBe(
    before.experience.animation!.source,
  );
  await page.locator('#undo-reset').click();
  expect((await readStoredProject(page)).experience.animation).toEqual(
    before.experience.animation,
  );
});
test('free-only PKCE session never enters drafts, prompts, HTML, URLs or persistence; reload forgets connection', async ({
  page,
}) => {
  const key = 'FAKE_TEST_CREDENTIAL_ONLY';
  const requests: string[] = [];
  await page.route('https://openrouter.ai/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    requests.push(route.request().url());
    if (path.endsWith('/auth/keys'))
      return route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ key }),
      });
    const body = route.request().postDataJSON();
    expect(body.model).toBe('openrouter/free');
    expect(JSON.stringify(body)).not.toContain(key);
    return route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        choices: [
          {
            message: {
              content: JSON.stringify({
                version: 1,
                letter: 'Öffentliche Worte.',
                wish: 'Ein guter Wunsch.',
                surprise: '',
                animation: syntheticAnimation,
              }),
            },
          },
        ],
      }),
    });
  });
  await page.goto('/');
  await page.locator('#magic-name').fill('Demo');
  await page.locator('#ai-settings').click();
  await page.locator('#ai-auth-start').click();
  const url = new URL(
    (await page.locator('#ai-auth-link').getAttribute('href'))!,
  );
  expect(url.searchParams.has('code_verifier')).toBe(false);
  expect(url.searchParams.has('callback_url')).toBe(false);
  await page.locator('#ai-auth-code').fill('fake-test-authorization-code');
  await page.locator('#ai-auth-finish').click();
  await expect(page.locator('#ai-status')).toHaveText('Kostenlose Online-KI');
  await expect(page.locator('#ai-auth-code')).toHaveValue('');
  await page.locator('#ai-generate').click();
  await acceptAiGift(page);
  expect(JSON.stringify(await readStoredProject(page))).not.toContain(key);
  await page.locator('#full-preview').click();
  const download = page.waitForEvent('download');
  await page.locator('#download').click();
  expect(
    await readFile((await (await download).path())!, 'utf8'),
  ).not.toContain(key);
  expect(requests.every((u) => !u.includes('?') && !u.includes(key))).toBe(
    true,
  );
  expect(
    await page.evaluate(
      () =>
        JSON.stringify({ ...localStorage }) +
        JSON.stringify({ ...sessionStorage }),
    ),
  ).not.toContain(key);
  await page.reload();
  await page.locator('#manual-preview > summary').click();
  await page.locator('#ai-recompose').click();
  await expect(page.locator('#ai-status')).toHaveText(
    'Noch keine KI verbunden',
  );
});
test('quota failure leaves the saved project unchanged and makes no paid retry', async ({
  page,
}) => {
  await page.goto('/');
  await connectSyntheticAi(page);
  await page.locator('#magic-name').fill('Demo');
  let calls = 0;
  await page.route('http://127.0.0.1:11434/api/chat', (route) => {
    calls++;
    return route.fulfill({
      status: 429,
      contentType: 'application/json',
      body: '{}',
    });
  });
  const before = await readStoredProject(page);
  await page.locator('#magic-form button[type="submit"]').click();
  await expect(page.locator('#ai-error')).toContainText('Limit');
  expect((await readStoredProject(page)).experience).toEqual(before.experience);
  expect(calls).toBe(1);
  await expect(page.locator('#gift-preview')).toHaveCount(0);
});
