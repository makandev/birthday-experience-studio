import { mediaBudget } from './budgets';
export interface ImageHeader {
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  width: number;
  height: number;
}
function check(header: ImageHeader): ImageHeader {
  if (
    !header.width ||
    !header.height ||
    header.width * header.height > mediaBudget.maxSourcePixels
  )
    throw new Error(
      'Dieses Foto hat zu viele Bildpunkte. Bitte verkleinere es auf höchstens 24 Megapixel.',
    );
  return header;
}
export function imageHeader(bytes: Uint8Array): ImageHeader {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (
    bytes.length >= 24 &&
    [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v) &&
    view.getUint32(12) === 0x49484452
  )
    return check({
      mimeType: 'image/png',
      width: view.getUint32(16),
      height: view.getUint32(20),
    });
  if (bytes.length >= 4 && bytes[0] === 255 && bytes[1] === 216) {
    let offset = 2;
    while (offset + 4 <= bytes.length) {
      if (bytes[offset] !== 255) throw new Error('Dieses JPEG ist beschädigt.');
      const marker = bytes[offset + 1];
      if (marker === 0xda || marker === 0xd9) break;
      if (marker === 0xff) {
        offset++;
        continue;
      }
      const length = view.getUint16(offset + 2);
      if (length < 2 || offset + 2 + length > bytes.length)
        throw new Error('Dieses JPEG ist beschädigt.');
      if ([0xc0, 0xc1, 0xc2].includes(marker) && length >= 8)
        return check({
          mimeType: 'image/jpeg',
          height: view.getUint16(offset + 5),
          width: view.getUint16(offset + 7),
        });
      offset += 2 + length;
    }
  }
  if (
    bytes.length >= 30 &&
    String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
    String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'
  ) {
    const chunk = String.fromCharCode(...bytes.slice(12, 16));
    if (chunk === 'VP8X') {
      if (bytes[20] & 2)
        throw new Error(
          'Bitte verwende ein unbewegtes Foto statt einer Animation.',
        );
      const u24 = (n: number) =>
        bytes[n] | (bytes[n + 1] << 8) | (bytes[n + 2] << 16);
      return check({
        mimeType: 'image/webp',
        width: u24(24) + 1,
        height: u24(27) + 1,
      });
    }
    if (
      chunk === 'VP8 ' &&
      bytes[23] === 0x9d &&
      bytes[24] === 1 &&
      bytes[25] === 0x2a
    )
      return check({
        mimeType: 'image/webp',
        width: view.getUint16(26, true) & 0x3fff,
        height: view.getUint16(28, true) & 0x3fff,
      });
    if (chunk === 'VP8L' && bytes[20] === 0x2f) {
      const bits = view.getUint32(21, true);
      return check({
        mimeType: 'image/webp',
        width: (bits & 0x3fff) + 1,
        height: ((bits >>> 14) & 0x3fff) + 1,
      });
    }
  }
  throw new Error(
    'Bitte wähle ein echtes JPEG-, PNG- oder unbewegtes WebP-Foto. SVG, GIF und andere Formate werden noch nicht unterstützt.',
  );
}
export function validateProcessedDataUrl(dataUrl: string): Uint8Array {
  if (
    !/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(dataUrl) ||
    dataUrl.length > Math.ceil((mediaBudget.maxRenderedBytes * 4) / 3) + 64
  )
    throw new Error('Das gespeicherte Fotoderivat ist nicht unterstützt.');
  const encoded = dataUrl.slice(dataUrl.indexOf(',') + 1);
  const bytes = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
  if (bytes[bytes.length - 2] !== 255 || bytes[bytes.length - 1] !== 217)
    throw new Error('Das Fotoderivat ist unvollständig.');
  const header = imageHeader(bytes);
  if (
    header.mimeType !== 'image/jpeg' ||
    bytes.length > mediaBudget.maxRenderedBytes ||
    Math.max(header.width, header.height) > mediaBudget.maxRenderedEdge ||
    header.width * header.height > mediaBudget.maxRenderedPixels
  )
    throw new Error('Das Fotoderivat überschreitet das Exportbudget.');
  // Canvas-derived exports must not reintroduce original EXIF/comments.
  let offset = 2;
  const view = new DataView(bytes.buffer);
  while (offset + 4 <= bytes.length) {
    const marker = bytes[offset + 1];
    if (marker === 0xda || marker === 0xd9) break;
    if (marker === 0xe1 || marker === 0xed || marker === 0xfe)
      throw new Error('Das Fotoderivat enthält noch private Metadaten.');
    const length = view.getUint16(offset + 2);
    if (length < 2 || offset + length + 2 > bytes.length)
      throw new Error('Beschädigtes Fotoderivat.');
    offset += length + 2;
  }
  return bytes;
}
export function blobDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () =>
      reject(new Error('Das Foto konnte nicht gelesen werden.'));
    reader.readAsDataURL(blob);
  });
}
