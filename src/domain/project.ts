import { z } from 'zod';

export const SCHEMA_VERSION = 1;
const text = z.string().max(20000);
export const answerSchema = z.object({
  status: z.enum(['answered', 'skipped', 'unknown']),
  value: text,
});
export const blockSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  version: z.number().int().positive(),
  enabled: z.boolean(),
  data: z.record(z.string(), text),
});
export const projectSchema = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  id: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  mode: z.enum(['quick', 'deep']),
  recipient: z.object({ name: z.string().max(120) }),
  relationship: z.object({
    typeId: z.string(),
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
  answers: z.record(z.string(), answerSchema),
  memories: z.array(
    z.object({ id: z.string(), text, recipientVisible: z.boolean() }),
  ),
  writing: z.object({
    method: z.enum(['self', 'guided', 'external']),
    letter: text,
    wish: text,
    surprise: text,
  }),
  media: z.array(
    z.object({
      id: z.string(),
      kind: z.enum(['image', 'audio', 'video']),
      name: z.string(),
      mimeType: z.string(),
      size: z.number().nonnegative(),
    }),
  ),
  experience: z.object({ themeId: z.string(), blocks: z.array(blockSchema) }),
  exportConfig: z.object({ exporterId: z.string(), locale: z.literal('de') }),
  workflow: z.object({
    step: z.enum(['start', 'person', 'questions', 'writing', 'preview']),
    questionId: z.string(),
  }),
});
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
    experience: { themeId: 'warm', blocks: [] },
    exportConfig: { exporterId: 'single-html', locale: 'de' },
    workflow: { step: 'start', questionId: '' },
  };
}

// Migrations are sequential pure transformations registered by the old schema version.
// Version 1 is the first persisted schema; there are no legacy versions to migrate yet.
export const migrations = new Map<number, (input: unknown) => unknown>();
export function parseProject(input: unknown): CreatorProject {
  let value = input;
  if (!value || typeof value !== 'object' || !('schemaVersion' in value))
    throw new Error('missing-version');
  let version = Number(value.schemaVersion);
  if (!Number.isInteger(version) || version > SCHEMA_VERSION || version < 1)
    throw new Error('unsupported-version');
  while (version < SCHEMA_VERSION) {
    const migrate = migrations.get(version);
    if (!migrate) throw new Error('missing-migration');
    value = migrate(value);
    version += 1;
  }
  return projectSchema.parse(value);
}
