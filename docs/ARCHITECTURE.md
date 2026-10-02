# Current BES architecture

BES is a focused local-first birthday app, not a generic platform. Use the simplest concrete modules that protect current product behavior. TypeScript/Vite and native DOM UI remain; no frontend foundation rewrite or new runtime dependency.

| Boundary      | Implementation                                                                                                                   |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Domain        | `domain/project.ts`: CreatorProject v2, bounded schema and historical v1 migration                                               |
| Configuration | Maintained registries for relationships/questions/themes/blocks/directions; safe declarative future packs, never downloaded code |
| Engines       | Deterministic question, writing, composition and motion logic independent of DOM                                                 |
| Studio        | Workflow plus media controller; creator editing/review/confirmation and asynchronous saved/conflict status                       |
| Persistence   | Shared `bes-media` IndexedDB v2, transactional WorkspaceRepository; old localStorage modules are read-only migration adapters    |
| Media         | Bounded raster decode/re-encoding, immutable originals/derivatives, source resolution and portable copies                        |
| Recipient     | Explicit projection and maintained staged HTML/CSS + hash-allowed static runtime; isolated preview shares exporter               |
| Integrations  | Provider-neutral manual capability catalog and structured proposal validation; no concrete API/key broker                        |

## Storage integrity and concurrency

`persistence/database.ts` owns versioned connection/retry/upgrade behavior. `workspace.ts` validates a bounded collection, maintains revision/writer/timestamp metadata and runs save/activation/deletion/GC in readwrite transactions covering roots and binaries. `notifications.ts` offers BroadcastChannel plus storage/focus hints, but safety depends only on transactional read/check/write. Studio serializes its own writes and freezes persistent mutation after a conflict, retaining local input for backup and explicit canonical adoption.

References from every media entry and recovery snapshot retain asset pairs, independent of block activation. Normal edits compare reference sets; one initialization scan and confirmed key-only GC find old orphan assets. Confirmed project deletion removes the central entry/recovery and exclusively unreferenced bytes atomically. Asset collisions/quotas/aborts roll back both stores. Migration adds the workspace store, validates old data, retains unknown sources and retires exact validated legacy copies via a crash-retry journal. See ADR 0005 and DATA_MODEL for limits.

## Trust and capabilities

CreatorProject is never serialized as recipient HTML. JSON/import/media/API/AI/community/repository text is untrusted data, not instructions. Schema/byte/codec/capability checks and escaped rendering protect explicit boundaries; SECURITY/THREAT_MODEL state residual risks.

Offline/Restricted embeds required local assets; Standard/Online allows deliberate sources with fallback; future hosting stays optional. Media source contracts reserve audio/video without claiming playback. Future local audio requires intentional recipient start and accessible controls.

engines/magic-start.ts uses safe name/defaults and existing explicit public text, never private answers. Studio implements opening → confirm/change/undo → optional public detail → updated scene → optional photo → whole experience. Traditional editing and Quick/Deep remain optional. engines/scenes.ts composes six maintained content blocks using a small role grammar, three Challenger strategies and two arcs; missing composition settings preserve the legacy Champion. Optional strict composition v1 settings adopt the new presentation without changing IndexedDB or portable envelope versions; only derived public register/pace, variant and arc enter the projection. Recipient choice prioritizes an upcoming scene, photo exhibits and multi-phase finales differ by strategy; no generic page builder or imported behavior. experience/runtime.ts owns progression/choice/clock/bounded effects/finale; no state, fetch, provider or executable content. export/recipient-file.ts and experience/viewer.ts provide the optional local-data Safari reader with no creator-storage initialization. CreatorProject/workspace/portable-draft schemas are unchanged. ADR 0006 supersedes script-free/scroll-only renderer constraints, not privacy/storage contracts. Director's eventual whole-process proposals stay validated data. Concrete optional providers require official-doc/cost/signup/security/licensing review and safe browser/backend classification; credentials remain outside projects/artifacts/prompts/logs/URLs/Git/packs. Core operation never depends on their free tiers.

Historical architecture proof tradeoffs are in ADRs 0001–0004. ADR 0005 supersedes their localStorage/cross-store atomicity limits; pending product features are in ROADMAP/STATUS, not implicit architecture commitments.
