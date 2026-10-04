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

Emotional, Fröhlich, Elegant und Filmisch koordinieren Darstellung und Reihenfolge. Ein eigener Finale-Baustein ergänzt die kleine Grundkomposition. Manuelle Theme-/Blockänderungen bleiben möglich; Textsynchronisierung erhält Reihenfolge und Aktivierung. Bewegungsintensität 0–3, mobile Budgets und reduzierte Bewegung gelten auch für den Empfängerexport. Gestufte Stationen ersetzen die Scroll-Komposition als primäres Empfängererlebnis; die feste Folge bleibt im Champion, variable Challenger-Arcs sind unten dokumentiert; die Eröffnung startet beim Laden, weitere Stationen nur auf bewusste Navigation.

## Fotomoment

Ein expliziter Foto-Baustein verbindet Bild mit eigenem Alt-Text und Erinnerungstext. Contain/Cover und Mitte/Oben/Unten sind nichtdestruktive Anzeigeoptionen. Direction wählt weiche, Polaroid- oder breite Präsentation. Neue Fotos werden neben bestehenden Fotomomenten beziehungsweise nach der Begrüßung eingeordnet, ohne vorhandene Bausteine umzubauen. Weitergehende Galerie-/Timeline-/Fullscreen-Varianten bleiben Folgearbeit.

## Historical fixed Champion (ADR 0006)

`engines/scenes.ts` groups selected known content exactly once: opening/intro, curiosity, choice, photo/moment, delayed letter, wish/surprise, cinematic finale, closing/finale block. Creator ordering remains within its semantic station; disabling content is respected. Safe non-factual birthday copy fills empty beats without inventing memories or intimate relationship facts. Existing blocks/schemas remain unchanged. No generic scene editor or new large block taxonomy.

The maintained runtime owns local greeting/clock, three recipient choices, focus/progress/back, native late letter reveal, a deliberately delayed final reveal, three-phase 13.5-second gold finale, skip and replay. Gentle particles/light support the premium story; finite confetti marks transitions/finale. Reduced motion/intensity 0/pause remove waiting/effects; no-JS output is readable. The optional Safari reader regenerates this same experience from public data.

Magic Start now shows this opening from name/defaults, then optional public detail/photo and whole gift. Confirm/change/undo are first-class; “Überrasch mich” currently cycles coordinated direction variants without replacing public text/photos. It does not yet create substantially different story arcs. The Original Experience Benchmark description is a qualitative acceptance benchmark, not a claim that automated tests prove equal emotional quality; original artifact comparison/novice review remains open.

## Variable scene composition (ADR 0008)

The complete North Star and rebuild masterplan are authoritative. The old fixed flow remains Champion when no composition setting exists. Challenger uses Emotional Memory, Playful Celebration and Cinematic/Luxury with two maintained coherent arcs. Enabled public letter/wish/reveal/photos decide which content beats exist; the moment is a photo exhibit if photos exist, otherwise a non-factual curiosity reveal. Sparse custom compositions omit empty content and pointless choice. A respectful derived register suppresses fake ending/fireworks; pace changes the playful phase duration. Public core-message quoting and already-projected photo reuse support an emotional peak without duplicating originals or reading private answers.

Choice buttons offer only available upcoming roles; choosing moves that actual scene next and leaves all other selected content intact. Back and replay use the resulting route; replay restores the original route/reveals/photo/choice. Photo decks show one selected copy with deliberate controls, fitting soft/polaroid/widescreen presentation. Native details retain the readable no-JS path. Multi-phase finales differ: emotional keepsake/photo, celebratory fireworks, cinematic light/contrast. Fireworks are finite 3.2-second deterministic radial bursts, bounded to 72 mobile/144 desktop particles scaled by intensity; no audio, strobing or network. Duration/skip/pause/reduced motion take precedence over effects.

The internal portrait/encore arc IDs select recipes; they do not promise an encore scene in every variant. Surprise Me alternates these recipes without changing theme or replacing public ingredients. The explicit comparison chooser is not tracking or a winning algorithm. See EXPERIENCE_ACCEPTANCE for the first actual synthetic comparison and unresolved qualitative/device limits.

## Revision spaces — current implementation

Moment Atelier uses paper opening, photographic space, a quiet unfolded letter and an explicit keepsake. Surprise Box uses colored selectable compartments and a joined birthday banner/finite celebration. Light Premiere uses directed light, a quiet letter and a connected focus/climax. All three use validated AI scene order plus independently programmed isolated drawing; plan is more than a palette. Early choice opens the selected content immediately, opens the letter when deliberately selected, reorders only upcoming roles and preserves selected public text/photo in finale and closing. Back/replay remain deterministic. No missing-photo option or fictitious memory; sparse plans can be shorter.

Reading stops drawing; opening/choice have finite budgets, finale stops at completion, stale replies cannot repaint stopped work. Revised final phases are shorter (gentle/bright Atelier 1.1/0.8 s, Box 1.4/0.9 s, Premiere 1.8/1.2 s per phase). Reduced motion and immediate finale show the final keepsake directly, without overlaying three messages. Explicit creator demo examples are fictional, not proof of actual AI inference or qualitative benchmark superiority. See ADR 0010.
