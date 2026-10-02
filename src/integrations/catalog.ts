// Concrete API providers are intentionally absent until their current official docs,
// pricing and browser/backend credential boundaries have been reviewed.
export type IntegrationTransport =
  'manual' | 'browser-public' | 'trusted-backend';
export interface IntegrationDefinition {
  id: string;
  label: string;
  transport: IntegrationTransport;
  credentials: 'none' | 'isolated-backend';
  officialDocsReviewedAt: string | null;
}
export const integrations: IntegrationDefinition[] = [
  {
    id: 'manual-director',
    label: 'KI deiner Wahl – manuell',
    transport: 'manual',
    credentials: 'none',
    officialDocsReviewedAt: null,
  },
];
