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

Die Block-Registry definiert `intro`, `letter`, `wish`, `reveal`, `finale` und `photo`, jeweils v1 mit erlaubten Textfeldern und Empfänger-Renderer. Native `details` bleibt die bewusste Brief-/Karten-Enthüllung; der gepflegte statische Runtime-Code ergänzt gestufte Navigation und Interaktion. Komposition empfiehlt die Grundstruktur nach vorhandenen Geschenktexten; Aktivierung und Reihenfolge bleiben unter Kontrolle des Creators. Inhaltsänderungen aktualisieren bekannte Instanzen, ohne Reihenfolge/Aktivierung zu überschreiben.

Themes Warm/Klar/Festlich sind separate Registrierungen mit Farb-/Typografietokens. Unbekannte Theme-IDs verwenden Warm. Weitergehende Beziehungssignale und ausgewählte zusätzliche Blockarten bleiben Folgearbeit; lokale Fotomomente sind implementiert.

## Richtungen und Abschluss

Emotional, Fröhlich, Elegant und Filmisch koordinieren Darstellung und Reihenfolge. Ein eigener Finale-Baustein ergänzt die kleine Grundkomposition. Manuelle Theme-/Blockänderungen bleiben möglich; Textsynchronisierung erhält Reihenfolge und Aktivierung. Bewegungsintensität 0–3, mobile Budgets und reduzierte Bewegung gelten auch für den Empfängerexport. Sieben Stationen plus Abschluss ersetzen die Scroll-Komposition als primäres Empfängererlebnis; die Eröffnung startet beim Laden, weitere Stationen nur auf bewusste Navigation.

## Fotomoment

Ein expliziter Foto-Baustein verbindet Bild mit eigenem Alt-Text und Erinnerungstext. Contain/Cover und Mitte/Oben/Unten sind nichtdestruktive Anzeigeoptionen. Direction wählt weiche, Polaroid- oder breite Präsentation. Neue Fotos werden neben bestehenden Fotomomenten beziehungsweise nach der Begrüßung eingeordnet, ohne vorhandene Bausteine umzubauen. Weitergehende Galerie-/Timeline-/Fullscreen-Varianten bleiben Folgearbeit.

## Staged composition (ADR 0006)

`engines/scenes.ts` groups selected known content exactly once: opening/intro, curiosity, choice, photo/moment, delayed letter, wish/surprise, cinematic finale, closing/finale block. Creator ordering remains within its semantic station; disabling content is respected. Safe non-factual birthday copy fills empty beats without inventing memories or intimate relationship facts. Existing blocks/schemas remain unchanged. No generic scene editor or new large block taxonomy.

The maintained runtime owns local greeting/clock, three recipient choices, focus/progress/back, native late letter reveal, a deliberately delayed final reveal, three-phase 13.5-second gold finale, skip and replay. Gentle particles/light support the premium story; finite confetti marks transitions/finale. Reduced motion/intensity 0/pause remove waiting/effects; no-JS output is readable. The optional Safari reader regenerates this same experience from public data.

Magic Start now shows this opening from name/defaults, then optional public detail/photo and whole gift. Confirm/change/undo are first-class; “Überrasch mich” currently cycles coordinated direction variants without replacing public text/photos. It does not yet create substantially different story arcs. The Original Experience Benchmark description is a qualitative acceptance benchmark, not a claim that automated tests prove equal emotional quality; original artifact comparison/novice review remains open.
