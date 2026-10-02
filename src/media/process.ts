import { mediaBudget } from './budgets';
import { imageHeader } from './formats';
import type { MediaAsset } from './store';
export async function processPhoto(
  original: Blob,
  preserveOriginal = true,
): Promise<MediaAsset> {
  if (original.size === 0 || original.size > mediaBudget.maxOriginalBytes)
    throw new Error('Bitte wähle ein Foto bis 8 MB.');
  const header = imageHeader(new Uint8Array(await original.arrayBuffer()));
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(
      new Blob([original], { type: header.mimeType }),
      { imageOrientation: 'from-image' },
    );
  } catch {
    throw new Error(
      'Dieses Foto konnte nicht geöffnet werden. Bitte speichere es als JPEG, PNG oder WebP.',
    );
  }
  const canvas = document.createElement('canvas');
  try {
    if (bitmap.width * bitmap.height > mediaBudget.maxSourcePixels)
      throw new Error('Dieses Foto hat zu viele Bildpunkte.');
    let scale = Math.min(
      1,
      mediaBudget.maxRenderedEdge / bitmap.width,
      mediaBudget.maxRenderedEdge / bitmap.height,
      Math.sqrt(mediaBudget.maxRenderedPixels / (bitmap.width * bitmap.height)),
    );
    for (let attempt = 0; attempt < 4; attempt++) {
      canvas.width = Math.max(1, Math.floor(bitmap.width * scale));
      canvas.height = Math.max(1, Math.floor(bitmap.height * scale));
      const context = canvas.getContext('2d');
      if (!context)
        throw new Error(
          'Die Fotoverarbeitung ist in diesem Browser nicht verfügbar.',
        );
      context.fillStyle = '#fffdf9';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const processed = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (blob) =>
            blob
              ? resolve(blob)
              : reject(new Error('Das Foto konnte nicht verkleinert werden.')),
          'image/jpeg',
          Math.max(0.58, 0.82 - attempt * 0.08),
        ),
      );
      if (processed.size <= mediaBudget.maxRenderedBytes)
        return {
          id: crypto.randomUUID(),
          original: preserveOriginal ? original : null,
          processed,
          width: canvas.width,
          height: canvas.height,
        };
      scale *= 0.8;
    }
    throw new Error(
      'Dieses Foto bleibt zu groß. Bitte verkleinere es vor dem Import.',
    );
  } finally {
    bitmap.close();
    canvas.width = 0;
    canvas.height = 0;
  }
}
