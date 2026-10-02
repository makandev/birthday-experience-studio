# BES 0.2 — storage integrity and focused product foundations

Early evolving development, not a finished product. Core creation remains zero-cost and useful without accounts, paid APIs, mandatory servers/cloud or AI. PRODUCT_VISION defines commitments; this file reports implementation and evidence.

## Implemented

- 0.1 baseline was verified, first committed as 1fc0cec and pushed; the preceding foundation cycle reached 3c60498 on codex/bes-foundations.
- Magic Start: name, relationship and one explicitly public sentence → editable first preview with letter/wish/direction, autosave, undo and Quick/Deep/photo refinement. Private answers are not seed input; existing compositions are preserved.
- Five-step Studio, Quick/Deep adaptive questions with help/examples/skip/unknown, guided/manual writing, conscious public-text review, isolated preview and standalone offline gift HTML.
- Direction-based finite motion/typography/colors/media styling/order recommendations, intensity 0–3, recipient motion-off, reduced-motion/mobile budgets and full contrast.
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

B1 is fixed: reprocessing a portable photo updates only matching local media. Different photos, shared references and external/unavailable metadata have a regression fixture. Standalone Studio testing is reproducible with `npm run build:standalone`; browser pretests rebuild its exact bytes and test offline creation. It is a trusted Studio bundle with JavaScript, unlike recipient gifts.

## Validation

Full storage milestone gates passed on 2026-10-02: 99 module tests in eight files, 21 Chromium browser tests, TypeScript, lint, formatting, production build and reproducible standalone build. Evidence includes storage transactions, legacy/journal retry, quotas/collisions, concurrent saves/deletion, foreign-media regression, real shared-profile tabs, independent context isolation, no-hint conflict handling, original preservation, explicit GC and offline standalone creation. No failing check is treated as passing.

Browser checks use system Chromium (`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium`). Managed file navigation is blocked; exact downloaded HTML is tested offline on the test origin. Firefox/Safari/real phones, file-origin Studio persistence, assistive technologies and novice studies are still unrun. Non-failing upstream Zod build annotations remain visible.

## Persistence and integration policy

The checked milestone through 424abe4 was pushed to codex/bes-foundations and integrated into main by fast-forward on 2026-10-02; both remote refs were verified identical and the working tree clean. This subsequent documentation correction records the observed Pages blocker and is synchronized to both branches as well. Work stays in the same BES task, with coherent commits and no force/history rewrite. The user's updated policy permits main integration/push only after quality, documentation, security/privacy, migration/compatibility and remote synchronization gates pass. Main integration is repository work; the newer explicit user authorization additionally permits the optional GitHub Pages Studio channel below. It does not authorize other deployments or a finished-product release. Generated assets/reports/node_modules remain ignored.

## Known limits

- Browser storage/files are unencrypted, may be blocked/full/evicted and are not permanent. Logical deletion is not forensic secure erasure. Pending saves may be lost on abrupt closure: wait for saved status and keep backups.
- Collection-wide conflict fencing is conservative, including unrelated gift edits. No automatic merge; independent profiles/contexts do not share storage. Close older BES builds before upgrading; they cannot join the IDB protocol.
- Unknown/overflow legacy backups quarantine cleanup; automatic repair of their uncertain ownership is not implemented. Corrupt/future canonical workspaces cannot be overwritten or restarted automatically. Raw recovery backups are private evidence without photo binaries and are not normal import files.
- Only a bounded last undo state is retained per project. Cleanup intentionally ends it; switching/reloading can discard live undo even while an old retention snapshot survives until next save/cleanup.
- No asset lease protects an export in flight from another tab's confirmed permanent deletion. A missing read fails safely; already downloaded gift HTML is independent.
- Portable backups have compressed gift copies, not original archives; transparency is flattened and unsupported formats remain rejected. Online host availability/IP/cookie privacy cannot be guaranteed.
- No audio/video playback, full viewport choreography, Surprise Me, public pack loader or API providers yet. Studio offline first-load/reload has no service-worker guarantee; recipient Offline HTML is independent of a server.

## Next recommended bounded milestone

The first bounded Magic Start is now implemented and self-audited, using current safe primitives without schema/dependency changes. Next selected value: recipients can inspect the uncropped normalized gift photo through native HTML, without duplicate image bytes or JavaScript. This is a small media/experience improvement, then browser/mobile/accessibility stabilization. Known storage recovery limits get focused fixes when evidence requires them, not an expanded foundation program.

## GitHub Pages delivery

A minimal main-only workflow checks installation, TypeScript, lint, formatting, module tests and the production subpath browser smoke before publishing only dist. Local dev retains its root base; the Pages build uses /birthday-experience-studio/. No path router, backend, external runtime libraries, secrets, creator storage or test fixtures are deployed. This optional public host changes neither local-first creation nor standalone gift exports.

Target URL: https://makandev.github.io/birthday-experience-studio/. Fresh API inspection now confirms build_type=workflow and the expected html_url: the user's Pages activation has become visible. The prior activation blocker is superseded. A checked main push starts the next deployment; live verification is still pending until the run and real site succeed.

Local production Pages build and both Chromium subpath smokes passed on 2026-10-02, including traditional creation and Magic Start. Assets load under the repository path and offline gift download works without browser errors. The initial smoke exposed a local preview base mismatch that was fixed; assertions were retained. Earlier runs passed build but failed configure-pages before activation became visible. No application credentials were requested or added. Hosting remains optional; drafts/assets stay local.

## Immediate continuation / Magic Start evidence

The same task continued directly after storage: four additional module tests cover public-only projection, private-answer isolation, immutable input, direction/profile preservation, bounds/overwrite protection and hostile text. Two new browser tests cover saved-seed reload, preview/export/refinement, dialog axe checks, keyboard focus, mobile validation and undo. TypeScript, lint, formatting, 103 module tests, 23 Chromium browser tests, production and standalone builds passed on 2026-10-02. Both production Pages smokes passed (traditional flow and Magic Start). No project/portable/workspace schema migration or new dependency is needed. Real novice/assistive-technology studies remain outstanding.

After the user reported manually changing Pages settings, the repository was freshly checked and workflow [37024723633](https://github.com/makandev/birthday-experience-studio/actions/runs/37024723633) was dispatched. Build/tests passed; deploy still failed at configure-pages with no site found. That check initially returned Pages GET 404/activation POST 403, but a later fresh GET now confirms workflow source and html_url. The old blocker is no longer current; verify the next deployment/live site. Independent authorized product work continues rather than waiting idle.
