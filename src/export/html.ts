import type { CreatorProject } from '../domain/project';
import { projectExperience } from './projection';
import { renderExperience } from '../experience/render';
import { Registry } from '../registries/registry';
export function exportHtml(project: CreatorProject): string {
  return renderExperience(projectExperience(project));
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
  export: (project: CreatorProject) => string;
}
export const exporters = new Registry<Exporter>([
  { id: 'single-html', version: 1, label: 'Offline-HTML', export: exportHtml },
]);
