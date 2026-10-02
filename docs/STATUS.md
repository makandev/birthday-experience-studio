# Entwicklungsstand 0.2 – Foundations

Früher Architekturbeweis, kein fertiges Birthday Experience Studio.

## Nachweisbarer Pfad

Start → Person/Beziehung → adaptive Fragen mit Hilfe/Skip → eigener oder bewusst übernommener Brief → sandboxed Empfänger-Vorschau → einzelne HTML-Datei mit optionalem aufklappbarem Geschenk.

Keine Accounts, KI-API, Telemetrie oder automatischen Übertragungen. Nur bewusste Geschenktexte gelangen über Bausteine in die Empfängerdatei.

## Offene Fragen und technische Schulden

- DOM-Event-Bindung in der Studio-UI ist bewusst zentral; vor komplexeren Editoren UI-Komponentenstruktur/Framework neu bewerten.
- Beziehungsdimensionen sind als Daten vorbereitet; nicht jede Dimension beeinflusst bereits Empfehlung oder Fragen.
- Medien haben nur eine Metadaten-Schnittstelle. Upload, Größengrenzen, Bildaufbereitung, Einbettung und IndexedDB fehlen.
- Ein aktiver Entwurf und bis zu acht inaktive Geschenke; geprüfter Entwurfsimport/-export und Sammlung sind vorhanden. Browserdaten sind kein garantiertes Backup.
- Schema v2 migriert historische v1-Entwürfe mit einem geprüften Fixture. Weitere Schemawechsel brauchen neue Migrationen und historische Fixtures.
- Die Browserdaten sind unverschlüsselt. Der Export ist frei teilbar und ebenfalls unverschlüsselt; aufklappbare Überraschungen sind kein Geheimnisschutz.
- Text aus Antworten wird nach ausdrücklicher Übernahme sichtbar. Eine technische Allowlist erkennt keine privaten Inhalte im selbst verfassten Brief.
- Unbekannte Erweiterungen werden beim Export nicht still verworfen. Ein Upgrade-/Recovery-Editor ist noch nicht vorhanden.
- Fünf Grundbausteine und deklarative Directions steuern Theme, Typografie, Reihenfolge, Pacing und Motion. Vollständige viewportgesteuerte Dramaturgie und Längensteuerung bleiben offen.
- Kein Service Worker; Studio-Neuladen offline ist nicht zugesichert. Die exportierte HTML-Datei ist eigenständig.
- Grundlegende WCAG-Prüfungen sind automatisiert; echte Screenreader-, Browser- und Anfänger-Tests stehen aus.
- Browserautomatisierung nutzt in dieser Cloud `/usr/bin/chromium`: Browserdownload ist gesperrt, `file://` ist durch Browserrichtlinie blockiert. Der heruntergeladene Dateiinhalt wird im Offline-Browser vollständig geprüft; direktes Dateiöffnen muss auf einem normalen Gerät ergänzt werden.
- Render-/Schema-Verträge werden bei Erweiterungen gemeinsam versioniert. Ein öffentliches Drittanbieter-Plugin-System existiert nicht.

## Empfohlene nächste fünf Schritte

1. Mit unerfahrenen Menschen den gesamten Ablauf testen; Screenreader, Tastatur, Fehlermeldungen und Verständnis der Privacy-Grenze prüfen.
2. Entwurfsexport/-import, mehrere Projekte und Wiederherstellung ergänzen; historische Fixtures und echte Migrationen einführen.
3. Frage-Packs und Empfehlungen anhand der Beziehungssignale vertiefen, UI-Komponenten vor komplexeren Editoren trennen.
4. Foto-Baustein mit begrenztem lokalem Medienimport, Größenbudget, IndexedDB und portabler Einbettung bauen.
5. Export/Offline-Nutzung in Firefox, Safari und auf Mobilgeräten prüfen; deutsche Texte für spätere Übersetzungen in einen Katalog auslagern.

## Neue abgeschlossene Grundlage

Die geprüfte 0.1-Implementierung wurde als Commit `1fc0cec` auf GitHub-Branch `codex/bes-foundations` gesichert. `main` bleibt bis zur Integration auf seinem ursprünglichen Dokumentationsstand. Neue Änderungen werden in kohärenten Milestones auf demselben Branch gesichert.

Entwurfsimport/-export, bewusste Importbestätigung, sichere Sammlung ohne stilles Verdrängen, v1→v2-Migration, JSON-Budgets und Bedrohungsmodell sind implementiert. Motion/Profile und Medienverträge sind in v2 vorbereitet; deren Laufzeit folgt in den nächsten Milestones.

## Koordinierte Motion und manuelle Regie

Directions, Intensität 0–3, endliche CSS-Effekte, mobile Budgets, reduced-motion und Empfänger-Abschaltung sind implementiert. Exportprofile und Abhängigkeitsprüfung sind aktiv. Der provider-neutrale Regie-Dialog prüft manuelle JSON-Vorschläge; API-Provider, Schlüsselverwaltung und automatisch installierte Follow-up-Fragen sind ausdrücklich noch nicht vorhanden. Fotoquellen werden im folgenden Milestone angeschlossen.
