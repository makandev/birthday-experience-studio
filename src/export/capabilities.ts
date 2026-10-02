import type { CreatorProject } from '../domain/project';
import { safeExternalUrl } from '../security/urls';
export interface CapabilityReport {
  externalDomains: string[];
  missingMedia: string[];
  unsupportedMedia: string[];
}
export function analyzeCapabilities(project: CreatorProject): CapabilityReport {
  const report: CapabilityReport = {
    externalDomains: [],
    missingMedia: [],
    unsupportedMedia: [],
  };
  for (const block of project.experience.blocks.filter((b) => b.enabled)) {
    if (!block.data.mediaId) continue;
    const media = project.media.find((item) => item.id === block.data.mediaId);
    if (!media || media.source.type === 'unavailable') {
      report.missingMedia.push(block.id);
      continue;
    }
    if (media.kind !== 'image') report.unsupportedMedia.push(block.id);
    if (media.source.type === 'external')
      report.externalDomains.push(safeExternalUrl(media.source.url).origin);
  }
  report.externalDomains = [...new Set(report.externalDomains)].sort();
  return report;
}
export function requireCapabilities(project: CreatorProject): CapabilityReport {
  const report = analyzeCapabilities(project);
  if (report.missingMedia.length)
    throw new Error(
      'Ein ausgewähltes Foto fehlt. Bitte ergänze es oder deaktiviere seinen Baustein.',
    );
  if (report.unsupportedMedia.length)
    throw new Error(
      'Dieser Medientyp wird noch nicht unterstützt. Bitte deaktiviere ihn.',
    );
  if (
    report.externalDomains.length &&
    project.exportConfig.profile === 'offline'
  )
    throw new Error(
      'Offline-Geschenke brauchen lokale Fotos. Entferne externe Quellen oder wähle bewusst das Online-Profil.',
    );
  if (
    report.externalDomains.length &&
    !project.exportConfig.externalMediaConsent
  )
    throw new Error(
      'Bitte bestätige zuerst die externen Fotoquellen. Beim Öffnen können diese Dienste die Empfängeradresse sehen.',
    );
  return report;
}
