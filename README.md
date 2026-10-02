# Birthday Experience Studio

**Early development 0.2 – evolving architecture and product foundations, not a finished product.**

Tell BES about the person, add memories/photos, and assemble a personal interactive birthday experience. Core creation needs no accounts, paid APIs, subscriptions, cloud service or AI provider.

## Run locally

Node.js >=22.12 and npm (validated with Node 24.19.0):

```sh
npm ci
npm run dev
```

For a production bundle: `npm run build`, then `npm run preview`. Vite prints the local address. Studio assets are in `dist/`; recipient gifts are separate single HTML files.

## Current creation flow

Person/relationship → adaptive Quick/Deep questions with help/examples/skip/unknown → own or consciously approved guided text → photos and memory captions → isolated recipient preview → offline HTML gift.

Choose Emotional, Funny, Elegant or Cinematic direction to coordinate colors, typography, order, pacing, photo style and finite effects. Open optional settings to adjust intensity 0–3, colors and block order; expanded sections and keyboard focus survive edits. Deep questions adapt to closeness, trust, emotionality and shared years. Reduced motion wins automatically; recipients can switch motion off.

Six photo slots support local picker/drop, JPEG/PNG/still WebP detection, orientation normalization, original preservation and bounded re-encoded copies. Fit/position changes are non-destructive. Offline exports embed only selected gift copies; original filenames/EXIF/comments, private answers and original bytes stay out. Optional public HTTPS photos require Online mode and explicit consent and retain descriptive fallback text if unavailable.

“My gifts & backup” (German UI: „Meine Geschenke & Sicherung“) exports private creator drafts, reviews imports and retains up to eight other gifts. Historical v1 drafts migrate to schema v2. Portable photo drafts carry gift copies; originals remain on the source device and can be downloaded separately.

Optional manual AI help shows exactly what would be shared. The provider-neutral Director dialog validates structured proposals against known settings and existing blocks, requires confirmation and offers undo. No API providers, key fields or automatic AI network calls exist.

## Privacy and limits

- Creator draft files contain private answers and photo copies. Share the recipient HTML, not the draft.
- Gift texts/captions are explicitly public. Review guided/AI content; private facts copied into them are still visible.
- Browser data is unencrypted and can be blocked, full or deleted. Save important drafts/originals separately. One active editing tab is currently supported.
- Removing photos from a gift retains local asset bytes for recovery; permanent cleanup is future work. Photo draft import restores compressed copies, not originals.
- Photo limits: six / 8 MiB original / 24 MP input / 1600 px and 2 MP output / 512 KiB JPEG derivative. Gift limit: 6 MiB. Portable draft limit: 8 MiB with 2 MiB project text.
- Online hosts may see recipient IP/cookies; consent and no-referrer do not guarantee anonymity. Offline images must be local/embedded.
- Recipient Offline HTML needs no server. Studio offline first-load/reload is not guaranteed; no service worker yet. Development-only Vite HMR is not a product integration.

## Checks

```sh
npm run typecheck
npm test
npm run lint
npm run format:check
npm run build
```

Browser tests:

```sh
npx playwright install chromium
npm run test:e2e
```

On this cloud machine, use installed Chromium because the download CDN is blocked:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e
```

Playwright starts port 4173 automatically. Tests read downloads and render their exact contents offline; managed browser policy blocks direct `file://` navigation. Axe checks Studio and recipient documents separately. Automated checks do not replace real assistive-technology/user tests or broader browser coverage.

## Modules and contracts

```text
src/
  domain/       Versioned creator model and real v1→v2 migration
  registries/   Relationships, questions, themes, maintained blocks, directions
  engines/      Questions, writing, composition and motion plans
  security/     Bounded JSON and external URL boundaries
  persistence/  Local draft/library management
  media/        Raster processing, IndexedDB, source resolution, portable copies
  integrations/ Manual provider-neutral Director data validation
  experience/   Recipient HTML/CSS and safe text renderers
  export/       Explicit projection, capabilities and export budgets
  studio/       Workflow and separate photo controller
```

Read `AGENTS.md` and relevant docs before architectural work. See [current status](docs/STATUS.md), [architecture](docs/ARCHITECTURE.md), [media](docs/MEDIA.md), [motion](docs/MOTION.md), [integrations](docs/INTEGRATIONS.md), [decisions](docs/DECISIONS.md), [security](SECURITY.md) and [threat model](docs/THREAT_MODEL.md).

Community extensibility is safe declarative birthday content, not arbitrary executable code. Audio/video playback, cleanup, full choreography and concrete API providers remain future milestones.
