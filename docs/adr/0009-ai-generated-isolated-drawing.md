# ADR 0009 — AI-generated drawing code with isolated offline execution

Date: 2026-10-03 (Europe/Berlin). Status: implemented; real-provider and qualitative acceptance open.

## Decision and user authorization

The user rejected the newly generated gift's animation quality and explicitly requested AI-written animations with free API and local inference. This supersedes the former optional-AI/non-executable-output rule only for this narrow drawing capability. It does not authorize arbitrary code in Studio, recipient DOM, community packs or agent tools. The original private reference remains private; only abstract light/pacing/reveal/finale criteria inform the public prompt.

New creation requires a connected free-only OpenRouter or local-only Ollama session. Existing gifts and manual recovery survive. No paid fallback, automatic installation, destructive project conversion or mandatory recipient service is introduced.

## Boundaries

Strict JSON carries bounded public copy and `{version:1, source}`. CreatorProject v2 and recipient v1 accept this optional field; old projects/files remain valid, while older clients may reject newer files safely. Export projects only the allowed source/version, never provider/session/private-answer data.

An opaque `sandbox=allow-scripts` frame runs a fixed hash-allowed controller. Its Worker loads generated JavaScript from a local data URL. CSP denies connections; the worker cannot access DOM or application-origin storage. Blob worker loading failed the offline WebKit test, so data loading is intentional. Two maintained trusted script hashes are updated by `node scripts/update-runtime-hashes.mjs`; tests compare exact bytes. Generated source lives in escaped inert template text and is never interpolated into the main executable script.

`frame(input)` receives only bounded time, scene, finale phase, viewport and intensity. It returns up to 160 strict finite circle/line/rectangle commands; mobile drawing is further capped at 96, coordinates and payload sizes are bounded. The host permits one pending frame, 1.5-second startup/400-ms later deadlines, and terminates invalid/hung/error workers. The recipient renderer caps its canvas and glow, requests at most 30 frames/second, validates message source/request identity and stops on pause, reduced motion, hidden document or page exit. Late frames cannot restart paused effects.

This is programmable choreography, not unrestricted generated websites: scene structure, native navigation and accessible text stay maintained. CPU deadlines cannot eliminate memory/GPU exhaustion or browser vulnerabilities. A first-frame probe cannot prove every future branch safe. Failure removes the generated layer while keeping controls/content available; reduced motion needs no worker.

## Provider/privacy and consistency

S256 headless browser PKCE avoids app secrets and URL callback credentials; tokens/verifiers remain in closure memory. Only `openrouter/free` is selected. Local Ollama uses fixed loopback, installed-model metadata checks and explicit user setup for no-cloud/exact origins. No private answers, photos or reference content enter prompts. User-approved public text still carries privacy implications.

Candidate generation is non-persistent until explicit review/adoption. It checks original project/revision both after asynchronous work and on adoption. Existing storage CAS/retention/GC invariants remain intact. Regeneration preserves authored words by default and supports undo.

## Acceptance

Test real program drawing offline in Chromium/WebKit, CSP denial using obfuscated network/storage attempts, infinite loops, malformed commands, forged messages, pause/reduced motion, escaped export, backward-compatible schemas, token isolation, quota errors and review/undo. Provider mocks are not actual inference. Physical iPhone opening and subjective benchmark comparison remain separate release blockers. No claim of perfect sandbox or achieved reference quality is made.
