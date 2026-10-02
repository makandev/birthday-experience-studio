import type { CreatorProject, ExperienceBlock } from '../domain/project';
export function recommendBlocks(project: CreatorProject): ExperienceBlock[] {
  return [
    {
      id: 'intro-1',
      type: 'intro',
      version: 1,
      enabled: true,
      data: { name: project.recipient.name },
    },
    {
      id: 'letter-1',
      type: 'letter',
      version: 1,
      enabled: true,
      data: { text: project.writing.letter },
    },
    {
      id: 'wish-1',
      type: 'wish',
      version: 1,
      enabled: Boolean(project.writing.wish.trim()),
      data: { text: project.writing.wish },
    },
    {
      id: 'reveal-1',
      type: 'reveal',
      version: 1,
      enabled: Boolean(project.writing.surprise.trim()),
      data: { text: project.writing.surprise },
    },
  ];
}
export function syncComposition(project: CreatorProject): void {
  const suggested = recommendBlocks(project);
  // Keep creator choices and ordering; update only the authored content of known instances.
  const existing = project.experience.blocks;
  if (!existing.length) {
    project.experience.blocks = suggested;
    return;
  }
  project.experience.blocks = existing.map((block) => {
    const updated = suggested.find(
      (item) => item.id === block.id && item.type === block.type,
    );
    return updated ? { ...block, data: updated.data } : block;
  });
  for (const block of suggested)
    if (!existing.some((item) => item.id === block.id))
      project.experience.blocks.push(block);
}
