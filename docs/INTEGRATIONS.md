# AI generation and provider boundaries

## Current contract (2026-10-03, Europe/Berlin)

New creation is AI-first following the user's correction. AI produces public gift copy and an original JavaScript drawing program, rather than selecting only animation presets. Existing projects, manual editing, undo and recovery remain available. Recipient gifts need no provider, account, network or model: accepted program source is embedded in the standalone HTML. There is no silent template or paid-model fallback.

The provider interface has two concrete transports. No application client secret is shipped. Credentials are closure-only volatile state, lost on reload/disconnect, and excluded from projects, prompts, URLs, logs, exports and packs. Only explicit public name/relationship/vibe/gift words/request are sent; raw questionnaire answers, reference contents and photos are excluded. Public words may still identify someone: consent and review matter.

## Free-only OpenRouter

Official browser PKCE documentation supports a public browser app. BES uses S256 with the headless authorization flow: open the official sign-in page and copy its short-lived, single-use authorization code into BES. No callback query token or persistent verifier is required. The exchanged user credential is sent only in the Authorization header to the fixed HTTPS endpoint.

Signup is required. The model is exactly `openrouter/free`, with no paid model fallback. Official limits reviewed for this implementation are 20 requests/minute and 50/day without purchasing credits. Availability, selected model, quality, pricing and quotas can change. An exhausted quota is an error, not permission to spend money. The optional documented paid quota boost is not implemented. OpenRouter and its selected inference provider receive the approved brief; local AI is preferable when that is unacceptable. No account/key was supplied to this development environment: actual sign-in and real inference are **not verified**.

Reviewed official sources:

- [PKCE](https://openrouter.ai/docs/guides/overview/auth/oauth), official `OpenRouterTeam/docs` source `projects/docs/guides/overview/auth/oauth.mdx`, blob `d602d2527c36dee7133896489812c44fa636458f`.
- [Limits](https://openrouter.ai/docs/api-reference/limits), `projects/docs/api_reference/limits.mdx`, blob `6b604d9b284582c956589b11efa7a5fe6d1357ba`; exported quota constants were also read.
- [Free router](https://openrouter.ai/docs/guides/routing/routers/free-router), `projects/docs/guides/routing/routers/free-router.mdx`, blob `84c85a7037e024970b346923e0e32e8ea2fadb2c`.

Official GitHub sources were read because direct documentation requests were blocked by the current environment proxy. They are evidence of the documented contract, not of a successful live request. Service/model terms and licensing must be checked for the actual use; BES does not claim that all routed model licenses are identical.

## Local-only Ollama

BES addresses only `http://127.0.0.1:11434`. It lists already installed models and checks model metadata before connecting. Cloud model names and remote model metadata are rejected. No download or model installation is triggered. Start Ollama with `OLLAMA_NO_CLOUD=1`; set `OLLAMA_ORIGINS` to the exact Studio origin (for Pages: `https://makandev.github.io`), not a wildcard, and keep the service bound to loopback.

Ollama software is MIT-licensed; model weights have separate licenses and hardware requirements. The loopback check is not an attestation of server behavior: the user must configure a genuinely local server. Browser CORS/private-network/mixed-content restrictions can block access. The actual live HTTPS WebKit probe rejected the HTTP loopback request as mixed content before the synthetic route was reached (zero routed requests). Do not claim that local Ollama works from Pages in Safari; use a compatible desktop/local Studio origin for local inference, or the explicit HTTPS online transport. This does not make an installed desktop model available on an iPhone. No local model is running in this development environment; real inference is **not verified**.

Official sources reviewed in `ollama/ollama`: [API](https://docs.ollama.com/api) (`docs/api.md`, blob `548e610e8769a8151e336c051c7a72e2dd05e7ca`), [structured outputs](https://docs.ollama.com/capabilities/structured-outputs) (blob `c570a12f9dac6693e9f3e1b8d9242604cc034b5a`) and [FAQ/local-only/origins](https://docs.ollama.com/faq) (blob `c2f3b4f579abefb8eb27a035b37496f99e5549c8`).

## Review and execution

The response is bounded strict JSON: public letter/wish/surprise plus a versioned drawing program. Unknown fields and tool/credential instructions fail validation. A probe checks its first frame before presenting a playable candidate. Adoption is explicit and revision-checked; stale results cannot replace foreign newer changes. Regenerating animation preserves existing words unless rewriting is explicitly selected. Undo restores the prior project.

Generated code is untrusted. It runs only in a dedicated Worker inside an opaque sandboxed iframe, with network denied by CSP, no DOM or usable application storage, bounded validated circle/line/rectangle messages, frame deadlines and termination. Code cannot invoke agent tools or alter app policy. The simple source denylist is defense in depth, not the security boundary. Resource exhaustion and malicious browser-engine exploits cannot be ruled out. See ADR 0009 and SECURITY.md.

Manual Director copy/paste remains a provider-neutral advanced option. Its declarative proposal contract stays non-executable; community packs also remain declarative. The narrowly isolated drawing-code exception does not authorize a general code/plugin platform.

## Evidence limits

Automated provider tests use clearly synthetic mocked responses, including auth, quotas, privacy, review and offline execution. They do not prove real AI quality, reliable free availability, actual authentication or physical iPhone delivery. Technical acceptance and reference/experience acceptance remain separate.

## Revision plan contract — 2026-10-04

Generation requests a strict ExperiencePlan v1 (concept, unique bounded sceneOrder, pace) alongside public copy and the isolated drawing program. PublicBrief includes the deliberately selected concept and only a photo-availability boolean; photo bytes/metadata and private questionnaire answers remain excluded. The shared schema and compiler reject unsafe fields, invented content roles and omitted enabled gift content. Historical no-plan responses retain explicit compatibility behavior; they are not presented as fabricated AI planning. Provider-session epochs fence results after disconnect/change. Nine scene/time/finale probe samples replace the former first-frame check, without claiming exhaustive execution analysis. Real-provider quality remains unverified.
