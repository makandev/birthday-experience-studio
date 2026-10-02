# Architecture

Status: initial architecture contract; implementation may refine it through documented decisions.

## Layers
1. **Domain** — versioned CreatorProject and recipient/relationship/writing/experience models.
2. **Registries** — relationship definitions, question packs, blocks, themes, writing helpers, exporters.
3. **Engines** — adaptive question evaluation, composition/recommendation, preview projection, export sanitization.
4. **Studio UI** — beginner-first authoring workflow.
5. **Experience Runtime** — minimal recipient-facing runtime.
6. **Persistence** — local drafts, restore, migrations.
7. **Export** — projects sanitized into recipient-safe portable artifacts.

Dependencies should point toward stable domain contracts rather than UI components.

## Extension model
Prefer typed registrations over central switch statements. Extensions need stable IDs and versions where relevant.

## Privacy boundary
CreatorProject is never serialized directly into an exported Experience. Export uses an explicit projection/allowlist into an ExportExperience model.

## Offline requirement
Core creation and exported gifts must not require network access. External-AI help is a manual copy/paste workflow in early versions.

## Engineering
Use TypeScript, tests, linting/formatting and accessible semantic HTML. Framework selection should be made by the implementing agent and recorded as an ADR after comparing build complexity, long-term maintenance, bundle/export requirements and beginner-facing performance.
