# Coordinated staged motion

Emotional/Fröhlich/Elegant/Filmisch direction data coordinates known theme, typography, photo style and 600–1200ms scene entrance timing. Creator intensity 0–3, recipient pause and prefers-reduced-motion take priority. No imported CSS/JS. ADR 0006 updates the previous finite-only scroll effects; `experience/motion.ts` remains the older bounded helper, while the active staged renderer uses `experience/render.ts` and `runtime.ts`.

Seven deliberate stations plus closing use finite text entrances, gentle 18-second light drift and 20-second gold particle loops, finite 1600ms canvas confetti on transitions/start and stronger finale. Gold particles max12 desktop/max6 visible mobile; canvas max64 desktop/max24 mobile, scaled by intensity. Deterministic particle placement, no external effect library/network. The finale has three phases at 0/4.5/9 seconds and completion at13.5 seconds. A visible skip avoids forced waiting; pause/reduced motion/intensity0 reveal all finale messages without delay. Completed messages do not overlap.

Text retains full opacity/contrast during entrances. Decorations are aria-hidden and pointer-events:none. Recipient pause stops CSS/RAF, visibility changes stop background work, and pagehide clears intervals/timeouts/RAF. The local clock ticks only on the visible opening. No sound playback or autoplay claim. Native navigation is normal flow, no effect overlay captures taps.

Online images cannot be guaranteed still: reduced motion/pause hide external image/view controls but retain descriptions. Local normalized JPEGs remain visible. This does not guarantee zero Online requests; export capability/consent remains separate.

Tests cover hash-pinned runtime, progression, timing/skip/pause/reduced motion, mobile budgets/touch and accessibility. Real-device accessibility/performance and qualitative pacing still require acceptance; future music/alternative story arcs must remain bounded and coherent.

## Rebuild choreography

ADR 0008 coordinates scene selection with a quiet 3.2-second phase, bright playful 2.4-second phase (gentle 3.2) or cinematic 4-second phase. The legacy Champion retains 4.5-second phases. Emotional finale revisits an existing normalized photo and public core-message quote; celebratory/cinematic finales offer bounded finite fireworks, never perpetual firing. Respectful register omits fireworks/false ending. All effects stop on pause, reduced motion, zero intensity or hidden document. No-JS Challenger disables animation and retains native disclosure reading. Public authored words never enter executable runtime bytes.

## Current AI-native checkpoint — 2026-10-03

Generated programs compute new particle/drawing choreography from time/scene/finale phase, instead of selecting a fixed effect list. Only circle/line/rectangle drawing commands cross the sandbox boundary; no generated DOM/CSS. Max160 commands/96 mobile, 30fps target, bounded dimensions/glow, 1500ms startup and400ms frame watchdog. Pause/reduced/visibility/pagehide terminate work and late replies cannot reactivate it. Embedded data-URL Worker replaces Blob after WebKit offline failures. Controlled reference-style light/material/letter staging is maintained; actual model output and qualitative acceptance are separate.
