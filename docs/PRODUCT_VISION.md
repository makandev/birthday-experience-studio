# BES product contract

Birthday Experience Studio helps normal, nontechnical people create a highly personal interactive birthday experience: tell BES about the person, add memories/photos, and BES helps assemble the gift. BES stays focused on birthdays, not a generic website builder, AI platform or executable plugin ecosystem. This is an evolving 0.x product.

## Non-negotiable promises

- The complete core is useful at zero cost without subscriptions, paid APIs, servers, accounts, cloud services or external AI. A third-party free tier must never be a core dependency; its terms can change.
- Local-first is not offline-only. **Offline / Restricted** exports embed all required content with no required external requests, including on company networks. **Standard / Online** permits deliberately selected sources/integrations, capability checks and graceful fallback. Later Share/Hosted mode is optional and must never require a cloud for creation/export.
- Private Studio data and recipient-visible content are separate. Never automatically export questionnaire answers; project through an explicit allowlist. The creator reviews all gift text/captions, including guided or AI-assisted content.
- Coordinated Emotional, Funny, Elegant and Cinematic directions connect typography, media, transitions, motion intensity, pacing, surprise and finale. Effects must serve a coherent story, with accessibility and mobile/performance budgets.

## Beginner creation and personalization

Magic Start aims for a convincing first birthday result from very few inputs, followed by optional Quick/Deep refinement. A bounded first implementation now assembles existing safe letter/wish/direction blocks from name with safe relationship/vibe defaults; a public sentence and photo follow as optional refinement. It does not automatically read private questionnaire answers or invent facts; review/edit/photos and refinement remain available. This is the first implementation, not the full long-term quality promise. Quick now targets 3–5 lightweight interactions; the earlier 6–10-question requirement is superseded. Deep adapts without an artificial engine question limit. Help, examples, skip and “I don't know” are essential.

Surprise Me targets alternative coherent dramaturgies/compositions from the same validated BES primitives and inputs, not a random collection of effects. The creator remains in control and can compare/revise proposals.

## Integrations and Director

The Integration Center/Capability Layer is provider-neutral. Concrete providers require current official documentation review of costs/limits, signup/key requirements, browser/backend boundaries, security and licensing. Manual external-AI prompt copy/paste remains the universal no-cost BES fallback; the independently chosen service may itself require payment/signup. No provider pricing promise is permanent.

Long-term AI Director may propose adaptive questions, tone, story arc, block selection/order, photo placement, theme, transitions, motion/effects, pacing/timing, surprises, finale and music direction. AI output is untrusted structured data validated against schemas/allowlists, never executable code or direct tool instructions. Current capabilities and omissions are in [INTEGRATIONS.md](INTEGRATIONS.md) and [STATUS.md](STATUS.md).

Credentials are isolated from CreatorProject, project files, recipient HTML, prompts, URLs, logs, Git and community packs. Client secrets must never be exposed. A provider unsafe from a local browser is unsupported or requires a secure optional architecture; such a backend cannot become a core dependency.

## Safe extensibility and later adoption

Community contributions primarily contain declarative relationship/question packs, themes, composition/storytelling recipes, layouts, motion/effect configurations and complete birthday presets. No arbitrary community JavaScript or automatically executed code. A documented, validated pack format must precede public pack import.

After foundations and usability gates, a public-adoption phase can add fictional-data demo mode, Magic Start, Surprise Me, safe community packs, QR/print companions, optional removable subtle BES attribution, and landing/demo/release/onboarding/contribution material. These are goals, not current features, and marketing does not outrank data integrity or accessible creation.

Local/embedded audio should eventually work offline, with optional online sources, intentional recipient interaction before playback (browser autoplay rules), accessible play/pause/volume and graceful fallback. Video/media contracts may expand safely later. Audio playback is not implemented yet.

Source-of-truth roles: this document defines the product; ARCHITECTURE/DATA_MODEL/EXPORT_ARCHITECTURE define contracts; SECURITY/PRIVACY/THREAT_MODEL define boundaries; ROADMAP defines sequence; STATUS defines verified implementation; DECISIONS/ADRs distinguish accepted, open and historical choices.

## Small, excellent product instead of a platform

Quality before feature count. BES should be professional and thoughtful without becoming a large multi-year system. Prefer a few strong functions, simple solutions and bounded milestones achievable in days; no enterprise architecture, microservices, unnecessary abstractions or speculative platform components. Extend foundations only for concrete user benefit or an already selected next step. If equivalent solutions work, choose the simpler one.

The intended mature shape is strong onboarding/Magic Start, understandable Quick/Deep personalization, good photos/media, coherent dramaturgy, beautiful preview/recipient experience, safe storage/export, mobile/accessibility basics, reliable Offline/Online profiles and a few useful wow moments. “Endstufe” means a small, very good product, not maximal technical complexity or a claim of permanent completion. Hide internal complexity from beginners.

After substantial milestones, briefly evaluate ideas by user value, wow effect, ease of use, effort and maintenance. Classify NOW/NEXT/LATER/EXPERIMENT/REJECTED; experiments do not automatically become core architecture. Reject or defer proposals that enlarge the app without proportionate birthday value.

## Recipient benchmark and result-first correction (current contract)

The user-provided Original Experience Benchmark benchmark defines a level of experience, not a design to copy: seven staged stations, time-aware greeting/live clock, personal decisions/cards, delayed personal message, pacing/surprise, champagne/ivory premium surfaces and gold light, persistent restrained particles, start/transition confetti, a hidden last reveal and roughly 13.5-second cinematic recipient-focused finale, fully offline. BES must generalize that emotional staging across relationships. A plain scrolling letter with styled cards fails this target. The current first-preview implementation does not meet the qualitative benchmark yet; implementation/testing and user-perceived acceptance must be distinguished.

Show value before asking for effort. The fastest creation path should take only name, relationship, a compact vibe choice, optional short public input/prompt selection and optional photo before immediately showing a strong staged preview. Defaults must be safe, useful and free of invented personal facts. Quick means 3–5 lightweight interactions, not a compulsory 6–10-question intake. Deep and detailed manual editing follow first value, as optional contextual refinement. Do not merely hide the same long mandatory form. No pressure for sensitive details. Aim for a respectable first gift in 1–2 minutes with a few reusable excellent scenes, coordinated motion and a real payoff.

## Preview-first / confirm-or-change

Every small input should quickly create visible value. Show the actual staged opening after name/relationship/vibe, then “Gefällt mir”, “Anders machen”, “Überrasch mich”. Ask one optional high-value detail, immediately show its result, optionally add a photo, then show the whole gift and targeted refinements. Aim for roughly 5–7 major creator moments, not a questionnaire wall or mandatory desktop split pane. Keep strong safe defaults, fast alternatives with undo, mobile-first review and optional Deep after value. Do not hide an unchanged mandatory long form behind accordions. The current bounded alternative cycles coherent directions while preserving public content; broader alternative story arcs remain a goal.

Real iPhone Safari creation, recipient taps and an understandable supported delivery path are release requirements. Desktop Chromium/WebKit do not establish physical-device or Files-app support. See IOS_COMPATIBILITY and STATUS for evidence and the open release gate.
