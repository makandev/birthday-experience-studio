import { log } from 'node:console';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, relative, isAbsolute } from 'node:path';
const directory = resolve('dist');
async function asset(url) {
  if (!url.startsWith('/assets/'))
    throw new Error('Unexpected bundle reference');
  const path = resolve(directory, url.slice(1));
  const local = relative(directory, path);
  if (local.startsWith('..') || isAbsolute(local))
    throw new Error('Bundle path escapes dist');
  return readFile(path, 'utf8');
}
let html = await readFile(resolve(directory, 'index.html'), 'utf8');
const script = html.match(/<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/);
const style = html.match(/<link\b[^>]*\bhref="([^"]+\.css)"[^>]*>/);
if (!script || !style) throw new Error('Build the current Vite bundle first');
const js = (await asset(script[1])).replace(/<\/script/gi, '<\\/script');
const css = (await asset(style[1])).replace(/<\/style/gi, '<\\/style');
html = html
  .replace(script[0], () => `<script type="module">${js}</script>`)
  .replace(style[0], () => `<style>${css}</style>`);
await writeFile(resolve(directory, 'BES-Test-0.2.html'), html);
log('Created dist/BES-Test-0.2.html from the current production bundle');
