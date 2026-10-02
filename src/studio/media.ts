import type { CreatorProject } from '../domain/project';
import { syncComposition } from '../engines/composition';
import { escapeHtml as e } from '../experience/text';
import { mediaBudget } from '../media/budgets';
import { processPhoto } from '../media/process';
import {
  blobDataUrl,
  validateProcessedDataUrl,
  imageHeader,
} from '../media/formats';
import type { AssetStore, MediaAsset } from '../media/store';
import { safeExternalUrl } from '../security/urls';
export interface MediaHooks {
  getProject(): CreatorProject;
  changed(assets?: MediaAsset[]): Promise<void>;
  edited(): void;
  message(text: string): void;
  beforeRemoval(): void;
}
export class MediaController {
  busy = false;
  constructor(
    private store: AssetStore,
    private hooks: MediaHooks,
  ) {}
  panel(project: CreatorProject): string {
    return `<details id="media-workspace" class="photo-workspace" ${project.media.length ? 'open' : ''}><summary>Fotos &amp; Erinnerungsmomente hinzufügen</summary><p>Deine Originale bleiben auf diesem Gerät erhalten. Für das Geschenk erzeugen wir kleinere Kopien ohne ursprüngliche Metadaten.</p><div id="photo-drop" class="media-drop"><label for="photo-files">Fotos auswählen oder hierher ziehen</label><input id="photo-files" type="file" multiple accept="image/jpeg,image/png,image/webp" ${this.busy ? 'disabled' : ''}><p class="field-help">JPEG, PNG oder unbewegtes WebP · bis 8 MB / 24 Megapixel pro Foto · höchstens 6 Fotos.</p></div><div class="photo-list">${project.media
      .filter((m) => m.kind === 'image')
      .map((media) => {
        const block = project.experience.blocks.find(
          (b) => b.type === 'photo' && b.data.mediaId === media.id,
        );
        return `<section class="photo-editor"><h3>${e(media.name)}</h3>${media.source.type === 'local' ? `<img data-thumbnail="${e(media.id)}" alt="Lokale Fotovorschau" hidden>` : '<p class="field-help">Externes oder noch nicht verfügbares Foto. Keine automatische Übertragung.</p>'}${
          block
            ? `<label for="alt-${e(media.id)}">Was zeigt dieses Foto?</label><input id="alt-${e(media.id)}" data-photo-field="alt" data-photo-id="${e(media.id)}" maxlength="1000" value="${e(block.data.alt)}"><label for="caption-${e(media.id)}">Deine Worte zu diesem Moment</label><input id="caption-${e(media.id)}" data-photo-field="caption" data-photo-id="${e(media.id)}" maxlength="2000" value="${e(block.data.caption)}"><label for="fit-${e(media.id)}">Bildausschnitt</label><select id="fit-${e(media.id)}" data-photo-field="fit" data-photo-id="${e(media.id)}"><option value="contain" ${block.data.fit === 'contain' ? 'selected' : ''}>Ganzes Bild zeigen</option><option value="cover" ${block.data.fit === 'cover' ? 'selected' : ''}>Rahmen füllen</option></select><label for="position-${e(media.id)}">Wichtiger Bildbereich</label><select id="position-${e(media.id)}" data-photo-field="position" data-photo-id="${e(media.id)}">${[
                ['center', 'Mitte'],
                ['top', 'Oben'],
                ['bottom', 'Unten'],
              ]
                .map(
                  ([value, label]) =>
                    `<option value="${value}" ${block.data.position === value ? 'selected' : ''}>${label}</option>`,
                )
                .join('')}</select>`
            : ''
        }<div class="actions">${media.source.type === 'local' ? `<button type="button" class="text-button" data-original="${e(media.id)}">Original auf diesem Gerät sichern</button>` : ''}<button type="button" class="text-button" data-remove-photo="${e(media.id)}">Aus diesem Geschenk entfernen</button></div></section>`;
      })
      .join(
        '',
      )}</div><details class="advanced"><summary>Optional: öffentliches Online-Foto</summary><p>Nur verwenden, wenn du die Quelle kennst. Diese Fotoquelle wird erst nach bewusster Online-Bestätigung geladen; ohne Internet bleibt deine Beschreibung sichtbar.</p><label for="public-photo-url">Öffentliche HTTPS-Fotoadresse</label><input id="public-photo-url" type="url" maxlength="2048" placeholder="https://fotos.example.org/foto.jpg"><button type="button" class="button secondary" id="add-external-photo">Externe Fotoquelle vormerken</button><p class="field-help">Keine Zugangsdaten, Abfrageparameter oder privaten/lokalen Adressen.</p></details></details>`;
  }
  private async attach(
    media: CreatorProject['media'][number],
    assets: MediaAsset[] = [],
  ): Promise<void> {
    const project = this.hooks.getProject();
    if (
      project.media.length >= mediaBudget.maxPhotos ||
      project.experience.blocks.length >= 50
    )
      throw new Error(
        'Dieses Geschenk hat bereits genug Fotos oder Bausteine. Entferne zuerst einen davon.',
      );
    project.media.push(media);
    syncComposition(project);
    const photos = project.experience.blocks
      .map((b, i) => (b.type === 'photo' ? i : -1))
      .filter((i) => i >= 0);
    const intro = project.experience.blocks.findIndex(
      (b) => b.type === 'intro',
    );
    const insertAt = photos.length
      ? photos[photos.length - 1] + 1
      : intro >= 0
        ? intro + 1
        : project.experience.blocks.length;
    project.experience.blocks.splice(insertAt, 0, {
      id: `photo-${crypto.randomUUID()}`,
      type: 'photo',
      version: 1,
      enabled: true,
      data: {
        mediaId: media.id,
        alt: 'Ein besonderer gemeinsamer Moment',
        caption: 'Unsere Erinnerung',
        fit: 'contain',
        position: 'center',
      },
    });
    project.exportConfig.externalMediaConsent = false;
    try {
      await this.hooks.changed(assets);
    } catch (cause) {
      project.media = project.media.filter((item) => item.id !== media.id);
      project.experience.blocks = project.experience.blocks.filter(
        (block) => block.data.mediaId !== media.id,
      );
      throw cause;
    }
  }
  private async importFiles(files: File[]): Promise<void> {
    if (this.busy) {
      this.hooks.message(
        'Bitte warte einen Moment, bis deine Fotos bereit sind.',
      );
      return;
    }
    this.busy = true;
    const owner = this.hooks.getProject();
    try {
      for (const file of files) {
        if (this.hooks.getProject() !== owner) break;
        if (
          owner.media.length >= mediaBudget.maxPhotos ||
          owner.experience.blocks.length >= 50
        )
          throw new Error(
            'Höchstens sechs Fotos pro Geschenk. Entferne zuerst ein Foto.',
          );
        this.hooks.message('Dein Foto wird auf diesem Gerät vorbereitet …');
        const asset = await processPhoto(file);
        if (this.hooks.getProject() !== owner) break;
        await this.attach(
          {
            id: crypto.randomUUID(),
            kind: 'image',
            name:
              file.name
                .split('')
                .filter(
                  (char) =>
                    char.charCodeAt(0) >= 32 && char.charCodeAt(0) !== 127,
                )
                .join('')
                .slice(0, 240) || 'Foto',
            mimeType: 'image/jpeg',
            size: asset.processed.size,
            width: asset.width,
            height: asset.height,
            source: { type: 'local', assetId: asset.id },
          },
          [asset],
        );
      }
      this.hooks.message(
        'Deine Fotos sind bereit. Beschreibe kurz, was sie zeigen und warum dieser Moment wichtig ist.',
      );
    } catch (error) {
      this.hooks.message(
        error instanceof Error
          ? error.message
          : 'Dieses Foto konnte nicht hinzugefügt werden.',
      );
    } finally {
      this.busy = false;
      await this.hooks.changed();
    }
  }
  bind(root: HTMLElement): void {
    root
      .querySelector<HTMLInputElement>('#photo-files')
      ?.addEventListener('change', (event) => {
        void this.importFiles(
          Array.from((event.target as HTMLInputElement).files ?? []),
        );
      });
    const drop = root.querySelector('#photo-drop');
    drop?.addEventListener('dragover', (event) => {
      event.preventDefault();
    });
    drop?.addEventListener('drop', (event) => {
      event.preventDefault();
      void this.importFiles(
        Array.from((event as DragEvent).dataTransfer?.files ?? []),
      );
    });
    root
      .querySelectorAll<HTMLInputElement | HTMLSelectElement>(
        '[data-photo-field]',
      )
      .forEach((input) =>
        input.addEventListener('input', () => {
          const block = this.hooks
            .getProject()
            .experience.blocks.find(
              (b) =>
                b.type === 'photo' && b.data.mediaId === input.dataset.photoId,
            );
          if (block) {
            block.data[input.dataset.photoField!] = input.value;
            this.hooks.edited();
          }
        }),
      );
    root
      .querySelector('#add-external-photo')
      ?.addEventListener('click', async () => {
        try {
          const url = safeExternalUrl(
            root
              .querySelector<HTMLInputElement>('#public-photo-url')!
              .value.trim(),
          );
          await this.attach({
            id: crypto.randomUUID(),
            kind: 'image',
            name: 'Externes Foto',
            mimeType: 'image/jpeg',
            size: 0,
            source: { type: 'external', url: url.href },
          });
          this.hooks.message(
            'Fotoquelle vorgemerkt. Wähle für die Verwendung das Online-Profil und bestätige die Quelle in der Vorschau.',
          );
        } catch (error) {
          this.hooks.message(
            error instanceof Error
              ? error.message
              : 'Bitte prüfe die Fotoquelle.',
          );
        }
      });
    root
      .querySelectorAll<HTMLButtonElement>('[data-remove-photo]')
      .forEach((button) =>
        button.addEventListener('click', () => {
          this.hooks.beforeRemoval();
          const project = this.hooks.getProject();
          const id = button.dataset.removePhoto;
          project.media = project.media.filter((m) => m.id !== id);
          project.experience.blocks = project.experience.blocks.filter(
            (b) => b.data.mediaId !== id,
          );
          void this.hooks.changed();
          this.hooks.message(
            'Foto aus diesem Geschenk entfernt. Die lokalen Bilddateien bleiben für Wiederherstellung erhalten.',
          );
        }),
      );
    root
      .querySelectorAll<HTMLButtonElement>('[data-original]')
      .forEach((button) =>
        button.addEventListener('click', () => {
          const media = this.hooks
            .getProject()
            .media.find((m) => m.id === button.dataset.original);
          if (media?.source.type !== 'local') return;
          void this.store
            .get(media.source.assetId)
            .then(async (asset) => {
              if (!asset) {
                this.hooks.message(
                  'Dieses Foto konnte gerade nicht gelesen werden.',
                );
                return;
              }
              const header = imageHeader(
                new Uint8Array(
                  await (asset.original ?? asset.processed).arrayBuffer(),
                ),
              );
              const url = URL.createObjectURL(
                new Blob([asset.original ?? asset.processed], {
                  type: 'application/octet-stream',
                }),
              );
              const link = document.createElement('a');
              link.href = url;
              link.download = `${asset.original ? 'BES-Original' : 'BES-Fotokopie'}.${header.mimeType === 'image/png' ? 'png' : header.mimeType === 'image/webp' ? 'webp' : 'jpg'}`;
              link.click();
              setTimeout(() => URL.revokeObjectURL(url), 1000);
            })
            .catch(() =>
              this.hooks.message(
                'Das Original konnte gerade nicht gesichert werden.',
              ),
            );
        }),
      );
    for (const image of root.querySelectorAll<HTMLImageElement>(
      '[data-thumbnail]',
    )) {
      const media = this.hooks
        .getProject()
        .media.find((m) => m.id === image.dataset.thumbnail);
      if (media?.source.type !== 'local') continue;
      void this.store
        .get(media.source.assetId)
        .then(async (asset) => {
          if (!asset) return;
          const url = await blobDataUrl(asset.processed);
          validateProcessedDataUrl(url);
          if (image.isConnected) {
            image.src = url;
            image.hidden = false;
          }
        })
        .catch(() => {});
    }
  }
}
