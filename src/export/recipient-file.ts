import { composeScenes } from '../engines/scenes';
import { experiencePlanSchema } from '../domain/experience-plan';
import { animationProgramSchema } from '../domain/animation';
import { z } from 'zod';
import { parseBoundedJson } from '../security/json';
import { blocks } from '../registries/blocks';
import { themes } from '../registries/themes';
import { directions } from '../registries/motion';
import { mediaBudget } from '../media/budgets';
import { validateProcessedDataUrl } from '../media/formats';
import { type ExportExperience, projectExperience } from './projection';
import type { CreatorProject } from '../domain/project';

const envelope = z.strictObject({
  kind: z.literal('bes-recipient-gift'),
  version: z.literal(1),
  experience: z.strictObject({
    schemaVersion: z.literal(1),
    locale: z.literal('de'),
    themeId: z.string().max(128),
    directionId: z.string().max(128),
    intensity: z.number().int().min(0).max(3),
    profile: z.literal('offline'),
    externalDomains: z.array(z.never()).length(0),
    animation: animationProgramSchema.optional(),
    plan: experiencePlanSchema.optional(),
    composition: z
      .strictObject({
        version: z.literal(1),
        variant: z.enum(['champion', 'challenger']),
        arc: z.enum(['portrait', 'encore']),
        register: z.enum(['personal', 'respectful']),
        pace: z.enum(['gentle', 'bright']),
      })
      .optional(),
    blocks: z
      .array(
        z.strictObject({
          type: z.string().max(128),
          version: z.literal(1),
          data: z.record(
            z.string().max(128),
            z.string().max(mediaBudget.maxGiftBytes),
          ),
        }),
      )
      .min(1)
      .max(50),
  }),
});

// A recipient-only data file, never a project/draft and never executable HTML.
export function readRecipientFile(raw: string): ExportExperience {
  if (new TextEncoder().encode(raw).byteLength > mediaBudget.maxGiftBytes)
    throw new Error('Diese Geschenkdatei ist zu groß (höchstens 6 MB).');
  const experience = envelope.parse(
    parseBoundedJson(raw, mediaBudget.maxGiftBytes),
  ).experience;
  if (
    !themes.get(experience.themeId) ||
    !directions.get(experience.directionId)
  )
    throw new Error('Diese Geschenkgestaltung wird noch nicht unterstützt.');
  let photos = 0;
  for (const block of experience.blocks) {
    const definition = blocks.get(block.type);
    if (!definition || definition.version !== block.version)
      throw new Error('Dieser Geschenkbaustein wird noch nicht unterstützt.');
    const fields = [
      ...definition.fields,
      ...(block.type === 'photo' ? ['src'] : []),
    ];
    if (
      Object.keys(block.data).length !== fields.length ||
      fields.some(
        (field) =>
          !Object.hasOwn(block.data, field) || !block.data[field].trim(),
      ) ||
      Object.keys(block.data).some((field) => !fields.includes(field))
    )
      throw new Error(
        'Diese Geschenkdatei enthält unbekannte oder fehlende Angaben.',
      );
    for (const [field, value] of Object.entries(block.data))
      if (field !== 'src' && value.length > (field === 'name' ? 120 : 20000))
        throw new Error('Ein Geschenktext ist zu lang.');
    if (block.type === 'photo') {
      if (
        ++photos > mediaBudget.maxPhotos ||
        !['contain', 'cover'].includes(block.data.fit) ||
        !['center', 'top', 'bottom'].includes(block.data.position)
      )
        throw new Error('Die Fotodaten werden nicht unterstützt.');
      validateProcessedDataUrl(block.data.src);
    }
  }
  if (experience.plan) composeScenes(experience);
  return experience;
}
export function exportRecipientFile(
  project: CreatorProject,
  sources: Record<string, string> = {},
): string {
  const raw = JSON.stringify({
    kind: 'bes-recipient-gift',
    version: 1,
    experience: projectExperience(project, sources),
  });
  // Initially offline only: opening an untrusted gift never authorizes network sources.
  readRecipientFile(raw);
  return raw;
}
