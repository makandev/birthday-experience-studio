import { describe, expect, it } from 'vitest';
import { createProject, parseProject } from '../src/domain/project';
import { createMagicStart } from '../src/engines/magic-start';
import {
  composeScenes,
  experienceStrategy,
  publicCoreMessage,
} from '../src/engines/scenes';
import { projectExperience } from '../src/export/projection';
import {
  exportRecipientFile,
  readRecipientFile,
} from '../src/export/recipient-file';
import { readDraft, writeDraft } from '../src/persistence/drafts';
function project(direction: 'emotional' | 'funny' | 'cinematic' = 'emotional') {
  const p = createProject();
  p.recipient.name = 'Alex';
  p.experience.directionId = direction;
  const gift = createMagicStart(
    p,
    'Unser erfundener Ausflug war voller kleiner Entdeckungen.',
  );
  gift.experience.composition = {
    version: 1,
    variant: 'challenger',
    arc: 'portrait',
  };
  return gift;
}
describe('bounded variable scene composition', () => {
  it('preserves historical v2 projects and recipient files as Champion until explicit adoption', () => {
    const p = project();
    delete p.experience.composition;
    expect(parseProject(p)).toEqual(p);
    expect(readDraft(writeDraft(p))).toEqual(p);
    const exported = readRecipientFile(exportRecipientFile(p));
    expect(experienceStrategy(exported).variant).toBe('champion');
    expect(composeScenes(exported).map((s) => s.id)).toEqual([
      'opening',
      'curiosity',
      'choice',
      'moments',
      'letter',
      'surprise',
      'finale',
      'closing',
    ]);
  });
  it('produces three different complete arcs and fitting finales from identical public ingredients', () => {
    const plans = ['emotional', 'funny', 'cinematic'].map((d) => {
      const e = projectExperience(
        project(d as 'emotional' | 'funny' | 'cinematic'),
      );
      return {
        order: composeScenes(e)
          .map((s) => s.id)
          .join(','),
        finale: experienceStrategy(e).finale,
      };
    });
    expect(new Set(plans.map((p) => p.order)).size).toBe(3);
    expect(plans.map((p) => p.finale)).toEqual([
      'keepsake',
      'celebration',
      'cinema',
    ]);
  });
  it.each(['emotional', 'funny', 'cinematic'] as const)(
    'keeps every public block exactly once across both %s arcs, without mutation',
    (direction) => {
      const p = project(direction);
      const e = projectExperience(p);
      e.blocks.push({
        type: 'photo',
        version: 1,
        data: {
          alt: 'Synthetic',
          caption: 'Public',
          src: 'mock-only',
          fit: 'contain',
          position: 'center',
        },
      });
      for (const arc of ['portrait', 'encore'] as const) {
        e.composition!.arc = arc;
        const before = structuredClone(e);
        const scenes = composeScenes(e);
        expect(scenes.flatMap((s) => s.blocks)).toHaveLength(e.blocks.length);
        for (const block of e.blocks)
          expect(
            scenes.flatMap((s) => s.blocks).filter((b) => b === block),
          ).toHaveLength(1);
        expect(new Set(scenes.map((s) => s.id)).size).toBe(scenes.length);
        expect(scenes[0].id).toBe('opening');
        expect(scenes.at(-1)!.id).toBe('closing');
        expect(e).toEqual(before);
      }
    },
  );
  it('omits absent content rather than inventing a memory or keeping an empty letter/reveal', () => {
    const p = project();
    p.experience.blocks = p.experience.blocks.filter((b) =>
      ['intro', 'finale'].includes(b.type),
    );
    expect(composeScenes(projectExperience(p)).map((s) => s.id)).toEqual([
      'opening',
      'choice',
      'curiosity',
      'finale',
      'closing',
    ]);
  });
  it('alternate arcs change dramaturgy and preserve photo/text/settings without random effects', () => {
    const p = project();
    const first = composeScenes(projectExperience(p)).map((s) => s.id);
    p.experience.composition!.arc = 'encore';
    expect(composeScenes(projectExperience(p)).map((s) => s.id)).not.toEqual(
      first,
    );
    expect(readRecipientFile(exportRecipientFile(p))).toEqual(
      projectExperience(p),
    );
  });
  it('projects only derived safe style decisions and a public core message, never private context', () => {
    const p = project();
    p.answers.secret = { status: 'answered', value: 'PRIVATE_DETAIL' };
    p.relationship.typeId = 'boss';
    p.relationship.dimensions.context = 'professional';
    p.relationship.dimensions.formality = 5;
    const e = projectExperience(p);
    const raw = exportRecipientFile(p);
    expect(e.composition!.register).toBe('respectful');
    for (const key of [
      'PRIVATE_DETAIL',
      'relationship',
      'formality',
      'closeness',
      'yearsKnown',
      'boss',
    ])
      expect(raw).not.toContain(key);
    expect(publicCoreMessage(e)).toBe(
      'Unser erfundener Ausflug war voller kleiner Entdeckungen.',
    );
  });
  it('rejects unsupported recipe versions/values and untrusted added fields', () => {
    for (const setting of [
      { version: 2, variant: 'challenger', arc: 'portrait' },
      { version: 1, variant: 'execute', arc: 'portrait' },
      { version: 1, variant: 'challenger', arc: 'portrait', script: 'evil' },
    ]) {
      const p = project();
      Object.assign(p.experience, { composition: setting });
      expect(() => parseProject(p)).toThrow();
    }
    const raw = JSON.parse(exportRecipientFile(project()));
    raw.experience.composition.instructions = 'run';
    expect(() => readRecipientFile(JSON.stringify(raw))).toThrow();
  });
});
