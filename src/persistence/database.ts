// Shared transaction domain: creator records and immutable media live in one DB.
export const DATABASE_NAME = 'bes-media';
export const DATABASE_VERSION = 2;
export class LocalDatabase {
  private connection?: Promise<IDBDatabase>;
  constructor(private factory: () => IDBFactory = () => indexedDB) {}
  open(): Promise<IDBDatabase> {
    if (!this.connection) {
      this.connection = new Promise<IDBDatabase>((resolve, reject) => {
        const request = this.factory().open(DATABASE_NAME, DATABASE_VERSION);
        let blocked = false;
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains('assets'))
            db.createObjectStore('assets', { keyPath: 'id' });
          if (!db.objectStoreNames.contains('workspace'))
            db.createObjectStore('workspace');
        };
        request.onsuccess = () => {
          const db = request.result;
          if (blocked) {
            db.close();
            return;
          }
          db.onversionchange = () => {
            db.close();
            this.connection = undefined;
          };
          resolve(db);
        };
        request.onerror = () =>
          reject(new Error('Der lokale Speicher ist nicht verfügbar.'));
        request.onblocked = () => {
          blocked = true;
          reject(
            new Error('Bitte schließe ältere BES-Tabs und versuche es erneut.'),
          );
        };
      }).catch((cause: unknown) => {
        this.connection = undefined;
        throw cause;
      });
    }
    return this.connection;
  }
  async close(): Promise<void> {
    const connection = this.connection;
    this.connection = undefined;
    if (connection) (await connection).close();
  }
}
export const localDatabase = new LocalDatabase();
