import { nodeTypes, type NodeType } from '../domain/schema';
import { NODE_TYPE_LABELS } from '../domain/relations';

const frequent: NodeType[] = ['start', 'end', 'process', 'decision', 'data', 'database'];
const other = nodeTypes.filter(type => !frequent.includes(type));

export function Palette({ onAdd }: { onAdd: (type: NodeType) => void }) {
  const render = (type: NodeType) => (
    <button key={type} className={`palette-item palette-item--${type}`} draggable onDragStart={event => event.dataTransfer.setData('application/shara-node-type', type)} onClick={() => onAdd(type)}>
      <span className="palette-item__icon" aria-hidden="true" />
      {NODE_TYPE_LABELS[type]}
    </button>
  );
  return <aside className="palette" aria-label="部品一覧"><h2>部品</h2><p>クリックまたはドラッグで追加</p>{frequent.map(render)}<details><summary>その他の部品</summary>{other.map(render)}</details></aside>;
}
