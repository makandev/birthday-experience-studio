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

`registries/questions.ts` definiert versionierte Packs und Regeln für Modus, Antwort, Kontext, Unsicherheit und minimale Dimensionswerte. `engines/questions.ts` liefert die deterministische aktive Reihenfolge und den Fortschritt. Core-Pack v3 bietet in Quick genau drei freiwillige Fragen: Stärken, Erinnerung und Ton. Vor der ersten Vorschau ist keine davon erforderlich; Deep ergänzt die früheren Verzweigungen und weitere Tiefe. Neue Packs haben keine feste Fragenobergrenze. Hilfe/Beispiele und Skip/Unknown sind im Studio vorhanden.

Änderungen an früheren Antworten berechnen den aktiven Pfad neu. Verborgene Folgeantworten bleiben im lokalen Entwurf; sie tauchen nicht mehr in der freiwilligen KI-Anweisung auf. Antworten gelangen nie automatisch in den Geschenkexport.

## Tiefere Personalisierung (Core-Pack v3; v2-Dimensionen bleiben erhalten)

Deep ergänzt gezielt Alltagsfürsorge ab Nähe 4/5, stille Stärken ab Vertrauen 4/5 und Emotionalität 3/5 sowie gemeinsame Entwicklung ab fünf Jahren. Regeln werden gemeinsam erfüllt (AND); Quick behält seinen kompakten Pfad. Beispiele, Hilfe, Skip und „Ich weiß es nicht“ gelten auch hier. Verborgene Antworten bleiben privat erhalten und fallen aus aktiven Text-/Prompt-Kontexten heraus. Es gibt keine harte Fragenanzahl im Engine-Ablauf; Daten-/Importbudgets bleiben Sicherheitsgrenzen. Die neuen Antworten werden nicht automatisch in Geschenktext übernommen.

After Magic Start, creators may enter the same question engine from preview. A question-page Quick/Deep selector changes the active path without deleting hidden answers, public gift text or photos. Answers remain private until a consciously reviewed writing proposal is accepted; switching to Deep does not automatically rewrite the first gift.
