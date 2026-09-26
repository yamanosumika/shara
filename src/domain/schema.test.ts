import { describe, expect, it } from 'vitest';
import { freshEstimateFlow } from '../fixtures/estimateFlow';
import { LIMITS, parseDocumentText, serializeDocument, sharaDocumentSchema } from './schema';

describe('SharaDocument schema', () => {
  it('fixtureを保存し再読込して意味と固定IDを保持する', () => {
    const source = freshEstimateFlow();
    const loaded = parseDocumentText(serializeDocument(source));
    expect(loaded).toEqual(source);
    expect(loaded.id).toBe('doc_estimate_flow_0001');
    expect(loaded.semantic.edges.find(edge => edge.relation === 'writes')).toMatchObject({ source: 'node_save_00000006', target: 'node_db_00000007' });
  });

  it.each([
    ['未知版', (doc: any) => { doc.schemaVersion = 3; }],
    ['重複ID', (doc: any) => { doc.semantic.nodes[1].id = doc.semantic.nodes[0].id; }],
    ['不正端点', (doc: any) => { doc.semantic.edges[0].target = 'node_missing_0000'; }],
    ['不正groupId', (doc: any) => { doc.semantic.nodes[0].groupId = 'group_missing_000'; }],
    ['非有限座標', (doc: any) => { doc.presentation.nodePositions.node_start_00000001.x = Number.NaN; }],
  ])('%sを構造エラーにする', (_, mutate) => {
    const document = freshEstimateFlow(); mutate(document);
    expect(sharaDocumentSchema.safeParse(document).success).toBe(false);
  });

  it('壊れたJSONと上限超過を拒否する', () => {
    expect(() => parseDocumentText('{')).toThrow('JSON');
    expect(() => parseDocumentText(' '.repeat(LIMITS.fileBytes + 1))).toThrow('ファイルサイズ');
  });

  it('入れ子の未知フィールドを黙って捨てない', () => {
    const document = freshEstimateFlow() as any;
    document.semantic.nodes[0].unknownMeaning = '失ってはいけない';
    expect(sharaDocumentSchema.safeParse(document).success).toBe(false);
  });

  it('v1文書を検証後にv2へ移行し既存edgeを右→左に保つ', () => {
    const legacy = freshEstimateFlow() as any;
    legacy.schemaVersion = 1;
    delete legacy.presentation.edgeEndpoints;
    const loaded = parseDocumentText(JSON.stringify(legacy));
    expect(loaded.schemaVersion).toBe(2);
    expect(loaded.presentation.edgeEndpoints.edge_start_create_001).toEqual({ sourceSide: 'right', targetSide: 'left' });
    expect(loaded.semantic).toEqual(legacy.semantic);
    expect(loaded.presentation.nodePositions).toEqual(legacy.presentation.nodePositions);
  });

  it('v2では全edgeの接続面を必須にし欠落と孤立を拒否する', () => {
    const missing = freshEstimateFlow();
    delete missing.presentation.edgeEndpoints.edge_start_create_001;
    expect(sharaDocumentSchema.safeParse(missing).success).toBe(false);
    const orphan = freshEstimateFlow();
    orphan.presentation.edgeEndpoints.edge_missing_000001 = { sourceSide: 'right', targetSide: 'left' };
    expect(sharaDocumentSchema.safeParse(orphan).success).toBe(false);
  });
});
