import { create } from 'zustand';
import { freshEstimateFlow } from '../fixtures/estimateFlow';
import { meaningFingerprint } from '../exporters';
import { isValidPlacementAnchor, type PlacementAnchor } from '../domain/placement';
import type { SharaDocument, TargetRef } from '../domain/schema';
import type { FileReference } from '../platform/files';

type Selection = TargetRef | null;
interface Snapshot { document: SharaDocument; fingerprint: string }

interface EditorState {
  document: SharaDocument;
  past: Snapshot[];
  future: Snapshot[];
  savedFingerprint: string;
  savedDocument?: SharaDocument;
  generation: number;
  sessionId: string;
  selection: Selection;
  selectedNodeIds: string[];
  placementAnchor: PlacementAnchor | null;
  file?: FileReference;
  message?: { tone: 'info' | 'error'; text: string };
  apply: (next: SharaDocument, selection?: Selection) => void;
  replace: (next: SharaDocument, file?: EditorState['file']) => void;
  undo: () => void;
  redo: () => void;
  select: (selection: Selection) => void;
  selectNodes: (ids: string[], updateAnchor?: boolean) => void;
  markInteracted: (anchor: PlacementAnchor) => void;
  markSaved: (file: FileReference, documentAtStart: SharaDocument) => void;
  setMessage: (message?: EditorState['message']) => void;
}

function documentFingerprint(document: SharaDocument): string {
  return JSON.stringify(document);
}

const initial = freshEstimateFlow();

export const useEditorStore = create<EditorState>((set) => ({
  document: initial,
  past: [], future: [], savedFingerprint: '', savedDocument: undefined, generation: 0, sessionId: crypto.randomUUID(), selection: null, selectedNodeIds: [], placementAnchor: null,
  apply: (next, selection) => set(state => ({ document: next, past: [...state.past.slice(-99), { document: state.document, fingerprint: documentFingerprint(state.document) }], future: [], generation: state.generation + 1, selection: selection === undefined ? state.selection : selection, placementAnchor: isValidPlacementAnchor(next, state.placementAnchor) ? state.placementAnchor : null })),
  replace: (next, file) => set({ document: next, past: [], future: [], savedFingerprint: documentFingerprint(next), savedDocument: next, generation: 0, sessionId: crypto.randomUUID(), selection: null, selectedNodeIds: [], placementAnchor: null, file }),
  undo: () => set(state => {
    const previous = state.past.at(-1); if (!previous) return state;
    return { document: previous.document, past: state.past.slice(0, -1), future: [{ document: state.document, fingerprint: documentFingerprint(state.document) }, ...state.future], generation: state.generation + 1, placementAnchor: isValidPlacementAnchor(previous.document, state.placementAnchor) ? state.placementAnchor : null };
  }),
  redo: () => set(state => {
    const next = state.future[0]; if (!next) return state;
    return { document: next.document, past: [...state.past, { document: state.document, fingerprint: documentFingerprint(state.document) }], future: state.future.slice(1), generation: state.generation + 1, placementAnchor: isValidPlacementAnchor(next.document, state.placementAnchor) ? state.placementAnchor : null };
  }),
  select: selection => set(state => {
    const same = state.selection?.kind === selection?.kind && state.selection?.id === selection?.id;
    return same ? state : { selection };
  }),
  selectNodes: (selectedNodeIds, updateAnchor = true) => set(state => {
    const sameIds = state.selectedNodeIds.length === selectedNodeIds.length && state.selectedNodeIds.every((id, index) => id === selectedNodeIds[index]);
    const nextSelection = selectedNodeIds.length === 1 ? { kind: 'node' as const, id: selectedNodeIds[0] } : null;
    const sameSelection = state.selection?.kind === nextSelection?.kind && state.selection?.id === nextSelection?.id;
    const placementAnchor = updateAnchor && selectedNodeIds.length === 1
      ? state.placementAnchor?.kind === 'node' && state.placementAnchor.id === selectedNodeIds[0] ? state.placementAnchor : { kind: 'node' as const, id: selectedNodeIds[0] }
      : state.placementAnchor;
    return sameIds && sameSelection && placementAnchor === state.placementAnchor ? state : { selectedNodeIds, selection: nextSelection, placementAnchor };
  }),
  markInteracted: placementAnchor => set(state => (
    state.placementAnchor?.kind === placementAnchor.kind && state.placementAnchor.id === placementAnchor.id
      ? state
      : { placementAnchor }
  )),
  markSaved: (file, documentAtStart) => set({ file, savedFingerprint: documentFingerprint(documentAtStart), savedDocument: documentAtStart }),
  setMessage: message => set({ message }),
}));

export function isDirty(state: Pick<EditorState, 'document' | 'savedFingerprint'>): boolean { return documentFingerprint(state.document) !== state.savedFingerprint; }
export function currentMeaningFingerprint(): string { return meaningFingerprint(useEditorStore.getState().document); }
