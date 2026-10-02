import { describe, it, expect } from 'vitest';
import { createProject } from '../src/domain/project';
import {
  restoreProject,
  STORAGE_KEY,
  type StorageLike,
} from '../src/persistence/storage';
const memoryStorage = (): StorageLike => {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
    removeItem: (key) => {
      map.delete(key);
    },
  };
};
describe('read-only legacy draft storage', () => {
  it('saves and restores answers, workflow and authored content', () => {
    const storage = memoryStorage();
    expect(restoreProject(storage).status).toBe('empty');
    const project = createProject();
    project.writing.letter = 'Restored text';
    project.workflow.step = 'writing';
    project.answers.memory = { status: 'answered', value: 'A memory' };
    storage.setItem(STORAGE_KEY, JSON.stringify(project));
    expect(restoreProject(storage)).toEqual({ status: 'restored', project });
  });
  it.each([
    'broken JSON',
    JSON.stringify({ schemaVersion: 99 }),
    JSON.stringify({ schemaVersion: 1 }),
  ])('preserves unreadable data %s', (raw) => {
    const storage = memoryStorage();
    storage.setItem(STORAGE_KEY, raw);
    expect(restoreProject(storage).status).toBe('invalid');
    expect(storage.getItem(STORAGE_KEY)).toBe(raw);
  });
  it('reports blocked storage without crashing', () => {
    const storage: StorageLike = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('quota');
      },
      removeItem: () => {},
    };
    expect(restoreProject(storage).status).toBe('unavailable');
  });
});
