import { parseBoundedJson } from '../security/json';
import { parseProject, type CreatorProject } from '../domain/project';
export const STORAGE_KEY = 'bes.creator-project.v1';
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
export type RestoreResult =
  | { status: 'empty' }
  | { status: 'restored'; project: CreatorProject }
  | { status: 'invalid' | 'unavailable' };
export function restoreProject(storage: StorageLike): RestoreResult {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw === null) return { status: 'empty' };
    try {
      return {
        status: 'restored',
        project: parseProject(parseBoundedJson(raw)),
      };
    } catch {
      return { status: 'invalid' };
    }
  } catch {
    return { status: 'unavailable' };
  }
}
