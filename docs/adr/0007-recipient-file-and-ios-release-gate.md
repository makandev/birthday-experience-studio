# ADR 0007 — Recipient-only data reader and iOS release gate

Status: implemented; automated and physical-device evidence is tracked separately in STATUS/IOS_COMPATIBILITY.

User device feedback invalidates the earlier iPhone-fix claim. A locally opened HTML attachment may be an OS file preview rather than a script-capable browser. We cannot change iOS Files behavior through HTML touch hacks or promise an “Open in Safari” option. Portable offline HTML remains useful on supporting browsers; genuine iPhone creator, live app, recipient delivery and taps are release requirements.

Add one bounded optional delivery adapter: export a strict bes-recipient-gift v1 JSON envelope containing only projected ExportExperience v1 Offline content and normalized JPEG copies. The public #gift reader loads trusted Studio code and reads the selected file locally, with no upload, gift URL payload, provider call, creator workspace initialization or import of raw HTML. It revalidates byte/depth/node/key/schema/type/source budgets, then regenerates the maintained renderer in an opaque allow-scripts frame. Private drafts and network sources are refused. This is not hosted personalized sharing or a generic import platform.

The user sends the public data file plus Safari reader link, then the recipient picks the received file in Safari. Page loading requires an initial connection; portable HTML remains independent of mandatory hosting. Native file sharing is capability-detected and uses a precomputed File synchronously within user interaction. The explicit download fallback uses a connected anchor and keeps the object URL available for 60 seconds.

No CreatorProject, workspace, portable-draft or ExportExperience migration is required. Envelope versioning permits a future deliberate upgrade; arbitrary fields/versions fail closed. Existing projection excludes private answers, relationship data, revisions/IDs/original bytes/metadata and credentials.

Touch targets, safe areas, dynamic viewport and normal-flow controls, opaque-frame isolation, actual stage/reveal/finale/replay and Safari hash-only mode changes are regression requirements. Browser tests use desktop WebKit with iPhone dimensions/native touch plus additional Chromium/mobile coverage. Neither establishes physical iPhone, file://, Quick Look or OS share behavior. STATUS must keep the release blocked pending actual-device delivery/taps/accessibility acceptance. Checked main may supply a development preview for that acceptance; it is not a release claim.
