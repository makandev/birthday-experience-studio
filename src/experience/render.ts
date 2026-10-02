import type { ExportExperience } from '../export/projection';
import { blocks } from '../registries/blocks';
import { themes } from '../registries/themes';
import { directions } from '../registries/motion';
import { motionStyles, finaleDecoration } from './motion';
export function renderExperience(experience: ExportExperience): string {
  const imageStyle =
    directions.get(experience.directionId)?.imageStyle ?? 'soft';
  const theme = themes.get(experience.themeId) ?? themes.get('warm')!;
  const body = experience.blocks
    .map((block, index) => {
      const definition = blocks.get(block.type);
      if (!definition || definition.version !== block.version)
        throw new Error('Unsupported experience block');
      return `<div class="motion-block" style="--sequence:${index}">${definition.render(block.data)}</div>`;
    })
    .join('\n');
  return `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data: ${experience.externalDomains.join(' ')}; base-uri 'none'; form-action 'none'">
<title>Ein Geburtstagsgeschenk für dich</title><style>
:root{color-scheme:light;--bg:${theme.background};--ink:${theme.foreground};--accent:${theme.accent};--card:${theme.card}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:${theme.font};line-height:1.8}main{max-width:760px;margin:0 auto;padding:48px 24px 80px}.intro{text-align:center;padding:40px 0 50px}h1{font-size:clamp(2.1rem,7vw,3.7rem);line-height:1.2;font-weight:500}h1 span{color:var(--accent)}h2{font-size:1.6rem;font-weight:500;line-height:1.4}.eyebrow{font:600 .75rem system-ui,sans-serif;text-transform:uppercase;letter-spacing:.15em;color:var(--accent)}.card{background:var(--card);border:1px solid color-mix(in srgb,var(--accent) 20%,transparent);border-radius:20px;padding:30px;margin:24px 0;overflow-wrap:anywhere}.wish{text-align:center}summary{cursor:pointer;font-size:1.25rem;padding:8px}summary:focus-visible{outline:3px solid var(--accent);outline-offset:6px}.revealed{padding:12px 8px}footer{text-align:center;font: .85rem system-ui,sans-serif;padding-top:30px;color:var(--accent)}@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}@media(max-width:480px){main{padding:24px 16px}.card{padding:22px}}
figure{margin:0}.photo-image{display:block;width:100%;max-height:650px;aspect-ratio:4/3;background:var(--bg);border-radius:12px}.photo-description{font:.8rem/1.5 system-ui,sans-serif;color:var(--ink);margin-top:12px}.photo-card figcaption{font:1.1rem/1.7 Georgia,serif}.photo-card{overflow:hidden}body[data-image-style="polaroid"] .photo-card{padding:18px 18px 30px;transform:rotate(-1deg);border-radius:4px}body[data-image-style="wide"] .photo-image{aspect-ratio:16/9}body[data-image-style="soft"] .photo-image{border-radius:18px}
${motionStyles(experience.directionId, experience.intensity)}
</style></head><body data-image-style="${imageStyle}"><main>${experience.intensity ? '<label class="motion-control"><input id="motion-off" type="checkbox">Bewegung ausschalten</label>' : ''}${body}${finaleDecoration(experience.directionId, experience.intensity)}<footer>Mit Liebe für dich gemacht ✧</footer></main></body></html>`;
}
