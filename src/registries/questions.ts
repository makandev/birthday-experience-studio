import type { CreatorProject } from '../domain/project';
import { Registry } from './registry';
export type Rule =
  | { kind: 'mode'; value: 'deep' }
  | { kind: 'answer'; id: string; equals: string }
  | { kind: 'context'; value: 'professional' }
  | { kind: 'uncertain' }
  | {
      kind: 'dimension';
      key: 'closeness' | 'trust' | 'emotionality' | 'yearsKnown';
      minimum: number;
    };
export interface QuestionDefinition {
  id: string;
  version: number;
  prompt: string;
  help: string;
  examples: string[];
  type: 'text' | 'choice';
  options?: { value: string; label: string }[];
  rules?: Rule[];
  tags: string[];
}
export interface QuestionPack {
  id: string;
  version: number;
  questions: QuestionDefinition[];
}
const q = (
  id: string,
  prompt: string,
  help: string,
  examples: string[],
  extra: Partial<QuestionDefinition> = {},
): QuestionDefinition => ({
  id,
  version: 1,
  prompt,
  help,
  examples,
  type: 'text',
  tags: ['core'],
  ...extra,
});
export const questionPacks = new Registry<QuestionPack>([
  {
    id: 'birthday-core',
    version: 2,
    questions: [
      q(
        'connection',
        'Was verbindet euch?',
        'Ein kleiner Anfang reicht. Du musst eure Beziehung nicht perfekt benennen.',
        ['Wir kennen uns von der Arbeit und können über fast alles lachen.'],
        { rules: [{ kind: 'uncertain' }] },
      ),
      q(
        'qualities',
        'Was schätzt du besonders an dieser Person?',
        'Denk an einen Moment, in dem du dich verstanden oder unterstützt gefühlt hast.',
        ['Du hörst zu, ohne sofort einen Rat geben zu müssen.'],
      ),
      q(
        'memory',
        'Gibt es eine Erinnerung, die du erzählen möchtest?',
        'Auch eine kleine Alltagsszene kann ein großes Geschenk sein.',
        [
          'Unser verregneter Ausflug – und wie wir trotzdem so viel gelacht haben.',
        ],
      ),
      q(
        'humor',
        'Passt ein bisschen Humor zu eurem Geschenk?',
        'Wähle, was sich für euch richtig anfühlt.',
        [],
        {
          type: 'choice',
          options: [
            { value: 'yes', label: 'Ja, wir lachen gerne zusammen' },
            { value: 'no', label: 'Lieber ruhig und herzlich' },
          ],
        },
      ),
      q(
        'insider',
        'Worüber könnt nur ihr beide lachen?',
        'Beschreibe den Insider so, dass er sich gut und freundlich anfühlt.',
        ['Unser ewiger Streit um das letzte Stück Kuchen.'],
        {
          rules: [{ kind: 'answer', id: 'humor', equals: 'yes' }],
          tags: ['humor'],
        },
      ),
      q(
        'thanks',
        'Wofür möchtest du Danke sagen?',
        'Du kannst mit „Danke, dass du …“ anfangen.',
        ['Danke, dass du auch an den schwierigen Tagen für mich da bist.'],
      ),
      q(
        'professional',
        'Was macht eure Zusammenarbeit besonders?',
        'Etwas Konkretes ist persönlicher als ein großes Kompliment.',
        ['Du bleibst auch dann gelassen, wenn alles gleichzeitig passiert.'],
        {
          rules: [{ kind: 'context', value: 'professional' }],
          tags: ['professional'],
        },
      ),
      q(
        'future',
        'Was wünschst du dieser Person für das neue Lebensjahr?',
        'Es darf etwas Kleines sein: Zeit, Mut oder gemeinsame Momente.',
        ['Mehr Zeit für dich und viele kleine Abenteuer.'],
      ),
      q(
        'boundaries',
        'Was soll auf keinen Fall im Geschenk vorkommen?',
        'Diese Antwort bleibt privat. Kontrolliere deinen fertigen Text später trotzdem selbst.',
        [
          'Keine Witze über das Alter und keine schwierigen Familiengeschichten.',
        ],
        { tags: ['private'] },
      ),
      q(
        'tone',
        'Wie soll sich das Geschenk anfühlen?',
        'Du bestimmst, wie persönlich es werden darf.',
        [],
        {
          type: 'choice',
          options: [
            { value: 'warm', label: 'Warm und persönlich' },
            { value: 'playful', label: 'Leicht und verspielt' },
            { value: 'reserved', label: 'Zurückhaltend und respektvoll' },
          ],
        },
      ),
      q(
        'turning-point',
        'Gab es eine Zeit, in der ihr besonders zusammengehalten habt?',
        'Nur wenn du darüber sprechen möchtest. Überspringen ist völlig in Ordnung.',
        ['Als alles neu war, warst du mein sicherer Hafen.'],
        { rules: [{ kind: 'mode', value: 'deep' }], tags: ['deep'] },
      ),
      q(
        'everyday-care',
        'Welche kleine Geste zeigt, dass ihr füreinander da seid?',
        'Ein alltäglicher Moment genügt. Teile nur, was sich für euch gut anfühlt.',
        ['Du fragst nach, wie mein Tag war, und hörst wirklich zu.'],
        {
          rules: [
            { kind: 'mode', value: 'deep' },
            { kind: 'dimension', key: 'closeness', minimum: 4 },
          ],
          tags: ['deep'],
        },
      ),
      q(
        'quiet-strength',
        'Was möchtest du würdigen, das andere vielleicht übersehen?',
        'Es muss keine schwierige Geschichte sein. Kleine, stille Stärken zählen genauso.',
        ['Du merkst, wenn jemand eine Pause braucht.'],
        {
          rules: [
            { kind: 'mode', value: 'deep' },
            { kind: 'dimension', key: 'trust', minimum: 4 },
            { kind: 'dimension', key: 'emotionality', minimum: 3 },
          ],
          tags: ['deep'],
        },
      ),
      q(
        'shared-change',
        'Was ist über die Jahre gewachsen oder gleich geblieben?',
        'Du kannst eine Entwicklung oder eine vertraute Gemeinsamkeit beschreiben.',
        [
          'Unsere Wege ändern sich, aber für ein Gespräch finden wir immer Zeit.',
        ],
        {
          rules: [
            { kind: 'mode', value: 'deep' },
            { kind: 'dimension', key: 'yearsKnown', minimum: 5 },
          ],
          tags: ['deep'],
        },
      ),
      q(
        'tradition',
        'Welche kleine Tradition gehört zu euch?',
        'Vielleicht ein Ritual, ein Ort oder eine Nachricht.',
        ['Unser Frühstück am Sonntag.'],
        { rules: [{ kind: 'mode', value: 'deep' }], tags: ['deep'] },
      ),
    ],
  },
]);
export function matchesRule(project: CreatorProject, rule: Rule): boolean {
  if (rule.kind === 'mode') return project.mode === rule.value;
  if (rule.kind === 'context')
    return project.relationship.dimensions.context === rule.value;
  if (rule.kind === 'dimension')
    return project.relationship.dimensions[rule.key] >= rule.minimum;
  if (rule.kind === 'uncertain') return project.relationship.uncertain;
  const answer = project.answers[rule.id];
  return answer?.status === 'answered' && answer.value === rule.equals;
}
