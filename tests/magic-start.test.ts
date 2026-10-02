import { describe, expect, it } from 'vitest';
import { createProject } from '../src/domain/project';
import { createMagicStart } from '../src/engines/magic-start';
import { exporters } from '../src/export/html';

describe('explicit public Magic Start', () => {
  it('preserves an already authored public letter when creating a first composition', () => {
    const p = createProject();
    p.recipient.name = 'Anna';
    p.writing.letter = 'My existing letter';
    expect(createMagicStart(p).writing.letter).toBe('My existing letter');
  });
  it('makes a coherent gift from a public seed without mutating or reading private answers', () => {
    const project = createProject();
    project.recipient.name = '  Anna  ';
    project.answers.qualities = {
      status: 'answered',
      value: 'PRIVATE_QUALITY',
    };
    project.answers.memory = { status: 'answered', value: 'PRIVATE_MEMORY' };
    project.answers.boundaries = {
      status: 'answered',
      value: 'PRIVATE_BOUNDARY',
    };
    const snapshot = structuredClone(project);
    const result = createMagicStart(project, '  Danke für dein offenes Ohr.  ');
    expect(project).toEqual(snapshot);
    expect(result.answers).toEqual(snapshot.answers);
    expect(result.writing.letter).toBe(
      'Hallo Anna,\n\nDanke für dein offenes Ohr.\n\nAlles Gute zum Geburtstag!',
    );
    expect(result.workflow.step).toBe('preview');
    expect(
      result.experience.blocks.filter((b) => b.enabled).map((b) => b.type),
    ).toEqual(['intro', 'letter', 'wish', 'finale']);
    const html = exporters.get('single-html')!.export(result);
    expect(html).toContain('Danke für dein offenes Ohr.');
    expect(html).not.toContain('PRIVATE_');
  });
  it('uses the existing respectful professional direction and preserves IDs and profiles', () => {
    const project = createProject();
    project.recipient.name = 'Kim';
    project.relationship.typeId = 'colleague';
    project.relationship.dimensions.context = 'professional';
    project.experience.directionId = 'elegant';
    const result = createMagicStart(
      project,
      'Die Zusammenarbeit mit dir macht Freude.',
    );
    expect(result.experience).toMatchObject({
      directionId: 'elegant',
      themeId: 'minimal',
    });
    expect(result.id).toBe(project.id);
    expect(result.exportConfig).toEqual(project.exportConfig);
  });
  it('rejects blank/oversized input and refuses to replace a composed or surprise-bearing gift', () => {
    const project = createProject();
    expect(() => createMagicStart(project, 'A public sentence')).toThrow();
    project.recipient.name = 'Sam';
    expect(createMagicStart(project).workflow.step).toBe('preview');
    expect(() => createMagicStart(project, 'a'.repeat(2001))).toThrow();
    const result = createMagicStart(project, 'A public sentence');
    expect(() => createMagicStart(result, 'Replace it')).toThrow();
    project.writing.surprise = 'An authored surprise';
    expect(() => createMagicStart(project, 'Replace it')).toThrow();
    expect(project.writing.surprise).toBe('An authored surprise');
  });
  it('renders hostile recipient-visible seed content as inert text in the offline projection', () => {
    const project = createProject();
    project.recipient.name = '<img src=x onerror=alert(1)>';
    const result = createMagicStart(
      project,
      '<script>fetch("https://evil.invalid")</script>',
    );
    const html = exporters.get('single-html')!.export(result);
    expect(html).not.toMatch(/<script>|<img\b/i);
    expect(html.match(/<script\b/g)).toHaveLength(1);
    expect(html).toContain('&lt;script&gt;');
  });
});
