import { describe, it, expect, vi } from 'vitest';
import { createProject } from '../src/domain/project';
import { readPortableDraft } from '../src/media/portable';
import { processPhoto } from '../src/media/process';
vi.mock('../src/media/process', () => ({ processPhoto: vi.fn() }));
// Header validation is real; decoder re-encoding is independently covered in Chromium.
const jpeg =
  'data:image/jpeg;base64,' +
  Buffer.from([255, 216, 255, 192, 0, 8, 8, 0, 1, 0, 1, 0, 255, 217]).toString(
    'base64',
  );
describe('portable import preserves metadata outside the matching local reference', () => {
  it('keeps two differently sized photos, shared references and external/unavailable metadata independent', async () => {
    const project = createProject();
    project.media = [
      {
        id: 'one',
        kind: 'image',
        name: 'one',
        mimeType: 'image/png',
        size: 1,
        source: { type: 'local', assetId: 'first' },
      },
      {
        id: 'two',
        kind: 'image',
        name: 'two',
        mimeType: 'image/png',
        size: 2,
        source: { type: 'local', assetId: 'second' },
      },
      {
        id: 'shared',
        kind: 'image',
        name: 'same asset',
        mimeType: 'image/png',
        size: 1,
        source: { type: 'local', assetId: 'first' },
      },
      {
        id: 'remote',
        kind: 'image',
        name: 'external',
        mimeType: 'image/webp',
        size: 75,
        width: 12,
        height: 9,
        source: {
          type: 'external',
          url: 'https://images.example.com/photo.webp',
        },
      },
      {
        id: 'missing',
        kind: 'audio',
        name: 'unavailable',
        mimeType: 'audio/ogg',
        size: 99,
        source: { type: 'unavailable' },
      },
    ];
    const before = structuredClone(project);
    vi.mocked(processPhoto)
      .mockResolvedValueOnce({
        id: 'new-first',
        original: null,
        processed: new Blob(['first'], { type: 'image/jpeg' }),
        width: 200,
        height: 100,
      })
      .mockResolvedValueOnce({
        id: 'new-second',
        original: null,
        processed: new Blob(['second-copy'], { type: 'image/jpeg' }),
        width: 30,
        height: 60,
      });
    const result = await readPortableDraft(
      JSON.stringify({
        format: 'bes-draft',
        version: 1,
        project,
        assets: [
          { assetId: 'first', dataUrl: jpeg },
          { assetId: 'second', dataUrl: jpeg },
        ],
      }),
    );
    expect(result.project.media[0]).toMatchObject({
      width: 200,
      height: 100,
      size: 5,
      mimeType: 'image/jpeg',
      source: { type: 'local', assetId: 'new-first' },
    });
    expect(result.project.media[1]).toMatchObject({
      width: 30,
      height: 60,
      size: 11,
      source: { type: 'local', assetId: 'new-second' },
    });
    expect(result.project.media[2]).toMatchObject({
      width: 200,
      height: 100,
      size: 5,
      source: { type: 'local', assetId: 'new-first' },
    });
    expect(result.project.media.slice(3)).toEqual(before.media.slice(3));
    expect(project).toEqual(before);
  });
});
