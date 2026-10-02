import type { ExportExperience } from '../export/projection';
export type SceneId =
  | 'opening'
  | 'curiosity'
  | 'choice'
  | 'moments'
  | 'letter'
  | 'surprise'
  | 'finale'
  | 'closing';
export interface RecipientScene {
  id: SceneId;
  title: string;
  blocks: ExportExperience['blocks'];
}
// Fixed maintained scene roles; imported content cannot supply executable behavior.
export function composeScenes(experience: ExportExperience): RecipientScene[] {
  const roles: [SceneId, string, string[]][] = [
    ['opening', 'Ein Moment nur für dich', ['intro']],
    ['curiosity', 'Heute darf es besonders sein', []],
    ['choice', 'Wie möchtest du diesen Moment beginnen?', []],
    ['moments', 'Die kleinen Dinge zählen', ['photo']],
    ['letter', 'Diese Worte sind für dich', ['letter']],
    ['surprise', 'Ein bisschen Vorfreude', ['wish', 'reveal']],
    ['finale', 'Dein großer Moment', []],
    ['closing', 'Nimm diesen Moment mit', ['finale']],
  ];
  return roles.map(([id, title, types]) => ({
    id,
    title,
    blocks: experience.blocks.filter((block) => types.includes(block.type)),
  }));
}
