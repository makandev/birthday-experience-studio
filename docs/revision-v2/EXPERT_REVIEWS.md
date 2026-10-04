# Unabhängige Fachreviews — Herkunft und Entscheidungen

Diese Reviews wurden auf ausdrücklichen Wunsch nach Fachkritik durch drei voneinander unabhängig arbeitende **KI-Reviewer** erstellt. Es wurden keine menschlichen Experten kontaktiert oder bezahlt. Die Rollen sind Produkt/UX, Motion/Art Direction und Frontend/Security. Alle Prüfungen waren read-only; keine Reviewer haben App-Dateien, Branches oder private Anhänge verändert. Die Aussagen sind Hypothesen aus Quellcode-/Dokumentenprüfung, keine empirische Nutzerstudie.

## Produkt / Consumer UX

Befund: BES delegiert kreative Entscheidungen zurück. Vorschau mit mehreren ähnlich klingenden Aktionen, gemeinsamer Anbieter-/Gestaltungsdialog, nachgelagerte kleine Entwurfsprobe. Der Auftrag „BES inszeniert“ passt nicht zur nötigen Auswahlarbeit.

Empfehlung: vier Momente — Zutaten, ganze Probe, gezielte optionale Änderung, prüfen/mitgeben. Eine vollständige Empfehlung statt ständigem Szenenabnicken. „Etwas ändern“ fragt erst dann, ob Worte, Inszenierung oder Foto gemeint sind. Verbindung und Gestaltung getrennt behandeln; Accountaufwand nicht als zwei Klicks verkaufen. Keine erzwungene Beziehungsschublade, private Angaben freiwillig.

Vorgeschlagene Abnahme: formative Studie mit acht unerfahrenen Personen; sieben schaffen Erzeugung/Review/Export ohne Hilfe, sieben verstehen Datenweitergabe/Dateiinhalt, sechs bevorzugen Revision bei gleicher Datenbasis. Kleine Stichprobe, kein allgemeiner Erfolgsnachweis.

## Art Direction / Interaction / Motion

Befund: die Rollen-Reihenfolge variiert, doch die Darstellung bleibt „Station → Text → Navigation“. `AI_STAGE_CSS` fügt denselben Rahmen hinzu. Die Choice hat bereits eine echte Folge, wird aber nicht ausreichend zum emotionalen Schluss geführt. Einige Beschriftungen verraten den Überraschungstrick vorab. Größere Effekte allein lösen das nicht.

Empfehlung A: warme fotografische Bühne; Geschenkband verbindet Öffnung, Foto, Botschaft, ausgewähltes Schlussmotiv. B: taktile Papiermechanik; geöffnete Fächer setzen sich zum Banner zusammen. C: dunkler durchgehender Raum, Licht als Orientierung und Bedeutung, Brief stoppt Hintergrundbewegung. Ruhepunkte, sinnvolle Konsequenzen, kein permanentes Konfetti. Ohne Foto oder öffentliche persönliche Fakten kürzer werden, keine Erinnerungen erfinden.

Der Review empfahl A, sah B als stärkste verspielte Alternative und C als Risiko leerer Kinopose. Das ist kein belegter Gewinner. Seine vorgeschlagene 8-MB-Exportgrenze wird **nicht** übernommen: die vorhandenen 6 MiB bleiben maßgeblich.

## Engineering / Reliability / Security

Befund: `app.ts` bündelt auf rund 1.580 Zeilen Zustandskoordination, Dialoge, Provider, Generation, Media, Preview und Export. Der aktuelle KI-Vertrag steuert Zeichenlogik, kaum Szenen-/Layout-/Dramaturgieentscheidungen. First-frame-only Probe beweist keine späteren Zweige. Verschachtelte Frames/Dialoge sind mobile Reibung. Lokale Inferenz auf iPhone/Pages ist keine verlässlich verfügbare Standardroute.

Empfehlung: bestehenden Storage-/Media-/Export-/Security-Kern behalten. Neuer Creator mit Generation Coordinator, bounded ExperiencePlan, eigenem Recipient Renderer und bestehender Worker-Grenze. Erster echter Prototyp flüchtig, ohne Migration; später bewusste Adoption. Mehrpunkt-/Szenen-/Finalphase-Prüfung, reale Modelle und reale iPhone-Dateizustellung separat. Kein Frameworkwechsel oder Microservice-System.

Stopregeln: Datenverlust, Secret-Leak, Isolationdurchbruch oder paid fallback blockieren. Erfundenes Persönliches, nicht erreichbare Buttons oder eine weitere Kartenfolge verwerfen den Kandidaten. Keine Übernahme ohne sichtbaren Mehrwert.

## Zusammenführung

Alle drei Kritiken stimmen überein: der strukturelle Produktablauf muss sich ändern; nur neue Hintergrundanimation ist zu wenig. Übernommen werden der große Probenmodus, vier Creator-Momente, Handlungen mit Konsequenzen, eine echte Ablaufentscheidung durch KI und der Erhalt bestehender Schutzgrenzen. Nicht übernommen werden größere Budgets, unbewiesene Sieger-/Zeitversprechen oder drei gleichzeitig ausgebaute Produktionssysteme. A wird empfohlen, B bleibt Vergleich, C bleibt begrenzte Konzeptstudie. Die Nutzerbewertung entscheidet den nächsten Schritt.
