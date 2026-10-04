import type { ExportExperience } from '../export/projection';
export type SceneId =
  | 'opening'
  | 'curiosity'
  | 'choice'
  | 'moments'
  | 'letter'
  | 'surprise'
  | 'encore'
  | 'finale'
  | 'closing';
export type Archetype = 'emotional' | 'playful' | 'cinematic';
export interface RecipientScene {
  id: SceneId;
  title: string;
  nextLabel: string;
  blocks: ExportExperience['blocks'];
}
export interface ExperienceStrategy {
  variant: 'champion' | 'challenger';
  archetype: Archetype;
  finale: 'keepsake' | 'celebration' | 'cinema';
  phaseMs: number;
  respectful: boolean;
}
export function experienceStrategy(
  experience: ExportExperience,
): ExperienceStrategy {
  const archetype = experience.plan
    ? (
        {
          atelier: 'emotional',
          'surprise-box': 'playful',
          'light-premiere': 'cinematic',
        } as const
      )[experience.plan.concept]
    : experience.directionId === 'funny'
      ? 'playful'
      : ['cinematic', 'elegant'].includes(experience.directionId)
        ? 'cinematic'
        : 'emotional';
  const variant = experience.plan
    ? 'challenger'
    : (experience.composition?.variant ?? 'champion');
  const respectful =
    experience.composition?.register === 'respectful' ||
    experience.directionId === 'elegant';
  return {
    variant,
    archetype,
    respectful,
    finale:
      variant === 'champion'
        ? 'cinema'
        : archetype === 'emotional'
          ? 'keepsake'
          : archetype === 'playful'
            ? 'celebration'
            : 'cinema',
    phaseMs: experience.plan
      ? archetype === 'emotional'
        ? experience.plan.pace === 'gentle'
          ? 1100
          : 800
        : archetype === 'playful'
          ? experience.plan.pace === 'gentle'
            ? 1400
            : 900
          : experience.plan.pace === 'gentle'
            ? 1800
            : 1200
      : variant === 'champion'
        ? 4500
        : archetype === 'emotional'
          ? 3200
          : archetype === 'playful'
            ? experience.composition?.pace === 'gentle'
              ? 3200
              : 2400
            : 4000,
  };
}
const roles: Record<SceneId, { title: string; next: string; types: string[] }> =
  {
    opening: {
      title: 'Ein Moment nur für dich',
      next: 'Geschenk öffnen',
      types: ['intro'],
    },
    curiosity: {
      title: 'Nicht alles auf einmal',
      next: 'Das will ich entdecken',
      types: [],
    },
    choice: {
      title: 'Welchen Moment möchtest du zuerst?',
      next: 'Meinen Moment entdecken',
      types: [],
    },
    moments: {
      title: 'Ein Bild. Ein ganzer Moment.',
      next: 'Die Worte dahinter entdecken',
      types: ['photo'],
    },
    letter: {
      title: 'Diese Worte sind für dich',
      next: 'Den Wunsch mitnehmen',
      types: ['letter'],
    },
    surprise: {
      title: 'Noch etwas zum Mitnehmen',
      next: 'Diesen Moment feiern',
      types: ['wish', 'reveal'],
    },
    encore: {
      title: 'Der Abspann kann warten.',
      next: 'Den letzten Moment öffnen',
      types: [],
    },
    finale: { title: 'Dein großer Moment', next: 'Zum Abschluss', types: [] },
    closing: { title: 'Nimm diesen Moment mit', next: '', types: ['finale'] },
  };
// Small maintained grammar. No private answers, raw relationship data or executable recipes.
export function composeScenes(experience: ExportExperience): RecipientScene[] {
  const strategy = experienceStrategy(experience);
  let order: SceneId[];
  if (strategy.variant === 'champion') {
    order = [
      'opening',
      'curiosity',
      'choice',
      'moments',
      'letter',
      'surprise',
      'finale',
      'closing',
    ];
  } else {
    const photo = experience.blocks.some((block) => block.type === 'photo');
    const surprise = experience.blocks.some((block) =>
      ['wish', 'reveal'].includes(block.type),
    );
    const letter = experience.blocks.some((block) => block.type === 'letter');
    const alternate = experience.composition?.arc === 'encore';
    const moment: SceneId = photo ? 'moments' : 'curiosity';
    if (strategy.archetype === 'emotional')
      order = alternate
        ? [
            'opening',
            moment,
            'choice',
            'surprise',
            'letter',
            'finale',
            'closing',
          ]
        : [
            'opening',
            'choice',
            moment,
            'letter',
            'surprise',
            'finale',
            'closing',
          ];
    else if (strategy.archetype === 'playful')
      order = alternate
        ? [
            'opening',
            moment,
            'choice',
            'letter',
            'surprise',
            'encore',
            'finale',
            'closing',
          ]
        : [
            'opening',
            'choice',
            'surprise',
            moment,
            'letter',
            'finale',
            'closing',
          ];
    else
      order = alternate
        ? [
            'opening',
            'choice',
            'letter',
            moment,
            'surprise',
            'finale',
            'closing',
          ]
        : [
            'opening',
            moment,
            'choice',
            'letter',
            'surprise',
            'encore',
            'finale',
            'closing',
          ];
    order = order.filter(
      (id) =>
        (id !== 'surprise' || surprise) &&
        (id !== 'letter' || letter) &&
        (id !== 'choice' || letter || surprise) &&
        (id !== 'encore' || !strategy.respectful),
    );
  }
  if (experience.plan) {
    order = [...experience.plan.sceneOrder];
    for (const [role, type] of [
      ['moments', 'photo'],
      ['letter', 'letter'],
      ['surprise', 'wish'],
      ['surprise', 'reveal'],
    ] as const) {
      const present = experience.blocks.some((b) => b.type === type);
      if (present && !order.includes(role))
        throw new Error(
          'Der KI-Ablauf würde freigegebene Inhalte auslassen. Bitte neu gestalten.',
        );
    }
    if (
      order.includes('moments') &&
      !experience.blocks.some((b) => b.type === 'photo')
    )
      throw new Error('Der KI-Ablauf benötigt ein nicht vorhandenes Foto.');
    if (
      order.includes('letter') &&
      !experience.blocks.some((b) => b.type === 'letter')
    )
      throw new Error('Der KI-Ablauf benötigt nicht vorhandene Worte.');
    if (
      order.includes('surprise') &&
      !experience.blocks.some((b) => ['wish', 'reveal'].includes(b.type))
    )
      throw new Error('Der KI-Ablauf benötigt einen nicht vorhandenen Wunsch.');
  }
  const championLabels = [
    'Geschenk öffnen',
    'Ich bin bereit',
    'Meinen Moment entdecken',
    'Zu deinen persönlichen Worten',
    'Eine kleine Überraschung',
    'Noch ein letzter Moment',
    'Zum Abschluss',
    '',
  ];
  return order.map((id, index) => ({
    id,
    title: roles[id].title,
    nextLabel:
      strategy.variant === 'champion' ? championLabels[index] : roles[id].next,
    blocks: experience.blocks.filter((block) =>
      roles[id].types.includes(block.type),
    ),
  }));
}
export function publicCoreMessage(experience: ExportExperience): string {
  const letter =
    experience.blocks.find((block) => block.type === 'letter')?.data.text ?? '';
  const line = letter
    .split(/\n+/)
    .map((value) =>
      value.trim().replace(/^(hallo|liebe[rs]?)\s+[^,\n]{1,120},\s*/i, ''),
    )
    .find((value) => value && !/^alles gute zum geburtstag!?$/i.test(value));
  const text =
    line ||
    experience.blocks.find((block) => block.type === 'wish')?.data.text ||
    experience.blocks.find((block) => block.type === 'finale')?.data.text ||
    'Ein neues Lebensjahr. Platz für das, was dir gut tut.';
  return text.length <= 240 ? text : `${text.slice(0, 237).trimEnd()}…`;
}
