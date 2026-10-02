import { Registry } from './registry';
export interface Theme {
  id: string;
  version: number;
  label: string;
  background: string;
  foreground: string;
  accent: string;
  card: string;
  font: string;
}
export const themes = new Registry<Theme>([
  {
    id: 'warm',
    version: 1,
    label: 'Warm',
    background: '#faf2e9',
    foreground: '#34281f',
    accent: '#9d4938',
    card: '#fffdf9',
    font: 'Georgia, serif',
  },
  {
    id: 'minimal',
    version: 1,
    label: 'Klar',
    background: '#f1f4f2',
    foreground: '#20332c',
    accent: '#28674e',
    card: '#ffffff',
    font: 'system-ui, sans-serif',
  },
  {
    id: 'celebration',
    version: 1,
    label: 'Festlich',
    background: '#f6efff',
    foreground: '#36234d',
    accent: '#70459a',
    card: '#fffcff',
    font: 'Georgia, serif',
  },
]);
