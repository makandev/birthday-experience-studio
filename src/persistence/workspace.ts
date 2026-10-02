import { z } from 'zod';
import {
  createProject,
  parseProject,
  safeId,
  type CreatorProject,
} from '../domain/project';
import { parseBoundedJson } from '../security/json';
import { readLibrary, MAX_SAVED_PROJECTS, LIBRARY_KEY } from './library';
import { STORAGE_KEY, type StorageLike } from './storage';
import { localDatabase, type LocalDatabase } from './database';
import type { MediaAsset } from '../media/store';
import { mediaBudget } from '../media/budgets';

const revision = z
  .number()
  .int()
  .nonnegative()
  .max(Number.MAX_SAFE_INTEGER - 1);
const entrySchema = z
  .object({ project: z.unknown(), revision, recovery: z.unknown().optional() })
  .strict();
const workspaceSchema = z
  .object({
    storageVersion: z.literal(1),
    revision,
    writerId: safeId,
    updatedAt: z.string().datetime(),
    activeId: safeId,
    entries: z
      .array(entrySchema)
      .min(1)
      .max(MAX_SAVED_PROJECTS + 1),
    cleanupBlocked: z.boolean(),
  })
  .strict();
export interface ProjectRecord {
  project: CreatorProject;
  revision: number;
  recovery?: CreatorProject;
}
export interface Workspace {
  storageVersion: 1;
  revision: number;
  writerId: string;
  updatedAt: string;
  activeId: string;
  entries: ProjectRecord[];
  cleanupBlocked: boolean;
}
export class StorageConflict extends Error {
  constructor(readonly latest: Workspace) {
    super(
      'Ein anderer Tab hat neuere Daten gespeichert oder ein Geschenk gelöscht.',
    );
  }
}
export class ProtectedStorage extends Error {}
export function validateWorkspace(input: unknown): Workspace {
  try {
    const raw = workspaceSchema.parse(input);
    const entries = raw.entries.map((entry) => {
      const project = parseProject(
        parseBoundedJson(JSON.stringify(entry.project)),
      );
      const recovery =
        entry.recovery === undefined
          ? undefined
          : parseProject(parseBoundedJson(JSON.stringify(entry.recovery)));
      if (
        entry.revision > raw.revision ||
        (recovery && recovery.id !== project.id)
      )
        throw new Error('Invalid revision/recovery');
      return {
        project,
        revision: entry.revision,
        ...(recovery ? { recovery } : {}),
      };
    });
    if (
      new Set(entries.map((e) => e.project.id)).size !== entries.length ||
      !entries.some((e) => e.project.id === raw.activeId)
    )
      throw new Error('Invalid project membership');
    return { ...raw, entries };
  } catch {
    throw new ProtectedStorage(
      'Die gespeicherten Daten sind beschädigt oder benötigen eine andere BES-Version. Sie bleiben unverändert.',
    );
  }
}
export function assetReferences(project: CreatorProject): Set<string> {
  // All media references count, including unused/disabled blocks and future media kinds.
  return new Set(
    project.media.flatMap((media) =>
      media.source.type === 'local' ? [media.source.assetId] : [],
    ),
  );
}
export function workspaceReferences(workspace: Workspace): Set<string> {
  return new Set(
    workspace.entries.flatMap((entry) => [
      ...assetReferences(entry.project),
      ...(entry.recovery ? [...assetReferences(entry.recovery)] : []),
    ]),
  );
}
export function migrateLegacy(
  storage: StorageLike,
  writerId: string,
  fresh = createProject(),
): Workspace {
  let active: string | null;
  let library: CreatorProject[];
  let backup: string | null;
  try {
    active = storage.getItem(STORAGE_KEY);
    library = readLibrary(storage);
    backup = storage.getItem(`${STORAGE_KEY}.backup`);
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'SecurityError')
      throw cause;
    throw new ProtectedStorage(
      'Die bisherige Sammlung ist nicht lesbar. Sie bleibt unverändert.',
    );
  }
  try {
    const project =
      active === null ? fresh : parseProject(parseBoundedJson(active));
    const entries: ProjectRecord[] = library
      .filter((p) => p.id !== project.id)
      .map((p) => ({ project: p, revision: 0 }));
    const duplicate = library.find((p) => p.id === project.id);
    if (duplicate && JSON.stringify(duplicate) !== JSON.stringify(project))
      throw new Error('Ambiguous legacy duplicates');
    entries.push({ project, revision: 0 });
    let cleanupBlocked = false;
    if (backup) {
      try {
        const recovered = parseProject(parseBoundedJson(backup));
        const entry = entries.find((e) => e.project.id === recovered.id);
        if (entry) entry.recovery = recovered;
        else if (entries.length < MAX_SAVED_PROJECTS + 1)
          entries.push({ project: recovered, revision: 0 });
        else cleanupBlocked = true;
      } catch {
        cleanupBlocked = true;
      }
    }
    return validateWorkspace({
      storageVersion: 1,
      revision: 0,
      writerId,
      updatedAt: new Date().toISOString(),
      activeId: project.id,
      entries,
      cleanupBlocked,
    });
  } catch {
    throw new ProtectedStorage(
      'Dein vorhandener Entwurf bleibt geschützt. Sichere ihn, bevor du bewusst neu beginnst.',
    );
  }
}
export type WorkspaceChange =
  | { kind: 'save'; project: CreatorProject; recovery?: CreatorProject }
  | { kind: 'activate'; project: CreatorProject; current: CreatorProject }
  | { kind: 'delete'; projectId: string }
  | { kind: 'cleanup'; releaseRecovery: boolean };

export class WorkspaceRepository {
  constructor(
    readonly writerId: string = crypto.randomUUID(),
    private database: LocalDatabase = localDatabase,
  ) {}
  async read(): Promise<Workspace | undefined> {
    const db = await this.database.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('workspace', 'readonly');
      const request = tx.objectStore('workspace').get('current');
      let result: Workspace | undefined;
      request.onsuccess = () => {
        try {
          result =
            request.result === undefined
              ? undefined
              : validateWorkspace(request.result);
        } catch (cause) {
          reject(cause);
        }
      };
      tx.oncomplete = () => resolve(result);
      tx.onabort = () =>
        reject(new Error('Der lokale Speicher konnte nicht gelesen werden.'));
    });
  }
  async recoveryBackup(): Promise<string> {
    const db = await this.database.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('workspace', 'readonly');
      const roots = tx.objectStore('workspace');
      const current = roots.get('current');
      const journal = roots.get('legacy-retirement');
      tx.oncomplete = () => {
        try {
          resolve(
            JSON.stringify(
              {
                format: 'bes-storage-recovery',
                version: 1,
                workspace: current.result,
                retirement: journal.result,
              },
              null,
              2,
            ),
          );
        } catch {
          reject(
            new Error(
              'Die gespeicherten Daten konnten nicht als Datei gesichert werden.',
            ),
          );
        }
      };
      tx.onabort = () =>
        reject(
          new Error('Die gespeicherten Daten konnten nicht gelesen werden.'),
        );
    });
  }
  async initialize(
    storage: StorageLike,
    ignoreLegacy = false,
  ): Promise<Workspace> {
    const existing = await this.read();
    if (existing) {
      await this.finishMigration(storage);
      return existing;
    }
    const keys = [STORAGE_KEY, LIBRARY_KEY, `${STORAGE_KEY}.backup`];
    const sources = ignoreLegacy
      ? []
      : keys.flatMap((key) => {
          const raw = storage.getItem(key);
          return raw === null ? [] : [{ key, raw }];
        });
    const snapshot: StorageLike = {
      getItem: (key) =>
        sources.find((source) => source.key === key)?.raw ?? null,
      setItem: () => {},
      removeItem: () => {},
    };
    const initial = ignoreLegacy
      ? { ...migrateLegacy(snapshot, this.writerId), cleanupBlocked: true }
      : migrateLegacy(snapshot, this.writerId);
    const retirement = sources.filter((source) => {
      if (source.key !== `${STORAGE_KEY}.backup`) return true;
      try {
        const project = parseProject(parseBoundedJson(source.raw));
        return initial.entries.some((entry) => entry.project.id === project.id);
      } catch {
        return false;
      }
    });
    const db = await this.database.open();
    const result = await new Promise<Workspace>((resolve, reject) => {
      const tx = db.transaction(['workspace', 'assets'], 'readwrite');
      const store = tx.objectStore('workspace');
      const request = store.get('current');
      let result: Workspace;
      let failure: unknown;
      request.onsuccess = () => {
        try {
          result =
            request.result === undefined
              ? initial
              : validateWorkspace(request.result);
          if (request.result === undefined) {
            store.add(result, 'current');
            if (retirement.length) store.add(retirement, 'legacy-retirement');
            if (!result.cleanupBlocked) {
              const retained = workspaceReferences(result);
              const binaries = tx.objectStore('assets');
              const cursor = binaries.openKeyCursor();
              cursor.onsuccess = () => {
                const item = cursor.result;
                if (!item) return;
                if (typeof item.key !== 'string' || !retained.has(item.key))
                  binaries.delete(item.key);
                item.continue();
              };
            }
          }
        } catch (cause) {
          failure = cause;
          tx.abort();
        }
      };
      tx.oncomplete = () => resolve(result);
      tx.onabort = () =>
        reject(
          failure ??
            new Error('Speichern nicht möglich – Seite bitte offen lassen'),
        );
      tx.onerror = () => {};
    });
    await this.finishMigration(storage);
    return result;
  }
  private async finishMigration(storage: StorageLike): Promise<void> {
    const db = await this.database.open();
    const raw = await new Promise<unknown>((resolve, reject) => {
      const tx = db.transaction('workspace', 'readonly');
      const read = tx.objectStore('workspace').get('legacy-retirement');
      read.onsuccess = () => resolve(read.result);
      tx.onabort = () =>
        reject(new Error('Die Migration konnte nicht gelesen werden.'));
    });
    if (raw === undefined) return;
    const sources = z
      .array(
        z
          .object({
            key: z.enum([STORAGE_KEY, LIBRARY_KEY, `${STORAGE_KEY}.backup`]),
            raw: z.string().max(6 * 1024 * 1024),
          })
          .strict(),
      )
      .max(3)
      .parse(raw);
    // Remove only the exact legacy values atomically copied to IDB. A crash between
    // removals leaves this journal; missing keys are already retired on retry.
    for (const source of sources) {
      const current = storage.getItem(source.key);
      if (current !== null && current !== source.raw)
        throw new ProtectedStorage(
          'Ein älterer BES-Tab hat während der Migration Daten geändert. Sichere diese Daten und schließe ältere Tabs; sie bleiben unverändert.',
        );
    }
    for (const source of sources) storage.removeItem(source.key);
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('workspace', 'readwrite');
      tx.objectStore('workspace').delete('legacy-retirement');
      tx.oncomplete = () => resolve();
      tx.onabort = () =>
        reject(
          new Error(
            'Die Migration wurde noch nicht vollständig abgeschlossen.',
          ),
        );
    });
  }
  async commit(
    expectedRevision: number,
    change: WorkspaceChange,
    assets: MediaAsset[] = [],
  ): Promise<{ workspace: Workspace; removedAssets: number }> {
    const db = await this.database.open();
    return new Promise((resolve, reject) => {
      // IDB serializes overlapping readwrite transactions across connections/tabs.
      const tx = db.transaction(['workspace', 'assets'], 'readwrite');
      const roots = tx.objectStore('workspace');
      const binaries = tx.objectStore('assets');
      let result: Workspace;
      let failure: unknown;
      let removedAssets = 0;
      let migrationPending = false;
      const migration = roots.get('legacy-retirement');
      migration.onsuccess = () => {
        migrationPending = migration.result !== undefined;
      };
      const request = roots.get('current');
      request.onsuccess = () => {
        try {
          if (migrationPending)
            throw new ProtectedStorage(
              'Die Migration ist noch nicht vollständig abgeschlossen. Bitte lade neu und schließe ältere BES-Tabs.',
            );
          const before = validateWorkspace(request.result);
          if (before.revision !== expectedRevision)
            throw new StorageConflict(before);
          result = structuredClone(before);
          const oldRefs = workspaceReferences(before);
          const nextRevision = before.revision + 1;
          if (change.kind === 'save') {
            const entry = result.entries.find(
              (e) => e.project.id === change.project.id,
            );
            if (!entry) throw new StorageConflict(before);
            entry.project = parseProject(change.project);
            entry.revision = nextRevision;
            entry.recovery = change.recovery
              ? parseProject(change.recovery)
              : undefined;
          } else if (change.kind === 'activate') {
            const current = result.entries.find(
              (e) => e.project.id === change.current.id,
            );
            if (!current) throw new StorageConflict(before);
            current.project = parseProject(change.current);
            current.revision = nextRevision;
            const next = result.entries.find(
              (e) => e.project.id === change.project.id,
            );
            if (!next)
              result.entries.push({
                project: parseProject(change.project),
                revision: nextRevision,
              });
            result.activeId = change.project.id;
          } else if (change.kind === 'delete') {
            result.entries = result.entries.filter(
              (e) => e.project.id !== change.projectId,
            );
            if (!result.entries.length)
              result.entries.push({
                project: createProject(),
                revision: nextRevision,
              });
            if (!result.entries.some((e) => e.project.id === result.activeId))
              result.activeId = result.entries[0].project.id;
          } else if (change.releaseRecovery) {
            result.entries.forEach((entry) => {
              delete entry.recovery;
            });
          }
          result.revision = nextRevision;
          result.writerId = this.writerId;
          result.updatedAt = new Date().toISOString();
          result = validateWorkspace(result);
          const retained = workspaceReferences(result);
          if (
            assets.length &&
            change.kind !== 'save' &&
            change.kind !== 'activate'
          )
            throw new Error('Unexpected assets');
          for (const asset of assets) {
            safeId.parse(asset.id);
            if (
              !retained.has(asset.id) ||
              !(asset.processed instanceof Blob) ||
              asset.processed.type !== 'image/jpeg' ||
              !asset.processed.size ||
              (asset.original !== null && !(asset.original instanceof Blob)) ||
              !Number.isInteger(asset.width) ||
              !Number.isInteger(asset.height) ||
              asset.width < 1 ||
              asset.height < 1 ||
              Math.max(asset.width, asset.height) >
                mediaBudget.maxRenderedEdge ||
              asset.width * asset.height > mediaBudget.maxRenderedPixels ||
              asset.processed.size > mediaBudget.maxRenderedBytes ||
              (asset.original &&
                asset.original.size > mediaBudget.maxOriginalBytes)
            )
              throw new Error('Ungültige Fotodaten.');
            // add, never put: original bytes are immutable; collisions abort everything.
            binaries.add(asset);
          }
          if (change.kind === 'cleanup') {
            if (result.cleanupBlocked)
              throw new ProtectedStorage(
                'Eine alte Sicherung ist nicht vollständig lesbar. Automatische Löschung von Fotos bleibt gesperrt.',
              );
            const cursor = binaries.openKeyCursor();
            cursor.onsuccess = () => {
              const item = cursor.result;
              if (!item) return;
              if (typeof item.key !== 'string' || !retained.has(item.key)) {
                binaries.delete(item.key);
                removedAssets++;
              }
              item.continue();
            };
          } else if (!result.cleanupBlocked) {
            // Normal edits only inspect former references; no whole binary scan.
            for (const id of oldRefs)
              if (!retained.has(id)) binaries.delete(id);
          }
          roots.put(result, 'current');
        } catch (cause) {
          failure = cause;
          tx.abort();
        }
      };
      tx.oncomplete = () => resolve({ workspace: result, removedAssets });
      tx.onabort = () =>
        reject(
          failure ??
            new Error(
              'Speichern nicht möglich – der lokale Speicher ist voll oder nicht verfügbar. Deine bisherigen Daten bleiben erhalten.',
            ),
        );
      tx.onerror = () => {};
    });
  }
}
