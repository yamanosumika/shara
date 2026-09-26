import type { NodeType, Relation, RuleStatus } from './schema';

export const RELATION_LABELS: Record<Relation, string> = {
  next: '次へ', yes: 'はい', no: 'いいえ', reads: '読み取る', writes: '書き込む', calls: '呼び出す', returns: '結果を返す', depends_on: '依存する', triggers: '起動する',
};

export const RELATION_MEANINGS: Record<Relation, string> = {
  next: 'Aの次にBへ進む', yes: 'Aの判定が真のときBへ進む', no: 'Aの判定が偽のときBへ進む', reads: 'AがBを読み取る', writes: 'AがBへ書き込む', calls: 'AがBを呼び出す', returns: 'AがBへ結果を返す', depends_on: 'AがBに依存する', triggers: 'AがBを起動する',
};

export const NODE_TYPE_LABELS: Record<NodeType, string> = {
  start: '開始', end: '終了', process: '処理', decision: '条件分岐', data: 'データ', database: 'DB', api: 'API', external: '外部サービス', user: '利用者', system: 'システム', note: '注記',
};

export const RULE_STATUS_LABELS: Record<RuleStatus, string> = { draft: '案', confirmed: '確定', unresolved: '未決' };
