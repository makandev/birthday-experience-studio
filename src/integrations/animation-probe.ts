import type { AnimationProgram } from '../domain/animation';
import { ANIMATION_HOST_HTML } from '../experience/animation-host';
export async function probeAnimation(
  program: AnimationProgram,
  signal?: AbortSignal,
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const frame = document.createElement('iframe');
    frame.hidden = true;
    frame.sandbox.add('allow-scripts');
    let done = false,
      cursor = 0;
    const samples = [
      { time: 0, scene: 'opening', phase: 0 },
      { time: 2, scene: 'choice', phase: 0 },
      { time: 4, scene: 'moments', phase: 0 },
      { time: 6, scene: 'letter', phase: 0 },
      { time: 8, scene: 'surprise', phase: 0 },
      { time: 10, scene: 'finale', phase: 0 },
      { time: 14, scene: 'finale', phase: 1 },
      { time: 18, scene: 'finale', phase: 2 },
      { time: 22, scene: 'closing', phase: 0 },
    ];
    const finish = (ok: boolean) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      window.removeEventListener('message', receive);
      signal?.removeEventListener('abort', abort);
      frame.contentWindow?.postMessage({ type: 'bes-animation-stop' }, '*');
      frame.remove();
      if (ok) resolve();
      else
        reject(
          new Error(
            'Die erzeugte Animation konnte nicht sicher abgespielt werden. Bitte neu versuchen.',
          ),
        );
    };
    const abort = () => finish(false);
    const tick = () =>
      frame.contentWindow?.postMessage(
        {
          type: 'bes-animation-tick',
          request: cursor + 1,
          input: { ...samples[cursor], width: 390, height: 844, intensity: 2 },
        },
        '*',
      );
    const receive = (event: MessageEvent) => {
      if (event.source !== frame.contentWindow || done) return;
      if (
        event.data?.type === 'bes-animation-frame' &&
        event.data.request === cursor + 1
      ) {
        cursor++;
        if (cursor === samples.length) finish(true);
        else tick();
      }
      if (event.data?.type === 'bes-animation-failed') finish(false);
    };
    const timer = setTimeout(() => finish(false), 6500);
    window.addEventListener('message', receive);
    signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) {
      finish(false);
      return;
    }
    frame.onload = () => {
      frame.contentWindow?.postMessage(
        { type: 'bes-animation-init', source: program.source },
        '*',
      );
      tick();
    };
    frame.srcdoc = ANIMATION_HOST_HTML;
    document.body.append(frame);
  });
}
