# Privacy

BES is local-first.

Early versions must have no telemetry, analytics, accounts, hidden network calls or automatic cloud synchronization.

Creator inputs may include intimate relationship details and memories. Treat them as sensitive application data.

Exports use an explicit allowlist/projection. Tests should include assertions that private answer fields and internal metadata do not appear in generated recipient HTML.

External AI assistance is manual: BES prepares a prompt, the user chooses an external service, then optionally pastes the result back. Clearly show what information the generated prompt contains before copying it.

## Konkrete Grenzen in 0.1

Alle Rohantworten bleiben im CreatorProject. Geführtes Schreiben zeigt einen Vorschlag in einem Dialog, der ausdrücklich übernommen werden muss. Ab diesem Moment ist der übernommene Text recipient-visible; die Allowlist kann private Inhalte im vom Creator freigegebenen Text nicht erkennen.

Die KI-Anweisung ist erst nach Wahl des externen Schreibmodus sichtbar und zeigt exakt die Daten, die beim manuellen Kopieren weitergegeben würden. Grenzen können darin enthalten sein, um den Dienst zum Weglassen dieser Inhalte aufzufordern; der Nutzer wird darauf hingewiesen. Keine API-Anfrage wird ausgeführt.

Ein Entwurf und eine Backup-Kopie liegen unverschlüsselt im Browserprofil. Keine dauerhafte Verfügbarkeit versprechen: Speicher kann blockiert/voll oder vom Browser gelöscht sein. Speicherfehler sind sichtbar; unbekannte/beschädigte Entwürfe bleiben bis zur bewussten Entscheidung unberührt. Exportierte Geschenke sind nicht verschlüsselt, und aufklappbare Inhalte sind für jeden mit Zugriff auf die Datei lesbar.

## Entwurfsdateien und Sammlung

Creator-Sicherungen enthalten private Antworten. Sie sind keine Empfängergeschenke. Import wird geprüft und bestätigt; das aktuelle Geschenk bleibt lokal erhalten. Bis zu acht inaktive Geschenke sind möglich. Keine Zugangsdaten in Projekten; unbekannte Root-Felder werden zurückgewiesen. Ein Speicherversagen lässt die bestehende Sammlung unberührt beziehungsweise versucht ihren Rollback.
