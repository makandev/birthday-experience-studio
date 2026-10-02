import { readRecipientFile } from '../export/recipient-file';
import { mediaBudget } from '../media/budgets';
import { renderExperience } from './render';

// Recipient route mounts before any workspace/storage initialization.
export function mountRecipientViewer(root: HTMLElement): void {
  root.innerHTML = `<main class="recipient-shell"><section id="gift-open" class="panel"><p class="eyebrow">Ein Geschenk für dich</p><h1>Dein Geburtstagsmoment.</h1><p>Wähle die erhaltene BES-Geschenkdatei. Sie wird nur in diesem Browser gelesen, nicht hochgeladen oder gespeichert.</p><label for="recipient-file">Geschenkdatei auswählen</label><input id="recipient-file" type="file" accept=".json,application/json"><p class="field-help">Bitte diese Seite in Safari öffnen. HTML-Vorschauen in „Dateien“ unterstützen Interaktionen nicht zuverlässig. Empfänger-Datei: .bes-gift.json · kein privater BES-Entwurf.</p><p id="recipient-error" role="alert"></p><p class="field-help">iPhone-Geräteprüfung steht noch aus. BES ist im Entwicklungsstadium.</p></section><section id="recipient-play" hidden><button id="recipient-other" class="button quiet" type="button">Andere Geschenkdatei öffnen</button><iframe id="recipient-preview" title="Dein Geburtstagsgeschenk" sandbox="allow-scripts"></iframe></section></main>`;
  const input = root.querySelector<HTMLInputElement>('#recipient-file')!;
  const error = root.querySelector<HTMLElement>('#recipient-error')!;
  const frame = root.querySelector<HTMLIFrameElement>('#recipient-preview')!;
  let generation = 0;
  input.addEventListener('change', async () => {
    const attempt = ++generation;
    const file = input.files?.[0];
    if (!file) return;
    error.textContent = '';
    try {
      if (file.size > mediaBudget.maxGiftBytes)
        throw new Error('Bitte wähle eine Geschenkdatei bis 6 MB.');
      const html = renderExperience(readRecipientFile(await file.text()));
      if (attempt !== generation) return;
      root.querySelector<HTMLElement>('#gift-open')!.hidden = true;
      root.querySelector<HTMLElement>('#recipient-play')!.hidden = false;
      frame.srcdoc = html;
      root.querySelector<HTMLButtonElement>('#recipient-other')!.focus();
    } catch {
      if (attempt === generation)
        error.textContent =
          'Diese Datei ist kein unterstütztes BES-Geschenk. Bitte wähle die Empfänger-Datei mit der Endung .bes-gift.json (bis 6 MB), keinen privaten Entwurf oder HTML.';
    }
  });
  root
    .querySelector<HTMLButtonElement>('#recipient-other')!
    .addEventListener('click', () => {
      generation++;
      frame.srcdoc = '';
      input.value = '';
      root.querySelector<HTMLElement>('#recipient-play')!.hidden = true;
      root.querySelector<HTMLElement>('#gift-open')!.hidden = false;
      input.focus();
    });
}
