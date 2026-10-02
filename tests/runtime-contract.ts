import { expect } from 'vitest';
import { createHash } from 'node:crypto';
import {
  RECIPIENT_RUNTIME,
  RECIPIENT_RUNTIME_HASH,
} from '../src/experience/runtime';
export function assertOfflineRuntime(html: string): void {
  expect(html.match(/<script\b/g)).toHaveLength(1);
  expect(html).toContain(
    `<script data-bes-runtime="1">${RECIPIENT_RUNTIME}</script>`,
  );
  expect(createHash('sha256').update(RECIPIENT_RUNTIME).digest('base64')).toBe(
    RECIPIENT_RUNTIME_HASH,
  );
  expect(html).toContain(`script-src 'sha256-${RECIPIENT_RUNTIME_HASH}'`);
  expect(html).not.toMatch(
    /<(link|iframe|form)\b|\s(?:src|href)="https?:|\son[a-z]+=/i,
  );
}
