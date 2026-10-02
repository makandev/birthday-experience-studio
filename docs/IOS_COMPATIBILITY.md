# iPhone / iOS Safari release gate

Status: **release blocked pending real-device acceptance**. Desktop WebKit is a Safari-engine approximation; Chromium touch/viewport checks are additional mobile coverage. Neither proves behavior of a physical iPhone, iOS Files/Quick Look, Messages/Mail attachments, download/share sheet or private-mode eviction. Do not describe the earlier iPhone fix as solved.

User-reported failure: tapping exported HTML in WhatsApp and the file manager did not work; iOS version was not provided. This is actual reported device evidence. There is no claim of verified Safari live-page failure or success from that report.

## Delivery paths

1. Portable HTML remains a complete local gift with inline maintained runtime, embedded photo copies and no required network in Offline mode. Actual file opening depends on the receiving OS/application. A file preview in iOS Files/Mail/Messages is not equivalent to opening a web page in Safari. We do not promise executable HTML in those previews or instruct users to tap a nonexistent “Open in Safari” menu.
2. The new public **Safari gift opener** is `https://makandev.github.io/birthday-experience-studio/#gift`. The creator exports a **.bes-gift.json** recipient file and sends it with this link. When received through WhatsApp/Mail, first save the recipient file through Share → Save to Files. The recipient opens the link in Safari and selects that saved file through the native picker. In-product guidance names these ordinary steps explicitly. The page needs an initial connection to load Studio code; all gift reading/rendering is local with no upload or gift content in a URL. Once loaded, this reader needs no gift-fetch request. It is an optional delivery path, not mandatory hosting for the core or a hosted personal gift.
3. Recipient files contain only validated ExportExperience v1 in a strict `bes-recipient-gift` v1 envelope, up to 6 MiB. They contain public text and normalized JPEGs, no private project/answer/storage/original data. This first reader accepts embedded Offline data only; foreign HTML, private drafts, unknown fields/versions, SVG and network sources fail closed.
4. The primary export is **standalone HTML on every device**, including iPhone/iPad. The full opening-first HTML is prepared before the download tap and saved synchronously, preserving user activation without an awaited IndexedDB read. The optional JSON reader is collapsed and explicitly experimental; it never substitutes for the required HTML gift or satisfies the iPhone release gate. Device detection controls only a platform warning. Optional recipient-data sharing still uses a prepared File inside the intentional gesture; cancellation/unsupported sharing falls back to that optional file download. Connected anchors retain object URLs for 60 seconds. Actual OS download/share/opening remains a real-device check.

## Interaction audit and implemented controls

- Semantic buttons, radios, labels and native details; ordinary click/keyboard activation plus narrow pointer-based touch activation on maintained buttons/reveals; no blanket preventDefault or custom swipe interception. Touch down/up must match, remain within 8px/800ms, and scroll/cancel is rejected. The compatibility click is deduplicated, so a single tap advances once. This corrects a reproduced mobile opaque-frame click-coordinate issue without granting extra frame permissions.
- Primary buttons/summary targets at least 44×44 CSS pixels. Vibe labels have 44px height; inputs are 16px on small screens to avoid focus zoom.
- Decorative canvas/light/particles have pointer-events:none. Controls occupy normal layout above backgrounds; no full-page invisible click-catching overlay.
- Recipient progression controls stay in normal document flow, with safe-area padding and svh plus vh fallback. No fixed/sticky bottom bar obscures content. Long letters/photos may scroll inside the preview; the full browser gift uses normal document scrolling.
- Studio preview and gift opener use opaque `srcdoc` frames with **allow-scripts only**, never allow-same-origin. The first result is brought into view. No frame-to-creator storage access or unsafe popup permission is granted.
- Dialogs scroll within the dynamic viewport; keyboard focus is managed on meaningful headings/fields. Escape from public refinement keeps the autosaved text and updates its preview. Safari hash-only route changes reload into the appropriate mode, disposing previous Studio listeners/storage initialization.
- Recipient mode never initializes creator persistence. Creator storage failures remain explicit and editing/text export stay possible; no promise of durable iOS/private-mode storage.
- No audio playback exists yet; future soundtrack start requires intentional interaction, accessible play/pause/volume and fallback. No autoplay workaround is claimed.

## Automated coverage

`npm run test:mobile` runs touch tests for iPhone-sized WebKit and an Android-sized Chromium path. Tests exercise minimum-input Magic Start, public detail, optional photo skip, actual opaque preview, recipient-file download/read, every station, choice, late letter, skip/replay/back, reduced-motion finale, 44px targets, no horizontal overflow, exact HTML offline, invalid file rejection and recipient isolation from blocked creator storage. Native taps are not forced. The touch regression uses ordinary taps and actual scene assertions, with no forced click or fixed sleep to mask a lost first tap. Mouse/keyboard, scroll/cancel rejection and compatibility-click deduplication are tested separately. These tests read exact HTML bytes on a test document, **not file:// or iOS Quick Look**.

Production-subpath coverage runs with `npm run build:pages` then `npm run test:mobile:pages`; the Pages workflow gates deployment on it. `npm run test:mobile:live` repeats the same checks at the actual public URL in isolated contexts.

Run WebKit on a normal supported machine with `npx playwright install --with-deps webkit chromium`, then `npm run test:mobile`. In this managed non-root cloud, verified signed Debian packages are extracted locally and a local wrapper supplies their library paths to the downloaded Playwright WebKit binary; environment startup instructions record the tested command. No TLS/package-signature check is disabled.

## Required real-device acceptance (not yet executed)

Record device, iOS/Safari version, ordinary/private mode, portrait/landscape and actual delivery application. Use fictional data.

- Open the live Studio in Safari; name + preview, confirm/change/undo, optional public detail/photo, export and native share/fallback.
- Send .bes-gift.json through normal Messages/Mail/AirDrop; save/select it using the Safari gift opener. Verify one deliberate tap per primary action, choice/reveal, finale/skip, back/replay and no controls behind browser chrome/keyboard/safe areas.
- Verify the primary downloaded HTML contains the full gift and needs no BES page/upload. Try ordinary HTML delivery/opening on the device; record non-interactive OS previews as unresolved failures. The experimental JSON reader may be evaluated separately, but passing it does not mark standalone iPhone delivery fixed.
- Try blocked/private storage and memory-pressure reload; no silent loss/overwrite or false saved state. Verify raster/photo import including an unsupported HEIC explanation, large image and offline recipient photo rendering.
- Run VoiceOver, reduced motion, larger text and zoom. Check disclosure/choice/focus and skip controls.

Any non-tappable standalone gift or broken creator/delivery on an actual iPhone keeps the release blocked. A checked development preview may be deployed to make this device acceptance possible; that is not release approval.

Reference: [Apple Files guide](https://support.apple.com/guide/iphone/find-and-view-files-and-folders-iphe4bff8827/ios) describes ordinary file viewing. It does not establish arbitrary local HTML JavaScript support. The reported failing HTML opening is treated as device evidence, not overridden by desktop automation.
