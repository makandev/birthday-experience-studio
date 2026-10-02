import { animationProgramSchema } from './animation';
import { z } from 'zod';
import { safeExternalUrl } from '../security/urls';

export const SCHEMA_VERSION = 2;
export const safeId = z
  .string()
  .min(1)
  .max(128)
  .regex(/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/)
  .refine((id) => !['constructor', 'prototype', '__proto__'].includes(id));
const text = z.string().max(20000);
export const answerSchema = z.object({
  status: z.enum(['answered', 'skipped', 'unknown']),
  value: text,
});
export const blockSchema = z.object({
  id: safeId,
  type: safeId,
  version: z.number().int().positive(),
  enabled: z.boolean(),
  data: z.record(safeId, text).refine((data) => Object.keys(data).length <= 20),
});
export const legacyProjectSchema = z.object({
  schemaVersion: z.literal(1),
  id: safeId,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  mode: z.enum(['quick', 'deep']),
  recipient: z.object({ name: z.string().max(120) }),
  relationship: z.object({
    typeId: safeId,
    uncertain: z.boolean(),
    dimensions: z.object({
      closeness: z.number().min(0).max(5),
      formality: z.number().min(0).max(5),
      trust: z.number().min(0).max(5),
      humor: z.number().min(0).max(5),
      emotionality: z.number().min(0).max(5),
      yearsKnown: z.number().min(0).max(150),
      context: z.enum(['private', 'professional', 'mixed']),
      tone: z.enum(['warm', 'playful', 'reserved']),
    }),
  }),
  answers: z
    .record(safeId, answerSchema)
    .refine((answers) => Object.keys(answers).length <= 500),
  memories: z.array(
    z.object({ id: safeId, text, recipientVisible: z.boolean() }),
  ),
  writing: z.object({
    method: z.enum(['self', 'guided', 'external']),
    letter: text,
    wish: text,
    surprise: text,
  }),
  media: z.array(
    z.object({
      id: safeId,
      kind: z.enum(['image', 'audio', 'video']),
      name: z.string().max(240),
      mimeType: z.string().max(100),
      size: z.number().nonnegative(),
    }),
  ),
  experience: z.object({
    themeId: safeId,
    blocks: z
      .array(blockSchema)
      .max(50)
      .refine(
        (items) => new Set(items.map((item) => item.id)).size === items.length,
      ),
  }),
  exportConfig: z.object({
    exporterId: z.literal('single-html'),
    locale: z.literal('de'),
  }),
  workflow: z.object({
    step: z.enum(['start', 'person', 'questions', 'writing', 'preview']),
    questionId: z.string().max(128),
  }),
});
export const mediaSourceSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('local'), assetId: safeId }).strict(),
  z
    .object({
      type: z.literal('external'),
      url: z
        .string()
        .max(2048)
        .refine((value) => {
          try {
            safeExternalUrl(value);
            return true;
          } catch {
            return false;
          }
        }),
    })
    .strict(),
  z.object({ type: z.literal('unavailable') }).strict(),
]);
export const projectSchema = legacyProjectSchema
  .extend({
    schemaVersion: z.literal(SCHEMA_VERSION),
    memories: legacyProjectSchema.shape.memories.max(100),
    media: z
      .array(
        legacyProjectSchema.shape.media.element
          .extend({
            source: mediaSourceSchema,
            width: z.number().int().positive().max(16000).optional(),
            height: z.number().int().positive().max(16000).optional(),
          })
          .strict(),
      )
      .max(6)
      .refine(
        (items) => new Set(items.map((item) => item.id)).size === items.length,
      ),
    experience: legacyProjectSchema.shape.experience
      .extend({
        directionId: z.enum(['emotional', 'funny', 'elegant', 'cinematic']),
        intensity: z.number().int().min(0).max(3),
        animation: animationProgramSchema.optional(),
        composition: z
          .object({
            version: z.literal(1),
            variant: z.enum(['champion', 'challenger']),
            arc: z.enum(['portrait', 'encore']),
          })
          .strict()
          .optional(),
      })
      .strict(),
    exportConfig: legacyProjectSchema.shape.exportConfig
      .extend({
        profile: z.enum(['offline', 'online']),
        externalMediaConsent: z.boolean(),
      })
      .strict(),
  })
  .strict();
export type CreatorProject = z.infer<typeof projectSchema>;
export type Answer = z.infer<typeof answerSchema>;
export type ExperienceBlock = z.infer<typeof blockSchema>;
export type Step = CreatorProject['workflow']['step'];

export function createProject(): CreatorProject {
  const now = new Date().toISOString();
  return {
    schemaVersion: SCHEMA_VERSION,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    mode: 'quick',
    recipient: { name: '' },
    relationship: {
      typeId: 'friend',
      uncertain: false,
      dimensions: {
        closeness: 3,
        formality: 1,
        trust: 3,
        humor: 3,
        emotionality: 3,
        yearsKnown: 0,
        context: 'private',
        tone: 'warm',
      },
    },
    answers: {},
    memories: [],
    writing: { method: 'guided', letter: '', wish: '', surprise: '' },
    media: [],
    experience: {
      themeId: 'warm',
      blocks: [],
      directionId: 'emotional',
      intensity: 1,
    },
    exportConfig: {
      exporterId: 'single-html',
      locale: 'de',
      profile: 'offline',
      externalMediaConsent: false,
    },
    workflow: { step: 'start', questionId: '' },
  };
}

// Validate the historical contract before adding new defaults. Never guess missing data.
export const migrations = new Map<number, (input: unknown) => unknown>([
  [
    1,
    (input) => {
      const old = legacyProjectSchema.strict().parse(input);
      return {
        ...old,
        schemaVersion: 2,
        media: old.media.map((item) => ({
          ...item,
          source: { type: 'unavailable' },
        })),
        experience: {
          ...old.experience,
          directionId: 'emotional',
          intensity: 0,
        },
        exportConfig: {
          ...old.exportConfig,
          profile: 'offline',
          externalMediaConsent: false,
        },
      };
    },
  ],
]);
export function parseProject(input: unknown): CreatorProject {
  let value = input;
  if (!value || typeof value !== 'object' || !('schemaVersion' in value))
    throw new Error('missing-version');
  let version = value.schemaVersion;
  if (
    typeof version !== 'number' ||
    !Number.isInteger(version) ||
    version > SCHEMA_VERSION ||
    version < 1
  )
    throw new Error('unsupported-version');
  while (version < SCHEMA_VERSION) {
    const migrate = migrations.get(version);
    if (!migrate) throw new Error('missing-migration');
    value = migrate(value);
    version += 1;
  }
  return projectSchema.parse(value);
}
