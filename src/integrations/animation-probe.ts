import type { AnimationProgram } from '../domain/animation';
import { ANIMATION_HOST_HTML } from '../experience/animation-host';
export async function probeAnimation(program: AnimationProgram): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const frame = document.createElement('iframe');
    frame.hidden = true;
    frame.sandbox.add('allow-scripts');
    const finish = (ok: boolean) => {
      clearTimeout(timer);
      window.removeEventListener('message', receive);
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
    const receive = (e: MessageEvent) => {
      if (e.source !== frame.contentWindow) return;
      if (e.data?.type === 'bes-animation-frame') finish(true);
      if (e.data?.type === 'bes-animation-failed') finish(false);
    };
    const timer = setTimeout(() => finish(false), 2500);
    window.addEventListener('message', receive);
    frame.onload = () => {
      frame.contentWindow?.postMessage(
        { type: 'bes-animation-init', source: program.source },
        '*',
      );
      frame.contentWindow?.postMessage(
        {
          type: 'bes-animation-tick',
          request: 1,
          input: {
            time: 0,
            scene: 'opening',
            phase: 0,
            width: 390,
            height: 844,
            intensity: 2,
          },
        },
        '*',
      );
    };
    frame.srcdoc = ANIMATION_HOST_HTML;
    document.body.append(frame);
  });
}
