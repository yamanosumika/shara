import type { SharaDocument } from '../domain/schema';

export function normalizedMeaning(document: SharaDocument) {
  const byId = <T extends { id: string }>(items: T[]) => [...items].sort((a, b) => a.id.localeCompare(b.id));
  return {
    format: document.format,
    schemaVersion: document.schemaVersion,
    id: document.id,
    semantic: {
      title: document.semantic.title,
      purpose: document.semantic.purpose,
      scope: document.semantic.scope,
      outOfScope: document.semantic.outOfScope,
      nodes: byId(document.semantic.nodes),
      edges: byId(document.semantic.edges),
      groups: byId(document.semantic.groups),
      rules: byId(document.semantic.rules),
      openQuestions: byId(document.semantic.openQuestions),
    },
  };
}

export function meaningFingerprint(document: SharaDocument): string {
  return JSON.stringify(normalizedMeaning(document));
}
