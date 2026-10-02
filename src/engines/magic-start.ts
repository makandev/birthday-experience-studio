import { z } from 'zod';
import { projectSchema, type CreatorProject } from '../domain/project';
import { directions } from '../registries/motion';
import { recommendDirection } from './motion';
import { recommendBlocks } from './composition';

// The seed is explicitly recipient-visible authoring, never a questionnaire answer.
export function createMagicStart(
  project: CreatorProject,
  publicMessage: string,
): CreatorProject {
  const next = projectSchema.parse(project);
  const name = z.string().trim().min(1).max(120).parse(next.recipient.name);
  const message = z.string().trim().min(1).max(2000).parse(publicMessage);
  if (
    next.experience.blocks.length ||
    next.writing.wish.trim() ||
    next.writing.surprise.trim()
  )
    throw new Error(
      'Dieses Geschenk hat bereits eine Komposition. Bearbeite sie in der Vorschau.',
    );
  next.recipient.name = name;
  next.writing.method = 'self';
  next.writing.letter = `Hallo ${name},\n\n${message}\n\nAlles Gute zum Geburtstag!`;
  next.writing.wish =
    'Ich wünsche dir ein neues Lebensjahr mit vielen schönen Momenten.';
  next.experience.directionId = recommendDirection(
    next,
  ) as CreatorProject['experience']['directionId'];
  next.experience.themeId = directions.get(
    next.experience.directionId,
  )!.themeId;
  next.experience.blocks = recommendBlocks(next);
  next.workflow.step = 'preview';
  return projectSchema.parse(next);
}
