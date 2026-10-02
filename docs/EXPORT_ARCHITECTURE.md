# Export Architecture

Primary early target: a single portable offline HTML file.

Pipeline:
CreatorProject → validate → recipient-safe projection → resolve blocks/theme/media → bundle minimal Experience Runtime → embed required assets → generate HTML → post-export validation.

Requirements:

- no Creator UI
- no hidden creator answers
- no API keys
- no mandatory network resources
- graceful handling of large media
- deterministic/reproducible where practical
- safe text/HTML handling
- recipient can open the file without installing software

Single HTML is an output artifact; source code remains modular.

## Implementierter Export v1

`parseProject` → `projectExperience` (aktive Bausteine + deklarierte Felder) → `renderExperience` → HTML-Blob/Download.

Alle Textfelder werden HTML-escaped. Kein Markdown, freies HTML, Nutzer-JavaScript oder dynamisch geladenes Drittanbieter-Plugin. Leere aktive Bausteine und unbekannte Blocktypen/-versionen blockieren Export mit einem Hinweis; unbekannte Themes fallen zurück. Der Export enthält Inline-CSS und native aufklappbare Inhalte, keine Scripts oder externen Assets. CSP: `default-src 'none'`, Styles inline, Bilder nur `data:`, kein Basis-URL-Wechsel und keine Formulare. Medien sind bisher nicht implementiert; die `data:`-Freigabe ist eine vorbereitete Grenze.

Der gleiche HTML-Inhalt wird im isolierten iframe als `srcdoc` angezeigt. Modultests prüfen private Sentinel-Werte, zusätzliche Blockfelder, Zeitstempel/IDs, HTML-Injection, fehlende Ressourcen und deterministische Ausgabe. Browserprüfungen lesen den Download und prüfen dessen exakten Inhalt samt Interaktion bei deaktiviertem Netzwerk. Direktes `file://`-Öffnen ist im Cloud-Browser durch Richtlinie gesperrt und bleibt eine zusätzliche Geräteprüfung.

## Capability-Profile

Offline/Restricted prüft ausgewählte Abhängigkeiten und verbietet externe Medien. Standard/Online benötigt explizite Quellenzustimmung; Imports setzen sie zurück. Fehlende oder unsupported Medien blockieren Export, deaktivierte Bausteine nicht. Das reine Textgeschenk benötigt in beiden Profilen keine externen Ressourcen. Empfänger-CSP erlaubt nur die bewusst ausgewählten externen Foto-Origins; kein allgemeines Netzwerk oder Scripts. Renderer bleibt scriptfrei, Motion ist CSS und HTML.
