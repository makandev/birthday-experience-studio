import { describe, it, expect, vi } from 'vitest';
import { IDBFactory, IDBObjectStore } from 'fake-indexeddb';
import { LocalDatabase } from '../src/persistence/database';
import {
  WorkspaceRepository,
  StorageConflict,
  ProtectedStorage,
} from '../src/persistence/workspace';
import { createProject, type CreatorProject } from '../src/domain/project';
import { STORAGE_KEY, type StorageLike } from '../src/persistence/storage';
import { LIBRARY_KEY } from '../src/persistence/library';
import { BrowserAssetStore, type MediaAsset } from '../src/media/store';
import legacy from './fixtures/project-v1.json' with { type: 'json' };
const storage = (): StorageLike => {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => {
      map.set(k, v);
    },
    removeItem: (k) => {
      map.delete(k);
    },
  };
};
const asset = (id: string): MediaAsset => ({
  id,
  original: new Blob(['original']),
  processed: new Blob(['copy'], { type: 'image/jpeg' }),
  width: 1,
  height: 1,
});
function photo(project: CreatorProject, id: string) {
  project.media.push({
    id: 'media-' + id,
    kind: 'image',
    name: 'photo',
    mimeType: 'image/jpeg',
    size: 4,
    source: { type: 'local', assetId: id },
  });
}
async function setup() {
  const factory = new IDBFactory();
  const db = new LocalDatabase(() => factory);
  const repo = new WorkspaceRepository('writer-a', db);
  const other = new WorkspaceRepository(
    'writer-b',
    new LocalDatabase(() => factory),
  );
  const workspace = await repo.initialize(storage());
  return {
    db,
    repo,
    other,
    workspace,
    store: new BrowserAssetStore(db),
    project: workspace.entries[0].project,
  };
}
describe('atomic workspace and asset lifecycle', () => {
  it('deletes projects without assets and always leaves a valid active workspace', async () => {
    const { repo, workspace, project } = await setup();
    const result = await repo.commit(workspace.revision, {
      kind: 'delete',
      projectId: project.id,
    });
    expect(result.workspace.entries).toHaveLength(1);
    expect(result.workspace.activeId).not.toBe(project.id);
    expect(result.workspace.revision).toBe(1);
  });
  it('deletes exclusively owned originals and derivatives together', async () => {
    const { repo, project, store } = await setup();
    photo(project, 'owned');
    const saved = await repo.commit(0, { kind: 'save', project }, [
      asset('owned'),
    ]);
    await repo.commit(saved.workspace.revision, {
      kind: 'delete',
      projectId: project.id,
    });
    expect(await store.get('owned')).toBeUndefined();
  });
  it('protects a shared asset until the last project reference is removed', async () => {
    const { repo, project, store } = await setup();
    photo(project, 'shared');
    await repo.commit(0, { kind: 'save', project }, [asset('shared')]);
    const second = createProject();
    photo(second, 'shared');
    await repo.commit(1, {
      kind: 'activate',
      current: project,
      project: second,
    });
    await repo.commit(2, { kind: 'delete', projectId: project.id });
    expect(await store.get('shared')).toBeDefined();
    await repo.commit(3, { kind: 'delete', projectId: second.id });
    expect(await store.get('shared')).toBeUndefined();
  });
  it('retains disabled/unused media and recovery assets; explicit cleanup releases undo', async () => {
    const { repo, project, store } = await setup();
    photo(project, 'undo');
    await repo.commit(0, { kind: 'save', project }, [asset('undo')]);
    const recovery = structuredClone(project);
    project.media = [];
    await repo.commit(1, { kind: 'save', project, recovery });
    await repo.commit(2, { kind: 'cleanup', releaseRecovery: false });
    expect(await store.get('undo')).toBeDefined();
    await repo.commit(3, { kind: 'cleanup', releaseRecovery: true });
    expect(await store.get('undo')).toBeUndefined();
  });
  it('removes orphan bytes, including historical failed imports, idempotently', async () => {
    const { repo, store } = await setup();
    await store.putMany([asset('orphan')]);
    const first = await repo.commit(0, {
      kind: 'cleanup',
      releaseRecovery: false,
    });
    expect(first.removedAssets).toBe(1);
    const second = await repo.commit(first.workspace.revision, {
      kind: 'cleanup',
      releaseRecovery: false,
    });
    expect(second.removedAssets).toBe(0);
    expect(await store.get('orphan')).toBeUndefined();
  });
  it('removes replaced assets without a full storage scan', async () => {
    const { repo, project, store } = await setup();
    photo(project, 'old');
    await repo.commit(0, { kind: 'save', project }, [asset('old')]);
    project.media = [];
    photo(project, 'new');
    await repo.commit(1, { kind: 'save', project }, [asset('new')]);
    expect(await store.get('old')).toBeUndefined();
    expect(await store.get('new')).toBeDefined();
  });
  it('missing/broken asset bytes do not prevent deletion; invalid roots block all destructive cleanup', async () => {
    const { repo, project, db } = await setup();
    photo(project, 'missing');
    await repo.commit(0, { kind: 'save', project });
    await expect(
      repo.commit(1, { kind: 'delete', projectId: project.id }),
    ).resolves.toBeDefined();
    const connection = await db.open();
    await new Promise<void>((resolve) => {
      const tx = connection.transaction('workspace', 'readwrite');
      tx.objectStore('workspace').put({ storageVersion: 99 }, 'current');
      tx.oncomplete = () => resolve();
    });
    await expect(
      repo.commit(2, { kind: 'cleanup', releaseRecovery: true }),
    ).rejects.toBeInstanceOf(ProtectedStorage);
    expect(JSON.parse(await repo.recoveryBackup()).workspace).toEqual({
      storageVersion: 99,
    });
  });
  it('missing/corrupt referenced blobs stay protected while non-referenceable orphan keys are reclaimed', async () => {
    const { repo, project, db, store } = await setup();
    photo(project, 'corrupt-but-referenced');
    await repo.commit(0, { kind: 'save', project });
    const connection = await db.open();
    await new Promise<void>((resolve) => {
      const tx = connection.transaction('assets', 'readwrite');
      tx.objectStore('assets').put({
        id: 'corrupt-but-referenced',
        processed: null,
      });
      tx.objectStore('assets').put({ id: 17, processed: null });
      tx.oncomplete = () => resolve();
    });
    const cleaned = await repo.commit(1, {
      kind: 'cleanup',
      releaseRecovery: false,
    });
    expect(cleaned.removedAssets).toBe(1);
    expect(await store.get('corrupt-but-referenced')).toBeDefined();
    await repo.commit(2, { kind: 'delete', projectId: project.id });
    expect(await store.get('corrupt-but-referenced')).toBeUndefined();
  });
  it('asset collisions and aborted imports roll back both projects and assets', async () => {
    const { repo, project, store } = await setup();
    photo(project, 'exists');
    await repo.commit(0, { kind: 'save', project }, [asset('exists')]);
    const next = createProject();
    photo(next, 'new');
    photo(next, 'exists');
    await expect(
      repo.commit(1, { kind: 'activate', current: project, project: next }, [
        asset('new'),
        asset('exists'),
      ]),
    ).rejects.toThrow();
    expect((await repo.read())!.entries).toHaveLength(1);
    expect(await store.get('new')).toBeUndefined();
    expect((await store.get('exists'))!.original!.size).toBe(8);
  });
  it('quota/data errors abort both stores without losing the prior project', async () => {
    const { repo, project, store } = await setup();
    photo(project, 'quota-photo');
    const hook = vi
      .spyOn(IDBObjectStore.prototype, 'add')
      .mockImplementation(() => {
        throw new DOMException('Full', 'QuotaExceededError');
      });
    try {
      await expect(
        repo.commit(0, { kind: 'save', project }, [asset('quota-photo')]),
      ).rejects.toThrow('Full');
    } finally {
      hook.mockRestore();
    }
    expect((await repo.read())!.entries[0].project.media).toHaveLength(0);
    expect((await repo.read())!.revision).toBe(0);
    expect(await store.get('quota-photo')).toBeUndefined();
    await expect(
      repo.commit(0, { kind: 'save', project }, [asset('quota-photo')]),
    ).resolves.toBeDefined();
  });
  it('refuses over-capacity activation without evicting projects or leaking assets', async () => {
    const { repo, project, store } = await setup();
    let current = project;
    for (let revision = 0; revision < 8; revision++) {
      const next = createProject();
      await repo.commit(revision, { kind: 'activate', current, project: next });
      current = next;
    }
    const next = createProject();
    photo(next, 'overflow');
    await expect(
      repo.commit(8, { kind: 'activate', current, project: next }, [
        asset('overflow'),
      ]),
    ).rejects.toThrow();
    expect((await repo.read())!.entries).toHaveLength(9);
    expect(await store.get('overflow')).toBeUndefined();
  });
  it('rejects unreferenced imports without leaking bytes', async () => {
    const { repo, project, store } = await setup();
    await expect(
      repo.commit(0, { kind: 'save', project }, [asset('orphan')]),
    ).rejects.toThrow();
    expect(await store.get('orphan')).toBeUndefined();
    expect((await repo.read())!.revision).toBe(0);
  });
});
describe('revision checks inside real overlapping IDB transactions', () => {
  it('rejects an older tab writing over a newer project', async () => {
    const { repo, other, project } = await setup();
    const stale = structuredClone(project);
    project.writing.letter = 'newer';
    await repo.commit(0, { kind: 'save', project });
    stale.writing.letter = 'stale';
    await expect(
      other.commit(0, { kind: 'save', project: stale }),
    ).rejects.toBeInstanceOf(StorageConflict);
    expect((await repo.read())!.entries[0].project.writing.letter).toBe(
      'newer',
    );
  });
  it('simultaneous autosaves have one winner and one explicit conflict', async () => {
    const { repo, other, project } = await setup();
    const next = structuredClone(project);
    next.writing.letter = 'other';
    const results = await Promise.allSettled([
      repo.commit(0, { kind: 'save', project }),
      other.commit(0, { kind: 'save', project: next }),
    ]);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    const rejected = results.find((r) => r.status === 'rejected');
    expect(rejected?.status === 'rejected' && rejected.reason).toBeInstanceOf(
      StorageConflict,
    );
    expect((await repo.read())!.revision).toBe(1);
  });
  it('deletion fences an open editor and stale deletion cannot erase a newer save', async () => {
    const { repo, other, project } = await setup();
    await repo.commit(0, { kind: 'delete', projectId: project.id });
    await expect(
      other.commit(0, { kind: 'save', project }),
    ).rejects.toBeInstanceOf(StorageConflict);
    const fresh = (await repo.read())!;
    const active = fresh.entries[0].project;
    await repo.commit(1, { kind: 'save', project: active });
    await expect(
      other.commit(1, { kind: 'delete', projectId: active.id }),
    ).rejects.toBeInstanceOf(StorageConflict);
    expect((await repo.read())!.activeId).toBe(active.id);
  });
});
describe('one-time legacy migration', () => {
  it('migrates historical active/library/backup data and preserves original media DB v1', async () => {
    const factory = new IDBFactory();
    await new Promise<void>((resolve) => {
      const request = factory.open('bes-media', 1);
      request.onupgradeneeded = () =>
        request.result.createObjectStore('assets', { keyPath: 'id' });
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction('assets', 'readwrite');
        tx.objectStore('assets').put(asset('legacy-asset'));
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
      };
    });
    const db = new LocalDatabase(() => factory);
    const repo = new WorkspaceRepository('migration', db);
    const old = storage();
    old.setItem(STORAGE_KEY, JSON.stringify(legacy));
    const archived = createProject();
    photo(archived, 'legacy-asset');
    old.setItem(LIBRARY_KEY, JSON.stringify([archived]));
    const migrated = await repo.initialize(old);
    expect(migrated.entries).toHaveLength(2);
    expect(migrated.entries[1].project.schemaVersion).toBe(2);
    expect(migrated.entries[1].project.writing).toEqual(legacy.writing);
    await repo.commit(0, { kind: 'cleanup', releaseRecovery: false });
    expect(await new BrowserAssetStore(db).get('legacy-asset')).toBeDefined();
    old.setItem(STORAGE_KEY, 'broken stale legacy tab');
    expect((await repo.initialize(old)).entries).toHaveLength(2);
  });
  it('preserves malformed partial legacy state and suppresses GC for unknown backup references', async () => {
    const { db } = await setup();
    const repo = new WorkspaceRepository(
      'new',
      new LocalDatabase(() => new IDBFactory()),
    );
    const old = storage();
    old.setItem(LIBRARY_KEY, 'broken');
    await expect(repo.initialize(old)).rejects.toBeInstanceOf(ProtectedStorage);
    expect(old.getItem(LIBRARY_KEY)).toBe('broken');
    expect(await repo.read()).toBeUndefined();
    old.removeItem(LIBRARY_KEY);
    old.setItem(`${STORAGE_KEY}.backup`, 'unreadable backup');
    const migrated = await repo.initialize(old);
    expect(migrated.cleanupBlocked).toBe(true);
    await expect(
      repo.commit(0, { kind: 'cleanup', releaseRecovery: true }),
    ).rejects.toBeInstanceOf(ProtectedStorage);
    await db.close();
  });
  it('resumes a crash during legacy retirement; blocks mutation until sources are retired', async () => {
    const factory = new IDBFactory();
    const db = new LocalDatabase(() => factory);
    const repo = new WorkspaceRepository('migration', db);
    const old = storage();
    old.setItem(STORAGE_KEY, JSON.stringify(legacy));
    old.setItem(LIBRARY_KEY, JSON.stringify([createProject()]));
    let removed = 0;
    const interrupted: StorageLike = {
      ...old,
      removeItem(key) {
        if (++removed === 2) throw new Error('crash');
        old.removeItem(key);
      },
    };
    await expect(repo.initialize(interrupted)).rejects.toThrow('crash');
    expect(await repo.read()).toBeDefined();
    expect(old.getItem(STORAGE_KEY)).toBeNull();
    const existing = (await repo.read())!;
    await expect(
      repo.commit(0, { kind: 'delete', projectId: existing.activeId }),
    ).rejects.toBeInstanceOf(ProtectedStorage);
    const recovered = await repo.initialize(old);
    expect(recovered.entries).toHaveLength(2);
    expect(old.getItem(LIBRARY_KEY)).toBeNull();
    await expect(
      repo.commit(0, { kind: 'delete', projectId: recovered.activeId }),
    ).resolves.toBeDefined();
  });
  it('protects legacy values changed while a migration is pending', async () => {
    const db = new LocalDatabase(() => new IDBFactory());
    const repo = new WorkspaceRepository('migration', db);
    const old = storage();
    old.setItem(STORAGE_KEY, JSON.stringify(legacy));
    const blocked: StorageLike = {
      ...old,
      removeItem() {
        throw new Error('blocked removal');
      },
    };
    await expect(repo.initialize(blocked)).rejects.toThrow();
    old.setItem(STORAGE_KEY, 'different legacy value');
    await expect(repo.initialize(old)).rejects.toBeInstanceOf(ProtectedStorage);
    expect(old.getItem(STORAGE_KEY)).toBe('different legacy value');
  });
  it('initial migration reclaims only historical orphans and retains valid backup recovery roots', async () => {
    const factory = new IDBFactory();
    const db = new LocalDatabase(() => factory);
    const store = new BrowserAssetStore(db);
    await store.putMany([asset('used'), asset('recovery'), asset('orphan')]);
    const old = storage();
    const project = createProject();
    photo(project, 'used');
    const recovery = structuredClone(project);
    recovery.media = [];
    photo(recovery, 'recovery');
    old.setItem(STORAGE_KEY, JSON.stringify(project));
    old.setItem(`${STORAGE_KEY}.backup`, JSON.stringify(recovery));
    const repo = new WorkspaceRepository('migration', db);
    const migrated = await repo.initialize(old);
    expect(migrated.entries[0].recovery?.media[0].source).toEqual({
      type: 'local',
      assetId: 'recovery',
    });
    expect(await store.get('used')).toBeDefined();
    expect(await store.get('recovery')).toBeDefined();
    expect(await store.get('orphan')).toBeUndefined();
    expect(old.getItem(STORAGE_KEY)).toBeNull();
    expect(old.getItem(`${STORAGE_KEY}.backup`)).toBeNull();
    await repo.commit(0, { kind: 'delete', projectId: project.id });
    expect(await store.get('used')).toBeUndefined();
    expect(await store.get('recovery')).toBeUndefined();
  });
  it('aborted migration leaves all legacy and media bytes recoverable', async () => {
    const db = new LocalDatabase(() => new IDBFactory());
    const store = new BrowserAssetStore(db);
    await store.putMany([asset('unreferenced')]);
    const repo = new WorkspaceRepository('migration', db);
    const old = storage();
    old.setItem(STORAGE_KEY, JSON.stringify(legacy));
    const hook = vi
      .spyOn(IDBObjectStore.prototype, 'add')
      .mockImplementation(() => {
        throw new DOMException('Full', 'QuotaExceededError');
      });
    try {
      await expect(repo.initialize(old)).rejects.toThrow('Full');
    } finally {
      hook.mockRestore();
    }
    expect(await repo.read()).toBeUndefined();
    expect(old.getItem(STORAGE_KEY)).toBe(JSON.stringify(legacy));
    expect(await store.get('unreferenced')).toBeDefined();
    await expect(repo.initialize(old)).resolves.toBeDefined();
  });
  it('unavailable IndexedDB can recover on a later attempt without caching rejection', async () => {
    const factory = new IDBFactory();
    let unavailable = true;
    const db = new LocalDatabase(() => {
      if (unavailable) throw new Error('unavailable');
      return factory;
    });
    const repo = new WorkspaceRepository('retry', db);
    await expect(repo.initialize(storage())).rejects.toThrow('unavailable');
    unavailable = false;
    await expect(repo.initialize(storage())).resolves.toBeDefined();
  });
});
