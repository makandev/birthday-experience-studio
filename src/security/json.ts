// Limits apply before application schemas. Text is inert data, never instructions.
export const MAX_PROJECT_BYTES = 2 * 1024 * 1024;
export function parseBoundedJson(
  raw: string,
  maxBytes = MAX_PROJECT_BYTES,
): unknown {
  if (new TextEncoder().encode(raw).byteLength > maxBytes)
    throw new Error(
      'Die Datei ist zu groß. Bitte verwende einen kleineren Entwurf.',
    );
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new Error('Diese Datei ist kein lesbarer BES-Entwurf.');
  }
  let nodes = 0;
  function inspect(item: unknown, depth: number): void {
    if (++nodes > 12000 || depth > 20)
      throw new Error('Der Entwurf ist zu umfangreich oder verschachtelt.');
    if (item && typeof item === 'object') {
      for (const [key, child] of Object.entries(item)) {
        if (['__proto__', 'constructor', 'prototype'].includes(key))
          throw new Error(
            'Der Entwurf enthält nicht unterstützte Datenfelder.',
          );
        inspect(child, depth + 1);
      }
    }
  }
  inspect(value, 0);
  return value;
}
