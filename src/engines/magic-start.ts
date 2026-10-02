import { z } from 'zod';
import { projectSchema, type CreatorProject } from '../domain/project';
import { directions } from '../registries/motion';
import { recommendBlocks } from './composition';

export function publicBirthdayLetter(
  name: string,
  publicMessage = '',
  direction: CreatorProject['experience']['directionId'] = 'emotional',
): string {
  const recipient = z.string().trim().min(1).max(120).parse(name);
  const message = z.string().trim().max(2000).parse(publicMessage);
  const opening = {
    emotional:
      'Ein Tag ohne Eile. Ein neues Jahr mit Platz für das, was dir gut tut. Das wünsche ich dir.',
    funny:
      'Geburtstagsplan: Lieblingsmoment auswählen. Gute Wünsche einpacken. Den Alltag ein bisschen warten lassen. Und dann: dein neues Lebensjahr feiern.',
    cinematic:
      'Ein neues Kapitel. Noch ungeschrieben. Ich wünsche dir darin Momente, die du gern noch einmal erleben möchtest.',
    elegant:
      'Zum Geburtstag wünsche ich dir Zeit für das Wesentliche und einen guten Start in das neue Lebensjahr.',
  }[direction];
  return `Hallo ${recipient},\n\n${message || opening}\n\nAlles Gute zum Geburtstag!`;
}
// Public authoring only; private answers are never seed input.
export function isStarterBirthdayLetter(text: string, name: string): boolean {
  return (
    directions
      .all()
      .some(
        (direction) => publicBirthdayLetter(name, '', direction.id) === text,
      ) ||
    text ===
      `Hallo ${name},\n\nHeute ist dein Tag. Ich wünsche dir Freude, Zuversicht und viele schöne Momente in deinem neuen Lebensjahr.\n\nAlles Gute zum Geburtstag!`
  );
}
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
    : next.writing.letter.trim() ||
      publicBirthdayLetter(
        next.recipient.name,
        '',
        next.experience.directionId,
      );
  next.writing.wish =
    'Ich wünsche dir ein neues Lebensjahr mit vielen schönen Momenten.';
  next.experience.themeId = directions.get(
    next.experience.directionId,
  )!.themeId;
  next.experience.blocks = recommendBlocks(next);
  next.workflow.step = 'preview';
  return projectSchema.parse(next);
}
