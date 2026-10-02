import {
  generationMessages,
  readGeneratedGift,
  type PublicBrief,
  type GeneratedGift,
} from './generation';
import { z } from 'zod';
import { parseBoundedJson } from '../security/json';
// Credentials live only in this closure. Never persisted/exported or returned to UI.
export function createAiSession() {
  let token = '',
    verifier = '',
    model = '';
  let epoch = 0;
  let provider: 'openrouter' | 'ollama' | null = null;
  const knownLocalModels = new Set<string>();
  async function read(response: Response): Promise<unknown> {
    if (!response.ok) {
      if (response.status === 429)
        throw new Error(
          'Das kostenlose KI-Limit ist erreicht. Warte etwas oder nutze lokale KI.',
        );
      if (response.status === 401 || response.status === 403)
        throw new Error(
          'Die KI-Verbindung wurde abgelehnt. Bitte neu verbinden.',
        );
      throw new Error(
        'Die KI ist gerade nicht erreichbar. Es wird kein kostenpflichtiges Modell verwendet.',
      );
    }
    const reader = response.body?.getReader();
    if (!reader) throw new Error('Die KI hat keine Antwort geliefert.');
    const parts: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const item = await reader.read();
      if (item.done) break;
      size += item.value.byteLength;
      if (size > 128000) {
        await reader.cancel();
        throw new Error('Die KI-Antwort ist zu groß.');
      }
      parts.push(item.value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const part of parts) {
      bytes.set(part, offset);
      offset += part.length;
    }
    return parseBoundedJson(new TextDecoder().decode(bytes), 128000);
  }
  return {
    get connected() {
      return provider !== null;
    },
    get label() {
      return provider === 'openrouter'
        ? 'Kostenlose Online-KI'
        : provider === 'ollama'
          ? 'Lokale KI'
          : 'Noch keine KI verbunden';
    },
    clear() {
      epoch++;
      token = '';
      verifier = '';
      model = '';
      provider = null;
      knownLocalModels.clear();
    },
    async beginOpenRouter(): Promise<string> {
      epoch++;
      verifier = Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) =>
        b.toString(16).padStart(2, '0'),
      ).join('');
      const digest = new Uint8Array(
        await crypto.subtle.digest(
          'SHA-256',
          new TextEncoder().encode(verifier),
        ),
      );
      const challenge = btoa(String.fromCharCode(...digest))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      const url = new URL('https://openrouter.ai/auth');
      url.searchParams.set('code_challenge', challenge);
      url.searchParams.set('code_challenge_method', 'S256');
      url.searchParams.set(
        'key_label',
        'Birthday Experience Studio — free only',
      );
      return url.href;
    },
    async finishOpenRouter(code: string): Promise<void> {
      if (!verifier || !/^[a-zA-Z0-9_-]{8,512}$/.test(code.trim()))
        throw new Error('Bitte den gültigen Anmeldecode eingeben.');
      const requestEpoch = epoch;
      const result = await read(
        await fetch('https://openrouter.ai/api/v1/auth/keys', {
          method: 'POST',
          credentials: 'omit',
          referrerPolicy: 'no-referrer',
          signal: AbortSignal.timeout(20000),
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: code.trim(),
            code_verifier: verifier,
            code_challenge_method: 'S256',
          }),
        }),
      );
      if (epoch !== requestEpoch)
        throw new Error('Die Anmeldung wurde inzwischen verworfen.');
      token = z.object({ key: z.string().min(10).max(1024) }).parse(result).key;
      verifier = '';
      provider = 'openrouter';
      model = 'openrouter/free';
    },
    async localModels(): Promise<string[]> {
      const result = await read(
        await fetch('http://127.0.0.1:11434/api/tags', {
          credentials: 'omit',
          referrerPolicy: 'no-referrer',
          signal: AbortSignal.timeout(5000),
        }),
      );
      const list = z
        .object({
          models: z
            .array(
              z
                .object({
                  name: z.string().max(128),
                  remote_host: z.string().optional(),
                  remote_model: z.string().optional(),
                })
                .passthrough(),
            )
            .max(100),
        })
        .parse(result);
      knownLocalModels.clear();
      for (const item of list.models)
        if (
          /^[a-zA-Z0-9_.:/-]+$/.test(item.name) &&
          !/:cloud\b/.test(item.name) &&
          !item.remote_host &&
          !item.remote_model
        )
          knownLocalModels.add(item.name);
      return [...knownLocalModels];
    },
    async useLocal(name: string): Promise<void> {
      if (!knownLocalModels.has(name))
        throw new Error('Bitte ein installiertes lokales Modell auswählen.');
      const requestEpoch = epoch;
      const result = await read(
        await fetch('http://127.0.0.1:11434/api/show', {
          method: 'POST',
          credentials: 'omit',
          referrerPolicy: 'no-referrer',
          signal: AbortSignal.timeout(5000),
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: name }),
        }),
      );
      const info = z
        .object({
          remote_host: z.string().optional(),
          remote_model: z.string().optional(),
        })
        .passthrough()
        .parse(result);
      if (info.remote_host || info.remote_model)
        throw new Error('Cloud-Modelle sind keine lokale KI.');
      if (epoch !== requestEpoch)
        throw new Error('Die Verbindung wurde inzwischen verworfen.');
      epoch++;
      model = name;
      provider = 'ollama';
      token = '';
      verifier = '';
    },
    async generate(
      brief: PublicBrief,
      signal: AbortSignal,
    ): Promise<GeneratedGift> {
      if (!provider) throw new Error('Bitte zuerst eine KI verbinden.');
      const activeProvider = provider;
      const messages = generationMessages(brief);
      const response = await fetch(
        provider === 'openrouter'
          ? 'https://openrouter.ai/api/v1/chat/completions'
          : 'http://127.0.0.1:11434/api/chat',
        {
          method: 'POST',
          credentials: 'omit',
          referrerPolicy: 'no-referrer',
          signal: AbortSignal.any([signal, AbortSignal.timeout(90000)]),
          headers: {
            'Content-Type': 'application/json',
            ...(provider === 'openrouter'
              ? { Authorization: 'Bearer ' + token }
              : {}),
          },
          body: JSON.stringify(
            provider === 'openrouter'
              ? {
                  model: 'openrouter/free',
                  messages,
                  stream: false,
                  max_tokens: 6000,
                  response_format: { type: 'json_object' },
                }
              : {
                  model,
                  messages,
                  stream: false,
                  format: 'json',
                  options: { temperature: 0.5, num_predict: 6000 },
                },
          ),
        },
      );
      const result = await read(response);
      const content =
        activeProvider === 'openrouter'
          ? z
              .object({
                choices: z
                  .array(
                    z.object({
                      message: z.object({ content: z.string().max(64000) }),
                    }),
                  )
                  .min(1)
                  .max(10),
              })
              .parse(result).choices[0].message.content
          : z
              .object({ message: z.object({ content: z.string().max(64000) }) })
              .parse(result).message.content;
      return readGeneratedGift(content);
    },
  };
}
