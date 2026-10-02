# ADR 0002 – Safe draft transfer and schema v2

Status: accepted for the evolving 0.2 foundations.

The 0.1 baseline is preserved in Git before evolution. We keep its module boundaries and introduce a real v1 → v2 migration: validate the historical input first, preserve creator content and ordering, then add explicit Offline/Online profile and coordinated direction/intensity defaults. Historical projects default to zero effects so upgrading does not silently change their motion. Media declarations receive an unavailable source until real asset processing exists; migration never fabricates photo bytes.

Draft import/export is separate from recipient export. Creator JSON includes private answers and is labelled accordingly. Byte/depth/node/collection budgets, reserved-key rejection and schema validation precede confirmation. Unknown root fields are rejected, not treated as executable extensions. Import creates a fresh project identity and retains the prior gift. A small local library retains up to eight inactive projects without silent eviction; this is useful for text projects without replacing working localStorage foundations. Rollback is attempted if storage writes fail. Multiple-tab transactions remain future work; media binaries must use IndexedDB, not this library.

Schema v2 reserves media-source and direction/profile contracts for the following milestones, but does not claim those features work until implemented. Future hosted sharing remains optional. Community additions are safe declarative birthday content; built-in renderers remain maintained code, not a downloadable execution platform.
