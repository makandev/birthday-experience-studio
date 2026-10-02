import {
  createProject,
  type CreatorProject,
  type Step,
} from '../domain/project';
import { relationships } from '../registries/relationships';
import { themes } from '../registries/themes';
import { blocks } from '../registries/blocks';
import { activeQuestions, questionProgress } from '../engines/questions';
import {
  recommendBlocks,
  syncComposition,
  orderForDirection,
} from '../engines/composition';
import { writingHelpers } from '../engines/writing';
import {
  restoreProject,
  saveProject,
  STORAGE_KEY,
  type StorageLike,
} from '../persistence/storage';
import {
  readPortableDraft,
  writePortableDraft,
  type DraftBundle,
} from '../media/portable';
import { BrowserAssetStore } from '../media/store';
import { resolvePhotoSources } from '../media/resolve';
import { mediaBudget } from '../media/budgets';
import { MediaController } from './media';
import { readLibrary, replaceActiveProject } from '../persistence/library';
import { directions } from '../registries/motion';
import { recommendDirection } from '../engines/motion';
import {
  directorPrompt,
  parseDirectorProposal,
  applyDirectorProposal,
  type DirectorProposal,
} from '../integrations/director';
import { analyzeCapabilities } from '../export/capabilities';

import { exporters, exportFilename } from '../export/html';
import { escapeHtml as e } from '../experience/text';

const steps: { id: Step; label: string; short: string }[] = [
  { id: 'start', label: 'Ankommen', short: 'Start' },
  { id: 'person', label: 'Dein Mensch', short: 'Person' },
  { id: 'questions', label: 'Eure Geschichte', short: 'Fragen' },
  { id: 'writing', label: 'Deine Worte', short: 'Text' },
  { id: 'preview', label: 'Dein Geschenk', short: 'Vorschau' },
];
const flower = `<svg viewBox="0 0 64 64" aria-hidden="true"><g stroke="currentColor" stroke-width="5" stroke-linecap="round"><path d="M32 7v50M7 32h50M14 14l36 36M14 50l36-36"/></g></svg>`;
const primary = (text: string) =>
  `<button class="button primary" type="submit">${text}<span aria-hidden="true">→</span></button>`;
function storageAccess(): StorageLike {
  // Access itself can throw when browser storage is disabled.
  return {
    getItem: (key) => localStorage.getItem(key),
    setItem: (key, value) => localStorage.setItem(key, value),
    removeItem: (key) => localStorage.removeItem(key),
  };
}
export function mountStudio(root: HTMLDivElement): void {
  const storage = storageAccess();
  const restored = restoreProject(storage);
  let project =
    restored.status === 'restored' ? restored.project : createProject();
  let protectedDraft = restored.status === 'invalid';
  let saved = restored.status === 'restored';
  let undo: CreatorProject | null = null;
  let pendingImport: DraftBundle | null = null;
  let previewGeneration = 0;
  let importEpoch = 0;
  const assetStore = new BrowserAssetStore();
  const mediaController = new MediaController(assetStore, {
    getProject: () => project,
    changed: () => {
      persist();
      render();
    },
    edited: () => persist(),
    message,
    beforeRemoval: () => {
      undo = structuredClone(project);
    },
  });
  let pendingDirector: DirectorProposal | null = null;
  let notice =
    restored.status === 'invalid'
      ? 'Dein gespeicherter Entwurf konnte nicht gelesen werden. Er bleibt unverändert. Sichere ihn oder beginne bewusst neu.'
      : restored.status === 'unavailable'
        ? 'Dein Browser erlaubt gerade kein lokales Speichern. Lass diese Seite offen, damit deine Eingaben erhalten bleiben.'
        : '';

  function persist(): void {
    if (protectedDraft) return;
    project.updatedAt = new Date().toISOString();
    saved = saveProject(storage, project);
    const status = root.querySelector('#save-status');
    if (status)
      status.textContent = saved
        ? 'Auf diesem Gerät gespeichert'
        : 'Speichern nicht möglich – Seite bitte offen lassen';
  }
  function message(text: string): void {
    notice = text;
    const live = root.querySelector('#notice');
    if (live) {
      live.textContent = text;
      live.classList.toggle('visible', Boolean(text));
    }
  }
  function go(step: Step): void {
    if (protectedDraft) return;
    if (
      step !== 'start' &&
      step !== 'person' &&
      !project.recipient.name.trim()
    ) {
      message('Sag uns zuerst, für wen dein Geschenk ist.');
      return;
    }
    project.workflow.step = step;
    if (step === 'questions') {
      const list = activeQuestions(project);
      if (!list.some((q) => q.id === project.workflow.questionId))
        project.workflow.questionId =
          list.find((q) => !project.answers[q.id])?.id ?? list[0].id;
    }
    if (step === 'preview') syncComposition(project);
    persist();
    render(true);
  }
  function startPage(): string {
    return `<div class="hero-copy"><p class="eyebrow">Kleine Geste. Große Bedeutung.</p><h1>Ein Geschenk,<br>das nur <em>du</em><br>machen kannst.</h1><p class="lead">Für die Erinnerungen, die euch verbinden.<br>Und die Worte, die manchmal fehlen.</p><p>Wir helfen dir, daraus ein persönliches Geburtstagsgeschenk zu machen. Schritt für Schritt, in deinem Tempo.</p><form id="start-form"><div class="mode-grid"><label class="choice-card"><input type="radio" name="mode" value="quick" ${project.mode === 'quick' ? 'checked' : ''}><span><strong>Einfach anfangen</strong><small>Etwa 6–10 Fragen · ein persönlicher Anfang</small></span></label><label class="choice-card"><input type="radio" name="mode" value="deep" ${project.mode === 'deep' ? 'checked' : ''}><span><strong>Mehr Zeit für eure Geschichte</strong><small>Zusätzliche Fragen · mehr Raum für Erinnerungen</small></span></label></div>${primary('Mein Geschenk gestalten')}</form><p class="privacy-line">◈ Nur auf deinem Gerät. Keine Anmeldung. Keine KI nötig.</p></div><aside class="hero-art" aria-label="Ein persönlicher Brief als Geschenk"><span class="art-star star-one" aria-hidden="true">✦</span><span class="art-star star-two" aria-hidden="true">✧</span><div class="gift-paper"><p class="eyebrow">Nur für dich</p><span class="paper-flower" aria-hidden="true">${flower}</span><h2>Wie schön,<br>dass es dich gibt.</h2><p>Manche Menschen machen<br>die Welt ein bisschen wärmer.<br>Du bist einer davon.</p><div class="paper-line"></div><span class="paper-sign">Mit Liebe gemacht</span></div><p class="art-caption">Keine Vorlage kann eure Geschichte erzählen.<br>Aber du kannst es.</p></aside>`;
  }
  function personPage(): string {
    return `<div class="section-head"><p class="eyebrow">01 · Dein Mensch</p><h1>Für wen ist<br>dein Geschenk?</h1><p class="lead">Ein Name. Eine Verbindung. Hier beginnt eure Geschichte.</p></div><form id="person-form" class="panel"><label for="recipient-name">Wie heißt die Geburtstagsperson?</label><input id="recipient-name" name="recipient-name" maxlength="120" required autocomplete="off" placeholder="Zum Beispiel Anna" value="${e(project.recipient.name)}"><label for="relationship">Was verbindet euch?</label><select id="relationship">${relationships
      .all()
      .map(
        (r) =>
          `<option value="${e(r.id)}" ${r.id === project.relationship.typeId ? 'selected' : ''}>${e(r.label)}</option>`,
      )
      .join(
        '',
      )}</select><p class="field-help">Es muss nicht in eine Schublade passen. Unsicherheit ist willkommen.</p><details class="advanced"><summary>Eure Verbindung genauer beschreiben</summary><div class="dimension-grid">${(['closeness', 'formality', 'trust', 'humor', 'emotionality'] as const).map((key, index) => `<label>${['Wie nah steht ihr euch?', 'Wie förmlich ist eure Beziehung?', 'Wie vertraut seid ihr?', 'Wie viel Humor passt?', 'Wie emotional darf es sein?'][index]}<input data-dimension="${key}" type="range" min="0" max="5" value="${project.relationship.dimensions[key]}"><small>0 = wenig · 5 = sehr</small></label>`).join('')}<label for="years-known">Seit wie vielen Jahren kennt ihr euch?<input id="years-known" type="number" min="0" max="150" value="${project.relationship.dimensions.yearsKnown}"></label></div><label for="context">Eure Beziehung ist …</label><select id="context"><option value="private" ${project.relationship.dimensions.context === 'private' ? 'selected' : ''}>Privat</option><option value="professional" ${project.relationship.dimensions.context === 'professional' ? 'selected' : ''}>Beruflich</option><option value="mixed" ${project.relationship.dimensions.context === 'mixed' ? 'selected' : ''}>Beides / nicht ganz klar</option></select></details><div class="actions"><button type="button" class="button quiet" data-go="start">Zurück</button>${primary('Weiter zu eurer Geschichte')}</div></form>`;
  }
  function questionsPage(): string {
    const list = activeQuestions(project);
    const question =
      list.find((q) => q.id === project.workflow.questionId) ?? list[0];
    project.workflow.questionId = question.id;
    const index = list.indexOf(question);
    const answer = project.answers[question.id];
    const progress = questionProgress(project);
    return `<div class="section-head compact"><p class="eyebrow">02 · Eure Geschichte</p><h1>Die kleinen Dinge<br>machen es persönlich.</h1><p>Deine Antworten bleiben im Studio. Erst dein fertiger Geschenktext wird verschenkt.</p></div><form id="question-form" class="panel question-panel"><div class="question-meta"><span>Frage ${index + 1} von aktuell ${list.length}</span><span>${progress.done} beantwortet oder übersprungen</span></div><progress value="${progress.done}" max="${progress.total}" aria-label="Fragenfortschritt"></progress><label class="question-title" for="answer">${e(question.prompt)}</label>${question.type === 'choice' ? `<select id="answer"><option value="">Bitte auswählen</option>${question.options!.map((option) => `<option value="${e(option.value)}" ${answer?.value === option.value ? 'selected' : ''}>${e(option.label)}</option>`).join('')}</select>` : `<textarea id="answer" rows="5" maxlength="20000" placeholder="Ein Gedanke oder ein Satz reicht …">${e(answer?.value ?? '')}</textarea>`}<details class="help"><summary>Hilf mir dabei · Beispiele anzeigen</summary><p>${e(question.help)}</p>${question.examples.map((example) => `<blockquote>${e(example)}</blockquote>`).join('')}</details><div class="gentle-actions"><button type="button" class="text-button" id="unknown">Ich weiß es nicht</button><button type="button" class="text-button" id="skip">Frage überspringen</button></div><div class="actions"><button class="button quiet" type="button" id="question-back">Zurück</button>${primary(index === list.length - 1 ? 'Weiter zu meinen Worten' : 'Nächste Frage')}</div><button type="button" class="text-button finish-questions" data-go="writing">Ich möchte jetzt schreiben</button></form>`;
  }
  function writingPage(): string {
    return `<div class="section-head"><p class="eyebrow">03 · Deine Worte</p><h1>Es muss nicht perfekt sein.<br>Es muss von dir kommen.</h1><p class="lead">Alles in den folgenden Textfeldern kann im Geschenk sichtbar werden.</p></div><div class="writing-layout"><form id="writing-form" class="panel"><label for="writing-method">Wie möchtest du anfangen?</label><select id="writing-method"><option value="guided" ${project.writing.method === 'guided' ? 'selected' : ''}>Mit ein bisschen Hilfe</option><option value="self" ${project.writing.method === 'self' ? 'selected' : ''}>Ich schreibe selbst</option><option value="external" ${project.writing.method === 'external' ? 'selected' : ''}>Optional: Hilfe einer externen KI</option></select>${project.writing.method === 'guided' ? `<div class="writing-help"><p>„Was ich an dir schätze …“<br>„Ich werde nie vergessen, wie wir …“<br>„Für dein neues Lebensjahr wünsche ich dir …“</p><button type="button" class="button secondary" id="guided">Antworten als Textvorschlag übernehmen</button><small>Du entscheidest, was bleibt. Der Vorschlag wird nicht automatisch ins Geschenk übernommen.</small></div>` : ''}${project.writing.method === 'external' ? `<details class="external-help" open><summary>So funktioniert die freiwillige KI-Hilfe</summary><ol><li>Lies unten die vollständige Anweisung.</li><li>Kopiere sie und füge sie in deine bevorzugte KI ein.</li><li>Kopiere deren Antwort hier in deinen Brief.</li><li>Prüfe den Text und entferne alles, was privat bleiben soll.</li></ol><p><strong>Die Anweisung enthält deinen Namen für die Geburtstagsperson und deine aktiven Antworten, auch persönliche Grenzen.</strong> Durch manuelles Einfügen gibst du diese Informationen an den gewählten Dienst weiter. Das Studio sendet nichts.</p><label for="external-prompt">Das würdest du weitergeben</label><textarea id="external-prompt" rows="8" readonly>${e(writingHelpers.get('external-prompt')!.generate(project))}</textarea><button type="button" class="button secondary" id="copy-prompt">Prompt kopieren</button></details>` : ''}<label for="letter">Dein persönlicher Brief <span class="badge">Im Geschenk sichtbar</span></label><textarea id="letter" rows="9" maxlength="20000" required placeholder="Liebe/r ${e(project.recipient.name)}, …">${e(project.writing.letter)}</textarea><label for="wish">Dein Geburtstagswunsch <span class="optional">optional</span></label><textarea id="wish" rows="3" maxlength="20000" placeholder="Für dein neues Lebensjahr wünsche ich dir …">${e(project.writing.wish)}</textarea><label for="surprise">Eine kleine Überraschung <span class="optional">optional</span></label><textarea id="surprise" rows="3" maxlength="20000" placeholder="Zum Beispiel: Ich lade dich zu einem gemeinsamen Frühstück ein!">${e(project.writing.surprise)}</textarea><p class="field-help">Diese Nachricht öffnet die Geburtstagsperson mit einem Klick.</p>${mediaController.panel(project)}<div class="actions"><button type="button" class="button quiet" data-go="questions">Zurück</button>${primary('Mein Geschenk ansehen')}</div></form><aside class="side-note"><span aria-hidden="true">✧</span><h2>Deine Worte zählen.</h2><p>Ein einfacher, ehrlicher Satz ist oft schöner als der perfekte Text.</p><p>Private Antworten, Hintergrundinformationen und die KI-Anweisung gehören nicht zum Export. Prüfe trotzdem, was du in deinen Brief übernimmst.</p></aside></div><dialog id="suggestion-dialog" aria-labelledby="suggestion-title"><h2 id="suggestion-title">Dein Textvorschlag</h2><p>Hier werden ausgewählte Antworten zu Geschenktext. Prüfe sie, bevor du sie übernimmst.</p><textarea id="suggestion" rows="10" maxlength="20000"></textarea><div class="actions"><button type="button" class="button quiet" id="cancel-suggestion">Abbrechen</button><button type="button" class="button primary" id="accept-suggestion">In meinen Brief übernehmen</button></div></dialog>`;
  }
  function previewPage(): string {
    return `<div class="section-head compact"><p class="eyebrow">04 · Dein Geschenk</p><h1>So sieht dein<br>Geschenk aus.</h1><p>Nur diese Empfängeransicht wird exportiert. Nimm dir einen Moment zum Prüfen.</p></div><div class="preview-layout"><aside class="panel gift-settings">${directionControls()}<details id="appearance-settings" class="advanced"><summary>Bewegung und Farben anpassen</summary>${intensityControls()}<label for="theme">Welche Farben passen?</label><select id="theme">${themes
      .all()
      .map(
        (theme) =>
          `<option value="${e(theme.id)}" ${project.experience.themeId === theme.id ? 'selected' : ''}>${e(theme.label)}</option>`,
      )
      .join(
        '',
      )}</select></details><details id="block-settings" class="advanced"><summary>Inhalt und Reihenfolge ändern</summary><h2>Deine Bausteine</h2><p class="field-help">Du entscheidest, was vorkommt und in welcher Reihenfolge.</p><ul class="block-list">${project.experience.blocks.map((block, index) => `<li><label><input id="block-${e(block.id)}" type="checkbox" data-block="${e(block.id)}" ${block.enabled ? 'checked' : ''}>${e(blocks.get(block.type)?.label ?? `Unbekannter Baustein (${block.type})`)}</label><div><button class="icon-button" type="button" id="up-${e(block.id)}" data-move="${e(block.id)}" data-direction="-1" aria-label="${e(blocks.get(block.type)?.label ?? block.type)} nach oben" ${index === 0 ? 'disabled' : ''}>↑</button><button class="icon-button" type="button" id="down-${e(block.id)}" data-move="${e(block.id)}" data-direction="1" aria-label="${e(blocks.get(block.type)?.label ?? block.type)} nach unten" ${index === project.experience.blocks.length - 1 ? 'disabled' : ''}>↓</button></div></li>`).join('')}</ul><button class="text-button" id="recommend">Vorschlag wiederherstellen</button><p class="field-help">Aktiviert die ausgefüllten Bausteine und setzt ihre Reihenfolge zurück.</p></details>${profileControls()}<button class="text-button" id="integrations">Optionale Hilfe &amp; Regie-Ideen</button><div class="export-note"><strong>Ein Geschenk zum Mitnehmen</strong><p>Du erhältst eine einzelne HTML-Datei. Sie lässt sich im Browser öffnen, auch ohne Internet. Zum Verschenken als Datei verschicken.</p></div><button class="button primary full" id="download">Geschenk erstellen <span aria-hidden="true">↓</span></button><button class="button quiet full" type="button" data-go="writing">Text bearbeiten</button></aside><div class="preview-frame-wrap"><p class="preview-label">Empfängeransicht · ohne Studio-Daten</p><p id="preview-error" role="alert"></p><iframe id="gift-preview" title="Vorschau des Geburtstagsgeschenks" sandbox=""></iframe></div></div>`;
  }
  function directionControls(): string {
    const direction = directions.get(project.experience.directionId)!;
    return `<label for="direction">Wie soll sich dein Geschenk anfühlen?</label><select id="direction">${directions
      .all()
      .map(
        (d) =>
          `<option value="${d.id}" ${direction.id === d.id ? 'selected' : ''}>${e(d.label)}</option>`,
      )
      .join(
        '',
      )}</select><p class="field-help">${e(direction.description)}</p><button class="text-button" id="suggest-direction">Passende Stimmung vorschlagen</button>`;
  }
  function intensityControls(): string {
    return `<label for="intensity">Wie viel Bewegung? <output id="intensity-value" for="intensity">${project.experience.intensity}</output> von 3</label><input id="intensity" type="range" min="0" max="3" step="1" value="${project.experience.intensity}"><p class="field-help">0 = ganz ruhig. Weniger Bewegung wird auf Wunsch des Geräts automatisch berücksichtigt.</p>`;
  }
  function profileControls(): string {
    const report = analyzeCapabilities(project);
    return `<label for="export-profile">Wo soll das Geschenk funktionieren?</label><select id="export-profile"><option value="offline" ${project.exportConfig.profile === 'offline' ? 'selected' : ''}>Überall ohne Internet (empfohlen)</option><option value="online" ${project.exportConfig.profile === 'online' ? 'selected' : ''}>Online, mit optionalen externen Quellen</option></select><p class="field-help">Offline benötigt lokale Inhalte. Online-Fotos können ausfallen; eine beschreibende Bildunterschrift bleibt sichtbar.</p>${report.externalDomains.length ? `<div class="external-warning"><p>Ausgewählte externe Fotoquellen: ${e(report.externalDomains.join(', '))}</p><label><input type="checkbox" id="external-consent" ${project.exportConfig.externalMediaConsent ? 'checked' : ''}>Ich möchte diese externen Fotos verwenden. Die Dienste können beim Öffnen die Empfängeradresse sehen.</label></div>` : '<p class="field-help">Dieses Geschenk braucht derzeit keine externen Quellen.</p>'}`;
  }
  function integrationDialog(): string {
    return `<dialog id="integration-dialog" aria-labelledby="integration-title"><h2 id="integration-title">Optionale Hilfe für dein Geschenk</h2><p>BES funktioniert vollständig ohne KI. Wenn du möchtest, kannst du eine KI deiner Wahl um Regie-Ideen bitten: Stimmung, Reihenfolge und ergänzende Fragen. BES verbindet sich mit keinem Dienst.</p><p>Es gibt noch keine eingebauten API-Anbieter oder Eingabefelder für Zugangsdaten. Kosten und Anmeldung hängen vom selbst gewählten Dienst ab und können sich ändern.</p><label for="director-prompt">Das würdest du manuell weitergeben</label><textarea id="director-prompt" rows="7" readonly>${e(directorPrompt(project))}</textarea><p class="field-help">Diese Anweisung enthält deine freigegebenen Geschenktexte. Prüfe sie vor dem Kopieren. Zugangsdaten gehören niemals hierher.</p><label for="director-json">Regie-Vorschlag als JSON einfügen</label><textarea id="director-json" rows="6" maxlength="65536" placeholder="Nur die JSON-Antwort, ohne Code oder Markdown"></textarea><button class="button secondary" id="review-director">Vorschlag prüfen</button><pre id="director-review" class="director-review" role="status"></pre><button class="button primary" id="apply-director" hidden>Geprüfte Stimmung &amp; Reihenfolge übernehmen</button><div class="actions"><button class="button quiet" id="close-integrations">Zurück zum Geschenk</button></div></dialog>`;
  }
  function draftDialog(): string {
    let collection: CreatorProject[] = [];
    let libraryError = '';
    try {
      collection = readLibrary(storage);
    } catch {
      libraryError =
        'Die gespeicherte Sammlung ist gerade nicht zugänglich. Sie bleibt unverändert.';
    }
    return `<dialog id="draft-dialog" aria-labelledby="draft-title"><h2 id="draft-title">Deine Geschenke behalten</h2><p>Eine Entwurfsdatei enthält auch deine privaten Antworten und Geschenk-Fotokopien. Ursprüngliche Originalfotos bleiben nur auf diesem Gerät und können dort separat gesichert werden. Bewahre sie sicher auf und verschicke zum Verschenken nur die fertige HTML-Datei.</p><button class="button secondary" id="export-draft">Entwurf als Datei sichern</button><label for="import-draft">Gesicherten BES-Entwurf öffnen</label><input id="import-draft" type="file" accept=".json,application/json"><p class="field-help">Maximal 8 MB mit Fotokopien (Textanteil bis 2 MB). Dein aktuelles Geschenk bleibt bis zur Bestätigung unverändert.</p><p id="import-summary" role="status"></p><button class="button primary" id="confirm-import" hidden>Geprüften Entwurf öffnen</button><h3>Auf diesem Gerät behaltene Geschenke</h3><p>${e(libraryError)}</p><ul class="saved-projects">${collection
      .filter((p) => p.id !== project.id)
      .map(
        (p) =>
          `<li><span>${e(p.recipient.name || 'Noch ohne Namen')}</span><button class="button quiet" data-project="${e(p.id)}">Geschenk öffnen</button></li>`,
      )
      .join(
        '',
      )}</ul><button class="button secondary" id="new-project">Weiteres Geschenk anfangen</button><p class="field-help">Bis zu acht weitere Geschenke. Browserdaten sind nicht dauerhaft garantiert – sichere wichtige Entwürfe als Datei.</p><div class="actions"><button class="button quiet" id="close-drafts">Zurück zum Geschenk</button></div></dialog>`;
  }
  function render(focus = false): void {
    const openDetails = new Map(
      Array.from(root.querySelectorAll<HTMLDetailsElement>('details[id]')).map(
        (details) => [details.id, details.open],
      ),
    );
    const activeId = root.contains(document.activeElement)
      ? (document.activeElement as HTMLElement)?.id
      : undefined;
    const page = {
      start: startPage,
      person: personPage,
      questions: questionsPage,
      writing: writingPage,
      preview: previewPage,
    }[project.workflow.step];
    const stepIndex = steps.findIndex(
      (step) => step.id === project.workflow.step,
    );
    root.innerHTML = `<header class="site-header"><a class="brand" href="#" id="home"><span class="brand-mark" aria-hidden="true">${flower}</span><span>Birthday<br><strong>Experience Studio</strong></span></a><span class="version">Früher Entwicklungsstand · 0.2</span><span id="save-status" role="status">${protectedDraft ? 'Gespeicherten Entwurf nicht verändert' : saved ? 'Auf diesem Gerät gespeichert' : 'Deine Daten bleiben auf diesem Gerät'}</span></header><nav class="step-nav" aria-label="Geschenk gestalten"><ol>${steps.map((step, index) => `<li><button data-go="${step.id}" ${step.id === project.workflow.step ? 'aria-current="step"' : ''} ${protectedDraft || (index > 1 && !project.recipient.name.trim()) ? 'disabled' : ''}><span class="step-number" aria-hidden="true">${index < stepIndex ? '✓' : index + 1}</span><span>${step.short}</span></button></li>`).join('')}</ol></nav><div id="notice" class="notice ${notice ? 'visible' : ''}" role="status">${e(notice)}</div>${protectedDraft ? '<div class="blocked-draft panel"><h1>Dein vorhandener Entwurf bleibt geschützt.</h1><p>Diese Version kann ihn nicht öffnen. Sichere die gespeicherten Daten, bevor du neu anfängst.</p><button class="button secondary" id="backup">Gespeicherte Daten sichern</button></div>' : `<main id="main" class="${project.workflow.step === 'start' ? 'hero' : 'workspace'}">${page()}</main>`}<footer class="site-footer"><span>Persönlich gemacht. Privat gespeichert.</span><div><button class="text-button" id="drafts" ${protectedDraft ? 'disabled' : ''}>Meine Geschenke &amp; Sicherung</button>${undo ? '<button class="text-button" id="undo-reset">Letzte Änderung rückgängig machen</button>' : ''}<button class="text-button" id="reset">Neu anfangen</button></div></footer>${draftDialog()}${integrationDialog()}<dialog id="reset-dialog" aria-labelledby="reset-title"><h2 id="reset-title">Ein neues Geschenk beginnen?</h2><p>Dein aktueller Entwurf wird ersetzt. Wir sichern die bisherigen Daten lokal. In „Meine Geschenke“ kannst du außerdem mehrere Geschenke behalten. Du kannst den Neustart bis zum Neuladen rückgängig machen.</p><div class="actions"><button type="button" class="button quiet" id="cancel-reset">Entwurf behalten</button><button type="button" class="button primary" id="confirm-reset">Neues Geschenk beginnen</button></div></dialog>`;
    for (const details of root.querySelectorAll<HTMLDetailsElement>(
      'details[id]',
    )) {
      const wasOpen = openDetails.get(details.id);
      if (wasOpen !== undefined) details.open = wasOpen;
    }
    bind();
    mediaController.bind(root);
    if (project.workflow.step === 'preview' && !protectedDraft) updatePreview();
    if (focus) {
      const heading = root.querySelector<HTMLElement>('h1');
      if (heading) {
        heading.tabIndex = -1;
        heading.focus();
      }
    } else if (activeId) {
      document.getElementById(activeId)?.focus();
    }
  }
  async function updatePreview(): Promise<void> {
    const generation = ++previewGeneration;
    const snapshot = structuredClone(project);
    const iframe = root.querySelector<HTMLIFrameElement>('#gift-preview')!;
    const error = root.querySelector<HTMLElement>('#preview-error')!;
    const download = root.querySelector<HTMLButtonElement>('#download')!;
    download.disabled = true;
    try {
      const sources = await resolvePhotoSources(snapshot, assetStore);
      if (generation !== previewGeneration || !iframe.isConnected) return;
      const html = exporters
        .get(snapshot.exportConfig.exporterId)!
        .export(snapshot, sources);
      iframe.hidden = false;
      iframe.srcdoc = html;
      error.textContent = '';
      download.disabled = false;
    } catch (cause) {
      if (generation !== previewGeneration || !iframe.isConnected) return;
      error.textContent =
        cause instanceof Error
          ? cause.message
          : 'Die Vorschau konnte nicht erstellt werden.';
      iframe.hidden = false;
      iframe.srcdoc =
        '<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Vorschau noch nicht bereit</title></head><body><p>Bitte ergänze dein Geschenk oder bestätige die ausgewählten Quellen. Die Hinweise stehen neben dieser Vorschau.</p></body></html>';
      download.disabled = true;
    }
  }
  function downloadText(
    text: string,
    filename: string,
    type = 'text/html',
  ): void {
    const url = URL.createObjectURL(new Blob([text], { type }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function listen(
    id: string,
    event: string,
    handler: (event: Event) => void,
  ): void {
    root.querySelector(`#${id}`)?.addEventListener(event, handler);
  }
  function bind(): void {
    root
      .querySelectorAll<HTMLButtonElement>('[data-go]')
      .forEach((button) =>
        button.addEventListener('click', () => go(button.dataset.go as Step)),
      );
    listen('drafts', 'click', () =>
      root.querySelector<HTMLDialogElement>('#draft-dialog')!.showModal(),
    );
    listen('close-drafts', 'click', () => {
      importEpoch++;
      pendingImport = null;
      root.querySelector<HTMLDialogElement>('#draft-dialog')!.close();
    });
    listen('export-draft', 'click', async () => {
      try {
        const snapshot = structuredClone(project);
        const sources = await resolvePhotoSources(snapshot, assetStore, true);
        downloadText(
          writePortableDraft(snapshot, sources),
          'BES-Entwurf.json',
          'application/json',
        );
      } catch {
        message(
          'Dieser Entwurf konnte nicht vollständig gesichert werden. Bitte prüfe seine Fotos und Größe.',
        );
      }
    });
    listen('import-draft', 'change', (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      pendingImport = null;
      const summary = root.querySelector<HTMLElement>('#import-summary')!;
      const confirm = root.querySelector<HTMLButtonElement>('#confirm-import')!;
      confirm.hidden = true;
      if (!file) return;
      if (file.size > mediaBudget.maxPortableDraftBytes) {
        summary.textContent =
          'Diese Datei ist zu groß. Bitte verwende einen BES-Entwurf bis 8 MB.';
        return;
      }
      summary.textContent = 'Dein Entwurf wird geprüft …';
      const epoch = ++importEpoch;
      void file.text().then(
        async (raw) => {
          // Ignore a completed read if the user has already chosen a different file.
          if ((event.target as HTMLInputElement).files?.[0] !== file) return;
          try {
            const bundle = await readPortableDraft(raw);
            if (
              epoch !== importEpoch ||
              !summary.isConnected ||
              (event.target as HTMLInputElement).files?.[0] !== file
            )
              return;
            pendingImport = bundle;
            summary.textContent = `Geprüfter Entwurf für ${pendingImport.project.recipient.name || 'eine noch unbenannte Person'}. Beim Öffnen behalten wir dein aktuelles Geschenk in der Sammlung.`;
            confirm.hidden = false;
          } catch {
            summary.textContent =
              'Dieser Entwurf ist beschädigt oder nicht unterstützt. Dein Geschenk bleibt erhalten.';
          }
        },
        () => {
          summary.textContent = 'Diese Datei konnte nicht gelesen werden.';
        },
      );
    });
    const activate = (next: CreatorProject): void => {
      if (!replaceActiveProject(storage, project, next)) {
        root.querySelector<HTMLDialogElement>('#draft-dialog')!.close();
        message(
          'Der Wechsel konnte nicht sicher gespeichert werden. Die Sammlung kann voll oder nicht lesbar sein. Sichere dein Geschenk zuerst als Datei.',
        );
        return;
      }
      project = next;
      saved = true;
      pendingImport = null;
      undo = null;
      notice = 'Dein bisheriges Geschenk bleibt in „Meine Geschenke“ erhalten.';
      render(true);
    };
    listen('confirm-import', 'click', async () => {
      if (!pendingImport) return;
      const bundle = pendingImport;
      const next = structuredClone(bundle.project);
      next.id = crypto.randomUUID();
      try {
        if (bundle.assets.length) await assetStore.putMany(bundle.assets);
        if (pendingImport !== bundle) return;
        activate(next);
      } catch {
        root.querySelector<HTMLElement>('#import-summary')!.textContent =
          'Die Fotos konnten nicht sicher gespeichert werden. Dein aktuelles Geschenk bleibt erhalten.';
      }
    });
    listen('new-project', 'click', () => activate(createProject()));
    root
      .querySelectorAll<HTMLButtonElement>('[data-project]')
      .forEach((button) =>
        button.addEventListener('click', () => {
          try {
            const next = readLibrary(storage).find(
              (p) => p.id === button.dataset.project,
            );
            if (next) activate(next);
          } catch {
            message('Dieses Geschenk ist gerade nicht zugänglich.');
          }
        }),
      );
    listen('home', 'click', (event) => {
      event.preventDefault();
      go('start');
    });
    listen('start-form', 'submit', (event) => {
      event.preventDefault();
      project.mode = new FormData(event.target as HTMLFormElement).get(
        'mode',
      ) as 'quick' | 'deep';
      go('person');
    });
    listen('recipient-name', 'input', (event) => {
      project.recipient.name = (event.target as HTMLInputElement).value;
      persist();
    });
    listen('relationship', 'change', (event) => {
      const id = (event.target as HTMLSelectElement).value;
      project.relationship.typeId = id;
      project.relationship.uncertain = id === 'uncertain';
      project.relationship.dimensions.context =
        relationships.get(id)?.context ?? 'mixed';
      persist();
      render();
    });
    root
      .querySelectorAll<HTMLInputElement>('[data-dimension]')
      .forEach((input) =>
        input.addEventListener('input', () => {
          const key = input.dataset.dimension as
            'closeness' | 'formality' | 'trust' | 'humor' | 'emotionality';
          project.relationship.dimensions[key] = Number(input.value);
          persist();
        }),
      );
    listen('years-known', 'input', (event) => {
      const value = Number((event.target as HTMLInputElement).value);
      if (value >= 0 && value <= 150) {
        project.relationship.dimensions.yearsKnown = value;
        persist();
      }
    });
    listen('context', 'change', (event) => {
      project.relationship.dimensions.context = (
        event.target as HTMLSelectElement
      ).value as CreatorProject['relationship']['dimensions']['context'];
      persist();
    });
    listen('person-form', 'submit', (event) => {
      event.preventDefault();
      if (!project.recipient.name.trim()) {
        message('Bitte gib einen Namen ein.');
        return;
      }
      go('questions');
    });
    const saveAnswer = (
      status: 'answered' | 'skipped' | 'unknown',
      advance: boolean,
    ): void => {
      const id = project.workflow.questionId;
      const value = (
        root.querySelector<HTMLInputElement>('#answer')?.value ?? ''
      ).trim();
      const question = activeQuestions(project).find((q) => q.id === id)!;
      if (status === 'answered' && !value && advance) {
        message(
          'Ein kleiner Gedanke reicht. Du kannst die Frage auch überspringen.',
        );
        return;
      }
      project.answers[id] = {
        status: status === 'answered' && !value ? 'unknown' : status,
        value: status === 'answered' ? value : '',
      };
      if (id === 'tone' && status === 'answered' && value)
        project.relationship.dimensions.tone = value as
          'warm' | 'playful' | 'reserved';
      if (id === 'humor' && status === 'answered')
        project.relationship.dimensions.humor = value === 'yes' ? 4 : 0;
      if (
        question.type === 'choice' &&
        status === 'answered' &&
        !question.options?.some((option) => option.value === value)
      )
        return;
      persist();
      if (advance) {
        const list = activeQuestions(project);
        const index = list.findIndex((q) => q.id === id);
        if (index + 1 >= list.length) go('writing');
        else {
          project.workflow.questionId = list[index + 1].id;
          persist();
          render(true);
        }
      }
    };
    // Autosave in-progress answers too; transitions recompute the adaptive path.
    listen('answer', 'input', () => saveAnswer('answered', false));
    listen('question-form', 'submit', (event) => {
      event.preventDefault();
      saveAnswer('answered', true);
    });
    listen('unknown', 'click', () => saveAnswer('unknown', true));
    listen('skip', 'click', () => saveAnswer('skipped', true));
    listen('question-back', 'click', () => {
      const list = activeQuestions(project);
      const index = list.findIndex((q) => q.id === project.workflow.questionId);
      if (index <= 0) go('person');
      else {
        project.workflow.questionId = list[index - 1].id;
        persist();
        render(true);
      }
    });
    listen('writing-method', 'change', (event) => {
      project.writing.method = (event.target as HTMLSelectElement)
        .value as CreatorProject['writing']['method'];
      persist();
      render();
    });
    for (const field of ['letter', 'wish', 'surprise'] as const)
      listen(field, 'input', (event) => {
        project.writing[field] = (event.target as HTMLTextAreaElement).value;
        persist();
      });
    listen('writing-form', 'submit', (event) => {
      event.preventDefault();
      if (!project.writing.letter.trim()) {
        message(
          'Schreibe einen kleinen Brief oder nutze unseren Textvorschlag.',
        );
        return;
      }
      go('preview');
    });
    listen('guided', 'click', () => {
      root.querySelector<HTMLTextAreaElement>('#suggestion')!.value =
        writingHelpers.get('guided-letter')!.generate(project);
      root.querySelector<HTMLDialogElement>('#suggestion-dialog')!.showModal();
    });
    listen('cancel-suggestion', 'click', () =>
      root.querySelector<HTMLDialogElement>('#suggestion-dialog')!.close(),
    );
    listen('accept-suggestion', 'click', () => {
      project.writing.letter =
        root.querySelector<HTMLTextAreaElement>('#suggestion')!.value;
      persist();
      render();
      message('Textvorschlag übernommen. Du kannst jedes Wort ändern.');
    });
    listen('copy-prompt', 'click', () => {
      const prompt =
        root.querySelector<HTMLTextAreaElement>('#external-prompt')!;
      if (!navigator.clipboard) {
        prompt.select();
        message(
          'Bitte kopiere den markierten Text mit der Kopierfunktion deines Geräts.',
        );
        return;
      }
      void navigator.clipboard.writeText(prompt.value).then(
        () =>
          message(
            'Kopiert. Öffne deine bevorzugte KI und füge die Anweisung dort ein.',
          ),
        () => {
          prompt.select();
          message(
            'Bitte kopiere den markierten Text mit der Kopierfunktion deines Geräts.',
          );
        },
      );
    });
    const chooseDirection = (
      id: CreatorProject['experience']['directionId'],
    ): void => {
      project.experience.directionId = id;
      project.experience.themeId = directions.get(id)!.themeId;
      project.experience.blocks = orderForDirection(
        id,
        project.experience.blocks,
      );
      persist();
      render();
    };
    listen('direction', 'change', (event) =>
      chooseDirection(
        (event.target as HTMLSelectElement)
          .value as CreatorProject['experience']['directionId'],
      ),
    );
    listen('suggest-direction', 'click', () =>
      chooseDirection(
        recommendDirection(
          project,
        ) as CreatorProject['experience']['directionId'],
      ),
    );
    listen('intensity', 'input', (event) => {
      project.experience.intensity = Number(
        (event.target as HTMLInputElement).value,
      );
      root.querySelector<HTMLOutputElement>('#intensity-value')!.textContent =
        String(project.experience.intensity);
      persist();
      updatePreview();
    });
    listen('export-profile', 'change', (event) => {
      project.exportConfig.profile = (event.target as HTMLSelectElement)
        .value as 'offline' | 'online';
      project.exportConfig.externalMediaConsent = false;
      persist();
      render();
    });
    listen('external-consent', 'change', (event) => {
      project.exportConfig.externalMediaConsent = (
        event.target as HTMLInputElement
      ).checked;
      persist();
      updatePreview();
    });
    listen('integrations', 'click', () =>
      root.querySelector<HTMLDialogElement>('#integration-dialog')!.showModal(),
    );
    listen('close-integrations', 'click', () =>
      root.querySelector<HTMLDialogElement>('#integration-dialog')!.close(),
    );
    listen('director-json', 'input', () => {
      pendingDirector = null;
      root.querySelector<HTMLButtonElement>('#apply-director')!.hidden = true;
    });
    listen('review-director', 'click', () => {
      const review = root.querySelector<HTMLElement>('#director-review')!;
      const apply = root.querySelector<HTMLButtonElement>('#apply-director')!;
      pendingDirector = null;
      apply.hidden = true;
      try {
        pendingDirector = parseDirectorProposal(
          root.querySelector<HTMLTextAreaElement>('#director-json')!.value,
          project,
        );
        review.textContent = `Geprüfter Vorschlag: ${directions.get(pendingDirector.directionId)!.label}, Bewegung ${pendingDirector.intensity}/3, Thema ${themes.get(pendingDirector.themeId)!.label}.
Reihenfolge: ${pendingDirector.blockOrder.join(' → ')}
Private Fragen zum Nachdenken (werden nicht automatisch hinzugefügt):
${pendingDirector.followUpQuestions.join('\n') || 'Keine weiteren Fragen.'}`;
        apply.hidden = false;
      } catch {
        review.textContent =
          'Dieser Vorschlag ist nicht gültig oder passt nicht zu deinem Geschenk. Bitte verwende die angegebenen Einstellungen und vorhandenen Bausteine. Nichts wurde geändert.';
      }
    });
    listen('apply-director', 'click', () => {
      if (!pendingDirector) return;
      try {
        undo = structuredClone(project);
        project = applyDirectorProposal(project, pendingDirector);
        pendingDirector = null;
        persist();
        render(true);
        message(
          'Die geprüfte Stimmung und Reihenfolge wurden übernommen. Du kannst alles selbst ändern oder rückgängig machen.',
        );
      } catch {
        message(
          'Der Vorschlag passt nicht mehr zum aktuellen Geschenk. Bitte prüfe ihn erneut.',
        );
      }
    });
    listen('theme', 'change', (event) => {
      project.experience.themeId = (event.target as HTMLSelectElement).value;
      persist();
      updatePreview();
    });
    root.querySelectorAll<HTMLInputElement>('[data-block]').forEach((input) =>
      input.addEventListener('change', () => {
        project.experience.blocks.find(
          (b) => b.id === input.dataset.block,
        )!.enabled = input.checked;
        persist();
        updatePreview();
      }),
    );
    root.querySelectorAll<HTMLButtonElement>('[data-move]').forEach((button) =>
      button.addEventListener('click', () => {
        const index = project.experience.blocks.findIndex(
          (b) => b.id === button.dataset.move,
        );
        const next = index + Number(button.dataset.direction);
        if (next < 0 || next >= project.experience.blocks.length) return;
        [project.experience.blocks[index], project.experience.blocks[next]] = [
          project.experience.blocks[next],
          project.experience.blocks[index],
        ];
        persist();
        render();
      }),
    );
    listen('recommend', 'click', () => {
      project.experience.blocks = recommendBlocks(project);
      persist();
      render();
    });
    listen('download', 'click', async () => {
      try {
        const snapshot = structuredClone(project);
        const sources = await resolvePhotoSources(snapshot, assetStore);
        downloadText(
          exporters
            .get(snapshot.exportConfig.exporterId)!
            .export(snapshot, sources),
          exportFilename(snapshot.recipient.name),
        );
        message(
          'Dein Geschenk wurde als HTML-Datei heruntergeladen. Öffne sie zum Prüfen im Browser.',
        );
      } catch (cause) {
        message(
          cause instanceof Error
            ? cause.message
            : 'Bitte prüfe deine Bausteine.',
        );
      }
    });
    listen('reset', 'click', () =>
      root.querySelector<HTMLDialogElement>('#reset-dialog')!.showModal(),
    );
    listen('cancel-reset', 'click', () =>
      root.querySelector<HTMLDialogElement>('#reset-dialog')!.close(),
    );
    listen('confirm-reset', 'click', () => {
      try {
        const raw = storage.getItem(STORAGE_KEY);
        if (raw) storage.setItem(`${STORAGE_KEY}.backup`, raw);
      } catch {
        message(
          'Die Sicherung ist gerade nicht möglich. Dein bisheriger Entwurf bleibt erhalten.',
        );
        root.querySelector<HTMLDialogElement>('#reset-dialog')!.close();
        return;
      }
      undo = protectedDraft ? null : structuredClone(project);
      protectedDraft = false;
      project = createProject();
      persist();
      notice =
        'Ein neues Geschenk ist bereit. Die bisherigen Daten wurden lokal gesichert.';
      render(true);
    });
    listen('undo-reset', 'click', () => {
      if (undo) {
        project = undo;
        undo = null;
        persist();
        notice = 'Dein vorheriges Geschenk ist wieder da.';
        render(true);
      }
    });
    listen('backup', 'click', () => {
      try {
        downloadText(
          storage.getItem(STORAGE_KEY) ?? '',
          'BES-Entwurf-Sicherung.json',
          'application/json',
        );
      } catch {
        message('Die gespeicherten Daten sind gerade nicht zugänglich.');
      }
    });
  }
  render();
}
