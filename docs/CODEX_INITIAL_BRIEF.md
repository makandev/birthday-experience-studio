# Codex Initial Build Brief

Read `README.md`, `AGENTS.md` and all documents under `docs/` before implementation.

## Goal

Build the first architecture-proving vertical slice of Birthday Experience Studio. This is an early 0.x development state, not a final version.

## First pass

1. Inspect the repository and challenge/document weak assumptions.
2. Select a suitable technical stack and record the decision as an ADR.
3. Refine the versioned domain model and extension contracts.
4. Establish project structure, linting, formatting and tests.
5. Implement a minimal Studio shell.
6. Implement a deterministic adaptive Question Engine with data-driven relationship definitions.
7. Implement a basic writing workspace including an external-AI prompt generator/copy workflow; do not integrate an AI API.
8. Implement a small Experience Block registry and Preview.
9. Implement local draft persistence.
10. Implement recipient-safe single-file offline HTML export.
11. Add automated tests, especially an export privacy-leakage test.
12. Update documentation to match reality.

## Vertical acceptance path

Start → choose/create recipient + relationship → answer several adaptive questions → create/edit text → preview a small personalized experience → export a standalone HTML → open it offline.

## Do not

- hard-code the product around one specific recipient or existing gift
- build a monolithic source HTML
- integrate cloud AI
- export raw CreatorProject data
- create dozens of themes/templates before the architecture works
- declare the project finished

## Completion report

Report architecture decisions, files changed, tests/results, risks, technical debt, open questions, and the recommended next five development steps.
