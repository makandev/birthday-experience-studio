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
| Recipient     | Explicit projection and trusted script-free HTML/CSS renderer; isolated preview shares exporter                                  |
| Integrations  | Provider-neutral manual capability catalog and structured proposal validation; no concrete API/key broker                        |

## Storage integrity and concurrency

`persistence/database.ts` owns versioned connection/retry/upgrade behavior. `workspace.ts` validates a bounded collection, maintains revision/writer/timestamp metadata and runs save/activation/deletion/GC in readwrite transactions covering roots and binaries. `notifications.ts` offers BroadcastChannel plus storage/focus hints, but safety depends only on transactional read/check/write. Studio serializes its own writes and freezes persistent mutation after a conflict, retaining local input for backup and explicit canonical adoption.

References from every media entry and recovery snapshot retain asset pairs, independent of block activation. Normal edits compare reference sets; one initialization scan and confirmed key-only GC find old orphan assets. Confirmed project deletion removes the central entry/recovery and exclusively unreferenced bytes atomically. Asset collisions/quotas/aborts roll back both stores. Migration adds the workspace store, validates old data, retains unknown sources and retires exact validated legacy copies via a crash-retry journal. See ADR 0005 and DATA_MODEL for limits.

## Trust and capabilities

CreatorProject is never serialized as recipient HTML. JSON/import/media/API/AI/community/repository text is untrusted data, not instructions. Schema/byte/codec/capability checks and escaped rendering protect explicit boundaries; SECURITY/THREAT_MODEL state residual risks.

Offline/Restricted embeds required local assets; Standard/Online allows deliberate sources with fallback; future hosting stays optional. Media source contracts reserve audio/video without claiming playback. Future local audio requires intentional recipient start and accessible controls.

Magic Start/Surprise Me should compose the existing safe birthday primitives, not add a generic orchestration layer. Director's eventual whole-process proposals stay validated data. Concrete optional providers require official-doc/cost/signup/security/licensing review and safe browser/backend classification; credentials remain outside projects/artifacts/prompts/logs/URLs/Git/packs. Core operation never depends on their free tiers.

Historical architecture proof tradeoffs are in ADRs 0001–0004. ADR 0005 supersedes their localStorage/cross-store atomicity limits; pending product features are in ROADMAP/STATUS, not implicit architecture commitments.
