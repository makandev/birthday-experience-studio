import { z } from 'zod';
import { projectSchema, type CreatorProject } from '../domain/project';
import { directions } from '../registries/motion';
import { recommendBlocks } from './composition';

export function publicBirthdayLetter(name: string, publicMessage = ''): string {
  const recipient = z.string().trim().min(1).max(120).parse(name);
  const message = z.string().trim().max(2000).parse(publicMessage);
  return `Hallo ${recipient},\n\n${message || 'Heute ist dein Tag. Ich wünsche dir Freude, Zuversicht und viele schöne Momente in deinem neuen Lebensjahr.'}\n\nAlles Gute zum Geburtstag!`;
}
// Public authoring only; private answers are never seed input.
export function createMagicStart(
  project: CreatorProject,
  publicMessage = '',
): CreatorProject {
  const next = projectSchema.parse(project);
  if (
    next.experience.blocks.length ||
    next.writing.wish.trim() ||
    next.writing.surprise.trim()
  )
    throw new Error(
      'Dieses Geschenk hat bereits eine Komposition. Bearbeite sie in der Vorschau.',
    );
  next.recipient.name = next.recipient.name.trim();
  next.writing.method = 'self';
  next.writing.letter = publicMessage.trim()
    ? publicBirthdayLetter(next.recipient.name, publicMessage)
    : next.writing.letter.trim() || publicBirthdayLetter(next.recipient.name);
  next.writing.wish =
    'Ich wünsche dir ein neues Lebensjahr mit vielen schönen Momenten.';
  next.experience.themeId = directions.get(
    next.experience.directionId,
  )!.themeId;
  next.experience.blocks = recommendBlocks(next);
  next.workflow.step = 'preview';
  return projectSchema.parse(next);
}
