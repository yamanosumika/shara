import { beforeEach, describe, expect, it } from 'vitest';
import { freshEstimateFlow } from '../fixtures/estimateFlow';
import { clearRecovery, listRecoveries, saveRecovery } from './recovery';

describe('recovery snapshots', () => {
  beforeEach(() => localStorage.clear());

  it('session別に一覧化し指定候補だけ破棄する', () => {
    const first = freshEstimateFlow();
    const second = freshEstimateFlow();
    second.semantic.title = '別の復旧候補';
    saveRecovery(first, 'session-a', 1);
    saveRecovery(second, 'session-b', 2);
    expect(listRecoveries().map(item => item.sessionId).sort()).toEqual(['session-a', 'session-b']);
    clearRecovery('session-a');
    expect(listRecoveries().map(item => item.sessionId)).toEqual(['session-b']);
  });

  it('v1復旧文書をv2へ移行する', () => {
    const legacy = freshEstimateFlow() as any;
    legacy.schemaVersion = 1;
    delete legacy.presentation.edgeEndpoints;
    localStorage.setItem('shara:recovery:v1', JSON.stringify({ documentId: legacy.id, sessionId: 'legacy-session', generation: 3, savedAt: '2026-09-22T00:00:00.000Z', document: legacy }));
    const [loaded] = listRecoveries();
    expect(loaded.document.schemaVersion).toBe(2);
    expect(loaded.document.presentation.edgeEndpoints.edge_start_create_001).toEqual({ sourceSide: 'right', targetSide: 'left' });
  });
});
