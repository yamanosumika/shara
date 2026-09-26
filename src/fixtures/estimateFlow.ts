import type { SharaDocument } from '../domain/schema';

const createdAt = '2026-09-22T00:00:00.000Z';

export const estimateFlow: SharaDocument = {
  format: 'shara', schemaVersion: 2, id: 'doc_estimate_flow_0001',
  semantic: {
    title: '見積作成フロー',
    purpose: '見積の初回保存と更新時のコード扱いを明示するサンプル',
    scope: ['見積作成', '見積保存', '4文字コードの発行'],
    outOfScope: ['実システムへの反映', '顧客データの利用'],
    groups: [
      { id: 'group_estimate_editor_0001', label: '見積編集', description: '利用者が見積を作成する範囲' },
      { id: 'group_estimate_storage_0001', label: '保存処理', description: 'コード決定からDB保存まで' },
    ],
    nodes: [
      { id: 'node_start_00000001', type: 'start', label: '開始', description: '', actor: '', inputs: [], outputs: [], groupId: 'group_estimate_editor_0001' },
      { id: 'node_create_00000002', type: 'process', label: '見積作成', description: '見積内容を入力する', actor: '見積担当者', inputs: ['見積条件'], outputs: ['見積内容'], groupId: 'group_estimate_editor_0001' },
      { id: 'node_decide_00000003', type: 'decision', label: '初回保存か？', description: '同一系列で初めて保存するか判定する', actor: 'SHARAサンプル', inputs: ['見積内容'], outputs: ['判定結果'], condition: '新規系列で保存済みコードが存在しない', groupId: 'group_estimate_storage_0001' },
      { id: 'node_issue_00000004', type: 'process', label: '4文字コード発行', description: '新規系列にだけコードを発行する', actor: '保存処理', inputs: ['判定結果'], outputs: ['4文字コード'], groupId: 'group_estimate_storage_0001' },
      { id: 'node_keep_00000005', type: 'process', label: '既存コード維持', description: '編集・新版作成では既存コードを保持する', actor: '保存処理', inputs: ['既存コード'], outputs: ['4文字コード'], groupId: 'group_estimate_storage_0001' },
      { id: 'node_save_00000006', type: 'process', label: '見積保存', description: '見積内容を保存する', actor: '保存処理', inputs: ['見積内容', '4文字コード'], outputs: ['保存済み見積'], groupId: 'group_estimate_storage_0001' },
      { id: 'node_db_00000007', type: 'database', label: '見積DB', description: '見積の保存先を表すサンプルDB', actor: '', inputs: ['保存済み見積'], outputs: [] },
    ],
    edges: [
      { id: 'edge_start_create_001', source: 'node_start_00000001', target: 'node_create_00000002', relation: 'next', label: '' },
      { id: 'edge_create_decide_01', source: 'node_create_00000002', target: 'node_decide_00000003', relation: 'next', label: '' },
      { id: 'edge_decide_issue_01', source: 'node_decide_00000003', target: 'node_issue_00000004', relation: 'yes', label: '', condition: '初回保存である' },
      { id: 'edge_decide_keep_001', source: 'node_decide_00000003', target: 'node_keep_00000005', relation: 'no', label: '', condition: '初回保存ではない' },
      { id: 'edge_issue_save_0001', source: 'node_issue_00000004', target: 'node_save_00000006', relation: 'next', label: '' },
      { id: 'edge_keep_save_00001', source: 'node_keep_00000005', target: 'node_save_00000006', relation: 'next', label: '' },
      { id: 'edge_save_db_000001', source: 'node_save_00000006', target: 'node_db_00000007', relation: 'writes', label: '保存' },
    ],
    rules: [
      { id: 'rule_issue_once_0001', text: '新規系列の初回保存時だけコードを発行する', status: 'confirmed', target: { kind: 'node', id: 'node_decide_00000003' } },
      { id: 'rule_keep_code_00001', text: '同一系列の編集・新版作成ではコードを維持する', status: 'confirmed', target: { kind: 'node', id: 'node_keep_00000005' } },
      { id: 'rule_version_sep_0001', text: '版番号はコードと別に扱う', status: 'draft', target: { kind: 'document' } },
    ],
    openQuestions: [
      { id: 'question_code_collision_01', text: '4文字コードが重複した場合の再採番方法を決める', target: { kind: 'node', id: 'node_issue_00000004' } },
    ],
  },
  presentation: {
    direction: 'LR',
    nodePositions: {
      node_start_00000001: { x: 80, y: 160 }, node_create_00000002: { x: 280, y: 160 }, node_decide_00000003: { x: 500, y: 160 }, node_issue_00000004: { x: 740, y: 70 }, node_keep_00000005: { x: 740, y: 270 }, node_save_00000006: { x: 980, y: 160 }, node_db_00000007: { x: 1210, y: 160 },
    },
    groupGeometry: { group_estimate_editor_0001: { x: 40, y: 40, width: 420, height: 300 }, group_estimate_storage_0001: { x: 470, y: 30, width: 720, height: 340 } },
    edgeEndpoints: {
      edge_start_create_001: { sourceSide: 'right', targetSide: 'left' },
      edge_create_decide_01: { sourceSide: 'right', targetSide: 'left' },
      edge_decide_issue_01: { sourceSide: 'right', targetSide: 'left' },
      edge_decide_keep_001: { sourceSide: 'right', targetSide: 'left' },
      edge_issue_save_0001: { sourceSide: 'right', targetSide: 'left' },
      edge_keep_save_00001: { sourceSide: 'right', targetSide: 'left' },
      edge_save_db_000001: { sourceSide: 'right', targetSide: 'left' },
    },
    viewport: { x: 0, y: 0, zoom: 0.8 },
  },
  metadata: { createdAt, updatedAt: createdAt },
};

export function freshEstimateFlow(): SharaDocument {
  return structuredClone(estimateFlow);
}
