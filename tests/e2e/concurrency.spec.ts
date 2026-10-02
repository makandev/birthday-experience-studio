import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { readStoredProject, readWorkspace } from '../browser-storage';
import legacy from '../fixtures/project-v1.json' with { type: 'json' };
import { STORAGE_KEY } from '../../src/persistence/storage';
async function writing(page: Page) {
  await page.goto('/');
  await page.locator('nav button[data-go="person"]').click();
  await page
    .getByLabel('Wie heißt die Geburtstagsperson?')
    .fill('Shared recipient');
  await page
    .getByRole('button', { name: 'Weiter zu eurer Geschichte' })
    .click();
  await page
    .getByRole('button', { name: 'Ich möchte jetzt schreiben' })
    .click();
  await page.getByLabel('Dein persönlicher Brief').fill('Original letter');
  await readStoredProject(page);
}
async function noHints(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'BroadcastChannel', { value: undefined });
    const set = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === 'bes.workspace-notice') throw new Error('No hint');
      return set.call(this, key, value);
    };
    const on = window.addEventListener.bind(window);
    window.addEventListener = ((
      ...args: Parameters<typeof window.addEventListener>
    ) => {
      if (args[0] !== 'focus' && args[0] !== 'storage') on(...args);
    }) as typeof window.addEventListener;
    const docOn = document.addEventListener.bind(document);
    document.addEventListener = ((
      ...args: Parameters<typeof document.addEventListener>
    ) => {
      if (args[0] !== 'visibilitychange') docOn(...args);
    }) as typeof document.addEventListener;
  });
}
test('multi-context: same-profile stale tab is fenced without hints; independent context stays isolated', async ({
  page,
  context,
  browser,
}) => {
  await noHints(page);
  await writing(page);
  const older = await context.newPage();
  await noHints(older);
  await older.goto('/');
  await expect(older.getByLabel('Dein persönlicher Brief')).toHaveValue(
    'Original letter',
  );
  const isolated = await browser.newContext();
  const isolatedPage = await isolated.newPage();
  try {
    await isolatedPage.goto('/');
    await expect(
      isolatedPage.locator('nav button[data-go="person"]'),
    ).toBeVisible();
    await page.getByLabel('Dein persönlicher Brief').fill('Newer from tab A');
    await readStoredProject(page);
    await older
      .getByLabel('Dein persönlicher Brief')
      .fill('Unsaved private input from tab B');
    await expect(older.locator('#conflict-panel')).toBeVisible();
    await expect(older.getByLabel('Dein persönlicher Brief')).toHaveValue(
      'Unsaved private input from tab B',
    );
    expect((await readStoredProject(page)).writing.letter).toBe(
      'Newer from tab A',
    );
    const downloadEvent = older.waitForEvent('download');
    await older
      .getByRole('button', { name: 'Eingaben dieses Tabs sichern' })
      .click();
    const download = await downloadEvent;
    expect(
      JSON.parse(await readFile((await download.path())!, 'utf8')).writing
        .letter,
    ).toBe('Unsaved private input from tab B');
    await older
      .getByRole('button', { name: 'Gespeicherten Stand übernehmen' })
      .click();
    await expect(older.getByLabel('Dein persönlicher Brief')).toHaveValue(
      'Newer from tab A',
    );
    await older
      .getByLabel('Dein persönlicher Brief')
      .fill('After explicit adoption');
    expect((await readStoredProject(older)).writing.letter).toBe(
      'After explicit adoption',
    );
    await expect(isolatedPage.locator('#conflict-panel')).not.toBeVisible();
  } finally {
    await isolated.close();
    await older.close();
  }
});
test('simultaneous browser autosaves have one winner, then deletion invalidates the open editor', async ({
  page,
  context,
}) => {
  await noHints(page);
  await writing(page);
  const other = await context.newPage();
  await noHints(other);
  await other.goto('/');
  await expect(other.getByLabel('Dein persönlicher Brief')).toHaveValue(
    'Original letter',
  );
  await Promise.all(
    [page, other].map((tab, index) =>
      tab.evaluate((value) => {
        const input = document.querySelector<HTMLTextAreaElement>('#letter')!;
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }, 'Racing writer ' + index),
    ),
  );
  await expect
    .poll(
      async () =>
        (await page.locator('#conflict-panel').isVisible()) ||
        (await other.locator('#conflict-panel').isVisible()),
    )
    .toBe(true);
  const loser = (await page.locator('#conflict-panel').isVisible())
    ? page
    : other;
  const winner = loser === page ? other : page;
  const saved = await readStoredProject(winner);
  expect(saved.writing.letter).toMatch(/^Racing writer [01]$/);
  await loser
    .getByRole('button', { name: 'Gespeicherten Stand übernehmen' })
    .click();
  await winner
    .getByRole('button', { name: 'Meine Geschenke & Sicherung' })
    .click();
  await winner
    .getByRole('button', { name: 'Aktuelles Geschenk löschen' })
    .click();
  await winner
    .getByRole('button', { name: 'Geschenk behalten', exact: true })
    .click();
  expect((await readStoredProject(winner)).id).toBe(saved.id);
  await winner
    .getByRole('button', { name: 'Meine Geschenke & Sicherung' })
    .click();
  await winner
    .getByRole('button', { name: 'Aktuelles Geschenk löschen' })
    .click();
  await winner.getByRole('button', { name: 'Endgültig löschen' }).click();
  await expect(winner.locator('nav button[data-go="person"]')).toBeVisible();
  await loser
    .getByLabel('Dein persönlicher Brief')
    .fill('Cannot resurrect deleted project');
  await expect(loser.locator('#conflict-panel')).toBeVisible();
  expect(
    (await readWorkspace(winner)).entries.some(
      (entry) => entry.project.id === saved.id,
    ),
  ).toBe(false);
  await loser
    .getByRole('button', { name: 'Gespeicherten Stand übernehmen' })
    .click();
  await expect(loser.locator('nav button[data-go="person"]')).toBeVisible();
});
test('real storage migration is one-time and confirmed cleanup preserves referenced original bytes', async ({
  page,
}) => {
  await page.addInitScript(
    ({ key, project }) => {
      if (!localStorage.getItem(key))
        localStorage.setItem(key, JSON.stringify(project));
    },
    { key: STORAGE_KEY, project: legacy },
  );
  await page.goto('/');
  await expect(page.getByLabel('Dein persönlicher Brief')).toHaveValue(
    legacy.writing.letter,
  );
  expect((await readStoredProject(page)).schemaVersion).toBe(2);
  await page
    .getByLabel('Dein persönlicher Brief')
    .fill('Canonical updated letter');
  await readStoredProject(page);
  await page.reload();
  await expect(page.getByLabel('Dein persönlicher Brief')).toHaveValue(
    'Canonical updated letter',
  );
  await page
    .getByText('Fotos & Erinnerungsmomente hinzufügen', { exact: true })
    .click();
  const jpg = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 2;
    return canvas.toDataURL('image/jpeg').split(',')[1];
  });
  await page.getByLabel('Fotos auswählen oder hierher ziehen').setInputFiles({
    name: 'keep.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from(jpg, 'base64'),
  });
  await expect(page.locator('.photo-editor')).toHaveCount(1);
  const saved = await readStoredProject(page);
  const source = saved.media[0].source;
  expect(source.type).toBe('local');
  await page
    .getByRole('button', { name: 'Meine Geschenke & Sicherung' })
    .click();
  await page
    .getByRole('button', { name: 'Unbenutzte Fotodaten bereinigen' })
    .click();
  await page
    .getByRole('button', { name: 'Fotodaten bereinigen', exact: true })
    .click();
  await expect(page.locator('#notice')).toContainText('wurden bereinigt');
  const downloadEvent = page.waitForEvent('download');
  await page
    .getByRole('button', { name: 'Original auf diesem Gerät sichern' })
    .click();
  const file = await downloadEvent;
  expect(await readFile((await file.path())!)).toEqual(
    Buffer.from(jpg, 'base64'),
  );
  await page
    .getByRole('button', { name: 'Aus diesem Geschenk entfernen' })
    .click();
  await expect(page.locator('.photo-editor')).toHaveCount(0);
  await page
    .getByRole('button', { name: 'Meine Geschenke & Sicherung' })
    .click();
  await page
    .getByRole('button', { name: 'Unbenutzte Fotodaten bereinigen' })
    .click();
  await page
    .getByRole('button', { name: 'Fotodaten bereinigen', exact: true })
    .click();
  await expect(page.locator('#notice')).toContainText('wurden bereinigt');
  const remaining = await page.evaluate(
    () =>
      new Promise<number>((resolve, reject) => {
        const request = indexedDB.open('bes-media', 2);
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction('assets', 'readonly');
          const count = tx.objectStore('assets').count();
          count.onsuccess = () => resolve(count.result);
          tx.oncomplete = () => db.close();
          tx.onabort = () => reject(tx.error);
        };
      }),
  );
  expect(remaining).toBe(0);
});

test('normal notifications warn an open editor immediately after confirmed deletion', async ({
  page,
  context,
}) => {
  await writing(page);
  const other = await context.newPage();
  await other.goto('/');
  await expect(other.getByLabel('Dein persönlicher Brief')).toHaveValue(
    'Original letter',
  );
  await page
    .getByRole('button', { name: 'Meine Geschenke & Sicherung' })
    .click();
  await page
    .getByRole('button', { name: 'Aktuelles Geschenk löschen' })
    .click();
  await page.getByRole('button', { name: 'Endgültig löschen' }).click();
  await expect(other.locator('#conflict-panel')).toBeVisible();
  await expect(other.getByLabel('Dein persönlicher Brief')).toHaveValue(
    'Original letter',
  );
});

test('future/corrupt canonical data stays protected and can be backed up without interpretation', async ({
  page,
}) => {
  await page.goto('/');
  await readWorkspace(page);
  await page.evaluate(
    () =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('bes-media', 2);
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction('workspace', 'readwrite');
          tx.objectStore('workspace').put(
            { storageVersion: 99, privateSentinel: 'RECOVERY_ONLY' },
            'current',
          );
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onabort = () => reject(tx.error);
        };
      }),
  );
  await page.reload();
  await expect(
    page.getByRole('heading', {
      name: 'Dein vorhandener Entwurf bleibt geschützt.',
    }),
  ).toBeVisible();
  const event = page.waitForEvent('download');
  await page
    .getByRole('button', { name: 'Gespeicherte Daten sichern' })
    .click();
  const file = await event;
  const raw = JSON.parse(await readFile((await file.path())!, 'utf8'));
  expect(raw.workspace).toEqual({
    storageVersion: 99,
    privateSentinel: 'RECOVERY_ONLY',
  });
  await expect(page.locator('#notice')).toContainText(
    'keine normale Importdatei',
  );
});
