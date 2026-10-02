import type { CreatorProject } from '../domain/project';
import type { AssetStore } from './store';
import { blobDataUrl, validateProcessedDataUrl } from './formats';
export async function resolvePhotoSources(
  project: CreatorProject,
  store: AssetStore,
  includeUnused = false,
): Promise<Record<string, string>> {
  const selected = new Set(
    project.experience.blocks
      .filter((b) => b.enabled)
      .map((b) => b.data.mediaId),
  );
  const sources: Record<string, string> = {};
  for (const media of project.media) {
    if (
      (!includeUnused && !selected.has(media.id)) ||
      media.source.type !== 'local'
    )
      continue;
    const asset = await store.get(media.source.assetId);
    if (!asset || !(asset.processed instanceof Blob))
      throw new Error(
        'Ein Foto fehlt auf diesem Gerät. Bitte importiere es erneut oder deaktiviere seinen Baustein.',
      );
    const url = await blobDataUrl(asset.processed);
    validateProcessedDataUrl(url);
    sources[media.source.assetId] = url;
  }
  return sources;
}
