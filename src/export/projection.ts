import { parseProject, type CreatorProject } from '../domain/project';
import { blocks } from '../registries/blocks';
import { themes } from '../registries/themes';
import { requireCapabilities } from './capabilities';
export interface ExportExperience {
  schemaVersion: 1;
  locale: 'de';
  themeId: string;
  directionId: string;
  intensity: number;
  profile: 'offline' | 'online';
  externalDomains: string[];
  blocks: { type: string; version: number; data: Record<string, string> }[];
}
export function projectExperience(input: CreatorProject): ExportExperience {
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
  };
}
