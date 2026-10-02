import { Registry } from './registry';
import { escapeHtml, paragraphs } from '../experience/text';
export interface BlockDefinition {
  id: string;
  version: number;
  label: string;
  fields: string[];
  render: (data: Record<string, string>) => string;
}
export const blocks = new Registry<BlockDefinition>([
  {
    id: 'intro',
    version: 1,
    label: 'Begrüßung',
    fields: ['name'],
    render: (data) =>
      `<header class="intro"><p class="eyebrow">Für einen besonderen Menschen</p><h1>Alles Gute zum Geburtstag,<br><span>${escapeHtml(data.name)}!</span></h1><p>Ein kleines Geschenk. Ganz persönlich. Für dich.</p></header>`,
  },
  {
    id: 'letter',
    version: 1,
    label: 'Dein persönlicher Brief',
    fields: ['text'],
    render: (data) =>
      `<section class="card"><h2>Was ich dir sagen möchte</h2>${paragraphs(data.text)}</section>`,
  },
  {
    id: 'wish',
    version: 1,
    label: 'Geburtstagswunsch',
    fields: ['text'],
    render: (data) =>
      `<section class="card wish"><p class="eyebrow">Für dein neues Lebensjahr</p><h2>Mein Wunsch für dich</h2>${paragraphs(data.text)}</section>`,
  },
  {
    id: 'reveal',
    version: 1,
    label: 'Kleine Überraschung',
    fields: ['text'],
    render: (data) =>
      `<section class="card"><details><summary>Eine kleine Überraschung für dich ✧</summary><div class="revealed">${paragraphs(data.text)}</div></details></section>`,
  },
]);
