export type IntegrationTransport =
  'manual' | 'browser-public' | 'local-service' | 'trusted-backend';
export interface IntegrationDefinition {
  id: string;
  label: string;
  transport: IntegrationTransport;
  credentials: 'none' | 'volatile-user-token' | 'isolated-backend';
  officialDocsReviewedAt: string | null;
}
export const integrations: IntegrationDefinition[] = [
  {
    id: 'openrouter-free',
    label: 'OpenRouter – ausschließlich kostenlos',
    transport: 'browser-public',
    credentials: 'volatile-user-token',
    officialDocsReviewedAt: '2026-10-03',
  },
  {
    id: 'ollama-local',
    label: 'Ollama – lokal',
    transport: 'local-service',
    credentials: 'none',
    officialDocsReviewedAt: '2026-10-03',
  },
  {
    id: 'manual-director',
    label: 'KI deiner Wahl – manuell',
    transport: 'manual',
    credentials: 'none',
    officialDocsReviewedAt: null,
  },
];
