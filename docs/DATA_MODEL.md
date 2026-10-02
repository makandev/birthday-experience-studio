# Data Model

All persisted projects require `schemaVersion`. Stable IDs must not depend on display labels.

Conceptual root:

```ts
interface CreatorProject {
  schemaVersion: number;
  id: string;
  createdAt: string;
  updatedAt: string;
  mode: 'quick' | 'deep';
  recipient: Recipient;
  relationship: RelationshipProfile;
  answers: AnswerStore;
  memories: MemoryItem[];
  writing: WritingWorkspace;
  media: MediaLibrary;
  experience: ExperienceDraft;
  exportConfig: ExportConfig;
}
```

Separate concepts: Recipient, RelationshipProfile, AnswerStore, MemoryItem, WritingWorkspace, MediaLibrary, ExperienceDraft, ExperienceBlockInstance, ThemeSelection and ExportConfig.

## Recipient-safe projection

Define a separate `ExportExperience`. Never implement export as `JSON.stringify(project)` or equivalent. Only explicitly recipient-visible fields may cross the export boundary.

## Evolution

Persisted schema versions require migrations. Unknown extension IDs should degrade gracefully where possible rather than corrupting a project.

## Implementierter v1-Vertrag

Autoritative Laufzeitvalidierung und TypeScript-Typen: `src/domain/project.ts`.

- `recipient`: Name; `relationship`: stabile Typ-ID, Unsicherheit und Nähe/Formalität/Vertrauen/Humor/Emotionalität/Dauer/Kontext/Ton.
- `answers`: Frage-ID → Status `answered | skipped | unknown` und Text. Inaktive Antworten bleiben privat gespeichert und werden bei KI-Prompts herausgefiltert.
- `writing`: Methode, expliziter Brief, Wunsch und Überraschung.
- `experience`: Theme-ID und geordnete Instanzen mit stabiler ID, Typ-ID, Version, Aktivierung und Textfeldern.
- `memories` und `media`: getrennte, vorbereitete Datenverträge; aktuell keine eigene Erinnerungsverwaltung und nur Medienmetadaten.
- `exportConfig`: Exporter-ID und Sprache; `workflow`: Studio-Schritt und aktuelle Frage für Restore.

Migrationen werden nach Quellversion registriert und sequenziell angewendet, anschließend wird das Ergebnis validiert. Für v1 gibt es keine ältere Datenversion. Fehlende, zukünftige oder fehlerhafte Versionen werden nicht überschrieben. Ein Schemawechsel muss Migration, Fixture-Tests und Dokumentation mitbringen.

`ExportExperience` enthält ausschließlich Version, Sprache, aufgelöste Theme-ID und aktive Bausteine mit erlaubten Feldern; keine Creator-ID, Zeitstempel, Antworten, Beziehung, Schreibmethode oder Medienmetadaten.

## Schema v2

V2 ergänzt explizite Exportprofile und Zustimmung für externe Medien, Richtung/Intensität sowie diskriminierte Medienquellen `local | external | unavailable`. V1 wird vor Migration gegen seinen historischen Vertrag geprüft; Antworten, Texte und Reihenfolge bleiben erhalten. Historische Projekte erhalten Intensität 0 und Offline-Profil. Die neuen Felder werden in folgenden Milestones aktiviert.
