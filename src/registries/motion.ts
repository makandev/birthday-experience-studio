import { z } from 'zod';
import { Registry } from './registry';
const directionSchema = z
  .object({
    id: z.enum(['emotional', 'funny', 'elegant', 'cinematic']),
    version: z.literal(1),
    label: z.string().max(80),
    description: z.string().max(300),
    themeId: z.enum(['warm', 'minimal', 'celebration']),
    entrance: z.enum(['settle', 'lift', 'playful']),
    typography: z.enum(['serif', 'clean']),
    durationMs: z.number().int().min(100).max(1500),
    staggerMs: z.number().int().min(0).max(200),
    particles: z.number().int().min(0).max(12),
    imageStyle: z.enum(['soft', 'polaroid', 'wide']),
    finale: z.enum(['quiet', 'sparkles']),
    blockOrder: z
      .array(z.enum(['intro', 'letter', 'wish', 'reveal', 'photo', 'finale']))
      .max(6),
  })
  .strict();
export type ExperienceDirection = z.infer<typeof directionSchema>;
export const directions = new Registry<ExperienceDirection>(
  [
    {
      id: 'emotional',
      version: 1,
      label: 'Emotional',
      description: 'Warm, persönlich und ruhig. Erinnerungen bekommen Raum.',
      themeId: 'warm',
      entrance: 'settle',
      typography: 'serif',
      durationMs: 1000,
      staggerMs: 160,
      particles: 4,
      imageStyle: 'soft',
      finale: 'quiet',
      blockOrder: ['intro', 'photo', 'letter', 'reveal', 'wish', 'finale'],
    },
    {
      id: 'funny',
      version: 1,
      label: 'Fröhlich',
      description:
        'Leicht und verspielt. Kleine Überraschungen und ein festlicher Abschluss.',
      themeId: 'celebration',
      entrance: 'playful',
      typography: 'clean',
      durationMs: 600,
      staggerMs: 80,
      particles: 12,
      imageStyle: 'polaroid',
      finale: 'sparkles',
      blockOrder: ['intro', 'reveal', 'photo', 'letter', 'wish', 'finale'],
    },
    {
      id: 'elegant',
      version: 1,
      label: 'Elegant',
      description:
        'Klar, zurückhaltend und respektvoll. Sanfte Übergänge statt großer Effekte.',
      themeId: 'minimal',
      entrance: 'settle',
      typography: 'serif',
      durationMs: 800,
      staggerMs: 100,
      particles: 0,
      imageStyle: 'soft',
      finale: 'quiet',
      blockOrder: ['intro', 'letter', 'photo', 'wish', 'reveal', 'finale'],
    },
    {
      id: 'cinematic',
      version: 1,
      label: 'Filmisch',
      description:
        'Große Bilder, ruhiges Tempo und ein stimmungsvoller Abschluss.',
      themeId: 'warm',
      entrance: 'lift',
      typography: 'serif',
      durationMs: 1200,
      staggerMs: 180,
      particles: 6,
      imageStyle: 'wide',
      finale: 'sparkles',
      blockOrder: ['intro', 'photo', 'letter', 'reveal', 'wish', 'finale'],
    },
  ].map((value) => directionSchema.parse(value)),
);
export const motionBudget = {
  maxDesktopParticles: 12,
  maxMobileParticles: 6,
  maxDelayMs: 1200,
  maxDurationMs: 1500,
  maxTranslationPx: 12,
} as const;
