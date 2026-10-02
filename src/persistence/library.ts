import { parseProject, type CreatorProject } from '../domain/project';
import { parseBoundedJson } from '../security/json';
import { type StorageLike } from './storage';
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
