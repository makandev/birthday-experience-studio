import { describe, it, expect } from 'vitest';
import { createProject, parseProject } from '../src/domain/project';
import {
  experiencePlanSchema,
  concepts,
  type ExperiencePlan,
} from '../src/domain/experience-plan';
import { createMagicStart } from '../src/engines/magic-start';
import { composeScenes } from '../src/engines/scenes';
import { alignExperiencePlan } from '../src/engines/composition';
import { projectExperience } from '../src/export/projection';
import { exportHtml } from '../src/export/html';
import {
  exportRecipientFile,
  readRecipientFile,
} from '../src/export/recipient-file';
import { readDraft, writeDraft } from '../src/persistence/drafts';
import {
  readGeneratedGift,
  generationMessages,
} from '../src/integrations/generation';
const plan: ExperiencePlan = {
  version: 1,
  concept: 'atelier',
  pace: 'gentle',
  sceneOrder: ['opening', 'choice', 'letter', 'surprise', 'finale', 'closing'],
};
function gift() {
  const p = createProject();
  p.recipient.name = 'Demo';
  const g = createMagicStart(p, 'Öffentliche Worte.');
  g.experience.plan = structuredClone(plan);
  g.answers.private = {
    status: 'answered',
    value: 'REVISION_PRIVATE_SENTINEL',
  };
  return g;
}
describe('bounded revision plans', () => {
  it('retains legacy gifts, migrations and explicit compatible plan round trips', () => {
    const legacy = gift();
    delete legacy.experience.plan;
    expect(parseProject(legacy).experience.plan).toBeUndefined();
    const g = gift();
    expect(readDraft(writeDraft(g)).experience.plan).toEqual(plan);
    expect(readRecipientFile(exportRecipientFile(g)).plan).toEqual(plan);
    expect(exportHtml(g)).not.toContain('REVISION_PRIVATE_SENTINEL');
  });
  it.each([
    { ...plan, concept: 'plugin' },
    { ...plan, version: 2 },
    { ...plan, source: 'alert(1)' },
    {
      ...plan,
      sceneOrder: ['opening', 'letter', 'letter', 'finale', 'closing'],
    },
    { ...plan, sceneOrder: ['letter', 'opening', 'finale', 'closing'] },
    {
      ...plan,
      sceneOrder: ['opening', 'choice', 'letter', 'finale', 'closing'],
    },
    { ...plan, sceneOrder: ['opening', 'finale', 'letter', 'closing'] },
  ])('rejects unknown capabilities and malformed routes %#', (candidate) =>
    expect(() => experiencePlanSchema.parse(candidate)).toThrow(),
  );
  it('rejects unavailable photos and any route that omits approved content', () => {
    const g = gift();
    g.experience.plan!.sceneOrder.splice(2, 0, 'moments');
    expect(() => exportHtml(g)).toThrow('Foto');
    g.experience.plan!.sceneOrder = ['opening', 'letter', 'finale', 'closing'];
    expect(() => exportHtml(g)).toThrow('auslassen');
  });
  it.each(concepts)(
    'renders distinct opening/interaction/finale contracts for $id',
    (concept) => {
      const g = gift();
      g.experience.plan!.concept = concept.id;
      const html = exportHtml(g);
      expect(html).toContain(`data-concept="${concept.id}"`);
      expect(html).toContain('data-final-focus="words"');
      expect(html).toContain('data-route="letter"');
      expect(composeScenes(projectExperience(g)).map((s) => s.id)).toEqual(
        plan.sceneOrder,
      );
    },
  );
  it('aligns deliberate edits without empty stations or silent content loss', () => {
    const g = gift();
    g.experience.blocks = g.experience.blocks.filter(
      (b) => !['wish', 'reveal'].includes(b.type),
    );
    alignExperiencePlan(g);
    expect(g.experience.plan!.sceneOrder).toEqual([
      'opening',
      'letter',
      'finale',
      'closing',
    ]);
    expect(() => exportHtml(g)).not.toThrow();
  });
  it('validates AI plans as data and brief excludes private content/credentials', () => {
    expect(
      readGeneratedGift(
        JSON.stringify({
          version: 1,
          letter: 'Worte',
          wish: 'Wunsch',
          surprise: '',
          plan,
          animation: { version: 1, source: 'function frame(){return [];}' },
        }),
      ).plan,
    ).toEqual(plan);
    const brief = {
      name: 'Demo',
      relationship: 'Freundschaft',
      direction: 'emotional',
      publicWords: 'Öffentlich',
      request: '',
      concept: 'atelier' as const,
      hasPhoto: false,
    };
    const prompt = JSON.stringify(generationMessages(brief));
    expect(prompt).toContain('Plan is REQUIRED');
    expect(prompt).not.toContain('REVISION_PRIVATE_SENTINEL');
    expect(() =>
      generationMessages({ ...brief, apiKey: 'NO' } as typeof brief),
    ).toThrow();
  });
});
