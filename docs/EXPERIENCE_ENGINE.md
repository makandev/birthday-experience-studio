# Experience Engine

A generated gift is an ordered composition of reusable Experience Blocks.

Initial candidate block types include intro, greeting, memory, appreciation, story, photo, timeline, humor, insider, letter, birthday wish, future wish, surprise reveal, hidden message, interactive choice, gallery and finale.

Each block type should define:

- stable type ID
- version
- typed recipient-visible data
- editor metadata
- renderer/runtime contract
- capability requirements where relevant

Composition may recommend blocks/order/intensity based on creator signals, but the creator retains control.

Themes style blocks without owning their semantic content.

## Implementierter Stand

Die Block-Registry definiert `intro`, `letter`, `wish`, `reveal`, jeweils v1 mit erlaubten Textfeldern und Empfänger-Renderer. Native `details` liefert die erste Interaktion ohne Scripts. Komposition empfiehlt die Grundstruktur nach vorhandenen Geschenktexten; Aktivierung und Reihenfolge bleiben unter Kontrolle des Creators. Inhaltsänderungen aktualisieren bekannte Instanzen, ohne Reihenfolge/Aktivierung zu überschreiben.

Themes Warm/Klar/Festlich sind separate Registrierungen mit Farb-/Typografietokens. Unbekannte Theme-IDs verwenden Warm. Weitergehende Beziehungssignale, Medien und viele Blockarten bleiben Folgearbeit.

## Richtungen und Abschluss

Emotional, Fröhlich, Elegant und Filmisch koordinieren Darstellung und Reihenfolge. Ein eigener Finale-Baustein ergänzt die kleine Grundkomposition. Manuelle Theme-/Blockänderungen bleiben möglich; Textsynchronisierung erhält Reihenfolge und Aktivierung. Bewegungsintensität 0–3, mobile Budgets und reduzierte Bewegung gelten auch für den Empfängerexport. Die erste Choreografie startet beim Laden; eine vollständige viewportgesteuerte Dramaturgie bleibt Folgearbeit.
