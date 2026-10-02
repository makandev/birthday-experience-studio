import { expect, type Page } from '@playwright/test';
import type { Workspace } from '../src/persistence/workspace';
export async function readWorkspace(page: Page): Promise<Workspace> {
  await expect(page.locator('#save-status')).toHaveText(
    'Auf diesem Gerät gespeichert',
  );
  return page.evaluate(
    () =>
      new Promise((resolve, reject) => {
        const request = indexedDB.open('bes-media', 2);
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction('workspace', 'readonly');
          const read = tx.objectStore('workspace').get('current');
          read.onsuccess = () => resolve(read.result);
          tx.oncomplete = () => db.close();
          tx.onabort = () => reject(tx.error);
        };
        request.onerror = () => reject(request.error);
      }),
  );
}
export async function readStoredProject(page: Page) {
  const workspace = await readWorkspace(page);
  return workspace.entries.find(
    (entry) => entry.project.id === workspace.activeId,
  )!.project;
}
