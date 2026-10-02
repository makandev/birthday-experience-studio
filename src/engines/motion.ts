import type { CreatorProject } from '../domain/project';
import { directions, motionBudget } from '../registries/motion';
export function motionPlan(directionId: string, intensity: number) {
  const direction = directions.get(directionId) ?? directions.get('emotional')!;
  const level = Math.max(0, Math.min(3, Math.round(intensity)));
  return {
    direction,
    intensity: level,
    durationMs: level
      ? Math.min(direction.durationMs, motionBudget.maxDurationMs)
      : 0,
    distancePx: Math.min(level * 4, motionBudget.maxTranslationPx),
    particles: level
      ? Math.min(
          Math.ceil((direction.particles * level) / 3),
          motionBudget.maxDesktopParticles,
        )
      : 0,
  };
}
export function recommendDirection(project: CreatorProject): string {
  const dimensions = project.relationship.dimensions;
  if (dimensions.formality >= 4 || dimensions.context === 'professional')
    return 'elegant';
  if (dimensions.humor >= 4 && dimensions.tone === 'playful') return 'funny';
  return 'emotional';
}
