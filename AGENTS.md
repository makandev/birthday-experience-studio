# AGENTS.md — Birthday Experience Studio

## Mission

Build BES as a continuously evolving, modular product. Never optimize only for the current demo at the expense of future extensibility.

## Non-negotiable rules

1. Treat all 0.x releases as evolving development states, never as the final product.
2. Keep Studio/Creator code and generated recipient Experience conceptually and technically separated.
3. Never export private creator answers unless explicitly mapped to recipient-visible content.
4. Preserve local-first operation. No telemetry, analytics or hidden network requests.
5. Do not add an AI dependency. External-AI assistance is prompt generation + copy/paste for now.
6. Avoid hard-coded relationship/question/theme logic in UI components. Prefer registries/configuration and typed schemas.
7. Every persisted project has a schema version. Breaking data changes require a migration strategy.
8. Experience blocks must have stable contracts and be independently extensible.
9. Single-file HTML is an exporter target, not an excuse for monolithic source code.
10. Accessibility and beginner UX are requirements, not cleanup work.
11. Avoid unnecessary dependencies and premature enterprise complexity.
12. Record significant architectural decisions and keep docs synchronized with implementation.

## Before a substantial change

Check whether it harms: relationship extensibility, adaptive questions, block extensibility, themes, future optional AI providers, offline export, privacy boundaries, backwards compatibility, accessibility, or agent comprehensibility.

## Agent workflow

Before coding, read README and relevant docs. For meaningful changes: state assumptions, implement the smallest coherent vertical improvement, add/update tests, update affected docs, record important decisions, and report risks/debt/open questions.

Do not claim the product is finished. Leave the repository easier for the next agent to understand.
