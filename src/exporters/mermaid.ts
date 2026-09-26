import { NODE_TYPE_LABELS, RELATION_LABELS } from '../domain/relations';
import type { NodeType, SharaDocument } from '../domain/schema';

const shapes: Record<NodeType, [string, string]> = {
  start: ['([', '])'],
  end: ['([', '])'],
  process: ['[', ']'],
  decision: ['{', '}'],
  data: ['[/', '/]'],
  database: ['[(', ')]'],
  api: ['[[', ']]'],
  external: ['[[', ']]'],
  user: ['([', '])'],
  system: ['[[', ']]'],
  note: ['[/', '/]'],
};

function shapeFor(type: NodeType): [string, string] {
  return shapes[type] ?? ['[', ']'];
}

export function escapeMermaidLabel(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/%/g, '&#37;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\|/g, '&#124;').replace(/`/g, '&#96;').replace(/[{}]/g, char => `&#${char.charCodeAt(0)};`).replace(/[\r\n]+/g, ' ');
}

export function exportMermaid(document: SharaDocument): string {
  const lines = [`flowchart ${document.presentation.direction}`];
  const grouped = new Set<string>();
  const renderNode = (node: SharaDocument['semantic']['nodes'][number], indent = '  ') => {
    const [open, close] = shapeFor(node.type);
    lines.push(`${indent}${node.id}${open}"${escapeMermaidLabel(node.label || NODE_TYPE_LABELS[node.type])}"${close}`);
  };
  for (const group of [...document.semantic.groups].sort((a, b) => a.id.localeCompare(b.id))) {
    lines.push(`  subgraph ${group.id}["${escapeMermaidLabel(group.label)}"]`);
    for (const node of document.semantic.nodes.filter(node => node.groupId === group.id).sort((a, b) => a.id.localeCompare(b.id))) { grouped.add(node.id); renderNode(node, '    '); }
    lines.push('  end');
  }
  for (const node of [...document.semantic.nodes].sort((a, b) => a.id.localeCompare(b.id))) if (!grouped.has(node.id)) renderNode(node);
  for (const edge of [...document.semantic.edges].sort((a, b) => a.id.localeCompare(b.id))) {
    const label = [RELATION_LABELS[edge.relation], edge.label, edge.condition].filter(Boolean).join(' / ');
    lines.push(`  ${edge.source} -->|"${escapeMermaidLabel(label)}"| ${edge.target}`);
  }
  lines.push('  classDef start fill:#e3f4e8,stroke:#2f7650,color:#183d2b');
  lines.push('  classDef decision fill:#fff1c9,stroke:#9c6a00,color:#4b3400');
  lines.push('  classDef database fill:#e7eefb,stroke:#496a9d,color:#1e3150');
  for (const node of document.semantic.nodes) if (['start', 'decision', 'database'].includes(node.type)) lines.push(`  class ${node.id} ${node.type}`);
  return `${lines.join('\n')}\n`;
}
