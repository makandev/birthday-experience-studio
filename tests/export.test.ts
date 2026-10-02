import { assertOfflineRuntime } from './runtime-contract';
import { describe, it, expect } from 'vitest';
import { createProject } from '../src/domain/project';
import { syncComposition } from '../src/engines/composition';
import { projectExperience } from '../src/export/projection';
import { exportHtml, exportFilename } from '../src/export/html';
function fixture() {
  const project = createProject();
  project.recipient.name = 'Anna';
  project.writing.letter = 'Ein persönlicher Brief.';
  project.writing.wish = 'Ein wundervolles Jahr.';
  project.writing.surprise = 'Ein gemeinsames Frühstück!';
  syncComposition(project);
  return project;
}
describe('recipient-safe single HTML export', () => {
  it('exports only allowed recipient content', () => {
    const project = fixture();
    project.answers.boundaries = {
      status: 'answered',
      value: 'PRIVATE_ANSWER_SENTINEL',
    };
    project.answers.memory = {
      status: 'answered',
      value: 'PRIVATE_MEMORY_ANSWER',
    };
    project.memories = [
      {
        id: 'PRIVATE_MEMORY_ID',
        text: 'PRIVATE_MEMORY_TEXT',
        recipientVisible: false,
      },
    ];
    project.media = [
      {
        id: 'PRIVATE_MEDIA_ID',
        kind: 'image',
        mimeType: 'image/png',
        name: 'PRIVATE_MEDIA_NAME',
        size: 100,
        source: { type: 'unavailable' },
      },
    ];
    project.experience.blocks[0].data.internal = 'PRIVATE_BLOCK_FIELD';
    const html = exportHtml(project);
    for (const secret of [
      'PRIVATE_ANSWER_SENTINEL',
      'PRIVATE_MEMORY_ANSWER',
      'PRIVATE_MEMORY_ID',
      'PRIVATE_MEMORY_TEXT',
      'PRIVATE_MEDIA_NAME',
      'PRIVATE_BLOCK_FIELD',
      project.id,
      project.createdAt,
      'creator-project',
      'boundaries',
      'Prompt kopieren',
    ])
      expect(html).not.toContain(secret);
    expect(html).toContain('Ein persönlicher Brief.');
    expect(html).toContain('<details>');
    expect(html).toContain('<summary>');
    expect(Object.keys(projectExperience(project)).sort()).toEqual(
      [
        'schemaVersion',
        'locale',
        'themeId',
        'directionId',
        'intensity',
        'profile',
        'externalDomains',
        'blocks',
      ].sort(),
    );
  });
  it('escapes hostile names and all authored text', () => {
    const project = fixture();
    project.recipient.name = '<img src=x onerror=alert(1)>';
    project.writing.letter =
      '</style><script>alert(1)</script>\n\n"Hello" & goodbye';
    syncComposition(project);
    const html = exportHtml(project);
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&amp; goodbye');
  });
  it('allows only its pinned local runtime, no links or remote assets or creator UI and includes a restrictive CSP', () => {
    const html = exportHtml(fixture());
    assertOfflineRuntime(html);
    expect(html).not.toMatch(/https?:\/\//i);
    expect(html).toContain("default-src 'none'");
    expect(html).toContain("form-action 'none'");
    expect(html).toContain('prefers-reduced-motion');
  });
  it('is deterministic and leaves creator state untouched', () => {
    const project = fixture();
    const before = structuredClone(project);
    expect(exportHtml(project)).toBe(exportHtml(project));
    expect(project).toEqual(before);
  });
  it('blocks enabled unknown extensions but allows disabling them', () => {
    const project = fixture();
    project.experience.blocks.push({
      id: 'future',
      type: 'future-type',
      version: 7,
      enabled: true,
      data: { text: 'private' },
    });
    expect(() => exportHtml(project)).toThrow('nicht unterstützt');
    project.experience.blocks.at(-1)!.enabled = false;
    expect(exportHtml(project)).not.toContain('private');
  });
  it('rejects unsupported block versions', () => {
    const project = fixture();
    project.experience.blocks[0].version = 2;
    expect(() => exportHtml(project)).toThrow('nicht unterstützt');
  });
  it('rejects missing content and an empty composition', () => {
    const project = fixture();
    project.experience.blocks[0].data.name = '';
    expect(() => exportHtml(project)).toThrow('ergänze');
    project.experience.blocks.forEach((b) => (b.enabled = false));
    expect(() => exportHtml(project)).toThrow('mindestens');
  });
  it('falls back gracefully for unknown themes', () => {
    const project = fixture();
    project.experience.themeId = 'future-theme';
    expect(projectExperience(project).themeId).toBe('warm');
  });
  it('creates safe filenames', () => {
    expect(exportFilename('../Anna/<script>')).toBe(
      'Happy-Birthday-Anna-script.html',
    );
    expect(exportFilename('🌸')).toBe('Happy-Birthday-Geschenk.html');
  });
});
