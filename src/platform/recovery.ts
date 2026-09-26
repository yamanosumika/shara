import { parseDocumentText, serializeDocument, type SharaDocument } from '../domain/schema';

const KEY = 'shara:recovery:v2';
const LEGACY_KEY = 'shara:recovery:v1';
const MAX_RECOVERIES = 10;

export interface RecoverySnapshot { documentId: string; sessionId: string; generation: number; savedAt: string; document: SharaDocument }

function parseSnapshot(value: unknown): RecoverySnapshot | null {
  try {
    const candidate = value as Partial<RecoverySnapshot>;
    if (typeof candidate.sessionId !== 'string' || typeof candidate.generation !== 'number' || typeof candidate.savedAt !== 'string' || !candidate.document) return null;
    const document = parseDocumentText(JSON.stringify(candidate.document));
    return { documentId: document.id, sessionId: candidate.sessionId, generation: candidate.generation, savedAt: candidate.savedAt, document };
  } catch { return null; }
}

export function listRecoveries(): RecoverySnapshot[] {
  const snapshots: RecoverySnapshot[] = [];
  try {
    const raw = localStorage.getItem(KEY);
    const values = raw ? JSON.parse(raw) : [];
    if (Array.isArray(values)) for (const value of values) { const parsed = parseSnapshot(value); if (parsed) snapshots.push(parsed); }
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) { const parsed = parseSnapshot(JSON.parse(legacy)); if (parsed && !snapshots.some(item => item.sessionId === parsed.sessionId)) snapshots.push(parsed); }
  } catch { return []; }
  return snapshots.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export function saveRecovery(document: SharaDocument, sessionId: string, generation: number): void {
  const snapshot: RecoverySnapshot = { documentId: document.id, sessionId, generation, savedAt: new Date().toISOString(), document: parseDocumentText(serializeDocument(document)) };
  const next = [snapshot, ...listRecoveries().filter(item => item.sessionId !== sessionId)].slice(0, MAX_RECOVERIES);
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function loadRecovery(): RecoverySnapshot | null {
  return listRecoveries()[0] ?? null;
}

export function clearRecovery(sessionId?: string): void {
  if (!sessionId) {
    localStorage.removeItem(KEY);
    localStorage.removeItem(LEGACY_KEY);
    return;
  }
  const next = listRecoveries().filter(item => item.sessionId !== sessionId);
  localStorage.setItem(KEY, JSON.stringify(next));
  localStorage.removeItem(LEGACY_KEY);
}
