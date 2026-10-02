import { URL } from 'node:url';
import { log } from 'node:console';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
// Maintained literals only; no eval, imported project or AI source execution.
const hostPath = new URL(
  '../src/experience/animation-host.ts',
  import.meta.url,
);
let hostText = await readFile(hostPath, 'utf8');
const hostScript = hostText.match(/String\.raw`([\s\S]*?)`;/)?.[1];
if (!hostScript) throw new Error('Missing maintained host literal');
const sha = (value) => createHash('sha256').update(value).digest('base64');
hostText = hostText.replace(
  /export const ANIMATION_HOST_HASH\s*=\s*'[^']+';/,
  `export const ANIMATION_HOST_HASH = '${sha(hostScript)}';`,
);
await writeFile(hostPath, hostText);
const { ANIMATION_HOST_HTML } = await import(hostPath.href);
const runtimePath = new URL('../src/experience/runtime.ts', import.meta.url);
let runtimeText = await readFile(runtimePath, 'utf8');
const body = runtimeText.match(/String\.raw`([\s\S]*?)`;/)?.[1];
if (!body) throw new Error('Missing maintained runtime literal');
const runtime =
  `(()=>{const BES_ANIMATION_HOST=${JSON.stringify(ANIMATION_HOST_HTML).replace(/</g, '\\u003c')};\n` +
  body;
runtimeText = runtimeText.replace(
  /export const RECIPIENT_RUNTIME_HASH\s*=\s*'[^']+';/,
  `export const RECIPIENT_RUNTIME_HASH = '${sha(runtime)}';`,
);
await writeFile(runtimePath, runtimeText);
log('Updated both maintained CSP hashes; run tests to verify exact bytes.');
