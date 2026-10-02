import { parseProject, type CreatorProject } from '../domain/project';
import { blocks } from '../registries/blocks';
import { themes } from '../registries/themes';
import { safeExternalUrl } from '../security/urls';
import { validateProcessedDataUrl } from '../media/formats';
import { requireCapabilities } from './capabilities';
export interface ExportExperience {
  schemaVersion: 1;
  locale: 'de';
  themeId: string;
  directionId: string;
  intensity: number;
  profile: 'offline' | 'online';
  externalDomains: string[];
  composition?: {
    version: 1;
    variant: 'champion' | 'challenger';
    arc: 'portrait' | 'encore';
    register: 'personal' | 'respectful';
    pace: 'gentle' | 'bright';
  };
  blocks: { type: string; version: number; data: Record<string, string> }[];
}
export function projectExperience(
  input: CreatorProject,
  sources: Record<string, string> = {},
): ExportExperience {
  const project = parseProject(input);
  if (!project.recipient.name.trim())
    throw new Error('Bitte gib zuerst den Namen ein.');
  const capabilities = requireCapabilities(project);
  const exported = project.experience.blocks
    .filter((block) => block.enabled)
    .map((block) => {
      const definition = blocks.get(block.type);
      if (!definition || definition.version !== block.version)
        throw new Error(
          'Ein Baustein wird noch nicht unterstützt. Bitte deaktiviere ihn vor dem Export.',
        );
      const data: Record<string, string> = {};
      for (const field of definition.fields) {
        if (typeof block.data[field] !== 'string' || !block.data[field].trim())
          throw new Error(
            `Bitte ergänze den Baustein „${definition.label}“ oder deaktiviere ihn.`,
          );
        data[field] = block.data[field];
      }
      if (block.type === 'photo') {
        if (
          !['contain', 'cover'].includes(data.fit) ||
          !['center', 'top', 'bottom'].includes(data.position)
        )
          throw new Error('Bitte prüfe den Bildausschnitt.');
        const media = project.media.find((m) => m.id === block.data.mediaId)!;
        if (media.source.type === 'local') {
          const src = sources[media.source.assetId];
          if (!src)
            throw new Error(
              'Ein Foto fehlt auf diesem Gerät. Bitte ergänze es oder deaktiviere seinen Baustein.',
            );
          validateProcessedDataUrl(src);
          data.src = src;
        } else if (media.source.type === 'external')
          data.src = safeExternalUrl(media.source.url).href;
      }
      return { type: definition.id, version: definition.version, data };
    });
  if (!exported.length)
    throw new Error('Bitte aktiviere mindestens einen Baustein.');
  return {
    schemaVersion: 1,
    locale: 'de',
    directionId: project.experience.directionId,
    intensity: project.experience.intensity,
    profile: project.exportConfig.profile,
    externalDomains: capabilities.externalDomains,
    themeId: themes.get(project.experience.themeId)?.id ?? 'warm',
    blocks: exported,
    ...(project.experience.composition
      ? {
          composition: {
            ...project.experience.composition,
            register:
              project.relationship.dimensions.formality >= 3 ||
              project.relationship.dimensions.context === 'professional'
                ? ('respectful' as const)
                : ('personal' as const),
            pace:
              project.experience.directionId === 'funny' &&
              project.relationship.dimensions.humor >= 2
                ? ('bright' as const)
                : ('gentle' as const),
          },
        }
      : {}),
  };
}
