# Decisions / ADR Index

Important decisions should be recorded as ADRs under `docs/adr/`.

## Pending decisions

- Application framework/build tooling.
- Exact registry/plugin contract.
- Persistence technology and migration runner.
- Single-file bundling strategy.
- Media size/performance policy.
- Sanitization/content-security approach for generated HTML.
- Preview isolation strategy.
- Test stack and browser automation.
- Initial localization architecture.

Do not settle these merely because a prototype makes one option convenient. Record trade-offs.

## Angenommene Entscheidungen für 0.1

[ADR 0001 – Modularer lokaler TypeScript-Vertical-Slice](adr/0001-typescript-local-first-vertical-slice.md) entscheidet den ersten Stack, typisierte Registries, localStorage für einen Textentwurf, explizite Export-Allowlist, sandboxed Preview, HTML-Escaping/CSP und scriptfreie native Interaktion. Die obige Pending-Liste bleibt für die weitergehenden Ausbaustufen relevant; Medien, umfangreiche Migrationen und Übersetzungskataloge sind noch offen.

[ADR 0002 – Safe drafts and v2 contract](adr/0002-safe-drafts-and-v2-contract.md) dokumentiert Migration, Import-/Sammlungsgrenzen und sichere deklarative Erweiterungen.

[ADR 0003 – Coordinated motion and untrusted Director](adr/0003-coordinated-motion-and-untrusted-director.md) dokumentiert Directions, endliche Effekte, Profile und den sicheren manuellen Regie-Vertrag.

[ADR 0004 – Local photo assets and portable copies](adr/0004-local-photo-assets-and-portable-copies.md) dokumentiert Original/Derivat-Trennung, Codec-/Speichergrenzen, native Browserverarbeitung und Quellprofile.
