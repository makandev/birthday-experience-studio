import { z } from 'zod';
// Syntax screening is defense in depth. The opaque Worker/CSP is the security boundary.
export const animationProgramSchema = z.strictObject({
  version: z.literal(1),
  source: z
    .string()
    .min(20)
    .max(16000)
    .refine(
      (s) =>
        /function\s+frame\s*\(/.test(s) &&
        !/\b(?:importScripts|import|fetch|XMLHttpRequest|WebSocket|EventSource|navigator|document|window|indexedDB|localStorage|sessionStorage|eval|Function|SharedWorker)\b/.test(
          s,
        ),
      'Das Animationsprogramm enthält nicht unterstützte Zugriffe.',
    ),
});
export type AnimationProgram = z.infer<typeof animationProgramSchema>;
