import { parseProject, type CreatorProject } from '../domain/project';
import { parseBoundedJson } from '../security/json';
import { STORAGE_KEY, type StorageLike } from './storage';
export const LIBRARY_KEY = 'bes.project-library.v1';
export const MAX_SAVED_PROJECTS = 8;
export function readLibrary(storage: StorageLike): CreatorProject[] {
  const raw = storage.getItem(LIBRARY_KEY);
  if (raw === null) return [];
  const data = parseBoundedJson(raw, 4 * 1024 * 1024);
  if (!Array.isArray(data) || data.length > MAX_SAVED_PROJECTS)
    throw new Error('Die Geschenksammlung konnte nicht gelesen werden.');
  const projects = data.map(parseProject);
  if (new Set(projects.map((p) => p.id)).size !== projects.length)
    throw new Error('Duplicate project');
  return projects;
}
// A failed save keeps both existing keys intact. Never silently evict a project.
export function replaceActiveProject(
  storage: StorageLike,
  current: CreatorProject,
  next: CreatorProject,
): boolean {
  let oldActive: string | null = null;
  let oldLibrary: string | null = null;
  let touched = false;
  try {
    oldActive = storage.getItem(STORAGE_KEY);
    oldLibrary = storage.getItem(LIBRARY_KEY);
    const collection = readLibrary(storage).filter(
      (p) => p.id !== next.id && p.id !== current.id,
    );
    collection.push(parseProject(current));
    if (collection.length > MAX_SAVED_PROJECTS) return false;
    const rawLibrary = JSON.stringify(collection);
    parseBoundedJson(rawLibrary, 4 * 1024 * 1024);
    const rawActive = JSON.stringify(parseProject(next));
    parseBoundedJson(rawActive);
    storage.setItem(LIBRARY_KEY, rawLibrary);
    touched = true;
    storage.setItem(STORAGE_KEY, rawActive);
    return true;
  } catch {
    if (touched) {
      try {
        if (oldLibrary === null) storage.removeItem(LIBRARY_KEY);
        else storage.setItem(LIBRARY_KEY, oldLibrary);
        if (oldActive === null) storage.removeItem(STORAGE_KEY);
        else storage.setItem(STORAGE_KEY, oldActive);
      } catch {
        /* The caller retains the live current project and warns about storage. */
      }
    }
    return false;
  }
}
