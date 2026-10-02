# ADR 0005 — Transactional local workspace, revision fencing and asset lifecycle

Status: accepted for the evolving 0.2 storage-integrity milestone. Supersedes the cross-key rollback and cross-store activation described in ADRs 0002/0004; CreatorProject schema stays at v2.

## Problem and decision

A localStorage active project/library plus a separate IndexedDB media transaction cannot provide atomic activation, deletion or a safe read/check/write across tabs. Move the canonical collection into the existing `bes-media` database, version 2, with a `workspace` store beside `assets`. One strict, bounded workspace record holds up to nine projects, the active preference, monotone collection/project revisions, writer identity, commit timestamp and bounded per-project recovery snapshots. Readwrite transactions cover both stores. Native IndexedDB serialization, not BroadcastChannel or a localStorage lock, provides the concurrency guarantee. No new runtime dependency; fake-indexeddb is test-only.

A write reads and validates the current workspace, compares its revision to the caller's expected revision, then writes changes inside that same transaction. Every committed mutation advances the revision; timestamps are informational, not conflict ordering. Collection-wide fencing is deliberately conservative: even editing another gift can require another tab to refresh. A deleted project cannot be resurrected by a stale editor. Revision identity is never exported or imported as authorizing metadata.

## Asset ownership and cleanup

Projects own metadata/references, not exclusive binary ownership. An asset ID owns an immutable original/processed pair; `add` prevents existing originals from being replaced. References from **all** media entries count, including disabled/unused/future media, and retained recovery snapshots count too. Shared references preserve bytes until the last reference disappears. Delete removes the project and its recovery centrally, then deletes only former references absent from the remaining workspace, in one transaction. Missing asset records are harmless; uncertain/corrupt workspace data fails closed rather than guessing ownership.

Normal saves/activation/deletion compare the small former/current reference sets, never scan the binary store. Full key-only garbage collection runs once on initial migration and on explicit confirmed cleanup, reclaiming historical failed-import/orphan records. Explicit cleanup releases recovery snapshots and therefore ends undo; automatic cleanup honors them. Cleanup is idempotent in effect; it still advances the revision to fence any stale writers. No persistent staging assets: confirmed photo/project imports commit assets and references together. Decoder preparation happens in memory before the transaction.

## Migration and failures

The DB upgrade adds a store without changing existing asset bytes. If a canonical workspace exists, legacy localStorage is never restored over it. Otherwise validate/migrate the active v1/v2 draft, inactive library and valid legacy backup before atomic initialization. Conflicting duplicate projects or unreadable active/library state are protected. Validated legacy values are copied with a retirement journal in the same IDB initialization transaction, then their exact localStorage values are removed. A crash or failed removal leaves the journal and blocks writes until retry completes; changed legacy values are protected. This avoids leaving private duplicate project data after deletion. Unreadable/overflow backup sources remain quarantined. Legacy keys are never live mirrors; old application builds writing these keys cannot overwrite the canonical workspace. Close older BES builds before upgrading; cross-version localStorage writers cannot participate in the new IDB protocol.

An unreadable/over-capacity legacy backup retains its bytes and disables all binary cleanup, because its references cannot be proven. A consciously confirmed fresh start after unreadable legacy data also disables cleanup. This conservative quarantine needs a later explicit repair/recovery workflow. Canonical malformed/future workspace data blocks writes and deletion; missing media bytes do not.

Transaction aborts, quota failures or asset-ID collisions roll back both stores. Memory editing/text export remains available when persistence is unavailable; never fall back to unsafe localStorage autosave. The UI distinguishes pending, saved, failed and conflict states. Notifications are hints only; every persistent write verifies the database itself. Conflict recovery preserves this tab's inputs for backup and requires an explicit choice to adopt the canonical version. No force overwrite or automatic merge.

## Limits

Browser data is unencrypted; browser/OS eviction and disk failures remain outside the application guarantee. Successful completion means the IndexedDB transaction committed, not that storage is permanent or securely erased. Pending asynchronous autosaves may be lost on abrupt tab closure; wait for the saved indicator and keep file backups. Independent browser profiles/contexts do not share storage and cannot be coordinated by this protocol. No durable asset lease for an export already in flight across another tab's confirmed permanent deletion; completed HTML is independent, a failed in-flight export can be retried or recovered from a backup.
