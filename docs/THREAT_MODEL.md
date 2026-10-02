# BES threat model

Scope: local creator, browser persistence, imported drafts, recipient exports, optional future media/integrations. This document records boundaries and known gaps, not a claim of complete immunity.

| Boundary                            | Threat                                                            | Control                                                                                                                       | Residual risk                                                                               |
| ----------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Imported JSON → project             | malformed/huge/deep input, prototype pollution, credential fields | pre-parse byte budget; post-parse depth/node/key checks; versioned schema; root strictness; bounded collections; confirmation | JSON.parse allocates the bounded input; sensitive text is still user data                   |
| Historical v1 → v2                  | guessed/lost fields, invalid future versions                      | validate historical fixture contract before pure migration; future versions fail closed                                       | future migrations need dedicated historical fixtures                                        |
| Current draft → library             | quota errors, unintended overwrite                                | bounded transactional collection; revision compare inside the same IDB readwrite transaction; no silent eviction              | collection-wide conflicts are conservative; pending saves and browser eviction remain risks |
| Creator → recipient                 | private-answer leakage                                            | explicit projection, no raw-project serialization, conscious writing approval                                                 | privacy cannot be inferred from a user-approved letter                                      |
| Text → DOM/HTML                     | XSS, malformed HTML/Markdown                                      | HTML escaping and textContent; no user HTML/Markdown renderer; CSP; iframe sandbox                                            | maintained renderer code remains trusted                                                    |
| Repository/pack/AI text → agent     | prompt injection or exfiltration instructions                     | content is data, not authorization; no command/tool/action fields in application protocols                                    | agents still require careful instruction provenance                                         |
| Browser/files → other people        | reading personal drafts                                           | explicit warnings, manual backups and recipient/creator separation                                                            | local storage and exports are not encrypted                                                 |
| External integrations → application | secret leakage, prompt injection, unwanted cost                   | no concrete API providers enabled; typed provider-neutral data contract required                                              | future providers need official-source review and trusted credential handling                |

Media and coordinated motion controls are documented with their implementation milestones. Do not treat unsupported media declarations as permission to fetch or execute them.

Director-Vorschläge haben einen strikten Datenvertrag und eine vollständige Permutation vorhandener Block-IDs. Tool-/Code-/API-Key-Felder werden abgelehnt. Frageideen bleiben inert. Effects sind erlaubte Tokens mit endlichen Budgets, keine fremden CSS-/JS-Strings. Import setzt externe Quellenzustimmung zurück; Profilprüfung verwirft keine fehlenden Abhängigkeiten still.

## Media trust boundary

- Filename/MIME → decoder: actual raster signature and pre-decode dimensions, byte/pixel caps, no SVG/GIF; decoder still has its own platform attack surface.
- EXIF/comments → recipient: originals stay local, orientation-normalized pixels are re-encoded; metadata-bearing export derivatives are rejected.
- Portable bytes → local asset store: strict matching, bounded data URLs, fresh IDs and reprocessing; only confirmed assets are stored. Project/assets commit in one transaction; collisions/aborts roll back both stores.
- External source → recipient: public HTTPS without credentials/queries/ports, explicit Online consent, selected-origin CSP, no referrer and persistent text fallback. DNS is not independently verified; no server proxy exists.
- Removal → storage: references disappear but original/derivative assets remain for undo and retained projects. Recovery-aware central deletion/reference-delta cleanup and confirmed key-only GC protect shared bytes; uncertain ownership blocks cleanup. Logical deletion is not secure erasure.

## Concurrency/recovery boundary

- A stale editor or deletion request is rejected by canonical monotone revision checks inside a shared transaction; BroadcastChannel/storage/focus are hints, not authority. Writer identity is informational.
- Validated legacy values retire with a journal only after IDB initialization commits. Interrupted retirement blocks mutations; changed legacy values are protected. Unreadable/overflow backups quarantine cleanup. Older application builds cannot participate in this protocol and should be closed before upgrading.
- Root schemas, bounded projects and same-project recovery IDs protect GC reference computation. Missing asset bytes do not prevent safe deletion; corrupt/future roots stop writes/cleanup.
- Independent profiles cannot synchronize; OS storage loss, secure erasure, in-flight export leases and automated repair of unknown backups remain outside guarantees.

## Optional GitHub Pages boundary

Static Studio hosting sends ordinary request metadata to GitHub but never uploads creator content automatically. Only dist from checked main is deployed. A malicious application on another path of makandev.github.io shares browser-origin privileges and could read/modify local creator storage; repository paths do not isolate it. Mitigation is trusted co-hosted content or separate origins, plus private backups. No account/backend or telemetry is introduced into core creation.

## Staged runtime / recipient data reader

- Creator/AI/import text never enters maintained JavaScript; escaped HTML is separate. CSP permits the maintained main/controller hashes, rejects injected scripts, and default/base/form policies remain closed. Hash is pinned to runtime bytes in module tests. Maintained code defects/browser CSP differences remain residual risk.
- Runtime effects/progression are bounded, no fetch/storage/tool/provider capability, opaque preview sandbox only allow-scripts. No-JS fallback and reduced/skip controls protect availability/accessibility, not confidentiality of already included public words.
- Recipient data files use pre-parse byte and post-parse depth/node/key budgets, strict v1 envelope/allowlist and JPEG metadata/signature limits. Unknown/private/HTML/network fields are refused; the explicit animation field is validated untrusted drawing code executed only under ADR 0009 isolation. JSON.parse still allocates bounded input and decoders remain a platform boundary.
- Safari reader boot avoids all creator persistence and uses a fresh opaque frame. Page loading needs its optional host; file content is neither uploaded nor encoded in links. Shared-origin trust rules still apply. iOS Files/Quick Look behavior, OS share/download and actual-device touch require explicit release acceptance.

## Variable composition trust boundary

Composition v1 is strict enum-only presentation data with maintained strategy/role/transition/finale allowlists. No imported recipe/runtime/CSS execution. Raw private relationship dimensions and questions remain creator-only; only bounded derived presentation decisions cross projection. Runtime route/photo/reveal state is ephemeral; no recipient storage, telemetry or messages/tools/provider calls. Photo reuse in the quiet finale uses an already projected normalized image, not originals/metadata. Static CSP runtime hash is regenerated and byte-tested after changes. Private reference HTML stays outside repository/build/test artifacts; only abstract quality findings and fictional comparisons may be public.

AI code → opaque Worker is a new user-authorized trust boundary (ADR 0009), not a community plugin channel. Opaque origin denies DOM/storage, inherited CSP denies network/eval/imports, trusted controllers validate commands and terminate stalled computation. Runtime/source/hash/import round-trip, spoofed messages, obfuscated network access, infinite loops, offline Chromium/WebKit and motion cancellation require regressions. Resource exhaustion/browser bugs remain residual risks. Provider → Studio is explicit public-only generation with bounded JSON/schema/code probe and review; stale proposals fail before revision-fenced saving. Provider credentials are memory-only and inaccessible to Worker/public projection. Ollama software is MIT but model licenses/hardware differ; a local endpoint is not attestation of its server's outbound policy.
