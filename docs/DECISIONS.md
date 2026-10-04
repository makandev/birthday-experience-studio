# Decisions and ADR index

## Current accepted decisions

| Decision                                                                                                     | Source                                                              | Status                                                     |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- | ---------------------------------------------------------- |
| TypeScript/Vite, native DOM Studio, Zod, Vitest/Playwright/axe                                               | [ADR 0001](adr/0001-typescript-local-first-vertical-slice.md)       | Active; no UI foundation rewrite                           |
| Allowlisted recipient projection, escaped text, CSP and sandboxed preview                                    | ADR 0001 and [EXPORT_ARCHITECTURE](EXPORT_ARCHITECTURE.md)          | Active                                                     |
| Creator schema v2 and validated historical v1 migration; separate private draft transfer                     | [ADR 0002](adr/0002-safe-drafts-and-v2-contract.md)                 | Active                                                     |
| Declarative directions, bounded budgets, Offline/Online profiles, validated manual Director proposals        | [ADR 0003](adr/0003-coordinated-motion-and-untrusted-director.md)   | Active                                                     |
| Immutable local original/derivative pairs, raster processing and portable JPEG copies                        | [ADR 0004](adr/0004-local-photo-assets-and-portable-copies.md)      | Active                                                     |
| Shared IndexedDB transaction domain, revision fencing, central deletion and recovery-aware GC                | [ADR 0005](adr/0005-transactional-workspace-and-asset-lifecycle.md) | Storage-integrity milestone; validation tracked in STATUS  |
| Staged recipient runtime, preview-first creation                                                             | [ADR 0006](adr/0006-staged-recipient-runtime.md)                    | Active; physical/qualitative acceptance remains open       |
| Recipient-only Safari file opener                                                                            | [ADR 0007](adr/0007-recipient-file-and-ios-release-gate.md)         | Implemented optional experiment; not standalone acceptance |
| Zero-cost core, provider neutrality, safe declarative packs, optional hosting, Magic Start/Surprise Me goals | [PRODUCT_VISION](PRODUCT_VISION.md)                                 | Product contract; goals are not implementation claims      |

## Historical and superseded decisions

ADR 0001's single localStorage draft was appropriate for the text-only 0.1 proof. ADR 0002's two-key library rollback and ADR 0004's separate project/asset activation are superseded by ADR 0005. Their documents remain historical records, not current storage guarantees. ADR 0006 supersedes the script-free/scroll-only and finite-only recipient restrictions of ADRs 0001/0003; their projection/security contracts remain active. Early “media not implemented” statements describe the old slice; current media contracts are in MEDIA/DATA_MODEL/STATUS.

| AI-first generation, free/local transports, reviewed isolated drawing code | [ADR 0009](adr/0009-ai-generated-isolated-drawing.md) | Active development; real inference/qualitative acceptance open |

## Open decisions

- Public pack schema/versioning, capability validation, licensing and review/import UX; no executable community extension model.
- Localization catalogs and language expansion.
- Memory/gallery/timeline refinements; local soundtrack codec/duration budgets.
- Corrupt legacy quarantine repair/recovery and export leases during concurrent deletion.
- Concrete optional providers only after official-doc cost/limits/signup/security/licensing review; credential/backend architecture remains separate from projects.
- Optional Share/Hosted architecture, real-device/manual accessibility gates, and public-adoption release quality. No mandatory hosting or permanent free-tier promises.

## Autonomous integration policy

The user's current instruction permits autonomous reversible engineering and integration into main after a coherent milestone passes relevant tests/checks, documentation/security/privacy review, migration/compatibility checks, clean Git review and remote synchronization. Inspect new remote changes and resolve conflicts safely; never force push, rewrite history or reset user work. Repo integration does not authorize paid services, credentials, deployment under third-party domains or legally/security-sensitive irreversible external actions. Continue in the same BES task; do not create parallel BES tasks. This replaces historical additional-confirmation/no-merge instructions.

## Preview-first and staged recipient decision (2026-10-02)

[ADR 0006](adr/0006-staged-recipient-runtime.md) selects seven stations plus closing, a maintained hash-allowed runtime, opaque scripted preview, bounded motion/skip/reduced/no-JS fallbacks and minimum-input confirm/change creation. No project/storage migration or dependency expansion. Previously mandatory public seed and 6–10 Quick questions are superseded; Quick v3 has three optional questions after first value.

[ADR 0007](adr/0007-recipient-file-and-ios-release-gate.md) defines the recipient-only Offline data reader as an optional Safari delivery adapter, never uploaded/hosted gift or private-draft import. HTML file previews on iOS are not promised to execute. Real iPhone creation/delivery/taps remain release gates even after desktop WebKit passes.

The user clarification keeps standalone HTML primary on all devices; the temporary iPhone-primary JSON action is superseded. ADR 0007 records the optional reader as an experiment, not fulfillment of the iPhone HTML delivery gate.

## Targeted historical privacy exception (2026-10-02)

The later user instruction to remove the benchmark recipient identity including older files superseded the default no-history-rewrite rule solely for this cleanup. Four descendant commits on the two existing branches were sanitized with exact leases and an atomic push; earlier history, release tag and current application tree were preserved. Default history protection remains in force. GitHub cached commit views and old deployment records are a separate, unresolved server-side boundary.

## First bounded experience rebuild decision

[ADR 0008](adr/0008-variable-experience-composition.md) retains the legacy Champion and adds three declarative variable strategies/two arcs with purposeful route/photo interaction and fitting finales. The first same-input browser comparison in [EXPERIENCE_ACCEPTANCE](EXPERIENCE_ACCEPTANCE.md) supports Challenger portrait as the default for new Studio Magic Start gifts. Existing projects do not change implicitly; creator can compare/adopt/undo. This is an explicit engineering/product judgment, not an automated winner, user study or declaration that the private benchmark is beaten. Physical iPhone and qualitative private-reference acceptance remain open.

## Current AI-native checkpoint — 2026-10-03

2026-10-03: user rejected the new gift animation quality and changed direction to AI-native animation programming with local/free API inference. ADR 0009 supersedes AI-never-executable ONLY for reviewed drawing code in an opaque CSP Worker. No Studio/agent/tool execution or community code platform. Preserve existing projects/manual recovery; new AI-first creation needs explicit connection/review. Prior internal Challenger default judgment is not user acceptance.

## Three-direction revision decision — 2026-10-04

The user chose all three concepts and authorized completing/integrating checked work, replacing the earlier proposal-only hold. ADR 0010 keeps one creator/runtime and three bounded spaces, validates AI ordering and drawing, preserves legacy projects and selected final content, and simplifies full rehearsal/refinement. No winner is assumed. Published Shopify/37signals guidance and independent AI reviews informed the decision; no human sales expert endorsement or actual buyer study is claimed. Main is a development preview while model/physical iPhone/qualitative gates remain open.
