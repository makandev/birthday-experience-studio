# BES 0.2 – evolving foundation milestones

Early development state, not a finished product. The full core remains zero-cost, local-first and useful without accounts, paid APIs, servers or AI providers.

## Verified and implemented

- The entire 0.1 vertical slice was rechecked, committed (`1fc0cec`) and pushed to `codex/bes-foundations`; it had previously existed only as uncommitted workspace files.
- Progressive disclosure for preview styling/order, stable keyboard focus and open editor sections. Core-Pack v2 adds Deep questions gated by closeness, trust, emotionality and shared duration; Quick stays compact.
- Five-step Studio: person/relationship → adaptive Quick/Deep questions → writing → isolated preview → single-file recipient HTML.
- Bounded draft export/import with review, up to eight inactive local gifts, real v1→v2 migration and historical fixtures. Imports do not overwrite the current gift; unknown/invalid data remains protected.
- Declarative Emotional/Funny/Elegant/Cinematic directions coordinate theme, typography, preferred ordering, image presentation, finite motion/pacing and finale. Intensity 0–3, recipient motion-off, reduced-motion override, mobile caps and full text contrast during animation.
- Explicit Offline/Restricted and Standard/Online profiles with dependency checks. External photos require deliberate source consent; imports clear it. Missing/unsupported dependencies fail closed; descriptions remain when online images fail.
- Six local photos via picker/drop: raster signatures and dimensions before decode, normalized orientation, canvas-sized/compressed metadata-free JPEG copies, original preservation in IndexedDB, non-destructive display position, block-aware direction styling and embedded offline export.
- Portable photo drafts include gift-sized derivatives, not originals; imports reprocess and remap IDs before confirmed activation. Originals can be separately downloaded from their source device.
- Manual provider-neutral Director prompt/proposal review supports known settings and existing block reordering; strict schemas reject tools/code/credential fields. Texts/answers stay unchanged and approved changes can be undone.
- SECURITY.md, threat model, trust boundaries and ADRs accompany code. Community execution/API providers are not enabled.

## Validation for the current foundation cycle

77 module tests and 15 browser tests pass. TypeScript, ESLint, formatting and production build pass. Browser checks cover complete creation, historical drafts, quotas/storage failures, hostile imports, HTML injection, private-data projection, EXIF orientation/removal, exact original preservation, fresh-browser photo transfer, network-free recipient content, consent and offline refusal, motion/undo, mobile width and core axe rules.

Browser validation uses system Chromium. Managed `file://` policy prevents direct file navigation; tests read the downloaded HTML and render its exact bytes with networking disabled. Firefox, Safari, real phones, assistive technologies and novice-user studies are still unrun. The browser-download CDN was denied during onboarding; no security verification or network policy was bypassed.

## Persistence

Completed milestones are committed and pushed to GitHub branch `codex/bes-foundations`. `main` remains on its original documentation baseline until integration. Saving a cloud config draft is not a merge or release. Generated bundles, node_modules, screenshots and browser reports are ignored.

## Known limitations and risks

- Browser storage/drafts are unencrypted and not guaranteed durable. Use backups; one active browser tab is supported. Cross-tab edit conflict handling remains open.
- Local library capacity is bounded; no project-deletion/archive UI yet. Storage rollback is best effort, not a cross-key transaction.
- Removing photos retains local original/derivative bytes for undo and other gifts; permanent orphan cleanup is not implemented. A failed cross-store activation may leave unreferenced derivative copies, not overwrite previous originals.
- Portable drafts contain compressed gift copies, not the original archive. Transparency is flattened; unsupported SVG/GIF/HEIC/animated WebP are rejected, APNG becomes a still.
- External image availability and host cookies/IP visibility cannot be guaranteed. No server-side proxy, media authentication or credential fields exist.
- A private fact deliberately copied into public text/captions is public. A projection cannot determine the author's sharing intentions.
- Motion starts on load; full viewport-triggered cinematic sequencing is not implemented. No audio/video playback yet; only their source/kind architecture is prepared and selected unsupported media is refused.
- Director follow-up ideas are private suggestions only. No automatic question installation or provider calls. Concrete APIs require current official-doc review and a separate credential/backend design.
- The Studio has no service worker; offline first-load/reload is not guaranteed. Recipient Offline HTML is independent of a server.
- UI still has a small central workflow controller; media interaction is now separate. Further editors should be separated without rewriting the domain/engines.
- Tooling prints non-failing upstream annotations/deprecation notices. No failing check is treated as passing.

## Next priorities

1. Add explicit local project deletion, asset-retention review/cleanup and cross-tab conflict protection without losing drafts.
2. Extend coherent storytelling to memory/gallery/timeline and viewport-triggered choreography.
3. Add local soundtrack assets and deliberate play/pause/volume with offline budgets and fallback.
4. Broaden real-browser/device/accessibility checks; only then evaluate optional API integrations from current official sources.
