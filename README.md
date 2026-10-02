# Birthday Experience Studio

**Früher Entwicklungsstand 0.2 – Architekturbeweis, kein fertiges Produkt.**

BES hilft auch Menschen ohne Programmierkenntnisse, persönliche Geburtstagsgeschenke zu gestalten: Person → adaptive Fragen → eigene Worte → Empfänger-Vorschau → portable Offline-HTML-Datei.

## Lokal starten

Voraussetzung: Node.js >=22.12 (geprüft mit 24.19.0), npm. Keine Accounts, API-Schlüssel oder Backend-Dienste nötig.

```sh
npm ci
npm run dev
```

Vite zeigt die lokale Entwicklungsadresse an. Für einen Produktionsbuild:

```sh
npm run build
npm run preview
```

Die Studio-Anwendung besteht im Build aus `dist/` mit lokalen Assets. Der **Geschenkexport** ist eine eigene, einzelne HTML-Datei; er enthält weder Studio-Code noch externe Ressourcen.

## Was bereits funktioniert

- Deutschsprachiges, responsives Studio mit fünf Schritten und sicherer Rücknavigation.
- Quick-Modus mit etwa 6–10 aktiven Fragen; Deep-Modus ergänzt weitere Fragen ohne Architektur-Obergrenze.
- Datengetriebene Beziehungstypen, Beziehungsdimensionen und Frage-Packs; Verzweigungen für Humor, beruflichen Kontext und unsichere Beziehungen.
- Hilfe, Beispiele, Überspringen und „Ich weiß es nicht“.
- Selbst schreiben, geführter Textvorschlag mit bewusster Übernahme, optionaler KI-Prompt zum manuellen Kopieren. Keine integrierte KI und keine automatischen Übertragungen.
- Lokales Autosave und Restore inklusive Schritt und laufender Antwort; Warnung bei gesperrtem Speicher; unlesbare Entwürfe werden nicht überschrieben.
- Vorschau in einer isolierten `sandbox`-iframe, drei Themes, auswählbare und verschiebbare Bausteine.
- Begrüßung, Brief, Wunsch und interaktive Überraschung als native aufklappbare Nachricht.
- Empfängersicherer Export über eine explizite Feld-Allowlist, HTML-Escaping und restriktive Content Security Policy.
- Bestätigter Neustart, lokale Sicherung und Rückgängig bis zum Neuladen.

## Datenschutz und Offline-Nutzung

Antworten bleiben privat, solange sie nicht bewusst in Geschenktexte übernommen werden. Lies Vorschläge und fertige Texte vor dem Export: Das Studio kann nicht erkennen, ob du eine private Information selbst in den Brief schreibst.

Daten bleiben im Browser unter `bes.creator-project.v1`. Bei Neustart wird der bisherige Stand unter `bes.creator-project.v1.backup` gesichert; eine weitere Sicherung ersetzt diese einzelne Backup-Kopie. Browserdaten sind nicht verschlüsselt: Andere Personen mit Zugriff auf dein Browserprofil können sie lesen. Löschen von Browserdaten kann Entwürfe entfernen. Im Fehlerfall kann ein unlesbarer Entwurf als JSON gesichert werden; über „Meine Geschenke & Sicherung“ lassen sich geprüfte JSON-Entwürfe importieren und bis zu acht weitere Geschenke behalten. Entwurfsdateien enthalten private Antworten, sind keine Empfängergeschenke und werden vor dem Öffnen bestätigt. Das aktuelle Geschenk bleibt in der Sammlung.

Die KI-Hilfe zeigt vor dem Kopieren die vollständige Anweisung inklusive persönlicher Antworten und Grenzen. Erst dein manuelles Einfügen bei einem externen Dienst gibt diese Daten weiter.

Das heruntergeladene Geschenk funktioniert ohne Internet und Installation in einem modernen Browser. Die Studio-Oberfläche braucht zum ersten Laden einen lokalen oder gehosteten Server. Offline-Neuladen des Studios ist noch nicht zugesichert; es gibt keinen Service Worker. Vites HMR-Verbindung existiert nur im Entwicklungsmodus.

## Prüfungen

```sh
npm run typecheck
npm test
npm run lint
npm run format:check
npm run build
```

Browserprüfungen:

```sh
npx playwright install chromium
npm run test:e2e
```

Falls bereits Chromium verfügbar ist:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e
```

Playwright startet den Entwicklungsserver automatisch auf Port 4173. Tests prüfen den gesamten Ablauf, Restore, Datenschutz, HTML-Injection, Vorschlagsübernahme, sicheren Neustart, Speicherfehler, mobile Breite und grundlegende WCAG-Regeln mit axe. Der Export wird als Download gelesen und sein exakter Inhalt bei deaktiviertem Netzwerk gerendert. Die Cloud-Browserrichtlinie verhindert `file://`-Navigationen; ein direktes Öffnen der Datei über dieses Protokoll ist dort nicht getestet. Die Studio-Oberfläche und die eigenständig gerenderte Geschenkdatei werden getrennt mit axe geprüft, da die Sandbox den Zugriff zwischen beiden Ansichten sperrt. Automatische Accessibility-Prüfungen ersetzen keine Screenreader- und Nutzertests.

## Struktur

```text
src/
  domain/       Versioniertes Modell, Validierung, v1→v2-Migration
  registries/   Beziehungstypen, Frage-Packs, Bausteine, Themes
  engines/      Fragen, Textvorschläge, Komposition
  persistence/  Lokaler Speicher und Restore
  experience/   Eigenständige Empfänger-Renderer und Text-Escaping
  export/       Allowlist-Projektion, Exporter und Dateinamen
  studio/       Studio-Ablauf, Bedienelemente und Styles
  main.ts       Einstiegspunkt
 tests/         Modul- und Browserprüfungen
 docs/          Produktverträge, Architektur, ADRs, Roadmap
```

Siehe [Architektur](docs/ARCHITECTURE.md), [Entscheidungen](docs/DECISIONS.md) und [aktuellen Entwicklungsstand](docs/STATUS.md). Vor Änderungen `AGENTS.md` und relevante Dokumente lesen.

Der Creator-Vertrag ist nun Schema v2. Historische v1-Dateien werden validiert und migriert; unbekannte Versionen bleiben geschützt. Ein Import ist auf 2 MB und begrenzte Tiefe/Sammlungen beschränkt. Siehe [SECURITY.md](SECURITY.md) und [Bedrohungsmodell](docs/THREAT_MODEL.md).

Neu in 0.2: koordinierte Stimmung (Emotional/Fröhlich/Elegant/Filmisch), Bewegungsintensität und Empfänger-Abschaltung, ausdrückliche Offline-/Online-Profile sowie geprüfte manuelle Regie-Ideen. Kein API-Anbieter ist eingebaut. Siehe [Motion](docs/MOTION.md) und [optionale Hilfe](docs/INTEGRATIONS.md).
