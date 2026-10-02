# Recipient export architecture

Current target: one portable HTML gift. This is an output artifact, not a serialized Studio or CreatorProject.

Pipeline: snapshot CreatorProject → read selected local asset derivatives → validate project/capabilities → explicit ExportExperience projection → resolve maintained block/theme/direction contracts → script-free HTML/CSS → byte-budget check → download. Missing local/unsupported selected dependencies block export with a useful error. Disabled blocks are ignored. No universal post-export immunity is claimed.

## Explicit profiles

| Profile              | Dependencies                                                                                                  | Failure behavior                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Offline / Restricted | Required images embedded as normalized JPEG data URLs; inline CSS, no required external network/fonts/scripts | Refuse external or unresolved selected sources before export                               |
| Standard / Online    | Local content plus deliberate public HTTPS photos; source consent lists selected origins                      | Descriptions/captions persist when hosts fail; Online sources are not guaranteed available |
| Share / Hosted       | Future optional profile                                                                                       | No mandatory cloud or account for core creation/export                                     |

Imports clear external consent. Safe URL rules exclude credentials, queries, fragments, IP/local hosts and unsafe schemes. Online CSP permits only selected photo origins, not unrestricted networking. Remote hosts may still see recipient IP/cookies; no-referrer is not anonymity. Reduced-motion/recipient motion-off hides external images that cannot be guaranteed still, preserving descriptions.

## Projection and renderer

`parseProject`/`requireCapabilities` → `projectExperience` → `renderExperience`. Known enabled block types/versions and required data are checked; unknown themes fall back to Warm. All text is escaped; no user HTML, Markdown execution, JavaScript or arbitrary CSS. Photo projection excludes original bytes, names, IDs and metadata. JPEG signatures/dimensions/size/metadata markers are checked again. Limit: 6 MiB per gift.

HTML uses inline trusted CSS, finite direction motion, native details and recipient motion control; no scripts, forms, Creator UI or provider calls. CSP defaults to none, allows inline styles and appropriate image sources, disables base/form actions. The preview uses the exact same renderer in a sandboxed iframe without permissions. Async generation tokens discard stale preview reads.

Creator backups are a different private artifact: up to 2 MiB project text, portable photo envelope up to 8 MiB. They contain answers/copies and must not be sent as gifts. Credentials belong in neither artifact.

## Verification and remaining limits

Unit and browser tests cover private sentinels, XSS, unknown blocks, deterministic output, active-source checks, EXIF/name exclusion, profiles/consent, reduced motion and offline rendering of exact downloaded bytes. Managed Chromium blocks direct file navigation; real file opening in other browsers and assistive technologies remains a device check. Concurrent permanent deletion can make an in-flight photo read fail safely; no export lease exists yet. Completed standalone HTML is independent of later Studio storage changes.

Audio/video source architecture is reserved but playback/export is not implemented; selected unsupported kinds are refused. Future audio needs intentional interaction and accessible controls, not an autoplay exception.
