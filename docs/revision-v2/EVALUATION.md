# Bewertung: neue Revision oder nur neuer Anstrich?

**Alle Schwellen sind vorgeschlagene Ziele, keine erzielten Ergebnisse.**

## Vergleichbare öffentliche Briefings

| Beispiel          | Eingaben                                 | Was nicht behauptet werden darf                                    |
| ----------------- | ---------------------------------------- | ------------------------------------------------------------------ |
| Minimal           | Name „Demo“, neutrale Stimmung           | Keine bekannte Persönlichkeit, Geschichte oder Erinnerung erfinden |
| Persönlicher Satz | Dazu „Ein kleiner Moment, nur für dich.“ | Dies ist ein freigegebener Satz, kein biografischer Fakt           |
| Bild              | Dazu das synthetische Küstenmotiv        | Keine tatsächliche gemeinsame Reise aus dem Bild ableiten          |

Baseline und Revision erhalten dieselben Zutaten. Reihenfolge der Betrachtung wechseln. Keine Auswertung privater Creator-Inhalte, keine Telemetrie, kein automatischer Sieger. Private Referenz nur lokal mit erlaubter Person vergleichen; keine Identitäten/Inhalte/Originalscreenshots ins öffentliche Material.

## Dein kurzer Bewertungsbogen

Je 1–5 Punkte, dazu ein konkreter beobachteter Moment:

- War sofort klar, was zu tun ist?
- Fühlt sich das Erstellen leichter an?
- Ist das Ergebnis eine andere Inszenierung oder wieder dieselbe Karte?
- Hat eine Handlung eine erkennbare spätere Konsequenz?
- Macht der Anfang neugierig, ohne alles vorwegzunehmen?
- Gibt es einen persönlichen Höhepunkt ohne erfundene Fakten?
- Ist das Finale verdient, statt nur Gratulation + Partikel?
- Würdest du genau diese Version verschenken?

Ein Film oder Screenshot kann Bedienbarkeit nicht beantworten. Dafür das klickbare Konzept nutzen; Modellqualität, Export und OS-Öffnung können wiederum erst die echte Umsetzung beantworten.

## Formative Nutzerprüfung vor Übernahme

Acht freiwillige bislang unerfahrene Personen, keine öffentliche Erfassung ihrer persönlichen Geschenk-Inhalte. Vorschlag: mindestens sieben erstellen/prüfen/exportieren ohne Hilfe; mindestens sieben erklären richtig, welche Daten an Online-KI gehen und dass Empfänger keine KI brauchen. Anbieter-Setup separat zeitlich messen; Kernflow mit vorhandener Verbindung soll im Median etwa zwei Minuten beanspruchen, sofern Modellantwortzeiten das erlauben. Das ist ein Ziel, keine garantierte Frist.

Mindestens sechs bevorzugen die Revision bei „würde ich verschenken“ und nennen eine konkrete Verbesserung. Kleine formative Stichprobe, kein statistischer Beweis „beste App“. Befunde, Abbrüche und Schwächen dokumentieren; fehlgeschlagene Kriterien nicht still umdefinieren.

## Technische Freigabe

- Unit/module, TypeScript, lint, format, production/standalone build.
- Alte Projekte/Imports/Migrationen/CAS/Undo/Recovery/GC weiterhin grün.
- ExperiencePlan-Schema/Variantenunterschiede, fehlende Inputs, keine erfundenen Fakten.
- Export-Allowlist, XSS/unsafe URLs, Secret-/Private-Sentinels, metadatafreie Derivate.
- Worker-CSP, obfuskiertes Netzwerk/Storage, Hänger, bad/späte/gefälschte Commands; jede Szene und Finalphase über mehrere Zeiten.
- Voller offline exportierter Durchlauf, reale Bilder, Back/Replay, pause/reduced motion/no-JS fallback soweit vorgesehen.
- Echte lokale/free-only Modellantworten, benannte Versionen, öffentliche Testbriefs; Mocks klar getrennt.
- Chromium/WebKit und tatsächliche Geräte, Tastatur/Screenreader, Safe Areas, Hochformat/Querformat, Hintergrundwechsel.
- Reales iPhone: konkreter Versandkanal, OS-Version, tatsächliche Datei öffnen und alle Primäraktionen testen. „HTML gültig“ ersetzt diesen Nachweis nicht. Nicht zuverlässig spielbare WhatsApp/Files-Datei bleibt release-blocking; kein Pflichtreader als Ersatz.

## Integrationsregel

Nur der neue Branch, keine automatische Übernahme nach main. Zuerst Konzeptentscheidung, danach bewertbarer funktionaler Kandidat, echte Nutzer-/Modell-/Geräteprüfung und erneute Integrationsentscheidung. Die bestehende App ist bis dahin die erhaltene Vergleichsbasis. Wenn Revision gleichwertig oder schlechter ist, nicht wegen bereits investierter Arbeit übernehmen.
