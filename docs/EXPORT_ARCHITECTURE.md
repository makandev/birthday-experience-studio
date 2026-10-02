# Recipient export architecture

Current targets: portable HTML gift and recipient-only Offline data file for the optional Safari reader. This is an output artifact, not a serialized Studio or CreatorProject.

Pipeline: snapshot CreatorProject → read selected local asset derivatives → validate project/capabilities → explicit ExportExperience projection → resolve maintained block/theme/direction contracts → staged HTML/CSS with one maintained hashed runtime → byte-budget check → download. Missing local/unsupported selected dependencies block export with a useful error. Disabled blocks are ignored. No universal post-export immunity is claimed.

## Explicit profiles

| Profile              | Dependencies                                                                                                  | Failure behavior                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Offline / Restricted | Required images embedded as normalized JPEG data URLs; inline CSS, no required external network/fonts/scripts | Refuse external or unresolved selected sources before export                               |
| Standard / Online    | Local content plus deliberate public HTTPS photos; source consent lists selected origins                      | Descriptions/captions persist when hosts fail; Online sources are not guaranteed available |
| Share / Hosted       | Future optional profile                                                                                       | No mandatory cloud or account for core creation/export                                     |

Imports clear external consent. Safe URL rules exclude credentials, queries, fragments, IP/local hosts and unsafe schemes. Online CSP permits only selected photo origins, not unrestricted networking. Remote hosts may still see recipient IP/cookies; no-referrer is not anonymity. Reduced-motion/recipient motion-off hides external images that cannot be guaranteed still, preserving descriptions.

## Projection and renderer

`parseProject`/`requireCapabilities` → `projectExperience` → `renderExperience`. Known enabled block types/versions and required data are checked; unknown themes fall back to Warm. All text is escaped; no user HTML, Markdown execution, JavaScript or arbitrary CSS. Photo projection excludes original bytes, names, IDs and metadata. JPEG signatures/dimensions/size/metadata markers are checked again. Limit: 6 MiB per gift.

HTML uses seven stations plus a closing epilogue, trusted CSS, native details and exactly one static maintained inline runtime. CSP defaults to none and allows that runtime only by its tested SHA-256 hash, inline styles and appropriate image sources; base/form/network-provider actions remain disabled. No authored/imported/AI code, external script, creator UI or provider call. Text never enters JavaScript. Preview shares the renderer in an opaque sandbox with allow-scripts only, never allow-same-origin. Async generation tokens discard stale preview reads. Preview-only station selection is not included in downloaded gifts. JavaScript-disabled output remains chronological readable HTML with native reveals. See ADR 0006.

`export/recipient-file.ts` projects the same allowlisted public data into a strict bes-recipient-gift v1 envelope, then validates byte/depth/node/key/schema/type/content/source budgets. The `#gift` reader does not mount creator storage; it validates data and recreates only the maintained renderer in the opaque frame. It never executes imported HTML or loads external photo sources. The optional page must first load, but files stay local with no upload/URL encoding. Initially Offline data only. This is a delivery adapter, not hosted personal gifts. Native sharing uses an already prepared File directly in a click; unsupported/cancelled sharing has a file fallback. iOS Files HTML execution is not promised; real-device release gate remains open. See IOS_COMPATIBILITY.

Creator backups are a different private artifact: up to 2 MiB project text, portable photo envelope up to 8 MiB. They contain answers/copies and must not be sent as gifts. Credentials belong in neither artifact.

## Verification and remaining limits

Unit and browser tests cover private sentinels, XSS, unknown blocks, deterministic output, active-source checks, EXIF/name exclusion, profiles/consent, reduced motion and offline rendering of exact downloaded bytes. Managed Chromium blocks direct file navigation; mobile WebKit covers the Safari engine, but physical iPhone, file://, Quick Look/delivery applications and assistive technologies remain explicit device checks. Concurrent permanent deletion can make an in-flight photo read fail safely; no export lease exists yet. Completed standalone HTML is independent of later Studio storage changes.

Audio/video source architecture is reserved but playback/export is not implemented; selected unsupported kinds are refused. Future audio needs intentional interaction and accessible controls, not an autoplay exception.
