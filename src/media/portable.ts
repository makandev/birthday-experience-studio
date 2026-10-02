import { z } from 'zod';
import { safeId, type CreatorProject } from '../domain/project';
import { parseBoundedJson } from '../security/json';
import { readDraft, writeDraft } from '../persistence/drafts';
import { mediaBudget } from './budgets';
import { validateProcessedDataUrl } from './formats';
import { processPhoto } from './process';
import type { MediaAsset } from './store';
const bundleSchema = z
  .object({
    format: z.literal('bes-draft'),
    version: z.literal(1),
    project: z.unknown(),
    assets: z
      .array(
        z.object({ assetId: safeId, dataUrl: z.string().max(710000) }).strict(),
      )
      .max(6),
  })
  .strict();
export interface DraftBundle {
  project: CreatorProject;
  assets: MediaAsset[];
}
export function writePortableDraft(
  project: CreatorProject,
  sources: Record<string, string>,
): string {
  const parsed = JSON.parse(writeDraft(project));
  const needed = [
    ...new Set(
      project.media
        .filter((m) => m.source.type === 'local')
        .map((m) => (m.source.type === 'local' ? m.source.assetId : '')),
    ),
  ];
  if (!needed.length) return writeDraft(project);
  const assets = needed.map((assetId) => {
    const dataUrl = sources[assetId];
    if (!dataUrl)
      throw new Error(
        'Ein Foto fehlt in der Sicherung. Bitte ergänze es zuerst.',
      );
    validateProcessedDataUrl(dataUrl);
    return { assetId, dataUrl };
  });
  const raw = JSON.stringify(
    { format: 'bes-draft', version: 1, project: parsed, assets },
    null,
    2,
  );
  parseBoundedJson(raw, mediaBudget.maxPortableDraftBytes);
  return raw;
}
export async function readPortableDraft(raw: string): Promise<DraftBundle> {
  const input = parseBoundedJson(raw, mediaBudget.maxPortableDraftBytes);
  if (!input || typeof input !== 'object' || !('format' in input)) {
    const project = readDraft(raw);
    if (project.media.some((m) => m.source.type === 'local'))
      throw new Error(
        'Dieser Entwurf enthält Fotos ohne eingebettete Fotodaten.',
      );
    return { project, assets: [] };
  }
  const bundle = bundleSchema.parse(input);
  const project = readDraft(JSON.stringify(bundle.project));
  const needed = [
    ...new Set(
      project.media
        .filter((m) => m.source.type === 'local')
        .map((m) => (m.source.type === 'local' ? m.source.assetId : '')),
    ),
  ];
  if (
    bundle.assets.length !== needed.length ||
    new Set(bundle.assets.map((a) => a.assetId)).size !==
      bundle.assets.length ||
    bundle.assets.some((a) => !needed.includes(a.assetId))
  )
    throw new Error('Die eingebetteten Fotos passen nicht zum Entwurf.');
  const assets: MediaAsset[] = [];
  for (const entry of bundle.assets) {
    const bytes = validateProcessedDataUrl(entry.dataUrl);
    const asset = await processPhoto(
      new Blob([Uint8Array.from(bytes).buffer], { type: 'image/jpeg' }),
      false,
    );
    assets.push(asset);
    project.media.forEach((media) => {
      if (
        media.source.type === 'local' &&
        media.source.assetId === entry.assetId
      )
        media.source.assetId = asset.id;
      media.width = asset.width;
      media.height = asset.height;
      media.size = asset.processed.size;
      media.mimeType = 'image/jpeg';
    });
  }
  return { project, assets };
}
