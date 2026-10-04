# Evidenz und offene Abnahmen

Historischer Vorschlags-Snapshot, vor der anschließenden Implementierungsfreigabe. Videos und Screenshots dieses Ordners zeigen das Konzeptstudio, nicht die ausgelieferte App. Aktuelle Produktionsprüfungen stehen in docs/STATUS.md und docs/EXPERIENCE_ACCEPTANCE.md.

Stand des Vorschlags: 4. Oktober 2026. Vorschlagsbranch `codex/bes-revision-v2-proposal`, Ausgangspunkt `9ce5fcc`. Keine Produktimplementierung oder Übernahme nach main.

## Durchgeführte Arbeit

- Bestehende Repo-Anweisungen, Produkt-/UX-Verträge, Status, Architektur und relevante Implementierung geprüft; Remote-main und Entwicklungsbranch vor Beginn auf denselben Commit verifiziert.
- Drei unabhängige KI-Fachreviews zu Produkt/UX, Motion/Art Direction und Engineering/Security durchgeführt. Keine menschliche Fachberatung behauptet.
- Ein zusammenhängender Revisionsplan, Abnahmebogen, Quellen und drei sichtbar unterschiedliche Designhypothesen dokumentiert.
- Ein rein lokales, klickbares Konzeptstudio gebaut: keine Provider-Verbindung, keine Projekte/Assets speichern, keine alte App ersetzen. Die Creator-Randbereiche demonstrieren die neue Richtung; sie sind noch kein implementierter vollständiger First-run-Prozess.
- Drei Creator-, drei Recipient- und drei Finale-Screenshots sowie drei 45-Sekunden-MP4 und drei 45-Sekunden-GIF erzeugt. Die Bildquelle ist vollständig synthetisch. Videodauer mit FFprobe jeweils 45,000 Sekunden geprüft.

## Technische Prüfungen

- Bestehende Unit-/Modultests: **137 bestanden, 12 Testdateien**.
- TypeScript: bestanden.
- Lint: nach Korrektur fehlender Node-URL-Imports bestanden.
- Formatprüfung: bestanden; ausschließlich neue Vorschlagsdateien formatiert.
- Production Build der bestehenden App: bestanden. Zwei bestehende Zod/Rollup-Annotation-Warnungen ohne Buildfehler.
- Konzept-Walkthrough: Chromium und Linux-WebKit, jeweils **50 Assertions** über drei Richtungen und 390/1400-Pixel-Ansichten. Öffnen, Wahl mit verändertem Schlussbild, Brief/Wunsch, Replay, Zurück, erreichbare Exit-Fläche mindestens 44 Pixel, synthetischer HTML-Injektionsversuch, reduzierte Bewegung und keine HTTP-Anfragen geprüft.
- Das Konzept wurde über Playwright `setContent` geladen. Daraus folgt ausdrücklich keine verifizierte lokale iPhone-Dateiöffnung.
- Kein erneuter vollständiger Produktions-E2E-/Pages-Lauf: Produktquellcode, Konfiguration und Deployment wurden nicht verändert. Die neuen Browserchecks betreffen ausschließlich den Vorschlagsprototyp.

## Qualitative Sichtprüfung

Die erzeugten Recipient- und Creator-Ansichten wurden tatsächlich visuell angesehen. Das ist eine eigene formative Designprüfung, keine externe Nutzerstudie und kein Vergleich mit einer privaten Referenz.

- **A:** Fotobühne und ruhige Typografie sind klarer als die bisherige Kartenfolge. Das Minimalinput-Beispiel bleibt bewusst allgemein; persönliche Wirkung ohne starke Zutaten ist noch nicht belegt. Brief-/Öffnungsmechanik muss im funktionalen Kandidaten stärker räumlich animiert werden.
- **B:** Zwei große Fächer bieten eine andere Handlung und einen anderen Raum. Die verspielte Ausrichtung ist sichtbar, könnte für formelle Beziehungen zu kindlich sein. Die versprochene Laschen-/Bannerchoreografie ist noch nicht vollständig umgesetzt.
- **C:** Durchgängiger dunkler Raum mit Licht funktioniert als Designhypothese. Das Schlussbild ist derzeit zu zurückhaltend für einen großen Kinohöhepunkt. Deshalb Experiment, kein automatischer Champion.
- Die Filme verwenden bewusst geschnittene, fünfteilige Konzeptabläufe. Sie beweisen weder die geplante variable KI-Komposition noch echte vom Modell programmierte Choreografie. Diese Anforderungen bleiben in Phase 1/2.
- Entscheidung: A als erster vollständiger Kandidat empfohlen; B als Challenger behalten; C erst nach sichtbarem Mehrwert weiterbauen. Kein Sieger oder „Benchmark übertroffen“ behauptet.

## Schutz der bestehenden App

Alle hinzugefügten Dateien liegen unter `docs/revision-v2/`. Kein vorhandener Dateipfad wurde überschrieben. Bestehende Speicherung, Export, Credentials, Worker-Grenze und Release-Workflow bleiben unberührt. Keine privaten Referenznamen/-texte/-bilder/-Quellen übernommen. Neue Dateien werden zusätzlich vor dem Push auf bekannte identifizierende Namensvarianten geprüft; diese Prüfung beseitigt keine historischen GitHub-Cache-Kopien.

Der Vorschlag wird nur auf dem neuen Branch gespeichert. Kein main-Merge, kein Pages-Deployment der Revision, keine neue Hosting-/Account-Pflicht. Die bisherige Live-App bleibt unter https://makandev.github.io/birthday-experience-studio/ erreichbar und entspricht weiterhin dem bisherigen Stand.

## Offene Abnahmen vor einer Übernahme

Auswahl/Bewertung durch den Nutzer; ein vollständiger Kandidat mit echten variablen Abläufen; reale lokale/free-only Modellgeneration; qualitativ überzeugende Choreografie/Finale; kontrollierte Projektadoption; vollständige technische Release-Suite; echte Anfänger-/Recipient-Prüfung; reale Geräte und iPhone-WhatsApp-/Files-Zustellung. Keine dieser offenen Abnahmen lässt sich durch die jetzigen grünen Konzepttests ersetzen.
