# Adaptive Question Engine

Questions are data/configuration, not page-specific conditionals.

Each question should support stable ID, prompt, help/examples, answer type, optional validation, tags, visibility/branching rules and optional effects/signals for later composition.

Required UX paths include:
- answer normally
- skip where safe
- “I don't know”
- “help me”
- examples/context

Relationship packs may contribute questions without owning the engine. Quick Mode selects a compact path; Deep Personalization may expand dynamically and must not rely on a hard architectural question limit.

The engine must be deterministic for the same project state and testable without rendering the UI.
