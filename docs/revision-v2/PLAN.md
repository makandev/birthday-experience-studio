# BES Revision V2 — Vorschlag zur Bewertung

**Status: Alle drei Richtungen zur Umsetzung freigegeben; Produktionsintegration unter Prüfung.**

Branch: `codex/bes-revision-v2-proposal`. Ausgangspunkt: `9ce5fcc5d66cfb6112ddb1394039c1052f6d59c8`. `main`, `codex/bes-foundations`, bestehende App, Projekte und Live-Seite bleiben unverändert. Die anschließende Nutzeranweisung erlaubt ausdrücklich die Umsetzung aller drei Richtungen sowie geprüfte Integration nach main/GitHub Pages. Die frühere Vorschlags-Sperre ist aufgehoben. Die folgende ursprüngliche Empfehlung A/B/C ist historische Designhypothese, keine Auswahl eines Gewinners.

## Empfehlung in einem Satz

**BES wird zur Geschenkprobe: wenige freigegebene Zutaten, eine vollständige Inszenierung, eine gezielte Verbesserung, eine Geschenkdatei.** Kein Formularstudio mit konkurrierenden Gestaltungswegen. Die Revision verändert Ablauf, Raum, Interaktion und kreative KI-Steuerung — nicht nur Farben und Partikel.

## Was die Analyse tatsächlich ergab

Drei unabhängig arbeitende KI-Reviewer haben Produkt/UX, Art Direction/Motion und Engineering/Security geprüft. Das sind keine beauftragten menschlichen Fachleute und keine Nutzerstudie. Ihre ausführlichen Befunde und meine Entscheidungen stehen in [EXPERT_REVIEWS.md](EXPERT_REVIEWS.md). Zusätzlich wurden aktuelle offizielle W3C-Quellen geprüft; siehe [SOURCES.md](SOURCES.md).

Die bestehende technische Basis ist nützlich, die qualitative Nutzerablehnung bleibt maßgeblich:

- Die Vorschau konkurriert mit mindestens fünf ähnlich klingenden Aktionen und weiteren Varianten-/Detailwegen (`src/studio/app.ts`, `previewPage`).
- Anbieteranmeldung, Servervorbereitung, Gestaltungswunsch und Textumschreibung teilen sich einen Dialog; danach folgt ein weiteres kleines Vorschaufenster.
- Neue KI-Zeichnungen landen hinter derselben DOM-Inszenierung. Die Generierung setzt weiterhin `challenger/portrait`; das Antwortschema entscheidet kaum Dramaturgie (`generation.ts`, `generateAiGift`).
- `AI_STAGE_CSS` rahmt die Szenen erneut ähnlich. Mehr Effekte würden diese Wiederholung nicht beheben.
- Es gibt keine belegte reale Modellabnahme und keine zuverlässige tatsächliche iPhone-Dateizustellung. Diese Probleme dürfen nicht mit Mock-Tests oder einer neuen Farbpalette verdeckt werden.
- Einige Dokumente haben historische Aussagen neben neueren Nachträgen. Die Revision soll aktuelle Verträge einmal klar formulieren, statt wieder überall einen widersprüchlichen Zusatz anzuhängen.

## Drei echte Designhypothesen

Die Bilder und Filme sind **synthetische, manuell animierte Konzeptbeispiele**, keine KI-Geschenke oder implementierten Produktfunktionen. Alle nutzen dieselben Beispielworte und keine private Reference Experience.

| Richtung                            | Raum und visuelle Sprache                                                                                            | Handlung mit Konsequenz                                                    | Finale                                                                          | Hauptrisiko                                                                                |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **A · Moment Atelier — empfohlen**  | Fotografische Editorial-Bühne, Papierweiß, Terrakotta, großzügige Typografie; Foto bis an den Rand, keine Kartenwand | Öffnen; Bild oder Worte auswählen; gewähltes Element bleibt im Schlussbild | Bild/Satz wird groß, Geschenkband schließt die visuelle Geschichte; danach Ruhe | Bei schwachen Zutaten zu still oder allgemein — durch echten Minimalinput-Vergleich prüfen |
| **B · Surprise Box — Challenger**   | Ultramarin/Koralle, taktile Papiermechanik, Laschen und großer Fotoabzug                                             | Band lösen; Fach auswählen; zweites Fach bleibt erreichbar                 | Geöffnete Teile werden ein Geburtstagsbanner, eine kurze Konfettiwolke          | Darf weder kindlich noch gimmicklastig werden; keine erfundenen Insider                    |
| **C · Light Premiere — Experiment** | Durchgehender dunkler Raum, ein Lichtmotiv, bildfüllende Fotos und starke Kontraste                                  | Licht zu Bild oder Worten führen; Brieföffnung beruhigt die Bewegung       | Gewählte Kernbotschaft und Motiv treffen sichtbar zusammen                      | Leere Kinopose bei wenig Inhalt; schwieriger bei Kontrast/Performance                      |

Aktuelle Entscheidung: **A, B und C vollständig auf einer gemeinsamen technischen Basis anbieten.** A bleibt eine Empfehlung für den neutralen Start, kein belegter Gewinner. Alle drei erhalten eigene Räume/Interaktionen/Finales; keine drei getrennten Apps.

## Neuer Creator: vier Momente, ein Hauptweg

### 1. Zutaten geben

„Für wen ist dein Geschenk?“ Name erforderlich. Beziehung und Stimmung als kurze freiwillige Chips mit sicheren neutralen Defaults; ein persönlicher öffentlicher Satz oder Foto optional. Keine Fragenwand, keine Qualitätsbewertung der Person, kein Zwang zu privaten Details.

Primäraktion: **„Mein Geschenk entwerfen“**. Eine ausdrücklich fiktive Beispielprobe kann schon vor der Verbindung zeigen, was BES inszenieren möchte; sie darf niemals als persönlicher KI-Entwurf ausgegeben werden.

KI bleibt gemäß aktuellem Produktvertrag Teil neuer Erzeugung. Falls noch keine Verbindung besteht, erscheint ein eigener verständlicher Verbindungsmoment mit „Kostenlose Online-KI“ oder „Lokale KI auf diesem Computer“. Anmeldung, Quoten, Datenweitergabe und Hardwareanforderungen offen erklären. Keine Paid-Fallbacks, kein Modell-Autoinstall, keine Schlüssel in Projekten. Die erste Anmeldung wird getrennt von der eigentlichen Gestaltung gemessen; kein unbewiesenes Zwei-Klick-Versprechen.

### 2. Ganze Geschenkprobe erleben

Nach echter Generierung startet eine **eigene bildschirmfüllende Empfängerprobe**, nicht ein kleiner Dialog in einem zweiten scrollenden Fenster. Isolation bleibt erhalten; die Creator-Oberfläche wird vorübergehend ersetzt, nicht unter einem zweiten Bedienfeld versteckt. „Probe beenden“ ist erreichbar. Foto/Brief bleiben lesbar, Lesedauer ist selbstbestimmt.

Am Ende nur **„So verschenken“** oder **„Etwas ändern“**. Kein Pflicht-Abnicken jeder einzelnen Szene.

### 3. Genau eine Sache verbessern — optional

„Was passt noch nicht?“ → **Worte · Inszenierung · Foto**. Nur die passende kleine Eingabe erscheint. „Neue Inszenierung ansehen“ verändert Dramaturgie/Choreografie sichtbar, lässt Worte/Fotos ohne ausdrückliche Auswahl unverändert. Betroffene Passage erneut erleben, Änderung übernehmen oder vorherige behalten. Ein klarer Undo-Pfad statt einer Variantenverwaltung.

### 4. Prüfen und verschenken

„Das verschenkst du.“ Öffentliche Inhalte kontrollieren; die echte volle Probe erneut abspielbar. **„Geschenkdatei herunterladen“** liefert das einzelne HTML mit eingebetteten Inhalten, Bildern und Animation. Abspielen braucht keine KI, keinen Account und kein Internet. Die tatsächlichen iPhone-Öffnungsgrenzen stehen sichtbar am Export, ohne eine Pflicht zum Website-Upload/JSON-Reader daraus zu machen.

## Der kreative Kern wird wirklich neu

Die KI bekommt nicht nur den Auftrag „Schreibe Brief und goldene Partikel“. Sie komponiert einen validierten **ExperiencePlan** aus ausdrücklich öffentlichen Zutaten:

1. Kernbotschaft und Unsicherheit bestimmen; keine persönlichen Fakten erfinden.
2. Zusammenhängendes Motiv wählen, das Anfang und Ende verbindet.
3. Drei bis fünf passende Szenen planen; weniger Inhalt ergibt ein kürzeres gutes Geschenk, keine Füllstationen.
4. Szenenlayout, Reihenfolge, Bildinszenierung, sinnvolle Interaktion, Übergang, Ruhepunkt und Finale entscheiden.
5. Eigenen begrenzten Animationscode programmieren, der diese Dramaturgie trägt.

Beispielplan: Papierkante öffnen → Foto entdecken/Wahl treffen → persönliche Worte entfalten → freigegebenen Wunsch aufdecken → gewähltes Element im Finale bewahren. Jeder Schritt verändert den sichtbaren Zustand. Ein anderes Briefing kann mit einem spielerischen Fach starten oder einen Foto-Reveal später setzen. Die Unterschiede müssen sich beim Durchspielen zeigen, nicht nur im JSON.

Der Plan ist strukturierte untrusted DATA. Gepflegte Renderer ermöglichen wenige hochwertige räumliche Fähigkeiten: Öffnung, Foto-Raum, Brief, Entdeckung, Abschluss. Es entstehen weder beliebiges KI-HTML/CSS noch eine generische Website-/Plugin-Plattform. **Die KI programmiert weiterhin echte Zeichenlogik**, ausschließlich im bestehenden opaken Worker. Der vertrauenswürdige Renderer setzt nur schema-validierte Layout-/Timing-/Interaktionsdaten um.

## Choreografie statt Dauerbeschäftigung

Für A: Öffnung 650 ms, Foto-Reveal ungefähr 480 ms mit anschließend 900 ms Ruhe, Briefentfaltung 420 ms, Text danach sofort vollständig lesbar. Leseszenen ohne Hintergrundbewegung. Abschluss nach kurzer Ruhe: gewähltes Element wächst in rund 800 ms, Gratulation folgt; spätestens nach wenigen Sekunden steht alles still.

Für B: Band 300 ms, drei Laschen je 90 ms versetzt, Fachwechsel 460 ms, Fotoabzug 550 ms, Finale setzt Teile in 650 ms zusammen; eine begrenzte Konfettiwolke, dann Ruhe.

Für C: Lichtöffnung 900 ms, Richtungswechsel 600 ms, optionaler Foto-Push höchstens 2 %, Bewegungsstopp beim Brief; Lichtverbindung und Kernbotschaft bilden das Finale. Keine Blitzfolge, keine automatisch schnell wechselnden Texte.

Das sind vorgeschlagene Richtwerte, keine unveränderlichen Templates. Modellprogramm und validierter Ablauf können kohärente Alternativen erzeugen. Texte/Interaktionen bleiben ohne Ton und mit reduzierter Bewegung vollständig verständlich. Kein zwanghaftes Autoplay, keine vorgeschriebene Lesedauer. Surprise wird nicht durch „Jetzt kommt eine Überraschung“ vorweggenommen.

## Bestehende Technik bewahren, sichtbaren Produktkern ersetzen

**Behalten:** TypeScript/Vite/native DOM, transaktionale Speicherung, CAS/Konflikte, Recovery/GC, Raster-/EXIF-Verarbeitung, Originale/Derivate, Export-Allowlist, credential-isolierte Provider-Session, Worker/CSP und bewährte Security-Tests.

**Neuer kleiner Aufbau:** Creator-Ansicht; Generation Coordinator mit genau einer aktiven Anfrage und Kandidat/Revision/Abbruch; strikt begrenzter ExperiencePlan; eigener Recipient Renderer; vorhandene Animation Boundary. Keine Microservices, kein neuer UI-Framework-Zwang, keine abstrakte Plattform.

Erster funktionaler Kandidat bleibt zunächst auf dem separaten Branch, mit eigenem Einstieg und **flüchtigem** neuen Ablaufplan. Keine Migration/Überschreibung alter Projekte für eine Designwette. Erst nach sichtbarer Entscheidung folgen versionierte Persistenz und kontrollierte Adoption mit Backup/Undo; vorhandene Projekte bleiben beim alten Renderer, bis der Creator bewusst umstellt.

Der heutige First-frame-Probe reicht nicht: Kandidat an mehreren Zeiten, jeder Szene und Finalphase prüfen und komplett offline durchspielen. Auch diese Stichproben beweisen keine perfekte Sicherheit; Worker-Deadlines/Message-Validation bleiben entscheidend. Fehler dürfen den gespeicherten Entwurf nicht ersetzen.

## Schutz- und Qualitätsgrenzen

- Private Reference Experience niemals in Repo, Demos, Prompts, Fixtures, Filme oder Logs übernehmen; nur neutrale Qualitätskriterien.
- Credentials niemals in Projekt/Export/Prompt/URL/Log/Git/Community-Inhalt; free-only oder lokale Inferenz, keine Kostenautomatik.
- Recipient enthält nur freigegebene Geschenk-Daten. Kamera-/Foto-Metadaten und rohe Creator-Antworten bleiben draußen.
- Bestehende Budgets gelten: sechs Fotos, 512 KiB pro Derivat, Geschenk bis 6 MiB; keine Ausweitung auf den im Motion-Review vorgeschlagenen 8-MB-Wert.
- Worker-Quelle höchstens 16.000 Zeichen, eine offene Frame-Anfrage, vorhandene Payload-/Command-/Deadline-Grenzen; Ziel höchstens 72 Zeichenbefehle, 30 fps mobil, keine Endlosschleife nach dem Finale.
- Primärbedienung mindestens 44 × 44 CSS-Pixel, sichere Abstände/Safe Areas, Tastatur/Fokus, Kontrast und Reduced Motion. W3C-AA-Minimum 24 px ist nicht unser Komfortziel.
- Arbeitsziel Performance: auf benanntem realem Testgerät 95 % der Hauptthread-Frames innerhalb 33 ms; keine wiederholten Long Tasks über 50 ms. Erst Messung, dann Aussage.
- **Keine Zusage „funktioniert in iPhone Files/WhatsApp“ ohne reale Prüfung.** Eine Revision kann Betriebssystem-Dateivorschaugrenzen nicht durch bessere Animation beseitigen. Standalone bleibt Hauptartefakt; Reader/Cloud werden nicht heimlich Pflicht.

## Vorgehen in überschaubaren Phasen

| Phase                                          | Ergebnis                                                                                                                          | Gate / Entscheidung                                                                                                              |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **0 · Vorschlag, jetzt**                       | Plan, unabhängige KI-Reviews, drei Konzepte, Bilder/Filme, klickbare Beispiele, Bewertungsbogen                                   | Deine Bewertung der Richtung; keine produktive Änderung/main-Integration                                                         |
| **1 · Eine komplette vertikale Geschenkprobe** | A als eigenständiger Creator/Recipient, fünf oder weniger Szenen, eine sinnvolle Interaktion, Finale; B als begrenzter Challenger | Gleiche synthetische Zutaten, echte Browser-Walkthroughs, keine Kartenfabrik; alter Stand intakt                                 |
| **2 · Echte KI statt Mock-Selbsttäuschung**    | Validierter Ablauf + programmierte Choreografie mit echten lokalen/free-only Modellen                                             | Benannte Modelle/Versionen, drei Briefings, echte Antwort-/Fehler-/Quota-Checks; private Daten ausgeschlossen                    |
| **3 · Alltag und sichere Mitnahme**            | Bewusste neue-plan-Adoption, Import-/Undo-/Konfliktprüfung, echte Offline-Datei; Mobile/Screenreader                              | Volle technische Suite + tatsächlicher Versand/Öffnung auf realen Geräten; iPhone-Limit ehrlich offen lassen, falls nicht lösbar |
| **4 · Vergleich und Freigabe**                 | Formative Anfänger-/Recipient-Prüfung, begründete Auswahl, Dokuabgleich                                                           | Nur bei echtem Mehrwert und deiner Bewertung Übernahme vorschlagen; keine automatische neue Siegerbehauptung                     |

Das ist ein kleiner Revisionszyklus, kein monatelanges Fundamentprojekt. Erst **ein** überzeugender Kandidat, dann sein stärkster Challenger. Schätzung bei verfügbaren Modellen/Testgeräten: wenige kompakte Entwicklungszyklen; eine konkrete Dauer erst nach Phase-1-Spike festlegen. Reale Geräte, Anbieteranmeldung und externe Tester sind eigenständige Voraussetzungen, keine durch Tooltests ersetzbaren Arbeitsschritte.

## Wann die Revision schlechter ist und verworfen wird

Sie wird nicht übernommen, wenn sie nur auf Bildern hochwertiger aussieht, beim Spielen dieselbe Kartenfolge liefert, mehr Erklärungen braucht, Texte/Fotos verliert, KI-Ergebnisse nur dekorieren, sensitive Daten preisgibt oder die Lieferprobleme verschleiert. Drei Themes ohne drei andere Dramaturgien reichen nicht. Ein schönes MP4 ist kein funktionierendes Geschenk.

„Beste industrielle App“ ist kein beweisbarer Abschlussstatus. Professionell bedeutet hier: ein kohärentes Produkt, beobachtbar wenig Aufwand, nachweisbar sichere Technik, gemessene Robustheit, zugängliche Bedienung und eine tatsächlich lieber verschenkte Experience. Die vorgeschlagenen Abnahmen stehen in [EVALUATION.md](EVALUATION.md).

## Was du jetzt beurteilen kannst

- [Konzeptstudio öffnen/herunterladen](konzeptstudio.html): A/B/C wechseln, Geschenk öffnen, Bild/Worte wählen, Wunsch enthüllen, Abschluss und Replay. Rein lokaler Konzeptmodus; keine KI-Anfrage und keine Produktionsdaten.
- [Bildübersicht](VISUALS.md): Screenshots aller drei Creator-/Recipient-/Finale-Ansichten.
- Drei animierte Filme und GIF-Beispiele: Ablauf-/Art-Direction-Demonstrationen, nicht Laufzeit-/iPhone-/KI-Beweise.

Die Bewertung ist erfolgt: der Nutzer möchte alle Richtungen. Geprüfte Integration ist ausdrücklich autorisiert; alte Projekte behalten ihren Renderer, bis sie bewusst einen neuen Entwurf übernehmen.

## Phasenstatus und Evidenz

Phase 0 ist als überprüfbarer Vorschlag abgeschlossen: Plan, Reviews, drei klickbare Richtungen, Bilder, Filme und Prüfbericht liegen vor. Die aktuelle Freigabe umfasst alle drei Richtungen; Phase 1 wird gemeinsam umgesetzt. Phase 2 vom funktionalen Kandidaten und verfügbaren echten Modellen; Phase 3 von stabiler Generation und Testgeräten; Phase 4 von technischer Abnahme und tatsächlichem Nutzervergleich. Keine Folgephase wird als bereits umgesetzt dargestellt.

Definition of Done für Phase 0: bestehende Dateien unverändert, eigener synchronisierter Branch, synthetische Visuals, bedienbare Beispiele, ehrliche Grenzen, nachvollziehbare Entscheidung. Ergebnisse und qualitative Schwächen: [EVIDENCE.md](EVIDENCE.md).

## Aktueller Umsetzungsstand

Phase 0 bleibt dokumentiert. Phase 1: drei gepflegte Recipient-Räume, sofortige Auswahlfolge, weiter erreichbare Inhalte und erhaltenes Schlussmotiv; große Probe und kontextuelle Änderung sind implementiert. Phase 2: strukturierter KI-Plan plus echte isolierte Zeichenlogik, Provider-Epoch und Mehrpunktprobe implementiert; tatsächliche Modellinferenz bleibt mangels Modell/Konto ungetestet. Phase 3: additive Plan-Kompatibilität, keine Datenbankmigration, alte Importe unverändert; mobile WebKit/Chromium und Offline werden geprüft. Phase 4: interne visuelle/Fachprüfung, keine Anfänger-/Käuferstudie, keine Benchmark-Siegerbehauptung. Integration veröffentlicht einen 0.x-Entwicklungsstand; menschliche und physische iPhone-Abnahme bleiben offen.

Architektur: [ADR 0010](../adr/0010-three-revision-experiences.md). Aktuelle technische/live Evidenz steht in STATUS und EXPERIENCE_ACCEPTANCE. Die älteren Filme zeigen den Vorschlagsprototyp, nicht die aktuelle App.

### Final validation record

The real Studio and every maintained revision space have been traversed at mobile portrait in the production subpath, with separate synthetic-only visual observations in EXPERIENCE_ACCEPTANCE. Unit/schema/provider isolation, full desktop E2E and offline artifact checks passed. The detached-host race and an initially invalid regression fixture were repaired; final complete reruns passed 152 unit, 42 desktop, 36 mobile and two Pages checks, plus type/lint/format and normal/standalone/Pages builds. Publication follows these gates; remote/live results are tracked in STATUS. Real model inference, physical iPhone delivery and human preference/benchmark gates are not replaced by this development-preview delivery.

Delivery: all three maintained spaces reached main at 7125ff0; Pages run 37228656332 succeeded. Both live desktop checks and all 36 live mobile checks passed on the completed rerun; source bundle bytes match the checked build. See STATUS for earlier failures and the unexplained non-reproduced WebKit closure. This completes bounded implementation/technical delivery, with no automatic champion and no replacement of real human/model/iPhone acceptance.
