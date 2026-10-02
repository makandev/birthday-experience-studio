import { parseProject, type CreatorProject } from '../domain/project';
import { parseBoundedJson, MAX_PROJECT_BYTES } from '../security/json';
export function readDraft(raw: string): CreatorProject {
  try {
    return parseProject(parseBoundedJson(raw));
  } catch {
    throw new Error(
      'Dieser Entwurf ist beschädigt, zu groß oder benötigt eine andere BES-Version. Dein aktuelles Geschenk bleibt erhalten.',
    );
  }
}
export function writeDraft(project: CreatorProject): string {
  const parsed = parseProject(project);
  const raw = JSON.stringify(parsed, null, 2);
  if (new TextEncoder().encode(raw).byteLength > MAX_PROJECT_BYTES)
    throw new Error('Der Entwurf ist zu groß zum Sichern.');
  return raw;
}
