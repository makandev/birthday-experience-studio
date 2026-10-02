# Coordinated Motion / Effect system

| Direction | Theme       | Typography | Entrance           | Image direction | Pacing                   | Finale           |
| --------- | ----------- | ---------- | ------------------ | --------------- | ------------------------ | ---------------- |
| Emotional | Warm        | Serif      | Soft settle        | Soft            | 1000 ms / 160 ms stagger | Quiet            |
| Funny     | Celebration | Clean      | Small playful lift | Polaroid        | 600 ms / 80 ms stagger   | Bounded sparkles |
| Elegant   | Minimal     | Serif      | Soft settle        | Soft            | 800 ms / 100 ms stagger  | Quiet            |
| Cinematic | Warm        | Serif      | Lift               | Wide            | 1200 ms / 180 ms stagger | Bounded sparkles |

`registries/motion.ts` validates declarative direction data. `engines/motion.ts` creates a deterministic plan and optional context-based recommendation. `experience/motion.ts` generates trusted finite CSS and decorative markup from allowed numeric tokens. No custom CSS/JS in imported data.

Intensity 0 disables motion; 1–3 changes movement and sparkle quantity. Mobile caps visible particles at six and translation at 6 px; desktop caps are 12 particles/12 px. Entrance duration is at most 1500 ms, stagger delay at most 1200 ms. No infinite loops, flashing or autoplaying sound. The gift offers “Bewegung ausschalten”; `prefers-reduced-motion` always wins. Animation never hides required content, and decorative particles have `aria-hidden`.

The first implementation animates entrances on load and native reveal remains user-controlled. Viewport-triggered choreography, advanced timelines and soundtrack timing are future work; do not claim complete cinematic sequencing.

Text opacity stays at 1 throughout every entrance to preserve contrast during motion, not only after it ends.
