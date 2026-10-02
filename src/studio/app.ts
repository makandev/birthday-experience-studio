import { isIosDevice } from './delivery';
import { exportRecipientFile } from '../export/recipient-file';
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
import { createMagicStart, publicBirthdayLetter } from '../engines/magic-start';
import type { SceneId } from '../engines/scenes';
import { STORAGE_KEY, type StorageLike } from '../persistence/storage';
import {
  readPortableDraft,
  writePortableDraft,
  type DraftBundle,
} from '../media/portable';
import { BrowserAssetStore } from '../media/store';
import { resolvePhotoSources } from '../media/resolve';
import { mediaBudget } from '../media/budgets';
import { MediaController } from './media';
import {
  WorkspaceRepository,
  StorageConflict,
  ProtectedStorage,
  type Workspace,
  type WorkspaceChange,
} from '../persistence/workspace';
import { WorkspaceNotifications } from '../persistence/notifications';
import { writeDraft } from '../persistence/drafts';
import type { MediaAsset } from '../media/store';
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
export async function mountStudio(root: HTMLDivElement): Promise<void> {
  const storage = storageAccess();
  root.innerHTML =
    '<p role="status">Deine lokal gespeicherten Geschenke werden geprüft …</p>';
  const repository = new WorkspaceRepository();
  let workspace: Workspace | undefined;
  let initialError: unknown;
  try {
    workspace = await repository.initialize(storage);
  } catch (cause) {
    initialError = cause;
  }
  let project =
    workspace?.entries.find((entry) => entry.project.id === workspace?.activeId)
      ?.project ?? createProject();
  let protectedDraft = initialError instanceof ProtectedStorage;
  let saved = Boolean(workspace);
  let conflict = false;
  let pendingDelete: string | null = null;
  let writeQueue: Promise<void> = Promise.resolve();
  let queuedWrites = 0;
  const notifications = new WorkspaceNotifications(() => {
    void checkRemote();
  });
  window.addEventListener('pagehide', () => notifications.close(), {
    once: true,
  });
  let undo: CreatorProject | null = null;
  let creatorMoment: 'opening' | 'personal' | 'photo' | 'full' = 'full';
  let previewScene: SceneId = 'opening';
  let detailBase: CreatorProject | null = null;
  let pendingImport: DraftBundle | null = null;
  let previewGeneration = 0;
  let importEpoch = 0;
  const assetStore = new BrowserAssetStore();
  const mediaController = new MediaController(assetStore, {
    getProject: () => project,
    changed: async (assets = []) => {
      if (project.workflow.step === 'preview')
        previewScene = project.media.some((m) => m.kind === 'image')
          ? 'moments'
          : 'opening';
      await persist(assets);
      render();
    },
    edited: () => persist(),
    message,
    beforeRemoval: () => {
      undo = structuredClone(project);
    },
  });
  let pendingDirector: DirectorProposal | null = null;
  let notice = protectedDraft
    ? 'Dein gespeicherter Entwurf konnte nicht gelesen werden. Er bleibt unverändert. Sichere ihn oder beginne bewusst neu.'
    : initialError
      ? 'Dein Browser erlaubt gerade kein lokales Speichern. Lass diese Seite offen, damit deine Eingaben erhalten bleiben.'
      : '';
  function saveStatus(): void {
    const text = conflict
      ? 'Konflikt – Änderungen bleiben nur in diesem Tab'
      : queuedWrites
        ? 'Wird auf diesem Gerät gespeichert …'
        : saved
          ? 'Auf diesem Gerät gespeichert'
          : 'Speichern nicht möglich – Seite bitte offen lassen';
    root
      .querySelectorAll('#save-status, #magic-save-status')
      .forEach((status) => {
        status.textContent = text;
      });
  }
  function failed(cause: unknown): void {
    saved = false;
    if (cause instanceof StorageConflict) {
      conflict = true;
      root
        .querySelectorAll<HTMLDialogElement>('dialog[open]')
        .forEach((dialog) => dialog.close());
      message(
        'Ein anderer Tab hat neuere Daten gespeichert oder ein Geschenk gelöscht. Deine Eingaben bleiben hier; sichere sie vor der Übernahme.',
      );
      root.querySelector<HTMLElement>('#conflict-panel')!.hidden = false;
    } else
      message(
        cause instanceof Error
          ? cause.message
          : 'Speichern nicht möglich – Seite bitte offen lassen',
      );
    saveStatus();
  }
  function commit(
    change: WorkspaceChange,
    assets: MediaAsset[] = [],
  ): Promise<void> {
    const operation = writeQueue.then(async () => {
      if (conflict) throw new Error('Bitte löse zuerst den Speicherkonflikt.');
      if (!workspace)
        throw new Error(
          'Fotos können in diesem Browser gerade nicht gespeichert werden. Sichere deinen Text als Datei.',
        );
      const result = await repository.commit(
        workspace.revision,
        change,
        assets,
      );
      workspace = result.workspace;
      notifications.publish();
    });
    writeQueue = operation.catch((cause) => {
      failed(cause);
    });
    return operation;
  }
  function persist(assets: MediaAsset[] = []): Promise<void> {
    if (protectedDraft || conflict || !workspace) {
      saved = false;
      saveStatus();
      return assets.length
        ? Promise.reject(
            new Error('Fotos können gerade nicht gespeichert werden.'),
          )
        : Promise.resolve();
    }
    project.updatedAt = new Date().toISOString();
    const snapshot = structuredClone(project);
    const recovery =
      undo?.id === project.id ? structuredClone(undo) : undefined;
    queuedWrites++;
    saved = false;
    saveStatus();
    const operation = commit(
      { kind: 'save', project: snapshot, recovery },
      assets,
    );
    // Ordinary autosave reports failures without unhandled rejections. Asset import needs rollback.
    const finished = operation
      .then(() => {
        saved = true;
      })
      .finally(() => {
        queuedWrites--;
        saveStatus();
      });
    return assets.length ? finished : finished.catch(() => {});
  }
  async function checkRemote(): Promise<void> {
    await writeQueue;
    if (!workspace || conflict) return;
    try {
      const latest = await repository.read();
      if (!latest || latest.revision > workspace.revision) {
        if (latest) failed(new StorageConflict(latest));
        else {
          conflict = true;
          failed(
            new Error(
              'Die lokale Sammlung fehlt. Sichere diesen Tab vor dem Neuladen.',
            ),
          );
          root.querySelector<HTMLElement>('#conflict-panel')!.hidden = false;
        }
      }
    } catch (cause) {
      failed(cause);
    }
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
    if (step === 'preview') {
      creatorMoment = 'full';
      previewScene = 'opening';
      syncComposition(project);
    }
    persist();
    render(true);
  }
  function canMagicStart(): boolean {
    return (
      !project.experience.blocks.length &&
      !project.writing.wish.trim() &&
      !project.writing.surprise.trim()
    );
  }
  function vibeChoices(): string {
    return `<fieldset class="vibe-chips"><legend>Welche Stimmung passt?</legend>${directions
      .all()
      .map(
        (d) =>
          `<label><input type="radio" name="magic-vibe" id="magic-vibe-${d.id}" value="${d.id}" ${project.experience.directionId === d.id ? 'checked' : ''}><span>${e(d.label)}</span></label>`,
      )
      .join('')}</fieldset>`;
  }
  function startPage(): string {
    return `<div class="hero-copy"><p class="eyebrow">Dein Mensch. Ein besonderer Moment.</p><h1>Für wen machen wir<br><em>etwas Schönes?</em></h1><p class="lead">Ein Name genügt für den Anfang. Gleich siehst du, wie dein Geschenk beginnt.</p>${
      canMagicStart()
        ? `<form id="magic-form" class="first-start"><label for="magic-name">Wie heißt die Geburtstagsperson?</label><input id="magic-name" maxlength="120" required autocomplete="off" placeholder="Zum Beispiel Anna" value="${e(project.recipient.name)}"><label for="magic-relationship">Was verbindet euch?</label><select id="magic-relationship">${relationships
            .all()
            .map(
              (r) =>
                `<option value="${e(r.id)}" ${r.id === project.relationship.typeId ? 'selected' : ''}>${e(r.label)}</option>`,
            )
            .join(
              '',
            )}</select>${vibeChoices()}<p id="magic-error" role="alert"></p>${primary('Meinen ersten Moment ansehen')}</form>`
        : '<button class="button primary" data-go="preview">Geschenk weitergestalten →</button>'
    }<p class="privacy-line">Nur auf deinem Gerät. Keine Anmeldung. Keine KI nötig.<br>Persönliche Details und Fotos kannst du später ergänzen.</p></div><aside class="hero-art" aria-label="Ein persönlicher Geburtstagsmoment"><span class="art-star star-one" aria-hidden="true">✦</span><div class="gift-paper"><p class="eyebrow">Ein Moment nur für dich</p><span class="paper-flower" aria-hidden="true">${flower}</span><h2>Heute darf es<br>besonders sein.</h2><p>Ein kleiner Weg.<br>Deine Worte. Eine Überraschung.<br>Und ein Abschluss zum Erinnern.</p><div class="paper-line"></div><span class="paper-sign">Persönlich gemacht</span></div></aside>`;
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
    return `<div class="section-head compact"><p class="eyebrow">02 · Eure Geschichte</p><h1>Die kleinen Dinge<br>machen es persönlich.</h1><p>Deine Antworten bleiben im Studio. Erst dein fertiger Geschenktext wird verschenkt.</p></div><form id="question-form" class="panel question-panel"><label for="question-mode">Wie viel Raum möchtest du eurer Geschichte geben?</label><select id="question-mode"><option value="quick" ${project.mode === 'quick' ? 'selected' : ''}>Quick · drei freiwillige Fragen</option><option value="deep" ${project.mode === 'deep' ? 'selected' : ''}>Deep · mehr persönliche Fragen</option></select><div class="question-meta"><span>Frage ${index + 1} von aktuell ${list.length}</span><span>${progress.done} beantwortet oder übersprungen</span></div><progress value="${progress.done}" max="${progress.total}" aria-label="Fragenfortschritt"></progress><label class="question-title" for="answer">${e(question.prompt)}</label>${question.type === 'choice' ? `<select id="answer"><option value="">Bitte auswählen</option>${question.options!.map((option) => `<option value="${e(option.value)}" ${answer?.value === option.value ? 'selected' : ''}>${e(option.label)}</option>`).join('')}</select>` : `<textarea id="answer" rows="5" maxlength="20000" placeholder="Ein Gedanke oder ein Satz reicht …">${e(answer?.value ?? '')}</textarea>`}<details class="help"><summary>Hilf mir dabei · Beispiele anzeigen</summary><p>${e(question.help)}</p>${question.examples.map((example) => `<blockquote>${e(example)}</blockquote>`).join('')}</details><div class="gentle-actions"><button type="button" class="text-button" id="unknown">Ich weiß es nicht</button><button type="button" class="text-button" id="skip">Frage überspringen</button></div><div class="actions"><button class="button quiet" type="button" id="question-back">Zurück</button>${primary(index === list.length - 1 ? 'Weiter zu meinen Worten' : 'Nächste Frage')}</div><button type="button" class="text-button finish-questions" data-go="writing">Ich möchte jetzt schreiben</button></form>`;
  }
  function writingPage(): string {
    return `<div class="section-head"><p class="eyebrow">03 · Deine Worte</p><h1>Es muss nicht perfekt sein.<br>Es muss von dir kommen.</h1><p class="lead">Alles in den folgenden Textfeldern kann im Geschenk sichtbar werden.</p></div><div class="writing-layout"><form id="writing-form" class="panel"><label for="writing-method">Wie möchtest du anfangen?</label><select id="writing-method"><option value="guided" ${project.writing.method === 'guided' ? 'selected' : ''}>Mit ein bisschen Hilfe</option><option value="self" ${project.writing.method === 'self' ? 'selected' : ''}>Ich schreibe selbst</option><option value="external" ${project.writing.method === 'external' ? 'selected' : ''}>Optional: Hilfe einer externen KI</option></select>${project.writing.method === 'guided' ? `<div class="writing-help"><p>„Was ich an dir schätze …“<br>„Ich werde nie vergessen, wie wir …“<br>„Für dein neues Lebensjahr wünsche ich dir …“</p><button type="button" class="button secondary" id="guided">Antworten als Textvorschlag übernehmen</button><small>Du entscheidest, was bleibt. Der Vorschlag wird nicht automatisch ins Geschenk übernommen.</small></div>` : ''}${project.writing.method === 'external' ? `<details class="external-help" open><summary>So funktioniert die freiwillige KI-Hilfe</summary><ol><li>Lies unten die vollständige Anweisung.</li><li>Kopiere sie und füge sie in deine bevorzugte KI ein.</li><li>Kopiere deren Antwort hier in deinen Brief.</li><li>Prüfe den Text und entferne alles, was privat bleiben soll.</li></ol><p><strong>Die Anweisung enthält deinen Namen für die Geburtstagsperson und deine aktiven Antworten, auch persönliche Grenzen.</strong> Durch manuelles Einfügen gibst du diese Informationen an den gewählten Dienst weiter. Das Studio sendet nichts.</p><label for="external-prompt">Das würdest du weitergeben</label><textarea id="external-prompt" rows="8" readonly>${e(writingHelpers.get('external-prompt')!.generate(project))}</textarea><button type="button" class="button secondary" id="copy-prompt">Prompt kopieren</button></details>` : ''}<label for="letter">Dein persönlicher Brief <span class="badge">Im Geschenk sichtbar</span></label><textarea id="letter" rows="9" maxlength="20000" required placeholder="Liebe/r ${e(project.recipient.name)}, …">${e(project.writing.letter)}</textarea><label for="wish">Dein Geburtstagswunsch <span class="optional">optional</span></label><textarea id="wish" rows="3" maxlength="20000" placeholder="Für dein neues Lebensjahr wünsche ich dir …">${e(project.writing.wish)}</textarea><label for="surprise">Eine kleine Überraschung <span class="optional">optional</span></label><textarea id="surprise" rows="3" maxlength="20000" placeholder="Zum Beispiel: Ich lade dich zu einem gemeinsamen Frühstück ein!">${e(project.writing.surprise)}</textarea><p class="field-help">Diese Nachricht öffnet die Geburtstagsperson mit einem Klick.</p>${mediaController.panel(project)}<div class="actions"><button type="button" class="button quiet" data-go="questions">Zurück</button>${primary('Mein Geschenk ansehen')}</div></form><aside class="side-note"><span aria-hidden="true">✧</span><h2>Deine Worte zählen.</h2><p>Ein einfacher, ehrlicher Satz ist oft schöner als der perfekte Text.</p><p>Private Antworten, Hintergrundinformationen und die KI-Anweisung gehören nicht zum Export. Prüfe trotzdem, was du in deinen Brief übernimmst.</p></aside></div><dialog id="suggestion-dialog" aria-labelledby="suggestion-title"><h2 id="suggestion-title">Dein Textvorschlag</h2><p>Hier werden ausgewählte Antworten zu Geschenktext. Prüfe sie, bevor du sie übernimmst.</p><textarea id="suggestion" rows="10" maxlength="20000"></textarea><div class="actions"><button type="button" class="button quiet" id="cancel-suggestion">Abbrechen</button><button type="button" class="button primary" id="accept-suggestion">In meinen Brief übernehmen</button></div></dialog>`;
  }
  function detailDialog(): string {
    return `<dialog id="detail-dialog" aria-labelledby="detail-title"><h2 id="detail-title">Ein persönlicher Satz – wenn du magst.</h2><p>Eine Erinnerung, ein Dankeschön oder ein Wunsch. Nur was du verschenken möchtest.</p><form id="detail-form"><label for="public-detail">Dein persönlicher Satz <span class="badge">Im Geschenk sichtbar</span></label><textarea id="public-detail" rows="4" maxlength="2000" placeholder="Zum Beispiel: Unser verregneter Ausflug bringt mich immer noch zum Lächeln."></textarea><div class="detail-chips"><button type="button" data-seed="Ich wünsche dir Zeit für das, was dir gut tut.">Zeit für dich</button><button type="button" data-seed="Danke, dass es dich gibt.">Ein herzliches Danke</button><button type="button" data-seed="Ich wünsche dir viele kleine Glücksmomente.">Glücksmomente</button></div><p class="field-help">Deine Worte werden lokal gespeichert. Private Frageantworten werden nicht übernommen.</p><p id="detail-error" role="alert"></p><div class="actions"><button type="button" class="button quiet" id="skip-detail">Ohne weiteren Satz weiter</button>${primary('Meine Worte ansehen')}</div></form></dialog>`;
  }
  function previewPage(): string {
    const settings = `${directionControls()}<details id="appearance-settings" class="advanced"><summary>Bewegung und Farben anpassen</summary>${intensityControls()}<label for="theme">Welche Farben passen?</label><select id="theme">${themes
      .all()
      .map(
        (theme) =>
          `<option value="${e(theme.id)}" ${project.experience.themeId === theme.id ? 'selected' : ''}>${e(theme.label)}</option>`,
      )
      .join(
        '',
      )}</select></details><details id="block-settings" class="advanced"><summary>Inhalt und Reihenfolge ändern</summary><h2>Deine Bausteine</h2><p class="field-help">Du entscheidest, was vorkommt. Die Reihenfolge gilt innerhalb der jeweiligen Station; der Geschenkweg bleibt gestuft.</p><ul class="block-list">${project.experience.blocks.map((block, index) => `<li><label><input id="block-${e(block.id)}" type="checkbox" data-block="${e(block.id)}" ${block.enabled ? 'checked' : ''}>${e(blocks.get(block.type)?.label ?? `Unbekannter Baustein (${block.type})`)}</label><div><button class="icon-button" type="button" id="up-${e(block.id)}" data-move="${e(block.id)}" data-direction="-1" aria-label="${e(blocks.get(block.type)?.label ?? block.type)} nach oben" ${index === 0 ? 'disabled' : ''}>↑</button><button class="icon-button" type="button" id="down-${e(block.id)}" data-move="${e(block.id)}" data-direction="1" aria-label="${e(blocks.get(block.type)?.label ?? block.type)} nach unten" ${index === project.experience.blocks.length - 1 ? 'disabled' : ''}>↓</button></div></li>`).join('')}</ul><button class="text-button" id="recommend">Vorschlag wiederherstellen</button><p class="field-help">Aktiviert die ausgefüllten Bausteine und setzt ihre Reihenfolge zurück.</p></details>${profileControls()}<button class="text-button" id="integrations">Optionale Hilfe &amp; Regie-Ideen</button><div class="export-note"><strong>Ein Geschenk zum Mitnehmen</strong><p>Du erhältst eine einzelne HTML-Datei. Sie lässt sich im Browser öffnen, auch ohne Internet. Zum Verschenken als Datei verschicken.</p></div>`;
    const titles = {
      opening: 'Dein erster Moment.',
      personal: 'Deine Worte machen den Unterschied.',
      photo: 'Ein Foto – nur wenn du magst.',
      full: 'Dein vollständiges Geburtstagsgeschenk.',
    };
    const nextLabel = {
      opening: 'Gefällt mir',
      personal: 'Gefällt mir',
      photo: project.media.some((m) => m.kind === 'image')
        ? 'Fotos passen – weiter'
        : 'Ohne Foto weiter',
      full: 'Gefällt mir',
    };
    return `<div class="section-head compact"><p class="eyebrow">Gemeinsam gestalten · ${creatorMoment === 'full' ? 'Dein Geschenk' : 'Schritt ' + { opening: 1, personal: 2, photo: 3, full: 4 }[creatorMoment] + ' von 4'}</p><h1>${titles[creatorMoment]}</h1><p>Das ist die echte Empfängeransicht mit Stationen, Atmosphäre und Überraschungen. Du bestimmst, wie viel du ergänzen möchtest.</p></div><div class="preview-first-layout"><section class="panel preview-review" aria-label="Gemeinsam weitergestalten"><div class="review-actions"><button class="button primary" id="confirm-view" ${creatorMoment === 'full' ? 'hidden' : ''}>${nextLabel[creatorMoment]}</button><button class="button secondary" id="change-view">Anders machen</button><button class="button secondary" id="surprise-view">Überrasch mich</button><button class="text-button" id="full-preview" ${creatorMoment === 'full' ? 'hidden' : ''}>Direkt das ganze Geschenk ansehen</button></div><div id="review-vibes" hidden>${directions
      .all()
      .map(
        (d) =>
          `<button class="button quiet" data-review-direction="${d.id}">${e(d.label)}</button>`,
      )
      .join(
        '',
      )}</div>${creatorMoment === 'photo' ? mediaController.panel(project) : ''}<p class="field-help">Alles bleibt veränderbar. Varianten behalten deinen Text und deine Fotos; Rückgängig ist verfügbar.</p></section><div class="preview-frame-wrap"><p class="preview-label">${previewScene === 'letter' ? 'Deine persönlichen Worte · im Geschenk erst später enthüllt' : 'Empfängeransicht · ohne private Studio-Daten'}</p><p id="preview-error" role="alert"></p><iframe id="gift-preview" title="Vorschau des Geburtstagsgeschenks" sandbox="allow-scripts"></iframe></div><section class="panel finish-controls"><button class="button primary full" id="download" ${creatorMoment === 'full' ? '' : 'hidden'}>Geschenk als HTML sichern ↓</button><p class="field-help">Im Offline-Profil enthält diese eine HTML-Datei dein komplettes Geschenk: Text, Fotos, Gestaltung und Interaktionen. Keine BES-Seite, kein Upload und keine Anmeldung nötig.</p>${isIosDevice(navigator) ? '<p class="field-help">iPhone-Hinweis: HTML-Vorschauen in WhatsApp und „Dateien“ reagieren möglicherweise nicht auf Tippen. Dieses Öffnungsproblem ist noch ungelöst; die eigenständige HTML-Datei bleibt dein Geschenk.</p>' : ''}<details id="iphone-delivery"><summary>Optionale iPhone-Lesehilfe · experimentell</summary><p>Diese zusätzliche Lesehilfe ist freiwillig und ersetzt nicht dein HTML-Geschenk. Falls du sie ausprobieren möchtest, kannst du dafür eine separate Empfänger-Datei sichern. Echte iPhone-Validierung steht noch aus.</p><p>1. Die Geschenkdatei sichern und mit dem Safari-Link verschicken.<br>2. In WhatsApp oder Mail: die Datei über „Teilen“ in „Dateien“ sichern.<br>3. Die Empfängerperson öffnet <a href="https://makandev.github.io/birthday-experience-studio/#gift" target="_blank" rel="noopener noreferrer">den BES-Geschenköffner in Safari</a> und wählt die gespeicherte Datei. Nicht die HTML-Vorschau in WhatsApp oder „Dateien“ verwenden.</p><p class="field-help">Die Seite muss zuerst laden; das Geschenk wird nur lokal gelesen, nicht hochgeladen. Keine Pflichtcloud für den HTML-Export. Echte iPhone-Validierung steht noch aus – noch keine Release-Freigabe.</p><button class="button secondary" id="recipient-export">Empfänger-Datei für Safari sichern</button><button class="button quiet" id="recipient-share" hidden>Empfänger-Datei teilen</button><p class="field-help">Safari-Dateien brauchen das Offline-Profil mit eingebetteten Fotos. Die HTML-Datei bleibt für Browser verfügbar, die sie interaktiv öffnen können.</p></details><div class="review-actions"><button class="button quiet" id="add-detail">Eine Erinnerung ergänzen</button><button class="button quiet" id="add-photo">Fotos ergänzen</button><button class="text-button" data-go="questions">Mehr erzählen · freiwillig</button></div><details id="manual-preview"><summary>Text, Farben und weitere Details selbst bearbeiten</summary><button class="button quiet full" type="button" data-go="writing">Text bearbeiten &amp; Fotos ergänzen</button><aside class="gift-settings">${settings}</aside></details></section></div>${detailDialog()}`;
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
    const collection = workspace?.entries.map((entry) => entry.project) ?? [];
    const libraryError = workspace
      ? ''
      : 'Die gespeicherte Sammlung ist gerade nicht zugänglich. Sie bleibt unverändert.';
    return `<dialog id="draft-dialog" aria-labelledby="draft-title"><h2 id="draft-title">Deine Geschenke behalten</h2><p>Eine Entwurfsdatei enthält auch deine privaten Antworten und Geschenk-Fotokopien. Ursprüngliche Originalfotos bleiben nur auf diesem Gerät und können dort separat gesichert werden. Bewahre sie sicher auf und verschicke zum Verschenken nur die fertige HTML-Datei.</p><button class="button secondary" id="export-draft">Entwurf als Datei sichern</button><label for="import-draft">Gesicherten BES-Entwurf öffnen</label><input id="import-draft" type="file" accept=".json,application/json"><p class="field-help">Maximal 8 MB mit Fotokopien (Textanteil bis 2 MB). Dein aktuelles Geschenk bleibt bis zur Bestätigung unverändert.</p><p id="import-summary" role="status"></p><button class="button primary" id="confirm-import" hidden>Geprüften Entwurf öffnen</button><button class="text-button" data-delete-project="${e(project.id)}">Aktuelles Geschenk löschen</button><button class="text-button" id="cleanup-storage">Unbenutzte Fotodaten bereinigen</button><h3>Auf diesem Gerät behaltene Geschenke</h3><p>${e(libraryError)}</p><ul class="saved-projects">${collection
      .filter((p) => p.id !== project.id)
      .map(
        (p) =>
          `<li><span>${e(p.recipient.name || 'Noch ohne Namen')}</span><button class="button quiet" data-project="${e(p.id)}">Geschenk öffnen</button><button class="text-button" data-delete-project="${e(p.id)}">Geschenk löschen</button></li>`,
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
    root.innerHTML = `<header class="site-header"><a class="brand" href="#" id="home"><span class="brand-mark" aria-hidden="true">${flower}</span><span>Birthday<br><strong>Experience Studio</strong></span></a><span class="version">Früher Entwicklungsstand · 0.2</span><span id="save-status" role="status">${protectedDraft ? 'Gespeicherten Entwurf nicht verändert' : saved ? 'Auf diesem Gerät gespeichert' : 'Deine Daten bleiben auf diesem Gerät'}</span></header><nav class="step-nav" aria-label="Geschenk gestalten"><ol>${steps.map((step, index) => `<li><button data-go="${step.id}" ${step.id === project.workflow.step ? 'aria-current="step"' : ''} ${protectedDraft || (index > 1 && !project.recipient.name.trim()) ? 'disabled' : ''}><span class="step-number" aria-hidden="true">${index < stepIndex ? '✓' : index + 1}</span><span>${step.short}</span></button></li>`).join('')}</ol></nav><div id="notice" class="notice ${notice ? 'visible' : ''}" role="status">${e(notice)}</div>${protectedDraft ? '<div class="blocked-draft panel"><h1>Dein vorhandener Entwurf bleibt geschützt.</h1><p>Diese Version kann ihn nicht öffnen. Sichere die gespeicherten Daten, bevor du neu anfängst.</p><button class="button secondary" id="backup">Gespeicherte Daten sichern</button></div>' : `<main id="main" class="${project.workflow.step === 'start' ? 'hero' : 'workspace'}">${page()}</main>`}<footer class="site-footer"><span>Persönlich gemacht. Privat gespeichert.</span><div><button class="text-button" id="drafts" ${protectedDraft ? 'disabled' : ''}>Meine Geschenke &amp; Sicherung</button>${undo ? '<button class="text-button" id="undo-reset">Letzte Änderung rückgängig machen</button>' : ''}<button class="text-button" id="reset">Neu anfangen</button></div></footer><section id="conflict-panel" class="panel" role="alert" ${conflict ? '' : 'hidden'}><h2>Deine Geschenke wurden in einem anderen Tab geändert</h2><p>Dieser Tab überschreibt keine neueren Daten. Sichere zuerst deine Eingaben; danach kannst du den aktuellen gespeicherten Stand übernehmen. Bei gelöschten Fotos kann nur der Text gesichert werden.</p><button class="button secondary" id="conflict-backup">Eingaben dieses Tabs sichern</button><button class="button primary" id="conflict-reload">Gespeicherten Stand übernehmen</button></section>${draftDialog()}${integrationDialog()}<dialog id="delete-dialog" aria-labelledby="delete-title"><h2 id="delete-title">Dieses Geschenk endgültig löschen?</h2><p>Private Antworten, Geschenktext und die Wiederherstellung dieses Geschenks werden gelöscht. Originalfotos und Fotokopien werden nur gelöscht, wenn kein anderes Geschenk sie benötigt. Sichere wichtige Daten vorher als Datei. Diese Löschung kann nicht rückgängig gemacht werden.</p><button class="button quiet" id="cancel-delete">Geschenk behalten</button><button class="button primary" id="confirm-delete">Endgültig löschen</button></dialog><dialog id="cleanup-dialog" aria-labelledby="cleanup-title"><h2 id="cleanup-title">Unbenutzte Fotodaten endgültig entfernen?</h2><p>Dadurch endet die lokale Rückgängig-Möglichkeit für alle Geschenke. Nur Fotos ohne verbleibende Projektreferenz werden gelöscht. Sichere wichtige Originale vorher.</p><button class="button quiet" id="cancel-cleanup">Fotodaten behalten</button><button class="button primary" id="confirm-cleanup">Fotodaten bereinigen</button></dialog><dialog id="reset-dialog" aria-labelledby="reset-title"><h2 id="reset-title">Ein neues Geschenk beginnen?</h2><p>Dein aktueller Entwurf wird ersetzt. Wir sichern die bisherigen Daten lokal. In „Meine Geschenke“ kannst du außerdem mehrere Geschenke behalten. Du kannst den Neustart bis zum Neuladen rückgängig machen.</p><div class="actions"><button type="button" class="button quiet" id="cancel-reset">Entwurf behalten</button><button type="button" class="button primary" id="confirm-reset">Neues Geschenk beginnen</button></div></dialog>`;
    for (const details of root.querySelectorAll<HTMLDetailsElement>(
      'details[id]',
    )) {
      const wasOpen = openDetails.get(details.id);
      if (wasOpen !== undefined) details.open = wasOpen;
    }
    bind();
    saveStatus();
    mediaController.bind(root);
    if (project.workflow.step === 'preview' && !protectedDraft)
      updatePreview(focus);
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
  let preparedHtml = '';
  let preparedHtmlFilename = '';
  let preparedRecipientFile: File | null = null;
  let preparedRecipientRaw = '';

  async function updatePreview(showResult = false): Promise<void> {
    const generation = ++previewGeneration;
    const snapshot = structuredClone(project);
    const iframe = root.querySelector<HTMLIFrameElement>('#gift-preview')!;
    const error = root.querySelector<HTMLElement>('#preview-error')!;
    const download = root.querySelector<HTMLButtonElement>('#download')!;
    download.disabled = true;
    preparedHtml = '';
    preparedHtmlFilename = '';
    preparedRecipientFile = null;
    preparedRecipientRaw = '';
    const recipientExport =
      root.querySelector<HTMLButtonElement>('#recipient-export')!;
    const share = root.querySelector<HTMLButtonElement>('#recipient-share')!;
    recipientExport.disabled = true;
    share.hidden = true;
    try {
      const sources = await resolvePhotoSources(snapshot, assetStore);
      if (generation !== previewGeneration || !iframe.isConnected) return;
      const html = exporters
        .get(snapshot.exportConfig.exporterId)!
        .export(snapshot, sources, previewScene);
      iframe.hidden = false;
      iframe.onload = showResult
        ? () => {
            if (generation === previewGeneration && iframe.isConnected)
              iframe.scrollIntoView({ block: 'start', behavior: 'instant' });
          }
        : null;
      iframe.srcdoc = html;
      error.textContent = '';
      // Prepare full opening-first output before the intentional download tap.
      // Never reuse a preview-only late scene or await storage in that gesture.
      preparedHtml = exporters
        .get(snapshot.exportConfig.exporterId)!
        .export(snapshot, sources);
      preparedHtmlFilename = exportFilename(snapshot.recipient.name);
      download.disabled = false;
      try {
        preparedRecipientRaw = exportRecipientFile(snapshot, sources);
        preparedRecipientFile = new File(
          [preparedRecipientRaw],
          exportFilename(snapshot.recipient.name).replace(
            /\.html$/,
            '.bes-gift.json',
          ),
          { type: 'application/json' },
        );
        recipientExport.disabled = false;
        download.disabled = false;
        share.hidden = !navigator.canShare?.({
          files: [preparedRecipientFile],
        });
      } catch {
        /* This recipient file currently accepts only embedded/offline sources. */
      }
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
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
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
    listen('drafts', 'click', async () => {
      await writeQueue;
      render();
      root.querySelector<HTMLDialogElement>('#draft-dialog')!.showModal();
    });
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
    const activate = async (
      next: CreatorProject,
      assets: MediaAsset[] = [],
    ): Promise<void> => {
      const current = structuredClone(project);
      try {
        await commit(
          { kind: 'activate', current, project: structuredClone(next) },
          assets,
        );
        project = workspace!.entries.find(
          (entry) => entry.project.id === next.id,
        )!.project;
        saved = true;
        pendingImport = null;
        undo = null;
        notice =
          'Dein bisheriges Geschenk bleibt in „Meine Geschenke“ erhalten.';
        render(true);
      } catch {
        message(
          'Der Wechsel konnte nicht sicher gespeichert werden. Sichere dein Geschenk zuerst als Datei; prüfe die Sammlung oder den Speicherkonflikt.',
        );
      }
    };
    listen('confirm-import', 'click', async () => {
      if (!pendingImport || conflict) return;
      const bundle = pendingImport;
      pendingImport = null;
      const next = structuredClone(bundle.project);
      next.id = crypto.randomUUID();
      await activate(next, bundle.assets);
    });
    listen('new-project', 'click', () => {
      void activate(createProject());
    });
    root
      .querySelectorAll<HTMLButtonElement>('[data-project]')
      .forEach((button) =>
        button.addEventListener('click', () => {
          const next = workspace?.entries.find(
            (entry) => entry.project.id === button.dataset.project,
          )?.project;
          if (next) void activate(next);
        }),
      );
    root
      .querySelectorAll<HTMLButtonElement>('[data-delete-project]')
      .forEach((button) =>
        button.addEventListener('click', () => {
          pendingDelete = button.dataset.deleteProject!;
          root.querySelector<HTMLDialogElement>('#draft-dialog')!.close();
          root.querySelector<HTMLDialogElement>('#delete-dialog')!.showModal();
        }),
      );
    listen('cancel-delete', 'click', () => {
      pendingDelete = null;
      root.querySelector<HTMLDialogElement>('#delete-dialog')!.close();
    });
    listen('confirm-delete', 'click', async () => {
      if (!pendingDelete || conflict) return;
      const id = pendingDelete;
      pendingDelete = null;
      try {
        await commit({ kind: 'delete', projectId: id });
        if (project.id === id)
          project = workspace!.entries.find(
            (entry) => entry.project.id === workspace!.activeId,
          )!.project;
        undo = null;
        saved = true;
        render(true);
        message(
          'Das Geschenk wurde gelöscht. Gemeinsam verwendete Fotos bleiben erhalten.',
        );
      } catch {
        root.querySelector<HTMLDialogElement>('#delete-dialog')?.close();
      }
    });
    listen('cleanup-storage', 'click', () => {
      root.querySelector<HTMLDialogElement>('#draft-dialog')!.close();
      root.querySelector<HTMLDialogElement>('#cleanup-dialog')!.showModal();
    });
    listen('cancel-cleanup', 'click', () =>
      root.querySelector<HTMLDialogElement>('#cleanup-dialog')!.close(),
    );
    listen('confirm-cleanup', 'click', async () => {
      try {
        await commit({ kind: 'cleanup', releaseRecovery: true });
        undo = null;
        render();
        message(
          'Unbenutzte Fotodaten wurden bereinigt. Benötigte Originale und Fotokopien bleiben erhalten.',
        );
      } catch {
        root.querySelector<HTMLDialogElement>('#cleanup-dialog')?.close();
      }
    });
    listen('conflict-backup', 'click', () => {
      try {
        downloadText(
          writeDraft(project),
          'BES-Tab-Text-Sicherung.json',
          'application/json',
        );
      } catch {
        message(
          'Diese Sicherung ist zu groß. Bitte sichere wichtige Texte einzeln, bevor du den gespeicherten Stand übernimmst.',
        );
      }
    });
    listen('conflict-reload', 'click', async () => {
      await writeQueue;
      try {
        const latest = await repository.read();
        if (!latest)
          throw new Error(
            'Die lokale Sammlung fehlt. Bitte sichere deinen Text.',
          );
        workspace = latest;
        project = structuredClone(
          latest.entries.find((entry) => entry.project.id === project.id)
            ?.project ??
            latest.entries.find(
              (entry) => entry.project.id === latest.activeId,
            )!.project,
        );
        conflict = false;
        undo = null;
        pendingImport = null;
        pendingDirector = null;
        importEpoch++;
        saved = true;
        render(true);
        message('Der aktuelle gespeicherte Stand wurde übernommen.');
      } catch (cause) {
        failed(cause);
      }
    });
    listen('home', 'click', (event) => {
      event.preventDefault();
      go('start');
    });
    listen('magic-name', 'input', (event) => {
      project.recipient.name = (event.target as HTMLInputElement).value;
      persist();
    });
    listen('magic-relationship', 'change', (event) => {
      const id = (event.target as HTMLSelectElement).value;
      project.relationship.typeId = id;
      project.relationship.uncertain = id === 'uncertain';
      project.relationship.dimensions.context =
        relationships.get(id)?.context ?? 'mixed';
      project.experience.directionId = recommendDirection(
        project,
      ) as CreatorProject['experience']['directionId'];
      project.experience.themeId = directions.get(
        project.experience.directionId,
      )!.themeId;
      persist();
      render();
    });
    listen('magic-form', 'submit', (event) => {
      event.preventDefault();
      const error = root.querySelector<HTMLElement>('#magic-error')!;
      if (conflict) {
        error.textContent = 'Bitte löse zuerst den Speicherkonflikt.';
        return;
      }
      try {
        const next = createMagicStart(project, '');
        undo = structuredClone(project);
        project = next;
        creatorMoment = 'opening';
        previewScene = 'opening';
        persist();
        render(true);
        message(
          'Dein erster Moment ist da. Gefällt er dir? Persönliche Worte und Fotos sind freiwillige nächste Schritte.',
        );
      } catch {
        error.textContent =
          'Bitte gib einen Namen ein. Eine vorhandene Komposition bleibt unverändert.';
      }
    });
    listen('question-mode', 'change', (event) => {
      project.mode = (event.target as HTMLSelectElement).value as
        'quick' | 'deep';
      const list = activeQuestions(project);
      if (!list.some((q) => q.id === project.workflow.questionId))
        project.workflow.questionId = list[0].id;
      persist();
      render();
    });
    root
      .querySelectorAll<HTMLInputElement>('input[name="magic-vibe"]')
      .forEach((input) =>
        input.addEventListener('change', () => {
          project.experience.directionId =
            input.value as CreatorProject['experience']['directionId'];
          project.experience.themeId = directions.get(
            project.experience.directionId,
          )!.themeId;
          persist();
        }),
      );
    const openDetail = () => {
      detailBase = structuredClone(project);
      root.querySelector<HTMLDialogElement>('#detail-dialog')!.showModal();
      root.querySelector<HTMLTextAreaElement>('#public-detail')!.focus();
    };
    const finishDetail = () => {
      if (detailBase) undo = detailBase;
      detailBase = null;
      creatorMoment = 'personal';
      previewScene = 'letter';
      persist();
      render(true);
    };
    listen('public-detail', 'input', (event) => {
      if (!detailBase) return;
      const message = (event.target as HTMLTextAreaElement).value.trim();
      const base = detailBase.writing.letter;
      const letter = !message
        ? base
        : base === publicBirthdayLetter(project.recipient.name)
          ? publicBirthdayLetter(project.recipient.name, message)
          : `${base}\n\n${message}`;
      if (letter.length > 20000) {
        root.querySelector<HTMLElement>('#detail-error')!.textContent =
          'Dein Brief ist bereits sehr lang. Bearbeite ihn zuerst unter „Text selbst bearbeiten“.';
        return;
      }
      project.writing.letter = letter;
      syncComposition(project);
      persist();
    });
    root.querySelectorAll<HTMLButtonElement>('[data-seed]').forEach((button) =>
      button.addEventListener('click', () => {
        const field =
          root.querySelector<HTMLTextAreaElement>('#public-detail')!;
        field.value = button.dataset.seed!;
        field.dispatchEvent(new Event('input', { bubbles: true }));
        field.focus();
      }),
    );
    listen('detail-form', 'submit', (event) => {
      event.preventDefault();
      finishDetail();
    });
    listen('skip-detail', 'click', finishDetail);
    listen('detail-dialog', 'cancel', (event) => {
      event.preventDefault();
      finishDetail();
    });
    listen('add-detail', 'click', openDetail);
    listen('confirm-view', 'click', () => {
      if (creatorMoment === 'opening') openDetail();
      else if (creatorMoment === 'personal') {
        creatorMoment = 'photo';
        previewScene = 'moments';
        render(true);
      } else {
        creatorMoment = 'full';
        previewScene = 'opening';
        render(true);
      }
    });
    listen('add-photo', 'click', () => {
      creatorMoment = 'photo';
      previewScene = 'moments';
      render(true);
    });
    listen('full-preview', 'click', () => {
      creatorMoment = 'full';
      previewScene = 'opening';
      render(true);
    });
    listen('change-view', 'click', () => {
      root.querySelector<HTMLElement>('#review-vibes')!.hidden = false;
    });
    root
      .querySelectorAll<HTMLButtonElement>('[data-review-direction]')
      .forEach((button) =>
        button.addEventListener('click', () => {
          undo = structuredClone(project);
          previewScene = 'opening';
          chooseDirection(
            button.dataset
              .reviewDirection as CreatorProject['experience']['directionId'],
          );
        }),
      );
    listen('surprise-view', 'click', () => {
      undo = structuredClone(project);
      previewScene = 'opening';
      const list = directions.all();
      const index = list.findIndex(
        (d) => d.id === project.experience.directionId,
      );
      chooseDirection(list[(index + 1) % list.length].id);
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
    listen('recipient-export', 'click', () => {
      if (preparedRecipientFile)
        downloadText(
          preparedRecipientRaw,
          preparedRecipientFile.name,
          'application/json',
        );
    });
    listen('recipient-share', 'click', () => {
      const file = preparedRecipientFile;
      if (!file || !navigator.canShare?.({ files: [file] })) return;
      // Call synchronously in the user gesture; no awaited IndexedDB work first.
      void navigator
        .share({
          files: [file],
          title: 'Ein Geburtstagsgeschenk',
          text: 'In Safari öffnen: https://makandev.github.io/birthday-experience-studio/#gift',
        })
        .catch((cause) => {
          if (!(cause instanceof DOMException && cause.name === 'AbortError'))
            message(
              'Teilen war nicht möglich. Bitte sichere die Empfänger-Datei und verschicke sie selbst.',
            );
        });
    });
    listen('download', 'click', () => {
      if (!preparedHtml) {
        message('Bitte warte, bis dein HTML-Geschenk bereit ist.');
        return;
      }
      // Same standalone artifact on every device; synchronous user activation.
      downloadText(preparedHtml, preparedHtmlFilename);
      message(
        'Dein eigenständiges HTML-Geschenk ist gesichert. Im Offline-Profil enthält diese eine Datei alles; eine BES-Seite oder ein Upload ist zum Abspielen nicht nötig.',
      );
    });
    listen('reset', 'click', () =>
      root.querySelector<HTMLDialogElement>('#reset-dialog')!.showModal(),
    );
    listen('cancel-reset', 'click', () =>
      root.querySelector<HTMLDialogElement>('#reset-dialog')!.close(),
    );
    listen('confirm-reset', 'click', async () => {
      if (protectedDraft) {
        try {
          const raw = storage.getItem(STORAGE_KEY);
          if (raw) {
            const priorBackup = storage.getItem(`${STORAGE_KEY}.backup`);
            if (priorBackup && priorBackup !== raw)
              throw new ProtectedStorage(
                'Eine frühere Sicherung bleibt geschützt. Sichere zuerst beide alten Datensätze.',
              );
            storage.setItem(`${STORAGE_KEY}.backup`, raw);
          }
          workspace = await repository.initialize(storage, true);
          project = workspace.entries.find(
            (entry) => entry.project.id === workspace!.activeId,
          )!.project;
          protectedDraft = false;
          undo = null;
          render(true);
        } catch (cause) {
          failed(cause);
        }
        return;
      }
      const previous = structuredClone(project);
      await activate(createProject());
      if (project.id !== previous.id) {
        undo = previous;
        render(true);
      }
    });
    listen('undo-reset', 'click', async () => {
      if (undo) {
        if (undo.id !== project.id) {
          await activate(undo);
          return;
        }
        project = undo;
        undo = null;
        persist();
        notice = 'Dein vorheriges Geschenk ist wieder da.';
        render(true);
      }
    });
    listen('backup', 'click', async () => {
      try {
        const canonical = await repository.recoveryBackup();
        const recovery = JSON.parse(canonical);
        const legacy = {
          active: storage.getItem(STORAGE_KEY),
          library: storage.getItem('bes.project-library.v1'),
          backup: storage.getItem(`${STORAGE_KEY}.backup`),
        };
        downloadText(
          JSON.stringify({ ...recovery, legacy }, null, 2),
          'BES-Speicher-Wiederherstellung.json',
          'application/json',
        );
        message(
          'Private Speicher-Sicherung erstellt. Sie enthält keine Foto-Binärdaten und ist keine normale Importdatei. Bewahre sie für eine spätere Wiederherstellung auf.',
        );
      } catch {
        message('Die gespeicherten Daten sind gerade nicht zugänglich.');
      }
    });
  }
  render();
}
