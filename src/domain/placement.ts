import type { SharaDocument } from './schema';

export const DEFAULT_NODE_SIZE = { width: 180, height: 72 } as const;
export const PLACEMENT_GAP = 48;
const GRID_STEP_Y = 120;
const GRID_STEP_X = 240;
const MAX_CANDIDATES = 160;

export interface PlacementAnchor { kind: 'node' | 'group'; id: string }
interface Point { x: number; y: number }
interface Rectangle extends Point { width: number; height: number }

function overlaps(a: Rectangle, b: Rectangle): boolean {
  const padding = 16;
  return a.x < b.x + b.width + padding && a.x + a.width + padding > b.x && a.y < b.y + b.height + padding && a.y + a.height + padding > b.y;
}

function anchorRectangle(document: SharaDocument, anchor: PlacementAnchor | null): Rectangle | null {
  if (!anchor) return null;
  if (anchor.kind === 'group') return document.presentation.groupGeometry[anchor.id] ?? null;
  if (!document.semantic.nodes.some(node => node.id === anchor.id)) return null;
  const position = document.presentation.nodePositions[anchor.id];
  return position ? { ...position, ...DEFAULT_NODE_SIZE } : null;
}

function candidates(origin: Point): Point[] {
  const result: Point[] = [];
  for (let column = 0; result.length < MAX_CANDIDATES && column < 10; column += 1) {
    const x = origin.x + column * GRID_STEP_X;
    result.push({ x, y: origin.y });
    for (let distance = 1; result.length < MAX_CANDIDATES && distance < 9; distance += 1) {
      result.push({ x, y: origin.y + distance * GRID_STEP_Y });
      result.push({ x, y: origin.y - distance * GRID_STEP_Y });
    }
  }
  return result;
}

export function findNodePlacement(document: SharaDocument, anchor: PlacementAnchor | null, fallback: Point): Point | null {
  const rectangle = anchorRectangle(document, anchor);
  const origin = rectangle ? { x: rectangle.x + rectangle.width + PLACEMENT_GAP, y: rectangle.y } : fallback;
  const occupied = document.semantic.nodes.map(node => ({
    ...(document.presentation.nodePositions[node.id] ?? { x: 0, y: 0 }),
    ...DEFAULT_NODE_SIZE,
  }));
  for (const point of candidates(origin)) {
    const candidate = { ...point, ...DEFAULT_NODE_SIZE };
    if (!occupied.some(rect => overlaps(candidate, rect))) return point;
  }
  return null;
}

export function isValidPlacementAnchor(document: SharaDocument, anchor: PlacementAnchor | null): boolean {
  if (!anchor) return false;
  return anchor.kind === 'node'
    ? document.semantic.nodes.some(node => node.id === anchor.id)
    : document.semantic.groups.some(group => group.id === anchor.id);
}
