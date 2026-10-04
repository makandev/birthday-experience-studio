# Birthday Experience Studio

**Early development 0.2 – evolving architecture and product foundations, not a finished product.**

Tell BES about the person, add memories/photos, and assemble a personal interactive birthday experience. New creation uses local AI or an optional free-only API. No paid API or subscription is required; recipient gifts remain standalone and need no account, cloud or AI.

## Live Studio / GitHub Pages

Public Studio URL: <https://makandev.github.io/birthday-experience-studio/>. Pages is now enabled with GitHub Actions as its source. The current staged/preview-first/Safari development package was deployed successfully and verified at the real URL with Chromium and mobile WebKit; STATUS records the exact source checkpoint and evidence. The repository is public following the user's visibility change. No paid service or new account is required.

`.github/workflows/pages.yml` deploys checked `main` pushes (or a manual run on `main`): locked npm install, TypeScript, lint, formatting, module tests, production build, mobile WebKit/Chromium touch checks and a Chromium production-subpath gift-creation smoke test must pass before only `dist/` is uploaded. Deployment uses GitHub's short-lived workflow token/OIDC, never application credentials. `npm run build:pages` selects `/birthday-experience-studio/`; normal development/builds retain `/`. The Studio has no path-based client router.

Hosting publishes static Studio code only: no project storage, imported photos, private answers, credentials or test fixtures. Creator data stays in browser storage; gift HTML remains independently portable. GitHub receives ordinary hosting requests/IP information. Storage belongs to the browser origin, not a repository path: other content hosted on the same `makandev.github.io` origin can share that origin's storage privileges. Use fictional data for public demos and keep private draft backups. Moving from localhost to Pages does not transfer saved gifts automatically.

To reproduce the Pages gate: `npm run build:pages`, then `npm run test:pages` (use `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium` here). After every main integration, verify the Actions run and live core flow/assets before declaring delivery complete. Publishing the Studio is optional distribution, never a core cloud requirement.

## Run locally

Node.js >=22.12 and npm (validated with Node 24.19.0):

```sh
npm ci
npm run dev
```

For a production bundle: `npm run build`, then `npm run preview`. Vite prints the local address. Studio assets are in `dist/`; recipient gifts are separate single HTML files.

## Current creation flow

Magic Start starts with a name and safe relationship/vibe defaults. Immediately see the actual opening scene; confirm “Gefällt mir”, change the direction or try “Überrasch mich” with undo. Add a public sentence or one-tap prompt only if useful, see its late gift scene, optionally add a photo, then see the whole gift. No questionnaire or AI is required first. Quick offers three optional questions; Deep/manual editing remain optional after value. Existing public text and compositions are preserved.

New Magic Start gifts use three distinct staged archetypes: Emotional Memory with a quiet photo/core-message finale, Playful Celebration with purposeful choices/polaroids/finite fireworks, and Cinematic/Luxury with widescreen photos, contrast and an optional false ending. Selected public content determines the beats; an actual choice changes what comes next. Surprise Me alternates coherent arcs without losing words/photos, and public words can be edited directly at the preview. The earlier fixed gift remains available under ‘Zwei Geschenkwege vergleichen’; existing projects keep it until an explicit switch. Finale phases last 2.4–4 seconds each, with skip/replay/back and quiet respectful variants. Bounded confetti/light/particles respect intensity 0–3, recipient pause and reduced motion. No imported executable content; a single maintained CSP hash-allowed runtime handles these behaviors. A readable chronological HTML fallback remains when JavaScript is blocked. Qualitative benchmark/novice acceptance is still open.

Six photo slots support local picker/drop, JPEG/PNG/still WebP detection, orientation normalization, original preservation and bounded re-encoded copies. Fit/position changes are non-destructive. Offline exports embed only selected gift copies; original filenames/EXIF/comments, private answers and original bytes stay out. Optional public HTTPS photos require Online mode and explicit consent and retain descriptive fallback text if unavailable.

“My gifts & backup” (German UI: „Meine Geschenke & Sicherung“) exports private creator drafts, reviews imports and retains up to eight other gifts. Historical v1 drafts migrate to schema v2. Portable photo drafts carry gift copies; originals remain on the source device and can be downloaded separately.

Optional manual AI help shows exactly what would be shared. The provider-neutral Director dialog validates structured proposals against known settings and existing blocks, requires confirmation and offers undo. The separate AI generation flow connects local Ollama or free-only OpenRouter on explicit user request; see INTEGRATIONS and ADR 0009.

## iPhone / Safari: release gate still open

**The primary export is a standalone HTML gift on every device, including iPhone/iPad.** In Offline mode, that one file contains the text, photo copies, styles and maintained interaction runtime; the recipient does not need BES, an account, a second page or an upload. The complete opening-first HTML is prepared before the intentional download tap, with no awaited storage work in that gesture.

Direct HTML opening in iOS Files/WhatsApp/Mail previews is still not reliably interactive and is not claimed fixed. This is an unresolved delivery/release blocker, not grounds to replace the gift format. An explicitly optional, collapsed experimental Safari file reader remains available under iPhone help. It reads a separate public .bes-gift.json file locally without upload, after its page loads. It does not satisfy the standalone HTML/iPhone acceptance requirement or become a required recipient step.

Desktop WebKit and mobile touch checks approximate Safari; real iPhone creator/live/delivery/taps, OS share and Files behavior remain release-blocking device acceptance. See [iOS compatibility and exact device checks](docs/IOS_COMPATIBILITY.md). A development preview does not imply release approval.

## Privacy and limits

- Creator draft files contain private answers and photo copies. Share recipient HTML or the public .bes-gift.json recipient file, never the draft.
- Gift texts/captions are explicitly public. Review guided/AI content; private facts copied into them are still visible.
- Browser data is unencrypted and can be blocked, full or deleted. Save important drafts/originals separately. Same-profile tabs use transactional revision checks: conflicts keep local input and require explicit adoption of the saved version. Wait for the saved indicator before closing.
- The last recovery snapshot retains removed photos. Confirmed project deletion and confirmed cleanup remove only unreferenced bytes; cleanup ends retained undo. Photo draft import restores compressed copies, not originals.
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

On this cloud machine, Chromium is provided by the system:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e
```

Playwright starts port 4173 automatically. Tests read downloads and render their exact contents offline; managed browser policy blocks direct `file://` navigation. Axe checks Studio and recipient documents separately. Automated checks do not replace physical iPhone/Safari, OS delivery, assistive-technology or novice tests. Run `npx playwright install --with-deps webkit chromium` and `npm run test:mobile` for mobile engine/touch coverage; the managed non-root cloud uses the locally installed WebKit wrapper recorded in environment startup instructions. `npm run test:live` checks the actual Pages URL in isolated temporary contexts. Normal TLS verification is retained; this cloud's live smoke bridges verified route.fetch responses rather than weakening Chromium trust.

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

A reproducible single-file Studio test artifact is available via `npm run build:standalone`: open `dist/BES-Test-0.2.html` in a browser. It bundles the current trusted Studio CSS/JavaScript, Recipient gifts contain their maintained hash-allowed runtime and optional isolated drawing program, never Studio code. File-origin persistence varies by browser; keep explicit draft backups. Browser tests rebuild this artifact automatically and exercise its exact bytes offline on the test origin; managed file navigation remains unverified.

Read `AGENTS.md` and relevant docs before architectural work. See [current status](docs/STATUS.md), [architecture](docs/ARCHITECTURE.md), [media](docs/MEDIA.md), [motion](docs/MOTION.md), [integrations](docs/INTEGRATIONS.md), [decisions](docs/DECISIONS.md), [security](SECURITY.md) and [threat model](docs/THREAT_MODEL.md).

Community extensibility is safe declarative birthday content, not arbitrary executable code. Audio/video playback, further story arcs beyond the bounded first comparison, quarantine repair remain later work; concrete local/free-only generation is now implemented with real-provider acceptance still open. After full quality/security/privacy/migration gates, the current user policy permits autonomous main integration; no paid services or third-party-domain deployment follows from that permission.

## AI-first creation checkpoint

New creation connects local Ollama or OpenRouter's free-only router, then previews generated gift text and a newly programmed animation before adoption. A provider connection is needed; no silent template or paid-model fallback. OpenRouter requires signup; reviewed limits are 20 requests/minute and 50/day without buying credits, subject to change. OAuth uses PKCE and a temporary user-owned in-memory token, no embedded app secret. Local Ollama requires installed local weights, Local-only mode and an explicit Studio CORS origin; browser/iPhone access may be unavailable. No models are downloaded automatically. See [integration setup and official sources](docs/INTEGRATIONS.md).

Generated drawing JavaScript executes only inside an opaque, network-blocked Worker with command/size/time limits. Gifts remain one offline HTML file with no provider credentials or runtime AI. Existing gifts remain editable/exportable. Actual model quality, real OAuth login and physical iPhone delivery are not proved by mocked integration tests.

## Three gift directions

The Studio now offers Moment Atelier, Surprise Box and Light Premiere. Try **Drei Geschenkbeispiele erleben** without an account: these are clearly fictional examples, not AI-generated personal gifts. For your own gift, connect local/free-only AI, give a name and optional public words, review the full experience, then optionally change words/staging/photos. The gift download is still one standalone HTML file, with no AI or login at playback. Existing saved gifts retain their previous rendering until explicit new-plan adoption.

See [revision plan](docs/revision-v2/PLAN.md) and [ADR 0010](docs/adr/0010-three-revision-experiences.md). Current technical/live evidence and unresolved real-model/iPhone/human checks are recorded in [STATUS](docs/STATUS.md). Live Studio: https://makandev.github.io/birthday-experience-studio/.

Die geprüfte Drei-Richtungen-Revision ist auf [GitHub Pages](https://makandev.github.io/birthday-experience-studio/) verfügbar. „Drei Geschenkbeispiele erleben“ öffnet alle Richtungen ohne Anmeldung/KI-Verbindung. Beispiele sind ausdrücklich fiktiv; persönliche KI-Erstellung braucht eine bewusst verbundene lokale oder kostenlose Online-KI. Technische Live-Evidenz und offene echte Modell-/iPhone-/Nutzerabnahmen stehen in docs/STATUS.md.
