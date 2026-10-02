# Data Model

All persisted projects require `schemaVersion`. Stable IDs must not depend on display labels.

Conceptual root:

```ts
interface CreatorProject {
  schemaVersion: number;
  id: string;
  createdAt: string;
  updatedAt: string;
  mode: "quick" | "deep";
  recipient: Recipient;
  relationship: RelationshipProfile;
  answers: AnswerStore;
  memories: MemoryItem[];
  writing: WritingWorkspace;
  media: MediaLibrary;
  experience: ExperienceDraft;
  exportConfig: ExportConfig;
}
```

Separate concepts: Recipient, RelationshipProfile, AnswerStore, MemoryItem, WritingWorkspace, MediaLibrary, ExperienceDraft, ExperienceBlockInstance, ThemeSelection and ExportConfig.

## Recipient-safe projection
Define a separate `ExportExperience`. Never implement export as `JSON.stringify(project)` or equivalent. Only explicitly recipient-visible fields may cross the export boundary.

## Evolution
Persisted schema versions require migrations. Unknown extension IDs should degrade gracefully where possible rather than corrupting a project.
