import { describe, it, expect, vi, afterEach } from 'vitest';
import { createHash } from 'node:crypto';
import { animationProgramSchema } from '../src/domain/animation';
import { createAiSession } from '../src/integrations/providers';
import {
  generationMessages,
  readGeneratedGift,
} from '../src/integrations/generation';
import {
  ANIMATION_HOST_HASH,
  ANIMATION_HOST_SCRIPT,
} from '../src/experience/animation-host';
import { createProject } from '../src/domain/project';
import { createMagicStart } from '../src/engines/magic-start';
import { exportHtml } from '../src/export/html';
import {
  exportRecipientFile,
  readRecipientFile,
} from '../src/export/recipient-file';
const program = {
  version: 1,
  source:
    'function frame(input){return [{kind:"circle",x:.5,y:.5,r:.01,color:"#D3AF63",alpha:.4}];}',
};
const gift = {
  version: 1,
  letter: 'Öffentliche Worte.',
  wish: 'Ein öffentlicher Wunsch.',
  surprise: '',
  animation: program,
};
const brief = {
  name: 'Demo',
  relationship: 'Freundschaft',
  direction: 'emotional',
  publicWords: 'Öffentliche Worte.',
  request: 'Mehr Licht.',
};
const response = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
afterEach(() => vi.unstubAllGlobals());
describe('AI generation and capability boundaries', () => {
  it('accepts new computed code, rejects capabilities and unknown credential fields', () => {
    expect(animationProgramSchema.parse(program)).toEqual(program);
    for (const source of [
      'function frame(){fetch("https://example.org");return [];}',
      'function frame(){return window.localStorage;}',
      'function frame(){return [];}' + ' '.repeat(16000),
    ])
      expect(() =>
        animationProgramSchema.parse({ version: 1, source }),
      ).toThrow();
    expect(() =>
      readGeneratedGift(JSON.stringify({ ...gift, apiKey: 'not allowed' })),
    ).toThrow();
    expect(() =>
      generationMessages({
        ...brief,
        answers: { private: 'never' },
      } as typeof brief),
    ).toThrow();
  });
  it('pins the isolated controller bytes independently', () =>
    expect(
      createHash('sha256').update(ANIMATION_HOST_SCRIPT).digest('base64'),
    ).toBe(ANIMATION_HOST_HASH));
  it('keeps generated code inert as template data, private answers out and old gift envelope compatible', () => {
    const p = createProject();
    p.recipient.name = 'Demo';
    p.answers.private = { status: 'answered', value: 'PRIVATE_SENTINEL' };
    const g = createMagicStart(p);
    g.experience.animation = {
      version: 1,
      source:
        'function frame(){const note="</template><script>attack()</script>";return [];}',
    };
    const html = exportHtml(g);
    expect(html).not.toContain('PRIVATE_SENTINEL');
    expect(html.match(/<script\b/g)).toHaveLength(1);
    expect(html).toContain('&lt;/template&gt;&lt;script&gt;');
    expect(readRecipientFile(exportRecipientFile(g)).animation).toEqual(
      g.experience.animation,
    );
    delete g.experience.animation;
    expect(readRecipientFile(exportRecipientFile(g)).animation).toBeUndefined();
  });
  it('uses documented PKCE without credentials in URLs, enforces free-only inference and clears session', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response({ key: 'test-secret-in-memory' }))
      .mockResolvedValueOnce(
        response({ choices: [{ message: { content: JSON.stringify(gift) } }] }),
      );
    vi.stubGlobal('fetch', fetchMock);
    const ai = createAiSession();
    const url = new URL(await ai.beginOpenRouter());
    expect(url.searchParams.get('code_challenge_method')).toBe('S256');
    expect(url.searchParams.has('code_verifier')).toBe(false);
    expect(url.searchParams.has('callback_url')).toBe(false);
    await ai.finishOpenRouter('test-code-valid');
    expect(ai.connected).toBe(true);
    expect(await ai.generate(brief, new AbortController().signal)).toEqual(
      gift,
    );
    const [endpoint, init] = fetchMock.mock.calls[1];
    expect(endpoint).toBe('https://openrouter.ai/api/v1/chat/completions');
    expect(JSON.parse(init.body).model).toBe('openrouter/free');
    expect(init.body).not.toContain('test-secret-in-memory');
    expect(init.headers.Authorization).toBe('Bearer test-secret-in-memory');
    ai.clear();
    expect(ai.connected).toBe(false);
    await expect(
      ai.generate(brief, new AbortController().signal),
    ).rejects.toThrow('zuerst');
  });
  it('does not reconnect after discarded in-flight authentication', async () => {
    let finish!: (r: Response) => void;
    vi.stubGlobal(
      'fetch',
      vi.fn(
        () =>
          new Promise<Response>((resolve) => {
            finish = resolve;
          }),
      ),
    );
    const ai = createAiSession();
    await ai.beginOpenRouter();
    const pending = ai.finishOpenRouter('test-code-valid');
    ai.clear();
    finish(response({ key: 'never-reconnected-key' }));
    await expect(pending).rejects.toThrow('verworfen');
    expect(ai.connected).toBe(false);
  });
  it('filters remote/cloud/local hostile model names and never installs models', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      response({
        models: [
          { name: 'local-coder:7b' },
          { name: 'other:cloud' },
          { name: 'remote', remote_host: 'https://example.org' },
          { name: 'bad?key=secret' },
        ],
      }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const ai = createAiSession();
    expect(await ai.localModels()).toEqual(['local-coder:7b']);
    await expect(ai.useLocal('other:cloud')).rejects.toThrow();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it('refuses a cloud-backed show result and preserves quota errors without paid retry', async () => {
    const mock = vi
      .fn()
      .mockResolvedValueOnce(response({ models: [{ name: 'local-coder:7b' }] }))
      .mockResolvedValueOnce(response({ remote_host: 'https://example.org' }));
    vi.stubGlobal('fetch', mock);
    const ai = createAiSession();
    await ai.localModels();
    await expect(ai.useLocal('local-coder:7b')).rejects.toThrow('Cloud');
    expect(ai.connected).toBe(false);
    mock
      .mockResolvedValueOnce(response({ key: 'test-secret-in-memory' }))
      .mockResolvedValueOnce(response({}, 429));
    await ai.beginOpenRouter();
    await ai.finishOpenRouter('test-code-valid');
    await expect(
      ai.generate(brief, new AbortController().signal),
    ).rejects.toThrow('Limit');
    expect(mock).toHaveBeenCalledTimes(4);
  });
});

it('rejects a response from a provider session changed during generation', async () => {
  let finish!: (r: Response) => void;
  const mock = vi
    .fn()
    .mockResolvedValueOnce(response({ key: 'SYNTHETIC_MEMORY_KEY' }))
    .mockImplementationOnce(
      () =>
        new Promise<Response>((resolve) => {
          finish = resolve;
        }),
    );
  vi.stubGlobal('fetch', mock);
  const ai = createAiSession();
  await ai.beginOpenRouter();
  await ai.finishOpenRouter('synthetic-code');
  const pending = ai.generate(brief, new AbortController().signal);
  ai.clear();
  finish(
    response({ choices: [{ message: { content: JSON.stringify(gift) } }] }),
  );
  await expect(pending).rejects.toThrow('inzwischen');
  expect(ai.connected).toBe(false);
});
