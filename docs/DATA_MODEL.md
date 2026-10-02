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

Only schemaVersion, locale, resolved themeId, allowed directionId/intensity/profile/externalDomains and active allowed block fields cross the recipient boundary. Selected local sources resolve to validated JPEG data URLs; selected online sources resolve to validated URLs after consent. No project IDs/revisions/timestamps, private answers, relationship data, writing method, original filenames/EXIF, original binaries, recovery or library data. See [EXPORT_ARCHITECTURE](EXPORT_ARCHITECTURE.md).

Historical contracts and tradeoffs are recorded in ADRs; historical descriptions are not current feature claims.
