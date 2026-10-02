# ADR 0003 – Coordinated directions, capability profiles and untrusted Director data

Status: accepted for evolving 0.2 foundations.

Motion/effects are part of birthday storytelling. Four schema-validated declarative directions coordinate theme, typography, entrance motion, image presentation, preferred block order, pacing and finale. A creator chooses/recommends the direction, can edit order/theme afterward, and sets intensity 0–3. Text sync never silently reorders the gift. Motion is deterministic, finite, capped at 1.5 seconds per entrance, 1.2 seconds stagger delay, 12 desktop particles and six visible mobile particles. Native CSS/HTML handles effects and recipient pause control; no imported JavaScript. Reduced motion overrides everything, and base content remains readable without animation.

We retain built-in renderer code as application code. Community direction/configuration data cannot carry CSS, JS or functions. No third-party pack loader is offered yet.

Offline/Restricted and Standard/Online are explicit project/export profiles. Selected media dependencies are analyzed; unresolved assets fail closed, disabled media is ignored, offline rejects external sources, and online requires explicit consent. External URLs allow public HTTPS DNS hosts without credentials, query strings, fragments or custom ports. Imported drafts clear previous external consent. This is not a general URL-fetch or SSRF proxy; no server fetches are implemented.

The provider-neutral Integration Center supports manual copy/paste only. Concrete providers and credential fields are absent until current official docs, cost/limits, and browser/trusted-backend requirements are reviewed. Core creation never relies on free tiers. A Director proposal is untrusted bounded JSON, with exact allowed direction/theme/intensity/tone settings and a complete permutation of existing block IDs. No tools/actions/scripts, URLs, new executable blocks or text mutation. Private follow-up suggestions are displayed as text and not automatically installed as questions. Approval and application revalidate against current project state; undo is available.

Future AI Director capabilities can extend this data protocol with further validated proposals, not arbitrary instructions. Dynamic audio will require deliberate recipient interaction, controls and fallback, and must preserve these capability boundaries.

## Superseding scope note (2026-10-03)

The manual Director contract above remains declarative. ADR 0009 supersedes this ADR's historical provider-absence/non-executable-output claims for a separate, reviewed generated drawing program in an opaque CSP Worker. Concrete free-only OpenRouter/local-only Ollama transports are now implemented; no generated code executes in Studio/main DOM or community packs.
