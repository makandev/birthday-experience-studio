import { z } from 'zod';
export const concepts = [
  {
    id: 'atelier',
    label: 'Moment Atelier',
    description: 'Warm · große Fotos · persönliche Worte',
  },
  {
    id: 'surprise-box',
    label: 'Surprise Box',
    description: 'Farbig · Fächer entdecken · Geburtstagsbanner',
  },
  {
    id: 'light-premiere',
    label: 'Light Premiere',
    description: 'Filmisch · Licht führen · großer Abschluss',
  },
] as const;
export const experiencePlanSchema = z
  .strictObject({
    version: z.literal(1),
    concept: z.enum(['atelier', 'surprise-box', 'light-premiere']),
    sceneOrder: z
      .array(
        z.enum([
          'opening',
          'choice',
          'moments',
          'letter',
          'surprise',
          'finale',
          'closing',
        ]),
      )
      .min(3)
      .max(7),
    pace: z.enum(['gentle', 'bright']),
  })
  .superRefine((plan, ctx) => {
    const order = plan.sceneOrder;
    if (
      new Set(order).size !== order.length ||
      order[0] !== 'opening' ||
      order.at(-1) !== 'closing' ||
      order.at(-2) !== 'finale'
    )
      ctx.addIssue({ code: 'custom', message: 'Ungültiger Geschenkablauf.' });
    const choice = order.indexOf('choice');
    if (choice >= 0 && order.slice(choice + 1, -2).length < 2)
      ctx.addIssue({
        code: 'custom',
        message: 'Die Auswahl braucht mindestens zwei folgende Inhalte.',
      });
  });
export type ExperiencePlan = z.infer<typeof experiencePlanSchema>;
