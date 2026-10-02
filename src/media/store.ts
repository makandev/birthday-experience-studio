import { localDatabase } from '../persistence/database';
export interface MediaAsset {
  id: string;
  original: Blob | null;
  processed: Blob;
  width: number;
  height: number;
}
export interface AssetStore {
  get(id: string): Promise<MediaAsset | undefined>;
  putMany(assets: MediaAsset[]): Promise<void>;
}
export class BrowserAssetStore implements AssetStore {
  constructor(private database = localDatabase) {}
  async get(id: string): Promise<MediaAsset | undefined> {
    const db = await this.database.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('assets', 'readonly');
      const request = tx.objectStore('assets').get(id);
      request.onsuccess = () =>
        resolve(request.result as MediaAsset | undefined);
      request.onerror = () =>
        reject(new Error('Dieses Foto konnte nicht gelesen werden.'));
    });
  }
  async putMany(assets: MediaAsset[]): Promise<void> {
    const db = await this.database.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('assets', 'readwrite');
      try {
        for (const asset of assets) tx.objectStore('assets').add(asset);
      } catch {
        tx.abort();
        reject(new Error('Das Foto konnte nicht gespeichert werden.'));
        return;
      }
      tx.oncomplete = () => resolve();
      tx.onabort = () =>
        reject(
          new Error(
            'Der Fotospeicher ist voll oder nicht verfügbar. Dein Geschenk bleibt erhalten.',
          ),
        );
      tx.onerror = () => {};
    });
  }
}
