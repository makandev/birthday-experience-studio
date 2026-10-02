# UX Principles

Primary audience includes complete internet/computer beginners.

- Plain language over technical terminology.
- One obvious primary action per step.
- Progressive disclosure: simple first, depth on demand.
- Quick Mode and Deep Personalization share the same underlying model.
- Always offer safe Back/navigation and autosave.
- Explain consequences before destructive actions.
- “I don't know”, help and examples are first-class paths.
- Preview should answer: “What will the birthday person actually see?”
- External-AI workflow must be understandable without knowing what a prompt or API is.
- Keyboard access, semantic markup, visible focus, contrast and reduced-motion support from the start.

## Erste Umsetzung

Fünf Schritte mit Rücknavigation, große primäre Aktionen, sichtbarer Speicherstatus und Fortschritt, Hilfe/Beispiele, Skip/Unknown, optional aufgeklappte Beziehungsdimensionen, bewusste Vorschlagsübernahme und bestätigter Neustart mit Rückgängig. Semantische Formulare, Labels, sichtbare Fokuszustände, Fokus auf die neue Schrittüberschrift, reduzierte Bewegung und responsive Breiten sind Teil der Shell. Automatisierte axe-Prüfungen begleiten den Browserpfad; manuelle Screenreader-/Anfängertests bleiben erforderlich.

## Sicherung und Wiederaufnahme

„Meine Geschenke & Sicherung“ bündelt Creator-Backup, geprüften Import und die lokale Sammlung mit einfachen Aktionen. Import zeigt zuerst eine Zusammenfassung; Änderungen folgen erst nach Bestätigung. Dialoge haben benannte Überschriften, Schrittzahlen sind für Screenreader dekorativ.

## Bewegung und Regie

Eine verständliche Stimmungswahl koordiniert Effekte; Bewegung kann auf 0 gestellt werden und der Empfänger kann sie abschalten. Geräteeinstellungen für reduzierte Bewegung haben Vorrang. Regie-Vorschläge werden geprüft, als konkrete Änderungen beschrieben und erst dann übernommen; Rückgängig ist verfügbar. Fokus wird beim Neurendern von Auswahlfeldern erhalten.

## Fotos ohne Datenverlust

Dateiauswahl und Drag/Drop sind Alternativen. Klar sichtbare Formate/Größenlimits, lokaler Verarbeitungsstatus, Alt-Text, Erinnerungstext und reversible Bildposition helfen Anfängern. Fehlgeschlagene Imports behalten vorhandene Texte. Originale und Geschenk-Kopien sind sprachlich getrennt; entfernte Bilder können wiederhergestellt werden. Online-Zustimmung benennt die Quellen und den Unterschied zu Offline.

## Vorschau schrittweise anpassen

Stimmung, Exportprofil, externe Zustimmung und Geschenk-Erstellung bleiben direkt sichtbar. Bewegung/Farben sowie Inhalt/Reihenfolge öffnen sich bei Bedarf in nativen Details. Geöffnete Bereiche und fokussierte Felder/Bausteine bleiben bei Neurendern erhalten; Foto-Bearbeitung bleibt ebenfalls offen. Diese Zustände sind lokale UI-Zustände und werden nicht exportiert.

## Safe storage choices

Saved status means the asynchronous transaction completed; pending/failed/conflict states are distinct. Conflicts preserve this tab's input and offer private backup before explicit canonical adoption. Deletion and permanent cleanup have separate clear confirmations; cleanup explicitly ends undo. Do not expose revisions/transaction mechanics as normal product steps.

## Magic Start and first preview

„Schnell zur ersten Vorschau“ is the fresh-gift primary action. A named native dialog focuses the name field, explains that the seed sentence is public, and autosaves name/relationship/public text with an in-dialog status. A reviewed submission creates the first gift; Back/escape keeps the authored input. Composition is undoable; existing composed gifts resume safely. Quick/Deep are also available through the traditional path and directly within questions. The preview has clear routes to text/photos and further questions. Mobile actions stack; focus returns to the launcher/new heading and remains on the question mode during changes. No photo or AI is required for the first preview.
