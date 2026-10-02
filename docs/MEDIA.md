# Media foundations

## Implemented photos

Creator metadata points to a source, not binary bytes. `media/store.ts` retains originals and processed blobs in IndexedDB `bes-media` / `assets`. `media/formats.ts` checks signatures/dimensions and export data URLs; `media/process.ts` decodes orientation, resizes and re-encodes JPEG; `media/resolve.ts` resolves selected sources without uploading them. `studio/media.ts` is a separate controller for import/drop, descriptions, non-destructive contain/cover positioning, removal/undo and original download.

Only normalized derivatives cross the recipient projection. Neither original filename nor original EXIF/comments, creator media ID, unrelated photos, answers or original bytes belong in gift HTML. Canvas copies are not pixel-identical to the original; transparent photos receive a light backdrop. JPEG/PNG/still WebP are supported; SVG/GIF/HEIC are not. Animated WebP is refused; APNG is flattened to a still.

| Budget                         | Value          |
| ------------------------------ | -------------- |
| Photos per gift                | 6              |
| Original file                  | 8 MiB          |
| Decoded source                 | 24 MP          |
| Rendered longest edge / pixels | 1600 px / 2 MP |
| Rendered JPEG                  | 512 KiB        |
| Recipient HTML                 | 6 MiB          |
| Portable draft / project text  | 8 MiB / 2 MiB  |

Processing is sequential, closes decoded bitmaps and releases canvas pixels. A failed format/decoder/quota operation leaves existing creator text intact. Mobile renderer uses bounded motion and responsive photo frames; actual low-memory-device tests are still required.

## Portable drafts and retention

Text-only historical/raw draft JSON remains accepted. A photo draft uses a strict `bes-draft` v1 envelope with the v2 project and processed photo data URLs. Every needed asset must match exactly; unreferenced, duplicate, missing or unsafe asset declarations are rejected. Import reprocesses photos and generates new asset IDs before storing them after confirmation. Originals stay on the source device and can be downloaded separately.

Removing a photo removes its current references; a recovery root protects the last undo state and other gifts retain their own references. Confirmed imports commit project and immutable binary records in the same IndexedDB transaction; aborted imports leave no staging bytes. A bounded same-project recovery snapshot retains removed originals/derivatives. Confirmed project deletion removes its snapshot and only assets no longer referenced by any project/recovery; explicit cleanup releases all recoveries and removes unreferenced asset keys. Automatic reference-delta cleanup never performs a full store scan; initial migration performs a key-only sweep. This is logical deletion, not forensic secure erasure. Browser storage is unencrypted and can be cleared by the user/browser; save important originals separately.

## Offline and Online

Offline/Restricted only uses embedded normalized photo data. Missing images block export. Standard/Online may use deliberate HTTPS photo sources and shows the described moment even when the image is unavailable. It does not promise remote availability. Consent lists sources and explains IP disclosure; import clears prior consent. `referrerpolicy=no-referrer` avoids sending page origin/referrer, but cannot promise anonymous access or suppress all host cookies. There is no server-side fetch proxy or API-provider integration.

## Audio and video architecture: prepared, not implemented

The same source discriminant and media kind contract reserve local embedded and external/online audio/video. Current exports explicitly reject these unsupported kinds, rather than silently omitting them or starting playback.

The next audio milestone should add a typed soundtrack configuration, immutable original/processed asset separation, explicit file/duration budgets and codec validation, and recipient native or trusted maintained controls for play/pause/volume. Start must follow deliberate recipient interaction; no autoplay assumption. Offline requires embedded/local bytes. Online sources need consent and a meaningful fallback. Audio credentials never belong in projects or URLs. Coordination should use direction/pacing events via maintained runtime code, never executable community configuration. Video follows the same capability/size/trust boundaries; no video loader exists yet.

## Exact import metadata and storage ownership

Portable reprocessing updates asset ID/dimensions/size/MIME only for media referencing the matching old local asset. Shared references to that asset update together; other local photos and external/unavailable media retain their own metadata. B1 has a multi-photo/shared/external/unavailable regression fixture. Asset references count even for disabled blocks and future media kinds; all projects/recovery roots are validated before destructive GC. Unknown legacy backup references suspend cleanup. Storage details/guarantees are in ADR 0005.
