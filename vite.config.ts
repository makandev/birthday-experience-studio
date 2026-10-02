import { defineConfig } from 'vitest/config';
export default defineConfig({
  base:
    process.env.BES_PAGES_BUILD === '1' ? '/birthday-experience-studio/' : '/',
  test: { include: ['tests/**/*.test.ts'] },
});
