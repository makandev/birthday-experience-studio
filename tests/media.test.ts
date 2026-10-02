import { describe, it, expect } from 'vitest';
import { imageHeader, validateProcessedDataUrl } from '../src/media/formats';
import { createProject } from '../src/domain/project';
import { resolvePhotoSources } from '../src/media/resolve';
import { readPortableDraft, writePortableDraft } from '../src/media/portable';
function png(width: number, height: number): Uint8Array {
  const bytes = new Uint8Array(24);
  bytes.set([137, 80, 78, 71, 13, 10, 26, 10]);
  const view = new DataView(bytes.buffer);
  view.setUint32(12, 0x49484452);
  view.setUint32(16, width);
  view.setUint32(20, height);
  return bytes;
}
describe('raster identification and decode budgets', () => {
  it('reads dimensions from raster signatures rather than filenames or MIME claims', () => {
    expect(imageHeader(png(400, 300))).toEqual({
      mimeType: 'image/png',
      width: 400,
      height: 300,
    });
  });
  it('refuses pixel bombs before image decoding', () => {
    expect(() => imageHeader(png(100000, 100000))).toThrow('Bildpunkte');
    expect(() => imageHeader(png(0, 2))).toThrow();
  });
  it.each([
    '<svg onload="evil()"></svg>',
    '<script>alert(1)</script>',
    'GIF89a',
    'not a jpeg',
  ])('rejects non-raster and unsupported content %s', (input) =>
    expect(() => imageHeader(new TextEncoder().encode(input))).toThrow(),
  );
  it('rejects malformed JPEG segments and animated WebP headers', () => {
    expect(() =>
      imageHeader(new Uint8Array([255, 216, 255, 225, 0, 255])),
    ).toThrow();
    const bytes = new Uint8Array(30);
    bytes.set(new TextEncoder().encode('RIFF'));
    bytes.set(new TextEncoder().encode('WEBPVP8X'), 8);
    bytes[20] = 2;
    expect(() => imageHeader(bytes)).toThrow('Animation');
  });
  it.each([
    'data:image/svg+xml;base64,PHN2Zy8+',
    'javascript:alert(1)',
    'data:image/jpeg;base64,PHNjcmlwdD4=',
  ])('rejects unsafe output data scheme/payload %s', (src) =>
    expect(() => validateProcessedDataUrl(src)).toThrow(),
  );
});
describe('portable photo boundaries', () => {
  it('keeps text-only draft compatibility and refuses raw local references without photos', async () => {
    const project = createProject();
    expect(
      (await readPortableDraft(writePortableDraft(project, {}))).project,
    ).toEqual(project);
    project.media.push({
      id: 'photo-1',
      kind: 'image',
      name: 'local',
      mimeType: 'image/jpeg',
      size: 100,
      source: { type: 'local', assetId: 'asset-1' },
    });
    await expect(readPortableDraft(JSON.stringify(project))).rejects.toThrow(
      'ohne eingebettete',
    );
    expect(() => writePortableDraft(project, {})).toThrow('fehlt');
  });
  it('rejects orphan/duplicate or hostile embedded asset declarations', async () => {
    const project = createProject();
    for (const assets of [
      [{ assetId: 'orphan', dataUrl: 'data:image/svg+xml;base64,PHN2Zy8+' }],
      [
        { assetId: 'same', dataUrl: 'invalid' },
        { assetId: 'same', dataUrl: 'invalid' },
      ],
    ])
      await expect(
        readPortableDraft(
          JSON.stringify({ format: 'bes-draft', version: 1, project, assets }),
        ),
      ).rejects.toThrow();
  });
  it('does not read disabled photo assets and fails closed if an active local asset is missing', async () => {
    const project = createProject();
    project.media.push({
      id: 'photo-1',
      kind: 'image',
      name: 'local',
      mimeType: 'image/jpeg',
      size: 100,
      source: { type: 'local', assetId: 'asset-1' },
    });
    project.experience.blocks.push({
      id: 'photo-block',
      type: 'photo',
      version: 1,
      enabled: false,
      data: { mediaId: 'photo-1' },
    });
    let reads = 0;
    const store = {
      get: async () => {
        reads++;
        return undefined;
      },
      putMany: async () => {},
    };
    expect(await resolvePhotoSources(project, store)).toEqual({});
    expect(reads).toBe(0);
    project.experience.blocks[0].enabled = true;
    await expect(resolvePhotoSources(project, store)).rejects.toThrow(
      'Foto fehlt',
    );
    expect(reads).toBe(1);
  });
});
