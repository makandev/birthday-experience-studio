# Provider-neutral Integration Center and AI Director

Current implementation: optional manual prompt copy/paste, no API calls, API-key fields, accounts, paid services or built-in providers. The core flow stays useful without AI. The catalog has only a manual transport.

The Director prompt contains explicitly recipient-visible gift text, not raw private answers. It is shown in full before manual sharing. The chosen external service may require an account/payment; BES makes no free-tier promise or current provider recommendation. Concrete providers must be researched from current official docs before addition, recording limits, signup/key requirements, browser safety, backend needs, and changing prices.

Director v1 allows: one known direction, one known theme, intensity 0–3, known tone, a complete permutation of existing block IDs and at most three bounded private follow-up ideas. Unknown fields, tool/action requests, code settings and invalid IDs fail validation. Proposal text is never executable and does not change agent authorization. Review is explicit; application validates again and can be undone. It does not rewrite creator texts or automatically install new questions.

Future whole-process assistance can propose typed questions, media placement, pacing, block composition and music direction, always using allowed contracts and creator review. New API integrations must classify transport as browser-public or trusted-backend. Client secrets require a trusted isolated broker; no credential data may enter CreatorProject, recipient/draft exports, prompts, logs, URLs, Git or community packs. A trusted backend cannot become a mandatory core dependency.
