import { Handle, NodeResizeControl, Position, type NodeProps } from '@xyflow/react';
import type { CSSProperties } from 'react';
import { NODE_TYPE_LABELS } from '../domain/relations';
import type { NodeType } from '../domain/schema';

export interface SharaNodeData extends Record<string, unknown> { label: string; type: NodeType; condition?: string; warningCount: number }

const SIDES = [
  { key: 'top', position: Position.Top },
  { key: 'right', position: Position.Right },
  { key: 'bottom', position: Position.Bottom },
  { key: 'left', position: Position.Left },
] as const;

function handleStyle(side: string, direction: 'source' | 'target'): CSSProperties {
  const offset = direction === 'source' ? 7 : -7;
  return side === 'top' || side === 'bottom' ? { left: `calc(50% + ${offset}px)` } : { top: `calc(50% + ${offset}px)` };
}

export function SharaNode({ data, selected }: NodeProps) {
  const value = data as SharaNodeData;
  return (
    <div className={`shara-node shara-node--${value.type} ${selected ? 'is-selected' : ''}`}>
      {SIDES.map(side => <Handle key={`target-${side.key}`} id={`target-${side.key}`} type="target" position={side.position} style={handleStyle(side.key, 'target')} className="connector connector--target" aria-label={`${side.key}辺へ入力`} />)}
      <span className="shara-node__type">{NODE_TYPE_LABELS[value.type]}</span>
      <strong>{value.label || '名称未設定'}</strong>
      {value.type === 'decision' && <small>{value.condition || '条件未設定'}</small>}
      {value.warningCount > 0 && <span className="shara-node__warning" aria-label={`${value.warningCount}件の警告`}>{value.warningCount}</span>}
      {SIDES.map(side => <Handle key={`source-${side.key}`} id={`source-${side.key}`} type="source" position={side.position} style={handleStyle(side.key, 'source')} className="connector connector--source" aria-label={`${side.key}辺から出力`} />)}
    </div>
  );
}

interface GroupNodeData extends Record<string, unknown> {
  label: string;
  minWidth: number;
  minHeight: number;
  onResizeEnd?: (width: number, height: number) => void;
}

export function GroupNode({ data, selected }: NodeProps) {
  const value = data as GroupNodeData;
  return <div className={`group-node ${selected ? 'is-selected' : ''}`}>
    {selected && <NodeResizeControl minWidth={value.minWidth} minHeight={value.minHeight} position="bottom-right" onResizeEnd={(_, params) => value.onResizeEnd?.(params.width, params.height)} />}
    <strong>{value.label}</strong><span>グループ</span>
  </div>;
}
