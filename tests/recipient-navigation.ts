import { expect, type Page, type FrameLocator } from '@playwright/test';
export async function recipientStation(
  scope: Page | FrameLocator,
  target: string,
): Promise<void> {
  await expect(scope.locator('body')).toHaveClass(/enhanced/);
  const order = (await scope
    .locator('body')
    .getAttribute('data-scene-order'))!.split(',');
  const index = order.indexOf(target);
  if (index < 0)
    throw new Error('Target station is absent from this composition');
  let current = order.indexOf(
    (await scope.locator('body').getAttribute('data-scene'))!,
  );
  for (let n = 0; current !== index && n < 12; n++) {
    if (order[current] === 'finale' && index > current)
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
    if ((await letter.getAttribute('open')) === null)
      await letter.locator('summary').click();
  }
}
