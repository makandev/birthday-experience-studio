import { describe, it, expect } from 'vitest';
import { createProject, parseProject } from '../src/domain/project';
import { activeQuestions, questionProgress } from '../src/engines/questions';
import { recommendBlocks, syncComposition } from '../src/engines/composition';
import { writingHelpers } from '../src/engines/writing';
import { Registry } from '../src/registries/registry';
import { questionPacks } from '../src/registries/questions';
import { relationships } from '../src/registries/relationships';

describe('versioned domain and registries', () => {
  it('round-trips a project and does not mutate input', () => {
    const project = createProject();
    expect(parseProject(JSON.parse(JSON.stringify(project)))).toEqual(project);
    expect(project.schemaVersion).toBe(2);
  });
  it.each([0, 3, 'broken'])('refuses unsupported schema %s', (version) =>
    expect(() =>
      parseProject({ ...createProject(), schemaVersion: version }),
    ).toThrow(),
  );
  it('refuses malformed persisted data', () =>
    expect(() =>
      parseProject({ ...createProject(), answers: { secret: 'unvalidated' } }),
    ).toThrow());
  it('rejects duplicate registrations', () => {
    const registry = new Registry([{ id: 'one', version: 1 }]);
    expect(() => registry.register({ id: 'one', version: 1 })).toThrow(
      'Duplicate',
    );
  });
  it('defines relationship types as configuration', () => {
    expect(relationships.get('partner')?.label).toBe('Partner/in');
    expect(relationships.get('mentor')?.context).toBe('professional');
    expect(relationships.get('uncertain')?.context).toBe('mixed');
  });
});
describe('adaptive question engine', () => {
  it('branches on humor and ignores stale answers when the branch changes', () => {
    const project = createProject();
    project.mode = 'deep';
    expect(activeQuestions(project).map((q) => q.id)).not.toContain('insider');
    project.answers.humor = { status: 'answered', value: 'yes' };
    expect(activeQuestions(project).map((q) => q.id)).toContain('insider');
    project.answers.insider = {
      status: 'answered',
      value: 'stale private joke',
    };
    project.answers.humor.value = 'no';
    expect(activeQuestions(project).map((q) => q.id)).not.toContain('insider');
    expect(
      writingHelpers.get('external-prompt')!.generate(project),
    ).not.toContain('stale private joke');
  });
  it('handles uncertain and professional relationships', () => {
    const project = createProject();
    project.relationship.uncertain = true;
    project.mode = 'deep';
    project.relationship.dimensions.context = 'professional';
    expect(activeQuestions(project).map((q) => q.id)).toEqual(
      expect.arrayContaining(['connection', 'professional']),
    );
  });
  it('expands deep mode and deterministically computes progress', () => {
    const project = createProject();
    const quick = activeQuestions(project).length;
    project.mode = 'deep';
    expect(activeQuestions(project).length).toBeGreaterThan(quick);
    project.answers.qualities = { status: 'unknown', value: '' };
    project.answers.memory = { status: 'skipped', value: '' };
    expect(questionProgress(project).done).toBe(2);
    expect(activeQuestions(project)).toEqual(
      activeQuestions(structuredClone(project)),
    );
  });
  it('adapts Deep questions to dimension thresholds without deleting hidden answers', () => {
    const project = createProject();
    Object.assign(project.relationship.dimensions, {
      closeness: 3,
      trust: 3,
      emotionality: 2,
      yearsKnown: 4,
    });
    project.mode = 'deep';
    const ids = () => activeQuestions(project).map((question) => question.id);
    expect(ids()).not.toContain('everyday-care');
    expect(ids()).not.toContain('quiet-strength');
    expect(ids()).not.toContain('shared-change');
    Object.assign(project.relationship.dimensions, {
      closeness: 4,
      trust: 4,
      emotionality: 3,
      yearsKnown: 5,
    });
    expect(ids()).toEqual(
      expect.arrayContaining([
        'everyday-care',
        'quiet-strength',
        'shared-change',
      ]),
    );
    project.answers['quiet-strength'] = {
      status: 'answered',
      value: 'PRIVATE_HIDDEN_ANSWER',
    };
    project.relationship.dimensions.trust = 3;
    expect(ids()).not.toContain('quiet-strength');
    expect(project.answers['quiet-strength'].value).toBe(
      'PRIVATE_HIDDEN_ANSWER',
    );
    expect(
      writingHelpers.get('external-prompt')!.generate(project),
    ).not.toContain('PRIVATE_HIDDEN_ANSWER');
    project.mode = 'quick';
    expect(ids()).not.toContain('everyday-care');
    expect(ids()).not.toContain('shared-change');
  });
  it('keeps Quick compact across uncertainty, humor and professional branches', () => {
    const project = createProject();
    project.relationship.uncertain = true;
    project.relationship.dimensions.context = 'professional';
    project.answers.humor = { status: 'answered', value: 'yes' };
    const count = activeQuestions(project).length;
    expect(count).toBe(3);
    expect(activeQuestions(project).map((q) => q.id)).toEqual([
      'qualities',
      'memory',
      'tone',
    ]);
  });
  it('allows packs to add questions without changing UI or the engine', () => {
    questionPacks.register({
      id: 'test-extension',
      version: 1,
      questions: [
        {
          id: 'test-deep-extension',
          version: 1,
          prompt: 'Another memory?',
          help: '',
          examples: [],
          type: 'text',
          tags: [],
          rules: [{ kind: 'mode', value: 'deep' }],
        },
      ],
    });
    const project = createProject();
    project.mode = 'deep';
    expect(activeQuestions(project).at(-1)?.id).toBe('test-deep-extension');
  });
});
describe('writing and composition', () => {
  it('guided writing uses explicit selected answers, never private boundaries', () => {
    const project = createProject();
    project.recipient.name = 'Anna';
    project.answers.qualities = { status: 'answered', value: 'Du hörst zu.' };
    project.answers.boundaries = {
      status: 'answered',
      value: 'PRIVATE_SENTINEL',
    };
    const draft = writingHelpers.get('guided-letter')!.generate(project);
    expect(draft).toContain('Du hörst zu.');
    expect(draft).not.toContain('PRIVATE_SENTINEL');
    expect(project.writing.letter).toBe('');
  });
  it('preserves creator order and disabled blocks while syncing content', () => {
    const project = createProject();
    project.writing.letter = 'First';
    syncComposition(project);
    project.experience.blocks.reverse();
    project.experience.blocks.find((b) => b.type === 'letter')!.enabled = false;
    project.writing.letter = 'Updated';
    syncComposition(project);
    expect(project.experience.blocks[0].type).toBe('finale');
    expect(
      project.experience.blocks.find((b) => b.type === 'letter'),
    ).toMatchObject({ enabled: false, data: { text: 'Updated' } });
  });
  it('recommends optional blocks only when content exists', () => {
    const project = createProject();
    expect(
      recommendBlocks(project).find((b) => b.type === 'reveal')!.enabled,
    ).toBe(false);
    project.writing.surprise = 'Breakfast together';
    expect(
      recommendBlocks(project).find((b) => b.type === 'reveal')!.enabled,
    ).toBe(true);
  });
});
