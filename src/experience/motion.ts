import { motionPlan } from '../engines/motion';
import { motionBudget } from '../registries/motion';
export function motionStyles(directionId: string, intensity: number): string {
  const plan = motionPlan(directionId, intensity);
  const animation = plan.intensity ? `bes-${plan.direction.entrance}` : 'none';
  return `
:root{--motion-duration:${plan.durationMs}ms;--motion-step:${plan.direction.staggerMs}ms;--motion-distance:${plan.distancePx}px}
h1,h2{font-family:${plan.direction.typography === 'clean' ? 'system-ui,sans-serif' : 'Georgia,serif'}}
.motion-block{animation-name:${animation};animation-duration:var(--motion-duration);animation-delay:min(calc(var(--sequence)*var(--motion-step)),${motionBudget.maxDelayMs}ms);animation-timing-function:ease-out;animation-iteration-count:1}
@keyframes bes-settle{from{transform:translateY(calc(var(--motion-distance)/3))}to{transform:none}}
@keyframes bes-lift{from{transform:translateY(var(--motion-distance))}to{transform:none}}
@keyframes bes-playful{from{transform:translateY(var(--motion-distance)) rotate(-1deg)}to{transform:none}}
.motion-control{display:flex;align-items:center;gap:8px;font:.8rem system-ui,sans-serif;justify-content:flex-end;padding:8px}
.sparkles{display:flex;justify-content:center;gap:10px;height:30px;overflow:hidden;pointer-events:none}
.sparkles i{display:block;width:7px;height:7px;background:var(--accent);border-radius:50%;animation:${plan.intensity ? 'bes-sparkle' : 'none'} 1200ms ease-out 1;animation-delay:calc(var(--particle)*35ms)}
@keyframes bes-sparkle{from{opacity:.6;transform:translateY(14px) rotate(0)}to{opacity:.8;transform:translateY(0) rotate(45deg)}}
body:has(#motion-off:checked) .motion-block,body:has(#motion-off:checked) .sparkles i{animation:none!important}
@media(max-width:640px){.sparkles i:nth-child(n+7){display:none}.motion-block{--motion-distance:min(${plan.distancePx}px,6px)}}
@media(prefers-reduced-motion:reduce){.motion-block,.sparkles i{animation:none!important;transform:none!important}.sparkles{display:none}.motion-control{display:none}}
`;
}
export function finaleDecoration(
  directionId: string,
  intensity: number,
): string {
  const plan = motionPlan(directionId, intensity);
  if (!plan.intensity || plan.direction.finale !== 'sparkles') return '';
  return `<div class="sparkles" aria-hidden="true">${Array.from({ length: plan.particles }, (_, index) => `<i style="--particle:${index}"></i>`).join('')}</div>`;
}
