# Current data contracts

## CreatorProject schema v2

The authoritative schema/migration code is `src/domain/project.ts`. Projects have stable IDs, creation/update timestamps and schemaVersion. They contain recipient name, relationship type/uncertainty/dimensions, mode, private answers/memories, writing method and explicitly public letter/wish/surprise, media metadata/sources, ordered block instances, theme/direction/intensity, export profile/consent and workflow position.

Question answers use `answered | skipped | unknown`. Hidden answers remain private; only active questions enter optional writing context. Blocks have id/type/version/enabled and bounded data; unknown enabled types/versions block export. Projects are bounded by import/text/collection budgets. CreatorProject never contains credentials, binary originals, executable packs or transaction authorization.

Local media sources are `local(assetId) | external(public HTTPS URL) | unavailable`. All local media entries retain their assets even if no enabled block uses them. Binary records contain immutable original/processed blobs and dimensions in IndexedDB. Shared IDs can be referenced by several projects; ownership is reference-based, not a single-project owner flag.

## Workspace storage schema (separate from project schema)

IndexedDB `bes-media` version 2 has `assets` and `workspace` stores. `workspace/current` has storageVersion 1, monotone revision, writerId, commit updatedAt, activeId, cleanupBlocked and up to nine entries. Each entry has validated CreatorProject v2, its last modified revision and an optional same-project recovery snapshot. Workspace revision is the transaction fence; timestamps do not decide which write wins. Imports never supply authoritative revision/writer fields.

Project, collection preference, recovery and binary additions/removals commit in one readwrite transaction. Normal saves compare reference sets; explicit cleanup and initialization use key-only full asset scans. Recovery references count until replaced/released; project deletion removes its recovery too. See [ADR 0005](adr/0005-transactional-workspace-and-asset-lifecycle.md) for migration journal, failure behavior and limits.

## Migration and private transfer

Historical v1 projects are validated against their historical contract before adding v2 defaults: preserve answers/text/order, Offline profile, intensity 0 and unavailable old media metadata. No bytes are fabricated. Legacy active/library/valid backups migrate into the canonical workspace without clearing source values before commit. Exact source values retire with a retryable journal; unreadable data is protected. Future/malformed canonical data blocks writes and destructive cleanup.

Private text drafts contain CreatorProject only. Portable `bes-draft` version 1 envelopes add exactly the needed normalized JPEG copies, never originals. Import validates, reprocesses and remaps only matching local sources and metadata; unrelated/local/external media must remain unchanged. Reviewed confirmation installs project and asset bytes atomically with fresh project identity.

## ExportExperience v1

Only schemaVersion, locale, resolved themeId, allowed directionId/intensity/profile/externalDomains, optional strict composition presentation settings and active allowed block fields cross the recipient boundary. Selected local sources resolve to validated JPEG data URLs; selected online sources resolve to validated URLs after consent. No project IDs/revisions/timestamps, private answers, relationship data, writing method, original filenames/EXIF, original binaries, recovery or library data. See [EXPORT_ARCHITECTURE](EXPORT_ARCHITECTURE.md).

Historical contracts and tradeoffs are recorded in ADRs; historical descriptions are not current feature claims.

## Recipient data delivery v1

The strict bes-recipient-gift v1 envelope contains ExportExperience v1 only. It uses embedded Offline sources; no externalDomains, arbitrary fields/scripts, private project/draft/revision/answer/media identity, original bytes or credentials. Input is bounded before schema validation and source rendering. This adds an output contract, not a CreatorProject/workspace migration. Existing project v1→v2 and private portable v1 imports remain compatible. Preview station/confirm loop state stays local UI and does not enter gift downloads.

## Additive composition compatibility (ADR 0008)

CreatorProject v2 optionally includes experience.composition = {version:1, variant:champion|challenger, arc:portrait|encore}. Absent settings mean Champion: historical v1→v2 migration and saved v2 projects retain their authored blocks/order/text and presentation. Explicit switching uses normal revision-fenced save/undo; no destructive database migration. New Studio Magic Start chooses Challenger portrait after the documented first comparison. Strict malformed/future settings are rejected.

ExportExperience/recipient envelope v1 optionally adds the same settings plus derived register personal|respectful and pace gentle|bright. These are presentation decisions, not raw relationship type/dimensions, uncertainty or question data. Sparse content does not fabricate a memory. The recipient’s route/photo/reveal/replay state is ephemeral in the recipient runtime and never writes creator storage. Older Studio versions cannot read new optional fields and must fail closed; forward compatibility is not promised. Close/reload older clients rather than stripping settings.
