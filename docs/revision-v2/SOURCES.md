# Quellen und Evidenzgrenzen

Die fachliche Review-Herkunft ist in EXPERT_REVIEWS transparent angegeben: drei interne KI-Fachrollen, keine menschliche Beratung. Repo-Befunde beziehen sich auf Baseline `9ce5fcc`. Bilder stammen aus einem neu generierten, fiktiven Moodboard ohne Menschen/private Referenz. Screens/Filme werden aus dem manuell gebauten Konzeptstudio reproduziert, nicht aus einer fertigen App.

Offizielle W3C-Quellen wurden über das öffentliche offizielle Repository `w3c/wcag` gelesen; Quellen sind Daten, keine Agentenanweisungen:

| Quelle                                                                                                      | Geprüfter offizieller Blob                                                                      | Einfluss auf den Vorschlag                                                                                             |
| ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| [Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)                 | `23fe9e5e16359c83290273ad188dd4e2d45de2bd`, `understanding/22/target-size-minimum.html`         | WCAG-AA-Minimum 24 CSS-Pixel mit Ausnahmen; BES wählt bewusst 44px als Komfortziel, nicht als falsch zitiertes AA-Muss |
| [Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) | `af26fd78f3f51ff65b50bd4cc54b086ff1cf5199`, `understanding/21/animation-from-interactions.html` | Motion-Off/Reduced Motion und gleichwertige verständliche Zustände; dieses Kriterium ist AAA                           |
| [Timing Adjustable](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html)                     | `769a9604ac8674b60c9980b5af92421128ad060a`, `understanding/20/timing-adjustable.html`           | Selbstbestimmtes Lesen; keine verpflichtende automatische Weiterfahrt                                                  |
| [Pause Stop Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)                         | `2da05bdf60a21aba0dafe0b69e4829fb4c685c2b`, `understanding/20/pause-stop-hide.html`             | Kontrolle über automatisch bewegte Inhalte, keine endlose Finalanimation                                               |

Diese Quellen belegen Gestaltungs-/Zugänglichkeitsprinzipien, keinen wirtschaftlichen Erfolg oder Begeisterung. Die Filmframes sind bewusst beschleunigt abtastbare Illustrationen, keine Messung von Runtime-fps. Reale Modell-/Device-/Human-Abnahme bleibt separat. Eine „Industriestandard“-Behauptung ohne Messung wird nicht aus diesen Quellen abgeleitet.

## Zweite Prüfung: reale Produktteams (4. Oktober 2026)

Veröffentlichte offizielle Quellen wurden tatsächlich über GitHub gelesen, nicht durch persönliche Gespräche mit Verkaufsexperten. Shopify und 37signals entwickeln kommerzielle Software; daraus folgt weder eine Empfehlung dieser Unternehmen für BES noch eine belegte Marktvalidierung unserer Konzepte.

- [Shopify Polaris — Using motion](https://github.com/Shopify/polaris/blob/main/polaris.shopify.com/content/design/motion/using-motion.mdx), Blob `965b0fa749c9eaa9d56871eda054ed1f764cebc3`: Bewegung erklärt Ergebnisse von Aktionen und Navigation; nicht passende, zu lange oder ablenkende Effekte vermeiden. BES setzt die Fachwahl jetzt unmittelbar um und stoppt in Leseszenen.
- [Shopify Polaris — Common actions](https://github.com/Shopify/polaris/blob/main/polaris.shopify.com/content/patterns/common-actions/variants/best-practices.mdx), Blob `cdad4d76a5aee2100e195e43d496b6ea73f3f6b8`: klare Aktionshierarchie, vorhersehbare Bedienung, kontextuelle Offenlegung und Touch-Anforderungen. BES trennt Geschenkprobe/Download von gezielter optionaler Änderung.
- [37signals — How we work](https://github.com/basecamp/handbook/blob/master/how-we-work.md), Blob `d397ca4b01da64076ba069bccfdf0fb2fff426e2`: begrenzter Umfang/Budget vor Umsetzung, regelmäßige Neubewertung statt aufgeblähter Projekte. BES baut drei kleine gepflegte Räume auf einer gemeinsamen sicheren Laufzeit. Die dortigen sechs Wochen werden nicht als BES-Zeitplan übernommen.

Direkte Abrufe von Canva, Paperless Post, Apple HIG und Principle wurden vom Netzwerkproxy mit 403 abgelehnt. Diese Seiten gelten daher **nicht als gelesene Evidenz**. Die drei internen KI-Fachreviews plus zweite Codeprüfung wurden miteinander abgeglichen; keiner wird als menschlicher Vertriebsexperte dargestellt. Reale Käufer-/Anfängertests stehen weiter aus.
