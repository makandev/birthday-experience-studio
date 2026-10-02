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
  private connection: Promise<IDBDatabase> | undefined;
  private db(): Promise<IDBDatabase> {
    if (!this.connection)
      this.connection = new Promise((resolve, reject) => {
        let request: IDBOpenDBRequest;
        try {
          request = indexedDB.open('bes-media', 1);
        } catch {
          reject(
            new Error(
              'Fotos können in diesem Browser gerade nicht gespeichert werden.',
            ),
          );
          return;
        }
        request.onupgradeneeded = () => {
          request.result.createObjectStore('assets', { keyPath: 'id' });
        };
        request.onsuccess = () => {
          const db = request.result;
          db.onversionchange = () => {
            db.close();
            this.connection = undefined;
          };
          resolve(db);
        };
        request.onerror = () =>
          reject(new Error('Der lokale Fotospeicher ist nicht verfügbar.'));
        request.onblocked = () =>
          reject(
            new Error('Bitte schließe andere BES-Tabs und versuche es erneut.'),
          );
      });
    return this.connection;
  }
  async get(id: string): Promise<MediaAsset | undefined> {
    const db = await this.db();
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
    const db = await this.db();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('assets', 'readwrite');
      try {
        for (const asset of assets) tx.objectStore('assets').put(asset);
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
