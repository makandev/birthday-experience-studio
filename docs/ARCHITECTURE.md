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

## Implementierter Stand 0.1

Die oben beschriebenen Grenzen sind in `src/` umgesetzt: `domain/`, `registries/`, `engines/`, `studio/`, `experience/`, `persistence/`, `export/`. Der Stack ist TypeScript + Vite, vorerst ohne UI-Framework; siehe [ADR 0001](adr/0001-typescript-local-first-vertical-slice.md).

Die Fach-Engines sind unabhängig vom Browser. Zod validiert das v1-Projekt an Restore-/Exportgrenzen. Die kleine Studio-UI verwaltet Schritte und Eingaben; Eingaben speichern sofort lokal, Schrittwechsel rendern die Oberfläche neu. Vorschau und Export teilen den Empfänger-Renderer, die Vorschau wird mit leerer iframe-Sandbox isoliert. Empfänger-Interaktion nutzt natives `details`, kein Studio-Bundle.

## Sichere Entwurfsverwaltung

Schema v2 und reale v1-Migration ergänzen die bestehenden Grenzen. `security/json.ts` prüft JSON-Budgets und reservierte Keys; `persistence/drafts.ts` trennt Creator-Sicherung vom Empfängerexport. `persistence/library.ts` behält bis zu acht inaktive Projekte und versucht bei fehlgeschlagenen Speicherwechseln einen Rollback. Keine automatische Löschung, keine Garantie für Mehrtab-Transaktionen.

## Koordinierte Experience und optionale Regie

Deklarative Directions verbinden Theme, Typografie, Reihenfolge, Medienstil, Pacing und endliche Effekte. Preview/Export teilen denselben scriptfreien Renderer. `integrations/` bietet bisher ausschließlich manuelle Vorschläge; strikte Vorschlagsschemas prüfen Daten vor Bestätigung und Anwendung. Siehe MOTION.md, INTEGRATIONS.md und ADR 0003.
