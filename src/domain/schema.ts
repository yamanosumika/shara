import { z } from 'zod';

export const LIMITS = {
  fileBytes: 5 * 1024 * 1024,
  nodes: 500,
  edges: 1500,
  groups: 100,
  rules: 500,
  openQuestions: 500,
  shortText: 200,
  longText: 4000,
  listItems: 100,
} as const;

export const CURRENT_SCHEMA_VERSION = 2 as const;
export const nodeTypes = ['start', 'end', 'process', 'decision', 'data', 'database', 'api', 'external', 'user', 'system', 'note'] as const;
export const relations = ['next', 'yes', 'no', 'reads', 'writes', 'calls', 'returns', 'depends_on', 'triggers'] as const;
export const ruleStatuses = ['draft', 'confirmed', 'unresolved'] as const;
export const targetKinds = ['document', 'node', 'edge', 'group'] as const;
export const connectorSides = ['top', 'right', 'bottom', 'left'] as const;

const id = z.string().regex(/^[a-z]+_[A-Za-z0-9_-]{8,}$/).max(80);
const shortText = z.string().max(LIMITS.shortText);
const longText = z.string().max(LIMITS.longText);
const stringList = z.array(shortText).max(LIMITS.listItems);
const pointSchema = z.object({ x: z.number().finite(), y: z.number().finite() }).strict();
const groupGeometrySchema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
  width: z.number().positive().finite(),
  height: z.number().positive().finite(),
}).strict();

export const targetRefSchema = z.object({
  kind: z.enum(targetKinds),
  id: id.optional(),
  needsReview: z.boolean().optional(),
}).strict().superRefine((value, ctx) => {
  if (value.kind === 'document' && value.id) ctx.addIssue({ code: 'custom', message: '文書対象にIDは指定できません' });
  if (value.kind !== 'document' && !value.id && !value.needsReview) ctx.addIssue({ code: 'custom', message: '要素対象にはIDが必要です' });
});

export const sharaNodeSchema = z.object({
  id,
  type: z.enum(nodeTypes),
  label: shortText,
  description: longText,
  actor: shortText,
  inputs: stringList,
  outputs: stringList,
  status: shortText.optional(),
  groupId: id.optional(),
  condition: longText.optional(),
}).strict();

export const sharaEdgeSchema = z.object({
  id,
  source: id,
  target: id,
  relation: z.enum(relations),
  label: shortText,
  condition: longText.optional(),
}).strict();

export const sharaGroupSchema = z.object({ id, label: shortText, description: longText }).strict();
export const sharaRuleSchema = z.object({ id, text: longText, status: z.enum(ruleStatuses), target: targetRefSchema }).strict();
export const openQuestionSchema = z.object({ id, text: longText, target: targetRefSchema }).strict();
export const edgeEndpointSchema = z.object({ sourceSide: z.enum(connectorSides), targetSide: z.enum(connectorSides) }).strict();

const semanticSchema = z.object({
  title: shortText,
  purpose: longText,
  scope: stringList,
  outOfScope: stringList,
  nodes: z.array(sharaNodeSchema).max(LIMITS.nodes),
  edges: z.array(sharaEdgeSchema).max(LIMITS.edges),
  groups: z.array(sharaGroupSchema).max(LIMITS.groups),
  rules: z.array(sharaRuleSchema).max(LIMITS.rules),
  openQuestions: z.array(openQuestionSchema).max(LIMITS.openQuestions),
}).strict();

const presentationV1Schema = z.object({
  direction: z.enum(['LR', 'TB']),
  nodePositions: z.record(z.string(), pointSchema),
  groupGeometry: z.record(z.string(), groupGeometrySchema),
  viewport: z.object({ x: z.number().finite(), y: z.number().finite(), zoom: z.number().positive().finite().max(8) }).strict(),
}).strict();

const presentationV2Schema = presentationV1Schema.extend({
  edgeEndpoints: z.record(z.string(), edgeEndpointSchema),
}).strict();

const metadataSchema = z.object({ createdAt: z.iso.datetime(), updatedAt: z.iso.datetime() }).strict();

const documentV1BaseSchema = z.object({
  format: z.literal('shara'),
  schemaVersion: z.literal(1),
  id,
  semantic: semanticSchema,
  presentation: presentationV1Schema,
  metadata: metadataSchema,
}).strict();

const documentV2BaseSchema = z.object({
  format: z.literal('shara'),
  schemaVersion: z.literal(CURRENT_SCHEMA_VERSION),
  id,
  semantic: semanticSchema,
  presentation: presentationV2Schema,
  metadata: metadataSchema,
}).strict();

type InvariantDocument = z.infer<typeof documentV1BaseSchema> | z.infer<typeof documentV2BaseSchema>;

function validateInvariants(document: InvariantDocument, ctx: z.RefinementCtx): void {
  const ids = [document.id, ...document.semantic.nodes.map(item => item.id), ...document.semantic.edges.map(item => item.id), ...document.semantic.groups.map(item => item.id), ...document.semantic.rules.map(item => item.id), ...document.semantic.openQuestions.map(item => item.id)];
  const seen = new Set<string>();
  for (const value of ids) {
    if (seen.has(value)) ctx.addIssue({ code: 'custom', message: `IDが重複しています: ${value}` });
    seen.add(value);
  }
  const nodeIds = new Set(document.semantic.nodes.map(item => item.id));
  const groupIds = new Set(document.semantic.groups.map(item => item.id));
  const edgeIds = new Set(document.semantic.edges.map(item => item.id));
  for (const edge of document.semantic.edges) {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) ctx.addIssue({ code: 'custom', message: `接続端点が存在しません: ${edge.id}` });
  }
  for (const node of document.semantic.nodes) {
    if (node.groupId && !groupIds.has(node.groupId)) ctx.addIssue({ code: 'custom', message: `所属グループが存在しません: ${node.id}` });
  }
  const refs: Record<string, Set<string>> = { node: nodeIds, edge: edgeIds, group: groupIds };
  for (const item of [...document.semantic.rules, ...document.semantic.openQuestions]) {
    if (item.target.kind !== 'document' && item.target.id && !refs[item.target.kind]?.has(item.target.id) && !item.target.needsReview) {
      ctx.addIssue({ code: 'custom', message: `対象参照が存在しません: ${item.id}` });
    }
  }
  if (Object.keys(document.presentation.nodePositions).some(positionId => !nodeIds.has(positionId))) {
    ctx.addIssue({ code: 'custom', message: '未知ノードの座標があります' });
  }
  if ('edgeEndpoints' in document.presentation) {
    const endpointIds = Object.keys(document.presentation.edgeEndpoints);
    if (endpointIds.length !== edgeIds.size || endpointIds.some(edgeId => !edgeIds.has(edgeId))) {
      ctx.addIssue({ code: 'custom', message: '接続面は全edgeと一対一である必要があります' });
    }
  }
}

export const sharaDocumentV1Schema = documentV1BaseSchema.superRefine(validateInvariants);
export const sharaDocumentSchema = documentV2BaseSchema.superRefine(validateInvariants);

export type SharaDocument = z.infer<typeof sharaDocumentSchema>;
export type SharaDocumentV1 = z.infer<typeof sharaDocumentV1Schema>;
export type SharaNode = z.infer<typeof sharaNodeSchema>;
export type SharaEdge = z.infer<typeof sharaEdgeSchema>;
export type SharaGroup = z.infer<typeof sharaGroupSchema>;
export type SharaRule = z.infer<typeof sharaRuleSchema>;
export type OpenQuestion = z.infer<typeof openQuestionSchema>;
export type TargetRef = z.infer<typeof targetRefSchema>;
export type NodeType = (typeof nodeTypes)[number];
export type Relation = (typeof relations)[number];
export type RuleStatus = (typeof ruleStatuses)[number];
export type ConnectorSide = (typeof connectorSides)[number];
export type EdgeEndpoint = z.infer<typeof edgeEndpointSchema>;

export function migrateV1Document(document: SharaDocumentV1): SharaDocument {
  return sharaDocumentSchema.parse({
    ...document,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    presentation: {
      ...document.presentation,
      edgeEndpoints: Object.fromEntries(document.semantic.edges.map(edge => [edge.id, { sourceSide: 'right', targetSide: 'left' }])),
    },
  });
}

export function parseDocumentText(text: string): SharaDocument {
  const bytes = new TextEncoder().encode(text).byteLength;
  if (bytes > LIMITS.fileBytes) throw new Error(`ファイルサイズが上限${LIMITS.fileBytes}バイトを超えています`);
  let value: unknown;
  try { value = JSON.parse(text); } catch { throw new Error('JSONを読み取れません'); }
  const version = typeof value === 'object' && value !== null && 'schemaVersion' in value ? (value as { schemaVersion?: unknown }).schemaVersion : undefined;
  if (version === 1) {
    const result = sharaDocumentV1Schema.safeParse(value);
    if (!result.success) throw new Error(`SHARA文書の構造エラー: ${result.error.issues.map(issue => issue.message).join(' / ')}`);
    return migrateV1Document(result.data);
  }
  if (version !== CURRENT_SCHEMA_VERSION) throw new Error(`未知のschemaVersionです: ${String(version)}`);
  const result = sharaDocumentSchema.safeParse(value);
  if (!result.success) throw new Error(`SHARA文書の構造エラー: ${result.error.issues.map(issue => issue.message).join(' / ')}`);
  return result.data;
}

export function serializeDocument(document: SharaDocument): string {
  return `${JSON.stringify(sharaDocumentSchema.parse(document), null, 2)}\n`;
}
