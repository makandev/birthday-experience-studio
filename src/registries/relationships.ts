import { Registry } from './registry';
export interface RelationshipDefinition {
  id: string;
  version: number;
  label: string;
  context: 'private' | 'professional' | 'mixed';
}
const privateTypes = [
  ['partner', 'Partner/in'],
  ['spouse', 'Ehepartner/in'],
  ['mother', 'Mutter'],
  ['father', 'Vater'],
  ['grandmother', 'Oma'],
  ['grandfather', 'Opa'],
  ['child', 'Kind'],
  ['sibling', 'Geschwister'],
  ['best-friend', 'Bester Freund / beste Freundin'],
  ['friend', 'Freund/in'],
  ['acquaintance', 'Bekannte/r'],
];
const professionalTypes = [
  ['colleague', 'Kollege/in'],
  ['employee', 'Mitarbeiter/in'],
  ['boss', 'Chef/in'],
  ['teacher', 'Lehrer/in'],
  ['educator', 'Pädagoge / Pädagogin'],
  ['carer', 'Betreuer/in'],
  ['mentor', 'Mentor/in'],
];
export const relationships = new Registry<RelationshipDefinition>([
  ...privateTypes.map(([id, label]) => ({
    id,
    label,
    version: 1,
    context: 'private' as const,
  })),
  ...professionalTypes.map(([id, label]) => ({
    id,
    label,
    version: 1,
    context: 'professional' as const,
  })),
  { id: 'other', label: 'Andere Beziehung', version: 1, context: 'mixed' },
  {
    id: 'uncertain',
    label: 'Ich bin mir über unsere Beziehung unsicher',
    version: 1,
    context: 'mixed',
  },
]);
