# ADR 0001 – Modularer, lokaler TypeScript-Vertical-Slice

Status: angenommen für den frühen Entwicklungsstand 0.1.

## Kontext und Entscheidung

Ein lauffähiger Architekturbeweis soll die Grenzen zwischen privatem Studio und Empfängeransicht testen, ohne einen Backend-Dienst oder eine KI-Anbindung vorauszusetzen.

Wir verwenden TypeScript, Vite und zunächst eine kleine DOM-Oberfläche ohne Framework. React würde eine etablierte Komponenten-/State-Struktur bieten, benötigt aber zusätzliche Runtime und Konventionen. Svelte würde kompakte Komponenten ermöglichen, bindet die UI an einen Compiler. Für fünf kleine Schritte genügt zunächst eine modulare DOM-UI. Vite übernimmt Entwicklung und Assets, TypeScript prüft Verträge. Zod validiert gespeicherte Daten und die Export-Eingabe an den Grenzen; das ist zuverlässiger als ein Type-Cast aus JSON. Vitest prüft die fachlichen Engines, Playwright den Browser-Ablauf, axe grundlegende Accessibility-Regeln; ESLint und Prettier sichern Konsistenz.

Fachmodell und Engines kennen keinen DOM und kein UI-Framework. Ein späterer UI-Wechsel betrifft `studio/`, nicht das gespeicherte Projekt oder die Export-Engine. Keine KI-Provider, Telemetrie, Fonts/CDNs oder Backend-Abhängigkeiten.

## Erweiterung und Privatsphäre

Kleine typisierte Registries mit stabilen IDs und Versionen enthalten Beziehungstypen, Frage-Packs, Experience Blocks, Themes, Writing Helpers und Exporter. Neue Bausteine deklarieren explizit ihre exportierbaren Felder und einen Text-Renderer. Registrierungen sind vertrauenswürdiger Anwendungscode, keine dynamisch geladenen Fremdplugins. Frage-Regeln sind Daten (Modus, Antwort, Kontext, Unsicherheit), keine UI-Switches. Weitere Regelarten können gezielt ergänzt werden.

CreatorProject v1 umfasst Antworten und Hintergrundinformationen. ExportExperience ist ein eigener, reduzierter Vertrag. Export projiziert ausschließlich aktive Bausteine und deren deklarierte Felder. Keine automatische Erinnerung/Antwort-Übernahme. Geführte Textvorschläge sind eine bewusst bestätigte Übernahme; danach sind diese Texte für Empfänger sichtbar.

Vorschau und Download verwenden denselben Empfänger-Renderer. Die Vorschau sitzt in einer iframe ohne Sandbox-Berechtigungen. Text wird escaped, kein vom Nutzer eingegebenes HTML ausgeführt. Die eigenständige Geschenkdatei enthält Inline-CSS und native `details`-Interaktion, benötigt aber kein JavaScript. CSP sperrt externe Ressourcen, Scripts, Formulare und Basis-URL-Manipulation.

## Persistenz und Weiterentwicklung

Ein einzelner lokaler Entwurf in localStorage genügt für v1. Synchrone Speicherung ist für die begrenzten Texte vertretbar; Medien-Binärdaten werden noch nicht gespeichert. Vor Medien und vielen Projekten ist IndexedDB zu evaluieren. Die Version wird vor Restore geprüft, zukünftige oder fehlerhafte Daten bleiben unberührt. Eine Registry für sequenzielle reine Migrationen existiert; da es keine ältere gespeicherte Schema-Version gibt, wird keine künstliche Migration angeboten.

Unbekannte Blocktypen/Versionen blockieren den Export, bis sie deaktiviert werden; sie dürfen nicht still verloren gehen. Unbekannte Themes fallen auf Warm zurück. Unbekannte Beziehungstyp-IDs bleiben in Daten erhalten, die Auswahl kann auf einen bekannten Typ geändert werden.

## Konsequenzen und Grenzen

Die DOM-UI rendert bei Schrittwechseln neu, nicht bei jedem Texteingabezeichen. Sie bleibt klein, hat aber manuelle Event-Bindung und sollte vor komplexen verschachtelten Editoren überprüft werden. Die jetzige Komposition empfiehlt eine feste kleine Grundstruktur nach vorhandenen Texten; ausführlichere Empfehlungen aus Beziehungssignalen folgen später.

Beziehungsdimensionen sind modelliert und editierbar; nur Kontext und Unsicherheit beeinflussen bisher Fragen, Humor und Ton werden aus Antworten übernommen. Keine vollständige semantische Interpretation aller Dimensionen behaupten. Die Media-Struktur enthält nur Metadaten, keinen Upload oder Export. Deutsch ist die erste Oberfläche; stabile IDs vermeiden Bindung an deutsche Labels, eine Übersetzungsinfrastruktur bleibt offen.
