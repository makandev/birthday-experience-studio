# BES 0.2 — storage integrity and focused product foundations

Early evolving development, not a finished product. Core creation remains zero-cost and useful without accounts, paid APIs, mandatory servers/cloud or AI. PRODUCT_VISION defines commitments; this file reports implementation and evidence.

## Implemented

- 0.1 baseline was verified, first committed as 1fc0cec and pushed; the preceding foundation cycle reached 3c60498 on codex/bes-foundations.
- Preview-first Magic Start: name + safe relationship/vibe defaults → actual opening → confirm/change/undo → optional public detail/photo → full staged gift. Quick has three optional questions; Deep follows first value. Private answers are not seed input; existing compositions are preserved.
- Traditional five-step advanced editing remains optional; Quick/Deep adaptive questions with help/examples/skip/unknown, guided/manual writing, conscious public-text review, isolated preview and standalone offline gift HTML.
- Direction-based motion/typography/colors/media styling/order recommendations, seven-station progression and a three-phase cinematic finale, intensity 0–3, recipient motion-off, reduced-motion/mobile budgets and full contrast.
- Offline/Restricted and Standard/Online capability profiles; selected missing/unsupported dependencies fail closed. Online photos require deliberate source consent and persistent descriptive fallback.
- Six raster photos with bounded picker/drop, orientation normalization, metadata-free compressed JPEG gift copies and separate original retention. Portable drafts carry derivatives, not originals.
- Manual provider-neutral Director review accepts only known settings/existing ordering/private question ideas; no provider calls, key fields, automatic question installation or arbitrary community execution.

## Storage Integrity & Safe Concurrency milestone

- Canonical up-to-nine-project collection, project/recovery roots and asset additions/removals now share IndexedDB v2 transactions. CreatorProject/portable schemas remain compatible at v2/bes-draft v1.
- Monotone workspace/project revisions plus writer/commit timestamp metadata; comparison happens inside the transaction. Same-profile stale saves/deletions cannot overwrite newer data or resurrect deleted projects. Broadcast/storage/focus hints are optional; no-hint races are tested.
- Central confirmed deletion removes project/recovery state and only exclusively unreferenced asset pairs. All media references count, including disabled/unused media; shared references survive.
- Bounded same-project undo snapshots are retention roots. Normal mutations use reference deltas, not full asset scans. Initial migration and confirmed key-only cleanup reclaim historical orphans; explicit cleanup releases undo and is idempotent in effect.
- Confirmed imports commit media and project together; collisions/quotas/aborts leave neither partial activation nor persistent staging bytes. Failed image attachment removes only its local pending reference, preserving other text.
- Legacy DB asset bytes survive the store upgrade. Active/library/valid backups migrate once with historical project validation. Exact validated localStorage copies retire after commit through a retry journal; interrupted retirement fences writes. Unknown/overflow backups retain their bytes and block GC. Future/corrupt canonical state is preserved and privately backupable.
- Conflict input stays in the losing tab for private text backup and explicit saved-state adoption. A deleted asset may prevent complete photo recovery; no automatic force overwrite/merge.

## Audit D1–D7 / B1 disposition

DECISIONS separates accepted/open/historical decisions; DATA_MODEL and EXPORT_ARCHITECTURE describe current schemas/media/profiles rather than old present-tense claims. ROADMAP distinguishes implemented foundations from goals and classifies focused NOW/NEXT/LATER/EXPERIMENT/REJECTED ideas. PRODUCT_VISION/INTEGRATIONS/SECURITY capture Magic Start, coherent Surprise Me, provider neutrality, isolated credentials, whole-process Director goals, optional hosting/audio and later adoption without claiming implementation. ADR 0005 documents complete reference/recovery/retention and failure semantics.

B1 is fixed: reprocessing a portable photo updates only matching local media. Different photos, shared references and external/unavailable metadata have a regression fixture. Standalone Studio testing is reproducible with `npm run build:standalone`; browser pretests rebuild its exact bytes and test offline creation. It is a trusted Studio bundle distinct from the small maintained hash-allowed recipient runtime.

## Validation

Full storage milestone gates passed on 2026-10-02: 99 module tests in eight files, 21 Chromium browser tests, TypeScript, lint, formatting, production build and reproducible standalone build. Evidence includes storage transactions, legacy/journal retry, quotas/collisions, concurrent saves/deletion, foreign-media regression, real shared-profile tabs, independent context isolation, no-hint conflict handling, original preservation, explicit GC and offline standalone creation. No failing check is treated as passing.

Browser checks use system Chromium (`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium`). Managed file navigation is blocked; exact downloaded HTML is tested offline on the test origin. Firefox/real phones, file-origin persistence, assistive technologies and novice studies remain unrun. Mobile desktop WebKit engine/touch coverage is tracked below; it is not physical Safari evidence. Non-failing upstream Zod build annotations remain visible.

## Persistence and integration policy

The checked milestone through 424abe4 was pushed to codex/bes-foundations and integrated into main by fast-forward on 2026-10-02; both remote refs were verified identical and the working tree clean. Later checked product checkpoints reached 23fbdb1 on both branches with Pages live; bf8840c is also persisted on the development branch. The former Pages activation blocker is historical. Work stays in the same BES task, with coherent commits and no force/history rewrite. The user's updated policy permits main integration/push only after quality, documentation, security/privacy, migration/compatibility and remote synchronization gates pass. Main integration is repository work; the newer explicit user authorization additionally permits the optional GitHub Pages Studio channel below. It does not authorize other deployments or a finished-product release. Generated assets/reports/node_modules remain ignored.

## Known limits

- Browser storage/files are unencrypted, may be blocked/full/evicted and are not permanent. Logical deletion is not forensic secure erasure. Pending saves may be lost on abrupt closure: wait for saved status and keep backups.
- Collection-wide conflict fencing is conservative, including unrelated gift edits. No automatic merge; independent profiles/contexts do not share storage. Close older BES builds before upgrading; they cannot join the IDB protocol.
- Unknown/overflow legacy backups quarantine cleanup; automatic repair of their uncertain ownership is not implemented. Corrupt/future canonical workspaces cannot be overwritten or restarted automatically. Raw recovery backups are private evidence without photo binaries and are not normal import files.
- Only a bounded last undo state is retained per project. Cleanup intentionally ends it; switching/reloading can discard live undo even while an old retention snapshot survives until next save/cleanup.
- No asset lease protects an export in flight from another tab's confirmed permanent deletion. A missing read fails safely; already downloaded gift HTML is independent.
- Portable backups have compressed gift copies, not original archives; transparency is flattened and unsupported formats remain rejected. Online host availability/IP/cookie privacy cannot be guaranteed.
- No audio/video playback, substantially alternative story arcs, public pack loader or API providers yet. The bounded “Überrasch mich” cycles coordinated directions with preserved public content and undo. Studio offline first-load/reload has no service-worker guarantee; recipient Offline HTML is independent of a server.

## Next highest priority

Physical iPhone Safari validation of the short creator flow, live deployment and ordinary recipient delivery/taps remains a **release blocker**. Then targeted novice/mobile/accessibility and qualitative staged-experience polish; no roadmap breadth before this core is strong.

## GitHub Pages delivery

A minimal main-only workflow checks installation, TypeScript, lint, formatting, module tests and the production subpath browser smoke before publishing only dist. Local dev retains its root base; the Pages build uses /birthday-experience-studio/. No path router, backend, external runtime libraries, secrets, creator storage or test fixtures are deployed. This optional public host changes neither local-first creation nor standalone gift exports.

Target URL: https://makandev.github.io/birthday-experience-studio/. Fresh API inspection now confirms build_type=workflow and the expected html_url: the user's Pages activation has become visible. The prior activation blocker is superseded. The subsequent workflow 37025754805 deployed 23fbdb1 successfully; both TLS-verified real live Chromium core smokes and assets passed. Earlier activation errors are historical, not current blockers.

Local production Pages build and both Chromium subpath smokes passed on 2026-10-02, including traditional creation and Magic Start. Assets load under the repository path and offline gift download works without browser errors. The initial smoke exposed a local preview base mismatch that was fixed; assertions were retained. Earlier runs passed build but failed configure-pages before activation became visible. No application credentials were requested or added. Hosting remains optional; drafts/assets stay local.

## Current staged / preview-first / Safari package

The user tested the previous static gift and long intake: both failed the product benchmark. This package replaces scrolling cards with opening/curiosity/choice/moment/late-letter/surprise/finale and closing, local greeting/clock, recipient choices, delayed native message, “Okay … eine allerletzte Sache”, premium gold light/particles, bounded transition/finale confetti and three-phase 13.5-second cinematic payoff. Skip/back/replay, reduced motion/pause/intensity0 and readable no-JS fallback remain available.

Default creation needs name + submit (two explicit interactions) for real staged opening, with safe relationship/vibe defaults; those choices are optional. Confirm/change/undo, optional one public detail/prompt, its actual late scene, optional photo and full gift form a short single-column loop. Detailed manual controls and three optional Quick questions are after first value. Deep is contextual and not mandatory. Private answers never seed Magic Start; existing public text is preserved. Bounded Surprise Me currently changes coordinated directions, not substantially different arcs. Qualitative Original Experience Benchmark/novice acceptance is not claimed from test counts.

Recipient HTML has exactly one maintained static CSP hash-allowed runtime and no authored/AI/imported executable behavior. Opaque preview/reader allow-scripts without allow-same-origin. New strict recipient-only Offline .bes-gift.json output can be opened locally in the optional Safari #gift reader without upload or creator storage initialization. Files-app HTML execution is not promised. No project/workspace/private-draft migration or runtime dependency is added; existing storage transactions/GC/imports remain intact. ADRs 0006/0007 and IOS_COMPATIBILITY define contracts and the open physical-device release gate.

Native touch/viewport work includes 44px targets, safe-area padding, svh/dvh with fallbacks, normal-flow controls, non-intercepting effects, 16px mobile fields, visible first result, local data loading, connected download anchors, prepared-file sharing and Safari hash-mode switch teardown. WebKit uncovered the hash-only switch bug; it was repaired. Chromium touch reproduced correct pointer targets but misplaced compatibility clicks inside the opaque frame. Narrow matched touch activation/deduplication now handles maintained buttons/reveals while rejecting scroll/cancel and preserving mouse/keyboard. Browser-host dependencies are installed in the cloud locally from signed package indexes; no root password/TLS bypass. Desktop WebKit is an approximation, not a physical iPhone result.

Final package local gates on 2026-10-02: 119 module tests, all 27 Chromium browser tests and all eight mobile touch tests across desktop WebKit/Chromium passed, with TypeScript, lint, formatting, standard production and reproducible standalone builds. Browser coverage includes simultaneous autosave/deletion, historical migration, photo metadata/original preservation, exact offline HTML, CSP tampering/no-JS fallback, seven stages, 13.5-second finale, reduced motion, pointer scroll/cancel/deduplication and keyboard activation. The production Pages build, both Chromium subpath smokes and all eight production-subpath mobile tests also passed. The initial no-upload smoke incorrectly included the opener page load; it now waits for loaded recipient mode and still asserts zero requests while reading/playing the local gift. Actual live delivery is checked after integration. No pending check is reported as passing. Main/live remain 23fbdb1 until this candidate is integrated; bf8840c is already safely pushed to the development branch.

The reported iPhone failure occurred in WhatsApp and the file manager. On iPhone/iPad, the primary export now saves the recipient-only Safari data file synchronously; HTML is an explicit secondary action. Guidance says to save the attachment to Files and select it from the Safari gift opener. This addresses the delivery mismatch without claiming real-device verification or executable Quick Look.
