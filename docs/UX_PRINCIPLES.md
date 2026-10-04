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

## Preview-first: bestätigen oder ändern

Jede kleine Eingabe soll schnell sichtbaren Wert schaffen. Name mit Beziehungs-/Stimmungsdefaults → echte Eröffnung → „Gefällt mir“, „Anders machen“, „Überrasch mich“ → freiwilliger öffentlicher Satz → dessen tatsächliche späte Geschenkstation → optionales Foto → vollständiges Geschenk. Kein verpflichtender Fragenweg vor dem ersten Ergebnis. Die schnellste erste Vorschau braucht nur Namen und Absenden; Quick sind drei freiwillige Fragen, Deep bleibt kontextuell. Persönliche Fakten werden nicht erfunden oder aus privaten Antworten kopiert. Varianten erhalten Texte/Fotos und lassen sich rückgängig machen.

Die Vorschau zeigt wirkliche Szenen, Bewegung, Stimmung, Tempo und Fortschritt im selben Renderer wie das Geschenk. Sie ist ein einzelner mobiler Arbeitsfluss, kein erforderlicher Desktop-Split-Screen. Detaillierte Texte, Farben, Bewegungsintensität, Bausteine und Online-Quellen bleiben nach dem ersten Ergebnis freiwillig zugänglich. Einstiegsfragen wurden tatsächlich entfernt, nicht nur eingeklappt. Native Abschnitte erhalten Fokus/offene Zustände.

Touch-Ziele mindestens 44px; keine dekorative Klicksperre oder feste überlagernde Leiste, sichere Bildschirmränder, dynamische Dialoghöhen und 16px mobile Eingabeschrift. Der Export erklärt die iOS-Dateivorschau-Grenze und bietet den lokalen Safari-Dateileser. Echte iPhone-Validierung ist ein offenes Release-Gate, siehe IOS_COMPATIBILITY.

## Safe storage choices

Saved status means the asynchronous transaction completed; pending/failed/conflict states are distinct. Conflicts preserve this tab's input and offer private backup before explicit canonical adoption. Deletion and permanent cleanup have separate clear confirmations; cleanup explicitly ends undo. Do not expose revisions/transaction mechanics as normal product steps.

Standalone HTML is the primary gift artifact on every device, including iPhone/iPad. Offline gifts contain all required content/assets/runtime in one file and require no BES page, account, upload or second-file import to play. An optional experimental reader must never replace this contract or count as resolution of broken local iPhone HTML delivery.

## Binding experience direction

Read the complete [Experience North Star](../BES_EXPERIENCE_NORTH_STAR.md) before experience decisions. [Rebuild masterplan](../BES_EXPERIENCE_REBUILD_MASTER_PLAN.md) tracks the bounded current cycle. Technical acceptance and qualitative experience acceptance are separate; private reference contents never enter public artifacts.

## Current AI-native checkpoint — 2026-10-03

Current AI-first creation adds provider connection and generated-result review to the short public-input flow. Do not repeat the historical two-action/1–2-minute claim for first-time provider setup without novice timing evidence. No long questionnaire or mandatory private data; generation is cancellable and cannot discard the draft. Regenerating animation preserves authored copy by default, adoption/undo remain explicit.

## Revision interaction model

One required name; relationship, public sentence and staging are optional. Further tone choices are progressively disclosed rather than competing with three staging options. Users can experience three plainly fictional examples before connecting AI. New plan-based gifts have whole candidate rehearsal and two main actions: large probe or gift download. Changes reveal only words/staging/photos. No required scene-by-scene approval after adopting a revision gift. Native opaque full-screen frames preserve an external accessible exit; stale media reads cannot replace newer rehearsals. Existing detailed/legacy workflows remain for saved gifts, not mandatory first-run effort.
