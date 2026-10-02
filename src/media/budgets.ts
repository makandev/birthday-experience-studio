export const mediaBudget = {
  maxPhotos: 6,
  maxOriginalBytes: 8 * 1024 * 1024,
  maxSourcePixels: 24_000_000,
  maxRenderedEdge: 1600,
  maxRenderedPixels: 2_000_000,
  maxRenderedBytes: 512 * 1024,
  maxGiftBytes: 6 * 1024 * 1024,
  maxPortableDraftBytes: 8 * 1024 * 1024,
} as const;
