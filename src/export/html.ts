import type { SceneId } from '../engines/scenes';
import type { CreatorProject } from '../domain/project';
import { projectExperience } from './projection';
import { renderExperience } from '../experience/render';
import { mediaBudget } from '../media/budgets';
import { Registry } from '../registries/registry';
export function exportHtml(
  project: CreatorProject,
  sources: Record<string, string> = {},
  previewScene?: SceneId,
): string {
  const html = renderExperience(
    projectExperience(project, sources),
    previewScene,
  );
  if (new TextEncoder().encode(html).byteLength > mediaBudget.maxGiftBytes)
    throw new Error(
      'Dein Geschenk ist zu groß. Bitte entferne ein Foto oder kürze sehr lange Texte.',
    );
  return html;
}
export function exportFilename(name: string): string {
  const safe =
    name
      .normalize('NFKC')
      .replace(/[^\p{L}\p{N}_-]+/gu, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'Geschenk';
  return `Happy-Birthday-${safe}.html`;
}
export interface Exporter {
  id: string;
  version: number;
  label: string;
  export: (
    project: CreatorProject,
    sources?: Record<string, string>,
    previewScene?: SceneId,
  ) => string;
}
export const exporters = new Registry<Exporter>([
  { id: 'single-html', version: 1, label: 'Offline-HTML', export: exportHtml },
]);
