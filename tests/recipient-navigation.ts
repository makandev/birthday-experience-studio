import { expect, type Page, type FrameLocator } from '@playwright/test';
const order = [
  'opening',
  'curiosity',
  'choice',
  'moments',
  'letter',
  'surprise',
  'finale',
  'closing',
];
export async function recipientStation(
  scope: Page | FrameLocator,
  target: string,
): Promise<void> {
  await expect(scope.locator('body')).toHaveClass(/enhanced/);
  const index = order.indexOf(target);
  if (index < 0) throw new Error('Unknown test station');
  let current = order.indexOf(
    (await scope.locator('body').getAttribute('data-scene'))!,
  );
  for (let n = 0; current !== index && n < 8; n++) {
    if (current === 6 && index > current)
      await scope.locator('#skip-finale').click();
    else
      await scope
        .locator(index > current ? '#stage-next' : '#stage-back')
        .click();
    current = order.indexOf(
      (await scope.locator('body').getAttribute('data-scene'))!,
    );
  }
  await expect(scope.locator('body')).toHaveAttribute('data-scene', target);
  if (target === 'letter') {
    const letter = scope.locator('.letter-reveal');
    if (!((await letter.getAttribute('open')) !== null))
      await letter.locator('summary').click();
  }
}
