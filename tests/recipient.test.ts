import { isIosDevice } from '../src/studio/delivery';
import { describe, it, expect } from 'vitest';
import { createProject } from '../src/domain/project';
import { createMagicStart } from '../src/engines/magic-start';
import { projectExperience } from '../src/export/projection';
import { composeScenes } from '../src/engines/scenes';
import { exportHtml } from '../src/export/html';
import {
  exportRecipientFile,
  readRecipientFile,
} from '../src/export/recipient-file';
import { assertOfflineRuntime } from './runtime-contract';
function gift() {
  const p = createProject();
  p.recipient.name = 'Anna';
  p.answers.memory = { status: 'answered', value: 'PRIVATE_MEMORY' };
  return createMagicStart(p, 'A public sentence.');
}
describe('staged gift contract and recipient-only files', () => {
  it('groups each selected block once into seven stations and a closing without changing project order', () => {
    const p = gift();
    p.experience.blocks.reverse();
    const before = structuredClone(p);
    const experience = projectExperience(p);
    const scenes = composeScenes(experience);
    expect(scenes.map((s) => s.id)).toEqual([
      'opening',
      'curiosity',
      'choice',
      'moments',
      'letter',
      'surprise',
      'finale',
      'closing',
    ]);
    expect(
      scenes
        .flatMap((s) => s.blocks)
        .sort((a, b) => a.type.localeCompare(b.type)),
    ).toEqual(
      [...experience.blocks].sort((a, b) => a.type.localeCompare(b.type)),
    );
    expect(
      scenes.find((s) => s.id === 'letter')!.blocks[0].data.text,
    ).toContain('A public sentence.');
    expect(p).toEqual(before);
    assertOfflineRuntime(exportHtml(p));
  });
  it('round-trips only public data, never private drafts or identity metadata', () => {
    const p = gift();
    const raw = exportRecipientFile(p);
    expect(readRecipientFile(raw)).toEqual(projectExperience(p));
    for (const secret of [
      'PRIVATE_MEMORY',
      p.id,
      p.createdAt,
      'answers',
      'mediaId',
      'recovery',
    ])
      expect(raw).not.toContain(secret);
    expect(() => readRecipientFile(JSON.stringify(p))).toThrow();
  });
  it.each(['execute', 'apiKey', '__proto__', 'script'])(
    'rejects unauthorized envelope field %s',
    (field) => {
      const object = JSON.parse(exportRecipientFile(gift()));
      Object.defineProperty(object, field, {
        value: 'hostile',
        enumerable: true,
      });
      expect(() => readRecipientFile(JSON.stringify(object))).toThrow();
    },
  );
  it('rejects unknown/oversized/tampered data and network sources without executing or fetching them', () => {
    const raw = exportRecipientFile(gift());
    const mutate = (fn: (v: ReturnType<typeof JSON.parse>) => void) => {
      const v = JSON.parse(raw);
      fn(v);
      return JSON.stringify(v);
    };
    for (const bad of [
      '{broken',
      'a'.repeat(6 * 1024 * 1024 + 1),
      mutate((v) => (v.version = 2)),
      mutate((v) => (v.experience.themeId = '<style>')),
      mutate((v) => (v.experience.blocks[0].type = 'executable')),
      mutate((v) => (v.experience.blocks[0].data.internal = 'private')),
      mutate((v) => (v.experience.blocks[0].data.name = 'a'.repeat(121))),
      mutate((v) => (v.experience.externalDomains = ['https://evil.invalid'])),
      mutate((v) => (v.experience.profile = 'online')),
      mutate((v) =>
        v.experience.blocks.push({
          type: 'photo',
          version: 1,
          data: {
            alt: 'a',
            caption: 'b',
            fit: 'cover',
            position: 'center',
            src: 'data:image/svg+xml,<svg onload=evil()>',
          },
        }),
      ),
    ])
      expect(() => readRecipientFile(bad)).toThrow();
  });
  it('keeps hostile authored content inert and does not serialize creator-only preview station hints', () => {
    const p = gift();
    p.writing.letter = '<script>window.hacked=true</script>';
    p.experience.blocks.find((b) => b.type === 'letter')!.data.text =
      p.writing.letter;
    const html = exportHtml(p);
    assertOfflineRuntime(html);
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('data-preview-scene=');
    expect(exportHtml(p, {}, 'letter')).toContain(
      'data-preview-scene="letter"',
    );
  });
});

describe('local delivery hint', () => {
  it.each([
    ['iPhone', 'iPhone', 5, true],
    ['iPad', 'iPad', 5, true],
    ['Safari desktop', 'MacIntel', 5, true],
    ['Chrome Android', 'Linux armv8l', 5, false],
    ['Safari desktop', 'MacIntel', 0, false],
    ['Chrome', 'Win32', 0, false],
  ])(
    'chooses a safe presentation default for %s',
    (userAgent, platform, maxTouchPoints, expected) => {
      expect(
        isIosDevice({
          userAgent: String(userAgent),
          platform: String(platform),
          maxTouchPoints: Number(maxTouchPoints),
        }),
      ).toBe(expected);
    },
  );
});
