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

## Implementierter Stand

`registries/questions.ts` definiert versionierte Packs und Regeln für Modus, Antwort, Kontext und Unsicherheit. `engines/questions.ts` liefert die deterministische aktive Reihenfolge und den Fortschritt. Quick hat je nach Verzweigungen etwa 6–10 Fragen, Deep ergänzt weitere. Neue Packs haben keine feste Fragenobergrenze. Hilfe/Beispiele und Skip/Unknown sind im Studio vorhanden.

Änderungen an früheren Antworten berechnen den aktiven Pfad neu. Verborgene Folgeantworten bleiben im lokalen Entwurf; sie tauchen nicht mehr in der freiwilligen KI-Anweisung auf. Antworten gelangen nie automatisch in den Geschenkexport.
